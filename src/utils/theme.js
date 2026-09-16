import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "gate_qa_theme";
export const THEME_CHANGE_EVENT = "gateqa:theme-changed";

export const resolveInitialTheme = () => {
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

export const applyDocumentTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#0d1117" : "#f9fafb");
  }
};

export const toggleTheme = (currentTheme, event) => {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  const commitTheme = () => {
    applyDocumentTheme(nextTheme);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        window.dispatchEvent(
          new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: nextTheme } })
        );
      } catch (_) {}
    }
  };

  if (typeof document === "undefined" || !document.startViewTransition) {
    commitTheme();
    return nextTheme;
  }

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  try {
    const transition = document.startViewTransition(() => {
      commitTheme();
    });

    transition?.ready?.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: currentTheme === "dark" ? clipPath.reverse() : clipPath,
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: currentTheme === "dark" ? "::view-transition-old(root)" : "::view-transition-new(root)",
        }
      );
    }).catch(() => {});
  } catch (_) {
    commitTheme();
  }

  return nextTheme;
};

export const useTheme = () => {
  const [themeState, setThemeState] = useState(resolveInitialTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleThemeChanged = (event) => {
      const nextTheme = event?.detail?.theme;
      if (nextTheme === "light" || nextTheme === "dark") {
        setThemeState({ theme: nextTheme, followsSystem: false });
        applyDocumentTheme(nextTheme);
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        const nextTheme = event.newValue === "dark" ? "dark" : "light";
        setThemeState({ theme: nextTheme, followsSystem: false });
        applyDocumentTheme(nextTheme);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleToggle = (event) => {
    const nextTheme = toggleTheme(themeState.theme, event);
    setThemeState({ theme: nextTheme, followsSystem: false });
  };

  return {
    theme: themeState.theme,
    isDarkMode: themeState.theme === "dark",
    toggleTheme: handleToggle,
  };
};
