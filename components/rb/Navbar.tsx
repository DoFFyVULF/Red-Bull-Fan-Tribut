"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, Menu, Volume2, VolumeX, X } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/rb/data";
import { useRBStore } from "@/lib/rb/scene";
import { sound } from "@/lib/rb/sound";
import { lockScroll, scrollToSection } from "./SmoothScroll";
import { useActiveSection } from "./useActiveSection";
import { BullsLogo } from "./ui-bits";

/* shared focus ring — keyboard nav must stay visible */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-yellow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rb-carbon";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false); // hide on scroll-down, reveal on scroll-up
  const active = useActiveSection();
  const [soundOn, setSoundOn] = useState(false);
  const lastY = useRef(0);
  const navOpen = useRBStore((s) => s.navOpen);
  const setNavOpen = useRBStore((s) => s.setNavOpen);

  const toggleSound = () => {
    setSoundOn(sound.toggle());
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (navOpen || y < 160 || y < lastY.current) setHidden(false);
      else setHidden(true);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navOpen]);

  /* freeze the page behind the fullscreen menu — lenis.stop() alone
     doesn't hold native touch scrolling / iOS rubber-band */
  useEffect(() => {
    if (!navOpen) return;
    lockScroll(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lockScroll(false);
      document.body.style.overflow = prevOverflow;
    };
  }, [navOpen]);

  const go = (id: string) => {
    setNavOpen(false);
    sound.whoosh();
    scrollToSection(id);
  };

  return (
    <>
      {/* accessibility: skip link */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-rb-yellow focus:px-5 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:text-rb-carbon"
      >
        Skip to content
      </a>

      <MotionConfig reducedMotion="user">
        <header
          className={`fixed inset-x-0 top-3 z-[80] transition-all duration-500 ease-out md:top-4 ${
            hidden ? "-translate-y-[130%]" : "translate-y-0"
          }`}
        >
          <div
            className={`mx-auto max-w-[1440px] px-3 md:px-6 lg:px-12`}
            aria-hidden={false}
          >
            <div
              className={`flex h-16 items-center justify-between gap-3 rounded-2xl border px-3 transition-all duration-500 md:h-[68px] md:rounded-full md:px-5 ${
                scrolled
                  ? "border-white/10 bg-rb-carbon/75 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  : "border-transparent bg-transparent"
              }`}
            >
              {/* logo */}
              <button
                onClick={() => go("hero")}
                className={`group flex shrink-0 cursor-pointer items-center gap-3 rounded-full pl-1 pr-2 ${FOCUS}`}
                aria-label="Back to top — Red Bull fan tribute"
              >
                <BullsLogo size={40} />
                <span className="hidden font-display text-sm font-black uppercase tracking-[0.28em] text-rb-ice sm:block">
                  Red<span className="text-rb-red">Bull</span>
                  {/* hidden below 2xl — the desktop pill row needs its full
                      width budget at exactly 1280px */}
                  <span className="ml-2 hidden text-[9px] font-medium tracking-[0.2em] text-rb-mist 2xl:inline">
                    FAN TRIBUTE
                  </span>
                </span>
              </button>

              {/* desktop links — glass pill, active = filled pill */}
              <ul
                className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md xl:flex"
                aria-label="Sections"
              >
                {NAV_SECTIONS.slice(1).map(({ id, label }) => (
                  <li key={id}>
                    <button
                      onClick={() => go(id)}
                      aria-current={active === id ? "true" : undefined}
                      className={`flex cursor-pointer items-center rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-300 ${FOCUS} ${
                        active === id
                          ? "bg-rb-yellow/15 text-rb-yellow shadow-[inset_0_0_0_1px_rgba(255,211,0,0.35)]"
                          : "text-rb-mist hover:bg-white/[0.06] hover:text-rb-ice"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* actions */}
              <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
                <button
                  onClick={toggleSound}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ${FOCUS} ${
                    soundOn
                      ? "border-rb-yellow/60 text-rb-yellow shadow-[0_0_18px_rgba(255,211,0,0.25)]"
                      : "border-white/15 text-rb-ice hover:border-rb-yellow/60 hover:text-rb-yellow"
                  }`}
                  aria-label={soundOn ? "Mute sound design" : "Enable sound design"}
                  aria-pressed={soundOn}
                  title={soundOn ? "Sound on" : "Sound off"}
                >
                  {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
                </button>

                <button
                  onClick={() => go("can")}
                  className={`group hidden cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-rb-red to-[#ff6a2b] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(219,8,64,0.45)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(219,8,64,0.7)] hover:brightness-110 active:scale-95 md:flex ${FOCUS}`}
                >
                  Try the Can
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>

                <button
                  onClick={() => setNavOpen(!navOpen)}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 text-rb-ice transition-colors duration-300 hover:border-rb-yellow/60 hover:text-rb-yellow xl:hidden ${FOCUS}`}
                  aria-label={navOpen ? "Close menu" : "Open menu"}
                  aria-expanded={navOpen}
                >
                  {navOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* mobile fullscreen menu */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              data-lenis-prevent
              className="fixed inset-0 z-[75] flex flex-col overscroll-contain overflow-y-auto bg-rb-carbon/95 px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] backdrop-blur-2xl xl:hidden"
            >
              {/* my-auto centers the block when it fits and keeps overflow
                  scrollable when it doesn't (justify-center would pin the
                  top items beyond the scroll origin on short viewports) */}
              <div className="my-auto w-full">
                <ul className="flex flex-col gap-1">
                  {NAV_SECTIONS.map(({ id, label }, i) => (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.045 }}
                    >
                      <button
                        onClick={() => go(id)}
                        className={`group flex w-full cursor-pointer items-baseline gap-4 border-b border-white/5 py-3.5 text-left transition-colors duration-300 ${
                          active === id ? "text-rb-yellow" : "text-rb-ice hover:text-rb-yellow/90"
                        }`}
                      >
                        <span className="font-display text-3xl font-black uppercase tracking-tight">{label}</span>
                        <ArrowUpRight
                          size={20}
                          className="ml-auto self-center text-rb-mist opacity-30 transition-all duration-300 group-hover:text-rb-yellow md:opacity-0 md:group-hover:opacity-100"
                          aria-hidden
                        />
                      </button>
                    </motion.li>
                  ))}
                </ul>
                <p className="caption-label mt-8 text-[10px]">
                  Unofficial fan tribute · not affiliated with Red Bull GmbH
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}
