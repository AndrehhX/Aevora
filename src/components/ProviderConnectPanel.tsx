import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ConnectionState } from '../integrations/steam/steamAdapter';
import type { SteamCredentialsInput } from '../integrations/steam/steamCredentials';

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
  onSaveCredentials,
  onClearCredentials,
  nativeAvailable = true,
}: {
  connection: ConnectionState;
  onConnect: () => Promise<void> | void;
  onDisconnect: () => Promise<void> | void;
  onSaveCredentials?: (credentials: SteamCredentialsInput) => Promise<void> | void;
  onClearCredentials?: () => Promise<void> | void;
  nativeAvailable?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const copy = connectionCopy(connection);

  const run = async (action: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await action();
      setMessage(null);
    } finally {
      setBusy(false);
    }
  };

  const saveSetup = async () => {
    if (!onSaveCredentials) return;
    setBusy(true);
    setMessage(null);
    try {
      await onSaveCredentials({ account, apiKey });
      setApiKey('');
      setMessage('Saved locally on this PC.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Steam setup could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const clearSetup = async () => {
    if (!onClearCredentials) return;
    await run(onClearCredentials);
    setAccount('');
    setApiKey('');
    setMessage('Local Steam setup cleared.');
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
      {onSaveCredentials && (
        <div className="mt-3 border-t border-[rgba(217,198,234,0.08)] pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Local Steam setup</div>
          <p className="mb-2 text-[11px] leading-snug text-[#BEA0D8]/60">
            Your API key stays on this PC in Windows Credential Manager. Aevora never asks for your Steam password.
          </p>
          <div className="space-y-2">
            <label className="block text-[11px] text-[#D9C6EA]/70" htmlFor="steam-account">
              SteamID64 or vanity URL
              <input
                id="steam-account"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="7656119… or custom URL"
                disabled={!nativeAvailable || busy}
                autoComplete="username"
                className="mt-1 w-full rounded-[9px] border border-[rgba(217,198,234,0.12)] bg-black/25 px-2.5 py-2 text-[12px] text-[#F1EAF8] outline-none transition-colors placeholder:text-[#BEA0D8]/35 focus:border-[rgba(190,160,216,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
            <label className="block text-[11px] text-[#D9C6EA]/70" htmlFor="steam-api-key">
              Steam Web API key
              <input
                id="steam-api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your key"
                disabled={!nativeAvailable || busy}
                autoComplete="new-password"
                className="mt-1 w-full rounded-[9px] border border-[rgba(217,198,234,0.12)] bg-black/25 px-2.5 py-2 text-[12px] text-[#F1EAF8] outline-none transition-colors placeholder:text-[#BEA0D8]/35 focus:border-[rgba(190,160,216,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={!nativeAvailable || busy}
                onClick={() => void saveSetup()}
                className="rounded-full bg-[rgba(130,99,161,0.4)] px-3 py-1.5 text-[10px] font-semibold text-[#F1EAF8] transition-colors hover:bg-[rgba(130,99,161,0.58)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {busy ? 'Saving…' : 'Save Steam setup'}
              </motion.button>
              {onClearCredentials && (
                <button
                  type="button"
                  disabled={!nativeAvailable || busy}
                  onClick={() => void clearSetup()}
                  className="rounded-full border border-[rgba(217,198,234,0.14)] px-3 py-1.5 text-[10px] font-semibold text-[#D9C6EA]/75 transition-colors hover:border-[rgba(190,160,216,0.4)] hover:text-[#F1EAF8] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Clear local setup
                </button>
              )}
            </div>
            {!nativeAvailable && <p className="text-[10px] text-amber-200/75">Open the Tauri desktop app to configure Steam locally.</p>}
            {message && <p className="text-[10px] text-emerald-200/80">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
