import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { FilterProvider, useFilterState, useFilterActions } from "./contexts/FilterContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";
import { QuestionService } from "./services/QuestionService";
import { AnswerService } from "./services/AnswerService";
import { QuestionBankManifestService } from "./services/QuestionBankManifestService";
import LoadingState from "./components/Loaders/LoadingState";
import MockCatalogLoaderCard from "./components/Loaders/MockCatalogLoaderCard";
import { pageview, trackEvent } from "./utils/analytics";
import { readLastSession } from "./utils/lastSession";
import {
  buildSolvePath,
  getLegacyRedirectTarget,
  HOME_ROUTE,
  INSIGHTS_ROUTE,
  HIGH_PRIORITY_TOPICS_ROUTE,
  MOCK_HISTORY_ROUTE,
  MOCK_ROUTE,
  PRACTICE_ROUTE,
  USER_MANUAL_ROUTE,
} from "./utils/routes";
import { MOCK_TEST_MODE_ENABLED } from "./constants/featureFlags";

const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const SolvePage = lazy(() => import("./pages/SolvePage"));
const MockShell = lazy(() => import("./shells/MockShell"));
const UserManualPage = lazy(() => import("./pages/UserManualPage"));
const HighPriorityTopicsPage = lazy(() => import("./pages/HighPriorityTopicsPage"));

const RouteLoader = ({ label = "Loading..." }) => (
  <div className="min-h-screen bg-[color:var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl justify-center rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-10 shadow-[var(--shadow-card)]">
      <LoadingState
        label={label}
        size="lg"
        className="min-h-[320px]"
        textClassName="text-sm text-slate-500"
      />
    </div>
  </div>
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return null;
};

// ── Isolated Mock Test Branch ──────────────────────────────────────────────
// Renders outside the practice provider tree so mock test navigation,
// filters, and session state never interfere with practice-mode effects.
const MockBranch = ({ loadQuestions, questionBankManifest, questionDataRevision }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const stage = new URLSearchParams(location.search).get("stage") === "exam" ? "exam" : "setup";

  // Load questions (full bank) when entering the mock route
  useEffect(() => {
    void loadQuestions({ fullBank: true });
  }, [loadQuestions]);

  useEffect(() => {
    pageview("Mock");
  }, []);

  const handleExit = useCallback(() => {
    navigate(HOME_ROUTE);
  }, [navigate]);

  const handleStageChange = useCallback((nextStage) => {
    navigate(
      {
        pathname: MOCK_ROUTE,
        search: nextStage === "exam" ? "?stage=exam" : "?stage=setup",
      },
      { replace: true }
    );
  }, [navigate]);

  if (!MOCK_TEST_MODE_ENABLED) {
    return <Navigate to={HOME_ROUTE} replace />;
  }

  return (
      <FilterProvider
        initialManifest={questionBankManifest}
        questionDataRevision={questionDataRevision}
      >
        <ErrorBoundary>
          <Suspense fallback={<MockCatalogLoaderCard />}>
            <MockShell
              onExit={handleExit}
              stage={stage}
              onStageChange={handleStageChange}
            />
          </Suspense>
        </ErrorBoundary>
      </FilterProvider>
  );
};

// ── Legacy Navigation Handler ──────────────────────────────────────────────
const LegacyNavigationHandler = ({ loadQuestions, resumeRoute = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allQuestions } = useFilterState();
  const { clearFilters } = useFilterActions();
  const { startRandomSession } = useSession();
  const lastHandledKeyRef = useRef("");

  useEffect(() => {
    const redirectTarget = getLegacyRedirectTarget({
      pathname: location.pathname,
      search: location.search,
      mockModeEnabled: MOCK_TEST_MODE_ENABLED,
      resumeRoute,
    });

    if (!redirectTarget) {
      lastHandledKeyRef.current = "";
      return;
    }

    const redirectKey = `${location.pathname}${location.search}`;
    if (lastHandledKeyRef.current === redirectKey) {
      return;
    }
    lastHandledKeyRef.current = redirectKey;

    if (redirectTarget.kind === "random") {
      let active = true;

      (async () => {
        await loadQuestions();
        if (!active) {
          return;
        }

        clearFilters();
        const firstQuestion = startRandomSession(allQuestions);
        if (firstQuestion?.question_uid) {
          navigate(
            {
              pathname: buildSolvePath(firstQuestion.question_uid),
              search: "",
            },
            { replace: true }
          );
          return;
        }

        navigate(
          {
            pathname: PRACTICE_ROUTE,
            search: "",
          },
          { replace: true }
        );
      })();

      return () => {
        active = false;
      };
    }

    navigate(
      {
        pathname: redirectTarget.pathname,
        search: redirectTarget.search,
      },
      { replace: true }
    );

    return undefined;
  }, [allQuestions, clearFilters, loadQuestions, location.pathname, location.search, navigate, resumeRoute, startRandomSession]);

  return null;
};

