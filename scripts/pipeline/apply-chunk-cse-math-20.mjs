import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-MATH-20";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-math-20.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

function solution(concept, lines) {
  return { concept, markdown: lines.join("\n"), images: [] };
}

export const CHUNK_CSE_MATH_20_SOLUTIONS = {
  "go:84841": solution("Combinatorics - multiset permutations", [
    "There are 15 positions, with five indistinguishable copies of each letter. If all 15 letters were distinct, there would be $15!$ orders. Permuting the five A's among themselves, the five B's, or the five C's does not change the row, so divide by $(5!)^3$:",
    "",
    "$$\\frac{15!}{5!\\,5!\\,5!}=\\frac{15!}{(5!)^3}.$$",
    "",
    "**Therefore, the correct answer is Option A.**"
  ]),
  "go:84861": solution("Propositional logic - checking validity by counterexample", [
    "Use $X\\Rightarrow Y\\equiv\\neg X\\vee Y$.",
    "",
    "- **A is valid:** if $P\\Rightarrow Q$ and $Q\\Rightarrow R$, then whenever $P$ is true, $Q$ and then $R$ are true. This is transitivity.",
    "- **B is invalid:** with $P=F,Q=T$, $P\\Rightarrow Q$ is true but $\\neg P\\Rightarrow\\neg Q$ is false.",
    "- **C is invalid:** with $P=T,Q=F$, its antecedent $P\\wedge(\\neg P\\vee\\neg Q)$ is true while its conclusion $Q$ is false.",
    "- **D is invalid:** with $P=T,Q=F,R=F$, the left disjunction is true, but $(P\\vee Q)\\Rightarrow R$ is false.",
    "",
    "**Therefore, the only valid formula is Option A.**"
  ]),
  "go:85384": solution("Graph theory - Kuratowski's planarity theorem", [
    "Kuratowski's theorem says that a finite graph is planar exactly when it contains no subgraph that is a subdivision (a graph homeomorphic) of $K_5$ or $K_{3,3}$. The two obstructions are joined by **or**, and subdivisions must be excluded; merely checking for an isomorphic copy is insufficient.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:87126": solution("Propositional logic - equivalent forms of implication", [
    "An implication has the equivalent forms",
    "",
    "$$P\\rightarrow Q\\equiv\\neg P\\vee Q\\equiv\\neg Q\\rightarrow\\neg P.$$",
    "",
    "Thus A, B, and C have the same truth value for every assignment. D, $\\neg Q\\rightarrow P$, is not equivalent: for $P=T,Q=F$, it is true while $P\\rightarrow Q$ is false.",
    "",
    "**Therefore, the correct answers are Options A, B, and C.**"
  ]),
  "go:80379": solution("Calculus - real root of an odd-degree real polynomial", [
    "The polynomial is continuous and has real coefficients. Its degree is 7 with positive leading coefficient, so",
    "",
    "$$f(x)\\to-\\infty\\quad(x\\to-\\infty),\\qquad f(x)\\to+\\infty\\quad(x\\to+\\infty).$$",
    "",
    "By the intermediate value theorem, $f$ must equal zero for some real $x$. Equivalently, non-real roots of a real polynomial occur in conjugate pairs, so an odd total degree (counting multiplicity) requires at least one real root. In option A, “complex roots” is understood in the usual real-versus-non-real contrast; it cannot mean merely roots in $\\mathbb C$, which would include every real root.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:80380": solution("Linear algebra - singularity and linear dependence", [
    "A square matrix is singular exactly when its determinant is zero, equivalently when its rank is less than its order. That happens exactly when its rows are linearly dependent (and, equivalently, its columns are linearly dependent).",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:80583": solution("Relations - union of equivalence relations", [
    "The statement is false in general. On $S=\\{a,b,c\\}$, let $R_1$ have equivalence classes $\\{a,b\\},\\{c\\}$ and let $R_2$ have classes $\\{a\\},\\{b,c\\}$. Each relation is reflexive, symmetric, and transitive.",
    "",
    "Their union contains $(a,b)$ and $(b,c)$ but not $(a,c)$, so it is not transitive and therefore is not an equivalence relation. The existing true/false answer record encodes False as NAT $0$.",
    "",
    "**Therefore, the numerical answer is 0 (False).**"
  ])
};

const HOLD_REASONS = {
  "go:87141": "The stored MSQ key is [A,C], but option D is also false: the interval spanning every three arrivals is the sum of three independent exponential inter-arrival times, which has an Erlang (Gamma shape 3) distribution, not an exponential distribution. Keep the existing key unchanged and hold this solution until the source key is reconciled.",
  "go:80571": "The sign-change theorem requires continuity on the interval. The displayed stem does not state continuity, so the stored Option A is not guaranteed as written; the source discussion also notes A is conditional on continuity. Keep the answer key unchanged and hold this solution pending a stem/source decision."
};

const NOTES = {
  "go:84841": "The multinomial coefficient counts arrangements of five identical A's, five identical B's, and five identical C's.",
  "go:84861": "A is implication transitivity; explicit assignments disprove B, C, and D.",
  "go:85384": "Kuratowski's theorem uses a subdivision of K5 or K3,3, matching D.",
  "go:87126": "A, B, and C are the implication and contrapositive equivalences; D fails at P=true, Q=false.",
  "go:87141": "Independent check finds option D false as well: the sum of three exponential gaps is Erlang, so the existing [A,C] answer conflicts with the stem.",
  "go:80379": "A degree-seven real polynomial has a real zero by odd-degree end behavior and continuity; source key B agrees.",
  "go:80380": "A square matrix is singular iff its rows (equivalently columns) are dependent; source key C agrees.",
  "go:80571": "A sign change guarantees a root only with continuity; that hypothesis is absent from the displayed stem.",
  "go:80583": "Two equivalence relations from crossing partitions of {a,b,c} have a non-transitive union; False is encoded as NAT 0 in the existing UID record."
};

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8"); }

function review() {
  const chunk = readJson(CHUNK);
  const answers = readJson(ANSWERS).records_by_question_uid;
  let accepted = 0;
  let held = 0;
  for (const question of chunk.questions) {
    const answerRecord = answers[question.uid];
    if (!answerRecord) throw new Error("Missing existing answer record for " + question.uid);
    const isUnknown = question.officialAnswer === "UNKNOWN";
    if (!isUnknown && JSON.stringify(answerRecord.answer) !== JSON.stringify(question.officialAnswer)) {
      throw new Error("Existing answer record mismatch for " + question.uid);
    }
    question.review = {
      reviewer: "Codex",
      reviewedAt: DATE,
      identityVerified: true,
      stemOptionsAndDiagramChecked: true,
      sourceUrl: question.goLink,
      researchLinks: [{ url: question.goLink, accessedAt: DATE }],
      independentCheck: NOTES[question.uid],
      notes: NOTES[question.uid]
    };
    if (HOLD_REASONS[question.uid]) {
      question.status = "HOLD";
      question.specialCategory = "HOLD";
      question.review.disposition = "HOLD";
      question.review.answerKeySource = "Existing UID answer record and source stem; an independent check found an unresolved stem/key issue.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = question.uid === "go:87141" ? "SOURCE_CONFLICT" : "INSUFFICIENT_STEM";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_MATH_20_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
    question.status = "ACCEPTED";
    delete question.specialCategory;
    question.review.disposition = "ACCEPTED";
    question.review.answerKeySource = isUnknown
      ? "Existing UID answer record cross-checked against the displayed true/false stem and independent counterexample derivation; no answer key changed."
      : "Existing UID answer record cross-checked against the displayed question/options and independent derivation; no answer key changed.";
    question.review.answerKeyVerified = true;
    question.review.answerKeyStatus = isUnknown ? "EXISTING_RECORD_CONFIRMED" : "MATCHED";
    if (isUnknown) question.review.verifiedStoredAnswer = answerRecord.answer;
    accepted++;
  }
  chunk.status = "REVIEWED";
  chunk.reviewStatus = "REVIEWED";
  chunk.reviewedAt = DATE;
  chunk.acceptedCount = accepted;
  chunk.holdCount = held;
  chunk.specialCategories = { HOLD: chunk.questions.filter(q => q.status === "HOLD").map(q => ({ uid: q.uid, reason: HOLD_REASONS[q.uid] })) };
  writeJson(CHUNK, chunk);
  console.log(ID + ": reviewed " + chunk.questions.length + "; accepted " + accepted + "; held " + held + ".");
}

function inject() {
  const chunk = readJson(CHUNK);
  const accepted = new Set(chunk.questions.filter(q => q.status !== "HOLD").map(q => q.uid));
  const content = fs.readFileSync(PATCH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const additions = [];
  let refreshed = 0;
  for (const [uid, value] of Object.entries(CHUNK_CSE_MATH_20_SOLUTIONS)) {
    if (!accepted.has(uid)) continue;
    const line = "  " + JSON.stringify(uid) + ": " + JSON.stringify(value) + ",";
    const existing = lines.findIndex(item => item.startsWith("  " + JSON.stringify(uid) + ": "));
    if (existing < 0) additions.push(line);
    else { lines[existing] = line; refreshed++; }
  }
  if (additions.length + refreshed !== accepted.size) throw new Error("Solution count mismatch");
  if (additions.length) {
    const marker = lines.findIndex(item => item.includes("export const AUTHENTIC_PATCHES = {"));
    if (marker < 0) throw new Error("Patch registry marker missing");
    lines.splice(marker + 1, 0, ...additions);
  }
  fs.writeFileSync(PATCH, lines.join(newline), "utf8");
  console.log(ID + ": synchronized " + accepted.size + " solutions; " + additions.length + " new, " + refreshed + " refreshed.");
}

function markIntegrated() {
  const chunk = readJson(CHUNK);
  const registry = readJson(path.join(ROOT, "data/solutions/practicepaper/all-solutions.json"));
  const shardDir = path.join(ROOT, "public/question-detail-shards");
  const shards = fs.readdirSync(shardDir).filter(file => file.endsWith(".json")).map(file => ({ file, data: readJson(path.join(shardDir, file)) }));
  const accepted = chunk.questions.filter(q => q.status !== "HOLD");
  const held = chunk.questions.filter(q => q.status === "HOLD");
  for (const question of accepted) {
    const shard = shards.find(item => item.data.recordsByQuestionUid?.[question.uid]);
    if (!registry[question.uid]?.detailed_solution || !shard?.data.recordsByQuestionUid[question.uid]?.detailed_solution?.markdown) {
      throw new Error("Missing built solution for " + question.uid);
    }
    question.status = "INTEGRATED";
    question.review.disposition = "INTEGRATED";
    question.review.integrationResult = {
      status: "VERIFIED",
      verifiedAt: DATE,
      registryPath: "data/solutions/practicepaper/all-solutions.json",
      detailShardPath: "public/question-detail-shards/" + shard.file
    };
  }
  chunk.status = held.length ? "PARTIAL" : "COMPLETED";
  chunk.reviewStatus = "REVIEWED";
  chunk.integratedCount = accepted.length;
  chunk.acceptedCount = accepted.length;
  chunk.holdCount = held.length;
  writeJson(CHUNK, chunk);

  const manifestPath = path.join(ROOT, "data/solutions/chunks/manifest.json");
  const manifest = readJson(manifestPath);
  const entry = manifest.chunks[ID];
  entry.status = chunk.status;
  entry.acceptedCount = accepted.length;
  entry.integratedCount = accepted.length;
  entry.heldCount = held.length;
  entry.updatedAt = DATE;
  if (!manifest.specialCategories) manifest.specialCategories = {};
  if (!manifest.specialCategories.HOLD) manifest.specialCategories.HOLD = [];
  for (const question of held) {
    const reason = HOLD_REASONS[question.uid];
    const existing = manifest.specialCategories.HOLD.find(item => item.uid === question.uid);
    if (existing) Object.assign(existing, { chunkId: ID, reason });
    else manifest.specialCategories.HOLD.push({ chunkId: ID, uid: question.uid, reason });
  }
  manifest.lastUpdated = new Date().toISOString();
  writeJson(manifestPath, manifest);
  console.log(ID + ": verified " + accepted.length + " integrated; " + held.length + " held in special category.");
}

if (process.argv[1]?.includes("apply-chunk-cse-math-20")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
