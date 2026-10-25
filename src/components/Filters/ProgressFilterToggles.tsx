import React from 'react';

interface ToggleRowProps {
    id: string;
    label: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
    badge?: React.ReactNode;
}

interface ProgressFilterTogglesProps {
    hideSolved?: boolean;
    showOnlySolved?: boolean;
    showOnlyBookmarked?: boolean;
    unlockDetailedSolutions?: boolean;
    onToggleHideSolved?: (checked: boolean) => void;
    onToggleShowOnlySolved?: (checked: boolean) => void;
    onToggleShowBookmarked?: (checked: boolean) => void;
    onToggleUnlockDetailedSolutions?: (checked: boolean) => void;
}

const ToggleRow = ({ id, label, checked, onChange, badge }: ToggleRowProps) => {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text)]">
                <span>{label}</span>
                {badge}
            </span>
            <span className="relative inline-flex h-6 w-11 items-center">
                <input
                    id={id}
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(event) => onChange?.(event.target.checked)}
                />
                <span className="h-6 w-11 rounded-full bg-[color:var(--color-neutral-border)] transition-colors duration-200 peer-checked:bg-[color:var(--color-primary)]" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-surface)] shadow transition-transform duration-200 peer-checked:translate-x-5" />
            </span>
        </label>
    );
};

const ProgressFilterToggles = ({
    hideSolved = false,
    showOnlySolved = false,
    showOnlyBookmarked = false,
    unlockDetailedSolutions = false,
    onToggleHideSolved,
    onToggleShowOnlySolved,
    onToggleShowBookmarked,
    onToggleUnlockDetailedSolutions
}: ProgressFilterTogglesProps) => {
    return (
        <div className="space-y-1">
            <ToggleRow
                id="hide-solved-toggle"
                label="Hide solved"
                checked={hideSolved}
                onChange={onToggleHideSolved}
            />
            <ToggleRow
                id="show-only-solved-toggle"
                label="Solved only"
                checked={showOnlySolved}
                onChange={onToggleShowOnlySolved}
            />
            <ToggleRow
                id="show-bookmarked-toggle"
                label="Bookmarked only"
                checked={showOnlyBookmarked}
                onChange={onToggleShowBookmarked}
            />
            <ToggleRow
                id="unlock-detailed-solutions-toggle"
                label="Unlock solutions"
                checked={unlockDetailedSolutions}
                onChange={onToggleUnlockDetailedSolutions}
                badge={
                    <span className="rounded-full border border-pink-300/60 bg-pink-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-pink-700 dark:border-pink-800/60 dark:bg-pink-950/60 dark:text-pink-300">
                        new
                    </span>
                }
            />
        </div>
    );
};

export default ProgressFilterToggles;
