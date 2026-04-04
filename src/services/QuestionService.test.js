import { QuestionService } from "./QuestionService";

describe("QuestionService", () => {
  beforeEach(() => {
    QuestionService.questions = [];
    QuestionService.loaded = false;
    QuestionService.count = new Map();
    QuestionService.tags = [];
    QuestionService.sourceUrl = "";
    QuestionService.SUBJECT_ALIAS_CACHE = new Map();
    QuestionService._subtopicLookupCache = new Map();
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
      }),
    ]);

    expect(finalized.exam_uid).toBe("cse:2026:set1:ga:q2");
    expect(finalized.exam.yearSetKey).toBe("2026-s0");
  });

  test("finalizeQuestions collapses single-set years but keeps explicit split sets", () => {
    const finalized = QuestionService.finalizeQuestions([
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2023 | Question: 1",
        year: "gatecse-2023",
        link: "https://gateoverflow.in/400001/gate-cse-2023-question-1",
        exam_uid: "cse:2023:set1:main:q1",
        tags: ["gatecse-2023", "algorithms"],
      }),
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2025 | Question: 1",
        year: "gatecse-2025",
        link: "https://gateoverflow.in/500001/gate-cse-2025-question-1",
        exam_uid: "cse:2025:set1:main:q1",
        tags: ["gatecse-2025", "algorithms"],
      }),
      QuestionService.normalizeQuestion({
        title: "GATE CSE 2025 | Question: 1",
        year: "gatecse-2025",
        link: "https://gateoverflow.in/500101/gate-cse-2025-question-1",
        exam_uid: "cse:2025:set2:main:q1",
        tags: ["gatecse-2025", "algorithms"],
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
      }),
      QuestionService.normalizeQuestion({
        question_uid: "go:388951",
        title: "GATE CSE 2017 Set 2 | Question: 33 (MSQ Version)",
        year: "gatecse-2017-set2",
        link: "https://gateoverflow.in/388951/gate-cse-2017-set-2-question-33-msq-version",
        exam_uid: "cse:2017:set2:main:q33-msq-version",
        tags: ["gatecse-2017-set2", "algorithms"],
      }),
    ]);

    expect(finalized).toHaveLength(1);
    expect(finalized[0].question_uid).toBe("go:388950");
    expect(finalized[0].exam_uid).toBe("cse:2017:set2:main:q33");
  });
});
