const GATEOVERFLOW_HOST_RE = /^(?:www\.)?gateoverflow\.in$/i;
const GATEOVERFLOW_QUESTION_PATH_RE = /^\/(\d+)(?:[/?#]|$)/;

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

