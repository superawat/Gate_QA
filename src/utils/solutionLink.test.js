import { describe, expect, it } from "vitest";
import {
  getBranchGateOverflowBaseHost,
  getGateOverflowSearchUrl,
  getGateOverflowSolutionLink,
  getQuestionBranch,
  getQuestionSolutionLink,
  getSpecialAptitudeSolutionLink,
  isSpecialAptitudeQuestion,
} from "./solutionLink";

describe("isSpecialAptitudeQuestion", () => {
  it("identifies Special Aptitude questions by UID prefix", () => {
    expect(isSpecialAptitudeQuestion({ question_uid: "APT-ENG-5840" })).toBe(true);
    expect(isSpecialAptitudeQuestion({ uid: "APT-QNT-3498" })).toBe(true);
    expect(isSpecialAptitudeQuestion({ id: "APT:RSN-001" })).toBe(true);
    expect(isSpecialAptitudeQuestion({ canonical: { questionUid: "apt:123" } })).toBe(true);
  });

  it("identifies Special Aptitude questions by exam paper or source metadata", () => {
    expect(isSpecialAptitudeQuestion({ exam: { paper: "Aptitude" } })).toBe(true);
    expect(isSpecialAptitudeQuestion({ _source: { sourceKind: "aptitude-web" } })).toBe(true);
    expect(isSpecialAptitudeQuestion({ answerMeta: { source: "aptitude_embedded" } })).toBe(true);
  });

  it("returns false for regular GATE CSE, DA, and GATE General Aptitude questions", () => {
    expect(isSpecialAptitudeQuestion({
      question_uid: "go:523089",
      title: "GATE CSE 2026 | Set 1 | GA | Question: 1",
      exam: { paper: "CSE" },
      subjectLabel: "General Aptitude",
    })).toBe(false);

    expect(isSpecialAptitudeQuestion({
      question_uid: "da:2026:ga:1",
      title: "GATE DA 2026 | GA | Question: 1",
      exam: { paper: "DA" },
      subjectLabel: "General Aptitude",
    })).toBe(false);

    expect(isSpecialAptitudeQuestion({
      question_uid: "go:1767",
      title: "GATE CSE 2014 Set 1 | Question: 9",
      exam: { paper: "CSE" },
    })).toBe(false);

    expect(isSpecialAptitudeQuestion({})).toBe(false);
  });
});

describe("getSpecialAptitudeSolutionLink", () => {
  it("returns blank for questions with internal or missing links", () => {
    expect(
      getSpecialAptitudeSolutionLink({
        question_uid: "APT-ENG-5840",
        link: "https://aptitude-bank.internal/play#paper-f2d72e1ee0a6815c",
      })
    ).toBe("");

    expect(
      getSpecialAptitudeSolutionLink({
        question_uid: "APT-QNT-3498",
      })
    ).toBe("");
  });

  it("returns a valid external public solution link when available", () => {
    expect(
      getSpecialAptitudeSolutionLink({
        question_uid: "APT-ENG-001",
        solution_link: "https://example.com/solutions/apt-eng-001",
      })
    ).toBe("https://example.com/solutions/apt-eng-001");
  });

  it("accepts valid GateOverflow question links if explicitly present but rejects non-question pages", () => {
    expect(
      getSpecialAptitudeSolutionLink({
        question_uid: "APT-ENG-001",
        solution_link: "https://gateoverflow.in/12345/aptitude-question",
      })
    ).toBe("https://gateoverflow.in/12345/aptitude-question");

    expect(
      getSpecialAptitudeSolutionLink({
        question_uid: "APT-ENG-001",
        solution_link: "https://gateoverflow.in/marks-distribution",
      })
    ).toBe("");
  });
});

describe("getQuestionSolutionLink", () => {
  it("routes Special Aptitude questions through Special Aptitude validation", () => {
    // Special Aptitude without valid link -> empty string
    expect(
      getQuestionSolutionLink({
        question_uid: "APT-ENG-5840",
        title: "English Practice",
        link: "https://aptitude-bank.internal/play#paper-123",
      })
    ).toBe("");

    // Special Aptitude with valid external link -> returns external link
    expect(
      getQuestionSolutionLink({
        question_uid: "APT-QNT-3498",
        solution_link: "https://solutions.external.org/qnt-3498",
      })
    ).toBe("https://solutions.external.org/qnt-3498");
  });

  it("routes regular GATE questions to GateOverflow solution link extractor", () => {
    expect(
      getQuestionSolutionLink({
        question_uid: "go:523089",
        link: "https://gateoverflow.in/523089/gate-cse-2026-set-1-ga-question-1",
      })
    ).toBe("https://gateoverflow.in/523089/gate-cse-2026-set-1-ga-question-1");
  });
});

