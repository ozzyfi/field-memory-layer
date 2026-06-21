// Structured source model for AI Chat answers + demo source generation.
import damagedProduct from "@/assets/demo-sources/damaged-product-kadikoy.jpg";
import priceMismatch from "@/assets/demo-sources/price-mismatch-receipt.jpg";

export type ChatSourceType = "image" | "pdf" | "document" | "record";

export type ChatSource = {
  id: string; // e.g. "S1"
  label: string;
  type: ChatSourceType;
  recordId?: string;
  storagePath?: string;
  fileName?: string;
  mimeType?: string;
  thumbnailUrl?: string; // signed/temporary or local demo URL
  url?: string; // full preview URL (signed/temporary or local demo URL)
  location?: string;
  createdAt?: string;
  pageNumber?: number;
  snippet?: string;
  // Record-type extra fields for inline preview
  topic?: string;
  rawText?: string;
  status?: string;
  rootCause?: string;
  resolution?: string;
  demo?: boolean;
};

/**
 * Build query-aware demo sources that align with the demo answer.
 * Includes an image, a PDF and a record so the preview panel can be exercised.
 */
export function buildDemoSources(query: string, location: string): ChatSource[] {
  const q = query.toLowerCase();
  const loc =
    location && location !== "All locations" ? location : "Kadıköy Mağazası";
  const today = "2026-06-18";

  const priceFocused = /(fiyat|price|kasa|pos|fatura|receipt)/.test(q);

  const imageSource: ChatSource = priceFocused
    ? {
        id: "S1",
        label: "price-mismatch-receipt.jpg",
        type: "image",
        fileName: "price-mismatch-receipt.jpg",
        mimeType: "image/jpeg",
        thumbnailUrl: priceMismatch,
        url: priceMismatch,
        location: loc,
        createdAt: today,
        recordId: "REC-10342",
        snippet: "Campaign price 12.99 vs POS price differs at checkout.",
        demo: true,
      }
    : {
        id: "S1",
        label: "damaged-product-kadikoy.jpg",
        type: "image",
        fileName: "damaged-product-kadikoy.jpg",
        mimeType: "image/jpeg",
        thumbnailUrl: damagedProduct,
        url: damagedProduct,
        location: loc,
        createdAt: today,
        recordId: "REC-10218",
        snippet: "Damaged product box reported on shelf.",
        demo: true,
      };

  const pdfSource: ChatSource = {
    id: "S2",
    label: "Return Procedure.pdf",
    type: "pdf",
    fileName: "Return Procedure.pdf",
    mimeType: "application/pdf",
    pageNumber: 4,
    snippet:
      "Step 4 — A photo of the returned item is mandatory before a refund can be approved.",
    location: loc,
    createdAt: "2026-01-12",
    demo: true,
  };

  const recordSource: ChatSource = {
    id: "S3",
    label: "REC-10218 · Field record",
    type: "record",
    recordId: "REC-10218",
    topic: priceFocused ? "Kampanya fiyatı ile kasa fiyatı uyuşmazlığı" : "Hasarlı ürün bildirimi",
    location: loc,
    createdAt: today,
    status: "closed",
    rawText:
      "Müşteri raftaki üründe hasar fark etti, fotoğraf çekildi ve iade talebi açıldı.",
    rootCause: priceFocused ? "Kasa fiyat etiketi güncellenmemiş" : "Sevkiyat sırasında ezilme",
    resolution: "Ürün iade alındı ve stoktan düşüldü.",
    demo: true,
  };

  return [imageSource, pdfSource, recordSource];
}
