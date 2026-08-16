import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MousePointer2 } from "lucide-react";

import { ASSETS, SITE } from "../lib/constants.js";
import { EASE, scrollToId } from "../lib/utils.js";
import { useRevealMask } from "../hooks/useRevealMask.js";
import { useSfx } from "../hooks/useSfx.js";
import { GlowButton } from "./ui/Primitives.jsx";

/* =====================================================================
   HERO — the cinematic reveal
   ---------------------------------------------------------------------
   Stacking order inside the stage, back to front:

     1. "HI, I'M PAVAN"   huge outlined display type          z-0
     2. hero-face.webp    the real face, always fully painted z-10
     3. hero-cowl.webp    the cowl, masked by the cursor      z-20
     4. halo              soft violet light around the hole   z-30

   Only layer 3 is masked. The face is never hidden or faded — it is
   simply covered, and the mask decides how much of the cover survives.
   ===================================================================== */

export function Hero({ onEnquire }) {
  const sectionRef = useRef(null);
  const { play } = useSfx();

  const { containerRef, maskRef, isRevealing } = useRevealMask({
    radius: 250,
    ease: 0.2,
    radiusEase: 0.11,
  });

  /* Scroll parallax: the portrait drifts up and shrinks slightly while the
     type behind it travels further, opening a sense of depth. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const typeY = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-28 pb-10"
    >
      <div className="shell relative">
        {/* ---- Type behind the portrait -------------------------------- */}
        <motion.div
          style={{ y: typeY, opacity: fade }}
          className="pointer-events-none absolute inset-x-0 top-[6%] z-0 flex justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40, letterSpacing: "0.24em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.1em" }}
            transition={{ duration: 1.5, ease: EASE, delay: 0.15 }}
            /* Below `sm` the line is allowed to wrap: at 375px the single
               line measures ~381px against a 375px viewport and `nowrap`
               would shave a character off each end. */
            className="display px-2 text-center text-[clamp(2.1rem,11vw,9.5rem)] text-balance whitespace-normal text-[var(--ink)] sm:whitespace-nowrap"
          >
            <span className="stroke-type">HI, I&rsquo;M </span>
            <span className="text-gradient">PAVAN</span>
          </motion.h1>
        </motion.div>

        {/* ---- The reveal stage ---------------------------------------- */}
        <motion.div
          style={{ y: portraitY, scale: portraitScale }}
          className="relative z-10 mx-auto mt-[clamp(3rem,9vw,7rem)] w-[min(760px,92%)]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: "blur(18px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
            ref={containerRef}
            data-revealing={isRevealing}
            className="reveal-stage cursor-none"
            onPointerEnter={() => play("hover", { gain: 1.4 })}
          >
            {/* Layer 2 — the face. Sits underneath, unmasked, always there. */}
            <img
              src={ASSETS.heroFace}
              alt="Pavan"
              className="reveal-layer reveal-face"
              draggable={false}
              fetchPriority="high"
            />

            {/* Layer 3 — the cowl, with the hole punched through it. */}
            <img
              ref={maskRef}
              src={ASSETS.heroCowl}
              alt="Pavan in a Batman cowl"
              className="reveal-layer reveal-cowl"
              draggable={false}
              fetchPriority="high"
            />

            {/* Layer 4 — light spill. Decorative only. */}
            <div className="reveal-halo" aria-hidden />
          </motion.div>

          {/* Hint, retired the moment the user finds the effect. */}
          <motion.div
            animate={{ opacity: isRevealing ? 0 : 1, y: isRevealing ? 8 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="pointer-events-none mt-5 flex items-center justify-center gap-2 text-[0.7rem] tracking-[0.26em] uppercase text-[var(--ink-faint)]"
          >
            <MousePointer2 className="h-3.5 w-3.5" strokeWidth={2} />
            Hover to unmask
          </motion.div>
        </motion.div>

        {/* ---- Ground UI ------------------------------------------------ */}
        <motion.div
          style={{ opacity: fade }}
          className="relative z-20 mt-12 flex flex-col items-center gap-6 md:mt-16 md:flex-row md:items-end md:justify-between"
        >
          {/* Left: caption panel. No CV button, by design. */}
          <motion.div
            initial={{ opacity: 0, x: -36, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.85 }}
            className="glass max-w-sm rounded-2xl px-6 py-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet" />
              </span>
              <span className="eyebrow !text-[0.62rem]">{SITE.availability}</span>
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {SITE.tagline}
            </p>
          </motion.div>

          {/* Right: the one call to action. */}
          <motion.div
            initial={{ opacity: 0, x: 36, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.95 }}
          >
            <GlowButton icon={ArrowRight} onClick={onEnquire}>
              Enquire
            </GlowButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue. */}
      <motion.button
        type="button"
        style={{ opacity: fade }}
        onClick={() => {
          play("click");
          scrollToId("services");
        }}
        onPointerEnter={() => play("hover")}
        aria-label="Scroll to services"
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-[var(--glass-border)] p-1.5">
          <motion.span
            animate={{ y: [0, 9, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-[var(--ink-faint)]"
          />
        </span>
      </motion.button>
    </section>
  );
}
