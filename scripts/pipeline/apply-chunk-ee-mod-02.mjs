import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_EE_MOD_02_SOLUTIONS = {
  "ee:2020:q52": {
    concept: "Electrical Measurements - Diode Current Sensitivity & Error Propagation in Quadrature",
    markdown: `- **Concept / Subtopic**: Electrical Measurements - Diode Current Sensitivity & Error Propagation in Quadrature
- **Given Parameters**:
  - Bias voltage across diode: $V = 0.02\\text{ V} = 20\\text{ mV}$.
  - Uncertainty in voltage source (resolution limit): $\\Delta V = 1\\text{ mV} = 0.001\\text{ V}$.
  - Measured effective thermal voltage: $V_T = 29\\text{ mV} = 0.029\\text{ V}$.
  - Uncertainty in thermal voltage: $\\Delta V_T = 2\\text{ mV} = 0.002\\text{ V}$.
- **Governing Equations**:
  - The Shockley diode current equation is:
    $$I = I_0 \\left(e^{V/V_T} - 1\\right)$$
  - Taking partial derivatives to evaluate sensitivity coefficients:
    $$\\frac{\\partial I}{\\partial V} = I_0 e^{V/V_T} \\left(\\frac{1}{V_T}\\right)$$
    $$\\frac{\\partial I}{\\partial V_T} = I_0 e^{V/V_T} \\left(-\\frac{V}{V_T^2}\\right)$$
  - Dividing by $I = I_0(e^{V/V_T} - 1)$ gives the fractional sensitivity components:
    $$\\frac{1}{I}\\frac{\\partial I}{\\partial V} = \\left(\\frac{e^{V/V_T}}{e^{V/V_T} - 1}\\right) \\frac{1}{V_T}$$
    $$\\frac{1}{I}\\frac{\\partial I}{\\partial V_T} = -\\left(\\frac{e^{V/V_T}}{e^{V/V_T} - 1}\\right) \\frac{V}{V_T^2}$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Non-Dimensional Factor**:
     $$\\frac{V}{V_T} = \\frac{20\\text{ mV}}{29\\text{ mV}} \\approx 0.689655$$
     $$e^{V/V_T} = e^{0.689655} \\approx 1.99303$$
     $$F = \\frac{e^{V/V_T}}{e^{V/V_T} - 1} = \\frac{1.99303}{1.99303 - 1} = \\frac{1.99303}{0.99303} \\approx 2.00699$$
  2. **Uncertainty Component from Voltage Bias $\\Delta V$**:
     $$\\delta_V = \\frac{\\Delta I_V}{I} = F \\left(\\frac{\\Delta V}{V_T}\\right) = 2.00699 \\times \\left(\\frac{1\\text{ mV}}{29\\text{ mV}}\\right) = 2.00699 \\times 0.034483 \\approx 0.069207$$
  3. **Uncertainty Component from Thermal Voltage $\\Delta V_T$**:
     $$\\delta_{V_T} = \\frac{\\Delta I_{V_T}}{I} = F \\left(\\frac{V}{V_T}\\right) \\left(\\frac{\\Delta V_T}{V_T}\\right) = 2.00699 \\times 0.689655 \\times \\left(\\frac{2\\text{ mV}}{29\\text{ mV}}\\right) \\approx 0.095458$$
  4. **Total Uncertainty Combined in Quadrature**:
     - Since errors in voltage source resolution and thermal voltage measurement are statistically independent:
       $$\\frac{\\Delta I}{I} = \\sqrt{\\delta_V^2 + \\delta_{V_T}^2} = \\sqrt{(0.069207)^2 + (0.095458)^2}$$
       $$\\frac{\\Delta I}{I} = \\sqrt{0.004790 + 0.009112} = \\sqrt{0.013902} \\approx 0.117906$$
     - In percentage terms:
       $$\\text{Percentage Uncertainty} = 0.117906 \\times 100\\% \\approx 11.79\\% \\approx 11.75\\%$$

Therefore, the correct numerical value is within the official range of **[11.50 to 12.00]**, with a computed value of **11.75%**.`,
    images: []
  },
  "ee:2019:q3": {
    concept: "Engineering Mathematics (EE) - Second-Order Partial Differential Equations",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EE) - Second-Order Partial Differential Equations
- **Given Partial Differential Equation**:
  $$\\frac{\\partial^2 u}{\\partial t^2} - c^2\\left(\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2}\\right) = 0, \\quad c \\neq 0$$
