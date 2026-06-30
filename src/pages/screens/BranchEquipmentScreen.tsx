import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import {
  ArrowRightLeft,
  Tag,
  Trash2,
  Archive,
  Sparkles,
  MapPin,
  CalendarClock,
  Boxes,
  Store,
  DoorOpen,
  Hammer,
  Truck,
  DoorClosed,
  Camera,
  MessageSquare,
  Ruler,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Breadcrumb } from "@/pages/Index";
import { useLanguage } from "@/hooks/useLanguage";

/* -------------------- TYPES & MOCK DATA -------------------- */

type DecisionKey = "keep" | "transfer" | "store" | "sell" | "scrap" | "inspect";
type ProcessType = "closure" | "move" | "renewal" | "candidate";
type FilterType = "all" | ProcessType | "opening" | "equipment";

interface Equipment {
  code: string;
  name: string;
  group: string;
  qty: string;
  condition: string;
  decision: DecisionKey;
  target: string;
  value: string;
}

interface CandidateInfo {
  area: string;
  rent: string;
  rentEn: string;
  frontage: string;
  competitors: string;
  potential: string;
  potentialEn: string;
  aiNote: string;
  aiNoteEn: string;
}

interface BranchFile {
  id: string;
  branch: string;
  process: ProcessType;
  location: string;
  due: string;
  total: number;
  distribution: Partial<Record<DecisionKey, number>>;
  decided: number;
  candidate?: CandidateInfo;
}

const EQUIPMENT: Equipment[] = [
  { code: "EQ-001", name: "Duvar rafı", group: "Raf Sistemleri", qty: "24 metre", condition: "B", decision: "transfer", target: "Ataşehir Şubesi", value: "120.000 TL" },
  { code: "EQ-002", name: "Gondol raf", group: "Raf Sistemleri", qty: "8 adet", condition: "B", decision: "store", target: "Merkez Depo", value: "70.000 TL" },
  { code: "EQ-003", name: "Kasa bankosu", group: "Kasa & Banko", qty: "1 adet", condition: "A", decision: "sell", target: "—", value: "35.000 TL" },
  { code: "EQ-004", name: "Askılık seti", group: "Teşhir", qty: "18 adet", condition: "B", decision: "sell", target: "—", value: "24.000 TL" },
  { code: "EQ-005", name: "Ray spot armatür", group: "Aydınlatma", qty: "30 adet", condition: "C", decision: "scrap", target: "—", value: "8.000 TL" },
  { code: "EQ-006", name: "Soğutucu dolap", group: "Soğutucu", qty: "2 adet", condition: "—", decision: "inspect", target: "Belirlenecek", value: "—" },
];

const BRANCH_FILES: BranchFile[] = [
  { id: "kadikoy", branch: "Kadıköy Mağazası", process: "renewal", location: "İstanbul / Kadıköy", due: "12 Tem 2026", total: 42, distribution: { transfer: 18, store: 11, sell: 7, scrap: 4, inspect: 2 }, decided: 38 },
  { id: "bursa", branch: "Bursa Nilüfer Mağazası", process: "move", location: "Bursa / Nilüfer", due: "28 Tem 2026", total: 31, distribution: { transfer: 12, store: 9, sell: 6, scrap: 3, inspect: 1 }, decided: 22 },
  { id: "ankara", branch: "Ankara Çayyolu Mağazası", process: "closure", location: "Ankara / Çayyolu", due: "05 Ağu 2026", total: 27, distribution: { transfer: 6, store: 7, sell: 8, scrap: 5, inspect: 1 }, decided: 14 },
  {
    id: "izmir",
    branch: "İzmir Alsancak",
    process: "candidate",
    location: "İzmir / Alsancak",
    due: "—",
    total: 0,
    distribution: {},
    decided: 0,
    candidate: {
      area: "210 m²",
      rent: "Orta-yüksek",
      rentEn: "Medium-high",
      frontage: "8,5 m",
      competitors: "3",
      potential: "Yüksek",
      potentialEn: "High",
      aiNote:
        "Cephe görünürlüğü ve yaya trafiği güçlü. Yakın rakip yoğunluğu fiyat hassasiyeti yaratabilir; vitrin alanı kampanya görünürlüğü için avantajlı.",
      aiNoteEn:
        "Strong frontage visibility and foot traffic. Nearby competitor density may create price sensitivity; the window display area is a strong advantage for campaign visibility.",
    },
  },
];

/* -------------------- HELPERS -------------------- */

