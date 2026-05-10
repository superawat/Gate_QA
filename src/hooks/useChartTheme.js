import { useEffect, useState } from "react";

const resolveChartTheme = () => {
  const root =
    typeof document !== "undefined" && typeof getComputedStyle === "function"
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
    seriesAccuracy: get("--chart-series-accuracy", "#0ea5e9"),
    seriesCoverage: get("--chart-series-coverage", "#8b5cf6"),
    seriesCorrect: get("--chart-series-correct", "#059669"),
    seriesIncorrect: get("--chart-series-incorrect", "#e11d48"),
    accuracyLow: get("--chart-accuracy-low", "#e11d48"),
    accuracyMedium: get("--chart-accuracy-medium", "#d97706"),
    accuracyHigh: get("--chart-accuracy-high", "#059669"),
  };
};

const useChartTheme = () => {
  const [theme, setTheme] = useState(resolveChartTheme);

  useEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
      return undefined;
    }

    const updateTheme = () => setTheme(resolveChartTheme());
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
};

export default useChartTheme;
