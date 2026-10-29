/**
 * Official GATE EC (Electronics and Communication Engineering) Syllabus Taxonomy
 * 
 * Source: Official GATE Examination Syllabus (IIT Organising Institute, Applicable for GATE 2026 / 2027)
 * Hierarchy: Section (Subject) -> Heading (Topic)
 * Paper Code: EC
 */

import type { SubjectNode } from "./trackerTaxonomy";
import { createGeneralAptitudeSubject } from "./generalAptitudeTaxonomy";

export const EC_SUBJECTS: SubjectNode[] = [
  {
    id: "ec-em",
    slug: "ec-math",
    canonicalSubjectSlugs: ["ec-math"],
    track: "ec" as any,
    label: "Engineering Mathematics",
    shortLabel: "EM",
    marksRange: "13–15 Marks",
    estimatedHours: 45,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Higher Engineering Mathematics (B.S. Grewal) / Advanced Engineering Mathematics (Erwin Kreyszig)",
    topics: [
      {
        id: "ec-em-linear-algebra",
        label: "Linear Algebra",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "linear-algebra",
        secondaryTopicTags: ["matrices", "eigenvalues", "eigenvectors", "system-of-equations", "rank-of-matrix"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Vector space, basis, linear dependence and independence",
          "Matrix algebra, eigenvalues and eigenvectors, rank",
          "Solution of linear equations: existence and uniqueness"
        ],
        subtopics: [
          { id: "ec-em-la-matrix-algebra", label: "Matrix Algebra & Determinants", subtopicSlug: "matrix-algebra", tags: ["matrix-algebra", "determinants", "rank"] },
          { id: "ec-em-la-linear-systems", label: "Systems of Linear Equations", subtopicSlug: "linear-systems", tags: ["system-of-equations", "linear-equations"] },
          { id: "ec-em-la-eigenvalues", label: "Eigenvalues & Eigenvectors", subtopicSlug: "eigenvalues", tags: ["eigenvalues", "eigenvectors", "diagonalization"] }
        ]
      },
      {
        id: "ec-em-calculus",
        label: "Calculus",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "calculus",
        secondaryTopicTags: ["limits", "derivatives", "integration", "mean-value-theorems", "maxima-minima"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Mean value theorems, theorems of integral calculus",
          "Evaluation of definite and improper integrals, partial derivatives",
          "Maxima and minima, multiple integrals, line, surface and volume integrals, Taylor series"
        ],
        subtopics: [
          { id: "ec-em-calc-mean-value", label: "Mean Value Theorems & Taylor Series", subtopicSlug: "mean-value-theorems", tags: ["mean-value-theorems", "taylor-series"] },
          { id: "ec-em-calc-integrals", label: "Definite & Multiple Integrals", subtopicSlug: "integrals", tags: ["definite-integrals", "multiple-integrals"] },
          { id: "ec-em-calc-maxima-minima", label: "Partial Derivatives, Maxima & Minima", subtopicSlug: "maxima-minima", tags: ["partial-derivatives", "maxima-minima"] }
        ]
      },
      {
        id: "ec-em-diff-equations",
        label: "Differential Equations",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "differential-equations",
        secondaryTopicTags: ["ode", "first-order-ode", "higher-order-ode", "cauchy-euler", "partial-differential-equations"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "First-order equations (linear and nonlinear)",
          "Higher-order linear differential equations with constant coefficients",
          "Method of variation of parameters, Cauchy's and Euler's equations, boundary value problems"
        ],
        subtopics: [
          { id: "ec-em-de-first-order", label: "First-Order Linear & Nonlinear ODEs", subtopicSlug: "first-order-ode", tags: ["first-order-ode", "integrating-factor"] },
          { id: "ec-em-de-higher-order", label: "Higher-Order Linear ODEs & Cauchy-Euler", subtopicSlug: "higher-order-ode", tags: ["higher-order-ode", "cauchy-euler"] },
          { id: "ec-em-de-pde", label: "Partial Differential Equations & Boundary Value Problems", subtopicSlug: "pde", tags: ["pde", "boundary-value-problems"] }
        ]
      },
      {
        id: "ec-em-vector-analysis",
        label: "Vector Analysis",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "vector-analysis",
        secondaryTopicTags: ["gradient", "divergence", "curl", "vector-calculus", "stokes-theorem", "gauss-divergence-theorem"],
        estimatedHours: 6,
        weightageTier: "tier-2-medium",
        marksRange: "1–2 Marks",
        keyConcepts: [
          "Gradient, divergence and curl",
          "Line, surface and volume integrals",
          "Stokes's, Gauss's, and Green's theorems"
        ],
        subtopics: [
          { id: "ec-em-va-grad-div-curl", label: "Gradient, Divergence & Curl", subtopicSlug: "grad-div-curl", tags: ["gradient", "divergence", "curl"] },
          { id: "ec-em-va-vector-theorems", label: "Green's, Stokes's & Gauss's Theorems", subtopicSlug: "vector-theorems", tags: ["stokes-theorem", "gauss-divergence-theorem", "greens-theorem"] }
        ]
      },
      {
        id: "ec-em-complex-analysis",
        label: "Complex Analysis",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "complex-analysis",
        secondaryTopicTags: ["analytic-functions", "cauchy-riemann", "residue-theorem", "laurent-series"],
        estimatedHours: 7,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Analytic functions, Cauchy-Riemann equations",
          "Cauchy's integral theorem and integral formula",
          "Taylor's and Laurent's series, residue theorem"
        ],
        subtopics: [
          { id: "ec-em-ca-analytic", label: "Analytic Functions & Cauchy-Riemann Equations", subtopicSlug: "analytic-functions", tags: ["analytic-functions", "cauchy-riemann"] },
          { id: "ec-em-ca-integrals", label: "Cauchy's Integral Theorem & Residue Theorem", subtopicSlug: "residue-theorem", tags: ["cauchy-integral-formula", "residue-theorem", "laurent-series"] }
        ]
      },
      {
        id: "ec-em-prob-stats",
        label: "Probability and Statistics",
        subjectSlug: "ec-math",
        canonicalSubjectSlugs: ["ec-math"],
        primaryTopicTag: "probability-and-statistics",
        secondaryTopicTags: ["probability", "conditional-probability", "random-variables", "distributions", "normal-distribution"],
        estimatedHours: 7,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Conditional probability, mean, median, mode, standard deviation",
          "Random variables, sampling theorems",
          "Binomial, Poisson, exponential, and normal distributions"
        ],
        subtopics: [
          { id: "ec-em-ps-conditional", label: "Conditional Probability & Bayes' Theorem", subtopicSlug: "conditional-probability", tags: ["conditional-probability", "bayes-theorem"] },
          { id: "ec-em-ps-distributions", label: "Random Variables & Probability Distributions", subtopicSlug: "distributions", tags: ["random-variables", "normal-distribution", "poisson-distribution"] }
        ]
      }
    ]
  },
  {
    id: "ec-nss",
    slug: "ec-networks-signals-systems",
    canonicalSubjectSlugs: ["ec-network-theory", "ec-signals-and-systems"],
    track: "ec" as any,
    label: "Networks, Signals and Systems",
    shortLabel: "NSS",
    marksRange: "12–15 Marks",
    estimatedHours: 42,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Engineering Circuit Analysis (Hayt & Kemmerly) / Signals and Systems (Oppenheim & Willsky)",
    topics: [
      {
        id: "ec-nss-circuit-analysis",
        label: "Network Solution Methods",
        subjectSlug: "ec-network-theory",
        canonicalSubjectSlugs: ["ec-network-theory"],
        primaryTopicTag: "network-theorems",
        secondaryTopicTags: ["node-mesh-analysis", "thevenin", "norton", "superposition", "maximum-power-transfer", "sinusoidal-steady-state"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Node and mesh analysis",
          "Network theorems: superposition, Thevenin's, Norton's, maximum power transfer",
          "Sinusoidal steady-state analysis and time-domain analysis of simple linear circuits"
        ],
        subtopics: [
          { id: "ec-nss-ca-theorems", label: "Network Theorems (Thevenin, Norton, Superposition)", subtopicSlug: "network-theorems", tags: ["thevenin", "norton", "superposition", "maximum-power-transfer"] },
          { id: "ec-nss-ca-transient", label: "Transient & Steady-State Analysis", subtopicSlug: "transient-analysis", tags: ["transient-response", "time-domain", "sinusoidal-steady-state"] }
        ]
      },
      {
        id: "ec-nss-two-port",
        label: "Two-Port Networks & Laplace Solutions",
        subjectSlug: "ec-network-theory",
        canonicalSubjectSlugs: ["ec-network-theory"],
        primaryTopicTag: "two-port-networks",
        secondaryTopicTags: ["two-port-parameters", "z-parameters", "y-parameters", "h-parameters", "abcd-parameters", "transfer-functions"],
        estimatedHours: 8,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Solution of network equations using Laplace transform",
          "Linear two-port network parameters (z, y, h, ABCD)",
          "Driving point and transfer functions"
        ],
        subtopics: [
          { id: "ec-nss-tp-params", label: "Two-Port Parameters (z, y, h, ABCD)", subtopicSlug: "two-port-parameters", tags: ["two-port-networks", "z-parameters", "h-parameters"] },
          { id: "ec-nss-tp-laplace", label: "Laplace Transform of Linear Networks", subtopicSlug: "network-laplace", tags: ["laplace-transform", "transfer-function"] }
        ]
      },
      {
        id: "ec-nss-signals-systems",
        label: "Continuous & Discrete-Time Signals and LTI Systems",
        subjectSlug: "ec-signals-and-systems",
        canonicalSubjectSlugs: ["ec-signals-and-systems"],
        primaryTopicTag: "continuous-and-discrete-signals",
        secondaryTopicTags: ["lti-systems", "impulse-response", "convolution", "sampling-theorem", "frequency-response"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Continuous-time and discrete-time signals: shifting and scaling operations",
          "Linear Time Invariant (LTI) systems: impulse response, step response, frequency response",
          "Convolution, sampling theorem and signal reconstruction"
        ],
        subtopics: [
          { id: "ec-nss-ss-lti", label: "LTI Systems, Impulse Response & Convolution", subtopicSlug: "lti-systems", tags: ["lti-systems", "convolution", "impulse-response"] },
          { id: "ec-nss-ss-sampling", label: "Sampling Theorem & Signal Reconstruction", subtopicSlug: "sampling-theorem", tags: ["sampling-theorem", "nyquist-rate", "reconstruction"] }
        ]
      },
      {
        id: "ec-nss-transforms",
        label: "Transform Domain Analysis (Fourier, Laplace, Z)",
        subjectSlug: "ec-signals-and-systems",
        canonicalSubjectSlugs: ["ec-signals-and-systems"],
        primaryTopicTag: "fourier-transform",
        secondaryTopicTags: ["fourier-series", "laplace-transform", "z-transform", "dtft", "region-of-convergence"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Fourier series and Fourier transform analysis of signals",
          "Laplace transform, Region of Convergence (ROC), properties",
          "Z-transform, ROC, properties and inverse Z-transform"
        ],
        subtopics: [
          { id: "ec-nss-tf-fourier", label: "Fourier Series & Fourier Transform", subtopicSlug: "fourier-series-transform", tags: ["fourier-series", "fourier-transform", "dtft"] },
          { id: "ec-nss-tf-z-laplace", label: "Laplace & Z-Transforms (ROC & Properties)", subtopicSlug: "z-transform", tags: ["laplace-transform", "z-transform", "roc"] }
        ]
      }
    ]
  },
  {
    id: "ec-ed",
    slug: "ec-electronic-devices",
    canonicalSubjectSlugs: ["ec-electronic-devices"],
    track: "ec" as any,
    label: "Electronic Devices",
    shortLabel: "ED",
    marksRange: "8–11 Marks",
    estimatedHours: 32,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Semiconductor Physics and Devices (Donald Neamen)",
    topics: [
      {
        id: "ec-ed-energy-bands",
        label: "Energy Bands & Carrier Transport",
        subjectSlug: "ec-electronic-devices",
        canonicalSubjectSlugs: ["ec-electronic-devices"],
        primaryTopicTag: "energy-bands-in-silicon",
        secondaryTopicTags: ["intrinsic-semiconductor", "extrinsic-semiconductor", "carrier-transport", "drift-diffusion", "continuity-equation"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Energy bands in intrinsic and extrinsic silicon",
          "Carrier transport: diffusion current, drift current, mobility, and resistivity",
          "Generation and recombination of carriers, Poisson and continuity equations"
        ],
        subtopics: [
          { id: "ec-ed-eb-carrier-transport", label: "Drift, Diffusion, Mobility & Resistivity", subtopicSlug: "carrier-transport", tags: ["drift-current", "diffusion-current", "mobility"] },
          { id: "ec-ed-eb-generation-recomb", label: "Generation-Recombination & Continuity Equations", subtopicSlug: "continuity-equation", tags: ["poisson-equation", "continuity-equation"] }
        ]
      },
      {
        id: "ec-ed-pn-junction",
        label: "P-N Junction & Optoelectronic Devices",
        subjectSlug: "ec-electronic-devices",
        canonicalSubjectSlugs: ["ec-electronic-devices"],
        primaryTopicTag: "p-n-junction-diode",
        secondaryTopicTags: ["zener-diode", "depletion-region", "barrier-potential", "led", "solar-cell", "photodiode"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "P-N junction diode: depletion region, built-in potential, I-V characteristics",
          "Zener diode breakdown mechanisms",
          "LED, photo diode, and solar cell basic physics and characteristics"
        ],
        subtopics: [
          { id: "ec-ed-pn-junction-characteristics", label: "P-N Junction & Zener Diode Characteristics", subtopicSlug: "pn-junction", tags: ["depletion-width", "built-in-potential", "zener-breakdown"] },
          { id: "ec-ed-pn-optoelectronics", label: "Optoelectronic Devices (LED, Photodiode, Solar Cell)", subtopicSlug: "optoelectronics", tags: ["led", "photodiode", "solar-cell"] }
        ]
      },
      {
        id: "ec-ed-transistor-physics",
        label: "BJT, MOS Capacitor & MOSFET Physics",
        subjectSlug: "ec-electronic-devices",
        canonicalSubjectSlugs: ["ec-electronic-devices"],
        primaryTopicTag: "mosfet-characteristics",
        secondaryTopicTags: ["bjt-physics", "mos-capacitor", "threshold-voltage", "flatband-voltage", "inversion-layer"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "BJT: structure, operation, current components and characteristics",
          "MOS capacitor: accumulation, depletion, and inversion, C-V characteristics",
          "MOSFET: structure, drain current equations, threshold voltage, channel length modulation"
        ],
        subtopics: [
          { id: "ec-ed-tp-bjt", label: "BJT Physics & Operating Modes", subtopicSlug: "bjt-physics", tags: ["bjt", "current-gain", "base-width-modulation"] },
          { id: "ec-ed-tp-mosfet", label: "MOS Capacitor & MOSFET Physics", subtopicSlug: "mosfet-physics", tags: ["mos-capacitor", "threshold-voltage", "cv-characteristics"] }
        ]
      }
    ]
  },
  {
    id: "ec-ac",
    slug: "ec-analog-circuits",
    canonicalSubjectSlugs: ["ec-analog-circuits"],
    track: "ec" as any,
    label: "Analog Circuits",
    shortLabel: "AC",
    marksRange: "8–10 Marks",
    estimatedHours: 35,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Microelectronic Circuits (Sedra & Smith) / Integrated Electronics (Millman & Halkias)",
    topics: [
      {
        id: "ec-ac-diode-bjt-biasing",
        label: "Diode Circuits & Transistor Biasing",
        subjectSlug: "ec-analog-circuits",
        canonicalSubjectSlugs: ["ec-analog-circuits"],
        primaryTopicTag: "diode-circuits",
        secondaryTopicTags: ["clippers-clampers", "rectifiers", "bjt-biasing", "mosfet-biasing", "small-signal-models"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Diode circuits: clipping, clamping, rectifiers",
          "BJT and MOSFET biasing and bias stability",
          "Small-signal equivalent circuits of diodes and transistors"
        ],
        subtopics: [
          { id: "ec-ac-db-clippers", label: "Clippers, Clampers & Rectifiers", subtopicSlug: "clippers-clampers", tags: ["clipping-circuits", "clamping-circuits", "rectifiers"] },
          { id: "ec-ac-db-biasing", label: "BJT & MOSFET DC Biasing", subtopicSlug: "transistor-biasing", tags: ["bjt-biasing", "mosfet-biasing", "q-point"] }
        ]
      },
      {
        id: "ec-ac-amplifiers",
        label: "BJT & MOSFET Amplifiers & Frequency Response",
        subjectSlug: "ec-analog-circuits",
        canonicalSubjectSlugs: ["ec-analog-circuits"],
        primaryTopicTag: "bjt-amplifiers",
        secondaryTopicTags: ["mosfet-amplifiers", "small-signal-analysis", "frequency-response", "differential-amplifier", "miller-effect"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Single-stage BJT and MOSFET amplifiers: small-signal analysis, gain, impedance",
          "Frequency response of amplifiers, Miller effect, high-frequency cutoff",
          "Differential amplifiers: CMRR, differential and common-mode gain"
        ],
        subtopics: [
          { id: "ec-ac-amp-small-signal", label: "Single-Stage BJT & MOSFET Amplifiers", subtopicSlug: "small-signal-amplifiers", tags: ["common-emitter", "common-source", "voltage-gain"] },
          { id: "ec-ac-amp-diff", label: "Differential Amplifiers & Frequency Response", subtopicSlug: "differential-amplifiers", tags: ["differential-amplifier", "cmrr", "frequency-response"] }
        ]
      },
      {
        id: "ec-ac-opamps",
        label: "Op-Amp Circuits, Active Filters & Oscillators",
        subjectSlug: "ec-analog-circuits",
        canonicalSubjectSlugs: ["ec-analog-circuits"],
        primaryTopicTag: "op-amp-circuits",
        secondaryTopicTags: ["inverting-opamp", "non-inverting-opamp", "active-filters", "oscillators", "555-timer"],
        estimatedHours: 13,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Ideal and non-ideal op-amp characteristics",
          "Linear and nonlinear op-amp circuits: summers, integrators, differentiators, active filters",
          "Sinusoidal oscillators, waveform generators, 555 timer, and voltage regulators"
        ],
        subtopics: [
          { id: "ec-ac-oa-applications", label: "Op-Amp Linear & Non-Linear Circuits", subtopicSlug: "op-amp-circuits", tags: ["inverting-amplifier", "integrator", "comparator", "schmitt-trigger"] },
          { id: "ec-ac-oa-oscillators", label: "Oscillators, Active Filters & Timers", subtopicSlug: "oscillators-timers", tags: ["barkhausen-criterion", "wien-bridge", "555-timer"] }
        ]
      }
    ]
  },
  {
    id: "ec-dc",
    slug: "ec-digital-circuits",
    canonicalSubjectSlugs: ["ec-digital-circuits", "ec-microprocessors"],
    track: "ec" as any,
    label: "Digital Circuits",
    shortLabel: "DC",
    marksRange: "6–9 Marks",
    estimatedHours: 30,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Digital Design (M. Morris Mano)",
    topics: [
      {
        id: "ec-dc-combinational",
        label: "Boolean Algebra & Combinational Circuits",
        subjectSlug: "ec-digital-circuits",
        canonicalSubjectSlugs: ["ec-digital-circuits"],
        primaryTopicTag: "combinational-circuits",
        secondaryTopicTags: ["boolean-minimization", "k-map", "multiplexers", "decoders", "adders", "number-systems"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Number representations and computer arithmetic",
          "Boolean algebra and minimization of functions using Karnaugh maps",
          "Arithmetic circuits, code converters, multiplexers, and decoders"
        ],
        subtopics: [
          { id: "ec-dc-cb-kmap", label: "Boolean Minimization & K-Maps", subtopicSlug: "boolean-minimization", tags: ["k-map", "boolean-algebra", "logic-gates"] },
          { id: "ec-dc-cb-mux", label: "Multiplexers, Decoders & Arithmetic Circuits", subtopicSlug: "mux-decoders", tags: ["multiplexer", "decoder", "full-adder"] }
        ]
      },
      {
        id: "ec-dc-sequential",
        label: "Sequential Circuits & Finite State Machines",
        subjectSlug: "ec-digital-circuits",
        canonicalSubjectSlugs: ["ec-digital-circuits"],
        primaryTopicTag: "sequential-circuits",
        secondaryTopicTags: ["flip-flops", "counters", "shift-registers", "finite-state-machines", "setup-hold-time"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Latches and flip-flops, setup and hold time considerations",
          "Synchronous and asynchronous counters, shift registers",
          "Finite state machines (Mealy and Moore models)"
        ],
        subtopics: [
          { id: "ec-dc-sq-flipflops", label: "Latches, Flip-Flops & Timing", subtopicSlug: "flip-flops", tags: ["flip-flops", "setup-time", "hold-time"] },
          { id: "ec-dc-sq-counters", label: "Counters, Shift Registers & FSMs", subtopicSlug: "counters-fsm", tags: ["counters", "shift-registers", "fsm"] }
        ]
      },
      {
        id: "ec-dc-converters-memory",
        label: "Data Converters, Memories & Microprocessor Architecture",
        subjectSlug: "ec-digital-circuits",
        canonicalSubjectSlugs: ["ec-digital-circuits", "ec-microprocessors"],
        primaryTopicTag: "data-converters",
        secondaryTopicTags: ["adc", "dac", "semiconductor-memories", "microprocessor-8085", "interrupts"],
        estimatedHours: 10,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Sample-and-hold circuits, ADCs (successive approximation, dual slope, flash) and DACs (R-2R, weighted)",
          "Semiconductor memories: ROM, SRAM, DRAM",
          "Basic 8-bit microprocessor architecture (8085 instruction set, addressing modes, interrupts)"
        ],
        subtopics: [
          { id: "ec-dc-cm-adc-dac", label: "A/D & D/A Converters", subtopicSlug: "adc-dac", tags: ["adc", "dac", "r-2r-ladder"] },
          { id: "ec-dc-cm-microprocessor", label: "Memories & 8085 Microprocessor Basics", subtopicSlug: "microprocessor-8085", tags: ["8085", "sram-dram", "interrupts"] }
        ]
      }
    ]
  },
  {
    id: "ec-cs",
    slug: "ec-control-systems",
    canonicalSubjectSlugs: ["ec-control-systems"],
    track: "ec" as any,
    label: "Control Systems",
    shortLabel: "CS",
    marksRange: "7–9 Marks",
    estimatedHours: 32,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Control Systems Engineering (Norman S. Nise / I.J. Nagrath & M. Gopal)",
    topics: [
      {
        id: "ec-cs-modeling-time",
        label: "Block Diagrams, Signal Flow Graphs & Time Response",
        subjectSlug: "ec-control-systems",
        canonicalSubjectSlugs: ["ec-control-systems"],
        primaryTopicTag: "time-domain-analysis",
        secondaryTopicTags: ["block-diagram-reduction", "signal-flow-graphs", "transfer-function", "steady-state-error", "time-domain-specifications"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Transfer functions, block diagram algebra, signal flow graphs and Mason's gain formula",
          "Transient and steady-state analysis of LTI systems",
          "Time domain specifications (rise time, peak overshoot, settling time) and error constants"
        ],
        subtopics: [
          { id: "ec-cs-mt-sfg", label: "Block Diagrams & Signal Flow Graphs", subtopicSlug: "signal-flow-graphs", tags: ["block-diagrams", "masons-gain-formula"] },
          { id: "ec-cs-mt-time-response", label: "Time Response & Steady-State Error", subtopicSlug: "time-response", tags: ["second-order-systems", "peak-overshoot", "error-constants"] }
        ]
      },
      {
        id: "ec-cs-stability-frequency",
        label: "Stability Analysis (Routh, Nyquist, Bode, Root Locus)",
        subjectSlug: "ec-control-systems",
        canonicalSubjectSlugs: ["ec-control-systems"],
        primaryTopicTag: "stability-analysis",
        secondaryTopicTags: ["routh-hurwitz", "root-locus", "bode-plot", "nyquist-criterion", "gain-phase-margin"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Routh-Hurwitz stability criterion and root locus technique",
          "Nyquist stability criterion, encirclement theorem, stability margins",
          "Bode plots, gain margin, phase margin, and resonance specifications"
        ],
        subtopics: [
          { id: "ec-cs-sf-routh-root", label: "Routh-Hurwitz Criterion & Root Locus", subtopicSlug: "routh-root-locus", tags: ["routh-hurwitz", "root-locus"] },
          { id: "ec-cs-sf-bode-nyquist", label: "Bode Plots & Nyquist Stability Criterion", subtopicSlug: "bode-nyquist", tags: ["bode-plots", "nyquist-criterion", "phase-margin"] }
        ]
      },
      {
        id: "ec-cs-state-space-controllers",
        label: "State-Space Analysis, Compensators & Controllers",
        subjectSlug: "ec-control-systems",
        canonicalSubjectSlugs: ["ec-control-systems"],
        primaryTopicTag: "state-variable-analysis",
        secondaryTopicTags: ["state-space-representation", "controllability", "observability", "pid-controllers", "lead-lag-compensators"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "State space representation of LTI systems, state transition matrix",
          "Controllability and observability (Kalman tests)",
          "Lead, lag, and lead-lag compensator design; P, PI, and PID controllers"
        ],
        subtopics: [
          { id: "ec-cs-sc-state-space", label: "State-Space Models & Controllability/Observability", subtopicSlug: "state-space", tags: ["state-transition-matrix", "controllability", "observability"] },
          { id: "ec-cs-sc-compensators", label: "Compensators (Lead/Lag) & PID Controllers", subtopicSlug: "compensators-pid", tags: ["lead-compensator", "lag-compensator", "pid-controller"] }
        ]
      }
    ]
  },
  {
    id: "ec-comm",
    slug: "ec-communication-systems",
    canonicalSubjectSlugs: ["ec-communication-systems"],
    track: "ec" as any,
    label: "Communications",
    shortLabel: "COMM",
    marksRange: "9–12 Marks",
    estimatedHours: 38,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Modern Digital and Analog Communication Systems (B.P. Lathi) / Communication Systems (Simon Haykin)",
    topics: [
      {
        id: "ec-comm-random-noise",
        label: "Random Processes & Noise in Communications",
        subjectSlug: "ec-communication-systems",
        canonicalSubjectSlugs: ["ec-communication-systems"],
        primaryTopicTag: "random-processes",
        secondaryTopicTags: ["white-noise", "power-spectral-density", "autocorrelation", "snr", "filtering-noise"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Autocorrelation and power spectral density of stationary processes",
          "Properties of white noise and transmission through linear systems",
          "Signal-to-noise ratio (SNR) in analog and digital systems"
        ],
        subtopics: [
          { id: "ec-comm-rn-psd", label: "Power Spectral Density & Autocorrelation", subtopicSlug: "psd-autocorrelation", tags: ["autocorrelation", "power-spectral-density"] },
          { id: "ec-comm-rn-noise", label: "White Noise & Narrowband Noise", subtopicSlug: "white-noise", tags: ["white-noise", "noise-figure", "snr"] }
        ]
      },
      {
        id: "ec-comm-analog",
        label: "Analog Communications (AM, FM, PM)",
        subjectSlug: "ec-communication-systems",
        canonicalSubjectSlugs: ["ec-communication-systems"],
        primaryTopicTag: "analog-communication",
        secondaryTopicTags: ["amplitude-modulation", "frequency-modulation", "phase-modulation", "superheterodyne", "demodulation"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Amplitude modulation and demodulation: AM, DSB-SC, SSB, VSB",
          "Angle modulation: frequency modulation (FM), phase modulation (PM), Carson's rule",
          "Superheterodyne receivers, noise analysis in AM and FM systems"
        ],
        subtopics: [
          { id: "ec-comm-an-am", label: "Amplitude Modulation (DSB-SC, SSB, VSB)", subtopicSlug: "amplitude-modulation", tags: ["am", "dsb-sc", "ssb", "modulation-index"] },
          { id: "ec-comm-an-fm", label: "Angle Modulation (FM, PM) & Receivers", subtopicSlug: "angle-modulation", tags: ["fm", "pm", "carsons-rule", "superheterodyne"] }
        ]
      },
      {
        id: "ec-comm-digital",
        label: "Digital Communications & Baseband Transmission",
        subjectSlug: "ec-communication-systems",
        canonicalSubjectSlugs: ["ec-communication-systems"],
        primaryTopicTag: "digital-communication",
        secondaryTopicTags: ["pcm", "dpcm", "matched-filter", "ber", "psk", "qam", "fsk", "ask"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Sampling, quantization, PCM, DPCM, and delta modulation",
          "Digital modulation schemes: ASK, PSK, FSK, QAM, constellation diagrams",
          "Matched filter receivers, optimum reception, and probability of error (BER)"
        ],
        subtopics: [
          { id: "ec-comm-dg-pulse", label: "Pulse Modulation (PCM, DPCM, DM)", subtopicSlug: "pulse-modulation", tags: ["pcm", "dpcm", "quantization-noise"] },
          { id: "ec-comm-dg-bandpass", label: "Bandpass Digital Modulation (BPSK, QPSK, QAM) & Matched Filters", subtopicSlug: "digital-modulation", tags: ["bpsk", "qpsk", "qam", "matched-filter", "ber"] }
        ]
      },
      {
        id: "ec-comm-info-theory",
        label: "Information Theory & Error Control Coding",
        subjectSlug: "ec-communication-systems",
        canonicalSubjectSlugs: ["ec-communication-systems"],
        primaryTopicTag: "information-theory",
        secondaryTopicTags: ["entropy", "channel-capacity", "hamming-codes", "linear-block-codes", "cyclic-codes", "convolutional-codes"],
        estimatedHours: 9,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Entropy, mutual information, and channel capacity theorem (Shannon-Hartley)",
          "Error-control coding: linear block codes, syndrome decoding, Hamming codes",
          "Cyclic codes and basics of convolution codes"
        ],
        subtopics: [
          { id: "ec-comm-it-shannon", label: "Entropy & Shannon Channel Capacity", subtopicSlug: "entropy-capacity", tags: ["entropy", "mutual-information", "channel-capacity"] },
          { id: "ec-comm-it-coding", label: "Linear Block Codes & Hamming Codes", subtopicSlug: "error-control-coding", tags: ["linear-block-codes", "hamming-codes", "syndrome"] }
        ]
      }
    ]
  },
  {
    id: "ec-emag",
    slug: "ec-electromagnetics",
    canonicalSubjectSlugs: ["ec-electromagnetics"],
    track: "ec" as any,
    label: "Electromagnetics",
    shortLabel: "EMAG",
    marksRange: "7–9 Marks",
    estimatedHours: 32,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Principles of Electromagnetics (Matthew N.O. Sadiku) / Antennas (John D. Kraus)",
    topics: [
      {
        id: "ec-emag-maxwell-plane-waves",
        label: "Maxwell's Equations & Plane Waves",
        subjectSlug: "ec-electromagnetics",
        canonicalSubjectSlugs: ["ec-electromagnetics"],
        primaryTopicTag: "maxwells-equations",
        secondaryTopicTags: ["plane-waves", "poynting-vector", "wave-equation", "skin-depth", "polarization", "reflection-refraction"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Maxwell's equations in differential and integral forms, boundary conditions",
          "Wave equation, Poynting vector, and power flow",
          "Plane waves in lossless and lossy media, reflection, refraction, polarization, skin depth"
        ],
        subtopics: [
          { id: "ec-emag-mp-maxwell", label: "Maxwell's Equations & Boundary Conditions", subtopicSlug: "maxwells-equations", tags: ["maxwells-equations", "boundary-conditions", "poynting-vector"] },
          { id: "ec-emag-mp-waves", label: "Uniform Plane Waves, Polarization & Skin Depth", subtopicSlug: "plane-waves", tags: ["plane-waves", "polarization", "skin-depth"] }
        ]
      },
      {
        id: "ec-emag-transmission-lines",
        label: "Transmission Lines & Waveguides",
        subjectSlug: "ec-electromagnetics",
        canonicalSubjectSlugs: ["ec-electromagnetics"],
        primaryTopicTag: "transmission-lines",
        secondaryTopicTags: ["characteristic-impedance", "reflection-coefficient", "swr", "smith-chart", "waveguides", "rectangular-waveguide"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Transmission lines: characteristic impedance, reflection coefficient, VSWR, input impedance",
          "Impedance matching, Smith chart calculations",
          "Rectangular waveguides: TE and TM modes, cut-off frequencies, dispersion relations"
        ],
        subtopics: [
          { id: "ec-emag-tl-lines", label: "Transmission Line Equations & Smith Chart", subtopicSlug: "transmission-lines", tags: ["transmission-lines", "characteristic-impedance", "vswr", "smith-chart"] },
          { id: "ec-emag-tl-waveguides", label: "Rectangular Waveguides (TE & TM Modes)", subtopicSlug: "waveguides", tags: ["rectangular-waveguides", "cutoff-frequency", "phase-velocity"] }
        ]
      },
      {
        id: "ec-emag-antennas",
        label: "Antennas & Radiation",
        subjectSlug: "ec-electromagnetics",
        canonicalSubjectSlugs: ["ec-electromagnetics"],
        primaryTopicTag: "antennas",
        secondaryTopicTags: ["radiation-pattern", "directivity", "antenna-gain", "dipole-antenna", "effective-aperture", "antenna-arrays"],
        estimatedHours: 9,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Dipole antennas, radiation pattern, directivity, antenna gain, effective aperture",
          "Radiation resistance of thin wire antennas",
          "Antenna arrays: array factor, broadside and end-fire arrays"
        ],
        subtopics: [
          { id: "ec-emag-at-parameters", label: "Antenna Parameters (Directivity, Gain, Aperture)", subtopicSlug: "antenna-parameters", tags: ["radiation-pattern", "directivity", "antenna-gain"] },
          { id: "ec-emag-at-dipoles-arrays", label: "Dipole Antennas & Antenna Arrays", subtopicSlug: "antenna-arrays", tags: ["dipole-antenna", "antenna-arrays", "broadside-array"] }
        ]
      }
    ]
  },
  createGeneralAptitudeSubject("ec"),
];
