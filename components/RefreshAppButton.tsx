"use client";
import { useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function RefreshAppButton() {
  const doRefresh = useCallback(() => {
    try {
      const now = Date.now();
      const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0');
      if (now - last < 3000) return; // throttle
      localStorage.setItem('app_manual_refresh_ts', String(now));
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }, []);

  return (
    <button
      onClick={doRefresh}
      aria-label="Force refresh"
      title="Force refresh (workaround for stale Safari state)"
      className="fixed bottom-4 right-4 z-[9999] rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-3 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <RefreshCcw className="h-5 w-5" />
    </button>
  );
}
