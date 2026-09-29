import { motion } from 'framer-motion';
import type { CommunityItem } from '../data/navigation';
import type { SteamNewsItem } from '../integrations/steam/steamNews';
import { EASE } from '../motion/presets';
import { SmartImage } from '../components/SmartImage';

function asCommunityItem(news: SteamNewsItem): CommunityItem {
  return {
    id: `steam-news:${news.id}`,
    text: news.contents || news.title,
    headline: news.title,
    excerpt: news.contents || 'Open the source to read the full Steam update.',
    time: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(news.publishedAt)),
    source: news.stale ? `${news.feedLabel ?? 'Steam News'} · cached` : news.feedLabel ?? 'Steam News',
    thumb: '',
    fallback: '',
    url: news.url,
  };
}

export default function CommunityView({ news = [], onPreview }: { news?: SteamNewsItem[]; onPreview: (item: CommunityItem) => void }) {
  const feed = news.map(asCommunityItem);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE.out }}
      className="flex flex-col gap-2.5"
    >
      <h3 className="px-0.5 text-[12.5px] font-semibold text-[#F1EAF8]/90">Activity Feed</h3>
      {feed.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-[rgba(217,198,234,0.14)] px-4 py-6 text-[11.5px] leading-relaxed text-[#BEA0D8]/65">
          Connect Steam to load current game news. No sample stories are shown here.
        </div>
      )}
      {feed.map((c, i) => (
        <motion.button
          key={c.id}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.35, ease: EASE.out }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPreview(c)}
          className="group flex w-full items-start gap-3 rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.14)] p-2.5 text-left backdrop-blur-xl transition-colors hover:bg-[rgba(74,53,96,0.26)]"
        >
          <span className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] border border-[rgba(217,198,234,0.12)] bg-[rgba(74,53,96,0.25)]">
            <SmartImage src={c.thumb} fallback={c.fallback} alt={c.headline} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[10px] font-medium text-[#BEA0D8]/60">
              <span className="rounded-full border border-[rgba(217,198,234,0.14)] px-2 py-0.5">{c.source}</span>
              <span>{c.time}</span>
            </span>
            <span className="mt-1 block truncate text-[13px] font-semibold text-[#F1EAF8]/90">{c.headline}</span>
            <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-[#D9C6EA]/70">{c.excerpt}</span>
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
