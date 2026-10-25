import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHUNK_PATH = path.join(ROOT, "data", "solutions", "chunks", "cse", "chunk-cse-math-12.json");
const PATCHES_PATH = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
const REVIEW_DATE = "2026-10-23";

export const CHUNK_CSE_MATH_12_SOLUTIONS = {
  "go:399": {
    concept: "Calculus — limits at infinity",
    markdown: [
      "### Derivation",
      "Divide numerator and denominator by x. Since sin(x) and cos(x) stay bounded while x grows without bound, their ratios to x tend to zero:",
      "$$\\frac{x - \\sin x}{x + \\cos x} = \\frac{1 - \\sin x/x}{1 + \\cos x/x} \\longrightarrow 1.$$",
      "The denominator is asymptotic to x and the numerator is also asymptotic to x, so the limit is 1.",
      "",
      "### Option check",
      "The limit is finite and positive. It is neither negative nor infinite.",
      "",
      "### Final answer",
      "**Option A (1).**"
    ].join("\n"),
    images: []
  },
  "go:3224": {
    concept: "Probability — inclusion-exclusion",
    markdown: [
      "### Derivation",
      "From P(A') = 1/3 and P(B') = 1/3, we get P(A) = P(B) = 2/3. Apply inclusion-exclusion:",
      "$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = \\frac{2}{3} + \\frac{2}{3} - \\frac{1}{2} = \\frac{5}{6}.$$",
      "Since 5/6 = 10/12, the requested probability matches the second choice.",
      "",
      "### Final answer",
      "**Option B (10/12).**"
    ].join("\n"),
    images: []
  },
  "go:400": {
    concept: "Set theory — complements and distributivity",
    markdown: [
      "### Derivation",
      "Factor the first two terms:",
      "$$(P \\cap Q \\cap R) \\cup (P^c \\cap Q \\cap R) = (P \\cup P^c) \\cap Q \\cap R = Q \\cap R.$$",
      "The full expression therefore becomes (Q intersect R) union Q^c union R^c. By De Morgan's law, Q^c union R^c = (Q intersect R)^c. A set union its complement is the universal set U.",
      "",
      "### Final answer",
      "**Option D (U).**"
    ].join("\n"),
    images: []
  },
  "go:3263": {
    concept: "Graph theory — chromatic number",
    markdown: [
      "### Derivation",
      "The diagram is a 3 by 3 grid with an extra edge joining opposite corners. The grid path from the upper-left corner to the lower-right corner has four edges; adding the corner-to-corner edge creates a 5-cycle. An odd cycle cannot be colored with two colors, so at least three are required.",
      "Three colors suffice: color the grid in checkerboard fashion with two colors, then recolor the lower-right corner with a third color. Its grid neighbors have the other checkerboard color, and the extra edge's upper-left endpoint retains the first color. Thus no adjacent vertices share a color.",
      "",
      "### Final answer",
      "The chromatic number is **3, Option B**. The local question image is present at /Gate_QA/question-images/3396802636713983726.webp."
    ].join("\n"),
    images: []
  },
  "go:401": {
    concept: "Linear algebra — determinant and uniqueness of a linear system",
    markdown: [
      "### Derivation",
      "The coefficient matrix is A = [[1,1,2],[1,2,3],[1,4,alpha]]. Subtract row 1 from rows 2 and 3, giving determinant det([[1,1],[3,alpha-2]]) = alpha - 5. The system has a unique solution exactly when this determinant is nonzero, so every real alpha except 5 works.",
      "At alpha = 5, the reduced coefficient rows are [0,1,1] and [0,3,3], while their right-hand sides are 1 and 3. They are dependent and consistent, so uniqueness fails.",
      "",
      "### Why the item is marks-to-all",
      "Options A, B, and C each list only some valid values; option D includes the invalid value 5. None states the complete set of allowed values, alpha != 5. Therefore no offered option correctly answers the question, even though the system's condition is unambiguous.",
      "",
      "### Final answer",
      "**Marks to all (MTA).** The exact condition is alpha != 5."
    ].join("\n"),
    images: []
  },
  "go:3264": {
    concept: "Graph theory — smallest maximal independent set in a path",
    markdown: [
      "### Derivation",
      "A maximal independent set is also a dominating set: every vertex outside it must be adjacent to a selected vertex, or that vertex could be added while preserving independence. In a 9-vertex path, each selected vertex can dominate at most itself and its two neighbors. Thus 3k >= 9 for any maximal independent set of size k, so k >= 3.",
      "The set {2,5,8} is independent, and every path vertex is either in the set or adjacent to one of its members. It is therefore maximal and has size 3, attaining the lower bound.",
      "",
      "### Final answer",
      "**Option C (3).**"
    ].join("\n"),
    images: []
  },
  "go:3282": {
    concept: "First-order logic — validity and quantifier scope",
    markdown: [
      "### Derivation",
      "Let alpha(x) be the predicate and beta a sentence, so beta does not depend on x. In option C, the antecedent is (exists x alpha(x)) -> beta and the consequent is forall x (alpha(x) -> beta).",
      "If beta is true, the consequent is true for every x. If beta is false, truth of the antecedent forces exists x alpha(x) to be false, so alpha(x) is false for every x; the consequent is again true. Hence option C is valid in every interpretation.",
      "The other implications fail when beta is false and alpha holds for some but not all elements (or, in option A, when beta is true and alpha is not universal).",
      "",
      "### Final answer",
      "**Option C.**"
    ].join("\n"),
    images: []
  },
  "go:419": {
    concept: "Numerical analysis — composite trapezoidal error bound",
    markdown: [
      "### Derivation",
      "For n equal subintervals on [a,b], the composite trapezoidal error satisfies $$|E_n| \\le \\frac{(b-a)^3}{12n^2}\\max_{x\\in[a,b]}|f''(x)|.$$ Here f(x)=x e^x, so f''(x)=(x+2)e^x, which increases on [1,2] and has maximum 4e^2.",
      "With b-a=1, the bound is e^2/(3 n^2). Requiring this to be at most $$\\frac{1}{3}\\times 10^{-6}$$ gives $$n^2 \\ge 10^6 e^2$$, hence $$n \\ge 1000e.$$ Since n must be an integer, the least allowable n is ceil(1000e)=2719.",
      "",
      "### Final answer",
      "The keyed threshold is **1000e, Option A**; the literal least integer number of subintervals is 2719."
    ].join("\n"),
    images: []
  },
  "go:3283": {
    concept: "First-order logic — negating nested quantifiers and implications",
    markdown: [
      "### Derivation",
      "Start with forall x [alpha -> exists y (beta -> forall u exists v y)]. Negating the outer universal gives exists x, and negating the implication gives alpha AND the negation of its consequent.",
      "Negating exists y gives forall y. Negating (beta -> forall u exists v y) gives beta AND not(forall u exists v y). Push the negation through the remaining quantifiers: not(forall u exists v y) = exists u forall v not y.",
      "The complete negation is exists x [alpha AND forall y (beta AND exists u forall v not y)], which is the grouping represented in option D.",
      "",
      "### Final answer",
      "**Option D.**"
    ].join("\n"),
    images: []
  },
  "go:421": {
    concept: "Planar graphs — four-color theorem and vertex covers",
    markdown: [
      "### Derivation",
      "By the four-color theorem, every planar graph can be properly colored with at most four colors. Each color class is an independent set. Among at most four classes, one contains at least n/4 vertices.",
      "The complement of an independent set is a vertex cover: every edge has at least one endpoint outside the independent set. Taking the complement of the largest color class gives a vertex cover of size at most n - n/4 = 3n/4.",
      "",
      "### Final answer",
      "**Option C.**"
    ].join("\n"),
    images: []
  },
  "go:3285": {
    concept: "Number theory — Legendre's formula",
    markdown: [
      "### Derivation",
      "The exponent of prime 11 in 300! is $$\\left\\lfloor\\frac{300}{11}\\right\\rfloor + \\left\\lfloor\\frac{300}{11^2}\\right\\rfloor + \\left\\lfloor\\frac{300}{11^3}\\right\\rfloor + \\cdots.$$ The nonzero terms are 27 and 2; 11^3=1331 exceeds 300.",
      "Therefore the exponent is 27+2=29.",
      "",
      "### Final answer",
      "**Option C (29).**"
    ].join("\n"),
    images: []
  },
  "go:422": {
    concept: "Combinatorics — sums of consecutive odd and even integers",
    markdown: [
      "### Derivation",
      "The first k odd positive integers sum to $$P=1+3+\\cdots +(2k-1)=k^2.$$ The first k positive even integers sum to $$Q=2+4+\\cdots +2k=2(1+\\cdots +k)=k(k+1).$$ Thus $$P-Q=k^2-k(k+1)=-k,$$ or $$P=Q-k.$$",
      "",
      "### Final answer",
      "**Option A.**"
    ].join("\n"),
    images: []
  },
  "go:3286": {
    concept: "Combinatorics — stars and bars with two distinguishable colors",
    markdown: [
      "### Derivation",
      "For one color, distributing b identical balls among n distinct boxes is a weak composition of b into n nonnegative parts. Stars and bars gives $$\\binom{n+b-1}{b}$$ distributions. The red balls independently have $$\\binom{n+r-1}{r}$$ distributions.",
      "Multiplying the independent choices gives $$\\binom{n+b-1}{b}\\binom{n+r-1}{r}=\\frac{(n+b-1)!(n+r-1)!}{(n-1)!b!(n-1)!r!},$$ which is the first expression. This uses the standard interpretation that balls of the same color are indistinguishable.",
      "",
      "### Final answer",
      "**Option A.**"
    ].join("\n"),
    images: []
  },
  "go:423": {
    concept: "Calculus — stationary points and local extrema",
    markdown: [
      "### Derivation",
      "For $$f(x)=3x^4-16x^3+24x^2+37,$$ $$f'(x)=12x^3-48x^2+48x=12x(x-2)^2.$$ The stationary points are x=0 and x=2.",
      "The factor (x-2)^2 is nonnegative and does not change sign across 2; the sign of f' is determined by x. The function decreases for x<0 and increases for x>0, so x=0 is a local minimum. At x=2 the derivative is zero but the function keeps increasing, so it is not an extremum.",
      "",
      "### Final answer",
      "There is **one** distinct extremum, **Option B**."
    ].join("\n"),
    images: []
  },
  "go:3560": {
    concept: "First-order logic — satisfiability versus validity",
    markdown: [
      "### Derivation",
      "The formula says every pair related by R is related in the reverse direction. It is satisfiable: the empty relation makes every implication true. It is not valid, because on a two-element domain a relation containing (a,b) but not (b,a) makes it false.",
      "Its negation is also satisfiable in that same two-element structure: it asserts the existence of an asymmetric related pair. Thus both the formula and its negation have models.",
      "",
      "### Final answer",
      "**Option B: the formula is satisfiable and so is its negation.**"
    ].join("\n"),
    images: []
  },
  "go:982": {
    concept: "Probability — binomial distribution",
    markdown: [
      "### Derivation",
      "The number of selected elements is binomial with 2n independent trials and success probability 1/2. For exactly n selected elements, choose which n trials are heads in $$\\binom{2n}{n}$$ ways; each complete sequence of 2n coin tosses has probability $$(1/2)^{2n}=1/4^n.$$",
      "Therefore $$P(\\text{exactly }n)=\\frac{\\binom{2n}{n}}{4^n}.$$",
      "",
      "### Final answer",
      "**Option A.**"
    ].join("\n"),
    images: []
  },
  "go:3561": {
    concept: "Probability — geometric waiting time",
    markdown: [
      "### Derivation",
      "N is geometric on {1,2,...} with P(N=k)=(1-p)^(k-1)p. Its expectation is",
      "$$\\mathbb{E}[N] = \\sum_{k=1}^{\\infty} k(1-p)^{k-1}p = \\frac{p}{(1-(1-p))^2} = \\frac{1}{p}.$$",
      "Equivalently, the tail-sum formula gives $$\\mathbb{E}[N]=\\sum_{k=0}^{\\infty}\\Pr(N>k)=\\sum_{k=0}^{\\infty}(1-p)^k=\\frac{1}{p}.$$",
      "",
      "### Final answer",
      "**Option A (1/p).**"
    ].join("\n"),
    images: []
  },
  "go:983": {
    concept: "Set theory — simplifying set differences",
    markdown: [
      "### Derivation",
      "First, $$X=(E \\cap F)\\setminus(F \\cap G)=E \\cap F \\cap G^c.$$",
      "For Y, $$E\\setminus(E\\cap G)=E\\cap G^c.$$ Also $$E\\setminus F=E\\cap F^c.$$ Removing E-F from E intersect G-complement leaves $$E\\cap G^c\\cap(E\\cap F^c)^c,$$ which simplifies to $$E\\cap G^c\\cap F.$$",
      "Thus both sets equal E intersect F intersect G^c.",
      "",
      "### Final answer",
      "**Option C (X=Y).**"
    ].join("\n"),
    images: []
  },
  "go:3562": {
    concept: "Set theory — symmetric difference identities",
    markdown: [
      "### Derivation",
      "Use small counterexamples to test both proposed identities. For I, take P=Q={a} and R=empty. The left side P delta (Q intersect R) is {a}; the right side (P delta Q) intersect (P delta R) is empty intersect {a}=empty. So I is false.",
      "For II, take P=empty and R={a} (Q may be any set). The left side P intersect (Q intersect R) is empty, while the right side (P intersect Q) delta (P delta R) is empty delta {a}={a}. So II is false as well.",
      "",
      "### Final answer",
      "**Option C: neither I nor II.**"
    ].join("\n"),
    images: []
  },
  "go:984": {
    concept: "Linear algebra — null spaces and non-unique solutions",
    markdown: [
      "### Derivation",
      "Subtract $$Fu=b$$ and $$Fv=b$$ to obtain $$F(u-v)=0.$$ Since $$u\\ne v,$$ the vector u-v is nonzero, so the null space contains a nonzero vector. Therefore F is singular and $$\\det(F)=0.$$",
      "Every vector $$u+t(v-u),$$ for real t, is also a solution because $$F(u+t(v-u))=b+t(0)=b.$$ There are infinitely many solutions, and a nonzero vector in the null space satisfies $$Fx=0.$$",
      "But singularity does not require two identical rows. For example, F=diag(1,0) has distinct rows and a nontrivial null space. Hence the statement that F must have two identical rows is false.",
      "",
      "### Final answer",
      "**Option D.**"
    ].join("\n"),
    images: []
  },
  "go:3563": {
    concept: "Number theory — inclusion-exclusion",
    markdown: [
      "### Derivation",
      "Among 1 through 123, the counts divisible by 2, 3, and 5 are 61, 41, and 24. Inclusion-exclusion gives the count divisible by at least one:",
      "$$61+41+24 - \\left\\lfloor\\frac{123}{6}\\right\\rfloor-\\left\\lfloor\\frac{123}{10}\\right\\rfloor-\\left\\lfloor\\frac{123}{15}\\right\\rfloor+\\left\\lfloor\\frac{123}{30}\\right\\rfloor = 126-20-12-8+4=90.$$",
      "Thus 123-90=33 integers are divisible by none of 2, 3, or 5.",
      "",
      "### Final answer",
      "**Option B (33).**"
    ].join("\n"),
    images: []
  },
  "go:987": {
    concept: "Combinatorics — minima under a uniformly random permutation",
    markdown: [
      "### Derivation",
      "Assume A and B are nonempty, as required for both minima to be defined. The equality $$\\min(\\pi(A))=\\min(\\pi(B))$$ holds exactly when the smallest image among elements of $$A\\cup B$$ comes from $$A\\cap B.$$",
      "Under a uniformly random permutation, each element of A union B is equally likely to receive the smallest image value. Therefore the probability of this event is $$\\frac{|A\\cap B|}{|A\\cup B|}.$$ Of all n! permutations, the required count is $$n!\\frac{|A\\cap B|}{|A\\cup B|}.$$",
      "",
      "### Final answer",
      "**Option C: n! |A intersect B| / |A union B|.**"
    ].join("\n"),
    images: []
  },
  "go:3564": {
    concept: "Graph theory — hypercube coloring and diameter",
    markdown: [
      "### Derivation",
      "Vertices are n-bit strings, with edges joining strings that differ in one bit. Coloring each string by the parity of its number of 1s gives a proper 2-coloring, and every n>=1 hypercube has an edge, so its chromatic number is exactly 2.",
      "The distance between two strings is their Hamming distance. It is at most n, and opposite strings such as 00...0 and 11...1 are distance n apart. Hence the diameter is n.",
      "The requested ratio is 2/n.",
      "",
      "### Final answer",
      "**Option C (2/n).**"
    ].join("\n"),
    images: []
  }
};

