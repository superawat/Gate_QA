/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { FilterProvider, useFilterState, useFilterActions } from './FilterContext';
import { QuestionService } from '../services/QuestionService';
import { describe, test, expect, vi, beforeEach } from 'vitest';

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
            }
        ],
        getStructuredTags: vi.fn(() => ({
            minYear: 2000,
            maxYear: 2025,
            subjects: [{ slug: 'databases', label: 'Databases' }],
            structuredSubtopics: {
                'databases': [
                    { slug: 'schema-normalization', label: 'Schema Normalization' }
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
    });

    const TestComponent = () => {
        const { filters } = useFilterState();
        const { updateFilters } = useFilterActions();

        return (
            <div>
                <div data-testid="subjects">{filters.selectedSubjects.join(',')}</div>
                <div data-testid="subtopics">{filters.selectedSubtopics.join(',')}</div>
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
});
