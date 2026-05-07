import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AuditEntry {
  id: string;
  created_at: string;
  ai_client: string | null;
  query_text: string | null;
  sources_accessed: string[] | null;
  user_id: string | null;
}

export function useAuditLog(orgId: string | null) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!orgId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("ai_queries")
      .select("id, created_at, ai_client, query_text, sources_accessed, user_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50);
    setEntries((data as AuditEntry[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, loading, reload };
}
