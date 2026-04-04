/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { FilterProvider, useFilterState, useFilterActions } from './FilterContext';
import { QuestionService } from '../services/QuestionService';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.useFakeTimers();
vi.setSystemTime(new Date('2026-04-04T12:00:00Z'));

vi.mock('../services/QuestionService', () => ({
    QuestionService: {
        loaded: true,
        questions: [
            {
                question_uid: 'go:1',
                title: 'Q1',
                subjectSlug: 'databases',
                subtopics: [{ slug: 'schema-normalization' }],
                exam: { year: 2024 }
            },
            {
                question_uid: 'go:2',
                title: 'Q2',
                subjectSlug: 'os',
                subtopics: [{ slug: 'deadlock' }],
                exam: { year: 2024 }
            }
        ],
        getStructuredTags: vi.fn(() => ({
            minYear: 2000,
            maxYear: 2025,
            subjects: [
                { slug: 'databases', label: 'Databases' },
                { slug: 'os', label: 'Operating System' }
            ],
            structuredSubtopics: {
                'databases': [
                    { slug: 'schema-normalization', label: 'Schema Normalization' }
                ],
                'os': [
                    { slug: 'deadlock', label: 'Deadlock' }
                ]
            }
        })),
        parseYearSetKey: vi.fn(() => null),
        extractYearSetFromTag: vi.fn(() => null),
        normalizeSubjectSlug: vi.fn(s => String(s).toLowerCase()),
        slugifyToken: vi.fn(s => String(s).toLowerCase()),
        normalizeTypeToken: vi.fn(t => (t || 'MCQ').toUpperCase()),
        formatYearSetLabel: vi.fn(s => s)
    },
}));

vi.mock('../services/AnswerService', () => ({
    AnswerService: {
        getStorageKeyForQuestion: vi.fn(q => q.question_uid),
        getAnswerForQuestion: vi.fn(() => null)
    }
}));

describe('FilterContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.history.replaceState({}, '', '/');
    });

    const TestComponent = () => {
        const { filters, filteredQuestions } = useFilterState();
        const { updateFilters } = useFilterActions();

        return (
            <div>
                <div data-testid="subjects">{filters.selectedSubjects.join(',')}</div>
                <div data-testid="subtopics">{filters.selectedSubtopics.join(',')}</div>
                <div data-testid="year-range">{filters.yearRange.join(',')}</div>
                <div data-testid="filtered-question-uids">{filteredQuestions.map((question) => question.question_uid).join(',')}</div>
                <button
                    data-testid="add-both"
                    onClick={() => updateFilters({ selectedSubjects: ['databases'], selectedSubtopics: ['schema-normalization'] })}
                >Add</button>
                <button
                    data-testid="remove-subject"
                    onClick={() => updateFilters({ selectedSubjects: [] })}
                >Remove</button>
            </div>
        );
    };

    test('removes orphaned subtopics when parent subject is unselected', async () => {
        const { getByTestId } = render(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        // Initial loaded effect will run since QuestionService.loaded = true

        act(() => {
            getByTestId('add-both').click();
        });

        expect(getByTestId('subjects').textContent).toBe('databases');
        expect(getByTestId('subtopics').textContent).toBe('schema-normalization');

        act(() => {
            getByTestId('remove-subject').click();
        });

        expect(getByTestId('subjects').textContent).toBe('');

        // The subtopic should have been automatically removed when its subject
        // 'databases' was removed from the selectedSubjects list.
        expect(getByTestId('subtopics').textContent).toBe('');
    });

    test('hydrates subtopic-only URLs through parent subject normalization', async () => {
        window.history.replaceState({}, '', '/?subtopics=schema-normalization');

        const { getByTestId } = render(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('databases');
        });

        expect(getByTestId('subtopics').textContent).toBe('schema-normalization');
        expect(getByTestId('filtered-question-uids').textContent).toBe('go:1');
        expect(window.location.search).toContain('subjects=databases');
    });

    test('hydrates the default year range from structured tags when a new year is added', async () => {
        QuestionService.getStructuredTags.mockReturnValue({
            minYear: 1987,
            maxYear: 2026,
            subjects: [
                { slug: 'databases', label: 'Databases' },
                { slug: 'os', label: 'Operating System' }
            ],
            structuredSubtopics: {
                databases: [
                    { slug: 'schema-normalization', label: 'Schema Normalization' }
                ],
                os: [
                    { slug: 'deadlock', label: 'Deadlock' }
                ]
            }
        });

        const { getByTestId } = render(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        expect(getByTestId('year-range').textContent).toBe('1987,2026');
    });
});
