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
                const displayYear = yearSet.label;
                const isDaYearSet = parseTrackYearSetKey(yearSetKey)?.track === 'da'
                    || String(yearSet.track || yearSet.source || yearSet.paper || '').toLowerCase() === 'da'
                    || /^gate\s+da\b/i.test(String(displayYear || ''));
                const isSelected = selectedYearSets.includes(yearSetKey);

                return (
                    <label key={`${yearSetKey}-${isDaYearSet ? 'da' : 'cse'}`} className="flex items-center cursor-pointer group">
                        <input
                            data-testid={`year-filter-${yearSetKey}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => handleYearChange(yearSetKey)}
                        />
                        <span className={`ml-3 flex min-w-0 items-center gap-2 text-sm transition-colors ${isSelected ? 'font-medium text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {displayYear}
                            {isDaYearSet && (
                                <span
                                    aria-label="GATE DA"
                                    className="rounded-full border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-purple-text)]"
                                >
                                    DA
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
