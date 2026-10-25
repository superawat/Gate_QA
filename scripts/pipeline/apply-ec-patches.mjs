import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_EC_MOD_03_SOLUTIONS = {
  "ec:2016:q4": {
    concept: "Signals and Systems / Engineering Mathematics - Laplace Equation and Harmonic Functions",
    markdown: `- **Concept / Subtopic**: Signals and Systems / Engineering Mathematics - Laplace Equation and Harmonic Functions
- **Given Equation & Scope**:
  - Governing partial differential equation: Laplace's equation in a charge-free/source-free region:
    $$\\nabla^2 f = 0$$
- **Governing Principles**:
  - Real-valued functions $f(x, y, z)$ satisfying Laplace's equation are known as **harmonic functions**.
  - **Mean Value Property**: The value of a harmonic function at the center of any sphere (or circle in 2D) is exactly equal to the average of its values over the boundary of that sphere:
    $$f(\\mathbf{x}_0) = \\frac{1}{4\\pi R^2} \\iint_{S_R} f(\\mathbf{x})\\, dS$$
  - **Maximum-Minimum Principle**: As a direct consequence of the Mean Value Property, if a function has a local maximum (or local minimum) at an interior point $\\mathbf{x}_0$, all surrounding points must have values less than (or greater than) $f(\\mathbf{x}_0)$, which violates the Mean Value equality. Therefore, non-constant solutions to the Laplace equation have **neither maxima nor minima anywhere in the interior domain; extrema can occur only at the boundaries**. In electrostatics, this is the mathematical basis of **Earnshaw's Theorem**.
- **Step-by-Step Analytical Derivation**:
  - Suppose $f$ has an interior local maximum at $\\mathbf{x}_0 \\in \\Omega$. Then there exists a ball $B(\\mathbf{x}_0, R) \\subset \\Omega$ such that $f(\\mathbf{x}) \\le f(\\mathbf{x}_0)$ for all $\\mathbf{x} \\in B(\\mathbf{x}_0, R)$, with strict inequality on some open subset if $f$ is non-trivial.
  - Then the mean value over the boundary sphere satisfies:
    $$\\frac{1}{4\\pi R^2} \\iint_{\\partial B} f(\\mathbf{x})\\, dS < f(\\mathbf{x}_0)$$
  - This directly contradicts the Mean Value Property $\\frac{1}{4\\pi R^2} \\iint_{\\partial B} f(\\mathbf{x})\\, dS = f(\\mathbf{x}_0)$.
  - Thus, no local maxima or minima can exist anywhere inside the domain except at the boundary $\\partial \\Omega$.
- **Distractor Analysis**:
  - **Option B is incorrect**: Solutions to Laplace's equation are readily separable in standard coordinate systems (e.g., Cartesian $X(x)Y(y)Z(z)$, cylindrical $R(r)\\Phi(\\phi)Z(z)$, and spherical $R(r)Y_{lm}(\\theta, \\phi)$ coordinates via separation of variables).
  - **Option C is incorrect**: Harmonic functions are infinitely differentiable ($C^\\infty$) and smooth everywhere in the interior of the domain; they are continuous.
  - **Option D is incorrect**: By Dirichlet and Neumann boundary value problems, solutions to Laplace's equation are uniquely determined by their boundary conditions.

Therefore, the correct answer is **Option A (The solutions have neither maxima nor minima anywhere except at the boundaries.)**.`,
    images: []
  },
  "ec:2016:q11": {
    concept: "Electronic Devices - Extrinsic Semiconductors & Energy Band Diagram",
    markdown: `- **Concept / Subtopic**: Electronic Devices - Extrinsic Semiconductors & Energy Band Diagram
- **Given Parameters & Diagram Analysis**:
  - Ambient temperature $T = 300\\text{ K}$.
  - The energy band diagram displays the conduction band edge $E_C$, valence band edge $E_V$, and a discrete donor energy state $E_D$ located immediately below the conduction band ($E_C - E_D \\approx 0.01\\text{ to }0.05\\text{ eV}$), with the Fermi level $E_F$ positioned in the upper half of the bandgap close to $E_C$.
- **Governing Principles**:
  - In an intrinsic semiconductor (e.g., Silicon with 4 valence electrons), doping with **pentavalent impurity atoms** (Group V elements such as Phosphorus, Arsenic, or Antimony) introduces five valence electrons per atom.
  - Four electrons form covalent bonds with adjacent Silicon atoms, while the fifth extra electron is loosely bound to the donor core with a tiny ionization energy.
  - This extra electron introduces a localized discrete energy level $E_D$ located just below $E_C$.
  - At room temperature ($300\\text{ K}$, thermal energy $k_B T \\approx 0.0259\\text{ eV}$), virtually all donor atoms are thermally ionized ($N_D^+ \\approx N_D$), donating electrons into the conduction band and creating an **n-type semiconductor** with electron majority carrier concentration $n \\approx N_D$.
- **Distractor Analysis**:
  - **Option B is incorrect**: Trivalent impurity atoms (Group III like Boron, Gallium) create acceptor levels $E_A$ just above the valence band $E_V$, not n-type with levels near $E_C$.
  - **Option C is incorrect**: Doping with pentavalent atoms forms an n-type semiconductor, never a p-type semiconductor.
  - **Option D is incorrect**: Trivalent atoms produce p-type semiconductors with acceptor states near $E_V$.

Therefore, the correct answer is **Option A (Intrinsic semiconductor doped with pentavalent atoms to form n-type semiconductor)**.`,
    images: []
  },
  "ec:2016:q12": {
    concept: "Electronic Devices - MOSFET Short-Channel Effects (SCE) & Scaling",
    markdown: `- **Concept / Subtopic**: Electronic Devices - MOSFET Short-Channel Effects (SCE) & Scaling
- **Given Statements**:
  - $P$: As channel length reduces, OFF-state current increases.
  - $Q$: As channel length reduces, output resistance increases.
  - $R$: As channel length reduces, threshold voltage remains constant.
  - $S$: As channel length reduces, ON current increases.
- **Governing Principles & Analytical Evaluation**:
  - **Statement P (Correct)**: As channel length $L$ scales down, Drain-Induced Barrier Lowering (DIBL) lowers the potential barrier between the source and channel at high drain voltages. Consequently, the subthreshold leakage and OFF-state current ($I_{\\text{off}} = I_D|_{V_{GS}=0}$) increase exponentially:
    $$I_{\\text{off}} \\propto \\exp\\left(-\\frac{q(V_T - \\eta V_{DS})}{m k_B T}\\right)$$
  - **Statement Q (Incorrect)**: The small-signal output resistance in saturation is governed by channel-length modulation parameter $\\lambda$:
    $$r_o = \\frac{\\partial V_{DS}}{\\partial I_D} \\approx \\frac{1}{\\lambda I_D}$$
    Because $\\lambda \\propto \\frac{1}{L}$, decreasing the channel length $L$ causes $\\lambda$ to increase, which directly **decreases** (not increases) the output resistance $r_o$.
  - **Statement R (Incorrect)**: Due to two-dimensional electric field distribution, source/drain depletion charge sharing, and DIBL, the gate requires less charge to invert the channel as $L$ reduces. This phenomenon, known as **threshold voltage roll-off**, causes $V_T$ to **decrease** significantly with reduced $L$, so it does not remain constant.
  - **Statement S (Correct)**: The saturation drain current scales inversely with channel length ($I_{\\text{on}} \\propto \\frac{W}{L}$ in long-channel theory, or $I_{\\text{on}} \\approx W C_{ox} v_{\\text{sat}}(V_{GS} - V_T)$ in velocity-saturated regimes with lower $V_T$). Therefore, reducing $L$ causes the ON-state current $I_{\\text{on}}$ to increase.
- **Conclusion**:
  - Statements $Q$ and $R$ are factually incorrect.

Therefore, the correct answer is **Option C (Q and R)**.`,
    images: []
  },
  "ec:2016:q18": {
    concept: "Analog Circuits / Digital CMOS - Inverter Self-Biased Operating Point & Switching Threshold",
    markdown: `- **Concept / Subtopic**: Analog Circuits / Digital CMOS - Inverter Self-Biased Operating Point & Switching Threshold
- **Given Circuit Configuration**:
  - The circuit is a standard complementary CMOS inverter consisting of a PMOS pull-up transistor and an NMOS pull-down transistor between $V_{DD}$ and ground.
  - The output node is connected directly to the gate input node:
    $$V_{\\text{in}} = V_{\\text{out}}$$
- **Governing Principles & Step-by-Step Derivation**:
  - When the output of a CMOS inverter is shorted to its input, the circuit is forced onto the line $V_{\\text{out}} = V_{\\text{in}}$ on the Voltage Transfer Characteristic (VTC).
  - By definition, the unique point on the inverter VTC where $V_{\\text{out}} = V_{\\text{in}}$ is the **inverter switching threshold** (denoted as $V_M$ or $V_{\\text{th,inv}}$).
  - At this operating point:
    - For NMOS: $V_{GSn} = V_{\\text{in}} = V_M$ and $V_{DSn} = V_{\\text{out}} = V_M$. Since $V_{DSn} = V_{GSn} > V_{GSn} - V_{Tn}$, the NMOS is operating in the **saturation region**.
    - For PMOS: $V_{SGp} = V_{DD} - V_M$ and $V_{SDp} = V_{DD} - V_M$. Since $V_{SDp} = V_{SGp} > V_{SGp} - |V_{Tp}|$, the PMOS is also operating in the **saturation region**.
  - Equating the drain currents in saturation ($I_{Dn} = I_{Dp}$):
    $$\\frac{1}{2}\\mu_n C_{ox}\\left(\\frac{W}{L}\\right)_n (V_M - V_{Tn})^2 = \\frac{1}{2}\\mu_p C_{ox}\\left(\\frac{W}{L}\\right)_p (V_{DD} - V_M - |V_{Tp}|)^2$$
  - Solving for $V_M$ yields the precise switching threshold of the inverter:
    $$V_M = \\frac{V_{Tn} + \\sqrt{\\frac{k_p}{k_n}}(V_{DD} - |V_{Tp}|)}{1 + \\sqrt{\\frac{k_p}{k_n}}}$$
  - Thus, the output settles exactly at the switching threshold of the inverter.
- **Distractor Analysis**:
  - **Option A ($0\\text{ V}$)** and **Option D ($V_{DD}$)** correspond to the extreme rail logic outputs of an open-loop digital inverter, but cannot occur when input and output are tied together since $V_{\\text{in}} = 0\\text{ V}$ would drive $V_{\\text{out}} = V_{DD}$, violating $V_{\\text{out}} = V_{\\text{in}}$.
  - **Option B** is an arbitrary algebraic mean of threshold voltages that does not account for $V_{DD}$ or transistor aspect ratios.

Therefore, the correct answer is **Option C (Switching threshold of inverter)**.`,
    images: []
  },
  "ec:2016:q15-s2": {
    concept: "Analog Circuits - Frequency Response of AC-Coupled BJT Amplifiers",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Frequency Response of AC-Coupled BJT Amplifiers
- **Operating Regime**:
  - AC-coupled common-emitter (CE) amplifier operating in the **mid-band frequency region** ($f_L \\ll f \\ll f_H$).
- **Governing Principles**:
  - In an amplifier circuit, capacitances fall into two distinct structural categories:
    1. **External Coupling and Bypass Capacitances ($C_C, C_E$)**:
       - These capacitors have large values, typically in the microfarad ($\\mu\\text{F}$) range.
       - Their impedance is given by $Z_C = \\frac{1}{j 2\\pi f C}$.
       - At mid-band frequencies, $2\\pi f C$ is sufficiently large such that $X_C \\approx 0\\ \\Omega$. Consequently, they act as effective **AC short circuits**, allowing the AC signal to pass without attenuation and establishing an AC ground at the emitter bypass terminal.
    2. **Internal Device Parasitic Capacitances ($C_\\pi, C_\\mu$)**:
       - These junction/diffusion capacitances have tiny values, typically in the picofarad ($\\text{pF}$) or femtofarad ($\\text{fF}$) range.
       - At mid-band frequencies, $2\\pi f C$ is extremely small such that their reactance $X_C \\to \\infty$. Consequently, they carry negligible current and act as effective **AC open circuits**.
- **Distractor Analysis**:
  - **Option B is incorrect**: If coupling and bypass capacitances were open circuits, the AC input signal would be completely blocked from reaching the base terminal.
  - **Option C is incorrect**: If device parasitic capacitances were short circuits, the input and output nodes would be grounded/shorted to each other, destroying amplifier gain.
  - **Option D is incorrect**: It reverses the roles of the small parasitic capacitances and the large coupling/bypass capacitances.

Therefore, the correct answer is **Option A (The device parasitic capacitances behave like open circuits, whereas coupling and bypass capacitances behave like short circuits.)**.`,
    images: []
  },
  "ec:2016:q16-s2": {
    concept: "Digital Circuits / CMOS VLSI - Sizing of CMOS NOR Gate for Equal Propagation Delays",
    markdown: `- **Concept / Subtopic**: Digital Circuits / CMOS VLSI - Sizing of CMOS NOR Gate for Equal Propagation Delays
- **Given Parameters**:
  - A reference CMOS inverter has PMOS width $W_P$ and NMOS width $W_N$, adjusted to drive load capacitor $C$ with matched worst-case charge time ($t_{PLH}$) and discharge time ($t_{PHL}$).
  - A 2-input CMOS NOR gate is to be designed in the same technology to drive the same capacitor $C$ with identical worst-case delay times.
  - All channel lengths $L$ remain unchanged.
- **Governing Principles & Analytical Derivation**:
  1. **Pull-Up Network (PUN) of 2-Input NOR Gate**:
     - The pull-up network consists of **two PMOS transistors connected in series** between $V_{DD}$ and the output.
     - For the output to charge from LOW to HIGH, both PMOS transistors must be ON (inputs $A = 0, B = 0$).
     - The total effective on-resistance of the series chain is:
       $$R_{P,\\text{NOR}} = R_{P1} + R_{P2} = 2 R_P$$
     - To match the charging time of the reference inverter ($R_{P,\\text{NOR}} = R_{P,\\text{inv}}$):
       $$2 R_P = R_{P,\\text{inv}} \\implies R_P = \\frac{1}{2} R_{P,\\text{inv}}$$
     - Since transistor on-resistance is inversely proportional to channel width ($R \\propto \\frac{L}{W}$):
       $$\\frac{L}{\\mu_p C_{ox} W_{P,\\text{NOR}}} = \\frac{1}{2}\\left(\\frac{L}{\\mu_p C_{ox} W_{P,\\text{inv}}}\\right) \\implies W_{P,\\text{NOR}} = 2 W_{P,\\text{inv}}$$
     - Therefore, the **widths of the PMOS transistors must be doubled**.
  2. **Pull-Down Network (PDN) of 2-Input NOR Gate**:
     - The pull-down network consists of **two NMOS transistors connected in parallel** between the output and ground.
     - The **worst-case discharge time** occurs when only **one** NMOS transistor is turned ON (e.g., $A=1, B=0$ or $A=0, B=1$).
     - In this worst-case scenario, discharge current flows through a single NMOS channel with resistance $R_N$.
     - To match the inverter discharge resistance ($R_{N,\\text{NOR}} = R_{N,\\text{inv}}$):
       $$W_{N,\\text{NOR}} = W_{N,\\text{inv}}$$
     - Therefore, the **widths of the NMOS transistors should not be changed**.
- **Distractor Analysis**:
  - Halving NMOS width (Options A and D) would double the pull-down resistance, doubling the worst-case fall time.
  - Halving PMOS width (Option C) would quadruple the pull-up resistance, drastically increasing the rise time.

Therefore, the correct answer is **Option B (Widths of PMOS transistors should be doubled, while widths of NMOS transistors should not be changed.)**.`,
    images: []
  },
  "ec:2016:q43-s2": {
    concept: "Digital Circuits - Flash ADC Dynamics, Comparator Array Loading & Settling Time",
    markdown: `- **Concept / Subtopic**: Digital Circuits - Flash ADC Dynamics, Comparator Array Loading & Settling Time
- **Given Parameters**:
  - Resolution $N = 8\\text{ bits}$.
  - Source resistance of analog input $R_s = 75\\ \\Omega$.
  - Input capacitance of each comparator $C_{\\text{comp}} = 8\\text{ pF}$.
  - Accuracy requirement: settle to within $\\frac{1}{2}\\text{ LSB}$ for a full-scale input change $V_{\\text{FS}}$.
  - Thermometer-to-binary encoder delay is negligible.
- **Governing Equations**:
  1. Number of comparators in an $N$-bit Flash ADC:
     $$M = 2^N - 1 = 2^8 - 1 = 255$$
  2. Total equivalent capacitive load driven by $V_{\\text{in}}$:
     $$C_{\\text{total}} = M \\times C_{\\text{comp}} = 255 \\times 8\\text{ pF} = 2040\\text{ pF} = 2.04\\text{ nF}$$
  3. Single-pole RC circuit time constant:
     $$\\tau = R_s \\times C_{\\text{total}} = 75\\ \\Omega \\times 2.04 \\times 10^{-9}\\text{ F} = 153\\text{ ns} = 1.53 \\times 10^{-7}\\text{ s}$$
  4. Step response error settling requirement:
     $$v(t) = V_{\\text{FS}}\\left(1 - e^{-t/\\tau}\\right) \\implies \\text{Error}(t) = V_{\\text{FS}} e^{-t/\\tau}$$
     $$\\text{Error}(t) \\le \\frac{1}{2}\\text{ LSB} = \\frac{V_{\\text{FS}}}{2 \\times 2^N} = \\frac{V_{\\text{FS}}}{2^{N+1}} = \\frac{V_{\\text{FS}}}{512}$$
- **Step-by-Step Analytical Derivation**:
  - Solving for the minimum settling time $t_{\\text{settle}}$:
    $$e^{-t_{\\text{settle}}/\\tau} \\le \\frac{1}{512} \\implies \\frac{t_{\\text{settle}}}{\\tau} \\ge \\ln(512) = 9 \\ln(2) \\approx 9 \\times 0.69315 = 6.2383$$
    $$t_{\\text{settle}} = 6.2383 \\times \\tau = 6.2383 \\times 153\\text{ ns} \\approx 954.5\\text{ ns} \\approx 0.955\\ \\mu\\text{s}$$
  - The maximum allowable sampling rate $f_s$ is the reciprocal of the total settling interval per conversion:
    $$f_s = \\frac{1}{t_{\\text{settle}}} = \\frac{1}{0.9545 \\times 10^{-6}\\text{ s}} \\approx 1.048 \\times 10^6\\text{ samples/second} \\approx 1\\text{ MSPS}$$
  - Among the given options, $1\\text{ MSPS}$ is the closest alternative.
- **Distractor Analysis**:
  - $6\\text{ MSPS}$, $64\\text{ MSPS}$, and $256\\text{ MSPS}$ would sample far too quickly, truncating the input signal before the massive $2.04\\text{ nF}$ comparator bank can settle within $\\frac{1}{2}\\text{ LSB}$, causing severe quantization and missing-code errors.

Therefore, the correct answer is **Option A (1 megasamples per second)**.`,
    images: []
  },
  "ec:2016:q53-s2": {
    concept: "Electromagnetics - Microstrip Transmission Line & Characteristic Impedance Bounds",
    markdown: `- **Concept / Subtopic**: Electromagnetics - Microstrip Transmission Line & Characteristic Impedance Bounds
- **Given Parameters**:
  - Conducting trace width: $w$.
  - Dielectric slab thickness: $t$.
  - Relative permittivity of dielectric: $\\varepsilon_r > 1$.
  - Permittivity of free space: $\\varepsilon_0$.
  - Inductance per unit length: $L$.
  - Characteristic impedance: $Z_0$.
- **Governing Principles**:
  - For a lossless transmission line, the characteristic impedance is given by:
    $$Z_0 = \\sqrt{\\frac{L}{C}}$$
    where $C$ is the true total capacitance per unit length of the microstrip line.
  - Consider the idealized parallel-plate capacitance per unit length under the strip of width $w$ and thickness $t$, assuming all electric field lines are purely vertical and confined strictly to the dielectric:
    $$C_{\\text{pp}} = \\frac{\\varepsilon_0 \\varepsilon_r w}{t}$$
  - In an actual physical microstrip geometry, the conductor edges produce **fringing fields** that extend outward into the substrate and into the air space above.
  - Because fringing fields create additional parallel electrostatic flux paths connecting the trace to the infinite ground plane, the total capacitance per unit length $C$ is strictly **greater** than the parallel-plate component:
    $$C > C_{\\text{pp}} = \\frac{\\varepsilon_0 \\varepsilon_r w}{t}$$
- **Step-by-Step Analytical Derivation**:
  - Expressing $Z_0$ in terms of the capacitance bound:
    $$C > \\frac{\\varepsilon_0 \\varepsilon_r w}{t}$$
  - Inverting both sides reverses the inequality sign:
    $$\\frac{1}{C} < \\frac{t}{\\varepsilon_0 \\varepsilon_r w}$$
  - Multiplying both sides by the positive inductance per unit length $L$:
    $$\\frac{L}{C} < \\frac{L t}{\\varepsilon_0 \\varepsilon_r w}$$
  - Taking the positive square root on both sides:
    $$Z_0 = \\sqrt{\\frac{L}{C}} < \\sqrt{\\frac{L t}{\\varepsilon_0 \\varepsilon_r w}}$$
  - Thus, the characteristic impedance $Z_0$ is always strictly bounded from above by $\\sqrt{\\frac{L t}{\\varepsilon_0 \\varepsilon_r w}}$.
- **Distractor Analysis**:
  - **Option A** has the reversed inequality ($Z_0 > \\sqrt{\\dots}$), which would only occur if fringing fields decreased the total capacitance (physically impossible for passive capacitive geometries).
  - **Options C and D** erroneously invert the geometric ratio $\\frac{t}{w}$ to $\\frac{w}{t}$, violating dimensional consistency and capacitance scaling.

Therefore, the correct answer is **Option B ($Z_{0} \\lt \\sqrt{\\frac{Lt}{\\varepsilon _{0}\\varepsilon_{r} w}}$)**.`,
    images: []
  },
  "ec:2016:q11-s3": {
    concept: "Electronic Devices - MOS Capacitor Energy Band Diagram & Surface Regimes",
    markdown: `- **Concept / Subtopic**: Electronic Devices - MOS Capacitor Energy Band Diagram & Surface Regimes
- **Given Energy Band Diagram Analysis**:
  - The diagram displays a Metal-Oxide-Semiconductor (MOS) structure with a p-type semiconductor substrate (indicated by the bulk Fermi level $E_F$ lying below the intrinsic Fermi level $E_i$ in the semiconductor bulk, where $E_i - E_F > 0$).
  - As we move from the bulk toward the oxide-semiconductor interface (the surface region), the conduction band $E_C$, valence band $E_V$, and intrinsic Fermi level $E_i$ bend sharply **downward**.
  - At the semiconductor-oxide interface, the intrinsic Fermi level $E_i$ crosses **below** the constant Fermi level $E_F$ ($E_F > E_i$ at the surface).
- **Governing Principles**:
  - The thermal equilibrium carrier concentrations are given by:
    $$n = n_i \\exp\\left(\\frac{E_F - E_i}{k_B T}\\right), \\quad p = n_i \\exp\\left(\\frac{E_i - E_F}{k_B T}\\right)$$
  - In the bulk of the p-type semiconductor, $E_i > E_F$, so $p_{\\text{bulk}} \\gg n_{\\text{bulk}}$ (holes are majority carriers).
  - When the surface bands bend downward such that $E_i$ crosses below $E_F$, we have $(E_F - E_i)_{\\text{surface}} > 0$.
  - Consequently, at the surface, the electron concentration exceeds the hole concentration:
    $$n_{\\text{surface}} > n_i > p_{\\text{surface}}$$
  - The surface layer has thus converted ("inverted") its carrier majority from holes to electrons, forming a continuous conducting electron channel at the interface.
  - This operating condition is the definition of **inversion**.
- **Distractor Analysis**:
  - **Accumulation** occurs when majority carriers (holes) accumulate at the surface, which requires upward band bending ($E_F$ moves even closer to $E_V$).
  - **Depletion** occurs when downward band bending pushes holes away from the surface, but $E_i$ has not yet crossed below $E_F$ ($E_i > E_F$ throughout).
  - **Flat band** occurs when there is zero band bending throughout the semiconductor ($E_C, E_i, E_V$ are perfectly horizontal).

Therefore, the correct answer is **Option A (inversion)**.`,
    images: []
  },
  "ec:2016:q39-s3": {
    concept: "Analog Circuits - Zener Diode I-V Characteristics & Breakdown Operation",
    markdown: `- **Concept / Subtopic**: Analog Circuits - Zener Diode I-V Characteristics & Breakdown Operation
- **Given Parameters & Characteristics**:
  - Figure I illustrates the reverse $I-V$ breakdown characteristics of two Zener diodes, $D_1$ and $D_2$:
    - For diode $D_1$: Breakdown occurs at reverse voltage $V_{Z1} = 70\\text{ V}$.
    - For diode $D_2$: Breakdown occurs at reverse voltage $V_{Z2} = 80\\text{ V}$.
  - Figure II shows diodes $D_1$ and $D_2$ connected in parallel under reverse bias across a current-limiting series resistor with a variable DC voltage supply $V_S$ ranging from $0\\text{ V}$ to $100\\text{ V}$.
- **Step-by-Step Analytical Derivation**:
  1. **Region 1 ($0\\text{ V} \\le V_S < 70\\text{ V}$)**:
     - The reverse voltage across the parallel combination is less than the breakdown voltage of both diodes ($V < 70\\text{ V} < 80\\text{ V}$).
     - Both diodes remain in their reverse-bias OFF state, drawing only negligible reverse saturation leakage current. Neither diode is in breakdown.
  2. **Transition at $V_S \\ge 70\\text{ V}$**:
     - As the supply voltage increases, the voltage across the parallel diodes reaches $70\\text{ V}$.
     - Diode $D_1$ immediately enters the **reverse Zener breakdown** region because its breakdown threshold is $V_{Z1} = 70\\text{ V}$.
  3. **Clamping Action & Behavior of $D_2$**:
     - Once $D_1$ undergoes breakdown, its steep low dynamic impedance clamps the voltage across the entire parallel diode branch to approximately $V_{Z1} = 70\\text{ V}$.
     - Any further increase in the supply voltage $V_S$ up to $100\\text{ V}$ simply drops across the series resistor ($V_R = V_S - 70\\text{ V}$), increasing the current through $D_1$.
     - Because the parallel branch voltage is tightly clamped at $70\\text{ V}$, the voltage across diode $D_2$ can **never reach its $80\\text{ V}$ breakdown threshold**.
     - Therefore, diode $D_2$ remains OFF and never enters breakdown.
- **Conclusion**:
  - Throughout the entire range $0\\text{ to }100\\text{ V}$, breakdown occurs exclusively in **$D_1$ only**.

Therefore, the correct answer is **Option A (D1 only)**.`,
    images: []
  },
  "ec:2016:q47-s3": {
    concept: "Control Systems - State Space Analysis, Controllability and Observability",
    markdown: `- **Concept / Subtopic**: Control Systems - State Space Analysis, Controllability and Observability
- **Given State Differential Equations**:
  $$\\frac{d}{dt}x_1(t) + 2x_1(t) = 3u(t) \\implies \\dot{x}_1(t) = -2x_1(t) + 3u(t)$$
  $$\\frac{d}{dt}x_2(t) + x_2(t) = u(t) \\implies \\dot{x}_2(t) = -x_2(t) + u(t)$$
- **Output Equation**:
  $$c(t) = x_1(t)$$
- **State-Space Matrix Representation**:
  $$\\dot{\\mathbf{x}}(t) = A\\mathbf{x}(t) + B u(t), \\quad y(t) = C\\mathbf{x}(t)$$
  $$\\begin{bmatrix} \\dot{x}_1 \\\\ \\dot{x}_2 \\end{bmatrix} = \\begin{bmatrix} -2 & 0 \\\\ 0 & -1 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix} + \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} u(t)$$
  $$c(t) = \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix}$$
  where $A = \\begin{bmatrix} -2 & 0 \\\\ 0 & -1 \\end{bmatrix}$, $B = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$, and $C = \\begin{bmatrix} 1 & 0 \\end{bmatrix}$, with system order $n = 2$.
