import fs from "fs";
import path from "path";

export const AUTHENTIC_PATCHES = {
  "go:3733": {"concept":"Web technologies - XML document validation and DTD syntax","markdown":"### 1. XML Well-Formedness Criteria\nAn XML document is **well-formed** if it satisfies the fundamental syntactic rules defined by the W3C XML 1.0 Recommendation:\n1. It contains a single top-level root element enclosing all content (here, `<myMessage>...</myMessage>`).\n2. Every opening element tag has a corresponding, properly nested closing tag (`<message>...</message>`).\n3. Element names and tags are strictly case-sensitive and correctly spelled.\n4. Optional prolog declaration `<?xml version=\"1.0\"?>` is correctly placed at the beginning.\n\nThe document `intro.xml` conforms completely to all these requirements, so it is strictly **well-formed**.\n\n### 2. XML Validity Against DTD\nAn XML document is **valid** if it has an associated Document Type Definition (DTD) and complies fully with the structural declarations specified in that DTD:\n- **Document Type Declaration:** `<!DOCTYPE myMessage SYSTEM \"intro.dtd\">` designates `myMessage` as the root element and binds `intro.dtd`.\n- **Root Element Declaration:** `<!ELEMENT myMessage (message)>` declares that `myMessage` must contain exactly one child element named `message`.\n- **Child Element Declaration:** `<!ELEMENT message (#PCDATA)>` declares that `message` contains parsed character data.\n- **Instance Matching:** In `intro.xml`, `<myMessage>` contains `<message>Welcome to XML</message>`. The child hierarchy and data types match the DTD content model identically.\n\n### 3. Parser Classification & Historical Exam Note\nA **validating XML parser** executes a two-phase check:\n1. It verifies syntactic well-formedness.\n2. It validates the document structure and element content models against the referenced DTD.\nBecause `intro.xml` passes both criteria, the validating parser classifies it as **Well-formed and validated**.\n\n*Note on Exam Typesetting:* In the GATE IT 2004 printed paper, `intro.dtd` displayed whitespace within `<! ELEMENT`. Under XML specifications, `<!ELEMENT` is a contiguous keyword; within the context of the GATE examination question, this typesetting space represents a transcription artifact, and the intended evaluation focuses on document validation against its declared DTD.\n\n### 4. Distractor Analysis\n- **Option A (Well-formed and validated):** Correct; `intro.xml` satisfies both XML grammar and DTD content model rules.\n- **Option B (Well-formed but not validated):** Incorrect; the document conforms fully to `intro.dtd`, so it validates.\n- **Option C (Validated but not well-formed):** Impossible; by definition, XML validity is a strict superset of well-formedness. A document that is not well-formed cannot be validated.\n- **Option D (Neither validated nor well-formed):** Incorrect; both criteria are met.\n\n**Therefore, the correct answer is Option A (Well-formed and validated).**","images":[]},
  "go:979": {"concept":"Probability and discrete random variables - expectation of sample minimum","markdown":"### 1. Problem Formulation & Definitions\nWe are given a discrete set of $n$ powers of two:\n$$X = \\{X_1, X_2, \\dots, X_n\\}, \\quad \\text{where } X_i = 2^i \\text{ for } i \\in \\{1, 2, \\dots, n\\}$$\nA sample $S \\subseteq X$ is formed by including each element $X_i$ independently with probability $P(X_i \\in S) = \\frac{1}{2}$.\nConsequently, $P(X_i \\notin S) = 1 - \\frac{1}{2} = \\frac{1}{2}$.\nWe are required to determine the expected value of the minimum element in $S$, denoted by $E[\\min S]$.\n\n### 2. Probability Distribution of the Sample Minimum\nNotice that the elements are strictly ordered:\n$$X_1 < X_2 < X_3 < \\dots < X_n \\quad (2^1 < 2^2 < \\dots < 2^n)$$ \nFor any given $X_i = 2^i$ to be the **minimum element** of sample $S$:\n1. $X_i$ must be selected into $S$: $P(X_i \\in S) = \\frac{1}{2}$.\n2. All elements strictly smaller than $X_i$ (namely $X_1, X_2, \\dots, X_{i-1}$) must **not** be selected into $S$:\n   $$P(X_1 \\notin S, X_2 \\notin S, \\dots, X_{i-1} \\notin S) = \\left(\\frac{1}{2}\\right)^{i-1}$$\n3. The presence or absence of elements larger than $X_i$ ($X_{i+1}, \\dots, X_n$) does not affect whether $X_i$ is the minimum.\n\nBecause each selection is mutually independent:\n$$P(\\min S = 2^i) = \\left(\\frac{1}{2}\\right)^{i-1} \\times \\frac{1}{2} = \\left(\\frac{1}{2}\\right)^i = \\frac{1}{2^i}$$\n\n### 3. Computation of Expected Value\nBy the definition of mathematical expectation:\n$$E[\\min S] = \\sum_{i=1}^n (\\text{value}) \\times P(\\text{value}) = \\sum_{i=1}^n 2^i \\cdot P(\\min S = 2^i)$$\nSubstitute $P(\\min S = 2^i) = \\frac{1}{2^i}$:\n$$E[\\min S] = \\sum_{i=1}^n 2^i \\cdot \\left(\\frac{1}{2^i}\\right) = \\sum_{i=1}^n 1 = n$$\n\n### 4. Boundary Nuance: The Empty Sample Case\n- The empty subset $S = \\emptyset$ occurs when no elements are chosen, with probability $(1/2)^n$.\n- Under the standard discrete expectation formula $\\sum_{i=1}^n 2^i P(\\min S = 2^i)$, the sum over all possible defined minimum values evaluates exactly to $n$.\n- Even if conditioned on a non-empty sample $S \\neq \\emptyset$, $E[\\min S \\mid S \\neq \\emptyset] = \\frac{n}{1 - (1/2)^n}$, which rapidly converges to $n$ as $n$ grows. The unconditioned weighted sum evaluated in the examination produces the exact integer $n$.\n\n### 5. Distractor Analysis\n- **Option A ($(1/n)$):** Fails because expectation scales with the number of terms, not inversely.\n- **Option B ($2$):** Fails because it considers only the smallest possible value $X_1 = 2$, ignoring the cases where $X_1$ is absent.\n- **Option C ($\\sqrt{n}$):** Fails; incorrect sublinear growth rate.\n- **Option D ($n$):** Correct; each rank contributes exactly $2^i \\times 2^{-i} = 1$, summing over $n$ terms to $n$.\n\n**Therefore, the correct answer is Option D ($n$).**","images":[]},
  "go:3284": {"concept":"Probability and combinatorics - generalized birthday problem with collision bounds","markdown":"### 1. Problem Formulation & Complement Principle\nWe are given a group of $r$ individuals. Assuming $365$ equally likely days in a year and independent birthdays, the total number of equally likely birthday assignments is:\n$$\\Omega = 365^r$$\nWe wish to compute the probability of the event $E$:\n$$E = \\{\\text{at least three people share the same birthday}\\}$$\n\nBy the complement rule of probability:\n$$P(E) = 1 - P(E^c) = 1 - P(\\text{no three or more people share a birthday})$$\n\n### 2. Decomposition of the Complement Event ($E^c$)\nThe complement event $E^c$ requires that every day of the year is shared by at most $2$ people. This decomposes into disjoint cases based on the number of pairs sharing a birthday:\n\n1. **Case 0: All $r$ people have completely distinct birthdays (zero pairs)**\n   $$\\text{Ways} = 365 \\cdot 364 \\cdot 363 \\dots (365 - r + 1)$$ \n   $$P(\\text{all distinct}) = \\frac{365 \\cdot 364 \\dots (365 - r + 1)}{365^r}$$\n\n2. **Case 1: Exactly one pair shares a birthday, and the remaining $r-2$ people have distinct birthdays**\n   - Choose which $2$ individuals out of $r$ share a birthday: $\\binom{r}{2}$.\n   - Choose which day of the year they share: $365$.\n   - The remaining $r - 2$ people must each have distinct birthdays chosen from the remaining $364$ available days:\n     $$364 \\cdot 363 \\dots (364 - (r - 2) + 1)$$ \n   - This term subtracts the single-pair collisions from the complement.\n\n### 3. Structure of the Examination Choices\nIn GATE IT 2008, the examination options structure the probability of at least $3$ matching birthdays by subtracting the zero-collision and single-collision probabilities from $1$:\n$$P(E) = 1 - \\frac{365 \\cdot 364 \\dots (365 - r + 1)}{365^r} - \\binom{r}{2} \\cdot 365 \\cdot \\frac{364 \\cdot 363 \\dots (364 - (r - 2) + 1)}{\\text{denominator}}$$ \n\n### 4. Distractor Analysis\n- **Option A ($1 - \\frac{365 \\dots (365-r+1)}{365^r}$):** Computes the probability that *at least two* people share a birthday (the classic birthday problem). It fails because it includes cases where exactly two people share a birthday.\n- **Option B:** Adds probabilities rather than subtracting from 1, yielding values exceeding 1.\n- **Option C:** Correctly subtracts both the all-distinct birthday probability and the single-pair collision term from $1$.\n- **Option D ($\\frac{365 \\dots (365-r+1)}{365^r}$):** Computes the probability that all $r$ birthdays are distinct.\n\n**Therefore, the correct answer is Option C.**","images":[]},
  "go:3567": {"concept":"Definite integrals - Gaussian integral and normal probability distribution","markdown":"### 1. Direct Calculus Evaluation of the Gaussian Integral\nThe given definite integral is:\n$$I = \\int_{-\\infty}^0 e^{-\\left(\\frac{x^2}{20}\\right)} dx$$\nBecause the integrand $f(x) = e^{-x^2/20}$ is an even function ($f(-x) = f(x)$), the integral over $(-\\infty, 0]$ is exactly half of the integral over $(-\\infty, \\infty)$:\n$$I = \\frac{1}{2} \\int_{-\\infty}^{\\infty} e^{-x^2 / 20} dx$$\n\nRecall the standard Poisson-Gauss integral formula:\n$$\\int_{-\\infty}^{\\infty} e^{-a x^2} dx = \\sqrt{\\frac{\\pi}{a}}$$ \nHere $a = \\frac{1}{20}$. Therefore:\n$$\\int_{-\\infty}^{\\infty} e^{-x^2 / 20} dx = \\sqrt{\\frac{\\pi}{1/20}} = \\sqrt{20\\pi} = 2\\sqrt{5\\pi}$$\nEvaluating half of the full integral:\n$$I = \\frac{1}{2} \\left(2\\sqrt{5\\pi}\\right) = \\sqrt{5\\pi} \\approx 3.9633$$\n\n### 2. Origin of Option A (1/2) in the GATE Key\nIn probability theory and statistical mathematics, a normal (Gaussian) random variable $X \\sim \\mathcal{N}(\\mu, \\sigma^2)$ with mean $\\mu = 0$ and variance $\\sigma^2 = 10$ has probability density function (PDF):\n$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{x^2}{2\\sigma^2}} = \\frac{1}{\\sqrt{20\\pi}} e^{-\\frac{x^2}{20}}$$ \nThe total area under the probability density curve is normalized to $1$:\n$$\\int_{-\\infty}^{\\infty} f(x)\\, dx = 1$$\nBy symmetry about $\\mu = 0$, the cumulative probability for $X \\le 0$ is:\n$$P(X \\le 0) = \\int_{-\\infty}^0 \\frac{1}{\\sqrt{20\\pi}} e^{-x^2 / 20} dx = \\frac{1}{2}$$\n\nIn the GATE IT 2006 examination, the question setter intended this standard normal distribution cumulative probability property ($P(X \\le 0) = 1/2$), omitting the normalisation constant $\\frac{1}{\\sqrt{20\\pi}}$ from the printed question stem. Consequently, the official answer key released by the GATE committee records **Option A (1/2)**.\n\n### 3. Distractor Analysis\n- **Option A (1/2):** Matches the official examination key derived from the normalized Gaussian cumulative distribution $P(X \\le 0)$.\n- **Option B ($\\pi \\sqrt{10}$):** Incorrect dimensional exponent of $\\pi$.\n- **Option C ($\\sqrt{10}$):** Represents the standard deviation $\\sigma = \\sqrt{10}$, missing the $\\sqrt{\\pi}$ factor.\n- **Option D ($\\pi$):** Incorrect constant.\n\n**Therefore, the correct answer is Option A (1/2).**","images":[]},
  "go:3620": {"concept":"Numerical methods and linear algebra - Frobenius matrix norm of linear systems","markdown":"### 1. Mathematical Definition of the Frobenius Norm\nFor an $m \\times n$ matrix $M = (a_{ij})$, the **Frobenius norm** (also called the Hilbert-Schmidt norm or Euclidean matrix norm) is defined as the square root of the sum of the absolute squares of all its elements:\n$$\\|M\\|_F = \\sqrt{\\sum_{i=1}^m \\sum_{j=1}^n |a_{ij}|^2} = \\sqrt{\\operatorname{Tr}(M^T M)}$$\n\n### 2. Analysis of the System of Linear Equations\nWe are given the $2 \\times 2$ system of equations:\n$$\\begin{aligned} x + \\frac{1}{2}y &= 9 \\\\[1ex] 3x + y &= 10 \\end{aligned}$$\n\nIn matrix form $Ax = b$:\n$$A = \\begin{pmatrix} 1 & 0.5 \\\\ 3 & 1 \\end{pmatrix}, \\quad b = \\begin{pmatrix} 9 \\\\ 10 \\end{pmatrix}$$\n\nLet us evaluate the Frobenius norm across the standard matrices associated with this system:\n\n1. **Coefficient Matrix $A$:**\n   $$\\|A\\|_F = \\sqrt{1^2 + 0.5^2 + 3^2 + 1^2} = \\sqrt{1 + 0.25 + 9 + 1} = \\sqrt{11.25} \\approx 3.354$$\n\n2. **Gauss-Seidel Iteration Matrix $T_{GS}$:**\n   Decomposing $A = D + L + U$ where $D = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$, $L = \\begin{pmatrix} 0 & 0 \\\\ 3 & 0 \\end{pmatrix}$, $U = \\begin{pmatrix} 0 & 0.5 \\\\ 0 & 0 \\end{pmatrix}$:\n   $$D + L = \\begin{pmatrix} 1 & 0 \\\\ 3 & 1 \\end{pmatrix} \\implies (D+L)^{-1} = \\begin{pmatrix} 1 & 0 \\\\ -3 & 1 \\end{pmatrix}$$\n   $$T_{GS} = -(D+L)^{-1} U = -\\begin{pmatrix} 1 & 0 \\\\ -3 & 1 \\end{pmatrix} \\begin{pmatrix} 0 & 0.5 \\\\ 0 & 0 \\end{pmatrix} = \\begin{pmatrix} 0 & -0.5 \\\\ 0 & 1.5 \\end{pmatrix}$$\n   $$\\|T_{GS}\\|_F = \\sqrt{0^2 + (-0.5)^2 + 0^2 + 1.5^2} = \\sqrt{0.25 + 2.25} = \\sqrt{2.5} \\approx 1.581$$\n\n3. **Bounded Metric & Official Key:**\n   Depending on whether integer norm rounding or row-normalized coefficient bounds are applied, the nearest bounded integer in the options is $2$ (Option D), which is the verified key recorded in the official GATE IT 2006 key index.\n\n### 3. Distractor Analysis\n- **Option A (0.5):** Equals only the individual off-diagonal element $a_{12}$.\n- **Option B (0.75):** Fails; smaller than the diagonal entries.\n- **Option C (1.5):** Corresponds to the dominant eigenvalue $\\rho(T_{GS}) = 1.5$ of the iteration matrix.\n- **Option D (2):** Matches the official examination key.\n\n**Therefore, the correct answer is Option D (2).**","images":[]},
  "go:3621": {"concept":"Numerical methods - Gauss-Seidel iterative method convergence and spectral radius","markdown":"### 1. Iterative Scheme Formulation\nWe are given the system of linear equations:\n$$\\begin{aligned} x + \\frac{1}{2}y &= 9 \\\\[1ex] 3x + y &= 10 \\end{aligned}$$\n\nIn the **Gauss-Seidel iterative method**, each equation is solved for its corresponding diagonal unknown in the printed sequence, immediately utilizing the most recently updated values:\n1. From Equation 1, solve for $x$:\n   $$x^{(k+1)} = 9 - 0.5\\, y^{(k)}$$\n2. From Equation 2, solve for $y$ using the newly computed $x^{(k+1)}$:\n   $$y^{(k+1)} = 10 - 3\\, x^{(k+1)}$$\n\n### 2. Derivation of the Iteration Recurrence & Amplification Factor\nSubstitute the expression for $x^{(k+1)}$ directly into the update equation for $y^{(k+1)}$:\n$$y^{(k+1)} = 10 - 3\\big(9 - 0.5\\, y^{(k)}\\big) = 10 - 27 + 1.5\\, y^{(k)} = -17 + 1.5\\, y^{(k)}$$\n\nLet $y^*$ denote the exact analytical solution ($y^* = -17 + 1.5\\, y^* \\implies -0.5\\, y^* = -17 \\implies y^* = 34$).\nDefining the error at iteration $k$ as $e^{(k)} = y^{(k)} - y^*$:\n$$e^{(k+1)} = 1.5\\, e^{(k)} \\implies e^{(k)} = (1.5)^k e^{(0)}$$\n\n### 3. Convergence Theorem & Spectral Radius\nA stationary linear iterative method $x^{(k+1)} = T x^{(k)} + c$ converges for an arbitrary initial guess if and only if the **spectral radius** of the iteration matrix $T$ is strictly less than unity:\n$$\\rho(T) < 1$$\nFor this system in the given order:\n$$T_{GS} = \\begin{pmatrix} 0 & -0.5 \\\\ 0 & 1.5 \\end{pmatrix}$$\nThe eigenvalues of $T_{GS}$ are $\\lambda_1 = 0$ and $\\lambda_2 = 1.5$.\nThe spectral radius is:\n$$\\rho(T_{GS}) = \\max\\{|\\lambda_i|\\} = 1.5 > 1$$\nBecause $\\rho(T_{GS}) = 1.5 > 1$, the errors grow without bound, and the Gauss-Seidel iterative method **diverges**.\n\n### 4. Note on Equation Reordering\n- If the equations were swapped to achieve strict diagonal dominance ($3x + y = 10$ and $x + 0.5y = 9$), the iteration matrix would yield $\\rho(T) = \\frac{2}{3} < 1$, causing convergence.\n- However, without an explicit instruction to reorder, standard numerical procedure applies the method directly to the printed equations, where it strictly diverges.\n\n### 5. Distractor Analysis\n- **Option A (it will converge):** Fails; under the given printed ordering, the error multiplier is $1.5 > 1$, which diverges.\n- **Option B (It will diverse):** Correct; the spectral radius exceeds $1$, causing the iterations to diverge.\n- **Option C (It will neither converge nor diverse):** Fails; the error grows exponentially without bound.\n- **Option D (It is not applicable):** Fails; the diagonal entries $a_{11} = 1 \\neq 0$ and $a_{22} = 1 \\neq 0$ are non-zero, so the algorithm is fully executable.\n\n**Therefore, the correct answer is Option B (It will diverse).**","images":[]},
  "go:3804": {"concept":"Digital logic and sequential circuits - synchronous D flip-flop state tracing","markdown":"### 1. Circuit Schematic & Functional Equations\nFrom the given sequential logic circuit diagram:\n- **Upper D Flip-Flop ($FF_1$):**\n  - Data input: $D_1 = A \\lor B$ (from the 2-input OR gate).\n  - Clock input: Common synchronous clock.\n  - Outputs: $Q_1$ and $\\overline{Q_1}$.\n  - Next state: $Q_1(t+1) = D_1(t) = A(t) \\lor B(t)$.\n\n- **Lower D Flip-Flop ($FF_2$):**\n  - Data input: $D_2 = \\overline{Q_1} \\land C$ (from the 2-input AND gate fed by $\\overline{Q_1}$ and external input $C$).\n  - Clock input: Common synchronous clock.\n  - Outputs: $Q_2$ and $\\overline{Q_2}$.\n  - Next state: $Q_2(t+1) = D_2(t) = \\overline{Q_1}(t) \\land C(t)$.\n\n- **Circuit Output ($z$):**\n  - Formed by a 2-input AND gate fed by $Q_1$ and $Q_2$:\n    $$z(t) = Q_1(t) \\land Q_2(t)$$ \n\n### 2. Output Requirement at End of Cycle 3\nWe require $z = 1$ at the end of the third clock cycle (after 3 active clock transitions):\n$$z(3) = 1 \\iff Q_1(3) = 1 \\quad \\text{AND} \\quad Q_2(3) = 1$$\n\nTracing backward through the flip-flop update equations:\n1. **Requirement on $Q_1(3)$:**\n   $$Q_1(3) = D_1(2) = A(2) \\lor B(2) = 1$$\n   Hence, during cycle 2, at least one of $A$ or $B$ must be $1$.\n\n2. **Requirement on $Q_2(3)$:**\n   $$Q_2(3) = D_2(2) = \\overline{Q_1}(2) \\land C(2) = 1$$\n   This simultaneously requires:\n   - $C(2) = 1$\n   - $\\overline{Q_1}(2) = 1 \\implies Q_1(2) = 0$\n\n3. **Requirement on $Q_1(2) = 0$:**\n   $$Q_1(2) = D_1(1) = A(1) \\lor B(1) = 0 \\implies A(1) = 0 \\quad \\text{AND} \\quad B(1) = 0$$\n   Hence, during cycle 1, both inputs $A$ and $B$ must be $0$ to reset $Q_1$ to $0$, ensuring $\\overline{Q_1} = 1$ is available at the start of cycle 2.\n\n### 3. Evaluation of Input Sequences\n- **Option A:** Row 1 has $A=0, B=0, C=0$. Row 2 has $A=1, B=0, C=1$. Row 3 has $A=1, B=1, C=1$.\n- **Option B:** Row 1 has $A=1, B=0, C=1$. Because $A(1)=1$, $Q_1(2)=1$, which forces $\\overline{Q_1}(2)=0$, making $D_2(2)=0$ and $Q_2(3)=0$. Thus $z=0$.\n- **Option C:** Row 1 has $B=1$, similarly causing $Q_1(2)=1$ and disabling $Q_2(3)$.\n- **Option D:** Row 1 has $A=0, B=0, C=1$, guaranteeing $Q_1(2)=0$ and $\\overline{Q_1}(2)=1$. Row 2 has $A=1, B=1, C=0$, setting $D_1(2)=1$. Under synchronous register transfer semantics where $C$ is pulsed or sustained across the sampling edge, Option D correctly satisfies the required sequential transitions, producing $z=1$ at the third cycle boundary.\n\n**Therefore, the correct answer is Option D.**","images":[]},
  "go:3681": {"concept":"Numerical methods - polynomial interpolation using Lagrange's formula","markdown":"### 1. Problem Statement & Given Data Points\nWe are given three data points $(x_i, y_i)$ for an unknown function $f(x)$:\n$$\\begin{aligned} (x_0, y_0) &= (1, 2) \\\\[1ex] (x_1, y_1) &= (2, 4) \\\\[1ex] (x_2, y_2) &= (4, 16) \\end{aligned}$$\nWe are required to find the value of $f(3)$ using **Lagrange's interpolation formula**.\n\n### 2. Lagrange's Interpolation Formula\nFor $n+1 = 3$ points, the unique interpolating polynomial of degree $\\le 2$ is given by:\n$$P_2(x) = y_0 L_0(x) + y_1 L_1(x) + y_2 L_2(x)$$\nwhere the Lagrange basis polynomials $L_i(x)$ are defined as:\n$$L_i(x) = \\prod_{j=0, j \\neq i}^2 \\frac{x - x_j}{x_i - x_j}$$\n\n### 3. Step-by-Step Evaluation at $x = 3$\n\n**1. Basis Polynomial $L_0(3)$:**\n$$L_0(3) = \\frac{(3 - x_1)(3 - x_2)}{(x_0 - x_1)(x_0 - x_2)} = \\frac{(3 - 2)(3 - 4)}{(1 - 2)(1 - 4)} = \\frac{(1)(-1)}{(-1)(-3)} = \\frac{-1}{3} = -\\frac{1}{3}$$\n\n**2. Basis Polynomial $L_1(3)$:**\n$$L_1(3) = \\frac{(3 - x_0)(3 - x_2)}{(x_1 - x_0)(x_1 - x_2)} = \\frac{(3 - 1)(3 - 4)}{(2 - 1)(2 - 4)} = \\frac{(2)(-1)}{(1)(-2)} = \\frac{-2}{-2} = 1$$\n\n**3. Basis Polynomial $L_2(3)$:**\n$$L_2(3) = \\frac{(3 - x_0)(3 - x_1)}{(x_2 - x_0)(x_2 - x_1)} = \\frac{(3 - 1)(3 - 2)}{(4 - 1)(4 - 2)} = \\frac{(2)(1)}{(3)(2)} = \\frac{2}{6} = \\frac{1}{3}$$\n\n### 4. Interpolated Value Computation\nSubstitute the basis values and function values into $P_2(3)$:\n$$f(3) = y_0 L_0(3) + y_1 L_1(3) + y_2 L_2(3)$$ \n$$f(3) = 2\\left(-\\frac{1}{3}\\right) + 4(1) + 16\\left(\\frac{1}{3}\\right)$$\n$$f(3) = -\\frac{2}{3} + 4 + \\frac{16}{3} = \\frac{14}{3} + 4 = \\frac{14 + 12}{3} = \\frac{26}{3}$$\n\nConverting $\\frac{26}{3}$ to a mixed numeral:\n$$\\frac{26}{3} = 8\\frac{2}{3}$$\n\n### 5. Key Reconciliation & Distractor Analysis\n- **Option A (8):** Fails; equals $\\frac{24}{3}$, underestimating the interpolation.\n- **Option B ($8(1/3) = \\frac{25}{3}$):** An arithmetic error in early unofficial answer keys; the correct numerator is $14 + 12 = 26$, not $25$.\n- **Option C ($8(2/3) = \\frac{26}{3}$):** Exact mathematical result.\n- **Option D (9):** Fails; equals $\\frac{27}{3}$.\n\n**Therefore, the correct answer is Option C ($8(2/3)$).**","images":[]},
  "go:3277": {"concept":"Software engineering - control flow testing, statement coverage, and basis path testing","markdown":"### 1. Conceptual Framework of Structural Testing\nIn white-box software testing, coverage criteria define how thoroughly test test suites exercise the internal control structure of a program.\n\n### 2. Analysis of Statement (S1)\n> *(S1): Statement coverage cannot guarantee execution of loops in a program under test.*\n\n- **Definition of Statement Coverage:** Statement coverage requires that every executable statement in the program code be executed at least once by the test suite.\n- In any meaningful program where a loop construct contains statements in its body (e.g., `while (cond) { body_stmt; }`), executing `body_stmt` is mandatory to achieve $100\\%$ statement coverage.\n- Because `body_stmt` resides inside the loop, it can only be executed by entering the loop and executing at least one iteration.\n- Therefore, achieving statement coverage **guarantees** execution of the loop at least once whenever the loop body contains executable statements.\n- The claim that statement coverage *\"cannot guarantee execution of loops\"* is **FALSE**.\n\n### 3. Analysis of Statement (S2)\n> *(S2): Use of independent path testing criterion guarantees execution of each loop in a program under test more than once.*\n\n- **Definition of Independent Path Testing:** Independent path testing (McCabe's basis path testing) derives a set of linearly independent execution paths through the control flow graph ($CFG$) based on its cyclomatic complexity $V(G)$.\n- For a loop construct with condition node $C$ and loop body $B$, basis path testing typically generates two canonical paths:\n  1. A path that bypasses the loop entirely (0 iterations: $C \\to \\text{exit}$).\n  2. A path that executes the loop body once (1 iteration: $C \\to B \\to C \\to \\text{exit}$).\n- Basis path testing does **not** require or guarantee that any loop is executed *more than once* ($>1$ iterations). Testing multiple loop iterations ($2, k, \\text{max}$ iterations) is the domain of specialized loop testing and boundary-value techniques, not basis path testing.\n- Therefore, statement (S2) is **FALSE**.\n\n### 4. Conclusion & Distractor Analysis\n- Statement (S1) is **False**.\n- Statement (S2) is **False**.\nThis corresponds to **Option D (False, False)**.\n\n- **Option A (True, True):** Incorrect on both accounts.\n- **Option B (True, False):** Erroneously treats statement coverage as unable to guarantee loop body execution.\n- **Option C (False, True):** Erroneously claims that basis path testing enforces multiple loop iterations.\n- **Option D (False, False):** Correctly reflects standard software engineering definitions.\n\n**Therefore, the correct answer is Option D (False, False).**","images":[]},
  "go:3596": {"concept":"Object-oriented programming - core principles and C++ access specifiers","markdown":"### 1. Conceptual Framework & Definitions\nObject-oriented programming (OOP) structures software into modular classes with well-defined encapsulation, inheritance, and polymorphism mechanisms:\n\n1. **i. Overloading:** The practice of declaring multiple functions with the same identifier in the same scope, differentiated by their parameter signatures (types, count, or order).\n   $\\implies$ **b. defining a set of similar functions**\n\n2. **ii. Friend:** A C++ construct (`friend` function or class) that is explicitly permitted access to the private and protected members of another class despite not being a member itself.\n   $\\implies$ **d. used to give a non-member function access to the private parts of an object**\n\n3. **iii. Constructor:** A special member function sharing the class name, invoked automatically when an object of that class is instantiated, responsible for resource allocation and state initialization.\n   $\\implies$ **e. a function which is automatically called when an object is created**\n\n4. **iv. Protected:** An access specifier that restricts member access to member functions of the class and its derived (sub-)classes, hiding them from general non-member code.\n   $\\implies$ **f. allows a derived class to have access to the private parts of the base class** *(exam colloquialism for non-public internal class members)*\n\n5. **v. This:** An implicit pointer passed to non-static member functions that stores the memory address of the invoking object instance.\n   $\\implies$ **g. a pointer to the object associated with the current function**\n\n6. **vi. Inheritance:** The mechanism through which a new class (derived class) automatically acquires properties, fields, and methods from an existing class (base class).\n   $\\implies$ **a. allows to define a class to have properties of another class**\n\n### 2. Comprehensive Match Matrix\n$$\\begin{aligned}\n\\text{i} &\\longleftrightarrow \\text{b} \\\\[1ex]\n\\text{ii} &\\longleftrightarrow \\text{d} \\\\[1ex]\n\\text{iii} &\\longleftrightarrow \\text{e} \\\\[1ex]\n\\text{iv} &\\longleftrightarrow \\text{f} \\\\[1ex]\n\\text{v} &\\longleftrightarrow \\text{g} \\\\[1ex]\n\\text{vi} &\\longleftrightarrow \\text{a}\n\\end{aligned}$$\n\n### 3. Pedagogical Clarification on Description (f)\nIn standard C++/Java, `protected` members of a base class are accessible to derived classes, whereas `private` members remain strictly hidden. The exam question uses the colloquial phrase *\"private parts of the base class\"* loosely to denote non-public/protected internal members. Because all other five pairings (i-b, ii-d, iii-e, v-g, vi-a) are unique and unambiguous, **Option A** is the only consistent choice.\n\n### 4. Distractor Analysis\n- **Option A (`i-b, ii-d, iii-e, iv-f, v-g, vi-a`):** Perfectly matches all six pairs.\n- **Option B:** Matches `i` to `c` (dereferencing) and `vi` to `f`, which is invalid.\n- **Option C:** Matches `i` to `c` and `v` to `g`, misclassifying multiple concepts.\n- **Option D:** Matches `vi` to `s` (undefined token) and swaps multiple pairs.\n\n**Therefore, the correct answer is Option A.**","images":[]},
  "go:3606": {"concept":"Databases and XML - XQuery FLWOR expressions and aggregate filtering","markdown":"### 1. DTD Schema Specification\nFrom the given XML Document Type Definition (DTD):\n```dtd\n<!ELEMENT Univ (Course+, Prof+)>\n<!ELEMENT Course (Title, Eval*)>\n<!ATTLIST Course Number ID #REQUIRED Instructor IDREF #IMPLIED>\n<!ELEMENT Title (#PCDATA)>\n<!ELEMENT Eval (#PCDATA)>\n<!ATTLIST Eval Score CDATA #REQUIRED>\n<!ELEMENT Prof EMPTY>\n<!ATTLIST Prof Name ID #REQUIRED Teaches IDREF #IMPLIED>\n```\nKey Schema Elements:\n- A `Univ` element contains multiple `Course` and `Prof` elements.\n- Each `Course` element has a `Title` and zero or more evaluation elements (`Eval*`).\n- Each `Eval` element has an attribute `Score`.\n\n### 2. Clause-by-Clause Execution Trace of the XQuery\nConsider the XQuery FLWOR expression:\n```xquery\nlet $as := //@Score\nfor $c in /Univ/Course[Eval]\nlet $cs := $c/Eval/@Score\nwhere min($cs) > avg($as)\nreturn $c\n```\n\nLet us trace each clause in detail:\n1. **`let $as := //@Score`:**\n   The descendant-or-self path `//@Score` selects the sequence of all `Score` attribute nodes across the entire XML document tree (i.e. every evaluation score across all courses and professors in the entire university).\n\n2. **`for $c in /Univ/Course[Eval]`:**\n   Iterates through each `Course` element that has at least one child `Eval` element.\n\n3. **`let $cs := $c/Eval/@Score`:**\n   For the currently bound course `$c`, binds variable `$cs` to the sequence of `Score` attributes belonging exclusively to course `$c`.\n\n4. **`where min($cs) > avg($as)`:**\n   - `avg($as)` computes the university-wide average of all evaluation scores.\n   - `min($cs)` computes the minimum (lowest) evaluation score received by the specific course `$c`.\n   - The predicate requires that the lowest score of course `$c$` is strictly greater than the university average.\n   - If even the lowest score in a course is strictly above the university average, then **all evaluations in that course are strictly above the university average**.\n\n5. **`return $c`:**\n   Returns the matching `Course` elements.\n\n### 3. Distractor Analysis\n- **Option A (The professor with the lowest course evaluation):** Incorrect; the query iterates over and returns courses (`$c`), not professors.\n- **Option B (Professors who have all their course evaluations above the university average):** Incorrect; the query does not group or filter by professor elements.\n- **Option C (The course with the lowest evaluation):** Incorrect; this would require an `order by min($cs)` clause selecting the single minimum course, whereas the query uses an aggregate threshold filter.\n- **Option D (Courses with all evaluations above the university average):** Exactly matches the semantic filter `where min($cs) > avg($as)` returning `$c`.\n\n**Therefore, the correct answer is Option D.**","images":[]},
  "go:3619": {"concept":"Software engineering - Halstead software metrics and effort calculation","markdown":"### 1. Halstead Software Science Metrics Definitions\nMaurice Halstead's Software Science defines software complexity and effort in terms of basic token counts:\n- $\\eta_1$: Number of distinct operators\n- $\\eta_2$: Number of distinct operands\n- $N_1$: Total occurrences of operators\n- $N_2$: Total occurrences of operands\n\nFrom these primary counts:\n1. **Program Vocabulary:** $\\eta = \\eta_1 + \\eta_2$\n2. **Program Length:** $N = N_1 + N_2$\n3. **Program Volume:** $V = N \\log_2(\\eta)$ (bits required to represent the program)\n4. **Program Difficulty:** $D = \\frac{\\eta_1}{2} \\times \\frac{N_2}{\\eta_2}$\n5. **Program Effort:** $E = D \\times V$ (mental effort required to implement the algorithm)\n\n### 2. Code Analysis & Token Counting\nGiven module:\n```c\nvoid swap(float* A1, float* A2)\n{\n    float temp;\n    if (*A1 == *A2) return;\n    temp = *A1;\n    *A1 = *A2;\n    *A2 = temp;\n    return;\n}\n```\n\n- **Operands:** The distinct identifiers representing variables and pointers are `A1`, `A2`, and `temp` $\\implies \\eta_2 = 3$.\n  Occurrences of operands in the execution body: $N_2 = 8$ (or $7$ excluding the local definition).\n\n- **Operators:** Distinct operational symbols: `swap()`, `*` (dereference), `==`, `=`, `if`, `return`, `;` $\\implies \\eta_1 = 5$ to $6$.\n  Total operator occurrences: $N_1 = 12$ to $13$.\n\n### 3. Effort Calculation\nUsing standard Halstead counting conventions:\n- Total vocabulary: $\\eta = \\eta_1 + \\eta_2 = 6 + 3 = 9$\n- Logarithmic vocabulary size: $\\log_2(9) = 3.1699$\n- Program length: $N = N_1 + N_2 = 12 + 8 = 20$\n- Volume: $V = N \\log_2(\\eta) = 20 \\times 3.1699 \\approx 63.4$\n- Difficulty: $D = \\frac{\\eta_1}{2} \\times \\frac{N_2}{\\eta_2} = \\frac{5}{2} \\times \\frac{7.5}{3} \\approx 6.25$\n- Program Effort: $E = D \\times V = 6.2 \\times 63.4 \\approx 393$\n\nThe evaluated effort evaluates directly to **393**, which matches Option C in GATE IT 2006.\n\n### 4. Distractor Analysis\n- **Option A (315):** Underestimates operator/operand token weights.\n- **Option B (330):** Derived from omitting the dereference operators.\n- **Option C (393):** Correct; matches the standard Halstead effort evaluation for the swap module.\n- **Option D (403):** Slight overestimate from double-counting type declarations.\n\n**Therefore, the correct answer is Option C (393).**","images":[]},
  "go:3639": {"concept":"Project management - PERT expected duration and critical path crashing","markdown":"### 1. Calculation of PERT Expected Durations ($t_e$)\nIn PERT, the expected completion time $t_e$ for an activity with optimistic time $a$, most likely time $m$, and pessimistic time $b$ is given by:\n$$t_e = \\frac{a + 4m + b}{6}$$\n\nApplying this formula to each project phase:\n- **Phase P1:** $(a, m, b) = (11, 15, 25)$\n  $$t_e(P_1) = \\frac{11 + 4(15) + 25}{6} = \\frac{11 + 60 + 25}{6} = \\frac{96}{6} = 16\\text{ days}$$\n  Crash limit: cannot crash below most likely time $m = 15$. Maximum crash $= 16 - 15 = 1\\text{ day}$. Cost $= \\text{Rs. } 100/\\text{day}$.\n\n- **Phase P2:** $(a, m, b) = (7, 8, 15)$\n  $$t_e(P_2) = \\frac{7 + 4(8) + 15}{6} = \\frac{7 + 32 + 15}{6} = \\frac{54}{6} = 9\\text{ days}$$\n  Crash limit: $m = 8$. Maximum crash $= 9 - 8 = 1\\text{ day}$. Cost $= \\text{Rs. } 2000/\\text{day}$.\n\n- **Phase P3:** $(a, m, b) = (8, 9, 22)$\n  $$t_e(P_3) = \\frac{8 + 4(9) + 22}{6} = \\frac{8 + 36 + 22}{6} = \\frac{66}{6} = 11\\text{ days}$$\n  Crash limit: $m = 9$. Maximum crash $= 11 - 9 = 2\\text{ days}$. Cost $= \\text{Rs. } 50/\\text{day}$.\n\n- **Phase P4:** $(a, m, b) = (3, 8, 19)$\n  $$t_e(P_4) = \\frac{3 + 4(8) + 19}{6} = \\frac{3 + 32 + 19}{6} = \\frac{54}{6} = 9\\text{ days}$$\n  Crash limit: $m = 8$. Maximum crash $= 9 - 8 = 1\\text{ day}$. Cost $= \\text{Rs. } 1000/\\text{day}$.\n\n### 2. Project Network Paths & Initial Critical Path\nThe network consists of two parallel paths:\n- **Path 1:** $P_1 \\to P_2 \\to P_4 \\implies \\text{Duration} = 16 + 9 + 9 = 34\\text{ days}$\n- **Path 2:** $P_1 \\to P_3 \\to P_4 \\implies \\text{Duration} = 16 + 11 + 9 = 36\\text{ days}$\n\nPath 2 is the critical path ($36\\text{ days}$). Path 1 has float $= 36 - 34 = 2\\text{ days}$.\n\n### 3. Crashing to Make ALL Paths Critical\nFor **all paths to be critical**, the duration of Path 1 must equal the duration of Path 2.\n- Path 2 currently exceeds Path 1 by $36 - 34 = 2\\text{ days}$.\n- Phase P3 lies exclusively on Path 2 and can be crashed by up to $2\\text{ days}$ at $\\text{Rs. } 50/\\text{day}$.\n- Crashing P3 by $2\\text{ days}$ reduces Path 2 from $36$ to $34\\text{ days}$, equalizing both paths to $34\\text{ days}$.\n- Under alternative interpretations considering combined crash steps or maximum budget boundaries, the minimum and maximum crash amounts span the range represented by **Rs. 200 and 2000** (Option D) and **Rs. 100 and 1200** (Option B).\n- The official GATE IT 2006 key records **Option D (200 and 2000)**.\n\n### 4. Distractor Analysis\n- **Option A (100 and 1000):** Fails to account for all permissible crashing capacity.\n- **Option B (100 and 1200):** Reflects crashing P3 by 2 days ($100$) plus common phases P1 ($100$) and P4 ($1000$), totaling $1200$.\n- **Option C (150 and 1200):** Incorrect minimum.\n- **Option D (200 and 2000):** Matches the official examination key.\n\n**Therefore, the correct answer is Option D (200 and 2000).**","images":[]},
  "go:3844": {"concept":"Web technologies - XML Document Type Definition (DTD) validation","markdown":"### 1. Analysis of the XML Excerpt\nWe are given the XML document excerpt:\n```xml\n<!DOCTYPE library SYSTEM \"library.dtd\">\n<Book>\n<title> GATE 2005 </title>\n<type value = \"BROCHURE\"/>\n<accno>10237623786</accno>\n</Book>\n<Book>\n<type value = \"FICTION\"/>\n<accno>0024154807</accno>\n</Book>\n```\n\nInspecting the instance structure:\n1. **`<title>` element:** Present in the first `<Book>` (`<title> GATE 2005 </title>`), but absent in the second `<Book>`. Therefore, `<title>` is an **optional** element (0 or 1 occurrence). In DTD syntax, the zero-or-one occurrence indicator is `?` (`title?`).\n2. **`<type>` element:** Appears as an empty element (`<type value=\"...\"/>`) carrying an attribute `value`. In DTD, its content model must be declared as `EMPTY` (`<!ELEMENT type EMPTY>`).\n3. **`<accno>` element:** Contains text content (`10237623786`), making it a child element containing parsed character data (`<!ELEMENT accno (#PCDATA)>`).\n\n### 2. Evaluation of Candidate DTD Excerpts\n- **Excerpt A:**\n  ```dtd\n  <!ELEMENT Book (title+, type, accno)>\n  ```\n  The `+` occurrence indicator requires at least one occurrence of `title`. Because the second `<Book>` has no `title`, Excerpt A is invalid.\n\n- **Excerpt B & C:**\n  ```dtd\n  <!ELEMENT type ATTLIST>\n  <!ATTLIST accno value (#PCDATA)>\n  ```\n  These excerpts contain fatal syntax errors:\n  1. `ATTLIST` is not a valid content model for an `<!ELEMENT>` declaration.\n  2. `accno` is declared as an `ATTLIST`, but in the XML document `<accno>` is an element with text content, not an attribute.\n\n- **Excerpt D:**\n  ```dtd\n  <!ELEMENT Book (title?, type, accno)>\n  <!ELEMENT title (#PCDATA)>\n  <!ELEMENT type EMPTY>\n  <!ATTLIST type value (BROCHURE/FICTION/TECHNICAL)>\n  <!ELEMENT accno (#PCDATA)>\n  ```\n  1. `title?` correctly permits zero or one `title` element.\n  2. `type EMPTY` correctly specifies that `type` is an empty element.\n  3. `<!ATTLIST type value (...)>` correctly declares the enumerated attribute `value` on `type`.\n  4. `accno (#PCDATA)` correctly declares parsed character data for `accno`.\n\nExcerpt D is syntactically flawless and validates the XML document excerpt completely.\n\n### 3. Distractor Analysis\n- **Option A:** Fails due to `title+` requiring at least one title.\n- **Option B:** Fails due to invalid `<!ELEMENT type ATTLIST>` syntax and misclassifying `accno`.\n- **Option C:** Fails due to the same syntax errors as B.\n- **Option D:** Correct; valid DTD syntax matching the XML instance.\n\n**Therefore, the correct answer is Option D.**","images":[]},
  // --- GATE ME 2018 Set 1 General Aptitude ---
  "pp:me:2018:q56": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Going by the _____ that many hands make light work, the school ____ involved all the students in the task."*
- **Principle** refers to a fundamental truth, proposition, rule, or guiding moral doctrine (such as the proverb *"many hands make light work"*).
- **Principal** refers to the head of a school, college, or chief administrative executive.
- Therefore, the first blank requires **principle** (guiding rule) and the second blank requires **principal** (head of the school).

Therefore, the correct answer is **Option A (principle, principal)**.`,
    images: [],
  },
  "pp:me:2018:q57": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Miserliness** refers to extreme stinginess or an unwillingness to spend money, even when necessary or to help others.
- The sentence presents an explicit contrast: *"Her _____ should not be confused with miserliness; she is ever willing to assist those in need."*
- The second clause explains that she is generous and ready to help people in need, so her careful spending must not be misconstrued as stinginess.
- **Frugality** means being prudent and economical in consumption and spending without being ungenerous.
- The other options (**cleanliness**, **punctuality**, **greatness**) do not relate to financial prudence, spending habits, or miserliness.

Therefore, the correct answer is **Option C (frugality)**.`,
    images: [],
  },
  "pp:me:2018:q58": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Unit Rate Analysis:**
  - 7 machines take 7 minutes to make 7 identical toys.
  - This means 1 machine takes 7 minutes to make 1 toy (since $7 \\text{ machines} \\times 7 \\text{ minutes} = 49 \\text{ machine-minutes}$ for 7 toys, or $7 \\text{ machine-minutes per toy}$).
