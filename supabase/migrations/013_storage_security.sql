-- Private bucket for application attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: uploads bucket (public, for column images)
-- Only admins/editors can upload to the uploads bucket
CREATE POLICY "Admins can upload to uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff', 'editor')
  )
);

CREATE POLICY "Admins can update uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff', 'editor')
  )
);

CREATE POLICY "Admins can delete from uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads'
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff', 'editor')
  )
);

CREATE POLICY "Public can read uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Storage RLS: applications bucket (private)
CREATE POLICY "Service role manages applications bucket"
ON storage.objects FOR ALL
USING (
  bucket_id = 'applications'
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_id = auth.uid()
    AND role IN ('system_admin', 'office_staff')
  )
);
