/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { FilterProvider } from './FilterContext';
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
        ensureQuestionDetail: vi.fn(async (question) => question),
    },
}));

vi.mock('../services/AptitudeQuestionService', () => ({
    AptitudeQuestionService: {
        ensureQuestionDetail: vi.fn(async (question) => question),
    },
}));

vi.mock('../services/AnswerService', () => ({
    AnswerService: {
        getStorageKeyForQuestion: vi.fn((question) => question?.question_uid || null),
        getAnswerForQuestion: vi.fn(() => null),
    },
}));

let latestSession = null;

const SessionHarness = () => {
    latestSession = useSession();
    return null;
};

describe('SessionContext', () => {
    beforeEach(() => {
        latestSession = null;
        vi.clearAllMocks();
        window.localStorage.clear();
        window.history.replaceState({}, '', '/practice');
    });

    const renderHarness = () => render(
        <BrowserRouter>
            <FilterProvider>
                <SessionProvider>
                    <SessionHarness />
                </SessionProvider>
            </FilterProvider>
        </BrowserRouter>
    );

    test('supports ordered navigation for Explore -> Solve flows', async () => {
        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        let firstQuestion;
        act(() => {
            firstQuestion = latestSession.startOrderedSession([
                { question_uid: 'q1' },
                { question_uid: 'q2' },
                { question_uid: 'q3' },
            ], 'q2');
        });

        expect(firstQuestion.question_uid).toBe('q2');
        expect(latestSession.getNavigationState('q2')).toMatchObject({
            previousUid: 'q1',
            nextUid: 'q3',
            canGoPrevious: true,
            canGoNext: true,
        });

        let previousQuestion;
        act(() => {
            previousQuestion = latestSession.goToPreviousQuestion('q2');
        });

        expect(previousQuestion.question_uid).toBe('q1');
        expect(latestSession.getNavigationState('q1').canGoPrevious).toBe(false);
    });

    test('prefetches the next likely question details in active sessions', async () => {
        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        QuestionService.ensureQuestionDetail.mockClear();

        act(() => {
            latestSession.startOrderedSession([
                { question_uid: 'q1' },
                { question_uid: 'q2' },
                { question_uid: 'q3' },
            ], 'q1');
        });

        await waitFor(() => {
            expect(QuestionService.ensureQuestionDetail).toHaveBeenCalledTimes(2);
        });

        expect(QuestionService.ensureQuestionDetail.mock.calls.map(([question]) => question.question_uid)).toEqual(['q2', 'q3']);
    });

    test('supports random sessions and reshuffles when the queue is exhausted', async () => {
        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        let firstQuestion;
        act(() => {
            firstQuestion = latestSession.startRandomSession([
                { question_uid: 'q1' },
                { question_uid: 'q2' },
            ]);
        });

        expect(['q1', 'q2']).toContain(firstQuestion.question_uid);

        let secondQuestion;
        act(() => {
            secondQuestion = latestSession.goToNextQuestion(firstQuestion.question_uid);
        });

        expect(secondQuestion.question_uid).not.toBe(firstQuestion.question_uid);
        expect(latestSession.showExhaustionBanner).toBe(false);

        let reshuffledQuestion;
        act(() => {
            reshuffledQuestion = latestSession.goToNextQuestion(secondQuestion.question_uid);
        });

        expect(reshuffledQuestion).toBeTruthy();
        expect(latestSession.showExhaustionBanner).toBe(true);
        expect(latestSession.getNavigationState(reshuffledQuestion.question_uid).total).toBe(2);
    });

    test('starts filtered random practice on the selected question without locking to its subtopic', async () => {
        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        const pool = [
            { question_uid: 'reasoning-coding-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'reasoning-coding-2', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'reasoning-direction-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'direction-sense' }] },
            { question_uid: 'reasoning-blood-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'blood-relations' }] },
        ];

        let firstQuestion;
        act(() => {
            firstQuestion = latestSession.startRandomSession(pool, 'reasoning-coding-2');
        });

        expect(firstQuestion.question_uid).toBe('reasoning-coding-2');
        expect(latestSession.sessionQueue[0]).toBe('reasoning-coding-2');
        expect(latestSession.sessionQueue[1]).not.toMatch(/coding/);
    });

    test('uses a stratified fair shuffle bag across reasoning subtopics', async () => {
        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        const pool = [
            { question_uid: 'coding-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'coding-2', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'direction-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'direction-sense' }] },
            { question_uid: 'direction-2', subjectSlug: 'reasoning', subtopics: [{ slug: 'direction-sense' }] },
            { question_uid: 'blood-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'blood-relations' }] },
            { question_uid: 'blood-2', subjectSlug: 'reasoning', subtopics: [{ slug: 'blood-relations' }] },
        ];

        act(() => {
            latestSession.startRandomSession(pool);
        });

        const topicOrder = latestSession.sessionQueue.map((uid) => uid.split('-')[0]);
        expect(new Set(topicOrder.slice(0, 3))).toEqual(new Set(['coding', 'direction', 'blood']));
        topicOrder.forEach((topic, index) => {
            if (index === 0) {
                return;
            }
            expect(topic).not.toBe(topicOrder[index - 1]);
        });
    });

    test('uses persisted recent topic memory to avoid reopening on the same random subtopic', async () => {
        window.localStorage.setItem('gateqa_random_recent_topics_v1', JSON.stringify({
            recentTopicKeys: ['reasoning::coding-decoding'],
            lastSubjectKey: 'reasoning',
        }));

        renderHarness();

        await waitFor(() => {
            expect(latestSession).toBeTruthy();
        });

        const pool = [
            { question_uid: 'coding-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'coding-2', subjectSlug: 'reasoning', subtopics: [{ slug: 'coding-decoding' }] },
            { question_uid: 'direction-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'direction-sense' }] },
            { question_uid: 'blood-1', subjectSlug: 'reasoning', subtopics: [{ slug: 'blood-relations' }] },
        ];

        let firstQuestion;
        act(() => {
            firstQuestion = latestSession.startRandomSession(pool);
        });

        expect(firstQuestion.question_uid).toBe('direction-1');

        const memory = JSON.parse(window.localStorage.getItem('gateqa_random_recent_topics_v1'));
        expect(memory.recentTopicKeys[0]).toBe('reasoning::direction-sense');
    });
});
