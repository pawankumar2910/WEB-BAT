import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function FloatingElements() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[10%] w-24 h-24 rounded-2xl glass-strong shadow-2xl border border-white/10 flex items-center justify-center opacity-80"
      >
        <div className="text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">🎬</div>
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        animate={{ y: [0, 25, 0], rotate: [0, -15, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[60%] right-[12%] w-28 h-28 rounded-full glass-strong shadow-[0_0_40px_rgba(139,92,246,0.3)] border border-purple-500/30 flex items-center justify-center opacity-80"
      >
        <div className="text-4xl drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">✨</div>
      </motion.div>
      <motion.div
        style={{ y: y3 }}
        animate={{ y: [0, -15, 0], rotate: [45, 50, 40, 45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[25%] left-[20%] w-20 h-20 glass shadow-[0_0_50px_rgba(34,211,238,0.3)] border border-cyan-500/30 flex items-center justify-center opacity-80"
      >
        <div className="text-3xl -rotate-45 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">🧊</div>
      </motion.div>
    </div>
  );
}
