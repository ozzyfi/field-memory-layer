import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SourcePreviewPanel } from "@/components/chat/SourcePreviewPanel";
import type { ChatSource } from "@/lib/chatSources";

const sources: ChatSource[] = [
  {
    id: "S1",
    label: "damaged.jpg",
    type: "image",
    fileName: "damaged.jpg",
    thumbnailUrl: "/img.jpg",
    url: "/img.jpg",
    location: "Kadıköy Mağazası",
    createdAt: "2026-06-18",
    recordId: "REC-1",
  },
  {
    id: "S2",
    label: "Return Procedure.pdf",
    type: "pdf",
    fileName: "Return Procedure.pdf",
    pageNumber: 4,
    snippet: "Photo mandatory before refund.",
  },
];

describe("SourcePreviewPanel", () => {
  it("renders the active source and calls onClose", () => {
    const onClose = vi.fn();
    render(
      <SourcePreviewPanel sources={sources} index={0} onIndexChange={() => {}} onClose={onClose} />,
    );
    expect(screen.getByText("damaged.jpg")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close source preview"));
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates between sources", () => {
    const onIndexChange = vi.fn();
    render(
      <SourcePreviewPanel sources={sources} index={0} onIndexChange={onIndexChange} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("shows pdf page reference and snippet", () => {
    render(
      <SourcePreviewPanel sources={sources} index={1} onIndexChange={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText(/Page 4/)).toBeInTheDocument();
    expect(screen.getByText(/Photo mandatory before refund/)).toBeInTheDocument();
  });
});
