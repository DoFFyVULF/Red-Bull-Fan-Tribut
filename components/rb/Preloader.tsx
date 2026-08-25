"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRBStore, sceneState } from "@/lib/rb/scene";
import { lockScroll } from "./SmoothScroll";
import { BullsLogo } from "./ui-bits";

const PRELOAD_IMAGES = ["/images/f1-car-track.jpg", "/images/crowd-fans.jpg"];

export default function Preloader() {
  const progress = useRBStore((s) => s.progress);
  const loaded = useRBStore((s) => s.loaded);
  const setProgress = useRBStore((s) => s.setProgress);
  const setLoaded = useRBStore((s) => s.setLoaded);
  const root = useRef<HTMLDivElement>(null);
  const barFill = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    lockScroll(true);
    document.documentElement.style.overflow = "hidden";
    /* overflow:hidden on <html> doesn't stop iOS rubber-band — cut the
       chain at the body level for the duration of the lock */
    document.body.style.overscrollBehavior = "none";

    /* preload a couple of key images while the counter runs */
    let imgsDone = 0;
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        imgsDone++;
      };
      img.src = src;
    });

    const proxy = { v: 0 };
    const counter = gsap.to(proxy, {
      v: 100,
      duration: 2.6,
      ease: "power2.inOut",
      onUpdate: () => {
        const shown = Math.round(proxy.v * 0.9 + (imgsDone / PRELOAD_IMAGES.length) * 10);
        setProgress(Math.min(99, shown));
        if (barFill.current) {
          barFill.current.style.transform = `scaleX(${proxy.v / 100})`;
        }
      },
      onComplete: () => setProgress(100),
    });

    /* wordmark letters idle drift */
    const letters = wordmark.current?.querySelectorAll("[data-l]");
    if (letters && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        letters,
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09, duration: 0.9, ease: "power3.out", delay: 0.25 }
      );
    }

    const finish = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      counter.kill();

      const tl = gsap.timeline({
        onComplete: () => {
          setLoaded(true);
          sceneState.started = true;
          document.documentElement.style.overflow = "";
          document.body.style.overscrollBehavior = "";
          lockScroll(false);
          window.dispatchEvent(new CustomEvent("rb:ready"));
        },
      });

      /* percentage stamp */
      tl.to(root.current?.querySelector("[data-pct]") ?? {}, {
        scale: 1.12,
        duration: 0.28,
        ease: "power2.in",
      });
      tl.to(root.current?.querySelector("[data-pct]") ?? {}, {
        opacity: 0,
        scale: 0.86,
        duration: 0.4,
        ease: "power2.out",
      });

      /* logo lifts & blooms */
      tl.to(
        root.current?.querySelector("[data-logo]") ?? {},
        { scale: 1.28, opacity: 0, filter: "blur(10px)", duration: 0.85, ease: "power3.inOut" },
        "-=0.32"
      );

      /* curtain splits */
      tl.to(
        root.current?.querySelectorAll("[data-curtain]") ?? [],
        { yPercent: (i: number) => (i === 0 ? -100 : 100), duration: 1.05, ease: "expo.inOut", stagger: 0.06 },
        "-=0.55"
      );
      tl.to(root.current, { autoAlpha: 0, duration: 0.01 }, "-=0.1");
      tl.set(root.current, { display: "none" });

      /* camera dolly-in in the 3D scene */
      tl.to(sceneState, { intro: 1, duration: 2.0, ease: "power3.out" }, "-=1.0");
    };

    const minTimer = setTimeout(finish, 2900);

    return () => {
      clearTimeout(minTimer);
      counter.kill();
      document.documentElement.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  if (loaded && root.current?.style.display === "none") return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      aria-hidden={loaded}
      role="status"
      aria-label="Loading experience"
    >
      {/* split curtains */}
      <div data-curtain className="absolute inset-x-0 top-0 h-1/2 bg-rb-carbon" />
      <div data-curtain className="absolute inset-x-0 bottom-0 h-1/2 bg-rb-carbon" />
      <div className="absolute inset-0 racing-grid-bg opacity-40" />

      <div className="relative z-10 flex flex-col items-center">
        <div data-logo className="animate-float">
          <BullsLogo size={148} className="h-auto w-[min(148px,42vw)]" />
        </div>

        <div ref={wordmark} className="mt-8 font-display text-2xl font-black uppercase tracking-[0.5em] text-rb-ice md:text-3xl">
          {"RED BULL".split("").map((ch, i) => (
            <span key={i} data-l className="inline-block">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </div>
        <div className="caption-label mt-3 text-rb-mist">Fan tribute · unofficial</div>

        {/* progress */}
        <div className="mt-14 flex w-[min(420px,72vw)] flex-col items-center gap-3">
          <div className="h-px w-full overflow-hidden bg-white/10">
            <div
              ref={barFill}
              className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-rb-red via-rb-orange to-rb-yellow"
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="caption-label text-[10px]">Loading wings</span>
            <span
              data-pct
              className="mono-data text-sm font-medium tracking-widest text-rb-yellow"
            >
              {String(progress).padStart(3, "0")}%
            </span>
          </div>
        </div>
      </div>

      {/* corner meta */}
      <div className="absolute left-6 top-6 caption-label hidden md:block">EST. 1987</div>
      <div className="absolute right-6 top-6 caption-label hidden md:block">MATTERS OF ENERGY</div>
      <div className="absolute bottom-6 left-6 caption-label hidden md:block">3D · SHADERS · SCROLL</div>
      <div className="absolute bottom-6 right-6 caption-label hidden md:block">V1.0 FAN BUILD</div>
    </div>
  );
}
