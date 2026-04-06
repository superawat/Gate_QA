import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { HOME_ROUTE } from "../../utils/routes";

const navButtonClassName = "inline-flex min-h-[44px] items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50";
const navLinkClassName = ({ isActive }) => (
  `inline-flex min-h-[44px] items-center rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${
    isActive
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
  }`
);

const AppHeader = ({ onHomeNavigate = null }) => {
  const location = useLocation();
  const showHomeNav = location.pathname !== HOME_ROUTE;
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const logoSrc = `${baseUrl}logo.png`;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <Link
          to={HOME_ROUTE}
          className="flex min-w-0 items-center gap-4"
          aria-label="Go to home page"
        >
          <img
            src={logoSrc}
            alt="GATE QA logo"
            width="64"
            height="64"
            className="logo-icon h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold uppercase tracking-[0.28em] text-sky-700 sm:text-2xl">GATE QA</p>
          </div>
        </Link>

        {showHomeNav ? (
          <div className="flex items-center gap-2">
            {onHomeNavigate ? (
              <button
                type="button"
                onClick={onHomeNavigate}
                className={navButtonClassName}
              >
                Back Home
              </button>
            ) : (
              <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
                <NavLink to={HOME_ROUTE} end className={navLinkClassName}>
                  Back Home
                </NavLink>
              </nav>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default AppHeader;
