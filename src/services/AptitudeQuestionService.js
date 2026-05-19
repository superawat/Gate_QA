export const APTITUDE_INIT_CACHE_VERSION = "gateqa-apt-init-cache-v3";

const APTITUDE_CACHE_KEY = `gateqa_aptitude_question_cache_${APTITUDE_INIT_CACHE_VERSION}`;
const APTITUDE_INDEX_FILE = "aptitude-search-index.json";
const OPTION_LABELS = ["A", "B", "C", "D"];

const SUBJECT_ENUM = [
  { slug: "english", label: "English" },
  { slug: "quant", label: "Quant", aliases: ["mathematics", "math", "maths", "quantitative-aptitude"] },
  { slug: "reasoning", label: "Reasoning" },
];

const TAXONOMY = {
  English: [
    "Spot the Error",
    "Sentence Improvement",
    "Narration",
    "Active Passive",
    "Para Jumble",
    "Fill in the Blanks",
    "Cloze Test",
    "Comprehension",
    "One Word Substitution",
    "Idioms",
    "Synonyms",
    "Antonyms",
    "Spelling Check",
    "Homonyms",
    "Miscellaneous",
  ],
  Quant: [
    "Number System",
    "HCF and LCM",
    "Simplification",
    "Trigonometry",
    "Height and Distance",
    "Mensuration",
    "Geometry",
    "Algebra",
    "Ratio and Proportion",
    "Partnership",
    "Mixture and Alligation",
    "Work and Time",
    "Pipe and Cistern",
    "Time, Speed and Distance",
    "Linear/Circular Race",
    "Boat and Stream",
    "Percentage",
    "Profit and Loss",
    "Discount",
    "Simple Interest",
    "Compound Interest",
    "Installment",
    "Average",
    "Data Interpretation",
    "Mean, Median & Mode",
    "Coordinate Geometry",
    "Probability",
  ],
  Reasoning: [
    "Coding - Decoding",
    "Odd one out",
    "Analogy",
    "Word Arrangement",
    "Address",
    "Decision Making",
    "Order and Ranking",
    "Mathematical Operations",
    "Blood Relation",
    "Arithmetic Reasoning",
    "Calendar",
    "Word Formation",
    "Series",
    "Missing Number",
    "Statement And Conclusion",
    "Syllogism",
    "Inequality",
    "Directions",
    "Sitting Arrangement",
    "Puzzle",
    "Miscellaneous",
  ],
};

export class AptitudeQuestionService {
  static questions = [];
  static loaded = false;
  static loadError = "";
  static sourceUrl = "";
  static questionsByUid = new Map();
  static detailCache = new Map();
  static detailShardCache = new Map();
  static detailShardPromises = new Map();
  static pendingLoad = null;

  static SUBJECT_ENUM = SUBJECT_ENUM;
  static TAXONOMY = TAXONOMY;
  static OPTION_LABELS = OPTION_LABELS;

  static getCacheKey() {
    return APTITUDE_CACHE_KEY;
  }

  static clearInitCache() {
    try {
      localStorage.removeItem(APTITUDE_CACHE_KEY);
    } catch {
      // noop
    }
  }

