import { providerDefinitions, type ProviderId } from '../domain/provider';

// Restrained brand-neutral provider identification. Text badges keep
// provider branding from overpowering Aevora.
export default function ProviderBadge({ provider, tone = 'default' }: { provider: ProviderId; tone?: 'default' | 'faint' }) {
  const def = providerDefinitions[provider];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9.5px] font-semibold tracking-wide ${
        tone === 'faint'
          ? 'border-[rgba(217,198,234,0.10)] text-[#BEA0D8]/60'
          : 'border-[rgba(217,198,234,0.16)] bg-[rgba(74,53,96,0.30)] text-[#D9C6EA]/90'
      }`}
    >
      {def?.short ?? provider}
    </span>
  );
}