const REVIEW_NOTES = {
  "go:399": "Limit checked by dividing through by x; keyed value matches.",
  "go:3224": "Complement probabilities and inclusion-exclusion give 5/6; keyed option matches.",
  "go:400": "Factored the P/P-complement terms and applied De Morgan's law; keyed option matches.",
  "go:3263": "Inspected the mirrored grid image; the added corner edge creates a 5-cycle and the described 3-coloring works.",
  "go:401": "Determinant is alpha-5; no listed option states all alpha except 5, matching the MTA disposition.",
  "go:3264": "Dominating-set lower bound and explicit size-3 maximal independent set agree with key.",
  "go:3282": "Truth-condition analysis confirms option C is valid; key matches.",
  "go:419": "Composite trapezoid bound gives n>=1000e; integer ceiling is 2719 and keyed threshold option matches.",
  "go:3283": "Negated each quantifier and implication in order; option D matches.",
  "go:421": "Four-color theorem gives an independent class of size at least n/4; its complement is a vertex cover.",
  "go:3285": "Legendre sum is 27+2=29; key matches.",
  "go:422": "Closed-form odd and even sums give P=Q-k; key matches.",
  "go:3286": "Independent stars-and-bars counts for identical balls of each color multiply to option A.",
  "go:423": "Derivative sign changes only at x=0; stationary x=2 is not an extremum.",
  "go:979": "HOLD: the random sample is empty with probability 2^-n, where its minimum is undefined. Secondary references conflict on whether the item is MTA or assumes a nonempty sample.",
  "go:3560": "Empty relation satisfies the formula; an asymmetric two-element relation satisfies its negation.",
  "go:982": "Binomial probability is C(2n,n)/4^n; key matches.",
  "go:3561": "Geometric waiting-time mean is 1/p; key matches.",
  "go:983": "Both set expressions simplify to E intersect F intersect G-complement.",
  "go:3562": "Separate concrete counterexamples falsify both identities; neither is true.",
  "go:984": "Non-uniqueness implies singularity and nonzero kernel, but not duplicate rows.",
  "go:3563": "Inclusion-exclusion leaves 33 integers; key matches.",
  "go:987": "Uniform minimum over A union B gives overlap/union probability; nonempty-set precondition recorded.",
  "go:3564": "Parity coloring gives chromatic number 2; opposite strings give diameter n.",
  "go:3284": "HOLD: the complement must count every allowed number of double-occupied birthdays, including multiple pairs. The displayed option C subtracts only the all-distinct and exactly-one-pair cases and also has a denominator error; no displayed option matches the general-r probability."
};

