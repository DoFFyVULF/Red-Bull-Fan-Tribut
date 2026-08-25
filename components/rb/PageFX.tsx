"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { sound } from "@/lib/rb/sound";
import { scrollToSection } from "./SmoothScroll";

/* ═══════════════════════════════════════════════════════════
   PageFX — floating page-level effects:
   · cursor glow (fine pointers, motion-safe only)
   · back-to-top button (appears after 1500px)
   ═══════════════════════════════════════════════════════════ */
export default function PageFX() {
  const [showTop, setShowTop] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  /* back-to-top visibility */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 1500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* cursor glow — lerped follow via rAF, direct style writes */
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let gx = x;
    let gy = y;
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        gx = x;
        gy = y;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (glowRef.current) glowRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    const tick = () => {
      gx += (x - gx) * 0.12;
      gy += (y - gy) * 0.12;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      if (glowRef.current)
        glowRef.current.style.transform = `translate3d(${gx - 160}px, ${gy - 160}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* cursor: precise dot + trailing energy glow */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-1.5 w-1.5 rounded-full bg-rb-yellow opacity-0 shadow-[0_0_8px_rgba(255,211,0,0.9)] transition-opacity duration-300"
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[94] h-[320px] w-[320px] opacity-0 mix-blend-screen transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle, rgba(255,211,0,0.10) 0%, rgba(219,8,64,0.07) 32%, transparent 62%)",
        }}
      />

      {/* back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              sound.whoosh();
              scrollToSection("hero");
            }}
            aria-label="Back to top"
            className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-[75] flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-rb-carbon/70 text-rb-ice backdrop-blur-xl transition-all duration-300 hover:border-rb-yellow/60 hover:text-rb-yellow hover:shadow-[0_0_24px_rgba(255,211,0,0.25)] md:bottom-8 md:right-8"
          >
            <ArrowUp size={18} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rb-red pulse-dot text-rb-red" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
