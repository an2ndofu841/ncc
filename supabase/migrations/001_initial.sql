-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  member_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  clinic_name TEXT,
  member_type TEXT NOT NULL DEFAULT 'regular' CHECK (member_type IN ('regular','associate','student','supporting','honorary')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('system_admin','office_staff','editor','member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended','withdrawn')),
  qualifications TEXT,
  practice_years INT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  business_hours TEXT,
  service_area TEXT,
  description TEXT,
  prefecture TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  clinic_name TEXT,
  qualifications TEXT,
  practice_years INT,
  desired_member_type TEXT NOT NULL DEFAULT 'regular',
  remarks TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (status IN ('unreviewed','reviewing','awaiting_documents','under_examination','approved','rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- News table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'notice' CHECK (category IN ('notice','important','seminar_info','member_only')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_member_only BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seminars table
CREATE TABLE seminars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  instructor TEXT,
  capacity INT NOT NULL DEFAULT 30,
  fee INT NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','cancelled')),
  current_participants INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seminar registrations
CREATE TABLE seminar_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES seminars(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seminar_id, member_id)
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','membership','seminar','complaint','other')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Static pages table
CREATE TABLE static_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_members_auth_id ON members(auth_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_prefecture ON members(prefecture);
CREATE INDEX idx_members_is_public ON members(is_public);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_seminars_status ON seminars(status);
CREATE INDEX idx_seminars_date ON seminars(date);
CREATE INDEX idx_documents_published ON documents(is_published);
CREATE INDEX idx_contacts_read ON contacts(is_read);
CREATE INDEX idx_static_pages_slug ON static_pages(slug);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER seminars_updated_at BEFORE UPDATE ON seminars FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Public read for published news
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (is_published = true AND is_member_only = false);
-- Members can read member-only news
CREATE POLICY "Members can read member news" ON news FOR SELECT USING (
  is_published = true AND EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid())
);

-- Public can read published seminars
CREATE POLICY "Public can read published seminars" ON seminars FOR SELECT USING (status = 'published');

-- Public can read published documents (none — members only via server)
CREATE POLICY "Members can read documents" ON documents FOR SELECT USING (
  is_published = true AND EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid())
);

-- Members can read own profile
CREATE POLICY "Members can read own profile" ON members FOR SELECT USING (auth_id = auth.uid());
-- Members can update own profile
CREATE POLICY "Members can update own profile" ON members FOR UPDATE USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());
-- Public can see public members
CREATE POLICY "Public can see public members" ON members FOR SELECT USING (is_public = true AND status = 'active');

-- Registrations: members can read own
CREATE POLICY "Members can read own registrations" ON seminar_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM members WHERE id = member_id AND auth_id = auth.uid())
);
CREATE POLICY "Members can insert own registrations" ON seminar_registrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = member_id AND auth_id = auth.uid())
);

-- Anyone can insert contacts and applications
CREATE POLICY "Anyone can insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert applications" ON applications FOR INSERT WITH CHECK (true);

-- Public can read published static pages
CREATE POLICY "Public can read published pages" ON static_pages FOR SELECT USING (is_published = true);

-- Admin policies (service role bypasses RLS)
CREATE POLICY "Admins full access members" ON members FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access applications" ON applications FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff','editor'))
);
CREATE POLICY "Admins full access seminars" ON seminars FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access seminar_registrations" ON seminar_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access contacts" ON contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff'))
);
CREATE POLICY "Admins full access static_pages" ON static_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM members m WHERE m.auth_id = auth.uid() AND m.role IN ('system_admin','office_staff','editor'))
);

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
