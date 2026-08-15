import { getDisplayQuestionTypeLabel } from "./questionType";
import { stripEmbeddedOptions } from "./stripEmbeddedOptions";

export interface QuestionLike {
  question_uid?: string;
  id?: string | number;
  title?: string;
  question?: string;
  options?: any;
  normalizedOptions?: Array<{ label?: string; text?: string; html?: string }>;
  answer_meta?: {
    type?: string;
    marks?: number | string;
    mark?: number | string;
    answer?: any;
  };
  answerMeta?: {
    type?: string;
    marks?: number | string;
    mark?: number | string;
    answer?: any;
  };
  type?: string;
  subject?: string;
  subjectLabel?: string;
  year?: number | string;
  yearSetLabel?: string;
  exam?: {
    year?: number | string;
    paper?: string;
    set?: number | string;
  };
  tags?: string[];
  [key: string]: any;
}

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&#160;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&times;": "×",
  "&plusmn;": "±",
  "&le;": "≤",
  "&ge;": "≥",
  "&ne;": "≠",
  "&approx;": "≈",
  "&isin;": "∈",
  "&notin;": "∉",
  "&sub;": "⊂",
  "&sup;": "⊃",
  "&cup;": "∪",
  "&cap;": "∩",
  "&empty;": "∅",
  "&prop;": "∝",
  "&infin;": "∞",
  "&ang;": "∠",
  "&there4;": "∴",
  "&sdot;": "⋅",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&delta;": "δ",
  "&epsilon;": "ε",
  "&theta;": "θ",
  "&lambda;": "λ",
  "&mu;": "μ",
  "&pi;": "π",
  "&sigma;": "σ",
  "&tau;": "τ",
  "&phi;": "φ",
  "&omega;": "ω",
};

/**
 * Converts rich HTML / Math / LaTeX question bodies to clean, readable plain-text for LLMs.
 * Preserves structural newlines, math tokens ($...$, $$...$$, \(...\), \[...\]), and entity characters.
 */
export function htmlToCleanText(rawHtml: string = ""): string {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "";
  }

  let text = rawHtml;

  // 1. Replace structural line breaks with actual newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<li\b[^>]*>/gi, "• ");

  // 2. Decode entities
  for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
    text = text.split(entity).join(replacement);
  }
  // Decode decimal & hex numeric entities
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // 3. Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // 4. Normalize multiple spaces and excess blank lines while preserving paragraph spacing
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

/**
 * Extracts and formats normalized options from question object.
 */
export function extractFormattedOptions(question: QuestionLike): string[] {
  const optionsList: string[] = [];

  // Check normalizedOptions array first
  if (Array.isArray(question.normalizedOptions) && question.normalizedOptions.length > 0) {
    for (const opt of question.normalizedOptions) {
      const label = (opt.label || "").trim().toUpperCase();
      const content = htmlToCleanText(opt.text || opt.html || "");
      if (label && content) {
        optionsList.push(`(${label}) ${content}`);
      }
    }
    if (optionsList.length > 0) {
      return optionsList;
    }
  }

  // Check raw question.options
  const rawOptions = question.options;
  if (Array.isArray(rawOptions) && rawOptions.length > 0) {
    const labels = ["A", "B", "C", "D", "E"];
    rawOptions.forEach((opt, idx) => {
      const label = typeof opt === "object" && opt !== null ? (opt.label || opt.key || labels[idx]) : labels[idx];
      const rawText = typeof opt === "object" && opt !== null ? (opt.text || opt.html || opt.value || "") : opt;
      const content = htmlToCleanText(String(rawText || ""));
      if (label && content) {
        optionsList.push(`(${String(label).toUpperCase()}) ${content}`);
      }
    });
    if (optionsList.length > 0) {
      return optionsList;
    }
  } else if (rawOptions && typeof rawOptions === "object") {
    const sortedKeys = ["A", "B", "C", "D", "E"].filter((k) => Object.prototype.hasOwnProperty.call(rawOptions, k));
    const keysToUse = sortedKeys.length > 0 ? sortedKeys : Object.keys(rawOptions);
    for (const key of keysToUse) {
      const content = htmlToCleanText(String(rawOptions[key] || ""));
      if (content) {
        optionsList.push(`(${key.toUpperCase()}) ${content}`);
      }
    }
  }

  return optionsList;
}

/**
 * Builds the standardized GATE explanation prompt for an external LLM.
 */
export function buildQuestionLLMPrompt(question: QuestionLike): string {
  if (!question || typeof question !== "object") {
    return "";
  }

  const rawQuestionHtml = question.question || "";
  // Strip embedded HTML options from the question stem if options are rendered separately
  const stemHtml = stripEmbeddedOptions(rawQuestionHtml) || rawQuestionHtml;
  const questionText = htmlToCleanText(stemHtml);

  const questionType = getDisplayQuestionTypeLabel(question as any);
  const isNat = questionType === "NAT";

  const options = !isNat ? extractFormattedOptions(question) : [];

  // Metadata
  const examLabel = question.yearSetLabel || (question.year ? `GATE ${question.year}` : "") || (question.exam?.year ? `GATE ${question.exam.year}` : "");
  const subjectLabel = question.subjectLabel || question.subject || "";
  const marks = question.answer_meta?.marks || question.answer_meta?.mark || question.answerMeta?.marks || question.answerMeta?.mark;
  const marksLabel = marks ? `${marks} ${Number(marks) === 1 ? "Mark" : "Marks"}` : "";

  // Prompt Construction
  const sections: string[] = [];

  // 1. Pedagogical Instructions
  sections.push(`You are helping a student understand a GATE question.

Explain the following question step by step.

Requirements:
- Explain the underlying concept first.
- Show the reasoning process clearly.
- Solve the question systematically.
- For MCQ/MSQ, explain why the correct option(s) are correct and why the other options are incorrect when useful.
- For NAT questions, show the calculation and final numerical answer.
- Follow the conventions and level expected in GATE.
- Do not assume information that is not present in the question.
- If the question involves a technical concept, explain it in a concise and educational way.
- Clearly state the final answer at the end.`);

  // 2. Metadata (if available)
  const metaLines: string[] = [];
  if (examLabel) metaLines.push(`Exam: ${examLabel}`);
  if (subjectLabel) metaLines.push(`Subject: ${subjectLabel}`);
  if (questionType) metaLines.push(`Question Type: ${questionType}`);
  if (marksLabel) metaLines.push(`Marks: ${marksLabel}`);

  if (metaLines.length > 0) {
    sections.push(`Context:\n${metaLines.join("\n")}`);
  }

  // 3. Question Body
  sections.push(`Question:\n${questionText}`);

  // 4. Options Body (if present)
  if (options.length > 0) {
    sections.push(`Options:\n${options.join("\n")}`);
  }

  return sections.join("\n\n");
}
