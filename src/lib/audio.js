/* =====================================================================
   SFX ENGINE
   ---------------------------------------------------------------------
   Every sound is synthesised with the Web Audio API at call time. There
   are no .mp3 files to ship, decode or 404 — the whole engine is ~4kB and
   the first sound is audible the instant the context unlocks.

   Browsers refuse to start an AudioContext before a user gesture, so the
   context is created lazily on the first play() and `unlock()` resumes a
   context that was born suspended. Until then every call is a silent
   no-op rather than an error.

   Signal path for all voices:

       voice ──▶ voiceGain ──▶ master ──▶ limiter ──▶ destination

   The limiter is a DynamicsCompressor with a hard ratio; it exists so a
   burst of overlapping hovers can never clip.
   ===================================================================== */

const STORAGE_KEY = "pavan:sfx-muted";

/* Slightly detuned repeats sound organic instead of machine-gunned. */
const drift = (v, amount = 0.04) => v * (1 + (Math.random() * 2 - 1) * amount);

class SfxEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.muted = this.#readMuted();
    this.lastPlayed = new Map();
    this.subscribers = new Set();
  }

  #readMuted() {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  /* --- graph -------------------------------------------------------- */

  #ensureContext() {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;

    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0.9;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.18;

    master.connect(limiter);
    limiter.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  /* One second of white noise, reused by every noise-based voice. */
  #noise() {
    if (this.noiseBuffer) return this.noiseBuffer;
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
    return buf;
  }

  /* --- public state ------------------------------------------------- */

  /** Resume a suspended context. Safe to call on every gesture. */
  unlock() {
    const ctx = this.#ensureContext();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  isMuted() {
    return this.muted;
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  setMuted(next) {
    this.muted = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* private mode — in-memory only */
    }
    this.subscribers.forEach((fn) => fn(next));
    if (!next) this.unlock();
  }

  toggle() {
    this.setMuted(!this.muted);
    if (!this.muted) this.play("toggleOn");
    return this.muted;
  }

  /* --- playback ----------------------------------------------------- */

  /**
   * @param {keyof typeof VOICES} name
   * @param {{throttle?: number, gain?: number}} [opts]
   *   throttle — ignore repeat calls inside this many ms (hover spam)
   */
  play(name, opts = {}) {
    if (this.muted) return;

    const voice = VOICES[name];
    if (!voice) return;

    const throttle = opts.throttle ?? voice.throttle ?? 0;
    if (throttle) {
      const now = performance.now();
      const last = this.lastPlayed.get(name) ?? -Infinity;
      if (now - last < throttle) return;
      this.lastPlayed.set(name, now);
    }

    const ctx = this.#ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
      /* A context that is still suspended will schedule silence, so bail
         and let the next interaction be the one that is heard. */
      if (ctx.state === "suspended") return;
    }

    try {
      voice.render(this, ctx, ctx.currentTime, opts.gain ?? 1);
    } catch {
      /* A dead voice must never take an interaction down with it. */
    }
  }

  /* --- voice building blocks ---------------------------------------- */

  /** Pitched oscillator with an exponential AD envelope. */
  tone(ctx, t0, { type = "sine", from, to, dur, peak, delay = 0, curve }) {
    const start = t0 + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    if (to !== undefined && to !== from) {
      if (curve === "linear") osc.frequency.linearRampToValueAtTime(to, start + dur);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + dur);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + dur * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    return { osc, gain };
  }

  /** Filtered noise burst — transients, whooshes, air. */
  noiseBurst(ctx, t0, { dur, peak, type = "bandpass", from, to, q = 1, delay = 0 }) {
    const start = t0 + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.#noise();

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, start);
    if (to !== undefined && to !== from) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(to, 20), start + dur);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + dur * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(start);
    src.stop(start + dur + 0.02);
    return { src, gain, filter };
  }
}

/* =====================================================================
   THE VOICES
   Each entry is a tiny score. `g` is the caller's gain multiplier.
   ===================================================================== */
