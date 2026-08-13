export const EXAM_TRACKS = Object.freeze({
  CSE: "cse",
  DA: "da",
});

const YEAR_SET_KEY_RE = /^(cse|da):(\d{4}):set-(\d+)$/i;
const LEGACY_YEAR_SET_KEY_RE = /^(\d{4})-s(\d+)$/i;
const YEAR_SET_LABEL_RE = /^(\d{4})(?:\s+set\s*(\d+))?$/i;

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
  return null;
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
  const explicitTrack = getExplicitTrack(question);
  if (explicitTrack) {
    return explicitTrack;
  }

  const questionUid = String(question?.question_uid || question?.uid || "").trim().toLowerCase();
  if (questionUid.startsWith("da:")) {
    return EXAM_TRACKS.DA;
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

  const text = [question?.title, question?.link, question?.exam?.label]
    .map((value) => String(value || ""))
    .join(" ");
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

export const isDaQuestion = (question = {}) => (
  getQuestionTrack(question) === EXAM_TRACKS.DA
);

export function buildTrackYearSetKey(
  track,
  year,
  set,
) {
  const normalizedTrack = normalizeExamTrack(track) || EXAM_TRACKS.CSE;
  const yearNumber = Number.parseInt(String(year ?? ""), 10);
  if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
    return null;
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
    const setNumber = Number.parseInt(canonicalMatch[3], 10);
    const set = Number.isFinite(setNumber) && setNumber > 0 ? setNumber : null;
    return {
      track,
      year,
      set,
      key: buildTrackYearSetKey(track, year, set),
      legacyKey: `${year}-s${set || 0}`,
    };
  }

  const legacyMatch = value.match(LEGACY_YEAR_SET_KEY_RE);
  if (!legacyMatch) {
    return null;
  }
  const year = Number.parseInt(legacyMatch[1], 10);
  const setNumber = Number.parseInt(legacyMatch[2], 10);
  const set = Number.isFinite(setNumber) && setNumber > 0 ? setNumber : null;
  return {
    track: EXAM_TRACKS.CSE,
    year,
    set,
    key: buildTrackYearSetKey(EXAM_TRACKS.CSE, year, set),
    legacyKey: `${year}-s${set || 0}`,
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
    return buildTrackYearSetKey(fallbackTrack, parsed.year, parsed.set);
  }

  const labelMatch = String(rawValue ?? "").trim().match(YEAR_SET_LABEL_RE);
  if (labelMatch) {
    return buildTrackYearSetKey(fallbackTrack, labelMatch[1], labelMatch[2]);
  }
  return null;
}

export function formatTrackYearSetLabel(rawValue) {
  const parsed = parseTrackYearSetKey(rawValue);
  if (!parsed) {
    return String(rawValue ?? "");
  }
  return parsed.set ? `${parsed.year} Set ${parsed.set}` : String(parsed.year);
}

export function toLegacyYearSetKey(rawValue) {
  const parsed = parseTrackYearSetKey(rawValue);
  if (!parsed) {
    return null;
  }
  return parsed.track === EXAM_TRACKS.CSE ? parsed.legacyKey : parsed.key;
}

export function getQuestionYearSetIdentity(question = {}, fallbackTrack) {
  const track = normalizeExamTrack(fallbackTrack) || getQuestionTrack(question);
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

  const year = question?.year ?? question?.exam?.year;
  const set = question?.set ?? question?.exam?.set;
  return buildTrackYearSetKey(track, year, set);
}

export function getTrackFromYearSetKey(rawValue) {
  return parseTrackYearSetKey(rawValue)?.track || null;
}