// ── Practice Routes (home, explore, solve, mock-history) ───────────────────
const PracticeRoutes = ({
  loading,
  error,
  loadQuestions,
  questionBankManifest,
  manifestLoading,
  manifestError,
  hasPriorProgress,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allQuestions } = useFilterState();
  const { clearFilters } = useFilterActions();
  const { startRandomSession } = useSession();
  const lastSession = readLastSession();
  const resumeRoute = typeof lastSession?.route === "string" ? lastSession.route : "";
  const hasResumeRoute = !!resumeRoute || hasPriorProgress;

  const handleResumePractice = useCallback(() => {
    const session = readLastSession();
    trackEvent("resume", {
      source: location.pathname === HOME_ROUTE ? "home" : "header",
    });

    if (typeof session?.route === "string" && session.route.trim()) {
      const [pathname, rawSearch = ""] = session.route.split("?");
      navigate(
        {
          pathname: pathname || PRACTICE_ROUTE,
          search: rawSearch ? `?${rawSearch}` : "",
        }
      );
      return;
    }

    navigate(PRACTICE_ROUTE);
  }, [location.pathname, navigate]);

  const handleStartRandomPractice = useCallback(async () => {
    trackEvent("home_cta", { target: "random", source: "home" });
    await loadQuestions();
    clearFilters();
    const firstQuestion = startRandomSession(allQuestions);

    if (firstQuestion?.question_uid) {
      navigate({
        pathname: buildSolvePath(firstQuestion.question_uid),
        search: "",
      });
      return;
    }

    navigate(PRACTICE_ROUTE);
  }, [allQuestions, clearFilters, loadQuestions, navigate, startRandomSession]);

  const handleExplorePractice = useCallback(() => {
    trackEvent("home_cta", { target: "explore", source: "home" });
    const session = readLastSession();
    navigate({
      pathname: PRACTICE_ROUTE,
      search: session?.exploreSearch || "",
    });
  }, [navigate]);

  const handleStartMockTest = useCallback(() => {
    trackEvent("home_cta", { target: "mock", source: "home" });
    navigate({
      pathname: MOCK_ROUTE,
      search: "?stage=setup",
    });
  }, [navigate]);

  const handleOpenMockHistory = useCallback(() => {
    trackEvent("home_cta", { target: "mock_history", source: "home" });
    navigate(`${INSIGHTS_ROUTE}?tab=mock-history`);
  }, [navigate]);

  const handleOpenInsights = useCallback(() => {
    trackEvent("home_cta", { target: "insights", source: "home" });
    navigate(INSIGHTS_ROUTE);
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <LegacyNavigationHandler loadQuestions={loadQuestions} resumeRoute={resumeRoute} />

      <Routes>
        <Route
          path={HOME_ROUTE}
          element={(
            <ErrorBoundary>
              <HomePage
                questionBankManifest={questionBankManifest}
                manifestLoading={manifestLoading}
                manifestError={manifestError}
                hasResumeRoute={hasResumeRoute}
                lastSession={lastSession}
                mockModeEnabled={MOCK_TEST_MODE_ENABLED}
                onStartRandomPractice={handleStartRandomPractice}
                onExplorePractice={handleExplorePractice}
                onOpenInsights={handleOpenInsights}
                onOpenMockHistory={handleOpenMockHistory}
                onStartMockTest={handleStartMockTest}
                onResumePractice={handleResumePractice}
              />
            </ErrorBoundary>
          )}
        />
        <Route
          path={PRACTICE_ROUTE}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader label="Loading Explore..." />}>
                <ExplorePage
                  loading={loading}
                  error={error}
                  loadQuestions={loadQuestions}
                  hasResumeRoute={hasResumeRoute}
                  onResumePractice={handleResumePractice}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={`${PRACTICE_ROUTE}/question/:questionUid`}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader label="Loading Solve..." />}>
                <SolvePage
                  loading={loading}
                  error={error}
                  loadQuestions={loadQuestions}
                  hasResumeRoute={hasResumeRoute}
                  onResumePractice={handleResumePractice}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={INSIGHTS_ROUTE}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader label="Loading Insights..." />}>
                <InsightsPage
                  questionBankManifest={questionBankManifest}
                  hasResumeRoute={hasResumeRoute}
                  onStartMockTest={handleStartMockTest}
                  onResumePractice={handleResumePractice}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={USER_MANUAL_ROUTE}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader label="Loading Manual..." />}>
                <UserManualPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={HIGH_PRIORITY_TOPICS_ROUTE}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader label="Loading Topics..." />}>
                <HighPriorityTopicsPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />

        <Route
          path={MOCK_HISTORY_ROUTE}
          element={<Navigate to={`${INSIGHTS_ROUTE}?tab=mock-history`} replace />}
        />
        <Route path="*" element={<Navigate to={HOME_ROUTE} replace />} />
      </Routes>
    </>
  );
};

