import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionService } from '../services/QuestionService';
import { AnswerService } from '../services/AnswerService';
import { FILTER_QUERY_KEYS, PRACTICE_ROUTE } from '../utils/routes';

const FilterStateContext = createContext();
const FilterActionsContext = createContext();

const DEFAULT_SELECTED_TYPES = ['MCQ', 'MSQ', 'NAT'];
const STORAGE_KEYS = {
    solved: 'gate_qa_solved_questions',
    bookmarked: 'gate_qa_bookmarked_questions',
    metadata: 'gate_qa_progress_metadata'
};
const DEFAULT_MIN_YEAR = 2000;
const DEFAULT_MAX_YEAR = new Date().getFullYear();
const LEGACY_STORAGE_KEYS = {
    bookmarked: 'gateqa_bookmarks_v1'
};
const STORAGE_HEALTH_KEY = '__gate_qa_storage_health_check__';

const buildStructuredTagsFromManifest = (manifest = null) => {
    const yearSets = Array.isArray(manifest?.yearSets)
        ? manifest.yearSets
            .map((entry) => ({
                key: String(entry?.key || '').trim(),
                year: Number(entry?.year),
                set: Number.isFinite(Number(entry?.set)) && Number(entry?.set) > 0
                    ? Number(entry?.set)
                    : null,
                label: String(entry?.label || '').trim(),
                count: Number(entry?.count || 0),
            }))
            .filter((entry) => entry.key && Number.isFinite(entry.year) && entry.label)
        : [];

    const subjects = Array.isArray(manifest?.subjects)
        ? manifest.subjects
            .map((subject) => ({
                slug: QuestionService.normalizeSubjectSlug(subject?.slug || subject?.label || '') || 'unknown',
                label: String(subject?.label || QuestionService.getSubjectLabelBySlug(subject?.slug || '') || 'Unknown').trim(),
                count: Number(subject?.count || 0),
            }))
            .filter((subject) => subject.slug && subject.label && subject.slug !== 'unknown')
        : [];

    const structuredSubtopics = {};
    const structuredTopics = {};
    subjects.forEach((subject) => {
        structuredSubtopics[subject.slug] = [];
        structuredTopics[subject.label] = [];
    });

    const numericYears = yearSets
        .map((entry) => entry.year)
        .filter((year) => Number.isFinite(year));
    const minYear = numericYears.length ? Math.min(...numericYears) : DEFAULT_MIN_YEAR;
    const maxYear = numericYears.length ? Math.max(...numericYears) : DEFAULT_MAX_YEAR;

    return {
        yearSets,
        years: yearSets.map((entry) => entry.key),
        subjects,
        topics: subjects.map((subject) => subject.slug),
        structuredSubtopics,
        structuredTopics,
        minYear,
        maxYear
    };
};

const hasCustomYearRange = (yearRange, minYear, maxYear) => (
    Array.isArray(yearRange)
    && yearRange.length === 2
    && (
        Number(yearRange[0]) !== Number(minYear)
        || Number(yearRange[1]) !== Number(maxYear)
    )
);

const normalizeSelectedTypes = (rawTypes, { fallbackToDefault = false } = {}) => {
    if (!Array.isArray(rawTypes)) {
        return fallbackToDefault ? [...DEFAULT_SELECTED_TYPES] : [];
    }

    const normalized = rawTypes
        .map(type => String(type || '').trim().toUpperCase())
        .filter(type => DEFAULT_SELECTED_TYPES.includes(type));

    const orderedUnique = DEFAULT_SELECTED_TYPES.filter(type => normalized.includes(type));

    if (fallbackToDefault && orderedUnique.length === 0) {
        return [...DEFAULT_SELECTED_TYPES];
    }

    return orderedUnique;
};

const yearSetComparator = (a, b) => {
    const parsedA = QuestionService.parseYearSetKey(a);
    const parsedB = QuestionService.parseYearSetKey(b);
    if (!parsedA || !parsedB) return String(a).localeCompare(String(b));
    if (parsedA.year !== parsedB.year) {
        return parsedB.year - parsedA.year;
    }
    return (parsedB.set || 0) - (parsedA.set || 0);
};

