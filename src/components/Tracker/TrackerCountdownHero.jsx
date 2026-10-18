import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiClock, FiBookOpen, FiEdit2, FiCheck } from "react-icons/fi";

const calculateTimeRemaining = (targetDateString) => {
  const target = new Date(`${targetDateString}T09:30:00+05:30`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      monthsApprox: 0,
      isPast: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalDays = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const monthsApprox = (totalDays / 30.4).toFixed(1);

  return {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
    monthsApprox,
    isPast: false,
  };
};

const TRACK_ACCENTS = {
  cse: { text: "text-blue-400", ping: "bg-blue-400", dot: "bg-blue-500", pill: "bg-blue-500/10 text-blue-400 border-blue-500/25", iconBox: "bg-blue-500/10 text-blue-400" },
  da: { text: "text-purple-400", ping: "bg-purple-400", dot: "bg-purple-500", pill: "bg-purple-500/10 text-purple-400 border-purple-500/25", iconBox: "bg-purple-500/10 text-purple-400" },
  ec: { text: "text-amber-400", ping: "bg-amber-400", dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-400 border-amber-500/25", iconBox: "bg-amber-500/10 text-amber-400" },
  ee: { text: "text-yellow-400", ping: "bg-yellow-400", dot: "bg-yellow-500", pill: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25", iconBox: "bg-yellow-500/10 text-yellow-400" },
  me: { text: "text-rose-400", ping: "bg-rose-400", dot: "bg-rose-500", pill: "bg-rose-500/10 text-rose-400 border-rose-500/25", iconBox: "bg-rose-500/10 text-rose-400" },
  ce: { text: "text-cyan-400", ping: "bg-cyan-400", dot: "bg-cyan-500", pill: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25", iconBox: "bg-cyan-500/10 text-cyan-400" },
};

export default function TrackerCountdownHero({
  activeTrack,
  preferences,
  onUpdatePreferences,
  syllabusDonePercentage = 0,
}) {
  const normTrack = String(activeTrack || "cse").toLowerCase();
  const dateKey = `examDate${normTrack.charAt(0).toUpperCase() + normTrack.slice(1)}`;
  const targetDate = preferences[dateKey] || (normTrack === "da" ? preferences.examDateDa : preferences.examDateCse) || "2027-02-06";
  const [time, setTime] = useState(() => calculateTimeRemaining(targetDate));
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(targetDate);

  const accent = TRACK_ACCENTS[normTrack] || TRACK_ACCENTS.cse;
  const trackLabel = normTrack.toUpperCase();

  // Update timer every second
  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!preferences.showCountdownWidget || preferences.countdownDisplayMode === "hidden") {
    return null;
  }

  const handleDismiss = () => {
    onUpdatePreferences({ showCountdownWidget: false, countdownDisplayMode: "hidden" });
  };

  const handleSaveDate = (e) => {
    e?.preventDefault?.();
    onUpdatePreferences({ [dateKey]: tempDate });
    setIsEditingDate(false);
  };

  const pad = (n) => String(n).padStart(2, "0");

  const formattedTargetDate = (() => {
    try {
      const d = new Date(targetDate + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return targetDate;
    }
  })();

  return (
    <section
      aria-label="Exam Countdown"
      className="relative mb-2 sm:mb-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2.5 sm:p-3 shadow-xs"
    >
      {/* Top action row */}
      <div className="relative flex flex-wrap items-center justify-between gap-1.5 mb-1.5 sm:mb-2 pb-1.5 border-b border-[color:var(--color-border)]/70">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span className="relative flex h-2 w-2">
            <span
              className={`inline-flex rounded-full h-2 w-2 ${accent.dot}`}
            />
          </span>

          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[color:var(--color-text)] flex items-center gap-2">
            <span>GATE {trackLabel} Target Exam</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${accent.pill}`}
            >
              {formattedTargetDate}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setTempDate(targetDate);
              setIsEditingDate((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors px-2.5 py-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 hover:bg-[color:var(--color-surface)] shadow-xs"
            title="Configure Target Exam Date"
          >
            <FiCalendar className="w-3.5 h-3.5 text-[color:var(--color-text-muted)]" />
            <span className="hidden sm:inline">Change Date</span>
            <FiEdit2 className="w-3 h-3 text-[color:var(--color-text-muted)]" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)] transition-colors border border-transparent hover:border-[color:var(--color-border)]"
            title="Hide Countdown Widget (Zero Anxiety Mode)"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Edit Dropdown/Form */}
      {isEditingDate && (
        <form
          onSubmit={handleSaveDate}
          className="relative mb-3 sm:mb-4 p-3 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-md flex flex-wrap items-center gap-2.5 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="exam-date-input" className="text-xs font-bold text-[color:var(--color-text)]">
              Target Date:
            </label>
            <input
              id="exam-date-input"
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingDate(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Quick presets */}
          <div className="w-full pt-1.5 border-t border-[color:var(--color-border)]/50 flex items-center gap-2 text-[11px] text-[color:var(--color-text-muted)]">
            <span className="font-semibold">Presets:</span>
            <button
              type="button"
              onClick={() => setTempDate("2027-02-06")}
              className="px-2 py-0.5 rounded bg-[color:var(--color-surface)] hover:bg-[color:var(--color-border)]/50 transition-colors text-[color:var(--color-text)]"
            >
              GATE 2027 (Feb 6)
            </button>
            <button
              type="button"
              onClick={() => setTempDate("2026-02-07")}
              className="px-2 py-0.5 rounded bg-[color:var(--color-surface)] hover:bg-[color:var(--color-border)]/50 transition-colors text-[color:var(--color-text)]"
            >
              GATE 2026 (Feb 7)
            </button>
          </div>
        </form>
      )}

      {/* Main Countdown Uniform 4-Card Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xl mx-auto my-1 sm:my-2 text-center">
        {/* Days */}
        <div className="relative group p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-xs hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-xl sm:text-3xl font-extrabold font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {time.days}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)] mt-0.5 flex items-center justify-center gap-1">
            <span>DAYS</span>
          </div>
        </div>

        {/* Hours */}
        <div className="relative group p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-xs hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-xl sm:text-3xl font-extrabold font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {pad(time.hours)}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)] mt-0.5">
            HOURS
          </div>
        </div>

        {/* Minutes */}
        <div className="relative group p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-xs hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-xl sm:text-3xl font-extrabold font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {pad(time.minutes)}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)] mt-0.5">
            MINUTES
          </div>
        </div>

        {/* Seconds */}
        <div className="relative group p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-xs hover:border-[color:var(--color-border-hover)] transition-all">
          <div
            className={`text-xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums ${accent.text}`}
          >
            {pad(time.seconds)}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)] mt-0.5">
            SECONDS
          </div>
        </div>
      </div>

      {/* Secondary Balanced Insight Badges */}
      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[color:var(--color-border)]/70 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {/* Metric 1: Time Horizon */}
        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-[color:var(--color-bg)]/50 border border-[color:var(--color-border)]/50">
          <div className={`p-1.5 rounded-md ${accent.iconBox}`}>
            <FiClock className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[color:var(--color-text)]">
              <span className="tabular-nums">{time.totalDays}</span> Total Days Left
            </div>
            <div className="text-[11px] text-[color:var(--color-text-muted)]">
              ~<span className="tabular-nums">{time.monthsApprox}</span> months remaining
            </div>
          </div>
        </div>

        {/* Metric 2: Syllabus Progress */}
        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-[color:var(--color-bg)]/50 border border-[color:var(--color-border)]/50">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
            <FiBookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 text-xs font-bold text-[color:var(--color-text)]">
              <span>Syllabus Covered</span>
              <span className="text-emerald-400 font-extrabold tabular-nums">{syllabusDonePercentage}%</span>
            </div>
            <div className="w-full bg-[color:var(--color-border)] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, syllabusDonePercentage))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
