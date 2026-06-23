// Lightweight dictionary-based i18n for saha.team (frontend-only).
// Default language: Turkish. No external i18n library.

export type Lang = "tr" | "en";

export const LANG_STORAGE_KEY = "saha:lang";
export const DEFAULT_LANG: Lang = "tr";

type Dict = Record<string, string>;

const tr: Dict = {
  // Navigation
  "nav.dashboard": "Genel Bakış",
  "nav.ai-chat": "WhatsApp Asistanı",
  "nav.data-sources": "Bilgi Kaynakları",
  "nav.ai-clients": "Entegrasyonlar",
  "nav.data-quality": "Veri Kalitesi",
  "nav.api": "API / MCP",
  "nav.audit": "Denetim Kayıtları",
  "nav.billing": "Plan / Kullanım",

  // Dashboard
  "dashboard.title": "Merkez Panel",
  "dashboard.subtitle":
    "WhatsApp’tan gelen saha mesajlarını mağaza kayıtlarına, CRM notlarına ve yönetici içgörülerine dönüştürün.",
  "metric.whatsapp": "WhatsApp mesajı",
  "metric.records": "Açılan saha kaydı",
  "metric.crm": "CRM’e işlenen not",
  "metric.critical": "Açık kritik konu",
  "metric.training": "Eğitim ihtiyacı",
  "metric.timeSaved": "Kurtarılan yönetici zamanı",

  // AI modes
  "mode.general": "Genel Arama",
  "mode.quality": "Kalite Kontrol",
  "mode.compliance": "Prosedür Kontrolü",
  "mode.audit": "Denetim Geçmişi",

  // Dashboard (existing metrics & chart)
  "dashboard.lead": "AI-ready saha verisi, veri kalitesi ve kullanım performansı.",
  "dashboard.opsPerformance": "Operasyon Performansı",
  "metric.aiReady": "AI-ready kayıt",
  "metric.qualityScore": "Veri kalite puanı",
  "metric.evidencedClosure": "Kanıtlı kapanış",
  "metric.queriesPeriod": "Sorgu bu dönem",
  "chart.records": "Kayıt",
  "chart.queries": "Sorgu",
  "chart.noData": "Henüz kayıt yok — ilk saha verisini ekleyin",
  "card.aiClients.title": "Entegrasyonlar",
  "card.aiClients.text": "Claude, ChatGPT, Copilot veya local LLM bağlantısı kurun.",
  "card.dataSources.title": "Bilgi Kaynakları",
  "card.dataSources.text": "WhatsApp, servis formu, doküman, fotoğraf ve ERP verilerini bağlayın.",
  "card.api.title": "API Anahtarları",
  "card.api.text": "Kurumsal AI ajanları için güvenli API ve MCP erişimi oluşturun.",
  "card.quality.title": "Kalite Puanı",
  "card.quality.text": "Eksik kök neden, kanıtsız kapanış ve eşleşmeyen kayıtları görün.",
  "ai.askTitle": "saha.team’e sor",
  "ai.askSubtitle": "Operasyonel hafızanızı arayın, analiz edin ve gözden geçirin.",
  "ai.preparing": "Çalışma alanı hazırlanıyor…",
  "ai.generating": "Cevap oluşturuluyor…",
  "ai.history": "Geçmiş",
  "ai.newChat": "Yeni sohbet",
  "ai.chatHistory": "Sohbet geçmişi",
  "ai.noConversations": "Henüz sohbet yok.",
  "ai.stop": "Durdur",
  "ai.send": "Gönder",
  "ai.copy": "Kopyala",
  "ai.copied": "Kopyalandı",
  "ai.retry": "Tekrar dene",
  "ai.openSources": "Kaynakları aç",
  "ai.stopped": "Durduruldu.",
  "ai.demoData": "Örnek veri",
  "ai.records": "kayıt",


  // Status labels
  "status.open": "Açık",
  "status.closed": "Kapalı",
  "status.pending": "Beklemede",
  "status.critical": "Kritik",
  "status.medium": "Orta",
  "status.low": "Düşük",
  "status.connected": "Bağlı",
  "status.setup": "Kurulum gerekli",
  "status.error": "Hata var",
  "status.sample": "Örnek veri",

  // Buttons & empty states
  "btn.addRecord": "Saha Kaydı Ekle",
  "btn.openRecord": "Kaydı Aç",
  "btn.whatsappReply": "WhatsApp Yanıtı",
  "btn.crmNote": "CRM Notu",
  "btn.viewDetails": "Detayları Gör",
  "btn.cancel": "İptal",
  "btn.contact": "Bize ulaşın",
  "empty.records": "Henüz saha kaydı yok. Demo için ilk mağaza olayını ekleyin.",

  // Branding
  "brand.tagline": "WhatsApp tabanlı saha hafızası",

  // Sidebar
  "sidebar.records": "Saha kaydı",
  "sidebar.recordsLeft": "kayıt hakkı kaldı",
  "sidebar.loading": "Yükleniyor…",
  "sidebar.credit": "Kredi",
  "sidebar.addCredit": "Kredi ekle",
  "sidebar.org": "Organizasyon",
  "sidebar.account": "Hesap",

  // Dashboard demo widgets
  "dashboard.sampleData": "Örnek panel verisidir.",
  "dashboard.liveFlow": "Canlı Saha Akışı",
  "dashboard.recurring": "Tekrar Eden Konular",
  "field.event": "Olay",
  "field.location": "Lokasyon",
  "field.priority": "Öncelik",
  "field.action": "Aksiyon",
  "field.times": "kez soruldu",
  "field.recordsCount": "kayıt",

  // Data Sources
  "ds.title": "Bilgi Kaynakları",
  "ds.subtitle": "WhatsApp mesajları, prosedür dokümanları ve operasyon sistemlerini saha hafızasına bağlayın.",
  "ds.whatsapp": "WhatsApp Kanalı",
  "ds.knowledge": "Bilgi Kaynakları",
  "ds.operations": "Operasyon Sistemleri",
  "ds.recent": "Son Saha Kayıtları",
  "ds.contactTitle": "Daha fazla erişim için bize ulaşın",
  "ds.contactText": "Ek mağaza, bölge ve operasyon veri kaynakları için kurumsal erişim açılabilir.",
  "status.syncing": "Senkronize ediliyor",
  "ds.noLocation": "Lokasyon belirtilmedi",

  // Add Field Record dialog
  "rec.title": "Yeni Saha Kaydı Ekle",
  "rec.desc": "Manuel saha kaydı oluşturun — AI sorgularına anında dahil olur.",
  "rec.source": "Kaynak",
  "rec.status": "Durum",
  "rec.rawText": "Ham metin",
  "rec.rawPlaceholder": "Ham metin veya mesaj içeriği",
  "rec.location": "Lokasyon",
  "rec.locationPlaceholder": "örn. Kadıköy Mağazası",
  "rec.topic": "Konu",
  "rec.topicPlaceholder": "örn. İade prosedürü",
  "rec.assetCode": "Ekipman / Ürün kodu",
  "rec.action": "Aksiyon",
  "rec.actionPlaceholder": "Yapılması gereken",
  "rec.rootCause": "Kök Neden",
  "rec.rootCausePlaceholder": "Sorunun kök nedeni",
  "rec.rootCauseHint": "Kapatılan kayıtlarda kök neden önerilir",
  "rec.resolution": "Çözüm / Kapanış Notu",
  "rec.resolutionPlaceholder": "Yapılan çözüm veya kapanış detayı",
  "rec.submit": "Kaydı Ekle",
  "rec.submitting": "Ekleniyor…",
  "rec.srcWhatsapp": "WhatsApp Mesajı",
  "rec.srcForm": "Servis Formu",
  "rec.srcManual": "Manuel Giriş",

  // Login
  "login.signin": "Giriş yap",
  "login.signup": "Hesap oluştur",
  "login.tagline": "WhatsApp tabanlı saha hafızası",
  "login.email": "E-posta",
  "login.password": "Parola",
  "login.wait": "Lütfen bekleyin…",
  "login.signinBtn": "Giriş yap",
  "login.signupBtn": "Kayıt ol",
  "login.toSignup": "Hesabın yok mu? Kayıt ol",
  "login.toSignin": "Zaten hesabın var mı? Giriş yap",
  "login.checkInbox": "E-postanızı doğrulamak için gelen kutunuzu kontrol edin.",
  "login.authFailed": "Kimlik doğrulama başarısız",

  // Language switcher
  "lang.tr": "TR",
  "lang.en": "EN",
};

