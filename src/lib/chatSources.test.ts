import { describe, it, expect } from "vitest";
import { buildDemoSources } from "@/lib/chatSources";

describe("buildDemoSources (demo fallback)", () => {
  it("returns image, pdf and record sources for a generic query", () => {
    const sources = buildDemoSources("hasarlı ürün", "All locations");
    expect(sources.length).toBeGreaterThanOrEqual(3);
    const types = sources.map((s) => s.type);
    expect(types).toContain("image");
    expect(types).toContain("pdf");
    expect(types).toContain("record");
    // every demo source is clearly flagged as demo data
    expect(sources.every((s) => s.demo)).toBe(true);
  });

  it("uses the selected location instead of the default", () => {
    const sources = buildDemoSources("iade", "Ataşehir Mağazası");
    expect(sources[0].location).toBe("Ataşehir Mağazası");
  });

  it("returns a receipt image for price/POS focused queries", () => {
    const sources = buildDemoSources("kasa fiyat uyuşmazlığı", "All locations");
    const image = sources.find((s) => s.type === "image");
    expect(image?.fileName).toBe("price-mismatch-receipt.jpg");
  });
});