function markReviewed(chunk) {
  for (const question of chunk.questions) {
    const held = question.uid === "go:979" || question.uid === "go:3284";
    const wasIntegrated = question.status === "INTEGRATED";
    const priorIntegration = question.review?.integrationResult;
    question.status = held ? "HOLD" : wasIntegrated ? "INTEGRATED" : "ACCEPTED";
    question.review = {
      reviewer: "Codex",
      reviewedAt: REVIEW_DATE,
      disposition: held ? "HOLD" : wasIntegrated ? "INTEGRATED" : "ACCEPTED",
      identityVerified: true,
      stemOptionsAndDiagramChecked: true,
      answerKeySource: held
        ? "Existing question-bank answer record plus GateOverflow discussion; conflict remains unresolved."
        : "Existing question-bank answer key, cross-checked against the GateOverflow discussion.",
      answerKeyVerified: !held,
      answerKeyStatus: held ? "UNRESOLVED_CONFLICT" : "MATCHED",
      sourceUrl: question.goLink,
      researchLinks: [
        { url: question.goLink, accessedAt: REVIEW_DATE },
        ...(question.uid === "go:979" ? [
          { url: "https://www.cse.iitd.ac.in/~mittal/gate/gate_math_2006.html", accessedAt: REVIEW_DATE },
          { url: "https://samagracs.com/gate-2006-cse-previous-year-questions/", accessedAt: REVIEW_DATE }
        ] : []),
        ...(question.uid === "go:3284" ? [
          { url: "https://www.cs.ox.ac.uk/people/varun.kanade/teaching/CS174-Fall2012/HW/HW4_sol.pdf", accessedAt: REVIEW_DATE }
        ] : [])
      ],
      independentCheck: held ? "The written conditions were checked for domain/definition gaps and conflicting answer reports." : "Re-derived from the question stem, then compared with the recorded answer key.",
      notes: REVIEW_NOTES[question.uid],
      ...(wasIntegrated && priorIntegration ? { integrationResult: priorIntegration } : {})
    };
  }
  chunk.reviewStatus = "REVIEWED_WITH_HOLDS";
  chunk.reviewedAt = REVIEW_DATE;
  chunk.acceptedCount = chunk.questions.filter((question) => ["ACCEPTED", "INTEGRATED"].includes(question.status)).length;
  chunk.holdCount = chunk.questions.filter((question) => question.status === "HOLD").length;
  fs.writeFileSync(CHUNK_PATH, JSON.stringify(chunk, null, 2) + "\n", "utf8");
}

