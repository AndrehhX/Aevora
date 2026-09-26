import { motion } from 'framer-motion';
import Modal from './Modal';
import Toggle from './Toggle';
import { DEFAULT_STATE, type PersistedPrefs as Prefs } from '../domain/storage';

export const DEFAULT_PREFS = DEFAULT_STATE.prefs;
export type { PersistedPrefs as Prefs } from '../domain/storage';

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-[#F1EAF8]/90">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] leading-snug text-[#BEA0D8]/55">{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">{title}</div>
      <div className="divide-y divide-[rgba(217,198,234,0.07)]">{children}</div>
    </div>
  );
}

export default function SettingsPanel({
  open,
  prefs,
  onChange,
  onClose,
}: {
  open: boolean;
  prefs: Prefs;
  onChange: (p: Prefs) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => onChange({ ...prefs, [k]: v });

  return (
    <Modal open={open} onClose={onClose} labelledBy="settings-title" panelClass="max-w-[440px]">
      <div className="no-scrollbar max-h-[86vh] overflow-y-auto p-5">
        <h2 id="settings-title" className="pr-6 text-[16px] font-bold text-[#F1EAF8]">
          Settings
        </h2>

        <Section title="General">
          <Row label="Start on Home" hint="Always open the launcher on the Home section." control={<Toggle checked={prefs.startOnHome} onChange={(v) => set('startOnHome', v)} label="Start on Home" />} />
          <Row label="Remember last game" hint="Restore the previously selected game on launch." control={<Toggle checked={prefs.rememberGame} onChange={(v) => set('rememberGame', v)} label="Remember last selected game" />} />
        </Section>

        <Section title="Appearance">
          <Row
            label="Theme"
            hint={prefs.theme === 'aevora' ? 'Aevora lavender identity.' : 'Deeper midnight variant.'}
            control={
              <div className="flex shrink-0 gap-1 rounded-full border border-[rgba(217,198,234,0.12)] bg-black/30 p-1">
                {(['aevora', 'midnight'] as const).map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => set('theme', t)}
                    aria-pressed={prefs.theme === t}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                      prefs.theme === t ? 'bg-[rgba(130,99,161,0.5)] text-[#F1EAF8]' : 'text-[#BEA0D8]/60 hover:text-[#D9C6EA]'
                    }`}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            }
          />
          <Row label="Custom cursor" hint="Use the Aevora pointer. Off restores the system cursor." control={<Toggle checked={prefs.cursor} onChange={(v) => set('cursor', v)} label="Custom cursor" />} />
          <Row label="Reduce motion" hint="Minimize parallax and large transitions." control={<Toggle checked={prefs.reduceMotion} onChange={(v) => set('reduceMotion', v)} label="Reduce motion" />} />
        </Section>

        <Section title="Behavior">
          <Row label="Hero parallax" hint="Subtle artwork movement following the cursor." control={<Toggle checked={prefs.parallax} onChange={(v) => set('parallax', v)} label="Hero parallax" />} />
          <Row label="Carousel inertia" hint="Momentum glide after dragging the carousel." control={<Toggle checked={prefs.inertia} onChange={(v) => set('inertia', v)} label="Carousel inertia" />} />
        </Section>
      </div>
    </Modal>
  );
}
