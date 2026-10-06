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

export const ISRO_SUBJECTS: SubjectOption[] = [
  { slug: "algorithms", label: "Algorithms & Programming" },
  { slug: "coa", label: "Computer Organization & Architecture" },
  { slug: "compiler", label: "Compiler Design" },
  { slug: "cn", label: "Computer Networks" },
  { slug: "dbms", label: "Databases" },
  { slug: "digital-logic", label: "Digital Logic" },
  { slug: "discrete-math", label: "Discrete Mathematics" },
  { slug: "engg-math", label: "Engineering Mathematics" },
  { slug: "general-aptitude", label: "General Aptitude" },
  { slug: "os", label: "Operating Systems" },
  { slug: "toc", label: "Theory of Computation" },
  { slug: "other", label: "Specialized CS & Others" },
];

const SUBJECT_ALIASES: Record<string, string> = {
  "algorithms": "algorithms",
  "coa": "coa",
  "computer-organization-and-architecture": "coa",
  "computer-organization": "coa",
  "compiler": "compiler",
  "compiler-design": "compiler",
  "cn": "cn",
  "computer-networks": "cn",
  "computer-network": "cn",
  "dbms": "dbms",
  "databases": "dbms",
  "database-management-systems": "dbms",
  "digital-logic": "digital-logic",
  "digital-electronics": "digital-logic",
  "discrete-math": "discrete-math",
  "discrete-mathematics": "discrete-math",
  "engg-math": "engg-math",
  "engineering-mathematics": "engg-math",
  "general-aptitude": "general-aptitude",
  "aptitude": "general-aptitude",
  "ga": "general-aptitude",
  "os": "os",
  "operating-systems": "os",
  "operating-system": "os",
  "toc": "toc",
  "theory-of-computation": "toc",
  "other": "other",
  "specialized-cs": "other",
  "specialized-cs-and-others": "other",
};

const SUBJECT_LABELS = new Map(ISRO_SUBJECTS.map((subject) => [subject.slug, subject.label]));
export const ISRO_FILTER_SUBJECT_PREFIX = "isro:";
const TYPE_TOKENS = new Set(["MCQ", "MSQ", "NAT", "MTA"]);

const baseUrl = () => (
  import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
);

const clean = (value: unknown) => String(value ?? "").trim();

