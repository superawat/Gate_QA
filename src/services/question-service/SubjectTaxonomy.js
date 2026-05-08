import precomputedLookup from "../../generated/subtopicLookup.json";

const PRECOMPUTED_SUBTOPICS = precomputedLookup.subtopicsBySubject;
const PRECOMPUTED_NORMALIZED = precomputedLookup.normalizedSubtopicsBySubject;
const PRECOMPUTED_ALIASES = precomputedLookup.subjectAliases;

export const SUBJECT_ENUM = [
  { slug: "algorithms", label: "Algorithms" },
  { slug: "coa", label: "CO & Architecture" },
  { slug: "compiler", label: "Compiler Design" },
  { slug: "cn", label: "Computer Networks" },
  { slug: "dbms", label: "Databases" },
  { slug: "digital-logic", label: "Digital Logic" },
  { slug: "discrete-math", label: "Discrete Mathematics" },
  { slug: "engg-math", label: "Engineering Mathematics" },
  { slug: "ga", label: "General Aptitude" },
  { slug: "os", label: "Operating System" },
  { slug: "prog-ds", label: "Programming and DS" },
  { slug: "prog-c", label: "Programming in C" },
  { slug: "toc", label: "Theory of Computation" },
  { slug: "legacy-other", label: "Other / Optional" },
];

// Priority order for conflict resolution when multiple subjects are inferred.
export const SUBJECT_PRIORITY = [
  "Digital Logic",
  "Computer Networks",
  "Operating System",
  "Databases",
  "Compiler Design",
  "CO & Architecture",
  "Algorithms",
  "Programming and DS",
  "Theory of Computation",
  "Programming in C",
  "Discrete Mathematics",
  "Engineering Mathematics",
  "General Aptitude",
  "Other / Optional",
];

// Tag aliases that should map to a canonical subject label.
export const SUBJECT_ALIAS_OVERRIDES = {
  Algorithms: ["algorithms"],
  "CO & Architecture": [
    "co-and-architecture",
    "computer-organization-and-architecture",
    "computer-architecture",
    "coa",
  ],
  "Compiler Design": ["compiler-design"],
  "Computer Networks": ["computer-networks", "cn"],
  Databases: ["databases", "dbms", "database-management-systems"],
  "Digital Logic": ["digital-logic", "integrated-circuits"],
  "Discrete Mathematics": [
    "discrete-mathematics",
    "discrete-math",
    "graph-theory",
    "mathematical-logic",
    "set-theory-and-algebra",
    "set-theory&algebra",
    "equivalence-class",
  ],
  "Engineering Mathematics": [
    "engineering-mathematics",
    "engg-math",
    "linear-algebra",
    "numerical-methods",
    "newton-raphson",
    "simpsons-rule",
    "simplex-method",
  ],
  "General Aptitude": [
    "general-aptitude",
    "ga",
    "spatial-aptitude",
    "assembling-pieces",
    "paper-folding",
    "patterns-in-2d",
    "patterns-in-two-dimensions",
    "patterns-in-3d",
    "patterns-in-three-dimensions",
    "3d-structure",
    "image-rotation",
    "mirror-image",
    "grouping",
    "counting-figure",
  ],
  "Other / Optional": [
    "legacy / other",
    "other / optional",
    "other-optional",
    "optional",
    "legacy-other",
    "legacy-out-of-syllabus",
    "out-of-syllabus-now",
    "out-of-gatecse-syllabus",
    "web-technologies",
    "html",
    "is&software-engineering",
    "is-software-engineering",
    "software-engineering",
    "object-oriented-programming",
    "fortran",
    "pascal",
  ],
  "Operating System": ["operating-system", "os"],
  "Programming and DS": [
    "programming-and-ds",
    "programming-ds",
    "prog-ds",
    "data-structures",
    "tree-traversal",
  ],
  "Programming in C": [
    "programming-in-c",
    "c-programming",
    "prog-c",
    "programming",
  ],
  "Theory of Computation": ["theory-of-computation", "toc"],
};

export const MAX_SUBTOPICS_PER_QUESTION = 1;

