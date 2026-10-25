import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_EE_MOD_04_SOLUTIONS = {
  "ee:2015:q47-s2": {
    concept: "Electrical Machines - Three-Winding Transformer MMF Balance & Phasor Addition",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Three-Winding Transformer MMF Balance & Phasor Addition
- **Given Parameters**:
  - Number of turns: $N_1 = 100$, $N_2 = 50$, $N_3 = 50$.
  - Secondary currents: $\\bar{I}_2 = 2\\angle 30^\\circ\\text{ A}$ and $\\bar{I}_3 = 2\\angle 150^\\circ\\text{ A}$.
  - Magnetizing current is neglected.
- **Governing Equations**:
  - In an ideal multi-winding transformer, net core magnetomotive force (MMF) balance requires:
    $$N_1 \\bar{I}_1 = N_2 \\bar{I}_2 + N_3 \\bar{I}_3$$
  - Dividing throughout by primary turns $N_1$:
    $$\\bar{I}_1 = \\left(\\frac{N_2}{N_1}\\right)\\bar{I}_2 + \\left(\\frac{N_3}{N_1}\\right)\\bar{I}_3$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Turns Ratios**:
     $$\\frac{N_2}{N_1} = \\frac{50}{100} = 0.5$$
     $$\\frac{N_3}{N_1} = \\frac{50}{100} = 0.5$$
  2. **Reflect Secondary Currents to Primary**:
     $$\\bar{I}_1 = 0.5\\left(2\\angle 30^\\circ\\right) + 0.5\\left(2\\angle 150^\\circ\\right) = 1\\angle 30^\\circ + 1\\angle 150^\\circ$$
  3. **Convert to Rectangular Form & Add**:
     $$1\\angle 30^\\circ = \\cos(30^\\circ) + j\\sin(30^\\circ) = \\frac{\\sqrt{3}}{2} + j 0.5$$
     $$1\\angle 150^\\circ = \\cos(150^\\circ) + j\\sin(150^\\circ) = -\\frac{\\sqrt{3}}{2} + j 0.5$$
     $$\\bar{I}_1 = \\left(\\frac{\\sqrt{3}}{2} - \\frac{\\sqrt{3}}{2}\\right) + j(0.5 + 0.5) = 0 + j 1 = 1\\angle 90^\\circ\\text{ A}$$

Therefore, the correct answer is **Option A ($1\\angle 90^{\\circ}$)**.`,
    images: []
  },
  "ee:2015:q48-s2": {
    concept: "Electrical Machines - Separately Excited DC Motor Driving Fan Load",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Separately Excited DC Motor Driving Fan Load
- **Given Parameters**:
  - Armature resistance $R_a = 1\\ \\Omega$.
  - Field winding voltage is rated and constant ($\\Phi = \\text{constant}$).
  - Initial state 1: Armature voltage $V_1 = 100\\text{ V}$, speed $N_1 = 1000\\text{ rpm}$, armature current $I_{a1} = 10\\text{ A}$.
  - Target state 2: Speed $N_2 = 500\\text{ rpm}$.
  - Fan load torque characteristic: $T_L \\propto N^2$.
  - Rotational losses are neglected.
- **Governing Equations**:
  1. Developed electromagnetic torque:
     $$T = K \\Phi I_a \\implies T \\propto I_a \\quad (\\text{since } \\Phi = \\text{const})$$
  2. Fan mechanical torque balance:
     $$T = T_L \\propto N^2 \\implies I_a \\propto N^2$$
  3. Motor back EMF:
     $$E_b = K \\Phi \\omega_m \\propto N$$
     $$V = E_b + I_a R_a$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Initial Back EMF $E_{b1}$**:
     $$E_{b1} = V_1 - I_{a1} R_a = 100 - (10 \\times 1) = 90\\text{ V}$$
  2. **Compute New Armature Current $I_{a2}$**:
     $$I_{a2} = I_{a1} \\left(\\frac{N_2}{N_1}\\right)^2 = 10 \\times \\left(\\frac{500}{1000}\\right)^2 = 10 \\times \\left(\\frac{1}{2}\\right)^2 = 2.5\\text{ A}$$
  3. **Compute New Back EMF $E_{b2}$**:
     $$E_{b2} = E_{b1} \\left(\\frac{N_2}{N_1}\\right) = 90 \\times \\left(\\frac{500}{1000}\\right) = 90 \\times 0.5 = 45\\text{ V}$$
  4. **Compute Required Armature Voltage $V_2$**:
     $$V_2 = E_{b2} + I_{a2} R_a = 45 + (2.5 \\times 1) = 47.5\\text{ V}$$

Therefore, the correct numerical value is within the official range of **[46.0 to 49.0]**, with a computed value of **47.5** V.`,
    images: []
  },
  "ee:2015:q49-s2": {
    concept: "Electrical Machines - Cylindrical Rotor Synchronous Motor Load Angle Calculation",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Cylindrical Rotor Synchronous Motor Load Angle Calculation
- **Given Parameters**:
  - Three-phase, $11\\text{ kV}$, 50 Hz, star-connected synchronous motor.
  - Line-to-neutral terminal phase voltage:
    $$V = \\frac{11000}{\\sqrt{3}} \\approx 6350.85\\text{ V}$$
  - Synchronous reactance $X_s = 50\\ \\Omega$, armature resistance $R_a \\approx 0$.
  - Constant field excitation ($E_f = \\text{constant}$).
  - State 1: Stator current $I_{a1} = 100\\text{ A}$ at unity power factor ($\\cos\\phi_1 = 1$).
  - State 2: Increased load torque causes stator current $I_{a2} = 120\\text{ A}$.
- **Step-by-Step Analytical Derivation**:
  1. **Determine Excitation Voltage Magnitude $E_f$ from State 1**:
     - Motor phasor relation: $\\bar{E}_f = \\bar{V} - j I_{a1} X_s$.
     - Taking $\\bar{V} = 6350.85\\angle 0^\\circ\\text{ V}$ and $\\bar{I}_{a1} = 100\\angle 0^\\circ\\text{ A}$:
       $$\\bar{E}_f = 6350.85 - j(100 \\times 50) = 6350.85 - j 5000\\text{ V}$$
       $$E_f = \\sqrt{6350.85^2 + 5000^2} = \\sqrt{40.3333 \\times 10^6 + 25 \\times 10^6} = \\sqrt{65.3333 \\times 10^6} \\approx 8082.90\\text{ V}$$
  2. **Calculate Load Angle $\\delta$ in State 2**:
     - The phasor triangle relating terminal voltage $\\bar{V}$, internal EMF $\\bar{E}_f$, and reactive drop $j \\bar{I}_{a2} X_s$ satisfies:
       $$|j \\bar{I}_{a2} X_s| = I_{a2} X_s = 120 \\times 50 = 6000\\text{ V}$$
     - By the Law of Cosines on the phasor triangle:
       $$(I_{a2} X_s)^2 = V^2 + E_f^2 - 2 V E_f \\cos(\\delta)$$
       $$(6000)^2 = (6350.85)^2 + (8082.90)^2 - 2(6350.85)(8082.90)\\cos(\\delta)$$
       $$36.0 \\times 10^6 = 40.3333 \\times 10^6 + 65.3333 \\times 10^6 - 102.6667 \\times 10^6 \\cos(\\delta)$$
       $$102.6667 \\times 10^6 \\cos(\\delta) = 105.6667 \\times 10^6 - 36.0 \\times 10^6 = 69.6667 \\times 10^6$$
       $$\\cos(\\delta) = \\frac{69.6667}{102.6667} \\approx 0.67857$$
       $$\\delta = \\arccos(0.67857) \\approx 47.27^\\circ \\approx 47^\\circ$$
  3. **Sign Convention for Motor Load Angle**:
     - In motor operation, the rotor EMF $\\bar{E}_f$ lags the terminal voltage $\\bar{V}$, so the load angle is conventionally represented as negative:
       $$\\delta = -47^\\circ$$

Therefore, the correct numerical value is within the official range of **[-49 to -45]**, with a computed value of **-47** degrees.`,
    images: []
  },
  "ee:2015:q50-s2": {
    concept: "Electrical Machines - Wound Rotor Induction Motor Maximum Starting Torque Insertion Resistance",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Wound Rotor Induction Motor Maximum Starting Torque Insertion Resistance
- **Given Parameters**:
  - $220\\text{ V}$, 3-phase, 4-pole, 50 Hz wound-rotor induction motor.
  - Stator resistance, core loss, and magnetizing reactance are negligible.
  - Slip at maximum torque: $s_{mT} = 15\\% = 0.15$.
  - Internal rotor winding resistance: $R_2 = 0.03\\ \\Omega/\\text{phase}$.
- **Governing Equations**:
  - For an induction motor with negligible stator impedance, the slip at which maximum torque occurs is given by:
    $$s_{mT} = \\frac{R_2}{X_2}$$
    where $X_2$ is the standstill rotor leakage reactance per phase.
- **Step-by-Step Analytical Derivation**:
  1. **Compute Standstill Rotor Leakage Reactance $X_2$**:
     $$X_2 = \\frac{R_2}{s_{mT}} = \\frac{0.03\\ \\Omega}{0.15} = 0.20\\ \\Omega/\\text{phase}$$
  2. **Determine Total Rotor Resistance for Maximum Torque at Start**:
     - At startup (standstill), the rotor speed is $N = 0$, which corresponds to slip:
       $$s_{\\text{start}} = 1.0$$
     - For maximum torque to occur at starting ($s_{mT}' = 1.0$):
       $$s_{mT}' = \\frac{R_{2,\\text{total}}}{X_2} = 1.0 \\implies R_{2,\\text{total}} = X_2 = 0.20\\ \\Omega/\\text{phase}$$
  3. **Calculate Required External Resistance $R_{\\text{ext}}$**:
     - The total rotor resistance is the sum of internal rotor resistance and external inserted resistance:
       $$R_{2,\\text{total}} = R_2 + R_{\\text{ext}}$$
       $$R_{\\text{ext}} = R_{2,\\text{total}} - R_2 = 0.20\\ \\Omega - 0.03\\ \\Omega = 0.17\\ \\Omega/\\text{phase}$$

Therefore, the correct numerical value is within the official range of **[0.16 to 0.18]**, with a computed value of **0.17** Ohm.`,
    images: []
  },
  "ee:2015:q51-s2": {
    concept: "Electrical Machines - Three-Phase Transformer Connection & Angular Displacement",
    markdown: `- **Concept / Subtopic**: Electrical Machines - Three-Phase Transformer Connection & Angular Displacement
- **Given Transformer Configurations**:
  - Two three-phase transformer banks realized using single-phase transformer units.
  - Transformer 1 is connected in Star-Star ($Y-Y$) configuration with $0^\\circ$ angular displacement.
  - Transformer 2 is connected in Star-Delta ($Y-\\Delta$) configuration.
- **Governing Principles**:
  - In three-phase power transformers, phase displacement is defined as the time angle by which the secondary line voltage vector lags or leads the corresponding primary line voltage vector.
  - Connections with identical phase configurations (e.g., $Y-y0$, $D-d0$) produce zero angular phase displacement ($0^\\circ$).
  - Connections that convert between Star and Delta (e.g., $Y-d1$, $Y-d11$) inherently introduce a phase shift of $\\pm 30^\\circ$ (or $n \\times 30^\\circ$).
- **Analytical Evaluation**:
  - The line voltage $V_1$ from the $Y-Y$ bank is in phase with the source phase reference ($0^\\circ$).
  - The line voltage $V_2$ from the $Y-\\Delta$ bank is shifted by $30^\\circ$ relative to the line-to-line reference.
  - Therefore, the magnitude of the phase angle difference between voltages $V_1$ and $V_2$ is:
    $$|\\angle V_1 - \\angle V_2| = 30^\\circ$$

Therefore, the correct numerical value is within the official range of **[29 to 31]**, with a computed value of **30** degrees.`,
    images: []
  },
  "ee:2015:q52-s2": {
    concept: "Signals and Systems / Numerical Methods - Forward Euler Stability of Undamped Harmonic Oscillator",
    markdown: `- **Concept / Subtopic**: Signals and Systems / Numerical Methods - Forward Euler Stability of Undamped Harmonic Oscillator
- **Given Discrete-Time Difference Equations**:
  $$\\frac{x_{k+1} - x_k}{h} = y_k \\implies x_{k+1} = x_k + h y_k$$
  $$\\frac{y_{k+1} - y_k}{h} = -x_k \\implies y_{k+1} = -h x_k + y_k$$
  where $h > 0$ is the integration step size.
- **State-Space Matrix Formulation**:
  $$\\begin{bmatrix} x_{k+1} \\\\ y_{k+1} \\end{bmatrix} = A \\begin{bmatrix} x_k \\\\ y_k \\end{bmatrix}, \\quad A = \\begin{bmatrix} 1 & h \\\\ -h & 1 \\end{bmatrix}$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Eigenvalues of Transition Matrix $A$**:
     $$\\det(A - \\lambda I) = \\det\\begin{bmatrix} 1 - \\lambda & h \\\\ -h & 1 - \\lambda \\end{bmatrix} = (1 - \\lambda)^2 + h^2 = 0$$
     $$(1 - \\lambda)^2 = -h^2 \\implies 1 - \\lambda = \\pm j h \\implies \\lambda = 1 \\pm j h$$
  2. **Evaluate Eigenvalue Magnitude**:
     $$|\\lambda|^2 = 1^2 + h^2 = 1 + h^2$$
     $$|\\lambda| = \\sqrt{1 + h^2}$$
  3. **Discrete-Time Stability Criterion**:
     - For a discrete-time autonomous LTI system to be asymptotically stable, all eigenvalues must lie strictly inside the open unit disk in the complex plane:
       $$|\\lambda| < 1$$
     - For any positive step size $h > 0$:
       $$1 + h^2 > 1 \\implies |\\lambda| = \\sqrt{1 + h^2} > 1$$
     - Because the magnitude of both eigenvalues strictly exceeds unity for every $h > 0$, the state vector grows exponentially as $k \\to \\infty$.
- **Conclusion**:
  - The system is **not stable for any $h > 0$** (classic forward-Euler numerical instability on undamped Hamiltonian oscillators).

Therefore, the correct answer is **Option A (The system is not stable for $h\\gt 0$)**.`,
    images: []
  },
  "ee:2014:q1": {
    concept: "Engineering Mathematics (EE) - Linear Algebra & Underdetermined System Consistency",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EE) - Linear Algebra & Underdetermined System Consistency
- **Given System of Linear Equations**:
  $$x + 2y + 2z = b_1$$
  $$5x + y + 3z = b_2$$
- **Matrix Formulation**:
  $$A \\mathbf{x} = \\mathbf{b}, \\quad A = \\begin{bmatrix} 1 & 2 & 2 \\\\ 5 & 1 & 3 \\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix} b_1 \\\\ b_2 \\end{bmatrix}, \\quad \\mathbf{x} = \\begin{bmatrix} x \\\\ y \\\\ z \\end{bmatrix}$$