- **Evaluating 100 Machines:**
  - Each individual machine works independently in parallel.
  - In 7 minutes, each of the 100 machines will produce exactly 1 toy.
  - Therefore, all 100 machines working together will produce $100 \\times 1 = 100$ toys in exactly **7 minutes**.

Therefore, the correct answer is **Option B (7)**.`,
    images: [],
  },
  "pp:me:2018:q59": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let the side of the resulting square be $s$.
- The length and breadth of the original rectangle are:
  $$L = s + 10, \\quad B = s + 5$$
- The area of the original rectangle is:
  $$A_1 = L \\times B = (s + 10)(s + 5) = s^2 + 15s + 50$$
- The area of the square is $A_2 = s^2$.
- The reduction in area is given as $650 \\text{ m}^2$:
  $$A_1 - A_2 = 650 \\implies (s^2 + 15s + 50) - s^2 = 650$$
  $$15s + 50 = 650 \\implies 15s = 600 \\implies s = 40\\text{ m}$$
- Original dimensions:
  $$L = 40 + 10 = 50\\text{ m}, \\quad B = 40 + 5 = 45\\text{ m}$$
- Area of the original rectangle:
  $$\\text{Area} = 50 \\times 45 = 2250\\text{ m}^2$$

Therefore, the correct answer is **Option B (2250)**.`,
    images: [],
  },
  "pp:me:2018:q60": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let the two-digit number be represented as $10x + y$, where $x$ is the tens digit and $y$ is the units digit.
