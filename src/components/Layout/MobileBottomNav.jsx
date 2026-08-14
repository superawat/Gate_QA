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
  `flex min-h-[48px] flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all active:scale-[0.95] ${
    isActive
      ? "bg-sky-700 text-white shadow-sm font-bold"
      : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)]"
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
    className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur shadow-lg md:hidden"
  >
    <div className="mx-auto flex w-full max-w-lg items-center justify-around gap-1">
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
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export default MobileBottomNav;
