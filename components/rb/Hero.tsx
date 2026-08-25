"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRBStore, sceneState } from "@/lib/rb/scene";
import { BRAND_TICKER } from "@/lib/rb/data";
import { MarqueeRow } from "./ui-bits";

const LINES = [
  { text: "GIVES", cls: "text-rb-ice", delay: 0 },
  { text: "YOU", cls: "text-stroke", delay: 0.18 },
  {
    text: "WINGS",
    cls: "text-rb-yellow drop-shadow-[0_0_36px_rgba(255,211,0,0.35)]",
    delay: 0.36,
  },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const loaded = useRBStore((s) => s.loaded);

  /* headline intro — letters blur in */
  useEffect(() => {
    if (!loaded) return;
    const letters = headline.current?.querySelectorAll("[data-letter]");
    if (!letters?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* the meta rows carry opacity-0 in markup for the intro — without
         the timeline they must be shown explicitly */
      gsap.set("[data-hero-meta]", { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(
      letters,
      { opacity: 0, y: 90, filter: "blur(22px)", rotateX: -40 },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        rotateX: 0,
        duration: 1.15,
        ease: "expo.out",
        stagger: { each: 0.038, from: "start" },
      }
    );
    tl.fromTo(
      "[data-hero-meta]",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 },
      "-=0.7"
    );
    return () => {
      tl.kill();
    };
  }, [loaded]);

  /* scroll progress + parallax */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      /* progress across the hero scroll range */
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          sceneState.hero = self.progress;
        },
      });

      /* visibility — generous bounds, gap-free with the CAN pin */
      const heroVis = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (typeof self.isActive === "boolean") sceneState.heroActive = self.isActive;
        },
        onRefresh: (self) => {
          if (typeof self.isActive === "boolean") sceneState.heroActive = self.isActive;
        },
        onToggle: (self) => {
          sceneState.heroActive = !!self.isActive;
        },
      });
      sceneState.heroActive = !!heroVis.isActive;

      gsap.to(headline.current, {
        y: -160,
        opacity: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });

      gsap.to("[data-hero-fade]", {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "45% top",
          scrub: 0.5,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      className="relative z-10 flex h-[130svh] flex-col overflow-hidden"
      aria-label="Hero — Gives You Wings"
    >
      {/* diagonal speed lines backdrop */}
      <div aria-hidden className="speed-lines pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="halftone halftone-fade pointer-events-none absolute inset-0 opacity-40"
      />

      {/* headline block — upper half, 3D can floats behind */}
      <div className="flex flex-1 flex-col items-center justify-start px-6 pt-[13svh] md:pt-[15svh]">
        <div data-hero-meta data-hero-fade className="caption-label mb-8 flex max-w-full flex-wrap items-center justify-center gap-3 text-center opacity-0">
          <span className="h-px w-5 shrink-0 bg-rb-red md:w-8" />
          An unofficial fan tribute
          <span className="h-px w-5 shrink-0 bg-rb-red md:w-8" />
        </div>

        <div ref={headline} className="text-center" style={{ perspective: "900px" }}>
          {LINES.map((line, li) => (
            <h1
              key={li}
              className={`leading-[0.88] ${
                li === 1 ? "text-[clamp(2rem,5.6vw,5rem)]" : "h-display-italic text-[clamp(2.7rem,8.4vw,7.6rem)]"
              }`}
              aria-label={line.text}
            >
              <span className="sr-only" aria-hidden="false">
                {line.text}{" "}
              </span>
              <span aria-hidden className={line.cls}>
                {line.text.split("").map((ch, i) => (
                  <span key={i} data-letter className="reveal-letter">
                    {ch}
                  </span>
                ))}
              </span>
            </h1>
          ))}
        </div>

        <p
          data-hero-meta
          data-hero-fade
          className="mt-8 hidden max-w-xl text-balance text-center text-base font-light leading-relaxed text-rb-mist opacity-0 md:block"
        >
          One can of pure energy. One team that rewrote Formula 1. This is the world of Red Bull —
          rebuilt as one cinematic scroll.
        </p>
      </div>

      {/* bottom meta row */}
      <div
        data-hero-fade
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-24 md:px-12 md:pb-28"
      >
        <div data-hero-meta className="caption-label hidden md:flex md:flex-col md:items-start md:gap-1.5">
          <span className="mono-data text-rb-yellow">EST. 1987</span>
          <span>250 ml · energy drink</span>
          <span>taurine + b-vitamins</span>
        </div>

        <div data-hero-meta className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-28">
          <span className="caption-label text-[10px]">Scroll</span>
          <span className="flex h-12 w-7 items-start justify-center rounded-full border border-white/25 p-1.5">
            <span className="h-2.5 w-1 rounded-full bg-rb-yellow animate-scroll-hint" />
          </span>
        </div>

        <div data-hero-meta className="caption-label hidden text-right md:flex md:flex-col md:items-end md:gap-1.5">
          <span className="mono-data text-rb-red">F1 · ENERGY</span>
          <span>one can · one team</span>
          <span>one scroll</span>
        </div>
      </div>

      {/* brand ticker — bottom edge of hero */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/5 bg-rb-carbon/40 py-3 backdrop-blur-sm">
        <MarqueeRow
          items={BRAND_TICKER}
          className="mono-data text-[10px] uppercase tracking-[0.3em] text-rb-mist"
          speed="slow"
          separator="/"
        />
      </div>

      {/* ambient gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_62%,rgba(0,20,137,0.55),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-rb-carbon to-transparent"
      />
    </section>
  );
}
