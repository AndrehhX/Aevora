import { motion } from 'framer-motion';

export default function LibraryEmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-[18px] border border-[rgba(217,198,234,0.10)] bg-[rgba(23,16,31,0.72)] p-8 text-center"
      aria-labelledby="library-empty-title"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BEA0D8]/55">Library / waiting for provider</span>
      <h1 id="library-empty-title" className="mt-3 text-[clamp(24px,3vw,40px)] font-extrabold tracking-[0.04em] text-[#F1EAF8]">
        Connect Steam to start
      </h1>
      <p className="mt-2 max-w-[430px] text-[13px] leading-relaxed text-[#D9C6EA]/65">
        Aevora no inventa juegos mientras no hay una cuenta conectada. Vincula Steam y tu biblioteca real aparecerá aquí.
      </p>
      <button
        type="button"
        onClick={onConnect}
        className="mt-5 rounded-full border border-[rgba(217,198,234,0.16)] bg-[rgba(130,99,161,0.28)] px-4 py-2 text-[12px] font-semibold text-[#F1EAF8] transition-colors hover:bg-[rgba(130,99,161,0.44)]"
      >
        Open settings
      </button>
    </motion.section>
  );
}