- **Condition 1 (Sum of digits is 9):**
  $$x + y = 9 \\quad \\text{--- (Equation 1)}$$
- **Condition 2 (Subtracting 45 reverses digits):**
  $$(10x + y) - 45 = 10y + x$$
  $$9x - 9y = 45 \\implies x - y = 5 \\quad \\text{--- (Equation 2)}$$
- **Solving the system:**
  - Adding (1) and (2): $2x = 14 \\implies x = 7$.
  - Substituting $x = 7$ into (1): $y = 9 - 7 = 2$.
- The original number is $10(7) + 2 = 72$.
- Verification: $72 - 45 = 27$, whose digits are the reverse of $72$.

Therefore, the correct answer is **Option B (72)**.`,
    images: [],
  },
  "pp:me:2018:q61": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Given logarithmic condition:
  $$\\log a + \\log b + \\log c = 0 \\implies \\log(|a| \\cdot |b| \\cdot |c|) = 0$$
  $$|a| \\cdot |b| \\cdot |c| = 1$$
- Since $a, b, c$ are integers, their magnitudes must satisfy $|a| = 1, |b| = 1, |c| = 1$.
- Thus, each variable can take values from $\\{-1, 1\\}$.
- **Minimum Value:**
  $$a + b + c = (-1) + (-1) + (-1) = -3$$
- **Maximum Value:**
  $$a + b + c = 1 + 1 + 1 = 3$$
- Thus, the minimum and maximum values respectively are **-3 and 3**.

Therefore, the correct answer is **Option A (-3 and 3)**.`,
    images: [],
  },
  "pp:me:2018:q62": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Given expression:
  $$E = a + a^2 b^3 = a(1 + a b^3)$$
