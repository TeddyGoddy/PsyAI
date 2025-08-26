-- 004_add_patient_names.sql
-- Adds first_name and last_name fields to patients table

BEGIN;

ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

COMMIT;
