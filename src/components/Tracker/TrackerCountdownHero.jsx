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

export default function TrackerCountdownHero({
  activeTrack,
  preferences,
  onUpdatePreferences,
  syllabusDonePercentage = 0,
}) {
  const targetDate = activeTrack === "cse" ? preferences.examDateCse : preferences.examDateDa;
  const [time, setTime] = useState(() => calculateTimeRemaining(targetDate));
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(targetDate);

  const isCse = activeTrack === "cse";
  const accentColor = isCse ? "blue" : "purple";

  // Update timer every second
  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!preferences.showCountdownWidget || preferences.countdownDisplayMode === "hidden") {
    return (
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={() => onUpdatePreferences({ showCountdownWidget: true, countdownDisplayMode: "hero" })}
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors px-3 py-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm hover:border-[color:var(--color-border-hover)]"
        >
          <FiClock className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Show Exam Countdown</span>
        </button>
      </div>
    );
  }

  const handleDismiss = () => {
    onUpdatePreferences({ showCountdownWidget: false, countdownDisplayMode: "hidden" });
  };

  const handleSaveDate = (e) => {
    e?.preventDefault?.();
    if (activeTrack === "cse") {
      onUpdatePreferences({ examDateCse: tempDate });
    } else {
      onUpdatePreferences({ examDateDa: tempDate });
    }
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
      className="relative mb-8 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-7 shadow-[var(--shadow-card)]"
    >
      {/* Top action row */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[color:var(--color-border)]/70">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCse ? "bg-blue-400" : "bg-purple-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCse ? "bg-blue-500" : "bg-purple-500"
              }`}
            />
          </span>

          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-text)] flex items-center gap-2">
            <span>GATE {isCse ? "CSE" : "DA"} Target Exam</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isCse
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/25"
              }`}
            >
              {formattedTargetDate}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTempDate(targetDate);
              setIsEditingDate((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors px-2.5 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 hover:bg-[color:var(--color-surface)] shadow-xs"
            title="Configure Target Exam Date"
          >
            <FiCalendar className="w-3.5 h-3.5 text-[color:var(--color-text-muted)]" />
            <span className="hidden sm:inline">Change Date</span>
            <FiEdit2 className="w-3 h-3 text-[color:var(--color-text-muted)]" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)] transition-colors border border-transparent hover:border-[color:var(--color-border)]"
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
          className="relative mb-6 p-4 rounded-xl bg-[color:var(--color-bg)]/90 border border-[color:var(--color-border)] shadow-md flex flex-wrap items-center gap-3 backdrop-blur-md animate-fadeIn"
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
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingDate(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Quick presets */}
          <div className="w-full pt-2 border-t border-[color:var(--color-border)]/50 flex items-center gap-2 text-[11px] text-[color:var(--color-text-muted)]">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto my-3 text-center">
        {/* Days */}
        <div className="relative group p-4 sm:p-5 rounded-2xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-sm hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {time.days}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mt-1.5 flex items-center justify-center gap-1">
            <span>DAYS</span>
          </div>
        </div>

        {/* Hours */}
        <div className="relative group p-4 sm:p-5 rounded-2xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-sm hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {pad(time.hours)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mt-1.5">
            HOURS
          </div>
        </div>

        {/* Minutes */}
        <div className="relative group p-4 sm:p-5 rounded-2xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-sm hover:border-[color:var(--color-border-hover)] transition-all">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-[color:var(--color-text)] tabular-nums">
            {pad(time.minutes)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mt-1.5">
            MINUTES
          </div>
        </div>

        {/* Seconds */}
        <div className="relative group p-4 sm:p-5 rounded-2xl bg-[color:var(--color-bg)]/80 border border-[color:var(--color-border)] shadow-sm hover:border-[color:var(--color-border-hover)] transition-all">
          <div
            className={`text-3xl sm:text-5xl font-black font-mono tracking-tight tabular-nums ${
              isCse ? "text-blue-400" : "text-purple-400"
            }`}
          >
            {pad(time.seconds)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mt-1.5">
            SECONDS
          </div>
        </div>
      </div>

      {/* Secondary Balanced Insight Badges */}
      <div className="mt-6 pt-4 border-t border-[color:var(--color-border)]/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Metric 1: Time Horizon */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--color-bg)]/50 border border-[color:var(--color-border)]/50">
          <div className={`p-2 rounded-lg ${isCse ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
            <FiClock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[color:var(--color-text)]">
              {time.totalDays} Total Days Left
            </div>
            <div className="text-[11px] text-[color:var(--color-text-muted)]">
              ~{time.monthsApprox} months remaining
            </div>
          </div>
        </div>

        {/* Metric 2: Syllabus Progress */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--color-bg)]/50 border border-[color:var(--color-border)]/50">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FiBookOpen className="w-4 h-4" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 text-xs font-bold text-[color:var(--color-text)]">
              <span>Syllabus Covered</span>
              <span className="text-emerald-400 font-extrabold">{syllabusDonePercentage}%</span>
            </div>
            <div className="w-full bg-[color:var(--color-border)] h-1.5 rounded-full overflow-hidden mt-1.5">
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