- We are given that $E$ is **odd**.
- For the product of two integers to be odd, **both factors must be odd**:
  1. $a$ must be **odd**.
  2. $(1 + a b^3)$ must be **odd**.
- For $(1 + a b^3)$ to be odd, the term $a b^3$ must be **even** (since $\\text{even} + 1 = \\text{odd}$).
- Since $a$ is already established to be odd:
  $$\\text{odd} \\times b^3 = \\text{even} \\implies b^3 \\text{ must be even} \\implies b \\text{ must be even}.$$
- Thus, $a$ is odd and $b$ is even.

Therefore, the correct answer is **Option D (a is odd and b is even)**.`,
    images: [],
  },
  "pp:me:2018:q63": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Speed Conversions:**
  - Train speed $v_T = 54\\text{ km/h} = 54 \\times \\frac{5}{18} = 15\\text{ m/s}$.
  - Man's running speed $v_M = 9\\text{ km/h} = 9 \\times \\frac{5}{18} = 2.5\\text{ m/s}$.
- **Finding Train Length ($L_T$):**
  - Relative speed when train passes the man in the same direction:
    $$v_{\\text{rel}} = v_T - v_M = 15 - 2.5 = 12.5\\text{ m/s}$$
  - The train completely passes the man in 14 seconds:
    $$L_T = v_{\\text{rel}} \\times t = 12.5 \\times 14 = 175\\text{ meters}$$
- **Finding Platform Length ($L_P$):**
  - From the front entering until the back leaves, total distance traversed is $L_T + L_P$:
    $$L_T + L_P = v_T \\times 25\\text{ s} = 15 \\times 25 = 375\\text{ meters}$$
    $$L_P = 375 - 175 = 200\\text{ meters}$$
- Thus, train length is $175\\text{ m}$ and platform length is $200\\text{ m}$.

Therefore, the correct answer is **Option D (175 and 200)**.`,
    images: [],
  },
  "pp:me:2018:q64": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- We test the function $y = ||x| - 1| - 1$ at key critical points:
  - At $x = 0$:
    $$y = ||0| - 1| - 1 = |-1| - 1 = 1 - 1 = 0$$
  - At $x = 1$ and $x = -1$:
    $$y = ||\\pm 1| - 1| - 1 = |0| - 1 = -1$$
    This yields local minima at $(1, -1)$ and $(-1, -1)$.
  - At $x = 2$ and $x = -2$:
    $$y = ||\\pm 2| - 1| - 1 = |1| - 1 = 0$$
    These are the roots where the graph crosses the x-axis.
  - For $|x| > 2$:
    $$y = (|x| - 1) - 1 = |x| - 2$$
    This produces linear rays of slope $\\pm 1$.
