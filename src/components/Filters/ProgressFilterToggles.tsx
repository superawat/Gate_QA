import React from 'react';

interface ToggleRowProps {
    id: string;
    label: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
}

interface ProgressFilterTogglesProps {
    hideSolved?: boolean;
    showOnlySolved?: boolean;
    showOnlyBookmarked?: boolean;
    onToggleHideSolved?: (checked: boolean) => void;
    onToggleShowOnlySolved?: (checked: boolean) => void;
    onToggleShowBookmarked?: (checked: boolean) => void;
}

const ToggleRow = ({ id, label, checked, onChange }: ToggleRowProps) => {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
            <span className="text-sm font-medium text-[color:var(--color-text)]">{label}</span>
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
    onToggleHideSolved,
    onToggleShowOnlySolved,
    onToggleShowBookmarked
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
        </div>
    );
};

export default ProgressFilterToggles;
