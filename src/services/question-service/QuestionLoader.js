import { isQuotaExceededError } from "../../utils/localStorageState.js";

const INIT_CACHE_VERSION = "v11";
const INDEX_CACHE_KEY = `gateqa_index_cache_${INIT_CACHE_VERSION}`;
const FULL_BANK_CACHE_KEY = `gateqa_full_bank_cache_${INIT_CACHE_VERSION}`;

export function getCacheKey({ fullBank = false } = {}) {
  return fullBank ? FULL_BANK_CACHE_KEY : INDEX_CACHE_KEY;
}

export function hasLoadedDataset({ fullBank = false } = {}) {
  if (!this.loaded) {
    return false;
  }
  if (fullBank) {
    return this.loadMode === "full";
  }
  return this.loadMode === "index" || this.loadMode === "full";
}

export function getDetailShardKey(question = {}) {
  const explicitShardKey = String(question?.detailShardKey || "").trim();
  if (explicitShardKey) {
    return explicitShardKey;
  }

  const explicitYearSetKey = String(
    question?.yearSetKey || question?.exam?.yearSetKey || ""
  ).trim();
  if (explicitYearSetKey) {
    return explicitYearSetKey;
  }

  return "unknown";
}

export function _processIndexChunked(rows, chunkSize = 1000) {
  return new Promise((resolve) => {
    const results = [];
    let offset = 0;

    const processNext = () => {
      const end = Math.min(offset + chunkSize, rows.length);
      for (let i = offset; i < end; i += 1) {
        const hydrated = this.hydrateIndexedQuestion(rows[i]);
        if (hydrated.title !== "General") {
          results.push(hydrated);
        }
      }
      offset = end;
      if (offset < rows.length) {
        setTimeout(processNext, 0);
      } else {
        resolve(results);
      }
    };

    processNext();
  });
}

export function _processChunked(rows, chunkSize = 500) {
  return new Promise((resolve) => {
    const results = [];
    let offset = 0;

    const processNext = () => {
      const end = Math.min(offset + chunkSize, rows.length);
      for (let i = offset; i < end; i += 1) {
        if (this.isPracticeExcludedQuestion(rows[i])) {
          continue;
        }
        const normalized = this.normalizeQuestion(rows[i]);
        if (normalized.title !== "General") {
          results.push(normalized);
        }
      }
      offset = end;
      if (offset < rows.length) {
        setTimeout(processNext, 0);
      } else {
        resolve(this.finalizeQuestions(results));
      }
    };

    processNext();
  });
}

