import { useEffect } from "react";

/**
 * Re-runs the given callback whenever:
 *  - User switches back to the tab (focus/visibilitychange)
 *  - Optionally on mount (first render)
 */
export function useAutoRefreshOnFocus(
  refreshFn: () => void | Promise<void>,
  options: { runOnMount?: boolean } = {}
) {
  useEffect(() => {
    if (options.runOnMount) {
      refreshFn();
    }

    const onFocus = () => refreshFn();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshFn();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshFn, options.runOnMount]);
}