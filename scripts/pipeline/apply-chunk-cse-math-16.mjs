import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-MATH-16";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-math-16.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

export const CHUNK_CSE_MATH_16_SOLUTIONS = {
  "go:696": { concept: "Propositional logic - satisfiability and validity", markdown: String.raw`$F_1=P\Rightarrow\neg P$ is equivalent to $\neg P$, so it is true when $P$ is false and is therefore satisfiable. In $F_2$, the first implication is $\neg P$ and the second, $\neg P\Rightarrow P$, is equivalent to $P$. Their disjunction $\neg P\lor P$ is a tautology.

Thus $F_1$ is satisfiable and $F_2$ is valid.

**Option A.**`, images: [] },
  "go:719": { concept: "Combinatorics - distinct four-digit even numbers", markdown: String.raw`Split by the last digit.

- If the last digit is $0$, the first digit has $9$ choices, then the middle digits have $8$ and $7$ choices: $9\cdot8\cdot7=504$.
- If the last digit is one of $2,4,6,8$, there are $4$ choices for it. The first digit then has $8$ nonzero choices, followed by $8$ and $7$ choices for the middle digits: $4\cdot8\cdot8\cdot7=1792$.

The total is $504+1792=2296$.

**Option B (2296).**`, images: [] },
  "go:720": { concept: "Set theory and number systems - existence examples", markdown: String.raw`For $S_1$, let $A$ be the positive even integers and let $B=C$ be the positive odd integers. All three sets are infinite, while $A\cap(B\cup C)=\varnothing$, which is finite.

For $S_2$, take $x=\sqrt2$ and $y=-\sqrt2$. Both are irrational and their sum is $0$, a rational number. Both statements hold.

**Option C.**`, images: [] },
  "go:721": { concept: "Functions - images of unions and intersections", markdown: String.raw`For any function, an element belongs to $f(E\cup F)$ exactly when it is $f(x)$ for some $x$ in $E$ or in $F$. Hence $f(E\cup F)=f(E)\cup f(F)$.

For intersections, only the inclusion $f(E\cap F)\subseteq f(E)\cap f(F)$ is guaranteed. Equality can fail: if $f$ is constant and $E,F$ are disjoint singletons, the right side contains the common function value while the left side is empty. Thus only $S_1$ is always true.

**Option A.**`, images: [] },
  "go:722": { concept: "Probability - independent accident days", markdown: String.raw`Treat the seven distinct accidents as independently assigned to one of the seven days, so there are $7^7$ equally likely day assignments. For all seven to fall on the same day, choose that day in $7$ ways. Therefore,

$$P=\frac{7}{7^7}=\frac{1}{7^6}.$$

**Option B.**`, images: [] },
  "go:733": { concept: "Graph theory - counting simple undirected graphs", markdown: String.raw`A simple undirected graph on the given labeled vertices has one possible edge for each unordered pair of distinct vertices. There are $\binom n2=\frac{n(n-1)}2$ such pairs, and each pair can independently be either an edge or a non-edge. Thus the number of graphs is

$$2^{\binom n2}=2^{n(n-1)/2}.$$

**Option D.**`, images: [] },
  "go:624": { concept: "Combinatorics - pigeonhole principle for suits", markdown: String.raw`To avoid having three cards of one suit, at most two cards can be drawn from each of the four suits, for a total of $4\cdot2=8$. The next card must make some suit appear at least three times by the pigeonhole principle.

**Option C (9 cards).**`, images: [] },
  "go:626": { concept: "Linear algebra - determinant by expansion", markdown: String.raw`Expand along the second column, which has only one nonzero entry, the $1$ in row 2. The cofactor sign is $(-1)^{2+2}=1$, and the remaining determinant is

$$\det\begin{bmatrix}2&0&0\\2&2&0\\9&6&1\end{bmatrix}=2\cdot2\cdot1=4,$$

since this matrix is lower triangular.

**Option A (4).**`, images: [] },
  "go:649": { concept: "Probability - equal independent events with full union", markdown: String.raw`Let $p=P(E_1)=P(E_2)$. Independence gives $P(E_1\cap E_2)=p^2$. By inclusion-exclusion and the union condition,

$$1=P(E_1\cup E_2)=p+p-p^2,$$

so $(p-1)^2=0$ and $p=1$.

**Option D (1).**`, images: [] },
  "go:650": { concept: "Calculus - comparing an increasing sum and integral", markdown: String.raw`Let $f(x)=x\log_2x$. Its derivative is $f'(x)=\log_2x+1/\ln2>0$ for $x\ge2$, so $f$ is strictly increasing there. On each interval $[i-1,i]$, $f(x)<f(i)$ except at the endpoint. Summing these integral comparisons for $i=3,4,\ldots,100$ gives

$$T=\int_2^{100}f(x)\,dx<\sum_{i=3}^{100}f(i)=S.$$

**Option A ($S>T$).**`, images: [] },
  "go:651": { concept: "Algebra - minimum degree interpolation", markdown: String.raw`The polynomial must take prescribed values at five distinct inputs. A polynomial of degree at most $4$ interpolating these values exists. To rule out degree at most $3$, consider the values at $1,2,3,4,5$: $1,-1,1,-1,1$. Their fourth forward difference is $16\ne0$, whereas the fourth difference of any polynomial of degree at most $3$ is zero. The minimum degree is therefore $4$.

**Option D.**`, images: [] },
  "go:652": { concept: "Relations - parity equivalence classes", markdown: String.raw`The condition $xRy$ means $x+y$ is even, which holds exactly when $x$ and $y$ have the same parity. Equality of parity is reflexive, symmetric, and transitive, so $R$ is an equivalence relation. The integers split into exactly two classes: the even integers and the odd integers.

**Option C.**`, images: [] },
  "go:654": { concept: "Propositional logic - equivalence and implication", markdown: String.raw`Since $b\lor\neg b$ is always true and $a\Leftrightarrow(b\lor\neg b)$, $a$ is true. Also $b\Leftrightarrow c$ means $b$ and $c$ have the same truth value. If $b$ is false, the antecedent $a\land b$ is false and the implication is true. If $b$ is true, then $c$ is true and the consequent $(a\land c)\lor d$ is true, regardless of $d$. Thus the formula is always true.

**Option A.**`, images: [] },
  "go:1455": { concept: "Probability - a value bounded by its expectation", markdown: String.raw`Suppose every sample-point value were strictly less than $5$. Then $5-X$ would be positive everywhere, so its expectation would be positive; this would imply $E[X]<5$, contradicting the given $E[X]=5$. Hence at least one sample point has $X\ge5$. The expectation alone does not guarantee that $X$ equals $5$ or exceeds $5$.

**Option C ($X\ge5$ at some sample point).**`, images: [] },
  "go:1456": { concept: "Combinatorics - counting binary relations", markdown: String.raw`A binary relation on an $n$-element set is any subset of its Cartesian square $A\times A$. This square has $n^2$ ordered pairs. Each pair may independently be included or excluded, giving

$$2^{n^2}$$

relations.

**Option C.**`, images: [] },
  "go:1457": { concept: "Probability - union, independence, and conditional probability", markdown: String.raw`Inclusion-exclusion gives

$$P(E_1\cup E_2)=\frac12+\frac13-\frac15=\frac{19}{30},$$

not $2/3$. Independence would require $P(E_1\cap E_2)=P(E_1)P(E_2)=1/6$, but the intersection is $1/5$, so the events are not independent. Also,

$$P(E_1\mid E_2)=\frac{1/5}{1/3}=\frac35,$$

not $4/5$. Thus only the non-independence statement is true.

**Option C.**`, images: [] },
  "go:1468": { concept: "Graph theory - articulation points", markdown: String.raw`An articulation point is a vertex whose removal increases the number of connected components. In the pictured graph, removing vertex $2$ separates its pendant neighbor $4$ from the triangle. Removing vertex $3$ breaks the only connection between the left triangle and the part containing $5,6,7$. Removing vertex $5$ isolates the two pendant vertices $6$ and $7$ from the rest. Removing any other vertex leaves the graph connected. There are three articulation points: $2,3,5$.

**Option D (3).**`, images: [] },
  "go:1479": { concept: "Combinatorics - counting binary relations", markdown: String.raw`A binary relation on an $n$-element set is a subset of the $n^2$ ordered pairs in $A\times A$. Every one of those pairs has two independent choices, included or excluded. Hence the count is $2^{n^2}$.

**Option C.**`, images: [] },
  "go:1480": { concept: "Combinatorics - binary strings with nonadjacent ones", markdown: String.raw`Place the $n$ zeros first. They create $n+1$ available gaps: before the first zero, between consecutive zeros, and after the last zero. To prevent adjacent ones, put at most one $1$ in each gap. Choosing the $k$ gaps for the ones gives $\binom{n+1}{k}$ strings. This expression is not among A-C.

**Option D (none of the above).**`, images: [] },
  "go:1481": { concept: "Order theory - posets and lattices", markdown: String.raw`Reflexivity, antisymmetry, and transitivity are exactly the defining properties of a partial order, so $L$ is a poset. The existence of a least upper bound and greatest lower bound for every pair says exactly that this poset is a lattice. These conditions do not guarantee a Boolean algebra; for example, a three-element chain is a lattice but its middle element has no complement.

**Options A and C.**`, images: [] },
  "go:1638": { concept: "Probability - exactly one odd outcome", markdown: String.raw`Each die roll is odd with probability $1/2$. Choose which of the three rolls is the sole odd result in $\binom31$ ways; each such parity pattern has probability $(1/2)^3$. Therefore,

$$P=\binom31\left(\frac12\right)^3=\frac38.$$

**Option B.**`, images: [] },
  "go:1639": { concept: "Linear algebra - inconsistency in a linear system", markdown: String.raw`The second equation has a left side exactly twice that of the first: $4x+8y=2(x+2y)$. If the first equation $x+2y=5$ held, doubling it would give $4x+8y=10$, contradicting the second equation's requirement $4x+8y=12$. No pair $(x,y)$ can satisfy both equations, so the full system has no solution.

**Option B.**`, images: [] },
  "go:1641": { concept: "Calculus - continuity and differentiability of absolute value", markdown: String.raw`The absolute-value function is continuous everywhere, including at $x=0$. For $x>0$ its derivative is $1$, and for $x<0$ its derivative is $-1$. Since the one-sided derivatives at $0$ differ, the function is not differentiable there; hence it is not differentiable on the whole interval.

**Option B.**`, images: [] }
};

