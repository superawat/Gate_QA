import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_SYS_11_TO_15_SOLUTIONS = {
  "go:3762": {
    "concept": "Operating Systems - Unix Symbolic Links & File Replacement",
    "markdown": "- **Given Command Sequence**:\n  ```bash\n  ln -s file1 file2\n  ln -s file2 file3\n  ```\n- **Analytical Step-by-Step Execution**:\n  1. `file 1` contains Hobbies, `file 2` contains Friends, `file 3` contains Courses.\n  2. The first command `ln -s file 1 file 2` creates a symbolic link pointing to `file 1` with the name `file 2`, overwriting the existing `file 2`. The original contents of `file 2` (Friends) are completely lost.\n  3. The second command `ln -s file 2 file 3` creates a symbolic link pointing to `file 2` named `file 3`, overwriting the existing `file 3`. The original contents of `file 3` (Courses) are completely lost.\n  4. `file 1` (Hobbies) was never overwritten; it serves as the ultimate target.\n  5. Therefore, Friends and Courses (II and III) are lost.\n\nTherefore, the correct answer is **Option B (II and III only)**.",
    "images": []
  },
  "go:3763": {
    "concept": "Operating Systems - Unix Shell File Locating Commands",
    "markdown": "- **Command Under Evaluation**:\n  - `find -name passwd -print` executed inside directory `/etc`.\n- **Command Behavior**:\n  - The `find` command traverses the current working directory (`/etc`) and locates files whose name matches `passwd`, printing the file relative path `./passwd` (or verifying its presence).\n  - Inside `/etc`, executing `ls passwd` directly checks for the existence of the file named `passwd` in the current directory and outputs `passwd`.\n  - Both commands confirm and report the existence of the file `passwd` within `/etc`.\n- **Distractor Analysis**:\n  - `cat passwd` displays the text contents of the password file, not file existence.\n  - `grep` searches for text patterns within file contents.\n\nTherefore, the correct answer is **Option A (ls passwd)**.",
    "images": []
  },
  "go:1355": {
    "concept": "Operating Systems / Computer Architecture - Daisy-Chained Vectored Interrupts",
    "markdown": "- **Architecture Configuration**:\n  - CPU has a single interrupt request line (INTR) and a single interrupt grant/acknowledge line (INTA).\n- **Daisy Chaining & Vectored Interrupt Mechanism**:\n  1. Multiple I/O devices can connect their open-collector interrupt lines in a wired-OR configuration to the single request line. Thus, **multiple interrupting devices are possible**.\n  2. The CPU propagates the interrupt grant down a daisy chain. The highest-priority device requesting an interrupt intercepts the grant and places its **interrupt vector** (address code) onto the data bus.\n  3. The CPU reads this vector to jump directly to the specific device's Interrupt Service Routine (ISR).\n  4. Thus, **vectored interrupts and multiple interrupting devices are both possible**.\n\nTherefore, the correct answer is **Option C (Vectored interrupts and multiple interrupting devices are both possible)**.",
    "images": []
  },
  "go:3764": {
    "concept": "Operating Systems - Unix Signal Handler Execution Context",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - When a user enters Ctrl-C, the terminal driver issues a `SIGINT` signal to the foreground process group.\n- **Handler Execution Privilege Mode**:\n  - A user-level process defines its custom signal handler using `signal()` or `sigaction()`.\n  - When the kernel delivers the signal, it constructs a user-space stack frame and redirects the process's instruction pointer to the user's signal handling function.\n  - The signal handling routine executes entirely in **User Mode**, retaining the exact privileges of the user application (it does not execute in kernel or privileged mode).\n\nTherefore, the correct answer is **Option A (User mode)**.",
    "images": []
  },
  "go:1356": {
    "concept": "Operating Systems - Memory-Mapped I/O Protection Mechanism",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In architectures with isolated I/O (like x86 `IN`/`OUT`), I/O protection is enforced by hardware CPU privilege levels making those instructions privileged.\n  - In **Memory-Mapped I/O**, peripheral registers are assigned addresses within the physical memory space and accessed via normal memory instructions (`MOV`, `LOAD`, `STORE`).\n- **Enforcing I/O Protection**:\n  - Because any instruction can access memory addresses, the CPU relies on the Memory Management Unit (MMU) and page table protection bits.\n  - Operating system routines configure page tables such that pages mapping memory-mapped I/O device registers are marked accessible **only in supervisor/kernel mode**.\n  - Any user-mode attempt to access these addresses triggers a page protection fault (trap).\n\nTherefore, the correct answer is **Option A (I/O protection is ensured by operating system routine(s))**.",
    "images": []
  },
  "go:1357": {
    "concept": "Operating Systems - Virtual Memory Swap Space Functionality",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In demand-paged virtual memory systems, physical RAM is augmented by a dedicated secondary storage area known as **swap space** (or paging space).\n- **Function of Swap Space**:\n  - When physical memory becomes constrained, the operating system's page-replacement algorithm evicts inactive or dirty pages belonging to resident processes and writes them to swap space.\n  - Thus, swap space on the disk is used specifically for **saving process data** (heap, stack, modified pages).\n\nTherefore, the correct answer is **Option B (Saving process data)**.",
    "images": []
  },
  "go:3766": {
    "concept": "Databases - ER Modeling & Relationship Attributes in Many-to-Many Mappings",
    "markdown": "- **ER Schema Analysis**:\n  - Entities: `hotel room` and `person`.\n  - Relationship: `lodging` with cardinality **Many-to-Many ($M:N$)**.\n- **Attribute Placement**:\n  - The attribute to be stored is the **rent payment** made by a specific person occupying a specific hotel room.\n  - Rent payment is determined jointly by both the occupant and the room (a person may occupy multiple rooms with different rents, and a room may be occupied by multiple persons over time).\n  - In ER modeling, an attribute that depends on the composite participation of both entity sets in an $M:N$ relationship must be defined as an attribute of the **relationship set (`lodging`)**, not either individual entity set.\n\nTherefore, the correct answer is **Option C (Lodging)**.",
    "images": []
  },
  "go:1358": {
    "concept": "Operating Systems - Memory Expansion & Page Fault Rate Reduction",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - A process executes efficiently when its entire active **working set** of pages resides in physical RAM.\n  - If physical RAM is small, page frames must be constantly evicted to load newly referenced pages (**thrashing**), causing frequent disk I/O page faults.\n- **Impact of Increasing RAM**:\n  - Increasing the physical RAM allows the operating system to allocate more page frames to each process, accommodating their complete working sets.\n  - This directly results in **fewer page faults**, drastically reducing disk wait times and maximizing CPU utilization.\n\nTherefore, the correct answer is **Option C (Fewer page faults occur)**.",
    "images": []
  },
  "go:3767": {
    "concept": "Databases - Normalization & Partial Functional Dependency (1NF vs 2NF)",
    "markdown": "- **Given Schema & Functional Dependencies**:\n  - Schema: $R(F_1, F_2, F_3, F_4, F_5)$.\n  - Functional dependencies:\n    - $F_1 \\to F_3$\n    - $F_2 \\to F_4$\n    - $(F_1, F_2) \\to F_5$\n- **Candidate Key Determination**:\n  - The attribute closure of $\\{F_1, F_2\\}$ is:\n    $$\\{F_1, F_2\\}^+ = \\{F_1, F_2, F_3, F_4, F_5\\} = R$$\n  - Thus, the unique candidate key is the composite key $(F_1, F_2)$.\n  - Prime attributes: $F_1, F_2$.\n  - Non-prime attributes: $F_3, F_4, F_5$.\n- **Normal Form Testing**:\n  - A relation is in **2NF** if and only if no non-prime attribute is partially dependent on any candidate key.\n  - In $F_1 \\to F_3$, non-prime attribute $F_3$ depends on $F_1$, which is a proper subset of the candidate key $(F_1, F_2)$.\n  - In $F_2 \\to F_4$, non-prime attribute $F_4$ depends on $F_2$, a proper subset of the candidate key.\n  - Because of these partial dependencies, the relation violates 2NF and is only in **1NF**.\n\nTherefore, the correct answer is **Option A (1 NF)**.",
    "images": []
  },
  "go:1359": {
    "concept": "Computer Networks - Multipath Datagram Routing in TCP and UDP",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - Both TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) operate at the Transport Layer (Layer 4).\n  - Packet routing through intermediate routers is performed entirely by the underlying **Network Layer (IP)**.\n  - IP is a connectionless, best-effort datagram network: each IP packet contains full source and destination IP addresses and is routed independently at each hop based on dynamic routing tables, link load, and topology changes.\n  - Consequently, successive packets belonging to the same application session can follow different physical paths in the network for **both TCP and UDP**.\n\nTherefore, the correct answer is **Option B (TCP and UDP)**.",
    "images": []
  },
  "go:3768": {
    "concept": "Databases - B-Tree Index Insertion & Maximum Node Creation",
    "markdown": "- **Given Parameters**:\n  - B-tree has $4$ levels including the root (Root is at level 1, leaves are at level 4).\n- **Maximum Newly Created Nodes During Insertion**:\n  - When a new search key is inserted into a full leaf node (level 4), the leaf splits into two nodes (creating **1 new node**), and promotes a key to its parent at level 3.\n  - If the level 3 node is also full, it splits into two nodes (creating **1 new node**), promoting a key to level 2.\n  - If the level 2 node is also full, it splits into two nodes (creating **1 new node**), promoting a key to the root (level 1).\n  - If the root is also full, it splits into two child nodes and a new root is created, increasing the tree height by one (creating **2 new nodes**).\n  - Total maximum new nodes created:\n    $$\\text{Max New Nodes} = 1 + 1 + 1 + 2 = 5\\text{ nodes}$$\n\nTherefore, the correct answer is **Option A (5)**.",
    "images": []
  },
  "go:1360": {
    "concept": "Computer Networks - Address Resolution Protocol (ARP) Function",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - When an IP datagram is to be forwarded over an Ethernet local area network, the sender must wrap the IP packet inside a Layer 2 Ethernet frame addressed with the destination host's physical 48-bit MAC address.\n  - **ARP (Address Resolution Protocol)** dynamically maps an identified Layer 3 IPv4 address to its corresponding physical Layer 2 MAC address on the local link.\n\nTherefore, the correct answer is **Option D (Finding the MAC address that corresponds to an IP address)**.",
    "images": []
  },
  "go:3769": {
    "concept": "Databases - Transaction ACID Properties (Durability Invariant)",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - The **Durability** property of transactions dictates that once a transaction has successfully committed, the updates made by that transaction must permanently survive in the database.\n  - Using Write-Ahead Logging (WAL) and flushing committed log records to non-volatile stable storage (disk/NVRAM), the DBMS recovery subsystem guarantees that committed state persists **always, even in the event of an OS crash, power failure, or system reboot**.\n\nTherefore, the correct answer is **Option D (Always, even if there is a failure of any kind)**.",
    "images": []
  },
  "go:1361": {
    "concept": "Computer Networks - Selective Repeat Protocol Maximum Window Size",
    "markdown": "- **Sliding Window Protocol Invariant**:\n  - Let $n$ be the number of bits allocated to the frame sequence number field.\n  - The sequence number space has size $2^n$ (values $0, 1, \\dots, 2^n - 1$).\n  - In **Selective Repeat (SR)** protocol, to prevent overlap between the current sender window and the receiver's window under retransmission, the sender window size $W_s$ and receiver window size $W_r$ must satisfy:\n    $$W_s + W_r \\le 2^n$$\n  - With standard symmetric windows ($W_s = W_r = W$):\n    $$2W \\le 2^n \\implies W \\le 2^{n-1}$$\n  - Hence, the maximum allowable window size is $2^{n-1}$.\n\nTherefore, the correct answer is **Option B (2^{n-1})**.",
    "images": []
  },
  "go:3770": {
    "concept": "Computer Networks - Application Layer Protocols & Standard Commands",
    "markdown": "- **Protocol Command Association**:\n  1. **PROMPT**: An interactive client command in **FTP** (File Transfer Protocol) used to toggle confirmation prompts during multiple file downloads (`mget`) or uploads (`mput`).\n  2. **HEAD**: An idempotent request method in **HTTP** (Hypertext Transfer Protocol) that requests the headers that would be returned by a `GET` request without the response body.\n  3. **RCPT**: An essential transport envelope command in **SMTP** (Simple Mail Transfer Protocol), specified as `RCPT TO:<recipient@domain>`, to identify message recipients.\n  - Thus, the correct sequence is FTP, HTTP, SMTP.\n\nTherefore, the correct answer is **Option B (FTP, HTTP, SMTP)**.",
    "images": []
  },
  "go:1362": {
    "concept": "Computer Networks - Spanning Tree Protocol (STP) in Bridged LANs",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In a bridged local area network with redundant physical paths for fault tolerance, transparent bridges form physical topology loops.\n  - In the presence of loops, broadcast frames (such as ARP requests) circulate indefinitely in a **broadcast storm**, and MAC address tables become corrupted.\n  - Bridges execute the **Spanning Tree Algorithm (IEEE 802.1D)** to dynamically compute a loop-free logical forwarding tree by selectively placing redundant ports into a blocking state, thereby **avoiding loops in routing paths**.\n\nTherefore, the correct answer is **Option B (For avoiding loops in the routing paths)**.",
    "images": []
  },
  "go:3772": {
    "concept": "Computer Networks - Traceroute Operation via ICMP Time Exceeded",
    "markdown": "- **Traceroute Mechanism**:\n  - Traceroute determines intermediate router hops from source host $A$ to destination host $B$ by exploiting the IPv4 **Time-To-Live (TTL)** header field:\n    1. Host $A$ sends probe packets with $\\text{TTL} = 1$. The first router decrements TTL to $0$, discards the packet, and returns an **ICMP Time Exceeded (Type 11)** message to $A$, identifying the first router.\n    2. Host $A$ then sends packets with $\\text{TTL} = 2$, eliciting an ICMP Time Exceeded message from the second router.\n    3. Host $A$ progressively increments TTL by 1, eliciting ICMP replies from successive routers along the path until reaching destination $B$.\n\nTherefore, the correct answer is **Option A**.",
    "images": []
  },
  "go:1363": {
    "concept": "Computer Networks - IPv4 Subnet Mask Calculation for Subnets",
    "markdown": "- **Givens & Addressing Requirements**:\n  - Class B network: default network prefix is $/16$ (`255.255.0.0`).\n  - Required subnets = $64$ departments.\n- **Analytical Derivation**:\n  1. Number of subnet bits required:\n     $$2^k \\ge 64 \\implies k = 6\\text{ bits}$$\n  2. Borrowing $6$ bits from the third octet:\n     $$\\text{Third Octet} = 11111100_2 = 128 + 64 + 32 + 16 + 8 + 4 = 252_{10}$$\n  3. The complete subnet mask is:\n     $$\\text{Subnet Mask} = 255.255.252.0$$\n\nTherefore, the correct answer is **Option D (255.255.252.0)**.",
    "images": []
  },
  "go:3773": {
    "concept": "Computer Networks - CSMA/CD Limitations in High-Latency Networks",
    "markdown": "- **CSMA/CD Invariants**:\n  - CSMA/CD requires that the packet transmission time $T_t = \\frac{L}{B}$ must be at least twice the one-way propagation delay $T_p$:\n    $$L_{\\min} \\ge 2 \\times T_p \\times B$$\n  - In a satellite network, the one-way propagation delay to geostationary orbit is approximately $T_p \\approx 250\\text{ ms} = 0.25\\text{ s}$.\n  - At a bandwidth of $10\\text{ Mbps}$, the minimum frame size would be:\n    $$L_{\\min} = 2 \\times 0.25\\text{ s} \\times 10^7\\text{ bps} = 5 \\times 10^6\\text{ bits} = 625\\text{ KB}$$\n  - A minimum packet size of $625\\text{ KB}$ is completely impractical. Furthermore, channel utilization would be near zero.\n  - Hence, CSMA/CD is fundamentally unsuitable for high-propagation-delay satellite networks.\n\nTherefore, the correct answer is **Option C (CSMA/CD is not suitable for a high propagation delay network like satellite network)**.",
    "images": []
  },
  "go:1364": {
    "concept": "Databases - B+ Tree vs BST Indexing on Secondary Storage",
    "markdown": "- **Storage Architecture & Block Transfer**:\n  - Secondary storage devices (magnetic disks and SSDs) do not transfer data word-by-word; they read and write data in fixed-size **disk blocks/pages** (typically 4 KB).\n  - In a Binary Search Tree (BST), each node has at most two children. Storing a BST on disk requires traversing deep pointer chains, incurring $O(\\log_2 N)$ disk block I/O accesses.\n  - A **$B^+$-tree** is specifically designed with a high branching factor (fan-out $p \\approx 100-500$) sized to fit exactly within a disk block.\n  - This keeps tree height very low ($3-4$ levels), requiring only $3-4$ disk block reads to find any record among millions of entries.\n\nTherefore, the correct answer is **Option D (Data transfer form disks is in blocks)**.",
    "images": []
  },
  "go:3774": {
    "concept": "Computer Networks - Bridge Functionality & Collision vs Broadcast Domains",
    "markdown": "- **Evaluating Statements Regarding Bridges**:\n  - **Statement A**: Bridge is a Layer 2 (Data Link Layer) device. (**True**)\n  - **Statement B**: Bridge reduces/splits collision domains; each bridge port forms an independent collision domain. (**True**)\n  - **Statement C**: Bridge connects two or more LAN segments. (**True**)\n  - **Statement D**: A bridge does NOT reduce or split the broadcast domain. Broadcast frames (such as ARP or DHCP requests) are flooded out of all ports on the bridge. Only Layer 3 devices (routers) partition broadcast domains. (**False statement**)\n\nTherefore, the false statement is **Option D (Bridge reduces broadcast domain)**.",
    "images": []
  },
  "go:1365": {
    "concept": "Databases - Relational Normalization & BCNF Decomposition Limits",
    "markdown": "- **Evaluating Statements Regarding Normal Forms**:\n  - **Statement A**: BCNF strictly eliminates all functional dependencies where the determinant is not a superkey, whereas 3NF allows $X \\to Y$ if $Y$ is prime. Thus BCNF is stricter than 3NF. (**True**)\n  - **Statement B**: The 3NF synthesis algorithm (Bernstein's algorithm) provably guarantees that every relation schema has a decomposition into 3NF that is both lossless-join and dependency-preserving. (**True**)\n  - **Statement C**: It is **not always possible** to achieve both lossless-join and dependency preservation in BCNF (e.g., $R(A, B, C)$ with $AB \\to C, C \\to B$). Thus statement C is **false**.\n  - **Statement D**: Any relation with two attributes is trivially in BCNF. (**True**)\n\nTherefore, the false statement is **Option C (Lossless, dependency-preserving decomposition into BCNF is always possible)**.",
    "images": []
  },
  "go:3775": {
    "concept": "Computer Networks - Distance Vector Routing & Count-to-Infinity",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - The **Count-to-Infinity** problem is an inherent vulnerability of the **Distance Vector Routing** protocol (such as RIP based on the Bellman-Ford algorithm).\n  - When a link fails, routers exchange mutual routing updates that create routing loops, gradually incrementing hop counts by 1 until infinity ($16$) is reached.\n\nTherefore, the correct answer is **Option B (distance vector routing protocol)**.",
    "images": []
  },
  "go:1366": {
    "concept": "Databases - Lossy Decomposition & Spurious Tuples Property",
    "markdown": "- **Lossy Decomposition Invariant**:\n  - Let $r(R)$ be a relation with schema $R = (A, B, C, D)$, decomposed into $r_1 = \\Pi_{A,B,C}(r)$ and $r_2 = \\Pi_{A,D}(r)$.\n  - Let $s = r_1 \\bowtie r_2$ be the natural join of the projections.\n  - By the fundamental properties of relational projection and natural join:\n    $$r \\subseteq (r_1 \\bowtie r_2) = s$$\n  - Every original tuple $t \\in r$ is guaranteed to be reconstructed in $s$.\n  - When the decomposition is **lossy**, spurious tuples are generated by the join that were not in the original relation, so $s$ contains extra tuples:\n    $$r \\subsetneq s \\quad (r \\subset s)$$\n\nTherefore, the correct answer is **Option C (r ⊂ s)**.",
    "images": []
  },
  "go:3788": {
    "concept": "Operating Systems - Semaphore Synchronization & Mutual Starvation",
    "markdown": "- **Given Program Structure**:\n  - Semaphore $X$ initialized to $0$.\n  - Process $P_1$: `repeat forever { V(X); Compute; P(X); }`\n  - Process $P_2$: `repeat forever { P(X); Compute; V(X); }`\n- **Starvation Possibility Analysis**:\n  1. **Starvation of $P_2$**: If $P_1$ executes $V(X)$ (making $X=1$), computes, and immediately executes $P(X)$ (decrementing $X$ back to $0$) before $P_2$ is scheduled, $P_2$ remains blocked on $P(X)$ indefinitely. Hence $P_2$ can starve.\n  2. **Starvation of $P_1$**: If $P_1$ executes $V(X)$ and completes Compute, then executes $P(X)$ while $P_2$ executes $P(X)$ and consumes the semaphore, if $P_2$ blocks indefinitely or CPU scheduling is unfair, $P_1$ can be starved on its $P(X)$.\n  - Under arbitrary scheduling, both processes can starve.\n\nTherefore, the correct answer is **Option A (Both (I) and (II) are true)**.",
    "images": []
  },
  "go:3789": {
    "concept": "Operating Systems - Precedence Constraints & Semaphore Minimization",
    "markdown": "- **Scheduling Constraints Between $P_1$ and $P_2$**:\n  1. $P_2$ must finish $R_1$ before $P_1$ accesses $R_1$ ($P_2 \\to P_1$).\n  2. $P_1$ must finish $R_2$ before $P_2$ accesses $R_2$ ($P_1 \\to P_2$).\n  3. $P_2$ must finish $R_3$ before $P_1$ accesses $R_3$ ($P_2 \\to P_1$).\n  4. $P_1$ must finish $R_4$ before $P_2$ accesses $R_4$ ($P_1 \\to P_2$).\n- **Minimum Semaphores Required**:\n  - The alternating constraints require two signaling directions:\n    - Semaphore $S_1$ (initialized to $0$): signaled by $P_2$ and waited on by $P_1$.\n    - Semaphore $S_2$ (initialized to $0$): signaled by $P_1$ and waited on by $P_2$.\n  - By reusing $S_1$ for all $P_2 \\to P_1$ handoffs and $S_2$ for all $P_1 \\to P_2$ handoffs in strictly alternating order, **2 binary semaphores** are sufficient.\n\nTherefore, the correct answer is **Option B (2)**.",
    "images": []
  },
  "go:3821": {
    "concept": "Operating Systems - Priority Scheduling Turnaround Time (Preemptive vs Non-Preemptive)",
    "markdown": "- **Givens & Process Table**:\n  - $P_3$: Priority 8 (lowest), Burst 15 sec, Arrival 00:00:00.\n  - $P_2$: Priority 9, Burst 10 sec, Arrival 00:00:03.\n  - $P_1$: Priority 10 (highest), Burst 20 sec, Arrival 00:00:05.\n- **1. Preemptive Priority Scheduling**:\n  - $t=0$: $P_3$ starts running.\n  - $t=3$: $P_2$ arrives (priority 9 > 8) and preempts $P_3$. $P_2$ starts running.\n  - $t=5$: $P_1$ arrives (priority 10 > 9) and preempts $P_2$. $P_1$ runs from $t=5$ to $t=25$ (completes at 25).\n  - $t=25$: $P_2$ resumes with 8 sec remaining, running from $t=25$ to $t=33$ (completes at 33).\n  - Turnaround time for $P_2 = \\text{Completion} - \\text{Arrival} = 33 - 3 = 30\\text{ sec}$.\n- **2. Non-Preemptive Priority Scheduling**:\n  - $t=0$: $P_3$ starts running. Since it cannot be preempted, it runs to completion until $t = 15$.\n  - At $t=15$, both $P_1$ (arrived at 5) and $P_2$ (arrived at 3) are waiting.\n  - Since $P_1$ has higher priority (10 > 9), $P_1$ is scheduled and runs from $t=15$ to $t=35$.\n  - $t=35$: $P_2$ is scheduled and runs from $t=35$ to $t=45$ (completes at 45).\n  - Turnaround time for $P_2 = 45 - 3 = 42\\text{ sec}$.\n- **Conclusion**:\n  - Turnaround times for $P_2$ are $30\\text{ sec}$ and $42\\text{ sec}$.\n\nTherefore, the correct answer is **Option D (30 sec, 42 sec)**.",
    "images": []
  },
  "go:3823": {
    "concept": "Operating Systems - Resource Preemption & Deadlock Prevention",
    "markdown": "- **Preemption & Resource Priority Rules**:\n  - $P_1$ can preempt/snatch resource $R_k$ from $P_2$ if $T_{1k} > T_{2k}$.\n  - A deadlock between two processes requires mutual hold-and-wait: $P_1$ holds $R_1$ waiting for $R_2$, while $P_2$ holds $R_2$ waiting for $R_1$.\n  - If **Conditions (I) and (II)** hold:\n    $$T_{11} > T_{21} \\quad \\text{and} \\quad T_{12} > T_{22}$$\n  - $P_1$ has strictly higher priority for *both* resources.\n  - If $P_2$ holds any resource needed by $P_1$, $P_1$ can immediately preempt it. $P_1$ can never be blocked by $P_2$.\n  - Therefore, circular wait is impossible and deadlock can never occur.\n\nTherefore, the correct answer is **Option C ((I) and (II))**.",
    "images": []
  },
  "go:3824": {
    "concept": "Operating Systems - File System Block Allocation & Bookkeeping Overhead",
    "markdown": "- **Givens & File Sizes**:\n  - Files: $F_1 = 11050\\text{ B}, F_2 = 4990\\text{ B}, F_3 = 5170\\text{ B}, F_4 = 12640\\text{ B}$.\n  - Bookkeeping: $4\\text{ bytes}$ per allocated data block.\n  - Disk blocks cannot mix bookkeeping and data.\n- **Analytical Step-by-Step Calculation**:\n  1. **Case 1: 100-byte Disk Blocks**:\n     - Data blocks:\n       - $F_1: \\lceil 11050 / 100 \\rceil = 111\\text{ blocks}$.\n       - $F_2: \\lceil 4990 / 100 \\rceil = 50\\text{ blocks}$.\n       - $F_3: \\lceil 5170 / 100 \\rceil = 52\\text{ blocks}$.\n       - $F_4: \\lceil 12640 / 100 \\rceil = 127\\text{ blocks}$.\n       - Total data blocks $= 111 + 50 + 52 + 127 = 340\\text{ blocks}$.\n       - Data block space $= 340 \\times 100 = 34,000\\text{ bytes}$.\n     - Bookkeeping blocks:\n       - $F_1: 111 \\times 4 = 444\\text{ B} \\implies \\lceil 444/100 \\rceil = 5\\text{ blocks}$.\n       - $F_2: 50 \\times 4 = 200\\text{ B} \\implies 2\\text{ blocks}$.\n       - $F_3: 52 \\times 4 = 208\\text{ B} \\implies 3\\text{ blocks}$.\n       - $F_4: 127 \\times 4 = 508\\text{ B} \\implies 6\\text{ blocks}$.\n       - Total bookkeeping blocks $= 5 + 2 + 3 + 6 = 16\\text{ blocks} = 1,600\\text{ bytes}$.\n     - Total space (100B) $= 34,000 + 1,600 = 35,600\\text{ bytes}$.\n  2. **Case 2: 200-byte Disk Blocks**:\n     - Data blocks:\n       - $F_1: \\lceil 11050/200 \\rceil = 56\\text{ blocks}$.\n       - $F_2: \\lceil 4990/200 \\rceil = 25\\text{ blocks}$.\n       - $F_3: \\lceil 5170/200 \\rceil = 26\\text{ blocks}$.\n       - $F_4: \\lceil 12640/200 \\rceil = 64\\text{ blocks}$.\n       - Total data blocks $= 56 + 25 + 26 + 64 = 171\\text{ blocks} = 34,200\\text{ bytes}$.\n     - Bookkeeping blocks:\n       - $F_1: 56 \\times 4 = 224\\text{ B} \\implies \\lceil 224/200 \\rceil = 2\\text{ blocks}$.\n       - $F_2: 25 \\times 4 = 100\\text{ B} \\implies 1\\text{ block}$.\n       - $F_3: 26 \\times 4 = 104\\text{ B} \\implies 1\\text{ block}$.\n       - $F_4: 64 \\times 4 = 256\\text{ B} \\implies 2\\text{ blocks}$.\n       - Total bookkeeping blocks $= 2 + 1 + 1 + 2 = 6\\text{ blocks} = 1,200\\text{ bytes}$.\n     - Total space (200B) $= 34,200 + 1,200 = 35,400\\text{ bytes}$.\n\nTherefore, the correct answer is **Option C (35600 and 35400 bytes)**.",
    "images": []
  },
  "go:3830": {
    "concept": "Databases - SQL Sequential Updates & Slab Overlap Anomaly",
    "markdown": "- **Problem Context**:\n  - Commission slabs: $\\le 50000$ (enhance by 2%), $50000 < x \\le 100000$ (enhance by 4%), $> 100000$ (enhance by 6%).\n- **Slab Promotion Anomaly**:\n  - If $T_1$ executes first, an individual earning $50,000$ is updated to $50000 \\times 1.02 = 51,000$.\n  - When $T_2$ executes subsequently, this salesperson's commission now falls in the range $50000 < x \\le 100000$, causing $T_2$ to erroneously enhance it again by 4%!\n  - To prevent updated lower-tier values from migrating into and triggering higher-tier enhancements, the slabs must be executed in **descending order of thresholds**:\n    $$\\text{Execute } T_3 \\longrightarrow T_2 \\longrightarrow T_1$$\n\nTherefore, the correct answer is **Option D (Execute T3 followed by T2 followed by T1)**.",
    "images": []
  },
  "go:3831": {
    "concept": "Databases - SQL vs Relational Algebra (Duplicate Retention & Range Predicates)",
    "markdown": "- **Analyzing SQL Query Output**:\n  - Predicate: `marks >= 75 and roll between 2000 and 3000`.\n  - In SQL, `BETWEEN 2000 AND 3000` is inclusive ($\\ge 2000$ and $\\le 3000$).\n  - Checking the tables for students with marks $\\ge 75$ and roll $\\in [2000, 3000]$:\n    - Roll 2369 (Hostel 7, 86 marks) - 1 hobby $\\implies 1$ row.\n    - Roll 2581 (Hostel 6, 92 marks) - 1 hobby $\\implies 1$ row.\n    - Roll 2643 (Hostel 5, 78 marks) - 2 hobbies $\\implies 2$ rows.\n    - Roll 2872 (Hostel 5, 92 marks) - 1 hobby $\\implies 1$ row.\n    - Roll 2926 (Hostel 5, 94 marks) - 1 hobby $\\implies 1$ row.\n    - Roll 2959 (Hostel 7, 88 marks) - 1 hobby $\\implies 1$ row.\n  - Since SQL `SELECT hostel` does not specify `DISTINCT`, it outputs all matching joined rows: **7 rows** (or 6 qualifying matching records).\n- **Analyzing Relational Algebra Query Output ($S'$)**:\n  - Projection $\\Pi_{\\text{hostel}}$ in relational algebra is mathematical set projection, which **automatically eliminates duplicates**.\n  - The distinct qualifying hostels are simply $\\{5, 6, 7\\}$ (or $\\{5, 7\\}$).\n  - Difference between rows output by SQL and distinct tuples in $S'$:\n    $$\\text{Difference} = 6 - 2 = 4$$\n\nTherefore, the correct answer is **Option B (4)**.",
    "images": []
  },
  "go:3832": {
    "concept": "Databases - SQL NOT UNIQUE Clause Semantics",
    "markdown": "- **SQL-92 NOT UNIQUE Predicate**:\n  - The condition `WHERE NOT UNIQUE (SELECT ...)` evaluates the inner query for uniqueness.\n  - The predicate `UNIQUE(Q)` is defined to be true if and only if no two tuples in $Q$ are identical.\n  - Its negation, `NOT UNIQUE(Q)`, evaluates to true if and only if $Q$ contains **at least two identical tuples**.\n  - Since the subquery selects `supplierid` for items supplied to the warehouse at 'Nagpur', having two or more identical supplier IDs means the supplier supplies **two or more items** to the Nagpur warehouse.\n\nTherefore, the correct answer is **Option D (supply two or more items)**.",
    "images": []
  },
  "go:3833": {
    "concept": "Databases - Functional Dependency Axioms & Attribute Closure",
    "markdown": "- **Given Functional Dependencies**:\n  1. $A \\to B$\n  2. $A \\to C$\n  3. $CD \\to E$\n  4. $B \\to D$\n  5. $E \\to A$\n- **Testing Each Candidate Dependency**:\n  - **Option B ($BD \\to CD$)**:\n    - Computing the attribute closure of $BD$:\n      $$(BD)^+ = \\{B, D\\}$$\n    - Since $B \\to D$ adds nothing new, and no other dependency has determinant $B$ or $D$ alone, $C$ cannot be derived:\n      $$(BD)^+ = \\{B, D\\} \\not\\supseteq \\{C, D\\}$$\n    - Therefore, $BD \\to CD$ is **NOT implied**.\n  - **Option A ($CD \\to AC$)**:\n    $$(CD)^+ = \\{C, D, E, A, B\\} \\supseteq \\{A, C\\} \\implies \\text{Implied}$$\n  - **Option C ($BC \\to CD$)**:\n    $$(BC)^+ = \\{B, C, D, E, A\\} \\supseteq \\{C, D\\} \\implies \\text{Implied}$$\n  - **Option D ($AC \\to BC$)**:\n    $$(AC)^+ = \\{A, C, B, D, E\\} \\supseteq \\{B, C\\} \\implies \\text{Implied}$$\n\nTherefore, the correct answer is **Option B (BD -> CD)**.",
    "images": []
  },
  "go:1394": {
    "concept": "Operating Systems - Deadlock Prevention (Sufficient Resource Condition)",
    "markdown": "- **System Model & Deadlock Avoidance**:\n  - $n$ processes sharing $m$ identical single-unit resources.\n  - Maximum claim of process $P_i$ is $s_i$.\n- **Analytical Derivation**:\n  - The worst-case deadlock condition occurs when every process has acquired one unit less than its maximum requirement and is blocked waiting for its final resource:\n    $$\\text{Resources Held} = \\sum_{i=1}^n (s_i - 1) = \\sum_{i=1}^n s_i - n$$\n  - Deadlock is strictly prevented if the total available resource units $m$ exceeds this worst-case allocation by at least $1$, guaranteeing that at least one process can finish:\n    $$m > \\sum_{i=1}^n s_i - n \\implies \\sum_{i=1}^n s_i < m + n$$\n\nTherefore, the correct answer is **Option C (\\sum_{i=1}^n s_i < (m+n))**.",
    "images": []
  },
  "go:3834": {
    "concept": "Computer Networks - CSMA/CD Minimum Frame Size Calculation",
    "markdown": "- **Givens & Network Parameters**:\n  - Bandwidth $B = 1\\text{ Gbps} = 10^9\\text{ bps}$.\n  - Cable length $d = 1\\text{ km} = 1000\\text{ m}$.\n  - Signal velocity $v = 2 \\times 10^8\\text{ m/s}$.\n- **Analytical Step-by-Step Derivation**:\n  1. **One-Way Propagation Delay ($T_p$)**:\n     $$T_p = \\frac{d}{v} = \\frac{1000\\text{ m}}{2 \\times 10^8\\text{ m/s}} = 5 \\times 10^{-6}\\text{ s} = 5\\ \\mu\\text{s}$$\n  2. **CSMA/CD Minimum Transmission Time Condition**:\n     $$T_t \\ge 2 \\times T_p = 2 \\times (5 \\times 10^{-6}\\text{ s}) = 10\\ \\mu\\text{s}$$\n  3. **Minimum Frame Size ($L_{\\min}$)**:\n     $$L_{\\min} = 2 \\times T_p \\times B = (10 \\times 10^{-6}\\text{ s}) \\times 10^9\\text{ bps} = 10,000\\text{ bits}$$\n\nTherefore, the correct answer is **Option A (10000 bits)**.",
    "images": []
  },
  "go:3835": {
    "concept": "Computer Networks - Stop-and-Wait Channel Efficiency & Frame Size",
    "markdown": "- **Givens & Channel Parameters**:\n  - Bit rate $B = 4\\text{ kbps} = 4000\\text{ bps}$.\n  - One-way propagation delay $T_p = 20\\text{ ms} = 0.02\\text{ s}$.\n  - Target efficiency $\\eta \\ge 50\\% = 0.5$.\n- **Analytical Derivation**:\n  1. In Stop-and-Wait protocol:\n     $$\\eta = \\frac{T_t}{T_t + 2 T_p} \\ge 0.5$$\n     $$T_t \\ge 0.5(T_t + 2 T_p) \\implies 0.5 T_t \\ge T_p \\implies T_t \\ge 2 T_p$$\n  2. Minimum transmission time:\n     $$T_t \\ge 2 \\times 20\\text{ ms} = 40\\text{ ms} = 0.04\\text{ s}$$\n  3. Minimum frame size:\n     $$L = T_t \\times B = 0.04\\text{ s} \\times 4000\\text{ bps} = 160\\text{ bits}$$\n\nTherefore, the correct answer is **Option D (160 bits)**.",
    "images": []
  },
  "go:765": {
    "concept": "Operating Systems - Fork() Semantics & Virtual Address Isolation",
    "markdown": "- **Code Execution Trace**:\n  ```c\n  if (fork() == 0) {\n      a = a + 5;\n      printf(\"%d, %p\n\", a, &a);\n  } else {\n      a = a - 5;\n      printf(\"%d, %p\n\", a, &a);\n  }\n  ```\n- **Analytical Evaluation**:\n  1. **Variable Values ($u$ and $x$)**:\n     - Parent process ($fork() > 0$) executes `a = a - 5`, printing $u = a - 5$.\n     - Child process ($fork() == 0$) executes `a = a + 5`, printing $x = a + 5$.\n     - Relating $u$ and $x$:\n       $$x - u = (a + 5) - (a - 5) = 10 \\implies u + 10 = x$$\n  2. **Virtual Addresses ($v$ and $y$)**:\n     - `fork()` creates an exact duplicate of the parent's virtual address space.\n     - While the physical frames backing the variable may differ (via copy-on-write), the **virtual addresses** (`&a`) printed by parent ($v$) and child ($y$) are identical:\n       $$v = y$$\n  - Thus, $u + 10 = x$ and $v = y$.\n\nTherefore, the correct answer is **Option C (u + 10 = x and v = y)**.",
    "images": []
  },
  "go:1396": {
    "concept": "Computer Networks - Packet Switching Optimum Packet Size Derivation",
    "markdown": "- **Givens & Network Model**:\n  - Total message size $M = 24\\text{ bytes}$.\n  - Packet header size $h = 3\\text{ bytes}$.\n  - Path has $2$ intermediate nodes $\\implies 3\\text{ hops}$ ($k = 3$).\n- **Analytical Optimization**:\n  1. Let $x$ be the data payload size per packet. Total packet size $P = x + h = x + 3$.\n  2. Number of packets $n = \\frac{M}{x} = \\frac{24}{x}$.\n  3. Total time to transmit $n$ packets over $k$ hops (pipelined transmission):\n     $$T = (n + k - 1) \\times \\frac{x + h}{B} = \\left(\\frac{24}{x} + 2\\right) \\frac{x + 3}{B}$$\n     $$T \\cdot B = 24 + \\frac{72}{x} + 2x + 6 = 30 + 2x + \\frac{72}{x}$$\n  4. Minimizing with respect to $x$:\n     $$\\frac{d(T \\cdot B)}{dx} = 2 - \\frac{72}{x^2} = 0 \\implies 2x^2 = 72 \\implies x^2 = 36 \\implies x = 6\\text{ bytes}$$\n  5. The optimum total packet size is:\n     $$P = x + h = 6 + 3 = 9\\text{ bytes}$$\n\nTherefore, the correct answer is **Option D (9)**.",
    "images": []
  },
  "go:3836": {
    "concept": "Computer Networks - TCP Effective Sender Window Size",
    "markdown": "- **Givens & TCP Parameters**:\n  - Congestion Window (\\text{cwnd}) = $4\\text{ KB} = 4096\\text{ bytes}$.\n  - Advertised Window (\\text{rwnd}) = $6\\text{ KB} = 6144\\text{ bytes}$.\n  - $\\text{LastByteSent} = 10240$, $\\text{LastByteAcked} = 8192$.\n- **Analytical Derivation**:\n  - In TCP flow and congestion control, the sender's maximum window size is bounded by the minimum of the receiver's advertised window and the network congestion window:\n    $$\\text{Sender Window Size} = \\min(\\text{cwnd}, \\text{rwnd}) = \\min(4\\text{ KB}, 6\\text{ KB}) = 4\\text{ KB} = 4096\\text{ bytes}$$\n\nTherefore, the correct answer is **Option B (4096 bytes)**.",
    "images": []
  },
  "go:1397": {
    "concept": "Computer Networks - Ethernet Minimum Frame Size with Jamming Signal",
    "markdown": "- **Givens & Ethernet Parameters**:\n  - Bandwidth $B = 10\\text{ Mbps} = 10^7\\text{ bps}$.\n  - Round trip propagation delay $RTT = 2 T_p = 46.4\\ \\mu\\text{s}$.\n  - Jamming signal length = $48\\text{ bits}$.\n- **Analytical Derivation**:\n  1. Bits transmitted during round trip time:\n     $$\\text{Bits in RTT} = RTT \\times B = (46.4 \\times 10^{-6}\\text{ s}) \\times 10^7\\text{ bps} = 464\\text{ bits}$$\n  2. To guarantee that a collision is detected before transmission ends, the frame must be long enough to cover the round trip propagation delay plus the transmission of the jamming signal:\n     $$\\text{Minimum Frame Size} = 464\\text{ bits} + 48\\text{ bits} = 512\\text{ bits}$$\n\nTherefore, the correct answer is **Option D (512)**.",
    "images": []
  },
  "go:3837": {
    "concept": "Computer Networks - Packet Transmission Reliability over Parallel Links",
    "markdown": "- **Probability Modeling**:\n  - Packet of length $L$ bits traverses link $L_1$ with probability $p_1$ or link $L_2$ with probability $p_2$.\n  - Bit error probabilities: $b_1$ on $L_1$, $b_2$ on $L_2$.\n- **Analytical Derivation**:\n  1. A packet is received without error over a link if all $L$ bits are received correctly:\n     - On link $L_1$: $P(\\text{no error} \\mid L_1) = (1 - b_1)^L$.\n     - On link $L_2$: $P(\\text{no error} \\mid L_2) = (1 - b_2)^L$.\n  2. By the Law of Total Probability:\n     $$P(\\text{no error}) = P(L_1) \\cdot P(\\text{no error} \\mid L_1) + P(L_2) \\cdot P(\\text{no error} \\mid L_2)$$\n     $$P(\\text{no error}) = p_1(1 - b_1)^L + p_2(1 - b_2)^L$$\n\nTherefore, the correct answer is **Option A ((1 - b_1)^L p_1 + (1 - b_2)^L p_2)**.",
    "images": []
  },
  "go:1398": {
    "concept": "Databases - ER to Relational Schema Reduction (1:N and M:N Relationships)",
    "markdown": "- **Given Entities and Relationships**:\n  - Two entity sets: $E_1$ and $E_2$.\n  - Relationship $R_1$: One-to-Many between $E_1$ (1-side) and $E_2$ (M-side).\n  - Relationship $R_2$: Many-to-Many between $E_1$ and $E_2$.\n- **Relational Schema Design & Table Minimization**:\n  1. **Table 1**: Entity set $E_1(PK_1, \\dots)$.\n  2. **Table 2**: Entity set $E_2$ merged with $1:N$ relationship $R_1$. The primary key of $E_1$ is embedded as a foreign key in $E_2(PK_2, PK_1, \\dots)$, avoiding a separate table for $R_1$.\n  3. **Table 3**: Many-to-many relationship $R_2$ fundamentally requires its own associative table $R_2(PK_1, PK_2)$ to represent arbitrary combinations without violating 1NF.\n  - Hence, the minimum number of tables required is **3**.\n\nTherefore, the correct answer is **Option B (3)**.",
    "images": []
  },
  "go:3838": {
    "concept": "Computer Networks - TDM MAC Protocol Channel Allocation & Station Bound",
    "markdown": "- **Givens & Network Specifications**:\n  - Cable length $d = 1\\text{ km}$, Velocity $v = 2 \\times 10^8\\text{ m/s}$.\n  - Propagation delay $T_p = \\frac{1000}{2 \\times 10^8} = 5\\ \\mu\\text{s}$.\n  - Bandwidth $B = 10\\text{ Mbps} = 10^7\\text{ bps}$.\n  - Transmission time for 100 bits: $T_t = \\frac{100}{10^7} = 10\\ \\mu\\text{s}$.\n  - Time slot length $= T_t + T_p = 10\\ \\mu\\text{s} + 5\\ \\mu\\text{s} = 15\\ \\mu\\text{s}$.\n  - Target throughput per station $= \\frac{2}{3}\\text{ Mbps}$.\n- **Analytical Derivation**:\n  - In a TDM cycle of $N$ stations, the cycle period is $T_{\\text{cycle}} = N \\times 15\\ \\mu\\text{s}$.\n  - In each cycle, a station transmits $100$ bits:\n    $$\\text{Throughput} = \\frac{100\\text{ bits}}{15N \\times 10^{-6}\\text{ s}} = \\frac{100 \\times 10^6}{15N}\\text{ bps} = \\frac{20}{3N}\\text{ Mbps}$$\n  - Setting equal to the required throughput:\n    $$\\frac{20}{3N} = \\frac{2}{3} \\implies 2N = 20 \\implies N = 10$$\n  - Maximum allowable stations $= 10$.\n\nTherefore, the correct answer is **Option C (10)**.",
    "images": []
  },
  "go:1399": {
    "concept": "Databases - Foreign Key Cascading Deletions Trace",
    "markdown": "- **Given Table $A, C$ ($A$ is PK, $C$ references $A$ ON DELETE CASCADE)**:\n  - $(2, 4), (3, 4), (4, 3), (5, 2), (7, 2), (9, 5), (6, 4)$.\n- **Cascading Deletion Trace**:\n  1. Deleting $(2, 4)$ removes primary key $A = 2$.\n  2. Any tuple with foreign key $C = 2$ must be deleted by cascade:\n     - $(5, 2)$ has $C = 2 \\implies$ deleted!\n     - $(7, 2)$ has $C = 2 \\implies$ deleted!\n  3. Deletion of $(5, 2)$ removes primary key $A = 5$:\n     - Any tuple with $C = 5$ must be deleted:\n     - $(9, 5)$ has $C = 5 \\implies$ deleted!\n  4. Deletion of $(7, 2)$ removes primary key $A = 7$. No tuples have $C = 7$.\n  5. Deletion of $(9, 5)$ removes primary key $A = 9$. No tuples have $C = 9$.\n  - Therefore, the set of additionally deleted tuples is:\n    $$\\{(5, 2), (7, 2), (9, 5)\\}$$\n\nTherefore, the correct answer is **Option C ((5, 2), (7, 2) and (9, 5))**.",
    "images": []
  },
  "go:3839": {
    "concept": "Computer Networks - Variable Length Subnet Masking (VLSM) Allocation",
    "markdown": "- **Given Requirements**:\n  - Class C network: `204.204.204.0/24`. Total $256$ host addresses ($0$ to $255$).\n  - Subnet 1: $100$ hosts $\\implies$ requires block size $2^7 = 128$ (mask `255.255.255.128`, $/25$).\n  - Subnets 2 & 3: $50$ hosts each $\\implies$ requires block size $2^6 = 64$ each (mask `255.255.255.192`, $/26$).\n- **Evaluating Option D**:\n  - Subnet 1: `204.204.204.128/255.255.255.128` (addresses $.128$ to $.255$, supports $126$ hosts).\n  - Subnet 2: `204.204.204.0/255.255.255.192` (addresses $.0$ to $.63$, supports $62$ hosts).\n  - Subnet 3: `204.204.204.64/255.255.255.192` (addresses $.64$ to $.127$, supports $62$ hosts).\n  - All three subnets are disjoint, perfectly partition the $/24$ block, and satisfy host requirements.\n\nTherefore, the correct answer is **Option D**.",
    "images": []
  },
  "go:1400": {
    "concept": "Databases - SQL Correlated Subqueries & Top-N Selection",
    "markdown": "- **Given SQL Query**:\n  ```sql\n  SELECT title\n  FROM book AS B\n  WHERE (SELECT count(*)\n         FROM book AS T\n         WHERE T.price > B.price) < 5\n  ```\n- **Analytical Step-by-Step Evaluation**:\n  - Let books be sorted by price in descending order: $b_1, b_2, b_3, b_4, b_5, b_6, \\dots$ where $b_1$ is the most expensive.\n  - The correlated subquery counts how many books have a price strictly greater than $B.price$:\n    - For $b_1$: count = 0 ($0 < 5 \\implies$ selected).\n    - For $b_2$: count = 1 ($1 < 5 \\implies$ selected).\n    - For $b_3$: count = 2 ($2 < 5 \\implies$ selected).\n    - For $b_4$: count = 3 ($3 < 5 \\implies$ selected).\n    - For $b_5$: count = 4 ($4 < 5 \\implies$ selected).\n    - For $b_6$: count = 5 ($5 < 5$ is false $\\implies$ rejected).\n  - Hence, the query selects the titles of the **five most expensive books**.\n\nTherefore, the correct answer is **Option D (Titles of the five most expensive books)**.",
    "images": []
  },
  "go:3840": {
    "concept": "Computer Networks - DNS Reverse Lookup in in-addr.arpa Domain",
    "markdown": "- **Concept / Theoretical Foundation**:\n  - In DNS, reverse lookups map an IPv4 address to a domain name using pointer (PTR) records.\n  - To preserve hierarchical delegation from left to right, the IP address octets are reversed and appended to the special domain `in-addr.arpa`.\n  - For IP `145.128.16.8`, the fully qualified reverse domain is:\n    ```\n    8.16.128.145.in-addr.arpa\n    ```\n  - The resolver queries the nameserver hierarchy: first for `in-addr.arpa`, then for `145.in-addr.arpa`, then for `128.145.in-addr.arpa`.\n\nTherefore, the correct answer is **Option C (Query a NS for in-addr.arpa and then a NS for 128.145.in-addr.arpa domains)**.",
    "images": []
  },
  "go:1401": {
    "concept": "Databases - Candidate Key Synthesis from Functional Dependencies",
    "markdown": "- **Given Schema & Functional Dependencies**:\n  - $R(A, B, C, D, E, H)$\n  - $A \\to B, \\ BC \\to D, \\ E \\to C, \\ D \\to A$\n- **Analytical Derivation**:\n  1. **Essential Attributes**:\n     - Attributes $E$ and $H$ never appear on the right-hand side of any functional dependency.\n     - Therefore, every candidate key must contain $\\{E, H\\}$.\n  2. **Closures with Essential Attributes**:\n     - $\\{E, H\\}^+ = \\{E, H, C\\} \\ne R$.\n  3. **Testing Combinations**:\n     - $(A E H)^+: \\{A, E, H\\} \\to B \\to C \\to D \\implies \\{A, B, C, D, E, H\\} = R$. ($AEH$ is a key).\n     - $(B E H)^+: \\{B, E, H\\} \\to C \\to BC \\to D \\to A \\implies R$. ($BEH$ is a key).\n     - $(D E H)^+: \\{D, E, H\\} \\to A \\to B \\to C \\implies R$. ($DEH$ is a key).\n  - The candidate keys of $R$ are $AEH, BEH, DEH$.\n\nTherefore, the correct answer is **Option D (AEH, BEH, DEH)**.",
    "images": []
  },
  "go:3842": {
    "concept": "Computer Networks - Cyclic Redundancy Check (CRC) Polynomial Division",
    "markdown": "- **Givens & Polynomial Encoding**:\n  - Message $M = 1010001101$.\n  - Divisor $G(x) = x^5 + x^4 + x^2 + 1 \\implies 110101_2$ (degree $r = 5$).\n- **Modulo-2 Polynomial Division Trace**:\n  - Append $5$ zeros to $M$:\n    $$M' = 101000110100000$$\n  - Dividing $101000110100000$ by $110101$ using bitwise XOR:\n    ```\n    101000110100000\n    110101\n    ------\n    0111011\n     110101\n     ------\n     00111001\n       110101\n       ------\n       00110000\n         110101\n         ------\n         000101000\n           110101\n           ------\n           0111010\n            110101\n            ------\n            00111100\n              110101\n              ------\n              001110 -> Remainder: 01110\n    ```\n  - The calculated 5-bit CRC checksum is **01110**.\n\nTherefore, the correct answer is **Option A (01110)**.",
    "images": []
  },
  "go:3843": {
    "concept": "Computer Networks - Diffie-Hellman Key Exchange Computation",
    "markdown": "- **Givens & Cryptographic Parameters**:\n  - Prime modulus $p = 7$, primitive root $g = 3$.\n  - Private secrets: $a = 2$ (Party A), $b = 5$ (Party B).\n- **Analytical Step-by-Step Derivation**:\n  1. **Public Key of A ($Y_A$)**:\n     $$Y_A = g^a \\bmod p = 3^2 \\bmod 7 = 9 \\bmod 7 = 2$$\n  2. **Public Key of B ($Y_B$)**:\n     $$Y_B = g^b \\bmod p = 3^5 \\bmod 7 = 243 \\bmod 7 = 5$$\n  3. **Shared Secret Key ($K$)**:\n     - Computed by Party A using $Y_B$:\n       $$K = Y_B^a \\bmod p = 5^2 \\bmod 7 = 25 \\bmod 7 = 4$$\n     - Computed by Party B using $Y_A$:\n       $$K = Y_A^b \\bmod p = 2^5 \\bmod 7 = 32 \\bmod 7 = 4$$\n  - Both parties arrive at the identical shared secret key $K = 4$.\n\nTherefore, the correct answer is **Option B (4)**.",
    "images": []
  },
  "go:3845": {
    "concept": "Operating Systems - Disk Recording (CLV vs CAV Storage Capacity)",
    "markdown": "- **Givens & Track Geometry**:\n  - $8$ equidistant tracks with diameters $1, 2, 3, 4, 5, 6, 7, 8\\text{ cm}$.\n  - Innermost track diameter = $1\\text{ cm}$, capacity = $10\\text{ MB}$.\n- **Analytical Derivation**:\n  1. **Constant Angular Velocity (CAV)**:\n     - The disk rotates at a constant rotational speed (RPM). Bits are written at a variable linear density such that every track stores the identical amount of data, bounded by the maximum safe bit density on the innermost track.\n     $$\\text{Capacity (CAV)} = 8 \\times 10\\text{ MB} = 80\\text{ MB}$$\n  2. **Constant Linear Velocity (CLV)**:\n     - Linear recording bit density is constant across the entire disk. The storage capacity of a track is directly proportional to its track circumference (and diameter $D_i$):\n       $$\\text{Capacity}_i = 10\\text{ MB} \\times \\frac{D_i}{D_1} = 10 D_i\\text{ MB}$$\n     $$\\text{Total Capacity (CLV)} = 10 \\times \\sum_{i=1}^8 i = 10 \\times \\frac{8 \\times 9}{2} = 10 \\times 36 = 360\\text{ MB}$$\n  - Hence, CLV stores $360\\text{ MB}$ and CAV stores $80\\text{ MB}$.\n\nTherefore, the correct answer is **Option D (I. 360 MB; II. 80 MB)**.",
    "images": []
  },
  "go:3846": {
    "concept": "Operating Systems - Disk Head Seek & Data Transfer Time",
    "markdown": "- **Givens & Parameters**:\n  - $8$ equidistant tracks: innermost radius $r_1 = 0.5\\text{ cm}$, outermost radius $r_8 = 4.0\\text{ cm}$.\n  - Head speed $v = 10\\text{ m/s}$. Rotational speed = $6000\\text{ RPM} \\implies 1\\text{ rev} = 10\\text{ ms}$.\n  - $20$ sectors per track. Currently at sector 5 of track 1.\n- **Analytical Step-by-Step Derivation**:\n  1. **Seek Time**:\n     - Radial distance $= 4.0 - 0.5 = 3.5\\text{ cm} = 0.035\\text{ m}$.\n     $$T_{\\text{seek}} = \\frac{0.035\\text{ m}}{10\\text{ m/s}} = 0.0035\\text{ s} = 3.5\\text{ ms}$$\n  2. **Rotational Latency & Contiguous Transfer**:\n     - In $3.5\\text{ ms}$, the disk rotates through:\n       $$\\frac{3.5\\text{ ms}}{10\\text{ ms/rev}} \\times 20\\text{ sectors} = 7\\text{ sectors}$$\n     - Starting from sector 5, the head reaches sector $5 + 7 = 12$.\n     - Waiting for sector 4 to arrive under the head plus reading $1\\text{ MB}$ ($2$ sectors on the $10\\text{ MB}$ track) takes a total elapsed time of exactly $10\\text{ ms}$.\n\nTherefore, the correct answer is **Option B (10 ms)**.",
    "images": []
  },
  "go:3847": {
    "concept": "Databases - Nested-Loop Join Block Access Cost Analysis",
    "markdown": "- **Givens & Table Parameters**:\n  - Table $T_1$: $2000$ records, $80$ blocks ($B_1 = 80$).\n  - Table $T_2$: $400$ records, $20$ blocks ($B_2 = 20$).\n  - Buffer space = $1$ block for $T_1$ and $1$ block for $T_2$.\n- **Analytical Derivation**:\n  - In a tuple-oriented (record) nested-loop join with outer table $R$ and inner table $S$:\n    $$\\text{Total Block Accesses} = B_R + |R| \\times B_S$$\n  - To minimize block accesses, the table with fewer records ($T_2$ with $400$ records) must be chosen as the outer table:\n    $$\\text{Accesses} = B(T_2) + |T_2| \\times B(T_1)$$\n    $$\\text{Accesses} = 20 + 400 \\times 80 = 20 + 32,000 = 32,020\\text{ block accesses}$$\n\nTherefore, the correct answer is **Option C (32020)**.",
    "images": []
  },
  "go:3848": {
    "concept": "Databases - Block Nested-Loop Join I/O Reduction",
    "markdown": "- **Cost Comparison**:\n  1. From the previous question, record nested-loop join requires:\n     $$\\text{Cost}_{\\text{record}} = 32,020\\text{ block accesses}$$\n  2. In **Block Nested-Loop Join**, for every *block* of the outer relation, the inner relation is scanned once:\n     $$\\text{Cost}_{\\text{block}} = B(T_2) + B(T_2) \\times B(T_1)$$\n     $$\\text{Cost}_{\\text{block}} = 20 + (20 \\times 80) = 20 + 1,600 = 1,620\\text{ block accesses}$$\n  3. Reduction in block accesses:\n     $$\\text{Reduction} = 32,020 - 1,620 = 30,400\\text{ block accesses}$$\n\nTherefore, the correct answer is **Option B (30400)**.",
    "images": []
  },
  "go:3858": {
    "concept": "Computer Networks - Distance Vector Routing Stable Forwarding Tables",
    "markdown": "- **Graph Analysis & Node B Routing Table**:\n  - Unit edge costs on graph with nodes $A, B, C, D, E, F$.\n  - Inspecting shortest paths from node $B$:\n    - To $A$: directly connected neighbor $A$ (next hop $A$, cost $1$).\n    - To $C$: directly connected neighbor $C$ (next hop $C$, cost $1$).\n    - To $D$: directly connected neighbor $D$ (next hop $D$, cost $1$).\n    - To $E$: path via neighbor $C$ has length $2$ ($B \\to C \\to E$, next hop $C$, cost $2$).\n    - To $F$: path via neighbor $D$ has length $2$ ($B \\to D \\to F$, next hop $D$, cost $2$).\n  - This corresponds exactly to the table in Option C.\n\nTherefore, the correct answer is **Option C**.",
    "images": []
  },
  "go:3859": {
    "concept": "Computer Networks - Distance Vector Count-to-Infinity & Convergence Latency",
    "markdown": "- **Counting to Infinity Trace**:\n  - When node $A$ crashes, nodes $B$ and $C$ continue exchanging distance vector updates through each other in a mutual routing loop ($B \\to C \\to B \\dots$), incrementing the perceived cost to $A$ by $1$ on each periodic interval.\n  - At time $(t + 100)$, exactly $100$ update intervals have elapsed.\n  - The routing cost from node $F$ to $A$ has incremented on every round, exceeding $100$.\n  - Because no infinity threshold has been reached yet in this basic setup, the advertised metric is strictly **$> 100$ but finite**.\n\nTherefore, the correct answer is **Option A (>100 but finite)**.",
    "images": []
  }
};
