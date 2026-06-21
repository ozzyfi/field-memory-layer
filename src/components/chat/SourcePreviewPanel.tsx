import { useEffect, useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  FileType2,
  Database,
  MapPin,
  CalendarRange,
} from "lucide-react";
import type { ChatSource, ChatSourceType } from "@/lib/chatSources";

const TYPE_ICON: Record<ChatSourceType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  pdf: FileText,
  document: FileType2,
  record: Database,
};

const TYPE_LABEL: Record<ChatSourceType, string> = {
  image: "Image",
  pdf: "PDF document",
  document: "Document",
  record: "Field record",
};

export function SourcePreviewPanel({
  sources,
  index,
  onIndexChange,
  onClose,
  onOpenRecord,
}: {
  sources: ChatSource[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  onOpenRecord?: (source: ChatSource) => void;
}) {
  const source = sources[index];
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [index]);

  if (!source) return null;
  const Icon = TYPE_ICON[source.type];

  return (
    <div className="flex h-full flex-col bg-card border-l border-border">
      {/* header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {source.fileName ?? source.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {TYPE_LABEL[source.type]}
              {source.pageNumber ? ` · Page ${source.pageNumber}` : ""}
              {source.demo ? " · Demo data" : ""}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close source preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* navigation */}
      {sources.length > 1 && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <button
            onClick={() => onIndexChange(Math.max(0, index - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-xs text-muted-foreground">
            {index + 1} / {sources.length}
          </span>
          <button
            onClick={() => onIndexChange(Math.min(sources.length - 1, index + 1))}
            disabled={index === sources.length - 1}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* content */}
      <div className="flex-1 overflow-auto p-4">
        {source.type === "image" && (
          <div>
            <div className="mb-2 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-auto rounded-lg border border-border bg-muted/30">
              <img
                src={source.url ?? source.thumbnailUrl}
                alt={source.label}
                loading="lazy"
                width={1024}
                height={1024}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                className="w-full transition-transform"
              />
            </div>
          </div>
        )}

        {source.type === "pdf" && (
          <div>
            {source.url ? (
              <iframe
                title={source.fileName ?? "PDF"}
                src={`${source.url}${source.pageNumber ? `#page=${source.pageNumber}` : ""}`}
                className="h-[60vh] w-full rounded-lg border border-border bg-background"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  {source.fileName ?? "PDF document"}
                </p>
                {source.pageNumber && (
                  <p className="text-xs text-muted-foreground">Referenced page {source.pageNumber}</p>
                )}
              </div>
            )}
            {source.snippet && (
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                  Used snippet
                </p>
                {source.snippet}
              </div>
            )}
          </div>
        )}

        {source.type === "document" && (
          <div>
            <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {source.rawText ?? source.snippet ?? "No extracted text available."}
            </div>
            {source.snippet && source.rawText && (
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                  Used snippet
                </p>
                {source.snippet}
              </div>
            )}
          </div>
        )}

        {source.type === "record" && (
          <div className="space-y-3 text-sm">
            {source.topic && (
              <Field label="Topic" value={source.topic} />
            )}
            {source.rawText && <Field label="Raw text" value={source.rawText} />}
            {source.status && <Field label="Status" value={source.status} />}
            {source.rootCause && <Field label="Root cause" value={source.rootCause} />}
            {source.resolution && <Field label="Resolution" value={source.resolution} />}
          </div>
        )}

        {/* meta */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {source.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {source.location}
            </span>
          )}
          {source.createdAt && (
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="h-3 w-3" /> {source.createdAt}
            </span>
          )}
          {source.recordId && (
            <span className="inline-flex items-center gap-1">
              <Database className="h-3 w-3" /> {source.recordId}
            </span>
          )}
        </div>
      </div>

      {/* footer */}
      {source.recordId && (
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={() => onOpenRecord?.(source)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open original record
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
}
