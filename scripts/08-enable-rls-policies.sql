-- Enable Row Level Security on all tables
ALTER TABLE lgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE publisher_passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Public read policies for approved content
CREATE POLICY "Public can read approved projects" ON projects
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Public can read images of approved projects" ON project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_images.project_id 
      AND projects.approval_status = 'approved'
    )
  );

CREATE POLICY "Public can read approved comments" ON comments
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Public can read LGAs" ON lgas FOR SELECT USING (true);
CREATE POLICY "Public can read wards" ON wards FOR SELECT USING (true);
CREATE POLICY "Public can read polling units" ON polling_units FOR SELECT USING (true);

-- Admin and creator read policies for pending/rejected content
CREATE POLICY "Admins and creators can read all projects" ON projects
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('super_admin', 'admin') OR
    created_by = (auth.jwt() ->> 'sub')::uuid
  );

CREATE POLICY "Admins and creators can read all comments" ON comments
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('super_admin', 'admin') OR
    created_by = (auth.jwt() ->> 'sub')::uuid
  );

-- Write policies
CREATE POLICY "Publishers can insert projects in their scope" ON projects
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('publisher', 'admin', 'super_admin') AND
    (
      auth.jwt() ->> 'role' IN ('admin', 'super_admin') OR
      (
        lga_id = (auth.jwt() ->> 'lga_id')::uuid AND
        ward_id = (auth.jwt() ->> 'ward_id')::uuid
      )
    )
  );

CREATE POLICY "Only admins can update project approval status" ON projects
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('super_admin', 'admin')
  );

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous users can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous users can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Admin-only policies
CREATE POLICY "Only admins can read users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Only admins can manage passcodes" ON publisher_passcodes
  FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

CREATE POLICY "Only admins can read audit logs" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- Rate limiting policy
CREATE POLICY "Rate limits are managed by system" ON rate_limits
  FOR ALL USING (true);
