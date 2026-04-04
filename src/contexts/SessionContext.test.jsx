/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FilterProvider, useFilterActions } from './FilterContext';
import { SessionProvider, useSession } from './SessionContext';
import { QuestionService } from '../services/QuestionService';

vi.spyOn(Math, 'random').mockReturnValue(0);

vi.mock('../services/QuestionService', () => ({
    QuestionService: {
        loaded: true,
        questions: [
            {
                question_uid: 'q1',
                title: 'Q1',
                type: 'MCQ',
                subjectSlug: 'algorithms',
                subtopics: [],
                exam: { year: 2024, yearSetKey: '2024-s0' }
            },
            {
                question_uid: 'q2',
                title: 'Q2',
                type: 'MCQ',
                subjectSlug: 'algorithms',
                subtopics: [],
                exam: { year: 2024, yearSetKey: '2024-s0' }
            },
            {
                question_uid: 'q3',
                title: 'Q3',
                type: 'MCQ',
                subjectSlug: 'algorithms',
                subtopics: [],
                exam: { year: 2023, yearSetKey: '2023-s0' }
            }
        ],
        getStructuredTags: vi.fn(() => ({
            yearSets: [
                { key: '2024-s0', label: '2024', year: 2024, set: 0, count: 2 },
                { key: '2023-s0', label: '2023', year: 2023, set: 0, count: 1 }
            ],
            years: ['2024-s0', '2023-s0'],
            subjects: [{ slug: 'algorithms', label: 'Algorithms' }],
            topics: [],
            structuredSubtopics: { algorithms: [] },
            structuredTopics: {},
            minYear: 2023,
            maxYear: 2024
        })),
        parseYearSetKey: vi.fn((value) => {
            const match = String(value || '').match(/^(\d{4})-s(\d+)$/);
            if (!match) return null;
            return {
                year: Number.parseInt(match[1], 10),
                set: Number.parseInt(match[2], 10),
                key: `${match[1]}-s${match[2]}`
            };
        }),
        extractYearSetFromTag: vi.fn(() => null),
        buildYearSetKey: vi.fn((year, setNo = 0) => `${year}-s${setNo}`),
        normalizeSubjectSlug: vi.fn((value) => String(value || '').trim().toLowerCase()),
        slugifyToken: vi.fn((value) => String(value || '').trim().toLowerCase()),
        normalizeTypeToken: vi.fn((value) => String(value || 'MCQ').trim().toUpperCase()),
        formatYearSetLabel: vi.fn((value) => String(value || '')),
    },
}));

vi.mock('../services/AnswerService', () => ({
    AnswerService: {
        getStorageKeyForQuestion: vi.fn((question) => question?.question_uid || null),
        getAnswerForQuestion: vi.fn(() => null),
    },
}));

const SessionHarness = () => {
    const { updateFilters } = useFilterActions();
    const { sessionQueue, currentIndex } = useSession();

    return (
        <div>
            <div data-testid="queue">{sessionQueue.join(',')}</div>
            <div data-testid="current-uid">{sessionQueue[currentIndex] || ''}</div>
            <button
                data-testid="filter-2024"
                onClick={() => updateFilters({ selectedYearSets: ['2024-s0'] })}
            >
                Filter 2024
            </button>
        </div>
    );
};

describe('SessionContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
        window.history.replaceState({}, '', '/?question=q1');
    });

    test('keeps the deep-linked current question pinned when a year filter rebuilds the queue', async () => {
        const { getByTestId } = render(
            <FilterProvider>
                <SessionProvider>
                    <SessionHarness />
                </SessionProvider>
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('current-uid').textContent).toBe('q1');
        });

        await act(async () => {
            getByTestId('filter-2024').click();
        });

        await waitFor(() => {
            expect(getByTestId('queue').textContent).toBe('q2,q1');
            expect(getByTestId('current-uid').textContent).toBe('q1');
        });
    });
});