function markIntegrated() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  const allSolutionsPath = path.join(ROOT, "data", "solutions", "practicepaper", "all-solutions.json");
  const allSolutions = JSON.parse(fs.readFileSync(allSolutionsPath, "utf8"));
  const shardDir = path.join(ROOT, "public", "question-detail-shards");
  const shardRows = fs.readdirSync(shardDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ file, payload: JSON.parse(fs.readFileSync(path.join(shardDir, file), "utf8")) }));
  let integratedCount = 0;

  for (const question of chunk.questions) {
    if (question.status === "HOLD") continue;
    const registrySolution = allSolutions[question.uid]?.detailed_solution;
    const shard = shardRows.find((row) => row.payload.recordsByQuestionUid?.[question.uid]);
    const shardSolution = shard?.payload.recordsByQuestionUid[question.uid]?.detailed_solution?.markdown;
    if (!registrySolution || !shardSolution) {
      throw new Error("Cannot mark " + question.uid + " integrated: solution missing from registry or detail shard.");
    }
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
  chunk.holdCount = chunk.questions.filter((question) => question.status === "HOLD").length;
  fs.writeFileSync(CHUNK_PATH, JSON.stringify(chunk, null, 2) + "\n", "utf8");

  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entry = manifest.chunks["CHUNK-CSE-MATH-12"];
  entry.status = "PARTIAL";
  entry.acceptedCount = integratedCount;
  entry.integratedCount = integratedCount;
  entry.heldCount = chunk.holdCount;
  entry.updatedAt = REVIEW_DATE;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log("CHUNK-CSE-MATH-12 integration verified: " + integratedCount + " integrated; " + chunk.holdCount + " held.");
}

