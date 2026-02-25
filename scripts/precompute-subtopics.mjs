/**
 * precompute-subtopics.mjs
 *
 * Runs at build-time (prebuild / predev) to pre-normalize every subtopic and
 * subject alias so that QuestionService never has to run regex at runtime.
 *
 * Output: src/generated/subtopicLookup.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '..', 'src', 'generated');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'subtopicLookup.json');

// ── Inline copies of the two pure functions from QuestionService ──────────
const normalizeString = (str) =>
    String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const slugifyToken = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// ── Source-of-truth data (keep in sync with QuestionService.TOPIC_HIERARCHY) ─
const TOPIC_HIERARCHY = {
    'Discrete Mathematics': [
        'Combinatory', 'Balls In Bins', 'Counting', 'Generating Functions', 'Modular Arithmetic',
        'Pigeonhole Principle', 'Recurrence Relation', 'Summation', 'Degree of Graph', 'Graph Coloring',
        'Graph Connectivity', 'Graph Isomorphism', 'Graph Matching', 'Graph Planarity', 'First Order Logic',
        'Logical Reasoning', 'Propositional Logic', 'Binary Operation', 'Countable Uncountable Set',
        'Functions', 'Group Theory', 'Identify Function', 'Lattice', 'Mathematical Induction',
        'Number Theory', 'Onto', 'Partial Order', 'Polynomials', 'Relations', 'Set Theory'
    ],
    'Engineering Mathematics': [
        'Calculus', 'Continuity', 'Definite Integral', 'Differentiation', 'Integration', 'Limits',
        'Maxima Minima', 'Polynomials', 'Linear Algebra', 'Cartesian Coordinates', 'Determinant',
        'Eigen Value', 'Gaussian Elimination', 'Lu Decomposition', 'Matrix', 'Orthonormality',
        'Rank of Matrix', 'Singular Value Decomposition', 'Subspace', 'System of Equations', 'Vector Space',
        'Probability', 'Bayes Theorem', 'Bayesian Network', 'Bernoulli Distribution', 'Binomial Distribution',
        'Conditional Probability', 'Continuous Distribution', 'Expectation', 'Exponential Distribution',
        'Independent Events', 'Normal Distribution', 'Poisson Distribution', 'Probability Density Function',
        'Probability Distribution', 'Random Variable', 'Square Invariant', 'Statistics', 'Uniform Distribution',
        'Variance'
    ],
    'General Aptitude': [
        'Analytical Aptitude', 'Age Relation', 'Code Words', 'Coding Decoding', 'Counting Figure',
        'Direction Sense', 'Family Relationship', 'Inequality', 'Logical Inference', 'Logical Reasoning',
        'Number Relations', 'Odd One', 'Passage Reading', 'Round Table Arrangement', 'Seating Arrangement',
        'Sequence Series', 'Statements Follow', 'Quantitative Aptitude', 'Absolute Value', 'Algebra',
        'Alligation Mixture', 'Area', 'Arithmetic Series', 'Average', 'Bar Graph', 'Calendar',
        'Cartesian Coordinates', 'Circle', 'Clock Time', 'Combinatory', 'Compound Interest',
        'Conditional Probability', 'Cones', 'Contour Plots', 'Cost Market Price', 'Counting', 'Cube',
        'Currency Notes', 'Curves', 'Data Interpretation', 'Digital Image Processing', 'Factors',
        'Fractions', 'Functions', 'Geometry', 'Graph Coloring', 'Inequality', 'LCM HCF', 'Line Graph',
        'Lines', 'Logarithms', 'Maps', 'Maxima Minima', 'Mensuration', 'Modular Arithmetic', 'Number Series',
        'Number System', 'Number Theory', 'Numerical Computation', 'Percentage', 'Permutation and Combination',
        'Pie Chart', 'Polynomials', 'Powers', 'Prime Numbers', 'Probability', 'Probability Density Function',
        'Profit Loss', 'Quadratic Equations', 'Radar Chart', 'Ratio Proportion', 'Scatter Plot',
        'Seating Arrangement', 'Sequence Series', 'Set Theory', 'Speed Time Distance', 'Squares', 'Statistics',
        'System of Equations', 'Tables', 'Tabular Data', 'Triangles', 'Trigonometry', 'Unit Digit',
        'Venn Diagram', 'Volume', 'Work Time', 'Spatial Aptitude', 'Assembling Pieces', 'Counting Figure',
        'Grouping', 'Image Rotation', 'Mirror Image', 'Paper Folding', 'Patterns In Three Dimensions',
        'Patterns In Two Dimensions', 'Verbal Aptitude', 'Articles', 'Comparative Forms', 'English Grammar',
        'Grammatical Error', 'Incorrect Sentence Part', 'Most Appropriate Word', 'Narrative Sequencing',
        'Noun Verb Adjective', 'Opposite', 'Passage Reading', 'Phrasal Verb', 'Phrase Meaning',
        'Prepositions', 'Pronouns', 'Sentence Ordering', 'Statement Sufficiency', 'Statements Follow',
        'Synonyms', 'Tenses', 'Verbal Reasoning', 'Word Meaning', 'Word Pairs'
    ],
    Algorithms: [
        'Algorithm Design', 'Algorithm Design Technique', 'Asymptotic Notation', 'Asymptotic Notations',
        'Bellman Ford', 'Binary Search', 'Bitonic Array', 'Depth First Search', 'Dijkstras Algorithm',
        'Directed Graph', 'Double Hashing', 'Dynamic Programming', 'Graph Algorithms', 'Graph Search',
        'Greedy Algorithms', 'Hashing', 'Huffman Code', 'Identify Function', 'Insertion Sort',
        'Linear Probing', 'Matrix Chain Ordering', 'Merge Sort', 'Merging', 'Minimum Spanning Tree',
        'Prims Algorithm', 'Quick Sort', 'Recurrence Relation', 'Recursion', 'Searching', 'Shortest Path',
        'Sorting', 'Space Complexity', 'Strongly Connected Components', 'Time Complexity', 'Topological Sort'
    ],
    'CO & Architecture': [
        'Addressing Modes', 'Average Memory Access Time', 'CISC RISC Architecture', 'Cache Memory',
        'Clock Cycles', 'DMA', 'Data Dependency', 'Data Path', 'IO Handling', 'Instruction Execution',
        'Instruction Format', 'Instruction Set Architecture', 'Interrupts', 'Machine Instruction',
        'Memory Interfacing', 'Microprogramming', 'Pipelining', 'Runtime Environment', 'Speedup', 'Virtual Memory'
    ],
    'Compiler Design': [
        'Assembler', 'Backpatching', 'Basic Blocks', 'Code Optimization', 'Compilation Phases',
        'Expression Evaluation', 'First and Follow', 'Grammar', 'Intermediate Code', 'LR Parser',
        'Lexical Analysis', 'Linker', 'Live Variable Analysis', 'Macros', 'Operator Precedence',
        'Parameter Passing', 'Parsing', 'Register Allocation', 'Runtime Environment', 'Static Single Assignment',
        'Symbol Table', 'Syntax Directed Translation', 'Variable Scope'
    ],
    'Computer Networks': [
        'Application Layer Protocols', 'Arp', 'Bit Stuffing', 'Bridges', 'CRC Polynomial', 'CSMA CD',
        'Channel Utilization', 'Communication', 'Congestion Control', 'Distance Vector Routing',
        'Error Detection', 'Ethernet', 'Fragmentation', 'IP Addressing', 'IP Packet', 'LAN Technologies',
        'MAC Protocol', 'Network Flow', 'Network Layering', 'Network Protocols', 'Network Switching',
        'Osi Model', 'Probability', 'Routing', 'Routing Protocols', 'Sliding Window', 'Sockets',
        'Stop and Wait', 'Subnetting', 'TCP', 'Token Bucket', 'UDP'
    ],
    Databases: [
        'B Tree', 'Candidate Key', 'Conflict Serializable', 'Database Design', 'Database Normalization',
        'Decomposition', 'ER Diagram', 'Functional Dependency', 'Indexing', 'Joins', 'Multivalued Dependency 4nf',
        'Natural Join', 'Query', 'Referential Integrity', 'Relational Algebra', 'Relational Calculus',
        'Relational Model', 'SQL', 'Transaction and Concurrency', 'Tuple Relational Calculus'
    ],
    'Digital Logic': [
        'Adder', 'Array Multiplier', 'Boolean Algebra', 'Booths Algorithm', 'Canonical Normal Form',
        'Carry Generator', 'Circuit Output', 'Combinational Circuit', 'Decoder', 'Digital Circuits',
        'Digital Counter', 'Finite State Machines', 'Fixed Point Representation', 'Flip Flop',
        'Floating Point Representation', 'Functional Completeness', 'IEEE Representation', 'K Map',
        'Memory Interfacing', 'Min No Gates', 'Min Products of Sum Form', 'Min Sum of Products Form',
        'Multiplexer', 'Number Representation', 'Prime Implicants', 'ROM', 'Ripple Counter Operation',
        'Sequential Circuit', 'Shift Registers', 'Static Hazard', 'Synchronous Asynchronous Circuits'
    ],
    'Operating System': [
        'Context Switch', 'Deadlock Prevention Avoidance Detection', 'Disk', 'Disk Scheduling', 'File System',
        'Fork System Call', 'IO Handling', 'Input Output', 'Inter Process Communication', 'Interrupts',
        'Linked Allocation', 'Memory Management', 'Multilevel Paging', 'OS Protection', 'Optimal Page Replacement',
        'Page Replacement', 'Precedence Graph', 'Process', 'Process Scheduling', 'Process Synchronization',
        'Resource Allocation', 'Resource Allocation Graph', 'Semaphore', 'Srtf', 'System Calls', 'Threads',
        'Virtual Memory'
    ],
    'Programming and DS': [
        'AVL Tree', 'Array', 'Binary Heap', 'Binary Search Tree', 'Binary Tree', 'Data Structures',
        'Hashing', 'Infix Prefix', 'Linked List', 'Number of Swap', 'Priority Queue', 'Queue', 'Stack',
        'Time Complexity', 'Tree'
    ],
    'Programming in C': [
        'Aliasing', 'Array', 'Functions', 'Goto', 'Identify Function', 'Loop Invariants', 'Output',
        'Parameter Passing', 'Pointers', 'Programming Constructs', 'Programming In C', 'Programming Paradigms',
        'Recursion', 'Strings', 'Structure', 'Switch Case', 'Type Checking', 'Union', 'Variable Binding'
    ],
    'Theory of Computation': [
        'Closure Property', 'Context Free Grammar', 'Context Free Language', 'Countable Uncountable Set',
        'Decidability', 'Dpda', 'Finite Automata', 'Finite State Machines', 'Identify Class Language',
        'Minimal State Automata', 'Non Determinism', 'Number of States', 'Pumping Lemma', 'Pushdown Automata',
        'Recursive and Recursively Enumerable Languages', 'Reduction', 'Regular Expression', 'Regular Grammar',
        'Regular Language'
    ]
};

const SUBJECT_ALIAS_OVERRIDES = {
    Algorithms: ['algorithms'],
    'CO & Architecture': ['co-and-architecture', 'computer-organization-and-architecture', 'computer-architecture', 'coa'],
    'Compiler Design': ['compiler-design'],
    'Computer Networks': ['computer-networks', 'cn'],
    Databases: ['databases', 'dbms', 'database-management-systems'],
    'Digital Logic': ['digital-logic'],
    'Discrete Mathematics': ['discrete-mathematics', 'discrete-math'],
    'Engineering Mathematics': ['engineering-mathematics', 'engg-math'],
    'General Aptitude': ['general-aptitude', 'ga'],
    'Operating System': ['operating-system', 'os'],
    'Programming and DS': ['programming-and-ds', 'programming-ds', 'prog-ds'],
    'Programming in C': ['programming-in-c', 'c-programming', 'prog-c'],
    'Theory of Computation': ['theory-of-computation', 'toc']
};

// ── Build lookup structures ──────────────────────────────────────────────

/**
 * subtopicsBySubject:
 *   { [subjectLabel]: { [normalizedString]: { slug, label } } }
 *
 * normalizedSubtopicsBySubject:
 *   { [subjectLabel]: [ normalizedString, normalizedString, ... ] }
 *
 * subjectAliases:
 *   { [subjectLabel]: [ normalizedAlias, normalizedAlias, ... ] }
 */

