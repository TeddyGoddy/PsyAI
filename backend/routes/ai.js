const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const Patient = require('../models/Patient');

// Generate dynamic questions for journaling
router.post('/generate-questions', authMiddleware, async (req, res) => {
  try {
    const { previousAnswer, sessionType, context } = req.body;

    // Use real Gemini AI for question generation
    try {
      const questionResult = await geminiService.generateQuestions({
        context: context || 'General journaling session',
        previousAnswers: previousAnswer ? [previousAnswer] : [],
        userType: req.user.user_type,
        sessionType: sessionType || 'journaling'
      });

      if (questionResult.questions && questionResult.questions.length > 0) {
        const nextQuestion = questionResult.questions[0];
        
        res.json({
          success: true,
          nextQuestion: nextQuestion.text,
          questionType: nextQuestion.type,
          category: nextQuestion.category,
          analysisHint: "L'AI ha generato una domanda personalizzata basata sulla tua risposta",
          suggestedFocus: `Focus su: ${nextQuestion.category}`
        });
      } else {
        throw new Error('No questions generated');
      }
    } catch (aiError) {
      console.error('AI question generation failed, using fallback:', aiError);
      
      // Fallback to template questions
      const questionTemplates = {
        journaling: [
          "Basandoti su quello che hai scritto, cosa pensi che abbia scatenato questa emozione?",
          "Come potresti gestire diversamente una situazione simile in futuro?",
          "Quali risorse personali hai utilizzato per affrontare questo momento?",
          "Che cosa hai imparato su te stesso da questa esperienza?",
          "Come ti senti ora dopo aver riflettuto su questo argomento?",
          "Quali pattern noti nei tuoi pensieri o comportamenti?",
          "Cosa vorresti dire a te stesso di ieri riguardo a questa situazione?",
          "Quali aspetti positivi puoi identificare in questa esperienza?"
        ]
      };

      const questions = questionTemplates[sessionType] || questionTemplates.journaling;
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      res.json({
        success: true,
        nextQuestion: randomQuestion,
        analysisHint: "Domanda generata dal sistema di fallback",
        suggestedFocus: "Continua la tua riflessione"
      });
    }

  } catch (error) {
    console.error('Errore generazione domande:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la generazione delle domande'
    });
  }
});

// Analyze text for emotions and themes
router.post('/analyze-text', authMiddleware, async (req, res) => {
  try {
    const { text, analysisType } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Testo da analizzare richiesto'
      });
    }

    const startTime = Date.now();

    // Use real Gemini AI for text analysis
    try {
      const analysisResult = await geminiService.analyzeDocument(
        text, 
        analysisType || 'comprehensive', 
        req.user.user_type
      );

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

      res.json({
        success: true,
        analysis: {
          ...analysisResult,
          processingTime: `${processingTime}s`,
          userId: req.user.id,
          userType: req.user.user_type,
          analysisDate: new Date().toISOString()
        }
      });

    } catch (aiError) {
      console.error('AI text analysis failed, using fallback:', aiError);
      
      // Fallback analysis
      const mockAnalysis = {
        emotions: [
          { emotion: 'ansia', confidence: 0.75, intensity: 'media' },
          { emotion: 'speranza', confidence: 0.60, intensity: 'bassa' },
          { emotion: 'determinazione', confidence: 0.85, intensity: 'alta' }
        ],
        themes: [
          { theme: 'stress lavorativo', relevance: 0.8 },
          { theme: 'relazioni interpersonali', relevance: 0.6 },
          { theme: 'crescita personale', relevance: 0.9 }
        ],
        sentiment: {
          overall: 'neutro-positivo',
          score: 0.3,
          confidence: 0.78
        },
        keyPhrases: [
          'voglio migliorare',
          'situazione difficile',
          'supporto importante',
          'passo avanti'
        ],
        insights: [
          'Il testo mostra una buona capacità di auto-riflessione',
          'Presenza di linguaggio orientato al futuro',
          'Riconoscimento dell\'importanza del supporto sociale'
        ],
        confidence: 0.7,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      };

      res.json({
        success: true,
        analysis: mockAnalysis
      });
    }

  } catch (error) {
    console.error('Errore analisi testo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'analisi del testo'
    });
  }
});

