"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import SceneCanvas from "./SceneCanvas";
import KeyboardShortcuts, { ScrollChrome as ScrollChromeInner } from "./ScrollChrome";
import PageFX from "./PageFX";
import Preloader from "./Preloader";
import Navbar from "./Navbar";
import Hero from "./Hero";
import CanSection from "./CanSection";
import F1Section from "./F1Section";
import UniverseSection from "./UniverseSection";
import NumbersBand from "./NumbersBand";
import FooterSection from "./FooterSection";

export default function Experience({ children }: { children?: ReactNode }) {
  return (
    <SmoothScroll>
      {/* CSS backdrop beneath the WebGL layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-rb-carbon"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 70% -10%, rgba(0,20,137,0.42), transparent 60%), radial-gradient(ellipse 70% 55% at 15% 100%, rgba(29,25,172,0.22), transparent 65%), radial-gradient(ellipse 45% 35% at 85% 75%, rgba(219,8,64,0.10), transparent 70%), #0A0E27",
        }}
      />

      {/* persistent 3D scene — particles, can, F1 car */}
      <SceneCanvas />

      <Preloader />
      <Navbar />
      <ScrollChromeInner />
      <KeyboardShortcuts />
      <PageFX />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">
          <Hero />
          <CanSection />
          <F1Section />
          <UniverseSection />
          <NumbersBand />
        </main>
        <FooterSection />
      </div>

      {children}
    </SmoothScroll>
  );
}
