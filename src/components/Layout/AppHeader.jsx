import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";

import DomainShiftNotice from "./DomainShiftNotice";
import GlobalNavigationDrawer from "./GlobalNavigationDrawer";
import HamburgerButton from "./HamburgerButton";
import { APTITUDE_ENABLED_STORAGE_KEY } from "../../utils/aptitudePreference";
import { trackEvent } from "../../utils/analytics";
import { TOGGLE_CALCULATOR_EVENT } from "../../utils/globalEvents";
import { HOME_ROUTE, MOCK_ROUTE, PRACTICE_ROUTE } from "../../utils/routes";
import {
  WORKSPACE_FILE_EXTENSION,
  importWorkspaceSnapshot,
  openWorkspaceFile,
  readWorkspaceFile,
  saveWorkspaceFile,
  saveWorkspaceCsv,
} from "../../utils/workspaceFile";

const THEME_STORAGE_KEY = "gate_qa_theme";
const DOMAIN_SHIFT_SEEN_KEY = "gateqa_domain_shift_notice_seen_v2";
const DOMAIN_SHIFT_TARGET_DATE = "2026-06-14T00:00:00+05:30";
const DOMAIN_SHIFT_IS_COMPLETE = false;
const PRACTICE_BADGE_QUERY_KEYS = [
  "years",
  "subjects",
  "subtopics",
  "types",
  "search",
  "hideSolved",
  "showOnlySolved",
  "showOnlyBookmarked",
];

const navButtonClassName = "inline-flex min-h-[44px] items-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)]";
const navLinkClassName = ({ isActive }) => (
  `inline-flex min-h-[44px] items-center rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
    isActive
      ? "border-sky-700 bg-sky-700 text-white"
      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
  }`
);

const getDomainShiftCountdown = () => {
  if (DOMAIN_SHIFT_IS_COMPLETE) {
    return null;
  }

  const targetTime = new Date(DOMAIN_SHIFT_TARGET_DATE).getTime();
  if (!Number.isFinite(targetTime)) {
    return null;
  }

  const remainingMs = targetTime - Date.now();
  if (remainingMs <= 0) {
    return "Migration day";
  }

  const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  return `${days} ${days === 1 ? "day" : "days"} remaining`;
};

const resolveInitialTheme = () => {
  if (typeof window === "undefined") {
    return { theme: "light", followsSystem: true };
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return { theme: stored, followsSystem: false };
  }

  const canReadSystemTheme = typeof window.matchMedia === "function";
  return {
    theme: canReadSystemTheme && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    followsSystem: true,
  };
};

const applyDocumentTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
};

const readAptitudeBadge = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawValue = window.localStorage.getItem(APTITUDE_ENABLED_STORAGE_KEY);
    return rawValue === "true" || rawValue === "1" ? "Aptitude enabled" : "";
  } catch {
    return "";
  }
};

const getPracticeBadgeLabel = (location) => {
  if (!location.pathname.startsWith(PRACTICE_ROUTE)) {
    return readAptitudeBadge();
  }

  const params = new URLSearchParams(location.search);
  const activeFilterCount = PRACTICE_BADGE_QUERY_KEYS.reduce(
    (count, key) => count + (params.get(key) ? 1 : 0),
    0
  );

  if (activeFilterCount > 0) {
    return `${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"} active`;
  }

  return readAptitudeBadge() || "Practice ready";
};

const summarizeWorkspaceImport = (summary = {}) => {
  const solvedTotal = Number(summary.gateSolved || 0) + Number(summary.aptitudeSolved || 0);
  const savedTotal = Number(summary.gateBookmarked || 0) + Number(summary.aptitudeBookmarked || 0);
  const mockTotal = Number(summary.mockHistory || 0);
  return `Workspace opened: ${solvedTotal} solved, ${savedTotal} saved, ${mockTotal} mock records.`;
};

