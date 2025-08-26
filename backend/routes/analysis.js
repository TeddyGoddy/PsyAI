const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const geminiService = require('../services/geminiService');
const EnhancedGeminiService = require('../services/enhancedGeminiService');
const PatientHistoryService = require('../services/patientHistoryService');
const UserSettingsService = require('../services/userSettingsService');
const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');

// Debug logging helper controlled by env DEBUG_AI=true
const DEBUG_AI = String(process.env.DEBUG_AI || '').toLowerCase() === 'true';
const logAI = (...args) => { if (DEBUG_AI) console.log('[AI][analysis]', ...args); };

// geminiService is already an instantiated singleton exported by the service

// Configure multer for legacy text uploads (disk)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain'];
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Tipo file non supportato'), false);
  }
});

// Configure multer memory storage for multimodal uploads
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = new Set([
      // text/doc
      'text/plain', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // images
      'image/jpeg', 'image/png', 'image/webp',
      // audio
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/webm'
    ]);
    if (allowed.has(file.mimetype)) return cb(null, true);
    return cb(new Error('Tipo file non supportato'), false);
  }
});

// Document analysis endpoint with real AI processing
router.post('/document', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    const startTime = Date.now();
    
    // Read file content
    let fileContent = '';
    try {
      if (req.file.mimetype === 'text/plain') {
        fileContent = await fs.readFile(req.file.path, 'utf8');
      } else if (req.file.mimetype === 'application/pdf') {
        // For now, return error for PDF - would need PDF parser
        return res.status(400).json({
          success: false,
          message: 'PDF parsing non ancora implementato. Usa file di testo.'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo file non supportato per l\'analisi testuale'
        });
      }
    } catch (fileError) {
      console.error('Errore lettura file:', fileError);
      return res.status(500).json({
        success: false,
        message: 'Errore nella lettura del file'
      });
    }

    if (!fileContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Il file è vuoto o non contiene testo leggibile'
      });
    }

    // Perform AI analysis using Gemini
    let analysisResult;
    try {
      analysisResult = await GeminiService.analyzeDocument(
        fileContent, 
        'comprehensive', 
        req.user.user_type
      );
      // Save analysis to database and create patient report
      const analysisRecord = await Analysis.create({
        user_id: req.user.id,
        type: 'document',
        title: `Analisi: ${req.file.originalname}`,
        content: fileContent,
        ai_analysis: analysisResult,
        confidence_score: analysisResult.confidence || 0.85,
        processing_time: Date.now() - startTime,
        tags: analysisResult.themes?.map(t => t.name) || []
      });

      // Link analysis to existing patient if patient_id provided
      if (req.body.patient_id) {
        analysisRecord.patient_id = req.body.patient_id;
        await analysisRecord.save();
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Errore pulizia file:', cleanupError);
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    res.json({
      success: true,
      message: 'Analisi documento completata con AI',
      analysis: {
        filename: req.file.originalname,
        uploadDate: new Date(),
        fileSize: req.file.size,
        processingTime: `${processingTime}s`,
        userId: req.user.id,
        userType: req.user.user_type,
        ...analysisResult
      }
    });

  } catch (error) {
    console.error('Errore generale analisi documento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'analisi del documento'
    });
  }
});

// Multimodal upload endpoint (PDF, images, audio)
router.post('/upload', authenticateToken, uploadMemory.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nessun file caricato' });
    }

    const startTime = Date.now();
    const { buffer, originalname, mimetype, size } = req.file;

    const useEnhanced = req.body.enhanced === 'true';
    const patientId = req.body.patient_id;
    const language = req.body.language || 'english';
    
    console.log('📋 Analyzing file with language:', language);
    console.log('🔬 Enhanced mode:', useEnhanced);
    console.log('👤 Patient ID:', patientId);
    
    let analysis;
    
    if (useEnhanced) {
      const enhancedService = new EnhancedGeminiService();
      analysis = await enhancedService.analyzeWithContext(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        language,
        patientId,
        req.user.id
      );
    } else {
      const geminiService = new GeminiService();
      analysis = await geminiService.analyzeFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        language
      );
    }

    // Persist analysis
    const analysisRecord = await Analysis.create({
      user_id: req.user.id,
      type: 'file',
      title: `Analisi: ${originalname}`,
      content: `Uploaded file (${mimetype}) analyzed by AI`,
      ai_analysis: analysis,
      confidence_score: analysis.confidence || 0.8,
      processing_time: Date.now() - startTime,
      tags: analysis.themes?.map(t => t.name) || []
    });

    if (req.body.patient_id) {
      analysisRecord.patient_id = req.body.patient_id;
      await analysisRecord.save();
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    return res.json({
      success: true,
      message: 'Analisi file completata con AI',
      analysis: {
        filename: originalname,
        uploadDate: new Date(),
        fileSize: size,
        processingTime: `${processingTime}s`,
        userId: req.user.id,
        userType: req.user.user_type,
        ...analysis
      }
    });
  } catch (error) {
    console.error('Errore analisi upload:', error);
    return res.status(500).json({ success: false, message: 'Errore durante l\'analisi del file' });
  }
});

