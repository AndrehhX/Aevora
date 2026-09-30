import { motion } from 'framer-motion';
import { ExternalLink, LoaderCircle, Tag } from 'lucide-react';
import type { SteamStoreCategories, SteamStoreOffer } from '../integrations/steam/steamStore';
import { SmartImage } from '../components/SmartImage';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { reducedMotionTransition } from '../motion/presets';

function OfferCard({ offer, selected, onOpen }: { offer: SteamStoreOffer; selected: boolean; onOpen: (offer: SteamStoreOffer) => void }) {
  return (
    <motion.button
      type="button"
      aria-label={`Open ${offer.name} in Steam`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(offer)}
      className={`group relative w-[clamp(196px,22vw,282px)] shrink-0 overflow-hidden rounded-[16px] border text-left transition-[border-color,box-shadow] duration-200 ${
        selected
          ? 'border-[#A07CC1]/65 shadow-[0_18px_42px_-20px_rgba(190,160,216,0.7)]'
          : 'border-[rgba(217,198,234,0.12)] hover:border-[rgba(190,160,216,0.45)] hover:shadow-[0_18px_42px_-20px_rgba(190,160,216,0.55)]'
      }`}
      data-cursor="interactive"
    >
      <div className="relative aspect-[16/8] overflow-hidden bg-[#17101F]">
        <SmartImage
          src={offer.headerImage ?? offer.capsuleImage ?? ''}
          fallback={offer.capsuleImage ?? offer.headerImage ?? ''}
          fallback2={offer.headerImage ?? undefined}
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
      <div className="flex min-h-[82px] flex-col justify-between bg-[rgba(33,22,46,0.92)] px-3 py-2.5">
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
    <section data-store-row={title.toLowerCase().replace(/\s+/g, '-')}>
      <h3 className="mb-2 px-0.5 text-[12.5px] font-semibold text-[#F1EAF8]/90">{title}</h3>
      <div className="no-scrollbar flex min-w-0 gap-3 overflow-x-auto pb-1 pr-1" style={{ scrollbarWidth: 'none' }}>
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
  onRetry,
}: {
  offers: SteamStoreCategories | null;
  selectedAppId: number | null;
  loading: boolean;
  error?: string | null;
  onOpenStore: (offer: SteamStoreOffer) => void;
  onRetry?: () => void;
}) {
  const count = offers ? offers.featured.length + offers.topSellers.length + offers.specials.length : 0;
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div data-testid="store-view" data-aevora-layout="store" initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotionTransition(reduced)} className="flex min-w-0 flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#F1EAF8]">Steam Store</h2>
          <p className="mt-0.5 text-[11px] text-[#BEA0D8]/65">Ofertas y selecciones públicas actualizadas desde Steam.</p>
        </div>
        {offers?.stale ? <span className="text-[10px] text-[#D8B978]">Showing cached offers</span> : null}
      </div>
      {loading && (
        <div data-testid="store-state-loading" className="flex min-h-[118px] items-center gap-2 rounded-[16px] border border-[rgba(217,198,234,0.12)] bg-[rgba(23,16,31,0.48)] px-4 py-6 text-[11.5px] text-[#BEA0D8]/70">
          <LoaderCircle size={15} className="animate-spin" /> Loading Steam offers…
        </div>
      )}
      {error && !loading && (
        <div data-testid="store-state-error" className="flex min-h-[118px] items-center justify-between gap-3 rounded-[16px] border border-[rgba(216,185,120,0.22)] bg-[rgba(216,185,120,0.08)] px-4 py-5 text-[11.5px] leading-relaxed text-[#E4C98E]">
          <span>{error}</span>
          {onRetry ? <button type="button" onClick={onRetry} className="shrink-0 rounded-full border border-[rgba(228,201,142,0.35)] px-3 py-1.5 text-[10px] font-semibold text-[#E4C98E] transition-colors hover:bg-[rgba(228,201,142,0.12)]" aria-label="Retry">Retry</button> : null}
        </div>
      )}
      {!loading && !error && count === 0 && (
        <div data-testid="store-state-empty" className="flex min-h-[118px] items-center rounded-[16px] border border-dashed border-[rgba(217,198,234,0.16)] bg-[rgba(23,16,31,0.38)] px-4 py-7 text-[11.5px] leading-relaxed text-[#BEA0D8]/70">
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