const en: Dict = {
  // Navigation
  "nav.dashboard": "Overview",
  "nav.ai-chat": "WhatsApp Assistant",
  "nav.data-sources": "Knowledge Sources",
  "nav.ai-clients": "Integrations",
  "nav.data-quality": "Data Quality",
  "nav.api": "API / MCP",
  "nav.audit": "Audit Log",
  "nav.billing": "Plan / Usage",

  // Dashboard
  "dashboard.title": "Central Dashboard",
  "dashboard.subtitle":
    "Turn WhatsApp field messages into store records, CRM notes, and management insights.",
  "metric.whatsapp": "WhatsApp messages",
  "metric.records": "Field records created",
  "metric.crm": "CRM notes added",
  "metric.critical": "Open critical issues",
  "metric.training": "Training needs",
  "metric.timeSaved": "Manager time saved",

  // AI modes
  "mode.general": "General Search",
  "mode.quality": "Quality Review",
  "mode.compliance": "Procedure Check",
  "mode.audit": "Audit Trail",

  // Dashboard (existing metrics & chart)
  "dashboard.lead": "AI-ready field data, data quality and usage performance.",
  "dashboard.opsPerformance": "Operations Performance",
  "metric.aiReady": "AI-ready records",
  "metric.qualityScore": "Data quality score",
  "metric.evidencedClosure": "Evidenced closures",
  "metric.queriesPeriod": "Queries this period",
  "chart.records": "Records",
  "chart.queries": "Queries",
  "chart.noData": "No records yet — add your first field data",
  "card.aiClients.title": "Integrations",
  "card.aiClients.text": "Connect Claude, ChatGPT, Copilot or a local LLM.",
  "card.dataSources.title": "Knowledge Sources",
  "card.dataSources.text": "Connect WhatsApp, service forms, documents, photos and ERP data.",
  "card.api.title": "API Keys",
  "card.api.text": "Create secure API and MCP access for enterprise AI agents.",
  "card.quality.title": "Quality Score",
  "card.quality.text": "See missing root causes, evidence-less closures and unmatched records.",
  "ai.askTitle": "Ask saha.team",
  "ai.askSubtitle": "Search, analyse and review your operational memory.",
  "ai.preparing": "Preparing workspace…",
  "ai.generating": "Generating answer…",
  "ai.history": "History",
  "ai.newChat": "New chat",
  "ai.chatHistory": "Chat history",
  "ai.noConversations": "No conversations yet.",
  "ai.stop": "Stop",
  "ai.send": "Send",
  "ai.copy": "Copy",
  "ai.copied": "Copied",
  "ai.retry": "Retry",
  "ai.openSources": "Open sources",
  "ai.stopped": "Stopped.",
  "ai.demoData": "Demo data",
  "ai.records": "records",


  // Status labels
  "status.open": "Open",
  "status.closed": "Closed",
  "status.pending": "Pending",
  "status.critical": "Critical",
  "status.medium": "Medium",
  "status.low": "Low",
  "status.connected": "Connected",
  "status.setup": "Setup needed",
  "status.error": "Error",
  "status.sample": "Sample data",

  // Buttons & empty states
  "btn.addRecord": "Add Field Record",
  "btn.openRecord": "Open Record",
  "btn.whatsappReply": "WhatsApp Reply",
  "btn.crmNote": "CRM Note",
  "btn.viewDetails": "View Details",
  "btn.cancel": "Cancel",
  "btn.contact": "Contact us",
  "empty.records": "No field records yet. Add the first store incident for the demo.",

  // Branding
  "brand.tagline": "WhatsApp-based field memory",

  // Dashboard demo widgets
  "dashboard.sampleData": "Sample dashboard data.",
  "dashboard.liveFlow": "Live Field Flow",
  "dashboard.recurring": "Recurring Topics",
  "field.event": "Event",
  "field.location": "Location",
  "field.priority": "Priority",
  "field.action": "Action",
  "field.times": "times asked",
  "field.recordsCount": "records",

  // Data Sources
  "ds.title": "Knowledge Sources",
  "ds.subtitle": "Connect WhatsApp messages, procedure documents, and operational systems to your field memory.",
  "ds.whatsapp": "WhatsApp Channel",
  "ds.knowledge": "Knowledge Sources",
  "ds.operations": "Operational Systems",
  "ds.recent": "Recent Field Records",
  "ds.contactTitle": "Contact us for more access",
  "ds.contactText": "Enterprise access can be enabled for additional store, region and operations data sources.",
  "status.syncing": "Syncing",
  "ds.noLocation": "No location specified",

  // Add Field Record dialog
  "rec.title": "Add New Field Record",
  "rec.desc": "Create a manual field record — instantly included in AI queries.",
  "rec.source": "Source",
  "rec.status": "Status",
  "rec.rawText": "Raw text",
  "rec.rawPlaceholder": "Raw text or message content",
  "rec.location": "Location",
  "rec.locationPlaceholder": "e.g. Kadıköy Store",
  "rec.topic": "Topic",
  "rec.topicPlaceholder": "e.g. Return procedure",
  "rec.assetCode": "Equipment / Product code",
  "rec.action": "Action",
  "rec.actionPlaceholder": "What needs to be done",
  "rec.rootCause": "Root Cause",
  "rec.rootCausePlaceholder": "Root cause of the issue",
  "rec.rootCauseHint": "Root cause is recommended for closed records",
  "rec.resolution": "Resolution / Closing Note",
  "rec.resolutionPlaceholder": "Resolution applied or closing detail",
  "rec.submit": "Add Record",
  "rec.submitting": "Adding…",
  "rec.srcWhatsapp": "WhatsApp Message",
  "rec.srcForm": "Service Form",
  "rec.srcManual": "Manual Entry",

  // Login
  "login.signin": "Sign in",
  "login.signup": "Create account",
  "login.tagline": "WhatsApp-based field memory",
  "login.email": "Email",
  "login.password": "Password",
  "login.wait": "Please wait…",
  "login.signinBtn": "Sign in",
  "login.signupBtn": "Sign up",
  "login.toSignup": "Don't have an account? Sign up",
  "login.toSignin": "Already have an account? Sign in",
  "login.checkInbox": "Check your inbox to confirm your email.",
  "login.authFailed": "Authentication failed",

  // Language switcher
  "lang.tr": "TR",
  "lang.en": "EN",
};

