import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiCpu,
  FiDatabase,
  FiZap,
  FiActivity,
  FiSettings,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { FaHardHat } from "react-icons/fa";
import {
  readBranchPreferences,
  writeBranchPreferences,
  MAX_ALLOWED_BRANCHES,
  DEFAULT_BRANCH,
} from "../../utils/branchPreference";
import { EXAM_TRACKS, TRACK_LABELS } from "../../utils/examTrack";

export const DISCIPLINES = [
  {
    code: EXAM_TRACKS.CSE,
    label: "Computer Science & IT",
    short: "CSE",
    icon: FiCpu,
    description: "Algorithms, Systems, Architecture, DBMS, Networks & Discrete Math",
    gradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/30",
    accent: "text-blue-500 dark:text-blue-400",
  },
  {
    code: EXAM_TRACKS.DA,
    label: "Data Science & AI",
    short: "DA",
    icon: FiDatabase,
    description: "Machine Learning, Linear Algebra, Optimization, Prob/Stats & Python",
    gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30",
    accent: "text-emerald-500 dark:text-emerald-400",
  },
  {
    code: EXAM_TRACKS.EC,
    label: "Electronics & Communication",
    short: "EC",
    icon: FiZap,
    description: "Circuits, Signals & Systems, Communications, Electromagnetics & Transforms",
    gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/30",
    accent: "text-amber-500 dark:text-amber-400",
  },
  {
    code: EXAM_TRACKS.EE,
    label: "Electrical Engineering",
    short: "EE",
    icon: FiActivity,
    description: "Power Systems, Machines, Control, Power Electronics & Signals",
    gradient: "from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
    accent: "text-yellow-500 dark:text-yellow-400",
  },
  {
    code: EXAM_TRACKS.ME,
    label: "Mechanical Engineering",
    short: "ME",
    icon: FiSettings,
    description: "Thermodynamics, Mechanics, Manufacturing, Fluid Machinery & Materials",
    gradient: "from-rose-500/10 to-pink-500/10 border-rose-500/30",
    accent: "text-rose-500 dark:text-rose-400",
  },
  {
    code: EXAM_TRACKS.CE,
    label: "Civil Engineering",
    short: "CE",
    icon: FaHardHat,
    description: "Structural Analysis, Geotechnical, Environmental, Water Resources & Surveying",
    gradient: "from-cyan-500/10 to-sky-500/10 border-cyan-500/30",
    accent: "text-cyan-500 dark:text-cyan-400",
  },
];

