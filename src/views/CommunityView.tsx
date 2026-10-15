import { motion } from 'framer-motion';
import type { CommunityItem } from '../data/navigation';
import type { SteamCommunityItem } from '../integrations/steam/steamNews';
import { EASE } from '../motion/presets';
import { SmartImage } from '../components/SmartImage';

function asCommunityItem(news: SteamCommunityItem): CommunityItem {
  const appId = news.appId;
  const thumb = appId ? `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_231x87.jpg` : '';
  const fallback = appId ? `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg` : '';
  return {
    id: `steam-news:${news.id}`,
    text: news.contents || news.title,
    headline: news.title,
    excerpt: news.contents || 'Open the source to read the full Steam update.',
    time: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(news.publishedAt)),
    source: news.stale ? `${news.gameTitle} · cached` : news.gameTitle,
    thumb,
    fallback,
    url: news.url,
  };
}

export default function CommunityView({ news = [], onPreview }: { news?: SteamCommunityItem[]; onPreview: (item: CommunityItem) => void }) {
  const feed = news.map(asCommunityItem);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE.out }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#F1EAF8]">Activity Feed</h3>
        <span className="text-[11px] text-[#BEA0D8]/60">{feed.length} updates</span>
      </div>

      {feed.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-[12px] leading-relaxed text-[#BEA0D8]/70 backdrop-blur-md">
          Connect Steam to load current game news. No sample stories are shown here.
        </div>
      )}

      {feed.map((c, i) => (
        <motion.button
          key={c.id}
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35, ease: EASE.out }}
          whileHover={{ y: -2, backgroundColor: 'rgba(74,53,96,0.30)', borderColor: 'rgba(217,198,234,0.22)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPreview(c)}
          className="group relative flex w-full items-start gap-4 rounded-[16px] border border-white/[0.08] bg-[#17101F]/70 p-3.5 text-left shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200"
        >
          <span className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-[12px] border border-white/10 bg-black/40 shadow-inner">
            <SmartImage
              src={c.thumb}
              fallback={c.fallback}
              alt={c.headline}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[10.5px] font-medium text-[#BEA0D8]/70">
              <span className="rounded-full border border-[#A07CC1]/30 bg-[#8263A1]/15 px-2.5 py-0.5 font-semibold text-[#D9C6EA]">
                {c.source}
              </span>
              <span>{c.time}</span>
            </span>
            <span className="mt-1.5 block truncate text-[13.5px] font-bold text-[#F1EAF8] transition-colors group-hover:text-white">
              {c.headline}
            </span>
            <span className="mt-1 line-clamp-2 block text-[12px] leading-relaxed text-[#D9C6EA]/75">
              {c.excerpt}
            </span>
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