- **Step-by-Step Analytical Derivation**:
  1. **Row Rank of Coefficient Matrix $A$**:
     - The matrix $A$ has dimension $2 \\times 3$.
     - Row 1 ($R_1 = [1, 2, 2]$) and Row 2 ($R_2 = [5, 1, 3]$) are clearly linearly independent because neither is a scalar multiple of the other.
     - Therefore, the coefficient matrix has full row rank:
       $$\\text{rank}(A) = 2$$
  2. **Rank of Augmented Matrix $[A | \\mathbf{b}]$**:
     - The augmented matrix $[A | \\mathbf{b}]$ has 2 rows and 4 columns.
     - Its rank cannot exceed the number of rows, so $\\text{rank}([A | \\mathbf{b}]) \\le 2$.
     - Since $A$ is a submatrix of $[A | \\mathbf{b}]$ with rank 2, we have:
       $$\\text{rank}([A | \\mathbf{b}]) = 2 = \\text{rank}(A) \\quad \\text{for ALL values of } b_1, b_2$$
  3. **Application of Rouché-Capelli Theorem**:
     - The system is guaranteed to be consistent for any arbitrary vector $\\mathbf{b}$.
     - Number of unknowns: $n = 3$.
     - Number of linearly independent equations (rank): $r = 2$.
     - Since $r < n$, there are $n - r = 3 - 2 = 1$ free variables.
     - Therefore, the system possesses **infinitely many solutions for any given $b_1$ and $b_2$**.

