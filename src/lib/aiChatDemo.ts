// Synthetic retail demo data + answer generation for the AI Chat screen.
// Used as a fallback when no real records exist or the AI service is unavailable.
// Everything produced here is clearly labelled as "Demo data" in the UI.

export type WorkflowId = "general" | "quality" | "compliance" | "audit" | "storefile";

export const DEMO_LOCATIONS = [
  "Kadıköy Mağazası",
  "Bağdat Caddesi Mağazası",
  "Ataşehir Mağazası",
  "İstinyePark Mağazası",
  "Cevahir Mağazası",
];

export const DEMO_TOPICS = [
  "Faturasız iade talepleri",
  "Kampanya fiyatı ile kasa fiyatı uyuşmazlığı",
  "Stok farkları",
  "Hasarlı ürün bildirimleri",
  "Müşteri şikâyetleri",
  "POS bağlantı sorunları",
  "Klima ve mağaza teknik arızaları",
  "Vardiya devir notları",
  "Eksik fotoğraf/kanıtla kapatılan kayıtlar",
  "Aynı prosedürün tekrar tekrar sorulması",
  "Eğitim ihtiyacı oluşan mağazalar",
];

export const DEMO_SOURCES = [
  "WhatsApp İş Mesajları",
  "Kasa / POS Kayıtları",
  "Mağaza Denetim Formları",
  "Mobil Kanıt Akışı",
];

export type DemoRecord = { id: string; topic: string; location: string };

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickRecords(seed: number, topics: string[], count: number): DemoRecord[] {
  const out: DemoRecord[] = [];
  for (let i = 0; i < count; i++) {
    const topic = topics[(seed + i) % topics.length];
    const location = DEMO_LOCATIONS[(seed + i * 3) % DEMO_LOCATIONS.length];
    const id = `REC-${10200 + ((seed + i * 7) % 700)}`;
    out.push({ id, topic, location });
  }
  return out;
}

export type DemoAnswer = {
  markdown: string;
  records: DemoRecord[];
  meta: { recordsAnalysed: number; locations: number; range: string; sources: string[] };
};

