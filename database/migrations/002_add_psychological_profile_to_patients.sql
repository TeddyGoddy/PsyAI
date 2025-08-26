-- 002_add_psychological_profile_to_patients.sql
-- Adds a TEXT column to store clinician-authored psychological profile text

BEGIN;

ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS psychological_profile TEXT;

COMMIT;