export const DICT: Record<Lang, Dict> = { tr, en };

// Suggested AI questions per mode (retail-focused).
export const MODE_PROMPTS: Record<Lang, Record<string, string[]>> = {
  tr: {
    general: [
      "Bu ay en çok hangi mağazalar iade prosedürü sordu?",
      "En çok tekrar eden müşteri şikâyetleri neler?",
      "Hangi mağazalarda stok farkı artıyor?",
      "Kadıköy Mağazası’nda bu hafta hangi kritik olaylar oldu?",
    ],
    quality: [
      "Fotoğraf kanıtı olmadan kapatılan kayıtları göster.",
      "Hangi mağazalarda kapanış kalitesi en düşük?",
      "Hangi konular eğitim ihtiyacı oluşturuyor?",
    ],
    compliance: [
      "İade politikasıyla çelişen işlemler var mı?",
      "Zorunlu fotoğraf kanıtı eksik kayıtları göster.",
      "Kasa kapanışında en çok sorun yaşayan mağazalar hangileri?",
    ],
    audit: [
      "Kapandıktan sonra yeniden açılan kayıtlar hangileri?",
      "Geçen hafta kapalı kayıtları kim düzenledi?",
      "Hangi konular eğitim ihtiyacı oluşturuyor?",
    ],
  },
  en: {
    general: [
      "Which stores asked the most return procedure questions this month?",
      "What are the most recurring customer complaints?",
      "Which stores have increasing stock mismatch issues?",
      "What critical issues happened in Kadıköy Store this week?",
    ],
    quality: [
      "Show records closed without photo evidence.",
      "Which stores have the lowest closure quality?",
      "Which topics create training needs?",
    ],
    compliance: [
      "Are there any cases that conflict with the return policy?",
      "Show records missing mandatory photo evidence.",
      "Which stores struggle most with cash register closing?",
    ],
    audit: [
      "Which records were reopened after closing?",
      "Who edited closed records last week?",
      "Which topics create training needs?",
    ],
  },
};