Therefore, the correct answer is **Option B (The system will have infinitely many solutions for any given $b_1 \\; and \\; b_2$)**.`,
    images: []
  },
  "ee:2014:q14": {
    concept: "Power Systems - Insulating Materials & Undesirable High Relative Permittivity",
    markdown: `- **Concept / Subtopic**: Power Systems - Insulating Materials & Undesirable High Relative Permittivity
- **Properties of Electrical Insulation Materials in Power Apparatus**:
  1. **Dielectric Strength (Desirable - High)**:
     - Ability to withstand high electric field gradients (kV/cm) without sparkover or puncture breakdown.
  2. **Insulation Resistivity (Desirable - High)**:
     - Minimizes continuous ohmic leakage current flowing through the dielectric volume.
  3. **Thermal Conductivity (Desirable - High)**:
     - Facilitates rapid conductive dissipation of $I^2 R$ heat generated within conductors to avoid thermal aging and thermal runaway.
  4. **Relative Permittivity $\\varepsilon_r$ (Undesirable - High)**:
     - In power cables and bushings, capacitance per unit length is directly proportional to permittivity:
       $$C = \\frac{2\\pi \\varepsilon_0 \\varepsilon_r}{\\ln(R/r)}$$
     - A high relative permittivity increases cable capacitance, which draws a heavy continuous capacitive charging current ($I_c = \\omega C V$).
     - This excessive charging current severely degrades power transfer capability and increases continuous dielectric loss ($P_d = \\omega C V^2 \\tan\\delta$).
