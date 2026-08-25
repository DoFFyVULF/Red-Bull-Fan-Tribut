"use client";

import { Reveal, MarqueeRow } from "./ui-bits";
import { UNIVERSE_CARDS, UNIVERSE_TICKER } from "@/lib/rb/data";

/* ═══════════════════════════════════════════════════════════
   UniverseSection — Red Bull beyond Formula 1: football,
   hockey, motorcycles, air race, street events, media.
   ═══════════════════════════════════════════════════════════ */
export default function UniverseSection() {
  return (
    <section id="universe" className="relative z-10 overflow-hidden py-28 md:py-36" aria-label="The wider Red Bull universe">
      {/* navy band backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-rb-carbon via-rb-navy/25 to-rb-carbon" />
        <div className="speed-lines-yellow absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-24">
        <Reveal>
          <div className="caption-label flex items-center gap-3">
            <span className="h-px w-10 bg-rb-red" aria-hidden />
            <span>BEYOND THE GRID</span>
          </div>
          <h2 className="h2-display mt-5 text-rb-ice">
            MORE THAN RACING.
            <br />
            <span className="text-stroke-yellow">AN ENTIRE UNIVERSE.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-rb-mist md:text-lg">
            The energy never stayed in one lane. Clubs and rinks, racetracks on two wheels,
            pylons in the sky, soapboxes off cliffs — one brand quietly built worlds everywhere
            people push further.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UNIVERSE_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 0.08}>
              <article className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-rb-yellow/40 md:p-7">
                <div className="mono-data text-[10px] tracking-[0.24em] text-rb-yellow">{c.key}</div>
                <h3 className="font-display mt-3 text-xl font-black uppercase italic leading-none text-rb-ice md:text-2xl">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-rb-mist">{c.text}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5 pt-1">
                  {c.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-rb-mist transition-colors duration-300 group-hover:border-white/20 group-hover:text-rb-ice"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* universe ticker */}
      <div className="relative mt-16 border-y border-white/5 bg-rb-navy/25 py-4">
        <MarqueeRow
          items={UNIVERSE_TICKER}
          className="font-display text-sm font-bold uppercase tracking-[0.3em] text-rb-mist"
          speed="slow"
        />
      </div>
    </section>
  );
}
