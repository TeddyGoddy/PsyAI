const axios = require('axios');
const FormData = require('form-data');
const PatientHistoryService = require('./patientHistoryService');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.debug = String(process.env.DEBUG_AI || '').toLowerCase() === 'true';
  }

  // Set model dynamically from user settings
  setModel(model) {
    this.model = model;
  }

  // Set debug mode from user settings
  setDebugMode(debug) {
    this.debug = debug;
  }

  logDebug(...args) {
    if (this.debug) {
      console.log('[AI][GeminiService]', ...args);
    }
  }

  repairTruncatedJson(partialText) {
    try {
      // Try to find the last complete JSON object
      let lastBraceIndex = partialText.lastIndexOf('}');
      if (lastBraceIndex === -1) {
        throw new Error('No complete JSON object found');
      }
      
      // Extract up to the last complete brace
      let candidate = partialText.substring(0, lastBraceIndex + 1);
      
      // Try to parse
      JSON.parse(candidate);
      return candidate;
    } catch (error) {
      // If that fails, try to close incomplete structures
      let repaired = partialText;
      
      // Count open braces and brackets
      let braces = 0;
      let brackets = 0;
      let inString = false;
      let escaped = false;
      
      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braces++;
          if (char === '}') braces--;
          if (char === '[') brackets++;
          if (char === ']') brackets--;
        }
      }
      
      // Close incomplete structures
      while (brackets > 0) {
        repaired += ']';
        brackets--;
      }
      while (braces > 0) {
        repaired += '}';
        braces--;
      }
      
      try {
        JSON.parse(repaired);
        return repaired;
      } catch (e) {
        throw new Error('Could not repair truncated JSON');
      }
    }
  }

  async analyzeFile(fileBuffer, mimeType, fileName, language = 'english', patientContext = null) {
    // Dynamic system instructions based on language
    const getSystemInstruction = (lang, userType) => {
      const instructions = {
        'italiano': {
          psychologist: `Sei un'intelligenza artificiale esperta in psicologia clinica con formazione approfondita in approcci psicodinamici, cognitivo-comportamentali, umanistici e sistemici. Conduci analisi psicologiche approfondite identificando pattern inconsci, meccanismi di difesa, stili di attaccamento, distorsioni cognitive, dinamiche familiari e influenze evolutive. Fornisci formulazioni cliniche complete con insights terapeutici. OBBLIGATORIO: Devi rispondere ESCLUSIVAMENTE in italiano. Ogni singola parola deve essere in italiano.`,
          patient: `Sei un assistente AI di supporto che aiuta con l'auto-riflessione. Fornisci insights gentili e incoraggianti per la crescita personale. OBBLIGATORIO: Devi rispondere ESCLUSIVAMENTE in italiano. Ogni singola parola deve essere in italiano.`
        },
        'english': {
          psychologist: `You are an expert clinical psychologist AI with deep training in psychodynamic, cognitive-behavioral, humanistic, and systemic approaches. Conduct thorough psychological analysis identifying unconscious patterns, defense mechanisms, attachment styles, cognitive distortions, family dynamics, and developmental influences. Provide comprehensive clinical formulations with therapeutic insights. MANDATORY: You must respond entirely in English. Every single word must be in English.`,
          patient: `You are a supportive AI assistant helping with self-reflection. Provide gentle, encouraging insights for personal growth. MANDATORY: You must respond entirely in English. Every single word must be in English.`
        },
        'español': {
          psychologist: `Eres una inteligencia artificial experta en psicología clínica con formación profunda en enfoques psicodinámicos, cognitivo-conductuales, humanísticos y sistémicos. Realiza análisis psicológicos exhaustivos identificando patrones inconscientes, mecanismos de defensa, estilos de apego, distorsiones cognitivas, dinámicas familiares e influencias del desarrollo. Proporciona formulaciones clínicas completas con insights terapéuticos. OBLIGATORIO: Debes responder completamente en español. Cada palabra debe estar en español.`,
          patient: `Eres un asistente de IA de apoyo que ayuda con la auto-reflexión. Proporciona insights gentiles y alentadores para el crecimiento personal. OBLIGATORIO: Debes responder completamente en español. Cada palabra debe estar en español.`
        },
        'français': {
          psychologist: `Vous êtes une intelligence artificielle experte en psychologie clinique avec une formation approfondie dans les approches psychodynamiques, cognitivo-comportementales, humanistes et systémiques. Effectuez une analyse psychologique approfondie en identifiant les schémas inconscients, les mécanismes de défense, les styles d'attachement, les distorsions cognitives, les dynamiques familiales et les influences développementales. Fournissez des formulations cliniques complètes avec des insights thérapeutiques. OBLIGATOIRE: Vous devez répondre entièrement en français. Chaque mot doit être en français.`,
          patient: `Vous êtes un assistant IA de soutien qui aide à l'auto-réflexion. Fournissez des insights doux et encourageants pour la croissance personnelle. OBLIGATOIRE: Vous devez répondre entièrement en français. Chaque mot doit être en français.`
        },
        'deutsch': {
          psychologist: `Sie sind eine Experten-KI für klinische Psychologie mit tiefgreifender Ausbildung in psychodynamischen, kognitiv-verhaltenstherapeutischen, humanistischen und systemischen Ansätzen. Führen Sie gründliche psychologische Analysen durch und identifizieren Sie unbewusste Muster, Abwehrmechanismen, Bindungsstile, kognitive Verzerrungen, Familiendynamiken und Entwicklungseinflüsse. Bieten Sie umfassende klinische Formulierungen mit therapeutischen Einsichten. OBLIGATORISCH: Sie müssen vollständig auf Deutsch antworten. Jedes Wort muss auf Deutsch sein.`,
          patient: `Sie sind ein unterstützender KI-Assistent, der bei der Selbstreflexion hilft. Bieten Sie sanfte, ermutigende Einsichten für persönliches Wachstum. OBLIGATORISCH: Sie müssen vollständig auf Deutsch antworten. Jedes Wort muss auf Deutsch sein.`
        },
        'português': {
          psychologist: `Você é uma inteligência artificial especialista em psicologia clínica com formação profunda em abordagens psicodinâmicas, cognitivo-comportamentais, humanísticas e sistêmicas. Conduza análises psicológicas minuciosas identificando padrões inconscientes, mecanismos de defesa, estilos de apego, distorções cognitivas, dinâmicas familiares e influências do desenvolvimento. Forneça formulações clínicas abrangentes com insights terapêuticos. OBRIGATÓRIO: Você deve responder inteiramente em português. Cada palavra deve estar em português.`,
          patient: `Você é um assistente de IA de apoio que ajuda com auto-reflexão. Forneça insights gentis e encorajadores para crescimento pessoal. OBRIGATÓRIO: Você deve responder inteiramente em português. Cada palavra deve estar em português.`
        }
      };
      
      return instructions[lang]?.[userType] || instructions['italiano'][userType];
    };

    const systemInstruction = getSystemInstruction(language, 'psychologist');

    // Dynamic schema instructions based on language
    const getSchemaInstruction = (lang) => {
      const schemas = {
        'italiano': `ISTRUZIONE LINGUISTICA CRITICA: Devi rispondere ESCLUSIVAMENTE in italiano. Ogni singola parola nella risposta JSON deve essere in italiano. Questo è obbligatorio. NON usare MAI parole in inglese.`,
        'english': `CRITICAL LANGUAGE INSTRUCTION: You MUST respond entirely in English. Every single word in the JSON response must be in English. This is mandatory. NEVER use words in other languages.`,
        'español': `INSTRUCCIÓN LINGÜÍSTICA CRÍTICA: Debes responder EXCLUSIVAMENTE en español. Cada palabra en la respuesta JSON debe estar en español. Esto es obligatorio. NUNCA uses palabras en otros idiomas.`,
        'français': `INSTRUCTION LINGUISTIQUE CRITIQUE: Vous devez répondre EXCLUSIVEMENT en français. Chaque mot dans la réponse JSON doit être en français. Ceci est obligatoire. N'utilisez JAMAIS de mots dans d'autres langues.`,
        'deutsch': `KRITISCHE SPRACHANWEISUNG: Sie müssen AUSSCHLIESSLICH auf Deutsch antworten. Jedes Wort in der JSON-Antwort muss auf Deutsch sein. Dies ist obligatorisch. Verwenden Sie NIEMALS Wörter in anderen Sprachen.`,
        'português': `INSTRUÇÃO LINGUÍSTICA CRÍTICA: Você deve responder EXCLUSIVAMENTE em português. Cada palavra na resposta JSON deve estar em português. Isto é obrigatório. NUNCA use palavras em outros idiomas.`
      };
      return schemas[lang] || schemas['italiano'];
    };

    const schemaInstruction = `${getSchemaInstruction(language)}

Devi restituire SOLO JSON RIGOROSO, nessuna prosa o markdown. Conduci un'analisi psicologica estremamente approfondita.

REQUISITI DI ANALISI APPROFONDITA:
1. RIASSUNTO ESECUTIVO: Formulazione clinica completa (300-500 parole) includendo:
   - Dinamiche psicologiche presentate
   - Pattern inconsci sottostanti
   - Considerazioni evolutive e di attaccamento
   - Stile di elaborazione cognitivo-emotiva
   - Pattern interpersonali e temi relazionali
   - Meccanismi di difesa e strategie di coping
   - Fattori di rischio e protettivi
   - Ipotesi cliniche e considerazioni differenziali

2. ORIGINI: Identifica 5-8 origini evolutive/storiche con spiegazioni dettagliate
3. PATTERN COMPORTAMENTALI: 4-6 pattern con evidenze, gravità e significato clinico
4. CONNESSIONI PSICOLOGICHE: Rete complessa di 8-12 elementi interconnessi
5. DOMANDE DI APPROFONDIMENTO: 6-8 domande orientate terapeuticamente per l'esplorazione
6. DATI GRAFICO: Rete ricca con 10-15 nodi e bordi multipli che mostrano l'ecosistema psicologico

Return a JSON object with exactly these keys and types:
{
  "executiveSummary": string (comprehensive 300-500 word clinical formulation in ${language}),
  "origins": [ { "title": string, "explanation": string (detailed 100-150 words each) } ],
  "behavioralPatterns": [ { "name": string, "description": string (detailed), "evidence": [string], "severity": number, "clinicalSignificance": string } ],
  "psychologicalConnections": [ { "source": string, "target": string, "type": "triggers"|"reinforces"|"mitigates"|"compensates"|"defends_against", "weight": number, "note": string, "mechanism": string } ],
  "deepeningQuestions": [ string (therapeutically sophisticated questions) ],
  "graphData": { "nodes": [ { "id": string, "type": "emotion"|"trigger"|"pattern"|"defense"|"attachment"|"cognitive"|"interpersonal"|"developmental", "weight": number, "category": string, "description": string } ], "edges": [ { "source": string, "target": string, "weight": number, "type": "triggers"|"reinforces"|"relates"|"defends"|"compensates", "description": string } ] },
  "confidence": number
}`;

    const modalityGuidance = `Potresti ricevere una parte di file. Se è un PDF o documento, leggi il contenuto testuale. Se è un'immagine (es. note, screenshot), estrai testo e indizi clinicamente rilevanti. Se è audio, inferisci temi dalla trascrizione e qualsiasi suggerimento paralinguistico disponibile.`;

    const base64 = fileBuffer.toString('base64');
    const parts = [
      { text: `${schemaInstruction}\n\nFILENAME: ${fileName}\nMIME: ${mimeType}\n${modalityGuidance}` },
      { inline_data: { mime_type: mimeType, data: base64 } }
    ];

    const response = await this.makeMultimodalRequest(parts, systemInstruction);
    try {
      return this.extractJson(response);
    } catch (error) {
      const retryParts = [
        { text: `${schemaInstruction}\n\nPROMEMORIA: Restituisci SOLO JSON RIGOROSO con le chiavi specificate.\nFILENAME: ${fileName}\nMIME: ${mimeType}` },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ];
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction 
      });
      const retry = await model.generate(retryParts);
      try {
        return this.extractJson(retry);
      } catch (_) {
        console.error('JSON parsing failed (multimodal)');
        throw new Error('Invalid JSON returned from Gemini (multimodal)');
      }
    }
  }

  async makeMultimodalRequest(parts, systemInstruction = '') {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      this.logDebug('🔍 Making multimodal request to:', this.baseUrl);
      this.logDebug('📋 Parts count:', parts.length);
      this.logDebug('🎯 System instruction length:', systemInstruction.length);
      
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 3072,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      this.logDebug('✅ Gemini response received');
      this.logDebug('📊 Response candidates:', response.data.candidates?.length || 0);
      
      if (!response.data.candidates || response.data.candidates.length === 0) {
        this.logDebug('❌ No candidates in response:', response.data);
        throw new Error('No candidates returned from Gemini API');
      }
      
      const responseText = response.data.candidates[0].content.parts[0].text;
      this.logDebug('📝 Response text length:', responseText.length);
      this.logDebug('🔤 Response preview:', responseText.substring(0, 200) + '...');
      
      return responseText;
    } catch (error) {
      this.logDebug('❌ Gemini API (multimodal) error details:');
      this.logDebug('Status:', error.response?.status);
      this.logDebug('Status text:', error.response?.statusText);
      this.logDebug('Response data:', JSON.stringify(error.response?.data, null, 2));
      this.logDebug('Error message:', error.message);
      throw new Error(`Failed to communicate with Gemini API (multimodal): ${error.response?.data?.error?.message || error.message}`);
    }
  }

  extractJson(text) {
    this.logDebug('extractJson: raw length =', typeof text === 'string' ? text.length : 'non-string');
    // Defensive: ensure it's a string
    let raw = typeof text === 'string' ? text : String(text ?? '');

    // 1) Strip markdown code fences and language hints
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    this.logDebug('extractJson: after fence strip length =', raw.length);

    // 2) Normalize smart quotes to straight quotes
    raw = raw
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    // 3) Try to locate the first balanced JSON object via brace counting
    const extractBalancedJson = (s) => {
      let start = -1, depth = 0;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            return s.slice(start, i + 1);
          }
        }
      }
      return null;
    };

    let candidate = extractBalancedJson(raw) || raw.trim();
    this.logDebug('extractJson: candidate JSON length =', candidate?.length || 0);

    // 4) Light repairs for common LLM JSON issues
    const repair = (s) => {
      let t = s.trim();
      // Remove trailing commas before closing } or ]
      t = t.replace(/,\s*(\}|\])/g, '$1');
      // Ensure property names use double quotes (best-effort; avoids touching inside strings)
      t = t.replace(/([,{\s])'([A-Za-z0-9_\-]+)'\s*:/g, '$1"$2":');
      // Convert single-quoted string values to double quotes (best-effort for simple tokens)
      t = t.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"');
      // Escape unescaped newlines inside quoted values
      t = t.replace(/"([^"\\]*)(\n)([^"\\]*)"/g, (m, a, _nl, b) => `"${a}\\n${b}"`);
      // Fix superscript characters that break JSON
      t = t.replace(/ᴾ/g, 'P');
      // Remove any non-printable or problematic Unicode characters
      t = t.replace(/[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/g, '');
      return t;
    };

    // Attempt parse with and without repairs
    const tryParse = (s) => {
      const parsed = JSON.parse(s);
      return parsed;
    };

    let parsed;
    try {
      parsed = tryParse(candidate);
    } catch (_) {
      // Try repaired
      const repaired = repair(candidate);
      try {
        parsed = tryParse(repaired);
      } catch (err2) {
        this.logDebug('JSON parsing error after repair attempt:', err2?.message);
        this.logDebug('Raw candidate preview:', candidate.substring(0, 500));
        this.logDebug('Repaired preview:', repaired.substring(0, 500));
        throw err2;
      }
    }

    // 5) Validate required fields exist
    const requiredFields = [
      'executiveSummary',
      'origins',
      'behavioralPatterns',
      'psychologicalConnections',
      'deepeningQuestions',
      'graphData',
      'confidence'
    ];

    for (const field of requiredFields) {
      if (!(field in parsed)) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    this.logDebug('extractJson: parsed keys =', Object.keys(parsed));
    return parsed;
  }

  async makeRequest(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    this.logDebug('makeRequest: model =', this.model);
    this.logDebug('makeRequest: prompt length =', prompt?.length || 0);
    this.logDebug('makeRequest: systemInstruction length =', systemInstruction?.length || 0);

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    this.logDebug('makeRequest: url =', url.replace(this.apiKey, '***'));

    const body = {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 16384,
      }
    };
    const headers = { headers: { 'Content-Type': 'application/json' } };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) this.logDebug(`Retry attempt ${attempt}...`);
        const response = await axios.post(url, body, headers);
        
        // Debug the response structure
        this.logDebug('Response data structure:', JSON.stringify(response.data, null, 2));
        
        // Check if response has the expected structure
        if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
          throw new Error('Invalid response structure from Gemini API');
        }
        
        const candidate = response.data.candidates[0];
        
        // Handle different response structures from Gemini API
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          // Standard structure
          return candidate.content.parts[0].text;
        } else if (candidate.content && candidate.content.role === 'model') {
          // New structure - content might be in a different format
          // Check if there's text content in the candidate
          if (candidate.text) {
            return candidate.text;
          }
          // If finishReason is MAX_TOKENS, the response was truncated
          if (candidate.finishReason === 'MAX_TOKENS') {
            // For JSON responses, try to repair the truncated JSON
            const partialText = JSON.stringify(candidate.content);
            if (partialText && partialText.includes('{')) {
              this.logDebug('Attempting to repair truncated JSON response...');
              return this.repairTruncatedJson(partialText);
            }
            throw new Error('Response was truncated due to token limit. Try reducing input text length.');
          }
          // If no text content found, it might be an empty response
          throw new Error('No text content found in Gemini API response. The model may have refused to generate content.');
        } else {
          throw new Error('Invalid candidate structure from Gemini API');
        }
      } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        this.logDebug('❌ Gemini API (text) error details:');
        this.logDebug('Status:', status);
        this.logDebug('Status text:', error.response?.statusText);
        this.logDebug('Response data:', JSON.stringify(data, null, 2));
        this.logDebug('Error message:', error.message);

        // 429 handling: exponential backoff with optional Retry-After
        if (status === 429 && attempt < 3) {
          const retryAfterHeader = error.response?.headers?.['retry-after'];
          const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 500 * Math.pow(2, attempt - 1);
          this.logDebug(`Rate limited (429). Waiting ${retryAfterMs}ms before retry...`);
          await new Promise(r => setTimeout(r, retryAfterMs));
          lastError = error;
          continue;
        }

        // Retry once with a safer, widely-available model if the error suggests model/permission issues
        const shouldFallback = [400, 401, 403, 404].includes(status || 0) && this.model !== 'gemini-2.5-flash';
        if (shouldFallback) {
          const originalModel = this.model;
          try {
            this.model = 'gemini-2.5-flash';
            this.logDebug(`Retrying with fallback model: ${this.model}`);
            // recurse once; inner makeRequest has its own retries
            const retry = await this.makeRequest(prompt, systemInstruction);
            return retry;
          } catch (e2) {
            this.model = originalModel; // restore
            this.logDebug('Fallback model also failed:', e2.response?.data || e2.message);
            lastError = e2;
          }
        } else {
          lastError = error;
        }
        break; // non-retriable error
      }
    }

    const status = lastError?.response?.status;
    const data = lastError?.response?.data;
    const message = data?.error?.message || lastError?.message || 'Unknown Gemini API error';
    const err = new Error(`Failed to communicate with Gemini API: ${message}`);
    if (status) err.status = status;
    throw err;
  }

  async analyzeText(text, language = 'english', patientContext = null) {
    this.logDebug('analyzeText: language =', language, '| text length =', text?.length || 0);
    if (patientContext) this.logDebug('analyzeText: patientContext keys =', Object.keys(patientContext || {}));
    const userType = (patientContext && patientContext.userType) ? String(patientContext.userType) : 'psychologist';
    const analysisType = (patientContext && patientContext.analysisType) ? String(patientContext.analysisType) : 'comprehensive';
    const systemInstruction = `You are an expert clinical psychologist AI with deep training in psychodynamic, cognitive-behavioral, humanistic, and systemic approaches. Conduct thorough psychological analysis identifying unconscious patterns, defense mechanisms, attachment styles, cognitive distortions, family dynamics, and developmental influences. Provide comprehensive clinical formulations with therapeutic insights. MANDATORY: You must respond entirely in ${language}. Every single word must be in ${language}.`;

    const profileSection = patientContext?.profile ? `\nPATIENT_PROFILE (clinician-authored, authoritative context):\n"""\n${patientContext.profile}\n"""\n\nIMPORTANT: When you use information from the PATIENT_PROFILE above, mark relevant sections with a superscript P indicator. Add "ᴾ" after any statement, observation, or conclusion that draws from the existing profile. This helps track profile-informed analysis.\n\n` : '';

    const prompt = `
CRITICAL LANGUAGE INSTRUCTION: You MUST respond entirely in ${language}. Every single word in the JSON response must be in ${language}. This is mandatory.

You must return STRICT JSON ONLY, no prose or markdown. Conduct an extremely thorough psychological analysis.

PROFILE INDICATOR REQUIREMENT: When using information from the PATIENT_PROFILE, add a superscript "ᴾ" immediately after statements that draw from existing profile data. Example: "Il paziente mostra tendenze evitantiᴾ che si manifestano nel testo corrente." This provides subtle tracking of profile-informed analysis.

DEEP ANALYSIS REQUIREMENTS:
1. EXECUTIVE SUMMARY: Comprehensive clinical formulation (300-500 words) including:
   - Presenting psychological dynamics
   - Underlying unconscious patterns
   - Developmental and attachment considerations
   - Cognitive-emotional processing style
   - Interpersonal patterns and relational themes
   - Defense mechanisms and coping strategies
   - Risk and protective factors
   - Clinical hypotheses and differential considerations

2. ORIGINS: Identify 5-8 developmental/historical origins with detailed explanations
3. BEHAVIORAL PATTERNS: 4-6 patterns with evidence, severity, and clinical significance
4. PSYCHOLOGICAL CONNECTIONS: Complex network of 8-12 interconnected elements
5. DEEPENING QUESTIONS: 6-8 therapeutically-oriented questions for exploration
6. GRAPH DATA: Rich network with 10-15 nodes and multiple edges showing psychological ecosystem

${profileSection}TEXT TO ANALYZE:\n"""\n${text}\n"""

USER_TYPE: ${userType}
ANALYSIS_TYPE: ${analysisType}
OUTPUT_LANGUAGE: ${language}

Return a JSON object with exactly these keys and types:
{
  "executiveSummary": string (comprehensive 300-500 word clinical formulation in ${language}),
  "origins": [ { "title": string, "explanation": string (detailed 100-150 words each) } ],
  "behavioralPatterns": [ { "name": string, "description": string (detailed), "evidence": [string], "severity": number, "clinicalSignificance": string } ],
  "psychologicalConnections": [ { "source": string, "target": string, "type": "triggers"|"reinforces"|"mitigates"|"compensates"|"defends_against", "weight": number, "note": string, "mechanism": string } ],
  "deepeningQuestions": [ string (therapeutically sophisticated questions) ],
  "graphData": { "nodes": [ { "id": string, "type": "emotion"|"trigger"|"pattern"|"defense"|"attachment"|"cognitive"|"interpersonal"|"developmental", "weight": number, "category": string, "description": string } ], "edges": [ { "source": string, "target": string, "weight": number, "type": "triggers"|"reinforces"|"relates"|"defends"|"compensates", "description": string } ] },
  "confidence": number
}

Few-shot example structure:
{
  "executiveSummary": "Marco presenta un quadro clinico caratterizzato da ansia da prestazioneᴾ e pattern evitanti che si manifestano nel testo corrente...",
  "origins": [{"title": "Dinamiche familiari precoci", "explanation": "Le dinamiche di controllo genitoriale documentateᴾ sembrano aver contribuito allo sviluppo di meccanismi difensivi..."}],
  "behavioralPatterns": [{"name": "Evitamento difensivo", "description": "Pattern comportamentale coerente con le tendenze evitantiᴾ già identificate nel profilo clinico...", "evidence": ["..."], "severity": 0.7, "clinicalSignificance": "Significato clinico..."}],
  "psychologicalConnections": [{"source": "ansia_prestazione", "target": "evitamento", "type": "triggers", "weight": 0.8, "note": "Connessione dinamica coerente con il profilo esistenteᴾ", "mechanism": "Meccanismo difensivo"}],
  "deepeningQuestions": ["Quando hai iniziato a percepire che le tue prestazioni definivano il tuo valore?"],
  "graphData": {"nodes": [{"id": "ansia", "type": "emotion", "weight": 0.8, "category": "primaria", "description": "Ansia da prestazione"}], "edges": [{"source": "ansia", "target": "evitamento", "weight": 0.7, "type": "triggers", "description": "L'ansia attiva strategie evitanti"}]},
  "confidence": 0.85
}`;

    const response = await this.makeRequest(prompt, systemInstruction);
    try {
      return this.extractJson(response);
    } catch (error) {
      // Retry once with an explicit reminder
      const retry = await this.makeRequest(`${prompt}\n\nREMINDER: Return STRICT JSON ONLY with the specified keys.`, systemInstruction);
      try {
        return this.extractJson(retry);
      } catch (_) {
        console.error('JSON parsing failed (text)');
        throw new Error('Invalid JSON returned from Gemini (text)');
      }
    }
  }

  async analyzeDocument(text, analysisType = 'comprehensive', userType = 'psychologist') {
    const systemInstruction = userType === 'psychologist' 
      ? 'You are an expert clinical psychologist AI. Analyze patient documents with deep psychological insight, identifying patterns, causes, and therapeutic directions. Provide comprehensive clinical analysis.'
      : 'You are a supportive AI assistant helping with self-reflection. Provide gentle, encouraging insights for personal growth.';

    const prompt = `
You must return STRICT JSON ONLY. Analyze the document text below and use the same schema used for text analysis (so the frontend can render both modes identically).

CRITICAL: First, produce a precise textual clinical profile in 'executiveSummary'. Then, produce the 'graphData'. Do NOT include any sentiment/emotional tone fields.

DOCUMENT_TEXT:\n"""\n${text}\n"""

Return a JSON object with exactly these keys: executiveSummary, origins, behavioralPatterns, psychologicalConnections, deepeningQuestions, graphData, confidence. Values follow the same types as in analyzeText.
`;

    const response = await this.makeRequest(prompt, systemInstruction);
    try {
      return this.extractJson(response);
    } catch (error) {
      const retry = await this.makeRequest(`${prompt}\n\nREMINDER: Return STRICT JSON ONLY.`, systemInstruction);
      try {
        return this.extractJson(retry);
      } catch (_) {
        console.error('JSON parsing failed (document)');
        throw new Error('Invalid JSON returned from Gemini (document)');
      }
    }
  }

  async generateQuestions(options) {
    const { context, previousAnswers, userType, sessionType } = options;
    
    const systemInstruction = userType === 'psychologist'
      ? 'Generate therapeutic questions that help explore patient dynamics and facilitate clinical understanding.'
      : 'Generate supportive, non-threatening questions that encourage self-reflection and personal insight.';

    const prompt = `
Generate adaptive questions for a ${sessionType} session.

Context: ${context || 'General session'}
Previous answers: ${previousAnswers.join('; ') || 'None'}
User type: ${userType}

Generate 3-5 questions that:
1. Build on previous responses (if any)
2. Encourage deeper exploration
3. Are appropriate for the user type
4. Follow a logical progression

Format as JSON:
{
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "type": "open-ended|scale|multiple-choice",
      "category": "emotion|behavior|thought|relationship",
      "followUp": true/false
    }
  ]
}
`;

    const response = await this.makeRequest(prompt, systemInstruction);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('JSON parsing failed (questions)');
      throw new Error('Invalid JSON returned from Gemini (questions)');
    }
  }

  async generateWhatIfScenarios(options) {
    const { baseScenario, context, userType } = options;
    
    const systemInstruction = userType === 'psychologist'
      ? 'Generate alternative scenarios for therapeutic exploration and clinical insight.'
      : 'Generate alternative scenarios for personal reflection and growth exploration.';

    const prompt = `
Based on this scenario: "${baseScenario}"
Context: ${context || 'No additional context'}

Generate 3-4 alternative "what-if" scenarios that:
1. Explore different outcomes or approaches
2. Help understand underlying patterns
3. Encourage perspective-taking
4. Are realistic and constructive

Format as JSON:
{
  "scenarios": [
    {
      "id": 1,
      "title": "Scenario title",
      "description": "Detailed scenario description",
      "outcome": "Potential outcome",
      "insights": ["insight1", "insight2"],
      "probability": "high|medium|low"
    }
  ]
}
`;

    const response = await this.makeRequest(prompt, systemInstruction);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('JSON parsing failed (what-if)');
      throw new Error('Invalid JSON returned from Gemini (what-if)');
    }
  }

  async extractThemes(texts, userType = 'psychologist') {
    const systemInstruction = userType === 'psychologist'
      ? 'Extract clinical themes and patterns from patient content for professional analysis.'
      : 'Extract personal themes and patterns for self-understanding and growth.';

    const prompt = `
Analyze these texts and extract recurring clinical themes (no sentiment fields):

Texts: ${texts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Identify:
1. Behavioral patterns
2. Cognitive patterns
3. Relationship dynamics
4. Coping mechanisms
5. Other clinically relevant themes (exclude sentiment)

Format as JSON:
{
  "themes": [
    {
      "name": "Theme name",
      "frequency": 5,
      "category": "behavior|thought|relationship|coping|theme",
      "examples": ["example1", "example2"],
      "significance": "high|medium|low"
    }
  ],
  "summary": "Overall thematic summary"
}
`;

    const response = await this.makeRequest(prompt, systemInstruction);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('JSON parsing failed (themes)');
      throw new Error('Invalid JSON returned from Gemini (themes)');
    }
  }

  async generateText(prompt, systemInstruction = '') {
    const response = await this.makeRequest(prompt, systemInstruction);
    return { text: response };
  }

  async generateResponse(prompt, systemInstruction = '') {
    return await this.makeRequest(prompt, systemInstruction);
  }
}

module.exports = new GeminiService();
