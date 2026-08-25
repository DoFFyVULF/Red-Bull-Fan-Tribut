"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_SECTIONS } from "@/lib/rb/data";
import { sound } from "@/lib/rb/sound";
import { getSectionStops, scrollToOffset, scrollToSection } from "./SmoothScroll";
import { useActiveSection } from "./useActiveSection";

/* ═══════════════════════════════════════════════════════════
   KeyboardShortcuts — global hotkeys:
   · ↑/↓ or PageUp/PageDown — jump between sections
   · Home/End — first/last section
   · M — toggle sound design
   ═══════════════════════════════════════════════════════════ */
export default function KeyboardShortcuts() {
  useEffect(() => {
    /* Steps run over pin-aware document stops, not section ids: an
       ArrowDown fired in the band before a pin engages must land on the
       pin's first frame, not fly over the whole pinned sequence. */
    const EPS = 2; // ignore sub-pixel drift around a stop

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      const stops = getSectionStops().filter(Number.isFinite);
      const y = window.scrollY;

      let handled = true;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown": {
          const next = stops.find((s) => s > y + EPS);
          if (next !== undefined) {
            sound.whoosh();
            scrollToOffset(next);
          }
          break;
        }
        case "ArrowUp":
        case "PageUp": {
          const prev = [...stops].reverse().find((s) => s < y - EPS);
          if (prev !== undefined) {
            sound.whoosh();
            scrollToOffset(prev);
          }
          break;
        }
        case "Home":
          if (stops[0] !== undefined) {
            sound.whoosh();
            scrollToOffset(stops[0]);
          }
          break;
        case "End":
          if (stops[stops.length - 1] !== undefined) {
            sound.whoosh();
            scrollToOffset(stops[stops.length - 1]);
          }
          break;
        case "m":
        case "M":
          document
            .querySelector<HTMLButtonElement>('button[aria-label*="sound"]')
            ?.click();
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}

/* ═══════════════════════════════════════════════════════════
   ScrollChrome — fixed page chrome:
   · top scroll-progress rail (rAF-driven, ref style writes)
   · right-side section dots with hover tooltips (desktop)
   ═══════════════════════════════════════════════════════════ */
export function ScrollChrome() {
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const active = useActiveSection();
  const [hover, setHover] = useState<string | null>(null);

  /* progress bar — passive scroll listener + rAF batched writes */
  useEffect(() => {
    let raf = 0;
    let pending = false;
    const update = () => {
      pending = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}`.padStart(2, "0");
    };
    const onScroll = () => {
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    sound.whoosh();
    scrollToSection(id);
  };

  return (
    <>
      {/* top progress rail */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[85] h-[3px] bg-white/[0.06]"
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-rb-red via-rb-orange to-rb-yellow shadow-[0_0_12px_rgba(219,8,64,0.55)]"
        />
      </div>

      {/* right-side dot navigation — desktop only. The nav itself ignores
          pointer events; only the dot buttons take them, so this strip can
          never swallow hovers from page content beneath (footer socials). */}
      <nav
        aria-label="Section navigation dots"
        className="pointer-events-none fixed right-5 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
      >
        {/* live percentage readout */}
        <span className="mono-data mb-1 text-[10px] tracking-[0.14em] text-rb-mist/80">
          <span ref={pctRef}>00</span>
          <span className="text-rb-mist/50">%</span>
        </span>

        {NAV_SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          const isHover = hover === id;
          return (
            <button
              key={id}
              onClick={() => go(id)}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover(null)}
              aria-label={`Go to ${label}`}
              aria-current={isActive ? "true" : undefined}
              className="group pointer-events-auto relative flex h-8 items-center gap-3"
            >
              {/* tooltip — absolutely positioned: in-flow it would widen the
                  button's hit area into the page beneath it */}
              <span
                className={`pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                  isHover
                    ? "translate-x-0 border-rb-red/50 bg-rb-carbon/90 text-rb-ice opacity-100 backdrop-blur-md"
                    : "translate-x-2 border-transparent opacity-0"
                }`}
              >
                {label}
              </span>

              {/* dot */}
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-2.5 w-2.5 bg-rb-yellow shadow-[0_0_10px_rgba(255,211,0,0.7)]"
                    : "h-1.5 w-1.5 bg-rb-mist/50 group-hover:bg-rb-ice"
                }`}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
