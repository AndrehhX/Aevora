import { motion } from 'framer-motion';
import { ArrowLeft, Check, LockKeyhole, Palette, ShoppingBag, Sparkles } from 'lucide-react';
import type { ProfileItem, ProfileState } from '../domain/profile';

export default function ProfileStoreView({
  profile,
  items,
  onPurchase,
  onEquip,
  onBack,
}: {
  profile: ProfileState;
  items: ProfileItem[];
  onPurchase: (itemId: string) => void;
  onEquip: (itemId: string) => void;
  onBack: () => void;
}) {
  return (
    <motion.div data-profile-store initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex min-h-full flex-col gap-4 pb-2">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-[20px] border border-[rgba(217,198,234,0.13)] bg-[rgba(23,16,31,0.64)] p-5 backdrop-blur-xl">
        <div><button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BEA0D8]/70 transition-colors hover:text-[#F1EAF8]"><ArrowLeft size={12} /> Back to profile</button><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BEA0D8]/65"><ShoppingBag size={13} /> Aevora collection</div><h1 className="mt-1 text-[clamp(24px,3vw,38px)] font-extrabold tracking-[-0.03em] text-[#F1EAF8]">Aevora Shop</h1><p className="mt-1 max-w-[560px] text-[12px] leading-relaxed text-[#BEA0D8]/70">Use achievement points to shape the profile your friends see inside Aevora.</p></div>
        <div className="flex items-center gap-2 rounded-full border border-[rgba(228,201,142,0.25)] bg-[rgba(228,201,142,0.08)] px-3 py-2 text-[12px] font-semibold text-[#E4C98E]"><Sparkles size={14} /> <span>{profile.points} pts</span></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const owned = profile.unlockedItems.includes(item.id);
          const equipped = profile.equipped[item.kind] === item.id;
          return <motion.article key={item.id} data-item-kind={item.kind} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className={`relative overflow-hidden rounded-[18px] border p-4 ${equipped ? 'border-[#A07CC1]/65 bg-[linear-gradient(145deg,rgba(130,99,161,0.30),rgba(23,16,31,0.78))] shadow-[0_18px_46px_-26px_rgba(190,160,216,0.8)]' : 'border-[rgba(217,198,234,0.12)] bg-[rgba(23,16,31,0.60)]'}`}><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(217,198,234,0.13)] bg-[rgba(74,53,96,0.25)] text-[#BEA0D8]"><Palette size={16} /></span>{equipped ? <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A8D6B0]"><Check size={12} /> Equipped</span> : owned ? <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/65">Owned</span> : <LockKeyhole size={14} className="text-[#BEA0D8]/45" />}</div><h2 className="mt-4 text-[14px] font-bold text-[#F1EAF8]">{item.name}</h2><p className="mt-1 min-h-[42px] text-[11px] leading-relaxed text-[#BEA0D8]/65">{item.description}</p><div className="mt-4 flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-[#E4C98E]">{owned ? 'Unlocked' : `${item.price} pts`}</span><button type="button" disabled={equipped} onClick={() => (owned ? onEquip(item.id) : onPurchase(item.id))} aria-label={`${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'} ${item.name}`} className="rounded-full border border-[rgba(217,198,234,0.18)] px-3 py-1.5 text-[10px] font-semibold text-[#D9C6EA]/85 transition-colors hover:border-[#A07CC1]/65 hover:bg-[rgba(130,99,161,0.18)] disabled:cursor-default disabled:opacity-55">{equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</button></div></motion.article>;
        })}
      </section>
    </motion.div>
  );
}
