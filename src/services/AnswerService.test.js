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

  test("resolves GATE CSE 2017 Set 1 CS Q15 (go:118295) as MCQ Option B", () => {
    AnswerService.answersByQuestionUid = {
      "go:118295": {
        answer_uid: "manual:go:118295",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118295",
      link: "https://gateoverflow.in/118295/gate-cse-2017-set-1-question-15",
      title: "GATE CSE 2017 Set 1 | Question: 15",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:118295",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2017 Set 1 CS Q23 (go:118303) as NAT 2.6", () => {
    AnswerService.answersByQuestionUid = {
      "go:118303": {
        answer_uid: "manual:go:118303",
        type: "NAT",
        answer: 2.6,
        tolerance: { lower: 2.6, upper: 2.6, abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118303",
      link: "https://gateoverflow.in/118303/gate-cse-2017-set-1-question-23",
      title: "GATE CSE 2017 Set 1 | Question: 23",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:118303",
      type: "NAT",
      answer: 2.6,
      tolerance: { lower: 2.6, upper: 2.6, abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2017 Set 1 CS Q44 (go:118327) as NAT 11", () => {
    AnswerService.answersByQuestionUid = {
      "go:118327": {
        answer_uid: "manual:go:118327",
        type: "NAT",
        answer: 11,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118327",
      link: "https://gateoverflow.in/118327/gate-cse-2017-set-1-question-44",
      title: "GATE CSE 2017 Set 1 | Question: 44",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:118327",
      type: "NAT",
      answer: 11,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2017 Set 1 CS Q48 (go:118331) as NAT 5", () => {
    AnswerService.answersByQuestionUid = {
      "go:118331": {
        answer_uid: "manual:go:118331",
        type: "NAT",
        answer: 5,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118331",
      link: "https://gateoverflow.in/118331/gate-cse-2017-set-1-question-48",
      title: "GATE CSE 2017 Set 1 | Question: 48",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:118331",
      type: "NAT",
      answer: 5,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2017 Set 2 CS Q45 (go:118597) as NAT 4.72", () => {
    AnswerService.answersByQuestionUid = {
      "go:118597": {
        answer_uid: "manual:go:118597",
        type: "NAT",
        answer: 4.72,
        tolerance: { lower: 4.70, upper: 4.74, abs: 0.02 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:118597",
      link: "https://gateoverflow.in/118597/gate-cse-2017-set-2-question-45",
      title: "GATE CSE 2017 Set 2 | Question: 45",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:118597",
      type: "NAT",
      answer: 4.72,
      tolerance: { lower: 4.70, upper: 4.74, abs: 0.02 },
    });
  });

  test("resolves GATE CSE 2016 Set 1 CS Q14 (go:39673) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:39673": {
        answer_uid: "manual:go:39673",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:39673",
      link: "https://gateoverflow.in/39673/gate-cse-2016-set-1-question-14",
      title: "GATE CSE 2016 Set 1 | Question: 14",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:39673",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2016 Set 1 CS Q39 (go:39725) as NAT 7", () => {
    AnswerService.answersByQuestionUid = {
      "go:39725": {
        answer_uid: "manual:go:39725",
        type: "NAT",
        answer: 7,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:39725",
      link: "https://gateoverflow.in/39725/gate-cse-2016-set-1-question-39",
      title: "GATE CSE 2016 Set 1 | Question: 39",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:39725",
      type: "NAT",
      answer: 7,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2016 Set 2 CS Q13 (go:39561) as MCQ Option D", () => {
    AnswerService.answersByQuestionUid = {
      "go:39561": {
        answer_uid: "manual:go:39561",
        type: "MCQ",
        answer: "D",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:39561",
      link: "https://gateoverflow.in/39561/gate-cse-2016-set-2-question-13",
      title: "GATE CSE 2016 Set 2 | Question: 13",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:39561",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2016 Set 2 CS Q38 (go:39587) as NAT 1500", () => {
    AnswerService.answersByQuestionUid = {
      "go:39587": {
        answer_uid: "manual:go:39587",
        type: "NAT",
        answer: 1500,
        tolerance: { abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:39587",
      link: "https://gateoverflow.in/39587/gate-cse-2016-set-2-question-38",
      title: "GATE CSE 2016 Set 2 | Question: 38",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:39587",
      type: "NAT",
      answer: 1500,
      tolerance: { abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2015 Set 1 CS Q1 (go:8015) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:8015": {
        answer_uid: "manual:go:8015",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8015",
      link: "https://gateoverflow.in/8015/gate-cse-2015-set-1-question-1",
      title: "GATE CSE 2015 Set 1 | Question: 1",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8015",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2015 Set 1 CS Q21 (go:8244) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:8244": {
        answer_uid: "manual:go:8244",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8244",
      link: "https://gateoverflow.in/8244/gate-cse-2015-set-1-question-21",
      title: "GATE CSE 2015 Set 1 | Question: 21",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8244",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2015 Set 1 CS Q42 (go:8312) as NAT 5", () => {
    AnswerService.answersByQuestionUid = {
      "go:8312": {
        answer_uid: "manual:go:8312",
        type: "NAT",
        answer: 5,
        tolerance: { lower: 5, upper: 5, abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8312",
      link: "https://gateoverflow.in/8312/gate-cse-2015-set-1-question-42",
      title: "GATE CSE 2015 Set 1 | Question: 42",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8312",
      type: "NAT",
      answer: 5,
      tolerance: { lower: 5, upper: 5, abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2015 Set 2 CS Q2 (go:8048) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:8048": {
        answer_uid: "manual:go:8048",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8048",
      link: "https://gateoverflow.in/8048/gate-cse-2015-set-2-question-2",
      title: "GATE CSE 2015 Set 2 | Question: 2",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8048",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2015 Set 2 CS Q4 (go:8050) as MCQ Option C", () => {
    AnswerService.answersByQuestionUid = {
      "go:8050": {
        answer_uid: "manual:go:8050",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8050",
      link: "https://gateoverflow.in/8050/gate-cse-2015-set-2-question-4",
      title: "GATE CSE 2015 Set 2 | Question: 4",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8050",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2015 Set 2 CS Q45 (go:8243) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:8243": {
        answer_uid: "manual:go:8243",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8243",
      link: "https://gateoverflow.in/8243/gate-cse-2015-set-2-question-45",
      title: "GATE CSE 2015 Set 2 | Question: 45",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8243",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2015 Set 3 GA Q10 (go:8389) as NAT 2006", () => {
    AnswerService.answersByQuestionUid = {
      "go:8389": {
        answer_uid: "manual:go:8389",
        type: "NAT",
        answer: 2006,
        tolerance: { lower: 2006, upper: 2006, abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8389",
      link: "https://gateoverflow.in/8389/gate-cse-2015-set-3-question-ga-10",
      title: "GATE CSE 2015 Set 3 | Question: GA-10",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8389",
      type: "NAT",
      answer: 2006,
      tolerance: { lower: 2006, upper: 2006, abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2015 Set 3 CS Q21 (go:8423) as NAT 612.5", () => {
    AnswerService.answersByQuestionUid = {
      "go:8423": {
        answer_uid: "manual:go:8423",
        type: "NAT",
        answer: 612.5,
        tolerance: { lower: 612, upper: 613, abs: 0.5 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8423",
      link: "https://gateoverflow.in/8423/gate-cse-2015-set-3-question-21",
      title: "GATE CSE 2015 Set 3 | Question: 21",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8423",
      type: "NAT",
      answer: 612.5,
      tolerance: { lower: 612, upper: 613, abs: 0.5 },
    });
  });

  test("resolves GATE CSE 2015 Set 3 CS Q55 (go:8564) as MCQ Option A", () => {
    AnswerService.answersByQuestionUid = {
      "go:8564": {
        answer_uid: "manual:go:8564",
        type: "MCQ",
        answer: "A",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:8564",
      link: "https://gateoverflow.in/8564/gate-cse-2015-set-3-question-55",
      title: "GATE CSE 2015 Set 3 | Question: 55",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:8564",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2014 Set 1 CS Q2 (go:1717) as NAT range [0.24, 0.27]", () => {
    AnswerService.answersByQuestionUid = {
      "go:1717": {
        answer_uid: "manual:go:1717",
        type: "NAT",
        answer: 0.255,
        tolerance: { lower: 0.24, upper: 0.27, abs: 0.015 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:1717",
      link: "https://gateoverflow.in/1717/gate-cse-2014-set-1-question-2",
      title: "GATE CSE 2014 Set 1 | Question: 2",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:1717",
      type: "NAT",
      answer: 0.255,
      tolerance: { lower: 0.24, upper: 0.27, abs: 0.015 },
    });
  });

  test("resolves GATE CSE 2014 Set 2 CS Q1 (go:1953) as NAT range [11.85, 11.95]", () => {
    AnswerService.answersByQuestionUid = {
      "go:1953": {
        answer_uid: "manual:go:1953",
        type: "NAT",
        answer: 11.9,
        tolerance: { lower: 11.85, upper: 11.95, abs: 0.05 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:1953",
      link: "https://gateoverflow.in/1953/gate-cse-2014-set-2-question-1",
      title: "GATE CSE 2014 Set 2 | Question: 1",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:1953",
      type: "NAT",
      answer: 11.9,
      tolerance: { lower: 11.85, upper: 11.95, abs: 0.05 },
    });
  });

  test("resolves GATE CSE 2014 Set 3 CS Q26 (go:2060) as NAT 1", () => {
    AnswerService.answersByQuestionUid = {
      "go:2060": {
        answer_uid: "manual:go:2060",
        type: "NAT",
        answer: 1,
        tolerance: { lower: 1, upper: 1, abs: 0.01 },
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2060",
      link: "https://gateoverflow.in/2060/gate-cse-2014-set-3-question-26",
      title: "GATE CSE 2014 Set 3 | Question: 26",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2060",
      type: "NAT",
      answer: 1,
      tolerance: { lower: 1, upper: 1, abs: 0.01 },
    });
  });

  test("resolves GATE CSE 2013 CS Q30 (go:1541) as MCQ C", () => {
    AnswerService.answersByQuestionUid = {
      "go:1541": {
        answer_uid: "manual:go:1541",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:1541",
      link: "https://gateoverflow.in/1541/gate-cse-2013-question-30",
      title: "GATE CSE 2013 | Question: 30",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:1541",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2013 CS Q42 (go:60) as MTA", () => {
    AnswerService.answersByQuestionUid = {
      "go:60": {
        answer_uid: "manual:go:60",
        type: "MTA",
        answer: "MTA",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:60",
      link: "https://gateoverflow.in/60/gate-cse-2013-question-42",
      title: "GATE CSE 2013 | Question: 42",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:60",
      type: "MTA",
      answer: "MTA",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2013 CS Q47 (go:80) as MTA", () => {
    AnswerService.answersByQuestionUid = {
      "go:80": {
        answer_uid: "manual:go:80",
        type: "MTA",
        answer: "MTA",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:80",
      link: "https://gateoverflow.in/80/gate-cse-2013-question-47",
      title: "GATE CSE 2013 | Question: 47",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:80",
      type: "MTA",
      answer: "MTA",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2012 CS Q3 (go:35) as MTA", () => {
    AnswerService.answersByQuestionUid = {
      "go:35": {
        answer_uid: "manual:go:35",
        type: "MTA",
        answer: "MTA",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:35",
      link: "https://gateoverflow.in/35/gate-cse-2012-question-3",
      title: "GATE CSE 2012 | Question: 3",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:35",
      type: "MTA",
      answer: "MTA",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2012 CS Q16 (go:48) as MCQ D", () => {
    AnswerService.answersByQuestionUid = {
      "go:48": {
        answer_uid: "manual:go:48",
        type: "MCQ",
        answer: "D",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:48",
      link: "https://gateoverflow.in/48/gate-cse-2012-question-16",
      title: "GATE CSE 2012 | Question: 16",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:48",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2011 CS Q33 (go:2135) as MCQ D", () => {
    AnswerService.answersByQuestionUid = {
      "go:2135": {
        answer_uid: "manual:go:2135",
        type: "MCQ",
        answer: "D",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2135",
      link: "https://gateoverflow.in/2135/gate-cse-2011-question-33",
      title: "GATE CSE 2011 | Question: 33",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2135",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2011 CS Q38 (go:2140) as MCQ C", () => {
    AnswerService.answersByQuestionUid = {
      "go:2140": {
        answer_uid: "manual:go:2140",
        type: "MCQ",
        answer: "C",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2140",
      link: "https://gateoverflow.in/2140/gate-cse-2011-question-38",
      title: "GATE CSE 2011 | Question: 38",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2140",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("resolves GATE CSE 2011 CS Q54 (go:2162) as MCQ B", () => {
    AnswerService.answersByQuestionUid = {
      "go:2162": {
        answer_uid: "manual:go:2162",
        type: "MCQ",
        answer: "B",
        tolerance: null,
      },
    };
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2162",
      link: "https://gateoverflow.in/2162/gate-cse-2011-question-54",
      title: "GATE CSE 2011 | Question: 54",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2162",
      type: "MCQ",
      answer: "B",
      tolerance: null,
    });
  });
});

describe("GATE CSE 2011 Answer Key Audit - AnswerService Integration (DEC-080)", () => {
  beforeEach(() => {
    AnswerService.answersByQuestionUid = {
      "go:2103": { answer_uid: "manual:go:2103", type: "MCQ", answer: "C", tolerance: null },
      "go:2132": { answer_uid: "manual:go:2132", type: "MCQ", answer: "A", tolerance: null },
      "go:2175": { answer_uid: "manual:go:2175", type: "MCQ", answer: "D", tolerance: null },
    };
    AnswerService.answersByUid = {};
    AnswerService.answersByExamUid = {
      "cse:2011:set1:main:q1": { answer_uid: "manual:go:2103", type: "MCQ", answer: "C", tolerance: null },
      "cse:2011:set1:main:q30": { answer_uid: "manual:go:2132", type: "MCQ", answer: "A", tolerance: null },
      "cse:2011:set1:main:q65": { answer_uid: "manual:go:2175", type: "MCQ", answer: "D", tolerance: null },
    };
    AnswerService.unsupportedQuestionUids = new Set();
    AnswerService.loaded = true;
    AnswerService.loadError = "";
  });

  test("go:2103 GATE CSE 2011 Q1 resolves MCQ C via question UID", () => {
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2103",
      link: "https://gateoverflow.in/2103/gate-cse-2011-question-1",
      title: "GATE CSE 2011 | Question: 1",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2103",
      type: "MCQ",
      answer: "C",
      tolerance: null,
    });
  });

  test("go:2132 GATE CSE 2011 Q30 resolves MCQ A via question UID", () => {
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2132",
      link: "https://gateoverflow.in/2132/gate-cse-2011-question-30",
      title: "GATE CSE 2011 | Question: 30",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2132",
      type: "MCQ",
      answer: "A",
      tolerance: null,
    });
  });

  test("go:2175 GATE CSE 2011 Q65 resolves MCQ D via question UID", () => {
    const answer = AnswerService.getAnswerForQuestion({
      question_uid: "go:2175",
      link: "https://gateoverflow.in/2175/gate-cse-2011-question-65",
      title: "GATE CSE 2011 | Question: 65",
    });
    expect(answer).toEqual({
      answer_uid: "manual:go:2175",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    });
  });

  describe("DEC-097: GATE CSE 2002 Comprehensive Answer Key Audit", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:807": { answer_uid: "manual:go:807", type: "MCQ", answer: "B", tolerance: null },
        "go:840": { answer_uid: "manual:go:840", type: "MCQ", answer: "A", tolerance: null },
        "go:806": { answer_uid: "manual:go:806", type: "MCQ", answer: "C", tolerance: null },
        "go:845": { answer_uid: "manual:go:845", type: "MCQ", answer: "A", tolerance: null },
        "go:814": { answer_uid: "manual:go:814", type: "MCQ", answer: "D", tolerance: null },
        "go:815": { answer_uid: "manual:go:815", type: "MCQ", answer: "A", tolerance: null },
        "go:823": { answer_uid: "manual:go:823", type: "MCQ", answer: "D", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:2002:set1:main:q1-3": { answer_uid: "manual:go:807", type: "MCQ", answer: "B", tolerance: null },
        "cse:2002:set1:main:q2-10": { answer_uid: "manual:go:840", type: "MCQ", answer: "A", tolerance: null },
        "cse:2002:set1:main:q1-2": { answer_uid: "manual:go:806", type: "MCQ", answer: "C", tolerance: null },
        "cse:2002:set1:main:q2-15": { answer_uid: "manual:go:845", type: "MCQ", answer: "A", tolerance: null },
        "cse:2002:set1:main:q1-10": { answer_uid: "manual:go:814", type: "MCQ", answer: "D", tolerance: null },
        "cse:2002:set1:main:q1-11": { answer_uid: "manual:go:815", type: "MCQ", answer: "A", tolerance: null },
        "cse:2002:set1:main:q1-18": { answer_uid: "manual:go:823", type: "MCQ", answer: "D", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:807 resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:807",
        link: "https://gateoverflow.in/807/gate-cse-2002-question-1-3",
        title: "GATE CSE 2002 | Question: 1.3",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });

    test("go:840 resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:840",
        link: "https://gateoverflow.in/840/gate-cse-2002-question-2-10",
        title: "GATE CSE 2002 | Question: 2.10",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });

    test("go:806 resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:806",
        link: "https://gateoverflow.in/806/gate-cse-2002-question-1-2",
        title: "GATE CSE 2002 | Question: 1.2",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:845 resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:845",
        link: "https://gateoverflow.in/845/gate-cse-2002-question-2-15",
        title: "GATE CSE 2002 | Question: 2.15",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });

    test("go:814 (ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:814",
        link: "https://gateoverflow.in/814/gate2002-1-10",
        title: "GATE CSE 2002 | Question: 1.10",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:815 (ingested) resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:815",
        link: "https://gateoverflow.in/815/gate2002-1-11",
        title: "GATE CSE 2002 | Question: 1.11",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });

    test("go:823 (ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:823",
        link: "https://gateoverflow.in/823/gate2002-1-18",
        title: "GATE CSE 2002 | Question: 1.18",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });
  });

  describe("DEC-098: GATE CSE 2001 Comprehensive Answer Key Audit & Ingestion", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:707": { answer_uid: "manual:go:707", type: "MCQ", answer: "C", tolerance: null },
        "go:702": { answer_uid: "manual:go:702", type: "MCQ", answer: "D", tolerance: null },
        "go:737": { answer_uid: "manual:go:737", type: "MCQ", answer: "D", tolerance: null },
        "go:712": { answer_uid: "manual:go:712", type: "MCQ", answer: "B", tolerance: null },
        "go:716": { answer_uid: "manual:go:716", type: "MCQ", answer: "C", tolerance: null },
        "go:717": { answer_uid: "manual:go:717", type: "MCQ", answer: "D", tolerance: null },
        "go:718": { answer_uid: "manual:go:718", type: "MCQ", answer: "C", tolerance: null },
        "go:742": { answer_uid: "manual:go:742", type: "MCQ", answer: "C", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:2001:set1:main:q1-14": { answer_uid: "manual:go:707", type: "MCQ", answer: "C", tolerance: null },
        "cse:2001:set1:main:q1-9": { answer_uid: "manual:go:702", type: "MCQ", answer: "D", tolerance: null },
        "cse:2001:set1:main:q2-19": { answer_uid: "manual:go:737", type: "MCQ", answer: "D", tolerance: null },
        "cse:2001:set1:main:q1-23": { answer_uid: "manual:go:716", type: "MCQ", answer: "C", tolerance: null },
        "cse:2001:set1:main:q1-24": { answer_uid: "manual:go:717", type: "MCQ", answer: "D", tolerance: null },
        "cse:2001:set1:main:q1-25": { answer_uid: "manual:go:718", type: "MCQ", answer: "C", tolerance: null },
        "cse:2001:set1:main:q2-24": { answer_uid: "manual:go:742", type: "MCQ", answer: "C", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:707 resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:707",
        link: "https://gateoverflow.in/707/gate-cse-2001-question-1-14",
        title: "GATE CSE 2001 | Question: 1.14",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:702 resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:702",
        link: "https://gateoverflow.in/702/gate-cse-2001-question-1-9",
        title: "GATE CSE 2001 | Question: 1.9",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:737 resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:737",
        link: "https://gateoverflow.in/737/gate-cse-2001-question-2-19",
        title: "GATE CSE 2001 | Question: 2.19",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:716 (ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:716",
        link: "https://gateoverflow.in/716/gate-cse-2001-question-1-23",
        title: "GATE CSE 2001 | Question: 1.23",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:717 (ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:717",
        link: "https://gateoverflow.in/717/gate-cse-2001-question-1-24",
        title: "GATE CSE 2001 | Question: 1.24",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:718 (ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:718",
        link: "https://gateoverflow.in/718/gate-cse-2001-question-1-25",
        title: "GATE CSE 2001 | Question: 1.25",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:742 (ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:742",
        link: "https://gateoverflow.in/742/gate-cse-2001-question-2-24",
        title: "GATE CSE 2001 | Question: 2.24",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });
  });

  describe("DEC-099: GATE CSE 2000–1997 Batch Answer Key Audit & Ingestion", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:647": { answer_uid: "manual:go:647", type: "MCQ", answer: "C", tolerance: null },
        "go:655": { answer_uid: "manual:go:655", type: "MCQ", answer: "D", tolerance: null },
        "go:673": { answer_uid: "manual:go:673", type: "MCQ", answer: "C", tolerance: null },
        "go:1484": { answer_uid: "manual:go:1484", type: "MCQ", answer: "D", tolerance: null },
        "go:1498": { answer_uid: "manual:go:1498", type: "MCQ", answer: "D", tolerance: null },
        "go:1491": { answer_uid: "manual:go:1491", type: "MCQ", answer: "C", tolerance: null },
        "go:1661": { answer_uid: "manual:go:1661", type: "MCQ", answer: "B", tolerance: null },
        "go:1670": { answer_uid: "manual:go:1670", type: "MCQ", answer: "D", tolerance: null },
        "go:2229": { answer_uid: "manual:go:2229", type: "MCQ", answer: "A", tolerance: null },
        "go:2251": { answer_uid: "manual:go:2251", type: "MCQ", answer: "C", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:2000:set1:main:q1-23": { answer_uid: "manual:go:647", type: "MCQ", answer: "C", tolerance: null },
        "cse:2000:set1:main:q2-8": { answer_uid: "manual:go:655", type: "MCQ", answer: "D", tolerance: null },
        "cse:2000:set1:main:q2-26": { answer_uid: "manual:go:673", type: "MCQ", answer: "C", tolerance: null },
        "cse:1999:set1:main:q2-6": { answer_uid: "manual:go:1484", type: "MCQ", answer: "D", tolerance: null },
        "cse:1999:set1:main:q2-21": { answer_uid: "manual:go:1498", type: "MCQ", answer: "D", tolerance: null },
        "cse:1999:set1:main:q2-13": { answer_uid: "manual:go:1491", type: "MCQ", answer: "C", tolerance: null },
        "cse:1998:set1:main:q1-24": { answer_uid: "manual:go:1661", type: "MCQ", answer: "B", tolerance: null },
        "cse:1998:set1:main:q1-33": { answer_uid: "manual:go:1670", type: "MCQ", answer: "D", tolerance: null },
        "cse:1997:set1:main:q2-3": { answer_uid: "manual:go:2229", type: "MCQ", answer: "A", tolerance: null },
        "cse:1997:set1:main:q4-10": { answer_uid: "manual:go:2251", type: "MCQ", answer: "C", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:647 (2000 ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:647",
        link: "https://gateoverflow.in/647/gate2000-1-23",
        title: "GATE CSE 2000 | Question: 1.23",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:1484 (1999 ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:1484",
        link: "https://gateoverflow.in/1484/gate1999-2-6",
        title: "GATE CSE 1999 | Question: 2.6",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:1661 (1998 corrected) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:1661",
        link: "https://gateoverflow.in/1661/gate1998-1-24",
        title: "GATE CSE 1998 | Question: 1.24",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });

    test("go:2229 (1997 ingested) resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:2229",
        link: "https://gateoverflow.in/2229/gate1997-2-3",
        title: "GATE CSE 1997 | Question: 2.3",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });
  });

  describe("DEC-100: GATE CSE 1996–1993 Batch Answer Key Audit & Ingestion", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:2742": { answer_uid: "manual:go:2742", type: "MCQ", answer: "C", tolerance: null },
        "go:2744": { answer_uid: "manual:go:2744", type: "MCQ", answer: "B", tolerance: null },
        "go:2597": { answer_uid: "manual:go:2597", type: "MCQ", answer: "C", tolerance: null },
        "go:2609": { answer_uid: "manual:go:2609", type: "MCQ", answer: "D", tolerance: null },
        "go:2603": { answer_uid: "manual:go:2603", type: "MCQ", answer: "C", tolerance: null },
        "go:2437": { answer_uid: "manual:go:2437", type: "MCQ", answer: "A", tolerance: null },
        "go:2444": { answer_uid: "manual:go:2444", type: "MCQ", answer: "B", tolerance: null },
        "go:2460": { answer_uid: "manual:go:2460", type: "MCQ", answer: "B", tolerance: null },
        "go:2297": { answer_uid: "manual:go:2297", type: "MCQ", answer: "D", tolerance: null },
        "go:2303": { answer_uid: "manual:go:2303", type: "MCQ", answer: "D", tolerance: null },
        "go:2305": { answer_uid: "manual:go:2305", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:1996:set1:main:q2-13": { answer_uid: "manual:go:2742", type: "MCQ", answer: "C", tolerance: null },
        "cse:1996:set1:main:q2-15": { answer_uid: "manual:go:2744", type: "MCQ", answer: "B", tolerance: null },
        "cse:1995:set1:main:q1-10": { answer_uid: "manual:go:2597", type: "MCQ", answer: "C", tolerance: null },
        "cse:1995:set1:main:q1-22": { answer_uid: "manual:go:2609", type: "MCQ", answer: "D", tolerance: null },
        "cse:1995:set1:main:q1-16": { answer_uid: "manual:go:2603", type: "MCQ", answer: "C", tolerance: null },
        "cse:1994:set1:main:q1-1": { answer_uid: "manual:go:2437", type: "MCQ", answer: "A", tolerance: null },
        "cse:1994:set1:main:q1-7": { answer_uid: "manual:go:2444", type: "MCQ", answer: "B", tolerance: null },
        "cse:1994:set1:main:q1-17": { answer_uid: "manual:go:2460", type: "MCQ", answer: "B", tolerance: null },
        "cse:1993:set1:main:q7-9": { answer_uid: "manual:go:2297", type: "MCQ", answer: "D", tolerance: null },
        "cse:1993:set1:main:q8-5": { answer_uid: "manual:go:2303", type: "MCQ", answer: "D", tolerance: null },
        "cse:1993:set1:main:q8-7": { answer_uid: "manual:go:2305", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:2742 (1996 corrected) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:2742",
        link: "https://gateoverflow.in/2742/gate-cse-1996-question-2-13",
        title: "GATE CSE 1996 | Question: 2.13",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:2597 (1995 ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:2597",
        link: "https://gateoverflow.in/2597/gate-cse-1995-question-1-10",
        title: "GATE CSE 1995 | Question: 1.10",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:2437 (1994 ingested) resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:2437",
        link: "https://gateoverflow.in/2437/gate-cse-1994-question-1-1",
        title: "GATE CSE 1994 | Question: 1.1",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });

    test("go:2305 (1993 ingested) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:2305",
        link: "https://gateoverflow.in/2305/gate-cse-1993-question-8-7",
        title: "GATE CSE 1993 | Question: 8.7",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });
  });

  describe("DEC-101: GATE CSE 1992–1989 Batch Answer Key Audit & Ingestion", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:559": { answer_uid: "manual:go:559", type: "MCQ", answer: "D", tolerance: null },
        "go:562": { answer_uid: "manual:go:562", type: "MSQ", answer: ["A", "D"], tolerance: null },
        "go:518": { answer_uid: "manual:go:518", type: "MCQ", answer: "A", tolerance: null },
        "go:528": { answer_uid: "manual:go:528", type: "MSQ", answer: ["B", "C", "D"], tolerance: null },
        "go:84051": { answer_uid: "manual:go:84051", type: "MCQ", answer: "B", tolerance: null },
        "go:84054": { answer_uid: "manual:go:84054", type: "MSQ", answer: ["B", "D"], tolerance: null },
        "go:87141": { answer_uid: "manual:go:87141", type: "MSQ", answer: ["A", "C"], tolerance: null },
        "go:540": { answer_uid: "manual:go:540", type: "SUBJECTIVE", answer: null, tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:1992:set1:main:q02-ix": { answer_uid: "manual:go:559", type: "MCQ", answer: "D", tolerance: null },
        "cse:1992:set1:main:q02-vii": { answer_uid: "manual:go:562", type: "MSQ", answer: ["A", "D"], tolerance: null },
        "cse:1991:set1:main:q03-iv": { answer_uid: "manual:go:518", type: "MCQ", answer: "A", tolerance: null },
        "cse:1991:set1:main:q03-xiv": { answer_uid: "manual:go:528", type: "MSQ", answer: ["B", "C", "D"], tolerance: null },
        "cse:1990:set1:main:q3-i": { answer_uid: "manual:go:84051", type: "MCQ", answer: "B", tolerance: null },
        "cse:1990:set1:main:q3-ii": { answer_uid: "manual:go:84054", type: "MSQ", answer: ["B", "D"], tolerance: null },
        "cse:1989:set1:main:q3-vii": { answer_uid: "manual:go:87141", type: "MSQ", answer: ["A", "C"], tolerance: null },
        "cse:1991:set1:main:q13": { answer_uid: "manual:go:540", type: "SUBJECTIVE", answer: null, tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:559 (1992 ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:559",
        link: "https://gateoverflow.in/559/gate1992-02-ix",
        title: "GATE CSE 1992 | Question: 02.ix",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:562 (1992 ingested) resolves MSQ ['A', 'D']", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:562",
        link: "https://gateoverflow.in/562/gate1992-02-vii",
        title: "GATE CSE 1992 | Question: 02.vii",
      });
      expect(answer).toMatchObject({
        type: "MSQ",
        answer: ["A", "D"],
      });
    });

    test("go:518 (1991 ingested) resolves MCQ Option A", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:518",
        link: "https://gateoverflow.in/518/gate1991-03-iv",
        title: "GATE CSE 1991 | Question: 03.iv",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "A",
      });
    });

    test("go:528 (1991 ingested) resolves MSQ ['B', 'C', 'D']", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:528",
        link: "https://gateoverflow.in/528/gate1991-03-xiv",
        title: "GATE CSE 1991 | Question: 03.xiv",
      });
      expect(answer).toMatchObject({
        type: "MSQ",
        answer: ["B", "C", "D"],
      });
    });

    test("go:84051 (1990 corrected) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:84051",
        link: "https://gateoverflow.in/84051/gate1990-3-i",
        title: "GATE CSE 1990 | Question: 3-i",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });

    test("go:84054 (1990 corrected) resolves MSQ ['B', 'D']", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:84054",
        link: "https://gateoverflow.in/84054/gate1990-3-ii",
        title: "GATE CSE 1990 | Question: 3-ii",
      });
      expect(answer).toMatchObject({
        type: "MSQ",
        answer: ["B", "D"],
      });
    });

    test("go:87141 (1989 ingested) resolves MSQ ['A', 'C']", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:87141",
        link: "https://gateoverflow.in/87141/gate1989-3-vii",
        title: "GATE CSE 1989 | Question: 3-vii",
      });
      expect(answer).toMatchObject({
        type: "MSQ",
        answer: ["A", "C"],
      });
    });

    test("go:540 (1991 corrected to SUBJECTIVE) resolves SUBJECTIVE null", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:540",
        link: "https://gateoverflow.in/540/gate-cse-1991-question-13",
        title: "GATE CSE 1991 | Question: 13",
      });
      expect(answer).toMatchObject({
        type: "SUBJECTIVE",
        answer: null,
      });
    });
  });

  describe("DEC-102: GATE CSE 1988 & 1987 Batch Answer Key Audit & Ingestion", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:91338": { answer_uid: "manual:go:91338", type: "SUBJECTIVE", answer: null, tolerance: null },
        "go:91687": { answer_uid: "manual:go:91687", type: "NAT", answer: 12, tolerance: { abs: 0.01 } },
        "go:94333": { answer_uid: "manual:go:94333", type: "NAT", answer: 10, tolerance: { abs: 0.01 } },
        "go:82656": { answer_uid: "manual:go:82656", type: "MCQ", answer: "D", tolerance: null },
        "go:80278": { answer_uid: "manual:go:80278", type: "MCQ", answer: "B", tolerance: null },
        "go:80281": { answer_uid: "manual:go:80281", type: "MCQ", answer: "C", tolerance: null },
        "go:80377": { answer_uid: "manual:go:80377", type: "MCQ", answer: "C", tolerance: null },
        "go:80559": { answer_uid: "manual:go:80559", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:1988:set1:main:q1iii": { answer_uid: "manual:go:91338", type: "SUBJECTIVE", answer: null, tolerance: null },
        "cse:1988:set1:main:q2-vi": { answer_uid: "manual:go:91687", type: "NAT", answer: 12, tolerance: { abs: 0.01 } },
        "cse:1988:set1:main:q2xv": { answer_uid: "manual:go:94333", type: "NAT", answer: 10, tolerance: { abs: 0.01 } },
        "cse:1987:set1:main:q15": { answer_uid: "manual:go:82656", type: "MCQ", answer: "D", tolerance: null },
        "cse:1987:set1:main:q1-ix": { answer_uid: "manual:go:80278", type: "MCQ", answer: "B", tolerance: null },
        "cse:1987:set1:main:q1-x": { answer_uid: "manual:go:80281", type: "MCQ", answer: "C", tolerance: null },
        "cse:1987:set1:main:q1-xxi": { answer_uid: "manual:go:80377", type: "MCQ", answer: "C", tolerance: null },
        "cse:1987:set1:main:q1-xxiv": { answer_uid: "manual:go:80559", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:91338 (1988 corrected to SUBJECTIVE) resolves SUBJECTIVE null", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:91338",
        link: "https://gateoverflow.in/91338/gate-cse-1988-question-1iii",
        title: "GATE CSE 1988 | Question: 1iii",
      });
      expect(answer).toMatchObject({
        type: "SUBJECTIVE",
        answer: null,
      });
    });

    test("go:91687 (1988 NAT) resolves NAT 12", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:91687",
        link: "https://gateoverflow.in/91687/gate-cse-1988-question-2-vi",
        title: "GATE CSE 1988 | Question: 2-vi",
      });
      expect(answer).toMatchObject({
        type: "NAT",
        answer: 12,
      });
    });

    test("go:94333 (1988 NAT) resolves NAT 10", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:94333",
        link: "https://gateoverflow.in/94333/gate-cse-1988-question-2xv",
        title: "GATE CSE 1988 | Question: 2xv",
      });
      expect(answer).toMatchObject({
        type: "NAT",
        answer: 10,
      });
    });

    test("go:82656 (1987 Q15 ingested) resolves MCQ Option D", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:82656",
        link: "https://gateoverflow.in/82656/gate1987-15a",
        title: "GATE CSE 1987 | Question: 15",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "D",
      });
    });

    test("go:80278 (1987 Q1-ix ingested) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:80278",
        link: "https://gateoverflow.in/80278/gate1987-1-ix",
        title: "GATE CSE 1987 | Question: 1-IX",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });

    test("go:80281 (1987 Q1-x ingested) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:80281",
        link: "https://gateoverflow.in/80281/gate1987-1-x",
        title: "GATE CSE 1987 | Question: 1-X",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:80377 (1987 Q1-xxi backfilled) resolves MCQ Option C", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:80377",
        link: "https://gateoverflow.in/80377/gate-cse-1987-question-1-xxi",
        title: "GATE CSE 1987 | Question: 1-xxi",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "C",
      });
    });

    test("go:80559 (1987 Q1-xxiv backfilled) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:80559",
        link: "https://gateoverflow.in/80559/gate-cse-1987-question-1-xxiv",
        title: "GATE CSE 1987 | Question: 1-xxiv",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });
  });

  describe("DEC-105: Verified Question Fixes (go:807)", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:807": { answer_uid: "manual:go:807", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:2002:set1:main:q1-3": { answer_uid: "manual:go:807", type: "MCQ", answer: "B", tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:807 (GATE CSE 2002 Q1.3) resolves MCQ Option B", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:807",
        exam_uid: "cse:2002:set1:main:q1-3",
        title: "GATE CSE 2002 | Question: 1.3",
      });
      expect(answer).toMatchObject({
        type: "MCQ",
        answer: "B",
      });
    });
  });

  describe("DEC-107: Verified Question Fixes (go:357500)", () => {
    beforeEach(() => {
      AnswerService.answersByQuestionUid = {
        "go:357500": { answer_uid: "manual:go:357500", type: "MSQ", answer: ["A", "C", "D"], tolerance: null },
      };
      AnswerService.answersByUid = {};
      AnswerService.answersByExamUid = {
        "cse:2021:set2:main:q40": { answer_uid: "manual:go:357500", type: "MSQ", answer: ["A", "C", "D"], tolerance: null },
      };
      AnswerService.unsupportedQuestionUids = new Set();
      AnswerService.loaded = true;
      AnswerService.loadError = "";
    });

    test("go:357500 (GATE CSE 2021 Set 2 Q40) resolves MSQ Options [A, C, D]", () => {
      const answer = AnswerService.getAnswerForQuestion({
        question_uid: "go:357500",
        exam_uid: "cse:2021:set2:main:q40",
        title: "GATE CSE 2021 Set 2 | Question: 40",
      });
      expect(answer).toMatchObject({
        type: "MSQ",
        answer: ["A", "C", "D"],
      });
    });
  });
});



