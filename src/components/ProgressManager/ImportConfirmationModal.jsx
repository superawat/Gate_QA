import React, { useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * Displays current vs. incoming progress counts and lets the user choose how to
 * apply the selected backup before writing to localStorage.
 */
export default function ImportConfirmationModal({
    isOpen,
    onClose,
    onReplace,
    onMerge,
    currentSolvedCount,
    currentBookmarkedCount,
    importedSolvedCount,
    importedBookmarkedCount,
    schemaWarning,
    mergeDisabled = false,
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative z-[10000] max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-[color:var(--color-text)] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-text)]">
                    Import Progress
                </h2>

                {schemaWarning && (
                    <div className="mb-4 rounded-lg border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-3 text-sm text-[color:var(--color-warning-text)]">
                        {schemaWarning}
                    </div>
                )}

                <div className="mb-6 space-y-3">
                    <div className="rounded-lg bg-[color:var(--color-surface-muted)] p-3">
                        <p className="mb-1 text-sm font-medium text-[color:var(--color-text-muted)]">
                            Your current progress
                        </p>
                        <p className="text-sm text-[color:var(--color-text)]">
                            <span className="font-semibold">{currentSolvedCount}</span> solved
                            {" - "}
                            <span className="font-semibold">{currentBookmarkedCount}</span> bookmarked
                        </p>
                    </div>
                    <div className="rounded-lg bg-[color:var(--color-primary-soft)] p-3">
                        <p className="mb-1 text-sm font-medium text-[color:var(--color-primary-text)]">
                            File contains
                        </p>
                        <p className="text-sm text-[color:var(--color-text)]">
                            <span className="font-semibold">{importedSolvedCount}</span> solved
                            {" - "}
                            <span className="font-semibold">{importedBookmarkedCount}</span> bookmarked
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={onMerge}
                        disabled={mergeDisabled}
                        className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                            mergeDisabled
                                ? "cursor-not-allowed bg-[color:var(--color-text-muted)] opacity-60"
                                : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)]"
                        }`}
                    >
                        Merge - combine with existing progress
                    </button>
                    {mergeDisabled && (
                        <p className="text-center text-xs text-[color:var(--color-text-muted)]">
                            Full workspace backups restore all saved GateQA data. Use Replace on the new domain.
                        </p>
                    )}
                    <button
                        onClick={onReplace}
                        className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                        Replace - discard existing progress
                    </button>
                    <p className="text-center text-xs text-[color:var(--color-danger-text)]">
                        Replace will permanently remove your current progress.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface)]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
