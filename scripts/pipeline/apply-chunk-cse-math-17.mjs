import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-MATH-17";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-math-17.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

export const CHUNK_CSE_MATH_17_SOLUTIONS = {
  "go:1642": { concept: "Propositional logic - converse of a conditional", markdown: String.raw`“I stay only if you go” means that my staying implies your going: $S\to G$. The converse swaps the hypothesis and conclusion, giving $G\to S$: if you go, I stay.

**Option A.**`, images: [] },
  "go:1643": { concept: "Relations - largest equivalence relation", markdown: String.raw`An equivalence relation on $A$ can contain at most all ordered pairs in $A\times A$. The universal relation $A\times A$ is itself reflexive, symmetric, and transitive, so it is the largest equivalence relation. Since $|A|=n$, it contains $n^2$ ordered pairs.

**Option B ($n^2$).**`, images: [] },
  "go:1644": { concept: "Relations - intersection and union of equivalence relations", markdown: String.raw`The intersection is always an equivalence relation: each relation contains every diagonal pair, and symmetry and transitivity are preserved when a pair must belong to both relations.

The union need not be transitive. On $\{1,2,3\}$, let one equivalence partition be $\{1,2\},\{3\}$ and the other be $\{1\},\{2,3\}$. Their union contains $(1,2)$ and $(2,3)$ but not $(1,3)$. Thus (ii) is true while (i) is not.

**Option C.**`, images: [] },
  "go:1645": { concept: "Combinatorics - counting functions", markdown: String.raw`For each of the $m$ domain elements, a function independently chooses one of the $n$ codomain elements as its image. Multiplying the $n$ choices for each of $m$ inputs gives $n^m$ functions.

**Option C ($n^m$).**`, images: [] },
  "go:1660": { concept: "Combinatorics - counting contiguous substrings", markdown: String.raw`A substring is determined by its starting and ending positions. For length $1$ there are $n$ choices, for length $2$ there are $n-1$, and so on down to one substring of length $n$. Therefore,

$$n+(n-1)+\cdots+1=\frac{n(n+1)}2.$$

**Option D.**`, images: [] },
  "go:1673": { concept: "Linear algebra - matrix rank", markdown: String.raw`The fourth row is exactly three times the first, so it adds no rank. To check the first three rows, suppose $\alpha r_1+\beta r_2+\gamma r_3=0$. Looking at columns 1 and 2 gives $\alpha+4\gamma=0$ and $4\alpha+2\gamma=0$. This $2\times2$ system has determinant $2-16=-14\ne0$, so $\alpha=\gamma=0$. Column 3 then gives $3\beta=0$, so $\beta=0$ as well. The first three rows are independent and the rank is $3$.

**Option A (3).**`, images: [] },
  "go:1674": { concept: "Linear algebra - factoring a determinant", markdown: String.raw`Subtract row 1 from rows 2 and 3; these row operations preserve the determinant:

$$\Delta=(b-a)(ab-bc)-(c-a)(ca-bc).$$

Using $ab-bc=b(a-c)$, $ca-bc=c(a-b)$, and $c-a=-(a-c)$, factor to obtain

$$\Delta=(a-b)(a-c)(c-b).$$

Therefore $a-b$ is a factor.

**Option B.**`, images: [] },
  "go:1675": { concept: "Relations - testing reflexivity and transitivity", markdown: String.raw`The relation contains $(1,1),(2,2),(3,3)$ but not $(4,4)$, so it is not reflexive. It is not irreflexive either because it contains diagonal pairs.

For transitivity, the only elements with outgoing pairs are $1,2,3$. From $1$ one can only reach $1$, and $(1,1)$ is present. From $2$ or $3$ one can reach any element; whenever that intermediate element has an outgoing pair (it is $1,2,$ or $3$), the resulting pair from $2$ or $3$ is already listed. Thus the relation is transitive.

**Option B.**`, images: [] },
  "go:1676": { concept: "Combinatorics - inclusion-exclusion for three sets", markdown: String.raw`Let $x$ be the number who speak all three languages. Inclusion-exclusion gives

$$28=18+15+22-(9+11+13)+x=55-33+x.$$

Hence $x=6$.

**Option D (6).**`, images: [] },
  "go:1694": { concept: "Probability - meeting times in a bounded interval", markdown: String.raw`Measure arrival times in minutes after 4:00. The two independent uniform arrival times form a $60\times60$ square of equally likely pairs. They meet exactly when their times differ by at most 10 minutes. The meeting region is the square minus two right triangles, each with legs $50$:

$$P(\text{meet})=1-\frac{2(\frac12)(50)(50)}{60^2}=\frac{11}{36}.$$

Therefore,

$$P(\text{do not meet})=1-\frac{11}{36}=\frac{25}{36}=0.69444\ldots.$$

The stored answer $0.695$ is within its recorded absolute tolerance of $0.005$.

**Answer: $25/36$ (approximately $0.6944$, accepted as 0.695 within tolerance).**`, images: [] },
  "go:2217": { concept: "Probability - inclusion-exclusion", markdown: String.raw`Let $R_1$ and $R_2$ denote rain today and tomorrow. By inclusion-exclusion,

$$P(R_1\cup R_2)=P(R_1)+P(R_2)-P(R_1\cap R_2).$$

Substitute the given probabilities: $0.7=0.5+0.6-P(R_1\cap R_2)$, so the intersection probability is $0.4$.

**Option D (0.4).**`, images: [] },
  "go:2219": { concept: "Linear algebra - determinant of a triangular matrix", markdown: String.raw`The matrix is upper triangular. Its determinant is the product of its diagonal entries:

$$6\cdot2\cdot4\cdot(-1)=-48.$$

**Option B (-48).**`, images: [] },
  "go:2232": { concept: "Algebraic structures - maximum on the integers", markdown: String.raw`The operation $n*m=\max(n,m)$ is associative, commutative, and idempotent. However, a monoid identity $e$ would need to satisfy $\max(n,e)=n$ for every integer $n$, requiring $e\le n$ for all integers. No least integer exists, so there is no identity. Without an identity the structure is not a monoid, and consequently it is not a group.

**Option D (none of the above).**`, images: [] },
  "go:2233": { concept: "Propositional logic - tautology", markdown: String.raw`Option C simplifies as

$$p\lor(p\to q)=p\lor(\neg p\lor q)=(p\lor\neg p)\lor q=\mathrm{True}.$$

The other options are falsifiable: A with $p=F,q=T$; B with $p=F,q=T$; and D with $p=T,q=F$. Only C is a tautology.

**Option C.**`, images: [] },
  "go:2234": { concept: "Order theory - complements in a lattice", markdown: String.raw`In the Hasse diagram, the bottom element is $f$ and the top is $a$. An element $x$ complements $e$ when $e\wedge x=f$ and $e\vee x=a$.

The elements incomparable with $e$ are $g,c,d$. For each, the greatest common lower bound with $e$ is $f$, and the least common upper bound is $a$, so all three are complements. The comparable elements $b$ and $f$ fail the join condition; $a$ and $e$ fail the meet condition.

**Option B (3 complements).**`, images: ["/question-images/2484788142081845029.webp"] },
  "go:2242": { concept: "Calculus - maximum of a convex quadratic on an interval", markdown: String.raw`The quadratic $f(x)=2x^2-2x+6$ opens upward, so its maximum on a closed interval occurs at an endpoint. Evaluate:

$$f(0)=6,\qquad f(2)=2(4)-4+6=10.$$

Thus the maximum is $10$.

**Option B (10).**`, images: [] },
  "go:2243": { concept: "Linear algebra - right multiplication by a permutation matrix", markdown: String.raw`The matrix $I_{12}$ is the identity matrix with its first two rows interchanged; it is the permutation matrix that swaps coordinates 1 and 2. Right multiplication by a permutation matrix swaps the corresponding columns of $A$. Therefore the first column of $AI_{12}$ is the original second column of $A$.

**Option C.**`, images: [] },
  "go:2245": { concept: "Algebra - minimum degree from finite differences", markdown: String.raw`The values at $x=0,1,2,3$ are $5,4,9,20$. Their first differences are $-1,5,11$, and their second differences are $6,6$. A constant nonzero second difference identifies a quadratic polynomial, while a linear polynomial would have zero second differences. The minimum degree is $2$.

**Option B.**`, images: [] },
  "go:2257": { concept: "Order theory - linear extensions of a partial order", markdown: String.raw`The constraints place $x$ below every $a_i$ and each $a_i$ below $y$. Thus every total order must begin with $x$, end with $y$, and place the $n$ middle elements in any permutation. There are $n!$ such orders.

**Option A ($n!$).**`, images: [] },
  "go:2259": { concept: "Combinatorics - counting equivalence relations", markdown: String.raw`Equivalence relations correspond one-to-one with set partitions: each equivalence class is one block of a partition. The number of partitions of a four-element set is the Bell number

$$B_4=1+7+6+1=15,$$

from partitions into respectively 1, 2, 3, and 4 blocks.

**Option A (15).**`, images: [] },
  "go:2705": { concept: "Set theory - decomposing a union", markdown: String.raw`The sets $A-B$, $B-A$, and $A\cap B$ are the three disjoint regions that together make up $A\cup B$: elements only in $A$, only in $B$, and in both. Their union is therefore $A\cup B$.

**Option A.**`, images: [] },
  "go:2706": { concept: "Order theory - Hasse diagram under divisibility", markdown: String.raw`A Hasse edge joins comparable elements when no element of the set lies strictly between them in the divisibility order. The cover pairs are

$$2\prec6,\qquad3\prec6,\qquad6\prec12,\qquad12\prec24.$$

All other divisibility relations have one of these elements in between, so there are four edges.

**Option B (4).**`, images: [] },
  "go:2707": { concept: "Combinatorics - recovering set cardinalities from a function count", markdown: String.raw`If $|X|=m$ and $|Y|=n$, the number of functions $X\to Y$ is $n^m$. Since $97$ is prime and $n^m=97$, the only positive-integer possibility is $m=1,n=97$. Hence $|X|=1$ and $|Y|=97$.

**Option A.**`, images: [] },
  "go:2708": { concept: "Algebraic structures - groups under addition and multiplication", markdown: String.raw`Rational numbers under addition form an abelian group, and integers under addition do as well. Nonzero real numbers under multiplication form an abelian group because every element has a reciprocal. But all rational numbers under multiplication include $0$, which has no multiplicative inverse; therefore this is not a group.

**Option C is false.**`, images: [] }
};

