import React from 'react';
import { useFilters } from '../../contexts/FilterContext';

const YearFilter = () => {
    const { structuredTags, filters, updateFilters } = useFilters();
    const { yearSets = [] } = structuredTags;
    const { selectedYearSets } = filters;

    const handleYearChange = (yearSetKey) => {
        let nextYearSets;
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
                const isSelected = selectedYearSets.includes(yearSetKey);

                return (
                    <label key={yearSetKey} className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => handleYearChange(yearSetKey)}
                        />
                        <span className={`ml-3 text-sm transition-colors ${isSelected ? 'font-medium text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {displayYear}
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default YearFilter;
