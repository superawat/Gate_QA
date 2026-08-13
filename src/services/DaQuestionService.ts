import { extractEmbeddedOptions } from "../utils/stripEmbeddedOptions";
import { buildTrackYearSetKey } from "../utils/examTrack";
import type {
  AnswerRecord,
  QuestionRow,
  StructuredTags,
  SubjectOption,
  SubtopicOption,
  YearSetOption,
} from "../types";

export const DA_SUBJECTS: SubjectOption[] = [
  { slug: "probability-and-statistics", label: "Probability & Statistics" },
  { slug: "linear-algebra", label: "Linear Algebra" },
  { slug: "calculus-and-optimization", label: "Calculus & Optimization" },
  { slug: "programming-data-structures-and-algorithms", label: "Programming & DSA" },
  { slug: "database-management-and-warehousing", label: "DBMS & Warehousing" },
  { slug: "machine-learning", label: "Machine Learning" },
  { slug: "artificial-intelligence", label: "Artificial Intelligence" },
  { slug: "general-aptitude", label: "General Aptitude" },
];

const SUBJECT_ALIASES: Record<string, string> = {
  "probability-and-statistics": "probability-and-statistics",
  "linear-algebra": "linear-algebra",
  "calculus-and-optimization": "calculus-and-optimization",
  "programming-in-python": "programming-data-structures-and-algorithms",
  "data-structures": "programming-data-structures-and-algorithms",
  algorithms: "programming-data-structures-and-algorithms",
  "database-management-and-warehousing": "database-management-and-warehousing",
  "machine-learning": "machine-learning",
  "artificial-intelligence": "artificial-intelligence",
  "general-aptitude": "general-aptitude",
  "data-science-and-artificial-intelligence": "artificial-intelligence",
  "programming-data-structures-and-algorithms": "programming-data-structures-and-algorithms",
};

const SUBJECT_LABELS = new Map(DA_SUBJECTS.map((subject) => [subject.slug, subject.label]));
export const DA_FILTER_SUBJECT_PREFIX = "da:";
const TYPE_TOKENS = new Set(["MCQ", "MSQ", "NAT"]);

const baseUrl = () => (
  import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
);

const clean = (value: unknown) => String(value ?? "").trim();

const extractGoId = (link = "") => clean(link).match(
  /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  )?.[1] || null;

const getYear = (row: any = {}) => {
  const direct = Number(row.year);
  if (Number.isFinite(direct)) return direct;
  return Number(clean(row.tags).match(/gateda-(\d{4})/i)?.[1] || 0);
};

const getQuestionNumber = (row: any = {}) => Number(
  clean(row.title).match(/question\s*:\s*(\d+)/i)?.[1] ||
  clean(row.tags).match(/question-(\d+)/i)?.[1] || 0
);

const buildUid = (row: any = {}) => {
  const year = getYear(row);
  const number = getQuestionNumber(row);
  if (year === 2026 && number) {
    return `da:2026:set1:main:q${number}`;
  }

  const goId = extractGoId(row.link);
  if (goId) return `go:${goId}`;
  return year && number ? `da:${year}:set1:main:q${number}` : clean(row.question_uid);
};

