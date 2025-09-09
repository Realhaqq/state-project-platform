-- Add trigram extension for search suggestions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index for search suggestions
CREATE INDEX IF NOT EXISTS idx_projects_title_trigram ON projects USING gin (title gin_trgm_ops);

-- Add hero slider images table
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Insert default hero images
INSERT INTO hero_images (title, description, image_url, sort_order, active) VALUES
('Niger State Development', 'Building a better future for all citizens', '/niger-state-development-infrastructure-projects.jpg', 1, true),
('Community Engagement', 'Transparent governance through citizen participation', '/government-transparency-community-meeting.jpg', 2, true),
('Infrastructure Progress', 'Modern infrastructure for sustainable development', '/community-engagement-town-hall-meeting.jpg', 3, true),
('Digital Transformation', 'Leveraging technology for efficient service delivery', '/niger-state-digital-government-services.jpg', 4, true)
ON CONFLICT DO NOTHING;

-- Add function to log project status changes
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_status_history (project_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project status changes
DROP TRIGGER IF EXISTS trigger_log_project_status_change ON projects;
CREATE TRIGGER trigger_log_project_status_change
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_status_change();

-- Add updated_by column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  window_starts_at TIMESTAMPTZ NOT NULL,
  count INTEGER DEFAULT 1,
  UNIQUE(key, window_starts_at)
);

-- Add index for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits(key, window_starts_at);

-- Add quarterly reports table
CREATE TABLE IF NOT EXISTS quarterly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  lga_id UUID REFERENCES lgas(id),
  ward_id UUID REFERENCES wards(id),
  report_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  UNIQUE(quarter, year, lga_id, ward_id)
);
