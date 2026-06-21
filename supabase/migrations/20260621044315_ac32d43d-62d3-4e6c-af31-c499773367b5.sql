-- Minimal evidence metadata table for chat source previews (MVP).
CREATE TABLE IF NOT EXISTS public.record_evidence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  field_record_id uuid REFERENCES public.field_records(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text,
  mime_type text,
  caption text,
  ocr_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.record_evidence TO authenticated;
GRANT ALL ON public.record_evidence TO service_role;

ALTER TABLE public.record_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view evidence"
ON public.record_evidence FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can add evidence"
ON public.record_evidence FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can update evidence"
ON public.record_evidence FOR UPDATE TO authenticated
USING (public.is_org_member(auth.uid(), org_id))
WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can delete evidence"
ON public.record_evidence FOR DELETE TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

CREATE INDEX IF NOT EXISTS idx_record_evidence_org ON public.record_evidence(org_id);
CREATE INDEX IF NOT EXISTS idx_record_evidence_record ON public.record_evidence(field_record_id);

-- Storage policies for the private "evidence" bucket.
-- Convention: files are stored under "<org_id>/..." so the first path segment
-- identifies the owning organization.
CREATE POLICY "Org members can read evidence files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'evidence'
  AND public.is_org_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Org members can upload evidence files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence'
  AND public.is_org_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Org members can delete evidence files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence'
  AND public.is_org_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
);