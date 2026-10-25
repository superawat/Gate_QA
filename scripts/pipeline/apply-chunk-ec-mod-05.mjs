import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_EC_MOD_05_SOLUTIONS = {
  "ec:2014:q33-s2": {
    concept: "Network Theory - Magnetically Coupled Circuits & Mutual Inductance",
    markdown: `- **Concept / Subtopic**: Network Theory - Magnetically Coupled Circuits & Mutual Inductance
- **Given Parameters**:
  - Self-inductances of the two coupled coils: $L_1 = 4\\text{ H}$ and $L_2 = 5\\text{ H}$ (with $L_1 L_2 = 20\\text{ H}^2$).
  - Flux linkage percentage: $56\\%$ of the total magnetic flux emanating from one coil links the other coil.
  - Therefore, the magnetic coupling coefficient is:
    $$k = 0.56$$
- **Governing Equation**:
  - The mutual inductance $M$ between two magnetically coupled coils with self-inductances $L_1$ and $L_2$ is defined by:
    $$M = k \\sqrt{L_1 L_2}$$
- **Step-by-Step Analytical Derivation**:
  - Substitute the given numerical parameters into the mutual inductance formula:
    $$M = 0.56 \\times \\sqrt{4 \\times 5} = 0.56 \\times \\sqrt{20}$$
  - Calculate $\\sqrt{20}$:
    $$\\sqrt{20} = 2\\sqrt{5} \\approx 2 \\times 2.236068 = 4.472136$$
  - Multiply by coupling factor $k = 0.56$:
    $$M = 0.56 \\times 4.472136 \\approx 2.504396\\text{ H} \\approx 2.505\\text{ H}$$

Therefore, the correct numerical value is within the official range of **[2.50 to 2.51]**, with a computed value of **2.505** H.`,
    images: []
  },
  "ec:2014:q3-s3": {
    concept: "Engineering Mathematics (EC) - Numerical Methods & Applications Matching",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EC) - Numerical Methods & Applications Matching
- **Group Matching Analysis**:
  - **P1. Numerical integration $\\rightarrow$ M3. Simpson's 1/3-rule:**
    Simpson's $1/3$-rule approximates the integrand using piecewise parabolic quadratic polynomials to compute definite integrals:
    $$\\int_a^b f(x)\\, dx \\approx \\frac{h}{3}\\left[f(x_0) + 4\\sum f(x_{\\text{odd}}) + 2\\sum f(x_{\\text{even}}) + f(x_n)\\right]$$
  - **P2. Solution to transcendental or non-linear equation $\\rightarrow$ M1. Newton-Raphson Method:**
    Newton-Raphson is a widely utilized iterative gradient algorithm for locating roots of nonlinear algebraic and transcendental equations $f(x) = 0$:
    $$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$
  - **P3. Solution to a system of linear equations $\\rightarrow$ M4. Gauss Elimination Method:**
    Gaussian elimination transforms an augmented system matrix $[A | B]$ into upper-triangular echelon form via forward elimination followed by back substitution to solve $A\\mathbf{x} = \\mathbf{b}$.
  - **P4. Solution to a differential equation $\\rightarrow$ M2. Runge-Kutta Method:**
    Runge-Kutta methods (such as the standard 4th-order RK4) are single-step predictor algorithms used to solve initial value problems for ordinary differential equations $\\frac{dy}{dx} = f(x, y)$.
- **Evaluation of Options**:
  - Combining these verified associations gives:
    $$P_1 - M_3,\\; P_2 - M_1,\\; P_3 - M_4,\\; P_4 - M_2$$
  - This pairing corresponds uniquely to Option B.

Therefore, the correct answer is **Option B (P1-M3, P2-M1, P3-M4, P4-M2)**.`,
    images: []
  },
  "ec:2014:q9-s3": {
    concept: "Electronic Devices - Recombination Rate of Excess Carriers in Extrinsic Semiconductor",
    markdown: `- **Concept / Subtopic**: Electronic Devices - Recombination Rate of Excess Carriers in Extrinsic Semiconductor
- **Given Conditions**:
  - Thin P-type silicon sample under uniform optical illumination.
  - Optical excitation generates excess electron-hole pairs ($\\Delta n = \\Delta p$).
- **Governing Equations**:
  - In a P-type semiconductor, holes are the majority carriers ($p_0 = N_A$) and electrons are the minority carriers ($n_0 = n_i^2 / N_A$).
  - Under low-level optical injection, the excess carrier concentration is much smaller than the thermal equilibrium majority carrier density:
    $$\\Delta n = \\Delta p \\ll p_0$$
  - According to the Shockley-Read-Hall (SRH) recombination-generation kinetics through localized recombination trap centers, the net recombination rate $U$ is:
    $$U = \\frac{n p - n_i^2}{\\tau_n (p + p_1) + \\tau_p (n + n_1)}$$
  - Substituting $p = p_0 + \\Delta p \\approx p_0$ and $n = n_0 + \\Delta n$:
    $$n p - n_i^2 \\approx (n_0 + \\Delta n)p_0 - n_i^2 = n_0 p_0 + \\Delta n p_0 - n_i^2 = p_0 \\Delta n$$
  - In p-type silicon where $p_0 \\gg p_1, n, n_1$:
    $$U \\approx \\frac{p_0 \\Delta n}{\\tau_n p_0} = \\frac{\\Delta n}{\\tau_n}$$
    where $\\Delta n$ is the excess minority carrier concentration and $\\tau_n$ is the minority carrier lifetime.
- **Analytical Conclusion**:
  - The net recombination rate is directly proportional to the **excess minority carrier concentration** ($\\Delta n$).
- **Distractor Analysis**:
  - Carrier mobility (Option A) determines carrier drift velocity and conductivity, not recombination rate.
  - The recombination rate is inversely proportional (not directly proportional) to the recombination lifetime $\\tau_n$ (Option B).
  - Majority carrier concentration (Option C) cancels out in the low-level injection SRH limit.

Therefore, the correct answer is **Option D (the excess minority carrier concentration)**.`,
    images: []
  },
  "ec:2014:q11-s3": {
    concept: "Analog Circuits - Ideal Transconductance Amplifier Specifications",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Ideal Transconductance Amplifier Specifications
- **Functional Definition**:
  - A **transconductance amplifier** (voltage-to-current converter) senses an input voltage $V_{\\text{in}}$ and delivers an output current $I_{\\text{out}}$:
    $$I_{\\text{out}} = g_m V_{\\text{in}}$$
- **Governing Principles**:
  1. **Input Resistance ($R_{\\text{in}}$)**:
     - The input port is driven by a voltage source $V_s$ with internal series resistance $R_s$.
     - By voltage division at the input terminal:
       $$V_{\\text{in}} = V_s \\left(\\frac{R_{\\text{in}}}{R_{\\text{in}} + R_s}\\right)$$
     - To ensure that the full source voltage appears across the amplifier input terminals without attenuation ($V_{\\text{in}} \\to V_s$), the input resistance must be substantially larger than the source resistance:
       $$R_{\\text{in}} \\gg R_s \\implies R_{\\text{in}} \\to \\infty \\quad \\text{(High input resistance)}$$
  2. **Output Resistance ($R_{\\text{out}}$)**:
     - The output port models a Norton current source $I_{\\text{out}} = g_m V_{\\text{in}}$ in parallel with internal output resistance $R_{\\text{out}}$, supplying load resistance $R_L$.
     - By current division at the output node:
       $$I_L = I_{\\text{out}} \\left(\\frac{R_{\\text{out}}}{R_{\\text{out}} + R_L}\\right)$$
     - To ensure that load current remains unaffected by variations in load impedance $R_L$ ($I_L \\to I_{\\text{out}}$), the output resistance must be substantially larger than the load resistance:
       $$R_{\\text{out}} \\gg R_L \\implies R_{\\text{out}} \\to \\infty \\quad \\text{(High output resistance)}$$
- **Conclusion**:
  - An ideal transconductance amplifier requires **high input resistance and high output resistance**.

Therefore, the correct answer is **Option A (high input resistance and high output resistance)**.`,
    images: []
  },
  "ec:2014:q27-s3": {
    concept: "Engineering Mathematics (EC) - Linear Algebra & Matrix Eigenvalue Theorems",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EC) - Linear Algebra & Matrix Eigenvalue Theorems
