-- Sessions table for tracking user interactions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('journaling', 'analysis', 'what_if', 'assessment')),
    title VARCHAR(255),
    content TEXT,
    duration_minutes INTEGER,
    emotional_state JSONB, -- Store mood, anxiety, energy levels
    ai_analysis JSONB, -- Store AI analysis results
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Session responses table for Q&A interactions
CREATE TABLE session_responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    response_text TEXT,
    question_type VARCHAR(50) DEFAULT 'open_ended',
    question_category VARCHAR(50),
    response_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_generated BOOLEAN DEFAULT false,
    sequence_order INTEGER
);

-- Documents table for uploaded files
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    mime_type VARCHAR(100),
    analysis_results JSONB,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending'
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_type ON sessions(session_type);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_processed ON documents(processed);
