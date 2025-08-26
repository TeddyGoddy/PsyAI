const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Save analysis to archive
router.post('/save', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      patient_id,
      analysis_type,
      input_text,
      input_metadata,
      analysis_result,
      visualization_data,
      profile_insights,
      session_notes,
      tags
    } = req.body;

    const result = await client.query(
      `INSERT INTO analysis_archives 
       (patient_id, psychologist_id, analysis_type, input_text, input_metadata, 
        analysis_result, visualization_data, profile_insights, session_notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        patient_id,
        req.userId,
        analysis_type || 'text',
        input_text,
        input_metadata || {},
        analysis_result,
        visualization_data,
        profile_insights,
        session_notes,
        tags || []
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Analisi salvata nell\'archivio'
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel salvataggio dell\'analisi'
    });
  } finally {
    client.release();
  }
});

// Get archived analyses for a patient
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { patientId } = req.params;
    const { limit = 20, offset = 0, type } = req.query;

    let query = `
      SELECT 
        aa.*,
        u.name as psychologist_name
      FROM analysis_archives aa
      JOIN users u ON aa.psychologist_id = u.id
      WHERE aa.patient_id = $1
    `;
    
    const params = [patientId];
    
    if (type) {
      query += ` AND aa.analysis_type = $2`;
      params.push(type);
    }
    
    query += ` ORDER BY aa.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching archives:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'archivio'
    });
  } finally {
    client.release();
  }
});

// Update patient profile with analysis insights
router.post('/update-profile', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      patient_id,
      analysis_archive_id,
      profile_insights,
      change_type = 'ai_analysis'
    } = req.body;

    // Get current profile
    const currentProfileResult = await client.query(
      'SELECT psychological_profile FROM patients WHERE id = $1',
      [patient_id]
    );
    
    if (currentProfileResult.rows.length === 0) {
      throw new Error('Paziente non trovato');
    }

    const currentProfile = currentProfileResult.rows[0].psychological_profile || '';
    
    // Generate updated profile with AI (merge insights with existing profile)
    const aiResponse = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sei uno psicologo clinico esperto. Devi aggiornare un profilo psicologico esistente con nuovi insight dall'ultima analisi.

PROFILO ATTUALE:
${currentProfile || 'Nessun profilo esistente'}

NUOVI INSIGHT DALL'ANALISI:
${profile_insights}

ISTRUZIONI:
1. Integra i nuovi insight nel profilo esistente in modo coerente
2. Mantieni la struttura e il tono professionale
3. Evidenzia eventuali cambiamenti significativi o progressi
4. Se ci sono contraddizioni, privilegia le informazioni più recenti
5. Aggiungi una nota temporale quando menzioni cambiamenti (es: "Nell'ultima sessione...")
6. Mantieni tutti i dettagli esistenti rilevanti, aggiornandoli se necessario

Genera il profilo psicologico aggiornato completo in italiano.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!aiResponse.ok) {
      throw new Error('Errore nella generazione del profilo aggiornato');
    }

    const aiData = await aiResponse.json();
    const updatedProfile = aiData.candidates[0].content.parts[0].text;

    // Calculate changes summary
    const changesResponse = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Confronta questi due profili psicologici e riassumi i principali cambiamenti in 2-3 frasi.

PROFILO PRECEDENTE:
${currentProfile || 'Nessun profilo precedente'}

PROFILO AGGIORNATO:
${updatedProfile}

Riassumi solo i cambiamenti principali in modo conciso.`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 256
        }
      })
    });

    let changeSummary = 'Profilo aggiornato con nuovi insight';
    if (changesResponse.ok) {
      const changesData = await changesResponse.json();
      changeSummary = changesData.candidates[0].content.parts[0].text;
    }

    // Save profile history
    await client.query(
      `INSERT INTO profile_history 
       (patient_id, psychologist_id, analysis_archive_id, previous_profile, 
        updated_profile, change_summary, change_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        patient_id,
        req.userId,
        analysis_archive_id,
        currentProfile,
        updatedProfile,
        changeSummary,
        change_type
      ]
    );

    // Update patient profile
    await client.query(
      `UPDATE patients 
       SET psychological_profile = $1, updated_at = NOW() 
       WHERE id = $2`,
      [updatedProfile, patient_id]
    );

    // Mark analysis as having updated the profile
    if (analysis_archive_id) {
      await client.query(
        `UPDATE analysis_archives 
         SET profile_updated = true, 
             profile_changes = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [{ summary: changeSummary }, analysis_archive_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        updated_profile: updatedProfile,
        change_summary: changeSummary,
        previous_profile: currentProfile
      },
      message: 'Profilo aggiornato con successo'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del profilo'
    });
  } finally {
    client.release();
  }
});

// Get profile history for a patient
router.get('/profile-history/:patientId', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { patientId } = req.params;
    
    const result = await client.query(
      `SELECT 
        ph.*,
        u.name as psychologist_name,
        aa.analysis_type
      FROM profile_history ph
      JOIN users u ON ph.psychologist_id = u.id
      LEFT JOIN analysis_archives aa ON ph.analysis_archive_id = aa.id
      WHERE ph.patient_id = $1
      ORDER BY ph.created_at DESC
      LIMIT 50`,
      [patientId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching profile history:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della cronologia'
    });
  } finally {
    client.release();
  }
});

module.exports = router;
