import { getExamUidFromQuestion } from "../utils/examUid.js";
import { isQuotaExceededError } from "../utils/localStorageState.js";
import precomputedLookup from "../generated/subtopicLookup.json";

// ── Performance: build-time precomputed caches ──────────────────────────
const PRECOMPUTED_SUBTOPICS = precomputedLookup.subtopicsBySubject;
const PRECOMPUTED_NORMALIZED = precomputedLookup.normalizedSubtopicsBySubject;
const PRECOMPUTED_ALIASES = precomputedLookup.subjectAliases;

// ── Performance: localStorage cache for processed questions ─────────────
const INIT_CACHE_VERSION = 'v2';
const INIT_CACHE_KEY = `gateqa_init_cache_${INIT_CACHE_VERSION}`;

export class QuestionService {
  static questions = [];
  static loaded = false;
  static count = new Map();
  static tags = [];
  static sourceUrl = "";

  static SUBJECT_ENUM = [
    { slug: "algorithms", label: "Algorithms" },
    { slug: "coa", label: "CO & Architecture" },
    { slug: "compiler", label: "Compiler Design" },
    { slug: "cn", label: "Computer Networks" },
    { slug: "dbms", label: "Databases" },
    { slug: "digital-logic", label: "Digital Logic" },
    { slug: "discrete-math", label: "Discrete Mathematics" },
    { slug: "engg-math", label: "Engineering Mathematics" },
    { slug: "ga", label: "General Aptitude" },
    { slug: "os", label: "Operating System" },
    { slug: "prog-ds", label: "Programming and DS" },
    { slug: "prog-c", label: "Programming in C" },
    { slug: "toc", label: "Theory of Computation" },
  ];

  static SUBJECT_LABEL_TO_SLUG = new Map();

  static SUBJECT_SLUG_TO_LABEL = new Map();

  static YEAR_SET_TAG_PATTERN = /gate(?:cse|it)?-?(\d{4})(?:-set(\d+))?/i;
  static TITLE_YEAR_SET_PATTERN = /GATE\s+(?:CSE|IT)\s+(\d{4})(?:\s*[| ]\s*Set\s*(\d+))?/i;
  static LINK_YEAR_SET_PATTERN = /gate-(?:cse|it)-(\d{4})(?:-set-(\d+))?/i;

