import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Volume2, VolumeX, X } from "lucide-react";

import { NAV_LINKS } from "../lib/constants.js";
import { EASE, cx, scrollToId } from "../lib/utils.js";
import { useActiveSection, useScrollDirection } from "../hooks/useUi.js";
import { useSfx } from "../hooks/useSfx.js";

/* Pill-shaped floating glass bar. Hides on scroll down, returns on
   scroll up — the content is the priority, the chrome is on call. */
export function Navbar() {
  const { direction, atTop } = useScrollDirection();
  const ids = useMemo(() => NAV_LINKS.map((l) => l.id), []);
  const active = useActiveSection(ids);
  const { play, muted, toggleMuted } = useSfx();
  const [menuOpen, setMenuOpen] = useState(false);

  const hidden = direction === "down" && !atTop && !menuOpen;

  const go = (id) => {
    play("click");
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: hidden ? -110 : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass flex items-center gap-1 rounded-full py-2 pr-2 pl-5">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => go("hero")}
          onPointerEnter={() => play("hover")}
          className="font-display text-[0.9rem] font-extrabold tracking-[0.2em] text-[var(--ink)]"
        >
          PK
        </button>

        <span className="mx-2 hidden h-4 w-px bg-[var(--glass-border)] md:block" />

        {/* Links */}
        <ul className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  onPointerEnter={() => play("hover")}
                  className={cx(
                    "relative rounded-full px-4 py-2 text-[0.78rem] font-medium tracking-wide transition-colors duration-300",
                    isActive
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ duration: 0.5, ease: EASE }}
                      className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Sound toggle — always reachable, because the site makes noise. */}
        <button
          type="button"
          onClick={() => {
            toggleMuted();
          }}
          onPointerEnter={() => play("hover")}
          aria-label={muted ? "Unmute interface sound" : "Mute interface sound"}
          aria-pressed={!muted}
          className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--ink-soft)] transition-colors duration-300 hover:border-[var(--glass-border-lit)] hover:text-[var(--ink)]"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => {
            play("click");
            setMenuOpen((v) => !v);
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--ink)] md:hidden"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="glass-strong absolute top-[4.5rem] w-[min(22rem,calc(100vw-2rem))] rounded-3xl p-3 md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.id}
                type="button"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE }}
                onClick={() => go(link.id)}
                className={cx(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[0.95rem]",
                  active === link.id
                    ? "bg-white/[0.06] text-[var(--ink)]"
                    : "text-[var(--ink-soft)]"
                )}
              >
                {link.label}
                <span className="font-display text-[0.65rem] tracking-widest text-[var(--ink-ghost)]">
                  0{i + 1}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
