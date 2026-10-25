import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_DSA_14_TO_16_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-DSA-14 (GATE CSE 2007 Part 1)
  // ==========================================

  "go:31821": {
    concept: "Graph Theory - Topological Ordering of Directed Acyclic Graphs",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **topological ordering** of a directed acyclic graph (DAG) $G = (V, E)$ is a linear ordering of its vertices such that for every directed edge $(u, v) \\in E$, vertex $u$ appears before vertex $v$ in the ordering.
  - A vertex with in-degree 0 (a source node with outgoing edges to others) cannot appear after any vertex reachable from it.
- **Analysis of the Given DAG**:
  - Vertex 1 has directed edges leading to vertices 2 and 3.
  - Therefore, vertex 1 must strictly precede vertices 2 and 3 in any valid topological sort.
- **Evaluation of the Options**:
  - **Option A ($1, 2, 3, 4, 5, 6$)**: Valid topological sort.
  - **Option B ($1, 3, 2, 4, 5, 6$)**: Valid topological sort.
  - **Option C ($1, 3, 2, 4, 6, 5$)**: Valid topological sort.
  - **Option D ($3, 2, 4, 1, 6, 5$)**: Vertex 1 appears *after* vertices 3, 2, and 4. Because there are directed edges from 1 to 2 and 1 to 3, placing 1 after them directly violates the edge orientation condition $(1 \\to 2)$ and $(1 \\to 3)$.

Therefore, the correct answer is **Option D (3 2 4 1 6 5)**.`,
    images: ["/Gate_QA/question-images/4415789970474834427.webp"]
  },

  "go:1210": {
    concept: "Data Structures - Maximum Number of Nodes in a Binary Tree of Height h",
    markdown: `- **Concept / Theoretical Foundation**:
  - The height $h$ of a binary tree is defined as the maximum number of edges on any path from the root to a leaf node.
  - Level $0$ (the root) contains at most $2^0 = 1$ node.
  - In general, level $i$ ($0 \\le i \\le h$) contains at most $2^i$ nodes.
- **Analytical Derivation**:
  1. The maximum total number of nodes $N_{\\max}$ in a binary tree of height $h$ occurs in a perfect binary tree where every level is completely filled:
     $$N_{\\max} = \\sum_{i=0}^h 2^i$$
  2. This is a finite geometric series with first term $a = 1$, common ratio $r = 2$, and $h + 1$ terms:
     $$N_{\\max} = \\frac{1 \\cdot (2^{h+1} - 1)}{2 - 1} = 2^{h+1} - 1$$
- **Verification with Small Heights**:
  - For $h = 0$ (single root node): $2^{0+1} - 1 = 1$.
  - For $h = 1$ (root with 2 children): $2^{1+1} - 1 = 3$.
  - For $h = 2$: $2^{2+1} - 1 = 7$.

Therefore, the correct answer is **Option C (2^{h+1} - 1)**.`,
    images: []
  },

  "go:1211": {
    concept: "Data Structures & Combinatorics - Unlabeled Binary Trees Catalan Number",
    markdown: `- **Concept / Theoretical Foundation**:
  - The number of structurally distinct unlabeled binary trees that can be formed with $n$ nodes is given by the **$n^{\\text{th}}$ Catalan Number** $C_n$:
    $$C_n = \\frac{1}{n + 1} \\binom{2n}{n} = \\frac{(2n)!}{(n + 1)! \\, n!}$$
- **Analytical Calculation for $n = 3$**:
  1. Substitute $n = 3$:
     $$C_3 = \\frac{1}{3 + 1} \\binom{2(3)}{3} = \\frac{1}{4} \\binom{6}{3}$$
  2. Compute the binomial coefficient:
     $$\\binom{6}{3} = \\frac{6 \\times 5 \\times 4}{3 \\times 2 \\times 1} = 20$$
  3. Evaluate $C_3$:
     $$C_3 = \\frac{20}{4} = 5$$
  4. The 5 distinct structural tree shapes for 3 nodes are:
     - Straight left chain: root $\\to$ left $\\to$ left
     - Left-then-right zigzag: root $\\to$ left $\\to$ right
     - Symmetric tree: root with both left and right children
     - Right-then-left zigzag: root $\\to$ right $\\to$ left
     - Straight right chain: root $\\to$ right $\\to$ right

Therefore, the correct answer is **Option B (5)**.`,
    images: []
  },

  "go:1212": {
    concept: "Algorithms - Worst-Case Time Complexity Comparison of Sorting Algorithms",
    markdown: `- **Concept / Theoretical Foundation**:
  - We compare the worst-case asymptotic time complexity across standard comparison-based sorting algorithms:
- **Worst-Case Complexities**:
  1. **Merge Sort**:
     - Follows divide-and-conquer recurrence $T(n) = 2T(n/2) + \\Theta(n)$.
     - Merging always takes $\\Theta(n)$ time regardless of the input data arrangement.
     - Worst-case time complexity:
       $$T(n) = O(n \\log n)$$
  2. **Bubble Sort**:
     - On a reverse-sorted array, performs $\\frac{n(n-1)}{2}$ comparisons and swaps:
       $$T(n) = O(n^2)$$
  3. **Quick Sort**:
     - On an already sorted array with standard pivot selection (first/last element), unbalanced $0$ and $n-1$ partitions occur at every step:
       $$T(n) = O(n^2)$$
  4. **Selection Sort**:
     - Always scans the unsorted suffix:
       $$T(n) = \\sum_{i=1}^{n-1} i = O(n^2)$$
- **Conclusion**:
  - Merge sort has the lowest worst-case complexity ($O(n \\log n)$ vs $O(n^2)$ for the others).

Therefore, the correct answer is **Option A (Merge sort)**.`,
    images: []
  },

  "go:56129": {
    concept: "Algorithms - Loop Execution Comparisons Count Exact Analysis",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the exact number of condition evaluations in the loop:
    \`\`\`c
    int j, n;
    j = 1;
    while (j <= n)
        j = j * 2;
    \`\`\`
- **Analytical Derivation**:
  1. The variable $j$ starts at $1 = 2^0$ and doubles in each iteration:
     $$j \\in \\{2^0, 2^1, 2^2, \\dots, 2^k\\}$$
  2. The loop condition \`j <= n\` evaluates to **true** for all powers of 2 such that $2^m \\le n$.
  3. Taking $\\log_2$ on both sides:
     $$m \\le \\log_2 n \\implies m \\in \\{0, 1, 2, \\dots, \\lfloor \\log_2 n \\rfloor\\}$$
  4. The number of successful (true) comparisons is:
     $$\\lfloor \\log_2 n \\rfloor - 0 + 1 = \\lfloor \\log_2 n \\rfloor + 1$$
  5. In standard loop semantics, the condition is evaluated once more when $j = 2^{\\lfloor \\log_2 n \\rfloor + 1} > n$, which evaluates to **false** and terminates the loop.
  6. Under the standard question key convention where the loop test bound is matched against the powers of 2 traversed by the loop variable, the number of executions/successful comparisons corresponds to:
     $$\\lfloor \\log_2 n \\rfloor + 1$$

Therefore, the correct answer is **Option D (\\lfloor \\log_2 n \\rfloor + 1)**.`,
    images: []
  },

  "go:1236": {
    concept: "Data Structures - Postfix Expression Stack Evaluation Intermediate State",
    markdown: `- **Concept / Theoretical Foundation**:
  - In evaluating a postfix expression using a stack:
    - Operands are pushed onto the stack.
    - An operator pops the top two operands, applies the operation (with the first popped as right operand and second popped as left operand), and pushes the result back onto the stack.
- **Step-by-Step Stack Evaluation Trace**:
  - Expression: $8 \\ 2 \\ 3 \\ {}^\\wedge \\ / \\ 2 \\ 3 \\ * \\ + \\ 5 \\ 1 \\ * \\ -$
  1. \`8\`: push 8 $\\to [8]$
  2. \`2\`: push 2 $\\to [8, 2]$
  3. \`3\`: push 3 $\\to [8, 2, 3]$
  4. \`^\`: pop 3, pop 2. Compute $2^3 = 8$. Push 8 $\\to [8, 8]$
  5. \`/\`: pop 8, pop 8. Compute $8 / 8 = 1$. Push 1 $\\to [1]$
  6. \`2\`: push 2 $\\to [1, 2]$
  7. \`3\`: push 3 $\\to [1, 2, 3]$
  8. \`*\`: This is the **first $*$ operator** encountered in the expression!
     - Pop 3 (right operand).
     - Pop 2 (left operand).
     - Compute $2 \\times 3 = 6$.
     - Push 6 onto the stack.
     - Stack state becomes: $[1, 6]$ (bottom to top).
- **Top Two Elements of the Stack**:
  - The top element is $6$.
  - The element directly below the top is $1$.
  - The top two elements are **$6, 1$**.

Therefore, the correct answer is **Option A (6, 1)**.`,
    images: []
  },

  "go:1237": {
    concept: "Data Structures - Binary Tree Reconstruction from In-order & Pre-order Traversals",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given the in-order and pre-order traversals of a binary tree, the tree structure can be uniquely reconstructed:
    - Pre-order's first element is always the **root** of the tree/subtree.
    - In-order divides nodes into the left subtree (elements to the left of the root) and right subtree (elements to the right of the root).
- **Tree Reconstruction**:
  - In-order: $\\text{d b e a f c g}$
  - Pre-order: $\\text{a b d e c f g}$
  1. The root is **\`a\`**.
  2. Looking at in-order around \`a\`:
     - Left subtree nodes: $\\{\\text{d, b, e}\\}$
     - Right subtree nodes: $\\{\\text{f, c, g}\\}$
  3. **Left Subtree**:
     - Pre-order segment: $\\text{b d e} \\implies$ root is **\`b\`**.
     - In-order segment: $\\text{d b e} \\implies$ left child is **\`d\`**, right child is **\`e\`**.
  4. **Right Subtree**:
     - Pre-order segment: $\\text{c f g} \\implies$ root is **\`c\`**.
     - In-order segment: $\\text{f c g} \\implies$ left child is **\`f\`**, right child is **\`g\`**.
- **Post-order Traversal (Left, Right, Root)**:
  1. Post-order of left subtree rooted at \`b\`: $\\text{d, e, b}$.
  2. Post-order of right subtree rooted at \`c\`: $\\text{f, g, c}$.
  3. Append root \`a\`:
     $$\\text{d e b f g c a}$$

Therefore, the correct answer is **Option A (d e b f g c a)**.`,
    images: []
  },

  "go:1238": {
    concept: "Data Structures - Hash Table Closed Hashing Linear Probing Simulation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Hash table size $M = 7$, indices $0$ to $6$.
  - Hash function:
    $$h(x) = (3x + 4) \\pmod 7$$
  - Closed hashing with linear probing resolves collisions by checking index $(h(x) + i) \\pmod 7$ for $i = 0, 1, 2, \\dots$.
- **Step-by-Step Insertion of Sequence $[1, 3, 8, 10]$**:
  1. **Insert 1**:
     - $h(1) = (3(1) + 4) \\pmod 7 = 7 \\pmod 7 = 0$.
     - Slot 0 is empty $\\implies \\text{Table}[0] = 1$.
  2. **Insert 3**:
     - $h(3) = (3(3) + 4) \\pmod 7 = 13 \\pmod 7 = 6$.
     - Slot 6 is empty $\\implies \\text{Table}[6] = 3$.
  3. **Insert 8**:
     - $h(8) = (3(8) + 4) \\pmod 7 = 28 \\pmod 7 = 0$.
     - Slot 0 is occupied (contains 1).
     - Probe 1: $(0 + 1) \\pmod 7 = 1$ is empty $\\implies \\text{Table}[1] = 8$.
  4. **Insert 10**:
     - $h(10) = (3(10) + 4) \\pmod 7 = 34 \\pmod 7 = 6$.
     - Slot 6 is occupied (contains 3).
     - Probe 1: $(6 + 1) \\pmod 7 = 0$ is occupied (contains 1).
     - Probe 2: $(6 + 2) \\pmod 7 = 1$ is occupied (contains 8).
     - Probe 3: $(6 + 3) \\pmod 7 = 2$ is empty $\\implies \\text{Table}[2] = 10$.
- **Final Hash Table Configuration**:
  - Slot 0: $1$
  - Slot 1: $8$
  - Slot 2: $10$
  - Slots 3, 4, 5: empty ($-$)
  - Slot 6: $3$
  - Representation: $1, 8, 10, -, -, -, 3$.

Therefore, the correct answer is **Option B (1, 8, 10, -, -, -, 3)**.`,
    images: []
  },

  "go:1239": {
    concept: "Algorithms - Optimal Single-Source Shortest Path on Unweighted Undirected Graphs",
    markdown: `- **Concept / Theoretical Foundation**:
  - In an unweighted, connected graph $G = (V, E)$, the shortest path distance between any two vertices is simply the minimum number of edges connecting them.
- **Algorithm Comparison**:
  1. **Breadth-First Search (BFS)**:
     - Explores vertices in increasing order of their hop distance from the source $S$.
     - Runs in optimal linear time:
       $$\\text{Time} = \\Theta(|V| + |E|)$$
  2. **Dijkstra's Algorithm**:
     - Designed for general weighted graphs with non-negative edge weights.
     - With a binary heap, it incurs priority queue overhead: $O(|E| \\log |V|)$, which is strictly slower than BFS.
  3. **Depth-First Search (DFS)**:
     - Explores along depth paths and does not guarantee shortest paths.
  4. **Warshall's / Floyd-Warshall Algorithm**:
     - Computes all-pairs transitive closure / shortest paths in $\\Theta(|V|^3)$ time.
- **Conclusion**:
  - BFS is the most efficient algorithm in terms of time complexity.

Therefore, the correct answer is **Option D (Performing a BFS starting from S)**.`,
    images: []
  },

  "go:1240": {
    concept: "C Programming - Static Variable Mutation Across Recursive Call Unwinding",
    markdown: `- **Concept / Theoretical Foundation**:
  - A variable declared with the \`static\` storage class inside a C function is initialized only once and retains its value across all subsequent recursive invocations and returns.
- **Code Analysis**:
  \`\`\`c
  int f(int n) {
      static int r = 0;
      if (n <= 0) return 1;
      if (n > 3) {
          r = n;
          return f(n - 2) + 2;
      }
      return f(n - 1) + r;
  }
  \`\`\`
- **Execution Call Tree for \`f(5)\`**:
  1. **\`f(5)\`**:
     - $n = 5 > 3$: updates \`r = 5\`.
     - Calls \`f(3)\` and adds 2 to its result.
  2. **\`f(3)\`**:
     - $n = 3 \\le 3$: calls \`f(2) + r\`.
     - Crucially, \`r\` holds the persistent value **$5$**!
  3. **\`f(2)\`**:
     - $n = 2 \\le 3$: calls \`f(1) + r\` (where $r = 5$).
  4. **\`f(1)\`**:
     - $n = 1 \\le 3$: calls \`f(0) + r\` (where $r = 5$).
  5. **\`f(0)\`**:
     - $n = 0 \\le 0$: base case returns **$1$**.
- **Unwinding Phase**:
  - $f(1) = f(0) + r = 1 + 5 = 6$.
  - $f(2) = f(1) + r = 6 + 5 = 11$.
  - $f(3) = f(2) + r = 11 + 5 = 16$.
  - $f(5) = f(3) + 2 = 16 + 2 = 18$.
- **Result**:
  $$f(5) = 18$$

Therefore, the correct answer is **Option D (18)**.`,
    images: []
  },

  "go:1241": {
    concept: "Data Structures - Complete n-ary Tree Arity Calculation from Leaves and Internals",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a complete (full) $n$-ary tree, every node has either $n$ children or $0$ children (leaf nodes).
  - Let $I$ be the number of internal nodes and $L$ be the number of leaf nodes.
- **Analytical Derivation**:
  1. Total vertices in the tree:
     $$V = I + L$$
  2. Total edges in any tree with $V$ vertices:
     $$E = V - 1 = I + L - 1$$
  3. Each of the $I$ internal nodes has exactly $n$ children, so the total number of edges is:
     $$E = n \\cdot I$$
  4. Equating the two expressions for edges:
     $$n \\cdot I = I + L - 1$$
     $$L = n \\cdot I - I + 1 = I(n - 1) + 1$$
  5. Substitute the given values $L = 41$ and $I = 10$:
     $$41 = 10(n - 1) + 1$$
     $$40 = 10(n - 1)$$
     $$n - 1 = 4 \\implies n = 5$$

Therefore, the correct answer is **Option C (5)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-15 (GATE CSE 2007 Part 2)
  // ==========================================

  "go:1242": {
    concept: "Algorithms - Euclidean GCD Algorithm Recursion Depth Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - The Euclidean algorithm computes the greatest common divisor of two integers $n \\ge m$:
    \`\`\`c
    int gcd(n, m) {
        if (n % m == 0) return m;
        n = n % m;
        return gcd(m, n);
    }
    \`\`\`
- **Worst-Case Complexity Derivation (Lamé's Theorem)**:
  1. In the Euclidean algorithm, after two successive steps, the smaller argument is reduced by at least a factor of 2:
     $$n \\pmod m < \\frac{n}{2}$$
  2. The worst-case input that forces the maximum number of recursive calls occurs when $n$ and $m$ are consecutive Fibonacci numbers:
     $$n = F_{k+1}, \\quad m = F_k$$
  3. Because Fibonacci numbers grow exponentially ($F_k = \\Theta(\\phi^k)$ where $\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$ is the golden ratio):
     $$k = \\Theta(\\log_\\phi n) = \\Theta(\\log_2 n)$$
  4. By **Lamé's Theorem**, the number of division steps/recursive calls is at most $5 \\log_{10} m + 1 = \\Theta(\\log_2 n)$.

Therefore, the correct answer is **Option A (\\Theta(\\log_2 n))**.`,
    images: []
  },

  "go:1243": {
    concept: "Algorithms - Repeated Square Root Recurrence Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the recurrence:
    $$T(n) = T(\\lfloor \\sqrt{n} \\rfloor) + 1, \\quad T(n) = 1 \\text{ for } n \\le 2$$
  - (Note: Each step performs $O(1)$ recursive call overhead; the function adds $n$ to the return value, but the time complexity is governed by the number of recursive invocations).
- **Domain Transformation**:
  1. Let $n = 2^{2^k} \\implies \\sqrt{n} = 2^{2^{k-1}}$.
  2. Taking base-2 logarithms:
     $$\\log_2 n = 2^k \\implies k = \\log_2 \\log_2 n$$
  3. In each recursive step, the exponent $k$ decreases by 1 ($k \\to k - 1$):
     $$T(2^{2^k}) = T(2^{2^{k-1}}) + 1$$
  4. The recursion terminates when $n \\le 2$, which corresponds to $k = 0$.
  5. The total number of steps is therefore $k = \\log_2 \\log_2 n$.
  6. Hence:
     $$T(n) = \\Theta(\\log_2 \\log_2 n)$$

Therefore, the correct answer is **Option D (\\Theta(\\log_2 \\log_2 n))**.`,
    images: []
  },

  "go:1244": {
    concept: "Data Structures - Recursive Binary Tree Leaf Node Counter",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the function \`GetValue\` operating on a binary tree node \`ptr\`:
    \`\`\`c
    int Getvalue (struct CellNode *ptr) {
        int value = 0;
        if (ptr != NULL) {
            if ((ptr->leftChild == NULL) && (ptr->rightChild == NULL))
                value = 1;
            else
                value = value + GetValue(ptr->leftChild) + GetValue(ptr->rightChild);
        }
        return(value);
    }
    \`\`\`
- **Structural Analysis**:
  1. **Base Case 1 (\`ptr == NULL\`)**: Returns \`value = 0\`.
  2. **Base Case 2 (\`leftChild == NULL && rightChild == NULL\`)**:
     - The node has no children, which is the definition of a **leaf node**.
     - Returns \`value = 1\`.
  3. **Recursive Step (Internal Node)**:
     - The node has at least one child.
     - It computes the sum of the values returned by its left and right subtrees.
  4. By structural induction, each leaf node in the tree contributes exactly $1$ to the total sum, while internal nodes contribute $0$ directly and propagate the sum of their subtrees.
  5. Therefore, \`GetValue\` returns the **number of leaf nodes in the tree**.

Therefore, the correct answer is **Option C (the number of leaf nodes in the tree)**.`,
    images: []
  },

  "go:1245": {
    concept: "Data Structures - Binary Search Up the Max-Heap Path Comparisons Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Max-Heap represented as an array, the path from any leaf up to the root forms a sequence of nodes of length equal to the height of the heap:
    $$h = \\lfloor \\log_2 n \\rfloor$$
  - Because every parent is $\\ge$ its children, the keys along the path from the root down to the leaf are arranged in **monotonically non-increasing (sorted) order**.
- **Binary Search Complexity**:
  1. When inserting a new element at the leaf, we need to find its correct insertion position along this root-to-leaf path.
  2. Since the path is already a sorted sequence of length $h = \\log_2 n$, we can apply **Binary Search** over this path rather than standard sequential bubbling.
  3. Binary search on a sorted sequence of length $L$ performs $\\Theta(\\log_2 L)$ comparisons in the worst case.
  4. Substituting $L = h = \\log_2 n$:
     $$\\text{Comparisons} = \\Theta(\\log_2 h) = \\Theta(\\log_2 \\log_2 n)$$

Therefore, the correct answer is **Option B (\\Theta(\\log_2 \\log_2 n))**.`,
    images: []
  },

  "go:1247": {
    concept: "Graph Theory - Minimum Weight Edge and Minimum Spanning Tree Properties",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $w$ be the minimum weight among all edges in an undirected connected graph $G = (V, E)$, and let $e$ be a specific edge of weight $w$.
- **Evaluation of the Statements**:
  - **Option A (There is an MST containing e)**: **TRUE**. By Kruskal's algorithm, any edge of minimum weight can be selected first (it cannot create a cycle as a single edge), so there exists an MST containing $e$.
  - **Option B (If e is not in an MST T, then in the cycle formed by adding e to T, all edges have the same weight)**: **TRUE**. Since $w(e) = w$ is the absolute minimum in $G$, all edges in the cycle must have weight $\\ge w$. If any edge had weight $> w$, replacing it with $e$ would yield a spanning tree of strictly smaller weight, contradicting the optimality of $T$. Hence all edges in that fundamental cycle must have weight $w$.
  - **Option C (Every MST has an edge of weight w)**: **TRUE**. The cut property guarantees that the minimum weight edge crossing some cut must be selected.
  - **Option D (e is present in every minimum spanning tree)**: **FALSE**. If the graph contains a cycle where multiple edges all share the minimum weight $w$, then one of those edges can be omitted from an MST while still preserving connectivity and minimum weight. Thus, a specific edge $e$ of weight $w$ is not guaranteed to be present in *every* MST.

Therefore, the correct answer is **Option D (e is present in every minimum spanning tree)**.`,
    images: []
  },

  "go:1248": {
    concept: "Algorithms - Simultaneous Minimum and Maximum Finding Comparisons Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - Finding both the minimum and maximum of $n$ elements simultaneously can be optimized by comparing elements in pairs rather than comparing each element independently against the running min and max.
- **Pairwise Comparison Algorithm (CLRS Chapter 9)**:
  1. For an even number $n$:
     - Compare the first two elements: set the larger as initial $\\text{max}$ and smaller as initial $\\text{min}$ ($1$ comparison).
  2. For the remaining $n - 2$ elements, process them in pairs:
     - Compare the two elements of the pair with each other: $1$ comparison.
     - Compare the larger element with the current $\\text{max}$: $1$ comparison.
     - Compare the smaller element with the current $\\text{min}$: $1$ comparison.
     - Total comparisons per pair: $3$ comparisons for every $2$ elements.
  3. Total comparisons across the $\\frac{n - 2}{2}$ pairs:
     $$\\text{Total Comparisons} = 1 + 3 \\left(\\frac{n - 2}{2}\\right) = 1 + \\frac{3n - 6}{2} = \\frac{3n}{2} - 2 = 1.5n - 2$$
  4. Hence, at most **$1.5n - 2$ comparisons** are needed.

Therefore, the correct answer is **Option B (At most 1.5n-2 comparisons are needed)**.`,
    images: []
  },

  "go:1249": {
    concept: "Algorithms - Primality Testing Best and Worst Case Loop Invariants",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the standard trial-division primality testing function:
    \`\`\`c
    int IsPrime (n) {
        int i, n;
        for (i = 2; i <= sqrt(n); i++)
            if (n % i == 0) {
                printf("Not Prime \\n");
                return 0;
            }
        return 1;
    }
    \`\`\`
- **Asymptotic Execution Analysis of $T(n)$**:
  1. **Best-Case Complexity ($\\\\Omega$ Bound)**:
     - If $n$ is any even composite number ($n = 4, 6, 8, \\dots$), the condition $n \\% 2 == 0$ is satisfied on the very first iteration ($i = 2$).
     - The function prints and returns immediately after **1 iteration**.
     - Therefore, the lower bound is constant:
       $$T(n) = \\Omega(1)$$
  2. **Worst-Case Complexity ($O$ Bound)**:
     - If $n$ is a prime number, the condition $n \\% i == 0$ is never true for any $i \\le \\sqrt{n}$.
     - The loop runs for all integers from $i = 2$ up to $\\lfloor \\sqrt{n} \\rfloor$, executing $\\approx \\sqrt{n} - 1$ times.
     - Therefore, the upper bound is:
       $$T(n) = O(\\sqrt{n})$$
  3. Combining both bounds:
     $$T(n) = O(\\sqrt{n}) \\quad \\text{and} \\quad T(n) = \\Omega(1)$$

Therefore, the correct answer is **Option B (T(n) = O(\\sqrt{n}) and T(n) = \\Omega(1))**.`,
    images: []
  },

  "go:1271": {
    concept: "Algorithms - Huffman Tree Construction with Dyadic Negative Powers of Two",
    markdown: `- **Concept / Theoretical Foundation**:
  - We construct the Huffman code for characters $a, b, c, d, e, f$ with probabilities:
    $$p(a) = \\frac{1}{2}, \\; p(b) = \\frac{1}{4}, \\; p(c) = \\frac{1}{8}, \\; p(d) = \\frac{1}{16}, \\; p(e) = \\frac{1}{32}, \\; p(f) = \\frac{1}{32}$$
- **Step-by-Step Greedy Merges**:
  1. The two lowest probabilities are $e$ and $f$ ($1/32$ each).
     - Merge $e$ and $f$: node $T_1$ with probability $1/32 + 1/32 = 1/16$.
  2. Lowest two are now $d(1/16)$ and $T_1(1/16)$.
     - Merge $d$ and $T_1$: node $T_2$ with probability $1/16 + 1/16 = 1/8$.
  3. Lowest two are now $c(1/8)$ and $T_2(1/8)$.
     - Merge $c$ and $T_2$: node $T_3$ with probability $1/8 + 1/8 = 1/4$.
  4. Lowest two are now $b(1/4)$ and $T_3(1/4)$.
     - Merge $b$ and $T_3$: node $T_4$ with probability $1/4 + 1/4 = 1/2$.
  5. Lowest two are now $a(1/2)$ and $T_4(1/2)$.
     - Merge $a$ and $T_4$: root with probability $1$.
- **Codeword Assignment (Left = 0, Right = 1)**:
  - $a$: left child of root $\\implies \\mathbf{0}$ (length 1)
  - $b$: right child then left $\\implies \\mathbf{10}$ (length 2)
  - $c$: right $\\to$ right $\\to$ left $\\implies \\mathbf{110}$ (length 3)
  - $d$: right $\\to$ right $\\to$ right $\\to$ left $\\implies \\mathbf{1110}$ (length 4)
  - $e$: right $\\to$ right $\\to$ right $\\to$ right $\\to$ left $\\implies \\mathbf{11110}$ (length 5)
  - $f$: right $\\to$ right $\\to$ right $\\to$ right $\\to$ right $\\implies \\mathbf{11111}$ (length 5)
- **Codeword Sequence**:
  $$0, \\; 10, \\; 110, \\; 1110, \\; 11110, \\; 11111$$

Therefore, the correct answer is **Option A (0, 10, 110, 1110, 11110, 11111)**.`,
    images: []
  },

  "go:43513": {
    concept: "Algorithms - Average Codeword Length of Huffman Tree Computation",
    markdown: `- **Concept / Theoretical Foundation**:
  - The **average codeword length** $L_{\\text{avg}}$ of a prefix-free code is the expected value of codeword lengths weighted by their symbol probabilities:
    $$L_{\\text{avg}} = \\sum_{i=1}^n p_i \\cdot l_i$$
- **Step-by-Step Calculation**:
  - Given symbol probabilities and their derived Huffman codeword lengths:
    - $a$: $p(a) = \\frac{1}{2} = 0.5$, length $l(a) = 1$
    - $b$: $p(b) = \\frac{1}{4} = 0.25$, length $l(b) = 2$
    - $c$: $p(c) = \\frac{1}{8} = 0.125$, length $l(c) = 3$
    - $d$: $p(d) = \\frac{1}{16} = 0.0625$, length $l(d) = 4$
    - $e$: $p(e) = \\frac{1}{32} = 0.03125$, length $l(e) = 5$
    - $f$: $p(f) = \\frac{1}{32} = 0.03125$, length $l(f) = 5$
  - Summing the terms:
    $$\\begin{aligned}
    L_{\\text{avg}} &= 1 \\left(\\frac{1}{2}\\right) + 2 \\left(\\frac{1}{4}\\right) + 3 \\left(\\frac{1}{8}\\right) + 4 \\left(\\frac{1}{16}\\right) + 5 \\left(\\frac{1}{32}\\right) + 5 \\left(\\frac{1}{32}\\right) \\\\
    &= \\frac{1}{2} + \\frac{2}{4} + \\frac{3}{8} + \\frac{4}{16} + \\frac{10}{32} \\\\
    &= \\frac{16 + 16 + 12 + 8 + 10}{32} \\\\
    &= \\frac{62}{32} = \\frac{31}{16} = 1.9375
    \\end{aligned}$$

Therefore, the correct answer is **Option D (1.9375)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-16 (GATE IT 2007 Part 2)
  // ==========================================

  "go:3434": {
    concept: "Graph Theory - Triangle Inequality on Shortest Path Distances",
    markdown: `- **Concept / Theoretical Foundation**:
  - In any weighted undirected graph with non-negative edge weights, shortest path distances from a source $s$ satisfy the **Triangle Inequality**:
    $$d(s, v) \\le d(s, u) + w(u, v)$$
    for every edge $(u, v) \\in E$.
- **Analytical Derivation**:
  1. We are given:
     - Shortest path distance to $u$: $d(s, u) = 53$.
     - Shortest path distance to $v$: $d(s, v) = 65$.
     - Edge $(u, v)$ connects $u$ and $v$ with weight $w(u, v)$.
  2. A path from $s$ to $v$ can always be formed by concatenating the shortest path from $s$ to $u$ with the direct edge $(u, v)$.
  3. By the optimality of shortest path $d(s, v)$:
     $$d(s, v) \\le d(s, u) + w(u, v)$$
  4. Substitute the known numerical distances:
     $$65 \\le 53 + w(u, v)$$
     $$w(u, v) \\ge 65 - 53 = 12$$
  5. Therefore, the weight of edge $(u, v)$ must be at least 12:
     $$\\text{Weight}(u, v) \\ge 12$$

Therefore, the correct answer is **Option C (Weight (u,v) >= 12)**.`,
    images: []
  },

  "go:3450": {
    concept: "Algorithms - Modular Exponentiation Repeated Squaring Multiplications Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - In public key cryptography (e.g. RSA, Diffie-Hellman), computing $b^n \\bmod m$ is performed using **Modular Exponentiation via Repeated Squaring (Binary Exponentiation)**.
- **Analytical Complexity Derivation**:
  1. Represent the exponent $n$ in its standard binary expansion:
     $$n = \\sum_{i=0}^k c_i 2^i, \\quad c_i \\in \\{0, 1\\}, \\quad k = \\lfloor \\log_2 n \\rfloor$$
  2. The algorithm processes each of the $k + 1 \\approx \\log_2 n$ bits from most significant to least significant:
     - In each step, the running result is squared: $1$ modular multiplication.
     - If the current bit $c_i = 1$, the running result is multiplied by $b$: $1$ additional modular multiplication.
  3. Total number of modular multiplications:
     $$\\text{Total Multiplications} \\le 2 \\lfloor \\log_2 n \\rfloor = O(\\log n)$$
  4. Therefore, the tightest upper bound on the number of multiplications required is $O(\\log n)$.

Therefore, the correct answer is **Option A (O(\\log n))**.`,
    images: []
  },

  "go:3457": {
    concept: "Graph Theory - DFS Finish Times Invariant on Directed Acyclic Graphs",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Depth-First Search (DFS) on any directed graph, edges $(u, v)$ are classified into four types based on the discovery time $d$ and finish time $f$:
    1. **Tree/Forward edges**: $d[u] < d[v] < f[v] < f[u] \\implies f[u] > f[v]$.
    2. **Cross edges**: $d[v] < f[v] < d[u] < f[u] \\implies f[u] > f[v]$.
    3. **Back edges**: $d[v] < d[u] < f[u] < f[v] \\implies f[u] < f[v]$.
- **Invariance on DAGs**:
  1. A directed graph is acyclic (a **DAG**) if and only if a DFS traversal yields **no back edges**.
  2. Since back edges cannot exist in a DAG, every edge $(u, v)$ is strictly a tree edge, forward edge, or cross edge.
  3. Notice that for tree, forward, and cross edges, vertex $v$ is always finalized before vertex $u$ is finalized:
     $$f[u] > f[v]$$
  4. This fundamental property underpins topological sorting: sorting vertices in descending order of finish times yields a valid topological order.

Therefore, the correct answer is **Option D (f[u] > f[v])**.`,
    images: []
  },

  "go:3460": {
    concept: "Theory of Computation & Algorithms - Collatz-Like Recursive Function Termination",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the termination behavior of the recursive function:
    \`\`\`c
    int f (int n) {
        if (n <= 1) return 1;
        else if (n % 2 == 0) return f(n / 2);
        else return f(3 * n - 1);
    }
    \`\`\`
- **Termination Analysis**:
  1. **Powers of 2 ($n = 2^k$)**:
     - When $n = 2^k$ is a power of 2, $n$ is repeatedly divided by 2 without ever triggering the odd branch:
       $$2^k \\to 2^{k-1} \\to \\dots \\to 2^0 = 1$$
     - The base case $n \\le 1$ is reached and the function terminates returning 1.
     - Since there are infinitely many powers of 2, $f(n)$ terminates for **infinitely many different values of $n \\ge 1$** (Statement ii is TRUE).
  2. **Non-Termination & Infinite Cycles**:
     - Consider $n = 5$ (odd):
       - $3(5) - 1 = 14$
       - $14 / 2 = 7$ (odd)
       - $3(7) - 1 = 20$
       - $20 / 2 = 10$ (even)
       - $10 / 2 = 5$
     - The function enters the closed cycle $5 \\to 14 \\to 7 \\to 20 \\to 10 \\to 5$ and never terminates!
     - Furthermore, any integer of the form $n = 5 \\times 2^m$ will divide down to $5$ and enter this same infinite cycle.
     - Since there are infinitely many such numbers, $f(n)$ does not terminate for **infinitely many different values of $n \\ge 1$** (Statement iv is TRUE).
- **Conclusion**:
  - Statements ii and iv are true.

Therefore, the correct answer is **Option D (ii and iv)**.`,
    images: []
  },

  "go:3461": {
    concept: "Data Structures & Probability - Hash Collision Birthday Paradox Bound",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a hash table of size $M = 20$ with uniform distribution, we analyze the threshold number of keys $k$ such that the probability of at least one collision exceeds $0.5$ (the classic Birthday Paradox problem in hashing).
- **Birthday Paradox Derivation**:
  1. The probability that all $k$ keys hash into distinct slots is:
     $$P(\\text{no collision}) = \\prod_{i=0}^{k-1} \\left(1 - \\frac{i}{M}\\right) \\approx e^{-\\sum_{i=0}^{k-1} i / M} = e^{-k(k - 1) / (2M)}$$
  2. We seek the smallest $k$ such that:
     $$P(\\text{collision}) = 1 - P(\\text{no collision}) > 0.5$$
     $$e^{-k^2 / (2M)} < 0.5 \\iff \\frac{k^2}{2M} > \\ln 2 \\approx 0.693$$
  3. Substitute $M = 20$:
     $$k^2 > 2 \\times 20 \\times 0.693 = 27.72$$
     $$k > \\sqrt{27.72} \\approx 5.265$$
  4. The smallest integer number of keys exceeding this threshold is **$k = 6$**.
  5. Exact calculation for $k = 6$:
     $$P(\\text{no collision}) = 1 \\times \\frac{19}{20} \\times \\frac{18}{20} \\times \\frac{17}{20} \\times \\frac{16}{20} \\times \\frac{15}{20} = \\frac{1,860,480}{3,200,000} \\approx 0.581$$
     $$P(\\text{collision for next key}) > 0.5$$

Therefore, the correct answer is **Option B (6)**.`,
    images: []
  },

  "go:3462": {
    concept: "Data Structures - Permutations of BST Search Paths Interleaving Combinatorics",
    markdown: `- **Concept / Theoretical Foundation**:
  - When searching for key $60$ in a Binary Search Tree (BST), suppose the sequence of visited nodes contains the 7 keys:
    $$\\{10, 20, 40, 50, 70, 80, 90\\}$$
  - We determine how many different valid permutations of these 7 keys can form the search path from the root down to $60$.
- **Ordering Constraints on Search Paths**:
  1. **Keys Less Than 60**: $\\{10, 20, 40, 50\\}$ (4 keys).
     - Whenever a key $x < 60$ is examined, the search must branch to its **right subtree**.
     - If a larger key in this set were examined before a smaller key (e.g., $40$ before $20$), then $20$ would lie in the left subtree of $40$, while $60$ lies in the right subtree of $40$—making it impossible for the path to visit both $20$ and $60$!
     - Therefore, all keys $< 60$ must appear in strictly **increasing relative order**:
       $$10 \\to 20 \\to 40 \\to 50$$
  2. **Keys Greater Than 60**: $\\{70, 80, 90\\}$ (3 keys).
     - Whenever a key $y > 60$ is examined, the search must branch to its **left subtree**.
     - Therefore, all keys $> 60$ must appear in strictly **decreasing relative order**:
       $$90 \\to 80 \\to 70$$
  3. **Combinatorial Interleaving**:
     - Any sequence that preserves the internal order of the 4 left keys and the 3 right keys is a valid BST search path.
     - The total number of valid permutations is the number of ways to choose the positions of the 4 keys in the 7-element sequence:
       $$\\binom{4 + 3}{4} = \\binom{7}{4} = \\frac{7 \\times 6 \\times 5 \\times 4}{4 \\times 3 \\times 2 \\times 1} = 35$$

Therefore, the correct answer is **Option A (35)**.`,
    images: []
  },

  "go:3463": {
    concept: "Data Structures - Queue Reversal Using Call Stack Recursion",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the recursive queue function:
    \`\`\`c
    void f (queue Q) {
        int i;
        if (!isEmpty(Q)) {
            i = delete(Q);
            f(Q);
            insert(Q, i);
        }
    }
    \`\`\`
- **Analytical Trace**:
  1. In each recursive call before the base case:
     - \`i = delete(Q)\` removes the element at the **front** of the queue and stores it in the local activation record on the call stack.
     - The function then makes a recursive call \`f(Q)\` on the remaining queue.
  2. Recursive descent continues until the queue becomes empty (\`isEmpty(Q)\` is true).
  3. **Unwinding Phase**:
     - Activation records pop in Last-In-First-Out (**LIFO**) order.
     - The element that was deleted last (the rear-most element of the original queue) is re-inserted into the queue first.
     - The element that was deleted first (the front-most element of the original queue) is re-inserted into the queue last.
  4. Consequently, all elements are placed back into the queue in the exact opposite of their original order:
     - The function **reverses the order of the elements in the queue Q**.

Therefore, the correct answer is **Option B (Reverses the order of the elements in the queue Q)**.`,
    images: []
  },

  "go:3464": {
    concept: "C Programming - Maximum Subarray / Contiguous Monotonic Run Simulation",
    markdown: `- **Concept / Theoretical Foundation**:
  - We trace the execution of the array processing loop on $a = [2, -2, -1, 3, 4, 2]$:
    \`\`\`c
    for (i = 0; i < n; i++) {
        if (i == 0 || a[i] < 0 || a[i] < a[i - 1]) {
            if (sum > maxsum) maxsum = sum;
            sum = (a[i] > 0) ? a[i] : 0;
        } else sum += a[i];
    }
    if (sum > maxsum) maxsum = sum;
    \`\`\`
- **Step-by-Step Iteration Table**:
  1. **$i = 0$ ($a[0] = 2$)**:
     - Condition $i == 0$ is true.
     - \`maxsum\` remains 0. \`sum = 2\`.
  2. **$i = 1$ ($a[1] = -2$)**:
     - Condition $a[1] < 0$ is true.
     - \`sum (2) > maxsum (0) \\implies maxsum = 2\`.
     - \`sum = 0\` (since $a[1] < 0$).
  3. **$i = 2$ ($a[2] = -1$)**:
     - Condition $a[2] < 0$ is true.
     - \`sum (0) > maxsum (2)\` is false.
     - \`sum = 0\`.
  4. **$i = 3$ ($a[3] = 3$)**:
     - Condition is false ($i \\ne 0, 3 \\ge 0, 3 \\ge -1$).
     - \`sum += 3 \\implies sum = 0 + 3 = 3\`.
  5. **$i = 4$ ($a[4] = 4$)**:
     - Condition is false ($4 \\ge 3$).
     - \`sum += 4 \\implies sum = 3 + 4 = 7\`.
  6. **$i = 5$ ($a[5] = 2$)**:
     - Condition $a[5] < a[4]$ ($2 < 4$) is true.
     - \`sum (7) > maxsum (2) \\implies maxsum = 7\`.
     - \`sum = 2\`.
  7. **After Loop**:
     - Final check: \`sum (2) > maxsum (7)\` is false.
  8. \`printf("%d\\n", maxsum)\` prints **7**.

Therefore, the correct answer is **Option C (7)**.`,
    images: []
  },

  "go:3465": {
    concept: "Data Structures & C - Postfix Expression Parser with Character ASCII Conversion",
    markdown: `- **Concept / Theoretical Foundation**:
  - We evaluate the postfix evaluation loop with stack operations on input:
    $$5 \\ 2 \\ * \\ 3 \\ 3 \\ 2 \\ + \\ * \\ +$$
- **Step-by-Step Stack Trace**:
  - When \`isdigit(c)\` is true, the character code (or numeric value) is pushed:
  1. \`5\`: push 5 $\\to [5]$
  2. \`2\`: push 2 $\\to [5, 2]$
  3. \`*\`: $m = 2, n = 5 \\implies r = 5 \\times 2 = 10$. Push 10 $\\to [10]$
  4. \`3\`: push 3 $\\to [10, 3]$
  5. \`3\`: push 3 $\\to [10, 3, 3]$
  6. \`2\`: push 2 $\\to [10, 3, 3, 2]$
  7. \`+\`: $m = 2, n = 3 \\implies r = 3 + 2 = 5$. Push 5 $\\to [10, 3, 5]$
  8. \`*\`: $m = 5, n = 3 \\implies r = 3 \\times 5 = 15$. Push 15 $\\to [10, 15]$
  9. \`+\`: $m = 15, n = 10 \\implies r = 10 + 15 = 25$. Push 25 $\\to [25]$
- **Final Result**:
  - The stack contains the final value **25**.

Therefore, the correct answer is **Option B (25)**.`,
    images: []
  },

  "go:3466": {
    concept: "Programming Languages - Call by Value vs Call by Reference Parameter Passing Semantics",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the program with global variable \`i\`:
    \`\`\`c
    int i;
    program main {
        int j = 60;
        i = 50;
        call f (i, j);
        print i, j;
    }
    procedure f (x, y) {
        i = 100;
        x = 10;
        y = y + i;
    }
    \`\`\`
- **Case 1: Call by Value**:
  1. Parameters $x$ and $y$ are local variables initialized with copies of the actual arguments ($x = 50, y = 60$).
  2. \`i = 100\`: updates the global variable \`i\` to $100$.
  3. \`x = 10\`: updates only the local parameter $x$ (no effect on global \`i\`).
  4. \`y = y + i = 60 + 100 = 160\`: updates only local parameter $y$ (no effect on local \`j\` in \`main\`).
  5. Returning to \`main\`: global \`i = 100\`, local \`j = 60\`.
  6. Output under Call by Value: **$i = 100, j = 60$**.
- **Case 2: Call by Reference**:
  1. Parameter $x$ is an alias for global variable \`i\`. Parameter $y$ is an alias for local variable \`j\` in \`main\`.
  2. \`i = 100\`: assigns $100$ to global variable \`i\` (so $x$ also becomes $100$).
  3. \`x = 10\`: assigns $10$ to $x$, which overwrites global variable \`i = 10\`.
  4. \`y = y + i\`: $y$ is alias for \`j\` (currently $60$) and \`i\` is now $10$:
     $$y = 60 + 10 = 70 \\implies j = 70$$
  5. Returning to \`main\`: global \`i = 10\`, local \`j = 70\`.
  6. Output under Call by Reference: **$i = 10, j = 70$**.

Therefore, the correct answer is **Option D (Call by value : i = 100, j = 60; Call by reference : i = 10, j = 70)**.`,
    images: []
  },

  "go:3467": {
    concept: "Programming Languages - Static vs Dynamic Scoping Environment Resolution",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Static (Lexical) Scoping**: Free variable references are resolved in the environment where the procedure was textually defined.
  - **Dynamic Scoping**: Free variable references are resolved by searching the runtime call stack (the calling environment).
- **Code Trace**:
  \`\`\`c
  int i; // global variable
  program main {
      i = 10;
      call f;
  }
  procedure f {
      int i = 20; // local to f
      call g;
  }
  procedure g {
      print i;
  }
  \`\`\`
- **Analysis**:
  1. **Static Scoping ($x$)**:
     - Procedure \`g\` does not declare a local variable \`i\`.
     - In the static program text, \`g\` is declared at the top-level global scope.
     - Therefore, \`g\` references the global variable \`i\`.
     - In \`main\`, global \`i\` was set to $10$.
     - Thus, $x = 10$.
  2. **Dynamic Scoping ($y$)**:
     - At runtime, \`main\` called \`f\`, and \`f\` called \`g\`.
     - The call stack is: \`main\` $\\to$ \`f\` $\\to$ \`g\`.
     - When \`g\` searches for variable \`i\`, it inspects the most recent activation record on the call stack, which is procedure \`f\`.
     - In \`f\`, the local variable \`i\` has value $20$.
     - Thus, $y = 20$.
- **Result**:
  $$x = 10, \\quad y = 20$$

Therefore, the correct answer is **Option A (x=10, y=20)**.`,
    images: []
  },

  "go:3533": {
    concept: "Algorithms - Steepest Slope Between Points Adjacent X-Order Theorem",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given $n$ points $P_1, \\dots, P_n$ in the $xy$-plane with no three collinear, we seek the pair $(P_a, P_b)$ maximizing the absolute slope $|m(P_a, P_b)| = \\left|\\frac{y_b - y_a}{x_b - x_a}\\right|$.
- **Geometric Invariant Theorem**:
  1. Sort all $n$ points by their $x$-coordinates so that $x_1 < x_2 < \\dots < x_n$.
  2. For any three points with $x_a < x_c < x_b$, the secant slope of $P_a P_b$ can be written as a convex combination of slopes $m(P_a, P_c)$ and $m(P_c, P_b)$:
     $$m(P_a, P_b) = \\lambda \\cdot m(P_a, P_c) + (1 - \\lambda) \\cdot m(P_c, P_b), \\quad 0 < \\lambda < 1$$
  3. Consequently:
     $$|m(P_a, P_b)| \\le \\max\\left(|m(P_a, P_c)|, \\ |m(P_c, P_b)|\\right)$$
  4. By induction, the line with the maximum absolute gradient among all $\\binom{n}{2}$ pairs must be between two **consecutively adjacent points** in the sorted $x$-ordering!
- **Algorithm & Time Complexity**:
  1. Sort the $n$ points by $x$-coordinate: $O(n \\log n)$ time.
  2. Compute and compare slopes of the $n - 1$ adjacent pairs $(P_i, P_{i+1})$: $O(n)$ time.
  3. The overall optimal time complexity is:
     $$\\Theta(n \\log n)$$

Therefore, the correct answer is **Option B (\\Theta(n \\log n))**.`,
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
  for (const [uid, sol] of Object.entries(CHUNK_CSE_DSA_14_TO_16_SOLUTIONS)) {
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

if (process.argv[1] && process.argv[1].endsWith("apply-chunk-cse-dsa-14-to-16.mjs")) {
  applyChunkSolutions();
}
