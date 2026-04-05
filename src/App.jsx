import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

import LandingShell from "./shells/LandingShell";
import { FilterProvider, useFilterActions } from "./contexts/FilterContext";
import { SessionProvider } from "./contexts/SessionContext";
import { QuestionService } from "./services/QuestionService";
import { AnswerService } from "./services/AnswerService";
import { QuestionBankManifestService } from "./services/QuestionBankManifestService";
import LoadingState from "./components/Loaders/LoadingState";
import { pageview, trackEvent } from "./utils/analytics";
import { MOCK_TEST_MODE_ENABLED } from "./constants/featureFlags";

const LANDING_FILTER_KEYS = ["years", "subjects", "subtopics", "range", "types", "search"];
const loadPracticeShell = () => import("./shells/PracticeShell");
const loadMockShell = () => import("./shells/MockShell");
const PracticeShell = lazy(loadPracticeShell);
const MockShell = lazy(loadMockShell);

const ShellLoader = ({ label }) => (
  <LoadingState
    label={label}
    size="lg"
    className="grow px-4 py-10"
    textClassName="text-sm text-gray-500"
  />
);

/**
 * Pure function: resolve appView from current URL.
 * Priority: ?question → ?mode+stage → filter params → landing
 */
export const resolveAppViewFromUrl = () => {
  const params = new URLSearchParams(window.location.search);

  // Deep-link always wins
  if (params.get("question")) return "practice";

  const mode = params.get("mode");
  if (mode === "random" || mode === "targeted" || mode === "resume" || (mode && mode !== "mock")) return "practice";

  // Issue 008: mock mode splits into mockSetup / mockExam based on stage param
  if (mode === "mock" && MOCK_TEST_MODE_ENABLED) {
    const stage = params.get("stage");
    if (stage === "exam") return "mockExam";
    return "mockSetup"; // default stage for mock is setup
  }

  const hasFilterParams = LANDING_FILTER_KEYS.some((key) => {
    const value = params.get(key);
    return value !== null && String(value).trim() !== "";
  });
  if (hasFilterParams) return "practice";

  return "landing";
};

/**
 * ViewSwitch — resolves appView on mount from URL, handles mode starts,
 * popstate, and renders exactly one shell.
 */
