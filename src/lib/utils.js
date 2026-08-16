export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Framer Motion's expo-out. Used everywhere so timing feels like one hand. */
export const EASE = [0.16, 1, 0.3, 1];

/** GSAP's name for the same curve. */
export const GSAP_EASE = "expo.out";

export const cx = (...parts) => parts.filter(Boolean).join(" ");

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
