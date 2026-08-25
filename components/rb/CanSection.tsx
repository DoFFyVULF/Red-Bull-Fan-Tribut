"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { CAN_LAYERS, INGREDIENTS } from "@/lib/rb/data";
import { sceneState, useRBStore } from "@/lib/rb/scene";

const PHASES = ["ORBIT", "LAYERS", "360°", "INSIDE"] as const;

export default function CanSection() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  const ingredient = useRBStore((s) => s.ingredient);
  const setIngredient = useRBStore((s) => s.setIngredient);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=340%",
          pin: true,
          pinType: "fixed",
          /* refresh before the pins below measure */
          refreshPriority: 4,
          scrub: 0.55,
          anticipatePin: 1,
          onUpdate: (self) => {
            const c = self.progress;
            sceneState.can = c;

            /* phase for HUD state */
            const ph = c < 0.22 ? 0 : c < 0.5 ? 1 : c < 0.76 ? 2 : 3;
            setPhase((p) => (p === ph ? p : ph));
          },
          onToggle: (self) => {
            sceneState.canActive = !!self.isActive;
            if (!self.isActive) setIngredient(-1);
          },
          onRefresh: (self) => {
            if (typeof self.isActive === "boolean") sceneState.canActive = self.isActive;
          },
        },
      });

      /* sync flag once after init (isActive computed post-init) */
      if (tl.scrollTrigger) sceneState.canActive = !!tl.scrollTrigger.isActive;

      /* — phase captions — */
      tl.fromTo("[data-cap='orbit']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.015);
      tl.to("[data-cap='orbit']", { autoAlpha: 0, y: -16, duration: 0.04 }, 0.19);

      tl.fromTo("[data-cap='layers']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.24);
      tl.to("[data-cap='layers']", { autoAlpha: 0, y: -16, duration: 0.04 }, 0.47);

      tl.fromTo("[data-cap='flavors']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.53);
      tl.to("[data-cap='flavors']", { autoAlpha: 0, y: -16, duration: 0.04 }, 0.73);

      tl.fromTo("[data-cap='inside']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.79);

      /* — explode layer chips — */
      tl.fromTo(
        "[data-layer]",
        { autoAlpha: 0, scale: 0.8, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.05, stagger: 0.018 },
        0.26
      );
      tl.to("[data-layer]", { autoAlpha: 0, scale: 0.85, y: -14, duration: 0.04, stagger: 0.012 }, 0.47);

      /* — ingredients panel — */
      tl.fromTo(
        "[data-ingredients]",
        { autoAlpha: 0, x: -70 },
        { autoAlpha: 1, x: 0, duration: 0.07, stagger: 0.016 },
        0.8
      );

      /* — progress rail fill — */
      tl.fromTo("[data-railfill]", { scaleY: 0 }, { scaleY: 1, duration: 1, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, [setIngredient]);

  return (
    <section ref={root} id="can" className="relative z-10 overflow-hidden" aria-label="The Can — interactive product section">
      <div className="relative flex h-svh w-full flex-col">
        {/* heading */}
        <div className="pointer-events-none absolute left-6 top-20 z-20 md:left-12 md:top-24">
          <div className="caption-label mb-3 flex items-center gap-2">
            <span className="h-px w-10 bg-rb-yellow" />
            <span>THE CAN</span>
          </div>
          <h2 className="h2-display-italic text-[clamp(2.2rem,4.6vw,4rem)]">
            250&nbsp;ML OF
            <br />
            <span className="text-energy-gradient">PURE ENERGY</span>
          </h2>
        </div>

        {/* phase captions */}
        <div className="pointer-events-none absolute bottom-28 left-6 z-20 md:bottom-32 md:left-12">
          <p data-cap="orbit" className="caption-label max-w-[240px] leading-relaxed">
            Scroll to orbit the can — every angle catches a different light.
          </p>
          <p data-cap="layers" className="caption-label absolute inset-0 max-w-[240px] leading-relaxed opacity-0">
            Four layers of engineering — from shell to liquid core.
          </p>
          <p data-cap="flavors" className="caption-label absolute inset-0 max-w-[240px] leading-relaxed opacity-0">
            Keep scrolling — every side of the can has its own story.
          </p>
        </div>

        {/* inside-phase caption — bottom-right on ≥md so the ingredients
            list owns the left column; below md it moves above the panel,
            where it would otherwise sit on top of the ingredient buttons */}
        <p
          data-cap="inside"
          className="caption-label pointer-events-none absolute bottom-28 right-6 z-20 hidden max-w-[240px] text-right leading-relaxed opacity-0 md:bottom-32 md:right-12 md:block"
        >
          Tap an ingredient to zoom into what&apos;s inside.
        </p>

        {/* explode layer chips */}
        {CAN_LAYERS.map((l) => (
          <div
            key={l.label}
            data-layer
            className={`pointer-events-none absolute z-20 flex items-center gap-3 opacity-0 ${l.pos}`}
          >
            <span className={`h-2 w-2 rounded-full ${l.dot} shadow-[0_0_14px_currentColor]`} />
            <div className="glass-card-strong rounded-lg px-4 py-2.5">
              <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-rb-ice">{l.label}</div>
              <div className="mt-0.5 text-[11px] text-rb-mist">{l.note}</div>
            </div>
          </div>
        ))}

        {/* ingredients panel — phase 4 */}
        <div
          className={`absolute bottom-24 left-6 z-20 w-[min(380px,84vw)] md:bottom-28 md:left-12 ${
            phase === 3 ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <p
            data-cap="inside"
            className="caption-label pointer-events-none absolute -top-9 right-1 max-w-[240px] text-right leading-relaxed opacity-0 md:hidden"
          >
            Tap an ingredient to zoom into what&apos;s inside.
          </p>
          <div data-lenis-prevent className="max-h-[52vh] overflow-y-auto overscroll-contain pb-2 nice-scroll pr-1">
            <div className="caption-label mb-4 flex items-center gap-2">
              <span className="mono-data text-rb-yellow">INSIDE THE CAN</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {INGREDIENTS.map((ing, i) => (
                <li key={ing.name}>
                  <button
                    data-ingredients
                    onClick={() => setIngredient(ingredient === i ? -1 : i)}
                    aria-expanded={ingredient === i}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                      ingredient === i
                        ? "border-rb-yellow/60 bg-rb-yellow/10"
                        : "border-white/10 bg-rb-carbon/60 backdrop-blur-md hover:border-white/25 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-rb-ice">
                      {ing.name}
                    </span>
                    <span className="mono-data text-xs text-rb-yellow">{ing.value}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* ingredient detail card */}
            {ingredient >= 0 && INGREDIENTS[ingredient] && (
              <div className="glass-card-strong mt-4 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="caption-label text-[10px]">{INGREDIENTS[ingredient].name}</div>
                    <div className="mono-data mt-1 text-2xl font-bold text-rb-yellow">
                      {INGREDIENTS[ingredient].value}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-rb-mist">{INGREDIENTS[ingredient].note}</p>
                  </div>
                  <button
                    onClick={() => setIngredient(-1)}
                    aria-label="Close ingredient details"
                    className="max-md:h-11 max-md:w-11 cursor-pointer rounded-full border border-white/15 p-1.5 text-rb-mist transition-colors hover:text-rb-ice"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* phase progress rail */}
        <div className="pointer-events-none absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-4 md:right-14 md:flex">
          <div className="relative h-40 w-px overflow-hidden bg-white/10">
            <div data-railfill className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-gradient-to-b from-rb-yellow to-rb-red" />
          </div>
          {PHASES.map((p, i) => (
            <span
              key={p}
              className={`mono-data text-[9px] tracking-[0.16em] transition-colors duration-300 ${
                phase === i ? "text-rb-yellow" : "text-rb-mist/50"
              }`}
            >
              {p}
            </span>
          ))}
        </div>

        {/* ambient glow behind everything */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-60 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse 55% 60% at ${phase === 3 ? "70%" : "50%"} 55%, rgba(0,20,137,0.4), transparent 70%)`,
          }}
        />

        {/* bottom fade into next section */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-rb-carbon/90 to-transparent" />
      </div>
    </section>
  );
}
