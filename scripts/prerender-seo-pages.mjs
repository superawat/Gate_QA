#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { EDITORIAL_PAGES } from "../src/data/editorialPages.js";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_ORIGIN = "https://gateqa.in";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-cover.png`;
const QUESTION_PRERENDER_LIMIT = 5000;

const SUBJECT_SEO_MAP = [
  {
    urlSlug: "operating-systems",
    subjectSlug: "os",
    label: "Operating Systems",
    description:
      "Practice GATE CS previous-year questions on Operating Systems including scheduling, memory management, deadlocks, file systems, and synchronization.",
    topics: ["Process Scheduling", "Memory Management", "Deadlocks", "Semaphores", "File Systems", "Page Replacement"],
  },
  {
    urlSlug: "computer-networks",
    subjectSlug: "cn",
    label: "Computer Networks",
    description:
      "Practice GATE CS previous-year questions on Computer Networks including OSI/TCP-IP, routing, congestion control, IP addressing, and transport layer.",
    topics: ["TCP/IP", "Routing", "IP Addressing", "Congestion Control", "MAC Protocols", "DNS", "HTTP"],
  },
  {
    urlSlug: "dbms",
    subjectSlug: "dbms",
    label: "Database Management Systems",
    description:
      "Practice GATE CS previous-year questions on DBMS including SQL, ER diagrams, normalization, relational algebra, transactions, and concurrency.",
    topics: ["SQL", "Normalization", "ER Diagrams", "Relational Algebra", "Transactions", "Indexing"],
  },
  {
    urlSlug: "algorithms",
    subjectSlug: "algorithms",
    label: "Algorithms",
    description:
      "Practice GATE CS previous-year questions on Algorithms including sorting, graph algorithms, dynamic programming, greedy methods, and complexity analysis.",
    topics: ["Sorting", "Graph Algorithms", "Dynamic Programming", "Greedy", "Complexity", "Divide and Conquer"],
  },
  {
    urlSlug: "compiler-design",
    subjectSlug: "compiler",
    label: "Compiler Design",
    description:
      "Practice GATE CS previous-year questions on Compiler Design including lexical analysis, parsing, syntax-directed translation, code generation, and optimization.",
    topics: ["Lexical Analysis", "Parsing", "Syntax Directed Translation", "Code Generation", "Optimization"],
  },
  {
    urlSlug: "discrete-mathematics",
    subjectSlug: "discrete-math",
    label: "Discrete Mathematics",
    description:
      "Practice GATE CS previous-year questions on Discrete Mathematics including sets, relations, functions, graph theory, logic, and combinatorics.",
    topics: ["Set Theory", "Graph Theory", "Propositional Logic", "Combinatorics", "Group Theory", "Relations"],
  },
  {
    urlSlug: "digital-logic",
    subjectSlug: "digital-logic",
    label: "Digital Logic",
    description:
      "Practice GATE CS previous-year questions on Digital Logic including Boolean algebra, logic gates, combinational circuits, sequential circuits, and K-maps.",
    topics: ["Boolean Algebra", "Logic Gates", "K-Maps", "Flip-Flops", "Combinational Circuits", "Sequential Circuits"],
  },
  {
    urlSlug: "computer-organization",
    subjectSlug: "coa",
    label: "Computer Organization and Architecture",
    description:
      "Practice GATE CS previous-year questions on Computer Organization including CPU design, ISA, memory hierarchy, pipelining, cache, and I/O.",
    topics: ["CPU Design", "Pipelining", "Memory Hierarchy", "Cache", "Instruction Set", "I/O Systems"],
  },
  {
    urlSlug: "theory-of-computation",
    subjectSlug: "toc",
    label: "Theory of Computation",
    description:
      "Practice GATE CS previous-year questions on Theory of Computation including finite automata, regular languages, CFGs, Turing machines, and decidability.",
    topics: ["Finite Automata", "Regular Languages", "CFG", "Pushdown Automata", "Turing Machines", "Decidability"],
  },
  {
    urlSlug: "data-structures",
    subjectSlug: "prog-ds",
    label: "Data Structures",
    description:
      "Practice GATE CS previous-year questions on Programming and Data Structures including arrays, linked lists, trees, graphs, stacks, queues, and hashing.",
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Stacks", "Queues", "Hashing"],
  },
  {
    urlSlug: "engineering-mathematics",
    subjectSlug: "engg-math",
    label: "Engineering Mathematics",
    description:
      "Practice GATE CS previous-year questions on Engineering Mathematics including linear algebra, calculus, probability, statistics, and numerical methods.",
    topics: ["Linear Algebra", "Calculus", "Probability", "Statistics", "Numerical Methods"],
  },
];

const SUBJECT_BY_INTERNAL_SLUG = new Map(
  SUBJECT_SEO_MAP.map((subject) => [subject.subjectSlug, subject])
);