export function injectChunkCseMath12() {
  const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
  const acceptedUids = new Set(chunk.questions
    .filter((question) => ["ACCEPTED", "INTEGRATED"].includes(question.status))
    .map((question) => question.uid));
  const content = fs.readFileSync(PATCHES_PATH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const toAdd = [];
  let updated = 0;
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_12_SOLUTIONS)) {
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
  if (toAdd.length + updated !== acceptedUids.size) {
    throw new Error("Accepted question count does not match authored solution count.");
  }
  if (toAdd.length) {
    const markerIndex = lines.findIndex((line) => line.includes("export const AUTHENTIC_PATCHES = {"));
    if (markerIndex === -1) throw new Error("Could not find AUTHENTIC_PATCHES marker.");
    lines.splice(markerIndex + 1, 0, ...toAdd);
  }
  fs.writeFileSync(PATCHES_PATH, lines.join(newline), "utf8");
  console.log("CHUNK-CSE-MATH-12 patches synchronized: " + acceptedUids.size + " entries (" + updated + " refreshed, " + toAdd.length + " added).");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-math-12")) {
  if (process.argv.includes("--mark-integrated")) {
    markIntegrated();
  } else if (process.argv.includes("--review-only")) {
    const chunk = JSON.parse(fs.readFileSync(CHUNK_PATH, "utf8"));
    markReviewed(chunk);
    console.log("Refreshed CHUNK-CSE-MATH-12 review metadata.");
  } else {
    injectChunkCseMath12();
  }
}
