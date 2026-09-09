import React from 'react';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import { parseTrackYearSetKey } from '../../utils/examTrack';
import type { FilterActionsShape, FilterStateShape } from '../../types';

const YearFilter = () => {
    const { structuredTags = {}, filters = {} } = useFilterState() as FilterStateShape;
    const { updateFilters } = useFilterActions() as FilterActionsShape;
    const { yearSets = [] } = structuredTags;
    const { selectedYearSets = [] } = filters;

    const handleYearChange = (yearSetKey: string) => {
        let nextYearSets: string[];
        if (selectedYearSets.includes(yearSetKey)) {
            nextYearSets = selectedYearSets.filter(y => y !== yearSetKey);
        } else {
            nextYearSets = [...selectedYearSets, yearSetKey];
        }
        updateFilters({ selectedYearSets: nextYearSets });
    };

    if (!yearSets || yearSets.length === 0) return null;

    return (
        <div className="space-y-2">
            {yearSets.map((yearSet) => {
                const yearSetKey = yearSet.key;
                const rawDisplay = String(yearSet.label || '').trim();
                const parsedKey = parseTrackYearSetKey(yearSetKey);
                const isDaYearSet = parsedKey?.track === 'da'
                    || String(yearSet.track || yearSet.source || yearSet.paper || '').toLowerCase() === 'da'
                    || /^gate\s+da\b/i.test(String(yearSet.label || ''));
                const isItYearSet = parsedKey?.track === 'it'
                    || yearSet.paperScope === 'official_it'
                    || String(yearSet.track || yearSet.source || yearSet.paper || '').toLowerCase() === 'it'
                    || /^it-\d{4}/i.test(yearSetKey)
                    || /^it:/i.test(yearSetKey)
                    || /:it:/i.test(yearSetKey)
                    || /\bIT\b/i.test(rawDisplay);

                const isAdditional = Boolean(yearSet.isAdditional
                    || yearSet.paperScope === 'additional_ga'
                    || parsedKey?.isAdditional
                    || /additional/i.test(yearSetKey)
                    || /additional/i.test(rawDisplay));
                const displayYear = isAdditional
                    ? (rawDisplay.replace(/\s*additional(?:\s+questions?)?/i, '').trim() || (yearSet.year ? String(yearSet.year) : rawDisplay))
                    : isItYearSet
                        ? (rawDisplay.replace(/\s*IT\b/i, '').trim() || (yearSet.year ? String(yearSet.year) : rawDisplay))
                        : rawDisplay;
                const isSelected = selectedYearSets.includes(yearSetKey);

                return (
                    <label key={`${yearSetKey}-${isDaYearSet ? 'da' : isItYearSet ? 'it' : 'cse'}`} className="flex items-center cursor-pointer group">
                        <input
                            data-testid={`year-filter-${yearSetKey}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => handleYearChange(yearSetKey)}
                        />
                        <span className={`ml-3 flex min-w-0 items-center gap-2 text-sm transition-colors ${isSelected ? 'font-medium text-[color:var(--color-primary-text)]' : 'text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary-text)]'}`}>
                            <span>{displayYear}</span>
                            {isDaYearSet && (
                                <span
                                    aria-label="GATE DA"
                                    className="rounded-full border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-purple-text)]"
                                >
                                    DA
                                </span>
                            )}
                            {isAdditional && (
                                <span
                                    title="GA questions from other GATE papers"
                                    aria-label="Additional Questions"
                                    className="rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-warning-text)]"
                                >
                                    GA • Additional
                                </span>
                            )}
                            {isItYearSet && (
                                <span
                                    title="GATE Information Technology"
                                    aria-label="GATE IT"
                                    className="rounded-full border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-cyan-800 dark:text-cyan-300"
                                >
                                    IT
                                </span>
                            )}
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default YearFilter;
