"use client";
import { useCallback, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function RefreshAppButton() {
  const doRefresh = useCallback((opts?: { force?: boolean; reason?: string }) => {
    const force = !!opts?.force;
    const reason = opts?.reason || 'unspecified';
    try {
      // One-off suppression so beforeunload hooks (e.g., focus guard) don't prompt
      try {
        sessionStorage.setItem('suppress_unload_prompt', '1');
        (window as any).__suppressBeforeUnloadPrompt = true;
        window.dispatchEvent(new CustomEvent('app:prepare-refresh', { detail: { reason } }));
      } catch {}
      // Structured debug for programmatic + manual paths
      const ts = new Date().toISOString();
      const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0');
      const now = Date.now();
      const delta = now - last;
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] doRefresh invoked', { ts, now, last, delta, force, reason });
      if (!force && delta < 3000) {
        // eslint-disable-next-line no-console
        console.debug('[AppRefresh] throttled; skipping reload');
        return;
      }
      localStorage.setItem('app_manual_refresh_ts', String(now));
      window.location.reload();
      return;
    } catch {}
    try {
      try {
        sessionStorage.setItem('suppress_unload_prompt', '1');
        (window as any).__suppressBeforeUnloadPrompt = true;
        window.dispatchEvent(new CustomEvent('app:prepare-refresh', { detail: { reason } }));
      } catch {}
      const now = Date.now();
      const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0');
      if (!force && now - last < 3000) return; // throttle (fallback path)
      localStorage.setItem('app_manual_refresh_ts', String(now));
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }, []);

  // Expose a global trigger and listen for a custom event so programmatic callers
  // can invoke the exact same refresh logic as this button.
  useEffect(() => {
    const w = window as any;
    w.triggerAppReset = () => doRefresh({ reason: 'global-trigger' });
    w.triggerAppResetForce = (reason?: string) => doRefresh({ force: true, reason: reason || 'forced-global' });
    const handle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { force?: boolean; reason?: string } | undefined;
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] event caught -> doRefresh()', { type: e.type, ts: new Date().toISOString(), detail });
      doRefresh(detail);
    };
    // eslint-disable-next-line no-console
    console.debug('[AppRefresh] mounted; exposing window.triggerAppReset and listening to app:refresh/app:reset');
    window.addEventListener('app:refresh', handle as any);
    window.addEventListener('app:reset', handle as any);
    return () => {
      try { delete w.triggerAppReset } catch {}
      window.removeEventListener('app:refresh', handle as any);
      window.removeEventListener('app:reset', handle as any);
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] unmounted; removed global trigger and listeners');
    };
  }, [doRefresh]);

  return (
    <button
      onClick={() => doRefresh({ reason: 'manual-button' })}
      aria-label="Force refresh"
      title="Force refresh (workaround for stale Safari state)"
      className="fixed bottom-4 right-4 z-[9999] rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-3 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <RefreshCcw className="h-5 w-5" />
    </button>
  );
}
