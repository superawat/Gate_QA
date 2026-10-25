import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_DSA_03_TO_06_SOLUTIONS = {
  // ==========================================
  // CHUNK-CSE-DSA-03 (GATE CSE 2004 Part 1)
  // ==========================================

  "go:998": {
    concept: "Software Engineering & C - Structured Programming Principles",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Structured Programming** (pioneered by Edsger W. Dijkstra, C.A.R. Hoare, and Niklaus Wirth) is a programming paradigm aimed at improving software clarity, quality, and maintainability.
  - The core premise is that program execution should follow a clean hierarchical flow governed exclusively by structured control constructs (sequence, selection [\`if/else\`, \`switch\`], and iteration [\`while\`, \`for\`]), each with a single entry and single exit point.
- **Analytical Justification**:
  - The foundational motivation for structured programming (as articulated in Dijkstra's seminal 1968 paper *\"Go To Statement Considered Harmful\"*) is to eliminate arbitrary jumps so that **the dynamic flow of control during execution can be directly and easily inferred from the static program text**.
  - When control flow mirrors the textual syntax, reasoning about program correctness, proofs, and invariants becomes tractable.
- **Distractor Analysis**:
  - **Option A (have well indented programs)**: While indentation enhances human readability, it is merely a stylistic/formatting convention, not the theoretical goal of structured programming.
  - **Option B (be able to infer the flow of control from the compiled code)**: Structured programming is designed for humans reading and writing high-level source code, not for reverse-engineering machine code / assembly.
  - **Option C (be able to infer the flow of control from the program text)**: Correct. The primary objective is to make the program's runtime behavior inferable directly from its static text.
  - **Option D (avoid the use of GOTO statements)**: Avoiding \`goto\` is the *mechanism* used to achieve structured control flow, not the ultimate goal itself.

Therefore, the correct answer is **Option C (be able to infer the flow of control from the program text)**.`,
    images: []
  },

  "go:1000": {
    concept: "Data Structures - Space-Efficient Double Stack Implementation in a Single Array",
    markdown: `- **Concept / Theoretical Foundation**:
  - Two stacks can share a single contiguous array $A[1 \\dots \\text{MAXSIZE}]$ by growing toward each other from opposite ends of the array.
  - **Stack 1**: Starts at index $1$ and grows rightward (incrementing its top pointer $top1$: $1, 2, \\dots$).
  - **Stack 2**: Starts at index $\\text{MAXSIZE}$ and grows leftward (decrementing its top pointer $top2$: $\\text{MAXSIZE}, \\text{MAXSIZE}-1, \\dots$).
- **Space-Efficient Full Condition Derivation**:
  1. Under the standard initialization:
     $$top1 = 0 \\quad \\text{and} \\quad top2 = \\text{MAXSIZE} + 1$$
  2. Pushing onto Stack 1 advances $top1$ by $+1$: $top1 \\leftarrow top1 + 1$.
  3. Pushing onto Stack 2 advances $top2$ by $-1$: $top2 \\leftarrow top2 - 1$.
  4. At all times before overflow, we maintain the invariant $top1 < top2$.
  5. The entire array space is utilized with 100% efficiency: neither stack overflows prematurely as long as the total number of elements in both stacks does not exceed $\\text{MAXSIZE}$.
  6. The array becomes completely full when the two top pointers become adjacent, meaning there is no free slot left between them:
     $$top1 + 1 = top2 \\iff top1 = top2 - 1$$
- **Distractor Analysis**:
  - **Option A ($(top1 = \\text{MAXSIZE}/2) \\text{ and } (top2 = \\text{MAXSIZE}/2 + 1)$)**: Imposes rigid static partitioning at the exact midpoint, preventing one stack from using more than half the space even when the other is empty.
  - **Option B ($top1 + top2 = \\text{MAXSIZE}$)**: Arithmetically incorrect; for instance, if $\\text{MAXSIZE} = 10$, and $top1 = 0, top2 = 10$, $top1 + top2 = 10 = \\text{MAXSIZE}$, but the array has 9 empty slots!
  - **Option C**: Also relies on static midpoint partitioning.
  - **Option D ($top1 = top2 - 1$)**: Correctly captures the collision of the two tops.

Therefore, the correct answer is **Option D ($top1 = top2 - 1$)**.`,
    images: []
  },

  "go:1001": {
    concept: "Data Structures - Binary Search Tree Insertion and Height Computation",
    markdown: `- **Concept / Theoretical Foundation**:
  - A Binary Search Tree (BST) inserts each new key by comparing it with nodes starting at the root: navigating left if smaller, and right if larger, placing the key at the first vacant child position.
  - The **height of a tree** is defined in this problem as the maximum distance (number of edges) from the root node to any leaf node.
- **Given Insertion Sequence**:
  $$\\{10, 1, 3, 5, 15, 12, 16\\}$$
- **Step-by-Step BST Construction**:
  1. **Insert 10**: The tree is empty, so $10$ becomes the **Root** (depth $0$).
  2. **Insert 1**: $1 < 10 \\implies$ left child of $10$ (depth $1$).
  3. **Insert 3**: $3 < 10 \\implies$ left to $1$; $3 > 1 \\implies$ right child of $1$ (depth $2$).
  4. **Insert 5**: $5 < 10 \\to$ left to $1$; $5 > 1 \\to$ right to $3$; $5 > 3 \\implies$ right child of $3$ (depth $3$).
  5. **Insert 15**: $15 > 10 \\implies$ right child of $10$ (depth $1$).
  6. **Insert 12**: $12 > 10 \\to$ right to $15$; $12 < 15 \\implies$ left child of $15$ (depth $2$).
  7. **Insert 16**: $16 > 10 \\to$ right to $15$; $16 > 15 \\implies$ right child of $15$ (depth $2$).
- **Leaf Node Depths (Distance from Root)**:
  - Leaf node $5$: Path $10 \\to 1 \\to 3 \\to 5$ has length **$3$ edges**.
  - Leaf node $12$: Path $10 \\to 15 \\to 12$ has length **$2$ edges**.
  - Leaf node $16$: Path $10 \\to 15 \\to 16$ has length **$2$ edges**.
- **Conclusion**:
  - The maximum distance from the root to a leaf node is $\\max(3, 2, 2) = 3$.

Therefore, the correct answer is **Option B ($3$)**.`,
    images: []
  },

  "go:1002": {
    concept: "Data Structures - Applications of Stacks (Balanced Parentheses Parsing)",
    markdown: `- **Concept / Theoretical Foundation**:
  - Checking for balanced parentheses in an expression requires matching each closing delimiter with the most recently encountered, unmatched opening delimiter of the same type.
  - This strict Last-In, First-Out (LIFO) nesting property is the defining characteristic of a **Stack**.
- **Algorithm Mechanism**:
  1. Initialize an empty stack.
  2. Scan the arithmetic expression from left to right:
     - Whenever an opening parenthesis (\`(\`, \`[\`, \`{\`) is encountered, **push** it onto the stack.
     - Whenever a closing parenthesis (\`)\`, \`]\`, \`}\`) is encountered:
       - If the stack is empty, there is an unmatched closing parenthesis $\\implies$ **unbalanced**.
       - Otherwise, **pop** the top element from the stack. If it does not match the type of the closing parenthesis, the expression is **unbalanced**.
  3. At the end of the scan, if the stack is completely empty, all parentheses are properly balanced; otherwise, there are unclosed opening parentheses.
  4. Time complexity: $O(n)$ with $O(n)$ space.
- **Distractor Analysis**:
  - **Option A (queue)**: Operates in FIFO order; it cannot match the most recent opening delimiter.
  - **Option B (stack)**: Correct data structure.
  - **Option C (tree)** & **Option D (list)**: A general tree or linked list does not provide the inherent LIFO abstraction needed for parenthesis matching without extra pointer manipulation.

Therefore, the correct answer is **Option B (stack)**.`,
    images: []
  },

  "go:1003": {
    concept: "Data Structures - Tree Traversals & Breadth-First Search Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Level Order Traversal** of a rooted tree visits nodes level-by-level from top to bottom (level 0, level 1, level 2, ...), and from left to right within each level.
  - **Breadth-First Search (BFS)** is a graph/tree traversal algorithm that visits all vertices at distance $k$ from the root before proceeding to vertices at distance $k+1$.
- **Equivalence Analysis**:
  - When BFS is initiated at the root of a tree, it discovers nodes in non-decreasing order of their depth (level):
    1. Enqueue the root node into a FIFO queue.
    2. While the queue is non-empty, dequeue the front node, process it, and enqueue all of its children in left-to-right order.
  - The sequence of processed nodes produced by BFS on a rooted tree is **identical** to its level order traversal.
- **Distractor Analysis**:
  - **Option A (preorder)** & **Option B (inorder)**: Depth-first traversals that explore down to leaves before visiting siblings at the same level.
  - **Option C (depth first search)**: Traverses along paths to maximal depth using a stack or recursion, not level-by-level.
  - **Option D (breadth first search)**: Correct. BFS on a tree produces the level-order traversal.

Therefore, the correct answer is **Option D (breadth first search)**.`,
    images: []
  },

  "go:1004": {
    concept: "Data Structures - Hash Functions and Collision Analysis",
    markdown: `- **Concept / Theoretical Foundation**:
  - A hash function $h(k) = k \\bmod 10$ maps an integer key $k$ to the value of its least significant decimal digit (the units digit).
  - Two distinct keys $k_1$ and $k_2$ collide if and only if $k_1 \\equiv k_2 \\pmod{10}$.
- **Given Key Set & Hash Computations**:
  - $4322 \\bmod 10 = 2$
  - $1334 \\bmod 10 = 4$
  - $1471 \\bmod 10 = 1$
  - $9679 \\bmod 10 = 9$
  - $1989 \\bmod 10 = 9$
  - $6171 \\bmod 10 = 1$
  - $6173 \\bmod 10 = 3$
  - $4199 \\bmod 10 = 9$
- **Evaluation of Roman Statements**:
  - **Statement I (\"$9679, 1989, 4199$ hash to the same value\")**:
    - $9679 \\bmod 10 = 9$, $1989 \\bmod 10 = 9$, $4199 \\bmod 10 = 9$.
    - All three evaluate to $9$. **True**.
  - **Statement II (\"$1471, 6171$ hash to the same value\")**:
    - $1471 \\bmod 10 = 1$ and $6171 \\bmod 10 = 1$.
    - Both evaluate to $1$. **True**.
  - **Statement III (\"All elements hash to the same value\")**:
    - False, multiple distinct hash values ($1, 2, 3, 4, 9$) are produced.
  - **Statement IV (\"Each element hashes to a different value\")**:
    - False, collisions exist (e.g., $1471$ and $6171$ collide).
- **Conclusion**:
  - Statements I and II only are true.

Therefore, the correct answer is **Option C (I and II only)**.`,
    images: []
  },

  "go:1026": {
    concept: "Algorithms - Lower Bounds for Comparison-Based Sorting (Decision Tree Model)",
    markdown: `- **Concept / Theoretical Foundation**:
  - In the **comparison-based sorting model**, an algorithm can gain information about the relative order of elements only through pairwise comparisons ($a_i \\le a_j$).
  - Any comparison-based sorting algorithm can be modeled as a binary **decision tree**:
    - Each internal node represents a comparison between two elements.
    - Each leaf node represents a distinct permutation (ordering) of the input.
- **Analytical Derivation**:
  1. For an input array of $n$ distinct elements, there are $n!$ possible permutations.
  2. To correctly sort any input, the decision tree must contain at least one leaf for each possible permutation:
     $$L \\ge n!$$
  3. In a binary tree of height $h$, the maximum number of leaves is $2^h$:
     $$2^h \\ge L \\ge n! \\implies h \\ge \\log_2(n!)$$
  4. The height $h$ represents the maximum number of comparisons performed on the worst-case path from root to leaf.
  5. By **Stirling's Approximation** for factorials:
     $$n! \\approx \\sqrt{2\\pi n} \\left(\\frac{n}{e}\\right)^n$$
     $$\\log_2(n!) = \\sum_{i=1}^{n} \\log_2(i) \\ge \\sum_{i=n/2}^{n} \\log_2(i) \\ge \\frac{n}{2} \\log_2\\left(\\frac{n}{2}\\right) = \\Omega(n \\log n)$$
  6. Hence, $h \\ge \\Omega(n \\log n)$.
  7. Since algorithms like Merge Sort and Heap Sort achieve $O(n \\log n)$ comparisons in the worst case, the tightest lower bound is $\\Theta(n \\log n)$, of the order of $n \\log n$.

Therefore, the correct answer is **Option C ($n \\log n$)**.`,
    images: []
  },

  "go:1028": {
    concept: "C Programming - Static Variables and Recursive Function Tracing",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, a variable declared with the \`static\` storage class within a function is initialized **only once** (before program execution begins) and **preserves its value across successive function calls**.
  - It does not get reallocated or reinitialized on recursive entries.
- **Given Function**:
  \`\`\`c
  int f(int n) {
      static int i = 1;
      if (n >= 5) return n;
      n = n + i;
      i++;
      return f(n);
  }
  \`\`\`
- **Step-by-Step Execution Trace for $f(1)$**:
  1. **Call 1: $f(1)$**:
     - Initial value of static variable: $i = 1$.
     - Argument: $n = 1$.
     - Base condition check: $1 \\ge 5$ is **false**.
     - $n = n + i = 1 + 1 = 2$.
     - Increment static variable: $i = 2$.
     - Recursive call: \`return f(2);\`.
  2. **Call 2: $f(2)$**:
     - Current static variable value: $i = 2$.
     - Argument: $n = 2$.
     - Base condition check: $2 \\ge 5$ is **false**.
     - $n = n + i = 2 + 2 = 4$.
     - Increment static variable: $i = 3$.
     - Recursive call: \`return f(4);\`.
  3. **Call 3: $f(4)$**:
     - Current static variable value: $i = 3$.
     - Argument: $n = 4$.
     - Base condition check: $4 \\ge 5$ is **false**.
     - $n = n + i = 4 + 3 = 7$.
     - Increment static variable: $i = 4$.
     - Recursive call: \`return f(7);\`.
  4. **Call 4: $f(7)$**:
     - Current static variable value: $i = 4$.
     - Argument: $n = 7$.
     - Base condition check: $7 \\ge 5$ is **true**!
     - Returns $n = 7$.
  5. The value $7$ propagates back through the recursion call stack and is returned by $f(1)$.

Therefore, the correct answer is **Option C ($7$)**.`,
    images: []
  },

  "go:1029": {
    concept: "Algorithms & Verification - Loop Invariants in Integer Digit Reversal",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **loop invariant** is a formal predicate that is true before the loop begins, remains true after every iteration, and upon loop termination helps prove the post-condition.
  - Here, the algorithm reverses the decimal digits of an $m$-digit integer $n = d_1 d_2 \\dots d_m$.
- **Given Program Segment**:
  \`\`\`c
  int n, rev;
  rev = 0;
  while (n > 0) {
      rev = rev * 10 + n % 10;
      n = n / 10;
  }
  \`\`\`
- **Analytical Step-by-Step Derivation**:
  1. Let the original number be $N_0 = d_1 d_2 \\dots d_m$.
  2. In each iteration of the loop:
     - \`n % 10\` extracts the current least significant digit of $n$.
     - \`rev = rev * 10 + n % 10\` shifts the accumulated digits of \`rev\` left by one decimal place and appends the extracted digit.
     - \`n = n / 10\` performs integer division, discarding the least significant digit of $n$.
  3. **Trace across iterations**:
     - **Iteration 1**:
       - Extracted digit: $d_m$.
       - Value of \`rev\`: $d_m$.
       - Remaining value of \`n\`: $d_1 d_2 \\dots d_{m-1}$.
     - **Iteration 2**:
       - Extracted digit: $d_{m-1}$.
       - Value of \`rev\`: $d_m d_{m-1}$.
       - Remaining value of \`n\`: $d_1 d_2 \\dots d_{m-2}$.
     - **Iteration $i$**:
       - Exactly $i$ digits have been peeled off from the right of $n$ and accumulated into \`rev\` in reverse order.
       - Value of \`n\`: contains the remaining $(m - i)$ prefix digits:
         $$n = d_1 d_2 \\dots d_{m-i}$$
       - Value of \`rev\`: contains the $i$ suffix digits reversed:
         $$\\text{rev} = d_m d_{m-1} \\dots d_{m-i+1}$$
  4. Both conditions must hold simultaneously (**and** conjunction).

Therefore, the correct answer is **Option A ($n=d_1\\, d_2 \\,\\ldots\\, d_{m-i} \\qquad \\mathbf{and} \\qquad \\text{rev} = d_m\\,d_{m-1} \\,\\ldots\\, d_{m-i+1}$)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-04 (GATE CSE 2004 Part 2)
  // ==========================================

  "go:1030": {
    concept: "C Programming - String Termination & Null Character Truncation",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, strings are null-terminated character arrays (\`'\\0'\`, ASCII value 0).
  - The standard library function \`printf(\"%s\", p)\` starts reading at address \`p\` and prints characters sequentially until it encounters the first null terminator \`'\\0'\`. If the very first character \`p[0]\` is \`'\\0'\`, printing halts immediately.
- **Given Program Trace**:
  \`\`\`c
  char p[20]; int i;
  char *s = "string";
  int length = strlen(s);
  for (i = 0; i < length; i++)
      p[i] = s[length - i];
  printf("%s", p);
  \`\`\`
  1. The string literal \`\"string\"\` has length:
     $$\\text{length} = \\operatorname{strlen}(s) = 6$$
  2. The character array $s$ occupies indices $0$ to $6$:
     $$s[0]='s', \\; s[1]='t', \\; s[2]='r', \\; s[3]='i', \\; s[4]='n', \\; s[5]='g', \\; s[6]='\\0'$$
  3. Now examine the first iteration of the loop ($i = 0$):
     $$p[0] = s[\\text{length} - 0] = s[6] = '\\0'$$
  4. The first character of array \`p\` is assigned the null character \`'\\0'\`!
  5. Subsequent iterations assign:
     - $i=1 \\implies p[1] = s[5] = 'g'$
     - $i=2 \\implies p[2] = s[4] = 'n'$
     - etc.
  6. When \`printf(\"%s\", p)\` is called, it inspects \`p[0]\`.
  7. Since \`p[0] == '\\0'\`, \`printf\` detects string termination at index 0 and outputs 0 visible characters.
- **Conclusion**:
  - No visible output is printed to stdout.

Therefore, the correct answer is **Option D (no output is printed)**.`,
    images: []
  },

  "go:1032": {
    concept: "Data Structures - Unique Binary Tree Reconstruction from Traversal Pairs",
    markdown: `- **Concept / Theoretical Foundation**:
  - To reconstruct a unique binary tree from two traversal sequences:
    - One traversal must identify the root node (e.g., **Preorder** has the root first; **Postorder** has the root last).
    - Crucially, the **Inorder** traversal is strictly required to partition the remaining nodes into the left subtree (nodes appearing before the root in inorder) and the right subtree (nodes appearing after the root in inorder).
- **Analysis of Traversal Pairs**:
  - **Pair I (Preorder and Postorder)**:
    - Can uniquely reconstruct a *strictly full* binary tree (where every node has 0 or 2 children), but **cannot** uniquely reconstruct an arbitrary binary tree with single-child nodes (a single child cannot be uniquely identified as left or right).
  - **Pair II (Inorder and Postorder)**:
    - Postorder gives the root as its last element.
    - Searching for this root in the Inorder traversal splits the tree uniquely into left and right subtrees.
    - Recursively applying this yields a **unique binary tree**.
  - **Pair III (Preorder and Inorder)**:
    - Preorder gives the root as its first element.
    - Inorder partitions the elements into left and right subtrees.
    - Recursively yields a **unique binary tree**.
  - **Pair IV (Level order and Postorder)**:
    - Does not uniquely partition left and right subtrees without inorder.
- **Conclusion**:
  - Pairs II and III uniquely identify a binary tree.

Therefore, the correct answer is **Option B (II, III)**.`,
    images: []
  },

  "go:1033": {
    concept: "Data Structures - Queue Representation using Circularly Linked List with Single Pointer",
    markdown: `- **Concept / Theoretical Foundation**:
  - A Queue requires two primary operations:
    1. **$\\text{enQueue}$**: Insert an element at the rear of the queue.
    2. **$\\text{deQueue}$**: Remove an element from the front of the queue.
  - In a circularly linked list representing a queue of nodes:
    - The **rear node**'s \`next\` pointer naturally points to the **front node** of the queue!
- **Evaluation of Pointer Choices**:
  - **If pointer $p$ points to the REAR node**:
    - **Front node access**: $\\text{front} = p\\to\\text{next}$. Available in **$O(1)$ constant time**.
    - **$\\text{enQueue}$ Operation**:
      - Create new node \`newNode\`.
      - \`newNode->next = p->next\` (new node points to front).
      - \`p->next = newNode\` (old rear points to new node).
      - \`p = newNode\` (update rear pointer to new node).
      - Time complexity: **$O(1)$**.
    - **$\\text{deQueue}$ Operation**:
      - The node to remove is $\\text{front} = p\\to\\text{next}$.
      - Update link: \`p->next = p->next->next\`.
      - Free deleted node.
      - Time complexity: **$O(1)$**.
    - Both operations run in strictly $O(1)$ time with only a single pointer!
  - **If pointer $p$ points to the FRONT node**:
    - Reaching the rear node to append an element requires traversing all $n$ nodes, taking **$O(n)$ linear time**.
- **Conclusion**:
  - Pointer $p$ must point to the **rear node**.

Therefore, the correct answer is **Option A (rear node)**.`,
    images: ["/Gate_QA/question-images/543162888522397383.webp"]
  },

  "go:1034": {
    concept: "Data Structures - Max-Heap Sequential Insertion and Bubble-Up (Heapify)",
    markdown: `- **Concept / Theoretical Foundation**:
  - A **Max-Heap** is a complete binary tree where the key at every parent node is greater than or equal to the keys of its children.
  - Insertion into a binary heap:
    1. Place the new element at the next available leaf position (maintaining complete tree shape).
    2. \"Bubble-up\" (sift-up) by repeatedly swapping with its parent while the new element is greater than its parent.
- **Given Insertion Sequence**:
  $$\\{32, 15, 20, 30, 12, 25, 16\\}$$
- **Step-by-Step Array & Tree Trace**:
  1. **Insert 32**: Array = $[32]$. Root = $32$.
  2. **Insert 15**: Array = $[32, 15]$. Left child of $32$. ($15 \\le 32$, no swap).
  3. **Insert 20**: Array = $[32, 15, 20]$. Right child of $32$. ($20 \\le 32$, no swap).
  4. **Insert 30**: Left child of $15$ (index 3).
     - Compare with parent $15$: $30 > 15 \\implies$ swap with $15$.
     - Compare with new parent $32$: $30 \\le 32$, stop.
     - Array = $[32, 30, 20, 15]$.
  5. **Insert 12**: Right child of $30$ (index 4).
     - Compare with parent $30$: $12 \\le 30$, stop.
     - Array = $[32, 30, 20, 15, 12]$.
  6. **Insert 25**: Left child of $20$ (index 5).
     - Compare with parent $20$: $25 > 20 \\implies$ swap with $20$.
     - Compare with new parent $32$: $25 \\le 32$, stop.
     - Array = $[32, 30, 25, 15, 12, 20]$.
  7. **Insert 16**: Right child of $25$ (index 6).
     - Compare with parent $25$: $16 \\le 25$, stop.
     - Array = $[32, 30, 25, 15, 12, 20, 16]$.
- **Final Resultant Heap Structure**:
  - Root: $32$
  - Left subtree of $32$:
    - Node $30$ (left child: $15$, right child: $12$)
  - Right subtree of $32$:
    - Node $25$ (left child: $20$, right child: $16$)
  - This matches the tree depicted in **Option A**.

Therefore, the correct answer is **Option A**.`,
    images: ["/Gate_QA/question-images/4657742569677615821.webp"]
  },

  "go:1035": {
    concept: "Data Structures - Infix to Postfix Expression Conversion with Precedence and Associativity",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Operator Precedence (Highest to Lowest)**:
    1. Exponentiation ($^{\\wedge}$): Precedence 3, **Right-to-Left associative**.
    2. Multiplication ($\\times$): Precedence 2, **Left-to-Right associative**.
    3. Addition ($+$) and Subtraction ($-$): Precedence 1, **Left-to-Right associative**.
- **Given Infix Expression**:
  $$a + b \\times c - d \\ \\hat{} \\ e \\ \\hat{} \\ f$$
- **Step-by-Step Parenthesization**:
  1. **Handle Exponentiation ($^{\\wedge}$)**:
     - Since $^{\\wedge}$ is right-associative: $d \\ \\hat{} \\ e \\ \\hat{} \\ f = (d \\ \\hat{} \\ (e \\ \\hat{} \\ f))$.
     - Postfix for $(e \\ \\hat{} \\ f)$ is \`ef^\`.
     - Postfix for $(d \\ \\hat{} \\ (ef^))$ is \`def^^\`.
  2. **Handle Multiplication ($\\times$)**:
     - $(b \\times c)$ is converted to \`bc*\`.
  3. **Handle Addition and Subtraction ($+$, $-$)**:
     - Both have equal precedence and are left-associative, so evaluate left-to-right:
       $$((a + (b \\times c)) - (d \\ \\hat{} \\ (e \\ \\hat{} \\ f)))$$
     - Postfix for $(a + (b \\times c))$: \`abc*+\`.
     - Finally, combine with subtraction:
       \`abc*+def^^-\`
- **Distractor Analysis**:
  - **Option A ($abc\\times+def \\ \\hat{}{} \\ \\hat{}-$ )**: Matches the exact derived postfix expression \`abc*+def^^\` followed by \`-\`.
  - **Option B**: Uses left-associative exponentiation \`de^f^-\`, which violates right-associativity.

Therefore, the correct answer is **Option A ($abc\\times+def \\ \\ \\hat{}{} \\ \\ \\ \\hat{}-$)**.`,
    images: []
  },

  "go:1036": {
    concept: "Algorithms & Linear Algebra - Theoretical Time Complexity of Matrix Multiplication",
    markdown: `- **Concept / Theoretical Foundation**:
  - The product of two matrices $M_1$ (dimension $n \\times p$) and $M_2$ (dimension $p \\times m$) is defined by:
    $$(M_1 \\times M_2)_{ij} = \\sum_{k=1}^{p} M_1[i, k] \\cdot M_2[k, j]$$
  - In theoretical algorithm analysis (the Random Access Machine / RAM model), any element of an array stored in contiguous memory can be accessed in **$O(1)$ constant time** using the index mapping formula:
    - Row-major: $\\text{Address}(A[i, j]) = \\text{Base} + (i \\cdot C + j) \\times \\text{sizeof}(\\text{element})$
    - Column-major: $\\text{Address}(A[i, j]) = \\text{Base} + (j \\cdot R + i) \\times \\text{sizeof}(\\text{element})$
- **Complexity Analysis**:
  1. Each of the $n \\times m$ entries in the result matrix requires computing the inner product of a row of $M_1$ and a column of $M_2$, which takes $p$ multiplications and $p - 1$ additions.
  2. Total number of arithmetic operations:
     $$n \\cdot m \\cdot p = \\Theta(n^3) \\quad (\\text{for } n \\times n \\text{ square matrices})$$
  3. Because address translation for every element access takes $\\Theta(1)$ time regardless of whether row-major or column-major indexing is used, the **asymptotic time complexity** remains strictly $\\Theta(n^3)$ (or $O(n^{\\log_2 7})$ for Strassen's algorithm).
  4. Although cache memory spatial locality impacts wall-clock runtime in practical computer architecture, the *algorithmic time complexity* is purely a function of the number of fundamental operations, which is **independent of the storage scheme**.

Therefore, the correct answer is **Option D (independent of the storage scheme)**.`,
    images: []
  },

  "go:1037": {
    concept: "Data Structures - Set Operations on Unsorted Linked Lists",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let sets $A$ and $B$ have sizes $|A| = m$ and $|B| = n$.
  - Both sets are represented as singly linked lists with elements stored in **arbitrary (unsorted) order**.
- **Time Complexity Analysis of Operations**:
  1. **Cardinality**:
     - Traverse the linked list from head to tail to count the nodes.
     - Time complexity: $\\Theta(m)$ linear time.
  2. **Membership ($x \\in A$)**:
     - Linear scan of list $A$ until $x$ is found or the end of the list is reached.
     - Worst-case time complexity: $\\Theta(m)$ linear time.
  3. **Union ($A \\cup B$)**:
     - Set elements must be unique (no duplicates).
     - To construct $A \\cup B$: copy list $A$ ($O(m)$ time).
     - For each element $y \\in B$, check if $y$ is already in list $A$ (membership check taking $O(m)$).
     - Total time: $m + n \\times O(m) = \\Theta(m \\cdot n)$ **quadratic time**.
  4. **Intersection ($A \\cap B$)**:
     - For each element $y \\in B$, perform a membership search across list $A$ ($O(m)$). If found, append to the result.
     - Total time: $n \\times O(m) = \\Theta(m \\cdot n)$ **quadratic time**.
- **Comparison**:
  - Cardinality and Membership take linear time ($O(n)$ or $O(m)$).
  - Union and Intersection require pairwise comparisons taking quadratic time ($O(m \\cdot n)$).
  - Hence, **Union and Intersection** are the slowest operations.

Therefore, the correct answer is **Option D ($\\text{union, intersection}$)**.`,
    images: []
  },

  "go:1038": {
    concept: "Algorithms & C - Euclidean Algorithm for Greatest Common Divisor by Repeated Subtraction",
    markdown: `- **Concept / Theoretical Foundation**:
  - The **Euclidean Algorithm** is based on the fundamental mathematical principle:
    $$\\gcd(m, n) = \\gcd(m - n, n) \\quad \\text{for } m > n$$
  - When $m = n$, the common value is the greatest common divisor: $\\gcd(m, m) = m$.
- **Given Program Trace**:
  \`\`\`c
  main() {
      int x, y, m, n;
      scanf("%d %d", &x, &y);
      /* Assume x > 0 and y > 0 */
      m = x; n = y;
      while (m != n) {
          if (m > n)
              m = m - n;
          else
              n = n - m;
      }
      printf("%d", n);
  }
  \`\`\`
  1. Variables $m$ and $n$ are initialized to positive integers $x$ and $y$.
  2. While $m \\ne n$:
     - If $m > n$, $m$ is reduced by $n$. By Euclid's lemma, $\\gcd(m, n) = \\gcd(m - n, n)$.
     - If $n > m$, $n$ is reduced by $m$. By Euclid's lemma, $\\gcd(m, n) = \\gcd(m, n - m)$.
  3. Invariant: At each iteration, $\\gcd(m, n) = \\gcd(x, y)$.
  4. Since $m$ and $n$ are positive integers that strictly decrease at each step, the loop must terminate when $m = n$.
  5. Upon termination, $m = n = \\gcd(x, y)$, and the program outputs $n$.
- **Conclusion**:
  - The program computes the **greatest common divisor (GCD)** of $x$ and $y$ using repeated subtraction.

Therefore, the correct answer is **Option C (the greatest common divisor of $x$ and $y$)**.`,
    images: []
  },

  "go:1039": {
    concept: "Numerical Methods & Algorithms - Babylonian Square Root Approximation",
    markdown: `- **Concept / Theoretical Foundation**:
  - The **Babylonian Method** (or Newton-Raphson iteration for the function $f(x) = x^2 - m = 0$) iteratively solves for the square root $\\sqrt{m}$.
  - The Newton-Raphson iteration formula for roots of $f(x) = 0$ is:
    $$x_{k+1} = x_k - \\frac{f(x_k)}{f'(x_k)} = x_k - \\frac{x_k^2 - m}{2x_k} = \\frac{2x_k^2 - x_k^2 + m}{2x_k} = \\frac{x_k + m/x_k}{2}$$
- **Analysis of Given Code**:
  \`\`\`c
  x = m;
  y = 1;
  while (x - y > epsilon) {
      x = (x + y) / 2;
      y = m / x;
  }
  print(x);
  \`\`\`
  1. Initialization: $x = m$ and $y = 1$. Notice that $x \\cdot y = m \\cdot 1 = m$.
  2. In each iteration:
     - $x$ is updated to the arithmetic mean of $x$ and $y$: $x_{\\text{new}} = \\frac{x + y}{2} = \\frac{x + m/x}{2}$.
     - $y$ is updated to $m / x_{\\text{new}}$, maintaining the invariant:
       $$x \\cdot y = m$$
  3. Convergence:
     - As the loop progresses, $x$ and $y$ converge toward each other: $x - y \\le \\epsilon$.
     - At convergence: $x \\approx y$.
     - Since $x \\cdot y = m$, setting $y = x$ yields:
       $$x^2 = m \\implies x = \\sqrt{m} = m^{1/2}$$
- **Conclusion**:
  - The algorithm computes the square root of $m$, which is $m^{1/2}$.

Therefore, the correct answer is **Option C ($m^{\\frac{1}{2}}$)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-05 (GATE CSE 2004 Part 3)
  // ==========================================

  "go:1040": {
    concept: "Data Structures & C - Recursive Tree Height Computation",
    markdown: `- **Concept / Theoretical Foundation**:
  - The **height of a tree** (or subtree rooted at node \`ptr\`) is the length of the longest path from \`ptr\` to any of its descendant leaf nodes.
  - Recursively:
    $$\\operatorname{height}(\\text{leaf}) = 0$$
    $$\\operatorname{height}(u) = 1 + \\max(\\operatorname{height}(\\text{left}(u)), \\operatorname{height}(\\text{right}(u)))$$
- **Given C Function**:
  \`\`\`c
  int DoSomething(struct CellNode *ptr) {
      int value = 0;
      if (ptr != NULL) {
          if (ptr->leftChild != NULL)
              value = 1 + DoSomething(ptr->leftChild);
          if (ptr->rightChild != NULL)
              value = max(value, 1 + DoSomething(ptr->rightChild));
      }
      return value;
  }
  \`\`\`
- **Step-by-Step Logic Analysis**:
  1. If \`ptr\` is a leaf node (both \`leftChild == NULL\` and \`rightChild == NULL\`):
     - Neither inner \`if\` condition executes.
     - The function returns \`value = 0\`.
     - Distance from a leaf to itself is $0$ edges.
  2. If \`ptr\` has only a left child:
     - \`value = 1 + DoSomething(ptr->leftChild)\`.
     - Returns $1 + \\text{height}(\\text{leftChild})$.
  3. If \`ptr\` has both children:
     - \`value\` is first computed for the left subtree: $1 + \\operatorname{height}(\\text{left})$.
     - Then $\\max(\\text{value}, 1 + \\operatorname{height}(\\text{right}))$ selects the longer of the two branch depths.
  4. When called on the root of a non-empty tree, \`DoSomething\` returns the maximum edge distance from the root to any leaf node, which is the **height of the tree**.

Therefore, the correct answer is **Option D (The height of the tree)**.`,
    images: []
  },

  "go:1041": {
    concept: "Graph Algorithms - Dijkstra's Shortest Path Vertex Finalization Sequence",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Dijkstra's Algorithm** maintains a set of finalized vertices $S$ for which the shortest path distance from the source is permanently determined.
  - In each iteration, Dijkstra greedily selects a vertex $u \\notin S$ with the minimum tentative distance $d[u]$, adds $u$ to $S$, and relaxes all outgoing edges $(u, v)$.
- **Given Directed Graph with Source $P$**:
  - Vertices: $\\{P, Q, R, S, T, U\\}$.
  - Edges and weights:
    - From $P$: edges to $Q$ (weight 2), $R$ (weight 4).
    - From $Q$: edges to $R$ (weight 1), $U$ (weight 7).
    - From $R$: edge to $U$ (weight 3).
    - From $U$: edge to $S$ (weight 2), $T$ (weight 5).
    - From $S$: edge to $T$ (weight 1).
- **Step-by-Step Execution Trace**:
  1. **Initialization**:
     - Finalized set: $S = \\emptyset$.
     - Tentative distances: $d[P] = 0$, $d[Q] = \\infty, d[R] = \\infty, d[S] = \\infty, d[T] = \\infty, d[U] = \\infty$.
  2. **Step 1**:
     - Minimum tentative distance is $P$ with $d[P] = 0$.
     - **Finalize $P$**: $S = \\{P\\}$.
     - Relax edges from $P$:
       - $d[Q] = \\min(\\infty, 0 + 2) = 2$.
       - $d[R] = \\min(\\infty, 0 + 4) = 4$.
  3. **Step 2**:
     - Minimum among unfinalized is $Q$ with $d[Q] = 2$.
     - **Finalize $Q$**: $S = \\{P, Q\\}$.
     - Relax edges from $Q$:
       - $d[R] = \\min(4, 2 + 1) = 3$.
       - $d[U] = \\min(\\infty, 2 + 7) = 9$.
  4. **Step 3**:
     - Minimum among unfinalized is $R$ with $d[R] = 3$.
     - **Finalize $R$**: $S = \\{P, Q, R\\}$.
     - Relax edges from $R$:
       - $d[U] = \\min(9, 3 + 3) = 6$.
  5. **Step 4**:
     - Minimum among unfinalized is $U$ with $d[U] = 6$.
     - **Finalize $U$**: $S = \\{P, Q, R, U\\}$.
     - Relax edges from $U$:
       - $d[S] = \\min(\\infty, 6 + 2) = 8$.
       - $d[T] = \\min(\\infty, 6 + 5) = 11$.
  6. **Step 5**:
     - Minimum among unfinalized is $S$ with $d[S] = 8$.
     - **Finalize $S$**: $S = \\{P, Q, R, U, S\\}$.
     - Relax edges from $S$:
       - $d[T] = \\min(11, 8 + 1) = 9$.
  7. **Step 6**:
     - Minimum among unfinalized is $T$ with $d[T] = 9$.
     - **Finalize $T$**: $S = \\{P, Q, R, U, S, T\\}$.
- **Final Inclusion Order**:
  $$P, Q, R, U, S, T$$

Therefore, the correct answer is **Option B ($P,Q,R,U,S,T$)**.`,
    images: ["/Gate_QA/question-images/4462792251269685359.webp"]
  },

  "go:1075": {
    concept: "Graph Theory - Graph Unions, Intersections, and Cycle Existence",
    markdown: `- **Concept / Theoretical Foundation**:
  - Let $G_1 = (V, E_1)$ and $G_2 = (V, E_2)$ be connected graphs on the same vertex set $V$ with $|V| = n > 2$.
  - A connected graph on $n$ vertices must contain at least $n - 1$ edges:
    $$|E_1| \\ge n - 1 \\quad \\text{and} \\quad |E_2| \\ge n - 1$$
  - A graph on $n$ vertices with $\\ge n$ edges **must contain at least one cycle**.
- **Analytical Step-by-Step Derivation**:
  1. The intersection graph is $G_1 \\cap G_2 = (V, E_1 \\cap E_2)$.
  2. We are given that $G_1 \\cap G_2$ is **not connected**.
  3. A graph on $n$ vertices with $k$ connected components has at most $n - k$ edges without cycles, and any disconnected graph has $k \\ge 2$ components.
  4. Therefore, the number of edges in $E_1 \\cap E_2$ satisfies:
     $$|E_1 \\cap E_2| \\le n - 2$$
  5. By the Principle of Inclusion-Exclusion for edge sets:
     $$|E_1 \\cup E_2| = |E_1| + |E_2| - |E_1 \\cap E_2|$$
  6. Substituting the lower bounds for $|E_1|$ and $|E_2|$ and the upper bound for $|E_1 \\cap E_2|$:
     $$|E_1 \\cup E_2| \\ge (n - 1) + (n - 1) - (n - 2) = (2n - 2) - n + 2 = n$$
  7. Since $G_1 \\cup G_2$ is a connected graph (as both $G_1$ and $G_2$ are connected spanning subgraphs) with $|V| = n$ vertices and at least $n$ edges ($|E_1 \\cup E_2| \\ge n$), it strictly exceeds the maximum edge count of a tree ($n - 1$).
  8. By the fundamental cycle theorem, any connected graph with $|E| \\ge |V|$ **must contain at least one cycle**.

Therefore, the correct answer is **Option B (must have a cycle)**.`,
    images: []
  },

  "go:1076": {
    concept: "Algorithms - Aggregate Analysis & Amortized Time Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - We analyze the total running time of a loop over $n$ iterations using **aggregate analysis**:
    \`\`\`c
    counter = 0;
    for (i = 1; i <= n; i++) {
        if (a[i] == 1)
            counter++;
        else {
            f(counter);
            counter = 0;
        }
    }
    \`\`\`
  - We are given that $f(m)$ runs in time $\\Theta(m)$.
- **Analytical Step-by-Step Derivation**:
  1. Let the array $a[1 \\dots n]$ contain $k$ blocks of consecutive 1s separated by 0s.
  2. Let the lengths of these consecutive 1-blocks be $m_1, m_2, \\dots, m_k$.
  3. Each time an element $a[i] == 0$ is encountered, $f(\\text{counter})$ is called with $\\text{counter} = m_j$, and then \`counter\` is reset to $0$.
  4. The time taken by the $j^{\\text{th}}$ call to $f$ is $c \\cdot m_j$ for some constant $c > 0$.
  5. The sum of the lengths of all consecutive 1-blocks cannot exceed the total size of the array:
     $$\\sum_{j=1}^{k} m_j \\le n$$
  6. Therefore, the total time spent across **all** calls to $f$ during the entire execution of the loop is:
     $$T_f = \\sum_{j=1}^{k} \\Theta(m_j) = \\Theta\\left(\\sum_{j=1}^{k} m_j\\right) \\le \\Theta(n)$$
  7. The \`for\` loop itself iterates exactly $n$ times, performing $O(1)$ loop control and conditional checks per iteration, contributing $\\Theta(n)$ overhead.
  8. Total running time:
     $$T(n) = \\Theta(n) + T_f = \\Theta(n) + O(n) = \\Theta(n)$$
- **Conclusion**:
  - The overall time complexity of the program fragment is strictly $\\Theta(n)$ linear time.

Therefore, the correct answer is **Option C ($\\Theta(n)$)**.`,
    images: []
  },

  "go:1077": {
    concept: "Algorithms & Recurrences - Divide-and-Conquer Recurrence Tree Analysis",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given the recursive function:
    \`\`\`c
    int recursive(int n) {
        if (n == 1)
            return 1;
        else
            return recursive(n - 1) + recursive(n - 1);
    }
    \`\`\`
- **Mathematical Recurrence Formulation**:
  - Let $T(n)$ denote the time complexity (number of operations / recursive calls) for input $n$.
  - For $n = 1$: $T(1) = 1 = \\Theta(1)$.
  - For $n > 1$: the function makes two identical recursive calls with parameter $n - 1$ and adds the results:
    $$T(n) = 2T(n - 1) + c$$
    where $c$ is a constant representing the addition and conditional check.
- **Solving by Repeated Substitution (Unrolling)**:
  1. $T(n) = 2T(n - 1) + c$
  2. $T(n) = 2(2T(n - 2) + c) + c = 2^2 T(n - 2) + c(1 + 2)$
  3. $T(n) = 2^3 T(n - 3) + c(1 + 2 + 2^2)$
  4. After $k$ unrolling steps:
     $$T(n) = 2^k T(n - k) + c \\sum_{j=0}^{k-1} 2^j$$
  5. Setting $k = n - 1$ reaches the base case $T(1)$:
     $$T(n) = 2^{n-1} T(1) + c(2^{n-1} - 1) = (T(1) + c) 2^{n-1} - c = \\Theta(2^n) = O(2^n)$$
- **Conclusion**:
  - The recursion generates a complete binary call tree of depth $n$, having $2^{n-1}$ leaves and $\\Theta(2^n)$ total nodes.
  - The time complexity is $O(2^n)$.

Therefore, the correct answer is **Option D ($O(2^n)$)**.`,
    images: []
  },

  "go:1078": {
    concept: "Algorithms - Solving Non-Homogeneous Linear Recurrence Relations",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given the recurrence relation:
    $$T(1) = 1$$
    $$T(n) = 2T(n - 1) + n, \\quad \\forall n \\ge 2$$
- **Step-by-Step Derivation via Unrolling**:
  1. Expand the recurrence:
     $$T(n) = 2T(n - 1) + n$$
  2. Substitute $T(n - 1) = 2T(n - 2) + (n - 1)$:
     $$T(n) = 2[2T(n - 2) + (n - 1)] + n = 2^2 T(n - 2) + 2(n - 1) + n$$
  3. Substitute $T(n - 2) = 2T(n - 3) + (n - 2)$:
     $$T(n) = 2^3 T(n - 3) + 2^2(n - 2) + 2(n - 1) + n$$
  4. In general, after $n - 1$ expansions:
     $$T(n) = 2^{n-1} T(1) + \\sum_{k=0}^{n-2} 2^k (n - k)$$
  5. Substituting $T(1) = 1$:
     $$T(n) = 2^{n-1} + \\sum_{j=2}^{n} j \\cdot 2^{n-j}$$
- **Verification via Small $n$ Values**:
  - $n = 1$: $T(1) = 1$.
  - $n = 2$: $T(2) = 2T(1) + 2 = 2(1) + 2 = 4$.
  - $n = 3$: $T(3) = 2T(2) + 3 = 2(4) + 3 = 11$.
  - $n = 4$: $T(4) = 2T(3) + 4 = 2(11) + 4 = 26$.
- **Test Candidates against Calculated Values**:
  - **Option A ($2^{n+1} - n - 2$)**:
    - For $n = 1$: $2^2 - 1 - 2 = 4 - 3 = 1$. (Matches $T(1)$)
    - For $n = 2$: $2^3 - 2 - 2 = 8 - 4 = 4$. (Matches $T(2)$)
    - For $n = 3$: $2^4 - 3 - 2 = 16 - 5 = 11$. (Matches $T(3)$)
    - For $n = 4$: $2^5 - 4 - 2 = 32 - 6 = 26$. (Matches $T(4)$)
  - **Option B ($2^n - n$)**:
    - $n = 1 \\implies 2^1 - 1 = 1$, but $n = 2 \\implies 2^2 - 2 = 2 \\ne 4$.
  - **Option C ($2^{n+1} - 2n - 2$)**:
    - $n = 1 \\implies 4 - 2 - 2 = 0 \\ne 1$.
  - **Option D ($2^n + n$)**:
    - $n = 2 \\implies 4 + 2 = 6 \\ne 4$.
- **Conclusion**:
  - The closed form is $2^{n+1} - n - 2$.

Therefore, the correct answer is **Option A ($2^{n+1} - n - 2$)**.`,
    images: []
  },

  "go:1079": {
    concept: "Algorithms - Divide-and-Conquer Recurrence & Smaller-Subtree Amortization",
    markdown: `- **Concept / Theoretical Foundation**:
  - The program takes a balanced binary search tree with $n$ leaf nodes and computes $g(x)$ for each internal node $x$.
  - The cost of computing $g(x)$ at node $x$ is:
    $$\\operatorname{cost}(x) = \\min(L_x, R_x)$$
    where $L_x$ and $R_x$ are the number of leaf nodes in the left and right subtrees of $x$ respectively.
- **Analytical Step-by-Step Derivation**:
  1. Let $T(n)$ be the total cost for a tree with $n$ leaf nodes ($L_x + R_x = n$):
     $$T(n) = T(k) + T(n - k) + \\min(k, n - k)$$
     where $k$ is the number of leaves in the left subtree, and $n - k$ is the number in the right subtree.
  2. **Accounting / Token-Based Argument**:
     - Think of charging each unit of cost to the leaf nodes.
     - When node $x$ is processed, work of amount $\\min(k, n - k)$ is performed.
     - We charge $1$ unit of cost to each leaf node in the **smaller** of the two subtrees.
     - Whenever a leaf node is charged $1$ unit of work, the size of the subtree containing it is at most half the size of the parent's subtree:
       $$\\text{New subtree size} \\le \\frac{n}{2}$$
     - A leaf node cannot have its containing subtree size halved more than $\\log_2 n$ times before the subtree size reduces to $1$ (a single leaf).
  3. Therefore, each of the $n$ leaf nodes is charged at most $\\log_2 n$ times across the entire tree!
  4. Total cost over all nodes in the tree:
     $$\\sum_{x} \\operatorname{cost}(x) \\le n \\log_2 n = \\Theta(n \\log n)$$
- **Conclusion**:
  - The worst-case time complexity of the program is $\\Theta(n \\log n)$.

Therefore, the correct answer is **Option B ($\\Theta(n \\log n)$)**.`,
    images: []
  },

  "go:1084": {
    concept: "Programming Languages - Paradigms (Functional, Logic, Object-Oriented, Imperative)",
    markdown: `- **Concept / Theoretical Foundation**:
  - **P. Functional Programming** (e.g., Haskell, Lisp, ML):
    - Programs are constructed by applying and composing pure mathematical functions.
    - Emphasizes **side-effect free evaluation, declarative syntax, and expression evaluations** (Characteristic 3).
  - **Q. Logic Programming** (e.g., Prolog):
    - Programs consist of logical assertions, facts, and inference rules.
    - Characterized by **declarative Horn-clausal representation and automated theorem proving / resolution** (Characteristic 4).
  - **R. Object-Oriented Programming** (e.g., Java, C++, Smalltalk):
    - Programs organize state and behavior into objects with encapsulated state.
    - Characterized by **imperative execution with abstract data types, inheritance, and dynamic dispatch** (Characteristic 2).
  - **S. Imperative Programming** (e.g., C, Pascal, Fortran):
    - Programs consist of state-mutating commands, sequential execution, and subroutine calls.
    - Characterized by **command-based, procedural state transformation** (Characteristic 1).
- **Matching Summary**:
  $$\\begin{aligned}
  P &\\mapsto 3 \\\\
  Q &\\mapsto 4 \\\\
  R &\\mapsto 2 \\\\
  S &\\mapsto 1
  \\end{aligned}$$
- **Conclusion**:
  - This corresponds to the tuple $P-3, \\; Q-4, \\; R-2, \\; S-1$.

Therefore, the correct answer is **Option D ($P-3\\quad Q-4\\quad R-2\\quad S-1$)**.`,
    images: []
  },

  // ==========================================
  // CHUNK-CSE-DSA-06 (GATE IT 2004 Full Batch)
  // ==========================================

  "go:3654": {
    concept: "Data Structures - Singly Linked List Deletion Complexity Given Node Pointer",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given a singly linked list with head pointer $P$, and a pointer $Q$ to an intermediate node $x$ to be deleted.
  - In a standard singly linked list, each node has only a \`next\` pointer; there are no backward pointers (\`prev\`).
- **Algorithm Complexity Analysis**:
  1. To delete node $x$ properly from the list:
     - The predecessor node of $x$ (let it be $w$) must have its link updated: $w\\to\\text{next} = x\\to\\text{next}$.
     - Because the list is singly linked, the predecessor $w$ cannot be accessed directly from $Q$.
     - Finding $w$ requires starting at head pointer $P$ and traversing the list until a node with $\\text{node}\\to\\text{next} == Q$ is found.
     - In the worst case (e.g., $x$ is near the end of an $n$-element list), this linear search traverses $\\Theta(n)$ nodes, taking **$O(n)$ time**.
  2. *Note on $O(1)$ value-copying trick*: Copying $x\\to\\text{next}\\to\\text{data}$ into $x$ and deleting the successor node is an in-place value substitution that works only when $x$ is not the last node and external pointers to $x$ are not invalidated; however, in standard textbook algorithm analysis (e.g., Cormen CLRS), classical pointer-based deletion from a singly linked list requires finding the predecessor, which is $O(n)$ in the worst case.
- **Conclusion**:
  - The worst-case time complexity of the algorithm is $O(n)$.

Therefore, the correct answer is **Option A ($O(n)$)**.`,
    images: []
  },

  "go:3656": {
    concept: "C Programming - Boolean Toggling & Arithmetic Equivalence",
    markdown: `- **Concept / Theoretical Foundation**:
  - We are given that integer variable $x$ can take only the binary values $0$ or $1$ ($x \\in \\{0, 1\\}$).
  - The conditional statement is:
    \`\`\`c
    if (x == 0) x = 1; else x = 0;
    \`\`\`
- **Analytical Step-by-Step Derivation**:
  1. This statement acts as a boolean NOT (inversion) operation:
     - If $x = 0 \\implies x_{\\text{new}} = 1$.
     - If $x = 1 \\implies x_{\\text{new}} = 0$.
  2. Let us test each algebraic candidate:
     - **Candidate A ($x = 1 + x$)**:
       - For $x = 0 \\implies x = 1 + 0 = 1$.
       - For $x = 1 \\implies x = 1 + 1 = 2 \\ne 0$. (Fails)
     - **Candidate B ($x = 1 - x$)**:
       - For $x = 0 \\implies x = 1 - 0 = 1$.
       - For $x = 1 \\implies x = 1 - 1 = 0$.
       - Both cases match the conditional statement perfectly!
     - **Candidate C ($x = x - 1$)**:
       - For $x = 0 \\implies x = -1 \\ne 1$. (Fails)
     - **Candidate D ($x = 1 \\% x$)**:
       - For $x = 0 \\implies 1 \\% 0$ causes a **division by zero runtime error / crash**. (Fails)
- **Conclusion**:
  - The statement is completely equivalent to $x = 1 - x;$.

Therefore, the correct answer is **Option B ($x = 1 - x;$)**.`,
    images: []
  },

  "go:3695": {
    concept: "Data Structures - Stack Permutation Generation & Forbidden Subsequences",
    markdown: `- **Concept / Theoretical Foundation**:
  - The characters $a, b, c, d$ are pushed in alphabetical order onto a stack. A character can be popped at any time.
  - A permutation is a **valid stack permutation** if and only if it does not contain the forbidden \"312\" pattern.
  - Specifically, if element $x$ is popped, any element $y$ that was pushed before $x$ and is still in the stack must be popped in reverse order of pushing (LIFO).
- **Evaluating Each Option**:
  - **Option A ($abcd$)**:
    - Push $a$, pop $a$; push $b$, pop $b$; push $c$, pop $c$; push $d$, pop $d$. **Possible**.
  - **Option B ($dcba$)**:
    - Push $a, b, c, d$. Then pop $d, c, b, a$. **Possible**.
  - **Option C ($cbad$)**:
    - Push $a, b, c$. Pop $c$, pop $b$, pop $a$. Then push $d$, pop $d$. **Possible**.
  - **Option D ($cabd$)**:
    - Push $a, b, c$.
    - Pop $c$ $\\implies$ Stack now holds $[a, b]$ with $b$ at the top and $a$ below it.
    - To output the next character $a$, we would have to access $a$. But $b$ is on top of $a$!
    - The stack discipline (LIFO) strictly forces $b$ to be popped before $a$.
    - Thus, $a$ cannot be popped before $b$.
    - Hence, $cabd$ **CANNOT be generated**.

Therefore, the correct answer is **Option D ($cabd$)**.`,
    images: []
  },

  "go:3696": {
    concept: "Data Structures - Bottom-Up Heap Construction (BUILD-HEAP) Time Complexity",
    markdown: `- **Concept / Theoretical Foundation**:
  - Converting an unorganized array of size $n$ into a heap can be done using Floyd's bottom-up \`BUILD-HEAP\` algorithm.
  - The algorithm applies \`MAX-HEAPIFY\` (or \`MIN-HEAPIFY\`) to each internal node in reverse level order:
    $$\\text{starting from node } \\left\\lfloor \\frac{n-1}{2} \\right\\rfloor \\text{ down to root } 0$$
- **Rigorous Mathematical Derivation**:
  1. In a complete binary tree of $n$ elements, the height of the tree is $h = \\lfloor \\log_2 n \\rfloor$.
  2. The maximum number of nodes at height $k$ (where leaves have height $0$, parents of leaves height $1$, etc.) is:
     $$\\left\\lceil \\frac{n}{2^{k+1}} \\right\\rceil$$
  3. The time required to heapify a subtree rooted at a node of height $k$ is proportional to its height: $O(k)$.
  4. The total time to construct the heap is the sum of heapify costs over all internal nodes:
     $$T(n) = \\sum_{k=1}^{\\lfloor \\log_2 n \\rfloor} \\left\\lceil \\frac{n}{2^{k+1}} \\right\\rceil O(k) = O\\left(n \\sum_{k=1}^{\\infty} \\frac{k}{2^k}\\right)$$
  5. The infinite arithmetico-geometric series evaluates to a constant:
     $$\\sum_{k=1}^{\\infty} \\frac{k}{2^k} = \\frac{1/2}{(1 - 1/2)^2} = 2$$
  6. Therefore:
     $$T(n) = O(n \\cdot 2) = O(n)$$
- **Conclusion**:
  - Bottom-up heap construction runs in strictly linear $O(n)$ time.

Therefore, the correct answer is **Option B ($O(n)$)**.`,
    images: []
  },

  "go:3697": {
    concept: "Data Structures - Binary Tree Reconstruction from Inorder and Preorder Traversals",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given the traversals of a binary tree:
    - **Inorder**: $B \\ C \\ A \\ D$
    - **Preorder**: $A \\ B \\ C \\ D$
  - In Preorder, the first element is always the **Root** of the current tree/subtree.
  - In Inorder, all elements appearing to the left of the root belong to the **Left Subtree**, and all elements appearing to the right belong to the **Right Subtree**.
- **Step-by-Step Tree Reconstruction**:
  1. **Identify Root**:
     - Preorder begins with $A \\implies$ **$A$ is the Root**.
  2. **Partition Inorder by Root $A$**:
     - Inorder is $B \\ C \\; | \\; A \\; | \\; D$.
     - Elements $\\{B, C\\}$ are in the **Left Subtree of $A$**.
     - Element $\\{D\\}$ is in the **Right Subtree of $A$**.
     - Since $D$ is a single element, $D$ is the right child of $A$.
  3. **Reconstruct Left Subtree $\\{B, C\\}$**:
     - Preorder for left subtree: nodes $B, C$. First element is $B \\implies$ **$B$ is the root of the left subtree** (left child of $A$).
     - Inorder for left subtree: $B \\ C$. Root $B$ is first, followed by $C$.
     - Since $C$ appears to the right of $B$ in inorder, **$C$ is the right child of $B$**.
- **Resultant Tree Topology**:
  - Node $A$ has:
    - Right child: $D$.
    - Left child: $B$.
  - Node $B$ has:
    - Right child: $C$.
  - This corresponds exactly to the binary tree shown in **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: ["/Gate_QA/question-images/18372728060506908794.webp"]
  },

  "go:3698": {
    concept: "Algorithms - Asymptotic Notation & Equivalence of Functions",
    markdown: `- **Concept / Theoretical Foundation**:
  - Given positive functions $f(n), g(n), h(n)$ satisfying:
    1. $f(n) = O(g(n))$ and $g(n) \\ne O(f(n)) \\implies f(n) = o(g(n))$ (strictly smaller growth rate).
    2. $g(n) = O(h(n))$ and $h(n) = O(g(n)) \\implies g(n) = \\Theta(h(n))$ (identical asymptotic growth rate).
- **Evaluating Each Statement**:
  - **Statement A ($f(n) + g(n) = O(h(n) + h(n))$)**:
    - $f(n) + g(n) = \\Theta(g(n))$ since $f(n) = o(g(n))$.
    - Since $g(n) = \\Theta(h(n))$ and $h(n) + h(n) = 2h(n) = \\Theta(h(n))$, the equality holds. **True**.
  - **Statement B ($f(n) = O(h(n))$)**:
    - By transitivity: $f(n) = O(g(n))$ and $g(n) = O(h(n)) \\implies f(n) = O(h(n))$. **True**.
  - **Statement C ($h(n) \\ne O(f(n))$)**:
    - Since $h(n) = \\Theta(g(n))$ and $g(n) \\ne O(f(n))$, $h(n)$ cannot be $O(f(n))$. **True**.
  - **Statement D ($f(n)h(n) \\ne O(g(n)h(n))$)**:
    - By assumption, $f(n) = O(g(n))$, so there exists $c > 0$ such that $f(n) \\le c \\cdot g(n)$ for large $n$.
    - Multiplying both sides by the positive function $h(n) > 0$:
      $$f(n)h(n) \\le c \\cdot g(n)h(n)$$
    - This directly satisfies the definition of Big-O: $f(n)h(n) = O(g(n)h(n))$.
    - Therefore, asserting that $f(n)h(n) \\ne O(g(n)h(n))$ is **FALSE**.
- **Conclusion**:
  - Statement D is the false statement.

Therefore, the correct answer is **Option D ($f(n)h(n) \\neq O(g(n)h(n))$)**.`,
    images: []
  },

  "go:3699": {
    concept: "Graph Algorithms - Prim's Minimum Spanning Tree Edge Selection Sequence",
    markdown: `- **Concept / Theoretical Foundation**:
  - **Prim's Algorithm** grows a single tree starting from a designated source vertex (here, node $A$).
  - At each step, it selects the minimum-weight edge connecting a vertex in the currently constructed tree to an unvisited vertex outside the tree (crossing the cut $(V_{\\text{tree}}, V \\setminus V_{\\text{tree}})$).
- **Given Undirected Graph & Prim's Execution from Node $A$**:
  - Vertices: $\\{A, B, C, D, E, F, G\\}$.
  - Tree initialized to: $V_{\\text{tree}} = \\{A\\}$.
- **Step-by-Step Prim's Execution**:
  1. From $V_{\\text{tree}} = \\{A\\}$, the incident edges are:
     - $(A, B)$ (weight 2), $(A, D)$ (weight 3), $(A, C)$ (weight 4).
     - Minimum weight edge is $(A, B)$ (weight 2).
     - Add edge **$(A, B)$**. Now $V_{\\text{tree}} = \\{A, B\\}$.
  2. From $\\{A, B\\}$, available cut edges:
     - $(A, D)$ (weight 3), $(A, C)$ (weight 4), $(B, D)$ (weight 5), etc.
     - Minimum weight edge is **$(A, D)$** (weight 3).
     - Add edge **$(A, D)$**. Now $V_{\\text{tree}} = \\{A, B, D\\}$.
  3. From $\\{A, B, D\\}$, available cut edges:
     - $(D, F)$ (weight 3), $(A, C)$ (weight 4), etc.
     - Minimum weight edge is **$(D, F)$** (weight 3).
     - Add edge **$(D, F)$**. Now $V_{\\text{tree}} = \\{A, B, D, F\\}$.
  4. From $\\{A, B, D, F\\}$, available cut edges:
     - $(F, G)$ (weight 2), $(F, C)$ (weight 3), $(A, C)$ (weight 4).
     - Minimum weight edge is **$(F, G)$** (weight 2).
     - Add edge **$(F, G)$**. Now $V_{\\text{tree}} = \\{A, B, D, F, G\\}$.
  5. From $\\{A, B, D, F, G\\}$, available cut edges:
     - $(G, E)$ (weight 2), $(F, C)$ (weight 3).
     - Minimum weight edge is **$(G, E)$** (weight 2).
     - Add edge **$(G, E)$**. Now $V_{\\text{tree}} = \\{A, B, D, E, F, G\\}$.
  6. From $\\{A, B, D, E, F, G\\}$, the only remaining unvisited vertex is $C$:
     - Cut edges to $C$: $(F, C)$ (weight 3), $(A, C)$ (weight 4).
     - Minimum weight edge is **$(F, C)$** (weight 3).
     - Add edge **$(F, C)$**.
- **Final Sequence of Selected Edges**:
  $$\\text{(A, B), (A, D), (D, F), (F, G), (G, E), (F, C)}$$
- **Conclusion**:
  - This matches Option C.

Therefore, the correct answer is **Option C (\\text{(A, B), (A, D), (D, F), (F, G), (G, E), (F, C)})**.`,
    images: ["/Gate_QA/question-images/6434530301766717919.webp"]
  },

  "go:3700": {
    concept: "Algorithms - Matching Classic Algorithms to Recurrence Relations",
    markdown: `- **Concept / Theoretical Foundation**:
  - **P. Binary Search**:
    - Divides a sorted array of size $n$ into half and inspects the middle element with $O(1)$ comparisons:
      $$T(n) = T(n/2) + 1 \\implies \\text{Relation IV}$$
  - **Q. Merge Sort**:
    - Divides array into two equal halves of size $n/2$, recursively sorts each half, and merges them in $cn$ linear time:
      $$T(n) = 2T(n/2) + cn \\implies \\text{Relation III}$$
  - **R. Quick Sort**:
    - Partitions array around a pivot element into subproblems of sizes $k$ and $n - k$ with linear partition work $cn$:
      $$T(n) = T(n - k) + T(k) + cn \\implies \\text{Relation I}$$
  - **S. Tower of Hanoi**:
    - To move $n$ disks: move $n-1$ disks to auxiliary peg ($T(n-1)$), move largest disk ($1$ move), then move $n-1$ disks to destination ($T(n-1)$):
      $$T(n) = 2T(n - 1) + 1 \\implies \\text{Relation II}$$
- **Matching Summary**:
  $$P \\leftrightarrow \\text{IV}, \\quad Q \\leftrightarrow \\text{III}, \\quad R \\leftrightarrow \\text{I}, \\quad S \\leftrightarrow \\text{II}$$

Therefore, the correct answer is **Option B (\\text{P-IV, Q-III, R-I, S-II})**.`,
    images: []
  },

  "go:3701": {
    concept: "C Programming - In-Place Matrix Transposition Loop Bounds",
    markdown: `- **Concept / Theoretical Foundation**:
  - The **transpose** of a square matrix $M$ interchanges rows and columns: $M^T[i][j] = M[j][i]$.
  - To transpose a matrix **in-place** (without allocating a secondary array), we must swap each off-diagonal pair $(M[i][j], M[j][i])$ **exactly once**.
- **Given Outer Loop & Candidate Replacements**:
  \`\`\`c
  for (i = 0; i < 4; ++i) {
      X
  }
  \`\`\`
- **Analytical Evaluation of Candidates**:
  - **Option A & Option B ($j = 0$ to $3$)**:
    - If the inner loop iterates over all columns $j$ from $0$ to $3$:
      - When $i = 0, j = 1$: swaps $M[0][1]$ and $M[1][0]$.
      - When $i = 1, j = 0$: swaps $M[1][0]$ and $M[0][1]$ back to their original positions!
    - Every off-diagonal element is swapped twice, restoring the original matrix unaltered. Hence, $j$ starting at $0$ is incorrect.
  - **Option C ($j = i$ to $3$ with proper swap logic)**:
    - Restricting $j$ from $i$ to $3$ visits each off-diagonal pair in the upper triangle $(j > i)$ exactly once, swapping it with its lower-triangle counterpart:
      \`\`\`c
      for (j = i; j < 4; ++j) {
          t = M[i][j];
          M[i][j] = M[j][i];
          M[j][i] = t;
      }
      \`\`\`
    - For diagonal elements ($j = i$), swapping an element with itself is a harmless no-op.
    - This correctly transforms $M$ into $M^T$.
  - **Option D**: Uses broken swap assignments where $M[i][j]$ is overwritten with uninitialized $t$.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:3702": {
    concept: "C Programming - Static Local Variables in Mutually Recursive Functions",
    markdown: `- **Concept / Theoretical Foundation**:
  - A variable declared \`static\` inside a function is initialized once and retains its state across multiple invocations throughout the program lifetime.
- **Given C Program**:
  \`\`\`c
  #include <stdio.h>
  int funcf(int x);
  int funcg(int y);
  int main() {
      int x = 5, y = 10, count;
      for (count = 1; count <= 2; ++count) {
          y += funcf(x) + funcg(x);
          printf("%d ", y);
      }
      return 0;
  }
  int funcf(int x) {
      int y;
      y = funcg(x);
      return y;
  }
  int funcg(int x) {
      static int y = 10;
      y += 1;
      return (y + x);
  }
  \`\`\`
- **Step-by-Step Program Execution**:
  1. \`main\` initializes $x = 5$, $y = 10$.
  2. \`funcg\` contains \`static int y = 10;\`.
  3. **First Iteration of Loop (\`count = 1\`)**:
     - Evaluate \`y += funcf(x) + funcg(x)\`:
       - Call \`funcf(5)\`:
         - Inside \`funcf\`, calls \`funcg(5)\`.
         - **1st Call to \`funcg(5)\`**:
           - \`static y\` increments: $y = 10 + 1 = 11$.
           - Returns $y + x = 11 + 5 = 16$.
         - \`funcf\` returns $16$.
       - Next, evaluate \`funcg(x)\` with $x = 5$:
         - **2nd Call to \`funcg(5)\`**:
           - \`static y\` increments: $y = 11 + 1 = 12$.
           - Returns $y + x = 12 + 5 = 17$.
       - Update $y$ in \`main\`:
         $$y = 10 + 16 + 17 = 43$$
     - \`printf(\"%d \", y)\` prints: **43**.
  4. **Second Iteration of Loop (\`count = 2\`)**:
     - Evaluate \`y += funcf(x) + funcg(x)\` with current main $y = 43$:
       - Call \`funcf(5)\`:
         - Inside \`funcf\`, calls \`funcg(5)\`.
         - **3rd Call to \`funcg(5)\`**:
           - \`static y\` increments: $y = 12 + 1 = 13$.
           - Returns $y + x = 13 + 5 = 18$.
         - \`funcf\` returns $18$.
       - Next, evaluate \`funcg(x)\` with $x = 5$:
         - **4th Call to \`funcg(5)\`**:
           - \`static y\` increments: $y = 13 + 1 = 14$.
           - Returns $y + x = 14 + 5 = 19$.
       - Update $y$ in \`main\`:
         $$y = 43 + 18 + 19 = 80$$
     - \`printf(\"%d \", y)\` prints: **80**.
- **Conclusion**:
  - The program prints: $43 \\ 80$.

Therefore, the correct answer is **Option A ($43 \\ 80$)**.`,
    images: []
  },

  "go:3703": {
    concept: "C Programming - Recursive Character Stream Reversal Using getchar and putchar",
    markdown: `- **Concept / Theoretical Foundation**:
  - Printing an input stream in reverse order using recursion relies on the **Call Stack** as an implicit LIFO stack:
    1. Read the next character.
    2. If not the terminating newline \`'\\n'\`, recursively call the function to read and process the remaining characters.
    3. After the recursive call returns (unwinding phase), print the saved character.
- **Given Skeleton**:
  \`\`\`c
  void wrt_it(void) {
      int c;
      if (?1)
          wrt_it();
      ?2
  }
  \`\`\`
- **Analytical Evaluation of Candidates**:
  - To read a character into local variable \`c\` and check if it is not \`'\\n'\`:
    $$?1 \\equiv (c = \\operatorname{getchar}()) != '\\backslash n'$$
  - Notice the crucial operator precedence: assignment \`=\` has lower precedence than relational inequality \`!=\`, so parentheses around \`(c = getchar())\` are mandatory.
  - After \`wrt_it()\` returns, \`c\` must be printed using the standard output function:
    $$?2 \\equiv \\operatorname{putchar}(c);$$
  - Function \`getchar(c);\` in Options A and B is invalid C syntax (\`getchar()\` takes no arguments).
  - Option C lacks the assignment \`c = getchar()\`, leaving \`c\` uninitialized.
  - Option D correctly specifies $?1$ as \`(c = getchar()) != '\\n'\` and $?2$ as \`putchar(c);\`.

Therefore, the correct answer is **Option D ($?1$ is  $(c = getchar) ! =$ '\\n', $?2$ is  $putchar(c);$)**.`,
    images: []
  },

  "go:3704": {
    concept: "C Programming - Pass-by-Value vs Pass-by-Reference with Structures",
    markdown: `- **Concept / Theoretical Foundation**:
  - In C, passing a \`struct\` directly by value (e.g., \`f1(s)\`) creates a **local copy** of the structure on the stack. Modifications made to fields inside the function affect only the local copy and do not alter the caller's structure.
  - Passing a pointer to a struct (e.g., \`f2(&s)\`) allows the function to dereference the pointer and modify the caller's structure in place.
- **Given Program Trace**:
  \`\`\`c
  typedef struct {
      char *a;
      char *b;
  } t;

  int main() {
      static t s = {"A", "B"};
      printf("%s %s\n", s.a, s.b); // Line 1
      f1(s);                       // Pass by value
      printf("%s %s\n", s.a, s.b); // Line 3
      f2(&s);                      // Pass by pointer
      return 0;
  }
  void f1(t s) {
      s.a = "U";
      s.b = "V";
      printf("%s %s\n", s.a, s.b); // Line 2
  }
  void f2(t *p) {
      p->a = "V";
      p->b = "W";
      printf("%s %s\n", p->a, p->b); // Line 4
  }
  \`\`\`
- **Step-by-Step Execution Output**:
  1. **Line 1 in \`main\`**: \`s\` is initialized to \`{\"A\", \"B\"}\`.
     - Prints: **$A \\ B$**.
  2. **Call \`f1(s)\` (Line 2)**:
     - \`f1\` receives a copy of \`s\`. It updates its local copy: \`s.a = \"U\", s.b = \"V\"\`.
     - Prints: **$U \\ V$**.
     - Returns to \`main\`.
  3. **Line 3 in \`main\`**:
     - Because \`f1\` operated on a pass-by-value copy, \`main\`'s \`s\` remains unchanged!
     - Prints: **$A \\ B$**.
  4. **Call \`f2(&s)\` (Line 4)**:
     - \`f2\` receives the memory address \`&s\`.
     - It mutates \`s.a = \"V\", s.b = \"W\"\`.
     - Prints: **$V \\ W$**.
- **Combined Output**:
  $$\\begin{aligned}
  &A \\ B \\\\
  &U \\ V \\\\
  &A \\ B \\\\
  &V \\ W
  \\end{aligned}$$
- **Conclusion**:
  - Matches Option B.

Therefore, the correct answer is **Option B**.`,
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
  for (const [uid, sol] of Object.entries(CHUNK_CSE_DSA_03_TO_06_SOLUTIONS)) {
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

if (process.argv[1] && process.argv[1].endsWith("apply-chunk-cse-dsa-03-to-06.mjs")) {
  applyChunkSolutions();
}
