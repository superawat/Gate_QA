/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FilterProvider, useFilterState, useFilterActions } from './FilterContext';
import ActiveFilterChips from '../components/Filters/ActiveFilterChips';
import TopicFilter from '../components/Filters/TopicFilter';
import { QuestionService } from '../services/QuestionService';
import { AnswerService } from '../services/AnswerService';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.useFakeTimers();
vi.setSystemTime(new Date('2026-04-04T12:00:00Z'));

const aptitudeMock = vi.hoisted(() => ({
    init: vi.fn(async () => {}),
    questions: [
        {
            question_uid: 'APT-ENG-0001',
            title: 'English Practice',
            searchText: 'english spot the error aptitude',
            subjectSlug: 'english',
            subject: 'English',
            subjectLabel: 'English',
            type: 'mcq',
            subtopics: [{ slug: 'spot-the-error', label: 'Spot the Error' }],
            answerMeta: { type: 'MCQ', answer: 'A' },
            exam: { year: null, yearSetKey: null }
        }
    ],
}));

vi.mock('../services/QuestionService', () => ({
    QuestionService: {
        loaded: true,
        questions: [
            {
                question_uid: 'go:1',
                title: 'Q1',
                searchText: 'database schema normalization functional dependency',
                subjectSlug: 'databases',
                type: 'MCQ',
                subtopics: [{ slug: 'schema-normalization' }],
                exam: { year: 2024 }
            },
            {
                question_uid: 'go:2',
                title: 'Q2',
                searchText: 'operating system deadlock prevention resource allocation',
                subjectSlug: 'os',
                type: 'NAT',
                subtopics: [{ slug: 'deadlock' }],
                exam: { year: 2024 }
            },
            {
                question_uid: 'go:3',
                title: 'Q3',
                searchText: 'legacy pascal runtime environment older syllabus topic',
                subjectSlug: 'legacy-other',
                type: 'MCQ',
                subtopics: [{ slug: 'pascal' }],
                exam: { year: 1995 }
            }
        ],
        getStructuredTags: vi.fn(() => ({
            minYear: 2000,
            maxYear: 2025,
            subjects: [
                { slug: 'databases', label: 'Databases' },
                { slug: 'os', label: 'Operating System' },
                { slug: 'legacy-other', label: 'Other / Optional' }
            ],
            structuredSubtopics: {
                databases: [
                    { slug: 'schema-normalization', label: 'Schema Normalization' }
                ],
                os: [
                    { slug: 'deadlock', label: 'Deadlock' }
                ],
                'legacy-other': [
                    { slug: 'pascal', label: 'Pascal' }
                ]
            }
        })),
        parseYearSetKey: vi.fn(() => null),
        extractYearSetFromTag: vi.fn(() => null),
        normalizeSubjectSlug: vi.fn((s) => String(s).toLowerCase()),
        slugifyToken: vi.fn((s) => String(s).toLowerCase()),
        normalizeTypeToken: vi.fn((t) => (t || 'MCQ').toUpperCase()),
        formatYearSetLabel: vi.fn((s) => s),
        ensureQuestionDetail: vi.fn()
    },
}));

vi.mock('../services/AptitudeQuestionService', () => ({
    AptitudeQuestionService: {
        get loaded() {
            return true;
        },
        get questions() {
            return aptitudeMock.questions;
        },
        init: aptitudeMock.init,
        getStructuredTags: vi.fn(() => ({
            minYear: 0,
            maxYear: 0,
            subjects: [
                { slug: 'english', label: 'English', count: 1 }
            ],
            structuredSubtopics: {
                english: [
                    { slug: 'spot-the-error', label: 'Spot the Error' }
                ]
            },
            structuredTopics: {
                English: ['Spot the Error']
            },
            questionTypes: ['MCQ'],
            yearSets: [],
            years: [],
            topics: ['english'],
            hideYearFilters: true
        })),
    },
}));

vi.mock('../services/AnswerService', () => ({
    AnswerService: {
        getStorageKeyForQuestion: vi.fn((q) => q.question_uid),
        getAnswerForQuestion: vi.fn(() => null)
    }
}));