export const TOPIC_HIERARCHY = {
  "Discrete Mathematics": [
    "Combinatory",
    "Balls In Bins",
    "Counting",
    "Generating Functions",
    "Modular Arithmetic",
    "Pigeonhole Principle",
    "Recurrence Relation",
    "Summation",
    "Degree of Graph",
    "Graph Coloring",
    "Graph Connectivity",
    "Graph Isomorphism",
    "Graph Matching",
    "Graph Planarity",
    "First Order Logic",
    "Logical Reasoning",
    "Propositional Logic",
    "Binary Operation",
    "Countable Uncountable Set",
    "Functions",
    "Group Theory",
    "Identify Function",
    "Lattice",
    "Mathematical Induction",
    "Number Theory",
    "Onto",
    "Partial Order",
    "Polynomials",
    "Relations",
    "Set Theory",
  ],
  "Engineering Mathematics": [
    "Calculus",
    "Continuity",
    "Definite Integral",
    "Differentiation",
    "Integration",
    "Limits",
    "Maxima Minima",
    "Polynomials",
    "Linear Algebra",
    "Cartesian Coordinates",
    "Determinant",
    "Eigen Value",
    "Gaussian Elimination",
    "Lu Decomposition",
    "Matrix",
    "Orthonormality",
    "Rank of Matrix",
    "Singular Value Decomposition",
    "Subspace",
    "System of Equations",
    "Vector Space",
    "Probability",
    "Bayes Theorem",
    "Bayesian Network",
    "Bernoulli Distribution",
    "Binomial Distribution",
    "Conditional Probability",
    "Continuous Distribution",
    "Expectation",
    "Exponential Distribution",
    "Independent Events",
    "Normal Distribution",
    "Poisson Distribution",
    "Probability Density Function",
    "Probability Distribution",
    "Random Variable",
    "Square Invariant",
    "Statistics",
    "Uniform Distribution",
    "Variance",
  ],
  "General Aptitude": [
    "Analytical Aptitude",
    "Age Relation",
    "Code Words",
    "Coding Decoding",
    "Counting Figure",
    "Direction Sense",
    "Family Relationship",
    "Inequality",
    "Logical Inference",
    "Logical Reasoning",
    "Number Relations",
    "Odd One",
    "Passage Reading",
    "Round Table Arrangement",
    "Seating Arrangement",
    "Sequence Series",
    "Statements Follow",
    "Quantitative Aptitude",
    "Absolute Value",
    "Algebra",
    "Alligation Mixture",
    "Area",
    "Arithmetic Series",
    "Average",
    "Bar Graph",
    "Calendar",
    "Cartesian Coordinates",
    "Circle",
    "Clock Time",
    "Combinatory",
    "Compound Interest",
    "Conditional Probability",
    "Cones",
    "Contour Plots",
    "Cost Market Price",
    "Counting",
    "Cube",
    "Currency Notes",
    "Curves",
    "Data Interpretation",
    "Digital Image Processing",
    "Factors",
    "Fractions",
    "Functions",
    "Geometry",
    "Graph Coloring",
    "Inequality",
    "LCM HCF",
    "Line Graph",
    "Lines",
    "Logarithms",
    "Maps",
    "Maxima Minima",
    "Mensuration",
    "Modular Arithmetic",
    "Number Series",
    "Number System",
    "Number Theory",
    "Numerical Computation",
    "Percentage",
    "Permutation and Combination",
    "Pie Chart",
    "Polynomials",
    "Powers",
    "Prime Numbers",
    "Probability",
    "Probability Density Function",
    "Profit Loss",
    "Quadratic Equations",
    "Radar Chart",
    "Ratio Proportion",
    "Scatter Plot",
    "Seating Arrangement",
    "Sequence Series",
    "Set Theory",
    "Speed Time Distance",
    "Squares",
    "Statistics",
    "System of Equations",
    "Tables",
    "Tabular Data",
    "Triangles",
    "Trigonometry",
    "Unit Digit",
    "Venn Diagram",
    "Volume",
    "Work Time",
    "Spatial Aptitude",
    "Assembling Pieces",
    "Counting Figure",
    "Grouping",
    "Image Rotation",
    "Mirror Image",
    "Paper Folding",
    "Patterns In Three Dimensions",
    "Patterns In Two Dimensions",
    "Verbal Aptitude",
    "Articles",
    "Comparative Forms",
    "English Grammar",
    "Grammatical Error",
    "Incorrect Sentence Part",
    "Most Appropriate Word",
    "Narrative Sequencing",
    "Noun Verb Adjective",
    "Opposite",
    "Passage Reading",
    "Phrasal Verb",
    "Phrase Meaning",
    "Prepositions",
    "Pronouns",
    "Sentence Ordering",
    "Statement Sufficiency",
    "Statements Follow",
    "Synonyms",
    "Tenses",
    "Verbal Reasoning",
    "Word Meaning",
    "Word Pairs",
  ],
  "Other / Optional": [
    "Web Technologies",
    "HTML",
    "Software Engineering",
    "Cyclomatic Complexity",
    "Software Testing",
    "COCOMO Model",
    "Project Cost",
    "Software Requirement Specification",
    "Test Cases",
    "Data Flow Diagram",
    "Function Point Metric",
    "Object Oriented Programming",
    "Fortran",
    "Pascal",
  ],
  Algorithms: [
    "Algorithm Design",
    "Algorithm Design Technique",
    "Asymptotic Notation",
    "Asymptotic Notations",
    "Bellman Ford",
    "Binary Search",
    "Bitonic Array",
    "Depth First Search",
    "Dijkstras Algorithm",
    "Directed Graph",
    "Double Hashing",
    "Dynamic Programming",
    "Graph Algorithms",
    "Graph Search",
    "Greedy Algorithms",
    "Hashing",
    "Huffman Code",
    "Identify Function",
    "Insertion Sort",
    "Linear Probing",
    "Matrix Chain Ordering",
    "Merge Sort",
    "Merging",
    "Minimum Spanning Tree",
    "Prims Algorithm",
    "Quick Sort",
    "Recurrence Relation",
    "Recursion",
    "Searching",
    "Shortest Path",
    "Sorting",
    "Space Complexity",
    "Strongly Connected Components",
    "Time Complexity",
    "Topological Sort",
  ],
  "CO & Architecture": [
    "Addressing Modes",
    "Average Memory Access Time",
    "CISC RISC Architecture",
    "Cache Memory",
    "Clock Cycles",
    "DMA",
    "Data Dependency",
    "Data Path",
    "IO Handling",
    "Instruction Execution",
    "Instruction Format",
    "Instruction Set Architecture",
    "Interrupts",
    "Machine Instruction",
    "Memory Interfacing",
    "Microprogramming",
    "Pipelining",
    "Runtime Environment",
    "Speedup",
    "Virtual Memory",
  ],
  "Compiler Design": [
    "Assembler",
    "Backpatching",
    "Basic Blocks",
    "Code Optimization",
    "Compilation Phases",
    "Expression Evaluation",
    "First and Follow",
    "Grammar",
    "Intermediate Code",
    "LR Parser",
    "Lexical Analysis",
    "Linker",
    "Live Variable Analysis",
    "Macros",
    "Operator Precedence",
    "Parameter Passing",
    "Parsing",
    "Register Allocation",
    "Runtime Environment",
    "Static Single Assignment",
    "Symbol Table",
    "Syntax Directed Translation",
    "Variable Scope",
  ],
  "Computer Networks": [
    "Application Layer Protocols",
    "Arp",
    "Bit Stuffing",
    "Bridges",
    "CRC Polynomial",
    "CSMA CD",
    "Channel Utilization",
    "Communication",
    "Congestion Control",
    "Distance Vector Routing",
    "Error Detection",
    "Ethernet",
    "Fragmentation",
    "IP Addressing",
    "IP Packet",
    "LAN Technologies",
    "MAC Protocol",
    "Network Flow",
    "Network Layering",
    "Network Protocols",
    "Network Switching",
    "Osi Model",
    "Probability",
    "Routing",
    "Routing Protocols",
    "Sliding Window",
    "Sockets",
    "Stop and Wait",
    "Subnetting",
    "TCP",
    "Token Bucket",
    "UDP",
  ],
  Databases: [
    "B Tree",
    "Candidate Key",
    "Conflict Serializable",
    "Database Design",
    "Database Normalization",
    "Decomposition",
    "ER Diagram",
    "Functional Dependency",
    "Indexing",
    "Joins",
    "Multivalued Dependency 4nf",
    "Natural Join",
    "Query",
    "Referential Integrity",
    "Relational Algebra",
    "Relational Calculus",
    "Relational Model",
    "SQL",
    "Transaction and Concurrency",
    "Tuple Relational Calculus",
  ],
  "Digital Logic": [
    "Adder",
    "Array Multiplier",
    "Boolean Algebra",
    "Booths Algorithm",
    "Canonical Normal Form",
    "Carry Generator",
    "Circuit Output",
    "Combinational Circuit",
    "Decoder",
    "Digital Circuits",
    "Digital Counter",
    "Finite State Machines",
    "Fixed Point Representation",
    "Flip Flop",
    "Floating Point Representation",
    "Functional Completeness",
    "IEEE Representation",
    "K Map",
    "Memory Interfacing",
    "Min No Gates",
    "Min Products of Sum Form",
    "Min Sum of Products Form",
    "Multiplexer",
    "Number Representation",
    "Prime Implicants",
    "ROM",
    "Ripple Counter Operation",
    "Sequential Circuit",
    "Shift Registers",
    "Static Hazard",
    "Synchronous Asynchronous Circuits",
  ],
  "Operating System": [
    "Context Switch",
    "Deadlock Prevention Avoidance Detection",
    "Disk",
    "Disk Scheduling",
    "File System",
    "Fork System Call",
    "IO Handling",
    "Input Output",
    "Inter Process Communication",
    "Interrupts",
    "Linked Allocation",
    "Memory Management",
    "Multilevel Paging",
    "OS Protection",
    "Optimal Page Replacement",
    "Page Replacement",
    "Precedence Graph",
    "Process",
    "Process Scheduling",
    "Process Synchronization",
    "Resource Allocation",
    "Resource Allocation Graph",
    "Semaphore",
    "Srtf",
    "System Calls",
    "Threads",
    "Virtual Memory",
  ],
  "Programming and DS": [
    "AVL Tree",
    "Array",
    "Binary Heap",
    "Binary Search Tree",
    "Binary Tree",
    "Data Structures",
    "Hashing",
    "Infix Prefix",
    "Linked List",
    "Number of Swap",
    "Priority Queue",
    "Queue",
    "Stack",
    "Time Complexity",
    "Tree",
  ],
  "Programming in C": [
    "Aliasing",
    "Array",
    "Functions",
    "Goto",
    "Identify Function",
    "Loop Invariants",
    "Output",
    "Parameter Passing",
    "Pointers",
    "Programming Constructs",
    "Programming In C",
    "Programming Paradigms",
    "Recursion",
    "Strings",
    "Structure",
    "Switch Case",
    "Type Checking",
    "Union",
    "Variable Binding",
  ],
  "Theory of Computation": [
    "Closure Property",
    "Context Free Grammar",
    "Context Free Language",
    "Countable Uncountable Set",
    "Decidability",
    "Dpda",
    "Finite Automata",
    "Finite State Machines",
    "Identify Class Language",
    "Minimal State Automata",
    "Non Determinism",
    "Number of States",
    "Pumping Lemma",
    "Pushdown Automata",
    "Recursive and Recursively Enumerable Languages",
    "Reduction",
    "Regular Expression",
    "Regular Grammar",
    "Regular Language",
  ],
};

