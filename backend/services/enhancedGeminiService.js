const axios = require('axios');
const FormData = require('form-data');
const PatientHistoryService = require('./patientHistoryService');

class EnhancedGeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.5-pro';
    this.analysisCache = new Map(); // Cache for avoiding repetitive analyses
  }

  // Set model dynamically from user settings
  setModel(model) {
    this.model = model;
  }

  /**
   * Generate comprehensive psychological analysis with patient context
   * @param {Buffer} fileBuffer - File content
   * @param {string} mimeType - File MIME type
   * @param {string} fileName - File name
   * @param {string} language - Response language
   * @param {string} patientId - Patient ID for context
   * @param {number} userId - User ID
   * @returns {Object} Deep psychological analysis
   */
  async analyzeWithContext(fileBuffer, mimeType, fileName, language = 'english', patientId = null, userId = null) {
    // Get patient context if available
    let patientContext = null;
    if (patientId && userId) {
      try {
        patientContext = await PatientHistoryService.getAnalysisContext(patientId, userId);
      } catch (error) {
        console.error('Error fetching patient context:', error);
      }
    }

    // Check cache to avoid repetitive analyses
    const cacheKey = this.generateCacheKey(fileBuffer, patientId);
    if (this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return { ...cached.analysis, fromCache: true };
      }
    }

    const systemPrompt = this.buildEnhancedSystemPrompt(language, patientContext);
    const analysisSchema = this.getDeepAnalysisSchema(language);
    
    const base64 = fileBuffer.toString('base64');
    const response = await this.makeEnhancedRequest(base64, mimeType, fileName, systemPrompt, analysisSchema);
    
    // Cache the analysis
    this.analysisCache.set(cacheKey, {
      analysis: response,
      timestamp: Date.now()
    });

    return response;
  }

  /**
   * Build enhanced system prompt with patient context
   */
  buildEnhancedSystemPrompt(language, patientContext) {
    const contextSection = patientContext ? `
PATIENT PROFILE AND CLINICAL HISTORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${patientContext.demographics}
${patientContext.clinicalBackground}
${patientContext.currentMedications}
Therapy Goals: ${patientContext.therapyGoals}
Previous Psychological Themes: ${patientContext.recentThemes}
Emotional Pattern History: ${patientContext.emotionalProfile}
Established Coping Mechanisms: ${patientContext.copingStrategies}
Primary Clinical Concerns: ${patientContext.primaryConcerns}
Psychological Strengths: ${patientContext.strengths}
Analysis History: ${patientContext.previousAnalysesCount} previous analyses
Session History: ${patientContext.sessionCount} therapeutic sessions

CRITICAL INSTRUCTIONS FOR CONTEXT USE:
1. Reference specific patterns from patient history
2. Build upon previous findings - DO NOT repeat what's already known
3. Identify NEW developments or changes in psychological patterns
4. Compare current presentation with historical baseline
5. Note any contradictions or evolutions in psychological functioning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : '';

    const prompts = {
      'english': `You are a distinguished clinical psychologist with 25+ years of expertise across multiple therapeutic modalities including:
- Psychodynamic and psychoanalytic approaches (object relations, self psychology, attachment theory)
- Cognitive-behavioral therapy (CBT, DBT, ACT, schema therapy)
- Neuropsychological assessment and neurocognitive rehabilitation
- Systemic and family therapy approaches
- Trauma-informed care and EMDR
- Existential and humanistic psychology

${contextSection}

ANALYSIS DEPTH REQUIREMENTS:
You must provide an EXTRAORDINARILY DETAILED psychological analysis that demonstrates doctoral-level clinical expertise. Your analysis must include:

1. PSYCHODYNAMIC FORMULATION (500+ words):
   - Unconscious conflicts and their manifestations
   - Primary and secondary defense mechanisms (intellectualization, projection, splitting, etc.)
   - Object relations patterns and internal working models
   - Transference and countertransference implications
   - Early attachment disruptions and their current impact
   - Id-ego-superego dynamics

2. COGNITIVE-BEHAVIORAL ASSESSMENT (400+ words):
   - Specific cognitive distortions with examples
   - Maladaptive thought patterns and schemas
   - Behavioral reinforcement cycles
   - Avoidance patterns and safety behaviors
   - Core beliefs and intermediate beliefs
   - Automatic thoughts analysis

3. NEUROPSYCHOLOGICAL CONSIDERATIONS (300+ words):
   - Executive functioning assessment
   - Attention and concentration patterns
   - Memory systems involvement
   - Processing speed implications
   - Emotional regulation capacity
   - Potential neurodevelopmental factors

4. SYSTEMIC AND INTERPERSONAL ANALYSIS (400+ words):
   - Family system dynamics
   - Interpersonal patterns and recurring themes
   - Communication styles and deficits
   - Boundary issues (enmeshment, disengagement)
   - Role assignments and family myths
   - Intergenerational trauma patterns

5. DIAGNOSTIC IMPRESSIONS (300+ words):
   - Primary diagnostic considerations (DSM-5-TR criteria)
   - Differential diagnoses with reasoning
   - Comorbidity assessment
   - Severity specifiers and functional impact
   - Rule-outs and clinical reasoning

6. RISK AND PROTECTIVE FACTORS (200+ words):
   - Suicide and self-harm risk assessment
   - Violence risk factors
   - Substance use vulnerabilities
   - Protective factors and resilience markers
   - Environmental stressors and supports

7. TREATMENT RECOMMENDATIONS (400+ words):
   - Evidence-based intervention hierarchy
   - Specific therapeutic techniques indicated
   - Medication considerations (if applicable)
   - Treatment sequencing and phases
   - Potential barriers to treatment
   - Prognosis with and without treatment

Use precise clinical terminology throughout (e.g., mentalization deficits, epistemic trust, reflective functioning, metacognitive awareness, interoceptive accuracy, window of tolerance, structural dissociation).`,

      'italiano': `Sei un illustre psicologo clinico con oltre 25 anni di esperienza in molteplici modalità terapeutiche tra cui:
- Approcci psicodinamici e psicoanalitici (relazioni oggettuali, psicologia del Sé, teoria dell'attaccamento)
- Terapia cognitivo-comportamentale (CBT, DBT, ACT, terapia degli schemi)
- Valutazione neuropsicologica e riabilitazione neurocognitiva
- Approcci sistemici e terapia familiare
- Cura trauma-informata ed EMDR
- Psicologia esistenziale e umanistica

${contextSection}

REQUISITI DI PROFONDITÀ DELL'ANALISI:
Devi fornire un'analisi psicologica STRAORDINARIAMENTE DETTAGLIATA che dimostri competenza clinica a livello dottorale. La tua analisi deve includere:

1. FORMULAZIONE PSICODINAMICA (500+ parole):
   - Conflitti inconsci e loro manifestazioni
   - Meccanismi di difesa primari e secondari (intellettualizzazione, proiezione, scissione, ecc.)
   - Pattern di relazioni oggettuali e modelli operativi interni
   - Implicazioni di transfert e controtransfert
   - Disruzioni precoci dell'attaccamento e loro impatto attuale
   - Dinamiche Es-Io-Super-io

2. VALUTAZIONE COGNITIVO-COMPORTAMENTALE (400+ parole):
   - Distorsioni cognitive specifiche con esempi
   - Pattern di pensiero maladattivi e schemi
   - Cicli di rinforzo comportamentale
   - Pattern di evitamento e comportamenti di sicurezza
   - Credenze nucleari e credenze intermedie
   - Analisi dei pensieri automatici

3. CONSIDERAZIONI NEUROPSICOLOGICHE (300+ parole):
   - Valutazione del funzionamento esecutivo
   - Pattern di attenzione e concentrazione
   - Coinvolgimento dei sistemi di memoria
   - Implicazioni della velocità di elaborazione
   - Capacità di regolazione emotiva
   - Potenziali fattori neuroevolutivi

4. ANALISI SISTEMICA E INTERPERSONALE (400+ parole):
   - Dinamiche del sistema familiare
   - Pattern interpersonali e temi ricorrenti
   - Stili comunicativi e deficit
   - Problemi di confini (invischiamento, disimpegno)
   - Assegnazioni di ruolo e miti familiari
   - Pattern di trauma intergenerazionale

5. IMPRESSIONI DIAGNOSTICHE (300+ parole):
   - Considerazioni diagnostiche primarie (criteri DSM-5-TR)
   - Diagnosi differenziali con ragionamento
   - Valutazione della comorbidità
   - Specificatori di gravità e impatto funzionale
   - Esclusioni e ragionamento clinico

6. FATTORI DI RISCHIO E PROTETTIVI (200+ parole):
   - Valutazione del rischio suicidario e autolesivo
   - Fattori di rischio di violenza
   - Vulnerabilità all'uso di sostanze
   - Fattori protettivi e marcatori di resilienza
   - Stressor ambientali e supporti

7. RACCOMANDAZIONI TERAPEUTICHE (400+ parole):
   - Gerarchia di interventi evidence-based
   - Tecniche terapeutiche specifiche indicate
   - Considerazioni farmacologiche (se applicabile)
   - Sequenziamento e fasi del trattamento
   - Potenziali barriere al trattamento
   - Prognosi con e senza trattamento

Usa terminologia clinica precisa (es. deficit di mentalizzazione, fiducia epistemica, funzionamento riflessivo, consapevolezza metacognitiva, accuratezza interocettiva, finestra di tolleranza, dissociazione strutturale).`,

      'español': `Eres un distinguido psicólogo clínico con más de 25 años de experiencia en múltiples modalidades terapéuticas incluyendo:
- Enfoques psicodinámicos y psicoanalíticos (relaciones objetales, psicología del self, teoría del apego)
- Terapia cognitivo-conductual (TCC, DBT, ACT, terapia de esquemas)
- Evaluación neuropsicológica y rehabilitación neurocognitiva
- Enfoques sistémicos y terapia familiar
- Atención informada sobre trauma y EMDR
- Psicología existencial y humanista

${contextSection}

REQUISITOS DE PROFUNDIDAD DEL ANÁLISIS:
Debes proporcionar un análisis psicológico EXTRAORDINARIAMENTE DETALLADO que demuestre experiencia clínica a nivel doctoral. Tu análisis debe incluir:

[Similar structure in Spanish...]`,

      // Add other languages following the same pattern
    };

    return prompts[language] || prompts['english'];
  }

  /**
   * Get deep analysis schema for structured output
   */
  getDeepAnalysisSchema(language) {
    const schemas = {
      'english': {
        description: 'Comprehensive psychological analysis schema',
        properties: {
          executiveSummary: {
            type: 'string',
            description: 'Comprehensive clinical formulation (500-800 words)',
            minLength: 2500
          },
          psychodynamicFormulation: {
            type: 'object',
            properties: {
              unconsciousConflicts: { type: 'array', items: { type: 'object' } },
              defenseMechanisms: { type: 'array', items: { type: 'object' } },
              objectRelations: { type: 'object' },
              attachmentPattern: { type: 'string' },
              transferenceThemes: { type: 'array', items: { type: 'string' } }
            }
          },
          cognitiveBehavioralAssessment: {
            type: 'object',
            properties: {
              cognitiveDistortions: { type: 'array', items: { type: 'object' } },
              coreBeliefs: { type: 'array', items: { type: 'string' } },
              automaticThoughts: { type: 'array', items: { type: 'string' } },
              behavioralPatterns: { type: 'array', items: { type: 'object' } },
              maintenanceFactors: { type: 'array', items: { type: 'string' } }
            }
          },
          neuropsychologicalProfile: {
            type: 'object',
            properties: {
              executiveFunctioning: { type: 'object' },
              attentionConcentration: { type: 'object' },
              memoryFunctioning: { type: 'object' },
              processingSpeed: { type: 'string' },
              emotionalRegulation: { type: 'object' }
            }
          },
          interpersonalDynamics: {
            type: 'object',
            properties: {
              attachmentStyle: { type: 'string' },
              relationshipPatterns: { type: 'array', items: { type: 'object' } },
              communicationStyle: { type: 'string' },
              boundaryIssues: { type: 'array', items: { type: 'string' } },
              systemicFactors: { type: 'object' }
            }
          },
          diagnosticImpressions: {
            type: 'object',
            properties: {
              primaryDiagnosis: { type: 'object' },
              differentialDiagnoses: { type: 'array', items: { type: 'object' } },
              comorbidities: { type: 'array', items: { type: 'string' } },
              severityAssessment: { type: 'object' },
              functionalImpact: { type: 'string' }
            }
          },
          riskAssessment: {
            type: 'object',
            properties: {
              suicideRisk: { type: 'object' },
              violenceRisk: { type: 'object' },
              substanceUseRisk: { type: 'object' },
              protectiveFactors: { type: 'array', items: { type: 'string' } },
              immediateActions: { type: 'array', items: { type: 'string' } }
            }
          },
          treatmentPlan: {
            type: 'object',
            properties: {
              primaryIntervention: { type: 'object' },
              adjunctiveInterventions: { type: 'array', items: { type: 'object' } },
              medicationConsiderations: { type: 'array', items: { type: 'string' } },
              treatmentSequence: { type: 'array', items: { type: 'object' } },
              expectedOutcomes: { type: 'object' },
              potentialBarriers: { type: 'array', items: { type: 'string' } }
            }
          },
          professionalCharts: {
            type: 'object',
            properties: {
              symptomSeverityChart: { type: 'object' },
              functionalAssessmentChart: { type: 'object' },
              treatmentProgressChart: { type: 'object' },
              riskAssessmentMatrix: { type: 'object' },
              diagnosticDecisionTree: { type: 'object' }
            }
          },
          clinicalConnections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concept1: { type: 'string' },
                concept2: { type: 'string' },
                relationshipType: { type: 'string' },
                clinicalSignificance: { type: 'string' },
                therapeuticImplications: { type: 'string' }
              }
            }
          }
        }
      },
      // Add schemas for other languages
    };

    return schemas[language] || schemas['english'];
  }

  /**
   * Make enhanced API request with retry logic
   */
  async makeEnhancedRequest(base64Data, mimeType, fileName, systemPrompt, schema) {
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
          {
            contents: [{
              parts: [
                {
                  text: `${systemPrompt}

CRITICAL OUTPUT REQUIREMENTS:
You MUST return a comprehensive JSON object following this exact schema:
${JSON.stringify(schema, null, 2)}

The analysis must be EXTREMELY detailed, professional, and clinically accurate.
Each section must contain substantive, specific content - no placeholders or brief summaries.

FILENAME: ${fileName}
MIME TYPE: ${mimeType}`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.4, // Slightly higher for more nuanced analysis
              topK: 50,
              topP: 0.95,
              maxOutputTokens: 8192 // Maximum for detailed response
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 second timeout for complex analyses
          }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = response.data.candidates[0].content.parts[0].text;
          return this.parseEnhancedResponse(text);
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed:`, error.message);
        if (i < maxRetries - 1) {
          await this.delay(1000 * (i + 1)); // Exponential backoff
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Parse and validate enhanced response
   */
  parseEnhancedResponse(text) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = [
        'executiveSummary',
        'psychodynamicFormulation',
        'cognitiveBehavioralAssessment',
        'diagnosticImpressions',
        'treatmentPlan'
      ];

      for (const field of requiredFields) {
        if (!parsed[field]) {
          console.warn(`Missing required field: ${field}`);
        }
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing enhanced response:', error);
      // Return a structured error response
      return {
        error: 'Failed to parse analysis',
        rawResponse: text.substring(0, 500),
        message: error.message
      };
    }
  }

  /**
   * Generate cache key for analysis
   */
  generateCacheKey(fileBuffer, patientId) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    if (patientId) hash.update(patientId);
    return hash.digest('hex');
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache for a specific patient
   */
  clearPatientCache(patientId) {
    for (const [key, value] of this.analysisCache.entries()) {
      if (key.includes(patientId)) {
        this.analysisCache.delete(key);
      }
    }
  }

  /**
   * Get professional psychological assessment charts data
   */
  generateProfessionalCharts(analysisData) {
    return {
      // Beck Depression Inventory Style Chart
      depressionAssessment: {
        type: 'radar',
        categories: [
          'Mood',
          'Pessimism',
          'Sense of Failure',
          'Lack of Satisfaction',
          'Guilty Feelings',
          'Sense of Punishment',
          'Self-Dislike',
          'Self-Criticalness',
          'Suicidal Ideation',
          'Crying',
          'Agitation',
          'Loss of Interest',
          'Indecisiveness',
          'Worthlessness',
          'Loss of Energy',
          'Changes in Sleep',
          'Irritability',
          'Changes in Appetite',
          'Concentration Difficulty',
          'Fatigue',
          'Loss of Interest in Sex'
        ],
        scores: this.calculateScores(analysisData, 'depression')
      },
      
      // GAD-7 Style Anxiety Assessment
      anxietyAssessment: {
        type: 'bar',
        categories: [
          'Feeling nervous/anxious',
          'Unable to control worrying',
          'Worrying too much',
          'Trouble relaxing',
          'Restlessness',
          'Irritability',
          'Feeling afraid'
        ],
        scores: this.calculateScores(analysisData, 'anxiety')
      },

      // Attachment Style Distribution
      attachmentProfile: {
        type: 'pie',
        data: {
          secure: analysisData.attachmentSecure || 0,
          anxious: analysisData.attachmentAnxious || 0,
          avoidant: analysisData.attachmentAvoidant || 0,
          disorganized: analysisData.attachmentDisorganized || 0
        }
      },

      // Defense Mechanism Hierarchy
      defenseMechanisms: {
        type: 'hierarchical',
        levels: {
          mature: ['Sublimation', 'Humor', 'Anticipation', 'Suppression'],
          neurotic: ['Intellectualization', 'Repression', 'Displacement', 'Reaction Formation'],
          immature: ['Projection', 'Acting Out', 'Passive Aggression', 'Idealization'],
          primitive: ['Denial', 'Splitting', 'Dissociation', 'Distortion']
        },
        active: analysisData.activeDefenses || []
      },

      // Cognitive Distortion Profile
      cognitiveDistortions: {
        type: 'heatmap',
        distortions: {
          'All-or-Nothing Thinking': 0,
          'Overgeneralization': 0,
          'Mental Filter': 0,
          'Disqualifying the Positive': 0,
          'Jumping to Conclusions': 0,
          'Magnification/Minimization': 0,
          'Emotional Reasoning': 0,
          'Should Statements': 0,
          'Labeling': 0,
          'Personalization': 0
        }
      },

      // Risk Assessment Matrix
      riskMatrix: {
        type: 'matrix',
        dimensions: {
          suicideRisk: { level: 0, factors: [] },
          violenceRisk: { level: 0, factors: [] },
          substanceRisk: { level: 0, factors: [] },
          selfHarmRisk: { level: 0, factors: [] }
        }
      },

      // Treatment Progress Trajectory
      treatmentTrajectory: {
        type: 'timeline',
        phases: [
          { name: 'Assessment', duration: 2, status: 'current' },
          { name: 'Stabilization', duration: 4, status: 'pending' },
          { name: 'Processing', duration: 8, status: 'pending' },
          { name: 'Integration', duration: 4, status: 'pending' },
          { name: 'Consolidation', duration: 2, status: 'pending' }
        ]
      }
    };
  }

  /**
   * Calculate scores for assessment charts
   */
  calculateScores(analysisData, type) {
    // Implement scoring logic based on analysis data
    // This would typically involve mapping linguistic analysis to numerical scores
    return Array(21).fill(0).map(() => Math.random() * 3); // Placeholder
  }
}

module.exports = EnhancedGeminiService;