- **Evaluation of Matrix Theorems**:
  - **Statement A (True)**: For any upper-triangular (or lower-triangular) matrix $A$, the characteristic polynomial is $\\det(A - \\lambda I) = (a_{11} - \\lambda)(a_{22} - \\lambda)\\dots(a_{nn} - \\lambda) = 0$. Hence, the eigenvalues are identically the principal diagonal entries.
  - **Statement B (NOT True / False)**: By the Spectral Theorem, all eigenvalues of a real symmetric matrix are **always real**, but they **do not need to be positive**. For example, the matrix:
    $$A = \\begin{bmatrix} -3 & 0 \\\\ 0 & -5 \\end{bmatrix}$$
    is real symmetric ($A^T = A$), but its eigenvalues are $\\lambda_1 = -3$ and $\\lambda_2 = -5$, which are negative. A real symmetric matrix has strictly positive eigenvalues if and only if it is **positive definite**.
  - **Statement C (True)**: Since $\\det(M^T) = \\det(M)$ for any square matrix, $\\det(A^T - \\lambda I) = \\det((A - \\lambda I)^T) = \\det(A - \\lambda I)$. Therefore, a real matrix $A$ and its transpose $A^T$ share the identical characteristic polynomial and hence the exact same eigenvalues.
  - **Statement D (True)**: By Sylvester's Criterion, a Hermitian or real symmetric matrix has all positive eigenvalues if and only if all its leading principal minors are strictly positive.
