import React, { useState, useEffect } from "react";

const LOADER_SIZES = {
  // Each entry: mobile → sm+ → md+
  xs: "w-5 h-5 sm:w-6 sm:h-6",
  sm: "w-7 h-7 sm:w-9 sm:h-9",
  md: "w-10 h-10 sm:w-12 sm:h-12",
  lg: "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
  xl: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
};

export default function BrandLoader({
  size = "md",
  theme = "auto", // "auto" | "dark" | "light"
  className = "",
  alt = "Loading GateQA...",
}) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof theme === "string" && theme !== "auto") return theme;
    if (typeof document !== "undefined") {
      const docTheme = document.documentElement.getAttribute("data-theme");
      if (docTheme) return docTheme === "light" ? "light" : "dark";
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }
    return "dark";
  });

  useEffect(() => {
    if (theme !== "auto") {
      setCurrentTheme(theme);
      return;
    }

    const checkTheme = () => {
      const docTheme = document.documentElement.getAttribute("data-theme");
      if (docTheme) {
        setCurrentTheme(docTheme === "light" ? "light" : "dark");
      } else if (window.matchMedia) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setCurrentTheme(prefersDark ? "dark" : "light");
      }
    };

    checkTheme();

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === "data-theme") {
            checkTheme();
            break;
          }
        }
      });

      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, [theme]);

  const sizeClass = LOADER_SIZES[size] || LOADER_SIZES.md;
  const imageSrc = currentTheme === "light"
    ? "/images/loaders/gateqa_loader_light.webp"
    : "/images/loaders/gateqa_loader_dark.webp";

  // Pixel hint for browser: scales with size tier, smaller default on mobile
  const pxHint = size === "xs" ? 20 : size === "sm" ? 28 : size === "md" ? 40 : size === "lg" ? 56 : 64;

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={pxHint}
      height={pxHint}
      className={`inline-block select-none pointer-events-none object-contain ${sizeClass} ${className}`}
      loading="eager"
      decoding="sync"
    />
  );
}
