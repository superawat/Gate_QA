import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiZap } from "react-icons/fi";
import { PROFILE_ROUTE } from "../../utils/routes";

/**
 * High-value platform announcements highlighting multi-branch availability,
 * authentic solution coverage, and the profile configuration hub.
 */
export const MARQUEE_UPDATES = [
  {
    id: "multi-branch",
    badge: "New Branches",
    text: "GATE EC, EE, ME & CE now live alongside CS & DA",
    route: PROFILE_ROUTE,
  },

  {
    id: "profile-hub",
    badge: "Profile Hub",
    text: "Personalize your 1–2 preparation disciplines & backup progress",
    route: PROFILE_ROUTE,
  },
  {
    id: "discipline-switching",
    badge: "Multi-Discipline",
    text: "Switch primary & secondary disciplines anytime from Profile",
    route: PROFILE_ROUTE,
  },
  {
    id: "offline-sync",
    badge: "Zero Friction",
    text: "100% offline practice with automatic additive cloud sync",
    route: PROFILE_ROUTE,
  },
];

/**
 * HomeMarquee — a thin, continuously-scrolling announcement strip shown directly
 * below the header on the home page. Informs users of recent major updates,
 * multi-branch support, and the Profile section.
 */
export default function HomeMarquee() {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  const handleItemClick = useCallback(
    (route) => {
      navigate(route || PROFILE_ROUTE);
    },
    [navigate],
  );

  const handleProfileClick = useCallback(() => {
    navigate(PROFILE_ROUTE);
  }, [navigate]);

  const handleTouchStart = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Duplicate items so the seamless loop always has content visible.
  const items = [...MARQUEE_UPDATES, ...MARQUEE_UPDATES];

  return (
    <div
      className={`home-marquee-strip ${isPaused ? "home-marquee-strip--paused" : ""}`}
      role="region"
      aria-label="Platform Updates — Multi-branch support and Profile introduced"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Left fixed badge */}
      <span className="home-marquee-label" aria-hidden="true">
        <FiZap className="home-marquee-icon" aria-hidden="true" />
        <span className="home-marquee-label-text">
          <span className="home-marquee-label-full">WHAT'S NEW</span>
          <span className="home-marquee-label-short">NEW</span>
        </span>
      </span>

      {/* Scrolling track */}
      <div className="home-marquee-overflow">
        <ul className="home-marquee-track" role="list">
          {items.map((item, index) => {
            const isDuplicate = index >= MARQUEE_UPDATES.length;
            return (
              /* eslint-disable-next-line react/no-array-index-key */
              <li key={`${item.id}-${index}`} className="home-marquee-item" aria-hidden={isDuplicate ? "true" : undefined}>
                <button
                  type="button"
                  className="home-marquee-chip"
                  tabIndex={isDuplicate ? -1 : 0}
                  aria-label={`${item.badge}: ${item.text}`}
                  onClick={() => handleItemClick(item.route)}
                >
                  <strong className="font-bold opacity-90 mr-1.5">{item.badge}:</strong>
                  <span>{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right CTA — fixed Profile button */}
      <button
        type="button"
        className="home-marquee-cta"
        onClick={handleProfileClick}
        aria-label="Open Profile and Disciplines"
      >
        <FiUser className="mr-1 text-xs shrink-0" aria-hidden="true" />
        <span className="home-marquee-cta-label">
          <span className="home-marquee-cta-text-full">Profile</span>
          <span className="home-marquee-cta-text-short">Profile</span>
        </span>
        <span className="home-marquee-cta-arrow" aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}
