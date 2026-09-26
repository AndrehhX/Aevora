import { motion } from 'framer-motion';

// Aevora settings switch. Always keyboard accessible (native button).
export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[20px] w-[36px] shrink-0 rounded-full border transition-colors duration-200 ${
        checked ? 'border-[rgba(190,160,216,0.5)] bg-[rgba(130,99,161,0.55)]' : 'border-[rgba(217,198,234,0.14)] bg-[rgba(74,53,96,0.30)]'
      }`}
    >
      <motion.span
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 550, damping: 34 }}
        className="absolute left-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-[#F1EAF8] shadow"
      />
    </button>
  );
}
