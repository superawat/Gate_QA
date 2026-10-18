import React from "react";

import Footer from "../Footer/Footer";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";

const PageShell = ({
  children,
  contentClassName = "",
  showHeader = true,
  showFooter = true,
  showMobileBottomNav = true,
  onResume = null,
  resumeLabel = "",
  subHeader = null,
  fluid = false,
}) => (
  <div className="flex min-h-[100dvh] min-w-0 flex-col overflow-x-hidden bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>
    {showHeader ? <AppHeader onResume={onResume} resumeLabel={resumeLabel} /> : null}
    {subHeader ?? null}
    <main
      id="main-content"
      className={`flex-1 mx-auto w-full min-w-0 ${
        fluid
          ? "max-w-[1920px] px-3 sm:px-6 md:px-8"
          : "max-w-7xl px-4 sm:px-6 lg:px-8"
      } md:pb-6 ${
        showHeader
          ? "pt-4 sm:pt-6"
          : "pt-[calc(0.5rem+env(safe-area-inset-top,0px))] sm:pt-4"
      } ${contentClassName}`}
    >
      {children}
    </main>
    {showMobileBottomNav ? <MobileBottomNav /> : null}
    {showFooter ? (
      <div className={showMobileBottomNav ? "hidden md:block" : ""}>
        <Footer />
      </div>
    ) : null}
  </div>
);

export default PageShell;
