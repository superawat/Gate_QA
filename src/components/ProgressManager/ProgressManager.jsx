import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaDownload, FaFileCsv, FaInfoCircle, FaUpload } from "react-icons/fa";
import { useFilterState, useFilterActions } from "../../contexts/FilterContext";
import {
    readStorageJson,
    writeStorageJson,
    USER_STATE_STORAGE_KEYS,
} from "../../utils/localStorageState";
import {
    importWorkspaceSnapshot,
    saveWorkspaceFile,
} from "../../utils/workspaceFile";
import Toast from "../Toast/Toast";
import ImportConfirmationModal from "./ImportConfirmationModal";

const CURRENT_SCHEMA_VERSION = 1;
const MAX_IMPORT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB for full workspace backups

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

/**
 * Helper to count items in imported payload for UI display.
 */
function getImportedCounts(payload) {
    if (!payload) return { solved: 0, bookmarked: 0 };

    if (payload.entities?.userState?.records) {
        const recs = payload.entities.userState.records;
        const solved = recs.filter((r) => r.isSolved).length;
        const bookmarked = recs.filter((r) => r.isBookmarked).length;
        return { solved, bookmarked };
    }

    if (payload.userState?.questions) {
        const qMap = payload.userState.questions;
        let solved = 0;
        let bookmarked = 0;
        for (const k of Object.keys(qMap)) {
            if (qMap[k].isSolved) solved++;
            if (qMap[k].isBookmarked) bookmarked++;
        }
        return { solved, bookmarked };
    }

    if (payload.questions && typeof payload.questions === "object") {
        let solved = 0;
        let bookmarked = 0;
        for (const k of Object.keys(payload.questions)) {
            if (payload.questions[k].isSolved) solved++;
            if (payload.questions[k].isBookmarked) bookmarked++;
        }
        return { solved, bookmarked };
    }

    if (payload.gate_qa_solved_questions || payload.gate_qa_bookmarked_questions) {
        return {
            solved: dedupeStringArray(payload.gate_qa_solved_questions).length,
            bookmarked: dedupeStringArray(payload.gate_qa_bookmarked_questions).length,
        };
    }

    return {
        solved: dedupeStringArray(payload?.solvedQuestions).length,
        bookmarked: dedupeStringArray(payload?.bookmarkedQuestions).length,
    };
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

    // ── Help & Mobile Menu popover ─────────────────────────────────────────
    const [helpOpen, setHelpOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const helpRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        if (!helpOpen && !mobileMenuOpen) return;
        const handleClickOutside = (e) => {
            if (helpRef.current && !helpRef.current.contains(e.target)) {
                setHelpOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setHelpOpen(false);
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [helpOpen, mobileMenuOpen]);

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
    const handleExportJson = useCallback(async () => {
        try {
            await saveWorkspaceFile({
                suggestedName: `${progressExportPrefix}-${todayStamp()}.json`,
            });
            showToast("Workspace backup exported successfully.");
        } catch (error) {
            showToast(error?.name === "AbortError" ? "Export cancelled." : "Failed to export workspace backup.");
        }
    }, [progressExportPrefix, showToast]);

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
                showToast("File too large - max 10 MB for a workspace backup.");
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
                    showToast("Invalid file: Expected a JSON object.");
                    return;
                }

                const counts = getImportedCounts(parsed);
                const isLegacy =
                    Array.isArray(parsed.solvedQuestions) ||
                    Array.isArray(parsed.bookmarkedQuestions) ||
                    Array.isArray(parsed.gate_qa_solved_questions) ||
                    Array.isArray(parsed.gate_qa_bookmarked_questions);

                const isV1Workspace =
                    parsed.schemaVersion === 1 ||
                    parsed.app === "gateqa" ||
                    (parsed.entities && typeof parsed.entities === "object");

                if (!isLegacy && !isV1Workspace && counts.solved === 0 && counts.bookmarked === 0) {
                    showToast(
                        "Unrecognised format: Expected a GATE QA workspace backup or progress JSON."
                    );
                    return;
                }

                let schemaWarning = null;
                if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
                    schemaWarning = `This file was created by a newer version of GATE QA (schema v${parsed.schemaVersion}). Some fields may not be supported.`;
                }

                const mergeDisabled = Boolean(isV1Workspace && parsed.entities);

                setModalData({
                    parsed,
                    isV1Workspace,
                    isLegacy,
                    schemaWarning,
                    mergeDisabled,
                });
            };
            reader.readAsText(file);
        },
        [showToast]
    );

    // ── IMPORT: perform Replace or Merge ───────────────────────────────────
    const performImport = useCallback(
        (strategy) => {
            if (!modalData?.parsed) return;

            const { parsed, isV1Workspace } = modalData;

            if (isV1Workspace && parsed.entities) {
                const result = importWorkspaceSnapshot(parsed);
                if (!result.success) {
                    showToast(result.error || "Failed to restore workspace backup.");
                    setModalData(null);
                    return;
                }

                refreshProgressState();
                setModalData(null);
                showToast("Full workspace restored successfully.");
                return;
            }

            let incomingSolved = [];
            let incomingBookmarked = [];
            let incomingProgress = {};

            if (parsed.entities?.userState?.records) {
                for (const r of parsed.entities.userState.records) {
                    if (r.isSolved && r.questionUid) incomingSolved.push(r.questionUid);
                    if (r.isBookmarked && r.questionUid) incomingBookmarked.push(r.questionUid);
                }
            } else if (parsed.userState?.questions) {
                for (const [k, v] of Object.entries(parsed.userState.questions)) {
                    if (v.isSolved) incomingSolved.push(k);
                    if (v.isBookmarked) incomingBookmarked.push(k);
                }
            } else if (parsed.questions && typeof parsed.questions === "object") {
                for (const [k, v] of Object.entries(parsed.questions)) {
                    if (v.isSolved) incomingSolved.push(k);
                    if (v.isBookmarked) incomingBookmarked.push(k);
                }
            } else {
                incomingSolved = dedupeStringArray(
                    parsed.solvedQuestions || parsed.gate_qa_solved_questions
                );
                incomingBookmarked = dedupeStringArray(
                    parsed.bookmarkedQuestions || parsed.gate_qa_bookmarked_questions
                );
            }

            if (includeExtendedProgress && parsed.progress && typeof parsed.progress === "object") {
                incomingProgress = parsed.progress;
            }

            let finalSolved;
            let finalBookmarked;
            let finalProgress;

            if (strategy === "replace") {
                finalSolved = dedupeStringArray(incomingSolved);
                finalBookmarked = dedupeStringArray(incomingBookmarked);
                finalProgress = incomingProgress;
            } else {
                const currentSolved = dedupeStringArray(
                    readStorageJson(storageKeys.solved, [])
                );
                const currentBookmarked = dedupeStringArray(
                    readStorageJson(storageKeys.bookmarked, [])
                );
                const currentProgress = readStorageJson(storageKeys.progress, {});

                finalSolved = dedupeStringArray([...currentSolved, ...incomingSolved]);
                finalBookmarked = dedupeStringArray([
                    ...currentBookmarked,
                    ...incomingBookmarked,
                ]);
                finalProgress = {
                    ...currentProgress,
                    ...incomingProgress,
                    history: [
                        ...(currentProgress.history || []),
                        ...(incomingProgress.history || []),
                    ],
                };
            }

            const okSolved = writeStorageJson(storageKeys.solved, finalSolved);
            const okBookmarked = writeStorageJson(
                storageKeys.bookmarked,
                finalBookmarked
            );
            const okProgress = includeExtendedProgress
                ? writeStorageJson(storageKeys.progress, finalProgress)
                : true;

            const meta = {
                version: CURRENT_SCHEMA_VERSION,
                lastExported: new Date().toISOString(),
                exportType: "progress-only",
            };
            writeStorageJson(storageKeys.metadata, meta);

            if (!okSolved || !okBookmarked || !okProgress) {
                if (!okSolved && !okBookmarked) {
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
                `Progress ${label} - ${finalSolved.length} solved, ${finalBookmarked.length} bookmarked.`
            );
        },
        [includeExtendedProgress, modalData, refreshProgressState, showToast, storageKeys.bookmarked, storageKeys.metadata, storageKeys.progress, storageKeys.solved]
    );

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <div ref={helpRef}>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Desktop Toolbar */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-muted)] shadow-sm"
                            title="Export as CSV (View Only)"
                        >
                            <FaFileCsv className="text-xs" />
                            Export CSV
                        </button>

                        <button
                            onClick={handleImportClick}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-muted)] shadow-sm"
                            title="Import Progress"
                        >
                            <FaUpload className="text-xs" />
                            Import
                        </button>

                        <button
                            onClick={() => setHelpOpen((v) => !v)}
                            className="progress-manager-help-button inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--color-text-muted)] transition-colors hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-sm"
                            title="What do these buttons do?"
                            aria-expanded={helpOpen}
                            aria-label="Help for export and import"
                        >
                            <FaInfoCircle aria-hidden="true" className="text-xs" />
                        </button>
                    </div>

                    {/* Mobile Backup & Sync Dropdown */}
                    <div ref={mobileMenuRef} className="relative sm:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Backup and sync options"
                        >
                            <FaDownload className="text-xs text-sky-600 dark:text-sky-400" />
                            <span>Backup &amp; Sync</span>
                            <span className="text-[9px] text-[color:var(--color-text-muted)]">{mobileMenuOpen ? "▲" : "▼"}</span>
                        </button>

                        {mobileMenuOpen && (
                            <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1.5 shadow-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleExportJson();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)]"
                                >
                                    <FaDownload className="text-xs text-sky-600 dark:text-sky-400" />
                                    Export JSON (Backup)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleExportCsv();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)]"
                                >
                                    <FaFileCsv className="text-xs text-emerald-600 dark:text-emerald-400" />
                                    Export CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleImportClick();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)]"
                                >
                                    <FaUpload className="text-xs text-violet-600 dark:text-violet-400" />
                                    Import Backup
                                </button>
                                <div className="my-1 border-t border-[color:var(--color-border)]" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        setHelpOpen((prev) => !prev);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[color:var(--color-text-muted)] transition hover:bg-[color:var(--color-surface-muted)]"
                                >
                                    <FaInfoCircle className="text-xs" />
                                    What do these do?
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-muted)] shadow-sm shrink-0">
                        <span className="text-[color:var(--color-text)] font-bold mr-1">{solvedQuestionIds.length}</span> solved
                        <span className="mx-2 text-[color:var(--color-border)]">|</span>
                        <span className="text-[color:var(--color-text)] font-bold mr-1">{bookmarkedQuestionIds.length}</span> bookmarked
                    </div>
                </div>

                {helpOpen && (
                    <div className="mt-2 space-y-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 p-2.5 text-[11px] text-[color:var(--color-text-muted)] shadow-sm">
                        <div className="leading-snug">
                            <span className="font-semibold text-[color:var(--color-text)]">Export JSON</span> - Downloads a full workspace backup, including progress, notes, mocks, goals, and streak data.
                        </div>
                        <div className="leading-snug">
                            <span className="font-semibold text-[color:var(--color-text)]">Export CSV</span> - Downloads a read-only spreadsheet with year, subject, subtopic, and type for each question. Not importable.
                        </div>
                        <div className="leading-snug">
                            <span className="font-semibold text-[color:var(--color-text)]">Import</span> - Upload a previously exported .json file. Full workspace backups restore with Replace.
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
                    modalData ? getImportedCounts(modalData.parsed).solved : 0
                }
                importedBookmarkedCount={
                    modalData ? getImportedCounts(modalData.parsed).bookmarked : 0
                }
                schemaWarning={modalData?.schemaWarning}
                mergeDisabled={modalData?.mergeDisabled}
            />

            <Toast message={toast.message} visible={toast.visible} />
        </>
    );
}
