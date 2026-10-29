/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FilterProvider, normalizeStoredIds, useFilterState, useFilterActions } from './FilterContext';
import ActiveFilterChips from '../components/Filters/ActiveFilterChips';
import DaToggle from '../components/Filters/DaToggle';
import IsroToggle from '../components/Filters/IsroToggle';
import TopicFilter from '../components/Filters/TopicFilter';
import YearFilter from '../components/Filters/YearFilter';
import YearRangeFilter from '../components/Filters/YearRangeFilter';
import { QuestionService } from '../services/QuestionService';
import { AnswerService } from '../services/AnswerService';
import { BranchQuestionService } from '../services/BranchQuestionService';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { writeBranchPreferences } from '../utils/branchPreference';

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
        },
        {
            question_uid: 'APT-QUA-0001',
            title: 'Quant Practice',
            searchText: 'quant number system aptitude',
            subjectSlug: 'quant',
            subject: 'Quant',
            subjectLabel: 'Quant',
            type: 'mcq',
            subtopics: [{ slug: 'number-system', label: 'Number System' }],
            answerMeta: { type: 'MCQ', answer: 'B' },
            exam: { year: null, yearSetKey: null }
        },
        {
            question_uid: 'APT-REA-0001',
            title: 'Reasoning Practice',
            searchText: 'reasoning syllogism aptitude',
            subjectSlug: 'reasoning',
            subject: 'Reasoning',
            subjectLabel: 'Reasoning',
            type: 'mcq',
            subtopics: [{ slug: 'syllogism', label: 'Syllogism' }],
            answerMeta: { type: 'MCQ', answer: 'C' },
            exam: { year: null, yearSetKey: null }
        }
    ],
}));

const isroMock = vi.hoisted(() => ({
    questions: [
        {
            question_uid: 'isro:cs:2025:q1',
            title: 'ISRO CS 2025 | Question: 1',
            searchText: 'isro algorithms dynamic programming knapsack',
            subjectSlug: 'algorithms',
            subject: 'Algorithms',
            subjectLabel: 'Algorithms',
            type: 'MCQ',
            tags: ['isro-2025', 'algorithms'],
            subtopics: [{ slug: 'dynamic-programming', label: 'Dynamic Programming' }],
            exam: { year: 2025, set: 1, yearSetKey: 'isro:2025:set-1', yearSetIdentity: 'isro:2025:set-1' },
            track: 'isro',
        },
        {
            question_uid: 'isro:cs:2020:q1',
            title: 'ISRO CS 2020 | Question: 1',
            searchText: 'isro operating systems memory paging virtual',
            subjectSlug: 'os',
            subject: 'Operating System',
            subjectLabel: 'Operating System',
            type: 'MCQ',
            tags: ['isro-2020', 'os'],
            subtopics: [{ slug: 'paging', label: 'Paging' }],
            exam: { year: 2020, set: 1, yearSetKey: 'isro:2020:set-1', yearSetIdentity: 'isro:2020:set-1' },
            track: 'isro',
        }
    ],
}));

const daMock = vi.hoisted(() => ({
    questions: [
        ['probability-and-statistics', 'da:2024:q-probability'],
        ['linear-algebra', 'da:2024:q-linear'],
        ['calculus-and-optimization', 'da:2024:q-calculus'],
        ['general-aptitude', 'da:2024:q-ga'],
        ['programming-data-structures-and-algorithms', 'da:2024:q-dsa'],
        ['database-management-and-warehousing', 'da:2024:q-dbms'],
    ].map(([subjectSlug, question_uid]) => ({
        question_uid,
        title: `DA ${subjectSlug}`,
        searchText: subjectSlug,
        subjectSlug,
        subject: subjectSlug,
        subjectLabel: subjectSlug,
        type: 'MCQ',
        tags: ['gateda-2024', subjectSlug],
        subtopics: [],
        exam: { year: 2024, set: 1, yearSetKey: '2024-s1', yearSetIdentity: 'da:2024:set-1' },
        track: 'da',
    })),
}));

vi.mock('../services/QuestionService', () => ({
    QuestionService: {
        loaded: true,
        clearBranch: vi.fn(),
        questions: [
            {
                question_uid: 'go:1',
                title: 'GATE CSE 2024 | Set 1 | GA | Question: 1',
                searchText: 'database schema normalization functional dependency',
                subjectSlug: 'databases',
                type: 'MCQ',
                tags: ['gateda-2024', 'gatecse-2024-set1'],
                subtopics: [{ slug: 'schema-normalization' }],
                exam: { year: 2024, set: 1, yearSetKey: '2024-s1' }
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
            },
            yearSets: [{ key: 'cse:2024:set-1', legacyKey: '2024-s1', year: 2024, set: 1, label: '2024 Set 1', track: 'cse' }],
            years: ['cse:2024:set-1']
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
                { slug: 'english', label: 'English', count: 1 },
                { slug: 'quant', label: 'Quant', count: 1 },
                { slug: 'reasoning', label: 'Reasoning', count: 1 },
            ],
            structuredSubtopics: {
                english: [
                    { slug: 'spot-the-error', label: 'Spot the Error' }
                ],
                quant: [
                    { slug: 'number-system', label: 'Number System' }
                ],
                reasoning: [
                    { slug: 'syllogism', label: 'Syllogism' }
                ],
            },
            structuredTopics: {
                English: ['Spot the Error'],
                Quant: ['Number System'],
                Reasoning: ['Syllogism'],
            },
            questionTypes: ['MCQ'],
            yearSets: [],
            years: [],
            topics: ['english', 'quant', 'reasoning'],
            hideYearFilters: true
        })),
    },
}));

vi.mock('../services/DaQuestionService', () => ({
    DaQuestionService: {
        loaded: true,
        clearBranch: vi.fn(),
        questions: daMock.questions,
        normalizeSubjectSlug: vi.fn((value) => String(value || '').trim().toLowerCase()),
        getStructuredTags: vi.fn(() => ({
            minYear: 2024,
            maxYear: 2024,
            subjects: [
                { slug: 'da:probability-and-statistics', label: 'Probability & Statistics', count: 1 },
                { slug: 'da:linear-algebra', label: 'Linear Algebra', count: 1 },
                { slug: 'da:calculus-and-optimization', label: 'Calculus & Optimization', count: 1 },
                { slug: 'da:general-aptitude', label: 'General Aptitude', count: 1 },
                { slug: 'da:programming-data-structures-and-algorithms', label: 'Programming & DSA', count: 1 },
                { slug: 'da:database-management-and-warehousing', label: 'DBMS & Warehousing', count: 1 },
            ],
            structuredSubtopics: {
                'da:probability-and-statistics': [],
                'da:linear-algebra': [],
                'da:calculus-and-optimization': [],
                'da:general-aptitude': [],
                'da:programming-data-structures-and-algorithms': [],
                'da:database-management-and-warehousing': [],
            },
            structuredTopics: {},
            questionTypes: ['MCQ'],
            yearSets: [{ key: 'da:2024:set-1', year: 2024, set: 1, label: '2024 Set 1', count: 6, track: 'da', legacyKey: '2024-s1' }],
            years: ['da:2024:set-1'],
            topics: [
                'da:probability-and-statistics',
                'da:linear-algebra',
                'da:calculus-and-optimization',
                'da:general-aptitude',
                'da:programming-data-structures-and-algorithms',
                'da:database-management-and-warehousing',
            ],
        })),
    },
}));

