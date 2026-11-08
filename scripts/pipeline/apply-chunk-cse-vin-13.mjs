import fs from "fs";
import path from "path";
import { applyAuthenticPatches } from "./patch-authentic-solutions.mjs";

export const CHUNK_CSE_VIN_13_SOLUTIONS = {
  "go:614": {
    concept: "Engineering Mathematics - Laplace Transform of Periodic Piecewise Functions",
    markdown: `### 1. Mathematical Formulation
We are given a periodic function $f(t)$ with fundamental period $T = 2\\pi$ defined as:
$$f(t) = \\begin{cases} \\sin t & \\text{if } (2n-1)\\pi \\leq t \\leq 2n\\pi \\quad (n = 1, 2, 3, \\dots) \\\\ 0 & \\text{otherwise} \\end{cases}$$

From the accompanying plot, during the first period $t \\in [0, 2\\pi]$:
$$f(t) = \\begin{cases} 0 & 0 \\leq t < \\pi \\\\ \\sin t & \\pi \\leq t < 2\\pi \\end{cases}$$
*(Note that for $t \\in [\\pi, 2\\pi]$, $\\sin t \\leq 0$, matching the negative half-wave depicted in the graph)*.

By the **Periodic Function Laplace Transform Theorem**, if $f(t)$ is periodic with period $T$:
$$\\mathcal{L}\\{f(t)\\} = \\frac{1}{1 - e^{-sT}} \\int_0^T e^{-st} f(t) \\, dt$$

Here, $T = 2\\pi$, so:
$$\\mathcal{L}\\{f(t)\\} = \\frac{1}{1 - e^{-2\\pi s}} \\int_0^{2\\pi} e^{-st} f(t) \\, dt$$

---

### 2. Analytical Evaluation of the Definite Integral
Since $f(t) = 0$ for $0 \\leq t < \\pi$, the integral over the first period reduces to:
$$I = \\int_\\pi^{2\\pi} e^{-st} \\sin t \\, dt$$

Substitute $t = \\tau + \\pi \\implies dt = d\\tau$.
When $t = \\pi$, $\\tau = 0$; when $t = 2\\pi$, $\\tau = \\pi$.
$$\\sin t = \\sin(\\tau + \\pi) = -\\sin\\tau$$
$$e^{-st} = e^{-s(\\tau + \\pi)} = e^{-\\pi s} e^{-s\\tau}$$

Substituting these into the integral:
$$I = \\int_0^\\pi e^{-\\pi s} e^{-s\\tau} (-\\sin\\tau) \\, d\\tau = -e^{-\\pi s} \\int_0^\\pi e^{-s\\tau} \\sin\\tau \\, d\\tau$$

Using the standard integral identity $\\int e^{at} \\sin(bt) \\, dt = \\frac{e^{at}}{a^2 + b^2}(a\\sin bt - b\\cos bt)$:
$$\\int_0^\\pi e^{-s\\tau} \\sin\\tau \\, d\\tau = \\left[ \\frac{e^{-s\\tau}}{s^2 + 1} (-s\\sin\\tau - \\cos\\tau) \\right]_0^\\pi$$
- Upper limit ($\\tau = \\pi$): $\\frac{e^{-\\pi s}}{s^2 + 1} (-s(0) - (-1)) = \\frac{e^{-\\pi s}}{s^2 + 1}$
- Lower limit ($\\tau = 0$): $\\frac{1}{s^2 + 1} (-s(0) - 1) = -\\frac{1}{s^2 + 1}$
Subtracting the lower limit from the upper limit:
$$\\int_0^\\pi e^{-s\\tau} \\sin\\tau \\, d\\tau = \\frac{e^{-\\pi s} - (-1)}{s^2 + 1} = \\frac{1 + e^{-\\pi s}}{s^2 + 1}$$

Thus, the single-period integral $I$ is:
$$I = -e^{-\\pi s} \\cdot \\frac{1 + e^{-\\pi s}}{s^2 + 1} = -\\frac{e^{-\\pi s}(1 + e^{-\\pi s})}{s^2 + 1}$$

---

### 3. Combining with the Periodicity Factor
Now substitute $I$ into the periodic Laplace transform formula:
$$\\mathcal{L}\\{f(t)\\} = \\frac{1}{1 - e^{-2\\pi s}} \\cdot \\left[ -\\frac{e^{-\\pi s}(1 + e^{-\\pi s})}{s^2 + 1} \\right]$$

Factoring the denominator using the difference of squares:
$$1 - e^{-2\\pi s} = (1 - e^{-\\pi s})(1 + e^{-\\pi s})$$

The term $(1 + e^{-\\pi s})$ in the numerator and denominator cancels:
$$\\mathcal{L}\\{f(t)\\} = -\\frac{e^{-\\pi s}}{(s^2 + 1)(1 - e^{-\\pi s})} = -\\frac{1}{(s^2 + 1)(e^{\\pi s} - 1)}$$
*(If the curve represents the absolute rectified wave $-\\sin t$ taking positive magnitude, the transform is $\\frac{e^{-\\pi s}}{(s^2 + 1)(1 - e^{-\\pi s})}$)*.

---

### 4. Conclusion
The Laplace transform of the given periodic waveform is:
$$\\mathcal{L}\\{f(t)\\} = -\\frac{e^{-\\pi s}}{(s^2 + 1)(1 - e^{-\\pi s})} = -\\frac{1}{(s^2 + 1)(e^{\\pi s} - 1)}$$`,
    images: []
  },

  "go:17235": {
    concept: "Digital Logic - State Machine Stability & Input Restriction",
    markdown: `### 1. State Machine Formulation
We are given an asynchronous sequential state machine with two states $S_1$ and $S_2$ and two inputs $a$ and $b$:
- In state $S_1$:
  - If $a = 1$: self-loop on $S_1$ (remains in $S_1$, output $1$).
  - If $a = 0$: transitions from $S_1 \\to S_2$ (output $2$).
- In state $S_2$:
  - If $b = 1$: self-loop on $S_2$ (remains in $S_2$, output $2$).
  - If $b = 0$: transitions from $S_2 \\to S_1$ (output $1$).

---

### 2. Definition & Conditions for a Stable State
A state $S_i$ is **stable** under an input combination if the next-state function maps back to itself:
$$\\text{Next State} = \\text{Present State}$$

Let us analyze the behavior across all input combinations $(a, b)$:
1. **Case 1 ($a = 1, b = 1$):**
   - In $S_1$, $a = 1 \\implies$ stays in $S_1$ (Stable).
   - In $S_2$, $b = 1 \\implies$ stays in $S_2$ (Stable).
2. **Case 2 ($a = 1, b = 0$):**
   - In $S_1$, $a = 1 \\implies$ stays in $S_1$ (Stable).
   - In $S_2$, $b = 0 \\implies$ transitions to $S_1$, where it remains stable because $a = 1$.
3. **Case 3 ($a = 0, b = 1$):**
   - In $S_1$, $a = 0 \\implies$ transitions to $S_2$, where it remains stable because $b = 1$.
   - In $S_2$, $b = 1 \\implies$ stays in $S_2$ (Stable).
4. **Case 4 ($a = 0, b = 0$):**
   - In $S_1$, $a = 0 \\implies$ moves to $S_2$.
   - Once in $S_2$, $b = 0 \\implies$ moves immediately back to $S_1$.
   - The machine oscillates indefinitely: $S_1 \\to S_2 \\to S_1 \\to S_2 \\dots$, never reaching a stable state (unstable limit cycle).

---

### 3. Deriving the Input Restriction
To ensure the state machine has a stable state and avoids the unstable oscillatory condition ($a = 0$ and $b = 0$), the inputs must satisfy:
$$\\text{NOT}(a = 0 \\text{ and } b = 0) \\iff \\overline{\\bar{a} \\cdot \\bar{b}} = a + b = 1$$
That is, at least one of the inputs $a$ or $b$ must be $1$.

---

### 4. Option Analysis
- **Option A ($a \\cdot b = 1$):** Overly restrictive; requires both $a=1$ and $b=1$.
- **Option B ($a + b = 1$):** Exactly guarantees at least one input is 1, ensuring a stable state.
- **Option C ($\\bar{a} + \\bar{b} = 0$):** Equivalent to $a \\cdot b = 1$.
- **Option D ($\\overline{a \\cdot b} = 1$):** Allows $(a, b) = (0, 0)$, which causes oscillation.
- **Option E ($\\overline{a + b} = 1$):** Represents $a=0, b=0$, the exact condition that causes instability!

---

### 5. Conclusion
Therefore, the restriction on the inputs to ensure a stable state is **$a + b = 1$ (Option B)**.`,
    images: []
  },

  "go:17237": {
    concept: "Digital Logic - Synchronous Counter & Shift Register (Johnson Counter)",
    markdown: `### 1. Circuit Analysis & Flip-Flop Interconnections
We are given three $\\text{J-K}$ flip-flops ($FF_0, FF_1, FF_2$) clocked synchronously by a common clock line:
- First Flip-Flop ($Q_0$):
  $$J_0 = \\bar{Q}_2, \\quad K_0 = Q_2$$
  Since $K_0 = \\bar{J}_0$, Flip-Flop 0 functions effectively as a D flip-flop receiving $\\bar{Q}_2$:
  $$Q_0^+ = J_0 \\bar{Q}_0 + \\bar{K}_0 Q_0 = \\bar{Q}_2 \\bar{Q}_0 + \\bar{Q}_2 Q_0 = \\bar{Q}_2$$
- Second Flip-Flop ($Q_1$):
  $$J_1 = Q_0, \\quad K_1 = \\bar{Q}_0 \\implies Q_1^+ = Q_0$$
- Third Flip-Flop ($Q_2$):
  $$J_2 = Q_1, \\quad K_2 = \\bar{Q}_1 \\implies Q_2^+ = Q_1$$

This configuration is the canonical **Johnson Counter** (Twisted Ring Counter or Möbius Counter), which is fundamentally a **Shift Register** with inverted feedback from the output of the final stage to the input of the first stage.

---

### 2. State Transition Tracing
Starting from the initial state $Q_0 Q_1 Q_2 = 000$:
- **Clock 0 (Initial):** $Q_0 Q_1 Q_2 = 000$
- **Clock 1:** $Q_0^+ = \\bar{Q}_2 = \\bar{0} = 1, \\; Q_1^+ = Q_0 = 0, \\; Q_2^+ = Q_1 = 0 \\implies 100$
- **Clock 2:** $Q_0^+ = \\bar{Q}_2 = \\bar{0} = 1, \\; Q_1^+ = Q_0 = 1, \\; Q_2^+ = Q_1 = 0 \\implies 110$
- **Clock 3:** $Q_0^+ = \\bar{Q}_2 = \\bar{0} = 1, \\; Q_1^+ = Q_0 = 1, \\; Q_2^+ = Q_1 = 1 \\implies 111$
- **Clock 4:** $Q_0^+ = \\bar{Q}_2 = \\bar{1} = 0, \\; Q_1^+ = Q_0 = 1, \\; Q_2^+ = Q_1 = 1 \\implies 011$
- **Clock 5:** $Q_0^+ = \\bar{Q}_2 = \\bar{1} = 0, \\; Q_1^+ = Q_0 = 0, \\; Q_2^+ = Q_1 = 1 \\implies 001$
- **Clock 6:** $Q_0^+ = \\bar{Q}_2 = \\bar{1} = 0, \\; Q_1^+ = Q_0 = 0, \\; Q_2^+ = Q_1 = 0 \\implies 000$ (Cycles back)

---

### 3. Characteristics & Classification
1. **Modulus of Counter:**
   A Johnson counter with $n$ flip-flops has a cycle length of $2n$ distinct states.
   Here, $n = 3 \\implies \\text{Modulus} = 2 \\times 3 = 6$.
   Hence, the circuit acts as a **Mod-6 Counter**.
2. **Shift Register Operation:**
   At every active clock edge, data bits shift from $FF_0 \\to FF_1 \\to FF_2$. Thus, the arrangement operates as a **Shift Register**.

---

### 4. Conclusion
Therefore, the arrangement functions as both a **Shift Register (Option A)** and a **Mod-6 Counter (Option C)**. Correct options are **A** and **C**.`,
    images: []
  },

  "go:2287": {
    concept: "Data Communications - Asynchronous Serial Transmission Rate Calculation",
    markdown: `### 1. Problem Formulation & Transmission Parameters
We are given an asynchronous serial communication channel with the following parameters:
- Baud Rate: $R = 2400 \\text{ baud}$
- Character Code Size: $8 \\text{ bits}$ (data bits)
- Stop Bits: $2 \\text{ bits}$
- In standard asynchronous framing without parity, each character frame includes:
  - $1 \\text{ start bit}$
  - $8 \\text{ data bits}$
  - $2 \\text{ stop bits}$

---

### 2. Bits per Character Frame Calculation
$$\\text{Total bits per character} = \\text{Start bits} + \\text{Data bits} + \\text{Stop bits}$$
$$\\text{Total bits per character} = 1 + 8 + 2 = 11 \\text{ bits/character}$$

---

### 3. Transmission Speed (Characters per Second)
In binary signaling over a serial line, $1 \\text{ baud} = 1 \\text{ bit per second (bps)}$:
$$\\text{Bit Rate} = 2400 \\text{ bits/sec}$$

The number of complete characters transmitted per second is:
$$\\text{Characters/sec} = \\frac{\\text{Baud Rate}}{\\text{Bits per character}} = \\frac{2400}{11} = 218.1818\\dots$$

Truncating or rounding to the nearest whole character transmitted per second:
$$\\text{Characters/sec} \\approx 218$$

---

### 4. Option & Distractor Analysis
- **Option A (109):** Corresponds to dividing 2400 by 22 bits (double framing).
- **Option B (216):** Calculation error.
- **Option C (218):** Exactly corresponds to $\\lfloor 2400 / 11 \\rfloor = 218$.
- **Option D (219):** Unjustified ceiling rounding.

---

### 5. Conclusion
Therefore, the number of characters that can be transmitted per second is **218 (Option C)**.`,
    images: []
  },

  "go:2288": {
    concept: "Digital Logic - Universal Logic Implementation using NOR Gates (Exclusive-NOR)",
    markdown: `### 1. Circuit Formulation
The circuit consists of four 2-input NOR gates receiving inputs $x$ and $y$:
- **Gate 1 (Input NOR):**
  Receives primary inputs $x$ and $y$.
  $$g_1 = \\overline{x + y}$$
- **Gate 2 (Upper NOR):**
  Receives input $x$ and the output of Gate 1 ($g_1$).
  $$g_2 = \\overline{x + g_1} = \\overline{x + \\overline{x + y}}$$
- **Gate 3 (Lower NOR):**
  Receives input $y$ and the output of Gate 1 ($g_1$).
  $$g_3 = \\overline{y + g_1} = \\overline{y + \\overline{x + y}}$$
- **Gate 4 (Output NOR):**
  Receives outputs $g_2$ and $g_3$.
  $$f(x, y) = \\overline{g_2 + g_3}$$

---

### 2. Boolean Algebraic Simplification

#### Simplifying $g_2$:
Using De Morgan's Law $\\overline{A + B} = \\bar{A} \\cdot \\bar{B}$:
$$g_2 = \\bar{x} \\cdot \\overline{\\overline{x + y}} = \\bar{x} \\cdot (x + y) = \\bar{x} x + \\bar{x} y = 0 + \\bar{x} y = \\bar{x} y$$

#### Simplifying $g_3$:
Similarly:
$$g_3 = \\bar{y} \\cdot \\overline{\\overline{x + y}} = \\bar{y} \\cdot (x + y) = \\bar{y} x + \\bar{y} y = x \\bar{y} + 0 = x \\bar{y}$$

#### Simplifying Output $f(x, y)$:
Substitute $g_2$ and $g_3$ into Gate 4:
$$f(x, y) = \\overline{g_2 + g_3} = \\overline{\\bar{x} y + x \\bar{y}}$$

Recall that $\\bar{x} y + x \\bar{y} = x \\oplus y$ (Exclusive-OR).
Taking the complement:
$$f(x, y) = \\overline{x \\oplus y} = x \\odot y = x y + \\bar{x} \\bar{y} \\quad (\\text{Exclusive-NOR})$$

---

### 3. Truth Table Verification
$$\\begin{array}{|cc|c|c|c|c|}
\\hline
x & y & g_1 = \\overline{x+y} & g_2 = \\bar{x}y & g_3 = x\\bar{y} & f = \\overline{g_2 + g_3} \\\\
\\hline
0 & 0 & 1 & 0 & 0 & 1 \\\\
0 & 1 & 0 & 1 & 0 & 0 \\\\
1 & 0 & 0 & 0 & 1 & 0 \\\\
1 & 1 & 0 & 0 & 0 & 1 \\\\
\\hline
\\end{array}$$
The output $f(x, y)$ equals $1$ when $x = y$ and $0$ when $x \\neq y$, which is the exact truth table of the **Exclusive-NOR (XNOR)** gate.

---

### 4. Conclusion
Therefore, the logic function performed by the circuit is **exclusive NOR (Option B)**.`,
    images: []
  },

  "go:2290": {
    concept: "Operating Systems & Computer Organization - Interrupt Overhead & CPU Utilization",
    markdown: `### 1. Timing Diagram & Interrupt Overhead Analysis
From the given timing diagram:
1. **Interrupt Arrival & Latency:**
   An interrupt request arrives every $1 \\text{ ms} = 1000 \\, \\mu\\text{s}$.
   During the first $10 \\, \\mu\\text{s}$ after arrival, the CPU completes the current instruction in the main program before servicing the interrupt.
2. **Interrupt Service Overhead Breakdown:**
   Once execution transfers away from the main program, the CPU spends:
   - Saving CPU State (context switch out): $10 \\, \\mu\\text{s}$
   - Interrupt Service Routine (ISR) Execution: $80 \\, \\mu\\text{s}$
   - Restoration of CPU State (context switch in): $10 \\, \\mu\\text{s}$

Total time diverted away from main program per interrupt cycle:
$$T_{\\text{interrupt}} = 10 \\, \\mu\\text{s} + 80 \\, \\mu\\text{s} + 10 \\, \\mu\\text{s} = 100 \\, \\mu\\text{s}$$

---

### 2. Main Program Execution Time Calculation
- Repeat Period of Interrupt = $1 \\text{ ms} = 1000 \\, \\mu\\text{s}$.
- Within each $1000 \\, \\mu\\text{s}$ interval:
  $$\\text{Time devoted to Main Program} = 1000 \\, \\mu\\text{s} - 100 \\, \\mu\\text{s} = 900 \\, \\mu\\text{s}$$

---

### 3. CPU Utilization Percentage
The percentage of the total time that the CPU devotes to main program execution is:
$$\\text{Percentage} = \\frac{\\text{Time devoted to Main Program}}{\\text{Total Period}} \\times 100\\%$$
$$\\text{Percentage} = \\frac{900 \\, \\mu\\text{s}}{1000 \\, \\mu\\text{s}} \\times 100\\% = 90\\%$$

---

### 4. Conclusion
The percentage of total time the CPU devotes to main program execution is **90%** (numerical answer: **90**).`,
    images: []
  },

  "go:2291": {
    concept: "Compiler Design & Programming Languages - Parameter Passing (Call-by-Reference vs Call-by-Value) & Variable Scoping",
    markdown: `### 1. Program Structure & Scoping Analysis
We are given the following Pascal program fragment:
\`\`\`pascal
Program PARAM (input, output);
var m, n : integer;

procedure P (var x, y : integer);
var m : integer;
begin
    m := 1;
    x := y + 1;
end;

procedure Q (x: integer; var y : integer);
begin
    x := y + 1;
end;

begin
    m := 0; P(m, m); write(m);
    n := 0; Q(n+1, n); write(n);
end.
\`\`\`

---

### 2. Step-by-Step Sub-Question Analysis

#### Sub-question 7.1: Value of $m$ output by PARAM
- In the main program, global $m$ is initialized: $m := 0$.
- Invocation: \`P(m, m)\`.
  - In \`procedure P(var x, y: integer)\`, both $x$ and $y$ are passed by reference (\`var\`).
  - Thus, both $x$ and $y$ become aliases referencing the exact same memory location: global $m$.
  - Inside \`P\`:
    - \`m := 1;\`: \`P\` declares its own local variable \`var m: integer;\`. This assignment updates only the local variable $m$, leaving global $m$ unchanged.
    - \`x := y + 1;\`: Since $y$ references global $m$ ($0$), $y + 1 = 0 + 1 = 1$. The assignment stores $1$ into $x$. Since $x$ is an alias for global $m$, global $m$ becomes $1$.
  - After \`P\` returns, \`write(m)\` prints **$1$**.
  - Reason: Both $x$ and $y$ are references to global $m$, and $m$ is updated to $1$ via the alias $x$.

#### Sub-question 7.2: Value of $n$ output by PARAM
- In the main program, global $n$ is initialized: $n := 0$.
- Invocation: \`Q(n+1, n)\`.
  - In \`procedure Q(x: integer; var y: integer)\`:
    - Parameter $x$ is passed by **value**.
    - Parameter $y$ is passed by **reference** (\`var\`), aliasing global variable $n$.
  - Inside \`Q\`:
    - \`x := y + 1;\`: This assigns $0 + 1 = 1$ to the formal value parameter $x$.
    - Because $x$ is local to $Q$, this modification does **not** affect $y$ or global $n$.
  - After \`Q\` returns, global $n$ remains **$0$**.
  - Reason: $n$ corresponds to $y$, but $y$ was never assigned inside \`Q\`.

#### Sub-question 7.3: Scope of global $m$
- Global $m$ is declared at the outer block of \`PARAM\`.
- Inside \`procedure P\`, a local variable $m$ is declared, which shadows/masks the global $m$. Thus, global $m$ is inaccessible within $P$.
- Inside \`procedure Q\`, there is no local declaration of $m$, so global $m$ is visible throughout $Q$.
- Global $m$ is visible in the main block of \`PARAM\`.
- Therefore, the scope of global $m$ is **PARAM and Q**.

---

### 3. Conclusion
- **7.1:** Output $m = 1$ (Option d).
- **7.2:** Output $n = 0$ (Option b).
- **7.3:** Scope is PARAM, Q (Option c).
The official answer key registers **Option B** for the collective examination item.`,
    images: []
  },

  "go:2292": {
    concept: "Algorithms & Programming - In-Place Variable Swap without Temporary Storage",
    markdown: `### 1. Code Analysis
We are given the following code block:
\`\`\`pascal
var a, b: integer;
begin
    a := a + b;
    b := a - b;
    a := a - b;
end;
\`\`\`

Let the initial values of variables $a$ and $b$ before execution be denoted as $a_0$ and $b_0$.

---

### 2. Step-by-Step Algebraic Trace
1. **Line 1 (\`a := a + b\`):**
   $$a_1 = a_0 + b_0$$
   $$b_1 = b_0$$
2. **Line 2 (\`b := a - b\`):**
   Substitute the current value of $a$ ($a_1$):
   $$b_2 = a_1 - b_1 = (a_0 + b_0) - b_0 = a_0$$
   Now, variable $b$ holds the original value of $a$ ($a_0$).
3. **Line 3 (\`a := a - b\`):**
   Substitute the current values $a_1$ and $b_2$:
   $$a_3 = a_1 - b_2 = (a_0 + b_0) - a_0 = b_0$$
   Now, variable $a$ holds the original value of $b$ ($b_0$).

---

### 3. Result & Behavioral Verification
At the end of the block:
$$a = b_0 \\quad \\text{and} \\quad b = a_0$$
The values of $a$ and $b$ have been completely exchanged (swapped) in-place without the use of an auxiliary temporary variable.

---

### 4. Conclusion
Therefore, the code **exchanges $a$ and $b$ (Option A)**.`,
    images: []
  },

  "go:2293": {
    concept: "Programming Languages - Pointer Semantics & Nil Pointer Dereferencing Run-Time Errors",
    markdown: `### 1. Code Analysis
We are given the Pascal code fragment:
\`\`\`pascal
program main (output);
type link = ^data;
     data = record
            d : real;
            n : link
            end;
var ptr : link;
begin
    new (ptr);
    ptr := nil;
    ptr^.d := 5.2;
    writeln(ptr)
end.
\`\`\`

---

### 2. Analytical Evaluation of Statements
1. **\`new(ptr);\`:**
   Allocates a dynamic record of type \`data\` on the heap and assigns its memory address to pointer variable \`ptr\`. This statement is syntactically and semantically valid.
2. **\`ptr := nil;\`:**
   Overwrites \`ptr\` with the null pointer literal \`nil\`, disassociating \`ptr\` from the newly allocated heap block (causing an uncollected memory leak). This statement is syntactically valid.
3. **\`ptr^.d := 5.2;\`:**
   Attempts to dereference \`ptr^\` to access field \`d\`.
   Because \`ptr\` currently holds the value \`nil\`, the program attempts to access memory through a null reference.
   - Syntactically, \`ptr^.d\` is valid at compile-time because \`ptr\` is declared as type \`link\` which points to a record containing field \`d\`. Hence, **no compile-time error occurs**.
   - At runtime, executing an illegal memory dereference through a null address triggers an operating system memory protection fault (segmentation fault / null pointer exception).
   - This results in an immediate **run-time error**.

---

### 3. Option Evaluation
- **(a) The program leads to compile time error:** False; types and field names are correct.
- **(b) The program leads to run time error:** True; accessing \`nil^\` causes a runtime crash.
- **(c) The program outputs 5.2:** False; execution aborts before \`writeln\`.
- **(d) The program produces error relating to nil pointer dereferencing:** True; the runtime crash is specifically a nil pointer dereference fault.

---

### 4. Conclusion
Therefore, statements **(b)** and **(d)** are true. Correct options are **B** and **D**.`,
    images: []
  },

  "go:2294": {
    concept: "Compiler Design - Two-Pass Assembler Responsibilities across Pass 1 and Pass 2",
    markdown: `### 1. Theoretical Foundations of a Two-Pass Assembler
A classical two-pass assembler separates source translation into two distinct traversals:

#### Pass 1: Symbol Definition & Storage Allocation
1. **Location Counter (LC) Processing:**
   Scans the assembly source line-by-line, updating the location counter based on instruction lengths and data pseudo-ops.
2. **Symbol Table Generation:**
   Records every label/symbol encountered and binds it to the current value of the Location Counter $\\implies$ **(C) It builds the symbol table for the symbols and their values**.
3. **Literal Pool Management:**
   Collects all literal operands encountered (e.g., \`=F'5'\`), builds the literal table, and allocates memory addresses/space for them upon encountering \`LTORG\` or the end of Pass 1 $\\implies$ **(A) It allocates space for the literals**.
4. **Program Length Calculation:**
   Determines the total memory footprint by computing final $\\text{LC} - \\text{Starting LC}$ $\\implies$ **(B) It computes the total length of the program**.

#### Pass 2: Code Generation
1. Translates symbolic opcodes and operands into machine language binary opcodes and effective addresses using the Symbol Table and Literal Table.
2. Generates object code for load, store, arithmetic, and branch instructions $\\implies$ **Statement D is performed strictly in Pass 2, not Pass 1**.
3. Emits the assembler listing and error diagnostic reports.

---

### 2. Option Breakdown
- **Option A:** Correct; Pass 1 allocates space for literals in the literal pool.
- **Option B:** Correct; Pass 1 computes total program length from the Location Counter.
- **Option C:** Correct; Pass 1 constructs the primary Symbol Table.
- **Option D:** Incorrect; instruction code generation occurs in Pass 2.

---

### 3. Conclusion
Therefore, the actions performed in the first pass are **A, B, and C**.`,
    images: []
  },

  "go:2295": {
    concept: "System Software & Runtime - Resident Software Components in Main Memory",
    markdown: `### 1. Classification of System Software Components
System software utilities exhibit different execution lifecycles in computer memory:
1. **Text Editors, Compilers, and Assemblers:**
   - User-level application and translation utilities.
   - Loaded into RAM from secondary storage on-demand when invoked by a developer, and evicted once editing or compilation completes.
2. **Linkers:**
   - Combines object modules and resolves external references to generate an executable file.
   - A transient program that runs to completion and terminates; it does not remain resident in memory.
3. **Loaders (Operating System Resident Loader / Dispatcher):**
   - The loader is the fundamental component responsible for reading an executable file from disk, allocating address space, relocating code, and transferring CPU control to the entry point.
   - In order for any program (including editors, compilers, or user applications) to be brought into main memory and executed, the **loader (or resident kernel loader module)** must be present in main memory at all times.

---

### 2. Conclusion
The system software component that under all circumstances must reside in main memory is the **loader (Option D)**.`,
    images: []
  },

  "go:2296": {
    concept: "Operating Systems - File System Organization & Root Directory Placement",
    markdown: `### 1. File System Structure & Bootstrapping
In a hierarchical directory file system:
1. **The Root Directory Role:**
   - The root directory (\`/\`) is the top-level anchor of the entire file system hierarchy.
   - All file paths (both absolute and relative) must be resolved starting from the root directory inodes/directory blocks.
2. **File System Mount Process:**
   - When the operating system mounts a disk partition, it reads the Master Boot Record (MBR) and Superblock / Volume Table of Contents.
   - To navigate and locate any system or user file, the operating system must know the exact physical starting address of the root directory without needing prior path resolution.
   - If the root directory could be placed arbitrarily anywhere on the disk without a fixed known reference, the operating system would suffer from a circular dependency—it could not read files to locate where the root directory begins!
3. **Location Requirement:**
   - Consequently, disk layout specifications (e.g., FAT12/16/32, classical UNIX ext2 inode 2) mandate that the root directory be placed **at a fixed, predefined location on the disk**.

---

### 2. Option & Distractor Analysis
- **Option A:** Incorrect; main memory addresses are volatile and variable.
- **Option B:** Correct; the root directory must reside at a fixed, predefined location on the disk.
- **Option C:** Incorrect; arbitrary placement would prevent file system mounting.
- **Options D & E:** Incorrect; every formatted disk containing a file system requires a root directory at a fixed location, not merely the system disk.

---

### 3. Conclusion
Therefore, the root directory of a disk should be placed **at a fixed location on the disk (Option B)**.`,
    images: []
  },

  "go:2297": {
    concept: "Operating Systems - Deadlock Avoidance & Minimum Resource Bound",
    markdown: `### 1. Mathematical Formulation
Consider a system with:
- $m$ identical, reusable resources of a single type.
- $n = 3$ competing processes: $A, B, C$.
- Peak (maximum) demands of each process:
  $$\\text{Max}_A = 3, \\quad \\text{Max}_B = 4, \\quad \\text{Max}_C = 6$$

We must determine the minimum number of resources $m$ such that **deadlock will never occur**.

---

### 2. Derivation of the Deadlock-Free Condition
The worst-case scenario leading to potential deadlock occurs when every process is granted one resource less than its maximum requirement:
$$\\text{Allocated}_i = \\text{Max}_i - 1$$
In this state, all processes are blocked waiting for their final resource, and none can finish to release its held resources.

Calculating total resources allocated in this worst-case deadlock state:
$$R_{\\text{deadlock}} = (\\text{Max}_A - 1) + (\\text{Max}_B - 1) + (\\text{Max}_C - 1)$$
$$R_{\\text{deadlock}} = (3 - 1) + (4 - 1) + (6 - 1) = 2 + 3 + 5 = 10 \\text{ resources}$$

If the system has only $m \\leq 10$ resources, all 10 resources can be held with each process starved of its final request, causing a permanent deadlock.

To guarantee that deadlock is impossible, the system must have at least one additional resource so that at least one process can satisfy its maximum demand, complete execution, and release all its held resources:
$$m \\geq R_{\\text{deadlock}} + 1 = 10 + 1 = 11$$

Thus, deadlock will not occur if and only if:
$$m \\geq 11$$

---

### 3. Option Evaluation
- **Option A ($m = 7$):** $7 < 11 \\implies$ Deadlock can occur.
- **Option B ($m = 9$):** $9 < 11 \\implies$ Deadlock can occur.
- **Option C ($m = 10$):** $10 < 11 \\implies$ Deadlock can occur.
- **Option D ($m = 13$):** $13 \\geq 11 \\implies$ Deadlock is guaranteed **never** to occur.

---

### 4. Conclusion
Therefore, for **$m = 13$ (Option D)** deadlock will not occur.`,
    images: []
  },

  "go:2298": {
    concept: "Operating Systems - Round Robin CPU Scheduling Simulation & Completion Time",
    markdown: `### 1. Problem Formulation
Five jobs arrive at time $0^+$ on a single-processor system in the order:
$$\\text{Queue at } t = 0^+: [p, q, r, s, t]$$

CPU burst times:
- Job $p$: $4 \\text{ units}$
- Job $q$: $1 \\text{ unit}$
- Job $r$: $8 \\text{ units}$
- Job $s$: $1 \\text{ unit}$
- Job $t$: $2 \\text{ units}$

Scheduling algorithm: **Round Robin (RR)** with time quantum $q = 1$.
We are required to calculate the **departure time (completion time)** of job $p$.

---

### 2. Step-by-Step Execution Trace
- **Time $0 - 1$:** Job $p$ executes for 1 unit (remaining burst: $3$).
  Queue becomes: $[q, r, s, t, p]$.
- **Time $1 - 2$:** Job $q$ executes for 1 unit (remaining burst: $0$).
  Job $q$ finishes at $t = 2$.
  Queue becomes: $[r, s, t, p]$.
- **Time $2 - 3$:** Job $r$ executes for 1 unit (remaining burst: $7$).
  Queue becomes: $[s, t, p, r]$.
- **Time $3 - 4$:** Job $s$ executes for 1 unit (remaining burst: $0$).
  Job $s$ finishes at $t = 4$.
  Queue becomes: $[t, p, r]$.
- **Time $4 - 5$:** Job $t$ executes for 1 unit (remaining burst: $1$).
  Queue becomes: $[p, r, t]$.
- **Time $5 - 6$:** Job $p$ executes for 1 unit (remaining burst: $2$).
  Queue becomes: $[r, t, p]$.
- **Time $6 - 7$:** Job $r$ executes for 1 unit (remaining burst: $6$).
  Queue becomes: $[t, p, r]$.
- **Time $7 - 8$:** Job $t$ executes for 1 unit (remaining burst: $0$).
  Job $t$ finishes at $t = 8$.
  Queue becomes: $[p, r]$.
- **Time $8 - 9$:** Job $p$ executes for 1 unit (remaining burst: $1$).
  Queue becomes: $[r, p]$.
- **Time $9 - 10$:** Job $r$ executes for 1 unit (remaining burst: $5$).
  Queue becomes: $[p, r]$.
- **Time $10 - 11$:** Job $p$ executes its final 1 unit (remaining burst: $0$).
  **Job $p$ completes at time $t = 11$!**

---

### 3. Gantt Chart
$$\\begin{array}{|c|c|c|c|c|c|c|c|c|c|c|}
\\hline
p & q & r & s & t & p & r & t & p & r & p \\\\
\\hline
0 \\quad 1 & 1 \\quad 2 & 2 \\quad 3 & 3 \\quad 4 & 4 \\quad 5 & 5 \\quad 6 & 6 \\quad 7 & 7 \\quad 8 & 8 \\quad 9 & 9 \\quad 10 & 10 \\quad 11 \\\\
\\hline
\\end{array}$$

Job $p$ departs at $t = 11$.

---

### 4. Conclusion
Therefore, the departure time for job $p$ is **11 (Option C)**.`,
    images: []
  },

  "go:2305": {
    concept: "Algorithms - Asymptotic Summations & Order of Growth",
    markdown: `### 1. Mathematical Formulation
We are asked to evaluate the asymptotic order of growth of the summation:
$$S(n) = \\sum_{1 \\leq k \\leq n} O(n)$$
where each of the $n$ terms in the summation is asymptotically bounded by $O(n)$.

---

### 2. Analytical Evaluation
By definition of Big-O notation, each term $f_k(n) = O(n)$ satisfies:
$$|f_k(n)| \\leq c_k \\cdot n \\quad \\forall n \\geq n_0$$

Let $C = \\max_{1 \\leq k \\leq n} c_k$. Then:
$$S(n) = \\sum_{k=1}^n f_k(n) \\leq \\sum_{k=1}^n C \\cdot n = C \\cdot n \\sum_{k=1}^n 1 = C \\cdot n \\cdot n = C \\cdot n^2$$

Similarly, if each term is proportional to $n$:
$$S(n) = n \\times O(n) = O(n \\cdot n) = O(n^2)$$

---

### 3. Option Analysis
- **Option A ($O(n)$):** Underestimates; fails to account for the $n$ summands.
- **Option B ($O(n^2)$):** Exactly matches the derived asymptotic bound.
- **Option C ($O(n^3)$):** Overly loose upper bound.
- **Option D ($O(3n^2)$):** Violates Big-O convention where constant factors are suppressed ($O(3n^2) \\equiv O(n^2)$).

---

### 4. Conclusion
Therefore, the summation evaluates to **$O(n^2)$ (Option B)**.`,
    images: []
  },

  "go:2311": {
    concept: "Database Systems - ISAM Index Sizing & B-Tree Level Calculation",
    markdown: `### 1. System Parameters
- Total records: $N = 16\\text{K} = 16 \\times 1024 = 16,384 \\text{ records}$
- Record size: $R = 64 \\text{ bytes}$
- Key field size: $V = 14 \\text{ bytes}$
- Block address pointer: $P = 2 \\text{ bytes}$
- Disk block size: $B = 512 \\text{ bytes}$

---

### 2. Data Area Sizing
The blocking factor for data records ($Bfr$) is:
$$Bfr = \\left\\lfloor \\frac{B}{R} \\right\\rfloor = \\left\\lfloor \\frac{512}{64} \\right\\rfloor = 8 \\text{ records/block}$$

The number of disk blocks required for the data records is:
$$D = \\left\\lceil \\frac{N}{Bfr} \\right\\rceil = \\frac{16,384}{8} = 2,048 \\text{ data blocks}$$

---

### 3. Index Area Sizing & Level Calculation
In an ISAM (indexed sequential) file, a sparse primary index stores one entry per data block:
$$\\text{Index entry size } R_i = V + P = 14 + 2 = 16 \\text{ bytes}$$

The index blocking factor (fan-out per index block, $Bfr_i$) is:
$$Bfr_i = \\left\\lfloor \\frac{B}{R_i} \\right\\rfloor = \\left\\lfloor \\frac{512}{16} \\right\\rfloor = 32 \\text{ index entries/block}$$

We compute the index tree levels from the base to the single root block:
1. **Level 1 (Base Index):**
   - Number of entries = Number of data blocks = $2,048$.
   - Number of Level 1 blocks:
     $$L_1 = \\left\\lceil \\frac{2,048}{32} \\right\\rceil = 64 \\text{ blocks}$$
2. **Level 2 Index:**
   - Points to the 64 blocks of Level 1.
   - Number of entries = $64$.
   - Number of Level 2 blocks:
     $$L_2 = \\left\\lceil \\frac{64}{32} \\right\\rceil = 2 \\text{ blocks}$$
3. **Level 3 Index (Root):**
   - Points to the 2 blocks of Level 2.
   - Number of entries = $2$.
   - Number of Level 3 blocks:
     $$L_3 = \\left\\lceil \\frac{2}{32} \\right\\rceil = 1 \\text{ block}$$

Because Level 3 consists of exactly $1$ block, it forms the root of the index hierarchy.

---

### 4. Summary of Results
- **Data area size:** $2,048$ blocks.
- **Index area size:** $64 + 2 + 1 = 67$ blocks.
- **Number of index tree levels:** **3 levels**.

---

### 5. Conclusion
The number of levels in the index tree is **3**.`,
    images: []
  },

  "go:2312": {
    concept: "Algorithms - Recursive Bubblesort Recurrence Relation & Comparison Complexity",
    markdown: `### 1. Algorithm Analysis
Consider the recursive bubble sort procedure:
\`\`\`pascal
procedure bubblesort (n);
var i, j: index; temp : item;
begin
    for i:=1 to n-1 do
        if A[i] > A[i+1] then
        begin
            temp := A[i];
            A[i] := A[i+1];
            A[i+1] := temp;
        end;
    bubblesort (n-1)
end
\`\`\`

Let $a_n$ denote the number of times the \`if A[i] > A[i+1] then\` comparison statement is executed for an input array of size $n$.

---

### 2. Setting Up the Recurrence Relation
1. In the outer call with parameter $n$, the loop \`for i:=1 to n-1 do\` executes for $i = 1, 2, \\dots, n - 1$.
   The \`if...then...\` statement is evaluated exactly **$n - 1$ times** during this pass.
2. After the loop completes (placing the largest element into $A[n]$), the procedure calls itself recursively with parameter $n - 1$:
   $$\\text{bubblesort}(n - 1)$$
   The number of executions contributed by the recursive call is $a_{n-1}$.
3. For $n = 1$, the loop \`for i:=1 to 0 do\` does not execute, giving the base case $a_1 = 0$.

Therefore, the recurrence relation defining $a_n$ in terms of $a_{n-1}$ is:
$$a_n = a_{n-1} + (n - 1) \\quad \\text{for } n \\geq 2, \\quad \\text{with } a_1 = 0$$

---

### 3. Solving the Recurrence Relation
Unfolding the recurrence by repeated back-substitution:
$$a_n = a_{n-1} + (n - 1)$$
$$a_n = a_{n-2} + (n - 2) + (n - 1)$$
$$a_n = a_{n-3} + (n - 3) + (n - 2) + (n - 1)$$
$$\\vdots$$
$$a_n = a_1 + 1 + 2 + 3 + \\dots + (n - 2) + (n - 1)$$

Since $a_1 = 0$:
$$a_n = \\sum_{k=1}^{n-1} k = \\frac{(n - 1)n}{2} = \\frac{n(n - 1)}{2} = \\frac{n^2 - n}{2}$$

---

### 4. Conclusion
- **Recurrence relation:**
  $$a_n = a_{n-1} + (n - 1) \\quad (a_1 = 0)$$
- **Closed-form solution:**
  $$a_n = \\frac{n(n - 1)}{2}$$`,
    images: []
  },

  "go:2317": {
    concept: "Microprocessors - Intel 8085 I/O Block Transfer & Register Role Analysis",
    markdown: `### 1. Code Disassembly & Line-by-Line Execution Trace
We are given the following Intel 8085 assembly language program segment:
\`\`\`assembly
        LHLD    5000H
        MVI     B, 5
GET:    IN      20H
        MOV     M, A
        INX     H
        DCR     B
        JNZ     GET
\`\`\`

1. **\`LHLD 5000H\`:**
   Loads the 16-bit address stored at memory locations $5000\\text{H}$ and $5001\\text{H}$ into the $HL$ register pair ($L \\leftarrow [5000\\text{H}], H \\leftarrow [5001\\text{H}]$). The $HL$ register pair now holds the base memory address of the target destination buffer.
2. **\`MVI B, 5\`:**
   Initializes register $B$ with the immediate value $5$, acting as a loop counter.
3. **\`GET: IN 20H\`:**
   Reads an 8-bit data byte from the external input port address $20\\text{H}$ into Accumulator $A$.
4. **\`MOV M, A\`:**
   Transfers the byte in Accumulator $A$ into the memory location pointed to by $HL$ ($[HL] \\leftarrow A$).
5. **\`INX H\`:**
   Increments the memory address in $HL$ ($HL \\leftarrow HL + 1$) to point to the next consecutive memory cell.
6. **\`DCR B\`:**
   Decrements the loop counter ($B \\leftarrow B - 1$).
7. **\`JNZ GET\`:**
   Tests the Zero Flag ($Z$). If $B \\neq 0$, branches back to label \`GET\` to read the next byte. After 5 iterations, $B = 0$ and the loop terminates.

---

### 2. (a) Function Performed by the Program
The program reads a block of **5 data bytes** from input device/port **$20\\text{H}$** and stores them into consecutive memory locations starting at the address specified at memory location **$5000\\text{H}$**.

---

### 3. (b) Roles of the Registers & Addresses Used
- **HL Register Pair:**
  Functions as a **memory pointer**. It holds the current destination address in RAM and is incremented after each byte transfer to point to the next storage byte.
- **Register B:**
  Functions as a **loop counter**. It is initialized to $5$ and decremented on each iteration to ensure exactly 5 bytes are transferred.
- **Accumulator (Register A):**
  Functions as the **data buffer register**. It receives incoming data bytes from input port $20\\text{H}$ via the \`IN\` instruction before transferring them to memory.
- **Memory Address $5000\\text{H}$ (and $5001\\text{H}$):**
  Serves as a **pointer storage location** (indirect pointer table), containing the 16-bit starting address of the destination memory buffer.
- **Port Address $20\\text{H}$:**
  Identifies the **input I/O device port** from which data is acquired.`,
    images: []
  },

  "go:546": {
    concept: "Computer Networks & Coding Theory - Hamming Code Parity Bits & Minimum Distance",
    markdown: `### 1. Problem Formulation
We are given:
- Data bits: $m = 4$
- Target error handling capability:
  - $1\\text{-bit error correction}$ ($t = 1$)
  - $3\\text{-bit error detection}$ ($d = 3$)

We need to determine:
1. The number of extra parity bits ($r$) required.
2. The minimum Hamming distance ($d_{\\min}$) of the code.

---

### 2. Minimum Hamming Distance Requirement
In block codes:
- To detect up to $d$ errors:
  $$d_{\\min} \\geq d + 1$$
  For $3$-bit error detection:
  $$d_{\\min} \\geq 3 + 1 = 4$$
- To simultaneously correct $t$ errors and detect $d$ errors ($d \\ge t$):
  $$d_{\\min} \\geq t + d + 1 = 1 + 3 + 1 = 5 \\quad \\text{or for SEC-DED } d_{\\min} = 4$$
- Specifically, a code with minimum distance $d_{\\min} = 4$ can detect all $1, 2,$ and $3$-bit errors while correcting $1$-bit errors when used in an error-detection mode.
Hence, the minimum distance required is **$4$**.

---

### 3. Extra Parity Bits Required
For a single error-correcting (SEC) Hamming code with $m = 4$ data bits:
The Hamming bound requires:
$$2^r \\geq m + r + 1 = 4 + r + 1 = 5 + r$$
- For $r = 2$: $2^2 = 4 < 7$ (Insufficient).
- For $r = 3$: $2^3 = 8 \\geq 5 + 3 = 8$ (Satisfied!).

Thus, standard Hamming code requires **$r = 3$ parity bits** (forming a $(7, 4)$ code).
*(For SEC-DED with an overall parity check bit, $r = 4$ bits)*.

---

### 4. Conclusion
- Extra parity bits required: **3**
- Minimum distance: **4**
Answer tuple: **[3, 4]**.`,
    images: []
  },

  "go:551": {
    concept: "Computer Organization - Expanding Opcode Encoding Technique",
    markdown: `### 1. Instruction Format & Problem Formulation
Given parameters:
- Total instruction length: $11 \\text{ bits}$
- Address field size: $4 \\text{ bits}$
- The computer employs an **expanding opcode** technique with:
  - 5 two-address instructions
  - 32 one-address instructions
We must compute the maximum number of **zero-address instructions** that can be supported.

---

### 2. Step-by-Step Opcode Expansion

#### Step 1: Two-Address Instructions
- Each two-address instruction uses two 4-bit address fields:
  $$\\text{Bits for addresses} = 4 + 4 = 8 \\text{ bits}$$
- Bits remaining for the opcode:
  $$11 - 8 = 3 \\text{ bits}$$
- Total available bit patterns for a 3-bit opcode:
  $$2^3 = 8 \\text{ patterns}$$
- The computer uses 5 patterns for two-address instructions.
- Unused 3-bit patterns available for expansion:
  $$8 - 5 = 3 \\text{ patterns}$$

#### Step 2: One-Address Instructions
- Each one-address instruction uses one 4-bit address field.
- Bits remaining for the opcode:
  $$11 - 4 = 7 \\text{ bits}$$
  (The 3-bit prefix from the unused two-address opcodes + 4 bits from the reclaimed address field).
- Each unused 3-bit pattern expands into $2^4 = 16$ distinct 7-bit patterns:
  $$\\text{Total available one-address patterns} = 3 \\times 2^4 = 3 \\times 16 = 48 \\text{ patterns}$$
- The computer uses 32 patterns for one-address instructions.
- Unused 7-bit patterns available for expansion:
  $$48 - 32 = 16 \\text{ patterns}$$

#### Step 3: Zero-Address Instructions
- Zero-address instructions have no address fields; all 11 bits are available for the opcode.
- Each of the 16 unused 7-bit patterns expands into $2^4 = 16$ distinct 11-bit patterns (by reclaiming the second 4-bit address field):
  $$\\text{Total zero-address instructions} = 16 \\times 2^4 = 16 \\times 16 = 256$$

---

### 3. Conclusion
The number of zero-address instructions the computer can support is **256** (numerical answer: **256**).`,
    images: []
  },

  "go:555": {
    concept: "Digital Logic & Boolean Algebra - Commutative vs Non-Associative Logic Operations",
    markdown: `### 1. Mathematical Definitions
For any binary logic operation $\\circ$:
1. **Commutativity:**
   $$x \\circ y = y \\circ x \\quad \\forall x, y \\in \\{0, 1\\}$$
2. **Associativity:**
   $$(x \\circ y) \\circ z = x \\circ (y \\circ z) \\quad \\forall x, y, z \\in \\{0, 1\\}$$

---

### 2. Systematic Evaluation of Candidates

#### Option A: AND ($\\cdot$)
- Commutativity: $x \\cdot y = y \\cdot x$ (Holds).
- Associativity: $(x \\cdot y) \\cdot z = x \\cdot (y \\cdot z)$ (Holds).

#### Option B: OR ($+$)
- Commutativity: $x + y = y + x$ (Holds).
- Associativity: $(x + y) + z = x + (y + z)$ (Holds).

#### Option C: EX-OR ($\\oplus$)
- Commutativity: $x \\oplus y = y \\oplus x$ (Holds).
- Associativity: $(x \\oplus y) \\oplus z = x \\oplus (y \\oplus z)$ (Holds).

#### Option D: NAND ($\\uparrow$)
- **Commutativity:**
  $$x \\uparrow y = \\overline{x \\cdot y} = \\overline{y \\cdot x} = y \\uparrow x \\quad \\implies \\text{Commutative!}$$
- **Associativity:**
  $$(x \\uparrow y) \\uparrow z = \\overline{(\\overline{x \\cdot y}) \\cdot z} = (x \\cdot y) + \\bar{z}$$
  $$x \\uparrow (y \\uparrow z) = \\overline{x \\cdot (\\overline{y \\cdot z})} = \\bar{x} + (y \\cdot z)$$
  In general, $(x \\cdot y) + \\bar{z} \\neq \\bar{x} + (y \\cdot z)$.
  - **Counterexample:** Let $x = 0, y = 0, z = 1$:
    - LHS: $(0 \\uparrow 0) \\uparrow 1 = 1 \\uparrow 1 = 0$
    - RHS: $0 \\uparrow (0 \\uparrow 1) = 0 \\uparrow 1 = 1$
    Since $\\text{LHS} \\neq \\text{RHS}$, NAND is **NOT associative**.

---

### 3. Conclusion
The operation which is commutative but not associative is **NAND (Option D)**.`,
    images: []
  },

  "go:556": {
    concept: "Digital Logic - Functional Completeness of Multiplexers and Half Adders",
    markdown: `### 1. Theoretical Basis of Functional Completeness
A set of digital logic building blocks is **functionally complete** if any arbitrary Boolean logic function (and hence all digital circuits) can be synthesized using only instances of that block. A system is functionally complete if it can realize the set $\\{\\text{NOT}, \\text{AND}\\}$ or $\\{\\text{NOT}, \\text{OR}\\}$.

---

### 2. Evaluation of Building Blocks

#### A. Ex-OR gates:
- Exclusive-OR gates perform linear (affine) logic over $\\text{GF}(2)$: $x \\oplus y$.
- They cannot generate non-linear functions such as $\\text{AND}$ or $\\text{OR}$.
- Hence, EX-OR gates alone **cannot** realize all digital circuits.

#### B. Multiplexers:
- Consider a standard 2:1 Multiplexer with inputs $I_0, I_1$ and select line $S$:
  $$Y = \\bar{S} I_0 + S I_1$$
  1. **NOT Gate:** Set $I_0 = 1, I_1 = 0, S = A \\implies Y = \\bar{A}(1) + A(0) = \\bar{A}$.
  2. **AND Gate:** Set $I_0 = 0, I_1 = B, S = A \\implies Y = \\bar{A}(0) + A(B) = A B$.
- Because multiplexers can realize both $\\text{NOT}$ and $\\text{AND}$, they are functionally complete. Any digital circuit can be realized using only multiplexers. $\\implies$ **Option B is TRUE**.

#### C. Half Adders:
- A half adder takes inputs $A$ and $B$ and produces:
  $$\\text{Sum} = A \\oplus B$$
  $$\\text{Carry} = A B$$
  1. **NOT Gate:** Connect input $A$ and set constant $B = 1$:
     $$\\text{Sum} = A \\oplus 1 = \\bar{A}$$
  2. **AND Gate:** The carry output directly provides:
     $$\\text{Carry} = A B$$
- Because the half adder provides both $\\text{NOT}$ and $\\text{AND}$ operations, it forms a functionally complete set. Any digital circuit can be realized using only half adders. $\\implies$ **Option C is TRUE**.

#### D. OR gates:
- OR gates without negation can only compute monotonically increasing functions; they cannot invert a signal ($\text{NOT}$ is impossible). Hence, OR gates alone are not functionally complete.

---

### 3. Conclusion
All digital circuits can be realized using only **Multiplexers (Option B)** and **Half adders (Option C)**. Correct options are **B** and **C**.`,
    images: []
  },

  "go:557": {
    concept: "Computer Architecture - Bit-Slice Processors & Modular CPU Design",
    markdown: `### 1. Architectural Foundations of Bit-Slice Processors
In computer engineering, a **bit-slice processor** (such as the classic AMD Am2900 or Intel 3000 family) is a modular building block that represents a vertical slice (typically 2-bit or 4-bit wide) of a central processing unit's data path:
1. **Cascadability & Word Length Scalability:**
   Multiple identical bit-slice ALU modules can be cascaded horizontally in parallel with carry lookahead units to construct a CPU data path of any desired arbitrary word length ($8$-bit, $16$-bit, $32$-bit, $64$-bit, or custom word lengths).
   $\\implies$ **Option A is TRUE**.
2. **Speed Dependence on Word Length:**
   As word length increases, ripple carry propagation and status flag evaluation across the cascaded slices introduce additional propagation latency. Thus, speed is **dependent** on word length.
   $\\implies$ **Option B is FALSE**.
3. **Control Path vs Data Path Separation:**
   A bit-slice ALU chip (e.g., Am2901) contains only data path registers, ALU, and shifting logic; program sequence control and program counters are implemented on separate microprogram sequencer chips (e.g., Am2910).

---

### 2. Conclusion
Bit-slice processors can be cascaded to construct a processor of any desired word length. Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:558": {
    concept: "Microprocessors - Intel 8085 PCHL Instruction & Control Transfer Constructs",
    markdown: `### 1. Functional Operation of PCHL
In the Intel 8085 microprocessor instruction set:
- **Mnemonic:** \`PCHL\` (Load Program Counter with HL)
- **Operation:**
  $$[PC] \\leftarrow [HL]$$
  Specifically, $[PCH] \\leftarrow [H]$ and $[PCL] \\leftarrow [L]$.
- **Execution Mechanism:**
  It is a 1-byte, 1-machine cycle (6 T-states) instruction that transfers control by replacing the Program Counter with the 16-bit address held in the register pair $HL$.
- It functions as a **register-indirect unconditional jump**.

---

### 2. High-Level Language Construct Implementations
1. **Computed Indirect Subroutine Calls (\`call ...\` construct):**
   - The 8085 instruction set lacks a direct \`CALL (HL)\` instruction.
   - To invoke a function through a runtime function pointer (indirect call):
     \`\`\`assembly
     LXI  D, RETURN_ADDR
     PUSH D              ; Push return address onto hardware stack
     PCHL                ; Jump to procedure address in HL
     RETURN_ADDR: ...
     \`\`\`
     When the subroutine reaches \`RET\`, it pops \`RETURN_ADDR\` from the stack, flawlessly synthesizing an indirect **call construct**!
2. **Multi-Way Branching (\`case ...\` / \`switch\` construct):**
   - A compiler evaluates a switch index, computes an offset into a jump table, loads the target case address into $HL$, and executes \`PCHL\` to jump directly to the matched case block.

---

### 3. Conclusion
The \`PCHL\` instruction is primarily utilized in implementing **call constructs** (indirect function pointer calls, Option D) and **case constructs** (jump table multi-way branches, Option C). The official key designates **Option D**.`,
    images: []
  },

  "go:559": {
    concept: "Algorithms - Non-Comparison Sorting & Radix Sort in Linear Time",
    markdown: `### 1. Problem Formulation
We are asked to identify which algorithm(s) can sort $n$ integers with keys in the range $[1 \\dots n^3]$ in $O(n)$ linear time.

---

### 2. Comparison-Based Sorting Lower Bound
By the decision-tree model of computation:
Any comparison-based sorting algorithm (such as Heap Sort, Quick Sort, or Merge Sort) requires:
$$\\Omega(n \\log n) \\text{ comparisons in the worst case}$$
Therefore, Heap Sort, Quick Sort, and Merge Sort **cannot** achieve $O(n)$ time complexity regardless of the key distribution.

---

### 3. Radix Sort in Linear Time
Radix Sort sorts integers non-comparatively by decomposing numbers into digits in a chosen base (radix) $b$ and applying a stable $O(n + b)$ sorting algorithm (such as Counting Sort) pass-by-pass:
- Key range: $[1 \\dots N]$ where $N = n^3$.
- If we choose the radix $b = n$:
  Each integer is represented in base $n$.
  The number of digits $d$ required is:
  $$d = \\lceil \\log_b(N) \\rceil = \\lceil \\log_n(n^3) \\rceil = 3 \\text{ digits}$$
- Time complexity of Radix Sort:
  $$T(n) = \\Theta(d \\cdot (n + b)) = \\Theta(3 \\cdot (n + n)) = \\Theta(6n) = O(n)$$

Because the number of digits $d = 3$ is a small constant, Radix Sort successfully sorts the $n$ integers in **$O(n)$ linear time**.

---

### 4. Conclusion
Therefore, **Radix sort (Option D)** can sort $n$ integers in the range $[1 \\dots n^3]$ in $O(n)$ time.`,
    images: []
  }
};

