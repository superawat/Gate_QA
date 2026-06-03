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

export const TECHNICAL_SUBJECT_GROUPS = [
  { subjectSlug: "algorithms", subjectSlugs: ["algorithms"], label: "Algorithms", shortLabel: "Algo" },
  { subjectSlug: "os", subjectSlugs: ["os"], label: "Operating Systems", shortLabel: "OS" },
  { subjectSlug: "dbms", subjectSlugs: ["dbms"], label: "Database Systems", shortLabel: "DBMS" },
  { subjectSlug: "cn", subjectSlugs: ["cn"], label: "Computer Networks", shortLabel: "CN" },
  { subjectSlug: "toc", subjectSlugs: ["toc"], label: "Theory of Computation", shortLabel: "TOC" },
  { subjectSlug: "coa", subjectSlugs: ["coa"], label: "Computer Organization & Architecture", shortLabel: "COA" },
  { subjectSlug: "digital-logic", subjectSlugs: ["digital-logic"], label: "Digital Logic", shortLabel: "DL" },
  { subjectSlug: "compiler", subjectSlugs: ["compiler"], label: "Compiler Design", shortLabel: "CD" },
  { subjectSlug: "engg-math", subjectSlugs: ["engg-math", "discrete-math"], label: "Engineering Mathematics", shortLabel: "EM" },
  { subjectSlug: "prog-ds", subjectSlugs: ["prog-ds", "prog-c"], label: "Programming & Data Structures", shortLabel: "PDS" },
];

export const APTITUDE_TOPIC_GROUPS = [
  { topicSlug: "quantitative-aptitude", label: "Quantitative Aptitude", shortLabel: "Quant" },
  { topicSlug: "verbal-aptitude", label: "Verbal Aptitude", shortLabel: "Verbal" },
  { topicSlug: "analytical-aptitude", label: "Analytical Aptitude", shortLabel: "Analytical" },
  { topicSlug: "spatial-aptitude", label: "Spatial Aptitude", shortLabel: "Spatial" },
];

export const OFFICIAL_MARKS_PERIODS = "2026-2 2026-1 2025-2 2025-1 2024-2 2024-1 2023 2022 2021-2 2021-1 2020 2019 2018 2017-2 2017-1 2016-2 2016-1 2015-3 2015-2 2015-1 2014-3 2014-2 2014-1 2013 2012 2011 2010".split(" ");

