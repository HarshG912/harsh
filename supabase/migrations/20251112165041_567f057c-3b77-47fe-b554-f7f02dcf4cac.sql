-- Set default plan to 'standard' for all existing tenants
UPDATE tenants SET plan = 'standard' WHERE plan IS NULL OR plan = '';

-- Ensure all new tenants get 'standard' plan by default
ALTER TABLE tenants ALTER COLUMN plan SET DEFAULT 'standard';