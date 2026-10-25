import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHUNK_ID = "CHUNK-CSE-MATH-13";
const CHUNK_PATH = path.join(ROOT, "data", "solutions", "chunks", "cse", "chunk-cse-math-13.json");
const PATCHES_PATH = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
const REVIEW_DATE = "2026-10-23";
const KEY_INDEX = "https://gatecse.in/previous-year-gate-papers-and-official-keys/";

export const CHUNK_CSE_MATH_13_SOLUTIONS = {
  "go:988": {
    concept: "Discrete mathematics - double counting",
    markdown: String.raw`### Count the incidences
Count the ordered pairs $(i,j)$ for which element $i$ belongs to set $X_j$.

Counting first by element gives $\sum_{i=1}^{m}f(i)$. Counting by set gives $\sum_{j=1}^{n}|X_j|$. Each $X_j$ has exactly three elements, so
$$\sum_{i=1}^{m}f(i)=\sum_{j=1}^{n}3=3n.$$
Overlap between the sets does not change this incidence count: an element in two sets contributes twice, once for each set.

### Option check
The sum depends on the number and size of the $X_j$, not on $m$ or a fixed parity expression.

### Final answer
**Option B ($3n$).**`,
    images: []
  },
  "go:3565": {
    concept: "Linear algebra - eigenvalues of a tridiagonal matrix",
    markdown: String.raw`### Separate the scalar part
Write $P=aI+T$, where
$$T=\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}.$$
The eigenvalues of $T$ follow from
$$\det(\lambda I-T)=\begin{vmatrix}\lambda&-1&0\\-1&\lambda&-1\\0&-1&\lambda\end{vmatrix}=\lambda(\lambda^2-2),$$
so they are $0,\sqrt2,-\sqrt2$. Adding $aI$ shifts every eigenvalue by $a$.

### Option check
The eigenvalues are $a$, $a+\sqrt2$, and $a-\sqrt2$; the other options do not give this shifted spectrum.

### Final answer
**Option A: $a,\ a-\sqrt2,\ a+\sqrt2$.**`,
    images: []
  },
  "go:989": {
    concept: "Logic - first-order translation",
    markdown: String.raw`### Translate the condition
The subject of the sentence is every individual that is a tiger or a lion, so use $\operatorname{tiger}(x)\lor\operatorname{lion}(x)$. The phrase “attack if they are hungry or threatened” means that hunger or threat is a sufficient condition for attacking:
$$\forall x\bigl[(\operatorname{tiger}(x)\lor\operatorname{lion}(x))\to((\operatorname{hungry}(x)\lor\operatorname{threatened}(x))\to\operatorname{attacks}(x))\bigr].$$

### Option check
Option A incorrectly requires an individual to be both a tiger and a lion. Option B asserts hunger-or-threat and attack unconditionally for every tiger or lion. Option C reverses the implication. Option D preserves both the subject and the “if” direction.

### Final answer
**Option D.**`,
    images: []
  },
  "go:3566": {
    concept: "Numerical methods - orders of convergence",
    markdown: String.raw`### Match each method
Bisection halves the interval at every step, so its error decreases linearly (order $1$), often described as one bit of accuracy per iteration: $I\to S$. Newton-Raphson has quadratic local convergence for a simple root: $II\to P$. The secant method has order $\varphi=(1+\sqrt5)/2\approx1.62$: $III\to Q$. Regula falsi is generally linearly convergent: $IV\to R$.

Thus the complete matching is $I-S$, $II-P$, $III-Q$, $IV-R$.

### Option check
The other options assign quadratic convergence to bisection or give the secant/Newton orders to the wrong methods.

### Final answer
**Option D.**`,
    images: []
  },
  "go:990": {
    concept: "Logic - testing propositional equivalences",
    markdown: String.raw`### Test $P_1$
Take $A=T$, $B=F$, and $C=F$. Then $(A\land B)\to C$ is true, while $(A\to C)\land(B\to C)=F\land T=F$. The two sides differ, so $P_1$ is not a tautology.

### Test $P_2$
With the same assignment, $(A\lor B)\to C=F$, while $(A\to C)\lor(B\to C)=F\lor T=T$. The two sides again differ, so $P_2$ is not a tautology.

### Final answer
Neither proposition is a tautology: **Option D**.`,
    images: []
  },
  "go:991": {
    concept: "Logic - truth tables and operator composition",
    markdown: String.raw`### Identify the binary operator
From the four rows, $A\odot B$ is true whenever $A$ is true, and when $A$ is false it is true only when $B$ is false. Therefore
$$A\odot B=A\lor\neg B.$$

Evaluate option D using the stated precedence:
$$\neg(\neg A\odot B)=\neg(\neg A\lor\neg B)=A\land B.$$

### Option check
Options A, B, and C simplify respectively to $\neg(A\land B)$, $\neg A\land\neg B$, and $A\land\neg B$; none equals conjunction for all inputs.

### Final answer
**Option D: $\neg(\neg A\odot B)$.**`,
    images: []
  },
  "go:3609": {
    concept: "Digital communications - constrained 4B/5B codewords",
    markdown: String.raw`### Count by the end bits
There are five bit positions. If the first and last bits are both $1$, the three middle bits are free: $2^3=8$ words.

If exactly the first bit is $0$, the second must be $1$; with the last bit fixed to $1$, two positions remain free: $2^2=4$. By symmetry, first bit $1$ and last bit $0$ gives another $4$. If both ends are $0$, the second and fourth bits must be $1$, leaving only the middle bit free: $2$ words.

The four disjoint cases total $8+4+4+2=18$.

### Final answer
**Option C (18 codewords).**`,
    images: []
  },
  "go:1850": {
    concept: "Graph theory - isolated vertices in an intersection graph",
    markdown: String.raw`### Characterize degree zero
A vertex represents a subset $A$ of an $n$-element set. If $|A|<2$, then $A$ cannot intersect any subset in exactly two elements, so it has degree zero. This gives the empty set and all $n$ singleton sets: $n+1$ vertices.

If $|A|\ge2$, choose a two-element subset $B\subseteq A$. When $B\ne A$, their intersection has size two. When $A=B$, choose a distinct superset of $B$; this is possible because $n\ge6$. Thus every such vertex has a neighbor.

### Final answer
There are $n+1$ degree-zero vertices: **Option C**.`,
    images: []
  },
  "go:43566": {
    concept: "Graph theory - maximizing an intersection degree",
    markdown: String.raw`### Count neighbors by the size of the fixed set
For a fixed vertex $A$ with $|A|=k$, a neighbor must choose exactly two elements from $A$ and any subset of the $n-k$ elements outside $A$. Hence
$$d(A)=\binom{k}{2}2^{n-k}.$$
For $k\ge2$, the ratio of consecutive values is
$$\frac{d_{k+1}}{d_k}=\frac{k+1}{2(k-1)}.$$
It is greater than $1$ for $k=2$, equals $1$ for $k=3$, and is less than $1$ for $k>3$. The maximum is attained at $k=3$ and $k=4$ and equals $3\cdot2^{n-3}$.

### Final answer
**Option C: $3\cdot2^{n-3}$.**`,
    images: []
  },
  "go:43567": {
    concept: "Graph theory - connected components of an intersection graph",
    markdown: String.raw`### Identify the isolated vertices
The empty set and each of the $n$ singleton sets have no neighbor, since their intersections cannot have size two. They therefore form $n+1$ separate components.

All subsets of size at least two lie in one component. Every such subset is adjacent to any two-element subset it contains (unless it is that two-element set itself). Any two distinct two-element sets $P,Q$ are connected through $P\cup Q$: this union has size three or four, and its intersection with each of $P,Q$ has size two. Thus the entire size-at-least-two family is connected.

The component count is $(n+1)+1=n+2$.

### Final answer
**Option B ($n+2$).**`,
    images: []
  },
  "go:3745": {
    concept: "Probability - sampling with replacement",
    markdown: String.raw`### Require one draw of each colour
Because each marble is replaced, the three draws are independent. One specified order, such as blue-green-red, has probability
$$\frac{10}{60}\cdot\frac{20}{60}\cdot\frac{30}{60}=\frac{1}{36}.$$
There are $3!=6$ orders in which the three distinct colours can occur, so the desired probability is $6/36=1/6$.

### Final answer
**Option B ($1/6$).**`,
    images: []
  },
  "go:3746": {
    concept: "Numerical methods - trapezoidal-rule error for a convex function",
    markdown: String.raw`### Determine the error direction
The exact integral is
$$\int_0^1x^2\,dx=\frac13.$$
On every nonzero subinterval, $x^2$ is strictly convex because $f''(x)=2>0$. The secant line joining the endpoint values lies strictly above the curve in the interior. The trapezoidal rule integrates these secant lines, so its composite approximation is strictly greater than the true integral, regardless of the number of subintervals.

### Final answer
**Option A: the computed value is always greater than $1/3$.**`,
    images: []
  },
  "go:3747": {
    concept: "Linear algebra - determinant by cofactor expansion",
    markdown: String.raw`### Expand along the third row
The only nonzero entry in row three is the $1$ in column four. Its cofactor sign is $(-1)^{3+4}=-1$, so
$$\det A=-\det\begin{pmatrix}0&1&0\\-1&1&1\\1&-2&0\end{pmatrix}.$$
Expanding the $3\times3$ determinant along its first row gives $-((-1)(0)-(1)(1))=1$. Therefore $\det A=-1$.

### Final answer
**Option A ($-1$).**`,
    images: []
  },
  "go:1349": {
    concept: "Algorithms - transitive closure by Warshall's method",
    markdown: String.raw`### Apply the standard Boolean-matrix recurrence
Represent the relation by an $n\times n$ Boolean adjacency matrix. Warshall's algorithm considers each of the $n$ elements as a possible intermediate vertex and updates all $n^2$ matrix entries for that intermediate. The running time is therefore $n\cdot n^2=O(n^3)$.

This is the standard all-pairs transitive-closure bound tested by the choices; it is not a claim that no faster algebraic variants exist.

### Final answer
**Option D ($O(n^3)$).**`,
    images: []
  },
  "go:1157": {
    concept: "Set theory - simplifying set differences",
    markdown: String.raw`### Rewrite both expressions as intersections
Set difference gives
$$X=(A-B)-C=A\cap B^c\cap C^c.$$
For $Y$,
$$Y=(A-C)-(B-C)=(A\cap C^c)\cap(B\cap C^c)^c.$$
By De Morgan's law, $(B\cap C^c)^c=B^c\cup C$. Intersecting with $C^c$ removes the $C$ part, so $Y=A\cap B^c\cap C^c=X$.

### Final answer
**Option A ($X=Y$).**`,
    images: []
  },
  "go:1158": {
    concept: "Order theory - the five-element diamond lattice",
    markdown: String.raw`### Check meets and joins
In the displayed Hasse diagram, $e$ is the bottom and $a$ the top; $b,c,d$ are three incomparable elements between them. Every pair has a unique meet and join: two distinct middle elements meet at $e$ and join at $a$. Thus the poset is a lattice.

### Show distributivity fails
For distinct middle elements $b,c,d$,
$$b\wedge(c\vee d)=b\wedge a=b,$$
whereas
$$(b\wedge c)\vee(b\wedge d)=e\vee e=e.$$
Since $b\ne e$, the distributive law fails. This is the standard five-element diamond lattice.

### Final answer
**Option B: a lattice but not a distributive lattice.**`,
    images: []
  },
  "go:1159": {
    concept: "Graph theory - Euler's formula for planar graphs",
    markdown: String.raw`### Apply Euler's formula
For a connected planar embedding, $V-E+F=2$. With $V=13$ and $E=19$,
$$F=2-V+E=2-13+19=8.$$

### Final answer
**Option B (8 faces).**`,
    images: []
  },
  "go:1161": {
    concept: "Graph theory - vertex cover and independent set complements",
    markdown: String.raw`### Use the complement relation
A set of vertices is a vertex cover exactly when its complement is an independent set: if two vertices outside a cover were adjacent, their edge would be uncovered; conversely, the complement of an independent set covers every edge. Therefore the minimum vertex-cover size $\tau(G)$ and maximum independent-set size $\alpha(G)$ satisfy
$$\alpha(G)+\tau(G)=|V(G)|.$$
Here $|V|=20$ and $\tau(G)=8$, so $\alpha(G)=20-8=12$. The edge count does not change this identity.

### Final answer
**Option A (12).**`,
    images: []
  },
  "go:1162": {
    concept: "Probability - interval probability from a density",
    markdown: String.raw`### Integrate the density over the event
For a continuous random variable with probability density function $f$, the probability mass of an interval is the area under the density on that interval:
$$P(a<X\le b)=\int_a^b f(x)\,dx.$$
For a continuous distribution, including or excluding either endpoint does not change the probability because individual points have probability zero.

### Option check
The CDF difference would be $F(b)-F(a)$, not $f(b)-f(a)$. The integral of $x f(x)$ is a truncated first moment, not an interval probability.

### Final answer
**Option C.**`,
    images: []
  },
  "go:1163": {
    concept: "Abstract algebra - inverses modulo 15",
    markdown: String.raw`### Find multiplicative inverses
An inverse of $u$ modulo 15 is a residue $v$ with $uv\equiv1\pmod{15}$. Since $4\cdot4=16\equiv1\pmod{15}$, the inverse of 4 is 4. Also $7\cdot13=91=90+1\equiv1\pmod{15}$, so the inverse of 7 is 13.

### Final answer
**Option C (4 and 13).**`,
    images: []
  },
  "go:3777": {
    concept: "Set theory - surjectivity of a composition",
    markdown: String.raw`### Compare the ranges
For $h=g\circ f$, every value in the range of $h$ is a value of $g$. Hence $h(A)=C$ implies $g(B)=C$: if the composition reaches every $c\in C$, then $g$ must reach every $c$ as well.

The reverse implications fail. An onto $g$ need not make $g\circ f$ onto if $f$ misses needed inputs. Also, $g\circ f$ can be onto even if $f$ is not onto all of $B$, provided the values it does reach are enough for $g$ to cover $C$.

### Final answer
**Option C: $h$ onto implies $g$ onto.**`,
    images: []
  },
  "go:3778": {
    concept: "Probability - waiting time for a matching adjacent toss",
    markdown: String.raw`### Separate the first toss
The first toss cannot complete a pair, so it is always counted. Starting with the second toss, each new fair toss matches the immediately preceding toss with probability $1/2$, independently of earlier match attempts. Thus the number of additional tosses until the first match is geometric with mean $1/(1/2)=2$.

The expected total is $1+2=3$ tosses.

### Final answer
**Option A (3).**`,
    images: []
  }
};

