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

function getSampleAptitudeQuestion() {
  const aptitudePath = path.resolve(__dirname, "../../public/aptitude-search-index.json");
  const payload = JSON.parse(fs.readFileSync(aptitudePath, "utf8"));
  const rows = Array.isArray(payload) ? payload : payload.questions;
  const sample = Array.isArray(rows)
    ? rows.find((question) => question && String(question.uid || question.u || "").startsWith("APT-"))
    : null;
  if (!sample) {
    throw new Error("No APT-* question found in public/aptitude-search-index.json.");
  }
  return { ...sample, uid: sample.uid || sample.u };
}

module.exports = {
  getSampleAptitudeQuestion,
  getSampleQuestion,
};