const normalizeSubjectSlug = (value = "") => {
  const raw = clean(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return SUBJECT_ALIASES[raw] || null;
};

const normalizeType = (value = "") => {
  const token = clean(value).toUpperCase();
  return TYPE_TOKENS.has(token) ? token : "UNKNOWN";
};

const normalizeOptions = (questionHtml = "") => extractEmbeddedOptions(questionHtml).map((option: any) => ({
  label: clean(option?.label).toUpperCase(),
  text: clean(option?.text || option?.html),
  html: clean(option?.html || option?.text),
}));

const normalizeAnswer = (record: any, question: QuestionRow): AnswerRecord | null => {
  if (!record || typeof record !== "object") return null;
  return {
    answer_uid: clean(record.answer_uid || question.question_uid),
    question_uid: question.question_uid,
    type: normalizeType(record.type || question.type),
    answer: record.answer ?? null,
    tolerance: record.tolerance || null,
    source: record.source || null,
  };
};

const normalizeRow = (row: any, answerRecords: Record<string, any>): QuestionRow => {
  const questionUid = buildUid(row);
  const year = getYear(row);
  const subjectSlug = normalizeSubjectSlug(row.subjectSlug || row.subject || row.tags?.[1]) || "artificial-intelligence";
  const subjectLabel = SUBJECT_LABELS.get(subjectSlug) || "Artificial Intelligence";
  const type = normalizeType(row.type || row.tags?.find((tag: string) => TYPE_TOKENS.has(String(tag).toUpperCase())));
  const questionHtml = clean(row.question || row.questionHtml);
  const answer = normalizeAnswer(answerRecords[questionUid], {
    question_uid: questionUid,
    type,
  });
  const yearSetIdentity = buildTrackYearSetKey("da", year, 1);

  return {
    ...row,
    question_uid: questionUid,
    track: "da",
    uid: questionUid,
    id: questionUid,
    title: clean(row.title) || `GATE DA ${year} | Question: ${getQuestionNumber(row)}`,
    question: questionHtml,
    preview: clean(row.preview || questionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).slice(0, 220),
    subject: subjectLabel,
    subjectSlug,
    subjectLabel,
    type,
    normalizedOptions: normalizeOptions(questionHtml),
    answerMeta: answer,
    exam: {
      paper: "DA",
      track: "da",
      year,
      set: 1,
      yearSetKey: `${year}-s1`,
      yearSetIdentity,
      yearSetLabel: `GATE DA ${year}`,
      label: `GATE DA ${year}`,
      exam_uid: questionUid,
    },
    year,
    yearSetKey: `${year}-s1`,
    yearSetIdentity,
    yearSetLabel: `GATE DA ${year}`,
    subtopics: [],
    tags: Array.from(new Set([...(Array.isArray(row.tags) ? row.tags : []), subjectSlug])),
    searchText: clean(row.searchText || `${row.title} ${subjectLabel} ${row.preview || questionHtml}`),
    detailShardKey: String(row.detailShardKey || year),
  };
};

export class DaQuestionService {
  static questions: QuestionRow[] = [];
  static loaded = false;
  static loading: Promise<void> | null = null;
  static loadError = "";
  static manifest: any = null;
  static answersByQuestionUid: Record<string, any> = {};
  static questionsByUid = new Map<string, QuestionRow>();
  static detailCache = new Map<string, QuestionRow>();
  static detailShardCache = new Map<string, Record<string, any>>();
  static detailShardPromises = new Map<string, Promise<Record<string, any>>>();
  static structuredTagsCache: StructuredTags | null = null;

  static slugifyToken(value = "") {
    return clean(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  static normalizeSubjectSlug(value = "") {
    return normalizeSubjectSlug(value);
  }

  static getSubjectLabelBySlug(slug = "") {
    return SUBJECT_LABELS.get(normalizeSubjectSlug(slug) || slug) || "Unknown";
  }

  static getSubjectSlugByLabel(label = "") {
    return normalizeSubjectSlug(label) || "unknown";
  }

  static normalizeTypeToken(value = "") {
    return normalizeType(value).toLowerCase();
  }

  static getNormalizedOptions(question: any = {}) {
    return Array.isArray(question.normalizedOptions) && question.normalizedOptions.length
      ? question.normalizedOptions
      : normalizeOptions(question.question || "");
  }

  static getAnswerForQuestion(question: any = {}) {
    const uid = clean(question.question_uid) || buildUid(question);
    return normalizeAnswer(this.answersByQuestionUid[uid], question);
  }

  static getStorageKeyForQuestion(question: any = {}) {
    return clean(question.question_uid) || buildUid(question) || null;
  }

  static getDetailShardKey(question: any = {}) {
    return clean(question.detailShardKey || question.exam?.year || question.year) || "unknown";
  }

  static async init() {
    if (this.loaded) return;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const root = baseUrl();
      const [manifestResponse, searchResponse, answersResponse] = await Promise.all([
        fetch(`${root}data/da/manifest.json`, { cache: "no-cache" }),
        fetch(`${root}data/da/search-index.json`, { cache: "no-cache" }),
        fetch(`${root}data/da/answers-by-question-uid-v1.json`, { cache: "no-cache" }),
      ]);
      if (!manifestResponse.ok || !searchResponse.ok || !answersResponse.ok) {
        throw new Error("Failed to load GATE DA question data.");
      }

      const [manifest, searchPayload, answerPayload] = await Promise.all([
        manifestResponse.json(),
        searchResponse.json(),
        answersResponse.json(),
      ]);
      const rows = Array.isArray(searchPayload) ? searchPayload : searchPayload?.questions;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("GATE DA search index is invalid.");
      }

      this.manifest = manifest;
      this.answersByQuestionUid = answerPayload?.records_by_question_uid || {};
      this.questions = rows.map((row) => normalizeRow(row, this.answersByQuestionUid));
      this.questionsByUid = new Map(this.questions.map((question) => [question.question_uid, question]));
      this.structuredTagsCache = null;
      this.loaded = true;
      this.loadError = "";
    })()
      .catch((error) => {
        this.loaded = false;
        this.loadError = error.message || "Unable to load GATE DA questions.";
        throw error;
      })
      .finally(() => {
        this.loading = null;
      });

    return this.loading;
  }

  static async loadDetailShard(shardKey = "unknown") {
    const key = clean(shardKey) || "unknown";
    if (this.detailShardCache.has(key)) return this.detailShardCache.get(key) || {};
    if (this.detailShardPromises.has(key)) return this.detailShardPromises.get(key);
    const promise = fetch(`${baseUrl()}data/da/shards/${encodeURIComponent(key)}.json`, { cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Failed to load GATE DA detail shard (${response.status}).`);
        const payload = await response.json();
        const records = payload?.recordsByQuestionUid;
        if (!records || typeof records !== "object") throw new Error("GATE DA detail shard is invalid.");
        this.detailShardCache.set(key, records);
        return records;
      })
      .finally(() => this.detailShardPromises.delete(key));
    this.detailShardPromises.set(key, promise);
    return promise;
  }

  static async ensureQuestionDetail(questionOrUid: any = null) {
    const uid = typeof questionOrUid === "string" ? clean(questionOrUid) : clean(questionOrUid?.question_uid);
    if (!uid) return null;
    if (this.detailCache.has(uid)) return this.detailCache.get(uid) || null;
    const indexed = this.questionsByUid.get(uid) || (typeof questionOrUid === "object" ? questionOrUid : null);
    if (!indexed) return null;
    const records = await this.loadDetailShard(this.getDetailShardKey(indexed));
    const detailed = normalizeRow({ ...indexed, ...(records[uid] || {}) }, this.answersByQuestionUid);
    this.detailCache.set(uid, detailed);
    this.questionsByUid.set(uid, detailed);
    return detailed;
  }

  static getStructuredTags(): StructuredTags {
    if (this.structuredTagsCache) return this.structuredTagsCache;
    const categories = Array.isArray(this.manifest?.categories) ? this.manifest.categories : [];
    const subjects = DA_SUBJECTS.map((subject) => ({
      ...subject,
      slug: `${DA_FILTER_SUBJECT_PREFIX}${subject.slug}`,
      count: this.questions.filter((question) => question.subjectSlug === subject.slug).length,
    })).filter((subject) => subject.count > 0);
    const yearSets: YearSetOption[] = categories.map((entry: any) => ({
      key: buildTrackYearSetKey("da", Number(entry.year), 1) as string,
      legacyKey: `${Number(entry.year)}-s1`,
      yearSetIdentity: buildTrackYearSetKey("da", Number(entry.year), 1) as string,
      year: Number(entry.year),
      set: 1,
      label: `${Number(entry.year)} Set 1`,
      count: Number(entry.count || 0),
      track: "da",
    }));
    const structuredSubtopics: Record<string, SubtopicOption[]> = Object.fromEntries(subjects.map((subject) => [subject.slug, []]));
    this.structuredTagsCache = {
      yearSets,
      years: yearSets.map((entry) => entry.key),
      subjects,
      topics: subjects.map((subject) => subject.slug),
      structuredSubtopics,
      structuredTopics: Object.fromEntries(subjects.map((subject) => [subject.label, []])),
      questionTypes: ["MCQ", "MSQ", "NAT"],
      minYear: Math.min(...yearSets.map((entry) => entry.year)),
      maxYear: Math.max(...yearSets.map((entry) => entry.year)),
      hideYearFilters: false,
    };
    return this.structuredTagsCache;
  }

  static reset() {
    this.questions = [];
    this.loaded = false;
    this.loading = null;
    this.loadError = "";
    this.manifest = null;
    this.answersByQuestionUid = {};
    this.questionsByUid = new Map();
    this.detailCache = new Map();
    this.detailShardCache = new Map();
    this.detailShardPromises = new Map();
    this.structuredTagsCache = null;
  }
}

export default DaQuestionService;
