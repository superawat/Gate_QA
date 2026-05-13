import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaDownload, FaFileCsv, FaInfoCircle, FaUpload } from "react-icons/fa";
import { useFilterState, useFilterActions } from "../../contexts/FilterContext";
import {
    readStorageJson,
    writeStorageJson,
    USER_STATE_STORAGE_KEYS,
} from "../../utils/localStorageState";
import Toast from "../Toast/Toast";
import ImportConfirmationModal from "./ImportConfirmationModal";

const APP_VERSION = "1.0.0";
const CURRENT_SCHEMA_VERSION = 1;
const MAX_IMPORT_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Build a YYYY-MM-DD date string for filenames.
 */
function todayStamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Trigger a browser file download from an in-memory blob.
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

/**
 * Deduplicate and normalise a raw array (could be hand-edited JSON).
 */
function dedupeStringArray(arr) {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const out = [];
    for (const v of arr) {
        const s = String(v || "").trim();
        if (s && !seen.has(s)) {
            seen.add(s);
            out.push(s);
        }
    }
    return out;
}

export default function ProgressManager() {
    const {
        solvedQuestionIds,
        bookmarkedQuestionIds,
        allQuestions,
        progressStorageKeys = USER_STATE_STORAGE_KEYS,
        progressExportPrefix = "gateqa-progress",
        includeExtendedProgress = true,
    } = useFilterState();
    const { refreshProgressState } = useFilterActions();
    const storageKeys = progressStorageKeys || USER_STATE_STORAGE_KEYS;

    const fileInputRef = useRef(null);
    const [toast, setToast] = useState({ message: "", visible: false });
    const [modalData, setModalData] = useState(null); // parsed import payload
    const toastTimer = useRef(null);

    // ── Help popover ────────────────────────────────────────────────────────
    const [helpOpen, setHelpOpen] = useState(false);
    const helpRef = useRef(null);

    useEffect(() => {
        if (!helpOpen) return;
        const handleClickOutside = (e) => {
            if (helpRef.current && !helpRef.current.contains(e.target)) {
                setHelpOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") setHelpOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [helpOpen]);

    // ── Toast helpers ──────────────────────────────────────────────────────
    const showToast = useCallback((message, durationMs = 3500) => {
        clearTimeout(toastTimer.current);
        setToast({ message, visible: true });
        toastTimer.current = setTimeout(
            () => setToast({ message: "", visible: false }),
            durationMs
        );
    }, []);

    // ── EXPORT: JSON ───────────────────────────────────────────────────────
    const handleExportJson = useCallback(() => {
        const solved = readStorageJson(storageKeys.solved, []);
        const bookmarked = readStorageJson(storageKeys.bookmarked, []);
        const metadata = readStorageJson(storageKeys.metadata, {});
        const progress = readStorageJson(storageKeys.progress, {});

        // Include all user data for full portability
        const userNotes = readStorageJson("gate_qa_user_notes", {});
        const mockHistory = readStorageJson("gateqa_mock_history_v1", []);
        const streakFreeze = readStorageJson("gateqa_streak_freeze_v1", {});
        const dailyGoal = readStorageJson("gateqa_daily_goal_v1", {});

        const payload = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            appVersion: APP_VERSION,
            exportedAt: new Date().toISOString(),
            solvedQuestions: dedupeStringArray(solved),
            bookmarkedQuestions: dedupeStringArray(bookmarked),
            metadata,
            progress,
        };
        if (includeExtendedProgress) {
            payload.userNotes = userNotes;
            payload.mockHistory = mockHistory;
            payload.streakFreeze = streakFreeze;
            payload.dailyGoal = dailyGoal;
        }

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        downloadBlob(blob, `${progressExportPrefix}-${todayStamp()}.json`);
        showToast("Progress exported successfully.");
    }, [includeExtendedProgress, progressExportPrefix, showToast, storageKeys.bookmarked, storageKeys.metadata, storageKeys.progress, storageKeys.solved]);

    // ── EXPORT: CSV (view-only) ────────────────────────────────────────────
    const handleExportCsv = useCallback(() => {
        const solved = new Set(
            dedupeStringArray(readStorageJson(storageKeys.solved, []))
        );
        const bookmarked = new Set(
            dedupeStringArray(
                readStorageJson(storageKeys.bookmarked, [])
            )
        );

        // Build lookup from loaded questions for metadata enrichment
        const questionMap = new Map(
            (allQuestions || []).map((q) => [q.question_uid, q])
        );

        const allUids = new Set([...solved, ...bookmarked]);
        const rows = ["questionUid,year,subject,subtopic,type,status"];

        for (const uid of allUids) {
            const isSolved = solved.has(uid);
            const isBookmarked = bookmarked.has(uid);
            let status = "solved";
            if (isSolved && isBookmarked) status = "both";
            else if (isBookmarked) status = "bookmarked";

            const q = questionMap.get(uid);
            const year = q?.exam?.year ?? "";
            const subject = q?.subjectSlug ?? "";
            const subtopic =
                Array.isArray(q?.subtopics) && q.subtopics.length > 0
                    ? (q.subtopics[0].slug || q.subtopics[0].label || q.subtopics[0] || "")
                    : "";
            const type = q?.type ?? "";

            rows.push(`${uid},${year},${subject},${subtopic},${type},${status}`);
        }

        const csv = rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        downloadBlob(blob, `${progressExportPrefix}-${todayStamp()}.csv`);
        showToast("CSV exported (view-only, not importable).");
    }, [progressExportPrefix, showToast, allQuestions, storageKeys.bookmarked, storageKeys.solved]);

    // ── IMPORT: trigger file picker ────────────────────────────────────────
    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // ── IMPORT: file selected ──────────────────────────────────────────────
    const handleFileChange = useCallback(
        (e) => {
            const file = e.target.files?.[0];
            // Always reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (!file) return;

            // Size guard
            if (file.size > MAX_IMPORT_SIZE_BYTES) {
                showToast("File too large — max 2 MB for a progress file.");
                return;
            }

            const reader = new FileReader();
            reader.onerror = () => showToast("Failed to read file.");
            reader.onload = () => {
                let parsed;
                try {
                    parsed = JSON.parse(reader.result);
                } catch {
                    showToast("Invalid file: Not a valid JSON document.");
                    return;
                }

                if (!parsed || typeof parsed !== "object") {
                    showToast("Invalid file format: Missing required progress data.");
                    return;
                }

                // Validate required fields
                if (
                    !Array.isArray(parsed.solvedQuestions) ||
                    !Array.isArray(parsed.bookmarkedQuestions)
                ) {
                    showToast("Invalid file format: Missing required progress data.");
                    return;
                }

                // Schema version logic
                let schemaWarning = null;
                if (parsed.schemaVersion == null) {
                    schemaWarning =
                        "This file has no schema version. It may be from a different app. Proceeding in best-effort mode.";
                } else if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
                    schemaWarning = `This file uses schema v${parsed.schemaVersion} (app knows v${CURRENT_SCHEMA_VERSION}). Some data may not be fully understood.`;
                }

                setModalData({ parsed, schemaWarning });
            };

            reader.readAsText(file);
        },
        [showToast]
    );

    // ── IMPORT: write to storage ───────────────────────────────────────────
    const performImport = useCallback(
        (strategy) => {
            if (!modalData?.parsed) return;

            const importedSolved = dedupeStringArray(
                modalData.parsed.solvedQuestions
            );
            const importedBookmarked = dedupeStringArray(
                modalData.parsed.bookmarkedQuestions
            );

            let finalSolved, finalBookmarked, finalMetadata, finalProgress;

            if (strategy === "replace") {
                finalSolved = importedSolved;
                finalBookmarked = importedBookmarked;
                finalMetadata = modalData.parsed.metadata || {};
                finalProgress = modalData.parsed.progress || {};
            } else {
                // merge: union of current + imported
                const currentSolved = dedupeStringArray(
                    readStorageJson(storageKeys.solved, [])
                );
                const currentBookmarked = dedupeStringArray(
                    readStorageJson(storageKeys.bookmarked, [])
                );
                const currentMetadata = readStorageJson(storageKeys.metadata, {});
                const currentProgress = readStorageJson(storageKeys.progress, {});

                finalSolved = [
                    ...new Set([...currentSolved, ...importedSolved]),
                ];
                finalBookmarked = [
                    ...new Set([...currentBookmarked, ...importedBookmarked]),
                ];
                // For metadata and progress objects, we merge them (shallow merge)
                // In a real app, you might want deeper merging for specific fields
                finalMetadata = { ...currentMetadata, ...(modalData.parsed.metadata || {}) };
                finalProgress = { ...currentProgress, ...(modalData.parsed.progress || {}) };
            }

            // Write core progress data
            const w1 = writeStorageJson(storageKeys.solved, finalSolved);
            const w2 = writeStorageJson(
                storageKeys.bookmarked,
                finalBookmarked
            );
            const w3 = writeStorageJson(storageKeys.metadata, finalMetadata);
            const w4 = writeStorageJson(storageKeys.progress, finalProgress);

            // Write extended data if present in the import file
            const importedNotes = modalData.parsed.userNotes;
            const importedMockHistory = modalData.parsed.mockHistory;
            const importedStreakFreeze = modalData.parsed.streakFreeze;
            const importedDailyGoal = modalData.parsed.dailyGoal;

            if (includeExtendedProgress && importedNotes && typeof importedNotes === "object") {
                const currentNotes = strategy === "replace" ? {} : readStorageJson("gate_qa_user_notes", {});
                writeStorageJson("gate_qa_user_notes", { ...currentNotes, ...importedNotes });
            }
            if (includeExtendedProgress && Array.isArray(importedMockHistory) && importedMockHistory.length > 0) {
                if (strategy === "replace") {
                    writeStorageJson("gateqa_mock_history_v1", importedMockHistory);
                } else {
                    const currentHistory = readStorageJson("gateqa_mock_history_v1", []);
                    const existingIds = new Set(currentHistory.map(e => e.id));
                    const merged = [...currentHistory, ...importedMockHistory.filter(e => !existingIds.has(e.id))];
                    writeStorageJson("gateqa_mock_history_v1", merged);
                }
            }
            if (includeExtendedProgress && importedStreakFreeze && typeof importedStreakFreeze === "object") {
                writeStorageJson("gateqa_streak_freeze_v1", strategy === "replace" ? importedStreakFreeze : { ...readStorageJson("gateqa_streak_freeze_v1", {}), ...importedStreakFreeze });
            }
            if (includeExtendedProgress && importedDailyGoal && typeof importedDailyGoal === "object") {
                writeStorageJson("gateqa_daily_goal_v1", strategy === "replace" ? importedDailyGoal : { ...readStorageJson("gateqa_daily_goal_v1", {}), ...importedDailyGoal });
            }

            if (!w1.ok || !w2.ok || !w3.ok || !w4.ok) {
                const failed = [w1, w2, w3, w4].find(w => !w.ok);
                if (failed.reason === "quota_exceeded") {
                    showToast("Error: Storage quota exceeded. Cannot import.");
                } else {
                    showToast("Error: Failed to save imported progress.");
                }
                setModalData(null);
                return;
            }

            // Sync React state
            refreshProgressState();
            setModalData(null);

            const label = strategy === "replace" ? "replaced" : "merged";
            showToast(
                `Progress ${label} — ${finalSolved.length} solved, ${finalBookmarked.length} bookmarked.`
            );
        },
        [includeExtendedProgress, modalData, refreshProgressState, showToast, storageKeys.bookmarked, storageKeys.metadata, storageKeys.progress, storageKeys.solved]
    );

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <div ref={helpRef}>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleExportJson}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[color:var(--color-primary-hover)] shadow-sm"
                            title="Export Progress (JSON)"
                        >
                            <FaDownload className="text-xs" />
                            Export JSON
                        </button>

                        <button
                            onClick={handleExportCsv}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-text)] transition-colors hover:bg-slate-50 shadow-sm"
                            title="Export as CSV (View Only)"
                        >
                            <FaFileCsv className="text-xs" />
                            Export CSV
                        </button>

                        <button
                            onClick={handleImportClick}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-text)] transition-colors hover:bg-slate-50 shadow-sm"
                            title="Import Progress"
                        >
                            <FaUpload className="text-xs" />
                            Import
                        </button>

                        <button
                            onClick={() => setHelpOpen((v) => !v)}
                            className="progress-manager-help-button inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--color-text-muted)] transition-colors hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)] bg-white border border-[color:var(--color-border)] shadow-sm"
                            title="What do these buttons do?"
                            aria-expanded={helpOpen}
                            aria-label="Help for export and import"
                        >
                            <FaInfoCircle aria-hidden="true" className="text-xs" />
                        </button>
                    </div>

                    <div className="flex items-center rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-muted)] shadow-sm shrink-0">
                        <span className="text-[color:var(--color-text)] font-bold mr-1">{solvedQuestionIds.length}</span> solved
                        <span className="mx-2 text-[color:var(--color-border)]">|</span>
                        <span className="text-[color:var(--color-text)] font-bold mr-1">{bookmarkedQuestionIds.length}</span> bookmarked
                    </div>
                </div>

                {helpOpen && (
                    <div className="mt-2 space-y-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 p-2.5 text-[11px] text-[color:var(--color-text-muted)] shadow-sm">
                        <div className="leading-snug">
                            <span className="font-semibold text-gray-800">Export JSON</span> — Downloads a backup of your solved and bookmarked questions. Use it to transfer progress to another device.
                        </div>
                        <div className="leading-snug">
                            <span className="font-semibold text-gray-800">Export CSV</span> — Downloads a read-only spreadsheet with year, subject, subtopic, and type for each question. Not importable.
                        </div>
                        <div className="leading-snug">
                            <span className="font-semibold text-gray-800">Import</span> — Upload a previously exported .json file. You can merge with or replace your current progress.
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <ImportConfirmationModal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                onReplace={() => performImport("replace")}
                onMerge={() => performImport("merge")}
                currentSolvedCount={solvedQuestionIds.length}
                currentBookmarkedCount={bookmarkedQuestionIds.length}
                importedSolvedCount={
                    modalData
                        ? dedupeStringArray(modalData.parsed.solvedQuestions).length
                        : 0
                }
                importedBookmarkedCount={
                    modalData
                        ? dedupeStringArray(modalData.parsed.bookmarkedQuestions).length
                        : 0
                }
                schemaWarning={modalData?.schemaWarning}
            />

            <Toast message={toast.message} visible={toast.visible} />
        </>
    );
}
