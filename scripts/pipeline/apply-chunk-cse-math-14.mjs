import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHUNK_ID = "CHUNK-CSE-MATH-14";
const CHUNK_PATH = path.join(ROOT, "data", "solutions", "chunks", "cse", "chunk-cse-math-14.json");
const PATCHES_PATH = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
const REVIEW_DATE = "2026-10-23";
const KEY_INDEX = "https://gatecse.in/previous-year-gate-papers-and-official-keys/";

export const CHUNK_CSE_MATH_14_SOLUTIONS = {
  "go:3779": {
    concept: "Set theory - longest chain in a power set",
    markdown: String.raw`### Bound the chain by subset size
Any two distinct members of $C$ must be comparable by inclusion, so they form a strict chain. Along a strict inclusion chain, subset cardinality increases by at least one at every step. Cardinalities range from $0$ through $n$, giving at most $n+1$ members.

### Attain the bound
For an ordering $a_1,\ldots,a_n$ of $A$, the chain
$$\varnothing\subset\{a_1\}\subset\{a_1,a_2\}\subset\cdots\subset A$$
contains exactly $n+1$ subsets.

### Final answer
**Option B ($n+1$).**`,
    images: []
  },
  "go:3780": {
    concept: "Number theory - Euler totient of p squared q",
    markdown: String.raw`### Count integers coprime to $p^2q$
Among $1,\ldots,p^2q$, the integers coprime to $p^2q$ are those divisible by neither prime $p$ nor prime $q$. Apply Euler's totient formula:
$$\varphi(p^2q)=p^2q\left(1-\frac1p\right)\left(1-\frac1q\right)=p(p-1)(q-1).$$

The inclusion of the endpoint $m=p^2q$ causes no exception; it is not coprime to $n$.

### Final answer
**Option D: $p(p-1)(q-1)$.**`,
    images: []
  },
  "go:1371": {
    concept: "Combinatorics - binary search trees and Catalan numbers",
    markdown: String.raw`### Count by the root key
If the root is the $i$th key in sorted order, the left and right subtrees contain $i-1$ and $4-i$ keys. Thus the number $T_4$ satisfies
$$T_4=\sum_{i=1}^{4}T_{i-1}T_{4-i},\qquad T_0=1.$$
Using $T_1=1$, $T_2=2$, and $T_3=5$ gives
$$T_4=1\cdot5+1\cdot2+2\cdot1+5\cdot1=14.$$
Equivalently, $T_4$ is the fourth Catalan number $\frac1{5}\binom84=14$.

### Final answer
**Option B (14).**`,
    images: []
  },
  "go:3782": {
    concept: "Calculus - symmetry of an odd integrand",
    markdown: String.raw`### Shift the interval to be symmetric
Set $t=x-\pi$. Then $x=t+\pi$, the limits become $-\pi$ and $\pi$, and
$$\sin x=\sin(t+\pi)=-\sin t.$$
The integral is therefore
$$-\int_{-\pi}^{\pi}t^2\sin t\,dt.$$
Since $t^2$ is even and $\sin t$ is odd, their product is odd. Its integral over symmetric limits is zero.

### Final answer
**Option B (0).**`,
    images: []
  },
  "go:3783": {
    concept: "Predicate logic - universal implication",
    markdown: String.raw`### Verify the universally quantified implication
Assume $\forall x(P(x)\to Q(x))$ and $\forall xP(x)$. For every element $x$, the first assumption gives $P(x)\to Q(x)$ and the second gives $P(x)$, so $Q(x)$ holds. Hence $\forall xQ(x)$.

This proves
$$\bigl[\forall x(P(x)\to Q(x))\bigr]\to\bigl[(\forall xP(x))\to(\forall xQ(x))\bigr]$$
for every domain and every pair of predicates.

### Why the tempting converse fails
Pointwise implications can hold while $P$ and $Q$ are true at different elements, so universal disjunctions cannot generally be distributed as in option A.

### Final answer
**Option B.**`,
    images: []
  },
  "go:1165": {
    concept: "Propositional logic - implication between compound statements",
    markdown: String.raw`### Simplify $X$ and $Y$
Using $U\to V\equiv\neg U\lor V$,
$$X=(P\lor Q)\to R\equiv\neg P\land\neg Q\lor R,$$
while
$$Y=(P\to R)\lor(Q\to R)\equiv\neg P\lor\neg Q\lor R.$$
Every way for $X$ to be true also makes $Y$ true: if $R$ is true, $Y$ is true; otherwise $X$ requires both $P$ and $Q$ false, which makes $Y$ true. Therefore $X\to Y$ is a tautology.

### Final answer
**Option B ($X\to Y$).**`,
    images: []
  },
  "go:1166": {
    concept: "Predicate logic - translating an existential student",
    markdown: String.raw`### Preserve the order of the quantifiers
The statement says that for each person $x$, if $x$ is a teacher, then there exists a student $y$ who likes $x$:
$$\forall x\bigl(\operatorname{teacher}(x)\to\exists y[\operatorname{student}(y)\land\operatorname{likes}(y,x)]\bigr).$$
The existential student may differ from one teacher to another. The conjunction is needed because $y$ must be a student and must like $x$.

### Option check
Option A uses implication inside the existential, which is true for nonstudents without establishing that any student likes the teacher. Option C requires one student to like every teacher; option D asserts that every individual is a teacher.

### Final answer
**Option B.**`,
    images: []
  },
  "go:1167": {
    concept: "Relations - intersection of equivalence relations",
    markdown: String.raw`### Show the intersection is an equivalence relation
If $R$ and $S$ are equivalence relations on $A$, both contain every pair $(a,a)$, so their intersection is reflexive. If $(a,b)$ belongs to both, symmetry gives $(b,a)$ in both. If $(a,b)$ and $(b,c)$ belong to both, transitivity in each gives $(a,c)$ in both. Thus $R\cap S$ is reflexive, symmetric, and transitive.

The union need not be transitive. For example, on $\{1,2,3\}$, let $R$ have classes $\{1,2\},\{3\}$ and $S$ have classes $\{1\},\{2,3\}$. Then $(1,2)$ and $(2,3)$ are in $R\cup S$, but $(1,3)$ is not.

### Final answer
**Option C: $R\cap S$ is always an equivalence relation.**`,
    images: []
  },
  "go:1168": {
    concept: "Functions - surjectivity of a composition",
    markdown: String.raw`### Use the range of the composition
For $h=f\circ g$, every value produced by $h$ is also produced by $f$. If $h:A\to C$ is onto, then every $c\in C$ equals $f(g(a))$ for some $a\in A$, so $c$ lies in the range of $f$. Therefore $f$ must be onto.

The function $g$ need not be onto $B$: it can omit points of $B$ that are unnecessary for $f$ to cover $C$.

### Final answer
**Option B: $f$ must be onto; $g$ need not be.**`,
    images: []
  },
  "go:1170": {
    concept: "Combinatorics - pigeonhole principle with residue pairs",
    markdown: String.raw`### Count the possible residue classes
Each ordered pair $(a,b)$ maps to the residue pair $(a\bmod3,b\bmod5)$. There are $3\cdot5=15$ possible residue pairs.

With 15 chosen pairs, it is still possible to choose one from each residue class, avoiding a match. By the pigeonhole principle, 16 choices force two pairs into the same class; those two pairs have equal residues modulo 3 in the first coordinate and modulo 5 in the second.

### Final answer
**Option C (16).**`,
    images: []
  },
  "go:3642": {
    concept: "Probability - size-biased family selection",
    markdown: String.raw`### Weight each family type by its number of children
Out of $N$ families, $0.3N$ have two children, contributing $0.6N$ children. The total number of children is
$$0.5N\cdot3+0.3N\cdot2+0.2N\cdot1=2.3N.$$
A uniformly chosen child is therefore from a two-child family with probability
$$\frac{0.6N}{2.3N}=\frac6{23}.$$

### Final answer
**Option B ($6/23$).**`,
    images: []
  },
  "go:3643": {
    concept: "Combinatorics - inclusion-exclusion for three courses",
    markdown: String.raw`### Count students taking at least one course
By inclusion-exclusion, the union size is
$$125+85+65-50-35-30+15=175.$$
The pairwise intersections are subtracted once each, then the triple intersection is added back once.

### Count students outside the union
There are 200 students, so the number taking none is $200-175=25$.

### Final answer
**Option C (25).**`,
    images: []
  },
  "go:3644": {
    concept: "Predicate logic - negating nested quantifiers",
    markdown: String.raw`### Negate the statement's complement
Let $P(x,y)=a(x,y)\land b(x,y)$. The given assertion is
$$\exists x\,\forall y\,[P(x,y)\land\neg c(x,y)].$$
Its negation is
$$\neg\forall x\,\exists y\,\neg[P(x,y)\land\neg c(x,y)].$$
By De Morgan's law, the inner negation is $\neg P(x,y)\lor c(x,y)$, which is equivalent to $P(x,y)\to c(x,y)$. Thus the assertion equals
$$\neg\forall x\,\exists y\,[(a(x,y)\land b(x,y))\to c(x,y)],$$
which is option C.

### Final answer
**Option C.**`,
    images: []
  },
  "go:3645": {
    concept: "Relations - composition between finite sets",
    markdown: String.raw`### Determine the intermediate elements
For $R_1$, the admissible even values $b\in B$ satisfy $a+b\equiv0\pmod3$:
$$1\to\{2,8\},\quad3\to\{6\},\quad5\to\{4\},\quad7\to\{2,8\}.$$
For $R_2$, $b+c$ must be even but not divisible by 3. Since $b$ is even, $c$ must be even. Checking $c\in\{2,4\}$ gives
$$2\to\{2\},\quad8\to\{2\},\quad6\to\{2,4\},\quad4\to\{4\}.$$

### Compose the relations
Join each $a\to b$ from the first relation with each $b\to c$ from the second:
$$R_1R_2=\{(1,2),(3,2),(3,4),(5,4),(7,2)\}.$$

### Final answer
**Option C.**`,
    images: []
  },
  "go:3646": {
    concept: "Graph theory - maximum edges in an acyclic graph",
    markdown: String.raw`### Use the forest edge bound
An acyclic undirected graph is a forest. If it has $c$ connected components, it has $n-c$ edges. Since $c\ge1$ for a graph with $n>0$ vertices, the number of edges is at most $n-1$.

The bound is attained by a tree, which is connected and acyclic.

### Final answer
**Option A ($n-1$).**`,
    images: []
  },
  "go:3647": {
    concept: "Linear algebra - solving a three-variable system",
    markdown: String.raw`### Eliminate variables
Subtract the first equation from the second to get $y+z=2$. Subtract twice the first equation from the third to get $-2y-3z=0$, or $2y+3z=0$.
Solving these gives $z=-4$ and $y=6$. Substitute into $x+2y+3z=6$:
$$x+12-12=6\quad\Longrightarrow\quad x=6.$$

### Verify
The other equations give $6+3(-4)= -6$? Instead evaluate the original matrix rows: row one is $6+12-12=6$; row two is $6+18-16=8$; row three is $12+12-12=12$. All three are satisfied.

### Final answer
**Option C: $(x,y,z)=(6,6,-4)$.**`,
    images: []
  },
  "go:1020": {
    concept: "Predicate logic - some boys taller than all girls",
    markdown: String.raw`### Match “some” and “all” to quantifiers
“Some boys” requires an existentially quantified person who is a boy. “All the girls” means that every person who is a girl is shorter than that chosen boy:
$$\exists x\,[\operatorname{boy}(x)\land\forall y(\operatorname{girl}(y)\to\operatorname{taller}(x,y))].$$
The implication in the universal clause restricts the comparison to girls; the existential conjunction ensures the witness is actually a boy.

### Final answer
**Option D.**`,
    images: []
  },
  "go:3678": {
    concept: "Combinatorics - derangements by inclusion-exclusion",
    markdown: String.raw`### Exclude fixed points
There are $5!=120$ permutations of five balls. Let $E_i$ be the event that ball $B_i$ is in its matching cell $C_i$. Inclusion-exclusion gives the derangement count
$$!5=5!-\binom51 4!+\binom52 3!-\binom53 2!+\binom54 1!-\binom55 0!.$$
Evaluating yields $120-120+60-20+5-1=44$.

### Final answer
**Option A (44).**`,
    images: []
  },
  "go:3679": {
    concept: "Linear algebra - inverse from a matrix polynomial",
    markdown: String.raw`### Rearrange the matrix identity
The condition is
$$X^2-X+I=O.$$
Rearrange it as $X-X^2=I$, or
$$X(I-X)=I.$$
Because $I-X$ is a polynomial in $X$, it also commutes with $X$, so $(I-X)X=I$. Hence $X^{-1}=I-X$.

### Match the matrix
Subtract each entry of $X$ from the corresponding entry of $I$:
$$I-X=\begin{bmatrix}1-a&-1\\a^2-a+1&a\end{bmatrix}.$$

### Final answer
**Option B.**`,
    images: []
  },
  "go:3680": {
    concept: "Graph theory - handshaking lemma",
    markdown: String.raw`### Apply the handshaking lemma
The degree sum equals twice the edge count, so it is $2\cdot27=54$. If $k$ is the number of remaining degree-three vertices, then
$$6\cdot2+3\cdot4+3k=54.$$
Thus $24+3k=54$, giving $k=10$. There are $6+3+10=19$ vertices.

### Final answer
**Option D (19).**`,
    images: []
  },
  "go:3682": {
    concept: "Numerical methods - matching root-finding convergence orders",
    markdown: String.raw`### Match the standard convergence behavior
False position preserves a sign-changing bracket and has linear convergence: $Q\to III$. Newton-Raphson has quadratic convergence: $R\to II$. The secant method has order $\varphi\approx1.62$: $S\to I$. Successive approximation is generally order one and has no general convergence guarantee: $T\to IV$.

The full matching is $Q$–$III$, $R$–$II$, $S$–$I$, $T$–$IV$.

### Final answer
**Option B.**`,
    images: []
  },
  "go:1064": {
    concept: "Propositional logic - satisfiability and validity",
    markdown: String.raw`### Find a falsifying assignment
Set $P=T$, $Q=T$, and $R=F$. Then $P\to(Q\lor R)$ is true, while $(P\land Q)\to R$ is false. The whole implication is false, so the statement is not valid.

### Show it is satisfiable
For example, when $P=F$, the consequent $(P\land Q)\to R$ is true, so the whole statement is true. Thus the statement is satisfiable but not valid.

### Final answer
**Option A.**`,
    images: []
  },
  "go:1065": {
    concept: "Linear algebra - consistency and uniqueness of a system",
    markdown: String.raw`### Solve two equations
From $x-y=2$, we have $x=y+2$. Substitute into $-x+5y=-1$:
$$-(y+2)+5y=-1\quad\Longrightarrow\quad4y=1,$$
so $y=1/4$ and $x=9/4$.

### Check the third equation and uniqueness
The third left-hand side is $x+3y=9/4+3/4=3$, so the system is consistent. The first two equations have coefficient determinant
$$\begin{vmatrix}-1&5\\1&-1\end{vmatrix}=1-5=-4\ne0,$$
so they determine a unique pair $(x,y)$.

### Final answer
**Option C: a unique solution.**`,
    images: []
  }
};

