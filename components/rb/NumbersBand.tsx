"use client";

import { Counter, MarqueeRow, Reveal } from "./ui-bits";
import { BRAND_NUMBERS, WORLD_TICKER } from "@/lib/rb/data";

/* ═══════════════════════════════════════════════════════════
   NumbersBand — one screen of brand scale: photo backdrop,
   oversized counters, ticker. The "how big is this" moment.
   ═══════════════════════════════════════════════════════════ */
export default function NumbersBand() {
  return (
    <section id="numbers" className="relative z-10 overflow-hidden" aria-label="Red Bull in numbers">
      {/* photo backdrop with heavy brand overlay */}
      <div className="absolute inset-0" aria-hidden>
        <img
          src="/images/crowd-fans.jpg"
          alt=""
          className="h-full w-full object-cover opacity-25 saturate-[0.6]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rb-carbon via-rb-carbon/80 to-rb-carbon" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,20,137,0.35),transparent_75%)]" />
        <div className="speed-lines absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40 lg:px-24">
        <Reveal>
          <div className="caption-label flex items-center gap-3">
            <span className="h-px w-10 bg-rb-yellow" aria-hidden />
            <span>THE SCALE</span>
          </div>
          <h2 className="h2-display mt-5 text-rb-ice">
            NOT A DRINK.
            <br />
            <span className="text-stroke-yellow">AN INDUSTRY OF ENERGY.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-8">
          {BRAND_NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.08}>
              <div className="group relative border-l border-white/15 pl-5 transition-colors duration-500 hover:border-rb-yellow/70 md:pl-7">
                <Counter
                  value={n.value}
                  decimals={n.decimals ?? 0}
                  suffix={n.suffix}
                  prefix={n.prefix}
                  className="mono-data block text-2xl font-bold text-rb-ice transition-colors duration-300 group-hover:text-rb-yellow min-[375px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                />
                <div className="caption-label mt-2 text-[10px] leading-relaxed">{n.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* world ticker */}
      <div className="relative border-y border-white/5 bg-rb-navy/30 py-4">
        <MarqueeRow
          items={WORLD_TICKER}
          className="font-display text-sm font-bold uppercase tracking-[0.3em] text-rb-mist"
          speed="slow"
        />
      </div>
    </section>
  );
}
