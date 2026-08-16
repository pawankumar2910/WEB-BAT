import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** "up" | "down" — drives the auto-hiding navbar. */
export function useScrollDirection({ threshold = 8, topOffset = 90 } = {}) {
  const [direction, setDirection] = useState("up");
  const [atTop, setAtTop] = useState(true);
  const last = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    last.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      setAtTop(y < topOffset);
      if (Math.abs(y - last.current) >= threshold) {
        setDirection(y > last.current && y > topOffset ? "down" : "up");
        last.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topOffset]);

  return { direction, atTop };
}

/** id of the section currently filling the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!els.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/** Freeze the page behind an overlay without the layout shifting. */
export function useScrollLock(active) {
  useLayoutEffect(() => {
    if (!active) return undefined;

    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [active]);
}

/** true once the element has entered the viewport (fires once). */
export function useInView(ref, { threshold = 0.25, once = true } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, once]);

  return inView;
}

/** Escape-to-close for overlays. */
export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, active]);
}
