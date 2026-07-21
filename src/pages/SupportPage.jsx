import React from "react";
import { useNavigate } from "react-router-dom";

import PageShell from "../components/Layout/PageShell";
import SEOHead from "../components/SEO/SEOHead";
import SupportModal from "../components/Footer/SupportModal";
import { HOME_ROUTE } from "../utils/routes";

const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Support GATE QA"
        description="Support GATE QA and help keep free GATE preparation resources available to everyone."
        path="/support"
      />
      <PageShell>
        <SupportModal
          isOpen
          onClose={() => navigate(HOME_ROUTE, { replace: true })}
        />
      </PageShell>
    </>
  );
};

export default SupportPage;
