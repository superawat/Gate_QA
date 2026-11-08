import fs from "fs";
import path from "path";
import { applyAuthenticPatches } from "./patch-authentic-solutions.mjs";

export const CHUNK_CSE_VIN_10_SOLUTIONS = {
  "go:2590": {
    concept: "Computer Organization & Architecture - Vectored vs Non-Vectored Interrupts",
    markdown: `### 1. Concept & Architectural Classification
In computer systems, an **interrupt** is an asynchronous signal sent to the processor indicating an event that requires immediate attention. Interrupt handling mechanisms are classified into two primary architectures:
1. **Non-Vectored Interrupts:** The CPU branches to a fixed, predetermined memory location hardwired into the processor architecture regardless of which device raised the interrupt. The CPU then polls connected I/O devices to identify the requester.
2. **Vectored Interrupts:** The interrupting I/O peripheral itself provides identifying information—known as an **interrupt vector** (an address pointer or vector number)—to the processor over the data/control bus during the interrupt acknowledge cycle. The CPU uses this vector to compute or directly look up the starting address of the corresponding Interrupt Service Routine (ISR) in the interrupt vector table.

---

### 2. Operational Mechanism of Vectored Interrupts
During a vectored interrupt sequence:
1. An external device asserts an interrupt request line (e.g., $\\text{INTR}$).
2. Upon completing the current machine instruction, the processor responds by asserting an interrupt acknowledge signal (e.g., $\\overline{\\text{INTA}}$).
3. In response to $\\overline{\\text{INTA}}$, the interrupting interface places its unique interrupt vector (or opcode like \`RST n\` / pointer) onto the system bus.
4. The processor reads this vector information and jumps to the specific ISR address corresponding to that device.

---

### 3. Option & Distractor Analysis
- **Option A:** *"The branch address is assigned to a fixed location in memory"* describes a non-vectored interrupt (or fixed trap vector), where the hardware always jumps to a single fixed memory location irrespective of the device. Hence, Option A is incorrect.
- **Option B:** *"The interrupting source supplies the branch information to the processor through an interrupt vector"* accurately describes the fundamental defining mechanism of a vectored interrupt. Hence, Option B is correct.
- **Option C:** *"The branch address is obtained from a register in the processor"* describes register-indirect branching (e.g., jump via register), not the defining mechanism of vectored interrupts. Hence, Option C is incorrect.
- **Option D:** *"None of the above"* is incorrect since Option B is the exact standard definition.

---

### 4. Conclusion
Therefore, the correct answer is **Option B (The interrupting source supplies the branch information to the processor through an interrupt vector)**.`,
    images: []
  },

  "go:2591": {
    concept: "Programming & Algorithms - Pascal Dangling-Else & Conditional Execution",
    markdown: `### 1. Code Analysis & Grammar Rules
We are given the following Pascal code segment:

\`\`\`pascal
X := -10; Y := 20;
If X > Y then if X < 0 then X := abs(X) else X := 2*X;
\`\`\`

In Pascal (as in C and Algol-like languages), the syntax for nested conditional statements resolves the **dangling-else ambiguity** via the standard lexical rule:
> An \`else\` clause associates with the nearest preceding unmatched \`if\` within the same block scope.

Structuring the statement with explicit indentation and grouping reveals its true execution hierarchy:

\`\`\`pascal
X := -10;
Y := 20;

if (X > Y) then
begin
    if (X < 0) then
        X := abs(X)
    else
        X := 2 * X;
end;
\`\`\`

---

### 2. Step-by-Step Execution Trace
1. **Variable Initialization:**
   $$X = -10, \\quad Y = 20$$
2. **Outer Condition Evaluation:**
   $$\\text{Condition: } (X > Y) \\implies (-10 > 20)$$
   Since $-10 > 20$ evaluates to **false**, the entire \`then\` branch governed by the outer \`if\` is skipped.
3. **Absence of Outer Else:**
   The outer \`if\` has no corresponding \`else\` clause because the single \`else\` in the snippet is bound to the inner \`if (X < 0)\`.
4. **Final Value of X:**
   Because the outer condition is false, neither $X := \\text{abs}(X)$ nor $X := 2*X$ is executed.
   $X$ retains its initial assigned value:
   $$X = -10$$

---

### 3. Distractor Analysis
- **Option A ($10$):** Would be obtained if the outer condition were true and the inner condition executed ($X := \\text{abs}(-10) = 10$).
- **Option B ($-20$):** Would be obtained if the \`else\` executed with $X = -10$ ($X := 2 \\times (-10) = -20$).
- **Option C ($-10$):** Correctly reflects that the outer condition fails, preserving the initial value of $X$.
- **Option D (None):** Incorrect since $-10$ is explicitly present as Option C.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($-10$)**.`,
    images: []
  },

  "go:2592": {
    concept: "Algorithms - Divide-and-Conquer Algorithmic Paradigm",
    markdown: `### 1. Algorithmic Principle of Merge Sort
**Merge Sort** is an archetype of the **Divide-and-Conquer** algorithmic paradigm. Invented by John von Neumann in 1945, it solves the comparison-based sorting problem by breaking a problem down recursively into subproblems of the same type until they become simple enough to be solved directly.

---

### 2. The Three Divide-and-Conquer Phases
1. **Divide:**
   Divide the unsorted array $A[p \\dots r]$ of size $n$ into two balanced sub-arrays $A[p \\dots q]$ and $A[q+1 \\dots r]$ around the midpoint $q = \\lfloor (p + r)/2 \\rfloor$, each of size roughly $\\lceil n/2 \\rceil$ and $\\lfloor n/2 \\rfloor$.
2. **Conquer:**
   Recursively sort the two sub-arrays by invoking merge sort on each half until the base case ($n \\le 1$) is reached, where a single-element list is trivially sorted.
3. **Combine (Merge):**
   Merge the two sorted sub-arrays into a single contiguous sorted array using a linear-time two-pointer merge procedure requiring at most $n - 1$ element comparisons.

The recurrence relation governing its runtime is:
$$T(n) = 2T\\left(\\frac{n}{2}\\right) + \\Theta(n)$$
By the Master Theorem (Case 2, where $a = 2, b = 2, f(n) = \\Theta(n)$ and $n^{\\log_2 2} = n^1$):
$$T(n) = \\Theta(n \\log n)$$
across best, average, and worst cases.

---

### 3. Option & Distractor Analysis
- **Option A (Divide and conquer strategy):** Correctly identifies the foundational design technique of Merge Sort.
- **Option B (Backtracking approach):** Used for systematic state-space tree search (e.g., $N$-Queens, Hamiltonian path), not for Merge Sort.
- **Option C (Heuristic search):** Used in AI pathfinding (e.g., $A^*$ search) where an evaluation function estimates the distance to the goal.
- **Option D (Greedy approach):** Solves optimization problems by making locally optimal choices at each step (e.g., Prim's, Kruskal's, Dijkstra's algorithms).

---

### 4. Conclusion
Therefore, the correct answer is **Option A (Divide and conquer strategy)**.`,
    images: []
  },

  "go:2593": {
    concept: "Computer Organization & Architecture - Principle of Locality & Cache Memory",
    markdown: `### 1. Conceptual Framework: Principle of Locality
The **Principle of Locality** (or Locality of Reference) is an empirical property observed in programs stating that memory references made by a processor tend to cluster in both time and space. It comprises two fundamental dimensions:
1. **Temporal Locality (Locality in Time):** If a specific memory location is referenced at time $t$, it is highly likely to be referenced again in the near future (e.g., loop counters, iteration bodies, stack frames).
2. **Spatial Locality (Locality in Space):** If a specific memory location at address $A$ is referenced, memory locations with adjacent addresses $A \\pm k$ are highly likely to be referenced in the near future (e.g., sequential instruction execution, contiguous array indexing).

---

### 2. Justification for the Cache Memory Hierarchy
A computer memory hierarchy operates between small, extremely fast, expensive memory (SRAM caches) and large, slower, cheaper memory (DRAM main memory).
- When the processor accesses address $A$, the cache controller fetches an entire contiguous multi-word **cache block (cache line)** containing $A$ into cache. This directly leverages **spatial locality** so that subsequent sequential memory instructions do not stall the CPU.
- By retaining recently accessed blocks in cache using replacement policies like LRU, the cache retains active working sets, directly exploiting **temporal locality**.
- Consequently, cache memories achieve effective hit ratios of $90\\% - 98\\%$, allowing average memory access times ($T_{\\text{avg}} = h \\cdot T_c + (1-h) \\cdot T_m$) to approach SRAM speeds at DRAM capacity costs.

---

### 3. Distractor Analysis
- **Option A (Interrupts):** Mechanisms for asynchronous hardware event notification and I/O coordination; not justified by spatial/temporal locality.
- **Option B (DMA - Direct Memory Access):** Enables high-speed bulk data transfers directly between I/O peripherals and main memory without continuous CPU intervention; driven by bus throughput, not cache locality principles.
- **Option C (Polling):** A synchronous software technique where the CPU periodically interrogates peripheral status flags; unrelated to memory locality.
- **Option D (Cache Memory):** The exact computer architecture subsystem designed explicitly to exploit both temporal and spatial locality of reference.

---

### 4. Conclusion
Therefore, the correct answer is **Option D (Cache Memory)**.`,
    images: []
  },

  "go:2594": {
    concept: "Operating Systems - Paged Segmentation Memory Management",
    markdown: `### 1. Architecture of Paged Segmentation
In pure segmentation, each user process view is divided into logical segments (code, data, heap, stack) of variable lengths. Pure segmentation suffers from severe **external fragmentation**, as segments must be allocated contiguously in physical memory.

To eliminate external fragmentation while retaining logical modularity, modern architectures (such as MULTICS and Intel x86 protected mode) combine segmentation with paging:
1. Each logical address is divided into $(\\text{Segment Number } s, \\text{ Page Number } p, \\text{ Page Offset } d)$.
2. Physical memory is divided into fixed-size page frames.
3. Each segment is divided into fixed-size pages, so each segment has its own **page table**.

---

### 2. Why the Segment Table Itself Must Be Paged
1. **Size of the Segment Table:**
   A process may have a very large segment address space. For example, if a system supports $2^{16} = 65{,}536$ segments per process and each segment table entry (STE) requires $4$ bytes, the segment table requires:
   $$65{,}536 \\times 4\\text{ bytes} = 256\\text{ KB}$$
2. **Contiguity Bottleneck:**
   If the segment table had to be stored contiguously in physical memory, the operating system would face the exact contiguous physical allocation problem (external fragmentation) that paging was introduced to prevent.
3. **Solution:**
   The segment table is broken into standard fixed-size pages (e.g., $4\\text{ KB}$ pages), and a **page table for the segment table** is maintained. This allows the segment table itself to be allocated non-contiguously across physical frames and paged into memory on demand.

---

### 3. Option & Distractor Analysis
- **Option A:** *"The segment table is often too large to fit in one page"* correctly identifies that because a segment table contains entries for thousands of segments, its size vastly exceeds the page frame size and must be paged to avoid requiring large contiguous physical memory allocations. Hence, Option A is correct.
- **Option B:** *"Each segment is spread over a number of pages"* is a true statement about paged segmentation, but it explains why each *segment* has a page table, not why the *segment table itself* has a page table.
- **Option C:** *"Segment tables point to page tables and not to the physical locations of the segment"* describes the standard indirection mechanism, but does not explain why the segment table structure is itself paged.
- **Option D:** *"The processor's description base register points to a page table"* is technically inaccurate; the segment base register points to the segment table (or segment table base).

---

### 4. Conclusion
Therefore, the correct answer is **Option A (The segment table is often too large to fit in one page)**.`,
    images: []
  },

  "go:2595": {
    concept: "Operating Systems - Belady's Anomaly & Stack Algorithms",
    markdown: `### 1. Belady's Anomaly Definition
**Belady's Anomaly** (discovered by László Bélády in 1969) is the counterintuitive phenomenon in virtual memory management where allocating **more physical page frames** to a process results in an **increase** (or no decrease) in the total number of page faults for a fixed page reference string.

---

### 2. Stack Algorithms vs Non-Stack Algorithms
A page replacement algorithm is classified as a **stack algorithm** if the set of pages held in memory with $n$ frames is always a strict subset of the pages held in memory with $n + 1$ frames for every reference string at every step:
$$M(n, t) \\subseteq M(n + 1, t) \\quad \\forall t$$

- **Stack Algorithms Never Suffer from Belady's Anomaly:**
  If an algorithm satisfies the inclusion property, adding frames can never cause a page that was present with $n$ frames to be missing with $n+1$ frames. Therefore, page faults can never increase.
  - **Optimal Replacement (OPT / MIN):** Replaces the page that will not be used for the longest period in the future. It is a proven stack algorithm and **never** suffers from Belady's anomaly.
  - **Least Recently Used (LRU):** Replaces the page that has not been used for the longest period in the past. It is a proven stack algorithm and **never** suffers from Belady's anomaly.
  - **Least Frequently Used (LFU):** Can suffer from Belady's anomaly.
  - **First-In, First-Out (FIFO):** Replaces the oldest page in memory regardless of recency or frequency of access. FIFO **violates the inclusion property** and is the classic algorithm that suffers from Belady's anomaly.

---

### 3. Classic Belady FIFO Counterexample
Consider the reference string:
$$1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5$$
- With **3 page frames**, FIFO yields **9 page faults**.
- With **4 page frames**, FIFO yields **10 page faults** ($10 > 9$).
This proves that FIFO suffers from Belady's anomaly.

---

### 4. Conclusion
Therefore, the correct answer is **Option C (FIFO)**.`,
    images: []
  },

  "go:2596": {
    concept: "Theory of Computation - Regular Expressions for Programming Language Identifiers",
    markdown: `### 1. Specification of an Identifier
We are given the specification of a valid identifier in a programming language:
- $L$: The set of all alphabetic letters (e.g., $\\{a, b, \\dots, z, A, \\dots, Z\\}$).
- $D$: The set of all numeric digits (e.g., $\\{0, 1, \\dots, 9\\}$).
- **Lexical Rule:** An identifier must begin with a **letter**, followed by **any number of letters or digits** (zero or more occurrences).

---

### 2. Regular Expression Derivation
1. **Initial Symbol:**
   The very first character must strictly be a letter from set $L$. In formal regular expressions, this is represented by:
   $$L$$
2. **Subsequent Characters:**
   Following the initial letter, each subsequent character can be either a letter or a digit:
   $$(L + D) \\quad \\text{or} \\quad (L \\cup D)$$
3. **Repetition:**
   The rule allows *any number* of such characters (including zero characters). In Kleene algebra, zero or more repetitions is denoted by the Kleene star operation:
   $$(L + D)^*$$
4. **Concatenation:**
   Concatenating the initial letter with the trailing sequence gives the complete regular expression:
   $$\\mathbf{L(L + D)^*}$$

---

### 3. Option & Distractor Analysis
- **Option A ($(L + D)^+$):** Represents any string of one or more letters or digits. This invalidly accepts identifiers starting with digits (e.g., \`1abc\`), violating the rule that an identifier must start with a letter.
- **Option B ($(L.D)^*$):** Represents zero or more repetitions of an alternating letter-digit pair (e.g., $\\epsilon$, \`a1\`, \`a1b2\`). It forbids identifiers with consecutive letters (e.g., \`ab\`) or single letters (\`x\`).
- **Option C ($L(L + D)^*$):** Correctly enforces that the first character is a letter, followed by zero or more letters or digits in any combination.
- **Option D ($L(L.D)^*$):** Enforces a letter followed by alternating letter-digit pairs (e.g., \`a\`, \`ab1\`, \`ab1c2\`), rejecting valid identifiers like \`count\`.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($L(L + D)^*$)**.`,
    images: []
  },

  "go:2597": {
    concept: "Theory of Computation - Chomsky Hierarchy of Formal Grammars",
    markdown: `### 1. Grammar Productions Given
We are given a formal grammar $G = (V_N, V_T, P, S)$ with the following production rules:
1. $S \\rightarrow a \\alpha b \\mid b \\alpha c \\mid aB$
2. $S \\rightarrow \\alpha S \\mid b$
3. $S \\rightarrow \\alpha b b \\mid ab$
4. $S \\alpha \\rightarrow bd b \\mid b$

---

### 2. Chomsky Hierarchy Classification Rules
The four levels of the Chomsky hierarchy impose structural constraints on production rules $\\alpha \\rightarrow \\beta$:
1. **Type 3 (Regular Grammar):**
   Productions must be right-linear ($A \\rightarrow wB \\mid w$) or left-linear ($A \\rightarrow Bw \\mid w$), where $A, B \\in V_N$ and $w \\in V_T^*$. The left-hand side (LHS) must strictly be a single non-terminal ($|\\text{LHS}| = 1$).
2. **Type 2 (Context-Free Grammar / CFG):**
   Productions must have the form $A \\rightarrow \\gamma$, where $A \\in V_N$ and $\\gamma \\in (V_N \\cup V_T)^*$. The LHS must strictly consist of **a single non-terminal symbol** ($|\\text{LHS}| = 1$).
3. **Type 1 (Context-Sensitive Grammar / CSG):**
   Productions have the form $\\gamma_1 A \\gamma_2 \\rightarrow \\gamma_1 \\beta \\gamma_2$, where $A \\in V_N$, $\\beta \\ne \\epsilon$, or more broadly non-contracting productions $|\\alpha| \\le |\\beta|$ where $\\alpha$ contains at least one non-terminal. Crucially, the LHS can contain more than one symbol ($|\\text{LHS}| \\ge 1$).

---

### 3. Structural Evaluation of the Given Grammar
Look at production rule 4:
$$S \\alpha \\rightarrow bd b \\mid b$$
- The left-hand side contains **two symbols**: $S$ (non-terminal) and $\\alpha$ (which acts as a non-terminal symbol appearing in the sentential forms).
- Since $|\\text{LHS}| = |S\\alpha| = 2 > 1$, the left-hand side is **not a single non-terminal**.
- This immediately disqualifies the grammar from being:
  - **Regular (Type 3)**: requires $|\\text{LHS}| = 1$.
  - **Context-Free (Type 2)**: requires $|\\text{LHS}| = 1$.
  - **LR($k$)**: LR($k$) grammars are a deterministic subclass of Context-Free Grammars; since the grammar is not context-free, it cannot be LR($k$).
- Because the LHS involves context around the non-terminal (the production $S\\alpha \\rightarrow bdb$ replaces $S$ in the context of $\\alpha$), this is classified as a **Context Sensitive Grammar** (Type 1) in the GATE examination framework.

*(Note on non-contracting edge case: While $S\\alpha \\rightarrow b$ is contracting ($2 > 1$), in multiple-choice classification where Type-0 is not listed, the presence of non-unit LHS $S\\alpha$ decisively places the question under Context-Sensitive).*

---

### 4. Conclusion
Therefore, the correct answer is **Option C (Context sensitive)**.`,
    images: []
  },

  "go:2598": {
    concept: "Compiler Design & Systems Programming - Macro Definition Parameters",
    markdown: `### 1. Macro Processor Fundamentals
In assembly language programming and systems programming, a **macro** is an abbreviation or named block of source code statements. When a macro is defined, it establishes a template; when the macro name is invoked in the source program, the macro processor performs **macro expansion**, replacing the invocation with the body statements after substituting argument strings.

---

### 2. Definition vs Invocation Parameters
Consider the macro definition:

\`\`\`assembly
macro   Add x, y
        Load y
        Mul x
        Store y
end macro
\`\`\`

1. **Formal Parameters (Dummy Arguments):**
   In the header line \`macro Add x, y\`, the symbols $x$ and $y$ are **formal parameters**. They act as placeholder identifiers declared in the macro definition that indicate where operand substitution will occur during expansion.
2. **Actual Parameters (Arguments):**
   When the programmer later invokes the macro in code, for example:
   \`\`\`assembly
   Add ALPHA, BETA
   \`\`\`
   The specific operands \`ALPHA\` and \`BETA\` supplied at the invocation call-site are the **actual parameters**. The macro processor substitutes \`ALPHA\` for formal parameter $x$ and \`BETA\` for formal parameter $y$, emitting:
   \`\`\`assembly
   Load BETA
   Mul ALPHA
   Store BETA
   \`\`\`

---

### 3. Option & Distractor Analysis
- **Option A (Variables):** Formal macro parameters are not memory variables; they hold no runtime storage or data type bindings.
- **Option B (Identifiers):** While syntactically they are identifiers, calling them merely "identifiers" fails to describe their specific semantic role in the macro definition.
- **Option C (Actual parameters):** Actual parameters are the concrete expressions or variables supplied when the macro is *called/invoked*, not the placeholders in the definition.
- **Option D (Formal parameters):** The precise technical term for parameters declared in a macro prototype/definition header.

---

### 4. Conclusion
Therefore, the correct answer is **Option D (Formal parameters)**.`,
    images: []
  },

  "go:2599": {
    concept: "Computer Networks - Minimum Hamming Distance of a Block Code",
    markdown: `### 1. Definition of Hamming Distance
In coding theory and data communication, the **Hamming distance** $d(c_i, c_j)$ between two binary codewords $c_i$ and $c_j$ of equal length is the number of bit positions in which the two codewords differ:
$$d(c_i, c_j) = w_H(c_i \\oplus c_j)$$
where $\\oplus$ denotes bitwise XOR and $w_H$ is the Hamming weight (number of ones).

The **minimum Hamming distance** (or simply the **distance of the code**) $d_{\\min}$ of a code $\\mathcal{C}$ is the minimum Hamming distance between any pair of distinct codewords:
$$d_{\\min} = \\min_{\\substack{c_i, c_j \\in \\mathcal{C} \\\\ c_i \\ne c_j}} d(c_i, c_j)$$

---

### 2. Pairwise Distance Calculation
We are given a code consisting of 5 codewords of length $n = 6$:
- $C_1 = 000000$
- $C_2 = 010101$
- $C_3 = 000111$
- $C_4 = 011001$
- $C_5 = 111111$

Let us compute the Hamming distances between all $\\binom{5}{2} = 10$ pairs of distinct codewords:
1. $d(C_1, C_2) = w_H(010101) = 3$
2. $d(C_1, C_3) = w_H(000111) = 3$
3. $d(C_1, C_4) = w_H(011001) = 3$
4. $d(C_1, C_5) = w_H(111111) = 6$
5. $d(C_2, C_3) = w_H(010101 \\oplus 000111) = w_H(010010) = \\mathbf{2}$
6. $d(C_2, C_4) = w_H(010101 \\oplus 011001) = w_H(001100) = \\mathbf{2}$
7. $d(C_2, C_5) = w_H(010101 \\oplus 111111) = w_H(101010) = 3$
8. $d(C_3, C_4) = w_H(000111 \\oplus 011001) = w_H(011110) = 4$
9. $d(C_3, C_5) = w_H(000111 \\oplus 111111) = w_H(111000) = 3$
10. $d(C_4, C_5) = w_H(011001 \\oplus 111111) = w_H(100110) = 3$

---

### 3. Determination of Code Distance
The minimum distance across all distinct pairs is:
$$d_{\\min} = \\min \\{3, 3, 3, 6, 2, 2, 3, 4, 3, 3\\} = \\mathbf{2}$$

Because $d(C_2, C_3) = 2$ and $d(C_2, C_4) = 2$, the distance of the code is $2$.

---

### 4. Conclusion
Therefore, the correct answer is **Option A ($2$)**.`,
    images: []
  },

  "go:2600": {
    concept: "Compiler Design - Lexical Analysis & Lookahead Tokens in Pascal",
    markdown: `### 1. Problem Formulation & Lexical Analysis
In a compiler's **lexical analyzer (scanner)**, input source characters are grouped into meaningful atomic units called **tokens**. 

A scanner often must peek at the **next input character (lookahead)** to determine whether the current token has ended or whether the next character forms a longer valid token (the *maximal munch* or longest-match rule).
We are asked which of the following strings can definitely be recognized as a token **without looking ahead at the next input character** in Pascal:
- **I.** \`begin\`
- **II.** \`program\`
- **III.** \`<>\`

---

### 2. Analysis of Each String
1. **String I (\`begin\`):**
   In Pascal, an identifier starts with a letter followed by any sequence of letters or digits.
   - If the scanner reads \`begin\`, it cannot immediately emit the keyword token \`begin\`.
   - If the subsequent character is an alphabetic character (e.g., \`n\`), the token being scanned might be the identifier \`beginning\`.
   - Therefore, the scanner **must look ahead** at the next character to verify that it is not a letter or digit (e.g., whitespace, semicolon, or parenthesis) before confirming the keyword token.
2. **String II (\`program\`):**
   Similarly, if the scanner reads \`program\`, the subsequent character could be \`m\` (forming \`programmer\`).
   - Hence, the scanner **must look ahead** at the next character before completing the keyword token.
3. **String III (\`<>\`):**
   In Pascal, \`<>\` represents the relational operator for "not equal".
   - The relational operators in Pascal involving \`<\` are \`<\`, \`<=\`, and \`<>\`.
   - There is no three-character operator in Pascal that begins with \`<>\` (such as \`<>=\` or \`<>>\`).
   - Therefore, as soon as the sequence \`<>\` is recognized, no subsequent character could possibly extend it into a longer single operator token. The token boundary is definitively known immediately.
   - Thus, \`<>\` can definitely be determined to be a token without examining the next character.

---

### 3. Conclusion
Only statement **III** can definitely be recognized as a token without looking at the next input character.

Therefore, the correct answer is **Option C (III)**.`,
    images: ["/question-images/13225290482418578126.webp"]
  },

  "go:2601": {
    concept: "Compiler Design & Operating Systems - Object Module Information for Linker",
    markdown: `### 1. Role of the Linker and Object Modules
When source programs are compiled separately into independent **object modules** (e.g., \`.o\` or \`.obj\` files), each module is compiled in isolation without prior knowledge of the physical or virtual memory addresses at which it or other modules will reside.

The **linker (link-editor)** takes these separate object modules as input and resolves cross-module references to create a single executable program or shared library.

---

### 2. Information Required in an Object Module
To enable separate compilation and cross-module resolution, an object module must include:
1. **Object Code / Text Segment:** The translated machine instructions and initialized data.
2. **Relocation Information / Relocation Bits:** Markers indicating which instructions, memory references, or pointers inside the object code contain relative offsets that must be adjusted when segments are merged and bound to memory.
3. **Exported / External Symbol Table:** The **names and locations (internal relative offsets)** of all public/external functions and global variables defined within this module that can be referenced by other separately compiled modules (the *export table* or *entry table*).
4. **Imported Symbol Table:** Names of external symbols that are referenced in this module but defined elsewhere.

---

### 3. Distractor Analysis & Specific Linker Requirement
- **Option A (Object code) & Option B (Relocation bits):** Are essential parts of any object file, but in the context of linking *separately compiled programs*, the defining requirement that enables the linker to bind inter-module calls is knowing which symbols are externally accessible and where they reside in each module.
- **Option C ("Names and locations of all external symbols defined in the object module"):** This directly describes the symbol definition table (exports). Without this table, the linker cannot locate external functions (like \`extern int foo();\`) defined in one module and called from another.
- **Option D ("Absolute addresses of internal symbols"):** **Completely incorrect.** Object modules are relocatable; internal symbols are assigned relative offsets from the module origin ($0$), never absolute memory addresses. Absolute addresses are only determined during link-time layout and loading.

---

### 4. Conclusion
Therefore, the correct answer is **Option C (Names and locations of all external symbols defined in the object module)**.`,
    images: []
  },

  "go:2602": {
    concept: "Operating Systems - CPU Scheduling Policies for Time-Sharing Systems",
    markdown: `### 1. Requirements of a Time-Sharing Operating System
A **time-sharing (multitasking)** operating system multiplexes CPU time among multiple active users and interactive processes. Its primary performance objectives are:
1. **Low Response Time:** An interactive process should receive CPU attention promptly after an input event.
2. **Fairness & Preemption:** No long CPU-bound process should monopolize the CPU or cause interactive tasks to freeze (starvation prevention).
3. **Predictability:** Equal allocation of CPU slices among all ready processes.

---

### 2. Evaluation of CPU Scheduling Algorithms
- **Round Robin (RR):**
  - Designed specifically for time-sharing systems.
  - The ready queue is treated as a circular FIFO queue.
  - Each process is allocated a small unit of CPU time called a **time quantum (slice)** (typically $10 - 100\\text{ ms}$).
  - If a process does not finish within its quantum, it is preempted by a hardware timer interrupt and returned to the tail of the ready queue.
  - This ensures bounded response time: if there are $n$ processes in the ready queue and the quantum is $q$, no process waits more than $(n-1)q$ time units for its next turn.
- **Shortest Job First (SJF):**
  - Minimizes average waiting time in batch systems.
  - Non-preemptive (or preemptive SRTF) requires precise future knowledge of CPU burst times, which cannot be known in interactive environments.
  - Causes severe starvation for long jobs.
- **First Come First Serve (FCFS):**
  - Non-preemptive; suffers from the **convoy effect** where short interactive jobs wait behind long CPU-bound jobs, resulting in unacceptable response times.
- **Elevator (SCAN):**
  - A disk arm scheduling algorithm designed to service secondary storage track requests, not a CPU scheduling policy.

---

### 3. Conclusion
Therefore, the correct answer is **Option B (Round Robin)**.`,
    images: []
  },

  "go:2603": {
    concept: "Algorithms - Comparison Complexity of Merging Two Sorted Lists",
    markdown: `### 1. The Two-Way Merge Procedure
Let $L_1$ and $L_2$ be two pre-sorted lists of lengths $m$ and $n$ respectively. 
To merge them into a single sorted list $L$ of size $m + n$:
1. Initialize two pointers $i = 0$ (for $L_1$) and $j = 0$ (for $L_2$).
2. At each iteration, compare the current elements $L_1[i]$ and $L_2[j]$.
3. Append the smaller element to the output list $L$ and advance the corresponding pointer ($i$ or $j$).
4. Repeat until one list is completely exhausted.
5. Copy the remaining elements of the non-exhausted list directly to $L$ without any further comparisons.

---

### 2. Comparison Complexity Derivation
- **Worst-Case Comparisons:**
  Each comparison outputs exactly one element to the merged list.
  The merge procedure terminates as soon as all elements of one list have been output. At that moment, at least one element remains in the other list, which requires zero comparisons to append.
  Thus, in the worst case (where elements of $L_1$ and $L_2$ strictly alternate in magnitude), the maximum number of comparisons is:
  $$C_{\\max} = m + n - 1$$
- **Best-Case Comparisons:**
  If all elements of $L_1$ are strictly smaller than the smallest element of $L_2$, list $L_1$ is exhausted after exactly $m$ comparisons.
  $$C_{\\min} = \\min(m, n)$$

In both best and worst cases, the number of comparisons is bounded above and below linearly by the combined size of the lists:
$$C(m, n) = \\Theta(m + n) = O(m + n)$$

---

### 3. Option & Distractor Analysis
- **Option A ($O(m)$):** Only valid if $m$ completely dominates $n$ or if $n$ is a constant, which is not true for arbitrary lists.
- **Option B ($O(n)$):** Only valid if $n$ completely dominates $m$.
- **Option C ($O(m+n)$):** The correct asymptotic bound for merging two sorted lists of sizes $m$ and $n$.
- **Option D ($O(\\log m + \\log n)$):** Sub-linear complexity; impossible because every element may need to be examined to establish sorted order.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($O(m+n)$)**.`,
    images: []
  },

  "go:2604": {
    concept: "Programming & Data Structures - Binary Tree Degree-2 Nodes vs Leaf Nodes",
    markdown: `### 1. Structural Parameters of a Binary Tree
Let $T$ be an arbitrary binary tree. Every node in $T$ can have $0$, $1$, or $2$ child nodes.
Let:
- $n_0$: Number of leaf nodes (nodes with degree $0$ in terms of children, given as $n$).
- $n_1$: Number of internal nodes with degree $1$ (exactly $1$ child).
- $n_2$: Number of internal nodes with degree $2$ (exactly $2$ children).
- $N$: Total number of nodes in tree $T$.
- $E$: Total number of edges in tree $T$.

---

### 2. Mathematical Proof via Edge Counting
1. **Total Node Count:**
   $$N = n_0 + n_1 + n_2$$
2. **Total Edge Count from Tree Property:**
   In any tree with $N$ vertices, every node except the root has exactly one parent (incoming edge). Thus:
   $$E = N - 1 = n_0 + n_1 + n_2 - 1 \\tag{Eq. 1}$$
3. **Total Edge Count from Out-Degrees:**
   Every node of degree $1$ contributes $1$ child edge, and every node of degree $2$ contributes $2$ child edges. Leaf nodes have $0$ children:
   $$E = 0 \\cdot n_0 + 1 \\cdot n_1 + 2 \\cdot n_2 = n_1 + 2n_2 \\tag{Eq. 2}$$
4. **Equating the Two Edge Equations:**
   $$n_0 + n_1 + n_2 - 1 = n_1 + 2n_2$$
   Subtracting $n_1 + n_2$ from both sides:
   $$n_0 - 1 = n_2$$
   $$\\mathbf{n_2 = n_0 - 1}$$

Since the problem states that the number of leaf nodes is $n_0 = n$:
$$n_2 = n - 1$$

---

### 3. Distractor Analysis
- **Option A ($\\log_2 n$):** The height of a balanced tree is $\\approx \\log_2 n$, not the count of degree-2 nodes.
- **Option B ($n - 1$):** Exactly matches the theorem $n_2 = n_0 - 1$.
- **Option C ($n$):** Incorrect; degree-2 nodes are always strictly one less than the number of leaves.
- **Option D ($2^n$):** Exponential; vastly exceeds the total node count.

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($n-1$)**.`,
    images: []
  },

  "go:2613": {
    concept: "Computer Organization & Architecture - Intel 8085 Register Operations",
    markdown: `### 1. Problem Objective
We are required to find a sequence of two Intel 8085 microprocessor assembly instructions that:
1. Multiplies the 16-bit contents of the **DE register pair** by $2$.
2. Stores the final result in the **HL register pair**.

---

### 2. Relevant 8085 Instructions
- **\`XCHG\` (Exchange HL and DE):**
  - A 1-byte instruction that swaps the contents of register pair H-L with register pair D-E:
    $$[H-L] \\longleftrightarrow [D-E]$$
  - After executing \`XCHG\`, the HL register pair contains the original value of the DE register pair.
- **\`DAD rp\` (Double Add to HL):**
  - A 1-byte instruction that adds the 16-bit contents of register pair \`rp\` (BC, DE, HL, or SP) to register pair HL, storing the 16-bit sum back in HL:
    $$[H-L] \\longleftarrow [H-L] + [rp]$$
  - If \`rp = H\`, then \`DAD H\` computes:
    $$[H-L] \\longleftarrow [H-L] + [H-L] = 2 \\times [H-L]$$
  - Adding a number to itself is mathematically equivalent to multiplying by $2$ (or shifting left by 1 bit).

---

### 3. Step-by-Step Execution of the Sequence \`XCHG\` and \`DAD H\`
1. **Instruction 1: \`XCHG\`**
   $$[H-L] = [D-E]_{\\text{initial}}$$
   $$[D-E] = [H-L]_{\\text{initial}}$$
2. **Instruction 2: \`DAD H\`**
   $$[H-L] = [H-L] + [H-L] = 2 \\times [D-E]_{\\text{initial}}$$
The contents of DE have been multiplied by $2$, and the result is residing in the HL register pair.

---

### 4. Distractor Analysis
- **Option A (\`XCHG\` and \`DAD B\`):** Computes $[DE] + [BC]$ into HL, not $2 \\times [DE]$.
- **Option B (\`XTHL\` and \`DAD H\`):** \`XTHL\` exchanges HL with the top of the stack, which does not involve DE.
- **Option C (\`PCHL\` and \`DAD D\`):** \`PCHL\` loads the Program Counter with HL (an unconditional branch), so execution jumps away before the second instruction.
- **Option D (\`XCHG\` and \`DAD H\`):** Correctly moves DE into HL and doubles it into HL.

---

### 4. Conclusion
Therefore, the correct answer is **Option D (XCHG and DAD H)**.`,
    images: []
  },

  "go:2614": {
    concept: "Digital Logic & Computer Organization - Memory Interfacing & Line Calculations",
    markdown: `### 1. Memory Capacity Formulation
A memory unit's capacity is formally denoted as:
$$\\text{Capacity} = \\text{Number of Words} \\times \\text{Number of Bits per Word}$$
We are given a memory of:
$$4\\text{K} \\times 16$$

---

### 2. Determination of Address Lines
1. Each word in memory must possess a unique binary address.
2. The number of addressable words is:
   $$\\text{Words} = 4\\text{K} = 4 \\times 1024 = 4096 = 2^{12}$$
3. If a memory has $2^k$ distinct word locations, the number of address lines $k$ required on the address bus is:
   $$k = \\log_2(4096) = 12\\text{ address lines}$$

---

### 3. Determination of Data Lines
1. The word length (the width of data read or written in parallel during a single memory cycle) is:
   $$\\text{Bits per Word} = 16\\text{ bits}$$
2. Therefore, the bidirectional data bus requires:
   $$16\\text{ data lines}$$

---

### 4. Summary & Option Matching
- **Address lines required:** $12$
- **Data lines required:** $16$

This corresponds directly to **12 address, 16 data lines** (Option C).

---

### 5. Conclusion
Therefore, the correct answer is **Option C (12 address, 16 data lines)**.`,
    images: []
  },

  "go:2615": {
    concept: "Algorithms - Euclidean Algorithm by Subtraction",
    markdown: `### 1. Code Analysis & Problem Statement
We are given the following Pascal program segment where $X$ and $Y$ are positive non-zero integers:

\`\`\`pascal
while X <> Y do
    if X > Y then
        X := X - Y
    else
        Y := Y - X;
write(X);
\`\`\`

We are asked to identify what mathematical function this code segment computes.

---

### 2. Mathematical Principles: Euclid's Subtraction Lemma
This algorithm is the original form of the **Euclidean Algorithm** (as formulated in Euclid's *Elements*, c. 300 BC):

1. **Lemma:** For any two positive integers $a$ and $b$ with $a > b$:
   $$\\gcd(a, b) = \\gcd(a - b, b)$$
   *Proof:* Any common divisor of $a$ and $b$ divides $a - b$. Conversely, any common divisor of $a - b$ and $b$ divides $(a - b) + b = a$. Thus, the set of common divisors of $\\{a, b\\}$ is identical to that of $\\{a - b, b\\}$, meaning their greatest common divisors are equal.
2. **Loop Invariant:**
   At the start and end of every iteration of the \`while\` loop:
   $$\\gcd(X, Y) = \\gcd(X_{\\text{initial}}, Y_{\\text{initial}})$$
3. **Termination:**
   In every iteration, the strictly larger integer is replaced by the strictly positive difference, reducing the sum $X + Y$ by at least $1$. Because $X, Y \\in \\mathbb{Z}^+$, the loop must terminate.
4. **Termination Condition:**
   The loop terminates when $X = Y$.
   At termination:
   $$\\gcd(X, Y) = \\gcd(X, X) = X$$
   Thus, the value printed, \`write(X)\`, is the **Greatest Common Divisor (GCD)** of the two initial numbers.

---

### 3. Illustrative Trace
Let $X = 36, Y = 24$:
1. $36 > 24 \\implies X = 36 - 24 = 12$
2. $12 < 24 \\implies Y = 24 - 12 = 12$
3. $X = Y = 12 \\implies$ loop terminates; outputs $12 = \\gcd(36, 24)$.

---

### 4. Conclusion
Therefore, the correct answer is **Option C (Computes the GCD of two numbers)**.`,
    images: []
  },

  "go:2616": {
    concept: "Compiler Design & Programming Languages - Parameter Passing Semantics in Pascal",
    markdown: `### 1. Code Analysis & Pascal Semantics
We are given the following Pascal program:

\`\`\`pascal
program COMPUTE (input, output);
var X:integer;
procedure FIND (X:real);
    begin
        X:=sqrt(X);
    end;
begin
    X:=2;
    FIND(X);
    writeln(X);
end.
\`\`\`

---

### 2. Parameter Passing Semantics: Call by Value vs Call by Reference
In standard Pascal:
1. **Call by Reference (\`var\` parameter):**
   If a parameter in a procedure header is declared with the keyword \`var\` (e.g., \`procedure FIND (var X: real);\`), it is passed by reference. The formal parameter becomes an alias for the actual argument, and changes made inside the procedure modify the caller's variable.
2. **Call by Value (Value parameter):**
   When the keyword \`var\` is **omitted** (as in \`procedure FIND (X:real);\`), the parameter is passed strictly **by value**.
   - A new local activation record (stack frame) is allocated for \`FIND\`.
   - The value of the actual argument (the integer $2$) is evaluated, converted to a real ($2.0$), and copied into the local variable $X$ inside \`FIND\`.
   - The statement \`X := sqrt(X);\` updates only this local formal parameter $X$ (setting it to $\\sqrt{2} \\approx 1.4142$).
   - When \`FIND\` terminates, its local stack frame is destroyed.

---

### 3. Execution in the Main Program
1. The global integer variable $X$ in the main program was initialized to:
   $$X := 2$$
2. The procedure call \`FIND(X)\` passes $X$ by value. The global variable $X$ is never modified.
3. Upon return, \`writeln(X)\` outputs the value of the global variable $X$, which is still **$2$**.

---

### 4. Distractor Analysis
- **Option A ($2$):** Correctly accounts for pass-by-value semantics preserving the caller's variable.
- **Option B ($\\sqrt{2}$):** Would occur only if $X$ were declared as a \`var\` reference parameter (\`procedure FIND (var X: real)\`).
- **Option C (Run time error):** Type coercion from integer actual parameter to real formal value parameter is fully supported in standard Pascal.
- **Option D (None of the above):** Incorrect since Option A is valid.

---

### 5. Conclusion
Therefore, the correct answer is **Option A ($2$)**.`,
    images: []
  },

  "go:2617": {
    concept: "Digital Logic - Simultaneous Boolean Equations",
    markdown: `### 1. System of Boolean Equations
We are given three simultaneous Boolean equations with variables $A, B, C, D \\in \\{0, 1\\}$:
1. $\\overline{A} + AB = 0$
2. $AB = AC$
3. $AB + A\\overline{C} + CD = \\overline{C}D$

---

### 2. Analytical Step-by-Step Derivation
#### Step 1: Solve Equation 1
$$\\overline{A} + AB = 0$$
Using the absorption law of Boolean algebra:
$$\\overline{A} + AB = \\overline{A} + B$$
For the logical OR of two Boolean terms to be $0$, both terms must simultaneously be $0$:
$$\\overline{A} = 0 \\implies \\mathbf{A = 1}$$
$$\\mathbf{B = 0}$$

#### Step 2: Solve Equation 2
$$AB = AC$$
Substitute the known values $A = 1$ and $B = 0$:
$$1 \\cdot 0 = 1 \\cdot C$$
$$0 = C \\implies \\mathbf{C = 0}$$

#### Step 3: Solve Equation 3
$$AB + A\\overline{C} + CD = \\overline{C}D$$
Substitute $A = 1$, $B = 0$, and $C = 0$ (so $\\overline{C} = \\overline{0} = 1$):
- $AB = 1 \\cdot 0 = 0$
- $A\\overline{C} = 1 \\cdot 1 = 1$
- $CD = 0 \\cdot D = 0$

Evaluating the Left-Hand Side (LHS):
$$\\text{LHS} = 0 + 1 + 0 = 1$$

Evaluating the Right-Hand Side (RHS):
$$\\text{RHS} = \\overline{C}D = 1 \\cdot D = D$$

Equating LHS and RHS:
$$1 = D \\implies \\mathbf{D = 1}$$

---

### 3. Summary of Variable Values
$$A = 1, \\quad B = 0, \\quad C = 0, \\quad D = 1$$

Matching with the choices:
- **Option A:** $A=1, B=0, C=0, D=1$ (Matches derived solution)
- **Option B:** $A=1, B=1, C=0, D=0$
- **Option C:** $A=1, B=0, C=1, D=1$
- **Option D:** $A=1, B=0, C=0, D=0$

---

### 4. Conclusion
Therefore, the correct answer is **Option A ($A=1, B=0, C=0, D=1$)**.`,
    images: []
  },

  "go:2619": {
    concept: "Operating Systems - Demand Paging & Page Fault Calculation",
    markdown: `### 1. Problem Formulation & Mapping
We are given a pure demand paging system with:
- **Page Size:** $100$ records per page (meaning addresses $0\\dots99$ fall into Page $0$, $100\\dots199$ fall into Page $1$, and so on).
- **Physical Memory:** Exactly **$1$ free main memory frame**.
- **Address Reference Sequence:**
  $$0100, 0200, 0430, 0499, 0510, 0530, 0560, 0120, 0220, 0240, 0260, 0320, 0370$$

---

### 2. Address to Page Number Translation
$$\\text{Page Number} = \\left\\lfloor \\frac{\\text{Address}}{100} \\right\\rfloor$$

1. $0100 \\implies \\lfloor 100/100 \\rfloor = \\mathbf{1}$
2. $0200 \\implies \\lfloor 200/100 \\rfloor = \\mathbf{2}$
3. $0430 \\implies \\lfloor 430/100 \\rfloor = \\mathbf{4}$
4. $0499 \\implies \\lfloor 499/100 \\rfloor = \\mathbf{4}$
5. $0510 \\implies \\lfloor 510/100 \\rfloor = \\mathbf{5}$
6. $0530 \\implies \\lfloor 530/100 \\rfloor = \\mathbf{5}$
7. $0560 \\implies \\lfloor 560/100 \\rfloor = \\mathbf{5}$
8. $0120 \\implies \\lfloor 120/100 \\rfloor = \\mathbf{1}$
9. $0220 \\implies \\lfloor 220/100 \\rfloor = \\mathbf{2}$
10. $0240 \\implies \\lfloor 240/100 \\rfloor = \\mathbf{2}$
11. $0260 \\implies \\lfloor 260/100 \\rfloor = \\mathbf{2}$
12. $0320 \\implies \\lfloor 320/100 \\rfloor = \\mathbf{3}$
13. $0370 \\implies \\lfloor 370/100 \\rfloor = \\mathbf{3}$

The resulting page reference string is:
$$1, 2, 4, 4, 5, 5, 5, 1, 2, 2, 2, 3, 3$$

---

### 3. Step-by-Step Demand Paging Trace (1 Frame)
With only $1$ memory frame, whenever the referenced page matches the resident page, a **hit** occurs; whenever it differs, a **page fault** occurs and the resident page is replaced:

| Step | Page Ref | Frame Content | Outcome | Page Fault Count |
| :---: | :---: | :---: | :---: | :---: |
| 1 | **1** | $[1]$ | **Fault (miss)** | 1 |
| 2 | **2** | $[2]$ | **Fault (miss)** | 2 |
| 3 | **4** | $[4]$ | **Fault (miss)** | 3 |
| 4 | **4** | $[4]$ | **Hit** | 3 |
| 5 | **5** | $[5]$ | **Fault (miss)** | 4 |
| 6 | **5** | $[5]$ | **Hit** | 4 |
| 7 | **5** | $[5]$ | **Hit** | 4 |
| 8 | **1** | $[1]$ | **Fault (miss)** | 5 |
| 9 | **2** | $[2]$ | **Fault (miss)** | 6 |
| 10 | **2** | $[2]$ | **Hit** | 6 |
| 11 | **2** | $[2]$ | **Hit** | 6 |
| 12 | **3** | $[3]$ | **Fault (miss)** | 7 |
| 13 | **3** | $[3]$ | **Hit** | 7 |

---

### 4. Conclusion
The total number of page faults generated is **$7$**.

Therefore, the correct answer is **Option C ($7$)**.`,
    images: []
  },

  "go:2621": {
    concept: "Programming & Algorithms - String Manipulation Functions",
    markdown: `### 1. Operation Definitions & Given Parameters
We are given three primitive string manipulation operations:
- $\\text{head}(s)$: Returns the **first character** of string $s$.
- $\\text{tail}(s)$: Returns all of string $s$ **except the first character**.
- $\\text{concat}(s_1, s_2)$: Returns the concatenation of strings $s_1$ and $s_2$.

Given input string:
$$s = \\text{"acbc"}$$

We are required to evaluate the expression:
$$\\text{concat}(\\text{head}(s), \\text{head}(\\text{tail}(\\text{tail}(s))))$$

---

### 2. Step-by-Step Expression Evaluation
1. **Evaluate First Argument: $\\text{head}(s)$**
   $$\\text{head}(\\text{"acbc"}) = \\text{'a'}$$
2. **Evaluate Inner Function: $\\text{tail}(s)$**
   $$\\text{tail}(\\text{"acbc"}) = \\text{"cbc"}$$
3. **Evaluate Second Tail: $\\text{tail}(\\text{tail}(s))$**
   $$\\text{tail}(\\text{"cbc"}) = \\text{"bc"}$$
4. **Evaluate Second Head: $\\text{head}(\\text{tail}(\\text{tail}(s)))$**
   $$\\text{head}(\\text{"bc"}) = \\text{'b'}$$
5. **Evaluate Concatenation:**
   $$\\text{concat}(\\text{'a'}, \\text{'b'}) = \\mathbf{\\text{"ab"}}$$

---

### 3. Option & Distractor Analysis
- **Option A ($ac$):** Would be obtained if the second term evaluated to the second character rather than the third.
- **Option B ($bc$):** Incorrect substring selection.
- **Option C ($ab$):** Exactly matches the step-by-step reduction.
- **Option D ($cc$):** Incorrect.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($ab$)**.`,
    images: []
  },

  "go:2622": {
    concept: "Compiler Design - Syntax-Directed Translation in Shift-Reduce Parsers",
    markdown: `### 1. Grammar & Translation Scheme
We are given an SDTS for a bottom-up shift-reduce parser with semantic actions executed immediately upon reduction:
- $R_1: S \\rightarrow xxW \\quad \\{\\text{print } \\text{\"1\"}\\}$
- $R_2: S \\rightarrow y \\quad \\{\\text{print } \\text{\"2\"}\\}$
- $R_3: W \\rightarrow Sz \\quad \\{\\text{print } \\text{\"3\"}\\}$

We are required to trace the parser actions and find the emitted output for the input string:
$$w = \\mathbf{xxxxyzz}$$

---

### 2. Bottom-Up Shift-Reduce Parsing Trace
A shift-reduce parser processes tokens from left to right on a stack. Whenever a substring on top of the stack matches the right-hand side of a production (a *handle*), it reduces it to the non-terminal on the left-hand side and executes the corresponding semantic action.

| Step | Stack Content | Remaining Input | Action Taken | Semantic Output |
| :---: | :--- | :--- | :--- | :---: |
| 1 | $\\$$ | $x x x x y z z \\$$ | Shift $x, x, x, x$ | — |
| 2 | $\\$ x x x x$ | $y z z \\$$ | Shift $y$ | — |
| 3 | $\\$ x x x x y$ | $z z \\$$ | **Reduce by $R_2$ ($S \\rightarrow y$)** | **2** |
| 4 | $\\$ x x x x S$ | $z z \\$$ | Shift $z$ | — |
| 5 | $\\$ x x x x S z$ | $z \\$$ | **Reduce by $R_3$ ($W \\rightarrow Sz$)** | **3** |
| 6 | $\\$ x x (x x W)$ | $z \\$$ | **Reduce by $R_1$ ($S \\rightarrow xxW$)** | **1** |
| 7 | $\\$ x x S$ | $z \\$$ | Shift $z$ | — |
| 8 | $\\$ x x S z$ | $\\$$ | **Reduce by $R_3$ ($W \\rightarrow Sz$)** | **3** |
| 9 | $\\$ (x x W)$ | $\\$$ | **Reduce by $R_1$ ($S \\rightarrow xxW$)** | **1** |
| 10 | $\\$ S$ | $\\$$ | **Accept (Start symbol $S$ reached)** | — |

---

### 3. Emitted Translation Sequence
Concatenating the printed digits in exact chronological reduction order:
$$\\mathbf{23131}$$

---

### 4. Distractor Analysis
- **Option A ($23131$):** Matches the exact bottom-up reduction order.
- **Option B ($11233$):** Corresponds to an invalid top-down or reversed evaluation order.
- **Option C ($11231$):** Incorrect intermediate reduction sequence.
- **Option D ($33211$):** Corresponds to an incorrect right-to-left traversal.

---

### 5. Conclusion
Therefore, the correct answer is **Option A ($23131$)**.`,
    images: []
  },

  "go:2623": {
    concept: "Compiler Design & Programming Languages - Memory Allocation for Pascal Variant Records",
    markdown: `### 1. Pascal Variant Record Memory Model
In Pascal, a **variant record** allows different structures to be overlaid in the same memory space depending on a tag field (conceptually identical to a \`struct\` containing a \`union\` in C).

The given variant record type is defined as:

\`\`\`pascal
type varirec = record
    number : integer;
    case (var1, var2) of
        var1: (x, y : integer);
        var2: (p, q : real)
    end
end
\`\`\`

---

### 2. Architecture Specifications & Component Sizing
We are given:
- Size of an \`integer\` $= 4\\text{ bytes}$
- Size of a \`real\` $= 8\\text{ bytes}$
- An array of **$100$ records** of type \`varirec\`.

#### Step 1: Size of the Fixed Part
The non-variant (fixed) component contains:
$$\\text{Field } \\text{\`number\`} : \\text{integer} \\implies 4\\text{ bytes}$$

#### Step 2: Size of the Variant Part
In a variant record, the variants share the same physical memory space. To ensure safe execution regardless of which variant is active, the compiler must allocate space equal to the **largest variant**:
- **Variant 1 (\`var1\`):**
  $$\\text{Two integers } (x, y) = 2 \\times 4\\text{ bytes} = 8\\text{ bytes}$$
- **Variant 2 (\`var2\`):**
  $$\\text{Two reals } (p, q) = 2 \\times 8\\text{ bytes} = 16\\text{ bytes}$$

$$\\text{Space for Variant Part} = \\max(8\\text{ bytes}, 16\\text{ bytes}) = 16\\text{ bytes}$$

#### Step 3: Total Size of One Record
$$\\text{Size}(\\text{varirec}) = \\text{Fixed Part} + \\text{Variant Part} = 4\\text{ bytes} + 16\\text{ bytes} = 20\\text{ bytes}$$

#### Step 4: Total Space for the Array
The array holds $100$ such records:
$$\\text{Total Space} = 100 \\times 20\\text{ bytes} = \\mathbf{2000\\text{ bytes}}$$

---

### 3. Distractor Analysis
- **Option A ($2800$):** Would result if the variants were erroneously allocated sequentially without memory sharing ($4 + 8 + 16 = 28$ bytes per record $\\times 100 = 2800$).
- **Option B ($2400$):** Arithmetic error in component sizing.
- **Option C ($2000$):** Correctly calculates $20$ bytes per record with variant overlay.
- **Option D ($1200$):** Would result if only the smaller variant were allocated ($4 + 8 = 12$ bytes per record $\\times 100 = 1200$), which would cause buffer overflow when storing real values.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($2000$)**.`,
    images: ["/question-images/15379021139215584265.webp"]
  },

  "go:2624": {
    concept: "Digital Logic - Binary & Hexadecimal Number Representation",
    markdown: `### 1. Problem Formulation
We are given the arithmetic expression:
$$N = 3 \\times 4096 + 15 \\times 256 + 5 \\times 16 + 3$$
We are required to determine the total number of **$1$'s** in the binary representation of $N$.

---

### 2. Hexadecimal Representation
Observe that the weights in the expression are successive integer powers of $16 = 2^4$:
- $4096 = 16^3$
- $256 = 16^2$
- $16 = 16^1$
- $1 = 16^0$

Rewriting $N$ in radix-$16$ (hexadecimal) positional notation:
$$N = 3 \\cdot 16^3 + 15 \\cdot 16^2 + 5 \\cdot 16^1 + 3 \\cdot 16^0$$

In hexadecimal notation (where $15_{10} = \\text{F}_{16}$):
$$N = (3\\text{F}53)_{16}$$

---

### 3. Conversion from Hexadecimal to Binary
Each hexadecimal digit directly expands into a $4$-bit binary nibble:
1. $3_{16} = 0011_2 \\implies$ contains **$2$** ones
2. $\\text{F}_{16} = 1111_2 \\implies$ contains **$4$** ones
3. $5_{16} = 0101_2 \\implies$ contains **$2$** ones
4. $3_{16} = 0011_2 \\implies$ contains **$2$** ones

Concatenating the binary nibbles gives the full $16$-bit binary word:
$$N = \\mathbf{0011\\; 1111\\; 0101\\; 0011}_2$$

---

### 4. Summing the Total Number of 1's
$$\\text{Total } 1\\text{'s} = 2 + 4 + 2 + 2 = \\mathbf{10}$$

---

### 5. Distractor Analysis
- **Option A ($8$):** Missing two ones.
- **Option B ($9$):** Off-by-one counting error.
- **Option C ($10$):** Exactly matches the derived Hamming weight.
- **Option D ($12$):** Overcounting bits.

---

### 6. Conclusion
Therefore, the correct answer is **Option C ($10$)**.`,
    images: []
  }
};