const HOLD_REASONS = {
  "go:3804": "Under the displayed synchronous circuit, each answer choice has A=1 in its second input row, so the top OR-fed flip-flop has Q=1 then. At the third clock edge the lower flip-flop samples Q-bar AND C, which is 0 for every choice; z is therefore 0. The stored answer D and a GateOverflow community answer C conflict with this edge-by-edge analysis, and the source provides no official key for 2005.",
  "go:3681": "Lagrange interpolation at x=3 gives 26/3 = 8 2/3, which is option C in the displayed choices. The stored answer and selected GateOverflow answer say B (8 1/3), even though the posted arithmetic itself evaluates to 26/3. No official key was released for 2004; keep the item on HOLD until the option/key discrepancy is resolved."
};

const REVIEW_NOTES = {
  "go:3779": "A strict inclusion chain has strictly increasing subset sizes 0 through n; a prefix chain attains n+1.",
  "go:3780": "Euler's totient gives phi(p^2 q)=p^2q(1-1/p)(1-1/q)=p(p-1)(q-1).",
  "go:1371": "The fourth Catalan number counts BST shapes on four distinct ordered keys: C4=14.",
  "go:3782": "With t=x-pi, the integrand becomes -t^2 sin(t), an odd function over [-pi,pi], so the integral is zero.",
  "go:3783": "Universal pointwise implication plus universal P entails universal Q; this proves option B for every domain.",
  "go:1165": "X=(P or Q)->R simplifies to (not P and not Q) or R, which implies Y=(not P) or (not Q) or R.",
  "go:1166": "The correct scope is for every teacher there exists a student who likes that teacher.",
  "go:1167": "Intersection preserves reflexivity, symmetry, and transitivity; two distinct equivalence partitions show union can fail transitivity.",
  "go:1168": "Onto f composed with g forces the range of f to cover C, but g may omit elements of B.",
  "go:1170": "There are 3*5=15 residue-pair pigeonholes, so 16 selected ordered pairs force a repeated class.",
  "go:3642": "Two-child families contribute 0.6N children out of 2.3N total, yielding 6/23.",
  "go:3643": "Three-set inclusion-exclusion gives union size 175; 200-175=25 took no course.",
  "go:3644": "Negating forall-x exists-y of the negated predicate reduces exactly to option C.",
  "go:3645": "Enumerating admissible intermediate even values in R1 and R2 yields the five ordered pairs in option C.",
  "go:3646": "A forest with c components has n-c edges; a tree attains the maximum n-1.",
  "go:3647": "Elimination gives (x,y,z)=(6,6,-4), which satisfies all three matrix equations.",
  "go:1020": "The witness must be a boy, and every girl y must satisfy taller(x,y): exists x boy(x) and forall y (girl(y)->taller(x,y)).",
  "go:3678": "Inclusion-exclusion for five forbidden fixed points gives the derangement number !5=44.",
  "go:3679": "X^2-X+I=0 implies X(I-X)=I, so X inverse is I-X, matching option B.",
  "go:3680": "The degree sum is 54; the remaining degree-three vertices number 10, giving 19 total vertices.",
  "go:3682": "False position maps to guaranteed linear, Newton to quadratic, secant to order 1.62, and fixed-point iteration to linear without a guarantee.",
  "go:1064": "P=T,Q=T,R=F falsifies the statement, while P=F makes it true; it is satisfiable but not valid.",
  "go:1065": "The first two equations yield x=9/4,y=1/4; the third is satisfied and their determinant is -4, so the solution is unique."
};

