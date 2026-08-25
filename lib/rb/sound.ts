"use client";

/* ────────────────────────────────────────────────────────────
   SoundEngine — fully synthesized WebAudio sound design.
   No external assets: ambient drone + UI ticks, generated live.
   Autoplay-safe: context resumes on first user gesture.
   ──────────────────────────────────────────────────────────── */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private enabled = false;
  private listeners = new Set<(on: boolean) => void>();

  isEnabled() {
    return this.enabled;
  }

  subscribe(fn: (on: boolean) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  /** create context lazily inside a user gesture */
  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  toggle(): boolean {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return this.enabled;

    this.enabled = !this.enabled;
    const now = ctx.currentTime;

    if (this.enabled) {
      this.startAmbient();
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.5, now + 0.8);
      this.click(660, 0.05);
    } else {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.4);
      this.click(330, 0.05);
      window.setTimeout(() => this.stopAmbient(), 500);
    }
    this.emit();
    return this.enabled;
  }

  /* ── ambient bed: detuned drone + slow breathing filter + shimmer ── */
  private startAmbient() {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.ambientNodes.length) return;

    const bed = ctx.createGain();
    bed.gain.value = 0.16;
    bed.connect(this.master);

    /* two detuned saws through a lowpass — engine-room drone */
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;
    filter.Q.value = 4;
    filter.connect(bed);

    [55, 55.4, 110.3].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? "triangle" : "sawtooth";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.16 : 0.3;
      osc.connect(g).connect(filter);
      osc.start();
      this.ambientNodes.push(osc, g);
    });

    /* slow LFO breathing on the filter — "wings" pulse */
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.085;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    this.ambientNodes.push(lfo, lfoGain, filter, bed);

    /* airy shimmer: high sine pair, very quiet */
    const shimmer = ctx.createGain();
    shimmer.gain.value = 0.012;
    shimmer.connect(this.master);
    [1568, 2093].forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const trem = ctx.createGain();
      trem.gain.value = 1;
      const tremLfo = ctx.createOscillator();
      tremLfo.frequency.value = 0.21 + Math.random() * 0.1;
      const tremDepth = ctx.createGain();
      tremDepth.gain.value = 0.85;
      tremLfo.connect(tremDepth).connect(trem.gain);
      tremLfo.start();
      osc.connect(trem).connect(shimmer);
      osc.start();
      this.ambientNodes.push(osc, trem, tremLfo, tremDepth);
    });
    this.ambientNodes.push(shimmer);
  }

  private stopAmbient() {
    this.ambientNodes.forEach((n) => {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        /* not an oscillator */
      }
      try {
        n.disconnect();
      } catch {
        /* already disconnected */
      }
    });
    this.ambientNodes = [];
  }

  /* ── one-shot UI tick ── */
  click(freq = 880, dur = 0.04, vol = 0.12) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + dur * 3);

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = freq;
    band.Q.value = 2;

    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur * 4);

    osc.connect(band).connect(g).connect(this.master);
    osc.start(now);
    osc.stop(now + dur * 5);
  }

  /* ── whoosh: noise sweep for section transitions / bursts ── */
  whoosh() {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const len = 0.6;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.4;
    band.frequency.setValueAtTime(300, now);
    band.frequency.exponentialRampToValueAtTime(2400, now + len * 0.7);
    band.frequency.exponentialRampToValueAtTime(500, now + len);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.09, now + len * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, now + len);

    src.connect(band).connect(g).connect(this.master);
    src.start(now);
    src.stop(now + len);
  }
}

export const sound = new SoundEngine();
