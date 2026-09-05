import { CSE_SUBJECTS, DA_SUBJECTS } from "../data/trackerTaxonomy.ts";
import { normalizeMockSubjectKey } from "./mockTest.js";

export const slugifyToken = (value = "") => (
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
);

// Fallback canonical discrete mathematics topics when treated as a standalone subject
const DISCRETE_MATH_TOPICS = [
    {
        id: "cse-dm-logic",
        slug: "mathematical-logic",
        label: "Mathematical Logic",
        subtopics: [
            { slug: "propositional-logic", label: "Propositional Logic" },
            { slug: "first-order-logic", label: "First Order Logic" },
            { slug: "truth-tables", label: "Truth Tables & Tautology" },
            { slug: "logical-reasoning", label: "Logical Reasoning" },
            { slug: "predicates-and-quantifiers", label: "Predicates & Quantifiers" },
        ],
    },
    {
        id: "cse-dm-sets-relations",
        slug: "set-theory-and-algebra",
        label: "Set Theory & Relations",
        subtopics: [
            { slug: "sets", label: "Sets & Subsets" },
            { slug: "relations", label: "Relations & Equivalence" },
            { slug: "functions", label: "Functions (Injective, Surjective, Bijective)" },
            { slug: "partial-order", label: "Partial Orders & Posets" },
            { slug: "lattice", label: "Lattices & Boolean Algebra" },
            { slug: "group-theory", label: "Groups & Monoids" },
        ],
    },
    {
        id: "cse-dm-combinatorics",
        slug: "combinatorics-and-counting",
        label: "Combinatorics & Counting",
        subtopics: [
            { slug: "counting", label: "Counting & Combinatory" },
            { slug: "permutations-and-combinations", label: "Permutations & Combinations" },
            { slug: "pigeonhole-principle", label: "Pigeonhole Principle" },
            { slug: "recurrence-relation", label: "Recurrence Relations" },
            { slug: "generating-functions", label: "Generating Functions" },
        ],
    },
    {
        id: "cse-dm-graph-theory",
        slug: "graph-theory",
        label: "Graph Theory",
        subtopics: [
            { slug: "graph-connectivity", label: "Graph Connectivity & Components" },
            { slug: "graph-matching", label: "Graph Matching & Bipartite Graphs" },
            { slug: "graph-coloring", label: "Graph Coloring & Chromatic Number" },
            { slug: "graph-planarity", label: "Planar Graphs & Euler's Formula" },
            { slug: "graph-isomorphism", label: "Graph Isomorphism" },
            { slug: "degree-of-graph", label: "Degree of Graph & Handshaking" },
        ],
    },
];

// Fallback topics for legacy out-of-syllabus questions
const LEGACY_TOPICS = [
    {
        id: "legacy-topics-general",
        slug: "legacy-optional",
        label: "Legacy & Out-of-Syllabus Topics",
        subtopics: [
            { slug: "web-technologies", label: "Web Technologies & HTML" },
            { slug: "software-engineering", label: "Software Engineering & Testing" },
            { slug: "object-oriented-programming", label: "Object Oriented Programming" },
            { slug: "fortran-and-pascal", label: "Fortran & Pascal" },
        ],
    },
];

/**
 * Returns the SubjectNode from trackerTaxonomy matching a given subject slug or label.
 */
export const findTaxonomySubject = (subject) => {
    const rawSlug = String(subject?.slug || "").trim().toLowerCase();
    const cleanSlug = rawSlug.startsWith("da:") ? rawSlug.slice(3) : rawSlug;
    const label = String(subject?.label || "").trim().toLowerCase();
    const canonical = normalizeMockSubjectKey(cleanSlug);

    const isDa = rawSlug.startsWith("da:") || (subject?.track === "da");
    const pool = isDa ? DA_SUBJECTS : CSE_SUBJECTS;

    return pool.find((s) => {
        if (s.slug === cleanSlug || s.slug === canonical) return true;
        if (Array.isArray(s.canonicalSubjectSlugs)) {
            if (s.canonicalSubjectSlugs.includes(cleanSlug) || s.canonicalSubjectSlugs.includes(canonical)) return true;
        }
        if (s.label && s.label.toLowerCase() === label) return true;
        return false;
    }) || null;
};

/**
 * Builds the canonical 3-level hierarchy: Subject -> Topics -> Subtopics.
 *
 * @param {object} subject - { slug, label }
 * @param {object} rawStructuredSubtopics - FilterContext structuredSubtopics mapping
 * @returns {Array<{ id: string, slug: string, label: string, subtopics: Array<{ slug: string, label: string }> }>}
 */
