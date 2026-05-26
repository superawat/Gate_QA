import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaBolt, FaFire, FaShieldAlt, FaStar, FaTrophy } from "react-icons/fa";
import { loadStudyActivityFast } from "../../utils/weakTopicAnalyzer";
import { useDailyGoal } from "../../hooks/useDailyGoal";

const StatPill = ({ icon: Icon, value, label, tone = "neutral" }) => (
  <div className={`home-streak-pill home-streak-pill--${tone}`}>
    <Icon size={13} />
    <span className="home-streak-pill-value">{value}</span>
    <span className="home-streak-pill-label">{label}</span>
  </div>
);

const BottomTag = ({ children }) => (
  <span className="home-streak-tag">
    <FaStar size={10} />
    {children}
  </span>
);

const formatAura = (aura) => {
  const numeric = Number(aura || 0);
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}k`;
  return String(numeric);
};

const getMotivationalText = (streak) => {
  if (Number(streak || 0) === 0) return "Start a new streak today! 💪";
  if (streak === 1) return "Great start. Come back tomorrow.";
  return "Keep your streak moving today.";
};

const normalizeBadgeLabel = (badge = "") => {
  const normalized = String(badge || "").trim().toLowerCase();
  if (normalized === "hard practice") return "Hard Practice";
  if (normalized === "25 attempts") return "25 attempts";
  return "";
};

const StreakBanner = () => {
  const activity = useMemo(() => loadStudyActivityFast(), []);
  const { goal, updateGoal } = useDailyGoal();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  const {
    currentStreak = 0,
    longestStreak = 0,
    xp = 0,
    activeDayCount = 0,
    badges = [],
    todayAttempts = 0,
    streakFreeze = {},
  } = activity || {};

  const safeGoal = Math.max(1, Number(goal || 5));
  const safeTodayAttempts = Math.max(0, Number(todayAttempts || 0));
  const goalProgress = Math.min(100, Math.round((safeTodayAttempts / safeGoal) * 100));
  const goalDash = Number((goalProgress * 1.13).toFixed(2));
  const freezeAvailable = Math.max(0, Number(streakFreeze.available || 0));
  const bottomTags = badges.map(normalizeBadgeLabel).filter(Boolean);

  return (
    <section className="home-streak-banner" aria-label="Streak and stats">
      <div className="home-streak-banner-card">
        {/* Goal Settings Overlay */}
        {isEditingGoal && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--color-surface)]/80 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[color:var(--color-text)]">Set Daily Goal</h3>
              <p className="mb-4 text-center text-xs text-[color:var(--color-text-muted)]">How many questions do you want to practice each day?</p>
              
              <div className="mb-4 flex w-full justify-center gap-3">
                {[5, 10, 20].map((g) => (
                  <button
                    key={g}
                    onClick={() => { updateGoal(g); setIsEditingGoal(false); }}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)] ${
                      goal === g
                        ? "bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] text-white shadow-md shadow-blue-500/20"
                        : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-border)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              
              <div className="flex w-full items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="Custom target"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(customGoal, 10);
                      if (val > 0) {
                        updateGoal(val);
                        setIsEditingGoal(false);
                      }
                    }
                  }}
                  className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = parseInt(customGoal, 10);
                    if (val > 0) {
                      updateGoal(val);
                      setIsEditingGoal(false);
                    }
                  }}
                  className="rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-[#0284c7] hover:to-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
                >
                  Set
                </button>
              </div>

              <button
                type="button"
                className="mt-5 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] focus:outline-none"
                onClick={() => setIsEditingGoal(false)}
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body
        )}
        
        <div className="home-streak-main">
          <div className="home-streak-lede">
            <span className="home-streak-fire" aria-hidden="true">
              <FaFire size={24} />
            </span>
            <div className="min-w-0">
              <p className="home-streak-title">
                <span>{currentStreak}</span> Day Streak
              </p>
              <p className="home-streak-subtitle">{getMotivationalText(currentStreak)}</p>
            </div>
          </div>

          <div className="home-streak-stats" aria-label="Practice stats">
            <StatPill icon={FaTrophy} value={longestStreak} label="Best" tone="gold" />
            <StatPill icon={FaBolt} value={formatAura(xp)} label="Aura" tone="blue" />
            <StatPill icon={FaShieldAlt} value={freezeAvailable} label="Freeze" tone="slate" />
            <StatPill icon={FaStar} value={activeDayCount} label="Days" tone="green" />
          </div>

          <button
            type="button"
            onClick={() => setIsEditingGoal(true)}
            className="home-goal-ring cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full"
            aria-label={`Edit Daily goal: ${safeTodayAttempts} out of ${safeGoal}`}
            style={{ "--home-goal-dash": goalDash }}
          >
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle className="home-goal-ring-track" cx="22" cy="22" r="18" />
              <circle className="home-goal-ring-progress" cx="22" cy="22" r="18" />
            </svg>
            <span>{safeTodayAttempts} / {safeGoal}</span>
          </button>
        </div>

        {bottomTags.length > 0 ? (
          <div className="home-streak-tags" aria-label="Practice badges">
            {bottomTags.map((badge) => (
              <BottomTag key={badge}>{badge}</BottomTag>
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
};

export default StreakBanner;
