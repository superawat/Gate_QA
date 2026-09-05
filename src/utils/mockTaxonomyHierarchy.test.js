import { describe, it, expect } from "vitest";
import {
    getSubjectHierarchy,
    getSubjectAllSubtopicSlugs,
    findTaxonomySubject,
} from "./mockTaxonomyHierarchy";

describe("mockTaxonomyHierarchy", () => {
    it("finds taxonomy subjects for CSE and DA", () => {
        const os = findTaxonomySubject({ slug: "os", label: "Operating System" });
        expect(os).toBeTruthy();
        expect(os.label).toBe("Operating Systems");

        const ml = findTaxonomySubject({ slug: "da:machine-learning", label: "Machine Learning" });
        expect(ml).toBeTruthy();
        expect(ml.label).toBe("Machine Learning");
    });

    it("returns 3-level hierarchy for Operating System", () => {
        const hierarchy = getSubjectHierarchy({ slug: "os", label: "Operating System" });
        expect(hierarchy.length).toBeGreaterThanOrEqual(5);

        const cpuScheduling = hierarchy.find((tp) => tp.label.includes("CPU Scheduling"));
        expect(cpuScheduling).toBeDefined();
        expect(cpuScheduling.subtopics.length).toBeGreaterThan(0);

        const subtopicSlugs = cpuScheduling.subtopics.map((st) => st.slug);
        expect(subtopicSlugs).toContain("fcfs");
        expect(subtopicSlugs).toContain("round-robin");
    });

    it("returns 3-level hierarchy for Algorithms", () => {
        const hierarchy = getSubjectHierarchy({ slug: "algorithms", label: "Algorithms" });
        expect(hierarchy.length).toBeGreaterThanOrEqual(4);

        const techTopic = hierarchy.find((tp) => tp.label.includes("Algorithm Design Techniques"));
        expect(techTopic).toBeDefined();
        expect(techTopic.subtopics.length).toBeGreaterThan(0);

        const subtopicLabels = techTopic.subtopics.map((st) => st.label);
        expect(subtopicLabels).toContain("Dynamic Programming");
        expect(subtopicLabels).toContain("Greedy Algorithms");
    });

    it("returns 3-level hierarchy for Discrete Mathematics and Engineering Mathematics", () => {
        const dmHierarchy = getSubjectHierarchy({ slug: "discrete-math", label: "Discrete Mathematics" });
        expect(dmHierarchy.length).toBe(4);
        expect(dmHierarchy.map((tp) => tp.label)).toEqual([
            "Mathematical Logic",
            "Set Theory & Relations",
            "Combinatorics & Counting",
            "Graph Theory",
        ]);

        const emHierarchy = getSubjectHierarchy({ slug: "engg-math", label: "Engineering Mathematics" });
        expect(emHierarchy.length).toBe(3);
        expect(emHierarchy.map((tp) => tp.label)).toEqual([
            "Linear Algebra",
            "Calculus",
            "Probability & Statistics",
        ]);
    });

    it("returns 3-level hierarchy for DA subjects with non-empty topics and subtopics", () => {
        const mlHierarchy = getSubjectHierarchy({ slug: "da:machine-learning", label: "Machine Learning" });
        expect(mlHierarchy.length).toBeGreaterThanOrEqual(2);
        expect(mlHierarchy[0].subtopics.length).toBeGreaterThan(0);

        const dsaHierarchy = getSubjectHierarchy({
            slug: "da:programming-data-structures-and-algorithms",
            label: "Programming, Data Structures & Algorithms",
        });
        expect(dsaHierarchy.length).toBeGreaterThanOrEqual(3);
        expect(dsaHierarchy[0].subtopics.length).toBeGreaterThan(0);
    });

    it("returns 3-level hierarchy for General Aptitude", () => {
        const gaHierarchy = getSubjectHierarchy({ slug: "general-aptitude", label: "General Aptitude" });
        expect(gaHierarchy.length).toBe(3);
        expect(gaHierarchy[0].subtopics.length).toBeGreaterThan(0);
    });

    it("returns all subtopic slugs for a subject correctly", () => {
        const slugs = getSubjectAllSubtopicSlugs({ slug: "os", label: "Operating System" });
        expect(slugs.has("fcfs")).toBe(true);
        expect(slugs.has("paging")).toBe(true);
        expect(slugs.has("deadlock-prevention")).toBe(true);
    });
});
