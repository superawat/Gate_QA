import { describe, expect, it } from "vitest";
import {
  buildQuestionLLMPrompt,
  htmlToCleanText,
  extractFormattedOptions,
} from "./llmPromptBuilder";

describe("llmPromptBuilder", () => {
  describe("htmlToCleanText", () => {
    it("converts HTML breaks and paragraph tags into newlines", () => {
      const html = "<p>First paragraph.</p><p>Second line<br>with break.</p>";
      const clean = htmlToCleanText(html);
      expect(clean).toContain("First paragraph.\n\nSecond line\nwith break.");
    });

    it("decodes HTML entities and numeric codes", () => {
      const html = "Let &alpha; &le; 10 &amp; &beta; &gt; 5 &times; 2";
      const clean = htmlToCleanText(html);
      expect(clean).toBe("Let α ≤ 10 & β > 5 × 2");
    });

    it("preserves LaTeX math expressions", () => {
      const html = "<p>Consider the matrix $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$.</p>";
      const clean = htmlToCleanText(html);
      expect(clean).toContain("Consider the matrix $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$.");
    });
  });

  describe("extractFormattedOptions", () => {
    it("extracts options from normalizedOptions array", () => {
      const question = {
        normalizedOptions: [
          { label: "A", text: "Bubble Sort" },
          { label: "B", text: "Merge Sort" },
          { label: "C", text: "Quick Sort" },
          { label: "D", text: "Heap Sort" },
        ],
      };
      const options = extractFormattedOptions(question);
      expect(options).toEqual([
        "(A) Bubble Sort",
        "(B) Merge Sort",
        "(C) Quick Sort",
        "(D) Heap Sort",
      ]);
    });

    it("extracts options from raw options array or object", () => {
      const question = {
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      };
      const options = extractFormattedOptions(question);
      expect(options).toEqual([
        "(A) Option 1",
        "(B) Option 2",
        "(C) Option 3",
        "(D) Option 4",
      ]);
    });
  });

  describe("buildQuestionLLMPrompt", () => {
    it("builds a full pedagogical prompt for MCQ question with options and metadata", () => {
      const question = {
        question_uid: "cse:2024:set1:q12",
        title: "GATE CSE 2024 Set 1 | Question: 12",
        question: "<p>Which of the following sorting algorithms has worst-case time complexity of $\\mathcal{O}(n \\log n)$?</p>",
        normalizedOptions: [
          { label: "A", text: "Quick Sort" },
          { label: "B", text: "Merge Sort" },
          { label: "C", text: "Bubble Sort" },
          { label: "D", text: "Selection Sort" },
        ],
        type: "MCQ",
        yearSetLabel: "GATE CSE 2024 Set 1",
        subjectLabel: "Algorithms",
        answer_meta: {
          type: "MCQ",
          marks: 2,
        },
      };

      const prompt = buildQuestionLLMPrompt(question);

      expect(prompt).toContain("You are helping a student understand a GATE question.");
      expect(prompt).toContain("Requirements:");
      expect(prompt).toContain("Exam: GATE CSE 2024 Set 1");
      expect(prompt).toContain("Subject: Algorithms");
      expect(prompt).toContain("Question Type: MCQ");
      expect(prompt).toContain("Marks: 2 Marks");
      expect(prompt).toContain("Question:\nWhich of the following sorting algorithms has worst-case time complexity of $\\mathcal{O}(n \\log n)$?");
      expect(prompt).toContain("Options:\n(A) Quick Sort\n(B) Merge Sort\n(C) Bubble Sort\n(D) Selection Sort");
    });

    it("omits options section for NAT questions", () => {
      const natQuestion = {
        question_uid: "go:1767",
        question: "<p>The number of memory cycles required is ______.</p>",
        type: "NAT",
        yearSetLabel: "GATE CSE 2014 Set 1",
        subjectLabel: "Computer Organization",
        answer_meta: {
          type: "NAT",
          marks: 1,
        },
      };

      const prompt = buildQuestionLLMPrompt(natQuestion);
      expect(prompt).toContain("Question Type: NAT");
      expect(prompt).toContain("Marks: 1 Mark");
      expect(prompt).toContain("The number of memory cycles required is ______.");
      expect(prompt).not.toContain("Options:");
    });

    it("handles empty or malformed question safely", () => {
      expect(buildQuestionLLMPrompt(null as any)).toBe("");
      expect(buildQuestionLLMPrompt({} as any)).toContain("You are helping a student understand a GATE question.");
    });
  });
});
