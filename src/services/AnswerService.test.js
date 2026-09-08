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

  test("resolves GATE CSE 2025 Set 1 Q33 (go:460047) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:460047": {
        answer_uid: "v2:1.30.6",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460047",
      link: "https://gateoverflow.in/460047/gate-cse-2025-set-1-question-33",
      title: "GATE CSE 2025 | Set 1 | Question: 33",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.30.6",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2017 Set 2 Q30 (go:118623) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:118623": {
        answer_uid: "v2:1.27.28",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118623",
      link: "https://gateoverflow.in/118623/gate-cse-2017-set-2-question-30",
      title: "GATE CSE 2017 Set 2 | Question: 30",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.27.28",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2004 / IT 2004 Q57 (go:3700) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:3700": {
        answer_uid: "v2:1.27.34",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:3700",
      link: "https://gateoverflow.in/3700/gate-it-2004-question-57",
      title: "GATE IT 2004 | Question: 57",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.27.34",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 Q10 (go:460070) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:460070": {
        answer_uid: "v2:1.27.33",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460070",
      link: "https://gateoverflow.in/460070/gate-cse-2025-set-1-question-10",
      title: "GATE CSE 2025 | Set 1 | Question: 10",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.27.33",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 GA Q9 (go:460092) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:460092": {
        answer_uid: "v1:10.6.4",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460092",
      link: "https://gateoverflow.in/460092/gate-cse-2025-set-1-ga-question-9",
      title: "GATE CSE 2025 | Set 1 | GA Question: 9",
    });
    expect(answer).toEqual({
      answer_uid: "v1:10.6.4",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 CS Q39 (go:460041) as MSQ with Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:460041": {
        answer_uid: "v1:4.5.1",
        type: "MSQ",
        answer: ["B"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460041",
      link: "https://gateoverflow.in/460041/gate-cse-2025-set-1-question-39",
      title: "GATE CSE 2025 | Set 1 | Question: 39",
    });
    expect(answer).toEqual({
      answer_uid: "v1:4.5.1",
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 1 CS Q55 (go:460025) as NAT range 10 to 11", () => {
    AnswerService.answersByQuestionUid = {
      "go:460025": {
        answer_uid: "v2:1.11.1",
        type: "NAT",
        answer: 10.5,
        tolerance: { lower: 10, upper: 11, abs: 0.5 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460025",
      link: "https://gateoverflow.in/460025/gate-cse-2025-set-1-question-55",
      title: "GATE CSE 2025 | Set 1 | Question: 55",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.11.1",
      type: "NAT",
      answer: 10.5,
      tolerance: { lower: 10, upper: 11, abs: 0.5 },
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q10 (go:460825) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:460825": {
        answer_uid: "v2:1.31.26",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460825",
      link: "https://gateoverflow.in/460825/gate-cse-2025-set-2-question-10",
      title: "GATE CSE 2025 | Set 2 | Question: 10",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.31.26",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q18 (go:460817) as MSQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:460817": {
        answer_uid: "manual:go:460817",
        type: "MSQ",
        answer: ["D"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460817",
      link: "https://gateoverflow.in/460817/gate-cse-2025-set-2-question-18",
      title: "GATE CSE 2025 | Set 2 | Question: 18",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:460817",
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q27 (go:460808) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:460808": {
        answer_uid: "v2:1.30.8",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460808",
      link: "https://gateoverflow.in/460808/gate-cse-2025-set-2-question-27",
      title: "GATE CSE 2025 | Set 2 | Question: 27",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.30.8",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q35 (go:460800) as MSQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:460800": {
        answer_uid: "v2:8.13.14",
        type: "MSQ",
        answer: ["A"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460800",
      link: "https://gateoverflow.in/460800/gate-cse-2025-set-2-question-35",
      title: "GATE CSE 2025 | Set 2 | Question: 35",
    });
    expect(answer).toEqual({
      answer_uid: "v2:8.13.14",
      type: "MSQ",
      answer: ["A"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q37 (go:460798) as MSQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:460798": {
        answer_uid: "v2:7.16.30",
        type: "MSQ",
        answer: ["D"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460798",
      link: "https://gateoverflow.in/460798/gate-cse-2025-set-2-question-37",
      title: "GATE CSE 2025 | Set 2 | Question: 37",
    });
    expect(answer).toEqual({
      answer_uid: "v2:7.16.30",
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2025 Set 2 CS Q43 (go:460850) as MSQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:460850": {
        answer_uid: "v2:5.3.9",
        type: "MSQ",
        answer: ["B"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:460850",
      link: "https://gateoverflow.in/460850/gate-cse-2025-set-2-question-43",
      title: "GATE CSE 2025 | Set 2 | Question: 43",
    });
    expect(answer).toEqual({
      answer_uid: "v2:5.3.9",
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 1 CS Q14 (go:422828) as MSQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:422828": {
        answer_uid: "manual:go:422828",
        type: "MSQ",
        answer: ["D"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422828",
      link: "https://gateoverflow.in/422828/gate-cse-2024-set-1-question-14",
      title: "GATE CSE 2024 | Set 1 | Question: 14",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:422828",
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 1 CS Q35 (go:422807) as MSQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:422807": {
        answer_uid: "v2:1.14.16",
        type: "MSQ",
        answer: ["C"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422807",
      link: "https://gateoverflow.in/422807/gate-cse-2024-set-1-question-35",
      title: "GATE CSE 2024 | Set 1 | Question: 35",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.14.16",
      type: "MSQ",
      answer: ["C"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 1 CS Q39 (go:422803) as MSQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:422803": {
        answer_uid: "manual:go:422803",
        type: "MSQ",
        answer: ["A"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422803",
      link: "https://gateoverflow.in/422803/gate-cse-2024-set-1-question-39",
      title: "GATE CSE 2024 | Set 1 | Question: 39",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:422803",
      type: "MSQ",
      answer: ["A"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 1 CS Q53 (go:422789) as NAT range 0.370 to 0.380", () => {
    AnswerService.answersByQuestionUid = {
      "go:422789": {
        answer_uid: "v1:7.5.13",
        type: "NAT",
        answer: 0.375,
        tolerance: { lower: 0.37, upper: 0.38, abs: 0.005 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422789",
      link: "https://gateoverflow.in/422789/gate-cse-2024-set-1-question-53",
      title: "GATE CSE 2024 | Set 1 | Question: 53",
    });
    expect(answer).toEqual({
      answer_uid: "v1:7.5.13",
      type: "NAT",
      answer: 0.375,
      tolerance: { lower: 0.37, upper: 0.38, abs: 0.005 },
    });
  });

  test("resolves GATE CSE 2024 Set 2 CS Q13 (go:422884) as MSQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:422884": {
        answer_uid: "v2:4.12.5",
        type: "MSQ",
        answer: ["B"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422884",
      link: "https://gateoverflow.in/422884/gate-cse-2024-set-2-question-13",
      title: "GATE CSE 2024 | Set 2 | Question: 13",
    });
    expect(answer).toEqual({
      answer_uid: "v2:4.12.5",
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 2 CS Q41 (go:422856) as MSQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:422856": {
        answer_uid: "v1:2.4.32",
        type: "MSQ",
        answer: ["D"],
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422856",
      link: "https://gateoverflow.in/422856/gate-cse-2024-set-2-question-41",
      title: "GATE CSE 2024 | Set 2 | Question: 41",
    });
    expect(answer).toEqual({
      answer_uid: "v1:2.4.32",
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2024 Set 2 CS Q43 (go:422854) as NAT range 29.50 to 30.50", () => {
    AnswerService.answersByQuestionUid = {
      "go:422854": {
        answer_uid: "v2:7.3.27",
        type: "NAT",
        answer: 30.0,
        tolerance: { lower: 29.5, upper: 30.5, abs: 0.5 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422854",
      link: "https://gateoverflow.in/422854/gate-cse-2024-set-2-question-43",
      title: "GATE CSE 2024 | Set 2 | Question: 43",
    });
    expect(answer).toEqual({
      answer_uid: "v2:7.3.27",
      type: "NAT",
      answer: 30.0,
      tolerance: { lower: 29.5, upper: 30.5, abs: 0.5 },
    });
  });

  test("resolves GATE CSE 2024 Set 2 CS Q48 (go:422849) as NAT range 2.9 to 3.1", () => {
    AnswerService.answersByQuestionUid = {
      "go:422849": {
        answer_uid: "manual:go:422849",
        type: "NAT",
        answer: 3.0,
        tolerance: { lower: 2.9, upper: 3.1, abs: 0.1 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422849",
      link: "https://gateoverflow.in/422849/gate-cse-2024-set-2-question-48",
      title: "GATE CSE 2024 | Set 2 | Question: 48",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:422849",
      type: "NAT",
      answer: 3.0,
      tolerance: { lower: 2.9, upper: 3.1, abs: 0.1 },
    });
  });

  test("resolves GATE CSE 2024 Set 2 CS Q49 (go:422848) as NAT value 9", () => {
    AnswerService.answersByQuestionUid = {
      "go:422848": {
        answer_uid: "v2:1.24.33",
        type: "NAT",
        answer: 9,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:422848",
      link: "https://gateoverflow.in/422848/gate-cse-2024-set-2-question-49",
      title: "GATE CSE 2024 | Set 2 | Question: 49",
    });
    expect(answer).toEqual({
      answer_uid: "v2:1.24.33",
      type: "NAT",
      answer: 9,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2020 CS Q7 (go:333224) as MTA", () => {
    AnswerService.answersByQuestionUid = {
      "go:333224": {
        answer_uid: "manual:go:333224",
        type: "MTA",
        answer: "MTA",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:333224",
      link: "https://gateoverflow.in/333224/gate-cse-2020-question-7",
      title: "GATE CSE 2020 | Question: 7",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:333224",
      type: "MTA",
      answer: "MTA",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2020 CS Q21 (go:333210) as dual accepted NAT ranges", () => {
    AnswerService.answersByQuestionUid = {
      "go:333210": {
        answer_uid: "manual:go:333210",
        type: "NAT",
        answer: 13.3,
        tolerance: {
          ranges: [
            { min: 13.3, max: 13.3, lower: 13.3, upper: 13.3 },
            { min: 13.5, max: 13.5, lower: 13.5, upper: 13.5 },
          ],
        },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:333210",
      link: "https://gateoverflow.in/333210/gate-cse-2020-question-21",
      title: "GATE CSE 2020 | Question: 21",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:333210",
      type: "NAT",
      answer: 13.3,
      tolerance: {
        ranges: [
          { min: 13.3, max: 13.3, lower: 13.3, upper: 13.3 },
          { min: 13.5, max: 13.5, lower: 13.5, upper: 13.5 },
        ],
      },
    });
  });

  test("resolves GATE CSE 2019 CS Q12 (go:302836) as MCQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:302836": {
        answer_uid: "manual:go:302836",
        type: "MCQ",
        answer: "D",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:302836",
      link: "https://gateoverflow.in/302836/gate-cse-2019-question-12",
      title: "GATE CSE 2019 | Question: 12",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:302836",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2019 CS Q54 (go:302794) as NAT 97", () => {
    AnswerService.answersByQuestionUid = {
      "go:302794": {
        answer_uid: "manual:go:302794",
        type: "NAT",
        answer: 97,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:302794",
      link: "https://gateoverflow.in/302794/gate-cse-2019-question-54",
      title: "GATE CSE 2019 | Question: 54",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:302794",
      type: "NAT",
      answer: 97,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2018 CS Q31 (go:204105) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:204105": {
        answer_uid: "manual:go:204105",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:204105",
      link: "https://gateoverflow.in/204105/gate-cse-2018-question-31",
      title: "GATE CSE 2018 | Question: 31",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:204105",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2018 CS Q45 (go:204120) as NAT 10230", () => {
    AnswerService.answersByQuestionUid = {
      "go:204120": {
        answer_uid: "manual:go:204120",
        type: "NAT",
        answer: 10230,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:204120",
      link: "https://gateoverflow.in/204120/gate-cse-2018-question-45",
      title: "GATE CSE 2018 | Question: 45",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:204120",
      type: "NAT",
      answer: 10230,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2018 CS Q47 (go:204122) as NAT 4", () => {
    AnswerService.answersByQuestionUid = {
      "go:204122": {
        answer_uid: "manual:go:204122",
        type: "NAT",
        answer: 4,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:204122",
      link: "https://gateoverflow.in/204122/gate-cse-2018-question-47",
      title: "GATE CSE 2018 | Question: 47",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:204122",
      type: "NAT",
      answer: 4,
      tolerance: { abs: 0.01 },
    });
  });
});




