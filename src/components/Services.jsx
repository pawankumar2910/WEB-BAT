import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";

import { SERVICES } from "../lib/constants.js";
import { EASE, cx } from "../lib/utils.js";
import { useSectionWhoosh, useSfx } from "../hooks/useSfx.js";
import { Chip, Reveal, SectionHeading, SoftwareRow, Stagger } from "./ui/Primitives.jsx";

/* A small extruded tile behind each service icon — the "3D-styled icon"
   without shipping a 3D renderer for six glyphs. Two stacked, offset,
   rotated faces plus a coloured rim read as depth at this size. */
function IconSolid({ icon: Icon, accent, active }) {
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center">
      {/* Extruded back face. */}
      <span
        aria-hidden
        className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-[5px] group-hover:translate-y-[5px]"
        style={{ background: `${accent}22` }}
      />
      {/* Front face. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl border transition-colors duration-500"
        style={{
          borderColor: active ? `${accent}88` : `${accent}3a`,
          background: `linear-gradient(140deg, ${accent}26, transparent 70%)`,
          boxShadow: active ? `0 0 26px -6px ${accent}` : `0 0 18px -10px ${accent}`,
        }}
      />
      <Icon
        className="relative h-5 w-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110"
        style={{ color: accent }}
        strokeWidth={1.9}
      />
    </span>
  );
}

function ServiceRow({ service, index, open, onToggle }) {
  const { play } = useSfx();
  const Icon = service.icon;

  return (
    <Stagger.Item>
      <div
        className={cx(
          "glass glass-lit group overflow-hidden rounded-3xl transition-colors duration-500",
          open && "border-[var(--glass-border-lit)]"
        )}
        style={open ? { boxShadow: `0 40px 90px -50px ${service.accent}` } : undefined}
      >
        {/* ---- Header row (always visible) ------------------------------ */}
        <button
          type="button"
          onClick={onToggle}
          onPointerEnter={() => play("hover")}
          aria-expanded={open}
          aria-controls={`svc-panel-${service.id}`}
          className="flex w-full items-center gap-5 px-5 py-5 text-left sm:px-7 sm:py-6"
        >
          <span className="font-display text-[0.7rem] tracking-[0.2em] text-[var(--ink-ghost)] tabular-nums">
            0{index + 1}
          </span>

          <IconSolid icon={Icon} accent={service.accent} active={open} />

          <span className="min-w-0 flex-1">
            <span className="block font-display text-[1.02rem] leading-snug font-semibold text-[var(--ink)] sm:text-[1.18rem]">
              {service.title}
            </span>
            <span className="mt-1.5 block text-[0.86rem] leading-relaxed text-[var(--ink-faint)]">
              {service.blurb}
            </span>
          </span>

          <SoftwareRow ids={service.tools} compact className="hidden lg:flex" />

          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)]"
            style={{
              borderColor: open ? `${service.accent}77` : "var(--glass-border)",
              background: open ? `${service.accent}18` : "transparent",
              transform: open ? "rotate(180deg)" : "none",
            }}
          >
            {open ? (
              <Minus className="h-4 w-4" style={{ color: service.accent }} />
            ) : (
              <Plus className="h-4 w-4 text-[var(--ink-soft)]" />
            )}
          </span>
        </button>

        {/* ---- Expanding detail panel ----------------------------------- */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`svc-panel-${service.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.6, ease: EASE },
                opacity: { duration: 0.4, ease: EASE },
              }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--glass-border)] px-5 pt-6 pb-7 sm:px-7">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                  {/* Deliverables */}
                  <div>
                    <p className="eyebrow">What you get</p>
                    <ul className="mt-4 space-y-2.5">
                      {service.deliverables.map((d, i) => (
                        <motion.li
                          key={d}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: EASE }}
                          className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: service.accent }}
                            strokeWidth={2.4}
                          />
                          {d}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Process */}
                  <div>
                    <p className="eyebrow">Process</p>
                    <ol className="mt-4 space-y-3.5">
                      {service.workflow.map((w, i) => (
                        <motion.li
                          key={w.step}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * i + 0.16, duration: 0.5, ease: EASE }}
                          className="relative border-l pl-5"
                          style={{ borderColor: `${service.accent}30` }}
                        >
                          <span
                            className="absolute top-1.5 -left-[4.5px] h-2 w-2 rounded-full"
                            style={{ background: service.accent }}
                          />
                          <span className="block font-display text-[0.82rem] font-semibold tracking-wide text-[var(--ink)]">
                            {w.step}
                          </span>
                          <span className="mt-1 block text-[0.84rem] leading-relaxed text-[var(--ink-faint)]">
                            {w.detail}
                          </span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[var(--glass-border)] pt-5">
                  <Chip accent={service.accent}>Turnaround · {service.turnaround}</Chip>
                  <SoftwareRow ids={service.tools} compact className="lg:hidden" />
                  <a
                    href="#contact"
                    onPointerEnter={() => play("hover")}
                    onClick={() => play("click")}
                    className="ml-auto inline-flex items-center gap-1.5 font-display text-[0.76rem] font-semibold tracking-[0.14em] uppercase text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Start a brief
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stagger.Item>
  );
}

export function Services() {
  const ref = useRef(null);
  const [openId, setOpenId] = useState(null);
  const { play } = useSfx();
  useSectionWhoosh(ref);

  const toggle = (id) => {
    const next = openId === id ? null : id;
    play(next ? "open" : "close");
    setOpenId(next);
  };

  return (
    <section id="services" ref={ref} className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Services"
          title="What I build"
          lead="Four disciplines, one pipeline. Pick the one that matches your brief — each opens with the exact deliverables and the process behind them."
        />

        <Stagger className="mt-14 space-y-4" gap={0.1}>
          {SERVICES.map((service, i) => (
            <ServiceRow
              key={service.id}
              service={service}
              index={i}
              open={openId === service.id}
              onToggle={() => toggle(service.id)}
            />
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-[0.82rem] text-[var(--ink-faint)]">
            Not sure which one? Describe the outcome and I&rsquo;ll scope it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
