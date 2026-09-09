import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaBolt, FaCalendarAlt, FaShieldAlt, FaTrophy } from "react-icons/fa";

import { useDailyGoal } from "../../hooks/useDailyGoal";

const STREAK_ICON = "/homepage_icon/optimized/streak.webp";

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

const METRIC_DETAILS = {
  best: {
    title: "Best Streak",
    icon: FaTrophy,
    tone: "gold",
    iconColor: "text-amber-500 dark:text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    getFormattedValue: (val) => `${val} ${val === 1 ? "Day" : "Days"}`,
    subtitle: "All-time longest daily practice streak",
    whatIsIt: "The maximum number of consecutive calendar days you have practiced on GateQA.",
    howItWorks: [
      "Increments by +1 for every continuous calendar day on which you solve at least one question.",
      "Automatically preserved if you miss a day while you have an active Streak Freeze.",
      "Never decreases—whenever your current streak surpasses this record, your Best streak updates!",
    ],
    tip: "Practice at least one question every day to beat your all-time personal best.",
  },
  aura: {
    title: "Aura (Practice XP)",
    icon: FaBolt,
    tone: "blue",
    iconColor: "text-blue-500 dark:text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    getFormattedValue: (val) => `${formatAura(val)} XP`,
    subtitle: "Your cumulative practice experience points",
    whatIsIt: "Aura reflects your total effort, accuracy, problem difficulty, and consistency on GateQA.",
    howItWorks: [
      "+5 XP for every question attempted.",
      "+10 XP for every question answered correctly.",
      "+15 XP for each day of your best streak.",
      "+25 Bonus XP for each challenging or hard question solved.",
      "2x Multiplier: Maintain an active daily streak of 7+ days to double your entire earned Aura!",
    ],
    tip: "Maintain a daily streak of 7+ days to keep your 2x Aura multiplier active.",
  },
  freeze: {
    title: "Streak Freeze",
    icon: FaShieldAlt,
    tone: "slate",
    iconColor: "text-sky-500 dark:text-sky-400",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    getFormattedValue: (val) => `${val} ${val === 1 ? "Shield" : "Shields"}`,
    subtitle: "Streak preservation shield",
    whatIsIt: "An automatic safety shield that protects your daily streak when life interrupts your practice.",
    howItWorks: [
      "Earn 1 Freeze for every 3 consecutive days of active practice.",
      "Capped at 1 active Freeze in reserve.",
      "Automatically consumed if you miss an unavoidable calendar day so your streak does not reset to 0.",
      "Rate limit: Usable at most once within any 7-day window.",
    ],
    tip: "Keep practicing consistently to keep your freeze shield armed and ready.",
  },
  days: {
    title: "Active Days",
    icon: FaCalendarAlt,
    tone: "green",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    getFormattedValue: (val) => `${val} ${val === 1 ? "Day" : "Days"}`,
    subtitle: "Total distinct days practiced",
    whatIsIt: "The cumulative count of unique calendar days on which you have solved questions on GateQA.",
    howItWorks: [
      "Every calendar day you make at least one practice attempt permanently adds +1.",
      "Unlike daily streaks, Active Days never resets—your lifetime learning journey is preserved.",
      "A true measure of your long-term dedication across months and years.",
    ],
    tip: "Solving even one question today permanently increments your lifetime active days.",
  },
};

