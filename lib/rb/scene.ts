"use client";

import { create } from "zustand";
import type { FlavorId } from "./data";

/* ────────────────────────────────────────────────────────────
   sceneState — mutable, non-reactive object written by
   ScrollTrigger callbacks and read inside useFrame at 60fps.
   Never triggers React re-renders.
   ──────────────────────────────────────────────────────────── */
export const sceneState = {
  /** 0..1 progress of the hero intro timeline (set once after preloader) */
  intro: 0,
  /** 0..1 scroll progress through the hero spacer (before can section) */
  hero: 0,
  /** 0..1 scroll progress through the pinned CAN section */
  can: 0,
  /** 0..1 scroll progress through the pinned F1 section */
  f1: 0,
  /** true while hero spacer is in the upper viewport (page starts there) */
  heroActive: true,
  /** true while the CAN section trigger is active */
  canActive: false,
  /** true while the F1 pinned section trigger is active */
  f1Active: false,
  /** true while the racing intro is approaching / pin is near — pre-frames the RB22 */
  f1Near: false,
  /** true once preloader finished and hero intro started */
  started: false,
  /** normalized pointer -1..1 */
  px: 0,
  py: 0,
  /** prefers-reduced-motion */
  reduced: false,
  /** viewport is mobile-ish */
  mobile: false,
  /** strength 0..1 of the "energy burst" (hover on can / flavor switch) */
  burst: 0,
};

/* ────────────────────────────────────────────────────────────
   Reactive UI state (preloader, flavor selection, overlays)
   ──────────────────────────────────────────────────────────── */
interface RBStore {
  /** preloader percentage 0..100 */
  progress: number;
  /** preloader fully done, hero intro allowed to run */
  loaded: boolean;
  /** active can flavor */
  flavor: FlavorId;
  /** active ingredient index inside can section (>=0 => show card) */
  ingredient: number;
  /** mobile nav open */
  navOpen: boolean;
  setProgress: (p: number) => void;
  setLoaded: (v: boolean) => void;
  setFlavor: (f: FlavorId) => void;
  setIngredient: (i: number) => void;
  setNavOpen: (v: boolean) => void;
}

export const useRBStore = create<RBStore>((set) => ({
  progress: 0,
  loaded: false,
  flavor: "original",
  ingredient: -1,
  navOpen: false,
  setProgress: (p) => set({ progress: Math.max(0, Math.min(100, p)) }),
  setLoaded: (v) => set({ loaded: v }),
  setFlavor: (f) => set({ flavor: f }),
  setIngredient: (i) => set({ ingredient: i }),
  setNavOpen: (v) => set({ navOpen: v }),
}));

/** fire an energy particle burst in the 3D scene */
export function triggerBurst(strength = 1) {
  sceneState.burst = strength;
}

/* debug hook (harmless in production) */
if (typeof window !== "undefined") {
  (window as unknown as { __rbScene?: typeof sceneState }).__rbScene = sceneState;
}
