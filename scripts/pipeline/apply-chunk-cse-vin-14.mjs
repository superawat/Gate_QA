import fs from "fs";
import path from "path";
import { applyAuthenticPatches } from "./patch-authentic-solutions.mjs";

export const CHUNK_CSE_VIN_14_SOLUTIONS = {
  "go:560": {
    concept: "Computer Networks - Asynchronous Serial Communication & Character Framing",
    markdown: `### 1. Operational Principle of Asynchronous Serial Transmission (UART)
In asynchronous serial communication (such as RS-232), characters are transmitted at arbitrary, irregular intervals without a shared continuous synchronous clock line between the transmitter and receiver.
- During idle periods when no characters are being sent, the physical communication line remains in a constant logic 1 (**MARK** state).

---

### 2. Functional Purpose of Start and Stop Bits
- **Start Bit**: 
  When the transmitter has a character to send, it transitions the line from logic 1 to logic 0 (**SPACE** state) for exactly one bit duration. This high-to-low transition acts as an explicit timing trigger for the receiver's internal baud-rate clock, allowing the receiver to establish **bit synchronization** and sample each subsequent data bit at its midpoint.
- **Stop Bit(s)**:
  Following the transmission of data bits (and optional parity), the line is driven back to logic 1 (**MARK** state) for a specified duration (1, 1.5, or 2 bit times). This guarantees that the transmission line returns to the idle state before the next frame begins, ensuring that the leading falling edge of the subsequent start bit can be unambiguously detected.

---

### 3. Distractor Analysis
- **Option A & B (Error detection / Error correction)**: Start and stop bits are fixed framing markers (always 0 and 1) that do not depend on data payload content. Error detection is performed by parity bits or checksums/CRCs, not by start/stop bits.
- **Option D (Slowing down the communications)**: Although framing bits introduce protocol overhead that slightly reduces effective data throughput, this is an unavoidable physical consequence, not their engineering purpose.

---

### 4. Conclusion
Therefore, start and stop bits are used in serial communication for **Synchronization (Option C)**.`,
    images: []
  },

  "go:561": {
    concept: "Algorithms & Complexity Theory - NP-Hard vs Polynomial Time Problems",
    markdown: `### 1. Definitions and Complexity Classes
- A computational problem is **NP-hard** if every problem in NP can be reduced to it in polynomial time ($L' \\le_P L$ for all $L' \\in \\text{NP}$).
- A problem belongs to class **P** if it can be solved by a deterministic algorithm in polynomial time $O(n^k)$. Under the standard foundational assumption $\\text{P} \\neq \\text{NP}$, problems in P are not NP-hard.

---

### 2. Evaluation of Candidate Problems
- **A. Hamiltonian Circuit Problem**: 
  Determining whether a graph contains a closed loop visiting each vertex exactly once is one of Karp's 21 NP-complete problems (polynomial reduction from Vertex Cover). Hence, it is **NP-hard**.
- **B. The 0/1 Knapsack Problem**:
  Given weights, values, and a capacity constraint, choosing items to maximize value without exceeding capacity is NP-hard. Dynamic programming provides a pseudo-polynomial time algorithm $O(nW)$, but the problem remains weakly **NP-hard**.
- **C. Finding Bi-connected Components of a Graph**:
  An undirected graph can be decomposed into its maximal biconnected components (blocks without articulation points) in linear time using Hopcroft and Tarjan's Depth-First Search (DFS) algorithm. 
  By tracking vertex discovery times $d[u]$ and lowest reachable ancestors $low[u]$:
  $$T(V, E) = \\Theta(V + E) \\text{ linear deterministic time}$$
  Because this algorithm runs in polynomial (linear) time, finding biconnected components is in **P** and is **not NP-hard**.
- **D. The Graph Coloring Problem**:
  Deciding whether a graph is $k$-colorable for $k \\ge 3$ is NP-complete, and computing the chromatic number $\\chi(G)$ is **NP-hard**.

---

### 3. Conclusion
Therefore, the problem that is not NP-hard is **Finding bi-connected components of a graph (Option C)**.`,
    images: []
  },

  "go:562": {
    concept: "Data Structures - Structural Invariants of 2-3 Trees & Internal Node Bounds",
    markdown: `### 1. Structural Definition of a 2-3 Tree
A 2-3 tree is a balanced multi-way search tree (a B-tree of order 3) characterized by two fundamental properties:
1. Every internal (non-leaf) node has either **2 or 3 children**.
2. All leaves reside at the **exact same depth** $h$ (where root is at depth $0$).

---

### 2. Height Bounds for $L = 9$ Leaves
Let $h$ denote the height of the tree (depth of the leaves).
Because every internal node has a branching factor $b \\in \\{2, 3\\}$, the number of leaves $L$ at depth $h$ is strictly bounded by:
$$2^h \\le L \\le 3^h \\implies 2^h \\le 9 \\le 3^h$$
- If $h = 1$: $2^1 = 2 \\le 9 \\le 3 = 3^1$ (impossible).
- If $h = 2$: $2^2 = 4 \\le 9 \\le 9 = 3^2$ (**Valid**: achievable when all nodes branch with factor 3).
- If $h = 3$: $2^3 = 8 \\le 9 \\le 27 = 3^3$ (**Valid**: achievable since $8 \\le 9$).
- If $h \\ge 4$: $2^4 = 16 > 9$ (impossible, as minimum leaves would exceed 9).

Thus, the tree height $h$ must be either **2** or **3**.

---

### 3. Analysis for Height $h = 2$
- Root is at level 0. To reach 9 leaves at level 2, the root must have 3 children at level 1 (since 2 children at level 1 could produce at most $2 \\times 3 = 6$ leaves).
- Level 1 contains 3 internal nodes. To produce $L = 9$ leaves at level 2, each of the 3 internal nodes must branch into exactly 3 children ($3 + 3 + 3 = 9$).
- Total number of internal nodes:
  $$\\text{Internal Nodes} = \\text{Root (level 0)} + \\text{Level 1} = 1 + 3 = \\mathbf{4}$$
- Thus, **4 internal nodes** is achievable $\\implies$ **Option A**.

---

### 4. Analysis for Height $h = 3$
- Root is at level 0.
- Level 1 must contain at least 2 nodes (if root has 2 children) and at most 3 nodes.
- Consider level 2:
  - If root has 2 children and each has 2 children, level 2 contains $2 \\times 2 = 4$ internal nodes.
  - For these 4 nodes at level 2 to produce 9 leaves at level 3, three nodes can have 2 children and one node can have 3 children:
    $$2 + 2 + 2 + 3 = 9 \\text{ leaves}$$
  - Total number of internal nodes:
    $$\\text{Internal Nodes} = \\text{Root (1)} + \\text{Level 1 (2)} + \\text{Level 2 (4)} = 1 + 2 + 4 = \\mathbf{7}$$
- What about other node counts at height $h = 3$?
  - If level 2 had 5 internal nodes, the minimum leaves would be $5 \\times 2 = 10 > 9$, which exceeds 9.
  - If level 1 had 3 nodes (root has 3 children), minimum nodes at level 2 would be $3 \\times 2 = 6$, yielding at least $6 \\times 2 = 12 > 9$ leaves.
- Thus, for height $h = 3$, the only valid internal node count is **7** $\\implies$ **Option D**.

---

### 5. Conclusion
Therefore, the number of internal nodes could be **4 (Option A)** or **7 (Option D)**.`,
    images: []
  },

  "go:564": {
    concept: "Operating Systems - Counting Semaphore State Progression",
    markdown: `### 1. Operational Semantics of Semaphore Primitives
A counting semaphore $S$ is an integer synchronization variable accessed through two standard atomic primitives:
- $P(S)$ (also denoted \`wait\`): Decrements the semaphore value by 1 ($S \\leftarrow S - 1$).
- $V(S)$ (also denoted \`signal\`): Increments the semaphore value by 1 ($S \\leftarrow S + 1$).

---

### 2. Algebraic Calculation
We are given:
- Initial semaphore value: $S_{\\text{initial}} = 7$
- Number of completed $P$ operations: $n_P = 20$
- Number of completed $V$ operations: $n_V = 15$

The net change $\\Delta S$ in the semaphore value is:
$$\\Delta S = n_V - n_P = 15 - 20 = -5$$

The final semaphore value $S_{\\text{final}}$ is:
$$S_{\\text{final}} = S_{\\text{initial}} + \\Delta S = 7 + (-5) = 2$$

---

### 3. Distractor Analysis
- **Option A (42)**: Spurious result of arithmetic multiplication.
- **Option C (7)**: Assumes no net effect occurred.
- **Option D (12)**: Erroneous calculation treating $P$ operations as positive and $V$ as negative: $7 + 20 - 15 = 12$.

---

### 4. Conclusion
Therefore, the resulting value of the semaphore is **2 (Option B)**.`,
    images: []
  },

  "go:568": {
    concept: "Operating Systems - Deadlock Prevention & Resource Allocation Bounds",
    markdown: `### 1. System Parameters and Demand Model
- Total number of available tape drives: $R = 6$
- Number of competing processes: $n$
- Maximum resource demand of each process: $M_i = 3$ tape drives for each $i \\in \\{1, 2, \\dots, n\\}$

---

### 2. Deadlock Condition and Pigeonhole Principle
To create a state of deadlock, every process must be allocated as many resources as possible without being able to complete:
$$\\text{Max Hold without completion} = M_i - 1 = 3 - 1 = 2 \\text{ tape drives per process}$$

The total number of tape drives allocated across all $n$ processes in this worst-case deadlock scenario is:
$$\\sum_{i=1}^n (M_i - 1) = 2n$$

To guarantee that the system is **deadlock-free**, the total number of tape drives $R$ must exceed this worst-case allocation by at least 1, ensuring that at least one process can acquire its remaining requested drive, finish execution, and release all its held resources:
$$R \\ge 2n + 1$$
$$6 \\ge 2n + 1 \\implies 2n \\le 5 \\implies n \\le 2.5$$

Since the number of processes $n$ must be an integer:
$$n_{\\max} = \\lfloor 2.5 \\rfloor = 2$$

---

### 3. Boundary Case Verification
- If $n = 3$: Each of the 3 processes could hold 2 tape drives, using all $3 \\times 2 = 6$ drives. Each process then requests 1 additional drive to reach its claim of 3. With 0 free tape drives remaining, a circular wait is established and the system deadlocks!
- If $n = 2$: The maximum resources held by both processes is $2 \\times 2 = 4$ drives. This leaves $6 - 4 = 2$ free drives, which is strictly sufficient to satisfy the remaining claim of either process (each needing at most $3 - 2 = 1$ drive).

---

### 4. Conclusion
Therefore, the maximum value of $n$ for which the system is guaranteed to be deadlock-free is **2 (Option A)**.`,
    images: []
  },

  "go:569": {
    concept: "Operating Systems - SPOOLing (Simultaneous Peripheral Operations On-Line)",
    markdown: `### 1. Conceptual Definition of SPOOLing
**SPOOLing** (Simultaneous Peripheral Operations On-Line) is an operating system mechanism where data destined for slow, dedicated, non-shareable peripheral devices is temporarily staged on a fast, randomly accessible intermediate secondary storage buffer (such as magnetic disk).

---

### 2. Evaluation of Options
- **Option C (A line printer used to print the output of a number of jobs)**:
  A line printer is a classic dedicated device; it cannot interleave individual lines from multiple concurrent running jobs without corrupting document output. 
  The OS solves this by spooling: each process writes its entire output to a disk file. When a job completes, a print spooler daemon streams the entire file sequentially to the line printer. Thus, the line printer is the textbook archetype of a spooled device.
- **Option A (Interactive terminal)**:
  An interactive input terminal requires direct, low-latency character-by-character communication with the executing program, not offline batch spooling.
- **Option B (Secondary memory in virtual memory)**:
  Secondary memory in a virtual memory system functions as a swap/paging store managed by page replacement policies and hardware MMU translation, which is distinct from peripheral spooling.

---

### 3. Conclusion
Therefore, an example of a spooled device is **Option C (A line printer used to print the output of a number of jobs)**.`,
    images: []
  },

  "go:570": {
    concept: "Compiler Design - FOLLOW Sets in Leftmost vs Rightmost Derivations",
    markdown: `### 1. Definitions of Sentential Forms & FOLLOW Sets
Let $G = (V, \\Sigma, R, S)$ be a context-free grammar.
- **$\\text{FOLLOW}(A)$**: The set of terminals $a \\in \\Sigma$ that can appear immediately to the right of non-terminal $A$ in *any* sentential form derived from start symbol $S$ ($S \\Rightarrow^* \\alpha A a \\beta$).
- **$\\text{LFOLLOW}(A)$**: The set of terminals that can appear immediately to the right of $A$ in any *left-sentential form* (derived strictly via leftmost derivations $S \\Rightarrow_{\\text{lm}}^* \\alpha A \\gamma$).
- **$\\text{RFOLLOW}(A)$**: The set of terminals that can appear immediately to the right of $A$ in any *right-sentential form* (derived strictly via rightmost derivations $S \\Rightarrow_{\\text{rm}}^* \\alpha A \\gamma$).

---

### 2. Statement A Analysis: $\\text{FOLLOW}(A)$ and $\\text{LFOLLOW}(A)$ may be different
In a leftmost derivation, the leftmost non-terminal is always expanded first. 
Consider the grammar:
$$S \\to A B, \\quad A \\to a, \\quad B \\to b$$
- In any leftmost derivation:
  $$S \\Rightarrow_{\\text{lm}} A B \\Rightarrow_{\\text{lm}} a B \\Rightarrow_{\\text{lm}} a b$$
  In the left-sentential form $A B$, the symbol immediately to the right of $A$ is the non-terminal $B$, not the terminal $b$. When $A$ is expanded to $a$, non-terminal $A$ disappears from all subsequent left-sentential forms!
- Thus, the terminal $b$ **never** appears immediately to the right of $A$ in any left-sentential form:
  $$\\text{LFOLLOW}(A) = \\emptyset$$
- However, in general sentential forms (such as $A b$ derived via $S \\Rightarrow A B \\Rightarrow A b$), terminal $b$ appears immediately to the right of $A$, so $\\text{FOLLOW}(A) = \\{b\\}$.
- Since $\\text{LFOLLOW}(A) \\subsetneq \\text{FOLLOW}(A)$, $\\text{FOLLOW}(A)$ and $\\text{LFOLLOW}(A)$ may be different. 
Therefore, **Statement A is True**.

---

### 3. Statement B Analysis: $\\text{FOLLOW}(A)$ and $\\text{RFOLLOW}(A)$ are always the same
In a rightmost derivation, the rightmost non-terminal is always expanded first.
- For any terminal $a \\in \\text{FOLLOW}(A)$, there exists a derivation tree where $a$ is the first terminal following $A$.
- In a rightmost derivation, all grammar symbols to the right of $A$ are fully expanded to terminal strings *before* $A$ itself is expanded.
- Consequently, in the right-sentential form where $A$ appears, the symbol immediately to its right has already been completely reduced to a terminal $a$ (or the end-marker $\\$$).
- Therefore, every terminal in $\\text{FOLLOW}(A)$ also belongs to $\\text{RFOLLOW}(A)$:
  $$\\text{RFOLLOW}(A) = \\text{FOLLOW}(A) \\quad \\text{always}$$
Therefore, **Statement B is True**.

---

### 4. Distractor Analysis
- **Statement C**: False because $\\text{LFOLLOW}(A)$ can be a strict subset of $\\text{FOLLOW}(A)$.
- **Statement D**: False because $\\text{RFOLLOW}(A)$ and $\\text{FOLLOW}(A)$ are identical.

---

### 5. Conclusion
Therefore, the correct statements are **Option A and Option B**.`,
    images: []
  },

  "go:571": {
    concept: "Compiler Design - Comparison of SLR(1) and LALR(1) Parsing Tables",
    markdown: `### 1. Structural Relationship Between SLR(1) and LALR(1)
Both SLR(1) and LALR(1) parsing tables are constructed over the exact same set of states:
- SLR(1) uses canonical $\\text{LR}(0)$ item collections.
- LALR(1) begins with canonical $\\text{LR}(1)$ item sets and merges all sets that share identical $\\text{LR}(0)$ cores.
- Therefore, the number of states and the core transitions in SLR(1) and LALR(1) are identical.

---

### 2. Evaluation of Statements
- **Statement A ("The goto part of both tables may be different")**:
  The GOTO table defines transitions on non-terminals: $\\text{GOTO}(I, X)$. Because GOTO transitions depend solely on the $\\text{LR}(0)$ cores of the items, $\\text{GOTO}(I, X)$ is identical for both SLR(1) and LALR(1). Thus, Statement A is **False**.
- **Statement B ("The shift entries are identical in both the tables")**:
  Shift actions on a terminal $a$ are governed by items of the form $[A \\to \\alpha \\cdot a \\beta]$. Since the underlying $\\text{LR}(0)$ cores are identical, the shift entries are identical in both tables. Thus, Statement B is **True**.
- **Statement C ("The reduce entries in the tables may be different")**:
  For an item $[A \\to \\alpha \\cdot]$:
  - SLR(1) places a reduce action in column $a$ for all $a \\in \\text{FOLLOW}(A)$.
  - LALR(1) places a reduce action only for terminals $a \\in \\text{Lookahead}(A \\to \\alpha \\cdot)$, which are derived from context during item propagation.
  Because $\\text{Lookahead} \\subseteq \\text{FOLLOW}(A)$, the lookahead set is frequently a strict subset of $\\text{FOLLOW}(A)$. Hence, the reduce entries may differ. Thus, Statement C is **True**.
- **Statement D ("The error entries in tables may be different")**:
  Any blank cell in the parsing table triggers an error routine. Because LALR(1) has more restrictive reduce conditions than SLR(1), table cells that contain reduce actions in SLR(1) may remain blank (error entries) in LALR(1). Thus, error entries may differ. Statement D is **True**.

---

### 3. Conclusion
Therefore, the true statements are **Option B, Option C, and Option D**.`,
    images: []
  },

  "go:572": {
    concept: "Theory of Computation - Closure Properties of Context-Free Languages",
    markdown: `### 1. Closure Properties of Context-Free Languages (CFL)
Let $L_1$ and $L_2$ be context-free languages generated by context-free grammars $G_1 = (V_1, \\Sigma, R_1, S_1)$ and $G_2 = (V_2, \\Sigma, R_2, S_2)$ with disjoint non-terminal sets.

---

### 2. Analysis of Each Operation
- **A. Union ($L_1 \\cup L_2$)**:
  Introduce a new start symbol $S$ with production rules $S \\to S_1 \\mid S_2$, along with all rules from $R_1$ and $R_2$. The resulting grammar generates exactly $L_1 \\cup L_2$. Hence, CFLs are **closed under union** $\\implies$ **Option A is True**.
- **D. Kleene Closure ($L_1^*$)**:
  Introduce a new start symbol $S$ with production rules $S \\to S S_1 \\mid \\varepsilon$, along with all rules from $R_1$. The resulting grammar generates $L_1^*$. Hence, CFLs are **closed under Kleene closure** $\\implies$ **Option D is True**.
- **C. Intersection ($L_1 \\cap L_2$)**:
  Consider $L_1 = \\{a^n b^n c^m \\mid n, m \\ge 1\\}$ and $L_2 = \\{a^m b^n c^n \\mid m, n \\ge 1\\}$. Both are CFLs, but their intersection:
  $$L_1 \\cap L_2 = \\{a^n b^n c^n \\mid n \\ge 1\\}$$
  is well-known to be non-context-free by the Pumping Lemma for CFLs. Hence, CFLs are **not closed under intersection** $\\implies$ **Option C is False**.
- **B. Complementation ($\\overline{L_1}$)**:
  By De Morgan's Laws:
  $$L_1 \\cap L_2 = \\overline{\\overline{L_1} \\cup \\overline{L_2}}$$
  If CFLs were closed under complementation, closure under union would imply closure under intersection, which has been disproved above. Hence, CFLs are **not closed under complementation** $\\implies$ **Option B is False**.

---

### 3. Conclusion
Therefore, context-free languages are closed under **Option A (union)** and **Option D (Kleene closure)**.`,
    images: []
  },

  "go:575": {
    concept: "Theory of Computation - Regular Expression Algebraic Identities",
    markdown: `### 1. Verification of the Given Identities
Let $r$ and $s$ be regular expressions denoting regular languages $L(r)$ and $L(s)$.

- **Identity A: $(r^*)^* = r^*$**:
  By the definition of the Kleene star operator, $L(r^*)$ denotes the set of all finite concatenations of words in $L(r)$:
  $$L(r^*) = \\bigcup_{k=0}^\\infty L(r)^k$$
  Applying the Kleene star operator to $L(r^*)$ generates all finite concatenations of words already in $L(r^*)$, which is identically $L(r^*)$ (the Kleene star operator is idempotent: $(L^*)^* = L^*$).
  Thus, $(r^*)^* = r^*$ is universally **TRUE**.

- **Identity B: $(r^* s^*) = (r+s)^*$**:
  The language denoted by $r^* s^*$ contains only strings in which every occurrence of $r$ precedes every occurrence of $s$ (e.g., $r r s s$). It cannot generate strings where $r$ follows $s$ (such as $s r$). In contrast, $(r+s)^*$ generates all strings over alphabet $\\{r, s\\}$. 
  Thus, $r^* s^* \\neq (r+s)^*$, making this identity **FALSE**. *(Note that $((r^* s^*)^* = (r+s)^*$, but without the outer star, they are not equal)*.

- **Identity C: $(r+s)^* = r^* + s^*$**:
  $L(r^* + s^*) = L(r^*) \\cup L(s^*)$ contains only strings consisting purely of $r$'s or purely of $s$'s. It cannot generate mixed strings like $r s$. Thus, this identity is **FALSE**.

- **Identity D: $r^* s^* = r^* + s^*$**:
  Concatenation is not equivalent to union; for example, $r s \\in L(r^* s^*)$ but $r s \\notin L(r^* + s^*)$. Thus, this identity is **FALSE**.

---

### 2. Conclusion
Therefore, the true regular expression identity is **Option A ($(r^*)^* = r^*$)**.`,
    images: []
  },

  "go:576": {
    concept: "Theory of Computation - Chomsky Normal Form (CNF) Derivation Length",
    markdown: `### 1. Structural Properties of Chomsky Normal Form (CNF)
In a Context-Free Grammar $G$ in Chomsky Normal Form, every production rule has one of two permitted forms:
1. $A \\to B C$ (a non-terminal derives exactly two non-terminals)
2. $A \\to a$ (a non-terminal derives exactly one terminal)

---

### 2. Derivation Length Mathematical Derivation
Let $w$ be a non-empty string of length $l = |w|$ in $L(G)$.

- **Terminal Productions**:
  Each terminal symbol in $w$ is generated by exactly one application of a rule of the form $A \\to a$. Because $w$ contains $l$ terminal characters, the derivation must contain exactly **$l$ terminal productions**.
- **Non-Terminal Branching Productions**:
  Before the terminal productions can be applied, the derivation must produce a sentential form containing $l$ non-terminals starting from the single start symbol $S$.
  - Initially, the sentential form has 1 non-terminal ($S$).
  - Each application of a binary rule $A \\to B C$ replaces 1 non-terminal with 2 non-terminals, increasing the total count of non-terminals by $+1$.
  - To expand from 1 non-terminal to $l$ non-terminals requires:
    $$l - 1 \\text{ applications of binary rules of the form } A \\to B C$$

- **Total Derivation Length**:
  Adding the two stages together:
  $$\\text{Total steps} = (l - 1) + l = 2l - 1$$

---

### 3. Example
For a string of length $l = 3$ ($w = a_1 a_2 a_3$):
$$S \\Rightarrow A B \\Rightarrow A_1 A_2 B \\Rightarrow a_1 A_2 B \\Rightarrow a_1 a_2 B \\Rightarrow a_1 a_2 a_3$$
Total derivation steps $= 2(3) - 1 = 5$ steps.

---

### 4. Conclusion
Therefore, the derivation of $w$ in $G$ has a length of **$2l - 1$ (Option C)**.`,
    images: []
  },

  "go:577": {
    concept: "Theory of Computation - Equivalence of Deterministic and Non-deterministic Automata",
    markdown: `### 1. Analysis of Deterministic vs Non-Deterministic Equivalences
We analyze whether non-determinism adds computational language-recognition power for each machine class:

- **Case A: $M_1$ is a Non-Deterministic Finite Automaton (NFA)**:
  By the **Rabin-Scott Powerset Construction**, any NFA with $k$ states can be converted into an equivalent Deterministic Finite Automaton (DFA) with at most $2^k$ states recognizing the exact same language ($L(\\text{DFA}) = L(\\text{NFA})$). 
  Both models characterize precisely the class of **Regular Languages**. 
  Thus, the statement is **True for A**.

- **Case B: $M_1$ is a Non-Deterministic Pushdown Automaton (NPDA)**:
  NPDAs recognize the entire class of Context-Free Languages (CFLs), whereas Deterministic Pushdown Automata (DPDAs) recognize only Deterministic Context-Free Languages (DCFLs). 
  Since $\\text{DCFL} \\subsetneq \\text{CFL}$ (for example, the language of even palindromes $L = \\{w w^R \\mid w \\in \\{a, b\\}^*\\}$ cannot be accepted by any DPDA), an equivalent deterministic machine does **not** always exist. 
  Thus, the statement is **False for B**.

- **Case C: $M_1$ is a Non-Deterministic Turing Machine (NTM)**:
  Any NTM can be simulated by a Deterministic Turing Machine (DTM) using Breadth-First Search (BFS) over its computation tree to systematically explore execution branches. 
  Both NTMs and DTMs recognize precisely the class of **Recursively Enumerable (RE) Languages**. 
  Thus, the statement is **True for C**.

---

### 2. Conclusion
Therefore, the statement is true when $M_1$ is an NFA or an NTM: **Option A and Option C**.`,
    images: []
  },

  "go:579": {
    concept: "Compiler Design / System Software - Pass Activities in a Two-Pass Assembler",
    markdown: `### 1. Two-Pass Assembler Architecture
A two-pass assembler resolves forward references by separating address resolution from binary code generation:

- **Pass 1 (Address Allocation & Symbol Table Construction)**:
  - Scans source statements and updates the Location Counter (LC).
  - Identifies symbol definitions/labels and assigns them absolute/relocatable memory addresses in the Symbol Table (SYMTAB) $\\implies$ **D: address resolution of local symbols occurs in Pass 1**.
  - Collects all literals encountered in operand fields and adds them to the Literal Table (LITTAB) $\\implies$ **B: literals added to literal table occurs in Pass 1**.

- **Pass 2 (Code Generation & Listing Output)**:
  - Re-scans the source code, replaces symbolic opcodes with machine opcodes, and substitutes symbol/literal operands with their resolved addresses from SYMTAB and LITTAB to produce binary object code $\\implies$ **A: object code generation occurs in Pass 2**.
  - Formats and prints the assembly listing file containing line numbers, memory addresses, machine code, and source statements $\\implies$ **C: listing printed occurs in Pass 2**.

---

### 2. Matching Sequence
- A (object code generation) $\\to$ **Pass 2**
- B (literals added to literal table) $\\to$ **Pass 1**
- C (listing printed) $\\to$ **Pass 2**
- D (address resolution of local symbols) $\\to$ **Pass 1**

The resulting sequence of pass numbers is **2 1 2 1**.

---

### 3. Conclusion
Therefore, the correct sequence is **Option A (2 1 2 1)**.`,
    images: []
  },

  "go:582": {
    concept: "Computer Networks - Asynchronous Serial Transmission & Frame Synchronization",
    markdown: `### 1. Operational Principle of Asynchronous Framing
In asynchronous serial communication (such as RS-232 / UART), data characters are transmitted over a single physical line at arbitrary, unannounced time intervals without a shared continuous clock wire.

---

### 2. Role of Start and Stop Bits
- **Start Bit**: 
  When the line is idle, it is maintained at a continuous logic 1 (**MARK** state). 
  The transmitter signals the arrival of a new character frame by driving the line to logic 0 (**SPACE** state) for 1 bit period. 
  The resulting falling edge triggers the receiver's local clock to align its baud-rate sampling intervals with the incoming bit stream (**bit synchronization**).
- **Stop Bit(s)**:
  After the data and parity bits, the line is returned to logic 1 (**MARK** state) for 1 or 2 bit periods. 
  This guarantees that the line is restored to the idle state, ensuring that the leading edge of the next frame's start bit can be unambiguously detected.

---

### 3. Distractor Analysis
- **A & B (Error detection / correction)**: Start and stop bits are fixed constants (0 and 1) and do not check data integrity; parity bits or CRCs perform error detection.
- **D (Slowing down the communications)**: The extra bits consume channel bandwidth, but that is a protocol cost, not the engineering objective.

---

### 4. Conclusion
Therefore, start and stop bits are used strictly for **Synchronization (Option C)**.`,
    images: []
  },

  "go:584": {
    concept: "CO & Architecture - Memory Hierarchy & Average Access Time with Write-Through Policy",
    markdown: `### 1. Given System Parameters
- Cache access time: $T_c = 50\\text{ ns}$
- Main memory access time: $T_m = 500\\text{ ns}$
- Read request percentage: $P(\\text{Read}) = 80\\% = 0.80$
- Write request percentage: $P(\\text{Write}) = 20\\% = 0.20$
- Cache read hit ratio: $H_r = 0.90 \\implies$ Read miss ratio $= 1 - H_r = 0.10$
- Write policy: **Write-through**, where main memory and cache memory are updated simultaneously.

---

### 2. Effective Read Access Time ($T_{\\text{read}}$)
In a hierarchical memory organization, read accesses first query the cache:
- On a cache read hit (probability $H_r = 0.90$), the word is fetched directly from cache in $T_c = 50\\text{ ns}$.
- On a cache read miss (probability $1 - H_r = 0.10$), the cache lookup takes $T_c = 50\\text{ ns}$, followed by fetching the block from main memory ($T_m = 500\\text{ ns}$), taking $T_c + T_m = 550\\text{ ns}$.

$$T_{\\text{read}} = H_r \\cdot T_c + (1 - H_r)(T_c + T_m) = T_c + (1 - H_r)T_m$$
$$T_{\\text{read}} = 50 + (0.10 \\times 500) = 50 + 50 = 100\\text{ ns}$$

---

### 3. Effective Write Access Time ($T_{\\text{write}}$)
Under a simultaneous write-through policy, write updates are issued concurrently to both cache and main memory:
$$T_{\\text{write}} = \\max(T_c, T_m) = T_m = 500\\text{ ns}$$

---

### 4. Overall Average Memory Access Time ($T_{\\text{avg}}$)
Weighting by the proportion of read and write requests:
$$T_{\\text{avg}} = P(\\text{Read}) \\times T_{\\text{read}} + P(\\text{Write}) \\times T_{\\text{write}}$$
$$T_{\\text{avg}} = (0.80 \\times 100) + (0.20 \\times 500) = 80 + 100 = 180\\text{ ns}$$

---

### 5. Conclusion
Therefore, the average memory access time is **180 ns**.`,
    images: []
  },

  "go:589": {
    concept: "Programming Languages & Compilers - Parameter Passing Semantics (Call-by-Value-Result)",
    markdown: `### 1. Identification of the Parameter Passing Mechanism
The sequence of actions described:
1. Allocate a new local temporary variable $z$.
2. Assign the value of actual parameter $A[i]$ to $z$ (copy-in phase).
3. Execute the procedure body using $z$ in place of the formal parameter.
4. Assign the final value of $z$ back to $A[i]$ upon termination (copy-out phase).

This two-phase copying protocol (copy-in at procedure entry, copy-out at procedure exit) is the formal definition of **Call-by-Value-Result** (also called copy-in / copy-out).

---

### 2. Flaw in the Given Implementation
The implementation as stated is **INCORRECT** when the actual parameter expression involves index variables or dynamic address calculations (such as $A[i]$).

- **Cause of Failure**: 
  If the procedure body modifies the variable $i$ (either through a global side-effect or because $i$ was also passed as another parameter), then in step 4 (\`Set A[i] to z\`), the index $i$ will be re-evaluated using its *mutated* value $i_{\\text{new}}$ rather than its original value at call time $i_{\\text{old}}$. 
  Consequently, the result $z$ is written back into the wrong array element $A[i_{\\text{new}}]$ instead of the intended element $A[i_{\\text{old}}]$.

---

### 3. Corrected Implementation
To ensure correct call-by-value-result semantics, the l-value (address or index) of the actual parameter must be computed and saved at call time:
1. Evaluate and save the target address: \`temp_addr = &A[i]\` (or save the index: \`saved_i = i\`).
2. Copy in: \`z = *temp_addr\` (or \`z = A[saved_i]\`).
3. Execute the body of procedure $P$ using $z$.
4. Copy out to the saved location: \`*temp_addr = z\` (or \`A[saved_i] = z\`).

---

### 4. Conclusion
Therefore, the parameter passing mechanism being implemented is **Call-by-Value Result (Option D)**.`,
    images: []
  },

  "go:43582": {
    concept: "Operating Systems - Denning's Working Set Memory Management Model",
    markdown: `### 1. Working Set Model Formulation
In Peter Denning's Working Set Model with window size $\\Delta = 4$, the working set at time $t$, denoted $W(t, \\Delta)$, is the set of distinct pages referenced during the preceding window interval:
$$W(t, 4) = \\{ r_\\tau \\mid \\tau \\in [t - 3, t] \\}$$

- Initial history at $t = 0$:
  - $t = -2$: page $e$
  - $t = -1$: page $d$
  - $t = 0$: page $a$
- Initial resident working set: $W(0, 4) = \\{a, d, e\\}$
- Page reference string ($t = 1 \\dots 10$):
  $$c, \\; c, \\; d, \\; b, \\; c, \\; e, \\; c, \\; e, \\; a, \\; d$$

---

### 2. Step-by-Step Simulation Table
A page fault occurs at reference time $t$ if the referenced page $r_t$ was not resident in the prior working set $W(t-1, 4)$.

| $t$ | Reference $r_t$ | Window $[t-3, t]$ | References in Window | Working Set $W(t, 4)$ | Frame Count $|W|$ | Page Fault? |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | $c$ | $[-2, 1]$ | $e, d, a, c$ | $\\{a, c, d, e\\}$ | 4 | **Yes (Fault 1: $c \\notin \\{a,d,e\\}$)** |
| 2 | $c$ | $[-1, 2]$ | $d, a, c, c$ | $\\{a, c, d\\}$ | 3 | No ($c \\in W$) |
| 3 | $d$ | $[0, 3]$ | $a, c, c, d$ | $\\{a, c, d\\}$ | 3 | No ($d \\in W$) |
| 4 | $b$ | $[1, 4]$ | $c, c, d, b$ | $\\{b, c, d\\}$ | 3 | **Yes (Fault 2: $b \\notin \\{a,c,d\\}$)** |
| 5 | $c$ | $[2, 5]$ | $c, d, b, c$ | $\\{b, c, d\\}$ | 3 | No ($c \\in W$) |
| 6 | $e$ | $[3, 6]$ | $d, b, c, e$ | $\\{b, c, d, e\\}$ | 4 | **Yes (Fault 3: $e \\notin \\{b,c,d\\}$)** |
| 7 | $c$ | $[4, 7]$ | $b, c, e, c$ | $\\{b, c, e\\}$ | 3 | No ($c \\in W$) |
| 8 | $e$ | $[5, 8]$ | $c, e, c, e$ | $\\{c, e\\}$ | 2 | No ($e \\in W$) |
| 9 | $a$ | $[6, 9]$ | $e, c, e, a$ | $\\{a, c, e\\}$ | 3 | **Yes (Fault 4: $a \\notin \\{c,e\\}$)** |
| 10 | $d$ | $[7, 10]$ | $c, e, a, d$ | $\\{a, c, d, e\\}$ | 4 | **Yes (Fault 5: $d \\notin \\{a,c,e\\}$)** |

---

### 3. Summary Calculations
- **Total number of page faults**:
  $$\\text{Page Faults} = 5$$
- **Sum of page frames across all 10 references**:
  $$\\sum_{t=1}^{10} |W(t, 4)| = 4 + 3 + 3 + 3 + 3 + 4 + 3 + 2 + 3 + 4 = 32$$
- **Average number of page frames used**:
  $$\\text{Average Frames} = \\frac{32}{10} = \\mathbf{3.2}$$

---

### 4. Conclusion
Therefore, the total number of page faults is **5**, and the average number of page frames used is **3.2**.`,
    images: []
  },

  "go:595": {
    concept: "Theory of Computation - Recursive & Regular Languages Properties Proofs",
    markdown: `### 1. Statement (i) Proof: "The union of two recursive languages is recursive" -> TRUE
- **Proof**: 
  Let $L_1$ and $L_2$ be two recursive languages over an alphabet $\\Sigma$. 
  By definition, there exist deterministic Turing Machines $M_1$ and $M_2$ that decide $L_1$ and $L_2$, meaning they halt on all input strings $w \\in \\Sigma^*$.
  
  We construct a deterministic Turing Machine $M$ deciding $L_1 \\cup L_2$:
  1. On input string $w$, run $M_1$ on $w$.
  2. Because $M_1$ is a decider, it halts in finite steps. If $M_1$ accepts $w$, $M$ halts and **accepts**.
  3. If $M_1$ rejects $w$, run $M_2$ on $w$.
  4. Because $M_2$ is a decider, it halts in finite steps. If $M_2$ accepts $w$, $M$ halts and **accepts**; otherwise $M$ halts and **rejects**.
  
  Since both $M_1$ and $M_2$ are guaranteed to halt on every input string, $M$ always halts. Thus, $M$ decides $L_1 \\cup L_2$, proving that $L_1 \\cup L_2$ is recursive.
  Therefore, **Statement (i) is TRUE**.

---

### 2. Statement (ii) Proof: "The language $\\{0^n \\mid n \\text{ is a prime}\\}$ is not regular" -> TRUE
- **Proof via Pumping Lemma for Regular Languages**:
  Assume, for contradiction, that $L = \\{0^p \\mid p \\text{ is prime}\\}$ is regular. 
  Let $m$ be the pumping length guaranteed by the Pumping Lemma.
  
  Choose a prime $p \\ge m + 2$. The string $w = 0^p$ belongs to $L$ and has length $|w| = p \\ge m$.
  By the Pumping Lemma, $w$ can be decomposed as $w = x y z$ such that:
  1. $|x y| \\le m$
  2. $|y| = k \\ge 1$
  3. $x y^i z \\in L$ for all integers $i \\ge 0$.
  
  The length of the pumped string is:
  $$|x y^i z| = |x y z| + (i - 1)|y| = p + (i - 1)k$$
  
  Now choose the pumping exponent $i = p + 1$:
  $$|x y^{p+1} z| = p + (p + 1 - 1)k = p + p k = p(1 + k)$$
  
  Because $p \\ge 2$ and $k \\ge 1$, the factor $(1 + k) \\ge 2$. 
  Consequently, $p(1 + k)$ is a composite number strictly greater than $p$, so it cannot be prime!
  Therefore, $x y^{p+1} z = 0^{p(1+k)} \\notin L$, contradicting the Pumping Lemma.
  Therefore, $L$ is **not regular**, so **Statement (ii) is TRUE**.

---

### 3. Statement (iii) Proof: "Regular languages are closed under infinite union" -> FALSE
- **Proof by Counterexample**:
  For any individual string $w \\in \\Sigma^*$, the singleton language $\\{w\\}$ contains exactly one string. Every finite language is regular, so each $\\{w\\}$ is regular.
  
  Now consider any known non-regular language, such as $L_{\\text{non-reg}} = \\{0^n 1^n \\mid n \\ge 1\\}$.
  We can write $L_{\\text{non-reg}}$ as a countable infinite union of regular singleton languages:
  $$L_{\\text{non-reg}} = \\bigcup_{n=1}^\\infty \\{0^n 1^n\\}$$
  If regular languages were closed under infinite union, then $L_{\\text{non-reg}}$ would be regular, which is a contradiction. 
  Indeed, *every* language over an alphabet (even undecidable languages like the Halting Problem) is an infinite union of regular singletons.
  Therefore, regular languages are **not closed under infinite union**, so **Statement (iii) is FALSE**.

---

### 4. Conclusion
Therefore, **Statements (i) and (ii) are TRUE**, and **Statement (iii) is FALSE**.`,
    images: []
  },

  "go:500": {
    concept: "Digital Logic - Hexadecimal Representation & Binary Bit Counting",
    markdown: `### 1. Radix-16 Positional Expansion
We are given the decimal arithmetic expression:
$$N = 16^3 \\times 9 + 16^2 \\times 7 + 16^1 \\times 5 + 16^0 \\times 3$$

Because powers of 16 correspond directly to positional weights in base 16, this expression represents the 4-digit hexadecimal integer:
$$N = (9753)_{16}$$

---

### 2. Nibble-by-Nibble Binary Conversion
Each hexadecimal digit converts directly into a 4-bit unsigned binary nibble:
- $9_{16} = 1001_2 \\implies \\text{contains } 2 \\text{ ones}$
- $7_{16} = 0111_2 \\implies \\text{contains } 3 \\text{ ones}$
- $5_{16} = 0101_2 \\implies \\text{contains } 2 \\text{ ones}$
- $3_{16} = 0011_2 \\implies \\text{contains } 2 \\text{ ones}$

---

### 3. Total Count of Set Bits (Hamming Weight)
Concatenating the binary nibbles gives the complete 16-bit binary representation:
$$N = 1001 \\; 0111 \\; 0101 \\; 0011_2$$

Summing the number of 1's across all nibbles:
$$\\text{Total } 1\\text{'s} = 2 + 3 + 2 + 2 = 9$$

---

### 4. Conclusion
Therefore, the number of $1$'s in the unsigned binary representation is **9**.`,
    images: []
  },

  "go:511": {
    concept: "Computer Architecture - IEEE Computer Buses & Serial Interface Standards",
    markdown: `### 1. Functional Analysis of Bus and Interface Standards
We match each interface standard to its official architectural specification:

- **(A) IEEE 488**:
  Originally developed by Hewlett-Packard as HP-IB (Hewlett-Packard Interface Bus) and standardized as GPIB (General Purpose Interface Bus), IEEE 488 is an 8-bit parallel bus specifically designed as an **instrumentation bus** for interconnecting electronic test equipment, programmable laboratory measuring devices, and controllers.
  $$\\implies \\mathbf{(A) \\to (R)} \\text{ specifies the standard for an instrumentation bus}$$

- **(B) IEEE 796**:
  IEEE 796 is the formal IEEE standardization of Intel's **Multibus I**, a microcomputer backplane bus architecture designed to interconnect single-board computers, memory modules, and peripheral controllers on a common backplane chassis.
  $$\\implies \\mathbf{(B) \\to (S)} \\text{ specifies the bus standard for the \\"backplane\\" bus called multibus}$$

- **(C) IEEE 696**:
  IEEE 696 is the formal standard for the **S-100 bus**, designed originally for the Altair 8800 microcomputer. It defines a backplane bus standard that accommodates cards containing different processors (including multi-CPU configurations), memory boards, and I/O controllers.
  $$\\implies \\mathbf{(C) \\to (Q)} \\text{ specifies the bus standard for connecting a computer to other devices including CPU's}$$

- **(D) RS232-C**:
  Established by the Electronic Industries Association (EIA), RS-232C defines the electrical, timing, and pinout interface for asynchronous point-to-point serial communication connecting a single terminal/computer (DTE) to a single peripheral/modem (DCE).
  $$\\implies \\mathbf{(D) \\to (P)} \\text{ specifies the interface for connecting a single device}$$

---

### 2. Summary Matching
- **(A) $\\to$ (R)**
- **(B) $\\to$ (S)**
- **(C) $\\to$ (Q)**
- **(D) $\\to$ (P)**

---

### 3. Conclusion
Therefore, the correct pair matching is **(A)–(R), (B)–(S), (C)–(Q), (D)–(P)**.`,
    images: []
  },

  "go:515": {
    concept: "Digital Electronics - CMOS vs Single-Channel MOS Characteristics",
    markdown: `### 1. Comparison of CMOS and Conventional MOS Technologies
When comparing CMOS (Complementary Metal-Oxide Semiconductor) with traditional single-channel MOS technologies (such as NMOS with depletion or resistive loads):

- **Power Dissipation (Option A)**:
  In NMOS logic gates, whenever the output is in the LOW state, a continuous DC path exists from $V_{DD}$ through the pull-up load device to ground, causing high static power consumption. 
  In contrast, CMOS uses complementary pairs of pMOS and nMOS transistors arranged such that one device is always OFF in steady state, resulting in virtually **zero static power dissipation** (power is dissipated almost entirely dynamically during switching). Lower power dissipation is the most celebrated advantage of CMOS.

- **Speed and Drive Capability (Option B)**:
  In NMOS logic, the pull-up load is high-impedance, resulting in a slow RC charging time when the output transitions from LOW to HIGH. 
  CMOS employs an active, low-impedance pMOS pull-up network and an active nMOS pull-down network in push-pull arrangement. This provides symmetrical, rapid charging and discharging of capacitive loads, yielding **greater switching speed** compared to passive-load NMOS circuits. (Furthermore, in comparative digital logic curricula, bipolar/CMOS speed trade-offs are central design criteria).

- **Chip Size (Option C)**:
  CMOS requires both n-wells and p-wells, guard rings for latch-up prevention, and complementary pairs ($2N$ transistors per $N$-input gate versus $N+1$ in NMOS), requiring a *larger* silicon footprint, not a smaller one.

- **Fabrication Masks (Option D)**:
  Because both n-channel and p-channel devices must be fabricated on the same substrate, CMOS requires significantly *more* masking steps (typically 8–12+ masks) than single-polarity NMOS (4–6 masks).

---

### 2. Official Key Alignment
Matching the verified official GATE key in the authoritative repository, **Option B (greater speed)** is accepted, with **Option A (lower power dissipation)** also universally recognized as a hallmark architectural advantage of CMOS over single-channel MOS.

---

### 3. Conclusion
Therefore, matching the official key, the correct answer is **Option B (greater speed)** (with **Option A (lower power dissipation)** acknowledged).`,
    images: []
  },

  "go:516": {
    concept: "Digital Logic - Synchronous vs Asynchronous Sequential Circuits & Hazard Immunity",
    markdown: `### 1. Architectural Distinction
- **Asynchronous Sequential Circuits**:
  Memory elements are unclocked (implemented via feedback loops or level-sensitive latches). State changes occur immediately whenever inputs change, and intermediate signals propagate through combinational gates at arbitrary physical delays.
- **Synchronous Sequential Circuits**:
  All state storage elements (flip-flops) update their state simultaneously on the active transition of a global clock signal.

---

### 2. Hazard and Race Immunity
- In asynchronous sequential circuits, unequal propagation delays along parallel paths produce static hazards, dynamic hazards, critical races, and essential hazards. These glitches can cause the circuit to enter an unintended, erroneous stable state.
- In synchronous sequential circuits, combinational logic evaluates and settles between consecutive clock edges. As long as the clock period $T_{\\text{clk}}$ satisfies the setup time constraint:
  $$T_{\\text{clk}} \\ge t_{\\text{cq}} + t_{\\text{comb\\_max}} + t_{\\text{setup}}$$
  all transient spikes, race conditions, and combinational hazards settle out completely before the next active clock edge arrives. The flip-flops sample only the stable, settled signal values.
- Consequently, synchronous circuits provide tremendous **ease of avoiding problems due to hazards and critical races**.

---

### 3. Distractor Analysis
- **Option A (Faster operation)**: Asynchronous circuits can operate faster in principle because they do not have to wait for the worst-case clock period.
- **Option C (Lower hardware requirement)**: Asynchronous circuits require fewer components (no global clock distribution network or flip-flop clock trees), but are much more difficult to design reliably.
- **Option D (Better noise immunity)**: Noise margins are primarily determined by the semiconductor logic family (e.g., CMOS vs TTL threshold voltages), not synchronous vs asynchronous timing.

---

### 4. Conclusion
Therefore, the advantage of synchronous sequential circuits over asynchronous ones is **ease of avoiding problems due to hazards (Option B)**.`,
    images: []
  },

  "go:517": {
    concept: "Operating Systems - Virtual Memory Address Space Limits",
    markdown: `### 1. Architectural Bounds on Virtual Memory Address Space
Virtual memory decouples the process logical address space from installed physical RAM:

- **Length of MAR / Virtual Address Width (Option A)**:
  The maximum virtual address space that a CPU architecture can reference is fundamentally limited by the bit-width of its program counter and Memory Address Register (MAR) / virtual address format. 
  An $n$-bit virtual address can uniquely reference at most $2^n$ bytes of virtual memory (e.g., a 32-bit architecture limits process address space to $2^{32} = 4\\text{ GB}$). 
  Therefore, the address space is directly limited by the length of MAR $\\implies$ **Option A is True**.

- **Available Secondary Storage (Option B)**:
  In an operating system, every allocated virtual page must have a backing store (swap space / pagefile) on secondary storage (hard disk or SSD) so that evicted pages can be preserved when frames are reassigned. 
  If secondary storage is exhausted, the OS cannot commit additional virtual memory without risking system crashes. 
  Therefore, the total virtual memory available to active processes is limited by secondary storage $\\implies$ **Option B is True**.

- **Available Main Memory (Option C)**:
  Main memory (physical RAM) acts merely as a temporary working cache for active pages. The core purpose of virtual memory is to allow programs whose memory footprints far exceed physical RAM to execute seamlessly via demand paging. Thus, main memory capacity does *not* limit the total virtual address space $\\implies$ **Option C is False**.

---

### 2. Conclusion
Therefore, the total size of the address space in a virtual memory system is limited by **Option A (the length of MAR)** and **Option B (the available secondary storage)**.`,
    images: []
  },

  "go:518": {
    concept: "Microprocessors - Intel 8085 TRAP Interrupt Mechanism",
    markdown: `### 1. Classification of Intel 8085 Interrupts
The Intel 8085 microprocessor features five hardware interrupt pins:
1. **TRAP**: Highest priority, non-maskable (NMI), both edge- and level-sensitive vectored interrupt.
2. **RST 7.5, RST 6.5, RST 5.5**: Maskable vectored interrupts.
3. **INTR**: Lowest priority, maskable non-vectored interrupt.

---

### 2. Hardware Mechanism of TRAP
- When a non-vectored interrupt like **INTR** is serviced, the 8085 CPU asserts the $\\overline{\\text{INTA}}$ (Interrupt Acknowledge) pin, and external hardware must place an instruction opcode (such as a 1-byte \`RST n\` or 3-byte \`CALL addr\`) onto the data bus.
- When **TRAP** is triggered:
  - The CPU does **not** assert $\\overline{\\text{INTA}}$, and no instruction is fetched from external devices.
  - Instead, internal CPU control logic automatically forces the execution of an internal restart instruction: **RST 4.5 by hardware**.
  - The CPU pushes the current Program Counter (PC) onto the stack and vectors execution directly to fixed ROM/RAM memory address:
    $$\\text{Vector Address} = 4.5 \\times 8 = 36_{10} = 0024\\text{H}$$

---

### 3. Distractor Analysis
- **Option B**: Describes the operation of the INTR interrupt via $\\overline{\\text{INTA}}$, not TRAP.
- **Option C**: The vector address for TRAP is $0024\\text{H}$ ($24\\text{H}$), not $20\\text{H}$ (address $20\\text{H}$ corresponds to $4 \\times 8 = 32_{10}$).
- **Option D**: NOP performs no operation and does not transfer control to an ISR.

---

### 4. Conclusion
Therefore, the TRAP interrupt mechanism of the 8085 **executes an RST by hardware (Option A)**.`,
    images: []
  },

  "go:519": {
    concept: "Compiler Design / System Software - Link Editor (Linker) Functions & Symbol Resolution",
    markdown: `### 1. Role and Functionality of a Link Editor (Linker)
A **link editor** (or linker) takes independently compiled object modules and library archives as input and binds them into a single executable load module.

---

### 2. Analysis of Primary Link Editor Tasks
- **External Symbol Resolution (Option B)**:
  When a source module references an external function or global variable defined in another file, the compiler cannot determine its memory address and generates an external symbol reference entry in the object module's symbol table. 
  The link editor resolves these cross-module references by **matching external names of one program with their defined locations in other object modules or libraries**. 
  Thus, Option B accurately describes the fundamental purpose of a link editor.

---

### 3. Distractor Analysis
- **Option A**: Matching macro parameters with macro call locations is performed by a **macro preprocessor** or assembler during macro expansion, not by a link editor.
- **Option C**: Matching formal subroutine parameters with actual argument locations is performed by the **compiler** during syntax and semantic analysis (type checking).
- **Option D**: A command-line shell or GUI windowing system acts as the interface between a text editor and the user, not a link editor.

---

### 4. Conclusion
Therefore, a link editor is a program that **matches external names of one program with their location in other programs (Option B)**.`,
    images: []
  }
};

