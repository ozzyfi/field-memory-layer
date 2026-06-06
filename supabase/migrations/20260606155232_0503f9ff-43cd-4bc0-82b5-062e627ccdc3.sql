CREATE OR REPLACE FUNCTION public.org_has_members(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = _org_id);
$$;

CREATE OR REPLACE FUNCTION public.is_org_manager(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role IN ('owner', 'admin')
  );
$$;

DROP POLICY IF EXISTS "Members can join their organization" ON public.organization_members;

CREATE POLICY "Founders or managers can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND NOT public.org_has_members(org_id))
  OR public.is_org_manager(auth.uid(), org_id)
);