import { describe, it, expect } from "vitest";
import {
  SUPPORTED_TRACKS,
  TRACK_TAXONOMIES,
  getSubjectBySlug,
  getTopicsForTrack,
  SubjectNode,
} from "./trackerTaxonomy";
import { buildQuestionIndexForTrack } from "../utils/trackerState";

describe("trackerTaxonomy - Branch General Aptitude Integration", () => {
  it("includes all 6 supported branches in SUPPORTED_TRACKS", () => {
    expect(SUPPORTED_TRACKS).toEqual(["cse", "da", "ec", "ee", "me", "ce"]);
  });

  SUPPORTED_TRACKS.forEach((track) => {
    describe(`Branch '${track.toUpperCase()}' General Aptitude Taxonomy`, () => {
      const taxonomy = TRACK_TAXONOMIES[track];

      it(`has a defined taxonomy object for ${track}`, () => {
        expect(taxonomy).toBeDefined();
        expect(taxonomy.track).toBe(track);
        expect(Array.isArray(taxonomy.subjects)).toBe(true);
      });

      it(`contains a General Aptitude subject in ${track}`, () => {
        const gaSubject = taxonomy.subjects.find(
          (s: SubjectNode) => s.slug === "general-aptitude" || s.id === `${track}-ga`
        );
        expect(gaSubject).toBeDefined();
        expect(gaSubject?.shortLabel).toBe("GA");
        expect(gaSubject?.marksRange).toBe("15 Marks");
        expect(gaSubject?.weightageTier).toBe("tier-1-high");
        expect(gaSubject?.canonicalSubjectSlugs).toContain("ga");
        expect(gaSubject?.canonicalSubjectSlugs).toContain("general-aptitude");
      });

      it(`has topics for quantitative, analytical, and verbal aptitude in ${track}`, () => {
        const gaSubject = taxonomy.subjects.find(
          (s: SubjectNode) => s.slug === "general-aptitude" || s.id === `${track}-ga`
        );
        expect(gaSubject).toBeDefined();
        const topics = gaSubject!.topics;
        expect(topics.length).toBeGreaterThanOrEqual(3);

        const quantTopic = topics.find((t) => t.primaryTopicTag === "quantitative-aptitude");
        const analyticalTopic = topics.find((t) => t.primaryTopicTag === "analytical-aptitude");
        const verbalTopic = topics.find((t) => t.primaryTopicTag === "verbal-aptitude");

        expect(quantTopic).toBeDefined();
        expect(analyticalTopic).toBeDefined();
        expect(verbalTopic).toBeDefined();
      });

      it(`retrieves General Aptitude subject via getSubjectBySlug for ${track}`, () => {
        const subject = getSubjectBySlug(track, "general-aptitude");
        expect(subject).toBeDefined();
        expect(subject?.id).toBe(`${track}-ga`);

        const subjectByGa = getSubjectBySlug(track, "ga");
        expect(subjectByGa).toBeDefined();
        expect(subjectByGa?.id).toBe(`${track}-ga`);
      });
    });
  });

  describe("buildQuestionIndexForTrack indexing of General Aptitude questions", () => {
    const branches = ["ec", "ee", "me", "ce"] as const;

    branches.forEach((br) => {
      it(`indexes ${br.toUpperCase()} GA questions into subject and topic`, () => {
        const taxonomy = TRACK_TAXONOMIES[br];
        const mockQuestions = [
          {
            question_uid: `${br}:2024:ga:q1`,
            exam_uid: `${br}:2024:set1:ga:q1`,
            track: br,
            subject: "General Aptitude",
            subjectSlug: "ga",
            subtopics: [{ slug: "quantitative-aptitude", label: "Quantitative Aptitude" }],
            tags: [`gate${br}-2024`, "ga", "quantitative-aptitude"],
          },
          {
            question_uid: `${br}:2024:ga:q2`,
            exam_uid: `${br}:2024:set1:ga:q2`,
            track: br,
            subject: "General Aptitude",
            subjectSlug: "ga",
            subtopics: [{ slug: "verbal-aptitude", label: "Verbal Aptitude" }],
            tags: [`gate${br}-2024`, "ga", "verbal-aptitude"],
          },
        ];

        const index = buildQuestionIndexForTrack(mockQuestions as any, taxonomy, br);

        expect(index.trackQuestions.length).toBe(2);

        // Verify Subject matching
        const gaSubjectQuestions = index.subjectQuestions.get(`${br}-ga`);
        expect(gaSubjectQuestions).toBeDefined();
        expect(gaSubjectQuestions?.length).toBe(2);

        // Verify Topic matching
        const quantTopicQuestions = index.topicQuestions.get(`${br}-ga-quantitative-aptitude`);
        expect(quantTopicQuestions).toBeDefined();
        expect(quantTopicQuestions?.length).toBe(1);
        expect(quantTopicQuestions?.[0]?.question_uid).toBe(`${br}:2024:ga:q1`);

        const verbalTopicQuestions = index.topicQuestions.get(`${br}-ga-verbal-aptitude`);
        expect(verbalTopicQuestions).toBeDefined();
        expect(verbalTopicQuestions?.length).toBe(1);
        expect(verbalTopicQuestions?.[0]?.question_uid).toBe(`${br}:2024:ga:q2`);
      });
    });

    it("indexes CSE GA questions into subject and topic", () => {
      const taxonomy = TRACK_TAXONOMIES.cse;
      const mockQuestions = [
        {
          question_uid: "gate:cs:2023:set1:ga:q1",
          exam_uid: "gate:cs:2023:set1:ga:q1",
          track: "cse",
          subject: "General Aptitude",
          subjectSlug: "general-aptitude",
          subtopics: [{ slug: "quantitative-aptitude", label: "Quantitative Aptitude" }],
          tags: ["gatecs-2023", "ga", "quantitative-aptitude"],
        },
      ];

      const index = buildQuestionIndexForTrack(mockQuestions as any, taxonomy, "cse");
      expect(index.trackQuestions.length).toBe(1);
      const gaSubjectQuestions = index.subjectQuestions.get("cse-ga");
      expect(gaSubjectQuestions?.length).toBe(1);
      const quantQuestions = index.topicQuestions.get("cse-ga-quantitative-aptitude");
      expect(quantQuestions?.length).toBe(1);
    });

    it("indexes DA GA questions into subject and topic", () => {
      const taxonomy = TRACK_TAXONOMIES.da;
      const mockQuestions = [
        {
          question_uid: "da:2024:q1",
          exam_uid: "da:2024:q1",
          track: "da",
          subject: "General Aptitude",
          subjectSlug: "general-aptitude",
          subtopics: [{ slug: "quantitative-aptitude", label: "Quantitative Aptitude" }],
          tags: ["gateda-2024", "da:general-aptitude", "quantitative-aptitude"],
        },
      ];

      const index = buildQuestionIndexForTrack(mockQuestions as any, taxonomy, "da");
      expect(index.trackQuestions.length).toBe(1);
      const gaSubjectQuestions = index.subjectQuestions.get("da-ga");
      expect(gaSubjectQuestions?.length).toBe(1);
      const quantQuestions = index.topicQuestions.get("da-ga-quantitative-aptitude");
      expect(quantQuestions?.length).toBe(1);
    });
  });
});