const HOLD_REASONS = {
  "go:2218": "The local option C is rendered as sqrt(-2), but a reproduced copy of the original GATE CSE 1997 paper gives option C as -sqrt(2). Starting Newton-Raphson at -1 converges to -sqrt(2), so the stored choice letter matches the original paper but not the displayed local option. Keep on HOLD pending correction of the question option text; do not publish a solution against the corrupted stem."
};

const NOTES = {
  "go:1642": "Only if translates S implies G; the converse is G implies S.",
  "go:1643": "The universal relation A cross A is the largest equivalence relation and has n squared pairs.",
  "go:1644": "Intersections preserve equivalence properties; two overlapping nonnested partitions make a nontransitive union.",
  "go:1645": "Each of m inputs has n independent image choices, giving n^m functions.",
  "go:1660": "Count start/end positions, n+(n-1)+...+1.",
  "go:1673": "The fourth row duplicates the first; the first three rows are independent, giving rank three.",
  "go:1674": "Row subtraction factors the determinant as (a-b)(a-c)(c-b).",
  "go:1675": "The missing (4,4) makes it neither reflexive nor irreflexive; checking its possible two-step paths confirms transitivity.",
  "go:1676": "Three-set inclusion-exclusion gives 28=55-33+x, so x=6.",
  "go:1694": "The meeting band is the 60-by-60 square minus two 50-by-50 right triangles; nonmeeting probability is 25/36, within the stored NAT tolerance.",
  "go:2217": "Inclusion-exclusion gives intersection 0.5+0.6-0.7=0.4.",
  "go:2219": "Upper-triangular determinant is the diagonal product -48.",
  "go:2232": "max has no identity on all integers because the integers have no least element.",
  "go:2233": "Option C simplifies to a propositional tautology; simple truth assignments refute A, B, and D.",
  "go:2234": "The complements of e are g, c, and d: each has meet f and join a.",
  "go:2242": "An upward-opening quadratic reaches its interval maximum at an endpoint; f(0)=6 and f(2)=10.",
  "go:2243": "Right multiplication by I12 swaps columns 1 and 2.",
  "go:2245": "Constant nonzero second differences show degree two is necessary and sufficient.",
  "go:2257": "x must be first, y last, and the n middle elements are freely permutable.",
  "go:2259": "Equivalence relations correspond to set partitions; Bell number B4 is 15.",
  "go:2705": "The three disjoint regions partition A union B.",
  "go:2706": "The divisibility cover relations are 2-6, 3-6, 6-12, 12-24.",
  "go:2707": "97 is prime, so n^m=97 forces m=1,n=97.",
  "go:2708": "Zero has no multiplicative inverse in Q."
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
    if (!answerRecord || JSON.stringify(answerRecord.answer) !== JSON.stringify(question.officialAnswer)) {
      throw new Error("Existing answer record mismatch for " + question.uid);
    }
    question.review = {
      reviewer: "Codex",
      reviewedAt: DATE,
      identityVerified: true,
      stemOptionsAndDiagramChecked: true,
      sourceUrl: question.goLink,
      researchLinks: [{ url: question.goLink, accessedAt: DATE }],
      independentCheck: NOTES[question.uid] || HOLD_REASONS[question.uid],
      notes: NOTES[question.uid] || HOLD_REASONS[question.uid]
    };
    if (HOLD_REASONS[question.uid]) {
      question.status = "HOLD";
      question.specialCategory = "HOLD";
      question.review.disposition = "HOLD";
      question.review.researchLinks.push({ url: "https://image-static.collegedunia.com/public/image/gate_cs_1997_c64d2cc59f08c6a1959b95dd2b3154f0.pdf", accessedAt: DATE });
      question.review.answerKeySource = "Existing UID answer record and GateOverflow page; reproduced original paper verifies a different option-C expression than the local stem.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = "STEM_SOURCE_CONFLICT";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_MATH_17_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
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
  console.log(`${ID}: reviewed ${chunk.questions.length}; accepted ${accepted}; held ${held}.`);
}

function inject() {
  const chunk = readJson(CHUNK);
  const accepted = new Set(chunk.questions.filter(q => q.status !== "HOLD").map(q => q.uid));
  const content = fs.readFileSync(PATCH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const additions = [];
  let refreshed = 0;
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_17_SOLUTIONS)) {
    if (!accepted.has(uid)) continue;
    const line = "  " + JSON.stringify(uid) + ": " + JSON.stringify(solution) + ",";
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
  console.log(`${ID}: synchronized ${accepted.size} solutions; ${additions.length} new, ${refreshed} refreshed.`);
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
  console.log(`${ID}: verified ${accepted.length} integrated; ${held.length} held in special category.`);
}

if (process.argv[1]?.includes("apply-chunk-cse-math-17")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
