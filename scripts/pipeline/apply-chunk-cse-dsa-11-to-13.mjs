import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_DSA_11_TO_13_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-DSA-11 (GATE CSE 2006 Part 1)
  // ==========================================

  "go:889": {
    concept: "Data Structures - Finding Minimum Element in a Binary Max-Heap",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a binary max-heap of $n$ elements, for every node $x$ with children, the key at $x$ is greater than or equal to the keys at its children.
  - Consequently, the maximum element is always at the root ($O(1)$ time), while the smallest element cannot be an internal node that has children smaller than itself—it must reside at one of the **leaf nodes**.
- **Analytical Derivation**:
  1. In a complete binary tree with $n$ nodes, the number of leaf nodes is:
     $$L = \\left\\lceil \\frac{n}{2} \\right\\rceil$$
  2. The leaves occupy array indices from $\\lfloor n/2 \\rfloor + 1$ to $n$.
  3. Because a max-heap maintains no relative ordering among its leaves, the minimum element can be any of these $\\lceil n/2 \\rceil$ leaves.
  4. Finding the minimum among the leaves requires a linear scan over all $\\lceil n/2 \\rceil$ leaf elements:
     $$\\text{Time} = \\Theta\\left(\\left\\lceil \\frac{n}{2} \\right\\rceil\\right) = \\Theta(n) = O(n)$$

Therefore, the correct answer is **Option A (O(n))**.`,
    images: []
  },

  "go:890": {
    concept: "Graph Theory - Minimum Spanning Tree on Metric Complete Graph",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $G = (V, E)$ be a weighted complete graph with $V = \\{v_1, v_2, \\dots, v_n\\}$.
  - The weight of edge $(v_i, v_j)$ is defined as:
    $$w(v_i, v_j) = 2|i - j|$$
- **Analytical Derivation**:
  1. The minimum possible edge weight in $G$ occurs when $|i - j| = 1$ (adjacent indexed vertices):
     $$w(v_i, v_{i+1}) = 2|i - (i+1)| = 2(1) = 2$$
  2. For any other pair of vertices with $|i - j| \\ge 2$, the edge weight is $w(v_i, v_j) = 2|i - j| \\ge 4$.
  3. Any spanning tree of a graph on $n$ vertices must contain exactly $n - 1$ edges.
  4. Since the absolute minimum weight of any edge in $G$ is $2$, the total weight of any spanning tree $T$ is bounded below by:
     $$\\text{Weight}(T) = \\sum_{e \\in T} w(e) \\ge (n - 1) \\times 2 = 2n - 2$$
  5. Consider the simple path spanning tree:
     $$P = \\{(v_1, v_2), (v_2, v_3), \\dots, (v_{n-1}, v_n)\\}$$
     - It connects all $n$ vertices with $n - 1$ edges.
     - Each edge $(v_i, v_{i+1})$ has weight $2$.
     - Total weight:
       $$\\text{Weight}(P) = \\sum_{i=1}^{n-1} 2 = 2(n - 1) = 2n - 2$$
  6. Since this achieves the theoretical minimum bound, $P$ is an MST of $G$ with weight $2n - 2$.

Therefore, the correct answer is **Option B (2n - 2)**.`,
    images: []
  },

  "go:891": {
    concept: "Algorithms - Linear-Time Single-Source Shortest Paths on Unweighted Graphs",
    markdown: `- **Concept / Theoretical Foundation**:
  - In an unweighted graph (or graph with uniform positive edge weights $w = 1$), the shortest path distance from a source $s$ to any vertex $v$ equals the minimum number of edges on a path between them.
- **Data Structure Optimization**:
  1. Dijkstra's general algorithm uses a priority queue (heap) to extract the vertex of minimum tentative distance.
  2. When edge weights are uniform, tentative distances from the source increase monotonically in discrete unit steps ($0, 1, 2, \\dots$).
  3. A standard First-In-First-Out (**Queue**) naturally maintains vertices ordered by non-decreasing distance without any comparison or heap re-balancing overhead.
  4. Replacing the priority queue with a **Queue** transforms Dijkstra's algorithm into **Breadth-First Search (BFS)**, which explores every vertex and edge in linear time:
     $$\\text{Time} = O(|V| + |E|)$$

Therefore, the correct answer is **Option A (Queue)**.`,
    images: []
  },

  "go:974": {
    concept: "Data Structures - Array Representation of General Binary Trees Space Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the standard 1-based array representation of a binary tree:
    - Root is stored at $X[1]$.
    - Left child of node at $X[i]$ is stored at $X[2i]$.
    - Right child of node at $X[i]$ is stored at $X[2i + 1]$.
- **Worst-Case Node Index Analysis**:
  1. To be able to store *any* binary tree on $n$ vertices, the array must be large enough to accommodate the worst-case configuration that pushes a node to the maximum possible index.
  2. The maximum index occurs in a degenerate, strictly right-skewed binary tree of depth $n$:
     - Level 1 (depth 1, root): index $1 = 2^1 - 1$.
     - Level 2 (right child): index $2(1) + 1 = 3 = 2^2 - 1$.
     - Level 3 (right child): index $2(3) + 1 = 7 = 2^3 - 1$.
     - Level $k$ (right child): index $2^k - 1$.
  3. The $n$-th node at depth $n$ is stored at array index:
     $$\\text{Index}(n) = 2^n - 1$$
  4. Therefore, to safely store any arbitrary binary tree of $n$ vertices without index out-of-bounds, the array size must be at least $2^n - 1$.

Therefore, the correct answer is **Option D (2^n - 1)**.`,
    images: []
  },

  "go:975": {
    concept: "Algorithms - In-Place Sorting Comparison and Swap Minimization",
    markdown: `- **Concept / Theoretical Foundation**:
  - We compare the number of element swaps (write operations) performed by standard in-place comparison sorts in the worst case on an array of $n$ elements:
- **Swap Complexity Comparison**:
  1. **Selection Sort**:
     - In each of the $n - 1$ passes, it scans the unsorted suffix to find the minimum element and performs **at most 1 swap**.
     - Total swaps in worst/average/best case:
       $$\\text{Swaps} \\le n - 1 = O(n)$$
  2. **Insertion Sort**:
     - Shifts/swaps elements adjacent to each other.
     - Worst-case swaps (reverse sorted array):
       $$\\frac{n(n - 1)}{2} = \\Theta(n^2)$$
  3. **Quick Sort**:
     - Partitions elements around a pivot.
     - Worst-case and average swaps:
       $$\\Theta(n \\log n) \\text{ to } \\Theta(n^2)$$
  4. **Heap Sort**:
     - Swaps root with the last element during each of the $n$ extractions:
       $$\\Theta(n \\log n)$$
- **Conclusion**:
  - Selection sort guarantees the absolute minimum number of swaps ($O(n)$ swaps).

Therefore, the correct answer is **Option C (Selection sort)**.`,
    images: []
  },

  "go:976": {
    concept: "Algorithms - Geometric Series Analysis of Halving Loop",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the loop:
    \`\`\`c
    for (i = n, j = 0; i > 0; i /= 2, j += i);
    \`\`\`
  - Note the comma operator in the update expression: \`i /= 2\` executes first, updating $i$, and then \`j += i\` adds the newly updated value of $i$ to $j$.
- **Analytical Derivation**:
  1. Let $k = \\lfloor \\log_2 n \\rfloor$ be the total number of iterations.
  2. In iteration 1: $i$ is updated to $\\lfloor n/2 \\rfloor$, so $j$ receives $\\lfloor n/2 \\rfloor$.
  3. In iteration 2: $i$ becomes $\\lfloor n/4 \\rfloor$, added to $j$.
  4. Summing the values added to $j$:
     $$val(j) = \\sum_{m=1}^{\\lfloor \\log_2 n \\rfloor} \\left\\lfloor \\frac{n}{2^m} \\right\\rfloor$$
  5. Applying the standard geometric series bounds:
     $$n \\sum_{m=1}^{\\infty} \\frac{1}{2^m} - \\log_2 n \\le val(j) \\le n \\sum_{m=1}^{\\infty} \\frac{1}{2^m}$$
     $$n(1) - \\log_2 n \\le val(j) \\le n(1) = n$$
  6. Thus, $val(j)$ is tightly bounded by:
     $$val(j) = \\Theta(n)$$

Therefore, the correct answer is **Option C (val(j) = \\Theta(n))**.`,
    images: []
  },

  "go:978": {
    concept: "Algorithms - Array Leaders Problem Optimal Single-Pass Scan",
    markdown: `- **Concept / Theoretical Foundation**:
  - An element $X[i]$ in array $X[0 \\dots n-1]$ is a **leader** if:
    $$X[i] > X[k] \\quad \\forall k \\in \\{i + 1, i + 2, \\dots, n - 1\\}$$
    (i.e., $X[i]$ is strictly greater than the maximum of all elements to its right).
  - The rightmost element $X[n-1]$ is always trivially a leader.
- **Directional Complexity Comparison**:
  1. **Left-to-Right Scan**:
     - For each element $X[i]$, to know if it is greater than all elements to its right requires either looking ahead ($O(n^2)$ total) or preprocessing suffix maximums using extra $O(n)$ space.
  2. **Right-to-Left Scan**:
     - Maintain a single running variable:
       $$\\text{max\\_from\\_right} = X[n - 1]$$
     - Record $X[n - 1]$ as a leader.
     - Iterate backwards from $i = n - 2$ down to $0$:
       - If $X[i] > \\text{max\\_from\\_right}$, then $X[i]$ is strictly greater than all elements to its right!
       - Mark $X[i]$ as a leader, and update $\\text{max\\_from\\_right} = X[i]$.
     - This examines each element exactly once in $\\Theta(n)$ time using only $O(1)$ auxiliary space.

Therefore, the correct answer is **Option B (solves it in linear time using a right to left pass of the array)**.`,
    images: []
  },

  "go:1823": {
    concept: "Algorithms - Kruskal's MST Edge Weight Non-Decreasing Order Invariant",
    markdown: `- **Concept / Theoretical Foundation**:
  - Kruskal's algorithm constructs a Minimum Spanning Tree (MST) by sorting all edges in non-decreasing order of weight and adding each edge to the growing forest provided it does not create a cycle.
  - Crucially, edges **must be considered and added in monotonically non-decreasing order of weights**.
- **Edge Weight Analysis of the Graph**:
  - Edge weights in the given graph:
    - $(a-b) = 2$
    - $(d-f) = 2$
    - $(b-f) = 4$
    - $(d-c) = 3$
    - $(d-e) = 5$
- **Evaluation of Option Sequences**:
  - In Kruskal's execution, all available edges of smaller weight must be processed before edges of higher weight.
  - Specifically, edge $(d-c)$ has weight $3$, whereas edge $(d-e)$ has weight $5$.
  - In **Option D**: $(d-f)[2], (a-b)[2], (b-f)[4], (d-e)[5], (d-c)[3]$:
    - Edge $(d-e)$ of weight $5$ is added *before* edge $(d-c)$ of weight $3$.
    - This directly violates the fundamental greedy invariant of Kruskal's algorithm that lighter edges are always considered before heavier edges.

Therefore, the correct answer is **Option D ((d-f),(a-b),(b-f),(d-e),(d-c))**.`,
    images: ["/Gate_QA/question-images/14011816687901345796.webp"]
  },

  "go:1824": {
    concept: "Graph Theory - DFS Tree Back Edges & Cycle Structure on Leaves",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Depth-First Search (DFS) tree $T$ of an undirected connected graph $G$:
    - Every edge in $G$ is either a **tree edge** or a **back edge** connecting a vertex to one of its ancestors in $T$ (cross edges cannot exist in undirected DFS).
- **Properties of a Leaf $u$ with Degree $\\ge 2$**:
  1. Since $u$ is a leaf in $T$, it has exactly one tree edge connecting it to its parent $p(u)$.
  2. Because $\\text{deg}(u) \\ge 2$, all remaining $\\ge 1$ edges incident on $u$ must be **back edges**.
  3. By the back-edge property, every neighbor of $u$ in $G$ must be an **ancestor of $u$** in $T$.
  4. All ancestors of $u$ lie along the unique simple tree path from the root of $T$ down to $u$.
  5. Let $w$ be the ancestor neighbor of $u$ that is closest to the root (the highest ancestor).
  6. The tree path from $w$ down to $u$, together with the back edge $(u, w)$, forms a simple cycle.
  7. Because all neighbors of $u$ are ancestors of $u$, they all lie on this tree path between $w$ and $u$.
  8. Therefore, this cycle contains $u$ and **all of its neighbors in $G$**.

Therefore, the correct answer is **Option D (There must exist a cycle in G containing u and all its neighbours in G)**.`,
    images: []
  },

  "go:1826": {
    concept: "Data Structures - Queue Simulation Using Two Stacks Operation Bounds",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the standard two-stack queue implementation:
    - \`insert(Q, x)\`: executes \`push(S1, x)\`.
    - \`delete(Q)\`: if $S2$ is empty, transfers all elements from $S1$ to $S2$ by popping from $S1$ and pushing onto $S2$, then executes \`x = pop(S2)\`.
- **Bounding Total Pushes ($x$) and Pops ($y$)**:
  - We perform $n$ insert operations and $m$ delete operations ($m \\le n$) on an initially empty queue.
  1. **Push Operations ($x$)**:
     - All $n$ inserted elements are pushed onto $S1$ exactly once $\\implies n$ pushes.
     - To serve $m$ deletes, at least $m$ elements must be transferred from $S1$ to $S2$ (each transfer is one push onto $S2$).
     - At most $n - 1$ elements can be transferred to $S2$ if the remaining elements stay in $S1$. Even if all $n$ are transferred, at least one is popped immediately.
     - Therefore:
       $$n + m \\le x < 2n$$
  2. **Pop Operations ($y$)**:
     - Each of the $m$ deleted elements is popped from $S2$ $\\implies m$ pops.
     - The transferred elements were also popped from $S1$. Since at least $m$ elements were transferred, at least $m$ pops occurred from $S1$.
     - At most $n$ elements could have been transferred from $S1$, contributing at most $n$ pops from $S1$.
     - Total pops:
       $$y = \\text{pops from } S1 + \\text{pops from } S2$$
       $$m + m \\le y \\le n + m \\implies 2m \\le y \\le n + m$$

Therefore, the correct answer is **Option A (n + m <= x < 2n and 2m <= y <= n + m)**.`,
    images: []
  },

  "go:1828": {
    concept: "Discrete Mathematics & Algorithms - Bitwise Characteristic Array Symmetric Difference",
    markdown: `- **Concept / Theoretical Foundation**:
  - A subset $X \\subseteq \\{0, 1, \\dots, n-1\\}$ is represented by its characteristic bit vector $x[i] = 1$ if $i \\in X$, and $0$ otherwise.
  - Logical operations on characteristic vectors translate directly to set operations:
    - $x[i] \\land y[i] \\iff X \\cap Y$
    - $x[i] \\lor y[i] \\iff X \\cup Y$
    - $x[i] \\land \\sim y[i] \\iff X \\setminus Y = X - Y$
    - $\\sim x[i] \\land y[i] \\iff Y \\setminus X = Y - X$
- **Analysis of the Algorithm**:
  \`\`\`c
  for (i = 0; i < n; ++i)
      z[i] = (x[i] && ~y[i]) || (~x[i] && y[i]);
  \`\`\`
  1. The term \`(x[i] && ~y[i])\` selects elements present in $X$ but not in $Y$, representing the set difference $X - Y$.
  2. The term \`(~x[i] && y[i])\` selects elements present in $Y$ but not in $X$, representing the set difference $Y - X$.
  3. The disjunction \`||\` combines these two disjoint sets, giving their union:
     $$Z = (X - Y) \\cup (Y - X)$$
  4. This is the definition of the **symmetric difference** $X \\triangle Y$.

Therefore, the correct answer is **Option D ((X - Y) \\cup (Y - X))**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-12 (GATE CSE 2006 Part 2)
  // ==========================================

  "go:1829": {
    concept: "Algorithms - Non-Linear Recurrence Substitution to Log-Domain",
    markdown: `- **Concept / Theoretical Foundation**:
  - We solve the recurrence:
    $$T(n) = 2 T(\\sqrt{n}) + 1, \\quad T(1) = 1$$
- **Step-by-Step Domain Transformation**:
  1. Let $n = 2^m \\implies m = \\log_2 n$.
  2. Then $\\sqrt{n} = n^{1/2} = (2^m)^{1/2} = 2^{m/2}$.
  3. Substituting into the recurrence:
     $$T(2^m) = 2 T(2^{m/2}) + 1$$
  4. Define a new sequence $S(m) = T(2^m)$:
     $$S(m) = 2 S(m/2) + 1$$
  5. Apply the standard Master Theorem to $S(m)$:
     - Here $a = 2, b = 2, f(m) = 1$.
     - Watershed function: $m^{\\log_2 2} = m^1 = m$.
     - Since $f(m) = 1 = O(m^{1 - \\epsilon})$ for $\\epsilon = 1 > 0$ (Case 1):
       $$S(m) = \\Theta(m)$$
  6. Substitute back $m = \\log_2 n$:
     $$T(n) = S(\\log_2 n) = \\Theta(\\log n)$$

Therefore, the correct answer is **Option B (T(n) = \\Theta(\\log n))**.`,
    images: []
  },

  "go:1830": {
    concept: "Algorithms - Quicksort with Linear-Time Median Pivot Selection",
    markdown: `- **Concept / Theoretical Foundation**:
  - The median of $n$ elements can be found in deterministic worst-case $O(n)$ time using the **Median-of-Medians** algorithm (Blum, Floyd, Pratt, Rivest, Tarjan).
  - Using the exact median as the pivot guarantees perfectly balanced partitions at every recursive level.
- **Complexity Derivation**:
  1. Because the median splits the array into two subarrays of size at most $\\lfloor n/2 \\rfloor$:
     - Left subproblem: size $\\le n/2$.
     - Right subproblem: size $\\le n/2$.
  2. Partitioning around the median takes $O(n)$ time.
  3. The overall recurrence relation is:
     $$T(n) = 2 T(n/2) + \\Theta(n)$$
  4. Applying Case 2 of the Master Theorem:
     - $a = 2, b = 2 \\implies n^{\\log_b a} = n^1 = n$.
     - $f(n) = \\Theta(n) = \\Theta(n^{\\log_b a})$.
     - Therefore:
       $$T(n) = \\Theta(n \\log n)$$

Therefore, the correct answer is **Option B (\\Theta(n \\log n))**.`,
    images: []
  },

  "go:1831": {
    concept: "Algorithms - Merge Procedure Loop Termination Invariants",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the loop invariants of the standard two-array merge prefix:
    \`\`\`c
    void xyz(int a, int b, int c) {
        int i, j, k;
        i = j = k = 0;
        while ((i < n) && (j < m))
            if (a[i] < b[j]) c[k++] = a[i++];
            else c[k++] = b[j++];
    }
    \`\`\`
- **Analytical Evaluation of Post-Loop Conditions**:
  1. In every iteration of the loop, exactly one element from either $a$ or $b$ is placed into $c$, and $k$ increments by $1$.
  2. Therefore, throughout execution, the exact relationship is:
     $$k = i + j$$
  3. **Evaluation of Statement (i)**:
     - Statement (i) asserts: *"if $i = n$, then $k = n + j - 1$"*.
     - This is arithmetically false: when $i = n$, $k = n + j$, not $n + j - 1$.
  4. **Evaluation of Statement (ii)**:
     - Statement (ii) asserts: *"if $j = m$, then $k = m + i - 1$"*.
     - This is likewise false: when $j = m$, $k = m + i$, not $m + i - 1$.
  5. Both statements contain erroneous off-by-one arithmetic for $k$.
  6. Hence, neither condition (i) nor (ii) holds.

Therefore, the correct answer is **Option D (neither (i) nor (ii))**.`,
    images: []
  },

  "go:1832": {
    concept: "Algorithms - Longest Span with Equal Sum in Two Binary Arrays",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given two binary arrays $a[1 \\dots n]$ and $b[1 \\dots n]$ where each entry is $0$ or $1$, we seek the maximum span $(i, j)$ such that:
    $$\\sum_{k=i}^j a_k = \\sum_{k=i}^j b_k \\iff \\sum_{k=i}^j (a_k - b_k) = 0$$
- **Prefix Sum Reduction**:
  1. Define the difference array $D[k] = a_k - b_k \\in \\{-1, 0, 1\\}$.
  2. Define the running prefix sum $P[x] = \\sum_{k=1}^x D[k]$, with $P[0] = 0$.
  3. The condition $\\sum_{k=i}^j D[k] = 0$ is equivalent to:
     $$P[j] - P[i - 1] = 0 \\iff P[j] = P[i - 1]$$
  4. The possible values of the prefix sum $P[x]$ range strictly from $-n$ to $+n$ (a total of $2n + 1$ possible integers).
  5. By allocating a direct-address lookup table of size $2n + 1$ initialized to -1, we store the *first index* where each prefix sum value is encountered.
  6. In a single linear scan from $x = 0$ to $n$:
     - If $P[x]$ was seen previously at index $idx$, the span length is $x - idx$. We update the maximum span.
     - If $P[x]$ is seen for the first time, record $x$.
  7. This algorithm runs in $\\Theta(n)$ time and uses $\\Theta(n)$ auxiliary space.

Therefore, the correct answer is **Option C (Takes \\Theta(n) time and space)**.`,
    images: []
  },

  "go:1835": {
    concept: "C Programming - Pointer Swapping Without Temporary Variable Edge Cases",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate the arithmetic-based in-place swap implementation:
    \`\`\`c
    void swap (int *px, int *py) {
        *px = *px - *py;
        *py = *px + *py;
        *px = *py - *px;
    }
    \`\`\`
- **Analysis of the Five Statements**:
  1. **Compilation**: The syntax is standard C pointer dereference and arithmetic; it compiles without errors $\\implies$ **S1 is FALSE**.
  2. **Memory Access & Segmentation Fault (S2)**:
     - If either \`px\` or \`py\` is NULL or an invalid/unmapped memory address, dereferencing \`*px\` or \`*py\` triggers undefined behavior, typically resulting in a runtime segmentation fault $\\implies$ **S2 is TRUE**.
  3. **Aliasing / Identical Pointer Bug (S3 & S4)**:
     - Suppose both pointers refer to the same memory location (\`px == py\`, so \`*px\` and \`*py\` alias the same integer $V$):
       - Line 1: \`*px = *px - *px = V - V = 0\`.
       - Line 2: \`*py = *px + *px = 0 + 0 = 0\`.
       - Line 3: \`*px = *py - *px = 0 - 0 = 0\`.
     - The variable is corrupted to 0 instead of maintaining its value!
     - Thus, the swap fails when \`px == py\`, meaning it works for some but not all valid input pointers $\\implies$ **S3 is FALSE and S4 is TRUE**.
  4. **Pointer Arithmetic (S5)**: The code operates strictly on integers (\`*px, *py\`), not on pointer values $\\implies$ **S5 is FALSE**.
- **Conclusion**:
  - Statements S2 and S4 are true.

Therefore, the correct answer is **Option C (S2 and S4)**.`,
    images: []
  },

  "go:1852": {
    concept: "Data Structures - 3-ary Max-Heap Array Representation and Validity",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a 3-ary max-heap stored in a 0-indexed array $a[0 \\dots n-1]$:
    - Root is at $a[0]$.
    - Children of node $i$ are at indices:
      $$\\text{children}(i) = \\{3i + 1, \\ 3i + 2, \\ 3i + 3\\}$$
    - Parent of node $j$ is at index:
      $$\\text{parent}(j) = \\left\\lfloor \\frac{j - 1}{3} \\right\\rfloor$$
    - The max-heap property requires: $a[\\text{parent}(j)] \\ge a[j]$ for all $j > 0$.
- **Validation of Option D: $[9, 5, 6, 8, 3, 1]$**:
  1. Node 0 ($a[0] = 9$):
     - Children are at indices $1, 2, 3$: values $a[1] = 5, a[2] = 6, a[3] = 8$.
     - $9 \\ge 5, 9 \\ge 6, 9 \\ge 8$ (Heap property holds!).
  2. Node 1 ($a[1] = 5$):
     - Children are at indices $3(1) + 1 = 4$ and $3(1) + 2 = 5$: values $a[4] = 3, a[5] = 1$.
     - $5 \\ge 3, 5 \\ge 1$ (Heap property holds!).
  3. All parent-child relationships satisfy the max-heap invariant.
- **Why Other Options Fail**:
  - In Option B ($[9, 6, 3, 1, 8, 5]$): node $a[1] = 6$ has child $a[4] = 8$, but $6 < 8$ (violates max-heap!).
  - In Option C ($[9, 3, 6, 8, 5, 1]$): node $a[1] = 3$ has children $a[4] = 5$, but $3 < 5$ (violates max-heap!).

Therefore, the correct answer is **Option D (9, 5, 6, 8, 3, 1)**.`,
    images: []
  },

  "go:87191": {
    concept: "Data Structures - 3-ary Max-Heap Sequential Insertions Trace",
    markdown: `- **Concept / Theoretical Foundation**:
  - Inserting an element $x$ into a 3-ary heap of size $n$ places $x$ at index $n$ and bubbles it up by repeatedly swapping with its parent at $\\lfloor (j - 1)/3 \\rfloor$ while $x > \\text{parent}$.
- **Step-by-Step Insertion into Initial Heap $[9, 5, 6, 8, 3, 1]$**:
  1. **Insert 7**:
     - Place 7 at index 6: array becomes $[9, 5, 6, 8, 3, 1, 7]$.
     - Parent of index 6 is $\\lfloor (6 - 1)/3 \\rfloor = 1$ ($a[1] = 5$).
     - Since $7 > 5$, swap $a[6]$ and $a[1]$:
       $$[9, 7, 6, 8, 3, 1, 5]$$
     - Parent of index 1 is $0$ ($a[0] = 9$). Since $7 \\le 9$, stop.
  2. **Insert 2**:
     - Place 2 at index 7: array becomes $[9, 7, 6, 8, 3, 1, 5, 2]$.
     - Parent of index 7 is $\\lfloor (7 - 1)/3 \\rfloor = 2$ ($a[2] = 6$).
     - Since $2 \\le 6$, stop.
  3. **Insert 10**:
     - Place 10 at index 8: array becomes $[9, 7, 6, 8, 3, 1, 5, 2, 10]$.
     - Parent of index 8 is $\\lfloor (8 - 1)/3 \\rfloor = 2$ ($a[2] = 6$).
     - Since $10 > 6$, swap $a[8]$ and $a[2]$:
       $$[9, 7, 10, 8, 3, 1, 5, 2, 6]$$
     - Now 10 is at index 2; its parent is index $0$ ($a[0] = 9$).
     - Since $10 > 9$, swap $a[2]$ and $a[0]$:
       $$[10, 7, 9, 8, 3, 1, 5, 2, 6]$$
  4. **Insert 4**:
     - Place 4 at index 9: array becomes $[10, 7, 9, 8, 3, 1, 5, 2, 6, 4]$.
     - Parent of index 9 is $\\lfloor (9 - 1)/3 \\rfloor = 2$ ($a[2] = 9$).
     - Since $4 \\le 9$, stop.
- **Final Resulting Heap Sequence**:
  $$10, 7, 9, 8, 3, 1, 5, 2, 6, 4$$

Therefore, the correct answer is **Option A (10, 7, 9, 8, 3, 1, 5, 2, 6, 4)**.`,
    images: []
  },

  "go:3548": {
    concept: "Data Structures - Binary Tree Degree-2 and Leaf Count Relation",
    markdown: `- **Concept / Theoretical Foundation**:
  - In any binary tree, let:
    - $n_0$: number of leaf nodes (degree 0).
    - $n_1$: number of internal nodes with degree 1.
    - $n_2$: number of internal nodes with degree 2.
- **Fundamental Binary Tree Theorem ($n_0 = n_2 + 1$)**:
  1. Total vertices in the tree:
     $$n = n_0 + n_1 + n_2$$
  2. Total edges in any tree of $n$ vertices:
     $$E = n - 1 = n_0 + n_1 + n_2 - 1$$
  3. Each edge connects a parent to a child. Summing outgoing edges from all nodes:
     $$E = 0 \\cdot n_0 + 1 \\cdot n_1 + 2 \\cdot n_2 = n_1 + 2n_2$$
  4. Equating the two expressions for $E$:
     $$n_0 + n_1 + n_2 - 1 = n_1 + 2n_2$$
     $$n_0 = n_2 + 1$$
- **Given Parameters**:
  - $n_1 = 5$
  - $n_2 = 10$
- **Leaf Node Calculation**:
  $$n_0 = 10 + 1 = 11$$

Therefore, the correct answer is **Option B (11)**.`,
    images: []
  },

  "go:3559": {
    concept: "Data Structures & Cryptography - Hash Function Principles and Properties",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **hash function** $h: U \\to \\{0, 1, \\dots, m-1\\}$ maps input keys or messages to hash codes.
- **Evaluation of the Statements**:
  1. **Statement I: A hash function takes a message of arbitrary length and generates a fixed length code**:
     - **TRUE**. By standard definition, hash functions (such as MD5, SHA-256, or cyclic redundancy hashes) process variable/arbitrary-length inputs and map them into a uniform, fixed-size digest or index.
  2. **Statement II: A hash function takes a message of fixed length and generates a code of variable length**:
     - **FALSE**. Hash functions do not produce variable-length output codes.
  3. **Statement III: A hash function may give the same hash value for distinct messages**:
     - **TRUE**. Since the input space is typically much larger than (or infinite compared to) the fixed-size output space, by the **Pigeonhole Principle**, collisions ($h(m_1) = h(m_2)$ for $m_1 \\ne m_2$) are inevitable.
- **Conclusion**:
  - Statements I and III are TRUE.

Therefore, the correct answer is **Option C (I and III only)**.`,
    images: []
  },

  "go:3587": {
    concept: "Data Structures - Validating Binary Max-Heap Array Invariant",
    markdown: `- **Concept / Theoretical Foundation**:
  - Under 1-based indexing in array $A[1 \\dots 10]$, for a valid max-heap:
    $$A[i] \\ge A[2i] \\quad \\text{and} \\quad A[i] \\ge A[2i + 1]$$
- **Verification of Option C: $[23, 17, 14, 7, 13, 10, 1, 5, 6, 12]$**:
  1. Index 1 ($23$):
     - Children at 2 and 3: $A[2] = 17, A[3] = 14$. Both $\\le 23$ (Valid).
  2. Index 2 ($17$):
     - Children at 4 and 5: $A[4] = 7, A[5] = 13$. Both $\\le 17$ (Valid).
  3. Index 3 ($14$):
     - Children at 6 and 7: $A[6] = 10, A[7] = 1$. Both $\\le 14$ (Valid).
  4. Index 4 ($7$):
     - Children at 8 and 9: $A[8] = 5, A[9] = 6$. Both $\\le 7$ (Valid).
  5. Index 5 ($13$):
     - Child at 10: $A[10] = 12$. Since $13 \\ge 12$ (Valid).
- **Why Other Options Fail**:
  - **Option A**: $A[4] = 6$ has child $A[8] = 12$, but $6 < 12$ (violates heap).
  - **Option B**: $A[4] = 6$ has child $A[9] = 7$, but $6 < 7$ (violates heap).
  - **Option D**: $A[4] = 7$ has child $A[8] = 12$, but $7 < 12$ (violates heap).

Therefore, the correct answer is **Option C ({23, 17, 14, 7, 13, 10, 1, 5, 6, 12})**.`,
    images: []
  },

  "go:3588": {
    concept: "Data Structures - Binary Search Tree Search Path Invariant Range Constraints",
    markdown: `- **Concept / Theoretical Foundation**:
  - When searching for key $K = 55$ in a Binary Search Tree (BST), every visited node $x$ dynamically narrows the allowable range $[\\text{low}, \\text{high}]$ for all subsequent nodes on the search path:
    - If $x < K$: the search branches right, updating $\\text{low} = x$. All subsequent keys must be $> x$.
    - If $x > K$: the search branches left, updating $\\text{high} = x$. All subsequent keys must be $< x$.
- **Evaluation of Sequence C: $\\{9, 85, 47, 68, 43, 57, 55\\}$**:
  1. Initial interval: $(-\\infty, \\infty)$.
  2. Visit 9: $9 < 55 \\implies$ interval becomes $(9, \\infty)$.
  3. Visit 85: $85 > 55 \\implies$ interval becomes $(9, 85)$.
  4. Visit 47: $47 < 55 \\implies$ interval becomes $(47, 85)$.
  5. Visit 68: $68 > 55 \\implies$ interval becomes $(47, 68)$.
  6. **Visit 43**:
     - Key 43 is strictly less than the established lower bound of $47$ ($43 < 47$).
     - Because we branched right at 47, all nodes in that subtree must be strictly greater than 47. Finding 43 here is impossible in a valid BST!
- **Conclusion**:
  - Sequence C cannot be a search path for 55.

Therefore, the correct answer is **Option C ({9, 85, 47, 68, 43, 57, 55})**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-13 (GATE IT 2006 Part 2)
  // ==========================================

  "go:3589": {
    concept: "Graph Theory - Strongly Connected Components (SCC) Decomposition",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **Strongly Connected Component (SCC)** of a directed graph is a maximal subgraph in which every vertex is reachable from every other vertex.
- **Component Reachability Analysis**:
  1. Inspect vertex $U$:
     - $U$ has incoming directed edges from $R$ and $S$.
     - However, $U$ has **no outgoing edges** to any other vertex in the graph.
     - Therefore, no other vertex is reachable from $U$, meaning $U$ cannot belong to any cycle or mutually reachable component of size $> 1$.
     - Thus, $\\{U\\}$ is a singleton SCC.
  2. Inspect the remaining subgraph on $\\{P, Q, R, S, T, V\\}$:
     - Directed cycles exist that interconnect all of these vertices (e.g., $P \\to Q \\to R \\to S \\to P$, and paths through $T$ and $V$ that cycle back to $P$).
     - Because every vertex in $\\{P, Q, R, S, T, V\\}$ can reach every other vertex in this subset, they form a single maximal strongly connected component.
  3. The graph decomposes into exactly two SCCs:
     $$\\{P, Q, R, S, T, V\\} \\quad \\text{and} \\quad \\{U\\}$$

Therefore, the correct answer is **Option B ({P, Q, R, S, T, V}, {U})**.`,
    images: ["/Gate_QA/question-images/15508488027359242559.webp"]
  },

  "go:3590": {
    concept: "Graph Theory - DFS Parenthesis Theorem and Connected Components",
    markdown: `- **Concept / Theoretical Foundation**:
  - In Depth-First Search, the discovery time $d(u)$ and finish time $f(u)$ satisfy the **Parenthesis Theorem**:
    - For any two vertices $u$ and $v$, the intervals $[d(u), f(u)]$ and $[d(v), f(v)]$ are either entirely disjoint or one is completely nested within the other.
    - If $[d(v), f(v)] \\subset [d(u), f(u)]$, then $v$ is a descendant of $u$ in the DFS tree, and both belong to the same connected component.
- **Given Intervals**:
  - $P: [5, 12]$
  - $Q: [6, 10]$
  - $R: [14, 18]$
- **Analytical Deduction**:
  1. Comparing $P$ and $Q$:
     $$[d(Q), f(Q)] = [6, 10] \\subset [5, 12] = [d(P), f(P)]$$
     - The interval of $Q$ is strictly contained within that of $P$.
     - Therefore, $Q$ was discovered while $P$ was active, establishing that $Q$ is in the DFS tree rooted at $P$.
     - Thus, **$P$ and $Q$ belong to the same connected component**.
  2. Comparing with $R$:
     - DFS from $P$ completed and closed at time $f(P) = 12$.
     - Vertex $R$ was discovered at time $d(R) = 14 > 12$.
     - In an undirected graph, if $R$ were connected to $P$ or $Q$, the DFS initiated at $P$ would have traversed to $R$ before finishing at time 12.
     - Because $R$'s interval is completely disjoint from $P$'s, $R$ belongs to a **different connected component**.
  3. Hence, there are two connected components, and $P$ and $Q$ are connected.

Therefore, the correct answer is **Option D (There are two connected components, and P and Q are connected)**.`,
    images: []
  },

  "go:3591": {
    concept: "Algorithms - Huffman Coding with Fibonacci Frequencies",
    markdown: `- **Concept / Theoretical Foundation**:
  - Huffman coding greedily merges the two trees with the lowest frequencies at each step.
  - When character frequencies follow the Fibonacci sequence ($F_1, F_2, \\dots, F_8$):
    $$a:1, \\ b:1, \\ c:2, \\ d:3, \\ e:5, \\ f:8, \\ g:13, \\ h:21$$
- **Huffman Tree Construction**:
  1. Merge $a(1)$ and $b(1) \\implies T_1(2)$.
  2. Lowest two are $T_1(2)$ and $c(2) \\implies T_2(4)$.
  3. Lowest two are $d(3)$ and $T_2(4) \\implies T_3(7)$.
  4. Lowest two are $e(5)$ and $T_3(7) \\implies T_4(12)$.
  5. Lowest two are $f(8)$ and $T_4(12) \\implies T_5(20)$.
  6. Lowest two are $g(13)$ and $T_5(20) \\implies T_6(33)$.
  7. Final merge $h(21)$ and $T_6(33) \\implies \\text{Root}(54)$.
- **Codeword Lengths & Structure**:
  - $h$ is at depth 1 or 2 (assigned short code like \`0\` or \`10\`).
  - Characters with smaller frequencies have longer codes.
  - Given encoded bitstream:
    $$\\mathbf{110111100111010}$$
  - Parsing the bitstream against prefix-free Huffman codewords decomposes into the 5 characters:
    $$f, \\ d, \\ h, \\ e, \\ g$$
  - Decoded sequence is **\`fdheg\`**.

Therefore, the correct answer is **Option A (fdheg)**.`,
    images: []
  },

  "go:3592": {
    concept: "C Programming - Struct Arrays and Postfix vs Prefix Pointer Precedence",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace pointer operations on an array of structs:
    \`\`\`c
    struct test { int i; char *c; } st[] = {
        {5, "become"}, {4, "better"}, {6, "jungle"}, {8, "ancestor"}, {7, "brother"}
    };
    struct test *p = st;
    \`\`\`
- **Step-by-Step Execution Trace**:
  1. \`p += 1;\`:
     - Advances \`p\` to point to \`st[1]\` ($i = 4, c = \\text{"better"}$).
  2. \`++p->c;\`:
     - Arrow \`->\` has higher precedence than prefix \`++\`.
     - Increments the character pointer \`p->c\` by 1: from \`"better"\` to \`"etter"\`.
  3. \`printf("%s,", p++->c);\`:
     - Postfix \`++\` evaluates the current expression \`p->c\` first, and then advances pointer \`p\`.
     - Prints \`"etter,"\`.
     - \`p\` now points to \`st[2]\` ($i = 6, c = \\text{"jungle"}$).
  4. \`printf("%c,", *++p->c);\`:
     - Evaluates \`++p->c\`: \`p->c\` (currently \`"jungle"\`) is incremented by 1, pointing to \`"ungle"\`.
     - Dereference \`*\` reads the first character: \`'u'\`.
     - Prints \`"u,"\`.
  5. \`printf("%d,", p[0].i);\`:
     - \`p[0]\` refers to \`st[2]\`, whose integer field is \`6\`.
     - Prints \`"6,"\`.
  6. \`printf("%s\\n", p->c);\`:
     - \`p->c\` currently points to \`"ungle"\`.
     - Prints \`"ungle"\`.
- **Combined Output**:
  $$\\text{etter, u, 6, ungle}$$

Therefore, the correct answer is **Option B (etter, u, 6, ungle)**.`,
    images: []
  },

  "go:3593": {
    concept: "C Programming - Pointer Parameter Pass-by-Value & Static Variables",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, pointers are passed **by value**: modifying a pointer parameter inside a function updates only the local parameter variable, leaving the caller's pointers and referenced variables unchanged unless dereferenced (\`*x\`).
  - Static variables retain their values across subsequent function calls.
- **Trace of \`swap\`**:
  \`\`\`c
  void swap (int *x, int *y) {
      static int *temp;
      temp = x; x = y; y = temp;
  }
  \`\`\`
  - \`swap\` swaps the local pointer variables \`x\` and \`y\` themselves, rather than dereferencing and swapping the pointed-to integers (\`*x\` and \`*y\`).
  - Therefore, **\`swap(&a, &b)\` does not swap the values of \`a\` and \`b\` at all**.
- **Execution of \`printab()\` - Call 1**:
  - Initially: $a = -3, b = -6$.
  - Loop with $i = 0$ while $i \\le 4$:
    - $i = 0$: \`i++ % 2 == 0 % 2 == 0\` (condition false, $i$ becomes 1). $a = -3 + 1 = -2, b = -6 + 1 = -5$.
    - $i = 1$: \`i++ % 2 == 1 % 2 == 1\` (condition true, continue, $i$ becomes 2).
    - $i = 2$: \`i++ % 2 == 2 % 2 == 0\` (condition false, $i$ becomes 3). $a = -2 + 3 = 1, b = -5 + 3 = -2$.
    - $i = 3$: \`i++ % 2 == 3 % 2 == 1\` (condition true, continue, $i$ becomes 4).
    - $i = 4$: \`i++ % 2 == 4 % 2 == 0\` (condition false, $i$ becomes 5). $a = 1 + 5 = 6, b = -2 + 5 = 3$.
    - $i = 5 > 4$: loop terminates.
  - \`swap(&a, &b)\` has no effect.
  - Prints: \`a = 6, b = 3\`.
- **Execution of \`printab()\` - Call 2**:
  - Static variables retain their values: $a = 6, b = 3$.
  - Same loop iterations add $+1, +3, +5 = +9$:
    - $a = 6 + 9 = 15$.
    - $b = 3 + 9 = 12$.
  - Prints: \`a = 15, b = 12\`.

Therefore, the correct answer is **Option D (a = 6, b = 3 \\n a = 15, b = 12)**.`,
    images: []
  },

  "go:3594": {
    concept: "C Programming - Array of Pointers and Multidimensional Dereferencing",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given arrays:
    \`\`\`c
    int a1[] = {6, 7, 8, 18, 34, 67};
    int a2[] = {23, 56, 28, 29};
    int a3[] = {-12, 27, -31};
    int *x[] = {a1, a2, a3};
    \`\`\`
  - Function \`print(int **a)\` is invoked with \`print(x)\`.
- **Step-by-Step Expression Evaluations**:
  1. \`printf("%d,", a[0][2]);\`:
     - \`a[0]\` is \`a1\`. \`a1[2]\` is **8**.
  2. \`printf("%d,", *a[2]);\`:
     - \`a[2]\` is \`a3\`. \`*a3\` is \`a3[0]\`, which is **-12**.
  3. \`printf("%d,", *++a[0]);\`:
     - Prefix \`++\` modifies \`a[0]\`: advances \`a1\` by 1 so \`a1\` now points to \`a1[1]\`.
     - Dereferencing \`*a1\` yields **7**.
  4. \`printf("%d,", *(++a)[0]);\`:
     - Prefix \`++a\` advances the pointer \`a\` from \`x[0]\` to \`x[1]\`.
     - \`a[0]\` now accesses \`x[1]\`, which is \`a2\`.
     - \`*(a2)\` is \`a2[0]\`, which is **23**.
  5. \`printf("%d\\n", a[-1][+1]);\`:
     - \`a[-1]\` accesses \`x[0]\`, which is \`a1\`.
     - Recall that \`a1\` was previously incremented in step 3 to point to index 1.
     - Therefore, \`a[-1][+1]\` accesses \`*(a1 + 1)\`, which refers to the original \`a1[2]\`, value **8**.
- **Combined Output**:
  $$\\text{8, -12, 7, 23, 8}$$

Therefore, the correct answer is **Option A (8, -12, 7, 23, 8)**.`,
    images: []
  },

  "go:3595": {
    concept: "Algorithms - Binomial Coefficient Recurrence Base Case Condition",
    markdown: `- **Concept / Theoretical Foundation**:
  - The binomial coefficient $\\binom{m}{n}$ satisfies **Pascal's Identity**:
    $$\\binom{m}{n} = \\binom{m - 1}{n} + \\binom{m - 1}{n - 1}$$
- **Base Case Derivation**:
  1. The recursive function is:
     \`\`\`c
     int func(int m, int n) {
         if (E) return 1;
         else return (func(m - 1, n) + func(m - 1, n - 1));
     }
     \`\`\`
  2. Mathematically, the combinatorial coefficient equals $1$ when:
     - Selecting 0 items: $\\binom{m}{0} = 1$ for all $m \\ge 0$ ($n == 0$).
     - Selecting all items: $\\binom{m}{m} = 1$ for all $m \\ge 0$ ($m == n$).
  3. The recursion branches down until either $n$ reaches $0$ or $m$ decreases until it equals $n$.
  4. Therefore, the base-case condition returning $1$ is:
     $$E: (n == 0) \\; || \\; (m == n)$$

Therefore, the correct answer is **Option C ((n == 0) || (m == n))**.`,
    images: []
  },

  "go:3615": {
    concept: "Data Structures - Complete Binary Tree 0-Based Parent Index Formula",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a 0-indexed complete binary tree stored in array $X[0 \\dots n-1]$:
    - Root is at index $0$.
    - For any parent node at index $p$:
      $$\\text{Left child} = 2p + 1, \\quad \\text{Right child} = 2p + 2$$
- **Derivation of Parent Formula for Child $i \\ne 0$**:
  1. If $i$ is a left child:
     $$i = 2p + 1 \\implies p = \\frac{i - 1}{2}$$
  2. If $i$ is a right child:
     $$i = 2p + 2 \\implies p = \\frac{i - 2}{2}$$
  3. Standard integer arithmetic provides the unified closed form:
     $$p = \\left\\lfloor \\frac{i - 1}{2} \\right\\rfloor$$
  4. Now evaluate the candidate expressions:
     - **Option D: $\\lceil i/2 \\rceil - 1$**:
       - For $i = 1$ (left child of 0): $\\lceil 1/2 \\rceil - 1 = 1 - 1 = 0$ (Correct).
       - For $i = 2$ (right child of 0): $\\lceil 2/2 \\rceil - 1 = 1 - 1 = 0$ (Correct).
       - For $i = 3$ (left child of 1): $\\lceil 3/2 \\rceil - 1 = 2 - 1 = 1$ (Correct).
       - For $i = 4$ (right child of 1): $\\lceil 4/2 \\rceil - 1 = 2 - 1 = 1$ (Correct).
       - For $i = 5$ (left child of 2): $\\lceil 5/2 \\rceil - 1 = 3 - 1 = 2$ (Correct).
       - For $i = 6$ (right child of 2): $\\lceil 6/2 \\rceil - 1 = 3 - 1 = 2$ (Correct).
     - $\\lceil i/2 \\rceil - 1$ holds universally for all $i \\ne 0$.

Therefore, the correct answer is **Option D (\\lceil i/2 \\rceil - 1)**.`,
    images: []
  },

  "go:3616": {
    concept: "Data Structures - Restoring Heap Property via Heapify Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a complete binary tree of $n$ elements where both the left and right subtrees of the root already satisfy the heap property, and only the root node violates the heap property:
    - The standard algorithm to restore the heap property is **\`MAX-HEAPIFY\` (or \`MIN-HEAPIFY\`)**.
- **Complexity Analysis**:
  1. The heapify procedure compares the root key with its children, swaps with the extreme child if necessary, and recurses down that child's subtree.
  2. At each level of the tree, heapify performs a constant number of comparisons and at most one swap ($O(1)$ work per level).
  3. The height of a complete binary tree containing $n$ elements is:
     $$h = \\lfloor \\log_2 n \\rfloor$$
  4. In the worst case, the misplaced key trickles all the way down from the root to a leaf.
  5. The maximum number of levels traversed is $h$, yielding the time complexity:
     $$\\text{Time} = O(h) = O(\\log n)$$

Therefore, the correct answer is **Option B (O(\\log n))**.`,
    images: []
  },

  "go:3617": {
    concept: "Data Structures - Complete Binary Tree Node Level Formula",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a 0-indexed complete binary tree where the root is at level $0$:
    - Level $0$: contains $2^0 = 1$ node (index $0$).
    - Level $1$: contains $2^1 = 2$ nodes (indices $1, 2$).
    - Level $2$: contains $2^2 = 4$ nodes (indices $3, 4, 5, 6$).
    - Level $k$: contains $2^k$ nodes.
- **Analytical Derivation for Index $i$**:
  1. The starting index of level $k$ is the sum of nodes in all preceding levels:
     $$\\text{start}(k) = \\sum_{j=0}^{k-1} 2^j = 2^k - 1$$
  2. The ending index of level $k$ is:
     $$\\text{end}(k) = (2^k - 1) + (2^k - 1) = 2^{k+1} - 2$$
  3. Thus, a node at index $i$ belongs to level $k$ if and only if:
     $$2^k - 1 \\le i \\le 2^{k+1} - 2$$
     $$2^k \\le i + 1 \\le 2^{k+1} - 1 < 2^{k+1}$$
  4. Taking the base-2 logarithm:
     $$k \\le \\log_2(i + 1) < k + 1$$
  5. Applying the floor function:
     $$k = \\lfloor \\log_2(i + 1) \\rfloor$$

Therefore, the correct answer is **Option C (\\lfloor \\log_2(i + 1) \\rfloor)**.`,
    images: []
  },

  "go:3549": {
    concept: "Theory of Computation & Algorithms - NP-Completeness Definition & Reduction Direction",
    markdown: `- **Concept / Theoretical Foundation**:
  - By formal definition, a language $L$ is **NP-complete** if:
    1. $L \\in \\text{NP}$, and
    2. $L$ is **NP-hard**: for every problem $L' \\in \\text{NP}$, $L'$ is polynomial-time many-one reducible to $L$ ($L' \\le_p L$).
- **Transitivity of Polynomial-Time Reductions**:
  1. The Cook-Levin theorem established that SAT (and consequently 3-SAT) is NP-complete.
  2. Because 3-SAT is NP-complete, every language in NP reduces in polynomial time to 3-SAT.
  3. By the transitive property of polynomial-time reductions:
     - If the known NP-complete problem **3-SAT can be reduced to a problem $L$ in polynomial time** ($3\\text{-SAT} \\le_p L$), then for any arbitrary $L' \\in \\text{NP}$:
       $$L' \\le_p 3\\text{-SAT} \\le_p L \\implies L' \\le_p L$$
     - This proves that $L$ is NP-hard.
  4. Since $L$ is already given to be in NP, $L$ is therefore **NP-complete**.
- **Distractor Analysis**:
  - **Option A**: If $L$ reduces to 3-SAT ($L \\le_p 3\\text{-SAT}$), this merely shows that $L \\in \\text{NP}$, not that $L$ is NP-hard.
  - **Option B**: Correctly specifies reducing a known NP-complete problem (3-SAT) to $L$.

Therefore, the correct answer is **Option B (the 3-SAT problem can be reduced to it in polynomial time)**.`,
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
  for (const [uid, sol] of Object.entries(CHUNK_CSE_DSA_11_TO_13_SOLUTIONS)) {
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

if (process.argv[1] && process.argv[1].endsWith("apply-chunk-cse-dsa-11-to-13.mjs")) {
  applyChunkSolutions();
}
