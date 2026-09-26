import { motion } from 'framer-motion';

export default function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex h-[26px] w-[48px] items-center rounded-full border border-[rgba(217,198,234,0.10)] bg-black/40 px-1 backdrop-blur-md transition-colors hover:border-[rgba(217,198,234,0.20)]"
      aria-label="theme toggle"
    >
      <span className="absolute left-1.5 text-[12px] leading-none">{dark ? '🌙' : '☀️'}</span>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`relative z-10 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-[#654A7F] to-[#17101F] text-[11px] shadow ${dark ? 'ml-auto' : 'ml-0'}`}
        whileTap={{ scale: 0.88 }}
      >
        {dark ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
}
