// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionService } from '../services/QuestionService';
import { DaQuestionService } from '../services/DaQuestionService';
import { AptitudeQuestionService } from '../services/AptitudeQuestionService';
import { AnswerService } from '../services/AnswerService';
import { FILTER_QUERY_KEYS, PRACTICE_ROUTE } from '../utils/routes';
import { useAptitudeEnabled } from '../utils/aptitudePreference';
import { APTITUDE_USER_STATE_STORAGE_KEYS } from '../utils/localStorageState';
import { enqueueChange } from '../utils/syncQueue';
import { extractQuestionIdArray } from '../utils/cloudSyncManager';
import {
    buildTrackYearSetKey,
    getQuestionTrack,
    getQuestionYearSetIdentity,
    isDaQuestion as isDaQuestionByMetadata,
    parseTrackYearSetKey,
    toLegacyYearSetKey,
} from '../utils/examTrack';

const FilterStateContext = createContext();
const FilterActionsContext = createContext();

const DEFAULT_SELECTED_TYPES = ['MCQ', 'MSQ', 'NAT'];
const STORAGE_KEYS = {
    solved: 'gate_qa_solved_questions',
    bookmarked: 'gate_qa_bookmarked_questions',
    metadata: 'gate_qa_progress_metadata',
    progress: 'gateqa_progress_v1'
};
const DA_STORAGE_KEYS = {
    solved: 'gate_qa_da_solved_questions',
    bookmarked: 'gate_qa_da_bookmarked_questions',
    progress: 'gateqa_da_progress_v1',
};
const DEFAULT_MIN_YEAR = 2000;
const DEFAULT_MAX_YEAR = new Date().getFullYear();
const LEGACY_STORAGE_KEYS = {
    bookmarked: 'gateqa_bookmarks_v1'
};
const STORAGE_HEALTH_KEY = '__gate_qa_storage_health_check__';
const APTITUDE_UID_PREFIX = 'APT-';
const APTITUDE_SUBJECT_SLUGS = new Set(['english', 'quant', 'mathematics', 'reasoning']);
const EMPTY_QUESTION_LIST = Object.freeze([]);

const isAptitudeQuestionId = (value = '') => String(value || '').startsWith(APTITUDE_UID_PREFIX);
const isDaQuestion = (question = {}) => isDaQuestionByMetadata(question);

