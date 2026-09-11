import React from "react";
import LoadingState from "./LoadingState";

/**
 * Replaced legacy CsTopicLoader with the unified BrandLoader.
 * Ensures that any consumer or cached bundle strictly renders
 * the official GateQA brand animated loader.
 */
const CsTopicLoader = ({
  label = "Loading Mock Test...",
  ariaLabel = "Preparing validated mock catalog...",
  className = "",
  textClassName = "text-sm font-semibold text-[#4f6276] dark:text-slate-400",
}) => (
  <LoadingState
    label={label}
    ariaLabel={ariaLabel}
    size="lg"
    className={className}
    textClassName={textClassName}
  />
);

export default CsTopicLoader;
