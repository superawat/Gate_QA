import React, { useEffect, useRef, useState } from "react";
import {
  FaBookOpen,
  FaFilePdf,
  FaFileCsv,
  FaFileImport,
  FaFilter,
  FaSave,
  FaInfoCircle,
  FaHeart,
  FaFire,
  FaNewspaper,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import HamburgerButton from "./HamburgerButton";
import SupportModal from "../Footer/SupportModal";

import { HIGH_PRIORITY_TOPICS_ROUTE, PRACTICE_ROUTE, USER_MANUAL_ROUTE, BLOG_ROUTE } from "../../utils/routes";
import { EDITORIAL_PAGES } from "../../data/editorialPages";
import { useAptitudeEnabled } from "../../utils/aptitudePreference";
import {
  preloadExploreRoute,
  preloadHighPriorityTopicsRoute,
  preloadUserManualRoute,
} from "../../utils/routePreload";

const LAST_EXPORT_KEYS = {
  pdf: "gateqa_last_pdf_export",
  csv: "gateqa_last_csv_export",
  json: "gateqa_last_json_export",
  importJson: "gateqa_last_json_import",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const sectionHeadingClassName = "px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]";

const actionButtonClassName = "flex min-h-[46px] w-full items-center gap-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500";

const getFocusableElements = (container) => (
  Array.from(container?.querySelectorAll(focusableSelector) || [])
    .filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
);

const readTimestamp = (key) => {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(key)) || 0;
};

const formatRelativeDate = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const delta = now - timestamp;
  const seconds = Math.floor(delta / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const saveTimestamp = (key) => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, String(Date.now()));
    }
  } catch (e) {}
};

export { LAST_EXPORT_KEYS, saveTimestamp };

const manualEntries = [
  {
    term: "Streak",
    description: "A streak counts consecutive days with distinct question progress. Re-answering the same question does not create a new streak day.",
  },
  {
    term: "Best",
    description: "\"Best\" is your longest-ever streak — the maximum consecutive practice days you've achieved in your history. It never resets.",
  },
  {
    term: "Aura (XP)",
    description: "Aura is your experience points (XP). You earn 5 XP per attempt, 10 XP per correct answer, 15 XP per streak day, and bonus XP for hard questions. A 7+ day streak activates a 2× multiplier.",
  },
  {
    term: "Freeze",
    description: "A streak freeze protects your streak for one missed day. When consumed, that day still counts toward your streak so it doesn't break. Freezes are limited — use them wisely.",
  },
  {
    term: "Days",
    description: "\"Days\" shows unique calendar days with distinct question progress across your history.",
  },
];

