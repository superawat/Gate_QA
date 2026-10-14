import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiSliders,
  FiDownload,
  FiRefreshCw,
  FiCloud,
} from "react-icons/fi";
import {
  readBranchPreferences,
  writeBranchPreferences,
  setActiveBranch,
  BRANCH_PREFERENCE_EVENT,
  MAX_ALLOWED_BRANCHES,
} from "../../utils/branchPreference";
import { DISCIPLINES } from "../Branch/BranchSelectionWall";
import { useAuth } from "../../contexts/AuthContext";
import { manualSyncWithCloud } from "../../utils/cloudSyncManager";

export default function UserProfileHub() {
  const { user, isAuthenticated, triggerSync, lastSyncedAt } = useAuth();
  const isGuest = !isAuthenticated;
  const [pref, setPref] = useState(() => readBranchPreferences());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Ready");

  useEffect(() => {
    const handleUpdate = () => {
      setPref(readBranchPreferences());
    };
    window.addEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
    return () => window.removeEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
  }, []);

  const { selectedBranches, activeBranch } = pref;

  const handleBranchToggle = (code) => {
    if (selectedBranches.includes(code)) {
      if (selectedBranches.length === 1) return; // Keep at least 1
      const next = selectedBranches.filter((c) => c !== code);
      writeBranchPreferences(next, next[0]);
    } else {
      if (selectedBranches.length >= MAX_ALLOWED_BRANCHES) return;
      const next = [...selectedBranches, code];
      writeBranchPreferences(next, activeBranch);
    }
  };

  const handleSetActive = (code) => {
    setActiveBranch(code);
  };

  const handleManualSync = async () => {
    if (!isAuthenticated || !user?.id) {
      setSyncStatus("Guest Mode: Local Progress Safe");
      setTimeout(() => setSyncStatus("Ready"), 3000);
      return;
    }
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    try {
      if (triggerSync) {
        await triggerSync(user.id, { force: true, forcePush: true });
      } else {
        await manualSyncWithCloud(user.id);
      }
      setSyncStatus("Synced successfully!");
      setTimeout(() => setSyncStatus("Ready"), 3000);
    } catch (err) {
      setSyncStatus("Sync error: " + (err?.message || "Sync failed"));
      setTimeout(() => setSyncStatus("Ready"), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    try {
      const dump = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("gate_qa_") || k.startsWith("gateqa_") || k.startsWith("gateqa-"))) {
          dump[k] = localStorage.getItem(k);
        }
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gateqa_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export backup: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE2E9] dark:border-[#30363D]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#1F2937] dark:text-[#E6EDF3] tracking-tight">
              {user?.email || "GATE Aspirant Hub"}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isGuest
                  ? "bg-[#EEF1F5] dark:bg-[#1C222B] text-[#64748B] dark:text-[#9DA7B3] border-[#DCE2E9] dark:border-[#30363D]"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isGuest ? "bg-amber-500" : "bg-emerald-500"}`}
                aria-hidden="true"
              />
              {isGuest ? "Guest Mode · Offline Ready" : "Authenticated Aspirant"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9DA7B3] mt-1">
            Manage your enrolled GATE examination papers and offline progress.
          </p>
        </div>
      </div>

      {/* Primary Section: Enrolled GATE Disciplines */}
      <section className="bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE2E9] dark:border-[#30363D] pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#E6EDF3] flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-[#285FC7] dark:text-[#477FE8]" />
              <span>Enrolled GATE Disciplines (Max 2 Allowed)</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] mt-0.5">
              Select 1 or at most 2 examination papers. Filter trees and mock tests will be scoped strictly to your selection.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EEF1F5] dark:bg-[#1C222B] text-[#1F2937] dark:text-[#E6EDF3] border border-[#DCE2E9] dark:border-[#30363D]">
            {selectedBranches.length} / {MAX_ALLOWED_BRANCHES} Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISCIPLINES.map((d) => {
            const isSelected = selectedBranches.includes(d.code);
            const isActive = activeBranch === d.code;
            const isAtMax = selectedBranches.length >= MAX_ALLOWED_BRANCHES;
            const isDisabled = isAtMax && !isSelected;
            const Icon = d.icon;

            return (
              <div
                key={d.code}
                role="button"
                data-testid={`profile-discipline-${d.code}`}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : 0}
                onClick={() => !isDisabled && handleBranchToggle(d.code)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                    e.preventDefault();
                    handleBranchToggle(d.code);
                  }
                }}
                className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-colors select-none text-left min-h-[155px] ${
                  isSelected
                    ? "bg-[#EFF5FF] dark:bg-[#1C2B41] border-[#285FC7] dark:border-[#477FE8] ring-1 ring-[#285FC7]/20 dark:ring-[#477FE8]/30 cursor-pointer"
                    : isDisabled
                    ? "bg-[#EEF1F5]/40 dark:bg-[#1C222B]/40 border-[#DCE2E9]/60 dark:border-[#30363D]/60 opacity-50 cursor-not-allowed"
                    : "bg-white dark:bg-[#161B22] border-[#DCE2E9] dark:border-[#30363D] hover:bg-[#EEF1F5] dark:hover:bg-[#1C222B] hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285FC7] dark:focus-visible:ring-[#477FE8]`}
              >
                {/* Card Header: Icon, Code, Full Name, Checkbox */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${d.accent}`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-base font-bold text-[#1F2937] dark:text-[#E6EDF3] leading-snug">
                          {d.short}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-[#9DA7B3] font-medium leading-snug">
                          {d.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-[#285FC7] dark:bg-[#477FE8] text-white"
                        : isDisabled
                        ? "border border-[#DCE2E9]/60 dark:border-[#30363D]/60 text-transparent"
                        : "border border-[#DCE2E9] dark:border-[#30363D] text-transparent group-hover:border-slate-400 dark:group-hover:border-slate-500"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </div>

                {/* Card Description: Complete list without ellipses */}
                <p className="text-xs leading-relaxed text-[#64748B] dark:text-[#9DA7B3] mb-auto">
                  {d.description}
                </p>

                {/* Card Footer: Status & Set Primary action */}
                {isSelected ? (
                  <div className="mt-3 pt-2.5 border-t border-[#DCE2E9] dark:border-[#30363D] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1F2937] dark:text-[#E6EDF3]">
                      {isActive ? "Primary Paper" : "Secondary Paper"}
                    </span>
                    {selectedBranches.length === 2 && !isActive ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActive(d.code);
                        }}
                        className="text-[#285FC7] dark:text-[#477FE8] hover:underline font-semibold"
                      >
                        Set as Primary
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#64748B] dark:text-[#9DA7B3]">
                        {selectedBranches.length === 1 ? "Sole enrolled paper" : "Active focus"}
                      </span>
                    )}
                  </div>
                ) : isDisabled ? (
                  <div className="mt-3 pt-2.5 border-t border-[#DCE2E9]/50 dark:border-[#30363D]/50 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#9DA7B3]">
                    <span>Max 2 papers enrolled</span>
                    <span>Deselect one to swap</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-transparent text-[11px] text-[#64748B] dark:text-[#9DA7B3]">
                    <span>Click to enroll</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Secondary Section: Cloud Sync & Local Backup */}
      <section className="bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE2E9] dark:border-[#30363D] pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-[#E6EDF3] flex items-center gap-2">
              <FiCloud className="w-4 h-4 text-[#285FC7] dark:text-[#477FE8]" />
              <span>Cloud Sync & Offline Backup</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] mt-0.5">
              Additive union-merge protects your local offline progress against cloud overwrites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                syncStatus.includes("error") || syncStatus.includes("failed")
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                  : syncStatus.includes("Synced")
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-[#EEF1F5] dark:bg-[#1C222B] text-[#1F2937] dark:text-[#E6EDF3] border-[#DCE2E9] dark:border-[#30363D]"
              }`}
            >
              Status: {syncStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              isSyncing
                ? "bg-[#285FC7]/60 dark:bg-[#477FE8]/60 text-white cursor-wait"
                : "bg-[#285FC7] dark:bg-[#477FE8] hover:bg-[#1e4ea8] dark:hover:bg-[#3b6ecc] text-white cursor-pointer shadow-xs"
            }`}
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] text-[#1F2937] dark:text-[#E6EDF3] hover:bg-[#EEF1F5] dark:hover:bg-[#1C222B] transition cursor-pointer"
          >
            <FiDownload className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9DA7B3]" />
            <span>Download Progress Backup (.JSON)</span>
          </button>

          {lastSyncedAt && (
            <span className="text-[11px] text-[#64748B] dark:text-[#9DA7B3] sm:ml-auto">
              Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