const normalizeYearSetTokens = (rawTokens) => {
    const values = Array.isArray(rawTokens) ? rawTokens : [];
    const unique = new Set();

    values.forEach((rawToken) => {
        const token = String(rawToken || '').trim();
        if (!token) return;

        const parsedKey = QuestionService.parseYearSetKey(token);
        if (parsedKey) {
            unique.add(parsedKey.key);
            return;
        }

        const fromTag = QuestionService.extractYearSetFromTag(token);
        if (fromTag) {
            const key = QuestionService.buildYearSetKey(fromTag.year, fromTag.set);
            if (key) unique.add(key);
        }
    });

    return Array.from(unique).sort(yearSetComparator);
};

const normalizeSubjectSlugs = (rawSubjects) => {
    const values = Array.isArray(rawSubjects) ? rawSubjects : [];
    const unique = new Set();

    values.forEach((rawSubject) => {
        const subjectSlug = QuestionService.normalizeSubjectSlug(rawSubject);
        if (subjectSlug && subjectSlug !== 'unknown') {
            unique.add(subjectSlug);
        }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const normalizeSubtopicSlugs = (rawSubtopics) => {
    const values = Array.isArray(rawSubtopics) ? rawSubtopics : [];
    const unique = new Set();

    values.forEach((rawSubtopic) => {
        const slug = QuestionService.slugifyToken(rawSubtopic);
        if (slug) {
            unique.add(slug);
        }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const buildSubtopicToSubjectSlugMap = (structuredSubtopics = {}) => {
    const map = new Map();

    Object.entries(structuredSubtopics || {}).forEach(([subjectSlug, entries]) => {
        (entries || []).forEach((entry) => {
            const slug = QuestionService.slugifyToken(entry?.slug || entry?.label || entry);
            if (slug) {
                map.set(slug, subjectSlug);
            }
        });
    });

    return map;
};

const reconcileSubjectAndSubtopicFilters = (baseFilters, incomingFilters, subtopicToSubjectSlug) => {
    const merged = { ...baseFilters };
    const hasSelectedSubjects = Object.prototype.hasOwnProperty.call(incomingFilters, 'selectedSubjects');
    const hasSelectedSubtopics = Object.prototype.hasOwnProperty.call(incomingFilters, 'selectedSubtopics');

    if (hasSelectedSubjects) {
        merged.selectedSubjects = normalizeSubjectSlugs(incomingFilters.selectedSubjects);

        if (merged.selectedSubtopics.length > 0) {
            const activeSubjectSet = new Set(merged.selectedSubjects);
            merged.selectedSubtopics = normalizeSubtopicSlugs(merged.selectedSubtopics).filter((subtopicSlug) => {
                const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
                return !parentSlug || activeSubjectSet.has(parentSlug);
            });
        }
    }

    if (hasSelectedSubtopics) {
        merged.selectedSubtopics = normalizeSubtopicSlugs(incomingFilters.selectedSubtopics);

        const selectedSubjects = new Set(merged.selectedSubjects);
        merged.selectedSubtopics.forEach((subtopicSlug) => {
            const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
            if (parentSlug) {
                selectedSubjects.add(parentSlug);
            }
        });
        merged.selectedSubjects = normalizeSubjectSlugs(Array.from(selectedSubjects));
    }

    return merged;
};

const normalizeStoredIds = (rawIds) => {
    if (!Array.isArray(rawIds)) {
        return [];
    }

    const seen = new Set();
    const normalized = [];

    rawIds.forEach((rawId) => {
        const id = String(rawId || '').trim();
        if (!id || seen.has(id)) {
            return;
        }
        seen.add(id);
        normalized.push(id);
    });

    return normalized;
};

const normalizeProgressTargets = (rawTargets) => {
    const values = Array.isArray(rawTargets) ? rawTargets : [rawTargets];
    return normalizeStoredIds(
        values
            .map((target) => (typeof target === 'string'
                ? String(target || '').trim()
                : getQuestionTrackingId(target)))
            .filter(Boolean)
    );
};

const parseBooleanParam = (value) => {
    if (typeof value !== 'string') {
        return false;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

const normalizeSearchQuery = (value) => (
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
);

const tokenizeSearchQuery = (value) => {
    const normalized = normalizeSearchQuery(value);
    return normalized ? normalized.split(' ') : [];
};

const canUseBrowserStorage = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    try {
        window.localStorage.setItem(STORAGE_HEALTH_KEY, 'ok');
        window.localStorage.removeItem(STORAGE_HEALTH_KEY);
        return true;
    } catch (error) {
        return false;
    }
};

const readJsonFromStorage = (key, fallback) => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
};

const getQuestionTrackingId = (question = {}) => {
    if (!question || typeof question !== 'object') {
        return null;
    }

    const candidate = AnswerService.getStorageKeyForQuestion(question);
    if (!candidate) {
        return null;
    }

    const normalized = String(candidate).trim();
    return normalized || null;
};


/** Use only filter state (data) — re-renders when data changes. */
export const useFilterState = () => {
    const ctx = useContext(FilterStateContext);
    if (!ctx) throw new Error('useFilterState must be used within a FilterProvider');
    return ctx;
};

/** Use only filter actions (callbacks) — stable, never causes re-renders. */
export const useFilterActions = () => {
    const ctx = useContext(FilterActionsContext);
    if (!ctx) throw new Error('useFilterActions must be used within a FilterProvider');
    return ctx;
};

export const FilterProvider = ({
    children,
    initialManifest = null,
    questionDataRevision = 0
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [structuredTags, setStructuredTags] = useState(() => buildStructuredTagsFromManifest(initialManifest));
    const lastHydratedSearchRef = useRef(null);

    const [filters, setFilters] = useState(() => {
        const manifestStructuredTags = buildStructuredTagsFromManifest(initialManifest);
        return {
        selectedYearSets: [],
        yearRange: [manifestStructuredTags.minYear, manifestStructuredTags.maxYear],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedTypes: [...DEFAULT_SELECTED_TYPES],
        hideSolved: false,
        showOnlySolved: false,
        showOnlyBookmarked: false,
        searchQuery: ''
        };
    });


    const [totalQuestions, setTotalQuestions] = useState(() => Number(initialManifest?.questionCount || 0));
    const [isInitialized, setIsInitialized] = useState(false);

    const [solvedQuestionIds, setSolvedQuestionIds] = useState([]);
    const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState([]);
    const [isProgressStorageAvailable, setIsProgressStorageAvailable] = useState(true);
    const [hasLoadedProgressState, setHasLoadedProgressState] = useState(false);
    const urlHydrationSubtopicToSubjectSlug = useMemo(
        () => buildSubtopicToSubjectSlugMap(structuredTags.structuredSubtopics),
        [structuredTags.structuredSubtopics]
    );
    const isPracticePath = location.pathname === PRACTICE_ROUTE
        || location.pathname.startsWith(`${PRACTICE_ROUTE}/question/`);

    useEffect(() => {
        if (!initialManifest || QuestionService.questions.length > 0) {
            return;
        }

        const manifestStructuredTags = buildStructuredTagsFromManifest(initialManifest);
        setStructuredTags(manifestStructuredTags);
        setTotalQuestions(Number(initialManifest.questionCount || 0));

        const { minYear, maxYear } = manifestStructuredTags;
        setFilters(prev => ({
            ...prev,
            yearRange: hasCustomYearRange(prev.yearRange, structuredTags.minYear, structuredTags.maxYear)
                ? prev.yearRange
                : [minYear, maxYear]
        }));
    }, [initialManifest]);

    useEffect(() => {
        if (QuestionService.questions.length > 0) {
            const tags = QuestionService.getStructuredTags();
            setStructuredTags(tags);
            setTotalQuestions(QuestionService.questions.length);

            const { minYear, maxYear } = tags;
            setFilters(prev => {
                return {
                    ...prev,
                    yearRange: hasCustomYearRange(prev.yearRange, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR)
                        ? prev.yearRange
                        : [minYear, maxYear]
                };
            });

            setIsInitialized(true);
        }
    }, [questionDataRevision]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isPracticePath) {
            return;
        }

        const currentSearch = location.search || '';
        if (lastHydratedSearchRef.current === currentSearch) {
            return;
        }
        lastHydratedSearchRef.current = currentSearch;

        const params = new URLSearchParams(currentSearch);
        const urlTypes = params.get('types');
        const rawYearTokens = params.get('years')?.split(',').filter(Boolean) || [];
        const rawSubjectTokens = params.get('subjects')?.split(',').filter(Boolean)
            || params.get('topics')?.split(',').filter(Boolean)
            || [];
        const rawSubtopicTokens = params.get('subtopics')?.split(',').filter(Boolean) || [];

        const urlFilters = {
            selectedYearSets: normalizeYearSetTokens(rawYearTokens),
            yearRange: params.get('range')?.split('-').map(Number) || null,
            selectedSubjects: normalizeSubjectSlugs(rawSubjectTokens),
            selectedSubtopics: normalizeSubtopicSlugs(rawSubtopicTokens),
            selectedTypes: urlTypes === null
                ? [...DEFAULT_SELECTED_TYPES]
                : normalizeSelectedTypes(urlTypes.split(',').filter(Boolean)),
            hideSolved: parseBooleanParam(params.get('hideSolved')),
            showOnlySolved: parseBooleanParam(params.get('showOnlySolved')),
            showOnlyBookmarked: parseBooleanParam(params.get('showOnlyBookmarked')),
            searchQuery: normalizeSearchQuery(params.get('search'))
        };

        // Apply state safely using standard initial values + url overrides to ensure stability
        setFilters(prev => {
            let merged = { ...prev };
            // Copy explicitly so we don't drop types accidentally
            merged.selectedTypes = urlFilters.selectedTypes;
            merged.selectedYearSets = urlFilters.selectedYearSets;
            merged.hideSolved = urlFilters.hideSolved;
            merged.showOnlySolved = urlFilters.showOnlySolved;
            merged.showOnlyBookmarked = urlFilters.showOnlyBookmarked;
            merged.searchQuery = urlFilters.searchQuery;
            merged = reconcileSubjectAndSubtopicFilters(
                merged,
                {
                    selectedSubjects: urlFilters.selectedSubjects,
                    selectedSubtopics: urlFilters.selectedSubtopics
                },
                urlHydrationSubtopicToSubjectSlug
            );

            if (urlFilters.yearRange && urlFilters.yearRange.length === 2 && !isNaN(urlFilters.yearRange[0])) {
                merged.yearRange = urlFilters.yearRange;
            }
            return merged;
        });
    }, [isInitialized, isPracticePath, location.search, urlHydrationSubtopicToSubjectSlug]);

    useEffect(() => {
        if (!isInitialized || !isPracticePath) return;

        const params = new URLSearchParams(location.search);
        FILTER_QUERY_KEYS.forEach((key) => {
            params.delete(key);
        });
        const selectedYearSets = normalizeYearSetTokens(filters.selectedYearSets);
        const selectedSubjects = normalizeSubjectSlugs(filters.selectedSubjects);
        const selectedSubtopics = normalizeSubtopicSlugs(filters.selectedSubtopics);
        const normalizedYearRange = Array.isArray(filters.yearRange)
            ? filters.yearRange.map(Number)
            : [];
        const hasValidYearRange = normalizedYearRange.length === 2
            && Number.isFinite(normalizedYearRange[0])
            && Number.isFinite(normalizedYearRange[1]);
        const isDefaultYearRange = hasValidYearRange
            && normalizedYearRange[0] === Number(structuredTags.minYear)
            && normalizedYearRange[1] === Number(structuredTags.maxYear);

        if (selectedYearSets.length) params.set('years', selectedYearSets.join(','));
        if (selectedSubjects.length) params.set('subjects', selectedSubjects.join(','));
        if (selectedSubtopics.length) params.set('subtopics', selectedSubtopics.join(','));
        if (hasValidYearRange && !isDefaultYearRange) {
            params.set('range', normalizedYearRange.join('-'));
        }

        const selectedTypes = normalizeSelectedTypes(filters.selectedTypes);
        if (selectedTypes.length > 0 && selectedTypes.length < DEFAULT_SELECTED_TYPES.length) {
            params.set('types', selectedTypes.map(type => type.toLowerCase()).join(','));
        }

        if (filters.hideSolved) {
            params.set('hideSolved', '1');
        }
        if (filters.showOnlySolved) {
            params.set('showOnlySolved', '1');
        }
        if (filters.showOnlyBookmarked) {
            params.set('showOnlyBookmarked', '1');
        }

        const normalizedSearchQuery = normalizeSearchQuery(filters.searchQuery);
        if (normalizedSearchQuery) {
            params.set('search', normalizedSearchQuery);
        }

        const nextSearch = params.toString() ? `?${params.toString()}` : '';
        if (nextSearch === location.search) {
            return;
        }

        lastHydratedSearchRef.current = nextSearch;
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch,
            },
            { replace: true }
        );
    }, [
        filters,
        isInitialized,
        isPracticePath,
        location.pathname,
        location.search,
        navigate,
        structuredTags.minYear,
        structuredTags.maxYear
    ]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsProgressStorageAvailable(false);
            setHasLoadedProgressState(true);
            return;
        }

        const storageAvailable = canUseBrowserStorage();
        setIsProgressStorageAvailable(storageAvailable);

        if (!storageAvailable) {
            setHasLoadedProgressState(true);
            return;
        }

        const storedSolved = normalizeStoredIds(readJsonFromStorage(STORAGE_KEYS.solved, []));
        const storedBookmarkedRaw = readJsonFromStorage(STORAGE_KEYS.bookmarked, null);
        const storedBookmarked = storedBookmarkedRaw === null
            ? normalizeStoredIds(readJsonFromStorage(LEGACY_STORAGE_KEYS.bookmarked, []))
            : normalizeStoredIds(storedBookmarkedRaw);

        setSolvedQuestionIds(storedSolved);
        setBookmarkedQuestionIds(storedBookmarked);

        if (storedBookmarkedRaw === null) {
            try {
                window.localStorage.setItem(STORAGE_KEYS.bookmarked, JSON.stringify(storedBookmarked));
            } catch (error) {
                setIsProgressStorageAvailable(false);
            }
        }

        setHasLoadedProgressState(true);
    }, []);

    useEffect(() => {
        if (!hasLoadedProgressState || !isProgressStorageAvailable || typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(STORAGE_KEYS.solved, JSON.stringify(solvedQuestionIds));
            window.localStorage.setItem(STORAGE_KEYS.bookmarked, JSON.stringify(bookmarkedQuestionIds));
            window.localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify({
                lastUpdated: new Date().toISOString(),
                solvedCount: solvedQuestionIds.length,
                bookmarkedCount: bookmarkedQuestionIds.length
            }));
        } catch (error) {
            setIsProgressStorageAvailable(false);
        }
    }, [solvedQuestionIds, bookmarkedQuestionIds, hasLoadedProgressState, isProgressStorageAvailable]);

    const validQuestionIdSet = useMemo(() => {
        if (!isInitialized || !QuestionService.questions.length) {
            return new Set();
        }

        return new Set(
            QuestionService.questions
                .map(question => getQuestionTrackingId(question))
                .filter(Boolean)
        );
    }, [isInitialized, totalQuestions, questionDataRevision]);

    useEffect(() => {
        if (!isInitialized || validQuestionIdSet.size === 0) {
            return;
        }

        setSolvedQuestionIds((prev) => {
            const next = prev.filter(id => validQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });

        setBookmarkedQuestionIds((prev) => {
            const next = prev.filter(id => validQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });
    }, [isInitialized, validQuestionIdSet]);

    const solvedQuestionSet = useMemo(() => new Set(solvedQuestionIds), [solvedQuestionIds]);
    const bookmarkedQuestionSet = useMemo(() => new Set(bookmarkedQuestionIds), [bookmarkedQuestionIds]);

    // ── Reverse map: subtopicSlug → parent subjectSlug (for scoped filtering) ──
    const subtopicToSubjectSlug = useMemo(
        () => buildSubtopicToSubjectSlugMap(structuredTags.structuredSubtopics),
        [structuredTags.structuredSubtopics]
    );
    const deferredSearchQuery = useDeferredValue(filters.searchQuery);
    const normalizedDeferredSearchQuery = useMemo(
        () => normalizeSearchQuery(deferredSearchQuery),
        [deferredSearchQuery]
    );
    const searchTokens = useMemo(
        () => tokenizeSearchQuery(normalizedDeferredSearchQuery),
        [normalizedDeferredSearchQuery]
    );

    // ── Layer 3: useMemo-based filtered questions ────────────────────────
    const filteredQuestions = useMemo(() => {
        if (!QuestionService.questions.length) return [];

        const {
            selectedYearSets,
            selectedSubjects,
            selectedSubtopics,
            yearRange,
            hideSolved,
            showOnlySolved,
            showOnlyBookmarked
        } = filters;

        const selectedTypes = normalizeSelectedTypes(filters.selectedTypes);
        const selectedTypeSet = new Set(selectedTypes.map(type => type.toUpperCase()));

        // Group selected subtopics by their parent subject for scoped AND filtering.
        // e.g. { "dbms": Set(["b-tree"]), "os": Set(["virtual-memory"]) }
        const subtopicsByParentSubject = new Map();
        selectedSubtopics.forEach(subtopicSlug => {
            const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
            if (!parentSlug) return;
            if (!subtopicsByParentSubject.has(parentSlug)) {
                subtopicsByParentSubject.set(parentSlug, new Set());
            }
            subtopicsByParentSubject.get(parentSlug).add(subtopicSlug);
        });

        return QuestionService.questions.filter(q => {
            const questionId = getQuestionTrackingId(q);
            const isSolved = questionId ? solvedQuestionSet.has(questionId) : false;
            const isBookmarked = questionId ? bookmarkedQuestionSet.has(questionId) : false;
            const answer = AnswerService.getAnswerForQuestion(q);
            const resolvedType = answer
                ? QuestionService.normalizeTypeToken(answer.type)
                : QuestionService.normalizeTypeToken(q.type);

            // Keep the canonical type attached to each question object.
            if (q.type !== resolvedType) {
                q.type = resolvedType;
                if (q.canonical && typeof q.canonical === 'object') {
                    q.canonical.type = resolvedType;
                }
            }

            if (hideSolved && isSolved) {
                return false;
            }

            if (showOnlySolved && !isSolved) {
                return false;
            }

            if (showOnlyBookmarked && !isBookmarked) {
                return false;
            }

            let yearMatch = true;
            const qYearSetKey = q.exam?.yearSetKey || null;
            const qYearNum = Number.isFinite(q.exam?.year) ? q.exam.year : 0;

            if (selectedYearSets.length > 0) {
                yearMatch = qYearSetKey ? selectedYearSets.includes(qYearSetKey) : false;
            }

            let rangeMatch = true;
            const isRangeConstrained = yearRange
                && yearRange.length === 2
                && (yearRange[0] > structuredTags.minYear || yearRange[1] < structuredTags.maxYear);
            if (isRangeConstrained) {
                rangeMatch = qYearNum > 0 && qYearNum >= yearRange[0] && qYearNum <= yearRange[1];
            }

            const qSubjectSlug = q.subjectSlug || 'unknown';

            let topicMatch = true;
            if (selectedSubjects.length > 0) {
                topicMatch = selectedSubjects.includes(qSubjectSlug);
            }

            // Subtopic match: scoped to parent subject (AND logic).
            // A question must belong to the parent subject of the selected subtopic
            // AND have that subtopic in its canonical subtopics list.
            let subtopicMatch = true;
            if (subtopicsByParentSubject.size > 0) {
                const requiredSubtopics = subtopicsByParentSubject.get(qSubjectSlug);
                if (requiredSubtopics) {
                    // Question is in a subject that has subtopic filters active —
                    // it must match at least one of the required subtopics.
                    const questionSubtopicSlugs = Array.isArray(q.subtopics)
                        ? q.subtopics.map(sub => QuestionService.slugifyToken(sub.slug || sub.label || sub))
                        : [];
                    subtopicMatch = questionSubtopicSlugs.some(slug => requiredSubtopics.has(slug));
                } else {
                    // Question belongs to a subject with no subtopic filter —
                    // let it pass (subtopic filter doesn't constrain this subject).
                    subtopicMatch = true;
                }
            }

            let typeMatch = true;
            if (selectedTypes.length < DEFAULT_SELECTED_TYPES.length) {
                typeMatch = selectedTypeSet.has(resolvedType.toUpperCase());
            }

            let searchMatch = true;
            if (searchTokens.length > 0) {
                const searchText = String(q.searchText || '').toLowerCase();
                searchMatch = searchText
                    ? searchTokens.every((token) => searchText.includes(token))
                    : false;
            }

            return yearMatch && rangeMatch && topicMatch && subtopicMatch && typeMatch && searchMatch;
        });
    }, [
        filters.selectedTypes,
        filters.selectedSubtopics,
        filters.selectedSubjects,
        filters.selectedYearSets,
        filters.yearRange,
        filters.hideSolved,
        filters.showOnlySolved,
        filters.showOnlyBookmarked,
        isInitialized,
        solvedQuestionSet,
        bookmarkedQuestionSet,
        structuredTags.minYear,
        structuredTags.maxYear,
        subtopicToSubjectSlug,
        searchTokens
    ]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            let merged = { ...prev, ...newFilters };
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedTypes')) {
                merged.selectedTypes = normalizeSelectedTypes(newFilters.selectedTypes);
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedYearSets')) {
                merged.selectedYearSets = normalizeYearSetTokens(newFilters.selectedYearSets);
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'searchQuery')) {
                merged.searchQuery = normalizeSearchQuery(newFilters.searchQuery);
            }
            return reconcileSubjectAndSubtopicFilters(merged, newFilters, subtopicToSubjectSlug);
        });
    }, [subtopicToSubjectSlug]);

    const toggleSolved = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId);

        if (!questionId) {
            return;
        }

        setSolvedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
    }, []);

    const toggleBookmark = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId);

        if (!questionId) {
            return;
        }

        setBookmarkedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
    }, []);

    const markQuestionsSolved = useCallback((questionOrIds) => {
        const questionIds = normalizeProgressTargets(questionOrIds);
        if (questionIds.length === 0) {
            return;
        }

        setSolvedQuestionIds((prev) => {
            const nextSet = new Set(prev);
            questionIds.forEach((questionId) => {
                nextSet.add(questionId);
            });
            const next = Array.from(nextSet);
            return next.length === prev.length ? prev : next;
        });
    }, []);

    const refreshProgressState = useCallback(() => {
        if (typeof window === 'undefined' || !canUseBrowserStorage()) {
            return;
        }
        const storedSolved = normalizeStoredIds(readJsonFromStorage(STORAGE_KEYS.solved, []));
        const storedBookmarked = normalizeStoredIds(readJsonFromStorage(STORAGE_KEYS.bookmarked, []));
        setSolvedQuestionIds(storedSolved);
        setBookmarkedQuestionIds(storedBookmarked);
    }, []);

    const getQuestionProgressId = useCallback((question = {}) => {
        return getQuestionTrackingId(question);
    }, []);

    const isQuestionSolved = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId);
        return questionId ? solvedQuestionSet.has(questionId) : false;
    }, [solvedQuestionSet]);

    const isQuestionBookmarked = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId);
        return questionId ? bookmarkedQuestionSet.has(questionId) : false;
    }, [bookmarkedQuestionSet]);

    const setHideSolved = useCallback((value) => {
        const isHiding = !!value;
        const newFilters = { hideSolved: isHiding };
        if (isHiding) {
            newFilters.showOnlySolved = false;
        }
        updateFilters(newFilters);
    }, [updateFilters]);

    const setShowOnlySolved = useCallback((value) => {
        const isShowing = !!value;
        const newFilters = { showOnlySolved: isShowing };
        if (isShowing) {
            newFilters.hideSolved = false;
        }
        updateFilters(newFilters);
    }, [updateFilters]);

    const setShowOnlyBookmarked = useCallback((value) => {
        updateFilters({ showOnlyBookmarked: !!value });
    }, [updateFilters]);

    const solvedCount = useMemo(() => {
        if (validQuestionIdSet.size === 0) {
            return solvedQuestionIds.length;
        }
        return solvedQuestionIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [solvedQuestionIds, validQuestionIdSet]);

    const bookmarkedCount = useMemo(() => {
        if (validQuestionIdSet.size === 0) {
            return bookmarkedQuestionIds.length;
        }
        return bookmarkedQuestionIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [bookmarkedQuestionIds, validQuestionIdSet]);

    const progressPercentage = totalQuestions > 0
        ? Math.round((solvedCount / totalQuestions) * 100)
        : 0;

    const clearFilters = useCallback(() => {
        const { minYear, maxYear } = structuredTags;
        setFilters({
            selectedYearSets: [],
            yearRange: [minYear, maxYear],
            selectedSubjects: [],
            selectedSubtopics: [],
            selectedTypes: [...DEFAULT_SELECTED_TYPES],
            hideSolved: false,
            showOnlySolved: false,
            showOnlyBookmarked: false,
            searchQuery: ''
        });
    }, [structuredTags]);

    // Expose all questions and a lookup helper for deep-linking
    const allQuestions = QuestionService.questions;

    const getQuestionById = useCallback((id) => {
        if (!id || typeof id !== 'string') return null;
        const trimmed = id.trim();
        if (!trimmed) return null;
        return allQuestions.find(q => q.question_uid === trimmed) || null;
    }, [allQuestions]);

    // ── Layer 3: split state and actions into separate contexts ──────────
    const stateValue = useMemo(() => ({
        filters,
        filteredQuestions,
        allQuestions,
        structuredTags,
        totalQuestions,
        isInitialized,
        solvedQuestionIds,
        bookmarkedQuestionIds,
        solvedCount,
        bookmarkedCount,
        progressPercentage,
        isProgressStorageAvailable
    }), [
        filters, filteredQuestions, allQuestions, structuredTags,
        totalQuestions, isInitialized, solvedQuestionIds,
        bookmarkedQuestionIds, solvedCount, bookmarkedCount,
        progressPercentage, isProgressStorageAvailable
    ]);

    const actionsValue = useMemo(() => ({
        updateFilters,
        clearFilters,
        getQuestionById,
        toggleSolved,
        markQuestionsSolved,
        toggleBookmark,
        isQuestionSolved,
        isQuestionBookmarked,
        getQuestionProgressId,
        refreshProgressState,
        setHideSolved,
        setShowOnlySolved,
        setShowOnlyBookmarked
    }), [
        updateFilters, clearFilters, getQuestionById,
        toggleSolved, markQuestionsSolved, toggleBookmark, isQuestionSolved,
        isQuestionBookmarked, getQuestionProgressId,
        refreshProgressState,
        setHideSolved, setShowOnlySolved, setShowOnlyBookmarked
    ]);

    return (
        <FilterStateContext.Provider value={stateValue}>
            <FilterActionsContext.Provider value={actionsValue}>
                {children}
            </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
    );
};
