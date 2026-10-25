import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_EC_MOD_04_SOLUTIONS = {
  "ec:2015:q9": {
    concept: "Electronic Devices - PN-Junction Diodes & Tunnel Diode Negative Differential Resistance",
    markdown: `- **Concept / Subtopic**: Electronic Devices - PN-Junction Diodes & Tunnel Diode Negative Differential Resistance
- **Given Phenomenon**:
  - Observation of a **negative differential resistance (NDR)** region ($dV/dI < 0$) in the forward current-voltage ($I-V$) characteristics of a silicon PN junction.
- **Governing Principles**:
  - Negative differential resistance in a simple PN junction is the definitive operational characteristic of a **Tunnel Diode** (Esaki diode).
  - To realize quantum mechanical band-to-band tunneling:
    1. Both the P-type and N-type sides must be **degenerately (heavily) doped**, typically exceeding $10^{19}\\text{ cm}^{-3}$ (approximately 1 impurity atom per $10^3$ to $10^4$ silicon host atoms).
    2. Degenerate doping drives the Fermi level $E_F$ into the conduction band on the n-side ($E_{Fn} > E_C$) and into the valence band on the p-side ($E_{Fp} < E_V$).
    3. The resulting depletion region width becomes extremely thin (on the order of $W \\approx 5\\text{ to }10\\text{ nm} = 50\\text{ to }100\\ \\text{\\AA}$).
- **Step-by-Step Analytical Derivation**:
  - At zero bias, the Fermi levels align, and no net current flows.
  - When a small forward bias $V$ is applied ($0 < V < V_P$), filled electron states in the conduction band of the n-region directly align with available empty hole states in the valence band of the p-region. Electrons tunnel across the ultrathin barrier, yielding a sharp increase in tunneling current up to peak value $I_P$.
  - As forward bias increases further beyond peak voltage $V_P$ ($V_P < V < V_V$), the band overlap decreases as the valence band edge of the p-side drops below the filled conduction band states of the n-side. Consequently, the tunneling current decreases with increasing voltage, creating the **negative differential resistance region**.
  - Beyond the valley voltage $V_V$, regular thermal diffusion current over the barrier dominates, behaving like a conventional diode.
  - If only one region is heavily doped (e.g., $p^+ n$ or $n^+ p$), the junction forms a Zener diode with a wider depletion width where forward tunneling cannot occur.
- **Distractor Analysis**:
  - **Options B and C are incorrect**: Asymmetric heavy doping ($p^+ n$ or $n^+ p$) results in conventional rectifier or Zener diodes that exhibit strictly positive dynamic resistance in forward bias.
  - **Option D is incorrect**: Inserting an intrinsic region forms a PIN diode, which eliminates tunneling and provides high reverse breakdown voltage and RF attenuation.

Therefore, the correct answer is **Option A (both the P-region and the N-region are heavily doped)**.`,
    images: []
  },
  "ec:2015:q19": {
    concept: "Control Systems - Basics of Feedback Systems & Closed-Loop Properties",
    markdown: `- **Concept / Subtopic**: Control Systems - Basics of Feedback Systems & Closed-Loop Properties
- **System Configuration**:
  - Negative feedback closed-loop system with open-loop forward transfer function $G(s)$ and feedback path $H(s)$:
    $$T(s) = \\frac{G(s)}{1 + G(s)H(s)}$$
- **Governing Principles & Analytical Properties**:
  1. **Gain Reduction**:
     - The closed-loop DC gain is $A_f = \\frac{A}{1 + A\\beta}$.
     - Because $(1 + A\\beta) > 1$, negative feedback **reduces the overall gain**. (Statement A is a true property).
  2. **Bandwidth Expansion**:
     - For a standard first-order low-pass system with open-loop upper cut-off frequency $\\omega_H$:
       $$\\omega_{Hf} = \\omega_H (1 + A\\beta)$$
     - The closed-loop bandwidth is **increased (widened)** by the factor $(1 + A\\beta)$, preserving the gain-bandwidth product.
     - Therefore, negative feedback **DOES NOT reduce bandwidth**; it expands bandwidth. (Statement B is what negative feedback does NOT do).
  3. **Disturbance Rejection**:
     - Output sensitivity to an extraneous disturbance $D(s)$ introduced in the forward path is scaled down by $\\frac{1}{1 + G(s)H(s)}$. Thus, negative feedback **improves disturbance rejection**. (Statement C is a true property).
  4. **Sensitivity Reduction**:
     - Sensitivity of the closed-loop transfer function $T$ with respect to variations in $G$ is given by:
       $$S_G^T = \\frac{\\partial T / T}{\\partial G / G} = \\frac{1}{1 + G(s)H(s)}$$
     - Therefore, negative feedback **reduces sensitivity to parameter variations**. (Statement D is a true property).
- **Conclusion**:
  - Negative feedback increases bandwidth, so it does not reduce it.

Therefore, the correct answer is **Option B (reduce bandwidth)**.`,
    images: []
  },
  "ec:2015:q11-s2": {
    concept: "Analog Circuits - Diode Clamping Circuit Time Constant Criterion",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Diode Clamping Circuit Time Constant Criterion
- **Given Circuit Configuration**:
  - Diode clamping circuit comprising a series capacitor $C$, a shunt resistor $R$, and a shunt diode driven by a periodic sinusoidal signal of period $T$.
- **Governing Principles**:
  - The objective of a clamper is to shift the DC level of a signal to a desired baseline without distorting the AC waveform profile.
  - Operation occurs in two distinct alternating intervals:
    1. **Charging Interval (Diode ON)**:
       - When the input polarity forward-biases the diode, the diode conducts with very small forward resistance $R_f$.
       - The charging time constant is $\\tau_{\\text{charge}} = R_f C$. Since $R_f$ is negligible, $\\tau_{\\text{charge}} \\ll T$, allowing the capacitor to charge rapidly to the peak input voltage.
    2. **Holding / Discharging Interval (Diode OFF)**:
       - During the remainder of the period (roughly duration $T$), the diode is reverse-biased (open circuit).
       - The capacitor discharges through the shunt resistor $R$ with discharging time constant $\\tau_{\\text{discharge}} = RC$.
- **Step-by-Step Analytical Derivation**:
  - For the circuit to act as an effective clamper, the capacitor voltage must remain essentially constant throughout the entire OFF interval, discharging by less than $1\\%\\text{ to }5\\%$ of its stored voltage.
  - The fractional discharge over period $T$ is:
    $$\\Delta V_C \\approx V_{\\text{peak}} \\left(1 - e^{-T/RC}\\right) \\approx V_{\\text{peak}} \\left(\\frac{T}{RC}\\right)$$
  - For negligible decay ($\Delta V_C \\ll V_{\\text{peak}}$):
    $$\\frac{T}{RC} \\ll 1 \\implies RC \\gg T$$
  - As a standard design rule of thumb, $RC \\ge 5T \\text{ to } 10T$.
- **Distractor Analysis**:
  - If $RC \\ll T$ (Option A), the capacitor completely discharges within a fraction of a cycle, transforming the circuit into a differentiator/high-pass filter and severely distorting the waveform.
  - If $RC \\approx T$ or $0.35T$ (Options B and C), substantial exponential voltage droop occurs, causing baseline tilt and waveform distortion.

Therefore, the correct answer is **Option D ($RC\\gt \\gt T$)**.`,
    images: []
  },
  "ec:2015:q27-s3": {
    concept: "Engineering Mathematics (EC) - Geometric Probability Distribution & Expected Value",
    markdown: `- **Concept / Subtopic**: Engineering Mathematics (EC) - Geometric Probability Distribution & Expected Value
- **Given Parameters**:
  - Fair 6-faced die with sample space $S = \\{1, 2, 3, 4, 5, 6\\}$.
  - The die is rolled repeatedly and independently until the outcome '3' is observed for the first time.
  - $X$ is the random variable representing the total number of rolls required.
- **Governing Equations**:
  - In each independent trial, the probability of rolling a '3' (success) is:
    $$p = \\frac{1}{6}$$
  - The probability of rolling any other number (failure) is:
    $$q = 1 - p = \\frac{5}{6}$$
  - The random variable $X$ follows a **Geometric Distribution** with parameter $p$:
    $$P(X = k) = (1 - p)^{k-1} p = \\left(\\frac{5}{6}\\right)^{k-1} \\left(\\frac{1}{6}\\right), \\quad k = 1, 2, 3, \\dots$$
- **Step-by-Step Analytical Derivation**:
  - The expected value $E[X]$ is defined by:
    $$E[X] = \\sum_{k=1}^{\\infty} k P(X = k) = \\sum_{k=1}^{\\infty} k q^{k-1} p$$
  - Recall the standard arithmetico-geometric series summation formula for $|q| < 1$:
    $$\\sum_{k=1}^{\\infty} k q^{k-1} = \\frac{d}{dq}\\left(\\sum_{k=0}^{\\infty} q^k\\right) = \\frac{d}{dq}\\left(\\frac{1}{1-q}\\right) = \\frac{1}{(1-q)^2} = \\frac{1}{p^2}$$
  - Multiplying by $p$:
    $$E[X] = p \\cdot \\frac{1}{p^2} = \\frac{1}{p}$$
  - Substituting $p = \\frac{1}{6}$:
    $$E[X] = \\frac{1}{1/6} = 6$$

Therefore, the correct numerical value is **6**.`,
    images: []
  },
  "ec:2014:q6": {
    concept: "Network Theory - Maximum Power Transfer Theorem for AC Networks",
    markdown: `- **Concept / Subtopic**: Network Theory - Maximum Power Transfer Theorem for AC Networks
- **Given System**:
  - Two cascaded electrical network sections:
    - Section 1 has Thévenin output impedance $Z_1 = R_1 + j X_1$.
    - Section 2 represents the load network with input impedance $Z_2 = R_2 + j X_2$.
- **Governing Equations**:
  - Let $V_{\\text{th}}$ be the open-circuit Thévenin voltage of Section 1.
  - The total loop impedance is $Z_{\\text{total}} = Z_1 + Z_2 = (R_1 + R_2) + j(X_1 + X_2)$.
  - The active average power delivered to the load resistive component $R_2$ is:
    $$P_L = I_{\\text{rms}}^2 R_2 = \\frac{|V_{\\text{th}}|^2 R_2}{(R_1 + R_2)^2 + (X_1 + X_2)^2}$$
- **Step-by-Step Analytical Derivation**:
  1. **Reactive Impedance Optimization**:
     - The denominator is minimized when the reactive term is eliminated:
       $$X_1 + X_2 = 0 \\implies X_2 = -X_1$$
     - This condition resonates out the series reactance at the operating frequency.
  2. **Resistive Impedance Optimization**:
     - With reactances cancelled, the power transferred simplifies to:
       $$P_L = \\frac{|V_{\\text{th}}|^2 R_2}{(R_1 + R_2)^2}$$
     - To maximize $P_L$ with respect to $R_2$, take the first derivative and set to zero:
       $$\\frac{dP_L}{dR_2} = |V_{\\text{th}}|^2 \\frac{(R_1 + R_2)^2 - 2 R_2(R_1 + R_2)}{(R_1 + R_2)^4} = 0$$
       $$(R_1 + R_2) - 2 R_2 = 0 \\implies R_2 = R_1$$
  3. **Complex Conjugate Synthesis**:
     - Combining both conditions:
       $$Z_2 = R_2 + j X_2 = R_1 - j X_1 = (R_1 + j X_1)^* = Z_1^*$$
     - Thus, maximum power transfer occurs if and only if $Z_2$ is the **complex conjugate** of $Z_1$.
- **Distractor Analysis**:
  - $Z_2 = Z_1$ (Option A) only holds for purely real (resistive) networks; in reactive AC networks, it leaves uncompensated reactances that diminish transferred power.
  - $Z_2 = -Z_1$ and $Z_2 = -Z_1^*$ (Options B and D) imply negative resistances, which represent active/unstable systems rather than passive matching.

Therefore, the correct answer is **Option C ($Z_{2}=Z_{1}^{*}$)**.`,
    images: []
  },
  "ec:2014:q11": {
    concept: "Analog Circuits - Ideal Current Buffer Specifications",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Ideal Current Buffer Specifications
- **Functional Definition**:
  - A **current buffer** is a two-port amplifier designed to transfer current from a high-impedance source to a low-impedance load with unity current gain ($A_i = I_{\\text{out}} / I_{\\text{in}} \\approx 1$) while isolating the source from load impedance variations.
- **Governing Principles**:
  1. **Input Impedance ($R_{\\text{in}}$)**:
     - The input of a current buffer is driven by a Norton source ($I_s$ in parallel with source resistance $R_s$).
     - By current division, the input current entering the buffer is:
       $$I_{\\text{in}} = I_s \\left(\\frac{R_s}{R_s + R_{\\text{in}}}\\right)$$
     - To ensure that all available source current enters the amplifier without attenuation ($I_{\\text{in}} \\to I_s$ regardless of $R_s$), the input impedance must be as small as possible:
       $$R_{\\text{in}} \\ll R_s \\implies R_{\\text{in}} \\to 0\\ \\Omega \\quad \\text{(Low input impedance)}$$
  2. **Output Impedance ($R_{\\text{out}}$)**:
     - The output stage behaves as a current source delivering $I_{\\text{out}}$ into load resistor $R_L$.
     - By current division at the output port:
       $$I_L = I_{\\text{out}} \\left(\\frac{R_{\\text{out}}}{R_{\\text{out}} + R_L}\\right)$$
     - To ensure that load fluctuations do not perturb the delivered load current ($I_L \\to I_{\\text{out}}$), the output impedance must be as large as possible:
       $$R_{\\text{out}} \\gg R_L \\implies R_{\\text{out}} \\to \\infty \\quad \\text{(High output impedance)}$$
- **Circuit Realization**:
  - In bipolar and MOS analog design, a **Common-Base (CB)** or **Common-Gate (CG)** stage is universally utilized as a current buffer because it naturally provides $R_{\\text{in}} \\approx 1/g_m$ (low) and $R_{\\text{out}} \\approx r_o$ (high).
- **Conclusion**:
  - A good current buffer must possess **low input impedance and high output impedance**.

Therefore, the correct answer is **Option B (low input impedance and high output impedance)**.`,
    images: []
  },
  "ec:2014:q22": {
    concept: "Communication Systems - CDMA Orthogonal Signature Sequences & Vector Dimension",
    markdown: `- **Concept / Subtopic**: Communication Systems - CDMA Orthogonal Signature Sequences & Vector Dimension
- **Given Parameters**:
  - Code-Division Multiple Access (CDMA) system.
  - Spreading code length / chip duration: $N = 8\\text{ chips}$.
- **Governing Principles**:
  - Each user $k$ is assigned a discrete signature sequence represented as an $N$-dimensional vector:
    $$\\mathbf{s}_k = [s_k[1], s_k[2], \\dots, s_k[N]]^T \\in \\mathbb{R}^N$$
  - For two signature sequences $\\mathbf{s}_i$ and $\\mathbf{s}_j$ to be mutually orthogonal, their cross-correlation at zero shift must vanish:
    $$\\langle \\mathbf{s}_i, \\mathbf{s}_j \\rangle = \\sum_{m=1}^N s_i[m] s_j[m] = 0 \\quad (\\forall i \\ne j)$$
- **Step-by-Step Analytical Derivation**:
  - In any $N$-dimensional vector space $\\mathbb{R}^N$, the maximum number of mutually orthogonal non-zero vectors is strictly bounded by the dimensionality of the vector space:
    $$M_{\\max} = N$$
  - In digital communications, such sets of mutually orthogonal binary sequences are constructed using the rows of an $N \\times N$ **Hadamard-Walsh Matrix** $H_N$.
  - For $N = 8$:
    $$H_1 = [1], \\quad H_2 = \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}, \\quad H_4 = H_2 \\otimes H_2, \\quad H_8 = H_2 \\otimes H_4$$
  - The matrix $H_8$ has dimensions $8 \\times 8$, generating exactly 8 mutually orthogonal Walsh sequences of length 8.
  - Therefore, the maximum number of users who can simultaneously transmit with zero mutual multi-access interference (MAI) is **8**.

Therefore, the correct answer is **Option A (8)**.`,
    images: []
  },
  "ec:2014:q25": {
    concept: "Electromagnetics - Method of Images & Electrostatic Force near Conducting Ground Plane",
    markdown: `- **Concept / Subtopic**: Electromagnetics - Method of Images & Electrostatic Force near Conducting Ground Plane
- **Given System**:
  - Point charge $+q$ located at distance $d$ from an infinite grounded conducting metal plate ($V = 0$).
  - Homogeneous medium of permittivity $\\varepsilon$.
- **Governing Principles (Method of Images)**:
  - Let the conducting plate occupy the plane $z = 0$, with the charge $+q$ located at coordinate $(0, 0, d)$.
  - The boundary condition requires the potential on the conducting surface to be identically zero:
    $$V(x, y, 0) = 0$$
  - By the uniqueness theorem of electrostatics, the induced surface charges on the conducting plane can be replaced by an equivalent **image charge** of opposite sign $-q$ placed at the mirror position $(0, 0, -d)$ in the region $z < 0$.
- **Step-by-Step Analytical Derivation**:
  1. **Separation Distance**:
     - The Euclidean distance between the real charge $+q$ and the image charge $-q$ is:
       $$r = d - (-d) = 2d$$
  2. **Force Calculation (Coulomb's Law)**:
     - The net electrostatic force acting on $+q$ is identical to the Coulomb force exerted on it by the image charge $-q$:
       $$F = \\frac{1}{4\\pi \\varepsilon} \\frac{|(+q)(-q)|}{r^2} = \\frac{1}{4\\pi \\varepsilon} \\frac{q^2}{(2d)^2} = \\frac{q^2}{16\\pi \\varepsilon d^2}$$
  3. **Direction of Force**:
     - Because $+q$ and $-q$ carry opposite charges, the electrostatic Coulomb force is **strictly attractive**.
     - Therefore, the force acts **towards the plate** (in the $-\\hat{z}$ direction).
- **Distractor Analysis**:
  - **Option A ($0$)** ignores the electrostatic induction of surface charge density $\\sigma = -\\frac{qd}{2\\pi (r^2+d^2)^{3/2}}$.
  - **Option B** has the correct magnitude but erroneous repulsive direction.
  - **Option D** uses distance $d$ instead of the true charge-to-image distance $2d$, overestimating the force by a factor of 4.

Therefore, the correct answer is **Option C ($\\frac{q^{2}}{16\\pi \\varepsilon d^{2}}$ towards the plate)**.`,
    images: []
  },
  "ec:2014:q9-s2": {
    concept: "Analog Circuits / Electronic Devices - BJT Base Recombination & Breakdown Voltage Scaling",
    markdown: `- **Concept / Subtopic**: Analog Circuits / Electronic Devices - BJT Base Recombination & Breakdown Voltage Scaling
- **Given Condition**:
  - An increase in the recombination rate of minority carriers in the quasi-neutral base region of a Bipolar Junction Transistor (BJT).
- **Governing Equations**:
  1. Base transport factor $\\alpha_T$:
     $$\\alpha_T = \\text{sech}\\left(\\frac{W_B}{L_B}\\right) \\approx 1 - \\frac{W_B^2}{2 L_B^2}$$
     where $L_B = \\sqrt{D_B \\tau_B}$ is the minority carrier diffusion length in the base.
  2. Common-base current gain $\\alpha$:
     $$\\alpha = \\gamma \\cdot \\alpha_T$$
  3. Common-emitter current gain $\\beta$:
     $$\\beta = \\frac{\\alpha}{1 - \\alpha}$$
  4. Collector-to-Emitter breakdown voltage with open base ($BV_{CEO}$):
     $$BV_{CEO} = \\frac{BV_{CBO}}{\\sqrt[n]{\\beta + 1}} \\approx \\frac{BV_{CBO}}{\\beta^{1/n}}$$
     where $BV_{CBO}$ is the collector-base breakdown voltage and $n$ is an empirical constant (typically $n \\approx 3\\text{ to }6$).
- **Step-by-Step Analytical Derivation**:
  - An increase in base recombination causes minority carrier lifetime $\\tau_B$ to decrease, reducing diffusion length $L_B$.
  - Consequently, fewer injected carriers reach the collector depletion region, causing base transport factor $\\alpha_T$ and overall gain $\\alpha$ to **decrease**.
  - Since $\\beta = \\frac{\\alpha}{1 - \\alpha}$, a small drop in $\\alpha$ results in a drastic **decrease in $\\beta$**.
  - Examining the breakdown relationship:
    $$BV_{CEO} \\approx \\frac{BV_{CBO}}{\\beta^{1/n}}$$
  - Because $\\beta$ appears in the denominator, a decrease in $\\beta$ directly results in an **increase in $BV_{CEO}$**.
- **Distractor Analysis**:
  - **Option A is incorrect**: The common-emitter current gain $\\beta$ decreases, not increases.
  - **Option C is incorrect**: The unity-gain cut-off frequency $f_T \\approx \\frac{1}{2\\pi \\tau_{ec}}$ is limited by base transit time $\\tau_B = \\frac{W_B^2}{2 D_B}$, which is governed by base width and diffusivity, not boosted by recombination.
  - **Option D is incorrect**: Transconductance $g_m = \\frac{I_C}{V_T}$ depends directly on collector bias current, which is reduced for a given base current drive.

Therefore, the correct answer is **Option B (the breakdown voltage $BV_{CEO}$)**.`,
    images: []
  },
  "ec:2014:q30-s2": {
    concept: "Network Theory - Series RLC Circuit Frequency Response & Leading Current Phase",
    markdown: `- **Concept / Subtopic**: Network Theory - Series RLC Circuit Frequency Response & Leading Current Phase
- **Given Parameters**:
  - Resistance $R = 1\\ \\Omega$.
  - Inductance $L = 1\\text{ H}$.
  - Capacitance $C = 1\\text{ F}$.
  - Current amplitude $I = \\frac{1}{2} I_0$, where $I_0$ is the current amplitude at resonance.
  - Operating condition: Current leads the supply voltage (capacitive phase).
- **Governing Equations**:
  1. Resonance frequency and resonant current:
     $$\\omega_0 = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{1 \\times 1}} = 1\\text{ rad/s}$$
     $$Z_0 = R = 1\\ \\Omega \\implies I_0 = \\frac{V_m}{R}$$
  2. Impedance at frequency $\\omega$:
     $$Z(\\omega) = R + j\\left(\\omega L - \\frac{1}{\\omega C}\\right)$$
     $$|Z(\\omega)| = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}$$
- **Step-by-Step Analytical Derivation**:
  - Since current is half of resonant value:
    $$I = \\frac{V_m}{|Z(\\omega)|} = \\frac{1}{2} I_0 = \\frac{1}{2} \\frac{V_m}{R} \\implies |Z(\\omega)| = 2R$$
  - Equating impedances:
    $$\\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2} = 2R$$
    $$R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2 = 4R^2$$
    $$\\left(\\omega L - \\frac{1}{\\omega C}\\right)^2 = 3R^2 \\implies \\omega L - \\frac{1}{\\omega C} = \\pm \\sqrt{3}R$$
  - Because the **current leads the supply voltage**, the circuit must be **capacitive** ($\text{phase angle } \\phi < 0$), meaning the net reactance is negative:
    $$\\omega L - \\frac{1}{\\omega C} = -\\sqrt{3}R$$
  - Substituting $L = 1\\text{ H}$, $C = 1\\text{ F}$, and $R = 1\\ \\Omega$:
    $$\\omega - \\frac{1}{\\omega} = -\\sqrt{3}$$
    $$\\omega^2 + \\sqrt{3}\\omega - 1 = 0$$
  - Applying the quadratic formula for positive angular frequency $\\omega > 0$:
    $$\\omega = \\frac{-\\sqrt{3} + \\sqrt{(\\sqrt{3})^2 - 4(1)(-1)}}{2(1)} = \\frac{-\\sqrt{3} + \\sqrt{3 + 4}}{2} = \\frac{\\sqrt{7} - \\sqrt{3}}{2}$$
  - Computing numerical value:
    $$\\sqrt{7} \\approx 2.64575, \\quad \\sqrt{3} \\approx 1.73205$$
    $$\\omega = \\frac{2.64575 - 1.73205}{2} = \\frac{0.91370}{2} \\approx 0.45685\\text{ rad/s} \\approx 0.46\\text{ rad/s}$$

Therefore, the correct numerical value is within the official range of **[0.44 to 0.48]**, with a computed value of **0.46**.`,
    images: []
  }
};

export function applyChunkEcMod04() {
  console.log("Applying CHUNK-EC-MOD-04 patches...");

  // 1. Update chunk JSON
  const chunkPath = path.join(ROOT, "data", "solutions", "chunks", "ec", "chunk-ec-mod-04.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
    for (const q of chunkData.questions) {
      if (CHUNK_EC_MOD_04_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = CHUNK_EC_MOD_04_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
    console.log("Updated chunk manifest:", chunkPath);
  }

  // 2. Update master manifest
  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.chunks["CHUNK-EC-MOD-04"]) {
      manifest.chunks["CHUNK-EC-MOD-04"].status = "COMPLETED";
      manifest.chunks["CHUNK-EC-MOD-04"].completedAt = new Date().toISOString();
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Updated master manifest:", manifestPath);
  }

  // 3. Inject into patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_EC_MOD_04_SOLUTIONS)
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

if (process.argv[1] && process.argv[1].includes("apply-chunk-ec-mod-04")) {
  applyChunkEcMod04();
}