function markReviewed() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  for (const question of chunk.questions) {
    const reason = HOLD_REASONS[question.uid];
    const solution = CHUNK_CSE_MATH_14_SOLUTIONS[question.uid];
    if (!reason && !solution) throw new Error("No disposition for " + question.uid);
    const priorIntegration = question.review?.integrationResult;
    const wasIntegrated = question.status === "INTEGRATED" && priorIntegration;
    question.status = reason ? "HOLD" : (wasIntegrated ? "INTEGRATED" : "ACCEPTED");
    if (reason) question.specialCategory = "HOLD";
    else delete question.specialCategory;
    question.review = {
      ...(question.review || {}),
      reviewer: "Codex",
      reviewedAt: REVIEW_DATE,
      disposition: reason ? "HOLD" : (wasIntegrated ? "INTEGRATED" : "ACCEPTED"),
      identityVerified: true,
      stemOptionsAndDiagramChecked: true,
      answerKeySource: reason
        ? "Existing answer record and GateOverflow question/discussion; the written stem/options do not support the recorded choice without an unresolved conflict."
        : "Existing question-bank answer key cross-checked against the GateOverflow question and an independent derivation; the historical index lists no official key for 2004/2005.",
      answerKeyVerified: !reason,
      answerKeyStatus: reason ? "UNRESOLVED_CONFLICT" : "MATCHED",
      sourceUrl: question.goLink,
      researchLinks: [
        { url: question.goLink, accessedAt: REVIEW_DATE },
        { url: KEY_INDEX, accessedAt: REVIEW_DATE }
      ],
      independentCheck: reason
        ? "Re-evaluated the displayed question/options and compared the result with the current answer record and available GateOverflow discussion; the conflict cannot be resolved without correcting an assumption, option, or key."
        : REVIEW_NOTES[question.uid],
      notes: reason || REVIEW_NOTES[question.uid],
      ...(wasIntegrated ? { integrationResult: priorIntegration } : {})
    };
  }
  chunk.status = "PARTIAL";
  chunk.reviewStatus = "REVIEWED_WITH_HOLDS";
  chunk.reviewedAt = REVIEW_DATE;
  chunk.acceptedCount = chunk.questions.filter((question) => ["ACCEPTED", "INTEGRATED"].includes(question.status)).length;
  chunk.holdCount = chunk.questions.filter((question) => question.status === "HOLD").length;
  chunk.specialCategories = {
    HOLD: chunk.questions.filter((question) => question.status === "HOLD").map((question) => ({ uid: question.uid, reason: HOLD_REASONS[question.uid] }))
  };
  fs.writeFileSync(CHUNK_PATH, JSON.stringify(chunk, null, 2) + "\n", "utf8");
}