const AppHeader = ({ onHomeNavigate = null }) => {
  const location = useLocation();
  const initialThemeRef = useRef(resolveInitialTheme());
  const [theme, setTheme] = useState(initialThemeRef.current.theme);
  const [followsSystemTheme, setFollowsSystemTheme] = useState(initialThemeRef.current.followsSystem);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandaloneDisplay, setIsStandaloneDisplay] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDomainShiftOpen, setIsDomainShiftOpen] = useState(false);
  const [domainShiftCountdown, setDomainShiftCountdown] = useState(getDomainShiftCountdown);
  const [drawerStatus, setDrawerStatus] = useState("");
  const workspaceFileInputRef = useRef(null);
  const isMockWindowRoute =
    location.pathname === MOCK_ROUTE || location.pathname.startsWith(`${MOCK_ROUTE}/`);
  const appliedTheme = isMockWindowRoute ? "light" : theme;

  useEffect(() => {
    applyDocumentTheme(appliedTheme);
  }, [appliedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateCountdown = () => {
      setDomainShiftCountdown(getDomainShiftCountdown());
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!domainShiftCountdown || typeof window === "undefined") {
      return;
    }

    try {
      if (window.localStorage.getItem(DOMAIN_SHIFT_SEEN_KEY) === "1") {
        return;
      }
      window.localStorage.setItem(DOMAIN_SHIFT_SEEN_KEY, "1");
    } catch {}

    setIsDomainShiftOpen(true);
    trackEvent("domain_shift_notice_auto_open", { source: "header" });
  }, [domainShiftCountdown]);

  useEffect(() => {
    if (
      !followsSystemTheme
      || typeof window === "undefined"
      || typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event) => {
      setTheme(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleThemeChange);
      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }

    mediaQuery.addListener(handleThemeChange);
    return () => mediaQuery.removeListener(handleThemeChange);
  }, [followsSystemTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const detectStandalone = () => {
      const standaloneByDisplayMode = typeof window.matchMedia === "function"
        && window.matchMedia("(display-mode: standalone)").matches;
      const standaloneByNavigator = window.navigator?.standalone === true;
      setIsStandaloneDisplay(Boolean(standaloneByDisplayMode || standaloneByNavigator));
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      detectStandalone();
    };

    const handleInstalled = () => {
      setInstallPromptEvent(null);
      detectStandalone();
    };

    detectStandalone();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const showHomeNav = location.pathname !== HOME_ROUTE;
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const logoSrc = `${baseUrl}logo.png`;
  const isDarkMode = theme === "dark";
  const themeToggleLabel = useMemo(
    () => (isDarkMode ? "Switch to light mode" : "Switch to dark mode"),
    [isDarkMode]
  );

  const handleToggleTheme = (event) => {
    const nextTheme = isDarkMode ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      setFollowsSystemTheme(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
        setFollowsSystemTheme(false);
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: isDarkMode ? clipPath.reverse() : clipPath,
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isDarkMode
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };










  const handleInstallApp = async () => {
    if (!installPromptEvent || typeof installPromptEvent.prompt !== "function") {
      return;
    }

    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice?.catch(() => null);
    trackEvent("pwa_install_prompt", {
      outcome: choiceResult?.outcome || "dismissed",
      source: "header",
    });

    setInstallPromptEvent(null);
  };

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenDomainShiftNotice = useCallback(() => {
    setIsDomainShiftOpen(true);
    trackEvent("domain_shift_notice_open", { source: "header_countdown" });
  }, []);

  const handleWorkspaceImportResult = useCallback((result) => {
    if (!result?.ok) {
      setDrawerStatus("Workspace could not be opened.");
      trackEvent("workspace_open_failed", {
        reason: result?.reason || "unknown",
      });
      return false;
    }

    setDrawerStatus(summarizeWorkspaceImport(result.summary));
    trackEvent("workspace_open", {
      gateSolved: result.summary?.gateSolved || 0,
      aptitudeSolved: result.summary?.aptitudeSolved || 0,
      mockHistory: result.summary?.mockHistory || 0,
    });

    if (typeof window !== "undefined" && typeof window.location?.reload === "function") {
      const shouldReload = typeof window.confirm === "function"
        ? window.confirm("Workspace opened. Reload GateQA to apply it now?")
        : true;
      if (shouldReload) {
        window.location.reload();
      }
    }

    return true;
  }, []);

  const handleSaveWorkspace = useCallback(async () => {
    setDrawerStatus("Saving workspace...");
    try {
      const result = await saveWorkspaceFile();
      setDrawerStatus(result.method === "native" ? "Workspace saved." : "Workspace downloaded.");
      trackEvent("workspace_save", {
        method: result.method || "unknown",
        gateSolved: result.snapshot?.data?.gate?.solvedQuestions?.length || 0,
        aptitudeSolved: result.snapshot?.data?.aptitude?.solvedQuestions?.length || 0,
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        setDrawerStatus("Save cancelled.");
        return;
      }
      setDrawerStatus("Workspace could not be saved.");
      trackEvent("workspace_save_failed", {
        reason: error?.message || "unknown",
      });
    }
  }, []);

  const handleExportCsv = useCallback(() => {
    setDrawerStatus("Exporting CSV...");
    try {
      saveWorkspaceCsv();
      setDrawerStatus("CSV exported.");
      trackEvent("workspace_csv_export", { source: "drawer" });
    } catch (error) {
      setDrawerStatus("CSV could not be exported.");
      trackEvent("workspace_csv_export_failed", {
        reason: error?.message || "unknown",
      });
    }
  }, []);

  const handleOpenWorkspace = useCallback(async () => {
    if (typeof window !== "undefined" && typeof window.showOpenFilePicker === "function") {
      setDrawerStatus("Opening workspace...");
      try {
        const result = await openWorkspaceFile();
        handleWorkspaceImportResult(result);
      } catch (error) {
        setDrawerStatus(error?.name === "AbortError" ? "Open cancelled." : "Workspace could not be opened.");
        if (error?.name !== "AbortError") {
          trackEvent("workspace_open_failed", {
            reason: error?.message || "unknown",
          });
        }
      }
      return;
    }

    workspaceFileInputRef.current?.click();
  }, [handleWorkspaceImportResult]);

  const handleWorkspaceFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setDrawerStatus("Opening workspace...");
    try {
      const workspace = await readWorkspaceFile(file);
      handleWorkspaceImportResult(importWorkspaceSnapshot(workspace));
    } catch (error) {
      setDrawerStatus("Workspace could not be opened.");
      trackEvent("workspace_open_failed", {
        reason: error?.message || "unknown",
      });
    }
  }, [handleWorkspaceImportResult]);

  const handlePrintPage = useCallback(async () => {
    setDrawerStatus("Preparing PDF...");
    trackEvent("pdf_export", { source: "drawer" });

    try {
      const { exportCurrentPageToPdf } = await import("../../utils/pdfExport");
      const result = await exportCurrentPageToPdf({
        filename: "gateqa-progress-report.pdf",
        title: "GateQA Progress Report",
      });

      if (result.ok) {
        setDrawerStatus("PDF generated.");
        setIsDrawerOpen(false);
        trackEvent("pdf_export_complete", {
          pageCount: result.pageCount || 0,
        });
        return;
      }

      setDrawerStatus(result.reason === "insights_failed"
        ? "No practice data available for PDF."
        : "PDF could not be generated.");
      trackEvent("pdf_export_failed", {
        reason: result.reason || "unknown",
      });
    } catch (error) {
      setDrawerStatus("PDF could not be generated.");
      trackEvent("pdf_export_failed", {
        reason: error?.message || "unknown",
      });
    }
  }, []);

  const handleToggleCalculator = useCallback(() => {
    setIsDrawerOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOGGLE_CALCULATOR_EVENT));
    }
    trackEvent("calculator_toggle", { source: "drawer" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const launchQueue = window.launchQueue;
    if (!launchQueue || typeof launchQueue.setConsumer !== "function") {
      return undefined;
    }

    launchQueue.setConsumer(async (launchParams) => {
      const [fileHandle] = launchParams.files || [];
      if (!fileHandle || typeof fileHandle.getFile !== "function") {
        return;
      }

      setDrawerStatus("Opening workspace...");
      try {
        const file = await fileHandle.getFile();
        const workspace = await readWorkspaceFile(file);
        handleWorkspaceImportResult(importWorkspaceSnapshot(workspace));
      } catch (error) {
        setDrawerStatus("Workspace could not be opened.");
        trackEvent("workspace_open_failed", {
          reason: error?.message || "unknown",
        });
      }
    });

    return undefined;
  }, [handleWorkspaceImportResult]);

  const showInstallButton =
    location.pathname !== HOME_ROUTE
    && !isMockWindowRoute
    && !isStandaloneDisplay
    && Boolean(installPromptEvent);
  const practiceBadgeLabel = getPracticeBadgeLabel(location);
  const canToggleCalculator = location.pathname.startsWith(`${PRACTICE_ROUTE}/question/`);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
          to={HOME_ROUTE}
          className="flex min-w-0 items-center gap-4"
          aria-label="GATE QA home"
        >
          <span className="app-header-logo-frame shrink-0">
            <img
              src={logoSrc}
              alt="GATE QA logo"
              width="64"
              height="64"
              className="logo-icon app-header-logo h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold uppercase tracking-[0.08em] text-sky-700 sm:text-2xl">GATE QA</p>
          </div>
        </Link>
        </div>

        <div className="flex items-center gap-2">
          {showInstallButton ? (
            <button
              type="button"
              onClick={handleInstallApp}
              className="inline-flex min-h-[44px] items-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Install App
            </button>
          ) : null}

          {domainShiftCountdown ? (
            <button
              type="button"
              onClick={handleOpenDomainShiftNotice}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-warning-text)] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:hover:bg-amber-400/10 sm:min-h-[40px] sm:px-3 sm:text-xs"
              aria-label={`Open gateqa.in migration notice, ${domainShiftCountdown}`}
            >
              <FaExclamationTriangle className="size-2.5 text-amber-500 sm:size-3" aria-hidden="true" />
              <span className="whitespace-nowrap">{domainShiftCountdown}</span>
            </button>
          ) : null}

          {!isMockWindowRoute ? (
            <button
              type="button"
              role="switch"
              onClick={handleToggleTheme}
              aria-label={themeToggleLabel}
              aria-checked={isDarkMode}
              className="group relative flex h-8 w-14 cursor-pointer items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-[color:var(--color-text-muted)] pointer-events-none">
                <FiMoon className="h-3.5 w-3.5" />
                <FiSun className="h-3.5 w-3.5" />
              </div>
              <span
                className={`relative inline-block h-6 w-6 transform rounded-full bg-sky-600 shadow-md transition-transform duration-200 ease-in-out ${
                  isDarkMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          ) : null}

          {showHomeNav ? (
            onHomeNavigate ? (
              <button
                type="button"
                onClick={onHomeNavigate}
                className={navButtonClassName}
              >
                Back Home
              </button>
            ) : (
              <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
                <NavLink to={HOME_ROUTE} end className={navLinkClassName}>
                  Back Home
                </NavLink>
              </nav>
            )
          ) : null}
          <HamburgerButton isOpen={isDrawerOpen} onClick={() => setIsDrawerOpen(true)} className="no-print" />
        </div>

      </div>
    </header>
    <input
      ref={workspaceFileInputRef}
      type="file"
      accept={`${WORKSPACE_FILE_EXTENSION},application/json`}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={handleWorkspaceFileChange}
    />
    <GlobalNavigationDrawer
      isOpen={isDrawerOpen}
      onClose={handleCloseDrawer}
      practiceBadgeLabel={practiceBadgeLabel}
      onSaveWorkspace={handleSaveWorkspace}
      onOpenWorkspace={handleOpenWorkspace}
      onExportCsv={handleExportCsv}
      onPrint={handlePrintPage}
      statusMessage={drawerStatus}
    />
    <DomainShiftNotice
      isOpen={isDomainShiftOpen}
      onClose={() => setIsDomainShiftOpen(false)}
    />
    </>
  );
};

export default AppHeader;
