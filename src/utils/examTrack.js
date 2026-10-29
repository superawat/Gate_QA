export const EXAM_TRACKS = Object.freeze({
  CSE: "cse",
  DA: "da",
  EC: "ec",
  EE: "ee",
  ME: "me",
  CE: "ce",
  ISRO: "isro",
  APTITUDE: "aptitude",
});

export const TRACK_LABELS = Object.freeze({
  [EXAM_TRACKS.CSE]: "Computer Science (CSE)",
  [EXAM_TRACKS.DA]: "Data Science & AI (DA)",
  [EXAM_TRACKS.EC]: "Electronics & Comm. (ECE)",
  [EXAM_TRACKS.EE]: "Electrical Eng. (EE)",
  [EXAM_TRACKS.ME]: "Mechanical Eng. (ME)",
  [EXAM_TRACKS.CE]: "Civil Eng. (CE)",
  [EXAM_TRACKS.APTITUDE]: "General Aptitude (GA)",
  [EXAM_TRACKS.ISRO]: "ISRO Scientist (CSE)",
});

const YEAR_SET_KEY_RE = /^(cse|da|it|isro|ec|ee|me|ce):(\d{4}):(?:set-(\d+)|(additional))$/i;
const LEGACY_YEAR_SET_KEY_RE = /^(?:(it|ec|ee|me|ce|da|isro)-)?(\d{4})-s(\d+)$/i;
const LEGACY_ADDITIONAL_KEY_RE = /^(\d{4})-additional$/i;
const YEAR_SET_LABEL_RE = /^(?:(it)\s+)?(\d{4})(?:\s+set\s*(\d+)|\s+additional(?:\s+questions)?)?$/i;

const TRACK_FIELDS = [
  "track",
  "sourceTrack",
  "examTrack",
  "paper",
  "source",
];

export function normalizeExamTrack(value) {
  const token = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!token) {
    return null;
  }
  if (
    token === "aptitude"
    || token === "apt"
    || token === "special aptitude"
    || token === "special_aptitude"
    || token === "gate aptitude"
  ) {
    return EXAM_TRACKS.APTITUDE;
  }
  if (/^isro(?:\s|$)/.test(token) || token === "isro" || token === "isro cs" || token === "isro cse") {
    return EXAM_TRACKS.ISRO;
  }
  if (/^(?:gate\s*)?da(?:\s|$)/.test(token)) {
    return EXAM_TRACKS.DA;
  }
  if (/^(?:gate\s*)?(?:cse|cs|it)(?:\s|$)/.test(token)) {
    return EXAM_TRACKS.CSE;
  }
  if (
    token === "da"
    || token === "gate da"
    || token === "gateda"
    || token === "data science"
    || token === "data science and artificial intelligence"
    || token === "data science & artificial intelligence"
  ) {
    return EXAM_TRACKS.DA;
  }
  if (
    token === "cse"
    || token === "cs"
    || token === "it"
    || token === "gate cse"
    || token === "gate cs"
    || token === "gate it"
    || token === "gatecse"
    || token === "gateit"
  ) {
    return EXAM_TRACKS.CSE;
  }
  if (/^(?:gate\s*)?ec(?:\s|$)/.test(token) || token === "ec" || token === "ece" || token === "electronics") {
    return EXAM_TRACKS.EC;
  }
  if (/^(?:gate\s*)?ee(?:\s|$)/.test(token) || token === "ee" || token === "electrical") {
    return EXAM_TRACKS.EE;
  }
  if (/^(?:gate\s*)?me(?:\s|$)/.test(token) || token === "me" || token === "mechanical") {
    return EXAM_TRACKS.ME;
  }
  if (/^(?:gate\s*)?ce(?:\s|$)/.test(token) || token === "ce" || token === "civil") {
    return EXAM_TRACKS.CE;
  }
  return null;
}

export const APTITUDE_SUBJECT_SLUGS = Object.freeze(new Set([
  "english",
  "quant",
  "mathematics",
  "math",
  "maths",
  "quantitative-aptitude",
  "reasoning",
  "verbal",
  "verbal-ability",
  "verbal-aptitude",
]));

