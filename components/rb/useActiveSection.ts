"use client";

import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "@/lib/rb/data";
import { getSectionStops } from "./SmoothScroll";

/* Pin-aware active-section tracking.
   An enter-only IntersectionObserver can't handle nested anchors
   (#machine / #pilots live inside #racing): the ancestor overlaps the
   observer band continuously through the RB22 pin, so the highlight
   sticks to a stale section across long stretches with no event to
   correct it. A scroll-position rule over pin-aware stops has no dead
   zones and matches what KeyboardShortcuts treats as "current". */
export function useActiveSection(passedLine = 0.45) {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    let raf = 0;
    const kicks: number[] = [];

    const update = () => {
      raf = 0;
      const line = window.scrollY + window.innerHeight * passedLine;
      const stops = getSectionStops();
      let idx = 0;
      for (let i = 0; i < stops.length; i++) {
        if (stops[i] <= line) idx = i;
      }
      setActive(NAV_SECTIONS[idx]?.id ?? "hero");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    /* stops depend on ScrollTrigger measurements — re-check as the
       layout settles, same cadence as the refresh chain */
    kicks.push(
      window.setTimeout(onScroll, 120),
      window.setTimeout(onScroll, 600),
      window.setTimeout(onScroll, 1400),
      window.setTimeout(onScroll, 2600)
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      kicks.forEach(clearTimeout);
    };
  }, [passedLine]);

  return active;
}
