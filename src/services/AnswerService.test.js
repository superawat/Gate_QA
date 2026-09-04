import { AnswerService } from "./AnswerService";

describe("AnswerService", () => {
  beforeEach(() => {
    AnswerService.answersByQuestionUid = {};
    AnswerService.answersByUid = {};
    AnswerService.answersByExamUid = {};
    AnswerService.unsupportedQuestionUids = new Set();
    AnswerService.loaded = false;
    AnswerService.loadError = "";
  });

  test("builds answer uid for a question with id_str and volume", () => {
    const uid = AnswerService.getAnswerUid({
      volume: 2,
      id_str: "1.24.30",
    });
    expect(uid).toBe("v2:1.24.30");
  });

  test("builds question uid from gateoverflow link", () => {
    const uid = AnswerService.getQuestionUid({
      link: "https://gateoverflow.in/399311/gate-cse-2023-question-1",
    });
    expect(uid).toBe("go:399311");
  });

  test("extracts full gateoverflow numeric id without truncation", () => {
    expect(
      AnswerService.extractGateOverflowId(
        "https://gateoverflow.in/371497/sample-question"
      )
    ).toBe("371497");
    expect(
      AnswerService.extractGateOverflowId(
        "https://gateoverflow.in/497/gate-cse-2008-question-78"
      )
    ).toBe("497");
    expect(
      AnswerService.extractGateOverflowId("https://gateoverflow.in/blog/17024/post")
    ).toBeNull();
  });

  test("builds exam uid from gate cse link slug", () => {
    const examUid = AnswerService.getExamUid({
      link: "https://gateoverflow.in/460817/gate-cse-2025-set-2-question-18",
    });
    expect(examUid).toBe("cse:2025:set2:main:q18");
  });

  test("reports missing identity when no join keys are present", () => {
    const identity = AnswerService.getQuestionIdentity({
      title: "Sample without keys",
    });
    expect(identity.hasIdentity).toBe(false);
    expect(identity.reason).toBe("missing_join_keys");
  });

  test("treats local question_uid as storage-only identity", () => {
    const identity = AnswerService.getQuestionIdentity({
      question_uid: "local:abc123",
    });
    expect(identity.hasIdentity).toBe(false);
    expect(identity.storageUid).toBe("local:abc123");
    expect(AnswerService.getStorageKeyForQuestion({ question_uid: "local:abc123" })).toBe(
      "local:abc123"
    );
  });

  test("builds identity from volume + id_str when question_uid is absent", () => {
    const identity = AnswerService.getQuestionIdentity({
      volume: 1,
      id_str: "1.24.30",
    });
    expect(identity.hasIdentity).toBe(true);
    expect(identity.questionUid).toBeNull();
    expect(identity.answerUid).toBe("v1:1.24.30");
  });

  test("returns answer from question_uid map when present", () => {
    AnswerService.answersByQuestionUid = {
      "go:399311": {
        answer_uid: "v2:1.24.30",
        type: "MSQ",
        answer: ["A", "B", "C"],
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:399311",
    });
    expect(answer.type).toBe("MSQ");
  });

  test("returns embedded answers for isolated aptitude questions", () => {
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "APT-ENG-0001",
      type: "mcq",
      answerMeta: {
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    });

    expect(answer).toMatchObject({
      answer_uid: "apt:APT-ENG-0001",
      type: "MCQ",
      answer: "B",
      tolerance: null,
      source: { kind: "aptitude_embedded" },
    });
  });

  test("falls back to answer uid map when question_uid is missing", () => {
    AnswerService.answersByUid = {
      "v2:1.24.30": {
        uid: "v2:1.24.30",
        type: "MCQ",
        answer: "A",
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      volume: 2,
      id_str: "1.24.30",
    });
    expect(answer.type).toBe("MCQ");
  });

  test("falls back to exam uid map when question_uid answer is missing", () => {
    AnswerService.answersByExamUid = {
      "cse:2008:set1:main:q78": {
        answer_uid: "exam:cse:2008:set1:main:q78",
        type: "MCQ",
        answer: "D",
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:497",
      link: "https://gateoverflow.in/497/gate-cse-2008-question-78",
      title: "GATE CSE 2008 | Question: 78",
      year: "gatecse-2008",
    });
    expect(answer.type).toBe("MCQ");
    expect(answer.answer).toBe("D");
  });

  test("hasAnswer returns false when record is missing", () => {
    expect(AnswerService.hasAnswer({ question_uid: "go:999999" })).toBe(false);
  });

  test("returns unsupported marker when question uid is in unsupported registry", () => {
    AnswerService.unsupportedQuestionUids = new Set(["go:401"]);
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:401",
      link: "https://gateoverflow.in/401/gate-cse-2008-question-3",
    });
    expect(answer.type).toBe("UNSUPPORTED");
    expect(answer.answer_uid).toBe("unsupported:go:401");
  });

  test("resolves GATE CSE 2024 Set 1 Q31 (go:422811) as MCQ with Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:422811": {
        answer_uid: "v2:1.31.24",
        type: "MCQ",
        answer: "D",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422811",
      link: "https://gateoverflow.in/422811/gate-cse-2024-set-1-question-31",
      title: "GATE CSE 2024 | Set 1 | Question: 31",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.31.24",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2005 Q53 (go:1376) as defective MCQ with null answer", () => {
    AnswerService.answersByQuestionUid = {
      "go:1376": {
        answer_uid: "manual_res:go:1376",
        type: "MCQ",
        answer: null,
        tolerance: null,
        is_defective: true,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:1376",
      link: "https://gateoverflow.in/1376/gate-cse-2005-question-53",
      title: "GATE CSE 2005 | Question: 53",
    });
    expect(answer).toEqual({
      answer_uid: "manual_res:go:1376",
      type: "MCQ",
      answer: null,
      tolerance: null,
      is_defective: true,
    });
  });

  test("resolves GATE CSE 2008 Q79 (go:43485) as defective MCQ with null answer", () => {
    AnswerService.answersByQuestionUid = {
      "go:43485": {
        answer_uid: "manual_res:go:43485",
        type: "MCQ",
        answer: null,
        tolerance: null,
        is_defective: true,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:43485",
      link: "https://gateoverflow.in/43485/gate-cse-2008-question-79",
      title: "GATE CSE 2008 | Question: 79",
    });
    expect(answer).toEqual({
      answer_uid: "manual_res:go:43485",
      type: "MCQ",
      answer: null,
      tolerance: null,
      is_defective: true,
    });
  });

  test("resolves GATE CSE 1987 Q2j (go:80594) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:80594": {
        answer_uid: "v2:10.10.1",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:80594",
      link: "https://gateoverflow.in/80594/gate-cse-1987-question-2j",
      title: "GATE CSE 1987 | Question: 2j",
    });
    expect(answer).toEqual({
      answer_uid: "v2:10.10.1",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 1987 Q2k (go:80599) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:80599": {
        answer_uid: "v2:10.3.1",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:80599",
      link: "https://gateoverflow.in/80599/gate-cse-1987-question-2k",
      title: "GATE CSE 1987 | Question: 2k",
    });
    expect(answer).toEqual({
      answer_uid: "v2:10.3.1",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 1990 Q3-v (go:84830) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:84830": {
        answer_uid: "v2:1.31.3",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:84830",
      link: "https://gateoverflow.in/84830/gate-cse-1990-question-3-v",
      title: "GATE CSE 1990 | Question: 3-v",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.31.3",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 Q18 (go:460062) as MSQ with Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:460062": {
        answer_uid: "manual:go:460062",
        type: "MSQ",
        answer: ["D"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460062",
      link: "https://gateoverflow.in/460062/gate-cse-2025-set-1-question-18",
      title: "GATE CSE 2025 | Set 1 | Question: 18",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:460062",
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 Q40 (go:460040) as MSQ with Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:460040": {
        answer_uid: "manual:go:460040",
        type: "MSQ",
        answer: ["C"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460040",
      link: "https://gateoverflow.in/460040/gate-cse-2025-set-1-question-40",
      title: "GATE CSE 2025 | Set 1 | Question: 40",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:460040",
      type: "MSQ",
      answer: ["C"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 2 Q31 (go:422866) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:422866": {
        answer_uid: "manual:go:422866",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422866",
      link: "https://gateoverflow.in/422866/gate-cse-2024-set-2-question-31",
      title: "GATE CSE 2024 | Set 2 | Question: 31",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:422866",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE IT 2008 Q29 (go:3319) as defective MCQ with null answer", () => {
    AnswerService.answersByQuestionUid = {
      "go:3319": {
        answer_uid: "manual_res:go:3319",
        type: "MCQ",
        answer: null,
        tolerance: null,
        is_defective: true,
        defective_reason: "For a square matrix M with det(M)=0, only S3 (MX=0 has a nontrivial solution) is correct. S1 and S2 are not necessarily true, and S4 is false. Since none of the options represents 'S3 only', no option is correct and the question is excluded from scoring.",
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:3319",
      link: "https://gateoverflow.in/3319/gate-it-2008-question-29",
      title: "GATE IT 2008 | Question: 29",
    });
    expect(answer).toEqual({
      answer_uid: "manual_res:go:3319",
      type: "MCQ",
      answer: null,
      tolerance: null,
      is_defective: true,
      defective_reason: "For a square matrix M with det(M)=0, only S3 (MX=0 has a nontrivial solution) is correct. S1 and S2 are not necessarily true, and S4 is false. Since none of the options represents 'S3 only', no option is correct and the question is excluded from scoring.",
    });
  });
});
