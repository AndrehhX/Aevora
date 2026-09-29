import type { CommunityItem } from '../data/mock';
import Modal from './Modal';
import { SmartImage } from './SmartImage';

export default function CommunityPreview({
  item,
  open,
  onClose,
}: {
  item: CommunityItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;
  return (
    <Modal open={open} onClose={onClose} labelledBy="community-title" panelClass="max-w-[420px]">
      <div className="relative h-[150px] w-full overflow-hidden">
        <SmartImage src={item.thumb} fallback={item.fallback} alt={item.headline} className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(23,16,31,0.95)] via-[rgba(23,16,31,0.25)] to-transparent" />
      </div>
      <div className="p-5 pt-3">
        <div className="flex items-center gap-2 text-[10.5px] font-medium text-[#BEA0D8]/60">
          <span className="rounded-full border border-[rgba(217,198,234,0.14)] px-2 py-0.5">{item.source}</span>
          <span>{item.time}</span>
        </div>
        <h2 id="community-title" className="mt-2 pr-4 text-[16px] font-bold leading-snug text-[#F1EAF8]">
          {item.headline}
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[#D9C6EA]/80">{item.excerpt}</p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full border border-[rgba(217,198,234,0.16)] px-3 py-1.5 text-[11px] font-semibold text-[#F1EAF8]/85 transition-colors hover:border-[rgba(190,160,216,0.45)] hover:bg-[rgba(130,99,161,0.22)]"
          >
            Open source
          </a>
        )}
      </div>
    </Modal>
  );
}
