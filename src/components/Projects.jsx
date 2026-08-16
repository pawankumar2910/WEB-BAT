import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Play, X } from "lucide-react";

import { PORTRAIT, PROJECTS } from "../lib/constants.js";
import { EASE, cx, prefersReducedMotion } from "../lib/utils.js";
import { useEscape, useScrollLock } from "../hooks/useUi.js";
import { useSectionWhoosh, useSfx } from "../hooks/useSfx.js";
import { Chip, SectionHeading, SoftwareRow } from "./ui/Primitives.jsx";

gsap.registerPlugin(ScrollTrigger);

/* =====================================================================
   SHUTTER CARD
   `--shutter` runs 1 -> 0 as the card scrolls in. The CSS clip-path
   turns that into a blind rolling up off the artwork, and the slat
   overlay fades out on the same value.
   ===================================================================== */
function ProjectCard({ project, index, onOpen }) {
  const cardRef = useRef(null);
  const thumbRef = useRef(null);
  const { play: sound } = useSfx();
  const [hovered, setHovered] = useState(false);
  const portrait = project.aspect === PORTRAIT;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      el.style.setProperty("--shutter", "0");
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { "--shutter": 1 },
        {
          "--shutter": 0,
          ease: "expo.out",
          duration: 1.25,
          delay: index * 0.08,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        }
      );

      /* Thumbnail drifts against the card as it passes — parallax inside
         a frame that is itself moving. */
      gsap.fromTo(
        thumbRef.current,
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  return (
    <article
      ref={cardRef}
      style={{ "--shutter": 1 }}
      className="glass glass-lit group relative overflow-hidden rounded-3xl"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        onPointerEnter={() => {
          sound("hover");
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        className="block w-full text-left"
        aria-label={`Open ${project.client} case study`}
      >
        {/* ---- Thumbnail (the shuttered part) -------------------------
             Both cards keep the same 16:10 frame so the grid stays even.
             A vertical film is contained inside it over a blurred copy of
             its own poster, rather than cropped to a letterbox slot. */}
        <span className="shutter relative block aspect-[16/10] overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(140deg, ${project.gradient.from}, ${project.gradient.to})`,
            }}
          />

          {portrait && (
            <img
              src={project.poster}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            />
          )}

          <span ref={thumbRef} className="absolute inset-0 block h-[118%]">
            <img
              src={project.poster}
              alt=""
              loading="lazy"
              className={cx(
                "absolute inset-0 h-full w-full transition-opacity duration-700",
                portrait ? "object-contain" : "object-cover",
                hovered ? "opacity-0" : "opacity-90"
              )}
            />
            {hovered && (
              <video
                src={project.src}
                className={cx(
                  "absolute inset-0 h-full w-full",
                  portrait ? "object-contain" : "object-cover"
                )}
                muted
                loop
                autoPlay
                playsInline
                preload="none"
              />
            )}
          </span>

          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="shutter-slats" aria-hidden />

          <span className="absolute right-4 bottom-4 grid h-12 w-12 place-items-center rounded-full bg-black/55 opacity-0 backdrop-blur-md transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:opacity-100">
            <Play className="ml-0.5 h-4 w-4 text-white" fill="currentColor" />
          </span>
        </span>

        {/* ---- Card body ---------------------------------------------- */}
        <span className="block p-6">
          <span className="flex items-center justify-between gap-4">
            <span className="font-display text-[0.7rem] tracking-[0.28em] uppercase" style={{ color: project.accent }}>
              {project.client}
            </span>
            <span className="font-display text-[0.7rem] tracking-[0.18em] text-[var(--ink-ghost)]">
              {project.year}
            </span>
          </span>

          <span className="mt-3 block font-display text-[1.28rem] leading-snug font-semibold text-[var(--ink)]">
            {project.title}
          </span>

          <span className="mt-4 flex flex-wrap gap-2">
            {project.scope.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </span>

          <span className="mt-5 flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
            <SoftwareRow ids={project.tools} compact />
            <span className="inline-flex items-center gap-1.5 font-display text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[var(--ink-soft)] transition-colors group-hover:text-[var(--ink)]">
              Case study
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}

/* =====================================================================
   CASE STUDY OVERLAY
   ===================================================================== */
function CaseStudy({ project, onClose }) {
  const open = Boolean(project);
  const portrait = project?.aspect === PORTRAIT;
  const { play: sound } = useSfx();
  useScrollLock(open);

  const close = () => {
    sound("close");
    onClose();
  };
  useEscape(close, open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.client} case study`}
        >
          <button
            type="button"
            aria-label="Close case study"
            onClick={close}
            className="fixed inset-0 cursor-zoom-out bg-black/90 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ y: 60, opacity: 0, filter: "blur(18px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 40, opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.75, ease: EASE }}
            className="relative mx-auto my-10 w-[min(1080px,calc(100%-2rem))]"
          >
            <div className="glass-strong overflow-hidden rounded-3xl">
              <div
                className="relative grid place-items-center bg-black"
                style={{ maxHeight: "70svh", aspectRatio: portrait ? "16 / 10" : project.aspect }}
              >
                <img
                  src={project.poster}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl"
                />
                <video
                  src={project.src}
                  poster={project.poster}
                  className="relative h-full max-h-[70svh] w-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              </div>

              <div className="p-7 sm:p-10">
                <p
                  className="font-display text-[0.72rem] tracking-[0.3em] uppercase"
                  style={{ color: project.accent }}
                >
                  {project.client}
                </p>
                <h3 className="display mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-[var(--ink)]">
                  {project.title}
                </h3>
                <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
                  {project.intro}
                </p>

                <dl className="mt-9 grid gap-5 sm:grid-cols-2">
                  {project.details.map((d) => {
                    const Icon = d.icon;
                    return (
                      <div key={d.label} className="glass rounded-2xl p-5">
                        <dt className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" style={{ color: project.accent }} strokeWidth={2} />
                          <span className="eyebrow !text-[0.6rem]">{d.label}</span>
                        </dt>
                        <dd className="mt-2.5 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
                          {d.value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--glass-border)] pt-6">
                  <SoftwareRow ids={project.tools} />
                  <span className="ml-auto font-display text-[0.72rem] tracking-[0.2em] text-[var(--ink-ghost)]">
                    {project.runtime} · {project.year}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              onPointerEnter={() => sound("hover")}
              aria-label="Close case study"
              className="glass-strong sticky top-4 left-full grid h-11 w-11 place-items-center rounded-full text-[var(--ink)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:rotate-90"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Projects() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);
  const { play: sound } = useSfx();
  useSectionWhoosh(ref);

  const open = (p) => {
    sound("open");
    setActive(p);
  };

  return (
    <section id="projects" ref={ref} className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Case Studies"
          title="Projects, in detail"
          lead="The brief, the scope, and what actually shipped."
        />

        <div className="mt-14 grid gap-7 md:grid-cols-2">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onOpen={open} />
          ))}
        </div>
      </div>

      <CaseStudy project={active} onClose={() => setActive(null)} />
    </section>
  );
}
