-- 003_add_patient_details.sql
-- Adds additional patient fields for comprehensive profile

BEGIN;

ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100),
  ADD COLUMN IF NOT EXISTS residence VARCHAR(100),
  ADD COLUMN IF NOT EXISTS therapy_start_date DATE,
  ADD COLUMN IF NOT EXISTS previous_therapy BOOLEAN DEFAULT false;

COMMIT;
