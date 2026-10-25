import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_DSA_17_TO_20_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-DSA-17 (GATE CSE 2008 Part 1)
  // ==========================================

  "go:405": {
    concept: "Graph Theory - Connected Components Traversal Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - In an undirected graph $G = (V, E)$ with $n = |V|$ vertices and $m = |E|$ edges, a **connected component** is a maximal connected subgraph.
  - Finding all connected components can be performed using standard graph traversal algorithms (Breadth-First Search or Depth-First Search).
- **Time Complexity Analysis**:
  1. Initialize all $n$ vertices as unvisited: $O(n)$ time.
  2. Iterate through all vertices $v \\in V$:
     - If $v$ is not yet visited, start a new BFS or DFS from $v$, which identifies and marks all vertices in $v$'s connected component.
  3. Across the entire execution of the algorithm, each vertex is visited once and each edge is examined twice (once from each endpoint).
  4. Total time spent across all BFS/DFS traversals:
     $$\\text{Time} = \\Theta(|V| + |E|) = \\Theta(m + n)$$
  5. This is asymptotically optimal, since any algorithm must inspect every vertex and every edge to determine connectivity.

Therefore, the correct answer is **Option C (\\Theta(m + n))**.`,
    images: []
  },

  "go:416": {
    concept: "C Programming - Ternary Conditional Operator Nesting & Maximum Function",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the nested conditional (ternary) expression:
    $$a = (x > y) \\; ? \\; ((x > z) \\; ? \\; x : z) \\; : \\; ((y > z) \\; ? \\; y : z)$$
- **Logic Simplification**:
  1. If $x > y$:
     - The true branch evaluates $(x > z) \\; ? \\; x : z = \\max(x, z)$.
     - Since $x > y$, $\\max(x, z) = \\max(x, y, z)$.
  2. If $x \\le y$:
     - The false branch evaluates $(y > z) \\; ? \\; y : z = \\max(y, z)$.
     - Since $y \\ge x$, $\\max(y, z) = \\max(x, y, z)$.
  3. Therefore, the expression computes:
     $$a = \\max(x, y, z)$$
- **Evaluating Option Combinations for $a = 4$**:
  - **Option A ($x = 3, y = 4, z = 2$)**:
    $$\\max(3, 4, 2) = 4 \\implies a = 4 \\quad (\\text{Matches!})$$
  - **Option B ($x = 6, y = 5, z = 3$)**:
    $$\\max(6, 5, 3) = 6 \\ne 4$$
  - **Option C ($x = 6, y = 3, z = 5$)**:
    $$\\max(6, 3, 5) = 6 \\ne 4$$
  - **Option D ($x = 5, y = 4, z = 5$)**:
    $$\\max(5, 4, 5) = 5 \\ne 4$$

Therefore, the correct answer is **Option A (x = 3, y = 4, z = 2)**.`,
    images: []
  },

  "go:417": {
    concept: "Graph Theory - Breadth-First Search Queue-Based Traversal Simulation",
    markdown: `- **Concept / Theoretical Foundation**:
  - In Breadth-First Search (BFS) using a FIFO queue:
    - Enqueue the start vertex.
    - While the queue is not empty, dequeue vertex $u$, visit it, and enqueue all unvisited neighbors of $u$.
- **Trace Starting from Vertex Q**:
  1. Start at node **Q**: enqueue Q $\\to$ Queue: $[Q]$.
  2. Dequeue **Q**: visit Q. Neighbors of Q in the graph are M, N, P.
     - Enqueue M, N, P in order $\\to$ Queue: $[M, N, P]$.
  3. Dequeue **M**: visit M. (M connects to Q and N; N is already in queue).
  4. Dequeue **N**: visit N. Neighbor of N is R.
     - Enqueue R $\\to$ Queue: $[P, R]$.
  5. Dequeue **P**: visit P. Neighbor of P is O.
     - Enqueue O $\\to$ Queue: $[R, O]$.
  6. Dequeue **R**: visit R.
  7. Dequeue **O**: visit O.
  8. Resulting visit sequence:
     $$\\mathbf{Q \\; M \\; N \\; P \\; R \\; O}$$

Therefore, the correct answer is **Option C (QMNPRO)**.`,
    images: ["/Gate_QA/question-images/3899097234327159239.webp"]
  },

  "go:450": {
    concept: "Algorithms - Asymptotic Growth Ordering of Exponential, Factorial, and Quasi-Polynomial",
    markdown: `- **Concept / Theoretical Foundation**:
  - We compare the asymptotic growth rates of the three functions:
    $$f(n) = 2^n, \\quad g(n) = n!, \\quad h(n) = n^{\\log n}$$
- **Comparative Asymptotic Analysis**:
  1. **Comparing $h(n)$ and $f(n)$**:
     - Express $h(n)$ with base 2:
       $$h(n) = n^{\\log_2 n} = (2^{\\log_2 n})^{\\log_2 n} = 2^{(\\log_2 n)^2}$$
     - Compare the exponents: $(\\log_2 n)^2$ versus $n$.
     - Since $\\lim_{n \\to \\infty} \\frac{(\\log_2 n)^2}{n} = 0$, we have $(\\log_2 n)^2 = o(n)$.
     - Therefore:
       $$h(n) = o(f(n)) \\implies h(n) = O(f(n))$$
  2. **Comparing $g(n)$ and $f(n)$**:
     - By Stirling's approximation, $n! \\approx \\sqrt{2\\pi n} \\left(\\frac{n}{e}\\right)^n$.
     - For large $n$, $n/e > 2$ (since $n > 2e \\approx 5.436$), so $(n/e)^n$ grows strictly faster than $2^n$.
     - Therefore:
       $$\\lim_{n \\to \\infty} \\frac{n!}{2^n} = \\infty \\implies g(n) = \\Omega(f(n))$$
  3. Combining these relationships:
     $$h(n) = O(f(n)) \\quad \\text{and} \\quad g(n) = \\Omega(f(n))$$

Therefore, the correct answer is **Option D (h(n) = O(f(n)); g(n) = \\Omega(f(n)))**.`,
    images: []
  },

  "go:452": {
    concept: "Algorithms - Majority Element Verification in Sorted Array Binary Search",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **majority element** in an array of $n$ elements is an integer that appears strictly more than $\\lfloor n/2 \\rfloor$ times.
  - In a **sorted** array $A[0 \\dots n-1]$, if a majority element exists, it **must be present at index $\\lfloor n/2 \\rfloor$**.
- **Optimal Verification Algorithm**:
  1. Identify candidate: $x = A[\\lfloor n/2 \\rfloor]$. (Takes $O(1)$ access).
  2. To verify if $x$ appears $> n/2$ times:
     - Use binary search to find the **first (leftmost) occurrence** of $x$: index $first$.
       $$\\text{Binary Search Time} = \\Theta(\\log n)$$
     - Check whether the element at index $first + \\lfloor n/2 \\rfloor$ equals $x$:
       $$\\text{If } A[first + \\lfloor n/2 \\rfloor] == x \\implies \\text{count} > n/2$$
     - This check takes $1$ comparison.
  3. Total number of comparisons performed is dominated by the binary search:
     $$\\text{Comparisons} = \\Theta(\\log n)$$

Therefore, the correct answer is **Option B (\\Theta(\\log n))**.`,
    images: []
  },

  "go:455": {
    concept: "Algorithms - Quicksort Recurrence with Guaranteed Minimum Split Fraction",
    markdown: `- **Concept / Theoretical Foundation**:
  - In Quicksort, let $n$ be the number of elements to sort, and let partitioning require $n$ comparisons.
  - We are given that the pivot selection guarantees that each of the two sub-lists contains at least one-fifth of the elements:
    $$\\text{Size of smaller partition} \\ge \\frac{n}{5}$$
    $$\\text{Size of larger partition} \\le n - \\frac{n}{5} = \\frac{4n}{5}$$
- **Worst-Case Recurrence Derivation**:
  1. The worst-case comparison count $T(n)$ occurs when the split is as unbalanced as permitted by the guarantee, i.e., sizes $\\frac{n}{5}$ and $\\frac{4n}{5}$.
  2. Adding the $n$ partitioning comparisons:
     $$T(n) \\le T(n/5) + T(4n/5) + n$$
  3. By the Akra-Bazzi method or recursion tree, the solution to this recurrence is $T(n) = \\Theta(n \\log n)$.

Therefore, the correct answer is **Option B (T(n) <= T(n/5) + T(4n/5) + n)**.`,
    images: []
  },

  "go:457": {
    concept: "Algorithms - Dijkstra Single-Source Shortest Paths Correctness Scope",
    markdown: `- **Concept / Theoretical Foundation**:
  - Dijkstra's single-source shortest path algorithm operates by greedily finalizing distances to vertices in non-decreasing order of distance from source $a$.
- **Graph Topology & Path Distance Evaluation**:
  - Inspecting the graph rooted at vertex $a$:
    - All edge weights along the directed/undirected structure from $a$ are non-negative.
    - Because no negative-weight cycles or negative edges distort the subpaths, Dijkstra's greedy distance relaxations correctly compute the exact shortest path distance from source $a$ to **all the vertices** in the graph.

Therefore, the correct answer is **Option D (all the vertices)**.`,
    images: ["/Gate_QA/question-images/14827848283905626683.webp"]
  },

  "go:458": {
    concept: "Data Structures - Linear-Time Binary Search Tree Reconstruction from Postorder",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given the postorder traversal $P$ of a Binary Search Tree on $n$ elements $\\{1, 2, \\dots, n\\}$.
  - Because it is a BST, the in-order traversal is inherently known: it is simply the sorted sequence $1, 2, \\dots, n$.
- **Linear Time Reconstruction**:
  1. In postorder traversal (Left, Right, Root), the last element of any subtree sequence is its **root**.
  2. We can reconstruct the BST in a single right-to-left scan of the postorder sequence using recursive range bounds $[\\text{min}, \\text{max}]$:
     - The current element $P[k]$ belongs to the current subtree if $\\text{min} < P[k] < \\text{max}$.
     - Recursively construct the right subtree with range $[P[k], \\text{max}]$, then the left subtree with range $[\\text{min}, P[k]]$.
  3. Every node is processed exactly once, performing $O(1)$ comparisons per node.
  4. The overall time complexity of this optimal algorithm is:
     $$\\Theta(n)$$

Therefore, the correct answer is **Option B (\\Theta(n))**.`,
    images: []
  },

  "go:459": {
    concept: "Data Structures - Bulk Insertion into Binary Heap via Build-Heap",
    markdown: `- **Concept / Theoretical Foundation**:
  - We have an existing binary heap on $n$ elements and wish to insert $n$ more elements (a batch of $n$ items, *"not necessarily one after another"*).
- **Complexity Comparison**:
  1. **Sequential Insertion**:
     - Inserting elements one by one takes $\\sum_{k=n}^{2n-1} O(\\log k) = \\Theta(n \\log n)$ time.
  2. **Bulk Insertion via Floyd's Build-Heap**:
     - Append all $n$ new elements to the array backing the heap (total size becomes $2n$).
     - Execute **Floyd's bottom-up \`BUILD-HEAP\` algorithm** on the combined array of $2n$ elements.
     - Floyd's algorithm runs in linear time with respect to the total number of elements:
       $$\\text{Time} = \\Theta(2n) = \\Theta(n)$$
  3. Therefore, the optimal time required for the operation is $\\Theta(n)$.

Therefore, the correct answer is **Option B (\\Theta(n))**.`,
    images: []
  },

  "go:483": {
    concept: "C Programming - Pointer to Pointer and Pass-by-Reference Tracing",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the C code with single and double pointers:
    \`\`\`c
    int f(int x, int *py, int **ppz) {
        int y, z;
        **ppz += 1; z = **ppz;
        *py += 2; y = *py;
        x += 3;
        return x + y + z;
    }
    void main() {
        int c, *b, **a;
        c = 4; b = &c; a = &b;
        printf("%d", f(c, b, a));
    }
    \`\`\`
- **Step-by-Step Execution Trace**:
  1. In \`main\`: $c = 4$. \`b\` points to \`c\`. \`a\` points to \`b\`.
  2. In \`f(x, py, ppz)\`:
     - $x$ is a local copy of $c$: $x = 4$.
     - \`py\` points to $c$.
     - \`ppz\` points to \`b\`, so \`*ppz\` is \`b\`, and \`**ppz\` aliases $c$.
  3. \`**ppz += 1; z = **ppz;\`:
     - $c = 4 + 1 = 5$.
     - $z = 5$.
  4. \`*py += 2; y = *py;\`:
     - $c = 5 + 2 = 7$.
     - $y = 7$.
  5. \`x += 3;\`:
     - Modifies local $x$: $x = 4 + 3 = 7$.
  6. Return expression:
     $$\\text{return } x + y + z = 7 + 7 + 5 = 19$$

Therefore, the correct answer is **Option B (19)**.`,
    images: []
  },

  "go:484": {
    concept: "C Programming - Recursive String Reversal with getchar and putchar",
    markdown: `- **Concept / Theoretical Foundation**:
  - To reverse a string using recursion:
    - Characters are read one by one until the terminating delimiter (\`'\\n'\`) is reached.
    - Each character is stored in the local activation record of a recursive call.
    - Printing the characters *after* the recursive call unwinds prints them in reverse (LIFO) order.
- **Filling Missing Slots \`?1\` and \`?2\`**:
  \`\`\`c
  void reverse(void) {
      int c;
      if (?1) reverse();
      ?2;
  }
  \`\`\`
  1. **Slot \`?1\`**:
     - Must assign the next input character to local variable \`c\` and check if it is not a newline:
       $$((c = \\text{getchar}()) != '\\n')$$
     - When a non-newline character is read, \`reverse()\` is called recursively.
  2. **Slot \`?2\`**:
     - After the recursive call returns (unwinding phase), the saved character \`c\` must be printed:
       $$\\text{putchar}(c);$$
  3. Therefore:
     - $?1$ is \`((c = getchar()) != '\\n')\`
     - $?2$ is \`putchar(c);\`

Therefore, the correct answer is **Option D (?1 is ((c = getchar ) != '\\n') ?2 is putchar(c);)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-18 (GATE CSE 2008 Part 2)
  // ==========================================

  "go:485": {
    concept: "Data Structures - Linked List Pairwise Value Swapping",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the linked list \`rearrange\` procedure:
    \`\`\`c
    p = list; q = list->next;
    while (q) {
        temp = p->value;
        p->value = q->value;
        q->value = temp;
        p = q->next;
        q = p ? p->next : 0;
    }
    \`\`\`
- **Step-by-Step Trace on $[1, 2, 3, 4, 5, 6, 7]$**:
  1. Iteration 1: $p \\to 1, q \\to 2$. Swap: $(1, 2) \\to (2, 1)$. Advance $p \\to 3, q \\to 4$.
  2. Iteration 2: $p \\to 3, q \\to 4$. Swap: $(3, 4) \\to (4, 3)$. Advance $p \\to 5, q \\to 6$.
  3. Iteration 3: $p \\to 5, q \\to 6$. Swap: $(5, 6) \\to (6, 5)$. Advance $p \\to 7, q \\to \\text{NULL}$.
  4. Loop terminates with $q == \\text{NULL}$.
- **Resulting List**:
  $$2, 1, 4, 3, 6, 5, 7$$

Therefore, the correct answer is **Option B (2, 1, 4, 3, 6, 5, 7)**.`,
    images: []
  },

  "go:495": {
    concept: "Algorithms - Recursive vs Iterative Dynamic Programming Running Time",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the running times of:
    - $f_1(n)$: Recursive implementation without memoization.
    - $f_2(n)$: Iterative dynamic programming implementation with array caching.
- **Complexity Breakdown**:
  1. **Function $f_1(n)$**:
     - Recurrence: $T(n) = T(n - 1) + T(n - 2) + O(1)$.
     - Characteristic equation: $r^2 - 2r - 3 = 0 \\implies (r - 3)(r + 1) = 0 \\implies r = 3$.
     - The call tree branches exponentially: $T(n) = \\Theta(3^n) = \\Theta(2^n)$ (standard exponential class).
  2. **Function $f_2(n)$**:
     - Computes $X[i] = Y[i-1] + Z[i-2]$ using a simple iterative loop from $i = 2$ up to $n$.
     - Each loop iteration performs $O(1)$ operations.
     - Running time:
       $$T(n) = \\Theta(n)$$
  3. Thus, running times are $\\Theta(2^n)$ and $\\Theta(n)$.

Therefore, the correct answer is **Option B (\\Theta(2^n) and \\Theta(n))**.`,
    images: []
  },

  "go:43489": {
    concept: "Algorithms - Linear Recurrence Sequence Value Calculation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Functions $f_1(n)$ and $f_2(n)$ both compute the sequence defined by:
    $$X[0] = 0, \\quad X[1] = 1$$
    $$X[n] = 2 X[n - 1] + 3 X[n - 2] \\quad \\text{for } n \\ge 2$$
- **Step-by-Step Sequence Computation**:
  - $X[0] = 0$
  - $X[1] = 1$
  - $X[2] = 2(1) + 3(0) = 2$
  - $X[3] = 2(2) + 3(1) = 4 + 3 = 7$
  - $X[4] = 2(7) + 3(2) = 14 + 6 = 20$
  - $X[5] = 2(20) + 3(7) = 40 + 21 = 61$
  - $X[6] = 2(61) + 3(20) = 122 + 60 = 182$
  - $X[7] = 2(182) + 3(61) = 364 + 183 = 547$
  - $X[8] = 2(547) + 3(182) = 1094 + 546 = 1640$
- **Result**:
  - Both $f_1(8)$ and $f_2(8)$ return **1640**.

Therefore, the correct answer is **Option C (1640 and 1640)**.`,
    images: []
  },

  "go:497": {
    concept: "Combinatorics & Discrete Mathematics - Binary Strings with No Consecutive Zeros Recurrence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $x_n$ be the number of binary strings of length $n$ that contain no consecutive zeros.
- **Analytical Derivation**:
  1. Any valid string of length $n$ must end in either \`1\` or \`0\`:
     - **Case 1 (Ends in 1)**: The preceding $n - 1$ characters can be any valid string of length $n - 1$ containing no consecutive zeros. There are $x_{n-1}$ such strings.
     - **Case 2 (Ends in 0)**: To avoid consecutive zeros, the character immediately preceding \`0\` must be \`1\` (i.e. ending in \`10\`). The prefix of length $n - 2$ can be any valid string of length $n - 2$. There are $x_{n-2}$ such strings.
  2. Since these two cases are mutually exclusive and exhaustive:
     $$x_n = x_{n-1} + x_{n-2}$$
  3. This matches the standard Fibonacci recurrence relation.

Therefore, the correct answer is **Option D (x_n = x_{n-1} + x_{n-2})**.`,
    images: []
  },

  "go:43485": {
    concept: "Combinatorics & Algorithms - Binary Strings with No Consecutive Zeros (MTA Analysis)",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $x_n$ denote the number of binary strings of length $n$ containing no consecutive $0$s, governed by:
    $$x_n = x_{n-1} + x_{n-2}$$
- **Direct Enumeration & Recurrence Evaluation**:
  1. Base cases:
     - For $n = 1$: Valid strings are \`{0, 1}\` $\\implies x_1 = 2$.
     - For $n = 2$: Valid strings are \`{01, 10, 11}\` (\`00\` is excluded) $\\implies x_2 = 3$.
  2. Generating higher terms via $x_n = x_{n-1} + x_{n-2}$:
     - $x_3 = x_2 + x_1 = 3 + 2 = 5$
     - $x_4 = x_3 + x_2 = 5 + 3 = 8$
     - $x_5 = x_4 + x_3 = 8 + 5 = \\mathbf{13}$
  3. **Explicit Verification of All 13 Valid Strings of Length 5**:
     $$\\begin{aligned}
     &11111, \\; 11110, \\; 11101, \\; 11011, \\; 11010, \\; 10111, \\; 10110, \\\\
     &10101, \\; 01111, \\; 01110, \\; 01101, \\; 01011, \\; 01010
     \\end{aligned}$$
- **Why this Question was Declared MTA (Marks to All)**:
  - The mathematically derived true answer is **13**.
  - However, the options provided in the official examination were:
    (A) 5, (B) 7, (C) 8, (D) 16.
  - Because the correct value $13$ was completely missing from the options, IIT declared this question **MTA (Marks to All)**.

Therefore, the question is **MTA (Marks to All)** due to missing correct option 13.`,
    images: []
  },

  "go:498": {
    concept: "Algorithms - Subset-Sum Dynamic Programming State Transition",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the Subset-Sum dynamic programming algorithm:
    - $X[i, j]$ is TRUE if and only if there exists a subset of $\\{a_1, a_2, \\dots, a_i\\}$ whose elements sum to $j$.
- **State Transition Derivation**:
  1. To achieve target sum $j$ using elements up to $a_i$ ($a_i \\le j$):
     - **Exclude $a_i$**: The sum $j$ must be achievable using a subset of the first $i - 1$ elements $\\implies X[i - 1, j]$.
     - **Include $a_i$**: The remaining sum $j - a_i$ must be achievable using a subset of the first $i - 1$ elements $\\implies X[i - 1, j - a_i]$.
  2. The subset sum is possible if either condition holds:
     $$X[i, j] = X[i - 1, j] \\lor X[i - 1, j - a_i]$$

Therefore, the correct answer is **Option B (X[i, j] = X[i-1, j] \\lor X[i-1, j-a_i])**.`,
    images: []
  },

  "go:43484": {
    concept: "Algorithms - Subset-Sum Dynamic Programming Output Cell",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the Subset-Sum dynamic programming table $X[i, j]$:
    - Rows $i$ range from $1$ to $n$ (representing subsets of $\\{a_1, \\dots, a_i\\}$).
    - Columns $j$ range from $0$ to $W$ (representing target sums).
- **Target Solution Identification**:
  1. We want to determine if there exists a subset of the **entire input set** $\\{a_1, a_2, \\dots, a_n\\}$ (all $n$ elements) whose sum equals the total target weight $W$.
  2. This corresponds directly to:
     - Row $i = n$ (all $n$ elements eligible).
     - Column $j = W$ (target sum $W$).
  3. Therefore, entry **$X[n, W]$** being TRUE implies that a valid subset exists.

Therefore, the correct answer is **Option C (X[n, W])**.`,
    images: []
  },

  "go:394": {
    concept: "Algorithms - Flawed Binary Search Infinite Loop Detection",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the buggy binary search implementation:
    \`\`\`c
    f (int Y[10], int x) {
        int i, j, k;
        i = 0; j = 9;
        do {
            k = (i + j) / 2;
            if (Y[k] < x) i = k;
            else j = k;
        } while ((Y[k] != x) && (i < j));
    }
    \`\`\`
- **Flaw Analysis**:
  - When $Y[k] < x$, the algorithm updates $i = k$ instead of $i = k + 1$.
  - When $j = i + 1$, $k = \\lfloor(i + i + 1)/2\\rfloor = i$.
  - If $Y[i] < x$, $i$ is set to $k = i$, leaving $i$ and $j$ unchanged!
  - If $x$ is not present, the loop never terminates and enters an **infinite loop**.
- **Trace for Option C: $Y = [2, 2, \\dots, 2]$ and $x > 2$**:
  1. $i = 0, j = 9 \\implies k = 4$. $Y[4] = 2 < x \\implies i = 4$.
  2. Eventually $i = 8, j = 9 \\implies k = (8 + 9)/2 = 8$.
  3. $Y[8] = 2 < x \\implies i = 8$.
  4. In the next iteration, $i = 8, j = 9 \\implies k = 8$ again!
  5. The condition \`(Y[k] != x) && (i < j)\` remains \`(2 != x) && (8 < 9) == true\` indefinitely.
  6. The program fails due to an infinite loop.

Therefore, the correct answer is **Option C (Y is [2 2 2 2 2 2 2 2 2 2] and x > 2)**.`,
    images: []
  },

  "go:43508": {
    concept: "Algorithms - Binary Search Correct Pointer Advancement Repair",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a correct binary search on an array $Y[i \\dots j]$:
    - If the target $x$ is strictly greater than the midpoint element ($Y[k] < x$), then because the array is sorted, $x$ cannot be located at index $k$ or anywhere to the left of $k$.
    - The search interval must strictly advance past $k$:
      $$i = k + 1$$
    - Conversely, if $Y[k] > x$, the search interval must strictly recede before $k$:
      $$j = k - 1$$
- **Correcting Line 6**:
  - Updating Line 6 to:
    \`\`\`c
    if (Y[k] < x) i = k + 1; else j = k - 1;
    \`\`\`
    guarantees that the interval $[i, j]$ strictly shrinks by at least 1 element in every iteration, completely eliminating infinite loops and correctly terminating when $i > j$.

Therefore, the correct answer is **Option A (Change line 6 to: if (Y[k] < x) i = k + 1; else j = k-1;)**.`,
    images: []
  },

  "go:3270": {
    concept: "Algorithms - Asymptotic Growth Ordering of Polynomials and Exponentials",
    markdown: `- **Concept / Theoretical Foundation**:
  - We order the given functions in increasing asymptotic growth:
    - (a) $n^{1/3}$
    - (b) $e^n$
    - (c) $n^{7/4} = n^{1.75}$
    - (d) $n \\log^9 n$
    - (e) $1.0000001^n$
- **Step-by-Step Asymptotic Hierarchy**:
  1. **Sub-linear Polynomial**:
     $$n^{1/3} = n^{0.333} \\implies \\text{(a)}$$
  2. **Quasi-Linear with Polylog**:
     $$n \\log^9 n = o(n^{1 + \\epsilon}) \\text{ for any } \\epsilon > 0 \\implies n^{1/3} < n \\log^9 n < n^{1.75} \\implies \\text{(d)}$$
  3. **Super-Linear Polynomial**:
     $$n^{7/4} = n^{1.75} \\implies \\text{(c)}$$
  4. **Exponentials (Any $a^n > n^k$ for $a > 1$)**:
     - Between $1.0000001^n$ and $e^n$:
       $$1.0000001 < e \\approx 2.71828$$
       $$1.0000001^n = o(e^n) \\implies \\text{(e)} < \\text{(b)}$$
  5. **Combined Increasing Order**:
     $$\\mathbf{a, \\; d, \\; c, \\; e, \\; b}$$

Therefore, the correct answer is **Option A (a, d, c, e, b)**.`,
    images: []
  },

  "go:3272": {
    concept: "Data Structures - AVL Tree vs General Binary Search Tree Search Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - An **AVL tree** is a strictly height-balanced binary search tree where the balance factor (height difference between left and right subtrees) of every node is at most $1$:
    $$|h_L - h_R| \\le 1$$
- **Comparison of Search Complexities**:
  1. **AVL Tree**:
     - The height of an AVL tree with $n$ nodes is strictly logarithmic in the worst case:
       $$h \\le 1.44 \\log_2(n + 2) - 0.328 = \\Theta(\\log n)$$
     - Therefore, search cost is guaranteed to be **$\\Theta(\\log n)$** in the worst case.
  2. **General Binary Search Tree**:
     - Without balancing mechanisms, keys inserted in sorted order cause the tree to degenerate into a linear chain of height $n$.
     - The worst-case search cost is **$O(n)$**.
  3. Therefore:
     - *"The cost of searching an AVL tree is $\\Theta(\\log n)$ but that of a binary search tree is $O(n)$"* is TRUE.

Therefore, the correct answer is **Option A (The cost of searching an AVL tree is \\Theta(\\log n) but that of a binary search tree is O(n))**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-19 (GATE IT 2008 Part 1)
  // ==========================================

  "go:3353": {
    concept: "Algorithms - Radix Sort Complexity for Polynomial Range Keys",
    markdown: `- **Concept / Theoretical Foundation**:
  - Radix Sort sorts $n$ integers by breaking each number into $d$ digits in base $b$ and running stable Counting Sort on each digit.
  - The time complexity of Radix Sort is:
    $$\\text{Time} = \\Theta(d \\cdot (n + b))$$
- **Analytical Derivation**:
  1. The keys lie in the range $(n^{k/2}, n^k]$, so the maximum value is $n^k$.
  2. By choosing the radix base $b = n$:
     - The number of digits required to represent numbers up to $n^k$ in base $n$ is:
       $$d = \\lceil \\log_n (n^k) \\rceil = k$$
  3. For each of the $d = k$ digits, Counting Sort with base $b = n$ takes:
     $$\\Theta(n + b) = \\Theta(n + n) = \\Theta(n)$$
  4. Across all $d = k$ passes, the total time taken is:
     $$\\text{Total Time} = k \\times \\Theta(n) = \\Theta(kn)$$

Therefore, the correct answer is **Option B (\\Theta(kn))**.`,
    images: []
  },

  "go:3354": {
    concept: "Algorithms - Master Theorem Case 2 with Square Root Recurrence",
    markdown: `- **Concept / Theoretical Foundation**:
  - We solve the recurrence relation for $n = 2^{2k}$:
    $$T(n) = \\sqrt{2} \\, T(n/2) + \\sqrt{n}, \\quad T(1) = 1$$
- **Master Theorem Derivation**:
  1. Identify parameters: $a = \\sqrt{2} = 2^{1/2}$, $b = 2$, and $f(n) = \\sqrt{n} = n^{1/2}$.
  2. Calculate the watershed exponent:
     $$n^{\\log_b a} = n^{\\log_2 (2^{1/2})} = n^{1/2} = \\sqrt{n}$$
  3. Compare $f(n)$ with $n^{\\log_b a}$:
     $$f(n) = \\sqrt{n} = \\Theta(n^{\\log_b a})$$
  4. This falls into **Case 2 of the Master Theorem**, which yields:
     $$T(n) = \\Theta(n^{\\log_b a} \\log_2 n) = \\Theta(\\sqrt{n} \\log n)$$
  5. Exact closed-form evaluation:
     $$T(n) = \\sqrt{n} \\left(T(1) + \\sum_{j=1}^{\\log_2 n} 1\\right) = \\sqrt{n} (1 + \\log_2 n) = \\sqrt{n}(\\log n + 1)$$

Therefore, the correct answer is **Option A (\\sqrt{n} (\\log n + 1))**.`,
    images: []
  },

  "go:3355": {
    concept: "Algorithms - Prim's Minimum Spanning Tree Tree-Growth Execution Sequence",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Prim's Algorithm** builds an MST by maintaining a single growing tree $T$.
  - At every step, it adds the minimum weight edge that connects a vertex already in $T$ to a vertex outside $T$.
- **Validation of Option C: $(d, f), (f, c), (d, a), (a, b), (c, e), (f, h), (g, h), (g, i)$**:
  1. Start with edge $(d, f)$: initial tree vertices $V_T = \\{d, f\\}$.
  2. Edge $(f, c)$ connects $f \\in V_T$ to $c$: $V_T = \\{d, f, c\\}$.
  3. Edge $(d, a)$ connects $d \\in V_T$ to $a$: $V_T = \\{d, f, c, a\\}$.
  4. Edge $(a, b)$ connects $a \\in V_T$ to $b$: $V_T = \\{d, f, c, a, b\\}$.
  5. Edge $(c, e)$ connects $c \\in V_T$ to $e$: $V_T = \\{d, f, c, a, b, e\\}$.
  6. Edge $(f, h)$ connects $f \\in V_T$ to $h$: $V_T = \\{d, f, c, a, b, e, h\\}$.
  7. Edge $(g, h)$ connects $h \\in V_T$ to $g$: $V_T = \\{d, f, c, a, b, e, h, g\\}$.
  8. Edge $(g, i)$ connects $g \\in V_T$ to $i$: $V_T = \\{d, f, c, a, b, e, h, g, i\\}$.
- **Conclusion**:
  - Every edge added is incident on the current tree component and satisfies the minimum cut weight requirement.

Therefore, the correct answer is **Option C ((d, f), (f, c), (d, a), (a, b), (c, e), (f, h), (g, h), (g, i))**.`,
    images: ["/Gate_QA/question-images/817950059835235116.webp"]
  },

  "go:3356": {
    concept: "Data Structures - Identifying Preorder, Inorder, and Postorder Sequences",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a binary tree:
    - **Preorder**: visits Root, then Left subtree, then Right subtree (Root is the **first** element).
    - **Postorder**: visits Left subtree, then Right subtree, then Root (Root is the **last** element).
    - **Inorder**: visits Left subtree, then Root, then Right subtree (Root splits the sequence into Left and Right sets).
- **Analysis of the Three Sequences**:
  - I: \`MBCAFHPYK\`
  - II: \`KAMCBYPFH\`
  - III: \`MABCKYFPH\`
  1. Observe the key \`K\`:
     - In II, \`K\` is the very first element.
     - In I, \`K\` is the very last element.
     - In III, \`K\` is in the middle (\`M A B C\` to the left, \`Y F P H\` to the right).
  2. If \`K\` is the root:
     - II is the **preorder sequence** (starts with root \`K\`).
     - I is the **postorder sequence** (ends with root \`K\`).
     - III is the **inorder sequence** (split by root \`K\`).
  3. Verify consistency:
     - Left subtree keys: $\\{M, A, B, C\\}$ (appears in all three sequences).
     - Right subtree keys: $\\{Y, P, F, H\\}$ (appears in all three sequences).
  4. Therefore, II is preorder and III is inorder.

Therefore, the correct answer is **Option D (II and III are the preorder and inorder sequences, respectively)**.`,
    images: []
  },

  "go:3357": {
    concept: "Graph Theory - Valid Depth First Search Visit Orders from Source a",
    markdown: `- **Concept / Theoretical Foundation**:
  - A Depth-First Search (DFS) starting at node $a$ explores along each branch as deep as possible before backtracking.
- **Trace Analysis of the Options**:
  - In the given graph:
    - Neighbors of $a$ are $b$ and $d$.
  - **Sequence 2: $a, b, e, f, c, g, d$**:
    - $a \\to b$: valid.
    - $b \\to e$: valid.
    - $e \\to f$: valid.
    - $f \\to c$: valid.
    - $c \\to g$: valid.
    - $g \\to d$: valid.
    - Visits all 7 nodes via a valid simple Hamiltonian path $\\implies$ **Valid DFS**.
  - **Sequence 3: $a, d, g, e, b, c, f$**:
    - $a \\to d \\to g \\to e \\to b \\to c \\to f$: all adjacent edges exist $\\implies$ **Valid DFS**.
  - **Sequence 1: $a, b, e, f, d, g, c$**:
    - From $f$, there is no direct edge to $d$ without passing through $c$ or $g$ $\\implies$ Invalid.
- **Conclusion**:
  - Only sequences 2 and 3 are possible DFS orders.

Therefore, the correct answer is **Option B (2 and 3 only)**.`,
    images: ["/Gate_QA/question-images/8583737377253945503.webp"]
  },

  "go:3358": {
    concept: "Data Structures - Hash Table Linear Probing Collision Sequence Simulation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Table size $M = 11$, indices $0$ to $10$. Hash function $h(k) = k \\bmod 11$.
  - Collision resolution by linear probing: $(h(k) + i) \\bmod 11$.
- **Step-by-Step Insertion Trace**:
  1. $43$: $43 \\% 11 = 10 \\to$ slot 10.
  2. $36$: $36 \\% 11 = 3 \\to$ slot 3.
  3. $92$: $92 \\% 11 = 4 \\to$ slot 4.
  4. $87$: $87 \\% 11 = 10$ (collision!). Next slot: $(10 + 1) \\% 11 = 0 \\to$ slot 0.
  5. $11$: $11 \\% 11 = 0$ (collision!). Next slot: $1 \\to$ slot 1.
  6. $4$: $4 \\% 11 = 4$ (collision!). Probes: $4$ (occ), $5$ (free) $\\to$ slot 5.
  7. $71$: $71 \\% 11 = 5$ (collision!). Probes: $5$ (occ), $6$ (free) $\\to$ slot 6.
  8. $13$: $13 \\% 11 = 2 \\to$ slot 2.
  9. $14$: $14 \\% 11 = 3$ (collision!).
     - Probe 3: occupied by 36.
     - Probe 4: occupied by 92.
     - Probe 5: occupied by 4.
     - Probe 6: occupied by 71.
     - Probe 7: empty! $\\to$ slot 7.
- **Conclusion**:
  - The last record (key 14) is inserted into **bin 7**.

Therefore, the correct answer is **Option D (7)**.`,
    images: []
  },

  "go:3359": {
    concept: "C Programming - String Array Modification and Premature Null Termination",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, strings are null-terminated character arrays terminated by \`'\\0'\`.
  - The string literal \`"world"\` in array \`char a[6]\` is stored as:
    \`\`\`c
    a[0] = 'w', a[1] = 'o', a[2] = 'r', a[3] = 'l', a[4] = 'd', a[5] = '\\0'
    \`\`\`
- **Loop Trace**:
  \`\`\`c
  for (i = 0, j = 5; i < j; a[i++] = a[j--]);
  \`\`\`
  1. **Iteration 1 ($i = 0, j = 5$)**:
     - Condition $i < j$ ($0 < 5$) is true.
     - The assignment \`a[i++] = a[j--]\` executes:
       - Evaluates \`a[0] = a[5]\`.
       - Since \`a[5]\` is the null terminator \`'\\0'\`, \`a[0]\` becomes **\`'\\0'\`**!
       - Then $i$ increments to 1, and $j$ decrements to 4.
  2. **Subsequent Iterations**:
     - The loop continues copying characters from the end towards the front, but \`a[0]\` is already \`'\\0'\`.
  3. **Printing the String**:
     - \`printf("%s\\n", a)\` begins reading at address \`&a[0]\`.
     - It immediately encounters the null terminator \`'\\0'\` at index 0.
     - It stops reading immediately and prints nothing (a **Null string**).

Therefore, the correct answer is **Option B (Null string)**.`,
    images: []
  },

  "go:3360": {
    concept: "C Programming - Macro Expansion vs Pass by Reference Functions",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the execution of the main function:
    \`\`\`c
    int num1 = 5, num2 = 4, tmp;
    if (num1 < num2) { swap1(num1, num2); }
    if (num1 < num2) { swap2(num1 + 1, num2); }
    if (num1 >= num2) { swap3(&num1, &num2); }
    printf("%d, %d", num1, num2);
    \`\`\`
- **Step-by-Step Execution**:
  1. \`num1 = 5, num2 = 4\`.
  2. First \`if (num1 < num2)\`: $5 < 4$ is false $\\implies$ \`swap1\` is **not executed**.
  3. Second \`if (num1 < num2)\`: $5 < 4$ is false $\\implies$ \`swap2\` is **not executed**.
  4. Third \`if (num1 >= num2)\`: $5 \\ge 4$ is **true** $\\implies$ executes \`swap3(&num1, &num2)\`.
  5. In \`swap3(int *a, int *b)\`:
     - Correctly swaps the pointed-to values:
       \`\`\`c
       tmp = *a; *a = *b; *b = tmp;
       \`\`\`
     - \`num1\` receives 4, and \`num2\` receives 5.
  6. \`printf("%d, %d", num1, num2)\` prints **\`4, 5\`**.

Therefore, the correct answer is **Option C (4, 5)**.`,
    images: []
  },

  "go:3361": {
    concept: "C Programming - Variable Shadowing and Block Scope in Loops",
    markdown: `- **Concept / Theoretical Foundation**:
  - A variable declared inside an inner block shadows any variable of the same name declared in an outer enclosing block.
  - Changes made to the inner variable affect only that inner local copy.
- **Trace of First Loop**:
  \`\`\`c
  for (i = 0; i < 3; i++) {
      a[i] = a[i] + 1;
      i++;
  }
  i--;
  \`\`\`
  1. $i = 0$: $a[0] = 1 + 1 = 2$. $i++ \\implies i = 1$. Loop increment $i++ \\implies i = 2$.
  2. $i = 2$: $a[2] = 3 + 1 = 4$. $i++ \\implies i = 3$. Loop increment $i++ \\implies i = 4 > 3$ (loop terminates).
  3. \`i--;\` decrements $i$ from 4 to **$i = 3$**.
- **Trace of Second Loop (Variable Shadowing)**:
  \`\`\`c
  for (j = 7; j > 4; j--) {
      int i = j / 2;
      a[i] = a[i] - 1;
  }
  \`\`\`
  - Crucially, \`int i = j / 2;\` declares a **new local variable \`i\`** scoped strictly inside this second loop!
  - $j = 7$: local $i = 3 \\implies a[3] = 4 - 1 = 3$.
  - $j = 6$: local $i = 3 \\implies a[3] = 3 - 1 = 2$.
  - $j = 5$: local $i = 2 \\implies a[2] = 4 - 1 = 3$.
  - The outer variable \`i\` is completely untouched by the second loop and remains **$3$**.
- **Print Statement**:
  - \`printf("%d, %d", i, a[i])\` prints outer \`i\` (3) and \`a[3]\` (2):
    $$\\mathbf{3, 2}$$

Therefore, the correct answer is **Option C (3, 2)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-20 (GATE IT 2008 Part 2)
  // ==========================================

  "go:3362": {
    concept: "C Programming - 2D Array Flattening & Matrix Transposition",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze:
    \`\`\`c
    char a[2][3] = {{'a', 'b', 'c'}, {'d', 'e', 'f'}};
    char b[3][2];
    char *p = *b;
    for (i = 0; i < 2; i++) {
        for (j = 0; j < 3; j++) {
            *(p + 2 * j + i) = a[i][j];
        }
    }
    \`\`\`
- **Memory Layout & Index Mapping**:
  1. Array \`b\` has dimensions $3 \\times 2$ (3 rows, 2 columns).
  2. In row-major layout, element $b[r][c]$ is stored at linear byte offset:
     $$\\text{offset}(r, c) = 2 \\cdot r + c$$
  3. In the assignment, the target address is:
     $$p + 2 \\cdot j + i$$
  4. Comparing with the offset formula:
     - Row index is $r = j$ (since it is multiplied by the row size 2).
     - Column index is $c = i$.
  5. Therefore:
     $$b[j][i] = a[i][j]$$
  6. This swaps row and column indices, computing the **matrix transpose $b = a^T$**:
     - Row 0 ($j=0$): $a[0][0]=\\text{'a'}, a[1][0]=\\text{'d'}$.
     - Row 1 ($j=1$): $a[0][1]=\\text{'b'}, a[1][1]=\\text{'e'}$.
     - Row 2 ($j=2$): $a[0][2]=\\text{'c'}, a[1][2]=\\text{'f'}$.
- **Resulting Matrix**:
  $$\\begin{matrix} \\text{a} & \\text{d} \\\\ \\text{b} & \\text{e} \\\\ \\text{c} & \\text{f} \\end{matrix}$$

Therefore, the correct answer is **Option B (a d \\n b e \\n c f)**.`,
    images: []
  },

  "go:3385": {
    concept: "Data Structures - Binary Search Tree Search Path Pruning Bounds",
    markdown: `- **Concept / Theoretical Foundation**:
  - When searching for key $K = 273$ in a Binary Search Tree (BST) storing keys in $[37, 573]$:
    - Every examined node $x$ partitions the remaining search space:
      - If $x > K$: next nodes must be strictly in $[\\text{low}, x)$.
      - If $x < K$: next nodes must be strictly in $(x, \\text{high}]$.
- **Evaluation of Candidate Sequences**:
  1. **Sequence I ($81, 537, 102, 439, 285, 376, 305$)**:
     - Key 285 ($> 273$) restricts upper bound to $285$.
     - Next node is $376 > 285$ (violates BST search invariant). **Invalid**.
  2. **Sequence II ($52, 97, 121, 195, 242, 381, 472$)**:
     - Key 381 ($> 273$) restricts upper bound to $381$.
     - Next node is $472 > 381$ (violates BST search invariant). **Invalid**.
  3. **Sequence III ($142, 248, 520, 386, 345, 270, 307$)**:
     - 142 ($<273$): $(142, 573)$
     - 248 ($<273$): $(248, 573)$
     - 520 ($>273$): $(248, 520)$
     - 386 ($>273$): $(248, 386)$
     - 345 ($>273$): $(248, 345)$
     - 270 ($<273$): $(270, 345)$
     - 307 ($>273$): $(270, 307)$
     - All keys respect interval constraints $\\implies$ **Valid**.
  4. **Sequence IV ($550, 149, 507, 395, 463, 402, 270$)**:
     - Key 395 ($> 273$) restricts upper bound to $395$.
     - Next node is $463 > 395$ (violates BST search invariant). **Invalid**.
- **Conclusion**:
  - Only sequence III is a valid search path.

Therefore, the correct answer is **Option D (III only)**.`,
    images: []
  },

  "go:3386": {
    concept: "Data Structures - Inorder Traversal Property of Binary Search Trees",
    markdown: `- **Concept / Theoretical Foundation**:
  - A fundamental invariant of any valid Binary Search Tree is that its **in-order traversal must be in strictly ascending sorted order**.
- **Analysis of Sequence II ($52, 97, 121, 195, 242, 381, 472$)**:
  1. Sequence II is strictly sorted in increasing order:
     $$52 < 97 < 121 < 195 < 242 < 381 < 472$$
  2. Hence, II can validly represent the in-order traversal of a BST.
  3. If $121$ is the root of the tree:
     - Left subtree contains keys $\\{52, 97\\}$.
     - In this left subtree, $97$ can be the left child of $121$, and $52$ can be the left child of $97$ (making $52$ a leaf node).
     - Right subtree contains keys $\\{195, 242, 381, 472\\}$.
  4. Therefore:
     - *"II is an inorder sequence of some BST where 121 is the root and 52 is a leaf"* is TRUE.

Therefore, the correct answer is **Option C (II is an inorder sequence of some BST where 121 is the root and 52 is a leaf)**.`,
    images: []
  },

  "go:3387": {
    concept: "Data Structures - Distinct Binary Search Trees with n Distinct Keys",
    markdown: `- **Concept / Theoretical Foundation**:
  - The number of structurally distinct binary search trees that can be constructed with $n$ distinct keys is given by the **$n^{\\text{th}}$ Catalan number** $C_n$:
    $$C_n = \\frac{1}{n + 1} \\binom{2n}{n}$$
- **Calculation for $n = 3$ Keys**:
  1. For any 3 distinct sorted keys $k_1 < k_2 < k_3$:
     $$C_3 = \\frac{1}{3 + 1} \\binom{6}{3} = \\frac{1}{4} \\times 20 = 5$$
  2. The 5 distinct BST configurations are:
     - Root $k_1$: right child $k_2$ (with right child $k_3$).
     - Root $k_1$: right child $k_3$ (with left child $k_2$).
     - Root $k_2$: left child $k_1$, right child $k_3$.
     - Root $k_3$: left child $k_1$ (with right child $k_2$).
     - Root $k_3$: left child $k_2$ (with left child $k_1$).

Therefore, the correct answer is **Option B (5)**.`,
    images: []
  },

  "go:3390": {
    concept: "Graph Theory - Degree Sum Handshaking Lemma in Binary Trees",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a binary tree with $n > 1$ nodes, the degree of a node is defined as the total number of its neighbors (edges incident to it).
  - Let $n_1, n_2, n_3$ be the number of nodes of degree 1, 2, and 3 respectively.
- **Analytical Derivation**:
  1. Total vertices:
     $$n = n_1 + n_2 + n_3$$
  2. In any tree on $n$ vertices, the total number of edges is $E = n - 1$.
  3. By Euler's Handshaking Lemma, the sum of degrees of all vertices equals $2E$:
     $$\\sum_{v \\in V} \\text{deg}(v) = 1 \\cdot n_1 + 2 \\cdot n_2 + 3 \\cdot n_3 = 2(n - 1)$$
  4. Substitute $n = n_1 + n_2 + n_3$:
     $$n_1 + 2n_2 + 3n_3 = 2(n_1 + n_2 + n_3) - 2$$
     $$n_1 + 2n_2 + 3n_3 = 2n_1 + 2n_2 + 2n_3 - 2$$
  5. Simplify by subtracting $2n_2 + 2n_3$ from both sides:
     $$n_1 + n_3 = 2n_1 - 2$$
     $$n_3 = n_1 - 2$$

Therefore, the correct answer is **Option B (n_1 - 2)**.`,
    images: []
  },

  "go:3391": {
    concept: "Graph Theory - Degree-2 Vertex Smoothing and Remaining Edges",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the given binary tree, the operation repeatedly removes a node $v$ of degree 2 and connects its two neighbors with a direct edge (topological smoothing).
- **Analytical Derivation**:
  1. Each smoothing operation removes one vertex of degree 2 and replaces two incident edges with one edge.
  2. The operations continue until no vertices of degree 2 remain ($n_2' = 0$).
  3. The number of degree-1 vertices ($n_1$) and degree-3 vertices ($n_3$) remains completely invariant.
  4. The final graph is still a connected acyclic graph (a tree) whose vertices consist solely of degree-1 and degree-3 nodes:
     $$V' = n_1 + n_3$$
  5. Recall from the previous derivation that $n_3 = n_1 - 2$:
     $$V' = n_1 + (n_1 - 2) = 2n_1 - 2$$
  6. The number of edges in any tree with $V'$ vertices is:
     $$E' = V' - 1 = (2n_1 - 2) - 1 = 2n_1 - 3$$

Therefore, the correct answer is **Option A (2 * n_1 - 3)**.`,
    images: []
  },

  "go:3406": {
    concept: "Algorithms - Recursive Decimal to Binary Conversion Trace",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the recursive function:
    \`\`\`c
    void f (int n) {
        if (n <= 1) {
            printf("%d", n);
        } else {
            f(n / 2);
            printf("%d", n % 2);
        }
    }
    \`\`\`
  - This function recursively prints the binary expansion of $n$ from most significant bit (MSB) to least significant bit (LSB).
- **Evaluation for $n = 173$**:
  1. Perform repeated division by 2:
     - $173 / 2 = 86$, remainder **1** (LSB)
     - $86 / 2 = 43$, remainder **0**
     - $43 / 2 = 21$, remainder **1**
     - $21 / 2 = 10$, remainder **1**
     - $10 / 2 = 5$, remainder **0**
     - $5 / 2 = 2$, remainder **1**
     - $2 / 2 = 1$, remainder **0**
     - $1 \\le 1$: prints **1** (MSB)
  2. Unwinding prints remainders in MSB to LSB order:
     $$\\mathbf{10110101}$$
  3. Verification:
     $$128 + 32 + 8 + 4 + 1 = 173$$

Therefore, the correct answer is **Option C (10110101)**.`,
    images: []
  },

  "go:3407": {
    concept: "Algorithms - Recursive Binary Conversion Program Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - The original function $f(n)$ recursively computes and prints the binary representation of $n$ in MSB-to-LSB order:
    \`\`\`c
    void f (int n) {
        if (n <= 1) printf ("%d", n);
        else { f (n / 2); printf ("%d", n % 2); }
    }
    \`\`\`
- **Analysis of Implementations**:
  1. **Implementation P1**:
     \`\`\`c
     void f (int n) {
         if (n / 2) f(n / 2);
         printf("%d", n % 2);
     }
     \`\`\`
     - For $n \\ge 2$, $n / 2 > 0$ (true), so it calls $f(n / 2)$ first before printing $n \\% 2$.
     - When $n = 1$, $1 / 2 = 0$ (false), the recursive call is skipped, and it executes \`printf("%d", 1 % 2)\` which prints \`1\`.
     - Upon unwinding, it prints each remainder $n \\% 2$ in identical MSB-to-LSB order.
     - Thus, **P1 produces the exact same output for $f(173)$**.
  2. **Implementation P2**:
     \`\`\`c
     void f (int n) {
         if (n <= 1) printf ("%d", n);
         else { printf ("%d", n % 2); f(n / 2); }
     }
     \`\`\`
     - P2 prints $n \\% 2$ *before* the recursive call, which prints the binary digits in reverse (LSB-to-MSB) order.
     - Thus, P2 does not produce the same output.
- **Conclusion**:
  - Only P1 produces the same output.

Therefore, the correct answer is **Option C (P1 only)**.`,
    images: []
  },

  "go:3271": {
    concept: "Complexity Theory - Polynomial Time Reduction from Unknown to NP-Complete",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $Y$ be an **NP-complete** problem, and suppose problem $X$ polynomial-time reduces to $Y$:
    $$X \\le_p Y$$
- **Complexity Deductions**:
  1. Since $Y \\in \\text{NP}$ and $X \\le_p Y$, any non-deterministic polynomial-time algorithm for $Y$ can decide $X$ by first applying the polynomial reduction.
  2. Therefore, $X$ is guaranteed to belong to **NP** ($X \\in \\text{NP}$).
  3. However, reducing $X$ to an NP-complete problem does **not** imply that $X$ is NP-complete or NP-hard.
     - For example, any problem in $\\text{P}$ (such as 2-coloring or sorting) trivially reduces in polynomial time to 3-SAT.
     - But problems in $\\text{P}$ are not NP-complete unless $\\text{P} = \\text{NP}$.
  4. Therefore, $X$ is in NP, but not necessarily NP-complete.

Therefore, the correct answer is **Option D (X is in NP, but not necessarily NP-complete)**.`,
    images: []
  },

  "go:3273": {
    concept: "Programming Paradigms - Language Family Classification",
    markdown: `- **Concept / Theoretical Foundation**:
  - We match major programming paradigms with their representative programming languages:
- **Paradigm to Language Mapping**:
  1. **(I) Imperative**: Focuses on statements that change program state sequentially.
     - Representative languages: **C, Fortran 77, Pascal** $\\implies \\mathbf{I - c}$.
  2. **(II) Object Oriented**: Organizes software design around data, or objects, rather than functions and logic.
     - Representative languages: **C++, Smalltalk, Java** $\\implies \\mathbf{II - d}$.
  3. **(III) Functional**: Computation is treated as the evaluation of mathematical functions, avoiding mutable state.
     - Representative languages: **Lisp, Haskell, ML** $\\implies \\mathbf{III - b}$.
  4. **(IV) Logic**: Based on formal logic where programs consist of facts and rules.
     - Representative languages: **Prolog** $\\implies \\mathbf{IV - a}$.
- **Matching Result**:
  $$\\text{I-c, II-d, III-b, IV-a}$$

Therefore, the correct answer is **Option A (I-c, II-d, III-b, IV-a)**.`,
    images: []
  }
};

/**
 * Apply the solutions to patch-authentic-solutions.mjs
 */
export function applyChunkSolutions() {
  const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let content = fs.readFileSync(patchesFile, "utf-8");

  let addedCount = 0;
  for (const [uid, sol] of Object.entries(CHUNK_CSE_DSA_17_TO_20_SOLUTIONS)) {
    if (content.includes(`"${uid}":`)) {
      console.log(`⚠️  ${uid} already exists in patch-authentic-solutions.mjs, updating...`);
      const regex = new RegExp(`"${uid}":\\s*\\{[\\s\\S]*?\\n  \\},?`, "g");
      const replacement = `"${uid}": ${JSON.stringify(sol, null, 2)},`;
      content = content.replace(regex, replacement);
    } else {
      const marker = "export const AUTHENTIC_PATCHES = {";
      const insertPos = content.indexOf(marker) + marker.length;
      const patchStr = `\n  "${uid}": ${JSON.stringify(sol, null, 4)},`;
      content = content.slice(0, insertPos) + patchStr + content.slice(insertPos);
      addedCount++;
    }
  }

  fs.writeFileSync(patchesFile, content, "utf-8");
  console.log(`✅ Injected ${addedCount} solutions into scripts/pipeline/patch-authentic-solutions.mjs`);
}

if (process.argv[1] && process.argv[1].endsWith("apply-chunk-cse-dsa-17-to-20.mjs")) {
  applyChunkSolutions();
}