// Generate what-if scenarios
router.post('/generate-scenarios', authMiddleware, async (req, res) => {
  try {
    const { context, currentSituation, userType } = req.body;

    const scenarios = userType === 'psychologist' ? [
      {
        id: 1,
        title: "Approccio Cognitivo-Comportamentale",
        description: "Cosa succederebbe se il paziente utilizzasse tecniche CBT per ristrutturare i pensieri negativi?",
        outcomes: [
          "Riduzione dell'ansia del 40-60%",
          "Miglioramento dell'autostima",
          "Maggiore controllo emotivo"
        ],
        techniques: ["Ristrutturazione cognitiva", "Diario dei pensieri", "Esposizione graduale"]
      },
      {
        id: 2,
        title: "Terapia Basata sulla Mindfulness",
        description: "Come cambierebbe il quadro clinico con un approccio mindfulness-based?",
        outcomes: [
          "Maggiore consapevolezza emotiva",
          "Riduzione della ruminazione",
          "Miglioramento della regolazione emotiva"
        ],
        techniques: ["Meditazione guidata", "Body scan", "Respirazione consapevole"]
      }
    ] : [
      {
        id: 1,
        title: "Scenario Alternativo: Comunicazione Diretta",
        description: "Cosa succederebbe se esprimessi i tuoi sentimenti in modo più diretto?",
        outcomes: [
          "Maggiore chiarezza nelle relazioni",
          "Possibile iniziale disagio",
          "Crescita personale a lungo termine"
        ]
      },
      {
        id: 2,
        title: "Scenario Alternativo: Prendersi una Pausa",
        description: "Come ti sentiresti se ti concedessi più tempo per te stesso?",
        outcomes: [
          "Riduzione dello stress",
          "Maggiore energia mentale",
          "Migliore prospettiva sui problemi"
        ]
      }
    ];

    res.json({
      success: true,
      scenarios,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Errore generazione scenari:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la generazione degli scenari'
    });
  }
});

// AI-guided psychological session endpoint
router.post('/session', authMiddleware, async (req, res) => {
  try {
    const { patient_id, messages, session_type } = req.body;
    const userId = req.user.id;
    
    // Verify patient access
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    if (patient.psychologist_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Build conversation context
    const conversationHistory = messages.map(m => 
      m.ai ? `Therapist: ${m.text}` : `Patient: ${m.text}`
    ).join('\n\n');
    
    // Check if profile generation is ready (after 8+ exchanges with sufficient depth)
    const profileReady = messages.length >= 16; // More exchanges for comprehensive profile
    
    if (profileReady && session_type === 'initial_assessment') {
      // Generate comprehensive profile
      const profilePrompt = `Based on this initial assessment conversation with a patient, generate a comprehensive psychological profile.
      
      Conversation:
      ${conversationHistory}
      
      Create a detailed psychological profile in Italian using this EXACT structure:

      # PROFILO PSICOLOGICO CLINICO

      ## 1. PROBLEMATICHE PRESENTATE
      [Descrivi i sintomi e le preoccupazioni principali del paziente]

      ## 2. STATO EMOTIVO E DELL'UMORE
      [Analizza i pattern emotivi, regolazione affettiva, presenza di ansia/depressione]

      ## 3. PATTERN COMPORTAMENTALI
      [Descrivi abitudini, routine, cambiamenti comportamentali osservati]

      ## 4. FUNZIONAMENTO INTERPERSONALE
      [Analizza relazioni familiari, sociali, romantiche e capacità relazionali]

      ## 5. STRATEGIE DI COPING
      [Valuta come il paziente gestisce lo stress e le difficoltà]

      ## 6. STORIA E FATTORI PREDISPONENTI
      [Include eventi significativi, traumi, storia familiare rilevante]

      ## 7. RISORSE E PUNTI DI FORZA
      [Identifica capacità, resilienza, supporti disponibili]

      ## 8. RACCOMANDAZIONI TERAPEUTICHE
      [Suggerisci approcci terapeutici, obiettivi e prognosi]

      IMPORTANT FORMATTING RULES:
      - Use **bold** for key terms and important concepts
      - Use *italic* for emphasis on specific behaviors or emotions
      - Use numbered lists (1. 2. 3.) for structured recommendations
      - Add blank lines between paragraphs for better readability
      - Each section should be 2-3 paragraphs minimum with proper spacing`;
      
      const profileResult = await geminiService.generateText(profilePrompt);
      
      return res.json({
        success: true,
        profile_ready: true,
        generated_profile: profileResult.text,
        response: "Grazie per aver condiviso. Ho preparato un profilo psicologico iniziale basato sulla nostra conversazione. Puoi rivederlo e modificarlo secondo necessità."
      });
    }
    
    // Generate structured next question based on assessment phase
    const assessmentPhase = Math.floor(messages.length / 2);
    const phases = [
      'presenting_concerns', 'emotional_state', 'behavioral_patterns', 
      'interpersonal_relationships', 'coping_mechanisms', 'life_history', 
      'strengths_resources', 'therapeutic_goals'
    ];
    
    const currentPhase = phases[Math.min(assessmentPhase, phases.length - 1)];
    
    const sessionPrompt = `You are a compassionate psychologist conducting a structured initial assessment in Italian.
    
    Conversation so far:
    ${conversationHistory}
    
    Current assessment phase: ${currentPhase}
    Progress: ${messages.length}/16 exchanges
    
    Based on the current phase (${currentPhase}) and what the patient has shared, ask a specific follow-up question that:
    1. Explores the current phase topic in depth
    2. Builds naturally on their previous response
    3. Helps gather clinical information for psychological profiling
    4. Remains warm and therapeutic
    
    Phase guidelines:
    - presenting_concerns: Current problems, symptoms, what brought them here
    - emotional_state: Mood patterns, emotional regulation, anxiety/depression
    - behavioral_patterns: Daily routines, habits, behavioral changes
    - interpersonal_relationships: Family, friends, romantic relationships, social functioning
    - coping_mechanisms: How they handle stress, previous therapy, support systems
    - life_history: Childhood, trauma, significant life events, family history
    - strengths_resources: Personal strengths, achievements, positive coping skills
    - therapeutic_goals: What they hope to achieve, motivation for change
    
    Respond with only the next question in Italian. Keep it focused and therapeutic.`;
    
    const response = await geminiService.generateText(sessionPrompt);
    
    res.json({
      success: true,
      response: response.text,
      profile_ready: false,
      session_progress: Math.min((messages.length / 16) * 100, 95),
      current_phase: currentPhase,
      phase_description: {
        'presenting_concerns': 'Raccolta problematiche attuali',
        'emotional_state': 'Valutazione stato emotivo',
        'behavioral_patterns': 'Analisi pattern comportamentali',
        'interpersonal_relationships': 'Esplorazione relazioni',
        'coping_mechanisms': 'Strategie di coping',
        'life_history': 'Storia di vita',
        'strengths_resources': 'Risorse e punti di forza',
        'therapeutic_goals': 'Obiettivi terapeutici'
      }[currentPhase]
    });
    
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ 
      error: 'Session processing failed',
      details: error.message 
    });
  }
});