const getDaFilterSubjectKey = (question = {}) => {
    const rawSlug = question?.subjectSlug || question?.subject || question?.tags?.[1] || '';
    const normalizedSlug = DaQuestionService.normalizeSubjectSlug(rawSlug);
    return normalizedSlug ? `da:${normalizedSlug}` : 'da:unknown';
};

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
            .map((entry) => {
                const legacyKey = String(entry?.key || '').trim();
                const identity = buildTrackYearSetKey('cse', entry?.year, entry?.set);
                return {
                key: identity || legacyKey,
                legacyKey,
                yearSetIdentity: identity || legacyKey,
                year: Number(entry?.year),
                set: Number.isFinite(Number(entry?.set)) && Number(entry?.set) > 0
                    ? Number(entry?.set)
                    : null,
                label: String(entry?.label || '').trim(),
                count: Number(entry?.count || 0),
                track: 'cse',
            }; })
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

    const yearSets = [
        ...(Array.isArray(gateTags.yearSets) ? gateTags.yearSets : []),
        ...(Array.isArray(aptitudeTags.yearSets) ? aptitudeTags.yearSets : []),
    ].map((entry) => {
        const track = String(entry?.track || '').toLowerCase() === 'da' ? 'da' : 'cse';
        const identity = buildTrackYearSetKey(track, entry?.year, entry?.set) || String(entry?.key || '').trim();
        return {
            ...entry,
            key: identity,
            yearSetIdentity: identity,
            track,
        };
    }).filter((entry) => entry.key).sort((left, right) => {
        const parsedLeft = parseTrackYearSetKey(left.key);
        const parsedRight = parseTrackYearSetKey(right.key);
        const yearDifference = Number(parsedRight?.year || 0) - Number(parsedLeft?.year || 0);
        if (yearDifference !== 0) return yearDifference;

        const setDifference = Number(parsedRight?.set || 0) - Number(parsedLeft?.set || 0);
        if (setDifference !== 0) return setDifference;

        return Number(parsedLeft?.track === 'da') - Number(parsedRight?.track === 'da');
    });

    const candidateMinYears = [gateTags.minYear, aptitudeTags.minYear].filter((y) => Number.isFinite(y) && Number(y) > 0);
    const candidateMaxYears = [gateTags.maxYear, aptitudeTags.maxYear].filter((y) => Number.isFinite(y) && Number(y) > 0);
    const minYear = candidateMinYears.length > 0 ? Math.min(...candidateMinYears) : 0;
    const maxYear = candidateMaxYears.length > 0 ? Math.max(...candidateMaxYears) : 0;
    const hideYearFilters = yearSets.length === 0 || (
        gateTags.hideYearFilters !== undefined && aptitudeTags.hideYearFilters !== undefined
            ? Boolean(gateTags.hideYearFilters && aptitudeTags.hideYearFilters)
            : Boolean(gateTags.hideYearFilters || aptitudeTags.hideYearFilters)
    );

    return {
        ...gateTags,
        ...aptitudeTags,
        minYear,
        maxYear,
        yearSets,
        years: Array.from(new Set(yearSets.map((entry) => entry.key).filter(Boolean))),
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
        hideYearFilters,
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
    const parsedA = parseTrackYearSetKey(a);
    const parsedB = parseTrackYearSetKey(b);
    if (!parsedA || !parsedB) return String(a).localeCompare(String(b));
    if (parsedA.year !== parsedB.year) {
        return parsedB.year - parsedA.year;
    }
    const setDifference = (parsedB.set || 0) - (parsedA.set || 0);
    if (setDifference !== 0) return setDifference;
    return Number(parsedA.track === 'da') - Number(parsedB.track === 'da');
};

const normalizeYearSetTokens = (rawTokens, questionService = QuestionService) => {
    const values = Array.isArray(rawTokens) ? rawTokens : [];
    const unique = new Set();

    values.forEach((rawToken) => {
        const token = String(rawToken || '').trim();
        if (!token) return;

        const parsedKey = parseTrackYearSetKey(token);
        if (parsedKey) {
            unique.add(parsedKey.key);
            return;
        }

        const fromTag = questionService.extractYearSetFromTag(token);
        if (fromTag) {
            const track = /^gateda-/i.test(token) ? 'da' : 'cse';
            const key = buildTrackYearSetKey(track, fromTag.year, fromTag.set);
            if (key) unique.add(key);
        }
    });

    return Array.from(unique).sort((a, b) => yearSetComparator(a, b, questionService));
};

