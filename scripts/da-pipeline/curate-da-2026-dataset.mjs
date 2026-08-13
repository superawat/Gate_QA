import fs from 'fs';
import path from 'path';

// Master curated dataset for GATE DA 2026 (all 65 questions)
export const DA_2026_CURATED = [
  // ----------------------------------------------------
  // General Aptitude (Q1 - Q10)
  // ----------------------------------------------------
  {
    number: 1,
    marks: 1,
    type: "mcq",
    subject: "general-aptitude",
    stem: "Verbosity : Brevity :: Insolence : ___________<br />Choose the word that best fills the blank.",
    options: [
      { label: "A", text: "Innocence" },
      { label: "B", text: "Respect" },
      { label: "C", text: "Solace" },
      { label: "D", text: "Wealth" }
    ]
  },
  {
    number: 2,
    marks: 1,
    type: "mcq",
    subject: "general-aptitude",
    stem: "The product of the digits of a three-digit number is $70$. The sum of the digits of this three-digit number is _____.",
    options: [
      { label: "A", text: "$12$" },
      { label: "B", text: "$14$" },
      { label: "C", text: "$16$" },
      { label: "D", text: "$18$" }
    ]
  },
  {
    number: 3,
    marks: 1,
    type: "mcq",
    subject: "general-aptitude",
    stem: `The four pieces of a puzzle are shown in the figure below.<br /><table class="da-latex-table"><tbody><tr><td><img src="/question-images/da/4556bdaffdb5f02de98b.webp" alt="Piece 1" loading="lazy" /></td><td><img src="/question-images/da/d46ff90bd7e6f6c207bc.webp" alt="Piece 2" loading="lazy" /></td><td><img src="/question-images/da/e6b69e848c26f074af4f.webp" alt="Piece 3" loading="lazy" /></td><td><img src="/question-images/da/2c8a34c28c5784143396.webp" alt="Piece 4" loading="lazy" /></td></tr></tbody></table><br />Which one of the figures labelled as P, Q, R, and S can be constructed by using each of the four pieces only once without overlaps?<br /><table class="da-latex-table"><tbody><tr><td><img src="/question-images/da/a4650f7b6ba8f53fe943.webp" alt="Figure P" loading="lazy" /><br />P</td><td><img src="/question-images/da/d65cbd51c362149c9e00.webp" alt="Figure Q" loading="lazy" /><br />Q</td></tr><tr><td><img src="/question-images/da/89f63ae212c93f81811f.webp" alt="Figure R" loading="lazy" /><br />R</td><td><img src="/question-images/da/3ce6a49244a463b03baa.webp" alt="Figure S" loading="lazy" /><br />S</td></tr></tbody></table>`,
    options: [
      { label: "A", text: "P" },
      { label: "B", text: "Q" },
      { label: "C", text: "R" },
      { label: "D", text: "S" }
    ]
  },
  {
    number: 4,
    marks: 1,
    type: "mcq",
    subject: "general-aptitude",
    stem: "Consider two distinct positive real numbers $m, n$, with $m > n$.<br />Let $x = n^{\\log_{10}(m)}$ and $y = m^{\\log_{10}(n)}$. The relation between $x$ and $y$ is _______.",
    options: [
      { label: "A", text: "$x > y$" },
      { label: "B", text: "$x < y$" },
      { label: "C", text: "$x = y$" },
      { label: "D", text: "$x = \\log_{10}(y)$" }
    ]
  },
  {
    number: 5,
    marks: 1,
    type: "mcq",
    subject: "general-aptitude",
    stem: "‘If his latest movie had been a commercial success, the actor would have made enough money to sponsor his next movie.’<br />Based only on the above sentence, which one of the following statements is true?",
    options: [
      { label: "A", text: "The actor will certainly sponsor his next movie." },
      { label: "B", text: "His latest movie was a commercial success." },
      { label: "C", text: "The actor made enough money from his latest movie." },
      { label: "D", text: "His latest movie was not commercially successful." }
    ]
  },
  {
    number: 6,
    marks: 2,
    type: "mcq",
    subject: "general-aptitude",
    stem: "‘My friend and I parted __ the door __ the cabin that I had rented __ the night.’<br />Choose the option with the correct sequence of words to fill the blanks.",
    options: [
      { label: "A", text: "at; of; for" },
      { label: "B", text: "for; at; of" },
      { label: "C", text: "of; for; in" },
      { label: "D", text: "in; of; for" }
    ]
  },
  {
    number: 7,
    marks: 2,
    type: "mcq",
    subject: "general-aptitude",
    stem: "Five integers are picked from $0$ to $20$, with possible repetitions, such that their mean is $12$, median is $18$, and they have a single mode of $20$.<br />Ignoring permutations, the number of ways to pick these five integers is _____.",
    options: [
      { label: "A", text: "$0$" },
      { label: "B", text: "$1$" },
      { label: "C", text: "$2$" },
      { label: "D", text: "$3$" }
    ]
  },
  {
    number: 8,
    marks: 2,
    type: "mcq",
    subject: "general-aptitude",
    stem: "Rishi and Swathi are students of Class 5. Pavan and Tanvi are students of Class 4. Rishi and Pavan are boys. Swathi and Tanvi are girls. The four students played a total of three games of chess. The games were played one after another. A player who lost a game did not participate in any more games. It was observed that:<br />(i) the first game was the only game where two students of the same class played against each other,<br />(ii) the students of Class 5 won more games than the students of Class 4, and<br />(iii) the boys won two games and the girls won one game.<br />The student who did not lose any game is __________.",
    options: [
      { label: "A", text: "Pavan" },
      { label: "B", text: "Rishi" },
      { label: "C", text: "Swathi" },
      { label: "D", text: "Tanvi" }
    ]
  },
  {
    number: 9,
    marks: 2,
    type: "mcq",
    subject: "general-aptitude",
    stem: "P, Q, R, S, X, and Y are distinct single-digit whole numbers taking values from $0$ to $9$.<br />$PQ$ is a two-digit number with $Q$ being in the units place and $P$ in the tens place. Similarly, $RS$ is a two-digit number.<br />It is known that $PQ$ and $RS$ are consecutive numbers and $(PQ)^2 + (RS)^2 = XYP$, with $XYP$ being a three-digit number.<br />The value of $Y$ is __________.",
    options: [
      { label: "A", text: "$4$" },
      { label: "B", text: "$5$" },
      { label: "C", text: "$6$" },
      { label: "D", text: "$7$" }
    ]
  },
  {
    number: 10,
    marks: 2,
    type: "mcq",
    subject: "general-aptitude",
    stem: `In the given figure, P, Q, and R are three points on a circle of radius $10\\text{ cm}$ with $O$ as its center, $\\overline{PQ} = \\overline{RQ}$, and $\\angle PQR = 45^\\circ$. The figure is representative.<br /><div style="text-align: center; margin: 12px 0;"><img src="/question-images/da/044f5201e42663218079.webp" alt="Circle geometry" style="max-width: 280px;" loading="lazy" /></div><br />The area of the shaded region $PQRO$ is ______________ $\\text{cm}^2$.`,
    options: [
      { label: "A", text: "$50$" },
      { label: "B", text: "$25\\sqrt{2}$" },
      { label: "C", text: "$50\\sqrt{2}$" },
      { label: "D", text: "$100$" }
    ]
  },

  // ----------------------------------------------------
  // Technical Section (Q11 - Q35, 1 Mark each)
  // ----------------------------------------------------
  {
    number: 11,
    marks: 1,
    type: "mcq",
    subject: "machine-learning",
    stem: "For a classification problem, Principal Component Analysis (PCA) has been used to reduce the dimensionality of a feature space from $100$ to $10$.<br />Which of the following options is true about the angle $\\theta$ between the first and the tenth principal components?",
    options: [
      { label: "A", text: "$\\theta = 0^\\circ$" },
      { label: "B", text: "$\\theta = 90^\\circ$" },
      { label: "C", text: "$90^\\circ < \\theta \\le 180^\\circ$" },
      { label: "D", text: "$0 < \\theta < 90^\\circ$" }
    ]
  },
  {
    number: 12,
    marks: 1,
    type: "mcq",
    subject: "machine-learning",
    stem: "Consider that you are training a classifier for a 10-class classification problem. Each input is represented as a 512-dimensional vector. There are $1000$ samples, out of which first $100$ will be used for testing. Let Leave-One-Out-Cross-Validation (LOOCV) be used for selection of the classifier model before testing.<br />Which of the following options is the correct number of validation splits that will be generated?",
    options: [
      { label: "A", text: "$10$" },
      { label: "B", text: "$512$" },
      { label: "C", text: "$900$" },
      { label: "D", text: "$1000$" }
    ]
  },
  {
    number: 13,
    marks: 1,
    type: "mcq",
    subject: "artificial-intelligence",
    stem: "Which of the following algorithms is NOT an example of uninformed search?",
    options: [
      { label: "A", text: "Breadth First Search" },
      { label: "B", text: "Depth First Search" },
      { label: "C", text: "A* Search" },
      { label: "D", text: "Depth-limited Search" }
    ]
  },
  {
    number: 14,
    marks: 1,
    type: "mcq",
    subject: "artificial-intelligence",
    stem: "Which of the following statements is NOT true? (The names of the predicates are intuitive.)",
    options: [
      { label: "A", text: "$\\forall x \\forall y \\; \\text{Classmate}(x, y) \\implies \\text{Classmate}(y, x)$" },
      { label: "B", text: "$\\forall x \\; \\text{Likes}(x, \\text{Icecream}) \\implies \\neg \\exists x \\; \\neg \\text{Likes}(x, \\text{Icecream})$" },
      { label: "C", text: "“Each king is a person” is equivalent to $\\forall x \\; \\text{IsKing}(x) \\land \\text{IsPerson}(x)$" },
      { label: "D", text: "“All humans are mortal” is equivalent to $\\forall x \\; \\text{IsHuman}(x) \\implies \\text{IsMortal}(x)$" }
    ]
  },
  {
    number: 15,
    marks: 1,
    type: "mcq",
    subject: "programming-data-structures-and-algorithms",
    stem: "Consider that the quick sort algorithm is used to sort an array of $n$ distinct randomly ordered elements. In every call, the pivot is chosen as the first element of the current subarray.<br />Let $T(n)$ denote the expected time to sort the array. Assume that the time to partition is linear in the size of the current subarray.<br />Which of the following recurrence relations correctly represents $T(n)$ in this scenario?",
    options: [
      { label: "A", text: "$T(n) = T(1) + T(n - 1) + O(n)$" },
      { label: "B", text: "$T(n) = T\\left(\\frac{n}{4}\\right) + T\\left(\\frac{3n}{4}\\right) + O(n)$" },
      { label: "C", text: "$T(n) = 2T\\left(\\frac{n}{2}\\right) + O(n)$" },
      { label: "D", text: "$T(n) = \\frac{1}{n} \\sum_{k=0}^{n-1} [T(k) + T(n - k - 1)] + O(n)$" }
    ]
  },
  {
    number: 16,
    marks: 1,
    type: "mcq",
    subject: "programming-data-structures-and-algorithms",
    stem: `Consider the given Python program.<br /><pre><code class="language-python">def append_to_lst(val, lst=[]):\n    lst.append(val)\n    return lst\n\nprint(append_to_lst(1))\nprint(append_to_lst(2))\nprint(append_to_lst(3, []))</code></pre><br />Which of the following is the correct output of this program?`,
    options: [
      { label: "A", text: "[1]<br />[2]<br />[3]" },
      { label: "B", text: "[1]<br />[1, 2]<br />[3]" },
      { label: "C", text: "[1]<br />[2]<br />[1, 2, 3]" },
      { label: "D", text: "[1]<br />[1, 2]<br />[1, 3]" }
    ]
  },
  {
    number: 17,
    marks: 1,
    type: "mcq",
    subject: "database-management-and-warehousing",
    stem: "Let $R(A, B, C, D, E)$ be a relational schema with functional dependency set $F = \\{A \\to BC, \\; CD \\to E, \\; E \\to A\\}$.<br />Which of the following statements is correct?",
    options: [
      { label: "A", text: "$AD, ED$ and $CD$ are the only candidate keys of $R$." },
      { label: "B", text: "$AD$ and $ED$ are the only candidate keys of $R$." },
      { label: "C", text: "$A, E$ and $CD$ are the only candidate keys of $R$." },
      { label: "D", text: "$A$ and $CD$ are the only candidate keys of $R$." }
    ]
  },
  {
    number: 18,
    marks: 1,
    type: "mcq",
    subject: "database-management-and-warehousing",
    stem: "Consider that the visualization of a 3-dimensional data cube is showing Sales Quantity for each combination of the attributes <i>Product Type</i>, <i>Month</i> and <i>Country</i>.<br />From this, if we want to further visualize the Sales Quantity for each combination of <i>Product Type</i>, <i>Month</i> and <i>State</i>, which of the following OLAP operations should be performed?",
    options: [
      { label: "A", text: "Slicing" },
      { label: "B", text: "Dicing" },
      { label: "C", text: "Roll-up" },
      { label: "D", text: "Drill-down" }
    ]
  },
  {
    number: 19,
    marks: 1,
    type: "mcq",
    subject: "probability-and-statistics",
    stem: "Let $M$ be a randomly chosen non-empty subset of $S = \\{1, 2, 3, \\dots, 2026\\}$.<br />Which of the following is the probability that the product of all the elements of $M$ is even?",
    options: [
      { label: "A", text: "$\\frac{2^{1013}(2^{1013} - 1)}{2^{2026}}$" },
      { label: "B", text: "$\\frac{2^{1013}}{2^{2026}}$" },
      { label: "C", text: "$\\frac{2^{1013}(2^{1013} - 1)}{2^{2026} - 1}$" },
      { label: "D", text: "$\\frac{1}{2^{2026} - 1}$" }
    ]
  },
  {
    number: 20,
    marks: 1,
    type: "mcq",
    subject: "probability-and-statistics",
    stem: "Suppose that a computer program provides a non-negative and integer-valued random solution to the equation $n_1 + n_2 + n_3 + n_4 = 20$.<br />Which of the following is the probability that all of $n_1, n_2, n_3, n_4$ in the provided solution are positive?",
    options: [
      { label: "A", text: "$\\frac{\\binom{19}{3}}{\\binom{23}{3}}$" },
      { label: "B", text: "$\\frac{\\binom{20}{4}}{\\binom{24}{4}}$" },
      { label: "C", text: "$\\frac{\\binom{20}{3}}{\\binom{23}{3}}$" },
      { label: "D", text: "$\\frac{\\binom{19}{4}}{\\binom{24}{4}}$" }
    ]
  },
  {
    number: 21,
    marks: 1,
    type: "mcq",
    subject: "linear-algebra",
    stem: "Let $M = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}$ be a $2 \\times 2$ matrix, where $\\theta = \\frac{2\\pi}{5}$, and $I_2 = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$.<br />Which of the following options is equal to $M^{2026}$?",
    options: [
      { label: "A", text: "$M^2$" },
      { label: "B", text: "$M$" },
      { label: "C", text: "$M^{-1}$" },
      { label: "D", text: "$I_2$" }
    ]
  },
  {
    number: 22,
    marks: 1,
    type: "mcq",
    subject: "linear-algebra",
    stem: "Consider a set $S_1 = \\{x = (x_1, x_2, x_3)^T \\in \\mathbb{R}^3 \\mid x^T x \\le 16\\}$. Let $S_2$ be another set which is a subspace of $\\mathbb{R}^3$ with dimension two.<br />Which of the following gives the area of $S_1 \\cap S_2$?",
    options: [
      { label: "A", text: "$16\\pi$" },
      { label: "B", text: "$4\\pi$" },
      { label: "C", text: "$4\\pi^2$" },
      { label: "D", text: "$16\\pi^2$" }
    ]
  },
  {
    number: 23,
    marks: 1,
    type: "mcq",
    subject: "machine-learning",
    stem: `In the following table, the Task column lists a few tasks related to machine learning. The Algorithm column lists a few algorithms.<br />Each entry “t” from the Task column is to be matched with an appropriate entry “a” from the Algorithm column such that the task “t” can be solved using the algorithm “a”. Denote such a match as t:a.<br /><table class="da-latex-table"><thead><tr><th>Task</th><th>Algorithm</th></tr></thead><tbody><tr><td>T1 – Clustering</td><td>A1 – Markov Chain Monte Carlo</td></tr><tr><td>T2 – Classification</td><td>A2 – K-Medoid</td></tr><tr><td>T3 – Sampling</td><td>A3 – Linear Discriminant Analysis</td></tr><tr><td>T4 – Feature Extraction</td><td>A4 – Naive Bayes</td></tr></tbody></table><br />Which of the following options is/are the correct matching(s)?`,
    options: [
      { label: "A", text: "T1:A4, T2:A3, T3:A1, T4:A2" },
      { label: "B", text: "T1:A2, T2:A4, T3:A1, T4:A3" },
      { label: "C", text: "T1:A3, T2:A4, T3:A1, T4:A2" },
      { label: "D", text: "T1:A4, T2:A2, T3:A1, T4:A3" }
    ]
  },
  {
    number: 24,
    marks: 1,
    type: "msq",
    subject: "artificial-intelligence",
    stem: "Sentence $X$ is said to entail Sentence $Y$ ($X \\models Y$) if whenever $X$ is TRUE, $Y$ also must hold TRUE.<br />Which of the following statements is/are correct if $X$ entails $Y$?",
    options: [
      { label: "A", text: "$X \\implies Y$" },
      { label: "B", text: "$X \\land \\neg Y$ is FALSE" },
      { label: "C", text: "if $X$ then $Y$" },
      { label: "D", text: "if $Y$ then $X$" }
    ]
  },
  {
    number: 25,
    marks: 1,
    type: "msq",
    subject: "programming-data-structures-and-algorithms",
    stem: "You are given the following Pre-order and In-order traversals of a Binary Tree $T$ with nodes E, F, G, P, Q, R, S.<br />Pre-order: P Q S E R F G<br />In-order: S Q E P F R G<br />Which of the following statements is/are true about the Binary Tree $T$?",
    options: [
      { label: "A", text: "Node P is the root of $T$" },
      { label: "B", text: "The Post-order traversal of $T$ is: S E Q F G R P" },
      { label: "C", text: "Node Q has only one child" },
      { label: "D", text: "The left subtree of node R contains the node G" }
    ]
  },
  {
    number: 26,
    marks: 1,
    type: "msq",
    subject: "database-management-and-warehousing",
    stem: "Consider two relations $r$ and $s$ defined on the relational schemas $R(A, B)$ and $S(E, C)$, respectively. $A$ is the primary key of $R$ and $E$ is a foreign key of $S$ referencing $A$ in $R$.<br />Which of the following operations will NEVER violate the foreign key constraint?",
    options: [
      { label: "A", text: "Inserting records into relation $r$" },
      { label: "B", text: "Deleting records from relation $s$" },
      { label: "C", text: "Deleting records from relation $r$" },
      { label: "D", text: "Inserting records into relation $s$" }
    ]
  },
  {
    number: 27,
    marks: 1,
    type: "msq",
    subject: "calculus-and-optimization",
    stem: "Let $f(x) = x^3 - 3x^2 + 2$ be a function defined on $(-1, 3]$.<br />Which of the following statements is/are correct?",
    options: [
      { label: "A", text: "$f(x)$ has exactly two roots in $[-0.9, 0]$." },
      { label: "B", text: "$f(x)$ has a local minimum at $x = 2$." },
      { label: "C", text: "$f(x)$ has a local maximum at $x = 0$." },
      { label: "D", text: "$f(x)$ has a root at $x = 1$." }
    ]
  },
  {
    number: 28,
    marks: 1,
    type: "msq",
    subject: "probability-and-statistics",
    stem: "Suppose a random variable $Z$ follows $\\text{Normal}(\\mu = 0, \\sigma^2 = 1)$ distribution with probability density function $g(z)$ and cumulative distribution function $G(z)$. Another random variable $Y$ follows $t_1$ distribution (Student's t with 1 degree of freedom) with probability density function $h(y)$ and cumulative distribution function $H(y)$. Let $c$ be the positive real number for which $g(c) = h(c)$.<br />Which of the following statements is/are correct?",
    options: [
      { label: "A", text: "$G(0) = H(0)$" },
      { label: "B", text: "$G(c) < H(c)$" },
      { label: "C", text: "$G(-c) < H(-c)$" },
      { label: "D", text: "$g(0) = h(0)$" }
    ]
  },
  {
    number: 29,
    marks: 1,
    type: "nat",
    subject: "machine-learning",
    stem: "Consider that for a supervised learning task, the objective function being minimized is $f_w(x) = wx$, where $x \\in \\mathbb{R}$ is the input and $w \\in \\mathbb{R}$ is the parameter. Stochastic Gradient Descent with learning rate of $0.10$ is used for parameter updates.<br />Suppose that at the end of iteration $i$, the value of $w$ becomes $10.00$. Let $x = 10.00$ be the input for iteration $(i + 1)$.<br />The value of $w$ at the end of iteration $(i + 1)$ is __________. (Rounded off to two decimal places)",
    options: []
  },
  {
    number: 30,
    marks: 1,
    type: "nat",
    subject: "artificial-intelligence",
    stem: `Consider the game tree for a two-player turn-taking minimax game as shown in the figure. The value of a terminal node represents the utility of the game state if the game ends there. The numbers written next to the edges denote the strategies. There are two players MAX and MIN. At any particular state of the game, MAX prefers to move to a state of maximum value. On the other hand, MIN prefers to move to a state of minimum value.<br />Suppose MAX starts the game at the root and has three strategies: 1, 2 and 3. Next, MIN plays and also has three strategies: 1, 2 and 3. The game ends there. Both players always take optimal strategies throughout the game.<br /><div style="text-align: center; margin: 12px 0;"><img src="/question-images/da/76fd27d5340e509b1461.webp" alt="Minimax Game Tree" style="max-width: 520px;" loading="lazy" /></div><br />At the root, the best strategy for MAX is ___________. (Answer in integer: 1, 2, or 3)`,
    options: []
  },
  {
    number: 31,
    marks: 1,
    type: "nat",
    subject: "programming-data-structures-and-algorithms",
    stem: "Let $A$ be a sorted array containing $1000$ distinct integers. You perform a recursive binary search on $A$ to find an element $y$. Suppose each comparison checks whether the middle element computed during the current recursive step is equal to, less than, or greater than $y$.<br />The maximum number of comparisons that may have to be performed if $y$ is not an element of $A$ is _______ . (Answer in integer)",
    options: []
  },
  {
    number: 32,
    marks: 1,
    type: "nat",
    subject: "database-management-and-warehousing",
    stem: "In a relational database, a B+ Tree Index is to be constructed for a relation on a key field. In a B+ Tree, a Node Pointer points to a sub-tree and a Data Record Pointer points to a block of database records.<br />Let: Node size = $4096$ bytes, Node Pointer size = $10$ bytes, Search Key Field size = $11$ bytes and Data Record Pointer size = $12$ bytes.<br />The maximum number of Node Pointers that can be present in a non-leaf node of the B+ Tree is ________ . (Answer in integer)",
    options: []
  },
  {
    number: 33,
    marks: 1,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "The number of bijections $f(\\cdot)$ from the set $S = \\{1, 2, 3, 4\\}$ to itself such that $f(f(n)) = n$, for all $n \\in S$, is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 34,
    marks: 1,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "Let $X$ be an exponentially distributed random variable with mean $\\lambda (> 0)$. If $P(X > 5) = 0.35$, then the conditional probability $P(X > 10 \\mid X > 5)$ is ___________ . (Rounded off to two decimal places)",
    options: []
  },
  {
    number: 35,
    marks: 1,
    type: "nat",
    subject: "calculus-and-optimization",
    stem: "The value of $\\sum_{i=0}^\\infty \\sum_{j=1}^\\infty 2^{-i} 3^{-j}$ is ______________ . (Answer in integer)",
    options: []
  },

  // ----------------------------------------------------
  // Technical Section (Q36 - Q65, 2 Marks each)
  // ----------------------------------------------------
  {
    number: 36,
    marks: 2,
    type: "mcq",
    subject: "machine-learning",
    stem: "Let four points in three-dimensional space be:<br />$P_1: [2, 3, -1], \\; P_2: [3, 1, 1], \\; P_3: [5, -2, 3]$ and $P_4: [3, 3, 3]$.<br />Hierarchical Agglomerative Clustering is used to cluster the above points. If Manhattan Distance is used as the distance metric during clustering, which of the following options indicates the two points that will be merged first?",
    options: [
      { label: "A", text: "$P_1, P_2$" },
      { label: "B", text: "$P_2, P_3$" },
      { label: "C", text: "$P_3, P_4$" },
      { label: "D", text: "$P_2, P_4$" }
    ]
  },
  {
    number: 37,
    marks: 2,
    type: "mcq",
    subject: "machine-learning",
    stem: "Which of the following statements is true for Ridge Regression?",
    options: [
      { label: "A", text: "The regularizer in the objective function of Ridge Regression is used to guard against scenarios where the model works well for the test data, but poorly for the training data." },
      { label: "B", text: "The regularizer of Ridge Regression uses $L_1$ norm." },
      { label: "C", text: "Ridge Regression aims to reduce the number of parameters that have negative values." },
      { label: "D", text: "The regularizer of Ridge Regression may increase the bias of the model, but it helps in reducing the variance in predictions." }
    ]
  },
  {
    number: 38,
    marks: 2,
    type: "mcq",
    subject: "artificial-intelligence",
    stem: "Assume that a Creative ($C$) person will Succeed ($S$) if the person is also Disciplined ($D$), but will not succeed otherwise. Now, consider the following statements:<br />(i) $C \\land S \\iff D$<br />(ii) $C \\implies (S \\iff D)$<br />(iii) $C \\iff ((D \\implies S) \\lor \\neg S)$<br />Which of the following options is correct?",
    options: [
      { label: "A", text: "Both (i) and (ii) are TRUE" },
      { label: "B", text: "Only (ii) is TRUE" },
      { label: "C", text: "Both (ii) and (iii) are TRUE" },
      { label: "D", text: "Only (iii) is TRUE" }
    ]
  },
  {
    number: 39,
    marks: 2,
    type: "mcq",
    subject: "programming-data-structures-and-algorithms",
    stem: `A recursive function in Python is given.<br /><pre><code class="language-python">def mystery(n):\n    if n <= 0:\n        return 1\n    else:\n        return mystery(n-1) + mystery(n-2)</code></pre><br />Now, consider the function call: <code>mystery(4)</code>.<br />Assume that a typical runtime stack is used to manage function calls. Each function call is pushed onto the stack and removed only after it finishes execution.<br />Which of the following options denotes the total number of function calls (i.e., the total number of stack activations), including the initial call, to compute <code>mystery(4)</code>?`,
    options: [
      { label: "A", text: "$5$" },
      { label: "B", text: "$9$" },
      { label: "C", text: "$15$" },
      { label: "D", text: "$17$" }
    ]
  },
  {
    number: 40,
    marks: 2,
    type: "mcq",
    subject: "programming-data-structures-and-algorithms",
    stem: "Consider a directed graph $G = (V, E)$, where $V$ is the finite set of vertices and $E$ is the set of directed edges between the vertices. $G$ may contain cycles but there is no self-loop. Further, $G$ may not be strongly connected.<br />Let $G^R$ be the graph obtained by reversing the directions of all the edges in $G$ without changing the set of vertices.<br />Assume that Breadth First Search (BFS) or Depth First Search (DFS) from any given vertex $v$ of a graph visits only the reachable vertices from $v$ in that graph.<br />Which of the following statements must always be true, regardless of the structure of $G$?",
    options: [
      { label: "A", text: "If $u$ is a reachable vertex in the BFS of $G^R$ from $v$, then $u$ is also a reachable vertex in the DFS of $G$ from $v$." },
      { label: "B", text: "In $G^R$, the BFS traversal from $v$ will visit exactly the same set of vertices as the DFS from $v$ in $G$." },
      { label: "C", text: "The order of vertices visited in the BFS of $G^R$ from $v$ is the reverse of the order of vertices visited in the DFS of $G$ from $v$." },
      { label: "D", text: "If $u$ is a reachable vertex in the DFS of $G$ from $v$, then $v$ is also a reachable vertex in the BFS of $G^R$ from $u$." }
    ]
  },
  {
    number: 41,
    marks: 2,
    type: "mcq",
    subject: "database-management-and-warehousing",
    stem: `Consider a B+ Tree where the maximum number of key values in each leaf node is $2$ and the maximum number of pointers in each non-leaf node is $3$. Let the content of the B+ Tree be as shown in the figure.<br /><div style="text-align: center; margin: 12px 0;"><img src="/question-images/da/c929b19557511fd66e9d.webp" alt="B+ Tree" style="max-width: 550px;" loading="lazy" /></div><br />Which of the following options denotes the key value(s) stored in the root node after inserting a key value $3$ in the given B+ Tree?`,
    options: [
      { label: "A", text: "$5$" },
      { label: "B", text: "$8$" },
      { label: "C", text: "$3$ and $5$" },
      { label: "D", text: "$3, 5$ and $8$" }
    ]
  },
  {
    number: 42,
    marks: 2,
    type: "mcq",
    subject: "database-management-and-warehousing",
    stem: `Consider the given relations $X, Y$ and $Z$. The relation $X$ has three columns $P, Q$ and $R$. The relation $Y$ has three columns $P, Q$ and $S$. The relation $Z$ has two columns $P$ and $T$.<br /><table class="da-latex-table"><thead><tr><th colspan="3">X</th><th colspan="3">Y</th><th colspan="2">Z</th></tr><tr><th>P</th><th>Q</th><th>R</th><th>P</th><th>Q</th><th>S</th><th>P</th><th>T</th></tr></thead><tbody><tr><td>P1</td><td>Q1</td><td>R1</td><td>P1</td><td>Q1</td><td>2</td><td>P1</td><td>T1</td></tr><tr><td>P2</td><td>Q2</td><td>R2</td><td>P1</td><td>Q2</td><td>5</td><td>P3</td><td>T2</td></tr><tr><td>P3</td><td>Q3</td><td>R2</td><td>P2</td><td>Q1</td><td>6</td><td>P4</td><td>T3</td></tr><tr><td></td><td></td><td></td><td>P3</td><td>Q3</td><td>1</td><td>P4</td><td>NULL</td></tr></tbody></table><br />Consider the relational algebra expression:<br />$$\\Pi_{P, R, S} \\Big[ \\big(\\sigma_{Q = Q_3 \\lor R = R_2}(X \\bowtie Y)\\big) \\bowtie \\big(\\sigma_{S > 1}(Y \\bowtie Z)\\big) \\Big]$$<br />where $\\bowtie$ denotes natural join operation.<br />Which of the following options is the correct output for the given expression?`,
    options: [
      { label: "A", text: "Two rows: (P1, R1, 2) and (P1, R1, 5)" },
      { label: "B", text: "Three rows: (P1, R1, 2), (P1, R1, 5) and (P2, R2, 6)" },
      { label: "C", text: "One row: (P1, R1, 2)" },
      { label: "D", text: "Zero rows" }
    ]
  },
  {
    number: 43,
    marks: 2,
    type: "mcq",
    subject: "database-management-and-warehousing",
    stem: `Consider the concept hierarchies as shown in the figure.<br /><div style="text-align: center; margin: 12px 0;"><img src="/question-images/da/853ec7b0c94134ec4240.webp" alt="Concept hierarchies" style="max-width: 420px;" loading="lazy" /></div><br />Which of the following options denotes the total number of possible data cuboids from these concept hierarchies?`,
    options: [
      { label: "A", text: "$4^3$" },
      { label: "B", text: "$2^3$" },
      { label: "C", text: "$2!$" },
      { label: "D", text: "$4!$" }
    ]
  },
  {
    number: 44,
    marks: 2,
    type: "mcq",
    subject: "probability-and-statistics",
    stem: "Let $X$ and $Y$ be two independent random variables. $X$ follows $\\text{Bernoulli}(p = 0.3)$ distribution and $Y$ follows $\\text{Normal}(\\mu = 0, \\sigma^2 = 100)$ distribution.<br />Which of the following options is the variance of $(2X - 1)Y$?",
    options: [
      { label: "A", text: "$100$" },
      { label: "B", text: "$90$" },
      { label: "C", text: "$49$" },
      { label: "D", text: "$21$" }
    ]
  },
  {
    number: 45,
    marks: 2,
    type: "mcq",
    subject: "calculus-and-optimization",
    stem: "Let $$L = \\lim_{n \\to \\infty} \\sum_{k=0}^n \\frac{e^{-n} n^k}{k!}$$Which of the following is the value of $L$?",
    options: [
      { label: "A", text: "$0.5$" },
      { label: "B", text: "$1.0$" },
      { label: "C", text: "$0$" },
      { label: "D", text: "$e^{-1}$" }
    ]
  },
  {
    number: 46,
    marks: 2,
    type: "mcq",
    subject: "linear-algebra",
    stem: "Let $\\gamma_1, \\gamma_2, \\gamma_3$ be the eigenvalues of the matrix $$\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & \\cos t & \\sin t \\\\ 0 & -\\sin t & \\cos t \\end{bmatrix}$$where $t \\in [-\\pi, \\pi]$ is in radians.<br />Which one of the following options lists all the possible values of $t$ satisfying $\\gamma_1 + \\gamma_2 + \\gamma_3 = 1 + \\sqrt{2}$?",
    options: [
      { label: "A", text: "$\\left\\{ \\frac{\\pi}{3}, -\\frac{\\pi}{4} \\right\\}$" },
      { label: "B", text: "$\\left\\{ \\frac{\\pi}{4}, -\\frac{\\pi}{3} \\right\\}$" },
      { label: "C", text: "$\\left\\{ \\frac{\\pi}{4}, -\\frac{\\pi}{4} \\right\\}$" },
      { label: "D", text: "$\\left\\{ \\frac{\\pi}{3}, -\\frac{\\pi}{3} \\right\\}$" }
    ]
  },
  {
    number: 47,
    marks: 2,
    type: "msq",
    subject: "machine-learning",
    stem: "Consider that $20$ stories of Author X and $10$ stories of Author Y were kept together without mentioning the names of the authors. A classifier was then asked to predict the author (X or Y) of each of these stories. Let, out of X’s stories, $6$ were classified as that of Y. On the other hand, out of Y’s stories, $2$ were classified as that of X.<br />Considering X and Y as two classes, which of the following statements is/are true?",
    options: [
      { label: "A", text: "Accuracy of the classifier is $11/15$." },
      { label: "B", text: "Precision of Class X is higher than the Precision of Class Y." },
      { label: "C", text: "Recall of Class X is higher than the Recall of Class Y." },
      { label: "D", text: "Accuracy of the classifier is $14/15$." }
    ]
  },
  {
    number: 48,
    marks: 2,
    type: "msq",
    subject: "artificial-intelligence",
    stem: "Let $P(x)$ be a predicate.<br />Which of the following statements is/are NOT valid in first-order logic?",
    options: [
      { label: "A", text: "$\\forall x \\; P(x) \\implies \\exists x \\; P(x)$" },
      { label: "B", text: "$\\exists x \\; P(x) \\implies \\forall x \\; P(x)$" },
      { label: "C", text: "$\\exists x \\; P(x) \\iff \\forall x \\; P(x)$" },
      { label: "D", text: "$\\forall x \\; P(x) \\implies \\exists x \\; \\neg P(x)$" }
    ]
  },
  {
    number: 49,
    marks: 2,
    type: "msq",
    subject: "programming-data-structures-and-algorithms",
    stem: "Consider the problem of sorting the given array in ascending order: $P = [1, 2, 3, 5, 4]$.<br />Consider two sorting algorithms Bubble Sort (BS) and Insertion Sort (IS).<br />Let $N_1$ be the total number of comparisons done by BS on the elements of $P$ and $N_2$ be the total number of comparisons done by IS on the elements of $P$.<br />Which of the following options is/are correct?",
    options: [
      { label: "A", text: "$N_1 = 10, \\; N_2 = 4$" },
      { label: "B", text: "$N_1 > N_2$" },
      { label: "C", text: "IS on $P$ will perform only one swap" },
      { label: "D", text: "Both BS and IS on $P$ will make at least one unnecessary comparison (i.e., comparing elements that are already in correct order)" }
    ]
  },
  {
    number: 50,
    marks: 2,
    type: "msq",
    subject: "programming-data-structures-and-algorithms",
    stem: `Consider the given Python program.<br /><pre><code class="language-python">def outer():\n    x = []\n    def inner(val):\n        x.append(val)\n        return x\n    return inner\n\nf1 = outer()\nf2 = outer()\nprint(f1(10)) # Line P\nprint(f1(20)) # Line Q\nprint(f2(30)) # Line R\nprint(f1(40)) # Line S</code></pre><br />Which of the following options is/are correct?`,
    options: [
      { label: "A", text: "<code>f1</code> and <code>f2</code> share the same list <code>x</code>" },
      { label: "B", text: "Output of Line Q is <code>[10, 20]</code>" },
      { label: "C", text: "Output of Line R is <code>[10, 20, 30]</code>" },
      { label: "D", text: "Output of Line S is <code>[10, 20, 40]</code>" }
    ]
  },
  {
    number: 51,
    marks: 2,
    type: "msq",
    subject: "database-management-and-warehousing",
    stem: `Consider a table <code>Employee(EmpID, TeamID)</code>, where the column <code>EmpID</code> (ID of an employee) is the primary key. The column <code>TeamID</code> denotes the team ID of the team of which the employee is a member. <code>TeamID</code> is a <code>NOT NULL</code> column.<br />We want to display the size of the team (denoted as <code>TeamSize</code>) in which each employee is a member by using SQL. As an example, the desired output for the given Employee table is also shown in tabular form.<br /><table class="da-latex-table"><thead><tr><th colspan="2">Employee</th><th colspan="2">Output</th></tr><tr><th>EmpID</th><th>TeamID</th><th>EmpID</th><th>TeamSize</th></tr></thead><tbody><tr><td>1</td><td>8</td><td>1</td><td>3</td></tr><tr><td>2</td><td>8</td><td>2</td><td>3</td></tr><tr><td>3</td><td>8</td><td>3</td><td>3</td></tr><tr><td>4</td><td>7</td><td>4</td><td>2</td></tr><tr><td>5</td><td>7</td><td>5</td><td>2</td></tr><tr><td>6</td><td>9</td><td>6</td><td>1</td></tr></tbody></table><br />Which of the following is/are correct?`,
    options: [
      { label: "A", text: "SELECT E.EmpID, B.TeamSize FROM Employee AS E, (SELECT TeamID, COUNT(TeamID) AS TeamSize FROM Employee GROUP BY TeamID) AS B WHERE E.TeamID = B.TeamID" },
      { label: "B", text: "SELECT A.EmpID, COUNT(B.TeamID) AS TeamSize FROM Employee AS A, Employee AS B WHERE A.TeamID = B.TeamID AND A.EmpID = B.EmpID GROUP BY A.EmpID" },
      { label: "C", text: "SELECT B.EmpID, B.TeamSize FROM (SELECT EmpID, COUNT(TeamID) AS TeamSize FROM Employee GROUP BY EmpID) AS B" },
      { label: "D", text: "SELECT A.EmpID, B.TeamSize FROM Employee AS A, (SELECT COUNT(TeamID) AS TeamSize FROM Employee GROUP BY TeamID) AS B WHERE A.TeamID = B.TeamID" }
    ]
  },
  {
    number: 52,
    marks: 2,
    type: "msq",
    subject: "linear-algebra",
    stem: "Let $M = \\left(I_n - \\frac{1}{n} \\mathbf{1}\\mathbf{1}^T\\right)$ be a matrix, where $\\mathbf{1} = (1, 1, 1, \\dots, 1)^T \\in \\mathbb{R}^n$ and $I_n$ is the identity matrix of order $n$.<br />Which of the following options is/are correct?",
    options: [
      { label: "A", text: "$M^T = M$" },
      { label: "B", text: "$M^2 = I_n$" },
      { label: "C", text: "$\\text{Trace}(M) = n$" },
      { label: "D", text: "$M$ is a projection matrix" }
    ]
  },
  {
    number: 53,
    marks: 2,
    type: "msq",
    subject: "probability-and-statistics",
    stem: "Let $X_1, X_2, \\dots, X_n$ be $n$ independent random variables. Each of the random variables follows $\\text{Normal}(\\mu = 0, \\sigma^2 = 1)$ distribution. Define $\\bar{X} = \\frac{1}{n} \\sum_{i=1}^n X_i$.<br />Which of the following statements is/are correct?",
    options: [
      { label: "A", text: "$\\sum_{i=1}^n X_i^2$ follows Chi-square distribution with $n$ degrees of freedom." },
      { label: "B", text: "$\\sum_{i=1}^n (X_i - \\bar{X})^2$ follows Chi-square distribution with $(n - 1)$ degrees of freedom." },
      { label: "C", text: "$X_1^2 + X_n^2$ follows exponential distribution with mean $2$." },
      { label: "D", text: "$(\\sqrt{n}\\bar{X})^2$ follows Chi-square distribution with $2$ degrees of freedom." }
    ]
  },
  {
    number: 54,
    marks: 2,
    type: "msq",
    subject: "probability-and-statistics",
    stem: "Let $X$ be a discrete valued random variable with cumulative distribution function $F(x)$.<br />Which of the following statements is/are correct?",
    options: [
      { label: "A", text: "$F(x)$ is always a positive function." },
      { label: "B", text: "$F(x)$ is a non-decreasing function." },
      { label: "C", text: "$F(x)$ has jump discontinuity." },
      { label: "D", text: "$F(x)$ is a left continuous function." }
    ]
  },
  {
    number: 55,
    marks: 2,
    type: "nat",
    subject: "machine-learning",
    stem: "Consider that Linear Ridge Regression is being used to learn a prediction function $y_{\\mathrm{pred}} = w^T x$, where $w, x \\in \\mathbb{R}^2$ and Mean Absolute Error (MAE) is used to measure the prediction error. A weight of $0.20$ is associated with the regularizer. At an intermediate step of the training process, assume that the parameter $w = [-3.00, 4.00]^T$. In the next step, for the input $x = [1.00, 2.00]^T$, the predicted value of $y$ is noted. Let the relation between $x = [x_1, x_2]^T$ and the true value of $y$ be $y_{\\mathrm{true}} = x_1 + x_2$.<br />The value of the overall regularized loss function for this instance is _______ . (Rounded off to two decimal places)",
    options: []
  },
  {
    number: 56,
    marks: 2,
    type: "nat",
    subject: "machine-learning",
    stem: "Consider a fully-connected feed-forward multi-layer perceptron. It has $30$ neurons in the input layer, followed by two hidden layers and an output layer. The first hidden layer has $4$ neurons and the second hidden layer has $3$ neurons. The output layer has only one neuron. Assume that no bias parameters are used.<br />The number of learnable parameters in the multi-layer perceptron is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 57,
    marks: 2,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "A clinic specializes in testing for a disease D. The result of the test can be either positive or negative.<br />A study revealed that if a person suffers from the disease D, the test result in that clinic comes out positive $80\\%$ of the time, and negative $20\\%$ of the time. If a person is not suffering from the disease D, the test comes out positive $10\\%$ of the time and negative $90\\%$ of the time. It is also known that among the general population, the disease D occurs in $30\\%$ of the individuals.<br />If a person tests positive for D in that clinic, the probability that he/she actually suffers from the disease D is __________ . (Rounded off to two decimal places)",
    options: []
  },
  {
    number: 58,
    marks: 2,
    type: "nat",
    subject: "programming-data-structures-and-algorithms",
    stem: `Consider the given Python program.<br /><pre><code class="language-python">def fun(L, i=0):\n    if i >= len(L)-1:\n        return 0\n    if L[i] > L[i+1]:\n        L[i+1], L[i] = L[i], L[i+1]\n        return 1 + fun(L, i+1)\n    else:\n        return fun(L, i+1)\n\ndata = [5, 3, 4, 1, 2]\ncount = 0\nfor _ in range(len(data)):\n    count += fun(data)\nprint(count)</code></pre><br />The output of the program is __________ . (Answer in integer)`,
    options: []
  },
  {
    number: 59,
    marks: 2,
    type: "nat",
    subject: "database-management-and-warehousing",
    stem: "Let there be two relations $X$ and $Y$ as shown. $X$ has three columns $P, Q$ and $R$. $Y$ has two columns $P$ and $S$.<br />$$\\begin{array}{|c|c|c|c|c|}\\hline \\textbf{X} & & & \\textbf{Y} & \\\\ \\hline P & Q & R & P & S \\\\ \\hline P_1 & Q_1 & R_1 & P_1 & 10 \\\\ \\hline P_2 & Q_2 & R_2 & P_1 & 15 \\\\ \\hline P_3 & Q_3 & R_2 & P_2 & 20 \\\\ \\hline & & & P_3 & 1 \\\\ \\hline\\end{array}$$<br />Consider that the following tuple relational calculus expression is evaluated:<br />$\\{t \\mid t \\in X \\land \\exists z \\in X(t[P] = z[P]) \\land \\exists m \\in Y(m[P] = t[P] \\land m[S] > 1)\\}$<br />The number of tuples that will be returned is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 60,
    marks: 2,
    type: "nat",
    subject: "database-management-and-warehousing",
    stem: `Let <code>Account</code> be a relation as shown.<br /><table class="da-latex-table"><thead><tr><th>AccNo</th><th>Balance</th></tr></thead><tbody><tr><td>A1</td><td>5000</td></tr><tr><td>A2</td><td>5000</td></tr><tr><td>A3</td><td>10000</td></tr><tr><td>A4</td><td>15000</td></tr><tr><td>A5</td><td>18000</td></tr></tbody></table><br />Consider the given SQL query:<br /><pre><code class="language-sql">SELECT AccNo FROM Account AS A\nWHERE (SELECT COUNT(*) FROM Account AS B\n       WHERE A.Balance < B.Balance) >= (SELECT COUNT(*)\n                                       FROM Account AS C\n                                       WHERE A.Balance > C.Balance)</code></pre><br />The number of rows returned by the SQL query is __________ . (Answer in integer)`,
    options: []
  },
  {
    number: 61,
    marks: 2,
    type: "nat",
    subject: "database-management-and-warehousing",
    stem: "Consider an ER model with the entities $E_1(A_{11}, A_{12}, A_{13})$ and $E_2(A_{21}, A_{22}, A_{23})$, where $A_{11}, A_{12}, A_{13}$ are the attributes of $E_1$, and $A_{21}, A_{22}, A_{23}$ are the attributes of $E_2$. Let $A_{22}$ be a multi-valued attribute. $A_{11}$ and $A_{21}$ are the primary keys of $E_1$ and $E_2$, respectively.<br />Let $R_{12}$ be a many-to-many relationship between $E_1$ and $E_2$. Participation of both $E_1$ and $E_2$ in $R_{12}$ is total.<br />The minimum number of relations required to convert the ER model into relational model (assuming there is no other functional dependency) where each relation is in third normal form (3NF) is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 62,
    marks: 2,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "For a given data set $\\{x_1, x_2, \\dots, x_n\\}$, where $n = 100$, it is known that $$\\frac{1}{2000} \\sum_{i=1}^n \\sum_{j=1}^n (x_i - x_j)^2 = 99$$Let us denote $\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i$.<br />The value of $$\\frac{1}{99} \\sum_{i=1}^n (x_i - \\bar{x})^2$$is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 63,
    marks: 2,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "Let $X$ be a random variable that follows $\\text{Uniform}(-1, 1)$ distribution. The conditional distribution of the random variable $Y$ given $X = x$ is the $\\text{Uniform}(x^2 - 0.1, x^2 + 0.1)$ distribution.<br />The value of $\\text{Correlation}(X, Y)$ is __________ . (Answer in integer)",
    options: []
  },
  {
    number: 64,
    marks: 2,
    type: "nat",
    subject: "probability-and-statistics",
    stem: "Let $A_{5 \\times 5}$ be a matrix such that each of its elements follows $\\text{Bernoulli}(p = 0.50)$ distribution independently.<br />The probability that the row-sum of the second row and the column-sum of the third column are both equal to $3$ is ________ . (Rounded off to two decimal places)",
    options: []
  },
  {
    number: 65,
    marks: 2,
    type: "nat",
    subject: "linear-algebra",
    stem: "Let $A = \\left(I_n - \\frac{1}{n} \\mathbf{1}\\mathbf{1}^T\\right)$ be a matrix, where $\\mathbf{1} = (1, 1, 1, \\dots, 1)^T \\in \\mathbb{R}^n$ and $I_n$ is the identity matrix of order $n$.<br />The value of $$\\max_{S} x^T A x$$where $S = \\{x \\in \\mathbb{R}^n \\mid x^T x = 1\\}$, is __________ . (Answer in integer)",
    options: []
  }
];

