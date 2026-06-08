// Subject landing page meta — maps SEO-friendly URL slugs to internal subject slugs
// Format: { urlSlug, subjectSlug, label, description, relatedSlugs[] }

export const SUBJECT_SEO_MAP = [
  {
    urlSlug: "operating-systems",
    subjectSlug: "os",
    label: "Operating Systems",
    description:
      "Practice 298+ GATE CS Previous Year Questions on Operating Systems including process scheduling, memory management, deadlocks, file systems, and synchronization. Questions from 1987–2026.",
    topics: ["Process Scheduling", "Memory Management", "Deadlocks", "Semaphores", "File Systems", "Page Replacement"],
    relatedSlugs: ["computer-networks", "computer-organization"],
  },
  {
    urlSlug: "computer-networks",
    subjectSlug: "cn",
    label: "Computer Networks",
    description:
      "Practice 241+ GATE CS Previous Year Questions on Computer Networks including OSI/TCP-IP model, routing protocols, congestion control, IP addressing, and transport layer. Questions from 1987–2026.",
    topics: ["TCP/IP", "Routing", "IP Addressing", "Congestion Control", "MAC Protocols", "DNS", "HTTP"],
    relatedSlugs: ["operating-systems", "dbms"],
  },
  {
    urlSlug: "dbms",
    subjectSlug: "dbms",
    label: "Database Management Systems",
    description:
      "Practice 230+ GATE CS Previous Year Questions on DBMS including SQL, ER diagrams, normalization, relational algebra, transaction management, and concurrency. Questions from 1987–2026.",
    topics: ["SQL", "Normalization", "ER Diagrams", "Relational Algebra", "Transactions", "Indexing"],
    relatedSlugs: ["algorithms", "operating-systems"],
  },
  {
    urlSlug: "algorithms",
    subjectSlug: "algorithms",
    label: "Algorithms",
    description:
      "Practice 311+ GATE CS Previous Year Questions on Algorithms including sorting, graph algorithms, dynamic programming, greedy methods, and complexity analysis. Questions from 1987–2026.",
    topics: ["Sorting", "Graph Algorithms", "Dynamic Programming", "Greedy", "Complexity", "Divide & Conquer"],
    relatedSlugs: ["discrete-mathematics", "data-structures"],
  },
  {
    urlSlug: "compiler-design",
    subjectSlug: "compiler",
    label: "Compiler Design",
    description:
      "Practice 183+ GATE CS Previous Year Questions on Compiler Design including lexical analysis, parsing, SDT, code generation, and optimization. Questions from 1987–2026.",
    topics: ["Lexical Analysis", "Parsing", "Syntax Directed Translation", "Code Generation", "Optimization"],
    relatedSlugs: ["theory-of-computation", "algorithms"],
  },
  {
    urlSlug: "discrete-mathematics",
    subjectSlug: "discrete-math",
    label: "Discrete Mathematics",
    description:
      "Practice 298+ GATE CS Previous Year Questions on Discrete Mathematics including sets, relations, functions, graph theory, propositional logic, and combinatorics. Questions from 1987–2026.",
    topics: ["Set Theory", "Graph Theory", "Propositional Logic", "Combinatorics", "Group Theory", "Relations"],
    relatedSlugs: ["algorithms", "theory-of-computation"],
  },
  {
    urlSlug: "digital-logic",
    subjectSlug: "digital-logic",
    label: "Digital Logic",
    description:
      "Practice 258+ GATE CS Previous Year Questions on Digital Logic including Boolean algebra, logic gates, combinational circuits, sequential circuits, and K-maps. Questions from 1987–2026.",
    topics: ["Boolean Algebra", "Logic Gates", "K-Maps", "Flip-Flops", "Combinational Circuits", "Sequential Circuits"],
    relatedSlugs: ["computer-organization", "discrete-mathematics"],
  },
  {
    urlSlug: "computer-organization",
    subjectSlug: "coa",
    label: "Computer Organization & Architecture",
    description:
      "Practice 229+ GATE CS Previous Year Questions on Computer Organization including CPU design, instruction set architecture, memory hierarchy, pipelining, and I/O. Questions from 1987–2026.",
    topics: ["CPU Design", "Pipelining", "Memory Hierarchy", "Cache", "Instruction Set", "I/O Systems"],
    relatedSlugs: ["digital-logic", "operating-systems"],
  },
  {
    urlSlug: "theory-of-computation",
    subjectSlug: "toc",
    label: "Theory of Computation",
    description:
      "Practice 263+ GATE CS Previous Year Questions on Theory of Computation including finite automata, regular languages, context-free grammars, Turing machines, and decidability. Questions from 1987–2026.",
    topics: ["Finite Automata", "Regular Languages", "CFG", "Pushdown Automata", "Turing Machines", "Decidability"],
    relatedSlugs: ["compiler-design", "discrete-mathematics"],
  },
  {
    urlSlug: "data-structures",
    subjectSlug: "prog-ds",
    label: "Data Structures",
    description:
      "Practice 189+ GATE CS Previous Year Questions on Programming and Data Structures including arrays, linked lists, trees, graphs, stacks, queues, and hashing. Questions from 1987–2026.",
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Stacks", "Queues", "Hashing"],
    relatedSlugs: ["algorithms", "compiler-design"],
  },
  {
    urlSlug: "engineering-mathematics",
    subjectSlug: "engg-math",
    label: "Engineering Mathematics",
    description:
      "Practice 208+ GATE CS Previous Year Questions on Engineering Mathematics including linear algebra, calculus, probability, statistics, and numerical methods. Questions from 1987–2026.",
    topics: ["Linear Algebra", "Calculus", "Probability", "Statistics", "Numerical Methods"],
    relatedSlugs: ["discrete-mathematics", "algorithms"],
  },
];

export const getSubjectByUrlSlug = (urlSlug) =>
  SUBJECT_SEO_MAP.find((s) => s.urlSlug === urlSlug) ?? null;

export const getSubjectBySubjectSlug = (subjectSlug) =>
  SUBJECT_SEO_MAP.find((s) => s.subjectSlug === subjectSlug) ?? null;

// Year landing pages — one per year from 2015–2026
export const GATE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
