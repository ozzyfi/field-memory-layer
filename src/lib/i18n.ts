// Lightweight dictionary-based i18n for saha.team (frontend-only).
// Default language: Turkish. No external i18n library.

export type Lang = "tr" | "en";

export const LANG_STORAGE_KEY = "saha:lang";
export const DEFAULT_LANG: Lang = "tr";

type Dict = Record<string, string>;

const tr: Dict = {
  // Navigation
  "nav.dashboard": "Genel Bakış",
  "nav.ai-chat": "AI Asistan",
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
  "ai.askTitle": "AI Asistan",
  "ai.askSubtitle": "WhatsApp’tan gelen saha mesajlarını, mağaza kayıtlarını ve operasyon içgörülerini AI ile sorgulayın.",
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

  // Onboarding
  "onboard.welcome": "saha.team’e hoş geldiniz",
  "onboard.dash.1": "WhatsApp kanalını bağla",
  "onboard.dash.2": "Mağaza mesajlarını kayıt ve aksiyona dönüştür",
  "onboard.dash.3": "Merkez panelden tekrar eden konuları ve eğitim ihtiyaçlarını takip et",
  "onboard.ds": "WhatsApp kanalınızı, prosedür dokümanlarınızı ve operasyon sistemlerinizi bağlayın.",

  // Data Quality
  "dq.title": "Veri Kalitesi",
  "dq.subtitle": "Sahadan gelen verinin AI tarafından güvenilir kullanılabilirliğini ölçün.",
  "dq.runAudit": "Analizi çalıştır",
  "dq.updated": "Analiz güncellendi",
  "dq.qualityScore": "Kalite Puanı",
  "dq.qualityScoreText": "Genel AI-ready veri kalitesi.",
  "dq.evidenced": "Kanıtlı Kapanış",
  "dq.evidencedText": "Fotoğraf, ses veya ölçümle kapanan işler.",
  "dq.missingRoot": "Eksik Kök Neden",
  "dq.missingRootText": "Kapanmış ama kök nedeni eksik işler.",
  "dq.unmatched": "Eşleşmeyen Kanıt",
  "dq.unmatchedText": "İş veya ekipmana bağlanmamış fotoğraf/ses kayıtları.",
  "dq.fixSuggestions": "Düzeltme önerileri",
  "dq.allReady": "Tüm kayıtlar AI-ready",
  "dq.allReadyDesc": "İyi iş — düzeltilecek bir kayıt bulunamadı.",
  "dq.problem": "Problem",
  "dq.record": "Kayıt",
  "dq.suggestion": "Öneri",
  "dq.status": "Durum",

  // Billing
  "bill.title": "Plan / Kullanım",
  "bill.subtitle": "Kredi, kullanım ve fatura yönetimi.",
  "bill.balance": "Bakiye",

  // Audit
  "audit.title": "Denetim Kayıtları",
  "audit.subtitle": "Hangi AI client, hangi saha verisine, hangi kaynak üzerinden erişti?",
  "audit.searchPlaceholder": "Sorgu içinde ara…",
  "audit.all": "Tümü",
  "audit.noQueries": "Henüz AI sorgusu yapılmadı",
  "audit.noQueriesDesc": "AI sorguları yapıldıkça burada görünür.",
  "audit.noMatch": "Filtreyle eşleşen sorgu yok",
  "audit.noMatchDesc": "Farklı bir client veya arama deneyin.",
  "audit.time": "Zaman",
  "audit.client": "Client",
  "audit.query": "Sorgu",
  "audit.sources": "Kaynaklar",
  "audit.user": "Kullanıcı",

  // API / MCP
  "api.subtitle": "saha.team saha hafızasını kurumsal agent’lara ve kendi uygulamalarınıza açın.",
  "api.createKey": "Anahtar oluştur",
  "api.mcpEndpoint": "MCP Endpoint",
  "api.mcpDesc": "Claude, Cursor, ChatGPT connector veya custom agent’lar için model-bağımsız erişim.",
  "api.availableTools": "Mevcut araçlar",
  "api.tool": "Araç",
  "api.description": "Açıklama",
  "api.permission": "Yetki",
  "api.apiKeys": "API Anahtarları",
  "api.name": "Ad",
  "api.preview": "Önizleme",
  "api.created": "Oluşturulma",
  "api.lastUsed": "Son kullanım",
  "api.active": "Aktif",
  "api.noKeys": "Henüz API anahtarı yok",
  "api.noKeysDesc": "Kurumsal AI ajanları için ilk API anahtarınızı oluşturun.",
  "api.deleteKey": "Anahtarı sil?",
  "api.deleteKeyDesc": "anahtarı kalıcı olarak silinecek. Bu işlem geri alınamaz.",
  "api.delete": "Sil",
  "api.keyActivated": "Anahtar etkinleştirildi",
  "api.keyDeactivated": "Anahtar pasifleştirildi",
  "api.keyDeleted": "Anahtar silindi",

  // AI Clients
  "aic.title": "Entegrasyonlar",
  "aic.subtitle": "AI-ready saha hafızanızı istediğiniz yapay zekâ ile güvenli şekilde kullanın.",
  "aic.connect": "AI client bağla",
  "aic.manage": "Bağlantıları yönet",
  "aic.notReady": "Çalışma alanı hazır değil",
  "aic.claude": "MCP üzerinden saha hafızasına kaynaklı erişim.",
  "aic.chatgpt": "Enterprise connector veya API gateway ile sorgulama.",
  "aic.copilot": "Microsoft ortamında izinli saha verisi erişimi.",
  "aic.localllm": "Veri dışarı çıkmadan kendi sunucunuzdaki modele bağlanın.",

  // Field record detail sheet
  "detail.title": "Saha Kaydı",
  "detail.edit": "Düzenle",
  "detail.cancel": "Vazgeç",
  "detail.delete": "Sil",
  "detail.save": "Kaydet",
  "detail.saving": "Kaydediliyor…",
  "detail.deleting": "Siliniyor…",
  "detail.assetId": "Ekipman ID",
  "detail.evidence": "Kanıtlar",
  "detail.quality": "Kalite",
  "detail.createdAt": "Oluşturulma",
  "detail.closedAt": "Kapanış",
  "detail.deleteConfirm": "Kaydı sil?",
  "detail.deleteConfirmDesc": "Bu kayıt kalıcı olarak silinecek ve geri alınamayacak.",
  "detail.updated": "Kayıt güncellendi ✓",
  "detail.updateFailed": "Güncellenemedi",
  "detail.deleted": "Kayıt silindi",
  "detail.deleteFailed": "Silinemedi",

  // Add field record (toasts & validation)
  "rec.notReady": "Workspace henüz hazır değil, biraz sonra deneyin.",
  "rec.added": "Kayıt eklendi ✓",
  "rec.addFailed": "Kayıt eklenemedi",
  "rec.rawRequired": "Ham metin gerekli",

  // Relative time
  "time.now": "şimdi",
  "time.minAgo": "dakika önce",
  "time.hourAgo": "saat önce",
  "time.dayAgo": "gün önce",

  // Workspace dropdown (frontend-only)
  "ws.workspace": "Çalışma Alanı",
  "ws.countries": "Ülke ve mağazalar",
  "ws.channels": "WhatsApp kanalları",
  "ws.team": "Ekip ve roller",
  "ws.plan": "Plan / Kullanım",
  "ws.settings": "Workspace ayarları",
  "ws.soon": "Yakında",

  // WhatsApp channel structure (demo)
  "wcs.title": "WhatsApp Kanal Yapısı",
  "wcs.subtitle": "Ülke bazlı saha kanalları ve ayrı admin bilgi güncelleme kanalıyla mağaza operasyonlarını yönetin.",
  "wcs.sample": "Örnek kurumsal yapı",

  // Phone mapping (demo)
  "pm.title": "Telefon Numarası → Rol ve Lokasyon Eşleştirme",
  "pm.body": "WhatsApp’tan gelen telefon numarası, kişiyi tanımak için kullanılır. saha.team bu kişiyi rol, ülke, bölge, mağaza ve yetki bilgileriyle eşleştirir.",
  "pm.example": "Örnek eşleştirme",

  // Knowledge update drafts (demo)
  "kud.title": "Bilgi Güncelleme Taslakları",
  "kud.subtitle": "Admin WhatsApp kanalından gelen kampanya, prosedür ve dokümanlar onaydan sonra bilgi tabanına yayınlanır.",
  "kud.ai": "AI çıkarımı",
  "kud.preview": "Önizle",
  "kud.sendApproval": "Onaya Gönder",
  "kud.publish": "Yayınla",
  "kud.reject": "Reddet",

  // Dashboard admin channel insight (demo)
  "dash.admin.title": "Admin Kanalından Gelen Güncellemeler",
  "dash.admin.content": "Bu hafta 6 kampanya ve prosedür dokümanı admin WhatsApp kanalından alındı. 4 güncelleme onaylandı, 2 güncelleme çakışma kontrolünde.",

  // Language switcher
  "lang.tr": "TR",
  "lang.en": "EN",
};


