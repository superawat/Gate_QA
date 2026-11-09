import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const CHUNK_CSE_VIN_17_SOLUTIONS = {
  "go:80366": {
    concept: "Algorithms - Quicksort Worst-Case Complexity on Ordered Inputs",
    markdown: `### 1. Quicksort Partitioning Behavior on Ordered Arrays
Standard Quicksort selects a pivot element (traditionally the first or last element of the sub-array) and partitions the remaining elements:
- When the input array is already sorted in ascending order or reverse-sorted in descending order:
  - Every partitioning step yields an extremely unbalanced split: one subproblem contains $0$ elements, while the other contains $n - 1$ elements.
  - The number of element comparisons executed across the recursive tree is:
    $$C(n) = \\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2} = \\Theta(n^2)$$
  - This represents the classical worst-case running time of standard Quicksort.

---

### 2. Comparing Running Times $t_1$ and $t_2$
We are given two inputs:
1. **Input 1**: $[1,\\; 2,\\; 3,\\; 4]$ has size $n_1 = 4$.
   - The array is sorted in ascending order.
   - Comparisons required:
     $$C(4) = \\frac{4 \\times 3}{2} = 6 \\text{ comparisons}$$
   - Execution time $t_1$ is proportional to $C(4)$.
2. **Input 2**: $[5,\\; 4,\\; 3,\\; 2,\\; 1]$ has size $n_2 = 5$.
   - The array is sorted in descending order (reverse-sorted).
   - Comparisons required:
     $$C(5) = \\frac{5 \\times 4}{2} = 10 \\text{ comparisons}$$
   - Execution time $t_2$ is proportional to $C(5)$.

Because $n_1 = 4 < 5 = n_2$ and both trigger the worst-case partitioning recurrence $T(n) = \\Theta(n^2)$:
$$t_1 < t_2$$

---

### 3. Distractor Analysis
- **Option A ($t_1 = t_2$)**: Incorrect. The input sizes differ ($n_1 = 4$ vs $n_2 = 5$); a larger array requires more partitioning steps and comparisons.
- **Option B ($t_1 > t_2$)**: Incorrect. Processing 4 elements cannot take longer than processing 5 elements under the same worst-case recurrence.
- **Option D ($t_1 = t_2 + 5 \\log 5$)**: Incorrect. The running times follow a quadratic recurrence $\\Theta(n^2)$, not an additive logarithmic difference.

---

### 4. Conclusion
Therefore, the relationship that holds is **$t_1 < t_2$ (Option C)**.`,
    images: []
  },

  "go:80373": {
    concept: "Compiler Design & Programming Languages - Static (Lexical) Scoping Variable Resolution",
    markdown: `### 1. Principles of Static (Lexical) Scoping
Under **static (lexical) scoping**:
- The scope and binding of an identifier are determined at **compile time** strictly by the textual nesting of procedure blocks in the source code.
- If an identifier is referenced within a procedure and is not declared locally within that procedure, the compiler searches outward through enclosing lexical blocks according to the program's static nesting structure, **completely ignoring the dynamic call chain**.

---

### 2. Lexical Hierarchy of the Program
Analyzing the textual structure of the program:
\`\`\`pascal
Var x, y: integer; { Global declarations: Level 0 }

procedure P(n: integer); { Enclosing scope: Global (Level 0) }
begin
     x := (n + 2) / (n - 3);
end;

procedure Q; { Enclosing scope: Global (Level 0) }
Var x, y: integer; { Local declarations: Level 1 }
begin   
    x := 3;
    y := 4; 
    P(y);
    Write(x); -- (1)
end;
 
begin { Main Program: Level 0 }
    x := 7;
    y := 8;
    Q; 
    Write(x); -- (2)
end.
\`\`\`

- Both procedure \`P\` and procedure \`Q\` are declared at the **outermost global level** (neither is nested inside the other).
- The identifier \`x\` in procedure \`P\` is not declared locally in \`P\`. Therefore, in static scoping, \`x\` in \`P\` refers to the **global variable \`x\`** declared at Level 0.

---

### 3. Step-by-Step Execution Trace
1. **Main Program Initial State**:
   - Global variables: $x = 7, y = 8$.
2. **Main Calls Procedure \`Q\`**:
   - Inside \`Q\`, local variables $x$ and $y$ are allocated on the activation record:
     $$x_{\\text{local}} = 3, \\quad y_{\\text{local}} = 4$$
3. **\`Q\` Calls Procedure \`P(y)\`**:
   - Argument passed is $y_{\\text{local}} = 4$, so formal parameter $n = 4$.
   - Procedure \`P\` executes:
     $$x := (n + 2) / (n - 3) = (4 + 2) / (4 - 3) = 6 / 1 = 6$$
   - Since \`P\`'s static parent is the global scope, this assignment updates the **global variable \`x\`**:
     $$x_{\\text{global}} \\leftarrow 6$$
   - Notice that \`Q\`'s local variable $x_{\\text{local}}$ remains completely untouched ($x_{\\text{local}} = 3$).
4. **Statement (1) in \`Q\`: \`Write(x)\`**:
   - Within \`Q\`, \`x\` refers to \`Q\`'s local variable:
     $$\\text{Output (1)} = 3$$
5. **Control Returns to Main**:
   - Statement (2) in \`Main\`: \`Write(x)\`.
   - In \`Main\`, \`x\` refers to the global variable $x_{\\text{global}}$, which was updated to $6$ by procedure \`P\`:
     $$\\text{Output (2)} = 6$$

---

### 4. Conclusion
The values printed by the write statements marked (1) and (2) are **3, 6 (Option A)**.`,
    images: []
  },

  "go:80374": {
    concept: "Compiler Design & Programming Languages - Dynamic Scoping Variable Resolution",
    markdown: `### 1. Principles of Dynamic Scoping
Under **dynamic scoping**:
- The binding of an identifier is resolved at **run time** by searching up the dynamic activation call stack.
- When an undeclared non-local variable is referenced, the runtime environment searches through active procedure activation records in reverse chronological order (from the most recent caller back toward \`Main\`).
- Whichever active activation record most recently declared the variable provides its storage binding.

---

### 2. Runtime Call Stack and Scoping Chain
Given execution path:
$$\\text{Main} \\longrightarrow \\text{Calls } Q \\longrightarrow \\text{Calls } P$$

1. **Main Activation Record**:
   - Declares global variables: $x_{\\text{global}} = 7, y_{\\text{global}} = 8$.
2. **\`Q\` Activation Record** (pushed onto stack):
   - Declares local variables: $x_Q = 3, y_Q = 4$.
3. **\`P\` Activation Record** (pushed onto stack):
   - Formal parameter $n = y_Q = 4$.
   - \`P\` executes statement:
     $$x := (n + 2) / (n - 3) = (4 + 2) / (4 - 3) = 6$$
   - \`P\` does not declare $x$ locally. Under **dynamic scoping**, the runtime inspects the caller's stack frame.
   - The immediate caller is **procedure \`Q\`**, which contains an active declaration of $x$ ($x_Q$).
   - Therefore, procedure \`P\` mutates **\`Q\`'s local variable $x_Q$**:
     $$x_Q \\leftarrow 6$$
   - The global variable $x_{\\text{global}}$ in \`Main\` remains unchanged ($x_{\\text{global}} = 7$).

---

### 3. Evaluating Output Statements
- **Statement (1) in \`Q\`: \`Write(x)\`**:
  - \`P\` returns control to \`Q\`.
  - \`Q\` prints its local variable $x_Q$, which was updated to $6$:
    $$\\text{Output (1)} = 6$$
- **Statement (2) in \`Main\`: \`Write(x)\`**:
  - \`Q\` terminates and its stack frame is popped.
  - Control returns to \`Main\`.
  - \`Main\` prints its variable $x_{\\text{global}}$, which retains its value $7$:
    $$\\text{Output (2)} = 7$$

---

### 4. Conclusion
Under dynamic scoping, the write statements print **6, 7 (Option B)**.`,
    images: []
  },

  "go:80377": {
    concept: "Linear Algebra & Optimization - Linear Inequalities in Two Variables",
    markdown: `### 1. Mathematical Definition of a Linear Inequality
Let $x$ and $y$ be variables, and let $a, b, c, \\dots$ be real constants:
1. **Inequality**: A mathematical statement asserting a relationship between two expressions using an inequality relation: $<, \\le, >, \\ge$, or $\\ne$. An equation using strict equality ($=$) is **not** an inequality.
2. **Linearity**: An expression is linear in variables $x$ and $y$ if:
   - Each variable appears strictly with power $1$ (first degree).
   - No products of variables (e.g., $xy$) appear.
   - No transcendental, roots, or nonlinear functions of variables appear.
   - The general canonical form of a linear inequality in two variables is:
     $$A x + B y \\;\\{\\le, <, \\ge, >\\}\\; C$$
     where $A, B, C$ are constants.

---

### 2. Evaluation of Candidate Choices
- **Option A: $ax + bcy = 0$**
  - Contains an equality sign ($=$); this is a **linear equation**, not an inequality.
- **Option B: $ax^2 + cy^2 = 21$**
  - Contains an equality sign ($=$) and quadratic second-degree terms ($x^2, y^2$); this is a **second-degree nonlinear equation** (ellipse/hyperbola).
- **Option C: $abx + a^2 y \\ge 15$**
  - Uses the inequality operator $\\ge$.
  - The coefficients are $A = ab$, $B = a^2$, and $C = 15$, all of which are scalar constants.
  - The variables $x$ and $y$ are both strictly of degree $1$ with no product terms.
  - This satisfies all requirements of a **linear inequality $\\implies$ Option C**.
- **Option D: $xy + ax \\ge 20$**
  - Contains the product term $xy$, which has degree $1 + 1 = 2$ (bilinear/nonlinear).

---

### 3. Conclusion
Therefore, the only linear inequality is **$abx + a^2 y \\ge 15$ (Option C)**.`,
    images: []
  },

  "go:80559": {
    concept: "Operations Research & Optimization - History & Etymology of the Simplex Method",
    markdown: `### 1. Historical Background of Linear Programming
The **Simplex Algorithm** was formulated in 1947 by the American mathematician **George B. Dantzig** to solve general linear programming problems of the form:
$$\\text{Maximize } c^T x \\quad \\text{subject to } Ax \\le b, \\; x \\ge 0$$

---

### 2. Etymology and Geometric Origin
- **Geometric Definition of a Simplex**:
  In geometry and algebraic topology, an $n$-dimensional **simplex** (plural: *simplices*) is the simplest possible polytope in $n$-dimensional Euclidean space, formed by the convex hull of $n + 1$ affinely independent points:
  - 0-simplex: Point
  - 1-simplex: Line segment
  - 2-simplex: Triangle
  - 3-simplex: Tetrahedron
- **Simplicial and Algebraic Complexes**:
  A collection of simplices joined together along their faces forms a **simplicial complex** (or **algebraic complex**).
- When Dantzig was developing the geometric framework for tracing adjacent extreme points across the feasible polytope, mathematician **Theodore Motzkin** suggested the name "Simplex Method" based on the underlying theory of simplices and algebraic complexes in polyhedral geometry.

---

### 3. Distractor Analysis
- **Option A (It is simple)**: Colloquial myth. The algorithm is conceptually sophisticated and computationally involved; Dantzig explicitly documented that it was not named for simplicity.
- **Option C (The simple pendulum works on this method)**: Wholly unrelated physics distraction.
- **Option D (No one thought of a better name)**: False historical claim.

---

### 4. Conclusion
The simplex method is so named because **it is based on the theory of algebraic complexes (Option B)**.`,
    images: []
  },

  "go:80562": {
    concept: "Numerical Analysis - Convergence Conditions of the Newton-Raphson Method",
    markdown: `### 1. Newton-Raphson Iteration Formula
The Newton-Raphson method finds roots of a differentiable function $f(x) = 0$ via the iteration scheme:
$$x_{k+1} = x_k - \\frac{f(x_k)}{f'(x_k)}$$

---

### 2. Evaluation of Candidate Statements

#### Statement A: "It converges always under all circumstances."
- **False**. Newton-Raphson is a local convergence method, not a global one.
- Convergence fails if:
  1. $f'(x_k) = 0$ (division by zero / horizontal tangent).
  2. The initial guess $x_0$ is outside the basin of attraction, causing divergence to infinity.
  3. The iteration enters an infinite periodic limit cycle (e.g., $f(x) = x^3 - 5x$ with $x_0 = 1$ oscillates between $1$ and $-1$).

#### Statement B: "It does not converge to a root where the second differential coefficient changes sign."
- **False**. A point where the second derivative changes sign ($f''(x) = 0$) is an **inflection point**.
- While an inflection point between the starting guess and the root can sometimes cause overshooting, the method frequently converges to roots located at inflection points.
- For example, for $f(x) = x^3 = 0$, $f''(0) = 0$ (second derivative changes sign across $x=0$), yet $x_{k+1} = x_k - x_k^3/(3x_k^2) = \\frac{2}{3}x_k$, which monotonically and steadily converges to the root $x = 0$.

#### Statement C: "It does not converge to a root where the second differential coefficient vanishes."
- **False**. If $f''(r) = 0$ at a simple root $r$ (e.g., $f(x) = x + x^5 = 0$ at $r = 0$, where $f'(0) = 1 \\ne 0$ and $f''(0) = 0$), Newton-Raphson converges exceptionally fast (quadratic or higher-order convergence).

---

### 3. Conclusion
Because Statements A, B, and C are all demonstrably false, the correct choice is **None of the above (Option D)**.`,
    images: []
  },

  "go:80572": {
    concept: "Computer Architecture - DMA vs Interrupt Bus Request Priority",
    markdown: `### 1. Bus Arbitration vs. Interrupt Requests
In a microprocessor system, external devices communicate with the CPU via two primary hardware signaling mechanisms:
1. **Bus Request (DMA via \`HOLD\`)**:
   A high-speed peripheral (e.g., disk controller or network interface) asserts \`HOLD\` to request control of the system address, data, and control buses to perform direct memory transfers without CPU intervention.
2. **Interrupt Request (\`INTR\`)**:
   A peripheral requests the CPU to pause normal program execution and branch to an Interrupt Service Routine (ISR).

---

### 2. Priority Resolution
When a bus (DMA) request and an interrupt request arrive simultaneously:
- **Time Sensitivity of DMA**: DMA transfers typically involve real-time high-bandwidth data streams. Delaying a DMA cycle can result in permanent device data overruns (buffer overflow and lost packets).
- **Servicing Boundary**:
  - The microprocessor checks and acknowledges a DMA \`HOLD\` request at the end of the **current machine cycle ($T$-state)** by asserting \`HLDA\` and tri-stating its buses.
  - Conversely, an interrupt request (\`INTR\`) is only checked and serviced at the end of the **entire multi-cycle instruction**.
- Therefore, the microprocessor invariably attends **first to the bus request**.

---

### 3. Conclusion
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:80576": {
    concept: "Computer Architecture - Memory-Mapped vs Isolated I/O Scheme Speed",
    markdown: `### 1. Memory-Mapped vs. Isolated (I/O-Mapped) I/O
- **I/O-Mapped (Isolated) I/O**:
  - Employs a separate I/O address space (e.g., Intel 8085/x86 \`IN\` and \`OUT\` instructions).
  - All data transfers are strictly channeled through the accumulator register ($A$), requiring multi-step instructions to move data from the peripheral to the accumulator, and then from the accumulator into memory.
- **Memory-Mapped I/O**:
  - Treats I/O port registers as standard memory locations within the unified address space.
  - The CPU can utilize its complete instruction set—including direct memory-to-register transfers, pointer indirect operations, indexed addressing modes, and block memory transfer instructions—directly on I/O ports.

---

### 2. Transfer Efficiency
Because memory-mapped I/O allows direct manipulation and transfer of device data using complex addressing modes and multi-byte registers without mandatory bottlenecking through the accumulator, data transfer routines can be executed with fewer instructions and higher throughput.
In classical computer architecture curricula, this efficiency advantage is recognized as making data transfers faster.

---

### 3. Conclusion
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:80579": {
    concept: "Data Structures - Binary Tree Reconstruction Ambiguity from Preorder and Postorder",
    markdown: `### 1. Binary Tree Traversals
- **Preorder Traversal**: $\\text{Root} \\longrightarrow \\text{Left Subtree} \\longrightarrow \\text{Right Subtree}$
- **Postorder Traversal**: $\\text{Left Subtree} \\longrightarrow \\text{Right Subtree} \\longrightarrow \\text{Root}$

---

### 2. Why Preorder + Postorder Traversals Are Ambiguous
To uniquely reconstruct a general binary tree, one must know which nodes belong to the left subtree and which belong to the right subtree:
- Preorder identifies the root as the first element.
- Postorder confirms the root as the last element.
- However, if an internal node has only **one child**, preorder and postorder cannot determine whether that child is a left child or a right child!

#### Counterexample:
Consider two distinct binary trees with nodes $A$ and $B$:
- **Tree 1**: Root $A$ with **left** child $B$.
  - Preorder: $A, B$
  - Postorder: $B, A$
- **Tree 2**: Root $A$ with **right** child $B$.
  - Preorder: $A, B$
  - Postorder: $B, A$

Both trees produce identical preorder ($A, B$) and postorder ($B, A$) sequences, making unique reconstruction impossible.
*(Unique reconstruction from preorder and postorder is possible if and only if the tree is strictly a **full binary tree**, where every internal node has exactly two children, or if an **inorder** traversal is provided).*

---

### 3. Conclusion
The statement is **FALSE** $\\implies$ **0**.`,
    images: []
  },

  "go:80588": {
    concept: "Data Structures - Tree Properties & Leaf Counts in General Binary Trees",
    markdown: `### 1. Formal Definition of a Binary Tree
In computer science, a **binary tree** is a hierarchical data structure defined recursively as a finite set of nodes that:
- Is either empty, or
- Consists of a root node and two disjoint binary trees, called the **left subtree** and the **right subtree**.

The only structural invariant is that **every node has at most two children** ($0, 1,$ or $2$ child nodes).

---

### 2. Evaluation of the Leaf Count Assertion
The statement asserts: *"If the number of leaves in a tree is not a power of 2, then the tree is not a binary tree."*

This assertion is demonstrably false:
- Only a **perfect binary tree** of height $h$ (where all interior nodes have two children and all leaves are at the same depth) has exactly $2^h$ leaves (a power of 2).
- A general binary tree can have **any arbitrary positive integer number of leaves**:
  - A degenerate binary tree (linked list structure) has exactly **$1$ leaf** ($2^0$).
  - A root with two leaf children has **$2$ leaves** ($2^1$).
  - A root whose left child has two leaves and right child has one leaf has **$3$ leaves** ($3$ is not a power of $2$, yet the tree is a valid binary tree).
  - Similarly, binary trees with $5, 6, 7, 9, 10, \\dots$ leaves are trivial to construct.

---

### 3. Conclusion
The statement is **FALSE** $\\implies$ **0**.`,
    images: []
  },

  "go:80589": {
    concept: "Theory of Computation - Kleene's Theorem: Regular Languages & Regular Expressions",
    markdown: `### 1. Kleene's Theorem (1956)
**Kleene's Theorem** is the foundational result establishing the mathematical equivalence between operational automata and algebraic language descriptors:
$$\\text{A language } L \\text{ is Regular} \\iff L \\text{ is accepted by a DFA/NFA} \\iff L \\text{ is described by a Regular Expression}$$

---

### 2. Converting Regular Languages to Regular Expressions
Given any regular language $L$, there exists a Deterministic Finite Automaton (DFA) $M = (Q, \\Sigma, \\delta, q_0, F)$ that accepts $L$.
We can always construct an equivalent regular expression from $M$ using algorithmic procedures such as:
1. **The State Elimination Algorithm**: Systematically eliminating internal states from a Generalized Transition Graph (GTG) until only start and accept states remain, yielding a regular expression.
2. **Arden's Theorem**: Setting up and solving linear language equations of the form $X = XA + B \\implies X = BA^*$.

Because every regular language is accepted by a finite automaton, and every finite automaton can be transformed into a regular expression, **any regular language has an equivalent regular expression**.

---

### 3. Conclusion
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:80590": {
    concept: "Theory of Computation - Non-Closure of Regular Sets Under Arbitrary Subsets",
    markdown: `### 1. Set Subsets vs. Language Closure
The statement asserts: *"All subsets of regular sets are regular."*

In language theory:
- A language over an alphabet $\\Sigma$ is simply any subset of $\\Sigma^*$:
  $$L \\subseteq \\Sigma^*$$
- The universal language $\\Sigma^*$ is recognized by a trivial 1-state DFA, and is therefore a **regular set**.
- If every subset of a regular set were regular, then every subset of $\\Sigma^*$ would be regular.
- That would imply that **all languages in existence are regular**!

---

### 2. Counterexample
Let $\\Sigma = \\{a, b\\}$.
- The set $\\Sigma^*$ is regular.
- Consider the classic subset:
  $$L = \\{a^n b^n \\mid n \\ge 0\\} \\subset \\Sigma^*$$
- While $\\Sigma^*$ is regular, $L$ is a well-known non-regular context-free language (proven via the Pumping Lemma).
- Furthermore, undecidable and non-recursively enumerable languages (such as the Halting Problem $A_{TM}$) are also subsets of $\\Sigma^*$, but are far outside the regular class.

---

### 3. Conclusion
The statement is **FALSE** $\\implies$ **0**.`,
    images: []
  },

  "go:80594": {
    concept: "Theory of Computation - NFA to Minimal DFA State Count Bounds",
    markdown: `### 1. Powerset (Subset) Construction Bounds
Let $M_N = (Q_N, \\Sigma, \\delta_N, q_0, F_N)$ be a Non-deterministic Finite Automaton (NFA) with $|Q_N| = n$ states.
- By Rabin-Scott subset construction, each state of the equivalent DFA corresponds to a subset of states of the NFA.
- The powerset $2^{Q_N}$ contains $2^n$ possible subsets.
- Therefore, the equivalent DFA has **at most** $2^n$ states in the worst case:
  $$|Q_D| \\le 2^n$$

---

### 2. Minimal DFA State Count
The statement asserts: *"A minimal DFA that is equivalent to an NDFA with $n$ nodes has always $2^n$ states."*

This is completely false:
1. **Upper Bound vs. Universal Truth**: $2^n$ is a worst-case theoretical upper bound (achieved only for specific worst-case language families, such as strings where the $n$-th symbol from the end is a $1$).
2. **Typical Case**: In the vast majority of practical NFAs, most subsets in $2^n$ are unreachable from the initial state, or are equivalent under the Myhill-Nerode equivalence relation.
3. **Extreme Counterexample**:
   - Consider an NFA with $n$ states that accepts the universal language $\\Sigma^*$.
   - The minimal equivalent DFA has **exactly 1 state**, regardless of how large $n$ is ($1 \\ll 2^n$).

---

### 3. Conclusion
The minimal DFA does not always have $2^n$ states.
The statement is **FALSE (Option B)**.`,
    images: []
  },

  "go:80599": {
    concept: "Theory of Computation - Non-Closure of Context-Free Languages Under Intersection",
    markdown: `### 1. Closure Properties of Context-Free Languages
The statement asserts: *"The intersection of two CFL's is also a CFL."*

Context-Free Languages ($CFL$) are recognized by Pushdown Automata (PDA), which possess a single LIFO stack storage mechanism.
- While CFLs are closed under union ($L_1 \\cup L_2$), concatenation ($L_1 L_2$), and Kleene star ($L^*$), they are **NOT closed under intersection**.

---

### 2. Classic Counterexample
Consider the following two languages over $\\Sigma = \\{a, b, c\\}$:
$$L_1 = \\{a^n b^n c^m \\mid n, m \\ge 0\\}$$
$$L_2 = \\{a^m b^n c^n \\mid m, n \\ge 0\\}$$

1. **$L_1$ is Context-Free**: A PDA pushes $a$'s onto the stack, pops an $a$ for each $b$, and simply consumes $c$'s without stack constraints.
2. **$L_2$ is Context-Free**: A PDA consumes $a$'s without stack constraints, pushes $b$'s onto the stack, and pops a $b$ for each $c$.
3. **Intersection $L_1 \\cap L_2$**:
   $$L_1 \\cap L_2 = \\{a^n b^n c^n \\mid n \\ge 0\\}$$
   This language requires simultaneously verifying that the number of $a$'s equals the number of $b$'s, AND the number of $b$'s equals the number of $c$'s.
   A single pushdown stack cannot compare three independent quantities. By the Pumping Lemma for CFLs, $\\{a^n b^n c^n\\}$ is strictly **Context-Sensitive and non-context-free**.

---

### 3. Conclusion
The statement is **FALSE (Option B)**.`,
    images: []
  },

  "go:80603": {
    concept: "Theory of Computation - Post's Theorem: Decidable / Recursive Language Characterization",
    markdown: `### 1. Formal Language Definitions
- **Recursively Enumerable (Turing-Recognizable)**: A language $L$ is recursively enumerable if there exists a Turing Machine $M$ such that for any string $w \\in L$, $M$ halts and accepts. (For $w \\notin L$, $M$ may either reject or loop infinitely).
- **Recursive (Turing-Decidable)**: A language $L$ is recursive if there exists a Turing Machine $M$ that **halts on all inputs**, accepting if $w \\in L$ and rejecting if $w \\notin L$.

---

### 2. Post's Theorem
**Theorem (Post, 1944; Sipser Theorem 4.22)**:
$$\\text{A language } A \\text{ is recursive (decidable)} \\iff A \\text{ is RE and } \\overline{A} \\text{ is RE.}$$

#### Proof of Construction:
Let $M_1$ be a Turing machine that accepts $A$, and let $M_2$ be a Turing machine that accepts $\\overline{A}$.
We construct a decider $M$ for $A$:
\`\`\`text
Decider M on input w:
1. Run M1 and M2 in parallel on input w (alternating execution steps).
2. If M1 halts and accepts w:
     Halt and ACCEPT.
3. If M2 halts and accepts w:
     Halt and REJECT.
\`\`\`
- Since every string $w$ belongs either to $A$ or to $\\overline{A}$ (and not both), exactly one of $M_1$ or $M_2$ must halt and accept after a finite number of steps.
- Therefore, decider $M$ is guaranteed to halt on all inputs, correctly deciding membership in $A$.

---

### 3. Conclusion
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:80606": {
    concept: "Theory of Computation - Undecidability of Turing Machine Acceptance Problem",
    markdown: `### 1. The Acceptance Problem for Turing Machines ($A_{TM}$)
The problem of determining whether an arbitrary Turing machine $M$ accepts an arbitrary input string $w$ is defined as the language:
$$A_{TM} = \\{\\langle M, w \\rangle \\mid M \\text{ is a Turing Machine that accepts input } w\\}$$

---

### 2. Proof of Undecidability (Turing, 1936)
Suppose for contradiction that there exists a decider $H$ for $A_{TM}$ such that:
$$H(\\langle M, w \\rangle) = \\begin{cases} \\text{Accept} & \\text{if } M \\text{ accepts } w \\\\ \\text{Reject} & \\text{if } M \\text{ does not accept } w \\end{cases}$$

Using $H$, construct a new Turing machine $D$:
\`\`\`text
Machine D on input <M>:
1. Run H on input <M, <M>>.
2. If H accepts, then REJECT / LOOP FOREVER.
3. If H rejects, then ACCEPT.
\`\`\`

Now run $D$ on its own description $\\langle D \\rangle$:
$$D(\\langle D \\rangle) = \\begin{cases} \\text{Accept} & \\text{if } D \\text{ does not accept } \\langle D \\rangle \\\\ \\text{Reject} & \\text{if } D \\text{ accepts } \\langle D \\rangle \\end{cases}$$
This produces a direct logical contradiction ($D$ accepts $\\langle D \\rangle \\iff D$ does not accept $\\langle D \\rangle$).
Therefore, no such decider $H$ can exist, proving that the acceptance problem is **undecidable**.

---

### 3. Conclusion
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:80609": {
    concept: "Databases - Functional Dependency Invariants & Many-to-One Tuples",
    markdown: `### 1. Formal Definition of Functional Dependency
Let $R$ be a relational schema, and let $X, Y \\subseteq R$.
A relation instance $r(R)$ satisfies the **functional dependency** $X \\to Y$ if and only if for every pair of tuples $t_1, t_2 \\in r$:
$$t_1[X] = t_2[X] \\implies t_1[Y] = t_2[Y]$$

In words: if two tuples have the same value for attribute $X$, they must have the same value for attribute $Y$.

---

### 2. Analysis of the Given Tuples
We are given schema $(X, Y)$ satisfying $X \\to Y$ with two tuples:
$$t_1 = \\langle 1, 2 \\rangle \\implies t_1[X] = 1, \\; t_1[Y] = 2$$
$$t_2 = \\langle 2, 2 \\rangle \\implies t_2[X] = 2, \\; t_2[Y] = 2$$

Let us test the condition:
- Are the $X$-values identical?
  $$t_1[X] = 1 \\ne 2 = t_2[X]$$
- Because $t_1[X] \\ne t_2[X]$, the antecedent of the implication is false ($F \\implies P$ is vacuously true).
- Functional dependency $X \\to Y$ permits **many-to-one** relationships: multiple distinct $X$ values (here $1$ and $2$) are fully allowed to map to the same $Y$ value ($2$).
- (A violation would only occur if there were two tuples with identical $X$ but different $Y$, e.g., $\\langle 1, 2 \\rangle$ and $\\langle 1, 3 \\rangle$).

---

### 3. Conclusion
Both tuples $\\langle 1, 2 \\rangle$ and $\\langle 2, 2 \\rangle$ can simultaneously exist in relation $r$.
The statement is **TRUE** $\\implies$ **1**.`,
    images: []
  },

  "go:82548": {
    concept: "Numerical Analysis - Lagrange Polynomial Interpolation",
    markdown: `### 1. Lagrange Interpolation Formula
Given $n + 1$ data points $(x_0, y_0), (x_1, y_1), \\dots, (x_n, y_n)$, the interpolating polynomial $P(x)$ is given by:
$$P(x) = \\sum_{i=0}^n L_i(x) \\cdot y_i$$
where each Lagrange basis polynomial $L_i(x)$ is defined as:
$$L_i(x) = \\prod_{j=0, j \\ne i}^n \\frac{x - x_j}{x_i - x_j}$$

---

### 2. Given Data Points
We are given four data points:
- $(x_0, y_0) = (300, 2.4771)$
- $(x_1, y_1) = (304, 2.4829)$
- $(x_2, y_2) = (305, 2.4843)$
- $(x_3, y_3) = (307, 2.4871)$

We wish to evaluate $f(301)$ at $x = 301$.

---

### 3. Calculating Lagrange Basis Coefficients at $x = 301$
- **For $i = 0$ ($x_0 = 300$)**:
  $$L_0(301) = \\frac{(301 - 304)(301 - 305)(301 - 307)}{(300 - 304)(300 - 305)(300 - 307)} = \\frac{(-3)(-4)(-6)}{(-4)(-5)(-7)} = \\frac{-72}{-140} = \\frac{18}{35} \\approx 0.5142857$$

- **For $i = 1$ ($x_1 = 304$)**:
  $$L_1(301) = \\frac{(301 - 300)(301 - 305)(301 - 307)}{(304 - 300)(304 - 305)(304 - 307)} = \\frac{(1)(-4)(-6)}{(4)(-1)(-3)} = \\frac{24}{12} = 2.0$$

- **For $i = 2$ ($x_2 = 305$)**:
  $$L_2(301) = \\frac{(301 - 300)(301 - 304)(301 - 307)}{(305 - 300)(305 - 304)(305 - 307)} = \\frac{(1)(-3)(-6)}{(5)(1)(-2)} = \\frac{18}{-10} = -1.8$$

- **For $i = 3$ ($x_3 = 307$)**:
  $$L_3(301) = \\frac{(301 - 300)(301 - 304)(301 - 305)}{(307 - 300)(307 - 304)(307 - 305)} = \\frac{(1)(-3)(-4)}{(7)(3)(2)} = \\frac{12}{42} = \\frac{2}{7} = \\frac{10}{35} \\approx 0.2857143$$

*Weight Check*:
$$\\sum L_i(301) = \\frac{18}{35} + 2.0 - 1.8 + \\frac{10}{35} = \\frac{28}{35} + 0.2 = 0.8 + 0.2 = 1.0$$

---

### 4. Evaluating $f(301)$
$$f(301) = L_0(301) y_0 + L_1(301) y_1 + L_2(301) y_2 + L_3(301) y_3$$
$$f(301) = \\frac{18}{35}(2.4771) + 2(2.4829) - 1.8(2.4843) + \\frac{10}{35}(2.4871)$$
$$f(301) = \\frac{18 \\times 2.4771 + 10 \\times 2.4871}{35} + 4.9658 - 4.47174$$
$$f(301) = \\frac{44.5878 + 24.8710}{35} + 0.49406 = \\frac{69.4588}{35} + 0.49406$$
$$f(301) = 1.98453714 + 0.49406 = 2.47859714\\dots$$

---

### 5. Conclusion
Using Lagrange's interpolation formula, $f(301) \\approx \\mathbf{2.4786}$ (stored as **2.478597**).`,
    images: []
  },

  "go:82550": {
    concept: "Numerical Analysis - Simpson's 1/3rd Rule Numerical Integration",
    markdown: `### 1. Problem Formulation
We are asked to evaluate the definite integral:
$$V = \\int_0^1 \\frac{1}{1 + x}\\, dx$$
using **Simpson's 1/3rd rule** with step size $h = 0.25$, correct to three decimal places.

*(Note: The exact analytical value is $\\int_0^1 \\frac{1}{1+x} dx = [\\ln(1+x)]_0^1 = \\ln 2 \\approx 0.693147$).*

---

### 2. Discretization Table
With $a = 0, b = 1,$ and $h = 0.25$, the number of subintervals is $n = (1 - 0)/0.25 = 4$ (an even integer, satisfying Simpson's rule requirements):

$$\\begin{array}{c|c|l}
\\hline
i & x_i & y_i = f(x_i) = \\frac{1}{1 + x_i} \\\\
\\hline
0 & 0.00 & y_0 = \\frac{1}{1} = 1.00000 \\\\
1 & 0.25 & y_1 = \\frac{1}{1.25} = 0.80000 \\\\
2 & 0.50 & y_2 = \\frac{1}{1.50} = \\frac{2}{3} \\approx 0.66667 \\\\
3 & 0.75 & y_3 = \\frac{1}{1.75} = \\frac{4}{7} \\approx 0.57143 \\\\
4 & 1.00 & y_4 = \\frac{1}{2.00} = 0.50000 \\\\
\\hline
\\end{array}$$

---

### 3. Simpson's 1/3rd Rule Calculation
Simpson's composite formula for $n = 4$ subintervals:
$$V \\approx \\frac{h}{3} \\left[ (y_0 + y_4) + 4(y_1 + y_3) + 2(y_2) \\right]$$

Substitute the computed values:
1. Extremes sum:
   $$y_0 + y_4 = 1.00000 + 0.50000 = 1.50000$$
2. Odd terms sum:
   $$4(y_1 + y_3) = 4(0.80000 + 0.57143) = 4(1.37143) = 5.48572$$
3. Even terms sum:
   $$2(y_2) = 2(0.66667) = 1.33334$$
4. Bracket total:
   $$\\text{Sum} = 1.50000 + 5.48572 + 1.33334 = 8.31906$$
5. Multiply by $\\frac{h}{3} = \\frac{0.25}{3} = \\frac{1}{12}$:
   $$V \\approx \\frac{8.31906}{12} \\approx 0.693255$$

Rounding to three decimal places:
$$V \\approx \\mathbf{0.693}$$

---

### 4. Conclusion
The value of the integral correct to three decimal places is **0.693**.`,
    images: []
  },

  "go:82556": {
    concept: "Digital Logic - XOR Algebraic Properties & Self-Inverse Identity",
    markdown: `### 1. Boolean XOR Operator Properties
The Exclusive-OR (XOR) operator $\\oplus$ exhibits the following algebraic properties:
1. **Commutativity**:
   $$X \\oplus Y = Y \\oplus X$$
2. **Associativity**:
   $$(X \\oplus Y) \\oplus Z = X \\oplus (Y \\oplus Z)$$
3. **Self-Inverse (Nilpotence on Equality)**:
   Any variable XORed with itself equals $0$:
   $$X \\oplus X = X\\overline{X} + \\overline{X}X = 0 + 0 = 0$$
4. **Identity Element**:
   Any variable XORed with $0$ equals itself:
   $$X \\oplus 0 = X\\overline{0} + \\overline{X}(0) = X(1) + 0 = X$$

---

### 2. Algebraic Reduction of the Expression
We are given:
$$F = A \\oplus B \\oplus A$$

Apply commutativity to group identical literals together:
$$F = (A \\oplus A) \\oplus B$$

Apply the self-inverse property ($A \\oplus A = 0$):
$$F = 0 \\oplus B$$

Apply the identity element property ($0 \\oplus B = B$):
$$F = B$$

---

### 3. Distractor Analysis
- **Option A ($AB + \\overline{A}\\,\\overline{B}$)**: This is the XNOR (equivalence) function $A \\odot B = \\overline{A \\oplus B}$.
- **Option B ($\\overline{A}B + A\\overline{B}$)**: This is the 2-variable XOR function $A \\oplus B$.
- **Option C ($B$)**: Matches the simplified result $B$ exactly.
- **Option D ($\\overline{A}$)**: Incorrect Boolean reduction.

---

### 4. Conclusion
Therefore, the expression is equivalent to **$B$ (Option C)**.`,
    images: []
  },

  "go:82607": {
    concept: "Digital Logic - 4-Bit LFSR Shift Register State Transition",
    markdown: `### 1. Circuit Architecture
The circuit consists of four D-type flip-flops ($A, B, C, D$) connected as a shift register:
- State vector: $(Q_A, Q_B, Q_C, Q_D)$.
- Shift connections:
  $$D_B = Q_A, \\quad D_C = Q_B, \\quad D_D = Q_C$$
- Serial feedback input into the first stage ($D_A$) is driven by an XOR gate receiving inputs from $Q_C$ and $Q_D$:
  $$D_A = Q_C \\oplus Q_D$$

---

### 2. State Evolution Trace
We are provided the sequence for the first three clock pulses:
1. **Initial State**:
   $$Q_A Q_B Q_C Q_D = 1\\;1\\;1\\;1$$
   Feedback: $D_A = Q_C \\oplus Q_D = 1 \\oplus 1 = 0$
2. **After 1st Clock Pulse**:
   $$Q_A Q_B Q_C Q_D = 0\\;1\\;1\\;1$$
   Feedback: $D_A = Q_C \\oplus Q_D = 1 \\oplus 1 = 0$
3. **After 2nd Clock Pulse**:
   $$Q_A Q_B Q_C Q_D = 0\\;0\\;1\\;1$$
   Feedback: $D_A = Q_C \\oplus Q_D = 1 \\oplus 1 = 0$
4. **After 3rd Clock Pulse**:
   $$Q_A Q_B Q_C Q_D = 0\\;0\\;0\\;1$$
   Feedback: $D_A = Q_C \\oplus Q_D = 0 \\oplus 1 = 1$

---

### 3. State After the 4th Clock Pulse
Applying the 4th clock transition:
- $Q_A$ captures $D_A = 1$
- $Q_B$ captures previous $Q_A = 0$
- $Q_C$ captures previous $Q_B = 0$
- $Q_D$ captures previous $Q_C = 0$

$$\\mathbf{Q_A Q_B Q_C Q_D = 1\\;0\\;0\\;0}$$

---

### 4. Conclusion
The state after the fourth clock pulse is **1000 (Option D)**.`,
    images: []
  },

  "go:82656": {
    concept: "Analog Circuits - Wien Bridge Oscillator Barkhausen Oscillation Condition",
    markdown: `### 1. Wien Bridge Oscillator Principle
A Wien Bridge oscillator consists of an operational amplifier in a non-inverting amplifier configuration paired with a frequency-selective lead-lag $RC$ bridge feedback network:
- **Resonant Frequency**:
  At the natural frequency:
  $$f_0 = \\frac{1}{2\\pi RC}$$
  the series-parallel $RC$ network produces **zero phase shift** between the amplifier output and the non-inverting input ($+$).
- **Network Attenuation (Feedback Factor $\\beta$)**:
  Evaluating the transfer function of the voltage divider formed by the series $RC$ and parallel $RC$ branches at $\\omega_0 = 1/(RC)$:
  $$\\beta = \\frac{Z_p}{Z_s + Z_p} = \\frac{1}{3}$$
  Thus, the bridge attenuates the signal by a factor of $3$.

---

### 2. Barkhausen Criterion for Oscillation
For sustained sinusoidal oscillations, the total loop gain $A_v \\beta$ must satisfy **Barkhausen's criteria**:
1. Loop phase shift must be an integer multiple of $360^\\circ$ ($0^\\circ$).
2. Loop gain magnitude must be at least unity:
   $$|A_v \\cdot \\beta| \\ge 1 \\implies A_v \\cdot \\frac{1}{3} \\ge 1 \\implies A_v \\ge 3$$

---

### 3. Closed-Loop Gain and Resistor Ratio
For an op-amp in non-inverting configuration with feedback resistor $R_2$ and ground resistor $R_1$:
$$A_v = 1 + \\frac{R_2}{R_1}$$

Substituting into the gain condition:
$$1 + \\frac{R_2}{R_1} \\ge 3 \\implies \\frac{R_2}{R_1} \\ge 2$$

- For borderline steady-state sinusoidal oscillations with constant amplitude, $\\frac{R_2}{R_1} = 2$.
- In practical oscillator circuits, to initiate oscillations spontaneously from thermal noise, the gain is set slightly higher than $3$ (any value $\\frac{R_2}{R_1} \\ge 2$, with non-linear automatic gain control or diode limiting to stabilize amplitude).
- In the official GATE 1987 answer key, **Option D (Any value)** is registered.

---

### 4. Conclusion
Therefore, to sustain oscillations the theoretical ratio must satisfy $R_2/R_1 \\ge 2$, with **Option D** accepted in the official key.`,
    images: []
  },

  "go:82698": {
    concept: "Digital Logic - K-Map POS Minimization & NOR-NOR Implementation",
    markdown: `### 1. Reading the Karnaugh Map
We are given a 3-variable K-map with row variable $c$ ($c=0, 1$) and column variables $ab$ ($00, 01, 11, 10$):
$$\\begin{array}{c|c|c|c|c}
c \\backslash ab & 00 & 01 & 11 & 10 \\\\
\\hline
0 & 0 & 0 & 1 & 1 \\\\
1 & 0 & 1 & 1 & 1 \\\\
\\hline
\\end{array}$$

---

### 2. Product-of-Sums (POS) Minimization
Because the function must be implemented using **only NOR gates**, we group the **$0$s** of the K-map to determine the minimal Product-of-Sums (POS) expression:
The $0$-cells are:
- $(c=0, ab=00) \\implies M_0$
- $(c=0, ab=01) \\implies M_2$
- $(c=1, ab=00) \\implies M_1$

We form two prime implicant maxterm groups:
1. **Group 1 (Vertical pair of $0$s in column $ab = 00$)**:
   - Covers cells $(0, 00)$ and $(1, 00)$.
   - $a = 0$ and $b = 0$, while $c$ varies.
   - Maxterm sum: $(a + b)$.
2. **Group 2 (Horizontal pair of $0$s in row $c = 0$, columns $00$ and $01$)**:
   - Covers cells $(0, 00)$ and $(0, 01)$.
   - $a = 0$ and $c = 0$, while $b$ varies.
   - Maxterm sum: $(a + c)$.

Combining these maxterms gives the minimal POS expression:
$$f = (a + b)(a + c)$$

*(Verification via Boolean distributive law: $(a + b)(a + c) = a + bc$, which matches minterms $m_3, m_4, m_5, m_6, m_7$).*

---

### 3. Realization with NOR Gates
A 2-level NOR-NOR logic circuit directly implements a Product-of-Sums (POS) expression:
- **Level 1**:
  - NOR Gate 1 with inputs $a$ and $b$ produces: $\\overline{a + b}$
  - NOR Gate 2 with inputs $a$ and $c$ produces: $\\overline{a + c}$
- **Level 2**:
  - Output NOR Gate combines the two intermediate inverted sums:
    $$f = \\overline{\\overline{a + b} + \\overline{a + c}}$$
  - By De Morgan's Law:
    $$f = \\overline{\\overline{a + b}} \\cdot \\overline{\\overline{a + c}} = (a + b)(a + c)$$

This exactly matches the gate schematic in **Option D**.

---

### 4. Conclusion
Therefore, the NOR gate realization of the given K-map is **Option D**.`,
    images: []
  },

  "go:80571": {
    concept: "Calculus - Intermediate Value Theorem (Bolzano's Theorem) & Root Bracketing",
    markdown: `### 1. Intermediate Value Theorem (Bolzano's Theorem)
Let $f: [x_i, x_{i+1}] \\to \\mathbb{R}$ be a real-valued continuous function on the closed interval $[x_i, x_{i+1}]$.
- **Bolzano's Root Theorem**: If the function values at the endpoints have opposite signs:
  $$f(x_i) \\cdot f(x_{i+1}) < 0$$
  then there exists at least one real number $c$ strictly inside the open interval $(x_i, x_{i+1})$ such that:
  $$f(c) = 0$$
- Geometrically, because the curve of a continuous function is unbroken and continuous, it cannot transition from a negative value to a positive value (or vice-versa) without crossing the horizontal $x$-axis. Hence, there must exist at least one root between $x_i$ and $x_{i+1}$.

---

### 2. Application in Numerical Computing
This fundamental property is the theoretical basis for bracketed root-finding numerical algorithms:
- **Bisection Method**: Repeatedly halves the interval $[x_i, x_{i+1}]$ that satisfies $f(x_i) \\cdot f(x_{i+1}) < 0$, guaranteeing convergence to a root.
- **Regula-Falsi (False Position) Method**: Interpolates linear secants between bracketed endpoints.

---

### 3. Distractor Analysis
- **Option B (There need not be a root of f(x) between x_i and x_{i+1})**: Contradicts the Intermediate Value Theorem for continuous functions.
- **Options C & D (The fourth derivative of f(x) vanishes at x_i / x_{i+1})**: Completely unrelated distractors; higher-order derivatives have no bearing on sign changes or root existence.

---

### 4. Conclusion
Therefore, if $f(x_i) \\cdot f(x_{i+1}) < 0$, **there must be a root of $f(x)$ between $x_i$ and $x_{i+1}$ (Option A)**.`,
    images: []
  }
};

export function applyChunkVin17() {
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-vin-17.json");
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));

  // 1. Mark accepted in chunk file
  for (const q of chunkData.questions) {
    if (CHUNK_CSE_VIN_17_SOLUTIONS[q.uid]) {
      q.status = "ACCEPTED";
      q.solutionMarkdown = CHUNK_CSE_VIN_17_SOLUTIONS[q.uid].markdown;
      q.conceptSummary = CHUNK_CSE_VIN_17_SOLUTIONS[q.uid].concept;
    }
  }
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
  console.log(`Updated ${chunkPath} with ACCEPTED status and solutions.`);

  // 2. Inject into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");

  const targetMarker = "export function applyAuthenticPatches() {";
  const injectionEntries = Object.entries(CHUNK_CSE_VIN_17_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"go:80366": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `\n  // CHUNK-CSE-VIN-17\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
      fs.writeFileSync(patchFile, updatedContent, "utf8");
      console.log(`Injected 23 patches into ${patchFile}.`);
    } else {
      console.error(`Marker "${targetMarker}" not found in ${patchFile}`);
    }
  } else {
    console.log("Patches already present in patch-authentic-solutions.mjs");
  }

  // 3. Update manifest.json
  const manifestPath = path.resolve("data/solutions/chunks/manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.chunks["CHUNK-CSE-VIN-17"]) {
      manifest.chunks["CHUNK-CSE-VIN-17"].status = "COMPLETED";
      manifest.chunks["CHUNK-CSE-VIN-17"].completedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`Updated manifest.json: CHUNK-CSE-VIN-17 marked COMPLETED.`);
    }
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  execSync("node scripts/pipeline/patch-authentic-solutions.mjs", { stdio: "inherit" });
  console.log("CHUNK-CSE-VIN-17 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-vin-17")) {
  applyChunkVin17();
}
