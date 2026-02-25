import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaDownload, FaUpload, FaFileCsv } from "react-icons/fa";
import { useFilterState, useFilterActions } from "../../contexts/FilterContext";
import {
    readStorageJson,
    writeStorageJson,
    isQuotaExceededError,
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
    const { solvedQuestionIds, bookmarkedQuestionIds, allQuestions } = useFilterState();
    const { refreshProgressState } = useFilterActions();

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
        const solved = readStorageJson(USER_STATE_STORAGE_KEYS.solved, []);
        const bookmarked = readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, []);

        const payload = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            appVersion: APP_VERSION,
            exportedAt: new Date().toISOString(),
            solvedQuestions: dedupeStringArray(solved),
            bookmarkedQuestions: dedupeStringArray(bookmarked),
        };

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        downloadBlob(blob, `gateqa-progress-${todayStamp()}.json`);
        showToast("Progress exported successfully.");
    }, [showToast]);

    // ── EXPORT: CSV (view-only) ────────────────────────────────────────────
    const handleExportCsv = useCallback(() => {
        const solved = new Set(
            dedupeStringArray(readStorageJson(USER_STATE_STORAGE_KEYS.solved, []))
        );
        const bookmarked = new Set(
            dedupeStringArray(
                readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [])
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
        downloadBlob(blob, `gateqa-progress-${todayStamp()}.csv`);
        showToast("CSV exported (view-only, not importable).");
    }, [showToast, allQuestions]);

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

            let finalSolved, finalBookmarked;

            if (strategy === "replace") {
                finalSolved = importedSolved;
                finalBookmarked = importedBookmarked;
            } else {
                // merge: union of current + imported
                const currentSolved = dedupeStringArray(
                    readStorageJson(USER_STATE_STORAGE_KEYS.solved, [])
                );
                const currentBookmarked = dedupeStringArray(
                    readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [])
                );
                finalSolved = [
                    ...new Set([...currentSolved, ...importedSolved]),
                ];
                finalBookmarked = [
                    ...new Set([...currentBookmarked, ...importedBookmarked]),
                ];
            }

            // Write
            const w1 = writeStorageJson(USER_STATE_STORAGE_KEYS.solved, finalSolved);
            const w2 = writeStorageJson(
                USER_STATE_STORAGE_KEYS.bookmarked,
                finalBookmarked
            );

            if (!w1.ok || !w2.ok) {
                const failed = !w1.ok ? w1 : w2;
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
        [modalData, refreshProgressState, showToast]
    );

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <div ref={helpRef}>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportJson}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        title="Export Progress (JSON)"
                    >
                        <FaDownload className="text-xs" />
                        Export JSON
                    </button>

                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        title="Export as CSV (View Only)"
                    >
                        <FaFileCsv className="text-xs" />
                        Export CSV
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        title="Import Progress"
                    >
                        <FaUpload className="text-xs" />
                        Import
                    </button>

                    <button
                        onClick={() => setHelpOpen((v) => !v)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                        title="What do these buttons do?"
                        aria-expanded={helpOpen}
                        aria-label="Help for export and import"
                    >
                        <span className="text-base leading-none">ⓘ</span>
                    </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    {solvedQuestionIds.length} solved{" · "}{bookmarkedQuestionIds.length} bookmarked
                </p>

                {helpOpen && (
                    <div className="mt-2 p-2.5 rounded-lg bg-white/80 border border-gray-200 text-[11px] text-gray-600 space-y-2 shadow-sm">
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
