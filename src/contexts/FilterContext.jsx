import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionService } from '../services/QuestionService';
import { AptitudeQuestionService } from '../services/AptitudeQuestionService';
import { AnswerService } from '../services/AnswerService';
import { FILTER_QUERY_KEYS, PRACTICE_ROUTE } from '../utils/routes';
import { useAptitudeEnabled } from '../utils/aptitudePreference';
import { APTITUDE_USER_STATE_STORAGE_KEYS } from '../utils/localStorageState';

const FilterStateContext = createContext();
const FilterActionsContext = createContext();

const DEFAULT_SELECTED_TYPES = ['MCQ', 'MSQ', 'NAT'];
const STORAGE_KEYS = {
    solved: 'gate_qa_solved_questions',
    bookmarked: 'gate_qa_bookmarked_questions',
    metadata: 'gate_qa_progress_metadata',
    progress: 'gateqa_progress_v1'
};
const DEFAULT_MIN_YEAR = 2000;
const DEFAULT_MAX_YEAR = new Date().getFullYear();
const LEGACY_STORAGE_KEYS = {
    bookmarked: 'gateqa_bookmarks_v1'
};
const STORAGE_HEALTH_KEY = '__gate_qa_storage_health_check__';
const APTITUDE_UID_PREFIX = 'APT-';
const EMPTY_QUESTION_LIST = Object.freeze([]);

const isAptitudeQuestionId = (value = '') => String(value || '').startsWith(APTITUDE_UID_PREFIX);

const normalizeQuestionPool = (questions = []) => {
    const seen = new Set();
    const ordered = [];
    (Array.isArray(questions) ? questions : []).forEach((question) => {
        const uid = String(question?.question_uid || '').trim();
        if (!uid || seen.has(uid)) {
            return;
        }
        seen.add(uid);
        ordered.push(question);
    });
    return ordered;
};

