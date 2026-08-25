"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SVGProps } from "react";
import { BullsLogo, MagneticButton, Reveal } from "@/components/rb/ui-bits";
import { scrollToSection } from "@/components/rb/SmoothScroll";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BRAND, NAV_SECTIONS, IMAGE_CREDITS } from "@/lib/rb/data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* brand icons — inline SVGs (feather originals) */
type IconProps = SVGProps<SVGSVGElement>;

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Instagram(props: IconProps) {
  return (
    <svg {...iconBase} aria-hidden {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Youtube(props: IconProps) {
  return (
    <svg {...iconBase} aria-hidden {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function Twitter(props: IconProps) {
  return (
    <svg {...iconBase} aria-hidden {...props}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

const FOOTER_LINKS = NAV_SECTIONS.filter((s) => s.id !== "hero");

/* official Red Bull brand channels */
const SOCIALS = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/redbull/", Icon: Instagram },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@redbull", Icon: Youtube },
  { id: "twitter", label: "X (Twitter)", href: "https://x.com/redbull", Icon: Twitter },
];

const MANIFESTO_WORDS = [
  { text: "GIVES", className: "text-silver-gradient" },
  { text: "YOU", className: "text-stroke" },
  { text: "WINGS", className: "text-energy-gradient" },
];

export default function FooterSection() {
  const manifestoRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  /* word-level manifesto reveal */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".manifesto-word");
      if (!words.length) return;
      gsap.set(words, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: manifestoRef.current,
        start: "top 72%",
        once: true,
        onEnter: () => {
          gsap.to(words, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.14 });
        },
      });
    }, manifestoRef);
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res
        .json()
        .catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null;
      if (res.ok && data?.ok) {
        toast({
          title: "Welcome to the crew ✈",
          description: data.message ?? "You're on the list.",
        });
        setEmail("");
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: data?.error ?? "Something went wrong",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Network error — please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* ── manifesto + newsletter ──────────────────────────── */}
      <section
        id="manifesto"
        className="noise-overlay speed-lines relative z-10 overflow-hidden py-28 md:py-40"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-24">
          <div ref={manifestoRef}>
            <div className="caption-label flex items-center gap-3">
              <span className="h-px w-10 bg-rb-red" aria-hidden />
              <span>THE MANIFESTO</span>
            </div>

            <h2 className="mt-10" aria-label="Gives you wings">
              {MANIFESTO_WORDS.map((word) => (
                <span key={word.text} className="block overflow-hidden pb-1">
                  <span className={`manifesto-word block h-display ${word.className}`}>
                    {word.text}
                  </span>
                </span>
              ))}
            </h2>

            <Reveal delay={0.15}>
              <p className="mt-10 max-w-2xl leading-relaxed text-rb-mist md:text-lg">
                Energy is not a promise — it is pressure. It is the hum of a V6 and its electric
                half spinning up together, the silent second before the lights go out, the hiss
                of a tab you just flicked open. A can is small; what it starts is not.
                Freedom is the whole point — and a wing is something you earn.
              </p>
            </Reveal>
          </div>

          {/* newsletter */}
          <Reveal delay={0.05} className="mt-24 md:mt-32">
            <div className="glass-card grid gap-8 overflow-hidden rounded-2xl p-8 md:grid-cols-[1fr_300px] md:p-12">
              <div>
              <p className="caption-label text-rb-yellow">JOIN THE FAN CREW</p>
              <h3 className="font-display mt-3 text-2xl uppercase italic text-rb-ice md:text-4xl">
                Dispatches from the edge
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-rb-mist md:text-base">
                New sections, concept art and behind-the-scenes notes from this tribute —
                straight to your inbox. No spam, no noise. Just wings.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4 lg:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  className="h-12 flex-1 rounded-full border-white/15 bg-white/5 px-6 text-base text-rb-ice placeholder:text-rb-mist"
                />
                {sending ? (
                  <button
                    type="submit"
                    disabled
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-rb-red px-8 font-display text-sm uppercase tracking-wider text-white opacity-70 lg:w-auto"
                  >
                    SENDING…
                  </button>
                ) : (
                  <MagneticButton
                    ariaLabel="Subscribe to fan crew dispatches"
                    className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-rb-red to-[#ff6a2b] px-8 font-display text-sm uppercase tracking-wider text-white transition-all duration-300 hover:brightness-110 active:scale-95 lg:w-auto"
                  >
                    SUBSCRIBE
                  </MagneticButton>
                )}
              </form>
              {error && (
                <p id="newsletter-error" role="alert" className="mt-3 text-sm text-rb-red">
                  {error}
                </p>
              )}
              </div>

              {/* cans photo column */}
              <figure aria-hidden className="relative hidden overflow-hidden rounded-xl border border-white/10 md:block">
                <img
                  src="/images/can-classic.jpg"
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover saturate-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rb-carbon/60 via-transparent to-transparent" />
                <figcaption className="caption-label absolute bottom-3 left-4 text-[9px] text-rb-ice/80">
                  THE CLASSICS · 250 ML
                </figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── footer — sticky bottom of the flex column ──────── */}
      <footer className="relative z-10 mt-auto border-t border-white/10 bg-gradient-to-b from-rb-carbon/70 to-rb-navy/35 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 md:px-12 md:pb-12 md:pt-12 lg:px-24">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <BullsLogo size={42} wordmark />

            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.id);
                      }}
                      className="caption-label inline-block px-1 py-2.5 -my-2.5 transition-colors duration-300 hover:text-rb-ice"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              {SOCIALS.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Red Bull on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-rb-mist transition-colors duration-300 hover:border-rb-yellow hover:text-rb-yellow md:h-10 md:w-10"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6">
            {/* keyboard shortcuts hint — desktop-only affordance */}
            <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-rb-mist/80 lg:flex">
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-rb-ice">↑</kbd>
                <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-rb-ice">↓</kbd>
                sections
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-rb-ice">M</kbd>
                sound
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-rb-ice">Home</kbd>
                top
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-rb-mist">
              © 2026 Red Bull Fan Tribute — Not affiliated with Red Bull GmbH
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-rb-mist/70">
              {BRAND.disclaimer}
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-rb-mist/70">
              {BRAND.credits}
            </p>
            {IMAGE_CREDITS.length > 0 && (
              <details className="max-w-3xl text-xs text-rb-mist/70">
                <summary className="cursor-pointer caption-label text-[10px] transition-colors hover:text-rb-ice">
                  Photography credits
                </summary>
                <ul className="mt-3 flex flex-col gap-1.5 pl-4">
                  {IMAGE_CREDITS.map((c) => (
                    <li key={c.file}>
                      {c.title} —{" "}
                      <a
                        href={c.source}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-rb-red/50 underline-offset-2 transition-colors hover:text-rb-ice"
                      >
                        {c.author}
                      </a>{" "}
                      · {c.license}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