- **Conclusion**:
  - The undesirable property is **high relative permittivity**.

Therefore, the correct answer is **Option B (high relative permittivity)**.`,
    images: []
  },
  "ee:2014:q21": {
    concept: "Digital Electronics - Cascaded Modulo Counters & Overall Modulus Multiplication",
    markdown: `- **Concept / Subtopic**: Digital Electronics - Cascaded Modulo Counters & Overall Modulus Multiplication
- **Given Circuit Configuration**:
  - A cascade of three identical modulo-5 counters.
- **Governing Principles of Cascaded Counters**:
  - In an asynchronous or ripple-cascaded digital counter architecture, each counter stage divides the input frequency by its modulus $M_i$.
  - The terminal count output (or carry out) of stage $k$ provides the clock trigger input for stage $k+1$.
  - The total number of distinct states through which the composite system cycles before returning to its initial state is the product of the individual stage moduli:
    $$M_{\\text{overall}} = \\prod_{i=1}^k M_i = M_1 \\times M_2 \\times \\dots \\times M_k$$
- **Analytical Derivation**:
  - For $k = 3$ identical stages each having modulus $M = 5$:
    $$M_{\\text{overall}} = 5 \\times 5 \\times 5 = 5^3 = 125$$
  - Therefore, the composite counter has an overall modulus of **125**.