// Text analysis endpoint
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { text, analysisType = 'comprehensive' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Testo da analizzare richiesto'
      });
    }

    const startTime = Date.now();
    logAI('POST /text invoked by user', req.user?.id, '| type =', req.user?.user_type);
    logAI('Text length =', text?.length || 0, '| preview =', (text || '').substring(0, 120));

    // Perform AI analysis using Gemini
    let analysisResult;
    try {
      const language = req.body.language || 'italiano';
      logAI('Language =', language, '| analysisType =', analysisType);
      // analyzeText signature: (text, language = 'english', patientContext = null)
      const ctx = {
        userType: req.user?.user_type || req.user?.userType || 'psychologist',
        analysisType
      };
      // If a patient_id is provided, include the patient's psychological_profile in context
      if (req.body.patient_id) {
        try {
          const patient = await Patient.findByPk(req.body.patient_id);
          if (patient?.psychological_profile) {
            ctx.profile = String(patient.psychological_profile);
            logAI('Including patient psychological_profile in AI context. Length =', ctx.profile.length);
          }
        } catch (e) {
          logAI('Could not load patient for profile context:', e?.message || e);
        }
      }
      logAI('Calling geminiService.analyzeText with ctx =', ctx);
      analysisResult = await geminiService.analyzeText(text, language, ctx);
      logAI('AI result received. Keys =', analysisResult ? Object.keys(analysisResult) : 'null');
      if (analysisResult?.executiveSummary) {
        logAI('ExecSummary preview =', String(analysisResult.executiveSummary).substring(0, 160));
      }
      
      // Save analysis to database and create patient report
      const Analysis = require('../models/Analysis');
      const Patient = require('../models/Patient');
      
      if (analysisResult && req.user) {
        const analysis = await Analysis.create({
          user_id: req.user.id,
          type: 'text',
          title: `Analisi Testo: ${new Date().toLocaleDateString('it-IT')}`,
          content: text,
          ai_analysis: analysisResult,
          confidence_score: analysisResult.confidence || 0.75,
          processing_time: Date.now() - startTime,
          tags: analysisResult.themes?.map(t => t.name) || []
        });

        // Link analysis to existing patient if patient_id provided
        if (req.body.patient_id) {
          analysis.patient_id = req.body.patient_id;
          await analysis.save();
        }
      }
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError);
      logAI('AI error message =', aiError?.message);
      if (aiError?.response?.data) {
        logAI('AI HTTP error data =', JSON.stringify(aiError.response.data, null, 2));
      }
      if (aiError?.stack) {
        logAI('AI error stack (top) =', aiError.stack.split('\n').slice(0, 3).join(' | '));
      }
      const status = aiError?.status || aiError?.response?.status || 502;
      const payload = {
        success: false,
        code: status === 429 ? 'AI_RATE_LIMIT' : 'AI_ERROR',
        message: status === 429
          ? 'Limite richieste AI superato. Riprova tra poco.'
          : 'Errore nel servizio AI: risposta non valida o non disponibile',
        details: aiError.message
      };
      return res.status(status).json(payload);
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logAI('Processing time (s) =', processingTime);

    res.json({
      success: true,
      message: 'Analisi testo completata',
      analysis: {
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        processingTime: `${processingTime}s`,
        userId: req.user.id,
        userType: req.user.user_type,
        ...analysisResult
      }
    });

  } catch (error) {
    console.error('Errore analisi testo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'analisi del testo'
    });
  }
});

// Generate What-if scenarios
router.post('/what-if', authenticateToken, async (req, res) => {
  try {
    const { baseScenario, context } = req.body;
    if (!baseScenario || !baseScenario.trim()) {
      return res.status(400).json({ success: false, message: 'baseScenario richiesto' });
    }

    const result = await geminiService.generateWhatIfScenarios({
      baseScenario,
      context: context || 'No additional context',
      userType: req.user.user_type,
      sessionType: 'analysis'
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('What-if generation error:', error);
    res.status(500).json({ success: false, message: 'Errore generazione what-if' });
  }
});

// Get patient history and profile
router.get('/patient/:patientId/history', authenticateToken, async (req, res) => {
  try {
    const historyService = new PatientHistoryService();
    const profile = await historyService.getPatientProfile(req.params.patientId);
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching patient history' 
    });
  }
});

// Get specific analysis by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const Analysis = require('../models/Analysis');
    const analysis = await Analysis.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

module.exports = router;
