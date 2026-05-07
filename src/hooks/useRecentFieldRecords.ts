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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("field_records")
      .select("id, topic, location, status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setRecords((data as FieldRecord[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { records, loading, error, reload: load };
}