  static slugifyToken(value = "") {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static normalizeSubjectSlug(value = "") {
    const raw = String(value || "").trim();
    if (!raw) {
      return null;
    }
    const normalized = this.slugifyToken(raw);
    const match = SUBJECT_ENUM.find((subject) => (
      subject.slug === normalized
      || this.slugifyToken(subject.label) === normalized
      || (subject.aliases || []).includes(normalized)
    ));
    return match?.slug || null;
  }

  static getSubjectLabelBySlug(slug = "") {
    const normalized = this.slugifyToken(slug);
    return SUBJECT_ENUM.find((subject) => subject.slug === normalized)?.label || "Unknown";
  }

  static getSubjectSlugByLabel(label = "") {
    return this.normalizeSubjectSlug(label) || "unknown";
  }

  static normalizeTypeToken(rawType = "") {
    return String(rawType || "").trim().toLowerCase() === "mcq" ? "mcq" : "unknown";
  }

  static stripHtmlToText(html = "") {
    return String(html || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  static parseYearSetKey() {
    return null;
  }

  static extractYearSetFromTag() {
    return null;
  }

  static buildYearSetKey() {
    return null;
  }

  static formatYearSetLabel(value = "") {
    return String(value || "");
  }

  static getNormalizedOptions(question = {}) {
    if (Array.isArray(question.normalizedOptions)) {
      return question.normalizedOptions;
    }
    const options = Array.isArray(question.options) ? question.options : [];
    const normalizedOptions = options.slice(0, OPTION_LABELS.length).map((option, index) => {
      const html = String(option || "").trim();
      const text = this.stripHtmlToText(html);
      return {
        label: OPTION_LABELS[index],
        text: text || html,
        html: html || text,
      };
    });
    question.normalizedOptions = normalizedOptions;
    return normalizedOptions;
  }

  static normalizeQuestion(row = {}) {
    const uid = String(row.uid || row.u || row.question_uid || "").trim();
    const subject = String(row.subject || row.s || "Unknown").trim();
    const subjectSlug = this.normalizeSubjectSlug(row.subjectSlug || row.ss || subject) || this.slugifyToken(subject);
    const subjectLabel = this.getSubjectLabelBySlug(subjectSlug);
    const subtopicLabel = String(row.subtopic || row.st || "General").trim();
    const subtopicSlug = this.slugifyToken(row.subtopicSlug || row.sts || subtopicLabel);
    const options = Array.isArray(row.options) ? row.options.slice(0, OPTION_LABELS.length) : [];
    const type = this.normalizeTypeToken(row.type || row.t || "MCQ");
    const answer = String(row.answer || row.a || "").trim().toUpperCase();
    const questionHtml = String(row.questionHtml || row.question || row.q || "").trim();
    const parsedYear = Number.parseInt(row.year ?? row.y ?? "", 10);
    const year = Number.isInteger(parsedYear) ? parsedYear : null;
    const preview = String(row.preview || row.text || row.x || this.stripHtmlToText(questionHtml)).trim();
    const searchText = [
      row.searchText || row.search || this.stripHtmlToText(questionHtml) || preview,
      options.join(" "),
      subjectLabel,
      subtopicLabel,
      uid,
    ].join(" ").toLowerCase();

    const normalizedOptions = options.map((option, index) => {
      const html = String(option || "").trim();
      const text = this.stripHtmlToText(html);
      return {
        label: OPTION_LABELS[index],
        text: text || html,
        html: html || text,
      };
    });

    return {
      question_uid: uid,
      uid,
      id: uid,
      title: `${subjectLabel} Practice`,
      question: questionHtml,
      preview,
      options,
      normalizedOptions,
      answer,
      answerMeta: {
        type: "MCQ",
        answer,
        tolerance: null,
        source: "aptitude_embedded",
      },
      type,
      subject: subjectLabel,
      subjectLabel,
      subjectSlug,
      subtopics: [{ slug: subtopicSlug, label: subtopicLabel }],
      tags: [subjectSlug, subtopicSlug],
      exam: {
        paper: "Aptitude",
        year,
        set: null,
        yearSetKey: null,
        label: year ? `Aptitude ${year}` : "Aptitude",
      },
      year,
      yearSetLabel: year ? `Aptitude ${year}` : "Aptitude",
      link: "",
      searchText,
      canonical: {
        questionUid: uid,
        type,
        subjectSlug,
        subtopics: [{ slug: subtopicSlug, label: subtopicLabel }],
        options: normalizedOptions,
      },
      _detailShard: String(row.shard || row.sh || row.detailShard || "").trim(),
    };
  }

  static buildIndexes() {
    this.questionsByUid = new Map(
      this.questions
        .filter((question) => question?.question_uid)
        .map((question) => [question.question_uid, question])
    );
  }

  static getBaseUrl() {
    return import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
  }

  static getQuestions() {
    return this.questions;
  }

  static getQuestionByUid(uid = "") {
    const normalizedUid = String(uid || "").trim();
    return this.questionsByUid.get(normalizedUid) || null;
  }

  static async ensureQuestionDetail(question = {}) {
    if (!question?.question_uid) {
      return question;
    }
    const uid = String(question.question_uid || "").trim();
    if (this.detailCache.has(uid)) {
      return this.detailCache.get(uid);
    }

    const indexed = this.getQuestionByUid(uid) || question;
    const shard = indexed._detailShard || question._detailShard;
    if (!shard) {
      return indexed;
    }

    await this.loadDetailShard(shard);
    return this.detailCache.get(uid) || this.getQuestionByUid(uid) || indexed;
  }

  static async loadDetailShard(shard = "") {
    const normalizedShard = String(shard || "").trim().replace(/^\/+/, "");
    if (!normalizedShard) {
      throw new Error("Missing aptitude detail shard.");
    }
    if (this.detailShardCache.has(normalizedShard)) {
      return this.detailShardCache.get(normalizedShard);
    }
    if (this.detailShardPromises.has(normalizedShard)) {
      return this.detailShardPromises.get(normalizedShard);
    }

    const promise = (async () => {
      const dataUrl = `${this.getBaseUrl()}${normalizedShard}`;
      const response = await fetch(dataUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load aptitude shard (${response.status}).`);
      }
      const payload = await response.json();
      if (!Array.isArray(payload)) {
        throw new Error("Aptitude shard payload is invalid.");
      }

      const detailedQuestions = payload
        .filter((row) => row && typeof row === "object")
        .map((row) => this.normalizeQuestion({ ...row, shard: normalizedShard }))
        .filter((row) => row.question_uid && row.question);

      detailedQuestions.forEach((detail) => {
        this.detailCache.set(detail.question_uid, detail);
        this.questionsByUid.set(detail.question_uid, detail);
      });
      this.detailShardCache.set(normalizedShard, detailedQuestions);
      return detailedQuestions;
    })();

    this.detailShardPromises.set(normalizedShard, promise);
    try {
      return await promise;
    } finally {
      this.detailShardPromises.delete(normalizedShard);
    }
  }

  static getRandomQuestion() {
    if (!this.questions.length) {
      return null;
    }
    return this.questions[Math.floor(Math.random() * this.questions.length)];
  }

  static getStructuredTags() {
    const subjectCounts = new Map(SUBJECT_ENUM.map((subject) => [subject.slug, 0]));
    const structuredSubtopics = {};
    SUBJECT_ENUM.forEach((subject) => {
      structuredSubtopics[subject.slug] = new Map();
    });

    this.questions.forEach((question) => {
      const subjectSlug = this.normalizeSubjectSlug(question.subjectSlug) || "unknown";
      if (subjectCounts.has(subjectSlug)) {
        subjectCounts.set(subjectSlug, subjectCounts.get(subjectSlug) + 1);
      }
      const subtopic = Array.isArray(question.subtopics) ? question.subtopics[0] : null;
      const subtopicSlug = this.slugifyToken(subtopic?.slug || subtopic?.label || "");
      const subtopicLabel = String(subtopic?.label || "").trim();
      if (structuredSubtopics[subjectSlug] && subtopicSlug && subtopicLabel) {
        structuredSubtopics[subjectSlug].set(subtopicSlug, {
          slug: subtopicSlug,
          label: subtopicLabel,
        });
      }
    });

    const subjects = SUBJECT_ENUM.filter((subject) => (subjectCounts.get(subject.slug) || 0) > 0)
      .map((subject) => ({
        ...subject,
        count: subjectCounts.get(subject.slug) || 0,
      }));

    const normalizedStructuredSubtopics = {};
    subjects.forEach((subject) => {
      const knownOrder = TAXONOMY[subject.label] || [];
      const orderIndex = new Map(knownOrder.map((label, index) => [this.slugifyToken(label), index]));
      normalizedStructuredSubtopics[subject.slug] = Array.from(
        structuredSubtopics[subject.slug]?.values() || []
      ).sort((left, right) => {
        const leftIndex = orderIndex.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = orderIndex.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }
        return left.label.localeCompare(right.label);
      });
    });

    const structuredTopics = {};
    subjects.forEach((subject) => {
      structuredTopics[subject.label] = (normalizedStructuredSubtopics[subject.slug] || [])
        .map((entry) => entry.label);
    });

    return {
      yearSets: [],
      years: [],
      subjects,
      topics: subjects.map((subject) => subject.slug),
      structuredSubtopics: normalizedStructuredSubtopics,
      structuredTopics,
      minYear: 0,
      maxYear: 0,
      questionTypes: ["MCQ"],
      hideYearFilters: true,
    };
  }

  static _readCache() {
    return null;
  }

  static _writeCache() {
    // The aptitude index is small enough to refetch and detail shards are lazy-loaded.
    // Avoid localStorage writes because the full data set now exceeds browser quota.
  }

  static async init() {
    if (this.loaded) {
      return;
    }
    if (this.pendingLoad) {
      return this.pendingLoad;
    }

    this.pendingLoad = (async () => {
      const cached = this._readCache();
      if (cached) {
        this.sourceUrl = cached.sourceUrl || "";
        this.questions = cached.questions;
        this.buildIndexes();
        this.loaded = true;
        this.loadError = "";
        return;
      }

      const dataUrl = `${this.getBaseUrl()}${APTITUDE_INDEX_FILE}`;
      const response = await fetch(dataUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load aptitude index (${response.status}).`);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : payload?.questions;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Aptitude index payload is invalid.");
      }

      this.sourceUrl = dataUrl;
      this.detailCache = new Map();
      this.detailShardCache = new Map();
      this.detailShardPromises = new Map();
      this.questions = rows
        .filter((row) => row && typeof row === "object")
        .map((row) => this.normalizeQuestion(row))
        .filter((question) => question.question_uid);
      this.buildIndexes();
      this.loaded = true;
      this.loadError = "";
      this._writeCache();
    })();

    try {
      await this.pendingLoad;
    } catch (error) {
      this.loadError = error.message || "Unable to load aptitude questions.";
      this.questions = [];
      this.questionsByUid = new Map();
      this.loaded = false;
      throw error;
    } finally {
      this.pendingLoad = null;
    }
  }
}
