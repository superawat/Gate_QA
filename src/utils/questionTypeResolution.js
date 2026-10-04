const OBJECTIVE_TYPES = new Set(["MCQ", "MSQ", "NAT", "MULTI_NAT"]);
const AUTO_AWARD_TYPES = new Set(["AMBIGUOUS", "MARKS_TO_ALL", "SUBJECTIVE"]);

export const normalizeQuestionType = (value = "") => {
  const token = String(value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (token === "MULTI_BLANK_NAT") return "MULTI_NAT";
  if (token === "MTA") return "MARKS_TO_ALL";
  return OBJECTIVE_TYPES.has(token) || AUTO_AWARD_TYPES.has(token) ? token : "";
};

const isOptionLabel = (value) => /^[A-E]$/i.test(String(value ?? "").trim());

/**
 * Resolves exam delivery format without treating semantic tags or numeric answer
 * values as proof of NAT. Conflicting explicit types and NAT plus choices fail closed.
 * @param {{ candidates?: Array<{source?: string, type?: unknown}>, optionCount?: number, conflictOptionCount?: number, answer?: unknown }} options
 */
export const resolveQuestionType = ({
  candidates = [],
  optionCount = 0,
  conflictOptionCount = optionCount,
  answer,
} = {}) => {
  const normalizedCandidates = candidates
    .map((candidate) => ({
      source: candidate?.source || "unknown",
      type: normalizeQuestionType(candidate?.type),
    }))
    .filter((candidate) => candidate.type);
  const distinctTypes = [...new Set(normalizedCandidates.map(({ type }) => type))];

  if (distinctTypes.length > 1) {
    return {
      type: "",
      source: null,
      issues: ["type_mismatch"],
      candidates: normalizedCandidates,
    };
  }

  const explicitType = distinctTypes[0] || "";
  const hasChoices = Number(optionCount) >= 2;
  if (explicitType) {
    if (
      (explicitType === "NAT" || explicitType === "MULTI_NAT")
      && (isOptionLabel(answer) || Number(conflictOptionCount) >= 4)
    ) {
      return {
        type: "",
        source: null,
        issues: ["type_option_conflict"],
        candidates: normalizedCandidates,
      };
    }
    return {
      type: explicitType,
      source: normalizedCandidates[0]?.source || null,
      issues: [],
      candidates: normalizedCandidates,
    };
  }

  // Options alone cannot distinguish MCQ from MSQ. Only an option-label answer key
  // provides a safe fallback when explicit type metadata is absent.
  if (hasChoices) {
    if (Array.isArray(answer) && answer.length > 0 && answer.every(isOptionLabel)) {
      return { type: "MSQ", source: "answer_shape", issues: [], candidates: [] };
    }
    if (!Array.isArray(answer) && isOptionLabel(answer)) {
      return { type: "MCQ", source: "answer_shape", issues: [], candidates: [] };
    }
  }

  return { type: "", source: null, issues: ["missing_type"], candidates: [] };
};
