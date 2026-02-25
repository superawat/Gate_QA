import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackGoatCounterPageview } from "../utils/goatCounterClient";

function buildPath(location, includeHash) {
  if (!location) {
    return "/";
  }
  const hash = includeHash ? location.hash || "" : "";
  return `${location.pathname || "/"}${location.search || ""}${hash}`;
}

/**
 * Tracks SPA route transitions for GoatCounter.
 *
 * If your GoatCounter script still auto-counts on load, keep trackInitialPageview=false
 * to avoid double counting the first page.
 */
export function useGoatCounterSPA({
  includeHash = false,
  trackInitialPageview = false,
  maxRetries = 20,
  retryDelayMs = 120,
  titleFactory = () =>
    (typeof document !== "undefined" ? document.title : "GateQA"),
} = {}) {
  const location = useLocation();
  const lastPathRef = useRef(null);
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    const path = buildPath(location, includeHash);

    if (lastPathRef.current === path) {
      return;
    }

    const isFirstObservedRoute = !hasRenderedRef.current;
    hasRenderedRef.current = true;
    lastPathRef.current = path;

    if (isFirstObservedRoute && !trackInitialPageview) {
      return;
    }

    void trackGoatCounterPageview({
      path,
      title: titleFactory(path),
      maxRetries,
      retryDelayMs,
    });
  }, [
    location.pathname,
    location.search,
    location.hash,
    includeHash,
    trackInitialPageview,
    maxRetries,
    retryDelayMs,
    titleFactory,
  ]);
}