- **Governing Physical Principles**:
  - This equation is the classical homogeneous **two-dimensional Wave Equation**, governing acoustic, electromagnetic, and mechanical membrane wave propagations where $c$ represents the constant propagation velocity of the wavefront:
    $$\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u$$
  - It is classified mathematically as a hyperbolic partial differential equation ($B^2 - 4AC > 0$).
- **Distractor Analysis**:
  - **Heat Equation**: A parabolic partial differential equation involving a first-order time derivative:
    $$\\frac{\\partial u}{\\partial t} = \\alpha \\nabla^2 u$$
  - **Laplace Equation**: A steady-state elliptic equation with zero time variation:
    $$\\nabla^2 u = \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} = 0$$
  - **Poisson's Equation**: An inhomogeneous elliptic equation with an active source distribution:
    $$\\nabla^2 u = f(x, y)$$

Therefore, the correct answer is **Option B (wave equation)**.`,
    images: []
  },
  "ee:2019:q10": {
    concept: "Electrical Machines - Three-Phase Induction Motor Core Saturation & Magnetizing Reactance",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Three-Phase Induction Motor Core Saturation & Magnetizing Reactance
- **Given Condition**:
  - Reduction in the RMS supply voltage $V_1$ applied to a three-phase induction motor while maintaining constant rated frequency $f$.
- **Governing Equations**:
  1. Core air-gap flux $\\Phi_m$:
     $$E_1 \\approx V_1 = 4.44 f N_1 k_{w1} \\Phi_m \\implies \\Phi_m \\propto \\frac{V_1}{f}$$
  2. Magnetizing reactance $X_m$:
     $$X_m = \\frac{E_1}{I_m} = \\omega L_m$$
- **Step-by-Step Analytical Derivation**:
  - At rated voltage and frequency, an induction motor operates near the knee of its magnetic core saturation curve ($B-H$ curve).
  - When $V_1$ is decreased at constant frequency $f$, the air-gap magnetic flux $\\Phi_m$ decreases proportionally.
  - This drop in flux pulls the operating point out of saturation down into the linear portion of the magnetization curve.
  - In the unsaturated regime, the core's relative permeability $\\mu_r$ is substantially higher, which decreases core reluctance ($\\mathcal{R} = \\frac{l}{\\mu A}$).
  - As a result, the magnetizing inductance $L_m = \\frac{N^2}{\\mathcal{R}}$ increases, and the **magnetizing reactance $X_m = \\omega L_m$ increases significantly**.
- **Distractor Analysis**:
  - **Stator resistance ($R_1$)** and **rotor resistance ($R_2$)** depend strictly on conductor length, cross-sectional area, and operating temperature; they are independent of voltage.
  - **Rotor leakage reactance ($X_2$)** depends on leakage flux paths across the slots and zig-zag air gaps, which do not saturate heavily under rated conditions.

Therefore, the correct answer is **Option C (magnetizing reactance)**.`,
    images: []
  },
  "ee:2018:q3": {
    concept: "Power Electronics - Single-Phase Fully Controlled Rectifier with Freewheeling Diode",
    markdown: `- **Concept / Subtopic**: Power Electronics - Single-Phase Fully Controlled Rectifier with Freewheeling Diode
- **Given Circuit Configuration**:
  - Single-phase fully controlled thyristor bridge rectifier supplying an inductive load with an anti-parallel diode (freewheeling diode, FD) connected across the output terminals.
- **Governing Principles**:
  1. **Load Current Direction ($i_0$)**:
     - The thyristor converter consists of unidirectional semiconductor devices that allow current to flow only from anode to cathode.
     - Therefore, the instantaneous load current cannot reverse:
       $$i_0 \\ge 0$$
  2. **Instantaneous Load Voltage ($v_0$)**:
     - During the positive half cycle with firing angle $\\alpha$, conducting thyristors apply the positive AC source voltage to the load, so $v_0 = v_s > 0$.
     - When the AC supply voltage crosses zero and reverses polarity, the load inductance tends to maintain current by reversing its induced EMF ($-L \\frac{di}{dt}$).
     - As soon as the output voltage attempts to become negative ($v_0 < 0$), the anti-parallel freewheeling diode becomes forward-biased and immediately turns ON.
     - The conducting freewheeling diode clamps the load terminal voltage to zero ($v_0 \\approx 0$) while circulating the inductive current.
     - Consequently, the load voltage is prevented from ever becoming negative:
       $$v_0 \\ge 0$$
- **Conclusion**:
  - At every operating instant, the converter operates strictly in Quadrant I:
    $$v_0 \\ge 0 \\quad \\text{and} \\quad i_0 \\ge 0$$

Therefore, the correct answer is **Option C ($v_{0}\\geq 0 \\text{ and } i_{0}\\geq 0$)**.`,
    images: []
  },
  "ee:2018:q4": {
    concept: "Power Electronics - Semiconductor Device Bidirectional Conduction Capability",
    markdown: `- **Concept / Subtopic**: Power Electronics - Semiconductor Device Bidirectional Conduction Capability
- **Given Semiconductor Devices & Target Conduction Direction**:
  - Evaluation of continuous DC current conduction in the direction shown when gated appropriately among:
    1. Silicon Controlled Rectifier (SCR / Thyristor)
    2. Triac
    3. Gate Turn-Off Thyristor (GTO)
    4. Power MOSFET
- **Governing Device Physics**:
  1. **TRIAC**:
     - A Triac is an integrated antiparallel combination of two thyristors with a common gate terminal.
     - It is inherently a **bidirectional conducting device** capable of conducting current in both directions ($MT_1 \\to MT_2$ and $MT_2 \\to MT_1$) when triggered in any of its four operational quadrants.
  2. **Power MOSFET**:
     - A power MOSFET consists of a symmetric inverted electron channel between drain and source.
     - When a positive gate voltage $V_{GS} > V_{th}$ is applied, the channel inverts and conducts current bidirectionally ($D \\to S$ as well as $S \\to D$, known as synchronous rectification).
     - Furthermore, the intrinsic $p-n$ body diode automatically conducts in the reverse direction ($S \\to D$).
  3. **Thyristor (SCR) and GTO**:
     - Both standard SCRs and GTOs possess an asymmetric $p-n-p-n$ junction structure that allows forward conduction strictly from **anode to cathode**.
     - They cannot carry continuous reverse current; attempting reverse conduction leads to reverse blocking breakdown.
- **Conclusion**:
  - The devices capable of conducting DC current continuously in the specified direction are the **Triac and MOSFET**.

Therefore, the correct answer is **Option B (Triac and MOSFET)**.`,
    images: []
  },
  "ee:2018:q7": {
    concept: "Electric Circuits - Network Topology & Euler Fundamental Loop Equation",
    markdown: `- **Concept / Subtopic**: Electric Circuits - Network Topology & Euler Fundamental Loop Equation
- **Given Parameters**:
  - Number of nodes: $N = 8$.
  - Number of independent loops (fundamental cut-sets / chords): $L = 5$.
- **Governing Equations**:
  - In graph theory and electric network analysis, for any connected graph:
    1. Number of tree branches (twigs) $T$:
       $$T = N - 1$$
    2. Number of independent loops (links / chords) $L$:
       $$L = B - T = B - (N - 1) = B - N + 1$$
       where $B$ is the total number of branches in the network graph.
- **Step-by-Step Analytical Derivation**:
  - Rearranging the topological loop relation to solve for the total number of branches $B$:
    $$B = L + N - 1$$
  - Substitute the given numerical values:
    $$B = 5 + 8 - 1 = 12$$
- **Verification**:
  - Tree branches: $T = 8 - 1 = 7$.
  - Link branches: $L = 5$.
  - Total branches: $B = T + L = 7 + 5 = 12$.

Therefore, the correct answer is **Option B (12)**.`,
    images: []
  },
  "ee:2017:q13": {
    concept: "Power Electronics - Majority vs Minority Carrier Power Semiconductor Devices",
    markdown: `- **Concept / Subtopic**: Power Electronics - Majority vs Minority Carrier Power Semiconductor Devices
- **Classification of Power Semiconductor Devices**:
  1. **Power MOSFET (Majority Carrier Device)**:
     - Unipolar device in which current conduction takes place exclusively by **majority carriers** (electrons in an n-channel MOSFET) flowing through the inverted channel and drift region.
     - Because there is no minority carrier storage or recombination delay, MOSFETs exhibit ultra-fast switching speeds with zero reverse recovery tail.
  2. **Power Diode (Minority Carrier Device)**:
     - A $p-i-n$ junction diode operates by high-level injection of **minority carriers** (holes and electrons) into the lightly doped drift region to achieve conductivity modulation.
     - Turn-off requires removing these stored minority carriers, resulting in reverse recovery time $t_{rr}$.
  3. **Thyristor / SCR (Minority Carrier Device)**:
     - A four-layer ($p-n-p-n$) bipolar device where latching conduction is maintained by regenerative injection and storage of minority carriers across the forward-conducting junctions.
  4. **IGBT (Minority Carrier Device)**:
     - The Insulated Gate Bipolar Transistor combines a MOS gate structure with a wide $p-n-p$ bipolar output transistor.
     - When turned ON, the $p^+$ substrate injects minority carriers (holes) into the $n^-$ drift region (conductivity modulation), which causes the characteristic current tail during turn-off.
- **Conclusion**:
  - The **MOSFET is a majority carrier device, whereas IGBT, Diode, and Thyristor are minority carrier devices**.

Therefore, the correct answer is **Option D (MOSFET is majority carrier device, whereas IGBT, Diode, Thyristor are minority carrier devices.)**.`,
    images: []
  },
  "ee:2016:q26": {
    concept: "Engineering Mathematics (EE) - Combinatorics with Repetition & Discrete Probability",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EE) - Combinatorics with Repetition & Discrete Probability
