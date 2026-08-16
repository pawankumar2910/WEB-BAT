import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ASSETS, CREDITS, SITE } from "../lib/constants.js";
import { cx, prefersReducedMotion } from "../lib/utils.js";
import { useSectionWhoosh } from "../hooks/useSfx.js";

gsap.registerPlugin(ScrollTrigger);

/* =====================================================================
   ABOUT — the movie credits
   ---------------------------------------------------------------------
   A tall scroll track with a sticky stage. Scrolling down rolls the
   credit column upward, exactly like an end-credit crawl.

   The "fades in from black, comes to life with a glow" behaviour is done
   with a mask rather than per-line observers: every line carries a
   permanent violet text-shadow, and a vertical mask gradient decides
   which lines are currently visible. A line therefore brightens as it
   enters the readable band and dissolves as it leaves — one composited
   gradient instead of forty scroll listeners.

   The last stretch of the track scales the whole stage up and fades it
   out, pulling the viewer "through the screen" into the contact section.
   ===================================================================== */
export function AboutCredits() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const rollRef = useRef(null);
  const portraitRef = useRef(null);
  useSectionWhoosh(trackRef, { threshold: 0.2 });

  useEffect(() => {
    const track = trackRef.current;
    const roll = rollRef.current;
    const stage = stageRef.current;
    if (!track || !roll || !stage) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(roll, { yPercent: -18 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      /* The crawl itself. */
      gsap.fromTo(
        roll,
        { yPercent: 34 },
        {
          yPercent: -74,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );

      /* Portrait counter-drifts, so the frame feels anchored while the
         type moves past it. */
      gsap.fromTo(
        portraitRef.current,
        { yPercent: 6, scale: 1.04 },
        {
          yPercent: -6,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        }
      );

      /* The pull-through. Only the last 22% of the track drives it. */
      gsap.fromTo(
        stage,
        { scale: 1, opacity: 1, filter: "blur(0px)" },
        {
          scale: 3.4,
          opacity: 0,
          filter: "blur(14px)",
          ease: "power2.in",
          scrollTrigger: {
            trigger: track,
            start: "bottom bottom+=68%",
            end: "bottom bottom",
            scrub: 0.4,
          },
        }
      );
    }, track);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={trackRef} className="relative h-[340svh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div ref={stageRef} className="shell grid w-full items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
          {/* ---- Framed portrait ------------------------------------- */}
          <div className="relative mx-auto w-[min(22rem,72vw)] lg:mx-0">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgb(139 92 246 / 0.5), transparent 68%)",
              }}
            />
            <div className="glass relative overflow-hidden rounded-[1.6rem] p-2.5">
              <img
                ref={portraitRef}
                src={ASSETS.portrait}
                alt="Pavan"
                className="w-full rounded-[1.1rem] object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between px-2 pt-3 pb-1.5">
                <span className="font-display text-[0.68rem] tracking-[0.26em] uppercase text-[var(--ink-faint)]">
                  {SITE.firstName}
                </span>
                <span className="font-display text-[0.68rem] tracking-[0.26em] text-[var(--ink-ghost)]">
                  4 YRS
                </span>
              </div>
            </div>
          </div>

          {/* ---- The crawl -------------------------------------------- */}
          <div
            className="relative h-[74svh] overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
            }}
          >
            <div ref={rollRef} className="space-y-7 text-center lg:text-left">
              <p className="eyebrow">About</p>
              <p className="max-w-lg text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
                I cut, grade and build films for brands that need their product
                to feel inevitable. Four years in post-production, most of it
                spent on the unglamorous half — the tracking, the roto, the
                third pass on a grade nobody will consciously notice.
              </p>

              {CREDITS.map((entry, i) =>
                entry.divider ? (
                  <div
                    key={`div-${i}`}
                    className="mx-auto h-px w-24 bg-[var(--ink-ghost)] lg:mx-0"
                    aria-hidden
                  />
                ) : (
                  <div key={entry.name + i} className="credit-glow">
                    <p className="credit-line text-[0.66rem] tracking-[0.34em] uppercase text-[var(--ink-faint)]">
                      {entry.role}
                    </p>
                    <p
                      className={cx(
                        "credit-line mt-1.5 font-semibold text-[var(--ink)]",
                        entry.hero
                          ? "text-[clamp(1.7rem,4.4vw,2.9rem)] tracking-[0.04em]"
                          : "text-[clamp(0.92rem,1.9vw,1.15rem)]"
                      )}
                    >
                      {entry.name}
                    </p>
                  </div>
                )
              )}

              <div className="flex flex-wrap justify-center gap-8 pt-4 lg:justify-start">
                {SITE.stats.map((s) => (
                  <div key={s.label}>
                    <p className="display text-[1.9rem] text-[var(--ink)]">{s.value}</p>
                    <p className="mt-1 text-[0.72rem] tracking-[0.18em] uppercase text-[var(--ink-faint)]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="pt-6 font-display text-[0.68rem] tracking-[0.3em] uppercase text-[var(--ink-ghost)]">
                Keep scrolling
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
