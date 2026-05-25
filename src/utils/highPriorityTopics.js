import { QuestionService } from "../services/QuestionService";

const highPriorityStaticModules = import.meta.glob("../generated/highPriorityStaticData.js", {
  eager: true,
});
const highPriorityStaticData = highPriorityStaticModules["../generated/highPriorityStaticData.js"] || {};

export const STATIC_TOPIC_FREQUENCIES = Array.isArray(highPriorityStaticData.STATIC_TOPIC_FREQUENCIES)
  ? highPriorityStaticData.STATIC_TOPIC_FREQUENCIES
  : [];

export const SUBJECT_SUMMARIES = Array.isArray(highPriorityStaticData.SUBJECT_SUMMARIES)
  ? highPriorityStaticData.SUBJECT_SUMMARIES
  : [];

export const HIGH_PRIORITY_TOPICS_SOURCE_URL =
  "https://gateoverflow.in/marks-distribution?type=subject-chart";
export const HIGH_PRIORITY_WINDOW_YEARS = 20;
export const RECENT_TREND_YEARS = 5;

const UNKNOWN_SUBJECTS = new Set(["unknown"]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeTag = (tag = "") => (
  String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
);

export const inferQuestionMarks = (question = {}) => {
  const answerMarks = parseNumber(question?.answer_meta?.marks, NaN);
  if (Number.isFinite(answerMarks) && answerMarks > 0) {
    return answerMarks;
  }

  const tags = Array.isArray(question.tagsRaw)
    ? question.tagsRaw
    : Array.isArray(question.tags)
      ? question.tags
      : [];
  const normalizedTags = tags.map(normalizeTag);

  if (normalizedTags.some((tag) => /(^|-)two(-|)marks?($|-)/.test(tag))) {
    return 2;
  }
  if (normalizedTags.some((tag) => /(^|-)one(-|)marks?($|-)/.test(tag))) {
    return 1;
  }

  return 1;
};

const normalizeQuestion = (rawQuestion = {}) => {
  if (rawQuestion?.canonical?.isIndexEntry || rawQuestion?.exam) {
    return rawQuestion;
  }
  if (rawQuestion?.question) {
    return QuestionService.normalizeQuestion(rawQuestion);
  }
  return QuestionService.hydrateIndexedQuestion(rawQuestion);
};

const createYearSeries = (years = []) => (
  years.map((year) => ({
    year,
    questions: 0,
    marks: 0,
  }))
);

const createBucket = ({ key, label, subjectSlug = "", subjectLabel = "", type, years }) => ({
  key,
  label,
  subjectSlug,
  subjectLabel,
  type,
  questions: 0,
  totalMarks: 0,
  yearSeries: createYearSeries(years),
  paperKeys: new Set(),
});

const getOrCreateBucket = (map, config) => {
  if (!map.has(config.key)) {
    map.set(config.key, createBucket(config));
  }
  return map.get(config.key);
};

const addQuestionToBucket = ({ bucket, year, marks, paperKey }) => {
  bucket.questions += 1;
  bucket.totalMarks += marks;
  if (paperKey) {
    bucket.paperKeys.add(paperKey);
  }

  const yearEntry = bucket.yearSeries.find((entry) => entry.year === year);
  if (yearEntry) {
    yearEntry.questions += 1;
    yearEntry.marks += marks;
  }
};

const finalizeBaseBucket = (bucket, { years }) => {
  const activeYears = bucket.yearSeries.filter((entry) => entry.questions > 0).length;
  const recentYears = new Set(years.slice(-RECENT_TREND_YEARS));
  const previousYears = new Set(years.slice(-RECENT_TREND_YEARS * 2, -RECENT_TREND_YEARS));
  const recentMarks = bucket.yearSeries
    .filter((entry) => recentYears.has(entry.year))
    .reduce((sum, entry) => sum + entry.marks, 0);
  const previousMarks = bucket.yearSeries
    .filter((entry) => previousYears.has(entry.year))
    .reduce((sum, entry) => sum + entry.marks, 0);
  const recentAverageMarks = Number((recentMarks / RECENT_TREND_YEARS).toFixed(2));
  const previousAverageMarks = Number((previousMarks / RECENT_TREND_YEARS).toFixed(2));
  const trendDeltaMarks = Number((recentAverageMarks - previousAverageMarks).toFixed(2));
  const trendDirection = trendDeltaMarks > 0.25
    ? "up"
    : trendDeltaMarks < -0.25
      ? "down"
      : "flat";

  return {
    ...bucket,
    baselineCount: bucket.baselineCount || bucket.questions || 0,
    paperKeys: Array.from(bucket.paperKeys).sort(),
    paperCount: bucket.paperKeys.size,
    activeYears,
    consistencyRate: years.length > 0 ? Number((activeYears / years.length).toFixed(4)) : 0,
    recentMarks,
    previousMarks,
    recentAverageMarks,
    previousAverageMarks,
    trendDeltaMarks,
    trendDirection,
    yearSeries: bucket.yearSeries.map((entry) => ({
      ...entry,
      marks: Number(entry.marks.toFixed(2)),
    })),
  };
};

const getPriorityTier = (score, rank) => {
  if (rank <= 5 || score >= 78) {
    return "Core Priority";
  }
  if (score >= 58) {
    return "High Yield";
  }
  if (score >= 38) {
    return "Watchlist";
  }
  return "Occasional";
};

const scoreAndRankBuckets = (items = []) => {
  const maxBaseline = Math.max(1, ...items.map((item) => item.baselineCount || 1));
  const maxRecentAverage = Math.max(1, ...items.map((item) => item.recentAverageMarks));

  return items
    .map((item) => {
      const baselineCount = item.baselineCount || item.questions || 0;
      const baselineScore = (baselineCount / maxBaseline) * 55;
      const consistencyScore = item.consistencyRate * 25;
      const recentScore = (item.recentAverageMarks / maxRecentAverage) * 15;
      const trendScore = item.trendDirection === "up"
        ? 5
        : item.trendDirection === "flat"
          ? 2
          : -2;
      return {
        ...item,
        importanceScore: Math.round(clamp(baselineScore + consistencyScore + recentScore + trendScore, 0, 100)),
      };
    })
    .sort((left, right) => {
      if (right.importanceScore !== left.importanceScore) {
        return right.importanceScore - left.importanceScore;
      }
      const leftBase = left.baselineCount || left.questions || 0;
      const rightBase = right.baselineCount || right.questions || 0;
      if (rightBase !== leftBase) {
        return rightBase - leftBase;
      }
      if (right.activeYears !== left.activeYears) {
        return right.activeYears - left.activeYears;
      }
      return left.label.localeCompare(right.label);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      priorityTier: getPriorityTier(item.importanceScore, index + 1),
    }));
};

