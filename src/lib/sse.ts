// Minimal Server-Sent Events parser used by the AI Chat stream.
export type SSEEvent = { event: string; data: string };

/**
 * Parse complete SSE event blocks from a buffer. Returns the parsed events and
 * the remaining (incomplete) buffer tail that should be prepended to the next
 * chunk. Each event block is separated by a blank line ("\n\n").
 */
export function parseSSE(buffer: string): { events: SSEEvent[]; rest: string } {
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";
  const events: SSEEvent[] = [];
  for (const block of blocks) {
    if (!block.trim()) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
    }
    events.push({ event, data: dataLines.join("\n") });
  }
  return { events, rest };
}