export const MODE_PLACEHOLDER: Record<Lang, Record<string, string>> = {
  tr: {
    general: "Kayıtlar, iadeler, stok, şikâyetler veya geçmiş olaylar hakkında sorun…",
    quality: "Eksik alanlar, zayıf kayıtlar veya veri kalitesi hakkında sorun…",
    compliance: "Prosedür uyumu, zorunlu kanıt veya uygunsuzluk hakkında sorun…",
    audit: "Kim neyi ne zaman ve neden değiştirdi diye sorun…",
  },
  en: {
    general: "Ask about records, returns, stock, complaints or past cases…",
    quality: "Ask about missing fields, weak records or data quality…",
    compliance: "Ask about SOP adherence, mandatory evidence or non-compliance…",
    audit: "Ask who changed what, when and why…",
  },
};

export const MODE_DESCRIPTION: Record<Lang, Record<string, string>> = {
  tr: {
    general: "Operasyonel kayıtları ara ve özetle",
    quality: "Eksik, tutarsız veya düşük kaliteli kayıtları bul",
    compliance: "Kayıtları prosedürlere ve zorunlu alanlara göre kontrol et",
    audit: "Kimin neyi ne zaman değiştirdiğini incele",
  },
  en: {
    general: "Search and summarise operational records",
    quality: "Find incomplete, inconsistent or low-quality records",
    compliance: "Check records against procedures and mandatory fields",
    audit: "Review who changed what and when",
  },
};

