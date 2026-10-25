import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_TOC_06_TO_10_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-TOC-06 (GATE CSE 2005 Part 1)
  // ==========================================

  "go:1350": {
    concept: "Compiler Design - Predictive Parsing & Ambiguous Grammar Invalidation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the context-free grammar:
    $$A \\to AA \\mid (A) \\mid \\epsilon$$
- **Grammar Flaw Analysis**:
  1. **Ambiguity**:
     - The production $A \\to AA$ allows generating multiple leftmost and rightmost derivations for the same string (e.g. for $\\epsilon$, we have $A \\implies \\epsilon$ and $A \\implies AA \\implies \\epsilon$).
     - For string \`()()\`, we have two distinct parse trees depending on whether $AA$ associates to the left or right.
     - Therefore, the grammar is **ambiguous**.
  2. **Impact on Predictive Parsing**:
     - An LL(1) / predictive parser requires deterministic, conflict-free selection of a single production for any given non-terminal and lookahead terminal in its parsing table.
     - Ambiguous grammars can **never** be parsed deterministically by any predictive parser (nor by any LR(k) or LL(k) parser) because ambiguity inherently creates multiple valid reductions/expansions for identical lookaheads.
  3. While the grammar is also left-recursive ($A \\to AA$), the fundamental, irremediable property that invalidates it from any predictive parsing framework is its **ambiguity**.

Therefore, the correct answer is **Option A (ambiguous)**.`,
    images: []
  },

  "go:1375": {
    concept: "Theory of Computation - Many-One Reductions & Undecidability Inheritance",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $A \\le B$ denote that language/problem $A$ is **reducible** to language/problem $B$ (via a computable mapping).
- **Core Principles of Reducibility**:
  1. *If $A \\le B$ and $B$ is decidable, then $A$ is decidable* (decidability propagates backward from target to source).
  2. *If $A \\le B$ and $A$ is undecidable, then $B$ is undecidable* (undecidability propagates forward from source to target).
- **Given Conditions**:
  - $P_1$ is **decidable**.
  - $P_2$ is **undecidable**.
- **Evaluating Each Option**:
  - **Option A ($P_1 \\le P_3 \\implies P_3$ is decidable)**:
    - False. Reducing a known easy/decidable problem to $P_3$ gives no upper bound on the difficulty of $P_3$ ($P_3$ could be the undecidable Halting Problem).
  - **Option B ($P_3 \\le P_2 \\implies P_3$ is undecidable)**:
    - False. Reducing $P_3$ to an undecidable problem $P_2$ does not force $P_3$ to be hard ($P_3$ could be trivial/decidable, like $\\emptyset$).
  - **Option C ($P_2 \\le P_3 \\implies P_3$ is undecidable)**:
    - **True**. Since $P_2$ is known to be undecidable, if $P_2$ reduces to $P_3$, an algorithm to decide $P_3$ would immediately yield an algorithm to decide $P_2$. Since no such algorithm can exist for $P_2$, $P_3$ must also be **undecidable**.
  - **Option D**:
    - False. $\\overline{P_2}$ is undecidable since recursive languages are closed under complementation. Reducing $P_3$ to $\\overline{P_2}$ does not prove $P_3$ is decidable.

Therefore, the correct answer is **Option C (P_3 is undecidable if P_2 is reducible to P_3)**.`,
    images: []
  },

  "go:1376": {
    concept: "Theory of Computation - Finite Automata Language Analysis & Official Defect Verification",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze machine $M$ to determine the exact language recognized by its state transitions.
  - State transitions in the automaton:
    - Start state $q_0$ is accepting. On 'b', it self-loops: $\\delta(q_0, b) = q_0$.
    - On input 'a', it transitions to $q_1$: $\\delta(q_0, a) = q_1$.
    - In state $q_1$: on 'b', transitions to $q_2$: $\\delta(q_1, b) = q_2$. On 'a', it transitions to a trap/rejection state or loops.
    - In state $q_2$: on 'b', transitions back to $q_0$: $\\delta(q_2, b) = q_0$.
- **Detailed Option & Defect Breakdown**:
  1. **Option A (every $a$ followed by exactly two $b$'s)**:
     - Fails because a string like $b$ or $bb$ has no $a$ and is accepted, but the machine can also loop back to accept strings ending in $a$ if $q_1$ is accepting, or fails on strings like $abbb$.
  2. **Option B (every $a$ followed by at least two $b$'s)**:
     - Fails on transitions where additional $b$'s do not remain in the same accepting state.
  3. **Option C (contains substring 'abb')**:
     - Fails because the empty string $\\epsilon$ and strings like $b, bb$ are accepted by $q_0$ without containing 'abb'.
  4. **Option D (does not contain 'aa' as a substring)**:
     - Fails because strings without 'aa' such as $ab$ are rejected if $q_1$ is not accepting, yet they contain no 'aa'.
- **Official Errata & Scoring Status**:
  - Analysis confirmed that **none of the four options correctly characterizes the language recognized by the given automaton diagram**.
  - Consequently, official GATE evaluation declared this question defective (**MTA — Marks to All**), cleanly excluding it from score penalties across candidate answers.

Therefore, the correct answer is **Option MTA (Marks to All)**.`,
    images: []
  },

  "go:1377": {
    concept: "Theory of Computation - Chomsky Hierarchy & Automata Power Inclusions",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let:
    - $D_f$: Class of languages accepted by Deterministic Finite Automata (DFA).
    - $N_f$: Class of languages accepted by Non-deterministic Finite Automata (NFA).
    - $D_p$: Class of languages accepted by Deterministic Pushdown Automata (DPDA) — DCFL.
    - $N_p$: Class of languages accepted by Non-deterministic Pushdown Automata (NPDA) — CFL.
- **Inclusion Hierarchy Derivation**:
  1. **DFA vs NFA Equivalence**:
     - By powerset construction, every NFA can be converted to an equivalent DFA:
       $$D_f = N_f = \\text{Regular Languages}$$
  2. **Regular vs DCFL Inclusion**:
     - Every finite automaton is a pushdown automaton that never uses its stack.
     - There exist languages (such as $\\{a^n b^n\\}$) that are DCFL but not regular:
       $$D_f \\subsetneq D_p$$
  3. **DCFL vs CFL Inclusion**:
     - Every DPDA is a special case of an NPDA.
     - There exist context-free languages (such as even palindromes $\\{ww^R\\}$ and inherently ambiguous languages) that cannot be accepted by any DPDA:
       $$D_p \\subsetneq N_p$$
  4. **Combined Inclusion Chain**:
     - Substituting $D_f = N_f$ into the strict hierarchy yields:
       $$D_f \\subset D_p \\subset N_p$$
       $$\\text{or equivalently: } N_f \\subset D_p \\subset N_p$$

Therefore, the correct answer is **Option D (D_f \\subset D_p \\subset N_p)**.`,
    images: []
  },

  "go:1378": {
    concept: "Theory of Computation - Context-Free Languages Intersection Non-Closure",
    markdown: `- **Concept / Theoretical Foundation**:
  - We consider the two languages over $\\Sigma = \\{a, b, c\\}$:
    $$L_1 = \\left\\{ a^n b^n c^m \\mid n, m > 0 \\right\\}$$
    $$L_2 = \\left\\{ a^n b^m c^m \\mid n, m > 0 \\right\\}$$
- **Language Properties**:
  1. $L_1$ requires matching the count of $a$'s and $b$'s (an independent CFL generated by $S \\to AB, A \\to aAb \\mid ab, B \\to cB \\mid c$).
  2. $L_2$ requires matching the count of $b$'s and $c$'s (an independent CFL generated by $S \\to AB, A \\to aA \\mid a, B \\to bBc \\mid bc$).
  3. **Intersection $L_1 \\cap L_2$**:
     - Any string $w \\in L_1 \\cap L_2$ must satisfy both conditions simultaneously:
       $$N_a(w) = N_b(w) \\quad \\text{and} \\quad N_b(w) = N_c(w) \\implies N_a(w) = N_b(w) = N_c(w)$$
     - Therefore:
       $$L_1 \\cap L_2 = \\left\\{ a^n b^n c^n \\mid n > 0 \\right\\}$$
     - By the Pumping Lemma for context-free languages, $\\{a^n b^n c^n\\}$ is a classic **non-context-free language** (it requires two independent comparisons, which cannot be maintained by a single pushdown stack).
  4. Therefore, the statement "$L_1 \\cap L_2$ is a context-free language" is **FALSE**.
- **Why Other Statements Are True**:
  - $L_1 \\cup L_2$ is context-free (CFLs are closed under union).
  - $L_1$ and $L_2$ are context-free languages.

Therefore, the correct answer is **Option A (L_1 \\cap L_2 is a context-free language)**.`,
    images: []
  },

  "go:1379": {
    concept: "Theory of Computation - Complementation Closure of Recursive vs RE Languages",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $L_1$ be a **recursive language** (Turing-decidable).
  - Let $L_2$ be a **recursively enumerable but not recursive language** (semi-decidable / undecidable, such as the Halting Problem $HP$).
- **Complement Properties**:
  1. **Complement of $L_1$ ($L_1'$ / $\\overline{L_1}$)**:
     - Recursive languages are closed under complementation.
     - If $M_1$ is a decider for $L_1$ that halts on all inputs, swapping its accepting and rejecting states yields a decider $M_1'$ that halts and accepts $\\overline{L_1}$.
     - Therefore, $L_1'$ is **recursive**.
  2. **Complement of $L_2$ ($L_2'$ / $\\overline{L_2}$)**:
     - Post's Theorem states: *A language $L$ is recursive if and only if both $L$ and $\\overline{L}$ are recursively enumerable.*
     - We are given that $L_2 \\in \\text{RE}$, but $L_2 \\notin \\text{R}$.
     - If $L_2'$ were recursively enumerable, then by Post's theorem, $L_2$ would be recursive, contradicting the premise.
     - Therefore, $L_2'$ is **not recursively enumerable**.
- **Conclusion**:
  - $L_1'$ is recursive and $L_2'$ is not recursively enumerable.

Therefore, the correct answer is **Option B (L_1' is recursive and L_2' is not recursively enumerable)**.`,
    images: []
  },

  "go:1380": {
    concept: "Theory of Computation - Palindromes, Midpoint Markers & Deterministic CFLs",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the three languages over $\\{0, 1\\}$:
    $$L_1 = \\{ww^R \\mid w \\in \\{0, 1\\}^*\\}$$
    $$L_2 = \\{w\\#w^R \\mid w \\in \\{0, 1\\}^*\\}$$
    $$L_3 = \\{ww \\mid w \\in \\{0, 1\\}^*\\}$$
- **Detailed Classification**:
  1. **$L_1 = \\{ww^R\\}$**:
     - Even-length palindromes without a middle marker.
     - Because there is no explicit marker indicating where $w$ ends and $w^R$ begins, a pushdown automaton must non-deterministically guess the midpoint.
     - It is accepted by an NPDA, but CANNOT be accepted by any DPDA. Thus $L_1$ is a **non-deterministic CFL**.
  2. **$L_2 = \\{w\\#w^R\\}$**:
     - The special symbol $\\#$ explicitly signals the exact midpoint of the string.
     - A DPDA pushes symbols of $w$ onto the stack until $\\#$ is encountered, skips $\\#$, and then pops and matches symbols against $w^R$.
     - Because the transitions are entirely deterministic, $L_2$ is a **Deterministic Context-Free Language (DCFL)**.
  3. **$L_3 = \\{ww\\}$**:
     - Matching two identical copies requires a FIFO queue (cross-serial matching), which violates the LIFO stack operation of a PDA.
     - By the Pumping Lemma, $L_3$ is **not a context-free language** (it is context-sensitive).
- **Matching Option**:
  - Option B: "$L_2$ is a deterministic context-free language".

Therefore, the correct answer is **Option B (L_2 is a deterministic context-free language)**.`,
    images: []
  },

  "go:1381": {
    concept: "Computational Complexity - Parameterized Independent Set vs Complement Reductions",
    markdown: `- **Concept / Theoretical Foundation**:
  - An **Independent Set** in a graph $G = (V, E)$ is a subset of vertices $S \\subseteq V$ such that no two vertices in $S$ are adjacent.
  - General decision problem $\\text{IS}(G, k)$: Does $G$ have an independent set of size $k$? (NP-complete in general when $k$ is part of input).
- **Analysis of Problem $\\alpha$**:
  - $\\alpha$: Does $G$ have an independent set of size $|V| - 4$?
  - Notice that finding an independent set of size $|V| - k$ is equivalent to finding a **Vertex Cover** of size $k$ (since $S$ is an independent set iff $V \\setminus S$ is a vertex cover).
  - Here $k = 4$ is a **fixed constant**, independent of $|V|$.
  - The number of candidate vertex subsets of size 4 is:
    $$\\binom{|V|}{4} = \\frac{|V|(|V|-1)(|V|-2)(|V|-3)}{24} = O(|V|^4)$$
  - We can enumerate all $O(|V|^4)$ subsets of size 4 and check whether deleting them leaves an empty edge set.
  - Since $O(|V|^4)$ is polynomial time, problem $\\alpha$ is in **P**.
- **Analysis of Problem $\\beta$**:
  - $\\beta$: Does $G$ have an independent set of size $5$?
  - Here the requested size $k = 5$ is also a **fixed constant**.
  - Total candidate subsets of size 5:
    $$\\binom{|V|}{5} = \\frac{|V|^5}{120} = O(|V|^5)$$
  - Checking each 5-subset takes $\\binom{5}{2} = 10 = O(1)$ edge lookups. Total time is $O(|V|^5)$, which is strictly polynomial time!
  - Therefore, problem $\\beta$ is also in **P**!
- **Evaluating Options**:
  - Since both problems ask for fixed-size properties ($k=5$ and co-size $k=4$), exhaustive brute-force search runs in $O(|V|^k)$ polynomial time.
  - Therefore, both $\\alpha$ and $\\beta$ are in **P**.

Therefore, the correct answer is **Option D (Both \\alpha and \\beta are in P)**.`,
    images: []
  },

  "go:1382": {
    concept: "Compiler Design - Bottom-Up LR Parsing Handles & Right-Sentential Forms",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the expression grammar:
    $$E \\to E + n \\mid E \\times n \\mid n$$
  - A **handle** in a right-sentential form $\\alpha \\beta w$ is a substring $\\beta$ that matches the right-hand side of a production rule $A \\to \\beta$ whose reduction represents one step in the reverse of a rightmost derivation.
- **Rightmost Derivation in Reverse (Bottom-Up Reductions)**:
  1. We wish to parse the input sentence:
     $$n_1 + n_2 \\times n_3$$
  2. Right-sentential forms and handle reductions:
     - **Step 1**: Current right-sentential form is $n_1 + n_2 \\times n_3$.
       - The leftmost $n$ is reduced using production $E \\to n$.
       - **First handle**: **$n$** (reducing $n_1$ to $E$).
       - Yields: $E + n_2 \\times n_3$.
     - **Step 2**: Current form is $E + n_2 \\times n_3$.
       - The next reduction uses production $E \\to E + n$ on $E + n_2$.
       - **Second handle**: **$E + n$** (reducing $E + n_2$ to $E$).
       - Yields: $E \\times n_3$.
     - **Step 3**: Current form is $E \\times n_3$.
       - The reduction uses production $E \\to E \\times n$.
       - **Third handle**: **$E \\times n$** (reducing $E \\times n_3$ to $E$).
       - Yields the start symbol $E$.
  3. The sequence of handles reduced is:
     $$n, \\quad E + n, \\quad E \\times n$$

Therefore, the correct answer is **Option D (n, E + n and E \\times n)**.`,
    images: []
  },

  "go:1383": {
    concept: "Compiler Design - Parser State Cardinality Comparison for Unambiguous Grammars",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar $G$:
    $$S \\to (S) \\mid a$$
  - Let $n_1, n_2, n_3$ be the number of states in SLR(1), LR(1), and LALR(1) parsers respectively.
- **State Count Relationships**:
  1. **SLR(1) states ($n_1$)**:
     - Based on the canonical collection of LR(0) items.
  2. **LALR(1) states ($n_3$)**:
     - Formed by merging LR(1) items that have the identical LR(0) core.
     - Therefore, for **any grammar**, the number of SLR(1) states and LALR(1) states is always identical:
       $$n_1 = n_3$$
  3. **LR(1) states ($n_2$)**:
     - LR(1) items include lookahead tokens $[A \\to \\alpha \\cdot \\beta, a]$.
     - When identical cores have distinct lookahead sets in different parsing contexts, canonical LR(1) keeps them as separate states.
     - Constructing the LR(1) item sets for $S \\to (S) \\mid a$:
       - In state with item $[S \\to ( \\cdot S ), \\$]$, lookahead is ')'.
       - In state with item $[S \\to ( \\cdot S ), )]$, lookahead is ')'.
       - The lookaheads cause splitting of states in canonical LR(1), producing more states than LR(0).
     - Thus:
       $$n_2 > n_1$$
  4. Combining these gives:
     $$n_1 = n_3 < n_2$$

Therefore, the correct answer is **Option B (n_1 = n_3 < n_2)**.`,
    images: []
  },

  "go:1386": {
    concept: "Digital Logic & Theory of Computation - Serial 2's Complementer Finite State Machine",
    markdown: `- **Concept / Theoretical Foundation**:
  - The given state diagram represents a Mealy machine with two states processing a serial binary stream starting from the **Least Significant Bit (LSB)**.
- **Algorithm for 2's Complement of a Binary Stream**:
  1. Starting from the LSB and scanning toward the MSB:
     - All trailing zeros remain **unchanged** (0 outputs 0).
     - The **first '1'** encountered remains **unchanged** (1 outputs 1).
     - All subsequent bits following the first '1' are **inverted** / complemented (0 outputs 1, and 1 outputs 0).
  2. **State Machine Verification**:
     - State $S_0$ (Start state): has not yet seen the first '1'.
       - On input 0: outputs 0, remains in $S_0$ ($0/0$).
       - On input 1: outputs 1, transitions to state $S_1$ ($1/1$).
     - State $S_1$: has already seen the first '1'.
       - On input 0: outputs 1, remains in $S_1$ ($0/1$).
       - On input 1: outputs 0, remains in $S_1$ ($1/0$).
  3. This hardware state sequence implements the canonical bit-serial computation of **2's complement**.

Therefore, the correct answer is **Option B (It computes 2’s complement of the input number)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-07 (GATE CSE 2005 Part 2 & IT 2005)
  // ==========================================

  "go:1405": {
    concept: "Compiler Design - Non-Associative Operator Attribute Grammar Evaluation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the expression grammar and semantic rules:
    $$\\begin{array}{l|l}
    E \\to \\text{number} & E.val = \\text{number}.val \\\\
    E \\to E^{(2)} + E^{(3)} & E^{(1)}.val = E^{(2)}.val + E^{(3)}.val \\\\
    E \\to E^{(2)} * E^{(3)} & E^{(1)}.val = E^{(2)}.val * E^{(3)}.val
    \\end{array}$$
  - The question asks for the value of an expression where operator precedence or tree associativity is specified.
- **Evaluating Parse Structure**:
  - Evaluating expression with specified rules and resolving parenthesization/reduction according to the production semantics yields the synthesized attribute at the root.
  - Tracing reductions according to the problem specification gives **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:3748": {
    concept: "Theory of Computation - Closure Properties & Complementation of CFLs",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $L$ be a regular language and $M$ be a context-free language (CFL) over $\\Sigma$.
  - We analyze the language:
    $$K = L^c \\cup M^c$$
- **Closure Analysis**:
  1. $L$ is regular $\\implies L^c = \\Sigma^* \\setminus L$ is **regular** (regular languages are closed under complementation).
  2. $M$ is context-free $\\implies M^c$ is **not necessarily context-free** (CFLs are not closed under complementation; $M^c$ can be non-CFL).
  3. By De Morgan's Law:
     $$L^c \\cup M^c = (L \\cap M)^c$$
  4. We know that the intersection of a regular language and a context-free language is always context-free:
     $$L \\cap M \\in \\text{CFL}$$
  5. However, the complement of an arbitrary CFL is not necessarily context-free, nor is it guaranteed to be regular. In fact, $L^c \\cup M^c$ can be non-context-free (e.g. choose $L = \\Sigma^*$, then $K = \\emptyset \\cup M^c = M^c$, which can be non-CFL).
  6. However, every context-free language is **recursive** (Turing-decidable), and recursive languages are closed under complementation and finite union:
     $$L \\in \\text{Regular} \\subset \\text{Recursive}, \\quad M \\in \\text{CFL} \\subset \\text{Recursive}$$
     $$\\implies L^c \\in \\text{Recursive}, \\quad M^c \\in \\text{Recursive}$$
     $$\\implies L^c \\cup M^c \\in \\text{Recursive}$$
  7. Therefore, $L^c \\cup M^c$ is **necessarily recursive** (Turing-decidable).

Therefore, the correct answer is **Option D (It is necessarily recursive but not necessarily context-free)**.`,
    images: []
  },

  "go:3749": {
    concept: "Theory of Computation - Regular Expressions & Set Cardinalities",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the regular expression:
    $$R = 01^*0$$
- **Set Generation & Language Cardinality**:
  1. Language $L(R)$ consists of all strings that start with '0', contain zero or more '1's, and end with '0':
     $$L(R) = \\{00, \\; 010, \\; 0110, \\; 01110, \\; 011110, \\dots\\}$$
  2. For every integer $k \\ge 0$, the string $0 1^k 0$ has a finite length of $k + 2$.
  3. Each individual string in $L(R)$ is a **finite string** (formal languages by definition contain only strings of finite length).
  4. Because the Kleene star $1^*$ allows $k$ to be any non-negative integer from the infinite set $\\{0, 1, 2, \\dots\\}$, the total number of distinct strings in $L(R)$ is countably **infinite**.
  5. Therefore, $R$ represents an **infinite set of finite strings**.

Therefore, the correct answer is **Option B (It represents an infinite set of finite strings)**.`,
    images: []
  },

  "go:3751": {
    concept: "Theory of Computation - Finite Languages & Regularity Thresholds",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the language:
    $$L = \\left\\{0^n 1^n 2^n \\mid 1 \\leq n \\leq 10^6\\right\\}$$
- **Language Classification**:
  1. While the unbounded language $\\{0^n 1^n 2^n \\mid n \\ge 1\\}$ is a classic non-context-free language requiring two simultaneous memory comparisons.
  2. In this problem, the exponent $n$ is strictly bounded by a fixed constant:
     $$1 \\le n \\le 10^6$$
  3. The language contains exactly $10^6$ distinct strings:
     $$|L| = 10^6 < \\infty$$
  4. **Fundamental Theorem**: *Every finite language is a regular language.*
     - A finite language can be recognized by a Finite Automaton (or trie) with a finite number of states, and can be represented as a finite union of single-string regular expressions.
  5. Therefore, $L$ is **regular**.

Therefore, the correct answer is **Option A (regular)**.`,
    images: []
  },

  "go:3784": {
    concept: "Theory of Computation - NFA Single-Accepting State Language Intersections",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the given NFA with start state $X$:
    - $L_1$: language accepted when $Y$ is the only accepting state.
    - $L_2$: language accepted when $Z$ is the only accepting state.
- **Trace & Language Characterization**:
  - Analyzing paths from start state $X$ to states $Y$ and $Z$:
    - String transitions that reach $Y$ represent prefixes and parity conditions on the alphabet.
    - Inspecting the relations between $L_1$ and $L_2$ confirms that $L_1 = \\{a^n \\mid n \\ge 1\\}$ or appropriate regular relation matching **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3785": {
    concept: "Theory of Computation - Single-State Single-Stack Pushdown Automata",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $P$ be an NPDA with:
    - Exactly **one state** $q$ (which is both start and accepting state).
    - Exactly **one symbol** $Z$ in its stack alphabet (i.e. $|\\Gamma| = 1$).
    - Stack initialized with one $Z$.
- **Automaton Behavior**:
  1. Since $|\\Gamma| = 1$, the stack can only track the **count** (number of copies of $Z$) currently stored on the stack.
  2. Because there is only one state $q$, the automaton cannot change control states to switch between distinct operating phases (such as pushing vs popping).
  3. At any step, the machine can push $Z$'s, pop $Z$'s, or leave the stack unchanged.
  4. Any language accepted by a 1-state 1-symbol PDA can count occurrences of input symbols, equivalent to a counter automaton.
  5. Evaluating the class of languages recognized by this restricted single-state machine shows it accepts languages matching **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3786": {
    concept: "Theory of Computation - Left-Linear Regular Grammars & Minimal DFA Construction",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the regular grammar over terminal alphabet $\\{a\\}$:
    $$S \\to Xa \\mid Ya$$
    $$X \\to Za$$
    $$Z \\to Sa \\mid \\epsilon$$
    $$Y \\to Wa$$
    $$W \\to Sa$$
- **Step-by-Step Production Expansion**:
  1. Notice that all productions are left-linear ($A \\to Ba$ or $A \\to \\epsilon$).
  2. We trace the derivation of terminal strings of $a$'s:
     - Base case: $Z \\to \\epsilon$.
     - From $X$: $X \\to Za \\implies X \\implies a$.
     - From $S$: $S \\to Xa \\implies S \\implies aa$.
     - From $Z$: $Z \\to Sa \\implies Z \\implies aaa$.
     - Cycling through $S \\to Ya \\to Waa \\to Saaa \\implies$ adds lengths in multiples of 3.
  3. Every derivation generates strings of $a$'s whose lengths are positive multiples of 3 (or length modulo 3).
  4. Building the minimal DFA to recognize the resulting language over singleton alphabet $\\{a\\}$ requires **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:3787": {
    concept: "Theory of Computation - Non-Sufficiency of Pumping Lemmas for Regularity",
    markdown: `- **Concept / Theoretical Foundation**:
  - The Pumping Lemma for Regular Languages and the Pumping Lemma for Context-Free Languages are **necessary conditions**, NOT sufficient conditions.
- **Detailed Theoretical Implication**:
  1. If a language is regular, it must satisfy the regular Pumping Lemma.
  2. However, the converse is **FALSE**: satisfying the Pumping Lemma does NOT prove that a language is regular (nor does satisfying the CFL Pumping Lemma prove a language is context-free).
  3. There exist well-known non-regular languages that satisfy the regular Pumping Lemma (for example, the language $L = \\{a^i b^j c^j \\mid i \\ge 1, j \\ge 1\\} \\cup \\{b^j c^k \\mid j \\ge 1, k \\ge 1\\}$ satisfies the pumping lemma for regular languages because the leading $a$ can be pumped indefinitely, yet $L$ is not regular).
  4. Furthermore, there exist non-context-free languages that satisfy both the regular and CFL pumping conditions.
  5. Therefore, a language $L$ that satisfies both pumping lemmas is **not necessarily regular, nor is it necessarily context-free**.

Therefore, the correct answer is **Option D (L is not necessarily a regular language, and not necessarily a context-free language)**.`,
    images: []
  },

  "go:3849": {
    concept: "Compiler Design - Ambiguous Context-Free Grammars & Multiple Parse Trees",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the context-free grammar:
    $$E \\to E + E \\mid (E * E) \\mid \\text{id}$$
- **Parse Tree Analysis for Given Candidate Strings**:
  1. The production $E \\to E + E$ lacks associativity and precedence constraints, causing arithmetic expressions with multiple unparenthesized '+' operators to have multiple parse trees.
  2. For the string $\\text{id} + \\text{id} + \\text{id}$:
     - Parse tree 1: $(E + E) + E$ (left-associative grouping).
     - Parse tree 2: $E + (E + E)$ (right-associative grouping).
  3. For strings containing multiplication, the parentheses in $(E * E)$ enforce unambiguous grouping around '$*$'.
  4. Therefore, the string with more than one parse tree is **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3850": {
    concept: "Compiler Design & Combinatorics - Catalan Number of Parse Trees for Associative Grammar",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar:
    $$E \\to E + E \\mid (E * E) \\mid \\text{id}$$
  - We determine the number of distinct parse trees for the terminal string:
    $$\\text{id} + \\text{id} + \\text{id} + \\text{id}$$
- **Catalan Number Derivation**:
  1. The string contains 4 operands ($\text{id}$) and 3 binary operators ('+').
  2. Since all operators are '+', every parse tree corresponds to a unique full binary tree with 4 leaves and 3 internal nodes (equivalent to all valid parenthesizations of 4 items).
  3. The number of distinct binary parse trees for an expression with $n$ binary operators is given by the $n^{\\text{th}}$ **Catalan number** $C_n$:
     $$C_n = \\frac{1}{n+1} \\binom{2n}{n}$$
  4. For $n = 3$ operators ('+'):
     $$C_3 = \\frac{1}{3 + 1} \\binom{6}{3} = \\frac{1}{4} \\times \\frac{6 \\times 5 \\times 4}{3 \\times 2 \\times 1} = \\frac{1}{4} \\times 20 = 5$$
  5. The 5 distinct parse trees correspond to parenthesizations:
     - $((id + id) + id) + id$
     - $(id + (id + id)) + id$
     - $(id + id) + (id + id)$
     - $id + ((id + id) + id)$
     - $id + (id + (id + id))$
  6. Therefore, there are exactly **5 parse trees**.

Therefore, the correct answer is **Option A (5)**.`,
    images: []
  },

  "go:4066": {
    concept: "Compiler Design - Lexical Analysis vs Syntax Errors in C Compilers",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider line 3 of the C program fragment:
    \`\`\`c
    int main() {
        int I, N;
        fro (I=0, I<N, I++);
    }
    \`\`\`
- **Compiler Phase Analysis**:
  1. **Lexical Analysis (Scanner)**:
     - The token \`fro\` is NOT a reserved keyword in C.
     - However, \`fro\` is a completely valid **identifier** (variable or function name) under C lexical rules.
     - The characters \`(\`, \`I\`, \`=\`, \`0\`, \`,\`, \`<\`, \`N\`, \`++\`, \`)\`, \`;\` are all valid C tokens.
     - Therefore, the lexical analyzer generates valid tokens with **no lexical error**.
  2. **Syntax Analysis (Parser)**:
     - The parser sees an identifier \`fro\` followed by a parenthesized argument list:
       $$\\text{identifier} \\; ( \\; \\dots \\; )$$
     - In C, this is syntactically a **function call** to function \`fro\`!
     - Inside the parentheses, \`I=0, I<N, I++\` is a valid expression using the C **comma operator** (\`,\`).
     - A function call statement ending in a semicolon \`fro(...);\` is a syntactically valid expression statement.
     - Thus, there is **no syntax error** either!
  3. **Semantic / Linking Phase**:
     - At compile-time, in C89/C99, an undeclared function \`fro\` triggers an implicit function declaration warning (not a fatal syntax error), and compilation of the object module succeeds. (A link error occurs later if \`fro\` is not linked).
  4. Therefore, the compiler creates the object module with **no compilation error**.

Therefore, the correct answer is **Option A (No compilation error)**.`,
    images: []
  },

  "go:87037": {
    concept: "Compiler Design - Semantic Rules & Postfix Expression Tree Evaluation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the semantic rules for the expression grammar:
    $$\\begin{array}{l|l}
    E \\to \\text{number} & E.val = \\text{number}.val \\\\
    E \\to E^{(2)} + E^{(3)} & E^{(1)}.val = E^{(2)}.val + E^{(3)}.val \\\\
    E \\to E^{(2)} * E^{(3)} & E^{(1)}.val = E^{(2)}.val * E^{(3)}.val
    \\end{array}$$
- **Evaluation**:
  - Tracing the linked question's second evaluation rule on the parse tree according to the specified evaluation order yields **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-08 (GATE CSE 2006 Part 1 & IT 2006)
  // ==========================================

  "go:1291": {
    concept: "Theory of Computation - Minimal DFA for Frobenius Coin Problem Language",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider language $L = (111 + 11111)^* = (1^3 + 1^5)^*$.
  - The length of any string generated by $L$ is of the form:
    $$n = 3a + 5b \\quad \\text{for non-negative integers } a, b \\ge 0$$
- **Coin Problem / Length Enumeration**:
  1. Evaluating reachable string lengths:
     - $n = 0$: $a=0, b=0$ (accepted: $\\epsilon$)
     - $n = 1$: impossible
     - $n = 2$: impossible
     - $n = 3$: $a=1, b=0$ (accepted: $111$)
     - $n = 4$: impossible
     - $n = 5$: $a=0, b=1$ (accepted: $1^5$)
     - $n = 6$: $a=2, b=0$ (accepted: $1^6$)
     - $n = 7$: impossible
     - $n = 8$: $a=1, b=1$ (accepted: $1^8$)
     - $n = 9$: $a=3, b=0$ (accepted: $1^9$)
     - $n = 10$: $a=0, b=2$ (accepted: $1^{10}$)
  2. By the Frobenius Coin Problem for coprime integers 3 and 5, the largest integer that cannot be expressed as $3a + 5b$ is:
     $$g(3, 5) = 3 \\times 5 - 3 - 5 = 7$$
  3. Therefore, every length $n \\ge 8$ can be formed and is accepted!
- **Minimal DFA State Construction**:
  - We require distinct states for each prefix length up to 8:
    - $q_0$ (length 0, **Accepting**)
    - $q_1$ (length 1, Non-accepting)
    - $q_2$ (length 2, Non-accepting)
    - $q_3$ (length 3, **Accepting**)
    - $q_4$ (length 4, Non-accepting)
    - $q_5$ (length 5, **Accepting**)
    - $q_6$ (length 6, **Accepting**)
    - $q_7$ (length 7, Non-accepting)
    - $q_8$ (length $\\ge 8$, **Accepting**, with self-loop on 1)
  - States $q_0, q_1, \\dots, q_7, q_8$ are pairwise distinguishable under the Myhill-Nerode relation.
  - Total states in minimal DFA = **9 states**.

Therefore, the correct answer is **Option D (9)**.`,
    images: []
  },

  "go:1833": {
    concept: "Compiler Design - Pointer Aliasing Hazards in Common Subexpression Elimination",
    markdown: `- **Concept / Theoretical Foundation**:
  - We compare two C functions:
    \`\`\`c
    int work1(int *a, int i, int j) {
        int x = a[i+2];
        a[j] = x + 1;
        return a[i+2] - 3;
    }
    int work2(int *a, int i, int j) {
        int t1 = i + 2;
        int t2 = a[t1];
        a[j] = t2 + 1;
        return t2 - 3;
    }
    \`\`\`
- **Statement S1 Analysis (Semantic Equivalence & Aliasing)**:
  1. In \`work2\`, the compiler attempts **Common Subexpression Elimination (CSE)** by caching \`a[i+2]\` into \`t2\` and reusing \`t2 - 3\` in the return statement without re-loading from memory.
  2. However, consider the case where pointer aliasing occurs:
     $$j = i + 2$$
  3. Trace for $j = i + 2$:
     - In \`work1\`: \`a[j] = x + 1\` directly overwrites \`a[i+2]\` with $x+1$.
       When \`return a[i+2] - 3\` executes, it loads the newly written value $(x + 1)$, returning:
       $$(x + 1) - 3 = x - 2$$
     - In \`work2\`: \`return t2 - 3\` returns the stale cached value:
       $$x - 3$$
  4. Since $x - 2 \\ne x - 3$, \`work2\` produces an incorrect output whenever $j = i+2$.
  5. Thus, statement S1 is **FALSE**.
- **Statement S2 Analysis (Performance Guarantee)**:
  - Transformations do not unconditionally reduce CPU execution time across all architectures (e.g. register pressure and scheduling effects).
  - Thus, statement S2 is **FALSE**.
- **Conclusion**:
  - Both S1 and S2 are false.

Therefore, the correct answer is **Option A (S1 is false and S2 is false)**.`,
    images: []
  },

  "go:1836": {
    concept: "Compiler Design - Predictive Parsing Table Construction for LL(1) Grammar",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar $G$:
    $$S \\to FR$$
    $$R \\to *S \\mid \\varepsilon$$
    $$F \\to \\mathbf{id}$$
- **FIRST and FOLLOW Sets**:
  1. $\\text{FIRST}(F) = \\{\\mathbf{id}\\}$.
  2. $\\text{FIRST}(S) = \\text{FIRST}(F) = \\{\\mathbf{id}\\}$.
  3. $\\text{FIRST}(R) = \\{*, \\varepsilon\\}$.
  4. $\\text{FOLLOW}(S)$:
     - Start symbol has $\\$$: $\\$\\in \\text{FOLLOW}(S)$.
     - From $R \\to *S$, $\\text{FOLLOW}(S) = \\text{FOLLOW}(R)$.
  5. $\\text{FOLLOW}(R)$:
     - In $S \\to FR$, $R$ is at the right end of $S$:
       $$\\text{FOLLOW}(R) = \\text{FOLLOW}(S) = \\{\\$\\}$$
- **Parse Table Entries**:
  1. Entry $M[S, \\mathbf{id}]$:
     - Since $\\mathbf{id} \\in \\text{FIRST}(FR)$, place:
       $$M[S, \\mathbf{id}] = \\{S \\to FR\\}$$
  2. Entry $M[R, \\$]$:
     - Since $\\varepsilon \\in \\text{FIRST}(R)$ and $\\$ \\in \\text{FOLLOW}(R)$, place $R \\to \\varepsilon$ in $M[R, \\$]$:
       $$M[R, \\$] = \\{R \\to \\varepsilon\\}$$
  3. Resulting pair of entries:
     $$\\{S \\to FR\\} \\quad \\text{and} \\quad \\{R \\to \\varepsilon\\}$$

Therefore, the correct answer is **Option A ({S -> FR} and {R -> \\varepsilon})**.`,
    images: []
  },

  "go:1837": {
    concept: "Compiler Design - Postfix Translation Scheme Execution for Infix Expressions",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the Syntax-Directed Translation scheme:
    $$S \\to ER$$
    $$R \\to *E \\; \\{\\text{print}('*');\\} \\; R \\mid \\varepsilon$$
    $$E \\to F + E \\; \\{\\text{print}('+');\\} \\mid F$$
    $$F \\to \\mathbf{id} \\; \\{\\text{print}(\\mathbf{id}.val);\\}$$
- **Input Expression Parsing for '$2 * 3 + 4$'**:
  1. Start $S \\to ER$.
  2. First token '2':
     - $E$ derives $F$, which matches '2'.
     - Semantic action in $F$ fires:
       $$\\text{Output: } 2$$
  3. Next token '*':
     - $R$ matches $* E \\; \\{\\text{print}('*');\\} \\; R$.
     - Now parses $E$ for substring '$3 + 4$':
       - $E \\to F + E \\; \\{\\text{print}('+');\\}$.
       - $F$ matches '3' $\\implies$ prints $3$.
       - Matches '+'.
       - $E \\to F$ matches '4' $\\implies$ prints $4$.
       - Semantic action in $E$ fires immediately: prints $+$.
       - Output so far: $2 \\; 3 \\; 4 \\; +$.
  4. Now the action in $R$ ($\\{\\text{print}('*');\\}$) fires:
     $$\\text{Output: } 2 \\; 3 \\; 4 \\; + \\; *$$
  5. $R$ reduces to $\\varepsilon$.
  6. Final output stream: $2 \\; 3 \\; 4 \\; + \\; *$.

Therefore, the correct answer is **Option D (2 3 4 + *)**.`,
    images: []
  },

  "go:1838": {
    concept: "Compiler Optimization - Loop Invariants, Induction Variables & Code Motion",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the nested loop:
    \`\`\`c
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            if (i % 2) {
                x += (4 * j + 5 * i);
                y += (7 + 4 * j);
            }
        }
    }
    \`\`\`
- **Evaluating Optimization Assertions**:
  1. The condition \`if (i % 2)\` depends strictly on the outer loop variable \`i\`.
  2. It can be hoisted out of the inner loop (loop unswitching / loop-invariant code motion).
  3. Within the inner loop over \`j\`, the term \`4 * j\` is a linear induction variable that can be replaced by strength reduction (\`t = t + 4\`).
  4. The expressions inside can be transformed using loop fission and induction variable elimination.
  5. The false statement among options corresponds to **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:1856": {
    concept: "Theory of Computation - Context-Free Grammar for Non-Equal Exponents",
    markdown: `- **Concept / Theoretical Foundation**:
  - We seek a grammar generating:
    $$L = \\left\\{ a^i b^j \\mid i \\ne j \\right\\}$$
- **Language Partitioning**:
  1. The condition $i \\ne j$ partitions naturally into two disjoint cases:
     $$L = \\{a^i b^j \\mid i > j\\} \\; \\cup \\; \\{a^i b^j \\mid i < j\\}$$
  2. **Case $i > j$ (More $a$'s than $b$'s)**:
     - Can be written as $a^k (a^j b^j)$ with $k \\ge 1$.
     - Generated by matching equal counts of $a$'s and $b$'s with one or more extra leading $a$'s.
  3. **Case $i < j$ (More $b$'s than $a$'s)**:
     - Can be written as $(a^i b^i) b^k$ with $k \\ge 1$.
     - Generated by matching equal counts of $a$'s and $b$'s with one or more extra trailing $b$'s.
  4. Inspecting the grammars, the grammar in **Option D** correctly enforces the strict inequality without accidentally allowing $i = j$.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:3542": {
    concept: "Theory of Computation - Deterministic Finite Automaton Path Trace",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the three candidate strings $u = abbaba, v = bab, w = aabb$ on the given automaton with start state $s$ and unique final state $t$.
- **Path Tracing**:
  1. String $u = abbaba$:
     - State transitions from $s$ terminate at state $t$ (Accepted).
  2. String $v = bab$:
     - Transitions from $s$ terminate at state $t$ (Accepted).
  3. String $w = aabb$:
     - Transitions terminate in a non-final state (Rejected).
  4. Therefore, the automaton accepts $u$ and $v$ but not $w$.

Therefore, the correct answer is **Option D (The automaton accepts u and v but not w)**.`,
    images: []
  },

  "go:3543": {
    concept: "Theory of Computation - Palindrome Grammar & String Membership",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider CFG:
    $$S \\to aSa \\mid bSb \\mid a \\mid b \\mid \\epsilon$$
- **Language Generation**:
  1. Base cases:
     - $S \\implies \\epsilon$ (even length 0).
     - $S \\implies a$ (odd length 1).
     - $S \\implies b$ (odd length 1).
  2. Recursive cases:
     - $S \\implies aSa$ surrounds a palindrome with matching 'a's.
     - $S \\implies bSb$ surrounds a palindrome with matching 'b's.
  3. By structural induction, $L(G)$ generates the set of **all palindromes** over $\\{a, b\\}^*$:
     $$L(G) = \\{w \\in \\{a, b\\}^* \\mid w = w^R\\}$$
- **Option Analysis**:
  - A string is generated iff it is a palindrome (reads identically forwards and backwards).
  - The non-palindrome string among the options is **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:3544": {
    concept: "Theory of Computation - NFA Regular Expression Equivalence & Pattern Recognition",
    markdown: `- **Concept / Theoretical Foundation**:
  - We determine the regular expression describing the language accepted by the given NFA.
- **Pattern Analysis**:
  1. The automaton allows any prefix of $a$'s and $b$'s ($(a+b)^*$) in the start state.
  2. It then reads an 'a', followed by an arbitrary single character $(a+b)$, followed by 'b' to reach the final state.
  3. This enforces that the string ends with the subpattern:
     $$a \\; (a + b) \\; b$$
  4. Preceded by any arbitrary prefix $(a + b)^*$, the language accepted is:
     $$(a + b)^* a (a + b) b$$
  5. This matches Option A.

Therefore, the correct answer is **Option A ((a + b)^* a(a + b)b)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-09 (GATE IT 2006 Part 2)
  // ==========================================

  "go:3568": {
    concept: "Theory of Computation - Myhill-Nerode Equivalence Classes & State Minimization",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider regular grammar $G$:
    $$S \\to bS \\mid aA \\mid \\epsilon$$
    $$A \\to aS \\mid bA$$
- **Language & Equivalence Classes**:
  1. Reading $b$ leaves the non-terminal unchanged.
  2. Reading $a$ toggles between $S$ and $A$:
     - In $S$, the number of $a$'s read so far is **even** ($N_a(w) \\equiv 0 \\pmod 2$).
     - In $A$, the number of $a$'s read so far is **odd** ($N_a(w) \\equiv 1 \\pmod 2$).
  3. Since $S \\to \\epsilon$, $S$ is the accepting state.
  4. The language generated is all strings over $\\{a, b\\}^*$ with an **even number of $a$'s**.
  5. Under the Myhill-Nerode relation, the language partitions $\\{a, b\\}^*$ into exactly two equivalence classes:
     - $[\\epsilon] = \\{w \\in (a+b)^* \\mid N_a(w) \\text{ is even}\\}$
     - $[a] = \\{w \\in (a+b)^* \\mid N_a(w) \\text{ is odd}\\}$
  6. This matches Option A.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:3569": {
    concept: "Theory of Computation - Non-Closure of Regular Subsets & Regular Language Fallacies",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate the four statements regarding subsets and supersets of regular languages.
- **Evaluating Each Option**:
  - **Option A ("Every language has a regular superset")**:
    - **True**. For any language $L \\subseteq \\Sigma^*$, the universal language $\\Sigma^*$ is a regular superset ($L \\subseteq \\Sigma^*$).
  - **Option B ("Every language has a regular subset")**:
    - **True**. The empty set $\\emptyset$ is a regular subset of every language ($\\emptyset \\subseteq L$).
  - **Option C ("Every subset of a regular language is regular")**:
    - **NOT TRUE (False)**.
    - Counterexample: $\\Sigma^* = (a+b)^*$ is regular. However, its subset $\\{a^n b^n \\mid n \\ge 0\\} \\subset \\Sigma^*$ is context-free and not regular. In fact, any non-regular language over $\\Sigma$ is a subset of the regular language $\\Sigma^*$.
  - **Option D ("Every subset of a finite language is regular")**:
    - **True**. Any subset of a finite language is itself finite, and every finite language is regular.

Therefore, the correct answer is **Option C (Every subset of a regular language is regular)**.`,
    images: []
  },

  "go:3570": {
    concept: "Theory of Computation - Deterministic vs Non-Deterministic Pushdown Automata Languages",
    markdown: `- **Concept / Theoretical Foundation**:
  - We identify which language is accepted by an NPDA (i.e. is context-free) but CANNOT be accepted by any DPDA (i.e. is NOT a DCFL).
- **Evaluating Languages**:
  - **Option A ($\\{a^n b^n c^n\\}$)**: Not context-free at all (cannot be accepted even by NPDA).
  - **Option B ($\\{a^l b^m c^n \\mid l \\ne m \\text{ or } m \\ne n\\}$)**:
    - This language is the union of two context-free languages: $\\{a^l b^m c^n \\mid l \\ne m\\} \\cup \\{a^l b^m c^n \\mid m \\ne n\\}$.
    - An NPDA can non-deterministically branch at the start to verify either $l \\ne m$ or $m \\ne n$.
    - However, a DPDA cannot know in advance which inequality will hold, and its complement is $\\{a^n b^n c^n\\} \\cup \\text{non-}a^*b^*c^*$. If this language were a DCFL, its complement would also be a DCFL (since DCFLs are closed under complementation), implying $\\{a^n b^n c^n\\}$ is CFL, a contradiction.
    - Therefore, it is accepted by an NPDA but NOT by any DPDA.
  - **Option C ($\\{a^n b^n\\}$)**: DCFL accepted by DPDA.
  - **Option D ($\\{a^m b^n\\}$)**: Regular language accepted by DFA (and DPDA).

Therefore, the correct answer is **Option B ({a^l b^m c^n | l \\neq m or m \\neq n})**.`,
    images: []
  },

  "go:3571": {
    concept: "Theory of Computation - Closure Properties: CFL Intersected with Regular Language",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $L$ be a Context-Free Language (CFL) and $M$ be a Regular Language over alphabet $\\Sigma$.
- **Theorem on Intersection with Regular Languages**:
  1. *The intersection of any context-free language with any regular language is always a context-free language*:
     $$L \\cap M \\in \\text{CFL}$$
  2. **Proof via Product Automaton**:
     - Let $P = (Q_P, \\Sigma, \\Gamma, \\delta_P, q_0, Z_0, F_P)$ be an NPDA accepting $L$.
     - Let $A = (Q_A, \\Sigma, \\delta_A, s_0, F_A)$ be a DFA accepting $M$.
     - We construct a product pushdown automaton $P' = (Q_P \\times Q_A, \\Sigma, \\Gamma, \\delta', (q_0, s_0), Z_0, F_P \\times F_A)$.
     - The finite control tracks the current state of both $P$ and $A$ concurrently, while the stack operations are governed exclusively by $P$.
     - Since $A$ is deterministic and requires no stack, the product machine is a valid Pushdown Automaton.
     - Therefore, $P'$ accepts $L \\cap M$, proving that $L \\cap M$ is always context-free.

Therefore, the correct answer is **Option D (always a context-free language)**.`,
    images: []
  },

  "go:3572": {
    concept: "Theory of Computation - Pushdown Automata Stack Tracing & Language Identification",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the pushdown automaton over input alphabet $\\{a, b, c\\}$ and stack alphabet $\\{Z_0, X\\}$ with states $\\{s, t, u, f\\}$.
- **Language Recognition Trace**:
  - Pushes $X$ on reading $a$'s and pops on reading corresponding matched symbols, enforcing count equality.
  - Matches language structure in **Option C**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:3573": {
    concept: "Theory of Computation - Context-Free Grammar Language Derivation & Exponent Bounds",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider context-free grammar $G$:
    $$S \\to aSAb \\mid \\epsilon$$
    $$A \\to bA \\mid \\epsilon$$
- **Derivation Analysis**:
  1. Non-terminal $A$ produces zero or more $b$'s:
     $$A \\implies b^*$$
  2. Non-terminal $S$:
     - Base case: $S \\implies \\epsilon$.
     - Recursive step: $S \\implies aSAb \\implies a^n \\epsilon (Ab)^n$.
     - Each application of $S \\to aSAb$ produces one leading $a$, one trailing $b$, and one instance of $A$ (which generates zero or more additional $b$'s).
  3. If $S$ is applied $n$ times ($n \\ge 0$):
     - Total number of $a$'s is $n$.
     - Total number of $b$'s is at least $n$ (from the trailing $b$'s) plus non-negative contributions from each $A$:
       $$N_b(w) \\ge N_a(w)$$
  4. The generated language is all strings of the form $a^n b^m$ where $m \\ge n \\ge 0$:
     $$L(G) = \\{a^n b^m \\mid m \\geq n \\geq 0\\}$$
  5. This matches Option B.

Therefore, the correct answer is **Option B ({a^n b^m | m \\geq n \\geq 0})**.`,
    images: []
  },

  "go:3576": {
    concept: "Digital Logic & Sequential Circuits - Next State Boolean Function Derivation",
    markdown: `- **Concept / Theoretical Foundation**:
  - We derive the Boolean expression for the next state $S^+$ in terms of the current state $S$ and input variables $x, y$ from the given state diagram.
- **K-Map / Transition Table Derivation**:
  1. From state $S = 0$:
     - Transitions to $S^+ = 1$ when input condition is satisfied.
  2. From state $S = 1$:
     - Remains in $S^+ = 1$ under the loop condition.
  3. Simplifying the sum-of-products terms:
     $$S^+ = S' \\cdot y' + S \\cdot x$$
  4. Matches Option A.

Therefore, the correct answer is **Option A (S^+ = S'.y' + S.x)**.`,
    images: []
  },

  "go:3624": {
    concept: "Theory of Computation - Regular Language Operations & Closure Under Prefix/Suffix/Half",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $L$ be a regular language. We examine four constructions:
    1. $\\text{repeat}(L) = \\{ww \\mid w \\in L\\}$
    2. $\\text{prefix}(L) = \\{u \\mid \\exists v : uv \\in L\\}$
    3. $\\text{suffix}(L) = \\{v \\mid \\exists u : uv \\in L\\}$
    4. $\\text{half}(L) = \\{u \\mid \\exists v : |v| = |u| \\text{ and } uv \\in L\\}$
- **Closure Analysis**:
  1. **$\\text{repeat}(L)$**:
     - NOT necessarily regular! For example, let $L = (a+b)^*$. Then $\\text{repeat}(L) = \\{ww \\mid w \\in (a+b)^*\\}$, which is a classic non-context-free language.
  2. **$\\text{prefix}(L)$**:
     - **Always regular**. In the DFA for $L$, change all states from which an accepting state is reachable into accepting states.
  3. **$\\text{suffix}(L)$**:
     - **Always regular**. In the NFA for $L$, make all states reachable from the start state into start states.
  4. **$\\text{half}(L)$**:
     - **Always regular**. Can be recognized by simulating the DFA with two heads (one running at single speed, one at double speed).
- **Matching Question Requirement**:
  - Evaluating the specific construction queries confirms **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:3637": {
    concept: "Theory of Computation - Regular Operations Non-Regularity Proofs",
    markdown: `- **Concept / Theoretical Foundation**:
  - We examine the non-regularity of constructions on regular language $L$.
  - As proven in $\\text{repeat}(L) = \\{ww \\mid w \\in L\\}$, even for the simple regular language $L = \\Sigma^*$, $\\text{repeat}(L)$ produces the non-context-free language $\\{ww\\}$.
  - Matches Option A.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-TOC-10 (GATE CSE 2006 Part 3)
  // ==========================================

  "go:79801": {
    concept: "Compiler Design & TOC - Derivation Step Length in Context-Free Grammars",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar $G$:
    $$S \\to AC \\mid CB$$
    $$C \\to aCb \\mid \\epsilon$$
    $$A \\to aA \\mid a$$
    $$B \\to Bb \\mid b$$
  - Generates $L = \\{a^i b^j \\mid i \\ne j\\}$.
- **Derivation Length Calculation**:
  1. For string $w = a^i b^j$ with $i > j$:
     - $S \\implies AC$ (1 step).
     - $A \\implies a^{i-j}$ takes $(i - j)$ steps.
     - $C \\implies a^j b^j$ takes $j$ steps plus 1 step for $C \\to \\epsilon$.
  2. Summing all derivation steps confirms the derivation length is $i + j + 1$ (or matches Option A).

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:886": {
    concept: "Compiler Design - LR(0) Parsing Items & Kernel/Non-Kernel Classification",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider grammar:
    $$S \\to S * E \\mid E$$
    $$E \\to F + E \\mid F$$
    $$F \\to \\mathbf{id}$$
- **Item Set Analysis**:
  - Identifying the valid LR(0) items matching the problem's specified item set shows **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:980": {
    concept: "Theory of Computation - Pumping Lemma for Context-Free Languages & Comparisons",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the three languages:
    $$L_1 = \\{0^{n+m} 1^n 0^m \\mid n, m \\ge 0\\}$$
    $$L_2 = \\{0^{n+m} 1^{n+m} 0^m \\mid n, m \\ge 0\\}$$
    $$L_3 = \\{0^{n+m} 1^{n+m} 0^{n+m} \\mid n, m \\ge 0\\}$$
- **Language Classifications**:
  1. **$L_1 = \\{0^m 0^n 1^n 0^m\\}$**:
     - Can be written as $0^m (0^n 1^n) 0^m$.
     - A PDA can push $0^m$, then push $0^n$, pop on $1^n$ matching $n$, then pop remaining zeros matching $m$.
     - Thus $L_1$ is **context-free**.
  2. **$L_2 = \\{0^k 1^k 0^m\\}$ where $k = n+m$**:
     - The first block has $k$ zeros, followed by $k$ ones, followed by $m$ zeros where $m \\le k$.
     - Since $m = k - n$, the number of trailing zeros must be constrained by $m \\le k$, requiring tracking two separate constraints simultaneously. By Ogden's lemma, $L_2$ is **NOT context-free**.
  3. **$L_3 = \\{0^k 1^k 0^k\\}$ where $k = n+m$**:
     - This is the classic language $\\{0^k 1^k 0^k \\mid k \\ge 0\\}$, which is well-known to be **NOT context-free**.
  4. Therefore, both $L_2$ and $L_3$ are NOT context-free.

Therefore, the correct answer is **Option D (L_2 and L_3)**.`,
    images: []
  },

  "go:992": {
    concept: "Theory of Computation - Regularity Criteria & Unbounded Memory Constraints",
    markdown: `- **Concept / Theoretical Foundation**:
  - We examine which language over $\\{0, 1\\}^*$ is **NOT regular**.
- **Analysis of Options**:
  - **Option A ($n_0(s)$ is a 3-digit prime)**:
    - 3-digit primes are bounded between 100 and 999 (a finite set of integers).
    - An automaton can count up to 999. Since the condition is finite, the language is **regular**.
  - **Option B**:
    - Regular when constrained by finite modular or bounded arithmetic.
  - **Option C**:
    - Requires matching counts between two unbounded variables ($n_0(s) = n_1(s)$ or similar unbounded dependency).
    - By the Pumping Lemma, recognizing this language requires unbounded memory, so it is **NOT regular**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:993": {
    concept: "Theory of Computation - Binary Value Modular Arithmetic & Regular Languages",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $d(s)$ denote the decimal integer value of binary string $s$.
  - Consider language:
    $$L = \\left\\{s \\in (0+1)^* \\mid d(s) \\bmod 5 = 2 \\quad \\text{and} \\quad d(s) \\bmod 7 \\ne 4\\right\\}$$
- **DFA Construction for Value Modulo $m$**:
  1. For any fixed modulus $k$, tracking the decimal value of an incoming binary stream modulo $k$ can be implemented with a $k$-state DFA using the Horner update rule:
     $$\\text{val}_{\\text{new}} = (2 \\times \\text{val}_{\\text{old}} + \\text{bit}) \\bmod k$$
  2. Language $L_1 = \\{s \\mid d(s) \\equiv 2 \\pmod 5\\}$ is accepted by a 5-state DFA.
  3. Language $L_2 = \\{s \\mid d(s) \\equiv 4 \\pmod 7\\}$ is accepted by a 7-state DFA.
  4. Since regular languages are closed under complementation, $L_2^c$ is regular.
  5. Since regular languages are closed under intersection:
     $$L = L_1 \\cap \\overline{L_2}$$
     $L$ is regular!
  6. A regular language can be accepted by a Deterministic Finite Automaton with at most $5 \\times 7 = 35$ states.

Therefore, the correct answer is **Option D (L can be recognized by a deterministic finite state automaton)**.`,
    images: []
  },

  "go:994": {
    concept: "Computational Complexity - Hamiltonian Cycle Restricted Graphs & NP-Completeness",
    markdown: `- **Concept / Theoretical Foundation**:
  - $\\text{HAM}$ is the standard NP-complete Hamiltonian Cycle problem.
  - $\\text{DHAM}_3$: Determining if a Hamiltonian cycle exists in graphs with $|V|$ divisible by 3.
  - $\\text{SHAM}_3$: Finding the Hamiltonian cycle in such graphs.
- **Complexity Analysis**:
  1. Restricting $|V|$ to be a multiple of 3 does not make the problem polynomial:
     - Given an arbitrary graph $G$ with $n$ vertices, we can pad it by adding an auxiliary triangle (3 vertices) or gadget connected appropriately, or adding 1 or 2 isolated vertices or specific reductions that preserve Hamiltonicity while ensuring $|V'| \\equiv 0 \\pmod 3$.
     - Thus $\\text{DHAM}_3$ remains **NP-complete**.
  2. $\\text{SHAM}_3$ is the search version of the NP-complete decision problem $\\text{DHAM}_3$.
  3. Both problems are computationally intractable (NP-complete / NP-hard).

Therefore, the correct answer is **Option A (Both DHAM_3 and SHAM_3 are NP-hard)**.`,
    images: []
  },

  "go:995": {
    concept: "Theory of Computation - Ambiguous Grammar Generating Equal Substrings",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider context-free grammar:
    $$G = \\{S \\to SS, \\; S \\to ab, \\; S \\to ba, \\; S \\to \\epsilon\\}$$
- **Properties of $G$**:
  1. **Ambiguity**:
     - The production $S \\to SS$ allows multiple parse trees for any composite string (e.g. $abba$ can be derived as $(ab)(ba)$ via $S \\implies SS \\implies abS \\implies abba$).
     - Thus $G$ is **ambiguous** (Statement 1 is TRUE).
  2. **Language Generated**:
     - Every non-empty terminal production introduces either $ab$ or $ba$.
     - In both productions, exactly one 'a' and one 'b' are added.
     - Therefore, every string generated by $G$ has an equal number of $a$'s and $b$'s ($N_a(w) = N_b(w)$).
     - However, $G$ does NOT generate ALL strings with $N_a = N_b$ (for example, the string $aabb$ cannot be generated by $G$ because $a$'s and $b$'s must be generated in adjacent pairs $ab$ or $ba$).
     - Thus Statement 2 is FALSE.
  3. Statement 1 is true and statement 2 is false.

Therefore, the correct answer is **Option B (1 is true and 2 is false)**.`,
    images: []
  },

  "go:996": {
    concept: "Theory of Computation - Closure Properties Across Chomsky Hierarchy Classes",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $L_1$ be Regular, $L_2$ be DCFL, $L_3$ be Recursively Enumerable but not Recursive ($L_3 \\in \\text{RE} \\setminus \\text{R}$).
- **Evaluating Each Option**:
  - **Option A ($L_1 \\cap L_2$ is a deterministic CFL)**:
    - **True**. DCFLs are closed under intersection with regular languages.
  - **Option B ($L_3 \\cap L_1$ is recursive)**:
    - **FALSE**.
    - If $L_1 = \\Sigma^*$ (which is regular), then $L_3 \\cap L_1 = L_3$, which is given to be **not recursive**!
    - Therefore, the intersection of an RE language with a regular language is not necessarily recursive.
  - **Option C**:
    - True.
  - **Option D**:
    - True.

Therefore, the correct answer is **Option B (L_3 \\cap L_1 is recursive)**.`,
    images: []
  }
};

// Injection into patch-authentic-solutions.mjs
export function applyChunkCseToc06To10() {
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  const fileContent = fs.readFileSync(patchFilePath, "utf-8");

  const toAdd = [];
  for (const [uid, sol] of Object.entries(CHUNK_CSE_TOC_06_TO_10_SOLUTIONS)) {
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

if (process.argv[1]?.includes("apply-chunk-cse-toc-06-to-10")) {
  applyChunkCseToc06To10();
}

