import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Play } from "lucide-react";


import { SHOWCASE } from "../lib/constants.js";
import { cx, lerp } from "../lib/utils.js";
import { useSectionWhoosh, useSfx } from "../hooks/useSfx.js";
import { Chip, SectionHeading } from "./ui/Primitives.jsx";

/* =====================================================================
   ReelTile
   Every lane holds two copies of the list, so a naive <video> per tile
   meant 24 elements opening range requests against two multi-megabyte
   masters before the page had even painted. Each tile therefore shows a
   single decoded poster frame, and mounts a real <video> only while the
   pointer is on it. Network on load: two JPEGs.

   Tile height is fixed and the width follows `aspect`, which lets the
   landscape and vertical films sit in the same lane without either being
   cropped to a ribbon.
   ===================================================================== */
function ReelTile({ item, onOpen }) {
  const { play: sound } = useSfx();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      onPointerEnter={() => {
        sound("hover");
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      className="group relative block h-[clamp(11rem,19vw,16rem)] shrink-0 overflow-hidden rounded-2xl border border-[var(--glass-border)] text-left transition-[border-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-[var(--glass-border-lit)]"
      style={{ aspectRatio: item.aspect, boxShadow: `0 30px 70px -40px ${item.from}` }}
      aria-label={`Play ${item.title}`}
    >
      <span className="relative block h-full w-full overflow-hidden bg-[var(--canvas-3)]">
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}
        />

        <img
          src={item.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className={cx(
            "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-out-expo)]",
            hovered ? "scale-[1.09] opacity-0" : "scale-[1.02] opacity-100"
          )}
        />

        {hovered && (
          <video
            src={item.src}
            className="absolute inset-0 h-full w-full scale-[1.06] object-cover"
            muted
            loop
            autoPlay
            playsInline
            preload="none"
          />
        )}

        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="glass-strong grid h-14 w-14 place-items-center rounded-full">
            <Play className="ml-0.5 h-5 w-5 text-white" fill="currentColor" />
          </span>
        </span>

        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-display text-[0.62rem] tracking-widest text-white/80 backdrop-blur-sm">
          {item.runtime}
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="block truncate font-display text-[0.98rem] font-semibold text-white">
            {item.title}
          </span>
          <span className="mt-0.5 block truncate text-[0.74rem] text-white/55">
            {item.category} · {item.year}
          </span>
        </span>
        <Maximize2 className="h-4 w-4 shrink-0 text-white/45 transition-colors group-hover:text-white" />
      </span>
    </button>
  );
}

/**
 * One infinitely translating lane. The track holds the items twice; when
 * the offset passes the width of a single set it wraps by exactly that
 * width, so the seam never lands mid-tile.
 */
function useLaneTrack({ speed, direction = 1, factorRef }) {
  const trackRef = useRef(null);
  const offset = useRef(0);
  const current = useRef(speed);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(now - last, 48); /* clamp after a tab switch */
      last = now;

      /* Ease toward the target speed instead of hard-stopping on hover. */
      current.current = lerp(current.current, speed * factorRef.current, 0.07);
      offset.current += (current.current * dt) / 16.667;

      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          if (offset.current > half) offset.current -= half;
          if (offset.current < 0) offset.current += half;
          track.style.transform = `translate3d(${-offset.current * direction}px,0,0)`;
        }
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [speed, direction, factorRef]);

  return { trackRef };
}

function Lane({ items, speed, direction, factorRef, onOpen }) {
  const { trackRef } = useLaneTrack({ speed, direction, factorRef });
  const doubled = [...items, ...items];

  return (
    <div className="reel-mask overflow-hidden">
      <div ref={trackRef} className="reel-lane">
        {doubled.map((item, i) => (
          <ReelTile key={`${item.id}-${i}`} item={item} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export function WorkShowcase({ onOpen }) {
  const ref = useRef(null);
  /* Shared by every lane so one hover slows the whole plane together. */
  const factorRef = useRef(1);
  const [paused, setPaused] = useState(false);
  useSectionWhoosh(ref);

  const laneA = SHOWCASE;
  const laneB = [...SHOWCASE].reverse();

  const setPause = (v) => {
    factorRef.current = v ? 0 : 1;
    setPaused(v);
  };

  return (
    <section id="work" ref={ref} className="section overflow-hidden">
      <div className="shell">
        <SectionHeading
          eyebrow="The Reel"
          title="Selected work"
          lead="Two lanes, always moving. Hover to hold them still, click any frame to take it fullscreen."
        />
      </div>

      <div
        className="relative mt-14"
        onPointerEnter={() => setPause(true)}
        onPointerLeave={() => setPause(false)}
      >
        <div className="reel-plane space-y-5">
          <Lane items={laneA} speed={0.62} direction={1} factorRef={factorRef} onOpen={onOpen} />
          <Lane items={laneB} speed={0.46} direction={-1} factorRef={factorRef} onOpen={onOpen} />
        </div>

        {/* Vignette so the rotated plane fades out instead of being cut. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 78% at 50% 50%, transparent 42%, var(--canvas) 92%)",
          }}
        />

        <motion.div
          animate={{ opacity: paused ? 1 : 0, y: paused ? 0 : 8 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <Chip>Reel paused</Chip>
        </motion.div>
      </div>
    </section>
  );
}
