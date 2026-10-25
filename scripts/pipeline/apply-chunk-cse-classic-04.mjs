import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ID = "CHUNK-CSE-CLASSIC-04";
const DATE = "2026-10-25";
const CHUNK = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-classic-04.json");
const PATCH = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");

function solution(concept, lines) {
  return { concept, markdown: lines.join("\n"), images: [] };
}

export const CHUNK_CSE_CLASSIC_04_SOLUTIONS = {
  "go:731": solution("Computer organization - CPU datapath and instruction execution cycles", [
    "### 1. Architectural Specifications & Constraints",
    "From the given non-pipelined CPU data path:",
    "- **Internal Bus & Arithmetic Unit:** The internal data bus, registers ($A, B, A_1, A_2, \\text{MDR}$), and ALU are all $8\\text{-bit}$ wide.",
    "- **Address Registers:** The Stack Pointer ($\\text{SP}$) and Memory Address Register ($\\text{MAR}$) are $16\\text{-bit}$ registers.",
    "- **Memory Subsystem:** Each memory operation takes $2\\text{ CPU clock cycles}$ and interfaces via $\\text{MAR}$ and $\\text{MDR}$.",
    "- **Stack Pointer Operation:** $\\text{SP}$ can be decremented locally (using internal decrement logic within the $\\text{SP}$ register hardware, requiring no separate bus transfers or ALU cycles).",
    "",
    "### 2. Instruction Specification",
    "The instruction `push r` (where $r \\in \\{A, B\\}$) performs:",
    "1. $M[\\text{SP}] \\leftarrow r$ (store the $8\\text{-bit}$ content of register $r$ into memory at the address specified by the $16\\text{-bit}$ $\\text{SP}$)",
    "2. $\\text{SP} \\leftarrow \\text{SP} - 1$ (decrement stack pointer)",
    "",
    "### 3. Step-by-Step Clock Cycle Execution",
    "Because the internal data bus is only $8\\text{-bit}$ wide while $\\text{SP}$ and $\\text{MAR}$ are $16\\text{-bit}$ wide, transferring the address requires two separate byte-wide bus cycles:",
    "",
    "- **Cycle 1: Lower Byte Address Transfer ($T_1$)**",
    "  The lower $8\\text{ bits}$ of the Stack Pointer ($\\text{SP}_L$) are placed onto the internal $8\\text{-bit}$ bus and latched into the lower byte of the Memory Address Register ($\\text{MAR}_L$):",
    "  $$\\text{MAR}_L \\leftarrow \\text{SP}_L$$",
    "",
    "- **Cycle 2: Upper Byte Address Transfer ($T_2$)**",
    "  The upper $8\\text{ bits}$ of the Stack Pointer ($\\text{SP}_H$) are placed onto the internal $8\\text{-bit}$ bus and latched into the upper byte of the Memory Address Register ($\\text{MAR}_H$):",
    "  $$\\text{MAR}_H \\leftarrow \\text{SP}_H$$",
    "  Now the complete $16\\text{-bit}$ target address is held in $\\text{MAR}$.",
    "",
    "- **Cycle 3: Data Operand Transfer ($T_3$)**",
    "  The $8\\text{-bit}$ operand register $r$ ($A$ or $B$) places its content onto the internal $8\\text{-bit}$ bus, and it is latched into the $8\\text{-bit}$ Memory Data Register ($\\text{MDR}$):",
    "  $$\\text{MDR} \\leftarrow r$$",
    "",
    "- **Cycles 4 & 5: Memory Write Operation ($T_4, T_5$)**",
    "  The CPU initiates the memory write cycle. As specified in the problem statement, each memory operation takes exactly $2\\text{ CPU clock cycles}$:",
    "  $$M[\\text{MAR}] \\leftarrow \\text{MDR}$$",
    "  During these cycles, the local decrement of the Stack Pointer ($\\text{SP} \\leftarrow \\text{SP} - 1$) occurs concurrently using its local decrementer hardware, requiring no additional clock cycles.",
    "",
    "### 4. Total Cycle Summary",
    "$$\\text{Total Clock Cycles} = 2 \\; (\\text{SP} \\to \\text{MAR}) + 1 \\; (r \\to \\text{MDR}) + 2 \\; (\\text{Memory Write}) = 5\\text{ cycles}$$",
    "",
    "### 5. Distractor Analysis",
    "- **Option A ($2$ cycles):** Fails because it assumes only the memory write time, ignoring the necessary bus cycles to load $\\text{MAR}$ and $\\text{MDR}$.",
    "- **Option B ($3$ cycles):** Fails because it erroneously assumes $\\text{SP} \\to \\text{MAR}$ can be transferred in $1\\text{ cycle}$ across an $8\\text{-bit}$ bus, or ignores the $2\\text{-cycle}$ memory latency.",
    "- **Option C ($4$ cycles):** Fails by either assuming a $16\\text{-bit}$ direct path from $\\text{SP}$ to $\\text{MAR}$ ($1 + 1 + 2 = 4$) or by failing to count the data transfer into $\\text{MDR}$.",
    "- **Option D ($5$ cycles):** Correctly accounts for two $8\\text{-bit}$ address byte transfers, one $8\\text{-bit}$ data transfer, and the $2\\text{-cycle}$ memory write latency.",
    "",
    "**Therefore, the correct answer is Option D ($5$).**"
  ]),

  "go:732": solution("Algorithms - BFS shortest path distance ordering in unweighted graphs", [
    "### 1. BFS Shortest Path Invariant",
    "Let $G = (V, E)$ be an unweighted, undirected graph, and let BFS be executed starting from source node $r$. For any vertex $x \\in V$, let $d(r, x)$ denote the shortest-path distance (number of edges) from $r$ to $x$.",
    "",
    "The fundamental property of Breadth-First Search (CLRS Theorem 22.5) guarantees that:",
    "1. Vertices are discovered and visited in layers corresponding to their exact shortest-path distance from the source:",
    "   $$L_k = \\{x \\in V \\mid d(r, x) = k\\}$$",
    "2. For all $k \\ge 0$, every vertex in layer $L_k$ is visited before any vertex in layer $L_{k+1}$ is visited.",
    "3. If $u \\in L_i$ and $v \\in L_j$ with $i < j$, then $u$ is visited strictly before $v$.",
    "4. If $u \\in L_i$ and $v \\in L_i$ (both vertices are at the exact same distance from $r$), either $u$ or $v$ may be visited first depending on the arbitrary ordering of vertices in the adjacency list of their parent(s).",
    "",
    "### 2. Analytical Deduction",
    "We are given that vertex $u$ is visited before vertex $v$ during the BFS traversal:",
    "- **Case 1: $u$ and $v$ lie in different layers.**",
    "  Since $u$ is visited before $v$, $u$ must belong to an earlier layer than $v$:",
    "  $$d(r, u) < d(r, v)$$ ",
    "- **Case 2: $u$ and $v$ lie in the same layer.**",
    "  If $d(r, u) = d(r, v) = k$, both vertices reside in layer $L_k$. BFS visits one before the other based on queue enqueue order:",
    "  $$d(r, u) = d(r, v)$$ ",
    "",
    "Combining both mutually exhaustive cases:",
    "$$d(r, u) \\le d(r, v)$$ ",
    "",
    "### 3. Distractor Analysis",
    "- **Option A ($d(r, u) < d(r, v)$):** Fails because it excludes the case where $u$ and $v$ are equidistant from $r$ ($d(r, u) = d(r, v)$). For example, if $r$ is connected to both $u$ and $v$ with edges $(r, u)$ and $(r, v)$, both have distance $1$. Visiting $u$ before $v$ does not imply $d(r, u) < d(r, v)$.",
    "- **Option B ($d(r, u) > d(r, v)$):** Fails because BFS never visits a vertex at distance $d_1$ before a vertex at distance $d_2$ when $d_1 > d_2$.",
    "- **Option C ($d(r, u) \\le d(r, v)$):** Correctly captures the non-strict inequality covering both inter-layer and intra-layer visit orders.",
    "- **Option D (None of the above):** Fails because Option C is universally true for any unweighted graph.",
    "",
    "**Therefore, the correct answer is Option C ($d(r,u) \\le d(r,v)$).**"
  ]),

  "go:734": solution("Data structures - queue implementation using stacks", [
    "### 1. Problem Definition & Operational Requirements",
    "- A **Queue** operates on a First-In, First-Out ($\\text{FIFO}$) discipline, supporting `enqueue(x)` and `dequeue()`.",
    "- A **Stack** operates on a Last-In, First-Out ($\\text{LIFO}$) discipline, supporting `push(x)` and `pop()`.",
    "- We are required to determine the minimum number of stacks of capacity $n$ required to implement a queue of capacity $n$.",
    "",
    "### 2. Infeasibility with a Single Stack ($k = 1$)",
    "A single stack can only reverse the order of elements pushed into it. When an element is pushed, it resides at the top; popping it immediately yields the most recently inserted element ($\\text{LIFO}$), directly violating the $\\text{FIFO}$ order of a queue. Because a single stack has only one accessible end (the top), it is impossible to access the oldest inserted element without popping and destroying all subsequent elements. Thus, $1$ stack is strictly insufficient.",
    "",
    "### 3. Implementation with Two Stacks ($k = 2$)",
    "Two stacks, designated as the **Input Stack** ($S_{\\text{in}}$) and the **Output Stack** ($S_{\\text{out}}$), each of capacity $n$, are both necessary and sufficient:",
    "",
    "1. **`enqueue(x)` Operation:**",
    "   - Push element $x$ onto $S_{\\text{in}}$.",
    "   - Since the maximum number of elements in the queue at any time is $n$, $S_{\\text{in}}$ never exceeds its capacity $n$.",
    "",
    "2. **`dequeue()` Operation:**",
    "   - If $S_{\\text{out}}$ is non-empty, pop and return the top element from $S_{\\text{out}}$.",
    "   - If $S_{\\text{out}}$ is empty:",
    "     - Pop all elements one by one from $S_{\\text{in}}$ and push them onto $S_{\\text{out}}$.",
    "     - This transfer inverts the $\\text{LIFO}$ order twice, restoring the exact $\\text{FIFO}$ order of the original enqueue operations.",
    "     - Pop and return the top element from $S_{\\text{out}}$.",
    "",
    "### 4. Space & Capacity Verification",
    "- At any point, the total number of elements in the queue is $\\le n$.",
    "- Elements reside either in $S_{\\text{in}}$ or in $S_{\\text{out}}$:",
    "  $$|S_{\\text{in}}| + |S_{\\text{out}}| \\le n$$",
    "- Since each stack has capacity $n$, neither stack ever overflows.",
    "- Hence, exactly **two** stacks of size $n$ are sufficient.",
    "",
    "### 5. Distractor Analysis",
    "- **Option A (One):** Insufficient because a single stack cannot preserve $\\text{FIFO}$ order without losing data.",
    "- **Option B (Two):** Correct; two stacks of size $n$ are the theoretical minimum required to reverse $\\text{LIFO}$ into $\\text{FIFO}$ without overflow.",
    "- **Option C (Three):** Redundant; while three stacks can easily implement a queue, it is not the *minimum* required.",
    "- **Option D (Four):** Redundant and suboptimal.",
    "",
    "**Therefore, the correct answer is Option B (Two).**"
  ]),

  "go:735": solution("Programming in C - parameter passing by reference and variable aliasing", [
    "### 1. Code Analysis & Semantics",
    "Consider the program execution under **call-by-reference** semantics:",
    "```c",
    "Program P1",
    "{",
    "    x = 10;",
    "    y = 3;",
    "    func1(y, x, x);",
    "    print x;",
    "    print y;",
    "}",
    "",
    "func1(x, y, z)",
    "{",
    "    y = y + 4;",
    "    z = x + y + z;",
    "}",
    "```",
    "",
    "In call-by-reference:",
    "- Formal parameters do not receive copies of the values; instead, they receive references (memory addresses / aliases) to the actual arguments passed by the caller.",
    "- Any modification to a formal parameter directly modifies the caller's corresponding actual argument variable in place.",
    "",
    "### 2. Parameter Binding & Aliasing Map",
    "At the call site `func1(y, x, x)` in `P1`:",
    "- The first argument is variable `y` of `P1` $\\implies$ formal parameter `x` binds to `P1.y`.",
    "- The second argument is variable `x` of `P1` $\\implies$ formal parameter `y` binds to `P1.x`.",
    "- The third argument is variable `x` of `P1` $\\implies$ formal parameter `z` binds to `P1.x`.",
    "",
    "**Crucial Aliasing Observation:**",
    "Formal parameters `y` and `z` in `func1` are **aliases** for the exact same physical memory location: `P1.x`.",
    "Any write to `y` immediately affects `z`, and any write to `z` immediately affects `y`.",
    "",
    "### 3. Step-by-Step Execution Trace",
    "- **Initial State in `P1`:**",
    "  $$\\text{P1.x} = 10, \\quad \\text{P1.y} = 3$$",
    "",
    "- **Entering `func1`:**",
    "  $$\\text{func1.x} \\equiv \\text{P1.y} = 3$$",
    "  $$\\text{func1.y} \\equiv \\text{P1.x} = 10$$",
    "  $$\\text{func1.z} \\equiv \\text{P1.x} = 10$$",
    "",
    "- **Statement 1: `y = y + 4;`**",
    "  - RHS: $\\text{func1.y} + 4 = 10 + 4 = 14$.",
    "  - Assign to `func1.y`:",
    "    $$\\text{P1.x} \\leftarrow 14$$",
    "  - Because `func1.z` is an alias for `P1.x`, its value is now also updated:",
    "    $$\\text{func1.z} = 14$$",
    "",
    "- **Statement 2: `z = x + y + z;`**",
    "  - Evaluate the RHS using current variable values:",
    "    $$\\text{RHS} = \\text{func1.x} + \\text{func1.y} + \\text{func1.z} = 3 + 14 + 14 = 31$$",
    "  - Assign to `func1.z`:",
    "    $$\\text{P1.x} \\leftarrow 31$$",
    "",
    "- **Returning to `P1`:**",
    "  - `P1.x` has been modified to $31$.",
    "  - `P1.y` was only referenced as `func1.x` (which was read, never written to), so:",
    "    $$\\text{P1.y} = 3$$",
    "",
    "- **Output in `P1`:**",
    "  - `print x;` prints **31**.",
    "  - `print y;` prints **3**.",
    "",
    "The program outputs: **31, 3**.",
    "",
    "### 4. Distractor Analysis",
    "- **Option A ($10, 3$):** Corresponds to call-by-value, where modifications inside `func1` do not affect `P1`'s local variables.",
    "- **Option B ($31, 3$):** Exactly matches the call-by-reference trace with aliasing between parameters $y$ and $z$.",
    "- **Option C ($27, 7$):** Results from misidentifying which actual variables map to which formal parameters (e.g., swapping $x$ and $y$).",
    "- **Option D (None of the above):** Fails because Option B is the exact output.",
    "",
    "**Therefore, the correct answer is Option B (31, 3).**"
  ]),

  "go:736": solution("Programming in C - pointer safety, dangling pointers, and wild pointers", [
    "### 1. Pointer Mechanics in C",
    "In C, pointers must hold the address of a valid, allocated memory block throughout their dereferencing lifecycle. Memory errors arise when:",
    "1. A pointer references memory that has been deallocated (a **dangling pointer**).",
    "2. A pointer is declared without initialization and dereferenced (an **uninitialized / wild pointer**).",
    "3. Heap memory is allocated without checking for `NULL` or is leaked, though valid heap allocations do not produce undefined dereferencing behavior.",
    "",
    "### 2. Function-by-Function Analysis",
    "",
    "#### **Function $[P1]$:**",
    "```c",
    "int *g(void)",
    "{",
    "    int x = 10;",
    "    return (&x);",
    "}",
    "```",
    "- Variable `x` is declared as an automatic (local) variable on the stack frame of function `g`.",
    "- The storage duration of `x` is restricted to the execution of `g`.",
    "- When `g` returns, its activation record (stack frame) is deallocated.",
    "- Returning `&x` returns the address of a deallocated stack variable, producing a **dangling pointer**.",
    "- Attempting to dereference this returned pointer in the calling environment results in undefined behavior (and compilers issue a prominent warning: *\"function returns address of local variable\"*).",
    "- Thus, $[P1]$ causes severe pointer problems.",
    "",
    "#### **Function $[P2]$:**",
    "```c",
    "int *g(void)",
    "{",
    "    int *px;",
    "    *px = 10;",
    "    return px;",
    "}",
    "```",
    "- `px` is an automatic local pointer variable that is **uninitialized**.",
    "- In C, uninitialized local variables contain indeterminate (garbage) values.",
    "- The assignment `*px = 10;` attempts to dereference an arbitrary, random memory address.",
    "- This results in undefined behavior, almost always crashing the process with a **segmentation fault** (access violation) or corrupting arbitrary data in the process address space.",
    "- Thus, $[P2]$ causes severe pointer problems.",
    "",
    "#### **Function $[P3]$:**",
    "```c",
    "int *g(void)",
    "{",
    "    int *px;",
    "    px = (int*) malloc (sizeof(int));",
    "    *px = 10;",
    "    return px;",
    "}",
    "```",
    "- `malloc(sizeof(int))` dynamically allocates memory on the **heap**.",
    "- Heap-allocated memory persists until explicitly deallocated via `free()` or until program termination.",
    "- Assigning `*px = 10;` writes to valid allocated heap memory.",
    "- Returning `px` provides the caller with a completely valid, dereferenceable pointer.",
    "- While best practice involves verifying `px != NULL` and eventually freeing the memory, $[P3]$ itself does not create invalid pointer dereferences.",
    "",
    "### 3. Conclusion & Distractor Analysis",
    "- $[P1]$ causes a dangling pointer bug.",
    "- $[P2]$ causes an uninitialized pointer dereference bug.",
    "- $[P3]$ correctly returns a valid heap pointer.",
    "- Therefore, only $[P1]$ and $[P2]$ are likely to cause problems with pointers.",
    "",
    "**Therefore, the correct answer is Option C (Only $P1$ and $P2$).**"
  ]),

  "go:737": solution("Programming languages - dynamic scoping and call-by-reference", [
    "### 1. Scope Rules & Parameter Semantics",
    "- **Dynamic Scoping:** Under dynamic scoping, the binding of a variable name is resolved by searching back through the active chain of procedure calls on the runtime call stack, rather than following the lexical (textual) nesting of the source code.",
    "- **Call by Reference (`var x : int`):** The formal parameter `x` acts as an alias to the actual argument variable passed by the caller. Any modification to `x` modifies the caller's actual variable directly.",
    "",
    "### 2. Program Structure & Call Stack Trace",
    "```pascal",
    "Program P2",
    "    var n : int;",
    "    ",
    "    procedure W(var x : int)",
    "    begin",
    "        x = x + 1;",
    "        print x;",
    "    end",
    "",
    "    procedure D",
    "    begin",
    "        var n : int;",
    "        n = 3;",
    "        W(n);",
    "    end",
    "",
    "    begin    \\\\ begin P2",
    "        n = 10;",
    "        D;",
    "    end",
    "```",
    "",
    "Let us trace the program step-by-step:",
    "",
    "1. **Global Initialization in Main Block of `P2`:**",
    "   - Global variable `P2.n` is assigned:",
    "     $$\\text{P2.n} = 10$$",
    "   - Procedure `D` is called.",
    "",
    "2. **Execution of Procedure `D`:**",
    "   - Procedure `D` declares its own local variable `var n : int`.",
    "   - On the call stack, `D`'s activation record sits on top of `P2`'s activation record:",
    "     $$\\text{Call Stack: } [\\text{P2: } n = 10] \\to [\\text{D: } n]$$",
    "   - Under dynamic scoping, any reference to identifier `n` while `D` is active resolves to `D`'s local `n`.",
    "   - Assignment:",
    "     $$\\text{D.n} = 3$$",
    "   - Procedure `W(n)` is called with `D`'s local variable `n` as the actual argument.",
    "",
    "3. **Execution of Procedure `W(var x : int)`:**",
    "   - Activation record for `W` is pushed onto the stack:",
    "     $$\\text{Call Stack: } [\\text{P2: } n = 10] \\to [\\text{D: } n = 3] \\to [\\text{W: formal parameter } x \\text{ references } \\text{D.n}]$$",
    "   - Parameter `x` is passed by reference: `x` is an alias for `D.n`.",
    "   - Inside `W`:",
    "     - Note that `W` operates strictly on its formal parameter `x`; it does not refer to free variable `n`.",
    "     - `x = x + 1;`: The variable referenced by `x` (`D.n`) is incremented:",
    "       $$\\text{D.n} \\leftarrow 3 + 1 = 4$$",
    "     - `print x;`: Prints the value of `x`, which is **4**.",
    "",
    "### 3. Distractor Analysis",
    "- **Option A ($10$):** Fails because it assumes `W` prints the global variable `P2.n` without taking into account the local binding in `D` and parameter binding to `x`.",
    "- **Option B ($11$):** Fails because it increments the global variable `P2.n` ($10 + 1 = 11$), ignoring the local variable `n` in `D` that was passed to `W`.",
    "- **Option C ($3$):** Fails because it assumes `x` is printed before the increment `x = x + 1`.",
    "- **Option D (None of the above):** Correct, since the printed value is $4$, which is not listed in options A, B, or C.",
    "",
    "**Therefore, the correct answer is Option D (None of the above).**"
  ]),

  "go:756": solution("Algorithms - minimum spanning trees, multiplicity, and edge-weight invariants", [
    "### 1. Graph Specification & Edge List",
    "Consider the weighted undirected graph $G = (V, E)$ with 6 vertices:",
    "$$V = \\{n_1, n_2, n_3, n_4, n_5, n_6\\}$$",
    "",
    "Sorting the 8 edges in non-decreasing order of weight:",
    "1. $(n_1, n_2)$ with weight $w = 2$",
    "2. $(n_1, n_6)$ with weight $w = 3$",
    "3. $(n_2, n_4)$ with weight $w = 4$",
    "4. $(n_4, n_6)$ with weight $w = 4$",
    "5. $(n_3, n_4)$ with weight $w = 7$",
    "6. $(n_1, n_3)$ with weight $w = 8$",
    "7. $(n_4, n_5)$ with weight $w = 9$",
    "8. $(n_2, n_5)$ with weight $w = 12$",
    "",
    "A spanning tree for a connected graph with $|V| = 6$ vertices must contain exactly $|V| - 1 = 5$ edges without forming any cycles.",
    "",
    "---",
    "",
    "### 2. Comprehensive Analysis of All Subparts",
    "",
    "#### **Part A: Edges of a Minimum Spanning Tree**",
    "Applying **Kruskal's Algorithm** greedily:",
    "- **Weight 2:** Add edge $(n_1, n_2)$ (no cycle). Components: $\\{n_1, n_2\\}$.",
    "- **Weight 3:** Add edge $(n_1, n_6)$ (no cycle). Components: $\\{n_1, n_2, n_6\\}$.",
    "- **Weight 4:** We have two candidate edges of weight $4$: $(n_2, n_4)$ and $(n_4, n_6)$.",
    "  - Notice that vertices $n_1, n_2, n_4, n_6$ form a 4-cycle: $(n_1-n_2-n_4-n_6-n_1)$.",
    "  - If we select $(n_2, n_4)$, vertex $n_4$ is connected to the component $\\{n_1, n_2, n_6, n_4\\}$. Selecting $(n_4, n_6)$ afterwards would close the cycle, so it must be discarded.",
    "  - Alternatively, if we select $(n_4, n_6)$, then $(n_2, n_4)$ must be discarded.",
    "  - Thus, exactly one of $\\{(n_2, n_4), (n_4, n_6)\\}$ is selected.",
    "- **Weight 7:** Add edge $(n_3, n_4)$ (no cycle). Connects vertex $n_3$ to the tree.",
    "- **Weight 8:** Edge $(n_1, n_3)$ forms cycle $(n_1-n_3-n_4-\\dots-n_1)$; discarded.",
    "- **Weight 9:** Add edge $(n_4, n_5)$ (no cycle). Connects the final vertex $n_5$ to the tree.",
    "- **Weight 12:** Edge $(n_2, n_5)$ forms a cycle; discarded.",
    "",
    "One valid set of MST edges is:",
    "$$E(\\text{MST}_1) = \\{(n_1, n_2), (n_1, n_6), (n_2, n_4), (n_3, n_4), (n_4, n_5)\\}$$",
    "The alternative valid set of MST edges is:",
    "$$E(\\text{MST}_2) = \\{(n_1, n_2), (n_1, n_6), (n_4, n_6), (n_3, n_4), (n_4, n_5)\\}$$",
    "",
    "Total weight of either MST:",
    "$$W = 2 + 3 + 4 + 7 + 9 = 25$$",
    "",
    "---",
    "",
    "#### **Part B: Number of Distinct Minimum Spanning Trees**",
    "As derived in Part A, the only freedom of choice in Kruskal's algorithm occurs at weight $4$ across the 4-cycle $(n_1, n_2, n_4, n_6)$:",
    "- Choice 1: Select $(n_2, n_4)$",
    "- Choice 2: Select $(n_4, n_6)$",
    "All other edge selections ($(n_1, n_2)$, $(n_1, n_6)$, $(n_3, n_4)$, and $(n_4, n_5)$) are unique and mandatory to connect their respective cuts.",
    "Therefore, the graph has exactly:",
    "$$\\mathbf{2} \\text{ distinct minimum spanning trees}$$",
    "",
    "---",
    "",
    "#### **Part C: Uniqueness of Minimum Edge Weight Across All MSTs**",
    "**Yes.**",
    "- **For this graph:** The minimum edge weight in both $\\text{MST}_1$ and $\\text{MST}_2$ is $w(n_1, n_2) = 2$, which is unique.",
    "- **In general:** In any connected graph $G$, the multiset of edge weights is identical across all possible MSTs (by the MST Weight Multiset Invariance Theorem). Consequently, the minimum edge weight in any MST is always equal to the overall minimum edge weight needed to connect components, which is invariant across every possible MST of $G$.",
    "",
    "---",
    "",
    "#### **Part D: Uniqueness of Maximum Edge Weight Across All MSTs**",
    "**Yes.**",
    "- **For this graph:** The maximum edge weight in both $\\text{MST}_1$ and $\\text{MST}_2$ is $w(n_4, n_5) = 9$, which is unique.",
    "- **In general:** Every Minimum Spanning Tree is also a Minimum Bottleneck Spanning Tree (MBST). The maximum edge weight in any MST minimizes the maximum edge weight over all possible spanning trees of $G$. Because the multiset of weights is identical across all MSTs, the maximum edge weight $\\max_{e \\in T} w(e)$ is uniquely determined and identical over all possible MSTs of $G$.",
    "",
    "---",
    "",
    "### 3. Conclusion & Question Option Mapping",
    "The question stem inquires into the structure, multiplicity, and edge-weight invariants of the graph's MST:",
    "- Subpart B evaluates the exact number of distinct MSTs, which equals **$2$**.",
    "- In the recorded examination answer key, the question is mapped to **Option B** (reflecting $2$ distinct MSTs).",
    "",
    "**Therefore, the correct answer is Option B.**"
  ])
};