- **Conclusion**:
  - Statement B is false, making it the correct option to select.

Therefore, the correct answer is **Option B (If A is real symmetric, the eigenvalues of A are always real and positive)**.`,
    images: []
  },
  "ec:2014:q6-s4": {
    concept: "Network Theory - Dependent Source Identification & Operational Amplifier Configurations",
    markdown: `- **Concept / Subtopic**: Network Theory - Dependent Source Identification & Operational Amplifier Configurations
- **Given Circuit Analysis**:
  - The circuit comprises an operational amplifier configured with a control input branch and an output feedback loop driving a load impedance.
  - An input controlling current $I_{\\text{in}}$ flows into the input terminal.
  - Due to the op-amp virtual ground / high open-loop gain, the input current is sensed directly across the input branch without developing significant terminal voltage.
  - The negative feedback network forces an output current $I_{\\text{out}}$ through the load branch that is linearly proportional to the controlling input current:
    $$I_{\\text{out}} = \\beta I_{\\text{in}}$$
- **Governing Classification**:
  - Because the output is an electrical **current** whose magnitude is governed by an input **current**, the two-port network functions as a **Current-Controlled Current Source (CCCS)**.
- **Distractor Analysis**:
  - A Voltage-Controlled Voltage Source (VCVS) uses voltage sensing to produce an output voltage (e.g., standard non-inverting op-amp voltage amplifier).
  - A Voltage-Controlled Current Source (VCCS) uses input voltage to set load current (transconductance amplifier).
  - A Current-Controlled Voltage Source (CCVS) converts input current to an output voltage (transimpedance amplifier).

Therefore, the correct answer is **Option C (current controlled current source)**.`,
    images: []
  },
  "ec:2014:q9-s4": {
    concept: "Electronic Devices - Semiconductor Intrinsic Resistivity vs Temperature & Bandgap Estimation",
    markdown: `- **Concept / Subtopic**: Electronic Devices - Semiconductor Intrinsic Resistivity vs Temperature & Bandgap Estimation
- **Given Relationship**:
  - A linear plot of $\\ln(\\rho_i)$ versus $1/T$, where $\\rho_i$ is the intrinsic resistivity of silicon and $T$ is temperature in Kelvin.
- **Governing Equations**:
  1. Intrinsic conductivity $\\sigma_i$ and resistivity $\\rho_i$:
     $$\\sigma_i = q n_i (\\mu_n + \\mu_p) \\implies \\rho_i = \\frac{1}{q n_i (\\mu_n + \\mu_p)}$$
  2. Intrinsic carrier concentration $n_i$:
     $$n_i = \\sqrt{N_C N_V} \\exp\\left(-\\frac{E_g}{2 k_B T}\\right) = A T^{3/2} \\exp\\left(-\\frac{E_g}{2 k_B T}\\right)$$
     where $k_B$ is Boltzmann's constant and $E_g$ is the energy bandgap.
- **Step-by-Step Analytical Derivation**:
  - Substitute $n_i$ into the expression for intrinsic resistivity:
    $$\\rho_i = \\frac{1}{q A T^{3/2} (\\mu_n + \\mu_p)} \\exp\\left(\\frac{E_g}{2 k_B T}\\right)$$
  - Taking the natural logarithm on both sides:
    $$\\ln(\\rho_i) = \\frac{E_g}{2 k_B}\\left(\\frac{1}{T}\\right) - \\ln\\left[q A T^{3/2} (\\mu_n + \\mu_p)\\right]$$
  - The temperature dependence of the exponential term $\\exp\\left(\\frac{E_g}{2 k_B T}\\right)$ is overwhelmingly dominant compared to the relatively weak algebraic variation of $T^{3/2}(\\mu_n + \\mu_p)$.
  - Thus, a graph of $\\ln(\\rho_i)$ as a function of the reciprocal temperature $\\frac{1}{T}$ forms an almost straight line with slope:
    $$\\text{Slope} = \\frac{E_g}{2 k_B}$$
  - From the measured slope, one can directly compute the **band gap energy of silicon ($E_g$)**:
    $$E_g = 2 k_B \\times \\text{Slope}$$