function injectPatches() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  const acceptedUids = new Set(chunk.questions.filter((question) => ["ACCEPTED", "INTEGRATED"].includes(question.status)).map((question) => question.uid));
  const content = fs.readFileSync(PATCHES_PATH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const toAdd = [];
  let updated = 0;
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_14_SOLUTIONS)) {
    if (!acceptedUids.has(uid)) continue;
    const line = "  " + JSON.stringify(uid) + ": " + JSON.stringify(solution) + ",";
    const existingIndex = lines.findIndex((entry) => entry.startsWith("  " + JSON.stringify(uid) + ": "));
    if (existingIndex >= 0) {
      lines[existingIndex] = line;
      updated++;
    } else {
      toAdd.push(line);
    }
  }
  if (toAdd.length + updated !== acceptedUids.size) throw new Error("Accepted count does not match authored solution count.");
  if (toAdd.length) {
    const markerIndex = lines.findIndex((line) => line.includes("export const AUTHENTIC_PATCHES = {"));
    if (markerIndex === -1) throw new Error("Could not find AUTHENTIC_PATCHES marker.");
    lines.splice(markerIndex + 1, 0, ...toAdd);
  }
  fs.writeFileSync(PATCHES_PATH, lines.join(newline), "utf8");
  console.log(CHUNK_ID + " patches synchronized: " + acceptedUids.size + " entries (" + updated + " refreshed, " + toAdd.length + " added).");
}