export function _readCache({ fullBank = false } = {}) {
  try {
    localStorage.removeItem("gateqa_init_cache_v1");
    localStorage.removeItem("gateqa_init_cache_v2");
    localStorage.removeItem("gateqa_init_cache_v3");
    localStorage.removeItem("gateqa_init_cache_v7");
    const raw = localStorage.getItem(this.getCacheKey({ fullBank }));
    if (!raw) {
      return null;
    }
    const cached = JSON.parse(raw);
    if (!cached || !Array.isArray(cached.questions) || !cached.sourceUrl) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function _stripForCache(questions) {
  return questions.map((question) => {
    const slim = { ...question };
    delete slim.tagsRaw;
    if (slim.canonical) {
      slim.canonical = { ...slim.canonical };
      delete slim.canonical.tagsRaw;
    }
    return slim;
  });
}

export function _hydrateFromCache(questions, { fullBank = false } = {}) {
  const hydratedQuestions = questions.map((question) => {
    question.tagsRaw = Array.isArray(question.tags) ? [...question.tags] : [];
    if (question.canonical && typeof question.canonical === "object") {
      question.canonical.tagsRaw = [...question.tagsRaw];
    }
    return question;
  });

  if (fullBank) {
    return this.finalizeQuestions(hydratedQuestions);
  }
  return hydratedQuestions;
}

export function _writeCache({ fullBank = false } = {}) {
  try {
    const payload = {
      sourceUrl: this.sourceUrl,
      questions: this._stripForCache(this.questions),
    };
    localStorage.setItem(this.getCacheKey({ fullBank }), JSON.stringify(payload));
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn("[QuestionService] Cache write failed (quota exceeded)");
    } else {
      console.warn("[QuestionService] Cache write failed (storage unavailable)");
    }
  }
}

export function clearInitCache() {
  try {
    localStorage.removeItem(INDEX_CACHE_KEY);
    localStorage.removeItem(FULL_BANK_CACHE_KEY);
    localStorage.removeItem("gateqa_init_cache_v7");
  } catch {
    // noop
  }
}

export async function _loadIndexedDataset(baseUrl) {
  const dataUrl = `${baseUrl}question-search-index.json`;
  const response = await fetch(dataUrl, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load question search index (${response.status}).`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Question search index payload is invalid.");
  }

  const objectRows = payload.filter((question) => question && typeof question === "object");
  if (!objectRows.length) {
    throw new Error("Question search index payload is invalid.");
  }

  return {
    sourceUrl: dataUrl,
    questions: await this._processIndexChunked(objectRows),
  };
}

export async function _loadFullBankDataset(baseUrl) {
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
    const objectRows = payload.filter((question) => question && typeof question === "object");
    if (!objectRows.length) {
      continue;
    }

    const joinReadyCount = objectRows.reduce(
      (count, question) => count + (this.hasNativeJoinIdentity(question) ? 1 : 0),
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

  return {
    sourceUrl: bestCandidate.dataUrl,
    questions: await this._processChunked(bestCandidate.data),
    joinCoverage: bestCandidate.joinCoverage,
    joinReadyCount: bestCandidate.joinReadyCount,
    candidateCount: bestCandidate.data.length,
    candidateUrl: bestCandidate.dataUrl,
  };
}

export async function init({ fullBank = false } = {}) {
  if (this.hasLoadedDataset({ fullBank })) {
    return;
  }

  const mode = fullBank ? "full" : "index";
  if (this.pendingLoads[mode]) {
    return this.pendingLoads[mode];
  }

  const timingLabel = fullBank ? "QuestionService.init:full" : "QuestionService.init:index";
  console.time(timingLabel);

  this.pendingLoads[mode] = (async () => {
    const cached = this._readCache({ fullBank });
    if (cached) {
      this.sourceUrl = cached.sourceUrl;
      this.questions = this._hydrateFromCache(cached.questions, { fullBank });
      this.loaded = true;
      this.loadMode = fullBank ? "full" : "index";
      if (fullBank) {
        this.detailCache = new Map(
          this.questions
            .filter((question) => question?.question_uid)
            .map((question) => [question.question_uid, question])
        );
      }
      this.buildIndexes();
      return;
    }

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const dataset = fullBank
      ? await this._loadFullBankDataset(baseUrl)
      : await this._loadIndexedDataset(baseUrl);

    this.sourceUrl = dataset.sourceUrl;
    this.questions = dataset.questions;
    this.loaded = true;
    this.loadMode = fullBank ? "full" : "index";
    if (fullBank) {
      this.detailCache = new Map(
        this.questions
          .filter((question) => question?.question_uid)
          .map((question) => [question.question_uid, question])
      );
    }
    this.buildIndexes();

    if (fullBank && dataset.joinCoverage < 1) {
      console.warn(
        `[QuestionService] Using ${dataset.candidateUrl} with ${dataset.joinReadyCount}/${dataset.candidateCount} native join identities.`
      );
    }

    this._writeCache({ fullBank });
  })().finally(() => {
    this.pendingLoads[mode] = null;
    console.timeEnd(timingLabel);
  });

  return this.pendingLoads[mode];
}

export function buildIndexes() {
  this.count = new Map();
  const tagSet = new Set();
  this.questionsByUid = new Map();

  for (const question of this.questions) {
    if (question?.question_uid) {
      this.questionsByUid.set(question.question_uid, question);
    }
    for (const tag of question.tags || []) {
      tagSet.add(tag);
      this.count.set(tag, (this.count.get(tag) || 0) + 1);
    }
  }

  this.tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export async function loadDetailShard(shardKey = "unknown") {
  const normalizedShardKey = String(shardKey || "unknown").trim() || "unknown";
  if (this.detailShardCache.has(normalizedShardKey)) {
    return this.detailShardCache.get(normalizedShardKey);
  }
  if (this.detailShardPromises.has(normalizedShardKey)) {
    return this.detailShardPromises.get(normalizedShardKey);
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const shardUrl = `${baseUrl}question-detail-shards/${encodeURIComponent(normalizedShardKey)}.json`;

  const shardPromise = fetch(shardUrl, { cache: "no-cache" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load question detail shard (${response.status}).`);
      }
      const payload = await response.json();
      const recordsByQuestionUid = payload?.recordsByQuestionUid;
      if (!recordsByQuestionUid || typeof recordsByQuestionUid !== "object") {
        throw new Error("Question detail shard payload is invalid.");
      }
      this.detailShardCache.set(normalizedShardKey, recordsByQuestionUid);
      return recordsByQuestionUid;
    })
    .finally(() => {
      this.detailShardPromises.delete(normalizedShardKey);
    });

  this.detailShardPromises.set(normalizedShardKey, shardPromise);
  return shardPromise;
}

