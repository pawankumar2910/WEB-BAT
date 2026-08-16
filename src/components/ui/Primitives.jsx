import React from "react";
import { motion } from "framer-motion";

import { EASE, cx } from "../../lib/utils.js";
import { SOFTWARE } from "../../lib/constants.js";
import { useSoundProps } from "../../hooks/useSfx.js";

/* =====================================================================
   Reveal — the default scroll entrance.
   Nothing in this site simply appears; everything eases up and in.
   ===================================================================== */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  blur = true,
  once = true,
  className = "",
  as: Tag = motion.div,
}) {
  return (
    <Tag
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.95, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Children reveal one after another. Pair with <Stagger.Item>. */
export function Stagger({ children, className = "", delay = 0, gap = 0.08 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

Stagger.Item = function StaggerItem({ children, className = "", y = 26 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.85, ease: EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* =====================================================================
   SectionHeading
   ===================================================================== */
export function SectionHeading({ eyebrow, title, lead, align = "left", className = "" }) {
  const centered = align === "center";
  return (
    <div
      className={cx(
        "max-w-3xl",
        centered && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <div className={cx("flex items-center gap-3", centered && "justify-center")}>
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--ink-ghost)]" />
            <span className="eyebrow">{eyebrow}</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--ink-ghost)]" />
          </div>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="display mt-5 text-[clamp(2.1rem,5.4vw,3.9rem)] text-[var(--ink)]">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* =====================================================================
   Buttons
   Both play the standard tick-on-hover / thud-on-press pair.
   ===================================================================== */
export const GlowButton = React.forwardRef(function GlowButton(
  {
    as: Tag = "button",
    children,
    icon: Icon,
    onClick,
    onPointerEnter,
    className = "",
    sound = "click",
    ...rest
  },
  ref
) {
  const sfxProps = useSoundProps({ onClick, onPointerEnter, sound });

  return (
    <Tag
      ref={ref}
      {...sfxProps}
      {...rest}
      className={cx(
        "group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full",
        "px-6 py-3 font-display text-[0.82rem] font-semibold tracking-[0.14em] uppercase",
        "text-white transition-transform duration-500 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      style={{
        background:
          "linear-gradient(110deg, rgb(139 92 246 / 0.95), rgb(109 92 246 / 0.85) 48%, rgb(34 211 238 / 0.8))",
        boxShadow: "0 18px 50px -22px rgb(139 92 246 / 0.95)",
      }}
    >
      {/* Sheen sweep on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/28 to-transparent transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:translate-x-full"
      />
      <span className="relative">{children}</span>
      {Icon && (
        <Icon
          className="relative h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
          strokeWidth={2.2}
        />
      )}
    </Tag>
  );
});

export const GhostButton = React.forwardRef(function GhostButton(
  { as: Tag = "button", children, icon: Icon, onClick, onPointerEnter, className = "", ...rest },
  ref
) {
  const sfxProps = useSoundProps({ onClick, onPointerEnter });

  return (
    <Tag
      ref={ref}
      {...sfxProps}
      {...rest}
      className={cx(
        "glass glass-lit group inline-flex items-center gap-2.5 rounded-full px-6 py-3",
        "font-display text-[0.82rem] font-semibold tracking-[0.14em] uppercase",
        "text-[var(--ink)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5",
        className
      )}
    >
      {children}
      {Icon && (
        <Icon
          className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
          strokeWidth={2.2}
        />
      )}
    </Tag>
  );
});

/* =====================================================================
   SoftwareBadge — Adobe-style monogram tile, no brand SVGs needed.
   ===================================================================== */
export function SoftwareBadge({ id, compact = false }) {
  const tool = SOFTWARE[id];
  if (!tool) return null;

  return (
    <span
      title={tool.name}
      className={cx(
        "inline-grid place-items-center rounded-[7px] border font-display font-bold",
        compact ? "h-6 w-6 text-[0.6rem]" : "h-8 w-8 text-[0.72rem]"
      )}
      style={{
        color: tool.color,
        borderColor: `${tool.color}44`,
        background: `${tool.color}12`,
        boxShadow: `0 0 18px -8px ${tool.color}`,
      }}
    >
      {tool.short}
    </span>
  );
}

export function SoftwareRow({ ids = [], compact = false, className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-1.5", className)}>
      {ids.map((id) => (
        <SoftwareBadge key={id} id={id} compact={compact} />
      ))}
    </div>
  );
}

/** Small pill used for tags and scope chips. */
export function Chip({ children, accent, className = "" }) {
  return (
    <span
      className={cx(
        "rounded-full border px-3 py-1 text-[0.68rem] font-medium tracking-[0.08em] uppercase",
        className
      )}
      style={{
        color: accent ? `${accent}` : "var(--ink-soft)",
        borderColor: accent ? `${accent}38` : "var(--glass-border)",
        background: accent ? `${accent}0f` : "var(--glass-bg)",
      }}
    >
      {children}
    </span>
  );
}
