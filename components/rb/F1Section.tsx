"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { F1_DRIVERS, F1_SEASON_STATS, F1_TIMELINE, RB22_FEATURES, MACHINE_STATS, RED_BULL_RING, type F1Driver } from "@/lib/rb/data";
import { sceneState } from "@/lib/rb/scene";
import { Counter, MarqueeRow, Reveal, SectionHeading } from "./ui-bits";

export default function F1Section() {
  const sectionRoot = useRef<HTMLElement>(null);
  const trackBlock = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const overrideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      /* ── pre-frame the RB22 while the pinned block scrolls into view.
         Range [top bottom → top top] hands off seamlessly to f1Active
         at the exact pin boundary — no gap, no premature firing
         while the can section is still on screen. ── */
      ScrollTrigger.create({
        trigger: trackBlock.current,
        start: "top bottom",
        end: "top top",
        onToggle: (self) => {
          sceneState.f1Near = self.isActive;
        },
        onRefresh: (self) => {
          sceneState.f1Near = self.isActive;
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackBlock.current,
          start: "top top",
          end: "+=330%",
          pin: true,
          pinType: "fixed",
          /* refresh before the pins below measure */
          refreshPriority: 3,
          scrub: 0.55,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            sceneState.f1 = p;

            /* wind-tunnel airflow readout */
            const air = Math.round(70 + 290 * Math.pow(Math.abs(Math.sin(p * Math.PI * 1.35)), 1.15));
            if (speedRef.current) speedRef.current.textContent = String(air);

            /* active-aero trim: X on straights, Z through the middle sweep */
            if (modeRef.current) {
              const zMode = p > 0.3 && p < 0.66;
              modeRef.current.dataset.mode = zMode ? "Z" : "X";
              modeRef.current.textContent = zMode ? "Z-MODE" : "X-MODE";
            }

            /* manual override lights up for the finale */
            if (overrideRef.current) {
              overrideRef.current.dataset.open = p > 0.82 ? "1" : "0";
            }
          },
          onToggle: (self) => {
            sceneState.f1Active = !!self.isActive;
          },
          onRefresh: (self) => {
            if (typeof self.isActive === "boolean") sceneState.f1Active = self.isActive;
          },
        },
      });

      /* sync flag once after init (isActive computed post-init) */
      if (tl.scrollTrigger) sceneState.f1Active = !!tl.scrollTrigger.isActive;

      /* night overlay */
      tl.fromTo("[data-night]", { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "none" }, 0.18);
      tl.to("[data-night]", { opacity: 0.85, duration: 0.27, ease: "none" }, 0.73);

      /* tech feature cards */
      const cornerTl = [
        { at: 0.03, el: "[data-corner='0']" },
        { at: 0.235, el: "[data-corner='1']" },
        { at: 0.69, el: "[data-corner='2']" },
        { at: 0.83, el: "[data-corner='3']" },
      ];
      cornerTl.forEach(({ at, el }) => {
        tl.fromTo(el, { autoAlpha: 0, y: 34, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.045 }, at);
        tl.to(el, { autoAlpha: 0, y: -26, scale: 0.96, duration: 0.04 }, at + 0.1);
      });

      /* final straight banner */
      tl.fromTo("[data-lapdone]", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.93);
      tl.to("[data-lapdone]", { autoAlpha: 0, scale: 1.15, duration: 0.05 }, 0.985);
    }, sectionRoot);

    /* safety: reset the near-flag when the whole section unmounts */
    return () => {
      sceneState.f1Near = false;
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRoot} id="racing" className="relative z-10" aria-label="Formula 1 — Oracle Red Bull Racing">
      {/* ── intro ── */}
      <div className="relative overflow-hidden py-28 md:py-36">
        {/* track photo banner backdrop */}
        <div className="absolute inset-0" aria-hidden>
          <img
            src="/images/f1-car-track.jpg"
            alt=""
            className="h-full w-full object-cover opacity-20 saturate-[0.75]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-rb-carbon via-rb-carbon/85 to-rb-carbon" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-24">
          <SectionHeading kicker="FORMULA 1 · ORACLE RED BULL RACING" title="APEX" outline="PREDATORS" />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-rb-mist md:text-lg">
              From buying a Jaguar team in 2005 to the most dominant machine the sport has ever seen.
              Six constructors&apos; crowns, eight drivers&apos; titles — and a 2026 challenger born into
              a whole new rulebook. Scroll on: the RB22 is waiting in the wind tunnel.
            </p>
          </Reveal>

          {/* timeline — 5 columns only from lg; at 768–1023px five cards
              squeeze to unusable ~80px text columns */}
          <div className="mt-16 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {F1_TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div className="group relative h-full rounded-xl border border-white/10 bg-rb-carbon/60 p-5 transition-colors duration-300 hover:border-rb-red/50 hover:bg-rb-red/[0.06] backdrop-blur-md">
                  <div className="mono-data text-stroke text-3xl font-bold">{t.year}</div>
                  <div className="mt-3 font-display text-sm font-bold uppercase tracking-[0.1em] text-rb-ice">
                    {t.title}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-rb-mist">{t.text}</p>
                  <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-rb-red opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>

          {/* circuit card */}
          <Reveal className="mt-12">
            <div className="glass-card flex flex-col gap-7 rounded-2xl p-7 md:p-9 lg:flex-row lg:items-center lg:gap-10">
              {/* satellite view of the ring */}
              <figure className="group relative w-full shrink-0 overflow-hidden rounded-xl border border-white/10 lg:w-[300px]">
                <img
                  src="/images/ring-aerial.jpg"
                  alt="Satellite view of the Red Bull Ring circuit"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                />
                <figcaption className="caption-label absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-[9px] backdrop-blur-sm">
                  FROM ORBIT · © PLANET LABS
                </figcaption>
              </figure>

              <div>
                <div className="caption-label">HOME GRAND PRIX</div>
                <h3 className="font-display mt-2 text-2xl font-black uppercase italic text-rb-ice md:text-4xl">
                  {RED_BULL_RING.name}
                </h3>
                <p className="mt-1 text-sm text-rb-mist">{RED_BULL_RING.location}</p>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <div>
                  <div className="mono-data text-xl font-bold text-rb-yellow">{RED_BULL_RING.lengthKm} km</div>
                  <div className="caption-label mt-1 text-[9px]">Lap length</div>
                </div>
                <div>
                  <div className="mono-data text-xl font-bold text-rb-ice">{RED_BULL_RING.turns}</div>
                  <div className="caption-label mt-1 text-[9px]">Turns · {RED_BULL_RING.drsZones} DRS</div>
                </div>
                <div>
                  <div className="mono-data text-xl font-bold text-rb-ice">{RED_BULL_RING.altitudeM} m</div>
                  <div className="caption-label mt-1 text-[9px]">Altitude</div>
                </div>
                <div>
                  <div className="mono-data text-xl font-bold text-rb-ice">{RED_BULL_RING.lapRecord}</div>
                  <div className="caption-label mt-1 text-[9px]">Record · {RED_BULL_RING.lapRecordHolder}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="relative mt-20 border-y border-white/5 bg-rb-navy/20 py-4">
          <MarqueeRow
            items={["21 WINS IN 22 RACES", "860 CONSTRUCTORS' POINTS", "4 TITLES IN A ROW", "RB19 · RB21 · RB22", "NEWEY AERO", "SPIELBERG 677 M"]}
            className="font-display text-sm font-bold uppercase tracking-[0.3em] text-rb-mist"
            speed="slow"
          />
        </div>
      </div>

      {/* ── pinned wind-tunnel experience ──
          id anchors nav links + keyboard arrows; scrollToSection resolves
          the offset through this block's ScrollTrigger while it's pinned */}
      <div
        ref={trackBlock}
        id="machine"
        className="relative h-svh w-full overflow-hidden"
      >
        {/* dusk → night overlay */}
        <div
          data-night
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,4,18,0.72) 0%, rgba(10,14,39,0.1) 45%, rgba(2,4,18,0.8) 100%), radial-gradient(ellipse 80% 60% at 50% 110%, rgba(0,20,137,0.5), transparent)",
          }}
        />

        {/* top-left: machine kicker */}
        <div className="pointer-events-none absolute left-6 top-20 z-20 md:left-12 md:top-24">
          <div className="caption-label flex items-center gap-2">
            <span aria-hidden className="h-px w-10 bg-rb-red" />
            <span>THE MACHINE</span>
          </div>
          <div
            className="h-display-italic mt-3 whitespace-nowrap pr-3 leading-[0.95] text-rb-ice"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 5.25rem)", lineHeight: 1.05 }}
          >
            RB<span className="text-energy-gradient">22</span>
          </div>
          <div className="mt-2 max-w-[140px] text-[11px] leading-relaxed text-rb-mist sm:max-w-[220px]">
            Oracle Red Bull Racing — the 2026 challenger in the wind tunnel.
          </div>
        </div>

        {/* top-right: wind-tunnel telemetry */}
        <div className="pointer-events-none absolute right-6 top-20 z-20 text-right md:right-12 md:top-24">
          <div className="caption-label">WIND TUNNEL</div>
          <div className="mono-data mt-2 flex items-baseline justify-end gap-1.5">
            <span ref={speedRef} className="text-5xl font-bold text-rb-ice md:text-7xl">
              0
            </span>
            <span className="text-xs text-rb-mist">KM/H</span>
          </div>
          <div className="mt-3 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div
              ref={modeRef}
              data-mode="X"
              className="mono-data inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] tracking-[0.2em] transition-colors duration-300 data-[mode=Z]:border-rb-yellow/60 data-[mode=Z]:text-rb-yellow"
            >
              X-MODE
            </div>
            <div
              ref={overrideRef}
              data-open="0"
              className="mono-data inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] tracking-[0.2em] transition-colors data-[open=1]:border-rb-yellow/60 data-[open=1]:text-rb-yellow"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rb-mist transition-colors data-[open=1]:bg-rb-yellow" />
              OVERRIDE
            </div>
          </div>
        </div>

        {/* bottom-left: 2026 spec strip */}
        <div className="pointer-events-none absolute bottom-24 left-6 z-20 md:bottom-28 md:left-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
            {MACHINE_STATS.map((s) => (
              <div key={s.l}>
                <div className="caption-label text-[9px]">{s.l}</div>
                <div className="mono-data mt-1 text-sm font-medium text-rb-ice">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom-right: scroll hint */}
        <div className="caption-label pointer-events-none absolute bottom-24 right-6 z-20 hidden md:bottom-28 md:right-12 md:block">
          ↓ walk around the car
        </div>

        {/* tech feature cards */}
        {RB22_FEATURES.map((c, i) => (
          <div
            key={c.id}
            data-corner={String(i)}
            className={`pointer-events-none absolute top-[46%] z-20 w-[min(300px,74vw)] opacity-0 ${
              c.side === "left" ? "left-[8%] md:left-[14%]" : "right-[8%] md:right-[16%]"
            }`}
          >
            <div className="glass-card-strong rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="mono-data flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-rb-red px-4 font-bold text-white">
                  {c.tag}
                </span>
                <span className="font-display text-lg font-black uppercase italic text-rb-ice">{c.name}</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-rb-mist">{c.note}</p>
            </div>
          </div>
        ))}

        {/* finale banner */}
        <div data-lapdone className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0">
          <div className="text-center">
            <div className="h-display-italic text-stroke-yellow text-[clamp(3rem,9vw,8rem)]">THE NEXT ERA</div>
            <div className="caption-label mt-2 text-rb-yellow">fifty-fifty power · zero compromise</div>
          </div>
        </div>
      </div>

      {/* ── outro: stats + drivers + podium ── */}
      <div className="relative overflow-hidden py-28 md:py-36">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-24">
          {/* season stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {F1_SEASON_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="glass-card group flex h-full flex-col items-center justify-between rounded-xl p-6 text-center transition-colors duration-500 hover:border-rb-yellow/40 md:p-8">
                  <span className="flex items-baseline justify-center whitespace-nowrap">
                    <Counter
                      value={s.value}
                      decimals={s.decimals}
                      className="mono-data block text-[2rem] font-bold text-rb-ice transition-colors duration-300 group-hover:text-rb-yellow sm:text-5xl md:text-[3.25rem]"
                    />
                    {s.suffix && (
                      <span className="mono-data ml-0.5 text-base font-bold text-rb-mist sm:text-xl md:text-2xl">
                        {s.suffix}
                      </span>
                    )}
                  </span>
                  <div className="caption-label mt-3 text-[10px] leading-snug">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* drivers — nav/keyboard-arrows anchor ("The Pilots"); padding
              instead of margin so the landing spot clears the fixed navbar */}
          <div id="pilots" className="pt-24">
            <div className="caption-label flex items-center gap-3">
              <span className="h-px w-10 bg-rb-red" />
              <span>THE PILOTS</span>
            </div>
            <h3 className="h2-display-italic mt-4 text-[clamp(1.9rem,4vw,3.4rem)]">
              BULLS <span className="text-stroke">BEHIND THE VISOR</span>
            </h3>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {F1_DRIVERS.map((d: F1Driver, i) => (
                <Reveal key={d.name} delay={i * 0.1}>
                  <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-7 transition-all duration-500 hover:border-rb-red/50">
                    {/* driver photo backdrop */}
                    {d.photo && (
                      <div aria-hidden className="absolute inset-0">
                        <img
                          src={d.photo}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover object-top opacity-[0.16] saturate-[0.7] transition-opacity duration-700 group-hover:opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-rb-carbon/70 via-rb-carbon/85 to-rb-carbon" />
                      </div>
                    )}
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-6 ${d.photo ? "-top-4" : "-top-10"} font-display text-[9rem] font-black italic leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-rb-red/10`}
                    >
                      {String(d.number).padStart(2, "0")}
                    </div>
                    <div className="relative mono-data text-xs tracking-[0.24em] text-rb-yellow">#{d.number} · {d.code}</div>
                    <h4 className="font-display relative mt-3 text-2xl font-black uppercase italic leading-none text-rb-ice">
                      {d.name.split(" ")[0]}
                      <br />
                      {d.name.split(" ")[1]}
                    </h4>
                    <div className="caption-label relative mt-2 text-[10px]">{d.country}</div>

                    <div className="mono-data relative mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
                      <div>
                        <div className="text-xl font-bold text-rb-ice">{d.titles}×</div>
                        <div className="text-[9px] uppercase tracking-widest text-rb-mist">titles</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-rb-ice">{d.wins}</div>
                        <div className="text-[9px] uppercase tracking-widest text-rb-mist">wins</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-rb-ice">{d.podiums}</div>
                        <div className="text-[9px] uppercase tracking-widest text-rb-mist">podiums</div>
                      </div>
                    </div>

                    <p className="relative mt-5 border-l-2 border-rb-red pl-4 text-sm italic leading-relaxed text-rb-mist">
                      &ldquo;{d.quote}&rdquo;
                    </p>
                    <div className="mono-data relative mt-4 text-[10px] tracking-wider text-rb-yellow/80">{d.stat}</div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          {/* podium image */}
          <Reveal className="mt-20">
            <figure className="group relative overflow-hidden rounded-2xl border border-white/10">
              <div className="relative aspect-[16/9] max-h-[70vh] w-full sm:aspect-[21/9]">
                <img
                  src="/images/f1-podium-2021.webp"
                  alt="Podium: race winner and 2021 F1 World Drivers Champion Max Verstappen celebrating, with second place Lewis Hamilton and third place Carlos Sainz Jr. beside him"
                  className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rb-carbon via-transparent to-transparent" />
              </div>
              <figcaption className="caption-label relative mt-3 sm:absolute sm:bottom-5 sm:left-6 sm:right-6 md:left-10 md:right-10">
                Podium: race winner and 2021 F1 World Drivers Champion Max Verstappen, Red Bull Racing,
                second place Lewis Hamilton, Mercedes, third place Carlos Sainz Jr., Ferrari
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
