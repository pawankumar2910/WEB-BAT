import { useCallback, useEffect, useRef, useState } from "react";

import { lerp } from "../lib/utils.js";

/* =====================================================================
   CURSOR REVEAL MASK
   ---------------------------------------------------------------------
   Two pixel-aligned images are stacked: the bare face underneath, the
   cowl on top. The cowl carries a radial-gradient mask whose centre is
   TRANSPARENT — a soft-edged hole punched through it — so whatever the
   hole passes over shows the face beneath.

       mask-image: radial-gradient(
         circle var(--mr) at var(--mx) var(--my),
         transparent 0%,          <- hole
         transparent 52%,         <- hard-ish core
         #000 100%                <- feathered back to opaque cowl
       );

   Radius drives the whole effect: it springs 0 -> R on enter and R -> 0
   on leave, so the mask "closes up" instead of snapping off. At radius 0
   the gradient collapses to its last stop (opaque), leaving a clean cowl.

   Position and radius are written straight to the element's inline style
   as CSS custom properties from inside a rAF loop. Nothing here touches
   React state per frame — a 120Hz pointer would otherwise cause 120
   re-renders a second. The only state is the boolean used for UI hints.
   ===================================================================== */

export function useRevealMask({
  radius = 240,
  /* How fast the mask chases the cursor. 1 = instant, lower = laggier. */
  ease = 0.18,
  /* Radius open/close speed, kept slower than tracking so it reads as a
     deliberate iris rather than a pop. */
  radiusEase = 0.12,
  enabled = true,
} = {}) {
  const containerRef = useRef(null);
  const maskRef = useRef(null);
  const [isRevealing, setIsRevealing] = useState(false);

  /* Everything the loop mutates lives in one ref so the effect below has a
     stable dependency list and never re-subscribes mid-animation. */
  const state = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    r: 0,
    tr: 0,
    raf: 0,
    running: false,
    primed: false,
  });

  /* The custom properties are written to the STAGE, not the cowl, so the
     halo ring and any other decoration inside can inherit the same
     coordinates instead of each keeping its own copy. */
  const write = useCallback(() => {
    const el = containerRef.current;
    const s = state.current;
    if (!el) return;
    el.style.setProperty("--mx", `${s.x.toFixed(1)}px`);
    el.style.setProperty("--my", `${s.y.toFixed(1)}px`);
    el.style.setProperty("--mr", `${s.r.toFixed(1)}px`);
  }, []);

  const tick = useCallback(() => {
    const s = state.current;

    s.x = lerp(s.x, s.tx, ease);
    s.y = lerp(s.y, s.ty, ease);
    s.r = lerp(s.r, s.tr, radiusEase);

    write();

    const settled =
      Math.abs(s.r - s.tr) < 0.4 &&
      Math.abs(s.x - s.tx) < 0.4 &&
      Math.abs(s.y - s.ty) < 0.4;

    if (settled && s.tr === 0) {
      /* Fully closed and caught up — park the loop until the next enter. */
      s.r = 0;
      write();
      s.running = false;
      return;
    }
    s.raf = requestAnimationFrame(tick);
  }, [ease, radiusEase, write]);

  const start = useCallback(() => {
    const s = state.current;
    if (s.running) return;
    s.running = true;
    s.raf = requestAnimationFrame(tick);
  }, [tick]);

  const point = useCallback(
    (clientX, clientY) => {
      const el = containerRef.current;
      const s = state.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      s.tx = clientX - rect.left;
      s.ty = clientY - rect.top;

      /* First contact: drop the mask centre exactly under the cursor so the
         iris opens where the pointer is instead of sliding in from 0,0. */
      if (!s.primed) {
        s.x = s.tx;
        s.y = s.ty;
        s.primed = true;
      }
    },
    []
  );

  const open = useCallback(() => {
    state.current.tr = radius;
    setIsRevealing(true);
    start();
  }, [radius, start]);

  const close = useCallback(() => {
    state.current.tr = 0;
    setIsRevealing(false);
    start();
  }, [start]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return undefined;

    const onEnter = (e) => {
      point(e.clientX, e.clientY);
      open();
    };
    const onMove = (e) => {
      point(e.clientX, e.clientY);
      /* A pointer can enter while the tab is backgrounded and miss the
         enter event; keep the loop honest. */
      if (!state.current.running) start();
    };
    const onLeave = () => close();

    /* Touch: there is no hover, so a drag across the portrait becomes the
       reveal gesture. Without this the cowl is simply static on mobile. */
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      point(t.clientX, t.clientY);
      if (state.current.tr === 0) open();
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onLeave);
      cancelAnimationFrame(state.current.raf);
      state.current.running = false;
    };
  }, [enabled, open, close, point, start]);

  /* Paint the closed state once on mount so the custom properties always
     resolve, even before the first pointer event. */
  useEffect(() => {
    write();
  }, [write]);

  return { containerRef, maskRef, isRevealing };
}