const SUBJECT_DETAILS = {
  "os": {
    richCopy: [
      "Operating Systems (OS) is a core topic in the GATE CS exam, typically accounting for 8 to 10 marks of the total paper. The syllabus spans fundamental concepts of how software interacts with hardware, scheduling algorithms, and resource allocation policies.",
      "The questions in GATE test both conceptual clarity and numerical precision. Topics like paging, virtual memory address translation, and disk/CPU scheduling frequently appear as high-scoring numerical questions, while semaphores and critical section problems test logical concurrency understanding."
    ],
    faqs: [
      {
        question: "What are the core topics of Operating Systems in the GATE CS exam?",
        answer: "The core syllabus covers CPU scheduling, memory management (including virtual memory, paging, TLBs, and page replacement), concurrency control (semaphores, critical section, mutexes), deadlocks (prevention, avoidance, detection, recovery), file systems, and disk scheduling."
      },
      {
        question: "How should I prepare for OS questions in GATE?",
        answer: "Focus on understanding numerical problems from paging address translation, CPU scheduling algorithms, and page replacement strategies. Additionally, trace execution steps for semaphore-based synchronization code to master logical synchronization questions."
      },
      {
        question: "Is CPU scheduling important for GATE CS?",
        answer: "Yes, CPU scheduling algorithms like Round Robin (RR), Shortest Job First (SJF), and Preemptive Priority Scheduling are tested frequently with numerical questions targeting average waiting time or turnaround time."
      }
    ]
  },
  "cn": {
    richCopy: [
      "Computer Networks (CN) is a major subject in GATE CS, contributing around 7 to 9 marks. It covers the theoretical OSI model, TCP/IP stack layers, and practical networking protocols.",
      "Questions often require calculating subnet masks, network addresses, TCP window sizes, routing table entries, and protocol delays (like transmission and propagation delay in sliding window protocols)."
    ],
    faqs: [
      {
        question: "What are the most important sections in GATE Computer Networks?",
        answer: "IP addressing and subnetting, sliding window protocols (Go-Back-N, Selective Repeat), TCP congestion control mechanisms, routing protocols (distance vector, link state), and application layer protocols (DNS, HTTP, SMTP) are the most highly-weighted topics."
      },
      {
        question: "How can I solve subnetting questions in GATE CN?",
        answer: "Master binary-to-decimal conversions, understand classless inter-domain routing (CIDR) notation, and practice calculating network IDs, broadcast IDs, and the range of usable host IPs for arbitrary subnets."
      }
    ]
  },
  "dbms": {
    richCopy: [
      "Database Management Systems (DBMS) is one of the most scoring technical sections in GATE CS, typically yielding 5 to 7 marks. The syllabus ranges from conceptual schema designs to concrete query languages and transactional safety.",
      "GATE questions regularly assess SQL queries, Relational Algebra expressions, schema Normalization (up to BCNF/4NF), and transactional scheduling properties like conflict serializability and deadlock handling."
    ],
    faqs: [
      {
        question: "How do I determine the normal form of a relation for GATE?",
        answer: "Find all candidate keys using functional dependency closures. Check the dependencies against the definitions of 1NF, 2NF, 3NF, and BCNF to identify the highest normal form of the schema."
      },
      {
        question: "What is conflict serializability in GATE DBMS?",
        answer: "A schedule is conflict serializable if it is conflict equivalent to a serial schedule. You can test this by building a precedence graph of conflicting operations; if the graph contains no cycles, the schedule is conflict serializable."
      }
    ]
  },
  "algorithms": {
    richCopy: [
      "Algorithms is a critical subject in the GATE Computer Science syllabus, often representing 8 to 10 marks. It tests analytical reasoning, recursive execution, and computational efficiency.",
      "Common problem styles include asymptotic notation analysis, divide-and-conquer recurrence relations, greedy design choices, dynamic programming states, and classical graph traversals like BFS, DFS, Dijkstra, and Kruskal."
    ],
    faqs: [
      {
        question: "How do I solve recurrence relations for algorithm time complexity?",
        answer: "You can solve recurrence relations using the Master Theorem for standard formats, recursion trees for visual branching, or substitution/induction methods for non-standard recurrences."
      },
      {
        question: "What are the key graph algorithms to study for GATE CS?",
        answer: "Ensure you study Breadth-First Search (BFS), Depth-First Search (DFS), Minimum Spanning Tree algorithms (Kruskal's and Prim's), and Single-Source Shortest Path algorithms (Dijkstra's and Bellman-Ford)."
      }
    ]
  },
  "compiler": {
    richCopy: [
      "Compiler Design (CD) is a compact and highly scoring subject, usually accounting for 4 to 6 marks in the GATE CS exam. It covers the stages of a compiler from source text ingestion to machine code generation.",
      "The questions focus heavily on parser table construction (LL, LR, LALR), Syntax-Directed Translation (SDT) evaluations, intermediate representation generation, and compiler optimization techniques."
    ],
    faqs: [
      {
        question: "Which parser types are most frequently asked in Compiler Design?",
        answer: "Bottom-up parsers, especially LR(0), SLR(1), LR(1), and LALR(1), are tested frequently. You should know how to build parser states and check for shift-reduce (S-R) or reduce-reduce (R-R) conflicts."
      },
      {
        question: "What is the difference between S-attributed and L-attributed SDT?",
        answer: "S-attributed definitions use only synthesized attributes (evaluated bottom-up). L-attributed definitions can use both synthesized and inherited attributes, provided the inherited attributes depend only on parent and left-sibling attributes."
      }
    ]
  },
  "discrete-math": {
    richCopy: [
      "Discrete Mathematics (DM) forms the mathematical backbone of computer science and accounts for 8 to 10 marks in GATE CS. It tests pure logical deduction and combinatorics.",
      "Highly weighted sections include mathematical logic, set operations, binary relations, functions, counting principles, generating functions, recurrence relations, and graph theory concepts."
    ],
    faqs: [
      {
        question: "What is the weightage of Graph Theory in GATE Discrete Mathematics?",
        answer: "Graph Theory is highly important, often contributing 3-4 marks. Focus on properties of planar graphs, Euler and Hamiltonian paths, graph coloring, isomorphism, and tree properties."
      },
      {
        question: "How should I approach mathematical logic questions?",
        answer: "Master truth tables, logical equivalence rules (laws of implication, contrapositive, De Morgan's laws), and first-order predicate logic quantifiers to translate English statements accurately."
      }
    ]
  },
  "digital-logic": {
    richCopy: [
      "Digital Logic is a fundamental hardware subject representing 4 to 6 marks in GATE CS. It establishes the building blocks of computer memory and processing logic.",
      "Questions cover Boolean algebraic minimization, Karnaugh Maps (K-maps), multiplexers, decoders, flip-flops, counter design (synchronous/asynchronous), and state machine analysis."
    ],
    faqs: [
      {
        question: "What is the best way to minimize Boolean functions for GATE?",
        answer: "Use Karnaugh Maps (K-maps) for up to 4 or 5 variables. For larger variables or algebraic proofs, apply Boolean algebra theorems such as consensus, demorgan's, and duality."
      },
      {
        question: "How do I calculate the modulus of a digital counter?",
        answer: "Determine the state sequence of the flip-flops. The modulus (MOD-N) is the total number of unique states the counter visits before returning to its starting state."
      }
    ]
  },
  "coa": {
    richCopy: [
      "Computer Organization and Architecture (COA) is a core systems subject, contributing 6 to 8 marks. It bridges the gap between hardware gates and high-level programming structures.",
      "The syllabus requires analyzing CPU instruction cycles, addressing modes, pipeline speedups, cache memory hits/misses, main memory organization, and direct memory access (DMA) configurations."
    ],
    faqs: [
      {
        question: "How is cache memory performance tested in GATE COA?",
        answer: "Questions usually test cache mapping techniques (direct, fully associative, set-associative), hit/miss ratio calculations, average memory access time (AMAT), and write policies (write-through/write-back)."
      },
      {
        question: "What is pipeline speedup and how do I calculate it?",
        answer: "Pipeline speedup is the ratio of time taken to execute a set of instructions non-pipelined vs. pipelined. Speedup S = Non-pipelined time / Pipelined time. In ideal cases with k stages, maximum speedup approaches k."
      }
    ]
  },
  "toc": {
    richCopy: [
      "Theory of Computation (TOC) is a beautiful, highly structured subject yielding 6 to 8 marks. It defines the mathematical models of computation and formal grammar classification.",
      "The syllabus focuses on regular languages (DFAs, NFAs, regular expressions), context-free languages (CFGs, PDAs), Turing machines, and the Chomsky hierarchy, alongside decidability and undecidability proofs."
    ],
    faqs: [
      {
        question: "How do I prove a language is context-free but not regular for GATE?",
        answer: "You can use the Pumping Lemma for regular languages to show contradiction, or identify if the language requires a single stack memory comparison (e.g., matching brackets or counts) which context-free languages support."
      },
      {
        question: "What are the common undecidable problems in TOC?",
        answer: "The Halting Problem for Turing machines, the Post Correspondence Problem (PCP), and checking if a Turing machine accepts a regular language are all classic examples of undecidable problems."
      }
    ]
  },
  "prog-ds": {
    richCopy: [
      "Programming and Data Structures (DS) is a fundamental subject in GATE CS, contributing 8 to 10 marks. It tests structural layout efficiency and algorithmic operations in C.",
      "GATE questions require evaluating pointer logic, recursion in C, array indexes, linked list insertions/deletions, binary search trees (BST), AVL trees, heap structures, and hashing tables."
    ],
    faqs: [
      {
        question: "What aspects of C programming are tested in GATE?",
        answer: "Expect questions on pointer arithmetic, parameter passing (call-by-value vs. call-by-reference), multi-dimensional arrays, recursion, and string manipulation functions."
      },
      {
        question: "What are the key properties of a Binary Search Tree (BST)?",
        answer: "In a BST, for every node, all elements in the left subtree are smaller and all elements in the right subtree are larger. Crucially, the in-order traversal of a BST always yields sorted elements in ascending order."
      }
    ]
  },
  "engg-math": {
    richCopy: [
      "Engineering Mathematics (EM) contributes 13 to 15 marks to the GATE CS paper, making it one of the most critical subjects. It forms the mathematical rigour required for advanced computer science.",
      "Key areas tested include linear algebra (matrix multiplication, determinants, rank, eigenvalues/eigenvectors), calculus (limits, continuity, derivatives, maxima/minima), probability distributions, and mathematical statistics."
    ],
    faqs: [
      {
        question: "How do I find the eigenvalues of a matrix?",
        answer: "Solve the characteristic equation det(A - lambda*I) = 0. The roots of this polynomial are the eigenvalues of the matrix A. The sum of eigenvalues equals the trace of the matrix, and their product equals the determinant."
      },
      {
        question: "What probability distributions are important for GATE CS?",
        answer: "Ensure you master the Binomial distribution, Poisson distribution, Uniform distribution, and Normal/Gaussian distribution, along with Bayes' Theorem."
      }
    ]
  }
};

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function stripControlCharacters(value = "") {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value = "", maxLength = 160) {
  const normalized = stripControlCharacters(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function buildCanonicalUrl(routePath = "/") {
  const normalizedPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
}

function getOutputPath(routePath = "/") {
  const cleanPath = routePath.replace(/^\/+|\/+$/g, "");
  if (!cleanPath) {
    return path.join(DIST_DIR, "index.html");
  }
  return path.join(DIST_DIR, ...cleanPath.split("/"), "index.html");
}

function replaceOrInsertHeadTag(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace("</head>", `  ${replacement}\n</head>`);
}

function removeExistingJsonLd(html) {
  return html.replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, "");
}

function buildMetaTags({ title, description, canonicalUrl, ogType = "website", schemas = [] }) {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  const safeCanonical = escapeAttribute(canonicalUrl);
  const safeImage = escapeAttribute(DEFAULT_OG_IMAGE);
  const schemaTags = schemas
    .filter(Boolean)
    .map((schema) => `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n");

  return [
    `  <title>${escapeHtml(title)}</title>`,
    `  <meta name="description" content="${safeDescription}" />`,
    `  <meta name="robots" content="index,follow" />`,
    `  <link rel="canonical" href="${safeCanonical}" />`,
    `  <meta property="og:type" content="${escapeAttribute(ogType)}" />`,
    `  <meta property="og:title" content="${safeTitle}" />`,
    `  <meta property="og:description" content="${safeDescription}" />`,
    `  <meta property="og:image" content="${safeImage}" />`,
    `  <meta property="og:url" content="${safeCanonical}" />`,
    '  <meta property="og:site_name" content="GateQA" />',
    '  <meta name="twitter:card" content="summary_large_image" />',
    `  <meta name="twitter:title" content="${safeTitle}" />`,
    `  <meta name="twitter:description" content="${safeDescription}" />`,
    `  <meta name="twitter:image" content="${safeImage}" />`,
    schemaTags,
  ].filter(Boolean).join("\n");
}

function replaceHead(html, page) {
  let nextHtml = removeExistingJsonLd(html);
  nextHtml = replaceOrInsertHeadTag(nextHtml, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  nextHtml = replaceOrInsertHeadTag(nextHtml, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeAttribute(page.description)}" />`);
  nextHtml = replaceOrInsertHeadTag(nextHtml, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow" />');
  nextHtml = replaceOrInsertHeadTag(nextHtml, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeAttribute(page.canonicalUrl)}" />`);

  const removableMetaPatterns = [
    /<meta\s+property=["']og:type["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:title["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:description["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:image["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:url["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:site_name["'][^>]*>\s*/gi,
    /<meta\s+name=["']twitter:card["'][^>]*>\s*/gi,
    /<meta\s+name=["']twitter:title["'][^>]*>\s*/gi,
    /<meta\s+name=["']twitter:description["'][^>]*>\s*/gi,
    /<meta\s+name=["']twitter:image["'][^>]*>\s*/gi,
  ];
  removableMetaPatterns.forEach((pattern) => {
    nextHtml = nextHtml.replace(pattern, "");
  });

  const metaTags = buildMetaTags(page)
    .split("\n")
    .filter((line) => !/<title>|name="description"|name="robots"|rel="canonical"/.test(line))
    .join("\n");

  return nextHtml.replace("</head>", `${metaTags}\n</head>`);
}

function buildStaticRoot(page) {
  const links = (page.links || [])
    .map((link) => `<a href="${escapeAttribute(link.href)}" style="color: #0284c7; text-decoration: none; font-weight: 600; margin-right: 12px;">${escapeHtml(link.label)}</a>`)
    .join("");
  const listItems = (page.items || [])
    .slice(0, 80)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const richCopyHtml = page.richCopy && page.richCopy.length > 0
    ? `<div style="margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
        <h2 style="font-size: 20px; color: #1e293b; margin-top: 0;">Overview &amp; Analysis</h2>
        ${page.richCopy.map(item => {
          if (typeof item === "object" && item.type === "table") {
            return `
              <div style="overflow-x: auto; margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                  <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                      ${item.headers.map(h => `<th style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${escapeHtml(h)}</th>`).join("")}
                    </tr>
                  </thead>
                  <tbody>
                    ${item.rows.map(row => `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        ${row.map(cell => `<td style="padding: 10px 12px; color: #475569;">${escapeHtml(cell)}</td>`).join("")}
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            `;
          }
          if (item.type === "h2") {
            return `<h2 style="font-size: 28px; color: #0f172a; margin: 32px 0 16px;">${escapeHtml(item.text)}</h2>`;
          }
          if (item.type === "h3") {
            return `<h3 style="font-size: 22px; color: #1e293b; margin: 24px 0 12px;">${escapeHtml(item.text)}</h3>`;
          }
          if (item.type === "ul") {
            return `<ul style="color: #334155; margin-bottom: 16px; padding-left: 20px;">
              ${item.items.map(li => `<li style="margin-bottom: 8px;">${li}</li>`).join("")}
            </ul>`;
          }
          return `<p style="color: #334155; margin-bottom: 16px;">${item}</p>`;
        }).join("")}
       </div>`
    : "";

  const faqHtml = page.faqs && page.faqs.length > 0
    ? `<div style="margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
        <h2 style="font-size: 20px; color: #1e293b; margin-top: 0;">Frequently Asked Questions (FAQ)</h2>
        ${page.faqs.map(faq => `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 6px 0;">Q: ${escapeHtml(faq.question)}</h3>
            <p style="color: #334155; margin: 0;">A: ${escapeHtml(faq.answer)}</p>
          </div>
        `).join("")}
       </div>`
    : "";

  return [
    '<div id="root">',
    '  <div id="app-splash" aria-live="polite" role="status">',
    '    <div id="app-splash-spinner" aria-hidden="true"></div>',
    '    <p id="app-splash-text">Loading GateQA</p>',
    '  </div>',
    '  <main class="seo-prerender" style="max-width: 860px; margin: 0 auto; padding: 32px 20px; font-family: Segoe UI, Inter, system-ui, sans-serif; line-height: 1.6; color: #0f172a;">',
    `    <p style="margin: 0 0 8px; color: #0369a1; font-size: 13px; font-weight: 700; text-transform: uppercase;">${escapeHtml(page.eyebrow || "GateQA")}</p>`,
    `    <h1 style="margin: 0; font-size: 36px; line-height: 1.15;">${escapeHtml(page.h1 || page.title)}</h1>`,
    links ? `    <nav style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px;">${links}</nav>` : "",
    listItems ? `    <ul style="margin-top: 24px; color: #334155;">${listItems}</ul>` : "",
    richCopyHtml,
    faqHtml,
    '    <p style="margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 16px; color: #64748b; font-size: 14px;">This static SEO snapshot loads the full interactive GateQA app when JavaScript is available.</p>',
    "  </main>",
    "</div>",
  ].filter(Boolean).join("\n");
}

function replaceBodyRoot(html, page) {
  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf("</body>", rootStart);
  if (rootStart === -1 || bodyEnd === -1) {
    throw new Error("Could not find the app root in dist/index.html.");
  }
  return `${html.slice(0, rootStart)}${buildStaticRoot(page)}\n${html.slice(bodyEnd)}`;
}

function renderPage(templateHtml, page) {
  return replaceBodyRoot(replaceHead(templateHtml, page), page);
}

function writePrerenderedPage(templateHtml, page) {
  const outputPath = getOutputPath(page.path);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, renderPage(templateHtml, page), "utf8");
}

function breadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function webPageSchema({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "GateQA",
      url: SITE_ORIGIN,
    },
  };
}

function qaPageSchema({ question, answerText, url }) {
  const name = `${question.title || `GATE ${question.year || ""} Question`} | GateQA`;
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    name,
    url,
    mainEntity: {
      "@type": "Question",
      name,
      text: question.preview || question.title || "",
      answerCount: answerText ? 1 : 0,
      ...(answerText
        ? {
            acceptedAnswer: {
              "@type": "Answer",
              text: answerText,
              upvoteCount: 0,
            },
          }
        : {}),
    },
  };
}

function faqPageSchema(faqs) {
  if (!faqs || faqs.length === 0) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function formatAnswer(answerRecord = null) {
  if (!answerRecord) {
    return "";
  }
  const answer = answerRecord.answer;
  if (Array.isArray(answer)) {
    return `Answer: ${answer.join(", ")}`;
  }
  if (answer !== null && answer !== undefined && String(answer).trim() !== "") {
    return `Answer: ${String(answer).trim()}`;
  }
  const note = answerRecord?.source?.note;
  return note ? `Solution note: ${truncate(note, 220)}` : "";
}

function buildSubjectPages(manifest) {
  const years = (manifest.yearSets || []).map((entry) => Number(entry.year)).filter(Number.isFinite);
  const minYear = years.length ? Math.min(...years) : 1987;
  const maxYear = years.length ? Math.max(...years) : 2026;

  return SUBJECT_SEO_MAP.map((subject) => {
    const manifestSubject = (manifest.subjects || []).find((entry) => entry.slug === subject.subjectSlug);
    const count = manifestSubject?.count || "";
    const pathName = `/subjects/${subject.urlSlug}`;
    const title = `${subject.label} GATE CS Questions | Year-wise PYQs`;
    const description = `Practice ${count || "hundreds of"} GATE Computer Science questions from ${subject.label} (${minYear}-${maxYear}) with solutions, filters, and offline support.`;
    const canonicalUrl = buildCanonicalUrl(pathName);

    const details = SUBJECT_DETAILS[subject.subjectSlug] || { richCopy: [], faqs: [] };

    return {
      path: pathName,
      canonicalUrl,
      title,
      h1: `${subject.label} GATE CS Questions`,
      eyebrow: "GATE CS Subject",
      description,
      richCopy: details.richCopy,
      faqs: details.faqs,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: buildCanonicalUrl("/") },
          { name: "Subjects", url: buildCanonicalUrl("/subjects") },
          { name: subject.label, url: canonicalUrl },
        ]),
        webPageSchema({ name: title, description, url: canonicalUrl }),
        faqPageSchema(details.faqs),
      ].filter(Boolean),
      links: [
        { href: `/practice?subjects=${encodeURIComponent(subject.subjectSlug)}`, label: `Practice ${subject.label}` },
        { href: "/practice", label: "Browse all questions" },
      ],
      items: [
        count ? `${count} questions in this subject` : "",
        `Years covered: ${minYear}-${maxYear}`,
        ...subject.topics.map((topic) => `Topic: ${topic}`),
      ].filter(Boolean),
    };
  });
}

function buildYearPages(manifest) {
  const years = Array.from(new Set((manifest.yearSets || [])
    .map((entry) => Number(entry.year))
    .filter((year) => Number.isFinite(year) && year >= 2015)))
    .sort((left, right) => right - left);

  return years.map((year) => {
    const yearSets = (manifest.yearSets || []).filter((entry) => Number(entry.year) === year);
    const totalQuestions = yearSets.reduce((sum, entry) => sum + Number(entry.count || 0), 0);
    const setCount = yearSets.length;
    const pathName = `/gate-${year}-pyq`;
    const title = `GATE ${year} CS Questions - PYQ with Solutions | GateQA`;
    const description = `Practice all ${totalQuestions || ""}${totalQuestions ? " " : ""}GATE ${year} CS questions${setCount > 1 ? ` across ${setCount} sets` : ""} with subject-wise filters, solutions, and offline support.`;
    const canonicalUrl = buildCanonicalUrl(pathName);

    const yearFaqs = [
      {
        question: `What was the structure of the GATE CS ${year} paper?`,
        answer: `The GATE CS ${year} paper consisted of 65 questions worth a total of 100 marks. It contained technical computer science questions along with General Aptitude questions.`
      },
      {
        question: `Why should I practice GATE CS ${year} previous year questions?`,
        answer: `Practicing the actual ${year} paper helps you understand the exam pattern, question style, topic distribution, and helps you practice time management under simulated conditions.`
      },
      {
        question: `Are detailed solutions available for GATE CS ${year} questions on GateQA?`,
        answer: `Yes, GateQA provides full interactive practice, instant answer checks, and step-by-step solutions for all questions in the ${year} paper.`
      }
    ];

    const yearRichCopy = [
      `The Graduate Aptitude Test in Engineering (GATE) Computer Science exam for the year ${year} is an essential benchmark paper for aspiring post-graduates and public-sector engineers. The questions in this paper cover the entire CSE syllabus, including core engineering subjects and math.`,
      `Practicing the full ${year} paper as a mock test or through topic-wise questions allows you to evaluate your strengths and target weak areas before the actual exam.`
    ];

    return {
      path: pathName,
      canonicalUrl,
      title,
      h1: `GATE ${year} CS Questions`,
      eyebrow: "GATE CS Paper",
      description,
      richCopy: yearRichCopy,
      faqs: yearFaqs,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: buildCanonicalUrl("/") },
          { name: "GATE PYQ", url: buildCanonicalUrl("/gate-pyq") },
          { name: `GATE ${year}`, url: canonicalUrl },
        ]),
        webPageSchema({ name: title, description, url: canonicalUrl }),
        faqPageSchema(yearFaqs),
      ].filter(Boolean),
      links: [
        { href: `/practice?years=${year}`, label: `Practice GATE ${year}` },
        { href: "/mock?stage=setup", label: "Take mock test" },
      ],
      items: [
        totalQuestions ? `${totalQuestions} questions` : "",
        setCount ? `${setCount} paper set${setCount === 1 ? "" : "s"}` : "",
        "Total marks: 100",
      ].filter(Boolean),
    };
  });
}

