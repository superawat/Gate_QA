import React from "react";
import BrandLoader from "./BrandLoader";
import HorizontalBarLoader from "./HorizontalBarLoader";

/**
 * Global rollback killswitch:
 * Set to true to instantly revert all LoadingState instances across the app to the legacy HorizontalBarLoader.
 */
export const FORCE_LEGACY_LOADER = false;

const LEGACY_SIZE_MAP = {
  xs: { width: 48, height: 12 },
  sm: { width: 72, height: 18 },
  md: { width: 96, height: 24 },
  lg: { width: 120, height: 30 },
  xl: { width: 144, height: 36 },
};

const LoadingState = ({
  label = "Loading...",
  sublabel,
  ariaLabel,
  size = "md",
  layout = "stacked",
  variant = "brand",
  theme = "auto",
  className = "",
  textClassName = "",
  loaderProps = {},
}) => {
  const useLegacy = FORCE_LEGACY_LOADER || variant === "legacy";

  if (useLegacy) {
    const dimensions = LEGACY_SIZE_MAP[size] || LEGACY_SIZE_MAP.md;
    const TextTag = layout === "inline" ? "span" : "p";

    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel || label}
        className={`flex ${
          layout === "inline"
            ? "items-center gap-2"
            : "flex-col items-center justify-center gap-4"
        } ${className}`}
      >
        <HorizontalBarLoader
          width={dimensions.width}
          height={dimensions.height}
          trackColor="#cbd5e1"
          barColor="#0f172a"
          aria-label={ariaLabel || label}
          {...loaderProps}
        />
        {label ? <TextTag className={textClassName}>{label}</TextTag> : null}
      </div>
    );
  }

  const isInline = layout === "inline";
  const brandSize = isInline && size === "sm" ? "xs" : size;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || label}
      className={`flex ${
        isInline
          ? "items-center gap-2"
          : "flex-col items-center justify-center gap-2.5 sm:gap-3.5 py-3 sm:py-4"
      } ${className}`}
    >
      <BrandLoader size={brandSize} theme={theme} alt={ariaLabel || label} />
      {label && (
        <div className={isInline ? "" : "text-center px-4"}>
          <p className={`font-medium tracking-tight ${textClassName || "text-xs sm:text-sm text-slate-700 dark:text-slate-200"}`}>
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
