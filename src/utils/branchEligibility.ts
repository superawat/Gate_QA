/**
 * src/utils/branchEligibility.ts
 * ------------------------------
 * Centralized eligibility and filtering rules based on user's selected branches.
 * Enforces official GATE regulation: Max 2 papers per candidate.
 * General Aptitude is universally available across all branches.
 */

import { EXAM_TRACKS, normalizeExamTrack, getQuestionTrack, isAptitudeQuestion, isAptitudeSubjectSlug } from "./examTrack";
import { readBranchPreferences, DEFAULT_BRANCH } from "./branchPreference";

export const UNIVERSAL_APTITUDE_TRACK = "aptitude";

/**
 * Normalizes branch identifiers (e.g. "cs" -> "cse", "it" -> "cse", "ece" -> "ec")
 */
export function normalizeBranchId(branchOrTrack: any): string {
  const raw = String(branchOrTrack ?? "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "aptitude" || raw === "ga" || raw === "general-aptitude") {
    return UNIVERSAL_APTITUDE_TRACK;
  }
  const normalized = normalizeExamTrack(raw);
  if (normalized === EXAM_TRACKS.ISRO || normalized === EXAM_TRACKS.CSE || raw === "cs" || raw === "it") {
    return EXAM_TRACKS.CSE;
  }
  if (normalized) {
    return normalized;
  }
  return raw;
}

/**
 * Returns true if a branch/track is eligible for the user.
 * General Aptitude is always eligible.
 */
export function isBranchEligible(
  branchOrTrack: any,
  selectedBranches: string[] = []
): boolean {
  const norm = normalizeBranchId(branchOrTrack);
  if (norm === UNIVERSAL_APTITUDE_TRACK) {
    return true;
  }
  const effectiveBranches = (Array.isArray(selectedBranches) && selectedBranches.length > 0)
    ? selectedBranches.map(normalizeBranchId)
    : [DEFAULT_BRANCH];

  return effectiveBranches.includes(norm);
}

/**
 * Returns true if a question is eligible under the given selected branches.
 * GA questions are universally eligible.
 */
export function isQuestionEligibleForBranches(
  question: any,
  selectedBranches: string[] = []
): boolean {
  if (!question) return false;
  if (isAptitudeQuestion(question)) {
    return true;
  }
  const track = getQuestionTrack(question);
  return isBranchEligible(track, selectedBranches);
}

/**
 * Filters a list of examination papers so only papers matching the user's
 * selected branches are kept.
 */
export function filterPapersBySelectedBranches<T extends { track?: string; [key: string]: any }>(
  papers: T[] = [],
  selectedBranches: string[] = []
): T[] {
  if (!Array.isArray(papers)) return [];
  const effectiveBranches = (Array.isArray(selectedBranches) && selectedBranches.length > 0)
    ? selectedBranches.map(normalizeBranchId)
    : [DEFAULT_BRANCH];

  return papers.filter((paper) => {
    const rawTrack = paper?.track || getQuestionTrack(paper);
    const normTrack = normalizeBranchId(rawTrack);
    return effectiveBranches.includes(normTrack);
  });
}

export interface InsightTrackOption {
  id: string;
  label: string;
  fullLabel: string;
  badge?: string;
}

const BRANCH_INSIGHT_META: Record<string, { label: string; fullLabel: string }> = {
  [EXAM_TRACKS.CSE]: { label: "CS", fullLabel: "GATE CSE" },
  [EXAM_TRACKS.DA]: { label: "DA", fullLabel: "GATE DA" },
  [EXAM_TRACKS.EC]: { label: "EC", fullLabel: "GATE EC" },
  [EXAM_TRACKS.EE]: { label: "EE", fullLabel: "GATE EE" },
  [EXAM_TRACKS.ME]: { label: "ME", fullLabel: "GATE ME" },
  [EXAM_TRACKS.CE]: { label: "CE", fullLabel: "GATE CE" },
};

/**
 * Returns the dynamic track tabs for Performance Insights based on selected branches.
 * Order: [Selected Branch 1, Selected Branch 2 (if any), Special Aptitude, Combined]
 */
export function getInsightTracksForSelectedBranches(selectedBranches: string[] = []): InsightTrackOption[] {
  const effectiveBranches = (Array.isArray(selectedBranches) && selectedBranches.length > 0)
    ? selectedBranches.map(normalizeBranchId)
    : [DEFAULT_BRANCH, "da"];

  const tracks: InsightTrackOption[] = [];

  for (const branch of effectiveBranches) {
    const meta = BRANCH_INSIGHT_META[branch];
    if (meta) {
      tracks.push({
        id: branch === EXAM_TRACKS.CSE ? "cs" : branch,
        label: meta.label,
        fullLabel: meta.fullLabel,
      });
    }
  }

  // Universally add Special Aptitude
  tracks.push({
    id: "aptitude",
    label: "APTITUDE",
    fullLabel: "Special Aptitude",
  });

  // Combined aggregates only the selected branches + aptitude
  tracks.push({
    id: "all",
    label: "COMBINED",
    fullLabel: "Combined",
  });

  return tracks;
}

