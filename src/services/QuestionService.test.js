import { QuestionService } from "./QuestionService";

describe("QuestionService", () => {
  beforeEach(() => {
    QuestionService.questions = [];
    QuestionService.loaded = false;
    QuestionService.loadMode = "none";
    QuestionService.count = new Map();
    QuestionService.tags = [];
    QuestionService.sourceUrl = "";
    QuestionService.questionsByUid = new Map();
    QuestionService.detailCache = new Map();
    QuestionService.detailShardCache = new Map();
    QuestionService.detailShardPromises = new Map();
    QuestionService.pendingLoads = { index: null, full: null };
    QuestionService.SUBJECT_ALIAS_CACHE = new Map();
    QuestionService._subtopicLookupCache = new Map();
    vi.restoreAllMocks();
  });

  test("builds tag indexes correctly", () => {
    QuestionService.questions = [
      { tags: ["gatecse-2024-set1", "graphs"] },
      { tags: ["gatecse-2024-set1", "dp"] },
      { tags: ["gatecse-2025-set1", "graphs"] },
    ];

    QuestionService.buildIndexes();

    expect(QuestionService.getCount("gatecse-2024-set1")).toBe(2);
    expect(QuestionService.getCount("graphs")).toBe(2);
    expect(QuestionService.getCount("missing")).toBe(0);
    expect(QuestionService.getTags()).toEqual([
      "dp",
      "gatecse-2024-set1",
      "gatecse-2025-set1",
      "graphs",
    ]);
  });

  test("filters by paper and topic tags", () => {
    QuestionService.questions = [
      { title: "Q1", tags: ["gatecse-2024-set1", "graphs"] },
      { title: "Q2", tags: ["gatecse-2024-set1", "dp"] },
      { title: "Q3", tags: ["gatecse-2025-set1", "graphs"] },
    ];
    QuestionService.buildIndexes();

    vi.spyOn(global.Math, "random").mockReturnValue(0);
    const result = QuestionService.getRandomQuestion([
      "gatecse-2024-set1",
      "graphs",
    ]);

    expect(result.title).toBe("Q1");
    vi.restoreAllMocks();
  });

  test("returns an error object when filter has no matches", () => {
    QuestionService.questions = [
      { title: "Q1", tags: ["gatecse-2024-set1", "graphs"] },
    ];
    QuestionService.buildIndexes();

    const result = QuestionService.getRandomQuestion(["gatecse-2025-set2"]);

    expect(result.title).toContain("No matching question");
    expect(result.tags).toEqual([]);
  });

  test("does not overwrite existing question_uid", () => {
    const uid = QuestionService.buildQuestionUid({
      question_uid: "go:497",
      link: "https://gateoverflow.in/371497/another-link",
    });
    expect(uid).toBe("go:497");
  });

  test("prefers first explicit subject tag when multiple explicit subjects exist", () => {
    const subject = QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2025 | Set 2 | Question: 20",
      tags: [
        "gatecse-2025-set2",
        "theory-of-computation",
        "closure-property",
        "computer-networks",
        "routing-protocols",
        "digital-logic",
        "circuit-output",
      ],
    });

    expect(subject).toBe("Theory of Computation");
  });

  test("classifies GA-n titles as General Aptitude", () => {
    const subject = QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2017 Set 2 | Question: GA-8",
      tags: ["gatecse-2017-set2", "number-representation"],
    });

    expect(subject).toBe("General Aptitude");
  });

  test("classifies spatial aptitude GA tags as General Aptitude", () => {
    const subject = QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2026 | Set 1 | GA | Question: 2",
      tags: [
        "gatecse-2026-set1",
        "spatial-aptitude",
        "patterns-in-2d",
        "3d-structure",
        "paper-folding",
      ],
    });

    expect(subject).toBe("General Aptitude");
  });

  test("recognizes co-and-architecture as explicit CO & Architecture tag", () => {
    const subject = QuestionService.resolveCanonicalSubject({
      title: "Sample",
      tags: ["gatecse-2023", "co-and-architecture", "memory-interfacing"],
    });

    expect(subject).toBe("CO & Architecture");
  });

  test("infers Engineering Mathematics from canonical math subtopic tags", () => {
    const subject = QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2026 | Set 1 | Question: 22",
      tags: ["gatecse-2026-set1", "calculus", "continuity", "numerical-answers"],
    });

    expect(subject).toBe("Engineering Mathematics");
  });

  test("infers Discrete Mathematics from graph and logic aliases", () => {
    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2026 | Set 2 | Question: 1",
      tags: ["gatecse-2026-set2", "mathematical-logic", "first-order-logic"],
    })).toBe("Discrete Mathematics");

    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2026 | Set 1 | Question: 37",
      tags: ["gatecse-2026-set1", "graph-theory", "degree-of-graph"],
    })).toBe("Discrete Mathematics");
  });

  test("maps legacy filter labels onto the stable legacy-other slug", () => {
    expect(QuestionService.normalizeSubjectSlug("Legacy / Other")).toBe("legacy-other");
    expect(QuestionService.normalizeSubjectSlug("Other / Optional")).toBe("legacy-other");
    expect(QuestionService.getSubjectLabelBySlug("legacy-other")).toBe("Other / Optional");
  });

  test("classifies legacy software and language questions into Other / Optional", () => {
    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 2015 Set 1 | Question: 42",
      tags: ["gatecse-2015-set1", "is&software-engineering", "software-testing"],
    })).toBe("Other / Optional");

    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 1995 | Question: 1.13",
      tags: ["gate1995", "pascal", "out-of-syllabus-now"],
    })).toBe("Other / Optional");
  });

  test("reclassifies curated out-of-syllabus 1990s questions into Other / Optional", () => {
    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 1995 | Question: 2.15",
      tags: ["gate1995", "numerical-methods", "newton-raphson", "out-of-syllabus-now"],
    })).toBe("Other / Optional");

    expect(QuestionService.resolveCanonicalSubject({
      title: "GATE CSE 1996 | Question: 1.22",
      tags: ["gate1996", "co-and-architecture", "8085-microprocessor", "out-of-syllabus-now"],
    })).toBe("Other / Optional");
  });

  test("extractCanonicalSubtopics enforces MAX_SUBTOPICS_PER_QUESTION limit", () => {
    // We mock the lookup map just for this test
    const mockLookupObj = {
      'sqlqueries': { slug: 'sql-queries', label: 'SQL' },
      'schemanormalization': { slug: 'schema-normalization', label: 'Normalization' },
    };
    const mockMap = new Map(Object.entries(mockLookupObj));
    vi.spyOn(QuestionService, 'getSubtopicLookupForSubject').mockReturnValue(mockMap);

    // Test that the first matched tag (schema-normalization) is taken, and remainder are skipped
    const tags = ['dbms_bad_tag', 'schema-normalization', 'sql-queries'];
    const subtopics = QuestionService.extractCanonicalSubtopics(tags, 'Databases');

    expect(subtopics).toHaveLength(1);
    expect(subtopics[0].slug).toBe('schema-normalization');

    vi.restoreAllMocks();
  });

  test("normalizes explicit options object into stable A-D entries", () => {
    const options = QuestionService.normalizeQuestionOptions({
      A: "Option alpha",
      B: "Option beta",
      C: "Option gamma",
      D: "Option delta",
    });

    expect(options.map((entry) => entry.label)).toEqual(["A", "B", "C", "D"]);
    expect(options[0].text).toBe("Option alpha");
    expect(options[3].text).toBe("Option delta");
  });

  test("extracts option entries from question html when options map is missing", () => {
    const html = `
      <p>Pick one.</p>
      <ol style="list-style-type:upper-alpha">
        <li>Alpha</li>
        <li>Beta</li>
        <li>Gamma</li>
        <li>Delta</li>
      </ol>
    `;

    const options = QuestionService.normalizeQuestionOptions(undefined, html);

    expect(options.map((entry) => entry.label)).toEqual(["A", "B", "C", "D"]);
    expect(options.map((entry) => entry.text)).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
  });

  test("uses canonical exam_uid to preserve split-set papers when title metadata is weak", () => {
    const normalized = QuestionService.normalizeQuestion({
      title: "GATE CSE 2025 | Question: 1",
      year: "gatecse-2025",
      link: "https://gateoverflow.in/500001/gate-cse-2025-question-1",
      exam_uid: "cse:2025:set2:main:q1",
      tags: ["gatecse-2025", "algorithms"],
    });

    expect(normalized.exam.yearSetKey).toBe("2025-s2");
    expect(normalized.canonicalExamUid).toBe("cse:2025:set2:main:q1");
  });

  test("builds GA canonical exam_uid from inline GA titles", () => {
    const [finalized] = QuestionService.finalizeQuestions([
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2026 | Set 1 | GA | Question: 2",
        year: "gatecse-2026-set1",
        link: "https://gateoverflow.in/523088/gate-cse-2026-set-1-ga-question-2",
        tags: ["gatecse-2026-set1", "spatial-aptitude"],
        question: "<p>Which figure completes the pattern?</p>",
      }),
    ]);

    expect(finalized.exam_uid).toBe("cse:2026:set1:ga:q2");
    expect(finalized.exam.yearSetKey).toBe("2026-s0");
  });

  test("hydrates index questions with canonical subject, exam meta, and shard key", () => {
    const indexed = QuestionService.hydrateIndexedQuestion({
      question_uid: "go:523076",
      title: "GATE CSE 2026 | Set 1 | Question: 4",
      year: 2026,
      set: 1,
      yearSetKey: "2026-s1",
      yearSetLabel: "2026 Set 1",
      detailShardKey: "2026-s1",
      link: "https://gateoverflow.in/523076/gate-cse-2026-set-1-question-4",
      tags: ["gatecse-2026-set1", "co-and-architecture", "addressing-modes"],
      type: "MSQ",
    });

    expect(indexed.question).toBe("");
    expect(indexed.detailShardKey).toBe("2026-s1");
    expect(indexed.subject).toBe("CO & Architecture");
    expect(indexed.subjectLabel).toBe("CO & Architecture");
    expect(indexed.subjectSlug).toBe("coa");
    expect(indexed.exam.yearSetKey).toBe("2026-s1");
    expect(indexed.type).toBe("msq");
  });

  test("hydrates stale index rows with refreshed subject labels", () => {
    const indexed = QuestionService.hydrateIndexedQuestion({
      question_uid: "go:523058",
      title: "GATE CSE 2026 | Set 1 | Question: 22",
      subjectSlug: "unknown",
      subjectLabel: "Unknown",
      year: 2026,
      set: 1,
      yearSetKey: "2026-s1",
      yearSetLabel: "2026 Set 1",
      detailShardKey: "2026-s1",
      tags: ["gatecse-2026-set1", "calculus", "continuity", "numerical-answers"],
    });

    expect(indexed.subject).toBe("Engineering Mathematics");
    expect(indexed.subjectLabel).toBe("Engineering Mathematics");
    expect(indexed.subjectSlug).toBe("engg-math");
  });

  test("loads and hydrates question detail from a shard when only index data is present", async () => {
    QuestionService.questions = [
      QuestionService.hydrateIndexedQuestion({
        question_uid: "go:500001",
        title: "GATE CSE 2023 | Question: 1",
        year: 2023,
        set: null,
        yearSetKey: "2023-s0",
        yearSetLabel: "2023",
        detailShardKey: "2023-s0",
        link: "https://gateoverflow.in/500001/gate-cse-2023-question-1",
        tags: ["gatecse-2023", "algorithms", "sorting"],
      }),
    ];
    QuestionService.loaded = true;
    QuestionService.loadMode = "index";
    QuestionService.buildIndexes();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        recordsByQuestionUid: {
          "go:500001": {
            question_uid: "go:500001",
            title: "GATE CSE 2023 | Question: 1",
            year: "gatecse-2023",
            link: "https://gateoverflow.in/500001/gate-cse-2023-question-1",
            tags: ["gatecse-2023", "algorithms", "sorting"],
            question: "<p>What is the running time?</p>",
            options: {
              A: "O(1)",
              B: "O(log n)",
              C: "O(n log n)",
              D: "O(n^2)",
            },
            exam_uid: "cse:2023:set1:main:q1",
          },
        },
      }),
    });

    const detailed = await QuestionService.ensureQuestionDetail("go:500001");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain("question-detail-shards/2023-s0.json");
    expect(detailed.question).toContain("running time");
    expect(detailed.subjectSlug).toBe("algorithms");
    expect(detailed.exam.yearSetKey).toBe("2023-s0");
    expect(QuestionService.detailCache.get("go:500001")).toEqual(detailed);
  });

  test("finalizeQuestions collapses single-set years but keeps explicit split sets", () => {
    const finalized = QuestionService.finalizeQuestions([
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2023 | Question: 1",
        year: "gatecse-2023",
        link: "https://gateoverflow.in/400001/gate-cse-2023-question-1",
        exam_uid: "cse:2023:set1:main:q1",
        tags: ["gatecse-2023", "algorithms"],
        question: "<p>What is the running time of merge sort?</p>",
      }),
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2025 | Question: 1",
        year: "gatecse-2025",
        link: "https://gateoverflow.in/500001/gate-cse-2025-question-1",
        exam_uid: "cse:2025:set1:main:q1",
        tags: ["gatecse-2025", "algorithms"],
        question: "<p>Determine the recurrence relation.</p>",
      }),
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2025 | Question: 1",
        year: "gatecse-2025",
        link: "https://gateoverflow.in/500101/gate-cse-2025-question-1",
        exam_uid: "cse:2025:set2:main:q1",
        tags: ["gatecse-2025", "algorithms"],
        question: "<p>What is the time complexity of DFS?</p>",
      }),
    ]);

    const byExamUid = new Map(finalized.map((question) => [question.exam_uid, question]));

    expect(byExamUid.get("cse:2023:set1:main:q1").exam.yearSetKey).toBe("2023-s0");
    expect(byExamUid.get("cse:2023:set1:main:q1").exam.label).toBe("2023");
    expect(byExamUid.get("cse:2025:set1:main:q1").exam.yearSetKey).toBe("2025-s1");
    expect(byExamUid.get("cse:2025:set2:main:q1").exam.yearSetKey).toBe("2025-s2");
  });

  test("dedupes duplicate historical variants by canonical paper slot", () => {
    const finalized = QuestionService.finalizeQuestions([
      QuestionService.normalizeQuestion({
        question_uid: "go:388950",
        title: "GATE CSE 2017 Set 2 | Question: 33",
        year: "gatecse-2017-set2",
        link: "https://gateoverflow.in/388950/gate-cse-2017-set-2-question-33",
        exam_uid: "cse:2017:set2:main:q33",
        tags: ["gatecse-2017-set2", "algorithms"],
        question: "<p>Determine the worst-case time complexity.</p>",
      }),
      QuestionService.normalizeQuestion({
        question_uid: "go:388951",
        title: "GATE CSE 2017 Set 2 | Question: 33 (MSQ Version)",
        year: "gatecse-2017-set2",
        link: "https://gateoverflow.in/388951/gate-cse-2017-set-2-question-33-msq-version",
        exam_uid: "cse:2017:set2:main:q33-msq-version",
        tags: ["gatecse-2017-set2", "algorithms"],
        question: "<p>Select all correct time complexities.</p>",
      }),
    ]);

    expect(finalized).toHaveLength(1);
    expect(finalized[0].question_uid).toBe("go:388950");
    expect(finalized[0].exam_uid).toBe("cse:2017:set2:main:q33");
  });

  test("excludes subjective and descriptive-no-answer rows from the practice bank", () => {
    const finalized = QuestionService.finalizeQuestions([
      QuestionService.normalizeQuestion({
        question_uid: "go:205817",
        title: "GATE CSE 1999 | Question: 20-b",
        year: "gate1999",
        link: "https://gateoverflow.in/205817/gate-cse-1999-question-20-b",
        exam_uid: "cse:1999:set1:main:q20-b",
        tags: ["gate1999", "operating-system", "descriptive"],
        answer_meta: {
          type: "SUBJECTIVE",
          answer: null,
          tolerance: null,
          source: "question_uid",
        },
        question: "<p>Explain the scheduling algorithm.</p>",
      }),
      QuestionService.normalizeQuestion({
        question_uid: "go:92961",
        title: "GATE CSE 1989 | Question: 12b",
        year: "gate1989",
        link: "https://gateoverflow.in/92961/gate-cse-1989-question-12b",
        exam_uid: "cse:1989:set1:main:q12b",
        tags: ["gate1989", "databases", "descriptive"],
        question: "<p>Write an SQL query to find all employees.</p>",
      }),
      QuestionService.normalizeQuestion({
        question_uid: "go:94333",
        title: "GATE CSE 1988 | Question: 2xv",
        year: "gate1988",
        link: "https://gateoverflow.in/94333/gate-cse-1988-question-2xv",
        exam_uid: "cse:1988:set1:main:q2xv",
        tags: ["gate1988", "compiler-design", "descriptive"],
        question: "<p>How many tokens are generated?</p>",
        answer_meta: {
          type: "NAT",
          answer: 10,
          tolerance: { abs: 0.01 },
          source: "question_uid",
        },
      }),
    ]);

    expect(finalized.map((question) => question.question_uid)).toEqual(["go:94333"]);
  });
});
