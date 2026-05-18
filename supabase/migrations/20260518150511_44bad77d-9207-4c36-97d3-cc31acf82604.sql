-- Create private storage bucket for plan PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('plan-pdfs', 'plan-pdfs', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Deny-all RLS for anon/authenticated on this bucket's objects.
-- Only the service role (used by edge functions) can read/write.
CREATE POLICY "deny_all_plan_pdfs_select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id <> 'plan-pdfs');

CREATE POLICY "deny_all_plan_pdfs_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id <> 'plan-pdfs');

CREATE POLICY "deny_all_plan_pdfs_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'plan-pdfs');

CREATE POLICY "deny_all_plan_pdfs_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id <> 'plan-pdfs');