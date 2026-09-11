import React from "react";
import LoadingState from "./LoadingState";

const MockCatalogLoaderCard = ({
  label = "Loading Mock Test...",
}) => (
  <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center p-6">
    <LoadingState
      label={label}
      ariaLabel="Preparing validated mock catalog..."
      size="lg"
      theme="light"
      textClassName="text-sm font-semibold text-[#4f6276] dark:text-slate-400"
    />
  </div>
);

export default MockCatalogLoaderCard;
