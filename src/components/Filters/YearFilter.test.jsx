/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import YearFilter from './YearFilter';

const updateFilters = vi.fn();
let filterState = {
    structuredTags: {
        yearSets: [
            { key: 'cse:2026:set-2', label: '2026 Set 2', year: 2026, set: 2, track: 'cse' },
            { key: 'cse:2026:set-1', label: '2026 Set 1', year: 2026, set: 1, track: 'cse' },
            { key: 'da:2026:set-1', label: '2026 Set 1', year: 2026, set: 1, track: 'da' },
            { key: 'cse:2024:additional', label: '2024 Additional Questions', year: 2024, isAdditional: true, track: 'cse' },
        ],
    },
    filters: { selectedYearSets: [] },
};

vi.mock('../../contexts/FilterContext', () => ({
    useFilterState: () => filterState,
    useFilterActions: () => ({ updateFilters }),
}));

describe('YearFilter', () => {
    test('marks only DA year entries with the compact DA badge', () => {
        render(<YearFilter />);

        expect(screen.getByText('DA')).toBeTruthy();
        expect(screen.getAllByText('2026 Set 1')).toHaveLength(2);
        expect(screen.getByText('2026 Set 2')).toBeTruthy();
    });

    test('uses independent track-aware keys for paired CSE and DA entries', () => {
        render(<YearFilter />);

        fireEvent.click(screen.getByText('DA'));

        expect(updateFilters).toHaveBeenCalledWith({ selectedYearSets: ['da:2026:set-1'] });

        fireEvent.click(screen.getAllByText('2026 Set 1')[0]);

        expect(updateFilters).toHaveBeenLastCalledWith({ selectedYearSets: ['cse:2026:set-1'] });
    });

    test('strips redundant Additional Questions text and renders GA • Additional badge', () => {
        render(<YearFilter />);

        expect(screen.getByText('2024')).toBeTruthy();
        expect(screen.queryByText('2024 Additional Questions')).toBeNull();
        expect(screen.getByText('GA • Additional')).toBeTruthy();

        fireEvent.click(screen.getByText('2024'));
        expect(updateFilters).toHaveBeenLastCalledWith({ selectedYearSets: ['cse:2024:additional'] });
    });
});
