/**
 * src/utils/branchQuestionIdentity.js
 * ------------------------------------
 * Resolves the canonical examination identity, section, and display title
 * for branch questions (EC, EE, ME, CE), correcting historical PracticePaper sequence offsets.
 *
 * In modern GATE examinations (2011-2026, 65 questions):
 * - Questions 1-55: Technical Core Engineering
 * - Questions 56-65: General Aptitude (GA 1-10)
 */

export function resolveQuestionIdentity(branch, year, set, qNum, totalQuestions, rawQuestion = {}) {
  const isModern65 = totalQuestions === 65 && year >= 2011;
  const isGA = isModern65 && qNum >= 56 && qNum <= 65;

  if (isGA) {
    const gaNum = qNum - 55;
    const setPart = set ? `Set ${set} | ` : "";
    const setSuffix = set > 1 ? `-s${set}` : "";
    return {
      section: "ga",
      question_number: gaNum,
      title: `GATE ${branch.toUpperCase()} ${year} | ${setPart}GA | Question: ${gaNum}`,
      exam_uid: `${branch}:${year}:set${set || 1}:ga:q${gaNum}`,
      canonical_uid: `${branch}:${year}:ga:q${gaNum}${setSuffix}`,
    };
  }

  // Technical / Pre-2011 questions
  const setPart = set ? `Set ${set} | ` : "";
  const setSuffix = set > 1 ? `-s${set}` : "";
  return {
    section: "main",
    question_number: qNum,
    title: `GATE ${branch.toUpperCase()} ${year} | ${setPart}Question: ${qNum}`,
    exam_uid: `${branch}:${year}:set${set || 1}:main:q${qNum}`,
    canonical_uid: `${branch}:${year}:q${qNum}${setSuffix}`,
  };
}

export function normalizeBranchQuestionUid(rawUid = "") {
  if (!rawUid || typeof rawUid !== "string") return rawUid;
  const match = rawUid.match(/^pp:([a-z]+):(\d+):q(\d+)(?:-s(\d+))?/i);
  if (!match) return rawUid;
  const [, branch, yearStr, qNumStr, setStr = "1"] = match;
  const year = Number(yearStr);
  const qNum = Number(qNumStr);
  const set = Number(setStr);
  const identity = resolveQuestionIdentity(branch.toLowerCase(), year, set, qNum, 65);
  return identity.canonical_uid;
}

export default resolveQuestionIdentity;