function decisionStyle(key: DecisionKey): string {
  const map: Record<DecisionKey, string> = {
    keep: "bg-blue-50 text-blue-700 border-blue-200",
    transfer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    store: "bg-purple-50 text-purple-700 border-purple-200",
    sell: "bg-orange-50 text-orange-700 border-orange-200",
    scrap: "bg-red-50 text-red-700 border-red-200",
    inspect: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[key];
}

/* -------------------- COMPONENT -------------------- */

export function BranchEquipmentScreen() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const navigate = useNavigate();
  const [selected, setSelected] = useState<BranchFile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const askAI = (file?: BranchFile) => {
    navigate("/ai-chat");
  };

  const decisionLabel = (key: DecisionKey): string => {
    const tr: Record<DecisionKey, string> = {
      keep: "Sakla",
      transfer: "Başka şubeye aktar",
      store: "Depoya al",
      sell: "Satışa çıkar",
      scrap: "Hurdaya ayır",
      inspect: "Teknik kontrol gerekli",
    };
    const enMap: Record<DecisionKey, string> = {
      keep: "Keep",
      transfer: "Transfer to branch",
      store: "Move to warehouse",
      sell: "Put up for sale",
      scrap: "Scrap",
      inspect: "Needs inspection",
    };
    return en ? enMap[key] : tr[key];
  };

  const processLabel = (p: ProcessType): string => {
    const tr: Record<ProcessType, string> = { closure: "Kapanış", move: "Taşınma", renewal: "Yenileme", candidate: "Yeni Mağaza Adayı" };
    const enMap: Record<ProcessType, string> = { closure: "Closure", move: "Relocation", renewal: "Renewal", candidate: "New Store Candidate" };
    return en ? enMap[p] : tr[p];
  };

  const T = {
    title: en ? "Store Files" : "Mağaza Dosyaları",
    subtitle: en
      ? "Manage openings, closures, renovations, relocations, location photos, and equipment decisions in one operational file."
      : "Açılış, kapanış, yenileme, taşıma, lokasyon fotoğrafları ve ekipman kararlarını tek operasyon dosyasında yönetin.",
    files: en ? "Active Store Files" : "Aktif Mağaza Dosyaları",
    viewDetails: en ? "View Details" : "Detayları Gör",
    process: en ? "File type" : "Dosya tipi",
    location: en ? "Location" : "Lokasyon",
    due: en ? "Due date" : "Son tarih",
    total: en ? "Total equipment" : "Toplam ekipman",
    distribution: en ? "Decision breakdown" : "Karar dağılımı",
    progress: en ? "Decision progress" : "Karar ilerlemesi",
    sample: en ? "Sample store file" : "Örnek mağaza dosyası",
    askAI: en ? "Ask AI" : "AI'a Sor",
    fileTypes: en ? "Store file types" : "Mağaza dosyası tipleri",
  };

  const fileTypes: { icon: React.ComponentType<{ className?: string }>; label: string; desc: string; filter: FilterType; meta?: string }[] = [
    { icon: Boxes, label: en ? "All" : "Tümü", desc: en ? "Show all store files" : "Tüm mağaza dosyalarını göster", filter: "all" },
    { icon: Store, label: en ? "New Store Candidate" : "Yeni Mağaza Adayı", desc: en ? "Evaluate location & opening potential" : "Lokasyon ve açılış potansiyelini değerlendir", filter: "candidate" },
    { icon: DoorOpen, label: en ? "Store Opening" : "Mağaza Açılışı", desc: en ? "Setup, fit-out & launch checklist" : "Kurulum, donanım ve açılış kontrolü", filter: "opening" },
    { icon: Hammer, label: en ? "Renovation" : "Yenileme", desc: en ? "Refresh layout & fixtures" : "Düzen ve donanım yenileme", filter: "renewal" },
    { icon: Truck, label: en ? "Relocation" : "Taşıma", desc: en ? "Move equipment & reopen" : "Ekipman taşıma ve yeniden açılış", filter: "move" },
    { icon: DoorClosed, label: en ? "Closure" : "Kapanış", desc: en ? "Wind-down & asset handling" : "Kapanış ve varlık yönetimi", filter: "closure" },
    { icon: Boxes, label: en ? "Equipment Decisions" : "Ekipman Kararları", desc: en ? "Transfer, sale, scrap & inspection" : "Transfer, satış, hurda ve kontrol", filter: "equipment", meta: en ? "26 pending · 36 transfer · 21 sale · 12 scrap" : "26 karar bekliyor · 36 transfer · 21 satış · 12 hurda" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <Breadcrumb screen="branch-equipment" />
        <div className="mt-4">
          <h1 className="font-serif text-5xl text-foreground">{T.title}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{T.subtitle}</p>
        </div>
      </div>

      {/* File type cards */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">{T.fileTypes}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fileTypes.map((ft) => {
            const Icon = ft.icon;
            const isActive = filter === ft.filter;
            return (
              <button
                key={ft.label}
                onClick={() => setFilter(ft.filter)}
                className={`text-left rounded-lg border p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-copper/50"
                }`}
              >
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground leading-snug">{ft.label}</div>
                  {ft.desc && <div className="text-xs text-muted-foreground mt-1 leading-snug">{ft.desc}</div>}
                  {ft.meta && <div className="text-[11px] text-muted-foreground/70 mt-2 leading-snug">{ft.meta}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </section>


      {/* Branch files */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">
          {filter === "all" && (en ? "Active Store Files" : "Aktif Mağaza Dosyaları")}
          {filter === "candidate" && (en ? "New Store Candidates" : "Yeni Mağaza Adayları")}
          {filter === "opening" && (en ? "Store Opening Files" : "Mağaza Açılış Dosyaları")}
          {filter === "renewal" && (en ? "Renovation Files" : "Yenileme Dosyaları")}
          {filter === "move" && (en ? "Relocation Files" : "Taşıma Dosyaları")}
          {filter === "closure" && (en ? "Closure Files" : "Kapanış Dosyaları")}
          {filter === "equipment" && (en ? "Files with Equipment Decisions" : "Ekipman Kararı İçeren Dosyalar")}
        </h2>
        {(() => {
          const filteredFiles = BRANCH_FILES.filter((f) => {
            if (filter === "all") return true;
            if (filter === "equipment") return f.total > 0;
            return f.process === filter;
          });
          if (filteredFiles.length === 0) {
            return (
              <div className="rounded-lg border border-dashed border-border p-10 text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Inbox className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground">
                  {en ? "No store files found for this type." : "Bu tipte mağaza dosyası bulunmuyor."}
                </div>
              </div>
            );
          }
          return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map((f) => {
            const isCandidate = f.process === "candidate";
            const pct = f.total > 0 ? Math.round((f.decided / f.total) * 100) : 0;
            return (
              <div key={f.id} className="rounded-lg border border-border bg-card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-medium text-foreground">{f.branch}</h3>
                  <span className="shrink-0 inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {processLabel(f.process)}
                  </span>
                </div>

                <div className="mt-1 text-[11px] text-muted-foreground/70">{T.sample}</div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{f.location}</div>
                  {!isCandidate && <div className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" />{T.due}: {f.due}</div>}
                  {!isCandidate && <div className="flex items-center gap-2"><Boxes className="h-3.5 w-3.5" />{T.total}: {f.total}</div>}
                  {isCandidate && f.candidate && (
                    <>
                      <div className="flex items-center gap-2"><Ruler className="h-3.5 w-3.5" />{en ? "Area" : "Alan"}: {f.candidate.area}</div>
                      <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5" />{en ? "Frontage" : "Cephe"}: {f.candidate.frontage}</div>
                    </>
                  )}
                </div>

                {!isCandidate && (
                  <>
                    <div className="mt-4">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{T.distribution}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.entries(f.distribution) as [DecisionKey, number][]).map(([k, n]) => (
                          <span key={k} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${decisionStyle(k)}`}>
                            {decisionLabel(k)}: {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                        <span>{T.progress}</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-copper transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => { setSelected(f); setDrawerOpen(true); }}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 transition-colors"
                  >
                    {T.viewDetails}
                  </button>
                  <button
                    onClick={() => askAI(f)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card text-sm font-medium px-3 py-2 text-foreground hover:border-copper/50 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-copper" />
                    {T.askAI}
                  </button>
                </div>
              </div>
            );
          })}
            </div>
          );
        })()}
      </section>

      {/* Detail drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <DetailContent
              file={selected}
              en={en}
              decisionLabel={decisionLabel}
              processLabel={processLabel}
              onAskAI={() => askAI(selected)}
            />
          )}

        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------- DRAWER CONTENT -------------------- */

function DetailContent({
  file,
  en,
  decisionLabel,
  processLabel,
  onAskAI,
}: {
  file: BranchFile;
  en: boolean;
  decisionLabel: (k: DecisionKey) => string;
  processLabel: (p: ProcessType) => string;
  onAskAI: () => void;
}) {
  const tabs = {
    info: en ? "General Info" : "Genel Bilgi",
    photos: en ? "Location Photos" : "Lokasyon Fotoğrafları",
    list: en ? "Equipment List" : "Ekipman Listesi",
    transfer: en ? "Transfer Plan" : "Transfer Planı",
    sale: en ? "For Sale" : "Satışa Çıkanlar",
    scrap: en ? "Scrap / Recycling" : "Hurda / Geri Dönüşüm",
    report: en ? "Closure Report" : "Kapanış Raporu",
  };

  const photoCards = en
    ? ["Street view", "Store frontage", "Window display area", "Nearby surroundings", "Competitor stores"]
    : ["Cadde görünümü", "Mağaza cephesi", "Vitrin alanı", "Yakın çevre", "Rakip mağazalar"];

  const sellList = EQUIPMENT.filter((e) => e.decision === "sell");
  const transferList = EQUIPMENT.filter((e) => e.decision === "transfer" || e.decision === "store");
  const scrapList = EQUIPMENT.filter((e) => e.decision === "scrap" || e.decision === "inspect");


  const colHead = (
    <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
      <th className="py-2 pr-3 font-medium">{en ? "Code" : "Kod"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Name" : "Ekipman"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Group" : "Ürün grubu"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Qty" : "Adet/metre"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Cond." : "Kondisyon"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Decision" : "Karar"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Target" : "Hedef"}</th>
      <th className="py-2 pr-3 font-medium">{en ? "Value" : "Değer"}</th>
      <th className="py-2 font-medium">{en ? "Action" : "Aksiyon"}</th>
    </tr>
  );

  const renderRows = (items: Equipment[]) =>
    items.map((e) => (
      <tr key={e.code} className="border-b border-border/60 text-sm">
        <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{e.code}</td>
        <td className="py-2.5 pr-3 text-foreground">{e.name}</td>
        <td className="py-2.5 pr-3 text-muted-foreground">{e.group}</td>
        <td className="py-2.5 pr-3 text-muted-foreground">{e.qty}</td>
        <td className="py-2.5 pr-3 text-muted-foreground">{e.condition}</td>
        <td className="py-2.5 pr-3">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${decisionStyle(e.decision)}`}>
            {decisionLabel(e.decision)}
          </span>
        </td>
        <td className="py-2.5 pr-3 text-muted-foreground">{e.target}</td>
        <td className="py-2.5 pr-3 text-foreground">{e.value}</td>
        <td className="py-2.5">
          <button className="text-xs text-primary hover:underline">{en ? "Edit" : "Düzenle"}</button>
        </td>
      </tr>
    ));

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="font-serif text-2xl">{file.branch}</SheetTitle>
        <SheetDescription>
          {processLabel(file.process)} · {file.location}
          {file.total > 0 ? ` · ${file.total} ${en ? "equipment" : "ekipman"}` : ""}
        </SheetDescription>
        <div className="mt-1 text-[11px] text-muted-foreground/70">{en ? "Sample store file" : "Örnek mağaza dosyası"}</div>
        <button
          onClick={onAskAI}
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-card text-sm font-medium px-3 py-2 text-foreground hover:border-copper/50 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5 text-copper" />
          {en ? "Ask AI" : "AI'a Sor"}
        </button>
      </SheetHeader>

      <div className="mt-6">
        <AIBox en={en} />
      </div>

      <Tabs defaultValue="info" className="mt-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="info">{tabs.info}</TabsTrigger>
          <TabsTrigger value="photos">{tabs.photos}</TabsTrigger>
          <TabsTrigger value="list">{tabs.list}</TabsTrigger>
          <TabsTrigger value="transfer">{tabs.transfer}</TabsTrigger>
          <TabsTrigger value="sale">{tabs.sale}</TabsTrigger>
          <TabsTrigger value="scrap">{tabs.scrap}</TabsTrigger>
          <TabsTrigger value="report">{tabs.report}</TabsTrigger>
        </TabsList>

        {/* General info */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              [en ? "File type" : "Dosya tipi", processLabel(file.process)],
              [en ? "Location" : "Lokasyon", file.location],
              [en ? "Due date" : "Son tarih", file.due],
              [en ? "Total equipment" : "Toplam ekipman", String(file.total)],
              ...(file.candidate
                ? ([
                    [en ? "Area" : "Alan", file.candidate.area],
                    [en ? "Rent level" : "Kira seviyesi", en ? file.candidate.rentEn : file.candidate.rent],
                    [en ? "Frontage width" : "Cephe genişliği", file.candidate.frontage],
                    [en ? "Nearby competitors" : "Yakın rakipler", file.candidate.competitors],
                    [en ? "Opening potential" : "Açılış potansiyeli", en ? file.candidate.potentialEn : file.candidate.potential],
                  ] as [string, string][])
                : []),
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-card p-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</div>
                <div className="text-sm text-foreground mt-1.5">{v || "—"}</div>
              </div>
            ))}
          </div>
          {file.candidate && (file.candidate.aiNote || file.candidate.aiNoteEn) && (
            <div className="rounded-lg border border-copper/30 bg-copper/5 p-4">
              <div className="flex items-center gap-2 text-copper mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{en ? "AI note" : "AI notu"}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {en ? file.candidate.aiNoteEn : file.candidate.aiNote}
              </p>
            </div>
          )}
        </TabsContent>


        {/* Location photos */}
        <TabsContent value="photos" className="space-y-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {en ? "Demo placeholders — real photo upload is not active yet." : "Örnek görseller — gerçek fotoğraf yükleme henüz aktif değil."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoCards.map((label) => (
              <div key={label} className="rounded-lg border border-border bg-muted/40 aspect-[4/3] flex flex-col items-center justify-center gap-2 text-center px-3">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </TabsContent>


        {/* Equipment list */}
        <TabsContent value="list" className="space-y-5">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              {en ? "Equipment Decision Summary" : "Ekipman Karar Özeti"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {([
                ["transfer", en ? "Transfer to another store" : "Başka şubeye aktarılacak", 36],
                ["store", en ? "Move to warehouse" : "Depoya alınacak", 27],
                ["sell", en ? "Put up for sale" : "Satışa çıkarılacak", 21],
                ["scrap", en ? "Scrap / recycling" : "Hurda / geri dönüşüm", 12],
                ["inspect", en ? "Awaiting technical inspection" : "Teknik kontrol bekleyen", 4],
              ] as [DecisionKey, string, number][]).map(([k, label, n]) => (
                <span key={k} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${decisionStyle(k)}`}>
                  {label}
                  <span className="font-semibold">{n}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]"><thead>{colHead}</thead><tbody>{renderRows(EQUIPMENT)}</tbody></table>
          </div>
        </TabsContent>


        {/* Transfer plan */}
        <TabsContent value="transfer">
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            {en ? "Equipment to transfer to other branches or warehouse." : "Başka şubelere veya depoya aktarılacak ekipmanlar."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]"><thead>{colHead}</thead><tbody>{renderRows(transferList)}</tbody></table>
          </div>
        </TabsContent>

        {/* For sale */}
        <TabsContent value="sale">
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {en ? "Equipment marked for sale." : "Satışa çıkarılacak ekipmanlar."}
            </p>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-2 hover:bg-primary/90 transition-colors">
              <Archive className="h-3.5 w-3.5" />
              {en ? "Send to closed buyer network" : "Kapalı alıcı ağına gönder"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]"><thead>{colHead}</thead><tbody>{renderRows(sellList)}</tbody></table>
          </div>
        </TabsContent>

        {/* Scrap / recycling */}
        <TabsContent value="scrap">
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {en ? "Equipment to scrap, recycle or technically inspect." : "Hurdaya ayrılacak, geri dönüştürülecek veya teknik kontrol bekleyen ekipmanlar."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]"><thead>{colHead}</thead><tbody>{renderRows(scrapList)}</tbody></table>
          </div>
        </TabsContent>

        {/* Closure report */}
        <TabsContent value="report" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-foreground mb-2">{tabs.report}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {en
                ? "During the Kadıköy branch renewal, 42 pieces of equipment were recorded. 18 will be transferred to other branches, 11 moved to the warehouse, 7 put up for sale, 4 scrapped, and 2 are awaiting technical inspection."
                : "Kadıköy Şubesi yenileme sürecinde 42 ekipman kaydedildi. 18 ekipman başka şubelere aktarılacak, 11 ekipman depoya alınacak, 7 ekipman satışa çıkarılacak, 4 ekipman hurdaya ayrılacak, 2 ekipman teknik kontrol bekliyor."}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function AIBox({ en }: { en: boolean }) {
  return (
    <div className="rounded-lg border border-copper/30 bg-copper/5 p-5">
      <div className="flex items-center gap-2 text-copper mb-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">{en ? "AI Recommendation" : "AI Önerisi"}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {en
          ? "In this store file, location visibility, equipment decisions, and opening/closure risk should be evaluated together. AI creates a summary and action recommendation from photos, equipment lists, and the file type."
          : "Bu mağaza dosyasında lokasyon görünürlüğü, ekipman kararları ve açılış/kapanış riski birlikte değerlendirilmelidir. Fotoğraflar, ekipman listesi ve dosya tipi üzerinden AI özet ve aksiyon önerisi oluşturur."}
      </p>
    </div>
  );
}
