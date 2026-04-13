import React from "react";

import Footer from "../Footer/Footer";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";

const PageShell = ({
  children,
  contentClassName = "",
  showFooter = true,
  onResume = null,
  resumeLabel = "",
}) => (
  <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>
    <AppHeader onResume={onResume} resumeLabel={resumeLabel} />
    <main
      id="main-content"
      className={`mx-auto w-full max-w-7xl px-4 pt-6 pb-24 sm:px-6 md:pb-6 lg:px-8 ${contentClassName}`}
    >
      {children}
    </main>
    <MobileBottomNav />
    {showFooter ? <Footer /> : null}
  </div>
);

export default PageShell;