export function applyChunkVin10() {
  console.log("Applying CHUNK-CSE-VIN-10 solutions...");

  // 1. Update data/solutions/chunks/cse/chunk-cse-vin-10.json
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-vin-10.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));
    for (const q of chunkData.questions) {
      if (CHUNK_CSE_VIN_10_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.detailedSolution = CHUNK_CSE_VIN_10_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
    console.log(`Updated ${chunkPath} with 25 ACCEPTED solutions.`);
  }

  // 2. Patch AUTHENTIC_PATCHES in scripts/pipeline/patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  let patchContent = fs.readFileSync(patchFile, "utf8");

  // Check if go:2590 already in file
  if (!patchContent.includes('"go:2590":')) {
    const targetMarker = '  "ec:2014:q47": {';
    let injectionStr = "";
    for (const [uid, data] of Object.entries(CHUNK_CSE_VIN_10_SOLUTIONS)) {
      injectionStr += `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },\n`;
    }
    if (patchContent.includes(targetMarker)) {
      patchContent = patchContent.replace(targetMarker, () => injectionStr + targetMarker);
      fs.writeFileSync(patchFile, patchContent, "utf8");
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
    if (manifest.chunks["CHUNK-CSE-VIN-10"]) {
      manifest.chunks["CHUNK-CSE-VIN-10"].status = "COMPLETED";
      manifest.chunks["CHUNK-CSE-VIN-10"].completedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`Updated manifest.json: CHUNK-CSE-VIN-10 marked COMPLETED.`);
    }
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  applyAuthenticPatches();
  console.log("CHUNK-CSE-VIN-10 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-vin-10")) {
  applyChunkVin10();
}

