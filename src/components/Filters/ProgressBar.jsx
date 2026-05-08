import React from 'react';

const ProgressBar = ({ solvedCount = 0, totalQuestions = 0, progressPercentage = 0, className = '', children }) => {
    const boundedPercentage = Math.max(0, Math.min(100, progressPercentage));
    const allSolved = totalQuestions > 0 && solvedCount >= totalQuestions;

    return (
        <div className={`flex flex-col gap-2 rounded-lg border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)]/40 p-2 ${className}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                Your Progress
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--color-neutral-soft)]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                        style={{ width: `${boundedPercentage}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                    <span>
                        <span className="font-semibold text-[color:var(--color-text)]">{solvedCount}</span> / {totalQuestions} solved
                    </span>
                    <span>{boundedPercentage}% complete</span>
                </div>

                {allSolved && (
                    <div className="rounded bg-[color:var(--color-success-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--color-success-text)]">
                        Congratulations! All questions solved.
                    </div>
                )}
            </div>

            {children && <div className="mt-1">{children}</div>}
        </div>
    );
};

export default ProgressBar;
