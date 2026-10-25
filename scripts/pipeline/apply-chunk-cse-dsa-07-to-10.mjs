import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_DSA_07_TO_10_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-DSA-07 (GATE CSE 2005 Part 1)
  // ==========================================

  "go:1343": {
    concept: "C Programming - Function Pointer Declarations & Syntax",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, declarations follow the **"declaration mirrors use"** and operator precedence rules:
    - Postfix operators \`()\` (function call) and \`[]\` (array indexing) have higher precedence than the prefix unary \`*\` (dereference / pointer) operator.
  - Parentheses around \`(*f)\` override this precedence, binding the pointer operator \`*\` directly to the identifier \`f\`.
- **Step-by-Step Syntactic Parsing of \`int (*f) (int *);\`**:
  1. Start with the identifier: \`f\`.
  2. Inside the innermost parentheses: \`(*f)\` indicates that \`f\` is a **pointer**.
  3. Look outside to the right: \`(int *)\` indicates that \`f\` points to a **function** taking a single parameter of type pointer to integer (\`int *\`).
  4. Look to the left for the return type: \`int\` indicates that the function returns an **integer**.
  5. Combining these components: \`f\` is a **pointer to a function that takes an integer pointer as argument and returns an integer**.
- **Distractor Analysis**:
  - **Option A**: Describes \`int f(int *)\`, which is a function returning an \`int\`, not a pointer to a function.
  - **Option B**: Describes \`int * (*f)(int)\`, where the parameter is \`int\` and return type is \`int *\`.
  - **Option C**: Correctly identifies \`f\` as a pointer to a function taking \`int *\` and returning \`int\`.
  - **Option D**: Describes a function returning a function pointer (e.g. \`void (*f(int *))()\`).

Therefore, the correct answer is **Option C (A pointer to a function that takes an integer pointer as argument and returns an integer)**.`,
    images: []
  },

  "go:1344": {
    concept: "Data Structures - Abstract Data Type (ADT) Principles",
    markdown: `- **Concept / Theoretical Foundation**:
  - An **Abstract Data Type (ADT)** is a mathematical model for data types where a data type is defined purely by its behavior (semantics) from the point of view of a user of the data.
  - Specifically, an ADT defines the set of values and the set of operations that can be performed on those values, while completely encapsulating and hiding the underlying concrete implementation details (such as array vs linked list representations).
- **Analysis of Options**:
  - **Option A (same as an abstract class)**: Incorrect. An abstract class is a specific object-oriented programming language construct, whereas an ADT is a formal theoretical concept in computer science that exists independently of OOP.
  - **Option B (a data type that cannot be instantiated)**: Incorrect. ADTs (like Stacks, Queues, Priority Queues) are meant to be instantiated and used in programs once a concrete implementation is provided.
  - **Option C (a data type for which only the operations defined on it can be used, but none else)**: Correct. The hallmark of an ADT is encapsulation and interface restriction: client code interacts with the ADT strictly and exclusively through its predefined interface operations (e.g. \`push\`, \`pop\`, \`peek\`), without direct access to internal representation.
  - **Option D (all of the above)**: Incorrect since A and B are false.

Therefore, the correct answer is **Option C (a data type for which only the operations defined on it can be used, but none else)**.`,
    images: []
  },

  "go:1345": {
    concept: "Programming Paradigms - Declarative Nature of Logic and Functional Languages",
    markdown: `- **Concept / Theoretical Foundation**:
  - Programming paradigms are fundamentally categorized into:
    1. **Imperative / Procedural Languages** (e.g. C, Pascal): Focus on *how* to achieve a result through explicit sequences of state-mutating commands.
    2. **Declarative Languages**: Focus on *what* the problem is and what relationships or results hold, leaving the underlying execution machinery to deduce or compute the answer.
- **Comparison of Logic and Functional Paradigms**:
  - **Logic Programming** (e.g., Prolog): Based on formal first-order predicate logic and resolution refutation. Programs declare facts and rules (often Horn clauses), and an inference engine searches for satisfying bindings.
  - **Functional Programming** (e.g., Haskell, Lisp, ML): Based on Church's $\\lambda$-calculus. Computation is the mathematical evaluation of pure functions without mutable state or side effects.
  - **Common Unifying Property**: Both logic and functional programming belong to the overarching **declarative paradigm**, emphasizing expression of logic and mathematical definitions rather than explicit algorithmic control flow.
- **Distractor Analysis**:
  - **Option A**: Incorrect; neither is procedural.
  - **Option B**: Incorrect; only functional programming is based on $\\lambda$-calculus, whereas logic programming is based on predicate logic / Horn clauses.
  - **Option C**: Correct; both are declarative languages.
  - **Option D**: Incorrect; only logic programming uses Horn clauses.

Therefore, the correct answer is **Option C (both are declarative)**.`,
    images: []
  },

  "go:1346": {
    concept: "Software Engineering & OOP - Essential Object-Oriented Features",
    markdown: `- **Concept / Theoretical Foundation**:
  - The object-oriented programming (OOP) paradigm is defined by four foundational pillars:
    1. **Abstraction**: Hiding internal implementation details and exposing only essential interfaces.
    2. **Encapsulation**: Bundling data with the methods that operate on that data, restricting direct access.
    3. **Inheritance**: Enabling new classes to inherit properties and behaviors from existing classes.
    4. **Polymorphism**: The ability of different classes to respond to the same message/method invocation in different ways (especially dynamic/runtime polymorphism enabled by inheritance and virtual dispatch).
- **Evaluation of Statements**:
  - **I. Abstraction and encapsulation**: Essential and core to the definition of OOP.
  - **II. Strictly-typedness**: Not an essential feature of OOP. Many prominent OOP languages are dynamically typed (e.g., Smalltalk—the quintessential pure OOP language, Python, Ruby, JavaScript).
  - **III. Type-safe property coupled with sub-type rule**: While desirable in statically typed OOP systems, it is not an intrinsic requirement of OOP generally.
  - **IV. Polymorphism in the presence of inheritance**: Foundational to OOP; dynamic dispatch in class hierarchies is a defining characteristic.
- **Conclusion**:
  - Statements I and IV are the essential features of object-oriented languages.

Therefore, the correct answer is **Option B (I and IV only)**.`,
    images: []
  },

  "go:1347": {
    concept: "Data Structures - Frequency Counting & Array Indexing Optimization",
    markdown: `- **Concept / Theoretical Foundation**:
  - In direct-address frequency counting (histogram generation), each possible distinct value is mapped to an array index.
  - To optimize space efficiency, the allocated array should span only the range of values that need to be recorded and reported.
- **Given Parameters**:
  - Total students: $N = 500$.
  - Possible student score range: $[0, 100]$.
  - The program only prints the frequency of scores **strictly above 50**, which corresponds to integers in the range $[51, 100]$.
- **Analytical Derivation**:
  1. The distinct scores greater than 50 are:
     $$\\{51, 52, 53, \\dots, 100\\}$$
  2. The total count of distinct target score values is:
     $$100 - 51 + 1 = 50$$
  3. By applying an index offset mapping:
     $$\\text{index} = \\text{score} - 51 \\quad (0 \\le \\text{index} \\le 49)$$
     a fixed-size array of exactly **50 numbers** is sufficient to track the frequencies of all scores above 50.
  4. An array of 100 or 500 numbers wastes memory on irrelevant scores or redundant slots.

Therefore, the correct answer is **Option A (An array of 50 numbers)**.`,
    images: []
  },

  "go:1348": {
    concept: "Graph Theory - Minimum Spanning Trees of Complete Graphs",
    markdown: `- **Concept / Theoretical Foundation**:
  - An undirected graph $G$ with $n$ nodes whose adjacency matrix has $0$ on the diagonal and $1$ on all off-diagonal entries is the **complete graph $K_n$** where every pair of distinct vertices is connected by an edge of uniform weight $1$.
  - A spanning tree of any connected graph with $n$ vertices contains exactly $n - 1$ edges.
- **Analytical Derivation**:
  1. **Cost of any Spanning Tree**:
     - Since every edge in $G$ has weight $1$, any spanning tree $T$ containing $n - 1$ edges has a total weight of:
       $$\\text{Cost}(T) = (n - 1) \\times 1 = n - 1$$
     - Because all edges have identical weight, every spanning tree is a **Minimum Spanning Tree (MST)** of cost $n - 1$.
  2. **Number of Distinct Spanning Trees**:
     - By **Cayley's Formula**, the total number of distinct spanning trees in a complete graph $K_n$ is:
       $$T(K_n) = n^{n-2}$$
     - For $n \\ge 3$, $n^{n-2} > 1$, which means there are multiple distinct spanning trees.
     - Each of these distinct spanning trees is an MST with identical cost $n - 1$.
- **Distractor Analysis**:
  - **Option A**: False; complete graphs are connected, so MSTs always exist.
  - **Option B**: False; the MST is not unique for $n \\ge 3$ ($n^{n-2} > 1$).
  - **Option C**: Correct; multiple distinct MSTs exist, each of cost $n - 1$.
  - **Option D**: False; all spanning trees have the exact same cost $(n-1)$.

Therefore, the correct answer is **Option C (Graph G has multiple distinct MSTs, each of cost n-1)**.`,
    images: []
  },

  "go:1367": {
    concept: "C Programming - Recursion Unwinding & Call-by-Value Parameter Passing",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, all function parameters are passed **by value**: modifying a parameter variable inside a function updates only the local copy on that function's activation record.
  - In recursive functions, statements placed *after* the recursive call execute during **call stack unwinding** (in reverse order of invocation).
- **Given Program Trace**:
  \`\`\`c
  void foo (int n, int sum) {
      int k = 0, j = 0;
      if (n == 0) return;
      k = n % 10; j = n / 10;
      sum = sum + k;
      foo (j, sum);
      printf ("%d,", k);
  }
  int main() {
      int a = 2048, sum = 0;
      foo(a, sum);
      printf("%d\\n", sum);
  }
  \`\`\`
- **Step-by-Step Execution Trace**:
  1. **Recursive Descent**:
     - \`foo(2048, 0)\`: $k = 8, j = 204, \\text{sum} = 8$. Calls \`foo(204, 8)\`.
     - \`foo(204, 8)\`: $k = 4, j = 20, \\text{sum} = 12$. Calls \`foo(20, 12)\`.
     - \`foo(20, 12)\`: $k = 0, j = 2, \\text{sum} = 12$. Calls \`foo(2, 12)\`.
     - \`foo(2, 12)\`: $k = 2, j = 0, \\text{sum} = 14$. Calls \`foo(0, 14)\`.
     - \`foo(0, 14)\`: Base case $n == 0$ reached; returns immediately.
  2. **Unwinding Phase (printing \`k\` in LIFO order)**:
     - Returns to \`foo(2, 12)\`: prints \`2,\`.
     - Returns to \`foo(20, 12)\`: prints \`0,\`.
     - Returns to \`foo(204, 8)\`: prints \`4,\`.
     - Returns to \`foo(2048, 0)\`: prints \`8,\`.
     - The output so far is: \`2, 0, 4, 8,\`.
  3. **Return to \`main\`**:
     - In \`main\`, \`sum\` was initialized to \`0\`. Because \`sum\` was passed by value to \`foo\`, \`main\`'s local variable \`sum\` remains completely unaffected:
       $$\\text{sum} = 0$$
     - \`printf("%d\\n", sum);\` prints \`0\`.
  4. **Combined Program Output**:
     $$\\text{2, 0, 4, 8, 0}$$

Therefore, the correct answer is **Option D (2, 0, 4, 8, 0)**.`,
    images: []
  },

  "go:1368": {
    concept: "C Programming - Function Prototypes & Implicit Declarations in ANSI C",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C standards (ANSI C / C89), if a function call is encountered without a prior declaration (prototype) in scope:
    - The compiler assumes an **implicit declaration** with return type \`int\`:
      \`\`\`c
      int foo();
      \`\`\`
- **Impact of Deleting Line 1 (\`double foo (double);\`)**:
  1. In \`main()\`, the statement \`db = foo(da);\` is compiled. Since no declaration of \`foo\` is visible, the compiler generates an implicit declaration:
     \`\`\`c
     int foo();
     \`\`\`
  2. Later in the same translation unit, the actual function definition is encountered:
     \`\`\`c
     double foo (double a) { return a; }
     \`\`\`
  3. The return type of the definition (\`double\`) directly conflicts with the previously inferred implicit return type (\`int\`).
  4. In ANSI C, conflicting types for the same identifier in the same scope constitute a **compilation error** (e.g. *"conflicting types for 'foo'"*).

Therefore, the correct answer is **Option D (compiler errors)**.`,
    images: []
  },

  "go:1369": {
    concept: "Data Structures - Binary Search Tree Traversals & In-order Invariant",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **Binary Search Tree (BST)** satisfies the fundamental ordering invariant:
    - For every node $x$, all keys in the left subtree of $x$ are strictly less than $x.\\text{key}$, and all keys in the right subtree are strictly greater than $x.\\text{key}$.
  - An **in-order traversal** of any valid BST always visits the nodes in strictly **non-decreasing (ascending sorted) order**.
- **Given Post-order Traversal Sequence**:
  $$\\{10, 9, 23, 22, 27, 25, 15, 50, 95, 60, 40, 29\\}$$
- **Analytical Derivation**:
  1. The set of keys in tree $T$ is obtained by gathering all unique keys from the given traversal:
     $$\\{9, 10, 15, 22, 23, 25, 27, 29, 40, 50, 60, 95\\}$$
  2. Sorting these keys in ascending order yields the unique in-order traversal:
     $$9, 10, 15, 22, 23, 25, 27, 29, 40, 50, 60, 95$$
  3. Option A matches this exact ascending sorted sequence.

Therefore, the correct answer is **Option A (9, 10, 15, 22, 23, 25, 27, 29, 40, 50, 60, 95)**.`,
    images: []
  },

  "go:1370": {
    concept: "Data Structures - Binary Max-Heap Insertion & Bubble-Up Simulation",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a **Max-Heap**, for every node $i$ other than the root, the parent satisfies $A[\\text{parent}(i)] \\ge A[i]$.
  - Under 1-based array indexing:
    $$\\text{parent}(i) = \\lfloor i/2 \\rfloor, \\quad \\text{left}(i) = 2i, \\quad \\text{right}(i) = 2i + 1$$
  - Inserting a new element places it at the first available position at the end of the heap (index $n+1$) and restores the max-heap property via **bubble-up (percolate up)** by repeatedly swapping with its parent while the child is greater than the parent.
- **Initial Heap State (5 elements)**:
  $$A = [10, 8, 5, 3, 2]$$
  - Index 1: $10$ (root)
  - Index 2: $8$ (left child of 10)
  - Index 3: $5$ (right child of 10)
  - Index 4: $3$ (left child of 8)
  - Index 5: $2$ (right child of 8)
- **Step 1: Insert Element 1**:
  - Place $1$ at index $6$: $A = [10, 8, 5, 3, 2, 1]$.
  - Parent of index 6 is index $\\lfloor 6/2 \\rfloor = 3$ (value $5$).
  - Since $1 \\le 5$, the heap property holds without swaps.
- **Step 2: Insert Element 7**:
  - Place $7$ at index $7$: $A = [10, 8, 5, 3, 2, 1, 7]$.
  - Parent of index 7 is index $\\lfloor 7/2 \\rfloor = 3$ (value $5$).
  - Since $7 > 5$, swap $A[7]$ and $A[3]$:
    $$A = [10, 8, 7, 3, 2, 1, 5]$$
  - Now, element $7$ is at index $3$. Its parent is index $\\lfloor 3/2 \\rfloor = 1$ (value $10$).
  - Since $7 \\le 10$, the heap property is satisfied and bubble-up terminates.
- **Final Level-Order Traversal**:
  $$10, 8, 7, 3, 2, 1, 5$$

Therefore, the correct answer is **Option D (10, 8, 7, 3, 2, 1, 5)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-08 (GATE CSE 2005 Part 2)
  // ==========================================

  "go:1372": {
    concept: "Data Structures - Complete k-ary Tree Leaf and Internal Node Formula",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a full/complete $k$-ary tree, every internal node has exactly $k$ children.
  - Let $n$ denote the number of internal nodes and $L$ denote the number of leaf nodes.
- **Analytical Derivation**:
  1. **Total Number of Nodes ($N$)**:
     $$N = n + L$$
  2. **Total Number of Edges ($E$)**:
     - In any tree with $N$ vertices, the total number of edges is:
       $$E = N - 1 = n + L - 1$$
  3. **Counting Edges from Internal Nodes**:
     - Each of the $n$ internal nodes has exactly $k$ outgoing edges to its children:
       $$E = n \\cdot k$$
  4. **Equating the Edge Expressions**:
     $$n + L - 1 = n \\cdot k$$
     $$L = n \\cdot k - n + 1 = n(k - 1) + 1$$
- **Verification with Small Examples**:
  - For a full binary tree ($k = 2$) with $n = 3$ internal nodes:
    $$L = 3(2 - 1) + 1 = 4 \\quad (\\text{Matches standard } L = n + 1)$$
  - For a ternary tree ($k = 3$) with $n = 2$ internal nodes:
    $$L = 2(3 - 1) + 1 = 5$$

Therefore, the correct answer is **Option C (n(k-1) + 1)**.`,
    images: []
  },

  "go:1373": {
    concept: "Algorithms - Divide-and-Conquer Recurrence & Master Theorem Asymptotics",
    markdown: `- **Concept / Theoretical Foundation**:
  - Consider the standard divide-and-conquer recurrence:
    $$T(n) = a T(n/b) + f(n)$$
  - Here, $a = 2, b = 2, f(n) = n$.
- **Master Theorem Evaluation**:
  1. Compute the critical exponent:
     $$n^{\\log_b a} = n^{\\log_2 2} = n^1 = n$$
  2. Compare $f(n)$ with $n^{\\log_b a}$:
     $$f(n) = n = \\Theta(n^{\\log_b a})$$
  3. This falls directly into **Case 2 of the Master Theorem**, which yields:
     $$T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)$$
- **Evaluation of Options**:
  - **Option A ($T(n) = O(n^2)$)**: True, since $n \\log n = O(n^2)$.
  - **Option B ($T(n) = \\Theta(n \\log n)$)**: True, exact tight asymptotic bound.
  - **Option C ($T(n) = \\Omega(n^2)$)**: **FALSE**, because $n \\log n$ grows strictly slower than $n^2$.
  - **Option D ($T(n) = O(n \\log n)$)**: True, since $\\Theta(n \\log n) \\implies O(n \\log n)$.

Therefore, the correct answer is **Option C (T(n) = \\Omega(n^2))**.`,
    images: []
  },

  "go:1374": {
    concept: "Algorithms - Dijkstra's Shortest Path Complexity with Binary Heap",
    markdown: `- **Concept / Theoretical Foundation**:
  - Dijkstra's single-source shortest path algorithm on an undirected graph $G = (V, E)$ with non-negative edge weights maintains a priority queue of vertices keyed by tentative distance.
- **Detailed Operation Breakdown with a Binary Min-Heap**:
  1. **Initialization & Building Heap**:
     - Inserting all $|V|$ vertices into the binary heap: $O(|V|)$.
  2. **Extract-Min Operations**:
     - Each vertex is extracted from the heap exactly once when its shortest path is finalized.
     - Each \`Extract-Min\` in a binary heap of size $\\le |V|$ takes $O(\\log |V|)$ time.
     - Total time for all $|V|$ vertices:
       $$|V| \\cdot O(\\log |V|) = O(|V| \\log |V|)$$
  3. **Decrease-Key Operations**:
     - Every edge $(u, v) \\in E$ is relaxed at most once (or twice in undirected graphs).
     - Each successful relaxation triggers a \`Decrease-Key\` operation in the binary heap, taking $O(\\log |V|)$ time.
     - Total time across all edges:
       $$|E| \\cdot O(\\log |V|) = O(|E| \\log |V|)$$
  4. **Total Time Complexity**:
     $$O(|V| \\log |V| + |E| \\log |V|) = O((|E| + |V|) \\log |V|)$$

Therefore, the correct answer is **Option D (O((|E| + |V|) \\log |V|))**.`,
    images: []
  },

  "go:784": {
    concept: "Algorithms - Multiway Merging of Sorted Lists via Min-Heap",
    markdown: `- **Concept / Theoretical Foundation**:
  - To merge $k$ sorted lists containing a total of $N$ elements into a single sorted list, the standard optimal approach uses a **min-heap of size $k$**.
- **Given Parameters**:
  - Number of sorted lists: $k = \\lceil \\log n \\rceil$.
  - Elements per list: $m = \\lfloor n / \\log n \\rfloor$.
  - Total number of elements across all lists:
    $$N = k \\cdot m = \\lceil \\log n \\rceil \\cdot \\lfloor n / \\log n \\rfloor \\approx n$$
- **Step-by-Step Complexity Derivation**:
  1. **Heap Initialization**:
     - Insert the first element of each of the $k$ lists into a min-heap.
     - Building a min-heap of size $k$ takes $O(k) = O(\\log n)$ time.
  2. **Merging $N$ Elements**:
     - In each step:
       - Extract the minimum element from the root of the heap: $O(\\log k)$.
       - Append it to the output list.
       - Insert the next element from the list whose element was just extracted: $O(\\log k)$.
     - Each of the $N \\approx n$ elements undergoes exactly one extraction and one insertion in the heap of size $k$.
  3. **Total Merge Time**:
     $$\\text{Total Time} = N \\times O(\\log k) = n \\times O(\\log(\\lceil \\log n \\rceil)) = O(n \\log \\log n)$$

Therefore, the correct answer is **Option A (O(n \\log \\log n))**.`,
    images: []
  },

  "go:1403": {
    concept: "Algorithms - Recursive Call Stack Auxiliary Space Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - The auxiliary space complexity of a recursive algorithm is determined by the maximum memory consumed on the **call stack** at any point during its execution.
- **Analysis of the Recursive Function \`foo\`**:
  \`\`\`c
  double foo(int n) {
      int i; double sum;
      if (n == 0) return 1.0;
      else {
          sum = 0.0;
          for (i = 0; i < n; i++) sum += foo(i);
          return sum;
      }
  }
  \`\`\`
- **Stack Depth Analysis**:
  1. Calling \`foo(n)\` initiates a loop for $i = 0$ to $n-1$.
  2. At the final iteration ($i = n - 1$), \`foo(n)\` calls \`foo(n - 1)\`.
  3. In turn, \`foo(n - 1)\` calls \`foo(n - 2)\`, cascading down until the base case \`foo(0)\` is pushed onto the stack.
  4. The longest chain of simultaneously active activation records on the call stack is:
     $$\\text{foo}(n) \\to \\text{foo}(n-1) \\to \\text{foo}(n-2) \\to \\dots \\to \\text{foo}(0)$$
  5. The maximum recursion depth is $n + 1 = O(n)$.
  6. Each stack frame stores a constant number of local variables (\`n, i, sum\`), so the maximum memory used by the call stack is $O(n)$.

Therefore, the correct answer is **Option B (O(n))**.`,
    images: []
  },

  "go:82146": {
    concept: "Algorithms - Memoized Dynamic Programming Space Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - In memoization (top-down dynamic programming), results of subproblems are cached in a lookup table so that each unique subproblem is computed only once.
- **Space Complexity Breakdown for Memoized \`foo\`**:
  1. **Memoization Table Storage**:
     - The subproblems are $foo(0), foo(1), \\dots, foo(n-1)$.
     - Storing the cached results for these $n$ values requires an array of size $n$, consuming $\\Theta(n)$ auxiliary space.
  2. **Call Stack Overhead**:
     - With memoization, when computing $foo(n)$, it calls $foo(n-1)$, which calls $foo(n-2)$, down to $foo(0)$.
     - The maximum call stack depth remains $n + 1 = O(n)$.
  3. **Total Auxiliary Space**:
     $$\\text{Space} = \\text{Table Space} + \\text{Stack Space} = O(n) + O(n) = O(n)$$

Therefore, the correct answer is **Option B (O(n))**.`,
    images: []
  },

  "go:1404": {
    concept: "Graph Theory - Cut Property of Minimum Spanning Trees",
    markdown: `- **Concept / Theoretical Foundation**:
  - **The Cut Property of MSTs**: For any cut $[X, Y]$ in a connected undirected graph $G = (V, E)$ (where $X$ and $Y = V \\setminus X$ partition $V$), if an edge $e = (u, v)$ with $u \\in X, v \\in Y$ has the **strictly minimum weight** among all edges crossing the cut, then this edge **must belong to every Minimum Spanning Tree (MST)** of $G$.
- **Analytical Derivation**:
  1. Given: $[X, Y]$ partitions $V$ such that source $s \\in X$ and destination $t \\in Y$.
  2. All edge weights are positive and distinct.
  3. Edge $e$ has the minimum weight among all edges with one endpoint in $X$ and one endpoint in $Y$ (the crossing edges of cut $[X, Y]$).
  4. By the foundational Cut Property (CLRS Theorem 23.1), the minimum-weight edge crossing any cut must belong to the unique MST of $G$.
- **Distractor Analysis**:
  - **Option B (the weighted shortest path from s to t)**: False. The shortest path between $s$ and $t$ does not necessarily take the minimum edge crossing the cut; it considers the cumulative sum of path weights.
  - **Option C (each path from s to t)**: False. Multiple alternate paths can cross the cut using different crossing edges.
  - **Option D (the weighted longest path)**: False.

Therefore, the correct answer is **Option A (the minimum weighted spanning tree of G)**.`,
    images: []
  },

  "go:82129": {
    concept: "Algorithms - Bottleneck / Minimax Shortest Path via MST",
    markdown: `- **Concept / Theoretical Foundation**:
  - In graph optimization, the **congestion** of a path is defined as the maximum weight among all edges along that path (the bottleneck edge capacity/cost).
  - A path between $s$ and $t$ that minimizes this maximum edge weight is called a **minimax path** (or bottleneck shortest path).
- **Analytical Derivation via MST**:
  1. Let $T$ be the unique Minimum Spanning Tree of $G$ (since edge weights are distinct).
  2. For any pair of vertices $s, t \\in V$, let $P_T(s, t)$ denote the unique simple path between $s$ and $t$ in the MST $T$.
  3. **Theorem (Minimax Property of MST)**:
     - The unique path $P_T(s, t)$ in the MST minimizes the maximum edge weight over *all possible paths* between $s$ and $t$ in the graph:
       $$\\max_{e \\in P_T(s, t)} w(e) = \\min_{P \\in \\mathcal{P}(s, t)} \\left( \\max_{e \\in P} w(e) \\right)$$
  4. **Proof Sketch**:
     - Suppose there existed an alternate path $P^*$ with a smaller maximum edge weight.
     - Along $P_T(s, t)$, let $e_{\\max}$ be the heaviest edge. Removing $e_{\\max}$ divides $T$ into two disconnected components $X$ and $Y$.
     - Path $P^*$ must cross the cut between $X$ and $Y$ via some edge $e'$.
     - Since $P^*$ has lower maximum weight, $w(e') < w(e_{\\max})$.
     - Adding $e'$ and removing $e_{\\max}$ would yield a spanning tree of strictly smaller total weight, contradicting the minimality of $T$.
  5. Thus, the path in the MST is always a path of minimum congestion.

Therefore, the correct answer is **Option A (a path from s to t in the minimum weighted spanning tree)**.`,
    images: []
  },

  "go:1406": {
    concept: "Algorithms - Greedy Job Sequencing with Deadlines Task Scheduling",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the unit-time **Job Sequencing with Deadlines** problem, we maximize total profit by sorting tasks in non-increasing order of profit and greedily scheduling each task into the latest available time slot $\\le d_i$.
- **Given Tasks and Parameters**:
  - Total tasks: 9 ($T_1$ to $T_9$), unit execution time = 1.
  - Sorting tasks in descending order of profit $P_i$:
    1. $T_3$: $P = 30$, $d = 5$
    2. $T_9$: $P = 25$, $d = 3$
    3. $T_7$: $P = 23$, $d = 2$
    4. $T_2$: $P = 20$, $d = 2$
    5. $T_4$: $P = 18$, $d = 3$
    6. $T_5$: $P = 18$, $d = 4$
    7. $T_8$: $P = 16$, $d = 7$
    8. $T_1$: $P = 15$, $d = 7$
    9. $T_6$: $P = 10$, $d = 5$
- **Greedy Slot Allocation (Available slots: 1, 2, 3, 4, 5, 6, 7)**:
  - $T_3$ ($d=5$): Schedule in **Slot 5**.
  - $T_9$ ($d=3$): Schedule in **Slot 3**.
  - $T_7$ ($d=2$): Schedule in **Slot 2**.
  - $T_2$ ($d=2$): Slot 2 occupied $\\to$ schedule in **Slot 1**.
  - $T_4$ ($d=3$): Slots 3, 2, 1 all occupied $\\to$ **$T_4$ is left out**.
  - $T_5$ ($d=4$): Schedule in **Slot 4**.
  - $T_8$ ($d=7$): Schedule in **Slot 7**.
  - $T_1$ ($d=7$): Slot 7 occupied $\\to$ schedule in **Slot 6**.
  - $T_6$ ($d=5$): Slots 5, 4, 3, 2, 1 all occupied $\\to$ **$T_6$ is left out**.
- **Conclusion**:
  - The tasks left unscheduled are **$T_4$ and $T_6$**.

Therefore, the correct answer is **Option D (T_4 and T_6 are left out)**.`,
    images: []
  },

  "go:82514": {
    concept: "Algorithms - Job Sequencing with Deadlines Maximum Profit Calculation",
    markdown: `- **Concept / Theoretical Foundation**:
  - Following the optimal greedy schedule derived for the 9 unit-time tasks with deadlines:
    - Scheduled Tasks: $T_2, T_7, T_9, T_5, T_3, T_1, T_8$
    - Omitted Tasks: $T_4$ and $T_6$
- **Total Maximum Profit Computation**:
  $$\\begin{aligned}
  \\text{Total Profit} &= P(T_2) + P(T_7) + P(T_9) + P(T_5) + P(T_3) + P(T_1) + P(T_8) \\\\
  &= 20 + 23 + 25 + 18 + 30 + 15 + 16 \\\\
  &= 147
  \\end{aligned}$$
- **Verification of Individual Sums**:
  - $20 + 23 = 43$
  - $43 + 25 = 68$
  - $68 + 18 = 86$
  - $86 + 30 = 116$
  - $116 + 15 = 131$
  - $131 + 16 = 147$

Therefore, the correct answer is **Option A (147)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-09 (GATE IT 2005 Part 1)
  // ==========================================

  "go:3757": {
    concept: "Data Structures - Binary Search Tree Root Value and Subtree Size",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Binary Search Tree (BST), the very first key inserted into an empty tree becomes the **root node** of the entire tree.
  - The BST property dictates that every key inserted into the right subtree of the root must be strictly greater than the root's key value.
- **Analytical Derivation**:
  1. The inserted keys are the set of contiguous integers:
     $$\\{1, 2, 3, \\dots, n\\}$$
  2. Let the root (first inserted key) be $r \\in \\{1, 2, \\dots, n\\}$.
  3. Every key greater than $r$ will be placed in the right subtree of $r$.
  4. The keys strictly greater than $r$ are:
     $$\\{r + 1, r + 2, \\dots, n\\}$$
  5. The total count of such keys is:
     $$\\text{Count} = n - (r + 1) + 1 = n - r$$
  6. We are given that the right subtree of the root contains exactly $p$ nodes:
     $$n - r = p \\implies r = n - p$$
  7. Therefore, the first number inserted must be $n - p$.

Therefore, the correct answer is **Option C (n - p)**.`,
    images: []
  },

  "go:3758": {
    concept: "Data Structures - Stack Recursive Function Evaluation",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given a function $f$ defined recursively on a stack of integers $S$:
    $$f(\\emptyset) = 0$$
    $$f(\\text{push}(S, i)) = \\max(f(S), 0) + i$$
- **Step-by-Step Evaluation**:
  - The stack elements from bottom to top are: $2, -3, 2, -1, 2$.
  - Building the stack from the empty stack $\\emptyset$:
    1. **Bottom element $i = 2$**:
       $$f(S_1) = \\max(f(\\emptyset), 0) + 2 = \\max(0, 0) + 2 = 2$$
    2. **Push $i = -3$**:
       $$f(S_2) = \\max(f(S_1), 0) + (-3) = \\max(2, 0) - 3 = 2 - 3 = -1$$
    3. **Push $i = 2$**:
       $$f(S_3) = \\max(f(S_2), 0) + 2 = \\max(-1, 0) + 2 = 0 + 2 = 2$$
    4. **Push $i = -1$**:
       $$f(S_4) = \\max(f(S_3), 0) + (-1) = \\max(2, 0) - 1 = 2 - 1 = 1$$
    5. **Top element $i = 2$**:
       $$f(S_5) = \\max(f(S_4), 0) + 2 = \\max(1, 0) + 2 = 1 + 2 = 3$$
- **Final Result**:
  $$f(S) = 3$$

Therefore, the correct answer is **Option C (3)**.`,
    images: []
  },

  "go:3759": {
    concept: "Graph Theory - DFS Forest Tree Edges & Connected Components",
    markdown: `- **Concept / Theoretical Foundation**:
  - A Depth-First Search (DFS) traversal on an undirected graph $G$ with $n$ vertices partitions the vertices into a collection of DFS trees, collectively forming a **DFS spanning forest**.
  - Each individual DFS tree corresponds to exactly one **connected component** of $G$.
- **Analytical Derivation**:
  1. Let $G$ have $c$ connected components: $C_1, C_2, \\dots, C_c$.
  2. Let component $C_i$ contain $n_i$ vertices.
  3. Since the components partition the vertex set $V$:
     $$\\sum_{i=1}^c n_i = n$$
  4. In component $C_i$, the DFS traversal builds a spanning tree on $n_i$ vertices, which contains exactly $n_i - 1$ tree edges.
  5. The total number of tree edges $k$ marked across the entire graph is:
     $$k = \\sum_{i=1}^c (n_i - 1) = \\sum_{i=1}^c n_i - \\sum_{i=1}^c 1 = n - c$$
  6. Rearranging to solve for the number of connected components $c$:
     $$c = n - k$$

Therefore, the correct answer is **Option D (n - k)**.`,
    images: []
  },

  "go:3760": {
    concept: "Algorithms - Graph Algorithms Time Complexity Matching",
    markdown: `- **Concept / Theoretical Foundation**:
  - Standard worst-case time complexities on a graph with $n$ vertices and $m$ edges:
- **Algorithm Analysis & Matching**:
  1. **Bellman-Ford Algorithm**: Computes single-source shortest paths in the presence of negative edge weights. Relaxes all $m$ edges for $n-1$ iterations:
     $$\\text{Time} = O(n \\cdot m) \\implies \\mathbf{1 \\to C}$$
  2. **Kruskal's Algorithm**: Computes MST by sorting edges and using Disjoint Set Union (DSU). Sorting takes $O(m \\log m) = O(m \\log n^2) = O(m \\log n)$:
     $$\\text{Time} = O(m \\log n) \\implies \\mathbf{2 \\to A}$$
  3. **Floyd-Warshall Algorithm**: Computes all-pairs shortest paths via dynamic programming across all triplets $(k, i, j)$:
     $$\\text{Time} = O(n^3) \\implies \\mathbf{3 \\to B}$$
  4. **Topological Sorting**: Computes linear ordering of a DAG using DFS or Kahn's in-degree queue:
     $$\\text{Time} = O(n + m) \\implies \\mathbf{4 \\to D}$$
- **Matching Result**:
  $$1 \\to C, \\quad 2 \\to A, \\quad 3 \\to B, \\quad 4 \\to D$$

Therefore, the correct answer is **Option A (1->C, 2->A, 3->B, 4->D)**.`,
    images: []
  },

  "go:3761": {
    concept: "Data Structures - Hash Table Insertion with Linear Probing",
    markdown: `- **Concept / Theoretical Foundation**:
  - A hash table with $M = 10$ buckets (indices $0$ to $9$) uses hash function:
    $$h(k) = k \\pmod{10}$$
  - **Linear Probing**: If collision occurs at index $h(k)$, probe subsequent buckets sequentially:
    $$h_i(k) = (h(k) + i) \\pmod{10} \\quad \\text{for } i = 0, 1, 2, \\dots$$
- **Step-by-Step Key Insertions**:
  1. **Insert 43**:
     - $h(43) = 43 \\% 10 = 3$. Bucket $3$ is empty $\\to$ store $43$ at **index 3**.
  2. **Insert 165**:
     - $h(165) = 165 \\% 10 = 5$. Bucket $5$ is empty $\\to$ store $165$ at **index 5**.
  3. **Insert 62**:
     - $h(62) = 62 \\% 10 = 2$. Bucket $2$ is empty $\\to$ store $62$ at **index 2**.
  4. **Insert 123**:
     - $h(123) = 123 \\% 10 = 3$. Collision at bucket 3!
     - Next probe: $(3 + 1) \\% 10 = 4$. Bucket $4$ is empty $\\to$ store $123$ at **index 4**.
  5. **Insert 142**:
     - $h(142) = 142 \\% 10 = 2$. Collision at bucket 2!
     - Probe 1: $(2 + 1) = 3$ (occupied by 43)
     - Probe 2: $(2 + 2) = 4$ (occupied by 123)
     - Probe 3: $(2 + 3) = 5$ (occupied by 165)
     - Probe 4: $(2 + 4) = 6$ is empty!
     - Store $142$ at **index 6**.

Therefore, the correct answer is **Option D (6)**.`,
    images: []
  },

  "go:3811": {
    concept: "Data Structures - Binary Tree Minimum Nodes with Subtree Size Difference Constraint",
    markdown: `- **Concept / Theoretical Foundation**:
  - We seek the minimum number of nodes $N(h)$ in a binary tree of height $h > 0$ such that for every node, the difference between the number of nodes in its left and right subtrees is at most $2$:
    $$|N_L - N_R| \\le 2$$
- **Analytical Derivation**:
  1. To minimize total nodes while attaining height $h$, one child subtree must have height $h - 1$ with minimum nodes $N(h-1)$, while the other child subtree must have the minimum possible number of nodes permitted by the constraint.
  2. Under the constraint $|N_L - N_R| \\le 2$, the smaller subtree has size:
     $$N_R = N_L - 2 = N(h-1) - 2$$
  3. The root contributes $1$ node, giving the recurrence:
     $$N(h) = 1 + N(h-1) + [N(h-1) - 2] = 2 N(h-1) - 1$$
  4. **Solving the Recurrence**:
     - For $h = 1$ (single edge, 2 nodes): $N(1) = 2 = 2^{0} + 1$.
     - For $h = 2$: $N(2) = 2(2) - 1 = 3 = 2^1 + 1$.
     - For $h = 3$: $N(3) = 2(3) - 1 = 5 = 2^2 + 1$.
     - In general, solving $N(h) - 1 = 2(N(h-1) - 1)$ gives:
       $$N(h) - 1 = 2^{h-1}(N(1) - 1) = 2^{h-1}(1) = 2^{h-1}$$
       $$N(h) = 2^{h-1} + 1$$

Therefore, the correct answer is **Option B (2^{h-1} + 1)**.`,
    images: []
  },

  "go:3812": {
    concept: "Algorithms - Master Theorem Analysis with Square Root Non-Polynomial Term",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the recurrence:
    $$T(n) = 2 T(n/2) + \\sqrt{n} \\quad \\text{for } n \\ge 2, \\quad T(1) = 1$$
- **Master Theorem Step-by-Step**:
  1. Identify parameters: $a = 2$, $b = 2$, and $f(n) = \\sqrt{n} = n^{0.5}$.
  2. Calculate the watershed function:
     $$n^{\\log_b a} = n^{\\log_2 2} = n^1 = n$$
  3. Compare $f(n)$ with $n^{\\log_b a}$:
     - Here, $f(n) = n^{0.5} = O(n^{1 - \\epsilon})$ for $\\epsilon = 0.5 > 0$.
     - This corresponds to **Case 1 of the Master Theorem**.
  4. Under Case 1, the work is dominated by the leaves:
     $$T(n) = \\Theta(n^{\\log_b a}) = \\Theta(n)$$
- **Conclusion**:
  - $T(n) = \\Theta(n)$ is TRUE.

Therefore, the correct answer is **Option C (T(n) = \\Theta(n))**.`,
    images: []
  },

  "go:3813": {
    concept: "Graph Theory - Minimum Spanning Tree and Maximum Weight Edges",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a weighted undirected graph $G$, let $e$ be an edge with maximum weight in $G$.
  - We are given that there exists a Minimum Spanning Tree (MST) in $G$ that contains edge $e$.
- **Analytical Justification**:
  1. **Cycle Property of MST**: The strictly heaviest edge in any cycle cannot belong to any MST.
  2. If an edge $e$ has the maximum weight across the *entire graph*, then in any cycle containing $e$, $e$ is either strictly heavier than other edges or tied with them.
  3. If all edges in $G$ have the exact same weight, then *every* spanning tree of $G$ is a minimum weight spanning tree, and any edge of maximum weight can freely belong to an MST.
  4. In particular, statement D (*"All edges in G have the same weight"*) represents the definitive structural condition ensuring that any choice of maximum edge is always valid in an MST.

Therefore, the correct answer is **Option D (All edges in G have the same weight)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-10 (GATE IT 2005 Part 2)
  // ==========================================

  "go:3814": {
    concept: "C Programming - Anagram Verification Frequency Array & Index Advancement",
    markdown: `- **Concept / Theoretical Foundation**:
  - Two strings $a$ and $b$ are anagrams if and only if they contain the exact same characters with identical frequencies.
  - A single frequency count array of size 128 (ASCII range) initialized to 0 tracks this:
    - Characters in string $a$ increment their count.
    - Characters in string $b$ decrement their count.
    - If all counts remain 0 after processing, the strings are anagrams.
- **Loop Body Analysis**:
  \`\`\`c
  j = 0;
  while (a[j] && b[j]) {
      A;
      B;
  }
  \`\`\`
  - Notice that index $j$ is **not** incremented in the \`while\` condition header.
  - Therefore, the index $j$ must be incremented inside the statements $A$ and $B$ to process successive characters and avoid an infinite loop.
  - Incrementing $j$ inside the post-increment expression \`j++\` in the loop statements advances the pointer index to the next character in the array.
  - Option C (\`A: count [a[j++]]++ and B: count[b[j]]--\`) correctly advances the traversal index across the string characters.

Therefore, the correct answer is **Option C (A: count [a[j++]]++ and B: count[b[j]]--)**.`,
    images: []
  },

  "go:3815": {
    concept: "Data Structures - Linked List Pairwise Node Swapping",
    markdown: `- **Concept / Theoretical Foundation**:
  - The function \`rearrange\` iterates through a singly-linked list using two pointers \`p\` and \`q\` separated by one node:
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
- **Step-by-Step Simulation on List $[1, 2, 3, 4, 5, 6, 7]$**:
  1. **Iteration 1**:
     - $p$ points to $1$, $q$ points to $2$.
     - Swap values: $(1, 2) \\to (2, 1)$.
     - Advance: $p = q\\text{->next}$ points to $3$; $q = p\\text{->next}$ points to $4$.
  2. **Iteration 2**:
     - $p$ points to $3$, $q$ points to $4$.
     - Swap values: $(3, 4) \\to (4, 3)$.
     - Advance: $p$ points to $5$; $q$ points to $6$.
  3. **Iteration 3**:
     - $p$ points to $5$, $q$ points to $6$.
     - Swap values: $(5, 6) \\to (6, 5)$.
     - Advance: $p$ points to $7$; $q = p ? p\\text{->next} : 0 = 0$ (NULL).
  4. **Loop Terminates**:
     - $q$ is NULL; the last node $7$ remains unchanged.
- **Final Contents of the List**:
  $$2, 1, 4, 3, 6, 5, 7$$

Therefore, the correct answer is **Option B (2, 1, 4, 3, 6, 5, 7)**.`,
    images: []
  },

  "go:3816": {
    concept: "Data Structures - Reconstructing BST from Pre-order & Deriving Post-order",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a Binary Search Tree (BST), the in-order traversal is always the keys sorted in strictly ascending order.
  - Given the pre-order traversal and keys $\\{1, 2, 3, 4, 5, 6, 7, 8\\}$, we uniquely reconstruct the tree.
- **Given Pre-order Traversal**:
  $$5, 3, 1, 2, 4, 6, 8, 7$$
- **Step-by-Step BST Reconstruction**:
  1. Root is the first pre-order element: **$5$**.
  2. **Left Subtree of 5** (keys $< 5$): Pre-order is $3, 1, 2, 4$.
     - Root of left subtree is **$3$**.
     - Keys $< 3$: $\\{1, 2\\}$. Pre-order $1, 2 \\implies$ node $1$ has right child $2$.
     - Keys $> 3$: $\\{4\\} \\implies$ right child of $3$ is $4$.
  3. **Right Subtree of 5** (keys $> 5$): Pre-order is $6, 8, 7$.
     - Root of right subtree is **$6$**.
     - Keys $< 6$: none.
     - Keys $> 6$: $\\{8, 7\\}$. Pre-order $8, 7 \\implies$ right child of $6$ is $8$, and left child of $8$ is $7$.
- **Post-order Traversal (Left, Right, Root)**:
  1. Subtree rooted at 1: Right child is 2 $\\to 2, 1$.
  2. Subtree rooted at 3: Left ($2, 1$), Right ($4$), Root ($3$) $\\to 2, 1, 4, 3$.
  3. Subtree rooted at 8: Left ($7$), Right (none), Root ($8$) $\\to 7, 8$.
  4. Subtree rooted at 6: Left (none), Right ($7, 8$), Root ($6$) $\\to 7, 8, 6$.
  5. Entire Tree rooted at 5: Left ($2, 1, 4, 3$), Right ($7, 8, 6$), Root ($5$) $\\to 2, 1, 4, 3, 7, 8, 6, 5$.

Therefore, the correct answer is **Option D (2, 1, 4, 3, 7, 8, 6, 5)**.`,
    images: []
  },

  "go:3818": {
    concept: "C Programming - Recursive Function Bit-Level Scaling Trace",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the recursive function:
    \`\`\`c
    int f(int n, int k) {
        if (n == 0) return 0;
        else if (n % 2) return f(n/2, 2*k) + k;
        else return f(n/2, 2*k) - k;
    }
    \`\`\`
- **Detailed Execution Call Stack for \`f(20, 1)\`**:
  1. $n = 20$ (even): returns $f(10, 2) - 1$.
  2. $n = 10$ (even): returns $f(5, 4) - 2$.
  3. $n = 5$ (odd): returns $f(2, 8) + 4$.
  4. $n = 2$ (even): returns $f(1, 16) - 8$.
  5. $n = 1$ (odd): returns $f(0, 32) + 16$.
  6. $n = 0$: base case returns $0$.
- **Call Stack Unwinding & Evaluation**:
  - $f(1, 16) = 0 + 16 = 16$
  - $f(2, 8) = f(1, 16) - 8 = 16 - 8 = 8$
  - $f(5, 4) = f(2, 8) + 4 = 8 + 4 = 12$
  - $f(10, 2) = f(5, 4) - 2 = 12 - 2 = 10$
  - $f(20, 1) = f(10, 2) - 1 = 10 - 1 = 9$
- **Output**:
  The function returns **9**.

Therefore, the correct answer is **Option C (9)**.`,
    images: []
  },

  "go:3819": {
    concept: "Algorithms - Two-Pointer Technique for Target Difference in Sorted Array",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given a sorted array $a[0 \\dots n-1]$ in increasing order and target difference $S > 0$, the two-pointer technique uses two indices $i$ and $j$ with $i < j$.
  - At each step, we examine the difference $\\Delta = a[j] - a[i]$.
- **Analysis of the Loop Logic**:
  \`\`\`c
  i = 0; j = 1;
  while (j < n) {
      if (E) j++;
      else if (a[j] - a[i] == S) break;
      else i++;
  }
  \`\`\`
  1. If the current difference is **smaller than $S$** ($a[j] - a[i] < S$):
     - Because the array is sorted in increasing order, increasing $j$ increases $a[j]$, thereby enlarging the difference.
     - Therefore, when $a[j] - a[i] < S$, we must execute \`j++\`.
  2. If the current difference **equals $S$**:
     - The target pair is found; break the loop.
  3. If the current difference is **larger than $S$** ($a[j] - a[i] > S$):
     - Increasing $i$ increases $a[i]$, which reduces the difference back towards $S$.
  4. Hence, expression $E$ must be:
     $$a[j] - a[i] < S$$

Therefore, the correct answer is **Option B (a[j] - a[i] < S)**.`,
    images: []
  },

  "go:3820": {
    concept: "Algorithms - Merged Sorted Arrays Order Statistics & Invariants",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $a$ and $b$ be two sorted arrays of length $n$ in non-decreasing order, indexed from $0$.
  - Array $c$ of length $2n$ is obtained by merging $a$ and $b$ into non-decreasing order.
  - We analyze the order invariants assuming $a[i] \\ge b[i]$.
- **Analytical Proof of Invariants**:
  1. **Statement III: $c[2i] \\le a[i]$**:
     - In array $a$, the $i + 1$ elements $a[0], a[1], \\dots, a[i]$ are all $\\le a[i]$.
     - In array $b$, because $b[i] \\le a[i]$ and $b$ is non-decreasing, the $i + 1$ elements $b[0], b[1], \\dots, b[i]$ are all $\\le b[i] \\le a[i]$.
     - Together in the combined set, there are at least $(i + 1) + (i + 1) = 2i + 2$ elements that are $\\le a[i]$.
     - In the merged sorted array $c$, these $\\ge 2i + 2$ elements must occupy positions starting from index $0$ through at least index $2i + 1$.
     - In particular, index $2i$ is among these positions, so $c[2i] \\le a[i]$.
     - Hence, Statement III is **TRUE**.
  2. **Statement II: $c[2i] \\ge b[i]$**:
     - How many elements in $a$ and $b$ can be strictly smaller than $b[i]$?
     - In $b$, at most $i$ elements ($b[0], \\dots, b[i-1]$) can be $< b[i]$.
     - In $a$, since $a[i] \\ge b[i]$, at most $i$ elements ($a[0], \\dots, a[i-1]$) can be $< b[i]$.
     - Thus, at most $i + i = 2i$ elements in total across both arrays can be strictly less than $b[i]$.
     - Therefore, in the 0-indexed merged array $c$, at most $2i$ elements precede the first occurrence of values $\\ge b[i]$.
     - This guarantees that at index $2i$, the value cannot be strictly less than $b[i]$:
       $$c[2i] \\ge b[i]$$
     - Hence, Statement II is **TRUE**.
- **Conclusion**:
  - Only statements II and III are true.

Therefore, the correct answer is **Option C (only II and III)**.`,
    images: []
  },

  "go:3856": {
    concept: "Algorithms - Universal Sink Finding Elimination Phase Expressions",
    markdown: `- **Concept / Theoretical Foundation**:
  - In a directed graph with $n$ vertices represented by adjacency matrix $A[0 \\dots n-1][0 \\dots n-1]$, a **sink** $i$ satisfies:
    1. In-degree of $i$ is $n - 1$: $A[j][i] = 1$ for all $j \\ne i$.
    2. Out-degree of $i$ is $0$: $A[i][j] = 0$ for all $j \\ne i$.
- **Analysis of the Elimination Phase**:
  \`\`\`c
  i = 0;
  do {
      j = i + 1;
      while ((j < n) && E1) j++;
      if (j < n) E2;
  } while (j < n);
  \`\`\`
  1. **Role of $E_1$**:
     - While vertex $i$ could still be a sink, it must have no edges to other vertices: $A[i][j] == 0$.
     - As long as $A[i][j] == 0$ (i.e. \`!A[i][j]\`), $i$ remains a potential candidate sink, and we increment $j$ to check the next vertex.
     - Therefore, $E_1$ is **\`!A[i][j]\`**.
  2. **Role of $E_2$**:
     - If the while loop exits with $j < n$, it means $A[i][j] == 1$.
     - Vertex $i$ has an outgoing edge to $j$, so $i$ **cannot** be a sink.
     - However, $j$ could still potentially be a sink. We eliminate $i$ and promote $j$ as the new candidate sink by setting $i = j$.
     - Therefore, $E_2$ is **\`i = j\`**.
- **Combined Expressions**:
  $$E_1: \\ !A[i][j] \\quad \\text{and} \\quad E_2: \\ i = j$$

Therefore, the correct answer is **Option C (E_1: !A[i][j] and E_2: i = j)**.`,
    images: []
  },

  "go:3857": {
    concept: "Algorithms - Universal Sink Verification Phase Condition",
    markdown: `- **Concept / Theoretical Foundation**:
  - After candidate vertex $i$ is identified in the elimination phase, the verification phase confirms whether $i$ truly meets all sink criteria.
- **Analysis of the Verification Condition**:
  \`\`\`c
  flag = 1;
  for (j = 0; j < n; j++)
      if ((j != i) && E3) flag = 0;
  \`\`\`
  1. For vertex $i$ to be a valid sink, every other vertex $j \\ne i$ must satisfy:
     - No edge from $i$ to $j$: $A[i][j] == 0$.
     - An edge from $j$ to $i$: $A[j][i] == 1$.
  2. The candidate fails (flag set to 0) if **either** of these conditions is violated:
     - Violation 1: $A[i][j] == 1$ (there is an edge from $i$ to $j$).
     - Violation 2: $A[j][i] == 0$ (there is no edge from $j$ to $i$, i.e. \`!A[j][i]\`).
  3. Combining these failure conditions with logical OR:
     $$E_3: (A[i][j] \\ || \\ !A[j][i])$$

Therefore, the correct answer is **Option D ((A[i][j] || !A[j][i]))**.`,
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
  for (const [uid, sol] of Object.entries(CHUNK_CSE_DSA_07_TO_10_SOLUTIONS)) {
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

if (process.argv[1] && process.argv[1].endsWith("apply-chunk-cse-dsa-07-to-10.mjs")) {
  applyChunkSolutions();
}