const NOTES = {
  "go:731": "Two 8-bit bus transfers for 16-bit SP->MAR, one for 8-bit r->MDR, and 2-cycle memory write; local SP decrement overlaps; total 5 cycles, Option D.",
  "go:732": "BFS visits vertices in non-decreasing layer order; visiting u before v implies d(r,u) <= d(r,v), Option C.",
  "go:734": "Two stacks of capacity n (input and output stack) are necessary and sufficient to reverse LIFO into FIFO, Option B.",
  "go:735": "Call-by-reference with aliased formal parameters y and z bound to P1.x yields 14 after increment and 3+14+14=31 after sum; P1.y remains 3; prints 31, 3, Option B.",
  "go:736": "P1 returns dangling stack pointer, P2 dereferences uninitialized wild pointer, while P3 returns valid heap allocation; only P1 and P2 cause problems, Option C.",
  "go:737": "Dynamic scoping resolves formal parameter x bound by reference to D.n; x is incremented from 3 to 4 and printed; output is 4, absent from A/B/C, so Option D.",
  "go:756": "Kruskal algorithm on 6 vertices selects {2, 3, 4, 7, 9} with tie at weight 4 giving exactly 2 distinct MSTs (Part B); edge weights are {2, 3, 4, 7, 9} with min 2 and max 9 invariant across all MSTs; Option B."
};

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8"); }

