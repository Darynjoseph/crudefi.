-- Migration: Add role and role_rate fields to shifts table
-- This migration supports dynamic role-based payments

-- Add new columns to shifts table
ALTER TABLE shifts 
ADD COLUMN role VARCHAR REFERENCES roles(role_name),
ADD COLUMN role_rate DECIMAL;

-- Add constraint to ensure unique salary record per shift
ALTER TABLE salary_records 
ADD CONSTRAINT unique_salary_per_shift UNIQUE (shift_id);

-- Update existing shifts to have a default role (if any exist)
-- Note: This assumes you have at least one role in the roles table
-- You may need to adjust this based on your existing data
UPDATE shifts 
SET role = (SELECT role_name FROM roles LIMIT 1),
    role_rate = (SELECT base_daily_rate FROM roles LIMIT 1)
WHERE role IS NULL;

-- Make role column NOT NULL after setting defaults
ALTER TABLE shifts 
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN role_rate SET NOT NULL;

-- Add index for better performance on role lookups
CREATE INDEX idx_shifts_role ON shifts(role);

-- Add check constraint to ensure role_rate is positive
ALTER TABLE shifts 
ADD CONSTRAINT check_positive_role_rate CHECK (role_rate > 0);
