import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { QuestionService } from '../services/QuestionService';
import { AnswerService } from '../services/AnswerService';

const FilterStateContext = createContext();
const FilterActionsContext = createContext();

const DEFAULT_SELECTED_TYPES = ['MCQ', 'MSQ', 'NAT'];
const STORAGE_KEYS = {
    solved: 'gate_qa_solved_questions',
    bookmarked: 'gate_qa_bookmarked_questions',
    metadata: 'gate_qa_progress_metadata'
};
const LEGACY_STORAGE_KEYS = {
    bookmarked: 'gateqa_bookmarks_v1'
};
const STORAGE_HEALTH_KEY = '__gate_qa_storage_health_check__';

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

const parseBooleanParam = (value) => {
    if (typeof value !== 'string') {
        return false;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
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

export const FilterProvider = ({ children }) => {
    const [structuredTags, setStructuredTags] = useState({
        yearSets: [],
        years: [],
        subjects: [],
        topics: [],
        structuredSubtopics: {},
        structuredTopics: {},
        minYear: 2000,
        maxYear: 2025
    });

    const [filters, setFilters] = useState({
        selectedYearSets: [],
        yearRange: [2000, 2025],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedTypes: [...DEFAULT_SELECTED_TYPES],
        hideSolved: false,
        showOnlySolved: false,
        showOnlyBookmarked: false,
        searchQuery: ''
    });


    const [totalQuestions, setTotalQuestions] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    const [solvedQuestionIds, setSolvedQuestionIds] = useState([]);
    const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState([]);
    const [isProgressStorageAvailable, setIsProgressStorageAvailable] = useState(true);
    const [hasLoadedProgressState, setHasLoadedProgressState] = useState(false);

    useEffect(() => {
        if (QuestionService.questions.length > 0) {
            const tags = QuestionService.getStructuredTags();
            setStructuredTags(tags);
            setTotalQuestions(QuestionService.questions.length);

            const { minYear, maxYear } = tags;
            setFilters(prev => {
                // Only overwrite if it was completely pristine
                const hasCustomRange = prev.yearRange && prev.yearRange.length === 2 && (prev.yearRange[0] > 2000 || prev.yearRange[1] < 2025);
                return {
                    ...prev,
                    yearRange: hasCustomRange ? prev.yearRange : [minYear, maxYear]
                };
            });

            setIsInitialized(true);
        }
    }, [QuestionService.loaded]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
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
            showOnlyBookmarked: parseBooleanParam(params.get('showOnlyBookmarked'))
        };

        // Apply state safely using standard initial values + url overrides to ensure stability
        setFilters(prev => {
            const merged = { ...prev };
            // Copy explicitly so we don't drop types accidentally
            merged.selectedTypes = urlFilters.selectedTypes;
            merged.selectedYearSets = urlFilters.selectedYearSets;
            merged.selectedSubjects = urlFilters.selectedSubjects;
            merged.selectedSubtopics = urlFilters.selectedSubtopics;
            merged.hideSolved = urlFilters.hideSolved;
            merged.showOnlySolved = urlFilters.showOnlySolved;
            merged.showOnlyBookmarked = urlFilters.showOnlyBookmarked;

            if (urlFilters.yearRange && urlFilters.yearRange.length === 2 && !isNaN(urlFilters.yearRange[0])) {
                merged.yearRange = urlFilters.yearRange;
            }
            return merged;
        });
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        // Preserve any existing `question` param set by App.jsx deep-linking
        const existingParams = new URLSearchParams(window.location.search);
        const questionParam = existingParams.get('question');

        const params = new URLSearchParams();
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

        // Re-attach the question param so deep-link is not wiped by filter sync
        if (questionParam) {
            params.set('question', questionParam);
        }

        const query = params.toString();
        const newUrl = query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;

        window.history.replaceState({}, '', newUrl);
    }, [filters, isInitialized, structuredTags.minYear, structuredTags.maxYear]);

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
    }, [isInitialized, totalQuestions]);

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
    const subtopicToSubjectSlug = useMemo(() => {
        const map = new Map();
        const subs = structuredTags.structuredSubtopics || {};
        Object.keys(subs).forEach(subjectSlug => {
            (subs[subjectSlug] || []).forEach(entry => {
                if (entry && entry.slug) {
                    map.set(entry.slug, subjectSlug);
                }
            });
        });
        return map;
    }, [structuredTags.structuredSubtopics]);

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

            return yearMatch && rangeMatch && topicMatch && subtopicMatch && typeMatch;
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
        subtopicToSubjectSlug
    ]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            const merged = { ...prev, ...newFilters };
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedTypes')) {
                merged.selectedTypes = normalizeSelectedTypes(newFilters.selectedTypes);
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedYearSets')) {
                merged.selectedYearSets = normalizeYearSetTokens(newFilters.selectedYearSets);
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedSubjects')) {
                merged.selectedSubjects = normalizeSubjectSlugs(newFilters.selectedSubjects);

                // Auto-remove orphaned subtopics when a subject is deselected.
                // If a subtopic belongs to a subject that is no longer selected,
                // it must be removed to prevent impossible filter states.
                const activeSubjectSet = new Set(merged.selectedSubjects);
                if (merged.selectedSubtopics.length > 0) {
                    merged.selectedSubtopics = merged.selectedSubtopics.filter(subtopicSlug => {
                        const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
                        // Keep subtopic if its parent subject is still selected
                        // or if we can't determine the parent (defensive)
                        return !parentSlug || activeSubjectSet.has(parentSlug);
                    });
                }
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedSubtopics')) {
                merged.selectedSubtopics = normalizeSubtopicSlugs(newFilters.selectedSubtopics);

                // Auto-add parent subject when a subtopic is selected.
                // This ensures the subject+subtopic always form a valid AND pair.
                const currentSubjects = new Set(merged.selectedSubjects);
                let subjectsChanged = false;
                merged.selectedSubtopics.forEach(subtopicSlug => {
                    const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
                    if (parentSlug && !currentSubjects.has(parentSlug)) {
                        currentSubjects.add(parentSlug);
                        subjectsChanged = true;
                    }
                });
                if (subjectsChanged) {
                    merged.selectedSubjects = normalizeSubjectSlugs(Array.from(currentSubjects));
                }
            }
            return merged;
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
        toggleSolved, toggleBookmark, isQuestionSolved,
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
