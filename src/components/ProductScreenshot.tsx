"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group relative rounded-xl border border-white/10 bg-[#0B0B0F] overflow-hidden shadow-2xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/5">
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0F0F14] border-b border-white/[0.08] select-none">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#EF4444]/80 border border-[#EF4444]" />
            <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80 border border-[#F59E0B]" />
            <div className="h-3 w-3 rounded-full bg-[#10B981]/80 border border-[#10B981]" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/40 border border-white/[0.06] text-[11px] font-mono text-zinc-400 max-w-[280px] sm:max-w-md truncate">
            <span className="text-blue-400">https://</span>
            <span className="text-zinc-200 font-medium">thepathflow.online</span>
            <span className="text-zinc-500">{urlPath}</span>
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {badge}
              </span>
            )}
            <button
              onClick={() => setIsOpen(true)}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
              title="Expand screenshot"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Screenshot Image Frame */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative cursor-pointer overflow-hidden bg-black/60 aspect-[16/10] sm:aspect-[16/9.5]"
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
            loading={priority ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-xs font-mono text-white bg-black/80 px-2.5 py-1 rounded border border-white/20 flex items-center gap-1.5">
              <Maximize2 className="h-3 w-3 text-blue-400" /> Click to enlarge full preview
            </span>
          </div>
        </div>

        {/* Bottom Caption */}
        <div className="p-4 bg-[#09090D] border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{caption}</p>
            </div>
            <a
              href="https://thepathflow.online/app/runs/path-1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <span>Explore Interactive Run</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full bg-[#0E0E12] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#14141A] border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-mono text-zinc-200 font-medium">{title}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto p-2 bg-black">
              <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
            </div>
            <div className="px-5 py-3 bg-[#101014] border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>{caption}</span>
              <a
                href="https://thepathflow.online/app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-mono"
              >
                Open live app →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
