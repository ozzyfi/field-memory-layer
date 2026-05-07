import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logAIQuery } from "@/lib/logAIQuery";

export interface QualityIssueRow {
  id: string;
  problem: string;
  suggestion: string;
  status: string;
}

export interface DataQualityStats {
  qualityScore: number | null;
  evidencedClosed: number;
  missingRootCause: number;
  unmatchedEvidence: number;
  issues: QualityIssueRow[];
}

export function useDataQuality(orgId: string | null) {
  const [data, setData] = useState<DataQualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!orgId) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from("field_records")
        .select("id, status, root_cause, resolution, asset_id, evidence_urls, quality_score, topic")
        .eq("org_id", orgId);

      const records = rows ?? [];
      const scores = records
        .map((r: any) => r.quality_score)
        .filter((v: any): v is number => typeof v === "number");
      const qualityScore = scores.length
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : null;

      const evidencedClosed = records.filter(
        (r: any) => r.status === "closed" && Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0,
      ).length;
      const missingRootCause = records.filter(
        (r: any) => r.status === "closed" && !r.root_cause,
      ).length;
      const unmatchedEvidence = records.filter(
        (r: any) => Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0 && !r.asset_id,
      ).length;

      const issues: QualityIssueRow[] = records
        .filter(
          (r: any) =>
            !r.root_cause ||
            (!r.asset_id && Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0),
        )
        .slice(0, 50)
        .map((r: any) => {
          const missing: string[] = [];
          if (!r.root_cause) missing.push("Kök neden eksik");
          if (!r.asset_id && Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0) {
            missing.push("Eşleşmeyen kanıt");
          }
          const problem = missing.join(" · ");
          let suggestion = "Saha ekibinden eksik bilgiyi talep et";
          if (missing.includes("Eşleşmeyen kanıt")) {
            suggestion = "Kanıtı ilgili ekipmana bağla";
          } else if (missing.includes("Kök neden eksik") && r.status === "closed") {
            suggestion = "Teknisyenden kapanış detayı iste";
          }
          const status =
            r.status === "closed" ? "Bekliyor" : r.status === "pending" ? "Kontrol" : "Önerildi";
          return { id: r.id, problem, suggestion, status };
        });

      if (!cancelled) {
        setData({ qualityScore, evidencedClosed, missingRootCause, unmatchedEvidence, issues });
        setLoading(false);
        logAIQuery({
          orgId,
          query_text: "Data quality audit",
          sources_accessed: ["field_records"],
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, refreshKey]);

  return { data, loading, reload };
}
