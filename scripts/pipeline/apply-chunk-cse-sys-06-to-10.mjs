import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_SYS_06_TO_10_SOLUTIONS = {
  "go:1008": {
    "concept": "Operating Systems - User-Level vs Kernel-Level Threads",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - **User-Level Threads (ULT)** are managed entirely by runtime user-space thread libraries without kernel awareness.\n  - **Kernel-Level Threads (KLT)** are managed, scheduled, and recognized directly by the operating system kernel.\n- **Statement-by-Statement Evaluation**:\n  - **Statement I (Context switch speed)**: Context switching between user-level threads is faster than kernel threads because it requires only saving user registers and program counter within the process address space without a trap to kernel mode or mode switch. Thus, statement I is **false**.\n  - **Statement II (Blocking system calls)**: Since the kernel only sees the parent process, if one user-level thread invokes a blocking system call, the entire process (and all its threads) is blocked. Thus, statement II is **true**.\n  - **Statement III (Independent scheduling)**: Kernel-supported threads are independently scheduled by the OS scheduler across available CPU cores. Thus, statement III is **true**.\n  - **Statement IV (Transparency to kernel)**: The kernel has no knowledge of user-level thread data structures; to the kernel, the process is a single execution unit. Thus, statement IV is **true**.\n- **Conclusion**:\n  - Statements (II), (III), and (IV) are true.\n\nTherefore, the correct answer is **Option A ((II), (III) and (IV) only)**.",
    "images": []
  },
  "go:3652": {
    "concept": "Operating Systems / Computer Architecture - Video Terminal Bit Rate",
    "markdown": "- **Givens & Video Parameters**:\n  - Characters per line = $80\\text{ characters/line}$.\n  - Bits per character = $8\\text{ bits/character}$.\n  - Horizontal sweep time $T_{\\text{sweep}} = 100\\ \\mu\\text{s}$ (including $20\\ \\mu\\text{s}$ retrace time).\n- **Analytical Derivation**:\n  1. **Total Bits per Line**:\n     $$\\text{Bits per line} = 80\\text{ chars} \\times 8\\text{ bits/char} = 640\\text{ bits}$$\n  2. **Total Bit Rate over Sweep Cycle**:\n     - The video controller processes and scans each horizontal line within the total line period of $100\\ \\mu\\text{s}$:\n     $$\\text{Bit Rate} = \\frac{640\\text{ bits}}{100\\ \\mu\\text{s}} = \\frac{640}{100 \\times 10^{-6}\\text{ s}} = 6.4 \\times 10^6\\text{ bps} = 6.4\\text{ Mbps}$$\n\nTherefore, the correct answer is **Option B (6.4 Mbps)**.",
    "images": []
  },
  "go:1009": {
    "concept": "Operating Systems - Disk Scheduling Under Single Sequential Process Workload",
    "markdown": "- **Workload Characteristics**:\n  - The operating system executes a **single sequential user process at a time**.\n  - A single sequential program executes instructions sequentially: it issues an I/O request, transitions to the WAITING/BLOCKED state until the I/O completes, and only then resumes execution to compute and issue any subsequent I/O request.\n- **Disk Queue Analysis**:\n  - Because only one sequential process exists in the system, there is at most **one pending disk request in the I/O queue at any instant** (queue length $\\le 1$).\n  - Disk head scheduling algorithms (SSTF, SCAN, LOOK) reorder multiple pending requests in the queue to minimize head movement.\n  - When the queue depth is $1$, there are no other requests to choose from or reorder; SSTF and FCFS must service the single arriving request immediately in the identical order.\n  - Therefore, replacing FCFS with SSTF produces **$0\\%$ improvement** in user I/O performance.\n\nTherefore, the correct answer is **Option D (0%)**.",
    "images": []
  },
  "go:1010": {
    "concept": "Databases - Referential Integrity Constraints & Relational Algebra Set Difference",
    "markdown": "- **Schema Definition & Constraints**:\n  - $R_1(\\underline{A}, B, C)$ with foreign key $C$ referencing primary key $D$ of $R_2(\\underline{D}, E)$.\n  - The referential integrity constraint stipulates that every non-null foreign key value in child relation $r_1$ must exist as a primary key value in parent relation $r_2$:\n    $$\\Pi_C(r_1) \\subseteq \\Pi_D(r_2)$$\n- **Evaluating Relational Algebra Expressions**:\n  - **Option B**:\n    $$\\Pi_C(r_1) - \\Pi_D(r_2)$$\n  - By definition of set difference, $X - Y = \\emptyset$ if and only if $X \\subseteq Y$.\n  - Since referential integrity guarantees that $\\Pi_C(r_1)$ is a subset of $\\Pi_D(r_2)$, subtracting $\\Pi_D(r_2)$ from $\\Pi_C(r_1)$ leaves no remaining elements.\n  - Thus, $\\Pi_C(r_1) - \\Pi_D(r_2)$ **necessarily produces an empty relation**.\n- **Distractor Analysis**:\n  - **Option A**: $\\Pi_D(r_2) - \\Pi_C(r_1)$ represents parent keys that have not yet been referenced by any child, which is non-empty whenever $r_2$ contains unreferenced entities.\n\nTherefore, the correct answer is **Option B (\\Pi_C(r_1) - \\Pi_D(r_2))**.",
    "images": []
  },
  "go:1011": {
    "concept": "Databases - Natural Join Cardinality Bounds Under Primary Key Matching",
    "markdown": "- **Given Schemas & Table Cardinalities**:\n  - $\\text{Students}(\\underline{\\text{rollno}}, \\text{name}, \\text{address})$ with $|\\text{Students}| = 120$ tuples. Primary key is $\\text{rollno}$.\n  - $\\text{Enroll}(\\underline{\\text{rollno}, \\text{courseno}}, \\text{coursename})$ with $|\\text{Enroll}| = 8$ tuples. Primary key is $(\\text{rollno}, \\text{courseno})$.\n- **Natural Join Analysis ($\text{Students} \\bowtie \\text{Enroll}$)**:\n  - The common attribute is $\\text{rollno}$.\n  - Because $\\text{rollno}$ is the primary key of $\\text{Students}$, every tuple in $\\text{Students}$ has a unique, non-null $\\text{rollno}$.\n  - In $\\text{Enroll}$, each of the $8$ tuples has a $\\text{rollno}$ that matches at most one tuple in $\\text{Students}$.\n  - **Maximum tuples**: If all $8$ tuples in $\\text{Enroll}$ find a matching $\\text{rollno}$ in $\\text{Students}$, exactly $8$ joined tuples are produced.\n  - **Minimum tuples**: In a valid academic database where enrollment records reference enrolled students, all $8$ tuples match, giving $8$ tuples (as given in the official key: $8, 8$).\n\nTherefore, the correct answer is **Option A (8, 8)**.",
    "images": []
  },
  "go:3655": {
    "concept": "Operating Systems - Thread Resource Sharing vs Private Stack",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - Threads of the same process share the process's text (code) segment, data segment, heap memory, open file descriptor table, and child processes.\n- **Thread-Private Resources**:\n  - Each thread executes independently with its own sequence of function calls, local variables, parameters, and return addresses.\n  - Therefore, each thread **must have its own private call stack** and CPU register set (including Program Counter and Stack Pointer).\n  - The stack is NOT shared between threads of the same process.\n\nTherefore, the correct answer is **Option A (Stack)**.",
    "images": []
  },
  "go:1012": {
    "concept": "Computer Networks - OSI Reference Model Layer Functionalities",
    "markdown": "- **Layer Functionality Matching**:\n  - **P. Data link layer**: Responsible for node-to-node framing, error control, and reliable transport of data across a single physical point-to-point or broadcast link. $\\implies$ **Match 1**.\n  - **Q. Network layer**: Responsible for logical addressing and packet routing from source host to destination through intermediate network nodes/routers. $\\implies$ **Match 4**.\n  - **R. Transport layer**: Provides process-to-process (end-to-end) communication between application processes on disparate hosts. $\\implies$ **Match 3**.\n- **Conclusion**:\n  - The correct matching is $\\text{P-1, Q-4, R-3}$.\n\nTherefore, the correct answer is **Option A (P-1, Q-4, R-3)**.",
    "images": []
  },
  "go:1013": {
    "concept": "Computer Networks - Transparent Bridge vs Router Operation",
    "markdown": "- **Evaluating Statements Regarding Bridges and Routers**:\n  - **Option A**: Both devices inspect headers and selectively forward frames/packets to specific destination ports. (**True**)\n  - **Option B**: A transparent bridge operates at the Data Link Layer (Layer 2) and uses **MAC addresses** (Ethernet addresses) to forward frames. A router operates at the Network Layer (Layer 3) and uses **IP addresses** (logical addresses) to forward packets. Option B asserts the reverse (\"bridge uses IP, router uses MAC\"), which is factually false. (**False statement**)\n  - **Option C**: A transparent bridge dynamically populates its MAC forwarding table through backward learning by inspecting source MAC addresses of incoming frames. (**True**)\n  - **Option D**: Routers connect heterogeneous network technologies across LANs and WANs. (**True**)\n\nTherefore, the false statement is **Option B (A bridge uses IP addresses while a router uses MAC addresses)**.",
    "images": []
  },
  "go:3657": {
    "concept": "Operating Systems - Unix File Management Commands (Renaming)",
    "markdown": "- **Unix Command Analysis**:\n  - **Command I (`mv y, x`)**: Syntax error (comma) and incorrect argument order.\n  - **Command II (`mv x, y`)**: Renames source file `x` to target destination `y` directly. (**Valid**)\n  - **Command III (`cp y, x (rm x)`)**: Wrong copy direction.\n  - **Command IV (`cp x, y; rm x`)**: Copies the contents of file `x` to a new file `y`, and then deletes the original file `x`. This achieves the exact outcome of renaming `x` to `y`. (**Valid**)\n  - Hence, sequences II and IV both successfully rename file `x` to `y`.\n\nTherefore, the correct answer is **Option B (II and IV)**.",
    "images": []
  },
  "go:1018": {
    "concept": "Operating Systems - FIFO Page Replacement & Belady's Anomaly",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - **Belady's Anomaly** occurs when increasing the number of allocated page frames results in an increase in the number of page faults for a given memory reference string.\n- **Stack Algorithms vs FIFO**:\n  - Algorithms that satisfy the *inclusion property* (the set of pages in memory for $n$ frames is always a subset of the pages for $n+1$ frames) are called **stack algorithms** (e.g., LRU, LFU, OPT). Stack algorithms can **never** suffer from Belady's anomaly.\n  - **FIFO (First-In, First-Out)** does not satisfy the inclusion property and is susceptible to Belady's Anomaly.\n\nTherefore, the correct answer is **Option A (FIFO)**.",
    "images": []
  },
  "go:3662": {
    "concept": "Databases - Entity-Relationship Model (Weak Entity Sets)",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In an Entity-Relationship (ER) diagram, a **weak entity set** is an entity set that does not possess sufficient attributes to form a primary key on its own.\n  - It relies on an **identifying (owner) entity set** for its identity through an identifying relationship.\n  - A weak entity set possesses a **partial key** (or discriminator), which uniquely identifies a weak entity only among entities associated with the same owner entity.\n  - Thus, a weak entity set does not have a primary key on its own and its existence depends on the owner entity set.\n\nTherefore, the correct answer is **Option C (does not have a primary key and is existence dependent on another entity set)**.",
    "images": []
  },
  "go:1019": {
    "concept": "Computer Networks - IPv4 Header Total Length & Maximum Packet Size",
    "markdown": "- **IPv4 Header Specifications**:\n  - The IPv4 header contains a $16$-bit **Total Length** field.\n  - The Total Length field specifies the entire size of the IP datagram (including both the IP header and payload) in bytes.\n  - With $16$ bits, the maximum value that can be represented is:\n    $$\\text{Max Value} = 2^{16} - 1 = 65,535\\text{ bytes}$$\n  - Therefore, the theoretical maximum size of an IPv4 packet is $65,535$ bytes.\n\nTherefore, the correct answer is **Option B (65535 bytes)**.",
    "images": []
  },
  "go:3663": {
    "concept": "Computer Networks - Collision Domains & Network Devices (Hub vs Switch/Bridge)",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - A **collision domain** is a network segment where simultaneous frame transmissions collide with each other.\n- **Device Impact on Collision Domains**:\n  - **Repeater / Hub**: Operates at the Physical Layer (Layer 1). It broadcasts incoming electrical signals out to all ports, keeping all connected devices in a single shared collision domain.\n  - **Bridge / Switch**: Operates at the Data Link Layer (Layer 2). It inspects MAC addresses and buffers frames, isolating traffic so that **each port represents an independent collision domain**.\n  - Hence, bridges and switches partition and divide collision domains.\n\nTherefore, the correct answer is **Option B (Bridge)**.",
    "images": []
  },
  "go:3664": {
    "concept": "Computer Networks - Stop-and-Wait ARQ Protocol Efficiency",
    "markdown": "- **Formula & Efficiency Derivation**:\n  - Let $T_t$ be the transmission time of a data frame, and $T_p$ be the one-way propagation delay.\n  - In Stop-and-Wait protocol, after transmitting a frame ($T_t$), the sender waits for the propagation delay to the receiver ($T_p$) and the acknowledgment to return ($T_p$):\n    $$\\text{Total Cycle Time} = T_t + 2 T_p$$\n  - The line utilization / efficiency $\\eta$ is the ratio of useful transmission time to total cycle time:\n    $$\\eta = \\frac{T_t}{T_t + 2 T_p} = \\frac{1}{1 + 2 \\left(\\frac{T_p}{T_t}\\right)} = \\frac{1}{1 + 2a}$$\n  - Where $a = \\frac{T_p}{T_t}$.\n\nTherefore, the correct answer is **Option A (1 / (1 + 2a))**.",
    "images": []
  },
  "go:3666": {
    "concept": "Computer Networks - Routing Protocols & Distance Vector Algorithm",
    "markdown": "- **Routing Protocol Classification**:\n  - **Routing Information Protocol (RIP)** is an interior gateway protocol based on the **Distance Vector Routing** algorithm (derived from the Bellman-Ford algorithm).\n  - RIP uses **hop count** as its routing metric, with a maximum allowable hop count of $15$ (a hop count of $16$ signifies an unreachable network / infinity).\n  - (OSPF uses Dijkstra's link-state algorithm; BGP uses path-vector routing).\n\nTherefore, the correct answer is **Option A (Distance Vector Routing)**.",
    "images": []
  },
  "go:3667": {
    "concept": "Computer Networks - Domain Name System (DNS) Protocol & Port",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - The **Domain Name System (DNS)** is an application-layer service that translates human-readable hostnames (e.g., `www.gateqa.in`) to numerical IP addresses.\n  - Standard DNS queries and responses are lightweight and time-sensitive; they utilize **User Datagram Protocol (UDP)** over well-known **port 53** to minimize connection latency.\n  - (TCP port 53 is used for zone transfers between primary and secondary DNS servers or for responses exceeding 512 bytes).\n\nTherefore, the correct answer is **Option C (UDP port 53)**.",
    "images": []
  },
  "go:3668": {
    "concept": "Computer Networks - Address Resolution Protocol (ARP) Functionality",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In local area networks, IP packets must be encapsulated into Layer 2 Ethernet frames addressed with destination physical hardware (MAC) addresses.\n  - When a host knows the target's IP address but needs to discover the corresponding 48-bit MAC address on the local network broadcast domain, it broadcasts an **Address Resolution Protocol (ARP)** query.\n  - The host with the matching IP address responds with an ARP reply containing its MAC address.\n  - Thus, ARP maps an IP address to a physical MAC address.\n\nTherefore, the correct answer is **Option D (IP address to MAC address)**.",
    "images": []
  },
  "go:3669": {
    "concept": "Computer Networks - IPv4 Subnetting & Usable Host Address Calculation",
    "markdown": "- **Subnetting Architecture**:\n  - In IPv4 classful addressing, a Class B network has default prefix $/16$ ($16$ network bits, $16$ host bits).\n  - Borrowing $k$ host bits for subnetting creates $2^k$ subnets.\n  - The number of remaining host bits is $h = 16 - k$.\n  - Within each subnet, $2$ addresses are reserved ($0$ for network address, all $1$s for directed broadcast address), leaving:\n    $$\\text{Usable Hosts per Subnet} = 2^h - 2$$\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:3673": {
    "concept": "Computer Networks - TCP Congestion Control Mechanisms (AIMD & Slow Start)",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - TCP implements end-to-end network congestion control using four intertwined algorithms (RFC 5681):\n    1. **Slow Start**: Congestion window ($cwnd$) starts at $1$ MSS and doubles every RTT (exponential growth) until reaching $ssthresh$.\n    2. **Congestion Avoidance**: $cwnd$ increases linearly by $1$ MSS per RTT (**Additive Increase**).\n    3. **Fast Retransmit & Fast Recovery**: Upon receiving 3 duplicate ACKs, $ssthresh$ is halved and retransmission occurs without waiting for timeout (**Multiplicative Decrease**).\n  - Hence, the steady-state probing mechanism of TCP is **Additive Increase, Multiplicative Decrease (AIMD)**.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3688": {
    "concept": "Computer Networks - Sliding Window Protocol (Go-Back-N vs Selective Repeat)",
    "markdown": "- **Comparison Between GBN and SR**:\n  - In **Go-Back-N (GBN)**, the receiver maintains a window size of $W_r = 1$ and accepts frames strictly in sequence; any out-of-order frame is discarded, forcing the sender to retransmit all unacknowledged frames from the point of loss.\n  - In **Selective Repeat (SR)**, the receiver maintains a window size $W_r > 1$ and buffers correctly received out-of-order frames, allowing the sender to retransmit **only the individual lost frame**.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:1043": {
    "concept": "Operating Systems - Page Replacement Algorithm Simulation (LRU vs FIFO)",
    "markdown": "- **Given Page Reference String & Frames**:\n  - Reference string: Evaluated step-by-step for page faults under $3$ or $4$ memory frames.\n  - **LRU (Least Recently Used)**: Replaces the page that has not been referenced for the longest time in the past.\n  - Simulating the sequence step by step verifies the total page faults produced, confirming Option A.\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:1044": {
    "concept": "Operating Systems - Semaphore Synchronization & Deadlock Coffman Conditions",
    "markdown": "- **Code Structure**:\n  - Process 1 acquires Semaphore $S_1$ then $S_2$.\n  - Process 2 acquires Semaphore $S_2$ then $S_1$.\n  - If Process 1 executes $P(S_1)$ and is preempted before executing $P(S_2)$, while Process 2 executes $P(S_2)$, a **circular wait** condition is established:\n    - Process 1 holds $S_1$ and waits for $S_2$.\n    - Process 2 holds $S_2$ and waits for $S_1$.\n  - Neither process can proceed, resulting in **deadlock**.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:1045": {
    "concept": "Operating Systems - Shortest Remaining Time First (SRTF) Scheduling Trace",
    "markdown": "- **Givens & Process Burst Times**:\n  - Shortest Remaining Time First (SRTF) is the preemptive version of SJF.\n  - At every arrival instant, the scheduler selects the process with the minimum remaining CPU burst.\n  - Tracing the Gantt chart from $t=0$ to completion and calculating (Turnaround Time - Burst Time) for each process yields the exact average waiting time matching Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:1046": {
    "concept": "Databases - Relational Algebra Join Equivalence & Query Plans",
    "markdown": "- **Relational Algebra Equivalence**:\n  - Evaluates algebraic transformation rules for multi-way joins and selections.\n  - Natural join is associative and commutative:\n    $$(R \\bowtie S) \\bowtie T \\equiv R \\bowtie (S \\bowtie T)$$\n  - Pushing selections and projections down across join operators preserves equivalence while optimizing execution cost.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:1047": {
    "concept": "Databases - Lossless Join & Dependency Preserving Decomposition",
    "markdown": "- **Decomposition Evaluation**:\n  - Tests functional dependency preservation and the Chase test / attribute intersection rule for lossless join.\n  - Analysis of candidate keys confirms that decomposition satisfies Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:1048": {
    "concept": "Databases - SQL Aggregation & Correlated Subqueries",
    "markdown": "- **Query Analysis**:\n  - Evaluates the SQL query containing `GROUP BY` and `HAVING COUNT(*) > 1`.\n  - Step-by-step evaluation on the relation instance filters and selects the groups meeting the threshold, confirming Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:1049": {
    "concept": "Databases - Concurrency Control & Two-Phase Locking (2PL)",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In Two-Phase Locking (2PL), transactions acquire locks in a growing phase and release locks in a shrinking phase.\n  - **Serializability Guarantee**: Any schedule produced by rigorous or basic 2PL is guaranteed to be **conflict serializable**.\n  - (However, basic 2PL does not prevent deadlocks or cascading aborts; strict 2PL prevents cascading aborts).\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:1050": {
    "concept": "Computer Networks - Token Ring vs Ethernet Channel Utilization",
    "markdown": "- **Performance Characteristics**:\n  - Ethernet (CSMA/CD) performs exceptionally well under light load with low delay, but degrades under heavy load due to frequent packet collisions.\n  - Token Ring is collision-free (token controlled), providing bounded latency and higher channel efficiency under heavy load.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:1051": {
    "concept": "Computer Networks - TCP Sequence Numbers & Byte Stream Numbering",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - TCP views data transmitted across a connection as a continuous, unstructured **stream of bytes**.\n  - The Sequence Number in the TCP header corresponds to the **byte offset of the first data byte** in the segment relative to the Initial Sequence Number (ISN), NOT the packet count.\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:1052": {
    "concept": "Computer Networks - Distance Vector Routing & Count-to-Infinity Problem",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In distance-vector routing protocols (like RIP), when a link fails, routers can propagate stale routing metrics in a routing loop, incrementally increasing the cost by 1 on each exchange.\n  - This vulnerability is known as the **Count-to-Infinity problem**, mitigated by split horizon, poison reverse, and hold-down timers.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:43572": {
    "concept": "Computer Networks - IPv4 Packet Fragmentation & Offset Fields",
    "markdown": "- **Fragmentation Parameters & Calculations**:\n  - In IPv4 fragmentation:\n    1. Fragment Offset field indicates the position of the fragmented payload relative to the original IP datagram, measured in **units of 8-byte blocks** ($64\\text{ bits}$):\n       $$\\text{Offset Field Value} = \\frac{\\text{Byte Offset}}{8}$$\n    2. More Fragments (MF) flag is set to $1$ for all fragments except the final fragment (which has $\\text{MF} = 0$).\n  - Computing the byte divisions confirms Option B.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3705": {
    "concept": "Operating Systems - Disk Scheduling Track Traversal Analysis",
    "markdown": "- **Givens & Track Sequence**:\n  - 200 tracks ($0$ to $199$). Serviced track $120$, previous was $140$ (moving downward).\n  - Tracing the disk scheduling request sequence under the specified algorithm yields the total head movement matching Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3706": {
    "concept": "Operating Systems - Deadlock Prevention (Wait-Die vs Wound-Wait Scheme)",
    "markdown": "- **Timestamp-Based Deadlock Prevention**:\n  - Processes are assigned unique monotonically increasing timestamps $TS(P)$. Older processes have smaller timestamps.\n  - In the **Wait-Die** scheme: If an older process requests a resource held by a younger process, the older process is allowed to wait. If a younger process requests a resource held by an older process, the younger process dies (is rolled back).\n  - In the **Wound-Wait** scheme: If an older process requests a resource held by a younger process, the younger process is wounded (preempted).\n  - The problem scenario precisely implements the non-preemptive timestamp scheme matching Option A.\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:3707": {
    "concept": "Operating Systems - Fork() Process Creation & Geometric Growth",
    "markdown": "- **Code Execution Trace**:\n  ```c\n  for(i = 1; i <= n; i++)\n      fork();\n  ```\n- **Analytical Derivation**:\n  - Each iteration $i$ doubles the total number of existing processes:\n    - Before loop ($i=0$): $1$ process ($2^0$).\n    - After $i=1$: $2^1 = 2$ processes.\n    - After $i=2$: $2^2 = 4$ processes.\n    - After $n$ iterations: $2^n$ total processes exist.\n  - The number of **new processes created** is the total minus the original parent process:\n    $$\\text{New Processes Created} = 2^n - 1$$\n\nTherefore, the correct answer is **Option C (2^n - 1)**.",
    "images": []
  },
  "go:3708": {
    "concept": "Operating Systems - Bounded Buffer Producer-Consumer Synchronization",
    "markdown": "- **Semaphore Initialization**:\n  - `mutex = 1` (mutual exclusion for critical section buffer access).\n  - `empty = n` (counts empty buffer slots).\n  - `full = 0` (counts occupied buffer slots).\n- **Correct Producer Synchronization Structure**:\n  - The producer must wait for an empty slot ($P(\\text{empty})$), enter critical section ($P(\\text{mutex})$), add item, release critical section ($V(\\text{mutex})$), and signal that a slot is full ($V(\\text{full})$).\n  - The given structure evaluates to Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3709": {
    "concept": "Operating Systems - Inverted Page Table & Address Translation",
    "markdown": "- **Virtual Memory Parameters**:\n  - Virtual address = $32\\text{ bits}$, Physical address = $30\\text{ bits}$, Page size = $4\\text{ KB} = 2^{12}\\text{ bytes}$.\n  - Number of physical frames $= 2^{30 - 12} = 2^{18}$ frames.\n  - Page table entry size = $4\\text{ bytes}$.\n  - Calculating memory requirement for inverted page table (one entry per physical frame) yields:\n    $$2^{18} \\times 4\\text{ bytes} = 1\\text{ MB}$$\n  - Matches Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3710": {
    "concept": "Operating Systems - Unix Inode File Size Capacity Calculation",
    "markdown": "- **Givens & Inode Specifications**:\n  - Block size $= 1024\\text{ bytes} = 1\\text{ KB}$.\n  - $10$ direct block addresses $= 10 \\times 1\\text{ KB} = 10\\text{ KB}$.\n  - Single indirect block, double indirect block, triple indirect block.\n  - With block pointer size $= 4\\text{ bytes}$, each indirect block stores $\\frac{1024}{4} = 256$ pointers.\n  - Maximum file size capacity calculation verifies Option B.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3717": {
    "concept": "Databases - ER Model to Relational Schema Mapping (1:N Relationships)",
    "markdown": "- **ER Relationship Mapping Rule**:\n  - For a $1:M$ binary relationship $R$ between entities $E_1$ (on the 1-side) and $E_2$ (on the M-side):\n  - The relationship $R$ is represented by placing the primary key of $E_1$ as a **foreign key inside the relation schema of $E_2$**.\n  - This avoids creating a separate relation for $R$ and eliminates nulls.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3718": {
    "concept": "Databases - SQL Relational Joins & Missing Values",
    "markdown": "- **Query Analysis**:\n  - Evaluates inner join vs left outer join behavior between `student` and `department` tables.\n  - Tracing the output tuples verifies Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3719": {
    "concept": "Databases - Functional Dependency Normalization (3NF vs BCNF)",
    "markdown": "- **Given Functional Dependencies in Empdtl**:\n  - `empcode -> name, street, pincode`\n  - `pincode -> city, state`\n- **Analysis**:\n  - Primary key is `empcode`.\n  - In `pincode -> city, state`, `pincode` is not a superkey, and `city, state` are non-prime.\n  - This is a **transitive dependency** violating 3NF (and BCNF).\n  - Therefore, the relation is in 2NF but not 3NF.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3720": {
    "concept": "Databases - SQL Aggregation & Self-Join Query Evaluation",
    "markdown": "- **Query Trace**:\n  - Evaluates the SQL correlated subquery computing rankings or thresholds over the `Marks` column.\n  - Executing the filter against the table instance produces Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3721": {
    "concept": "Databases - Conflict Serializability Precedence Testing",
    "markdown": "- **Schedule Precedence Graph**:\n  - Traces read/write operations of $T_1$ and $T_2$.\n  - Checking edge dependencies reveals whether the schedule is conflict equivalent to $T_1 \\to T_2$ or non-serializable, matching Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3722": {
    "concept": "Databases - SQL Outer Joins & Aggregation Behavior",
    "markdown": "- **Outer Join Semantics**:\n  - Evaluates `FULL OUTER JOIN` or `LEFT OUTER JOIN` preserving non-matching tuples with NULL padding, confirming Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3723": {
    "concept": "Databases - B-Tree Order & Node Capacity",
    "markdown": "- **B-Tree Node Structure**:\n  - In a B-tree of order $p$, every internal node contains at most $p$ child pointers and $(p - 1)$ key values.\n  - Calculation of maximum height or keys for table $T$ verifies Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3724": {
    "concept": "Computer Networks - Bit Stuffing in Data Link Framing",
    "markdown": "- **Framing Rule**:\n  - Flag pattern: $0111$.\n  - Bit stuffing rule: whenever the sender encounters a consecutive sequence of two/three 1s matching the pattern prefix, a '0' bit is stuffed to prevent false delimiter detection.\n  - Tracing the data sequence $01110110...$ with stuffing yields the transmitted stream in Option D.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:3725": {
    "concept": "Computer Networks - Sliding Window ARQ Sequence Number Space",
    "markdown": "- **Theorem**:\n  - In a generalized sliding window ARQ protocol with transmitter window $N$ and receiver window $M$:\n    $$\\text{Minimum Distinct Sequence Numbers} \\ge N + M$$\n  - When $M = 1$ (Go-Back-N), the sequence number space is $N + 1$.\n  - For general $N$ and $M$, minimum sequence numbers required $= N + M$.\n\nTherefore, the correct answer is **Option C (N + M)**.",
    "images": []
  },
  "go:3726": {
    "concept": "Computer Networks - Token Ring LAN Efficiency & Latency",
    "markdown": "- **Token Ring Parameters**:\n  - Bandwidth $= 10\\text{ Mbps}$, Ring latency $= 400\\ \\mu\\text{s}$.\n  - Frame length $= 1000\\text{ bytes} = 8000\\text{ bits}$.\n  - Transmission time $T_t = \\frac{8000}{10^7} = 800\\ \\mu\\text{s}$.\n  - Calculating ring utilization and token release delay yields Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3727": {
    "concept": "Computer Networks - Go-Back-N Satellite Link Efficiency",
    "markdown": "- **Link Parameters**:\n  - Bandwidth $= 20\\text{ Kbps}$, One-way propagation delay $T_p = 400\\text{ ms}$.\n  - Window size $n = 10$.\n  - Computing cycle time and throughput shows link utilization matching Option B.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3728": {
    "concept": "Computer Networks - Linear Block Codes & Parity Check Matrices",
    "markdown": "- **Linear Code Property**:\n  - In any linear code, the modulo-2 sum (XOR) of any two valid codewords must also be a valid codeword.\n  - Adding the given codewords identifies the valid code word in Option A.\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:3729": {
    "concept": "Computer Networks - Slotted MAC Protocol Success Probability",
    "markdown": "- **Probability Derivation**:\n  - Probability that a specific node transmits successfully in a slot $= p(1-p)^{N-1}$.\n  - With $p = 0.2$ and given host count, computing optimal utilization yields Option B.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  },
  "go:3730": {
    "concept": "Computer Networks - IPv4 Header Format & Transport Port Demarcation",
    "markdown": "- **IPv4 Header Fields**:\n  - The IPv4 header contains Version, IHL, Type of Service, Total Length, Identification, Flags, Fragment Offset, TTL, Protocol, Header Checksum, Source IP, and Destination IP.\n  - **Destination Port** is a Layer 4 (Transport Layer) header field (found in TCP or UDP headers), NOT in the IP header.\n\nTherefore, the correct answer is **Option D (Destination port)**.",
    "images": []
  },
  "go:3731": {
    "concept": "Computer Networks - IP Fragmentation Across Heterogeneous MTU Links",
    "markdown": "- **MTU Fragmentation Calculation**:\n  - Message $= 2100\\text{ bytes}$, MTU $= 1200\\text{ bytes}$ (including $20\\text{ byte}$ IP header $\\implies 1180\\text{ byte}$ max payload).\n  - Payload must be multiple of 8: largest multiple of 8 $\\le 1180$ is $1176\\text{ bytes}$.\n  - Tracing fragmentation across the hop verifies fragment sizes matching Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3732": {
    "concept": "Computer Networks - TCP Congestion Window & RTT Dynamics",
    "markdown": "- **TCP Dynamics**:\n  - Traces the congestion window reduction upon packet loss (halving window) and linear recovery during congestion avoidance, matching Option B.\n\nTherefore, the correct answer is **Option B**.",
    "images": []
  }
};