function selectQuestionPages(searchIndex, answersByQuestionUid) {
  return searchIndex
    .filter((question) => question?.question_uid && question?.year && question.subjectSlug !== "legacy-other")
    .map((question) => ({
      question,
      score:
        Number(question.year || 0) * 100
        + (question.subjectSlug === "ga" ? 0 : 40)
        + (answersByQuestionUid[question.question_uid] ? 25 : 0)
        + Math.min(String(question.preview || "").length, 180) / 10,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return String(left.question.question_uid).localeCompare(String(right.question.question_uid));
    })
    .slice(0, QUESTION_PRERENDER_LIMIT)
    .map(({ question }) => question);
}

function buildQuestionPages(searchIndex, answersByQuestionUid) {
  return selectQuestionPages(searchIndex, answersByQuestionUid).map((question) => {
    const encodedUid = encodeURIComponent(question.question_uid);
    const pathName = `/practice/question/${encodedUid}`;
    const canonicalUrl = buildCanonicalUrl(pathName);
    const answerText = formatAnswer(answersByQuestionUid[question.question_uid]);
    const subject = SUBJECT_BY_INTERNAL_SLUG.get(question.subjectSlug);
    const title = `${question.title || `GATE ${question.year} Question`} - ${question.subjectLabel || "GATE CS"} | GateQA`;
    const description = truncate(
      `${question.preview || "Practice this GATE CS previous-year question."} ${answerText || "Open the question for the full solution."}`,
      180
    );
    const crumbs = [
      { name: "Home", url: buildCanonicalUrl("/") },
      subject
        ? { name: subject.label, url: buildCanonicalUrl(`/subjects/${subject.urlSlug}`) }
        : { name: "Practice", url: buildCanonicalUrl("/practice") },
      { name: `GATE ${question.year}`, url: buildCanonicalUrl(`/gate-${question.year}-pyq`) },
      { name: question.title || question.question_uid, url: canonicalUrl },
    ];

    return {
      path: pathName,
      canonicalUrl,
      title,
      h1: question.title || `GATE ${question.year} Question`,
      eyebrow: question.subjectLabel || "GATE CS Question",
      description,
      ogType: "article",
      schemas: [
        breadcrumbSchema(crumbs),
        qaPageSchema({ question, answerText, url: canonicalUrl }),
      ],
      links: [
        { href: pathName, label: "Open interactive question" },
        { href: `/practice?years=${question.year}`, label: `More GATE ${question.year} questions` },
        subject ? { href: `/subjects/${subject.urlSlug}`, label: `More ${subject.label}` } : null,
      ].filter(Boolean),
      items: [
        question.subjectLabel ? `Subject: ${question.subjectLabel}` : "",
        question.yearSetLabel ? `Paper: ${question.yearSetLabel}` : "",
        question.type ? `Question type: ${question.type}` : "",
        answerText,
      ].filter(Boolean),
    };
  });
}

function buildHomePage() {
  const title = "GateQA — GATE CS PYQs, Mock Tests, Aptitude Practice & Calculator";
  const description = "Practice 3,500+ GATE CS PYQs from 1987\u20132026. Subject-wise filters, year-wise mock tests, aptitude questions, offline support, and a built-in GATE calculator.";
  const canonicalUrl = buildCanonicalUrl("/");
  const homepageFaqs = [
    {
      question: "What is the GATE CS exam?",
      answer: "GATE (Graduate Aptitude Test in Engineering) CS is a national-level exam testing Computer Science fundamentals for M.Tech admissions and PSU jobs."
    },
    {
      question: "How many GATE CS previous year questions are available on GateQA?",
      answer: "GateQA provides 3,500+ GATE CS previous-year questions from 1987 to 2026, spanning all 14 subjects in the official GATE CSE syllabus."
    },
    {
      question: "Is GateQA free?",
      answer: "Yes, GateQA is 100% free. No login, no payment, no subscription. All features including offline mode work without an account."
    },
    {
      question: "Which subjects does GATE CS cover?",
      answer: "GATE CS covers: Algorithms, Data Structures, Operating Systems, DBMS, Computer Networks, Theory of Computation, Compiler Design, Digital Logic, Computer Organization, Engineering Mathematics, Discrete Mathematics, and Software Engineering."
    },
    {
      question: "How can I practice GATE 2027 questions?",
      answer: "Start by practicing GATE CS previous year questions from 2024, 2025, and 2026 on GateQA to understand the current exam pattern."
    },
  ];

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GateQA",
    url: SITE_ORIGIN,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_ORIGIN}/practice?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return {
    path: "/",
    canonicalUrl,
    title,
    h1: "GATE CS Previous Year Questions \u2014 Free Practice Platform",
    eyebrow: "GateQA",
    description,
    richCopy: [
      "GateQA is India's most comprehensive free GATE CS preparation platform. Access over 3,500 previous-year questions from 1987 to 2026, with subject-wise filters across all 14 GATE CSE topics including Operating Systems, Algorithms, DBMS, Computer Networks, Theory of Computation, Discrete Mathematics, Compiler Design, Digital Logic, and Engineering Mathematics.",
      "Practice smarter with year-wise mock tests using actual past GATE papers, track your performance with topic-level insights, bookmark difficult questions, and study offline \u2014 all for free, with no login required."
    ],
    faqs: homepageFaqs,
    schemas: [
      siteSchema,
      breadcrumbSchema([{ name: "Home", url: canonicalUrl }]),
      webPageSchema({ name: title, description, url: canonicalUrl }),
      faqPageSchema(homepageFaqs),
    ].filter(Boolean),
    links: [
      { href: "/gate-cs-pyq", label: "Browse GATE CS PYQs" },
      { href: "/mock-tests", label: "Take a Mock Test" },
      { href: "/gate-aptitude", label: "Practice Aptitude" },
    ],
  };
}