export default function BranchSelectionWall({ isOpen: forceOpen = false, onClose = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [activeBranch, setActiveBranch] = useState(DEFAULT_BRANCH);

  useEffect(() => {
    // Check if deep link provides an explicit track or question
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTrack = searchParams.get("track")?.toLowerCase();

      // Deep link bypass: auto-configure without blocking if track is in URL
      if (urlTrack && Object.values(EXAM_TRACKS).includes(urlTrack)) {
        const state = readBranchPreferences();
        if (!state.hasCompletedOnboarding) {
          writeBranchPreferences([urlTrack], urlTrack);
        }
      }
    }

    const state = readBranchPreferences();
    if (forceOpen) {
      setIsOpen(true);
      setSelected(state.selectedBranches.length > 0 ? state.selectedBranches : [DEFAULT_BRANCH]);
      setActiveBranch(state.activeBranch || DEFAULT_BRANCH);
    } else if (!state.hasCompletedOnboarding && state.selectedBranches.length === 0) {
      // First-time visitor without preferences
      setIsOpen(true);
      setSelected([DEFAULT_BRANCH]);
      setActiveBranch(DEFAULT_BRANCH);
    } else {
      setIsOpen(false);
    }
  }, [forceOpen]);

  const handleToggle = (code) => {
    if (selected.includes(code)) {
      // Clear way to deselect a paper
      const next = selected.filter((c) => c !== code);
      setSelected(next);
      if (activeBranch === code) {
        setActiveBranch(next[0] || DEFAULT_BRANCH);
      }
    } else {
      if (selected.length >= MAX_ALLOWED_BRANCHES) return;
      const next = [...selected, code];
      setSelected(next);
      if (selected.length === 0 || !activeBranch) {
        setActiveBranch(code);
      }
    }
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    writeBranchPreferences(selected, activeBranch || selected[0]);
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const isAtMax = selected.length >= MAX_ALLOWED_BRANCHES;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0D10] text-[#E8EDF4] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-wall-title"
    >
      <div className="w-full max-w-[1080px] mx-auto my-auto flex flex-col justify-between">
        {/* Header / Intro typography */}
        <div className="w-full flex items-start justify-between gap-4 mb-6 sm:mb-8 text-left">
          <div>
            <h1
              id="branch-wall-title"
              className="text-[28px] sm:text-[32px] md:text-[34px] font-bold text-[#E8EDF4] tracking-tight leading-tight"
            >
              Choose Your Preparation Disciplines
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#9AA4B2] mt-1.5 leading-relaxed">
              Choose 1–2 papers to personalize your preparation.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-[#9AA4B2]">
              <FiAlertCircle className="w-3.5 h-3.5 text-[#6B9BFF] flex-shrink-0" />
              <span>Official GATE Rule: Max 2 Papers Allowed. Practice, tests, and analytics scope strictly to your selection.</span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
              className="p-2 rounded-lg text-[#9AA4B2] hover:text-[#E8EDF4] hover:bg-[#1B2129] border border-transparent hover:border-[#2A313B] transition flex-shrink-0"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {DISCIPLINES.map((d) => {
            const isSelected = selected.includes(d.code);
            const isDisabled = isAtMax && !isSelected;
            const Icon = d.icon;

            return (
              <div
                key={d.code}
                role="button"
                data-testid={`branch-wall-card-${d.code}`}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : 0}
                onClick={() => !isDisabled && handleToggle(d.code)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                    e.preventDefault();
                    handleToggle(d.code);
                  }
                }}
                className={`group relative flex flex-col justify-between p-5 rounded-[12px] border transition-colors duration-150 select-none text-left min-h-[160px] sm:min-h-[170px] ${
                  isSelected
                    ? "bg-[#14181E] border-[#6B9BFF] ring-1 ring-[#6B9BFF]/30 cursor-pointer"
                    : isDisabled
                    ? "bg-[#14181E]/40 border-[#2A313B]/60 opacity-50 cursor-not-allowed"
                    : "bg-[#14181E] border-[#2A313B] hover:bg-[#1B2129] hover:border-[#3E4856] cursor-pointer"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9BFF]`}
              >
                {/* Header: Quiet Icon, Branch Code, Full Name, Checkmark Indicator */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${d.accent}`} />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[17px] sm:text-[18px] font-semibold text-[#E8EDF4] leading-tight">
                          {d.short}
                        </span>
                        <span className="text-xs text-[#9AA4B2] font-normal truncate leading-tight">
                          {d.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? "bg-[#6B9BFF] text-[#0B0D10]"
                        : isDisabled
                        ? "border border-[#2A313B]/50 text-transparent"
                        : "border border-[#2A313B] text-transparent group-hover:border-[#3E4856]"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </div>

                {/* Description: full subject lists without truncation/ellipses */}
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#9AA4B2] mb-auto">
                  {d.description}
                </p>

                {/* Status / Actions / Explanation */}
                {isSelected ? (
                  <div className="mt-3 pt-2.5 border-t border-[#2A313B] flex items-center justify-between text-xs">
                    <span className="text-[#9AA4B2] font-medium">
                      {activeBranch === d.code ? "Primary paper" : "Secondary paper"}
                    </span>
                    {selected.length === 2 && activeBranch !== d.code ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBranch(d.code);
                        }}
                        className="text-[#6B9BFF] hover:underline font-medium text-xs transition"
                      >
                        Set as primary
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#9AA4B2]/70">Click to deselect</span>
                    )}
                  </div>
                ) : isDisabled ? (
                  <div className="mt-3 pt-2.5 border-t border-[#2A313B]/40 flex items-center justify-between text-[11px] text-[#9AA4B2]/60">
                    <span>Max 2 papers selected</span>
                    <span>Deselect one to swap</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-transparent text-[11px] text-[#9AA4B2]/40 select-none">
                    <span>Click to select</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Simplified Compact Footer */}
        <div className="w-full pt-4 pb-2 border-t border-[#2A313B] flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-[#0B0D10]/95 backdrop-blur-xs sm:static">
          <div className="text-sm text-[#9AA4B2] text-center sm:text-left">
            Selected: <strong className="text-[#E8EDF4] font-semibold">{selected.length}</strong> of {MAX_ALLOWED_BRANCHES} max disciplines
            {isAtMax && (
              <span className="ml-2 text-xs text-[#6B9BFF] font-medium hidden sm:inline">
                (Maximum reached)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            aria-label="Confirm & Start Preparing"
            className={`w-full sm:w-auto px-6 py-2.5 rounded-[10px] font-semibold text-sm transition-colors duration-150 ${
              selected.length > 0
                ? "bg-[#6B9BFF] hover:bg-[#5a8bf5] text-[#0B0D10] shadow-sm cursor-pointer active:scale-[0.99]"
                : "bg-[#1B2129] text-[#9AA4B2]/50 border border-[#2A313B] cursor-not-allowed"
            }`}
          >
            Continue to preparation
          </button>
        </div>
      </div>
    </div>
  );
}
