import React from "react";

import HorizontalBarLoader from "./HorizontalBarLoader";

const SIZE_MAP = {
  sm: { width: 72, height: 18 },
  md: { width: 96, height: 24 },
  lg: { width: 120, height: 30 },
};

const LoadingState = ({
  label = "Loading...",
  ariaLabel,
  size = "md",
  layout = "stacked",
  className = "",
  textClassName = "",
  loaderProps = {},
}) => {
  const dimensions = SIZE_MAP[size] || SIZE_MAP.md;
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
};

export default LoadingState;
