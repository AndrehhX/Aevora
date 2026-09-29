export class DesktopUnavailableError extends Error {
  constructor(message = 'Aevora desktop runtime is not available') {
    super(message);
    this.name = 'DesktopUnavailableError';
  }
}

export interface DesktopBridge {
  readonly isNative: boolean;
  invoke<T>(command: string, payload?: Record<string, unknown>): Promise<T>;
}

type TauriRuntime = {
  invoke?: <T>(command: string, payload?: Record<string, unknown>) => Promise<T>;
};

function tauriRuntime(): TauriRuntime | undefined {
  if (typeof window === 'undefined') return undefined;
  const globalWindow = window as Window & {
    __TAURI_INTERNALS__?: TauriRuntime;
    __TAURI__?: { core?: TauriRuntime };
  };
  return globalWindow.__TAURI_INTERNALS__ ?? globalWindow.__TAURI__?.core;
}

export function getDesktopBridge(): DesktopBridge {
  const runtime = tauriRuntime();
  return {
    isNative: typeof runtime?.invoke === 'function',
    invoke<T>(command: string, payload?: Record<string, unknown>): Promise<T> {
      if (!runtime?.invoke) return Promise.reject(new DesktopUnavailableError());
      return runtime.invoke<T>(command, payload);
    },
  };
}