function markIntegrated() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  const allSolutionsPath = path.join(ROOT, "data", "solutions", "practicepaper", "all-solutions.json");
  const allSolutions = JSON.parse(fs.readFileSync(allSolutionsPath, "utf8"));
  const shardDir = path.join(ROOT, "public", "question-detail-shards");
  const shardRows = fs.readdirSync(shardDir).filter((file) => file.endsWith(".json")).map((file) => ({ file, payload: JSON.parse(fs.readFileSync(path.join(shardDir, file), "utf8")) }));
  let integratedCount = 0;
  for (const question of chunk.questions) {
    if (question.status === "HOLD") continue;
    const registrySolution = allSolutions[question.uid]?.detailed_solution;
    const shard = shardRows.find((row) => row.payload.recordsByQuestionUid?.[question.uid]);
    const shardSolution = shard?.payload.recordsByQuestionUid[question.uid]?.detailed_solution?.markdown;
    if (!registrySolution || !shardSolution) throw new Error("Cannot mark " + question.uid + " integrated: registry or detail shard solution missing.");
    question.status = "INTEGRATED";
    question.review.disposition = "INTEGRATED";
    question.review.integrationResult = {
      status: "VERIFIED",
      verifiedAt: REVIEW_DATE,
      registryPath: "data/solutions/practicepaper/all-solutions.json",
      detailShardPath: "public/question-detail-shards/" + shard.file
    };
    integratedCount++;
  }
  chunk.status = "PARTIAL";
  chunk.integratedCount = integratedCount;
  chunk.acceptedCount = integratedCount;
  chunk.holdCount = chunk.questions.filter((question) => question.status === "HOLD").length;
  fs.writeFileSync(CHUNK_PATH, JSON.stringify(chunk, null, 2) + "\n", "utf8");

  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entry = manifest.chunks[CHUNK_ID];
  entry.status = "PARTIAL";
  entry.acceptedCount = integratedCount;
  entry.integratedCount = integratedCount;
  entry.heldCount = chunk.holdCount;
  entry.updatedAt = REVIEW_DATE;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(CHUNK_ID + " verified: " + integratedCount + " integrated; " + chunk.holdCount + " held.");
}

if (process.argv[1]?.includes("apply-chunk-cse-math-14")) {
  if (process.argv.includes("--review-only")) markReviewed();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else injectPatches();
}
