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

    test('renders separate selectable options for CSE and IT papers without merging', () => {
        filterState = {
            structuredTags: {
                yearSets: [
                    { key: 'cse:2009:set-0', label: '2009', year: 2009, track: 'cse' },
                    { key: 'cse:2008:set-0', label: '2008', year: 2008, track: 'cse' },
                    { key: 'it:2008:set-0', label: '2008 IT', year: 2008, track: 'it', paperScope: 'official_it' },
                    { key: 'cse:2005:set-0', label: '2005', year: 2005, track: 'cse' },
                    { key: 'it:2005:set-0', label: '2005 IT', year: 2005, track: 'it', paperScope: 'official_it' },
                    { key: 'cse:2004:set-0', label: '2004', year: 2004, track: 'cse' },
                    { key: 'it:2004:set-0', label: '2004 IT', year: 2004, track: 'it', paperScope: 'official_it' },
                ],
            },
            filters: { selectedYearSets: [] },
        };

        render(<YearFilter />);

        // Must display 2009 (single option)
        expect(screen.getByTestId('year-filter-cse:2009:set-0')).toBeTruthy();

        // Must display separate checkboxes for 2008 CSE and 2008 IT
        const cse2008 = screen.getByTestId('year-filter-cse:2008:set-0');
        const it2008 = screen.getByTestId('year-filter-it:2008:set-0');
        expect(cse2008).toBeTruthy();
        expect(it2008).toBeTruthy();

        // Must display separate checkboxes for 2005 CSE and 2005 IT
        const cse2005 = screen.getByTestId('year-filter-cse:2005:set-0');
        const it2005 = screen.getByTestId('year-filter-it:2005:set-0');
        expect(cse2005).toBeTruthy();
        expect(it2005).toBeTruthy();

        // IT options have the cyan IT badge
        const itBadges = screen.getAllByLabelText('GATE IT');
        expect(itBadges.length).toBe(3); // 2008, 2005, 2004
        itBadges.forEach((badge) => {
            expect(badge.textContent).toBe('IT');
        });

        // Must NEVER display "CSE + IT"
        expect(screen.queryByText(/CSE\s*\+\s*IT/i)).toBeNull();

        // Clicking 2008 CSE selects ONLY cse:2008:set-0
        fireEvent.click(cse2008);
        expect(updateFilters).toHaveBeenLastCalledWith({ selectedYearSets: ['cse:2008:set-0'] });

        // Clicking 2008 IT selects ONLY it:2008:set-0
        fireEvent.click(it2008);
        expect(updateFilters).toHaveBeenLastCalledWith({ selectedYearSets: ['it:2008:set-0'] });
    });
});
