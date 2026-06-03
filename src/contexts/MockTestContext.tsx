// @ts-nocheck
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFilterActions, useFilterState } from "./FilterContext";
import { AnswerService } from "../services/AnswerService";
import { AptitudeQuestionService } from "../services/AptitudeQuestionService";
import { MockCatalogService } from "../services/MockCatalogService";
import {
  buildMockResultSummary,
  hasMeaningfulResponse,
  normalizeMockTimeSpentSeconds,
  validateMockQuestionForPool,
} from "../utils/mockTest";
import { appendMockTestHistoryEntry, buildMockAttemptHistoryEntry } from "../utils/mockTestHistory";
import { APTITUDE_PROGRESS_STORAGE_KEY, recordPracticeAttempt } from "../utils/practiceProgress";

const MockTestContext = createContext();

const TOTAL_MOCK_TIME_SECONDS = 3 * 60 * 60;
const ATTEMPT_STORAGE_KEY = "gateqa_mock_attempt_v1";
const APTITUDE_UID_PREFIX = "APT-";
const APTITUDE_MOCK_ORDER_OFFSET = 100000;
const VALID_MOCK_TYPES = new Set(["MCQ", "MSQ", "NAT"]);

const STATUS = {
  NOT_VISITED: "not_visited",
  NOT_ANSWERED: "not_answered",
  ANSWERED: "answered",
  MARKED_FOR_REVIEW: "review",
  ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
};

const VALID_STATUSES = new Set(Object.values(STATUS));

const isAptitudeQuestionUid = (uid = "") => String(uid || "").startsWith(APTITUDE_UID_PREFIX);

const isGaQuestion = (question = {}) => {
  if (isAptitudeQuestionUid(question?.question_uid)) {
    return true;
  }
  return question.subject === "General Aptitude";
};

const clampToRange = (value, min, max) => Math.max(min, Math.min(max, value));

const parseInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStrictCount = (value) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

const parsePositiveTimeSeconds = (value, fallback = TOTAL_MOCK_TIME_SECONDS) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const normalizeUid = (value) => String(value || "").trim();

const normalizeMockType = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return VALID_MOCK_TYPES.has(normalized) ? normalized : "MCQ";
};

const resolveAptitudeMarks = (question = {}) => {
  const directMarks = Number(question?.marks);
  const metaMarks = Number(question?.answerMeta?.marks);
  if (Number.isFinite(directMarks) && directMarks > 0) {
    return directMarks;
  }
  if (Number.isFinite(metaMarks) && metaMarks > 0) {
    return metaMarks;
  }
  return 1;
};

const resolveAptitudeNegativeMarks = (question = {}, type = "MCQ", marks = 1) => {
  const directNegative = Number(question?.negativeMarks);
  const metaNegative = Number(question?.answerMeta?.negativeMarks);
  if (Number.isFinite(directNegative) && directNegative >= 0) {
    return directNegative;
  }
  if (Number.isFinite(metaNegative) && metaNegative >= 0) {
    return metaNegative;
  }
  return type === "MCQ" ? (Number(marks) >= 2 ? 0.6666666667 : 0.3333333333) : 0;
};

const uniqueUidList = (uids = []) => {
  const seen = new Set();
  const ordered = [];
  uids.forEach((rawUid) => {
    const uid = normalizeUid(rawUid);
    if (!uid || seen.has(uid)) {
      return;
    }
    seen.add(uid);
    ordered.push(uid);
  });
  return ordered;
};

const normalizeQuestionList = (questions = []) => {
  const seen = new Set();
  const ordered = [];
  (Array.isArray(questions) ? questions : []).forEach((question) => {
    const uid = normalizeUid(question?.question_uid);
    if (!uid || seen.has(uid)) {
      return;
    }
    seen.add(uid);
    ordered.push(question);
  });
  return ordered;
};

const buildAptitudeMockMetaByUid = (questions = []) => (
  Object.fromEntries(
    normalizeQuestionList(questions).map((question, index) => {
      const uid = normalizeUid(question?.question_uid);
      const type = normalizeMockType(question?.answerMeta?.type || question?.type || "MCQ");
      const marks = resolveAptitudeMarks(question);
      return [uid, {
        questionUid: uid,
        section: "GA",
        type,
        marks,
        negativeMarks: resolveAptitudeNegativeMarks(question, type, marks),
        yearSetKey: null,
        orderIndex: APTITUDE_MOCK_ORDER_OFFSET + index + 1,
        scorable: true,
        paperReady: true,
        source: "aptitude",
      }];
    })
  )
);

const normalizeSectionQuestions = (gaQuestions = [], csQuestions = []) => {
  const seen = new Set();

  const ga = normalizeQuestionList(gaQuestions).filter((question) => {
    const uid = normalizeUid(question?.question_uid);
    if (seen.has(uid)) {
      return false;
    }
    seen.add(uid);
    return true;
  });

  const cs = normalizeQuestionList(csQuestions).filter((question) => {
    const uid = normalizeUid(question?.question_uid);
    if (seen.has(uid)) {
      return false;
    }
    seen.add(uid);
    return true;
  });

  return { ga, cs };
};

