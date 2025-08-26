# PsyAI - Applicazione AI per Supporto Psicologico

## 📋 Panoramica del Progetto

**PsyAI** è un'applicazione innovativa che dimostra come l'intelligenza artificiale possa supportare efficacemente il campo della psicologia, fungendo da "OneNote evoluto" per professionisti e strumento di auto-riflessione guidata per i pazienti.

### 🎯 Obiettivi
- Assistere gli psicologi nell'analisi e comprensione delle dinamiche dei pazienti
- Fornire ai pazienti uno strumento di auto-esplorazione sicuro e guidato
- Visualizzare percorsi psicologici complessi attraverso grafici interattivi innovativi
- Dimostrare il potenziale dell'AI come supporto (non sostituto) nella pratica psicologica

### 🔧 Tecnologie Principali
- **AI Engine**: Google Gemini 2.5 Flash (possibilmente Pro)
- **Frontend**: React.js con visualizzazioni D3.js/Three.js
- **Backend**: Node.js/Express
- **Database**: PostgreSQL per dati strutturati + Vector DB per analisi semantiche

---

## 👥 Profili Utente

### 🩺 Psicologo (Interfaccia Professionale)
**Dashboard completa con funzionalità avanzate di analisi**

#### Funzionalità Core:
- **Analisi Documenti**: Upload e analisi automatica di appunti, disegni, documenti del paziente
- **Visualizzazione Percorsi**: Grafici interattivi stile Random Forest dei pattern psicologici
- **Riassunto Esecutivo**: Report automatici generati dall'AI con:
  - Temi ricorrenti identificati
  - Pattern comportamentali principali
  - Aree di focus suggerite per sessioni future
  - Progressi/regressioni nel tempo
- **Suggerimenti Terapeutici**: Tecniche e approcci consigliati dall'AI basati sui pattern
- **Analisi "What-If"**: Generazione di scenari alternativi su richiesta
- **Timeline Emotiva**: Tracking dell'evoluzione emotiva nel tempo

#### Interfaccia Specifica:
- Layout professionale con terminologia clinica
- Accesso completo a tutte le analisi e insights dell'AI
- Strumenti avanzati di annotazione e categorizzazione
- Export di report in formato professionale

### 🧑‍💼 Paziente (Interfaccia Semplificata)
**Strumento di auto-riflessione guidata**

#### Funzionalità Core:
- **Journaling Guidato**: Sessioni di scrittura con domande progressive dell'AI
- **Visualizzazione Personale**: Versione semplificata dei grafici dei percorsi
- **Auto-Esplorazione**: Domande di approfondimento generate dinamicamente
- **Tracking Emotivo**: Grafici dell'evoluzione del proprio stato nel tempo
- **Analisi "What-If" Personale**: Esplorare scenari alternativi per comprensione personale

#### Interfaccia Specifica:
- Design user-friendly e non intimidatorio
- Linguaggio accessibile e comprensibile
- Focus su auto-comprensione piuttosto che diagnosi
- Sistema di allerte per casi preoccupanti (suggerimento di consultare un professionista)

---

## 🎨 Visualizzazioni Innovative

### 📊 Grafico Random Forest Psicologico
**Visualizzazione principale dei percorsi e pattern**

#### Struttura:
- **Nodi Eventi**: Traumi, esperienze significative, momenti chiave
- **Nodi Pattern**: Comportamenti ricorrenti, credenze, meccanismi di difesa
- **Connessioni Pesate**: Spessore e colore basati su intensità emotiva
- **Navigazione Zoom**: Vista generale → dettagli specifici di ogni nodo

#### Interattività:
- Click su nodi per dettagli ed estratti testuali
- Generazione rami alternativi ("E se invece...")
- Filtraggio per periodo temporale o tipologia
- Animazioni fluide per transizioni

### 📈 Timeline Emotiva
**Tracking dell'evoluzione nel tempo**

- Grafici a linee per stati emotivi
- Marker di eventi significativi
- Correlazioni tra eventi e stati emotivi
- Zoom su periodi specifici

### 🌐 Mappa Tematica
**Visualizzazione dei temi ricorrenti**

- Word clouds dinamiche
- Clustering di concetti correlati
- Intensità cromatica basata su frequenza/importanza

---

## 🔄 Flusso di Utilizzo

### Per lo Psicologo:
1. **Upload Contenuti**: Carica appunti, documenti, immagini
2. **Analisi AI**: L'AI processa e analizza il materiale
3. **Esplorazione Grafica**: Naviga i percorsi generati
4. **Approfondimenti**: Genera scenari alternativi
5. **Report**: Ottiene riassunti esecutivi e suggerimenti

### Per il Paziente:
1. **Sessione Journaling**: Risponde a domande guidate
2. **Auto-Esplorazione**: L'AI genera domande di approfondimento
3. **Visualizzazione**: Esplora i propri percorsi in forma semplificata
4. **Riflessione**: Analizza scenari alternativi per auto-comprensione
5. **Tracking**: Monitora la propria evoluzione nel tempo

---

## 🏗️ Architettura Tecnica

### 📁 Struttura Cartelle
```
psyai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── psychologist/
│   │   │   └── patient/
│   │   ├── visualizations/
│   │   │   ├── RandomForest.jsx
│   │   │   ├── Timeline.jsx
│   │   │   └── ThematicMap.jsx
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   └── dataService.js
│   │   └── utils/
│   └── public/
├── backend/
│   ├── routes/
│   │   ├── ai/
│   │   ├── analysis/
│   │   ├── users/
│   │   └── data/
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── analysisService.js
│   │   └── visualizationService.js
│   ├── models/
│   ├── middleware/
│   └── utils/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schemas/
├── docs/
│   ├── api/
│   ├── user-guides/
│   └── technical/
└── tests/
    ├── frontend/
    ├── backend/
    └── integration/
```

