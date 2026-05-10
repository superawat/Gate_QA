import React, { useEffect, useMemo, useState } from "react";
import { FaFire, FaTrophy, FaStar, FaBolt, FaCheck, FaShieldAlt } from "react-icons/fa";
import { loadStudyActivityFast } from "../../utils/weakTopicAnalyzer";
import { useDailyGoal } from "../../hooks/useDailyGoal";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const STREAK_MILESTONE_STORAGE_KEY = "gateqa_seen_streak_milestones_v1";

const readCelebratedMilestones = () => {
  try {
    if (typeof window === "undefined") {
      return [];
    }
    const rawValue = window.localStorage.getItem(STREAK_MILESTONE_STORAGE_KEY);
    const parsed = JSON.parse(rawValue || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const markMilestoneCelebrated = (milestone) => {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const milestones = new Set(readCelebratedMilestones());
    milestones.add(milestone);
    window.localStorage.setItem(STREAK_MILESTONE_STORAGE_KEY, JSON.stringify(Array.from(milestones)));
  } catch {
    // Celebration memory is optional.
  }
};

/**
 * Duolingo-style streak banner for the HomePage.
 *
 * Renders:
 * - Current streak fire counter with motivational text
 * - Longest streak badge
 * - XP counter
 * - Active days count
 *
 * Data is loaded synchronously from localStorage — no network fetch.
 */
const StreakBanner = () => {
  const activity = useMemo(() => loadStudyActivityFast(), []);
  const { goal, updateGoal } = useDailyGoal();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [celebrationMilestone, setCelebrationMilestone] = useState(null);

  const {
    currentStreak,
    longestStreak,
    xp,
    activeDayCount,
    badges,
    todayAttempts = 0,
    streakFreeze = {},
    xpBreakdown = {},
  } = activity;

  const goalProgress = Math.min(100, Math.round((todayAttempts / goal) * 100));
  const goalCompleted = todayAttempts >= goal;
  const freezeAvailable = Number(streakFreeze.available || 0);

  useEffect(() => {
    if (!STREAK_MILESTONES.includes(currentStreak)) {
      return;
    }
    const celebrated = readCelebratedMilestones();
    if (!celebrated.includes(currentStreak)) {
      setCelebrationMilestone(currentStreak);
    }
  }, [currentStreak]);

  const handleDismissCelebration = () => {
    if (celebrationMilestone) {
      markMilestoneCelebrated(celebrationMilestone);
    }
    setCelebrationMilestone(null);
  };

  // Don't show the banner if the user has never practiced
  if (activeDayCount === 0) return null;

  const motivationalText = getMotivationalText(currentStreak);
  const streakColor = currentStreak >= 7
    ? "var(--color-danger-text)"  // strong red/orange for 7+
    : currentStreak >= 3
      ? "#f59e0b" // amber for 3-6
      : currentStreak >= 1
        ? "var(--color-warning-text)" // gentle warm for 1-2
        : "var(--color-text-muted)"; // gray for 0

  return (
    <section className="mb-8">
      <div
        className="relative overflow-hidden rounded-2xl border px-5 py-5 shadow-sm sm:px-6"
        style={{
          borderColor: currentStreak > 0 ? "var(--color-warning-border)" : "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Subtle gradient overlay for active streaks */}
        {currentStreak > 0 && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              background: `linear-gradient(135deg, ${streakColor} 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Goal Settings Overlay */}
        {isEditingGoal && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[color:var(--color-surface)]/90 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-xl">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[color:var(--color-text)]">Set Daily Goal</h3>
              <p className="mb-4 text-center text-xs text-[color:var(--color-text-muted)]">How many questions do you want to practice each day?</p>
              
              <div className="mb-4 flex w-full justify-center gap-3">
                {[5, 10, 20].map((g) => (
                  <button
                    key={g}
                    onClick={() => { updateGoal(g); setIsEditingGoal(false); }}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)] ${
                      goal === g
                        ? "bg-[color:var(--color-primary-text)] text-white"
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
                  className="rounded-xl bg-[color:var(--color-primary-text)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
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
          </div>
        )}

        {celebrationMilestone && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[color:var(--color-surface)]/95 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-sm animate-[streak-celebrate_360ms_ease-out] flex-col items-center rounded-xl border border-[color:var(--color-warning-border)] bg-[color:var(--color-surface)] p-5 text-center shadow-xl">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] shadow-sm">
                <FaTrophy size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[color:var(--color-text)]">
                {celebrationMilestone}-day streak
              </h3>
              <p className="mt-2 text-sm font-medium text-[color:var(--color-text-muted)]">
                Milestone unlocked. Your consistency is turning into a real edge.
              </p>
              <button
                type="button"
                onClick={handleDismissCelebration}
                className="mt-5 rounded-xl bg-[color:var(--color-primary-text)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
              >
                Nice
              </button>
            </div>
          </div>
        )}

        <div className="relative flex flex-wrap items-center gap-5 sm:gap-8">
          {/* ── Fire + Streak Count ─────────────────────────── */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: currentStreak > 0
                  ? "var(--color-warning-soft)"
                  : "var(--color-neutral-soft)",
              }}
            >
              <FaFire
                size={28}
                style={{ color: streakColor }}
                className={currentStreak >= 3 ? "animate-pulse" : ""}
              />
            </div>
            <div>
              <p
                className="text-3xl font-extrabold leading-none tracking-tight"
                style={{ color: streakColor }}
              >
                {currentStreak}
              </p>
              <p
                className="mt-0.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)" }}
              >
                {currentStreak === 1 ? "Day streak" : "Day streak"}
              </p>
            </div>
          </div>

          {/* ── Motivational text ───────────────────────────── */}
          <p
            className="hidden text-sm font-medium sm:block"
            style={{ color: "var(--color-text-muted)" }}
          >
            {motivationalText}
          </p>

          {/* ── Stat pills ─────────────────────────────────── */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Longest streak */}
            <StatPill
              icon={FaTrophy}
              value={longestStreak}
              label="Best"
              color="var(--color-warning-text)"
              bgColor="var(--color-warning-soft)"
            />

            {/* XP */}
            <StatPill
              icon={FaBolt}
              value={formatXP(xp)}
              label={xpBreakdown.streakMultiplier > 1 ? "XP x2" : "XP"}
              color="var(--color-primary-text)"
              bgColor="var(--color-primary-soft)"
            />

            {/* Streak freeze */}
            <StatPill
              icon={FaShieldAlt}
              value={freezeAvailable}
              label="Freeze"
              color="var(--color-info-text)"
              bgColor="var(--color-info-soft)"
            />

            {/* Active days */}
            <StatPill
              icon={FaStar}
              value={activeDayCount}
              label="Days"
              color="var(--color-success-text)"
              bgColor="var(--color-success-soft)"
            />

            {/* Daily Goal Ring */}
            <div className="ml-2 flex items-center justify-center">
              <button
                type="button"
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-surface)] shadow-sm ring-1 ring-[color:var(--color-border)] transition hover:shadow-md hover:ring-2 hover:ring-[color:var(--color-primary-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
                onClick={() => setIsEditingGoal(true)}
                title="Edit Daily Goal"
                aria-label={`Daily goal: ${todayAttempts} out of ${goal} questions`}
              >
                <svg className="absolute inset-0 h-14 w-14 -rotate-90 transform drop-shadow-sm" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[color:var(--color-surface-muted)]"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Arc */}
                  {goalProgress > 0 && (
                    <path
                      className={goalCompleted ? "text-[color:var(--color-success-text)]" : "text-[color:var(--color-primary-text)]"}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${goalProgress}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  {goalCompleted ? (
                    <FaCheck size={16} className="text-[color:var(--color-success-text)] drop-shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-0.5">
                      <span className="text-base font-black leading-none text-[color:var(--color-text)]">{todayAttempts}</span>
                      <span className="mt-0.5 text-[9px] font-bold tracking-wider text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary-text)] transition-colors">
                        / {goal}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Badges row ─────────────────────────────────── */}
        {badges.length > 0 && (
          <div className="relative mt-3 flex flex-wrap gap-1.5 border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: "var(--color-purple-soft)",
                  color: "var(--color-purple-text)",
                  border: "1px solid var(--color-purple-border)",
                }}
              >
                <FaStar size={8} />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const StatPill = ({ icon: Icon, value, label, color, bgColor }) => (
  <div
    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
    style={{ backgroundColor: bgColor }}
  >
    <Icon size={12} style={{ color }} />
    <span className="text-sm font-bold" style={{ color }}>
      {value}
    </span>
    <span className="text-[10px] font-semibold uppercase" style={{ color, opacity: 0.7 }}>
      {label}
    </span>
  </div>
);

const formatXP = (xp) => {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return String(xp);
};

const getMotivationalText = (streak) => {
  if (streak === 0) return "Start a new streak today! 💪";
  if (streak === 1) return "Great start! Come back tomorrow to build momentum.";
  if (streak === 2) return "Two days in! You're building a habit. 🌱";
  if (streak <= 4) return "Keep it going! Consistency beats intensity. 🔥";
  if (streak <= 6) return "Almost a full week — you're on fire! 🔥🔥";
  if (streak <= 13) return "Incredible discipline! You're unstoppable. 💥";
  if (streak <= 29) return "Two weeks+! Your future self will thank you. 🏆";
  if (streak <= 59) return "A month of daily practice — legendary! 👑";
  return "You are a GATE preparation machine! 🚀";
};

export default StreakBanner;
