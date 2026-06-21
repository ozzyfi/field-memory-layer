import { describe, it, expect } from "vitest";
import { parseSSE } from "@/lib/sse";

describe("parseSSE", () => {
  it("parses delta and sources events from a complete buffer", () => {
    const buffer =
      `event: status\ndata: {"label":"x"}\n\n` +
      `event: delta\ndata: "Hello "\n\n` +
      `event: sources\ndata: [{"id":"S1","type":"image"}]\n\n`;
    const { events, rest } = parseSSE(buffer);
    expect(rest).toBe("");
    expect(events).toHaveLength(3);
    expect(events[1]).toEqual({ event: "delta", data: '"Hello "' });
    const sources = JSON.parse(events[2].data);
    expect(sources[0].id).toBe("S1");
    expect(sources[0].type).toBe("image");
  });

  it("keeps an incomplete trailing block in rest", () => {
    const buffer = `event: delta\ndata: "a"\n\nevent: delta\ndata: "b"`;
    const { events, rest } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('"a"');
    expect(rest).toBe(`event: delta\ndata: "b"`);
  });
});
