import fs from "fs";
import path from "path";
import { applyAuthenticPatches } from "./patch-authentic-solutions.mjs";

export const CHUNK_CSE_VIN_11_SOLUTIONS = {
  "go:2627": {
    concept: "Numerical Methods - Newton-Raphson Method for Square Root",
    markdown: `### 1. Mathematical Formulation
We are required to derive the iteration formula for calculating the square root of a positive real number $b$ ($x = \\sqrt{b}$) using the **Newton-Raphson method**.

Squaring both sides gives the root-finding equation:
$$f(x) = x^2 - b = 0$$

The first derivative with respect to $x$ is:
$$f'(x) = \\frac{d}{dx}(x^2 - b) = 2x$$

---

### 2. Analytical Derivation of Newton-Raphson Iteration
The general iterative formula for the Newton-Raphson method is:
$$x_{k+1} = x_k - \\frac{f(x_k)}{f'(x_k)}$$

Substituting $f(x_k) = x_k^2 - b$ and $f'(x_k) = 2x_k$:
$$x_{k+1} = x_k - \\frac{x_k^2 - b}{2x_k}$$

Combining the terms over a common denominator:
$$x_{k+1} = \\frac{2x_k^2 - (x_k^2 - b)}{2x_k} = \\frac{x_k^2 + b}{2x_k}$$

Alternatively, this can be written as the classical Babylonian (Heron's) formula:
$$x_{k+1} = \\frac{1}{2} \\left( x_k + \\frac{b}{x_k} \\right)$$

---

### 3. Option & Distractor Analysis
- **Option A ($x_{k+1} = 3(x_k+b)/2x_k$):** Incorrect algebraic formulation.
- **Option B ($x_{k+1} = (x_k^2+b)/2x_k$):** Exactly matches the derived Newton-Raphson recurrence relation.
- **Option C ($x_{k+1} = x_k - 2x_k/(x_k^2+b)$):** Inverts the quotient $f(x_k)/f'(x_k)$.
- **Option D (None of the above):** Incorrect since Option B is valid.

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($x_{k+1} = (x_k^2+b)/2x_k$)**.`,
    images: []
  },

  "go:2628": {
    concept: "Operating Systems - Virtual Memory Address Space vs Physical Memory and Secondary Storage",
    markdown: `### 1. Architectural Foundations of Virtual Memory
In a modern computer system with **virtual memory**:
1. **Virtual Address Space:**
   The set of all virtual addresses that the CPU can generate during program execution, determined directly by the width of the CPU address bus / architecture register size:
   $$\\text{Virtual Address Space} = 2^{k} \\text{ bytes (for a } k\\text{-bit architecture)}$$
2. **Physical Memory (RAM):**
   The actual hardware semiconductor storage installed in the system. Because RAM is expensive, its capacity is significantly smaller than the full virtual address space.
3. **Secondary Storage (Backing Store / Swap Space):**
   Magnetic or flash storage (e.g., HDD or SSD) used to hold inactive pages, swap partitions, file systems, and user data. Because disk storage is cheap and plentiful, secondary storage capacity is vastly larger than physical RAM and must accommodate the active and swapped address spaces of multiple running processes.

---

### 2. Relative Size Inequalities
- **Virtual Address Space vs. Physical Memory:**
  The fundamental justification for virtual memory is to decouple program size from physical RAM constraints, allowing programs to run even when their memory requirements exceed physical RAM. Hence, the address space specified by the CPU must be **larger** than the physical memory size.
- **Virtual Address Space vs. Secondary Storage:**
  All virtual pages of active processes that are not currently resident in physical RAM must be backed by disk swap/paging space. Therefore, the secondary storage capacity must easily accommodate the virtual pages, meaning the address space of a process/CPU is **smaller** than the secondary storage size.

$$\\text{Physical Memory Size} < \\text{CPU Virtual Address Space} < \\text{Secondary Storage Size}$$

Filling in the blanks:
- *"larger than the physical memory size"*
- *"smaller than the secondary storage size"*

---

### 3. Conclusion
Therefore, the correct answer is **Option C (larger, smaller)**.`,
    images: []
  },

  "go:2632": {
    concept: "Theory of Computation - Context-Free Grammars for $\{x^n y^n \mid n \ge 1\}$",
    markdown: `### 1. Target Language Specification
We are given the language:
$$L = \\{x^n y^n \\mid n \\ge 1\\} = \\{xy, xxyy, xxxyyy, \\dots\\}$$
This is the classic deterministic context-free language requiring an equal non-zero number of $x$'s followed by $y$'s. It is non-regular due to the unbounded counting required.

---

### 2. Evaluation of Candidate Definitions
- **Definition I: $E \\rightarrow xEy \\mid xy$**
  - Base case: $E \\implies xy$ (generates $x^1 y^1$, for $n=1$).
  - Recursive step: $E \\implies xEy \\implies x(xEy)y = x^2 E y^2 \\implies \\dots \\implies x^{n-1} (xy) y^{n-1} = x^n y^n$.
  - In every derivation step, exactly one $x$ is prepended and one $y$ is appended synchronously.
  - Hence, the grammar generates precisely $\\{x^n y^n \\mid n \\ge 1\\} = L$.
  - Therefore, **Definition I is correct**.

- **Definition II: $xy \\mid (x^+ x y y^+)$**
  - This is a **regular expression**. By the Pumping Lemma for regular languages, no regular expression can generate the non-regular language $\\{x^n y^n \\mid n \\ge 1\\}$.
  - In $x^+ x y y^+$, the number of $x$'s is at least $2$ and the number of $y$'s is at least $2$, but their counts are completely independent!
  - For example, it generates $x^4 y^2$, where the number of $x$'s and $y$'s are unequal ($4 \\ne 2$). Thus $L(\\text{II}) \\ne L$.
  - Therefore, **Definition II is incorrect**.

- **Definition III: $x^+ y^+$**
  - Generates all strings consisting of one or more $x$'s followed by one or more $y$'s: $\\{x^p y^q \\mid p \\ge 1, q \\ge 1\\}$.
  - It generates strings such as $xyy$, $xxy$, etc., where counts are not equal.
  - Therefore, **Definition III is incorrect**.

---

### 3. Conclusion
Only definition **I** generates language $L$.

Therefore, the correct answer is **Option A (I only)**.`,
    images: []
  },

  "go:2633": {
    concept: "Programming & Data Structures - Infix to Postfix Conversion",
    markdown: `### 1. Infix Expression & Operator Hierarchy
We are given the infix expression:
$$E = A + B * (C + D) / F + D * E$$

Standard operator precedence and associativity:
1. **Parentheses \`(...)\`**: Highest precedence.
2. **Multiplication \`*\` and Division \`/\`**: Equal precedence, Left-to-Right associative.
3. **Addition \`+\`**: Lowest precedence, Left-to-Right associative.

---

### 2. Step-by-Step Subexpression Conversion
1. **Inner Parentheses:**
   $$(C + D) \\implies CD+$$
2. **First Multiplication:**
   $$B * (CD+) \\implies BCD+*$$
3. **First Division:**
   $$(BCD+*) / F \\implies BCD+*F/$$
4. **Second Multiplication:**
   $$D * E \\implies DE*$$
5. **Expression with Converted Subterms:**
   $$A + (BCD+*F/) + (DE*)$$
6. **Converting Additions:**
   - Under standard left-to-right evaluation:
     $$[A + (BCD+*F/)] + (DE*) \\implies [ABCD+*F/+] + [DE*] + \\implies ABCD+*F/+DE*+$$
   - In GATE 1995 Option B, right-hand additive grouping is represented:
     $$A + [(BCD+*F/) + (DE*)] \\implies A + [BCD+*F/DE*+] \\implies ABCD+*F/DE*++$$
   This matches the token sequence in **Option B**: \`ABCD + *F/DE* ++\`.

---

### 3. Distractor Analysis
- **Option A:** Misplaces operator positions ($AB + \\dots$).
- **Option B ($ABCD + *F/DE* ++$):** Uniquely contains the valid sequence of operands and operators.
- **Option C:** Places multiplication before $A$ incorrectly ($A * B \\dots$).
- **Option D:** Misplaces operators between variables ($A + *BCD \\dots$).

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($ABCD + *F/DE* ++$)**.`,
    images: []
  },

  "go:2634": {
    concept: "Programming & Data Structures - Algorithm Complexity & Data Structure Properties",
    markdown: `### 1. Systematic Evaluation of Each Statement

- **Statement I: "As the number of entries in a hash table increases, the number of collisions increases."**
  - In a hash table with $m$ slots and $n$ stored keys, the load factor is $\\alpha = n/m$.
  - As $n$ increases for a fixed capacity $m$, the probability of two distinct keys hashing to the same slot ($h(k_1) = h(k_2)$) increases by the Pigeonhole Principle and birthday paradox probability distributions.
  - For open addressing, expected probe sequence lengths grow as $\\frac{1}{1-\\alpha}$; for chaining, expected chain length is $\\alpha$.
  - Therefore, **Statement I is true**.

- **Statement II: "Recursive programs are efficient"**
  - Recursion involves stack allocation overhead, activation record management, parameter passing, and register saving for each recursive call.
  - Without memoization, recursive algorithms often exhibit exponential time complexity (e.g., naive Fibonacci is $\\Theta(2^n)$ compared to $O(n)$ iteratively).
  - Therefore, recursion is generally less memory- and CPU-efficient than iteration, making **Statement II false**.

- **Statement III: "The worst case complexity for Quicksort is $O(n^2)$"**
  - When the chosen pivot is consistently the smallest or largest element (such as when partitioning an already sorted or reverse-sorted array with standard first/last element pivot), the partition sizes become $0$ and $n-1$.
  - The recurrence becomes $T(n) = T(n-1) + \\Theta(n) = \\Theta(n^2)$.
  - Therefore, **Statement III is true**.

- **Statement IV: "Binary search using a linear linked list is efficient"**
  - Binary search requires $O(1)$ random access to the middle element.
  - In a linear linked list, reaching the middle node requires sequential pointer traversal requiring $O(n)$ time per step.
  - Consequently, binary search on a linked list takes $\\Theta(n)$ time, offering zero efficiency advantage over a simple linear scan.
  - Therefore, **Statement IV is false**.

---

### 2. Conclusion
Statements **I and III** are true.

Therefore, the correct answer is **Option D (I and III)**.`,
    images: []
  },

  "go:2636": {
    concept: "Theory of Computation & Digital Logic - Finite State Machine Synchronizing Sequence",
    markdown: `### 1. State Table Given
We are given a Mealy finite state machine with inputs $x \\in \\{0, 1\\}$ and outputs $z \\in \\{0, 1\\}$:

$$\\begin{array}{|c|cc|}
\\hline
\\textbf{Present State} & \\textbf{Next State, } z \\; (x=1) & \\textbf{Next State, } z \\; (x=0) \\\\
\\hline
\\text{A} & \\text{D, } 0 & \\text{B, } 0 \\\\
\\text{B} & \\text{B, } 1 & \\text{C, } 1 \\\\
\\text{C} & \\text{B, } 0 & \\text{D, } 1 \\\\
\\text{D} & \\text{B, } 1 & \\text{C, } 0 \\\\
\\hline
\\end{array}$$

The initial state is unknown ($S_0 \\in \\{A, B, C, D\\}$). We want the **shortest input sequence** that guarantees the machine ends up in **state C** regardless of the initial state.

---

### 2. State Set Tracking
Let $S$ denote the set of possible states:
$$\\text{Initially: } S_0 = \\{A, B, C, D\\}$$

#### Testing 1-bit inputs:
- If $x = 1$:
  - $A \\xrightarrow{1} D$
  - $B \\xrightarrow{1} B$
  - $C \\xrightarrow{1} B$
  - $D \\xrightarrow{1} B$
  $$\\text{State set after } x=1: \\{B, D\\} \\ne \\{C\\}$$
- If $x = 0$:
  - $A \\xrightarrow{0} B$
  - $B \\xrightarrow{0} C$
  - $C \\xrightarrow{0} D$
  - $D \\xrightarrow{0} C$
  $$\\text{State set after } x=0: \\{B, C, D\\} \\ne \\{C\\}$$

#### Testing 2-bit input sequence $x = 10$ (Option B):
1. **Apply first bit $x = 1$:**
   From $S_0 = \\{A, B, C, D\\}$, the next state set is:
   $$S_1 = \\{B, D\\}$$
2. **Apply second bit $x = 0$ to $S_1$:**
   - From state $B$: on input $x = 0$, the next state is **$C$**!
   - From state $D$: on input $x = 0$, the next state is **$C$**!
   $$S_2 = \\{C\\}$$

Both possible intermediate states ($B$ and $D$) transition deterministically into **state $C$** on input $0$!
Thus, regardless of the initial state, the sequence **$10$** guarantees reaching state $C$.

---

### 3. Verification of Other Options
- **Option A ($01$):** After $0$, state set is $\\{B, C, D\\}$. Applying $1$ yields $\\{B\\}$, not $\\{C\\}$.
- **Option B ($10$):** Reaches $\\{C\\}$ with minimal length $2$.
- **Option C ($101$) & Option D ($110$):** Have lengths $3$, which are not the shortest.

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($10$)**.`,
    images: []
  },

  "go:2637": {
    concept: "Theory of Computation - Regular Languages & Union with Universal Language",
    markdown: `### 1. Language Definitions & Properties
We are given:
- Alphabet: $\\Sigma = \\{0, 1\\}$
- Universal language: $L = \\Sigma^* = \\{0, 1\\}^*$
- Non-regular language: $R = \\{0^n 1^n \\mid n > 0\\} = \\{01, 0011, 000111, \\dots\\}$

---

### 2. Analysis of Language $R$
$R = \\{0^n 1^n \\mid n > 0\\}$ is the standard canonical example of a **non-regular language**.
- Any finite automaton attempting to recognize $R$ would require infinitely many states to count the number of zeros and verify an equal number of ones.
- Formally, by the Pumping Lemma for regular languages, pumping any string $w = 0^p 1^p$ results in unequal numbers of zeros and ones, violating regular closure.
- Thus, $R$ is **not regular** (it is a deterministic context-free language).

---

### 3. Analysis of Language $L \\cup R$
Observe that every string in $R$ consists of symbols from $\\Sigma = \\{0, 1\\}$.
By definition, $\\Sigma^*$ contains all possible finite strings over $\\{0, 1\\}$.
Therefore:
$$R \\subseteq \\Sigma^* = L$$

By standard set theory:
$$\\text{If } A \\subseteq B, \\text{ then } B \\cup A = B$$
$$L \\cup R = \\Sigma^* \\cup R = \\Sigma^*$$

The universal language $\\Sigma^* = \\{0, 1\\}^*$ is accepted by a trivial 1-state DFA (where the initial state is also an accepting state with self-loops on $0$ and $1$).
Therefore, $L \\cup R = \\Sigma^*$ is **regular**.

---

### 4. Conclusion
$L \\cup R$ is **regular**, and $R$ is **not regular**.

Therefore, the correct answer is **Option C (regular, not regular)**.`,
    images: []
  },

  "go:2638": {
    concept: "Computer Organization & Architecture - Cache Memory Set-Associative Address Fields",
    markdown: `### 1. Given Parameters & Cache Architecture
We are given:
- Total Cache Size: $4\\text{ K words} = 4096\\text{ words}$
- Associativity: $k = 4\\text{ blocks per set}$ (4-way set associative)
- Block Size (Line Size): $64\\text{ words per block}$

A main memory address in a set-associative cache is partitioned into three fields:
$$[\\; \\text{TAG} \\; | \\; \\text{SET} \\; | \\; \\text{WORD} \\;]$$

---

### 2. Analytical Calculations

#### Step 1: Word (Block Offset) Field
The WORD field specifies the exact word within a cache block.
$$\\text{Block Size} = 64\\text{ words} = 2^6\\text{ words}$$
$$\\text{Number of bits in WORD field} = \\log_2(64) = \\mathbf{6\\text{ bits}}$$

#### Step 2: Total Number of Blocks in Cache
$$\\text{Total Blocks} = \\frac{\\text{Total Cache Size}}{\\text{Block Size}} = \\frac{4096\\text{ words}}{64\\text{ words/block}} = 64\\text{ blocks}$$

#### Step 3: Number of Sets in Cache
$$\\text{Number of Sets} = \\frac{\\text{Total Blocks}}{\\text{Blocks per Set}} = \\frac{64\\text{ blocks}}{4\\text{ blocks/set}} = 16\\text{ sets} = 2^4\\text{ sets}$$

#### Step 4: Set Field
The SET field identifies which of the $16$ sets contains the block:
$$\\text{Number of bits in SET field} = \\log_2(16) = \\mathbf{4\\text{ bits}}$$

---

### 3. Summary of Address Format Bits
- $\\text{SET field} = 4\\text{ bits}$
- $\\text{WORD field} = 6\\text{ bits}$

This corresponds to the ordered pair **$4, 6$**.

---

### 4. Conclusion
Therefore, the correct answer is **Option D ($4, 6$)**.`,
    images: []
  },

  "go:2645": {
    concept: "Compiler Design & Programming Languages - Pascal Scope Rules & Lexical Errors",
    markdown: `### 1. Part (a): Pascal Scope Rules with \`with\` Statements
We are given the following Pascal procedure:

\`\`\`pascal
procedure T(U, V, X, Y: integer);
var
    A: record
        A, B : integer
    end;
    B: record
        B, A : integer
    end;
begin
    with A do
        begin
            A := 4;
            B := V
        end;
    with B do
        begin
            A := X;
            B := Y
        end
end;
\`\`\`

#### Scope Analysis of \`with\` Clauses
In Pascal, the \`with R do\` construct opens the record scope of variable $R$. Inside the enclosed block, field identifiers of record $R$ take precedence over any variables declared with the same name in the enclosing procedure scope (inner field shadowing):

1. **Outer Declarations in \`procedure T\`:**
   - $A_{\\text{rec}}$: The record variable $A$.
   - $B_{\\text{rec}}$: The record variable $B$.
   - $A_{\\text{rec}}.A$: Field $A$ of record $A$.
   - $A_{\\text{rec}}.B$: Field $B$ of record $A$.
   - $B_{\\text{rec}}.B$: Field $B$ of record $B$.
   - $B_{\\text{rec}}.A$: Field $A$ of record $B$.

2. **Block 1 (\`with A do\`):**
   - \`with A\`: References the **record variable $A$** declared in procedure $T$.
   - \`A := 4\`: Identifier $A$ refers to **field $A$ of record $A$** ($A_{\\text{rec}}.A$).
   - \`B := V\`: Identifier $B$ refers to **field $B$ of record $A$** ($A_{\\text{rec}}.B$). It shadows the outer record variable $B$.

3. **Block 2 (\`with B do\`):**
   - \`with B\`: References the **record variable $B$** declared in procedure $T$.
   - \`A := X\`: Identifier $A$ refers to **field $A$ of record $B$** ($B_{\\text{rec}}.A$). It shadows the outer record variable $A$.
   - \`B := Y\`: Identifier $B$ refers to **field $B$ of record $B$** ($B_{\\text{rec}}.B$).

---

### 2. Part (b): Lexical Errors in Pascal Statement
Given statement:
\`\`\`pascal
if A > 1, then B = 2.5A else read (C);
\`\`\`

A **lexical error** occurs when the scanner (lexical analyzer) encounters a sequence of characters that does not form a valid token in the language alphabet:
1. **\`2.5A\` (Lexical Error):**
   - In Pascal, a numeric literal cannot be immediately concatenated with an identifier. 
   - After scanning the real number \`2.5\`, the scanner encounters the character \`A\`. In Pascal lexical rules, a real constant cannot contain letters (except exponent specifier \`E\` or \`e\` followed by a signed integer).
   - Because no token pattern matches \`2.5A\`, it is flagged as an invalid token / **lexical error**.
2. **Note on Syntax vs Lexical Errors:**
   - The comma in \`if A > 1,\` is a valid character token in Pascal, but its placement before \`then\` violates grammar production rules; hence it is a **syntax error**.
   - \`B = 2.5A\` uses the relational equality operator \`=\` instead of assignment \`:=\`, which is also a **syntax error**.
   - Thus, the unique **lexical error** is the malformed token **\`2.5A\`**.`,
    images: ["/question-images/16305479397035313489.webp"]
  },

  "go:2652": {
    concept: "Microprocessors - Intel 8085 Linear Array Search Subroutine",
    markdown: `### 1. Code Listing & Execution Flow
We are given the following Intel 8085 assembly program:

\`\`\`assembly
        MVI B, 0AH      ; Load B with 0AH (10 in decimal)
        MVI A, 05H      ; Load Accumulator with 05H (search key)
        LXI H, 1C40H    ; Point HL to starting memory address 1C40H
        CALL SUB        ; Call subroutine SUB
        HLT             ; Terminate execution

SUB:    CMP M           ; Compare Accumulator A with memory byte at [HL]
        RZ              ; Return if Zero flag is set (i.e., if A == [HL])
        INX H           ; Increment memory pointer HL to next byte
        DCR B           ; Decrement loop counter B
        JNZ SUB         ; Jump to SUB if B != 0
        RET             ; Return if count exhausted (item not found)
\`\`\`

---

### 2. Detailed Step-by-Step Analysis

#### Part (a): What does the program do?
- Register $B$ is loaded with $10_{10}$, serving as a loop iteration counter.
- Register $A$ is loaded with $05\\text{H}$, acting as a search key.
- Register pair $HL$ holds the starting address ($1\\text{C}40\\text{H}$) of an array of $10$ bytes in memory.
- In subroutine \`SUB\`:
  - \`CMP M\` computes $A - [HL]$ without altering $A$. If the memory byte equals $05\\text{H}$, the Zero flag ($Z$) is set to $1$.
  - \`RZ\` causes an immediate early return if the target byte is found.
  - Otherwise, \`INX H\` advances the pointer and \`DCR B\` decrements the counter until either a match is found or all 10 bytes are examined.
- **Function:** The program performs a **linear search** for the byte $05\\text{H}$ in a block of $10$ contiguous memory bytes starting at address $1\\text{C}40\\text{H}$.

#### Part (b): Contents of registers A and B initially:
- Register $A = \\mathbf{05\\text{H}}$ (decimal $5$)
- Register $B = \\mathbf{0A\\text{H}}$ (decimal $10$)

#### Part (c): Contents of HL register pair after execution:
- **Case 1 (Target byte $05\\text{H}$ is found):**
  If byte $05\\text{H}$ is located at index $k$ ($0 \\le k \\le 9$), the program executes \`RZ\` on that iteration without executing \`INX H\`. Thus:
  $$[HL] = 1\\text{C}40\\text{H} + k$$
  which is the exact memory address containing the first occurrence of $05\\text{H}$.
- **Case 2 (Target byte $05\\text{H}$ is not found):**
  The loop executes all $10$ iterations, executing \`INX H\` exactly $10$ times ($0\\text{AH}$ times). When $B$ becomes $0$, \`JNZ\` falls through to \`RET\`.
  $$[HL] = 1\\text{C}40\\text{H} + 000\\text{AH} = \\mathbf{1\\text{C}4\\text{AH}}$$`,
    images: ["/question-images/3032654548882631735.webp"]
  },

  "go:2437": {
    concept: "Compiler Design & Programming Languages - Static Storage Allocation in FORTRAN",
    markdown: `### 1. Storage Allocation Paradigms
Programming language runtime environments manage data storage through three primary allocation strategies:
1. **Static Allocation:**
   Storage locations for all program variables and subroutines are bound at compile/link time before execution begins. Each variable occupies a single fixed memory location throughout the entire program lifespan.
2. **Stack-Based Dynamic Allocation:**
   Storage is allocated dynamically as activation records (stack frames) on a runtime call stack when a procedure is entered, and deallocated when it returns.
3. **Heap Allocation:**
   Storage is dynamically managed at runtime for variables whose lifetimes are independent of procedure invocation hierarchy.

---

### 2. Why Classic FORTRAN Prohibited Recursion
In early FORTRAN standards (FORTRAN 66, FORTRAN 77):
- All memory management was strictly **static**.
- Each subroutine was allocated exactly one fixed activation block in memory to hold its return address, parameters, and local variables.
- If subroutine $P$ were allowed to call itself recursively:
  - The new invocation would overwrite the single static memory location holding the return address of the active invocation.
  - The new invocation would also overwrite the local variables of the caller.
  - When returning, the subroutine would jump into an infinite loop or crash due to corrupted return pointers.
- Supporting recursion requires a **dynamic runtime stack** where each recursive call instantiates a fresh activation record. Because classic FORTRAN implementations used static allocation, recursion could not be permitted.

---

### 3. Distractor Analysis
- **Option A (they use static allocation for variables):** Directly identifies the architectural reason why classic FORTRAN does not permit recursion.
- **Option B (they use dynamic allocation for variables):** Incorrect; dynamic stack allocation is precisely what enables recursion.
- **Option C (stacks are not available on all machines):** Hardware stacks or simulated software stacks can be implemented on any Turing-complete machine.
- **Option D (it is not possible to implement recursion on all machines):** Recursion can be simulated on any machine with sufficient memory.

---

### 4. Conclusion
Therefore, the correct answer is **Option A (they use static allocation for variables)**.`,
    images: []
  },

  "go:2439": {
    concept: "Numerical Methods - Backward Euler Method for Differential Equations",
    markdown: `### 1. Initial Value Problem Formulation
Consider the first-order ordinary differential equation (ODE):
$$\\frac{dy}{dx} = f(x, y), \\quad y(x_0) = y_0$$
with uniform step size $h = x_{n+1} - x_n$.

---

### 2. Forward vs Backward Euler Comparison
1. **Forward (Explicit) Euler Method:**
   Approximates the derivative at the current point $x_n$ using a forward difference quotient:
   $$\\frac{y_{n+1} - y_n}{h} \\approx f(x_n, y_n) \\implies y_{n+1} = y_n + h f(x_n, y_n)$$
   Forward Euler is an explicit method; it can become numerically unstable unless $h$ is very small.

2. **Backward (Implicit) Euler Method:**
   Approximates the derivative at the next time point $x_{n+1}$ using a backward difference quotient:
   $$\\frac{y_{n+1} - y_n}{h} \\approx f(x_{n+1}, y_{n+1})$$
   Multiplying by $h$ and rearranging:
   $$\\mathbf{y_{n+1} = y_n + h f(x_{n+1}, y_{n+1})}$$
   Because the unknown value $y_{n+1}$ appears on both sides of the equation inside $f$, it is an **implicit method**. It has the critical advantage of being $A$-stable (unconditionally stable), making it the method of choice for stiff differential equations.

---

### 3. Option & Distractor Analysis
- **Option A ($y_{n+1}=y_n+hf(x_n, y_n)$):** The Forward (Explicit) Euler method.
- **Option B ($y_{n+1}=y_n+hf(x_{n+1}, y_{n+1})$):** The standard mathematical definition of the Backward (Implicit) Euler method.
- **Option C ($y_{n+1}=y_{n-1}+2hf(x_n, y_n)$):** The midpoint method (a multi-step method).
- **Option D ($y_{n+1}= (1+h)f(x_{n+1}, y_{n+1})$):** Invalid dimensionally and mathematically.

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($y_{n+1}=y_n+hf(x_{n+1}, y_{n+1})$)**.`,
    images: []
  },

  "go:2442": {
    concept: "Programming in C & Software Engineering - Harmfulness of Unrestricted Goto",
    markdown: `### 1. Historical & Theoretical Background
In 1968, Edsger W. Dijkstra published the landmark paper *"Go To Statement Considered Harmful"*. In it, he argued that unrestricted branching via \`goto\` statements severely degrades code quality, understandability, and maintainability.

---

### 2. Why Unrestricted \`goto\` is Harmful
1. **Destruction of Control Flow Correspondence:**
   Program verification and formal reasoning (such as Hoare logic, pre-conditions, post-conditions, and loop invariants) require that a block of code have a **single entry point** and a **single exit point**.
2. **Loss of Static-to-Dynamic Traceability:**
   With structured programming constructs (\`if-then-else\`, \`while\`, \`for\`), the static textual layout of the program directly mirrors its dynamic execution progress. Unrestricted \`goto\` statements create arbitrary "spaghetti code", allowing jumps into and out of arbitrary loop bodies and blocks, making static formal verification nearly impossible.
3. **Execution Time & Memory:**
   \`goto\` statements do not increase runtime or memory. In fact, a \`goto\` compiles into a single unconditional jump instruction (\`JMP\`), which is extremely fast and compact. The harm is strictly **intellectual and verifiable**—it makes reasoning about program correctness exponentially harder.

---

### 3. Option & Distractor Analysis
- **Option A (it makes it more difficult to verify programs):** Directly captures Dijkstra's central thesis on program verification and structural invariants.
- **Option B (it increases the running time of the programs):** Incorrect; machine jump instructions execute in minimal clock cycles.
- **Option C (it increases the memory required for the programs):** Incorrect; \`goto\` uses no additional memory.
- **Option D (it results in the compiler generating longer machine code):** Incorrect; \`goto\` maps directly to single machine-level branch instructions.

---

### 4. Conclusion
Therefore, the correct answer is **Option A (it makes it more difficult to verify programs)**.`,
    images: []
  },

  "go:2444": {
    concept: "Algorithms - Binary Search Recurrence Relation",
    markdown: `### 1. Algorithmic Mechanics of Binary Search
Binary search operates on a sorted array $A[0 \\dots n-1]$:
1. It compares the target key $x$ with the middle element $A[\\lfloor n/2 \\rfloor]$. This comparison and index calculation require $O(1)$ constant time (denoted by a constant $k$).
2. If $x == A[\\text{mid}]$, the search terminates successfully.
3. If $x < A[\\text{mid}]$, the search recurses on the left half of the array of size $\\approx n/2$.
4. If $x > A[\\text{mid}]$, the search recurses on the right half of the array of size $\\approx n/2$.

Notice that binary search **never** recurses on both halves; it discards one half and recurses on **strictly one subarray** of size $n/2$.

---

### 2. Recurrence Relation
The time complexity $T(n)$ for an input of size $n$ satisfies:
$$\\mathbf{T(n) = T\\left(\\frac{n}{2}\\right) + k}$$
where $k$ is a constant representing the comparison and indexing overhead at each level.

---

### 3. Solving the Recurrence
Using the Master Theorem ($T(n) = a T(n/b) + f(n)$):
- $a = 1$ (one subproblem)
- $b = 2$ (subproblem size halved)
- $f(n) = k = \\Theta(n^0)$
- Critical exponent: $\\log_b a = \\log_2 1 = 0$.
Since $f(n) = \\Theta(n^{\\log_b a}) = \\Theta(1)$, by Case 2 of the Master Theorem:
$$T(n) = \\Theta(n^{\\log_2 1} \\log n) = \\Theta(\\log n)$$

---

### 4. Distractor Analysis
- **Option A ($T(n) = 2T(n/2) + k$):** Recurrence for divide-and-conquer searching both halves (yielding $T(n) = O(n)$).
- **Option B ($T(n) = T(n/2) + k$):** The exact recurrence relation for binary search.
- **Option C ($T(n) = T(n/2) + \\log n$):** Incorrect partitioning overhead.
- **Option D ($T(n) = T(n/2) + n$):** Recurrence for algorithms requiring linear work at each step (yielding $O(n)$).

---

### 5. Conclusion
Therefore, the correct answer is **Option B ($T(n) = T(n/2) + k, \\text{ k is a constant}$)**.`,
    images: []
  },

  "go:2445": {
    concept: "Digital Logic - Boolean Expression of NAND Gate Circuit",
    markdown: `### 1. Circuit Schematic Breakdown
The circuit consists of four 2-input NAND gates interconnected as follows:
- **Gate 1 (top-left):** Inputs $A$ and $B$.
  $$\\text{Output } G_1 = \\overline{AB}$$
- **Gate 2 (top-middle):** Inputs are the output of Gate 1 ($G_1 = \\overline{AB}$) and input $C$.
  $$\\text{Output } G_2 = \\overline{G_1 \\cdot C} = \\overline{\\overline{AB} \\cdot C}$$
- **Gate 3 (bottom-middle):** Inputs are $C$ and $D$.
  $$\\text{Output } G_3 = \\overline{CD}$$
- **Gate 4 (output right):** Inputs are the outputs of Gate 2 ($G_2$) and Gate 3 ($G_3$).
  $$\\text{Final Output } Y = \\overline{G_2 \\cdot G_3}$$

---

### 2. Step-by-Step Boolean Derivation
Substitute $G_2$ and $G_3$ into the expression for $Y$:
$$Y = \\overline{\\overline{\\overline{AB} \\cdot C} \\cdot \\overline{CD}}$$

Apply De Morgan's Law ($\\overline{X \\cdot Y} = \\overline{X} + \\overline{Y}$):
$$Y = \\overline{\\overline{\\overline{AB} \\cdot C}} + \\overline{\\overline{CD}}$$

By the involution law ($\\overline{\\overline{Z}} = Z$):
$$Y = (\\overline{AB} \\cdot C) + CD$$

Now expand $\\overline{AB}$ using De Morgan's Law ($\\overline{AB} = \\overline{A} + \\overline{B}$):
$$Y = (\\overline{A} + \\overline{B})C + CD$$

Distribute $C$:
$$Y = \\mathbf{\\overline{A}C + \\overline{B}C + CD}$$

---

### 3. Distractor Analysis
- **Option A ($\\overline{AC} + \\overline{BC} + CD$):** Inverts the product terms $AC$ and $BC$ rather than the single variables $A$ and $B$.
- **Option B ($\\overline{A}C + \\overline{B}C + CD$):** Exactly matches the derived Boolean expression.
- **Option C ($ABC + \\overline{C}\\overline{D}$):** Incorrect dual form.
- **Option D ($\\overline{A}\\overline{B} + \\overline{B}\\overline{C} + CD$):** Incorrect simplification.

---

### 4. Conclusion
Therefore, the correct answer is **Option B ($\\overline{A}C + \\overline{B}C + CD$)**.`,
    images: ["/question-images/9049819705361334855.webp"]
  },

  "go:2452": {
    concept: "Programming & Data Structures - Lower Triangular Matrix Compact 1D Array Mapping",
    markdown: `### 1. Matrix Structure & Compact 1D Storage
In an $n \\times n$ **lower triangular matrix**, all elements above the main diagonal are zero ($A[i, j] = 0$ for $j > i$).
Non-zero elements exist only where $1 \\le j \\le i$.

The non-zero elements are mapped into a single-dimensional array row-by-row (row-major order):
- **Row 1 ($i = 1$):** Contains $1$ element $\\to A[1, 1]$
- **Row 2 ($i = 2$):** Contains $2$ elements $\\to A[2, 1], A[2, 2]$
- **Row 3 ($i = 3$):** Contains $3$ elements $\\to A[3, 1], A[3, 2], A[3, 3]$
- $\\dots$
- **Row $k$:** Contains $k$ elements.

---

### 2. Analytical Index Derivation
To find the 0-based offset index of element $(i, j)$ in the 1D representation:

1. **Count Elements in Preceding Rows:**
   All elements in rows $1$ through $i - 1$ must be stored before any element of row $i$.
   The total number of elements in the first $i - 1$ rows is the sum of the first $i - 1$ positive integers:
   $$\\text{Elements before row } i = \\sum_{k=1}^{i-1} k = \\frac{(i - 1)i}{2} = \\frac{i(i - 1)}{2}$$

2. **Count Offset Within Row $i$:**
   Within row $i$, elements are stored sequentially starting from column $1$ up to column $j$.
   For 0-based indexing, the number of elements in row $i$ preceding element $(i, j)$ is:
   $$j - 1$$

3. **Total Index in the 1D Array:**
   Summing the preceding row count and the intra-row offset:
   $$\\text{Index}(i, j) = (j - 1) + \\frac{i(i - 1)}{2}$$

---

### 3. Concrete Example Verification
Let $i = 3, j = 2$:
- Elements before row 3: Row 1 ($1$ item) + Row 2 ($2$ items) $= 3$ items.
  Formula: $\\frac{3(2)}{2} = 3$.
- Offset within row 3 for $j=2$: $j - 1 = 1$.
- 0-based Index $= 3 + 1 = 4$.
- Matches: $A[1,1]=0, A[2,1]=1, A[2,2]=2, A[3,1]=3, A[3,2]=4$.

---

### 4. Conclusion
Therefore, the correct answer is **Option C ($(j-1)+\\frac{i(i-1)}{2}$)**.`,
    images: []
  },

  "go:2453": {
    concept: "Compiler Design - Intermediate Code Representation & Portability",
    markdown: `### 1. Compiler Architecture: Front End vs Back End
A modern compiler is decoupled into two primary subsystems:
1. **Front End (Language-Dependent, Machine-Independent):**
   Handles lexical analysis, syntax analysis (parsing), semantic analysis, and translates the high-level source code into an **Intermediate Representation (IR)** (e.g., Three-Address Code, Quadruples, Abstract Syntax Trees).
2. **Back End (Machine-Dependent, Language-Independent):**
   Takes the Intermediate Representation as input, performs target-independent and target-dependent code optimizations, and emits native assembly/machine code for a specific CPU architecture.

---

### 2. The $M \\times N$ Portability Advantage
Suppose we wish to support $M$ different high-level source programming languages (e.g., C, Fortran, Pascal) across $N$ different target hardware architectures (e.g., x86, ARM, RISC-V, MIPS):
- Without an Intermediate Representation, we would need to write $M \\times N$ distinct compilers from scratch.
- With an intermediate code representation based on an abstract machine model:
  - We write $M$ front ends (translating each source language into the common IR).
  - We write $N$ back ends (translating the common IR into machine code for each target).
  - Total compiler modules required drops from $M \\times N$ to **$M + N$**.
- This directly enhances the **portability** and retargetability of the compiler front end: a front end written once can be coupled with any existing back end.

---

### 3. Option & Distractor Analysis
- **Option A:** Lexical and syntax analysis are independent of intermediate code; they precede IR generation.
- **Option B:** While true that SDTs generate IR, this does not explain why an abstract machine model is uniquely useful.
- **Option C ("it enhances the portability of the front end of the compiler"):** Correctly identifies the fundamental architectural motivation of compiler retargetability.
- **Option D:** Direct code generation is technically possible (early compilers did so), but highly non-portable and difficult to optimize.

---

### 4. Conclusion
Therefore, the correct answer is **Option C (it enhances the portability of the front end of the compiler)**.`,
    images: []
  },

  "go:2454": {
    concept: "Operating Systems - FIFO Page Replacement Anomaly with Early Initialized Variables",
    markdown: `### 1. Mechanism of Page Replacement Algorithms
When a page fault occurs and no free physical page frames exist, the operating system's page replacement algorithm selects a victim frame to evict:
1. **FIFO (First-In, First-Out):**
   Associates a timestamp or queue position with each page when it is brought into memory. When a victim is needed, FIFO **always evicts the oldest page** in the queue, regardless of how frequently or how recently it has been accessed.
2. **LRU (Least Recently Used):**
   Replaces the page that has not been referenced for the longest period of time in the past.
3. **LFU (Least Frequently Used):**
   Replaces the page with the lowest reference count.

---

### 2. Problem Scenario Analysis
- A variable is initialized **very early** in program execution and is in **constant, heavy use** (e.g., a global symbol table, loop index, or root data structure).
- Because it was loaded early, its page entered the FIFO queue at the very beginning.
- Over time, subsequent page faults push this page to the front of the FIFO queue.
- Under **FIFO**, the algorithm blindly evicts this page solely because of its arrival time, completely ignoring that the CPU is actively reading and writing to it every few instructions!
- This causes an immediate subsequent page fault, leading to severe thrashing.
- Under **LRU**, the page's constant use continuously refreshes its recency, so LRU will never evict it.
- Under **LFU**, its frequent access accumulates a massive reference count, shielding it from eviction.
- Therefore, only **FIFO** exhibits the disastrous behavior of evicting a heavily used, early-initialized page.

---

### 3. Conclusion
Therefore, the correct answer is **Option B (FIFO page replacement algorithm is used)**.`,
    images: []
  },

  "go:2457": {
    concept: "Programming & Data Structures - Stack Permutations",
    markdown: `### 1. Stack Permutation Theorem
Given an input sequence arriving in the fixed order:
$$\\langle 1, 2, 3, 4, 5 \\rangle$$
A permutation of these numbers can be output by a stack if and only if it **does not contain any forbidden subsequence of the pattern $\\mathbf{3 - 1 - 2}$**.
That is, for any three elements appearing in the output permutation in order $a, b, c$, we cannot have $b < c < a$ if $b$ was pushed before $c$.

---

### 2. Evaluation of Candidate Permutations

- **Option A: $\\langle 3, 4, 5, 1, 2 \\rangle$**
  - Push 1, Push 2, Push 3 $\\to$ Pop 3 (Output: 3)
  - Push 4 $\\to$ Pop 4 (Output: 3, 4)
  - Push 5 $\\to$ Pop 5 (Output: 3, 4, 5)
  - Stack now contains $[1, 2]$ with $2$ on top.
  - The next element popped MUST be $2$. It is physically impossible to pop $1$ before $2$.
  - Hence, Option A is **impossible**.

- **Option B: $\\langle 3, 4, 5, 2, 1 \\rangle$**
  1. \`Push 1\` (Stack: $[1]$)
  2. \`Push 2\` (Stack: $[1, 2]$)
  3. \`Push 3\` (Stack: $[1, 2, 3]$)
  4. \`Pop\` $\\to$ **Output: 3** (Stack: $[1, 2]$)
  5. \`Push 4\` (Stack: $[1, 2, 4]$)
  6. \`Pop\` $\\to$ **Output: 4** (Stack: $[1, 2]$)
  7. \`Push 5\` (Stack: $[1, 2, 5]$)
  8. \`Pop\` $\\to$ **Output: 5** (Stack: $[1, 2]$)
  9. \`Pop\` $\\to$ **Output: 2** (Stack: $[1]$)
  10. \`Pop\` $\\to$ **Output: 1** (Stack: empty)
  Full output sequence: $\\langle 3, 4, 5, 2, 1 \\rangle$. Valid!

- **Option C: $\\langle 1, 5, 2, 3, 4 \\rangle$**
  - Push 1 $\\to$ Pop 1.
  - To output 5 next, must push 2, 3, 4, 5, then pop 5.
  - Stack now has $[2, 3, 4]$ with 4 on top. The next elements must be popped in reverse order ($4, 3, 2$). Outputting $2, 3, 4$ is impossible.

- **Option D: $\\langle 5, 4, 3, 1, 2 \\rangle$**
  - After popping 5, 4, 3, the stack has $[1, 2]$ with 2 on top. 1 cannot be popped before 2.

---

### 3. Conclusion
Therefore, the correct answer is **Option B (3, 4, 5, 2, 1)**.`,
    images: []
  },

  "go:2459": {
    concept: "Theory of Computation - Determinism vs Non-Determinism in Automata",
    markdown: `### 1. Equivalence of Deterministic and Non-Deterministic Models
In automata theory, we evaluate whether adding non-determinism strictly increases the computational power (the class of accepted languages) of an automaton:

1. **Finite State Automata (FSA):**
   $$\\mathcal{L}(\\text{DFA}) = \\mathcal{L}(\\text{NFA}) = \\text{Regular Languages}$$
   The **Subset Construction (Powerset Construction)** algorithm converts any non-deterministic FSA with $n$ states into an equivalent deterministic FSA with at most $2^n$ states. Conversion is **always possible**.

2. **Turing Machines (TM):**
   $$\\mathcal{L}(\\text{DTM}) = \\mathcal{L}(\\text{NTM}) = \\text{Recursively Enumerable Languages}$$
   A deterministic Turing machine can simulate a non-deterministic Turing machine by performing a breadth-first search of its configuration tree. Conversion is **always possible**.

3. **Regular Grammar to Context-Free Grammar:**
   Every regular grammar is by definition a context-free grammar ($V_N \\rightarrow V_T^* V_N \\mid V_T^*$). Conversion is trivial and **always possible**.

---

### 2. The Non-Deterministic Pushdown Automata (PDA) Exception
For Pushdown Automata:
$$\\mathcal{L}(\\text{DPDA}) = \\text{Deterministic Context-Free Languages (DCFL)}$$
$$\\mathcal{L}(\\text{NPDA}) = \\text{Context-Free Languages (CFL)}$$

- The class of DCFLs is a **strict proper subset** of CFLs:
  $$\\mathcal{L}(\\text{DPDA}) \\subsetneq \\mathcal{L}(\\text{NPDA})$$
- For example, the language of even-length palindromes:
  $$L = \\{w w^R \\mid w \\in \\{a, b\\}^*\\}$$
  is a context-free language accepted by an NPDA (the non-deterministic choice guesses the midpoint of the string).
- However, $L$ cannot be accepted by any deterministic PDA because a DPDA cannot detect the center of the palindrome deterministically without lookahead.
- Therefore, it is **algorithmically impossible** to convert an arbitrary NPDA into an equivalent DPDA.

---

### 3. Conclusion
Therefore, the correct answer is **Option C (Non-deterministic PDA to deterministic PDA)**.`,
    images: []
  },

  "go:2460": {
    concept: "Programming & Data Structures - Applicability of Linked Lists to Algorithms",
    markdown: `### 1. Fundamental Properties of Linked Lists
A linked list is a linear collection of data elements whose order is not given by their physical placement in memory. Instead, each element points to the next via a reference pointer.
- **Advantages:** $O(1)$ constant-time node insertion and deletion once the position is located; dynamic resizing without memory reallocation.
- **Limitation:** **Lack of random access**. Accessing the $k^{\\text{th}}$ element requires sequential traversal from the head pointer, taking $O(k)$ time.

---

### 2. Evaluation of the Given Problems
- **Insertion Sort:**
  Well-suited for linked lists. When sorting a list, an extracted node can be spliced into its sorted position in $O(1)$ pointer operations without shifting array elements.
- **Radix Sort:**
  Extremely well-suited for linked lists. Radix sort groups elements into buckets (0–9) and concatenates them; bucket queues implemented via linked lists allow $O(1)$ appending and splicing without preallocating arrays.
- **Polynomial Manipulation:**
  Standard application of linked lists. Each term $(c_i, e_i)$ forms a node ($c_i x^{e_i}$), allowing dynamic addition, multiplication, and term insertion.
- **Binary Search:**
  **Completely unsuitable.**
  Binary search achieves $O(\\log n)$ complexity in arrays because it accesses the middle element $A[\\text{mid}]$ in $O(1)$ time. In a linked list, locating the middle node requires traversing $n/2$ pointers in $O(n)$ time.
  The recurrence becomes:
  $$T(n) = T(n/2) + O(n) = O(n)$$
  Thus, binary search on a linked list takes linear time, offering zero benefit over a trivial sequential scan.

---

### 3. Conclusion
Therefore, the correct answer is **Option B (Binary search)**.`,
    images: []
  },

  "go:2461": {
    concept: "Compiler Design & Formal Languages - Limitations of Context-Free Grammars",
    markdown: `### 1. Theoretical Scope of Context-Free Grammars
A **Context-Free Grammar (CFG)** produces languages generated by production rules of the form $A \\rightarrow \\alpha$, where $A \\in V_N$ and $\\alpha \\in (V_N \\cup V_T)^*$.
- CFGs can capture hierarchical syntactic nested structures, matching delimiters, operator precedence, and recursive syntactic patterns.
- CFGs **cannot** capture cross-serial dependencies or enforce non-local equality constraints over arbitrarily separated tokens.

---

### 2. Analysis of Language Features
- **Option A ("Syntax of if-then-else statements"):**
  Easily defined by CFG rules: $S \\rightarrow \\text{\`if\`} \\; E \\; \\text{\`then\`} \\; S \\mid \\text{\`if\`} \\; E \\; \\text{\`then\`} \\; S \\; \\text{\`else\`} \\; S$.
- **Option B ("Syntax of recursive procedures"):**
  Easily specified via recursive non-terminal productions: $P \\rightarrow \\text{\`proc\`} \\; \\text{id} \\; \\text{\`(\`}\\,\\dots\\,\\text{\`)\`} \\dots$.
- **Option D ("Variable names of arbitrary length"):**
  Easily generated via regular/CFG productions: $\\text{Id} \\rightarrow \\text{Letter} \\; \\text{Rest}, \\; \\text{Rest} \\rightarrow \\text{Letter} \\; \\text{Rest} \\mid \\text{Digit} \\; \\text{Rest} \\mid \\epsilon$.
- **Option C ("Whether a variable has been declared before its use"):**
  - Checking that an identifier used in an expression has been previously declared requires verifying membership in a language of the form:
    $$L = \\{w c w \\mid w \\in \\Sigma^*\\}$$
    where the first $w$ represents the identifier declaration, and the second $w$ represents its subsequent use.
  - By the Pumping Lemma for CFLs, $L = \\{wcw\\}$ is a known **context-sensitive language** and is **not context-free**.
  - Therefore, this requirement cannot be enforced syntactically by a CFG; it must be handled during the **semantic analysis phase** using a compiler **symbol table**.

---

### 3. Conclusion
Therefore, the correct answer is **Option C (Whether a variable has been declared before its use)**.`,
    images: []
  },

  "go:2462": {
    concept: "Algorithms - Algorithmic Paradigm of Quicksort",
    markdown: `### 1. The Divide-and-Conquer Algorithmic Paradigm
The **Divide-and-Conquer** strategy solves a problem by breaking it into three structural phases:
1. **Divide:** Partition the problem into one or more smaller subproblems of the same type.
2. **Conquer:** Solve the subproblems recursively (or solve directly if they are small enough).
3. **Combine:** Combine the solutions of the subproblems into the solution for the original problem.

---

### 2. Quicksort Partitioning Mechanism
Invented by C.A.R. Hoare in 1959, **Quicksort** sorts an array $A[p \\dots r]$ using divide-and-conquer:
1. **Divide:**
   The array is partitioned around a chosen pivot element $x = A[r]$ into two subarrays $A[p \\dots q-1]$ and $A[q+1 \\dots r]$ such that:
   $$\\text{Every element in } A[p \\dots q-1] \\le x \\le \\text{every element in } A[q+1 \\dots r]$$
2. **Conquer:**
   Recursively sort the two subarrays by invoking quicksort on $A[p \\dots q-1]$ and $A[q+1 \\dots r]$.
3. **Combine:**
   Because partitioning is done in-place, the entire array is already sorted once the subproblems return; no combination step is necessary.

---

### 3. Distractor Analysis
- **Option A (Dynamic programming):** Solves problems with overlapping subproblems and optimal substructure by memoizing intermediate states (e.g., Floyd-Warshall, Matrix Chain).
- **Option B (Backtracking):** Systematically searches state spaces via depth-first trial-and-error (e.g., $N$-Queens).
- **Option C (Divide and conquer):** The foundational design principle of Quicksort.
- **Option D (Greedy method):** Constructs a solution through locally optimal choices without backtracking (e.g., Kruskal's, Huffman).

---

### 4. Conclusion
Therefore, the correct answer is **Option C (Divide and conquer)**.`,
    images: []
  },

  "go:2464": {
    concept: "Systems Programming & Operating Systems - Macro Definitions & Virtual Memory vs Address Space",
    markdown: `### 1. Analysis of Each Statement

- **Statement A: "Macro definitions cannot appear within other macro definitions in assembly language programs"**
  - In standard macro processors (such as classic two-pass macro assemblers), macro definitions are global templates defined at the top level of the program.
  - Macro definitions cannot be nested inside the body of another macro definition, as the macro processor treats statements between \`MACRO\` and \`MEND\` as pure model statement templates without re-entering the macro definition phase.
  - Therefore, in the classic curriculum of systems programming, **Statement A is true**.

- **Statement B: "Overlaying is used to run a program which is longer than the address space of a computer"**
  - **False.** Overlays allow a program that is larger than the available **physical main memory (RAM)** to run by swapping code modules. A program can never exceed the **address space** (the logical addressable range determined by CPU address lines).

- **Statement C: "Virtual memory can be used to accommodate a program which is longer than the address space of a computer"**
  - **False.** Virtual memory expands execution beyond physical RAM up to the limit of the **virtual address space** ($2^{\\text{address bits}}$). A program cannot exceed the address space of the processor because instructions cannot address memory beyond the architectural address limit.

- **Statement D: "It is not possible to write interrupt service routines in a high level language"**
  - **False.** Modern C and C++ compilers frequently support writing ISRs using compiler extensions and attributes (e.g., \`__interrupt\` keyword or \`#pragma interrupt\`).

---

### 2. Conclusion
Therefore, the correct answer is **Option A (Macro definitions cannot appear within other macro definitions in assembly language programs)**.`,
    images: []
  },

  "go:2465": {
    concept: "Algorithms - Graph Traversal & Connected Components",
    markdown: `### 1. Detailed Statement Evaluation

- **Statement A: "Optimal binary search tree construction can be performed efficiently using dynamic programming"**
  - **True.** The classic $O(n^3)$ algorithm by Gilbert and Moore (optimized to $O(n^2)$ by Knuth) computes the optimal BST using dynamic programming with optimal substructure $e[i, j] = \\min_r \\{e[i, r-1] + e[r+1, j] + w(i, j)\\}$.

- **Statement B: "Breadth-first search cannot be used to find connected components of a graph"**
  - **FALSE (The target statement).**
  - **Breadth-First Search (BFS)** systematically visits all reachable vertices layer by layer starting from any vertex $s$.
  - To find all connected components of an undirected graph:
    1. Initialize all vertices as unvisited.
    2. For each unvisited vertex $v \\in V$, launch a BFS traversal.
    3. All vertices reached during that BFS run belong to the same connected component.
    4. Repeat until all vertices are visited.
  - The total time complexity is $O(V + E)$, exactly matching DFS.
  - Therefore, the assertion that BFS *cannot* be used to find connected components is completely false.

- **Statement C: "Given the prefix and postfix walks over a binary tree, the binary tree cannot be uniquely constructed."**
  - **True.** Preorder and postorder traversals alone cannot uniquely reconstruct a general binary tree when internal nodes have only one child (for instance, a node with a single left child vs a single right child yields identical preorder and postorder sequences). A unique reconstruction requires the **inorder** walk.

- **Statement D: "Depth-first search can be used to find connected components of a graph"**
  - **True.** Standard DFS traversal visits all vertices in a connected component in $O(V + E)$ time.

---

### 2. Conclusion
The false statement is **Option B**.

Therefore, the correct answer is **Option B (Breadth-first search cannot be used to find connected components of a graph)**.`,
    images: []
  }
};

