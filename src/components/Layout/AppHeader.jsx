import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";

import { HOME_ROUTE, MOCK_ROUTE } from "../../utils/routes";
import { trackEvent } from "../../utils/analytics";

const THEME_STORAGE_KEY = "gate_qa_theme";

const navButtonClassName = "inline-flex min-h-[44px] items-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)]";
const navLinkClassName = ({ isActive }) => (
  `inline-flex min-h-[44px] items-center rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
    isActive
      ? "border-sky-700 bg-sky-700 text-white"
      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
  }`
);

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

const AppHeader = ({ onHomeNavigate = null }) => {
  const location = useLocation();
  const initialThemeRef = useRef(resolveInitialTheme());
  const [theme, setTheme] = useState(initialThemeRef.current.theme);
  const [followsSystemTheme, setFollowsSystemTheme] = useState(initialThemeRef.current.followsSystem);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandaloneDisplay, setIsStandaloneDisplay] = useState(false);
  const isMockWindowRoute =
    location.pathname === MOCK_ROUTE || location.pathname.startsWith(`${MOCK_ROUTE}/`);
  const appliedTheme = isMockWindowRoute ? "light" : theme;

  useEffect(() => {
    applyDocumentTheme(appliedTheme);
  }, [appliedTheme]);

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

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setTheme(nextTheme);
    setFollowsSystemTheme(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
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

  const showInstallButton = !isMockWindowRoute && !isStandaloneDisplay && Boolean(installPromptEvent);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
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
            <p className="text-lg font-semibold uppercase tracking-[0.28em] text-sky-700 sm:text-2xl">GATE QA</p>
          </div>
        </Link>

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
        </div>

      </div>
    </header>
  );
};

export default AppHeader;
