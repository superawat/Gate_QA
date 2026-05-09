import { useMemo } from "react";

/**
 * Returns resolved CSS custom-property values for Recharts SVG elements
 * that can't consume CSS variables directly (they need hex/rgba strings).
 *
 * Reading from the DOM at render time means the values automatically
 * flip when `data-theme` toggles between light and dark.
 */
const useChartTheme = () =>
  useMemo(() => {
    const root =
      typeof document !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null;

    const get = (name, fallback) =>
      root ? root.getPropertyValue(name).trim() || fallback : fallback;

    return {
      grid: get("--chart-grid", "#e2e8f0"),
      tick: get("--chart-tick", "#64748b"),
      tickSecondary: get("--chart-tick-secondary", "#94a3b8"),
      cursor: get("--chart-cursor", "rgba(241,245,249,0.5)"),
      tooltipBg: get("--chart-tooltip-bg", "rgba(255,255,255,0.95)"),
      tooltipBorder: get("--chart-tooltip-border", "#e2e8f0"),
      tooltipText: get("--chart-tooltip-text", "#0f172a"),
      tooltipMuted: get("--chart-tooltip-muted", "#475569"),
      ringTrack: get("--chart-ring-track", "#f1f5f9"),
    };
  }, []);

export default useChartTheme;
