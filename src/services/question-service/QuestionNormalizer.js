import {
  getExamUidFromQuestion,
  getCanonicalExamUidFromQuestion,
  parseExamUid,
} from "../../utils/examUid.js";
import { extractEmbeddedOptions } from "../../utils/stripEmbeddedOptions.js";

export const YEAR_SET_TAG_PATTERN = /gate(?:cse|it)?-?(\d{4})(?:-set(\d+))?/i;
export const TITLE_YEAR_SET_PATTERN =
  /GATE\s+(?:CSE|IT)\s+(\d{4})(?:\s*[| ]\s*Set\s*(\d+))?/i;
export const LINK_YEAR_SET_PATTERN = /gate-(?:cse|it)-(\d{4})(?:-set-(\d+))?/i;
export const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export function extractGateOverflowId(link = "") {
  const raw = String(link || "").trim();
  if (!raw) {
    return null;
  }
  const absoluteMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  );
  if (absoluteMatch) {
    return absoluteMatch[1];
  }
  const relativeMatch = raw.match(/^\/?(\d+)(?:[/?#]|$)/);
  return relativeMatch ? relativeMatch[1] : null;
}

export function hashString(value = "") {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function buildQuestionUid(question = {}) {
  if (question.question_uid) {
    return String(question.question_uid);
  }
  const goId = this.extractGateOverflowId(question.link || "");
  if (goId) {
    return `go:${goId}`;
  }
  const key = `${question.title || ""}||${question.question || ""}||${question.link || ""}`;
  return `local:${this.hashString(key)}`;
}

export function hasNativeJoinIdentity(question = {}) {
  if (!question || typeof question !== "object") {
    return false;
  }
  if (question.question_uid && String(question.question_uid).trim()) {
    return true;
  }
  if (this.extractGateOverflowId(question.link || "")) {
    return true;
  }
  if (question.id_str != null && question.volume != null && String(question.id_str).trim()) {
    return true;
  }
  if (getExamUidFromQuestion(question)) {
    return true;
  }
  return false;
}

export function normalizeTypeToken(rawType = "") {
  const value = String(rawType || "").trim().toLowerCase();
  if (value === "mcq") {
    return "mcq";
  }
  if (value === "msq") {
    return "msq";
  }
  if (value === "nat") {
    return "nat";
  }
  return "unknown";
}

export function stripHtmlToText(html = "") {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeQuestionOptionsFromRaw(rawOptions) {
  const options = [];
  const seen = new Set();
  const pushOption = (rawLabel, rawValue, index) => {
    const fallbackLabel = this.OPTION_LABELS[index] || null;
    const label = String(rawLabel || fallbackLabel || "")
      .trim()
      .toUpperCase();
    if (!label || seen.has(label)) {
      return;
    }

    const html = String(rawValue ?? "").trim();
    const text = this.stripHtmlToText(html);
    if (!html && !text) {
      return;
    }

    seen.add(label);
    options.push({
      label,
      text: text || html,
      html: html || text,
    });
  };

  if (Array.isArray(rawOptions)) {
    rawOptions.forEach((entry, index) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        pushOption(
          entry.label || entry.option || entry.key,
          entry.html || entry.text || entry.value || entry.optionText,
          index
        );
        return;
      }
      pushOption(this.OPTION_LABELS[index], entry, index);
    });
    return options;
  }

  if (rawOptions && typeof rawOptions === "object") {
    this.OPTION_LABELS.forEach((label, index) => {
      pushOption(label, rawOptions[label], index);
    });

    if (options.length === 0) {
      Object.entries(rawOptions).forEach(([key, value], index) => {
        pushOption(key, value, index);
      });
    }
    return options;
  }

  return options;
}

export function extractOptionsFromQuestionHtml(questionHtml = "") {
  return extractEmbeddedOptions(questionHtml);
}

export function normalizeQuestionOptions(rawOptions, questionHtml = "") {
  const fromRaw = this.normalizeQuestionOptionsFromRaw(rawOptions);
  if (fromRaw.length > 0) {
    return fromRaw;
  }
  return this.extractOptionsFromQuestionHtml(questionHtml);
}

export function getNormalizedOptions(question = {}) {
  if (!question || typeof question !== "object") {
    return [];
  }

  if (Array.isArray(question.normalizedOptions) && question.normalizedOptions.length > 0) {
    return question.normalizedOptions;
  }

  const normalizedOptions = this.normalizeQuestionOptions(question.options, question.question || "");
  question.normalizedOptions = normalizedOptions;
  if (question.canonical && typeof question.canonical === "object") {
    question.canonical.options = normalizedOptions;
  }
  return normalizedOptions;
}

export function buildYearSetKey(year, setNo) {
  const yearNum = Number.parseInt(String(year || ""), 10);
  if (!Number.isFinite(yearNum) || yearNum <= 0) {
    return null;
  }
  const parsedSet = Number.parseInt(String(setNo ?? ""), 10);
  const normalizedSet = Number.isFinite(parsedSet) && parsedSet > 0 ? parsedSet : 0;
  return `${yearNum}-s${normalizedSet}`;
}

export function parseYearSetKey(rawValue = "") {
  const value = String(rawValue || "").trim().toLowerCase();
  const match = value.match(/^(\d{4})-s(\d+)$/);
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const setNum = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year)) {
    return null;
  }
  return {
    year,
    set: Number.isFinite(setNum) && setNum > 0 ? setNum : null,
    key: `${year}-s${Number.isFinite(setNum) && setNum > 0 ? setNum : 0}`,
  };
}