const buildStructuredTagsFromManifest = (manifest = null, questionService = QuestionService) => {
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
                slug: questionService.normalizeSubjectSlug(subject?.slug || subject?.label || '') || 'unknown',
                label: String(subject?.label || questionService.getSubjectLabelBySlug(subject?.slug || '') || 'Unknown').trim(),
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

const mergeStructuredTags = (gateTags = {}, aptitudeTags = {}) => {
    const subjectsBySlug = new Map();
    const addSubject = (subject = {}) => {
        const slug = String(subject?.slug || '').trim();
        const label = String(subject?.label || '').trim();
        if (!slug || !label) {
            return;
        }
        const current = subjectsBySlug.get(slug);
        subjectsBySlug.set(slug, {
            slug,
            label: current?.label || label,
            count: Number(current?.count || 0) + Number(subject?.count || 0),
        });
    };

    (gateTags.subjects || []).forEach(addSubject);
    (aptitudeTags.subjects || []).forEach(addSubject);

    const subjects = Array.from(subjectsBySlug.values());
    const questionTypes = Array.from(new Set([
        ...(Array.isArray(gateTags.questionTypes) && gateTags.questionTypes.length > 0
            ? gateTags.questionTypes
            : DEFAULT_SELECTED_TYPES),
        ...(Array.isArray(aptitudeTags.questionTypes) ? aptitudeTags.questionTypes : []),
    ].map((type) => String(type || '').trim().toUpperCase()).filter(Boolean)));

    return {
        ...gateTags,
        subjects,
        topics: subjects.map((subject) => subject.slug),
        structuredSubtopics: {
            ...(gateTags.structuredSubtopics || {}),
            ...(aptitudeTags.structuredSubtopics || {}),
        },
        structuredTopics: {
            ...(gateTags.structuredTopics || {}),
            ...(aptitudeTags.structuredTopics || {}),
        },
        questionTypes,
        hideYearFilters: Boolean(gateTags.hideYearFilters),
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

const normalizeSelectedTypes = (rawTypes, {
    fallbackToDefault = false,
    allowedTypes = DEFAULT_SELECTED_TYPES
} = {}) => {
    const typeList = Array.isArray(allowedTypes) && allowedTypes.length > 0
        ? allowedTypes.map(type => String(type || '').trim().toUpperCase()).filter(Boolean)
        : [...DEFAULT_SELECTED_TYPES];

    if (!Array.isArray(rawTypes)) {
        return fallbackToDefault ? [...typeList] : [];
    }

    const normalized = rawTypes
        .map(type => String(type || '').trim().toUpperCase())
        .filter(type => typeList.includes(type));

    const orderedUnique = typeList.filter(type => normalized.includes(type));

    if (fallbackToDefault && orderedUnique.length === 0) {
        return [...typeList];
    }

    return orderedUnique;
};

const yearSetComparator = (a, b, questionService = QuestionService) => {
    const parsedA = questionService.parseYearSetKey(a);
    const parsedB = questionService.parseYearSetKey(b);
    if (!parsedA || !parsedB) return String(a).localeCompare(String(b));
    if (parsedA.year !== parsedB.year) {
        return parsedB.year - parsedA.year;
    }
    return (parsedB.set || 0) - (parsedA.set || 0);
};

const normalizeYearSetTokens = (rawTokens, questionService = QuestionService) => {
    const values = Array.isArray(rawTokens) ? rawTokens : [];
    const unique = new Set();

    values.forEach((rawToken) => {
        const token = String(rawToken || '').trim();
        if (!token) return;

        const parsedKey = questionService.parseYearSetKey(token);
        if (parsedKey) {
            unique.add(parsedKey.key);
            return;
        }

        const fromTag = questionService.extractYearSetFromTag(token);
        if (fromTag) {
            const key = questionService.buildYearSetKey(fromTag.year, fromTag.set);
            if (key) unique.add(key);
        }
    });

    return Array.from(unique).sort((a, b) => yearSetComparator(a, b, questionService));
};

const normalizeSubjectSlugs = (rawSubjects, questionService = QuestionService) => {
    const values = Array.isArray(rawSubjects) ? rawSubjects : [];
    const unique = new Set();

    values.forEach((rawSubject) => {
        const subjectSlug = questionService.normalizeSubjectSlug(rawSubject);
        if (subjectSlug && subjectSlug !== 'unknown') {
            unique.add(subjectSlug);
            return;
        }
        // Fallback: try AptitudeQuestionService for aptitude-specific subjects
        const aptitudeSlug = AptitudeQuestionService.normalizeSubjectSlug(rawSubject);
        if (aptitudeSlug) {
            unique.add(aptitudeSlug);
        }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const normalizeSubtopicSlugs = (rawSubtopics, questionService = QuestionService) => {
    const values = Array.isArray(rawSubtopics) ? rawSubtopics : [];
    const unique = new Set();

    values.forEach((rawSubtopic) => {
        const slug = questionService.slugifyToken(rawSubtopic);
        if (slug) {
            unique.add(slug);
        }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const buildSubtopicToSubjectSlugMap = (structuredSubtopics = {}, questionService = QuestionService) => {
    const map = new Map();

    Object.entries(structuredSubtopics || {}).forEach(([subjectSlug, entries]) => {
        (entries || []).forEach((entry) => {
            const slug = questionService.slugifyToken(entry?.slug || entry?.label || entry);
            if (slug) {
                map.set(slug, subjectSlug);
            }
        });
    });

    return map;
};

const reconcileSubjectAndSubtopicFilters = (
    baseFilters,
    incomingFilters,
    subtopicToSubjectSlug,
    questionService = QuestionService
) => {
    const merged = { ...baseFilters };
    const hasSelectedSubjects = Object.prototype.hasOwnProperty.call(incomingFilters, 'selectedSubjects');
    const hasSelectedSubtopics = Object.prototype.hasOwnProperty.call(incomingFilters, 'selectedSubtopics');

    if (hasSelectedSubjects) {
        merged.selectedSubjects = normalizeSubjectSlugs(incomingFilters.selectedSubjects, questionService);

        if (merged.selectedSubtopics.length > 0) {
            const activeSubjectSet = new Set(merged.selectedSubjects);
            merged.selectedSubtopics = normalizeSubtopicSlugs(merged.selectedSubtopics, questionService).filter((subtopicSlug) => {
                const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
                return !parentSlug || activeSubjectSet.has(parentSlug);
            });
        }
    }

    if (hasSelectedSubtopics) {
        merged.selectedSubtopics = normalizeSubtopicSlugs(incomingFilters.selectedSubtopics, questionService);

        const selectedSubjects = new Set(merged.selectedSubjects);
        merged.selectedSubtopics.forEach((subtopicSlug) => {
            const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
            if (parentSlug) {
                selectedSubjects.add(parentSlug);
            }
        });
        merged.selectedSubjects = normalizeSubjectSlugs(Array.from(selectedSubjects), questionService);
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

const normalizeProgressTargets = (rawTargets, answerService = AnswerService) => {
    const values = Array.isArray(rawTargets) ? rawTargets : [rawTargets];
    return normalizeStoredIds(
        values
            .map((target) => (typeof target === 'string'
                ? String(target || '').trim()
                : getQuestionTrackingId(target, answerService)))
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

const getQuestionTrackingId = (question = {}, answerService = AnswerService) => {
    if (!question || typeof question !== 'object') {
        return null;
    }

    const candidate = answerService.getStorageKeyForQuestion(question);
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
    questionDataRevision = 0,
    questionService = QuestionService,
    answerService = AnswerService,
    storageKeys = STORAGE_KEYS,
    legacyStorageKeys = LEGACY_STORAGE_KEYS,
    defaultSelectedTypes = DEFAULT_SELECTED_TYPES,
    progressScope = 'gate',
    progressExportPrefix = 'gateqa-progress',
    includeExtendedProgress = true,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [aptitudeEnabled, setAptitudeEnabled] = useAptitudeEnabled();
    const canMergeAptitude = progressScope === 'gate' && questionService === QuestionService;
    const shouldMergeAptitude = canMergeAptitude && aptitudeEnabled;

    useEffect(() => {
        if (location.pathname.includes('/question/APT-') && !aptitudeEnabled) {
            setAptitudeEnabled(true);
        }
    }, [location.pathname, aptitudeEnabled, setAptitudeEnabled]);

    const [structuredTags, setStructuredTags] = useState(() => buildStructuredTagsFromManifest(initialManifest, questionService));
    const lastHydratedSearchRef = useRef(null);

    const [filters, setFilters] = useState(() => {
        const manifestStructuredTags = buildStructuredTagsFromManifest(initialManifest, questionService);
        return {
        selectedYearSets: [],
        yearRange: [manifestStructuredTags.minYear, manifestStructuredTags.maxYear],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedTypes: [...defaultSelectedTypes],
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
    const [aptitudeSolvedQuestionIds, setAptitudeSolvedQuestionIds] = useState([]);
    const [aptitudeBookmarkedQuestionIds, setAptitudeBookmarkedQuestionIds] = useState([]);
    const [aptitudeQuestions, setAptitudeQuestions] = useState(() => (
        AptitudeQuestionService.loaded ? normalizeQuestionPool(AptitudeQuestionService.questions) : []
    ));
    const [aptitudeLoading, setAptitudeLoading] = useState(false);
    const [aptitudeError, setAptitudeError] = useState('');
    const [isProgressStorageAvailable, setIsProgressStorageAvailable] = useState(true);
    const [hasLoadedProgressState, setHasLoadedProgressState] = useState(false);
    const urlHydrationSubtopicToSubjectSlug = useMemo(
        () => buildSubtopicToSubjectSlugMap(structuredTags.structuredSubtopics, questionService),
        [structuredTags.structuredSubtopics, questionService]
    );
    const isPracticePath = location.pathname === PRACTICE_ROUTE
        || location.pathname.startsWith(`${PRACTICE_ROUTE}/question/`);

    useEffect(() => {
        if (!shouldMergeAptitude) {
            return undefined;
        }

        let cancelled = false;

        const loadAptitudeQuestions = async () => {
            if (AptitudeQuestionService.loaded) {
                setAptitudeQuestions(normalizeQuestionPool(AptitudeQuestionService.questions));
                setAptitudeError('');
                setAptitudeLoading(false);
                return;
            }

            setAptitudeLoading(true);
            setAptitudeError('');
            try {
                await AptitudeQuestionService.init();
                if (cancelled) {
                    return;
                }
                setAptitudeQuestions(normalizeQuestionPool(AptitudeQuestionService.questions));
                setAptitudeError('');
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setAptitudeQuestions([]);
                setAptitudeError(error.message || 'Unable to load aptitude questions.');
            } finally {
                if (!cancelled) {
                    setAptitudeLoading(false);
                }
            }
        };

        void loadAptitudeQuestions();

        return () => {
            cancelled = true;
        };
    }, [shouldMergeAptitude]);

    const baseQuestions = questionService.questions;
    const activeAptitudeQuestions = shouldMergeAptitude ? aptitudeQuestions : EMPTY_QUESTION_LIST;
    const allQuestions = useMemo(() => {
        if (!baseQuestions.length) {
            return [];
        }
        return normalizeQuestionPool([...baseQuestions, ...activeAptitudeQuestions]);
    }, [activeAptitudeQuestions, baseQuestions, questionDataRevision]);

    const questionByUidMap = useMemo(() => {
        const map = new Map();
        allQuestions.forEach((question) => {
            const uid = String(question?.question_uid || '').trim();
            if (uid) {
                map.set(uid, question);
            }
        });
        return map;
    }, [allQuestions]);

    const questionFilterMetaByUid = useMemo(() => {
        const map = new Map();

        allQuestions.forEach((question) => {
            const uid = String(question?.question_uid || '').trim();
            if (!uid) {
                return;
            }

            const answer = answerService.getAnswerForQuestion(question);
            const resolvedType = answer
                ? questionService.normalizeTypeToken(answer.type)
                : questionService.normalizeTypeToken(question.type);
            const subtopicSlugs = Array.isArray(question.subtopics)
                ? question.subtopics
                    .map(subtopic => questionService.slugifyToken(subtopic?.slug || subtopic?.label || subtopic))
                    .filter(Boolean)
                : [];

            map.set(uid, {
                questionId: getQuestionTrackingId(question, answerService),
                resolvedType,
                resolvedTypeUpper: String(resolvedType || '').toUpperCase(),
                subjectSlug: question.subjectSlug || 'unknown',
                subtopicSlugs,
                yearSetKey: question.exam?.yearSetKey || null,
                year: Number.isFinite(question.exam?.year) ? question.exam.year : 0,
                searchText: String(question.searchText || '').toLowerCase(),
            });
        });

        return map;
    }, [allQuestions, answerService, questionService]);

    useEffect(() => {
        if (!initialManifest || questionService.questions.length > 0) {
            return;
        }

        const manifestStructuredTags = buildStructuredTagsFromManifest(initialManifest, questionService);
        setStructuredTags(manifestStructuredTags);
        setTotalQuestions(Number(initialManifest.questionCount || 0));

        const { minYear, maxYear } = manifestStructuredTags;
        setFilters(prev => ({
            ...prev,
            yearRange: hasCustomYearRange(prev.yearRange, structuredTags.minYear, structuredTags.maxYear)
                ? prev.yearRange
                : [minYear, maxYear]
        }));
    }, [initialManifest, questionService, structuredTags.minYear, structuredTags.maxYear]);

    useEffect(() => {
        if (questionService.questions.length > 0) {
            const gateTags = questionService.getStructuredTags();
            const tags = activeAptitudeQuestions.length > 0
                ? mergeStructuredTags(gateTags, AptitudeQuestionService.getStructuredTags())
                : gateTags;
            setStructuredTags(tags);
            setTotalQuestions(allQuestions.length);

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
    }, [
        activeAptitudeQuestions.length,
        allQuestions.length,
        questionDataRevision,
        questionService,
    ]);

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
            selectedYearSets: normalizeYearSetTokens(rawYearTokens, questionService),
            yearRange: params.get('range')?.split('-').map(Number) || null,
            selectedSubjects: normalizeSubjectSlugs(rawSubjectTokens, questionService),
            selectedSubtopics: normalizeSubtopicSlugs(rawSubtopicTokens, questionService),
            selectedTypes: urlTypes === null
                ? [...defaultSelectedTypes]
                : normalizeSelectedTypes(urlTypes.split(',').filter(Boolean), { allowedTypes: defaultSelectedTypes }),
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
                urlHydrationSubtopicToSubjectSlug,
                questionService
            );

            if (urlFilters.yearRange && urlFilters.yearRange.length === 2 && !isNaN(urlFilters.yearRange[0])) {
                merged.yearRange = urlFilters.yearRange;
            }
            return merged;
        });
    }, [defaultSelectedTypes, isInitialized, isPracticePath, location.search, questionService, urlHydrationSubtopicToSubjectSlug]);

    useEffect(() => {
        if (!isInitialized || !isPracticePath) return;

        const params = new URLSearchParams(location.search);
        FILTER_QUERY_KEYS.forEach((key) => {
            params.delete(key);
        });
        const selectedYearSets = normalizeYearSetTokens(filters.selectedYearSets, questionService);
        const selectedSubjects = normalizeSubjectSlugs(filters.selectedSubjects, questionService);
        const selectedSubtopics = normalizeSubtopicSlugs(filters.selectedSubtopics, questionService);
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

        const selectedTypes = normalizeSelectedTypes(filters.selectedTypes, { allowedTypes: defaultSelectedTypes });
        if (selectedTypes.length > 0 && selectedTypes.length < defaultSelectedTypes.length) {
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
        defaultSelectedTypes,
        questionService,
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

        const storedSolved = normalizeStoredIds(readJsonFromStorage(storageKeys.solved, []));
        const storedBookmarkedRaw = readJsonFromStorage(storageKeys.bookmarked, null);
        const storedBookmarked = storedBookmarkedRaw === null
            ? normalizeStoredIds(legacyStorageKeys.bookmarked ? readJsonFromStorage(legacyStorageKeys.bookmarked, []) : [])
            : normalizeStoredIds(storedBookmarkedRaw);
        const storedAptitudeSolved = canMergeAptitude
            ? normalizeStoredIds(readJsonFromStorage(APTITUDE_USER_STATE_STORAGE_KEYS.solved, []))
            : [];
        const storedAptitudeBookmarked = canMergeAptitude
            ? normalizeStoredIds(readJsonFromStorage(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked, []))
            : [];

        setSolvedQuestionIds(storedSolved);
        setBookmarkedQuestionIds(storedBookmarked);
        setAptitudeSolvedQuestionIds(storedAptitudeSolved);
        setAptitudeBookmarkedQuestionIds(storedAptitudeBookmarked);

        if (storedBookmarkedRaw === null) {
            try {
                window.localStorage.setItem(storageKeys.bookmarked, JSON.stringify(storedBookmarked));
            } catch (error) {
                setIsProgressStorageAvailable(false);
            }
        }

        setHasLoadedProgressState(true);
    }, [canMergeAptitude, legacyStorageKeys.bookmarked, storageKeys.bookmarked, storageKeys.solved]);

    useEffect(() => {
        if (!hasLoadedProgressState || !isProgressStorageAvailable || typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(storageKeys.solved, JSON.stringify(solvedQuestionIds));
            window.localStorage.setItem(storageKeys.bookmarked, JSON.stringify(bookmarkedQuestionIds));
            window.localStorage.setItem(storageKeys.metadata, JSON.stringify({
                lastUpdated: new Date().toISOString(),
                solvedCount: solvedQuestionIds.length,
                bookmarkedCount: bookmarkedQuestionIds.length
            }));
            if (canMergeAptitude) {
                window.localStorage.setItem(APTITUDE_USER_STATE_STORAGE_KEYS.solved, JSON.stringify(aptitudeSolvedQuestionIds));
                window.localStorage.setItem(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked, JSON.stringify(aptitudeBookmarkedQuestionIds));
                window.localStorage.setItem(APTITUDE_USER_STATE_STORAGE_KEYS.metadata, JSON.stringify({
                    lastUpdated: new Date().toISOString(),
                    solvedCount: aptitudeSolvedQuestionIds.length,
                    bookmarkedCount: aptitudeBookmarkedQuestionIds.length
                }));
            }
        } catch (error) {
            setIsProgressStorageAvailable(false);
        }
    }, [
        aptitudeBookmarkedQuestionIds,
        aptitudeSolvedQuestionIds,
        bookmarkedQuestionIds,
        canMergeAptitude,
        hasLoadedProgressState,
        isProgressStorageAvailable,
        solvedQuestionIds,
        storageKeys.bookmarked,
        storageKeys.metadata,
        storageKeys.solved
    ]);

    const gateValidQuestionIdSet = useMemo(() => {
        if (!isInitialized || !questionService.questions.length) {
            return new Set();
        }

        return new Set(
            questionService.questions
                .map(question => getQuestionTrackingId(question, answerService))
                .filter(Boolean)
        );
    }, [answerService, isInitialized, questionDataRevision, questionService, totalQuestions]);

    const aptitudeValidQuestionIdSet = useMemo(() => {
        if (!canMergeAptitude || aptitudeQuestions.length === 0) {
            return new Set();
        }

        return new Set(
            aptitudeQuestions
                .map(question => getQuestionTrackingId(question, answerService))
                .filter(Boolean)
        );
    }, [answerService, aptitudeQuestions, canMergeAptitude]);

    const validQuestionIdSet = useMemo(() => {
        if (!isInitialized || !allQuestions.length) {
            return new Set();
        }

        return new Set(
            allQuestions
                .map(question => getQuestionTrackingId(question, answerService))
                .filter(Boolean)
        );
    }, [allQuestions, answerService, isInitialized]);

    useEffect(() => {
        if (!isInitialized || gateValidQuestionIdSet.size === 0) {
            return;
        }

        setSolvedQuestionIds((prev) => {
            const next = prev.filter(id => gateValidQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });

        setBookmarkedQuestionIds((prev) => {
            const next = prev.filter(id => gateValidQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });
    }, [gateValidQuestionIdSet, isInitialized]);

    useEffect(() => {
        if (!canMergeAptitude || aptitudeValidQuestionIdSet.size === 0) {
            return;
        }

        setAptitudeSolvedQuestionIds((prev) => {
            const next = prev.filter(id => aptitudeValidQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });

        setAptitudeBookmarkedQuestionIds((prev) => {
            const next = prev.filter(id => aptitudeValidQuestionIdSet.has(id));
            return next.length === prev.length ? prev : next;
        });
    }, [aptitudeValidQuestionIdSet, canMergeAptitude]);

    const solvedQuestionSet = useMemo(
        () => new Set([...solvedQuestionIds, ...aptitudeSolvedQuestionIds]),
        [aptitudeSolvedQuestionIds, solvedQuestionIds]
    );
    const bookmarkedQuestionSet = useMemo(
        () => new Set([...bookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds]),
        [aptitudeBookmarkedQuestionIds, bookmarkedQuestionIds]
    );

    // ── Reverse map: subtopicSlug → parent subjectSlug (for scoped filtering) ──
    const subtopicToSubjectSlug = useMemo(
        () => buildSubtopicToSubjectSlugMap(structuredTags.structuredSubtopics, questionService),
        [questionService, structuredTags.structuredSubtopics]
    );
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        const availableSubjects = new Set((structuredTags.subjects || []).map((subject) => subject.slug));
        const availableSubtopics = new Set();
        Object.values(structuredTags.structuredSubtopics || {}).forEach((entries) => {
            (entries || []).forEach((entry) => {
                const slug = questionService.slugifyToken(entry?.slug || entry?.label || entry);
                if (slug) {
                    availableSubtopics.add(slug);
                }
            });
        });

        setFilters((prev) => {
            const selectedSubjects = prev.selectedSubjects.filter((slug) => availableSubjects.has(slug));
            const selectedSubtopics = prev.selectedSubtopics.filter((slug) => availableSubtopics.has(slug));
            if (
                selectedSubjects.length === prev.selectedSubjects.length
                && selectedSubtopics.length === prev.selectedSubtopics.length
            ) {
                return prev;
            }
            return {
                ...prev,
                selectedSubjects,
                selectedSubtopics,
            };
        });
    }, [isInitialized, questionService, structuredTags.structuredSubtopics, structuredTags.subjects]);
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
        if (!allQuestions.length) return [];

        const {
            selectedYearSets,
            selectedSubjects,
            selectedSubtopics,
            yearRange,
            hideSolved,
            showOnlySolved,
            showOnlyBookmarked
        } = filters;

        const selectedTypes = normalizeSelectedTypes(filters.selectedTypes, { allowedTypes: defaultSelectedTypes });
        const selectedTypeSet = new Set(selectedTypes.map(type => type.toUpperCase()));
        const selectedYearSet = new Set(selectedYearSets);
        const selectedSubjectSet = new Set(selectedSubjects);
        const isTypeConstrained = selectedTypes.length < defaultSelectedTypes.length;
        const isRangeConstrained = yearRange
            && yearRange.length === 2
            && (yearRange[0] > structuredTags.minYear || yearRange[1] < structuredTags.maxYear);

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

        return allQuestions.filter(q => {
            const meta = questionFilterMetaByUid.get(q.question_uid);
            const questionId = meta?.questionId || getQuestionTrackingId(q, answerService);
            const isSolved = questionId ? solvedQuestionSet.has(questionId) : false;
            const isBookmarked = questionId ? bookmarkedQuestionSet.has(questionId) : false;
            const resolvedTypeUpper = meta?.resolvedTypeUpper || questionService.normalizeTypeToken(q.type).toUpperCase();

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
            const qYearSetKey = meta?.yearSetKey || null;
            const qYearNum = meta?.year || 0;

            if (selectedYearSets.length > 0) {
                yearMatch = qYearSetKey ? selectedYearSet.has(qYearSetKey) : false;
            }

            let rangeMatch = true;
            if (isRangeConstrained) {
                rangeMatch = qYearNum > 0 && qYearNum >= yearRange[0] && qYearNum <= yearRange[1];
            }

            const qSubjectSlug = meta?.subjectSlug || q.subjectSlug || 'unknown';

            let topicMatch = true;
            if (selectedSubjects.length > 0) {
                topicMatch = selectedSubjectSet.has(qSubjectSlug);
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
                    subtopicMatch = (meta?.subtopicSlugs || []).some(slug => requiredSubtopics.has(slug));
                } else {
                    // Question belongs to a subject with no subtopic filter —
                    // let it pass (subtopic filter doesn't constrain this subject).
                    subtopicMatch = true;
                }
            }

            let typeMatch = true;
            if (isTypeConstrained) {
                typeMatch = selectedTypeSet.has(resolvedTypeUpper);
            }

            let searchMatch = true;
            if (searchTokens.length > 0) {
                const searchText = meta?.searchText || '';
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
        questionFilterMetaByUid,
        answerService,
        allQuestions,
        defaultSelectedTypes,
        questionService,
        searchTokens
    ]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            let merged = { ...prev, ...newFilters };
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedTypes')) {
                merged.selectedTypes = normalizeSelectedTypes(
                    newFilters.selectedTypes,
                    { allowedTypes: defaultSelectedTypes }
                );
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'selectedYearSets')) {
                merged.selectedYearSets = normalizeYearSetTokens(newFilters.selectedYearSets, questionService);
            }
            if (Object.prototype.hasOwnProperty.call(newFilters, 'searchQuery')) {
                merged.searchQuery = normalizeSearchQuery(newFilters.searchQuery);
            }
            return reconcileSubjectAndSubtopicFilters(merged, newFilters, subtopicToSubjectSlug, questionService);
        });
    }, [defaultSelectedTypes, questionService, subtopicToSubjectSlug]);

    const toggleSolved = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);

        if (!questionId) {
            return;
        }

        const setTargetSolvedQuestionIds = canMergeAptitude && isAptitudeQuestionId(questionId)
            ? setAptitudeSolvedQuestionIds
            : setSolvedQuestionIds;

        setTargetSolvedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
    }, [answerService, canMergeAptitude]);

    const toggleBookmark = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);

        if (!questionId) {
            return;
        }

        const setTargetBookmarkedQuestionIds = canMergeAptitude && isAptitudeQuestionId(questionId)
            ? setAptitudeBookmarkedQuestionIds
            : setBookmarkedQuestionIds;

        setTargetBookmarkedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
    }, [answerService, canMergeAptitude]);

    const markQuestionsSolved = useCallback((questionOrIds) => {
        const questionIds = normalizeProgressTargets(questionOrIds, answerService);
        if (questionIds.length === 0) {
            return;
        }

        const gateQuestionIds = [];
        const aptitudeQuestionIds = [];
        questionIds.forEach((questionId) => {
            if (canMergeAptitude && isAptitudeQuestionId(questionId)) {
                aptitudeQuestionIds.push(questionId);
                return;
            }
            gateQuestionIds.push(questionId);
        });

        if (gateQuestionIds.length > 0) {
            setSolvedQuestionIds((prev) => {
                const nextSet = new Set(prev);
                gateQuestionIds.forEach((questionId) => {
                    nextSet.add(questionId);
                });
                const next = Array.from(nextSet);
                return next.length === prev.length ? prev : next;
            });
        }

        if (aptitudeQuestionIds.length > 0) {
            setAptitudeSolvedQuestionIds((prev) => {
                const nextSet = new Set(prev);
                aptitudeQuestionIds.forEach((questionId) => {
                    nextSet.add(questionId);
                });
                const next = Array.from(nextSet);
                return next.length === prev.length ? prev : next;
            });
        }
    }, [answerService, canMergeAptitude]);

    const refreshProgressState = useCallback(() => {
        if (typeof window === 'undefined' || !canUseBrowserStorage()) {
            return;
        }
        const storedSolved = normalizeStoredIds(readJsonFromStorage(storageKeys.solved, []));
        const storedBookmarked = normalizeStoredIds(readJsonFromStorage(storageKeys.bookmarked, []));
        setSolvedQuestionIds(storedSolved);
        setBookmarkedQuestionIds(storedBookmarked);
        if (canMergeAptitude) {
            setAptitudeSolvedQuestionIds(normalizeStoredIds(readJsonFromStorage(APTITUDE_USER_STATE_STORAGE_KEYS.solved, [])));
            setAptitudeBookmarkedQuestionIds(normalizeStoredIds(readJsonFromStorage(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked, [])));
        }
    }, [canMergeAptitude, storageKeys.bookmarked, storageKeys.solved]);

    const getQuestionProgressId = useCallback((question = {}) => {
        return getQuestionTrackingId(question, answerService);
    }, [answerService]);

    const isQuestionSolved = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);
        return questionId ? solvedQuestionSet.has(questionId) : false;
    }, [answerService, solvedQuestionSet]);

    const isQuestionBookmarked = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);
        return questionId ? bookmarkedQuestionSet.has(questionId) : false;
    }, [answerService, bookmarkedQuestionSet]);

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
        const activeSolvedIds = [...solvedQuestionIds, ...aptitudeSolvedQuestionIds];
        if (validQuestionIdSet.size === 0) {
            return activeSolvedIds.length;
        }
        return activeSolvedIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [aptitudeSolvedQuestionIds, solvedQuestionIds, validQuestionIdSet]);

    const bookmarkedCount = useMemo(() => {
        const activeBookmarkedIds = [...bookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds];
        if (validQuestionIdSet.size === 0) {
            return activeBookmarkedIds.length;
        }
        return activeBookmarkedIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [aptitudeBookmarkedQuestionIds, bookmarkedQuestionIds, validQuestionIdSet]);

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
            selectedTypes: [...defaultSelectedTypes],
            hideSolved: false,
            showOnlySolved: false,
            showOnlyBookmarked: false,
            searchQuery: ''
        });
    }, [defaultSelectedTypes, structuredTags]);

    const getQuestionById = useCallback((id) => {
        if (!id || typeof id !== 'string') return null;
        const trimmed = id.trim();
        if (!trimmed) return null;
        return questionByUidMap.get(trimmed) || null;
    }, [questionByUidMap]);

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
        activeSolvedQuestionIds: [...solvedQuestionIds, ...aptitudeSolvedQuestionIds],
        activeBookmarkedQuestionIds: [...bookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds],
        solvedCount,
        bookmarkedCount,
        progressPercentage,
        isProgressStorageAvailable,
        progressStorageKeys: storageKeys,
        aptitudeProgressStorageKeys: APTITUDE_USER_STATE_STORAGE_KEYS,
        aptitudeEnabled: shouldMergeAptitude,
        aptitudeLoading,
        aptitudeError,
        progressScope,
        progressExportPrefix,
        includeExtendedProgress,
        questionService
    }), [
        filters, filteredQuestions, allQuestions, structuredTags,
        totalQuestions, isInitialized, solvedQuestionIds,
        aptitudeSolvedQuestionIds, bookmarkedQuestionIds,
        aptitudeBookmarkedQuestionIds, solvedCount, bookmarkedCount,
        progressPercentage, isProgressStorageAvailable,
        storageKeys, shouldMergeAptitude, aptitudeLoading, aptitudeError,
        progressScope, progressExportPrefix,
        includeExtendedProgress, questionService
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
