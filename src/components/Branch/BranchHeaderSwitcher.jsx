import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiSliders, FiPlus, FiCheck } from "react-icons/fi";
import {
  readBranchPreferences,
  setActiveBranch,
  BRANCH_PREFERENCE_EVENT,
} from "../../utils/branchPreference";
import { TRACK_LABELS } from "../../utils/examTrack";
import { DISCIPLINES } from "./BranchSelectionWall";
import { PROFILE_ROUTE } from "../../utils/routes";

export default function BranchHeaderSwitcher({ onReconfigure }) {
  const navigate = useNavigate();
  const [pref, setPref] = useState(() => readBranchPreferences());
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPref(readBranchPreferences());
    };
    window.addEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
    return () => window.removeEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { selectedBranches, activeBranch } = pref;

  if (!selectedBranches || selectedBranches.length === 0) {
    return null;
  }

  const activeMeta = DISCIPLINES.find((d) => d.code === activeBranch) || DISCIPLINES[0];

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {selectedBranches.length === 1 ? (
        // 1 Branch: Display badge with dropdown trigger
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          aria-label="Discipline switcher"
        >
          <span className="uppercase font-bold tracking-wide text-primary-600 dark:text-primary-400">
            {activeMeta.short}
          </span>
          <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        // 2 Branches: Segmented toggle
        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
          {selectedBranches.map((code) => {
            const meta = DISCIPLINES.find((d) => d.code === code) || { short: code.toUpperCase() };
            const isActive = activeBranch === code;

            return (
              <button
                key={code}
                onClick={() => setActiveBranch(code)}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {meta.short}
              </button>
            );
          })}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition ml-0.5"
            aria-label="Reconfigure disciplines"
          >
            <FiChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-fade-in text-xs">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Enrolled Papers
          </div>
          {selectedBranches.map((code) => {
            const label = TRACK_LABELS[code] || code.toUpperCase();
            const isActive = activeBranch === code;
            return (
              <button
                key={code}
                onClick={() => {
                  setActiveBranch(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-left ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{label}</span>
                {isActive && <FiCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
              </button>
            );
          })}

          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                if (typeof onReconfigure === "function") {
                  onReconfigure();
                } else {
                  navigate(PROFILE_ROUTE);
                }
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left font-medium"
            >
              <FiSliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Reconfigure Papers</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