vi.mock('../services/IsroQuestionService', () => ({
    IsroQuestionService: {
        loaded: true,
        questions: isroMock.questions,
        normalizeSubjectSlug: vi.fn((value) => String(value || '').trim().toLowerCase()),
        getStructuredTags: vi.fn(() => ({
            minYear: 2020,
            maxYear: 2025,
            subjects: [
                { slug: 'isro:algorithms', label: 'Algorithms', count: 1 },
                { slug: 'isro:os', label: 'Operating System', count: 1 },
            ],
            structuredSubtopics: {
                'isro:algorithms': [{ slug: 'dynamic-programming', label: 'Dynamic Programming' }],
                'isro:os': [{ slug: 'paging', label: 'Paging' }],
            },
            structuredTopics: {},
            questionTypes: ['MCQ'],
            yearSets: [
                { key: 'isro:2025:set-1', year: 2025, set: 1, label: 'ISRO 2025', count: 1, track: 'isro', legacyKey: 'isro:2025:set-1' },
                { key: 'isro:2020:set-1', year: 2020, set: 1, label: 'ISRO 2020', count: 1, track: 'isro', legacyKey: 'isro:2020:set-1' },
            ],
            years: ['isro:2025:set-1', 'isro:2020:set-1'],
            topics: [
                'isro:algorithms',
                'isro:os',
            ],
        })),
        ensureQuestionDetail: vi.fn(async (q) => q),
        getAnswerForQuestion: vi.fn(() => null),
    },
}));

