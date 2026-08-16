import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";

import { EASE, cx, formatTime } from "../lib/utils.js";
import { PORTRAIT } from "../lib/constants.js";
import { useEscape, useScrollLock } from "../hooks/useUi.js";
import { useSfx } from "../hooks/useSfx.js";
import { Chip, SoftwareRow } from "./ui/Primitives.jsx";

/* =====================================================================
   CINEMA PLAYER
   The rest of the site is dimmed behind a near-opaque scrim; the film
   scales up into the middle of the screen. Scrolling — the natural "I'm
   done here" gesture — scales it back down and closes it.
   ===================================================================== */
export function CinemaPlayer({ item, onClose }) {
  const videoRef = useRef(null);
  const { play: sound } = useSfx();

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const open = Boolean(item);
  const portrait = item?.aspect === PORTRAIT;
  useScrollLock(open);

  const close = useCallback(() => {
    sound("close");
    onClose();
  }, [onClose, sound]);

  useEscape(close, open);

  /* Any deliberate scroll closes the player. A small threshold keeps a
     trackpad's inertial tail from firing it twice. */
  useEffect(() => {
    if (!open) return undefined;
    let armed = false;
    /* Arm after the open animation so the wheel event that may still be
       in flight from the click doesn't immediately dismiss. */
    const t = setTimeout(() => {
      armed = true;
    }, 450);

    const onWheel = (e) => {
      if (armed && Math.abs(e.deltaY) > 18) close();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("wheel", onWheel);
    };
  }, [open, close]);

  /* Reset transport state whenever a different film is loaded. */
  useEffect(() => {
    if (!open) return;
    setPlaying(true);
    setTime(0);
    setDuration(0);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => setPlaying(false));
    }
  }, [item?.id, open]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    sound("click");
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seek = (value) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(duration)) return;
    v.currentTime = value;
    setTime(value);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — ${item.category}`}
        >
          {/* Scrim — this is the "dims the rest of the site" layer. */}
          <motion.button
            type="button"
            aria-label="Close player"
            onClick={close}
            className="absolute inset-0 cursor-zoom-out bg-black/88 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ scale: 0.86, y: 40, opacity: 0, filter: "blur(16px)" }}
            animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.9, y: 24, opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className={cx(
              "relative",
              /* A vertical film in a 16:9 shell is two thirds black bars, so
                 the shell takes the film's own shape and is capped by height
                 instead of width. */
              portrait ? "w-[min(440px,100%)]" : "w-[min(1180px,100%)]"
            )}
          >
            <div
              className="glass-strong overflow-hidden rounded-3xl"
              style={{ boxShadow: `0 60px 140px -50px ${item.from}` }}
            >
              <div
                className="relative bg-black"
                style={{
                  aspectRatio: item.aspect,
                  maxHeight: portrait ? "68svh" : undefined,
                }}
              >
                {/* Blurred fill behind the frame so the letterbox reads as
                    depth rather than dead space. */}
                <img
                  src={item.poster}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                />
                <video
                  ref={videoRef}
                  src={item.src}
                  poster={item.poster}
                  className="relative h-full w-full object-contain"
                  playsInline
                  autoPlay
                  muted={muted}
                  onClick={togglePlay}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setPlaying(false)}
                />

                {/* Centre play affordance when paused. */}
                <AnimatePresence>
                  {!playing && (
                    <motion.button
                      type="button"
                      onClick={togglePlay}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="absolute inset-0 grid place-items-center bg-black/30"
                      aria-label="Play"
                    >
                      <span className="glass-strong grid h-20 w-20 place-items-center rounded-full">
                        <Play className="ml-1 h-7 w-7 text-white" fill="currentColor" />
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Transport */}
              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  onPointerEnter={() => sound("hover")}
                  aria-label={playing ? "Pause" : "Play"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--ink)] transition-colors hover:border-[var(--glass-border-lit)]"
                >
                  {playing ? (
                    <Pause className="h-4 w-4" fill="currentColor" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  )}
                </button>

                <span className="font-display text-[0.74rem] tabular-nums text-[var(--ink-faint)]">
                  {formatTime(time)} / {formatTime(duration)}
                </span>

                <input
                  type="range"
                  className="scrubber min-w-[8rem] flex-1"
                  min={0}
                  max={duration || 0}
                  step={0.01}
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek"
                  style={{
                    background: `linear-gradient(to right, ${item.from} ${
                      duration ? (time / duration) * 100 : 0
                    }%, rgb(255 255 255 / 0.16) 0%)`,
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    sound("click");
                    setMuted((m) => !m);
                  }}
                  onPointerEnter={() => sound("hover")}
                  aria-label={muted ? "Unmute film" : "Mute film"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[var(--glass-border)] px-5 py-4">
                <div className="mr-auto">
                  <h3 className="display text-[1.4rem] text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-1 text-[0.8rem] text-[var(--ink-faint)]">
                    {item.category} · {item.year} · {item.runtime}
                  </p>
                </div>
                <SoftwareRow ids={item.tools} compact />
                {item.tags?.slice(0, 3).map((t) => (
                  <Chip key={t} accent={item.from}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              onPointerEnter={() => sound("hover")}
              aria-label="Close player"
              className="glass-strong absolute -top-3 -right-3 grid h-11 w-11 place-items-center rounded-full text-[var(--ink)] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:rotate-90"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <p className="mt-4 text-center text-[0.7rem] tracking-[0.2em] uppercase text-[var(--ink-ghost)]">
              Scroll or press Esc to exit
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