export async function ensureQuestionDetail(questionOrUid = null) {
  const questionUid =
    typeof questionOrUid === "string"
      ? String(questionOrUid || "").trim()
      : String(questionOrUid?.question_uid || "").trim();
  if (!questionUid) {
    return null;
  }

  if (this.detailCache.has(questionUid)) {
    return this.detailCache.get(questionUid);
  }

  const indexedQuestion =
    typeof questionOrUid === "object" && questionOrUid
      ? questionOrUid
      : this.questionsByUid.get(questionUid) || null;
  if (!indexedQuestion) {
    return null;
  }

  if (this.loadMode === "full") {
    return this.questionsByUid.get(questionUid) || null;
  }

  const shardKey = this.getDetailShardKey(indexedQuestion);
  const recordsByQuestionUid = await this.loadDetailShard(shardKey);
  const rawQuestion = recordsByQuestionUid?.[questionUid];
  if (!rawQuestion) {
    throw new Error(`Question detail not found for ${questionUid}.`);
  }

  const detailedQuestion = this.buildDetailedQuestion(rawQuestion, indexedQuestion);
  this.detailCache.set(questionUid, detailedQuestion);
  return detailedQuestion;
}

export function getErrorQuestion(title = "No matching question for this filter.") {
  return {
    title,
    question: "",
    link: "",
    tags: [],
  };
}

export function getRandomQuestion(tags = []) {
  if (!this.questions.length) {
    return this.getErrorQuestion("Questions are not loaded yet.");
  }

  if (!tags || tags.length === 0) {
    return this.questions[Math.floor(Math.random() * this.questions.length)];
  }

  const year = new Set();
  const tag = new Set();

  for (const selectedTag of tags) {
    if (selectedTag.startsWith("gate")) {
      year.add(selectedTag);
    } else {
      tag.add(selectedTag);
    }
  }

  const filtered = this.questions.filter((question) => {
    let valid = false;
    for (const yearTag of year) {
      if (question.tags.includes(yearTag)) {
        valid = true;
        break;
      }
    }

    if (!valid && year.size !== 0) {
      return false;
    }

    for (const topicTag of tag) {
      if (question.tags.includes(topicTag)) {
        return true;
      }
    }

    if (tag.size === 0) {
      return true;
    }

    return false;
  });

  if (filtered.length === 0) {
    return this.getErrorQuestion();
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getTags() {
  return this.tags;
}

export function getMinMaxYears() {
  const years = [];
  for (const tag of this.tags) {
    if (tag.startsWith("gate")) {
      const match = tag.match(/\d{4}/);
      if (match) {
        years.push(parseInt(match[0], 10));
      }
    }
  }
  if (years.length === 0) {
    return { min: 2000, max: new Date().getFullYear() };
  }
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function getCount(tag) {
  return this.count.get(tag) || 0;
}