describe("getGateOverflowSolutionLink", () => {
  it("prefers the GateOverflow reference link over a PracticePaper source link", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://practicepaper.in/gate-da/gate-da-2024?page_no=1#q1",
        reference_link: "https://gateoverflow.in/422961/gate-ds%26ai-2024-question-1#a_list",
      })
    ).toBe("https://gateoverflow.in/422961/gate-ds%26ai-2024-question-1#a_list");
  });

  it("uses a GateOverflow question link when no separate reference exists", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://gateoverflow.in/523089/gate-cse-2026-question-1",
      })
    ).toBe("https://gateoverflow.in/523089/gate-cse-2026-question-1");
  });

  it("returns blank for PracticePaper or missing solution links", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://practicepaper.in/gate-da/gate-da-2024?page_no=1#q1",
      })
    ).toBe("");
    expect(getGateOverflowSolutionLink({})).toBe("");
  });

  it("rejects GateOverflow non-question pages", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://gateoverflow.in/marks-distribution",
      })
    ).toBe("");
  });

  it("accepts and normalizes branch subdomain URLs and .com domains", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://me.gateoverflow.in/1720/gate-me-2020-question-1",
      })
    ).toBe("https://me.gateoverflow.in/1720/gate-me-2020-question-1");

    expect(
      getGateOverflowSolutionLink({
        reference_link: "http://ee.gateoverflow.com/4567/gate-ee-2019-question-2",
      })
    ).toBe("https://ee.gateoverflow.in/4567/gate-ee-2019-question-2");
  });
});

describe("Branch detection and GateOverflow search URLs", () => {
  it("detects branch correctly from track, branch, question_uid, or title", () => {
    expect(getQuestionBranch({ track: "me" })).toBe("me");
    expect(getQuestionBranch({ source_branch: "ee" })).toBe("ee");
    expect(getQuestionBranch({ question_uid: "pp:ec:2021:q5" })).toBe("ec");
    expect(getQuestionBranch({ exam_uid: "ce:2018:set1:q2" })).toBe("ce");
    expect(getQuestionBranch({ title: "GATE IN 2020 | Question 1" })).toBe("in");
    expect(getQuestionBranch({ title: "GATE Chemical 2020" })).toBe("ch");
    expect(getQuestionBranch({ track: "cse" })).toBe("cse");
    expect(getQuestionBranch({ track: "da" })).toBe("da");
    expect(getQuestionBranch({})).toBe("cse");
  });

  it("maps engineering branches to official GateOverflow base hosts", () => {
    expect(getBranchGateOverflowBaseHost("me")).toBe("https://me.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("ee")).toBe("https://ee.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("ec")).toBe("https://ec.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("ce")).toBe("https://civil.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("in")).toBe("https://in.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("ch")).toBe("https://ch.gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("cse")).toBe("https://gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("da")).toBe("https://gateoverflow.in");
    expect(getBranchGateOverflowBaseHost("")).toBe("https://gateoverflow.in");
  });

  it("builds clean branch-specific search URLs", () => {
    expect(
      getGateOverflowSearchUrl({
        title: "GATE ME 2020 | Set 1 | Question: 1",
        track: "me",
      })
    ).toBe("https://me.gateoverflow.in/?qa=search&q=GATE%20ME%202020%20Set%201%20Question%201");

    expect(
      getGateOverflowSearchUrl({
        title: "GATE EE 2019 | Question: 14",
        track: "ee",
      })
    ).toBe("https://ee.gateoverflow.in/?qa=search&q=GATE%20EE%202019%20Question%2014");

    expect(
      getGateOverflowSearchUrl({
        title: "GATE CE 2018 | Question: 2",
        track: "ce",
      })
    ).toBe("https://civil.gateoverflow.in/?qa=search&q=GATE%20CE%202018%20Question%202");

    expect(
      getGateOverflowSearchUrl({
        title: "GATE EC 2021 | Question: 5",
        track: "ec",
      })
    ).toBe("https://ec.gateoverflow.in/?qa=search&q=GATE%20EC%202021%20Question%205");

    expect(
      getGateOverflowSearchUrl({
        year: "2020",
        qNum: "1",
        track: "me",
      })
    ).toBe("https://me.gateoverflow.in/?qa=search&q=GATE%20ME%202020%20Question%201");
  });
});

