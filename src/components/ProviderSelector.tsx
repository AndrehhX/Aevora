import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import type { GameProviderEntry } from '../domain/provider';
import { providerName } from '../domain/provider';
import { DURATION, EASE } from '../motion/presets';
import Modal from './Modal';
import ProviderBadge from './ProviderBadge';

// Compact provider chooser for PLAY/INSTALL with multiple candidates.
// Keyboard: Tab through options, Enter/Space selects, Escape closes.
export default function ProviderSelector({
  game,
  mode,
  open,
  onPick,
  onClose,
}: {
  game: UnifiedGame | null;
  mode: 'play' | 'install';
  open: boolean;
  onPick: (entry: GameProviderEntry, remember: boolean) => void;
  onClose: () => void;
}) {
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (open) setRemember(true);
  }, [open, game?.id]);

  if (!game) return null;
  const options = game.providers.filter((p) => (mode === 'play' ? p.installed : p.owned));

  return (
    <Modal open={open} onClose={onClose} labelledBy="provider-selector-title" panelClass="max-w-[340px]">
      <div className="p-5">
        <h2 id="provider-selector-title" className="pr-6 text-[14px] font-bold text-[#F1EAF8]">
          {mode === 'play' ? `Play ${game.title}` : `Install ${game.title}`}
        </h2>
        <p className="mt-1 text-[11.5px] text-[#BEA0D8]/65">
          {mode === 'play' ? 'Choose platform — installed in multiple places.' : 'Choose where to install from.'}
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {options.map((p, i) => (
            <motion.button
              key={p.provider}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.12), duration: DURATION.fast, ease: EASE.out }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onPick(p, remember)}
              className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[rgba(217,198,234,0.12)] bg-[rgba(74,53,96,0.20)] px-3 py-2.5 text-left transition-colors hover:border-[rgba(190,160,216,0.4)] hover:bg-[rgba(74,53,96,0.36)]"
            >
              <span className="text-[13px] font-semibold text-[#F1EAF8]">{providerName(p.provider)}</span>
              <ProviderBadge provider={p.provider} tone="faint" />
            </motion.button>
          ))}
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11.5px] text-[#D9C6EA]/75">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#8263A1]"
          />
          Remember my choice
        </label>
      </div>
    </Modal>
  );
}
