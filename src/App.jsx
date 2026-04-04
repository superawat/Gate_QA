import { MathJaxContext } from "better-react-mathjax";
import { useCallback, useEffect, useRef, useState } from "react";

import LandingShell from "./shells/LandingShell";
import PracticeShell from "./shells/PracticeShell";
import MockShell from "./shells/MockShell";
import { FilterProvider, useFilterState, useFilterActions } from "./contexts/FilterContext";
import { SessionProvider } from "./contexts/SessionContext";
import { QuestionService } from "./services/QuestionService";
import { AnswerService } from "./services/AnswerService";
import { useGoatCounterSPA } from "./hooks/useGoatCounterSPA";
import { pageview, trackEvent } from "./utils/analytics";
import { MOCK_TEST_MODE_ENABLED } from "./constants/featureFlags";

const LANDING_FILTER_KEYS = ["years", "subjects", "subtopics", "range", "types"];

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
}) => {
  const { allQuestions, isInitialized } = useFilterState();
  const { clearFilters } = useFilterActions();
  const hasResolvedAppView = useRef(false);

  // Mount-time resolution (same strict priority as resolveAppViewFromUrl,
  // but with side-effects like clearFilters for random mode).
  useEffect(() => {
    if (!isInitialized || allQuestions.length === 0 || hasResolvedAppView.current) return;
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
  }, [allQuestions, clearFilters, isInitialized, setAppView, shouldOpenFilterOnEnter]);

  // Popstate handler for browser Back/Forward (mode transitions only).
  useEffect(() => {
    const handlePopState = () => setAppView(resolveAppViewFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setAppView]);

  // Write mode+stage to URL via pushState (creates one history entry per mode transition).
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
    window.history.pushState({}, "", newUrl);
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
      clearFilters();
      shouldOpenFilterOnEnter.current = false;
      setAppView("practice");
      writeModeParam("random");
      return;
    }
    if (mode === "targeted") {
      trackEvent("start_targeted_practice", { mode: "targeted", source: "landing" });
      shouldOpenFilterOnEnter.current = true;
      setAppView("practice");
      writeModeParam("targeted");
      return;
    }
    if (mode === "resume") {
      trackEvent("resume_practice", { mode: "resume", source: "landing" });
      shouldOpenFilterOnEnter.current = false;
      setAppView("practice");
      writeModeParam("resume");
      return;
    }
    if (mode === "mock" && MOCK_TEST_MODE_ENABLED) {
      shouldOpenFilterOnEnter.current = false;
      setAppView("mockSetup");
      writeModeParam("mock", "setup");
      return;
    }
  }, [clearFilters, setAppView, shouldOpenFilterOnEnter, writeModeParam]);

  const handleResumePractice = useCallback(() => {
    handleModeStart("resume");
  }, [handleModeStart]);

  // Go-home handler passed to PracticeShell / MockShell.
  const handleGoHome = useCallback(() => {
    setAppView("landing");
    const params = new URLSearchParams(window.location.search);
    params.delete("mode");
    params.delete("stage");
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
      />
    );
  }

  if (appView === "mockSetup" || appView === "mockExam") {
    return (
      <MockShell
        onExit={handleGoHome}
        stage={appView === "mockExam" ? "exam" : "setup"}
        onStageChange={handleMockStageChange}
      />
    );
  }

  // Default: practice
  return (
    <PracticeShell
      loading={loading}
      error={error}
      loadQuestions={loadQuestions}
      onGoHome={handleGoHome}
      shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
    />
  );
};

function App() {
  useGoatCounterSPA();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appView, setAppView] = useState("landing");
  const shouldOpenFilterOnEnter = useRef(false);

  const [hasPriorProgress] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const solved = JSON.parse(localStorage.getItem("gate_qa_solved_questions") || "[]");
      const bookmarked = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions") || "[]");
      return (Array.isArray(solved) ? solved.length : 0) > 0 ||
        (Array.isArray(bookmarked) ? bookmarked.length : 0) > 0;
    } catch { return false; }
  });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await QuestionService.init();
      await AnswerService.init();
    } catch (err) {
      setError(err.message || "Unable to load questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  useEffect(() => {
    if (appView === "landing") pageview("Landing");
    else if (appView === "practice") pageview("Practice");
    else if (appView === "mockSetup") pageview("MockSetup");
    else if (appView === "mockExam") pageview("MockExam");
  }, [appView]);

  return (
    <MathJaxContext>
      <div className="flex flex-col h-screen max-h-screen bg-gray-50">
        <FilterProvider>
          <SessionProvider>
            <ViewSwitch
              loading={loading}
              error={error}
              loadQuestions={loadQuestions}
              appView={appView}
              setAppView={setAppView}
              shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
              hasPriorProgress={hasPriorProgress}
            />
          </SessionProvider>
        </FilterProvider>
      </div>
    </MathJaxContext>
  );
}

export default App;