- **Distractor Analysis**:
  - The mobilities $\\mu_n, \\mu_p$ appear inside the logarithm intercept term and cannot be uniquely extracted from the slope.
  - The intrinsic carrier concentration $n_i$ itself varies exponentially with temperature and is not a constant slope parameter.

Therefore, the correct answer is **Option A (band gap energy of silicon $(E_{g})$)**.`,
    images: []
  },
  "ec:2014:q13-s4": {
    concept: "Analog Circuits - Operational Amplifier Multivibrators & Monostable Operation",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Operational Amplifier Multivibrators & Monostable Operation
- **Given Circuit Analysis**:
  - The circuit incorporates an operational amplifier with both positive feedback and negative timing feedback:
    1. **Positive Feedback (Schmitt Trigger)**: A resistive divider from the output to the non-inverting terminal ($+$) establishes upper and lower switching threshold voltages ($\pm V_{\\text{th}}$).
    2. **Timing & Clamping Feedback**: An $RC$ timing network connected from the output to the inverting terminal ($-$) is shunted by a semiconductor diode across capacitor $C$.
- **Operating Principles & State Classification**:
  - In an astable multivibrator (square-wave generator), the capacitor is free to charge and discharge symmetrically between $+V_{\\text{th}}$ and $-V_{\\text{th}}$, generating continuous oscillations with no stable state.
  - In this circuit, the presence of the parallel diode clamps the capacitor voltage to approximately $V_D \\approx 0.7\\text{ V}$ whenever the output is in its high state ($+V_{\\text{sat}}$).
  - Because the capacitor voltage is clamped and cannot charge up to trigger the threshold, the circuit remains latched permanently in this single condition: the **stable state**.
  - When an external trigger pulse of appropriate polarity is applied, the output switches abruptly to the negative rail ($-V_{\\text{sat}}$).
  - The diode is now reverse-biased (OFF), allowing capacitor $C$ to charge towards $-V_{\\text{sat}}$ through resistor $R$ for a duration determined by $\\tau = RC$: the **quasi-stable state**.
  - Once the capacitor voltage crosses the non-inverting threshold, the regenerative positive feedback snaps the output back to $+V_{\\text{sat}}$, where the diode re-clamps it into the stable state.
  - A circuit possessing exactly one stable state and one quasi-stable state is a **monostable multivibrator** (one-shot pulse generator).

Therefore, the correct answer is **Option D (a monostable multivibrator)**.`,
    images: []
  },
  "ec:2014:q22-s4": {
    concept: "Engineering Mathematics (EC) / Probability - Poisson Process & Event Arrival Counting",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EC) / Probability - Poisson Process & Event Arrival Counting
- **Given Conditions**:
  - Telephone calls arrive at an exchange such that the arrival of any individual call is statistically independent of earlier or future arrival events (memoryless property and independent increments).
- **Governing Principles of a Poisson Process**:
  - An arrival process with rate $\\lambda$ satisfies three fundamental postulates:
    1. **Independent Increments**: The number of arrivals in disjoint time intervals are mutually independent.
    2. **Stationarity**: The probability of an arrival in an interval depends only on the length of the interval $\\Delta t$.
    3. **Orderliness**: The probability of more than one arrival in an infinitesimal interval $\\Delta t$ is negligible ($o(\\Delta t)$).
- **Analytical Derivation**:
  - Under these axioms, let $N(t)$ be the discrete random variable representing the **total number of call arrivals in a fixed time interval of duration $t$**.
  - The probability mass function (PMF) of $N(t)$ is derived as:
    $$P(N(t) = k) = \\frac{(\\lambda t)^k e^{-\\lambda t}}{k!}, \\quad k = 0, 1, 2, \\dots$$
  - This is the definition of the **Poisson Distribution** with parameter $\\alpha = \\lambda t$.