export function formatYearSetLabel(yearSetKey = "") {
  const parsed = this.parseYearSetKey(yearSetKey);
  if (!parsed) {
    return String(yearSetKey || "");
  }
  if (parsed.set) {
    return `${parsed.year} Set ${parsed.set}`;
  }
  return String(parsed.year);
}

export function extractYearSetFromTag(rawTag = "") {
  const tag = String(rawTag || "").trim().toLowerCase();
  const match = tag.match(this.YEAR_SET_TAG_PATTERN);
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const set = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year)) {
    return null;
  }
  return {
    year,
    set: Number.isFinite(set) && set > 0 ? set : null,
  };
}

export function extractExamMeta(question = {}) {
  const candidates = [];

  const pushCandidate = (yearRaw, setRaw, confidence = 0) => {
    const year = Number.parseInt(String(yearRaw || ""), 10);
    const set = Number.parseInt(String(setRaw ?? ""), 10);
    if (!Number.isFinite(year) || year < 1990 || year > 2100) {
      return;
    }
    candidates.push({
      year,
      set: Number.isFinite(set) && set > 0 ? set : null,
      confidence,
    });
  };

  const parsedExamUid =
    parseExamUid(question.canonicalExamUid || "") || parseExamUid(question.exam_uid || "");
  if (parsedExamUid) {
    pushCandidate(parsedExamUid.year, parsedExamUid.set, 110);
  }

  if (question.exam && typeof question.exam === "object") {
    pushCandidate(question.exam.year, question.exam.set, 100);
  }

  const yearField = question.year;
  const fromYearTag = this.extractYearSetFromTag(yearField);
  if (fromYearTag) {
    pushCandidate(fromYearTag.year, fromYearTag.set, 95);
  } else if (yearField) {
    pushCandidate(yearField, null, 90);
  }

  if (Array.isArray(question.tags)) {
    question.tags.forEach((tag) => {
      const parsed = this.extractYearSetFromTag(tag);
      if (parsed) {
        pushCandidate(parsed.year, parsed.set, parsed.set ? 85 : 80);
      }
    });
  }

  const title = String(question.title || "");
  const titleMatch = title.match(this.TITLE_YEAR_SET_PATTERN);
  if (titleMatch) {
    pushCandidate(titleMatch[1], titleMatch[2], titleMatch[2] ? 70 : 65);
  }

  const link = String(question.link || "");
  const linkMatch = link.match(this.LINK_YEAR_SET_PATTERN);
  if (linkMatch) {
    pushCandidate(linkMatch[1], linkMatch[2], linkMatch[2] ? 60 : 55);
  }

  if (!candidates.length) {
    return {
      paper: "CSE",
      year: null,
      set: null,
      yearSetKey: null,
      label: "Unknown",
    };
  }

  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0];
  const yearSetKey = this.buildYearSetKey(best.year, best.set);

  return {
    paper: "CSE",
    year: best.year,
    set: best.set,
    yearSetKey,
    label: yearSetKey ? this.formatYearSetLabel(yearSetKey) : "Unknown",
  };
}

export function buildExamMetaFromParsedUid(parsedExamUid = null, multiSetYears = new Set()) {
  if (!parsedExamUid || !Number.isFinite(parsedExamUid.year)) {
    return {
      paper: "CSE",
      year: null,
      set: null,
      yearSetKey: null,
      label: "Unknown",
    };
  }

  const hasMultipleSets = multiSetYears.has(parsedExamUid.year);
  const set = hasMultipleSets ? parsedExamUid.set : null;
  const yearSetKey = this.buildYearSetKey(parsedExamUid.year, set);

  return {
    paper: "CSE",
    year: parsedExamUid.year,
    set,
    yearSetKey,
    label: hasMultipleSets
      ? `${parsedExamUid.year} Set ${parsedExamUid.set}`
      : String(parsedExamUid.year),
  };
}

