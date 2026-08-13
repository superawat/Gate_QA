import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "./AuthModal";

const FIRST_VISIT_KEY = "gateqa_auth_announcement_seen_v1";
const SUCCESS_ANNOUNCEMENT_KEY = "gateqa_auth_success_announcement_seen_v1";
const DA_ANNOUNCEMENT_KEY = "gateqa_da_questions_announcement_seen_v1";

const assetUrl = (filename) => {
  const base = String(import.meta.env.BASE_URL || "/");
  return `${base.endsWith("/") ? base : `${base}/`}images/announcements/${filename}`;
};

function AuthAnnouncementManager() {
  const { user, loading: authLoading } = useAuth();
  // Keep all product and auth notices in one state slot so two overlays can
  // never render on top of each other.
  const [announcement, setAnnouncement] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingBackupRef = useRef(false);
  const daShownThisMountRef = useRef(false);
  const isLighthouseAudit = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("lhci") === "1";

  useEffect(() => {
    if (isLighthouseAudit || typeof window === "undefined") return;

    try {
      if (window.localStorage.getItem(DA_ANNOUNCEMENT_KEY) === "1") return;
      // Mark before rendering so a refresh or StrictMode re-run cannot show it twice.
      window.localStorage.setItem(DA_ANNOUNCEMENT_KEY, "1");
      daShownThisMountRef.current = true;
      setAnnouncement("da");
    } catch {
      // Storage failures must never block the app from loading.
      daShownThisMountRef.current = true;
      setAnnouncement("da");
    }
  }, [isLighthouseAudit]);

  useEffect(() => {
    if (authLoading || user || !supabase || isLighthouseAudit || typeof window === "undefined") return;
    try {
      // If DA was shown during this mount, defer sign-in until a later visit.
      // A previously seen DA notice may still allow the existing sign-in notice.
      if (daShownThisMountRef.current || window.localStorage.getItem(FIRST_VISIT_KEY) === "1") return;
      window.localStorage.setItem(FIRST_VISIT_KEY, "1");
      setAnnouncement("welcome");
    } catch {
      // Storage failures must never block Guest Mode.
    }
  }, [authLoading, user, isLighthouseAudit]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleSignedIn = () => {
      pendingBackupRef.current = true;
      setAnnouncement(null);
      setShowAuthModal(false);
    };
    const handleSyncComplete = () => {
      if (!pendingBackupRef.current || !user) return;

      try {
        if (window.localStorage.getItem(SUCCESS_ANNOUNCEMENT_KEY) === "1") {
          pendingBackupRef.current = false;
          return;
        }
        // Mark it before rendering so closing the popup prevents repeat displays.
        window.localStorage.setItem(SUCCESS_ANNOUNCEMENT_KEY, "1");
      } catch {
        // Storage failures must not hide a successful sign-in confirmation.
      }

      pendingBackupRef.current = false;
      setAnnouncement("success");
    };

    window.addEventListener("gateqa:auth-signed-in", handleSignedIn);
    window.addEventListener("gateqa:sync-complete", handleSyncComplete);
    return () => {
      window.removeEventListener("gateqa:auth-signed-in", handleSignedIn);
      window.removeEventListener("gateqa:sync-complete", handleSyncComplete);
    };
  }, [user]);

  const closeAnnouncement = () => setAnnouncement(null);
  if (!announcement && !showAuthModal) return null;

  return (
    <>
      {announcement ? (
        <div
          className="auth-announcement-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-announcement-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAnnouncement();
          }}
        >
          <div className="auth-announcement-card">
            <button type="button" className="auth-announcement-close" onClick={closeAnnouncement} aria-label="Close announcement">
              <FiX aria-hidden="true" />
            </button>
            {announcement === "da" ? (
              <>
                <img
                  className="auth-announcement-da-image"
                  src={assetUrl("gate_da.png")}
                  alt="GATE DA filter announcement"
                  width="625"
                  height="155"
                  decoding="async"
                />
                <p className="auth-announcement-eyebrow">New question bank</p>
                <h2 id="auth-announcement-title" className="auth-announcement-title">GATE DA questions are here</h2>
                <p className="auth-announcement-copy">
                  We&apos;ve added GATE Data Science &amp; AI questions from 2024–2026.
                  Turn on the GATE DA filter to include them in your practice list.
                </p>
                <button type="button" className="auth-announcement-primary" onClick={closeAnnouncement}>
                  Got it
                </button>
              </>
            ) : (
              <img
                className="auth-announcement-image"
                src={assetUrl(announcement === "welcome" ? "cat1.webp" : "cat2.webp")}
                alt={announcement === "welcome" ? "Cat holding a note" : "Cat pointing at a watch"}
              />
            )}
            {announcement === "da" ? null : announcement === "welcome" ? (
              <>
                <p className="auth-announcement-eyebrow">A little backup for your hard work</p>
                <h2 id="auth-announcement-title" className="auth-announcement-title">Sign in is now available</h2>
                <p className="auth-announcement-copy">
                  Sign in optionally to back up your GateQA progress and continue studying across devices.
                  Your guest data stays safe either way.
                </p>
                <div className="auth-announcement-actions">
                  <button type="button" className="auth-announcement-primary" onClick={() => { closeAnnouncement(); setShowAuthModal(true); }}>
                    Sign in with Google
                  </button>
                  <button type="button" className="auth-announcement-secondary" onClick={closeAnnouncement}>Maybe later</button>
                </div>
              </>
            ) : (
              <>
                <p className="auth-announcement-eyebrow auth-announcement-success-eyebrow"><FiClock aria-hidden="true" /> Time to prepare</p>
                <h2 id="auth-announcement-title" className="auth-announcement-title">You&apos;re signed in!</h2>
                <p className="auth-announcement-copy">
                  Your GateQA progress is safely backed up. Keep practicing normally—we&apos;ll keep your progress ready across your devices.
                </p>
                <button type="button" className="auth-announcement-primary" onClick={closeAnnouncement}>Continue preparing</button>
              </>
            )}
          </div>
        </div>
      ) : null}
      {showAuthModal ? <AuthModal onClose={() => setShowAuthModal(false)} /> : null}
    </>
  );
}

export default AuthAnnouncementManager;
