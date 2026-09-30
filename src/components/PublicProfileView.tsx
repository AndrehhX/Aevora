import { motion } from 'framer-motion';
import { Award, ArrowUpRight, Clock3, Gamepad2, Heart, Pencil, ShieldCheck, Sparkles, Store, Trophy } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getInstalledGames } from '../domain/library';
import type { ProfileAchievement, ProfileItem, ProfileState } from '../domain/profile';
import { SmartImage } from './SmartImage';

type ProfileMode = 'owner' | 'visitor';

export default function PublicProfileView({
  profile,
  achievements,
  library,
  favorites,
  items,
  mode,
  syncing,
  syncError,
  onChange,
  onSelectGame,
  onOpenStore,
  onModeChange,
}: {
  profile: ProfileState;
  achievements: ProfileAchievement[];
  library: UnifiedGame[];
  favorites: string[];
  items: ProfileItem[];
  mode: ProfileMode;
  syncing: boolean;
  syncError: string | null;
  onChange: (changes: Partial<ProfileState>) => void;
  onSelectGame: (id: string) => void;
  onOpenStore: () => void;
  onModeChange: (mode: ProfileMode) => void;
}) {
  const installedCount = getInstalledGames(library).length;
  const favoriteGames = favorites.map((id) => library.find((game) => game.id === id)).filter((game): game is UnifiedGame => !!game).slice(0, 4);
  const equippedFrame = items.find((item) => item.id === profile.equipped.frame);
  const equippedBackground = items.find((item) => item.id === profile.equipped.background);
  const equippedBadge = items.find((item) => item.id === profile.equipped.badge);
  const equippedTitle = items.find((item) => item.id === profile.equipped.title);
  const initials = profile.name.trim().charAt(0).toUpperCase() || 'A';
  const isOwner = mode === 'owner';

  return (
    <motion.div
      data-profile-view={mode}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-full flex-col gap-3 pb-2"
    >
      <section
        data-profile-background={equippedBackground?.id ?? 'default'}
        className={`relative overflow-hidden rounded-[22px] border border-[rgba(217,198,234,0.14)] bg-[linear-gradient(135deg,rgba(74,53,96,0.55),rgba(23,16,31,0.90)_52%,rgba(13,9,18,0.98))] p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] ${equippedBackground ? 'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_84%_8%,rgba(160,124,193,0.42),transparent_38%)]' : ''}`}
      >
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              data-profile-frame={equippedFrame?.id ?? 'default'}
              className={`relative flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-[#A07CC1]/50 bg-gradient-to-br from-[#8263A1] via-[#4A3560] to-[#17101F] text-[30px] font-extrabold text-[#F1EAF8] shadow-[0_16px_40px_-18px_rgba(160,124,193,0.9)] ${equippedFrame ? 'ring-2 ring-[#E4C98E]/85 ring-offset-2 ring-offset-[#17101F]' : ''}`}
            >
              <SmartImage src={profile.avatarUrl} fallback="" alt={`${profile.name} avatar`} className="h-full w-full object-cover" />
              {!profile.avatarUrl && <span className="absolute inset-0 flex items-center justify-center">{initials}</span>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BEA0D8]/65">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Aevora profile</span>
                <span className="rounded-full border border-[rgba(144,212,144,0.25)] bg-[rgba(144,212,144,0.08)] px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#A8D6B0]">Public view</span>
              </div>
              <h1 className="mt-2 truncate text-[clamp(24px,3vw,38px)] font-extrabold tracking-[-0.03em] text-[#F1EAF8]">{profile.name}</h1>
              <p className="mt-1 max-w-[620px] text-[12px] leading-relaxed text-[#D9C6EA]/70">{profile.bio || 'Building a personal library, one good idea at a time.'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#BEA0D8]/65">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#90d490] shadow-[0_0_8px_rgba(144,212,144,0.8)]" /> {syncing ? 'Syncing Steam achievements' : 'Ready to play'}</span>
                {equippedTitle && <span className="rounded-full border border-[rgba(228,201,142,0.22)] bg-[rgba(228,201,142,0.08)] px-2 py-1 text-[#E4C98E]">{equippedTitle.name}</span>}
                {equippedBadge && <span className="rounded-full border border-[rgba(217,198,234,0.16)] px-2 py-1 text-[#D9C6EA]/80">{equippedBadge.name}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-[rgba(228,201,142,0.22)] bg-[rgba(228,201,142,0.08)] px-3 py-2 text-[11px] font-semibold text-[#E4C98E]"><Sparkles size={13} /> {profile.points} pts</div>
            <button type="button" onClick={onOpenStore} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(190,160,216,0.25)] bg-[rgba(130,99,161,0.22)] px-3 py-2 text-[11px] font-semibold text-[#F1EAF8] transition-colors hover:border-[rgba(190,160,216,0.55)] hover:bg-[rgba(130,99,161,0.38)]"><Store size={13} /> Open Aevora Shop</button>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(217,198,234,0.10)] pt-3 text-[10px] text-[#BEA0D8]/60">
          <span>{isOwner ? 'Owner view · changes are saved locally on this PC.' : 'Visitor view · read-only presentation of this profile.'}</span>
          <button type="button" onClick={() => onModeChange(isOwner ? 'visitor' : 'owner')} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(217,198,234,0.15)] px-2.5 py-1.5 font-semibold text-[#D9C6EA]/80 transition-colors hover:border-[#A07CC1]/60 hover:text-[#F1EAF8]">
            {isOwner ? <><Trophy size={12} /> Preview visitor</> : <><Pencil size={12} /> Edit profile</>}
          </button>
        </div>
      </section>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <section className="rounded-[18px] border border-[rgba(217,198,234,0.11)] bg-[rgba(23,16,31,0.62)] p-4 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Gamepad2, value: installedCount, label: 'Installed' },
              { icon: Clock3, value: profile.totalEarned, label: 'Points earned' },
              { icon: Award, value: achievements.length, label: 'Achievements' },
              { icon: Heart, value: favoriteGames.length, label: 'Favorites' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[13px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.14)] px-3 py-3 text-center">
                <stat.icon size={15} className="mx-auto text-[#BEA0D8]/75" />
                <strong className="mt-1 block text-[18px] font-extrabold text-[#F1EAF8]">{stat.value}</strong>
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">{stat.label}</span>
              </div>
            ))}
          </div>

          {isOwner && (
            <div className="mt-4 rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.10)] p-3">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BEA0D8]/70">Profile identity</h2><Pencil size={13} className="text-[#BEA0D8]/45" /></div>
              <label className="block text-[10px] text-[#BEA0D8]/65" htmlFor="profile-name">Display name</label>
              <input id="profile-name" value={profile.name} maxLength={32} onChange={(event) => onChange({ name: event.target.value })} className="mt-1 w-full rounded-[10px] border border-[rgba(217,198,234,0.14)] bg-[#17101F]/75 px-3 py-2 text-[12px] text-[#F1EAF8] outline-none transition-colors focus:border-[#A07CC1]/65" />
              <label className="mt-2 block text-[10px] text-[#BEA0D8]/65" htmlFor="profile-bio">Bio</label>
              <textarea id="profile-bio" value={profile.bio} maxLength={160} rows={2} onChange={(event) => onChange({ bio: event.target.value })} className="mt-1 w-full resize-none rounded-[10px] border border-[rgba(217,198,234,0.14)] bg-[#17101F]/75 px-3 py-2 text-[12px] leading-relaxed text-[#F1EAF8] outline-none transition-colors focus:border-[#A07CC1]/65" />
              <label className="mt-2 block text-[10px] text-[#BEA0D8]/65" htmlFor="profile-avatar">Avatar URL</label>
              <input id="profile-avatar" value={profile.avatarUrl} maxLength={500} onChange={(event) => onChange({ avatarUrl: event.target.value })} className="mt-1 w-full rounded-[10px] border border-[rgba(217,198,234,0.14)] bg-[#17101F]/75 px-3 py-2 text-[12px] text-[#F1EAF8] outline-none transition-colors focus:border-[#A07CC1]/65" placeholder="https://..." />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between"><h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#BEA0D8]/70">Achievement shelf</h2>{syncError && <span className="text-[10px] text-[#D8B978]">{syncError}</span>}</div>
          {achievements.length === 0 ? (
            <p className="mt-2 rounded-[13px] border border-dashed border-[rgba(217,198,234,0.16)] px-3 py-5 text-center text-[11px] leading-relaxed text-[#BEA0D8]/55">Connect Steam with public game details to load unlocked achievements.</p>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {achievements.slice(0, 8).map((achievement) => <div key={`${achievement.appId}:${achievement.apiName}`} className="rounded-[13px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.13)] p-3"><div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F1EAF8]/90"><Award size={13} className="text-[#E4C98E]" />{achievement.name}</div><p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#BEA0D8]/60">{achievement.description || 'Unlocked on Steam.'}</p></div>)}
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-[18px] border border-[rgba(217,198,234,0.11)] bg-[rgba(23,16,31,0.62)] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#BEA0D8]/70">Featured games</h2><span className="text-[10px] text-[#BEA0D8]/50">{favoriteGames.length} selected</span></div>
          {favoriteGames.length === 0 ? <p className="mt-3 rounded-[13px] border border-dashed border-[rgba(217,198,234,0.16)] px-3 py-5 text-center text-[10px] leading-relaxed text-[#BEA0D8]/55">Favorite a game from your library to feature it here.</p> : <div className="mt-3 grid grid-cols-2 gap-2">{favoriteGames.map((game) => <motion.button key={game.id} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => onSelectGame(game.id)} className="group min-w-0 text-left"><div className="relative aspect-[2/3] overflow-hidden rounded-[13px] border border-[rgba(217,198,234,0.10)] bg-[#17101F]"><SmartImage src={game.artwork.cover} fallback={game.artwork.coverFallback} fallback2={game.artwork.coverFallback2} alt={game.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D0912]/85 via-transparent to-transparent" /></div><span className="mt-1.5 flex items-center justify-between gap-1 text-[10px] font-semibold text-[#D9C6EA]/80"><span className="truncate">{game.title}</span><ArrowUpRight size={12} className="shrink-0 text-[#BEA0D8]/55" /></span></motion.button>)}</div>}
        </section>
      </div>
    </motion.div>
  );
}
