import { motion } from 'framer-motion';
import { Award, Clock, Gamepad2, Heart, LockKeyhole, Save, Sparkles } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getInstalledGames } from '../domain/library';
import { getLibraryGame, libraryGames } from '../data/library';
import type { ProfileAchievement, ProfileItem, ProfileState } from '../domain/profile';
import Modal from './Modal';
import { SmartImage } from './SmartImage';

export default function ProfilePanel({
  open,
  profile,
  achievements,
  items,
  syncing,
  syncError,
  favorites,
  onChange,
  onPurchase,
  onEquip,
  onSelectGame,
  onClose,
}: {
  open: boolean;
  profile: ProfileState;
  achievements: ProfileAchievement[];
  items: ProfileItem[];
  syncing: boolean;
  syncError: string | null;
  favorites?: string[];
  onChange: (changes: Partial<ProfileState>) => void;
  onPurchase: (itemId: string) => void;
  onEquip: (itemId: string) => void;
  onSelectGame: (id: string) => void;
  onClose: () => void;
}) {
  const favGames = (favorites ?? []).map(getLibraryGame).filter((g): g is UnifiedGame => !!g);
  const installedCount = getInstalledGames(libraryGames).length;
  const equipped = new Set(Object.values(profile.equipped));
  const frameEquipped = profile.equipped.frame === 'frame-lilac';
  const backgroundEquipped = profile.equipped.background === 'background-nebula';
  const titleEquipped = items.find((item) => item.id === profile.equipped.title);
  const badgeEquipped = items.find((item) => item.id === profile.equipped.badge);
  const initials = profile.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <Modal open={open} onClose={onClose} labelledBy="profile-title" panelClass="max-w-[520px]">
      <div className={`no-scrollbar max-h-[86vh] overflow-y-auto p-5 ${backgroundEquipped ? 'bg-[radial-gradient(circle_at_90%_0%,rgba(130,99,161,0.28),transparent_48%)]' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-[#A07CC1]/40 bg-gradient-to-br from-[#4A3560] via-[#8263A1] to-[#17101F] text-[22px] font-extrabold text-[#F1EAF8] ${frameEquipped ? 'ring-2 ring-[#E4C98E]/80 ring-offset-2 ring-offset-[#17101F]' : ''}`}>
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Profile avatar" className={`h-full w-full object-cover ${frameEquipped ? 'ring-2 ring-[#E4C98E]/80' : ''}`} /> : initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="profile-title" className="truncate text-[16px] font-bold text-[#F1EAF8]">{profile.name}</h2>
            {(titleEquipped || badgeEquipped) && <p className="mt-0.5 text-[10px] text-[#E4C98E]/80">{titleEquipped?.name}{titleEquipped && badgeEquipped ? ' · ' : ''}{badgeEquipped?.name}</p>}
            <p className="flex items-center gap-1.5 text-[11px] text-[#BEA0D8]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#90d490] shadow-[0_0_6px_rgba(144,212,144,0.8)]" />
              Local profile · {syncing ? 'syncing Steam achievements' : 'ready'}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[rgba(217,198,234,0.15)] bg-[rgba(74,53,96,0.25)] px-2.5 py-1 text-[11px] font-semibold text-[#E4C98E]">
            <Sparkles size={12} /> {profile.points} pts
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { icon: Gamepad2, v: String(installedCount), k: 'Installed' },
            { icon: Clock, v: String(profile.totalEarned), k: 'Earned' },
            { icon: Award, v: String(achievements.length), k: 'Achievements' },
            { icon: Heart, v: String(favGames.length), k: 'Favorites' },
          ].map((stat) => (
            <div key={stat.k} className="rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.16)] px-2 py-2.5 text-center">
              <stat.icon size={14} className="mx-auto text-[#BEA0D8]/70" />
              <div className="mt-1 text-[13px] font-bold text-[#F1EAF8]">{stat.v}</div>
              <div className="text-[8.5px] font-medium uppercase tracking-wider text-[#BEA0D8]/55">{stat.k}</div>
            </div>
          ))}
        </div>

        <section className="mt-5 rounded-[14px] border border-[rgba(217,198,234,0.11)] bg-[rgba(74,53,96,0.12)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/65">Profile identity</h3>
            <Save size={13} className="text-[#BEA0D8]/45" />
          </div>
          <label className="block text-[10px] text-[#BEA0D8]/65" htmlFor="profile-name">Display name</label>
          <input id="profile-name" value={profile.name} maxLength={32} onChange={(event) => onChange({ name: event.target.value })} className="mt-1 w-full rounded-[9px] border border-[rgba(217,198,234,0.14)] bg-[#17101F]/70 px-2.5 py-2 text-[12px] text-[#F1EAF8] outline-none transition-colors focus:border-[#A07CC1]/60" />
          <label className="mt-2 block text-[10px] text-[#BEA0D8]/65" htmlFor="profile-bio">Bio</label>
          <textarea id="profile-bio" value={profile.bio} maxLength={160} rows={2} onChange={(event) => onChange({ bio: event.target.value })} className="mt-1 w-full resize-none rounded-[9px] border border-[rgba(217,198,234,0.14)] bg-[#17101F]/70 px-2.5 py-2 text-[12px] leading-relaxed text-[#F1EAF8] outline-none transition-colors focus:border-[#A07CC1]/60" />
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/65">Achievement shelf</h3>
            {syncError ? <span className="text-[10px] text-[#D8B978]">{syncError}</span> : null}
          </div>
          {achievements.length === 0 ? (
            <p className="rounded-[10px] border border-dashed border-[rgba(217,198,234,0.14)] px-3 py-4 text-center text-[11px] text-[#BEA0D8]/55">Connect Steam with public game details to load unlocked achievements.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {achievements.slice(0, 8).map((achievement) => (
                <div key={`${achievement.appId}:${achievement.apiName}`} className="rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.15)] p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F1EAF8]/90"><Award size={12} className="text-[#E4C98E]" />{achievement.name}</div>
                  <p className="mt-1 line-clamp-2 text-[9.5px] leading-relaxed text-[#BEA0D8]/60">{achievement.description || 'Unlocked on Steam.'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/65">Profile shop</h3>
            <span className="text-[10px] text-[#E4C98E]/80">{profile.points} points available</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => {
              const owned = profile.unlockedItems.includes(item.id);
              const isEquipped = owned && equipped.has(item.id);
              return (
                <div key={item.id} className="rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.15)] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="text-[11px] font-semibold text-[#F1EAF8]/90">{item.name}</div><p className="mt-1 text-[9.5px] leading-relaxed text-[#BEA0D8]/55">{item.description}</p></div>
                    {owned ? <Sparkles size={13} className="shrink-0 text-[#90d490]" /> : <LockKeyhole size={12} className="shrink-0 text-[#BEA0D8]/45" />}
                  </div>
                  <button type="button" disabled={isEquipped} onClick={() => (owned ? onEquip(item.id) : onPurchase(item.id))} aria-label={`${owned ? (isEquipped ? 'Equipped' : 'Equip') : 'Buy'} ${item.name}`} className="mt-2 w-full rounded-[8px] border border-[rgba(217,198,234,0.15)] px-2 py-1.5 text-[10px] font-semibold text-[#D9C6EA]/85 transition-colors hover:border-[#A07CC1]/60 hover:bg-[rgba(130,99,161,0.16)] disabled:cursor-default disabled:opacity-55">
                    {owned ? (isEquipped ? 'Equipped' : 'Equip') : `${item.price} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {favGames.length > 0 && (
          <section className="mt-5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Favorites</div>
            <div className="flex flex-col gap-1">
              {favGames.map((game) => (
                <motion.button key={game.id} whileTap={{ scale: 0.98 }} onClick={() => { onSelectGame(game.id); onClose(); }} className="flex items-center gap-2.5 rounded-[10px] p-1.5 text-left transition-colors hover:bg-[rgba(74,53,96,0.32)]">
                  <span className="h-[34px] w-[27px] shrink-0 overflow-hidden rounded-[6px] bg-[rgba(74,53,96,0.25)]"><SmartImage src={game.artwork.cover} fallback={game.artwork.coverFallback} fallback2={game.artwork.coverFallback2} alt={game.title} className="h-full w-full object-cover" /></span>
                  <span className="min-w-0"><span className="block truncate text-[12px] font-medium text-[#F1EAF8]/90">{game.title}</span>{(game.subtitle ?? game.highlight) && <span className="block text-[10px] text-[#BEA0D8]/55">{game.subtitle ?? game.highlight}</span>}</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