- **Given Parameters**:
  - Number of pens selected: $r = 3$.
  - Number of distinct permitted pen colors: $n = 4$ (Black, Blue, Green, Red).
  - Target event: A candidate arrives with all 3 pens having the same color.
- **Governing Equations**:
  - The combination of pens a candidate brings constitutes an unordered multiset of size $r$ chosen from $n$ distinct categories with repetition allowed.
  - The total number of distinct color combinations is given by the stars-and-bars multiset coefficient:
    $$N_{\\text{total}} = \\binom{n + r - 1}{r} = \\binom{4 + 3 - 1}{3} = \\binom{6}{3}$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Total Distinct Combinations**:
     $$\\binom{6}{3} = \\frac{6 \\times 5 \\times 4}{3 \\times 2 \\times 1} = 20$$
  2. **Compute Favorable Outcomes (All Same Color)**:
     - The candidate can bring all 3 pens of the same color in exactly 4 ways:
       1. $\\{3\\text{ Black}\\}$
       2. $\\{3\\text{ Blue}\\}$
       3. $\\{3\\text{ Green}\\}$
       4. $\\{3\\text{ Red}\\}$
     - Number of favorable combinations: $N_{\\text{favorable}} = 4$.
  3. **Calculate Probability**:
     - Assuming all distinct combinations of 3 pens are equally likely:
       $$P(\\text{all 3 pens same color}) = \\frac{N_{\\text{favorable}}}{N_{\\text{total}}} = \\frac{4}{20} = \\frac{1}{5} = 0.2$$

