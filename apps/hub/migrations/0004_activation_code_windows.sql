ALTER TABLE activation_codes ADD COLUMN code_expires_at TEXT;
ALTER TABLE activation_codes ADD COLUMN unlock_duration_minutes INTEGER NOT NULL DEFAULT 60;