export function isAptitudeSubjectSlug(value = "") {
  const token = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!token) {
    return false;
  }
  if (token.startsWith("apt-") || token.startsWith("apt:")) {
    return true;
  }
  return APTITUDE_SUBJECT_SLUGS.has(token);
}

export function isAptitudeQuestion(question = {}) {
  const explicitTrack = normalizeExamTrack(
    question?.track
    || question?.sourceTrack
    || question?.examTrack
    || question?.exam?.paper
    || question?.paper
  );
  if (explicitTrack === EXAM_TRACKS.APTITUDE) {
    return true;
  }
  const questionUid = String(question?.question_uid || question?.uid || question?.id || "").trim();
  if (questionUid.startsWith("APT-") || questionUid.startsWith("apt-") || questionUid.startsWith("apt:")) {
    return true;
  }
  if (question?.answerMeta?.source === "aptitude_embedded") {
    return true;
  }
  if (String(question?._detailShard || "").includes("aptitude/")) {
    return true;
  }
  return false;
}

const getExplicitTrack = (question = {}) => {
  const candidates = [
    ...TRACK_FIELDS.map((field) => question?.[field]),
    ...TRACK_FIELDS.map((field) => question?.exam?.[field]),
  ];
  for (const candidate of candidates) {
    const track = normalizeExamTrack(candidate);
    if (track) {
      return track;
    }
  }
  return null;
};

export function getQuestionTrack(question = {}) {
  if (isAptitudeQuestion(question)) {
    return EXAM_TRACKS.APTITUDE;
  }

  const explicitTrack = getExplicitTrack(question);
  if (explicitTrack) {
    return explicitTrack;
  }

  const questionUid = String(question?.question_uid || question?.uid || "").trim().toLowerCase();
  if (questionUid.startsWith("isro:")) {
    return EXAM_TRACKS.ISRO;
  }
  if (questionUid.startsWith("da:")) {
    return EXAM_TRACKS.DA;
  }
  if (questionUid.startsWith("pp:ec:") || questionUid.startsWith("ec:")) {
    return EXAM_TRACKS.EC;
  }
  if (questionUid.startsWith("pp:ee:") || questionUid.startsWith("ee:")) {
    return EXAM_TRACKS.EE;
  }
  if (questionUid.startsWith("pp:me:") || questionUid.startsWith("me:")) {
    return EXAM_TRACKS.ME;
  }
  if (questionUid.startsWith("pp:ce:") || questionUid.startsWith("ce:")) {
    return EXAM_TRACKS.CE;
  }
  if (questionUid.startsWith("go:")) {
    return EXAM_TRACKS.CSE;
  }

  const identityTrack = normalizeExamTrack(
    String(question?.yearSetIdentity || question?.exam?.yearSetIdentity || "").split(":")[0]
  );
  if (identityTrack) {
    return identityTrack;
  }

  const text = [question?.title, question?.link, question?.exam?.label, question?.exam?.paper, question?.paper]
    .map((value) => String(value || ""))
    .join(" ");
  if (/\bisro\b/i.test(text)) {
    return EXAM_TRACKS.ISRO;
  }
  if (/\bgate\s+da\b/i.test(text)) {
    return EXAM_TRACKS.DA;
  }
  if (/\bgate\s+(?:cse|cs|it)\b/i.test(text)) {
    return EXAM_TRACKS.CSE;
  }

  // Shared/legacy records are CSE by default. A bare gateda tag is deliberately
  // insufficient because legacy CSE rows have been observed with stale DA tags.
  // DA must be positively identified by track/source, UID, title, or identity.
  return EXAM_TRACKS.CSE;
}

export const isIsroQuestion = (question = {}) => (
  getQuestionTrack(question) === EXAM_TRACKS.ISRO
);

export const isDaQuestion = (question = {}) => (
  getQuestionTrack(question) === EXAM_TRACKS.DA
);

