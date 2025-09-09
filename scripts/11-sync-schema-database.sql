-- Add missing fields to sync Prisma schema with database structure
-- This migration adds all fields that exist in SQL scripts but were missing from Prisma schema

-- Add missing fields to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Add missing fields to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add missing fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS project_category TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_is_active ON comments(is_active);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment_id ON reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_reports_is_resolved ON reports(is_resolved);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);

-- Add comments to document the fields
COMMENT ON COLUMN comments.is_active IS 'Whether the comment is active and visible';
COMMENT ON COLUMN comments.is_approved IS 'Whether the comment has been approved by moderator';
COMMENT ON COLUMN comments.is_flagged IS 'Whether the comment has been flagged for review';
COMMENT ON COLUMN comments.approved_by IS 'User ID who approved the comment';
COMMENT ON COLUMN comments.parent_id IS 'Parent comment ID for nested replies';

COMMENT ON COLUMN reports.comment_id IS 'ID of the comment being reported (if applicable)';
COMMENT ON COLUMN reports.report_type IS 'Type of report (spam, inappropriate, etc.)';
COMMENT ON COLUMN reports.is_resolved IS 'Whether the report has been resolved';
COMMENT ON COLUMN reports.resolved_by IS 'User ID who resolved the report';
COMMENT ON COLUMN reports.resolution_notes IS 'Notes about the resolution';
COMMENT ON COLUMN reports.resolved_at IS 'Timestamp when the report was resolved';

COMMENT ON COLUMN subscriptions.user_id IS 'User ID who created the subscription';
COMMENT ON COLUMN subscriptions.project_category IS 'Specific project category for notifications';
COMMENT ON COLUMN subscriptions.is_active IS 'Whether the subscription is active';