export function buildExamMetaFromIndexQuestion(question = {}) {
  const year = Number.parseInt(String(question?.year ?? ""), 10);
  const parsedSet = Number.parseInt(String(question?.set ?? ""), 10);
  const set = Number.isFinite(parsedSet) && parsedSet > 0 ? parsedSet : null;
  const yearSetKey =
    String(question?.yearSetKey || this.buildYearSetKey(year, set) || "").trim() || null;
  const label =
    String(question?.yearSetLabel || "").trim() ||
    (yearSetKey ? this.formatYearSetLabel(yearSetKey) : "Unknown");

  return {
    paper: "CSE",
    year: Number.isFinite(year) ? year : null,
    set,
    yearSetKey,
    label,
  };
}

export function normalizeQuestion(question = {}) {
  const normalized = question && typeof question === "object" ? { ...question } : {};
  normalized.title = normalized.title || "";
  normalized.question = normalized.question || "";
  normalized.link = normalized.link || "";
  normalized.tags = Array.isArray(normalized.tags) ? normalized.tags : [];
  normalized.tagsRaw = Array.isArray(normalized.tags) ? [...normalized.tags] : [];
  normalized.question_uid = this.buildQuestionUid(normalized);
  normalized.rawExamUid = getExamUidFromQuestion(normalized) || "";
  normalized.canonicalExamUid =
    getCanonicalExamUidFromQuestion(
      {
        ...normalized,
        exam_uid: normalized.rawExamUid,
      },
      { fromYear: 2010 }
    ) || normalized.rawExamUid;
  normalized.exam_uid = normalized.canonicalExamUid || normalized.rawExamUid;

  const exam = this.extractExamMeta(normalized);
  const subjectLabel = this.resolveCanonicalSubject(normalized);
  const subjectSlug = this.getSubjectSlugByLabel(subjectLabel);
  const canonicalSubtopics = this.extractCanonicalSubtopics(normalized.tagsRaw, subjectLabel);
  const canonicalType = this.normalizeTypeToken(normalized.type);
  const normalizedOptions = this.normalizeQuestionOptions(normalized.options, normalized.question);

  normalized.canonical = {
    uid: normalized.question_uid,
    exam,
    subject: subjectSlug,
    subjectLabel,
    topics: subjectSlug === "unknown" ? [] : [subjectSlug],
    subtopics: canonicalSubtopics,
    type: canonicalType,
    options: normalizedOptions,
    tagsRaw: [...normalized.tagsRaw],
  };

  normalized.subject = subjectLabel;
  normalized.subjectLabel = subjectLabel;
  normalized.subjectSlug = subjectSlug;
  normalized.exam = exam;
  normalized.yearSetKey = exam.yearSetKey;
  normalized.yearSetLabel = exam.label;
  normalized.subtopics = canonicalSubtopics;
  normalized.type = canonicalType;
  normalized.normalizedOptions = normalizedOptions;
  normalized.malformed = isMalformedContent(normalized.question);

  return normalized;
}

export function hydrateIndexedQuestion(question = {}) {
  const indexed = question && typeof question === "object" ? { ...question } : {};

  indexed.title = indexed.title || "";
  indexed.question = "";
  indexed.link = indexed.link || "";
  indexed.preview = String(indexed.preview || "").trim();
  indexed.searchText = String(indexed.searchText || "").trim();
  indexed.tags = Array.isArray(indexed.tags) ? indexed.tags : [];
  indexed.tagsRaw = [...indexed.tags];
  indexed.question_uid = this.buildQuestionUid(indexed);
  indexed.detailShardKey = this.getDetailShardKey(indexed);
  indexed.rawExamUid = String(indexed.exam_uid || "").trim();
  indexed.canonicalExamUid = indexed.rawExamUid;
  indexed.exam_uid = indexed.rawExamUid;

  const exam = this.buildExamMetaFromIndexQuestion(indexed);
  const subjectLabel = this.resolveCanonicalSubject(indexed);
  const subjectSlug = this.getSubjectSlugByLabel(subjectLabel);
  const canonicalSubtopics = this.extractCanonicalSubtopics(indexed.tagsRaw, subjectLabel);
  const canonicalType = this.normalizeTypeToken(indexed.type);

  indexed.canonical = {
    uid: indexed.question_uid,
    exam,
    subject: subjectSlug,
    subjectLabel,
    topics: subjectSlug === "unknown" ? [] : [subjectSlug],
    subtopics: canonicalSubtopics,
    type: canonicalType,
    options: [],
    tagsRaw: [...indexed.tagsRaw],
    isIndexEntry: true,
  };

  indexed.subject = subjectLabel;
  indexed.subjectLabel = subjectLabel;
  indexed.subjectSlug = subjectSlug;
  indexed.exam = exam;
  indexed.year = exam.year;
  indexed.set = exam.set;
  indexed.yearSetKey = exam.yearSetKey;
  indexed.yearSetLabel = exam.label;
  indexed.subtopics = canonicalSubtopics;
  indexed.type = canonicalType;
  indexed.normalizedOptions = [];
  indexed.malformed = false; // index entries have no full content; malformed is checked after detail hydration

  return indexed;
}