export function buildQuestionsJson() {
  const recordsByQuestionUid = {};
  
  DA_2026_CURATED.forEach((q) => {
    const qnumStr = String(q.number).padStart(3, '0');
    const uid = `local:da2026:q${qnumStr}`;
    const optionsHtml = (q.options && q.options.length > 0)
      ? `<ol class="da-question-options" style="list-style-type: upper-alpha;">${q.options.map(opt => `<li data-option-label="${opt.label}">${opt.text}</li>`).join('')}</ol>`
      : '';
    const fullHtml = `${q.stem}${optionsHtml}`;
    
    recordsByQuestionUid[uid] = {
      title: `GATE DA 2026 | Question: ${q.number}`,
      link: null,
      question: fullHtml,
      tags: [
        "gateda-2026",
        q.subject,
        q.marks === 2 ? "two-marks" : "one-mark",
        q.type.toLowerCase(),
        `question-${q.number}`
      ],
      year: "gateda-2026",
      answer: null,
      number: q.number,
      marks: q.marks,
      type: q.type,
      subject: q.subject,
      stem: q.stem,
      options: q.options
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    shardKey: "2026",
    category: "2026",
    questionCount: 65,
    recordsByQuestionUid
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(process.cwd(), 'scripts', 'da-pipeline', 'curate-da-2026-dataset.mjs')) {
  const jsonPayload = buildQuestionsJson();
  const outputPath = path.resolve(process.cwd(), 'da_2026', 'questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(jsonPayload, null, 2), 'utf8');
  console.log(`[curate-da-2026-dataset] Wrote ${Object.keys(jsonPayload.recordsByQuestionUid).length} curated questions to ${outputPath}`);
}