// Build a query- and workflow-aware demo answer. Different questions and
// workflows produce different framing, findings and recommended actions.
export function buildDemoAnswer(query: string, workflow: WorkflowId, range: string): DemoAnswer {
  const q = query.toLowerCase();
  const seed = hash(query + workflow);

  // Topic focus from query keywords
  let focusTopics = DEMO_TOPICS;
  let theme = "operational records";
  if (/(iade|return|fatura)/.test(q)) {
    focusTopics = ["Faturasız iade talepleri", "Müşteri şikâyetleri", "Kampanya fiyatı ile kasa fiyatı uyuşmazlığı"];
    theme = "return-related cases";
  } else if (/(stok|stock|discrepan|fark)/.test(q)) {
    focusTopics = ["Stok farkları", "Hasarlı ürün bildirimleri", "Vardiya devir notları"];
    theme = "stock discrepancies";
  } else if (/(şikâ|sikay|complaint|customer|müşteri)/.test(q)) {
    focusTopics = ["Müşteri şikâyetleri", "Faturasız iade talepleri", "POS bağlantı sorunları"];
    theme = "customer complaints";
  } else if (/(photo|foto|kanıt|evidence)/.test(q)) {
    focusTopics = ["Eksik fotoğraf/kanıtla kapatılan kayıtlar", "Hasarlı ürün bildirimleri"];
    theme = "records closed without evidence";
  } else if (/(eğitim|training|prosedür|procedure)/.test(q)) {
    focusTopics = ["Aynı prosedürün tekrar tekrar sorulması", "Eğitim ihtiyacı oluşan mağazalar"];
    theme = "training needs";
  } else if (/(risk|özet|summar)/.test(q)) {
    focusTopics = DEMO_TOPICS;
    theme = "this period's operational risks";
  }

  const records = pickRecords(seed, focusTopics, 4);
  const recordsAnalysed = 80 + (seed % 120);
  const topStore = DEMO_LOCATIONS[seed % DEMO_LOCATIONS.length];
  const secondStore = DEMO_LOCATIONS[(seed + 2) % DEMO_LOCATIONS.length];
  const sources = DEMO_SOURCES.slice(0, 2 + (seed % 3));

  let summary = "";
  let findings: string[] = [];
  let actions: string[] = [];

  switch (workflow) {
    case "quality":
      summary = `Quality review of ${theme} shows that ${topStore} has the highest share of incomplete or low-quality records, mainly due to missing evidence and unclear closure notes.`;
      findings = [
        `${12 + (seed % 9)} records are missing mandatory fields (root cause / evidence).`,
        `${topStore} has the lowest average closure quality score (${58 + (seed % 12)}%).`,
        `${4 + (seed % 5)} cases were closed without any photo or document.`,
      ];
      actions = [
        "Require evidence before a record can be closed.",
        `Run a closure-quality coaching session at ${topStore}.`,
        "Re-open the records that lack mandatory fields.",
      ];
      break;
    case "compliance":
      summary = `Compliance check of ${theme} indicates most closures follow procedure, but a cluster at ${topStore} and ${secondStore} is missing mandatory evidence or approvals.`;
      findings = [
        `${5 + (seed % 6)} closures do not meet the mandatory photo-evidence rule.`,
        `${2 + (seed % 4)} high-impact cases are missing supervisor sign-off.`,
        "Refund/return SOP steps were skipped on a small number of records.",
      ];
      actions = [
        "Flag non-compliant closures for review.",
        "Request supervisor sign-off on the affected cases.",
        "Notify the compliance lead of the gap.",
      ];
      break;
    case "audit":
      summary = `Audit trail for ${theme}: changes are attributable to specific users and timestamps. Several closed records were edited shortly after closing.`;
      findings = [
        `${4 + (seed % 5)} closed records were edited within 48h of closing.`,
        `${1 + (seed % 3)} records were reopened after being marked closed.`,
        "All edits have an identified user and timestamp.",
      ];
      actions = [
        "Review post-close edits with store managers.",
        "Confirm reopen reasons are documented.",
        "Export the change log for the auditor.",
      ];
      break;
    default: // general
      summary = `Looking across ${theme}, ${topStore} and ${secondStore} generate the most activity, with returns and price mismatches as the dominant recurring issues.`;
      findings = [
        `${topStore} receives the most ${theme}.`,
        `Price mismatches between campaign and POS appear in ${8 + (seed % 10)} records.`,
        `${3 + (seed % 4)} stores report the same recurring issue this period.`,
      ];
      actions = [
        `Prioritise a review of ${topStore}.`,
        "Align campaign pricing with POS configuration.",
        "Share a short fix guide with all stores.",
      ];
  }

  const recordLines = records
    .map((r) => `- \`${r.id}\` — ${r.topic} · ${r.location}`)
    .join("\n");

  const markdown = [
    `### Executive summary`,
    summary,
    ``,
    `### Key findings`,
    findings.map((f) => `- ${f}`).join("\n"),
    ``,
    `### Relevant records`,
    recordLines,
    ``,
    `### Recommended actions`,
    actions.map((a, i) => `${i + 1}. ${a}`).join("\n"),
    ``,
    `### Sources`,
    sources.map((s) => `- ${s}`).join("\n"),
  ].join("\n");

  return {
    markdown,
    records,
    meta: { recordsAnalysed, locations: 5, range, sources },
  };
}

// Controlled chunk streamer that mimics a real AI token stream.
export async function streamText(
  text: string,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
  chunkSize = 4,
  delayMs = 18,
): Promise<void> {
  const words = text.split(/(\s+)/);
  let buf = "";
  let count = 0;
  for (const w of words) {
    if (signal.aborted) return;
    buf += w;
    count++;
    if (count >= chunkSize) {
      onChunk(buf);
      buf = "";
      count = 0;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  if (buf && !signal.aborted) onChunk(buf);
}
