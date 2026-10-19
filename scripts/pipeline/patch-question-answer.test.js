import { describe, expect, test } from "vitest";
import { parseArgs, patchQuestionAnswer } from "./patch-question-answer.mjs";

describe("patch-question-answer CLI and utility", () => {
  test("parseArgs parses all flags correctly", () => {
    const args = [
      "--uid", "isro:cs:2025:q5",
      "--answer", "D",
      "--type", "MCQ",
      "--tolerance", '{"abs": 0.01}',
      "--exam-uid", "isro-2025-q5",
      "--note", "test_note",
      "--solution", "### Derivation",
      "--concept", "Planar Graphs",
      "--rebuild",
      "--dry-run",
    ];

    const parsed = parseArgs(args);
    expect(parsed.uid).toBe("isro:cs:2025:q5");
    expect(parsed.answer).toBe("D");
    expect(parsed.type).toBe("MCQ");
    expect(parsed.tolerance).toEqual({ abs: 0.01 });
    expect(parsed.examUid).toBe("isro-2025-q5");
    expect(parsed.note).toBe("test_note");
    expect(parsed.solution).toBe("### Derivation");
    expect(parsed.concept).toBe("Planar Graphs");
    expect(parsed.rebuild).toBe(true);
    expect(parsed.dryRun).toBe(true);
  });

  test("parseArgs handles MSQ array, numeric NAT, and defective null", () => {
    const msq = parseArgs(["--uid", "go:123", "--type", "MSQ", "--answer", '["A", "C"]']);
    expect(msq.answer).toEqual(["A", "C"]);

    const nat = parseArgs(["--uid", "go:456", "--type", "NAT", "--answer", "69.5"]);
    expect(nat.answer).toBe(69.5);

    const defective = parseArgs(["--uid", "go:789", "--answer", "null", "--defective-reason", "broken"]);
    expect(defective.answer).toBeNull();
    expect(defective.defectiveReason).toBe("broken");
  });

  test("patchQuestionAnswer dry-run executes cleanly and detects ISRO files", () => {
    const result = patchQuestionAnswer({
      uid: "isro:cs:2025:q5",
      answer: "D",
      type: "MCQ",
      dryRun: true,
    });

    expect(result.uid).toBe("isro:cs:2025:q5");
    expect(result.answer).toBe("D");
    expect(result.type).toBe("MCQ");
    expect(result.examUid).toBe("isro-2025-q5");
    expect(result.modifiedFiles).toContain("data/answers/manual-answers-patch-v1.json");
    expect(result.modifiedFiles).toContain("data/answers/answers_by_question_uid_v1.json");
    expect(result.modifiedFiles).toContain("public/data/answers/answers_by_question_uid_v1.json");
    expect(result.modifiedFiles).toContain("data/isro/answers-isro.json");
    expect(result.modifiedFiles).toContain("data/isro/isro-2025.json");
    expect(result.modifiedFiles).toContain("data/isro/isro-all.json");
  });

  test("patchQuestionAnswer dry-run executes cleanly for GATE CSE questions", () => {
    const result = patchQuestionAnswer({
      uid: "go:422811",
      answer: "D",
      type: "MCQ",
      dryRun: true,
    });

    expect(result.uid).toBe("go:422811");
    expect(result.answer).toBe("D");
    expect(result.type).toBe("MCQ");
    expect(result.modifiedFiles).toContain("data/answers/manual-answers-patch-v1.json");
    expect(result.modifiedFiles).toContain("public/questions-with-answers.json");
  });
});
