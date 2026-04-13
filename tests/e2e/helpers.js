const fs = require("node:fs");
const path = require("node:path");

function readSearchIndex() {
  const indexPath = path.resolve(__dirname, "../../public/question-search-index.json");
  const raw = fs.readFileSync(indexPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function getSampleQuestion() {
  const questions = readSearchIndex();
  const sample = questions.find(
    (question) => question && typeof question === "object" && String(question.question_uid || "").trim()
  );
  if (!sample) {
    throw new Error("No question_uid found in public/question-search-index.json.");
  }
  return sample;
}

module.exports = {
  getSampleQuestion,
};
