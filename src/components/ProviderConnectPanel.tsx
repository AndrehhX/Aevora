import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ConnectionState } from '../integrations/steam/steamAdapter';

function connectionCopy(connection: ConnectionState): { label: string; detail: string; tone: string } {
  if (connection.status === 'connected') {
    return { label: 'Connected', detail: connection.displayName ? `Signed in as ${connection.displayName}.` : 'Steam account connected.', tone: 'text-emerald-300' };
  }
  if (connection.status === 'canceled') return { label: 'Not connected', detail: 'Steam sign-in was canceled.', tone: 'text-[#D9C6EA]/65' };
  return { label: 'Not connected', detail: 'Connect through Steam without sharing your password with Aevora.', tone: 'text-[#D9C6EA]/65' };
}

export default function ProviderConnectPanel({
  connection,
  onConnect,
  onDisconnect,
}: {
  connection: ConnectionState;
  onConnect: () => Promise<void> | void;
  onDisconnect: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const copy = connectionCopy(connection);

  const run = async (action: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[12px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.16)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#F1EAF8]/90">
            <span className={`h-1.5 w-1.5 rounded-full ${connection.status === 'connected' ? 'bg-emerald-300' : 'bg-[#BEA0D8]/45'}`} />
            Steam <span className={`text-[10px] font-normal ${copy.tone}`}>· {copy.label}</span>
          </div>
          <p className="mt-1 max-w-[290px] text-[11px] leading-snug text-[#BEA0D8]/60">{copy.detail}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={busy}
          onClick={() => void run(connection.status === 'connected' ? onDisconnect : onConnect)}
          className="shrink-0 rounded-full border border-[rgba(217,198,234,0.18)] px-3 py-1.5 text-[10px] font-semibold text-[#F1EAF8]/85 transition-colors hover:border-[rgba(190,160,216,0.45)] hover:bg-[rgba(130,99,161,0.22)] disabled:cursor-wait disabled:opacity-50"
        >
          {busy ? 'Working…' : connection.status === 'connected' ? 'Disconnect' : 'Connect'}
        </motion.button>
      </div>
    </div>
  );
}
