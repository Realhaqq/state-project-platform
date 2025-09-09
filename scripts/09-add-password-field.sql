-- Add password column to users table
-- This migration adds the password field that was missing from the original schema

ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment to document the password hashing
COMMENT ON COLUMN users.password IS 'Hashed password using bcrypt with salt rounds = 12';
