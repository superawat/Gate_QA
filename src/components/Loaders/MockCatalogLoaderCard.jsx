import React from "react";

import CsTopicLoader from "./CsTopicLoader";

const MockCatalogLoaderCard = ({
  label = "",
}) => (
  <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-6">
    <div className="w-full max-w-md rounded-lg border border-[#c5d4e2] bg-white p-6 shadow-sm sm:p-7">
      <CsTopicLoader
        label={label}
        ariaLabel="Preparing validated mock catalog..."
        className="min-h-[180px]"
        textClassName="text-sm text-[#4f6276]"
      />
    </div>
  </div>
);

export default MockCatalogLoaderCard;