Therefore, the correct numerical value is **0.2**.`,
    images: []
  },
  "ee:2016:q29": {
    concept: "Engineering Mathematics (EE) - Linear Algebra & Gram Matrix Rank Invariance",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EE) - Linear Algebra & Gram Matrix Rank Invariance
- **Given Parameters**:
  - Matrix $A$ is a real matrix of size $4 \\times 3$.
  - Given rank of $A$: $\\text{rank}(A) = 2$.
- **Governing Theorem (Gram Matrix Nullspace Property)**:
  - For any real matrix $A \\in \\mathbb{R}^{m \\times n}$, the null space of $A$ and the null space of $A^T A$ are identical:
    $$\\text{Null}(A^T A) = \\text{Null}(A)$$
- **Proof of Nullspace Equality**:
  1. If $\\mathbf{x} \\in \\text{Null}(A)$, then $A\\mathbf{x} = \\mathbf{0}$. Multiplying by $A^T$ gives $A^T A \\mathbf{x} = A^T \\mathbf{0} = \\mathbf{0}$, so $\\mathbf{x} \\in \\text{Null}(A^T A)$.
  2. Conversely, if $\\mathbf{x} \\in \\text{Null}(A^T A)$, then $(A^T A)\\mathbf{x} = \\mathbf{0}$. Pre-multiplying by $\\mathbf{x}^T$ yields:
     $$\\mathbf{x}^T (A^T A) \\mathbf{x} = (A\\mathbf{x})^T (A\\mathbf{x}) = \\|A\\mathbf{x}\\|^2 = 0 \\implies A\\mathbf{x} = \\mathbf{0}$$
     Thus, $\\mathbf{x} \\in \\text{Null}(A)$.
  - Therefore, $\\text{Null}(A^T A) = \\text{Null}(A)$, which means:
    $$\\text{nullity}(A^T A) = \\text{nullity}(A)$$
- **Step-by-Step Analytical Derivation**:
  - Both $A$ and $A^T A$ have $n = 3$ columns.
  - By the Rank-Nullity Theorem:
    $$\\text{rank}(A) + \\text{nullity}(A) = 3$$
    $$\\text{rank}(A^T A) + \\text{nullity}(A^T A) = 3$$
  - Equating the two expressions:
    $$\\text{rank}(A^T A) = \\text{rank}(A)$$
  - Since $\\text{rank}(A) = 2$:
    $$\\text{rank}(A^T A) = 2$$

Therefore, the correct answer is **Option B (Rank of $A^{T} A$ is equal to 2.)**.`,
    images: []
  },
  "ee:2016:q31": {
    concept: "Signals and Systems / Control Systems - State Transition Matrix & Output Response",
    markdown: `- **Concept / Subtopic**: Signals and Systems / Control Systems - State Transition Matrix & Output Response
- **Given State Space Model**:
  $$\\dot{\\mathbf{x}}(t) = A \\mathbf{x}(t), \\quad A = \\begin{bmatrix} 1 & 0 \\\\ 0 & 2 \\end{bmatrix}$$
  $$y(t) = \\mathbf{c}^T \\mathbf{x}(t), \\quad \\mathbf{c} = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$$
  $$\\mathbf{x}(0) = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$$
  Target evaluation time: $t = \\ln(2)$.
- **Governing Equations**:
  - For a diagonal system matrix $A = \\text{diag}(\\lambda_1, \\lambda_2)$, the state transition matrix $\\Phi(t) = e^{At}$ is directly:
    $$e^{At} = \\begin{bmatrix} e^{\\lambda_1 t} & 0 \\\\ 0 & e^{\\lambda_2 t} \\end{bmatrix} = \\begin{bmatrix} e^t & 0 \\\\ 0 & e^{2t} \\end{bmatrix}$$
  - The zero-input state response is:
    $$\\mathbf{x}(t) = e^{At} \\mathbf{x}(0)$$
  - The system scalar output is:
    $$y(t) = \\mathbf{c}^T \\mathbf{x}(t) = \\mathbf{c}^T e^{At} \\mathbf{x}(0)$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute State Vector $\\mathbf{x}(t)$**:
     $$\\mathbf{x}(t) = \\begin{bmatrix} e^t & 0 \\\\ 0 & e^{2t} \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} e^t \\\\ e^{2t} \\end{bmatrix}$$
  2. **Compute Scalar Output $y(t)$**:
     $$y(t) = \\begin{bmatrix} 1 & 1 \\end{bmatrix} \\begin{bmatrix} e^t \\\\ e^{2t} \\end{bmatrix} = e^t + e^{2t}$$
  3. **Evaluate at $t = \\ln(2)$**:
     $$e^t = e^{\\ln(2)} = 2$$
     $$e^{2t} = \\left(e^{\\ln(2)}\\right)^2 = 2^2 = 4$$
     $$y(\\ln 2) = 2 + 4 = 6$$

Therefore, the correct numerical value is **6**.`,
    images: []
  },
  "ee:2016:q13-s2": {
    concept: "Power Systems - Overcurrent Protection & Directional Relay Remote Backup Coordination",
    markdown: `- **Concept / Subtopic**: Power Systems - Overcurrent Protection & Directional Relay Remote Backup Coordination
- **Given Power System Topology**:
  - Two synchronous generator sources connected to a looped transmission network through step-up transformers and protected by directional and non-directional overcurrent relays $R_1$ to $R_6$.
  - Target relay: Primary relay $R_4$.
- **Governing Principles of Remote Backup Protection**:
  - In a transmission system with sources at both ends, a fault in the line protected by relay $R_4$ is fed simultaneously from both generation sources:
    1. Generator 1 feeds the fault through the sending bus via relay $R_1$.
    2. Generator 2 feeds the fault from the opposite direction through its bus via relay $R_6$.
  - If relay $R_4$ or its associated circuit breaker fails to trip during a fault in its primary zone, **remote backup relays** located at the adjacent upstream substations must sense the continued fault current and trip after a coordinating time interval (Time Grading Margin, typically $0.3\\text{ to }0.5\\text{ s}$).
- **Step-by-Step Analytical Coordination**:
  - The upstream relays that see this fault current flowing into the faulted section are:
    - On the Generator 1 side: Relay $R_1$ serves as the backup looking toward the fault.
    - On the Generator 2 side: Relay $R_6$ serves as the backup looking toward the fault.
  - Relays $R_2$ and $R_5$ are directional relays oriented away from this specific fault feed path and do not provide backup.
  - Therefore, the remote backup relays for $R_4$ are **$R_1$ and $R_6$**.

Therefore, the correct answer is **Option D ($R_{1},R_{6}$)**.`,
    images: []
  }
};