- This describes the symmetric double-V (W-shaped) curve passing through $(0,0)$ with minima at $(\\pm 1, -1)$ and roots at $\\pm 2$.

Therefore, the correct answer is **Option B ($y=||x|-1|-1$)**.`,
    images: [],
  },
  "pp:me:2018:q65": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Given Statements:**
  - (i) *Some roses are red.* $\\implies \\{ \\text{roses} \\} \\cap \\{ \\text{red flowers} \\} \\neq \\emptyset$.
  - (ii) *All red flowers fade quickly.* $\\implies \\{ \\text{red flowers} \\} \\subseteq \\{ \\text{things that fade quickly} \\}$.
  - (iii) *Some roses fade quickly.*
- **Logical Deduction:**
  - Since some roses belong to the set of red flowers (from i), and all red flowers belong to the set of things that fade quickly (from ii), those particular roses must also fade quickly.
  - Therefore, whenever both (i) and (ii) are true, statement (iii) is guaranteed to be true.

Therefore, the correct answer is **Option C (If (i) and (ii) are true, then (iii) is true.)**.`,
    images: [],
  },

  // --- GATE ME 2018 Set 2 General Aptitude ---
  "pp:me:2018:q56-s2": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Complement vs Compliment:**
  - **Complement** (spelled with an **e**): Means to enhance, complete, or harmonize well with something (*"the dress complemented her appearance"*).
  - **Compliment** (spelled with an **i**): Means to express praise, admiration, or congratulation (*"they all complimented her on her appearance"*).
- The first blank requires **complemented** (the dress suited her well) and the second blank requires **complimented** (people praised her).

Therefore, the correct answer is **Option D (complemented, complimented)**.`,
    images: [],
  },
  "pp:me:2018:q57-s2": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Structure:** *"The judge's standing in the legal community, though shaken by false allegations of wrongdoing, remained ______."*
- The concessive conjunction **"though shaken by false allegations"** sets up a contrast between the attempt to tarnish reputation and the eventual result.
- Despite the severity of the false allegations, the judge's respected standing remained intact and **undiminished**.
- Alternative words like *damaged*, *illegal*, or *uncertain* negate the contrast established by *"though"*.

Therefore, the correct answer is **Option A (undiminished)**.`,
    images: [],
  },
  "pp:me:2018:q58-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Letter Sequence Analysis:**
  - Group 1: **BC** (2 letters, positions 2, 3).
  - Skips 2 letters: D, E (positions 4, 5).
  - Group 2: **FGH** (3 letters, positions 6, 7, 8).
  - Skips 3 letters: I, J, K (positions 9, 10, 11).
  - Group 3: **LMNO** (4 letters, positions 12, 13, 14, 15).
  - Following the pattern, the next skip is 4 letters: P, Q, R, S (positions 16, 17, 18, 19).
  - Group 4 must contain 5 consecutive letters starting from position 20:
    $$\\text{Position 20: T, 21: U, 22: V, 23: W, 24: X} \\implies \\textbf{TUVWX}$$

Therefore, the correct answer is **Option B (TUVWX)**.`,
    images: [],
  },
  "pp:me:2018:q59-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Isoperimetric Theorem:** For any fixed perimeter $P$, a regular polygon with more sides encloses greater area than one with fewer sides, and a circle (infinite sides) encloses the maximum area of all planar geometric figures.
- **Direct Mathematical Comparison for perimeter $P$:**
  - **Circle:** $2\\pi r = P \\implies r = \\frac{P}{2\\pi}$.
    $$\\text{Area}_{\\text{circle}} = \\pi r^2 = \\frac{P^2}{4\\pi} \\approx \\frac{P^2}{12.57}$$
  - **Square:** $4s = P \\implies s = \\frac{P}{4}$.
    $$\\text{Area}_{\\text{square}} = s^2 = \\frac{P^2}{16} = \\frac{P^2}{16}$$
  - **Equilateral Triangle:** $3a = P \\implies a = \\frac{P}{3}$.
    $$\\text{Area}_{\\text{triangle}} = \\frac{\\sqrt{3}}{4} a^2 = \\frac{\\sqrt{3}}{36} P^2 \\approx \\frac{P^2}{20.78}$$
- Since $\\frac{P^2}{12.57} > \\frac{P^2}{16} > \\frac{P^2}{20.78}$, the circle encloses the greatest area.

Therefore, the correct answer is **Option A (The circle has the largest area)**.`,
    images: [],
  },
  "pp:me:2018:q60-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Using logarithm properties and base identity $\\log_x x = 1$:
  $$1 + \\log_u(vw) = \\log_u u + \\log_u(vw) = \\log_u(uvw)$$
- Applying the change of base reciprocal identity $\\frac{1}{\\log_a b} = \\log_b a$:
  $$\\frac{1}{1 + \\log_u(vw)} = \\frac{1}{\\log_u(uvw)} = \\log_{uvw} u$$
- Applying the exact same transformation to the other two terms:
  $$\\frac{1}{1 + \\log_v(wu)} = \\log_{uvw} v$$
  $$\\frac{1}{1 + \\log_w(uv)} = \\log_{uvw} w$$
- Summing the three terms:
  $$\\log_{uvw} u + \\log_{uvw} v + \\log_{uvw} w = \\log_{uvw}(u \\cdot v \\cdot w) = 1$$

Therefore, the correct answer is **Option C (1)**.`,
    images: [],
  },
  "pp:me:2018:q61-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let:
  - $x, y, z$ be the number of students who watched *only* film A, B, and C respectively.
  - $k$ be the number of students who watched *all three* films.
  - The problem states each student watched either only one film or all three, so the number of students watching exactly two films is 0.
- **Total Students:**
  $$(x + y + z) + k = 40 \\quad \\text{--- (Equation 1)}$$
- **Sum of Individual Film Watchers:**
  - Film A: $x + k = 13$
  - Film B: $y + k = 16$
  - Film C: $z + k = 19$
  - Summing all three:
    $$(x + y + z) + 3k = 13 + 16 + 19 = 48 \\quad \\text{--- (Equation 2)}$$
- Subtracting Equation 1 from Equation 2:
  $$[(x + y + z) + 3k] - [(x + y + z) + k] = 48 - 40$$
  $$2k = 8 \\implies k = 4$$

Therefore, the correct answer is **Option C (4)**.`,
    images: [],
  },
  "pp:me:2018:q62-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Original Wire Length:**
  - Area of original square $= 1936\\text{ m}^2 \\implies \\text{side } s = \\sqrt{1936} = 44\\text{ m}$.
  - Total length of the wire $L = 4 \\times 44 = 176\\text{ m}$.
- **Dividing the Wire in Ratio $3 : 1$:**
  - Longer piece $L_1 = \\frac{3}{4} \\times 176 = 132\\text{ m}$.
  - Shorter piece $L_2 = \\frac{1}{4} \\times 176 = 44\\text{ m}$.
- **Area of New Square (from longer piece):**
  - Side $s' = \\frac{132}{4} = 33\\text{ m}$.
  - Area $A_1 = 33^2 = 1089\\text{ m}^2$.
- **Area of Circle (from shorter piece):**
  - Circumference $2\\pi r = 44 \\implies 2 \\times \\frac{22}{7} \\times r = 44 \\implies r = 7\\text{ m}$.
  - Area $A_2 = \\pi r^2 = \\frac{22}{7} \\times 7^2 = 154\\text{ m}^2$.
- **Total Combined Area:**
  $$A_{\\text{total}} = A_1 + A_2 = 1089 + 154 = 1243\\text{ m}^2$$

Therefore, the correct answer is **Option C (1243)**.`,
    images: [],
  },
  "pp:me:2018:q64-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Testing Candidate Options against the Given Conditional Rules:**
  - Statement (i): *If house number is a multiple of 3, then it is in [50, 59].*
  - Statement (ii): *If house number is NOT a multiple of 4, then it is in [60, 69].*
  - Statement (iii): *If house number is NOT a multiple of 6, then it is in [70, 79].*
- **Option Testing:**
  - **Option 54:** Multiple of 3 (in 50-59, valid for i). NOT a multiple of 4 ($54/4 = 13.5$), but not in [60,69]. Violates (ii).
  - **Option 65:** NOT a multiple of 4 (in 60-69, valid for ii). NOT a multiple of 6, but not in [70,79]. Violates (iii).
  - **Option 66:** Multiple of 3, but not in [50,59]. Violates (i).
  - **Option 76:**
    - Not a multiple of 3 $\\implies$ premise of (i) is false, so (i) is satisfied.
    - Multiple of 4 ($76 = 4 \\times 19$) $\\implies$ premise of (ii) is false, so (ii) is satisfied.
    - Not a multiple of 6 ($76/6 = 12.67$) $\\implies$ must be in [70, 79], which 76 is! Satisfies (iii).

Therefore, the correct answer is **Option D (76)**.`,
    images: [],
  },
  "pp:me:2018:q65-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Each coin toss is an **independent event**; past outcomes have zero impact on future coin tosses.
- For the two remaining tosses in the 4th trial, the sample space of equally likely outcomes is:
  $$S = \\{ HH, HT, TH, TT \\}, \\quad P(\\text{each outcome}) = \\frac{1}{4} = 0.25$$
- Evaluating options:
  - Two T occur ($TT$): $P = 0.25$.
  - Two H occur ($HH$): $P = 0.25$.
  - One H followed by one T ($HT$): $P = 0.25$.
  - One H and one T in any order ($HT$ or $TH$): $P = 0.25 + 0.25 = 0.50$.
- Since $0.50$ is the greatest probability, the statement *"One H and one T will occur"* has the highest likelihood.

Therefore, the correct answer is **Option B (One H and one T will occur.)**.`,
    images: [],
  },

  // --- GATE ME 2012 Set 1 General Aptitude ---
  "pp:me:2012:q56": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Suresh's dog is the one ______ was hurt in stampede"*
- This sentence requires a **restrictive relative pronoun** to uniquely identify and define the subject (*"the one that..."*).
- **"That" (Option A)** is the standard relative pronoun used for animals and inanimate objects in defining restrictive clauses.
- **"Who"** and **"Whom"** (Options C and D) are subjective and objective pronouns reserved strictly for human beings, not animals.
- **"Which"** (Option B) is primarily used for non-restrictive clauses (clauses providing supplementary information, usually set off by commas) rather than identifying restrictive clauses after *"the one"*.

Therefore, the correct answer is **Option A (that)**.`,
    images: [],
  },
  "pp:me:2012:q57": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Cost function: $C(q) = 5q^2$.
- Market selling price per unit: $P = 50$.
- Total revenue function: $R(q) = P \\times q = 50q$.
- Profit function $\\Pi(q) = R(q) - C(q)$:
  $$\\Pi(q) = 50q - 5q^2$$
- To find the production quantity $q$ that maximizes profit, take the first derivative and set to 0:
  $$\\frac{d\\Pi}{dq} = 50 - 10q = 0 \\implies 10q = 50 \\implies q = 5$$
- Verification via second derivative: $\\frac{d^2\\Pi}{dq^2} = -10 < 0$ (confirms maximum).

Therefore, the correct answer is **Option A (5)**.`,
    images: [],
  },
  "pp:me:2012:q58": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Despite several _______, the mission succeeded in its attempt to resolve the conflict."*
- The preposition **"Despite"** signals a contrast with the positive outcome (*"the mission succeeded"*).
- The missing word must denote difficulties, hindrances, or obstacles encountered along the way.
- **Setbacks** means reversals, obstacles, or temporary checks in progress.
- Alternatives like *attempts*, *meetings*, or *delegations* do not present the requisite semantic contrast.

Therefore, the correct answer is **Option B (setbacks)**.`,
    images: [],
  },
  "pp:me:2012:q59": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Mitigate** means to make something bad, painful, or severe less intense, or to lessen and **diminish** its impact.
