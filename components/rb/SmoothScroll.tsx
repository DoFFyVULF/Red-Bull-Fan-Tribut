"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NAV_SECTIONS } from "@/lib/rb/data";
import { sceneState } from "@/lib/rb/scene";
import { sound } from "@/lib/rb/sound";

let lenisInstance: Lenis | null = null;

export function scrollToOffset(px: number) {
  if (lenisInstance) {
    lenisInstance.scrollTo(px, { offset: 0, duration: 1.6 });
  } else {
    window.scrollTo({ top: px, behavior: "smooth" });
  }
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  /* Pinned blocks are position:fixed for their whole pin range, so their
     bounding rect tracks the viewport and a rect-based target would land
     wherever we already are ("can"/"machine"). When the element is
     GSAP-pinned, jump to its pin start instead (+1px so the pin has
     engaged on arrival). */
  const st = ScrollTrigger.getAll().find((t) => t.pin === el);
  scrollToOffset(
    st ? Math.ceil(st.start) + 1 : Math.round(el.getBoundingClientRect().top + window.scrollY)
  );
}

/* Document-space Y of every NAV_SECTIONS stop, pin-aware: a GSAP-pinned
   section's real "start" is its trigger start — its rect is viewport-
   locked for the whole pin range. Shared by keyboard stepping and active
   tracking so arrows land inside long pins instead of skipping them. */
export function getSectionStops(): number[] {
  return NAV_SECTIONS.map(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return Number.POSITIVE_INFINITY;
    const st = ScrollTrigger.getAll().find((t) => t.pin === el);
    if (st) return Math.ceil(st.start) + 1;
    return Math.round(el.getBoundingClientRect().top + window.scrollY);
  });
}

export function lockScroll(locked: boolean) {
  if (!lenisInstance) return;
  if (locked) lenisInstance.stop();
  else lenisInstance.start();
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof window !== "undefined") {
      // QA/debug handle
      (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneState.reduced = reduced;

    if (reduced) {
      // no smooth scroll — let native behavior handle it, but still
      // re-measure triggers after layout settles
      const refreshAll = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") requestAnimationFrame(refreshAll);
      else window.addEventListener("load", () => requestAnimationFrame(refreshAll), { once: true });
      [600, 1400, 2600].forEach((ms) => window.setTimeout(refreshAll, ms));
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* ── layout-settle refresh chain ─────────────────────────
       Pinned triggers cache their start position at creation;
       late layout growth (moto pin-spacing flip, image decode,
       font swap) shifts sections below. Re-measure on load,
       after fonts settle, and on a short settling cadence. */
    const refreshAll = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      requestAnimationFrame(refreshAll);
    } else {
      window.addEventListener("load", () => requestAnimationFrame(refreshAll), { once: true });
    }
    const settleTimers = [600, 1400, 2600].map((ms) =>
      window.setTimeout(refreshAll, ms)
    );
    document.fonts?.ready?.then(() => requestAnimationFrame(refreshAll)).catch(() => {});

    // keep pointer state for parallax
    const onPointer = (e: PointerEvent) => {
      sceneState.px = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // subtle synthesized tick on interactive-element clicks (only when sound on)
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("button, a[href], [role=tab]")) sound.click(760, 0.035, 0.09);
    };
    document.addEventListener("click", onDocClick, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onDocClick);
      settleTimers.forEach(clearTimeout);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