const HOLD_REASONS = {
  "go:3567": "The integral evaluates to sqrt(5*pi), which is absent from the choices; the recorded answer A does not match the written integral.",
  "go:3620": "The stem does not identify which matrix represents the linear system for the Frobenius norm; the coefficient matrix, augmented matrix, and iteration matrix produce different values, and the recorded option is only described as close by a secondary solution.",
  "go:3621": "Gauss-Seidel convergence depends on the equation/variable ordering here: printed-order iteration diverges, while a reordered diagonally dominant iteration converges. The stem does not specify the ordering, so retain the current answer record on HOLD."
};

const REVIEW_NOTES = {
  "go:988": "Double-count incidences (i,j) with i in X_j; each of n size-3 sets contributes exactly three.",
  "go:3565": "Write P=aI+T; the path-three adjacency matrix T has characteristic polynomial lambda(lambda^2-2).",
  "go:989": "Translate the subject as tiger OR lion and the sufficient condition as hungry OR threatened implies attacks.",
  "go:3566": "Bisection is linear/one bit, Newton is quadratic, secant has order about 1.62, and regula falsi is linear.",
  "go:990": "A=T,B=F,C=F is a counterexample to each displayed equivalence, so neither is a tautology.",
  "go:991": "The truth table is A OR NOT B; option D negates (NOT A OR NOT B) to obtain A AND B.",
  "go:3609": "Partition the 5-bit strings by first/last bit; the valid counts are 8, 4, 4, and 2, totaling 18.",
  "go:1850": "Exactly the empty set and the n singletons have no 2-element intersection with any vertex.",
  "go:43566": "For |A|=k, degree is C(k,2)2^(n-k), maximized at k=3 or k=4.",
  "go:43567": "The empty set and n singletons are isolated; all subsets of size at least two are connected through their 2-subsets.",
  "go:3745": "Independence and six permutations give 6*(10/60)*(20/60)*(30/60)=1/6.",
  "go:3746": "Strict convexity makes every trapezoidal chord lie above x^2, so the composite estimate exceeds the integral.",
  "go:3747": "Cofactor expansion along row three gives minus the 3x3 minor, hence determinant -1.",
  "go:1349": "Warshall's standard Boolean-matrix recurrence performs n^2 updates for each of n intermediate vertices.",
  "go:1157": "Both differences reduce to A intersect B-complement intersect C-complement.",
  "go:1158": "The diagram is M3: every pair has a meet/join, but b meet (c join d) differs from (b meet c) join (b meet d).",
  "go:1159": "Euler's formula gives F=E-V+2=8.",
  "go:1161": "The complement of a minimum vertex cover is a maximum independent set; alpha+tau=20.",
  "go:1162": "For a continuous density, interval probability is the integral of the density over that interval.",
  "go:1163": "4*4 is 1 modulo 15 and 7*13 is 1 modulo 15.",
  "go:3777": "Range(g composed with f) is a subset of range(g); surjectivity of the composition therefore forces g to be onto.",
  "go:3778": "The first toss is mandatory, then a match occurs with probability 1/2 per additional toss; expected total is 3."
};

function markReviewed() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  for (const question of chunk.questions) {
    const reason = HOLD_REASONS[question.uid];
    const solution = CHUNK_CSE_MATH_13_SOLUTIONS[question.uid];
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
        ? "Existing question-bank answer record and GateOverflow question/discussion; the written item does not support an unambiguous verified choice."
        : "Existing question-bank answer key cross-checked against the GateOverflow question and an independent derivation; the historical index lists no official key for these years.",
      answerKeyVerified: !reason,
      answerKeyStatus: reason ? "UNRESOLVED_CONFLICT" : "MATCHED",
      sourceUrl: question.goLink,
      researchLinks: [
        { url: question.goLink, accessedAt: REVIEW_DATE },
        { url: KEY_INDEX, accessedAt: REVIEW_DATE }
      ],
      independentCheck: reason
        ? "Re-evaluated the mathematical statement and compared it with the recorded answer and available discussion; the defect is not resolvable without changing an assumption or source text."
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
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_13_SOLUTIONS)) {
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

if (process.argv[1]?.includes("apply-chunk-cse-math-13")) {
  if (process.argv.includes("--review-only")) markReviewed();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else injectPatches();
}
