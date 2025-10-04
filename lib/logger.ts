// Lightweight logging helper. Use debugLog for noisy diagnostics that should
// disappear in production unless explicitly enabled.
// Enable by setting NEXT_PUBLIC_DEBUG=1 (client) or DEBUG=1 (server) at build/runtime.

const debugEnabled = ((): boolean => {
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_DEBUG === '1' || process.env.DEBUG === '1') return true;
    // In production builds, allow opt-in via localStorage flag (set in console): localStorage.DEBUG='1'
  }
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage && window.localStorage.getItem('DEBUG') === '1') return true;
    } catch {}
  }
  return false;
})();

export function debugLog(label: string, data?: any, ...rest: any[]) {
  if (!debugEnabled) return;
  if (rest.length || data !== undefined) {
    // Use console.debug so it can be filtered separately in devtools.
    // eslint-disable-next-line no-console
    console.debug(label, data, ...rest);
  } else {
    // eslint-disable-next-line no-console
    console.debug(label);
  }
}

// Convenience wrappers for future expansion
export function infoLog(label: string, data?: any, ...rest: any[]) {
  if (!debugEnabled) return;
  // eslint-disable-next-line no-console
  console.info(label, data, ...rest);
}

// Always show warnings & errors; we do not re-export them to keep explicitness in code.
// Prefer keeping direct console.warn / console.error for important signals.