export function translate(lang: Lang, key: string): string {
  return DICT[lang]?.[key] ?? DICT[DEFAULT_LANG][key] ?? key;
}

// ---- Dashboard demo data (retail central office) ----
export type DemoMetric = { value: string; label: string };

export const DEMO_METRICS: Record<Lang, DemoMetric[]> = {
  tr: [
    { value: "842", label: "WhatsApp mesajı" },
    { value: "43", label: "Açılan saha kaydı" },
    { value: "218", label: "CRM’e işlenen not" },
    { value: "12", label: "Açık kritik konu" },
    { value: "7", label: "Eğitim ihtiyacı" },
    { value: "124 saat", label: "Kurtarılan yönetici zamanı" },
  ],
  en: [
    { value: "842", label: "WhatsApp messages" },
    { value: "43", label: "Field records created" },
    { value: "218", label: "CRM notes added" },
    { value: "12", label: "Open critical issues" },
    { value: "7", label: "Training needs" },
    { value: "124 h", label: "Manager time saved" },
  ],
};

export type FlowItem = {
  name: string;
  message: string;
  event: string;
  location: string;
  priority: string;
  action: string;
};

export const DEMO_FIELD_FLOW: Record<Lang, FlowItem[]> = {
  tr: [
    {
      name: "Ayşe · Kadıköy Mağazası",
      message: "Müşteri faturasız iade istiyor, ne yapayım?",
      event: "İade prosedürü",
      location: "Kadıköy Mağazası",
      priority: "Orta",
      action: "Prosedür cevabı verildi, eğitim ihtiyacı işaretlendi",
    },
    {
      name: "Mehmet · Ataşehir Mağazası",
      message: "Stokta görünen ürün rafta yok.",
      event: "Stok farkı",
      location: "Ataşehir Mağazası",
      priority: "Yüksek",
      action: "Stok kontrol kaydı oluşturuldu",
    },
    {
      name: "Zeynep · Cevahir Mağazası",
      message: "Ürün hasarlı geldi, fotoğrafını attım.",
      event: "Hasarlı ürün",
      location: "Cevahir Mağazası",
      priority: "Orta",
      action: "Tedarikçi kalite kaydı açıldı",
    },
    {
      name: "Emir · Bağdat Caddesi Mağazası",
      message: "Kasa kapanışında fark çıktı.",
      event: "Kasa farkı",
      location: "Bağdat Caddesi Mağazası",
      priority: "Yüksek",
      action: "Müdür onayı bekliyor",
    },
  ],
  en: [
    {
      name: "Ayşe · Kadıköy Store",
      message: "A customer wants to return an item without an invoice. What should I do?",
      event: "Return procedure",
      location: "Kadıköy Store",
      priority: "Medium",
      action: "Procedure answer sent, training need flagged",
    },
    {
      name: "Mehmet · Ataşehir Store",
      message: "An item appears in stock but is not on the shelf.",
      event: "Stock mismatch",
      location: "Ataşehir Store",
      priority: "High",
      action: "Stock check record created",
    },
    {
      name: "Zeynep · Cevahir Store",
      message: "The product arrived damaged. I sent a photo.",
      event: "Damaged product",
      location: "Cevahir Store",
      priority: "Medium",
      action: "Supplier quality record opened",
    },
    {
      name: "Emir · Bağdat Avenue Store",
      message: "There was a difference during cash register closing.",
      event: "Cash register difference",
      location: "Bağdat Avenue Store",
      priority: "High",
      action: "Waiting for manager approval",
    },
  ],
};