export function isBranchGaQuestion(question = {}) {
  if (!question || typeof question !== "object") return false;
  const subjectSlug = String(question?.subjectSlug || "").toLowerCase();
  const section = String(question?.section || "").toLowerCase();
  const subject = String(question?.subject || "").toLowerCase();
  const subjectLabel = String(question?.subjectLabel || "").toLowerCase();
  const primarySubjectSlug = String(question?.taxonomy?.primary?.subjectSlug || "").toLowerCase();
  const primarySubjectLabel = String(question?.taxonomy?.primary?.subjectLabel || "").toLowerCase();
  const tags = Array.isArray(question?.tags) ? question.tags.map((t) => String(t).toLowerCase()) : [];
  const examUid = String(question?.exam_uid || question?.examUid || "").toLowerCase();
  const title = String(question?.title || "").toLowerCase();
  const paperScope = String(question?.paper_scope || question?.paperScope || "").toLowerCase();

  return (
    subjectSlug === "ga" ||
    subjectSlug === "general-aptitude" ||
    section === "ga" ||
    subject === "general aptitude" ||
    subjectLabel === "general aptitude" ||
    primarySubjectSlug === "ga" ||
    primarySubjectSlug === "general-aptitude" ||
    primarySubjectLabel === "general aptitude" ||
    tags.includes("ga") ||
    tags.includes("general-aptitude") ||
    examUid.includes(":ga:") ||
    title.includes("ga question") ||
    /question:\s*ga-/i.test(title) ||
    /\|\s*ga\s*\|/i.test(title) ||
    paperScope === "official_ga" ||
    paperScope === "additional_ga"
  );
}

export function isItQuestion(question = {}) {
  if (
    question?.branch === "IT" ||
    question?.paper === "IT" ||
    question?.source_branch === "IT" ||
    question?.paper_scope === "official_it"
  ) {
    return true;
  }
  const title = String(question?.title || "");
  if (/\bgate\s+it\b/i.test(title)) {
    return true;
  }
  const year = String(question?.year || "");
  if (/^gateit-\d{4}/i.test(year)) {
    return true;
  }
  return false;
}

export function buildTrackYearSetKey(
  track,
  year,
  set,
  isAdditional = false,
) {
  const isIt = String(track ?? "").trim().toLowerCase() === "it";
  const normalizedTrack = isIt ? "it" : (normalizeExamTrack(track) || EXAM_TRACKS.CSE);
  const yearNumber = Number.parseInt(String(year ?? ""), 10);
  if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
    return null;
  }
  if (isAdditional || String(set || "").toLowerCase() === "additional") {
    return `${normalizedTrack}:${yearNumber}:additional`;
  }
  const setNumber = Number.parseInt(String(set ?? ""), 10);
  const normalizedSet = Number.isFinite(setNumber) && setNumber > 0 ? setNumber : 0;
  return `${normalizedTrack}:${yearNumber}:set-${normalizedSet}`;
}

export function parseTrackYearSetKey(rawValue) {
  const value = String(rawValue ?? "").trim().toLowerCase();
  const canonicalMatch = value.match(YEAR_SET_KEY_RE);
  if (canonicalMatch) {
    const track = canonicalMatch[1].toLowerCase();
    const year = Number.parseInt(canonicalMatch[2], 10);
    if (canonicalMatch[4]) {
      return {
        track,
        year,
        set: null,
        isAdditional: true,
        key: `${track}:${year}:additional`,
        legacyKey: track === "it" ? `it-${year}-additional` : `${year}-additional`,
      };
    }
    const setNumber = Number.parseInt(canonicalMatch[3], 10);
    const set = Number.isFinite(setNumber) && setNumber > 0 ? setNumber : null;
    return {
      track,
      year,
      set,
      isAdditional: false,
      key: buildTrackYearSetKey(track, year, set),
      legacyKey: track === "it" ? `it-${year}-s${set || 0}` : `${year}-s${set || 0}`,
    };
  }

  const legacyAdditionalMatch = value.match(LEGACY_ADDITIONAL_KEY_RE);
  if (legacyAdditionalMatch) {
    const year = Number.parseInt(legacyAdditionalMatch[1], 10);
    return {
      track: EXAM_TRACKS.CSE,
      year,
      set: null,
      isAdditional: true,
      key: buildTrackYearSetKey(EXAM_TRACKS.CSE, year, null, true),
      legacyKey: `${year}-additional`,
    };
  }

  const legacyMatch = value.match(LEGACY_YEAR_SET_KEY_RE);
  if (!legacyMatch) {
    return null;
  }
  const legacyTrackRaw = legacyMatch[1] ? legacyMatch[1].toLowerCase() : null;
  const isItLegacy = legacyTrackRaw === "it";
  const track = isItLegacy ? "it" : (legacyTrackRaw ? (normalizeExamTrack(legacyTrackRaw) || legacyTrackRaw) : EXAM_TRACKS.CSE);
  const year = Number.parseInt(legacyMatch[2], 10);
  const setNumber = Number.parseInt(legacyMatch[3], 10);
  const set = Number.isFinite(setNumber) && setNumber > 0 ? setNumber : null;
  return {
    track,
    year,
    set,
    isAdditional: false,
    key: buildTrackYearSetKey(track, year, set),
    legacyKey: track === EXAM_TRACKS.CSE ? `${year}-s${set || 0}` : `${track}-${year}-s${set || 0}`,
  };
}