function buildAliasPages() {
  return EDITORIAL_PAGES.map((alias) => {
    const canonicalUrl = buildCanonicalUrl(alias.path);
    const breadcrumbs = alias.breadcrumbs.map((bc) => ({
      name: bc.name,
      url: bc.url.replace("https://gateqa.in", SITE_ORIGIN),
    }));

    return {
      path: alias.path,
      canonicalUrl,
      title: `${alias.keyword} | GateQA`,
      h1: alias.h1,
      description: alias.description,
      eyebrow: alias.eyebrow,
      richCopy: alias.richCopy || [],
      faqs: alias.faqs || [],
      schemas: [
        breadcrumbSchema(breadcrumbs),
        webPageSchema({ name: alias.h1, description: alias.description, url: canonicalUrl }),
        alias.faqs && alias.faqs.length > 0 ? faqPageSchema(alias.faqs) : null,
      ].filter(Boolean),
      links: [{ href: alias.ctaHref, label: alias.ctaLabel }],
    };
  });
}

function buildBlogPage() {
  const canonicalUrl = buildCanonicalUrl("/blog");
  const breadcrumbs = [
    { name: "Home", url: buildCanonicalUrl("/") },
    { name: "Blog", url: canonicalUrl },
  ];
  return {
    path: "/blog",
    canonicalUrl,
    title: "GateQA Blog — Exam Information, Syllabus & Study Guides",
    h1: "Prep Guides & Exam Insights",
    description: "Access deep-dive preparation resources, syllabus topics, patterns, cutoffs, subject weightage, and subject-wise guides for GATE CS & Aptitude.",
    eyebrow: "Preparation Hub",
    richCopy: [
      "Access deep-dive preparation resources, syllabus topics, patterns, cutoffs, subject weightage, and subject-wise guides for GATE CS & Aptitude."
    ],
    faqs: [],
    schemas: [
      breadcrumbSchema(breadcrumbs),
      webPageSchema({ name: "Prep Guides & Exam Insights", description: "Access deep-dive preparation resources, syllabus topics, patterns, cutoffs, subject weightage, and subject-wise guides for GATE CS & Aptitude.", url: canonicalUrl }),
    ],
    links: EDITORIAL_PAGES.filter((page) => page.showInBlog === true).map((page) => ({ href: page.path, label: page.keyword })),
  };
}

