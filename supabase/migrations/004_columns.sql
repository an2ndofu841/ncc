-- Column articles table
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  author_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_member_only BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_columns_published ON columns(is_published, published_at DESC);
CREATE INDEX idx_columns_slug ON columns(slug);
CREATE INDEX idx_columns_category ON columns(category);

CREATE TRIGGER columns_updated_at BEFORE UPDATE ON columns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Public can read published columns (non member-only)
CREATE POLICY "Public can read published columns" ON columns
  FOR SELECT USING (is_published = true AND is_member_only = false);

-- Members can read all published columns
CREATE POLICY "Members can read all published columns" ON columns
  FOR SELECT USING (
    is_published = true AND EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid())
  );

-- Admin full access
CREATE POLICY "Admins full access columns" ON columns
  FOR ALL USING (public.is_admin_or_editor());
