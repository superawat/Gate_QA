import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiX,
  FiLayers,
  FiCheckSquare,
  FiBarChart2,
  FiTarget,
  FiArrowRight,
  FiZap,
  FiStar,
  FiShield,
  FiClock,
} from "react-icons/fi";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { TRACKER_ROUTE } from "../../utils/routes";
import { TRACKER_ANNOUNCEMENT_SEEN_KEY } from "../../utils/trackerState";

export { TRACKER_ANNOUNCEMENT_SEEN_KEY };

const TRACKER_FEATURES = [
  {
    icon: FiLayers,
    iconColor: "text-sky-500 dark:text-sky-400",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    title: "Interactive Syllabus Tree",
    description: "Full Subject → Topic → Subtopic hierarchy for GATE CSE & DA with 1-click Theory and Revision toggles.",
  },
  {
    icon: FiCheckSquare,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    title: "Zero-Friction PYQ Sync",
    description: "Solved PYQ counts and accuracy are derived directly from your practice history with zero double entry.",
  },
  {
    icon: FiBarChart2,
    iconColor: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    title: "4-Stage Progress Badges",
    description: "Dynamic color-coded ratios (Yellow → Orange → Pink → Green) showing granular mastery at a glance.",
  },
  {
    icon: FiTarget,
    iconColor: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    title: "Smart Recommendations & Exam Timer",
    description: "Instant 'Continue Where You Left Off', spaced repetition alerts, and a balanced exam countdown timer.",
  },
];

export default function TrackerAnnouncementModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  useFocusTrap(dialogRef, isOpen, onClose);

  if (!isOpen) return null;

  const handleOpenTracker = () => {
    try {
      localStorage.setItem(TRACKER_ANNOUNCEMENT_SEEN_KEY, "true");
    } catch {}
    if (onClose) onClose();
    navigate(TRACKER_ROUTE);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(TRACKER_ANNOUNCEMENT_SEEN_KEY, "true");
    } catch {}
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby="tracker-announcement-title"
        aria-modal="true"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <FiZap className="h-3.5 w-3.5" />
              NEW FEATURE
            </span>
            <span className="text-xs font-semibold text-[color:var(--color-text-muted)]">
              GATE 2027 Ready
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close announcement modal"
            className="rounded-full p-1 text-[color:var(--color-text-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {/* Main Title & Hero Intro */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-sm">
              <FiGrid className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="tracker-announcement-title"
                className="text-xl font-bold text-[color:var(--color-text)] sm:text-2xl tracking-tight"
              >
                Preparation &amp; Syllabus Tracker
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                Take command of your entire GATE CSE and GATE DA preparation with our structured, action-first syllabus tracker.
              </p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRACKER_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/60 p-4 transition hover:border-[color:var(--color-border-hover)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${feature.bgColor}`}>
                      <Icon className={`h-4 w-4 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-bold text-[color:var(--color-text)]">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Key Invariant Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 px-3.5 py-2.5 text-xs text-[color:var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <FiShield className="h-3.5 w-3.5 text-sky-500" />
              <span>100% Offline Capable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="h-3.5 w-3.5 text-emerald-500" />
              <span>0ms Local-First Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiStar className="h-3.5 w-3.5 text-purple-500" />
              <span>Multi-Device Cloud Backup</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/30 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleOpenTracker}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span>Open Preparation Tracker</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