describe('FilterContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
        window.history.replaceState({}, '', '/practice');
    });

    const renderWithRouter = (ui) => render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );

    const TestComponent = () => {
        const { allQuestions, filters, filteredQuestions, structuredTags } = useFilterState();
        const { isQuestionSolved, toggleBookmark, toggleSolved, updateFilters } = useFilterActions();

        return (
            <div>
                <div data-testid="all-question-uids">{allQuestions.map((question) => question.question_uid).join(',')}</div>
                <div data-testid="subject-options">{(structuredTags.subjects || []).map((subject) => subject.slug).join(',')}</div>
                <div data-testid="subjects">{filters.selectedSubjects.join(',')}</div>
                <div data-testid="subtopics">{filters.selectedSubtopics.join(',')}</div>
                <div data-testid="year-range">{filters.yearRange.join(',')}</div>
                <div data-testid="search-query">{filters.searchQuery}</div>
                <div data-testid="selected-types">{filters.selectedTypes.join(',')}</div>
                <div data-testid="filtered-question-uids">{filteredQuestions.map((question) => question.question_uid).join(',')}</div>
                <div data-testid="apt-solved">{isQuestionSolved('APT-ENG-0001') ? 'yes' : 'no'}</div>
                <ActiveFilterChips />
                <TopicFilter />
                <button
                    data-testid="add-both"
                    onClick={() => updateFilters({ selectedSubjects: ['databases'], selectedSubtopics: ['schema-normalization'] })}
                >Add</button>
                <button
                    data-testid="remove-subject"
                    onClick={() => updateFilters({ selectedSubjects: [] })}
                >Remove</button>
                <button
                    data-testid="set-search"
                    onClick={() => updateFilters({ searchQuery: 'deadlock' })}
                >Search</button>
                <button
                    data-testid="set-search-match"
                    onClick={() => updateFilters({ searchQuery: '  DEAD   lock   prevention ' })}
                >SearchMatch</button>
                <button
                    data-testid="set-search-miss"
                    onClick={() => updateFilters({ searchQuery: 'deadlock normalization' })}
                >SearchMiss</button>
                <button
                    data-testid="set-combined-filters"
                    onClick={() => updateFilters({
                        selectedSubjects: ['os'],
                        selectedTypes: ['nat'],
                        searchQuery: '  deadlock   prevention ',
                    })}
                >Combined</button>
                <button
                    data-testid="solve-apt"
                    onClick={() => toggleSolved('APT-ENG-0001')}
                >Solve Apt</button>
                <button
                    data-testid="bookmark-apt"
                    onClick={() => toggleBookmark('APT-ENG-0001')}
                >Bookmark Apt</button>
            </div>
        );
    };

    test('removes orphaned subtopics when parent subject is unselected', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        act(() => {
            getByTestId('add-both').click();
        });

        expect(getByTestId('subjects').textContent).toBe('databases');
        expect(getByTestId('subtopics').textContent).toBe('schema-normalization');

        act(() => {
            getByTestId('remove-subject').click();
        });

        expect(getByTestId('subjects').textContent).toBe('');
        expect(getByTestId('subtopics').textContent).toBe('');
    });

    test('hydrates subtopic-only URLs through parent subject normalization', async () => {
        window.history.replaceState({}, '', '/practice?subtopics=schema-normalization');

        const { getByTestId } = renderWithRouter(
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

    test('auto-expands the active subject when subtopics are preselected', async () => {
        window.history.replaceState({}, '', '/practice?subtopics=schema-normalization');

        renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /clear all databases subtopics/i })).toBeTruthy();
        });

        expect(screen.getByLabelText('Schema Normalization').checked).toBe(true);
    });

    test('renders a dedicated optional legacy section in the topic filter', async () => {
        renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        expect(await screen.findByText('Optional legacy topics')).toBeTruthy();
        expect(screen.getByText('Older or out-of-syllabus questions from past papers.')).toBeTruthy();
        expect(screen.getByText('Other / Optional')).toBeTruthy();
        expect(screen.getByText('Optional')).toBeTruthy();
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

        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        expect(getByTestId('year-range').textContent).toBe('1987,2026');
    });

    test('hydrates search from URL, normalizes it, and applies AND token matching without loading detail shards', async () => {
        window.history.replaceState({}, '', '/practice?search=%20DEAD%20%20LOCK%20prevention%20');

        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('search-query').textContent).toBe('dead lock prevention');
        });

        expect(getByTestId('filtered-question-uids').textContent).toBe('go:2');
        expect(new URLSearchParams(window.location.search).get('search')).toBe('dead lock prevention');
        expect(QuestionService.ensureQuestionDetail).not.toHaveBeenCalled();

        act(() => {
            getByTestId('set-search-miss').click();
        });

        await waitFor(() => {
            expect(getByTestId('search-query').textContent).toBe('deadlock normalization');
        });

        await waitFor(() => {
            expect(getByTestId('filtered-question-uids').textContent).toBe('');
        });
    });

    test('syncs search on practice routes and clears it through chip actions', async () => {
        window.history.replaceState({}, '', '/practice?search=deadlock');

        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('search-query').textContent).toBe('deadlock');
        });

        expect(screen.getByText('Search: deadlock')).toBeTruthy();

        act(() => {
            screen.getByRole('button', { name: /remove search filter/i }).click();
        });

        await waitFor(() => {
            expect(getByTestId('search-query').textContent).toBe('');
        });

        let params = new URLSearchParams(window.location.search);
        expect(params.get('search')).toBeNull();

        act(() => {
            getByTestId('set-search').click();
        });

        await waitFor(() => {
            expect(screen.getByText('Search: deadlock')).toBeTruthy();
        });

        act(() => {
            screen.getByRole('button', { name: /clear all/i }).click();
        });

        await waitFor(() => {
            expect(getByTestId('search-query').textContent).toBe('');
        });

        params = new URLSearchParams(window.location.search);
        expect(params.get('search')).toBeNull();
    });

    test('composes subject, type, and search filters correctly', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        act(() => {
            getByTestId('set-combined-filters').click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('os');
        });

        expect(getByTestId('selected-types').textContent).toBe('NAT');
        expect(getByTestId('search-query').textContent).toBe('deadlock prevention');
        expect(getByTestId('filtered-question-uids').textContent).toBe('go:2');
    });

    test('keeps repeated filter updates on cached question metadata', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('filtered-question-uids').textContent).toContain('go:1');
        });

        AnswerService.getAnswerForQuestion.mockClear();

        act(() => {
            getByTestId('set-combined-filters').click();
        });

        await waitFor(() => {
            expect(getByTestId('filtered-question-uids').textContent).toBe('go:2');
        });

        expect(AnswerService.getAnswerForQuestion).not.toHaveBeenCalled();
        expect(QuestionService.questions.find((question) => question.question_uid === 'go:2').type).toBe('NAT');
    });

    test('injects aptitude questions when enabled and keeps their progress keys isolated', async () => {
        window.localStorage.setItem('gateqa-aptitude-enabled', 'true');

        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('APT-ENG-0001');
            expect(getByTestId('subject-options').textContent).toContain('english');
        });

        act(() => {
            getByTestId('solve-apt').click();
            getByTestId('bookmark-apt').click();
        });

        await waitFor(() => {
            expect(getByTestId('apt-solved').textContent).toBe('yes');
            expect(JSON.parse(window.localStorage.getItem('gateqa-apt-solved-questions'))).toEqual(['APT-ENG-0001']);
            expect(JSON.parse(window.localStorage.getItem('gateqa-apt-bookmarked-questions'))).toEqual(['APT-ENG-0001']);
        });

        expect(JSON.parse(window.localStorage.getItem('gate_qa_solved_questions')) || []).not.toContain('APT-ENG-0001');
        expect(JSON.parse(window.localStorage.getItem('gate_qa_bookmarked_questions')) || []).not.toContain('APT-ENG-0001');
    });
});