function main() {
  const templatePath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(templatePath)) {
    throw new Error("dist/index.html not found. Run vite build before prerendering SEO pages.");
  }

  const manifest = readJson(path.join(PUBLIC_DIR, "question-bank-manifest.json"), {});
  const searchIndex = readJson(path.join(PUBLIC_DIR, "question-search-index.json"), []);
  const answersPayload = readJson(path.join(PUBLIC_DIR, "data", "answers", "answers_by_question_uid_v1.json"), {});
  const answersByQuestionUid = answersPayload?.records_by_question_uid || {};
  const templateHtml = fs.readFileSync(templatePath, "utf8");

  if (!Array.isArray(searchIndex)) {
    throw new Error("public/question-search-index.json must be an array.");
  }

  const pages = [
    buildHomePage(),
    buildBlogPage(),
    ...buildAliasPages(),
    ...buildSubjectPages(manifest),
    ...buildYearPages(manifest),
    ...buildQuestionPages(searchIndex, answersByQuestionUid),
  ];

  pages.forEach((page) => writePrerenderedPage(templateHtml, page));

  const report = {
    generatedAt: new Date().toISOString(),
    questionPrerenderLimit: QUESTION_PRERENDER_LIMIT,
    pageCount: pages.length,
    pages: pages.map((page) => page.path),
  };
  fs.writeFileSync(path.join(DIST_DIR, "seo-prerender-manifest.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(`[prerender-seo-pages] Wrote ${pages.length} static SEO pages (${QUESTION_PRERENDER_LIMIT} question-page limit).`);
}

main();
