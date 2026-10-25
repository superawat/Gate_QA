import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_MATH_09_SOLUTIONS = {
  "go:1171": {
    concept: "Abstract Algebra & Group Theory — Matrix Groups & Invertibility Axioms",
    markdown: `### 1. Concept
A mathematical structure $(H, \\cdot)$ forms a **group** if it satisfies the four fundamental group axioms:
1. **Closure**: For all $A, B \\in H$, $A \\cdot B \\in H$.
2. **Associativity**: Matrix multiplication is universally associative: $(A \\cdot B) \\cdot C = A \\cdot (B \\cdot C)$.
3. **Identity Element**: There exists an element $I \\in H$ such that $A \\cdot I = I \\cdot A = A$ for all $A \\in H$.
4. **Inverse Element**: For every $A \\in H$, there exists $A^{-1} \\in H$ such that $A \\cdot A^{-1} = A^{-1} \\cdot A = I$.

---

### 2. Givens & Parameters
- Set $H$ consists of all $3 \\times 3$ upper triangular matrices of the form:
  $$A = \\begin{pmatrix} a & f & e \\\\ 0 & b & d \\\\ 0 & 0 & c \\end{pmatrix}$$
  where $a, b, c, d, e, f \\in \\mathbb{R}$ and $abc \\neq 0$.
- Operation: Standard matrix multiplication.

---

### 3. Step-by-Step Verification of Group Axioms

**Axiom 1: Closure**
Let $A, B \\in H$ with diagonal elements $(a_1, b_1, c_1)$ and $(a_2, b_2, c_2)$ respectively, where $a_1 b_1 c_1 \\neq 0$ and $a_2 b_2 c_2 \\neq 0$.
The product $AB$ of two upper triangular matrices is strictly upper triangular:
$$AB = \\begin{pmatrix} a_1 a_2 & a_1 f_2 + f_1 b_2 & a_1 e_2 + f_1 d_2 + e_1 c_2 \\\\ 0 & b_1 b_2 & b_1 d_2 + d_1 c_2 \\\\ 0 & 0 & c_1 c_2 \\end{pmatrix}$$
The diagonal elements of $AB$ are $a_1 a_2, b_1 b_2, c_1 c_2$.
The product of their diagonal entries is:
$$(a_1 a_2)(b_1 b_2)(c_1 c_2) = (a_1 b_1 c_1)(a_2 b_2 c_2) \\neq 0$$
Since all entries are real and the diagonal product is non-zero, $AB \\in H$. Thus, $H$ is closed under multiplication.

**Axiom 2: Associativity**
Matrix multiplication is associative for all matrices over $\\mathbb{R}$.

**Axiom 3: Identity Element**
The $3 \\times 3$ identity matrix is:
$$I_3 = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$
Here $a = 1, b = 1, c = 1, d = 0, e = 0, f = 0$.
The diagonal product is $1 \\cdot 1 \\cdot 1 = 1 \\neq 0$.
Thus, $I_3 \\in H$, satisfying $A I_3 = I_3 A = A$.

**Axiom 4: Inverse Element**
The determinant of an upper triangular matrix is the product of its diagonal entries:
$$\\det(A) = abc$$
Because $abc \\neq 0$, $\\det(A) \\neq 0$, meaning every matrix in $H$ is non-singular and invertible.
The inverse of an upper triangular matrix is itself upper triangular, with diagonal entries:
$$\\text{diag}(A^{-1}) = \\left(\\frac{1}{a}, \\frac{1}{b}, \\frac{1}{c}\\right)$$
The product of the diagonal entries of $A^{-1}$ is:
$$\\left(\\frac{1}{a}\\right)\\left(\\frac{1}{b}\\right)\\left(\\frac{1}{c}\\right) = \\frac{1}{abc} \\neq 0$$
All entries of $A^{-1}$ are real, so $A^{-1} \\in H$ and satisfies $A A^{-1} = A^{-1} A = I_3$.

Because all four axioms hold, $H$ is a **group** (specifically, the Borel subgroup of invertible upper triangular matrices in $GL(3, \\mathbb{R})$).

---

### 4. Distractor Analysis
* **Option A (a group)**: ✓ **CORRECT** — satisfies closure, associativity, identity, and inverses.
* **Option B (a monoid but not a group)**: Incorrect — fails to recognize that every matrix with $abc \\neq 0$ is invertible with its inverse remaining in $H$.
* **Option C (a semi group but not a monoid)**: Incorrect — the identity matrix $I_3$ is present in $H$.
* **Option D (neither a group nor a semi group)**: Incorrect — $H$ satisfies all group properties.

---

### 5. Final Answer
Under matrix multiplication, the set $H$ is **a group**, corresponding to **Option A**.`,
    images: []
  },

  "go:3807": {
    concept: "Digital Systems & Fault Modeling — Multiple Stuck-At Fault Counting via Combinatorics",
    markdown: `### 1. Concept
In digital test pattern generation (ATPG) and fault modeling:
- A line has a **stuck-at-0 (SA0)** fault if it is permanently tied to logic 0.
- A line has a **stuck-at-1 (SA1)** fault if it is permanently tied to logic 1.
- A line is **fault-free (normal)** if it operates correctly.
A **multiple stuck-at fault** is a fault condition where **one or more lines** simultaneously suffer from stuck-at faults.

---

### 2. Givens & Parameters
- Total number of lines in the circuit: $N$
- Possible states for any single line:
  1. Fault-free
  2. Stuck-at-0
  3. Stuck-at-1
- Definition of multiple stuck-at fault: At least one line has a stuck-at fault.

---

### 3. Step-by-Step Counting Derivation
1. For each individual line $L_i$ ($i = 1, 2, \\dots, N$), there are exactly **3 independent states**:
   $$\\text{State}(L_i) \\in \\{\\text{Normal}, \\text{SA0}, \\text{SA1}\\}$$
2. By the fundamental counting principle (multiplication rule), the total number of possible fault configurations across all $N$ lines is:
   $$\\underbrace{3 \\times 3 \\times \\dots \\times 3}_{N \\text{ times}} = 3^N$$
3. Among these $3^N$ total configurations, exactly **1 configuration** corresponds to all $N$ lines being simultaneously fault-free (the completely fault-free circuit).
4. Since a multiple fault requires **at least one line** to be faulty (one or more stuck-at faults), we exclude the single fault-free state:
   $$\\text{Total Multiple Faults} = 3^N - 1$$

---

### 4. Distractor Analysis
* **Option A ($3^N$)**: Incorrect — includes the completely fault-free state where zero lines are faulty.
* **Option B ($3^N - 1$)**: ✓ **CORRECT** — total configurations ($3^N$) minus the fault-free configuration ($1$).
* **Option C ($2^N - 1$)**: Incorrect — only considers 2 states per line (e.g. faulty vs non-faulty), ignoring the distinction between SA0 and SA1.
* **Option D ($2$)**: Incorrect — this is the number of single stuck-at faults for a single isolated line ($2 \\times 1$).

---

### 5. Final Answer
The total number of distinct multiple stuck-at faults possible in a circuit with $N$ lines is **$3^N - 1$**, corresponding to **Option B**.`,
    images: []
  },

  "go:1172": {
    concept: "Graph Theory — Planarity, Kuratowski's Theorem & $K_{3,3}$ Subgraph Homeomorphism",
    markdown: `### 1. Concept
A graph $G$ is **planar** if and only if it can be embedded in the plane such that no two edges cross.
By **Kuratowski's Theorem**, a finite graph is planar if and only if it does not contain a subgraph that is homeomorphic to (or a subdivision of) either:
- $K_5$ (the complete graph on 5 vertices)
- $K_{3,3}$ (the complete bipartite utility graph on $3 + 3$ vertices)

---

### 2. Analysis of the Graphs $G_1, G_2, G_3, G_4$

- **Graph $G_1$**:
  - $G_1$ contains a bipartite subgraph with two independent sets of 3 vertices each, with edges connecting every vertex of one set to every vertex of the other set (subdivision of $K_{3,3}$).
  - Because it contains a homeomorphic reduction to $K_{3,3}$, by Kuratowski's theorem, **$G_1$ is NOT planar**. Any attempt to draw $G_1$ in the plane requires at least one edge crossing.

- **Graphs $G_2, G_3, G_4$**:
  - **$G_2$**: Can be drawn without edge crossings by routing the external connecting edges around the perimeter. Planar.
  - **$G_3$**: A planar embedding exists with vertices arranged on outer cycles and chords drawn internally without intersection. Planar.
  - **$G_4$**: Can be redrawn in the plane by moving internal crossing edges to the exterior face without crossing. Planar.

---

### 3. Distractor Analysis
* **Option A ($G_1$)**: ✓ **CORRECT** — contains a $K_{3,3}$ configuration, violating Kuratowski's theorem; strictly non-planar.
* **Option B ($G_2$)**: Incorrect — $G_2$ is a planar graph.
* **Option C ($G_3$)**: Incorrect — $G_3$ is a planar graph.
* **Option D ($G_4$)**: Incorrect — $G_4$ is a planar graph.

---

### 4. Final Answer
The graph that is NOT planar is **$G_1$**, corresponding to **Option A**.`,
    images: []
  },

  "go:1173": {
    concept: "Linear Algebra — Systems of Linear Equations & Rouché-Capelli / Cramer Determinant Criterion",
    markdown: `### 1. Concept
A non-homogeneous system of $n$ linear equations in $n$ variables, represented in matrix form as $A \\mathbf{x} = \\mathbf{b}$:
- Has a **unique solution** if and only if $\\det(A) \\neq 0$ (i.e., $\\operatorname{rank}(A) = \\operatorname{rank}([A \\mid \\mathbf{b}]) = n$).
- Has **infinitely many solutions** if $\\det(A) = 0$ and $\\operatorname{rank}(A) = \\operatorname{rank}([A \\mid \\mathbf{b}]) < n$.
- Has **no solution (inconsistent)** if $\\operatorname{rank}(A) < \\operatorname{rank}([A \\mid \\mathbf{b}])$.
A linear system over $\\mathbb{R}$ can NEVER have a finite number of solutions strictly greater than 1.

---

### 2. Given System of Equations
$$\\begin{aligned}
2x_1 - x_2 + 3x_3 &= 1 \\\\
3x_1 + 2x_2 + 5x_3 &= 2 \\\\
-x_1 + 4x_2 + x_3 &= 3
\\end{aligned}$$

Coefficient matrix $A$:
$$A = \\begin{pmatrix} 2 & -1 & 3 \\\\ 3 & 2 & 5 \\\\ -1 & 4 & 1 \\end{pmatrix}$$

---

### 3. Determinant Computation
Evaluate $\\det(A)$ by expanding along the first row:
$$\\begin{aligned}
\\det(A) &= 2 \\begin{vmatrix} 2 & 5 \\\\ 4 & 1 \\end{vmatrix} - (-1) \\begin{vmatrix} 3 & 5 \\\\ -1 & 1 \\end{vmatrix} + 3 \\begin{vmatrix} 3 & 2 \\\\ -1 & 4 \\end{vmatrix} \\\\[6pt]
&= 2(2 \\cdot 1 - 5 \\cdot 4) + 1(3 \\cdot 1 - 5(-1)) + 3(3 \\cdot 4 - 2(-1)) \\\\[6pt]
&= 2(2 - 20) + 1(3 + 5) + 3(12 + 2) \\\\[6pt]
&= 2(-18) + 1(8) + 3(14) \\\\[6pt]
&= -36 + 8 + 42 \\\\[6pt]
&= 14
\\end{aligned}$$

Since $\\det(A) = 14 \\neq 0$:
- The coefficient matrix $A$ is non-singular with full rank: $\\operatorname{rank}(A) = 3$.
- By Cramer's Rule, the system has a **unique solution**.

---

### 4. Distractor Analysis
* **Option A (no solution)**: Incorrect — would require the augmented matrix rank to exceed the coefficient matrix rank ($\operatorname{rank}(A) < \operatorname{rank}([A \\mid b])$).
* **Option B (a unique solution)**: ✓ **CORRECT** — $\\det(A) = 14 \\neq 0$.
* **Option C (more than one but a finite number of solutions)**: Incorrect — linear systems over $\\mathbb{R}$ have 0, 1, or $\\infty$ solutions; they can never have a finite number $> 1$.
* **Option D (an infinite number of solutions)**: Incorrect — requires $\\det(A) = 0$.

---

### 5. Final Answer
The system of equations has **a unique solution**, corresponding to **Option B**.`,
    images: []
  },

  "go:1174": {
    concept: "Linear Algebra — Eigenvalues of $2 \\times 2$ Matrices via Characteristic Polynomial & Trace/Determinant",
    markdown: `### 1. Concept
For a square matrix $A$, the eigenvalues $\\lambda$ are the roots of the characteristic equation:
$$\\det(A - \\lambda I) = 0$$
For a $2 \\times 2$ matrix $A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}$, the characteristic equation simplifies directly to:
$$\\lambda^2 - \\operatorname{Tr}(A)\\lambda + \\det(A) = 0$$
where:
- $\\operatorname{Tr}(A) = a_{11} + a_{22} = \\lambda_1 + \\lambda_2$ (Sum of eigenvalues)
- $\\det(A) = a_{11} a_{22} - a_{12} a_{21} = \\lambda_1 \\lambda_2$ (Product of eigenvalues)

---

### 2. Givens & Matrix Values
$$A = \\begin{pmatrix} 2 & -1 \\\\ -4 & 5 \\end{pmatrix}$$

---

### 3. Step-by-Step Derivation

**Step 1: Compute Trace and Determinant**
$$\\operatorname{Tr}(A) = 2 + 5 = 7$$
$$\\det(A) = (2)(5) - (-1)(-4) = 10 - 4 = 6$$

**Step 2: Form Characteristic Equation**
$$\\lambda^2 - 7\\lambda + 6 = 0$$

**Step 3: Solve for $\\lambda$**
Factoring the quadratic polynomial:
$$(\\lambda - 1)(\\lambda - 6) = 0$$
$$\\lambda_1 = 1, \\quad \\lambda_2 = 6$$

**Verification:**
- Sum: $1 + 6 = 7 = \\operatorname{Tr}(A)$ ✓
- Product: $1 \\times 6 = 6 = \\det(A)$ ✓

---

### 4. Distractor Analysis
* **Option A ($-1$ and $1$)**: Incorrect — sum $= 0 \\neq 7$, product $= -1 \\neq 6$.
* **Option B ($1$ and $6$)**: ✓ **CORRECT** — matches roots $\\lambda = 1, 6$ with trace 7 and determinant 6.
* **Option C ($2$ and $5$)**: Incorrect — these are the diagonal elements; diagonal elements equal eigenvalues only if off-diagonal entries are zero.
* **Option D ($4$ and $-1$)**: Incorrect — sum $= 3 \\neq 7$.

---

### 5. Final Answer
The eigenvalues of the matrix are **$1$ and $6$**, corresponding to **Option B**.`,
    images: []
  },

  "go:1175": {
    concept: "Discrete Mathematics — Ordinary Generating Functions & Negative Binomial Expansion",
    markdown: `### 1. Concept
The **generating function** $G(x) = \\sum_{i=0}^\\infty g(i) x^i$ encapsulates a discrete sequence $\\langle g(i) \\rangle$.
By the **negative binomial series** expansion for real powers:
$$(1 - x)^{-n} = \\sum_{i=0}^\\infty \\binom{n + i - 1}{i} x^i, \\quad \\text{for } |x| < 1$$

Alternatively, generating functions can be manipulated by term-by-term differentiation of the infinite geometric series:
$$\\frac{1}{1 - x} = \\sum_{k=0}^\\infty x^k$$

---

### 2. Givens & Parameters
- Generating function: $G(x) = \\dfrac{1}{(1 - x)^2}$
- Domain: $|x| < 1$
- Target: Find the coefficient sequence $g(i)$.

---

### 3. Analytical Derivations

#### Method 1: Negative Binomial Expansion
Set $n = 2$ in the formula $(1 - x)^{-n} = \\sum_{i=0}^\\infty \\binom{n + i - 1}{i} x^i$:
$$g(i) = \\binom{2 + i - 1}{i} = \\binom{i + 1}{i}$$
Using the combination identity $\\binom{m}{m - 1} = m$:
$$g(i) = i + 1$$

#### Method 2: Differentiation of Geometric Series
Start with the standard geometric series for $|x| < 1$:
$$\\frac{1}{1 - x} = \\sum_{k=0}^\\infty x^k = 1 + x + x^2 + x^3 + \\dots$$
Differentiating both sides with respect to $x$:
$$\\frac{d}{dx}\\left(\\frac{1}{1 - x}\\right) = \\frac{1}{(1 - x)^2} = \\sum_{k=1}^\\infty k x^{k-1}$$
Shift the index of summation by letting $i = k - 1$ (so $k = i + 1$):
$$\\frac{1}{(1 - x)^2} = \\sum_{i=0}^\\infty (i + 1) x^i$$
Comparing coefficients with $\\sum_{i=0}^\\infty g(i) x^i$:
$$g(i) = \\mathbf{i + 1}$$

Evaluating the first few terms:
- $g(0) = 1$
- $g(1) = 2$
- $g(2) = 3$
- $g(i) = i + 1$

---

### 4. Distractor Analysis
* **Option A ($i$)**: Incorrect — would correspond to the generating function $\\sum_{i=0}^\\infty i x^i = \\frac{x}{(1 - x)^2}$.
* **Option B ($i + 1$)**: ✓ **CORRECT** — exact coefficient of $x^i$ in $(1 - x)^{-2}$.
* **Option C ($2i$)**: Incorrect — off by a factor of 2.
* **Option D ($2^i$)**: Incorrect — corresponds to the geometric series $\\frac{1}{1 - 2x}$.

---

### 5. Final Answer
The value of $g(i)$ is **$i + 1$**, corresponding to **Option B**.`,
    images: []
  },

  "go:1176": {
    concept: "Probability — Bayes' Theorem & Conditional Probability with Partitioned Sampling",
    markdown: `### 1. Concept
**Bayes' Theorem** calculates posterior probabilities given observed evidence:
$$P(B_i \\mid A) = \\frac{P(A \\mid B_i) P(B_i)}{\\sum_{j} P(A \\mid B_j) P(B_j)}$$
where $\\{B_j\\}$ forms a partition of the sample space.

---

### 2. Givens & Parameters
- Box $P$:
  - Red balls: 2
  - Blue balls: 3
  - Total balls: $2 + 3 = 5$
  - Probability of selecting a red ball from Box $P$: $P(R \\mid P) = \\frac{2}{5}$
- Box $Q$:
  - Red balls: 3
  - Blue balls: 1
  - Total balls: $3 + 1 = 4$
  - Probability of selecting a red ball from Box $Q$: $P(R \\mid Q) = \\frac{3}{4}$
- Prior probabilities of choosing each box:
  - $P(P) = \\frac{1}{3}$
  - $P(Q) = \\frac{2}{3}$
- Observed event: The selected ball is red ($R$).
- Target: Find $P(P \\mid R)$.

---

### 3. Step-by-Step Derivation

**Step 1: Compute Joint Probabilities**
$$\\begin{aligned}
P(R \\cap P) &= P(R \\mid P) \\cdot P(P) = \\left(\\frac{2}{5}\\right)\\left(\\frac{1}{3}\\right) = \\frac{2}{15} \\\\[6pt]
P(R \\cap Q) &= P(R \\mid Q) \\cdot P(Q) = \\left(\\frac{3}{4}\\right)\\left(\\frac{2}{3}\\right) = \\frac{6}{12} = \\frac{1}{2}
\\end{aligned}$$

**Step 2: Total Probability of Selecting a Red Ball $P(R)$**
$$P(R) = P(R \\cap P) + P(R \\cap Q) = \\frac{2}{15} + \\frac{1}{2}$$
Finding a common denominator of 30:
$$P(R) = \\frac{4}{30} + \\frac{15}{30} = \\frac{19}{30}$$

**Step 3: Compute Posterior Probability $P(P \\mid R)$**
$$P(P \\mid R) = \\frac{P(R \\cap P)}{P(R)} = \\frac{\\frac{2}{15}}{\\frac{19}{30}} = \\frac{2}{15} \\times \\frac{30}{19} = \\frac{2 \\times 2}{19} = \\mathbf{\\frac{4}{19}}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{4}{19}$)**: ✓ **CORRECT** — rigorous application of Bayes' Theorem.
* **Option B ($\\frac{5}{19}$)**: Incorrect — algebraic slip in numerator.
* **Option C ($\\frac{2}{9}$)**: Incorrect — ignores the conditional distribution of balls inside the boxes.
* **Option D ($\\frac{19}{30}$)**: Incorrect — this is $P(R)$, the total unconditional probability of selecting a red ball.

---

### 5. Final Answer
Given that the selected ball is red, the probability that it came from box $P$ is **$\\dfrac{4}{19}$**, corresponding to **Option A**.`,
    images: []
  },

  "go:1177": {
    concept: "Probability & Discrete Mathematics — Bernoulli Trials & Complementary Event Probability",
    markdown: `### 1. Concept
A binary string of length $n$ generated by independent fair coin tosses is chosen uniformly at random from the set of all $2^n$ possible binary strings:
$$|\\Omega| = 2^n$$
By the **complement rule**, for any event $E$:
$$P(\\text{not } E) = 1 - P(E)$$

---

### 2. Givens & Parameters
- Two bit strings of length $n$, denoted $S_1$ and $S_2$, are generated independently at random.
- Each bit position has independent probability $P(\\text{bit} = 0) = P(\\text{bit} = 1) = \\frac{1}{2}$.
- Total possible strings of length $n$: $2^n$.

---

### 3. Step-by-Step Derivation

**Step 1: Probability that two strings are identical**
Let $S_1$ be any fixed realization of length $n$.
For $S_2$ to be identical to $S_1$, each of the $n$ bits of $S_2$ must match the corresponding bit of $S_1$:
$$P(S_2 = S_1) = \\prod_{k=1}^n P(S_2[k] = S_1[k]) = \\left(\\frac{1}{2}\\right)^n = \\frac{1}{2^n}$$
Equivalently, out of the $2^n \\times 2^n = 2^{2n}$ total equally likely pairs $(S_1, S_2)$, exactly $2^n$ pairs satisfy $S_1 = S_2$:
$$P(\\text{identical}) = \\frac{2^n}{2^{2n}} = \\frac{1}{2^n}$$

**Step 2: Probability that two strings are NOT identical**
Applying the complement rule:
$$P(\\text{not identical}) = 1 - P(\\text{identical}) = \\mathbf{1 - \\frac{1}{2^n}}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{1}{2^n}$)**: Incorrect — this is the probability that the two strings **ARE identical**.
* **Option B ($1 - \\frac{1}{n}$)**: Incorrect — confuses the alphabet size $2^n$ with the string length $n$.
* **Option C ($\\frac{1}{n!}$)**: Incorrect — $n!$ applies to permutations of distinct elements, not independent binary strings.
* **Option D ($1 - \\frac{1}{2^n}$)**: ✓ **CORRECT** — probability of the complement of the identical-string event.

---

### 5. Final Answer
The probability that two such randomly generated strings are not identical is **$1 - \\dfrac{1}{2^n}$**, corresponding to **Option D**.`,
    images: []
  },

  "go:3817": {
    concept: "Graph Theory & Algorithms — Shortest Path on Directed State Graph via Reverse BFS",
    markdown: `### 1. Concept
In an unweighted directed graph, the minimum number of edges in a path from a start vertex $s$ to a target vertex $t$ can be found using **Breadth-First Search (BFS)**.
When transitions allow $j = i + 1$ or $j = 3i$, working **backwards (reverse BFS)** from target $100$ to start $1$ is highly efficient:
- An incoming edge to vertex $j$ comes from:
  1. $j - 1$ (since $j = (j - 1) + 1$)
  2. $j / 3$ (only valid if $j$ is divisible by 3)

---

### 2. Givens & Parameters
- Graph $G = (V, E)$ with $V = \\{1, 2, \\dots, 100\\}$
- Transitions:
  - Add 1: $i \\to i + 1$
  - Multiply by 3: $i \\to 3i$
- Source: $1$, Destination: $100$

---

### 3. Step-by-Step Reverse Path Tracing
Working backwards from $100$ to $1$:

1. **At vertex 100**:
   - $100$ is not divisible by 3, so predecessor must be $100 - 1 = 99$.
   - Edge 7: $99 \\to 100$ (operation: $+1$)
2. **At vertex 99**:
   - $99$ is divisible by 3: $99 / 3 = 33$.
   - Edge 6: $33 \\to 99$ (operation: $\\times 3$)
3. **At vertex 33**:
   - $33$ is divisible by 3: $33 / 3 = 11$.
   - Edge 5: $11 \\to 33$ (operation: $\\times 3$)
4. **At vertex 11**:
   - $11$ is not divisible by 3, so predecessor must be $11 - 1 = 10$.
   - Edge 4: $10 \\to 11$ (operation: $+1$)
5. **At vertex 10**:
   - $10$ is not divisible by 3, so predecessor must be $10 - 1 = 9$.
   - Edge 3: $9 \\to 10$ (operation: $+1$)
6. **At vertex 9**:
   - $9$ is divisible by 3: $9 / 3 = 3$.
   - Edge 2: $3 \\to 9$ (operation: $\\times 3$)
7. **At vertex 3**:
   - $3$ is divisible by 3: $3 / 3 = 1$.
   - Edge 1: $1 \\to 3$ (operation: $\\times 3$)

---

### 4. Forward Path Verification
The complete shortest path is:
$$1 \\xrightarrow{\\times 3} 3 \\xrightarrow{\\times 3} 9 \\xrightarrow{+1} 10 \\xrightarrow{+1} 11 \\xrightarrow{\\times 3} 33 \\xrightarrow{\\times 3} 99 \\xrightarrow{+1} 100$$
Counting the edges:
1. $1 \\to 3$ (1)
2. $3 \\to 9$ (2)
3. $9 \\to 10$ (3)
4. $10 \\to 11$ (4)
5. $11 \\to 33$ (5)
6. $33 \\to 99$ (6)
7. $99 \\to 100$ (7)

Total number of edges = **7**.

**Proof of Minimality:**
Any path of $\\le 6$ steps can reach at most:
- Step 1: max 3
- Step 2: max 9
- Step 3: max 27
- Step 4: max 81
- From 81, $81 \\times 3 = 243 > 100$, so only $+1$ moves are possible, requiring $100 - 81 = 19$ more steps ($4 + 19 = 23$ steps).
- If multiplying earlier, vertex 99 requires $33 \\to 99 \\to 100$ (2 steps from 33), and 33 requires $11 \\to 33$ (3 steps from 11). Since reaching 11 requires at least 4 steps ($1 \\to 3 \\to 9 \\to 10 \\to 11$), total steps must be at least $4 + 3 = 7$.
Therefore, 7 is strictly minimal.

---

### 5. Distractor Analysis
* **Option A (4)**: Incorrect — in 4 steps the maximum reachable vertex without exceeding 100 is 81 ($1 \\to 3 \\to 9 \\to 27 \\to 81$), which cannot reach 100.
* **Option B (7)**: ✓ **CORRECT** — exact minimum path length.
* **Option C (23)**: Incorrect — path via $1 \\to 3 \\to 9 \\to 27 \\to 81 \\to 82 \\to \\dots \\to 100$ uses $4 + 19 = 23$ edges, which is suboptimal.
* **Option D (99)**: Incorrect — naive path using only $+1$ edges ($100 - 1 = 99$).

---

### 6. Final Answer
The minimum number of edges in a path from vertex 1 to vertex 100 is **7**, corresponding to **Option B**.`,
    images: []
  },

  "go:3825": {
    concept: "Software Engineering & Reliability — Software Availability & MTBF / MTTR Calculations",
    markdown: `### 1. Concept
In software reliability and systems engineering:
- **MTBF**: Mean Time Between Failures (total operational time plus repair time between successive failures, or $\\text{MTBF} = \\text{MTTF} + \\text{MTTR}$).
- **MTTR**: Mean Time To Repair (down time required to fix a failure).
- **MTTF**: Mean Time To Failure (uptime between repair and next failure).
- **Availability ($A$)**: The steady-state probability that the system is operating correctly:
  $$A = \\frac{\\text{MTTF}}{\\text{MTBF}} = \\frac{\\text{MTBF} - \\text{MTTR}}{\\text{MTBF}} = 1 - \\frac{\\text{MTTR}}{\\text{MTBF}}$$

---

### 2. Givens & Parameters
**Initial System:**
- Initial Availability: $A_1 = 90\\% = 0.90$
- Initial MTBF: $\\text{MTBF}_1 = 200\\text{ days}$

**Enhanced System:**
- Target Availability: $A_2 = 95\\% = 0.95$
- Increase in MTTR: $\\Delta\\text{MTTR} = 5\\text{ days}$
- $\\text{MTTR}_2 = \\text{MTTR}_1 + 5$
- Target: Find $\\text{MTBF}_2$ of the enhanced software.

---

### 3. Step-by-Step Derivation

**Step 1: Compute Initial MTTR ($\\text{MTTR}_1$)**
Using the availability relationship:
$$A_1 = 1 - \\frac{\\text{MTTR}_1}{\\text{MTBF}_1}$$
$$0.90 = 1 - \\frac{\\text{MTTR}_1}{200}$$
$$\\frac{\\text{MTTR}_1}{200} = 1 - 0.90 = 0.10$$
$$\\text{MTTR}_1 = 0.10 \\times 200 = \\mathbf{20\\text{ days}}$$

**Step 2: Compute Enhanced MTTR ($\\text{MTTR}_2$)**
$$\\text{MTTR}_2 = \\text{MTTR}_1 + 5 = 20 + 5 = \\mathbf{25\\text{ days}}$$

**Step 3: Compute Enhanced MTBF ($\\text{MTBF}_2$)**
Using the enhanced availability $A_2 = 0.95$:
$$A_2 = 1 - \\frac{\\text{MTTR}_2}{\\text{MTBF}_2}$$
$$0.95 = 1 - \\frac{25}{\\text{MTBF}_2}$$
$$\\frac{25}{\\text{MTBF}_2} = 1 - 0.95 = 0.05$$
$$\\text{MTBF}_2 = \\frac{25}{0.05} = \\frac{2500}{5} = \\mathbf{500\\text{ days}}$$

---

### 4. Distractor Analysis
* **Option A (205 days)**: Incorrect — simply adds the 5-day repair increase to the original MTBF ($200 + 5$).
* **Option B (300 days)**: Incorrect — result of arithmetic miscalculation of MTTR ratio.
* **Option C (500 days)**: ✓ **CORRECT** — accurately derived with $\\text{MTTR}_2 = 25$ days and $A_2 = 0.95$.
* **Option D (700 days)**: Incorrect — overestimates the necessary MTBF.

---

### 5. Final Answer
The MTBF of the enhanced software is **500 days**, corresponding to **Option C**.`,
    images: []
  },

  "go:3826": {
    concept: "Software Engineering — Basis Path Testing & McCabe's Cyclomatic Complexity",
    markdown: `### 1. Concept
**McCabe's Cyclomatic Complexity** $V(G)$ defines the number of linearly independent basis execution paths through a program's Control Flow Graph (CFG).
For a program with a single entry and single exit point (connected component $P = 1$), cyclomatic complexity can be computed using any of the following equivalent formulas:
1. **Predicate Node Formula**:
   $$V(G) = P_n + 1$$
   where $P_n$ is the number of predicate (decision / binary branching) nodes.
2. **Region Formula**:
   $$V(G) = R$$
   where $R$ is the number of enclosed planar regions plus the exterior infinite region.
3. **Graph Theoretic Formula**:
   $$V(G) = E - N + 2$$
   where $E$ is the number of directed edges and $N$ is the number of nodes in the flow graph.

---

### 2. Flowchart Structure Analysis
From the provided flowchart diagram:
1. Start/initialization blocks:
   - Node 1: $S := 0$
   - Node 2: $i := 1$
2. **Decision Node 1 (Loop Condition)**:
   - Condition diamond: $i > k$
   - Has two outgoing edges:
     - Branch True: Exits the loop and routes directly to the terminal node ($\text{Print, } S$).
     - Branch False: Proceeds into the loop body to the next decision diamond.
3. **Decision Node 2 (Conditional Branch inside Loop)**:
   - Condition diamond: $i \\le 2$
   - Has two outgoing edges:
     - Branch True (left): Executes $\\text{Read, } f \\to S := S + f$.
     - Branch False (right): Executes $S := S + i$.
4. Merge & Increment:
   - Both branches merge at node $i := i + 1$.
   - A backward loop edge routes from $i := i + 1$ back to the loop header before $i > k$.
5. Exit block:
   - Terminal node: $\\text{Print, } S$.

---

### 3. Step-by-Step Cyclomatic Complexity Evaluation

**Method 1: Predicate Node Formula**
The decision points (diamonds with two outgoing flow paths) are:
1. $i > k$
2. $i \\le 2$
Total predicate nodes $P_n = 2$.
$$V(G) = P_n + 1 = 2 + 1 = \\mathbf{3}$$

**Method 2: Region Formula**
- **Region 1**: The internal planar area bounded by the two conditional branches between $i \\le 2$ and the merge at $i := i + 1$.
- **Region 2**: The loop back area bounded by the path from $i > k$ through $i := i + 1$ and the backward edge back to the loop test.
- **Region 3**: The unbounded exterior region.
Total regions $R = 3 \\implies V(G) = 3$.

---

### 4. Distractor Analysis
* **Option A (5)**: Incorrect — counts total statement blocks instead of independent paths.
* **Option B (4)**: Incorrect — assumes 3 decision nodes instead of 2.
* **Option C (3)**: ✓ **CORRECT** — $V(G) = P_n + 1 = 2 + 1 = 3$.
* **Option D (2)**: Incorrect — counts only 1 decision node.

---

### 5. Final Answer
The cyclomatic complexity for basis path testing of this program is **3**, corresponding to **Option C**.`,
    images: ["/question-images/it_go_3826_0.jpg"]
  },

  "go:3828": {
    concept: "Software Engineering — Data Flow Diagram (DFD) Mapping & Transaction-Centered Architectural Design",
    markdown: `### 1. Concept
In Structured Design (Pressman, Software Engineering):
A **Transaction Flow** occurs in a Data Flow Diagram (DFD) when a single data item (a transaction) triggers one of several alternative action paths.
The DFD consists of:
1. An incoming reception path that acquires and formats the transaction.
2. A **transaction center** that evaluates the transaction and determines its action type.
3. Multiple **action paths** emanating from the transaction center, where only one path is activated per transaction.

To map transaction flow into a **Structure Chart (Software Architecture)**:
- A dedicated top-level **transaction control module ($T_c$)** is created to coordinate the entire transaction processing cycle.
- The control module $T_c$ first invokes the input reception module to obtain the transaction.
- Then $T_c$ invokes the transaction center module ($p_2$), passing the transaction data.
- The transaction center $p_2$ evaluates the transaction type and conditionally invokes the appropriate action processing module ($p_3, p_4,$ or $p_5$).

---

### 2. Analysis of the Given DFD Segment
- $p_1$: Incoming data process (reception module).
- $p_2$: Designated transaction center receiving data from $p_1$.
- $p_3, p_4, p_5$: Alternative action processes branching out from transaction center $p_2$.

---

### 3. Step-by-Step Architectural Evaluation
1. **Option A ($p_1$ invokes $p_2$, $p_2$ invokes $p_3, p_4,$ or $p_5$)**:
   - In structured design, an input-gathering module ($p_1$) should not control or invoke the transaction center; this violates top-down modular hierarchy and control abstraction.
2. **Option B ($p_2$ invokes $p_1$, and then invokes $p_3, p_4,$ or $p_5$)**:
   - Making $p_2$ the overall root controller tightly couples transaction reception and dispatching into a single module, violating separation of concerns.
3. **Option C (Module $T_c$ controls transaction flow: $T_c$ first invokes $p_1$, then invokes $p_2$, and $p_2$ invokes $p_3, p_4,$ or $p_5$)**:
   - ✓ **CORRECT ARCHITECTURE**: Defining a dedicated transaction controller module $T_c$ at the top level cleanly separates transaction coordination from processing. $T_c$ invokes $p_1$ to acquire the transaction, passes it to the transaction center $p_2$, and $p_2$ conditionally routes execution to the selected action module ($p_3, p_4,$ or $p_5$).
4. **Option D ($T_c$ invokes $p_2$, $p_2$ invokes $p_1$)**:
   - Incorrect invocation order — transaction data must be received from $p_1$ before $p_2$ can analyze and dispatch it.

---

### 4. Distractor Analysis
* **Option A**: Incorrect — lacks top-level control module; inverts control hierarchy between $p_1$ and $p_2$.
* **Option B**: Incorrect — merges reception control into transaction dispatcher.
* **Option C**: ✓ **CORRECT** — canonical structured design architecture for transaction-centered DFD mapping.
* **Option D**: Incorrect — $p_2$ cannot process before $p_1$ has executed.

---

### 5. Final Answer
The most appropriate architecture is **Option C (A new module $T_c$ is defined to control the transaction flow. This module $T_c$ first invokes $p_1$ and then invokes $p_2$. $p_2$ in turn invokes $p_3$, or $p_4$, or $p_5$)**.`,
    images: ["/question-images/it_go_3828_0.jpg"]
  }
};

export function injectChunkCseMath09() {
  const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let content = fs.readFileSync(patchesFile, "utf-8");

  const toAdd = [];
  let alreadyPresent = 0;

  for (const [uid, sol] of Object.entries(CHUNK_CSE_MATH_09_SOLUTIONS)) {
    if (content.includes(`"${uid}":`)) {
      alreadyPresent++;
    } else {
      toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
    }
  }

  console.log(`CHUNK-CSE-MATH-09: Already present = ${alreadyPresent}, To inject = ${toAdd.length}`);

  if (toAdd.length > 0) {
    const marker = "export const AUTHENTIC_PATCHES = {";
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) {
      throw new Error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs!");
    }
    const insertPos = markerIdx + marker.length;
    const newContent = content.slice(0, insertPos) + "\n" + toAdd.join("\n\n") + "\n\n" + content.slice(insertPos);
    fs.writeFileSync(patchesFile, newContent, "utf-8");
    console.log(`✅ Injected ${toAdd.length} verified solutions into patch-authentic-solutions.mjs`);
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-math-09")) {
  injectChunkCseMath09();
}
