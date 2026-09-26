import type { ReactNode } from 'react';

// CSS-only delayed tooltip for icon-only controls.
export default function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[110] -translate-x-1/2 translate-y-[-2px] whitespace-nowrap rounded-[8px] border border-[rgba(217,198,234,0.14)] bg-[rgba(23,16,31,0.95)] px-2 py-1 text-[10px] font-medium text-[#D9C6EA]/90 opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all delay-[450ms] duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
