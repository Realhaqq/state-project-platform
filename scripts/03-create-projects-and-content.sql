-- Create project status enum
CREATE TYPE project_status AS ENUM ('proposed', 'approved', 'in_progress', 'completed', 'suspended', 'cancelled');

-- Create project categories enum
CREATE TYPE project_category AS ENUM ('infrastructure', 'education', 'healthcare', 'agriculture', 'water', 'electricity', 'roads', 'housing', 'environment', 'social', 'economic', 'other');

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category project_category NOT NULL,
  status project_status DEFAULT 'proposed',
  budget DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  lga_id INTEGER NOT NULL REFERENCES lgas(id),
  ward_id INTEGER REFERENCES wards(id),
  polling_unit_id INTEGER REFERENCES polling_units(id),
  contractor_name VARCHAR(200),
  contractor_contact VARCHAR(100),
  published_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project images table
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
