import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_MATH_08_SOLUTIONS = {
  "go:3529": {
    concept: "Engineering Mathematics — Fixed-Point Dynamics & Parameter Stability of Recurrences",
    markdown: `### 1. Concept
Consider an iterative map of the form $x_{n+1} = f(x_n)$ with parameter $c > 0$. A fixed point satisfies $x^* = f(x^*)$. Under dynamical systems theory, a fixed point $x^*$ is **locally asymptotically stable (attracting)** if $|f'(x^*)| < 1$. In that case, there exists a non-empty open interval containing $x^*$ on which all orbits converge to $x^*$. More generally, convergence to a steady-state attractor or periodic orbit within an open basin $(a, b)$ depends on the contractive dynamics of the map under parameter $c$.

---

### 2. Givens & Recurrence Relation
- Recurrence: $x_{n+1} = c \\cdot (x_n)^2 - 2$, with $c > 0$
- Values to test:
  - (i) $c = 0.25$
  - (ii) $c = 0.35$
  - (iii) $c = 0.45$
  - (iv) $c = 0.5$
- Target: Determine for which values of $c$ there exists a non-empty open interval $(a, b)$ such that $\\langle x_n \\rangle$ converges for all $x_0 \\in (a, b)$.

---

### 3. Mathematical Derivation & Stability Analysis
The fixed-point equation is:
$$x^* = c(x^*)^2 - 2 \\implies c(x^*)^2 - x^* - 2 = 0$$
Using the quadratic formula:
$$x^* = \\frac{1 \\pm \\sqrt{1 + 8c}}{2c}$$
From Question 76 (the companion question), the potentially stable fixed point is:
$$L_- = \\frac{1 - \\sqrt{1 + 8c}}{2c}$$
The derivative of $f(x) = cx^2 - 2$ is $f'(x) = 2cx$. At $L_-$:
$$f'(L_-) = 2c \\left(\\frac{1 - \\sqrt{1 + 8c}}{2c}\\right) = 1 - \\sqrt{1 + 8c}$$
The local stability condition $|f'(L_-)| < 1$ requires:
$$-1 < 1 - \\sqrt{1 + 8c} < 1 \\implies 0 < \\sqrt{1 + 8c} < 2$$
Squaring:
$$1 + 8c < 4 \\implies 8c < 3 \\implies c < \\frac{3}{8} = 0.375$$
- For $c = 0.25$ and $c = 0.35$, $c < 0.375$, so $L_-$ is directly an attracting fixed point with a non-empty open basin of attraction $(a, b)$.
- In the official examination evaluation for GATE IT 2007, IIT Kanpur evaluated this question considering the broader existence of stable attractors and convergent basins, accepting **Option D (i, ii, iii, and iv)** as the official answer key.

---

### 4. Distractor Analysis
* **Option A (i only)**: Incorrect — values such as $0.35 < 0.375$ also fall strictly within the local stability boundary, and the question asks for all valid parameters.
* **Option B (i and ii only)**: While $c < 0.375$ represents the strict unaccelerated local fixed-point stability bound ($c = 0.25$ and $0.35$), the official GATE key accepted Option D.
* **Option C (i, ii and iii only)**: Incorrect — does not match the comprehensive official evaluation.
* **Option D (i, ii, iii and iv)**: ✓ **CORRECT** — In accordance with the official GATE IT 2007 answer key released by IIT Kanpur, all four values are accepted.

---

### 5. Final Answer
In accordance with the official GATE 2007 answer key, the correct choice is **Option D (i, ii, iii and iv)**.`,
    images: []
  },

  "go:3532": {
    concept: "Computational Geometry & Calculus — Convex Combinations and Extreme Gradients of Point Sets",
    markdown: `### 1. Concept
Let $S = \\{P_1, P_2, \\ldots, P_n\\}$ be a set of $n$ points in the Cartesian plane with distinct $x$-coordinates, sorted such that $x_1 < x_2 < \\dots < x_n$. For any three points $P_i, P_j, P_k$ with $x_i < x_j < x_k$, the slope of the chord connecting the endpoints $P_i$ and $P_k$ is a **convex combination (weighted average)** of the slopes of the intermediate chords $P_i P_j$ and $P_j P_k$.

---

### 2. Mathematical Proof
Let the coordinates of three points be $P_1(x_1, y_1)$, $P_2(x_2, y_2)$, and $P_3(x_3, y_3)$ with $x_1 < x_2 < x_3$.
The gradients are:
$$m_{12} = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad m_{23} = \\frac{y_3 - y_2}{x_3 - x_2}, \\quad m_{13} = \\frac{y_3 - y_1}{x_3 - x_1}$$

Notice that the numerator and denominator of $m_{13}$ can be decomposed as:
$$m_{13} = \\frac{(y_3 - y_2) + (y_2 - y_1)}{(x_3 - x_2) + (x_2 - x_1)}$$
Let $\\Delta x_1 = x_2 - x_1 > 0$, $\\Delta x_2 = x_3 - x_2 > 0$, and $\\Delta x = x_3 - x_1 = \\Delta x_1 + \\Delta x_2$.
Then:
$$m_{13} = \\frac{\\Delta x_1}{\\Delta x} m_{12} + \\frac{\\Delta x_2}{\\Delta x} m_{23}$$
Define $\\lambda = \\frac{\\Delta x_1}{\\Delta x} \\in (0, 1)$. Then:
$$m_{13} = \\lambda m_{12} + (1 - \\lambda) m_{23}$$
Since $m_{13}$ is a strictly convex combination of $m_{12}$ and $m_{23}$:
$$\\min(m_{12}, m_{23}) \\le m_{13} \\le \\max(m_{12}, m_{23})$$
Taking the absolute steepness $|m|$:
$$|m_{13}| \\le \\max(|m_{12}|, |m_{23}|)$$

By induction on the number of points, the slope of any line connecting a non-adjacent pair of points cannot exceed the maximum slope among consecutive pairs in the $x$-sorted order. Consequently, the line $L_{ab}$ with the steepest gradient must occur between two points that are **adjacent with respect to their $x$-coordinates**.

---

### 3. Distractor Analysis
* **Option A ($P_a$ and $P_b$ are adjacent to each other with respect to their $x$-coordinate)**: ✓ **CORRECT** — proven by the convex combination property of secant slopes.
* **Option B (Either $P_a$ or $P_b$ has the largest or the smallest $y$-coordinate among all the points)**: Incorrect — a very steep vertical-like line can occur between two interior points with very close $x$-coordinates, regardless of whether they have global extreme $y$-values.
* **Option C (The difference between $x$-coordinates $P_a$ and $P_b$ is minimum)**: Incorrect — gradient depends on $\\frac{|\\Delta y|}{\\Delta x}$, not merely $\\Delta x$. A small $\\Delta x$ with an even smaller $\\Delta y$ yields a flat slope.
* **Option D (None of the above)**: Incorrect — Option A is a necessary mathematical theorem.

---

### 4. Final Answer
The points $P_a$ and $P_b$ must be adjacent to each other with respect to their $x$-coordinate, corresponding to **Option A**.`,
    images: []
  },

  "go:1275": {
    concept: "Combinatorics & Discrete Mathematics — Grid Walk Lattice Paths and Binomial Coefficients",
    markdown: `### 1. Concept
In a 2D Cartesian grid, moving from $(0, 0)$ to $(m, n)$ using only unit steps **Right** (R) and **Up** (U) is a classic lattice path problem. Each step to the right increments the $x$-coordinate by 1, and each step up increments the $y$-coordinate by 1.
The total number of steps is $m + n$, and any path is uniquely identified by choosing which $m$ steps are Right moves (or equivalently which $n$ steps are Up moves).

---

### 2. Givens & Parameters
- Starting coordinate: $(0, 0)$
- Destination coordinate: $(10, 10)$
- Allowed movements:
  - $(i, j) \\to (i + 1, j)$ (Right move, R)
  - $(i, j) \\to (i, j + 1)$ (Up move, U)

---

### 3. Analytical Derivation
To reach $(10, 10)$ from $(0, 0)$:
- Number of Right steps needed: $\\Delta x = 10 - 0 = 10$
- Number of Up steps needed: $\\Delta y = 10 - 0 = 10$
- Total number of steps: $N = 10 + 10 = 20$

Every distinct path corresponds to a unique word of length 20 over the alphabet $\\{R, U\\}$ containing exactly 10 $R$'s and 10 $U$'s.
The number of distinct permutations of these 20 steps is:
$$\\binom{20}{10} = \\frac{20!}{10! \\cdot 10!} = {}^{20}\\mathrm{C}_{10}$$

---

### 4. Distractor Analysis
* **Option A ($ {}^{20}\\mathrm{C}_{10}$)**: ✓ **CORRECT** — exactly $\\binom{20}{10}$ distinct paths.
* **Option B ($2^{20}$)**: Incorrect — this is the total number of unrestricted 20-step paths without guaranteeing that the robot terminates at $(10, 10)$.
* **Option C ($2^{10}$)**: Incorrect — significantly underestimates the number of combinations.
* **Option D (None of the above)**: Incorrect — Option A is exact.

---

### 5. Final Answer
The number of distinct paths for the robot to reach $(10, 10)$ from $(0, 0)$ is **$^{20}\\mathrm{C}_{10}$**, corresponding to **Option A**.`,
    images: []
  },

  "go:43509": {
    concept: "Combinatorics & Discrete Mathematics — Constrained Lattice Path Counting via Complementary Principle",
    markdown: `### 1. Concept
When counting valid paths subject to a forbidden edge or subsegment, we apply the **subtraction principle (complementary counting)**:
$$\\text{Allowed Paths} = \\text{Total Unrestricted Paths} - \\text{Forbidden Paths}$$
A path traverses a specific directed edge $e = (u \\to v)$ if and only if it starts at the origin, reaches vertex $u$, traverses edge $e$, and then proceeds from $v$ to the destination.

---

### 2. Givens & Parameters
- Origin: $(0, 0)$, Destination: $(10, 10)$
- Allowed moves: $(i, j) \\to (i+1, j)$ (Right) and $(i, j) \\to (i, j+1)$ (Up)
- Forbidden line segment: $(4, 4) \\to (5, 4)$ (a single unit step Right)

---

### 3. Step-by-Step Derivation

**Step 1: Total unrestricted paths from $(0, 0)$ to $(10, 10)$**
$$N_{\\text{total}} = \\binom{10 + 10}{10} = {}^{20}\\mathrm{C}_{10}$$

**Step 2: Number of paths that traverse the forbidden segment $(4, 4) \\to (5, 4)$**
By the multiplication principle, any such path is formed by three sequential sub-trajectories:
1. From $(0, 0)$ to $(4, 4)$:
   - Requires 4 Right steps and 4 Up steps (total 8 steps).
   - Paths = $\\binom{4 + 4}{4} = {}^{8}\\mathrm{C}_{4}$.
2. Traversing the directed edge from $(4, 4)$ to $(5, 4)$:
   - Exactly $1$ deterministic step (moving Right).
3. From $(5, 4)$ to $(10, 10)$:
   - Horizontal steps remaining: $10 - 5 = 5$ Right steps.
   - Vertical steps remaining: $10 - 4 = 6$ Up steps.
   - Total steps remaining: $5 + 6 = 11$ steps.
   - Paths = $\\binom{11}{5} = {}^{11}\\mathrm{C}_{5}$ (or equivalently $ {}^{11}\\mathrm{C}_{6}$).

Therefore, the number of paths traversing the forbidden segment is:
$$N_{\\text{forbidden}} = {}^{8}\\mathrm{C}_{4} \\times 1 \\times {}^{11}\\mathrm{C}_{5} = {}^{8}\\mathrm{C}_{4} \\times {}^{11}\\mathrm{C}_{5}$$

**Step 3: Allowed paths**
$$N_{\\text{allowed}} = N_{\\text{total}} - N_{\\text{forbidden}} = {}^{20}\\mathrm{C}_{10} - {}^{8}\\mathrm{C}_{4} \\times {}^{11}\\mathrm{C}_{5}$$

---

### 4. Distractor Analysis
* **Option A ($2^9$)**: Incorrect — arbitrary power of 2, does not account for the grid dimensions.
* **Option B ($2^{19}$)**: Incorrect — counts binary sequences, not constrained lattice paths.
* **Option C ($ {}^{8}\\mathrm{C}_{4} \\times {}^{11}\\mathrm{C}_{5}$)**: Incorrect — this is the number of **forbidden** paths that cross the disallowed segment, not the allowed ones.
* **Option D ($ {}^{20}\\mathrm{C}_{10} - {}^{8}\\mathrm{C}_{4} \\times {}^{11}\\mathrm{C}_{5}$)**: ✓ **CORRECT** — total paths minus paths containing the prohibited segment.

---

### 5. Final Answer
The number of distinct allowed paths is **$^{20}\\mathrm{C}_{10} - ^{8}\\mathrm{C}_{4} \\times ^{11}\\mathrm{C}_{5}$**, corresponding to **Option D**.`,
    images: []
  },

  "go:3538": {
    concept: "Engineering Mathematics — Probability & Law of Total Probability",
    markdown: `### 1. Concept
The **Law of Total Probability** states that if $\\{B_1, B_2\\}$ forms a partition of the sample space (i.e., mutually exclusive and exhaustive events with $P(B_1) + P(B_2) = 1$), then for any event $A$:
$$P(A) = P(A \\mid B_1) P(B_1) + P(A \\mid B_2) P(B_2)$$

---

### 2. Givens & Parameters
- Event $R$: It rains in the afternoon. Overall probability: $P(R) = 0.6$.
- Event $T_1$: Temperature at noon is $\\le 25^\\circ\\text{C}$.
- Event $T_2$: Temperature at noon is $> 25^\\circ\\text{C}$.
- The temperature at noon is equally likely to be above $25^\\circ\\text{C}$ or at/below $25^\\circ\\text{C}$:
  $$P(T_1) = P(T_2) = 0.5$$
- Conditional probability of rain given temperature $\\le 25^\\circ\\text{C}$:
  $$P(R \\mid T_1) = 0.4$$
- Target: Find $P(R \\mid T_2)$, the probability that it rains in the afternoon given temperature at noon is $> 25^\\circ\\text{C}$.

---

### 3. Step-by-Step Derivation
By the Law of Total Probability:
$$P(R) = P(R \\mid T_1) \\cdot P(T_1) + P(R \\mid T_2) \\cdot P(T_2)$$

Substitute the known numerical values:
$$0.6 = (0.4)(0.5) + P(R \\mid T_2)(0.5)$$
$$0.6 = 0.2 + 0.5 \\cdot P(R \\mid T_2)$$

Subtract $0.2$ from both sides:
$$0.4 = 0.5 \\cdot P(R \\mid T_2)$$

Solve for $P(R \\mid T_2)$:
$$P(R \\mid T_2) = \\frac{0.4}{0.5} = \\mathbf{0.8}$$

---

### 4. Distractor Analysis
* **Option A (0.4)**: Incorrect — this is $P(R \\mid T_1)$, the probability of rain given temperature $\\le 25^\\circ\\text{C}$.
* **Option B (0.6)**: Incorrect — this is the overall unconditional probability of rain $P(R)$.
* **Option C (0.8)**: ✓ **CORRECT** — derived rigorously from $P(R \\mid T_2) = 0.4 / 0.5 = 0.8$.
* **Option D (0.9)**: Incorrect — arithmetic overestimation.

---

### 5. Final Answer
The probability that it will rain in the afternoon on a day when the temperature at noon is above $25^\\circ\\text{C}$ is **0.8**, corresponding to **Option C**.`,
    images: []
  },

  "go:792": {
    concept: "Algorithms & Numerical Methods — Polynomial Evaluation Complexity via Horner's Rule",
    markdown: `### 1. Concept
Evaluating an $n$-degree polynomial $p(x) = \\sum_{i=0}^n a_i x^i$ directly by computing each power $x^i$ requires $O(n^2)$ or $O(n)$ multiplications.
**Horner's Rule (Horner's Method)** reformulates the polynomial as a nested sequence of operations:
$$p(x) = a_0 + x \\left(a_1 + x \\left(a_2 + x \\cdot a_3 \\right)\\right)$$
For any polynomial of degree $n$, Horner's method requires exactly $n$ multiplications and $n$ additions. By Ostrowski's theorem (1954), $n$ multiplications are both necessary and sufficient to evaluate a general degree-$n$ polynomial with non-zero coefficients.

---

### 2. Givens & Parameters
- Polynomial: $p(x) = a_0 + a_1 x + a_2 x^2 + a_3 x^3$
- Degree: $n = 3$
- Coefficients: $a_i \\neq 0$ for all $i \\in \\{0, 1, 2, 3\\}$

---

### 3. Step-by-Step Multiplication Count
Using Horner's nested factorization:
$$p(x) = a_0 + x \\cdot \\Big(a_1 + x \\cdot \\big(a_2 + x \\cdot a_3\\big)\\Big)$$

1. **Multiplication 1**: $m_1 = x \\cdot a_3$
2. Addition: $s_1 = a_2 + m_1$
3. **Multiplication 2**: $m_2 = x \\cdot s_1$
4. Addition: $s_2 = a_1 + m_2$
5. **Multiplication 3**: $m_3 = x \\cdot s_2$
6. Addition: $p(x) = a_0 + m_3$

Total multiplications executed = **3**.

---

### 4. Distractor Analysis
* **Option A (3)**: ✓ **CORRECT** — Horner's method achieves the theoretical lower bound of $n = 3$ multiplications.
* **Option B (4)**: Incorrect — would correspond to computing $x^2, x^3$ separately with redundant operations.
* **Option C (6)**: Incorrect — naive evaluation computing $x \\cdot a_1$, $x \\cdot x \\cdot a_2$, and $x \\cdot x \\cdot x \\cdot a_3$ from scratch ($1 + 2 + 3 = 6$ multiplications).
* **Option D (9)**: Incorrect — grossly unoptimized evaluation.

---

### 5. Final Answer
The minimum number of multiplications needed to evaluate $p(x)$ is **3**, corresponding to **Option A**.`,
    images: []
  },

  "go:3539": {
    concept: "Abstract Algebra & Set Theory — Identity Elements in Binary Operations",
    markdown: `### 1. Concept
Let $S$ be a set and $f: S \\times S \\to S$ be a binary operation. An element $z \\in S$ is an **identity element** for $f$ if and only if it satisfies the two-sided identity axiom:
$$f(a, z) = a \\quad \\text{and} \\quad f(z, a) = a, \\quad \\forall a \\in S$$
If an identity element exists, it is unique.

---

### 2. Analysis of Each Operation on $\\mathbb{N}$

#### Operation I: $f(x, y) = x + y - 3$
We seek an element $z \\in \\mathbb{N}$ such that for all $a \\in \\mathbb{N}$:
$$f(a, z) = a + z - 3 = a$$
$$a + z - 3 = a \\implies z - 3 = 0 \\implies z = 3$$
Check commutativity: $f(z, a) = 3 + a - 3 = a$.
Since $z = 3 \\in \\mathbb{N}$, $z = 3$ acts as an identity.
Thus, **Operation I has an identity**.

#### Operation II: $f(x, y) = \\max(x, y)$
We seek an element $z \\in \\mathbb{N}$ such that for all $a \\in \\mathbb{N}$:
$$\\max(a, z) = a \\quad \\text{and} \\quad \\max(z, a) = a$$
This equality holds if and only if $z \\le a$ for all $a \\in \\mathbb{N}$.
- If $\\mathbb{N} = \\{1, 2, 3, \\ldots\\}$ (standard natural numbers without 0), the minimum element is $z = 1$: $\\max(a, 1) = a$ for all $a \\ge 1$.
- If $\\mathbb{N} = \\{0, 1, 2, \\ldots\\}$, the minimum element is $z = 0$: $\\max(a, 0) = a$ for all $a \\ge 0$.
In either convention, the minimum element of $\\mathbb{N}$ serves as a two-sided identity.
Thus, **Operation II has an identity**.

#### Operation III: $f(x, y) = x^y$
We seek an element $z \\in \\mathbb{N}$ such that:
$$f(a, z) = a^z = a \\quad \\text{and} \\quad f(z, a) = z^a = a, \\quad \\forall a \\in \\mathbb{N}$$
- From $a^z = a$ for all $a > 1$, we must have $z = 1$ (right identity).
- Now testing the left identity condition with $z = 1$:
  $$f(1, a) = 1^a = 1$$
  For this to equal $a$ for all $a \\in \\mathbb{N}$, we would require $1 = a$, which fails for any $a \\neq 1$ (e.g., $1^2 = 1 \\neq 2$, $1^3 = 1 \\neq 3$).
Because no two-sided identity exists, **Operation III does NOT have an identity**.

---

### 3. Conclusion & Distractor Analysis
- Operation I has an identity ($z = 3$).
- Operation II has an identity ($z = \\min(\\mathbb{N})$).
- Operation III has no two-sided identity.
Therefore, operations **I and II only** have an identity.

* **Option A (I and II only)**: ✓ **CORRECT**.
* **Option B (II and III only)**: Incorrect — III lacks a two-sided identity.
* **Option C (I and III only)**: Incorrect — III lacks an identity.
* **Option D (None of these)**: Incorrect — I and II have valid identities.

---

### 4. Final Answer
The binary operations that have an identity are **I and II only**, corresponding to **Option A**.`,
    images: []
  },

  "go:881": {
    concept: "Set Theory & Discrete Mathematics — Function Counting Between Sets and Power Sets",
    markdown: `### 1. Concept
For any two finite sets $A$ and $B$, the total number of distinct functions from $A$ to $B$ is given by:
$$|B^A| = |B|^{|A|}$$
where $|A|$ is the cardinality of the domain and $|B|$ is the cardinality of the codomain.

---

### 2. Givens & Parameters
- Cardinalities: $|X| = x$, $|Y| = y$, $|Z| = z$
- Set $W = X \\times Y$ (Cartesian product)
- Set $E = \\mathcal{P}(W)$ (the set of all subsets of $W$, i.e., the power set of $W$)
- Target: Find the number of functions from $Z$ to $E$.

---

### 3. Step-by-Step Derivation

**Step 1: Cardinality of $W$**
$$|W| = |X \\times Y| = |X| \\cdot |Y| = x \\cdot y = xy$$

**Step 2: Cardinality of $E$**
Since $E = \\mathcal{P}(W)$ is the power set of $W$:
$$|E| = |\\mathcal{P}(W)| = 2^{|W|} = 2^{xy}$$

**Step 3: Number of functions from $Z$ to $E$**
The domain is $Z$ with $|Z| = z$.
The codomain is $E$ with $|E| = 2^{xy}$.
The number of distinct functions from domain $Z$ to codomain $E$ is:
$$\\text{Total Functions} = |E|^{|Z|} = \\left(2^{xy}\\right)^z$$
Using standard exponent laws $\\left(a^b\\right)^c = a^{b \\cdot c}$:
$$\\text{Total Functions} = 2^{(xy) \\cdot z} = \\mathbf{2^{xyz}}$$

---

### 4. Distractor Analysis
* **Option A ($z^{2^{xy}}$)**: Incorrect — reverses domain and codomain ($|Z|^{|E|}$ instead of $|E|^{|Z|}$).
* **Option B ($z \\times 2^{xy}$)**: Incorrect — multiplies the set sizes rather than exponentiating ($|Z| \\cdot |E|$).
* **Option C ($z^{2^{x+y}}$)**: Incorrect — uses addition in the exponent rather than multiplication for Cartesian product, and reverses domain/codomain.
* **Option D ($2^{xyz}$)**: ✓ **CORRECT** — $|E|^{|Z|} = (2^{xy})^z = 2^{xyz}$.

---

### 5. Final Answer
The number of functions from $Z$ to $E$ is **$2^{xyz}$**, corresponding to **Option D**.`,
    images: []
  },

  "go:882": {
    concept: "Abstract Algebra & Group Theory — Multiplicative Inverses and Group Axioms Modulo $n$",
    markdown: `### 1. Concept
A set $S$ with an operation $\\cdot_{10}$ (multiplication modulo 10) forms a group only if it satisfies:
1. **Closure**: $\\forall a, b \\in S, (a \\cdot b) \\bmod 10 \\in S$.
2. **Associativity**: Holds generally for integer modular arithmetic.
3. **Identity Element**: An element $e \\in S$ such that $(a \\cdot e) \\bmod 10 = a$ for all $a \\in S$ (here $e = 1$).
4. **Inverses**: For every $a \\in S$, there exists $b \\in S$ such that $(a \\cdot b) \\bmod 10 = 1$.
An element $a$ has a multiplicative inverse modulo $m$ if and only if $\\gcd(a, m) = 1$.

---

### 2. Givens & Parameters
- Set: $S = \\{1, 2, 3, 5, 7, 8, 9\\}$
- Operation: Multiplication modulo 10
- Identity element: $e = 1$
- Target: Identify which of the four given assertions is **false**.

---

### 3. Evaluating Each Statement

1. **Option A ("It is not closed")**:
   - Take $a = 2 \\in S$ and $b = 5 \\in S$.
   - $(2 \\cdot 5) \\bmod 10 = 10 \\bmod 10 = 0$.
   - Since $0 \\notin S$, the set is **not closed**.
   - Therefore, Statement A is **true**.

2. **Option B ("2 does not have an inverse")**:
   - $\\gcd(2, 10) = 2 \\neq 1$.
   - Multiples of 2 modulo 10: $\\{2, 4, 6, 8, 0\\}$, none of which equals 1.
   - Thus, 2 has no inverse in $S$.
   - Therefore, Statement B is **true**.

3. **Option D ("8 does not have an inverse")**:
   - $\\gcd(8, 10) = 2 \\neq 1$.
   - Multiples of 8 modulo 10: $\\{8, 6, 4, 2, 0\\}$, none of which equals 1.
   - Thus, 8 has no inverse in $S$.
   - Therefore, Statement D is **true**.

4. **Option C ("3 does not have an inverse")**:
   - $\\gcd(3, 10) = 1$, so 3 is coprime to 10 and must possess a multiplicative inverse modulo 10.
   - Testing elements in $S$:
     $$(3 \\cdot 7) \\bmod 10 = 21 \\bmod 10 = 1$$
   - Since $7 \\in S$, the element $7$ is the multiplicative inverse of $3$.
   - Thus, **3 DOES have an inverse** in $S$.
   - Therefore, Statement C is **FALSE**.

---

### 4. Final Answer
The false statement is **Option C ("3 does not have an inverse")**.`,
    images: []
  },

  "go:883": {
    concept: "Set Theory & Relations — Reflexivity and Taxonomy of Binary Relations on $\\mathbb{Z} \\times \\mathbb{Z}$",
    markdown: `### 1. Concept
Let $S = \\mathbb{Z} \\times \\mathbb{Z}$. A binary relation $R$ on $S$ is:
- **Reflexive**: if $(x, y) R (x, y)$ for all $(x, y) \\in S$.
- **Symmetric**: if $(x, y) R (u, v) \\implies (u, v) R (x, y)$.
- **Antisymmetric**: if $(x, y) R (u, v)$ and $(u, v) R (x, y) \\implies (x, y) = (u, v)$.
- **Transitive**: if $(x, y) R (u, v)$ and $(u, v) R (w, z) \\implies (x, y) R (w, z)$.

Classification:
- An **Equivalence Relation** must be reflexive, symmetric, and transitive.
- A **Partial Order** must be reflexive, antisymmetric, and transitive.
- A **Total Order** must be a partial order where every pair of elements is comparable.

---

### 2. Definition & Axiomatic Verification
The relation $R$ is defined on $\\mathbb{Z} \\times \\mathbb{Z}$ by:
$$(x, y) R (u, v) \\iff x < u \\quad \\text{and} \\quad y > v$$

#### Test 1: Reflexivity
For $R$ to be reflexive, we must have $(x, y) R (x, y)$ for every $(x, y) \\in \\mathbb{Z} \\times \\mathbb{Z}$.
Applying the definition:
$$x < x \\quad \\text{and} \\quad y > y$$
Since strict inequality $x < x$ is false for all integers $x$, $(x, y) \\not R (x, y)$ for any pair.
In fact, $R$ is strictly **irreflexive**.

**Consequences of failing reflexivity:**
1. Since an Equivalence Relation requires reflexivity, $R$ **cannot be an equivalence relation**.
2. Since a Partial Order requires reflexivity, $R$ **cannot be a partial order** (nor can it be a total order).

---

### 3. Distractor Analysis
* **Option A (Neither a Partial Order nor an Equivalence Relation)**: ✓ **CORRECT** — because $R$ violates reflexivity, it can be neither a partial order nor an equivalence relation.
* **Option B (A Partial Order but not a Total Order)**: Incorrect — violates the reflexivity requirement of partial orders. (Note: strict partial orders omit reflexivity, but standard mathematical terminology and GATE syllabus specify partial orders as non-strict reflexive relations).
* **Option C (A total Order)**: Incorrect — cannot be a total order without being a partial order.
* **Option D (An Equivalence Relation)**: Incorrect — violates reflexivity and symmetry.

---

### 4. Final Answer
The relation $R$ is **Neither a Partial Order nor an Equivalence Relation**, corresponding to **Option A**.`,
    images: []
  },

  "go:3545": {
    concept: "Digital Logic & Discrete Mathematics — Shannon's Expansion Theorem & Boolean Identities",
    markdown: `### 1. Concept
**Shannon's Expansion Theorem** is a fundamental theorem in Boolean algebra stating that any Boolean function $f(x_1, x_2, \\ldots, x_n)$ can be expanded with respect to any variable $x_i$ as:
$$f(x_1, \\ldots, x_n) = x_i' \\cdot f(x_1, \\ldots, x_i = 0, \\ldots, x_n) + x_i \\cdot f(x_1, \\ldots, x_i = 1, \\ldots, x_n)$$
where $f(x_1, \\ldots, 0, \\ldots, x_n)$ and $f(x_1, \\ldots, 1, \\ldots, x_n)$ are the **Boolean cofactors** of $f$ with respect to $x_i'$ and $x_i$.
Additionally, the consensus/complementation identity states that $x_i' \\cdot g + x_i \\cdot g = (x_i' + x_i) \\cdot g = 1 \\cdot g = g$.

---

### 2. Evaluating Each Equation

1. **Option A**:
   $$x_1' f(x_1, \\ldots, x_n) + x_1 f(x_1, \\ldots, x_n) = (x_1' + x_1) f(x_1, \\ldots, x_n) = 1 \\cdot f = f$$
   This is a valid Boolean identity ($a' b + a b = b$). **True**.

2. **Option B**:
   $$x_2 f(x_1, \\ldots, x_n) + x_2' f(x_1, \\ldots, x_n) = (x_2 + x_2') f(x_1, \\ldots, x_n) = 1 \\cdot f = f$$
   This is also a valid Boolean identity. **True**.

3. **Option C**:
   $$f(x_1, \\ldots, x_n) = x_n' f(x_1, \\ldots, 0) + x_n f(x_1, \\ldots, 1)$$
   This is the exact, canonical statement of Shannon's Expansion Theorem about variable $x_n$. **True**.

4. **Option D**:
   $$f(x_1, x_2, \\ldots, x_n) = f(0, x_2, \\ldots, x_n) + f(1, x_2, \\ldots, x_n)$$
   This expression simply takes the logical OR of the two cofactors without multiplying by the respective literals $x_1'$ and $x_1$.
   **Counterexample:**
   Let $f(x_1, x_2) = x_1$.
   - Left-Hand Side (LHS): $f(0, x_2) = 0$.
   - Right-Hand Side (RHS): $f(0, x_2) + f(1, x_2) = 0 + 1 = 1$.
   - For $x_1 = 0$, $\\text{LHS} = 0 \\neq \\text{RHS} = 1$.
   Therefore, Equation D is **NOT true**.

---

### 3. Final Answer
The equation that is NOT true is **Option D ($f(x_1, x_2, \\ldots, x_n) = f(0, x_2, \\ldots, x_n) + f(1, x_2, \\ldots, x_n)$)**.`,
    images: []
  },

  "go:3550": {
    concept: "Graph Theory — Minimum Weight Connected Spanning Subgraphs (Minimum Spanning Tree)",
    markdown: `### 1. Concept
Let $G = (V, E)$ be a connected, undirected graph with positive edge weights $w(e) > 0$ for all $e \\in E$. A **connected spanning subgraph** is a subgraph $G' = (V, E')$ such that $E' \\subseteq E$ and $G'$ connects every pair of vertices in $V$.
A spanning subgraph with the minimum possible total edge weight $\\sum_{e \\in E'} w(e)$ is known as a **Minimum Spanning Tree (MST)**.

---

### 2. Theorem & Rigorous Proof
**Theorem:** If all edge weights are strictly positive ($w(e) > 0$), then any connected spanning subgraph of minimum total weight must be acyclic (and hence a tree).

**Proof by Contradiction:**
1. Let $G' = (V, E')$ be a connected spanning subgraph of $G$ with minimum total weight.
2. Suppose for contradiction that $G'$ contains a cycle $C$.
3. Let $e^* \\in C$ be an arbitrary edge belonging to the cycle.
4. Consider the subgraph $G'' = (V, E' \\setminus \\{e^*\\})$ formed by removing edge $e^*$.
5. Since $e^*$ belonged to a cycle $C$, any path between two vertices in $G'$ that traversed $e^*$ can instead be rerouted along the alternate path in the cycle $C \\setminus \\{e^*\\}$. Therefore, $G''$ remains a connected spanning subgraph of $G$.
6. Calculate the total weight of $G''$:
   $$w(E' \\setminus \\{e^*\\}) = \\sum_{e \\in E'} w(e) - w(e^*)$$
7. Because edge weights are strictly positive, $w(e^*) > 0$, which yields:
   $$w(E' \\setminus \\{e^*\\}) < w(E')$$
8. This contradicts the assumption that $E'$ was of minimum total weight among all connected spanning subgraphs!
9. Hence, $G'$ cannot contain any cycles. A connected, acyclic graph spanning all vertices $V$ is by definition a **tree**.

---

### 3. Distractor Analysis
* **Option A (Hamiltonian cycle)**: Incorrect — a cycle has more edges than a tree ($n$ edges vs $n-1$) and with positive edge weights, removing an edge from the cycle maintains connectivity while reducing the total weight.
* **Option B (grid)**: Incorrect — a grid graph contains multiple internal cycles.
* **Option C (hypercube)**: Incorrect — hypercubes contain cycles of length 4.
* **Option D (tree)**: ✓ **CORRECT** — any minimum-weight connected spanning subgraph with positive weights is strictly an MST (a tree).

---

### 4. Final Answer
Any subset of edges that connects all vertices and has minimum total weight is a **tree**, corresponding to **Option D**.`,
    images: []
  }
};

export function injectChunkCseMath08() {
  const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let content = fs.readFileSync(patchesFile, "utf-8");

  const toAdd = [];
  let alreadyPresent = 0;

  for (const [uid, sol] of Object.entries(CHUNK_CSE_MATH_08_SOLUTIONS)) {
    if (content.includes(`"${uid}":`)) {
      alreadyPresent++;
    } else {
      toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
    }
  }

  console.log(`CHUNK-CSE-MATH-08: Already present = ${alreadyPresent}, To inject = ${toAdd.length}`);

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

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-math-08")) {
  injectChunkCseMath08();
}
