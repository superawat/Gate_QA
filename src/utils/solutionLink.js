const GATEOVERFLOW_HOST_RE = /^(?:(?:[a-z0-9-]+\.)?gateoverflow\.(?:in|com))$/i;
const GATEOVERFLOW_QUESTION_PATH_RE = /^\/(\d+)(?:[/?#]|$)/;

/**
 * Maps engineering branches to their official GateOverflow ecosystem subdomains.
 * ME: me.gateoverflow.in
 * EE: ee.gateoverflow.in
 * EC: ec.gateoverflow.in
 * CE: civil.gateoverflow.in
 * IN: in.gateoverflow.in
 * CH: ch.gateoverflow.in
 * CSE / DA / Default: gateoverflow.in
 */
export function getQuestionBranch(question = {}) {
  const branchCandidates = [
    question?.source_branch,
    question?.branch,
    question?.track,
    question?.exam?.branch,
    question?.exam?.paper,
    question?.paper,
  ];

  for (const candidate of branchCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const b = candidate.trim().toLowerCase();
      if (b === "me" || b === "mechanical") return "me";
      if (b === "ee" || b === "electrical") return "ee";
      if (b === "ec" || b === "ece" || b === "electronics") return "ec";
      if (b === "ce" || b === "civil") return "ce";
      if (b === "in" || b === "instrumentation") return "in";
      if (b === "ch" || b === "chemical") return "ch";
      if (b === "cse" || b === "cs" || b === "computer-science") return "cse";
      if (b === "da" || b === "data-science") return "da";
    }
  }

  // Check question_uid or exam_uid (e.g. "pp:me:2020:q1", "me:2020:set1:q1")
  const id = String(question?.question_uid || question?.exam_uid || question?.id || "").toLowerCase();
  const idMatch = id.match(/^(?:pp:)?([a-z]+):/);
  if (idMatch && ["me", "ee", "ec", "ce", "in", "ch", "cse", "da"].includes(idMatch[1])) {
    return idMatch[1];
  }

  // Check title (e.g. "GATE ME 2020 | Set 1 | Question: 1", "GATE Civil 2020")
  const title = String(question?.title || "").toLowerCase();
  if (/\b(?:me|mechanical)\b/i.test(title)) return "me";
  if (/\b(?:ee|electrical)\b/i.test(title)) return "ee";
  if (/\b(?:ec|ece|electronics)\b/i.test(title)) return "ec";
  if (/\b(?:ce|civil)\b/i.test(title)) return "ce";
  if (/\b(?:in|instrumentation)\b/i.test(title)) return "in";
  if (/\b(?:ch|chemical)\b/i.test(title)) return "ch";
  if (/\b(?:da|data science)\b/i.test(title)) return "da";
  if (/\b(?:cse|computer science)\b/i.test(title)) return "cse";

  return "cse";
}

/**
 * Return official base host URL for a branch's GateOverflow portal.
 */
export function getBranchGateOverflowBaseHost(branch = "") {
  const b = String(branch || "").toLowerCase();
  switch (b) {
    case "me":
      return "https://me.gateoverflow.in";
    case "ee":
      return "https://ee.gateoverflow.in";
    case "ec":
      return "https://ec.gateoverflow.in";
    case "ce":
      return "https://civil.gateoverflow.in";
    case "in":
      return "https://in.gateoverflow.in";
    case "ch":
      return "https://ch.gateoverflow.in";
    default:
      return "https://gateoverflow.in";
  }
}

/**
 * Generate branch-specific GateOverflow search URL for a question.
 */
export function getGateOverflowSearchUrl(question = {}) {
  const branch = getQuestionBranch(question);
  const baseHost = getBranchGateOverflowBaseHost(branch);

  let rawQuery = String(question?.title || "").trim();
  if (!rawQuery) {
    const year = question?.year || question?.exam?.year || "";
    const qNum = question?.qNum || question?.question_number || question?.number || "";
    const set = question?.set || question?.cse_set || "";
    rawQuery = `GATE ${branch.toUpperCase()} ${year} ${set ? `Set ${set} ` : ""}Question ${qNum}`.trim();
  }

  // Clean title delimiters (| and :) to optimize search relevance
  const cleanQuery = rawQuery
    .replace(/[|:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${baseHost}/?qa=search&q=${encodeURIComponent(cleanQuery)}`;
}

/**
 * Determine whether a question belongs to the Special Aptitude bank.
 * Special Aptitude questions are externally imported and do not originate from GateOverflow.
 */
export function isSpecialAptitudeQuestion(question = {}) {
  const uid = String(
    question?.question_uid ||
    question?.uid ||
    question?.id ||
    question?.canonical?.questionUid ||
    ""
  ).trim();

  if (uid.startsWith("APT-") || uid.startsWith("APT:") || uid.startsWith("apt:")) {
    return true;
  }

  const paper = String(question?.exam?.paper || question?.paper || "").trim().toLowerCase();
  if (paper === "aptitude") {
    return true;
  }

  const sourceKind = String(question?._source?.sourceKind || "").trim().toLowerCase();
  if (sourceKind === "aptitude-web") {
    return true;
  }

  const answerSource = String(question?.answerMeta?.source || "").trim().toLowerCase();
  if (answerSource === "aptitude_embedded") {
    return true;
  }

  return false;
}

/**
 * Return only a valid GateOverflow question URL for the external Solution action.
 * Source links from other providers (for example PracticePaper) are intentionally
 * rejected so they can never be used as solution redirects.
 */
export function getGateOverflowSolutionLink(question = {}) {
  const candidates = [
    question?.reference_link,
    question?.solution_link,
    question?.solutionLink,
    question?.link,
  ];

  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw) {
      continue;
    }

    try {
      const url = new URL(raw);
      if (
        (url.protocol === "https:" || url.protocol === "http:") &&
        GATEOVERFLOW_HOST_RE.test(url.hostname) &&
        GATEOVERFLOW_QUESTION_PATH_RE.test(url.pathname)
      ) {
        url.protocol = "https:";
        if (url.hostname.toLowerCase().endsWith(".com")) {
          url.hostname = url.hostname.replace(/\.com$/i, ".in");
        }
        return url.toString();
      }
    } catch {
      // Ignore malformed or relative URLs. The Solution action must remain disabled.
    }
  }

  return "";
}

/**
 * Return a valid external solution link for Special Aptitude questions.
 * Rejects placeholder/internal domains (.internal, localhost, etc.) and GateOverflow non-question pages.
 */
export function getSpecialAptitudeSolutionLink(question = {}) {
  const candidates = [
    question?.solution_link,
    question?.solutionLink,
    question?.reference_link,
    question?.link,
  ];

  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw) {
      continue;
    }

    try {
      const url = new URL(raw);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        continue;
      }

      const hostname = url.hostname.toLowerCase();
      if (
        hostname.endsWith(".internal") ||
        hostname.endsWith(".local") ||
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      ) {
        continue;
      }

      if (GATEOVERFLOW_HOST_RE.test(hostname)) {
        if (GATEOVERFLOW_QUESTION_PATH_RE.test(url.pathname)) {
          return url.toString();
        }
        continue;
      }

      return url.toString();
    } catch {
      // Ignore malformed or invalid URLs
    }
  }

  return "";
}

/**
 * Get the appropriate solution link for any question.
 * Special Aptitude questions only return valid verified solution links (never GateOverflow search fallbacks).
 * Regular GATE questions return legitimate GateOverflow question links.
 */
export function getQuestionSolutionLink(question = {}) {
  if (isSpecialAptitudeQuestion(question)) {
    return getSpecialAptitudeSolutionLink(question);
  }
  return getGateOverflowSolutionLink(question);
}

export default getQuestionSolutionLink;