export type RecurringItem = { topic: string; detail: string };

export const DEMO_RECURRING: Record<Lang, RecurringItem[]> = {
  tr: [
    { topic: "İade prosedürü", detail: "92 kez soruldu" },
    { topic: "Kasa kapanışı", detail: "68 kez soruldu" },
    { topic: "Stok farkı", detail: "54 kayıt" },
    { topic: "Hasarlı ürün", detail: "38 kayıt" },
    { topic: "Müşteri şikâyeti", detail: "24 kayıt" },
  ],
  en: [
    { topic: "Return procedure", detail: "asked 92 times" },
    { topic: "Cash register closing", detail: "asked 68 times" },
    { topic: "Stock mismatch", detail: "54 records" },
    { topic: "Damaged product", detail: "38 records" },
    { topic: "Customer complaint", detail: "24 records" },
  ],
};

export const PRIORITY_CLASS: Record<string, string> = {
  Yüksek: "bg-primary/10 text-primary",
  High: "bg-primary/10 text-primary",
  Orta: "bg-amber-100 text-amber-800",
  Medium: "bg-amber-100 text-amber-800",
};

// Retail-focused data source cards
export type SourceItem = { title: string; text: string; status: "Connected" | "Syncing" | "Setup" };

export const DS_WHATSAPP: Record<Lang, SourceItem[]> = {
  tr: [
    { title: "WhatsApp İş Mesajları", text: "Mağaza ekiplerinden gelen sorular ve görev mesajları.", status: "Connected" },
    { title: "Sesli Notlar", text: "Saha ekiplerinin sesli mesaj ve notları.", status: "Syncing" },
    { title: "Fotoğraf ve Dokümanlar", text: "Mağazadan paylaşılan fotoğraf, fiş ve belgeler.", status: "Connected" },
  ],
  en: [
    { title: "WhatsApp Business Messages", text: "Questions and task messages from store teams.", status: "Connected" },
    { title: "Voice Notes", text: "Voice messages and notes from field teams.", status: "Syncing" },
    { title: "Photos & Documents", text: "Photos, receipts and documents shared from stores.", status: "Connected" },
  ],
};

export const DS_KNOWLEDGE: Record<Lang, SourceItem[]> = {
  tr: [
    { title: "İade Politikası PDF", text: "Güncel iade ve değişim kuralları.", status: "Connected" },
    { title: "Mağaza Operasyon Kılavuzu", text: "Günlük operasyon ve açılış/kapanış prosedürleri.", status: "Connected" },
    { title: "Kasa Kapanış Prosedürü", text: "Kasa sayımı ve kapanış adımları.", status: "Setup" },
    { title: "Kampanya ve Fiyat Listeleri", text: "Güncel kampanya, indirim ve fiyat bilgileri.", status: "Syncing" },
  ],
  en: [
    { title: "Return Policy PDF", text: "Up-to-date return and exchange rules.", status: "Connected" },
    { title: "Store Operations Guide", text: "Daily operations and open/close procedures.", status: "Connected" },
    { title: "Cash Register Closing Procedure", text: "Cash counting and closing steps.", status: "Setup" },
    { title: "Campaign & Price Lists", text: "Current campaigns, discounts and prices.", status: "Syncing" },
  ],
};

export const DS_OPERATIONS: Record<Lang, SourceItem[]> = {
  tr: [
    { title: "CRM", text: "Müşteri kayıtları, notlar ve takip işlemleri.", status: "Connected" },
    { title: "Google Sheets", text: "Operasyon tabloları ve takip listeleri.", status: "Syncing" },
    { title: "ERP / Stok Sistemi", text: "Stok seviyeleri, ürün ve sipariş verileri.", status: "Setup" },
    { title: "Ticket / Görev Sistemi", text: "Açık görevler, talepler ve iş takibi.", status: "Setup" },
  ],
  en: [
    { title: "CRM", text: "Customer records, notes and follow-ups.", status: "Connected" },
    { title: "Google Sheets", text: "Operations spreadsheets and tracking lists.", status: "Syncing" },
    { title: "ERP / Stock System", text: "Stock levels, product and order data.", status: "Setup" },
    { title: "Ticket / Task System", text: "Open tasks, requests and work tracking.", status: "Setup" },
  ],
};

