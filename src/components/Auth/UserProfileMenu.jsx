/**
 * UserProfileMenu.jsx
 * --------------------
 * Header avatar button that shows the signed-in user's profile
 * and provides quick access to discipline hub, cloud sync status,
 * and sign-out. Optimized for both desktop and mobile viewports.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  FiLogOut,
  FiCheck,
  FiRefreshCw,
  FiCloud,
  FiUser,
  FiChevronRight,
  FiCheckSquare,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { PROFILE_ROUTE, TRACKER_ROUTE } from "../../utils/routes";
import { readBranchPreferences } from "../../utils/branchPreference";

function formatSyncTime(date) {
  if (!date) return null;
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(date).toLocaleDateString();
}

function UserProfileMenu() {
  const { user, signOut, isSyncing, lastSyncedAt, triggerSync } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Get user display info from Google OAuth metadata
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl = user?.user_metadata?.avatar_url || null;

  // First letter(s) for fallback avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // Active branch preferences for contextual candidate badge
  const { activeBranch } = readBranchPreferences();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleManualSync = (e) => {
    e.stopPropagation();
    if (triggerSync && user?.id) {
      triggerSync(user.id, { force: true });
    }
  };

  return (
    <div className="user-profile-menu relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        id="user-profile-menu-btn"
        className="user-avatar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Signed in as ${displayName}. Open profile menu.`}
        title={displayName}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="user-avatar-img"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="user-avatar-initials" aria-hidden="true">
            {initials}
          </span>
        )}
        {/* Online indicator dot */}
        <span className="user-avatar-online-dot" aria-hidden="true" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="user-profile-backdrop sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="user-profile-dropdown"
          role="menu"
          aria-label="Profile menu"
        >
          {/* User Info Header Card */}
          <div className="user-profile-info">
            <div className="user-profile-avatar-row">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="user-profile-thumb-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="user-profile-thumb-initials" aria-hidden="true">
                  {initials}
                </span>
              )}
              <div className="user-profile-details">
                <p className="user-profile-name" title={displayName}>
                  {displayName}
                </p>
                <p className="user-profile-email" title={user?.email}>
                  {user?.email}
                </p>
                {activeBranch && (
                  <span className="user-profile-branch-badge">
                    {activeBranch.toUpperCase()} Aspirant
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cloud Sync Status Indicator */}
          <div className="user-profile-sync-status">
            {isSyncing ? (
              <>
                <div className="user-sync-icon-pill syncing">
                  <FiRefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                </div>
                <div className="user-sync-text-group">
                  <span className="user-sync-title text-sky-600 dark:text-sky-400">
                    Syncing to cloud...
                  </span>
                  <span className="user-sync-subtitle">Updating progress</span>
                </div>
              </>
            ) : (
              <>
                <div className="user-sync-icon-pill">
                  <FiCloud className="h-3.5 w-3.5 shrink-0" />
                  <FiCheck className="user-sync-check-icon" />
                </div>
                <div className="user-sync-text-group">
                  <div className="user-sync-title-row">
                    <span className="user-sync-title">Data Synced to Cloud</span>
                    {lastSyncedAt && (
                      <span className="user-sync-time">
                        {formatSyncTime(lastSyncedAt)}
                      </span>
                    )}
                  </div>
                  <span className="user-sync-subtitle">
                    Notes, bookmarks &amp; tests backed up
                  </span>
                </div>
                <button
                  type="button"
                  id="user-manual-sync-btn"
                  className="user-sync-action-btn"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  title="Sync now"
                  aria-label="Sync with cloud now"
                >
                  <FiRefreshCw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          <div className="user-profile-divider" role="separator" />

          {/* Navigation Action Group */}
          <div className="user-profile-nav-group">
            {/* Profile & Disciplines Hub */}
            <a
              id="user-profile-hub-link"
              href={PROFILE_ROUTE}
              className="user-profile-menu-item group"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <div className="user-profile-item-icon bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                <FiUser className="h-4 w-4 shrink-0" />
              </div>
              <div className="user-profile-item-text">
                <span className="user-profile-item-title">Profile &amp; Disciplines</span>
                <span className="user-profile-item-desc">Change papers &amp; track settings</span>
              </div>
              <FiChevronRight className="user-profile-item-arrow" />
            </a>

            {/* Preparation Tracker Quick Action */}
            <a
              id="user-profile-tracker-link"
              href={TRACKER_ROUTE}
              className="user-profile-menu-item group"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <div className="user-profile-item-icon bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <FiCheckSquare className="h-4 w-4 shrink-0" />
              </div>
              <div className="user-profile-item-text">
                <span className="user-profile-item-title">Preparation Tracker</span>
                <span className="user-profile-item-desc">Syllabus checklist &amp; coverage</span>
              </div>
              <FiChevronRight className="user-profile-item-arrow" />
            </a>
          </div>

          <div className="user-profile-divider" role="separator" />

          {/* Sign Out */}
          <button
            id="user-signout-btn"
            className="user-signout-btn group"
            onClick={handleSignOut}
            role="menuitem"
          >
            <div className="user-profile-item-icon bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/40 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              <FiLogOut className="h-4 w-4 shrink-0" />
            </div>
            <div className="user-profile-item-text">
              <span className="user-profile-item-title group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Sign out
              </span>
            </div>
          </button>

          {/* Local-first Zero Data Loss Reassurance */}
          <div className="user-profile-note-wrapper">
            <FiShield className="user-profile-note-icon" aria-hidden="true" />
            <p className="user-profile-note">
              Your local progress is preserved after sign-out.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileMenu;