/**
 * Detect malformed question content — empty body, link-only stubs, or
 * redirect pages that were scraped by mistake.  Used as a normalization
 * guard so these rows are flagged before reaching the practice bank.
 */
export function isMalformedContent(html = "") {
  const raw = String(html || "").trim();
  if (!raw) return true;

  // Strip all HTML tags and collapse whitespace
  const textOnly = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!textOnly) return true;

  // Content is essentially just a bare URL or anchor link — no real question body
  const URL_ONLY = /^https?:\/\/\S+$/i;
  if (URL_ONLY.test(textOnly)) return true;

  return false;
}

export function isPracticeExcludedQuestion(question = {}) {
  if (!question || typeof question !== "object") {
    return false;
  }

  // Exclude malformed/link-only content
  if (question.malformed) {
    return true;
  }

  const answerType = String(question?.answer_meta?.type || "")
    .trim()
    .toUpperCase();
  if (answerType && !["MCQ", "MSQ", "NAT"].includes(answerType)) {
    return true;
  }

  const tags = Array.isArray(question.tags) ? question.tags : [];
  const hasDescriptiveTag = tags.some(
    (tag) => String(tag || "").trim().toLowerCase() === "descriptive"
  );
  return hasDescriptiveTag && !question.answer_meta;
}

export function getCanonicalQuestionKey(question = {}) {
  const parsedExamUid = parseExamUid(question.canonicalExamUid || question.exam_uid || "");
  if (parsedExamUid && parsedExamUid.year >= 2010) {
    return parsedExamUid.examUid;
  }

  const questionUid = String(question.question_uid || "").trim();
  if (questionUid) {
    return `question:${questionUid}`;
  }

  const answerUid = String(question.answer_uid || "").trim();
  if (answerUid) {
    return `answer:${answerUid}`;
  }

  const examUid = String(question.exam_uid || "").trim();
  if (examUid) {
    return `exam:${examUid}`;
  }

  return this.buildQuestionUid(question);
}

export function getCanonicalQuestionScore(question = {}) {
  const rawExamUid = String(question.rawExamUid || "").trim();
  const canonicalExamUid = String(question.canonicalExamUid || question.exam_uid || "").trim();

  let score = 0;
  if (rawExamUid && canonicalExamUid && rawExamUid === canonicalExamUid) {
    score += 100;
  }
  if (question.answer_uid) {
    score += 30;
  }
  if (question.answer_meta && typeof question.answer_meta === "object") {
    score += 20;
  }
  if (question.question_uid && !String(question.question_uid).startsWith("local:")) {
    score += 15;
  }
  if (Array.isArray(question.tags) && question.tags.length > 0) {
    score += 10;
  }
  score += Math.min(String(question.question || "").length, 2000) / 1000;
  score += Math.min(String(question.title || "").length, 200) / 1000;
  return score;
}

export function pickPreferredQuestionForSlot(existingQuestion, candidateQuestion) {
  if (!existingQuestion) {
    return candidateQuestion;
  }

  const existingScore = this.getCanonicalQuestionScore(existingQuestion);
  const candidateScore = this.getCanonicalQuestionScore(candidateQuestion);

  if (candidateScore > existingScore) {
    return candidateQuestion;
  }
  if (candidateScore < existingScore) {
    return existingQuestion;
  }

  const existingRawExamUid = String(existingQuestion.rawExamUid || "").trim();
  const candidateRawExamUid = String(candidateQuestion.rawExamUid || "").trim();
  const existingVariantPenalty = /(?:modified|version|ugcnet|isro|pgee)/i.test(existingRawExamUid)
    ? 1
    : 0;
  const candidateVariantPenalty = /(?:modified|version|ugcnet|isro|pgee)/i.test(
    candidateRawExamUid
  )
    ? 1
    : 0;

  if (candidateVariantPenalty !== existingVariantPenalty) {
    return candidateVariantPenalty < existingVariantPenalty ? candidateQuestion : existingQuestion;
  }

  return existingQuestion;
}

