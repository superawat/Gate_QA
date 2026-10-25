import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-CLASSIC-01";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-classic-01.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

function solution(concept, lines) {
  return { concept, markdown: lines.join("\n"), images: [] };
}

export const CHUNK_CSE_CLASSIC_01_SOLUTIONS = {
  "go:1338": solution("Algorithms - longest common subsequence recurrence", [
    "Let $l(i,j)$ be the LCS length of the prefixes $X[0..i-1]$ and $Y[0..j-1]$. If their last symbols differ, a common subsequence cannot use both of those two different symbols as its final symbol. An optimum must therefore omit one of them:",
    "",
    "$$l(i,j)=\\max\\{l(i-1,j),l(i,j-1)\\}.$$",
    "This is exactly the expression proposed in option C. For comparison, when the last symbols match, the recurrence is $l(i-1,j-1)+1$; options A and B do not give that matching case. Option D refers back to the current cell and is not a valid decreasing-prefix recurrence.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:43476": solution("Algorithms - topological order for LCS dynamic programming", [
    "For an interior cell, the LCS recurrence reads the cell above $L[i-1,j]$, the cell to the left $L[i,j-1]$, and the diagonal $L[i-1,j-1]$. The base row and base column are initialized to zero; the remaining cells are computed from these already known neighbors.",
    "",
    "In row-major order, the entire preceding row and the earlier cells in the current row are available. In column-major order, the preceding column and earlier cells in the current column are available. Thus either order respects all dependencies. Initializing every cell to zero is unnecessary, and the broad ordering in option D imposes an incorrect condition on unrelated cells.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:1341": solution("Data structures - checking the max-heap invariant", [
    "In a max-heap, each parent must be at least as large as either child. For a zero-indexed array, the children of index $i$ are at $2i+1$ and $2i+2$.",
    "",
    "For option C, the comparisons are $25\\ge14,16$, $14\\ge13,10$, and $16\\ge8,12$; every parent-child edge satisfies the heap property. Option A fails because $12<14$, option B because $13<16$, and option D because $12<16$.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:43466": solution("Data structures - two max-heap deletions", [
    "A delete operation removes the maximum at the root, moves the last array element to the root, and sifts it down. Starting from $[25,14,16,13,10,8,12]$, the first deletion moves $12$ to the root. It swaps with the larger child $16$, giving $[16,14,12,13,10,8]$.",
    "",
    "For the second deletion, remove $16$ and move $8$ to the root. It first swaps with $14$ and then with $13$. The resulting heap array is $[14,13,12,8,10]$.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:3278": solution("Computer networks - asynchronous serial framing", [
    "The baud rate is treated as $9600$ transmitted bits per second for this serial link. One data byte uses a frame of $12$ bits: one start bit, eight payload bits, one odd-parity bit, and two stop bits.",
    "",
    "In $15$ seconds the link carries $9600\\times15=144000$ frame bits. Dividing by $12$ bits per payload byte gives $144000/12=12000$ bytes of data. The parity and framing bits consume capacity, so they are not counted as payload bytes.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3279": solution("Web technologies - extensible markup vocabularies", [
    "XML lets an application define element names for its own data vocabulary, such as domain-specific tags. In the conventional distinction used by this question, HTML has a predefined set of document elements, while XML is designed to carry structured data with application-defined element names.",
    "",
    "Being derived from SGML is not unique to XML; HTML also has that lineage. Both can represent content, and XML is not restricted to web browsers. The distinguishing property among these choices is user-defined tags.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:420": solution("Numerical methods - Newton iteration for a square root", [
    "Apply Newton-Raphson to $f(x)=x^2-R$. Then $f'(x)=2x$, so the update is",
    "",
    "$$x_{n+1}=x_n-\\frac{x_n^2-R}{2x_n}=\\frac12\\left(x_n+\\frac{R}{x_n}\\right).$$",
    "",
    "A fixed point satisfies $x=\\tfrac12(x+R/x)$, hence $x^2=R$. For $R>0$ and a positive starting estimate, the iteration converges to $\\sqrt R$. It is not the iteration for $R^2$, $1/R$, or $\\log R$.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:3555": solution("Software engineering - cyclomatic complexity and statement coverage", [
    "Cyclomatic complexity $V(G)$ is the number of linearly independent paths in a program's control-flow graph. Testing a basis of those paths provides a systematic path-based test suite; the required suite size is bounded by $V(G)$, and executing the basis paths exercises the program statements needed for statement coverage.",
    "",
    "The question asks for an upper bound on tests to execute statements at least once. “At most once” is a different requirement and is not what statement coverage means. The lower-bound choices reverse the bound, while option C states the standard upper-bound relationship.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:977": solution("Complexity theory - transitivity of polynomial reductions", [
    "Because $S$ is NP-complete, every language $L\\in NP$ has a polynomial-time reduction $L\\le_p S$. The premise also gives $S\\le_p R$. Polynomial-time reductions compose, so $L\\le_p R$ for every $L\\in NP$; therefore $R$ is NP-hard.",
    "",
    "The premise does not establish $R\\in NP$, which would also be needed to conclude NP-completeness. The reduction $Q\\le_p S$ only says that $Q$ is no harder than $S$; it does not prove that $Q$ is NP-hard or NP-complete.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3556": solution("Software engineering - cyclomatic complexity formulas", [
    "For a control-flow graph with one connected component, cyclomatic complexity is",
    "",
    "$$V(G)=E-N+2.$$",
    "For a single connected component with $P$ predicate nodes, the equivalent predicate-count formula is $V(G)=P+1$ (the initial straight-line region contributes one path in addition to the predicate regions). Thus expressions II and IV are both correct. Expressions I and III have the wrong constants.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:1834": solution("Programming languages - pass-by-reference with an expression argument", [
    "The actual argument $ib+5$ is an expression, not a writable variable. A pass-by-reference implementation therefore evaluates it into a temporary cell: initially $ib=8$, so the temporary contains $13$. The other actual argument refers directly to $ia=3$.",
    "",
    "Inside `swap`, `it` saves $3$, then `ix=iy` writes $13$ into `ia`; `iy=it` writes $3$ into the temporary cell. That temporary disappears on return, leaving `ib` unchanged at $8$. The printed values are therefore $13$ and $8$: S1 and S4 are true, while the two runtime-error claims and S5 are false.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3602": solution("Software reliability - availability of two repairable modules", [
    "Let $U$ be the state in which both modules are operating and $F_i$ the state in which only module $M_i$ is failed. Simultaneous failures are excluded. From $U$, the failure rate into $F_i$ is $\\lambda_i=1/T_i$; from $F_i$, repair returns the program to $U$ at rate $\\mu_i=1/R_i$.",
    "",
    "At steady state, flow balance gives $P(F_i)=P(U)\\lambda_i/\\mu_i=P(U)R_i/T_i$. Normalizing the three states yields",
    "",
    "$$1=P(U)\\left(1+\\frac{R_1}{T_1}+\\frac{R_2}{T_2}\\right),\\qquad A=P(U)=\\frac{T_1T_2}{T_1T_2+T_2R_1+T_1R_2}.$$",
    "This is option D. The reversed cross terms in option C would pair each module's repair time with its own failure mean instead of the other module's term after clearing the denominator.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:3603": solution("Software engineering - reading a structure chart", [
    "In a structure chart, an open circle denotes a data couple and a filled circle denotes a control couple. The diagram marks A4 as an output data couple, not as a control flag, so statement III is false. A1 is used in both data and control roles; mixing a value parameter with a control flag is the design error described in statement IV.",
    "",
    "F6 is called only from F3, so its single subordinate operation can be included in F3's module (I). F4 is shared by more than one caller in the chart, so folding F6 into F4 would not preserve that shared call structure (II is false). The true set is therefore I and IV.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3618": solution("Software engineering - Halstead program volume", [
    "Using the token-counting convention applied to this exam item, omit the type name `float`, punctuation, and parentheses. The operators are `if` (1), dereference `*` (6), equality `==` (1), `return` (2), and assignment `=` (3). Thus $n_1=5$ distinct operators and $N_1=13$ total operator occurrences.",
    "",
    "The operands are `temp` (2), `A1` (3), and `A2` (3), giving $n_2=3$ and $N_2=8$. Therefore $n=n_1+n_2=8$ and $N=N_1+N_2=21$. Halstead volume is",
    "",
    "$$V=N\\log_2 n=21\\log_2 8=21\\times3=63.$$",
    "Some general Halstead counting conventions include additional syntax tokens, but that count does not match the exam's choices; the stated convention gives the listed value exactly.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3638": solution("Project management - PERT critical path and slack", [
    "For each phase, the PERT expected duration is $t_e=(a+4m+b)/6$. The four expected durations are $P1=(11+4\\cdot15+25)/6=16$, $P2=(7+4\\cdot8+15)/6=9$, $P3=(8+4\\cdot9+22)/6=11$, and $P4=(3+4\\cdot8+19)/6=9$ days.",
    "",
    "The two paths are $P1-P2-P4=16+9+9=34$ days and $P1-P3-P4=16+11+9=36$ days. The latter is critical. Since P2's branch is two days shorter before the join, P2 has two days of slack.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:3765": solution("Software engineering - Function Points and Lines of Code", [
    "Function Points estimate delivered functionality without first choosing a programming language. Lines of Code estimate source size, so the conversion from FP to LOC depends strongly on the language. Lower-level languages generally require more source statements for the same function points; this supports statements A and B, and the cited average C++/FORTRAN conversion is also a language-dependent comparison.",
    "",
    "Thus FP and LOC are related through language-dependent productivity/conversion factors. Statement D denies that relationship and is the false statement.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:3776": solution("Web technologies - safe method for a purchase form", [
    "A purchase submits a state-changing request: it may create an order, charge a payment method, or reserve inventory. Such data should be sent in the request body with HTTP POST. GET is intended for retrieval and can be cached, bookmarked, or prefetched; using it for a purchase risks triggering the transaction through an ordinary fetch.",
    "",
    "**Therefore, the correct answer is Option B (POST).**"
  ]),
  "go:3658": solution("Software engineering - COCOMO estimates", [
    "COCOMO is a constructive cost-estimation model. Its basic inputs include an estimate of software size (traditionally in KLOC); the model uses that size and project mode to estimate development effort and schedule duration.",
    "",
    "It does not infer size and duration from effort, nor does it take project cost as the primary input. The matching description is effort and duration based on software size.",
    "",
    "**Therefore, the correct answer is Option A.**"
  ]),
  "go:3659": solution("Software engineering - UML use-case diagrams", [
    "A use-case diagram describes system functionality from the perspective of external actors. Actors and their interactions with use cases capture the users' functional requirements and define the system boundary.",
    "",
    "An entity-relationship diagram models data, a deployment diagram models physical nodes and software placement, and a data-flow diagram models process/data movement. The UML choice intended for user requirements is the use-case diagram.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ])
};

const HOLD_REASONS = {
  "go:3277": "GateOverflow answers disagree on S1 and S2. Under literal statement coverage, executing every statement inside a loop requires entering that loop at least once; independent-path testing also does not guarantee every loop executes more than once. The stored key C is not supported consistently by the source discussion. Preserve the answer and hold pending an authoritative key/wording review.",
  "go:3596": "The scan's description for `protected` says a derived class can access the base class's private parts. In C++/Java-style access control, protected members may be accessed by derived classes, but private members may not. Since the only otherwise matching choice depends on this inaccurate description, hold rather than publish an unqualified derivation.",
  "go:3606": "The displayed XQuery filters each course by min(course scores) > avg(all university scores), which implies every score in that course is above the university-wide average (option D). The existing answer record is C, and GateOverflow has no answer posted for this question. Preserve the key and hold pending source/key reconciliation.",
  "go:3619": "The linked Halstead volume derivation counts n1=5, N1=13, n2=3, N2=8, so D=(n1/2)(N2/n2)=20/3 and E=D*V=420. The answer choices omit 420 while the existing record is option C (393). The source itself notes that counting conventions vary. Preserve the key and hold until the intended convention or answer key is verified.",
  "go:3639": "The PERT durations are 16, 9, 11, and 9 days. Equalizing the two paths requires crashing P3 by two days at 50/day ($100); with both paths critical, the common P1 and P4 phases can each be crashed one day for another $100 and $1,000, totaling $1,200 (option B). The stored record is D (200, 2000), and the discussion contains conflicting explanations. Preserve the key and hold.",
  "go:3844": "The displayed DTD choices are not uniquely valid for the shown XML. Both title? and title* permit the sample's one-title/zero-title Book instances, while the shown ATTLIST declaration omits a required default declaration; option C and D otherwise appear identical. Hold pending a clean original scan or authoritative correction."
};

const NOTES = {
  "go:1338": "Mismatch recurrence is max(top,left); matching recurrence adds one to the diagonal. Existing key C matches.",
  "go:43476": "Top, left, and diagonal predecessors allow either row-major or column-major filling after initializing the base row/column. Existing key B matches.",
  "go:1341": "Only option C satisfies parent >= child at every heap edge. Existing key C matches.",
  "go:43466": "Two extract-max operations produce [14,13,12,8,10]. Existing key D matches.",
  "go:3277": "Conflicting interpretations and discussions; held without changing the answer record.",
  "go:3278": "Each payload byte costs 12 line bits; 9600*15/12=12000 bytes. Existing key B matches.",
  "go:3279": "The intended XML distinction is application-defined tags; existing key C matches.",
  "go:420": "Newton iteration for x^2-R=0 yields the displayed update and converges to sqrt(R). Existing key C matches.",
  "go:3555": "Cyclomatic complexity bounds basis-path tests used to achieve statement coverage. Existing key C matches.",
  "go:977": "Reduction transitivity makes R NP-hard, but R membership in NP is not given. Existing key B matches.",
  "go:3556": "For one connected component V=E-N+2=P+1. Existing key C matches.",
  "go:3596": "Held because the scan incorrectly calls protected access to private base members.",
  "go:1834": "The expression argument is copied into a temporary 13; swap writes ia=13, leaving ib=8. Existing key B matches.",
  "go:3602": "Steady-state uptime is 1/(1+R1/T1+R2/T2), matching option D.",
  "go:3603": "Chart conventions classify A4 as data and A1 as both data/control; only statements I and IV hold. Existing key B matches.",
  "go:3606": "Independent query reading yields option D but the stored record is C; held.",
  "go:3618": "Using the source's explicit token convention, V=21 log2(8)=63. Existing key B matches.",
  "go:3619": "Source counting gives effort 420, absent from options; held.",
  "go:3638": "Expected phase times are 16,9,11,9; critical path P1-P3-P4 and P2 slack is 2 days. Existing key C matches.",
  "go:3639": "Independent crash-cost derivation gives B while stored record is D; held.",
  "go:3765": "FP-to-LOC conversion depends on language, so D is false. Existing key D matches.",
  "go:3776": "POST submits a purchase as a state-changing request. Existing key B matches.",
  "go:3844": "Displayed options are ambiguous/malformed for the shown instance; held.",
  "go:3658": "COCOMO estimates effort and duration from software size. Existing key A matches.",
  "go:3659": "UML use-case diagrams express external actors' functional requirements. Existing key D matches."
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
    if (JSON.stringify(answerRecord.answer) !== JSON.stringify(question.officialAnswer)) {
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
      question.review.answerKeySource = "Existing UID answer record compared against the displayed source stem and an independent derivation; an unresolved issue remains.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = "SOURCE_CONFLICT";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_CLASSIC_01_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
    question.status = "ACCEPTED";
    delete question.specialCategory;
    question.review.disposition = "ACCEPTED";
    question.review.answerKeySource = "Existing UID answer record cross-checked against the displayed question/options and independent derivation; no answer key changed.";
    question.review.answerKeyVerified = true;
    question.review.answerKeyStatus = "MATCHED";
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
  for (const [uid, value] of Object.entries(CHUNK_CSE_CLASSIC_01_SOLUTIONS)) {
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
  if (!entry) throw new Error("Manifest entry missing for " + ID);
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

if (process.argv[1]?.includes("apply-chunk-cse-classic-01")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