const normalizeSubjectSlugs = (rawSubjects, questionService = QuestionService) => {
    const values = Array.isArray(rawSubjects) ? rawSubjects : [];
    const unique = new Set();

    values.forEach((rawSubject) => {
        const token = String(rawSubject || '').trim();
        if (token.toLowerCase().startsWith('da:')) {
            const daSlug = DaQuestionService.normalizeSubjectSlug(token.slice(3));
            if (daSlug) {
                unique.add(`da:${daSlug}`);
            }
            return;
        }

        const subjectSlug = questionService.normalizeSubjectSlug(token);
        if (subjectSlug && subjectSlug !== 'unknown') {
            unique.add(subjectSlug);
            return;
        }
        // Fallback: try AptitudeQuestionService for aptitude-specific subjects
        const aptitudeSlug = AptitudeQuestionService.normalizeSubjectSlug(rawSubject);
        if (aptitudeSlug) {
            unique.add(aptitudeSlug);
            return;
        }
        const daSlug = DaQuestionService.normalizeSubjectSlug(rawSubject);
        if (daSlug) {
            unique.add(`da:${daSlug}`);
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
            if (activeSubjectSet.size === 0) {
                merged.selectedSubtopics = [];
            } else {
                merged.selectedSubtopics = normalizeSubtopicSlugs(merged.selectedSubtopics, questionService).filter((subtopicSlug) => {
                    const parentSlug = subtopicToSubjectSlug.get(subtopicSlug);
                    return Boolean(parentSlug && activeSubjectSet.has(parentSlug));
                });
            }
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

export const normalizeStoredIds = (rawIds) => extractQuestionIdArray(rawIds);

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
    initialIncludeCse = true,
    initialIncludeDa = false,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [aptitudeEnabled, setAptitudeEnabled] = useAptitudeEnabled();
    const canMergeAptitude = progressScope === 'gate' && questionService === QuestionService;
    const shouldMergeAptitude = canMergeAptitude && aptitudeEnabled;

    useEffect(() => {
        if (location.pathname.includes('/question/APT-')) {
            if (!aptitudeEnabled) {
                setAptitudeEnabled(true);
            } else {
                try {
                    if (window.localStorage.getItem('gateqa-aptitude-enabled') !== 'true') {
                        window.localStorage.setItem('gateqa-aptitude-enabled', 'true');
                    }
                } catch (e) {}
            }
        }
    }, [location.pathname, aptitudeEnabled, setAptitudeEnabled]);

    const [structuredTags, setStructuredTags] = useState(() => buildStructuredTagsFromManifest(initialManifest, questionService));
    const previousStructuredTagsRef = useRef(structuredTags);
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
    const [daSolvedQuestionIds, setDaSolvedQuestionIds] = useState([]);
    const [daBookmarkedQuestionIds, setDaBookmarkedQuestionIds] = useState([]);
    const [includeCse, setIncludeCseState] = useState(() => (
        initialIncludeCse !== undefined
            ? Boolean(initialIncludeCse)
            : (typeof window !== 'undefined' && window.localStorage.getItem('gateqa_include_cse') !== null
                ? window.localStorage.getItem('gateqa_include_cse') === 'true'
                : true)
    ));
    const [includeDa, setIncludeDaState] = useState(() => (
        initialIncludeDa || (typeof window !== 'undefined' && window.localStorage.getItem('gateqa_include_da') === 'true')
    ));
    const [daQuestions, setDaQuestions] = useState(() => (
        DaQuestionService.loaded ? normalizeQuestionPool(DaQuestionService.questions) : []
    ));
    const [daLoading, setDaLoading] = useState(false);
    const [daError, setDaError] = useState('');
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try { window.localStorage.setItem('gateqa_include_cse', includeCse ? 'true' : 'false'); } catch (e) {}
        }
    }, [includeCse]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try { window.localStorage.setItem('gateqa_include_da', includeDa ? 'true' : 'false'); } catch (e) {}
        }
        if (!includeDa) return undefined;

        let cancelled = false;
        const loadDaQuestions = async () => {
            if (DaQuestionService.loaded) {
                setDaQuestions(normalizeQuestionPool(DaQuestionService.questions));
                return;
            }
            setDaLoading(true);
            setDaError('');
            try {
                await DaQuestionService.init();
                if (!cancelled) setDaQuestions(normalizeQuestionPool(DaQuestionService.questions));
            } catch (error) {
                if (!cancelled) {
                    setDaQuestions([]);
                    setDaError(error.message || 'Unable to load GATE DA questions.');
                }
            } finally {
                if (!cancelled) setDaLoading(false);
            }
        };
        void loadDaQuestions();
        return () => { cancelled = true; };
    }, [includeDa]);

    const baseQuestions = questionService.questions;
    const activeCseQuestions = includeCse ? baseQuestions : EMPTY_QUESTION_LIST;
    const activeAptitudeQuestions = shouldMergeAptitude ? aptitudeQuestions : EMPTY_QUESTION_LIST;
    const activeDaQuestions = includeDa ? daQuestions : EMPTY_QUESTION_LIST;
    const allQuestions = useMemo(() => {
        if (!activeCseQuestions.length && !activeDaQuestions.length && !activeAptitudeQuestions.length) {
            return [];
        }
        return normalizeQuestionPool([...activeCseQuestions, ...activeDaQuestions, ...activeAptitudeQuestions]);
    }, [activeAptitudeQuestions, activeCseQuestions, activeDaQuestions, questionDataRevision]);

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
                track: getQuestionTrack(question),
                resolvedType,
                resolvedTypeUpper: String(resolvedType || '').toUpperCase(),
                subjectSlug: isDaQuestion(question)
                    ? getDaFilterSubjectKey(question)
                    : question.subjectSlug || 'unknown',
                subtopicSlugs,
                subtopicSlugSet: new Set(subtopicSlugs),
                yearSetKey: question.exam?.yearSetKey || null,
                yearSetIdentity: getQuestionYearSetIdentity(question),
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
        if (activeCseQuestions.length > 0 || activeDaQuestions.length > 0 || activeAptitudeQuestions.length > 0) {
            const gateTags = activeCseQuestions.length > 0 ? questionService.getStructuredTags() : {};
            const daTags = activeDaQuestions.length > 0 ? DaQuestionService.getStructuredTags() : {};
            const aptitudeTags = activeAptitudeQuestions.length > 0 ? AptitudeQuestionService.getStructuredTags() : {};
            const tags = mergeStructuredTags(mergeStructuredTags(gateTags, daTags), aptitudeTags);
            setStructuredTags(tags);
            setTotalQuestions(allQuestions.length);

            const { minYear, maxYear } = tags;
            const prevTags = previousStructuredTagsRef.current;
            setFilters(prev => {
                const prevMin = Number(prevTags?.minYear || 0);
                const prevMax = Number(prevTags?.maxYear || 0);
                const wasAtFullSpan = (
                    Array.isArray(prev.yearRange)
                    && prev.yearRange.length === 2
                    && prevMin > 0
                    && prevMax > 0
                    && Number(prev.yearRange[0]) === prevMin
                    && Number(prev.yearRange[1]) === prevMax
                );

                const isOutOfRange = (
                    !Array.isArray(prev.yearRange)
                    || prev.yearRange.length !== 2
                    || (minYear > 0 && prev.yearRange[0] < minYear)
                    || (maxYear > 0 && prev.yearRange[1] > maxYear)
                    || prev.yearRange[0] > prev.yearRange[1]
                );

                return {
                    ...prev,
                    yearRange: (wasAtFullSpan || isOutOfRange || !hasCustomYearRange(prev.yearRange, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR))
                        ? [minYear, maxYear]
                        : prev.yearRange
                };
            });

            previousStructuredTagsRef.current = tags;
            setIsInitialized(true);
        } else if (isInitialized) {
            setStructuredTags({
                minYear: DEFAULT_MIN_YEAR,
                maxYear: DEFAULT_MAX_YEAR,
                yearSets: [],
                years: [],
                subjects: [],
                topics: [],
                structuredSubtopics: {},
                structuredTopics: {},
                questionTypes: ['MCQ', 'MSQ', 'NAT'],
                hideYearFilters: true
            });
            setTotalQuestions(0);
        }
    }, [
        includeCse,
        includeDa,
        shouldMergeAptitude,
        activeAptitudeQuestions.length,
        activeCseQuestions.length,
        activeDaQuestions.length,
        allQuestions.length,
        isInitialized,
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

        if (selectedYearSets.length) {
            params.set(
                'years',
                selectedYearSets
                    .map((yearSetKey) => toLegacyYearSetKey(yearSetKey) || yearSetKey)
                    .join(',')
            );
        }
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
        const storedDaSolved = normalizeStoredIds(readJsonFromStorage(DA_STORAGE_KEYS.solved, []));
        const storedDaBookmarked = normalizeStoredIds(readJsonFromStorage(DA_STORAGE_KEYS.bookmarked, []));

        setSolvedQuestionIds(storedSolved);
        setBookmarkedQuestionIds(storedBookmarked);
        setAptitudeSolvedQuestionIds(storedAptitudeSolved);
        setAptitudeBookmarkedQuestionIds(storedAptitudeBookmarked);
        setDaSolvedQuestionIds(storedDaSolved);
        setDaBookmarkedQuestionIds(storedDaBookmarked);

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
            window.localStorage.setItem(DA_STORAGE_KEYS.solved, JSON.stringify(daSolvedQuestionIds));
            window.localStorage.setItem(DA_STORAGE_KEYS.bookmarked, JSON.stringify(daBookmarkedQuestionIds));
        } catch (error) {
            setIsProgressStorageAvailable(false);
        }
    }, [
        aptitudeBookmarkedQuestionIds,
        daBookmarkedQuestionIds,
        daSolvedQuestionIds,
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
        if (!isInitialized || (!questionService.questions.length && !daQuestions.length)) {
            return new Set();
        }

        return new Set(
            [...questionService.questions, ...daQuestions]
                .map(question => getQuestionTrackingId(question, answerService))
                .filter(Boolean)
        );
    }, [answerService, daQuestions, isInitialized, questionDataRevision, questionService, totalQuestions]);

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
        () => new Set([...solvedQuestionIds, ...daSolvedQuestionIds, ...aptitudeSolvedQuestionIds]),
        [aptitudeSolvedQuestionIds, daSolvedQuestionIds, solvedQuestionIds]
    );
    const bookmarkedQuestionSet = useMemo(
        () => new Set([...bookmarkedQuestionIds, ...daBookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds]),
        [aptitudeBookmarkedQuestionIds, bookmarkedQuestionIds, daBookmarkedQuestionIds]
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

            if (selectedYearSets.length > 0) {
                const qYearSetKey = meta?.yearSetIdentity || null;
                if (!qYearSetKey || !selectedYearSet.has(qYearSetKey)) {
                    return false;
                }
            }

            if (isRangeConstrained) {
                const qYearNum = meta?.year || 0;
                if (qYearNum <= 0 || qYearNum < yearRange[0] || qYearNum > yearRange[1]) {
                    return false;
                }
            }

            const qSubjectSlug = meta?.subjectSlug || q.subjectSlug || 'unknown';

            if (selectedSubjects.length > 0) {
                if (!selectedSubjectSet.has(qSubjectSlug)) {
                    return false;
                }
            }

            // Subtopic match: scoped to parent subject (AND logic).
            if (subtopicsByParentSubject.size > 0) {
                const requiredSubtopics = subtopicsByParentSubject.get(qSubjectSlug);
                if (requiredSubtopics) {
                    const subtopicSlugs = meta?.subtopicSlugs || [];
                    const hasMatchingSubtopic = subtopicSlugs.some(slug => requiredSubtopics.has(slug));
                    if (!hasMatchingSubtopic) {
                        return false;
                    }
                }
            }

            if (isTypeConstrained) {
                if (!selectedTypeSet.has(resolvedTypeUpper)) {
                    return false;
                }
            }

            if (searchTokens.length > 0) {
                const searchText = meta?.searchText || '';
                if (!searchText) {
                    return false;
                }
                for (let i = 0; i < searchTokens.length; i++) {
                    if (!searchText.includes(searchTokens[i])) {
                        return false;
                    }
                }
            }

            return true;
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
    const isDaTarget = useCallback((target) => {
        if (!target) return false;
        if (typeof target === 'object') return isDaQuestion(target);
        const stringId = String(target).trim();
        if (stringId.startsWith('da:') || stringId.startsWith('go_da:') || stringId.toLowerCase().startsWith('gateda-')) return true;
        const candidate = questionByUidMap.get(stringId);
        if (candidate) return isDaQuestion(candidate);
        return false;
    }, [questionByUidMap]);

    const toggleSolved = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);

        if (!questionId) {
            return;
        }

        const isDa = isDaTarget(questionOrId);
        const setTargetSolvedQuestionIds = isDa
            ? setDaSolvedQuestionIds
            : canMergeAptitude && isAptitudeQuestionId(questionId)
                ? setAptitudeSolvedQuestionIds
                : setSolvedQuestionIds;

        setTargetSolvedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
    }, [answerService, canMergeAptitude, isDaTarget]);

    const toggleBookmark = useCallback((questionOrId) => {
        const questionId = typeof questionOrId === 'string'
            ? String(questionOrId || '').trim()
            : getQuestionTrackingId(questionOrId, answerService);

        if (!questionId) {
            return;
        }

        const isDa = isDaTarget(questionOrId);
        const setTargetBookmarkedQuestionIds = isDa
            ? setDaBookmarkedQuestionIds
            : canMergeAptitude && isAptitudeQuestionId(questionId)
                ? setAptitudeBookmarkedQuestionIds
                : setBookmarkedQuestionIds;

        setTargetBookmarkedQuestionIds((prev) => (
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        ));
        enqueueChange('BOOKMARK', { questionUid: questionId });
    }, [answerService, canMergeAptitude, isDaTarget]);

    const markQuestionsSolved = useCallback((questionOrIds) => {
        const questionIds = normalizeProgressTargets(questionOrIds, answerService);
        if (questionIds.length === 0) {
            return;
        }

        const daIdSet = new Set();
        const rawList = Array.isArray(questionOrIds) ? questionOrIds : [questionOrIds];
        rawList.forEach((item) => {
            if (isDaTarget(item)) {
                const id = typeof item === 'string' ? item.trim() : getQuestionTrackingId(item, answerService);
                if (id) daIdSet.add(id);
            }
        });

        const gateQuestionIds = [];
        const daQuestionIds = [];
        const aptitudeQuestionIds = [];
        questionIds.forEach((questionId) => {
            if (daIdSet.has(questionId) || isDaTarget(questionId)) {
                daQuestionIds.push(questionId);
                return;
            }
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

        if (daQuestionIds.length > 0) {
            setDaSolvedQuestionIds((prev) => {
                const nextSet = new Set(prev);
                daQuestionIds.forEach((questionId) => {
                    nextSet.add(questionId);
                });
                const next = Array.from(nextSet);
                return next.length === prev.length ? prev : next;
            });
        }

        enqueueChange('SOLVE', { questionUids: questionIds });

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
    }, [answerService, canMergeAptitude, isDaTarget]);

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
        setDaSolvedQuestionIds(normalizeStoredIds(readJsonFromStorage(DA_STORAGE_KEYS.solved, [])));
        setDaBookmarkedQuestionIds(normalizeStoredIds(readJsonFromStorage(DA_STORAGE_KEYS.bookmarked, [])));
    }, [canMergeAptitude, storageKeys.bookmarked, storageKeys.solved]);

    useEffect(() => {
        const handleSyncComplete = () => refreshProgressState();
        const handleAuthSignedIn = () => refreshProgressState();

        window.addEventListener('gateqa:sync-complete', handleSyncComplete);
        window.addEventListener('gateqa:auth-signed-in', handleAuthSignedIn);

        return () => {
            window.removeEventListener('gateqa:sync-complete', handleSyncComplete);
            window.removeEventListener('gateqa:auth-signed-in', handleAuthSignedIn);
        };
    }, [refreshProgressState]);

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

    const setIncludeCse = useCallback((value) => {
        const isEnabled = typeof value === 'function' ? value(includeCse) : Boolean(value);
        setIncludeCseState(isEnabled);
        if (!isEnabled) {
            setFilters((prev) => {
                const nextSubjects = prev.selectedSubjects.filter((s) => String(s || '').startsWith('da:') || APTITUDE_SUBJECT_SLUGS.has(String(s || '')));
                const nextSubtopics = prev.selectedSubtopics.filter((st) => {
                    const parentSlug = urlHydrationSubtopicToSubjectSlug.get(st) || subtopicToSubjectSlug.get(st);
                    return parentSlug && (parentSlug.startsWith('da:') || APTITUDE_SUBJECT_SLUGS.has(parentSlug));
                });
                const nextYearSets = prev.selectedYearSets.filter((ys) => {
                    const parsed = parseTrackYearSetKey(ys);
                    return parsed?.track === 'da';
                });
                if (
                    nextSubjects.length === prev.selectedSubjects.length
                    && nextSubtopics.length === prev.selectedSubtopics.length
                    && nextYearSets.length === prev.selectedYearSets.length
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    selectedSubjects: nextSubjects,
                    selectedSubtopics: nextSubtopics,
                    selectedYearSets: nextYearSets,
                };
            });
        }
    }, [includeCse, subtopicToSubjectSlug, urlHydrationSubtopicToSubjectSlug]);

    const setIncludeDa = useCallback((value) => {
        const isEnabled = typeof value === 'function' ? value(includeDa) : Boolean(value);
        setIncludeDaState(isEnabled);
        if (!isEnabled) {
            setFilters((prev) => {
                const nextSubjects = prev.selectedSubjects.filter((s) => !String(s || '').startsWith('da:'));
                const nextSubtopics = prev.selectedSubtopics.filter((st) => !String(st || '').startsWith('da:'));
                const nextYearSets = prev.selectedYearSets.filter((ys) => !String(ys || '').toLowerCase().startsWith('da:'));
                if (
                    nextSubjects.length === prev.selectedSubjects.length
                    && nextSubtopics.length === prev.selectedSubtopics.length
                    && nextYearSets.length === prev.selectedYearSets.length
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    selectedSubjects: nextSubjects,
                    selectedSubtopics: nextSubtopics,
                    selectedYearSets: nextYearSets,
                };
            });
        }
    }, [includeDa]);

    const solvedCount = useMemo(() => {
        const activeSolvedIds = [...solvedQuestionIds, ...daSolvedQuestionIds, ...aptitudeSolvedQuestionIds];
        if (validQuestionIdSet.size === 0) {
            return activeSolvedIds.length;
        }
        return activeSolvedIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [aptitudeSolvedQuestionIds, daSolvedQuestionIds, solvedQuestionIds, validQuestionIdSet]);

    const bookmarkedCount = useMemo(() => {
        const activeBookmarkedIds = [...bookmarkedQuestionIds, ...daBookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds];
        return activeBookmarkedIds.filter(id => validQuestionIdSet.has(id)).length;
    }, [aptitudeBookmarkedQuestionIds, bookmarkedQuestionIds, daBookmarkedQuestionIds, validQuestionIdSet]);

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
        activeBookmarkedQuestionIds: [...bookmarkedQuestionIds, ...daBookmarkedQuestionIds, ...aptitudeBookmarkedQuestionIds],
        activeSolvedQuestionIds: [...solvedQuestionIds, ...daSolvedQuestionIds, ...aptitudeSolvedQuestionIds],
        solvedCount,
        bookmarkedCount,
        progressPercentage,
        isProgressStorageAvailable,
        progressStorageKeys: storageKeys,
        aptitudeProgressStorageKeys: APTITUDE_USER_STATE_STORAGE_KEYS,
        aptitudeEnabled: shouldMergeAptitude,
        includeCse,
        includeDa,
        daLoading,
        daError,
        daProgressStorageKeys: DA_STORAGE_KEYS,
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
        aptitudeBookmarkedQuestionIds, daBookmarkedQuestionIds, daSolvedQuestionIds,
        solvedCount, bookmarkedCount,
        progressPercentage, isProgressStorageAvailable,
        storageKeys, shouldMergeAptitude, aptitudeLoading, aptitudeError,
        progressScope, progressExportPrefix,
        includeExtendedProgress, questionService, includeCse, includeDa, daLoading, daError
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
        setShowOnlyBookmarked,
        setIncludeCse,
        setIncludeDa
    }), [
        updateFilters, clearFilters, getQuestionById,
        toggleSolved, markQuestionsSolved, toggleBookmark, isQuestionSolved,
        isQuestionBookmarked, getQuestionProgressId,
        refreshProgressState,
        setHideSolved, setShowOnlySolved, setShowOnlyBookmarked, setIncludeCse, setIncludeDa
    ]);

    return (
        <FilterStateContext.Provider value={stateValue}>
            <FilterActionsContext.Provider value={actionsValue}>
                {children}
            </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
    );
};