export function normalizeTrackYearSetKey(
  rawValue,
  fallbackTrack = EXAM_TRACKS.CSE,
) {
  const parsed = parseTrackYearSetKey(rawValue);
  if (parsed) {
    if (String(rawValue ?? "").trim().toLowerCase().match(YEAR_SET_KEY_RE)) {
      return parsed.key;
    }
    return buildTrackYearSetKey(fallbackTrack, parsed.year, parsed.set, parsed.isAdditional);
  }

  const labelMatch = String(rawValue ?? "").trim().match(YEAR_SET_LABEL_RE);
  if (labelMatch) {
    const isAdd = Boolean(labelMatch[0].toLowerCase().includes("additional"));
    const isItLabel = Boolean(labelMatch[1] && labelMatch[1].toLowerCase() === "it");
    const targetTrack = isItLabel ? "it" : fallbackTrack;
    return buildTrackYearSetKey(targetTrack, labelMatch[2], labelMatch[3], isAdd);
  }
  return null;
}

export function formatTrackYearSetLabel(rawValue) {
  const parsed = parseTrackYearSetKey(rawValue);
  if (!parsed) {
    return String(rawValue ?? "");
  }
  if (parsed.track === "isro") {
    return `ISRO ${parsed.year}`;
  }
  if (parsed.track === "it") {
    return `${parsed.year} IT`;
  }
  if (parsed.track === "ec" || parsed.track === "ee" || parsed.track === "me" || parsed.track === "ce" || parsed.track === "da") {
    const b = parsed.track.toUpperCase();
    return parsed.set ? `${b} ${parsed.year} Set ${parsed.set}` : `${b} ${parsed.year}`;
  }
  if (parsed.isAdditional) {
    return `${parsed.year} Additional Questions`;
  }
  return parsed.set ? `${parsed.year} Set ${parsed.set}` : String(parsed.year);
}

export function toLegacyYearSetKey(rawValue) {
  const parsed = parseTrackYearSetKey(rawValue);
  if (!parsed) {
    return null;
  }
  return parsed.track === EXAM_TRACKS.CSE || parsed.track === "it" ? parsed.legacyKey : parsed.key;
}

export function getQuestionYearSetIdentity(question = {}, fallbackTrack) {
  const isIt = isItQuestion(question);
  const track = isIt
    ? "it"
    : (normalizeExamTrack(fallbackTrack) || getQuestionTrack(question));
  const explicitIdentity = question?.yearSetIdentity || question?.exam?.yearSetIdentity;
  const normalizedIdentity = normalizeTrackYearSetKey(explicitIdentity, track);
  if (normalizedIdentity) {
    return normalizedIdentity;
  }

  const rawKey = question?.yearSetKey || question?.exam?.yearSetKey;
  const normalizedKey = normalizeTrackYearSetKey(rawKey, track);
  if (normalizedKey) {
    return normalizedKey;
  }

  const isAdditional =
    question?.paper_scope === "additional_ga" ||
    question?.paperScope === "additional_ga" ||
    question?.isAdditional ||
    String(question?.detailShardKey || "").includes("additional");

  const year = question?.year ?? question?.exam?.year;
  const set = question?.set ?? question?.exam?.set;
  return buildTrackYearSetKey(track, year, set, isAdditional);
}

export function getTrackFromYearSetKey(rawValue) {
  return parseTrackYearSetKey(rawValue)?.track || null;
}
