export const HOME_ROUTE = "/";
export const PRACTICE_ROUTE = "/practice";
export const INSIGHTS_ROUTE = "/insights";
export const HIGH_PRIORITY_TOPICS_ROUTE = "/insights/topics";
export const MOCK_ROUTE = "/mock";
export const MOCK_HISTORY_ROUTE = "/history/mock-tests";
export const USER_MANUAL_ROUTE = "/manual";
export const PAGE_QUERY_KEY = "page";

export const FILTER_QUERY_KEYS = [
  "years",
  "subjects",
  "subtopics",
  "range",
  "types",
  "search",
  "hideSolved",
  "showOnlySolved",
  "showOnlyBookmarked",
];

export const PRACTICE_QUERY_KEYS = [...FILTER_QUERY_KEYS, PAGE_QUERY_KEY];

export const buildSolvePath = (questionUid = "") => {
  const normalizedUid = String(questionUid || "").trim();
  return `${PRACTICE_ROUTE}/question/${encodeURIComponent(normalizedUid)}`;
};

export const extractKnownPracticeSearch = (search = "", { includePage = true } = {}) => {
  const source = new URLSearchParams(search);
  const next = new URLSearchParams();

  PRACTICE_QUERY_KEYS.forEach((key) => {
    if (!includePage && key === PAGE_QUERY_KEY) {
      return;
    }

    const value = source.get(key);
    if (value !== null && String(value).trim() !== "") {
      next.set(key, value);
    }
  });

  const query = next.toString();
  return query ? `?${query}` : "";
};

export const parsePageParam = (search = "", fallback = 1) => {
  const params = new URLSearchParams(search);
  const rawPage = Number.parseInt(String(params.get(PAGE_QUERY_KEY) || ""), 10);
  if (!Number.isFinite(rawPage) || rawPage < 1) {
    return fallback;
  }
  return rawPage;
};

export const writePageParam = (search = "", page = 1) => {
  const params = new URLSearchParams(search);
  if (page <= 1) {
    params.delete(PAGE_QUERY_KEY);
  } else {
    params.set(PAGE_QUERY_KEY, String(page));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getLegacyRedirectTarget = ({
  pathname = "/",
  search = "",
  mockModeEnabled = false,
  resumeRoute = "",
} = {}) => {
  const isHomePath = pathname === HOME_ROUTE;
  const params = new URLSearchParams(search);
  const questionUid = String(params.get("question") || "").trim();
  const mode = String(params.get("mode") || "").trim().toLowerCase();

  if (questionUid) {
    return {
      pathname: buildSolvePath(questionUid),
      search: extractKnownPracticeSearch(search, { includePage: true }),
      kind: "question",
    };
  }

  if (pathname === PRACTICE_ROUTE && params.get("question")) {
    const uid = String(params.get("question") || "").trim();
    return {
      pathname: buildSolvePath(uid),
      search: extractKnownPracticeSearch(search, { includePage: true }),
      kind: "question",
    };
  }

  if (mode === "mock") {
    if (!isHomePath) {
      return null;
    }
    if (!mockModeEnabled) {
      return { pathname: HOME_ROUTE, search: "", kind: "mock-disabled" };
    }
    const stage = String(params.get("stage") || "").trim().toLowerCase();
    const mockSearch = stage ? `?stage=${encodeURIComponent(stage)}` : "";
    return { pathname: MOCK_ROUTE, search: mockSearch, kind: "mock" };
  }

  if (mode === "resume") {
    if (!isHomePath) {
      return null;
    }
    if (resumeRoute) {
      const [resumePathname, resumeSearch = ""] = resumeRoute.split("?");
      return {
        pathname: resumePathname || HOME_ROUTE,
        search: resumeSearch ? `?${resumeSearch}` : "",
        kind: "resume",
      };
    }
    return {
      pathname: PRACTICE_ROUTE,
      search: extractKnownPracticeSearch(search, { includePage: true }),
      kind: "resume",
    };
  }

  if (mode === "random") {
    if (!isHomePath) {
      return null;
    }
    return { pathname: HOME_ROUTE, search: "", kind: "random" };
  }

  if (mode === "targeted" || mode) {
    if (!isHomePath) {
      return null;
    }
    return {
      pathname: PRACTICE_ROUTE,
      search: extractKnownPracticeSearch(search, { includePage: true }),
      kind: "practice",
    };
  }

  const practiceSearch = extractKnownPracticeSearch(search, { includePage: true });
  if (practiceSearch && isHomePath) {
    return {
      pathname: PRACTICE_ROUTE,
      search: practiceSearch,
      kind: "practice",
    };
  }

  return null;
};
