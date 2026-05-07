import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface FieldRecord {
  id: string;
  topic: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

export function useRecentFieldRecords(orgId: string | null, refreshKey = 0) {
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("field_records")
      .select("id, topic, location, status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10);
    setRecords((data as FieldRecord[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { records, loading, reload: load };
}
