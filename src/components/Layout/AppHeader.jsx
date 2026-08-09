import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaNewspaper } from "react-icons/fa";
import { FiMessageSquare, FiMoon, FiSun } from "react-icons/fi";

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
import { useAuth } from "../../contexts/AuthContext";

const AuthModal = lazy(() => import("../Auth/AuthModal"));
const UserProfileMenu = lazy(() => import("../Auth/UserProfileMenu"));

const THEME_STORAGE_KEY = "gate_qa_theme";
const DOMAIN_SHIFT_SEEN_KEY = "gateqa_domain_shift_notice_seen_v2";
const DOMAIN_SHIFT_TARGET_DATE = "2026-06-14T00:00:00+05:30";
const DOMAIN_SHIFT_IS_COMPLETE = true;
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading: authLoading } = useAuth();
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
      <div className="app-header-inner mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
          to={HOME_ROUTE}
          className="flex min-w-0 items-center gap-2 sm:gap-4"
          aria-label="GATE QA home"
        >
          <span className="app-header-logo-frame shrink-0">
            <img
              src={logoSrc}
              alt="GATE QA logo"
              width="64"
              height="64"
              className="logo-icon app-header-logo h-10 w-10 object-contain sm:h-16 sm:w-16"
            />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold uppercase tracking-[0.08em] text-sky-700 sm:text-2xl">GATE QA</p>
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
            <Link
              to="/gate-cse-2027-syllabus-changes"
              aria-label="GATE 2027 Syllabus Changes — read what changed"
              title="GATE 2027 Syllabus Changes"
              className="header-secondary-action relative hidden h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 transition hover:scale-110 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/40 sm:inline-flex"
            >
              <FaNewspaper className="h-4 w-4" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </Link>
          ) : null}

          {!isMockWindowRoute ? (
            <a
              href="https://forms.gle/nAYEKBkMsfamhtPK7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Give feedback"
              className="header-secondary-action relative hidden h-8 w-8 items-center justify-center rounded-full border border-violet-300 bg-violet-50 text-violet-600 transition hover:scale-110 hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-400 dark:hover:bg-violet-900/40 sm:inline-flex"
            >
              <FiMessageSquare className="h-4 w-4" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
            </a>
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

          {/* ── Sign In / User Avatar ── */}
          {!isMockWindowRoute && !authLoading && (
            <Suspense fallback={null}>
              {user ? (
                <UserProfileMenu />
              ) : (
                <button
                  id="header-signin-btn"
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  aria-label="Sign in with Google to back up your progress"
                  title="Sign in"
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2C36.9 40.5 44 35 44 24c0-1.3-.1-2.7-.4-3.9z"/>
                  </svg>
                  <span>Sign in</span>
                </button>
              )}
            </Suspense>
          )}

          {showHomeNav && onHomeNavigate && (
            <button
              type="button"
              onClick={onHomeNavigate}
              className={navButtonClassName}
            >
              Back Home
            </button>
          )}
          {showHomeNav && !onHomeNavigate && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              <NavLink to={HOME_ROUTE} end className={navLinkClassName}>
                Back Home
              </NavLink>
            </nav>
          )}
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
    {showAuthModal && (
      <Suspense fallback={null}>
        <AuthModal onClose={() => setShowAuthModal(false)} />
      </Suspense>
    )}
    </>
  );
};

export default AppHeader;
