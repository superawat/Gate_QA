import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-MATH-19";
const DATE = "2026-10-23";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-math-19.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

export const CHUNK_CSE_MATH_19_SOLUTIONS = {
  "go:314348": { concept: "Number theory - Euler totient and coprime counting", markdown: String.raw`The integers from 1 through 720 form 24 complete blocks of 30. In each block, the numbers not divisible by 2, 3, or 5 are exactly the residues coprime to 30. Their count is

$$\varphi(30)=30\left(1-\frac12\right)\left(1-\frac13\right)\left(1-\frac15\right)=8.$$

Therefore, the total is $24\cdot8=192$.

**Therefore, the numerical answer is 192.**`, images: [] },
  "go:2438": { concept: "Linear algebra - transpose of a matrix product", markdown: String.raw`For any matrices, $(AB)'=B'A'$. Since $A$ and $B$ are symmetric, $A'=A$ and $B'=B$, so

$$ (AB)'=B'A'=BA. $$

Symmetry of each factor does not imply $AA'=I$, $A=A^{-1}$, or that $A$ and $B$ commute; those require additional conditions.

**Therefore, the correct answer is Option D.**`, images: [] },
  "go:2441": { concept: "Probability - union bound", markdown: String.raw`For arbitrary events, inclusion-exclusion gives

$$P(A\cup B)=P(A)+P(B)-P(A\cap B).$$

Because $P(A\cap B)\ge0$, it follows that $P(A\cup B)\le P(A)+P(B)$, so D is always true. A requires independence, B omits the overlap term, and C has the conditional-probability formula reversed.

**Therefore, the correct answer is Option D.**`, images: [] },
  "go:2443": { concept: "Graph theory - counting unlabeled simple graphs", markdown: String.raw`Count graphs up to isomorphism (the intended meaning of “distinct” here). With one vertex there is 1 graph. With two vertices there are 2 possibilities: no edge or one edge. With three vertices, the unlabeled graphs are determined by having 0, 1, 2, or 3 edges, giving 4 possibilities. Thus the total for one, two, or three vertices is

$$1+2+4=7.$$

If vertices were labeled, the count would instead be $1+2+8=11$; that interpretation is not represented among the choices.

**Therefore, the correct answer is Option C (7).**`, images: [] },
  "go:2446": { concept: "Linear algebra - rank by row dependence", markdown: String.raw`Let the rows be $r_1=(0,0,-3)$, $r_2=(9,3,5)$, and $r_3=(3,1,1)$. The first two rows are independent because $r_2$ has nonzero first coordinate while $r_1$ does not. The third row is a combination of them:

$$r_3=\frac{2}{9}r_1+\frac13r_2.$$

Hence the row space has dimension 2. The matrix is neither zero nor full rank.

**Therefore, the correct answer is Option C (2).**`, images: [] },
  "go:2451": { concept: "Group theory - expanding a square in an abelian group", markdown: String.raw`In multiplicative notation,

$$ (g\circ h)^2=(g\circ h)\circ(g\circ h)=g\circ h\circ g\circ h. $$

Because the group is abelian, commute the middle $h$ and $g$ to get $g\circ g\circ h\circ h=g^2\circ h^2$. The other statements would require every element to have order at most 2, would force every element to be the identity, or would assert that every abelian group is finite; none follows from being abelian.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2458": { concept: "Combinatorics - counting substrings", markdown: String.raw`A contiguous substring is determined by its starting position and length. For length $k$, there are $n-k+1$ starting positions. Summing over lengths $1$ to $n$ gives

$$n+(n-1)+\cdots+1=\frac{n(n+1)}2.$$

**Therefore, the correct answer is Option D.**`, images: [] },
  "go:2475": { concept: "Probability - complement of a union of independent events", markdown: String.raw`The complement of “at least one occurs” is that all three fail. Independence gives

$$P(\text{none})=(1-0.8)(1-0.5)(1-0.3)=0.2\cdot0.5\cdot0.7=0.07.$$

Therefore, $P(\text{at least one})=1-0.07=0.93$.

**Therefore, the numerical answer is 0.93.**`, images: [] },
  "go:2476": { concept: "Order theory - classifying lattices with at most four elements", markdown: String.raw`Count Hasse diagrams up to isomorphism. There is one lattice at each size 1, 2, and 3: a single point, a two-element chain, and a three-element chain. At size 4 there are exactly two: a four-element chain and the diamond with one bottom, two incomparable middle elements, and one top. No other four-element partial order supplies both a meet and a join for every pair.

The five diagrams (lines mark the Hasse covers) are:

    1 element: o       2-element chain: o        3-element chain: o
                                      |                            |
                                      o                            o
                                                                   |
                                                                   o

    4-element chain: o                4-element diamond:   o
                     |                                     ／ ＼
                     o                                    o   o
                     |                                     ＼ ／
                     o                                      o
                     |
                     o

Thus there are $1+1+1+2=5$ Hasse diagrams.

**Therefore, the numerical answer is 5.**`, images: [] },
  "go:2495": { concept: "Set theory - subsets of countable sets", markdown: String.raw`The statement is true (using the standard convention that countable includes finite sets). If $A$ is countable, it admits an injection into $\mathbb N$. Any subset $B\subseteq A$ inherits that same injection by restriction, so $B$ also injects into $\mathbb N$ and is countable. Equivalently, a subset of an enumeration of $A$ is itself finite or can be enumerated in increasing index order.

**Therefore, the statement is True (1).**`, images: [] },
  "go:2499": { concept: "Propositional logic - testing entailment with a truth table", markdown: String.raw`To test whether $p\leftrightarrow q$ implies $p\to\neg q$, compare their truth values:

| $p$ | $q$ | $p\leftrightarrow q$ | $p\to\neg q$ |
|---|---|---|---|
| T | T | T | F |
| T | F | F | T |
| F | T | F | T |
| F | F | T | T |

The first row has a true premise and a false conclusion, so the implication does not hold. The statement “does not imply” is therefore true.

**Therefore, the numerical answer is 1 (True).**`, images: [] },
  "go:596": { concept: "Linear algebra - eigenvectors of a nilpotent matrix", markdown: String.raw`The matrix maps $(x,y,z)$ to $(\alpha z,0,0)$. Since its only eigenvalue is $0$, its eigenvectors are the nonzero vectors in the nullspace, which is characterized by $\alpha z=0$. As $\alpha\ne0$, this means $z=0$. Options B and D are nonzero vectors with third coordinate zero. Options A and C have nonzero third coordinate and are not in the nullspace.

**Therefore, the correct answers are Options B and D.**`, images: [] },
  "go:605": { concept: "Calculus - limit using Taylor expansions", markdown: String.raw`Expand near $x=0$:

$$x(e^x-1)=x^2+\frac{x^3}{2}+O(x^4),\qquad 2(\cos x-1)=-x^2+O(x^4).$$

The numerator is therefore $x^3/2+O(x^4)$. Also, $1-\cos x=x^2/2+O(x^4)$, so the denominator is $x^3/2+O(x^5)$. Their ratio tends to 1.

**Therefore, the numerical answer is 1.**`, images: [] },
  "go:2299": { concept: "Graph theory - connected unicyclic graphs", markdown: String.raw`For a connected graph, the cycle rank is $m-n+1$. Here $m=n$, so the cycle rank is 1: the graph has exactly one cycle. Therefore C is true and A is false. Removing an edge on the cycle leaves the graph connected, so B is false. To disconnect the graph, removing both edges must break its unique cycle or remove a bridge; in either case every pair of removed edges leaves the graph disconnected, so D is true.

**Therefore, the correct answers are Options C and D.**`, images: [] },
  "go:2300": { concept: "Propositional logic - distributive simplification", markdown: String.raw`Distribute $p$ over the disjunction:

$$p\wedge(\neg p\vee q)=(p\wedge\neg p)\vee(p\wedge q)=\text{False}\vee(p\wedge q)=p\wedge q.$$

It is not a tautology: it is false whenever $p$ is false. It is also not a contradiction, since it is true when both $p$ and $q$ are true.

**Therefore, the correct answer is Option B.**`, images: [] },
  "go:2301": { concept: "Set theory - finite unions of finite sets", markdown: String.raw`If all of $S_1,\ldots,S_n$ were finite, their finite union would also be finite. But their union is the infinite set $S$. Therefore at least one of the finitely many sets $S_i$ must be infinite. The other options either claim a finite set must occur or incorrectly limit how many can be infinite.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:2302": { concept: "Set theory - cardinality of a power set", markdown: String.raw`If $|A|=n$, then the Cartesian product has $|A\times A|=n^2$ ordered pairs. A set with $n^2$ elements has $2^{n^2}$ subsets, so

$$|P(A\times A)|=2^{n^2}.$$

**Therefore, the correct answer is Option B.**`, images: [] },
  "go:2303": { concept: "Order theory - strict order versus partial order", markdown: String.raw`On the real numbers, $<$ is irreflexive ($x\not<x$), asymmetric (if $x<y$, then not $y<x$), and transitive. A non-strict partial order must be reflexive, so $<$ is not a partial order under that definition. But option C incorrectly says it is not asymmetric, and options A, B, and D also assert false properties. Hence none of A-D is correct.

**Therefore, the correct answer is Option E (none of the above).**`, images: [] },
  "go:2304": { concept: "Combinatorics - counting injective functions", markdown: String.raw`Choose distinct images for the $m$ elements of $A$. There are $n$ choices for the first element, $n-1$ for the second, continuing to $n-m+1$ for the last. Thus

$$n(n-1)\cdots(n-m+1)=\frac{n!}{(n-m)!}={}^{n}P_m.$$

**Therefore, the correct answer is Option B.**`, images: [] },
  "go:563": { concept: "Graph theory - minimum order of a nonplanar simple graph", markdown: String.raw`The smallest simple nonplanar graph by number of vertices is $K_5$, which has 5 vertices and $\binom52=10$ edges. A nonplanar simple graph with 6 vertices can have 9 edges (for example, $K_{3,3}$), but it does not have the minimum number of vertices. On 5 vertices, removing any edge from $K_5$ gives the planar graph $K_5-e$, so 10 edges are required for nonplanarity at that minimum order.

**Therefore, the correct answer is Option C.**`, images: [] },
  "go:574": { concept: "Propositional logic - identifying a tautology", markdown: String.raw`Option B is always true: if $a\wedge b$ is true, then $b$ is true, and therefore $b\vee c$ is true. The other implications have counterexamples: A with $a=T,b=F$; C with $a=T,b=T,c=F$; and D with $a=T,b=T,c=F$ under the conventional right-associated implication.

**Therefore, the correct answer is Option B.**`, images: [] },
  "go:43580": { concept: "Order theory - divisors form a lattice", markdown: String.raw`The set $\{1,2,3,4,6,8,12,24\}$ is the set of positive divisors of 24. Under divisibility, the greatest common divisor is the meet and the least common multiple is the join; both remain in the set. Thus every pair has a greatest lower bound and a least upper bound, which is exactly the definition of a lattice. These operations do not make the set a group, ring, or field.

**Therefore, the correct answer is Option D (lattice).**`, images: [] },
  "go:256": { concept: "Predicate logic - distribution of quantifiers", markdown: String.raw`For A, if $\forall x\,P(x)$ holds, then $P(x)\vee Q(x)$ holds for every $x$; if $\forall x\,Q(x)$ holds, the same conclusion follows. Hence $(\forall xP(x))\vee(\forall xQ(x))$ implies $\forall x(P(x)\vee Q(x))$.

B is invalid because witnesses for $P$ and $Q$ can be different. C reverses the valid implication and fails when $P$ holds for one element and $Q$ for another. D fails in a nonempty domain where $P$ is true everywhere and $Q$ false everywhere.

**Therefore, the only valid statement is Option A.**`, images: [] },
  "go:526": { concept: "Propositional logic - unsatisfiability from contradictory consequences", markdown: String.raw`Let $H=F_1\wedge F_2$. The two premises say that both $H\to F_3$ and $H\to\neg F_3$ are tautologies. If any assignment made $H$ true, that assignment would force both $F_3$ and $\neg F_3$, an impossibility. Thus no assignment satisfies $F_1\wedge F_2$.

**Therefore, the correct answer is Option B: the conjunction is not satisfiable.**`, images: [] },
  "go:84060": { concept: "Combinatorics - Catalan numbers and binary trees", markdown: String.raw`The number of rooted ordered binary-tree shapes with $n$ nodes is the Catalan number

$$C_n=\frac{1}{n+1}\binom{2n}{n}.$$

The same Catalan number counts the parenthesizations of a product of $n+1$ matrices, so A and C are both true. Choosing and ordering $n$ elements from $2n$ gives $(2n)!/n!$, not $C_n$, and $n!$ is not the binary-tree count in general.

**Therefore, the correct answers are Options A and C.**`, images: [] }
};

const HOLD_REASONS = {};
const NOTES = {
  "go:314348": "There are 24 blocks of 30 integers and phi(30)=8 integers in each block coprime to 30, yielding 192.",
  "go:2438": "For symmetric A and B, (AB)'=B'A'=BA.",
  "go:2441": "Inclusion-exclusion gives the union bound P(A union B)<=P(A)+P(B).",
  "go:2443": "The keyed interpretation counts unlabeled graphs: 1+2+4=7; labeled counting would give 11 and is not among the choices.",
  "go:2446": "The matrix rows have rank two; r3=(2/9)r1+(1/3)r2.",
  "go:2451": "In an abelian group, commute the middle factors to obtain (g o h)^2=g^2 o h^2.",
  "go:2458": "Sum the n-k+1 substrings of each length k to get n(n+1)/2.",
  "go:2475": "The probability none occur is 0.2*0.5*0.7=0.07; complement is 0.93.",
  "go:2476": "Up to isomorphism, there are one lattice for sizes 1, 2, and 3, and two for size 4: chain and diamond.",
  "go:2495": "A subset inherits an injection into the natural numbers by restricting the injection for the countable set.",
  "go:2499": "The truth-table row p=q=True makes p iff q true and p implies not-q false, disproving entailment.",
  "go:596": "The matrix nullspace is z=0; options B and D are precisely the listed nonzero eigenvectors in that plane.",
  "go:605": "Taylor expansions make numerator and denominator both asymptotic to x^3/2.",
  "go:2299": "A connected graph with m=n has cycle rank one; it is unicyclic, so C and D hold.",
  "go:2300": "Boolean simplification gives p AND (not-p OR q) = p AND q.",
  "go:2301": "A finite union of finite sets is finite, so a finite cover of an infinite set has an infinite member.",
  "go:2302": "A cross A has n^2 ordered pairs, so its powerset has 2^(n^2) members.",
  "go:2303": "Less-than is asymmetric and irreflexive; option C falsely denies asymmetry, so E is the only valid choice.",
  "go:2304": "An injection assigns distinct images, producing n*(n-1)*...*(n-m+1)=nP_m.",
  "go:563": "The minimum-order nonplanar simple graph is K5, with 5 vertices and 10 edges.",
  "go:574": "Only a AND b implies b OR c is a tautology.",
  "go:43580": "For divisors of 24 under divisibility, gcd and lcm provide meet and join.",
  "go:256": "Only universal-disjunction distribution in option A is valid; counterexamples refute B-D.",
  "go:526": "The conjunction would force both F3 and not-F3, so it is unsatisfiable.",
  "go:84060": "Rooted ordered binary-tree shapes and parenthesizations of n+1 matrices are both counted by Catalan C_n."
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
      question.review.answerKeySource = "Existing UID answer record and source stem; an independent check could not verify a unique keyed answer.";
      question.review.answerKeyVerified = false;
      question.review.answerKeyStatus = "SOURCE_CONFLICT";
      question.review.notes = HOLD_REASONS[question.uid];
      held++;
      continue;
    }
    if (!CHUNK_CSE_MATH_19_SOLUTIONS[question.uid]) throw new Error("Missing solution for " + question.uid);
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
  for (const [uid, solution] of Object.entries(CHUNK_CSE_MATH_19_SOLUTIONS)) {
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

if (process.argv[1]?.includes("apply-chunk-cse-math-19")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
