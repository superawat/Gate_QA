/**
 * Official GATE EE (Electrical Engineering) Syllabus Taxonomy
 * 
 * Source: Official GATE Examination Syllabus (IIT Organising Institute, Applicable for GATE 2026 / 2027)
 * Hierarchy: Section (Subject) -> Heading (Topic)
 * Paper Code: EE
 */

import type { SubjectNode } from "./trackerTaxonomy";

export const EE_SUBJECTS: SubjectNode[] = [
  {
    id: "ee-em",
    slug: "ee-math",
    canonicalSubjectSlugs: ["ee-math"],
    track: "ee" as any,
    label: "Engineering Mathematics",
    shortLabel: "EM",
    marksRange: "13–15 Marks",
    estimatedHours: 45,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Higher Engineering Mathematics (B.S. Grewal)",
    topics: [
      {
        id: "ee-em-linear-algebra",
        label: "Linear Algebra",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "linear-algebra",
        secondaryTopicTags: ["matrix-algebra", "eigenvalues", "eigenvectors", "system-of-equations"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Matrix Algebra, systems of linear equations",
          "Eigenvalues and eigenvectors, rank of matrix, Cayley-Hamilton theorem"
        ],
        subtopics: [
          { id: "ee-em-la-matrices", label: "Matrices & Systems of Linear Equations", subtopicSlug: "linear-equations", tags: ["matrix-algebra", "linear-equations", "rank"] },
          { id: "ee-em-la-eigenvalues", label: "Eigenvalues, Eigenvectors & Cayley-Hamilton", subtopicSlug: "eigenvalues", tags: ["eigenvalues", "eigenvectors", "cayley-hamilton"] }
        ]
      },
      {
        id: "ee-em-calculus",
        label: "Calculus",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "calculus",
        secondaryTopicTags: ["mean-value-theorems", "multiple-integrals", "partial-derivatives", "maxima-minima", "fourier-series", "vector-calculus"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Mean value theorems, theorems of integral calculus, definite and improper integrals",
          "Partial derivatives, maxima and minima, multiple integrals, Fourier series",
          "Vector identities, directional derivatives, line, surface and volume integrals, Stokes's, Gauss's and Green's theorems"
        ],
        subtopics: [
          { id: "ee-em-calc-single-multi", label: "Mean Value Theorems & Multiple Integrals", subtopicSlug: "mean-value-integrals", tags: ["mean-value-theorems", "multiple-integrals"] },
          { id: "ee-em-calc-vector", label: "Vector Calculus & Integral Theorems", subtopicSlug: "vector-calculus", tags: ["gradient", "divergence", "curl", "stokes-theorem"] }
        ]
      },
      {
        id: "ee-em-diff-equations",
        label: "Differential Equations",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "differential-equations",
        secondaryTopicTags: ["ode", "first-order-ode", "higher-order-ode", "cauchy-euler", "partial-differential-equations"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "First-order equations (linear and nonlinear)",
          "Higher-order linear differential equations with constant coefficients",
          "Method of variation of parameters, Cauchy's and Euler's equations, partial differential equations"
        ],
        subtopics: [
          { id: "ee-em-de-ode", label: "Linear & Non-linear ODEs", subtopicSlug: "ode", tags: ["first-order-ode", "higher-order-ode", "cauchy-euler"] },
          { id: "ee-em-de-pde", label: "Initial & Boundary Value Problems & PDEs", subtopicSlug: "pde", tags: ["pde", "boundary-value-problems"] }
        ]
      },
      {
        id: "ee-em-complex-variables",
        label: "Complex Variables",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "complex-variables",
        secondaryTopicTags: ["analytic-functions", "cauchy-riemann", "residue-theorem", "laurent-series"],
        estimatedHours: 7,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Analytic functions, Cauchy-Riemann equations",
          "Cauchy's integral theorem, integral formula",
          "Taylor's and Laurent's series, residue theorem"
        ],
        subtopics: [
          { id: "ee-em-cv-analytic", label: "Analytic Functions & Cauchy-Riemann Equations", subtopicSlug: "analytic-functions", tags: ["analytic-functions", "cauchy-riemann"] },
          { id: "ee-em-cv-residue", label: "Cauchy Integrals & Residue Theorem", subtopicSlug: "residue-theorem", tags: ["cauchy-integral-formula", "residue-theorem"] }
        ]
      },
      {
        id: "ee-em-prob-stats",
        label: "Probability and Statistics",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "probability-and-statistics",
        secondaryTopicTags: ["probability", "conditional-probability", "random-variables", "normal-distribution", "sampling-theorems"],
        estimatedHours: 7,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Sampling theorems, conditional probability, mean, median, mode, standard deviation",
          "Random variables, binomial, Poisson, and normal distributions"
        ],
        subtopics: [
          { id: "ee-em-ps-probability", label: "Probability & Random Variables", subtopicSlug: "probability", tags: ["conditional-probability", "random-variables", "bayes-theorem"] },
          { id: "ee-em-ps-distributions", label: "Probability Distributions", subtopicSlug: "distributions", tags: ["normal-distribution", "poisson-distribution", "binomial-distribution"] }
        ]
      },
      {
        id: "ee-em-numerical-methods",
        label: "Numerical Methods",
        subjectSlug: "ee-math",
        canonicalSubjectSlugs: ["ee-math"],
        primaryTopicTag: "numerical-methods",
        secondaryTopicTags: ["newton-raphson", "trapezoidal-rule", "simpsons-rule", "runge-kutta"],
        estimatedHours: 6,
        weightageTier: "tier-2-medium",
        marksRange: "1–2 Marks",
        keyConcepts: [
          "Solutions of nonlinear algebraic equations (Newton-Raphson, bisection)",
          "Integration by trapezoidal and Simpson's rules",
          "Single and multi-step methods for differential equations"
        ],
        subtopics: [
          { id: "ee-em-nm-roots", label: "Root Finding & Numerical Integration", subtopicSlug: "root-finding-integration", tags: ["newton-raphson", "trapezoidal-rule", "simpsons-rule"] },
          { id: "ee-em-nm-ode", label: "Numerical Solutions of ODEs", subtopicSlug: "numerical-ode", tags: ["euler-method", "runge-kutta"] }
        ]
      }
    ]
  },
  {
    id: "ee-ec",
    slug: "ee-electric-circuits",
    canonicalSubjectSlugs: ["ee-electric-circuits"],
    track: "ee" as any,
    label: "Electric Circuits",
    shortLabel: "EC",
    marksRange: "8–10 Marks",
    estimatedHours: 35,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Fundamentals of Electric Circuits (Alexander & Sadiku)",
    topics: [
      {
        id: "ee-ec-circuit-analysis",
        label: "Network Analysis & Theorems",
        subjectSlug: "ee-electric-circuits",
        canonicalSubjectSlugs: ["ee-electric-circuits"],
        primaryTopicTag: "network-theorems",
        secondaryTopicTags: ["kvl-kcl", "node-mesh-analysis", "thevenin", "norton", "superposition", "maximum-power-transfer"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Network graph, KVL, KCL, node and mesh analysis",
          "Network theorems: superposition, Thevenin's, Norton's, maximum power transfer",
          "Star-delta transformation"
        ],
        subtopics: [
          { id: "ee-ec-ca-basic-laws", label: "KVL, KCL, Node & Mesh Analysis", subtopicSlug: "kvl-kcl", tags: ["kvl", "kcl", "mesh-analysis", "nodal-analysis"] },
          { id: "ee-ec-ca-theorems", label: "Thevenin, Norton & Superposition Theorems", subtopicSlug: "theorems", tags: ["thevenin", "norton", "superposition", "maximum-power-transfer"] }
        ]
      },
      {
        id: "ee-ec-transient-resonance",
        label: "Transient Response, AC Circuits & Resonance",
        subjectSlug: "ee-electric-circuits",
        canonicalSubjectSlugs: ["ee-electric-circuits"],
        primaryTopicTag: "transient-analysis",
        secondaryTopicTags: ["rc-rl-rlc-circuits", "resonance", "sinusoidal-steady-state", "phasor-analysis", "quality-factor"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Transient response of DC and AC networks (RL, RC, RLC circuits)",
          "Sinusoidal steady-state analysis, phasor representations",
          "Series and parallel resonance, bandwidth, quality factor"
        ],
        subtopics: [
          { id: "ee-ec-tr-transients", label: "Transient Response in First & Second Order Circuits", subtopicSlug: "transients", tags: ["transient-response", "rl-circuit", "rc-circuit", "rlc-circuit"] },
          { id: "ee-ec-tr-resonance", label: "AC Steady-State Analysis & Resonance", subtopicSlug: "resonance", tags: ["sinusoidal-steady-state", "resonance", "quality-factor"] }
        ]
      },
      {
        id: "ee-ec-two-port-three-phase",
        label: "Two-Port Networks & Three-Phase Circuits",
        subjectSlug: "ee-electric-circuits",
        canonicalSubjectSlugs: ["ee-electric-circuits"],
        primaryTopicTag: "two-port-networks",
        secondaryTopicTags: ["two-port-parameters", "magnetically-coupled-circuits", "three-phase-power", "two-wattmeter-method"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Two-port network parameters: Z, Y, ABCD, h parameters",
          "Magnetically coupled circuits, dot convention, mutual inductance",
          "Three-phase balanced and unbalanced circuits, power and power factor measurement in two-wattmeter method"
        ],
        subtopics: [
          { id: "ee-ec-tp-twoport", label: "Two-Port Networks & Mutual Inductance", subtopicSlug: "two-port", tags: ["two-port-parameters", "mutual-inductance", "coupled-circuits"] },
          { id: "ee-ec-tp-three-phase", label: "Three-Phase Circuits & Two-Wattmeter Method", subtopicSlug: "three-phase", tags: ["three-phase-circuits", "two-wattmeter-method", "power-factor"] }
        ]
      }
    ]
  },
  {
    id: "ee-emf",
    slug: "ee-electromagnetic-fields",
    canonicalSubjectSlugs: ["ee-electromagnetic-fields", "ee-electromagnetic-theory"],
    track: "ee" as any,
    label: "Electromagnetic Fields",
    shortLabel: "EMF",
    marksRange: "3–5 Marks",
    estimatedHours: 20,
    weightageTier: "tier-2-medium",
    recommendedTextbook: "Principles of Electromagnetics (Matthew N.O. Sadiku)",
    topics: [
      {
        id: "ee-emf-electrostatics",
        label: "Electrostatics & Dielectric Boundary Conditions",
        subjectSlug: "ee-electromagnetic-fields",
        canonicalSubjectSlugs: ["ee-electromagnetic-fields", "ee-electromagnetic-theory"],
        primaryTopicTag: "electrostatics",
        secondaryTopicTags: ["coulombs-law", "gauss-law", "electric-flux-density", "divergence", "dielectric-boundary-conditions", "capacitance"],
        estimatedHours: 10,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Coulomb's Law, electric field intensity, electric flux density, Gauss's Law, divergence",
          "Electric potential, energy stored in electric fields",
          "Boundary conditions at dielectric interfaces, capacitance"
        ],
        subtopics: [
          { id: "ee-emf-es-gauss", label: "Coulomb's Law, Gauss's Law & Electric Potential", subtopicSlug: "gauss-law", tags: ["coulombs-law", "gauss-law", "electric-potential"] },
          { id: "ee-emf-es-boundary", label: "Boundary Conditions & Energy Storage", subtopicSlug: "boundary-conditions", tags: ["boundary-conditions", "dielectric", "energy-storage"] }
        ]
      },
      {
        id: "ee-emf-magnetostatics-maxwell",
        label: "Magnetostatics, Maxwell's Equations & Poynting Vector",
        subjectSlug: "ee-electromagnetic-fields",
        canonicalSubjectSlugs: ["ee-electromagnetic-fields", "ee-electromagnetic-theory"],
        primaryTopicTag: "magnetostatics",
        secondaryTopicTags: ["biot-savart-law", "amperes-law", "faradays-law", "maxwells-equations", "poynting-vector", "lorentz-force"],
        estimatedHours: 10,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Biot-Savart's Law, Ampere's Law, curl, Faraday's Law of induction, Lorentz force",
          "Maxwell's equations, Poynting vector",
          "Self and mutual inductances in simple geometries"
        ],
        subtopics: [
          { id: "ee-emf-ms-biot-ampere", label: "Biot-Savart Law, Ampere's Law & Inductance", subtopicSlug: "biot-savart-ampere", tags: ["biot-savart-law", "amperes-law", "inductance"] },
          { id: "ee-emf-ms-maxwell", label: "Faraday's Law, Maxwell's Equations & Poynting Vector", subtopicSlug: "maxwells-equations", tags: ["faradays-law", "maxwells-equations", "poynting-vector"] }
        ]
      }
    ]
  },
  {
    id: "ee-ss",
    slug: "ee-signals-and-systems",
    canonicalSubjectSlugs: ["ee-signals-and-systems"],
    track: "ee" as any,
    label: "Signals and Systems",
    shortLabel: "SS",
    marksRange: "6–8 Marks",
    estimatedHours: 28,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Signals and Systems (Oppenheim & Willsky)",
    topics: [
      {
        id: "ee-ss-representation-lti",
        label: "Representation of Signals & LTI Systems",
        subjectSlug: "ee-signals-and-systems",
        canonicalSubjectSlugs: ["ee-signals-and-systems"],
        primaryTopicTag: "signals-and-systems",
        secondaryTopicTags: ["continuous-discrete-signals", "lti-systems", "impulse-response", "convolution"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Representation of continuous and discrete-time signals, shifting and scaling",
          "Linear Time Invariant (LTI) systems, impulse response, step response",
          "Convolution integral and convolution sum"
        ],
        subtopics: [
          { id: "ee-ss-rl-signals", label: "Continuous & Discrete Time Signals", subtopicSlug: "signals-classification", tags: ["signal-properties", "shifting-scaling"] },
          { id: "ee-ss-rl-lti", label: "LTI Systems & Convolution", subtopicSlug: "lti-convolution", tags: ["lti-systems", "impulse-response", "convolution"] }
        ]
      },
      {
        id: "ee-ss-transforms-sampling",
        label: "Fourier Series, Transforms, Laplace, Z & Sampling",
        subjectSlug: "ee-signals-and-systems",
        canonicalSubjectSlugs: ["ee-signals-and-systems"],
        primaryTopicTag: "fourier-transform",
        secondaryTopicTags: ["fourier-series", "laplace-transform", "z-transform", "sampling-theorem"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Fourier series and Fourier transform analysis",
          "Laplace transform, Z-transform, ROC and inverse transforms",
          "Sampling theorem and signal reconstruction"
        ],
        subtopics: [
          { id: "ee-ss-ts-fourier", label: "Fourier Series & Fourier Transforms", subtopicSlug: "fourier-transforms", tags: ["fourier-series", "fourier-transform"] },
          { id: "ee-ss-ts-laplace-z", label: "Laplace Transform, Z-Transform & Sampling Theorem", subtopicSlug: "laplace-z-sampling", tags: ["laplace-transform", "z-transform", "sampling-theorem"] }
        ]
      }
    ]
  },
  {
    id: "ee-emach",
    slug: "ee-electrical-machines",
    canonicalSubjectSlugs: ["ee-electrical-machines"],
    track: "ee" as any,
    label: "Electrical Machines",
    shortLabel: "EMACH",
    marksRange: "10–12 Marks",
    estimatedHours: 42,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Generalized Theory of Electrical Machines (P.S. Bimbhra)",
    topics: [
      {
        id: "ee-emach-transformers",
        label: "Single-Phase and Three-Phase Transformers",
        subjectSlug: "ee-electrical-machines",
        canonicalSubjectSlugs: ["ee-electrical-machines"],
        primaryTopicTag: "transformers",
        secondaryTopicTags: ["single-phase-transformer", "equivalent-circuit", "phasor-diagram", "oc-sc-tests", "voltage-regulation", "auto-transformer", "three-phase-transformer"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Single-phase transformer: equivalent circuit, phasor diagram, OC and SC tests, regulation and efficiency",
          "Auto-transformer, parallel operation",
          "Three-phase transformers: connections, parallel operation, vector groups"
        ],
        subtopics: [
          { id: "ee-emach-tr-single-phase", label: "Single-Phase Transformer Equivalent Circuit & Tests", subtopicSlug: "single-phase-transformer", tags: ["equivalent-circuit", "oc-sc-tests", "voltage-regulation"] },
          { id: "ee-emach-tr-three-phase", label: "Auto-Transformers & Three-Phase Transformers", subtopicSlug: "three-phase-transformer", tags: ["auto-transformer", "three-phase-connections", "parallel-operation"] }
        ]
      },
      {
        id: "ee-emach-dc-machines",
        label: "DC Machines",
        subjectSlug: "ee-electrical-machines",
        canonicalSubjectSlugs: ["ee-electrical-machines"],
        primaryTopicTag: "dc-machines",
        secondaryTopicTags: ["dc-generator", "dc-motor", "armature-reaction", "commutation", "speed-control", "starting-methods", "losses-efficiency"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "DC machine types, armature winding, EMF and torque equations",
          "Armature reaction and commutation",
          "DC motor characteristics, starting and speed control methods, losses and efficiency"
        ],
        subtopics: [
          { id: "ee-emach-dc-performance", label: "DC Generator & Motor Characteristics", subtopicSlug: "dc-motor-generator", tags: ["dc-generator", "dc-motor", "armature-reaction"] },
          { id: "ee-emach-dc-control", label: "Speed Control & Starting of DC Motors", subtopicSlug: "dc-speed-control", tags: ["speed-control", "starting-methods", "ward-leonard"] }
        ]
      },
      {
        id: "ee-emach-induction-synchronous",
        label: "Induction Machines & Synchronous Machines",
        subjectSlug: "ee-electrical-machines",
        canonicalSubjectSlugs: ["ee-electrical-machines"],
        primaryTopicTag: "induction-machines",
        secondaryTopicTags: ["three-phase-induction-motor", "torque-slip-characteristics", "synchronous-machine", "v-curves", "voltage-regulation", "fractional-kw-motors"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Three-phase induction motor: principle, equivalent circuit, torque-speed characteristics, starting, speed control",
          "Synchronous machines: cylindrical and salient pole rotors, voltage regulation, parallel operation, V and inverted V curves",
          "Fractional kW motors: single-phase induction motors, stepper motors, reluctance motors"
        ],
        subtopics: [
          { id: "ee-emach-is-induction", label: "Three-Phase Induction Motor Operation & Control", subtopicSlug: "three-phase-induction-motor", tags: ["torque-speed", "no-load-blocked-rotor", "speed-control"] },
          { id: "ee-emach-is-synchronous", label: "Synchronous Generator, Motor & Special Motors", subtopicSlug: "synchronous-machines", tags: ["salient-pole", "v-curves", "stepper-motor", "reluctance-motor"] }
        ]
      }
    ]
  },
  {
    id: "ee-ps",
    slug: "ee-power-systems",
    canonicalSubjectSlugs: ["ee-power-systems"],
    track: "ee" as any,
    label: "Power Systems",
    shortLabel: "PS",
    marksRange: "10–12 Marks",
    estimatedHours: 42,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Modern Power System Analysis (D.P. Kothari & I.J. Nagrath / C.L. Wadhwa)",
    topics: [
      {
        id: "ee-ps-transmission-flow",
        label: "Transmission Line Models, Corona & Load Flow Analysis",
        subjectSlug: "ee-power-systems",
        canonicalSubjectSlugs: ["ee-power-systems"],
        primaryTopicTag: "transmission-lines",
        secondaryTopicTags: ["transmission-parameters", "ferranti-effect", "corona", "per-unit-system", "load-flow", "gauss-seidel", "newton-raphson"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Transmission line models and parameters, line performance (sag, Ferranti effect, corona)",
          "Per-unit system and bus admittance matrix (Y-bus)",
          "Gauss-Seidel and Newton-Raphson load flow methods"
        ],
        subtopics: [
          { id: "ee-ps-tf-lines", label: "Transmission Line Models & Performance", subtopicSlug: "line-performance", tags: ["transmission-line-parameters", "ferranti-effect", "corona"] },
          { id: "ee-ps-tf-load-flow", label: "Per-Unit System & Load Flow Analysis", subtopicSlug: "load-flow-analysis", tags: ["per-unit", "y-bus", "gauss-seidel", "newton-raphson"] }
        ]
      },
      {
        id: "ee-ps-fault-analysis",
        label: "Symmetrical & Unsymmetrical Fault Analysis",
        subjectSlug: "ee-power-systems",
        canonicalSubjectSlugs: ["ee-power-systems"],
        primaryTopicTag: "fault-analysis",
        secondaryTopicTags: ["symmetrical-faults", "unsymmetrical-faults", "symmetrical-components", "sequence-networks", "lg-fault", "ll-fault", "llg-fault"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Symmetrical components, positive, negative, and zero sequence networks",
          "Symmetrical three-phase faults",
          "Unsymmetrical faults: LG, LL, and LLG faults and their sequence connections"
        ],
        subtopics: [
          { id: "ee-ps-fa-symmetrical", label: "Symmetrical Three-Phase Faults", subtopicSlug: "symmetrical-faults", tags: ["three-phase-fault", "subtransient-reactance"] },
          { id: "ee-ps-fa-unsymmetrical", label: "Unsymmetrical Faults & Sequence Networks", subtopicSlug: "unsymmetrical-faults", tags: ["symmetrical-components", "sequence-networks", "lg-fault"] }
        ]
      },
      {
        id: "ee-ps-stability-protection",
        label: "Power System Stability, Control & Protection",
        subjectSlug: "ee-power-systems",
        canonicalSubjectSlugs: ["ee-power-systems"],
        primaryTopicTag: "power-system-stability",
        secondaryTopicTags: ["swing-equation", "equal-area-criterion", "relays", "circuit-breakers", "differential-protection", "distance-protection"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Power system stability: swing equation, equal area criterion, critical clearing angle",
          "Voltage and frequency control, economic dispatch",
          "Protection: overcurrent, differential, and distance relays, circuit breakers, lightning arresters"
        ],
        subtopics: [
          { id: "ee-ps-sp-stability", label: "Swing Equation & Equal Area Criterion", subtopicSlug: "stability", tags: ["swing-equation", "equal-area-criterion", "critical-clearing-time"] },
          { id: "ee-ps-sp-protection", label: "Protection Relays & Circuit Breakers", subtopicSlug: "protection", tags: ["differential-relay", "distance-relay", "circuit-breaker"] }
        ]
      }
    ]
  },
  {
    id: "ee-cs",
    slug: "ee-control-systems",
    canonicalSubjectSlugs: ["ee-control-systems"],
    track: "ee" as any,
    label: "Control Systems",
    shortLabel: "CS",
    marksRange: "8–10 Marks",
    estimatedHours: 35,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Control Systems Engineering (I.J. Nagrath & M. Gopal)",
    topics: [
      {
        id: "ee-cs-modeling-time",
        label: "Modeling, Block Diagrams & Time Response",
        subjectSlug: "ee-control-systems",
        canonicalSubjectSlugs: ["ee-control-systems"],
        primaryTopicTag: "time-domain-analysis",
        secondaryTopicTags: ["block-diagram-reduction", "signal-flow-graphs", "steady-state-error", "error-constants", "second-order-systems"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Mathematical modeling and transfer functions",
          "Block diagrams and signal flow graphs, Mason's gain formula",
          "Transient and steady-state analysis of LTI systems, time response specifications, steady-state error"
        ],
        subtopics: [
          { id: "ee-cs-mt-representation", label: "Block Diagrams & Signal Flow Graphs", subtopicSlug: "signal-flow-graphs", tags: ["transfer-function", "masons-gain-formula"] },
          { id: "ee-cs-mt-time-response", label: "Time Response & Steady-State Error", subtopicSlug: "time-response", tags: ["time-response", "steady-state-error"] }
        ]
      },
      {
        id: "ee-cs-stability-frequency",
        label: "Stability Criteria, Root Locus, Nyquist & Bode",
        subjectSlug: "ee-control-systems",
        canonicalSubjectSlugs: ["ee-control-systems"],
        primaryTopicTag: "stability-analysis",
        secondaryTopicTags: ["routh-hurwitz", "root-locus", "nyquist-criterion", "bode-plot", "gain-phase-margin"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Routh-Hurwitz and Nyquist stability criteria",
          "Root loci construction and analysis",
          "Bode plots, gain margin and phase margin"
        ],
        subtopics: [
          { id: "ee-cs-sf-routh-root", label: "Routh-Hurwitz Criterion & Root Locus", subtopicSlug: "routh-root-locus", tags: ["routh-hurwitz", "root-locus"] },
          { id: "ee-cs-sf-bode-nyquist", label: "Nyquist Criterion & Bode Plots", subtopicSlug: "bode-nyquist", tags: ["bode-plots", "nyquist-criterion", "gain-margin", "phase-margin"] }
        ]
      },
      {
        id: "ee-cs-state-space-controllers",
        label: "State-Space Representation, Compensators & PID",
        subjectSlug: "ee-control-systems",
        canonicalSubjectSlugs: ["ee-control-systems"],
        primaryTopicTag: "state-variable-analysis",
        secondaryTopicTags: ["state-space-representation", "controllability", "observability", "lead-lag-compensators", "pid-controllers"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "State-space representation of LTI systems, state transition matrix",
          "Controllability and observability",
          "Lag, lead, and lag-lead compensators, P, PI, and PID controllers"
        ],
        subtopics: [
          { id: "ee-cs-sc-state-space", label: "State-Space Representation & Controllability", subtopicSlug: "state-space", tags: ["state-space", "controllability", "observability"] },
          { id: "ee-cs-sc-compensators", label: "Compensator Design & PID Controllers", subtopicSlug: "compensators-pid", tags: ["lead-compensator", "lag-compensator", "pid-controller"] }
        ]
      }
    ]
  },
  {
    id: "ee-eem",
    slug: "ee-electrical-and-electronic-measurements",
    canonicalSubjectSlugs: ["ee-electrical-and-electronic-measurements"],
    track: "ee" as any,
    label: "Electrical and Electronic Measurements",
    shortLabel: "EEM",
    marksRange: "4–6 Marks",
    estimatedHours: 24,
    weightageTier: "tier-2-medium",
    recommendedTextbook: "A Course in Electrical and Electronic Measurements (A.K. Sawhney)",
    topics: [
      {
        id: "ee-eem-bridges-meters",
        label: "Bridges, Potentiometers & Analog Meters",
        subjectSlug: "ee-electrical-and-electronic-measurements",
        canonicalSubjectSlugs: ["ee-electrical-and-electronic-measurements"],
        primaryTopicTag: "bridges-and-potentiometers",
        secondaryTopicTags: ["wheatstone-bridge", "maxwell-bridge", "schering-bridge", "potentiometers", "pmmc", "moving-iron"],
        estimatedHours: 12,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Bridges and potentiometers for measurement of resistance, inductance, and capacitance",
          "PMMC, moving iron, and dynamometer instruments: measurement of voltage, current, power, and energy",
          "Extension of instrument ranges using shunts and multipliers"
        ],
        subtopics: [
          { id: "ee-eem-bm-bridges", label: "AC & DC Bridges and Potentiometers", subtopicSlug: "bridges", tags: ["wheatstone-bridge", "maxwell-bridge", "schering-bridge"] },
          { id: "ee-eem-bm-meters", label: "PMMC, Moving Iron & Wattmeters", subtopicSlug: "analog-meters", tags: ["pmmc", "moving-iron", "dynamometer", "wattmeter"] }
        ]
      },
      {
        id: "ee-eem-transformers-cro-digital",
        label: "Instrument Transformers, Digital Meters, CRO & Error Analysis",
        subjectSlug: "ee-electrical-and-electronic-measurements",
        canonicalSubjectSlugs: ["ee-electrical-and-electronic-measurements"],
        primaryTopicTag: "instrument-transformers",
        secondaryTopicTags: ["current-transformer", "potential-transformer", "oscilloscopes", "digital-multimeters", "error-analysis"],
        estimatedHours: 12,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Instrument transformers: CT and PT ratio and phase angle errors",
          "Digital voltmeters and multimeters, phase, time, and frequency measurement",
          "Cathode ray oscilloscopes (CRO), error analysis and limiting errors"
        ],
        subtopics: [
          { id: "ee-eem-tc-ct-pt", label: "Instrument Transformers (CT & PT)", subtopicSlug: "ct-pt", tags: ["current-transformer", "potential-transformer", "ratio-error"] },
          { id: "ee-eem-tc-cro-digital", label: "CRO, Digital Meters & Error Analysis", subtopicSlug: "cro-error-analysis", tags: ["oscilloscope", "limiting-errors", "digital-voltmeter"] }
        ]
      }
    ]
  },
  {
    id: "ee-ade",
    slug: "ee-analog-and-digital-electronics",
    canonicalSubjectSlugs: ["ee-analog-electronics", "ee-digital-electronics"],
    track: "ee" as any,
    label: "Analog and Digital Electronics",
    shortLabel: "ADE",
    marksRange: "6–8 Marks",
    estimatedHours: 32,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Integrated Electronics (Millman & Halkias) / Digital Logic and Computer Design (M. Morris Mano)",
    topics: [
      {
        id: "ee-ade-analog-circuits",
        label: "Diodes, Transistor Amplifiers & Op-Amps",
        subjectSlug: "ee-analog-electronics",
        canonicalSubjectSlugs: ["ee-analog-electronics"],
        primaryTopicTag: "analog-electronics",
        secondaryTopicTags: ["diode-circuits", "bjt-amplifiers", "mosfet-amplifiers", "op-amp-circuits", "active-filters", "oscillators"],
        estimatedHours: 16,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Simple diode circuits, clipping and clamping, rectifiers",
          "BJT, JFET, and MOSFET amplifiers: biasing, small-signal analysis, frequency response",
          "Operational amplifiers: characteristics and applications (summers, integrators, active filters, oscillators)"
        ],
        subtopics: [
          { id: "ee-ade-ac-diodes-bjt", label: "Diode Circuits & Transistor Amplifiers", subtopicSlug: "diode-bjt", tags: ["clippers", "rectifiers", "bjt-amplifiers"] },
          { id: "ee-ade-ac-opamps", label: "Op-Amp Linear & Non-Linear Circuits", subtopicSlug: "opamp-applications", tags: ["inverting-amplifier", "integrator", "active-filters"] }
        ]
      },
      {
        id: "ee-ade-digital-circuits",
        label: "Combinational, Sequential Logic & Microprocessor 8085",
        subjectSlug: "ee-digital-electronics",
        canonicalSubjectSlugs: ["ee-digital-electronics"],
        primaryTopicTag: "digital-electronics",
        secondaryTopicTags: ["boolean-algebra", "combinational-circuits", "sequential-circuits", "flip-flops", "counters", "microprocessor-8085", "adc-dac"],
        estimatedHours: 16,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Combinational logic circuits: Boolean algebra, multiplexers, demultiplexers, encoders, decoders, adders",
          "Sequential logic circuits: latches, flip-flops, counters, shift registers",
          "Microprocessor 8085 architecture and basics, ADCs and DACs"
        ],
        subtopics: [
          { id: "ee-ade-dc-combinational", label: "Boolean Algebra, Multiplexers & Decoders", subtopicSlug: "combinational-logic", tags: ["boolean-algebra", "multiplexers", "decoders"] },
          { id: "ee-ade-dc-sequential-uP", label: "Sequential Circuits, ADCs & 8085 Microprocessor", subtopicSlug: "sequential-microprocessor", tags: ["flip-flops", "counters", "8085", "adc", "dac"] }
        ]
      }
    ]
  },
  {
    id: "ee-pe",
    slug: "ee-power-electronics",
    canonicalSubjectSlugs: ["ee-power-electronics"],
    track: "ee" as any,
    label: "Power Electronics",
    shortLabel: "PE",
    marksRange: "8–10 Marks",
    estimatedHours: 35,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Power Electronics (P.S. Bimbhra / M.H. Rashid)",
    topics: [
      {
        id: "ee-pe-switches-rectifiers",
        label: "Power Switches & Phase Controlled Rectifiers",
        subjectSlug: "ee-power-electronics",
        canonicalSubjectSlugs: ["ee-power-electronics"],
        primaryTopicTag: "power-electronics",
        secondaryTopicTags: ["thyristor", "scr", "mosfet", "igbt", "phase-controlled-rectifiers", "firing-circuits", "line-commutated-converters"],
        estimatedHours: 17,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Power semiconductor switches: diode, thyristor, MOSFET, IGBT (characteristics, firing and commutation)",
          "Single-phase and three-phase phase-controlled rectifiers (semi-converters and full converters)",
          "Performance parameters: harmonic distortion, power factor, ripple factor"
        ],
        subtopics: [
          { id: "ee-pe-sr-switches", label: "Power Semiconductor Switches (SCR, MOSFET, IGBT)", subtopicSlug: "power-switches", tags: ["thyristor", "firing-circuits", "igbt"] },
          { id: "ee-pe-sr-rectifiers", label: "Phase-Controlled Rectifiers (1-Phase & 3-Phase)", subtopicSlug: "controlled-rectifiers", tags: ["single-phase-converter", "three-phase-converter", "line-commutation"] }
        ]
      },
      {
        id: "ee-pe-choppers-inverters",
        label: "DC-to-DC Converters (Choppers) & Inverters",
        subjectSlug: "ee-power-electronics",
        canonicalSubjectSlugs: ["ee-power-electronics"],
        primaryTopicTag: "choppers-and-inverters",
        secondaryTopicTags: ["buck-converter", "boost-converter", "buck-boost-converter", "voltage-source-inverters", "pwm", "spwm"],
        estimatedHours: 18,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "DC-to-DC converters: buck, boost, and buck-boost chopper topologies in continuous/discontinuous conduction",
          "Inverters: single-phase and three-phase voltage source inverters",
          "Sinusoidal pulse width modulation (SPWM) and harmonic reduction techniques"
        ],
        subtopics: [
          { id: "ee-pe-ci-choppers", label: "DC-to-DC Converters (Buck, Boost, Buck-Boost)", subtopicSlug: "choppers", tags: ["buck-converter", "boost-converter", "buck-boost"] },
          { id: "ee-pe-ci-inverters", label: "Voltage Source Inverters & PWM Modulation", subtopicSlug: "inverters", tags: ["vsi", "spwm", "harmonics"] }
        ]
      }
    ]
  }
];
