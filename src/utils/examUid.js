const LINK_EXAM_PATTERN =
  /gate-cse-(\d{4})(?:-set-(\d+))?-(ga-)?question-([^/?#]+)/i;
const EXAM_UID_PATTERN = /^cse:(\d{4}):set(\d+):(main|ga):q(.+)$/i;
const YEAR_TAG_PATTERN = /gatecse-(\d{4})(?:-set(\d+))?/i;
const TITLE_YEAR_PATTERN = /GATE\s+CSE\s+(\d{4})(?:\s+Set\s*(\d+))?/i;
const TITLE_QUESTION_PATTERN =
  /(GA\s+)?Question\s*[: ]\s*([0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)*)/i;
const TITLE_GA_INLINE_PATTERN =
  /\bGA\b[\s|:-]*Question\s*[: ]\s*([0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)*)/i;
const TITLE_GA_PREFIX_PATTERN =
  /Question\s*[: ]\s*GA\s*-?\s*([0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)*)/i;
const LINK_GA_QUESTION_PATTERN =
  /question-ga-([0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)*)/i;
const LINK_MAIN_QUESTION_PATTERN =
  /question-([0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)*)/i;
const INVISIBLE_TEXT_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const CANONICAL_EXAM_UID_FROM_YEAR = 2010;

function normalizeSetNo(rawSet) {
  const value = Number.parseInt(String(rawSet ?? "").trim(), 10);
  if (!Number.isFinite(value) || value <= 0) {
    return "1";
  }
  return String(value);
}

export function cleanInvisibleText(value = "") {
  return String(value || "").replace(INVISIBLE_TEXT_RE, "");
}

function normalizeExamQuestionToken(rawToken = "") {
  const cleaned = String(rawToken || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

  if (!cleaned) {
    return "";
  }

  return cleaned
    .split(/([.-])/)
    .map((part) => {
      if (part === "." || part === "-") {
        return part;
      }
      if (/^\d+$/.test(part)) {
        return String(Number.parseInt(part, 10));
      }
      return part;
    })
    .join("")
    .replace(/^[.-]+|[.-]+$/g, "");
}

function parseYearTag(yearTag = "") {
  const match = String(yearTag || "").match(YEAR_TAG_PATTERN);
  if (!match) {
    return { year: null, setNo: "1" };
  }
  return { year: match[1], setNo: normalizeSetNo(match[2]) };
}

function buildExamUid(year, setNo, section, questionToken) {
  return `cse:${year}:set${normalizeSetNo(setNo)}:${section}:q${questionToken}`;
}

export function parseExamUid(rawExamUid = "") {
  const match = String(rawExamUid || "").trim().match(EXAM_UID_PATTERN);
  if (!match) {
    return null;
  }

  const questionToken = normalizeExamQuestionToken(match[4]);
  if (!questionToken) {
    return null;
  }

  return {
    year: Number.parseInt(match[1], 10),
    set: Number.parseInt(match[2], 10),
    section: String(match[3] || "").toLowerCase() === "ga" ? "ga" : "main",
    questionToken,
    examUid: buildExamUid(match[1], match[2], match[3], questionToken),
  };
}

function extractPaperMetaFromQuestion(question = {}) {
  const parsedExistingExamUid = parseExamUid(String(question.exam_uid || "").trim());
  if (parsedExistingExamUid) {
    return {
      year: String(parsedExistingExamUid.year),
      setNo: normalizeSetNo(parsedExistingExamUid.set),
    };
  }

  const yearTag = String(question.year || "").trim();
  const yearTagParts = parseYearTag(yearTag);
  const title = cleanInvisibleText(question.title || "");
  const titleMatch = title.match(TITLE_YEAR_PATTERN);
  if (titleMatch) {
    return {
      year: titleMatch[1],
      setNo: normalizeSetNo(titleMatch[2] || yearTagParts.setNo),
    };
  }

  const link = String(question.link || "").trim();
  const linkMatch = link.match(/gate-cse-(\d{4})(?:-set-(\d+))?/i);
  if (linkMatch) {
    return {
      year: linkMatch[1],
      setNo: normalizeSetNo(linkMatch[2] || yearTagParts.setNo),
    };
  }

  if (yearTagParts.year) {
    return {
      year: yearTagParts.year,
      setNo: yearTagParts.setNo,
    };
  }

  return null;
}

function extractCanonicalQuestionSlot(question = {}) {
  const title = cleanInvisibleText(question.title || "");
  const link = String(question.link || "").trim();

  let match = title.match(TITLE_GA_PREFIX_PATTERN);
  if (match) {
    const token = normalizeExamQuestionToken(match[1]);
    return token ? { section: "ga", questionToken: token } : null;
  }

  match = title.match(TITLE_GA_INLINE_PATTERN);
  if (match) {
    const token = normalizeExamQuestionToken(match[1]);
    return token ? { section: "ga", questionToken: token } : null;
  }

  match = title.match(TITLE_QUESTION_PATTERN);
  if (match) {
    const token = normalizeExamQuestionToken(match[2]);
    const section = match[1] ? "ga" : "main";
    return token ? { section, questionToken: token } : null;
  }

  match = link.match(LINK_GA_QUESTION_PATTERN);
  if (match) {
    const token = normalizeExamQuestionToken(match[1]);
    return token ? { section: "ga", questionToken: token } : null;
  }

  match = link.match(LINK_MAIN_QUESTION_PATTERN);
  if (match) {
    const token = normalizeExamQuestionToken(match[1]);
    return token ? { section: "main", questionToken: token } : null;
  }

  return null;
}

export function examUidFromLink(link = "", yearTag = "") {
  const raw = String(link || "").trim().replace(/\/+$/, "");
  if (!raw) {
    return null;
  }
  const slug = raw.split("/").at(-1) || "";
  const match = slug.match(LINK_EXAM_PATTERN);
  if (!match) {
    return null;
  }
  const year = match[1];
  const parsedYearTag = parseYearTag(yearTag);
  const setNo =
    match[2] || (parsedYearTag.year === year ? parsedYearTag.setNo : "1");
  const section = match[3] ? "ga" : "main";
  const questionToken = normalizeExamQuestionToken(match[4]);
  if (!questionToken) {
    return null;
  }
  return buildExamUid(year, setNo, section, questionToken);
}

export function examUidFromTitle(title = "", yearTag = "") {
  const rawTitle = String(title || "").trim();
  if (!rawTitle) {
    return null;
  }

  const yearTagParts = parseYearTag(yearTag);
  const yearMatch = rawTitle.match(TITLE_YEAR_PATTERN);
  let year = null;
  let setNo = "1";
  if (yearMatch) {
    year = yearMatch[1];
    setNo = normalizeSetNo(yearMatch[2] || yearTagParts.setNo);
  } else if (yearTagParts.year) {
    year = yearTagParts.year;
    setNo = yearTagParts.setNo;
  } else {
    return null;
  }

  const questionMatch = rawTitle.match(TITLE_QUESTION_PATTERN);
  if (!questionMatch) {
    return null;
  }
  const section = questionMatch[1] ? "ga" : "main";
  const questionToken = normalizeExamQuestionToken(questionMatch[2]);
  if (!questionToken) {
    return null;
  }
  return buildExamUid(year, setNo, section, questionToken);
}

export function getExamUidFromQuestion(question = {}) {
  if (!question || typeof question !== "object") {
    return null;
  }
  const existing = String(question.exam_uid || "").trim();
  if (existing) {
    return existing;
  }
  const yearTag = String(question.year || "").trim();
  return (
    examUidFromLink(String(question.link || ""), yearTag) ||
    examUidFromTitle(String(question.title || ""), yearTag) ||
    null
  );
}

export function getCanonicalExamUidFromQuestion(
  question = {},
  { fromYear = CANONICAL_EXAM_UID_FROM_YEAR } = {}
) {
  if (!question || typeof question !== "object") {
    return null;
  }

  const existingCanonical = String(question.canonicalExamUid || "").trim();
  if (existingCanonical) {
    return existingCanonical;
  }

  const fallbackExamUid = getExamUidFromQuestion(question);
  const paperMeta = extractPaperMetaFromQuestion(question);
  if (!paperMeta || !paperMeta.year) {
    return fallbackExamUid;
  }

  const year = Number.parseInt(paperMeta.year, 10);
  if (!Number.isFinite(year) || year < fromYear) {
    return fallbackExamUid;
  }

  const questionSlot = extractCanonicalQuestionSlot(question);
  if (!questionSlot || !questionSlot.questionToken) {
    return fallbackExamUid;
  }

  return buildExamUid(
    paperMeta.year,
    paperMeta.setNo,
    questionSlot.section,
    questionSlot.questionToken
  );
}
