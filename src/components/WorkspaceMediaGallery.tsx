import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { WorkMedia } from "@/store/content";

type Props = {
  media: WorkMedia[];
  title?: string;
  startIndex?: number;
  onClose: () => void;
};

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    }
  } catch { /* ignore */ }
  return null;
}

export function WorkspaceMediaGallery({ media, title, startIndex = 0, onClose }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinchRef = useRef<{ d: number; z: number } | null>(null);

  const count = media.length;
  const current = media[idx];
  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };
  const go = (n: number) => { setIdx((n + count) % count); reset(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, z + 0.5));
      else if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [idx, count]);

  if (!count || !current) return null;

  const isImage = current.kind === "image";

  const onWheel = (e: React.WheelEvent) => {
    if (!isImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((z) => Math.max(1, Math.min(4, z + delta)));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isImage || zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isImage) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { d: Math.hypot(dx, dy), z: zoom };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isImage) return;
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      const nz = Math.max(1, Math.min(4, pinchRef.current.z * (d / pinchRef.current.d)));
      setZoom(nz);
      if (nz === 1) setOffset({ x: 0, y: 0 });
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; };
  const toggleZoom = () => { if (!isImage) return; if (zoom > 1) reset(); else setZoom(2); };

  return (
    <div className="fixed inset-0 z-[120] bg-background/95 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-line text-[10px] uppercase tracking-[0.14em]">
        <div className="text-ink truncate pr-3">
          {title && <span className="text-accent mr-2">/ {title}</span>}
          <span className="text-ink-dim">{String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="border border-line p-1.5 text-ink-dim hover:border-accent hover:text-accent" aria-label="Zoom out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-ink-dim w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} className="border border-line p-1.5 text-ink-dim hover:border-accent hover:text-accent" aria-label="Zoom in">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button type="button" onClick={onClose} className="border border-line p-1.5 text-ink-dim hover:border-accent hover:text-accent ml-2" aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden select-none">
        {count > 1 && (
          <button type="button" onClick={() => go(idx - 1)} className="absolute left-2 md:left-4 z-10 border border-line bg-background/60 p-2 text-ink-dim hover:text-accent hover:border-accent" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          className="w-full h-full flex items-center justify-center p-4 md:p-8"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={toggleZoom}
          style={{ cursor: isImage ? (zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in") : "default" }}
        >
          {current.kind === "image" && (
            <img
              src={current.url}
              alt={`${title || "Project"} ${idx + 1}`}
              draggable={false}
              className="max-w-full max-h-full object-contain transition-transform duration-150 ease-out"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "center center" }}
            />
          )}
          {current.kind === "video" && (
            <video src={current.url} controls className="max-w-full max-h-full" />
          )}
          {current.kind === "youtube" && (() => {
            const id = youtubeId(current.url);
            return id ? (
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                className="w-full max-w-4xl aspect-video"
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open video</a>
            );
          })()}
        </div>

        {count > 1 && (
          <button type="button" onClick={() => go(idx + 1)} className="absolute right-2 md:right-4 z-10 border border-line bg-background/60 p-2 text-ink-dim hover:text-accent hover:border-accent" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="border-t border-line px-3 md:px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 justify-center min-w-min">
            {media.map((m, i) => (
              <button
                key={m.id || i}
                type="button"
                onClick={() => go(i)}
                className={`shrink-0 w-14 h-14 md:w-16 md:h-16 border overflow-hidden relative ${i === idx ? "border-accent" : "border-line hover:border-ink-dim"}`}
                aria-label={`Go to ${i + 1}`}
              >
                {m.kind === "image" ? (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : m.kind === "youtube" ? (
                  <div className="w-full h-full flex items-center justify-center bg-surface text-[9px] uppercase tracking-[0.14em] text-accent">YT</div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface text-[9px] uppercase tracking-[0.14em] text-accent">VID</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-[9px] uppercase tracking-[0.14em] text-ink-mute text-center pb-2">
        {isImage ? "Double-click / pinch to zoom · drag to pan · ← → to navigate · esc to close" : "← → to navigate · esc to close"}
      </div>
    </div>
  );
}

export default WorkspaceMediaGallery;