const splitBySection = (questions = []) => {
  const ga = [];
  const cs = [];
  normalizeQuestionList(questions).forEach((question) => {
    if (isGaQuestion(question)) {
      ga.push(question);
    } else {
      cs.push(question);
    }
  });
  return { ga, cs };
};

const buildInitialQuestionStates = (orderedUids = [], activeUid = "") => {
  const states = {};
  orderedUids.forEach((uid) => {
    states[uid] = uid === activeUid ? STATUS.NOT_ANSWERED : STATUS.NOT_VISITED;
  });
  return states;
};

const sanitizeResponses = (rawResponses = {}, uidSet = new Set()) => {
  const next = {};
  if (!rawResponses || typeof rawResponses !== "object") {
    return next;
  }
  Object.entries(rawResponses).forEach(([uid, value]) => {
    if (uidSet.has(uid)) {
      next[uid] = value;
    }
  });
  return next;
};

const sanitizeQuestionTimeSpent = (rawTimeSpent = {}, uidSet = new Set()) => {
  const next = {};
  if (!rawTimeSpent || typeof rawTimeSpent !== "object") {
    return next;
  }

  Object.entries(rawTimeSpent).forEach(([uid, value]) => {
    if (!uidSet.has(uid)) {
      return;
    }
    const seconds = normalizeMockTimeSpentSeconds(value);
    if (seconds > 0) {
      next[uid] = seconds;
    }
  });
  return next;
};

const sanitizeQuestionStates = (rawStates = {}, orderedUids = [], activeUid = "") => {
  const fallback = buildInitialQuestionStates(orderedUids, activeUid);
  if (!rawStates || typeof rawStates !== "object") {
    return fallback;
  }

  orderedUids.forEach((uid) => {
    const candidate = rawStates[uid];
    fallback[uid] = VALID_STATUSES.has(candidate) ? candidate : fallback[uid];
  });
  return fallback;
};

const getValidStartSection = (candidateSection, sectionUids) => {
  if (candidateSection === "CS" && sectionUids.CS.length > 0) {
    return "CS";
  }
  if (sectionUids.GA.length > 0) {
    return "GA";
  }
  if (sectionUids.CS.length > 0) {
    return "CS";
  }
  return "GA";
};

const getCurrentUidFromSectionState = (sectionUids, sectionIndexes, activeSection) => {
  const currentSection = activeSection === "CS" ? "CS" : "GA";
  const uids = sectionUids[currentSection] || [];
  if (uids.length === 0) {
    return null;
  }
  const index = clampToRange(sectionIndexes[currentSection] || 0, 0, uids.length - 1);
  return uids[index] || null;
};

const getSectionUidList = (sectionUids, section) => (
  section === "CS" ? sectionUids.CS : sectionUids.GA
);

const getClampedSectionIndex = (sectionUids, sectionIndexes, section) => {
  const uids = getSectionUidList(sectionUids, section);
  if (uids.length === 0) {
    return 0;
  }
  return clampToRange(sectionIndexes[section] || 0, 0, uids.length - 1);
};

const hasValidMockQuestionForPool = (question = null, questionMetaByUid = {}) => {
  const uid = normalizeUid(question?.question_uid);
  if (!uid) {
    return false;
  }

  return validateMockQuestionForPool({
    question,
    questionMeta: questionMetaByUid[uid] || null,
    answerRecord: AnswerService.getAnswerForQuestion(question),
  }).valid;
};

const reconcileQuestionStatesWithResponses = (
  questionStates,
  responses,
  orderedUids,
  questionMetaByUid
) => {
  const nextStates = { ...questionStates };

  orderedUids.forEach((uid) => {
    const type = questionMetaByUid[uid]?.type || "";
    const answered = hasMeaningfulResponse(responses[uid], type);
    if (!answered && nextStates[uid] === STATUS.ANSWERED) {
      nextStates[uid] = STATUS.NOT_ANSWERED;
    }
    if (!answered && nextStates[uid] === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW) {
      nextStates[uid] = STATUS.MARKED_FOR_REVIEW;
    }
  });

  return nextStates;
};

const updateQuestionStateForResponse = (prevStates, uid, response, questionMetaByUid) => {
  const currentStatus = prevStates[uid];
  const type = questionMetaByUid[uid]?.type || "";
  const answered = hasMeaningfulResponse(response, type);

  if (currentStatus === STATUS.ANSWERED && !answered) {
    return { ...prevStates, [uid]: STATUS.NOT_ANSWERED };
  }

  if (currentStatus === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW && !answered) {
    return { ...prevStates, [uid]: STATUS.MARKED_FOR_REVIEW };
  }

  if (currentStatus === STATUS.MARKED_FOR_REVIEW && answered) {
    return { ...prevStates, [uid]: STATUS.ANSWERED_AND_MARKED_FOR_REVIEW };
  }

  return prevStates;
};

