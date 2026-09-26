import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { featured } from '../data/mock';

export default function HeroBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [index] = useState(0);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const imgX = useTransform(sx, [0, 1], [6, -6]);
  const imgY = useTransform(sy, [0, 1], [4, -4]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="group relative h-[clamp(300px,52vh,560px)] w-full overflow-hidden rounded-[18px] border border-white/[0.09] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* bg image with slow cinematic scale */}
        <AnimatePresence mode="popLayout">
          <motion.div key={index} className="absolute inset-0" style={{ x: imgX, y: imgY }}>
            <motion.img
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              src={featured.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = featured.fallback;
              }}
              alt="Forza Horizon"
              draggable={false}
              className="h-[112%] w-[112%] object-cover object-[50%_35%]"
            />
            {/* slow ambient zoom */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.045, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* gradients for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#0e0716]/60 to-transparent" />

        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-[26px] top-[46px] select-none"
        >
          <div className="flex items-center gap-1 opacity-90">
            <div className="h-[26px] w-[64px] bg-white/[0.92] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)] opacity-90" />
            <div className="h-[26px] w-[20px] bg-white/[0.92] [clip-path:polygon(20%_0,100%_0,80%_100%,0_100%)] opacity-90" />
          </div>
          <div className="mt-1.5 text-[clamp(36px,3.4vw,56px)] font-extrabold leading-[0.9] tracking-[0.08em] text-white/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
            FORZA
          </div>
          <div className="relative mt-[2px] inline-block">
            <span className="relative z-10 px-2 text-[clamp(22px,1.9vw,32px)] font-extrabold italic tracking-[0.06em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              HORIZON
            </span>
            <span className="absolute inset-0 -skew-x-[14deg] rounded-[4px] bg-gradient-to-r from-[#ff1a1a] via-[#ff2d55] to-[#ff2fb3] shadow-[0_6px_24px_rgba(255,45,85,0.5)]" />
          </div>
        </motion.div>

        {/* CTA pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="absolute bottom-[18px] right-[18px]"
        >
          <motion.button
            whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.25)' }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full border border-white/[0.14] bg-black/45 px-4 py-[7px] text-[12px] font-medium text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            {featured.cta}
          </motion.button>
        </motion.div>

        {/* subtle top highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/[0.06]" />
      </div>
    </motion.section>
  );
}
