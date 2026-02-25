import { useEffect, useRef } from "react";
import { trackGoatCounterPageview } from "../utils/goatCounterClient";

/**
 * Tracks SPA pageviews for GoatCounter.
 *
 * This app does NOT use React Router — it manages URL state via
 * window.location + history.replaceState. This hook watches for
 * URL changes by polling window.location on a short interval and
 * fires a GoatCounter pageview whenever the path changes.
 *
 * If GoatCounter's script auto-counts on initial load, keep
 * trackInitialPageview = false to avoid double-counting.
 */
export function useGoatCounterSPA({
  includeHash = false,
  trackInitialPageview = false,
  maxRetries = 20,
  retryDelayMs = 120,
  pollIntervalMs = 800,
  titleFactory = () =>
    typeof document !== "undefined" ? document.title : "GateQA",
} = {}) {
  const lastPathRef = useRef(null);
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    function getCurrentPath() {
      if (typeof window === "undefined") return "/";
      const hash = includeHash ? window.location.hash || "" : "";
      return `${window.location.pathname || "/"}${window.location.search || ""}${hash}`;
    }

    function checkAndTrack() {
      const path = getCurrentPath();
      if (lastPathRef.current === path) return;

      const isFirstObservedRoute = !hasRenderedRef.current;
      hasRenderedRef.current = true;
      lastPathRef.current = path;

      if (isFirstObservedRoute && !trackInitialPageview) return;

      void trackGoatCounterPageview({
        path,
        title: titleFactory(path),
        maxRetries,
        retryDelayMs,
      });
    }

    // Check immediately on mount
    checkAndTrack();

    // Poll for URL changes (replaceState doesn't fire events)
    const intervalId = setInterval(checkAndTrack, pollIntervalMs);

    return () => clearInterval(intervalId);
  }, [includeHash, trackInitialPageview, maxRetries, retryDelayMs, pollIntervalMs, titleFactory]);
}