export const ViewSwitch = ({
  loading,
  error,
  loadQuestions,
  appView,
  setAppView,
  shouldOpenFilterOnEnter,
  hasPriorProgress,
  questionBankManifest,
  manifestLoading,
  manifestError,
}) => {
  const { clearFilters } = useFilterActions();
  const hasResolvedAppView = useRef(false);

  // Mount-time side effects for the current URL (same strict priority as
  // resolveAppViewFromUrl, but with side-effects like clearFilters for random mode).
  useEffect(() => {
    if (hasResolvedAppView.current) return;
    hasResolvedAppView.current = true;

    const params = new URLSearchParams(window.location.search);

    // 1. Deep-link wins
    if (params.get("question")) { setAppView("practice"); return; }

    // 2. Explicit mode
    const mode = params.get("mode");
    if (mode === "random") { clearFilters(); setAppView("practice"); return; }
    if (mode === "targeted") { shouldOpenFilterOnEnter.current = true; setAppView("practice"); return; }
    if (mode === "resume") { shouldOpenFilterOnEnter.current = false; setAppView("practice"); return; }
    if (mode === "mock" && MOCK_TEST_MODE_ENABLED) {
      const stage = params.get("stage");
      if (stage === "exam") { setAppView("mockExam"); }
      else { setAppView("mockSetup"); }
      return;
    }
    if (mode === "mock") { setAppView("landing"); return; }
    if (mode) { setAppView("practice"); return; }  // legacy/unknown

    // 3. Shared filter URL
    const hasFilterParams = LANDING_FILTER_KEYS.some((key) => {
      const value = params.get(key);
      return value !== null && String(value).trim() !== "";
    });
    if (hasFilterParams) { setAppView("practice"); return; }

    // 4. Default
    setAppView("landing");
  }, [clearFilters, setAppView, shouldOpenFilterOnEnter]);

  // Popstate handler for browser Back/Forward (mode transitions only).
  useEffect(() => {
    const handlePopState = () => setAppView(resolveAppViewFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setAppView]);

  // Write mode+stage to URL via replaceState so landing mode changes
  // do not create extra browser-history entries.
  const writeModeParam = useCallback((mode, stage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    if (stage) {
      params.set("stage", stage);
    } else {
      params.delete("stage");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  // Write stage only via replaceState (no new history entry).
  const writeStageParam = useCallback((stage) => {
    const params = new URLSearchParams(window.location.search);
    if (stage) {
      params.set("stage", stage);
    } else {
      params.delete("stage");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  // Callback given to LandingShell's ModeSelectionPage.
  const handleModeStart = useCallback((mode) => {
    if (mode === "random") {
      trackEvent("start_random_practice", { mode: "random", source: "landing" });
      void loadPracticeShell();
      clearFilters();
      shouldOpenFilterOnEnter.current = false;
      setAppView("practice");
      writeModeParam("random");
      void loadQuestions();
      return;
    }
    if (mode === "targeted") {
      trackEvent("start_targeted_practice", { mode: "targeted", source: "landing" });
      void loadPracticeShell();
      shouldOpenFilterOnEnter.current = true;
      setAppView("practice");
      writeModeParam("targeted");
      void loadQuestions();
      return;
    }
    if (mode === "resume") {
      trackEvent("resume_practice", { mode: "resume", source: "landing" });
      void loadPracticeShell();
      shouldOpenFilterOnEnter.current = false;
      setAppView("practice");
      writeModeParam("resume");
      void loadQuestions();
      return;
    }
    if (mode === "mock" && MOCK_TEST_MODE_ENABLED) {
      void loadMockShell();
      shouldOpenFilterOnEnter.current = false;
      setAppView("mockSetup");
      writeModeParam("mock", "setup");
      void loadQuestions({ fullBank: true });
      return;
    }
  }, [clearFilters, loadQuestions, setAppView, shouldOpenFilterOnEnter, writeModeParam]);

  const handleResumePractice = useCallback(() => {
    handleModeStart("resume");
  }, [handleModeStart]);

  // Go-home handler passed to PracticeShell / MockShell.
  const handleGoHome = useCallback(() => {
    setAppView("landing");
    const params = new URLSearchParams(window.location.search);
    params.delete("mode");
    params.delete("stage");
    params.delete("question");
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [setAppView]);

  // Stage change handler for mock setup → exam transitions
  const handleMockStageChange = useCallback((stage) => {
    if (stage === "exam") {
      setAppView("mockExam");
      writeStageParam("exam");
    } else if (stage === "setup") {
      setAppView("mockSetup");
      writeStageParam("setup");
    }
  }, [setAppView, writeStageParam]);

  // ── Render exactly one shell ──
  if (appView === "landing") {
    return (
      <LandingShell
        onModeStart={handleModeStart}
        onResumePractice={handleResumePractice}
        hasPriorProgress={hasPriorProgress}
        questionBankManifest={questionBankManifest}
        manifestLoading={manifestLoading}
        manifestError={manifestError}
      />
    );
  }

  if (appView === "mockSetup" || appView === "mockExam") {
    return (
      <Suspense fallback={<ShellLoader label="Loading mock interface..." />}>
        <MockShell
          onExit={handleGoHome}
          stage={appView === "mockExam" ? "exam" : "setup"}
          onStageChange={handleMockStageChange}
        />
      </Suspense>
    );
  }

  // Default: practice
  return (
    <Suspense fallback={<ShellLoader label="Preparing practice..." />}>
      <PracticeShell
        loading={loading}
        error={error}
        loadQuestions={loadQuestions}
        onGoHome={handleGoHome}
        shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
      />
    </Suspense>
  );
};

function App() {
  const [loading, setLoading] = useState(() => resolveAppViewFromUrl() !== "landing");
  const [error, setError] = useState("");
  const [appView, setAppView] = useState(() => resolveAppViewFromUrl());
  const [questionDataRevision, setQuestionDataRevision] = useState(0);
  const [questionBankManifest, setQuestionBankManifest] = useState(() => QuestionBankManifestService.manifest);
  const [manifestLoading, setManifestLoading] = useState(() => !QuestionBankManifestService.loaded);
  const [manifestError, setManifestError] = useState(() => QuestionBankManifestService.loadError || "");
  const shouldOpenFilterOnEnter = useRef(false);
  const questionLoadPromiseRef = useRef(null);

  const [hasPriorProgress] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const solved = JSON.parse(localStorage.getItem("gate_qa_solved_questions") || "[]");
      const bookmarked = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions") || "[]");
      return (Array.isArray(solved) ? solved.length : 0) > 0 ||
        (Array.isArray(bookmarked) ? bookmarked.length : 0) > 0;
    } catch { return false; }
  });

  const loadQuestionBankManifest = useCallback(async () => {
    if (QuestionBankManifestService.loaded && QuestionBankManifestService.manifest) {
      setQuestionBankManifest(QuestionBankManifestService.manifest);
      setManifestError("");
      setManifestLoading(false);
      return QuestionBankManifestService.manifest;
    }

    setManifestLoading(true);
    try {
      const manifest = await QuestionBankManifestService.init();
      setQuestionBankManifest(manifest);
      setManifestError("");
      return manifest;
    } catch (err) {
      setManifestError(err.message || "Unable to load question bank summary.");
      return null;
    } finally {
      setManifestLoading(false);
    }
  }, []);

  const loadQuestions = useCallback(async ({ fullBank = false } = {}) => {
    const hasRequiredQuestions = QuestionService.loaded
      && (!fullBank || QuestionService.loadMode === "full");
    if (hasRequiredQuestions && AnswerService.loaded) {
      setError("");
      setLoading(false);
      return;
    }

    if (
      questionLoadPromiseRef.current
      && (!fullBank || questionLoadPromiseRef.current.fullBank)
    ) {
      return questionLoadPromiseRef.current.promise;
    }

    setLoading(true);
    setError("");
    const loadPromise = (async () => {
      try {
        await Promise.all([
          QuestionService.init({ fullBank }),
          AnswerService.init(),
        ]);
        setQuestionDataRevision((value) => value + 1);
      } catch (err) {
        setError(err.message || "Unable to load questions.");
      } finally {
        setLoading(false);
        if (questionLoadPromiseRef.current?.promise === loadPromise) {
          questionLoadPromiseRef.current = null;
        }
      }
    })();
    questionLoadPromiseRef.current = {
      promise: loadPromise,
      fullBank,
    };

    return loadPromise;
  }, []);

  useEffect(() => {
    void loadQuestionBankManifest();
  }, [loadQuestionBankManifest]);

  useEffect(() => {
    if (appView === "landing") {
      setLoading(false);
      return;
    }
    void loadQuestions({ fullBank: appView === "mockSetup" || appView === "mockExam" });
  }, [appView, loadQuestions]);

  useEffect(() => {
    if (appView === "landing") pageview("Landing");
    else if (appView === "practice") pageview("Practice");
    else if (appView === "mockSetup") pageview("MockSetup");
    else if (appView === "mockExam") pageview("MockExam");
  }, [appView]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      <FilterProvider
        initialManifest={questionBankManifest}
        questionDataRevision={questionDataRevision}
      >
        <SessionProvider>
          <ViewSwitch
            loading={loading}
            error={error}
            loadQuestions={loadQuestions}
            appView={appView}
            setAppView={setAppView}
            shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
            hasPriorProgress={hasPriorProgress}
            questionBankManifest={questionBankManifest}
            manifestLoading={manifestLoading}
            manifestError={manifestError}
          />
        </SessionProvider>
      </FilterProvider>
    </div>
  );
}

export default App;
