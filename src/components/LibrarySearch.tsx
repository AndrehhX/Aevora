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
      data-testid="aevora-layout-library-search"
      className="group relative min-w-0 w-full"
    >
      <div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.18)] px-2.5 py-[7px] backdrop-blur-md transition-all duration-200 focus-within:border-[rgba(160,124,193,0.55)] focus-within:bg-[rgba(74,53,96,0.28)] focus-within:shadow-[0_0_18px_rgba(190,160,216,0.22)]">
        <span className="shrink-0 text-[11px] font-medium tracking-wide text-[#D9C6EA]/70 group-focus-within:text-[#F1EAF8]/90 select-none">
          Search Library
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onChange('');
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label="Search library"
          className="w-full bg-transparent text-[11px] text-[#F1EAF8] placeholder-[#BEA0D8]/30 outline-none"
          placeholder=""
        />
        <Search size={13} className="shrink-0 text-[#BEA0D8]/40 transition-colors group-focus-within:text-[#A07CC1]" />
      </div>
    </motion.div>
  );
}