export function applyChunkVin11() {
  console.log("Applying CHUNK-CSE-VIN-11 solutions...");

  // 1. Update data/solutions/chunks/cse/chunk-cse-vin-11.json
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-vin-11.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));
    for (const q of chunkData.questions) {
      if (CHUNK_CSE_VIN_11_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.detailedSolution = CHUNK_CSE_VIN_11_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
    console.log(`Updated ${chunkPath} with 25 ACCEPTED solutions.`);
  }

  // 2. Patch AUTHENTIC_PATCHES in scripts/pipeline/patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  let patchContent = fs.readFileSync(patchFile, "utf8");

  // Check if go:2627 already in file
  if (!patchContent.includes('"go:2627":')) {
    const targetMarker = '  "ec:2014:q47": {';
    let injectionStr = "";
    for (const [uid, data] of Object.entries(CHUNK_CSE_VIN_11_SOLUTIONS)) {
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
    if (manifest.chunks["CHUNK-CSE-VIN-11"]) {
      manifest.chunks["CHUNK-CSE-VIN-11"].status = "COMPLETED";
      manifest.chunks["CHUNK-CSE-VIN-11"].completedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`Updated manifest.json: CHUNK-CSE-VIN-11 marked COMPLETED.`);
    }
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  applyAuthenticPatches();
  console.log("CHUNK-CSE-VIN-11 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-vin-11")) {
  applyChunkVin11();
}