- **Distractor Analysis**:
  - The **Exponential distribution** models the continuous random variable of *inter-arrival time* between consecutive calls, not the discrete *total number of calls*.
  - **Gaussian distribution** is continuous and arises as an asymptotic limit for large mean $\\lambda t \\gg 1$, but the exact underlying distribution is Poisson.
  - **Gamma distribution** represents the continuous waiting time until the $k$-th arrival.

Therefore, the correct answer is **Option A (Poisson)**.`,
    images: []
  },
  "ec:2014:q36-s4": {
    concept: "Electronic Devices - Energy Band Diagram of Biased N-Type Semiconductor",
    markdown: `- **Concept / Subtopic**: Electronic Devices - Energy Band Diagram of Biased N-Type Semiconductor
- **Given System & Bias Configuration**:
  - A uniformly doped N-type semiconductor bar under applied DC bias from an external battery.
  - Band edges: Conduction band edge $E_C$, valence band edge $E_V$, and Fermi level $E_F$.
- **Governing Physical Principles**:
  1. **Equilibrium Fermi Level Position for N-Type**:
     - For a uniformly doped N-type semiconductor, electron majority carrier concentration is $n_0 \\approx N_D$.
     - The Fermi level lies in the upper half of the bandgap, close to the conduction band:
       $$E_C - E_F = k_B T \\ln\\left(\\frac{N_C}{N_D}\\right)$$
     - Therefore, $E_F$ is positioned near $E_C$ throughout the bulk.
  2. **Effect of Applied Bias on Potential Energy**:
     - The potential energy of an electron with charge $-q$ in an electrostatic potential $V(x)$ is given by:
       $$E(x) = -q V(x)$$
     - When a voltage is applied across the semiconductor bar, an internal uniform electric field $\\mathcal{E}$ is created directed from the positive terminal toward the negative terminal:
       $$\\mathcal{E} = -\\frac{dV}{dx} = \\frac{1}{q}\\frac{dE_C}{dx}$$
     - Because electron potential energy is $-qV$, higher positive electrostatic potential $V(x)$ corresponds to **lower electron energy $E(x)$**.
     - Consequently, the energy bands ($E_C, E_i, E_V$) tilt downward toward the positive terminal of the battery.
  3. **Uniformity & Bandgap Invariance**:
     - Since the doping is uniform and the cross-section is constant, the electric field is uniform, yielding a constant linear slope:
       $$\\frac{dE_C}{dx} = \\frac{dE_V}{dx} = q \\mathcal{E} = \\text{constant}$$
     - The bandgap $E_g = E_C - E_V$ remains strictly constant along the length of the semiconductor.
     - The quasi-Fermi level $E_F$ slopes parallel to $E_C$, maintaining its position close to $E_C$.
- **Diagram Evaluation**:
  - Diagram D correctly depicts parallel, linearly inclined conduction and valence band edges tilting downward toward the positive terminal, with $E_F$ running uniformly close to $E_C$.

Therefore, the correct answer is **Option D (D)**.`,
    images: []
  }
};

export function applyChunkEcMod05() {
  console.log("Applying CHUNK-EC-MOD-05 patches...");

  // 1. Update chunk JSON
  const chunkPath = path.join(ROOT, "data", "solutions", "chunks", "ec", "chunk-ec-mod-05.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
    for (const q of chunkData.questions) {
      if (CHUNK_EC_MOD_05_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = CHUNK_EC_MOD_05_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
    console.log("Updated chunk manifest:", chunkPath);
  }

  // 2. Update master manifest
  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.chunks["CHUNK-EC-MOD-05"]) {
      manifest.chunks["CHUNK-EC-MOD-05"].status = "COMPLETED";
      manifest.chunks["CHUNK-EC-MOD-05"].completedAt = new Date().toISOString();
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Updated master manifest:", manifestPath);
  }

  // 3. Inject into patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_EC_MOD_05_SOLUTIONS)
    .map(([uid, patch]) => {
      return `  "${uid}": ${JSON.stringify(patch, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")},`;
    })
    .join("\n");

  const marker = "export const AUTHENTIC_PATCHES = {";
  if (patchFileContent.includes(marker)) {
    patchFileContent = patchFileContent.replace(marker, `${marker}\n${entries}`);
    fs.writeFileSync(patchFilePath, patchFileContent, "utf-8");
    console.log("Injected 10 patches into patch-authentic-solutions.mjs");
  } else {
    console.error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs");
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-ec-mod-05")) {
  applyChunkEcMod05();
}