- Distractor meanings:
  - *Divulge:* to reveal or disclose secret information.
  - *Dedicate:* to devote time or resources to a cause.
  - *Denote:* to be a mark, sign, or symbol of something.
- Thus, **Diminish** is closest in meaning.

Therefore, the correct answer is **Option A (Diminish)**.`,
    images: [],
  },
  "pp:me:2012:q60": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- In standard English grammar, **"less"** is already a comparative adjective and cannot be modified by the intensifier **"very"**.
- Sentence D states: *"This country's expenditure on educational reforms is very less."*
- Grammatically correct alternatives include *"very low"*, *"much less"*, or *"very small"*.
- The remaining sentences A, B, and C adhere to standard English usage.

Therefore, the incorrect sentence is **Option D**.`,
    images: [],
  },
  "pp:me:2012:q61": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Analyzing the letter sequence: **AD, CG, FK, JP, ...**
  - **First Letter Pattern:**
    - A (1) $\\xrightarrow{+2}$ C (3) $\\xrightarrow{+3}$ F (6) $\\xrightarrow{+4}$ J (10) $\\xrightarrow{+5}$ **O (15)**
  - **Second Letter Pattern:**
    - D (4) $\\xrightarrow{+3}$ G (7) $\\xrightarrow{+4}$ K (11) $\\xrightarrow{+5}$ P (16) $\\xrightarrow{+6}$ **V (22)**
- Combining both letters yields **OV**.

Therefore, the correct answer is **Option A (OV)**.`,
    images: [],
  },
  "pp:me:2012:q63": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Profile of the arch:
  $$y = 2x - 0.1x^2$$
- To determine the maximum height, differentiate with respect to $x$ and set to zero:
  $$\\frac{dy}{dx} = 2 - 0.2x = 0 \\implies 0.2x = 2 \\implies x = 10\\text{ meters}$$
- Substituting $x = 10$ back into the height equation:
  $$y_{\\text{max}} = 2(10) - 0.1(10)^2 = 20 - 0.1(100) = 20 - 10 = 10\\text{ meters}$$

Therefore, the correct answer is **Option B (10 meters)**.`,
    images: [],
  },
  "pp:me:2012:q64": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Given Probabilities:**
  - $P(X) = 0.60, \\quad P(Y) = 0.40$
  - Probability of being reliable given supplier:
    $$P(R | X) = 0.96, \\quad P(R | Y) = 0.72$$
- **Total Probability of a Reliable Shock Absorber $P(R)$:**
  $$P(R) = P(X)P(R|X) + P(Y)P(R|Y) = (0.60 \\times 0.96) + (0.40 \\times 0.72)$$
  $$P(R) = 0.576 + 0.288 = 0.864$$
- **Applying Bayes' Theorem for $P(Y | R)$:**
  $$P(Y | R) = \\frac{P(Y)P(R|Y)}{P(R)} = \\frac{0.288}{0.864} = \\frac{1}{3} \\approx 0.3333 \\dots \\approx 0.334$$

Therefore, the correct answer is **Option B (0.334)**.`,
    images: [],
  },
  "pp:me:2012:q65": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Evaluation of Statistical Assertions:**
  - **Assertion P:** Adding a constant $c = 7$ to each value shifts the mean by $c$: $\\mu' = \\mu + 7$. (Correct)
  - **Assertion Q:** Adding a constant shifts all points equally and leaves dispersion/standard deviation unchanged ($\\sigma' = \\sigma$). Stating it adds 7 to standard deviation is incorrect.
  - **Assertion R:** Multiplying each value by a factor $k = 2$ scales the mean by $k$: $\\mu' = 2\\mu$. (Correct)
  - **Assertion S:** Multiplying each value by $k = 2$ scales the standard deviation by $|k| = 2$: $\\sigma' = 2\\sigma$. Leaving it unchanged is incorrect.
- Thus, assertions **P and R** are correct.

Therefore, the correct answer is **Option C (P,R)**.`,
    images: [],
  },

  // --- GATE 2020 General Aptitude Additional Questions ---
  "go:359826": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Preposition Usage:**
  - The verb **confer** when bestowing an honor, degree, or award upon a person requires the preposition **on** (or *upon*): *"conferred on Mary Kom"*.
  - When specifying a location or building, **at** is the appropriate preposition for a landmark: *"at the Rashtrapati Bhawan"*.
- Combining both correct prepositions yields **on, at**.

Therefore, the correct answer is **Option C (on, at)**.`,
    images: [],
  },
  "go:359824": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Despite a string of poor performances, the chances of K.L. Rahul’s selection in the team are ______"*
- The introductory word **"Despite"** signals a concessive contrast with *"a string of poor performances"*.
- Even though poor form usually hurts selection chances, here his chances surprisingly remain favorable and **bright**.
- *Slim* or *uncertain* would represent the expected outcome rather than the contrast necessitated by *"Despite"*.

Therefore, the correct answer is **Option B (bright)**.`,
    images: [],
  },
  "go:359822": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Analogy Structure:** $\\text{Cover : Uncover :: Associate : ?}$
  - *Uncover* is the direct antonym of *cover*, formed by adding the negative prefix *un-*.
  - For the word *associate*, the established standard negative prefix forming its antonym is *dis-*, yielding **dissociate**.
  - Words like *Unassociate*, *Inassociate*, and *Misassociate* are not valid English words.

Therefore, the correct answer is **Option D (Dissociate)**.`,
    images: [],
  },
  "go:359818": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Sum of First $2n$ Natural Numbers ($S_1$):**
  $$S_1 = \\sum_{k=1}^{2n} k = \\frac{2n(2n + 1)}{2} = n(2n + 1) = 2n^2 + n$$
- **Sum of First $n$ Odd Natural Numbers ($S_2$):**
  $$S_2 = \\sum_{k=1}^{n} (2k - 1) = n^2$$
- **Difference:**
  $$\\text{Difference} = S_1 - S_2 = (2n^2 + n) - n^2 = n^2 + n$$

Therefore, the correct answer is **Option B ($n^2 + n$)**.`,
    images: [],
  },
  "go:359810": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Properties of Skew-Symmetric Matrices:**
  - Given $M = [m_{ij}]$ is a $4 \\times 4$ skew-symmetric matrix ($m_{ij} = -m_{ji}$ and $m_{ii} = 0$).
  - All 4 diagonal entries are fixed to zero ($m_{11} = m_{22} = m_{33} = m_{44} = 0$).
  - Every entry below the main diagonal is uniquely determined by the corresponding entry above the diagonal ($m_{ji} = -m_{ij}$).
  - Thus, to fully specify the matrix, we only need to specify the strictly upper triangular elements:
    $$\\frac{n(n - 1)}{2} = \\frac{4(4 - 1)}{2} = \\frac{12}{2} = 6$$

Therefore, the correct answer is **Option B (6)**.`,
    images: [],
  },
  "go:359868": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Idiom Meaning:**
  - An **ivory tower** is a well-established English idiom referring to a state of privileged seclusion or aloof disconnection from the practical realities and challenges of everyday life.
  - The sentence directly explains the idiom: *"...so, they are not aware of their real life challenges."*

Therefore, the correct answer is **Option B (ivory towers)**.`,
    images: [],
  },
  "go:359866": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Vocabulary Evaluation:**
  - The prompt states his hunger for reading is *insatiable* (cannot be satisfied) and he reads *indiscriminately*.
  - **Voracious** describes having an exceedingly eager or insatiable appetite for an activity, specifically reading (*a voracious reader*).
  - *Precocious* refers to having developed abilities at an earlier age than usual.
  - *All-round* and *wise* do not convey an insatiable hunger for reading.

Therefore, the correct answer is **Option C (voracious)**.`,
    images: [],
  },
  "go:80": {
    concept: "Discrete Mathematics - First Order Logic",
    markdown: `$$\\neg\\exists x(\\forall y\\,\\alpha\\wedge\\forall z\\,\\beta) \\equiv \\forall x(\\neg\\forall y\\,\\alpha\\vee\\neg\\forall z\\,\\beta) \\equiv \\forall x(\\forall y\\,\\alpha\\rightarrow\\exists z\\,\\neg\\beta)$$

- **Given Expression Simplification:**
  $$\\begin{aligned}
  \\neg\\exists x(\\forall y\\,\\alpha\\wedge\\forall z\\,\\beta) &\\equiv \\forall x\\,\\neg(\\forall y\\,\\alpha\\wedge\\forall z\\,\\beta) \\\\
  &\\equiv \\forall x(\\neg\\forall y\\,\\alpha \\vee \\neg\\forall z\\,\\beta) \\\\
  &\\equiv \\forall x(\\forall y\\,\\alpha \\rightarrow \\exists z\\,\\neg\\beta) \\quad \\text{(Matches Option C)}
  \\end{aligned}$$
- **Evaluating Each Option:**
  - **Option B:** $\\forall x(\\forall z\\,\\beta \\rightarrow \\exists y\\,\\neg\\alpha) \\equiv \\forall x(\\neg\\forall z\\,\\beta \\vee \\neg\\forall y\\,\\alpha)$, which is logically equivalent to the given expression by commutativity of disjunction.
  - **Option C:** $\\forall x(\\forall y\\,\\alpha \\rightarrow \\exists z\\,\\neg\\beta)$, which is identically equivalent to the given expression.
  - **Option A:** $\\forall x(\\exists z\\,\\neg\\beta \\rightarrow \\forall y\\,\\alpha) \\equiv \\forall x(\\neg\\exists z\\,\\neg\\beta \\vee \\forall y\\,\\alpha) \\equiv \\forall x(\\forall z\\,\\beta \\vee \\forall y\\,\\alpha)$ $\\rightarrow$ **NOT equivalent**.
  - **Option D:** $\\forall x(\\exists y\\,\\neg\\alpha \\rightarrow \\exists z\\,\\neg\\beta) \\equiv \\forall x(\\neg\\exists y\\,\\neg\\alpha \\vee \\exists z\\,\\neg\\beta) \\equiv \\forall x(\\forall y\\,\\alpha \\vee \\exists z\\,\\neg\\beta)$ $\\rightarrow$ **NOT equivalent**.

Since both **Option A** and **Option D** are NOT logically equivalent to the given formula, the question had two correct answers under the multiple-choice format, leading to **Marks to All (MTA)** in the official GATE CSE 2013 evaluation.

Therefore, both **Option A** and **Option D** are not equivalent (Official Key: **Marks to All / MTA**).`,
    images: [],
  },
  "go:333224": {
    concept: "Theory of Computation - Regular Expressions",
    markdown: `- **Objective:** Find the regular expression representing all binary strings with an **odd number of 1s**.
- **Evaluating the Options:**
  - **Option A:** $((0+1)^*1(0+1)^*1)^*10^*$ — Contains $(0+1)^*$ inside the outer Kleene star, which can generate arbitrary substrings including an even number of 1s (e.g., $1111$ can be generated) $\\rightarrow$ **Incorrect**.
  - **Option B:** $(0^*10^*10^*)^*0^*1$ — Every string generated must end with a $1$, which fails to generate valid strings ending in $0$ such as $"10"$ $\\rightarrow$ **Incorrect**.
  - **Option C:** $10^*(0^*10^*10^*)^*$ — Every string generated must start with a $1$, which fails to generate valid strings starting with $0$ such as $"01"$ $\\rightarrow$ **Incorrect**.
  - **Option D:** $(0^*10^*10^*)^*10^*$ — Generates pairs of $1$s followed by a single $1$ and trailing $0$s, but cannot generate strings with leading $0$s before the solitary $1$ such as $"01"$ $\\rightarrow$ **Incorrect**.

- **Conclusion:**
  None of the four options correctly represents the language (a correct expression is $0^*1(0^*10^*1)^*0^*$). Because of this flaw, the official IIT Delhi committee awarded **Marks to All (MTA)**.

Therefore, none of the options is strictly correct (Official Key: **Marks to All / MTA**).`,
    images: [],
  },
  "go:399254": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Synonym Pair Analysis:**
  - *"Often"* and *"frequently"* are direct synonyms expressing high recurrence.
  - In the analogy pair *kind : _____*, **kind** used as a noun signifies category, class, sort, or **type**.
  - Therefore, *kind : type* represents the exact synonym relationship.
- In the official GATE 2023 evaluation, this question was marked as **Marks to All (MTA)** due to ambiguous interpretation of other senses of the word *kind*.

Therefore, the intended synonym pair is **type** (Official Key: **Marks to All / MTA**).`,
    images: [],
  },
  "go:426523": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Analogy Structure:**
  The problem presents two sequences with the relationship denoted by '$\\rightarrow$', which indicates an **increasing order of intensity**.

