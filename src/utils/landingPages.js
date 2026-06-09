// Subject landing page meta — maps SEO-friendly URL slugs to internal subject slugs
// Format: { urlSlug, subjectSlug, label, description, relatedSlugs[], topics[] }
// topics: each entry is { label: string, pct: number } — pct is the % of questions from that topic

export const SUBJECT_SEO_MAP = [
  {
    urlSlug: "operating-systems",
    subjectSlug: "os",
    label: "Operating Systems",
    description:
      "Practice 298+ GATE CS Previous Year Questions on Operating Systems including process scheduling, memory management, deadlocks, file systems, and synchronization. Questions from 1987–2026.",
    topics: [
      { label: "Process Scheduling", pct: 22 },
      { label: "Memory Management", pct: 20 },
      { label: "Deadlocks", pct: 16 },
      { label: "Semaphores", pct: 14 },
      { label: "File Systems", pct: 15 },
      { label: "Page Replacement", pct: 13 },
    ],
    relatedSlugs: ["computer-networks", "computer-organization"],
  },
  {
    urlSlug: "computer-networks",
    subjectSlug: "cn",
    label: "Computer Networks",
    description:
      "Practice 241+ GATE CS Previous Year Questions on Computer Networks including OSI/TCP-IP model, routing protocols, congestion control, IP addressing, and transport layer. Questions from 1987–2026.",
    topics: [
      { label: "TCP/IP", pct: 24 },
      { label: "Routing", pct: 20 },
      { label: "IP Addressing", pct: 18 },
      { label: "Congestion Control", pct: 14 },
      { label: "MAC Protocols", pct: 12 },
      { label: "DNS", pct: 7 },
      { label: "HTTP", pct: 5 },
    ],
    relatedSlugs: ["operating-systems", "dbms"],
  },
  {
    urlSlug: "dbms",
    subjectSlug: "dbms",
    label: "Database Management Systems",
    description:
      "Practice 230+ GATE CS Previous Year Questions on DBMS including SQL, ER diagrams, normalization, relational algebra, transaction management, and concurrency. Questions from 1987–2026.",
    topics: [
      { label: "SQL", pct: 26 },
      { label: "Normalization", pct: 20 },
      { label: "ER Diagrams", pct: 14 },
      { label: "Relational Algebra", pct: 18 },
      { label: "Transactions", pct: 13 },
      { label: "Indexing", pct: 9 },
    ],
    relatedSlugs: ["algorithms", "operating-systems"],
  },
  {
    urlSlug: "algorithms",
    subjectSlug: "algorithms",
    label: "Algorithms",
    description:
      "Practice 311+ GATE CS Previous Year Questions on Algorithms including sorting, graph algorithms, dynamic programming, greedy methods, and complexity analysis. Questions from 1987–2026.",
    topics: [
      { label: "Sorting", pct: 18 },
      { label: "Graph Algorithms", pct: 22 },
      { label: "Dynamic Programming", pct: 20 },
      { label: "Greedy", pct: 14 },
      { label: "Complexity", pct: 16 },
      { label: "Divide & Conquer", pct: 10 },
    ],
    relatedSlugs: ["discrete-mathematics", "data-structures"],
  },
  {
    urlSlug: "compiler-design",
    subjectSlug: "compiler",
    label: "Compiler Design",
    description:
      "Practice 183+ GATE CS Previous Year Questions on Compiler Design including lexical analysis, parsing, SDT, code generation, and optimization. Questions from 1987–2026.",
    topics: [
      { label: "Lexical Analysis", pct: 15 },
      { label: "Parsing", pct: 35 },
      { label: "Syntax Directed Translation", pct: 20 },
      { label: "Code Generation", pct: 18 },
      { label: "Optimization", pct: 12 },
    ],
    relatedSlugs: ["theory-of-computation", "algorithms"],
  },
  {
    urlSlug: "discrete-mathematics",
    subjectSlug: "discrete-math",
    label: "Discrete Mathematics",
    description:
      "Practice 298+ GATE CS Previous Year Questions on Discrete Mathematics including sets, relations, functions, graph theory, propositional logic, and combinatorics. Questions from 1987–2026.",
    topics: [
      { label: "Set Theory", pct: 16 },
      { label: "Graph Theory", pct: 22 },
      { label: "Propositional Logic", pct: 20 },
      { label: "Combinatorics", pct: 18 },
      { label: "Group Theory", pct: 12 },
      { label: "Relations", pct: 12 },
    ],
    relatedSlugs: ["algorithms", "theory-of-computation"],
  },
  {
    urlSlug: "digital-logic",
    subjectSlug: "digital-logic",
    label: "Digital Logic",
    description:
      "Practice 258+ GATE CS Previous Year Questions on Digital Logic including Boolean algebra, logic gates, combinational circuits, sequential circuits, and K-maps. Questions from 1987–2026.",
    topics: [
      { label: "Boolean Algebra", pct: 24 },
      { label: "Logic Gates", pct: 16 },
      { label: "K-Maps", pct: 18 },
      { label: "Flip-Flops", pct: 14 },
      { label: "Combinational Circuits", pct: 16 },
      { label: "Sequential Circuits", pct: 12 },
    ],
    relatedSlugs: ["computer-organization", "discrete-mathematics"],
  },
  {
    urlSlug: "computer-organization",
    subjectSlug: "coa",
    label: "Computer Organization & Architecture",
    description:
      "Practice 229+ GATE CS Previous Year Questions on Computer Organization including CPU design, instruction set architecture, memory hierarchy, pipelining, and I/O. Questions from 1987–2026.",
    topics: [
      { label: "CPU Design", pct: 18 },
      { label: "Pipelining", pct: 26 },
      { label: "Memory Hierarchy", pct: 20 },
      { label: "Cache", pct: 18 },
      { label: "Instruction Set", pct: 12 },
      { label: "I/O Systems", pct: 6 },
    ],
    relatedSlugs: ["digital-logic", "operating-systems"],
  },
  {
    urlSlug: "theory-of-computation",
    subjectSlug: "toc",
    label: "Theory of Computation",
    description:
      "Practice 263+ GATE CS Previous Year Questions on Theory of Computation including finite automata, regular languages, context-free grammars, Turing machines, and decidability. Questions from 1987–2026.",
    topics: [
      { label: "Finite Automata", pct: 26 },
      { label: "Regular Languages", pct: 20 },
      { label: "CFG", pct: 18 },
      { label: "Pushdown Automata", pct: 14 },
      { label: "Turing Machines", pct: 12 },
      { label: "Decidability", pct: 10 },
    ],
    relatedSlugs: ["compiler-design", "discrete-mathematics"],
  },
  {
    urlSlug: "data-structures",
    subjectSlug: "prog-ds",
    label: "Data Structures",
    description:
      "Practice 189+ GATE CS Previous Year Questions on Programming and Data Structures including arrays, linked lists, trees, graphs, stacks, queues, and hashing. Questions from 1987–2026.",
    topics: [
      { label: "Arrays", pct: 12 },
      { label: "Linked Lists", pct: 14 },
      { label: "Trees", pct: 24 },
      { label: "Graphs", pct: 18 },
      { label: "Stacks", pct: 10 },
      { label: "Queues", pct: 8 },
      { label: "Hashing", pct: 14 },
    ],
    relatedSlugs: ["algorithms", "compiler-design"],
  },
  {
    urlSlug: "engineering-mathematics",
    subjectSlug: "engg-math",
    label: "Engineering Mathematics",
    description:
      "Practice 208+ GATE CS Previous Year Questions on Engineering Mathematics including linear algebra, calculus, probability, statistics, and numerical methods. Questions from 1987–2026.",
    topics: [
      { label: "Linear Algebra", pct: 26 },
      { label: "Calculus", pct: 20 },
      { label: "Probability", pct: 28 },
      { label: "Statistics", pct: 14 },
      { label: "Numerical Methods", pct: 12 },
    ],
    relatedSlugs: ["discrete-mathematics", "algorithms"],
  },
];

export const getSubjectByUrlSlug = (urlSlug) =>
  SUBJECT_SEO_MAP.find((s) => s.urlSlug === urlSlug) ?? null;

export const getSubjectBySubjectSlug = (subjectSlug) =>
  SUBJECT_SEO_MAP.find((s) => s.subjectSlug === subjectSlug) ?? null;

// Year landing pages — one per year from 2015–2026
export const GATE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