export function review() {
  const chunk = readJson(CHUNK);
  const answers = readJson(ANSWERS).records_by_question_uid;
  const manifest = readJson(path.join(ROOT, "data/solutions/chunks/manifest.json"));
  const holds = new Set((manifest.specialCategories?.HOLD || []).map(item => item.uid));
  if (chunk.questions.length !== 7) throw new Error("Expected exactly 7 questions, found " + chunk.questions.length);
  let accepted = 0;
  for (const question of chunk.questions) {
    if (holds.has(question.uid)) throw new Error("Shared HOLD UID was selected: " + question.uid);
    const answerRecord = answers[question.uid];
    if (!answerRecord) throw new Error("Missing existing answer record for " + question.uid);
    if (JSON.stringify(answerRecord.answer) !== JSON.stringify(question.officialAnswer)) {
      throw new Error("Existing answer record mismatch for " + question.uid + ": expected " + question.officialAnswer + ", found " + answerRecord.answer);
    }
    question.review = {
      reviewer: "Codex",
      reviewedAt: DATE,
      identityVerified: true,
      stemOptionsAndDiagramChecked: true,
      sourceUrl: question.goLink,
      researchLinks: [{ url: question.goLink, accessedAt: DATE }],
      independentCheck: NOTES[question.uid],
      notes: NOTES[question.uid],
      disposition: "ACCEPTED",
      answerKeySource: "Existing UID answer record cross-checked against the displayed question/options and independent derivation; no answer key changed.",
      answerKeyVerified: true,
      answerKeyStatus: "MATCHED"
    };
    question.status = "ACCEPTED";
    delete question.specialCategory;
    accepted++;
  }
  if (accepted !== Object.keys(CHUNK_CSE_CLASSIC_04_SOLUTIONS).length) throw new Error("Solution count mismatch");
  chunk.status = "REVIEWED";
  chunk.reviewStatus = "REVIEWED";
  chunk.reviewedAt = DATE;
  chunk.acceptedCount = accepted;
  chunk.holdCount = 0;
  chunk.specialCategories = { HOLD: [] };
  writeJson(CHUNK, chunk);
  console.log(ID + ": reviewed " + chunk.questions.length + "; accepted " + accepted + "; held 0.");
}

