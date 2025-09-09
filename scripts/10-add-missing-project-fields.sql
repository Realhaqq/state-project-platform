-- Add missing fields to projects table
-- This migration adds completion_percentage and is_published fields that were missing from the Prisma schema

ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_completion_percentage ON projects(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);

-- Add comments to document the fields
COMMENT ON COLUMN projects.completion_percentage IS 'Project completion percentage (0-100)';
COMMENT ON COLUMN projects.is_published IS 'Whether the project is published and visible to the public';
