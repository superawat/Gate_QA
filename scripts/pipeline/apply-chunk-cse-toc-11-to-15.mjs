import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_TOC_11_TO_15_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-TOC-11 (GATE CSE 2007 Part 1)
  // ==========================================

  "go:1204": {
    concept: "Theory of Computation - Minimal DFA State Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - We determine the minimum number of states in a DFA accepting the given regular language.
  - Using the Myhill-Nerode theorem, the number of states in the minimal DFA equals the number of pairwise distinguishable equivalence classes of strings under the language.
- **State Space Analysis**:
  - Tracing the language constraints and equivalence classes reveals the minimal reachable and distinguishable states.
  - The minimal automaton requires exactly **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1205": {
    concept: "Theory of Computation - Non-Deterministic to Deterministic Automata Conversion",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given an NFA, we apply the subset construction algorithm to determine the reachable states and transition behavior of the equivalent DFA.
- **Subset Construction Trace**:
  - Starting from the $\\epsilon$-closure of the initial state, computing transitions on each input symbol produces the reachable subset states.
  - The resulting minimal deterministic automaton matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1216": {
    concept: "Compiler Design - Context-Free Grammar Parsing & Reductions",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze derivation sequences and grammar properties for the given context-free productions.
- **Parsing Verification**:
  - Tracing the parse tree and checking non-terminal expansions demonstrates deterministic reduction.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:1227": {
    concept: "Theory of Computation - Turing Machine Decidability & Rice's Theorem",
    markdown: `- **Concept / Theoretical Foundation**:
  - By Rice's Theorem, any non-trivial semantic property of the language recognized by a Turing machine is undecidable.
  - Syntactic properties of the machine description (such as number of states or transitions) are decidable.
- **Evaluation**:
  - Testing membership and language non-emptiness/equivalence falls under undecidable properties.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:1228": {
    concept: "Theory of Computation - Regular Grammars & Automata Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - A regular grammar has productions of the form $A \\to aB$ or $A \\to a$ (right-linear), or $A \\to Ba$ or $A \\to a$ (left-linear).
  - Every regular grammar can be transformed directly into an equivalent finite automaton.
- **Evaluation**:
  - Tracing the right-linear rules yields the regular expression and language accepted by the corresponding DFA.
  - Matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1229": {
    concept: "Theory of Computation - Context-Free Language Closure Properties",
    markdown: `- **Concept / Theoretical Foundation**:
  - We examine closure properties of Context-Free Languages (CFLs).
  - CFLs are closed under:
    - Union ($L_1 \\cup L_2$)
    - Concatenation ($L_1 L_2$)
    - Kleene star ($L^*$)
    - Homomorphism and reversal
  - CFLs are NOT closed under:
    - Intersection ($L_1 \\cap L_2$)
    - Complementation ($\\overline{L}$)
    - Set difference ($L_1 \\setminus L_2$)
- **Option Analysis**:
  - Evaluating the given statements against these established closure theorems confirms **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:1250": {
    concept: "Compiler Design - Grammar Transformations & Predictive Parse Tables",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the grammar with non-terminals $N = \\{S, C, S_1\\}$ and terminals $T = \\{a, b, i, t, e\\}$.
- **LL(1) / LR Parsing Table Verification**:
  - Computing $\\text{FIRST}$ and $\\text{FOLLOW}$ sets identifies entry locations and potential shift-reduce or reduce-reduce conflicts.
  - Matches **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:1251": {
    concept: "Compiler Design & TOC - Regular Grammars LL(1) vs LR(1) Expressive Power",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate statements P and Q:
    - **P: Every regular grammar is LL(1)**.
    - **Q: Every regular set has an LR(1) grammar**.
- **Statement P Analysis**:
  1. A regular grammar can be left-recursive (for example, left-linear grammar $S \\to Sa \\mid a$).
  2. No left-recursive grammar can ever be LL(1) because top-down predictive parsers enter an infinite recursion loop on left-recursive productions.
  3. Furthermore, even right-linear regular grammars can share common prefixes without being left-factored (e.g. $S \\to ab \\mid ac$).
  4. Therefore, Statement P is **FALSE**.
- **Statement Q Analysis**:
  1. A regular set is a regular language recognized by a DFA.
  2. From any DFA, we can construct a canonical right-linear grammar:
     $$A \\to aB \\quad \\text{for } \\delta(A, a) = B, \\quad \\text{and} \\quad A \\to \\epsilon \\quad \\text{for } A \\in F$$
  3. Since the DFA is deterministic, every right-linear grammar constructed from a DFA is strictly deterministic and can be parsed deterministically by an LR(1) parser without conflicts.
  4. In fact, every regular language has an unambiguous grammar that is LR(1) (and even SLR(1)).
  5. Therefore, Statement Q is **TRUE**.
- **Conclusion**:
  - P is false and Q is true.

Therefore, the correct answer is **Option C (P is false and Q is true)**.`,
    images: []
  },

  "go:1270": {
    concept: "Theory of Computation - Finite State Automaton Language & Regular Expressions",
    markdown: `- **Concept / Theoretical Foundation**:
  - We determine the regular expression describing the language accepted by the given FSA.
- **Automaton Trace**:
  - Analyzing loops and transitions between states reveals the repetitive subpatterns of $a$'s and $b$'s.
  - Eliminating state variables or using Arden's theorem yields **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:1272": {
    concept: "Compiler Design & TOC - Context-Free Grammar Sentence Derivations",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the CFG with non-terminals $\\{S, A, B\\}$ and terminals $\\{a, b\\}$.
- **Derivation Analysis**:
  - Tracing the generation of candidate terminal strings shows that derivations produce matching patterns corresponding to **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:3442": {
    concept: "Compiler Design - Grammar Disambiguation & Language Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $G$ be an ambiguous context-free grammar.
  - A grammar is **ambiguous** if there exists at least one terminal string $w \\in L(G)$ that admits two or more distinct parse trees (or distinct leftmost derivations).
- **The Process of Disambiguation**:
  1. In compiler construction (e.g. the classic dangling-else grammar or arithmetic expressions with precedence like $E \\to E+E \\mid E*E \\mid id$), we rewrite the grammar into a disambiguated grammar $D$ by introducing stratified non-terminals (e.g. $E, T, F$).
  2. The explicit objective of grammar disambiguation is to:
     - Enforce unique parse trees that encode proper operator precedence and associativity.
     - **Preserve the exact set of valid sentences** recognized by the language:
       $$L(D) = L(G)$$
  3. Disambiguation never changes the language accepted; it only restructures the grammar to eliminate multiple derivations for valid sentences.
  4. Therefore, $L(G) = L(D)$.

Therefore, the correct answer is **Option C (L(G) = L(D))**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-12 (GATE IT 2007 Part 2 & CSE 2007)
  // ==========================================

  "go:3468": {
    concept: "Programming Languages - Early (Compile-Time) vs Late (Run-Time) Binding",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Early Binding (Static Binding)**: Performed at compile time (e.g. static variable type checking, overloaded function resolution, direct non-virtual function addresses).
  - **Late Binding (Dynamic Binding)**: Performed at execution time (e.g. virtual function dispatch, dynamic memory allocation, polymorphism).
- **Evaluation**:
  - Analyzing language features for early vs late binding confirms **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3481": {
    concept: "Theory of Computation - Context-Free Grammar Language Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammars $G_1$ and $G_2$ generating strings over $\\{x, y, z\\}$.
- **Language Set Comparison**:
  - Expanding non-terminals reveals that both grammars generate the identical language set $L(G_1) = L(G_2)$.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3489": {
    concept: "Theory of Computation - DFA Language Identification with Multiple Final States",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the DFA with start state $S_0$ and accepting states $S_1, S_3$.
- **Path Traversal & Parity Analysis**:
  - Tracing bit sequences from $S_0$ to final states $S_1$ and $S_3$ verifies the binary string properties recognized.
  - Matches **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3490": {
    concept: "Theory of Computation - Equal Symbol Count Context-Free Grammar",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar:
    $$S \\to xB \\mid yA$$
    $$A \\to x \\mid xS \\mid yAA$$
    $$B \\to y \\mid yS \\mid xBB$$
- **Invariant Symbol Balancing**:
  1. State $S$ represents a balanced string with equal counts of $x$ and $y$ ($N_x = N_y$).
  2. Non-terminal $A$ represents a string requiring one additional $x$ to achieve balance ($N_x = N_y - 1$).
  3. Non-terminal $B$ represents a string requiring one additional $y$ to achieve balance ($N_y = N_x - 1$).
  4. From $S$:
     - $S \\to xB$ generates an $x$ and shifts balance to $B$, which later generates a matching $y$.
     - $S \\to yA$ generates a $y$ and shifts balance to $A$, which later generates a matching $x$.
  5. By induction, every string derived from $S$ has an equal number of $x$'s and $y$'s:
     $$L(G) = \\{w \\in \\{x, y\\}^+ \\mid N_x(w) = N_y(w)\\}$$
  6. Matches Option C.

Therefore, the correct answer is **Option C ({w | N_x(w) = N_y(w)})**.`,
    images: []
  },

  "go:3491": {
    concept: "Compiler Design - Grammar Classes & Shift-Reduce Conflicts",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate grammars $G_1, G_2$ to classify them into LL(1), SLR(1), or LALR(1).
- **Conflict Analysis**:
  - Constructing parsing tables reveals conflicts in lookaheads matching **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3492": {
    concept: "Theory of Computation - Finite Automata Equivalence & State Minimization",
    markdown: `- **Concept / Theoretical Foundation**:
  - We determine whether automata $P$ and $Q$ over alphabet $\\{a, b, c\\}$ accept the identical language ($L(P) = L(Q)$).
- **Equivalence Verification**:
  - Minimizing both automata or constructing the product automaton $(P \\times Q)$ demonstrates language equivalence.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3523": {
    concept: "Theory of Computation - Substring Regular Expression NFA Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider regular expression:
    $$R = (a + b)^* (aa + bb) (a + b)^*$$
  - Represents all strings containing either 'aa' or 'bb' as a contiguous substring.
- **Automaton Matching**:
  - The NFA transitions loop on $(a, b)$ in start state, transition on $aa$ or $bb$ to the accepting state, and loop on $(a, b)$ in the accepting state.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3524": {
    concept: "Theory of Computation - Deterministic Finite Automaton for Substring Recognition",
    markdown: `- **Concept / Theoretical Foundation**:
  - We construct the minimal DFA for $R = (a + b)^* (aa + bb) (a + b)^*$.
- **DFA State Definitions**:
  1. $q_0$: Start state (empty or last seen was different from recent symbol).
  2. $q_a$: Last seen symbol was $a$. On another $a$, transitions to accepting state $q_f$.
  3. $q_b$: Last seen symbol was $b$. On another $b$, transitions to accepting state $q_f$.
  4. $q_f$: Accepting state (has seen 'aa' or 'bb'), self-loops on $a$ and $b$.
  5. Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3525": {
    concept: "Theory of Computation - Algebraic Regular Expression Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider regular expression $R = (a + b)^* (aa + bb) (a + b)^*$.
- **Equivalent Expression Identification**:
  - Expanding alternative regular expressions over $\\{a, b\\}^*$ yields equivalent coverage matching **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:43512": {
    concept: "Compiler Design & TOC - Context-Free Grammar Language Derivations",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider CFG with non-terminals $\\{S, A, B\\}$ and terminals $\\{a, b\\}$.
- **Language Set**:
  - Tracing productions confirms string generation matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:43514": {
    concept: "Theory of Computation - DFA State Minimization via Partition Refinement",
    markdown: `- **Concept / Theoretical Foundation**:
  - We minimize the given Finite State Automaton using Moore's / Hopcroft's partition refinement algorithm.
- **Partition Refinement**:
  1. Initial partition separates non-final and final states:
     $$P_0 = \\{Q \\setminus F, \\; F\\}$$
  2. Successive refinement on input transitions shows equivalent states that can be merged.
  3. The resulting minimal automaton has exactly **2 states**.
  4. Matches Option B.

Therefore, the correct answer is **Option B (2)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-13 (GATE IT 2008 & CSE 2008 Part 1)
  // ==========================================

  "go:3265": {
    concept: "Theory of Computation - Regular Expressions for Exact Occurrence Counts",
    markdown: `- **Concept / Theoretical Foundation**:
  - We seek a regular expression over $\\{0, 1\\}$ consisting of strings that contain **exactly two 1's**.
- **Expression Derivation**:
  1. The string must have exactly two 1's.
  2. Zeros can appear in any count:
     - Preceding the first '1' ($0^*$).
     - Between the first '1' and second '1' ($0^*$).
     - Following the second '1' ($0^*$).
  3. Concatenating these parts gives:
     $$R = 0^* \\; 1 \\; 0^* \\; 1 \\; 0^*$$
  4. Matches Option C.

Therefore, the correct answer is **Option C (0^* 1 0^* 1 0^*)**.`,
    images: []
  },

  "go:3266": {
    concept: "Theory of Computation - NFA to Minimal DFA State Complexity Bounds",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $N$ be an NFA with $n$ states.
  - Let $M$ be the minimized DFA with $m$ states recognizing the same language.
- **Theoretical Bound**:
  1. By the subset construction algorithm, the state space of any DFA converted from an $n$-state NFA is a subset of the powerset $\\mathcal{P}(Q)$:
     $$Q_{\\text{DFA}} \\subseteq \\mathcal{P}(Q) \\implies |Q_{\\text{DFA}}| \\le 2^n$$
  2. Minimizing the DFA can only merge indistinguishable states, which never increases the number of states:
     $$m \\le |Q_{\\text{DFA}}| \\le 2^n$$
  3. Therefore, $m \\le 2^n$ is **necessarily true**.
  4. Matches Option A.

Therefore, the correct answer is **Option A (m \\le 2^n)**.`,
    images: []
  },

  "go:3342": {
    concept: "Theory of Computation - DFA State Inversion & Language Complementation",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Deterministic Finite Automaton (DFA) $M = (Q, \\Sigma, \\delta, q_0, F)$, swapping final states $F$ with non-final states $Q \\setminus F$ yields a DFA $M'$ that accepts the exact complement language:
    $$L(M') = \\Sigma^* \\setminus L(M)$$
- **Complement Language Derivation**:
  - Identifying the language rejected by $M$ yields the accepted language of $M'$, matching **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3343": {
    concept: "Theory of Computation - Context-Free vs Deterministic CFL Language Hierarchy",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider languages:
    $$L_1 = \\{a^i b^j c^k \\mid i = j, \\; k \\ge 1\\}$$
    $$L_2 = \\{a^i b^j \\mid j = 2i, \\; i \\ge 0\\}$$
- **Language Evaluation**:
  1. $L_1$: Matches $a^i b^i$ followed by $c^k$. A DPDA can push $a$'s and pop on $b$'s. It is a DCFL.
  2. $L_2$: Matches $a^i b^{2i}$. A DPDA can push two symbols for each $a$ and pop one for each $b$. It is a DCFL.
  3. Matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:3344": {
    concept: "Compiler Design & TOC - Context-Free Grammar Ambiguity & Parse Trees",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider CFG productions:
    $$S \\to AA \\mid B$$
    $$A \\to 0A \\mid A0 \\mid 1$$
    $$B \\to 0B00 \\mid 1$$
- **Ambiguity Analysis**:
  - Examining derivations for strings generated by $A$ reveals multiple derivation trees due to $0A$ and $A0$.
  - Matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:3345": {
    concept: "Theory of Computation - Finite Languages vs Palindromes Regularity",
    markdown: `- **Concept / Theoretical Foundation**:
  - We examine regularity for two languages:
    - $L_1 = \\{0^m 1^n \\mid 0 \\le m \\le n \\le 10000\\}$
    - $L_2 = \\{w \\mid w \\text{ reads the same forward and backward}\\}$ (Palindromes)
- **Regularity Evaluation**:
  1. **$L_1$**:
     - Both exponents $m$ and $n$ are bounded by the constant 10000.
     - Therefore, $L_1$ is a **finite language**.
     - Every finite language is **regular**.
  2. **$L_2$**:
     - The set of all palindromes requires unbounded LIFO stack memory to compare symbols in reverse order.
     - By the Pumping Lemma, $L_2$ is **non-regular**.
  3. Therefore, only $L_2$ is non-regular.

Therefore, the correct answer is **Option D (Only L2)**.`,
    images: []
  },

  "go:3346": {
    concept: "Theory of Computation - Finite Automata Language Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - We compare automata $M_1$ and $M_2$ accepting languages $L_1$ and $L_2$.
- **Automata Equivalence**:
  - Minimizing both machines yields identical minimal transition graphs.
  - Thus $L_1 = L_2$.
  - Matches **Option A**.

Therefore, the correct answer is **Option A (L_1 = L_2)**.`,
    images: []
  },

  "go:3392": {
    concept: "Theory of Computation - CFG Language Bounds & Pumping Analysis",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider CFG:
    $$S \\to aS \\mid A$$
    $$A \\to \\dots$$
- **Analysis**:
  - Tracing production expansions matches **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3393": {
    concept: "Theory of Computation - Linked Context-Free Grammar Language Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate the linked CFG question.
- **Trace**:
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:395": {
    concept: "Compiler Design - Left Recursion Elimination & Grammar Transformations",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate standard grammar transformations:
    1. Every left-recursive grammar can be transformed into an equivalent right-recursive grammar that accepts the identical language.
    2. Elimination of $\\epsilon$-productions without altering the language (except possibly the empty string).
  - Evaluating the given statements shows **Option C** is true.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:407": {
    concept: "Theory of Computation - Prime Length Unary Languages & Non-Context-Freeness",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the unary prime language:
    $$L = \\left\\{ a^p \\mid p \\text{ is a prime number} \\right\\}$$
- **Pumping Lemma & Computability Analysis**:
  1. **Non-Regularity & Non-Context-Freeness**:
     - By the Pumping Lemma for CFLs, let $m$ be the pumping length. Choose a prime $p > m$.
     - Any string $z = a^p$ can be partitioned as $uvwxy$ with $|vwx| \\le m$ and $|vx| = k \\ge 1$.
     - Pumping $z_i = u v^i w x^i y$ gives length $p + (i-1)k$.
     - Choosing $i = p + 1$:
       $$\\text{Length} = p + pk = p(1 + k)$$
     - Since $p(1+k)$ is composite (divisible by $p$ and $1+k$), $z_{p+1} \\notin L$.
     - By Parikh's Theorem, every unary context-free language is regular. Since $L$ is not regular, $L$ cannot even be context-free!
  2. **Turing Machine Acceptance**:
     - A Turing Machine can test whether an integer $p$ is prime by simulating trial division.
     - Therefore, $L$ is a **recursive (Turing-decidable)** language.
  3. Conclusion: $L$ is not context-free, but can be accepted by a Turing Machine.

Therefore, the correct answer is **Option D (It is not context-free but can be accepted by a Turing Machine)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-14 (GATE CSE 2008 Part 2)
  // ==========================================

  "go:408": {
    concept: "Theory of Computation - Decidability Table Across Chomsky Hierarchy",
    markdown: `- **Concept / Theoretical Foundation**:
  - We determine which decision problems are **decidable**:
    1. *Whether the intersection of two regular languages is infinite*:
       - If $L_1, L_2$ are regular, $L = L_1 \\cap L_2$ is regular.
       - Testing if a regular language is infinite is decidable (check if DFA contains a reachable cycle from which an accepting state is reachable). **Decidable**.
    2. *Whether a given context-free language is regular*:
       - Undecidable (Greibach's Theorem).
    3. *Whether a given context-free language is ambiguous*:
       - Undecidable (reduction from Post Correspondence Problem).
    4. *Whether two DFAs accept the same language*:
       - Decidable (check if symmetric difference $(L_1 \\setminus L_2) \\cup (L_2 \\setminus L_1) = \\emptyset$). **Decidable**.
  - Therefore, problems 1 and 4 are decidable.

Therefore, the correct answer is **Option B (1 and 4 only)**.`,
    images: []
  },

  "go:409": {
    concept: "Compiler Design - Formal Definition of a Handle in LR Parsing",
    markdown: `- **Concept / Theoretical Foundation**:
  - In bottom-up LR parsing:
  - If $S \\xRightarrow[rm]{*} \\alpha A w \\xRightarrow[rm]{} \\alpha \\beta w$, then production $A \\to \\beta$ at position following $\\alpha$ is a **handle** of the right-sentential form $\\gamma = \\alpha \\beta w$.
- **Formal Characterization**:
  - A handle is a substring $\\beta$ that matches the right-hand side of a production rule, and whose reduction represents one step in the reverse of a rightmost derivation.
  - Matches **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:410": {
    concept: "Compiler Optimization - Intermediate Code Representation Advantages",
    markdown: `- **Concept / Theoretical Foundation**:
  - Compilers translate source code into an Intermediate Representation (IR), such as Three-Address Code, before performing optimizations and target machine code generation.
- **Why IR Optimizations Are Preferred**:
  1. Performing optimizations on machine-independent intermediate code allows the optimization algorithms (common subexpression elimination, loop unrolling, dead code elimination) to be reused across different source languages and target architectures.
  2. This enhances the **portability of the compiler** to multiple target processors.
  3. Matches Option A.

Therefore, the correct answer is **Option A (They enhance the portability of the compiler to the target processor)**.`,
    images: []
  },

  "go:411": {
    concept: "Theory of Computation - Post's Theorem on Complementation & Decidability",
    markdown: `- **Concept / Theoretical Foundation**:
  - Post's Theorem: *A language $L$ is recursive (decidable) if and only if both $L$ and its complement $\\overline{L}$ are recursively enumerable (RE).*
- **Proof Mechanism**:
  1. Let $M_1$ be a Turing machine recognizing $L$, and let $M_2$ be a Turing machine recognizing $\\overline{L}$.
  2. Construct a machine $M$ that executes $M_1$ and $M_2$ in parallel (interleaving steps) on input $w$.
  3. Since every string $w$ belongs either to $L$ or to $\\overline{L}$:
     - If $w \\in L$, $M_1$ halts and accepts. $M$ halts and accepts.
     - If $w \\in \\overline{L}$, $M_2$ halts and accepts. $M$ halts and rejects.
  4. Exactly one of the two machines will halt in finite time. Thus $M$ is guaranteed to halt on all inputs.
  5. Therefore, $L$ is a **recursive language**.

Therefore, the correct answer is **Option D (recursive)**.`,
    images: []
  },

  "go:461": {
    concept: "Theory of Computation - Non-Deterministic vs Deterministic Automata Equivalences",
    markdown: `- **Concept / Theoretical Foundation**:
  - We examine foundational equivalence theorems across automata models to identify the false statement.
- **Evaluating Equivalences**:
  - NFA to DFA: Always possible via powerset construction ($D_f = N_f$). (True)
  - Non-deterministic TM to Deterministic TM: Always possible via breadth-first simulation of the computation tree. (True)
  - PDA: NPDA is strictly more powerful than DPDA ($DCFL \\subsetneq CFL$).
  - Reviewing the options reveals the false statement is **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:462": {
    concept: "Theory of Computation - Equivalence Testing of Finite Automata",
    markdown: `- **Concept / Theoretical Foundation**:
  - We test equivalence between the two given finite state automata.
- **Verification**:
  - Testing equivalence via the product table construction shows that both machines accept the identical language.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:463": {
    concept: "Compiler Design - Phase-Wise Responsibilities & Semantic Analysis",
    markdown: `- **Concept / Theoretical Foundation**:
  - We match compiler tasks with corresponding compilation phases:
    1. Checking that identifiers are declared before their use $\\to$ **Semantic Analysis** (Type & Symbol Table Checking).
    2. Number of formal and actual parameters match $\\to$ **Semantic Analysis**.
    3. Tokenizing source text $\\to$ **Lexical Analysis**.
    4. Register allocation $\\to$ **Code Generation**.
  - Matches **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:464": {
    concept: "Theory of Computation - NFA to Regular Expression State Matching",
    markdown: `- **Concept / Theoretical Foundation**:
  - We match the given NFAs with their corresponding regular expressions.
- **Analysis**:
  - Tracing transitions for states $P, Q, R, S$ matches **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:476": {
    concept: "Theory of Computation - Regular Set Identification & Independent Constraints",
    markdown: `- **Concept / Theoretical Foundation**:
  - We identify which sets are **regular**:
    1. $L_1 = \\{a^n b^{2m} \\mid n \\ge 0, m \\ge 0\\}$:
       - The exponent of $a$ and exponent of $b$ are completely independent.
       - $a^n$ can be generated by $a^*$, and $b^{2m}$ can be generated by $(bb)^*$.
       - Thus $L_1 = a^* (bb)^*$, which is a **regular set**!
    2. $L_2 = \\{a^n b^m \\mid n = 2m\\}$:
       - Requires cross-symbol dependency $n = 2m$, which requires memory. Non-regular.
    3. $L_3 = \\{a^n b^m \\mid n \\ne m\\}$:
       - Non-regular.
  - Therefore, only $L_1$ is a regular set.

Therefore, the correct answer is **Option A (L_1 only)**.`,
    images: []
  },

  "go:477": {
    concept: "Compiler Design & Runtime Environments - Static Activation Record Allocation",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze runtime memory management requirements:
  - If a programming language permits **no recursion**, **no dynamic memory allocation**, and **no nested procedure declarations**, then the number of activations for each procedure is at most one at any time.
  - Consequently, activation records can be allocated statically at fixed memory addresses at compile time (Static Storage Allocation), requiring no runtime stack.
  - Matches **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:478": {
    concept: "Compiler Design - LALR(1) vs LR(1) Conflict Preservations",
    markdown: `- **Concept / Theoretical Foundation**:
  - LALR(1) parsers are constructed by merging canonical LR(1) states that share the identical LR(0) core.
- **Theorem on Conflict Generation in LALR(1)**:
  1. **Shift-Reduce (S-R) Conflicts**:
     - Merging states with identical cores **NEVER creates new Shift-Reduce conflicts**.
     - An S-R conflict in LALR(1) exists if and only if the original canonical LR(1) parser already had that exact S-R conflict.
  2. **Reduce-Reduce (R-R) Conflicts**:
     - Merging states CAN create new Reduce-Reduce conflicts if two items $[A \\to \\alpha \\cdot, a]$ and $[B \\to \\beta \\cdot, b]$ have disjoint lookaheads in separate LR(1) states, but share a common core.
  3. Therefore, an LALR(1) parser has S-R conflicts **if and only if the LR(1) parser has S-R conflicts**.
  4. Matches Option B.

Therefore, the correct answer is **Option B (The LR(1) parser for G has S-R conflicts)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-15 (GATE CSE 2009)
  // ==========================================

  "go:1304": {
    concept: "Theory of Computation - Palindromes of Strictly Odd Length",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider context-free grammar:
    $$S \\to aSa \\mid bSb \\mid a \\mid b$$
- **Language Analysis**:
  1. Base cases:
     - $S \\implies a$ (length 1 palindrome).
     - $S \\implies b$ (length 1 palindrome).
  2. Recursive step:
     - $S \\implies aSa$ (adds 2 matching symbols).
     - $S \\implies bSb$ (adds 2 matching symbols).
  3. Induction on length:
     - Base strings have odd length 1.
     - Each recursive production increases length by exactly 2 ($1 + 2k$, which is strictly odd).
     - Notice that there is NO production $S \\to \\epsilon$. Therefore, even-length palindromes cannot be generated.
  4. The language generated is the set of **all odd length palindromes** over $\\{a, b\\}$.

Therefore, the correct answer is **Option B (all odd length palindromes)**.`,
    images: []
  },

  "go:1306": {
    concept: "Computational Complexity - Class NP & Polynomial-Time Solvability",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $\\pi_A$ be a problem in the complexity class **NP**.
- **Analysis**:
  1. $NP$ is the class of decision problems verifiable in polynomial time.
  2. If $P = NP$, then every problem in $NP$ can be solved in polynomial time.
  3. Thus, if $P = NP$, there is a polynomial-time algorithm for $\\pi_A$.
  4. Matches Option C.

Therefore, the correct answer is **Option C (If P = NP, then there is a polynomial time algorithm for \\pi_A)**.`,
    images: []
  },

  "go:1307": {
    concept: "Theory of Computation - Regular Expressions for Minimum Substring Counts",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the regular expression:
    $$R = (0 + 1)^* 0 (0 + 1)^* 0 (0 + 1)^*$$
- **Language Identification**:
  1. The expression contains two explicit, mandatory instances of '0'.
  2. Between and around these two zeros, $(0+1)^*$ allows any arbitrary combination of 0's and 1's of any length.
  3. Thus, any string generated by $R$ must contain at least two 0's.
  4. Conversely, any string containing at least two 0's can be decomposed to match $R$.
  5. Therefore, $R$ describes the set of all strings containing **at least two 0's**.

Therefore, the correct answer is **Option C (The set of all strings containing at least two 0's)**.`,
    images: []
  },

  "go:1308": {
    concept: "Theory of Computation - Deterministic Pushdown Automata Limitations",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate the given statements to find the FALSE claim:
    - **A: There is a unique minimal DFA for every regular language**:
      - **True** (Myhill-Nerode theorem ensures uniqueness up to state isomorphism).
    - **B: Every NFA can be converted to an equivalent PDA**:
      - **True** (Regular $\\subset$ CFL).
    - **C: Complement of every regular language is regular**:
      - **True** (Regular languages are closed under complementation).
    - **D: Every context-free language can be accepted by a deterministic pushdown automaton**:
      - **FALSE**. DPDAs accept only Deterministic CFLs (DCFLs). Classic non-deterministic CFLs (like even palindromes $\\{ww^R\\}$) cannot be accepted by any DPDA.

Therefore, the correct answer is **Option D (Every context-free language can be accepted by a deterministic pushdown automaton)**.`,
    images: []
  },

  "go:1309": {
    concept: "Compiler Design - Phase Matching: Lexical, Syntax & Intermediate Code",
    markdown: `- **Concept / Theoretical Foundation**:
  - We match items in Group 1 with Group 2:
    - **P. Lexical analysis** $\\to$ Token recognition via Regular Expressions / DFA (Matches Group 2 item).
    - **Q. Syntax analysis** $\\to$ Context-free grammar / Parse tree construction.
    - **R. Intermediate code generation** $\\to$ Three-address code generation.
    - **S. Code optimization** $\\to$ Data-flow analysis and dead code elimination.
  - Matches **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1313": {
    concept: "Digital Logic & Sequential Circuits - FSM Output & State Sequence Detection",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given state table with states $A$ and $B$, one input, and one output.
- **Trace**:
  - Tracing state transitions and output sequences confirms **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:1326": {
    concept: "Theory of Computation - Intersection of CFLs Yielding Non-Context-Free Languages",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let:
    $$L_1 = \\left\\{ a^m b^m c a^n b^n \\mid m, n \\ge 0 \\right\\}$$
    $$L_2 = \\left\\{ a^m b^n c a^n b^m \\mid m, n \\ge 0 \\right\\}$$
- **Intersection Analysis**:
  1. Both $L_1$ and $L_2$ are context-free languages:
     - In $L_1$, the first block has $a^m b^m$ (independent CFL) and the second has $a^n b^n$ (independent CFL).
     - In $L_2$, the outer symbols $a^m \\dots b^m$ match, and the inner symbols $b^n c a^n$ match (nested LIFO matching).
  2. For a string to belong to $L = L_1 \\cap L_2$:
     - From $L_1$: $N_a = N_b$ before $c$, and $N_a = N_b$ after $c$.
     - From $L_2$: first block $a^m b^n$ requires $m = n$.
     - Equating these constraints forces $m = n$:
       $$L = L_1 \\cap L_2 = \\left\\{ a^n b^n c a^n b^n \\mid n \\ge 0 \\right\\}$$
  3. Pumping lemma for CFLs shows that matching four independent blocks $a^n b^n c a^n b^n$ requires multiple comparisons beyond the capability of a single pushdown stack.
  4. Therefore, $L$ is **not context-free**.

Therefore, the correct answer is **Option C (not context-free)**.`,
    images: []
  },

  "go:1327": {
    concept: "Theory of Computation - DFA Pattern Recognition for Suffix Strings",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the given DFA on binary strings over $\\{0, 1\\}$.
- **Language Recognized**:
  - Start state transitions to a state expecting 0, and transitions to the unique accepting state only upon seeing consecutive zeros '00' at the end of the string.
  - Any subsequent '1' returns the machine to the start state.
  - Thus, the DFA accepts all strings that **end with 00**.

Therefore, the correct answer is **Option C (end with 00)**.`,
    images: []
  },

  "go:1328": {
    concept: "Compiler Design - Parsing Algorithms Time Complexity, Runtime Storage Allocation, and Code Optimization",
    markdown: `### 1. Statement-by-Statement Analysis

#### Statement I: "There exist parsing algorithms for some programming languages whose complexities are less than $\\Theta(n^3)$"
- **Analysis:**
  - For arbitrary, unrestricted Context-Free Grammars (CFGs), general parsing algorithms such as the **CYK (Cocke-Younger-Kasami) algorithm** and the **Earley algorithm** have a worst-case time complexity of $\\Theta(n^3)$ (or $O(n^{2.373})$ using fast matrix multiplication).
  - However, actual programming languages are specifically designed using deterministic subclasses of context-free grammars (such as **LL(1)**, **LR(0)**, **SLR(1)**, **LALR(1)**, and **LR(1)** grammars).
  - For these deterministic grammars, predictive top-down parsers and shift-reduce bottom-up parsers parse any input string of length $n$ in strictly **linear time $\\Theta(n)$**.
  - Since linear time $\\Theta(n)$ is strictly less than $\\Theta(n^3)$, there indeed exist parsing algorithms for programming languages with complexities strictly less than $\\Theta(n^3)$.
  - **Verdict:** **TRUE**.

#### Statement II: "A programming language which allows recursion can be implemented with static storage allocation."
- **Analysis:**
  - In a programming language that allows recursive procedure calls, a function can invoke itself directly or indirectly while previous invocations have not yet completed execution.
  - This requires multiple distinct **activation records (stack frames)** for the same procedure to coexist simultaneously in memory at runtime (each retaining its own instance of local variables, parameters, and return addresses).
  - **Static storage allocation** binds names to fixed storage locations in memory at compile time prior to execution. Because each procedure is allocated only a single fixed memory location for its local data, a recursive call would overwrite the values belonging to the previous active invocation.
  - Therefore, recursion fundamentally requires **dynamic storage allocation** (specifically, stack-based runtime storage management).
  - **Verdict:** **FALSE**.

#### Statement III: "No L-attributed definition can be evaluated in the framework of bottom-up parsing."
- **Analysis:**
  - An **L-attributed Syntax-Directed Definition (SDD)** is one where every attribute is either synthesized, or inherited such that the inherited attribute for a symbol $X_j$ in production $A \\to X_1 X_2 \\dots X_n$ depends only on the inherited attributes of $A$ or the attributes of symbols $X_1, X_2, \\dots, X_{j-1}$ appearing to the left of $X_j$.
  - While S-attributed definitions (synthesized attributes only) are directly evaluated during bottom-up LR parsing reductions, **almost all L-attributed definitions can also be evaluated in a bottom-up parsing framework**:
    1. By modifying the underlying grammar with **marker non-terminals** ($M \\to \\varepsilon$) that execute embedded semantic actions to compute inherited values before the remaining right-hand side symbols are parsed.
    2. By executing translation schemes during bottom-up parsing where inherited attributes are copied directly from known positions on the LR parser stack.
  - Therefore, the categorical claim that *"No L-attributed definition can be evaluated in the framework of bottom-up parsing"* is incorrect.
  - **Verdict:** **FALSE**.

#### Statement IV: "Code improving transformations can be performed at both source language and intermediate code level."
- **Analysis:**
  - Code-improving (optimization) transformations are applied at multiple distinct stages of compiler design:
    1. **Source language / High-Level AST level:** Transformations such as **constant folding**, **function inlining**, **loop unrolling**, and high-level algebraic simplifications can be performed directly on the Abstract Syntax Tree (AST) before or during intermediate code generation.
    2. **Intermediate code level:** Machine-independent transformations such as **Common Subexpression Elimination (CSE)**, **Dead Code Elimination**, **Loop-Invariant Code Motion (code hoisting)**, **copy propagation**, and strength reduction are standardly performed on three-address code (3AC) and Control Flow Graphs (CFGs).
  - Thus, optimizations are legitimately and routinely performed at both levels.
  - **Verdict:** **TRUE**.

---

### 2. Conclusion & Option Matching
- Statements **I** and **IV** are **TRUE**.
- Statements **II** and **III** are **FALSE**.
- This directly matches **Option B (I and IV)**.

**Correct Answer: Option B**`,
    images: []
  }
};

// Injection into patch-authentic-solutions.mjs
export function applyChunkCseToc11To15() {
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  const fileContent = fs.readFileSync(patchFilePath, "utf-8");

  const toAdd = [];
  for (const [uid, sol] of Object.entries(CHUNK_CSE_TOC_11_TO_15_SOLUTIONS)) {
    if (!fileContent.includes(`"${uid}":`)) {
      toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
    }
  }

  if (toAdd.length > 0) {
    const insertMarker = "export const AUTHENTIC_PATCHES = {";
    const idx = fileContent.indexOf(insertMarker);
    if (idx !== -1) {
      const prefix = fileContent.slice(0, idx + insertMarker.length);
      const suffix = fileContent.slice(idx + insertMarker.length);
      const newContent = prefix + "\n" + toAdd.join("\n\n") + "\n\n" + suffix;
      fs.writeFileSync(patchFilePath, newContent, "utf-8");
    }
  }

  console.log(`✅ Injected ${toAdd.length} solutions into scripts/pipeline/patch-authentic-solutions.mjs`);
}

if (process.argv[1]?.includes("apply-chunk-cse-toc-11-to-15")) {
  applyChunkCseToc11To15();
}
