import { describe, it, expect } from "vitest";
import {
  normalizeBranchId,
  isBranchEligible,
  isQuestionEligibleForBranches,
  filterPapersBySelectedBranches,
  getInsightTracksForSelectedBranches,
  getTrackForSubjectSlug,
  getTrackForSubjectOrQuestion,
  isItemEligibleForTrack,
  getBranchSubjects,
} from "./branchEligibility";

describe("branchEligibility", () => {
  describe("normalizeBranchId", () => {
    it("normalizes CS variants to cse", () => {
      expect(normalizeBranchId("cs")).toBe("cse");
      expect(normalizeBranchId("CSE")).toBe("cse");
      expect(normalizeBranchId("it")).toBe("cse");
      expect(normalizeBranchId("isro")).toBe("cse");
    });

    it("normalizes aptitude variants", () => {
      expect(normalizeBranchId("ga")).toBe("aptitude");
      expect(normalizeBranchId("general-aptitude")).toBe("aptitude");
      expect(normalizeBranchId("Aptitude")).toBe("aptitude");
    });

    it("preserves other branches", () => {
      expect(normalizeBranchId("ec")).toBe("ec");
      expect(normalizeBranchId("ee")).toBe("ee");
      expect(normalizeBranchId("me")).toBe("me");
      expect(normalizeBranchId("ce")).toBe("ce");
      expect(normalizeBranchId("da")).toBe("da");
    });
  });

  describe("isBranchEligible", () => {
    it("aptitude is always eligible regardless of selected branches", () => {
      expect(isBranchEligible("aptitude", ["cse"])).toBe(true);
      expect(isBranchEligible("ga", ["ec", "ee"])).toBe(true);
      expect(isBranchEligible("general-aptitude", [])).toBe(true);
    });

    it("checks branch eligibility against selected branches", () => {
      const selected = ["cse", "ec"];
      expect(isBranchEligible("cse", selected)).toBe(true);
      expect(isBranchEligible("cs", selected)).toBe(true);
      expect(isBranchEligible("ec", selected)).toBe(true);
      expect(isBranchEligible("da", selected)).toBe(false);
      expect(isBranchEligible("ee", selected)).toBe(false);
      expect(isBranchEligible("me", selected)).toBe(false);
      expect(isBranchEligible("ce", selected)).toBe(false);
    });

    it("falls back to cse if no branches selected", () => {
      expect(isBranchEligible("cse", [])).toBe(true);
      expect(isBranchEligible("ec", [])).toBe(false);
    });
  });

  describe("filterPapersBySelectedBranches", () => {
    const papers = [
      { track: "cse", year: 2024, set: 1, label: "GATE CSE 2024" },
      { track: "da", year: 2024, set: 1, label: "GATE DA 2024" },
      { track: "ec", year: 2024, set: 1, label: "GATE EC 2024" },
      { track: "ee", year: 2024, set: 1, label: "GATE EE 2024" },
    ];

    it("filters to CSE + EC papers when CSE + EC selected", () => {
      const filtered = filterPapersBySelectedBranches(papers, ["cse", "ec"]);
      expect(filtered.map((p) => p.track)).toEqual(["cse", "ec"]);
    });

    it("filters to EC papers only when EC selected", () => {
      const filtered = filterPapersBySelectedBranches(papers, ["ec"]);
      expect(filtered.map((p) => p.track)).toEqual(["ec"]);
    });

    it("filters to CSE papers only when CSE selected", () => {
      const filtered = filterPapersBySelectedBranches(papers, ["cse"]);
      expect(filtered.map((p) => p.track)).toEqual(["cse"]);
    });
  });

  describe("getInsightTracksForSelectedBranches", () => {
    it("returns CSE, EC, Aptitude, Combined for CSE + EC", () => {
      const tracks = getInsightTracksForSelectedBranches(["cse", "ec"]);
      expect(tracks.map((t) => t.id)).toEqual(["cs", "ec", "aptitude", "all"]);
      expect(tracks[0].fullLabel).toBe("GATE CSE");
      expect(tracks[1].fullLabel).toBe("GATE EC");
      expect(tracks[2].fullLabel).toBe("Special Aptitude");
      expect(tracks[3].fullLabel).toBe("Combined");
    });

    it("returns EC, Aptitude, Combined for EC only", () => {
      const tracks = getInsightTracksForSelectedBranches(["ec"]);
      expect(tracks.map((t) => t.id)).toEqual(["ec", "aptitude", "all"]);
      expect(tracks[0].fullLabel).toBe("GATE EC");
    });

    it("returns CSE, DA, Aptitude, Combined for CSE + DA", () => {
      const tracks = getInsightTracksForSelectedBranches(["cse", "da"]);
      expect(tracks.map((t) => t.id)).toEqual(["cs", "da", "aptitude", "all"]);
    });
  });

  describe("getTrackForSubjectSlug and getTrackForSubjectOrQuestion", () => {
    it("classifies aptitude subjects correctly", () => {
      expect(getTrackForSubjectSlug("ga")).toBe("aptitude");
      expect(getTrackForSubjectSlug("general-aptitude")).toBe("aptitude");
      expect(getTrackForSubjectSlug("english")).toBe("aptitude");
      expect(getTrackForSubjectSlug("quant")).toBe("aptitude");
      expect(getTrackForSubjectSlug("reasoning")).toBe("aptitude");
    });

    it("classifies engineering subjects by prefix correctly", () => {
      expect(getTrackForSubjectSlug("algorithms")).toBe("cs");
      expect(getTrackForSubjectSlug("engg-math")).toBe("cs");
      expect(getTrackForSubjectSlug("da:machine-learning")).toBe("da");
      expect(getTrackForSubjectSlug("ec-analog-circuits")).toBe("ec");
      expect(getTrackForSubjectSlug("ec-math")).toBe("ec");
      expect(getTrackForSubjectSlug("ee-power-systems")).toBe("ee");
      expect(getTrackForSubjectSlug("me-thermodynamics")).toBe("me");
      expect(getTrackForSubjectSlug("ce-structural-engineering")).toBe("ce");
    });

    it("classifies question objects correctly", () => {
      expect(getTrackForSubjectOrQuestion({ question_uid: "APT-2024-01" })).toBe("aptitude");
      expect(getTrackForSubjectOrQuestion({ question_uid: "da:2024:q1" })).toBe("da");
      expect(getTrackForSubjectOrQuestion({ question_uid: "ec:2024:set-1:q1" })).toBe("ec");
      expect(getTrackForSubjectOrQuestion({ question_uid: "gate-cse-2024-q1" })).toBe("cs");
      expect(getTrackForSubjectOrQuestion({ track: "ec", subjectSlug: "ec-analog-circuits" })).toBe("ec");
    });
  });

  describe("isItemEligibleForTrack", () => {
    const ecQuestion = { question_uid: "ec:2024:set-1:q1" };
    const csQuestion = { question_uid: "gate-cse-2024-q1" };
    const daQuestion = { question_uid: "da:2024:q1" };
    const aptQuestion = { question_uid: "APT-2024-01" };

    it("filters for individual branch tracks", () => {
      expect(isItemEligibleForTrack(ecQuestion, "ec", ["cse", "ec"])).toBe(true);
      expect(isItemEligibleForTrack(csQuestion, "ec", ["cse", "ec"])).toBe(false);
      expect(isItemEligibleForTrack(csQuestion, "cs", ["cse", "ec"])).toBe(true);
      expect(isItemEligibleForTrack(ecQuestion, "cs", ["cse", "ec"])).toBe(false);
      expect(isItemEligibleForTrack(aptQuestion, "aptitude", ["cse", "ec"])).toBe(true);
    });

    it("Combined track includes only selected branches + aptitude", () => {
      const selected = ["cse", "ec"];
      expect(isItemEligibleForTrack(csQuestion, "all", selected)).toBe(true);
      expect(isItemEligibleForTrack(ecQuestion, "all", selected)).toBe(true);
      expect(isItemEligibleForTrack(aptQuestion, "all", selected)).toBe(true);
      expect(isItemEligibleForTrack(daQuestion, "all", selected)).toBe(false);
    });
  });

  describe("getBranchSubjects", () => {
    const subjects = [
      { slug: "algorithms", label: "Algorithms" },
      { slug: "engg-math", label: "Engineering Mathematics" },
      { slug: "da:machine-learning", label: "Machine Learning" },
      { slug: "ec-analog-circuits", label: "Analog Circuits" },
      { slug: "ec-math", label: "Engineering Mathematics (EC)" },
      { slug: "ga", label: "General Aptitude" },
    ];

    it("filters subjects belonging to CSE", () => {
      const cseSubs = getBranchSubjects(subjects, "cse");
      expect(cseSubs.map((s) => s.slug)).toEqual(["algorithms", "engg-math"]);
    });

    it("filters subjects belonging to EC", () => {
      const ecSubs = getBranchSubjects(subjects, "ec");
      expect(ecSubs.map((s) => s.slug)).toEqual(["ec-analog-circuits", "ec-math"]);
    });

    it("filters subjects belonging to DA", () => {
      const daSubs = getBranchSubjects(subjects, "da");
      expect(daSubs.map((s) => s.slug)).toEqual(["da:machine-learning"]);
    });
  });
});
