import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = path.join(root, "public/data/aptitude/english/idioms.json");
const outputPath = path.join(root, "data/solutions/chunks/aptitude/chunk-apt-idioms-01.json");

function decodeEntities(value) {
  const named = {
    amp: "&",
    nbsp: " ",
    quot: '"',
    apos: "'",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    mdash: "—",
    ndash: "–",
    hellip: "…",
  };

  return value
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (match, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (match, number) => String.fromCodePoint(parseInt(number, 16)));
}

function toPlainText(html) {
  return decodeEntities(
    String(html ?? "")
      .replace(/\\[rnt]/g, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<\/(?:p|li|div|h[1-6])\s*>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractOptions(html) {
  return [...String(html ?? "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) =>
    toPlainText(match[1]),
  );
}

function makeSolution(question, options) {
  const answerIndex = question.answer.charCodeAt(0) - 65;
  const answerText = options[answerIndex];
  const optionLines = options
    .map((option, index) => ({ option, label: String.fromCharCode(65 + index) }))
    .filter((item) => item.label !== question.answer)
    .map(({ label, option }) => `Option ${label} (“${option}”)`)
    .join("; ");
  const promptHtml = String(question.questionHtml ?? "").split(/<(?:ol|ul)\b/i)[0];
  const prompt = toPlainText(promptHtml).replace(/^\d+\s*[.)]\s*/, "");
  const isReplacement = /(?:idiom|phrase).{0,100}(?:substitut|replac)|(?:substitut|replac).{0,100}(?:idiom|phrase)|idiom for the underlined/i.test(prompt);
  const asksForExpression = /which.{0,100}(?:idiom|phrase).{0,100}(?:means|expresses)|(?:idiom|phrase).{0,100}(?:means|expresses).{0,100}(?:following|given)|which idiom means/i.test(prompt);

  let reasoning;

  if (question.uid === "APT-ENG-8573") {
    return [
      "**Reasoning:** Option A (“To show indifference”) is the closest available choice, but it is imprecise: the idiom more specifically means to criticize or discourage someone’s idea or plan. The other choices—rinsing, encouraging, or talking nicely—do not express that sense.",
      "**Answer: Option A — closest available choice; the wording is approximate.**",
    ].join("\n\n");
  }

  if (isReplacement) {
    reasoning = `The replacement must preserve the underlined idea and fit the sentence. “${answerText}” is the fixed expression that conveys that idea here. ${optionLines} are different expressions and would change the meaning.`;
  } else if (asksForExpression) {
    reasoning = `The prompt supplies the intended sense and asks for the matching idiom. “${answerText}” is the conventional expression for that sense; read it as a fixed phrase rather than word by word. ${optionLines} do not express the required meaning.`;
  } else {
    reasoning = `The expression in the prompt has a conventional figurative meaning; it is not interpreted word by word. Option ${question.answer} (“${answerText}”) states that meaning. ${optionLines} do not match the idiom as it is used here.`;
  }

  return [
    `**Reasoning:** ${reasoning}`,
    `**Answer: Option ${question.answer} — “${answerText}.”**`,
  ].join("\n\n");
}

const questions = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const solutions = {};
const problems = [];

for (const question of questions) {
  const options = extractOptions(question.questionHtml);
  const answerIndex = typeof question.answer === "string" ? question.answer.charCodeAt(0) - 65 : -1;

  if (!question.uid || Object.hasOwn(solutions, question.uid)) {
    problems.push(`${question.uid || "<missing uid>"}: missing or duplicate UID`);
  } else if (options.length !== 4) {
    problems.push(`${question.uid}: expected four options, found ${options.length}`);
  } else if (answerIndex < 0 || answerIndex >= options.length || !options[answerIndex]) {
    problems.push(`${question.uid}: answer key does not select a non-empty option`);
  } else {
    solutions[question.uid] = makeSolution(question, options);
  }
}

if (problems.length) {
  console.error(`Refusing to write solutions; ${problems.length} source issue(s):`);
  console.error(problems.join("\n"));
  process.exit(1);
}

fs.writeFileSync(outputPath, `${JSON.stringify(solutions, null, 2)}\n`, "utf8");
console.log(`Wrote ${Object.keys(solutions).length} keyed idiom solutions to ${path.relative(root, outputPath)}.`);
