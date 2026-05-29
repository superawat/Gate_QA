import {
  HIGH_PRIORITY_TOPICS_ROUTE,
  INSIGHTS_ROUTE,
  MOCK_ROUTE,
  PRACTICE_ROUTE,
  USER_MANUAL_ROUTE,
} from "./routes";

const createRouteModule = (loader) => {
  let loadPromise = null;

  const load = () => {
    if (!loadPromise) {
      loadPromise = loader().catch((error) => {
        loadPromise = null;
        throw error;
      });
    }

    return loadPromise;
  };

  const preload = () => load().catch(() => null);

  return { load, preload };
};

const exploreRoute = createRouteModule(() => import("../pages/ExplorePage"));
const insightsRoute = createRouteModule(() => import("../pages/InsightsPage"));
const solveRoute = createRouteModule(() => import("../pages/SolvePage"));
const mockRoute = createRouteModule(() => import("../shells/MockShell"));
const userManualRoute = createRouteModule(() => import("../pages/UserManualPage"));
const highPriorityTopicsRoute = createRouteModule(() => import("../pages/HighPriorityTopicsPage"));

export const loadExploreRoute = exploreRoute.load;
export const loadInsightsRoute = insightsRoute.load;
export const loadSolveRoute = solveRoute.load;
export const loadMockRoute = mockRoute.load;
export const loadUserManualRoute = userManualRoute.load;
export const loadHighPriorityTopicsRoute = highPriorityTopicsRoute.load;

export const preloadExploreRoute = exploreRoute.preload;
export const preloadInsightsRoute = insightsRoute.preload;
export const preloadSolveRoute = solveRoute.preload;
export const preloadMockRoute = mockRoute.preload;
export const preloadUserManualRoute = userManualRoute.preload;
export const preloadHighPriorityTopicsRoute = highPriorityTopicsRoute.preload;

const preloadMathRuntime = () => (
  import("../components/Math/MathRuntime")
    .then((module) => (
      typeof module.preloadMathRuntime === "function"
        ? module.preloadMathRuntime()
        : null
    ))
    .catch(() => null)
);

const preloadAll = (preloaders) => (
  Promise.all(preloaders.map((preload) => preload())).then(() => null).catch(() => null)
);

export const preloadSolveExperience = () => preloadAll([
  preloadSolveRoute,
  preloadMathRuntime,
]);

export const preloadPracticeStartExperience = () => preloadAll([
  preloadExploreRoute,
  preloadSolveExperience,
]);

export const preloadMockExperience = () => preloadAll([
  preloadMockRoute,
  preloadMathRuntime,
]);

export const preloadRouteByPath = (path = "") => {
  const pathname = String(path || "").split("?")[0];

  if (pathname === HIGH_PRIORITY_TOPICS_ROUTE || pathname.startsWith(`${HIGH_PRIORITY_TOPICS_ROUTE}/`)) {
    return preloadHighPriorityTopicsRoute();
  }

  if (pathname === `${PRACTICE_ROUTE}/question` || pathname.startsWith(`${PRACTICE_ROUTE}/question/`)) {
    return preloadSolveExperience();
  }

  if (pathname === PRACTICE_ROUTE || pathname.startsWith(`${PRACTICE_ROUTE}/`)) {
    return preloadExploreRoute();
  }

  if (pathname === INSIGHTS_ROUTE || pathname.startsWith(`${INSIGHTS_ROUTE}/`)) {
    return preloadInsightsRoute();
  }

  if (pathname === USER_MANUAL_ROUTE || pathname.startsWith(`${USER_MANUAL_ROUTE}/`)) {
    return preloadUserManualRoute();
  }

  if (pathname === MOCK_ROUTE || pathname.startsWith(`${MOCK_ROUTE}/`)) {
    return preloadMockExperience();
  }

  return Promise.resolve(null);
};