  static extractGateOverflowId(link = "") {
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

  static hashString(value = "") {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  static buildQuestionUid(question = {}) {
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

  static hasNativeJoinIdentity(question = {}) {
    if (!question || typeof question !== "object") {
      return false;
    }
    if (question.question_uid && String(question.question_uid).trim()) {
      return true;
    }
    if (this.extractGateOverflowId(question.link || "")) {
      return true;
    }
    if (
      question.id_str != null &&
      question.volume != null &&
      String(question.id_str).trim()
    ) {
      return true;
    }
    if (getExamUidFromQuestion(question)) {
      return true;
    }
    return false;
  }

  // Priority order for conflict resolution when multiple subjects are inferred
  static SUBJECT_PRIORITY = [
    "Digital Logic", "Computer Networks", "Operating System", "Databases", "Compiler Design", "CO & Architecture",
    "Algorithms", "Programming and DS", "Theory of Computation", "Programming in C",
    "Discrete Mathematics", "Engineering Mathematics", "General Aptitude"
  ];

  // Tag aliases that should map to a canonical subject label.
  static SUBJECT_ALIAS_OVERRIDES = {
    Algorithms: ["algorithms"],
    "CO & Architecture": [
      "co-and-architecture",
      "computer-organization-and-architecture",
      "computer-architecture",
      "coa"
    ],
    "Compiler Design": ["compiler-design"],
    "Computer Networks": ["computer-networks", "cn"],
    Databases: ["databases", "dbms", "database-management-systems"],
    "Digital Logic": ["digital-logic"],
    "Discrete Mathematics": ["discrete-mathematics", "discrete-math"],
    "Engineering Mathematics": ["engineering-mathematics", "engg-math"],
    "General Aptitude": ["general-aptitude", "ga"],
    "Operating System": ["operating-system", "os"],
    "Programming and DS": ["programming-and-ds", "programming-ds", "prog-ds"],
    "Programming in C": ["programming-in-c", "c-programming", "prog-c"],
    "Theory of Computation": ["theory-of-computation", "toc"]
  };

  static SUBJECT_ALIAS_CACHE = new Map();

  static getNormalizedSubjectAliases(subject) {
    // Fast path: use build-time precomputed aliases
    if (PRECOMPUTED_ALIASES[subject]) {
      return PRECOMPUTED_ALIASES[subject];
    }

    if (this.SUBJECT_ALIAS_CACHE.has(subject)) {
      return this.SUBJECT_ALIAS_CACHE.get(subject);
    }

    const aliases = new Set();
    const addAlias = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return;
      aliases.add(this.normalizeString(raw));
      aliases.add(this.normalizeString(raw.replace(/-/g, " ")));
    };

    addAlias(subject);
    addAlias(subject.replace(/&/g, "and"));

    const slug = subject
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    addAlias(slug);

    const customAliases = this.SUBJECT_ALIAS_OVERRIDES[subject] || [];
    customAliases.forEach(addAlias);

    const normalizedAliases = Array.from(aliases).filter(Boolean);
    this.SUBJECT_ALIAS_CACHE.set(subject, normalizedAliases);
    return normalizedAliases;
  }

  static getSubjectPriorityIndex(subject) {
    const idx = this.SUBJECT_PRIORITY.indexOf(subject);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  }

  static ensureSubjectMaps() {
    if (this.SUBJECT_LABEL_TO_SLUG.size === this.SUBJECT_ENUM.length) {
      return;
    }
    this.SUBJECT_LABEL_TO_SLUG = new Map(
      this.SUBJECT_ENUM.map((item) => [item.label, item.slug])
    );
    this.SUBJECT_SLUG_TO_LABEL = new Map(
      this.SUBJECT_ENUM.map((item) => [item.slug, item.label])
    );
  }

  static slugifyToken(value = "") {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static getSubjectSlugByLabel(label = "") {
    this.ensureSubjectMaps();
    return this.SUBJECT_LABEL_TO_SLUG.get(String(label || "").trim()) || "unknown";
  }

  static getSubjectLabelBySlug(slug = "") {
    this.ensureSubjectMaps();
    return this.SUBJECT_SLUG_TO_LABEL.get(this.slugifyToken(slug)) || "Unknown";
  }

  static normalizeSubjectSlug(value = "") {
    this.ensureSubjectMaps();
    const raw = String(value || "").trim();
    if (!raw) return null;
    const normalized = this.slugifyToken(raw);
    if (this.SUBJECT_SLUG_TO_LABEL.has(normalized)) {
      return normalized;
    }
    if (this.SUBJECT_LABEL_TO_SLUG.has(raw)) return this.SUBJECT_LABEL_TO_SLUG.get(raw);

    const normalizedRaw = this.normalizeString(raw);
    for (const subject of this.SUBJECT_ENUM) {
      if (this.normalizeString(subject.label) === normalizedRaw) {
        return subject.slug;
      }
      if (this.slugifyToken(subject.label) === normalized) {
        return subject.slug;
      }
      const aliases = this.getNormalizedSubjectAliases(subject.label);
      if (aliases.includes(normalizedRaw)) {
        return subject.slug;
      }
    }
    return null;
  }

  static normalizeTypeToken(rawType = "") {
    const value = String(rawType || "").trim().toLowerCase();
    if (value === "mcq") return "mcq";
    if (value === "msq") return "msq";
    if (value === "nat") return "nat";
    return "unknown";
  }

  static buildYearSetKey(year, setNo) {
    const yearNum = Number.parseInt(String(year || ""), 10);
    if (!Number.isFinite(yearNum) || yearNum <= 0) {
      return null;
    }
    const parsedSet = Number.parseInt(String(setNo ?? ""), 10);
    const normalizedSet = Number.isFinite(parsedSet) && parsedSet > 0 ? parsedSet : 0;
    return `${yearNum}-s${normalizedSet}`;
  }

  static parseYearSetKey(rawValue = "") {
    const value = String(rawValue || "").trim().toLowerCase();
    const match = value.match(/^(\d{4})-s(\d+)$/);
    if (!match) return null;
    const year = Number.parseInt(match[1], 10);
    const setNum = Number.parseInt(match[2], 10);
    if (!Number.isFinite(year)) return null;
    return {
      year,
      set: Number.isFinite(setNum) && setNum > 0 ? setNum : null,
      key: `${year}-s${Number.isFinite(setNum) && setNum > 0 ? setNum : 0}`,
    };
  }

  static formatYearSetLabel(yearSetKey = "") {
    const parsed = this.parseYearSetKey(yearSetKey);
    if (!parsed) return String(yearSetKey || "");
    if (parsed.set) {
      return `${parsed.year} Set ${parsed.set}`;
    }
    return String(parsed.year);
  }

  static extractYearSetFromTag(rawTag = "") {
    const tag = String(rawTag || "").trim().toLowerCase();
    const match = tag.match(this.YEAR_SET_TAG_PATTERN);
    if (!match) return null;
    const year = Number.parseInt(match[1], 10);
    const set = Number.parseInt(match[2], 10);
    if (!Number.isFinite(year)) return null;
    return {
      year,
      set: Number.isFinite(set) && set > 0 ? set : null,
    };
  }

  static extractExamMeta(question = {}) {
    const candidates = [];

    const pushCandidate = (yearRaw, setRaw, confidence = 0) => {
      const year = Number.parseInt(String(yearRaw || ""), 10);
      const set = Number.parseInt(String(setRaw ?? ""), 10);
      if (!Number.isFinite(year) || year < 1990 || year > 2100) return;
      candidates.push({
        year,
        set: Number.isFinite(set) && set > 0 ? set : null,
        confidence,
      });
    };

    // Prefer explicit exam object when present.
    if (question.exam && typeof question.exam === "object") {
      pushCandidate(question.exam.year, question.exam.set, 100);
    }

    // Existing source field used by the dataset.
    const yearField = question.year;
    const fromYearTag = this.extractYearSetFromTag(yearField);
    if (fromYearTag) {
      pushCandidate(fromYearTag.year, fromYearTag.set, 95);
    } else if (yearField) {
      pushCandidate(yearField, null, 90);
    }

    // Tags can encode year/set.
    if (Array.isArray(question.tags)) {
      question.tags.forEach((tag) => {
        const parsed = this.extractYearSetFromTag(tag);
        if (parsed) {
          pushCandidate(parsed.year, parsed.set, parsed.set ? 85 : 80);
        }
      });
    }

    // Title fallback.
    const title = String(question.title || "");
    const titleMatch = title.match(this.TITLE_YEAR_SET_PATTERN);
    if (titleMatch) {
      pushCandidate(titleMatch[1], titleMatch[2], titleMatch[2] ? 70 : 65);
    }

    // Link fallback.
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

  // ── Performance: subtopic lookup cache (backed by precomputed JSON) ────
  static _subtopicLookupCache = new Map();

  static getSubtopicLookupForSubject(subjectLabel = "") {
    // Fast path: use build-time precomputed lookup object as a Map
    if (this._subtopicLookupCache.has(subjectLabel)) {
      return this._subtopicLookupCache.get(subjectLabel);
    }

    let lookupMap;
    if (PRECOMPUTED_SUBTOPICS[subjectLabel]) {
      // The precomputed JSON stores { normalizedKey: { slug, label } }
      lookupMap = new Map(Object.entries(PRECOMPUTED_SUBTOPICS[subjectLabel]));
    } else {
      const subjectSubtopics = this.TOPIC_HIERARCHY[subjectLabel] || [];
      lookupMap = new Map(
        subjectSubtopics.map((subtopic) => [
          this.normalizeString(subtopic),
          {
            slug: this.slugifyToken(subtopic),
            label: subtopic,
          },
        ])
      );
    }

    this._subtopicLookupCache.set(subjectLabel, lookupMap);
    return lookupMap;
  }

  // ── Max subtopic matches per question ─────────────────────────────────
  // GateOverflow scraped data is known to carry section-wide tag pollution:
  // every question in an exam section may receive ALL subtopic tags for that
  // section, not just its own.  Tag order preserves specificity — the first
  // subtopic-matching tag is almost always correct, later ones are noise.
  // GATE questions are narrowly focused on a single subtopic, so capping at
  // 1 eliminates cross-subtopic contamination entirely.
  static MAX_SUBTOPICS_PER_QUESTION = 1;

  static extractCanonicalSubtopics(tags = [], subjectLabel = "") {
    if (!Array.isArray(tags) || !subjectLabel || !this.TOPIC_HIERARCHY[subjectLabel]) {
      return [];
    }

    const lookup = this.getSubtopicLookupForSubject(subjectLabel);
    const unique = new Map();

    // Iterate tags in order (tag order preserves specificity).
    for (const tag of tags) {
      if (unique.size >= this.MAX_SUBTOPICS_PER_QUESTION) break;
      const norm = this.normalizeString(tag);
      const entry = lookup.get(norm);
      if (!entry || unique.has(entry.slug)) continue;
      unique.set(entry.slug, entry);
    }

    // Dev-mode diagnostic: warn when over-tagging contamination is detected.
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      let totalMatches = 0;
      for (const tag of tags) {
        const norm = this.normalizeString(tag);
        if (lookup.has(norm)) totalMatches++;
      }
      if (totalMatches > this.MAX_SUBTOPICS_PER_QUESTION + 1) {
        console.debug(
          '[SubtopicContamination] %s — %d subtopic tags found, capped to %d. Tags: %o → Kept: %o',
          subjectLabel, totalMatches, unique.size,
          tags.filter(t => lookup.has(this.normalizeString(t))),
          Array.from(unique.values()).map(e => e.label)
        );
      }
    }

    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  static resolveCanonicalSubject(question) {
    const tags = Array.isArray(question.tags) ? question.tags : [];
    const normalizedTags = tags.map(t => this.normalizeString(t));
    const normalizedTagSet = new Set(normalizedTags);
    const firstTagIndex = new Map();

    normalizedTags.forEach((tag, index) => {
      if (!tag || firstTagIndex.has(tag)) return;
      firstTagIndex.set(tag, index);
    });

    const title = String(question.title || "");
    const isGeneralAptitudeTitle = /\bGA(?:\s*QUESTION|\s*[-:]\s*\d+|\s+\d+)\b/i.test(title);

    // GA tags/titles must stay in GA regardless of overlapping generic tags.
    if (isGeneralAptitudeTitle ||
      normalizedTagSet.has("generalaptitude") ||
      normalizedTagSet.has("quantitativeaptitude") ||
      normalizedTagSet.has("verbalaptitude") ||
      normalizedTagSet.has("analyticalaptitude")) {
      return "General Aptitude";
    }

    const explicitCandidates = new Set();
    const subjectStats = new Map();

    Object.keys(this.TOPIC_HIERARCHY).forEach(subject => {
      const aliases = this.getNormalizedSubjectAliases(subject);
      // Use precomputed normalized subtopic strings (zero regex at runtime)
      const normalizedSubs = PRECOMPUTED_NORMALIZED[subject] || [];

      let explicitIndex = Number.MAX_SAFE_INTEGER;
      aliases.forEach(alias => {
        if (!normalizedTagSet.has(alias)) return;
        const idx = firstTagIndex.get(alias);
        if (idx !== undefined && idx < explicitIndex) {
          explicitIndex = idx;
        }
      });

      let subtopicCount = 0;
      let firstSubtopicIndex = Number.MAX_SAFE_INTEGER;
      normalizedSubs.forEach(normSub => {
        if (!normalizedTagSet.has(normSub)) return;
        subtopicCount += 1;
        const idx = firstTagIndex.get(normSub);
        if (idx !== undefined && idx < firstSubtopicIndex) {
          firstSubtopicIndex = idx;
        }
      });

      if (explicitIndex !== Number.MAX_SAFE_INTEGER || subtopicCount > 0) {
        subjectStats.set(subject, { explicitIndex, subtopicCount, firstSubtopicIndex });
      }

      if (explicitIndex !== Number.MAX_SAFE_INTEGER) {
        explicitCandidates.add(subject);
      }
    });

    if (explicitCandidates.size === 1) {
      return Array.from(explicitCandidates)[0];
    }

    if (explicitCandidates.size > 1) {
      const ranked = Array.from(explicitCandidates).sort((a, b) => {
        const aStats = subjectStats.get(a);
        const bStats = subjectStats.get(b);

        if (aStats.explicitIndex !== bStats.explicitIndex) {
          return aStats.explicitIndex - bStats.explicitIndex;
        }

        if (aStats.subtopicCount !== bStats.subtopicCount) {
          return bStats.subtopicCount - aStats.subtopicCount;
        }

        if (aStats.firstSubtopicIndex !== bStats.firstSubtopicIndex) {
          return aStats.firstSubtopicIndex - bStats.firstSubtopicIndex;
        }

        return this.getSubjectPriorityIndex(a) - this.getSubjectPriorityIndex(b);
      });

      return ranked[0];
    }

    if (subjectStats.size === 1) {
      return Array.from(subjectStats.keys())[0];
    }

    if (subjectStats.size > 1) {
      const ranked = Array.from(subjectStats.entries()).sort((a, b) => {
        const [aSubject, aStats] = a;
        const [bSubject, bStats] = b;

        if (aStats.subtopicCount !== bStats.subtopicCount) {
          return bStats.subtopicCount - aStats.subtopicCount;
        }

        if (aStats.firstSubtopicIndex !== bStats.firstSubtopicIndex) {
          return aStats.firstSubtopicIndex - bStats.firstSubtopicIndex;
        }

        return this.getSubjectPriorityIndex(aSubject) - this.getSubjectPriorityIndex(bSubject);
      });

      return ranked[0][0];
    }

    return "Unknown";
  }

  static normalizeQuestion(question = {}) {
    const normalized =
      question && typeof question === "object" ? { ...question } : {};
    normalized.title = normalized.title || "";
    normalized.question = normalized.question || "";
    normalized.link = normalized.link || "";
    normalized.tags = Array.isArray(normalized.tags) ? normalized.tags : [];
    normalized.tagsRaw = Array.isArray(normalized.tags)
      ? [...normalized.tags]
      : [];
    normalized.question_uid = this.buildQuestionUid(normalized);
    normalized.exam_uid = getExamUidFromQuestion(normalized) || "";

    const exam = this.extractExamMeta(normalized);
    const subjectLabel = this.resolveCanonicalSubject(normalized);
    const subjectSlug = this.getSubjectSlugByLabel(subjectLabel);
    const canonicalSubtopics = this.extractCanonicalSubtopics(
      normalized.tagsRaw,
      subjectLabel
    );
    const canonicalType = this.normalizeTypeToken(normalized.type);

    normalized.canonical = {
      uid: normalized.question_uid,
      exam,
      subject: subjectSlug,
      subjectLabel,
      topics: subjectSlug === "unknown" ? [] : [subjectSlug],
      subtopics: canonicalSubtopics,
      type: canonicalType,
      tagsRaw: [...normalized.tagsRaw],
    };

    // Backward-compatible aliases consumed by filter/UI code.
    normalized.subject = subjectLabel;
    normalized.subjectSlug = subjectSlug;
    normalized.exam = exam;
    normalized.yearSetKey = exam.yearSetKey;
    normalized.subtopics = canonicalSubtopics;
    normalized.type = canonicalType;

    return normalized;
  }

  // ── Layer 2 helper: process questions in yielding chunks ───────────────
  static _processChunked(rows, chunkSize = 500) {
    return new Promise((resolve) => {
      const results = [];
      let offset = 0;

      const processNext = () => {
        const end = Math.min(offset + chunkSize, rows.length);
        for (let i = offset; i < end; i++) {
          const normalized = this.normalizeQuestion(rows[i]);
          if (normalized.title !== "General") {
            results.push(normalized);
          }
        }
        offset = end;
        if (offset < rows.length) {
          // Yield the thread briefly so the browser can paint/handle events
          setTimeout(processNext, 0);
        } else {
          resolve(results);
        }
      };

      // First chunk runs synchronously to populate UI quickly
      processNext();
    });
  }

  // ── Layer 4 helpers: localStorage cache ────────────────────────────────
  static _readCache() {
    try {
      // Migration: clean up legacy v1 cache
      localStorage.removeItem('gateqa_init_cache_v1');
      const raw = localStorage.getItem(INIT_CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!cached || !Array.isArray(cached.questions) || !cached.sourceUrl) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  // Strip large duplicate fields so the payload fits in ~5MB localStorage quota
  static _stripForCache(questions) {
    return questions.map(q => {
      const slim = { ...q };
      delete slim.tagsRaw;  // duplicate of tags
      if (slim.canonical) {
        slim.canonical = { ...slim.canonical };
        delete slim.canonical.tagsRaw;  // another duplicate
      }
      return slim;
    });
  }

  // Restore stripped fields when reading from cache
  static _hydrateFromCache(questions) {
    return questions.map(q => {
      q.tagsRaw = Array.isArray(q.tags) ? [...q.tags] : [];
      if (q.canonical && typeof q.canonical === 'object') {
        q.canonical.tagsRaw = [...q.tagsRaw];
      }
      return q;
    });
  }

  static _writeCache() {
    try {
      const payload = {
        sourceUrl: this.sourceUrl,
        questions: this._stripForCache(this.questions),
      };
      localStorage.setItem(INIT_CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      if (isQuotaExceededError(err)) {
        console.warn('[QuestionService] Cache write failed (quota exceeded)');
      } else {
        console.warn('[QuestionService] Cache write failed (storage unavailable)');
      }
    }
  }

  /** Bust the init cache (call after pushing new question data). */
  static clearInitCache() {
    try { localStorage.removeItem(INIT_CACHE_KEY); } catch { /* noop */ }
  }

  static async init() {
    if (this.loaded) {
      return;
    }

    console.time('QuestionService.init');

    // ── Layer 4: try localStorage cache first ───────────────────────────
    const cached = this._readCache();
    if (cached) {
      this.sourceUrl = cached.sourceUrl;
      this.questions = this._hydrateFromCache(cached.questions);
      this.loaded = true;
      this.buildIndexes();
      console.timeEnd('QuestionService.init');

      return;
    }

    // ── Network fetch (unchanged candidate logic) ───────────────────────
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const dataCandidates = [
      `${baseUrl}questions-with-answers.json`,
      `${baseUrl}questions-filtered-with-ids.json`,
      `${baseUrl}questions-filtered.json`,
    ];

    let bestCandidate = null;
    let lastStatus = 0;
    for (const dataUrl of dataCandidates) {
      const response = await fetch(dataUrl, { cache: "no-cache" });
      lastStatus = response.status;
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      if (!Array.isArray(payload) || payload.length === 0) {
        continue;
      }

      const objectRows = payload.filter(
        (question) => question && typeof question === "object"
      );
      if (!objectRows.length) {
        continue;
      }

      const joinReadyCount = objectRows.reduce(
        (count, question) =>
          count + (this.hasNativeJoinIdentity(question) ? 1 : 0),
        0
      );
      const joinCoverage = joinReadyCount / objectRows.length;

      if (!bestCandidate || joinCoverage > bestCandidate.joinCoverage) {
        bestCandidate = {
          dataUrl,
          data: objectRows,
          joinCoverage,
          joinReadyCount,
        };
      }

      if (joinCoverage === 1) {
        break;
      }
    }

    if (!bestCandidate) {
      throw new Error(`Failed to load questions (${lastStatus}).`);
    }

    this.sourceUrl = bestCandidate.dataUrl;

    // ── Layer 2: chunked idle-time processing ───────────────────────────
    this.questions = await this._processChunked(bestCandidate.data);

    if (bestCandidate.joinCoverage < 1) {
      console.warn(
        `[QuestionService] Using ${bestCandidate.dataUrl} with ${bestCandidate.joinReadyCount}/${bestCandidate.data.length} native join identities.`
      );
    }

    this.loaded = true;
    this.buildIndexes();

    // ── Layer 4: persist to localStorage for instant subsequent loads ────
    this._writeCache();

    console.timeEnd('QuestionService.init');

  }

  static buildIndexes() {
    this.count = new Map();
    const tagSet = new Set();

    for (const question of this.questions) {
      for (const tag of question.tags || []) {
        tagSet.add(tag);
        this.count.set(tag, (this.count.get(tag) || 0) + 1);
      }
    }

    this.tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }

  static getErrorQuestion(title = "No matching question for this filter.") {
    return {
      title,
      question: "",
      link: "",
      tags: [],
    };
  }

  static getRandomQuestion(tags = []) {
    if (!this.questions.length) {
      return this.getErrorQuestion("Questions are not loaded yet.");
    }

    if (!tags || tags.length === 0) {
      return this.questions[Math.floor(Math.random() * this.questions.length)];
    }

    const year = new Set();
    const tag = new Set();

    for (const t of tags) {
      if (t.startsWith("gate")) {
        year.add(t);
      } else {
        tag.add(t);
      }
    }

    const filtered = this.questions.filter((question) => {
      let valid = false;
      for (const y of year) {
        if (question.tags.includes(y)) {
          valid = true;
          break;
        }
      }

      if (!valid && year.size !== 0) return false;

      for (const t of tag) {
        if (question.tags.includes(t)) return true;
      }

      if (tag.size === 0) return true;

      return false;
    });

    if (filtered.length === 0) {
      return this.getErrorQuestion();
    }

    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  static getTags() {
    return this.tags;
  }

  static TOPIC_HIERARCHY = {
    "Discrete Mathematics": [
      "Combinatory", "Balls In Bins", "Counting", "Generating Functions", "Modular Arithmetic",
      "Pigeonhole Principle", "Recurrence Relation", "Summation", "Degree of Graph", "Graph Coloring",
      "Graph Connectivity", "Graph Isomorphism", "Graph Matching", "Graph Planarity", "First Order Logic",
      "Logical Reasoning", "Propositional Logic", "Binary Operation", "Countable Uncountable Set",
      "Functions", "Group Theory", "Identify Function", "Lattice", "Mathematical Induction",
      "Number Theory", "Onto", "Partial Order", "Polynomials", "Relations", "Set Theory"
    ],
    "Engineering Mathematics": [
      "Calculus", "Continuity", "Definite Integral", "Differentiation", "Integration", "Limits",
      "Maxima Minima", "Polynomials", "Linear Algebra", "Cartesian Coordinates", "Determinant",
      "Eigen Value", "Gaussian Elimination", "Lu Decomposition", "Matrix", "Orthonormality",
      "Rank of Matrix", "Singular Value Decomposition", "Subspace", "System of Equations", "Vector Space",
      "Probability", "Bayes Theorem", "Bayesian Network", "Bernoulli Distribution", "Binomial Distribution",
      "Conditional Probability", "Continuous Distribution", "Expectation", "Exponential Distribution",
      "Independent Events", "Normal Distribution", "Poisson Distribution", "Probability Density Function",
      "Probability Distribution", "Random Variable", "Square Invariant", "Statistics", "Uniform Distribution",
      "Variance"
    ],
    "General Aptitude": [
      "Analytical Aptitude", "Age Relation", "Code Words", "Coding Decoding", "Counting Figure",
      "Direction Sense", "Family Relationship", "Inequality", "Logical Inference", "Logical Reasoning",
      "Number Relations", "Odd One", "Passage Reading", "Round Table Arrangement", "Seating Arrangement",
      "Sequence Series", "Statements Follow", "Quantitative Aptitude", "Absolute Value", "Algebra",
      "Alligation Mixture", "Area", "Arithmetic Series", "Average", "Bar Graph", "Calendar",
      "Cartesian Coordinates", "Circle", "Clock Time", "Combinatory", "Compound Interest",
      "Conditional Probability", "Cones", "Contour Plots", "Cost Market Price", "Counting", "Cube",
      "Currency Notes", "Curves", "Data Interpretation", "Digital Image Processing", "Factors",
      "Fractions", "Functions", "Geometry", "Graph Coloring", "Inequality", "LCM HCF", "Line Graph",
      "Lines", "Logarithms", "Maps", "Maxima Minima", "Mensuration", "Modular Arithmetic", "Number Series",
      "Number System", "Number Theory", "Numerical Computation", "Percentage", "Permutation and Combination",
      "Pie Chart", "Polynomials", "Powers", "Prime Numbers", "Probability", "Probability Density Function",
      "Profit Loss", "Quadratic Equations", "Radar Chart", "Ratio Proportion", "Scatter Plot",
      "Seating Arrangement", "Sequence Series", "Set Theory", "Speed Time Distance", "Squares", "Statistics",
      "System of Equations", "Tables", "Tabular Data", "Triangles", "Trigonometry", "Unit Digit",
      "Venn Diagram", "Volume", "Work Time", "Spatial Aptitude", "Assembling Pieces", "Counting Figure",
      "Grouping", "Image Rotation", "Mirror Image", "Paper Folding", "Patterns In Three Dimensions",
      "Patterns In Two Dimensions", "Verbal Aptitude", "Articles", "Comparative Forms", "English Grammar",
      "Grammatical Error", "Incorrect Sentence Part", "Most Appropriate Word", "Narrative Sequencing",
      "Noun Verb Adjective", "Opposite", "Passage Reading", "Phrasal Verb", "Phrase Meaning",
      "Prepositions", "Pronouns", "Sentence Ordering", "Statement Sufficiency", "Statements Follow",
      "Synonyms", "Tenses", "Verbal Reasoning", "Word Meaning", "Word Pairs"
    ],
    "Algorithms": [
      "Algorithm Design", "Algorithm Design Technique", "Asymptotic Notation", "Asymptotic Notations",
      "Bellman Ford", "Binary Search", "Bitonic Array", "Depth First Search", "Dijkstras Algorithm",
      "Directed Graph", "Double Hashing", "Dynamic Programming", "Graph Algorithms", "Graph Search",
      "Greedy Algorithms", "Hashing", "Huffman Code", "Identify Function", "Insertion Sort",
      "Linear Probing", "Matrix Chain Ordering", "Merge Sort", "Merging", "Minimum Spanning Tree",
      "Prims Algorithm", "Quick Sort", "Recurrence Relation", "Recursion", "Searching", "Shortest Path",
      "Sorting", "Space Complexity", "Strongly Connected Components", "Time Complexity", "Topological Sort"
    ],
    "CO & Architecture": [
      "Addressing Modes", "Average Memory Access Time", "CISC RISC Architecture", "Cache Memory",
      "Clock Cycles", "DMA", "Data Dependency", "Data Path", "IO Handling", "Instruction Execution",
      "Instruction Format", "Instruction Set Architecture", "Interrupts", "Machine Instruction",
      "Memory Interfacing", "Microprogramming", "Pipelining", "Runtime Environment", "Speedup", "Virtual Memory"
    ],
    "Compiler Design": [
      "Assembler", "Backpatching", "Basic Blocks", "Code Optimization", "Compilation Phases",
      "Expression Evaluation", "First and Follow", "Grammar", "Intermediate Code", "LR Parser",
      "Lexical Analysis", "Linker", "Live Variable Analysis", "Macros", "Operator Precedence",
      "Parameter Passing", "Parsing", "Register Allocation", "Runtime Environment", "Static Single Assignment",
      "Symbol Table", "Syntax Directed Translation", "Variable Scope"
    ],
    "Computer Networks": [
      "Application Layer Protocols", "Arp", "Bit Stuffing", "Bridges", "CRC Polynomial", "CSMA CD",
      "Channel Utilization", "Communication", "Congestion Control", "Distance Vector Routing",
      "Error Detection", "Ethernet", "Fragmentation", "IP Addressing", "IP Packet", "LAN Technologies",
      "MAC Protocol", "Network Flow", "Network Layering", "Network Protocols", "Network Switching",
      "Osi Model", "Probability", "Routing", "Routing Protocols", "Sliding Window", "Sockets",
      "Stop and Wait", "Subnetting", "TCP", "Token Bucket", "UDP"
    ],
    "Databases": [
      "B Tree", "Candidate Key", "Conflict Serializable", "Database Design", "Database Normalization",
      "Decomposition", "ER Diagram", "Functional Dependency", "Indexing", "Joins", "Multivalued Dependency 4nf",
      "Natural Join", "Query", "Referential Integrity", "Relational Algebra", "Relational Calculus",
      "Relational Model", "SQL", "Transaction and Concurrency", "Tuple Relational Calculus"
    ],
    "Digital Logic": [
      "Adder", "Array Multiplier", "Boolean Algebra", "Booths Algorithm", "Canonical Normal Form",
      "Carry Generator", "Circuit Output", "Combinational Circuit", "Decoder", "Digital Circuits",
      "Digital Counter", "Finite State Machines", "Fixed Point Representation", "Flip Flop",
      "Floating Point Representation", "Functional Completeness", "IEEE Representation", "K Map",
      "Memory Interfacing", "Min No Gates", "Min Products of Sum Form", "Min Sum of Products Form",
      "Multiplexer", "Number Representation", "Prime Implicants", "ROM", "Ripple Counter Operation",
      "Sequential Circuit", "Shift Registers", "Static Hazard", "Synchronous Asynchronous Circuits"
    ],
    "Operating System": [
      "Context Switch", "Deadlock Prevention Avoidance Detection", "Disk", "Disk Scheduling", "File System",
      "Fork System Call", "IO Handling", "Input Output", "Inter Process Communication", "Interrupts",
      "Linked Allocation", "Memory Management", "Multilevel Paging", "OS Protection", "Optimal Page Replacement",
      "Page Replacement", "Precedence Graph", "Process", "Process Scheduling", "Process Synchronization",
      "Resource Allocation", "Resource Allocation Graph", "Semaphore", "Srtf", "System Calls", "Threads",
      "Virtual Memory"
    ],
    "Programming and DS": [
      "AVL Tree", "Array", "Binary Heap", "Binary Search Tree", "Binary Tree", "Data Structures",
      "Hashing", "Infix Prefix", "Linked List", "Number of Swap", "Priority Queue", "Queue", "Stack",
      "Time Complexity", "Tree"
    ],
    "Programming in C": [
      "Aliasing", "Array", "Functions", "Goto", "Identify Function", "Loop Invariants", "Output",
      "Parameter Passing", "Pointers", "Programming Constructs", "Programming In C", "Programming Paradigms",
      "Recursion", "Strings", "Structure", "Switch Case", "Type Checking", "Union", "Variable Binding"
    ],
    "Theory of Computation": [
      "Closure Property", "Context Free Grammar", "Context Free Language", "Countable Uncountable Set",
      "Decidability", "Dpda", "Finite Automata", "Finite State Machines", "Identify Class Language",
      "Minimal State Automata", "Non Determinism", "Number of States", "Pumping Lemma", "Pushdown Automata",
      "Recursive and Recursively Enumerable Languages", "Reduction", "Regular Expression", "Regular Grammar",
      "Regular Language"
    ]
  };

  // Helper to normalize strings for comparison (lowercase, handle slight variations if needed)
  static normalizeString(str) {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  static getStructuredTags() {
    const yearSetMap = new Map();
    const subjectCountMap = new Map();
    const structuredSubtopics = {};

    this.ensureSubjectMaps();
    this.SUBJECT_ENUM.forEach((subject) => {
      structuredSubtopics[subject.slug] = new Map();
      subjectCountMap.set(subject.slug, 0);
    });

    this.questions.forEach((question) => {
      const exam = question.exam || this.extractExamMeta(question);
      if (exam && exam.yearSetKey) {
        if (!yearSetMap.has(exam.yearSetKey)) {
          yearSetMap.set(exam.yearSetKey, {
            key: exam.yearSetKey,
            year: exam.year,
            set: exam.set,
            label: exam.label || this.formatYearSetLabel(exam.yearSetKey),
            count: 0,
          });
        }
        yearSetMap.get(exam.yearSetKey).count += 1;
      }

      const subjectSlug = this.normalizeSubjectSlug(question.subjectSlug) || "unknown";
      if (subjectCountMap.has(subjectSlug)) {
        subjectCountMap.set(subjectSlug, subjectCountMap.get(subjectSlug) + 1);
      }

      const canonicalSubtopics = Array.isArray(question.subtopics)
        ? question.subtopics
        : [];

      if (!structuredSubtopics[subjectSlug] || !canonicalSubtopics.length) {
        return;
      }

      canonicalSubtopics.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const slug = this.slugifyToken(entry.slug || entry.label || "");
        const label = String(entry.label || "").trim();
        if (!slug || !label) return;
        if (!structuredSubtopics[subjectSlug].has(slug)) {
          structuredSubtopics[subjectSlug].set(slug, { slug, label });
        }
      });
    });

    const yearSets = Array.from(yearSetMap.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return (b.set || 0) - (a.set || 0);
    });

    const subjects = this.SUBJECT_ENUM
      .filter((subject) => (subjectCountMap.get(subject.slug) || 0) > 0)
      .map((subject) => ({
        ...subject,
        count: subjectCountMap.get(subject.slug) || 0,
      }));

    const normalizedStructuredSubtopics = {};
    subjects.forEach((subject) => {
      const subtopicEntries = structuredSubtopics[subject.slug]
        ? Array.from(structuredSubtopics[subject.slug].values())
        : [];
      normalizedStructuredSubtopics[subject.slug] = subtopicEntries.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    });

    // Backward-compatibility for any legacy UI branch that still expects label keyed topics.
    const structuredTopics = {};
    subjects.forEach((subject) => {
      structuredTopics[subject.label] = (normalizedStructuredSubtopics[subject.slug] || [])
        .map((entry) => entry.label);
    });

    const numericYears = yearSets.map((entry) => entry.year).filter((year) => Number.isFinite(year));
    const minYear = numericYears.length ? Math.min(...numericYears) : 2000;
    const maxYear = numericYears.length ? Math.max(...numericYears) : 2025;

    return {
      yearSets,
      years: yearSets.map((entry) => entry.key),
      subjects,
      topics: subjects.map((subject) => subject.slug),
      structuredSubtopics: normalizedStructuredSubtopics,
      structuredTopics,
      minYear,
      maxYear,
    };
  }

  static getMinMaxYears() {
    const years = [];
    for (const tag of this.tags) {
      if (tag.startsWith("gate")) {
        const match = tag.match(/\d{4}/);
        if (match) years.push(parseInt(match[0], 10));
      }
    }
    if (years.length === 0) return { min: 2000, max: 2025 };
    return { min: Math.min(...years), max: Math.max(...years) };
  }

  static getCount(tag) {
    return this.count.get(tag) || 0;
  }
}