export function finalizeQuestions(questions = []) {
  const normalizedQuestions = Array.isArray(questions)
    ? questions.filter((question) => !this.isPracticeExcludedQuestion(question))
    : [];
  const yearToSetMap = new Map();

  normalizedQuestions.forEach((question) => {
    const parsedExamUid = parseExamUid(question.canonicalExamUid || question.exam_uid || "");
    if (!parsedExamUid || !Number.isFinite(parsedExamUid.year)) {
      return;
    }

    if (!yearToSetMap.has(parsedExamUid.year)) {
      yearToSetMap.set(parsedExamUid.year, new Set());
    }
    yearToSetMap.get(parsedExamUid.year).add(parsedExamUid.set);
  });

  const multiSetYears = new Set(
    Array.from(yearToSetMap.entries())
      .filter(([, setNumbers]) => setNumbers.size > 1)
      .map(([year]) => year)
  );

  const dedupedQuestions = new Map();

  normalizedQuestions.forEach((question) => {
    const finalizedQuestion = question && typeof question === "object" ? { ...question } : question;
    const parsedExamUid = parseExamUid(
      finalizedQuestion.canonicalExamUid || finalizedQuestion.exam_uid || ""
    );

    if (parsedExamUid) {
      const exam = this.buildExamMetaFromParsedUid(parsedExamUid, multiSetYears);
      finalizedQuestion.exam = exam;
      finalizedQuestion.yearSetKey = exam.yearSetKey;
      finalizedQuestion.yearSetLabel = exam.label;
      if (finalizedQuestion.canonical && typeof finalizedQuestion.canonical === "object") {
        finalizedQuestion.canonical = {
          ...finalizedQuestion.canonical,
          exam,
        };
      }
    }

    const slotKey = this.getCanonicalQuestionKey(finalizedQuestion);
    const existingQuestion = dedupedQuestions.get(slotKey);
    dedupedQuestions.set(
      slotKey,
      this.pickPreferredQuestionForSlot(existingQuestion, finalizedQuestion)
    );
  });

  return Array.from(dedupedQuestions.values());
}

export function buildDetailedQuestion(rawQuestion = {}, indexedQuestion = null) {
  const normalizedDetail = this.normalizeQuestion(rawQuestion);
  const mergedExam = indexedQuestion?.exam || normalizedDetail.exam;
  const mergedSubjectLabel = indexedQuestion?.subject || normalizedDetail.subject;
  const mergedSubjectSlug = indexedQuestion?.subjectSlug || normalizedDetail.subjectSlug;
  const mergedSubtopics =
    Array.isArray(indexedQuestion?.subtopics) && indexedQuestion.subtopics.length > 0
      ? indexedQuestion.subtopics
      : normalizedDetail.subtopics;
  const mergedType = this.normalizeTypeToken(indexedQuestion?.type || normalizedDetail.type);
  const mergedTags =
    Array.isArray(normalizedDetail.tags) && normalizedDetail.tags.length > 0
      ? normalizedDetail.tags
      : Array.isArray(indexedQuestion?.tags)
        ? indexedQuestion.tags
        : [];

  return {
    ...normalizedDetail,
    preview: indexedQuestion?.preview || "",
    searchText: indexedQuestion?.searchText || "",
    detailShardKey: this.getDetailShardKey(indexedQuestion || normalizedDetail),
    tags: mergedTags,
    tagsRaw: [...mergedTags],
    exam: mergedExam,
    year: mergedExam?.year ?? normalizedDetail.year,
    set: mergedExam?.set ?? normalizedDetail.set,
    yearSetKey: mergedExam?.yearSetKey || normalizedDetail.yearSetKey,
    yearSetLabel: mergedExam?.label || normalizedDetail.yearSetLabel,
    subject: mergedSubjectLabel,
    subjectLabel: mergedSubjectLabel,
    subjectSlug: mergedSubjectSlug,
    subtopics: mergedSubtopics,
    type: mergedType,
    canonical: {
      ...(normalizedDetail.canonical || {}),
      exam: mergedExam,
      subject: mergedSubjectSlug,
      subjectLabel: mergedSubjectLabel,
      subtopics: mergedSubtopics,
      type: mergedType,
      tagsRaw: [...mergedTags],
    },
  };
}