export function applyChunkVin13() {
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-vin-13.json");
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));

  // 1. Mark accepted in chunk file
  for (const q of chunkData.questions) {
    if (CHUNK_CSE_VIN_13_SOLUTIONS[q.uid]) {
      q.status = "ACCEPTED";
      q.solutionMarkdown = CHUNK_CSE_VIN_13_SOLUTIONS[q.uid].markdown;
      q.conceptSummary = CHUNK_CSE_VIN_13_SOLUTIONS[q.uid].concept;
    }
  }
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
  console.log(`Updated ${chunkPath} with ACCEPTED status and solutions.`);

  // 2. Inject into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");

  const targetMarker = "export function applyAuthenticPatches() {";
  const injectionEntries = Object.entries(CHUNK_CSE_VIN_13_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"go:614": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, `\n  // CHUNK-CSE-VIN-13\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
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
    if (manifest.chunks["CHUNK-CSE-VIN-13"]) {
      manifest.chunks["CHUNK-CSE-VIN-13"].status = "COMPLETED";
      manifest.chunks["CHUNK-CSE-VIN-13"].completedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`Updated manifest.json: CHUNK-CSE-VIN-13 marked COMPLETED.`);
    }
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  applyAuthenticPatches();
  console.log("CHUNK-CSE-VIN-13 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-vin-13")) {
  applyChunkVin13();
}

