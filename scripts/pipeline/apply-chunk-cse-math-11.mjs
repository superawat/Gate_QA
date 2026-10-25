import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_MATH_11_SOLUTIONS = {
  "go:3715": {
    concept: "Software Engineering — System Reliability & Operational Availability",
    markdown: `### 1. Concept
In software reliability engineering, **Operational Availability ($A$)** is the probability that a system or software is operating successfully at any random point in time. It is defined as the ratio of system uptime to total operating time (uptime plus downtime):
$$A = \\frac{\\text{MTBF}}{\\text{MTBF} + \\text{MTTR}}$$
where:
* **MTBF (Mean Time Between Failure)**: Average operational uptime between consecutive failures.
* **MTTR (Mean Time To Repair)**: Average downtime required to diagnose, repair, and restore the system to full operation.

---

### 2. Givens & Dimensional Harmonization
* $\\text{MTBF} = 25 \\text{ days}$
* $\\text{MTTR} = 6 \\text{ hours}$

To evaluate the availability fraction, both metrics must be converted into identical units:
$$\\text{MTBF} = 25 \\times 24 \\text{ hours} = 600 \\text{ hours}$$

---

### 3. Step-by-Step Analytical Derivation
Substitute the values into the operational availability formula:
$$A = \\frac{600 \\text{ hours}}{600 \\text{ hours} + 6 \\text{ hours}} = \\frac{600}{606} = \\frac{100}{101}$$

Computing the decimal value:
$$A = \\frac{100}{101} \\approx 0.9900990099...$$

Expressing availability as a percentage:
$$\\text{Availability} (\\%) = A \\times 100\\% = \\frac{10000}{101}\\% \\approx 99.00990099...\\%$$

---

### 4. Distractor Analysis
* **Option A ($1\\%$)**: Incorrect — corresponds approximately to the system unavailability or downtime fraction ($1 - A \\approx 0.99\\%$).
* **Option B ($24\\%$)**: Incorrect — result of erroneous arithmetic, such as neglecting day-to-hour conversion ($6 / 25$).
* **Option C ($99\\%$)**: Incorrect: it is a much less precise whole-percent approximation than the listed three-decimal choice.
* **Option D ($99.009\\%$)**: CORRECT. This is the keyed choice, written as a three-decimal truncation. Conventional rounding of $99.00990099\\ldots\\%$ to three decimal places gives $99.010\\%$.

---

### 5. Final Answer
The availability is $\\frac{10000}{101}\\% \\approx 99.00990099\\%$; the paper's keyed three-decimal choice is **Option D ($99.009\\%$)**.`,
    images: []
  },

  "go:1067": {
    concept: "Discrete Mathematics — Posets, Lattices & Complete Lattices under Set Containment",
    markdown: `### 1. Concept
1. **Lattice**: A partially ordered set (poset) $(P, \\le)$ is a lattice if every pair of elements $x, y \\in P$ has a unique greatest lower bound (meet, $x \\wedge y$) and a unique least upper bound (join, $x \\vee y$).
2. **Complete Lattice**: A lattice in which every subset (finite or infinite) has an infimum (greatest lower bound) and a supremum (least upper bound). Every finite lattice is guaranteed to be a complete lattice.
3. **Set Containment Order**: When the partial order is set inclusion ($\\subseteq$):
   * The meet $A \\wedge B$ is the largest element in $P$ that is a subset of both $A$ and $B$.
   * The join $A \\vee B$ is the smallest element in $P$ that contains both $A$ and $B$.

---

### 2. Givens & Parameters
The given set of subsets is:
$$S = \\left\\{ \\{1, 2\\}, \\{1, 2, 3\\}, \\{1, 3, 5\\}, \\{1, 2, 4\\}, \\{1, 2, 3, 4, 5\\} \\right\\}$$
Under the partial order defined by $\\subseteq$.

Let the elements be denoted as:
* $s_1 = \\{1, 2\\}$
* $s_2 = \\{1, 2, 3\\}$
* $s_3 = \\{1, 3, 5\\}$
* $s_4 = \\{1, 2, 4\\}$
* $s_5 = \\{1, 2, 3, 4, 5\\}$

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Check Joins (Least Upper Bounds) in $S$**
* The element $s_5 = \\{1, 2, 3, 4, 5\\}$ contains all elements of $S$, serving as the top element $\\mathbf{1}$.
* Pairwise joins:
  * $\\{1, 2\\} \\vee \\{1, 2, 3\\} = \\{1, 2, 3\\} \\in S$
  * $\\{1, 2\\} \\vee \\{1, 2, 4\\} = \\{1, 2, 4\\} \\in S$
  * $\\{1, 2\\} \\vee \\{1, 3, 5\\} = \\{1, 2, 3, 4, 5\\} \\in S$
  * $\\{1, 2, 3\\} \\vee \\{1, 2, 4\\} = \\{1, 2, 3, 4, 5\\} \\in S$
  * $\\{1, 2, 3\\} \\vee \\{1, 3, 5\\} = \\{1, 2, 3, 4, 5\\} \\in S$
  * $\\{1, 3, 5\\} \\vee \\{1, 2, 4\\} = \\{1, 2, 3, 4, 5\\} \\in S$
Every pair of elements in $S$ already has a unique least upper bound belonging to $S$.

**Step 2: Check Meets (Greatest Lower Bounds) in $S$**
* Consider the pair $\\{1, 2\\}$ and $\\{1, 3, 5\\}$:
  * Their intersection is $\\{1, 2\\} \\cap \\{1, 3, 5\\} = \\{1\\}$.
  * In the set $S$, there is no element that is a subset of both $\\{1, 2\\}$ and $\\{1, 3, 5\\}$.
  * Therefore, the meet $\\{1, 2\\} \\wedge \\{1, 3, 5\\}$ does not exist in $S$.
* Similarly, for $\\{1, 3, 5\\}$ and $\\{1, 2, 4\\}$:
  * $\\{1, 3, 5\\} \\cap \\{1, 2, 4\\} = \\{1\\} \\notin S$.
  * No lower bound exists in $S$.

**Step 3: Test Candidate Inclusions**
* If we augment $S$ by adding the single set $\\{1\\}$:
  $$S' = S \\cup \\{\\{1\\}\\}$$
  * Since $\\{1\\} \\subseteq s$ for every $s \\in S$, $\\{1\\}$ is the unique least element (bottom $\\mathbf{0}$) of $S'$.
  * Now every pair has a meet:
    * $\\{1, 2\\} \\wedge \\{1, 3, 5\\} = \\{1\\} \\in S'$
    * $\\{1, 3, 5\\} \\wedge \\{1, 2, 4\\} = \\{1\\} \\in S'$
    * $\\{1, 2, 3\\} \\wedge \\{1, 3, 5\\} = \\{1\\} \\in S'$
    * $\\{1, 2, 3\\} \\wedge \\{1, 2, 4\\} = \\{1, 2\\} \\in S'$ (since $\\{1, 2\\} \\subseteq \\{1, 2, 3\\}$ and $\\{1, 2\\} \\subseteq \\{1, 2, 4\\}$)
  * Since $S'$ is a finite poset in which every pair has a unique join and meet, $S'$ is a lattice.
  * Every finite lattice is a complete lattice.
  * Hence, the inclusion of $\\{1\\}$ alone is both **necessary** (to resolve the missing infima) and **sufficient**.

---

### 4. Distractor Analysis
* **Option A ($\\{1\\}$)**: ✓ **CORRECT** — adding $\\{1\\}$ provides the necessary unique bottom element and completes all pairwise meets.
* **Option B ($\\{1\\}, \\{2, 3\\}$)**: Incorrect — $\\{2, 3\\}$ is not a subset of $\\{1, 2\\}$ or $\\{1, 3, 5\\}$, and its inclusion is superfluous.
* **Option C ($\\{1\\}, \\{1, 3\\}$)**: Incorrect — while adding $\\{1, 3\\}$ does not break the lattice, it is not *necessary*; $\\{1\\}$ alone is sufficient.
* **Option D ($\\{1\\}, \\{1, 3\\}, \\{1, 2, 3, 4\\}, \\{1, 2, 3, 5\\}$)**: Incorrect — includes unnecessary redundant intermediate sets.

---

### 5. Final Answer
The inclusion of **$\\{1\\}$** is necessary and sufficient to make $S$ a complete lattice, corresponding to **Option A**.`,
    images: []
  },

  "go:1068": {
    concept: "Engineering Mathematics — Probability, Binomial Scoring & Linearity of Expectation",
    markdown: `### 1. Concept
By the **Linearity of Expectation**, the expected value of a sum of random variables equals the sum of their individual expectations, regardless of whether the variables are independent:
$$\\mathbb{E}\\left[\\sum_{k=1}^M X_k\\right] = \\sum_{k=1}^M \\mathbb{E}[X_k]$$

For a multiple-choice question with $k$ options where one option is correct:
* Probability of guessing correctly: $p = \\frac{1}{k}$
* Probability of guessing incorrectly: $q = 1 - p = \\frac{k-1}{k}$

---

### 2. Givens & Parameters
* Total questions per student: $N = 150$
* Choices per question: $k = 4$
* Marks awarded for a correct answer: $+1$
* Penalty for an incorrect answer: $-0.25 = -\\frac{1}{4}$
* Total number of students: $S = 1000$
* All answers chosen uniformly and independently at random:
  $$P(\\text{correct}) = \\frac{1}{4}, \\quad P(\\text{incorrect}) = \\frac{3}{4}$$

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Expected Marks for a Single Question**
Let $X$ denote the score obtained on a single question by a student who guesses uniformly at random:
$$\\mathbb{E}[X] = (+1) \\times P(\\text{correct}) + (-0.25) \\times P(\\text{incorrect})$$
$$\\mathbb{E}[X] = 1 \\times \\frac{1}{4} + \\left(-\\frac{1}{4}\\right) \\times \\frac{3}{4} = \\frac{1}{4} - \\frac{3}{16}$$
$$\\mathbb{E}[X] = \\frac{4 - 3}{16} = \\frac{1}{16} = 0.0625$$

*Remark*: Because the negative marking ($-0.25$) is less severe than the actuarially neutral penalty ($-\\frac{1}{k-1} = -\\frac{1}{3} \\approx -0.333$), the expected score per question is strictly positive ($+0.0625$).

**Step 2: Expected Marks for One Student Across the Whole Exam**
Let $M_i$ be the total marks obtained by student $i$ over all $150$ questions:
$$\\mathbb{E}[M_i] = \\sum_{j=1}^{150} \\mathbb{E}[X_{i,j}] = 150 \\times \\frac{1}{16} = \\frac{150}{16} = 9.375$$

**Step 3: Sum Total of Expected Marks for All 1000 Students**
Let $T = \\sum_{i=1}^{1000} M_i$ be the sum total of marks obtained by all $1000$ students:
$$\\mathbb{E}[T] = \\sum_{i=1}^{1000} \\mathbb{E}[M_i] = 1000 \\times 9.375 = 9375$$

---

### 4. Distractor Analysis
* **Option A ($0$)**: Incorrect — assumes a zero-sum examination penalty where penalty $= -\\frac{1}{3}$ marks; with $-0.25$ penalty, random guessing produces a net positive expectation.
* **Option B ($2550$)**: Incorrect — arithmetic mistake resulting from misinterpreting the penalty ratio.
* **Option C ($7525$)**: Incorrect — it does not follow from the exact expected score per question and the stated exam and student counts.
* **Option D ($9375$)**: ✓ **CORRECT** — precisely $1000 \\times 150 \\times \\frac{1}{16} = 9375$.

---

### 5. Final Answer
The sum total of the expected marks obtained by all students is **$9375$**, corresponding to **Option D**.`,
    images: []
  },

  "go:1069": {
    concept: "Discrete Mathematics — Combinatorics, Combinations with Repetition & Pigeonhole Principle",
    markdown: `### 1. Concept
We are tasked with assigning a pair of colours to the two prints of each English letter such that:
1. Both prints of a letter can have the same colour (repetition allowed).
2. The colour pair used for any letter must be unique (an unordered 2-multiset chosen from $k$ available colours).

The number of distinct unordered pairs (2-combinations with repetition) that can be selected from a set of $k$ distinct colours is given by:
$$\\binom{k + 2 - 1}{2} = \\binom{k + 1}{2} = \\frac{k(k + 1)}{2}$$

Alternatively:
* Number of pairs with two identical colours: $k$
* Number of pairs with two distinct colours: $\\binom{k}{2} = \\frac{k(k - 1)}{2}$
* Total available colour pairs:
  $$k + \\frac{k(k - 1)}{2} = \\frac{2k + k^2 - k}{2} = \\frac{k(k + 1)}{2}$$

---

### 2. Givens & Scope
* English alphabet has $26$ distinct letters ($A$ through $Z$).
* Each letter has $2$ prints ($52$ total prints).
* A colour pair is treated as an unordered pair with repetition, matching the conventional interpretation behind the keyed answer.
* To assign a distinct colour pair to every one of the $26$ letters, the total number of available colour pairs must be at least $26$:
  $$\\frac{k(k + 1)}{2} \\ge 26 \\implies k(k + 1) \\ge 52$$

---

### 3. Step-by-Step Analytical Derivation
We search for the minimum positive integer $k$ satisfying $k(k + 1) \\ge 52$:

* **For $k = 5$**:
  $$\\frac{5 \\times 6}{2} = 15 < 26 \\quad (\\text{insufficient})$$
* **For $k = 6$**:
  $$\\frac{6 \\times 7}{2} = 21 < 26 \\quad (\\text{insufficient; 21 pairs can only colour 21 letters})$$
* **For $k = 7$**:
  $$\\frac{7 \\times 8}{2} = 28 \\ge 26 \\quad (\\text{sufficient; provides 28 unique colour pairs})$$

Since $k = 6$ yields only $21$ unique colour pairs and $21 < 26$, by the Pigeonhole Principle at least two letters would be forced to share the same colour pair. Therefore, $k = 7$ is the absolute minimum number of colours required.

---

### 4. Distractor Analysis
* **Option A ($9$)**: Incorrect — provides $\\binom{10}{2} = 45$ colour pairs; valid but not the minimum.
* **Option B ($8$)**: Incorrect — provides $\\binom{9}{2} = 36$ colour pairs; valid but not the minimum.
* **Option C ($7$)**: ✓ **CORRECT** — smallest integer such that $\\frac{k(k+1)}{2} \\ge 26$.
* **Option D ($6$)**: Incorrect — yields only $21$ colour pairs, which is insufficient for $26$ distinct letters.

---

### 5. Final Answer
The minimum value of $k$ that satisfies this requirement is **$7$**, corresponding to **Option C**.`,
    images: []
  },

  "go:1070": {
    concept: "Engineering Mathematics — Linear Algebra & Matrix Covers",
    markdown: `### 1. Concept
In an $M \\times N$ matrix, we seek to find the maximum number of non-zero entries such that **no two entries lie on the same row or the same column**. Such entries are known as **independent entries** (or a set of independent positions, analogous to non-attacking rooks on a generalized chessboard).

Let $a$ be the number of rows containing non-zero entries and $b$ the number of columns containing non-zero entries. Any selection with distinct rows and columns can use at most one entry from each of those rows and columns.

---

### 2. Givens & Parameters
* Matrix dimensions: $M \\times N$
* A designated subset of rows $R$ with $|R| = a$
* A designated subset of columns $C$ with $|C| = b$
* Condition: Every non-zero entry $A_{ij} \\ne 0$ satisfies $i \\in R$ and $j \\in C$.
* Goal: Find the maximum cardinality $k$ of an independent set of non-zero entries $S = \\{(i_1, j_1), (i_2, j_2), \\dots, (i_k, j_k)\\}$ where all $i_r$ are mutually distinct and all $j_r$ are mutually distinct.

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Constraint from the Row Dimension**
* Each chosen non-zero entry $(i_r, j_r) \\in S$ must have a unique row index $i_r$.
* Because all non-zero entries in the matrix lie within the $a$ selected rows of $R$, every chosen row index $i_r \\in R$.
* The number of available distinct row indices in $R$ is $|R| = a$.
* Therefore, you cannot choose more than $a$ entries without at least two entries sharing a row:
  $$k \\le a$$

**Step 2: Constraint from the Column Dimension**
* Similarly, each chosen non-zero entry $(i_r, j_r) \\in S$ must have a unique column index $j_r$.
* Because all non-zero entries in the matrix lie within the $b$ selected columns of $C$, every chosen column index $j_r \\in C$.
* The number of available distinct column indices in $C$ is $|C| = b$.
* Therefore, you cannot choose more than $b$ entries without at least two entries sharing a column:
  $$k \\le b$$

**Step 3: Combining the Simultaneous Constraints**
* Since the chosen set $S$ must simultaneously satisfy both conditions:
  $$k \\le a \\quad \\text{and} \\quad k \\le b$$
* The maximum possible number of such entries is tightly bounded by:
  $$k \\le \\min(a, b)$$

*Remark*: This upper bound is exact and achievable whenever the $a \\times b$ submatrix formed by $R \\times C$ contains a diagonal configuration of non-zero entries of size $\\min(a, b)$.

---

### 4. Distractor Analysis
* **Option A ($\\leq a +b$)**: Not the tight answer; it is a looser upper bound than $\\min(a,b)$.
* **Option B ($\\leq \\max(a, b)$)**: Not the tight answer; when $a \\ne b$, this can exceed the limiting number of distinct rows or columns.
* **Option C ($\\le \\min(M - a, N - b)$)**: Incorrect — references the complement dimensions outside the non-zero submatrix, which have no bearing on the non-zero entries.
* **Option D ($\\le \\min(a, b)$)**: ✓ **CORRECT** — tightly and correctly bounded by the minimum of the available row and column indices.

---

### 5. Final Answer
The maximum number of such non-zero entries is **$\\le \\min(a, b)$**, corresponding to **Option D**.`,
    images: []
  },

  "go:1071": {
    concept: "Discrete Mathematics — Graph Theory, Vertex Coloring & Chromatic Number",
    markdown: `### 1. Concept
The **chromatic number** $\\chi(G)$ of a graph $G$ is the minimum number of colours required to color the vertices of $G$ such that no two adjacent vertices share the same colour (proper vertex colouring).
* If a graph contains an odd cycle or a complete subgraph $K_3$ (triangle), then $\\chi(G) \\ge 3$.
* If no valid 3-colouring can be found, then $\\chi(G) \\ge 4$.

---

### 2. Graph Topology & Structure
The graph contains $8$ vertices arranged symmetrically:
* **Outer Diamond (4 vertices)**: Top ($T$), Bottom ($B$), Left ($L$), Right ($R$).
  * The outer edges form a 4-cycle: $(T, L), (T, R), (B, L), (B, R)$.
* **Inner Cycle (4 vertices)**: $v_1$ (top-left), $v_2$ (top-right), $v_3$ (bottom-left), $v_4$ (bottom-right).
  * The inner edges form a 4-cycle: $(v_1, v_2), (v_2, v_4), (v_4, v_3), (v_3, v_1)$.
* **Cross/Triangulating Edges**:
  * $T$ is connected to $v_1$ and $v_2$.
  * $B$ is connected to $v_3$ and $v_4$.
  * $L$ is connected to $v_1$ and $v_3$.
  * $R$ is connected to $v_2$ and $v_4$.

Notice that $T, L, v_1$ form a triangle ($K_3$). Similarly, $(T, R, v_2)$, $(B, L, v_3)$, and $(B, R, v_4)$ are all triangles.

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Lower Bound $\\chi(G) \\ge 3$**
Since the graph contains triangles (e.g., the 3-cycle $T - L - v_1 - T$), at least $3$ colours are required:
$$\\chi(G) \\ge 3$$

**Step 2: Impossibility of 3-Colouring**
Suppose for contradiction that $G$ can be properly colored with $3$ colours: $\\{1, 2, 3\\}$.
Consider the outer vertices $T, B, L, R$:

* **Case 1: $T$ and $B$ receive the same colour.**
  * Let $\\text{color}(T) = \\text{color}(B) = 1$.
  * Since $L$ and $R$ are both adjacent to $T$ and $B$, their colours must come from $\\{2, 3\\}$.
  * *Subcase 1a*: If $\\text{color}(L) = \\text{color}(R) = 2$:
    * $v_1$ is adjacent to $T$ (1) and $L$ (2) $\\implies \\text{color}(v_1) = 3$.
    * $v_2$ is adjacent to $T$ (1) and $R$ (2) $\\implies \\text{color}(v_2) = 3$.
    * But $v_1$ and $v_2$ are adjacent! Both having colour 3 violates proper colouring. Contradiction.
  * *Subcase 1b*: If $\\text{color}(L) = 2$ and $\\text{color}(R) = 3$:
    * $v_1$ is adjacent to $T$ (1) and $L$ (2) $\\implies \\text{color}(v_1) = 3$.
    * $v_3$ is adjacent to $B$ (1) and $L$ (2) $\\implies \\text{color}(v_3) = 3$.
    * But $v_1$ and $v_3$ are adjacent! Both having colour 3 violates proper colouring. Contradiction.

* **Case 2: $T$ and $B$ receive different colours.**
  * Without loss of generality, let $\\text{color}(T) = 1$ and $\\text{color}(B) = 2$.
  * $L$ is adjacent to both $T$ (1) and $B$ (2) $\\implies \\text{color}(L) = 3$.
  * $R$ is adjacent to both $T$ (1) and $B$ (2) $\\implies \\text{color}(R) = 3$.
  * Now examine the inner vertices:
    * $v_1$ is adjacent to $T$ (1) and $L$ (3) $\\implies \\text{color}(v_1) = 2$.
    * $v_2$ is adjacent to $T$ (1) and $R$ (3) $\\implies \\text{color}(v_2) = 2$.
    * But $(v_1, v_2) \\in E$, so they cannot both have colour 2! Contradiction.

Since all possible 3-colour assignments lead to adjacent vertices sharing a colour, the graph **cannot be 3-coloured**:
$$\\chi(G) \\ge 4$$

**Step 3: Valid 4-Colouring Construction**
Assign 4 colours $\\{1, 2, 3, 4\\}$ as follows:
* Outer vertices:
  $$\\text{color}(T) = 1, \\quad \\text{color}(B) = 2, \\quad \\text{color}(L) = 3, \\quad \\text{color}(R) = 4$$
* Inner vertices:
  * $\\text{color}(v_1) = 2$ (adjacent to $T=1, L=3$; valid)
  * $\\text{color}(v_2) = 3$ (adjacent to $T=1, R=4, v_1=2$; valid)
  * $\\text{color}(v_3) = 4$ (adjacent to $B=2, L=3, v_1=2$; valid)
  * $\\text{color}(v_4) = 1$ (adjacent to $B=2, R=4, v_2=3, v_3=4$; valid)

Verifying all edges:
* Inner cycle: $(v_1, v_2) \\to (2, 3)$, $(v_2, v_4) \\to (3, 1)$, $(v_4, v_3) \\to (1, 4)$, $(v_3, v_1) \\to (4, 2)$ — all distinct!
* Outer cycle: $(T, L) \\to (1, 3)$, $(T, R) \\to (1, 4)$, $(B, L) \\to (2, 3)$, $(B, R) \\to (2, 4)$ — all distinct!
* Triangulating edges: all distinct!

Thus, $\\chi(G) = 4$.

---

### 4. Distractor Analysis
* **Option A ($2$)**: Incorrect — the presence of odd cycles and triangles precludes bipartiteness (which requires 2 colours).
* **Option B ($3$)**: Incorrect — impossible because any 3-colouring forces monochromatic edges on the inner cycle.
* **Option C ($4$)**: ✓ **CORRECT** — chromatic number $\\chi(G) = 4$.
* **Option D ($5$)**: Incorrect — valid colouring exists with 4 colours, so 5 is not the minimum.

---

### 5. Final Answer
The minimum number of colours required to colour the graph is **$4$**, corresponding to **Option C**.`,
    images: []
  },

  "go:1072": {
    concept: "Engineering Mathematics — Probability & Hamming Distance on Binary Strings",
    markdown: `### 1. Concept
The **Hamming distance** $H(S_1, S_2)$ between two binary strings $S_1$ and $S_2$ of equal length $n$ is defined as the number of bit positions at which the corresponding bits differ:
$$H(S_1, S_2) = \\sum_{i=1}^n [S_1[i] \\ne S_2[i]]$$
Equivalently, $H(S_1, S_2)$ equals the Hamming weight (number of $1$s) of the bitwise XOR string $Z = S_1 \\oplus S_2$.

---

### 2. Givens & Scope
* Strings $S_1$ and $S_2$ have length $n$.
* Both strings are chosen independently and uniformly at random from the set of all $2^n$ binary strings:
  $$P(S_1 = s) = \\frac{1}{2^n}, \\quad P(S_2 = s) = \\frac{1}{2^n}$$
* Target: The probability that $H(S_1, S_2) = d$, where $0 \\le d \\le n$.

---

### 3. Step-by-Step Analytical Derivation

**Method 1: Uniform Sample Space Counting**
* Fix any arbitrary string $S_1$.
* The string $S_2$ is selected uniformly from all $2^n$ possible $n$-bit binary strings.
* For $S_2$ to differ from $S_1$ at exactly $d$ positions, we must choose exactly $d$ positions out of $n$ where $S_2$ flips the bit of $S_1$.
* The number of such strings $S_2$ is:
  $$\\binom{n}{d} = {}^{n}\\mathrm{C}_d$$
* Since all $2^n$ choices for $S_2$ are equally likely:
  $$P(H(S_1, S_2) = d) = \\frac{{}^{n}\\mathrm{C}_d}{2^n}$$

**Method 2: Independent Bernoulli Trials**
* At each position $i \\in \\{1, 2, \\dots, n\\}$, the bits $S_1[i]$ and $S_2[i]$ are independent fair coin flips:
  $$P(S_1[i] = 0) = P(S_1[i] = 1) = \\frac{1}{2}$$
  $$P(S_2[i] = 0) = P(S_2[i] = 1) = \\frac{1}{2}$$
* The probability that the bits differ at position $i$ is:
  $$p = P(S_1[i] \\ne S_2[i]) = P(0, 1) + P(1, 0) = \\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$$
* The bit-by-bit comparisons are mutually independent Bernoulli trials with success parameter $p = 1/2$.
* The number of differing bit positions $D$ follows a Binomial distribution $B\\left(n, \\frac{1}{2}\\right)$:
  $$P(D = d) = \\binom{n}{d} p^d (1 - p)^{n - d} = \\binom{n}{d} \\left(\\frac{1}{2}\\right)^d \\left(\\frac{1}{2}\\right)^{n - d} = \\frac{{}^{n}\\mathrm{C}_d}{2^n}$$

---

### 4. Distractor Analysis
* **Option A ($\\dfrac{{}^{n}\\mathrm{C}_{d}}{2^{n}}$)**: ✓ **CORRECT** — matches the standard binomial probability distribution for $n$ fair trials.
* **Option B ($\\dfrac{{}^{n}\\mathrm{C}_{d}}{2^{d}}$)**: Incorrect — uses denominator $2^d$ instead of the total sample space size $2^n$.
* **Option C ($\\dfrac{d}{2^{n}}$)**: Incorrect — replaces the combinatorial selection term \${}^{n}\\mathrm{C}_d$ with the linear index $d$.
* **Option D ($\\dfrac{1}{2^{d}}$)**: Incorrect — omits both the combination factor and the remaining $n - d$ bit positions.

---

### 5. Final Answer
The probability that the Hamming distance is equal to $d$ is **$\\dfrac{{}^{n}\\mathrm{C}_{d}}{2^{n}}$**, corresponding to **Option A**.`,
    images: []
  },

  "go:1074": {
    concept: "Engineering Mathematics — Continuous Probability, Joint Uniform Distributions & Second Moments",
    markdown: `### 1. Concept
For a point $(X, Y)$ selected uniformly at random in a continuous planar region $R \\subset \\mathbb{R}^2$, the joint probability density function (PDF) is constant and equal to the reciprocal of the area of $R$:
$$f_{X,Y}(x, y) = \\begin{cases} \\frac{1}{\\text{Area}(R)}, & (x, y) \\in R \\\\[6pt] 0, & \\text{otherwise} \\end{cases}$$

If $p$ is the length of the position vector $\\vec{r} = (X, Y)$, then:
$$p = \\sqrt{X^2 + Y^2} \\implies p^2 = X^2 + Y^2$$
By the linearity of expectation:
$$\\mathbb{E}[p^2] = \\mathbb{E}[X^2 + Y^2] = \\mathbb{E}[X^2] + \\mathbb{E}[Y^2]$$

---

### 2. Givens & Parameters
* Region $R$: Rectangle with vertices at $(0,0), (1,0), (1,2), (0,2)$.
* Coordinate ranges:
  $$0 \\le x \\le 1, \\quad 0 \\le y \\le 2$$
* Area of $R$:
  $$\\text{Area}(R) = (1 - 0) \\times (2 - 0) = 2$$
* Because $R$ is a Cartesian product of intervals $[0, 1] \\times [0, 2]$, $X$ and $Y$ are independent uniform random variables:
  $$X \\sim U(0, 1) \\implies f_X(x) = 1, \\quad x \\in [0, 1]$$
  $$Y \\sim U(0, 2) \\implies f_Y(y) = \\frac{1}{2}, \\quad y \\in [0, 2]$$

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Compute $\\mathbb{E}[X^2]$**
$$\\mathbb{E}[X^2] = \\int_0^1 x^2 f_X(x) \\, dx = \\int_0^1 x^2 (1) \\, dx = \\left[ \\frac{x^3}{3} \\right]_0^1 = \\frac{1}{3}$$

**Step 2: Compute $\\mathbb{E}[Y^2]$**
$$\\mathbb{E}[Y^2] = \\int_0^2 y^2 f_Y(y) \\, dy = \\int_0^2 y^2 \\left(\\frac{1}{2}\\right) \\, dy = \\frac{1}{2} \\left[ \\frac{y^3}{3} \\right]_0^2 = \\frac{1}{2} \\left(\\frac{8}{3}\\right) = \\frac{4}{3}$$

**Step 3: Compute $\\mathbb{E}[p^2]$**
Combine the individual expectations:
$$\\mathbb{E}[p^2] = \\mathbb{E}[X^2] + \\mathbb{E}[Y^2] = \\frac{1}{3} + \\frac{4}{3} = \\frac{5}{3}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{2}{3}$)**: Incorrect — corresponds to $\\mathbb{E}[X^2] + \\mathbb{E}[X^2] = \\frac{1}{3} + \\frac{1}{3}$.
* **Option B ($1$)**: Incorrect: replacing second moments by squared first moments gives $(\\mathbb{E}[X])^2 + (\\mathbb{E}[Y])^2 = (0.5)^2 + 1^2 = 1.25$, not the required second moment.
* **Option C ($\\frac{4}{3}$)**: Incorrect — reflects solely $\\mathbb{E}[Y^2]$, erroneously omitting the $X$-coordinate contribution.
* **Option D ($\\frac{5}{3}$)**: ✓ **CORRECT** — exact value $\\frac{1}{3} + \\frac{4}{3} = \\frac{5}{3}$.

---

### 5. Final Answer
The expected value of $p^2$ is **$\\left(\\dfrac{5}{3}\\right)$**, corresponding to **Option D**.`,
    images: []
  },

  "go:3733": {
    concept: "Web Technologies — XML Document Well-Formedness & DTD Validation",
    markdown: `### 1. Concept
In XML processing standards (W3C XML 1.0 Specification):
1. **Well-Formed XML Document**:
   * Must begin with a valid XML declaration (e.g., \`<?xml version="1.0"?>\`).
   * Must have exactly one root element enclosing all other elements.
   * All elements must have matching closing tags in proper nesting order.
   * Tag names are case-sensitive.
   * Attribute values must be enclosed in quotes.
2. **Validated (Valid) XML Document**:
   * The document must first be **well-formed**.
   * The document must contain or reference a Document Type Definition (DTD) or XML Schema.
   * The document's structure, element nesting, and data types must strictly conform to all rules and declarations defined in the DTD.

---

### 2. Code Inspection
* **XML File (\`intro.xml\`)**:
  \`\`\`xml
  <?xml version = "1.0"?>
  <!DOCTYPE myMessage SYSTEM "intro.dtd">
  <myMessage>
      <message>Welcome to XML</message>
  </myMessage>
  \`\`\`
* **DTD File (\`intro.dtd\`)**:
  \`\`\`dtd
  <!ELEMENT myMessage (message)>
  <!ELEMENT message (#PCDATA)>
  \`\`\`

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Check for Well-Formedness**
* \`intro.xml\` begins with the standard declaration \`<?xml version = "1.0"?>\`.
* It defines a single root element \`<myMessage>\` that is closed by \`</myMessage>\`.
* The child element \`<message>\` is opened and closed properly (\`</message>\`) inside the root element without improper tag overlap.
* Hence, \`intro.xml\` is **well-formed**.

**Step 2: Check for DTD Validation**
* The document references the DTD via \`<!DOCTYPE myMessage SYSTEM "intro.dtd">\`, matching root element \`myMessage\`.
* In \`intro.dtd\`:
  1. \`<!ELEMENT myMessage (message)>\`: Specifies that the element \`<myMessage>\` must contain exactly one child element \`<message>\`. In \`intro.xml\`, \`<myMessage>\` contains exactly one \`<message>\` element.
  2. \`<!ELEMENT message (#PCDATA)>\`: Specifies that the element \`<message>\` must contain parsed character data (\`#PCDATA\`). In \`intro.xml\`, \`<message>\` contains the character text \`"Welcome to XML"\`.
* The document perfectly satisfies both element type declarations with zero structural or syntactic violations.
* Therefore, a validating parser will determine that \`intro.xml\` is **validated**.

Combining both checks, the parser classifies the file as **Well-formed and validated**.

---

### 4. Distractor Analysis
* **Option A (Well-formed and validated)**: ✓ **CORRECT** — meets all syntactic well-formedness rules and strictly obeys the DTD structure.
* **Option B (Well-formed but not validated)**: Incorrect — fails to recognize that the document conforms 100% to \`intro.dtd\`.
* **Option C (Validated but not well-formed)**: Incorrect — impossible by definition; validation requires well-formedness as a prerequisite.
* **Option D (Neither validated nor well-formed)**: Incorrect — both requirements are fully satisfied.

---

### 5. Final Answer
A validating parser will classify \`intro.xml\` as **Well-formed and validated**, corresponding to **Option A**.`,
    images: []
  },

  "go:3734": {
    concept: "Web Technologies — HTML Hyperlinks, Anchor Tag Syntax & URI References",
    markdown: `### 1. Concept
In the HTML specification (HTML 4.01 / XHTML / HTML5) and URI standards (RFC 2396 / RFC 3986), the anchor tag \`<a>\` uses the \`href\` (hypertext reference) attribute to specify the destination of a hyperlink.

The \`href\` attribute accepts several valid syntactic forms of URI references:
1. **Absolute URI**: Includes scheme/protocol, authority/domain, and path.
2. **Root-relative URI (Absolute path reference)**: Begins with a leading slash \`/\`, resolving from the top-level root directory of the current host.
3. **Document-relative URI (Relative path reference)**: Contains no scheme or leading slash, resolving relative to the directory of the current document.
4. **Fragment Identifier (Anchor bookmark)**: Appends a \`#fragment\` identifier to navigate directly to a named anchor (\`<a name="...">\`) or an element with the corresponding \`id\` attribute.

---

### 2. Examination of the Given Anchor Usages
1. **Usage I**:
   \`\`\`html
   <A HREF = "http://www.gate.ac.in/HTML/BASIC/testpage.html">Test Me</A>
   \`\`\`
   * Specifies an absolute URL with scheme (\`http://\`), domain (\`www.gate.ac.in\`), and path (\`/HTML/BASIC/testpage.html\`). This is standard and valid.

2. **Usage II**:
   \`\`\`html
   <A HREF = "/BASIC/testpage.html">Test Me</A>
   \`\`\`
   * Specifies a root-relative path reference starting with \`/\`. The browser resolves this against the base server domain. This is standard and valid.

3. **Usage III**:
   \`\`\`html
   <A HREF = "testpage.html">Test Me</A>
   \`\`\`
   * Specifies a document-relative path. The browser fetches \`testpage.html\` from the same directory as the current web page. This is standard and valid.

4. **Usage IV**:
   \`\`\`html
   <A HREF = "testpage.html#test">Test Me</A>
   \`\`\`
   * Specifies a document-relative URL combined with a fragment identifier \`#test\`. The browser loads \`testpage.html\` and scrolls directly to the section/element with \`id="test"\` or \`name="test"\`. This is standard and valid.

---

### 3. Step-by-Step Analytical Derivation
Because all four forms (I, II, III, and IV) represent completely standard, RFC-compliant URI references supported by all HTML specifications and web browsers, every single one of the given usages is valid.

---

### 4. Distractor Analysis
* **Option A (I and II only)**: Incorrect — overlooks valid document-relative and fragment-targeted hyperlinks.
* **Option B (I and III only)**: Incorrect — overlooks valid root-relative and fragment-targeted hyperlinks.
* **Option C (I, II and III only)**: Incorrect — erroneously assumes that fragment identifiers (\`#test\`) are invalid in an \`href\` attribute.
* **Option D (I, II, III and IV)**: ✓ **CORRECT** — all four anchor declarations are fully valid HTML.

---

### 5. Final Answer
All four usages are valid, so the correct option is **I, II, III and IV**, corresponding to **Option D**.`,
    images: []
  },

  "go:894": {
    concept: "Engineering Mathematics — Probability, Almost-Sure Events & Conditional Probability",
    markdown: `### 1. Concept
The conditional probability of event $X$ given event $Y$ (with $P(Y) > 0$) is defined by Bayes' theorem / Kolmogorov's definition as:
$$P(X \\mid Y) = \\frac{P(X \\cap Y)}{P(Y)}$$

When an event $A$ satisfies $P(A) = 1$, it is an **almost-sure event** (its complement $A^c$ is a null event with $P(A^c) = 0$).
By set decomposition for any event $B$:
$$B = (B \\cap A) \\cup (B \\cap A^c)$$
Taking probabilities on both sides:
$$P(B) = P(B \\cap A) + P(B \\cap A^c) = P(B \\cap A) + 0 = P(A \\cap B)$$
Therefore, whenever $P(A) = 1$, the joint probability simplifies to:
$$P(A \\cap B) = P(B)$$

---

### 2. Givens & Scope
* $P(A) = 1$
* $P(B) = \\frac{1}{2}$
* Target: The values of $P(A \\mid B)$ and $P(B \\mid A)$ respectively.

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Compute Joint Probability $P(A \\cap B)$**
$$P(A \\cap B) = P(B) = \\frac{1}{2}$$

**Step 2: Evaluate $P(A \\mid B)$**
Using the conditional probability definition:
$$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{1/2}{1/2} = 1$$
*Intuition*: Since event $A$ is certain to occur ($P(A) = 1$), knowing that event $B$ has occurred does not change the certainty of $A$. Hence, $P(A \\mid B) = 1$.

**Step 3: Evaluate $P(B \\mid A)$**
Using the conditional probability definition:
$$P(B \\mid A) = \\frac{P(A \\cap B)}{P(A)} = \\frac{1/2}{1} = \\frac{1}{2}$$
*Intuition*: Conditioning on an event of probability 1 provides no additional restrictive information, so $P(B \\mid A) = P(B) = \\frac{1}{2}$.

Combining both evaluations:
$$P(A \\mid B) = 1, \\qquad P(B \\mid A) = \\frac{1}{2}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{1}{4}, \\frac{1}{2}$)**: Incorrect — assumes $P(A \\cap B) = P(A) \\cdot P(B) = 1 \\cdot \\frac{1}{2} = \\frac{1}{2}$, but erroneously calculates $P(A \\mid B)$ as $\\frac{1/2}{2} = \\frac{1}{4}$.
* **Option B ($\\frac{1}{2}, \\frac{1}{4}$)**: Incorrect — result of swapped formulas and incorrect division.
* **Option C ($\\frac{1}{2}, 1$)**: Incorrect — reverses the order of the two conditional quantities ($P(B \\mid A)$ and $P(A \\mid B)$).
* **Option D ($1, \\frac{1}{2}$)**: ✓ **CORRECT** — precisely $P(A \\mid B) = 1$ and $P(B \\mid A) = \\frac{1}{2}$.

---

### 5. Final Answer
The values of $P(A \\mid B)$ and $P(B \\mid A)$ respectively are **$1, \\left(\\dfrac{1}{2}\\right)$**, corresponding to **Option D**.`,
    images: []
  },

  "go:895": {
    concept: "Discrete Mathematics — Combinatorics, Subsets & Sorted Sequence Merging",
    markdown: `### 1. Concept
Let $A$ be a sequence of $n$ distinct elements sorted in strictly ascending order:
$$A = (a_1, a_2, \\dots, a_n), \\quad \\text{with } a_1 < a_2 < \\dots < a_n$$

When two sequences $B$ and $C$ of sizes $p$ and $q$ ($p + q = n$) merge to form $A$:
1. The elements of $B$ and $C$ must together constitute a partition of the elements of $A$:
   $$\\text{Elements}(B) \\cup \\text{Elements}(C) = \\text{Elements}(A), \\quad \\text{Elements}(B) \\cap \\text{Elements}(C) = \\emptyset$$
2. Because both $B$ and $C$ are required to be sorted in ascending order and all elements are distinct, any selection of $p$ elements for $B$ has **exactly one unique valid ascending arrangement**.
3. The remaining $q = n - p$ elements assigned to $C$ also have **exactly one unique valid ascending arrangement**.

---

### 2. Givens & Scope
* $|A| = 8$ distinct integers, sorted in ascending order.
* $|B| = 5$ elements, sorted in ascending order.
* $|C| = 3$ elements, sorted in ascending order.
* Merging $B$ and $C$ produces $A$.
* Target: The number of distinct pairs of sequences $(B, C)$.

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Partitioning Elements into Subsets**
* We must select $5$ elements out of the $8$ distinct elements of $A$ to belong to sequence $B$.
* The number of ways to choose a 5-element subset from an 8-element set is given by the binomial coefficient:
  $$\\binom{8}{5} = \\binom{8}{8 - 5} = \\binom{8}{3}$$

**Step 2: Uniqueness of Order**
* Once the 5 elements for $B$ are selected, there is only $1$ way to sort them into ascending order.
* The remaining $8 - 5 = 3$ elements are automatically and uniquely allocated to $C$.
* There is only $1$ way to sort those 3 elements into ascending order.

**Step 3: Calculating Total Distinct Pairs**
$$\\text{Total Pairs} = \\binom{8}{5} \\times 1 \\times 1 = \\frac{8 \\times 7 \\times 6}{3 \\times 2 \\times 1} = 8 \\times 7 = 56$$

Every choice of 5 elements for $B$ produces a unique pair of sorted sequences $(B, C)$ whose merge yields $A$.

---

### 4. Distractor Analysis
* **Option C ($56$)**: ✓ **CORRECT** — precisely $\\binom{8}{5} = \\binom{8}{3} = 56$.
* **Option D ($256$)**: Incorrect — equals $2^8$, which counts all arbitrary subsets of $A$ without restricting the subset sizes to $|B| = 5$ and $|C| = 3$.

---

### 5. Final Answer
The number of distinct pairs of sequences is **$56$**, corresponding to **Option C**.`,
    images: []
  }
};

