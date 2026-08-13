const GATEOVERFLOW_HOST_RE = /^(?:www\.)?gateoverflow\.in$/i;
const GATEOVERFLOW_QUESTION_PATH_RE = /^\/(\d+)(?:[/?#]|$)/;

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

export default getGateOverflowSolutionLink;