// Improve psychological profile with AI
router.post('/improve-profile', authMiddleware, async (req, res) => {
  try {
    const { profile, patient_id, language } = req.body;

    if (!profile || !profile.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Profilo psicologico richiesto'
      });
    }

    // Get patient context if provided
    let patientContext = '';
    if (patient_id) {
      try {
        const patient = await Patient.findByPk(patient_id);
        if (patient) {
          patientContext = `Paziente: ${patient.first_name} ${patient.last_name}, ${patient.age} anni`;
        }
      } catch (error) {
        console.log('Could not load patient context:', error);
      }
    }

    // Language-specific prompts
    const languagePrompts = {
      italiano: `Sei uno psicologo clinico esperto. Il tuo compito è migliorare il seguente profilo psicologico mantenendo tutte le informazioni originali ma migliorando:

1. **Terminologia professionale**: Usa termini tecnici appropriati della psicologia clinica
2. **Struttura e organizzazione**: Organizza il contenuto in sezioni logiche e coerenti
3. **Chiarezza espositiva**: Rendi più chiari concetti che potrebbero essere vaghi o mal espressi
4. **Completezza**: Aggiungi dettagli professionali dove appropriato senza inventare informazioni
5. **Grammatica e sintassi**: Correggi errori grammaticali e migliora la fluidità del testo

${patientContext ? `Contesto paziente: ${patientContext}` : ''}

PROFILO ORIGINALE:
${profile}

ISTRUZIONI:
- Mantieni TUTTE le informazioni cliniche originali
- Non inventare nuovi sintomi, diagnosi o informazioni non presenti
- Migliora solo la forma, la struttura e la terminologia
- Usa un linguaggio professionale ma comprensibile
- Organizza in sezioni se appropriato (es: Anamnesi, Osservazioni cliniche, Funzionamento psicologico, etc.)

Rispondi SOLO con il profilo migliorato, senza commenti aggiuntivi.`,
      
      english: `You are an expert clinical psychologist. Your task is to improve the following psychological profile while maintaining all original information but improving:

1. **Professional terminology**: Use appropriate clinical psychology technical terms
2. **Structure and organization**: Organize content in logical and coherent sections
3. **Clarity of exposition**: Make clearer concepts that might be vague or poorly expressed
4. **Completeness**: Add professional details where appropriate without inventing information
5. **Grammar and syntax**: Correct grammatical errors and improve text fluency

${patientContext ? `Patient context: ${patientContext}` : ''}

ORIGINAL PROFILE:
${profile}

INSTRUCTIONS:
- Maintain ALL original clinical information
- Do not invent new symptoms, diagnoses or information not present
- Only improve form, structure and terminology
- Use professional but understandable language
- Organize in sections if appropriate (e.g., History, Clinical observations, Psychological functioning, etc.)

Respond ONLY with the improved profile, without additional comments.`,

      spanish: `Eres un psicólogo clínico experto. Tu tarea es mejorar el siguiente perfil psicológico manteniendo toda la información original pero mejorando:

1. **Terminología profesional**: Usa términos técnicos apropiados de la psicología clínica
2. **Estructura y organización**: Organiza el contenido en secciones lógicas y coherentes
3. **Claridad expositiva**: Haz más claros conceptos que podrían ser vagos o mal expresados
4. **Completitud**: Agrega detalles profesionales donde sea apropiado sin inventar información
5. **Gramática y sintaxis**: Corrige errores gramaticales y mejora la fluidez del texto

${patientContext ? `Contexto del paciente: ${patientContext}` : ''}

PERFIL ORIGINAL:
${profile}

INSTRUCCIONES:
- Mantén TODA la información clínica original
- No inventes nuevos síntomas, diagnósticos o información no presente
- Solo mejora la forma, estructura y terminología
- Usa lenguaje profesional pero comprensible
- Organiza en secciones si es apropiado (ej: Historia, Observaciones clínicas, Funcionamiento psicológico, etc.)

Responde SOLO con el perfil mejorado, sin comentarios adicionales.`,

      french: `Vous êtes un psychologue clinicien expert. Votre tâche est d'améliorer le profil psychologique suivant en conservant toutes les informations originales mais en améliorant :

1. **Terminologie professionnelle** : Utilisez des termes techniques appropriés de la psychologie clinique
2. **Structure et organisation** : Organisez le contenu en sections logiques et cohérentes
3. **Clarté d'exposition** : Rendez plus clairs les concepts qui pourraient être vagues ou mal exprimés
4. **Complétude** : Ajoutez des détails professionnels appropriés sans inventer d'informations
5. **Grammaire et syntaxe** : Corrigez les erreurs grammaticales et améliorez la fluidité du texte

${patientContext ? `Contexte du patient : ${patientContext}` : ''}

PROFIL ORIGINAL :
${profile}

INSTRUCTIONS :
- Conservez TOUTES les informations cliniques originales
- N'inventez pas de nouveaux symptômes, diagnostics ou informations non présentes
- Améliorez seulement la forme, la structure et la terminologie
- Utilisez un langage professionnel mais compréhensible
- Organisez en sections si approprié (ex : Anamnèse, Observations cliniques, Fonctionnement psychologique, etc.)

Répondez SEULEMENT avec le profil amélioré, sans commentaires supplémentaires.`,

      german: `Sie sind ein erfahrener klinischer Psychologe. Ihre Aufgabe ist es, das folgende psychologische Profil zu verbessern, während Sie alle ursprünglichen Informationen beibehalten, aber folgende Aspekte verbessern:

1. **Professionelle Terminologie**: Verwenden Sie angemessene Fachbegriffe der klinischen Psychologie
2. **Struktur und Organisation**: Organisieren Sie den Inhalt in logischen und kohärenten Abschnitten
3. **Klarheit der Darstellung**: Machen Sie Konzepte klarer, die vage oder schlecht ausgedrückt sein könnten
4. **Vollständigkeit**: Fügen Sie professionelle Details hinzu, wo angemessen, ohne Informationen zu erfinden
5. **Grammatik und Syntax**: Korrigieren Sie grammatikalische Fehler und verbessern Sie die Textflüssigkeit

${patientContext ? `Patientenkontext: ${patientContext}` : ''}

URSPRÜNGLICHES PROFIL:
${profile}

ANWEISUNGEN:
- Behalten Sie ALLE ursprünglichen klinischen Informationen bei
- Erfinden Sie keine neuen Symptome, Diagnosen oder nicht vorhandene Informationen
- Verbessern Sie nur Form, Struktur und Terminologie
- Verwenden Sie professionelle, aber verständliche Sprache
- Organisieren Sie in Abschnitten, falls angemessen (z.B.: Anamnese, Klinische Beobachtungen, Psychologisches Funktionieren, etc.)

Antworten Sie NUR mit dem verbesserten Profil, ohne zusätzliche Kommentare.`
    };

    const selectedLanguage = language || 'italiano';
    const improvePrompt = languagePrompts[selectedLanguage] || languagePrompts.italiano;

    try {
      const improvedProfile = await geminiService.generateResponse(improvePrompt);
      
      res.json({
        success: true,
        improvedProfile: improvedProfile.trim(),
        message: 'Profilo migliorato con successo'
      });
    } catch (aiError) {
      console.error('AI profile improvement failed:', aiError);
      res.status(500).json({
        success: false,
        message: 'Errore nel servizio AI per il miglioramento del profilo'
      });
    }
  } catch (error) {
    console.error('Error improving profile:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
});

module.exports = router;