export function injectChunkCseMath11() {
  const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  const chunkFile = path.join(ROOT, "data", "solutions", "chunks", "cse", "chunk-cse-math-11.json");
  const chunk = JSON.parse(fs.readFileSync(chunkFile, "utf-8"));
  const acceptedUids = new Set(chunk.questions.filter((question) => ["ACCEPTED", "INTEGRATED"].includes(question.status)).map((question) => question.uid));
  let content = fs.readFileSync(patchesFile, "utf-8");

  const toAdd = [];
  let alreadyPresent = 0;

  for (const [uid, sol] of Object.entries(CHUNK_CSE_MATH_11_SOLUTIONS)) {
    if (!acceptedUids.has(uid)) continue;
    if (content.includes(`"${uid}":`)) {
      alreadyPresent++;
    } else {
      toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
    }
  }

  console.log(`CHUNK-CSE-MATH-11: Already present = ${alreadyPresent}, To inject = ${toAdd.length}`);

  if (toAdd.length > 0) {
    const marker = "export const AUTHENTIC_PATCHES = {";
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) {
      throw new Error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs!");
    }
    const insertPos = markerIdx + marker.length;
    const newContent = content.slice(0, insertPos) + "\n" + toAdd.join("\n\n") + "\n\n" + content.slice(insertPos);
    fs.writeFileSync(patchesFile, newContent, "utf-8");
    console.log(`✅ Injected ${toAdd.length} accepted solutions into patch-authentic-solutions.mjs`);
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-math-11")) {
  injectChunkCseMath11();
}
