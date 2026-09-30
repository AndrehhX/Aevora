import { motion } from 'framer-motion';
import { ExternalLink, LoaderCircle, Tag } from 'lucide-react';
import type { SteamStoreCategories, SteamStoreOffer } from '../integrations/steam/steamStore';
import { EASE } from '../motion/presets';
import { SmartImage } from '../components/SmartImage';

function OfferCard({ offer, selected, onOpen }: { offer: SteamStoreOffer; selected: boolean; onOpen: (offer: SteamStoreOffer) => void }) {
  return (
    <motion.button
      type="button"
      aria-label={`Open ${offer.name} in Steam`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(offer)}
      className={`group relative w-[clamp(180px,18vw,250px)] shrink-0 overflow-hidden rounded-[14px] border text-left transition-[border-color,box-shadow] duration-200 ${
        selected
          ? 'border-[#A07CC1]/65 shadow-[0_18px_42px_-20px_rgba(190,160,216,0.7)]'
          : 'border-[rgba(217,198,234,0.12)] hover:border-[rgba(190,160,216,0.45)] hover:shadow-[0_18px_42px_-20px_rgba(190,160,216,0.55)]'
      }`}
      data-cursor="interactive"
    >
      <div className="relative aspect-[460/215] overflow-hidden bg-[#17101F]">
        <SmartImage
          src={offer.headerImage ?? offer.capsuleImage ?? ''}
          fallback={offer.capsuleImage ?? offer.headerImage ?? ''}
          alt={offer.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D0912] via-transparent to-transparent opacity-80" />
        {offer.discountPercent ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-[#90d490] px-2 py-1 text-[10px] font-bold text-[#111216]">
            {offer.discountPercent}% off
          </span>
        ) : null}
      </div>
      <div className="flex min-h-[76px] flex-col justify-between bg-[rgba(33,22,46,0.92)] px-3 py-2.5">
        <span className="line-clamp-1 text-[12px] font-semibold text-[#F1EAF8]">{offer.name}</span>
        <span className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#BEA0D8]/75">
          <span className="flex min-w-0 items-center gap-1.5">
            <Tag size={11} />
            <span className="truncate">{offer.price ?? 'View price'}</span>
            {offer.originalPrice && offer.originalPrice !== offer.price ? <del className="text-[#BEA0D8]/45">{offer.originalPrice}</del> : null}
          </span>
          <ExternalLink size={12} className="shrink-0 opacity-55 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
    </motion.button>
  );
}

function OfferRow({ title, offers, selectedAppId, onOpen }: { title: string; offers: SteamStoreOffer[]; selectedAppId: number | null; onOpen: (offer: SteamStoreOffer) => void }) {
  if (offers.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 px-0.5 text-[12.5px] font-semibold text-[#F1EAF8]/90">{title}</h3>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {offers.map((offer) => (
          <OfferCard key={`${offer.category}:${offer.appId}`} offer={offer} selected={offer.appId === selectedAppId} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default function StoreView({
  offers,
  selectedAppId,
  loading,
  error,
  onOpenStore,
}: {
  offers: SteamStoreCategories | null;
  selectedAppId: number | null;
  loading: boolean;
  error?: string | null;
  onOpenStore: (offer: SteamStoreOffer) => void;
}) {
  const count = offers ? offers.featured.length + offers.topSellers.length + offers.specials.length : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE.out }} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#F1EAF8]">Steam Store</h2>
          <p className="mt-0.5 text-[11px] text-[#BEA0D8]/65">Ofertas y selecciones públicas actualizadas desde Steam.</p>
        </div>
        {offers?.stale ? <span className="text-[10px] text-[#D8B978]">Showing cached offers</span> : null}
      </div>
      {loading && (
        <div className="flex items-center gap-2 rounded-[14px] border border-[rgba(217,198,234,0.12)] px-4 py-6 text-[11.5px] text-[#BEA0D8]/70">
          <LoaderCircle size={15} className="animate-spin" /> Loading Steam offers…
        </div>
      )}
      {error && !loading && (
        <div className="rounded-[14px] border border-[rgba(216,185,120,0.22)] bg-[rgba(216,185,120,0.08)] px-4 py-5 text-[11.5px] leading-relaxed text-[#E4C98E]">{error}</div>
      )}
      {!loading && !error && count === 0 && (
        <div className="rounded-[14px] border border-dashed border-[rgba(217,198,234,0.16)] px-4 py-7 text-[11.5px] leading-relaxed text-[#BEA0D8]/70">
          Steam no devolvió ofertas en este momento. Intenta actualizar más tarde.
        </div>
      )}
      {!loading && !error && offers && count > 0 && (
        <>
          <OfferRow title="Featured" offers={offers.featured} selectedAppId={selectedAppId} onOpen={onOpenStore} />
          <OfferRow title="Top sellers" offers={offers.topSellers} selectedAppId={selectedAppId} onOpen={onOpenStore} />
          <OfferRow title="Deals" offers={offers.specials} selectedAppId={selectedAppId} onOpen={onOpenStore} />
        </>
      )}
    </motion.div>
  );
}
