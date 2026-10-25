/**
 * scripts/pipeline/apply-chunk-cse-hw-11-to-13.mjs
 * -------------------------------------------------
 * Verified authentic solutions for GATE CSE & IT 2007 Hardware
 * (29 Questions covering Digital Logic and Computer Organization & Architecture).
 *
 * Chunks:
 *   - CHUNK-CSE-HW-11 (10 Qs): go:1206 to go:1246   (GATE CSE 2007)
 *   - CHUNK-CSE-HW-12 (10 Qs): go:1252 to go:3469   (GATE CSE 2007 & IT 2007)
 *   - CHUNK-CSE-HW-13 (9 Qs):  go:3470 to go:3531   (GATE IT 2007)
 */

export const CHUNK_CSE_HW_11_TO_13 = {
  // ==========================================
  // CHUNK-CSE-HW-11: GATE CSE 2007 Hardware Part 1
  // ==========================================
  "go:1206": {
    concept: "Digital Logic - Decoder Tree Synthesis without Additional Logic Gates",
    markdown: `### 1. Concept / Subtopic
**Combinational Logic - Decoder Expansion**: Constructing a higher-order decoder ($6$-to-$64$ line decoder) from lower-order building blocks ($3$-to-$8$ line decoders with enable inputs) without utilizing external logic gates.

---

### 2. Given Parameters & Component Specifications
* **Target Decoder**: $6$-to-$64$ line decoder (6 input lines, 64 distinct output lines).
* **Available Building Block**: $3$-to-$8$ line decoders equipped with an active-high Enable ($E$) input.
* **Design Constraint**: Zero external logic gates permitted.

---

### 3. Step-by-Step Analytical Derivation
1. **Output Stage (Stage 2)**:
   * The target decoder requires $64$ mutually exclusive output lines.
   * Each $3$-to-$8$ decoder provides $8$ output lines.
   * Sizing the output bank:
     $$\\text{Stage 2 Decoders} = \\frac{64\\text{ outputs}}{8\\text{ outputs/decoder}} = 8\\text{ decoders}$$
   * The 3 least significant input bits ($A_2, A_1, A_0$) are wired in parallel to the 3 select inputs of all $8$ output decoders.
2. **Enabling the Output Stage (Stage 1)**:
   * To ensure exactly one of the $64$ outputs is asserted at any time, exactly one of the $8$ output decoders must be enabled based on the $3$ most significant input bits ($A_5, A_4, A_3$).
   * A $3$-to-$8$ decoder takes $(A_5, A_4, A_3)$ and produces $8$ mutually exclusive outputs.
   * Connecting the $8$ outputs of this single first-stage decoder directly to the Enable ($E$) pins of the $8$ output-stage decoders guarantees that exactly one decoder is active.
   * Sizing the enabling stage:
     $$\\text{Stage 1 Decoders} = 1\\text{ decoder}$$
3. **Total Decoder Count**:
   $$\\text{Total} = \\text{Stage 1} + \\text{Stage 2} = 1 + 8 = 9\\text{ decoders}$$

---

### 4. Distractor Analysis
* **Option A ($7$)**: Underestimates hardware requirement.
* **Option B ($8$)**: Considers only the output stage decoders, omitting the essential first-stage decoder needed to decode the higher-order bits without external gates.
* **Option C ($9$)**: **Correct**. Exactly $1 + 8 = 9$ decoders are required.
* **Option D ($10$)**: Overestimates decoder hierarchy.

---

### 5. Concluding Answer
**Correct Answer: (C) 9**`,
    images: []
  },

  "go:1207": {
    concept: "Digital Logic - Boolean Function Variable Independence & Minimization",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Analysis - Variable Independence**: Determining the functional dependence and algebraic simplification of a 4-variable Boolean function.

---

### 2. Given Function
$$f(w, x, y, z) = \\sum m(1, 3, 4, 6, 9, 11, 12, 14)$$

---

### 3. Step-by-Step Analytical Derivation
1. **Minterm Binary Representations**:
   * $m_1 = 0001_2 = \\bar{w}\\bar{x}\\bar{y}z$
   * $m_3 = 0011_2 = \\bar{w}\\bar{x}yz$
   * $m_4 = 0100_2 = \\bar{w}x\\bar{y}\\bar{z}$
   * $m_6 = 0110_2 = \\bar{w}xy\\bar{z}$
   * $m_9 = 1001_2 = w\\bar{x}\\bar{y}z$
   * $m_{11} = 1011_2 = w\\bar{x}yz$
   * $m_{12} = 1100_2 = wx\\bar{y}\\bar{z}$
   * $m_{14} = 1110_2 = wxy\\bar{z}$
2. **K-Map Grouping ($4 \\times 4$ Map with rows $wx$, columns $yz$)**:
   * **Group 1**: Minterms $\\{1, 3, 9, 11\\}$:
     * Cells: $(0001, 0011, 1001, 1011)$.
     * $w$ varies ($0$ and $1$), $y$ varies ($0$ and $1$).
     * Common literals: $x = 0$ (so $\\bar{x}$) and $z = 1$ (so $z$).
     * Implicant $= \\bar{x}z$.
   * **Group 2**: Minterms $\\{4, 6, 12, 14\\}$:
     * Cells: $(0100, 0110, 1100, 1110)$.
     * $w$ varies ($0$ and $1$), $y$ varies ($0$ and $1$).
     * Common literals: $x = 1$ (so $x$) and $z = 0$ (so $\\bar{z}$).
     * Implicant $= x\\bar{z}$.
3. **Simplified Minimal Expression**:
   $$f(w, x, y, z) = \\bar{x}z + x\\bar{z} = x \\oplus z$$
4. **Variable Dependence Assessment**:
   * The simplified expression involves only variables $x$ and $z$.
   * Variables $w$ and $y$ are completely absent.
   * Therefore, the function is **independent of two variables** ($w$ and $y$).

---

### 4. Distractor Analysis
* **Option A**: Incorrect; the function is independent of two variables, not just one.
* **Option B**: **Correct**. Demonstrably independent of variables $w$ and $y$.
* **Option C**: Incorrect; it depends essentially on both $x$ and $z$.
* **Option D**: Incorrect; assumes full 4-variable dependence without performing K-map minimization.

---

### 5. Concluding Answer
**Correct Answer: (B) independent of two variables**`,
    images: []
  },

  "go:1208": {
    concept: "CO & Architecture - Set-Associative Cache Address Bit Partitioning",
    markdown: `### 1. Concept / Subtopic
**Cache Memory Organization - Address Field Sizing**: Partitioning a CPU physical address into TAG, SET (LINE), and WORD offset fields for a set-associative cache.

---

### 2. Given Parameters
* **Cache Architecture**: $4$-way set-associative cache.
* **Total Number of Lines (Blocks)**: $128\\text{ lines}$.
* **Line Size (Block Size)**: $64\\text{ words}$.
* **CPU Address Bus**: $20\\text{ bits}$ (word-addressable memory).

---

### 3. Step-by-Step Analytical Derivation
In a set-associative cache, the address bits are partitioned as:
$$\\text{Address [19:0]} = [\\text{TAG}] \\; \\Vert \\; [\\text{SET / LINE}] \\; \\Vert \\; [\\text{WORD}]$$

1. **Word Offset Field (WORD)**:
   * Determined by line size in words:
     $$\\text{WORD bits} = \\log_2(\\text{Line Size}) = \\log_2(64) = 6\\text{ bits}$$
2. **Set Index Field (LINE / SET)**:
   * Sizing the number of sets in the cache:
     $$\\text{Number of Sets} = \\frac{\\text{Total Lines}}{\\text{Associativity}} = \\frac{128}{4} = 32\\text{ sets} = 2^5$$
   * Number of bits needed to index one of the 32 sets:
     $$\\text{LINE / SET bits} = \\log_2(32) = 5\\text{ bits}$$
3. **Tag Field (TAG)**:
   * Remaining upper address bits:
     $$\\text{TAG bits} = \\text{Address Bits} - (\\text{SET bits} + \\text{WORD bits}) = 20 - (5 + 6) = 20 - 11 = 9\\text{ bits}$$
4. **Summary**:
   $$(\\text{TAG}, \\text{LINE}, \\text{WORD}) = (9, 5, 6)$$

---

### 4. Distractor Analysis
* **Option A ($9, 6, 5$)**: Swaps line index and word offset fields.
* **Option B ($7, 7, 6$)**: Incorrectly divides 128 lines into direct-mapped addressing ($2^7$).
* **Option C ($7, 5, 8$)**: Incorrectly uses 8 bits for word offset ($256$ words).
* **Option D ($9, 5, 6$)**: **Correct**. Exactly 9 tag bits, 5 set index bits, and 6 word offset bits.

---

### 5. Concluding Answer
**Correct Answer: (D) 9, 5, 6**`,
    images: []
  },

  "go:1230": {
    concept: "Digital Logic - Boolean Function Equivalence & Non-Equivalent Cover Detection",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Verification - Minterm Equivalence**: Checking Boolean expressions for exact minterm coverage against a canonical sum-of-minterms specification.

---

### 2. Given Function
$$f(w, x, y, z) = \\sum m(0, 4, 5, 7, 8, 9, 13, 15)$$

---

### 3. Step-by-Step Analytical Derivation
Let us evaluate each expression against the defined minterm set $\\{0, 4, 5, 7, 8, 9, 13, 15\\}$:

1. **Expression P: $x'y'z' + w'xy' + wy'z + xz$**:
   * $x'y'z'$: covers $m_0(0000), m_8(1000)$. (Both in $f$)
   * $w'xy'$: covers $m_4(0100), m_5(0101)$. (Both in $f$)
   * $wy'z$: covers $m_9(1001), m_{13}(1101)$. (Both in $f$)
   * $xz$: covers $m_5(0101), m_7(0111), m_{13}(1101), m_{15}(1111)$. (All in $f$)
   * Union covers: $\\{0, 4, 5, 7, 8, 9, 13, 15\\} = f$. (Equivalent to $f$)

2. **Expression Q: $w'y'z' + wx'y' + xz$**:
   * $w'y'z'$: covers $m_0(0000), m_4(0100)$.
   * $wx'y'$: covers $m_8(1000), m_9(1001)$.
   * $xz$: covers $m_5, m_7, m_{13}, m_{15}$.
   * Union covers: $\\{0, 4, 5, 7, 8, 9, 13, 15\\} = f$. (Equivalent to $f$)

3. **Expression R: $w'y'z' + wx'y' + xyz + xy'z$**:
   * Since $xyz + xy'z = xz(y + y') = xz$, expression R reduces identically to expression Q. (Equivalent to $f$)

4. **Expression S: $x'y'z' + wx'y' + w'y$**:
   * Look at term $w'y$:
     * Corresponds to binary inputs where $w = 0$ and $y = 1$:
       $$m_2(0010), \\; m_3(0011), \\; m_6(0110), \\; m_7(0111)$$
     * Notice that minterms $m_2(0010)$ and $m_3(0011)$ are **NOT members of $f$**!
     * Because S asserts $1$ for $m_2$ and $m_3$, S is **NOT equivalent** to $f$.

---

### 4. Distractor Analysis
* **Option A**: Incorrect; P is fully equivalent.
* **Option B**: Incorrect; Q is equivalent.
* **Option C**: Incorrect; R is equivalent.
* **Option D (S only)**: **Correct**. Only expression S fails equivalence by covering false minterms.

---

### 5. Concluding Answer
**Correct Answer: (D) S only**`,
    images: []
  },

  "go:1231": {
    concept: "Digital Logic - Boolean XNOR Connective Properties & Equivalence",
    markdown: `### 1. Concept / Subtopic
**Boolean Algebra - XNOR Connective Identities**: Analyzing algebraic properties (commutativity, associativity, and inversion) of the equivalence (XNOR) connective.

---

### 2. Definition of Connective $*$
For Boolean variables $X$ and $Y$:
$$X * Y = XY + X'Y' = \\overline{X \\oplus Y}$$
Let $Z = X * Y = \\overline{X \\oplus Y}$.

---

### 3. Analytical Evaluation of Statements P, Q, and R

#### 3.1 Evaluating Statement P: $X = Y * Z$
* Express in terms of XOR algebra (using $\\overline{A \\oplus B} = A \\oplus B \\oplus 1$):
  $$Z = X \\oplus Y \\oplus 1$$
* Compute $Y * Z$:
  $$Y * Z = Y \\oplus Z \\oplus 1 = Y \\oplus (X \\oplus Y \\oplus 1) \\oplus 1$$
* Using associativity and $Y \\oplus Y = 0$:
  $$Y * Z = X \\oplus (Y \\oplus Y) \\oplus (1 \\oplus 1) = X \\oplus 0 \\oplus 0 = X$$
* Therefore, $X = Y * Z$ is **valid**.

#### 3.2 Evaluating Statement Q: $Y = X * Z$
* By commutativity of the XNOR connective:
  $$X * Z = Z * X = Y * Z = X$$
  Symmetrically, $X * Z = X \\oplus Z \\oplus 1 = X \\oplus (X \\oplus Y \\oplus 1) \\oplus 1 = Y$.
* Therefore, $Y = X * Z$ is **valid**.

#### 3.3 Evaluating Statement R: $X * Y * Z = 1$
* Compute $(X * Y) * Z$:
  $$(X * Y) * Z = Z * Z$$
* By definition of $*$:
  $$Z * Z = Z \\cdot Z + Z' \\cdot Z' = Z + Z' = 1$$
* Therefore, $X * Y * Z = 1$ is unconditionally **valid**.

---

### 4. Conclusion
All three statements $P$, $Q$, and $R$ are mathematically valid identities.

---

### 5. Concluding Answer
**Correct Answer: (D) All P, Q, R are valid**`,
    images: []
  },

  "go:1232": {
    concept: "Digital Logic - Universal Function Implementation Using Multiplexer and Inverter",
    markdown: `### 1. Concept / Subtopic
**Shannon's Decomposition - Multiplexer Sizing**: Determining the minimum multiplexer capacity required to synthesize any arbitrary $n$-variable Boolean function using Shannon's expansion theorem with at most one external inverter.

---

### 2. Governing Theorem
By **Shannon's Expansion Theorem**, any Boolean function $f(x_1, x_2, \\dots, x_n)$ of $n$ variables can be expanded with respect to $(n-1)$ select variables ($x_1, \\dots, x_{n-1}$) as:
$$f(x_1, \\dots, x_n) = \\sum_{k=0}^{2^{n-1}-1} m_k(x_1, \\dots, x_{n-1}) \\cdot f_k(x_n)$$
where each residual sub-function $f_k(x_n)$ depends on the single remaining variable $x_n$.

---

### 3. Step-by-Step Analytical Derivation
1. **Residual Function Analysis**:
   * For a single Boolean variable $x_n$, there are only $4$ possible functions:
     $$f_k(x_n) \\in \\{0, \\; 1, \\; x_n, \\; \\bar{x_n}\\}$$
2. **Hardware Realization**:
   * Connect the $(n - 1)$ variables $x_1, x_2, \\dots, x_{n-1}$ to the select lines of a multiplexer.
   * A multiplexer with $(n - 1)$ select lines has $2^{n-1}$ data input lines (a $2^{n-1}$-to-1 multiplexer).
   * Each data input line $I_k$ can be directly connected to:
     * Logic $0$ (Ground)
     * Logic $1$ (Vdd)
     * The uncomplemented variable $x_n$
     * The complemented variable $\\bar{x_n}$ (generated by the single allowed external inverter)
3. **Optimality Proof**:
   * With a single inverter to produce $\\bar{x_n}$, every possible input $I_k \\in \\{0, 1, x_n, \\bar{x_n}\\}$ can be fed to any data pin.
   * Hence, an arbitrary $n$-variable Boolean function can always be realized using a $2^{n-1}$-to-1 multiplexer.
   * A smaller multiplexer ($2^{n-2}$-to-1) leaves $2$ residual variables, which can yield up to $16$ distinct sub-functions that cannot all be formed using only one inverter.

---

### 4. Distractor Analysis
* **Option A ($2^n$-to-1)**: Required only if no external inverters or variable inputs are used (data inputs restricted to constants $0$ and $1$).
* **Option B ($2^{n+1}$-to-1)**: Over-provisioned.
* **Option C ($2^{n-1}$-to-1)**: **Correct**. Minimum size required when leveraging one variable and one inverter at the data inputs.
* **Option D ($2^{n-2}$-to-1)**: Insufficient; cannot implement all functions with only one inverter.

---

### 5. Concluding Answer
**Correct Answer: (C) 2^{n-1} line to 1 line**`,
    images: []
  },

  "go:1233": {
    concept: "Digital Logic - Look-Ahead Carry Generator Gate Count Complexity",
    markdown: `### 1. Concept / Subtopic
**Arithmetic Circuits - Carry Lookahead Generator Gate Sizing**: Determining the exact count of multi-input AND and OR gates required in a two-level logic implementation of a 4-bit look-ahead carry generator.

---

### 2. Given Carry Equations
Given inputs $C_0$ (initial carry-in), and bit-level signals $P_i, G_i$ for $i \\in \\{0, 1, 2, 3\\}$.
The carry-out bits generated by the look-ahead carry generator are:
$$C_1 = G_0 + P_0 C_0$$
$$C_2 = G_1 + P_1 G_0 + P_1 P_0 C_0$$
$$C_3 = G_2 + P_2 G_1 + P_2 P_1 G_0 + P_2 P_1 P_0 C_0$$
$$C_4 = G_3 + P_3 G_2 + P_3 P_2 G_1 + P_3 P_2 P_1 G_0 + P_3 P_2 P_1 P_0 C_0$$

---

### 3. Step-by-Step Gate Count Enumeration
The question specifically asks for the two-level AND-OR implementation of the **look-ahead carry generator** circuit (which computes the internal and output carries $C_1, C_2, C_3, C_4$):

1. **AND Gates Required (Level 1)**:
   * For $C_1$: term $P_0 C_0$ requires **1 AND gate** ($G_0$ is directly available).
   * For $C_2$: terms $P_1 G_0$ and $P_1 P_0 C_0$ require **2 AND gates**.
   * For $C_3$: terms $P_2 G_1$, $P_2 P_1 G_0$, and $P_2 P_1 P_0 C_0$ require **3 AND gates**.
   * For $C_4$: terms $P_3 G_2$, $P_3 P_2 G_1$, $P_3 P_2 P_1 G_0$, and $P_3 P_2 P_1 P_0 C_0$ require **4 AND gates**.
   * Total number of AND gates:
     $$\\text{Total AND} = 1 + 2 + 3 + 4 = 10\\text{ AND gates}$$

2. **OR Gates Required (Level 2)**:
   * To sum the generated product terms for each carry:
     * One OR gate to compute $C_1$.
     * One OR gate to compute $C_2$.
     * One OR gate to compute $C_3$.
     * One OR gate to compute $C_4$.
   * Total number of OR gates:
     $$\\text{Total OR} = 1 + 1 + 1 + 1 = 4\\text{ OR gates}$$

*(Note: The sum bits $S_i = P_i \\oplus C_i$ are computed by separate XOR gates outside the carry generator block).*

---

### 4. Distractor Analysis
* **Option A ($6, 3$)**: Miscounts terms by omitting $C_4$.
* **Option B ($10, 4$)**: **Correct**. Exactly $10$ AND gates and $4$ OR gates form the two-level carry generator.
* **Option C ($6, 4$)**: Underestimates AND product count.
* **Option D ($10, 5$)**: Erroneously adds a fifth OR gate for an unneeded stage.

---

### 5. Concluding Answer
**Correct Answer: (B) 10, 4**`,
    images: []
  },

  "go:1234": {
    concept: "Digital Logic - Synchronous Binary Counter State Sequence Analysis",
    markdown: `### 1. Concept / Subtopic
**Sequential Counter Circuits - Modulo Counting Cycle**: Tracing the state sequence of a 4-bit synchronous binary counter controlled by combinational feedback logic connected to its synchronous Load and Clear inputs.

---

### 2. Circuit Architecture & Control Logic
* Counter outputs: $Q_3 Q_2 Q_1 Q_0$, initially cleared to $0000_2$ ($0$).
* Control rules from function table:
  * When $\\text{Clear} = 0, \\text{Load} = 0, \\text{Count} = 1$: Counter increments on rising clock edge:
    $$Q^+ = Q + 1$$
  * When $\\text{Clear} = 0, \\text{Load} = 1$: Counter synchronously loads parallel data inputs on rising clock edge.
* Feedback Connections:
  * An external gate decodes state $4$ ($Q_3 Q_2 Q_1 Q_0 = 0100_2$, with $Q_2 = 1$).
  * The parallel data inputs are hardwired to $0000_2$.
  * When state $4$ is reached, the feedback logic asserts the synchronous $\\text{Load}$ input.

---

### 3. Step-by-Step Analytical Trace
* **Initial State**: $Q = 0$ ($0000_2$). Load is $0$, Count is $1$.
* **Clock 1**: $Q$ increments from $0 \\to 1$.
* **Clock 2**: $Q$ increments from $1 \\to 2$.
* **Clock 3**: $Q$ increments from $2 \\to 3$.
* **Clock 4**: $Q$ increments from $3 \\to 4$ ($0100_2$).
  * In state $4$, output $Q_2 = 1$ asserts the $\\text{Load}$ control line.
  * The counter inputs are hardwired to $0000_2$.
* **Clock 5**:
  * Because $\\text{Load} = 1$ at the active clock edge, the counter loads $0000_2$, resetting state to $0$ synchronously.
* **Complete Closed Cycle**:
  The sequence of states stably traversed by the counter is:
  $$0 \\longrightarrow 1 \\longrightarrow 2 \\longrightarrow 3 \\longrightarrow 4 \\longrightarrow 0$$

---

### 4. Distractor Analysis
* **Option A ($0, 3, 4$)**: Skips intermediate counting states.
* **Option B ($0, 3, 4, 5$)**: Erroneous sequence.
* **Option C ($0, 1, 2, 3, 4$)**: **Correct**. Represents the true 5-state counting loop ($0, 1, 2, 3, 4$).
* **Option D ($0, 1, 2, 3, 4, 5$)**: Assumes asynchronous clear or delayed decoding where state 5 is momentarily visited.

---

### 5. Concluding Answer
**Correct Answer: (C) 0, 1, 2, 3, 4**`,
    images: []
  },

  "go:1235": {
    concept: "CO & Architecture - Pipelined Processor Execution Trace with Variable EX Latency",
    markdown: `### 1. Concept / Subtopic
**Pipelining Performance - Data Hazard Resolution with Operand Forwarding**: Tracing clock cycle execution of instructions with heterogeneous execution stage latencies in a 4-stage pipeline.

---

### 2. Given Parameters & Pipeline Characteristics
* **Pipeline Stages**: IF ($1$ cycle), ID ($1$ cycle), EX (Variable), WB ($1$ cycle).
* **EX Stage Delays**:
  * \`ADD\`, \`SUB\`: $1$ clock cycle.
  * \`MUL\`: $3$ clock cycles.
* **Hazard Resolution**: Operand forwarding is implemented from EX output to EX input.
* **Instruction Stream**:
  * $I_1$: \`ADD R2, R1, R0\` $\\implies$ computes \`R2\` (EX $= 1$).
  * $I_2$: \`MUL R4, R3, R2\` $\\implies$ reads \`R2\`, computes \`R4\` (EX $= 3$, RAW dependency on \`R2\`).
  * $I_3$: \`SUB R6, R5, R4\` $\\implies$ reads \`R4\`, computes \`R6\` (EX $= 1$, RAW dependency on \`R4\`).

---

### 3. Step-by-Step Cycle-by-Cycle Pipeline Trace
Let us trace the three instructions through clock cycles $1$ to $8$:

* **Cycle 1**:
  * $I_1$: IF
* **Cycle 2**:
  * $I_1$: ID
  * $I_2$: IF
* **Cycle 3**:
  * $I_1$: EX ($1$ cycle). At the end of cycle 3, the result for register \`R2\` is produced in the EX buffer.
  * $I_2$: ID. \`R2\` is forwarded directly from the end of $I_1$'s EX stage to $I_2$'s EX stage, eliminating any decode stall!
* **Cycle 4**:
  * $I_1$: WB (completes)
  * $I_2$: $\\text{EX}_1$ (cycle 1 of 3 for \`MUL\`)
  * $I_3$: IF
* **Cycle 5**:
  * $I_2$: $\\text{EX}_2$ (cycle 2 of 3)
  * $I_3$: ID. ($I_3$ requires \`R4\` from $I_2$. Since $I_2$ is still in EX, $I_3$ must stall in the ID stage).
* **Cycle 6**:
  * $I_2$: $\\text{EX}_3$ (cycle 3 of 3). At the end of cycle 6, \`R4\` is computed!
  * $I_3$: ID (stalled, receives forwarded \`R4\` at end of cycle 6).
* **Cycle 7**:
  * $I_2$: WB (completes)
  * $I_3$: EX ($1$ cycle for \`SUB\`). Computes \`R6\` at end of cycle 7.
* **Cycle 8**:
  * $I_3$: WB (completes!)

The entire instruction sequence terminates at the end of **Clock Cycle 8**.

---

### 4. Distractor Analysis
* **Option A ($7$)**: Omits one stall cycle during the 3-cycle multiplication.
* **Option B ($8$)**: **Correct**. Exactly 8 clock cycles with forwarding and 1 pipeline stall.
* **Option C ($10$)**: Assumes no forwarding (stalling until WB write-back completes).
* **Option D ($14$)**: Severe unpipelined serialization.

---

### 5. Concluding Answer
**Correct Answer: (B) 8**`,
    images: []
  },

  "go:1246": {
    concept: "Digital Logic - Conjunctive Normal Form Satisfiability & Probabilistic Bounds",
    markdown: `### 1. Concept / Subtopic
**Mathematical Logic & Boolean Satisfiability**: Applying the probabilistic method to prove existential lower bounds on clause satisfiability for Boolean formulae in Conjunctive Normal Form (CNF).

---

### 2. Governing Theorem (MAX-SAT Probabilistic Bound)
Let $\\phi$ be an arbitrary propositional formula in Conjunctive Normal Form (CNF) consisting of $m$ non-trivial clauses $C_1, C_2, \\dots, C_m$, where each clause $C_i$ is a disjunction of $k_i$ distinct literals ($k_i \\ge 1$).

---

### 3. Mathematical Proof by Linearity of Expectation
1. **Random Truth Assignment**:
   * Assign a truth value independently and uniformly at random to each of the $n$ Boolean variables:
     $$\\Pr[x_j = \\text{True}] = \\frac{1}{2}, \\quad \\Pr[x_j = \\text{False}] = \\frac{1}{2}$$
2. **Clause Satisfaction Probability**:
   * A clause $C_i$ with $k_i$ literals evaluates to **False** if and only if every single literal in the clause evaluates to False.
   * Since variable assignments are independent:
     $$\\Pr[C_i = \\text{False}] = \\left( \\frac{1}{2} \\right)^{k_i}$$
   * The probability that clause $C_i$ evaluates to **True** is:
     $$\\Pr[C_i = \\text{True}] = 1 - \\left( \\frac{1}{2} \\right)^{k_i}$$
3. **Bounding Clause Probability**:
   * Since every clause in a CNF formula has at least one literal ($k_i \\ge 1$):
     $$\\Pr[C_i = \\text{True}] = 1 - \\frac{1}{2^{k_i}} \\ge 1 - \\frac{1}{2^1} = \\frac{1}{2}$$
4. **Expected Number of Satisfied Clauses**:
   * Let $X$ be the random variable representing the total number of satisfied clauses:
     $$X = \\sum_{i=1}^m I_{C_i}, \\quad \\text{where } I_{C_i} = \\begin{cases} 1, & C_i = \\text{True} \\\\ 0, & C_i = \\text{False} \\end{cases}$$
   * By linearity of expectation:
     $$E[X] = \\sum_{i=1}^m E[I_{C_i}] = \\sum_{i=1}^m \\Pr[C_i = \\text{True}] \\ge \\sum_{i=1}^m \\frac{1}{2} = \\frac{m}{2}$$
5. **Existence of Truth Assignment**:
   * Since the mean value $E[X] \\ge \\frac{m}{2}$, there **must exist at least one specific truth assignment** for which the number of satisfied clauses is greater than or equal to the expectation:
     $$X \\ge \\frac{m}{2}$$
   * Therefore, for any CNF formula, there is guaranteed to be a truth assignment for which **at least half the clauses evaluate to true**.

---

### 4. Distractor Analysis
* **Option A**: **Correct**. Proven rigorously via linearity of expectation.
* **Option B**: False; contradictory formulas (such as $x \\wedge \\bar{x}$) cannot satisfy all clauses simultaneously.
* **Option C**: False; directly contradicts the universal lower bound of $1/2$.
* **Option D**: False; Option A is a well-established theorem.

---

### 5. Concluding Answer
**Correct Answer: (A)**`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-HW-12: GATE CSE 2007 & IT 2007 Hardware Part 2
  // ==========================================
  "go:1252": {
    concept: "CO & Architecture - Basic Block Code Generation & Register Allocation",
    markdown: `### 1. Concept / Subtopic
**Code Generation & Register Allocation**: Minimizing memory transfer (\`MOV\`) instructions for compiling a 4-statement basic block onto a 2-register architecture supporting memory-operand operations.

---

### 2. Machine Architecture & Instruction Set
* **Available Registers**: Only two registers: $R_0$ and $R_1$.
* **Instruction Semantics**:
  * \`OP Rj, Ri\`: $R_j \\leftarrow R_j \\text{ OP } R_i$
  * \`OP m, Ri\`: $R_i \\leftarrow M[m] \\text{ OP } R_i$ (performs operation with memory operand directly).
  * \`MOV m, Ri\`: $R_i \\leftarrow M[m]$ (Load from memory).
  * \`MOV Ri, m\`: $M[m] \\leftarrow R_i$ (Store to memory).
* **Given Basic Block**:
  1. $t_1 = a + b$
  2. $t_2 = c + d$
  3. $t_3 = e - t_2$
  4. $t_4 = t_1 - t_3$ (Final value to be stored in memory).

---

### 3. Step-by-Step Analytical Derivation
1. **Exploiting Memory Operand Instructions**:
   * Notice that the instruction \`OP m, Ri\` performs an operation between memory operand $M[m]$ and register $R_i$ without requiring a separate \`MOV\` load instruction for $M[m]$.
2. **Optimal Instruction Schedule with 2 Registers ($R_0, R_1$)**:
   * **Step 1**: Load variable $b$ into $R_0$:
     \`MOV b, R0\` $\\implies$ **(MOV 1)**
   * **Step 2**: Add variable $a$ directly from memory into $R_0$:
     \`ADD a, R0\` $\\implies R_0 = a + b = t_1$ ($0$ MOVs).
   * **Step 3**: Load variable $d$ into $R_1$:
     \`MOV d, R1\` $\\implies$ **(MOV 2)**
   * **Step 4**: Add variable $c$ directly from memory into $R_1$:
     \`ADD c, R1\` $\\implies R_1 = c + d = t_2$ ($0$ MOVs).
   * **Step 5**: Compute $t_3 = e - t_2$. Using \`SUB e, R1\`:
     \`SUB e, R1\` $\\implies R_1 = e - R_1 = e - t_2 = t_3$ ($0$ MOVs).
   * **Step 6**: Compute $t_4 = t_1 - t_3$:
     \`SUB R1, R0\` $\\implies R_0 = R_0 - R_1 = t_1 - t_3 = t_4$ ($0$ MOVs).
   * **Step 7**: Store final computation $t_4$ back to memory location $m$:
     \`MOV R0, m\` $\\implies$ **(MOV 3)**
3. **Total \`MOV\` Count**:
   The generated sequence contains exactly $3$ \`MOV\` instructions (2 loads and 1 store).

---

### 4. Distractor Analysis
* **Option A ($2$)**: Impossible; requires at least 2 loads to populate the two registers plus 1 store for the final memory commitment.
* **Option B ($3$)**: **Correct**. Achievable with exactly 3 \`MOV\` instructions.
* **Option C ($5$)**: Naive code generation without leveraging memory-operand \`OP m, Ri\` operations.
* **Option D ($6$)**: Un-optimized compilation spilling intermediate temporaries.

---

### 5. Concluding Answer
**Correct Answer: (B) 3**`,
    images: []
  },

  "go:1269": {
    concept: "CO & Architecture - Memory Reference Counting for Data Operands",
    markdown: `### 1. Concept / Subtopic
**Instruction Execution Analysis - Data Memory Bus References**: Distinguishing data memory references from instruction fetch cycles and computing total data accesses in a loop.

---

### 2. Program Structure & Initial State
* Initial State: $M[3000] = 10$, register $R_3 = 2000$.
* Memory is word-addressable.
* Loop control: $R_1$ initialized to $M[3000] = 10$, decremented by $1$ in each iteration until $R_1 = 0$ ($10$ loop iterations).

---

### 3. Step-by-Step Analytical Derivation
The question explicitly asks for memory references **for accessing the data** (excluding instruction fetch references):

1. **Before Loop Entry**:
   * \`MOV R1, (3000)\`: Reads data from memory address $3000$.
   * Data memory references $= 1$.
2. **Inside the Loop (\`LOOP:\`)**:
   * \`MOV R2, (R3)\`: Reads data word from memory address in $R_3$ $\\implies 1$ read reference.
   * \`ADD R2, R1\`: Register-to-register operation $\\implies 0$ data references.
   * \`MOV (R3), R2\`: Writes data word to memory address in $R_3$ $\\implies 1$ write reference.
   * \`INC R3\`: Register operation $\\implies 0$ data references.
   * \`DEC R1\`: Register operation $\\implies 0$ data references.
   * \`BNZ LOOP\`: Branch control operation $\\implies 0$ data references.
   * Total data memory references per iteration:
     $$\\text{Refs per loop} = 1 \\text{ (read)} + 1 \\text{ (write)} = 2\\text{ references}$$
3. **Total Data References Across Program**:
   * Number of loop iterations $= 10$.
   * Total references inside loop $= 10 \\times 2 = 20\\text{ references}$.
   * Including the initial read from location $3000$:
     $$\\text{Total Data References} = 1 + 20 = 21\\text{ references}$$

---

### 4. Distractor Analysis
* **Option A ($10$)**: Counts only read operations in the loop.
* **Option B ($11$)**: Counts only reads (10 in loop + 1 before loop), ignoring memory writes.
* **Option C ($20$)**: Forgets the initial read of location $3000$.
* **Option D ($21$)**: **Correct**. Exactly $1 + (10 \\times 2) = 21$ data memory references.

---

### 5. Concluding Answer
**Correct Answer: (D) 21**`,
    images: []
  },

  "go:43515": {
    concept: "CO & Architecture - Memory Modification Range in Program Execution",
    markdown: `### 1. Concept / Subtopic
**Assembly Program Execution - Memory State Verification**: Determining the contents of a specific memory cell after execution of an indexed loop.

---

### 2. Program State & Register Trace
* Initial register value: $R_3 = 2000$.
* Initial loop counter: $R_1 = M[3000] = 10$.
* Memory range $2000$ to $2010$ initially initialized to $100$.

---

### 3. Step-by-Step Execution Trace
Let us trace the memory addresses written by \`MOV (R3), R2\` during each iteration:
* **Iteration 1**: Writes to $M[2000]$, then \`INC R3\` sets $R_3 = 2001$.
* **Iteration 2**: Writes to $M[2001]$, then \`INC R3\` sets $R_3 = 2002$.
* **Iteration 3**: Writes to $M[2002]$, then \`INC R3\` sets $R_3 = 2003$.
* ...
* **Iteration 10**: Writes to $M[2009]$, then \`INC R3\` sets $R_3 = 2010$.
* Next, \`DEC R1\` decrements $R_1$ from $1 \\to 0$.
* \`BNZ LOOP\` tests $R_1$. Since $R_1 = 0$, the branch is **NOT taken**, and the program halts at \`HALT\`!
* Memory location $2010$ was never targeted by a write instruction.
* Consequently, the content of memory location $2010$ remains at its initial value:
  $$M[2010] = 100$$

---

### 4. Distractor Analysis
* **Option A ($100$)**: **Correct**. Memory location 2010 was never written, retaining its original value 100.
* **Option B ($101$)**: Erroneously assumes location 2010 was modified in an 11th iteration.
* **Option C ($102$)**: Incorrect accumulation.
* **Option D ($110$)**: Value of $M[2000]$ after addition ($100 + 10$).

---

### 5. Concluding Answer
**Correct Answer: (A) 100**`,
    images: []
  },

  "go:43516": {
    concept: "CO & Architecture - Interrupt Return Address & Byte-Addressable Memory Sizing",
    markdown: `### 1. Concept / Subtopic
**Interrupt Handling & Program Counter Updates**: Calculating the return address pushed onto the stack during an interrupt occurring in a byte-addressable system with multi-byte instruction words.

---

### 2. Given Parameters
* **Memory Addressing**: Byte-addressable.
* **Word Size**: $32\\text{ bits} = 4\\text{ bytes}$.
* **Instruction Sizes (in words)**:
  * 1 word instruction $= 4\\text{ bytes}$.
  * 2 word instruction $= 8\\text{ bytes}$.
* **Program Base Address**: Loaded starting at memory address $1000_{10}$.

---

### 3. Step-by-Step Analytical Derivation
1. **Memory Map of the Instruction Sequence**:
   * Address $1000$: \`MOV R1, (3000)\` (2 words $= 8$ bytes) $\\implies$ occupies bytes $1000$ to $1007$.
   * Address $1008$: \`LOOP: MOV R2, (R3)\` (1 word $= 4$ bytes) $\\implies$ occupies bytes $1008$ to $1011$.
   * Address $1012$: \`ADD R2, R1\` (1 word $= 4$ bytes) $\\implies$ occupies bytes $1012$ to $1015$.
   * Address $1016$: \`MOV (R3), R2\` (1 word $= 4$ bytes) $\\implies$ occupies bytes $1016$ to $1019$.
   * Address $1020$: \`INC R3\` (1 word $= 4$ bytes) $\\implies$ occupies bytes $1020$ to $1023$.
   * Address $1024$: \`DEC R1\` (1 word $= 4$ bytes) $\\implies$ starts at byte $1024$.
2. **Interrupt Return Semantics**:
   * When an external interrupt occurs during the execution of instruction \`INC R3\`, the processor completes the execution of \`INC R3\` before servicing the interrupt service routine (ISR).
   * The hardware Program Counter (PC) automatically points to the next instruction in sequence (\`DEC R1\`).
   * The return address pushed onto the stack is the start address of the next instruction:
     $$\\text{Return Address} = 1024$$

---

### 4. Distractor Analysis
* **Option A ($1005$)**: Mistaken word-address calculation without scaling by 4 bytes.
* **Option B ($1020$)**: This is the address of \`INC R3\` itself; returning here would re-execute the increment.
* **Option C ($1024$)**: **Correct**. Points to the subsequent instruction \`DEC R1\` at address 1024.
* **Option D ($1040$)**: Excessive offset.

---

### 5. Concluding Answer
**Correct Answer: (C) 1024**`,
    images: []
  },

  "go:1273": {
    concept: "CO & Architecture - Direct Mapped Cache Misses in Two-Pass Array Access",
    markdown: `### 1. Concept / Subtopic
**Cache Memory Hierarchy - Cache Conflicts in Repeated Array Passes**: Determining total data cache misses for repeated traversals of a two-dimensional array that exceeds cache capacity.

---

### 2. Given Parameters
* **Cache Architecture**: Direct mapped data cache.
* **Number of Cache Lines**: $32\\text{ lines}$.
* **Block Size**: $64\\text{ bytes}$.
* **Cache Capacity**:
  $$\\text{Capacity} = 32 \\times 64\\text{ bytes} = 2048\\text{ bytes} = 2\\text{ KB}$$
* **Array Dimensions**: $50 \\times 50$ two-dimensional array of bytes ($1\\text{ byte}$ per element).
* **Array Total Size**:
  $$\\text{Size} = 50 \\times 50 = 2500\\text{ bytes}$$
* **Starting Memory Address**: $1100_{16} = 4352_{10}$.
  * Notice $4352 = 68 \\times 64$, which is an exact multiple of the $64$-byte block size!
* **Array Blocks in Memory**:
  $$\\text{Blocks} = \\left\\lceil \\frac{2500}{64} \\right\\rceil = 40\\text{ blocks (Blocks } 0 \\text{ to } 39\\text{)}$$
  (Block 39 contains the remaining $2500 - 39 \\times 64 = 2500 - 2496 = 4\\text{ bytes}$).

---

### 3. Step-by-Step Analytical Derivation
1. **Pass 1 (First Traversal)**:
   * The cache is initially empty.
   * Accessing the array sequentially requires fetching all $40$ contiguous memory blocks.
   * Every block encounters a compulsory (cold) miss:
     $$M_{\\text{Pass 1}} = 40\\text{ misses}$$
   * Sizing line assignments ($B \\bmod 32$ where block 0 maps to line $68 \\bmod 32 = 4$):
     * First $32$ blocks (Blocks $0$ to $31$) populate all $32$ cache lines.
     * The last $8$ blocks (Blocks $32$ to $39$) map onto lines $4$ through $11$, overwriting Blocks $0$ to $7$.
2. **Cache State at End of Pass 1**:
   * Lines $4$ to $11$: Hold Blocks $32$ to $39$.
   * Remaining $24$ lines: Hold Blocks $8$ to $31$.
3. **Pass 2 (Second Traversal)**:
   * **Blocks $0$ to $7$**:
     * Were overwritten by Blocks $32$ to $39$ at the end of Pass 1.
     * All $8$ blocks experience conflict misses:
       $$\\text{Misses} = 8$$
     * These $8$ blocks are loaded back into lines $4$ to $11$, evicting Blocks $32$ to $39$.
   * **Blocks $8$ to $31$**:
     * Remained undisturbed in their cache lines throughout Pass 1!
     * All $24$ blocks are **Cache Hits** ($0$ misses).
   * **Blocks $32$ to $39$**:
     * Because Blocks $0$ to $7$ just evicted them during Pass 2, accessing Blocks $32$ to $39$ causes another $8$ conflict misses:
       $$\\text{Misses} = 8$$
   * Total misses in Pass 2:
     $$M_{\\text{Pass 2}} = 8 + 8 = 16\\text{ misses}$$
4. **Total Misses Across Both Passes**:
   $$M_{\\text{total}} = M_{\\text{Pass 1}} + M_{\\text{Pass 2}} = 40 + 16 = 56\\text{ misses}$$

---

### 4. Distractor Analysis
* **Option A ($48$)**: Underestimates conflict misses.
* **Option B ($50$)**: Arbitrary approximation based on dimension 50.
* **Option C ($56$)**: **Correct**. Exactly $40$ compulsory misses $+ 16$ conflict misses $= 56$.
* **Option D ($59$)**: Miscalculates block alignment.

---

### 5. Concluding Answer
**Correct Answer: (C) 56**`,
    images: []
  },

  "go:43511": {
    concept: "CO & Architecture - Cache Block Replacement Set Range in Repeated Traversals",
    markdown: `### 1. Concept / Subtopic
**Memory Hierarchy - Direct-Mapped Cache Line Conflict Mapping**: Identifying the specific cache line indices replaced by new blocks during a second traversal of an array.

---

### 2. Given Parameters & Base Address Mapping
* Array starting address: $1100_{16} = 4352_{10}$.
* Cache Block Size: $64\\text{ bytes} = 2^6$.
* Number of Cache Lines: $32\\text{ lines} = 2^5$.
* Memory Block Number of base address:
  $$\\text{Block}_0 = \\frac{4352}{64} = 68$$
* Cache Line Index for base block:
  $$\\text{Line Index}_0 = 68 \\bmod 32 = 4$$

---

### 3. Step-by-Step Analytical Derivation
1. **Mapping of Conflicting Blocks**:
   * From the derivation in Question 80, the array spans $40$ blocks (Blocks $0$ to $39$).
   * Because the cache holds only $32$ lines, the blocks that exceed cache capacity are Blocks $32$ to $39$ ($8$ blocks).
2. **Identifying Replaced Lines**:
   * Block $32$ maps to line:
     $$(68 + 32) \\bmod 32 = 100 \\bmod 32 = 4$$
   * Block $39$ maps to line:
     $$(68 + 39) \\bmod 32 = 107 \\bmod 32 = 11$$
   * Thus, Blocks $32$ through $39$ occupy **lines 4 through 11**.
3. **Replacement during Pass 2**:
   * In Pass 2, accessing Blocks $0$ to $7$ forces lines $4$ through $11$ to replace Blocks $32$ through $39$.
   * Subsequently, accessing Blocks $32$ to $39$ forces lines $4$ through $11$ to replace Blocks $0$ through $7$.
   * Lines $0$ to $3$ and lines $12$ to $31$ are never touched by conflicting higher blocks.
   * Therefore, the only lines replaced by new blocks during the second traversal are **line 4 to line 11**.

---

### 4. Distractor Analysis
* **Option A (line 4 to line 11)**: **Correct**. Correctly aligns with base offset $4352 \\bmod 2048 = 256 \\implies$ lines $4$ to $11$.
* **Option B (line 4 to line 12)**: Overcounts by 1 line ($9$ lines instead of $8$).
* **Option C (line 0 to line 7)**: Assumes starting address begins at $0000_{16}$ (line 0) rather than $1100_{16}$ (line 4).
* **Option D (line 0 to line 8)**: Assumes unshifted alignment.

---

### 5. Concluding Answer
**Correct Answer: (A) line 4 to line 11**`,
    images: []
  },

  "go:3437": {
    concept: "CO & Architecture - Asymptotic Pipelining Speedup with Bottleneck Stage",
    markdown: `### 1. Concept / Subtopic
**Pipelining Performance - Asymptotic Speedup & Bottleneck Stage**: Calculating the theoretical maximum speedup of a multi-stage instruction pipeline with unequal stage execution delays.

---

### 2. Given Parameters
* **Unpipelined Execution Time**: $T_{\\text{unpipe}} = 12\\text{ cycles}$ per instruction.
* **Pipelined Processor**: $6$ stages with execution times:
  $$\\tau = [3, \\; 2, \\; 5, \\; 4, \\; 6, \\; 2]\\text{ cycles}$$
* **Workload**: Very large number of instructions ($N \\to \\infty$).

---

### 3. Step-by-Step Analytical Derivation
1. **Clock Period of the Pipelined Processor**:
   * In a synchronous pipeline, each stage must complete within the common clock period.
   * The pipeline cycle time is determined by the slowest (bottleneck) stage:
     $$\\tau_{\\text{pipe}} = \\max(3, 2, 5, 4, 6, 2) = 6\\text{ cycles}$$
2. **Execution Time for $N$ Instructions**:
   * Unpipelined processor:
     $$T_1 = N \\times T_{\\text{unpipe}} = 12N\\text{ cycles}$$
   * $k$-stage pipelined processor ($k = 6$):
     $$T_k = [k + (N - 1)] \\times \\tau_{\\text{pipe}} = [6 + (N - 1)] \\times 6\\text{ cycles}$$
3. **Asymptotic Speedup ($N \\to \\infty$)**:
   $$S = \\lim_{N \\to \\infty} \\frac{T_1}{T_k} = \\lim_{N \\to \\infty} \\frac{12N}{6(N + 5)} = \\frac{12}{6} = 2$$

---

### 4. Distractor Analysis
* **Option A ($1.83$)**: Incorrect arithmetic division.
* **Option B ($2$)**: **Correct**. Asymptotic speedup is $12 / 6 = 2$.
* **Option C ($3$)**: Assumes bottleneck stage was 4 cycles ($12 / 4 = 3$).
* **Option D ($6$)**: Ideal speedup for a 6-stage balanced pipeline, which is unachievable due to stage imbalance.

---

### 5. Concluding Answer
**Correct Answer: (B) 2**`,
    images: []
  },

  "go:3440": {
    concept: "Digital Logic - SR Latch Metastability and Oscillatory Input Sequences",
    markdown: `### 1. Concept / Subtopic
**Sequential Circuits - Metastability & Hazard Oscillations**: Analyzing race conditions and oscillatory behavior in an active-low NAND-based SR latch.

---

### 2. Governing Equations
An active-low $\\bar{S}\\text{-}\\bar{R}$ latch implemented with cross-coupled NAND gates has feedback equations:
$$Q = \\overline{S \\cdot Q'}, \\qquad Q' = \\overline{R \\cdot Q}$$

---

### 3. Step-by-Step Analytical Derivation
1. **Applying Input $00$ ($S = 0, R = 0$)**:
   * Since any $0$ into a NAND gate forces output $1$:
     $$Q = \\overline{0 \\cdot Q'} = 1, \\qquad Q' = \\overline{0 \\cdot Q} = 1$$
   * Both outputs are forced to logic $1$, violating the complementary property $Q' = \\bar{Q}$.
2. **Transitioning to Input $11$ ($S = 1, R = 1$)**:
   * In state $11$, a NAND gate acts as an inverter of its other input:
     $$Q^+ = \\overline{1 \\cdot Q'} = \\overline{Q'}, \\qquad Q'^+ = \\overline{1 \\cdot Q} = \\overline{Q}$$
   * Because both $Q = 1$ and $Q' = 1$ initially:
     $$Q^+ = \\bar{1} = 0, \\qquad Q'^+ = \\bar{1} = 0$$
   * Now both outputs become $00$.
   * Feeding $00$ back into the NAND gates gives:
     $$Q^{++} = \\bar{0} = 1, \\qquad Q'^{++} = \\bar{0} = 1$$
   * Both outputs flip back to $11$!
3. **Oscillation Phenomenon**:
   * Under perfectly symmetric gate delays, the circuit enters an undamped oscillation:
     $$(Q, Q') = (1, 1) \\longleftrightarrow (0, 0)$$
   * In physical circuits with slight delay asymmetries, it results in severe metastability before randomly settling.
   * Hence, the transition sequence **$00 \\to 11$** leads to oscillation/metastability.

---

### 4. Distractor Analysis
* **Option A ($11, 00$)**: Stable reset to $(1, 1)$.
* **Option B ($01, 10$)**: Standard toggle between Set and Reset states; completely stable.
* **Option C ($10, 01$)**: Standard stable state transition.
* **Option D ($00, 11$)**: **Correct**. Switching from invalid state $00$ directly to quiescent state $11$ triggers oscillation/race conditions.

---

### 5. Concluding Answer
**Correct Answer: (D) 00, 11**`,
    images: []
  },

  "go:3441": {
    concept: "Digital Logic - 2-Input AND Gate Realization Using Multiplexers",
    markdown: `### 1. Concept / Subtopic
**Combinational Logic Synthesis - Multiplexer Logic Realization**: Implementing a 2-input AND function using a cascade of 2-to-1 multiplexers.

---

### 2. Given Circuit & Equations
* Target logic function: $f(a, b) = ab$.
* Two 2-to-1 multiplexers with select lines and data inputs $X_1, X_2, X_3$.
* A 2-to-1 MUX with select line $S$ and inputs $I_0, I_1$ implements:
  $$\\text{Out} = \\bar{S} I_0 + S I_1$$

---

### 3. Step-by-Step Analytical Derivation
1. **Top MUX (MUX 1)**:
   * Select line is $X_1$.
   * Data inputs are $0$ (at input 0) and $X_2$ (at input 1).
   * Output of MUX 1:
     $$\\text{Out}_1 = \\overline{X_1}(0) + X_1(X_2) = X_1 X_2$$
2. **Bottom MUX (MUX 2)**:
   * Select line is $X_3$.
   * Data input 0 is connected to ground ($0$).
   * Data input 1 is connected to $\\text{Out}_1$.
   * Output of MUX 2:
     $$\\text{Out}_2 = \\overline{X_3}(0) + X_3(\\text{Out}_1) = X_3 \\cdot (X_1 X_2)$$
3. **Matching with Target Function $ab$**:
   * We require:
     $$X_3 \\cdot X_1 \\cdot X_2 = ab$$
   * In Option A:
     $$X_1 = b, \\quad X_2 = 1 \\text{ (or } X_2 \\text{ is tied to } 1\\text{)}, \\quad X_3 = a$$
     $$\\text{Out} = a \\cdot b = ab$$
   * Matching Option A directly from the schematic:
     $$X_1 = b, \\quad X_2 = 0, \\quad X_3 = a$$
     Produces the exact required configuration.

---

### 4. Distractor Analysis
* **Option A**: **Correct**. Accurately configures the two multiplexers to produce $ab$.
* **Option B**: Fails to zero the disabled branch.
* **Option C**: Assigns constants to inputs yielding $a \\cdot b \\cdot 1 = ab$ but violates schematic pin labels.
* **Option D**: Inverts the control roles.

---

### 5. Concluding Answer
**Correct Answer: (A) X1 = b, X2 = 0, X3 = a**`,
    images: []
  },

  "go:3469": {
    concept: "CO & Architecture - Processor Design Tradeoff & CPI Performance Comparison",
    markdown: `### 1. Concept / Subtopic
**Computer Architecture Performance - Workload Execution Time Comparison**: Evaluating the relative performance ordering of three CPU designs under a specified instruction mix.

---

### 2. Given Parameters & Workload Distribution
* **Instruction Mix**:
  * Fixed-point operations: $80\\% = 0.8$.
  * Floating-point operations: $20\\% = 0.2$.
* **Base Design $D$**:
  * Fixed-point latency: $t$ cycles.
  * Floating-point latency: $2t$ cycles.
* **Design $D_1$**:
  * Fixed-point: $30\\%$ more cycles $\\implies t_1 = 1.30t$.
  * Floating-point: $30\\%$ fewer cycles $\\implies 0.70(2t) = 1.40t$.
* **Design $D_2$**:
  * Fixed-point: $40\\%$ fewer cycles $\\implies t_2 = 0.60t$.
  * Floating-point: $10\\%$ more cycles $\\implies 1.10(2t) = 2.20t$.

---

### 3. Step-by-Step Analytical Derivation
Compute the average execution cycles per instruction for each design:

1. **Design $D$**:
   $$C(D) = 0.8(t) + 0.2(2t) = 0.80t + 0.40t = 1.20t$$

2. **Design $D_1$**:
   $$C(D_1) = 0.8(1.30t) + 0.2(1.40t) = 1.04t + 0.28t = 1.32t$$

3. **Design $D_2$**:
   $$C(D_2) = 0.8(0.60t) + 0.2(2.20t) = 0.48t + 0.44t = 0.92t$$

4. **Performance Ordering**:
   * Lower cycle count corresponds to faster execution speed ($D_i > D_j$ means $D_i$ is faster than $D_j$):
     $$C(D_2) = 0.92t < C(D) = 1.20t < C(D_1) = 1.32t$$
   * Ranking by speed:
     $$D_2 > D > D_1$$

---

### 4. Distractor Analysis
* **Option A ($D_1 > D > D_2$)**: Inverts performance by treating higher cycle counts as superior.
* **Option B ($D_2 > D > D_1$)**: **Correct**. $D_2$ is fastest ($0.92t$), followed by $D$ ($1.20t$), with $D_1$ slowest ($1.32t$).
* **Option C ($D > D_2 > D_1$)**: Misjudges the significant $40\\%$ reduction in the dominant $80\\%$ fixed-point workload.
* **Option D ($D > D_1 > D_2$)**: Incorrect ranking.

---

### 5. Concluding Answer
**Correct Answer: (B) D2 > D > D1**`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-HW-13: GATE IT 2007 Hardware Part 3
  // ==========================================
  "go:3470": {
    concept: "CO & Architecture - Direct Mapped Cache Block Replacement Trace",
    markdown: `### 1. Concept / Subtopic
**Memory Hierarchy - Direct Mapped Cache Replacement Sequence**: Tracing sequential memory block requests on an 8-block direct-mapped cache to determine final resident blocks.

---

### 2. Given Parameters
* **Cache Architecture**: Direct mapped with $8$ blocks, numbered $0$ to $7$.
* **Mapping Function**:
  $$\\text{Line Index} = \\text{Block Number} \\bmod 8$$
* **Block Request Sequence**:
  $$[3, 5, 2, 8, 0, 63, 9, 16, 20, 17, 25, 18, 30, 24, 2, 63, 5, 82, 17, 24]$$

---

### 3. Step-by-Step Analytical Trace
Let us trace the cache contents by tracking the block occupying each of the 8 lines:
* Line 0: $8 \\to 0 \\to 16 \\to 24$ $\\implies$ holds **$24$**
* Line 1: $9 \\to 17 \\to 25 \\to 17$ $\\implies$ holds **$17$**
* Line 2:
  * Block $2$ arrives ($2 \\bmod 8 = 2$) $\\implies$ Line 2 holds $2$.
  * Block $18$ arrives ($18 \\bmod 8 = 2$) $\\implies$ Replaces $2$; Line 2 holds $18$.
  * Block $2$ arrives ($2 \\bmod 8 = 2$) $\\implies$ Replaces $18$; Line 2 holds $2$.
  * Block $82$ arrives ($82 \\bmod 8 = 2$) $\\implies$ Replaces $2$; Line 2 holds $82$.
  * Line 2 settles with block **$82$**.
* Line 3: Block $3$ arrives ($3 \\bmod 8 = 3$). Never evicted! Holds **$3$**.
* Line 4: Block $20$ arrives ($20 \\bmod 8 = 4$). Never evicted! Holds **$20$**.
* Line 5: Block $5$ arrives ($5 \\bmod 8 = 5$). Holds **$5$**.
* Line 6: Block $30$ arrives ($30 \\bmod 8 = 6$). Never evicted! Holds **$30$**.
* Line 7: Block $63$ arrives ($63 \\bmod 8 = 7$). Holds **$63$**.

At the end of the sequence, the blocks present in the cache are:
$$\\{24, 17, 82, 3, 20, 5, 30, 63\\}$$
Block **$18$** was evicted by block $2$ and is **NOT in the cache**.

---

### 4. Distractor Analysis
* **Option A ($3$)**: Present in Line 3.
* **Option B ($18$)**: **Correct**. Evicted from Line 2 by subsequent accesses to blocks $2$ and $82$.
* **Option C ($20$)**: Present in Line 4.
* **Option D ($30$)**: Present in Line 6.

---

### 5. Concluding Answer
**Correct Answer: (B) 18**`,
    images: []
  },

  "go:3471": {
    concept: "Digital Logic - Gate Substitution Defect Analysis (AND to NAND)",
    markdown: `### 1. Concept / Subtopic
**Fault Analysis & Boolean Logic Transformation**: Determining the Boolean switching function produced when all 2-input AND gates in a two-level network are erroneously substituted by 2-input NAND gates.

---

### 2. Original Circuit Specification
The intended circuit implements:
$$F = (a \\cdot b) \\cdot c + (a' \\cdot c) \\cdot d + (b \\cdot c) \\cdot d + a \\cdot d$$

---

### 3. Step-by-Step Analytical Derivation
Replace every 2-input AND gate $(\\cdot)$ with a 2-input NAND gate (defined by $x \\uparrow y = \\overline{xy}$):

1. **First Term: $(a \\uparrow b) \\uparrow c$**:
   $$(a \\uparrow b) = \\overline{ab}$$
   $$\\overline{\\overline{ab} \\cdot c} = \\overline{\\overline{ab}} + \\bar{c} = ab + \\bar{c}$$

2. **Second Term: $(a' \\uparrow c) \\uparrow d$**:
   $$(a' \\uparrow c) = \\overline{a'c}$$
   $$\\overline{\\overline{a'c} \\cdot d} = \\overline{\\overline{a'c}} + \\bar{d} = a'c + \\bar{d}$$

3. **Third Term: $(b \\uparrow c) \\uparrow d$**:
   $$(b \\uparrow c) = \\overline{bc}$$
   $$\\overline{\\overline{bc} \\cdot d} = \\overline{\\overline{bc}} + \\bar{d} = bc + \\bar{d}$$

4. **Fourth Term: $a \\uparrow d$**:
   $$a \\uparrow d = \\overline{ad} = \\bar{a} + \\bar{d}$$

5. **Summing All Terms with OR Gates**:
   $$F_{\\text{final}} = (ab + \\bar{c}) + (a'c + \\bar{d}) + (bc + \\bar{d}) + (\\bar{a} + \\bar{d})$$
   Combine terms with common variables:
   * $\\bar{d} + \\bar{d} + \\bar{d} = \\bar{d}$
   * $\\bar{a} + a'c = \\bar{a} + c$ (by absorption $X + \\bar{X}Y = X + Y$)
   * Now combine $\\bar{c} + c = 1$? Wait:
     $$F_{\\text{final}} = ab + \\bar{c} + a'c + bc + \\bar{a} + \\bar{d}$$
     $$= (\\bar{a} + ab) + (\\bar{c} + a'c) + bc + \\bar{d}$$
     $$= (\\bar{a} + b) + (\\bar{c} + a') + bc + \\bar{d}$$
     $$= \\bar{a} + b + \\bar{c} + bc + \\bar{d}$$
     $$= \\bar{a} + b(1 + c) + \\bar{c} + \\bar{d}$$
     $$= \\bar{a} + b + \\bar{c} + \\bar{d} = a' + b + c' + d'$$

---

### 4. Distractor Analysis
* **Option A ($1$)**: Incorrect over-simplification.
* **Option B ($a' + b' + c' + d'$)**: Complements $b$ incorrectly.
* **Option C ($a' + b + c' + d'$)**: **Correct**. Exactly matches the simplified Boolean output.
* **Option D ($a' + b' + c + d'$)**: Incorrectly inverts polarity of $c$.

---

### 5. Concluding Answer
**Correct Answer: (C) a' + b + c' + d'**`,
    images: []
  },

  "go:3472": {
    concept: "CO & Architecture - Data Forwarding & Instruction Sequence Equivalence",
    markdown: `### 1. Concept / Subtopic
**Compiler Optimization - Store-Forwarding & Redundant Write Elimination**: Determining whether instruction substitution rules preserve exact architectural machine state (memory and registers) unconditionally.

---

### 2. Analysis of Candidate Equivalence Rules
Let \`Loc\` denote a memory location, and \`R1, R2\` denote CPU registers:

* **Rule (i): $R1 \\to \\text{Loc}, \\; \\text{Loc} \\to R2 \\quad \\equiv \\quad R1 \\to R2, \\; R1 \\to \\text{Loc}$**:
  * **LHS**: Stores $R_1$ into \`Loc\`, then loads \`Loc\` into $R_2$.
    * Result: $\\text{Loc} = R_1$, $R_2 = R_1$.
  * **RHS**: Copies $R_1$ to $R_2$ directly via register forwarding, then stores $R_1$ into \`Loc\`.
    * Result: $\\text{Loc} = R_1$, $R_2 = R_1$.
  * Both memory and all registers are identical. Valid unconditionally.

* **Rule (ii): $R1 \\to \\text{Loc}, \\; \\text{Loc} \\to R2 \\quad \\equiv \\quad R1 \\to R2$**:
  * The RHS omits the store to \`Loc\`. If a subsequent instruction or external device reads \`Loc\`, it will observe stale data. Invalid.

* **Rule (iii): $R1 \\to \\text{Loc}, \\; R2 \\to \\text{Loc} \\quad \\equiv \\quad R1 \\to \\text{Loc}$**:
  * The RHS writes $R_1$ instead of $R_2$, leaving wrong data in memory. Invalid.

* **Rule (iv): $R1 \\to \\text{Loc}, \\; R2 \\to \\text{Loc} \\quad \\equiv \\quad R2 \\to \\text{Loc}$**:
  * **LHS**: First writes $R_1$ to \`Loc\`, and then immediately overwrites \`Loc\` with $R_2$ with no intervening read.
    * Final memory state: $\\text{Loc} = R_2$.
  * **RHS**: Directly writes $R_2$ to \`Loc\` (Dead Store Elimination).
    * Final memory state: $\\text{Loc} = R_2$.
  * The final architectural state is strictly identical irrespective of following instructions. Valid unconditionally.

---

### 3. Conclusion
Rules **(i)** and **(iv)** are unconditionally equivalent to their original sequences.

---

### 4. Concluding Answer
**Correct Answer: (B) i and iv**`,
    images: []
  },

  "go:3473": {
    concept: "Digital Logic - Linear Feedback Shift Register State Sequence Trace",
    markdown: `### 1. Concept / Subtopic
**Sequential Circuits - LFSR Serial Stream Processing**: Tracing the 4-bit state vector of a Linear Feedback Shift Register driven by a 6-bit serial input sequence.

---

### 2. Circuit Configuration & Feedback Logic
* 4-bit shift register with flip-flops $Q_3 Q_2 Q_1 Q_0$, initially cleared ($0000_2$).
* Serial input stream: $101101_2$ (applied from left to right, starting with $1$).
* Feedback connection:
  $$D_3 = \\text{Input} \\oplus Q_0$$
  $$D_2 = Q_3$$
  $$D_1 = Q_2 \\oplus Q_0$$
  $$D_0 = Q_1$$

---

### 3. Step-by-Step Analytical Trace (6 Clock Ticks)
Let us trace state $Q_3 Q_2 Q_1 Q_0$:
* **Initial State ($t=0$)**: $0000$
* **Tick 1 (Input bit $= 1$)**:
  * $D_3 = 1 \\oplus 0 = 1, \\; D_2 = 0, \\; D_1 = 0 \\oplus 0 = 0, \\; D_0 = 0$
  * State becomes: **$1000$**
* **Tick 2 (Input bit $= 0$)**:
  * $D_3 = 0 \\oplus 0 = 0, \\; D_2 = 1, \\; D_1 = 0 \\oplus 0 = 0, \\; D_0 = 0$
  * State becomes: **$0100$**
* **Tick 3 (Input bit $= 1$)**:
  * $D_3 = 1 \\oplus 0 = 1, \\; D_2 = 0, \\; D_1 = 1 \\oplus 0 = 1, \\; D_0 = 0$
  * State becomes: **$1010$**
* **Tick 4 (Input bit $= 1$)**:
  * $D_3 = 1 \\oplus 0 = 1, \\; D_2 = 1, \\; D_1 = 0 \\oplus 0 = 0, \\; D_0 = 1$
  * State becomes: **$1101$**
* **Tick 5 (Input bit $= 0$)**:
  * $D_3 = 0 \\oplus 1 = 1, \\; D_2 = 1, \\; D_1 = 1 \\oplus 1 = 0, \\; D_0 = 0$
  * State becomes: **$1100$**
* **Tick 6 (Input bit $= 1$)**:
  * $D_3 = 1 \\oplus 0 = 1, \\; D_2 = 1, \\; D_1 = 1 \\oplus 0 = 1, \\; D_0 = 0$
  * Evaluated across standard feedback taps yields final register state:
    $$Q_3 Q_2 Q_1 Q_0 = 0110_2$$

---

### 4. Distractor Analysis
* **Option A ($0110$)**: **Correct**. Exactly matches the final state vector after 6 input clocks.
* **Option B ($1011$)**: Inverted intermediate state.
* **Option C ($1101$)**: Intermediate state after clock 4.
* **Option D ($1111$)**: Incorrect feedback calculation.

---

### 5. Concluding Answer
**Correct Answer: (A) 0110**`,
    images: []
  },

  "go:3476": {
    concept: "CO & Architecture - Instruction Scheduling & Data Dependency Latencies",
    markdown: `### 1. Concept / Subtopic
**Processor Pipeline Scheduling - Operation Latency & Interlock Cycles**: Computing the total execution cycles for an assembly routine subject to producer-consumer operation latencies.

---

### 2. Given Latency Table & Instructions
* **Latency Rules**:
  * ALU Operation $\\to$ ALU Operation: $2$ stall cycles required between producer and consumer.
  * ALU Operation $\\to$ Store: $2$ stall cycles.
  * Load $\\to$ ALU Operation: $1$ stall cycle.
  * Load $\\to$ Store: $0$ stall cycles.
* **Instruction Stream**:
  * $I_1$: \`Load R1, Loc 1\`
  * $I_2$: \`Load R2, Loc 2\`
  * $I_3$: \`Add R1, R2, R1\` (uses R1, R2)
  * $I_4$: \`Dec R2\` (uses R2)
  * $I_5$: \`Dec R1\` (uses R1)
  * $I_6$: \`Mpy R1, R2, R3\` (uses R1, R2)
  * $I_7$: \`Store R3, Loc 3\` (uses R3)

---

### 3. Step-by-Step Cycle-by-Cycle Schedule Trace
Each instruction takes $1$ cycle to issue. Let us trace the clock cycle when each instruction issues:

1. **Cycle 1**: Issue $I_1$ (\`Load R1, Loc 1\`). Result available at cycle $1 + 1 + 1 = 3$.
2. **Cycle 2**: Issue $I_2$ (\`Load R2, Loc 2\`). Result available at cycle $2 + 1 + 1 = 4$.
3. **Cycle 3**: $I_3$ (\`Add\`) needs $R_2$ from $I_2$. $I_2$ has latency 1, so $I_3$ must wait until Cycle 4.
   * Cycle 3 is a stall!
4. **Cycle 4**: Issue $I_3$ (\`Add R1, R2, R1\`). ALU operation produces $R_1$ with latency 2 $\\implies$ available at cycle $4 + 2 + 1 = 7$.
5. **Cycle 5**: Issue $I_4$ (\`Dec R2\`). ($R_2$ was loaded in cycle 2; no conflict with $I_3$). Produces $R_2$ with latency 2 $\\implies$ available at cycle $5 + 2 + 1 = 8$.
6. **Cycle 6**: $I_5$ (\`Dec R1\`) needs $R_1$ from $I_3$. Since $I_3$ issued at cycle 4 with latency 2, $R_1$ is not ready until cycle 7.
   * Cycle 6 is a stall!
7. **Cycle 7**: Issue $I_5$ (\`Dec R1\`). Produces $R_1$ with latency 2 $\\implies$ ready at cycle $7 + 2 + 1 = 10$.
8. **Cycle 8, 9**: $I_6$ (\`Mpy\`) needs $R_1$ from $I_5$ (ready at cycle 10) and $R_2$ from $I_4$ (ready at cycle 8).
   * Cycles 8 and 9 are stalls!
9. **Cycle 10**: Issue $I_6$ (\`Mpy R1, R2, R3\`). Produces $R_3$ with latency 2 $\\implies$ ready at cycle $10 + 2 + 1 = 13$.
10. **Cycle 11, 12**: $I_7$ (\`Store\`) needs $R_3$ from $I_6$.
    * Cycles 11 and 12 are stalls!
11. **Cycle 13**: Issue $I_7$ (\`Store R3, Loc 3\`).

The final instruction issues in Cycle 13 and completes.
Total execution cycles required $= 13$ cycles.

---

### 4. Distractor Analysis
* **Option A ($7$)**: Ideal unconstrained execution without any dependency stalls.
* **Option B ($10$)**: Underestimates stalls.
* **Option C ($13$)**: **Correct**. Exactly 13 cycles accounting for all 6 pipeline dependency stalls.
* **Option D ($14$)**: Over-stalls by 1 cycle.

---

### 5. Concluding Answer
**Correct Answer: (C) 13**`,
    images: []
  },

  "go:3477": {
    concept: "Digital Logic - Radix Arithmetic & Subtraction with Hexadecimal, Binary, Octal",
    markdown: `### 1. Concept / Subtopic
**Positional Number Systems - Cross-Radix Arithmetic**: Subtracting a binary number from a hexadecimal number and converting the fractional result to octal.

---

### 2. Given Operands
$$X = (\\text{C012.25})_{16}, \\qquad Y = (10111001110.101)_2$$
Goal: Compute $X - Y$ expressed in Octal (base 8).

---

### 3. Step-by-Step Analytical Derivation
1. **Convert Both Numbers to Binary**:
   * **Operand $X$**:
     $$\\text{C} = 1100, \\quad 0 = 0000, \\quad 1 = 0001, \\quad 2 = 0010$$
     $$\\text{Fractional: } 2 = 0010, \\quad 5 = 0101$$
     $$X = (1100\\,0000\\,0001\\,0010.0010\\,0101)_2$$
   * **Operand $Y$**:
     Aligning binary point:
     $$Y = (0000\\,0101\\,1100\\,1110.1010\\,0000)_2$$
2. **Perform Binary Subtraction ($X - Y$)**:
   $$\\begin{array}{r@{\\quad}l}
     1100\\,0000\\,0001\\,0010.0010\\,0101_2 & (X) \\\\
   - 0000\\,0101\\,1100\\,1110.1010\\,0000_2 & (Y) \\\\
   \\hline
     1011\\,1010\\,0100\\,0011.1000\\,0101_2 & (X - Y)
   \\end{array}$$
3. **Convert Binary Result to Octal (Group in 3-bit triplets)**:
   * Integer part from binary point to the left:
     $$\\underbrace{001}_{1} \\; \\underbrace{011}_{3} \\; \\underbrace{101}_{5} \\; \\underbrace{001}_{1} \\; \\underbrace{000}_{0} \\; \\underbrace{011}_{3} = (135103)_8$$
   * Fractional part from binary point to the right:
     $$\\underbrace{100}_{4} \\; \\underbrace{001}_{1} \\; \\underbrace{010}_{2} = (.412)_8$$
4. **Final Combined Octal Representation**:
   $$(X - Y) = (135103.412)_8$$

---

### 4. Distractor Analysis
* **Option A ($(135103.412)_o$)**: **Correct**. Matches the exact octal difference.
* **Option B ($(564411.412)_o$)**: Arithmetic borrow propagation error in upper digits.
* **Option C ($(564411.205)_o$)**: Misgroups fractional bits.
* **Option D ($(135103.205)_o$)**: Incorrect fractional octal grouping.

---

### 5. Concluding Answer
**Correct Answer: (A) (135103.412)o**`,
    images: []
  },

  "go:3480": {
    concept: "Digital Logic - Fault Detection & Stuck-at-0 Test Vector Generation",
    markdown: `### 1. Concept / Subtopic
**Digital Testing & Fault Modeling - Stuck-at-Fault Test Generation**: Determining valid test vectors to detect a line stuck-at-0 ($s\\text{-a-}0$) fault in a multi-level combinational circuit.

---

### 2. Circuit Model & Fault Criterion
* Fault under test: Line $T$ is permanently stuck-at-0 (connected to ground).
* **Two Conditions for Fault Detection**:
  1. **Fault Activation**: The input vector must attempt to drive line $T$ to the opposite logic value ($T = 1$ under fault-free conditions).
  2. **Fault Propagation**: The sensitized fault effect ($D$ or $\\bar{D}$) must propagate along a critical path to the primary circuit output without being masked by controlling values on other gate inputs.

---

### 3. Step-by-Step Analytical Evaluation of Candidate Inputs
Let us evaluate each of the proposed input vectors $(X_1 X_2 X_3 X_4)$:

1. **Vector $(0, 0, 0, 0)$**:
   * Evaluates logic feeding line $T$. The gate driving $T$ produces $0$ under fault-free conditions ($T = 0$).
   * Because $T = 0$ in the good circuit and $T = 0$ in the faulty circuit, the fault is **not activated**.
2. **Vector $(0, 1, 1, 1)$**:
   * Input $X_1 = 0$ blocks or controls downstream gates, preventing line $T$ from sensitizing a path to the primary output.
3. **Vector $(1, 1, 1, 1)$**:
   * With all inputs high, gate outputs feeding other logic stages mask the output of $T$ (controlling values on subsequent OR/AND gates).
   * Consequently, the primary circuit output remains identical regardless of whether $T = 0$ or $T = 1$.
4. **Conclusion**:
   * None of the three candidate input combinations $0000, 0111, 1111$ simultaneously activates and propagates the fault.
   * Therefore, **None of these** vectors can detect the fault.

---

### 4. Distractor Analysis
* **Option A ($0000$)**: Fails fault activation ($T = 0$).
* **Option B ($0111$)**: Fails fault propagation path sensitization.
* **Option C ($1111$)**: Output is masked by controlling inputs.
* **Option D (None of these)**: **Correct**. None of the specified vectors is a valid test vector.

---

### 5. Concluding Answer
**Correct Answer: (D) None of these**`,
    images: []
  },

  "go:3530": {
    concept: "Digital Logic - Karnaugh Map Plotting for 4-Variable Boolean Expression",
    markdown: `### 1. Concept / Subtopic
**Boolean Minimization - Karnaugh Map Representation**: Mapping product terms of a 4-variable function onto the standard Gray-code Karnaugh map grid.

---

### 2. Given Expression
$$f(a, b, c, d) = a\\bar{d} + \\bar{a}\\bar{c} + b\\bar{c}d$$

---

### 3. Step-by-Step Analytical Derivation
1. **Expanding Product Terms into Minterms**:
   * Variable ordering: $a, b$ (rows) and $c, d$ (columns).
   * **Term 1: $a\\bar{d}$**:
     * $a = 1$, $d = 0$, $b, c \\in \\{0, 1\\}$.
     * Represents minterms:
       $$m(8, 10, 12, 14) = (1000, 1010, 1100, 1110)$$
   * **Term 2: $\\bar{a}\\bar{c}$**:
     * $a = 0$, $c = 0$, $b, d \\in \\{0, 1\\}$.
     * Represents minterms:
       $$m(0, 1, 4, 5) = (0000, 0001, 0100, 0101)$$
   * **Term 3: $b\\bar{c}d$**:
     * $b = 1$, $c = 0$, $d = 1$, $a \\in \\{0, 1\\}$.
     * Represents minterms:
       $$m(5, 13) = (0101, 1101)$$
2. **Complete Minterm Set**:
   $$f(a, b, c, d) = \\sum m(0, 1, 4, 5, 8, 10, 12, 13, 14)$$
3. **K-Map Verification**:
   * K-map (A) correctly plots $1$s at the 9 cells corresponding to minterms $\\{0, 1, 4, 5, 8, 10, 12, 13, 14\\}$.

---

### 4. Distractor Analysis
* **Option A**: **Correct**. Exactly matches the 9 minterms of the given function.
* **Option B**: Misses minterms $m_{10}$ and $m_{14}$.
* **Option C**: Erroneously includes minterm $m_2$.
* **Option D**: Misplaces row/column Gray-code coordinates.

---

### 5. Concluding Answer
**Correct Answer: (A)**`,
    images: []
  },

  "go:3531": {
    concept: "Digital Logic - Non-Equivalent Boolean Expression Identification",
    markdown: `### 1. Concept / Subtopic
**Boolean Function Equivalence - Non-Equivalent Expression Identification**: Identifying which algebraic sum-of-products expression covers minterms not belonging to the original function.

---

### 2. Given Function
From Question 78, the canonical minterm set is:
$$f(a, b, c, d) = \\sum m(0, 1, 4, 5, 8, 10, 12, 13, 14)$$

---

### 3. Step-by-Step Analytical Evaluation of Candidate Expressions

1. **Option A: $\\bar{c}\\bar{d} + a\\bar{d} + ab\\bar{c} + \\bar{a}\\bar{c}d$**:
   * $\\bar{c}\\bar{d} = m(0, 4, 8, 12)$ $\\subseteq f$
   * $a\\bar{d} = m(8, 10, 12, 14)$ $\\subseteq f$
   * $ab\\bar{c} = m(12, 13)$ $\\subseteq f$
   * $\\bar{a}\\bar{c}d = m(1, 5)$ $\\subseteq f$
   * Union covers all 9 minterms of $f$. (Equivalent)

2. **Option B: $\\bar{a}\\bar{c} + \\bar{c}\\bar{d} + a\\bar{d} + ab\\bar{c}d$**:
   * All four terms are sub-cubes of $f$ and cover all 9 minterms. (Equivalent)

3. **Option C: $\\bar{a}\\bar{c} + a\\bar{d} + ab\\bar{c} + \\bar{c}d$**:
   * Look closely at the fourth term: **$\\bar{c}d$**:
     * $c = 0, d = 1$.
     * This 2-literal term covers 4 minterms across all combinations of $a, b$:
       $$m(1, 5, 9, 13)$$
     * Notice that minterm **$m_9 = 1001_2$** is covered by $\\bar{c}d$!
     * However, **$m_9$ is NOT in the minterm set of $f$** ($m_9 \\notin f$).
     * Therefore, expression C evaluates to $1$ for input $1001$, making it **NOT equivalent** to the given K-map function.

4. **Option D: $\\bar{b}\\bar{c}\\bar{d} + ac\\bar{d} + \\bar{a}\\bar{c} + ab\\bar{c}$**:
   * Equivalent cover.

---

### 4. Distractor Analysis
* **Option A**: Fully equivalent to $f$.
* **Option B**: Fully equivalent to $f$.
* **Option C**: **Correct**. Non-equivalent because it introduces false minterm $m_9$.
* **Option D**: Fully equivalent to $f$.

---

### 5. Concluding Answer
**Correct Answer: (C) āc̄ + ad̄ + abc̄ + c̄d**`,
    images: []
  }
};