const subtopicsBySubject = {};
const normalizedSubtopicsBySubject = {};
const subjectAliases = {};

for (const [subject, subtopics] of Object.entries(TOPIC_HIERARCHY)) {
    const lookup = {};
    const normalized = [];

    for (const sub of subtopics) {
        const norm = normalizeString(sub);
        normalized.push(norm);
        lookup[norm] = {
            slug: slugifyToken(sub),
            label: sub
        };
    }

    subtopicsBySubject[subject] = lookup;
    normalizedSubtopicsBySubject[subject] = normalized;

    // Build aliases for this subject
    const aliases = new Set();
    const addAlias = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return;
        aliases.add(normalizeString(raw));
        aliases.add(normalizeString(raw.replace(/-/g, ' ')));
    };

    addAlias(subject);
    addAlias(subject.replace(/&/g, 'and'));

    const slug = subject
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    addAlias(slug);

    const customAliases = SUBJECT_ALIAS_OVERRIDES[subject] || [];
    customAliases.forEach(addAlias);

    subjectAliases[subject] = Array.from(aliases).filter(Boolean);
}

// ── Write output ─────────────────────────────────────────────────────────

const output = {
    _generatedAt: new Date().toISOString(),
    _comment: 'Auto-generated by scripts/precompute-subtopics.mjs — do NOT edit manually.',
    subtopicsBySubject,
    normalizedSubtopicsBySubject,
    subjectAliases
};

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
console.log(`[precompute] Wrote ${OUTPUT_FILE}`);
console.log(`[precompute]   Subjects: ${Object.keys(subtopicsBySubject).length}`);
console.log(`[precompute]   Total subtopic entries: ${Object.values(normalizedSubtopicsBySubject).reduce((a, b) => a + b.length, 0)}`);