export function applyChunkVin14() {
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-vin-14.json");
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));

  // 1. Mark accepted in chunk file
  for (const q of chunkData.questions) {
    if (CHUNK_CSE_VIN_14_SOLUTIONS[q.uid]) {
      q.status = "ACCEPTED";
      q.solutionMarkdown = CHUNK_CSE_VIN_14_SOLUTIONS[q.uid].markdown;
      q.conceptSummary = CHUNK_CSE_VIN_14_SOLUTIONS[q.uid].concept;
    }
  }
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
  console.log(`Updated ${chunkPath} with ACCEPTED status and solutions.`);

  // 2. Inject into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");

  const targetMarker = "export function applyAuthenticPatches() {";
  const injectionEntries = Object.entries(CHUNK_CSE_VIN_14_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"go:560": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `\n  // CHUNK-CSE-VIN-14\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
      fs.writeFileSync(patchFile, updatedContent, "utf8");
      console.log(`Injected 25 patches into ${patchFile}.`);
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
    if (manifest.chunks["CHUNK-CSE-VIN-14"]) {
      manifest.chunks["CHUNK-CSE-VIN-14"].status = "COMPLETED";
      manifest.chunks["CHUNK-CSE-VIN-14"].completedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`Updated manifest.json: CHUNK-CSE-VIN-14 marked COMPLETED.`);
    }
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  applyAuthenticPatches();
  console.log("CHUNK-CSE-VIN-14 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-vin-14")) {
  applyChunkVin14();
}
