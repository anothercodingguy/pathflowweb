"use client";

import React, { useId, useRef } from "react";
import { Maximize2, X, ExternalLink, ShieldCheck } from "lucide-react";

interface ProductScreenshotProps {
  src: string;
  alt: string;
  title: string;
  caption: string;
  badge?: string;
  urlPath?: string;
  priority?: boolean;
}

export default function ProductScreenshot({
  src,
  alt,
  title,
  caption,
  badge,
  urlPath = "/app/runs",
  priority = false,
}: ProductScreenshotProps) {
  /*
    The lightbox is a native <dialog> opened with showModal(). The browser then
    does the accessibility work for us: it announces a dialog, keeps Tab inside
    it, closes on Esc, and puts focus back on the button that opened it.
    On open, focus lands on the first focusable element inside: the close button.
  */
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const openLightbox = () => dialogRef.current?.showModal();
  const closeLightbox = () => dialogRef.current?.close();

  const appHref = urlPath.startsWith("/app") ? urlPath : `/app${urlPath}`;

  return (
    <>
      <div className="on-dark group relative rounded-xl border border-white/10 bg-panel overflow-hidden shadow-2xl transition-colors duration-300 hover:border-blue-500/30">
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-panel-2 border-b border-white/[0.08] select-none">
          <div className="flex items-center gap-2 shrink-0" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-[#EF4444]/80 border border-[#EF4444]" />
            <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80 border border-[#F59E0B]" />
            <div className="h-3 w-3 rounded-full bg-[#10B981]/80 border border-[#10B981]" />
          </div>

          <div className="min-w-0 px-3 py-1 rounded-md bg-black/40 border border-white/[0.06] text-[11px] font-mono text-zinc-400 sm:max-w-md truncate">
            <span className="text-blue-400">https://</span>
            <span className="text-zinc-200 font-medium">thepathflow.online</span>
            <span>{urlPath}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badge && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {badge}
              </span>
            )}
            <button
              type="button"
              onClick={openLightbox}
              aria-label={`Enlarge screenshot: ${title}`}
              className="p-2 -m-1 text-zinc-400 hover:text-white rounded transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Screenshot Image Frame: a real button, so it is reachable by keyboard */}
        <button
          type="button"
          onClick={openLightbox}
          aria-label={`Enlarge screenshot: ${title}`}
          className="group/shot relative block w-full cursor-zoom-in overflow-hidden bg-black/60 aspect-[16/10] sm:aspect-[16/9.5] focus-visible:-outline-offset-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
            loading={priority ? "eager" : "lazy"}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-visible/shot:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-xs font-mono text-white bg-black/80 px-2.5 py-1 rounded border border-white/20 flex items-center gap-1.5">
              <Maximize2 className="h-3 w-3 text-blue-400" /> Click to enlarge full preview
            </span>
          </span>
        </button>

        {/* Bottom Caption */}
        <div className="p-4 bg-ink border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{caption}</p>
            </div>
            <a
              href={appHref}
              className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <span>Explore Interactive Run</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // A click that lands on the <dialog> itself is a click on the dimmed area around the panel.
          if (event.target === event.currentTarget) closeLightbox();
        }}
        className="lightbox on-dark m-auto w-[calc(100vw-2rem)] max-w-6xl max-h-[calc(100dvh-2rem)] bg-transparent p-0 text-white"
      >
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col bg-panel border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-panel-3 border-b border-white/10">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400" />
              <h2 id={titleId} className="truncate text-sm font-mono text-zinc-200 font-medium">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close screenshot"
              className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div tabIndex={0} aria-label={`${title}, full-size screenshot`} className="min-h-0 flex-1 overflow-auto p-2 bg-black focus-visible:-outline-offset-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} loading="lazy" className="w-full h-auto rounded-lg" />
          </div>
          <div className="px-4 sm:px-5 py-3 bg-panel-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
            <span>{caption}</span>
            <a href={appHref} className="shrink-0 text-blue-400 hover:underline font-mono">
              Open live app →
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
