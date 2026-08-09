/**
 * AuthModal.jsx
 * -------------
 * Sign-in dialog that appears when the user clicks "Sign in with Google".
 *
 * Features:
 *  - Google OAuth sign-in button
 *  - Clear data privacy summary ("your data stays on your device")
 *  - Dismissible via backdrop click or Escape key
 *  - Accessible: focus trap + aria attributes
 */
import React, { useEffect, useRef, useState } from "react";
import { FiCloud, FiLock, FiRefreshCw, FiShield, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

function AuthModal({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const modalRef = useRef(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus the modal on open for accessibility
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setSignInError("");
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        setSignInError("Google sign-in could not start. Please try again.");
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error("[GateQA Auth] Google sign-in failed:", error);
      setSignInError("Google sign-in could not start. Please try again.");
      setIsSigningIn(false);
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="auth-modal-card"
        ref={modalRef}
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        {/* Close button */}
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close sign in dialog"
        >
          <FiX size={18} />
        </button>

        {/* Header */}
        <div className="auth-modal-header flex flex-col items-center">
          <div className="auth-modal-icon-badge flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 mb-3 border border-sky-500/20">
            <FiLock size={22} />
          </div>
          <h2 id="auth-modal-title" className="auth-modal-title">
            Sign in to GateQA
          </h2>
          <p className="auth-modal-subtitle">
            Back up your progress. Study across any device.
          </p>
        </div>

        {/* Benefits list */}
        <ul className="auth-modal-benefits" aria-label="Sign-in benefits">
          <li>
            <FiCloud className="auth-benefit-icon text-sky-500" aria-hidden="true" />
            <span>Sync bookmarks, notes &amp; solved progress across devices</span>
          </li>
          <li>
            <FiRefreshCw className="auth-benefit-icon text-emerald-500" aria-hidden="true" />
            <span>Never lose your data if you clear your browser</span>
          </li>
          <li>
            <FiShield className="auth-benefit-icon text-indigo-500" aria-hidden="true" />
            <span>Guest Mode remains available — sign in is always optional</span>
          </li>
        </ul>

        {/* Google Sign-In Button */}
        <button
          id="auth-google-signin-btn"
          type="button"
          className="auth-google-btn"
          onClick={handleSignIn}
          disabled={isSigningIn}
          aria-busy={isSigningIn}
        >
          <GoogleIcon />
          <span>{isSigningIn ? "Opening Google…" : "Continue with Google"}</span>
        </button>
        {signInError ? <p className="auth-modal-error" role="alert">{signInError}</p> : null}

        {/* Privacy note */}
        <p className="auth-modal-privacy">
          By signing in, you agree to our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          . Your existing local data is{" "}
          <strong>never deleted</strong> — it is merged and backed up to your account.
        </p>
      </div>
    </div>
  );
}

// Google "G" logo SVG
function GoogleIcon() {
  return (
    <svg
      className="auth-google-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      width="20"
      height="20"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2C36.9 40.5 44 35 44 24c0-1.3-.1-2.7-.4-3.9z"
      />
    </svg>
  );
}

export default AuthModal;
