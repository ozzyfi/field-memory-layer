import { useEffect, useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  FileText,
  Image as ImageIcon,
  FileType2,
  Database,
  MapPin,
  CalendarRange,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
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

/* -------------------- LIGHTBOX -------------------- */

function Lightbox({
  source,
  onClose,
}: {
  source: ChatSource;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const isImage = source.type === "image";
  const previewUrl = source.url ?? source.thumbnailUrl;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-5xl w-[92vw] gap-0 p-0 overflow-hidden border-border bg-card [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="min-w-0 truncate text-sm font-medium text-foreground">
            {source.fileName ?? source.label}
          </div>
          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <ToolbarButton
                  label={t("preview.zoomOut")}
                  onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                >
                  <ZoomOut className="h-4 w-4" />
                </ToolbarButton>
                <span className="w-12 text-center text-xs text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <ToolbarButton
                  label={t("preview.zoomIn")}
                  onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                >
                  <ZoomIn className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label={t("preview.reset")} onClick={() => setZoom(1)}>
                  <RotateCcw className="h-4 w-4" />
                </ToolbarButton>
              </>
            )}
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                title={t("preview.openNewTab")}
                aria-label={t("preview.openNewTab")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <ToolbarButton label={t("preview.close")} onClick={onClose}>
              <X className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* body */}
        <div className="max-h-[80vh] overflow-auto bg-muted/30 p-4">
          {isImage ? (
            <img
              src={previewUrl}
              alt={source.label}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              className="mx-auto transition-transform"
            />
          ) : previewUrl ? (
            <iframe
              title={source.fileName ?? "PDF"}
              src={`${previewUrl}${source.pageNumber ? `#page=${source.pageNumber}` : ""}`}
              className="h-[78vh] w-full rounded-lg border border-border bg-background"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                {source.fileName ?? "PDF document"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

/* enlargeable preview wrapper with hover overlay + fullscreen button */
function EnlargeablePreview({
  onEnlarge,
  children,
}: {
  onEnlarge: () => void;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="group relative">
      {children}
      <button
        type="button"
        onClick={onEnlarge}
        aria-label={t("preview.fullscreen")}
        className="absolute inset-0 flex cursor-zoom-in items-end justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/10 group-hover:opacity-100"
      >
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm border border-border">
          <Maximize2 className="h-3.5 w-3.5" /> {t("preview.clickToEnlarge")}
        </span>
      </button>
      <button
        type="button"
        onClick={onEnlarge}
        aria-label={t("preview.fullscreen")}
        title={t("preview.fullscreen")}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/90 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}

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
  const { t } = useLanguage();
  const source = sources[index];
  const [zoom, setZoom] = useState(1);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setZoom(1);
    setLightbox(false);
  }, [index]);

  if (!source) return null;
  const Icon = TYPE_ICON[source.type];
  const canEnlarge = source.type === "image" || source.type === "pdf";

  return (
    <div className="flex h-full flex-col bg-card border-l border-border">
      {/* header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
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
        <div className="flex shrink-0 items-center gap-1">
          {canEnlarge && (
            <button
              onClick={() => setLightbox(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={t("preview.fullscreen")}
              title={t("preview.fullscreen")}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={t("preview.close")}
            title={t("preview.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* navigation */}
      {sources.length > 1 && (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
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
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {source.type === "image" && (
          <div>
            <div className="mb-2 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("preview.zoomOut")}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("preview.zoomIn")}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <EnlargeablePreview onEnlarge={() => setLightbox(true)}>
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
            </EnlargeablePreview>
          </div>
        )}

        {source.type === "pdf" && (
          <div>
            <EnlargeablePreview onEnlarge={() => setLightbox(true)}>
              {source.url ? (
                <iframe
                  title={source.fileName ?? "PDF"}
                  src={`${source.url}${source.pageNumber ? `#page=${source.pageNumber}` : ""}`}
                  className="pointer-events-none h-[60vh] w-full rounded-lg border border-border bg-background"
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
            </EnlargeablePreview>
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
        <div className="shrink-0 border-t border-border px-4 py-3">
          <button
            onClick={() => onOpenRecord?.(source)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open original record
          </button>
        </div>
      )}

      {lightbox && canEnlarge && (
        <Lightbox source={source} onClose={() => setLightbox(false)} />
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