export const OFFICIAL_MARKS_ROWS = [
  { label: "Algorithms", marks: "12 16 8 8 6 9 6 6 10 9 8 6 8 8 6 9 7 15 9 10 12 11 4 13 12 13 11".split(" ").map(Number) },
  { label: "Analytical Aptitude", marks: "7 5 4 2 3 0 3 3 2 2 2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(" ").map(Number) },
  { label: "Calculus", marks: "3 3 1 1 1 1 2 1 1 1 1 1 1 1 2 1 1 3 0 3 3 0 5 1 1 2 1".split(" ").map(Number) },
  { label: "CO & Architecture", marks: "11 11 9 8 8 8 10 7 6 5 9 4 8 6 10 11 5 5 5 2 5 5 7 9 5 7 6".split(" ").map(Number) },
  { label: "Combinatory", marks: "0 1 0 1 0 0 3 5 2 1 2 2 3 2 0 2 5 0 0 0 0 2 2 0 0 2 2".split(" ").map(Number) },
  { label: "Compiler Design", marks: "6 6 6 6 8 10 7 4 6 7 4 6 5 4 6 5 7 3 4 6 5 6 3 3 4 6 5".split(" ").map(Number) },
  { label: "Computer Networks", marks: "9 8 6 8 9 9 8 10 7 9 6 9 7 5 8 9 10 8 8 6 9 7 8 7 9 6 7".split(" ").map(Number) },
  { label: "Data Structures", marks: "3 2 6 5 4 2 8 4 2 6 7 4 2 3 3 7 7 5 6 7 4 3 3 3 2 1 5".split(" ").map(Number) },
  { label: "Databases", marks: "6 6 9 8 8 8 5 7 7 8 8 8 6 8 8 6 5 6 6 6 8 8 0 7 11 7 7".split(" ").map(Number) },
  { label: "Digital Logic", marks: "7 8 9 6 6 6 6 5 7 6 6 8 6 10 3 3 7 6 5 3 6 7 4 5 5 7 8".split(" ").map(Number) },
  { label: "Discrete Mathematics", marks: "0 0 3 6 9 6 10 13 6 9 8 8 11 6 6 9 8 6 19 13 14 8 12 8 9 5 11".split(" ").map(Number) },
  { label: "Engineering Mathematics", marks: "0 0 9 7 6 8 6 6 9 8 5 8 7 10 8 4 5 8 3 8 9 7 10 4 7 10 7".split(" ").map(Number) },
  { label: "Graph Theory", marks: "2 6 0 0 5 3 2 7 0 3 2 3 3 1 0 0 0 0 4 2 5 3 5 3 5 1 3".split(" ").map(Number) },
  { label: "IS & Software Engg.", marks: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 4 3 1 1 1 3 0 5 4".split(" ").map(Number) },
  { label: "Linear Algebra", marks: "3 2 4 3 2 3 2 5 3 2 2 3 3 3 5 2 1 3 3 3 2 3 2 1 1 2 2".split(" ").map(Number) },
  { label: "Mathematical Logic", marks: "1 0 1 2 1 0 1 0 1 1 2 2 2 1 4 3 1 1 3 1 3 0 3 4 2 2 4".split(" ").map(Number) },
  { label: "Numerical Methods", marks: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2 2 0 2 2 0 1 2 0 1".split(" ").map(Number) },
  { label: "Operating System", marks: "7 6 7 8 10 10 9 10 8 6 10 10 9 6 6 7 9 6 8 10 7 9 8 12 9 8 7".split(" ").map(Number) },
  { label: "Probability", marks: "3 3 4 3 3 4 2 0 5 5 2 4 3 6 1 1 3 2 0 2 4 4 3 2 5 6 4".split(" ").map(Number) },
  { label: "Programming", marks: "0 0 6 5 4 4 1 5 6 4 3 8 8 10 9 5 6 7 1 5 0 3 1 2 7 1 2".split(" ").map(Number) },
  { label: "Programming in C", marks: "6 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(" ").map(Number) },
  { label: "Quantitative Aptitude", marks: "6 6 8 7 7 8 5 6 6 7 7 8 13 11 10 8 7 6 10 8 8 8 8 9 6 6 9".split(" ").map(Number) },
  { label: "Set Theory & Algebra", marks: "1 0 2 3 3 3 4 1 3 4 2 1 3 2 2 4 2 5 12 10 6 3 2 1 2 0 2".split(" ").map(Number) },
  { label: "Spatial Aptitude", marks: "1 3 1 2 2 4 3 3 3 2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(" ").map(Number) },
  { label: "Theory of Computation", marks: "5 6 7 10 7 5 9 8 11 8 9 8 8 9 12 9 9 3 7 5 5 6 6 8 5 8 7".split(" ").map(Number) },
  { label: "Verbal Aptitude", marks: "1 1 2 4 3 3 4 3 4 4 6 7 2 4 5 7 8 9 5 7 7 7 7 6 9 9 6".split(" ").map(Number) },
  { label: "Web Technologies", marks: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 0 2 1 0 0 1 1".split(" ").map(Number) },
];

const TECHNICAL_SUBJECT_BY_SLUG = new Map(
  TECHNICAL_SUBJECT_GROUPS.flatMap((group) => (
    group.subjectSlugs.map((slug) => [slug, group])
  ))
);

const APTITUDE_TOPIC_BY_SLUG = new Map(
  APTITUDE_TOPIC_GROUPS.map((group) => [group.topicSlug, group])
);

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

const getQuestionUid = (question = {}) => String(question.question_uid || question.uid || "").trim();

const isSpecialAptitudeQuestion = (question = {}) => {
  const uid = getQuestionUid(question).toUpperCase();
  return uid.startsWith("APT-") || uid.startsWith("APT:");
};

const hasGateCseSignal = (question = {}) => {
  const tags = Array.isArray(question.tagsRaw)
    ? question.tagsRaw
    : Array.isArray(question.tags)
      ? question.tags
      : [];
  const searchable = [
    question.title,
    question.yearSetLabel,
    question.searchText,
    question.link,
    ...tags,
  ].join(" ");
  return /\bgate\s*cse\b/i.test(searchable) || /\bgatecse-\d{4}/i.test(searchable);
};

const isOfficialGateCseQuestion = (question = {}) => (
  !isSpecialAptitudeQuestion(question) && hasGateCseSignal(question)
);

const getTechnicalSubjectGroup = (subjectSlug = "") => (
  TECHNICAL_SUBJECT_BY_SLUG.get(String(subjectSlug || "").trim()) || null
);

const getQuestionTokens = (question = {}) => {
  const tags = Array.isArray(question.tagsRaw)
    ? question.tagsRaw
    : Array.isArray(question.tags)
      ? question.tags
      : [];
  const subtopics = Array.isArray(question.subtopics) ? question.subtopics : [];
  return [
    ...tags,
    ...subtopics.flatMap((subtopic) => [subtopic?.slug, subtopic?.label]),
    question.title,
    question.preview,
    question.searchText,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
};

const classifyAptitudeTopic = (question = {}) => {
  const haystack = getQuestionTokens(question).join(" ");

  if (/(spatial|visual|figure|figures|3d|three-dimensional|geometry|pattern|shapes?|tiles?|mirror|rotation)/i.test(haystack)) {
    return APTITUDE_TOPIC_BY_SLUG.get("spatial-aptitude");
  }
  if (/(verbal|vocabulary|grammar|sentence|sentences|word|synonym|antonym|meaning|idiom|reading|paragraph|english)/i.test(haystack)) {
    return APTITUDE_TOPIC_BY_SLUG.get("verbal-aptitude");
  }
  if (/(analytical|logical|reasoning|arrangement|assertion|statement|statements|analogy|deduction|siblings|tournament|ranking)/i.test(haystack)) {
    return APTITUDE_TOPIC_BY_SLUG.get("analytical-aptitude");
  }
  return APTITUDE_TOPIC_BY_SLUG.get("quantitative-aptitude");
};

const getTrustedSubjectSlug = (question = {}) => (
  QuestionService.normalizeSubjectSlug(
    question.subjectSlug || question.subjectLabel || question.subject || ""
  )
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
  let normalizedQuestion;
  if (rawQuestion?.canonical?.isIndexEntry || rawQuestion?.exam) {
    normalizedQuestion = rawQuestion;
  } else if (rawQuestion?.question) {
    normalizedQuestion = QuestionService.normalizeQuestion(rawQuestion);
  } else {
    normalizedQuestion = QuestionService.hydrateIndexedQuestion(rawQuestion);
  }

  const trustedSubjectSlug = getTrustedSubjectSlug(rawQuestion);
  if (!trustedSubjectSlug) {
    return normalizedQuestion;
  }

  const trustedSubjectLabel = QuestionService.getSubjectLabelBySlug(trustedSubjectSlug);
  const trustedTags = Array.isArray(rawQuestion.tagsRaw)
    ? rawQuestion.tagsRaw
    : Array.isArray(rawQuestion.tags)
      ? rawQuestion.tags
      : Array.isArray(normalizedQuestion.tagsRaw)
        ? normalizedQuestion.tagsRaw
        : Array.isArray(normalizedQuestion.tags)
          ? normalizedQuestion.tags
          : [];
  const trustedSubtopics = Array.isArray(rawQuestion.subtopics) && rawQuestion.subtopics.length > 0
    ? rawQuestion.subtopics
    : QuestionService.extractCanonicalSubtopics(trustedTags, trustedSubjectLabel);

  return {
    ...normalizedQuestion,
    subject: trustedSubjectLabel,
    subjectLabel: trustedSubjectLabel,
    subjectSlug: trustedSubjectSlug,
    tags: trustedTags,
    tagsRaw: [...trustedTags],
    subtopics: trustedSubtopics,
    canonical: {
      ...(normalizedQuestion.canonical || {}),
      subject: trustedSubjectSlug,
      subjectLabel: trustedSubjectLabel,
      subtopics: trustedSubtopics,
      tagsRaw: [...trustedTags],
    },
  };
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
  shortLabel: label,
  subjectSlug,
  subjectLabel,
  subjectSlugs: subjectSlug ? [subjectSlug] : [],
  subjectParam: subjectSlug,
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

  // Balanced relative trend indicator to remove absolute scale bias
  const percentChange = previousAverageMarks > 0
    ? (recentAverageMarks - previousAverageMarks) / previousAverageMarks
    : (recentAverageMarks > 0 ? 1.0 : 0.0);

  // Unbiased, scale-free trend direction
  let trendDirection = "flat";
  if ((trendDeltaMarks >= 0.15 && percentChange >= 0.10) || (previousAverageMarks === 0 && recentAverageMarks >= 0.2)) {
    trendDirection = "up";
  } else if (trendDeltaMarks <= -0.15 && percentChange <= -0.10) {
    trendDirection = "down";
  }

  return {
    ...bucket,
    baselineCount: Math.max(bucket.baselineCount || 0, bucket.questions || 0),
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
  const maxBaseline = Math.max(1, ...items.map((item) => Math.max(item.baselineCount || 0, item.questions || 0)));
  const maxRecentAverage = Math.max(1, ...items.map((item) => item.recentAverageMarks));

  return items
    .map((item) => {
      const baselineCount = Math.max(item.baselineCount || 0, item.questions || 0);
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
      const leftBase = Math.max(left.baselineCount || 0, left.questions || 0);
      const rightBase = Math.max(right.baselineCount || 0, right.questions || 0);
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

const OFFICIAL_TECHNICAL_MARK_GROUPS = [
  { key: "algorithms", label: "Algorithms", shortLabel: "Algo", subjectSlug: "algorithms", subjectParam: "algorithms", rows: ["Algorithms"] },
  { key: "os", label: "Operating Systems", shortLabel: "OS", subjectSlug: "os", subjectParam: "os", rows: ["Operating System"] },
  { key: "dbms", label: "Database Systems", shortLabel: "DBMS", subjectSlug: "dbms", subjectParam: "dbms", rows: ["Databases"] },
  { key: "cn", label: "Computer Networks", shortLabel: "CN", subjectSlug: "cn", subjectParam: "cn", rows: ["Computer Networks"] },
  { key: "toc", label: "Theory of Computation", shortLabel: "TOC", subjectSlug: "toc", subjectParam: "toc", rows: ["Theory of Computation"] },
  { key: "coa", label: "Computer Organization & Architecture", shortLabel: "COA", subjectSlug: "coa", subjectParam: "coa", rows: ["CO & Architecture"] },
  { key: "digital-logic", label: "Digital Logic", shortLabel: "DL", subjectSlug: "digital-logic", subjectParam: "digital-logic", rows: ["Digital Logic"] },
  { key: "compiler", label: "Compiler Design", shortLabel: "CD", subjectSlug: "compiler", subjectParam: "compiler", rows: ["Compiler Design"] },
  {
    key: "engg-math",
    label: "Engineering Mathematics",
    shortLabel: "EM",
    subjectSlug: "engg-math",
    subjectParam: "engg-math,discrete-math",
    primaryRows: ["Engineering Mathematics", "Discrete Mathematics"],
    fallbackRows: [
      "Calculus",
      "Combinatory",
      "Graph Theory",
      "Linear Algebra",
      "Mathematical Logic",
      "Numerical Methods",
      "Probability",
      "Set Theory & Algebra",
    ],
    rows: [
      "Calculus",
      "Combinatory",
      "Discrete Mathematics",
      "Engineering Mathematics",
      "Graph Theory",
      "Linear Algebra",
      "Mathematical Logic",
      "Numerical Methods",
      "Probability",
      "Set Theory & Algebra",
    ],
  },
  {
    key: "prog-ds",
    label: "Programming & Data Structures",
    shortLabel: "PDS",
    subjectSlug: "prog-ds",
    subjectParam: "prog-ds,prog-c",
    rows: ["Data Structures", "Programming", "Programming in C"],
  },
];

const OFFICIAL_APTITUDE_MARK_GROUPS = [
  { key: "quantitative-aptitude", label: "Quantitative Aptitude", shortLabel: "Quant", rows: ["Quantitative Aptitude"] },
  { key: "verbal-aptitude", label: "Verbal Aptitude", shortLabel: "Verbal", rows: ["Verbal Aptitude"] },
  { key: "analytical-aptitude", label: "Analytical Aptitude", shortLabel: "Analytical", rows: ["Analytical Aptitude"] },
  { key: "spatial-aptitude", label: "Spatial Aptitude", shortLabel: "Spatial", rows: ["Spatial Aptitude"] },
];

const OFFICIAL_APTITUDE_ROW_LABELS = new Set(
  OFFICIAL_APTITUDE_MARK_GROUPS.flatMap((group) => group.rows)
);
const OFFICIAL_LEGACY_ROW_LABELS = new Set(["IS & Software Engg.", "Web Technologies"]);
const OFFICIAL_TECHNICAL_GROUP_BY_ROW = new Map(
  OFFICIAL_TECHNICAL_MARK_GROUPS.flatMap((group) => group.rows.map((rowLabel) => [rowLabel, group]))
);

const parseOfficialPeriod = (period = "", sourceIndex = 0) => {
  const [yearText, setText] = String(period || "").split("-");
  const year = Number.parseInt(yearText, 10);
  const set = Number.parseInt(setText || "", 10);
  const hasSet = Number.isFinite(set) && set > 0;
  return {
    sourceIndex,
    key: `${year}-s${hasSet ? set : 0}`,
    period,
    label: hasSet ? `${year} Set ${set}` : String(year),
    shortLabel: hasSet ? `${year}-${set}` : String(year),
    year,
    set: hasSet ? set : null,
  };
};

const getOfficialPeriods = () => (
  OFFICIAL_MARKS_PERIODS
    .map((period, index) => parseOfficialPeriod(period, index))
    .slice()
    .reverse()
);

const getOfficialRowByLabel = () => new Map(OFFICIAL_MARKS_ROWS.map((row) => [row.label, row]));

const getOfficialPaperSeriesForRows = ({ rowLabels = [], rowsByLabel, periods }) => (
  periods.map((period) => ({
    ...period,
    marks: Number(rowLabels.reduce((sum, rowLabel) => {
      const row = rowsByLabel.get(rowLabel);
      return sum + parseNumber(row?.marks?.[period.sourceIndex], 0);
    }, 0).toFixed(2)),
  }))
);

const getOfficialPaperSeriesForGroup = ({ group, rowsByLabel, periods }) => {
  const primaryRows = group.primaryRows || group.rows || [];
  const fallbackRows = group.fallbackRows || [];
  return periods.map((period) => {
    const primaryMarks = primaryRows.reduce((sum, rowLabel) => {
      const row = rowsByLabel.get(rowLabel);
      return sum + parseNumber(row?.marks?.[period.sourceIndex], 0);
    }, 0);
    const fallbackMarks = fallbackRows.reduce((sum, rowLabel) => {
      const row = rowsByLabel.get(rowLabel);
      return sum + parseNumber(row?.marks?.[period.sourceIndex], 0);
    }, 0);
    return {
      ...period,
      marks: Number((primaryMarks > 0 || fallbackRows.length === 0 ? primaryMarks : fallbackMarks).toFixed(2)),
    };
  });
};

const finalizeOfficialMarkItem = ({
  key,
  label,
  shortLabel,
  subjectSlug = "",
  subjectParam = subjectSlug,
  subjectLabel = label,
  type,
  paperSeries,
  practiceUrl,
}) => {
  const totalMarks = paperSeries.reduce((sum, entry) => sum + entry.marks, 0);
  const activePapers = paperSeries.filter((entry) => entry.marks > 0).length;
  const recentWindow = paperSeries.slice(-6);
  const previousWindow = paperSeries.slice(-12, -6);
  const recentAverageMarks = recentWindow.length
    ? recentWindow.reduce((sum, entry) => sum + entry.marks, 0) / recentWindow.length
    : 0;
  const previousAverageMarks = previousWindow.length
    ? previousWindow.reduce((sum, entry) => sum + entry.marks, 0) / previousWindow.length
    : 0;
  const trendDeltaMarks = Number((recentAverageMarks - previousAverageMarks).toFixed(2));
  const yearMap = paperSeries.reduce((map, entry) => {
    if (!map.has(entry.year)) {
      map.set(entry.year, { year: entry.year, questions: 0, marks: 0 });
    }
    const yearEntry = map.get(entry.year);
    yearEntry.questions += entry.marks > 0 ? 1 : 0;
    yearEntry.marks += entry.marks;
    return map;
  }, new Map());
  let trendDirection = "flat";
  if (trendDeltaMarks >= 0.5) {
    trendDirection = "up";
  } else if (trendDeltaMarks <= -0.5) {
    trendDirection = "down";
  }

  return {
    key,
    label,
    shortLabel,
    subjectSlug,
    subjectLabel,
    subjectParam,
    subjectSlugs: subjectParam ? subjectParam.split(",").filter(Boolean) : [],
    type,
    questions: activePapers,
    totalMarks: Number(totalMarks.toFixed(2)),
    averageMarks: paperSeries.length ? Number((totalMarks / paperSeries.length).toFixed(2)) : 0,
    latestMarks: Number(paperSeries[paperSeries.length - 1]?.marks || 0),
    activePapers,
    paperCount: activePapers,
    activeYears: Array.from(yearMap.values()).filter((entry) => entry.marks > 0).length,
    recentAverageMarks: Number(recentAverageMarks.toFixed(2)),
    previousAverageMarks: Number(previousAverageMarks.toFixed(2)),
    trendDeltaMarks,
    trendDirection,
    paperSeries,
    yearSeries: Array.from(yearMap.values()).sort((left, right) => left.year - right.year).map((entry) => ({
      ...entry,
      marks: Number(entry.marks.toFixed(2)),
    })),
    practiceUrl,
  };
};

const buildOfficialMarksSummary = () => {
  const periods = getOfficialPeriods();
  const rowsByLabel = getOfficialRowByLabel();

  const technicalSubjects = OFFICIAL_TECHNICAL_MARK_GROUPS.map((group) => (
    finalizeOfficialMarkItem({
      key: group.key,
      label: group.label,
      shortLabel: group.shortLabel,
      subjectSlug: group.subjectSlug,
      subjectParam: group.subjectParam,
      subjectLabel: group.label,
      type: "subject",
      paperSeries: getOfficialPaperSeriesForGroup({ group, rowsByLabel, periods }),
      practiceUrl: buildPracticeUrl({ subjectSlug: group.subjectParam }),
    })
  )).sort((left, right) => {
    if (right.averageMarks !== left.averageMarks) return right.averageMarks - left.averageMarks;
    return right.latestMarks - left.latestMarks;
  }).map((item, index) => ({ ...item, rank: index + 1 }));

  const aptitudeTopics = OFFICIAL_APTITUDE_MARK_GROUPS.map((group) => (
    finalizeOfficialMarkItem({
      key: group.key,
      label: group.label,
      shortLabel: group.shortLabel,
      subjectSlug: "ga",
      subjectParam: "ga",
      subjectLabel: "General Aptitude",
      type: "aptitude",
      paperSeries: getOfficialPaperSeriesForRows({ rowLabels: group.rows, rowsByLabel, periods }),
      practiceUrl: buildPracticeUrl({ subjectSlug: "ga", subtopicSlug: group.key }),
    })
  ));

  const technicalTrendItems = OFFICIAL_MARKS_ROWS
    .filter((row) => (
      !OFFICIAL_APTITUDE_ROW_LABELS.has(row.label)
      && !OFFICIAL_LEGACY_ROW_LABELS.has(row.label)
      && OFFICIAL_TECHNICAL_GROUP_BY_ROW.has(row.label)
    ))
    .map((row) => {
      const group = OFFICIAL_TECHNICAL_GROUP_BY_ROW.get(row.label);
      const isSubjectLevel = row.label === group.rows[0] && group.rows.length === 1;
      return finalizeOfficialMarkItem({
        key: `official:${QuestionService.slugifyToken(row.label)}`,
        label: row.label,
        shortLabel: group.shortLabel,
        subjectSlug: group.subjectSlug,
        subjectParam: group.subjectParam,
        subjectLabel: group.label,
        type: "official-topic",
        paperSeries: getOfficialPaperSeriesForRows({ rowLabels: [row.label], rowsByLabel, periods }),
        practiceUrl: buildPracticeUrl({
          subjectSlug: group.subjectParam,
          subtopicSlug: isSubjectLevel ? "" : QuestionService.slugifyToken(row.label),
        }),
      });
    })
    .sort((left, right) => {
      if (right.recentAverageMarks !== left.recentAverageMarks) {
        return right.recentAverageMarks - left.recentAverageMarks;
      }
      if (right.trendDeltaMarks !== left.trendDeltaMarks) {
        return right.trendDeltaMarks - left.trendDeltaMarks;
      }
      return right.averageMarks - left.averageMarks;
    });

  const allTrendItems = OFFICIAL_MARKS_ROWS.map((row) => {
    const technicalGroup = OFFICIAL_TECHNICAL_GROUP_BY_ROW.get(row.label);
    const aptitudeGroup = OFFICIAL_APTITUDE_MARK_GROUPS.find((group) => group.rows.includes(row.label));
    const isLegacy = OFFICIAL_LEGACY_ROW_LABELS.has(row.label);
    const subjectSlug = aptitudeGroup ? "ga" : technicalGroup?.subjectSlug || "legacy-other";
    const subjectParam = aptitudeGroup ? "ga" : technicalGroup?.subjectParam || subjectSlug;
    const subjectLabel = aptitudeGroup
      ? "General Aptitude"
      : technicalGroup?.label || (isLegacy ? "Legacy / Optional" : row.label);
    return finalizeOfficialMarkItem({
      key: `official-row:${QuestionService.slugifyToken(row.label)}`,
      label: row.label,
      shortLabel: aptitudeGroup?.shortLabel || technicalGroup?.shortLabel || row.label,
      subjectSlug,
      subjectParam,
      subjectLabel,
      type: aptitudeGroup ? "aptitude-row" : isLegacy ? "legacy-row" : "official-row",
      paperSeries: getOfficialPaperSeriesForRows({ rowLabels: [row.label], rowsByLabel, periods }),
      practiceUrl: buildPracticeUrl({
        subjectSlug: subjectParam,
        subtopicSlug: aptitudeGroup ? aptitudeGroup.key : QuestionService.slugifyToken(row.label),
      }),
    });
  });

  return {
    periods,
    technicalSubjects,
    aptitudeTopics,
    technicalTrendItems,
    allTrendItems,
  };
};

export const buildHighPriorityTopicsDataset = ({
  questions = [],
  latestYear,
  windowYears = HIGH_PRIORITY_WINDOW_YEARS,
} = {}) => {
  const officialMarks = buildOfficialMarksSummary();
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
      subjects: officialMarks.technicalSubjects,
      topics: [],
      technicalQuestionCount: 0,
      aptitudeQuestionCount: 0,
      technicalMarks: 0,
      aptitudeMarks: 0,
      technicalSubjects: officialMarks.technicalSubjects,
      technicalTopics: [],
      aptitudeTopics: officialMarks.aptitudeTopics,
      topTechnicalTopics: [],
      topAptitudeTopics: officialMarks.aptitudeTopics.slice(0, 4),
      officialPeriods: officialMarks.periods,
      officialTechnicalSubjects: officialMarks.technicalSubjects,
      officialAptitudeTopics: officialMarks.aptitudeTopics,
      officialTrendItems: officialMarks.technicalTrendItems,
      officialMarksItems: officialMarks.allTrendItems,
    };
  }

  const safeWindowYears = Math.max(1, Math.round(parseNumber(windowYears, HIGH_PRIORITY_WINDOW_YEARS)));
  const startYear = resolvedLatestYear - safeWindowYears + 1;
  const years = Array.from({ length: safeWindowYears }, (_, index) => startYear + index);
  const yearSet = new Set(years);
  const subjectBuckets = new Map();
  const topicBuckets = new Map();
  const aptitudeTopicBuckets = new Map();
  const paperKeys = new Set();
  const yearTotals = createYearSeries(years);
  let questionCount = 0;
  let technicalQuestionCount = 0;
  let aptitudeQuestionCount = 0;
  let taggedTopicQuestionCount = 0;
  let totalMarks = 0;
  let technicalMarks = 0;
  let aptitudeMarks = 0;

  normalizedQuestions.forEach((question) => {
    if (!isOfficialGateCseQuestion(question)) {
      return;
    }

    const year = parseNumber(question?.exam?.year ?? question?.year, NaN);
    if (!Number.isFinite(year) || !yearSet.has(year)) {
      return;
    }

    const subjectSlug = String(question.subjectSlug || "").trim();
    if (!subjectSlug || UNKNOWN_SUBJECTS.has(subjectSlug)) {
      return;
    }

    const isGateCseAptitude = subjectSlug === "ga";
    const subjectGroup = isGateCseAptitude ? null : getTechnicalSubjectGroup(subjectSlug);
    if (!isGateCseAptitude && !subjectGroup) {
      return;
    }

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

    if (isGateCseAptitude) {
      aptitudeQuestionCount += 1;
      aptitudeMarks += marks;
      const aptitudeGroup = classifyAptitudeTopic(question);
      const aptitudeBucket = getOrCreateBucket(aptitudeTopicBuckets, {
        key: aptitudeGroup.topicSlug,
        label: aptitudeGroup.label,
        subjectSlug: "ga",
        subjectLabel: "General Aptitude",
        type: "aptitude",
        years,
      });
      aptitudeBucket.shortLabel = aptitudeGroup.shortLabel;
      aptitudeBucket.subjectSlugs = ["ga"];
      aptitudeBucket.subjectParam = "ga";
      aptitudeBucket.practiceUrl = buildPracticeUrl({
        subjectSlug: "ga",
        subtopicSlug: aptitudeGroup.topicSlug,
      });
      addQuestionToBucket({ bucket: aptitudeBucket, year, marks, paperKey });
      return;
    }

    technicalQuestionCount += 1;
    technicalMarks += marks;

    const subjectBucket = getOrCreateBucket(subjectBuckets, {
      key: subjectGroup.subjectSlug,
      label: subjectGroup.label,
      subjectSlug: subjectGroup.subjectSlug,
      subjectLabel: subjectGroup.label,
      type: "subject",
      years,
    });
    subjectBucket.shortLabel = subjectGroup.shortLabel;
    subjectBucket.subjectSlugs = subjectGroup.subjectSlugs;
    subjectBucket.subjectParam = subjectGroup.subjectSlugs.join(",");
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
        key: `${subjectGroup.subjectSlug}:${subtopicSlug}`,
        label: subtopicLabel,
        subjectSlug: subjectGroup.subjectSlug,
        subjectLabel: subjectGroup.label,
        type: "topic",
        years,
      });
      topicBucket.shortLabel = subjectGroup.shortLabel;
      topicBucket.subjectSlugs = subjectGroup.subjectSlugs;
      topicBucket.subjectParam = subjectGroup.subjectSlugs.join(",");
      addQuestionToBucket({ bucket: topicBucket, year, marks, paperKey });
    });
  });

  const subjects = scoreAndRankBuckets(
    Array.from(subjectBuckets.values()).map((bucket) => ({
      ...finalizeBaseBucket(bucket, { years }),
      practiceUrl: buildPracticeUrl({ subjectSlug: bucket.subjectParam || bucket.subjectSlug }),
    }))
  );

  const topics = scoreAndRankBuckets(
    Array.from(topicBuckets.values()).map((bucket) => ({
      ...finalizeBaseBucket(bucket, { years }),
      practiceUrl: buildPracticeUrl({
        subjectSlug: bucket.subjectParam || bucket.subjectSlug,
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
  const baseTechnicalSubjects = officialMarks.technicalSubjects.length ? officialMarks.technicalSubjects : subjects;
  const technicalSubjectsWithTopics = baseTechnicalSubjects.map((subject) => ({
    ...subject,
    topTopics: (topicMapBySubject.get(subject.subjectSlug) || []).slice(0, 4),
  }));

  return {
    sourceUrl: HIGH_PRIORITY_TOPICS_SOURCE_URL,
    startYear,
    latestYear: resolvedLatestYear,
    windowYears: safeWindowYears,
    years,
    questionCount,
    technicalQuestionCount,
    aptitudeQuestionCount,
    taggedTopicQuestionCount,
    totalMarks: Number(totalMarks.toFixed(2)),
    technicalMarks: Number(technicalMarks.toFixed(2)),
    aptitudeMarks: Number(aptitudeMarks.toFixed(2)),
    paperCount: paperKeys.size,
    yearTotals: yearTotals.map((entry) => ({
      ...entry,
      marks: Number(entry.marks.toFixed(2)),
    })),
    subjects: technicalSubjectsWithTopics,
    topics,
    technicalSubjects: technicalSubjectsWithTopics,
    technicalTopics: topics,
    aptitudeTopics: officialMarks.aptitudeTopics,
    topTechnicalTopics: topics.slice(0, 12),
    topAptitudeTopics: officialMarks.aptitudeTopics.slice(0, 4),
    officialPeriods: officialMarks.periods,
    officialTechnicalSubjects: technicalSubjectsWithTopics,
    officialAptitudeTopics: officialMarks.aptitudeTopics,
    officialTrendItems: officialMarks.technicalTrendItems,
    officialMarksItems: officialMarks.allTrendItems,
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