const normalizeSubjectSlug = (value = "") => {
  const raw = clean(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return SUBJECT_ALIASES[raw] || null;
};

const normalizeType = (value = "") => {
  const token = clean(value).toUpperCase();
  return TYPE_TOKENS.has(token) ? token : "MCQ";
};

const formatSubtopicLabel = (subtopic = "") => {
  const text = clean(subtopic).replace(/^isro:/i, "").replace(/[-_]+/g, " ");
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeOptions = (row: any = {}) => {
  if (Array.isArray(row.options) && row.options.length > 0) {
    return row.options.map((option: any) => ({
      label: clean(option?.label).toUpperCase(),
      text: clean(option?.text || option?.html),
      html: clean(option?.html || option?.text),
    }));
  }
  return extractEmbeddedOptions(clean(row.question || row.questionHtml)).map((option: any) => ({
    label: clean(option?.label).toUpperCase(),
    text: clean(option?.text || option?.html),
    html: clean(option?.html || option?.text),
  }));
};

const normalizeAnswer = (record: any, question: QuestionRow): AnswerRecord | null => {
  if (!record || typeof record !== "object") return null;
  return {
    answer_uid: clean(record.answer_uid || question.question_uid),
    question_uid: question.question_uid,
    type: normalizeType(record.type || question.type),
    answer: record.answer ?? null,
    tolerance: record.tolerance || null,
    source: record.source || { kind: "official_isro_key" },
  };
};

const normalizeRow = (row: any, answerRecords: Record<string, any>): QuestionRow => {
  const questionUid = clean(row.question_uid);
  const year = Number(row.origin_year || row.year || clean(row.tags).match(/isro-(\d{4})/i)?.[1] || 0);
  const subjectSlug = normalizeSubjectSlug(row.subjectSlug || row.subject) || "other";
  const subjectLabel = SUBJECT_LABELS.get(subjectSlug) || "Specialized CS & Others";
  const type = normalizeType(row.type || "MCQ");
  const rawQuestionHtml = clean(row.question || row.questionHtml);
  const normalizedOpts = normalizeOptions(row);
  const hasEmbeddedList = /<ol\b[^>]*>/i.test(rawQuestionHtml) || /<ul\b[^>]*>/i.test(rawQuestionHtml);

  let questionHtml = rawQuestionHtml;
  if (!hasEmbeddedList && normalizedOpts.length > 0) {
    const validOpts = normalizedOpts.filter((opt: any) => clean(opt?.html || opt?.text));
    if (validOpts.length > 0) {
      const optionsHtml = `<ol class="question-options" style="list-style-type: upper-alpha; margin-top: 1rem; padding-left: 1.75rem;">${validOpts
        .map((opt: any) => `<li style="margin: 0.4rem 0; padding-left: 0.35rem;">${clean(opt?.html || opt?.text || "")}</li>`)
        .join("")}</ol>`;
      questionHtml = questionHtml ? `${questionHtml}<br><br>${optionsHtml}` : optionsHtml;
    }
  }

  const marks = Number(row.marks) || (year >= 2023 ? 1 : 3);
  const negativeMarks = Number(row.negativeMarks) || (year >= 2023 ? 0.33 : 1);
  const answer = normalizeAnswer(answerRecords[questionUid] || {
    question_uid: questionUid,
    type,
    answer: row.answer,
    marks,
    negativeMarks,
  }, {
    question_uid: questionUid,
    type,
  } as QuestionRow);

  const yearSetIdentity = buildTrackYearSetKey("isro", year, 1) as string;
  const rawSubtopic = clean(row.subtopic);
  const subtopicSlug = rawSubtopic
    ? `isro:${rawSubtopic.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
    : null;
  const subtopics: SubtopicOption[] = subtopicSlug
    ? [{ slug: subtopicSlug, label: formatSubtopicLabel(rawSubtopic) }]
    : [];

  return {
    ...row,
    question_uid: questionUid,
    track: "isro",
    uid: questionUid,
    id: questionUid,
    title: clean(row.title) || `ISRO CS ${year} | Question ${clean(row.question_uid).split(":q")[1] || ""}`,
    question: questionHtml,
    preview: clean(row.preview || rawQuestionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).slice(0, 220),
    subject: subjectLabel,
    subjectSlug,
    subjectLabel,
    type,
    marks,
    negativeMarks,
    normalizedOptions: normalizedOpts,
    options: row.options || normalizedOpts,
    answerMeta: answer,
    answer_meta: answer,
    exam: {
      paper: "ISRO CS",
      track: "isro",
      year,
      set: 1,
      yearSetKey: yearSetIdentity,
      yearSetIdentity,
      yearSetLabel: `ISRO ${year}`,
      label: `ISRO ${year}`,
      exam_uid: clean(row.exam_uid) || questionUid,
    },
    year,
    yearSetKey: yearSetIdentity,
    yearSetIdentity,
    yearSetLabel: `ISRO ${year}`,
    subtopics,
    tags: Array.from(new Set([
      ...(Array.isArray(row.tags) ? row.tags : []),
      "isro",
      "isro-cs",
      `isro-${year}`,
      subjectSlug,
    ])),
    searchText: clean(row.searchText || `${row.title} ${subjectLabel} ${rawSubtopic} ${row.preview || questionHtml}`).toLowerCase(),
    detailShardKey: clean(row.detailShardKey) || `isro-${year}-s0`,
  };
};

export class IsroQuestionService {
  static questions: QuestionRow[] = [];
  static loaded = false;
  static loading: Promise<void> | null = null;
  static loadError = "";
  static answersByQuestionUid: Record<string, any> = {};
  static questionsByUid = new Map<string, QuestionRow>();
  static questionsByYear = new Map<number, QuestionRow[]>();
  static structuredTagsCache: StructuredTags | null = null;

  static slugifyToken(value = "") {
    return clean(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  static normalizeSubjectSlug(value = "") {
    return normalizeSubjectSlug(value);
  }

  static getSubjectLabelBySlug(slug = "") {
    return SUBJECT_LABELS.get(normalizeSubjectSlug(slug) || slug) || "Specialized CS & Others";
  }

  static getSubjectSlugByLabel(label = "") {
    return normalizeSubjectSlug(label) || "other";
  }

  static normalizeTypeToken(value = "") {
    return normalizeType(value).toLowerCase();
  }

  static getNormalizedOptions(question: any = {}) {
    return Array.isArray(question.normalizedOptions) && question.normalizedOptions.length
      ? question.normalizedOptions
      : normalizeOptions(question);
  }

  static getAnswerForQuestion(question: any = {}) {
    const uid = clean(question.question_uid || question.uid || question.id);
    if (!uid) return null;
    return normalizeAnswer(this.answersByQuestionUid[uid], question as QuestionRow);
  }

  static getStorageKeyForQuestion(question: any = {}) {
    return clean(question.question_uid || question.uid || question.id) || null;
  }

  static getQuestionByUid(uid = ""): QuestionRow | null {
    const cleanUid = clean(uid);
    if (!cleanUid) return null;
    return this.questionsByUid.get(cleanUid) || null;
  }

  static getQuestionsByYearSet(yearSetKeyOrYear: string | number) {
    const parsedYear = Number(
      String(yearSetKeyOrYear).match(/\b(\d{4})\b/)?.[1] || yearSetKeyOrYear
    );
    if (Number.isFinite(parsedYear) && this.questionsByYear.has(parsedYear)) {
      return this.questionsByYear.get(parsedYear) || [];
    }
    return [];
  }

  static async init() {
    if (this.loaded) return;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const root = baseUrl();
      const [questionsResponse, answersResponse] = await Promise.all([
        fetch(`${root}data/isro/isro-all.json`, { cache: "no-cache" }),
        fetch(`${root}data/isro/answers-isro.json`, { cache: "no-cache" }),
      ]);
      if (!questionsResponse.ok || !answersResponse.ok) {
        throw new Error("Failed to load ISRO CS question data.");
      }

      const [questionsPayload, answerPayload] = await Promise.all([
        questionsResponse.json(),
        answersResponse.json(),
      ]);
      const rows = Array.isArray(questionsPayload) ? questionsPayload : [];
      if (rows.length === 0) {
        throw new Error("ISRO question index is empty or invalid.");
      }

      this.answersByQuestionUid = answerPayload?.records_by_question_uid || {};
      this.questions = rows.map((row) => normalizeRow(row, this.answersByQuestionUid));
      this.questionsByUid = new Map(this.questions.map((question) => [question.question_uid, question]));

      const byYear = new Map<number, QuestionRow[]>();
      this.questions.forEach((q: any) => {
        const year = Number(q.year || q.exam?.year || 0);
        if (!byYear.has(year)) {
          byYear.set(year, []);
        }
        byYear.get(year)!.push(q);
      });
      this.questionsByYear = byYear;

      this.structuredTagsCache = null;
      this.loaded = true;
      this.loadError = "";
    })()
      .catch((error) => {
        this.loaded = false;
        this.loadError = error.message || "Unable to load ISRO questions.";
        throw error;
      })
      .finally(() => {
        this.loading = null;
      });

    return this.loading;
  }

  static async ensureQuestionDetail(questionOrUid: any = null) {
    const uid = typeof questionOrUid === "string" ? clean(questionOrUid) : clean(questionOrUid?.question_uid);
    if (!uid) return null;
    if (!this.loaded) {
      await this.init();
    }
    return this.questionsByUid.get(uid) || (typeof questionOrUid === "object" ? questionOrUid : null);
  }

  static getStructuredTags(): StructuredTags {
    if (this.structuredTagsCache) return this.structuredTagsCache;

    const subjects = ISRO_SUBJECTS.map((subject) => ({
      ...subject,
      slug: `${ISRO_FILTER_SUBJECT_PREFIX}${subject.slug}`,
      count: this.questions.filter((question) => question.subjectSlug === subject.slug).length,
    })).filter((subject) => subject.count > 0);

    const distinctYears = Array.from(this.questionsByYear.keys()).sort((a, b) => b - a);

    const yearSets: YearSetOption[] = distinctYears.map((year) => {
      const key = buildTrackYearSetKey("isro", year, 1) as string;
      const count = (this.questionsByYear.get(year) || []).length;
      return {
        key,
        legacyKey: key,
        yearSetIdentity: key,
        year,
        set: 1,
        label: `ISRO ${year}`,
        count,
        track: "isro",
      };
    });

    const structuredSubtopics: Record<string, SubtopicOption[]> = {};
    subjects.forEach((subject) => {
      const rawSubjectSlug = subject.slug.replace(/^isro:/, "");
      const subjectQuestions = this.questions.filter((q) => q.subjectSlug === rawSubjectSlug);
      const subtopicMap = new Map<string, SubtopicOption>();

      subjectQuestions.forEach((q) => {
        (q.subtopics || []).forEach((st: any) => {
          if (st?.slug && !subtopicMap.has(st.slug)) {
            subtopicMap.set(st.slug, {
              slug: st.slug,
              label: st.label || formatSubtopicLabel(st.slug),
            });
          }
        });
      });

      structuredSubtopics[subject.slug] = Array.from(subtopicMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    });

    this.structuredTagsCache = {
      yearSets,
      years: yearSets.map((entry) => entry.key),
      subjects,
      topics: subjects.map((subject) => subject.slug),
      structuredSubtopics,
      structuredTopics: Object.fromEntries(subjects.map((subject) => [subject.label, []])),
      questionTypes: ["MCQ", "MSQ", "MTA"],
      minYear: distinctYears.length > 0 ? Math.min(...distinctYears) : 2007,
      maxYear: distinctYears.length > 0 ? Math.max(...distinctYears) : 2025,
      hideYearFilters: false,
    };

    return this.structuredTagsCache;
  }

  static reset() {
    this.questions = [];
    this.loaded = false;
    this.loading = null;
    this.loadError = "";
    this.answersByQuestionUid = {};
    this.questionsByUid = new Map();
    this.questionsByYear = new Map();
    this.structuredTagsCache = null;
  }
}

export default IsroQuestionService;