const VOICES = {
  /* Soft high tick. Fires constantly on hover, so it is quiet, short and
     throttled hard enough that sweeping a list never becomes a rattle. */
  hover: {
    throttle: 55,
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, {
        type: "triangle",
        from: drift(2450),
        to: 1750,
        dur: 0.05,
        peak: 0.05 * g,
      });
      e.noiseBurst(ctx, t, {
        dur: 0.028,
        peak: 0.018 * g,
        type: "highpass",
        from: 5200,
        q: 0.7,
      });
    },
  },

  /* Deep bass thud with a click transient on top — the "press" sound. */
  click: {
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, {
        type: "sine",
        from: drift(165, 0.03),
        to: 48,
        dur: 0.26,
        peak: 0.5 * g,
      });
      e.tone(ctx, t, {
        type: "sine",
        from: drift(92, 0.03),
        to: 38,
        dur: 0.4,
        peak: 0.34 * g,
      });
      e.noiseBurst(ctx, t, {
        dur: 0.05,
        peak: 0.1 * g,
        type: "highpass",
        from: 2600,
        to: 900,
        q: 0.6,
      });
    },
  },

  /* Cinematic transition whoosh — noise sweeping up then away. */
  whoosh: {
    throttle: 420,
    render: (e, ctx, t, g) => {
      e.noiseBurst(ctx, t, {
        dur: 0.85,
        peak: 0.17 * g,
        type: "bandpass",
        from: 320,
        to: 3400,
        q: 1.1,
      });
      e.noiseBurst(ctx, t, {
        dur: 0.7,
        peak: 0.12 * g,
        delay: 0.16,
        type: "bandpass",
        from: 2600,
        to: 260,
        q: 1.4,
      });
      e.tone(ctx, t, {
        type: "sine",
        from: 70,
        to: 32,
        dur: 0.9,
        peak: 0.2 * g,
      });
    },
  },

  /* Heavier version for fullscreen / modal opens. */
  open: {
    render: (e, ctx, t, g) => {
      e.noiseBurst(ctx, t, {
        dur: 0.62,
        peak: 0.16 * g,
        type: "bandpass",
        from: 240,
        to: 2600,
        q: 1.2,
      });
      e.tone(ctx, t, { type: "sine", from: 58, to: 150, dur: 0.5, peak: 0.32 * g });
    },
  },

  close: {
    render: (e, ctx, t, g) => {
      e.noiseBurst(ctx, t, {
        dur: 0.42,
        peak: 0.12 * g,
        type: "bandpass",
        from: 2200,
        to: 300,
        q: 1.2,
      });
      e.tone(ctx, t, { type: "sine", from: 140, to: 50, dur: 0.34, peak: 0.26 * g });
    },
  },

  /* Form input focus — barely-there upward blip. */
  focus: {
    throttle: 90,
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, {
        type: "sine",
        from: 620,
        to: 980,
        dur: 0.11,
        peak: 0.06 * g,
        curve: "linear",
      });
    },
  },

  /* Dropdown option chosen. */
  select: {
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, { type: "triangle", from: 880, to: 1320, dur: 0.07, peak: 0.09 * g });
      e.tone(ctx, t, {
        type: "sine",
        from: 1760,
        to: 2100,
        dur: 0.09,
        peak: 0.05 * g,
        delay: 0.05,
      });
    },
  },

  /* Two-note confirmation for the contact form. */
  success: {
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, { type: "sine", from: 523, to: 523, dur: 0.16, peak: 0.16 * g });
      e.tone(ctx, t, {
        type: "sine",
        from: 784,
        to: 784,
        dur: 0.34,
        peak: 0.16 * g,
        delay: 0.1,
      });
      e.tone(ctx, t, { type: "sine", from: 60, to: 40, dur: 0.4, peak: 0.2 * g });
    },
  },

  toggleOn: {
    render: (e, ctx, t, g) => {
      e.tone(ctx, t, { type: "square", from: 420, to: 760, dur: 0.07, peak: 0.05 * g });
    },
  },
};

export const sfx = new SfxEngine();
export const SFX_NAMES = Object.keys(VOICES);