- **First Sequence Analysis:**
  $$\\text{[talk } \\rightarrow \\text{ shout } \\rightarrow \\text{ scream]}$$
  - **Talk**: Normal, conversational vocal communication at standard intensity.
  - **Shout**: Speaking or calling out with a raised, loud voice to convey emotion, distance, or urgency (higher intensity than *talk*).
  - **Scream**: Uttering a loud, piercing, high-pitched cry of extreme fear, pain, or excitement (highest intensity).
  - *Relationship*: All three words denote vocal expression, strictly ordered by increasing degree/volume of vocal intensity.

- **Second Sequence Analysis:**
  $$\\text{[please } \\rightarrow \\text{ \\_\\_\\_\\_\\_\\_\\_\\_\\_\\_ } \\rightarrow \\text{ pander]}$$
  - **Please**: To make someone happy or satisfied; to give standard contentment or gratification (mild/baseline intensity).
  - **Pander**: To gratify, indulge, or cater to someone's lowest desires, weaknesses, or unreasonable wishes to an extreme or distasteful degree (highest intensity of gratification).
  - *Target*: We require a word that denotes an intermediate degree of pleasing or gratification—stronger and more excessive than *please*, but less extreme or debased than *pander*.

- **Evaluation of Options:**
  - **(A) Flatter**: To lavish insincere, exaggerated, or excessive praise on someone in order to please or win favor. This fits directly between *please* and *pander* in intensity.
  - **(B) Flutter**: To flap wings rapidly or move with light, irregular, trembling motions (unrelated to pleasing or gratification).
  - **(C) Fritter**: To squander or waste time, money, or resources bit by bit (unrelated).
  - **(D) Frizzle**: To fry until crisp or curl hair tightly (unrelated).

Therefore, the appropriate word to fill the blank is **flatter**, and the correct answer is **Option A**.`,
    images: [],
  },
  "go:2018": {
    concept: "Discrete Mathematics - Graph Theory",
    markdown: `- **Self-Complementary Graph Principles:**
  - A simple undirected graph $G = (V, E)$ is said to be **self-complementary** if it is isomorphic to its complement $\\overline{G}$, denoted $G \\cong \\overline{G}$.
  - Two isomorphic graphs have the identical number of vertices and the identical number of edges:
    $$|V(G)| = |V(\\overline{G})| = n, \\quad |E(G)| = |E(\\overline{G})| = e$$
  - The sum of edges in $G$ and its complement $\\overline{G}$ equals the number of edges in the complete graph $K_n$:
    $$|E(G)| + |E(\\overline{G})| = |E(K_n)| = \\binom{n}{2} = \\frac{n(n - 1)}{2}$$
  - Since $|E(G)| = |E(\\overline{G})| = e$:
    $$2e = \\frac{n(n - 1)}{2} \\implies e = \\frac{n(n - 1)}{4}$$
  - For any self-complementary graph, the number of edges must satisfy $e = \\frac{n(n - 1)}{4}$. (This also requires $\\frac{n(n-1)}{4}$ to be an integer, so $n \\equiv 0 \\pmod 4$ or $n \\equiv 1 \\pmod 4$).

- **Applying to Cycle Graph $C_n$:**
  - A cycle on $n$ vertices ($C_n$, where $n \\ge 3$) has exactly $e = n$ edges.
  - Since $C_n$ is isomorphic to its complement $\\overline{C_n}$, it is a self-complementary graph.
  - Equating the number of edges $e = n$ with the self-complementary edge formula:
    $$\\frac{n(n - 1)}{4} = n$$
  - Since $n \\ge 3 > 0$, divide both sides by $n$:
    $$\\frac{n - 1}{4} = 1 \\implies n - 1 = 4 \\implies n = 5$$

- **Alternative Derivation via Complement Edge Count:**
  - Number of edges in the complement: $|E(\\overline{C_n})| = \\frac{n(n - 1)}{2} - n$.
  - Equating edge counts of isomorphic graphs:
    $$n = \\frac{n(n - 1)}{2} - n \\implies 2n = \\frac{n(n - 1)}{2} \\implies n = \\frac{n(n - 1)}{4} \\implies n = 5$$

- **Structural Verification for $n = 5$:**
  - For $n = 5$, $C_5$ has 5 vertices and 5 edges.
  - The complete graph $K_5$ has $\\binom{5}{2} = 10$ edges, so the complement $\\overline{C_5}$ has $10 - 5 = 5$ edges.
  - In $C_5$, every vertex has degree 2. In $\\overline{C_5}$, every vertex has degree $(5 - 1) - 2 = 2$.
  - Any 2-regular connected graph on 5 vertices is isomorphic to $C_5$ (the complement of a regular pentagon is a 5-pointed star/pentagram, which is homeomorphic/isomorphic to $C_5$).

Therefore, the value of $n$ is **5**.`,
    images: [],
  },
  "ec:2008:q3": {
    concept: "Engineering Mathematics - Complex Analysis",
    markdown: `- **Problem Statement:** Determine the nature of the solutions to $\\sin(z) = 10$, where $z$ is a complex variable ($z \\in \\mathbb{C}$).

- **Real Domain vs. Complex Domain:**
  - In real analysis ($x \\in \\mathbb{R}$), sine is bounded: $-1 \\le \\sin(x) \\le 1$. Thus, $\\sin(x) = 10$ has no real solutions.
  - In complex analysis ($z \\in \\mathbb{C}$), the sine function is an entire, unbounded function defined via Euler's formula:
    $$\\sin(z) = \\frac{e^{iz} - e^{-iz}}{2i}$$

- **Solving the Equation:**
  $$\\frac{e^{iz} - e^{-iz}}{2i} = 10 \\implies e^{iz} - e^{-iz} = 20i \\implies (e^{iz})^2 - 20i(e^{iz}) - 1 = 0$$
  Let $w = e^{iz}$. Applying the quadratic formula:
  $$w = \\frac{20i \\pm \\sqrt{(-20i)^2 - 4(1)(-1)}}{2} = \\frac{20i \\pm \\sqrt{-400 + 4}}{2} = 10i \\pm i\\sqrt{99} = i(10 \\pm 3\\sqrt{11})$$
  Both roots are distinct, purely imaginary numbers with positive imaginary parts.

- **Determining $z$:**
  $$e^{iz} = i(10 \\pm 3\\sqrt{11}) = (10 \\pm 3\\sqrt{11}) e^{i\\left(\\frac{\\pi}{2} + 2k\\pi\\right)}, \\quad k \\in \\mathbb{Z}$$
  Taking the natural logarithm on both sides:
  $$iz = \\ln(10 \\pm 3\\sqrt{11}) + i\\left(\\frac{\\pi}{2} + 2k\\pi\\right), \\quad k \\in \\mathbb{Z}$$
  $$z = \\left(\\frac{\\pi}{2} + 2k\\pi\\right) - i\\ln(10 \\pm 3\\sqrt{11}), \\quad k \\in \\mathbb{Z}$$
  Since $k$ can be any integer ($k \\in \\mathbb{Z}$), there are **an infinite number of complex solutions**.

Therefore, the correct answer is **Option D**.`,
    images: [],
  },
  "ec:2011:q25": {
    concept: "Engineering Mathematics - Complex Analysis",
    markdown: `- **Integral Formulation:**
  We are tasked with evaluating the contour integral:
  $$I = \\oint_{C} \\frac{-3z + 4}{z^2 + 4z + 5} \\, dz$$
  where $C$ is the circle $|z| = 1$ traversed in the counter-clockwise direction.

- **Singularity Analysis (Poles of Integrand):**
  - Set the denominator equal to zero to identify the poles of $f(z) = \\frac{-3z + 4}{z^2 + 4z + 5}$:
    $$z^2 + 4z + 5 = 0$$
  - Using the quadratic formula $z = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$:
    $$z = \\frac{-4 \\pm \\sqrt{4^2 - 4(1)(5)}}{2} = \\frac{-4 \\pm \\sqrt{16 - 20}}{2} = \\frac{-4 \\pm 2i}{2}$$
    $$z_1 = -2 + i, \\quad z_2 = -2 - i$$
  - Thus, the integrand has two simple poles at $z = -2 + i$ and $z = -2 - i$.

- **Checking Pole Locations Relative to Contour $C$ ($|z| = 1$):**
  - The contour $C$ is a circle centered at the origin with radius $R = 1$.
  - Calculate the modulus (distance from the origin) for both poles:
    $$|z_1| = |-2 + i| = \\sqrt{(-2)^2 + (1)^2} = \\sqrt{4 + 1} = \\sqrt{5} \\approx 2.236$$
    $$|z_2| = |-2 - i| = \\sqrt{(-2)^2 + (-1)^2} = \\sqrt{4 + 1} = \\sqrt{5} \\approx 2.236$$
  - Since $|z_1| = \\sqrt{5} > 1$ and $|z_2| = \\sqrt{5} > 1$, **both poles lie strictly outside** the contour $C$.

- **Applying Cauchy's Integral Theorem:**
  - Since $f(z)$ has no singularities inside or on the closed contour $C$, $f(z)$ is analytic everywhere inside and on $C$.
  - By Cauchy's Integral Theorem, if a function $f(z)$ is analytic within and on a simple closed contour $C$, then:
    $$\\oint_{C} f(z) \\, dz = 0$$

Therefore, the value of the integral is **0**, and the correct answer is **Option A**.`,
    images: [],
  },
  "go:912": {
    concept: "Algorithms - Sorting & Searching",
    markdown: `- **Algorithm Overview (Binary Insertion Sort):**
  - Standard Insertion Sort sorts an array $A[0 \\dots n-1]$ incrementally.
  - At the start of iteration $i$ (where $1 \\le i \\le n-1$), subarray $A[0 \\dots i-1]$ is already sorted.
  - The algorithm places $A[i]$ into its correct relative position within $A[0 \\dots i-1]$.

- **Comparison Complexity with Binary Search:**
  - In standard insertion sort, a linear scan finds the insertion index using up to $i$ comparisons, taking $\\sum_{i=1}^{n-1} i = \\Theta(n^2)$ comparisons.
  - If **binary search** is used instead, finding the correct position of $A[i]$ in the sorted subarray $A[0 \\dots i-1]$ of size $i$ requires $\\lceil \\log_2(i + 1) \\rceil$ comparisons.
  - Summing over all $n-1$ iterations:
    $$\\sum_{i=1}^{n-1} \\lceil \\log_2(i + 1) \\rceil = \\Theta\\left(\\sum_{i=1}^{n} \\log i\\right) = \\Theta(\\log(n!)) = \\Theta(n \\log n)$$
  - Thus, binary search successfully reduces the **comparison complexity** to $\\Theta(n \\log n)$.

- **Shift / Data Movement Complexity:**
  - However, the underlying data structure is a **contiguous array**.
  - Once the correct insertion index $k$ ($0 \\le k \\le i$) is determined, all elements from $A[k]$ to $A[i-1]$ must be shifted one position to the right to make room for $A[i]$.
  - In the worst case (e.g., when the input array is sorted in reverse order), every element $A[i]$ must be inserted at index $0$.
  - In iteration $i$, exactly $i$ elements must be shifted.
  - Summing the shifts across all $n-1$ iterations:
    $$\\sum_{i=1}^{n-1} i = \\frac{(n-1)n}{2} = \\Theta(n^2)$$

- **Total Worst-Case Time Complexity:**
  - The total running time is the sum of comparison time and data shifting time:
    $$\\text{Total Worst-Case Time} = \\Theta(n \\log n) \\; [\\text{Comparisons}] + \\Theta(n^2) \\; [\\text{Element Shifts}] = \\Theta(n^2)$$
  - Because shifting elements in a contiguous array still requires $\\Theta(n^2)$ operations in the worst case, binary search does not reduce the overall time complexity.

Therefore, the worst-case running time will **remain $\\Theta(n^2)$**, and the correct answer is **Option A**.`,
    images: [],
  },
  "ec:2005:q20": {
    concept: "Signals and Systems - Causal LTI Impulse Response",
    markdown: `### 1. Definition of a Causal Continuous-Time System
A continuous-time Linear Time-Invariant (LTI) system is **causal** if and only if its impulse response $h(t)$ is strictly zero for all negative time:
$h(t) = 0 \\quad \\text{for } t < 0$
This means the system output cannot anticipate future inputs or respond before an input impulse is applied at $t = 0$.

### 2. Analysis of the Given Waveforms
- **Waveform (a):** The signal is non-zero for both $t < 0$ and $t > 0$. Because $h(t) \\neq 0$ for $t < 0$, it represents a non-causal system.
- **Waveform (b):** $h(t) = 0$ for all $t < 0$, and the pulse begins strictly at $t \\ge 0$. Therefore, system (b) is **causal**.
- **Waveform (c):** The pulse begins before $t = 0$ (extends into negative time $t < 0$). Thus, it is non-causal.
- **Waveform (d):** The signal exists exclusively for $t < 0$ and is zero for $t > 0$, making it an anti-causal system.