export function normalizeString(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getNormalizedSubjectAliases(subject) {
  if (PRECOMPUTED_ALIASES[subject]) {
    return PRECOMPUTED_ALIASES[subject];
  }

  if (this.SUBJECT_ALIAS_CACHE.has(subject)) {
    return this.SUBJECT_ALIAS_CACHE.get(subject);
  }

  const aliases = new Set();
  const addAlias = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
      return;
    }
    aliases.add(this.normalizeString(raw));
    aliases.add(this.normalizeString(raw.replace(/-/g, " ")));
  };

  addAlias(subject);
  addAlias(subject.replace(/&/g, "and"));

  const slug = subject
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  addAlias(slug);

  const customAliases = this.SUBJECT_ALIAS_OVERRIDES[subject] || [];
  customAliases.forEach(addAlias);

  const normalizedAliases = Array.from(aliases).filter(Boolean);
  this.SUBJECT_ALIAS_CACHE.set(subject, normalizedAliases);
  return normalizedAliases;
}

export function getSubjectPriorityIndex(subject) {
  const idx = this.SUBJECT_PRIORITY.indexOf(subject);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

export function ensureSubjectMaps() {
  if (this.SUBJECT_LABEL_TO_SLUG.size === this.SUBJECT_ENUM.length) {
    return;
  }
  this.SUBJECT_LABEL_TO_SLUG = new Map(
    this.SUBJECT_ENUM.map((item) => [item.label, item.slug])
  );
  this.SUBJECT_SLUG_TO_LABEL = new Map(
    this.SUBJECT_ENUM.map((item) => [item.slug, item.label])
  );
}

export function slugifyToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSubjectSlugByLabel(label = "") {
  this.ensureSubjectMaps();
  return this.SUBJECT_LABEL_TO_SLUG.get(String(label || "").trim()) || "unknown";
}

export function getSubjectLabelBySlug(slug = "") {
  this.ensureSubjectMaps();
  return this.SUBJECT_SLUG_TO_LABEL.get(this.slugifyToken(slug)) || "Unknown";
}

export function normalizeSubjectSlug(value = "") {
  this.ensureSubjectMaps();
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const normalized = this.slugifyToken(raw);
  if (this.SUBJECT_SLUG_TO_LABEL.has(normalized)) {
    return normalized;
  }
  if (this.SUBJECT_LABEL_TO_SLUG.has(raw)) {
    return this.SUBJECT_LABEL_TO_SLUG.get(raw);
  }

  const normalizedRaw = this.normalizeString(raw);
  for (const subject of this.SUBJECT_ENUM) {
    if (this.normalizeString(subject.label) === normalizedRaw) {
      return subject.slug;
    }
    if (this.slugifyToken(subject.label) === normalized) {
      return subject.slug;
    }
    const aliases = this.getNormalizedSubjectAliases(subject.label);
    if (aliases.includes(normalizedRaw)) {
      return subject.slug;
    }
  }
  return null;
}

export function getSubtopicLookupForSubject(subjectLabel = "") {
  if (this._subtopicLookupCache.has(subjectLabel)) {
    return this._subtopicLookupCache.get(subjectLabel);
  }

  let lookupMap;
  if (PRECOMPUTED_SUBTOPICS[subjectLabel]) {
    lookupMap = new Map(Object.entries(PRECOMPUTED_SUBTOPICS[subjectLabel]));
  } else {
    const subjectSubtopics = this.TOPIC_HIERARCHY[subjectLabel] || [];
    lookupMap = new Map(
      subjectSubtopics.map((subtopic) => [
        this.normalizeString(subtopic),
        {
          slug: this.slugifyToken(subtopic),
          label: subtopic,
        },
      ])
    );
  }

  this._subtopicLookupCache.set(subjectLabel, lookupMap);
  return lookupMap;
}

export function extractCanonicalSubtopics(tags = [], subjectLabel = "") {
  if (!Array.isArray(tags) || !subjectLabel || !this.TOPIC_HIERARCHY[subjectLabel]) {
    return [];
  }

  const lookup = this.getSubtopicLookupForSubject(subjectLabel);
  const unique = new Map();

  for (const tag of tags) {
    if (unique.size >= this.MAX_SUBTOPICS_PER_QUESTION) {
      break;
    }
    const norm = this.normalizeString(tag);
    const entry = lookup.get(norm);
    if (!entry || unique.has(entry.slug)) {
      continue;
    }
    unique.set(entry.slug, entry);
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    let totalMatches = 0;
    for (const tag of tags) {
      const norm = this.normalizeString(tag);
      if (lookup.has(norm)) {
        totalMatches += 1;
      }
    }
    if (totalMatches > this.MAX_SUBTOPICS_PER_QUESTION + 1) {
      console.debug(
        "[SubtopicContamination] %s - %d subtopic tags found, capped to %d. Tags: %o -> Kept: %o",
        subjectLabel,
        totalMatches,
        unique.size,
        tags.filter((t) => lookup.has(this.normalizeString(t))),
        Array.from(unique.values()).map((entry) => entry.label)
      );
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveCanonicalSubject(question) {
  const tags = Array.isArray(question.tags) ? question.tags : [];
  const normalizedTags = tags.map((tag) => this.normalizeString(tag));
  const normalizedTagSet = new Set(normalizedTags);
  const firstTagIndex = new Map();

  normalizedTags.forEach((tag, index) => {
    if (!tag || firstTagIndex.has(tag)) {
      return;
    }
    firstTagIndex.set(tag, index);
  });

  const title = String(question.title || "");
  const isGeneralAptitudeTitle = /\bGA(?:\s*QUESTION|\s*[-:]\s*\d+|\s+\d+)\b/i.test(title);

  if (
    isGeneralAptitudeTitle ||
    normalizedTagSet.has("generalaptitude") ||
    normalizedTagSet.has("quantitativeaptitude") ||
    normalizedTagSet.has("verbalaptitude") ||
    normalizedTagSet.has("analyticalaptitude")
  ) {
    return "General Aptitude";
  }

  if (
    normalizedTagSet.has("outofsyllabusnow") ||
    normalizedTagSet.has("outofgatecsesyllabus") ||
    normalizedTagSet.has("legacyoutofsyllabus")
  ) {
    return "Other / Optional";
  }

  const explicitCandidates = new Set();
  const subjectStats = new Map();

  Object.keys(this.TOPIC_HIERARCHY).forEach((subject) => {
    const aliases = this.getNormalizedSubjectAliases(subject);
    const normalizedSubs = PRECOMPUTED_NORMALIZED[subject] || [];

    let explicitIndex = Number.MAX_SAFE_INTEGER;
    aliases.forEach((alias) => {
      if (!normalizedTagSet.has(alias)) {
        return;
      }
      const idx = firstTagIndex.get(alias);
      if (idx !== undefined && idx < explicitIndex) {
        explicitIndex = idx;
      }
    });

    let subtopicCount = 0;
    let firstSubtopicIndex = Number.MAX_SAFE_INTEGER;
    normalizedSubs.forEach((normSub) => {
      if (!normalizedTagSet.has(normSub)) {
        return;
      }
      subtopicCount += 1;
      const idx = firstTagIndex.get(normSub);
      if (idx !== undefined && idx < firstSubtopicIndex) {
        firstSubtopicIndex = idx;
      }
    });

    if (explicitIndex !== Number.MAX_SAFE_INTEGER || subtopicCount > 0) {
      subjectStats.set(subject, { explicitIndex, subtopicCount, firstSubtopicIndex });
    }

    if (explicitIndex !== Number.MAX_SAFE_INTEGER) {
      explicitCandidates.add(subject);
    }
  });

  if (explicitCandidates.size === 1) {
    return Array.from(explicitCandidates)[0];
  }

  if (explicitCandidates.size > 1) {
    const ranked = Array.from(explicitCandidates).sort((a, b) => {
      const aStats = subjectStats.get(a);
      const bStats = subjectStats.get(b);

      if (aStats.explicitIndex !== bStats.explicitIndex) {
        return aStats.explicitIndex - bStats.explicitIndex;
      }
      if (aStats.subtopicCount !== bStats.subtopicCount) {
        return bStats.subtopicCount - aStats.subtopicCount;
      }
      if (aStats.firstSubtopicIndex !== bStats.firstSubtopicIndex) {
        return aStats.firstSubtopicIndex - bStats.firstSubtopicIndex;
      }
      return this.getSubjectPriorityIndex(a) - this.getSubjectPriorityIndex(b);
    });

    return ranked[0];
  }

  if (subjectStats.size === 1) {
    return Array.from(subjectStats.keys())[0];
  }

  if (subjectStats.size > 1) {
    const ranked = Array.from(subjectStats.entries()).sort((a, b) => {
      const [aSubject, aStats] = a;
      const [bSubject, bStats] = b;

      if (aStats.subtopicCount !== bStats.subtopicCount) {
        return bStats.subtopicCount - aStats.subtopicCount;
      }
      if (aStats.firstSubtopicIndex !== bStats.firstSubtopicIndex) {
        return aStats.firstSubtopicIndex - bStats.firstSubtopicIndex;
      }
      return this.getSubjectPriorityIndex(aSubject) - this.getSubjectPriorityIndex(bSubject);
    });

    return ranked[0][0];
  }

  return "Unknown";
}

export function getStructuredTags() {
  const yearSetMap = new Map();
  const subjectCountMap = new Map();
  const structuredSubtopics = {};

  this.ensureSubjectMaps();
  this.SUBJECT_ENUM.forEach((subject) => {
    structuredSubtopics[subject.slug] = new Map();
    subjectCountMap.set(subject.slug, 0);
  });

  this.questions.forEach((question) => {
    const exam = question.exam || this.extractExamMeta(question);
    if (exam && exam.yearSetKey) {
      if (!yearSetMap.has(exam.yearSetKey)) {
        yearSetMap.set(exam.yearSetKey, {
          key: exam.yearSetKey,
          year: exam.year,
          set: exam.set,
          label: exam.label || this.formatYearSetLabel(exam.yearSetKey),
          count: 0,
        });
      }
      yearSetMap.get(exam.yearSetKey).count += 1;
    }

    const subjectSlug = this.normalizeSubjectSlug(question.subjectSlug) || "unknown";
    if (subjectCountMap.has(subjectSlug)) {
      subjectCountMap.set(subjectSlug, subjectCountMap.get(subjectSlug) + 1);
    }

    const canonicalSubtopics = Array.isArray(question.subtopics) ? question.subtopics : [];

    if (!structuredSubtopics[subjectSlug] || !canonicalSubtopics.length) {
      return;
    }

    canonicalSubtopics.forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }
      const slug = this.slugifyToken(entry.slug || entry.label || "");
      const label = String(entry.label || "").trim();
      if (!slug || !label) {
        return;
      }
      if (!structuredSubtopics[subjectSlug].has(slug)) {
        structuredSubtopics[subjectSlug].set(slug, { slug, label });
      }
    });
  });

  const yearSets = Array.from(yearSetMap.values()).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return (b.set || 0) - (a.set || 0);
  });

  const subjects = this.SUBJECT_ENUM.filter(
    (subject) => (subjectCountMap.get(subject.slug) || 0) > 0
  ).map((subject) => ({
    ...subject,
    count: subjectCountMap.get(subject.slug) || 0,
  }));

  const normalizedStructuredSubtopics = {};
  subjects.forEach((subject) => {
    const subtopicEntries = structuredSubtopics[subject.slug]
      ? Array.from(structuredSubtopics[subject.slug].values())
      : [];
    normalizedStructuredSubtopics[subject.slug] = subtopicEntries.sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  });

  const structuredTopics = {};
  subjects.forEach((subject) => {
    structuredTopics[subject.label] = (normalizedStructuredSubtopics[subject.slug] || []).map(
      (entry) => entry.label
    );
  });

  const numericYears = yearSets.map((entry) => entry.year).filter((year) => Number.isFinite(year));
  const minYear = numericYears.length ? Math.min(...numericYears) : 2000;
  const maxYear = numericYears.length ? Math.max(...numericYears) : new Date().getFullYear();

  return {
    yearSets,
    years: yearSets.map((entry) => entry.key),
    subjects,
    topics: subjects.map((subject) => subject.slug),
    structuredSubtopics: normalizedStructuredSubtopics,
    structuredTopics,
    minYear,
    maxYear,
  };
}
