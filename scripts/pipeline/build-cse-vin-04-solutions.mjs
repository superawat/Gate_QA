import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export const VIN_04_SOLUTIONS = {
  "go:1495": {
    concept: "Digital Logic - Binary Signed Number Representations of Zero",
    markdown: `### 1. Problem Formulation & Scope
We are asked to identify which binary signed number representations have **two distinct representations for the value zero ($+0$ and $-0$)** among:
- Sign-magnitude
- $2$'s complement
- $1$'s complement

### 2. Analysis of Signed Number Formats ($n$-bit system)
1. **Sign-Magnitude Representation:**
   - In an $n$-bit sign-magnitude format, the Most Significant Bit (MSB) denotes the sign ($0$ for positive, $1$ for negative), and the remaining $n - 1$ bits represent the absolute magnitude.
   - Positive zero ($+0$): $\\mathbf{0}00\\dots 0_2$
   - Negative zero ($-0$): $\\mathbf{1}00\\dots 0_2$
   - Thus, zero has **two distinct representations**.

2. **$1$'s Complement Representation:**
   - In an $n$-bit $1$'s complement format, a negative number is formed by bitwise inverting all bits of its positive counterpart.
   - Positive zero ($+0$): $000\\dots 0_2$
   - Negative zero ($-0$): Bitwise NOT of $+0 = 111\\dots 1_2$
   - Thus, zero has **two distinct representations**.

3. **$2$'s Complement Representation:**
   - In an $n$-bit $2$'s complement format, a negative number is formed by inverting all bits and adding $1$.
   - Positive zero ($+0$): $000\\dots 0_2$
   - To form $-0$:
     $$000\\dots 0_2 \\xrightarrow{\\text{NOT}} 111\\dots 1_2 \\xrightarrow{+1} 1\\mathbf{000\\dots 0}_2$$
     The carry out of the $n$-th bit is discarded in $n$-bit registers, leaving strictly $000\\dots 0_2$.
   - Therefore, $2$'s complement possesses **exactly one unique representation for zero**.

### 3. Conclusion
Zero has two representations in **Sign-magnitude (A)** and **$1$'s complement (C)**.

**Correct Answer: Options A and C**`,
    images: [],
    reviewNote: "Sign-magnitude has +0 (00..0) and -0 (10..0). 1's complement has +0 (00..0) and -0 (11..1). 2's complement has a unique zero. Matches official key [A, C]."
  },
  "go:1496": {
    concept: "Operating Systems / Storage Architecture - RAID Capabilities and Objectives",
    markdown: `### 1. Conceptual Framework: RAID
**RAID** (Redundant Array of Independent Disks) is a data storage virtualization technology that combines multiple physical disk drive components into one or more logical units for the purposes of data redundancy, performance improvement, or both.

### 2. Analysis of System Objectives
1. **High Speed (Performance):**
   - Implemented via **data striping** (e.g., RAID 0, RAID 5, RAID 6, RAID 10).
   - Large files and consecutive logical blocks are split across multiple physical drives.
   - Multiple read/write requests can be serviced in parallel across independent disk heads and channels, dramatically increasing aggregate throughput and I/O rate.

2. **Fault-Tolerance (Reliability):**
   - Implemented via **mirroring** (RAID 1) or **parity protection** (RAID 3, 4, 5, 6).
   - In the event of a physical drive crash, the missing data can be retrieved from the mirror drive or reconstructed in real time from parity blocks, ensuring uninterrupted system availability.

3. **Data Density:**
   - Physical data density (bits per square inch) is determined strictly by the magnetic platter technology of individual drives; RAID does not alter recording density.

### 3. Conclusion
RAID configurations are utilized to provide both **Fault-tolerance (A)** and **High speed (B)**.

**Correct Answer: Option D ((A) & (B))**`,
    images: [],
    reviewNote: "RAID provides fault tolerance (via mirroring/parity) and high speed (via disk striping). Matches official key D."
  },
  "go:1497": {
    concept: "Computer Organization & Architecture - Control Unit Implementation Speeds",
    markdown: `### 1. Problem Formulation & Scope
We are required to arrange the following CPU control unit configurations in **decreasing order of operating speed** (from fastest to slowest):
1. Hardwired control
2. Vertical microprogramming
3. Horizontal microprogramming

### 2. Architectural Comparison of Control Units
1. **Hardwired Control Unit (Fastest):**
   - Implemented directly using combinational logic gates, decoders, and sequential state flip-flops.
   - Control signals propagate at hardware gate delay speeds without any memory lookup.
   - Fastest possible control unit design.

2. **Horizontal Microprogramming (Intermediate):**
   - Control signals are stored in wide microinstructions within a fast Control Store (control memory).
   - In pure horizontal microprogramming, each control line is directly controlled by an individual bit in the microinstruction (minimal or zero decoding).
   - Speed is limited only by the access time of the control ROM/SRAM, avoiding additional combinational decoding stages.

3. **Vertical Microprogramming (Slowest):**
   - Microinstructions are encoded into compact fields (e.g., 3 bits to encode 8 mutually exclusive control signals).
   - To generate the final control signals, the microinstruction must first be fetched from control memory, and then passed through decoder circuits.
   - The combined delay of memory access plus decoder propagation makes vertical microprogramming slower than horizontal microprogramming.

### 3. Ordering
Decreasing order of speed:
$$\\text{Hardwired control} > \\text{Horizontal microprogramming} > \\text{Vertical microprogramming}$$

**Correct Answer: Option B**`,
    images: [],
    reviewNote: "Speed ranking: Hardwired (gate delay) > Horizontal microprogrammed (ROM read, no decode) > Vertical microprogrammed (ROM read + decode delay). Matches official key B."
  },
  "go:1498": {
    concept: "Algorithms - Asymptotic Recurrence Relations and Master Theorem",
    markdown: `### 1. Problem Formulation & Recurrences
We are given four recurrence relations with base case $T(1) = O(1)$ and need to find their asymptotic upper bounds:
- (M) $T(n) = T(n-1) + n$
- (N) $T(n) = T(n/2) + n$
- (O) $T(n) = T(n/2) + n \\log n$
- (P) $T(n) = T(n-1) + \\log n$

Target classes:
- (U) $T(n) = O(n)$
- (V) $T(n) = O(n \\log n)$
- (W) $T(n) = O(n^2)$
- (X) $T(n) = O(\\log^2 n)$

### 2. Step-by-Step Derivation
1. **Recurrence (M): $T(n) = T(n-1) + n$**
   Unrolling the recurrence:
   $$T(n) = n + (n-1) + (n-2) + \\dots + 1 = \\frac{n(n+1)}{2} = O(n^2)$$
   Matches **(W)**.

2. **Recurrence (N): $T(n) = T(n/2) + n$**
   By Master Theorem for $a = 1, b = 2, f(n) = n$:
   $$n^{\\log_b a} = n^{\\log_2 1} = n^0 = 1$$
   Since $f(n) = n = \\Omega(n^{0 + 1})$, Case 3 applies:
   $$T(n) = \\Theta(n) = O(n)$$
   Matches **(U)**.

3. **Recurrence (O): $T(n) = T(n/2) + n \\log n$**
   Unrolling successive levels:
   $$T(n) = n \\log n + \\frac{n}{2} \\log\\left(\\frac{n}{2}\\right) + \\frac{n}{4} \\log\\left(\\frac{n}{4}\\right) + \\dots$$
   Since $\\log(n / 2^i) \\le \\log n$:
   $$T(n) \\le n \\log n \\left(1 + \\frac{1}{2} + \\frac{1}{4} + \\dots\\right) = 2 n \\log n = O(n \\log n)$$
   Matches **(V)**.

4. **Recurrence (P): $T(n) = T(n-1) + \\log n$**
   Unrolling the recurrence:
   $$T(n) = \\sum_{k=1}^n \\log k = \\log(n!)$$
   By Stirling's approximation, $\\log(n!) = \\Theta(n \\log n) = O(n \\log n)$.
   Matches **(V)**.

### 3. Matching
$$\\text{M-W, N-U, O-V, P-V}$$

**Correct Answer: Option D**`,
    images: [],
    reviewNote: "M: sum of 1..n is O(n^2) [W]; N: Master theorem gives O(n) [U]; O: geometric sum bounded by O(n log n) [V]; P: log(n!) is O(n log n) [V]. Matches official key D."
  },
  "go:1499": {
    concept: "Computer Organization & Architecture - RISC vs CISC Architecture Comparison",
    markdown: `### 1. Conceptual Framework: RISC vs CISC
- **CISC (Complex Instruction Set Computer):** Designed historically to close the semantic gap between high-level languages and hardware by providing rich, complex, multi-cycle instructions with diverse addressing modes and microcoded control.
- **RISC (Reduced Instruction Set Computer):** Focuses on a streamlined instruction pipeline where simple, single-cycle instructions execute rapidly using hardwired control and a load/store register architecture.

### 2. Analysis of Statements
- **Statement A: \"has fewer instructions\"**
  - **True.** RISC architectures deliberately restrict the instruction set to a compact collection of frequently used primitives (e.g., typically under $100$ instructions compared to hundreds in CISC).
- **Statement B: \"has fewer addressing modes\"**
  - **True.** RISC typically restricts memory addressing strictly to simple modes (such as base-register plus displacement in load/store instructions), avoiding complex indirect, scaled, or auto-increment modes.
- **Statement C: \"has more registers\"**
  - **True.** Because all operations (except load and store) are register-to-register, RISC processors require a large general-purpose register file (e.g., $32$ or more registers, or overlapping register windows) to minimize memory traffic.
- **Statement D: \"is easier to implement using hard-wired logic\"**
  - **True.** Fixed-length instruction formats, uniform opcode fields, and single-cycle instruction execution enable the control unit to be implemented straightforwardly using hardwired combinational logic rather than large, complex microcode ROMs.

### 3. Conclusion
All four statements accurately characterize typical RISC architectures compared to CISC.

**Correct Answer: Options A, B, C, and D**`,
    images: [],
    reviewNote: "RISC processors have fewer instructions (A), fewer addressing modes (B), larger register files (C), and simple hardwired control units (D). Matches official key [A, B, C, D]."
  },
  "go:1500": {
    concept: "Computer Organization & Architecture - Addressing Modes and Language Feature Implementation",
    markdown: `### 1. Problem Formulation & Scope
A processor supports only:
1. **Immediate addressing mode:** Operand value is embedded directly inside the instruction word.
2. **Direct (Absolute) addressing mode:** Target memory address is a fixed constant hardcoded directly inside the instruction word.

We need to evaluate which high-level programming language features cannot be implemented without dynamic runtime address computation.

### 2. Examination of Language Features
1. **Pointers (A):**
   - A pointer variable contains a dynamic memory address determined at runtime. Dereferencing a pointer (\`*p\`) requires accessing memory at an address held in a variable, which fundamentally requires **indirect addressing** or **register-indirect addressing**. Direct addressing cannot access an address known only at runtime.
2. **Arrays (B):**
   - Array indexing (\`A[i]\`) requires computing the effective address $\\text{base} + i \\times \\text{element\\_size}$. Because the index $i$ varies at runtime, accessing arbitrary array elements requires **indexed addressing** or register-indirect addressing. Direct addressing can only access a fixed compile-time element (such as \`A[0]\`).
3. **Records (C):**
   - Accessing fields of dynamically allocated records or records passed by reference (\`ptr->field\`) requires base-plus-offset addressing.
4. **Recursive procedures with local variables (D):**
   - Recursive invocations require allocating activation records dynamically on a runtime call stack. Each invocation's local variables reside at variable offsets determined by the current stack depth, requiring a **stack pointer / base-register addressing mode**. Direct addressing binds variables to fixed static locations, which would be overwritten by recursive calls.

### 3. Conclusion
Without dynamic addressing mechanisms (indirect, indexed, or base-register), none of these dynamic runtime features can be natively supported.

**Correct Answer: Options A, B, C, and D**`,
    images: [],
    reviewNote: "With only immediate and direct addressing, memory operands must have compile-time fixed addresses. Dynamic pointers, variable array indices, dynamic records, and recursive stack frames all require indirect/indexed/base addressing. Matches official key [A, B, C, D]."
  },
  "go:1501": {
    concept: "Algorithms / Programming in C - Function Tracing and Median Selection",
    markdown: `### 1. Code Analysis
We are given the recursive function:
\`\`\`c
int Trial (int a, int b, int c)
{
    if ((a >= b) && (c < b)) return b;
    else if (a >= b) return Trial(a, c, b);
    else return Trial(b, a, c);
}
\`\`\`

### 2. Tracing the Logic
1. **Base Case Condition:**
   \`(a >= b) && (c < b)\` $\\iff c < b \\le a$.
   In this configuration, $b$ is strictly greater than $c$ and less than or equal to $a$, meaning $b$ is the **middle (median)** number. The function returns $b$.

2. **Recursive Branches:**
   - If $a < b$: \`Trial(b, a, c)\` swaps the first two arguments so that the first argument is $\\ge$ the second argument.
   - If $a \\ge b$ but $c \\ge b$: \`Trial(a, c, b)\` swaps the second and third arguments.

3. **Critical Edge Case: Equal Arguments ($b = c$):**
   Consider what happens when arguments contain duplicates, for instance:
   $$a = 5, \\quad b = 3, \\quad c = 3$$
   - Check line 3: \`a >= b\` ($5 \\ge 3$, true), but \`c < b\` ($3 < 3$, **false**).
   - Check line 4: \`a >= b\` ($5 \\ge 3$, true).
     Executes: \`return Trial(5, 3, 3);\`
   - On the next recursive call, arguments are still $(5, 3, 3)$.
   - The function recursively calls \`Trial(5, 3, 3)\` **infinitely**, resulting in a stack overflow!

Similarly, for $a = b = c = 2$, it loops infinitely between recursive calls without ever returning.

### 3. Conclusion
Because the function fails to handle equality conditions and enters infinite recursion on valid inputs, it does not universally find the median, maximum, or minimum.
Therefore, the correct answer is **Option D (None of the above)**.

**Correct Answer: Option D**`,
    images: [],
    reviewNote: "For b = c (e.g. Trial(5,3,3)), condition c < b fails and it recursively calls Trial(a, c, b) with identical arguments indefinitely. Thus it does not properly implement any option. Matches official key D."
  },
  "go:1502": {
    concept: "Databases - SQL Relational Query Language Principles",
    markdown: `### 1. Conceptual Framework & Evaluation of Statements
1. **Statement A: \"An SQL query automatically eliminates duplicates\"**
   - **Incorrect.** SQL is based on multiset (bag) relational algebra, not pure set relational algebra. A standard SQL \`SELECT\` query preserves all duplicate tuples by default. Duplicate elimination occurs only when the \`DISTINCT\` keyword is explicitly invoked.

2. **Statement B: \"An SQL query will not work if there are no indexes on the relations\"**
   - **Incorrect.** Indexes are purely physical access-path optimizations to speed up retrieval. If no index is defined, the query engine performs a sequential table scan (full relation scan). The query executes and produces identical results regardless of index presence.

3. **Statement C: \"SQL permits attribute names to be repeated in the same relation\"**
   - **Incorrect.** In a relational database table schema, attribute (column) names within the same relation must be unique. Defining duplicate column names in a table definition violates relational integrity and triggers a syntax/DDL error.

### 2. Conclusion
Because statements (A), (B), and (C) are all false, the correct choice is **Option D (None of the above)**.

**Correct Answer: Option D**`,
    images: [],
    reviewNote: "SQL preserves duplicates by default, functions via table scans without indexes, and requires unique column names within a relation. Matches official key D."
  },
  "go:466": {
    concept: "Algorithms - Optimal Merge Patterns and Greedy Record Movements",
    markdown: `### 1. Problem Formulation & Given Parameters
We have five sorted files with the following record counts:
- File $A$: $10$ records
- File $B$: $20$ records
- File $C$: $15$ records
- File $D$: $5$ records
- File $E$: $25$ records

We are required to find the **minimum number of record movements** to merge all five files into a single sorted file using pairwise 2-way merging.

### 2. Governing Principle: Optimal 2-Way Merge Pattern (Huffman Tree)
Merging two sorted files of sizes $x$ and $y$ requires reading and writing all records, incurring:
$$\\text{Cost} = x + y \\text{ record movements}$$
To minimize the total cumulative record movements, we apply the greedy **Optimal Merge Pattern** algorithm (analogous to constructing a Huffman tree), repeatedly merging the two smallest available files.

### 3. Step-by-Step Greedy Trace
Initial sorted file sizes:
$$\\{5, \\ 10, \\ 15, \\ 20, \\ 25\\}$$

1. **Step 1:** Select the two smallest files: $5$ and $10$.
   - Intermediate file size: $5 + 10 = 15$
   - Record movements: $15$
   - Remaining list: $\\{15, \\ 15, \\ 20, \\ 25\\}$

2. **Step 2:** Select the two smallest files: $15$ and $15$.
   - Intermediate file size: $15 + 15 = 30$
   - Record movements: $30$
   - Remaining list: $\\{20, \\ 25, \\ 30\\}$

3. **Step 3:** Select the two smallest files: $20$ and $25$.
   - Intermediate file size: $20 + 25 = 45$
   - Record movements: $45$
   - Remaining list: $\\{30, \\ 45\\}$

4. **Step 4:** Merge the final two files: $30$ and $45$.
   - Intermediate file size: $30 + 45 = 75$
   - Record movements: $75$
   - Remaining list: $\\{75\\}$

### 4. Total Cost Calculation
$$\\text{Total record movements} = 15 + 30 + 45 + 75 = 165$$

Alternatively, by tree depth:
$$\\text{Cost} = (5 + 10) \\times 3 + 15 \\times 3 + (20 + 25) \\times 2 = 15 \\times 3 + 45 + 45 \\times 2 = 45 + 45 + 90 ? \\text{ wait: }$$
Let us check individual leaf depths in the merge tree:
- Leaves $5$ and $10$ participate in Step 1 (15), Step 2 (30), and Step 4 (75) $\\implies$ depth 3: $(5+10) \\times 3 = 45$.
- Leaf $15$ participates in Step 2 (30) and Step 4 (75) $\\implies$ depth 2: $15 \\times 2 = 30$.
- Leaves $20$ and $25$ participate in Step 3 (45) and Step 4 (75) $\\implies$ depth 2: $(20+25) \\times 2 = 90$.
- Sum: $45 + 30 + 90 = 165$. Exactly verifies $165$.

**Correct Answer: Option A (165)**`,
    images: [],
    reviewNote: "Optimal 2-way merge greedy steps: (5+10)=15, (15+15)=30, (20+25)=45, (30+45)=75. Total movements = 15 + 30 + 45 + 75 = 165. Matches official key A."
  },
  "go:1512": {
    concept: "Computer Organization & Architecture - Non-Uniform Pipeline Stage Scheduling",
    markdown: `### 1. Problem Formulation & Table of Cycles
An instruction pipeline consists of $4$ stages:
- **F:** Instruction Fetch
- **D:** Decode
- **E:** Execute
- **W:** Writeback

The cycle requirements for each of the $5$ instructions are:
$$\\begin{array}{|c|c|c|c|c|}
\\hline
\\textbf{Instruction} & \\textbf{F} & \\textbf{D} & \\textbf{E} & \\textbf{W} \\\\
\\hline
\\text{I1} & 1 & 2 & 1 & 1 \\\\
\\text{I2} & 1 & 2 & 2 & 1 \\\\
\\text{I3} & 2 & 1 & 3 & 2 \\\\
\\text{I4} & 1 & 3 & 2 & 1 \\\\
\\text{I5} & 1 & 2 & 1 & 2 \\\\
\\hline
\\end{array}$$

Each stage can process only one instruction at a time, and an instruction must proceed sequentially through stages $F \\to D \\to E \\to W$.

### 2. Stage-by-Stage Cycle Allocation Trace
- **Instruction 1 (I1):**
  - Stage F ($1$ cycle): Cycle $1$ (Done at end of cycle 1)
  - Stage D ($2$ cycles): Cycles $2, 3$ (Done at end of cycle 3)
  - Stage E ($1$ cycle): Cycle $4$ (Done at end of cycle 4)
  - Stage W ($1$ cycle): Cycle $5$ (Done at end of cycle 5)

- **Instruction 2 (I2):**
  - Stage F ($1$ cycle): Cycle $2$ (F is free; done at end of cycle 2)
  - Stage D ($2$ cycles): Must wait for I1 to finish D (cycle 3). Runs during Cycles $4, 5$ (Done at end of cycle 5)
  - Stage E ($2$ cycles): E is free from cycle 5 onward. Runs during Cycles $6, 7$ (Done at end of cycle 7)
  - Stage W ($1$ cycle): W is free from cycle 6 onward. Runs during Cycle $8$ (Done at end of cycle 8)

- **Instruction 3 (I3):**
  - Stage F ($2$ cycles): F is free at cycle 3. Runs during Cycles $3, 4$ (Done at end of cycle 4)
  - Stage D ($1$ cycle): D is busy with I2 until end of cycle 5. Runs during Cycle $6$ (Done at end of cycle 6)
  - Stage E ($3$ cycles): E is busy with I2 until end of cycle 7. Runs during Cycles $8, 9, 10$ (Done at end of cycle 10)
  - Stage W ($2$ cycles): W is free from cycle 9 onward. Runs during Cycles $11, 12$ (Done at end of cycle 12)

- **Instruction 4 (I4):**
  - Stage F ($1$ cycle): F is free at cycle 5. Runs during Cycle $5$ (Done at end of cycle 5)
  - Stage D ($3$ cycles): D is busy with I3 until end of cycle 6. Runs during Cycles $7, 8, 9$ (Done at end of cycle 9)
  - Stage E ($2$ cycles): E is busy with I3 until end of cycle 10. Runs during Cycles $11, 12$ (Done at end of cycle 12)
  - Stage W ($1$ cycle): W is busy with I3 until end of cycle 12. Runs during Cycle $13$ (Done at end of cycle 13)

- **Instruction 5 (I5):**
  - Stage F ($1$ cycle): F is free at cycle 6. Runs during Cycle $6$ (Done at end of cycle 6)
  - Stage D ($2$ cycles): D is busy with I4 until end of cycle 9. Runs during Cycles $10, 11$ (Done at end of cycle 11)
  - Stage E ($1$ cycle): E is busy with I4 until end of cycle 12. Runs during Cycle $13$ (Done at end of cycle 13)
  - Stage W ($2$ cycles): W is busy with I4 until end of cycle 13. Runs during Cycles $14, 15$ (Done at end of cycle 15)

### 3. Space-Time Reservoir Chart
$$\\begin{array}{|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|}
\\hline
\\textbf{Stage / Cycle} & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 10 & 11 & 12 & 13 & 14 & 15 \\\\
\\hline
\\text{Fetch (F)} & \\text{I1} & \\text{I2} & \\text{I3} & \\text{I3} & \\text{I4} & \\text{I5} & - & - & - & - & - & - & - & - & - \\\\
\\text{Decode (D)} & - & \\text{I1} & \\text{I1} & \\text{I2} & \\text{I2} & \\text{I3} & \\text{I4} & \\text{I4} & \\text{I4} & \\text{I5} & \\text{I5} & - & - & - & - \\\\
\\text{Execute (E)} & - & - & - & \\text{I1} & - & \\text{I2} & \\text{I2} & \\text{I3} & \\text{I3} & \\text{I3} & \\text{I4} & \\text{I4} & \\text{I5} & - & - \\\\
\\text{Write (W)} & - & - & - & - & \\text{I1} & - & - & \\text{I2} & - & - & \\text{I3} & \\text{I3} & \\text{I4} & \\text{I5} & \\text{I5} \\\\
\\hline
\\end{array}$$

The last stage (W) of Instruction 5 finishes at **Cycle 15**.

**Correct Answer: 15 clock cycles**`,
    images: [],
    reviewNote: "Tracing stage contention with resource stalls: I1 finishes at 5, I2 at 8, I3 at 12, I4 at 13, and I5 finishes writeback at cycle 15. Matches official key 15."
  },
  "go:1515": {
    concept: "Compiler Design / Runtime Environments - Activation Records and Access Links",
    markdown: `### 1. Conceptual Framework: Runtime Stack Structure
In block-structured languages supporting nested procedure declarations (such as Pascal), activation records (stack frames) maintain two distinct chains of pointer links:
1. **Control Link (Dynamic Link):** Points to the activation record of the **caller procedure** (used to restore the stack frame when the called procedure returns).
2. **Access Link (Static Link):** Points to the activation record of the **lexically enclosing procedure** (the static nesting parent), enabling access to non-local variables declared in outer scopes.

### 2. Lexical Nesting Hierarchy of the Given Program
Analyzing the Pascal program structure from the problem diagram:
- \`sort\` (Lexical Nesting Depth = 1, Global Scope)
  - Declares variables: \`a, x\`
  - Nested Procedures:
    - \`readarray\` (Nesting Depth = 2, Parent = \`sort\`)
    - \`exchange\` (Nesting Depth = 2, Parent = \`sort\`)
    - \`qsort\` (Nesting Depth = 2, Parent = \`sort\`)
      - Declares local variables: \`k, v\`
      - Nested Function:
        - \`partition\` (Nesting Depth = 3, Parent = \`qsort\`)

### 3. Step-by-Step Runtime Stack Snapshots with Access Links
The question traces the execution sequence through 5 successive procedure activations:

1. **Activation 1: \`sort\`**
   - Stack contains: \`[sort]\`
   - Access Link: \`null\` (outermost program scope).

2. **Activation 2: \`qsort(1, 9)\` called from \`sort\`**
   - Stack contains: \`[sort] -> [qsort(1,9)]\`
   - Control Link: Points to \`sort\`.
   - **Access Link:** Points to **\`sort\`** (since \`qsort\` is statically declared inside \`sort\`).

3. **Activation 3: \`qsort(1, 3)\` called recursively from \`qsort(1, 9)\`**
   - Stack contains: \`[sort] -> [qsort(1,9)] -> [qsort(1,3)]\`
   - Control Link: Points to \`qsort(1,9)\`.
   - **Access Link:** Points to **\`sort\`** (static link follows lexical parent \`sort\`, NOT the dynamic caller \`qsort(1,9)\`).

4. **Activation 4: \`partition(1, 3)\` called from \`qsort(1, 3)\`**
   - Stack contains: \`[sort] -> [qsort(1,9)] -> [qsort(1,3)] -> [partition(1,3)]\`
   - Control Link: Points to \`qsort(1,3)\`.
   - **Access Link:** Points to **\`qsort(1,3)\`** (since \`partition\` is statically declared inside \`qsort\`).

5. **Activation 5: \`exchange(1, 3)\` called from \`partition(1, 3)\`**
   - Stack contains: \`[sort] -> [qsort(1,9)] -> [qsort(1,3)] -> [partition(1,3)] -> [exchange(1,3)]\`
   - Control Link: Points to \`partition(1,3)\`.
   - **Access Link:** Points to **\`sort\`** (because \`exchange\` is declared directly inside \`sort\`, its static access link bypasses both \`partition\` and \`qsort\` to point directly to the activation record of \`sort\`).

### 4. Visual Stack Architecture
\`\`\`text
Activation Record Stack:
+-------------------+ <--- exchange(1,3)
| Control Link      | ---> points to partition(1,3)
| Access Link       | ============================> points to sort
+-------------------+
| partition(1,3)    |
| Control Link      | ---> points to qsort(1,3)
| Access Link       | -------------> points to qsort(1,3)
+-------------------+
| qsort(1,3)        |
| Control Link      | ---> points to qsort(1,9)
| Access Link       | ============================> points to sort
+-------------------+
| qsort(1,9)        |
| Control Link      | ---> points to sort
| Access Link       | ============================> points to sort
+-------------------+
| sort              |
| Control Link      | ---> null
| Access Link       | ---> null
+-------------------+
\`\`\`

This illustrates the classical static scope invariant: **an access link always points to the activation record corresponding to its static lexical parent**.`,
    images: [
      "/Gate_QA/question-images/12798877443320618151.webp"
    ],
    reviewNote: "Step-by-step runtime stack trace showing dynamic control links and static access links based on Pascal lexical nesting hierarchy."
  },
  "go:1517": {
    concept: "Microprocessors / Hardware Design - 8085 Memory System Interfacing",
    markdown: `### 1. Problem Formulation & Specifications
We are required to design a $2\\text{K} \\times 8$ ($2048$ bytes) memory system for an $8085$ microprocessor:
- Target Address Range: $(1000)_{16}$ to $(17FF)_{16}$
- Available Chips: Four $1\\text{K} \\times 4$ memory chips
- Chip Pinout:
  - $\\overline{CS}$: Chip Select (active low; $0$ to enable)
  - $\\overline{RD}$: Read enable (active low)
  - $\\overline{WR}$: Write enable (active low)
  - $A_0 \\dots A_9$: $10$ address inputs ($2^{10} = 1024 = 1\\text{K}$ locations)
  - $D_0 \\dots D_3$: $4$ bidirectional data lines

### 2. Memory Organization & Banking
1. **Capacity Analysis:**
   - Total required capacity: $2048 \\times 8 = 16,384$ bits.
   - Capacity of each chip: $1024 \\times 4 = 4,096$ bits.
   - Number of chips needed: $\\frac{16,384}{4,096} = 4$ chips (exactly matches the four available chips).

2. **Data Width Expansion (Pairing):**
   - The $8085$ has an $8$-bit data bus ($D_0 \\dots D_7$).
   - Each chip provides only $4$ data lines.
   - We form a $1\\text{K} \\times 8$ memory bank by connecting two $1\\text{K} \\times 4$ chips in parallel:
     - Chip 1 (Low Nibble): $D_0 \\dots D_3$ connected to $8085 \\ D_0 \\dots D_3$.
     - Chip 2 (High Nibble): $D_0 \\dots D_3$ connected to $8085 \\ D_4 \\dots D_7$.

3. **Memory Depth Expansion (Banks):**
   - Two such pairs form two consecutive $1\\text{K}$ banks:
     - **Bank 0 ($1000_{16} - 13FF_{16}$):** Chips 1 and 2 ($1\\text{K} \\times 8$)
     - **Bank 1 ($1400_{16} - 17FF_{16}$):** Chips 3 and 4 ($1\\text{K} \\times 8$)

### 3. Address Decoding Scheme
Examine the binary representation of the address range $(1000)_{16}$ to $(17FF)_{16}$:
$$\\begin{array}{r|cccc|cccc|cccc|cccc}
\\text{Hex} & A_{15} & A_{14} & A_{13} & A_{12} & A_{11} & A_{10} & A_9 & A_8 & A_7 & A_6 & A_5 & A_4 & A_3 & A_2 & A_1 & A_0 \\\\
\\hline
1000_{16} & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
13FF_{16} & 0 & 0 & 0 & 1 & 0 & 0 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 \\\\
\\hline
1400_{16} & 0 & 0 & 0 & 1 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
17FF_{16} & 0 & 0 & 0 & 1 & 0 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 \\\\
\\end{array}$$

- **Chip Internal Addressing ($A_0 - A_9$):**
  Lines $A_0 \\dots A_9$ from the $8085$ bus connect in parallel to address inputs $A_0 \\dots A_9$ on all four chips.
- **Bank Selection ($A_{10}$):**
  - For Bank 0 ($1000 - 13FF$): $A_{10} = 0$.
  - For Bank 1 ($1400 - 17FF$): $A_{10} = 1$.
- **Base Range Decoding ($A_{15} - A_{11}$):**
  Across the entire $2\\text{K}$ range, lines $A_{15} A_{14} A_{13} A_{12} A_{11} = 00010_2$.
  We generate a Base Enable signal:
  $$\\text{Enable} = \\overline{A_{15}} \\cdot \\overline{A_{14}} \\cdot \\overline{A_{13}} \\cdot A_{12} \\cdot \\overline{A_{11}}$$

Using a $3$-to-$8$ line decoder (e.g., $74\\text{LS}138$):
- Connect $A_{15}, A_{14}, A_{13}$ to active-low enable inputs $\\overline{G_{2A}}, \\overline{G_{2B}}$, and $A_{12}$ to active-high enable $G_1$.
- Connect $A_{11}$ and $A_{10}$ to select inputs $B, A$.
- Output $Y_0$ goes low when $A_{11}=0, A_{10}=0$ (enables $\\overline{CS}$ of Bank 0: Chips 1 & 2).
- Output $Y_1$ goes low when $A_{11}=0, A_{10}=1$ (enables $\\overline{CS}$ of Bank 1: Chips 3 & 4).

### 4. Control Signals
- Connect $8085 \\ \\overline{\\text{RD}}$ directly to $\\overline{\\text{RD}}$ of all four memory chips.
- Connect $8085 \\ \\overline{\\text{WR}}$ directly to $\\overline{\\text{WR}}$ of all four memory chips.
- (Or connect $\\overline{\\text{MEMR}}$ and $\\overline{\\text{MEMW}}$ for memory-mapped I/O isolation).`,
    images: [],
    reviewNote: "Complete memory interfacing design: 4 chips paired into two 1K x 8 banks, address decoding via 74LS138 for 1000H-17FFH, and full bus connections."
  },
  "go:1640": {
    concept: "Engineering Mathematics - Numerical Methods and the Bisection Method",
    markdown: `### 1. Conceptual Framework & Theoretical Foundation
The **Bisection Method** is a bracketing numerical method for finding real roots of a continuous function $f(x) = 0$.
It is grounded in the **Intermediate Value Theorem (Bolzano's Theorem)**:
> If a real-valued function $f(x)$ is continuous on the closed interval $[a, b]$, and $f(a) \\cdot f(b) < 0$ (the function values at the endpoints have opposite signs), then there exists at least one value $c \\in (a, b)$ such that $f(c) = 0$.

### 2. Analysis of the Statements
- **Statement A: \"converges within a few iterations\"**
  - **Incorrect.** The bisection method converges linearly with a convergence rate of $1/2$ per iteration ($e_{n+1} = 0.5 e_n$). Reducing error by a factor of $10^{-6}$ requires approximately $20$ iterations, which is relatively slow compared to higher-order methods.

- **Statement B: \"guaranteed to work for all continuous functions\"**
  - **Correct.** Provided the initial interval $[a, b]$ brackets a root ($f(a) \\cdot f(b) < 0$) and $f(x)$ is continuous on $[a, b]$, the bisection method is mathematically **guaranteed to converge** to a root.

- **Statement C: \"is faster than the Newton-Raphson method\"**
  - **Incorrect.** Newton-Raphson exhibits **quadratic convergence** ($e_{n+1} \\approx C e_n^2$, doubling the number of correct decimal digits each iteration), whereas bisection exhibits only linear convergence.

- **Statement D: \"requires that there be no error in determining the sign of the function\"**
  - **Incorrect.** While sign determination is used to select sub-intervals, small floating-point errors away from the root do not invalidate the algorithm; the defining theoretical property is guaranteed convergence under continuity.

**Correct Answer: Option B**`,
    images: [],
    reviewNote: "The bisection method is guaranteed to converge for all continuous functions on a bracketing interval by the Intermediate Value Theorem. Matches official key B."
  },
  "go:1646": {
    concept: "Theory of Computation - Regular Expression Equivalence and Algebraic Identities",
    markdown: `### 1. Problem Formulation & Scope
We are given two regular expressions defining languages over the alphabet $\\Sigma = \\{0, 1\\}$:
- $A = (01 + 1)^*$
- $B = \\left((01)^* 1^*\\right)^*$

We must determine the relationship between $A$ and $B$ (whether $A \\subset B$, $B \\subset A$, incomparable, or $A = B$).

### 2. Algebraic Regular Expression Identities
Recall the fundamental Kleene star expansion theorem for any regular expressions $R$ and $S$:
$$\\left(R^* S^*\\right)^* = (R + S)^*$$

*Proof of Identity:*
- **Part 1 ($(R+S)^* \\subseteq (R^* S^*)^*$):** Any string in $(R + S)^*$ is a finite sequence of blocks where each block is either an $R$ or an $S$. In $(R^* S^*)^*$, each factor can generate arbitrary sequences of $R$'s followed by arbitrary sequences of $S$'s. Since a single $R$ can be written as $R^1 S^0$ and a single $S$ can be written as $R^0 S^1$, any sequence of $R$'s and $S$'s can be formed by $(R^* S^*)^*$.
- **Part 2 ($(R^* S^*)^* \\subseteq (R+S)^*)$:** Every string generated by $(R^* S^*)^*$ consists of concatenated strings from $R$ and $S$. Since $(R+S)^*$ generates all possible concatenations of strings from $R$ and $S$, every string in $(R^* S^*)^*$ is in $(R+S)^*$.
- Therefore, $(R^* S^*)^* = (R + S)^*$.

### 3. Application to Given Sets
Let:
$$R = 01 \\quad \\text{and} \\quad S = 1$$
Substituting into the identity:
$$B = \\left((01)^* 1^*\\right)^* = (01 + 1)^* = A$$

Therefore:
$$A = B$$

### 4. Language Characterization
Both $A$ and $B$ generate the exact language of all strings over $\\{0, 1\\}$ such that every \`0\` is immediately followed by a \`1\` (i.e., strings containing no substring \`00\` and not ending in \`0\`).

**Correct Answer: Option D ($A = B$)**`,
    images: [],
    reviewNote: "By the fundamental regular expression algebraic identity (R* S*)* = (R + S)*, ((01)* 1*)* = (01 + 1)*, proving A = B. Matches official key D."
  },
  "go:1647": {
    concept: "Theory of Computation - Languages Recognizable by Deterministic Finite Automata (DFA)",
    markdown: `### 1. Conceptual Framework & Regularity Criterion
A language $L$ can be recognized by a **Deterministic Finite state Automaton (DFA)** if and only if $L$ is a **Regular Language**.
A language requiring unbounded memory to count or match symbols is non-regular by the Pumping Lemma.

### 2. Analysis of the Candidate Sets
1. **Set A: The numbers $1, 2, 4, 8, \\dots, 2^n, \\dots$ written in binary**
   - The powers of $2$ written in standard binary notation are:
     $$2^0 = 1_2, \\quad 2^1 = 10_2, \\quad 2^2 = 100_2, \\quad 2^3 = 1000_2, \\quad \\dots, \\quad 2^n = 100\\dots 0_2$$
   - This set of strings corresponds precisely to the regular expression:
     $$L = 10^*$$
   - A DFA with $2$ states easily recognizes $10^*$:
     - State $q_0$ (start): on input \`1\`, transition to accepting state $q_1$; on input \`0\`, transition to dead state $q_d$.
     - State $q_1$ (accepting): on input \`0\`, self-loop to $q_1$; on input \`1\`, transition to $q_d$.
   - Because $10^*$ is regular, it is **recognizable by a DFA**.

2. **Set B: The numbers $1, 2, 4, 8, \\dots, 2^n, \\dots$ written in unary**
   - In unary, $L = \\{1^{2^n} \\mid n \\ge 0\\}$.
   - The gap between successive string lengths is $2^{n+1} - 2^n = 2^n$, which grows unboundedly. By the Pumping Lemma, $L$ is **not regular**.

3. **Set C: Binary strings with an equal number of zeros and ones**
   - $L = \\{w \\in \\{0, 1\\}^* \\mid N_0(w) = N_1(w)\\}$.
   - Requires an unbounded counter to track the difference $N_0(w) - N_1(w)$. It is a deterministic context-free language (DCFL), **not regular**.

4. **Set D: The set $\\{1, 101, 11011, 1110111, \\dots\\}$**
   - Corresponds to $L = \\{1^n 0 1^n \\mid n \\ge 0\\}$.
   - Requires matching the count of \`1\`s before and after \`0\`. By the Pumping Lemma, $L$ is **not regular**.

**Correct Answer: Option A**`,
    images: [],
    reviewNote: "Powers of 2 in binary is the regular language 10*, which is recognized by a 2-state DFA. All other options require unbounded memory. Matches official key A."
  },
  "go:1648": {
    concept: "Theory of Computation - Computational Power of Deterministic vs Non-Deterministic Automata",
    markdown: `### 1. Conceptual Framework & Automata Equivalence
In formal language theory, adding non-determinism increases computational recognition power for some machine models, but not for others.

### 2. Evaluation of Statements
- **Statement A: \"The non-deterministic finite-state automata are equivalent to deterministic finite-state automata.\"**
  - **True.** By the Subset Construction (Rabin-Scott theorem), every $N$-state NFA can be converted into an equivalent DFA with at most $2^N$ states. Both recognize precisely the class of **Regular Languages**.

- **Statement B: \"Non-deterministic Push-down automata are equivalent to deterministic Push-down automata.\"**
  - **FALSE.** A Non-deterministic Pushdown Automaton (NPDA) recognizes the entire class of **Context-Free Languages (CFLs)**. A Deterministic Pushdown Automaton (DPDA) recognizes strictly the subclass of **Deterministic Context-Free Languages (DCFLs)**.
  - Because $\\text{DCFL} \\subsetneq \\text{CFL}$, DPDAs are strictly less powerful than NPDAs.
  - *Counterexample:* The language of even-length palindromes $L = \\{w w^R \\mid w \\in \\{0, 1\\}^*\\}$ is a CFL recognizable by an NPDA (guessing the midpoint), but cannot be recognized by any DPDA.

- **Statement C: \"Non-deterministic Turing machines are equivalent to deterministic Turing machines.\"**
  - **True.** A Deterministic Turing Machine (DTM) can simulate a Non-deterministic Turing Machine (NDTM) by performing a breadth-first search of the non-deterministic computation tree. Both recognize the exact class of **Turing-recognizable (Recursively Enumerable) languages**.

- **Statement D: \"Multi-tape Turing machines are equivalent to Single-tape Turing machines.\"**
  - **True.** A standard single-tape Turing machine can simulate any $k$-tape Turing machine by interleaving the contents of the $k$ tapes with track markers, with a quadratic time overhead ($T(n) \\to O(T(n)^2)$).

### 3. Conclusion
The statement that is false is **Option B**.

**Correct Answer: Option B**`,
    images: [],
    reviewNote: "NPDAs recognize all CFLs while DPDAs recognize only DCFLs (DCFL is a strict proper subset of CFL). Hence NPDAs and DPDAs are not equivalent. Matches official key B."
  },
  "go:1649": {
    concept: "Theory of Computation - String Membership in Regular Expressions",
    markdown: `### 1. Problem Formulation & Scope
We are given the target string:
$$w = 1101$$
We need to determine which regular expression(s) **cannot** generate $w$ (i.e., $w$ does not belong to the set).

### 2. Testing String Membership for Each Regular Expression
1. **Expression A: $110^*(0 + 1)$**
   - Decomposing $w = 1101$:
     - Prefix: \`11\` (matches $11$)
     - Middle: \`0\` (matches $0^*$ for exponent $1$)
     - Suffix: \`1\` (matches $(0 + 1)$)
   - Since $11 \\cdot 0^1 \\cdot 1 = 1101$, $1101$ **belongs** to set A.

2. **Expression B: $1(0 + 1)^* 101$**
   - Decomposing $w = 1101$:
     - Prefix: \`1\` (matches leading $1$)
     - Middle: $\\varepsilon$ (matches $(0 + 1)^*$ with zero iterations)
     - Suffix: \`101\` (matches trailing $101$)
   - Since $1 \\cdot \\varepsilon \\cdot 101 = 1101$, $1101$ **belongs** to set B.

3. **Expression C: $(10)^* (01)^* (00 + 11)^*$**
   - Any string generated by C consists of three sequential phases:
     - Phase 1: Zero or more repetitions of \`10\`
     - Phase 2: Zero or more repetitions of \`01\`
     - Phase 3: Zero or more repetitions of \`00\` or \`11\`
   - To match $w = 1101$:
     - $w$ cannot start with \`10\`, so Phase 1 must be $\\varepsilon$.
     - $w$ cannot start with \`01\`, so Phase 2 must be $\\varepsilon$.
     - This leaves the entire string $1101$ to be generated by $(00 + 11)^*$.
     - However, $(00 + 11)^*$ can only generate strings of even length consisting of pairs \`00\` and \`11\`. The string $1101$ has \`01\` as its last two characters, which cannot be generated.
   - Therefore, $1101$ **does not belong** to set C.

4. **Expression D: $(00 + (11)^* 0)^*$**
   - Look at the atomic building blocks of D:
     - Block 1: \`00\` (ends in \`0\`)
     - Block 2: $(11)^* 0$ (ends in \`0\`)
   - Every non-empty component in this expression **strictly ends with the character \`0\`**.
   - Consequently, every non-empty string generated by $(00 + (11)^* 0)^*$ must end in \`0\`.
   - Since $w = 1101$ ends in \`1\`, it is impossible to generate.
   - Therefore, $1101$ **does not belong** to set D.

### 3. Conclusion
The string $1101$ does not belong to sets **C** and **D**.

**Correct Answer: Options C and D**`,
    images: [],
    reviewNote: "1101 is generated by A (11.0.1) and B (1.eps.101). It cannot be generated by C (ends in 01 which (00+11)* cannot produce) or D (every non-empty string in D ends in 0). Matches official key [C, D]."
  },
  "go:1650": {
    concept: "Digital Logic - Boolean XOR Properties and Parity Invariants",
    markdown: `### 1. Problem Formulation & Governing Identities
We are given an expression where a bit-string $B$ is XORed with itself $n$ times:
$$E_n = \\underbrace{B \\oplus B \\oplus B \\oplus \\dots \\oplus B}_{n \\text{ XOR operations on } n+1 \\text{ operands}}$$
*Note on terminology:* \"XORed with itself $n$ times\" denotes applying $n$ XOR operations:
- $n = 1$: $B \\oplus B$
- $n = 2$: $B \\oplus B \\oplus B$
- $n = 3$: $B \\oplus B \\oplus B \\oplus B$

### 2. Fundamental Properties of XOR ($\\oplus$)
1. **Nilpotence / Self-Inverse:**
   $$X \\oplus X = 0$$
2. **Identity Element:**
   $$X \\oplus 0 = X$$
3. **Associativity and Commutativity:**
   The grouping order does not affect the outcome.

### 3. Induction on the Number of XOR Operations $n$
- **For $n = 1$:**
  $$E_1 = B \\oplus B = 0$$
- **For $n = 2$:**
  $$E_2 = (B \\oplus B) \\oplus B = 0 \\oplus B = B \\quad (\\text{remains unchanged})$$
- **For $n = 3$:**
  $$E_3 = E_2 \\oplus B = B \\oplus B = 0$$
- **For $n = 4$:**
  $$E_4 = E_3 \\oplus B = 0 \\oplus B = B \\quad (\\text{remains unchanged})$$

In general, for any positive integer $k$:
- When $n = 2k$ (even number of operations):
  $$E_{2k} = B$$
  The bit-string **remains unchanged**.
- When $n = 2k - 1$ (odd number of operations):
  $$E_{2k-1} = 0$$

### 4. Distractor Analysis
- **Option A:** Fails; for even $n$, the result is $B$, not $\\bar{B}$.
- **Option B:** Fails; for odd $n$, the result is $0$, not $\\bar{B}$.
- **Option C:** Nonsensical arithmetic distractor.
- **Option D:** Correct; for any even $n$, an odd number of $B$'s are XORed together ($2k+1$ operands), leaving $B$ unchanged.

**Correct Answer: Option D**`,
    images: [],
    reviewNote: "XORing B with itself n times: for n even, an odd number of B's are combined yielding B (remains unchanged); for n odd, pairs cancel to 0. Matches official key D."
  },
  "go:1651": {
    concept: "Digital Logic - Multiplexer Sizing and Select Line Relationships",
    markdown: `### 1. Problem Formulation & Governing Formula
A multiplexer (data selector) routes one of $N$ input data lines to a single output line based on the binary combination applied to $k$ select inputs.

The governing relationship between the number of select lines $k$ and the number of data input lines $N$ is:
$$N = 2^k$$

### 2. Calculation for $k = 4$
Given:
- Number of select input bits: $k = 4$

Substituting into the formula:
$$N = 2^4 = 16 \\text{ input data lines}$$

Therefore, a multiplexer with a $4$-bit data select input is a **$16$-to-$1$ ($16:1$) multiplexer**.

### 3. Distractor Analysis
- **Option A ($4:1$ multiplexer):** Requires $\\log_2 4 = 2$ select bits.
- **Option B ($2:1$ multiplexer):** Requires $\\log_2 2 = 1$ select bit.
- **Option C ($16:1$ multiplexer):** Correct; $2^4 = 16$ data inputs.
- **Option D ($8:1$ multiplexer):** Requires $\\log_2 8 = 3$ select bits.

**Correct Answer: Option C**`,
    images: [],
    reviewNote: "A multiplexer with k select lines has 2^k input lines. For k = 4, 2^4 = 16, giving a 16:1 multiplexer. Matches official key C."
  },
  "go:1652": {
    concept: "Digital Logic - TTL Logic Level Voltage Thresholds",
    markdown: `### 1. Conceptual Framework: TTL Voltage Levels
In standard Transistor-Transistor Logic (TTL) integrated circuits operating with a supply voltage $V_{CC} = +5.0\\text{ V} \\pm 5\\%$:
- **Output High Voltage ($V_{OH(\\min)}$):** The minimum voltage guaranteed at the output of a gate representing logic $1$. Under standard manufacturer specifications, $V_{OH(\\min)} = 2.4\\text{ V}$ to $2.7\\text{ V}$ (typically $\\approx 2.8\\text{ V}$ to $3.4\\text{ V}$ unloaded).
- **Input High Voltage ($V_{IH(\\min)}$):** The minimum voltage guaranteed to be recognized as logic $1$ by a receiving gate, specified as $V_{IH(\\min)} = 2.0\\text{ V}$.
- **High-Level Noise Margin:** $V_{OH(\\min)} - V_{IH(\\min)} = 2.4\\text{ V} - 2.0\\text{ V} = 0.4\\text{ V}$.

### 2. Evaluation of the Given Threshold Specification
- For logic $1$ output state, the output is pulled up toward $V_{CC}$ through a pull-up resistor and totem-pole transistor circuit, falling just below $V_{CC}$ (accounting for a diode drop and $V_{CE(\\text{sat})}$).
- In standard examination specifications for the TTL family, the valid logic $1$ band is defined as **any voltage below $V_{cc}$ but above $2.8\\text{ V}$** (reflecting nominal operating high voltage margins).

### 3. Distractor Analysis
- **Option A:** Omits the upper limit $V_{CC}$.
- **Option B ($0.8\\text{ V}$ to $5.0\\text{ V}$):** Includes the indeterminate / undefined region between $0.8\\text{ V}$ ($V_{IL(\\max)}$) and $2.0\\text{ V}$ ($V_{IH(\\min)}$).
- **Option C:** Includes low voltages (even $0\\text{ V}$).
- **Option D:** Correct; accurately bounds the logic 1 region below $V_{CC}$ with sufficient margin.

**Correct Answer: Option D**`,
    images: [],
    reviewNote: "TTL logic 1 level resides in the upper band below V_cc and above nominal high threshold (Option D). Matches official key D."
  },
  "go:1653": {
    concept: "Computer Networks / Serial Communication - Baud Rate and Character Framing",
    markdown: `### 1. Problem Formulation & Given Parameters
We are given an asynchronous serial communication channel with:
- Data bits per character: $8$
- Parity bits: $1$
- Stop bits: $2$
- Target transfer rate: $300$ characters per second (cps)

We need to find the minimum standard baud rate required to sustain this transfer rate.

### 2. Asynchronous Frame Sizing
In standard asynchronous serial transmission (UART), every transmitted character frame strictly requires:
- **$1$ Start bit** (mandatory framing bit to synchronize receiver clock)
- **$8$ Data bits**
- **$1$ Parity bit**
- **$2$ Stop bits**

Total bits per character:
$$\\text{Bits per character} = 1 \\text{ (start)} + 8 \\text{ (data)} + 1 \\text{ (parity)} + 2 \\text{ (stop)} = 12 \\text{ bits/character}$$

### 3. Required Bit Rate Calculation
To transmit $300$ characters per second:
$$\\text{Required transmission rate} = 300 \\text{ characters/s} \\times 12 \\text{ bits/character} = 3600 \\text{ bps}$$

In binary serial communication, each symbol corresponds to $1$ bit ($1\\text{ baud} = 1\\text{ bps}$).
Hence, the minimum rate required to sustain $3600\\text{ bps}$ without buffer overrun is:
$$\\text{Baud rate} \\ge 3600 \\text{ baud}$$

### 4. Selection from Standard Industry Baud Rates
Standard serial communication speeds are $1200, 2400, 4800, 9600, 19200$ baud:
- $1200$ baud: $1200 < 3600$ (insufficient)
- $2400$ baud: $2400 < 3600$ (insufficient)
- **$4800$ baud:** $4800 \\ge 3600$ (minimum sufficient standard baud rate)

Therefore, the minimum standard baud rate to sustain $300$ cps is **$4800$ baud**.

**Correct Answer: Option C (4800 baud)**`,
    images: [],
    reviewNote: "Frame size = 1 start + 8 data + 1 parity + 2 stop = 12 bits/char. 300 chars/s requires 300*12 = 3600 bps. Minimum standard baud rate to sustain 3600 is 4800 baud. Matches official key C."
  },
  "go:1654": {
    concept: "Digital Logic / Microprocessors - Octal to Two's Complement Decimal Conversion",
    markdown: `### 1. Problem Formulation & Given Parameters
We are given an octal number:
$$N = (342)_8$$
We are asked for its decimal equivalent when treated as an **$8$-bit signed integer** in an $8085$-based computer.

### 2. Binary Conversion
Convert each octal digit to its $3$-bit binary equivalent:
- $3_8 = 011_2$
- $4_8 = 100_2$
- $2_8 = 010_2$

Concatenating gives the $9$-bit representation:
$$(342)_8 = 011100010_2$$

Because the $8085$ is an $8$-bit microprocessor, taking the low-order $8$ bits:
$$B = 11100010_2$$

### 3. Signed Decimal Evaluation ($2$'s Complement)
In $8085$ signed integer arithmetic, integers are represented in $8$-bit two's complement format:
- The Most Significant Bit (MSB, bit $7$) is $1$, indicating a **negative integer**.
- To determine the magnitude, compute the two's complement:
  1. Invert all bits:
     $$\\sim (11100010_2) = 00011101_2$$
  2. Add $1$:
     $$00011101_2 + 1 = 00011110_2$$
  3. Convert binary magnitude to decimal:
     $$00011110_2 = 16 + 8 + 4 + 2 = 30_{10}$$

Attaching the negative sign:
$$\\text{Decimal value} = -30$$

Alternatively, using positional weights:
$$\\text{Value} = -1\\cdot 2^7 + 1\\cdot 2^6 + 1\\cdot 2^5 + 0\\cdot 2^4 + 0\\cdot 2^3 + 0\\cdot 2^2 + 1\\cdot 2^1 + 0\\cdot 2^0$$
$$= -128 + 64 + 32 + 2 = -128 + 98 = -30$$

**Correct Answer: Option D (-30)**`,
    images: [],
    reviewNote: "Octal 342 in 8 bits is 11100010. In 2's complement, value is -128 + 64 + 32 + 2 = -30. Matches official key D."
  },
  "go:1655": {
    concept: "Operating Systems / Computer Architecture - Interrupt Priority Assignment",
    markdown: `### 1. Conceptual Principle: Priority Assignment in Interrupt-Driven I/O
In computer architecture and operating system design, interrupt priority is assigned based on:
1. **Data Transfer Rate & Speed:** Faster peripheral devices transfer data at high rates and must be serviced quickly before internal FIFO buffers overflow.
2. **Criticality of Data Loss:** If a fast-moving physical medium (such as a spinning magnetic disk) is not serviced promptly, the read/write window passes, resulting in data loss, rotational latency penalties, or overrun errors.
3. **Latency Tolerance:** Slow human-interactive devices (such as keyboards) tolerate hundreds of milliseconds of delay without noticeable degradation.

### 2. Device Comparison
- **Hard Disk:** High-speed storage medium transferring megabytes per second. A sector read/write cannot pause; failure to service immediately results in data loss or disk transfer abortion. **Requires highest priority.**
- **Floppy Disk:** Moderate speed, transferring at tens of kilobytes per second (much slower than hard disk).
- **Printer:** Slow electromechanical output device operating at characters per second.
- **Keyboard:** Extremely low data rate (typically $\\le 10\\text{ bytes/s}$), highly latency tolerant.

### 3. Conclusion
The **hard disk** must receive the highest priority among the given devices.

**Correct Answer: Option A (Hard disk)**`,
    images: [],
    reviewNote: "Hard disk has the highest data transfer rate and tightest latency constraints to prevent buffer overrun, requiring highest interrupt priority. Matches official key A."
  },
  "go:1656": {
    concept: "Computer Organization & Architecture - Position-Independent Code and PC-Relative Addressing",
    markdown: `### 1. Conceptual Framework: Code Relocation
Code relocation is the ability to load and execute a compiled program module at any arbitrary base address in physical memory.
A program is **position-independent code (PIC)** if it can be loaded at different memory locations without requiring the loader to patch or recalculate any instruction addresses.

### 2. Analysis of Addressing Modes
- **PC-Relative Addressing:**
  - In PC-relative addressing, the effective target address is computed relative to the current value of the Program Counter ($PC$):
    $$\\text{Effective Address} = PC + \\text{Offset}$$
  - When the entire code block is relocated to a different memory region, both the instruction location ($PC$) and the target destination shift by the exact same distance.
  - Consequently, the displacement / offset remains completely invariant:
    $$\\text{Offset} = \\text{Target} - PC = \\text{constant}$$
  - Thus, branch and jump instructions execute correctly without any modification whatsoever to the machine code.

- **Other Addressing Modes:**
  - **Indirect Addressing / Indexed Addressing:** Still require absolute base addresses or tables that must be initialized to physical addresses.
  - **Base Register Addressing:** Relocation requires updating the base register value at program start, whereas PC-relative addressing requires *zero change whatsoever* in either code or registers.

**Correct Answer: Option D (PC relative addressing)**`,
    images: [],
    reviewNote: "PC-relative addressing uses offsets relative to the PC, making branch displacements invariant under code relocation and enabling position-independent code (PIC). Matches official key D."
  },
  "go:1657": {
    concept: "Microprocessors / Operating Systems - Interrupt Handling and Processor Flags",
    markdown: `### 1. Conceptual Framework & Evaluation of Statements
1. **Statement A: \"Unless enabled, a CPU will not be able to process interrupts.\"**
   - **True.** General maskable hardware interrupts are gated by an internal interrupt-enable flip-flop (e.g., the Interrupt Flag \`IF\` in x86, or the \`IE\` flag in $8085$).
   - Upon system reset, maskable interrupts are disabled by default. Unless explicitly enabled via instructions such as \`EI\` (Enable Interrupts) in $8085$ or \`STI\` in x86, the CPU ignores all maskable interrupt requests.

2. **Statement B: \"Loop instructions cannot be interrupted till they complete.\"**
   - **False.** Repeated or loop instructions (such as string primitives or loop counters) check for pending interrupts at each iteration cycle boundary and can be interrupted mid-loop.

3. **Statement C: \"A processor checks for interrupts before executing a new instruction.\"**
   - **False.** A microprocessor samples and checks the interrupt lines at the **end of the execution phase** of the current instruction cycle (during the final T-state / machine cycle), not before.

4. **Statement D: \"Only level triggered interrupts are possible on microprocessors.\"**
   - **False.** Microprocessors support both level-triggered (e.g., $8085$ \`INTR\`, \`RST 5.5\`) and edge-triggered interrupts (e.g., $8085$ \`RST 7.5\`, and \`TRAP\` which is edge-and-level sensitive).

### 2. Conclusion
The only true statement is **Option A**.

**Correct Answer: Option A**`,
    images: [],
    reviewNote: "A CPU requires its interrupt enable flag to be set (e.g. via EI instruction) to service maskable interrupts. Interrupts are sampled at the end of instruction cycles. Matches official key A."
  }
};

const outputPath = path.join(ROOT, 'data/solutions/chunks/cse/chunk-cse-vin-04-solutions.json');
fs.writeFileSync(outputPath, JSON.stringify(VIN_04_SOLUTIONS, null, 2), 'utf-8');
console.log(`✅ Successfully generated ${outputPath} with ${Object.keys(VIN_04_SOLUTIONS).length} solutions!`);
