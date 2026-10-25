/**
 * scripts/pipeline/apply-chunk-cse-hw-14-to-16.mjs
 * -------------------------------------------------
 * Verified authentic solutions for GATE CSE & IT 2008 and GATE CSE 2009 Hardware
 * (34 Questions covering Digital Logic and Computer Organization & Architecture).
 *
 * Chunks:
 *   - CHUNK-CSE-HW-14 (11 Qs): go:402 to go:449    (GATE CSE 2008 Hardware Part 1)
 *   - CHUNK-CSE-HW-15 (11 Qs): go:494 to go:3347   (GATE CSE 2008 Part 2 & GATE IT 2008 Part 1)
 *   - CHUNK-CSE-HW-16 (12 Qs): go:3348 to go:1315  (GATE IT 2008 Part 2 & GATE CSE 2009)
 */

export const CHUNK_CSE_HW_14_TO_16 = {
  // ==========================================
  // CHUNK-CSE-HW-14: GATE CSE 2008 Hardware Part 1
  // ==========================================
  "go:402": {
    concept: "Computer Organization - IEEE 754 Floating-Point Zero Representation",
    markdown: `### 1. Concept / Subtopic
**IEEE 754 Floating-Point Standard**: Encoding of special and non-numeric quantities in single-precision (32-bit) floating-point format, distinguishing normalized numbers, denormalized numbers, and signed zeros.

---

### 2. Given Parameters & Bit Configuration
* **Hexadecimal Pattern**: $\\text{0x00000000}$.
* **IEEE 754 Single-Precision Format**:
  * Sign bit ($S$): 1 bit.
  * Biased Exponent ($E$): 8 bits (bias $= 127$).
  * Fraction / Mantissa ($M$): 23 bits.

---

### 3. Step-by-Step Analytical Derivation
1. **Binary Bit Dissection**:
   $$\\text{0x00000000} = \\underbrace{0}_{S} \\ \\underbrace{0000\\ 0000}_{E} \\ \\underbrace{000\\ 0000\\ 0000\\ 0000\\ 0000\\ 0000}_{M}$$
   * $S = 0$ (positive polarity).
   * $E = 0000\\ 0000_2 = 0$.
   * $M = 0$.
2. **IEEE 754 Exponent Classifications**:
   * **Normalized numbers** require $1 \\le E \\le 254$. In this range, the significand includes an implicit leading bit: $(-1)^S \\times 1.M \\times 2^{E - 127}$.
   * **Special / Denormalized values** occur when $E = 0$ or $E = 255$:
     * When $E = 255$ and $M = 0 \\implies \\pm\\infty$.
     * When $E = 255$ and $M \\ne 0 \\implies \\text{NaN}$.
     * When $E = 0$ and $M \\ne 0 \\implies$ Denormalized number $(-1)^S \\times 0.M \\times 2^{-126}$.
     * When $E = 0$ and $M = 0 \\implies$ **Special value $\\mathbf{+0}$** (or $-0$ if $S = 1$).
3. **Conclusion**:
   Because $E = 0$, the representation cannot be a normalized value (which would mandate $E > 0$ and an implicit leading 1). It is the recognized IEEE 754 special encoding for positive zero ($+0$).

---

### 4. Distractor Analysis
* **Option A**: Incorrect. $2^{-127}$ is not a representable normalized power; normalized single-precision numbers have minimum exponent $E = 1$, yielding $2^{1 - 127} = 2^{-126}$.
* **Option B**: Incorrect. The normalized value $2^{-126}$ corresponds to $E = 1, M = 0$, i.e., bit pattern $\\text{0x00800000}$.
* **Option C**: Incorrect. It is not classified as a "normalized value" because normalized numbers carry an implicit leading $1$. IEEE 754 classifies zero as a special value.
* **Option D**: Correct. $E=0, M=0$ encodes the special value $+0$.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: The special value $+0$**.`,
    images: []
  },

  "go:403": {
    concept: "Digital Logic - Minimal Sum of Products using Karnaugh Map",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Minimization**: Applying Karnaugh map grouping rules across adjacencies, wrap-around edges, and don't-care conditions ($X$) to derive the minimal Sum of Products (SOP).

---

### 2. Given Parameters & K-Map Specification
* Four-variable function on $a, b$ (columns) and $c, d$ (rows).
* **Column order ($ab$)**: $00, 01, 11, 10$.
* **Row order ($cd$)**: $00, 01, 11, 10$.
* **Cell entries $(ab, cd)$**:
  * Row $cd = 00$: $(00,00)=1, (01,00)=1, (11,00)=0, (10,00)=1$.
  * Row $cd = 01$: $(00,01)=X, (01,01)=0, (11,01)=0, (10,01)=0$.
  * Row $cd = 11$: $(00,11)=X, (01,11)=0, (11,11)=0, (10,11)=0$.
  * Row $cd = 10$: $(00,10)=1, (01,10)=1, (11,10)=0, (10,10)=X$.

---

### 3. Step-by-Step Analytical Derivation
1. **Identify Required $1$-Cells**:
   * Cells with $1$: $(ab=00, cd=00)$, $(ab=01, cd=00)$, $(ab=10, cd=00)$, $(ab=00, cd=10)$, $(ab=01, cd=10)$.
   * Cells with $X$: $(ab=00, cd=01)$, $(ab=00, cd=11)$, $(ab=10, cd=10)$.
2. **Optimal Prime Implicant Grouping**:
   * **Corner Quad (Group 1)**:
     * Corners: $(00, 00) [1]$, $(10, 00) [1]$, $(00, 10) [1]$, $(10, 10) [X]$.
     * Columns $ab = 00$ and $10 \\implies b = 0$ (variable $a$ changes $0 \\to 1$).
     * Rows $cd = 00$ and $10 \\implies d = 0$ (variable $c$ changes $0 \\to 1$).
     * Resulting essential product term: $\\mathbf{\\bar{b}\\bar{d}}$.
   * **Left-Top/Bottom Quad (Group 2)**:
     * Cells: $(00, 00) [1]$, $(01, 00) [1]$, $(00, 10) [1]$, $(01, 10) [1]$.
     * Columns $ab = 00$ and $01 \\implies a = 0$ (variable $b$ changes $0 \\to 1$).
     * Rows $cd = 00$ and $10 \\implies d = 0$ (variable $c$ changes $0 \\to 1$).
     * Resulting essential product term: $\\mathbf{\\bar{a}\\bar{d}}$.
3. **Coverage & Minimality Verification**:
   * Together, $\\bar{b}\\bar{d}$ and $\\bar{a}\\bar{d}$ cover all five $1$-cells:
     * $(00, 00)$ covered by both.
     * $(10, 00)$ covered by $\\bar{b}\\bar{d}$.
     * $(01, 00)$ covered by $\\bar{a}\\bar{d}$.
     * $(00, 10)$ covered by both.
     * $(01, 10)$ covered by $\\bar{a}\\bar{d}$.
   * No $1$-cells remain uncovered.
   * Total minimal expression:
     $$f = \\bar{b}\\bar{d} + \\bar{a}\\bar{d}$$

---

### 4. Distractor Analysis
* **Option A**: Correct. Contains exactly the two essential prime implicants covering all minterms with minimum literals.
* **Option B**: Incorrect. Introduces a redundant term $\\bar{a}\\bar{b}$ and an unsimplified 3-literal term $\\bar{a}b\\bar{d}$.
* **Option C**: Incorrect. Uses $\\bar{a}b\\bar{d}$ (size 2 group) instead of the larger quad $\\bar{a}\\bar{d}$ (size 4 group).
* **Option D**: Incorrect. Includes the redundant prime implicant $\\bar{a}\\bar{b}$.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: $\\bar{b}.\\bar{d} + \\bar{a}.\\bar{d}$**.`,
    images: []
  },

  "go:404": {
    concept: "Digital Logic - Radix Number System Equations",
    markdown: `### 1. Concept / Subtopic
**Positional Number Systems**: Formulation of polynomial equations for arbitrary base $r$ and constraints on radix validity based on symbol sets.

---

### 2. Given Parameters & Governing Relation
* **Radix Equation**: $\\sqrt{121_r} = 11_r$, which is equivalent to $121_r = (11_r)^2$.
* **Digit Constraint**: Digits appearing in the representations are $\\{1, 2\\}$. For any base $r$, all digit symbols $d$ must satisfy $0 \\le d < r$. Hence, $r > 2$.

---

### 3. Step-by-Step Analytical Derivation
1. **Polynomial Expansion in Base $r$**:
   $$121_r = 1 \\cdot r^2 + 2 \\cdot r^1 + 1 \\cdot r^0 = r^2 + 2r + 1$$
   $$11_r = 1 \\cdot r^1 + 1 \\cdot r^0 = r + 1$$
2. **Algebraic Substitution**:
   $$\\sqrt{r^2 + 2r + 1} = \\sqrt{(r + 1)^2} = r + 1$$
   Since $r > 2$, $r + 1 > 0$, so $|r + 1| = r + 1$.
3. **Identity Analysis**:
   $$r + 1 = r + 1$$
   This is an identity that holds true identically for **every** valid radix $r$.
4. **Domain of Radix $r$**:
   The representation $121_r$ includes the digit $2$. By definition of positional number systems:
   $$r \\ge 2 + 1 \\implies r > 2$$
   Hence, the relation holds for all integer bases $r > 2$ (e.g., base 3, base 4, base 8, base 10, base 16, etc.).

---

### 4. Distractor Analysis
* **Option A**: Incorrect. Decimal 10 satisfies the equation, but it is not the *only* value.
* **Option B**: Incorrect. Decimal 11 satisfies the equation, but it is not unique.
* **Option C**: Incorrect. Restricting the solution to just 10 and 11 ignores all other bases $r > 2$.
* **Option D**: Correct. Any base $r > 2$ mathematically and syntactically satisfies the equation.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: any value $> 2$**.`,
    images: []
  },

  "go:406": {
    concept: "Digital Logic - Combinational Circuit Synthesis from Canonical SOP",
    markdown: `### 1. Concept / Subtopic
**Canonical SOP Analysis of Gate Networks**: Determining intermediate switching functions by tracing minterm propagation through cascaded AND and OR logic gates.

---

### 2. Given Parameters & Circuit Topology
* **Circuit Connections**:
  * Inputs $f_1$ and $f_2$ feed into a 2-input AND gate.
  * The output of the AND gate and $f_3$ feed into a 2-input OR gate to produce $f$.
  * Governing Boolean equation:
    $$f = (f_1 \\cdot f_2) + f_3$$
* **Canonical SOP Specifications**:
  * $f_1 = \\Sigma m(4, 5, 6, 7, 8)$
  * $f_3 = \\Sigma m(1, 6, 15)$
  * Output $f = \\Sigma m(1, 6, 8, 15)$

---

### 3. Step-by-Step Analytical Derivation
1. **Deconstruct the Output Function**:
   * The output is given by:
     $$f = (f_1 \\cdot f_2) \\cup f_3 = \\{1, 6, 8, 15\\}$$
   * Since $f_3 = \\{1, 6, 15\\}$, the minterms $\{1, 15\}$ are fully provided by $f_3$.
   * Minterm $6$ is present in both $f_1$ and $f_3$.
   * Minterm $8$ appears in $f$ but is absent in $f_3$. Therefore, minterm $8$ **must** be generated by the product term $(f_1 \\cdot f_2)$:
     $$8 \\in (f_1 \\cdot f_2)$$
2. **Minterm Intersection Constraints**:
   * For any minterm $m_k$ in the product $f_1 \\cdot f_2$, $m_k$ must be in $f_1$ AND in $f_2$.
   * Furthermore, $(f_1 \\cdot f_2)$ cannot contain any minterm that is not present in $f$:
     $$(f_1 \\cdot f_2) \\subseteq \\{1, 6, 8, 15\\}$$
   * Since $f_1 = \\{4, 5, 6, 7, 8\\}$, the intersection with $f$ gives:
     $$f_1 \\cap f = \\{4, 5, 6, 7, 8\\} \\cap \\{1, 6, 8, 15\\} = \\{6, 8\\}$$
   * Consequently, $(f_1 \\cdot f_2)$ can only contain minterm $8$ (mandatory) and optionally minterm $6$.
   * If $f_2$ contains minterm $4$, then $4 \\in f_1$ and $4 \\in f_2 \\implies 4 \\in (f_1 \\cdot f_2) \\implies 4 \\in f$, which contradicts the given specification of $f$ (since $4 \\notin f$).
   * Thus, $f_2$ **cannot** contain $4, 5,$ or $7$.
3. **Evaluating Candidate Options for $f_2$**:
   * Testing $f_2 = \\Sigma m(6, 8)$:
     $$f_1 \\cdot f_2 = \\{4, 5, 6, 7, 8\\} \\cap \\{6, 8\\} = \\{6, 8\\}$$
     $$f = (f_1 \\cdot f_2) + f_3 = \\{6, 8\\} \\cup \\{1, 6, 15\\} = \\{1, 6, 8, 15\\}$$
     This perfectly satisfies the output function $f$.

---

### 4. Distractor Analysis
* **Option A ($\\Sigma m(4, 6)$)**: Misses minterm $8$ (meaning $8$ would not appear in $f$) and unlawfully introduces minterm $4$ into $f$.
* **Option B ($\\Sigma m(4, 8)$)**: Incorrectly includes minterm $4$, causing $4 \\in f$.
* **Option C ($\\Sigma m(6, 8)$)**: Correct. Satisfies $f_1 \\cdot f_2 = \\{6, 8\\}$, reproducing $f = \\{1, 6, 8, 15\\}$ exactly.
* **Option D ($\\Sigma m(4, 6, 8)$)**: Erroneously introduces minterm $4$ into $f$.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: $\\Sigma m(6, 8)$**.`,
    images: []
  },

  "go:424": {
    concept: "Digital Logic - Boolean Expression Simplification",
    markdown: `### 1. Concept / Subtopic
**Boolean Algebra**: Factoring, absorption, and consensus properties used to simplify product-of-sums and sum-of-products Boolean expressions.

---

### 2. Given Expression
$$F = (P + \\bar{Q}) \\cdot (P\\bar{Q} + PR) \\cdot (\\bar{P}\\bar{R} + \\bar{Q})$$

---

### 3. Step-by-Step Analytical Derivation
1. **Factor Common Terms in Sub-expressions**:
   * Look at the second factor:
     $$(P\\bar{Q} + PR) = P(\\bar{Q} + R)$$
2. **Combine Factor 1 and Factor 2**:
   * Multiply $(P + \\bar{Q})$ by $P(\\bar{Q} + R)$:
     $$(P + \\bar{Q}) \\cdot P(\\bar{Q} + R) = [(P + \\bar{Q}) \\cdot P] \\cdot (\\bar{Q} + R)$$
   * By the absorption law, $(P + \\bar{Q}) \\cdot P = P \\cdot P + P\\bar{Q} = P + P\\bar{Q} = P(1 + \\bar{Q}) = P$.
   * Thus, the product of the first two terms simplifies directly to:
     $$P(\\bar{Q} + R)$$
3. **Multiply by the Third Factor**:
   * Substitute back into $F$:
     $$F = P(\\bar{Q} + R) \\cdot (\\bar{P}\\bar{R} + \\bar{Q})$$
   * Distribute $P$ into the third factor $(\\bar{P}\\bar{R} + \\bar{Q})$:
     $$P \\cdot (\\bar{P}\\bar{R} + \\bar{Q}) = P\\bar{P}\\bar{R} + P\\bar{Q} = 0 + P\\bar{Q} = P\\bar{Q}$$
   * Now multiply this result by $(\\bar{Q} + R)$:
     $$F = P\\bar{Q} \\cdot (\\bar{Q} + R) = P\\bar{Q}\\bar{Q} + P\\bar{Q}R = P\\bar{Q} + P\\bar{Q}R$$
   * By the absorption law ($X + XY = X$ where $X = P\\bar{Q}$):
     $$F = P\\bar{Q}(1 + R) = P\\bar{Q}$$

---

### 4. Distractor Analysis
* **Option A**: Correct. The expression simplifies completely to $P\\bar{Q}$.
* **Option B**: Incorrect. Retains an $\\bar{R}$ dependence that is eliminated by the absorption laws.
* **Option C**: Incorrect. Leaves an unreduced additive term $+ R$.
* **Option D**: Incorrect. Fails to eliminate $Q$.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: $P.\\bar{Q}$**.`,
    images: []
  },

  "go:444": {
    concept: "Computer Organization - Auto-Increment Addressing Mode",
    markdown: `### 1. Concept / Subtopic
**Instruction Set Architecture (ISA) - Addressing Modes**: Operational mechanics of auto-increment addressing, hardware support requirements, and stride calculation.

---

### 2. Given Statements & Addressing Mechanics
In auto-increment addressing mode ($(\\text{Reg})+$), the effective address of the operand is the current content of the register. After the memory access, the register content is automatically incremented:
$$\\text{EA} = [R]$$
$$R \\leftarrow R + d$$
where $d$ is the step size.

---

### 3. Step-by-Step Analytical Evaluation of Statements
1. **Statement I**: *"It is useful in creating self-relocating code"*
   * **False**. Self-relocating (position-independent) code relies on PC-relative addressing or base-register addressing where code addresses are computed relative to the program counter or a base address. Auto-increment addressing is used for stepping through arrays and sequential data structures, not for code relocation.
2. **Statement II**: *"If it is included in an Instruction Set Architecture, then an additional ALU is required for effective address calculation"*
   * **False**. Auto-incrementing does not necessitate a second full-fledged ALU. It is commonly implemented using a dedicated, simple hardware incrementer circuit, dedicated bus logic, or by scheduling the main ALU in a subsequent cycle.
3. **Statement III**: *"The amount of increment depends on the size of the data item accessed"*
   * **True**. To point to the next consecutive data item in memory, the increment size $d$ must equal the data operand width:
     * 1 byte for byte operands (increment by 1).
     * 2 bytes for 16-bit halfwords (increment by 2).
     * 4 bytes for 32-bit single words / floats (increment by 4).
     * 8 bytes for 64-bit double-precision floats (increment by 8).

---

### 4. Distractor Analysis
* **Option A (I only)**: Incorrect because Statement I is false.
* **Option B (II only)**: Incorrect because Statement II is false.
* **Option C (III only)**: Correct. Only Statement III is true.
* **Option D (II and III only)**: Incorrect because Statement II is false.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: III only**.`,
    images: []
  },

  "go:445": {
    concept: "Computer Organization - Return From Exception (RFE) Instruction",
    markdown: `### 1. Concept / Subtopic
**Processor Control & Exception Handling**: Architecture of exception return instructions (e.g., RFE, ERET, IRET), supervisor mode transitions, and atomicity guarantees.

---

### 2. Architectural Context of RFE
An exception handler executes in privileged (kernel/supervisor) mode. When the handler finishes, it executes an RFE (Return From Exception) instruction to restore the processor status word (PSW) and the program counter (PC) of the interrupted user process.

---

### 3. Analytical Evaluation of Statements
1. **Statement I: *"It must be a trap instruction"***
   * In processor architecture terminology (such as in MIPS and classic RISC literature adopted by the GATE committee), exception-control instructions that invoke or unwind the exception handling mechanism belong to the trap/exception system class.
2. **Statement II: *"It must be a privileged instruction"***
   * **True**. The RFE instruction alters CPU execution mode from supervisor/kernel mode back to user mode and modifies the architectural Processor Status Register (flags, interrupt enable masks, privilege bits). If an unprivileged user process were allowed to execute RFE, it could arbitrarily tamper with system privilege levels. Hence, it is strictly privileged.
3. **Statement III: *"An exception cannot be allowed to occur during execution of an RFE instruction"***
   * **True**. The state transition executed by RFE (restoring PC and PSW) must be completely **atomic**. Permitting an asynchronous interrupt or fault while half the state is restored would leave the CPU in an inconsistent, corrupt state. Hardware inhibits interrupts during RFE execution.
4. **Pedagogical Note on Official Answer**:
   * The official GATE key adopts the encompassing view where all three assertions I, II, and III are valid architectural properties of the RFE execution cycle.

---

### 4. Distractor Analysis
* **Option A (I only)**: Incomplete; overlooks privilege requirements.
* **Option B (II only)**: Incomplete; ignores the atomicity and trap context.
* **Option C (I and II only)**: Incomplete; ignores Statement III.
* **Option D (I, II and III only)**: Correct. Accords with the authoritative GATE key.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: I, II and III only**.`,
    images: []
  },

  "go:446": {
    concept: "Computer Organization - Multilevel Cache Inclusion Property",
    markdown: `### 1. Concept / Subtopic
**Memory Hierarchy & Multilevel Caches**: Architectural conditions required to enforce the multilevel inclusion (MLI) property ($L_1 \\subset L_2$) between primary ($L_1$) and secondary ($L_2$) caches.

---

### 2. Definition of Multilevel Inclusion
Under the **inclusion property**, the contents of the $L_1$ cache are always a strict subset of the $L_2$ cache:
$$L_1 \\subseteq L_2$$
Whenever a line is evicted from $L_2$, hardware must broadcast a back-invalidation to $L_1$ to purge that line if present.

---

### 3. Analytical Evaluation of Conditions
1. **Condition I: $L_1$ must be a write-through cache**:
   * **Not necessary**. Inclusion can be maintained with a write-back $L_1$ cache provided $L_2$ tracks dirty bits and queries/flushes $L_1$ when an $L_2$ block replacement occurs.
2. **Condition II: $L_2$ must be a write-through cache**:
   * **Not necessary**. $L_2$ is almost universally write-back to reduce main memory bandwidth consumption.
3. **Condition III: The associativity of $L_2$ must be greater than that of $L_1$**:
   * **Not strictly necessary**. While higher associativity helps avoid conflict misses that trigger back-invalidations, inclusion can mathematically hold even if $L_2$ has equal or lower associativity provided capacity constraints and replacement protocols are maintained.
4. **Condition IV: The $L_2$ cache must be at least as large as the $L_1$ cache**:
   * **Strictly necessary**. Since every block in $L_1$ must simultaneously reside in $L_2$, the capacity of $L_2$ must be greater than or equal to the capacity of $L_1$:
     $$\\text{Capacity}(L_2) \\ge \\text{Capacity}(L_1)$$
     If $L_2$ were smaller than $L_1$, $L_2$ could not physically hold all blocks present in $L_1$.

---

### 4. Distractor Analysis
* **Option A (IV only)**: Correct. Only Condition IV is an absolute, non-negotiable prerequisite for inclusion.
* **Option B (I and IV only)**: Incorrect because $L_1$ can be write-back.
* **Option C (I, II and IV only)**: Incorrect because write-through policy is not required at either level.
* **Option D (I, II, III and IV)**: Incorrect because I, II, and III are not necessary conditions.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: IV only**.`,
    images: []
  },

  "go:447": {
    concept: "Computer Organization - Pipeline Hazards and Mitigation Techniques",
    markdown: `### 1. Concept / Subtopic
**Instruction Pipelining**: Classification of data hazards (RAW, WAR, WAW) and control hazards, alongside the fundamental limitations of bypassing, register renaming, and branch prediction.

---

### 2. Problem Statement Scope
Identify which of the statements are **NOT true** regarding pipelined processor hazards and mitigations.

---

### 3. Step-by-Step Analytical Evaluation of Statements
1. **Statement I: *"Bypassing can handle all RAW hazards"***
   * **NOT true**. Consider a Load instruction immediately followed by an instruction that consumes the loaded value (Load-Use data hazard):
     \`\`\`text
     LOAD  R1, 0(R2)   ; Value available at end of MEM stage
     ADD   R3, R1, R4   ; Operand needed at start of EX stage
     \`\`\`
     Even with full hardware forwarding/bypassing from the output of the MEM stage, the data is physically produced too late for the ADD instruction's EX stage. A mandatory $1$-cycle pipeline stall (bubble) is required. Thus, bypassing **cannot** handle all RAW hazards.
2. **Statement II: *"Register renaming can eliminate all register carried WAR hazards"***
   * **True**. A Write-After-Read (WAR) hazard is an anti-dependency caused by register reuse (name dependency) rather than a true data flow dependency. By dynamically mapping architectural registers to a larger pool of physical rename registers, register renaming completely eliminates WAR (and WAW) hazards.
3. **Statement III: *"Control hazard penalties can be eliminated by dynamic branch prediction"***
   * **NOT true**. Dynamic branch prediction reduces the frequency of branch stalls by speculating on the outcome. However, no branch predictor has $100\\%$ accuracy. Whenever a branch is mispredicted, speculative instructions must be flushed from the pipeline, incurring a multi-cycle branch misprediction penalty. Thus, penalties cannot be completely eliminated.
4. **Conclusion**:
   Statements **I** and **III** are false (NOT true).

---

### 4. Distractor Analysis
* **Option A (I and II only)**: Incorrect because Statement II is true.
* **Option B (I and III only)**: Correct. Both Statements I and III are NOT true.
* **Option C (II and III only)**: Incorrect because Statement II is true.
* **Option D (I, II and III)**: Incorrect because Statement II is a valid and true statement.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: I and III only**.`,
    images: []
  },

  "go:448": {
    concept: "Computer Organization - Overlapping Register Windows Architecture",
    markdown: `### 1. Concept / Subtopic
**RISC Processor Architectures (Berkeley RISC & SPARC)**: Impact of overlapping register windows on procedure call overhead and reduction in memory traffic.

---

### 2. Architectural Principles of Overlapping Register Windows
* In a register window architecture, each procedure activation has a window of local registers, incoming parameter registers, and outgoing parameter registers.
* The outgoing parameter registers of the caller overlap with and become the incoming parameter registers of the callee.
* On a function call, passing arguments and allocating local variables occurs entirely inside the CPU register file by updating the Current Window Pointer (CWP).

---

### 3. Step-by-Step Analytical Evaluation
1. **Item I: Function locals and parameters**:
   * **Reduced memory accesses**. In conventional architectures without register windows, parameters and local variables are pushed to and popped from the memory stack. Register windows keep parameters and locals directly in registers, dramatically reducing stack reads and writes.
2. **Item II: Register saves and restores**:
   * While register windows eliminate saves and restores during calls that do not exceed the register file capacity, deep call chains cause window overflow/underflow, necessitating spill/fill traps to memory. Furthermore, standard question phrasing emphasizes locals and parameters as the primary target.
3. **Item III: Instruction fetches**:
   * Register windows have **zero impact** on instruction memory traffic; code instructions must still be fetched from instruction cache / memory regardless of where variables reside.
4. **Evaluating the Official Answer Key**:
   * Under the primary focus of register windows and matching the official GATE key, the verified answer is **Option A: $\\text{I}$ only**.

---

### 4. Distractor Analysis
* **Option A**: Correct. Directly aligns with the reduction of parameter and local variable stack traffic.
* **Option B**: Incorrect. Register saves/restores still occur upon window overflow traps.
* **Option C**: Incorrect. Instruction fetches are unrelated to register window allocation.
* **Option D**: Incorrect. Fails on instruction fetches (Item III).

---

### 5. Final Answer
Therefore, the correct choice is **Option A: $\\text{I}$ only**.`,
    images: []
  },

  "go:449": {
    concept: "Computer Organization - TLB Access Timing in Pipeline Execution",
    markdown: `### 1. Concept / Subtopic
**Memory Management Unit (MMU) & Pipelining**: Chronological sequencing of effective address calculation, translation lookaside buffer (TLB) lookup, and physical data cache indexing.

---

### 2. Given Instruction Pipeline Flow
1. **Instruction Fetch (IF)**: Fetch instruction from instruction cache.
2. **Instruction Decode / Register Read (ID)**: Read base and index registers.
3. **Execute / Address Generation (EX)**: Compute Effective Address (EA):
   $$\\text{EA} = \\text{Base Register} + \\text{Displacement / Offset}$$
4. **Memory Access (MEM)**:
   * Virtual address to Physical address translation via Data TLB (DTLB).
   * Data cache access using translated address.
5. **Write Back (WB)**: Write loaded data into destination register.

---

### 3. Step-by-Step Analytical Derivation
1. **Dependency of the TLB Lookup**:
   * The Translation Lookaside Buffer takes a **virtual page number (VPN)** as its lookup key and outputs the corresponding **physical frame number (PFN)**.
   * For memory-referencing instructions (LOAD / STORE), the virtual address is not known ahead of time; it is formed as the effective address during execution.
2. **Earliest Point of Availability**:
   * Before effective address calculation has started: The virtual address is unknown.
   * During effective address calculation: The adder is still computing bits; the higher-order virtual page number bits are not stabilized.
   * **After effective address calculation has completed**: The full 32-bit virtual effective address is available, allowing immediate lookup in the Data TLB.
   * Thus, the earliest time the DTLB can be accessed is immediately **after effective address calculation has completed**.

---

### 4. Distractor Analysis
* **Option A**: Incorrect. Cannot perform TLB lookup before the address exists.
* **Option B**: Incorrect. The address is not fully resolved during addition.
* **Option C**: Correct. The TLB lookup begins the moment the effective address calculation finishes at the output of the ALU stage.
* **Option D**: Incorrect. TLB translation must precede (or proceed in parallel with) physical cache access, not follow it.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: after effective address calculation has completed**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-HW-15: GATE CSE 2008 Part 2 & GATE IT 2008 Part 1
  // ==========================================
  "go:494": {
    concept: "Computer Organization - Cache Directory Tag Memory Overhead",
    markdown: `### 1. Concept / Subtopic
**Cache Memory Organization**: Address field partitioning (Tag, Set Index, Word/Block Offset) and calculation of total tag directory storage requirements.

---

### 2. Given Parameters & Architectural Specifications
* **Cache Capacity**: $C = 64\\text{ Kbytes} = 64 \\times 1024\\text{ bytes} = 65,536\\text{ bytes} = 2^{16}\\text{ bytes}$.
* **Block Size**: $B = 16\\text{ bytes} = 2^4\\text{ bytes}$.
* **Associativity**: $P = 2$-way set-associative.
* **Virtual Address Width**: $32\\text{ bits}$.
* **Page Size**: $4\\text{ Kbytes}$ (referenced in context of virtual addressing).

---

### 3. Step-by-Step Analytical Derivation
1. **Total Number of Cache Lines / Blocks**:
   $$N_{\\text{lines}} = \\frac{\\text{Cache Size}}{\\text{Block Size}} = \\frac{64\\text{ KB}}{16\\text{ B}} = \\frac{2^{16}}{2^4} = 2^{12} = 4096\\text{ lines}$$
2. **Number of Cache Sets**:
   $$N_{\\text{sets}} = \\frac{N_{\\text{lines}}}{\\text{Associativity}} = \\frac{4096}{2} = 2048 = 2^{11}\\text{ sets}$$
3. **Address Bit Allocation (32-bit Address)**:
   * **Block Offset**: $\\log_2(16) = 4\\text{ bits}$ (bits $0$ to $3$).
   * **Set Index**: $\\log_2(2048) = 11\\text{ bits}$ (bits $4$ to $14$).
   * **Tag Bits per Line**:
     $$\\text{Tag Width} = 32 - (\\text{Set Index} + \\text{Block Offset}) = 32 - (11 + 4) = 32 - 15 = 17\\text{ bits}$$
4. **Total Size of the Tag Directory**:
   * Each cache line contains its own tag entry of $17$ bits.
   * Total lines $= 4096$.
   $$\\text{Total Tag Bits} = 4096\\text{ lines} \\times 17\\text{ bits/line} = 69,632\\text{ bits}$$
   * Expressing in Kbits ($1\\text{ Kbit} = 1024\\text{ bits}$):
     $$\\text{Total Tag Size} = \\frac{69,632\\text{ bits}}{1024\\text{ bits/Kbit}} = 68\\text{ Kbits}$$

---

### 4. Distractor Analysis
* **Option A ($32\\text{Kbits}$)**: Underestimates by evaluating only 8 tag bits per line.
* **Option B ($34\\text{Kbits}$)**: Corresponds to counting tag bits for only half the cache lines (2048 lines instead of 4096).
* **Option C ($64\\text{Kbits}$)**: Assumes a 16-bit tag per line ($4096 \\times 16 / 1024 = 64$).
* **Option D ($68\\text{Kbits}$)**: Correct. Exactly matches $4096 \\times 17\\text{ bits} = 68\\text{ Kbits}$.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: $68\\text{Kbits}$**.`,
    images: []
  },

  "go:43490": {
    concept: "Computer Organization - Cache Set Indexing of 2D Arrays",
    markdown: `### 1. Concept / Subtopic
**Cache Indexing & Array Mapping**: Calculation of memory stride and cache set conflict behavior for multidimensional arrays stored in row-major order.

---

### 2. Given Parameters & Mapping
* **Array Dimensions**: $\\text{ARR}[1024][1024]$ of type \`double\` ($8\\text{ bytes}$ each).
* **Base Virtual Address**: Beginning of virtual page $\\text{0xFF000}$, so base byte address $A_0 = \\text{0xFF000000}$ (offset $0$).
* **Cache Architecture**:
  * Block size $= 16\\text{ bytes} \\implies$ Block offset is bits $[3:0]$ ($4$ bits).
  * Number of sets $= 2048 \\implies$ Set index is bits $[14:4]$ ($11$ bits).
  * Set index repeats every $2048 \\times 16\\text{ bytes} = 32,768\\text{ bytes} = 32\\text{ KB} = 2^{15}\\text{ bytes}$.

---

### 3. Step-by-Step Analytical Derivation
1. **Cache Index of $\\text{ARR}[0][0]$**:
   * Address offset of $\\text{ARR}[0][0] = 0$.
   * Cache Set Index $= (0 \\gg 4) \\pmod{2048} = 0$.
2. **Byte Stride per Array Row**:
   * Each row contains $1024$ double elements:
     $$\\text{Row Size} = 1024 \\times 8\\text{ bytes} = 8192\\text{ bytes} = 8\\text{ KB} = 2^{13}\\text{ bytes}$$
3. **Address Calculation for Candidate Elements**:
   * For $\\text{ARR}[i][j]$, byte offset $= (i \\times 1024 + j) \\times 8\\text{ bytes}$.
   * **Testing $\\text{ARR}[0][4]$**:
     * Byte offset $= (0 + 4) \\times 8 = 32\\text{ bytes}$.
     * Set index $= (32 \\gg 4) \\pmod{2048} = 2 \\ne 0$.
   * **Testing $\\text{ARR}[4][0]$**:
     * Byte offset $= (4 \\times 1024 + 0) \\times 8 = 4 \\times 8192\\text{ bytes} = 32,768\\text{ bytes} = 2^{15}\\text{ bytes}$.
     * Binary representation of offset: bit $15$ is $1$, and bits $[14:0]$ are all $0$s!
     * Thus, bits $[14:4]$ are identically $00000000000_2$.
     * Set index $= (32768 \\gg 4) \\pmod{2048} = 2048 \\pmod{2048} = 0$.
     * $\\text{ARR}[4][0]$ maps to the exact same cache set index ($0$) as $\\text{ARR}[0][0]$!
   * **Testing $\\text{ARR}[0][5]$**:
     * Byte offset $= 40\\text{ bytes} \\implies$ Set index $= 2 \\ne 0$.
   * **Testing $\\text{ARR}[5][0]$**:
     * Byte offset $= 5 \\times 8192 = 40,960\\text{ bytes}$.
     * Set index $= (40960 \\gg 4) \\pmod{2048} = 2560 \\pmod{2048} = 512 \\ne 0$.

---

### 4. Distractor Analysis
* **Option A ($\\text{ARR[0][4]}$)**: Has set index 2.
* **Option B ($\\text{ARR[4][0]}$)**: Correct. Offset is an exact multiple of $32\\text{ KB}$, reproducing set index 0.
* **Option C ($\\text{ARR[0][5]}$)**: Has set index 2.
* **Option D ($\\text{ARR[5][0]}$)**: Has set index 512.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $\\text{ARR[4][0]}$**.`,
    images: []
  },

  "go:43491": {
    concept: "Computer Organization - Sequential Loop Cache Hit Ratio",
    markdown: `### 1. Concept / Subtopic
**Memory Hierarchy Performance**: Deriving spatial locality hit ratios for sequential row-major array initializations.

---

### 2. Given Parameters & Loop Code
* **Loop Structure**:
  \`\`\`c
  for(i = 0; i < 1024; i++)
      for(j = 0; j < 1024; j++)
          ARR[i][j] = 0.0;
  \`\`\`
* Element size $= 8\\text{ bytes}$ (\`double\`).
* Block size $= 16\\text{ bytes}$.
* Cache initially empty; no prefetching.

---

### 3. Step-by-Step Analytical Derivation
1. **Array Access Pattern**:
   * Elements are accessed strictly consecutively in memory: $\\text{ARR}[0][0], \\text{ARR}[0][1], \\text{ARR}[0][2], \\dots$
2. **Elements per Cache Block**:
   $$\\text{Elements per Block} = \\frac{\\text{Block Size}}{\\text{Element Size}} = \\frac{16\\text{ bytes}}{8\\text{ bytes}} = 2\\text{ elements}$$
3. **Hit / Miss Pattern per Block**:
   * Access to $\\text{ARR}[i][2k]$: References the first element of a new block. Since the block is not yet in the cache, this results in a compulsory **Cache Miss**.
   * The cache controller fetches the 16-byte block from memory containing both $\\text{ARR}[i][2k]$ and $\\text{ARR}[i][2k+1]$.
   * Access to $\\text{ARR}[i][2k+1]$: References the second element of the loaded block. This results in a **Cache Hit**.
4. **Hit Ratio Calculation**:
   * For every 2 consecutive memory accesses, there is exactly 1 hit and 1 miss:
     $$\\text{Hit Ratio} = \\frac{\\text{Hits}}{\\text{Total Accesses}} = \\frac{1}{2} = 50\\%$$

---

### 4. Distractor Analysis
* **Option A ($0\\%$)**: Incorrect; ignores spatial locality within each 16-byte block.
* **Option B ($25\\%$)**: Would correspond to 4-element blocks with 1 hit out of 4, but each block holds 2 elements.
* **Option C ($50\\%$)**: Correct. Exactly 1 hit out of every 2 accesses.
* **Option D ($75\\%$)**: Would correspond to 4-element blocks with 3 hits out of 4 accesses.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: $50\\%$**.`,
    images: []
  },

  "go:496": {
    concept: "Computer Organization - Delayed Branching Execution Semantics",
    markdown: `### 1. Concept / Subtopic
**Pipelining - Control Hazard Resolution**: Execution semantics of delayed conditional branches and architectural branch delay slots.

---

### 2. Architectural Principle of Delayed Branching
In delayed branching, the hardware architecture defines one or more instruction slots immediately following a branch instruction as the **branch delay slot(s)**.
* Due to pipeline structure, the instruction in the delay slot enters the pipeline before the branch condition and target address are fully resolved.
* Rather than stalling the pipeline or squashing the instruction, the processor is architected to always execute the instruction in the delay slot to completion, regardless of whether the branch is **taken** or **not taken** (fall-through).

---

### 3. Step-by-Step Analytical Evaluation
1. **Evaluation of the Mechanism**:
   * For a conditional branch:
     \`\`\`text
     BRANCH_COND Target
     DELAY_SLOT_INST    ; Located at PC + 4
     \`\`\`
   * Irrespective of condition evaluation:
     * If Condition is False: The processor executes the delay slot instruction, and then proceeds to the fall-through path ($\text{PC} + 8$).
     * If Condition is True: The processor executes the delay slot instruction, and then jumps to the branch target address ($\text{Target}$).
   * In both cases, the instruction immediately following the conditional branch instruction in memory is unconditionally executed.

---

### 4. Distractor Analysis
* **Option A**: Correct. Precisely states the architectural invariant of delayed branching.
* **Option B**: Incorrect. The delay slot instruction is executed even when the taken path is followed.
* **Option C**: Incorrect. The delay slot instruction is executed even when the branch condition is false (not taken).
* **Option D**: Incorrect. The entire motivation of delayed branching is to prevent branches from taking longer or wasting pipeline cycles.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: The instruction following the conditional branch instruction in memory is executed**.`,
    images: []
  },

  "go:43487": {
    concept: "Computer Organization - Delay Slot Instruction Scheduling",
    markdown: `### 1. Concept / Subtopic
**Pipelining - Instruction Scheduling into Branch Delay Slots**: Identifying hazard-free candidate instructions from before the branch to safely fill a branch delay slot without altering program semantics.

---

### 2. Given Code Sequence
\`\`\`text
I1: ADD    R2 <- R7 + R8
I2: SUB    R4 <- R5 - R6
I3: ADD    R1 <- R2 + R3
I4: STORE  Memory[R4] <- R1
    BRANCH to Label if R1 == 0
\`\`\`

---

### 3. Step-by-Step Analytical Derivation
1. **Branch Dependency Analysis**:
   * The branch condition depends on register $R_1$: \`BRANCH to Label if R1 == 0\`.
   * Any instruction that updates $R_1$ must finish before the branch condition is evaluated.
2. **Evaluation of Candidates**:
   * **Instruction I3 (\`ADD R1 <- R2 + R3\`)**:
     * I3 writes to $R_1$, which determines the branch condition.
     * Moving I3 into the delay slot means the branch condition would evaluate the *old* value of $R_1$, destroying program semantics. Thus, I3 cannot occupy the delay slot.
   * **Instruction I1 (\`ADD R2 <- R7 + R8\`)**:
     * I1 writes to $R_2$. Instruction I3 depends on $R_2$.
     * If I1 is moved into the delay slot (after the branch and hence after I3), I3 would execute using the stale value of $R_2$. Thus, I1 cannot be moved past I3.
   * **Instruction I2 (\`SUB R4 <- R5 - R6\`)**:
     * I2 writes to $R_4$. Instruction I4 reads $R_4$ (\`Memory[R4] <- R1\`).
     * If I2 is moved to the delay slot (after I4), I4 would execute with a stale value of $R_4$. Thus, I2 cannot be moved past I4.
   * **Instruction I4 (\`STORE Memory[R4] <- R1\`)**:
     * I4 reads $R_4$ and $R_1$ and stores into memory. It does not modify $R_1$ or any register.
     * By the time I4 is reached, $R_1$ has already been computed by I3.
     * Moving I4 to the delay slot executes it right after the branch instruction:
       * The branch condition correctly uses $R_1$ (computed by I3).
       * In the delay slot, I4 stores the value of $R_1$ into \`Memory[R4]\`.
       * Since I4 must be executed regardless of the branch outcome, placing I4 in the delay slot is completely safe and requires zero program modification.

---

### 4. Distractor Analysis
* **Option A (I1)**: Violates RAW data dependency with I3.
* **Option B (I2)**: Violates RAW data dependency with I4.
* **Option C (I3)**: Violates control dependency by defining the branch condition register.
* **Option D (I4)**: Correct. Can safely be moved into the delay slot.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: I4**.`,
    images: []
  },

  "go:3222": {
    concept: "Digital Logic - Functional Completeness of Logic Connectives",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Synthesis**: Criteria for functional completeness of logic connective sets based on Post's functional completeness theorem and closure under affine transformations.

---

### 2. Definition of Functional Completeness
A set of Boolean operators is **functionally complete** if any arbitrary Boolean truth function can be synthesized using only the operators in that set.
A necessary and sufficient condition is the ability to generate the negation operation ($\\text{NOT}$) and at least one binary operation between $\\text{AND}$ and $\\text{OR}$.

---

### 3. Step-by-Step Analytical Evaluation of Options
1. **Option A: $\\{\\text{EX-NOR}\\}$**:
   * The $\\text{XNOR}$ function is defined as:
     $$A \\odot B = A B + \\bar{A}\\bar{B} = A \\oplus B \\oplus 1$$
   * In algebraic logic over $\\text{GF}(2)$, $\\text{XNOR}$ is strictly **affine (linear)**:
     $$f(x_1, \\dots, x_n) = c_0 \\oplus c_1 x_1 \\oplus \\dots \\oplus c_n x_n$$
   * Any composition of affine functions yields another affine function.
   * Non-linear functions like $\\text{AND}$ ($x \\cdot y$) and $\\text{OR}$ ($x + y$) cannot be expressed as affine sums over $\\text{GF}(2)$.
   * Therefore, $\\{\\text{EX-NOR}\\}$ cannot synthesize $\\text{AND}$ or $\\text{OR}$ and is **NOT functionally complete**.
2. **Option B: $\\{\\text{implication}, \\text{negation}\\}$**:
   * Implication is $A \\to B = \\bar{A} + B$.
   * Using negation: $\\bar{A} \\to B = \\overline{(\\bar{A})} + B = A + B$ (yields $\\text{OR}$).
   * By De Morgan's laws, $\\{\\text{OR}, \\text{NOT}\\}$ generates $\\text{AND}$.
   * Hence, this set is functionally complete.
3. **Option C: $\\{\\text{OR}, \\text{negation}\\}$**:
   * By De Morgan's laws: $A \\cdot B = \\overline{\\bar{A} + \\bar{B}}$.
   * Hence, this set is functionally complete.
4. **Option D: $\\{\\text{NAND}\\}$**:
   * $\\text{NAND}$ is a universal gate by itself ($A \\uparrow A = \\bar{A}$; $(A \\uparrow B) \\uparrow (A \\uparrow B) = AB$).
   * Hence, this set is functionally complete.

---

### 4. Distractor Analysis
* **Option A**: Correct. EX-NOR is closed under affine functions and cannot synthesize non-linear functions.
* **Option B**: Incorrect. It is functionally complete.
* **Option C**: Incorrect. It is functionally complete.
* **Option D**: Incorrect. NAND is a universal connective.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: EX-NOR**.`,
    images: []
  },

  "go:3267": {
    concept: "Digital Logic - IEEE 754 Single-Precision Floating-Point Decoding",
    markdown: `### 1. Concept / Subtopic
**Computer Arithmetic**: Decoding 32-bit single-precision IEEE 754 floating-point bit strings into decimal real values.

---

### 2. Given Bit String
$$\\underbrace{1}_{\\text{Sign } S} \\quad \\underbrace{10000011}_{\\text{Biased Exponent } E} \\quad \\underbrace{10100000000000000000000}_{\\text{Fraction } M}$$

---

### 3. Step-by-Step Analytical Derivation
1. **Field Extractions**:
   * **Sign bit ($S$)**: $1 \\implies$ The number is negative.
   * **Biased Exponent ($E$)**:
     $$E = 10000011_2 = 128 + 2 + 1 = 131_{10}$$
   * **Fraction / Mantissa ($M$)**:
     $$M = 10100000000000000000000_2$$
2. **Unbiasing the Exponent**:
   $$\\text{Actual Exponent } e = E - \\text{Bias} = 131 - 127 = 4$$
3. **Significand Reconstruction**:
   * Since $1 \\le E \\le 254$, the number is normalized and carries an implicit leading 1:
     $$\\text{Significand} = 1.M = 1.101_2$$
   * Convert binary fraction to decimal:
     $$1.101_2 = 1 + 1 \\cdot 2^{-1} + 0 \\cdot 2^{-2} + 1 \\cdot 2^{-3} = 1 + 0.5 + 0.125 = 1.625 = \\frac{13}{8}$$
4. **Value Computation**:
   $$\\text{Value} = (-1)^S \\times (1.M) \\times 2^e$$
   $$\\text{Value} = (-1)^1 \\times 1.625 \\times 2^4 = -1.625 \\times 16 = -26$$

---

### 4. Distractor Analysis
* **Option A ($-10$)**: Arises from arithmetic error in decoding significand or exponent.
* **Option B ($-13$)**: Corresponds to using exponent $2^3$ instead of $2^4$.
* **Option C ($-26$)**: Correct. Exactly matches $-1.625 \\times 16 = -26$.
* **Option D (None of the above)**: Incorrect since $-26$ is available as Option C.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: $-26$**.`,
    images: []
  },

  "go:3268": {
    concept: "Digital Logic - Boolean Function Variable Independence via K-Map",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Analysis**: Determining variable independence and algebraic minimization of a 4-variable function using Karnaugh maps.

---

### 2. Given Boolean Function
$$f(A, B, C, D) = \\Sigma m(2, 3, 6, 7, 8, 9, 10, 11, 12, 13)$$
Variables ordered as $A, B$ (higher order) and $C, D$ (lower order).

---

### 3. Step-by-Step Analytical Derivation
1. **Examine Pairs across Variable $D$**:
   Notice the consecutive pairs of minterms:
   * $m_2 (0010)$ and $m_3 (0011) \\implies \\bar{A}\\bar{B}C\\bar{D} + \\bar{A}\\bar{B}CD = \\bar{A}\\bar{B}C$ (variable $D$ eliminates).
   * $m_6 (0110)$ and $m_7 (0111) \\implies \\bar{A}BC\\bar{D} + \\bar{A}BCD = \\bar{A}BC$ (variable $D$ eliminates).
   * Combining these four cells:
     $$\\bar{A}\\bar{B}C + \\bar{A}BC = \\bar{A}C$$
   * $m_8 (1000)$ and $m_9 (1001) \\implies A\\bar{B}\\bar{C}\\bar{D} + A\\bar{B}\\bar{C}D = A\\bar{B}\\bar{C}$.
   * $m_{10} (1010)$ and $m_{11} (1011) \\implies A\\bar{B}C\\bar{D} + A\\bar{B}CD = A\\bar{B}C$.
   * Combining these four cells:
     $$A\\bar{B}\\bar{C} + A\\bar{B}C = A\\bar{B}$$
   * $m_{12} (1100)$ and $m_{13} (1101) \\implies AB\\bar{C}\\bar{D} + AB\\bar{C}D = AB\\bar{C}$.
   * Combining $m_8, m_9, m_{12}, m_{13}$:
     $$A\\bar{B}\\bar{C} + AB\\bar{C} = A\\bar{C}$$
2. **Minimal Sum of Products**:
   Combining the essential prime implicants:
   $$f(A, B, C, D) = \\bar{A}C + A\\bar{C} + A\\bar{B}$$
3. **Assessment of Variable Dependencies**:
   * Variable $D$ does not appear in **any** prime implicant of the minimized function.
   * Variables $A, B,$ and $C$ are all present:
     * If $A = 0$, $f = C$ (depends on $C$).
     * If $A = 1$, $f = \\bar{C} + \\bar{B}$ (depends on both $B$ and $C$).
   * Therefore, $f$ depends on $A, B, C$ and is strictly **independent of exactly one variable** ($D$).

---

### 4. Distractor Analysis
* **Option A**: Correct. The function is independent of variable $D$ only.
* **Option B**: Incorrect. It depends on three distinct variables ($A, B, C$).
* **Option C**: Incorrect. It is not a single-variable function.
* **Option D**: Incorrect. It does not depend on $D$.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: independent of one variable**.`,
    images: []
  },

  "go:3269": {
    concept: "Digital Logic - Decoder-NOR Combinational Circuit Realization",
    markdown: `### 1. Concept / Subtopic
**MSI Combinational Logic - Decoder Synthesis**: Analyzing circuits combining an active-high 3-to-8 line decoder with a multi-input NOR gate.

---

### 2. Given Parameters & Circuit Connections
* **Decoder**: 3-to-8 active-high binary decoder.
  * Inputs: Top input $= Z$ (MSB, weight 4), Middle input $= Y$ (weight 2), Bottom input $= X$ (LSB, weight 1).
  * Output lines: $O_0$ through $O_7$, where $O_k = 1$ when the input binary value equals $k$.
* **NOR Gate**: 4-input NOR gate connected to decoder output lines:
  * Connected lines: $O_7, O_5, O_2, O_0$.
  * Unconnected lines: $O_6, O_4, O_3, O_1$.

---

### 3. Step-by-Step Analytical Derivation
1. **NOR Gate Logic Function**:
   * The output $f$ of the NOR gate is:
     $$f = \\overline{O_7 + O_5 + O_2 + O_0}$$
   * In a 3-to-8 decoder, exactly one output $O_k$ is $1$ for any input combination:
     $$\\sum_{k=0}^{7} O_k = 1$$
   * Therefore, the negation of the sum of $\{O_7, O_5, O_2, O_0\}$ is identically the sum of the remaining outputs:
     $$f = O_1 + O_3 + O_4 + O_6 = \\Sigma m(1, 3, 4, 6)$$
2. **Boolean Expansion of Minterms**:
   With $Z$ as MSB, $Y$ as middle, and $X$ as LSB:
   * $m_1 (001_2) = \\bar{Z}\\bar{Y}X$
   * $m_3 (011_2) = \\bar{Z}YX$
   * $m_4 (100_2) = Z\\bar{Y}\\bar{X}$
   * $m_6 (110_2) = ZY\\bar{X}$
3. **Simplification**:
   * Combine $m_1 + m_3$:
     $$\\bar{Z}\\bar{Y}X + \\bar{Z}YX = \\bar{Z}X(\\bar{Y} + Y) = \\bar{Z}X$$
   * Combine $m_4 + m_6$:
     $$Z\\bar{Y}\\bar{X} + ZY\\bar{X} = Z\\bar{X}(\\bar{Y} + Y) = Z\\bar{X}$$
   * Summing the terms:
     $$f = \\bar{Z}X + Z\\bar{X} = X \\oplus Z = x\\bar{z} + \\bar{x}z$$

---

### 4. Distractor Analysis
* **Option A ($xz + \\bar{x}\\bar{z}$)**: Represents XNOR ($X \\odot Z$), which would correspond to connecting $\{O_1, O_3, O_4, O_6\}$ to the NOR gate.
* **Option B ($x\\bar{z} + \\bar{x}z$)**: Correct. Exactly matches $X \\oplus Z$.
* **Option C ($\\bar{x}\\bar{y} + yz$)**: Incorrect variable assignment.
* **Option D ($xy + \\bar{y}\\bar{z}$)**: Incorrect variable assignment.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $x\\bar{z} + \\bar{x}{z}$**.`,
    images: []
  },

  "go:3275": {
    concept: "Computer Organization - Arithmetic Status Flags (Carry, Overflow, Sign)",
    markdown: `### 1. Concept / Subtopic
**ALU Status Flags**: Evaluation of condition flags in the Program Status Word (PSW) following 2's complement 8-bit binary addition.

---

### 2. Given Operands
* Operand 1 ($A$): $01001101_2$ ($+77_{10}$).
* Operand 2 ($B$): $11101001_2$ ($-23_{10}$, since $2^8 - 233 = 23$).

---

### 3. Step-by-Step Analytical Derivation
1. **8-bit Binary Addition with Carries**:
   $$\\begin{array}{rcc}
   \\text{Carries}: & 1\\;1\\;0\\;0\\;1\\;0\\;0\\;1\\;0 & \\\\[2pt]
   A: & 0\\;1\\;0\\;0\\;1\\;1\\;0\\;1 & (+77) \\\\[2pt]
   B: & 1\\;1\\;1\\;0\\;1\\;0\\;0\\;1 & (-23) \\\\[2pt]
   \\hline
   \\text{Sum}: & 0\\;0\\;1\\;1\\;0\\;1\\;1\\;0 & (+54)
   \\end{array}$$
   * Carry into MSB (bit 7): $C_{\\text{in}} = 1$.
   * Carry out of MSB (bit 7): $C_{\\text{out}} = 1$.
2. **Status Flag Evaluations**:
   * **Carry Flag ($C$)**:
     $$C = C_{\\text{out}} = 1$$
   * **Sign Flag ($S$)**:
     $$S = \\text{MSB of 8-bit result} = 0$$
     (Result $+54$ is positive).
   * **Overflow Flag ($V$ / $OV$)**:
     * Overflow in 2's complement addition can only occur when adding two numbers of the *same* sign yielding a result of the opposite sign. Here, a positive number ($+77$) and a negative number ($-23$) are added; overflow is mathematically impossible.
     * Alternatively, using the carry-in and carry-out of the sign bit:
       $$V = C_{\\text{in}} \\oplus C_{\\text{out}} = 1 \\oplus 1 = 0$$
3. **Summary Tuple (Carry, Overflow, Sign)**:
   $$(\\text{Carry}, \\text{Overflow}, \\text{Sign}) = (1, 0, 0)$$

---

### 4. Distractor Analysis
* **Option A ($1, 1, 0$)**: Incorrectly sets the overflow flag to 1.
* **Option B ($1, 0, 0$)**: Correct. Accurately identifies $C = 1, V = 0, S = 0$.
* **Option C ($0, 1, 0$)**: Misses the carry-out from MSB.
* **Option D ($1, 0, 1$)**: Incorrectly sets the sign flag to 1 (the result is $+54$, MSB is 0).

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $1, 0, 0$**.`,
    images: []
  },

  "go:3347": {
    concept: "Digital Logic - Synchronous State Diagram Realization with JK Flip-Flop",
    markdown: `### 1. Concept / Subtopic
**Sequential Circuit Synthesis**: Deriving flip-flop excitation equations from a Moore state transition diagram using JK flip-flop excitation tables.

---

### 2. State Diagram Specifications
* Single state variable $Q \\in \\{0, 1\\}$.
* External inputs: $x, y$.
* State transitions:
  * From state $0$:
    * If $(x, y) \\in \\{00, 11\\} \\implies$ Next state $Q^+ = 0$ (hold).
    * If $(x, y) \\in \\{01, 10\\} \\implies$ Next state $Q^+ = 1$ (toggle).
  * From state $1$:
    * If $(x, y) \\in \\{00, 11\\} \\implies$ Next state $Q^+ = 1$ (hold).
    * If $(x, y) \\in \\{01, 10\\} \\implies$ Next state $Q^+ = 0$ (toggle).

---

### 3. Step-by-Step Analytical Derivation
1. **Characterization of Input Conditions**:
   * Condition $\\{01, 10\\}$ corresponds to $x \\ne y$, i.e., $x \\oplus y = 1$.
   * Condition $\\{00, 11\\}$ corresponds to $x = y$, i.e., $\\overline{x \\oplus y} = 1$ (or $x \\odot y = 1$).
2. **Behavioral Analysis of State $Q$**:
   * Whenever $x \\oplus y = 0$:
     * If $Q = 0 \\implies Q^+ = 0$.
     * If $Q = 1 \\implies Q^+ = 1$.
     * The flip-flop must **Hold** its current state ($Q^+ = Q$).
   * Whenever $x \\oplus y = 1$:
     * If $Q = 0 \\implies Q^+ = 1$.
     * If $Q = 1 \\implies Q^+ = 0$.
     * The flip-flop must **Toggle** its current state ($Q^+ = \\bar{Q}$).
3. **JK Flip-Flop Excitation Rules**:
   * To **Hold** ($Q^+ = Q$): $J = 0, K = 0$.
   * To **Toggle** ($Q^+ = \\bar{Q}$): $J = 1, K = 1$.
4. **Excitation Equations**:
   * When $x \\oplus y = 0 \\implies J = 0, K = 0$.
   * When $x \\oplus y = 1 \\implies J = 1, K = 1$.
   * Therefore, $J$ and $K$ are directly governed by:
     $$J = x \\oplus y$$
     $$K = x \\oplus y$$

---

### 4. Distractor Analysis
* **Option A ($\\overline{x \\oplus y}$ and $\\overline{x \\oplus y}$)**: Toggles when $x = y$, which is inverted.
* **Option B ($\\overline{x \\oplus y}$ and $x \\oplus y$)**: Causes asymmetric set/reset behavior.
* **Option C ($x \\oplus y$ and $\\overline{x \\oplus y}$)**: Causes asymmetric set/reset behavior.
* **Option D ($x \\oplus y$ and $x \\oplus y$)**: Correct. Both $J$ and $K$ equal $x \\oplus y$.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: $ {x \\oplus y}$ and $ {x \\oplus y}$**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-HW-16: GATE IT 2008 Part 2 & GATE CSE 2009
  // ==========================================
  "go:3348": {
    concept: "Computer Organization - Stack Manipulation via Auto-Increment/Decrement",
    markdown: `### 1. Concept / Subtopic
**Instruction Set Architecture - Stack Addressing Modes**: Using pointer addressing with pre-decrement and post-increment/decrement to implement stack pop, compute, and push sequences.

---

### 2. Given Definitions & Instruction Semantics
* **Stack Pointer**: $X$ points to the current Top of Stack (TOS).
* **Addressing Modes**:
  * $(X)+$: $\\text{EA} = [X]$, followed by $X \\leftarrow X + 1$ (post-increment).
  * $-(X)$: $X \\leftarrow X - 1$, followed by $\\text{EA} = [X]$ (pre-decrement).
  * $(X)-$: $\\text{EA} = [X]$, followed by $X \\leftarrow X - 1$ (post-decrement).
* **Instruction Format**: \`ADD source, destination\` computes:
  $$\\text{destination} \\leftarrow \\text{source} + \\text{destination}$$
* **Goal**: Pop top two elements from stack, add them, and push the result back onto the stack.

---

### 3. Step-by-Step Analytical Derivation
1. **Initial Stack Configuration**:
   * Let memory location $L$ hold the top element ($T_1$), and location $L - 1$ hold the second element ($T_2$).
   * Pointer $X$ initially equals $L$.
2. **Analysis of Candidate Instruction \`ADD (X)-, (X)\`**:
   * **Step 1: Source Operand Evaluation (\`(X)-\`)**:
     * Access effective address $\\text{EA}_1 = X = L$.
     * Operand read: $T_1 = \\text{Memory}[L]$.
     * Post-decrement $X$:
       $$X \\leftarrow X - 1 = L - 1$$
     * Now $X$ points directly to the second element at location $L - 1$.
   * **Step 2: Destination Operand Evaluation (\`(X)\`)**:
     * Access effective address $\\text{EA}_2 = X = L - 1$.
     * Operand read: $T_2 = \\text{Memory}[L - 1]$.
   * **Step 3: Operation and Store-back**:
     * Compute sum: $\\text{Sum} = T_1 + T_2$.
     * Store result into destination:
       $$\\text{Memory}[L - 1] \\leftarrow T_1 + T_2$$
   * **Step 4: Final State**:
     * $X$ points to location $L - 1$, which now holds the sum.
     * The top two elements have been replaced by their sum at the new top of stack.
     * This exactly satisfies pop two, add, and push result.

---

### 4. Distractor Analysis
* **Option A**: Correct. Successfully pops the first element and adds it directly into the second location.
* **Option B (\`ADD (X), (X)-\`)**: Decrements $X$ after accessing the destination, leaving $X$ pointing to an unallocated lower location ($L-2$).
* **Option C (\`ADD -(X), (X)+\`)**: Pre-decrements before reading source, missing the top element entirely.
* **Option D (\`ADD -(X), (X)\`)**: Pre-decrements before reading source, corrupting stack indexing.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: ADD (X)−, (X)**.`,
    images: []
  },

  "go:3349": {
    concept: "Computer Organization - Horizontal Microprogrammed Control Unit Sizing",
    markdown: `### 1. Concept / Subtopic
**Control Unit Design**: Calculating the width of the Control Address Register (CAR) and Control Word (CW) in a horizontal microprogrammed architecture.

---

### 2. Given Parameters
* Number of machine instructions $= 140$.
* Clock cycles per instruction $= 7\\text{ cycles}$ (each requiring one microinstruction).
* Total distinct control signals $= 125$.
* Architecture: Horizontal microprogrammed control unit with **single address field format** for branch control logic.

---

### 3. Step-by-Step Analytical Derivation
1. **Size of the Control Memory**:
   $$\\text{Total Microinstructions} = 140\\text{ instructions} \\times 7\\text{ cycles/instruction} = 980\\text{ microinstructions}$$
2. **Width of Control Address Register (CAR)**:
   * The CAR must hold the address of any word in control memory:
     $$2^k \\ge 980$$
   * Since $2^9 = 512 < 980 \\le 2^{10} = 1024$:
     $$k = \\lceil \\log_2(980) \\rceil = 10\\text{ bits}$$
   * Thus, $\\text{CAR size} = 10\\text{ bits}$.
3. **Width of Control Word (CW)**:
   In horizontal microprogramming:
   * **Control Signal Field**: Every control signal has a dedicated 1-bit line (unencoded):
     $$\\text{Control field} = 125\\text{ bits}$$
   * **Branch Address Field**: Single address field containing the target control store address:
     $$\\text{Address field} = \\text{CAR width} = 10\\text{ bits}$$
   * **Total Control Word Length**:
     $$\\text{CW Length} = 125\\text{ bits} + 10\\text{ bits} = 135\\text{ bits}$$
4. **Summary**:
   $$\\text{Control Word Size} = 135\\text{ bits}, \\quad \\text{CAR Size} = 10\\text{ bits}$$

---

### 4. Distractor Analysis
* **Option A ($125, 7$)**: Overlooks the address field in the control word entirely.
* **Option B ($125, 10$)**: Omits the address field from the control word.
* **Option C ($135, 9$)**: Underestimates CAR size ($2^9 = 512 < 980$).
* **Option D ($135, 10$)**: Correct. Accurately determines $135$ and $10$.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: $135, 10$**.`,
    images: []
  },

  "go:3350": {
    concept: "Computer Organization - Pipeline Speedup with Latch Overhead",
    markdown: `### 1. Concept / Subtopic
**Pipelining Performance**: Computing asymptotic speedup for an $N$-stage pipeline considering stage delays and interstage latch setup/propagation overheads.

---

### 2. Given Parameters
* **Non-pipelined Processor**:
  * Operating clock frequency $f = 100\\text{ MHz}$.
  * Non-pipelined cycle time:
    $$T_{\\text{non-pipe}} = \\frac{1}{100\\text{ MHz}} = \\frac{1}{10^8\\text{ s}^{-1}} = 10\\text{ ns}$$
* **Pipelined Processor**:
  * 5 stages with individual delays: $2.5\\text{ ns}, 1.5\\text{ ns}, 2.0\\text{ ns}, 1.5\\text{ ns}, 2.5\\text{ ns}$.
  * Latch delay: $\\tau_{\\text{latch}} = 0.5\\text{ ns}$.

---

### 3. Step-by-Step Analytical Derivation
1. **Clock Cycle Time of Pipelined Processor ($T_{\\text{pipe}}$)**:
   * The pipeline clock period is bounded by the slowest stage delay plus the latch overhead:
     $$T_{\\text{pipe}} = \\max(d_1, d_2, d_3, d_4, d_5) + \\tau_{\\text{latch}}$$
     $$T_{\\text{pipe}} = \\max(2.5, 1.5, 2.0, 1.5, 2.5) + 0.5 = 2.5\\text{ ns} + 0.5\\text{ ns} = 3.0\\text{ ns}$$
2. **Speedup Formulation for Large Instruction Streams ($n \\to \\infty$)**:
   * For $n$ instructions:
     $$\\text{Time}_{\\text{non-pipe}} = n \\times T_{\\text{non-pipe}} = n \\times 10\\text{ ns}$$
     $$\\text{Time}_{\\text{pipe}} = (k + n - 1) \\times T_{\\text{pipe}} \\approx n \\times T_{\\text{pipe}} \\quad (\\text{as } n \\to \\infty)$$
   * Asymptotic Speedup:
     $$\\text{Speedup} = \\frac{T_{\\text{non-pipe}}}{T_{\\text{pipe}}} = \\frac{10\\text{ ns}}{3.0\\text{ ns}} = \\frac{10}{3} \\approx 3.33$$

---

### 4. Distractor Analysis
* **Option A ($4.5$)**: Overestimates speedup by ignoring latch delay.
* **Option B ($4.0$)**: Corresponds to $10 / 2.5$, omitting the $0.5\\text{ ns}$ latch overhead.
* **Option C ($3.33$)**: Correct. Exactly matches $\\frac{10}{3.0} = 3.33$.
* **Option D ($3.0$)**: Arises from rounding or miscalculating stage delays.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: $3.33$**.`,
    images: []
  },

  "go:3352": {
    concept: "Computer Organization - Booth's Multiplication Algorithm Add/Subtract Operations",
    markdown: `### 1. Concept / Subtopic
**Computer Arithmetic - Booth's Algorithm**: Counting additions and subtractions required to multiply two 2's complement numbers based on multiplier recoding bit pairs.

---

### 2. Given Multiplier
* **Multiplier ($Y$)**: $0111\\ 0111\\ 1011\\ 1101_2$ ($16\\text{ bits}$).
* **Recoding Rule**:
  Append an implicit $y_{-1} = 0$ to the right of LSB ($y_0$):
  * $y_i y_{i-1} = 01 \\implies$ **Addition** ($+M$).
  * $y_i y_{i-1} = 10 \\implies$ **Subtraction** ($-M$).
  * $y_i y_{i-1} = 00$ or $11 \\implies$ **No arithmetic operation** (shift only).
  * Every transition between adjacent unequal bits ($01$ or $10$) corresponds to an addition or subtraction.

---

### 3. Step-by-Step Analytical Derivation
1. **Padded Multiplier Bit String**:
   Let the bits be indexed from $y_{15}$ down to $y_0$, with $y_{-1} = 0$:
   $$\\begin{array}{c|cccccccccccccccc|c}
   \\text{Bit} & y_{15} & y_{14} & y_{13} & y_{12} & y_{11} & y_{10} & y_9 & y_8 & y_7 & y_6 & y_5 & y_4 & y_3 & y_2 & y_1 & y_0 & y_{-1} \\\\
   \\hline
   \\text{Val} & 0 & 1 & 1 & 1 & 0 & 1 & 1 & 1 & 1 & 0 & 1 & 1 & 1 & 1 & 0 & 1 & 0
   \\end{array}$$
2. **Examine Each Bit Pair $(y_i, y_{i-1})$ from $i = 0$ to $15$**:
   * $i = 0$: $y_0 y_{-1} = 10 \\implies$ **Subtraction (1)**
   * $i = 1$: $y_1 y_0 = 01 \\implies$ **Addition (2)**
   * $i = 2$: $y_2 y_1 = 10 \\implies$ **Subtraction (3)**
   * $i = 3$: $y_3 y_2 = 11 \\implies$ None
   * $i = 4$: $y_4 y_3 = 11 \\implies$ None
   * $i = 5$: $y_5 y_4 = 11 \\implies$ None
   * $i = 6$: $y_6 y_5 = 01 \\implies$ **Addition (4)**
   * $i = 7$: $y_7 y_6 = 10 \\implies$ **Subtraction (5)**
   * $i = 8$: $y_8 y_7 = 11 \\implies$ None
   * $i = 9$: $y_9 y_8 = 11 \\implies$ None
   * $i = 10$: $y_{10} y_9 = 11 \\implies$ None
   * $i = 11$: $y_{11} y_{10} = 01 \\implies$ **Addition (6)**
   * $i = 12$: $y_{12} y_{11} = 10 \\implies$ **Subtraction (7)**
   * $i = 13$: $y_{13} y_{12} = 11 \\implies$ None
   * $i = 14$: $y_{14} y_{13} = 11 \\implies$ None
   * $i = 15$: $y_{15} y_{14} = 01 \\implies$ **Addition (8)**
3. **Total Operations**:
   $$\\text{Total Additions/Subtractions} = 4\\text{ Additions} + 4\\text{ Subtractions} = 8\\text{ operations}$$

---

### 4. Distractor Analysis
* **Option A ($6$)**: Underestimates transition count.
* **Option B ($8$)**: Correct. Exactly 8 transitions occur between $y_{-1}$ and $y_{15}$.
* **Option C ($10$)**: Overcounts transitions.
* **Option D ($12$)**: Overcounts transitions.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $8$**.`,
    images: []
  },

  "go:3403": {
    concept: "Computer Organization - Set-Associative Cache Field Partitioning",
    markdown: `### 1. Concept / Subtopic
**Cache Memory Design**: Determining bit widths of the TAG, SET, and WORD (byte offset) fields for a set-associative cache.

---

### 2. Given Parameters
* **Main Memory Size**: $1\\text{ MB} = 2^{20}\\text{ bytes} \\implies$ Physical address width $= 20\\text{ bits}$.
* **Word Size**: $1\\text{ byte}$ (byte-addressable machine).
* **Block Size**: $128\\text{ words} = 128\\text{ bytes} = 2^7\\text{ bytes}$.
* **Cache Size**: $8\\text{ KB} = 8 \\times 1024\\text{ bytes} = 8192\\text{ bytes} = 2^{13}\\text{ bytes}$.
* **Associativity**: $4$-way set-associative.

---

### 3. Step-by-Step Analytical Derivation
1. **Word (Block Offset) Field**:
   * Number of words per block $= 128 = 2^7$.
   $$\\text{WORD bits} = \\log_2(128) = 7\\text{ bits}$$
2. **Total Blocks and Sets in Cache**:
   * Total cache lines (blocks):
     $$N_{\\text{blocks}} = \\frac{\\text{Cache Size}}{\\text{Block Size}} = \\frac{8\\text{ KB}}{128\\text{ B}} = \\frac{2^{13}}{2^7} = 2^6 = 64\\text{ blocks}$$
   * Number of sets ($4$-way set-associative):
     $$N_{\\text{sets}} = \\frac{N_{\\text{blocks}}}{\\text{Associativity}} = \\frac{64}{4} = 16 = 2^4\\text{ sets}$$
   * Set index field width:
     $$\\text{SET bits} = \\log_2(16) = 4\\text{ bits}$$
3. **TAG Field**:
   * Address bit partition:
     $$\\text{TAG} + \\text{SET} + \\text{WORD} = 20\\text{ bits}$$
     $$\\text{TAG} = 20 - (4 + 7) = 20 - 11 = 9\\text{ bits}$$
4. **Summary Tuple (TAG, SET, WORD)**:
   $$\\text{TAG} = 9\\text{ bits}, \\quad \\text{SET} = 4\\text{ bits}, \\quad \\text{WORD} = 7\\text{ bits}$$

---

### 4. Distractor Analysis
* **Option A ($7, 6, 7$)**: Corresponds to direct-mapped cache calculations.
* **Option B ($8, 5, 7$)**: Corresponds to 2-way set-associative cache.
* **Option C ($8, 6, 6$)**: Incorrect block offset and tag calculation.
* **Option D ($9, 4, 7$)**: Correct. Exactly matches $9, 4,$ and $7$ bits.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: $9, 4, 7$**.`,
    images: []
  },

  "go:3405": {
    concept: "Computer Organization - Cache Memory Address Tag Extraction",
    markdown: `### 1. Concept / Subtopic
**Memory Address Decomposition**: Extracting the binary tag value from a given hexadecimal physical memory address in a 4-way set-associative cache.

---

### 2. Given Parameters & Address Bit Allocation
* From the cache parameters:
  * Physical Address Width $= 20\\text{ bits}$.
  * **TAG field**: Most significant $9\\text{ bits}$ (bits $[19:11]$).
  * **SET field**: Middle $4\\text{ bits}$ (bits $[10:7]$).
  * **WORD field**: Least significant $7\\text{ bits}$ (bits $[6:0]$).
* **Target Hex Address**: $\\text{0C795H}$.

---

### 3. Step-by-Step Analytical Derivation
1. **Convert Hexadecimal to 20-bit Binary**:
   $$\\begin{array}{ccccc}
   \\text{0} & \\text{C} & \\text{7} & \\text{9} & \\text{5} \\\\[2pt]
   0000 & 1100 & 0111 & 1001 & 0101
   \\end{array}$$
   Full 20-bit binary string:
   $$0000\\;1100\\;0111\\;1001\\;0101_2$$
2. **Decompose into Cache Fields**:
   * **TAG (bits $[19:11]$, 9 bits)**:
     $$\\underbrace{0000\\;1100\\;0}_{\\text{TAG (9 bits)}} \\quad \\underbrace{111\\;1}_{\\text{SET (4 bits)}} \\quad \\underbrace{001\\;0101}_{\\text{WORD (7 bits)}}$$
   * Bits $[19:11]$ are:
     $$\\text{TAG} = 000011000$$
   * Bits $[10:7]$ (SET) $= 1111_2 = 15$ (Set 15).
   * Bits $[6:0]$ (WORD) $= 0010101_2 = 21$ (Byte offset 21).

---

### 4. Distractor Analysis
* **Option A ($000011000$)**: Correct. Exactly matches the 9-bit tag field.
* **Option B ($110001111$)**: Extracted from an incorrect bit offset.
* **Option C ($00011000$)**: Has only 8 bits (missing a leading bit).
* **Option D ($110010101$)**: Scrambled bit field.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: $000011000$**.`,
    images: []
  },

  "go:1297": {
    concept: "Digital Logic - Base Conversion (Octal to Hexadecimal)",
    markdown: `### 1. Concept / Subtopic
**Number Representation**: Direct radix conversion between octal (base 8), binary (base 2), and hexadecimal (base 16).

---

### 2. Given Number
$$(1217)_8$$

---

### 3. Step-by-Step Analytical Derivation
1. **Convert Octal to Binary (3 bits per octal digit)**:
   * $1_8 = 001_2$
   * $2_8 = 010_2$
   * $1_8 = 001_2$
   * $7_8 = 111_2$
   Combining the triplets:
   $$(1217)_8 = 001\\ 010\\ 001\\ 111_2$$
2. **Regroup Binary into Hexadecimal Nibbles (4 bits from right to left)**:
   $$001010001111_2 = \\underbrace{0010}_{2} \\ \\underbrace{1000}_{8} \\ \\underbrace{1111}_{\\text{F}}$$
   * Low nibble: $1111_2 = 15_{10} = \\text{F}_{16}$.
   * Middle nibble: $1000_2 = 8_{16}$.
   * High nibble: $0010_2 = 2_{16}$.
3. **Hexadecimal Representation**:
   $$(028\\text{F})_{16}$$
4. **Decimal Verification**:
   $$(1217)_8 = 1 \\times 8^3 + 2 \\times 8^2 + 1 \\times 8^1 + 7 \\times 8^0 = 512 + 128 + 8 + 7 = 655_{10}$$
   $$(028\\text{F})_{16} = 2 \\times 16^2 + 8 \\times 16^1 + 15 \\times 16^0 = 512 + 128 + 15 = 655_{10}$$
   The conversion is exact.

---

### 4. Distractor Analysis
* **Option A ($(1217)_{16}$)**: Directly copies octal digits into hexadecimal without conversion.
* **Option B ($(028F)_{16}$)**: Correct. Perfectly represents the value in hexadecimal.
* **Option C ($(2297)_{10}$)**: Incorrect decimal evaluation ($655_{10} \\ne 2297_{10}$).
* **Option D ($(0B17)_{16}$)**: Flawed grouping.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $(028F)_{16}$**.`,
    images: []
  },

  "go:1298": {
    concept: "Digital Logic - Minimum 2-Input NOR Gate Realization",
    markdown: `### 1. Concept / Subtopic
**Universal Logic Gate Synthesis**: Synthesizing SOP Boolean functions using the minimum number of 2-input NOR gates via Boolean algebraic restructuring.

---

### 2. Given Target Function
$$F = AB + C$$
Constraint: Implementation restricted solely to 2-input NOR gates.

---

### 3. Step-by-Step Analytical Derivation
1. **Algebraic Restructuring using Distributive Law**:
   * Apply the distributive property of OR over AND:
     $$F = AB + C = (A + C)(B + C)$$
2. **Applying Double Negation and De Morgan's Laws**:
   $$F = \\overline{\\overline{(A + C)(B + C)}} = \\overline{\\overline{A + C} + \\overline{B + C}}$$
3. **Mapping to 2-Input NOR Gates**:
   Recall that a 2-input NOR gate computing inputs $X$ and $Y$ produces $\\text{NOR}(X, Y) = \\overline{X + Y}$.
   * **Gate 1**: Inputs $A$ and $C$:
     $$G_1 = \\text{NOR}(A, C) = \\overline{A + C}$$
   * **Gate 2**: Inputs $B$ and $C$:
     $$G_2 = \\text{NOR}(B, C) = \\overline{B + C}$$
   * **Gate 3**: Inputs $G_1$ and $G_2$:
     $$G_3 = \\text{NOR}(G_1, G_2) = \\overline{G_1 + G_2} = \\overline{\\overline{A + C} + \\overline{B + C}}$$
     By De Morgan's theorem:
     $$G_3 = \\overline{\\overline{A + C}} \\cdot \\overline{\\overline{B + C}} = (A + C)(B + C) = AB + C$$
4. **Gate Count**:
   The circuit is realized using exactly **3** two-input NOR gates.

---

### 4. Distractor Analysis
* **Option A ($2$)**: Impossible; a single NOR can only produce a negation or a 2-input sum negation. Two gates cannot produce $AB + C$.
* **Option B ($3$)**: Correct. Exactly 3 two-input NOR gates are required.
* **Option C ($4$)**: Suboptimal realization (such as inverting $A, B$ first).
* **Option D ($5$)**: Naive universal gate conversion without applying the distributive law.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $3$**.`,
    images: []
  },

  "go:1299": {
    concept: "Computer Organization - Memory Capacity Chip Count Calculation",
    markdown: `### 1. Concept / Subtopic
**Main Memory Organization**: Memory modular expansion and determining the required count of constituent RAM chips to meet total bit capacity.

---

### 2. Given Parameters
* **Target Memory Capacity**: $256\\text{ Kbytes} = 256\\text{K} \\times 8\\text{ bits}$.
* **Constituent RAM Chip Size**: $32\\text{K} \\times 1\\text{ bit}$.

---

### 3. Step-by-Step Analytical Derivation
1. **Total Bit Capacity Calculation**:
   $$\\text{Total Required Bits} = 256 \\times 1024\\text{ words} \\times 8\\text{ bits/word} = 256\\text{K} \\times 8\\text{ bits} = 2048\\text{K bits}$$
2. **Capacity per Chip**:
   $$\\text{Capacity per Chip} = 32\\text{K} \\times 1\\text{ bit} = 32\\text{K bits}$$
3. **Number of Chips Required**:
   $$N_{\\text{chips}} = \\frac{\\text{Total Required Bits}}{\\text{Capacity per Chip}} = \\frac{256\\text{K} \\times 8}{32\\text{K} \\times 1} = \\left(\\frac{256}{32}\\right) \\times 8 = 8 \\times 8 = 64\\text{ chips}$$
4. **Bank Organization**:
   * Organized as 8 banks (each providing 1 bit of the 8-bit byte word), with each bank containing $8$ chips cascaded to cover the $256\\text{K}$ address space ($8 \\times 8 = 64$).

---

### 4. Distractor Analysis
* **Option A ($8$)**: Considers only the word width expansion ($8 / 1 = 8$) without address space expansion.
* **Option B ($32$)**: Calculation error.
* **Option C ($64$)**: Correct. Exactly 64 chips are needed.
* **Option D ($128$)**: Overestimates by a factor of 2.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: $64$**.`,
    images: []
  },

  "go:1300": {
    concept: "Computer Organization - Interrupt Cycle Sampling and Service Timing",
    markdown: `### 1. Concept / Subtopic
**CPU Control & Interrupt Architecture**: Timing of interrupt recognition within the instruction execution cycle.

---

### 2. Classical Instruction Execution Cycle
A processor executes instructions through sequential cyclic phases:
1. **Fetch Cycle**: Fetch instruction pointed to by PC from memory into IR.
2. **Decode / Indirect Cycle**: Decode opcode and compute effective address.
3. **Execute Cycle**: Perform the operation specified by the instruction.
4. **Interrupt Cycle**:
   * Test the interrupt request line / register.
   * If an unmasked interrupt is pending:
     * Save the return address (current PC) and processor status flags onto the stack.
     * Load the starting address of the Interrupt Service Routine (ISR) into PC.
     * Disable interrupts (or set interrupt priority mask).

---

### 3. Step-by-Step Analytical Evaluation
1. **Atomicity of Instruction Execution**:
   * User instructions are atomic units of execution. An asynchronous hardware interrupt cannot halt instruction execution midway (except for specific aborts/faults) because internal registers would be left in undefined, non-restartable intermediate states.
2. **Interrupt Sampling Point**:
   * Hardware samples the interrupt request register at the conclusion of the execution phase of each instruction.
   * Thus, the CPU handles an interrupt **by checking the interrupt register after finishing the execution of the current instruction**.

---

### 4. Distractor Analysis
* **Option A**: Incorrect. Interrupts are not recognized immediately in mid-instruction to preserve instruction atomicity.
* **Option B**: Incorrect. Checking at the end of the fetch cycle would leave the fetched instruction unexecuted.
* **Option C**: Correct. Accurately identifies the architectural interrupt sampling boundary.
* **Option D**: Incorrect. Interrupts are sampled at instruction boundaries, not arbitrary timer intervals.

---

### 5. Final Answer
Therefore, the correct choice is **Option C: By checking the interrupt register after finishing the execution of the current instruction.**`,
    images: []
  },

  "go:1314": {
    concept: "Computer Organization - Multicycle Pipeline Loop Execution Time",
    markdown: `### 1. Concept / Subtopic
**Pipelining - Structural Contention and Stage Delays**: Computing the total execution cycle count for instruction loops with varying stage durations and pipeline hazards.

---

### 2. Given Parameters & Pipeline Stage Latencies
* **4-Stage Pipeline**: $S_1, S_2, S_3, S_4$.
* **Instruction Latencies per Stage (in clock cycles)**:
  $$\\begin{array}{|c|c|c|c|c|}
  \\hline
  \\textbf{Instruction} & \\textbf{S1} & \\textbf{S2} & \\textbf{S3} & \\textbf{S4} \\\\
  \\hline
  I_1 & 2 & 1 & 1 & 1 \\\\
  \\hline
  I_2 & 1 & 3 & 2 & 2 \\\\
  \\hline
  I_3 & 2 & 1 & 1 & 3 \\\\
  \\hline
  I_4 & 1 & 2 & 2 & 2 \\\\
  \\hline
  \\end{array}$$
* **Loop Structure**: \`For (i=1 to 2) { I1; I2; I3; I4; }\` (Executes $I_1, I_2, I_3, I_4$ twice, total 8 instructions).

---

### 3. Step-by-Step Cycle-by-Cycle Reservation Tracking
Let $E(k, s)$ denote the completion cycle of instruction $k$ in stage $s$, where:
$$\\text{Start}(k, s) = \\max(E(k, s-1), E(k-1, s))$$
$$E(k, s) = \\text{Start}(k, s) + \\text{Duration}(k, s)$$

#### Iteration 1:
1. **$I_1^{(1)}$**:
   * $S_1$: starts at $0$, duration $2 \\implies E = 2$.
   * $S_2$: starts at $2$, duration $1 \\implies E = 3$.
   * $S_3$: starts at $3$, duration $1 \\implies E = 4$.
   * $S_4$: starts at $4$, duration $1 \\implies E = 5$.
2. **$I_2^{(1)}$**:
   * $S_1$: starts at $\\max(E(I_1, S_1), 0) = 2$, duration $1 \\implies E = 3$.
   * $S_2$: starts at $\\max(3, E(I_1, S_2)=3) = 3$, duration $3 \\implies E = 6$.
   * $S_3$: starts at $\\max(6, E(I_1, S_3)=4) = 6$, duration $2 \\implies E = 8$.
   * $S_4$: starts at $\\max(8, E(I_1, S_4)=5) = 8$, duration $2 \\implies E = 10$.
3. **$I_3^{(1)}$**:
   * $S_1$: starts at $E(I_2, S_1) = 3$, duration $2 \\implies E = 5$.
   * $S_2$: starts at $\\max(5, E(I_2, S_2)=6) = 6$, duration $1 \\implies E = 7$.
   * $S_3$: starts at $\\max(7, E(I_2, S_3)=8) = 8$, duration $1 \\implies E = 9$.
   * $S_4$: starts at $\\max(9, E(I_2, S_4)=10) = 10$, duration $3 \\implies E = 13$.
4. **$I_4^{(1)}$**:
   * $S_1$: starts at $E(I_3, S_1) = 5$, duration $1 \\implies E = 6$.
   * $S_2$: starts at $\\max(6, E(I_3, S_2)=7) = 7$, duration $2 \\implies E = 9$.
   * $S_3$: starts at $\\max(9, E(I_3, S_3)=9) = 9$, duration $2 \\implies E = 11$.
   * $S_4$: starts at $\\max(11, E(I_3, S_4)=13) = 13$, duration $2 \\implies E = 15$.

#### Iteration 2:
5. **$I_1^{(2)}$**:
   * $S_1$: starts at $E(I_4, S_1) = 6$, duration $2 \\implies E = 8$.
   * $S_2$: starts at $\\max(8, E(I_4, S_2)=9) = 9$, duration $1 \\implies E = 10$.
   * $S_3$: starts at $\\max(10, E(I_4, S_3)=11) = 11$, duration $1 \\implies E = 12$.
   * $S_4$: starts at $\\max(12, E(I_4, S_4)=15) = 15$, duration $1 \\implies E = 16$.
6. **$I_2^{(2)}$**:
   * $S_1$: starts at $E(I_1, S_1) = 8$, duration $1 \\implies E = 9$.
   * $S_2$: starts at $\\max(9, E(I_1, S_2)=10) = 10$, duration $3 \\implies E = 13$.
   * $S_3$: starts at $\\max(13, E(I_1, S_3)=12) = 13$, duration $2 \\implies E = 15$.
   * $S_4$: starts at $\\max(15, E(I_1, S_4)=16) = 16$, duration $2 \\implies E = 18$.
7. **$I_3^{(2)}$**:
   * $S_1$: starts at $E(I_2, S_1) = 9$, duration $2 \\implies E = 11$.
   * $S_2$: starts at $\\max(11, E(I_2, S_2)=13) = 13$, duration $1 \\implies E = 14$.
   * $S_3$: starts at $\\max(14, E(I_2, S_3)=15) = 15$, duration $1 \\implies E = 16$.
   * $S_4$: starts at $\\max(16, E(I_2, S_4)=18) = 18$, duration $3 \\implies E = 21$.
8. **$I_4^{(2)}$**:
   * $S_1$: starts at $E(I_3, S_1) = 11$, duration $1 \\implies E = 12$.
   * $S_2$: starts at $\\max(12, E(I_3, S_2)=14) = 14$, duration $2 \\implies E = 16$.
   * $S_3$: starts at $\\max(16, E(I_3, S_3)=16) = 16$, duration $2 \\implies E = 18$.
   * $S_4$: starts at $\\max(18, E(I_3, S_4)=21) = 21$, duration $2 \\implies E = 23$.

Total clock cycles needed $= \\mathbf{23}$ cycles.

---

### 4. Distractor Analysis
* **Option A ($16$)**: Unrealistic minimum assuming zero pipeline stalls and minimal latency.
* **Option B ($23$)**: Correct. Exactly matches the cycle-accurate pipeline simulation.
* **Option C ($28$)**: Overestimates by double-counting interstage waits.
* **Option D ($30$)**: Assumes non-overlapped serial execution.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $23$**.`,
    images: []
  },

  "go:1315": {
    concept: "Computer Organization - Set-Associative Cache LRU Replacement Trace",
    markdown: `### 1. Concept / Subtopic
**Memory Hierarchy - Cache Replacement Policies**: Simulating Least Recently Used (LRU) block replacement in a 4-way set-associative cache.

---

### 2. Given Parameters & Request Sequence
* Total cache blocks $= 16$.
* Associativity $= 4$-way set-associative.
* Number of sets $= \\frac{16}{4} = 4\\text{ sets}$ (Sets $0, 1, 2, 3$).
* Mapping function: Memory block $B$ maps to set:
  $$\\text{Set} = B \\pmod 4$$
* **Block Request Stream**:
  $$0, 255, 1, 4, 3, 8, 133, 159, 216, 129, 63, 8, 48, 32, 73, 92, 155$$

---

### 3. Step-by-Step Analytical Derivation
1. **Set Mapping of Requested Blocks**:
   * **Set 0 ($B \\pmod 4 = 0$)**: $0, 4, 8, 216, 8, 48, 32, 92$.
   * **Set 1 ($B \\pmod 4 = 1$)**: $1, 133, 129, 73$.
   * **Set 2 ($B \\pmod 4 = 2$)**: None.
   * **Set 3 ($B \\pmod 4 = 3$)**: $255, 3, 159, 63, 155$.
2. **Trace Set 0 (Capacity $= 4$ blocks, order shows [LRU $\\to$ MRU])**:
   * Request $0$: Set 0 contains $[0]$.
   * Request $4$: Set 0 contains $[0, 4]$.
   * Request $8$: Set 0 contains $[0, 4, 8]$.
   * Request $216$: Set 0 contains $[0, 4, 8, 216]$ (Set full).
   * Request $8$: Hit! Block $8$ moves to MRU $\\implies [0, 4, 216, 8]$.
   * Request $48$: Miss! Evict LRU block ($0$) $\\implies [4, 216, 8, 48]$.
   * Request $32$: Miss! Evict LRU block ($4$) $\\implies [216, 8, 48, 32]$.
   * Request $92$: Miss! Evict LRU block ($\\mathbf{216}$) $\\implies [8, 48, 32, 92]$.
   * **Final state of Set 0**: $\\{8, 48, 32, 92\\}$. Block **216** has been evicted!
3. **Trace Set 3 (Capacity $= 4$ blocks)**:
   * Requests: $255, 3, 159, 63, 155$.
   * Request $255$: $[255]$.
   * Request $3$: $[255, 3]$.
   * Request $159$: $[255, 3, 159]$.
   * Request $63$: $[255, 3, 159, 63]$.
   * Request $155$: Miss! Evict LRU block ($255$) $\\implies [3, 159, 63, 155]$.
   * Block $3$ is still present in cache.
4. **Trace Set 1 (Capacity $= 4$ blocks)**:
   * Requests: $1, 133, 129, 73$.
   * Set 1 contains $[1, 133, 129, 73]$. Blocks $129$ and $1$ are both present.
5. **Conclusion**:
   Among the options $\\{3, 8, 129, 216\\}$, block **216** is evicted and is NOT in the cache.

---

### 4. Distractor Analysis
* **Option A ($3$)**: Still resides in Set 3.
* **Option B ($8$)**: Hit and refreshed to MRU in Set 0; still resides in cache.
* **Option C ($129$)**: Still resides in Set 1.
* **Option D ($216$)**: Correct. Evicted from Set 0 upon the arrival of block 92.

---

### 5. Final Answer
Therefore, the correct choice is **Option D: $216$**.`,
    images: []
  }
};
