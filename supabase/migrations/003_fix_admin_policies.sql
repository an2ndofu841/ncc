-- SECURITY DEFINER functions to avoid recursive RLS issues

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff', 'editor')
  );
$$;

-- Drop old admin policies and recreate with helper functions

DROP POLICY IF EXISTS "Admins full access members" ON members;
CREATE POLICY "Admins full access members" ON members FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access applications" ON applications;
CREATE POLICY "Admins full access applications" ON applications FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access news" ON news;
CREATE POLICY "Admins full access news" ON news FOR ALL USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admins full access seminars" ON seminars;
CREATE POLICY "Admins full access seminars" ON seminars FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access seminar_registrations" ON seminar_registrations;
CREATE POLICY "Admins full access seminar_registrations" ON seminar_registrations FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access documents" ON documents;
CREATE POLICY "Admins full access documents" ON documents FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access contacts" ON contacts;
CREATE POLICY "Admins full access contacts" ON contacts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access static_pages" ON static_pages;
CREATE POLICY "Admins full access static_pages" ON static_pages FOR ALL USING (public.is_admin_or_editor());
