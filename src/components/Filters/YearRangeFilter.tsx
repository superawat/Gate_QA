import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import type { FilterActionsShape, FilterStateShape } from '../../types';

const YearRangeFilter = () => {
    const { structuredTags = {}, filters = {} } = useFilterState() as FilterStateShape;
    const { updateFilters } = useFilterActions() as FilterActionsShape;
    const { minYear = 0, maxYear = 0 } = structuredTags;
    const { yearRange } = filters;
    const handleLabels = ['Minimum year', 'Maximum year'];

    const clampedMin = minYear > 0 ? Math.max(minYear, Math.min(maxYear || minYear, Number(yearRange?.[0] ?? minYear))) : minYear;
    const clampedMax = maxYear > 0 ? Math.min(maxYear, Math.max(clampedMin, Number(yearRange?.[1] ?? maxYear))) : maxYear;
    const effectiveRange: [number, number] = [clampedMin, clampedMax];

    const [localRange, setLocalRange] = useState<[number, number]>(effectiveRange);

    useEffect(() => {
        setLocalRange(effectiveRange);
    }, [clampedMin, clampedMax, yearRange]);

    if (minYear === 0 || maxYear === 0) return null;

    const handleSliderChange = (newRange: number | number[]) => {
        if (!Array.isArray(newRange) || newRange.length < 2) {
            return;
        }
        setLocalRange([newRange[0], newRange[1]]);
    };

    const handleSliderCommit = (newRange: number | number[]) => {
        if (!Array.isArray(newRange) || newRange.length < 2) {
            return;
        }
        updateFilters({ yearRange: [newRange[0], newRange[1]] });
    };

    return (
        <div className="px-2 py-4">
            <div className="flex justify-between text-sm font-medium text-[color:var(--color-text-muted)] mb-4">
                <span>{localRange[0]}</span>
                <span>{localRange[1]}</span>
            </div>
            <Slider
                range
                min={minYear}
                max={maxYear}
                value={localRange}
                onChange={handleSliderChange}
                onChangeComplete={handleSliderCommit}
                ariaLabelForHandle={handleLabels}
                ariaValueTextFormatterForHandle={[
                    (value) => `Minimum year ${value}`,
                    (value) => `Maximum year ${value}`,
                ]}
                handleRender={(node, handleProps) => {
                    const label = handleLabels[handleProps.index] || 'Year';
                    return React.cloneElement(node, {
                        'aria-label': label,
                        title: `${label}: ${handleProps.value}`,
                    });
                }}
                trackStyle={[{ backgroundColor: 'var(--color-primary, #0284c7)' }]}
                handleStyle={[
                    {
                        borderColor: 'var(--color-primary, #0284c7)',
                        backgroundColor: 'var(--color-primary, #0284c7)',
                        opacity: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    },
                    {
                        borderColor: 'var(--color-primary, #0284c7)',
                        backgroundColor: 'var(--color-primary, #0284c7)',
                        opacity: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    },
                ]}
                railStyle={{ backgroundColor: 'var(--color-border, #e2e8f0)' }}
            />
        </div>
    );
};

export default YearRangeFilter;
