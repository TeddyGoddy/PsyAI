-- Migration: Create analysis archives table for storing patient analyses
-- Each patient has their own isolated archive of analyses

CREATE TABLE IF NOT EXISTS analysis_archives (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id INTEGER NOT NULL REFERENCES users(id),
    analysis_type VARCHAR(50) NOT NULL, -- 'text', 'document', 'voice', etc.
    
    -- Original input
    input_text TEXT,
    input_metadata JSONB DEFAULT '{}', -- For storing file names, voice duration, etc.
    
    -- Analysis results
    analysis_result JSONB NOT NULL, -- Full analysis including emotions, themes, etc.
    visualization_data JSONB, -- Data used for charts/graphs
    
    -- Profile integration
    profile_insights TEXT, -- Specific insights to add to profile
    profile_updated BOOLEAN DEFAULT false, -- Whether this analysis updated the profile
    profile_changes JSONB, -- Track what changed in the profile
    
    -- Metadata
    session_notes TEXT, -- Psychologist's notes about the session
    tags TEXT[], -- Searchable tags
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analysis_archives_patient ON analysis_archives(patient_id);
CREATE INDEX idx_analysis_archives_psychologist ON analysis_archives(psychologist_id);
CREATE INDEX idx_analysis_archives_created ON analysis_archives(created_at DESC);
CREATE INDEX idx_analysis_archives_type ON analysis_archives(analysis_type);
CREATE INDEX idx_analysis_archives_tags ON analysis_archives USING GIN(tags);

-- Table for tracking profile changes over time
CREATE TABLE IF NOT EXISTS profile_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id INTEGER NOT NULL REFERENCES users(id),
    analysis_archive_id INTEGER REFERENCES analysis_archives(id) ON DELETE SET NULL,
    
    -- Profile versions
    previous_profile TEXT,
    updated_profile TEXT NOT NULL,
    
    -- Change tracking
    change_summary TEXT, -- Human-readable summary of changes
    changes_json JSONB, -- Structured diff of changes
    change_type VARCHAR(50), -- 'manual', 'ai_analysis', 'ai_session', etc.
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profile_history_patient ON profile_history(patient_id);
CREATE INDEX idx_profile_history_created ON profile_history(created_at DESC);
