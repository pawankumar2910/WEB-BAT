/* =====================================================================
   PAVAN — Colourist · Editor · Motion
   script.js

   MODULE MAP
     00 CONFIG        ← edit me: email, projects, services, audio
     01 Utils / timecode
     02 Assets
     03 Audio         Howler + futuristic WebAudio synth fallback
     04 Scroll        Lenis on the GSAP ticker
     05 Preloader     timecode count-up → cinematic reveal
     06 Fluid         WebGL solver, WHITE dye, difference-blended =
                      a true negative wherever the liquid goes
     07 PowerWindow   small inverting cursor + magnetic pull
     08 DepthField    Three.js volume, Z-travel on scroll
     09 Content       reel + services from CONFIG
     10 Motion        splits, reveals, depth, pinned reel, grade wipe
     11 Rig           software icons: tilt, ripple, sound
     12 Viewer        FLIP expansion
     13 Nav + HUD     scrubber, timecode, clip name
     14 Boot
   ===================================================================== */

(function () {
  "use strict";

  /* ===================================================================
     00. CONFIG
     =================================================================== */
  const CONFIG = {
    email: "pavankch29@gmail.com",
    subject: "Video Editing Portfolio Inquiry",

    /* ---- ASSETS -----------------------------------------------------
         public/assets/pavan-3d-model.png   ← operator medallion
         public/assets/pavan-portrait.jpg   ← credits portrait
         public/assets/orchid-video.mp4     ← Orchid film + reel tiles
       resolveAsset() tries each base in order, so the same markup works
       under Vite and under a plain static server at the project root. */
    assetBases: ["public/assets/", "assets/", "/assets/", ""],
    assets: {
      model: "pavan-3d-model.png",
      portrait: "pavan-portrait.jpg",
      orchid: "orchid-video.mp4",
    },

    /* ---- AUDIO ------------------------------------------------------
       DROP YOUR SOUND FILES IN ./audio/ — see audio/README.txt.
       Any file that 404s falls back to the synth in module 03, so the
       UI is never silent. */
    audio: {
      hover: { src: "audio/hover.mp3", volume: 0.2 },
      click: { src: "audio/click.mp3", volume: 0.38 },
      swoosh: { src: "audio/swoosh.mp3", volume: 0.26 },
      open: { src: "audio/open.mp3", volume: 0.44 },
      toggle: { src: "audio/toggle.mp3", volume: 0.34 },
    },

    /* Total runtime the HUD scrubber maps the page onto (mm:ss) */
    runtime: 12 * 60,

    /* ---- WORK — every entry uses orchid-video.mp4 as a stand-in.
       Give an item its own `src` (and optional `poster`) as real files
       land in public/assets. */
    projects: [
      { id: "w1", title: "Nimbus Analytics", category: "SaaS Launch Film", year: "2025", runtime: "01:12",
        tags: ["Product demo", "Kinetic UI", "Sound design"], from: "#C98B3A", to: "#5CE1E6",
        blurb: "A 72-second launch film for a data platform: screen capture rebuilt as kinetic UI, composited over a graded studio plate." },
      { id: "w2", title: "Helix Motors", category: "3D Product Reel", year: "2025", runtime: "00:48",
        tags: ["Blender", "Cycles", "Turntable"], from: "#5CE1E6", to: "#9B8CFF",
        blurb: "Modelled, shaded and lit in Blender, rendered in Cycles passes and comped back together for full control of every highlight." },
      { id: "w3", title: "Midnight Bloom", category: "Colour Grade", year: "2024", runtime: "02:04",
        tags: ["Resolve", "Show LUT", "Halation"], from: "#FF4D6D", to: "#C98B3A",
        blurb: "Node-based grade in DaVinci Resolve — balance, a custom show LUT, tracked secondaries, film grain and halation." },
      { id: "w4", title: "Vector Sans", category: "Poster Series", year: "2024", runtime: "00:22",
        tags: ["Key art", "Typography", "Print"], from: "#9B8CFF", to: "#FF4D6D",
        blurb: "Key art built at print resolution in Photoshop over Blender renders, then set in motion as a short type-driven loop." },
      { id: "w5", title: "Skyforge", category: "VFX Breakdown", year: "2025", runtime: "01:36",
        tags: ["Compositing", "3D track", "Particles"], from: "#5CE1E6", to: "#FF4D6D",
        blurb: "3D camera solve, roto and clean plates, then particle and atmospheric passes light-wrapped into the original photography." },
      { id: "w6", title: "Loop Studio", category: "Brand Sting", year: "2024", runtime: "00:14",
        tags: ["Logo animation", "Motion GFX"], from: "#C98B3A", to: "#9B8CFF",
        blurb: "A fourteen-second identity sting: logo build, shape morphs and a designed transient to land the mark." },
      { id: "w7", title: "Aurora Fintech", category: "Explainer", year: "2025", runtime: "01:58",
        tags: ["Illustration", "Voice-over", "2D motion"], from: "#FF4D6D", to: "#5CE1E6",
        blurb: "Illustrated 2D explainer cut to a recorded voice-over, with a paced motion system that keeps a dense script legible." },
      { id: "w8", title: "Terra Docs", category: "SaaS Feature Drop", year: "2024", runtime: "00:36",
        tags: ["Screen capture", "UI mockups"], from: "#9B8CFF", to: "#C98B3A",
        blurb: "High-frame-rate capture rebuilt as animated device composites for a feature-drop announcement." },
      { id: "w9", title: "Ember Ritual", category: "Short Film", year: "2023", runtime: "03:10",
        tags: ["Narrative", "Grade", "Finishing"], from: "#FF4D6D", to: "#9B8CFF",
        blurb: "Narrative short — assembly, sound pass, grade and finishing, delivered as a 4K 24fps master." },
    ],

    services: [
      { title: "SaaS Product Demos & Launch Trailers", accent: "#C98B3A", tools: ["Ae", "Pr", "Dr"],
        turnaround: "5–8 working days",
        blurb: "Scroll-stopping product films that make complex software feel obvious — screen capture, kinetic UI, and a launch-day edit.",
        deliverables: ["Master 60–90s launch film (4K ProRes + H.264)", "Vertical 9:16 and square 1:1 social cutdowns", "6–10s teaser loops for paid ads", "Animated UI mockups & device composites", "Captions, SRT file and clean audio stems"] },
      { title: "Advanced VFX & Compositing", accent: "#5CE1E6", tools: ["Ae", "Ps", "Bl"],
        turnaround: "3–10 working days per sequence",
        blurb: "Invisible fixes and loud spectacle: rotoscoping, tracking, clean-ups, particles and 3D-integrated composites.",
        deliverables: ["Shot-by-shot composite breakdowns", "3D camera track & object integration", "Rotoscoping, clean plates and wire removal", "Particle, light-wrap and atmospheric passes", "Layered project file handover on request"] },
      { title: "Cinematic Color Grading", accent: "#FF4D6D", tools: ["Dr", "Pr"],
        turnaround: "2–5 working days",
        blurb: "Node-based grading in DaVinci Resolve Studio — balanced, styled and finished with a look that survives every screen.",
        deliverables: ["Shot-matched primary balance across the timeline", "Custom creative look / show LUT", "Skin-tone protection & secondary isolations", "Film grain, halation and optional print emulation", "Broadcast-safe QC and mastered deliverables"] },
      { title: "3D Artwork & Motion Graphics", accent: "#9B8CFF", tools: ["Bl", "Ae", "Pr", "Ps"],
        turnaround: "4–12 working days",
        blurb: "Blender-built scenes, product renders and poster art, cut together with type-driven motion design.",
        deliverables: ["Modelled, textured and lit 3D scenes", "Still key-art / poster renders at print resolution", "Looping product turntables and hero animations", "Kinetic typography and logo stings", "Source files, render passes and alpha exports"] },
    ],

    /* brass · ember · hextech — used by the Three.js field */
    palette: [
      [0.79, 0.55, 0.23],
      [1.0, 0.3, 0.43],
      [0.36, 0.88, 0.9],
    ],
  };

  /* Exactly the format in the brief; only the subject is encoded. */
  const buildGmail = () =>
    "https://mail.google.com/mail/?view=cm&fs=1&to=" +
    CONFIG.email +
    "&su=" +
    encodeURIComponent(CONFIG.subject);

  /* ===================================================================
     01. UTILS
     =================================================================== */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pad = (n) => String(Math.floor(n)).padStart(2, "0");

  /* SMPTE-style timecode at 24fps — the page's own vernacular */
  function timecode(seconds, fps) {
    const f = fps || 24;
    const frames = Math.floor((seconds % 1) * f);
    return (
      pad(seconds / 3600) + ":" + pad((seconds / 60) % 60) + ":" + pad(seconds % 60) + ":" + pad(frames)
    );
  }

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const has = { gsap: false, st: false, lenis: false, three: false, howler: false };

  /* ===================================================================
     02. ASSETS
     =================================================================== */
  const Assets = {
    image(file) {
      return new Promise((resolve) => {
        let i = 0;
        const next = () => {
          if (i >= CONFIG.assetBases.length) return resolve(null);
          const url = CONFIG.assetBases[i++] + file;
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = next;
          img.src = url;
        };
        next();
      });
    },
    video(file) {
      return new Promise((resolve) => {
        let i = 0;
        const next = () => {
          if (i >= CONFIG.assetBases.length) return resolve(CONFIG.assetBases[0] + file);
          const url = CONFIG.assetBases[i++] + file;
          fetch(url, { method: "HEAD" })
            .then((r) => (r.ok ? resolve(url) : next()))
            .catch(next);
        };
        next();
      });
    },
  };

  let ORCHID_SRC = CONFIG.assetBases[0] + CONFIG.assets.orchid;

  /* ===================================================================
     03. AUDIO — futuristic tech UI
     Howler plays real files when present. Everything below is the
     synth that covers whatever is missing: FM blips, resonant clicks,
     filtered-noise sweeps. All digital, all short.
     =================================================================== */
  const Audio = {
    enabled: true,
    ctx: null,
    howls: {},
    ready: {},
    last: {},

    init() {
      this.enabled = localStorage.getItem("pavan-sound") !== "off";

      if (window.Howl) {
        has.howler = true;
        Object.keys(CONFIG.audio).forEach((name) => {
          const def = CONFIG.audio[name];
          try {
            this.howls[name] = new Howl({
              src: [def.src],
              volume: def.volume,
              preload: true,
              onload: () => (this.ready[name] = true),
              onloaderror: () => (this.ready[name] = false),
            });
          } catch (e) {
            this.ready[name] = false;
          }
        });
      }

      const unlock = () => {
        this.context();
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        if (window.Howler && window.Howler.ctx && window.Howler.ctx.state === "suspended") {
          window.Howler.ctx.resume();
        }
      };
      ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
        window.addEventListener(ev, unlock, { once: true, passive: true })
      );
    },

    context() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      return this.ctx;
    },

    setEnabled(on) {
      this.enabled = on;
      localStorage.setItem("pavan-sound", on ? "on" : "off");
      if (window.Howler) window.Howler.mute(!on);
    },

    play(name, opts) {
      if (!this.enabled || REDUCED) return;
      const o = opts || {};
      const now = performance.now();
      if (now - (this.last[name] || 0) < (o.throttle || 45)) return;
      this.last[name] = now;

      if (this.ready[name] && this.howls[name]) {
        const id = this.howls[name].play();
        if (o.rate) this.howls[name].rate(o.rate, id);
        return;
      }
      this.synth(name, o);
    },

    /* ---- synth ------------------------------------------------------ */
    synth(name, opts) {
      const ctx = this.context();
      if (!ctx || ctx.state === "suspended") return;
      const t = ctx.currentTime;
      const out = ctx.createGain();
      out.connect(ctx.destination);

      if (name === "hover") {
        /* FM tech-blip: a carrier bent by a fast modulator, ~70ms.
           Reads as digital rather than musical. */
        const base = (opts && opts.freq) || 1650;
        const carrier = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const g = ctx.createGain();

        carrier.type = "sine";
        carrier.frequency.setValueAtTime(base, t);
        carrier.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.05);

        mod.type = "square";
        mod.frequency.setValueAtTime(base * 2.4, t);
        modGain.gain.setValueAtTime(base * 0.7, t);
        modGain.gain.exponentialRampToValueAtTime(1, t + 0.06);

        mod.connect(modGain);
        modGain.connect(carrier.frequency);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

        carrier.connect(g);
        g.connect(out);
        carrier.start(t); mod.start(t);
        carrier.stop(t + 0.09); mod.stop(t + 0.09);
        this.noise(ctx, out, t, 0.02, 5200, 0.018, "highpass");
        return;
      }

      if (name === "click" || name === "toggle") {
        /* resonant transient — a relay closing in a machine */
        const hi = name === "toggle";
        const osc = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(hi ? 520 : 300, t);
        osc.frequency.exponentialRampToValueAtTime(hi ? 980 : 78, t + 0.055);
        filt.type = "lowpass";
        filt.Q.value = 9;
        filt.frequency.setValueAtTime(3200, t);
        filt.frequency.exponentialRampToValueAtTime(560, t + 0.08);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.085, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        osc.connect(filt); filt.connect(g); g.connect(out);
        osc.start(t); osc.stop(t + 0.11);
        this.noise(ctx, out, t, 0.035, 3600, 0.05, "highpass");
        return;
      }

      if (name === "swoosh") {
        /* scrub noise — band-passed, sweeping up, short */
        this.noise(ctx, out, t, 0.3, 620, 0.042, "bandpass", 3400);
        return;
      }

      if (name === "open") {
        /* charge-up: two detuned saws through an opening filter */
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.Q.value = 7;
        filt.frequency.setValueAtTime(260, t);
        filt.frequency.exponentialRampToValueAtTime(5200, t + 0.42);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.055, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        [110, 111.6].forEach((f) => {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.setValueAtTime(f, t);
          o.frequency.exponentialRampToValueAtTime(f * 3.4, t + 0.42);
          o.connect(filt);
          o.start(t); o.stop(t + 0.52);
        });
        filt.connect(g); g.connect(out);
        this.noise(ctx, out, t, 0.45, 400, 0.05, "bandpass", 4200);
      }
    },

    noise(ctx, out, t, dur, f0, gain, type, f1) {
      const frames = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.Q.value = type === "bandpass" ? 2.2 : 0.8;
      filt.frequency.setValueAtTime(f0, t);
      if (f1) filt.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt); filt.connect(g); g.connect(out);
      src.start(t); src.stop(t + dur);
    },
  };

  /* ===================================================================
     04. SCROLL
     =================================================================== */
  const Scroll = {
    lenis: null,
    velocity: 0,

    init() {
      if (window.Lenis && !REDUCED) {
        has.lenis = true;
        this.lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.6,
        });

        this.lenis.on("scroll", (e) => {
          this.velocity = e.velocity || 0;
          if (has.st) window.ScrollTrigger.update();
          HUD.update(e.scroll || window.scrollY);
          Nav.onScroll(e.scroll || window.scrollY);
          if (Math.abs(this.velocity) > 34) {
            Audio.play("swoosh", {
              throttle: 900,
              rate: clamp(0.9 + Math.abs(this.velocity) / 300, 0.9, 1.5),
            });
          }
        });

        if (has.gsap) {
          window.gsap.ticker.add((time) => this.lenis.raf(time * 1000));
          window.gsap.ticker.lagSmoothing(0);
        } else {
          const raf = (t) => { this.lenis.raf(t); requestAnimationFrame(raf); };
          requestAnimationFrame(raf);
        }
      } else {
        let last = window.scrollY;
        window.addEventListener("scroll", () => {
          const y = window.scrollY;
          this.velocity = y - last;
          last = y;
          HUD.update(y);
          Nav.onScroll(y);
        }, { passive: true });
      }
    },

    to(target, offset) {
      if (this.lenis) this.lenis.scrollTo(target, { offset: offset || 0, duration: 1.4 });
      else if (target instanceof Element) target.scrollIntoView({ behavior: "smooth" });
    },
    stop() { if (this.lenis) this.lenis.stop(); document.body.classList.add("is-locked"); },
    start() { if (this.lenis) this.lenis.start(); document.body.classList.remove("is-locked"); },
  };

  /* ===================================================================
     05. PRELOADER — the counter is timecode, not a percentage
     =================================================================== */
  const Preloader = {
    el: null, fill: null, countEl: null, stageEl: null,
    shown: 0, target: 0, total: 1, loaded: 0, startedAt: 0, finished: false,
    stages: ["loading media", "building luts", "conforming", "grading", "ready"],

    init() {
      this.el = $("#preloader");
      this.fill = $("#preloader-fill");
      this.countEl = $("#preloader-count");
      this.stageEl = $("#preloader-stage");
      this.startedAt = performance.now();
      this.tick();
    },

    register(n) { this.total += n; },
    step() { this.loaded++; this.target = clamp(this.loaded / this.total, 0, 1); },

    tick() {
      const elapsed = (performance.now() - this.startedAt) / 1000;
      const floor = clamp(elapsed / 2.6, 0, 0.92);
      this.shown = lerp(this.shown, Math.max(this.target, floor), 0.07);

      const pct = Math.round(this.shown * 100);
      /* count up through 4 seconds of timecode as it loads */
      if (this.countEl) this.countEl.textContent = timecode(this.shown * 4);
      if (this.fill) this.fill.style.width = pct + "%";
      if (this.stageEl) this.stageEl.textContent = this.stages[clamp(Math.floor(pct / 25), 0, 4)];

      if (!this.finished) requestAnimationFrame(() => this.tick());
    },

    finish() {
      if (this.finished) return Promise.resolve();
      this.finished = true;
      const el = this.el;

      return new Promise((resolve) => {
        const done = () => {
          document.body.classList.remove("is-loading");
          if (el) el.style.display = "none";
          Scroll.start();
          if (has.st) window.ScrollTrigger.refresh();
          resolve();
        };

        if (this.countEl) this.countEl.textContent = timecode(4);
        if (this.fill) this.fill.style.width = "100%";

        if (!has.gsap || REDUCED) return void setTimeout(done, 260);

        const gsap = window.gsap;
        const cine = $("[data-cine]");
        const tl = gsap.timeline({ onComplete: done });

        tl.to("#preloader-audio", { opacity: 0, y: -12, duration: 0.4, ease: "power2.in" }, 0)
          .to(".preloader__inner", { scale: 1.14, opacity: 0, duration: 0.7, ease: "power3.inOut" }, 0.15)
          .to(".preloader__foot", { opacity: 0, duration: 0.4 }, 0.15)
          /* curtain lifts like a shutter rather than a fade */
          .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, 0.5);

        /* CINEMATIC ZOOM-IN REVEAL */
        if (cine) {
          gsap.set(cine, { scale: 1.25, filter: "blur(18px)", transformOrigin: "50% 45%" });
          tl.to(cine, {
            scale: 1, filter: "blur(0px)", duration: 1.6, ease: "expo.out",
            clearProps: "filter,transform",
          }, 0.45);
        }

        gsap.set(".nav, .hud, .marquee", { opacity: 0 });
        tl.to(".nav, .marquee", { opacity: 1, duration: 0.8, stagger: 0.08 }, 1.0)
          .to(".hud", { opacity: 1, duration: 0.7 }, 1.25);

        const chars = $$(".hero__title .split-unit");
        if (chars.length) {
          gsap.set(chars, { yPercent: 118, z: -220, opacity: 0 });
          tl.to(chars, {
            yPercent: 0, z: 0, opacity: 1, duration: 1.2, ease: "expo.out",
            stagger: { each: 0.024 },
          }, 0.75);
        }
      });
    },
  };

  /* ===================================================================
     06. FLUID — WebGL Navier–Stokes.
     Dye is rendered WHITE and the canvas is composited with
     mix-blend-mode:difference, so |base − white| = a true negative.
     Radius is deliberately small: a tight liquid bead, not a plume.
     Solver structure follows Pavel Dobryakov's MIT-licensed
     WebGL-Fluid-Simulation, trimmed to what this page uses.
     =================================================================== */
  const Fluid = (function () {
    const P = {
      SIM_RES: 128,
      DYE_RES: 512,
      DENSITY_DISSIPATION: 5.2,   /* higher = tighter, shorter tail */
      VELOCITY_DISSIPATION: 2.4,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 16,
      CURL: 24,
      SPLAT_RADIUS: 0.035,        /* SMALL — the bead, not the plume */
      SPLAT_FORCE: 4200,
    };

    let canvas, gl, ext, programs, blit, dye, velocity, divergence, curl, pressure;
    let lastTime = 0, live = false;

    const baseVert = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;

    const copyFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

    const clearFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

    /* Alpha carries the dye's intensity so `difference` inverts only
       where the liquid actually is. */
    const displayFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
        gl_FragColor = vec4(c, a);
      }`;

    const splatFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
      uniform vec3 color; uniform vec2 point; uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }`;

    const advectionFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 texelSize; uniform vec2 dyeTexelSize;
      uniform float dt; uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st); vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }`;

    const divergenceFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`;

    const curlFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`;

    const vorticityFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl;
      uniform float curl; uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vel += force * dt;
        vel = min(max(vel, -1000.0), 1000.0);
        gl_FragColor = vec4(vel, 0.0, 1.0);
      }`;

    const pressureFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`;

    const gradientFrag = `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`;

    function getContext(cv) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let c = cv.getContext("webgl2", params);
      const isWebGL2 = !!c;
      if (!isWebGL2) c = cv.getContext("webgl", params) || cv.getContext("experimental-webgl", params);
      if (!c) return null;

      let halfFloat, linear;
      if (isWebGL2) {
        c.getExtension("EXT_color_buffer_float");
        linear = c.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = c.getExtension("OES_texture_half_float");
        linear = c.getExtension("OES_texture_half_float_linear");
        if (!halfFloat) return null;
      }

      const type = isWebGL2 ? c.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
      let rgba, rg, r;
      if (isWebGL2) {
        rgba = supported(c, c.RGBA16F, c.RGBA, type);
        rg = supported(c, c.RG16F, c.RG, type);
        r = supported(c, c.R16F, c.RED, type);
      } else {
        rgba = supported(c, c.RGBA, c.RGBA, type);
        rg = rgba; r = rgba;
      }
      if (!rgba || !rg || !r) return null;
      c.clearColor(0, 0, 0, 0);
      return { gl: c, ext: { rgba: rgba, rg: rg, r: r, halfFloatTexType: type, linear: !!linear } };
    }

    function supported(g, internalFormat, format, type) {
      if (!supportsRender(g, internalFormat, format, type)) {
        if (internalFormat === g.R16F) return supported(g, g.RG16F, g.RG, type);
        if (internalFormat === g.RG16F) return supported(g, g.RGBA16F, g.RGBA, type);
        return null;
      }
      return { internalFormat: internalFormat, format: format };
    }

    function supportsRender(g, internalFormat, format, type) {
      const tex = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, tex);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texImage2D(g.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = g.createFramebuffer();
      g.bindFramebuffer(g.FRAMEBUFFER, fbo);
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
      const status = g.checkFramebufferStatus(g.FRAMEBUFFER);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      return status === g.FRAMEBUFFER_COMPLETE;
    }

    function compile(type, source, keywords) {
      let src = source;
      if (keywords) src = keywords.map((k) => "#define " + k + "\n").join("") + source;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }

    function program(vsSource, fsSource, keywords) {
      const vs = compile(gl.VERTEX_SHADER, vsSource);
      const fs = compile(gl.FRAGMENT_SHADER, fsSource, keywords);
      if (!vs || !fs) return null;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      const uniforms = {};
      const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(prog, i).name;
        uniforms[name] = gl.getUniformLocation(prog, name);
      }
      return { uniforms: uniforms, use: () => gl.useProgram(prog) };
    }

    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture: texture, fbo: fbo, width: w, height: h,
        texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; },
      };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let a = createFBO(w, h, internalFormat, format, type, param);
      let b = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
        get read() { return a; }, set read(v) { a = v; },
        get write() { return b; }, set write(v) { b = v; },
        swap() { const t = a; a = b; b = t; },
      };
    }

    function getResolution(res) {
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(res);
      const max = Math.round(res * aspect);
      return gl.drawingBufferWidth > gl.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    function initFramebuffers() {
      const sim = getResolution(P.SIM_RES);
      const dyeRes = getResolution(P.DYE_RES);
      const type = ext.halfFloatTexType;
      const filtering = ext.linear ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, ext.rgba.internalFormat, ext.rgba.format, type, filtering);
      velocity = createDoubleFBO(sim.width, sim.height, ext.rg.internalFormat, ext.rg.format, type, filtering);
      divergence = createFBO(sim.width, sim.height, ext.r.internalFormat, ext.r.format, type, gl.NEAREST);
      curl = createFBO(sim.width, sim.height, ext.r.internalFormat, ext.r.format, type, gl.NEAREST);
      pressure = createDoubleFBO(sim.width, sim.height, ext.r.internalFormat, ext.r.format, type, gl.NEAREST);
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
      return false;
    }

    function init() {
      canvas = $("#fluid-canvas");
      if (!canvas || REDUCED || TOUCH) return false;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const ctx = getContext(canvas);
      if (!ctx) return false;
      gl = ctx.gl; ext = ctx.ext;

      const keywords = ext.linear ? null : ["MANUAL_FILTERING"];
      programs = {
        copy: program(baseVert, copyFrag),
        clear: program(baseVert, clearFrag),
        splat: program(baseVert, splatFrag),
        advection: program(baseVert, advectionFrag, keywords),
        divergence: program(baseVert, divergenceFrag),
        curl: program(baseVert, curlFrag),
        vorticity: program(baseVert, vorticityFrag),
        pressure: program(baseVert, pressureFrag),
        gradient: program(baseVert, gradientFrag),
        display: program(baseVert, displayFrag),
      };
      for (const k in programs) if (!programs[k]) return false;

      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      const elems = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elems);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      blit = (target) => {
        if (!target) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };

      initFramebuffers();
      lastTime = performance.now();
      live = true;
      canvas.classList.add("is-live");
      window.addEventListener("resize", () => { if (resizeCanvas()) initFramebuffers(); });
      requestAnimationFrame(frame);
      return true;
    }

    function frame() {
      if (!live) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.0166);
      lastTime = now;
      if (resizeCanvas()) initFramebuffers();
      step(dt);
      render();
      requestAnimationFrame(frame);
    }

    function step(dt) {
      gl.disable(gl.BLEND);

      programs.curl.use();
      gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      programs.vorticity.use();
      gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(programs.vorticity.uniforms.curl, P.CURL);
      gl.uniform1f(programs.vorticity.uniforms.dt, dt);
      blit(velocity.write); velocity.swap();

      programs.divergence.use();
      gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      programs.clear.use();
      gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(programs.clear.uniforms.value, P.PRESSURE);
      blit(pressure.write); pressure.swap();

      programs.pressure.use();
      gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < P.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }

      programs.gradient.use();
      gl.uniform2f(programs.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(programs.gradient.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(programs.gradient.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      programs.advection.use();
      gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.linear) gl.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velId = velocity.read.attach(0);
      gl.uniform1i(programs.advection.uniforms.uVelocity, velId);
      gl.uniform1i(programs.advection.uniforms.uSource, velId);
      gl.uniform1f(programs.advection.uniforms.dt, dt);
      gl.uniform1f(programs.advection.uniforms.dissipation, P.VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      if (!ext.linear) gl.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(programs.advection.uniforms.dissipation, P.DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    }

    function render() {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      programs.display.use();
      gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    function correctRadius(radius) {
      const aspect = canvas.width / canvas.height;
      return aspect > 1 ? radius * aspect : radius;
    }

    function splatInternal(x, y, dx, dy, color) {
      programs.splat.use();
      gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x, y);
      gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0);
      gl.uniform1f(programs.splat.uniforms.radius, correctRadius(P.SPLAT_RADIUS / 100));
      blit(velocity.write); velocity.swap();

      gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(programs.splat.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    }

    return {
      init: init,
      get live() { return live; },
      /* WHITE dye — the intensity is what drives the inversion depth */
      splat(x, y, dx, dy, strength) {
        if (!live) return;
        const s = strength === undefined ? 1 : strength;
        const nx = x / canvas.clientWidth;
        const ny = 1 - y / canvas.clientHeight;
        const i = clamp(0.28 * s, 0, 0.85);
        splatInternal(
          nx, ny,
          dx * P.SPLAT_FORCE * 0.0016 * s,
          -dy * P.SPLAT_FORCE * 0.0016 * s,
          [i, i, i]
        );
      },
    };
  })();

  /* ===================================================================
     07. POWER WINDOW — the cursor
     =================================================================== */
  const PowerWindow = {
    x: 0, y: 0, rx: 0, ry: 0, dx: 0, dy: 0, lastX: 0, lastY: 0,
    el: null, core: null, ring: null, label: null,

    init() {
      if (TOUCH || REDUCED) return;
      this.el = $("#pw");
      this.core = $("#pw-core");
      this.ring = $("#pw-ring");
      this.label = $("#pw-label");
      if (!this.el) return;

      this.x = this.rx = window.innerWidth / 2;
      this.y = this.ry = window.innerHeight / 2;

      window.addEventListener("pointermove", (e) => this.onMove(e), { passive: true });
      window.addEventListener("pointerdown", () => this.press(true));
      window.addEventListener("pointerup", () => this.press(false));
      document.addEventListener("mouseleave", () => this.el.classList.remove("is-live"));
      document.addEventListener("mouseenter", () => this.el.classList.add("is-live"));

      document.body.classList.add("has-cursor");
      this.el.classList.add("is-live");
      this.bindTargets();
      this.loop();
    },

    onMove(e) {
      this.dx = e.clientX - this.lastX;
      this.dy = e.clientY - this.lastY;
      this.lastX = e.clientX; this.lastY = e.clientY;
      this.x = e.clientX; this.y = e.clientY;

      if (Fluid.live && (Math.abs(this.dx) > 0.4 || Math.abs(this.dy) > 0.4)) {
        const speed = Math.min(Math.hypot(this.dx, this.dy) / 30, 1.4);
        Fluid.splat(e.clientX, e.clientY, this.dx, this.dy, 0.55 + speed * 0.7);
      }
    },

    press(down) {
      if (!window.gsap) return;
      window.gsap.to(this.core, { scale: down ? 1.9 : 1, duration: 0.4, ease: "power3.out" });
      window.gsap.to(this.ring, { scale: down ? 0.7 : 1, duration: 0.4, ease: "power3.out" });
    },

    loop() {
      const speed = Math.hypot(this.dx, this.dy);
      const stretch = clamp(speed / 70, 0, 0.35);
      const angle = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;

      this.rx = lerp(this.rx, this.x, 0.15);
      this.ry = lerp(this.ry, this.y, 0.15);

      if (this.core) {
        this.core.style.transform =
          "translate(" + this.x + "px," + this.y + "px) rotate(" + angle + "deg) scale(" +
          (1 + stretch) + "," + (1 - stretch * 0.55) + ")";
      }
      if (this.ring) this.ring.style.transform = "translate(" + this.rx + "px," + this.ry + "px)";
      if (this.label) this.label.style.transform = "translate(" + this.rx + "px," + this.ry + "px)";

      this.dx *= 0.86; this.dy *= 0.86;
      requestAnimationFrame(() => this.loop());
    },

    setLabel(text) {
      if (!this.label) return;
      this.label.textContent = text || "";
      this.el.classList.toggle("is-labelled", !!text);
    },
    hot(on) { if (this.el) this.el.classList.toggle("is-hot", !!on); },

    bindTargets(root) {
      const scope = root || document;
      const gsap = window.gsap;

      $$("[data-magnetic]", scope).forEach((el) => {
        if (el.__mag) return;
        el.__mag = true;
        const strength = parseFloat(el.dataset.magneticStrength || "0.32");
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          if (gsap) gsap.to(el, { x: mx * strength, y: my * strength, scale: 1.05, duration: 0.6, ease: "power3.out" });
        });
        el.addEventListener("pointerleave", () => {
          if (gsap) gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
        });
      });

      $$("a, button, [data-sfx], .reel__card, .rig__tile", scope).forEach((el) => {
        if (el.__hov) return;
        el.__hov = true;
        el.addEventListener("pointerenter", () => {
          this.hot(true);
          this.setLabel(el.dataset.cursorLabel || "");
          const note = el.dataset.note ? parseFloat(el.dataset.note) * 4 : 0;
          Audio.play("hover", { throttle: 60, freq: note || 1650 });
        });
        el.addEventListener("pointerleave", () => { this.hot(false); this.setLabel(""); });
      });
    },
  };

  /* ===================================================================
     08. DEPTHFIELD
     =================================================================== */
  const DepthField = {
    init() {
      if (!window.THREE || REDUCED) return false;
      const canvas = $("#depth-canvas");
      if (!canvas) return false;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch (e) { return false; }
      has.three = true;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 600);
      camera.position.set(0, 0, 42);

      const sprite = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      })();

      const COUNT = window.innerWidth < 860 ? 600 : 1300;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = rand(-70, 70);
        positions[i * 3 + 1] = rand(-46, 46);
        positions[i * 3 + 2] = rand(-280, 30);
        const c = CONFIG.palette[Math.floor(Math.random() * CONFIG.palette.length)];
        const tint = rand(0.3, 1);
        colors[i * 3] = c[0] * tint + 0.1;
        colors[i * 3 + 1] = c[1] * tint + 0.08;
        colors[i * 3 + 2] = c[2] * tint + 0.12;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const points = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.8, sizeAttenuation: true, map: sprite, vertexColors: true,
        transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      scene.add(points);

      let mx = 0, my = 0, tx = 0, ty = 0;
      window.addEventListener("pointermove", (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
      });

      canvas.classList.add("is-live");
      const clock = new THREE.Clock();

      const render = () => {
        const t = clock.getElapsedTime();
        mx = lerp(mx, tx, 0.04); my = lerp(my, ty, 0.04);
        const docH = Math.max(1, document.body.scrollHeight - window.innerHeight);
        const prog = clamp(window.scrollY / docH, 0, 1);

        camera.position.z = 42 - prog * 170;
        camera.position.x = lerp(camera.position.x, mx * 7, 0.06);
        camera.position.y = lerp(camera.position.y, -my * 5, 0.06);
        camera.lookAt(0, 0, camera.position.z - 60);
        points.rotation.z = t * 0.012;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
      };
      render();
      return true;
    },
  };

  /* ===================================================================
     09. CONTENT
     =================================================================== */
  const Content = {
    render() {
      this.reel();
      this.services();
      this.gmail();
      const y = $("#year");
      if (y) y.textContent = new Date().getFullYear();
    },

    reel() {
      const track = $("#reel-track");
      if (!track) return;

      track.innerHTML = CONFIG.projects.map((p, i) => {
        const n = String(i + 1).padStart(2, "0");
        return (
          '<button class="reel__card" type="button" data-project="' + p.id + '"' +
          ' data-sfx="hover" data-cursor-label="OPEN" style="--from:' + p.from + ';--to:' + p.to + '">' +
            '<span class="reel__art">' +
              /* ASSET HOOK: add `poster: "still.jpg"` to a project and it
                 renders here instead of the generated plate. */
              (p.poster ? '<img alt="" data-asset="' + p.poster + '">' : "") +
              '<span class="reel__perf"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
              '<span class="reel__num">' + n + "</span>" +
              '<span class="reel__rt">' + p.runtime + "</span>" +
              '<span class="reel__play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
            "</span>" +
            '<span class="reel__body">' +
              '<span class="reel__cat mono"><span>' + p.category + "</span><span>" + p.year + "</span></span>" +
              '<span class="reel__name">' + p.title + "</span>" +
              '<span class="reel__tags">' + p.tags.map((t) => "<span>" + t + "</span>").join("") + "</span>" +
            "</span>" +
          "</button>"
        );
      }).join("");

      $$(".reel__card", track).forEach((card) => {
        card.addEventListener("click", () => {
          const project = CONFIG.projects.filter((p) => p.id === card.dataset.project)[0];
          Viewer.open(project, card);
        });
      });
    },

    services() {
      const list = $("#services-list");
      if (!list) return;

      /* Service numbering is timecode too — same vernacular as the HUD */
      list.innerHTML = CONFIG.services.map((s, i) => {
        const tc = "00:0" + (7 + i) + ":" + pad(14 + i * 9);
        return (
          '<div class="service" style="--svc-accent:' + s.accent + '">' +
            '<button class="service__head" type="button" data-sfx="hover" data-cursor-label="OPEN" aria-expanded="false">' +
              '<span class="service__num mono">' + tc + "</span>" +
              '<span class="service__title">' + s.title + "</span>" +
              '<span class="service__right">' +
                '<span class="service__tools">' + s.tools.map((t) => "<i>" + t + "</i>").join("") + "</span>" +
                '<span class="service__plus"></span>' +
              "</span>" +
            "</button>" +
            '<div class="service__panel"><div class="service__panel-inner"><span></span>' +
              '<div class="service__panel-body">' +
                "<div>" +
                  '<p class="service__blurb">' + s.blurb + "</p>" +
                  '<p class="service__turn mono">Turnaround — ' + s.turnaround + "</p>" +
                "</div>" +
                '<ul class="service__list">' + s.deliverables.map((d) => "<li>" + d + "</li>").join("") + "</ul>" +
              "</div>" +
            "</div></div>" +
          "</div>"
        );
      }).join("");

      $$(".service", list).forEach((row) => {
        const head = $(".service__head", row);
        const panel = $(".service__panel", row);
        head.addEventListener("click", () => {
          const open = row.classList.toggle("is-open");
          head.setAttribute("aria-expanded", open ? "true" : "false");
          Audio.play("click", { throttle: 120 });
          if (window.gsap) {
            window.gsap.to(panel, {
              height: open ? panel.scrollHeight : 0,
              duration: 0.7, ease: "expo.out",
              onComplete: () => {
                if (open) panel.style.height = "auto";
                if (has.st) window.ScrollTrigger.refresh();
              },
            });
          } else {
            panel.style.height = open ? "auto" : "0px";
          }
        });
      });
    },

    gmail() {
      const href = buildGmail();
      $$("[data-gmail]").forEach((a) => {
        a.setAttribute("href", href);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        a.addEventListener("click", () => Audio.play("click"));
      });
    },
  };

  /* ===================================================================
     10. MOTION
     =================================================================== */
  const Motion = {
    init() {
      this.split();
      if (!has.gsap) return;
      if (has.st) {
        this.reveals();
        this.depth();
        this.parallax();
        this.counters();
        this.responsiveRigs();
        this.operator();
      }
      this.marquee();
      this.credits();
      this.tilt();
    },

    split() {
      $$("[data-split]").forEach((el) => {
        if (el.__split) return;
        el.__split = true;
        const mode = el.dataset.split === "words" ? "words" : "chars";
        el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());

        const walk = (node) => {
          const out = document.createDocumentFragment();
          Array.prototype.slice.call(node.childNodes).forEach((child) => {
            if (child.nodeType === 3) {
              const parts = mode === "words" ? child.textContent.split(/(\s+)/) : child.textContent.split("");
              parts.forEach((part) => {
                if (/^\s+$/.test(part) || part === "") {
                  out.appendChild(document.createTextNode(part === "" ? "" : " "));
                  return;
                }
                const mask = document.createElement("span");
                mask.className = "split-mask";
                mask.setAttribute("aria-hidden", "true");
                const unit = document.createElement("span");
                unit.className = "split-unit";
                unit.textContent = part;
                mask.appendChild(unit);
                out.appendChild(mask);
              });
            } else if (child.nodeName === "BR") {
              out.appendChild(child.cloneNode());
            } else {
              out.appendChild(child.cloneNode(true));
            }
          });
          return out;
        };

        const frag = walk(el);
        el.innerHTML = "";
        el.appendChild(frag);
      });

      if (!has.gsap || !has.st) return;
      const gsap = window.gsap;
      $$("[data-split]").forEach((el) => {
        if (el.classList.contains("hero__title")) return;
        const units = $$(".split-unit", el);
        if (!units.length) return;
        gsap.fromTo(units,
          { yPercent: 112, opacity: 0, z: -140 },
          {
            yPercent: 0, opacity: 1, z: 0, duration: 1.05, ease: "expo.out",
            stagger: { each: el.dataset.split === "words" ? 0.055 : 0.022 },
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    },

    reveals() {
      const gsap = window.gsap;
      $$("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { y: 32, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out",
          delay: parseFloat(el.dataset.revealDelay || "0"),
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
    },

    /* 3D depth scrolling — targets rise out of the depth of field on
       the way in and recede on the way out. */
    depth() {
      const gsap = window.gsap;
      const targets = []
        .concat($$(".service"))
        .concat($$(".section__head"))
        .concat($$("[data-depth]"));

      targets.forEach((el) => {
        if (el.__depth) return;
        el.__depth = true;
        const deep = el.dataset.depth === "deep";
        gsap.timeline({
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 },
        })
          .fromTo(el,
            { z: deep ? -520 : -280, scale: deep ? 0.86 : 0.94, opacity: deep ? 0.18 : 0.3,
              filter: deep ? "blur(14px)" : "blur(0px)" },
            { z: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" })
          .to(el, {
            z: deep ? 200 : 120, scale: deep ? 1.05 : 1.02,
            opacity: deep ? 0.25 : 0.5,
            filter: deep ? "blur(9px)" : "blur(0px)",
            duration: 1, ease: "power2.in",
          });
      });
    },

    parallax() {
      const gsap = window.gsap;
      $$("[data-speed]").forEach((el) => {
        gsap.to(el, {
          yPercent: parseFloat(el.dataset.speed || "0.1") * 100,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },

    counters() {
      const gsap = window.gsap;
      $$("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end, duration: 1.9, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
          onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
        });
      });
    },

    /* ---- BREAKPOINT-SCOPED RIGS ------------------------------------
       The pinned reel and the grade wipe only make sense on a wide
       viewport, but a plain `if (innerWidth < N) return` evaluates ONCE
       at boot — load the page in a narrow window (or a background tab
       that reports a small viewport) and both rigs stay dead forever,
       even after the window is maximised. gsap.matchMedia() attaches
       and tears them down as the breakpoint actually changes. */
    responsiveRigs() {
      const gsap = window.gsap;
      if (!gsap.matchMedia) return this.legacyRigs();
      const mm = gsap.matchMedia();

      /* PINNED HORIZONTAL REEL. .reel__pin is sticky in CSS, so this
         only scrubs the strip sideways — no pin-spacer to fight Lenis. */
      mm.add("(min-width: 861px)", () => {
        const section = $("#work");
        const track = $("#reel-track");
        const indexEl = $("#reel-index");
        if (!section || !track) return;
        const total = CONFIG.projects.length;

        const strip = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 64),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!indexEl) return;
              const i = clamp(Math.round(self.progress * (total - 1)) + 1, 1, total);
              indexEl.textContent = pad(i) + " / " + pad(total);
            },
          },
        });

        /* each card leans as it crosses the viewport, driven by the
           strip's own tween rather than by page scroll */
        $$(".reel__card", track).forEach((card) => {
          gsap.fromTo(card,
            { rotateY: 12, scale: 0.94 },
            {
              rotateY: -12, scale: 1, ease: "none",
              scrollTrigger: {
                trigger: card, containerAnimation: strip,
                start: "left right", end: "right left", scrub: true,
              },
            }
          );
        });
      });

      /* GRADE WIPE — scroll drags the before/after handle */
      mm.add("(min-width: 1081px)", () => {
        const section = $("#orchid");
        const player = $("#orchid-player");
        if (!section || !player) return;
        gsap.fromTo(player,
          { "--wipe": "92%" },
          {
            "--wipe": "6%", ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 },
          }
        );
      });

      /* Playback is not breakpoint-dependent — both plates run in sync
         whenever the section is on screen. */
      const section = $("#orchid");
      const vids = [$("#orchid-video"), $("#orchid-video-log")].filter(Boolean);
      if (section && vids.length) {
        window.ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => vids.forEach((v) => v.play().catch(() => {})),
          onEnterBack: () => vids.forEach((v) => v.play().catch(() => {})),
          onLeave: () => vids.forEach((v) => v.pause()),
          onLeaveBack: () => vids.forEach((v) => v.pause()),
        });
      }
    },

    /* Fallback for a GSAP build without matchMedia (pre-3.11) */
    legacyRigs() {
      const gsap = window.gsap;
      const section = $("#work");
      const track = $("#reel-track");
      if (section && track && window.innerWidth >= 861) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 64),
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.9, invalidateOnRefresh: true },
        });
      }
      const player = $("#orchid-player");
      const orchid = $("#orchid");
      if (player && orchid && window.innerWidth >= 1081) {
        gsap.fromTo(player, { "--wipe": "92%" }, {
          "--wipe": "6%", ease: "none",
          scrollTrigger: { trigger: orchid, start: "top top", end: "bottom bottom", scrub: 1 },
        });
      }
    },

    /* The medallion drifts and counter-rotates as the hero scrolls */
    operator() {
      const el = $("#operator");
      if (!el) return;
      const gsap = window.gsap;
      gsap.to(el, {
        y: -60, rotate: 8, ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
      });
      if (!REDUCED) {
        gsap.to(el, { y: "+=12", duration: 3.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      }
    },

    tilt() {
      if (REDUCED || TOUCH || !window.gsap) return;
      const gsap = window.gsap;
      $$("[data-tilt]").forEach((el) => {
        const max = parseFloat(el.dataset.tiltMax || "12");
        const layers = $$("[data-tilt-layer]", el);
        layers.forEach((l) => gsap.set(l, { z: parseFloat(l.dataset.tiltLayer || "30") }));

        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(el, {
            rotateY: px * max, rotateX: -py * max, duration: 0.7, ease: "power3.out",
            transformPerspective: 900, transformOrigin: "50% 50%",
          });
          layers.forEach((l) => {
            const depth = parseFloat(l.dataset.tiltLayer || "30") / 100;
            gsap.to(l, { x: -px * 24 * depth, y: -py * 20 * depth, duration: 0.8, ease: "power3.out" });
          });
        });
        el.addEventListener("pointerleave", () => {
          gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1.1, ease: "elastic.out(1, 0.5)" });
          layers.forEach((l) => gsap.to(l, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.5)" }));
        });
      });
    },

    marquee() {
      const track = $("#marquee-track");
      if (!track || !window.gsap) return;
      track.innerHTML = track.innerHTML + track.innerHTML;
      const tween = window.gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
      if (!REDUCED) {
        let ts = 1;
        window.gsap.ticker.add(() => {
          ts = lerp(ts, clamp(1 + Math.abs(Scroll.velocity) * 0.06, 1, 5), 0.06);
          tween.timeScale(ts);
        });
      }
    },

    credits() {
      const items = $$("#credits li");
      if (!items.length || !("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.target.classList.toggle("is-lit", e.isIntersecting)),
        { rootMargin: "-46% 0px -46% 0px" }
      );
      items.forEach((el) => io.observe(el));
    },
  };

  /* ===================================================================
     11. RIG — software icons
     =================================================================== */
  const Rig = {
    init() {
      const caption = $("#rig-caption");
      $$(".rig__tile").forEach((tile, i) => {
        const accent = tile.dataset.accent || "#C98B3A";
        tile.style.setProperty("--tile-accent", accent);

        const chassis = $(".rig__chassis", tile);
        const wave = $(".rig__wave", tile);
        const name = $(".rig__name", tile).textContent;
        const gsap = window.gsap;

        if (gsap && !REDUCED) {
          gsap.to(chassis, {
            y: -10, duration: 2.6 + i * 0.25, ease: "sine.inOut",
            repeat: -1, yoyo: true, delay: i * 0.18,
          });
        }

        tile.addEventListener("pointermove", (e) => {
          const r = tile.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          if (gsap) {
            gsap.to(tile, {
              rotateY: px * 18, rotateX: -py * 18, scale: 1.04,
              duration: 0.5, ease: "power3.out", transformPerspective: 800,
            });
            gsap.to(chassis, { x: px * 16, duration: 0.6, ease: "power3.out" });
          }
        });

        tile.addEventListener("pointerenter", () => {
          if (caption) caption.textContent = name;
          Ripple.start(wave, tile, accent);
          tile.classList.add("is-rippling");

          /* punch the fluid so the negative bead blooms over the tile */
          if (Fluid.live) {
            const r = tile.getBoundingClientRect();
            for (let k = 0; k < 5; k++) {
              Fluid.splat(
                r.left + r.width / 2 + rand(-r.width / 4, r.width / 4),
                r.top + r.height / 2 + rand(-r.height / 4, r.height / 4),
                rand(-30, 30), rand(-30, 30), 1.5
              );
            }
          }
          Audio.play("hover", { throttle: 80, freq: parseFloat(tile.dataset.note) * 4 });
        });

        tile.addEventListener("pointerleave", () => {
          if (caption) caption.textContent = " ";
          tile.classList.remove("is-rippling");
          Ripple.stop(wave);
          if (window.gsap) {
            window.gsap.to(tile, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" });
            window.gsap.to(chassis, { x: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
          }
        });

        tile.addEventListener("click", () => Audio.play("click"));
      });
    },
  };

  const Ripple = {
    start(canvas, host, color) {
      if (!canvas || REDUCED) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rgb = hexToRGB(color);
      const css = "rgba(" + Math.round(rgb[0] * 255) + "," + Math.round(rgb[1] * 255) + "," + Math.round(rgb[2] * 255) + ",";
      let t = 0;

      const draw = () => {
        if (!canvas.__live) return;
        t += 0.045;
        ctx.clearRect(0, 0, r.width, r.height);
        for (let ring = 0; ring < 3; ring++) {
          const phase = t - ring * 0.5;
          if (phase < 0) continue;
          const radius = ((phase % 1.6) / 1.6) * Math.max(r.width, r.height) * 0.72;
          const alpha = 0.4 * (1 - (phase % 1.6) / 1.6);
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.14) {
            const wob = Math.sin(a * 5 + t * 3.4) * radius * 0.07 + Math.sin(a * 3 - t * 2) * radius * 0.05;
            const x = r.width / 2 + Math.cos(a) * (radius + wob);
            const y = r.height / 2 + Math.sin(a) * (radius + wob) * 0.82;
            a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = css + alpha + ")";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
        requestAnimationFrame(draw);
      };
      canvas.__live = true;
      draw();
    },
    stop(canvas) { if (canvas) canvas.__live = false; },
  };

  function hexToRGB(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16) / 255,
      parseInt(h.substring(2, 4), 16) / 255,
      parseInt(h.substring(4, 6), 16) / 255,
    ];
  }

  /* ===================================================================
     12. VIEWER — FLIP expansion
     =================================================================== */
  const Viewer = {
    el: null, video: null, frame: null, card: null, open_: false,

    init() {
      this.el = $("#viewer");
      this.video = $("#viewer-video");
      this.frame = $("#viewer-frame");

      const close = $("#viewer-close");
      if (close) close.addEventListener("click", () => this.close());
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.open_) this.close(); });
      if (this.el) this.el.addEventListener("click", (e) => { if (e.target === this.el) this.close(); });

      const orchid = $("#orchid-player");
      if (orchid) {
        orchid.addEventListener("click", () => this.open({
          id: "orchid", title: "ORCHID", category: "Case study · 2025", runtime: "01:30",
          tags: ["AI Generation", "Interpolation", "Grade", "Sound Design"],
          blurb: "A fully agentic short-form film: generative shots directed frame by frame, interpolated to a true 24fps cadence, then finished like live action — a Resolve colour pass, a designed soundstage, and a hand-cut edit.",
        }, orchid));
      }
    },

    open(project, sourceEl) {
      if (!project || !this.el || this.open_) return;
      this.open_ = true;
      this.card = sourceEl;
      Audio.play("click");
      Audio.play("open", { throttle: 200 });
      Scroll.stop();

      $("#viewer-category").textContent = project.category;
      $("#viewer-title").textContent = project.title;
      $("#viewer-blurb").textContent = project.blurb || "";
      $("#viewer-tags").innerHTML = (project.tags || []).map((t) => "<li>" + t + "</li>").join("");

      if (this.video) { this.video.src = project.src || ORCHID_SRC; this.video.currentTime = 0; }

      const gsap = window.gsap;
      if (!gsap) {
        this.el.classList.add("is-open");
        this.el.setAttribute("aria-hidden", "false");
        return;
      }

      /* FIRST */
      const art = $(".reel__art", sourceEl) || sourceEl;
      const first = art.getBoundingClientRect();
      const cs = getComputedStyle(art);

      const clone = document.createElement("div");
      clone.className = "flip-clone";
      clone.style.cssText =
        "left:" + first.left + "px;top:" + first.top + "px;width:" + first.width + "px;height:" + first.height + "px;";
      clone.style.backgroundColor = cs.backgroundColor;
      clone.style.backgroundImage = cs.backgroundImage;
      clone.style.backgroundSize = "cover";
      document.body.appendChild(clone);
      sourceEl.classList.add("is-open");

      /* LAST */
      this.el.classList.add("is-open");
      this.el.setAttribute("aria-hidden", "false");
      gsap.set(this.el, { opacity: 0 });
      const last = this.frame.getBoundingClientRect();

      /* INVERT + PLAY */
      gsap.timeline({
        onComplete: () => {
          clone.remove();
          if (this.video) this.video.play().catch(() => {});
          const c = $("#viewer-close");
          if (c) c.focus();
        },
      })
        .to(clone, {
          left: last.left, top: last.top, width: last.width, height: last.height,
          duration: 0.85, ease: "expo.inOut",
        })
        .to(this.el, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.42)
        .fromTo(".viewer__meta > *",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out" }, 0.55);
    },

    close() {
      if (!this.open_) return;
      this.open_ = false;
      Audio.play("click");

      const gsap = window.gsap;
      const finish = () => {
        this.el.classList.remove("is-open");
        this.el.setAttribute("aria-hidden", "true");
        if (this.video) { this.video.pause(); this.video.removeAttribute("src"); this.video.load(); }
        if (this.card) { this.card.classList.remove("is-open"); this.card.focus(); }
        Scroll.start();
      };
      if (!gsap) return finish();

      const art = this.card ? $(".reel__art", this.card) || this.card : null;
      const last = art ? art.getBoundingClientRect() : null;
      const first = this.frame.getBoundingClientRect();

      const clone = document.createElement("div");
      clone.className = "flip-clone";
      clone.style.cssText =
        "left:" + first.left + "px;top:" + first.top + "px;width:" + first.width + "px;height:" + first.height + "px;background:#060310;";
      document.body.appendChild(clone);

      gsap.timeline({ onComplete: () => { clone.remove(); finish(); } })
        .to(this.el, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0)
        .to(clone, last
          ? { left: last.left, top: last.top, width: last.width, height: last.height, duration: 0.7, ease: "expo.inOut" }
          : { opacity: 0, scale: 0.9, duration: 0.5 }, 0.05)
        .to(clone, { opacity: 0, duration: 0.25 }, 0.5);
    },
  };

  /* ===================================================================
     13. HUD + NAV
     =================================================================== */
  const HUD = {
    fill: null, head: null, tc: null, clip: null, sections: [],

    init() {
      this.fill = $("#hud-fill");
      this.head = $("#hud-head");
      this.tc = $("#hud-tc");
      this.clip = $("#hud-clip");

      this.sections = $$("[data-clip]").map((el) => ({ el: el, name: el.dataset.clip }));

      /* clip boundaries drawn onto the scrubber */
      const marks = $("#hud-marks");
      if (marks) {
        const docH = Math.max(1, document.body.scrollHeight - window.innerHeight);
        marks.innerHTML = this.sections
          .map((s) => {
            const p = clamp((s.el.offsetTop / docH) * 100, 0, 100);
            return '<i style="left:' + p.toFixed(2) + '%"></i>';
          })
          .join("");
      }

      /* Lenis drives this on wheel/touch, but a keyboard scroll, an
         anchor jump or a scrollbar drag can bypass it — so listen
         natively too. update() only writes DOM, so double-calling is
         harmless and the readout can never desync from the page. */
      if (!this.bound) {
        this.bound = true;
        window.addEventListener("scroll", () => this.update(window.scrollY), { passive: true });
      }
      this.update(window.scrollY);
    },

    update(y) {
      const docH = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const p = clamp(y / docH, 0, 1);
      if (this.fill) this.fill.style.width = p * 100 + "%";
      if (this.head) this.head.style.left = p * 100 + "%";
      if (this.tc) this.tc.textContent = timecode(p * CONFIG.runtime);

      if (this.clip) {
        const mid = y + window.innerHeight * 0.5;
        let current = this.sections[0];
        for (let i = 0; i < this.sections.length; i++) {
          if (this.sections[i].el.offsetTop <= mid) current = this.sections[i];
        }
        if (current && this.clip.textContent !== current.name) this.clip.textContent = current.name;
      }
    },
  };

  const Nav = {
    el: null, links: [],

    init() {
      this.el = $("#nav");
      this.links = $$("[data-nav-link]");

      $$('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href");
          if (!id || id === "#") return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          Audio.play("click", { throttle: 200 });
          this.closeDrawer();
          Scroll.to(target, -60);
        });
      });

      const burger = $("#nav-burger");
      const drawer = $("#drawer");
      if (burger && drawer) {
        burger.addEventListener("click", () => {
          const open = drawer.classList.toggle("is-open");
          burger.setAttribute("aria-expanded", open ? "true" : "false");
          drawer.setAttribute("aria-hidden", open ? "false" : "true");
          Audio.play("toggle");
          open ? Scroll.stop() : Scroll.start();
        });
      }

      const toggle = $("#sound-toggle");
      if (toggle) {
        const sync = () => toggle.setAttribute("aria-pressed", Audio.enabled ? "true" : "false");
        sync();
        toggle.addEventListener("click", () => {
          Audio.setEnabled(!Audio.enabled);
          sync();
          if (Audio.enabled) Audio.play("toggle");
        });
      }

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = "#" + entry.target.id;
            this.links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
          });
        }, { rootMargin: "-45% 0px -45% 0px" });
        ["work", "stack", "orchid", "services", "about"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) io.observe(el);
        });
      }
    },

    closeDrawer() {
      const drawer = $("#drawer");
      const burger = $("#nav-burger");
      if (drawer && drawer.classList.contains("is-open")) {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
        if (burger) burger.setAttribute("aria-expanded", "false");
        Scroll.start();
      }
    },

    onScroll(y) { if (this.el) this.el.classList.toggle("is-stuck", y > 40); },
  };

  /* ===================================================================
     14. BOOT
     =================================================================== */
  function boot() {
    has.gsap = !!window.gsap;
    has.st = !!(window.gsap && window.ScrollTrigger);
    if (has.st) window.gsap.registerPlugin(window.ScrollTrigger);

    Preloader.init();
    Audio.init();
    Scroll.init();
    Scroll.stop();

    Content.render();
    Motion.init();
    Rig.init();
    Viewer.init();
    Nav.init();
    HUD.init();

    if (!Fluid.init()) { /* no WebGL: the DOM power window still inverts */ }
    PowerWindow.init();
    DepthField.init();
    PowerWindow.bindTargets();

    const jobs = [];
    $$("[data-asset]").forEach((img) => {
      Preloader.register(1);
      jobs.push(Assets.image(img.dataset.asset).then((url) => {
        if (url) img.src = url;
        Preloader.step();
      }));
    });

    Preloader.register(1);
    jobs.push(Assets.video(CONFIG.assets.orchid).then((url) => {
      ORCHID_SRC = url;
      [$("#orchid-video"), $("#orchid-video-log")].forEach((v) => {
        if (v) { v.src = url; v.load(); }
      });
      Preloader.step();
    }));

    if (document.fonts && document.fonts.ready) {
      Preloader.register(1);
      jobs.push(document.fonts.ready.then(() => Preloader.step()));
    }

    const minimum = new Promise((r) => setTimeout(r, REDUCED ? 300 : 2000));

    Promise.all([Promise.all(jobs), minimum])
      .catch(() => {})
      .then(() => {
        if (has.st) window.ScrollTrigger.refresh();
        return Preloader.finish();
      })
      .then(() => {
        if (has.st) window.ScrollTrigger.refresh();
        HUD.init();
      });

    /* Two failsafes: a slow network, and a reveal timeline that never
       completes (rAF is paused while a tab sits in the background). */
    setTimeout(() => Preloader.finish(), 9000);
    setTimeout(() => {
      if (!document.body.classList.contains("is-loading")) return;
      document.body.classList.remove("is-loading");
      const curtain = $("#preloader");
      if (curtain) curtain.style.display = "none";
      if (window.gsap) {
        window.gsap.set("[data-cine], .nav, .hud, .marquee, .hero__title .split-unit", { clearProps: "all" });
      }
      Scroll.start();
      if (has.st) window.ScrollTrigger.refresh();
    }, 14000);

    window.addEventListener("load", () => { if (has.st) window.ScrollTrigger.refresh(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
