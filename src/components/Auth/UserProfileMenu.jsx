/**
 * UserProfileMenu.jsx
 * --------------------
 * Header avatar button that shows the signed-in user's profile
 * and provides sign-out. Replaces the "Sign In" button when authenticated.
 *
 * Features:
 *  - Shows avatar (from Google) or initials fallback
 *  - Dropdown: user's name, email, sign-out button
 *  - Click outside to close
 *  - Accessible: aria-expanded, aria-label
 */
import React, { useEffect, useRef, useState } from "react";
import { FiLogOut, FiCheck, FiRefreshCw, FiCloud } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

function UserProfileMenu() {
  const { user, signOut, isSyncing } = useAuth();
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
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  return (
    <div className="user-profile-menu" ref={menuRef}>
      {/* Avatar Button */}
      <button
        id="user-profile-menu-btn"
        className="user-avatar-btn"
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="user-profile-dropdown"
          role="menu"
          aria-label="Profile menu"
        >
          {/* User Info */}
          <div className="user-profile-info">
            <p className="user-profile-name">{displayName}</p>
            <p className="user-profile-email">{user?.email}</p>
          </div>

          {/* Cloud Sync Status Indicator */}
          <div className="user-profile-sync-status">
            {isSyncing ? (
              <>
                <FiRefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400 shrink-0" />
                <div className="user-sync-text-group">
                  <span className="user-sync-title">Syncing to cloud...</span>
                  <span className="user-sync-subtitle">Updating progress</span>
                </div>
              </>
            ) : (
              <>
                <div className="user-sync-icon-wrapper">
                  <FiCloud className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <FiCheck className="user-sync-check-icon" />
                </div>
                <div className="user-sync-text-group">
                  <span className="user-sync-title">Data Synced to Cloud</span>
                  <span className="user-sync-subtitle">Notes, bookmarks & tests backed up</span>
                </div>
              </>
            )}
          </div>

          <div className="user-profile-divider" role="separator" />

          {/* Sign Out */}
          <button
            id="user-signout-btn"
            className="user-signout-btn"
            onClick={handleSignOut}
            role="menuitem"
          >
            <FiLogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>

          <p className="user-profile-note">
            Your local progress is preserved after sign-out.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserProfileMenu;