- **Step-by-Step Analytical Derivation**:
  1. **Controllability Analysis (Kalman's Criterion)**:
     - The controllability matrix is given by:
       $$Q_c = \\begin{bmatrix} B & AB \\end{bmatrix}$$
     - Compute $AB$:
       $$AB = \\begin{bmatrix} -2 & 0 \\\\ 0 & -1 \\end{bmatrix} \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} -6 \\\\ -1 \\end{bmatrix}$$
     - Construct $Q_c$:
       $$Q_c = \\begin{bmatrix} 3 & -6 \\\\ 1 & -1 \\end{bmatrix}$$
     - Compute the determinant of $Q_c$:
       $$\\det(Q_c) = (3)(-1) - (-6)(1) = -3 + 6 = 3 \\ne 0$$
     - Since $\\det(Q_c) \\ne 0$, $\\text{rank}(Q_c) = 2 = n$.
     - Therefore, the system is **completely controllable**.
  2. **Observability Analysis (Kalman's Criterion)**:
     - The observability matrix is given by:
       $$Q_o = \\begin{bmatrix} C \\\\ CA \\end{bmatrix}$$
     - Compute $CA$:
       $$CA = \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\begin{bmatrix} -2 & 0 \\\\ 0 & -1 \\end{bmatrix} = \\begin{bmatrix} -2 & 0 \\end{bmatrix}$$
     - Construct $Q_o$:
       $$Q_o = \\begin{bmatrix} 1 & 0 \\\\ -2 & 0 \\end{bmatrix}$$
     - Compute the determinant of $Q_o$:
       $$\\det(Q_o) = (1)(0) - (0)(-2) = 0$$
     - Since the second column is entirely zeros, $\\text{rank}(Q_o) = 1 < n = 2$.
     - State variable $x_2(t)$ has zero coupling to the output $c(t)$, making it unobservable.
     - Therefore, the system is **not observable**.
- **Conclusion**:
  - The system is **controllable but not observable**.

Therefore, the correct answer is **Option A (controllable but not observable)**.`,
    images: []
  }
};

export function applyChunkEcMod03() {
  console.log("Applying CHUNK-EC-MOD-03 patches...");

  // 1. Update chunk JSON
  const chunkPath = path.join(ROOT, "data", "solutions", "chunks", "ec", "chunk-ec-mod-03.json");
  if (fs.existsSync(chunkPath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
    for (const q of chunkData.questions) {
      if (CHUNK_EC_MOD_03_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = CHUNK_EC_MOD_03_SOLUTIONS[q.uid];
      }
    }
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
    console.log("Updated chunk manifest:", chunkPath);
  }

  // 2. Update master manifest
  const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.chunks["CHUNK-EC-MOD-03"]) {
      manifest.chunks["CHUNK-EC-MOD-03"].status = "COMPLETED";
      manifest.chunks["CHUNK-EC-MOD-03"].completedAt = new Date().toISOString();
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log("Updated master manifest:", manifestPath);
  }

  // 3. Inject into patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  // We find export const AUTHENTIC_PATCHES = { ... };
  // We can insert the new entries before the closing brace of AUTHENTIC_PATCHES
  const entries = Object.entries(CHUNK_EC_MOD_03_SOLUTIONS)
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

if (process.argv[1] && process.argv[1].includes("apply-ec-patches")) {
  applyChunkEcMod03();
}
