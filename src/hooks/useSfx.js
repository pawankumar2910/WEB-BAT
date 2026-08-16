import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { sfx } from "../lib/audio.js";

/* Browsers keep an AudioContext suspended until the page has been touched.
   One listener at the root resumes it on whatever the first gesture is. */
export function useAudioUnlock() {
  useEffect(() => {
    const unlock = () => sfx.unlock();
    const events = ["pointerdown", "keydown", "touchstart", "wheel"];
    events.forEach((e) =>
      window.addEventListener(e, unlock, { once: true, passive: true })
    );
    return () =>
      events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);
}

/**
 * play(name, opts) plus the mute flag, kept in sync across every component
 * that calls this hook via useSyncExternalStore.
 */
export function useSfx() {
  const muted = useSyncExternalStore(
    (cb) => sfx.subscribe(cb),
    () => sfx.isMuted(),
    () => false
  );

  const play = useCallback((name, opts) => sfx.play(name, opts), []);
  const toggleMuted = useCallback(() => sfx.toggle(), []);

  return { play, muted, toggleMuted };
}

/**
 * Spreadable props that give any element the standard tick-on-hover,
 * thud-on-press treatment. Existing handlers are composed, not replaced.
 *
 *   <button {...useSoundProps({ onClick: submit })}>Send</button>
 */
export function useSoundProps({ onPointerEnter, onClick, sound = "click", disabled } = {}) {
  const { play } = useSfx();

  const handleEnter = useCallback(
    (e) => {
      if (!disabled) play("hover");
      onPointerEnter?.(e);
    },
    [play, onPointerEnter, disabled]
  );

  const handleClick = useCallback(
    (e) => {
      if (!disabled) play(sound);
      onClick?.(e);
    },
    [play, onClick, sound, disabled]
  );

  return { onPointerEnter: handleEnter, onClick: handleClick };
}

/**
 * Fires a one-shot cinematic whoosh the first time an element scrolls into
 * view — the "major section transition" cue.
 */
export function useSectionWhoosh(ref, { threshold = 0.35 } = {}) {
  const fired = useRef(false);
  const { play } = useSfx();

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          play("whoosh");
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, play, threshold]);
}