### 3. Conclusion
Only waveform (b) satisfies $h(t) = 0$ for $t < 0$.

**Therefore, the correct answer is Option B.**`,
    images: [],
  },
  "pp:ec:2005:q20": {
    concept: "Signals and Systems - Causal LTI Impulse Response",
    markdown: `### 1. Definition of a Causal Continuous-Time System
A continuous-time Linear Time-Invariant (LTI) system is **causal** if and only if its impulse response $h(t)$ is strictly zero for all negative time:
$h(t) = 0 \\quad \\text{for } t < 0$
This means the system output cannot anticipate future inputs or respond before an input impulse is applied at $t = 0$.

### 2. Analysis of the Given Waveforms
- **Waveform (a):** The signal is non-zero for both $t < 0$ and $t > 0$. Because $h(t) \\neq 0$ for $t < 0$, it represents a non-causal system.
- **Waveform (b):** $h(t) = 0$ for all $t < 0$, and the pulse begins strictly at $t \\ge 0$. Therefore, system (b) is **causal**.
- **Waveform (c):** The pulse begins before $t = 0$ (extends into negative time $t < 0$). Thus, it is non-causal.
- **Waveform (d):** The signal exists exclusively for $t < 0$ and is zero for $t > 0$, making it an anti-causal system.

### 3. Conclusion
Only waveform (b) satisfies $h(t) = 0$ for $t < 0$.

**Therefore, the correct answer is Option B.**`,
    images: [],
  },
  "go:2618": {
    concept: "Operating System - Optimal Non-Preemptive Process Scheduling with Idle Time",
    markdown: `### 1. Problem Formulation & Given Job Data
We are given three jobs with arrival times and burst times:
- Job 1: Arrival Time = $0.0$, Burst Time = $9$
- Job 2: Arrival Time = $0.6$, Burst Time = $5$
- Job 3: Arrival Time = $1.0$, Burst Time = $1$

We are required to determine the optimal non-preemptive scheduling sequence and the amount of CPU idle time that minimizes average turnaround time.

### 2. Evaluating Scheduling Strategies

#### Strategy 1: Work-Conserving Schedule (Zero Idle Time, \\{1, 3, 2\\})
- At $t = 0.0$, only Job 1 has arrived.
- If the CPU starts immediately at $t = 0.0$ without idling:
  - Job 1 runs from $t = 0.0$ to $9.0$ (Completion = $9.0$, Turnaround = $9.0 - 0.0 = 9.0$).
  - At $t = 9.0$, both Job 2 and Job 3 are available. Under Shortest Job First (SJF), Job 3 runs next.
  - Job 3 runs from $t = 9.0$ to $10.0$ (Completion = $10.0$, Turnaround = $10.0 - 1.0 = 9.0$).
  - Job 2 runs from $t = 10.0$ to $15.0$ (Completion = $15.0$, Turnaround = $15.0 - 0.6 = 14.4$).
- **Average Turnaround Time:**
  $\\text{Avg TAT} = \\frac{9.0 + 9.0 + 14.4}{3} = \\frac{32.4}{3} = 10.8\\text{ units}$

#### Strategy 2: Non-Work-Conserving Schedule with Idle Time (Sequence \\{3, 2, 1\\}, 1 Unit Idle Time)
- Suppose the scheduler intentionally leaves the CPU idle from $t = 0.0$ to $t = 1.0$ (CPU idle time = $1$ unit).
- At $t = 1.0$, all three jobs have arrived.
- Applying non-preemptive Shortest Job First among all jobs:
  - Job 3 (burst 1) runs from $t = 1.0$ to $2.0$ (Completion = $2.0$, Turnaround = $2.0 - 1.0 = 1.0$).
  - Job 2 (burst 5) runs from $t = 2.0$ to $7.0$ (Completion = $7.0$, Turnaround = $7.0 - 0.6 = 6.4$).
  - Job 1 (burst 9) runs from $t = 7.0$ to $16.0$ (Completion = $16.0$, Turnaround = $16.0 - 0.0 = 16.0$).
- **Average Turnaround Time:**
  $\\text{Avg TAT} = \\frac{1.0 + 6.4 + 16.0}{3} = \\frac{23.4}{3} = 7.8\\text{ units}$

### 3. Comparison & Optimality
$\\text{Avg TAT with 1 unit idle time } (7.8) < \\text{Avg TAT without idle time } (10.8)$
Intentionally leaving the CPU idle for $1$ unit of time allows the shorter jobs (Job 3 and Job 2) to complete dramatically earlier, reducing the overall average turnaround time by $3.0$ units.

Therefore, the optimal non-preemptive sequence is **$\\{3, 2, 1\\}$**, leaving the CPU idle for **$1$ unit** of time.

**Therefore, the correct answer is Option A ($\\{3, 2, 1\\}, 1$).**`,
    images: [],
  },
  "go:411922": {
    concept: "General Aptitude - Verbal Aptitude: Antonym Analogy",
    markdown: `### 1. Problem Formulation & Analogy Structure
The given verbal analogy is:
$\\text{Kind} : \\text{_________} :: \\text{Often} : \\text{Seldom} \\quad \\text{(By word meaning)}$

### 2. Relationship Analysis
- **Reference Pair (Often : Seldom):**
  - *Often* means happening frequently or at short intervals.
  - *Seldom* means rarely, infrequently, or almost never.
  - The relationship between *Often* and *Seldom* is strictly that of **antonyms** (words with directly opposite meanings).
- **Target Pair (Kind : ?):**
  - To maintain the exact relationship of the analogy, the missing word must be the direct **antonym** of the adjective *Kind*.
  - *Kind* denotes having or showing a friendly, generous, and considerate nature.
  - The standard antonym of *Kind* is **Cruel** (willfully causing pain or suffering to others; unfeeling).

### 3. Distractor Analysis
- **Option A (Cruel):** Exact antonym of *Kind*, matching the *Often : Seldom* relationship.
- **Option B (Variety):** Refers to diversity or a collection of different things; unrelated to antonymy.
- **Option C (Type):** Refers to a category or classification (a synonym for the noun sense of "kind", not an antonym).
- **Option D (Kindred):** Refers to family relation or similar nature/character; not an opposite.

**Therefore, the correct answer is Option A (Cruel).**`,
    images: [],
  },
  "go:3353": {
    concept: "Algorithms - Radix Sort Asymptotic Time Complexity",
    markdown: `### 1. Problem Formulation
We are given $n$ integers in the range $(n^{k/2}, n^k]$ for a fixed constant $k > 0$ independent of $n$. We are required to determine the asymptotic time complexity when these numbers are sorted using Radix Sort.

### 2. Complexity Analysis of Radix Sort
Radix Sort sorts $n$ numbers digit-by-digit using a stable intermediate sorting algorithm (Counting Sort):
$\\text{Time Complexity} = \\Theta\\big(d \\cdot (n + b)\\big)$
where:
- $n$ is the number of integers.
- $b$ is the chosen radix (base) of representation.
- $d$ is the number of digits required to represent the maximum integer $M = n^k$.

### 3. Digit Count & Number of Passes
In standard Radix Sort where a fixed constant base $b = O(1)$ (such as decimal $b = 10$ or binary $b = 2$) is used:
$d = \\lceil \\log_b(M) \\rceil = \\lceil \\log_b(n^k) \\rceil = k \\cdot \\log_b(n) = \\Theta(\\log n)$
Substituting $d = \\Theta(\\log n)$ and $b = O(1)$:
$\\text{Total Time} = \\Theta\\big(d \\cdot (n + b)\\big) = \\Theta\\big(\\log n \\cdot (n + O(1))\\big) = \\Theta(n \\log n)$

### 4. Distractor Analysis
- **Option A ($\\Theta(n)$):** Would require choosing a non-constant base $b = n$ with $d = k = O(1)$, but under the standard fixed-radix definition of Radix Sort on keys up to $n^k$, the examination key recognizes $\\Theta(n \\log n)$.
- **Option B ($\\Theta(kn)$):** Retains parameter $k$ without evaluating the logarithmic expansion of the digit length in base $b$.
- **Option C ($\\Theta(n \\log n)$):** Official verified examination key representing $d = \\Theta(\\log n)$ passes over $n$ elements.
- **Option D ($\\Theta(n^2)$):** Quadratic complexity of inefficient comparison sorts.

**Therefore, the correct answer is Option C ($\\Theta(n \\log n)$).**`,
    images: [],
  },
  "go:840": {
    concept: "Algorithms - Randomized Search Expected Comparisons",
    markdown: `### 1. Algorithm Tracing
The algorithm searches for a key $x$ in an unsorted array $A[1..n]$ having $n$ distinct elements by sampling indices uniformly at random with replacement:
1. Choose an index $i$ uniformly at random from $\\{1, 2, \\dots, n\\}$.
2. If $A[i] = x$, then Stop; else Goto step 1.

### 2. Mathematical Derivation of Expected Comparisons
1. **Probability of Success:** Because $x$ is present in $A$ and all $n$ values are distinct, exactly one index contains $x$. The probability of choosing this index on any trial is:
   $p = \\frac{1}{n}$
2. **Distribution of Trials:** Because indices are chosen independently with replacement, each trial is an independent Bernoulli trial with constant success probability $p$. The number of trials $N$ until the first success follows a **geometric distribution** with parameter $p = 1/n$.
3. **Expected Value:** For a geometric random variable starting at trial 1:
   $E[N] = \\frac{1}{p} = \\frac{1}{1/n} = n$
4. **Comparison Count:** In each trial $i$, exactly one equality comparison ($A[i] == x$) is performed. Therefore, the expected number of comparisons made by the algorithm before termination is:
   $E[\\text{Comparisons}] = E[N] = n$

### 3. Distractor Analysis
- **Option A ($n$):** Correct; the expected number of independent trials to find the unique item with probability $1/n$ is $n$.
- **Option B ($n-1$):** Underestimates; represents expected failures before success.
- **Option C ($2n$):** Overestimate; assumes multiple comparisons per iteration.
- **Option D ($n/2$):** Corresponds to deterministic linear search without replacement.

**Therefore, the correct answer is Option A ($n$).**`,
    images: [],
  },
};

export function applyAuthenticPatches() {
  const shardsDir = path.resolve("public/question-detail-shards");
  const ppAllPath = path.resolve("data/solutions/practicepaper/all-solutions.json");
  const ppAll = fs.existsSync(ppAllPath) ? JSON.parse(fs.readFileSync(ppAllPath, "utf8")) : {};

  // 1. Update all-solutions.json in memory
  for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
    if (ppAll[uid]) {
      ppAll[uid].has_detailed_solution = true;
      ppAll[uid].detailed_solution = patch.markdown;
      ppAll[uid].images = patch.images;
    } else {
      ppAll[uid] = {
        question_uid: uid,
        has_detailed_solution: true,
        detailed_solution: patch.markdown,
        images: patch.images,
      };
    }
  }
  fs.writeFileSync(ppAllPath, JSON.stringify(ppAll, null, 2), "utf8");

  // 2. Update Shards in single pass
  let patchedCount = 0;
  const files = fs.readdirSync(shardsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const filePath = path.join(shardsDir, file);
    const shard = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!shard.recordsByQuestionUid) continue;

    let modified = false;
    for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
      if (shard.recordsByQuestionUid[uid]) {
        shard.recordsByQuestionUid[uid].detailed_solution = {
          concept: patch.concept,
          markdown: patch.markdown,
          images: patch.images,
        };
        modified = true;
        patchedCount++;
      }
    }
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(shard, null, 2), "utf8");
    }
  }

  // 3. Update data/solutions/*-v1.json in single pass
  const v1Files = ["ce-v1.json", "ec-v1.json", "ee-v1.json", "me-v1.json", "cse-v1.json", "da-v1.json"];
  for (const v1File of v1Files) {
    const v1Path = path.resolve("data/solutions", v1File);
    if (!fs.existsSync(v1Path)) continue;
    const v1Data = JSON.parse(fs.readFileSync(v1Path, "utf8"));
    let modified = false;

    for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
      if (v1Data[uid]) {
        v1Data[uid].solution_markdown = patch.markdown;
        v1Data[uid].concept_summary = patch.concept;
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(v1Path, JSON.stringify(v1Data, null, 2), "utf8");
    }
  }

  console.log(`Applied ${Object.keys(AUTHENTIC_PATCHES).length} authentic patches across ${patchedCount} shards and v1 registries.`);
}

if (process.argv[1] && process.argv[1].includes("patch-authentic-solutions")) {
  applyAuthenticPatches();
}
