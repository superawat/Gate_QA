import React from "react";
import { FaChartLine, FaCompass, FaHome, FaFire } from "react-icons/fa";
import { NavLink } from "react-router-dom";

import {
  HOME_ROUTE,
  INSIGHTS_ROUTE,
  PRACTICE_ROUTE,
  HIGH_PRIORITY_TOPICS_ROUTE,
} from "../../utils/routes";
import { preloadRouteByPath } from "../../utils/routePreload";

const navLinkClassName = ({ isActive }) => (
  `flex min-h-[56px] flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
    isActive
      ? "bg-sky-700 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`
);

const navItems = [
  {
    label: "Home",
    to: HOME_ROUTE,
    icon: FaHome,
  },
  {
    label: "Explore",
    to: PRACTICE_ROUTE,
    icon: FaCompass,
  },
  {
    label: "Progress",
    to: INSIGHTS_ROUTE,
    icon: FaChartLine,
  },
  {
    label: "Priority",
    to: HIGH_PRIORITY_TOPICS_ROUTE,
    icon: FaFire,
  },
];


const MobileBottomNav = () => (
  <nav
    aria-label="Mobile navigation"
    className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 px-3 py-3 backdrop-blur md:hidden"
  >
    <div className="mx-auto flex w-full max-w-7xl items-center gap-2 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const handlePreload = () => {
          void preloadRouteByPath(item.to);
        };

        return (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === HOME_ROUTE}
            className={navLinkClassName}
            onPointerEnter={handlePreload}
            onFocus={handlePreload}
            onTouchStart={handlePreload}
            unstable_viewTransition
          >
            <Icon className="text-base" aria-hidden="true" />
            <span className="mt-1">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export default MobileBottomNav;
