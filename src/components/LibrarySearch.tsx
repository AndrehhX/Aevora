import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibrarySearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="flex items-center gap-2 rounded-[10px] border border-white/[0.09] bg-white/[0.04] px-2.5 py-[7px] backdrop-blur-md transition-all duration-200 focus-within:border-[#b565ff]/50 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_18px_rgba(181,101,255,0.25)]">
        <span className="text-[11px] font-medium tracking-wide text-white/70 group-focus-within:text-white/90 select-none">
          Search Library
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[11px] text-white placeholder-white/30 outline-none"
          placeholder=""
        />
        <Search size={13} className="shrink-0 text-white/40 transition-colors group-focus-within:text-[#c084fc]" />
      </div>
    </motion.div>
  );
}
