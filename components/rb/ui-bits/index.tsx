"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   BullsLogo — the two-bulls-before-the-sun emblem (fan tribute)
   Rendered from static SVG assets in /public/images.
   `size` = WIDTH for the bare mark (asset viewBox "20 0 298 118"),
           HEIGHT for the full lockup (ink aspect ≈ 338:207).
   The lockup asset declares a SQUARE viewBox ("0 -66.23 338.072 338.072")
   with empty bands above and below the ink, so the <img> renders with
   object-cover to crop those bands — a "meet" fit would letterbox the
   artwork down to ~60% of the box.
   ═══════════════════════════════════════════════════════════ */
const MARK_ASPECT = 298 / 118;
const LOCKUP_ASPECT = 338.072 / 207; // a touch taller than the ink — cover trims bands, never art

export function BullsLogo({
  size = 120,
  className = "",
  wordmark = false,
}: {
  size?: number;
  className?: string;
  wordmark?: boolean;
}) {
  const w = Math.round(wordmark ? size * LOCKUP_ASPECT : size);
  const h = Math.round(wordmark ? size : size / MARK_ASPECT);
  return (
    <img
      src={wordmark ? "/images/redbull-logo.svg" : "/images/redbull-mark.svg"}
      width={w}
      height={h}
      className={`object-cover ${className}`}
      alt="Red Bull emblem — unofficial fan tribute"
      draggable={false}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   MagneticButton — cursor-attracting CTA
   ═══════════════════════════════════════════════════════════ */
export function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 0.35,
  as = "button",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  as?: "button" | "div";
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* magnetic pull is a cursor effect — on touch it just yanks the
       button toward the finger */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  const Tag = as as "button";
  return (
    <div ref={ref} className="inline-block will-change-transform">
      <Tag
        onClick={onClick}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </Tag>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Counter — scroll-triggered animated number (aria-live)
   ═══════════════════════════════════════════════════════════ */
export function Counter({
  value,
  decimals = 0,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className = "",
  separator = true,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [text, setText] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const proxy = { v: 0 };
    const fmt = (v: number) =>
      prefix +
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: separator,
      }) +
      suffix;
    const tween = gsap.to(proxy, {
      v: value,
      duration,
      ease: "power2.out",
      onUpdate: () => setText(fmt(proxy.v)),
    });
    return () => {
      tween.kill();
    };
  }, [inView, value, decimals, duration, prefix, suffix, separator]);

  return (
    <span ref={ref} className={className} aria-live="polite" aria-label={`${prefix}${value}${suffix}`}>
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   MarqueeRow — infinite ticker strip.
   Two identical halves inside a w-max track; the track animates
   to -50% of ITS OWN width, so the loop is perfectly seamless.
   (Animating a w-full container would translate by viewport
   width and jump at the wrap point.)
   ═══════════════════════════════════════════════════════════ */
export function MarqueeRow({
  items,
  className = "",
  speed = "normal",
  separator = "★",
}: {
  items: string[];
  className?: string;
  speed?: "fast" | "normal" | "slow";
  separator?: string;
}) {
  const anim = speed === "fast" ? "animate-marquee-fast" : speed === "slow" ? "animate-marquee-slow" : "animate-marquee";
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span>{it}</span>
          <span className="mx-8 text-rb-red" aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex w-full overflow-hidden ${className}`} aria-hidden>
      <div className={`flex w-max ${anim}`}>
        {row}
        {row}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionHeading — kicker + display title
   ═══════════════════════════════════════════════════════════ */
export function SectionHeading({
  kicker,
  title,
  outline,
  align = "left",
  className = "",
}: {
  kicker: string;
  title: string;
  outline?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <div
        className={`caption-label flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-10 bg-rb-red" aria-hidden />
        <span>{kicker}</span>
      </div>
      <h2 className="h2-display mt-5">
        {title}{" "}
        {outline && <span className="text-stroke">{outline}</span>}
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Reveal — fade/slide in when scrolled into view
   ═══════════════════════════════════════════════════════════ */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const played = useRef(false);

  useEffect(() => {
    if (!inView || played.current) return;
    played.current = true;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: 1.05, delay, ease: "power3.out" }
    );
  }, [inView, delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0 }}>
      {children}
    </div>
  );
}