### 🔌 API Endpoints Principali
```
/api/v1/
├── auth/
│   ├── login
│   └── register
├── ai/
│   ├── analyze
│   ├── generate-questions
│   └── what-if-scenarios
├── analysis/
│   ├── upload-document
│   ├── create-visualization
│   └── generate-report
├── data/
│   ├── sessions
│   ├── insights
│   └── timeline
└── users/
    ├── profile
    └── preferences
```

---

## 🎯 Funzionalità Dettagliate

### 🤖 AI Engine
- **Analisi Multimodale**: Testo, immagini, documenti
- **Generazione Domande**: Adattiva basata su risposte precedenti
- **Pattern Recognition**: Identificazione automatica di temi ricorrenti
- **Scenario Generation**: Creazione di alternative plausibili
- **Sentiment Analysis**: Analisi emotiva approfondita

### 🔒 Privacy & Sicurezza
- **Crittografia End-to-End**: Tutti i dati sensibili crittografati
- **Accesso Separato**: Psicologi e pazienti non condividono dati automaticamente
- **Compliance**: Rispetto delle normative sulla privacy medica
- **Anonimizzazione**: Opzioni per l'anonimizzazione dei dati

### 📱 Responsive Design
- **Multi-Device**: Ottimizzato per desktop, tablet, mobile
- **Progressive Web App**: Funzionalità offline limitate
- **Accessibilità**: Conforme alle linee guida WCAG

---

## 🚀 Roadmap di Sviluppo

### Phase 1 - MVP (Mesi 1-3)
- [ ] Setup infrastruttura base
- [ ] Integrazione Gemini API
- [ ] Interfacce base per psicologo e paziente
- [ ] Funzionalità di upload e analisi documenti
- [ ] Prima versione visualizzazione Random Forest

### Phase 2 - Core Features (Mesi 4-6)
- [ ] Sistema di journaling guidato
- [ ] Timeline emotiva
- [ ] Generazione scenari "what-if"
- [ ] Riassunti esecutivi automatici
- [ ] Sistema di domande adattive

### Phase 3 - Advanced Features (Mesi 7-9)
- [ ] Visualizzazioni avanzate e interattive
- [ ] Sistema di suggerimenti terapeutici
- [ ] Analytics e insights avanzati
- [ ] Funzionalità di export/import
- [ ] Sistema di backup e recovery

### Phase 4 - Polish & Scale (Mesi 10-12)
- [ ] Ottimizzazioni performance
- [ ] Testing approfondito
- [ ] Documentazione completa
- [ ] Beta testing con professionisti
- [ ] Preparazione per deployment

---

## 💡 Innovazioni Chiave

### 🔬 Analisi Predittiva
- Identificazione precoce di pattern problematici
- Suggerimenti proattivi per interventi
- Monitoraggio automatico di progressi

### 🎨 Visualizzazione Immersiva
- Grafici 3D interattivi per percorsi complessi
- Animazioni fluide per migliore comprensione
- Personalizzazione visiva basata su preferenze utente

### 🧠 AI Contextual
- Memoria contestuale delle sessioni precedenti
- Adattamento dinamico delle domande
- Comprensione semantica profonda del linguaggio emotivo

---

## 📊 Metriche di Successo

### Per Psicologi:
- Riduzione tempo di analisi del 40%
- Miglioramento insights clinici (feedback qualitativo)
- Aumento efficacia terapeutica (outcome tracking)

### Per Pazienti:
- Incremento auto-consapevolezza (self-assessment)
- Maggiore engagement nel processo terapeutico
- Riduzione resistenze all'esplorazione personale

### Tecniche:
- Accuratezza AI >85% nella pattern recognition
- Tempo risposta <2 secondi per analisi standard
- Uptime >99.5% della piattaforma

---

## 🚀 Quick Start

### Prerequisiti
- Node.js 16+ e npm
- PostgreSQL 12+
- Google Gemini API key (opzionale per demo)

### Installazione e Avvio Automatico
```bash
git clone <repository-url>
cd psyai

# Opzione 1: Script automatico (consigliato)
./start.sh

# Opzione 2: Comandi manuali
npm run setup    # Installa tutto e configura database
npm start        # Avvia backend + frontend insieme
```

### Comandi Disponibili
```bash
npm start              # Avvia backend (3001) + frontend (3000)
npm run setup          # Setup completo: dipendenze + database
npm run install:all    # Installa tutte le dipendenze
npm run dev            # Modalità sviluppo
npm test               # Esegui test backend
npm run build          # Build produzione frontend
```

### Configurazione Manuale (se necessaria)
1. Copia `.env.example` in `.env` nel backend
2. Configura le variabili d'ambiente (database, JWT secret, Gemini API)
3. Crea il database PostgreSQL: `createdb psyai_db`
4. Setup database: `cd backend && node scripts/setup-db.js`

---

## 🎓 Note di Sviluppo

### Considerazioni Etiche:
- L'AI non fornisce mai diagnosi mediche
- Chiaro disclaimer sui limiti dell'applicazione
- Sistema di alert per situazioni a rischio
- Trasparenza negli algoritmi di analisi

### Scalabilità:
- Architettura microservizi per crescita modulare
- Caching intelligente per performance
- Load balancing automatico
- Monitoring e alerting real-time

### Integrazione:
- API aperte per integrazione con sistemi esistenti
- Export standard per software clinici
- Possibilità di white-labeling per studi privati