vi.mock('../services/AnswerService', () => ({
    AnswerService: {
        getStorageKeyForQuestion: vi.fn((q) => (typeof q === 'string' ? q : q.question_uid)),
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
        const { allQuestions, filters, filteredQuestions, structuredTags, includeCse, includeIsro } = useFilterState();
        const { isQuestionSolved, toggleBookmark, toggleSolved, markQuestionsSolved, updateFilters, setIncludeDa, setIncludeCse, setIncludeIsro } = useFilterActions();

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
                <div data-testid="selected-year-sets">{filters.selectedYearSets.join(',')}</div>
                <div data-testid="go1-solved">{isQuestionSolved('go:1') ? 'yes' : 'no'}</div>
                <div data-testid="apt-solved">{isQuestionSolved('APT-ENG-0001') ? 'yes' : 'no'}</div>
                <div data-testid="da-prob-solved">{isQuestionSolved('da:2024:q-probability') ? 'yes' : 'no'}</div>
                <div data-testid="isro-q1-solved">{isQuestionSolved('isro:cs:2025:q1') ? 'yes' : 'no'}</div>
                <ActiveFilterChips />
                <DaToggle />
                <IsroToggle />
                <TopicFilter />
                <YearRangeFilter />
                <YearFilter />
                <button
                    data-testid="add-both"
                    onClick={() => updateFilters({ selectedSubjects: ['databases'], selectedSubtopics: ['schema-normalization'] })}
                >Add</button>
                <button
                    data-testid="remove-subject"
                    onClick={() => updateFilters({ selectedSubjects: [] })}
                >Remove</button>
                <button
                    data-testid="select-cse-year"
                    onClick={() => updateFilters({ selectedYearSets: ['cse:2024:set-1'] })}
                >Select CSE year</button>
                <button
                    data-testid="select-da-year"
                    onClick={() => updateFilters({ selectedYearSets: ['da:2024:set-1'] })}
                >Select DA year</button>
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
                    data-testid="toggle-go1-solved"
                    onClick={() => toggleSolved('go:1')}
                >Toggle go:1 Solved</button>
                <button
                    data-testid="mark-go1-solved"
                    onClick={() => markQuestionsSolved(['go:1'])}
                >Mark go:1 Solved</button>
                <button
                    data-testid="solve-apt"
                    onClick={() => toggleSolved('APT-ENG-0001')}
                >Solve Apt</button>
                <button
                    data-testid="bookmark-apt"
                    onClick={() => toggleBookmark('APT-ENG-0001')}
                >Bookmark Apt</button>
                <button
                    data-testid="solve-da-string"
                    onClick={() => toggleSolved('da:2024:q-probability')}
                >Solve DA String</button>
                <button
                    data-testid="bookmark-da-string"
                    onClick={() => toggleBookmark('da:2024:q-probability')}
                >Bookmark DA String</button>
                <button
                    data-testid="mark-da-batch-string"
                    onClick={() => markQuestionsSolved(['da:2024:q-probability', 'da:2024:q-linear'])}
                >Mark DA Batch</button>
                <button
                    data-testid="set-da-filters"
                    onClick={() => updateFilters({
                        selectedSubjects: ['da:probability-and-statistics'],
                        selectedSubtopics: ['da:some-subtopic'],
                        selectedYearSets: ['da:2024:set-1']
                    })}
                >Set DA Filters</button>
                <button
                    data-testid="disable-da"
                    onClick={() => setIncludeDa(false)}
                >Disable DA</button>
                <button
                    data-testid="filter-types"
                    onClick={() => updateFilters({ selectedTypes: ['MCQ'] })}
                >Filter Types</button>
                <button
                    data-testid="disable-cse"
                    onClick={() => setIncludeCse(false)}
                >Disable CSE</button>
                <button
                    data-testid="enable-cse"
                    onClick={() => setIncludeCse(true)}
                >Enable CSE</button>
                <button
                    data-testid="solve-isro-string"
                    onClick={() => toggleSolved('isro:cs:2025:q1')}
                >Solve ISRO String</button>
                <button
                    data-testid="bookmark-isro-string"
                    onClick={() => toggleBookmark('isro:cs:2025:q1')}
                >Bookmark ISRO String</button>
                <button
                    data-testid="set-isro-filters"
                    onClick={() => updateFilters({
                        selectedSubjects: ['isro:algorithms'],
                        selectedSubtopics: ['dynamic-programming'],
                        selectedYearSets: ['isro:2025:set-1']
                    })}
                >Set ISRO Filters</button>
                <button
                    data-testid="enable-isro"
                    onClick={() => setIncludeIsro(true)}
                >Enable ISRO</button>
                <button
                    data-testid="disable-isro"
                    onClick={() => setIncludeIsro(false)}
                >Disable ISRO</button>
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

    test('keeps DA subject filters distinct from CSE subject identities', async () => {
        const daSubjects = [
            ['Linear Algebra', 'da:linear-algebra', 'da:2024:q-linear'],
            ['Calculus & Optimization', 'da:calculus-and-optimization', 'da:2024:q-calculus'],
            ['Probability & Statistics', 'da:probability-and-statistics', 'da:2024:q-probability'],
            ['General Aptitude', 'da:general-aptitude', 'da:2024:q-ga'],
            ['Programming & DSA', 'da:programming-data-structures-and-algorithms', 'da:2024:q-dsa'],
            ['DBMS & Warehousing', 'da:database-management-and-warehousing', 'da:2024:q-dbms'],
        ];

        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeDa>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('subject-options').textContent).toContain('da:linear-algebra');
        });

        const daWrapper = document.querySelector('.gate-da-section-wrapper');
        const daScope = daWrapper ? within(daWrapper) : screen;

        for (const [label, subjectKey, questionUid] of daSubjects) {
            act(() => {
                daScope.getByLabelText(new RegExp(label, 'i')).click();
            });

            await waitFor(() => {
                expect(getByTestId('subjects').textContent).toBe(subjectKey);
                expect(getByTestId('filtered-question-uids').textContent).toBe(questionUid);
            });

            act(() => {
                daScope.getByLabelText(new RegExp(label, 'i')).click();
            });

            await waitFor(() => {
                expect(getByTestId('subjects').textContent).toBe('');
            });
        }
    });

    test('keeps paired CSE and DA year-set filters independent', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeDa>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('year-filter-cse:2024:set-1')).toBeTruthy();
            expect(getByTestId('year-filter-da:2024:set-1')).toBeTruthy();
        });

        act(() => {
            getByTestId('select-cse-year').click();
        });

        await waitFor(() => {
            expect(getByTestId('selected-year-sets').textContent).toBe('cse:2024:set-1');
            expect(getByTestId('filtered-question-uids').textContent).toBe('go:1');
            expect(getByTestId('year-filter-cse:2024:set-1').checked).toBe(true);
            expect(getByTestId('year-filter-da:2024:set-1').checked).toBe(false);
        });
        expect(new URLSearchParams(window.location.search).get('years')).toBe('2024-s1');

        act(() => {
            getByTestId('select-da-year').click();
        });

        await waitFor(() => {
            expect(getByTestId('selected-year-sets').textContent).toBe('da:2024:set-1');
            expect(getByTestId('filtered-question-uids').textContent).toContain('da:2024:q-probability');
            expect(getByTestId('filtered-question-uids').textContent).not.toContain('go:1');
            expect(getByTestId('year-filter-cse:2024:set-1').checked).toBe(false);
            expect(getByTestId('year-filter-da:2024:set-1').checked).toBe(true);
        });
        expect(new URLSearchParams(window.location.search).get('years')).toBe('da:2024:set-1');
    });

    test('hydrates and serializes DA-qualified subject URLs', async () => {
        window.history.replaceState({}, '', '/practice?subjects=da%3Ageneral-aptitude');

        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeDa>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('da:general-aptitude');
            expect(getByTestId('filtered-question-uids').textContent).toBe('da:2024:q-ga');
        });

        expect(new URLSearchParams(window.location.search).get('subjects')).toBe('da:general-aptitude');
    });

    test('recovers corrupted stored ID maps during normalization', () => {
        expect(normalizeStoredIds({ '0': 'go:1', '1': 'go:2' })).toEqual(['go:1', 'go:2']);
    });

    test.each(['gateqa:sync-complete', 'gateqa:auth-signed-in'])('refreshes progress after %s', async (eventName) => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('go1-solved').textContent).toBe('no');
        });

        window.localStorage.setItem('gate_qa_solved_questions', JSON.stringify(['go:1']));
        act(() => {
            window.dispatchEvent(new CustomEvent(eventName));
        });

        await waitFor(() => {
            expect(getByTestId('go1-solved').textContent).toBe('yes');
        });
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

    test('routes string DA question IDs correctly to DA storage keys for single and batch progress actions', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
        });

        act(() => {
            getByTestId('solve-da-string').click();
            getByTestId('bookmark-da-string').click();
        });

        await waitFor(() => {
            expect(getByTestId('da-prob-solved').textContent).toBe('yes');
            expect(JSON.parse(window.localStorage.getItem('gate_qa_da_solved_questions'))).toEqual(['da:2024:q-probability']);
            expect(JSON.parse(window.localStorage.getItem('gate_qa_da_bookmarked_questions'))).toEqual(['da:2024:q-probability']);
        });

        expect(JSON.parse(window.localStorage.getItem('gate_qa_solved_questions')) || []).not.toContain('da:2024:q-probability');
        expect(JSON.parse(window.localStorage.getItem('gate_qa_bookmarked_questions')) || []).not.toContain('da:2024:q-probability');

        // Batch mark solved test with string UIDs
        act(() => {
            getByTestId('mark-da-batch-string').click();
        });

        await waitFor(() => {
            const daSolved = JSON.parse(window.localStorage.getItem('gate_qa_da_solved_questions')) || [];
            expect(daSolved).toContain('da:2024:q-probability');
            expect(daSolved).toContain('da:2024:q-linear');
        });

        expect(JSON.parse(window.localStorage.getItem('gate_qa_solved_questions')) || []).not.toContain('da:2024:q-linear');
    });

    test('prunes DA filters when includeDa is toggled to false', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
        });

        act(() => {
            getByTestId('set-da-filters').click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('da:probability-and-statistics');
            expect(getByTestId('subtopics').textContent).toBe('da:some-subtopic');
            expect(getByTestId('selected-year-sets').textContent).toBe('da:2024:set-1');
        });

        act(() => {
            getByTestId('disable-da').click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('');
            expect(getByTestId('subtopics').textContent).toBe('');
            expect(getByTestId('selected-year-sets').textContent).toBe('');
        });
    });

    test('renders active Question Type chip and allows resetting it from chips', async () => {
        const { getByTestId, queryByText } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('go:1');
        });

        expect(queryByText(/Types:/)).toBeNull();

        act(() => {
            getByTestId('filter-types').click();
        });

        await waitFor(() => {
            expect(getByTestId('selected-types').textContent).toBe('MCQ');
        });

        const typeChipButton = screen.getByRole('button', { name: /Reset question type filter/i });
        expect(typeChipButton).toBeTruthy();

        act(() => {
            typeChipButton.click();
        });

        await waitFor(() => {
            expect(getByTestId('selected-types').textContent).toBe('MCQ,MSQ,NAT');
        });
    });

    test('supports concurrent expansion of multiple subjects and subtopic selection across both', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('go:1');
        });

        act(() => {
            screen.getByLabelText('Databases').click();
            screen.getByLabelText('Operating System').click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('databases,os');
        });

        expect(screen.getByRole('button', { name: /hide databases subtopics/i })).toBeTruthy();
        expect(screen.getByRole('button', { name: /hide operating system subtopics/i })).toBeTruthy();

        expect(screen.getByLabelText('Schema Normalization')).toBeTruthy();
        expect(screen.getByLabelText('Deadlock')).toBeTruthy();
    });

    test('renders DA subjects section below DaToggle only when includeDa is true', async () => {
        const { getByTestId, queryByText } = renderWithRouter(
            <FilterProvider initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
        });

        // When includeDa is true, DA subjects appear
        expect(screen.getByLabelText(/Probability & Statistics/i)).toBeTruthy();

        // Clicking a DA subject selects it
        act(() => {
            screen.getByLabelText(/Probability & Statistics/i).click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('da:probability-and-statistics');
        });

        // Toggle DA off
        act(() => {
            getByTestId('disable-da').click();
        });

        await waitFor(() => {
            expect(screen.queryByLabelText(/Probability & Statistics/i)).toBeNull();
        });
    });

    test('toggling includeCse off excludes CSE questions, prunes active CSE filters, and collapses topics checklist', async () => {
        const { getByTestId, queryByText } = renderWithRouter(
            <FilterProvider initialIncludeCse={true} initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('go:1');
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
        });

        // Initially CSE topics are visible
        expect(screen.getByLabelText('Databases')).toBeTruthy();

        // Select CSE subject
        act(() => {
            screen.getByLabelText('Databases').click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('databases');
        });

        // Disable CSE
        act(() => {
            getByTestId('disable-cse').click();
        });

        await waitFor(() => {
            // CSE questions excluded, only DA questions remain in allQuestions and filteredQuestions
            expect(getByTestId('all-question-uids').textContent).not.toContain('go:1');
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
            // Active CSE subject filter was pruned
            expect(getByTestId('subjects').textContent).toBe('');
            // CSE topics list is collapsed/hidden
            expect(screen.queryByLabelText('Databases')).toBeNull();
            // DA topics are still visible and selectable
            expect(screen.getByLabelText(/Probability & Statistics/i)).toBeTruthy();
        });

        // Select DA subject while CSE is off
        act(() => {
            screen.getByLabelText(/Probability & Statistics/i).click();
        });

        await waitFor(() => {
            expect(getByTestId('subjects').textContent).toBe('da:probability-and-statistics');
            expect(getByTestId('filtered-question-uids').textContent).toBe('da:2024:q-probability');
        });

        // Re-enable CSE
        act(() => {
            getByTestId('enable-cse').click();
        });

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('go:1');
            expect(screen.getByLabelText('Databases')).toBeTruthy();
        });
    });

    test('adapts YearRange and YearFilter when only GATE DA is enabled', async () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <FilterProvider initialIncludeCse={false} initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
            expect(getByTestId('all-question-uids').textContent).not.toContain('go:1');
        });

        // Year range should reflect DA years (2024 to 2024 in mock)
        expect(getByTestId('year-range').textContent).toBe('2024,2024');

        // DA year filter should be visible
        expect(getByTestId('year-filter-da:2024:set-1')).toBeTruthy();

        // CSE year filter should not be present
        expect(queryByTestId('year-filter-cse:2024:set-1')).toBeNull();

        // Selecting DA year set filters DA questions
        act(() => {
            getByTestId('year-filter-da:2024:set-1').click();
        });

        await waitFor(() => {
            expect(getByTestId('selected-year-sets').textContent).toBe('da:2024:set-1');
            expect(getByTestId('filtered-question-uids').textContent).toContain('da:2024:q-probability');
        });
    });

    test('auto-expands yearRange from DA full span when turning CSE back on', async () => {
        const { getByTestId } = renderWithRouter(
            <FilterProvider initialIncludeCse={false} initialIncludeDa={true}>
                <TestComponent />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('da:2024:q-probability');
        });

        // Initially in DA only, full span is 2024,2024
        expect(getByTestId('year-range').textContent).toBe('2024,2024');

        // Turn CSE back on and DA off
        act(() => {
            getByTestId('enable-cse').click();
            getByTestId('disable-da').click();
        });

        await waitFor(() => {
            expect(getByTestId('all-question-uids').textContent).toContain('go:1');
            // Year range auto-expands to full CSE span (1987 to 2026)
            expect(getByTestId('year-range').textContent).toBe('1987,2026');
        });
    });

    // ── DEC-111: Bookmark Unbookmark Permanence ─────────────────────────────────
    describe('DEC-111: Bookmark unbookmark permanence', () => {
        const BOOKMARKS_KEY = 'gate_qa_bookmarked_questions';
        const BOOKMARK_REMOVALS_KEY = 'gate_qa_bookmark_removals';

        const BookmarkTestComponent = () => {
            const { isQuestionBookmarked } = useFilterActions();
            const { toggleBookmark } = useFilterActions();
            return (
                <div>
                    <div data-testid="bm-go1">{isQuestionBookmarked('go:1') ? 'bookmarked' : 'not-bookmarked'}</div>
                    <button data-testid="toggle-go1" onClick={() => toggleBookmark('go:1')}>Toggle</button>
                </div>
            );
        };

        test('unbookmark writes tombstone to localStorage', async () => {
            // Pre-seed: go:1 is already bookmarked in storage
            window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(['go:1']));
            window.localStorage.setItem(BOOKMARK_REMOVALS_KEY, JSON.stringify([]));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BookmarkTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('bm-go1').textContent).toBe('bookmarked');
            });

            // Click to unbookmark
            act(() => {
                getByTestId('toggle-go1').click();
            });

            await waitFor(() => {
                expect(getByTestId('bm-go1').textContent).toBe('not-bookmarked');
            });

            // The tombstone must be written to localStorage
            const removals = JSON.parse(window.localStorage.getItem(BOOKMARK_REMOVALS_KEY) || '[]');
            expect(removals).toContain('go:1');

            // The bookmark must also be absent from the bookmarks key
            const bookmarks = JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) || '[]');
            expect(bookmarks).not.toContain('go:1');
        });

        test('re-bookmark clears the tombstone from localStorage', async () => {
            // Pre-seed: go:1 is NOT bookmarked and has an existing tombstone
            window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
            window.localStorage.setItem(BOOKMARK_REMOVALS_KEY, JSON.stringify(['go:1']));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BookmarkTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('bm-go1').textContent).toBe('not-bookmarked');
            });

            // Click to re-bookmark
            act(() => {
                getByTestId('toggle-go1').click();
            });

            await waitFor(() => {
                expect(getByTestId('bm-go1').textContent).toBe('bookmarked');
            });

            // The tombstone must be cleared
            const removals = JSON.parse(window.localStorage.getItem(BOOKMARK_REMOVALS_KEY) || '[]');
            expect(removals).not.toContain('go:1');

            // The bookmark must be present
            const bookmarks = JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) || '[]');
            expect(bookmarks).toContain('go:1');
        });

        test('sync-complete with stale bookmark does not restore unbookmarked state', async () => {
            // Simulate the exact bug scenario:
            // 1. User unbookmarked go:1 (local bookmarks=[], removals=['go:1'])
            // 2. Sync fires and (with old broken merge) overwrites bookmarks=['go:1'] back
            // 3. refreshProgressState re-reads localStorage
            // With the fix applied: sync writes the correct merged result (removals respected),
            // so gateqa:sync-complete should NOT cause the bookmark to re-appear.

            window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
            window.localStorage.setItem(BOOKMARK_REMOVALS_KEY, JSON.stringify(['go:1']));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BookmarkTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('bm-go1').textContent).toBe('not-bookmarked');
            });

            // Simulate post-sync localStorage state: sync correctly preserved removals and kept bookmarks empty
            window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
            window.localStorage.setItem(BOOKMARK_REMOVALS_KEY, JSON.stringify(['go:1']));

            // Fire the sync-complete event (which calls refreshProgressState)
            act(() => {
                window.dispatchEvent(new CustomEvent('gateqa:sync-complete', { detail: {} }));
            });

            await waitFor(() => {
                // The question must remain unbookmarked after sync-complete
                expect(getByTestId('bm-go1').textContent).toBe('not-bookmarked');
            });
        });
    });

    describe('DEC-112: Solved question unsolve permanence & resurrection prevention (LWW-Element-Set)', () => {
        const SOLVED_KEY = 'gate_qa_solved_questions';
        const SOLVED_REMOVALS_KEY = 'gate_qa_solved_removals';
        const SOLVED_TIMESTAMPS_KEY = 'gate_qa_solved_timestamps';

        test('unsolving a question writes removal tombstone and clears solve timestamp in localStorage', async () => {
            // Seed localStorage with a solved question
            window.localStorage.setItem(SOLVED_KEY, JSON.stringify(['go:1']));
            window.localStorage.setItem(SOLVED_TIMESTAMPS_KEY, JSON.stringify({ 'go:1': 1000 }));
            window.localStorage.setItem(SOLVED_REMOVALS_KEY, JSON.stringify({}));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('yes');
            });

            // Click to unsolve
            act(() => {
                getByTestId('toggle-go1-solved').click();
            });

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('no');
            });

            // Verify localStorage
            const localSolved = JSON.parse(window.localStorage.getItem(SOLVED_KEY) || '[]');
            expect(localSolved).not.toContain('go:1');

            const localRemovals = JSON.parse(window.localStorage.getItem(SOLVED_REMOVALS_KEY) || '{}');
            expect(typeof localRemovals['go:1']).toBe('number');
            expect(localRemovals['go:1']).toBeGreaterThan(0);

            const localTimestamps = JSON.parse(window.localStorage.getItem(SOLVED_TIMESTAMPS_KEY) || '{}');
            expect(localTimestamps['go:1']).toBeUndefined();
        });

        test('re-solving an unsolved question clears removal tombstone and records new solve timestamp', async () => {
            // Seed with an explicitly unsolved question
            window.localStorage.setItem(SOLVED_KEY, JSON.stringify([]));
            window.localStorage.setItem(SOLVED_REMOVALS_KEY, JSON.stringify({ 'go:1': 1000 }));
            window.localStorage.setItem(SOLVED_TIMESTAMPS_KEY, JSON.stringify({}));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('no');
            });

            // Click to solve again
            act(() => {
                getByTestId('toggle-go1-solved').click();
            });

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('yes');
            });

            // Verify localStorage
            const localSolved = JSON.parse(window.localStorage.getItem(SOLVED_KEY) || '[]');
            expect(localSolved).toContain('go:1');

            const localRemovals = JSON.parse(window.localStorage.getItem(SOLVED_REMOVALS_KEY) || '{}');
            expect(localRemovals['go:1']).toBeUndefined();

            const localTimestamps = JSON.parse(window.localStorage.getItem(SOLVED_TIMESTAMPS_KEY) || '{}');
            expect(typeof localTimestamps['go:1']).toBe('number');
            expect(localTimestamps['go:1']).toBeGreaterThan(1000);
        });

        test('markQuestionsSolved clears removal tombstones and records solve timestamps for batch questions', async () => {
            window.localStorage.setItem(SOLVED_KEY, JSON.stringify([]));
            window.localStorage.setItem(SOLVED_REMOVALS_KEY, JSON.stringify({ 'go:1': 500 }));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('no');
            });

            act(() => {
                getByTestId('mark-go1-solved').click();
            });

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('yes');
            });

            const localRemovals = JSON.parse(window.localStorage.getItem(SOLVED_REMOVALS_KEY) || '{}');
            expect(localRemovals['go:1']).toBeUndefined();

            const localTimestamps = JSON.parse(window.localStorage.getItem(SOLVED_TIMESTAMPS_KEY) || '{}');
            expect(localTimestamps['go:1']).toBeGreaterThan(500);
        });

        test('gateqa:sync-complete preserves unsolve state when synced storage has removal tombstones', async () => {
            window.localStorage.setItem(SOLVED_KEY, JSON.stringify([]));
            window.localStorage.setItem(SOLVED_REMOVALS_KEY, JSON.stringify({ 'go:1': 2000 }));

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('no');
            });

            // Simulate sync complete event
            act(() => {
                window.dispatchEvent(new CustomEvent('gateqa:sync-complete', { detail: {} }));
            });

            await waitFor(() => {
                expect(getByTestId('go1-solved').textContent).toBe('no');
            });
        });

        test('merges ISRO questions and structured tags when includeIsro is true', async () => {
            const { getByTestId } = renderWithRouter(
                <FilterProvider initialIncludeIsro={true}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2025:q1');
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2020:q1');
            });

            expect(getByTestId('subject-options').textContent).toContain('isro:algorithms');
            expect(getByTestId('subject-options').textContent).toContain('isro:os');
        });

        test('prunes ISRO filters when includeIsro is toggled to false', async () => {
            const { getByTestId } = renderWithRouter(
                <FilterProvider initialIncludeIsro={true}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2025:q1');
            });

            act(() => {
                getByTestId('set-isro-filters').click();
            });

            await waitFor(() => {
                expect(getByTestId('subjects').textContent).toBe('isro:algorithms');
                expect(getByTestId('selected-year-sets').textContent).toBe('isro:2025:set-1');
            });

            act(() => {
                getByTestId('disable-isro').click();
            });

            await waitFor(() => {
                expect(getByTestId('subjects').textContent).toBe('');
                expect(getByTestId('selected-year-sets').textContent).toBe('');
            });
        });

        test('tracks ISRO solved and bookmarks independently in ISRO storage', async () => {
            const { getByTestId } = renderWithRouter(
                <FilterProvider initialIncludeIsro={true}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('isro-q1-solved').textContent).toBe('no');
            });

            act(() => {
                getByTestId('solve-isro-string').click();
                getByTestId('bookmark-isro-string').click();
            });

            await waitFor(() => {
                expect(getByTestId('isro-q1-solved').textContent).toBe('yes');
            });

            const isroSolved = JSON.parse(window.localStorage.getItem('gate_qa_isro_solved_questions') || '[]');
            expect(isroSolved).toContain('isro:cs:2025:q1');

            const isroBookmarked = JSON.parse(window.localStorage.getItem('gate_qa_isro_bookmarked_questions') || '[]');
            expect(isroBookmarked).toContain('isro:cs:2025:q1');

            // CSE storage should remain unpolluted
            const cseSolved = JSON.parse(window.localStorage.getItem(SOLVED_KEY) || '[]');
            expect(cseSolved).not.toContain('isro:cs:2025:q1');
        });

        test('auto-enables ISRO questions on cold page load / refresh when URL contains ISRO year sets', async () => {
            window.history.replaceState({}, '', '/practice?years=isro:2025:set-1');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2025:q1');
                expect(getByTestId('selected-year-sets').textContent).toBe('isro:2025:set-1');
            });

            // Filtered questions must ONLY contain ISRO questions and zero CSE questions
            expect(getByTestId('filtered-question-uids').textContent).toBe('isro:cs:2025:q1');
            expect(getByTestId('filtered-question-uids').textContent).not.toContain('go:1');
        });

        test('ISRO All year-sets URL isolates all ISRO questions with no CSE leakage', async () => {
            window.history.replaceState({}, '', '/practice?years=isro:2025:set-1,isro:2020:set-1');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2025:q1');
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2020:q1');
            });

            const filteredUids = getByTestId('filtered-question-uids').textContent;
            expect(filteredUids).toContain('isro:cs:2025:q1');
            expect(filteredUids).toContain('isro:cs:2020:q1');
            // Strict exclusion of CSE questions
            expect(filteredUids).not.toContain('go:1');
            expect(filteredUids).not.toContain('go:2');
            expect(filteredUids).not.toContain('go:3');
        });

        test('ISRO subjects are isolated to ISRO toggle and never leak into TopicFilter (GATE CSE)', async () => {
            const { container, getByTestId } = renderWithRouter(
                <FilterProvider initialIncludeIsro={true}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('isro:cs:2025:q1');
            });

            // The GATE CSE section must only contain CSE subjects, not ISRO subjects
            const cseSection = container.querySelector('.gate-cse-section-wrapper');
            expect(cseSection).toBeTruthy();
            const cseText = cseSection.textContent;
            expect(cseText).toContain('Databases');
            expect(cseText).toContain('Operating System');
            // Must NOT have ISRO badge or ISRO-specific subjects like Algorithms (from isro:algorithms)
            expect(cseText).not.toContain('ISRO');
            // Check that the number of subject labels in cseSection matches only the CSE subjects (databases, os)
            const cseSubjectLabels = Array.from(cseSection.querySelectorAll('label span[title]')).map(el => el.getAttribute('title'));
            expect(cseSubjectLabels).toEqual(['Databases', 'Operating System']);
            expect(cseSubjectLabels).not.toContain('isro:algorithms');
            expect(cseSubjectLabels).not.toContain('isro:os');
            // Total subjects in CSE section should be exactly 2 from mock (Databases, Operating System)
            expect(cseSubjectLabels.length).toBe(2);
        });

        test('isolates question pool and subjects when track=aptitude is passed in URL', async () => {
            window.history.replaceState({}, '', '/practice?track=aptitude');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const allUids = getByTestId('all-question-uids').textContent;
                expect(allUids).toContain('APT-ENG-0001');
                expect(allUids).toContain('APT-QUA-0001');
                expect(allUids).toContain('APT-REA-0001');
            });

            // CSE, DA, and ISRO questions must be strictly excluded from the pool
            const allUids = getByTestId('all-question-uids').textContent;
            expect(allUids).not.toContain('go:1');
            expect(allUids).not.toContain('go:2');
            expect(allUids).not.toContain('da:2024:q-probability');
            expect(allUids).not.toContain('isro:cs:2025:q1');

            // Structured tag subjects must only contain Special Aptitude subjects
            const subjectOptions = getByTestId('subject-options').textContent;
            expect(subjectOptions).toContain('english');
            expect(subjectOptions).toContain('quant');
            expect(subjectOptions).toContain('reasoning');
            expect(subjectOptions).not.toContain('databases');
            expect(subjectOptions).not.toContain('os');
        });

        test('Special Aptitude category filtering restricts pool to selected category', async () => {
            window.history.replaceState({}, '', '/practice?track=aptitude&subjects=english');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('APT-ENG-0001');
                expect(filteredUids).not.toContain('APT-QUA-0001');
                expect(filteredUids).not.toContain('APT-REA-0001');
            });
        });
    });

    describe('Multi-Level Question Taxonomy Discovery & Same-Path Filtering', () => {
        const taxonomyQuestionService = {
            loaded: true,
            questions: [
                {
                    question_uid: 'go:333214',
                    title: 'GATE CSE 2020 | Set 1 | Question: 17',
                    searchText: 'probability relations reflexive engineering math discrete math',
                    subjectSlug: 'engg-math',
                    subjectLabel: 'Engineering Mathematics',
                    type: 'NAT',
                    tags: ['gatecse-2020', 'probability', 'relations'],
                    subtopics: [{ slug: 'probability', label: 'Probability' }],
                    taxonomy: {
                        primary: {
                            subjectSlug: 'engg-math',
                            topicSlug: 'probability-statistics',
                            subtopicSlug: 'probability',
                            subtopicLabel: 'Probability',
                        },
                        secondary: [
                            {
                                subjectSlug: 'discrete-math',
                                topicSlug: 'set-theory-algebra',
                                subtopicSlug: 'relations',
                                subtopicLabel: 'Relations',
                            },
                        ],
                        conceptTags: ['reflexive-relations', 'binary-relations'],
                    },
                    exam: { year: 2020, set: 1, yearSetKey: 'cse:2020:set-1' }
                },
                {
                    question_uid: 'go:dm-only',
                    title: 'Discrete Math only',
                    searchText: 'discrete math relations graphs',
                    subjectSlug: 'discrete-math',
                    subjectLabel: 'Discrete Mathematics',
                    type: 'MCQ',
                    tags: ['discrete-math', 'relations'],
                    subtopics: [{ slug: 'relations', label: 'Relations' }],
                    taxonomy: {
                        primary: {
                            subjectSlug: 'discrete-math',
                            topicSlug: 'set-theory-algebra',
                            subtopicSlug: 'relations',
                            subtopicLabel: 'Relations',
                        },
                        secondary: [],
                    },
                    exam: { year: 2020, set: 1, yearSetKey: 'cse:2020:set-1' }
                }
            ],
            getStructuredTags: vi.fn(() => ({
                minYear: 2020,
                maxYear: 2020,
                subjects: [
                    { slug: 'engg-math', label: 'Engineering Mathematics' },
                    { slug: 'discrete-math', label: 'Discrete Mathematics' }
                ],
                structuredSubtopics: {
                    'engg-math': [{ slug: 'probability', label: 'Probability' }],
                    'discrete-math': [{ slug: 'relations', label: 'Relations' }]
                },
                yearSets: [{ key: 'cse:2020:set-1', legacyKey: '2020-s1', year: 2020, set: 1, label: '2020 Set 1', track: 'cse' }],
                years: ['cse:2020:set-1']
            })),
            parseYearSetKey: vi.fn(() => null),
            extractYearSetFromTag: vi.fn(() => null),
            normalizeSubjectSlug: vi.fn((s) => String(s).toLowerCase()),
            slugifyToken: vi.fn((s) => String(s).toLowerCase()),
            normalizeTypeToken: vi.fn((t) => (t || 'MCQ').toUpperCase()),
            formatYearSetLabel: vi.fn((s) => s),
            ensureQuestionDetail: vi.fn()
        };

        test('filtering for relations (secondary subtopic) returns go:333214 even when primary subject is engg-math', async () => {
            window.history.replaceState({}, '', '/practice?subtopics=relations');

            const { getByTestId } = renderWithRouter(
                <FilterProvider questionService={taxonomyQuestionService}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('go:333214');
                expect(filteredUids).toContain('go:dm-only');
            });
        });

        test('filtering for probability returns go:333214 and excludes discrete math only question', async () => {
            window.history.replaceState({}, '', '/practice?subtopics=probability');

            const { getByTestId } = renderWithRouter(
                <FilterProvider questionService={taxonomyQuestionService}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('go:333214');
                expect(filteredUids).not.toContain('go:dm-only');
            });
        });

        test('filtering by primary subject engg-math surfaces go:333214 while discrete-math surfaces both', async () => {
            window.history.replaceState({}, '', '/practice?subjects=engg-math');

            const { getByTestId } = renderWithRouter(
                <FilterProvider questionService={taxonomyQuestionService}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('go:333214');
                expect(filteredUids).not.toContain('go:dm-only');
            });
        });

        test('subject-plus-subtopic matching uses same-path rule for secondary path discrete-math:relations', async () => {
            window.history.replaceState({}, '', '/practice?subjects=discrete-math&subtopics=relations');

            const { getByTestId } = renderWithRouter(
                <FilterProvider questionService={taxonomyQuestionService}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('go:333214');
                expect(filteredUids).toContain('go:dm-only');
            });
        });

        test('subject-plus-subtopic matching uses same-path rule for primary path engg-math:probability', async () => {
            window.history.replaceState({}, '', '/practice?subjects=engg-math&subtopics=probability');

            const { getByTestId } = renderWithRouter(
                <FilterProvider questionService={taxonomyQuestionService}>
                    <TestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                const filteredUids = getByTestId('filtered-question-uids').textContent;
                expect(filteredUids).toContain('go:333214');
                expect(filteredUids).not.toContain('go:dm-only');
            });
        });
    });

    describe('Multi-Branch Enrollment and State', () => {
        const MultiBranchTestComponent = () => {
            const {
                isCseEnrolled,
                isEcEnrolled,
                isEeEnrolled,
                isMeEnrolled,
                isCeEnrolled,
                includeCse,
                includeDa,
                includeEc,
                includeEe,
                includeMe,
                includeCe,
                selectedBranches,
                activeBranch,
                filters,
            } = useFilterState();
            const { setIncludeEc, updateFilters } = useFilterActions();

            return (
                <div>
                    <div data-testid="is-cse-enrolled">{isCseEnrolled ? 'yes' : 'no'}</div>
                    <div data-testid="is-ec-enrolled">{isEcEnrolled ? 'yes' : 'no'}</div>
                    <div data-testid="is-ee-enrolled">{isEeEnrolled ? 'yes' : 'no'}</div>
                    <div data-testid="is-me-enrolled">{isMeEnrolled ? 'yes' : 'no'}</div>
                    <div data-testid="is-ce-enrolled">{isCeEnrolled ? 'yes' : 'no'}</div>
                    <div data-testid="include-cse">{includeCse ? 'yes' : 'no'}</div>
                    <div data-testid="include-da">{includeDa ? 'yes' : 'no'}</div>
                    <div data-testid="include-ec">{includeEc ? 'yes' : 'no'}</div>
                    <div data-testid="include-ee">{includeEe ? 'yes' : 'no'}</div>
                    <div data-testid="include-me">{includeMe ? 'yes' : 'no'}</div>
                    <div data-testid="include-ce">{includeCe ? 'yes' : 'no'}</div>
                    <div data-testid="selected-branches">{selectedBranches.join(',')}</div>
                    <div data-testid="active-branch">{activeBranch}</div>
                    <div data-testid="selected-subjects">{filters.selectedSubjects.join(',')}</div>
                    <button data-testid="toggle-include-ec" onClick={() => setIncludeEc(false)}>Disable EC</button>
                    <button data-testid="set-ec-filters" onClick={() => updateFilters({ selectedSubjects: ['ec-analog-circuits'] })}>Set EC Filter</button>
                </div>
            );
        };

        test('derives isCseEnrolled and isEcEnrolled accurately from branch preferences', async () => {
            writeBranchPreferences(['ec', 'cse'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <MultiBranchTestComponent />
                </FilterProvider>
            );

            expect(getByTestId('is-cse-enrolled').textContent).toBe('yes');
            expect(getByTestId('is-ec-enrolled').textContent).toBe('yes');
            expect(getByTestId('is-ee-enrolled').textContent).toBe('no');
            expect(getByTestId('selected-branches').textContent).toBe('ec,cse');
            expect(getByTestId('active-branch').textContent).toBe('ec');
            expect(getByTestId('include-ec').textContent).toBe('yes');
            expect(getByTestId('include-cse').textContent).toBe('yes');
        });

        test('when 2 preferred branches are selected, their filter toggles are ON by default and non-enrolled are OFF', async () => {
            writeBranchPreferences(['me', 'ce'], 'me');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <MultiBranchTestComponent />
                </FilterProvider>
            );

            expect(getByTestId('include-me').textContent).toBe('yes');
            expect(getByTestId('include-ce').textContent).toBe('yes');
            expect(getByTestId('include-cse').textContent).toBe('no');
            expect(getByTestId('include-da').textContent).toBe('no');
            expect(getByTestId('include-ec').textContent).toBe('no');
            expect(getByTestId('include-ee').textContent).toBe('no');
        });

        test('changing preferred branch selection automatically turns newly selected branches ON and deselected branches OFF in filters', async () => {
            writeBranchPreferences(['me', 'ce'], 'me');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <MultiBranchTestComponent />
                </FilterProvider>
            );

            expect(getByTestId('include-me').textContent).toBe('yes');
            expect(getByTestId('include-ce').textContent).toBe('yes');

            // User changes preferred disciplines to EC and EE
            act(() => {
                writeBranchPreferences(['ec', 'ee'], 'ec');
            });

            await waitFor(() => {
                expect(getByTestId('include-ec').textContent).toBe('yes');
                expect(getByTestId('include-ee').textContent).toBe('yes');
                expect(getByTestId('include-me').textContent).toBe('no');
                expect(getByTestId('include-ce').textContent).toBe('no');
                expect(getByTestId('include-cse').textContent).toBe('no');
            });
        });

        test('toggling setIncludeEc(false) sets includeEc to false and prunes ec subjects', async () => {
            writeBranchPreferences(['ec', 'cse'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <MultiBranchTestComponent />
                </FilterProvider>
            );

            // Add an ec subject
            fireEvent.click(getByTestId('set-ec-filters'));
            expect(getByTestId('selected-subjects').textContent).toContain('ec-analog-circuits');

            // Disable EC
            fireEvent.click(getByTestId('toggle-include-ec'));
            await waitFor(() => {
                expect(getByTestId('include-ec').textContent).toBe('no');
                expect(getByTestId('selected-subjects').textContent).not.toContain('ec-analog-circuits');
            });
        });
    });

    describe('unlockDetailedSolutions toggle and actions', () => {
        const UnlockSolutionsTestComponent = () => {
            const { filters } = useFilterState();
            const { setUnlockDetailedSolutions, clearFilters } = useFilterActions();
            return (
                <div>
                    <span data-testid="unlock-status">{filters.unlockDetailedSolutions ? 'true' : 'false'}</span>
                    <button data-testid="enable-unlock" onClick={() => setUnlockDetailedSolutions(true)}>Enable</button>
                    <button data-testid="disable-unlock" onClick={() => setUnlockDetailedSolutions(false)}>Disable</button>
                    <button data-testid="reset-filters" onClick={clearFilters}>Reset</button>
                </div>
            );
        };

        test('defaults to false, toggles with setUnlockDetailedSolutions, and resets with clearFilters', () => {
            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <UnlockSolutionsTestComponent />
                </FilterProvider>
            );

            expect(getByTestId('unlock-status').textContent).toBe('false');

            fireEvent.click(getByTestId('enable-unlock'));
            expect(getByTestId('unlock-status').textContent).toBe('true');

            fireEvent.click(getByTestId('disable-unlock'));
            expect(getByTestId('unlock-status').textContent).toBe('false');

            fireEvent.click(getByTestId('enable-unlock'));
            expect(getByTestId('unlock-status').textContent).toBe('true');

            fireEvent.click(getByTestId('reset-filters'));
            expect(getByTestId('unlock-status').textContent).toBe('false');
        });
    });

    describe('Branch-scoped General Aptitude (GA) filtering in FilterContext', () => {
        const mockEcQuestions = [
            {
                question_uid: 'ec:2021:ga:q1',
                title: 'GATE EC 2021 | GA | Question: 1',
                searchText: 'ec aptitude quantitative',
                subjectSlug: 'ga',
                subject: 'General Aptitude',
                subjectLabel: 'General Aptitude',
                section: 'ga',
                type: 'MCQ',
                tags: ['ec-2021', 'ga'],
                exam: { year: 2021, set: 1, yearSetKey: 'ec-2021-s1', yearSetIdentity: 'ec:2021:set-1' },
                yearSetIdentity: 'ec:2021:set-1',
                track: 'ec',
            },
            {
                question_uid: 'ec:2021:ga:q2',
                title: 'GATE EC 2021 | GA | Question: 2',
                searchText: 'ec aptitude nat calculation',
                subjectSlug: 'ga',
                subject: 'General Aptitude',
                subjectLabel: 'General Aptitude',
                section: 'ga',
                type: 'NAT',
                tags: ['ec-2021', 'ga'],
                exam: { year: 2021, set: 1, yearSetKey: 'ec-2021-s1', yearSetIdentity: 'ec:2021:set-1' },
                yearSetIdentity: 'ec:2021:set-1',
                track: 'ec',
            },
            {
                question_uid: 'ec:2020:ga:q1',
                title: 'GATE EC 2020 | GA | Question: 1',
                searchText: 'ec aptitude 2020',
                subjectSlug: 'ga',
                subject: 'General Aptitude',
                subjectLabel: 'General Aptitude',
                section: 'ga',
                type: 'MCQ',
                tags: ['ec-2020', 'ga'],
                exam: { year: 2020, set: 1, yearSetKey: 'ec-2020-s1', yearSetIdentity: 'ec:2020:set-1' },
                yearSetIdentity: 'ec:2020:set-1',
                track: 'ec',
            },
            {
                question_uid: 'ec:2021:tech:q1',
                title: 'GATE EC 2021 | Question: 1',
                searchText: 'analog circuits opamp gain',
                subjectSlug: 'ec-analog-circuits',
                subject: 'Analog Circuits',
                subjectLabel: 'Analog Circuits',
                section: 'ec',
                type: 'MCQ',
                tags: ['ec-2021', 'ec-analog-circuits'],
                exam: { year: 2021, set: 1, yearSetKey: 'ec-2021-s1', yearSetIdentity: 'ec:2021:set-1' },
                yearSetIdentity: 'ec:2021:set-1',
                track: 'ec',
            },
        ];

        const mockMeQuestions = [
            {
                question_uid: 'me:2021:ga:q1',
                title: 'GATE ME 2021 | GA | Question: 1',
                searchText: 'me aptitude verbal logic',
                subjectSlug: 'ga',
                subject: 'General Aptitude',
                subjectLabel: 'General Aptitude',
                section: 'ga',
                type: 'MCQ',
                tags: ['me-2021', 'ga'],
                exam: { year: 2021, set: 1, yearSetKey: 'me-2021-s1', yearSetIdentity: 'me:2021:set-1' },
                yearSetIdentity: 'me:2021:set-1',
                track: 'me',
            },
            {
                question_uid: 'me:2021:tech:q1',
                title: 'GATE ME 2021 | Question: 1',
                searchText: 'thermodynamics carnot cycle',
                subjectSlug: 'me-thermodynamics',
                subject: 'Thermodynamics',
                subjectLabel: 'Thermodynamics',
                section: 'me',
                type: 'MCQ',
                tags: ['me-2021', 'me-thermodynamics'],
                exam: { year: 2021, set: 1, yearSetKey: 'me-2021-s1', yearSetIdentity: 'me:2021:set-1' },
                yearSetIdentity: 'me:2021:set-1',
                track: 'me',
            },
        ];

        beforeEach(() => {
            vi.spyOn(BranchQuestionService, 'isLoaded').mockImplementation((track) => track === 'ec' || track === 'me');
            vi.spyOn(BranchQuestionService, 'getQuestions').mockImplementation((track) => {
                if (track === 'ec') return mockEcQuestions;
                if (track === 'me') return mockMeQuestions;
                return [];
            });
            vi.spyOn(BranchQuestionService, 'init').mockImplementation(async (track) => {
                if (track === 'ec') return mockEcQuestions;
                if (track === 'me') return mockMeQuestions;
                return [];
            });
        });

        const BranchGaTestComponent = () => {
            const { filteredQuestions, filters, allQuestions } = useFilterState();
            const { updateFilters, clearFilters, setIncludeEc, setIncludeMe } = useFilterActions();

            return (
                <div>
                    <div data-testid="all-question-uids">{allQuestions.map(q => q.question_uid).join(',')}</div>
                    <div data-testid="filtered-question-uids">{filteredQuestions.map(q => q.question_uid).join(',')}</div>
                    <div data-testid="selected-ga-branches">{(filters.selectedGaBranches || []).join(',')}</div>
                    <button data-testid="select-ec-ga" onClick={() => updateFilters({ selectedGaBranches: ['ec'] })}>Select EC GA</button>
                    <button data-testid="select-me-ga" onClick={() => updateFilters({ selectedGaBranches: ['me'] })}>Select ME GA</button>
                    <button data-testid="select-both-ga" onClick={() => updateFilters({ selectedGaBranches: ['ec', 'me'] })}>Select Both GA</button>
                    <button data-testid="select-ec-tech" onClick={() => updateFilters({ selectedSubjects: ['ec-analog-circuits'] })}>Select EC Tech</button>
                    <button data-testid="select-ec-tech-and-ga" onClick={() => updateFilters({ selectedSubjects: ['ec-analog-circuits'], selectedGaBranches: ['ec'] })}>Select EC Tech & GA</button>
                    <button data-testid="select-year-2021" onClick={() => updateFilters({ selectedYearSets: ['ec:2021:set-1'] })}>Select 2021</button>
                    <button data-testid="select-mcq-only" onClick={() => updateFilters({ selectedTypes: ['MCQ'] })}>Select MCQ</button>
                    <button data-testid="clear-all-filters" onClick={clearFilters}>Clear Filters</button>
                    <button data-testid="disable-ec" onClick={() => setIncludeEc(false)}>Disable EC</button>
                </div>
            );
        };

        test('selecting EC GA returns only EC GA questions (and excludes technical and ME questions)', async () => {
            writeBranchPreferences(['ec', 'me'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            // Wait for both branch pools to load
            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
                expect(getByTestId('all-question-uids').textContent).toContain('me:2021:ga:q1');
            });

            // Filter to only EC GA
            act(() => {
                fireEvent.click(getByTestId('select-ec-ga'));
            });

            await waitFor(() => {
                const uids = getByTestId('filtered-question-uids').textContent.split(',').filter(Boolean);
                // EC GA questions are returned
                expect(uids).toContain('ec:2021:ga:q1');
                expect(uids).toContain('ec:2021:ga:q2');
                expect(uids).toContain('ec:2020:ga:q1');

                // EC technical question is excluded
                expect(uids).not.toContain('ec:2021:tech:q1');

                // ME questions are excluded
                expect(uids).not.toContain('me:2021:ga:q1');
                expect(uids).not.toContain('me:2021:tech:q1');

                // CSE questions are excluded
                expect(uids).not.toContain('go:1');
            });
        });

        test('selecting both EC GA and ME GA returns GA questions for both active branches independently', async () => {
            writeBranchPreferences(['ec', 'me'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
            });

            act(() => {
                fireEvent.click(getByTestId('select-both-ga'));
            });

            await waitFor(() => {
                const uids = getByTestId('filtered-question-uids').textContent.split(',').filter(Boolean);
                expect(uids).toContain('ec:2021:ga:q1');
                expect(uids).toContain('ec:2021:ga:q2');
                expect(uids).toContain('ec:2020:ga:q1');
                expect(uids).toContain('me:2021:ga:q1');

                // Technical questions from both branches remain excluded
                expect(uids).not.toContain('ec:2021:tech:q1');
                expect(uids).not.toContain('me:2021:tech:q1');
            });
        });

        test('combines branch GA with technical subjects using OR composition', async () => {
            writeBranchPreferences(['ec', 'me'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
            });

            act(() => {
                fireEvent.click(getByTestId('select-ec-tech-and-ga'));
            });

            await waitFor(() => {
                const uids = getByTestId('filtered-question-uids').textContent.split(',').filter(Boolean);
                // Both EC GA and EC Analog Circuits are returned
                expect(uids).toContain('ec:2021:ga:q1');
                expect(uids).toContain('ec:2021:tech:q1');

                // ME GA and ME technical remain excluded
                expect(uids).not.toContain('me:2021:ga:q1');
                expect(uids).not.toContain('me:2021:tech:q1');
            });
        });

        test('composes branch GA with year and question-type constraints', async () => {
            writeBranchPreferences(['ec'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
            });

            // Select EC GA
            act(() => {
                fireEvent.click(getByTestId('select-ec-ga'));
            });

            // Constrain by year 2021
            act(() => {
                fireEvent.click(getByTestId('select-year-2021'));
            });

            await waitFor(() => {
                const uids = getByTestId('filtered-question-uids').textContent.split(',').filter(Boolean);
                expect(uids).toContain('ec:2021:ga:q1');
                expect(uids).toContain('ec:2021:ga:q2');
                // 2020 GA question is filtered out by year constraint
                expect(uids).not.toContain('ec:2020:ga:q1');
            });

            // Constrain by question type MCQ
            act(() => {
                fireEvent.click(getByTestId('select-mcq-only'));
            });

            await waitFor(() => {
                const uids = getByTestId('filtered-question-uids').textContent.split(',').filter(Boolean);
                expect(uids).toContain('ec:2021:ga:q1');
                // NAT GA question is filtered out by type constraint
                expect(uids).not.toContain('ec:2021:ga:q2');
            });
        });

        test('clearFilters resets selectedGaBranches', async () => {
            writeBranchPreferences(['ec'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
            });

            act(() => {
                fireEvent.click(getByTestId('select-ec-ga'));
            });
            expect(getByTestId('selected-ga-branches').textContent).toBe('ec');

            act(() => {
                fireEvent.click(getByTestId('clear-all-filters'));
            });
            expect(getByTestId('selected-ga-branches').textContent).toBe('');
        });

        test('disabling EC branch removes ec from selectedGaBranches while preserving others', async () => {
            writeBranchPreferences(['ec', 'me'], 'ec');

            const { getByTestId } = renderWithRouter(
                <FilterProvider>
                    <BranchGaTestComponent />
                </FilterProvider>
            );

            await waitFor(() => {
                expect(getByTestId('all-question-uids').textContent).toContain('ec:2021:ga:q1');
            });

            act(() => {
                fireEvent.click(getByTestId('select-both-ga'));
            });
            expect(getByTestId('selected-ga-branches').textContent).toBe('ec,me');

            act(() => {
                fireEvent.click(getByTestId('disable-ec'));
            });

            await waitFor(() => {
                expect(getByTestId('selected-ga-branches').textContent).toBe('me');
            });
        });
    });
});