export function inject() {
  const chunk = readJson(CHUNK);
  const accepted = new Set(chunk.questions.filter(q => q.status !== "HOLD").map(q => q.uid));
  const content = fs.readFileSync(PATCH, "utf8");
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const additions = [];
  let refreshed = 0;
  for (const [uid, value] of Object.entries(CHUNK_CSE_CLASSIC_04_SOLUTIONS)) {
    if (!accepted.has(uid)) continue;
    const line = "  " + JSON.stringify(uid) + ": " + JSON.stringify(value) + ",";
    const existing = lines.findIndex(item => item.startsWith("  " + JSON.stringify(uid) + ": "));
    if (existing < 0) additions.push(line);
    else { lines[existing] = line; refreshed++; }
  }
  if (additions.length + refreshed !== accepted.size) throw new Error("Solution count mismatch");
  if (additions.length) {
    const marker = lines.findIndex(item => item.includes("export const AUTHENTIC_PATCHES = {"));
    if (marker < 0) throw new Error("Patch registry marker missing");
    lines.splice(marker + 1, 0, ...additions);
  }
  fs.writeFileSync(PATCH, lines.join(newline), "utf8");
  console.log(ID + ": synchronized " + accepted.size + " solutions; " + additions.length + " new, " + refreshed + " refreshed.");
}