// ── App Runtime (top-level state + branch split) ───────────────────────────
const AppRuntime = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(() => (
    location.pathname.startsWith(PRACTICE_ROUTE) || location.pathname.startsWith(MOCK_ROUTE)
  ));
  const [error, setError] = useState("");
  const [questionDataRevision, setQuestionDataRevision] = useState(0);
  const [questionBankManifest, setQuestionBankManifest] = useState(() => QuestionBankManifestService.manifest);
  const [manifestLoading, setManifestLoading] = useState(() => !QuestionBankManifestService.loaded);
  const [manifestError, setManifestError] = useState(() => QuestionBankManifestService.loadError || "");
  const questionLoadPromiseRef = useRef(null);

  const [hasPriorProgress] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const solved = JSON.parse(localStorage.getItem("gate_qa_solved_questions") || "[]");
      const bookmarked = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions") || "[]");
      return (Array.isArray(solved) ? solved.length : 0) > 0
        || (Array.isArray(bookmarked) ? bookmarked.length : 0) > 0;
    } catch {
      return false;
    }
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
    } catch (manifestLoadError) {
      setManifestError(manifestLoadError.message || "Unable to load question bank summary.");
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
      } catch (questionLoadError) {
        setError(questionLoadError.message || "Unable to load questions.");
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

  // ── Top-level branch: /mock gets its own isolated tree ─────────────────
  const isMockRoute = location.pathname === MOCK_ROUTE
    || location.pathname.startsWith(`${MOCK_ROUTE}/`);
  // Exclude /history/mock-tests — that goes through the practice tree
  const isIsolatedMockRoute = isMockRoute
    && !location.pathname.startsWith(MOCK_HISTORY_ROUTE);

  // Load questions automatically only for practice routes (mock branch handles its own)
  useEffect(() => {
    if (isIsolatedMockRoute) {
      return;
    }

    const needsQuestionData = location.pathname.startsWith(PRACTICE_ROUTE);
    if (!needsQuestionData) {
      setLoading(false);
      return;
    }

    void loadQuestions();
  }, [isIsolatedMockRoute, loadQuestions, location.pathname]);

  // Pageview tracking for non-mock routes (mock branch tracks its own)
  useEffect(() => {
    if (isIsolatedMockRoute) {
      return;
    }

    if (location.pathname === HOME_ROUTE) {
      pageview("Home");
      return;
    }
    if (location.pathname === PRACTICE_ROUTE) {
      pageview("Explore");
      return;
    }
    if (location.pathname.startsWith(`${PRACTICE_ROUTE}/question/`)) {
      pageview("Solve");
      return;
    }
    if (location.pathname === INSIGHTS_ROUTE) {
      pageview("Insights");
      return;
    }
    if (location.pathname === USER_MANUAL_ROUTE) {
      pageview("UserManual");
      return;
    }
    if (location.pathname.startsWith(MOCK_HISTORY_ROUTE)) {
      pageview("MockHistory");
    }
  }, [isIsolatedMockRoute, location.pathname]);

  if (isIsolatedMockRoute) {
    return (
      <div className="min-h-screen bg-[color:var(--color-bg)]">
        <MockBranch
          loadQuestions={loadQuestions}
          questionBankManifest={questionBankManifest}
          questionDataRevision={questionDataRevision}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <FilterProvider
        initialManifest={questionBankManifest}
        questionDataRevision={questionDataRevision}
      >
        <SessionProvider>
          <PracticeRoutes
            loading={loading}
            error={error}
            loadQuestions={loadQuestions}
            questionBankManifest={questionBankManifest}
            manifestLoading={manifestLoading}
            manifestError={manifestError}
            hasPriorProgress={hasPriorProgress}
          />
        </SessionProvider>
      </FilterProvider>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRuntime />
    </BrowserRouter>
  );
}

export default App;