export const getSubjectHierarchy = (subject, rawStructuredSubtopics = {}) => {
    const slug = String(subject?.slug || "").trim().toLowerCase();
    const label = String(subject?.label || "").trim();
    const cleanSlug = slug.startsWith("da:") ? slug.slice(3) : slug;

    // 1. Legacy / out-of-syllabus subjects
    if (slug === "legacy-other" || label.toLowerCase().includes("other") || label.toLowerCase().includes("optional")) {
        const extraSubtopics = rawStructuredSubtopics[slug] || [];
        const baseSubtopics = [...LEGACY_TOPICS[0].subtopics];
        extraSubtopics.forEach((st) => {
            const stSlug = slugifyToken(st?.slug || st?.label);
            if (stSlug && !baseSubtopics.some((b) => b.slug === stSlug)) {
                baseSubtopics.push({ slug: stSlug, label: st.label || stSlug });
            }
        });
        return [{ ...LEGACY_TOPICS[0], subtopics: baseSubtopics }];
    }

    // 2. Discrete Mathematics as standalone subject
    if (cleanSlug === "discrete-math" || cleanSlug === "discrete-mathematics" || label.toLowerCase() === "discrete mathematics") {
        const extraSubtopics = rawStructuredSubtopics[slug] || rawStructuredSubtopics["discrete-math"] || [];
        return mergeExtraSubtopicsIntoTopics(DISCRETE_MATH_TOPICS, extraSubtopics);
    }

    // 3. Look up SubjectNode in trackerTaxonomy
    const taxSubject = findTaxonomySubject(subject);

    if (taxSubject && Array.isArray(taxSubject.topics) && taxSubject.topics.length > 0) {
        let topics = taxSubject.topics;

        // If this is Engineering Mathematics and discrete-math is split out, filter out the discrete-math topic
        if ((cleanSlug === "engg-math" || cleanSlug === "engineering-mathematics") && topics.some((tp) => tp.primaryTopicTag === "discrete-math")) {
            topics = topics.filter((tp) => tp.primaryTopicTag !== "discrete-math");
        }

        const formattedTopics = topics.map((topic) => ({
            id: topic.id || slugifyToken(topic.label),
            slug: slugifyToken(topic.primaryTopicTag || topic.label),
            label: topic.label,
            subtopics: (topic.subtopics || []).map((st) => ({
                slug: slugifyToken(st.subtopicSlug || st.label),
                label: st.label,
            })),
        }));

        // Merge any subtopics from rawStructuredSubtopics that might not be in the taxonomy
        const extraSubtopics = rawStructuredSubtopics[slug]
            || rawStructuredSubtopics[cleanSlug]
            || rawStructuredSubtopics[normalizeMockSubjectKey(slug)]
            || [];

        return mergeExtraSubtopicsIntoTopics(formattedTopics, extraSubtopics);
    }

    // 4. Fallback: if rawStructuredSubtopics has subtopics for this subject, present them in a clean default topic
    const fallbackSubtopics = (rawStructuredSubtopics[slug] || rawStructuredSubtopics[cleanSlug] || [])
        .map((st) => ({
            slug: slugifyToken(st?.slug || st?.label),
            label: st?.label || st?.slug,
        }))
        .filter((st) => Boolean(st.slug && st.label));

    if (fallbackSubtopics.length > 0) {
        return [
            {
                id: `${slug}-topics`,
                slug: `${slug}-topics`,
                label: label || "Core Topics",
                subtopics: fallbackSubtopics,
            },
        ];
    }

    return [];
};

/**
 * Merges extra subtopics from rawStructuredSubtopics (from the live question bank)
 * into the structured topics so no questions are missed.
 */
function mergeExtraSubtopicsIntoTopics(topics = [], extraSubtopics = []) {
    const nextTopics = topics.map((tp) => ({
        ...tp,
        subtopics: [...tp.subtopics],
    }));

    if (!Array.isArray(extraSubtopics) || extraSubtopics.length === 0) {
        return nextTopics;
    }

    const knownSlugs = new Set();
    nextTopics.forEach((tp) => {
        tp.subtopics.forEach((st) => knownSlugs.add(st.slug));
    });

    extraSubtopics.forEach((extra) => {
        const extraSlug = slugifyToken(extra?.slug || extra?.label);
        const extraLabel = String(extra?.label || "").trim();
        if (!extraSlug || !extraLabel || knownSlugs.has(extraSlug)) return;

        // Try to match the extra subtopic into the best matching topic
        let bestTopic = nextTopics.find((tp) => {
            const tpSlug = tp.slug.toLowerCase();
            const tpLabel = tp.label.toLowerCase();
            const exSlug = extraSlug.toLowerCase();
            const exLabel = extraLabel.toLowerCase();
            return (
                exSlug.includes(tpSlug)
                || tpSlug.includes(exSlug)
                || exLabel.includes(tpLabel)
                || tpLabel.includes(exLabel)
            );
        });

        if (!bestTopic && nextTopics.length > 0) {
            bestTopic = nextTopics[0];
        }

        if (bestTopic) {
            bestTopic.subtopics.push({ slug: extraSlug, label: extraLabel });
            knownSlugs.add(extraSlug);
        }
    });

    return nextTopics;
}

/**
 * Returns a Set of all subtopic slugs belonging to a subject.
 */
export const getSubjectAllSubtopicSlugs = (subject, rawStructuredSubtopics = {}) => {
    const hierarchy = getSubjectHierarchy(subject, rawStructuredSubtopics);
    const slugs = new Set();
    hierarchy.forEach((topic) => {
        topic.subtopics.forEach((st) => {
            if (st.slug) slugs.add(st.slug);
        });
    });
    return slugs;
};