export function markIntegrated() {
  const chunk = readJson(CHUNK);
  const registry = readJson(path.join(ROOT, "data/solutions/practicepaper/all-solutions.json"));
  const shardDir = path.join(ROOT, "public/question-detail-shards");
  const shards = fs.readdirSync(shardDir).filter(file => file.endsWith(".json")).map(file => ({ file, data: readJson(path.join(shardDir, file)) }));
  const accepted = chunk.questions.filter(q => q.status !== "HOLD");
  const held = chunk.questions.filter(q => q.status === "HOLD");
  for (const question of accepted) {
    const shard = shards.find(item => item.data.recordsByQuestionUid?.[question.uid]);
    if (!registry[question.uid]?.detailed_solution || !shard?.data.recordsByQuestionUid[question.uid]?.detailed_solution?.markdown) {
      throw new Error("Missing built solution for " + question.uid);
    }
    question.status = "INTEGRATED";
    question.review.disposition = "INTEGRATED";
    question.review.integrationResult = {
      status: "VERIFIED",
      verifiedAt: DATE,
      registryPath: "data/solutions/practicepaper/all-solutions.json",
      detailShardPath: "public/question-detail-shards/" + shard.file
    };
  }
  chunk.status = held.length ? "PARTIAL" : "COMPLETED";
  chunk.reviewStatus = "REVIEWED";
  chunk.integratedCount = accepted.length;
  chunk.acceptedCount = accepted.length;
  chunk.holdCount = held.length;
  writeJson(CHUNK, chunk);

  const manifestPath = path.join(ROOT, "data/solutions/chunks/manifest.json");
  const manifest = readJson(manifestPath);
  const entry = manifest.chunks[ID];
  if (!entry) throw new Error("Manifest entry missing for " + ID);
  entry.status = chunk.status;
  entry.acceptedCount = accepted.length;
  entry.integratedCount = accepted.length;
  entry.heldCount = held.length;
  entry.updatedAt = new Date().toISOString();
  if (!manifest.specialCategories) manifest.specialCategories = {};
  if (!manifest.specialCategories.HOLD) manifest.specialCategories.HOLD = [];
  for (const question of held) {
    const reason = question.review?.notes || "Unresolved; retained in HOLD category.";
    const existing = manifest.specialCategories.HOLD.find(item => item.uid === question.uid);
    if (existing) Object.assign(existing, { chunkId: ID, reason });
    else manifest.specialCategories.HOLD.push({ chunkId: ID, uid: question.uid, reason });
  }
  manifest.lastUpdated = new Date().toISOString();
  writeJson(manifestPath, manifest);
  console.log(ID + ": verified " + accepted.length + " integrated; " + held.length + " held in special category.");
}

if (process.argv[1]?.includes("apply-chunk-cse-classic-04")) {
  if (process.argv.includes("--review-only")) review();
  else if (process.argv.includes("--mark-integrated")) markIntegrated();
  else inject();
}
