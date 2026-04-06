import React from "react";

import Footer from "../Footer/Footer";
import AppHeader from "./AppHeader";

const PageShell = ({
  children,
  contentClassName = "",
  showFooter = true,
  onResume = null,
  resumeLabel = "",
}) => (
  <div className="min-h-screen bg-[color:var(--color-bg)] text-slate-900">
    <AppHeader onResume={onResume} resumeLabel={resumeLabel} />
    <main className={`mx-auto w-full max-w-7xl px-4 pt-6 pb-3 sm:px-6 lg:px-8 ${contentClassName}`}>
      {children}
    </main>
    {showFooter ? <Footer /> : null}
  </div>
);

export default PageShell;
