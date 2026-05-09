import React, { useMemo } from "react";
import { FaFire, FaTrophy, FaStar, FaBolt } from "react-icons/fa";
import { loadStudyActivityFast } from "../../utils/weakTopicAnalyzer";

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

  const { currentStreak, longestStreak, xp, activeDayCount, badges } = activity;

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
              label="XP"
              color="var(--color-primary-text)"
              bgColor="var(--color-primary-soft)"
            />

            {/* Active days */}
            <StatPill
              icon={FaStar}
              value={activeDayCount}
              label="Days"
              color="var(--color-success-text)"
              bgColor="var(--color-success-soft)"
            />
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