Therefore, the correct answer is **Option C (125)**.`,
    images: []
  },
  "ee:2014:q1-s2": {
    concept: "Engineering Mathematics (EE) - Linear Algebra & Spectral Theorem for Real Symmetric Matrices",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EE) - Linear Algebra & Spectral Theorem for Real Symmetric Matrices
- **Given Matrix Classification**:
  - A real symmetric matrix $A \\in \\mathbb{R}^{n \\times n}$, satisfying $A^T = A$ and $A^* = A$.
- **Formal Proof (Reality of Eigenvalues via Spectral Theorem)**:
  - Let $\\lambda \\in \\mathbb{C}$ be an eigenvalue of $A$, with non-zero eigenvector $\\mathbf{x} \\in \\mathbb{C}^n$:
    $$A \\mathbf{x} = \\lambda \\mathbf{x} \\quad (1)$$
  - Take the conjugate transpose (Hermitian adjoint) on both sides:
    $$(A\\mathbf{x})^H = (\\lambda \\mathbf{x})^H \\implies \\mathbf{x}^H A^H = \\bar{\\lambda} \\mathbf{x}^H$$
  - Since $A$ is real and symmetric, $A^H = (A^*)^T = A^T = A$. Thus:
    $$\\mathbf{x}^H A = \\bar{\\lambda} \\mathbf{x}^H \\quad (2)$$
  - Pre-multiply equation (1) by $\\mathbf{x}^H$:
    $$\\mathbf{x}^H A \\mathbf{x} = \\lambda \\mathbf{x}^H \\mathbf{x}$$
  - Post-multiply equation (2) by $\\mathbf{x}$:
    $$\\mathbf{x}^H A \\mathbf{x} = \\bar{\\lambda} \\mathbf{x}^H \\mathbf{x}$$
  - Equating the two scalar expressions:
    $$\\lambda (\\mathbf{x}^H \\mathbf{x}) = \\bar{\\lambda} (\\mathbf{x}^H \\mathbf{x}) \\implies (\\lambda - \\bar{\\lambda}) \\|\\mathbf{x}\\|^2 = 0$$
  - Since $\\mathbf{x}$ is a non-zero eigenvector, $\\|\\mathbf{x}\\|^2 = \\mathbf{x}^H \\mathbf{x} > 0$.
  - Therefore:
    $$\\lambda - \\bar{\\lambda} = 0 \\implies \\lambda = \\bar{\\lambda} \\implies \\lambda \\in \\mathbb{R}$$
- **Conclusion**:
  - **All the eigenvalues are real**.
- **Distractor Analysis**:
  - Eigenvalues of a real symmetric matrix can be negative or zero (Option B is false unless the matrix is positive definite).
  - A real symmetric matrix can have repeated eigenvalues, e.g., the identity matrix $I$ has repeated eigenvalue 1 (Option C is false).
  - The sum of eigenvalues equals $\\text{trace}(A)$, which can be any real number (Option D is false).

Therefore, the correct answer is **Option A (All the eigenvalues are real.)**.`,
    images: []
  }
};

export function applyChunkEeMod04() {
  console.log("Applying CHUNK-EE-MOD-04 patches...");

  // 1. Update chunk JSON
  const chunkPath = path.join(ROOT, "data", "solutions", "chunks", "ee", "chunk-ee-mod-04.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
    for (const q of chunkData.questions) {
      if (CHUNK_EE_MOD_04_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = CHUNK_EE_MOD_04_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
    console.log("Updated chunk manifest:", chunkPath);
  }

  // 2. Update master manifest
  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.chunks["CHUNK-EE-MOD-04"]) {
      manifest.chunks["CHUNK-EE-MOD-04"].status = "COMPLETED";
      manifest.chunks["CHUNK-EE-MOD-04"].completedAt = new Date().toISOString();
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Updated master manifest:", manifestPath);
  }

  // 3. Inject into patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_EE_MOD_04_SOLUTIONS)
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

if (process.argv[1] && process.argv[1].includes("apply-chunk-ee-mod-04")) {
  applyChunkEeMod04();
}
