/**
 * UserProfileHub.jsx
 * -------------------
 * Candidate Profile & Discipline Hub.
 * Manages enrolled GATE disciplines (max 2 allowed per DEC-177),
 * active examination paper focus, local offline data backup,
 * and additive union-merge cloud synchronization.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  FiCheck,
  FiSliders,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiCloud,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiAward,
  FiBookmark,
  FiClock,
  FiLogOut,
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

function getLocalProgressStats() {
  if (typeof window === "undefined") {
    return { solved: 0, bookmarks: 0, mockTests: 0 };
  }
  try {
    let solved = 0;
    let bookmarks = 0;
    let mockTests = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.includes("solved") ||
        key === "gate_qa_solved_questions" ||
        key === "gateqa_solved_v1"
      ) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(val)) solved = Math.max(solved, val.length);
          else if (typeof val === "object" && val !== null) {
            solved = Math.max(solved, Object.keys(val).length);
          }
        } catch {}
      }

      if (
        key.includes("bookmark") ||
        key === "gateqa_bookmarked_v1" ||
        key === "gateqa-bookmarked-questions"
      ) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(val)) bookmarks = Math.max(bookmarks, val.length);
          else if (typeof val === "object" && val !== null) {
            bookmarks = Math.max(bookmarks, Object.keys(val).length);
          }
        } catch {}
      }

      if (
        key.includes("mock_session") ||
        key.includes("mock-history") ||
        key === "gateqa_mock_history_v1"
      ) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(val)) mockTests = Math.max(mockTests, val.length);
        } catch {}
      }
    }

    return { solved, bookmarks, mockTests };
  } catch {
    return { solved: 0, bookmarks: 0, mockTests: 0 };
  }
}

export default function UserProfileHub() {
  const { user, isAuthenticated, triggerSync, lastSyncedAt, signInWithGoogle, signOut } = useAuth();
  const isGuest = !isAuthenticated;
  const [pref, setPref] = useState(() => readBranchPreferences());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Ready");
  const [stats, setStats] = useState(() => getLocalProgressStats());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPref(readBranchPreferences());
      setStats(getLocalProgressStats());
    };
    window.addEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
    return () => window.removeEventListener(BRANCH_PREFERENCE_EVENT, handleUpdate);
  }, []);

  const { selectedBranches, activeBranch } = pref;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Aspirant";

  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

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
      setStats(getLocalProgressStats());
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

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Invalid backup format");
        }
        let restoredCount = 0;
        for (const [k, v] of Object.entries(parsed)) {
          if (
            k.startsWith("gate_qa_") ||
            k.startsWith("gateqa_") ||
            k.startsWith("gateqa-")
          ) {
            localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
            restoredCount++;
          }
        }
        setPref(readBranchPreferences());
        window.dispatchEvent(new Event(BRANCH_PREFERENCE_EVENT));
        setStats(getLocalProgressStats());
        setSyncStatus(`Restored ${restoredCount} backup items!`);
        setTimeout(() => setSyncStatus("Ready"), 4000);
      } catch (err) {
        alert("Failed to restore backup: " + (err?.message || "Invalid JSON file"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans px-3 sm:px-0">
      {/* ── Aspirant Identity Hero Card ── */}
      <div className="bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* User Profile Avatar & Bio */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#DCE2E9] dark:border-[#30363D] shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl text-white bg-gradient-to-br from-[#285FC7] to-[#1e4ea8] dark:from-[#477FE8] dark:to-[#2563eb] shadow-xs shrink-0 tracking-tight">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#E6EDF3] tracking-tight truncate">
                  {user?.email || "GATE Aspirant Hub"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isGuest
                      ? "bg-[#EEF1F5] dark:bg-[#1C222B] text-[#64748B] dark:text-[#9DA7B3] border-[#DCE2E9] dark:border-[#30363D]"
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isGuest ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                    }`}
                    aria-hidden="true"
                  />
                  {isGuest ? "Guest Mode · Offline Ready" : "Authenticated Aspirant"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9DA7B3] mt-1 line-clamp-2">
                Manage your enrolled GATE examination papers and offline progress.
              </p>

              {/* Aspirant Paper Highlights */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {selectedBranches.map((code) => {
                  const isPrimary = activeBranch === code;
                  return (
                    <span
                      key={code}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        isPrimary
                          ? "bg-[#EFF5FF] dark:bg-[#1C2B41] text-[#285FC7] dark:text-[#93c5fd] border-[#285FC7]/30 dark:border-[#477FE8]/40"
                          : "bg-[#EEF1F5] dark:bg-[#1C222B] text-[#64748B] dark:text-[#9DA7B3] border-[#DCE2E9] dark:border-[#30363D]"
                      }`}
                    >
                      <span>{code.toUpperCase()}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {isPrimary ? "(Primary)" : "(Secondary)"}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            {isGuest ? (
              <button
                type="button"
                onClick={() => signInWithGoogle && signInWithGoogle()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#285FC7] hover:bg-[#1e4ea8] dark:bg-[#477FE8] dark:hover:bg-[#3b6ecc] text-white transition shadow-xs cursor-pointer"
              >
                <FiCloud className="w-4 h-4" />
                <span>Connect Google Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#64748B] dark:text-[#9DA7B3] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#DCE2E9] dark:border-[#30363D] transition cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Progress Metric Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-5 border-t border-[#DCE2E9] dark:border-[#30363D]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-[#EEF1F5]/60 dark:bg-[#1C222B]/60 border border-[#DCE2E9]/70 dark:border-[#30363D]/70">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] tabular-nums leading-tight">
                {stats.solved}
              </span>
              <span className="block text-[10px] sm:text-xs text-[#64748B] dark:text-[#9DA7B3] truncate">
                Solved Questions
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-[#EEF1F5]/60 dark:bg-[#1C222B]/60 border border-[#DCE2E9]/70 dark:border-[#30363D]/70">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FiBookmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] tabular-nums leading-tight">
                {stats.bookmarks}
              </span>
              <span className="block text-[10px] sm:text-xs text-[#64748B] dark:text-[#9DA7B3] truncate">
                Bookmarked
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-[#EEF1F5]/60 dark:bg-[#1C222B]/60 border border-[#DCE2E9]/70 dark:border-[#30363D]/70">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FiClock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] tabular-nums leading-tight">
                {stats.mockTests}
              </span>
              <span className="block text-[10px] sm:text-xs text-[#64748B] dark:text-[#9DA7B3] truncate">
                Mock Tests
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Section: Enrolled GATE Disciplines ── */}
      <section className="bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE2E9] dark:border-[#30363D] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#E6EDF3] flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-[#285FC7] dark:text-[#477FE8]" />
              <span>Enrolled GATE Disciplines (Max 2 Allowed)</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] mt-0.5">
              Select 1 or at most 2 examination papers. Filter trees and mock tests will be scoped strictly to your selection.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-[#EEF1F5] dark:bg-[#1C222B] text-[#1F2937] dark:text-[#E6EDF3] border border-[#DCE2E9] dark:border-[#30363D] tabular-nums shrink-0">
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
                className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-all duration-150 select-none text-left min-h-[160px] ${
                  isSelected
                    ? "bg-[#EFF5FF] dark:bg-[#1C2B41] border-[#285FC7] dark:border-[#477FE8] ring-1 ring-[#285FC7]/20 dark:ring-[#477FE8]/30 shadow-xs cursor-pointer"
                    : isDisabled
                    ? "bg-[#EEF1F5]/40 dark:bg-[#1C222B]/40 border-[#DCE2E9]/60 dark:border-[#30363D]/60 opacity-50 cursor-not-allowed"
                    : "bg-white dark:bg-[#161B22] border-[#DCE2E9] dark:border-[#30363D] hover:bg-[#EEF1F5] dark:hover:bg-[#1C222B] hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#285FC7] dark:focus-visible:ring-[#477FE8]`}
              >
                {/* Card Header: Icon, Code, Full Name, Checkbox */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Icon className={`w-4.5 h-4.5 ${d.accent}`} />
                    </div>
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
                  <div className="mt-3.5 pt-2.5 border-t border-[#DCE2E9] dark:border-[#30363D] flex items-center justify-between text-xs">
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
                        className="text-[#285FC7] dark:text-[#477FE8] hover:underline font-semibold focus:outline-none"
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
                  <div className="mt-3.5 pt-2.5 border-t border-[#DCE2E9]/50 dark:border-[#30363D]/50 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#9DA7B3]">
                    <span>Max 2 papers enrolled</span>
                    <span>Deselect one to swap</span>
                  </div>
                ) : (
                  <div className="mt-3.5 pt-2.5 border-t border-transparent text-[11px] text-[#64748B] dark:text-[#9DA7B3]">
                    <span>Click to enroll</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Secondary Section: Cloud Sync & Offline Backup ── */}
      <section className="bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE2E9] dark:border-[#30363D] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-[#E6EDF3] flex items-center gap-2">
              <FiCloud className="w-4 h-4 text-[#285FC7] dark:text-[#477FE8]" />
              <span>Cloud Sync & Offline Backup</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] mt-0.5">
              Additive union-merge protects your local offline progress against cloud overwrites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border tabular-nums ${
                syncStatus.includes("error") || syncStatus.includes("failed")
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                  : syncStatus.includes("Synced") || syncStatus.includes("Restored")
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-[#EEF1F5] dark:bg-[#1C222B] text-[#1F2937] dark:text-[#E6EDF3] border-[#DCE2E9] dark:border-[#30363D]"
              }`}
            >
              Status: {syncStatus}
            </span>
          </div>
        </div>

        {/* 2 Sub-panels for Cloud Sync & Local Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel 1: Cloud Sync Engine */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#DCE2E9] dark:border-[#30363D] bg-[#EEF1F5]/40 dark:bg-[#1C222B]/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiCloud className="w-4 h-4 text-[#285FC7] dark:text-[#477FE8]" />
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#E6EDF3]">
                  Cloud Synchronization
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] leading-relaxed">
                Connect your account to synchronize attempts, notes, bookmarks, and mock test scores seamlessly across desktop and mobile browsers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                  isSyncing
                    ? "bg-[#285FC7]/60 dark:bg-[#477FE8]/60 text-white cursor-wait"
                    : "bg-[#285FC7] dark:bg-[#477FE8] hover:bg-[#1e4ea8] dark:hover:bg-[#3b6ecc] text-white cursor-pointer shadow-xs"
                }`}
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
              </button>

              {lastSyncedAt && (
                <span className="text-[11px] text-[#64748B] dark:text-[#9DA7B3] tabular-nums sm:text-right">
                  Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Panel 2: Offline Workstation & JSON Backup */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#DCE2E9] dark:border-[#30363D] bg-[#EEF1F5]/40 dark:bg-[#1C222B]/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#E6EDF3]">
                  Local Storage &amp; Data Portability
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#9DA7B3] leading-relaxed">
                Your progress is stored 100% offline first. You can download a JSON snapshot backup anytime or restore previous study data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] text-[#1F2937] dark:text-[#E6EDF3] hover:bg-[#EEF1F5] dark:hover:bg-[#1C222B] transition cursor-pointer min-h-[44px] shadow-xs flex-1"
              >
                <FiDownload className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9DA7B3]" />
                <span>Download Progress Backup (.JSON)</span>
              </button>

              {/* Restore Backup file trigger */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
                aria-label="Upload JSON backup file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#161B22] border border-[#DCE2E9] dark:border-[#30363D] text-[#64748B] dark:text-[#9DA7B3] hover:text-[#1F2937] dark:hover:text-[#E6EDF3] hover:bg-[#EEF1F5] dark:hover:bg-[#1C222B] transition cursor-pointer min-h-[44px]"
                title="Restore from JSON backup file"
              >
                <FiUpload className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