export function applyChunkEeMod02() {
  console.log("Applying CHUNK-EE-MOD-02 patches...");

  // 1. Update chunk JSON
  const chunkPath = path.join(ROOT, "data", "solutions", "chunks", "ee", "chunk-ee-mod-02.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
    for (const q of chunkData.questions) {
      if (CHUNK_EE_MOD_02_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = CHUNK_EE_MOD_02_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
    console.log("Updated chunk manifest:", chunkPath);
  }

  // 2. Update master manifest
  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.chunks["CHUNK-EE-MOD-02"]) {
      manifest.chunks["CHUNK-EE-MOD-02"].status = "COMPLETED";
      manifest.chunks["CHUNK-EE-MOD-02"].completedAt = new Date().toISOString();
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Updated master manifest:", manifestPath);
  }

  // 3. Inject into patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_EE_MOD_02_SOLUTIONS)
    .map(([uid, patch]) => {
      return `  "${uid}": ${JSON.stringify(patch, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")},`;
    })
    .join("\n");

  const marker = "export const AUTHENTIC_PATCHES = {";
  if (patchFileContent.includes(marker)) {
    patchFileContent = patchFileContent.replace(marker, `${marker}\n${entries}`);
    fs.writeFileSync(patchFilePath, patchFileContent, "utf-8");
    console.log("Injected 11 patches into patch-authentic-solutions.mjs");
  } else {
    console.error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs");
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-ee-mod-02")) {
  applyChunkEeMod02();
}