export const MockTestProvider = ({ children }) => {
  const { allQuestions } = useFilterState();
  const { markQuestionsSolved } = useFilterActions();
  const [catalog, setCatalog] = useState(() => MockCatalogService.catalog);
  const [catalogLoading, setCatalogLoading] = useState(() => !MockCatalogService.loaded);
  const [catalogError, setCatalogError] = useState(() => MockCatalogService.loadError || "");
  const [aptitudeQuestions, setAptitudeQuestions] = useState(() => (
    AptitudeQuestionService.loaded ? normalizeQuestionList(AptitudeQuestionService.questions) : []
  ));
  const [aptitudeMockLoading, setAptitudeMockLoading] = useState(() => !AptitudeQuestionService.loaded);
  const [aptitudeMockError, setAptitudeMockError] = useState(() => AptitudeQuestionService.loadError || "");

  const [testActive, setTestActive] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [sectionQuestionUids, setSectionQuestionUids] = useState({ GA: [], CS: [] });
  const [sectionIndexes, setSectionIndexes] = useState({ GA: 0, CS: 0 });
  const [currentSection, setCurrentSectionState] = useState("GA");

  const [responses, setResponses] = useState({});
  const [questionStates, setQuestionStates] = useState({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_MOCK_TIME_SECONDS);
  const [attemptMeta, setAttemptMeta] = useState(null);
  const [attemptError, setAttemptError] = useState("");
  const [resultSummary, setResultSummary] = useState(null);

  const timerRef = useRef(null);
  const activeTimingUidRef = useRef(null);
  const hasAttemptRestoreRun = useRef(false);
  const liveAttemptRef = useRef({
    questions: [],
    responses: {},
    questionTimeSpent: {},
    questionMetaByUid: {},
    attemptMeta: null,
  });

  const catalogQuestionMetaByUid = useMemo(
    () => (catalog?.byQuestionUid && typeof catalog.byQuestionUid === "object" ? catalog.byQuestionUid : {}),
    [catalog]
  );
  const aptitudeQuestionMetaByUid = useMemo(
    () => buildAptitudeMockMetaByUid(aptitudeQuestions),
    [aptitudeQuestions]
  );
  const questionMetaByUid = useMemo(
    () => ({
      ...catalogQuestionMetaByUid,
      ...aptitudeQuestionMetaByUid,
    }),
    [aptitudeQuestionMetaByUid, catalogQuestionMetaByUid]
  );
  const paperCatalog = useMemo(
    () => (Array.isArray(catalog?.papers) ? catalog.papers : []),
    [catalog]
  );
  const readyPapers = useMemo(
    () => paperCatalog.filter((paper) => paper?.paperReady),
    [paperCatalog]
  );
  const mockQuestionPool = useMemo(
    () => normalizeQuestionList([...allQuestions, ...aptitudeQuestions]),
    [allQuestions, aptitudeQuestions]
  );

  const questionsByUid = useMemo(
    () => new Map(questions.map((question) => [question.question_uid, question])),
    [questions]
  );

  const sectionQuestions = useMemo(
    () => ({
      GA: sectionQuestionUids.GA.map((uid) => questionsByUid.get(uid)).filter(Boolean),
      CS: sectionQuestionUids.CS.map((uid) => questionsByUid.get(uid)).filter(Boolean),
    }),
    [questionsByUid, sectionQuestionUids.CS, sectionQuestionUids.GA]
  );

  const currentSectionUids = getSectionUidList(sectionQuestionUids, currentSection);
  const currentSectionIndex = getClampedSectionIndex(sectionQuestionUids, sectionIndexes, currentSection);
  const currentQuestionUid = currentSectionUids[currentSectionIndex] || null;
  const currentQuestion = currentQuestionUid ? questionsByUid.get(currentQuestionUid) || null : null;
  const currentQuestionMeta = currentQuestionUid ? questionMetaByUid[currentQuestionUid] || null : null;
  const currentQuestionResult = currentQuestionUid
    ? resultSummary?.perQuestionResult?.[currentQuestionUid] || null
    : null;

  const currentQuestionIndex = useMemo(() => {
    if (!currentQuestionUid) {
      return -1;
    }
    return questions.findIndex((question) => question.question_uid === currentQuestionUid);
  }, [currentQuestionUid, questions]);

  useEffect(() => {
    liveAttemptRef.current = {
      questions,
      responses,
      questionTimeSpent,
      questionMetaByUid,
      attemptMeta,
    };
  }, [attemptMeta, questions, questionMetaByUid, questionTimeSpent, responses]);

  useEffect(() => {
    activeTimingUidRef.current = testActive && currentQuestionUid ? currentQuestionUid : null;
  }, [currentQuestionUid, testActive]);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      if (MockCatalogService.loaded && MockCatalogService.catalog) {
        setCatalog(MockCatalogService.catalog);
        setCatalogError("");
        setCatalogLoading(false);
        return;
      }

      setCatalogLoading(true);
      try {
        const loadedCatalog = await MockCatalogService.init();
        if (cancelled) {
          return;
        }
        setCatalog(loadedCatalog);
        setCatalogError("");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setCatalogError(error.message || "Unable to load mock catalog.");
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  // Restore the loading effect for Aptitude questions so they participate in mock tests
  useEffect(() => {
    let cancelled = false;

    const loadAptitude = async () => {
      if (AptitudeQuestionService.loaded) {
        setAptitudeQuestions(normalizeQuestionList(AptitudeQuestionService.questions));
        setAptitudeMockError("");
        setAptitudeMockLoading(false);
        return;
      }

      setAptitudeMockLoading(true);
      setAptitudeMockError("");
      try {
        await AptitudeQuestionService.init();
        if (cancelled) {
          return;
        }
        setAptitudeQuestions(normalizeQuestionList(AptitudeQuestionService.questions));
        setAptitudeMockError("");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setAptitudeMockError(error.message || "Unable to load aptitude questions.");
      } finally {
        if (!cancelled) {
          setAptitudeMockLoading(false);
        }
      }
    };

    void loadAptitude();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearAttemptStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
  }, []);

  const resetAttemptState = useCallback(() => {
    setTestActive(false);
    setTestSubmitted(false);
    setQuestions([]);
    setSectionQuestionUids({ GA: [], CS: [] });
    setSectionIndexes({ GA: 0, CS: 0 });
    setCurrentSectionState("GA");
    setResponses({});
    setQuestionStates({});
    setQuestionTimeSpent({});
    setTimeLeft(TOTAL_MOCK_TIME_SECONDS);
    setAttemptMeta(null);
    setAttemptError("");
    setResultSummary(null);
    activeTimingUidRef.current = null;
    liveAttemptRef.current = {
      questions: [],
      responses: {},
      questionTimeSpent: {},
      questionMetaByUid,
      attemptMeta: null,
    };
  }, [questionMetaByUid]);

  const markUidVisited = useCallback((uid) => {
    if (!uid) {
      return;
    }
    setQuestionStates((prev) => {
      if (prev[uid] === STATUS.NOT_VISITED) {
        return { ...prev, [uid]: STATUS.NOT_ANSWERED };
      }
      return prev;
    });
  }, []);

  const getSectionUids = useCallback(
    (section) => getSectionUidList(sectionQuestionUids, section),
    [sectionQuestionUids.CS, sectionQuestionUids.GA]
  );

  const getSectionIndex = useCallback(
    (section) => getClampedSectionIndex(sectionQuestionUids, sectionIndexes, section),
    [sectionIndexes, sectionQuestionUids.CS, sectionQuestionUids.GA]
  );

  const restoreFromSectionedPayload = useCallback((parsedAttempt, byUid) => {
    const gaUids = uniqueUidList(parsedAttempt?.gaUids);
    const csUids = uniqueUidList(parsedAttempt?.csUids);
    const strictCounts = parsedAttempt?.meta?.strictSectionCounts;
    const requiredGa = parseStrictCount(strictCounts?.GA);
    const requiredCs = parseStrictCount(strictCounts?.CS);

    if (requiredGa !== null && gaUids.length !== requiredGa) {
      return { ok: false, reason: "ga_count_mismatch" };
    }
    if (requiredCs !== null && csUids.length !== requiredCs) {
      return { ok: false, reason: "cs_count_mismatch" };
    }
    if (gaUids.length + csUids.length === 0) {
      return { ok: false, reason: "empty_attempt" };
    }

    const seen = new Set();
    for (const uid of [...gaUids, ...csUids]) {
      if (seen.has(uid)) {
        return { ok: false, reason: "duplicate_uid" };
      }
      seen.add(uid);
      const question = byUid.get(uid);
      if (!question || !hasValidMockQuestionForPool(question, questionMetaByUid)) {
        return { ok: false, reason: "invalid_uid" };
      }
    }

    const restoredQuestions = [...gaUids, ...csUids].map((uid) => byUid.get(uid));
    const activeSection = getValidStartSection(parsedAttempt?.activeSection, { GA: gaUids, CS: csUids });
    const gaIndex = clampToRange(parseInteger(parsedAttempt?.gaIndex, 0), 0, Math.max(gaUids.length - 1, 0));
    const csIndex = clampToRange(parseInteger(parsedAttempt?.csIndex, 0), 0, Math.max(csUids.length - 1, 0));

    const currentUid = getCurrentUidFromSectionState(
      { GA: gaUids, CS: csUids },
      { GA: gaIndex, CS: csIndex },
      activeSection
    ) || gaUids[0] || csUids[0] || "";

    const orderedUids = [...gaUids, ...csUids];
    const uidSet = new Set(orderedUids);
    const restoredResponses = sanitizeResponses(parsedAttempt?.responses, uidSet);
    const restoredTimeSpent = sanitizeQuestionTimeSpent(parsedAttempt?.questionTimeSpent, uidSet);
    const restoredStates = reconcileQuestionStatesWithResponses(
      sanitizeQuestionStates(parsedAttempt?.questionStates, orderedUids, currentUid),
      restoredResponses,
      orderedUids,
      questionMetaByUid
    );

    return {
      ok: true,
      questions: restoredQuestions,
      sectionQuestionUids: { GA: gaUids, CS: csUids },
      sectionIndexes: { GA: gaIndex, CS: csIndex },
      activeSection,
      responses: restoredResponses,
      questionStates: restoredStates,
      questionTimeSpent: restoredTimeSpent,
      timeLeft: parsePositiveTimeSeconds(parsedAttempt?.timeLeft, TOTAL_MOCK_TIME_SECONDS),
      meta: parsedAttempt?.meta || null,
    };
  }, [questionMetaByUid]);

  const restoreFromLegacyPayload = useCallback((parsedAttempt, byUid) => {
    const questionUids = uniqueUidList(parsedAttempt?.questionUids);
    if (questionUids.length === 0) {
      return { ok: false, reason: "empty_attempt" };
    }

    const restoredQuestions = questionUids
      .map((uid) => {
        const question = byUid.get(uid);
        return hasValidMockQuestionForPool(question, questionMetaByUid) ? question : null;
      })
      .filter(Boolean);
    if (restoredQuestions.length !== questionUids.length) {
      return { ok: false, reason: "invalid_uid" };
    }

    const split = splitBySection(restoredQuestions);
    const gaUids = split.ga.map((question) => question.question_uid);
    const csUids = split.cs.map((question) => question.question_uid);
    const activeSection = getValidStartSection(parsedAttempt?.currentSection, { GA: gaUids, CS: csUids });
    const globalIndex = parseInteger(parsedAttempt?.currentQuestionIndex, 0);
    const activeQuestion = restoredQuestions[clampToRange(globalIndex, 0, restoredQuestions.length - 1)];

    let gaIndex = 0;
    let csIndex = 0;
    if (activeQuestion?.question_uid) {
      const activeUid = activeQuestion.question_uid;
      const foundGa = gaUids.indexOf(activeUid);
      const foundCs = csUids.indexOf(activeUid);
      if (foundGa >= 0) {
        gaIndex = foundGa;
      }
      if (foundCs >= 0) {
        csIndex = foundCs;
      }
    }

    const currentUid = getCurrentUidFromSectionState(
      { GA: gaUids, CS: csUids },
      { GA: gaIndex, CS: csIndex },
      activeSection
    ) || gaUids[0] || csUids[0] || "";

    const orderedUids = [...gaUids, ...csUids];
    const uidSet = new Set(orderedUids);
    const restoredResponses = sanitizeResponses(parsedAttempt?.responses, uidSet);
    const restoredTimeSpent = sanitizeQuestionTimeSpent(parsedAttempt?.questionTimeSpent, uidSet);
    const restoredStates = reconcileQuestionStatesWithResponses(
      sanitizeQuestionStates(parsedAttempt?.questionStates, orderedUids, currentUid),
      restoredResponses,
      orderedUids,
      questionMetaByUid
    );

    return {
      ok: true,
      questions: restoredQuestions,
      sectionQuestionUids: { GA: gaUids, CS: csUids },
      sectionIndexes: { GA: gaIndex, CS: csIndex },
      activeSection,
      responses: restoredResponses,
      questionStates: restoredStates,
      questionTimeSpent: restoredTimeSpent,
      timeLeft: parsePositiveTimeSeconds(parsedAttempt?.timeLeft, TOTAL_MOCK_TIME_SECONDS),
      meta: parsedAttempt?.meta || null,
    };
  }, [questionMetaByUid]);

  useEffect(() => {
    if (
      catalogLoading
      || aptitudeMockLoading
      || allQuestions.length === 0
      || mockQuestionPool.length === 0
      || hasAttemptRestoreRun.current
    ) {
      return;
    }

    hasAttemptRestoreRun.current = true;

    if (catalogError || typeof window === "undefined") {
      return;
    }

    const rawAttempt = window.sessionStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (!rawAttempt) {
      return;
    }

    const byUid = new Map(mockQuestionPool.map((question) => [question.question_uid, question]));

    try {
      const parsedAttempt = JSON.parse(rawAttempt);
      const restored = Array.isArray(parsedAttempt?.gaUids) || Array.isArray(parsedAttempt?.csUids)
        ? restoreFromSectionedPayload(parsedAttempt, byUid)
        : restoreFromLegacyPayload(parsedAttempt, byUid);

      if (!restored.ok) {
        clearAttemptStorage();
        setAttemptError("Attempt invalid, restart mock.");
        return;
      }

      setQuestions(restored.questions);
      setSectionQuestionUids(restored.sectionQuestionUids);
      setSectionIndexes(restored.sectionIndexes);
      setCurrentSectionState(restored.activeSection);
      setResponses(restored.responses);
      setQuestionStates(restored.questionStates);
      setQuestionTimeSpent(restored.questionTimeSpent);
      setTimeLeft(restored.timeLeft);
      setAttemptMeta(restored.meta);
      setResultSummary(null);
      setTestSubmitted(false);
      setTestActive(true);
      activeTimingUidRef.current = getCurrentUidFromSectionState(
        restored.sectionQuestionUids,
        restored.sectionIndexes,
        restored.activeSection
      );
      setAttemptError("");
    } catch (error) {
      clearAttemptStorage();
      setAttemptError("Attempt invalid, restart mock.");
    }
  }, [
    allQuestions,
    aptitudeMockLoading,
    catalogError,
    catalogLoading,
    clearAttemptStorage,
    mockQuestionPool,
    restoreFromLegacyPayload,
    restoreFromSectionedPayload,
  ]);

  const startTest = useCallback((config = {}) => {
    if (catalogLoading || aptitudeMockLoading || !catalog) {
      return false;
    }

    const hasExplicitSectioned = Object.prototype.hasOwnProperty.call(config, "gaQuestions")
      || Object.prototype.hasOwnProperty.call(config, "csQuestions");
    const hasExplicitQuestions = Object.prototype.hasOwnProperty.call(config, "questions");

    let gaQuestions = [];
    let csQuestions = [];

    if (hasExplicitSectioned) {
      const normalized = normalizeSectionQuestions(
        Array.isArray(config.gaQuestions) ? config.gaQuestions : [],
        Array.isArray(config.csQuestions) ? config.csQuestions : []
      );
      gaQuestions = normalized.ga;
      csQuestions = normalized.cs;
    } else if (hasExplicitQuestions) {
      const split = splitBySection(Array.isArray(config.questions) ? config.questions : []);
      gaQuestions = split.ga;
      csQuestions = split.cs;
    } else {
      const scorableQuestions = mockQuestionPool.filter((question) => hasValidMockQuestionForPool(question, questionMetaByUid));
      const split = splitBySection(scorableQuestions);
      gaQuestions = split.ga.slice(0, 10);
      csQuestions = split.cs.slice(0, 55);
    }

    const strictCounts = config?.meta?.strictSectionCounts || null;
    const requiredGa = parseStrictCount(strictCounts?.GA);
    const requiredCs = parseStrictCount(strictCounts?.CS);
    if (requiredGa !== null && gaQuestions.length !== requiredGa) {
      return false;
    }
    if (requiredCs !== null && csQuestions.length !== requiredCs) {
      return false;
    }

    const normalizedSections = normalizeSectionQuestions(gaQuestions, csQuestions);
    gaQuestions = normalizedSections.ga;
    csQuestions = normalizedSections.cs;

    const orderedQuestions = [...gaQuestions, ...csQuestions];
    if (
      orderedQuestions.length === 0
      || !orderedQuestions.every((question) => hasValidMockQuestionForPool(question, questionMetaByUid))
    ) {
      return false;
    }

    const safeTime = parsePositiveTimeSeconds(config?.timeSeconds, TOTAL_MOCK_TIME_SECONDS);
    const gaUids = gaQuestions.map((question) => question.question_uid);
    const csUids = csQuestions.map((question) => question.question_uid);
    const sectionUids = { GA: gaUids, CS: csUids };
    const startSection = getValidStartSection(config?.startSection, sectionUids);
    const startIndexes = { GA: 0, CS: 0 };
    const currentUid = getCurrentUidFromSectionState(sectionUids, startIndexes, startSection);

    setQuestions(orderedQuestions);
    setSectionQuestionUids(sectionUids);
    setSectionIndexes(startIndexes);
    setCurrentSectionState(startSection);
    setQuestionStates(buildInitialQuestionStates([...gaUids, ...csUids], currentUid || ""));
    setResponses({});
    setQuestionTimeSpent({});
    setTimeLeft(safeTime);
    setTestSubmitted(false);
    setAttemptMeta(config?.meta || null);
    setAttemptError("");
    setResultSummary(null);
    setTestActive(true);
    activeTimingUidRef.current = currentUid || null;
    liveAttemptRef.current = {
      questions: orderedQuestions,
      responses: {},
      questionTimeSpent: {},
      questionMetaByUid,
      attemptMeta: config?.meta || null,
    };
    return true;
  }, [
    aptitudeMockLoading,
    catalog,
    catalogLoading,
    mockQuestionPool,
    questionMetaByUid,
  ]);

  useEffect(() => {
    if (!testActive || testSubmitted || questions.length === 0 || typeof window === "undefined") {
      return;
    }

    const payload = {
      v: 4,
      gaUids: sectionQuestionUids.GA,
      csUids: sectionQuestionUids.CS,
      activeSection: currentSection,
      gaIndex: sectionIndexes.GA,
      csIndex: sectionIndexes.CS,
      responses,
      questionStates,
      questionTimeSpent,
      timeLeft,
      meta: attemptMeta || null,
    };

    window.sessionStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(payload));
  }, [
    attemptMeta,
    currentSection,
    questionStates,
    questionTimeSpent,
    questions.length,
    responses,
    sectionIndexes.CS,
    sectionIndexes.GA,
    sectionQuestionUids.CS,
    sectionQuestionUids.GA,
    testActive,
    testSubmitted,
    timeLeft,
  ]);

  useEffect(() => {
    if (!testActive || questions.length === 0) {
      return;
    }

    const hasGa = sectionQuestionUids.GA.length > 0;
    const hasCs = sectionQuestionUids.CS.length > 0;

    if (!hasGa && !hasCs) {
      return;
    }

    if (currentSection === "GA" && !hasGa && hasCs) {
      setCurrentSectionState("CS");
      return;
    }

    if (currentSection === "CS" && !hasCs && hasGa) {
      setCurrentSectionState("GA");
      return;
    }

    const currentUids = getSectionUids(currentSection);
    const maxForSection = Math.max(currentUids.length - 1, 0);
    const indexForSection = sectionIndexes[currentSection] || 0;
    if (indexForSection > maxForSection) {
      setSectionIndexes((prev) => ({
        ...prev,
        [currentSection]: maxForSection,
      }));
    }
  }, [
    currentSection,
    getSectionUids,
    questions.length,
    sectionIndexes.CS,
    sectionIndexes.GA,
    sectionQuestionUids.CS,
    sectionQuestionUids.GA,
    testActive,
  ]);

  const recordQuestionTimeSpent = useCallback((uid, seconds = 1) => {
    const safeUid = normalizeUid(uid);
    const safeSeconds = normalizeMockTimeSpentSeconds(seconds);
    if (!safeUid || safeSeconds <= 0) {
      return;
    }

    const currentLiveTimes = liveAttemptRef.current.questionTimeSpent || {};
    const nextSeconds = normalizeMockTimeSpentSeconds(currentLiveTimes[safeUid]) + safeSeconds;
    const nextLiveTimes = {
      ...currentLiveTimes,
      [safeUid]: nextSeconds,
    };

    liveAttemptRef.current = {
      ...liveAttemptRef.current,
      questionTimeSpent: nextLiveTimes,
    };

    setQuestionTimeSpent((prev) => ({
      ...prev,
      [safeUid]: Math.max(normalizeMockTimeSpentSeconds(prev[safeUid]), nextSeconds),
    }));
  }, []);

  const finalizeSubmission = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeTimingUidRef.current = null;

    const {
      questions: activeQuestions,
      responses: liveResponses,
      questionTimeSpent: liveQuestionTimeSpent,
      questionMetaByUid: liveMeta,
      attemptMeta: liveAttemptMeta,
    } = liveAttemptRef.current;
    const nextSummary = buildMockResultSummary({
      questions: activeQuestions,
      responses: liveResponses,
      questionMetaByUid: liveMeta,
      questionTimeSpentByUid: liveQuestionTimeSpent,
      getAnswerRecord: (question) => AnswerService.getAnswerForQuestion(question),
    });
    const historyEntry = buildMockAttemptHistoryEntry({
      attemptMeta: liveAttemptMeta,
      resultSummary: nextSummary,
      questionMetaByUid: liveMeta,
      questions: activeQuestions,
    });
    const solvedQuestions = activeQuestions.filter((question) => {
      const questionUid = String(question?.question_uid || "").trim();
      return !!nextSummary.perQuestionResult?.[questionUid]?.correct;
    });

    if (solvedQuestions.length > 0) {
      markQuestionsSolved(solvedQuestions);
    }
    activeQuestions.forEach((question) => {
      const questionUid = String(question?.question_uid || "").trim();
      if (!isAptitudeQuestionUid(questionUid)) {
        return;
      }

      const questionResult = nextSummary.perQuestionResult?.[questionUid];
      if (!questionResult?.answered && questionResult?.correct !== true) {
        return;
      }

      recordPracticeAttempt({
        storageKey: questionUid,
        correct: questionResult.correct === true,
        type: liveMeta[questionUid]?.type || question?.answerMeta?.type || question?.type || "",
        input: liveResponses[questionUid] ?? null,
        progressStorageKey: APTITUDE_PROGRESS_STORAGE_KEY,
      });
    });
    appendMockTestHistoryEntry(historyEntry);
    setResultSummary(nextSummary);
    setTestSubmitted(true);
    setTestActive(false);
    clearAttemptStorage();
  }, [clearAttemptStorage, markQuestionsSolved]);

  useEffect(() => {
    if (!testActive || testSubmitted) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      const activeUid = activeTimingUidRef.current;
      if (activeUid) {
        recordQuestionTimeSpent(activeUid, 1);
      }

      setTimeLeft((previous) => {
        if (previous <= 1) {
          finalizeSubmission();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [finalizeSubmission, recordQuestionTimeSpent, testActive, testSubmitted]);

  const goToQuestion = useCallback((index, section = currentSection) => {
    const targetSection = section === "CS" ? "CS" : "GA";
    const targetUids = getSectionUids(targetSection);
    if (targetUids.length === 0 || index < 0 || index >= targetUids.length) {
      return;
    }

    setCurrentSectionState(targetSection);
    setSectionIndexes((prev) => ({
      ...prev,
      [targetSection]: index,
    }));

    activeTimingUidRef.current = targetUids[index] || null;
    markUidVisited(targetUids[index]);
  }, [currentSection, getSectionUids, markUidVisited]);

  const setCurrentSection = useCallback((section) => {
    const targetSection = section === "CS" ? "CS" : "GA";
    const targetUids = getSectionUids(targetSection);
    if (targetUids.length === 0) {
      return;
    }

    setCurrentSectionState(targetSection);
    const index = getSectionIndex(targetSection);
    activeTimingUidRef.current = targetUids[index] || null;
    markUidVisited(targetUids[index]);
  }, [getSectionIndex, getSectionUids, markUidVisited]);

  const goToPrevious = useCallback(() => {
    const targetUids = getSectionUids(currentSection);
    if (targetUids.length === 0) {
      return;
    }
    const index = getSectionIndex(currentSection);
    if (index > 0) {
      goToQuestion(index - 1, currentSection);
    }
  }, [currentSection, getSectionIndex, getSectionUids, goToQuestion]);

  const goToNext = useCallback(() => {
    const targetUids = getSectionUids(currentSection);
    if (targetUids.length === 0) {
      return;
    }
    const index = getSectionIndex(currentSection);
    if (index < targetUids.length - 1) {
      goToQuestion(index + 1, currentSection);
    } else if (currentSection === "GA") {
      const csUids = getSectionUids("CS");
      if (csUids.length > 0) {
        goToQuestion(0, "CS");
      }
    }
  }, [currentSection, getSectionIndex, getSectionUids, goToQuestion]);

  const saveResponse = useCallback((uid, response) => {
    if (!uid) {
      return;
    }

    setResponses((prev) => ({ ...prev, [uid]: response }));
    liveAttemptRef.current = {
      ...liveAttemptRef.current,
      responses: {
        ...liveAttemptRef.current.responses,
        [uid]: response,
      },
    };
    setQuestionStates((prev) => updateQuestionStateForResponse(prev, uid, response, questionMetaByUid));
  }, [questionMetaByUid]);

  const clearResponse = useCallback(() => {
    const uid = currentQuestionUid;
    if (!uid) {
      return;
    }

    setResponses((prev) => {
      const next = { ...prev };
      delete next[uid];
      liveAttemptRef.current = {
        ...liveAttemptRef.current,
        responses: next,
      };
      return next;
    });

    setQuestionStates((prev) => ({
      ...prev,
      [uid]:
        prev[uid] === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW || prev[uid] === STATUS.MARKED_FOR_REVIEW
          ? STATUS.MARKED_FOR_REVIEW
          : STATUS.NOT_ANSWERED,
    }));
  }, [currentQuestionUid]);

  const saveAndNext = useCallback(() => {
    const uid = currentQuestionUid;
    if (!uid) {
      return;
    }

    const answered = hasMeaningfulResponse(responses[uid], questionMetaByUid[uid]?.type || "");
    setQuestionStates((prev) => ({
      ...prev,
      [uid]: answered ? STATUS.ANSWERED : STATUS.NOT_ANSWERED,
    }));
    goToNext();
  }, [currentQuestionUid, goToNext, questionMetaByUid, responses]);

  const markForReviewAndNext = useCallback(() => {
    const uid = currentQuestionUid;
    if (!uid) {
      return;
    }

    const answered = hasMeaningfulResponse(responses[uid], questionMetaByUid[uid]?.type || "");
    setQuestionStates((prev) => ({
      ...prev,
      [uid]: answered ? STATUS.ANSWERED_AND_MARKED_FOR_REVIEW : STATUS.MARKED_FOR_REVIEW,
    }));
    goToNext();
  }, [currentQuestionUid, goToNext, questionMetaByUid, responses]);

  const submitTest = useCallback(() => {
    finalizeSubmission();
  }, [finalizeSubmission]);

  const endMockTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearAttemptStorage();
    resetAttemptState();
  }, [clearAttemptStorage, resetAttemptState]);

  const clearAttemptError = useCallback(() => {
    setAttemptError("");
  }, []);

  const getQuestionMeta = useCallback((questionOrUid) => {
    const questionUid = typeof questionOrUid === "string"
      ? String(questionOrUid || "").trim()
      : String(questionOrUid?.question_uid || "").trim();
    if (!questionUid) {
      return null;
    }
    return questionMetaByUid[questionUid] || null;
  }, [questionMetaByUid]);

  const value = {
    STATUS,
    attemptError,
    attemptMeta,
    catalog,
    catalogError,
    catalogLoading,
    aptitudeMockError,
    aptitudeMockLoading,
    clearAttemptError,
    currentQuestion,
    currentQuestionIndex,
    currentQuestionMeta,
    currentQuestionResult,
    currentQuestionUid,
    currentSection,
    currentSectionIndex,
    endMockTest,
    getQuestionMeta,
    mockQuestionPool,
    paperCatalog,
    goToNext,
    goToPrevious,
    goToQuestion,
    questionMetaByUid,
    questionStates,
    questionTimeSpent,
    questions,
    readyPapers,
    responses,
    resultSummary,
    saveAndNext,
    saveResponse,
    sectionIndexes,
    sectionQuestionUids,
    sectionQuestions,
    setCurrentSection,
    startTest,
    submitTest,
    testActive,
    testSubmitted,
    timeLeft,
    clearResponse,
    markForReviewAndNext,
  };

  return <MockTestContext.Provider value={value}>{children}</MockTestContext.Provider>;
};

export const useMockTest = () => {
  const context = useContext(MockTestContext);
  if (!context) {
    throw new Error("useMockTest must be used within a MockTestProvider");
  }
  return context;
};
