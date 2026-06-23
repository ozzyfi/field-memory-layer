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
  "empty.records": "No field records yet. Add the first store incident for the demo.",

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