const StatPill = ({ icon: Icon, value, label, tone = "neutral", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-haspopup="dialog"
    aria-label={`${label}: ${value} — Click for explanation`}
    className={`home-streak-pill home-streak-pill--${tone} cursor-pointer touch-manipulation select-none transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-400`}
  >
    <Icon size={13} aria-hidden="true" />
    <span className="home-streak-pill-value">{value}</span>
    <span className="home-streak-pill-label">{label}</span>
  </button>
);

const StreakBanner = ({ activity = null }) => {
  const { goal, updateGoal } = useDailyGoal();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [activeMetricKey, setActiveMetricKey] = useState(null);

  useEffect(() => {
    if (!activeMetricKey) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveMetricKey(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMetricKey]);

  const {
    currentStreak = 0,
    longestStreak = 0,
    xp = 0,
    activeDayCount = 0,
    todayAttempts = 0,
    streakFreeze = {},
  } = activity || {};

  const safeGoal = Math.max(1, Number(goal || 5));
  const safeTodayAttempts = Math.max(0, Number(todayAttempts || 0));
  const goalProgress = Math.min(100, Math.round((safeTodayAttempts / safeGoal) * 100));
  const goalDash = Number((goalProgress * 1.13).toFixed(2));
  const freezeAvailable = Math.max(0, Number(streakFreeze.available || 0));

  return (
    <section className="home-streak-banner" aria-label="Streak and stats">
      <div className="home-streak-banner-card">
        {/* Goal Settings Overlay */}
        {isEditingGoal && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--color-surface)]/80 p-4 backdrop-blur-sm"
            onClick={() => setIsEditingGoal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="set-daily-goal-title"
              className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="set-daily-goal-title" className="mb-4 text-sm font-bold uppercase tracking-wide text-[color:var(--color-text)]">Set Daily Goal</h3>
              <p className="mb-4 text-center text-xs text-[color:var(--color-text-muted)]">How many questions do you want to practice each day?</p>
              
              <div className="mb-4 flex w-full justify-center gap-3">
                {[5, 10, 20].map((g) => (
                  <button
                    key={g}
                    type="button"
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
                  className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-base sm:text-sm font-semibold text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
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

        {/* Metric Explanation Modal */}
        {activeMetricKey && METRIC_DETAILS[activeMetricKey] && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--color-surface)]/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveMetricKey(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="metric-info-title"
              className="flex w-full max-w-sm max-h-[88vh] overflow-y-auto overscroll-contain flex-col rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6 shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const metric = METRIC_DETAILS[activeMetricKey];
                const MetricIcon = metric.icon;
                const rawVal =
                  activeMetricKey === "best"
                    ? longestStreak
                    : activeMetricKey === "aura"
                    ? xp
                    : activeMetricKey === "freeze"
                    ? freezeAvailable
                    : activeDayCount;
                const formattedVal = metric.getFormattedValue(rawVal);

                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-[color:var(--color-border)]/60">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${metric.badgeColor} border`}>
                          <MetricIcon className={`h-4 w-4 ${metric.iconColor}`} aria-hidden="true" />
                        </div>
                        <div>
                          <h3 id="metric-info-title" className="text-sm font-bold text-[color:var(--color-text)]">
                            {metric.title}
                          </h3>
                          <p className="text-[11px] font-medium text-[color:var(--color-text-muted)]">
                            {metric.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${metric.badgeColor}`}>
                        {formattedVal}
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-3 text-xs">
                      <div>
                        <p className="text-[color:var(--color-text)] font-semibold mb-1">What it represents</p>
                        <p className="text-[color:var(--color-text-muted)] leading-relaxed">{metric.whatIsIt}</p>
                      </div>

                      <div>
                        <p className="text-[color:var(--color-text)] font-semibold mb-1">How it works</p>
                        <ul className="space-y-1.5 text-[color:var(--color-text-muted)] leading-relaxed list-disc pl-4">
                          {metric.howItWorks.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      {metric.tip ? (
                        <div className="rounded-xl border border-[color:var(--color-border)]/60 bg-[color:var(--color-surface-muted)]/60 p-2.5 text-[11px] text-[color:var(--color-text-muted)]">
                          <span className="font-semibold text-[color:var(--color-text)]">Tip: </span>
                          {metric.tip}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveMetricKey(null)}
                      className="mt-4 w-full min-h-[44px] rounded-xl bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-border)] active:scale-[0.99] py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--color-text)] transition focus:outline-none focus:ring-2 focus:ring-sky-500 touch-manipulation"
                    >
                      Got it
                    </button>
                  </>
                );
              })()}
            </div>
          </div>,
          document.body
        )}
        
        <div className="home-streak-main">
          <div className="home-streak-lede">
            <span className="home-streak-fire" aria-hidden="true">
              <img src={STREAK_ICON} alt="" width="128" height="128" loading="eager" decoding="async" />
            </span>
            <div className="min-w-0">
              <p className="home-streak-title">
                <span>{currentStreak}</span> Day Streak
              </p>
              <p className="home-streak-subtitle">{getMotivationalText(currentStreak)}</p>
            </div>
          </div>

          <div className="home-streak-stats" aria-label="Practice stats">
            <StatPill
              icon={FaTrophy}
              value={longestStreak}
              label="Best"
              tone="gold"
              onClick={() => setActiveMetricKey("best")}
            />
            <StatPill
              icon={FaBolt}
              value={formatAura(xp)}
              label="Aura"
              tone="blue"
              onClick={() => setActiveMetricKey("aura")}
            />
            <StatPill
              icon={FaShieldAlt}
              value={freezeAvailable}
              label="Freeze"
              tone="slate"
              onClick={() => setActiveMetricKey("freeze")}
            />
            <StatPill
              icon={FaCalendarAlt}
              value={activeDayCount}
              label="Days"
              tone="green"
              onClick={() => setActiveMetricKey("days")}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsEditingGoal(true)}
            className="home-goal-ring cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full"
            aria-label={`${safeTodayAttempts} / ${safeGoal} — Edit daily goal`}
            style={{ "--home-goal-dash": goalDash }}
          >
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle className="home-goal-ring-track" cx="22" cy="22" r="18" />
              <circle className="home-goal-ring-progress" cx="22" cy="22" r="18" />
            </svg>
            <span>{safeTodayAttempts} / {safeGoal}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StreakBanner;
