/**
 * Official GATE ME (Mechanical Engineering) Syllabus Taxonomy
 * 
 * Source: Official GATE Examination Syllabus (IIT Organising Institute, Applicable for GATE 2026 / 2027)
 * Hierarchy: Section (Subject) -> Heading (Topic)
 * Paper Code: ME
 */

import type { SubjectNode } from "./trackerTaxonomy";

export const ME_SUBJECTS: SubjectNode[] = [
  {
    id: "me-em",
    slug: "me-math",
    canonicalSubjectSlugs: ["me-math"],
    track: "me" as any,
    label: "Engineering Mathematics",
    shortLabel: "EM",
    marksRange: "13–15 Marks",
    estimatedHours: 45,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Higher Engineering Mathematics (B.S. Grewal)",
    topics: [
      {
        id: "me-em-linear-algebra",
        label: "Linear Algebra",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "linear-algebra",
        secondaryTopicTags: ["matrix-algebra", "eigenvalues", "eigenvectors", "system-of-equations"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Matrix algebra, systems of linear equations",
          "Eigenvalues and eigenvectors, rank of matrix"
        ],
        subtopics: [
          { id: "me-em-la-matrix", label: "Matrix Operations & Linear Systems", subtopicSlug: "matrix-algebra", tags: ["matrix-algebra", "linear-equations", "rank"] },
          { id: "me-em-la-eigen", label: "Eigenvalues & Eigenvectors", subtopicSlug: "eigenvalues", tags: ["eigenvalues", "eigenvectors"] }
        ]
      },
      {
        id: "me-em-calculus",
        label: "Calculus & Vector Calculus",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "calculus",
        secondaryTopicTags: ["functions-of-single-variable", "mean-value-theorems", "partial-derivatives", "taylor-series", "multiple-integrals", "gradient-divergence-curl"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Functions of single variable, limit, continuity, differentiability, mean value theorems",
          "Definite and improper integrals, partial derivatives, total derivative, Taylor series, maxima and minima",
          "Fourier series, gradient, divergence, curl, line, surface and volume integrals, Gauss, Stokes, Green theorems"
        ],
        subtopics: [
          { id: "me-em-calc-single-multi", label: "Single & Multivariable Calculus", subtopicSlug: "calculus-core", tags: ["mean-value-theorems", "maxima-minima", "multiple-integrals"] },
          { id: "me-em-calc-vector", label: "Vector Calculus & Integral Theorems", subtopicSlug: "vector-calculus", tags: ["gradient", "divergence", "curl", "stokes-theorem", "gauss-theorem"] }
        ]
      },
      {
        id: "me-em-diff-equations",
        label: "Differential Equations & Laplace Transforms",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "differential-equations",
        secondaryTopicTags: ["ode", "euler-cauchy", "laplace-transforms", "heat-wave-laplace-equations"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "First-order equations (linear and nonlinear), higher-order linear ODEs with constant coefficients",
          "Euler-Cauchy equation, initial and boundary value problems",
          "Laplace transforms, solutions of heat, wave, and Laplace's equations"
        ],
        subtopics: [
          { id: "me-em-de-ode", label: "First & Higher-Order ODEs", subtopicSlug: "ode", tags: ["first-order-ode", "higher-order-ode", "euler-cauchy"] },
          { id: "me-em-de-laplace-pde", label: "Laplace Transforms & PDEs (Heat/Wave)", subtopicSlug: "laplace-pde", tags: ["laplace-transforms", "heat-equation", "wave-equation"] }
        ]
      },
      {
        id: "me-em-complex-variables",
        label: "Complex Variables",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "complex-variables",
        secondaryTopicTags: ["analytic-functions", "cauchy-riemann", "residue-theorem", "taylor-laurent-series"],
        estimatedHours: 7,
        weightageTier: "tier-2-medium",
        marksRange: "1–2 Marks",
        keyConcepts: [
          "Analytic functions, Cauchy-Riemann equations",
          "Cauchy's integral theorem and integral formula",
          "Taylor and Laurent series, residue theorem"
        ],
        subtopics: [
          { id: "me-em-cv-analytic-residues", label: "Analytic Functions & Residue Theorem", subtopicSlug: "complex-analysis", tags: ["cauchy-riemann", "residue-theorem"] }
        ]
      },
      {
        id: "me-em-prob-stats",
        label: "Probability and Statistics",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "probability-and-statistics",
        secondaryTopicTags: ["conditional-probability", "random-variables", "normal-distribution", "sampling-theorems"],
        estimatedHours: 7,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Definitions of probability, sampling theorems, conditional probability",
          "Mean, median, mode, standard deviation, random variables",
          "Binomial, Poisson, and normal distributions"
        ],
        subtopics: [
          { id: "me-em-ps-distributions", label: "Probability & Common Distributions", subtopicSlug: "probability-distributions", tags: ["conditional-probability", "normal-distribution", "poisson-distribution"] }
        ]
      },
      {
        id: "me-em-numerical-methods",
        label: "Numerical Methods",
        subjectSlug: "me-math",
        canonicalSubjectSlugs: ["me-math"],
        primaryTopicTag: "numerical-methods",
        secondaryTopicTags: ["newton-raphson", "trapezoidal-rule", "simpsons-rule", "numerical-integration", "ode-solutions"],
        estimatedHours: 6,
        weightageTier: "tier-2-medium",
        marksRange: "1–2 Marks",
        keyConcepts: [
          "Numerical solutions of linear and non-linear algebraic equations",
          "Integration by trapezoidal and Simpson's rules",
          "Single and multi-step methods for differential equations"
        ],
        subtopics: [
          { id: "me-em-nm-integration-ode", label: "Numerical Integration & Solutions of ODEs", subtopicSlug: "numerical-integration-ode", tags: ["newton-raphson", "trapezoidal-rule", "simpsons-rule"] }
        ]
      }
    ]
  },
  {
    id: "me-amd",
    slug: "me-applied-mechanics-and-design",
    canonicalSubjectSlugs: ["me-engineering-mechanics", "me-strength-of-materials", "me-theory-of-machine", "me-machine-design"],
    track: "me" as any,
    label: "Applied Mechanics and Design",
    shortLabel: "AMD",
    marksRange: "26–30 Marks",
    estimatedHours: 75,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Vector Mechanics (Beer & Johnston) / Mechanics of Materials (Gere & Timoshenko) / Theory of Machines (S.S. Rattan) / Machine Design (V.B. Bhandari)",
    topics: [
      {
        id: "me-amd-engineering-mechanics",
        label: "Engineering Mechanics",
        subjectSlug: "me-engineering-mechanics",
        canonicalSubjectSlugs: ["me-engineering-mechanics"],
        primaryTopicTag: "engineering-mechanics",
        secondaryTopicTags: ["free-body-diagrams", "equilibrium", "trusses-and-frames", "friction", "virtual-work", "kinematics", "dynamics", "impulse-momentum"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "4–6 Marks",
        keyConcepts: [
          "Free-body diagrams and equilibrium; trusses and frames; friction and its applications",
          "Virtual work, kinematics and dynamics of rigid bodies in plane motion",
          "Impulse and momentum (linear and angular), energy formulations, Lagrange's equation"
        ],
        subtopics: [
          { id: "me-amd-em-statics", label: "Equilibrium, Trusses & Friction", subtopicSlug: "statics", tags: ["free-body-diagrams", "trusses", "friction"] },
          { id: "me-amd-em-dynamics", label: "Kinematics, Dynamics & Impulse-Momentum", subtopicSlug: "dynamics", tags: ["plane-motion", "impulse-momentum", "virtual-work"] }
        ]
      },
      {
        id: "me-amd-mechanics-of-materials",
        label: "Mechanics of Materials",
        subjectSlug: "me-strength-of-materials",
        canonicalSubjectSlugs: ["me-strength-of-materials"],
        primaryTopicTag: "strength-of-materials",
        secondaryTopicTags: ["stress-strain", "mohr-s-circle", "bending-of-beams", "shear-force-and-bending-moment", "torsion", "euler-column", "thermal-stresses"],
        estimatedHours: 18,
        weightageTier: "tier-1-high",
        marksRange: "6–8 Marks",
        keyConcepts: [
          "Stress and strain, elastic constants, Poisson's ratio, Mohr's circle for plane stress and strain",
          "Shear force and bending moment diagrams, bending and shear stresses, deflection of beams",
          "Torsion of circular shafts, Euler's theory of columns, strain energy methods, thermal stresses"
        ],
        subtopics: [
          { id: "me-amd-mm-stress-strain", label: "Stress-Strain, Mohr's Circle & Cylinders", subtopicSlug: "stress-strain", tags: ["stress-strain", "mohr-s-circle", "thin-cylinders"] },
          { id: "me-amd-mm-beams-columns", label: "Bending, Shear, Torsion & Columns", subtopicSlug: "bending-torsion-columns", tags: ["bending-stresses", "deflection-of-beams", "torsion", "euler-column"] }
        ]
      },
      {
        id: "me-amd-theory-of-machines",
        label: "Theory of Machines",
        subjectSlug: "me-theory-of-machine",
        canonicalSubjectSlugs: ["me-theory-of-machine"],
        primaryTopicTag: "theory-of-machines",
        secondaryTopicTags: ["mechanisms", "velocity-acceleration-analysis", "cams", "gears-and-gear-trains", "flywheels", "governors", "balancing"],
        estimatedHours: 16,
        weightageTier: "tier-1-high",
        marksRange: "5–7 Marks",
        keyConcepts: [
          "Displacement, velocity, and acceleration analysis of plane mechanisms; dynamic analysis of linkages",
          "Cams, gears and gear trains, flywheels and governors",
          "Balancing of reciprocating and rotating masses"
        ],
        subtopics: [
          { id: "me-amd-tm-kinematics", label: "Mechanisms, Velocity & Acceleration Analysis", subtopicSlug: "mechanisms-kinematics", tags: ["linkages", "velocity-acceleration", "slider-crank"] },
          { id: "me-amd-tm-gears-balancing", label: "Gears, Cams, Flywheels & Balancing", subtopicSlug: "gears-cams-balancing", tags: ["gears-and-gear-trains", "cams", "flywheels", "balancing"] }
        ]
      },
      {
        id: "me-amd-vibrations",
        label: "Vibrations",
        subjectSlug: "me-theory-of-machine",
        canonicalSubjectSlugs: ["me-theory-of-machine"],
        primaryTopicTag: "mechanical-vibrations",
        secondaryTopicTags: ["free-vibration", "forced-vibration", "damping", "vibration-isolation", "resonance", "whirling-of-shafts"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Free and forced vibration of single degree of freedom systems",
          "Effect of damping, vibration isolation, resonance",
          "Critical speeds of shafts (whirling)"
        ],
        subtopics: [
          { id: "me-amd-vb-free-forced", label: "Free & Forced Single-DOF Vibrations", subtopicSlug: "sdof-vibrations", tags: ["free-vibration", "forced-vibration", "resonance"] },
          { id: "me-amd-vb-damping-whirling", label: "Damping, Isolation & Critical Speeds", subtopicSlug: "damping-isolation", tags: ["damping", "vibration-isolation", "critical-speeds"] }
        ]
      },
      {
        id: "me-amd-machine-design",
        label: "Machine Design",
        subjectSlug: "me-machine-design",
        canonicalSubjectSlugs: ["me-machine-design"],
        primaryTopicTag: "machine-design",
        secondaryTopicTags: ["failure-theories", "fatigue-strength", "s-n-diagram", "bolted-welded-joints", "bearings", "gears", "springs", "clutches-brakes"],
        estimatedHours: 15,
        weightageTier: "tier-1-high",
        marksRange: "5–7 Marks",
        keyConcepts: [
          "Design for static and dynamic loading; failure theories, fatigue strength and S-N diagram",
          "Design of machine elements: bolted, riveted and welded joints, shafts, gears",
          "Rolling and sliding contact bearings, brakes and clutches, springs"
        ],
        subtopics: [
          { id: "me-amd-md-fatigue-theories", label: "Failure Theories & Fatigue (S-N Diagram)", subtopicSlug: "failure-theories-fatigue", tags: ["failure-theories", "fatigue-strength", "s-n-diagram"] },
          { id: "me-amd-md-elements", label: "Design of Machine Elements (Joints, Shafts, Bearings)", subtopicSlug: "machine-elements", tags: ["bolted-welded-joints", "bearings", "shafts", "brakes-clutches", "springs"] }
        ]
      }
    ]
  },
  {
    id: "me-fmts",
    slug: "me-fluid-mechanics-and-thermal-sciences",
    canonicalSubjectSlugs: ["me-fluid-mechanics", "me-heat-transfer", "me-thermodynamics", "me-refrigeration-and-air-conditioning"],
    track: "me" as any,
    label: "Fluid Mechanics and Thermal Sciences",
    shortLabel: "FMTS",
    marksRange: "26–30 Marks",
    estimatedHours: 80,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Fluid Mechanics (Cengel & Cimbala) / Heat and Mass Transfer (Incropera) / Engineering Thermodynamics (P.K. Nag)",
    topics: [
      {
        id: "me-fmts-fluid-mechanics",
        label: "Fluid Mechanics",
        subjectSlug: "me-fluid-mechanics",
        canonicalSubjectSlugs: ["me-fluid-mechanics"],
        primaryTopicTag: "fluid-mechanics",
        secondaryTopicTags: ["fluid-statics", "buoyancy", "bernoulli-equation", "navier-stokes", "dimensional-analysis", "boundary-layer", "pipe-flow"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "7–9 Marks",
        keyConcepts: [
          "Fluid properties, fluid statics, buoyancy and stability of floating bodies",
          "Control-volume analysis: continuity, momentum, energy, Navier-Stokes, Bernoulli's equation",
          "Dimensional analysis, viscous flow of incompressible fluids, boundary layer, flow through pipes"
        ],
        subtopics: [
          { id: "me-fmts-fm-statics-dynamics", label: "Fluid Statics, Kinematics & Bernoulli Equation", subtopicSlug: "fluid-statics-dynamics", tags: ["fluid-statics", "bernoulli-equation", "continuity"] },
          { id: "me-fmts-fm-viscous-boundary", label: "Viscous Flow, Boundary Layer & Pipe Flow", subtopicSlug: "viscous-pipe-flow", tags: ["boundary-layer", "flow-through-pipes", "dimensional-analysis"] }
        ]
      },
      {
        id: "me-fmts-heat-transfer",
        label: "Heat-Transfer",
        subjectSlug: "me-heat-transfer",
        canonicalSubjectSlugs: ["me-heat-transfer"],
        primaryTopicTag: "heat-transfer",
        secondaryTopicTags: ["conduction", "fins", "lumped-capacitance", "convection", "heat-exchangers", "radiation", "stefan-boltzmann"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "6–8 Marks",
        keyConcepts: [
          "Modes of heat transfer: one-dimensional conduction, fin concepts, lumped parameter system",
          "Free and forced convective heat transfer, boundary layers, heat exchanger performance (LMTD and NTU)",
          "Radiative heat transfer: Stefan-Boltzmann law, view factors, black and grey surface radiation"
        ],
        subtopics: [
          { id: "me-fmts-ht-conduction-fins", label: "Conduction & Unsteady Heat Transfer (Fins)", subtopicSlug: "conduction-fins", tags: ["conduction", "fins", "lumped-parameter"] },
          { id: "me-fmts-ht-convection-radiation", label: "Convection, Heat Exchangers & Radiation", subtopicSlug: "convection-radiation", tags: ["convection", "heat-exchanger", "radiation"] }
        ]
      },
      {
        id: "me-fmts-thermodynamics",
        label: "Thermodynamics",
        subjectSlug: "me-thermodynamics",
        canonicalSubjectSlugs: ["me-thermodynamics"],
        primaryTopicTag: "thermodynamics",
        secondaryTopicTags: ["first-law", "second-law", "entropy", "availability", "pure-substances", "thermodynamic-cycles"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "6–8 Marks",
        keyConcepts: [
          "Thermodynamic systems, processes, properties of pure substances, ideal and real gases",
          "Zeroth, first and second laws of thermodynamics, work and heat calculations",
          "Entropy, irreversibility and availability, thermodynamic property relations, cycles (Carnot, Rankine, Brayton)"
        ],
        subtopics: [
          { id: "me-fmts-th-laws", label: "First & Second Laws, Entropy & Availability", subtopicSlug: "laws-of-thermodynamics", tags: ["first-law", "second-law", "entropy", "availability"] },
          { id: "me-fmts-th-properties-cycles", label: "Pure Substances & Gas/Vapor Power Cycles", subtopicSlug: "pure-substances-cycles", tags: ["steam-tables", "rankine-cycle", "brayton-cycle"] }
        ]
      },
      {
        id: "me-fmts-thermal-applications",
        label: "Applications: Power Engineering, IC Engines, Turbomachinery & RAC",
        subjectSlug: "me-refrigeration-and-air-conditioning",
        canonicalSubjectSlugs: ["me-refrigeration-and-air-conditioning", "me-thermodynamics"],
        primaryTopicTag: "refrigeration-and-air-conditioning",
        secondaryTopicTags: ["refrigeration-cycles", "psychrometry", "ic-engines", "turbomachinery", "steam-turbines", "gas-turbines", "pumps-compressors"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "6–8 Marks",
        keyConcepts: [
          "Power Engineering: steam generators, steam and gas turbines, Rankine cycle modifications",
          "Internal Combustion Engines: SI and CI engines, performance characteristics, air standard cycles",
          "Turbomachinery: Pelton wheel, Francis and Kaplan turbines, centrifugal and axial pumps/compressors",
          "Refrigeration and Air-Conditioning: Vapour compression cycle, psychrometry and psychrometric charts"
        ],
        subtopics: [
          { id: "me-fmts-app-rac", label: "Refrigeration Cycles & Psychrometric Processes", subtopicSlug: "rac-psychrometry", tags: ["vapor-compression", "psychrometric-process", "cop"] },
          { id: "me-fmts-app-turbomachinery-ic", label: "Turbomachinery, Power Engineering & IC Engines", subtopicSlug: "turbomachinery-ic-engines", tags: ["ic-engines", "steam-turbines", "pumps", "turbines"] }
        ]
      }
    ]
  },
  {
    id: "me-mmie",
    slug: "me-materials-manufacturing-and-industrial-engineering",
    canonicalSubjectSlugs: ["me-manufacturing-engineering", "me-industrial-engineering"],
    track: "me" as any,
    label: "Materials, Manufacturing and Industrial Engineering",
    shortLabel: "MMIE",
    marksRange: "24–28 Marks",
    estimatedHours: 70,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Materials Science and Engineering (William D. Callister) / Manufacturing Science (Ghosh & Mallik) / Operations Research (Taha)",
    topics: [
      {
        id: "me-mmie-engineering-materials",
        label: "Engineering Materials",
        subjectSlug: "me-manufacturing-engineering",
        canonicalSubjectSlugs: ["me-manufacturing-engineering"],
        primaryTopicTag: "engineering-materials",
        secondaryTopicTags: ["crystal-structure", "phase-diagrams", "iron-carbon-diagram", "heat-treatment", "stress-strain-curves"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Structure and properties of engineering materials, phase diagrams (iron-carbon system)",
          "Heat treatment of steels, stress-strain diagrams for engineering materials",
          "Crystal structure, imperfections, diffusion, solid solutions, strengthening mechanisms"
        ],
        subtopics: [
          { id: "me-mmie-em-phase-diagrams", label: "Crystal Structure & Phase Diagrams (Fe-C)", subtopicSlug: "phase-diagrams", tags: ["crystal-structure", "iron-carbon-diagram", "phase-diagrams"] },
          { id: "me-mmie-em-heat-treatment", label: "Heat Treatment & Mechanical Properties", subtopicSlug: "heat-treatment", tags: ["heat-treatment", "annealing", "strengthening-mechanisms"] }
        ]
      },
      {
        id: "me-mmie-casting-forming-joining",
        label: "Casting, Forming and Joining Processes",
        subjectSlug: "me-manufacturing-engineering",
        canonicalSubjectSlugs: ["me-manufacturing-engineering"],
        primaryTopicTag: "casting-forming-joining",
        secondaryTopicTags: ["casting-process", "riser-gating-design", "metal-forming", "rolling-forging-extrusion", "sheet-metal-operations", "welding-processes"],
        estimatedHours: 15,
        weightageTier: "tier-1-high",
        marksRange: "5–7 Marks",
        keyConcepts: [
          "Casting: patterns, moulds, cores, risers and gating design; casting solidification",
          "Metal forming: rolling, forging, extrusion, wire drawing, sheet metal operations (punching, blanking)",
          "Welding processes: arc, gas, TIG, MIG, resistance welding, weld quality and defect testing"
        ],
        subtopics: [
          { id: "me-mmie-cfj-casting", label: "Casting Design, Riser & Gating Calculations", subtopicSlug: "casting", tags: ["casting-process", "riser-design", "chvorinov-rule"] },
          { id: "me-mmie-cfj-forming-welding", label: "Metal Forming Operations & Welding Processes", subtopicSlug: "forming-welding", tags: ["forming-process", "sheet-metal", "welding"] }
        ]
      },
      {
        id: "me-mmie-machining-machine-tools",
        label: "Machining and Machine Tool Operations",
        subjectSlug: "me-manufacturing-engineering",
        canonicalSubjectSlugs: ["me-manufacturing-engineering"],
        primaryTopicTag: "machining-and-machine-tools",
        secondaryTopicTags: ["mechanics-of-machining", "merchants-circle", "taylors-tool-life", "cutting-forces", "non-traditional-machining", "jigs-and-fixtures"],
        estimatedHours: 15,
        weightageTier: "tier-1-high",
        marksRange: "5–7 Marks",
        keyConcepts: [
          "Mechanics of machining: orthogonal cutting, cutting forces, Merchant's circle analysis",
          "Tool life and wear: Taylor's tool life equation, economics of machining",
          "Non-traditional machining processes (EDM, ECM, USM, LBM), jigs and fixtures"
        ],
        subtopics: [
          { id: "me-mmie-mmt-cutting-mechanics", label: "Mechanics of Cutting & Tool Life (Merchant, Taylor)", subtopicSlug: "cutting-mechanics", tags: ["merchants-circle", "taylors-tool-life", "orthogonal-cutting"] },
          { id: "me-mmie-mmt-advanced-machining", label: "Non-Traditional Machining & Machine Tools", subtopicSlug: "non-traditional-machining", tags: ["edm", "ecm", "usm", "jigs-fixtures"] }
        ]
      },
      {
        id: "me-mmie-metrology-cim",
        label: "Metrology, Inspection & Computer Integrated Manufacturing",
        subjectSlug: "me-manufacturing-engineering",
        canonicalSubjectSlugs: ["me-manufacturing-engineering"],
        primaryTopicTag: "metrology-and-inspection",
        secondaryTopicTags: ["limits-fits-tolerances", "gauges", "surface-finish", "cmm", "cad-cam", "cnc-machining", "part-programming"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Limits, fits, and tolerances; linear and angular measurements, comparators, gauge design (Go/No-Go)",
          "Surface finish measurement, coordinate measuring machines (CMM)",
          "CAD/CAM, additive manufacturing (3D printing), NC, CNC and DNC technologies, CNC part programming"
        ],
        subtopics: [
          { id: "me-mmie-mc-metrology", label: "Limits, Fits, Tolerances & Surface Finish", subtopicSlug: "metrology-tolerances", tags: ["limits-fits-tolerances", "gauge-design", "surface-finish"] },
          { id: "me-mmie-mc-cim", label: "CAD/CAM, CNC Part Programming & Additive Manufacturing", subtopicSlug: "cad-cam-cnc", tags: ["cad-cam", "cnc-programming", "additive-manufacturing"] }
        ]
      },
      {
        id: "me-mmie-ppc-operations-research",
        label: "Production Planning, Control & Operations Research",
        subjectSlug: "me-industrial-engineering",
        canonicalSubjectSlugs: ["me-industrial-engineering"],
        primaryTopicTag: "industrial-engineering",
        secondaryTopicTags: ["forecasting", "inventory-control", "eoq", "mrp", "linear-programming", "simplex-method", "transportation-model", "pert-cpm"],
        estimatedHours: 18,
        weightageTier: "tier-1-high",
        marksRange: "6–8 Marks",
        keyConcepts: [
          "Forecasting models, aggregate production planning, line balancing, scheduling",
          "Inventory control models: deterministic (EOQ) and probabilistic, safety stock, MRP, ERP",
          "Operations Research: linear programming, simplex method, transportation, assignment models, queuing models, PERT/CPM"
        ],
        subtopics: [
          { id: "me-mmie-po-ppc", label: "Forecasting, Inventory Control (EOQ) & Scheduling", subtopicSlug: "inventory-forecasting", tags: ["forecasting", "inventory-control", "eoq", "mrp"] },
          { id: "me-mmie-po-or", label: "Linear Programming (Simplex) & Project Networks (PERT/CPM)", subtopicSlug: "linear-programming-pert-cpm", tags: ["linear-programming", "simplex", "pert-and-cpm", "transportation-model"] }
        ]
      }
    ]
  }
];