const HOLD_REASONS = {
  "go:648": "For unit intervals, the two half-unit overlaps force each adjacent pair of left endpoints to differ by 1/2. Consequently the X-Z overlap can only be 0 or 1, not an arbitrary intermediate value such as 1/2. The existing key and GateOverflow page mark option C ('can take any value between 0 and 1'), which conflicts with the literal wording; retain on HOLD pending a source/wording resolution.",
  "go:653": "With arbitrary sets in standard set theory, option B is not always true: for S={empty set}, P(S) intersect P(P(S)) contains both empty set and {empty set}. The existing answer record and GateOverflow key mark B, relying on an unstated restriction on the elements of S. Since the stem says 'always', retain on HOLD rather than asserting the restricted interpretation."
};

const NOTES = {
  "go:696": "F1 is equivalent to not P and is satisfiable; F2 simplifies to not P or P, a tautology.",
  "go:719": "Count separately for final digit 0 and for one of 2,4,6,8: 504+1792=2296.",
  "go:720": "Disjoint infinite even/odd sets witness S1; sqrt(2) and -sqrt(2) witness S2.",
  "go:721": "Images distribute over unions; a constant function on disjoint singleton sets disproves intersection equality.",
  "go:722": "Seven favorable common-day assignments among 7^7 total assignments give 1/7^6.",
  "go:733": "Each of the n choose 2 possible unordered edges is independently present or absent.",
  "go:624": "Eight cards can avoid triples by taking two per suit; card nine forces a triple.",
  "go:626": "Expand along column two; the remaining lower-triangular determinant is 4.",
  "go:649": "The union equation reduces to 1=2p-p^2, so p=1.",
  "go:650": "x log2(x) is strictly increasing for x>=2; compare each integral interval [i-1,i] with its right endpoint term.",
  "go:651": "Five-point interpolation permits degree four; nonzero fourth forward difference rules out degree at most three.",
  "go:652": "The relation is equality of parity and has the even and odd classes.",
  "go:654": "a is true and b=c; if b is true the consequent is true, otherwise the antecedent is false.",
  "go:1455": "If all X values were below five then their expectation would be below five; thus some value is at least five.",
  "go:1456": "A relation is a subset of n^2 ordered pairs, giving 2^(n^2) choices.",
  "go:1457": "The union is 19/30, intersection 1/5 disproves independence, and conditional probability is 3/5.",
  "go:1468": "Removing 2, 3, or 5 increases the component count; the displayed graph has exactly these three cut vertices.",
  "go:1479": "A binary relation is a subset of A cross A, so there are 2^(n^2).",
  "go:1480": "The n zeros form n+1 gaps; choose k distinct gaps for the ones, giving C(n+1,k), absent from A-C.",
  "go:1481": "The axioms define a poset and pairwise lub/glb make it a lattice; Boolean structure is not implied.",
  "go:1638": "Choose the sole odd roll in 3 ways; each parity pattern has probability 1/8.",
  "go:1639": "The second equation's left side is twice the first's, but its right side is 12 instead of 10.",
  "go:1641": "Absolute value is continuous at zero, but its left and right derivatives differ."
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
      question.review.answerKeySource = "Existing UID answer record and GateOverflow question page; an unresolved wording/answer conflict remains.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = "UNRESOLVED_CONFLICT";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_MATH_16_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
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
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_16_SOLUTIONS)) {
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

if (process.argv[1]?.includes("apply-chunk-cse-math-16")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
