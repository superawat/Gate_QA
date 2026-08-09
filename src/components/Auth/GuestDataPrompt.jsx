/**
 * GuestDataPrompt.jsx
 * --------------------
 * A subtle, dismissible prompt shown to guest users who have accumulated
 * significant study data (50+ solved questions) encouraging them to sign in
 * and back up their progress.
 *
 * Behaviour:
 *  - Only shows to unauthenticated (guest) users.
 *  - Only shows when solved question count >= PROMPT_THRESHOLD (50).
 *  - Can be permanently dismissed via "Maybe later" (stored in localStorage).
 *  - Dismissal expires after 7 days so the prompt can reappear.
 *  - Does NOT block the UI — rendered as a non-intrusive banner.
 */
import React, { useEffect, useState } from "react";
import { FiHardDrive } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const PROMPT_THRESHOLD = 50;
const DISMISS_KEY = "gate_qa_guest_prompt_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function GuestDataPrompt({ onSignInClick }) {
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    // Don't show to signed-in users
    if (isAuthenticated) {
      setVisible(false);
      return;
    }

    // Read solved questions count from localStorage
    try {
      const rawSolved = localStorage.getItem("gate_qa_solved_questions");
      const solved = rawSolved ? JSON.parse(rawSolved) : {};
      const count = Object.keys(solved).length;
      setSolvedCount(count);

      // Check if user dismissed recently
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISS_COOLDOWN_MS) {
          setVisible(false);
          return;
        }
      }

      // Show prompt if threshold is met
      if (count >= PROMPT_THRESHOLD) {
        setVisible(true);
      }
    } catch {
      // localStorage read failure — silently skip
    }
  }, [isAuthenticated]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleSignIn = () => {
    handleDismiss(); // dismiss the prompt
    onSignInClick(); // open the AuthModal
  };

  if (!visible) return null;

  return (
    <div
      className="guest-data-prompt"
      role="complementary"
      aria-label="Back up your progress"
    >
      <FiHardDrive className="guest-prompt-icon text-sky-500" aria-hidden="true" />
      <p className="guest-prompt-text">
        You have{" "}
        <strong>{solvedCount} solved questions</strong> stored locally.{" "}
        Sign in with Google to back them up for free.
      </p>
      <div className="guest-prompt-actions">
        <button
          id="guest-prompt-signin-btn"
          className="guest-prompt-signin-btn"
          onClick={handleSignIn}
        >
          Back up now
        </button>
        <button
          id="guest-prompt-dismiss-btn"
          className="guest-prompt-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss this prompt for 7 days"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default GuestDataPrompt;
