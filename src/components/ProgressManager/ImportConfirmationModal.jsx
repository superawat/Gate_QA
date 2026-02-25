import React from "react";

/**
 * ImportConfirmationModal
 *
 * Displays current vs. incoming progress counts and lets the user
 * choose between Replace, Merge, or Cancel before writing to localStorage.
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
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Import Progress
                </h2>

                {schemaWarning && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ {schemaWarning}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Your current progress
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">{currentSolvedCount}</span> solved
                            {" · "}
                            <span className="font-semibold">{currentBookmarkedCount}</span>{" "}
                            bookmarked
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">
                            File contains
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">{importedSolvedCount}</span> solved
                            {" · "}
                            <span className="font-semibold">{importedBookmarkedCount}</span>{" "}
                            bookmarked
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={onMerge}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        Merge — combine with existing progress
                    </button>
                    <button
                        onClick={onReplace}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        Replace — discard existing progress
                    </button>
                    <p className="text-xs text-red-500 dark:text-red-400 text-center">
                        Replace will permanently remove your current progress.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
