/**
 * Official GATE CE (Civil Engineering) Syllabus Taxonomy
 * 
 * Source: Official GATE Examination Syllabus (IIT Organising Institute, Applicable for GATE 2026 / 2027)
 * Hierarchy: Section (Subject) -> Heading (Topic)
 * Paper Code: CE
 */

import type { SubjectNode } from "./trackerTaxonomy";

export const CE_SUBJECTS: SubjectNode[] = [
  {
    id: "ce-em",
    slug: "ce-math",
    canonicalSubjectSlugs: ["ce-math"],
    track: "ce" as any,
    label: "Engineering Mathematics",
    shortLabel: "EM",
    marksRange: "13–15 Marks",
    estimatedHours: 45,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Higher Engineering Mathematics (B.S. Grewal)",
    topics: [
      {
        id: "ce-em-linear-algebra",
        label: "Linear Algebra",
        subjectSlug: "ce-math",
        canonicalSubjectSlugs: ["ce-math"],
        primaryTopicTag: "linear-algebra",
        secondaryTopicTags: ["matrix-algebra", "eigenvalues", "eigenvectors", "system-of-equations", "rank"],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Matrix algebra, systems of linear equations",
          "Eigenvalues and eigenvectors, rank of matrix"
        ],
        subtopics: [
          { id: "ce-em-la-matrix", label: "Matrix Operations & Linear Systems", subtopicSlug: "matrix-algebra", tags: ["matrix-algebra", "linear-equations", "rank"] },
          { id: "ce-em-la-eigen", label: "Eigenvalues & Eigenvectors", subtopicSlug: "eigenvalues", tags: ["eigenvalues", "eigenvectors"] }
        ]
      },
      {
        id: "ce-em-calculus",
        label: "Calculus & Vector Calculus",
        subjectSlug: "ce-math",
        canonicalSubjectSlugs: ["ce-math"],
        primaryTopicTag: "calculus",
        secondaryTopicTags: ["single-variable-calculus", "mean-value-theorems", "taylor-series", "definite-integrals", "partial-derivatives", "gradient-divergence-curl"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Functions of single variable, limit, continuity, differentiability, mean value theorems, Taylor series",
          "Definite and improper integrals, area and volume calculations, partial derivatives, total derivatives",
          "Gradient, divergence, curl, directional derivatives, line, surface and volume integrals"
        ],
        subtopics: [
          { id: "ce-em-calc-single-multi", label: "Single & Multivariable Calculus", subtopicSlug: "calculus-core", tags: ["mean-value-theorems", "definite-integrals", "partial-derivatives"] },
          { id: "ce-em-calc-vector", label: "Vector Calculus & Integral Theorems", subtopicSlug: "vector-calculus", tags: ["gradient", "divergence", "curl", "line-surface-integrals"] }
        ]
      },
      {
        id: "ce-em-diff-equations",
        label: "Ordinary & Partial Differential Equations",
        subjectSlug: "ce-math",
        canonicalSubjectSlugs: ["ce-math"],
        primaryTopicTag: "differential-equations",
        secondaryTopicTags: ["ode", "euler-cauchy", "pde", "fourier-series", "wave-laplace-diffusion-equations"],
        estimatedHours: 9,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "First-order ODEs (linear and non-linear), higher-order linear ODEs with constant coefficients",
          "Euler-Cauchy equations, initial and boundary value problems",
          "PDEs: Fourier series, separation of variables, solutions of 1D diffusion and wave equations, 2D Laplace equation"
        ],
        subtopics: [
          { id: "ce-em-de-ode", label: "First & Higher-Order ODEs", subtopicSlug: "ode", tags: ["first-order-ode", "higher-order-ode", "euler-cauchy"] },
          { id: "ce-em-de-pde", label: "Partial Differential Equations (Wave, Heat, Laplace)", subtopicSlug: "pde", tags: ["fourier-series", "pde", "separation-of-variables"] }
        ]
      },
      {
        id: "ce-em-prob-stats",
        label: "Probability and Statistics",
        subjectSlug: "ce-math",
        canonicalSubjectSlugs: ["ce-math"],
        primaryTopicTag: "probability-and-statistics",
        secondaryTopicTags: ["sampling-theorems", "conditional-probability", "descriptive-statistics", "poisson-distribution", "normal-distribution", "linear-regression"],
        estimatedHours: 7,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Sampling theorems, conditional probability, mean, median, mode, standard deviation",
          "Discrete and continuous random variables (Poisson and normal distributions)",
          "Linear regression analysis"
        ],
        subtopics: [
          { id: "ce-em-ps-distributions", label: "Probability, Distributions & Regression", subtopicSlug: "probability-distributions", tags: ["conditional-probability", "normal-distribution", "linear-regression"] }
        ]
      },
      {
        id: "ce-em-numerical-methods",
        label: "Numerical Methods",
        subjectSlug: "ce-math",
        canonicalSubjectSlugs: ["ce-math"],
        primaryTopicTag: "numerical-methods",
        secondaryTopicTags: ["error-analysis", "newton-raphson", "lagrange-polynomials", "numerical-integration", "trapezoidal-simpson"],
        estimatedHours: 6,
        weightageTier: "tier-2-medium",
        marksRange: "1–2 Marks",
        keyConcepts: [
          "Error analysis, numerical solutions of linear and non-linear algebraic equations",
          "Newton's and Lagrange polynomials, numerical differentiation",
          "Integration by trapezoidal and Simpson's rules, single and multi-step methods for ODEs"
        ],
        subtopics: [
          { id: "ce-em-nm-integration-ode", label: "Root Finding, Interpolation & Numerical Integration", subtopicSlug: "numerical-methods-core", tags: ["newton-raphson", "trapezoidal-rule", "simpsons-rule"] }
        ]
      }
    ]
  },
  {
    id: "ce-se",
    slug: "ce-structural-engineering",
    canonicalSubjectSlugs: ["ce-engineering-mechanics", "ce-solid-mechanics", "ce-structural-analysis", "ce-rcc-structures", "ce-design-of-steel-structures", "ce-construction-materials-and-management"],
    track: "ce" as any,
    label: "Structural Engineering",
    shortLabel: "SE",
    marksRange: "23–26 Marks",
    estimatedHours: 72,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Strength of Materials (Gere & Timoshenko) / Basic Structural Analysis (C.S. Reddy) / Reinforced Concrete Design (Pillai & Menon) / Steel Structures (S.K. Duggal)",
    topics: [
      {
        id: "ce-se-engineering-mechanics",
        label: "Engineering Mechanics",
        subjectSlug: "ce-engineering-mechanics",
        canonicalSubjectSlugs: ["ce-engineering-mechanics"],
        primaryTopicTag: "engineering-mechanics",
        secondaryTopicTags: ["system-of-forces", "free-body-diagrams", "equilibrium-equations", "friction", "centre-of-mass", "sdof-vibrations"],
        estimatedHours: 10,
        weightageTier: "tier-1-high",
        marksRange: "2–4 Marks",
        keyConcepts: [
          "System of forces, free-body diagrams, equilibrium equations",
          "Internal forces in structures, friction and applications, centre of mass",
          "Free vibrations of undamped single-degree-of-freedom (SDOF) systems"
        ],
        subtopics: [
          { id: "ce-se-em-equilibrium", label: "Force Systems, Equilibrium & Friction", subtopicSlug: "equilibrium-friction", tags: ["free-body-diagrams", "friction", "centre-of-mass"] },
          { id: "ce-se-em-vibrations", label: "Internal Forces & SDOF Undamped Vibrations", subtopicSlug: "sdof-vibrations", tags: ["internal-forces", "undamped-vibrations", "sdof"] }
        ]
      },
      {
        id: "ce-se-solid-mechanics",
        label: "Solid Mechanics",
        subjectSlug: "ce-solid-mechanics",
        canonicalSubjectSlugs: ["ce-solid-mechanics"],
        primaryTopicTag: "solid-mechanics",
        secondaryTopicTags: ["bending-moment-shear-force", "stress-and-strain", "simple-bending-theory", "shear-centre", "torsion", "mohrs-circle", "column-buckling"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "4–6 Marks",
        keyConcepts: [
          "Bending moment and shear force in statically determinate beams",
          "Simple stress and strain relationships, simple bending theory, flexural and shear stresses, shear centre",
          "Uniform torsion, transformation of stress (Mohr's circle), combined stresses, Euler's column buckling"
        ],
        subtopics: [
          { id: "ce-se-sm-bending-shear", label: "SFD, BMD, Bending & Shear Stresses", subtopicSlug: "sfd-bmd-stresses", tags: ["bending-and-shear-stresses", "shear-force", "bending-moment"] },
          { id: "ce-se-sm-mohr-torsion-columns", label: "Mohr's Circle, Torsion & Column Buckling", subtopicSlug: "mohr-torsion-columns", tags: ["principal-stress", "uniform-torsion", "column-buckling"] }
        ]
      },
      {
        id: "ce-se-structural-analysis",
        label: "Structural Analysis",
        subjectSlug: "ce-structural-analysis",
        canonicalSubjectSlugs: ["ce-structural-analysis"],
        primaryTopicTag: "structural-analysis",
        secondaryTopicTags: ["determinate-structures", "indeterminate-structures", "virtual-work", "moment-distribution-method", "slope-deflection-method", "influence-lines", "matrix-method"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "4–6 Marks",
        keyConcepts: [
          "Work and energy methods (virtual work, Castigliano's theorem), deflections of determinate beams, frames and trusses",
          "Analysis of indeterminate structures: force and displacement methods (slope-deflection, moment distribution)",
          "Influence lines and moving loads for beams and trusses, stiffness matrix method"
        ],
        subtopics: [
          { id: "ce-se-sa-determinate-energy", label: "Deflections & Energy Methods (Castigliano, Virtual Work)", subtopicSlug: "energy-methods-deflection", tags: ["virtual-work", "castigliano", "deflections"] },
          { id: "ce-se-sa-indeterminate-ild", label: "Indeterminate Analysis (Slope-Deflection, MDM) & Influence Lines", subtopicSlug: "indeterminate-ild", tags: ["slope-deflection", "moment-distribution", "influence-lines", "matrix-method"] }
        ]
      },
      {
        id: "ce-se-construction-materials",
        label: "Construction Materials and Management",
        subjectSlug: "ce-construction-materials-and-management",
        canonicalSubjectSlugs: ["ce-construction-materials-and-management"],
        primaryTopicTag: "construction-materials-and-management",
        secondaryTopicTags: ["concrete-technology", "bricks-stones-timber", "cpm-pert", "project-planning", "construction-management"],
        estimatedHours: 8,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Properties and testing of construction materials: cement, aggregates, concrete, bricks, timber",
          "Concrete mix design, curing, durability",
          "Project planning and network analysis: CPM and PERT"
        ],
        subtopics: [
          { id: "ce-se-cm-materials", label: "Concrete Technology & Building Materials", subtopicSlug: "building-materials", tags: ["concrete-technology", "cement-aggregates", "timber"] },
          { id: "ce-se-cm-cpm-pert", label: "Construction Project Management (CPM/PERT)", subtopicSlug: "cpm-pert-management", tags: ["cpm", "pert", "project-planning"] }
        ]
      },
      {
        id: "ce-se-concrete-structures",
        label: "Concrete Structures",
        subjectSlug: "ce-rcc-structures",
        canonicalSubjectSlugs: ["ce-rcc-structures"],
        primaryTopicTag: "rcc-structures",
        secondaryTopicTags: ["limit-state-design", "working-stress-method", "design-of-beams-slabs-columns", "footings", "bond-development-length", "prestressed-concrete"],
        estimatedHours: 14,
        weightageTier: "tier-1-high",
        marksRange: "4–6 Marks",
        keyConcepts: [
          "Working stress and limit state design concepts (IS 456)",
          "Design and detailing of singly and doubly reinforced beams, slabs, columns, and isolated footings",
          "Bond, anchorage, and development length; prestressed concrete concepts and losses"
        ],
        subtopics: [
          { id: "ce-se-cs-limit-state", label: "Limit State Design of Beams, Slabs & Columns", subtopicSlug: "limit-state-beams-columns", tags: ["beams-slabs-columns", "shear-torsion", "development-length"] },
          { id: "ce-se-cs-prestressed", label: "Prestressed Concrete Principles & Losses", subtopicSlug: "prestressed-concrete", tags: ["prestressed-concrete", "prestress-losses"] }
        ]
      },
      {
        id: "ce-se-steel-structures",
        label: "Steel Structures",
        subjectSlug: "ce-design-of-steel-structures",
        canonicalSubjectSlugs: ["ce-design-of-steel-structures"],
        primaryTopicTag: "design-of-steel-structures",
        secondaryTopicTags: ["tension-members", "compression-members", "beams-and-beam-columns", "connections-bolted-welded", "plastic-analysis", "plate-girders"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Working stress and limit state design concepts (IS 800)",
          "Design of bolted and welded connections (simple and eccentric)",
          "Design of tension and compression members, beams, beam-columns, and column bases",
          "Plastic analysis of beams and portal frames, shape factor, collapse mechanism"
        ],
        subtopics: [
          { id: "ce-se-ss-members-connections", label: "Design of Tension, Compression Members & Connections", subtopicSlug: "tension-compression-connections", tags: ["tension-member", "compression-member", "bolted-welded-connections"] },
          { id: "ce-se-ss-plastic-analysis", label: "Plastic Analysis of Beams & Frames", subtopicSlug: "plastic-analysis-beams", tags: ["plastic-analysis", "shape-factor", "collapse-load"] }
        ]
      }
    ]
  },
  {
    id: "ce-ge",
    slug: "ce-geotechnical-engineering",
    canonicalSubjectSlugs: ["ce-geotechnical-engineering"],
    track: "ce" as any,
    label: "Geotechnical Engineering",
    shortLabel: "GE",
    marksRange: "13–16 Marks",
    estimatedHours: 45,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Basic and Applied Soil Mechanics (Gopal Ranjan & A.S.R. Rao) / Soil Mechanics (K.R. Arora)",
    topics: [
      {
        id: "ce-ge-soil-mechanics",
        label: "Soil Mechanics",
        subjectSlug: "ce-geotechnical-engineering",
        canonicalSubjectSlugs: ["ce-geotechnical-engineering"],
        primaryTopicTag: "soil-mechanics",
        secondaryTopicTags: ["three-phase-system", "index-properties", "soil-classification", "permeability", "seepage", "effective-stress", "consolidation", "compaction", "shear-strength", "earth-pressure", "slope-stability"],
        estimatedHours: 24,
        weightageTier: "tier-1-high",
        marksRange: "7–9 Marks",
        keyConcepts: [
          "Three-phase system, index properties, Indian standard soil classification system",
          "Permeability, seepage, flow nets, effective stress principle, quicksand condition",
          "Compaction, one-dimensional consolidation (Terzaghi's theory), settlement calculation",
          "Shear strength (Mohr-Coulomb criterion, triaxial tests), earth pressure theories (Rankine, Coulomb), slope stability"
        ],
        subtopics: [
          { id: "ce-ge-sm-properties-seepage", label: "Index Properties, Permeability & Seepage", subtopicSlug: "soil-properties-seepage", tags: ["three-phase-system", "permeability", "effective-stress", "seepage"] },
          { id: "ce-ge-sm-consolidation-shear", label: "Consolidation, Compaction, Shear Strength & Earth Pressure", subtopicSlug: "consolidation-shear-strength", tags: ["consolidation", "shear-strength", "earth-pressure", "slope-stability"] }
        ]
      },
      {
        id: "ce-ge-foundation-engineering",
        label: "Foundation Engineering",
        subjectSlug: "ce-geotechnical-engineering",
        canonicalSubjectSlugs: ["ce-geotechnical-engineering"],
        primaryTopicTag: "foundation-engineering",
        secondaryTopicTags: ["shallow-foundations", "terzaghi-bearing-capacity", "meyerhof-bearing-capacity", "water-table-effect", "pile-foundations", "pile-capacity", "negative-skin-friction"],
        estimatedHours: 21,
        weightageTier: "tier-1-high",
        marksRange: "6–7 Marks",
        keyConcepts: [
          "Sub-surface investigation, standard penetration test (SPT)",
          "Shallow foundations: Terzaghi's and Meyerhof's bearing capacity theories, effect of water table, immediate and consolidation settlement",
          "Deep foundations: pile capacity equations (static and dynamic), pile load tests, group efficiency, settlement of pile groups, negative skin friction"
        ],
        subtopics: [
          { id: "ce-ge-fe-shallow", label: "Shallow Foundations & Bearing Capacity (Terzaghi, Meyerhof)", subtopicSlug: "shallow-foundations", tags: ["terzaghi-bearing-capacity", "water-table-effect", "settlement"] },
          { id: "ce-ge-fe-deep-piles", label: "Deep Foundations (Pile Capacity & Group Action)", subtopicSlug: "deep-pile-foundations", tags: ["pile-capacity", "pile-group-action", "negative-skin-friction"] }
        ]
      }
    ]
  },
  {
    id: "ce-wre",
    slug: "ce-water-resources-engineering",
    canonicalSubjectSlugs: ["ce-fluid-mechanics-and-hydraulics", "ce-engineering-hydrology", "ce-irrigation-engineering"],
    track: "ce" as any,
    label: "Water Resources Engineering",
    shortLabel: "WRE",
    marksRange: "10–12 Marks",
    estimatedHours: 38,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Fluid Mechanics (Modi & Seth) / Engineering Hydrology (K. Subramanya) / Irrigation Engineering (S.K. Garg)",
    topics: [
      {
        id: "ce-wre-fluid-mechanics-hydraulics",
        label: "Fluid Mechanics & Hydraulics",
        subjectSlug: "ce-fluid-mechanics-and-hydraulics",
        canonicalSubjectSlugs: ["ce-fluid-mechanics-and-hydraulics"],
        primaryTopicTag: "fluid-mechanics-and-hydraulics",
        secondaryTopicTags: ["fluid-statics", "continuity-momentum-energy", "pipe-flow", "friction-factor", "open-channel-flow", "specific-energy", "hydraulic-jump", "dimensional-analysis"],
        estimatedHours: 16,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Properties of fluids, fluid statics, kinematics of fluid flow",
          "Continuity, momentum, and energy equations; pipe flow, friction factor, minor and major losses",
          "Open channel flow: specific energy, critical flow, hydraulic jump, gradually varied flow profile, dimensional analysis"
        ],
        subtopics: [
          { id: "ce-wre-fm-pipe-flow", label: "Fluid Statics & Flow Through Pipes", subtopicSlug: "fluid-pipe-flow", tags: ["fluid-statics", "bernoulli", "flow-through-pipes", "losses-in-pipes"] },
          { id: "ce-wre-fm-open-channel", label: "Open Channel Flow, Specific Energy & Hydraulic Jump", subtopicSlug: "open-channel-flow", tags: ["open-channel-flow", "specific-energy", "hydraulic-jump"] }
        ]
      },
      {
        id: "ce-wre-hydrology",
        label: "Hydrology",
        subjectSlug: "ce-engineering-hydrology",
        canonicalSubjectSlugs: ["ce-engineering-hydrology"],
        primaryTopicTag: "engineering-hydrology",
        secondaryTopicTags: ["hydrologic-cycle", "precipitation", "evaporation", "unit-hydrograph", "flood-routing", "reservoir-capacity", "groundwater-hydrology"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Hydrologic cycle, precipitation measurement, evaporation and evapotranspiration estimation, infiltration indices",
          "Unit hydrograph theory, S-curve hydrograph, flood estimation and flood routing",
          "Reservoir capacity estimation, steady-state well hydraulics (Theis, Dupuit assumptions)"
        ],
        subtopics: [
          { id: "ce-wre-hy-precipitation-runoff", label: "Precipitation, Infiltration & Hydrographs", subtopicSlug: "precipitation-hydrographs", tags: ["precipitation", "infiltration-indices", "unit-hydrograph"] },
          { id: "ce-wre-hy-flood-groundwater", label: "Flood Routing, Reservoir Capacity & Well Hydraulics", subtopicSlug: "flood-routing-groundwater", tags: ["flood-routing", "well-hydraulics", "groundwater"] }
        ]
      },
      {
        id: "ce-wre-irrigation",
        label: "Irrigation",
        subjectSlug: "ce-irrigation-engineering",
        canonicalSubjectSlugs: ["ce-irrigation-engineering"],
        primaryTopicTag: "irrigation-engineering",
        secondaryTopicTags: ["crop-water-requirement", "duty-and-delta", "canal-design", "kennedy-lacey", "gravity-dams", "spillways", "khoslas-theory"],
        estimatedHours: 11,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Duty, delta, base period, estimation of crop water requirements (consumptive use)",
          "Design of lined and unlined canals (Kennedy's and Lacey's theories)",
          "Gravity dams, stability analysis, spillways, weir design on permeable foundation (Khosla's theory)"
        ],
        subtopics: [
          { id: "ce-wre-ir-crop-canals", label: "Crop Water Requirements, Duty, Delta & Canal Design", subtopicSlug: "crop-water-canals", tags: ["crop-water-requirements", "duty-and-delta", "canal-design"] },
          { id: "ce-wre-ir-dams-khosla", label: "Gravity Dams, Spillways & Khosla's Theory", subtopicSlug: "gravity-dams-khosla", tags: ["gravity-dams", "spillways", "khoslas-theory"] }
        ]
      }
    ]
  },
  {
    id: "ce-ee",
    slug: "ce-environmental-engineering",
    canonicalSubjectSlugs: ["ce-environmental-engineering"],
    track: "ce" as any,
    label: "Environmental Engineering",
    shortLabel: "EE",
    marksRange: "10–12 Marks",
    estimatedHours: 35,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Environmental Engineering (Peavy, Rowe & Tchobanoglous / S.K. Garg)",
    topics: [
      {
        id: "ce-ee-water-wastewater",
        label: "Water and Wastewater Treatment",
        subjectSlug: "ce-environmental-engineering",
        canonicalSubjectSlugs: ["ce-environmental-engineering"],
        primaryTopicTag: "water-and-wastewater",
        secondaryTopicTags: ["water-quality-standards", "sedimentation", "coagulation", "filtration", "disinfection", "bod-cod", "activated-sludge-process", "trickling-filters", "sludge-digestion"],
        estimatedHours: 20,
        weightageTier: "tier-1-high",
        marksRange: "6–7 Marks",
        keyConcepts: [
          "Water quality parameters and standards; water treatment: aeration, sedimentation, coagulation, filtration, disinfection",
          "Wastewater characteristics: BOD, COD, disposal into water bodies",
          "Biological wastewater treatment: activated sludge process, trickling filters, oxidation ponds, anaerobic sludge digestion"
        ],
        subtopics: [
          { id: "ce-ee-ww-water-treatment", label: "Water Quality Standards & Physical/Chemical Treatment", subtopicSlug: "water-treatment", tags: ["water-quality", "sedimentation", "filtration", "chlorination"] },
          { id: "ce-ee-ww-sewage-treatment", label: "Wastewater Characteristics, BOD Kinetics & Biological Treatment", subtopicSlug: "wastewater-treatment", tags: ["bod", "cod", "activated-sludge", "trickling-filter"] }
        ]
      },
      {
        id: "ce-ee-air-solid-waste",
        label: "Air Pollution, Municipal Solid Waste & Noise",
        subjectSlug: "ce-environmental-engineering",
        canonicalSubjectSlugs: ["ce-environmental-engineering"],
        primaryTopicTag: "air-pollution-and-solid-waste",
        secondaryTopicTags: ["air-pollutants", "air-quality-standards", "particulate-control", "electrostatic-precipitators", "solid-waste-management", "landfills", "noise-pollution"],
        estimatedHours: 15,
        weightageTier: "tier-1-high",
        marksRange: "4–5 Marks",
        keyConcepts: [
          "Types and sources of air pollutants, air quality standards, lapse rates, plume dispersion",
          "Air pollution control equipment: settling chambers, cyclones, bag filters, electrostatic precipitators (ESP)",
          "Municipal solid waste: generation, collection, disposal (landfills, composting, incineration), noise pollution metrics"
        ],
        subtopics: [
          { id: "ce-ee-as-air-pollution", label: "Air Pollutants, Meteorology & Control Equipment", subtopicSlug: "air-pollution", tags: ["air-pollutants", "lapse-rate", "cyclone", "esp"] },
          { id: "ce-ee-as-solid-waste", label: "Municipal Solid Waste Management & Landfills", subtopicSlug: "solid-waste", tags: ["solid-waste", "sanitary-landfills", "incineration", "noise-pollution"] }
        ]
      }
    ]
  },
  {
    id: "ce-te",
    slug: "ce-transportation-engineering",
    canonicalSubjectSlugs: ["ce-transportation-engineering"],
    track: "ce" as any,
    label: "Transportation Engineering",
    shortLabel: "TE",
    marksRange: "8–10 Marks",
    estimatedHours: 30,
    weightageTier: "tier-1-high",
    recommendedTextbook: "Highway Engineering (Khanna & Justo) / Traffic Engineering (Kadiyali)",
    topics: [
      {
        id: "ce-te-highway-geometric-design",
        label: "Transportation Infrastructure & Geometric Design",
        subjectSlug: "ce-transportation-engineering",
        canonicalSubjectSlugs: ["ce-transportation-engineering"],
        primaryTopicTag: "highway-geometric-design",
        secondaryTopicTags: ["sight-distances", "ssd", "osd", "horizontal-alignment", "superelevation", "vertical-curves", "railway-track-design", "airport-runway"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "3–4 Marks",
        keyConcepts: [
          "Geometric design of highways: cross-sectional elements, sight distances (SSD, OSD)",
          "Horizontal curves: superelevation, transition curves; vertical curves",
          "Railway engineering: track components, cant deficiency; Airport engineering: runway length corrections, taxiway design"
        ],
        subtopics: [
          { id: "ce-te-hg-highway-alignment", label: "Highway Sight Distances & Horizontal/Vertical Curves", subtopicSlug: "highway-curves", tags: ["ssd", "osd", "superelevation", "transition-curves"] },
          { id: "ce-te-hg-rail-air", label: "Railway Track Geometry & Airport Runway Design", subtopicSlug: "railway-airport", tags: ["railway-track", "superelevation-railways", "runway-length-correction"] }
        ]
      },
      {
        id: "ce-te-pavements-traffic",
        label: "Highway Pavements & Traffic Engineering",
        subjectSlug: "ce-transportation-engineering",
        canonicalSubjectSlugs: ["ce-transportation-engineering"],
        primaryTopicTag: "pavement-and-traffic-engineering",
        secondaryTopicTags: ["pavement-design", "flexible-pavement", "rigid-pavement", "cbr-method", "traffic-flow", "traffic-signals", "websters-method", "highway-capacity"],
        estimatedHours: 18,
        weightageTier: "tier-1-high",
        marksRange: "5–6 Marks",
        keyConcepts: [
          "Pavement materials: aggregates, bitumen tests; design of flexible and rigid pavements (IRC guidelines)",
          "Traffic engineering: microscopic and macroscopic flow parameters, speed studies, traffic capacity",
          "Traffic signals: Webster's method for cycle length, traffic signs, intersections and highway capacity"
        ],
        subtopics: [
          { id: "ce-te-pt-pavement-design", label: "Pavement Materials, Flexible & Rigid Pavement Design", subtopicSlug: "pavement-design", tags: ["flexible-pavement", "rigid-pavement", "cbr-method", "westergaard"] },
          { id: "ce-te-pt-traffic-engineering", label: "Traffic Flow Parameters, Signal Design (Webster) & Capacity", subtopicSlug: "traffic-flow-signals", tags: ["traffic-flow", "websters-method", "signal-design", "highway-capacity"] }
        ]
      }
    ]
  },
  {
    id: "ce-gme",
    slug: "ce-geomatics-engineering",
    canonicalSubjectSlugs: ["ce-geomatics-engineering", "ce-geometics-engineering"],
    track: "ce" as any,
    label: "Geomatics Engineering",
    shortLabel: "GME",
    marksRange: "4–6 Marks",
    estimatedHours: 20,
    weightageTier: "tier-2-medium",
    recommendedTextbook: "Surveying Vol. 1 & 2 (B.C. Punmia) / Remote Sensing and GIS (Basudeb Bhatta)",
    topics: [
      {
        id: "ce-gme-surveying",
        label: "Surveying Principles & Methods",
        subjectSlug: "ce-geomatics-engineering",
        canonicalSubjectSlugs: ["ce-geomatics-engineering", "ce-geometics-engineering"],
        primaryTopicTag: "surveying-principles",
        secondaryTopicTags: ["levelling", "compass-surveying", "theodolite", "traversing", "total-station", "curves", "error-adjustments"],
        estimatedHours: 12,
        weightageTier: "tier-1-high",
        marksRange: "2–4 Marks",
        keyConcepts: [
          "Principles of surveying, error adjustment; distance and angle measurements",
          "Levelling, trigonometric levelling, contouring",
          "Traversing, triangulation, total station, horizontal and vertical curves"
        ],
        subtopics: [
          { id: "ce-gme-sv-levelling-traverse", label: "Levelling, Contouring & Traverse Surveying", subtopicSlug: "levelling-traverse", tags: ["levelling", "contouring", "traversing", "compass-surveying"] },
          { id: "ce-gme-sv-curves-total-station", label: "Curves, Theodolite & Total Station", subtopicSlug: "curves-total-station", tags: ["theodolites", "total-station", "horizontal-curves"] }
        ]
      },
      {
        id: "ce-gme-photogrammetry-remote-sensing",
        label: "Photogrammetry and Remote Sensing",
        subjectSlug: "ce-geomatics-engineering",
        canonicalSubjectSlugs: ["ce-geomatics-engineering", "ce-geometics-engineering"],
        primaryTopicTag: "photogrammetry-and-remote-sensing",
        secondaryTopicTags: ["photogrammetry", "scale-flying-height", "relief-displacement", "remote-sensing", "gis", "gps"],
        estimatedHours: 8,
        weightageTier: "tier-2-medium",
        marksRange: "2–3 Marks",
        keyConcepts: [
          "Aerial photogrammetry: scale, flying height, relief displacement, stereoscopy",
          "Basics of Remote Sensing: electromagnetic spectrum, sensors, platforms, resolutions",
          "Geographic Information System (GIS) and Global Positioning System (GPS) fundamentals"
        ],
        subtopics: [
          { id: "ce-gme-pr-photogrammetry", label: "Aerial Photogrammetry (Scale, Relief Displacement)", subtopicSlug: "photogrammetry", tags: ["aerial-photogrammetry", "relief-displacement", "scale"] },
          { id: "ce-gme-pr-remote-sensing-gis", label: "Remote Sensing, GIS & GPS Fundamentals", subtopicSlug: "remote-sensing-gis", tags: ["remote-sensing", "gis", "gps"] }
        ]
      }
    ]
  }
];
