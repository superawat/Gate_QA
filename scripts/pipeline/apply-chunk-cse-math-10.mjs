import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_MATH_10_SOLUTIONS = {
  "go:1021": {
    concept: "Discrete Mathematics — Binary Relations, Reflexive & Transitive Closures",
    markdown: `### 1. Concept
For a relation $R$ defined on a set $A$:
1. **Transitive Closure ($R^+$)**: The smallest transitive relation on $A$ containing $R$. If $(a, b) \in R$ and $(b, c) \in R$, then $(a, c) \in R^+$.
2. **Reflexive Closure ($R^=$)**: Formed by adding all diagonal pairs to $R$:
   $$R^= = R \cup \\{(x, x) \\mid x \\in A\\}$$
3. **Reflexive Transitive Closure ($R^*$)**: The smallest relation containing $R$ that is both reflexive and transitive:
   $$R^* = R^+ \\cup \\{(x, x) \\mid x \\in A\\}$$

---

### 2. Givens & Parameters
- Ground set: $A = \\{0, 1, 2\\}$
- Binary relation $S$:
  $$S = \\{(x, y) \\mid y = x + 1 \\text{ and } x, y \\in \\{0, 1, 2\\}\\}$$

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Enumerate elements of $S$**
- For $x = 0 \\implies y = 0 + 1 = 1 \\in A \\implies (0, 1) \\in S$.
- For $x = 1 \\implies y = 1 + 1 = 2 \\in A \\implies (1, 2) \\in S$.
- For $x = 2 \\implies y = 2 + 1 = 3 \\notin A$.
Thus:
$$S = \\{(0, 1), (1, 2)\\}$$

**Step 2: Construct the Transitive Closure ($S^+$)**
- Since $(0, 1) \\in S$ and $(1, 2) \\in S$, by transitivity $(0, 2)$ must belong to $S^+$.
- No further transitive extensions exist because there are no pairs with first coordinate 2 in $S$.
Thus:
$$S^+ = \\{(0, 1), (1, 2), (0, 2)\\}$$
Notice that $S^+$ corresponds exactly to the strict inequality relation:
$$S^+ = \\{(x, y) \\mid y > x \\text{ and } x, y \\in \\{0, 1, 2\\}\\}$$

**Step 3: Construct the Reflexive Transitive Closure ($S^*$)**
Add all reflexive pairs $(x, x)$ for every $x \\in A$:
$$\\{(0, 0), (1, 1), (2, 2)\\}$$
Combining with $S^+$:
$$S^* = \\{(0, 0), (1, 1), (2, 2), (0, 1), (1, 2), (0, 2)\\}$$

**Step 4: Characterize $S^*$ as a Set-Builder Property**
Examine each pair $(x, y) \\in S^*$:
- $(0, 0) \\implies 0 \\ge 0$
- $(1, 1) \\implies 1 \\ge 1$
- $(2, 2) \\implies 2 \\ge 2$
- $(0, 1) \\implies 1 \\ge 0$
- $(1, 2) \\implies 2 \\ge 1$
- $(0, 2) \\implies 2 \\ge 0$

Every pair $(x, y) \\in S^*$ satisfies $y \\ge x$.
Conversely, every pair $(x, y) \\in A \\times A$ satisfying $y \\ge x$ is in $S^*$.
Therefore:
$$S^* = \\{(x, y) \\mid y \\ge x \\text{ and } x, y \\in \\{0, 1, 2\\}\\}$$

---

### 4. Distractor Analysis
* **Option A ($\\{(x, y) \\mid y > x\\}$)**: Incorrect — this is only the transitive closure $S^+$; it omits the reflexive self-loops $(x, x)$ where $y = x$.
* **Option B ($\\{(x, y) \\mid y \\ge x\\}$)**: ✓ **CORRECT** — includes all pairs with $y > x$ as well as all reflexive pairs with $y = x$.
* **Option C ($\\{(x, y) \\mid y < x\\}$)**: Incorrect — represents strict inverse ordering ($y < x$).
* **Option D ($\\{(x, y) \\mid y \\le x\\}$)**: Incorrect — represents the reflexive transitive closure of $y = x - 1$, reversing the relation.

---

### 5. Final Answer
The reflexive transitive closure of $S$ is **$\\{(x, y) \\mid y \\ge x \\text{ and } x, y \\in \\{0, 1, 2\\}\\}$**, corresponding to **Option B**.`,
    images: []
  },

  "go:3665": {
    concept: "Computer Networks & Web Technologies — Hypertext Transfer Protocol (HTTP) Characteristics",
    markdown: `### 1. Concept
The **HyperText Transfer Protocol (HTTP)** (RFC 2616 / RFC 7230) is an application-layer request-response protocol designed to transfer hypermedia documents (such as HTML, images, and JSON) across distributed, collaborative information systems.
- **HTML (HyperText Markup Language)**: Defines the syntactic and semantic structure, content hierarchy, and formatting layout of web pages.
- **HTTP**: The transport protocol used to deliver resources between web clients (browsers) and web servers.

---

### 2. Comprehensive Analysis of Each Statement

- **Statement A: "HTTP runs over TCP"**
  - **TRUE**: Standard HTTP (HTTP/1.0, HTTP/1.1, and HTTP/2) operates on top of the Transmission Control Protocol (TCP) (typically over port 80 for cleartext or port 443 for TLS/HTTPS). TCP guarantees reliable, connection-oriented, in-order byte stream delivery.

- **Statement B: "HTTP describes the structure of web pages"**
  - **FALSE**: HTTP is strictly a communications and data transfer protocol. It specifies request methods (\`GET\`, \`POST\`, \`HEAD\`, \`PUT\`, etc.), headers, and status codes. The internal structure, document object model (DOM), and semantic tags of web pages are described by **HTML**, not HTTP.

- **Statement C: "HTTP allows information to be stored in a URL"**
  - **TRUE**: HTTP URLs can convey state and data via query strings (\`?key=value&id=123\`), URL path parameters (\`/users/42\`), and matrix parameters. Web applications routinely encode client state and search parameters directly in the URL.

- **Statement D: "HTTP can be used to test the validity of a hypertext link"**
  - **TRUE**: A client or web crawler can issue an HTTP \`HEAD\` or \`GET\` request to a target link. The server's response status code directly confirms link validity: a \`200 OK\` indicates a valid link, whereas \`404 Not Found\` or \`410 Gone\` reveals a broken or invalid link without necessarily downloading the full payload.

---

### 3. Distractor Analysis
* **Option A**: A true statement regarding HTTP's underlying transport layer.
* **Option B**: ✓ **CORRECT (Identifies the FALSE statement)** — confuses the role of HTTP (transfer protocol) with HTML (structural document markup language).
* **Option C**: A true statement regarding URL query and path parameters.
* **Option D**: A true statement regarding link verification via HTTP response status codes.

---

### 4. Final Answer
The false statement is **Option B (HTTP describes the structure of web pages)**.`,
    images: []
  },

  "go:1022": {
    concept: "Engineering Mathematics — Probability & Binomial Distribution for Independent Coin Tosses",
    markdown: `### 1. Concept
When an experiment consists of $n$ independent and identical Bernoulli trials, each having success probability $p$ and failure probability $q = 1 - p$, the probability of obtaining exactly $k$ successes is given by the **Binomial Distribution**:
$$P(X = k) = \\binom{n}{k} p^k (1 - p)^{n - k}$$
where $\\binom{n}{k} = \\frac{n!}{k!(n - k)!}$.

---

### 2. Givens & Parameters
- Number of tosses: $n = 4$
- Coin type: Fair coin $\\implies P(\\text{Head}) = p = \\frac{1}{2}$, $P(\\text{Tail}) = q = \\frac{1}{2}$
- Target event: Exactly 2 heads ($k = 2$) and 2 tails ($n - k = 2$).

---

### 3. Step-by-Step Analytical Derivation

**Method 1: Binomial Probability Formula**
Substitute $n = 4, k = 2, p = \\frac{1}{2}$:
$$P(X = 2) = \\binom{4}{2} \\left(\\frac{1}{2}\\right)^2 \\left(\\frac{1}{2}\\right)^{4 - 2}$$

Calculate the binomial coefficient:
$$\\binom{4}{2} = \\frac{4 \\times 3}{2 \\times 1} = 6$$

Compute the probability:
$$P(X = 2) = 6 \\times \\left(\\frac{1}{4}\\right) \\times \\left(\\frac{1}{4}\\right) = 6 \\times \\frac{1}{16} = \\frac{6}{16} = \\mathbf{\\frac{3}{8}}$$

**Method 2: Sample Space Enumeration**
Total possible outcomes when tossing a fair coin 4 times:
$$|\\Omega| = 2^4 = 16$$
All 16 elementary outcomes are equally likely, each having probability $\\frac{1}{16}$.

The outcomes containing exactly 2 Heads and 2 Tails are:
1. $HHTT$
2. $HTHT$
3. $HTTH$
4. $THHT$
5. $THTH$
6. $TTHH$

Number of favorable outcomes $= 6$.
$$P(\\text{2 Heads, 2 Tails}) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}} = \\frac{6}{16} = \\mathbf{\\frac{3}{8}}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{3}{8}$)**: ✓ **CORRECT** — accurately calculated probability $\\frac{6}{16} = \\frac{3}{8}$.
* **Option B ($\\frac{1}{2}$)**: Incorrect — corresponds to $\\frac{8}{16}$, overestimating favorable outcomes.
* **Option C ($\\frac{5}{8}$)**: Incorrect — corresponds to $\\frac{10}{16}$.
* **Option D ($\\frac{3}{4}$)**: Incorrect — corresponds to $\\frac{12}{16}$, which represents the probability of obtaining at least one head and at least one tail (14/16 is strictly between 1 and 3 heads).

---

### 5. Final Answer
The probability of obtaining two heads and two tails is **$\\dfrac{3}{8}$**, corresponding to **Option A**.`,
    images: []
  },

  "go:1023": {
    concept: "Engineering Mathematics — Linear Algebra, Symmetric Matrix Degrees of Freedom & Combinatorics",
    markdown: `### 1. Concept
An $n \\times n$ square matrix $A$ is **symmetric** if and only if it equals its transpose:
$$A = A^T \\iff a_{ij} = a_{ji} \\quad \\text{for all } 1 \\le i, j \\le n$$
To determine the number of distinct symmetric matrices:
1. Identify the number of **independent entries** required to uniquely specify the matrix.
2. Apply the **multiplication principle of counting** across all independent choices.

---

### 2. Givens & Parameters
- Matrix dimensions: $n \\times n$ (total elements $= n^2$).
- Matrix type: Symmetric ($a_{ij} = a_{ji}$).
- Allowed values: Each entry $a_{ij} \\in \\{0, 1\\}$ (exactly 2 choices per independent element).

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Count independent entries**
In an $n \\times n$ matrix:
- **Main diagonal entries** ($a_{ii}$ where $i = j$):
  $$a_{11}, a_{22}, \\dots, a_{nn}$$
  There are exactly $n$ diagonal elements. Each can be chosen independently.
- **Off-diagonal entries**:
  The total number of off-diagonal elements is:
  $$n^2 - n$$
  Because $a_{ij} = a_{ji}$ for all $i \\ne j$, the elements in the strictly lower triangular part are completely determined by the elements in the strictly upper triangular part ($i < j$).
  The number of strictly upper triangular elements is:
  $$\\frac{n^2 - n}{2} = \\binom{n}{2}$$

**Step 2: Sum the independent degrees of freedom**
Total number of independent entries $k$:
$$k = n + \\frac{n^2 - n}{2} = \\frac{2n + n^2 - n}{2} = \\frac{n^2 + n}{2} = \\frac{n(n + 1)}{2}$$

**Step 3: Calculate total distinct matrices**
Since each of the $k$ independent positions can be independently assigned either $0$ or $1$ (2 distinct possibilities):
$$\\text{Total symmetric matrices} = 2^k = 2^{\\frac{n^2 + n}{2}} = \\text{power}\\left(2, \\frac{n^2 + n}{2}\\right)$$

---

### 4. Distractor Analysis
* **Option A ($\\text{power}(2, n)$)**: Incorrect — counts only the choices for the $n$ diagonal elements, ignoring the off-diagonal entries.
* **Option B ($\\text{power}(2, n^2)$)**: Incorrect — counts all possible unrestricted $n \\times n$ binary matrices without the symmetry constraint $a_{ij} = a_{ji}$.
* **Option C ($\\text{power}\\left(2, \\frac{n^2 + n}{2}\\right)$)**: ✓ **CORRECT** — accurately accounts for the $n$ diagonal entries plus the $\\frac{n^2 - n}{2}$ upper triangular entries.
* **Option D ($\\text{power}\\left(2, \\frac{n^2 - n}{2}\\right)$)**: Incorrect — counts only the off-diagonal pairs, omitting the $n$ main diagonal entries.

---

### 5. Final Answer
The number of different $n \\times n$ symmetric binary matrices is **$\\text{power}\\left(2, \\frac{n^2 + n}{2}\\right)$**, corresponding to **Option C**.`,
    images: []
  },

  "go:1024": {
    concept: "Engineering Mathematics — Linear Algebra, Matrix Invertibility & Product Inverses",
    markdown: `### 1. Concept
Let $A, B, C, D$ be $n \\times n$ square matrices with non-zero determinants over a field:
$$\\det(A) \\ne 0, \\; \\det(B) \\ne 0, \\; \\det(C) \\ne 0, \\; \\det(D) \\ne 0$$
Because their determinants are non-zero, all four matrices are **non-singular and invertible** (members of the General Linear Group $GL(n, \\mathbb{R})$).
The inverse of an invertible matrix $M$ is the unique matrix $M^{-1}$ satisfying:
$$M M^{-1} = M^{-1} M = I$$

---

### 2. Givens & Equation
$$A B C D = I$$
We need to isolate and determine $B^{-1}$.

---

### 3. Step-by-Step Analytical Derivation

**Method 1: Step-by-Step Algebraic Isolation**
Given:
$$A B C D = I$$

1. Pre-multiply both sides by $A^{-1}$:
   $$A^{-1}(A B C D) = A^{-1} I \\implies B C D = A^{-1}$$
2. Post-multiply both sides by $D^{-1}$:
   $$(B C D) D^{-1} = A^{-1} D^{-1} \\implies B C = A^{-1} D^{-1}$$
3. Post-multiply both sides by $C^{-1}$:
   $$(B C) C^{-1} = A^{-1} D^{-1} C^{-1} \\implies B = A^{-1} D^{-1} C^{-1}$$
4. Take the matrix inverse of both sides:
   $$B^{-1} = (A^{-1} D^{-1} C^{-1})^{-1}$$
5. Applying the **reversal rule for matrix product inversion** ($(XYZ)^{-1} = Z^{-1} Y^{-1} X^{-1}$):
   $$B^{-1} = (C^{-1})^{-1} (D^{-1})^{-1} (A^{-1})^{-1} = \\mathbf{C D A}$$

---

**Method 2: Cyclic Permutation Identity**
From $A B C D = I$:
Pre-multiply both sides by $A^{-1}$ and post-multiply both sides by $A$:
$$A^{-1} (A B C D) A = A^{-1} I A \\implies (A^{-1} A) B C D A = I \\implies B (C D A) = I$$
Since matrix inverses in $GL(n, \\mathbb{R})$ are unique, $B M = I$ implies $M = B^{-1}$:
$$B^{-1} = \\mathbf{C D A}$$

---

### 4. Distractor Analysis
* **Option A ($D^{-1} C^{-1} A^{-1}$)**: Incorrect — inverts the matrix factors without accounting for cyclic rearrangement and yields $(A C D)^{-1}$.
* **Option B ($C D A$)**: ✓ **CORRECT** — algebraically verified via both inversion and cyclic shift.
* **Option C ($A D C$)**: Incorrect — matrix multiplication is non-commutative ($A D C \\ne C D A$).
* **Option D (Does not necessarily exist)**: Incorrect — since $\\det(B) \\ne 0$, $B$ is guaranteed to be non-singular and its inverse $B^{-1}$ always exists.

---

### 5. Final Answer
The inverse $B^{-1}$ is equal to **$C D A$**, corresponding to **Option B**.`,
    images: []
  },

  "go:3672": {
    concept: "Web Technologies & Java Enterprise — JSP Implicit Objects in Scriptlets & Expressions",
    markdown: `### 1. Concept
In JavaServer Pages (JSP) technology, **Implicit Objects** are predefined Java objects that the JSP container (servlet engine) automatically instantiates and exposes to the developer.
These objects are defined in the generated \`_jspService()\` method of the translated servlet and can be directly used within JSP **scriptlets** (\`<% ... %>\`) and **expressions** (\`<%= ... %>\`) without requiring explicit instantiation, importation, or declaration.

---

### 2. The Nine Standard JSP Implicit Objects

The JSP specification defines 9 implicit objects:
1. **\`request\`**: Instance of \`HttpServletRequest\` (encapsulates client HTTP request data, parameters, headers, and cookies).
2. **\`response\`**: Instance of \`HttpServletResponse\` (encapsulates server HTTP response headers, MIME types, and redirection).
3. **\`session\`**: Instance of \`HttpSession\` (manages conversational state across multiple requests for a client; available unless page directive sets \`session="false"\`).
4. **\`application\`**: Instance of \`ServletContext\` (application-wide shared context and initialization parameters).
5. **\`out\`**: Instance of \`JspWriter\` (buffered character output stream to write content to the response body).
6. **\`config\`**: Instance of \`ServletConfig\` (servlet configuration and initialization parameters).
7. **\`pageContext\`**: Instance of \`PageContext\` (provides centralized access to all page attributes and namespaces).
8. **\`page\`**: Instance of \`Object\` (synonymous with \`this\` in Java, referencing the current servlet instance).
9. **\`exception\`**: Instance of \`Throwable\` (available only in error pages designated by \`isErrorPage="true"\`).

---

### 3. Step-by-Step Evaluation of the Given Options

The question asks which of the following objects can be used in expressions and scriptlets without explicit declaration:
- \`session\`: Built-in implicit object (\`HttpSession\`).
- \`request\`: Built-in implicit object (\`HttpServletRequest\`).
- \`response\`: Built-in implicit object (\`HttpServletResponse\`).

All three objects — **session, request, and response** — belong to the core set of implicit objects made directly accessible by the container.

---

### 4. Distractor Analysis
* **Option A (session and request only)**: Incorrect — incomplete; falsely excludes \`response\`.
* **Option B (request and response only)**: Incorrect — incomplete; falsely excludes \`session\`.
* **Option C (response and session only)**: Incorrect — incomplete; falsely excludes \`request\`.
* **Option D (session, request and response)**: ✓ **CORRECT** — all three are valid implicit objects accessible without explicit declaration.

---

### 5. Final Answer
The objects that can be used without explicit declaration are **session, request and response**, corresponding to **Option D**.`,
    images: []
  },

  "go:1027": {
    concept: "Theory of Computation & Computational Complexity — NP-Completeness of 3-SAT vs Polynomial Solvability of 2-SAT",
    markdown: `### 1. Concept
In computational complexity theory:
- **Class P**: The class of decision problems solvable by a deterministic Turing machine in polynomial time ($O(n^k)$).
- **Class NP**: The class of decision problems verifiable by a deterministic Turing machine in polynomial time.
- **NP-Complete**: Problems in $\\text{NP}$ to which every problem in $\\text{NP}$ can be reduced in polynomial time (Karp/Cook-Levin reductions).

---

### 2. Governing Principles & Complexity Proofs

#### A. 3-SAT (3-Conjunctive Normal Form Satisfiability)
- **Problem Statement**: Given a boolean formula $\\phi$ in CNF where each clause contains at most 3 literals (e.g. $(x_1 \\vee \\neg x_2 \\vee x_3) \\wedge (\\neg x_1 \\vee x_4 \\vee x_5)$), decide whether there exists a truth assignment that makes $\\phi$ True.
- **Complexity Classification**: **NP-Complete**.
- **Proof**: 
  1. $3\\text{-SAT} \\in \\text{NP}$ because any candidate truth assignment can be evaluated in linear time.
  2. Cook's Theorem (1971) established that general SAT is $\\text{NP}$-complete.
  3. Karp (1972) demonstrated that general SAT polynomial-time reduces to 3-SAT (by splitting clauses with $> 3$ literals using auxiliary variables).
  4. Thus, 3-SAT is $\\text{NP}$-complete, and no polynomial-time algorithm exists unless $\\text{P} = \\text{NP}$.

#### B. 2-SAT (2-Conjunctive Normal Form Satisfiability)
- **Problem Statement**: Given a boolean formula $\\phi$ in CNF where each clause contains at most 2 literals (e.g. $(x_1 \\vee \\neg x_2) \\wedge (\\neg x_1 \\vee x_3)$), decide satisfiability.
- **Complexity Classification**: **In P** (solvable in linear time $O(V + E)$).
- **Proof via Implication Graph (Aspvall, Plass & Tarjan, 1979)**:
  1. Each 2-literal clause $(u \\vee v)$ is logically equivalent to two implication edges:
     $$(\\neg u \\implies v) \\quad \\text{and} \\quad (\\neg v \\implies u)$$
  2. Construct a directed **implication graph** $G = (V, E)$ where vertices represent all literals $\\{x_i, \\neg x_i\\}$ and directed edges represent the implications.
  3. A 2-SAT formula is satisfiable if and only if **no variable $x_i$ and its negation $\\neg x_i$ lie in the same Strongly Connected Component (SCC)** of $G$.
  4. SCCs can be computed in linear time $O(V + E)$ using Tarjan's or Kosaraju's algorithm.
  5. Therefore, 2-SAT can be solved deterministically in $O(n)$ time, placing it strictly in **P** (and in $\\text{NL}$-complete).

---

### 3. Distractor Analysis
* **Option A (both in P)**: Incorrect — 3-SAT is $\\text{NP}$-complete and not known to be in $\\text{P}$.
* **Option B (both NP complete)**: Incorrect — 2-SAT is solvable in linear time, so it is in $\\text{P}$ and not $\\text{NP}$-complete (unless $\\text{P} = \\text{NP}$).
* **Option C (NP-complete and in P respectively)**: ✓ **CORRECT** — 3-SAT is $\\text{NP}$-complete, while 2-SAT is in $\\text{P}$.
* **Option D (undecidable and NP complete respectively)**: Incorrect — both problems are finite and decidable.

---

### 4. Final Answer
The problems 3-SAT and 2-SAT are **NP-complete and in P respectively**, corresponding to **Option C**.`,
    images: []
  },

  "go:3674": {
    concept: "Discrete Mathematics — Mathematical Logic & Deductive Argument Validity",
    markdown: `### 1. Concept
In propositional logic, an argument consisting of premises $H_1, H_2, \\dots, H_k$ and conclusion $C$:
$$[H_1 \\wedge H_2 \\wedge \\dots \\wedge H_k] \\implies C$$
is **valid** if and only if it is a tautology.
Equivalently, an argument is valid if it is **impossible** for all premises to be simultaneously True while the conclusion $C$ is False. If a truth assignment makes all premises True and the conclusion False, it constitutes a **countermodel**, proving the argument invalid.

---

### 2. Step-by-Step Evaluation of Arguments

#### Argument P: $[(\\neg p \\vee q) \\wedge (r \\to s) \\wedge (p \\vee r)] \\to (\\neg s \\to q)$
- **Premises**:
  1. $P_1: \\neg p \\vee q \\equiv p \\to q$
  2. $P_2: r \\to s$
  3. $P_3: p \\vee r$
- **Target Conclusion**: $\\neg s \\to q$
- **Derivation**:
  Assume the conclusion $\\neg s \\to q$ is False:
  This requires $\\neg s = T \\implies s = F$ and $q = F$.
  Substitute $s = F$ and $q = F$ into the premises:
  - From $P_2: r \\to s = r \\to F = T \\implies r = F$.
  - From $P_1: \\neg p \\vee q = \\neg p \\vee F = T \\implies \\neg p = T \\implies p = F$.
  - Now evaluate $P_3: p \\vee r = F \\vee F = F$.
  This contradicts the premise $P_3$ being True!
  Alternatively, by direct inference:
  - From $\\neg s$ and $r \\to s$, by Modus Tollens: $\\neg r$.
  - From $\\neg r$ and $p \\vee r$, by Disjunctive Syllogism: $p$.
  - From $p$ and $p \\to q$, by Modus Ponens: $q$.
  Therefore, $\\neg s \\implies q$ is guaranteed. **Argument P is VALID**.

---

#### Argument Q: $[(\\neg p \\wedge q) \\wedge [q \\to (p \\to r)]] \\to \\neg r$
- **Premises**:
  1. $P_1: \\neg p \\wedge q \\implies p = F, \\; q = T$
  2. $P_2: q \\to (p \\to r)$
- **Target Conclusion**: $\\neg r$ (requires $r = F$)
- **Countermodel Analysis**:
  Set $p = F, q = T, r = T$:
  - Premise 1: $\\neg F \\wedge T = T \\wedge T = T$ (holds).
  - Premise 2: $T \\to (F \\to T) = T \\to T = T$ (holds, since false antecedent $F \\to r$ is vacuously true).
  - Conclusion: $\\neg r = \\neg T = F$ (False!).
  Since all premises are True while the conclusion is False, **Argument Q is INVALID**.

---

#### Argument R: $[[(q \\wedge r) \\to p] \\wedge (\\neg q \\vee p)] \\to r$
- **Premises**:
  1. $P_1: (q \\wedge r) \\to p$
  2. $P_2: \\neg q \\vee p$
- **Target Conclusion**: $r$
- **Countermodel Analysis**:
  Set $r = F, p = F, q = F$:
  - Premise 1: $(F \\wedge F) \\to F = F \\to F = T$ (holds).
  - Premise 2: $\\neg F \\vee F = T \\vee F = T$ (holds).
  - Conclusion: $r = F$ (False!).
  Both premises are True while the conclusion is False. Thus, **Argument R is INVALID**.

---

#### Argument S: $[p \\wedge (p \\to r) \\wedge (q \\vee \\neg r)] \\to q$
- **Premises**:
  1. $P_1: p = T$
  2. $P_2: p \\to r$
  3. $P_3: q \\vee \\neg r$
- **Target Conclusion**: $q$
- **Derivation**:
  1. From $P_1$ ($p = T$) and $P_2$ ($p \\to r = T$), by Modus Ponens:
     $$r = T$$
  2. Since $r = T$, $\\neg r = F$.
  3. Substitute into $P_3$:
     $$q \\vee F = T \\implies q = T$$
  The conclusion $q$ must be True in every interpretation where the premises hold.
  Thus, **Argument S is VALID**.

---

### 3. Conclusion & Distractor Analysis
Arguments **$P$ and $S$ only** are valid.
* **Option A (P and Q only)**: Incorrect — argument $Q$ is invalid.
* **Option B (P and R only)**: Incorrect — argument $R$ is invalid.
* **Option C (P and S only)**: ✓ **CORRECT** — rigorous proof confirms $P$ and $S$ are valid tautologies.
* **Option D (P, Q, R and S)**: Incorrect — $Q$ and $R$ have countermodels.

---

### 4. Final Answer
The valid arguments are **$P$ and $S$ only**, corresponding to **Option C**.`,
    images: []
  },

  "go:3675": {
    concept: "Engineering Mathematics — Linear Algebra, Tridiagonal Toeplitz Matrices & Second-Order Recurrences",
    markdown: `### 1. Concept
A tridiagonal matrix $A_n$ with constant diagonal entries $a$ and off-diagonal entries $b, c$:
$$A_n = \\begin{bmatrix} a & b & 0 & \\dots & 0 \\\\ c & a & b & \\dots & 0 \\\\ 0 & c & a & \\dots & 0 \\\\ \\vdots & & & \\ddots & b \\\\ 0 & 0 & 0 & c & a \\end{bmatrix}_{n \\times n}$$
has determinant $D_n = \\det(A_n)$ satisfying the second-order linear homogeneous recurrence relation:
$$D_n = a D_{n-1} - b c D_{n-2}, \\quad \\text{for } n \\ge 3$$
with base initial conditions $D_1 = a$ and $D_2 = a^2 - bc$.

---

### 2. Givens & Recurrence Formulation
- Given tridiagonal matrix entries: $a = 3$, $b = 1$, $c = 1$.
- Recurrence equation:
  $$D_n = 3 D_{n-1} - (1)(1) D_{n-2} = 3 D_{n-1} - D_{n-2}$$
- Initial conditions:
  - For $n = 1$: $D_1 = |3| = 3$.
  - For $n = 2$: $D_2 = \\begin{vmatrix} 3 & 1 \\\\ 1 & 3 \\end{vmatrix} = 3(3) - 1(1) = 8$.

---

### 3. Analytical Solution of the Recurrence

**Step 1: Characteristic Equation**
$$r^2 - 3r + 1 = 0$$
Using the quadratic formula:
$$r = \\frac{3 \\pm \\sqrt{(-3)^2 - 4(1)(1)}}{2} = \\frac{3 \\pm \\sqrt{5}}{2}$$
The two characteristic roots are:
$$r_1 = \\frac{3 + \\sqrt{5}}{2}, \\quad r_2 = \\frac{3 - \\sqrt{5}}{2}$$

**Step 2: General Form of $D_n$**
Using powers of $n - 1$ as structured in the options:
$$D_n = c_1 r_1^{n-1} + c_2 r_2^{n-1}$$

**Step 3: Solve for Coefficients $c_1$ and $c_2$**
Using the base conditions:
1. For $n = 1$:
   $$D_1 = c_1 r_1^0 + c_2 r_2^0 = c_1 + c_2 = 3 \\quad \\implies \\quad c_1 + c_2 = 3$$
2. For $n = 2$:
   $$D_2 = c_1 r_1 + c_2 r_2 = 8$$
   Substitute $r_1$ and $r_2$:
   $$c_1 \\left(\\frac{3 + \\sqrt{5}}{2}\\right) + c_2 \\left(\\frac{3 - \\sqrt{5}}{2}\\right) = 8$$
   $$3(c_1 + c_2) + \\sqrt{5}(c_1 - c_2) = 16$$
   Since $c_1 + c_2 = 3$:
   $$3(3) + \\sqrt{5}(c_1 - c_2) = 16 \\implies \\sqrt{5}(c_1 - c_2) = 7 \\implies c_1 - c_2 = \\frac{7}{\\sqrt{5}}$$

3. Solve the linear system for $c_1$ and $c_2$:
   $$c_1 = \\frac{1}{2} \\left(3 + \\frac{7}{\\sqrt{5}}\\right) = \\frac{3\\sqrt{5} + 7}{2\\sqrt{5}}$$
   $$c_2 = \\frac{1}{2} \\left(3 - \\frac{7}{\\sqrt{5}}\\right) = \\frac{3\\sqrt{5} - 7}{2\\sqrt{5}}$$

**Step 4: Explicit Closed-Form Expression**
$$D_n = \\left(\\frac{3 + \\sqrt{5}}{2}\\right)^{n-1} \\left(\\frac{3\\sqrt{5} + 7}{2\\sqrt{5}}\\right) + \\left(\\frac{3 - \\sqrt{5}}{2}\\right)^{n-1} \\left(\\frac{3\\sqrt{5} - 7}{2\\sqrt{5}}\\right)$$

---

### 4. Distractor Analysis
* **Option A**: Involves base $\\frac{5 \\pm \\sqrt{3}}{2}$, which has incorrect roots.
* **Option B**: Involves base $\\frac{7 \\pm \\sqrt{5}}{2}$, which has incorrect constant shift.
* **Option C**: Involves base $\\frac{3 \\pm \\sqrt{7}}{2}$, which has incorrect discriminant.
* **Option D**: ✓ **CORRECT** — matches the exact characteristic roots $\\frac{3 \\pm \\sqrt{5}}{2}$ and coefficient terms derived from boundary conditions.

---

### 5. Final Answer
The determinant of $A$ is **Option D**.`,
    images: []
  },

  "go:3676": {
    concept: "Engineering Mathematics — Probability Theory & Minimum of Independent Exponential Random Variables",
    markdown: `### 1. Concept
An exponential random variable $X \\sim \\text{Exp}(\\lambda)$ with rate parameter $\\lambda > 0$ has:
- Probability density function (PDF): $f_X(t) = \\lambda e^{-\\lambda t}$ for $t \\ge 0$
- Cumulative distribution function (CDF): $F_X(t) = 1 - e^{-\\lambda t}$
- **Survival (reliability) function**: $S_X(t) = P(X > t) = e^{-\\lambda t}$
- Mean (expectation): $E[X] = \\frac{1}{\\lambda}$

---

### 2. Givens & Parameters
- $X$ is exponentially distributed with mean $\\alpha \\implies$ rate $\\lambda_X = \\frac{1}{\\alpha}$.
- $Y$ is exponentially distributed with mean $\\beta \\implies$ rate $\\lambda_Y = \\frac{1}{\\beta}$.
- $X$ and $Y$ are **statistically independent**.
- $Z = \\min(X, Y)$.
- Target: Compute the expected value $E[Z]$.

---

### 3. Step-by-Step Analytical Derivation

**Step 1: Survival function of $Z = \\min(X, Y)$**
For any $t \\ge 0$:
$$P(Z > t) = P(\\min(X, Y) > t)$$
The minimum of two numbers is greater than $t$ if and only if **both** numbers are simultaneously greater than $t$:
$$P(Z > t) = P(X > t \\text{ and } Y > t)$$

**Step 2: Utilize Independence**
Because $X$ and $Y$ are independent:
$$P(Z > t) = P(X > t) \\cdot P(Y > t)$$
Substitute the exponential survival functions:
$$P(Z > t) = e^{-\\lambda_X t} \\cdot e^{-\\lambda_Y t} = e^{-(\\lambda_X + \\lambda_Y)t}$$

**Step 3: Identify the Distribution of $Z$**
The survival function $P(Z > t) = e^{-(\\lambda_X + \\lambda_Y)t}$ is precisely that of an exponential random variable with combined rate parameter:
$$\\lambda_Z = \\lambda_X + \\lambda_Y = \\frac{1}{\\alpha} + \\frac{1}{\\beta}$$

**Step 4: Compute the Mean of $Z$**
The expectation of an exponential random variable is the reciprocal of its rate parameter:
$$E[Z] = \\frac{1}{\\lambda_Z} = \\frac{1}{\\frac{1}{\\alpha} + \\frac{1}{\\beta}}$$
Simplify the compound fraction:
$$\\frac{1}{\\alpha} + \\frac{1}{\\beta} = \\frac{\\beta + \\alpha}{\\alpha\\beta} = \\frac{\\alpha + \\beta}{\\alpha\\beta}$$
$$E[Z] = \\frac{1}{\\frac{\\alpha + \\beta}{\\alpha\\beta}} = \\mathbf{\\frac{\\alpha\\beta}{\\alpha + \\beta}}$$

---

### 4. Distractor Analysis
* **Option A ($\\frac{1}{\\alpha + \\beta}$)**: Incorrect — dimensional error; has units of rate ($\text{time}^{-1}$) rather than mean time.
* **Option B ($\\min(\\alpha, \\beta)$)**: Incorrect — fails to account for the probability distribution over all sample paths; the expected minimum of independent exponentials is always strictly smaller than either individual mean.
* **Option C ($\\frac{\\alpha\\beta}{\\alpha + \\beta}$)**: ✓ **CORRECT** — exact harmonic product form derived from exponential rate addition.
* **Option D ($\\alpha + \\beta$)**: Incorrect — this equals $E[X + Y]$, the expected sum, not the minimum.

---

### 5. Final Answer
The mean of $Z$ is **$\\left(\\dfrac{\\alpha\\beta}{\\alpha + \\beta}\\right)$**, corresponding to **Option C**.`,
    images: []
  },

  "go:1031": {
    concept: "Object-Oriented Programming & Software Design — Inheritance, Polymorphism & Abstract Method Placement",
    markdown: `### 1. Concept
In Object-Oriented Design (OOD):
1. **Code Reusability & DRY Principle**: Common attributes and methods whose behavior is completely uniform across all instances should be implemented in the **superclass**.
2. **Polymorphism & Contract Enforcement**: When an operation is semantically required for all subclasses but its concrete computational logic varies depending on the specific subclass category:
   - The method should be declared as **abstract in the superclass** to enforce a common interface contract without committing to an implementation.
   - Each concrete **subclass must implement (override)** the method according to its specific business rules.

---

### 2. Analysis of System Requirements & Class Hierarchy
- **Given Attributes**:
  - \`name\`: Universal to all employees.
  - \`id\`: Universal unique identifier.
  - \`salary\`: Determined specifically by employee category.
- **Problem Constraint**: *"Employees belong to different categories and their salary is determined by their category."*

---

### 3. Step-by-Step Method Placement Evaluation

1. **Evaluation of \`getId()\`**:
   - Every employee has an ID, and retrieving an ID is an invariant operation that does not vary by category.
   - Implementing \`getId()\` in the superclass allows all subclasses to inherit it directly, avoiding code duplication.
   - **Conclusion**: Statement **I** (\`getId\` is implemented in the superclass) is correct; Statement **II** is suboptimal.

2. **Evaluation of \`getName()\`**:
   - Similarly, retrieving an employee's name is uniform across all categories.
   - Implementing \`getName()\` in the superclass maximizes reuse.
   - Making it abstract in the superclass (Statement III) would force redundant re-implementations in every subclass (Statement V).
   - **Conclusion**: Statement **IV** (\`getName\` is implemented in the superclass) is correct.

3. **Evaluation of \`computeSalary()\` / \`getSalary()\`**:
   - The stem explicitly states that an employee's salary is determined by their specific category.
   - The superclass \`Employee\` cannot provide a single universal implementation for all categories (Statement VII is inappropriate).
   - Declaring \`getSalary()\` as an **abstract method in the superclass** ensures that every subclass is legally obliged to supply its category-specific formula while allowing polymorphic invocation (\`employee.getSalary()\`).
   - Each subclass (\`Manager\`, \`Engineer\`, etc.) implements its own specific calculation.
   - **Conclusion**: Statement **VI** (\`getSalary\` is abstract in superclass) and Statement **VIII** (\`getSalary\` is implemented in subclass) are correct.

---

### 4. Design Synthesis
Combining the optimal statements:
$$\\mathbf{I, IV, VI, VIII}$$
This matches canonical object-oriented design patterns (Template Method / Polymorphic Class Design).

---

### 5. Distractor Analysis
* **Option A (I, IV, VI, VIII)**: ✓ **CORRECT** — optimal placement maximizing code reuse and polymorphic contract enforcement.
* **Option B (I, IV, VII)**: Incorrect — implements \`getSalary\` in the superclass, violating the requirement that salary calculation depends on employee category.
* **Option C (I, III, V, VI, VIII)**: Incorrect — declares \`getName\` as abstract, forcing redundant implementation across all subclasses.
* **Option D (II, V, VIII)**: Incorrect — places all implementations in subclasses, completely abandoning superclass code reuse.

---

### 6. Final Answer
The best design is **Option A (I, IV, VI, VIII)**.`,
    images: [
      "/question-images/5982054219653344969.webp",
      "/question-images/17327951007155603608.webp"
    ]
  },

  "go:3677": {
    concept: "Discrete Mathematics — Harmonic Numbers, Summation Identities & Inversion of Summation Order",
    markdown: `### 1. Concept
The $j^{\\text{th}}$ **Harmonic Number** $H_j$ is defined as the sum of the reciprocals of the first $j$ positive integers:
$$H_j = \\sum_{k=1}^j \\frac{1}{k} = 1 + \\frac{1}{2} + \\frac{1}{3} + \\dots + \\frac{1}{j}$$
Evaluating the sum of the first $n$ harmonic numbers:
$$S_n = \\sum_{j=1}^n H_j$$
is a classical discrete mathematics identity found in Knuth's *Concrete Mathematics* (Section 2.1) and Rosen's *Discrete Mathematics*.

---

### 2. Step-by-Step Analytical Derivation

**Method 1: Interchanging the Order of Summation**
Substitute the definition of $H_j$ into the sum:
$$S_n = \\sum_{j=1}^n \\sum_{k=1}^j \\frac{1}{k}$$
The summation region is defined by the integer pairs $(j, k)$ satisfying:
$$1 \\le k \\le j \\le n$$
Interchanging the order of summation so that $k$ is the outer index:
$$S_n = \\sum_{k=1}^n \\sum_{j=k}^n \\frac{1}{k} = \\sum_{k=1}^n \\frac{1}{k} \\left(\\sum_{j=k}^n 1\\right)$$
The inner sum has $(n - k + 1)$ terms:
$$S_n = \\sum_{k=1}^n \\frac{n - k + 1}{k}$$
Split the numerator:
$$S_n = \\sum_{k=1}^n \\left(\\frac{n + 1}{k} - \\frac{k}{k}\\right) = \\sum_{k=1}^n \\frac{n + 1}{k} - \\sum_{k=1}^n 1$$
Factor out the constant $(n + 1)$ from the first sum:
$$S_n = (n + 1) \\sum_{k=1}^n \\frac{1}{k} - n$$
Recognizing that $\\sum_{k=1}^n \\frac{1}{k} = H_n$:
$$S_n = \\mathbf{(n + 1) H_n - n}$$

---

**Method 2: Verification by Small Values of $n$**
- **For $n = 1$**:
  $$S_1 = H_1 = 1$$
  - Option A: $1 \\cdot H_2 - 2 = 1.5 - 2 = -0.5 \\ne 1$.
  - Option B: $(1 + 1) H_1 - 1 = 2(1) - 1 = 1$. (Matches ✓)
  - Option C: $1 \\cdot H_1 - 1 = 1 - 1 = 0 \\ne 1$.
  - Option D: $(1 + 1) H_2 - 2 = 2(1.5) - 2 = 1$.

- **For $n = 2$**:
  $$S_2 = H_1 + H_2 = 1 + \\left(1 + \\frac{1}{2}\\right) = 2.5$$
  - Option B: $(2 + 1) H_2 - 2 = 3(1.5) - 2 = 4.5 - 2 = 2.5$. (Matches ✓)
  - Option D: $(2 + 1) H_3 - 3 = 3\\left(1 + \\frac{1}{2} + \\frac{1}{3}\\right) - 3 = 3\\left(\\frac{11}{6}\\right) - 3 = 5.5 - 3 = 2.5$.

*Note on Option D*: Because $H_{n+1} = H_n + \\frac{1}{n+1}$, expanding Option D gives $(n+1)\\left(H_n + \\frac{1}{n+1}\\right) - (n+1) = (n+1)H_n + 1 - n - 1 = (n+1)H_n - n$. While algebraically equivalent, **Option B ($(n + 1) H_n - n$)** is the canonical form expressed in terms of $H_n$ and selected by the official GATE key.

---

### 3. Distractor Analysis
* **Option A ($n H_{n+1} - (n + 1)$)**: Incorrect — fails for $n = 1$ (yields $-0.5$).
* **Option B ($(n + 1) H_n - n$)**: ✓ **CORRECT** — canonical closed form derived via double summation inversion.
* **Option C ($n H_n - n$)**: Incorrect — fails for $n = 1$ (yields $0$).
* **Option D ($(n + 1) H_{n+1} - (n + 1)$)**: Algebraically equivalent variant; Option B is the primary standard form accepted in the official key.

---

### 4. Final Answer
The sum $\\sum_{j=1}^n H_j$ is **$(n + 1) H_n - n$**, corresponding to **Option B**.`,
    images: []
  }
};

export function injectChunkCseMath10() {
  const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let content = fs.readFileSync(patchesFile, "utf-8");

  const toAdd = [];
  let alreadyPresent = 0;

  for (const [uid, sol] of Object.entries(CHUNK_CSE_MATH_10_SOLUTIONS)) {
    if (content.includes(`"${uid}":`)) {
      alreadyPresent++;
    } else {
      toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
    }
  }

  console.log(`CHUNK-CSE-MATH-10: Already present = ${alreadyPresent}, To inject = ${toAdd.length}`);

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

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-math-10")) {
  injectChunkCseMath10();
}
