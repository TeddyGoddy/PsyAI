-- Demo data for development and testing
-- Insert demo users
INSERT INTO users (email, password_hash, first_name, last_name, user_type, license_number, specializations, years_experience) VALUES
('psicologo@demo.com', '$2b$12$LQv3c1yqBwEHXw.9UF0YSOeIx9CoqrWOwzs2uQcHK/BjShVxqZXLy', 'Dr. Marco', 'Rossi', 'psychologist', 'PSY-12345', ARRAY['Anxiety Disorders', 'CBT', 'Trauma Therapy'], 8),
('paziente@demo.com', '$2b$12$LQv3c1yqBwEHXw.9UF0YSOeIx9CoqrWOwzs2uQcHK/BjShVxqZXLy', 'Anna', 'Bianchi', 'patient', NULL, NULL, NULL);

-- Insert user preferences
INSERT INTO user_preferences (user_id, language, notifications_email, notifications_reminders) VALUES
(1, 'it', true, true),
(2, 'it', true, false);

-- Insert demo sessions
INSERT INTO sessions (user_id, session_type, title, content, duration_minutes, emotional_state, status) VALUES
(2, 'journaling', 'Riflessioni sulla giornata', 'Oggi mi sono sentita particolarmente ansiosa riguardo al lavoro. Ho notato che quando ho delle scadenze importanti tendo a procrastinare...', 30, '{"mood": 5, "anxiety": 7, "energy": 4}', 'completed'),
(2, 'analysis', 'Analisi pattern comportamentali', 'Esplorazione dei meccanismi di evitamento in situazioni sociali', 45, '{"mood": 6, "anxiety": 6, "energy": 5}', 'completed');

-- Insert demo emotional timeline data
INSERT INTO emotional_timeline (user_id, session_id, recorded_date, mood_score, anxiety_score, energy_score, stress_score) VALUES
(2, 1, '2024-01-15', 5, 7, 4, 6),
(2, 2, '2024-01-20', 6, 6, 5, 5),
(2, NULL, '2024-01-25', 7, 4, 6, 4);

-- Insert demo themes
INSERT INTO themes (user_id, name, category, frequency, sentiment, confidence_score) VALUES
(2, 'ansia lavorativa', 'emotion', 8, 'negative', 0.85),
(2, 'procrastinazione', 'behavior', 5, 'negative', 0.78),
(2, 'crescita personale', 'thought', 3, 'positive', 0.72);

-- Insert demo timeline events
INSERT INTO timeline_events (user_id, event_date, event_type, title, description, impact, intensity) VALUES
(2, '2024-01-10', 'therapy', 'Inizio terapia', 'Prima sessione con il terapeuta', 'positive', 4),
(2, '2024-01-20', 'stress', 'Presentazione importante', 'Presentazione di progetto al lavoro', 'negative', 3),
(2, '2024-01-25', 'achievement', 'Obiettivo raggiunto', 'Completato corso di mindfulness', 'positive', 4);

-- Insert demo insights
INSERT INTO insights (user_id, category, title, description, confidence_score, actionable, suggestions) VALUES
(2, 'behavioral', 'Pattern di evitamento identificato', 'Si nota una tendenza ad evitare situazioni sociali quando i livelli di ansia sono elevati', 0.82, true, ARRAY['Praticare tecniche di esposizione graduale', 'Utilizzare esercizi di respirazione prima degli eventi sociali']);