const buildPracticeUrl = ({ subjectSlug = "", subtopicSlug = "" }) => {
  const params = new URLSearchParams();
  if (subjectSlug) {
    params.set("subjects", subjectSlug);
  }
  if (subtopicSlug) {
    params.set("subtopics", subtopicSlug);
  }
  params.set("hideSolved", "1");
  return `/practice?${params.toString()}`;
};

export const buildHighPriorityTopicsDataset = ({
  questions = [],
  latestYear,
  windowYears = HIGH_PRIORITY_WINDOW_YEARS,
} = {}) => {
  const normalizedQuestions = (Array.isArray(questions) ? questions : [])
    .map(normalizeQuestion)
    .filter(Boolean);
  const availableYears = normalizedQuestions
    .map((question) => parseNumber(question?.exam?.year ?? question?.year, NaN))
    .filter(Number.isFinite);
  const resolvedLatestYear = Number.isFinite(Number(latestYear))
    ? Number(latestYear)
    : Math.max(...availableYears);

  if (!Number.isFinite(resolvedLatestYear)) {
    return {
      sourceUrl: HIGH_PRIORITY_TOPICS_SOURCE_URL,
      startYear: null,
      latestYear: null,
      windowYears,
      years: [],
      questionCount: 0,
      taggedTopicQuestionCount: 0,
      totalMarks: 0,
      paperCount: 0,
      yearTotals: [],
      subjects: [],
      topics: [],
    };
  }

  const safeWindowYears = Math.max(1, Math.round(parseNumber(windowYears, HIGH_PRIORITY_WINDOW_YEARS)));
  const startYear = resolvedLatestYear - safeWindowYears + 1;
  const years = Array.from({ length: safeWindowYears }, (_, index) => startYear + index);
  const yearSet = new Set(years);
  const subjectBuckets = new Map();
  const topicBuckets = new Map();
  const paperKeys = new Set();
  const yearTotals = createYearSeries(years);
  let questionCount = 0;
  let taggedTopicQuestionCount = 0;
  let totalMarks = 0;

  // Pre-populate using static compiled baseline frequencies
  STATIC_TOPIC_FREQUENCIES.forEach((item) => {
    const subjectBucket = getOrCreateBucket(subjectBuckets, {
      key: item.subjectSlug,
      label: item.subjectLabel,
      subjectSlug: item.subjectSlug,
      subjectLabel: item.subjectLabel,
      type: "subject",
      years,
    });
    subjectBucket.baselineCount = (subjectBucket.baselineCount || 0) + item.count;

    const key = `${item.subjectSlug}:${item.subtopicSlug}`;
    const topicBucket = getOrCreateBucket(topicBuckets, {
      key,
      label: item.subtopicLabel,
      subjectSlug: item.subjectSlug,
      subjectLabel: item.subjectLabel,
      type: "topic",
      years,
    });
    topicBucket.baselineCount = item.count;
    topicBucket.category = item.category || "";
    topicBucket.categorySlug = item.categorySlug || "";
  });

  normalizedQuestions.forEach((question) => {
    const year = parseNumber(question?.exam?.year ?? question?.year, NaN);
    if (!Number.isFinite(year) || !yearSet.has(year)) {
      return;
    }

    const subjectSlug = String(question.subjectSlug || "").trim();
    if (!subjectSlug || UNKNOWN_SUBJECTS.has(subjectSlug)) {
      return;
    }

    const subjectLabel = String(
      question.subjectLabel || question.subject || QuestionService.getSubjectLabelBySlug(subjectSlug)
    ).trim() || "Unknown";
    const marks = inferQuestionMarks(question);
    const paperKey = String(question.yearSetKey || question?.exam?.yearSetKey || `${year}-s0`).trim();
    const subtopics = Array.isArray(question.subtopics) ? question.subtopics : [];

    questionCount += 1;
    totalMarks += marks;
    if (paperKey) {
      paperKeys.add(paperKey);
    }

    const yearTotal = yearTotals.find((entry) => entry.year === year);
    if (yearTotal) {
      yearTotal.questions += 1;
      yearTotal.marks += marks;
    }

    const subjectBucket = getOrCreateBucket(subjectBuckets, {
      key: subjectSlug,
      label: subjectLabel,
      subjectSlug,
      subjectLabel,
      type: "subject",
      years,
    });
    addQuestionToBucket({ bucket: subjectBucket, year, marks, paperKey });

    if (subtopics.length > 0) {
      taggedTopicQuestionCount += 1;
    }

    subtopics.forEach((subtopic) => {
      const subtopicSlug = QuestionService.slugifyToken(subtopic?.slug || subtopic?.label || "");
      const subtopicLabel = String(subtopic?.label || subtopicSlug).trim();
      if (!subtopicSlug || !subtopicLabel) {
        return;
      }

      const topicBucket = getOrCreateBucket(topicBuckets, {
        key: `${subjectSlug}:${subtopicSlug}`,
        label: subtopicLabel,
        subjectSlug,
        subjectLabel,
        type: "topic",
        years,
      });
      addQuestionToBucket({ bucket: topicBucket, year, marks, paperKey });
    });
  });

  const subjects = scoreAndRankBuckets(
    Array.from(subjectBuckets.values()).map((bucket) => ({
      ...finalizeBaseBucket(bucket, { years }),
      practiceUrl: buildPracticeUrl({ subjectSlug: bucket.subjectSlug }),
    }))
  );

  const topics = scoreAndRankBuckets(
    Array.from(topicBuckets.values()).map((bucket) => ({
      ...finalizeBaseBucket(bucket, { years }),
      practiceUrl: buildPracticeUrl({
        subjectSlug: bucket.subjectSlug,
        subtopicSlug: bucket.key.split(":")[1] || "",
      }),
    }))
  );

  const topicMapBySubject = topics.reduce((map, topic) => {
    if (!map.has(topic.subjectSlug)) {
      map.set(topic.subjectSlug, []);
    }
    map.get(topic.subjectSlug).push(topic);
    return map;
  }, new Map());

  return {
    sourceUrl: HIGH_PRIORITY_TOPICS_SOURCE_URL,
    startYear,
    latestYear: resolvedLatestYear,
    windowYears: safeWindowYears,
    years,
    questionCount,
    taggedTopicQuestionCount,
    totalMarks: Number(totalMarks.toFixed(2)),
    paperCount: paperKeys.size,
    yearTotals: yearTotals.map((entry) => ({
      ...entry,
      marks: Number(entry.marks.toFixed(2)),
    })),
    subjects: subjects.map((subject) => ({
      ...subject,
      topTopics: (topicMapBySubject.get(subject.subjectSlug) || []).slice(0, 4),
    })),
    topics,
  };
};

export const loadHighPriorityTopicsDataset = async ({
  fetchImpl = typeof fetch === "function" ? fetch : null,
  baseUrl = typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/",
  windowYears = HIGH_PRIORITY_WINDOW_YEARS,
} = {}) => {
  if (!fetchImpl) {
    return buildHighPriorityTopicsDataset({ windowYears });
  }

  const normalizedBase = String(baseUrl || "/").endsWith("/")
    ? String(baseUrl || "/")
    : `${String(baseUrl || "/")}/`;
  const response = await fetchImpl(`${normalizedBase}question-search-index.json`, {
    cache: "force-cache",
  });

  if (!response?.ok) {
    throw new Error("Unable to load GateOverflow topic frequency data.");
  }

  const questions = await response.json();
  return buildHighPriorityTopicsDataset({ questions, windowYears });
};