const en: Dict = {
  // Navigation
  "nav.dashboard": "Overview",
  "nav.ai-chat": "AI Assistant",
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
  "ai.askTitle": "AI Assistant",
  "ai.askSubtitle": "Ask AI about WhatsApp field messages, store records, and operational insights.",
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

  // Sidebar
  "sidebar.records": "Field records",
  "sidebar.recordsLeft": "records remaining",
  "sidebar.loading": "Loading…",
  "sidebar.credit": "Credit",
  "sidebar.addCredit": "Add credit",
  "sidebar.org": "Organization",
  "sidebar.account": "Account",

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

  // Onboarding
  "onboard.welcome": "Welcome to saha.team",
  "onboard.dash.1": "Connect the WhatsApp channel",
  "onboard.dash.2": "Turn store messages into records and actions",
  "onboard.dash.3": "Track recurring topics and training needs from the central dashboard",
  "onboard.ds": "Connect your WhatsApp channel, procedure documents, and operational systems.",

  // Data Quality
  "dq.title": "Data Quality",
  "dq.subtitle": "Measure how reliably AI can use the data coming from the field.",
  "dq.runAudit": "Run audit",
  "dq.updated": "Analysis updated",
  "dq.qualityScore": "Quality Score",
  "dq.qualityScoreText": "Overall AI-ready data quality.",
  "dq.evidenced": "Evidenced Closures",
  "dq.evidencedText": "Records closed with photo, audio or measurement.",
  "dq.missingRoot": "Missing Root Cause",
  "dq.missingRootText": "Closed records missing a root cause.",
  "dq.unmatched": "Unmatched Evidence",
  "dq.unmatchedText": "Photo/audio not linked to a record or asset.",
  "dq.fixSuggestions": "Fix suggestions",
  "dq.allReady": "All records are AI-ready",
  "dq.allReadyDesc": "Good job — no records to fix were found.",
  "dq.problem": "Problem",
  "dq.record": "Record",
  "dq.suggestion": "Suggestion",
  "dq.status": "Status",

  // Billing
  "bill.title": "Plan / Usage",
  "bill.subtitle": "Credit, usage and billing management.",
  "bill.balance": "Balance",

  // Audit
  "audit.title": "Audit Log",
  "audit.subtitle": "Which AI client accessed which field data, through which source?",
  "audit.searchPlaceholder": "Search within queries…",
  "audit.all": "All",
  "audit.noQueries": "No AI queries yet",
  "audit.noQueriesDesc": "They will appear here as AI queries are made.",
  "audit.noMatch": "No queries match the filter",
  "audit.noMatchDesc": "Try a different client or search.",
  "audit.time": "Time",
  "audit.client": "Client",
  "audit.query": "Query",
  "audit.sources": "Sources",
  "audit.user": "User",

  // API / MCP
  "api.subtitle": "Open saha.team field memory to enterprise agents and your own apps.",
  "api.createKey": "Create key",
  "api.mcpEndpoint": "MCP Endpoint",
  "api.mcpDesc": "Model-agnostic access for Claude, Cursor, ChatGPT connector or custom agents.",
  "api.availableTools": "Available tools",
  "api.tool": "Tool",
  "api.description": "Description",
  "api.permission": "Permission",
  "api.apiKeys": "API Keys",
  "api.name": "Name",
  "api.preview": "Preview",
  "api.created": "Created",
  "api.lastUsed": "Last used",
  "api.active": "Active",
  "api.noKeys": "No API keys yet",
  "api.noKeysDesc": "Create your first API key for enterprise AI agents.",
  "api.deleteKey": "Delete key?",
  "api.deleteKeyDesc": "will be permanently deleted. This action cannot be undone.",
  "api.delete": "Delete",
  "api.keyActivated": "Key activated",
  "api.keyDeactivated": "Key deactivated",
  "api.keyDeleted": "Key deleted",

  // AI Clients
  "aic.title": "Integrations",
  "aic.subtitle": "Use your AI-ready field memory securely with any AI of your choice.",
  "aic.connect": "Connect an AI client",
  "aic.manage": "Manage connections",
  "aic.notReady": "Workspace not ready",
  "aic.claude": "Sourced access to field memory via MCP.",
  "aic.chatgpt": "Query through an enterprise connector or API gateway.",
  "aic.copilot": "Permissioned field data access in the Microsoft environment.",
  "aic.localllm": "Connect to your own on-prem model without data leaving.",

  // Field record detail sheet
  "detail.title": "Field Record",
  "detail.edit": "Edit",
  "detail.cancel": "Cancel",
  "detail.delete": "Delete",
  "detail.save": "Save",
  "detail.saving": "Saving…",
  "detail.deleting": "Deleting…",
  "detail.assetId": "Asset ID",
  "detail.evidence": "Evidence",
  "detail.quality": "Quality",
  "detail.createdAt": "Created",
  "detail.closedAt": "Closed",
  "detail.deleteConfirm": "Delete record?",
  "detail.deleteConfirmDesc": "This record will be permanently deleted and cannot be recovered.",
  "detail.updated": "Record updated ✓",
  "detail.updateFailed": "Could not update",
  "detail.deleted": "Record deleted",
  "detail.deleteFailed": "Could not delete",

  // Add field record (toasts & validation)
  "rec.notReady": "Workspace is not ready yet, please try again shortly.",
  "rec.added": "Record added ✓",
  "rec.addFailed": "Could not add record",
  "rec.rawRequired": "Raw text is required",

  // Relative time
  "time.now": "now",
  "time.minAgo": "min ago",
  "time.hourAgo": "h ago",
  "time.dayAgo": "d ago",

  // Workspace dropdown (frontend-only)
  "ws.workspace": "Workspace",
  "ws.countries": "Countries and stores",
  "ws.channels": "WhatsApp channels",
  "ws.team": "Team and roles",
  "ws.plan": "Plan / Usage",
  "ws.settings": "Workspace settings",
  "ws.soon": "Coming soon",

  // WhatsApp channel structure (demo)
  "wcs.title": "WhatsApp Channel Structure",
  "wcs.subtitle": "Manage store operations with country-based field channels and a separate admin knowledge update channel.",
  "wcs.sample": "Sample enterprise setup",

  // Phone mapping (demo)
  "pm.title": "Phone Number → Role and Location Mapping",
  "pm.body": "The incoming WhatsApp phone number is used to identify the contact. saha.team maps the contact to role, country, region, store, and permission scope.",
  "pm.example": "Example mapping",

  // Knowledge update drafts (demo)
  "kud.title": "Knowledge Update Drafts",
  "kud.subtitle": "Campaigns, procedures, and documents sent through the Admin WhatsApp channel are published to the knowledge base after approval.",
  "kud.ai": "AI extraction",
  "kud.preview": "Preview",
  "kud.sendApproval": "Send for Approval",
  "kud.publish": "Publish",
  "kud.reject": "Reject",

  // Dashboard admin channel insight (demo)
  "dash.admin.title": "Updates from Admin Channel",
  "dash.admin.content": "This week, 6 campaign and procedure documents were received through the Admin WhatsApp channel. 4 updates were approved, 2 are in conflict review.",

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

