import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-CLASSIC-02";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-classic-02.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

function solution(concept, lines) {
  return { concept, markdown: lines.join("\n"), images: [] };
}

export const CHUNK_CSE_CLASSIC_02_SOLUTIONS = {
  "go:3660": solution("Software engineering - CMMI level 5 defect prevention", [
    "At CMM Level 4, processes are quantitatively managed. Level 5 is the optimizing level: the organization uses measurement and feedback to prevent defects and to introduce process and technology improvements.",
    "",
    "Process Change Management and Technology Change Management are two level-5 process areas. The additional practice named in the choices is Defect Prevention; detection finds defects after they occur, while isolation and propagation are not the level-5 area.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3661": solution("Software engineering - configuration management", [
    "A configuration-management system identifies and controls configuration items and keeps their revisions consistent. Its version-control function lets a team retain and retrieve different versions of source files and other configurable artifacts.",
    "",
    "Project scheduling and manpower allocation are separate project-management functions. The choice that describes configuration management is maintaining different versions of configurable items.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:3711": solution("Software engineering - critical path and task slack", [
    "There are two paths to the finish. The path through T2 and T3 takes $10+15+18+40=83$ days; the path through T4 takes $10+30+40=80$ days. The first path is critical.",
    "",
    "T3 lies on the critical path, so its earliest and latest allowable start times coincide. Its total slack is zero.",
    "",
    "**Therefore, the correct answer is Option A (0 days).**"
  ]),
  "go:3712": solution("Software engineering - cyclomatic complexity", [
    "Cyclomatic complexity for a single connected control-flow graph is one more than the number of binary decision points. This routine has a while condition and an if condition, so $V(G)=2+1=3$.",
    "",
    "Equivalently, the three independent routes are: skip the loop; enter the loop and take the $x>y$ branch; and enter the loop and take the other branch.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:3713": solution("Software engineering - schedule compression effort scaling", [
    "The model gives $L=P(E/B)^{1/3}t^{4/3}$. For the same software and process, $L$, $P$, and $B$ are fixed, so $E^{1/3}t^{4/3}$ is constant. Cubing both sides shows $Et^4$ is constant.",
    "",
    "Reducing the duration from 8 months to 4 months therefore multiplies effort by $(8/4)^4=16$. The revised effort is $20\\times16=320$ person-months.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:3714": solution("Software engineering - error-seeding estimate", [
    "The test suite found $16$ of the $20$ seeded errors, an observed detection fraction of $16/20=0.8$. Use the same fraction to estimate the total number $N$ of naturally occurring errors from the 200 detected natural errors:",
    "",
    "$$\\frac{200}{N}=0.8\\quad\\Longrightarrow\\quad N=250.$$",
    "",
    "The estimated number still undetected is $250-200=50$.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:903": solution("Theory of computation - reductions and NP-completeness", [
    "A polynomial reduction from 3-SAT to $\\Pi$ proves that $\\Pi$ is NP-hard, because 3-SAT is NP-complete.",
    "",
    "The reduction in the other direction, $\\Pi\\le_p3$-SAT, also establishes $\\Pi\\in NP$: a polynomial-time reduction to a language in NP transfers NP membership. Thus $\\Pi$ is both NP-hard and in NP.",
    "",
    "**Therefore, the correct answer is Option C: $\\Pi$ is NP-complete.**"
  ]),
  "go:933": solution("Numerical methods - Newton iteration on a piecewise-linear graph (MTA)", [
    "Newton-Raphson replaces the current point by the x-intercept of the tangent at that point. On a straight segment, that tangent is the segment's extended line, so one step can land on a different segment or exactly at a corner.",
    "",
    "The plotted vertices are approximately $A=(0,1)$, $B=(0.5,0.5)$, $E=(1,-0.8)$, $D=(1.55,0.5)$, and $C=(2.05,1)$. On AB the slope is $-1$, so its extended tangent has x-intercept $1$: starting at $x_0$ lands exactly at corner E, where the slope changes and $f'(E)$ does not exist.",
    "",
    "On BE the slope is about $-2.6$, so the line's zero is $0.5+0.5/2.6\\approx0.69$, the left root shown approximately as $0.6$. From the right segment CD, whose slope is about $1$, the tangent first lands near $x=1.05$. On ED the slope is about $1.3/0.55\\approx2.36$, giving the next intercept near $x=1.34$, the right root shown approximately as $1.3$.",
    "",
    "The three offered sequences require a defined root for each starting value, but the $x_0$ iteration reaches a nondifferentiable corner. The exam record classifies this item as marks-to-all; retain that status rather than substituting an approximate option."
  ]),
  "go:958": solution("Logic programming - translating a rule and integrity constraint (MTA)", [
    "Read the first clause as a rule: whenever both $B(x,y)$ and $C(y)$ hold for some $y$, conclude $A(x)$. Its first-order form is $\\forall x\\,[(\\exists y)(B(x,y)\\land C(y))\\Rightarrow A(x)]$.",
    "",
    "The second displayed line has an empty rule head. Under the natural integrity-constraint reading, it forbids any $x$ for which $B(x,x)$ holds, giving $\\neg\\exists x\\,B(x,x)$. Conjoining the rule and the constraint gives option A.",
    "",
    "The source's second clause is printed without a head, so its intended logic-program syntax is not fully specified. The exam record is marks-to-all; keep MTA as the answer while documenting the natural intended translation."
  ]),
  "go:961": solution("Programming languages - dynamic method binding", [
    "Dynamic binding chooses an overridden method from the object's run-time class. Each of $x$, the cast expression $((P)y)$, and $z$ refers to an object constructed as $Q$; casting $y$ to the base type changes the static view, not the object's run-time class.",
    "",
    "Therefore each call dispatches to Q's override. That method prints twice the argument, so each call with argument 1 prints 2.",
    "",
    "**The output is 2 2 2, Option D.**"
  ]),
  "go:806": solution("Numerical methods - exactness of the trapezoidal rule", [
    "The one-panel trapezoidal rule integrates the straight line joining the integrand's endpoint values. If the integrand is constant or linear, its graph is exactly that line, so the trapezoid area equals the integral.",
    "",
    "A quadratic generally curves away from its endpoint chord and is not integrated exactly by this rule.",
    "",
    "**Therefore, the correct answer is Option C: degree 0 or 1.**"
  ]),
  "go:807": solution("Algorithms - solving a recurrence by expansion", [
    "Put $S_k=T(2^k)$. The recurrence becomes $S_k=3S_{k-1}+1$ with $S_0=T(1)=1$. Expanding gives",
    "",
    "$$S_k=3^kS_0+\\sum_{j=0}^{k-1}3^j=3^k+\\frac{3^k-1}{2}=\\frac{3^{k+1}-1}{2}.$$",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:809": solution("Data structures - worst-case linked-list search", [
    "A singly linked list has no direct index operation. In the worst case, the target is the final element or is absent, so a sequential search examines all $n$ nodes.",
    "",
    "**Therefore, the worst-case comparison count is $n$, Option D.**"
  ]),
  "go:813": solution("Computer architecture - 8085 INTR acknowledgement", [
    "INTR is the maskable interrupt-request input. After completing the current instruction, the 8085 acknowledges the request with the active-low INTA signal. During the acknowledge cycle, the external device places the interrupt instruction (here, CALL) on the data bus.",
    "",
    "**Therefore, the correct answer is Option A: while INTA is active.**"
  ]),
  "go:814": solution("Computer architecture - program-counter updates", [
    "The program counter identifies the next instruction. During ordinary sequential execution it advances to the following instruction; control-transfer instructions such as jumps and calls load a different destination into it.",
    "",
    "Thus every executed instruction modifies the PC, either by normal advancement or by explicit control transfer.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:816": solution("Digital logic - Karnaugh-map minimization", [
    "Use the don't-care cells to form two groups of four. The first group spans columns with $x=1$ and rows with $z=0$, producing $xz'$. The second spans rows with $z=1$ and columns with $x=0$, using the don't-cares to eliminate the other variables and producing $x'z$.",
    "",
    "The minimum sum is $xz'+x'z$, which is the exclusive-OR pattern in $x$ and $z$.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:817": solution("Computer architecture - identifying instruction memory", [
    "An instruction cache stores fetched instructions, an instruction register holds the current instruction, and a translation look-aside buffer stores cached address translations. An opcode, by contrast, is a field within an instruction that identifies the operation; it is not a memory or storage structure.",
    "",
    "**Therefore, the correct answer is Option C.**"
  ]),
  "go:818": solution("Computer organization - binary fraction representation", [
    "In binary, the first digit after the radix point has weight $2^{-1}$ and the second has weight $2^{-2}$. Hence $.01_2=0\\cdot2^{-1}+1\\cdot2^{-2}=1/4=0.25$.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:819": solution("Computer organization - two's-complement representation", [
    "The shortest ordinary two's-complement width that represents $-15$ is five bits. In five bits, $+15=01111$; invert the bits and add one: $10000+1=10001$.",
    "",
    "Interpreted as a five-bit signed value, $10001_2=-16+1=-15$.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:821": solution("Computer organization - sign extension", [
    "When a signed two's-complement integer is widened, copy its sign bit into each newly added high-order bit. This preserves the represented value; for example, $1011_2$ (negative in four bits) becomes $11101011_2$ when widened to eight bits.",
    "",
    "**Therefore, sign extension is used when converting a signed integer between sizes, Option D.**"
  ]),
  "go:822": solution("Programming languages - activation-record stack", [
    "Each active function call has an activation record. A call chain such as main calling A, A calling B, and B calling C has multiple records between the current function and main; the number is determined by the actual call chain.",
    "",
    "C uses static scope for global names, and recursion uses the same run-time stack with a new activation record for each call.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:823": solution("Programming languages - reference versus value-result parameters", [
    "With call by reference, a formal parameter aliases the caller's storage, so a write is visible immediately. With value-result, the callee works on a copy and normally copies the final value back when the call returns.",
    "",
    "If an exception exits the routine before copy-out, the caller does not receive the modified copy, while writes through a reference have already affected the caller's variable. Thus the results may differ in the presence of an exception. Aliasing can introduce additional differences in some language definitions, but it is not needed for this option.",
    "",
    "**Therefore, the correct answer is Option D.**"
  ]),
  "go:826": solution("Computer organization - signed addition overflow", [
    "In two's-complement arithmetic, adding operands with opposite signs cannot overflow: the exact sum lies between the two operands and therefore remains within the representable range whenever both operands are representable.",
    "",
    "Overflow is instead possible when two positive values produce a negative result or two negative values produce a nonnegative result. A carry out of the sign bit alone is not the overflow test.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:829": solution("Computer architecture - absolute addressing", [
    "In absolute (direct) addressing, the instruction contains the effective address of the operand. The operand itself is stored at that address; it need not be embedded in the instruction.",
    "",
    "**Therefore, the correct answer is Option B.**"
  ]),
  "go:831": solution("Digital logic - solving the NAND network", [
    "The two NAND gates and the inverted $f_3$ input implement",
    "",
    "$$f=\\big((f_1f_2)'f_3'\\big)'=f_1f_2+f_3.$$",
    "",
    "The minterm sets for $f_1$ and $f_2$ are disjoint: $\\{0,1,3,5\\}\\cap\\{6,7\\}=\\varnothing$. Therefore $f_1f_2=0$ and $f=f_3$. Since $f=\\Sigma(1,4,5)$, the same minterms define $f_3$.",
    "",
    "**Therefore, the correct answer is Option A.**"
  ])
};

const NOTES = {
  "go:3660": "CMM level 5 adds defect prevention alongside process and technology change management; existing B matches.",
  "go:3661": "Configuration management maintains versions of configurable items; existing B matches.",
  "go:3711": "The T1-T2-T3-T5 path is 83 days versus 80 days through T4; T3 lies on the critical path and has zero slack.",
  "go:3712": "Two binary predicates (while and if) give cyclomatic complexity 2+1=3; existing C matches.",
  "go:3713": "Holding project size and process constants gives E*t^4 constant; halving time multiplies effort by 16 to 320.",
  "go:3714": "Seed detection is 16/20=0.8; 200 natural errors detected imply 250 total and 50 undetected.",
  "go:903": "3-SAT reduces to Pi, proving hardness; Pi reduces to 3-SAT, proving Pi is in NP; existing C matches.",
  "go:933": "The AB tangent from x0 lands at corner E, where the derivative is undefined; BE and ED give approximate roots 0.69 and 1.34. Preserve the source MTA status.",
  "go:958": "The natural reading of the headless second clause is an integrity constraint; it yields option A, while preserving source MTA due malformed syntax.",
  "go:961": "All three receivers are runtime Q objects, so dynamic dispatch prints 2 on each call; existing D matches.",
  "go:806": "The trapezoidal rule integrates constants and linear polynomials exactly; existing C matches.",
  "go:807": "Expansion of S_k=3S_(k-1)+1 with S_0=1 gives (3^(k+1)-1)/2; existing B matches.",
  "go:809": "A worst-case singly linked-list search examines all n nodes; existing D matches.",
  "go:813": "The 8085 acknowledges INTR with INTA before the device supplies the CALL instruction; existing A matches.",
  "go:814": "Sequential execution advances PC and control transfers load it; every instruction updates PC, matching D.",
  "go:816": "Two K-map quads, including don't-cares, yield xz'+x'z; existing B matches.",
  "go:817": "The opcode is an instruction field, not a storage structure; existing C matches.",
  "go:818": "0.25 equals 1/4=0.01 in binary; existing B matches.",
  "go:819": "Five-bit two's complement 10001 evaluates to -16+1=-15; existing D matches.",
  "go:821": "Sign extension preserves a signed value when widening its representation; existing D matches.",
  "go:822": "Nested calls create one activation record per active function on the same stack; count depends on call sequence, matching B.",
  "go:823": "Exception exit can skip value-result copy-out, while reference writes are immediate; existing D matches.",
  "go:826": "Opposite-sign two's-complement operands cannot overflow; existing B matches.",
  "go:829": "Absolute addressing stores the operand's effective address in the instruction; existing B matches.",
  "go:831": "f=f1*f2+f3; the minterm sets for f1 and f2 are disjoint, so f3=f=Sigma(1,4,5), matching A."
};

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8"); }

function review() {
  const chunk = readJson(CHUNK);
  const answers = readJson(ANSWERS).records_by_question_uid;
  const manifest = readJson(path.join(ROOT, "data/solutions/chunks/manifest.json"));
  const holds = new Set((manifest.specialCategories?.HOLD || []).map(item => item.uid));
  if (chunk.questions.length !== 25) throw new Error("Expected exactly 25 questions");
  let accepted = 0;
  for (const question of chunk.questions) {
    if (holds.has(question.uid)) throw new Error("Shared HOLD UID was selected: " + question.uid);
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
      notes: NOTES[question.uid],
      disposition: "ACCEPTED",
      answerKeySource: "Existing UID answer record cross-checked against the displayed question/options and independent derivation; no answer key changed.",
      answerKeyVerified: true,
      answerKeyStatus: "MATCHED"
    };
    question.status = "ACCEPTED";
    delete question.specialCategory;
    accepted++;
  }
  if (accepted !== Object.keys(CHUNK_CSE_CLASSIC_02_SOLUTIONS).length) throw new Error("Solution count mismatch");
  chunk.status = "REVIEWED";
  chunk.reviewStatus = "REVIEWED";
  chunk.reviewedAt = DATE;
  chunk.acceptedCount = accepted;
  chunk.holdCount = 0;
  chunk.specialCategories = { HOLD: [] };
  writeJson(CHUNK, chunk);
  console.log(ID + ": reviewed " + chunk.questions.length + "; accepted " + accepted + "; held 0.");
}

function inject() {
  const chunk = readJson(CHUNK);
  const accepted = new Set(chunk.questions.filter(q => q.status !== "HOLD").map(q => q.uid));
  const content = fs.readFileSync(PATCH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const additions = [];
  let refreshed = 0;
  for (const [uid, value] of Object.entries(CHUNK_CSE_CLASSIC_02_SOLUTIONS)) {
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
  entry.updatedAt = new Date().toISOString();
  if (!manifest.specialCategories) manifest.specialCategories = {};
  if (!manifest.specialCategories.HOLD) manifest.specialCategories.HOLD = [];
  for (const question of held) {
    const reason = question.review?.notes || "Unresolved; retained in HOLD category.";
    const existing = manifest.specialCategories.HOLD.find(item => item.uid === question.uid);
    if (existing) Object.assign(existing, { chunkId: ID, reason });
    else manifest.specialCategories.HOLD.push({ chunkId: ID, uid: question.uid, reason });
  }
  manifest.lastUpdated = new Date().toISOString();
  writeJson(manifestPath, manifest);
  console.log(ID + ": verified " + accepted.length + " integrated; " + held.length + " held in special category.");
}

if (process.argv[1]?.includes("apply-chunk-cse-classic-02")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