const APTITUDE_SUBJECT_SLUGS = new Set([
  "english",
  "quant",
  "mathematics",
  "reasoning",
  "general-aptitude",
  "ga",
]);

/**
 * Returns the track identifier ('cs', 'da', 'ec', 'ee', 'me', 'ce', 'aptitude') for a given subject slug.
 */
export function getTrackForSubjectSlug(slug: string = ""): string {
  const clean = String(slug || "").trim().toLowerCase();
  if (!clean) return "cs";
  if (
    clean.startsWith("apt-") ||
    clean.startsWith("apt:") ||
    clean === "ga" ||
    clean === "general-aptitude" ||
    isAptitudeSubjectSlug(clean) ||
    clean.includes("aptitude") ||
    clean.includes("verbal") ||
    APTITUDE_SUBJECT_SLUGS.has(clean)
  ) {
    return "aptitude";
  }
  if (clean.startsWith("da:") || clean.startsWith("da-")) return "da";
  if (clean.startsWith("ec-") || clean.startsWith("ec:")) return "ec";
  if (clean.startsWith("ee-") || clean.startsWith("ee:")) return "ee";
  if (clean.startsWith("me-") || clean.startsWith("me:")) return "me";
  if (clean.startsWith("ce-") || clean.startsWith("ce:")) return "ce";
  if (clean.startsWith("isro:") || clean.startsWith("isro-") || clean.startsWith("go:")) return "cs";
  return "cs";
}

/**
 * Resolves the track identifier ('cs', 'da', 'ec', 'ee', 'me', 'ce', 'aptitude')
 * for any question, subject object, or string token.
 */
export function getTrackForSubjectOrQuestion(item: any): string {
  if (!item) return "cs";

  if (typeof item === "object") {
    if (isAptitudeQuestion(item)) return "aptitude";

    const rawTrack = item.track || item.exam?.track;
    if (rawTrack) {
      const norm = normalizeBranchId(rawTrack);
      if (norm === "cse") return "cs";
      if (norm === UNIVERSAL_APTITUDE_TRACK) return "aptitude";
      return norm;
    }

    const uid = String(item.question_uid || item.uid || item.storageKey || "").trim().toLowerCase();
    if (uid.startsWith("apt-") || uid.startsWith("apt:")) return "aptitude";
    if (uid.startsWith("da:") || uid.startsWith("da-")) return "da";
    if (uid.startsWith("ec:") || uid.startsWith("ec-")) return "ec";
    if (uid.startsWith("ee:") || uid.startsWith("ee-")) return "ee";
    if (uid.startsWith("me:") || uid.startsWith("me-")) return "me";
    if (uid.startsWith("ce:") || uid.startsWith("ce-")) return "ce";
    if (uid.startsWith("isro:") || uid.startsWith("isro-") || uid.startsWith("go:")) return "cs";

    const subjectSlug = String(item.subjectSlug || item.subject || item.key || "").toLowerCase();
    return getTrackForSubjectSlug(subjectSlug);
  }

  return getTrackForSubjectSlug(String(item).toLowerCase());
}

/**
 * Checks whether an item (question, subject, or subtopic) is eligible for a given track in Performance Insights.
 * If track === 'all' (Combined), it includes only items from the user's selected branches + universal aptitude.
 */
export function isItemEligibleForTrack(
  item: any,
  track: string = "all",
  selectedBranches: string[] = []
): boolean {
  const itemTrack = getTrackForSubjectOrQuestion(item);

  if (track === "all") {
    if (itemTrack === "aptitude") return true;
    const effectiveBranches = (Array.isArray(selectedBranches) && selectedBranches.length > 0)
      ? selectedBranches.map(normalizeBranchId)
      : [DEFAULT_BRANCH, "da"];
    const normItemTrack = itemTrack === "cs" ? "cse" : itemTrack;
    return effectiveBranches.includes(normItemTrack);
  }

  if (track === "cs" || track === "cse") {
    return itemTrack === "cs";
  }

  if (track === "aptitude") {
    return itemTrack === "aptitude";
  }

  return itemTrack === track;
}

/**
 * Filters a list of subjects to those belonging to a specific branch.
 */
export function getBranchSubjects<T extends { slug?: string; key?: string }>(
  subjects: T[] = [],
  branch: string
): T[] {
  const norm = normalizeBranchId(branch);
  const targetTrack = norm === "cse" ? "cs" : norm;
  return (subjects || []).filter((s) => {
    const slug = s?.slug || s?.key || "";
    return getTrackForSubjectSlug(slug) === targetTrack;
  });
}