const GlobalNavigationDrawer = ({
  isOpen,
  onClose,
  practiceBadgeLabel = "",
  onSaveWorkspace,
  onOpenWorkspace,
  onExportCsv,
  onPrint,
  statusMessage = "",
}) => {
  const location = useLocation();
  const panelRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [aptitudeEnabled, setAptitudeEnabled] = useAptitudeEnabled();

  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const logoSrc = `${baseUrl}logo.png`;

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirstElement = () => {
      const focusableElements = getFocusableElements(panelRef.current);
      const target = focusableElements[0] || panelRef.current;
      target?.focus?.();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(panelRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current?.focus?.();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const focusTimer = window.setTimeout(focusFirstElement, 0);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  // Save reminder: days since last backup
  const lastBackupTime = readTimestamp("gateqa_last_backup_time");
  const daysSinceBackup = lastBackupTime ? (Date.now() - lastBackupTime) / (1000 * 60 * 60 * 24) : 999;
  const needsBackup = daysSinceBackup >= 7;

  // Per-tool last-used timestamps
  const pdfTs = readTimestamp(LAST_EXPORT_KEYS.pdf);
  const csvTs = readTimestamp(LAST_EXPORT_KEYS.csv);
  const jsonTs = readTimestamp(LAST_EXPORT_KEYS.json);
  const importTs = readTimestamp(LAST_EXPORT_KEYS.importJson);

  const handlePrint = () => {
    saveTimestamp(LAST_EXPORT_KEYS.pdf);
    onPrint?.();
  };
  const handleExportCsv = () => {
    saveTimestamp(LAST_EXPORT_KEYS.csv);
    onExportCsv?.();
  };
  const handleSave = () => {
    saveTimestamp(LAST_EXPORT_KEYS.json);
    onSaveWorkspace?.();
  };
  const handleOpen = () => {
    saveTimestamp(LAST_EXPORT_KEYS.importJson);
    onOpenWorkspace?.();
  };

  const toolItems = [
    { label: "Export PDF", icon: FaFilePdf, onClick: handlePrint, ts: pdfTs },
    { label: "Export CSV", icon: FaFileCsv, onClick: handleExportCsv, ts: csvTs },
    { label: "Export JSON", icon: FaSave, onClick: handleSave, ts: jsonTs },
    { label: "Import JSON", icon: FaFileImport, onClick: handleOpen, ts: importTs },
  ];
  const filterShortcutSearch = location.pathname.startsWith(PRACTICE_ROUTE)
    ? location.search
    : "";

  return (
    <div
      className={`gateqa-global-drawer fixed inset-0 z-[70] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      role="presentation"
      aria-hidden={!isOpen}
      style={{ visibility: isOpen ? "visible" : "hidden" }}
    >
      <div
        className="gateqa-drawer-overlay absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        id="gateqa-global-navigation"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global navigation"
        tabIndex={-1}
        className={`gateqa-drawer-panel nav-drawer absolute left-0 top-0 flex h-[100dvh] w-[min(92vw,380px)] flex-col bg-[color:var(--color-surface)] border-r border-[color:var(--color-border)] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-xl bg-sky-50 p-1.5 dark:bg-sky-950/40">
              <img
                src={logoSrc}
                alt="GATE QA drawer logo"
                width="32"
                height="32"
                className="h-8 w-8 object-contain"
              />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-bold uppercase tracking-[0.08em] text-sky-700 dark:text-sky-400">GATE QA</p>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  aria-label="Support Gate QA"
                  className="text-pink-600 dark:text-pink-400 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center p-0.5"
                >
                  <FaHeart className="h-4 w-4 animate-pulse shrink-0" />
                </button>
              </div>
              {practiceBadgeLabel ? (
                <p className="mt-0.5 text-[11px] font-medium text-[color:var(--color-text-muted)] truncate">{practiceBadgeLabel}</p>
              ) : null}
            </div>
          </div>
          <HamburgerButton isOpen={true} onClick={onClose} className="!border-transparent !bg-transparent shadow-none hover:!bg-[color:var(--color-surface-muted)] shrink-0" />
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {/* Save Reminder — theme-safe amber using CSS vars */}
          {needsBackup && (
            <div className="rounded-xl border border-[color:var(--color-border)] bg-amber-100/60 p-3.5 dark:bg-amber-900/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text)]">⚠ Save Reminder</p>
              <p className="mt-1 text-xs leading-normal text-[color:var(--color-text-muted)]">
                It has been <strong className="text-[color:var(--color-text)]">{lastBackupTime ? Math.floor(daysSinceBackup) : "many"} days</strong> since your last backup. Please save your progress regularly.
              </p>
            </div>
          )}

          {/* 1. Insights */}
          <section className="space-y-2" aria-labelledby="global-insights-heading">
            <h2 id="global-insights-heading" className={sectionHeadingClassName}>Insights</h2>
            <Link
              to={HIGH_PRIORITY_TOPICS_ROUTE}
              onClick={onClose}
              onPointerEnter={() => { void preloadHighPriorityTopicsRoute(); }}
              onFocus={() => { void preloadHighPriorityTopicsRoute(); }}
              onTouchStart={() => { void preloadHighPriorityTopicsRoute(); }}
              className={actionButtonClassName}
            >
              <FaFire className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden="true" />
              <span className="truncate font-extrabold text-sky-700 dark:text-sky-300">Priority Topics</span>
            </Link>
          </section>

          {/* 2. Special Aptitude Section Toggle */}
          <section className="space-y-2" aria-labelledby="global-aptitude-heading">
            <h2 id="global-aptitude-heading" className={sectionHeadingClassName}>Options</h2>
            <Link
              to={{ pathname: PRACTICE_ROUTE, search: filterShortcutSearch }}
              state={{ openFilters: true }}
              onClick={onClose}
              onPointerEnter={() => { void preloadExploreRoute(); }}
              onFocus={() => { void preloadExploreRoute(); }}
              onTouchStart={() => { void preloadExploreRoute(); }}
              className={actionButtonClassName}
            >
              <FaFilter className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="truncate">Filters</span>
            </Link>
            <div className={`${actionButtonClassName} flex items-center justify-between gap-3`}>
              <span className="flex min-w-0 items-center gap-3">
                <FaBookOpen className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden="true" />
                <span className="truncate font-extrabold text-sky-700 dark:text-sky-300">Special Aptitude Section</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={aptitudeEnabled}
                onClick={() => setAptitudeEnabled(!aptitudeEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  aptitudeEnabled ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span className="sr-only">Toggle Special Aptitude Section</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    aptitudeEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 3. Tools — Compressed expandable group */}
          <section className="space-y-2" aria-labelledby="global-tools-heading">
            <h2 id="global-tools-heading" className={sectionHeadingClassName}>Tools</h2>

            <button
              type="button"
              onClick={() => setShowTools(!showTools)}
              className={actionButtonClassName}
              aria-expanded={showTools}
            >
              <FaSave className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="truncate">Export & Import</span>
              <span className="ml-auto text-[10px] text-[color:var(--color-text-muted)]">{showTools ? "▲" : "▼"}</span>
            </button>

            {showTools && (
              <div className="space-y-2 pl-2 border-l border-[color:var(--color-border)] mt-1 transition-all duration-300">
                <div className="flex items-center mb-1">
                  <span className="text-[10px] font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">Storage Policy</span>
                  <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-border)] text-[color:var(--color-text-muted)] text-[10px] transition focus:outline-none focus:ring-1 focus:ring-sky-500"
                    aria-label="Backup Information"
                  >
                    <FaInfoCircle />
                  </button>
                </div>

                {showInfo && (
                  <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3 text-[11px] leading-relaxed text-[color:var(--color-text)] mb-2">
                    <p className="font-bold text-[color:var(--color-text)]">Offline Storage Policy:</p>
                    <ul className="mt-1 list-disc pl-4 space-y-1 text-[color:var(--color-text-muted)]">
                      <li>Data is stored strictly inside your browser's local cache. No central server has access.</li>
                      <li>Browser cleanup or private tabs will clear your progress permanently.</li>
                      <li><strong className="text-[color:var(--color-text)]">Suggested workflow:</strong> Export progress regularly and save files in a dedicated cloud/local backup folder.</li>
                    </ul>
                  </div>
                )}

                <div className="grid gap-2">
                  {toolItems.map((item) => {
                    const Icon = item.icon;
                    const lastUsed = formatRelativeDate(item.ts);
                    return (
                      <button key={item.label} type="button" onClick={item.onClick} className={actionButtonClassName}>
                        <Icon className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{item.label}</span>
                          {lastUsed ? (
                            <span className="text-[9px] font-normal text-[color:var(--color-text-muted)] leading-tight">{lastUsed}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 4. Blog */}
          <section className="space-y-2" aria-labelledby="global-blog-heading">
            <h2 id="global-blog-heading" className={sectionHeadingClassName}>Blog</h2>
            <Link
              to={BLOG_ROUTE}
              onClick={onClose}
              className={actionButtonClassName}
            >
              <FaNewspaper className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="truncate font-extrabold text-sky-700 dark:text-sky-300">Articles & Guides</span>
            </Link>
          </section>

          {/* 5. Manual */}
          <section className="space-y-2" aria-labelledby="global-manual-heading">
            <h2 id="global-manual-heading" className={sectionHeadingClassName}>Manual</h2>

            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className={actionButtonClassName}
              aria-expanded={showManual}
            >
              <FaBookOpen className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="truncate">Quick Reference</span>
              <span className="ml-auto text-[10px] text-[color:var(--color-text-muted)]">{showManual ? "▲" : "▼"}</span>
            </button>

            {showManual && (
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3.5 space-y-3">
                {manualEntries.map((entry) => (
                  <div key={entry.term}>
                    <p className="text-xs font-bold text-[color:var(--color-text)]">{entry.term}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[color:var(--color-text-muted)]">{entry.description}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to={USER_MANUAL_ROUTE}
              onClick={onClose}
              onPointerEnter={() => { void preloadUserManualRoute(); }}
              onFocus={() => { void preloadUserManualRoute(); }}
              onTouchStart={() => { void preloadUserManualRoute(); }}
              className={actionButtonClassName}
            >
              <FaBookOpen className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="truncate">Full User Manual</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className={actionButtonClassName}
            >
              <FaHeart className="h-4 w-4 shrink-0 text-pink-600 dark:text-pink-400 animate-pulse" aria-hidden="true" />
              <span className="truncate">Support Me</span>
            </button>
          </section>
        </div>

        {/* Footer status bar */}
        <div className="min-h-[48px] border-t border-[color:var(--color-border)] px-4 py-3">
          <p className="text-xs font-medium text-[color:var(--color-text-muted)]" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </div>
      </aside>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};

export default GlobalNavigationDrawer;
