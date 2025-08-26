-- Initial database setup migration
-- Run this file to create the initial database structure

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_type_enum AS ENUM ('psychologist', 'patient');
CREATE TYPE session_type_enum AS ENUM ('journaling', 'analysis', 'what_if', 'assessment');
CREATE TYPE session_status_enum AS ENUM ('active', 'completed', 'archived');
CREATE TYPE theme_category_enum AS ENUM ('emotion', 'behavior', 'thought', 'relationship', 'event');
CREATE TYPE sentiment_enum AS ENUM ('positive', 'negative', 'neutral', 'mixed');
CREATE TYPE significance_enum AS ENUM ('high', 'medium', 'low');
CREATE TYPE event_type_enum AS ENUM ('milestone', 'therapy', 'stress', 'achievement', 'setback', 'insight');
CREATE TYPE impact_enum AS ENUM ('positive', 'negative', 'neutral');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Migration metadata
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (migration_name) VALUES ('001_initial_setup');
