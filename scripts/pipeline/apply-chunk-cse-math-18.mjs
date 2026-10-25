import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-MATH-18";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-math-18.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

export const CHUNK_CSE_MATH_18_SOLUTIONS = {
  "go:2709": { concept: "Probability - complement rule for two dice", markdown: String.raw`Each die independently fails to show a 6 with probability $5/6$. The event that neither die shows 6 therefore has probability $(5/6)^2=25/36$. Taking its complement,

$$P(\text{at least one 6})=1-\frac{25}{36}=\frac{11}{36}.$$

The value $1/36$ counts two sixes, $1/3$ is not the event probability, and $25/36$ is the probability of no six.

**Therefore, the correct answer is Option D ($11/36$).**`, images: [] },
  "go:2710": { concept: "Calculus - central finite difference for the second derivative", markdown: String.raw`Use Taylor expansions about $x_0$:

$$f(x_0\pm h)=f(x_0)\pm hf'(x_0)+\frac{h^2}{2}f''(x_0)\pm\frac{h^3}{6}f'''(x_0)+O(h^4).$$

Adding the two expansions cancels the odd-derivative terms. Thus $f(x_0+h)-2f(x_0)+f(x_0-h)=h^2f''(x_0)+O(h^4)$, giving the approximation

$$f''(x_0)\approx\frac{f(x_0+h)-2f(x_0)+f(x_0-h)}{h^2}.$$

The numerator must be a second difference: the first two choices are scaled averages/differences, while option C has the wrong sign on the central term.

**Therefore, the correct answer is Option D.**`, images: [] },
  "go:2711": { concept: "Linear algebra - consistency and uniqueness of linear systems", markdown: String.raw`A system $Ax=b$ is consistent exactly when $\operatorname{rank}(A)=\operatorname{rank}([A\ b])$, so A is true. If $m<n$ and $b=0$, then $\operatorname{rank}(A)\le m<n$; rank-nullity gives a nonzero nullspace and hence infinitely many solutions, so B is true. For square $A$, a unique solution requires $A$ to be nonsingular, regardless of whether $b$ is zero. A nonzero $b$ alone does not guarantee that; for example, $A=0$ and $b\ne0$ has no solution. Thus C is false. D states the standard full-rank homogeneous-system result and is true.

**Therefore, the false statement is Option C.**`, images: [] },
  "go:2730": { concept: "Functions - inverse of a linear transformation", markdown: String.raw`Let $(u,v)=f(x,y)=(x+y,x-y)$. Adding and subtracting these equations gives $u+v=2x$ and $u-v=2y$. Hence $x=(u+v)/2$ and $y=(u-v)/2$, so

$$f^{-1}(u,v)=\left(\frac{u+v}{2},\frac{u-v}{2}\right).$$

Replacing $(u,v)$ with $(x,y)$ matches option C. The inverse must undo both the sum and difference, including division by 2.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2731": { concept: "Relations - disjointness relation", markdown: String.raw`For sets $A,B$, $A\cap B=\varnothing$ is symmetric because $A\cap B=B\cap A$. It is not transitive: take $A=\{1\}$, $B=\{2\}$, and $C=\{1\}$. Then $A$ is disjoint from $B$ and $B$ from $C$, but $A$ is not disjoint from $C$. Thus the relation is not an equivalence relation. In general it is also not reflexive on nonempty sets, so the reflexive claims do not hold.

**Therefore, the true statement is Option B: symmetric and not transitive.**`, images: [] },
  "go:2732": { concept: "Propositional logic - implication and equivalence", markdown: String.raw`A, B, and C are tautologies. A is modus ponens written as an implication. In B, if $x$ is true the conclusion is true; if $x$ is false, its two antecedents require both $y$ and $\neg y$, making their conjunction false. C is the implication $x\to(x\lor y)$, which is always true.

For D, choose $x=F,y=T$. Then $x\lor y=T$, whereas $\neg x\to\neg y$ is $T\to F=F$. Their biconditional is false, so D is not true.

**Therefore, the statement that is NOT true is Option D.**`, images: [] },
  "go:2733": { concept: "Group theory - groups and string concatenation", markdown: String.raw`Bijective maps on a finite set form a group under composition: composition is associative, the identity map is present, and each bijection has an inverse. The nonzero residues modulo prime $p$ form the multiplicative group modulo $p$, since every nonzero residue has a multiplicative inverse. The subgroup test in D is a standard criterion: a nonempty subset $S$ of a group is a subgroup iff $ab^{-1}\in S$ for every $a,b\in S$.

All strings over an alphabet have the empty string as identity under concatenation, but a nonempty string has no inverse: concatenation only increases length. Therefore C is the false statement.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2735": { concept: "Linear algebra - commuting a rotation and diagonal matrix", markdown: String.raw`Write $R=\begin{bmatrix}c&-s\\s&c\end{bmatrix}$ with $c=\cos\theta$, $s=\sin\theta$, and $D=\begin{bmatrix}a&0\\0&b\end{bmatrix}$. The off-diagonal entries of $RD$ are $-bs$ and $as$, while those of $DR$ are $-as$ and $bs$. Equality therefore requires $(a-b)s=0$, or $a=b$ or $\sin\theta=0$. The latter means $\theta=n\pi$ for integer $n$.

**Therefore, the correct answer is Option A.**`, images: [] },
  "go:2736": { concept: "Probability - sampling without replacement", markdown: String.raw`The first card is an ace with probability $4/52$. Once it is an ace, only 3 aces remain among 51 cards, so the conditional probability that the bottom card is also an ace is $3/51$. Therefore,

$$P(\text{both aces})=\frac{4}{52}\cdot\frac{3}{51}.$$

The draws are dependent because the first card is not replaced; options using 4 aces for the second draw or denominator 52/52 do not account for this.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2606": { concept: "Relations - symmetric and transitive do not imply reflexive", markdown: String.raw`Symmetry and transitivity alone do not force reflexivity. On a nonempty set $A=\{1\}$, take $R=\varnothing$. It is symmetric and transitive vacuously, but it is not reflexive because $(1,1)\notin R$. Thus A, B, and C each claim reflexivity without justification; in particular, neither an equivalence relation nor a partial order follows.

**Therefore, the correct answer is Option D (none of the above).**`, images: [] },
  "go:2607": { concept: "Set theory - cardinality of a power set", markdown: String.raw`The set $S=\{\{\varnothing\},1,\{2,3\}\}$ has three distinct elements: the set containing the empty set, the number $1$, and the set containing $2$ and $3$. A set with $n$ elements has $2^n$ subsets, since each element is either included or excluded. Hence $|P(S)|=2^3=8$.

**Therefore, the correct answer is Option C (8).**`, images: [] },
  "go:2608": { concept: "Calculus - uniqueness of a fixed point", markdown: String.raw`Define $g(x)=x-\cos x$ on $[0,\pi]$. Its derivative is $g'(x)=1+\sin x>0$, so $g$ is strictly increasing and can have at most one zero. Also $g(0)=-1<0$ and $g(\pi)=\pi+1>0$, so continuity guarantees a zero between the endpoints. There is therefore exactly one solution to $x=\cos x$.

**Therefore, the correct answer is Option B.**`, images: [] },
  "go:2609": { concept: "Differential equations - level curves of an ellipse", markdown: String.raw`Interpret the slope as $dy/dx=-2x/y$. Separating variables gives $y\,dy=-2x\,dx$. Integrating,

$$\frac{y^2}{2}=-x^2+C\quad\Longrightarrow\quad 2x^2+y^2=C_1.$$

For a nondegenerate real curve ($C_1>0$), this is an ellipse centered at the origin. The line, parabola, and circle options do not satisfy this general quadratic level-curve equation.

**Therefore, the correct answer is Option D (an ellipse).**`, images: [] },
  "go:2610": { concept: "Analytic geometry - real pair of lines from a homogeneous quadratic", markdown: String.raw`For $Ax^2+Bxy+Cy^2=0$ to represent two real lines through the origin, its discriminant must be nonnegative. Here $A=4$, $B=-8$, and $C=k$, so

$$B^2-4AC=64-16k=16(4-k).$$

At $k=9$ this is $-80<0$, so the quadratic has no real line factors. The other listed values $0,2,3$ give a nonnegative discriminant and do represent real line pairs (with the zero-discriminant case a repeated line).

**Therefore, the correct answer is Option C (9).**`, images: [] },
  "go:2611": { concept: "Linear algebra - rank of a repeated-row matrix", markdown: String.raw`Every row of the displayed $(n+1)\times(n+1)$ matrix is the same vector $(1,a,a^2,\ldots,a^n)$. This vector is nonzero because its first entry is $1$. The row space is therefore spanned by one nonzero vector, regardless of the value of $a$, and the rank is exactly $1$.

**Therefore, the correct answer is Option A (1).**`, images: [] },
  "go:2612": { concept: "Graph theory - minimum edges in a connected cyclic graph", markdown: String.raw`A connected graph on $n$ vertices needs at least $n-1$ edges; a spanning tree attains that minimum but has no cycle. To create a cycle, at least one additional edge is necessary, giving at least $n$ edges. A cycle through all $n$ vertices is connected and has exactly $n$ edges, so this lower bound is achievable.

**Therefore, the correct answer is Option B ($n$).**`, images: [] },
  "go:780": { concept: "Probability - counting three-digit numbers without a specified digit", markdown: String.raw`There are $999-100+1=900$ three-digit integers. To avoid digit 7, the hundreds digit has 8 choices ($1$ through $9$ except $7$), and each of the tens and units digits has 9 choices (including $0$, excluding $7$). Thus $8\cdot9\cdot9=648$ valid numbers, and

$$P=\frac{648}{900}=\frac{18}{25}.$$

**Therefore, the correct answer is Option D ($18/25$).**`, images: [] },
  "go:2620": { concept: "Algebra - solving a cubic with cube roots of unity", markdown: String.raw`Set $t=x-1$. The equation becomes $t^3=-8$, whose three roots are $-2$, $-2\omega$, and $-2\omega^2$, where $1,\omega,\omega^2$ are the cube roots of unity. Adding 1 to each root gives

$$x=-1,\quad 1-2\omega,\quad 1-2\omega^2.$$

The options with plus signs have the wrong signs after solving $(x-1)^3=-8$.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2625": { concept: "Vector algebra - unit vector perpendicular to two vectors", markdown: String.raw`A vector perpendicular to both $a=(2,-3,1)$ and $b=(1,1,-2)$ is their cross product:

$$a\times b=(5,5,5)=5(1,1,1).$$

Its magnitude is $5\sqrt3$, so normalizing gives $(1,1,1)/\sqrt3$. Directly, its dot products with $a$ and $b$ are proportional to $2-3+1=0$ and $1+1-2=0$.

**Therefore, the correct answer is Option A.**`, images: [] },
  "go:2626": { concept: "Probability - two draws of different colors", markdown: String.raw`The draws are without replacement. The two disjoint orders are white then black and black then white:

$$P=\frac{10}{25}\frac{15}{24}+\frac{15}{25}\frac{10}{24}=\frac{150}{600}+\frac{150}{600}=\frac12.$$

Equivalently, either order contributes $150/600$, for total $300/600$. This matches the listed value $1/2$.

**Therefore, the correct answer is Option C ($1/2$).**`, images: [] },
  "go:2629": { concept: "Group theory - general linear group", markdown: String.raw`For a fixed matrix order $n\ge2$, the nonsingular real matrices form $GL_n(\mathbb R)$ under multiplication: multiplication is associative, the identity matrix is included, products stay nonsingular, and every matrix has an inverse. The group is not abelian in general. For example,

$$\begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}1&0\\1&1\end{bmatrix}=\begin{bmatrix}2&1\\1&1\end{bmatrix}\ne\begin{bmatrix}1&1\\1&2\end{bmatrix}=\begin{bmatrix}1&0\\1&1\end{bmatrix}\begin{bmatrix}1&1\\0&1\end{bmatrix}.$$

**Therefore, under the standard $n\times n$ matrix convention with $n\ge2$, the correct answer is Option D.**`, images: [] },
  "go:2631": { concept: "Propositional logic - determining a formula from a premise", markdown: String.raw`The premise $\neg p\to q$ is equivalent to $p\lor q$. The target is

$$\neg p\lor(p\to q)=\neg p\lor(\neg p\lor q)=\neg p\lor q.$$

The premise does not fix the target: if $p=F,q=T$, the premise and target are both true; if $p=T,q=F$, the premise $T\lor F$ is true but the target $F\lor F$ is false. Since both assignments satisfy the premise and give different target values, the truth value cannot be determined.

**Therefore, the correct answer is Option D.**`, images: [] },
  "go:359942": { concept: "Calculus - standard trigonometric limit", markdown: String.raw`For $0<x<\pi/2$, the standard geometric squeeze gives $\cos x\le \sin x/x\le1$. As $x\to0^+$, both bounds approach 1, so the limit from the right is 1. Since $\sin x/x$ is even, its left-hand limit is the same. This derives the result without a power-series expansion.

**Therefore, the numerical answer is 1.**`, images: [] },
  "go:2664": { concept: "Calculus - minimum of a quadratic by completing the square", markdown: String.raw`Complete the square:

$$3-4x+2x^2=2(x^2-2x)+3=2(x-1)^2+1.$$

Because $(x-1)^2\ge0$, the expression is at least 1, with equality at $x=1$. Thus its minimum is 1.

**Therefore, the numerical answer is 1.**`, images: [] }
};

const HOLD_REASONS = {
  "go:2630": "The displayed choices C and D are mathematically equivalent: C1*e^(-x)+C2*e^(-2x) and C1*e^(-2x)+C2*e^(-x) describe the same two-parameter solution family because C1 and C2 are arbitrary constants. The characteristic equation has roots -1 and -2, so both listed choices are correct after renaming constants. Keep on HOLD until the duplicated option or answer record is resolved."
};

const NOTES = {
  "go:2709": "Complement count: neither die shows 6 with probability (5/6)^2, so the requested probability is 11/36.",
  "go:2710": "Central Taylor differences cancel the first derivative and isolate f''(x0), yielding option D.",
  "go:2711": "A square system with nonzero b need not be nonsingular or uniquely solvable; option C is false.",
  "go:2730": "Solve u=x+y and v=x-y for x,y to obtain the inverse in option C.",
  "go:2731": "Disjointness is symmetric; {1},{2},{1} is a counterexample to transitivity.",
  "go:2732": "A, B, and C are tautologies; x=false,y=true makes the biconditional in D false.",
  "go:2733": "Nonempty strings lack concatenation inverses, so the set of all strings is not a group.",
  "go:2735": "The two products commute exactly when (a-b)sin(theta)=0.",
  "go:2736": "After drawing one ace, 3 of 51 cards remain aces; the answer is 4/52 times 3/51.",
  "go:2606": "The empty relation on a nonempty set is symmetric and transitive but not reflexive, so none of A-C follows.",
  "go:2607": "S has three distinct elements and therefore its power set has 2^3=8 members.",
  "go:2608": "x-cos(x) is strictly increasing and changes sign on [0,pi], giving exactly one root.",
  "go:2609": "Separation and integration give 2x^2+y^2=C, an ellipse for a nondegenerate real curve.",
  "go:2610": "The discriminant is 64-16k; k=9 gives no real pair of lines.",
  "go:2611": "All rows equal a nonzero vector whose first coordinate is 1; rank is exactly one.",
  "go:2612": "A spanning tree has n-1 edges; adding one edge is necessary and sufficient for a cycle.",
  "go:780": "There are 8*9*9 valid three-digit numbers without digit 7 among 900 total.",
  "go:2620": "The roots of (x-1)^3=-8 are -1, 1-2omega, and 1-2omega^2.",
  "go:2625": "The cross product is (5,5,5); normalizing gives (i+j+k)/sqrt(3).",
  "go:2626": "Summing the WB and BW draw orders gives probability 1/2.",
  "go:2629": "GL_n(R) is a group and is nonabelian for n>=2; explicit 2x2 matrices do not commute.",
  "go:2630": HOLD_REASONS["go:2630"],
  "go:2631": "Premise and target simplify to p or q and not-p or q respectively; satisfying assignments give different target values.",
  "go:359942": "The squeeze cos(x)<=sin(x)/x<=1 as x approaches zero gives 1 without power series.",
  "go:2664": "Completing the square gives 2(x-1)^2+1, whose minimum is 1."
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
      independentCheck: NOTES[question.uid],
      notes: NOTES[question.uid]
    };
    if (HOLD_REASONS[question.uid]) {
      question.status = "HOLD";
      question.specialCategory = "HOLD";
      question.review.disposition = "HOLD";
      question.review.answerKeySource = "Existing UID answer record and displayed question/options; independent derivation confirms the choices are equivalent.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = "AMBIGUOUS_OPTIONS";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_MATH_18_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
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
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_18_SOLUTIONS)) {
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

if (process.argv[1]?.includes("apply-chunk-cse-math-18")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
