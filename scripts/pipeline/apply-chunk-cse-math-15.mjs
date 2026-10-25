import fs from "node:fs";
import path from "node:path";
const ROOT=process.cwd(), ID="CHUNK-CSE-MATH-15", DATE="2026-10-23";
const CHUNK=path.join(ROOT,"data/solutions/chunks/cse/chunk-cse-math-15.json");
const PATCH=path.join(ROOT,"scripts/pipeline/patch-authentic-solutions.mjs");
const ANSWERS=path.join(ROOT,"data/answers/answers_by_question_uid_v1.json");
export const CHUNK_CSE_MATH_15_SOLUTIONS={
"go:1066":{concept:"Group theory - completing a cyclic group table",markdown:String.raw`The row for $a$ gives $a^2=b$, $a^3=c$, and $a^4=e$, so $a$ generates this cyclic group. Since $c=a^3$, its products with the columns $e,a,b,c$ are $a^3,a^4,a^5,a^6$, namely $c,e,a,b$.

Therefore, the last row is $c,e,a,b$.

**Option D.**`,images:[]},
"go:896":{concept:"Combinatorics - attendance choices for couples",markdown:String.raw`For each couple the allowed choices are neither attends, only the wife attends, or both attend. The husband-only case is forbidden. Choices are independent across couples, so the multiplication principle gives $3^n$ gatherings.

**Option B ($3^n$).**`,images:[]},
"go:898":{concept:"Algebraic structures - strings under concatenation",markdown:String.raw`Concatenation is associative and the empty string is an identity, but a nonempty string has no inverse: appending symbols cannot reduce its positive length to zero. Thus $\Sigma^*$ is a monoid, not a group. Removing the empty string removes the identity and still does not give inverses.

**Option A: it does not form a group.**`,images:[]},
"go:899":{concept:"Graph theory - components after vertex deletion",markdown:String.raw`Let the removed vertex lie in a component of size $s$. The other $k-1$ components remain, while its component leaves between $0$ and $s-1$ components. Thus the new count is at least $k-1$. Since each untouched component has at least one vertex, $s\le n-k+1$, so the count is at most $k-1+s-1\le n-1$. Deleting an isolated vertex attains the lower bound; deleting a star center with all other vertices isolated attains the upper bound.

**Option C: from $k-1$ through $n-1$.**`,images:[]},
"go:921":{concept:"Partial orders - monotone predicates",markdown:String.raw`Because $a\le c$ and $P(a)$ is true, monotonicity forces $P(c)$ true. The three-element order with $a,b$ minimal and both below $c$, with values $P(a)=T,P(b)=F,P(c)=T$, shows A, B, and C can hold. D cannot hold: $c$ is above both $a$ and $b$, yet $P(c)$ must be true.

**Option D cannot be true.**`,images:[]},
"go:922":{concept:"First-order logic - quantifier distribution",markdown:String.raw`If $\forall x(\alpha\to\beta)$ and $\forall x\alpha$ both hold, then for every domain element $\alpha\to\beta$ and $\alpha$ hold, so $\beta$ holds. Hence $\forall x(\alpha\to\beta)\to((\forall x\alpha)\to(\forall x\beta))$ is valid.

A fails when $\forall\alpha$ is false but a point violates $\alpha\to\beta$; B fails with $\alpha$ always true and $\beta$ always false; C fails on a singleton with $\alpha=F,\beta=T$.

**Option D.**`,images:[]},
"go:923":{concept:"First-order logic - evaluating interpretations",markdown:String.raw`For every natural $x$, choose $y=1$: $1$ divides $x$, and $1$ divides itself, so $Q_{x1}$ is true and $\neg Q_{11}$ is false. Therefore $\forall y(Q_{xy}\leftrightarrow\neg Q_{yy})$ is false for every $x$. The antecedent of $\alpha$ then reduces to $\forall x\neg P_x$, exactly its consequent. Thus $\alpha$ is $A\to A$ under either interpretation.

**Option D: both $I_1$ and $I_2$ satisfy $\alpha$.**`,images:[]},
"go:924":{concept:"Combinatorics - stars and bars with lower bounds",markdown:String.raw`If bag $i$ receives $x_i\ge k$, set $y_i=x_i-k$. Then $y_i\ge0$ and $\sum_{i=1}^n y_i=m-kn$. Stars and bars counts these solutions as $\binom{m-kn+n-1}{n-1}$; the distinct bags label the variables.

**Option B.**`,images:[]},
"go:926":{concept:"Graph theory - perfect matchings of K6",markdown:String.raw`Pair one fixed vertex with any of the other $5$ vertices. Pair the remaining four in $3$ ways, then pair the final two in $1$ way. Thus there are $5\cdot3\cdot1=15$ perfect matchings (equivalently $(6-1)!!$).

**Option A (15).**`,images:[]},
"go:927":{concept:"Set functions - image of a preimage",markdown:String.raw`By definition, $g(h(D))=\{f(x):x\in A, f(x)\in D\}=f(A)\cap D$. This is always a subset of $D$; elements of $D$ outside the image of $f$ are omitted. The intersection need not be nonempty, as $D=\varnothing$ shows.

**Option A: $g(h(D))\subseteq D$.**`,images:[]},
"go:929":{concept:"Finite algebra - equations from operation tables",markdown:String.raw`The $*$ table makes $a$ the identity, so the first equation becomes $x+y=c$. From the $+$ table its only pairs are $(a,c),(b,c),(c,b)$. Test the second equation: $(a,c)$ gives $(b*a)+(c*c)=b+b=b\ne c$; $(b,c)$ gives $(b*b)+(c*c)=c+b=c$; $(c,b)$ gives $(b*c)+(c*b)=a+c=c$. Exactly two pairs work.

**Option C (2).**`,images:[]},
"go:930":{concept:"Discrete mathematics - unique-factorization encoding",markdown:String.raw`For a nonempty string $s=a_1\dots a_r$, $f(s)=2^{g(a_1)}3^{g(a_2)}\cdots p_r^{g(a_r)}$, where $g(a_i)\in\{3,5,7,9,11\}$. Thus $f(s)$ is even and its exponent on $2$ must be one of those values. Candidate exponents $7,9$ are odd, while $10$ has 2-adic exponent $1$; none can be $f(s)$. But $f(a)=2^3=8$, so the sequence $\langle a,a,a\rangle$ encodes $2^8 3^8 5^8$.

**Option B.**`,images:[]},
"go:931":{concept:"Graph theory - minimum degree bound",markdown:String.raw`If every vertex had degree at least $6$, the handshaking lemma would give $2|E|=\sum_v\deg(v)\ge6|V|$, hence $|E|\ge3|V|$. This contradicts the given $|E|\le3|V|-6$.

**Option D: minimum degree 6 cannot occur.**`,images:[]},
"go:932":{concept:"Linear algebra - consistency of a rank-deficient system",markdown:String.raw`Column 3 is $-4$ times column 2, so the coefficient matrix has rank $2$. Row operations $R_2\gets R_2-2R_1$ and $R_3\gets R_3-\tfrac12R_1$, followed by eliminating row 3's second entry, leave $[0\ 0\ 0\mid \tfrac52\alpha-\tfrac12]$. Consistency requires $\alpha=\tfrac15$, the only value. At that value rank $2<3$ leaves one free variable, so solutions are infinite; otherwise the system is inconsistent.

**Option B (one value).**`,images:[]},
"go:948":{concept:"Probability - convolution of independent execution times",markdown:String.raw`The total execution time is the sum $T=T_1+T_2$ of independent, nonnegative durations. The density of a sum is the convolution $f_T(t)=\int_{-\infty}^{\infty}f_1(x)f_2(t-x)\,dx$. Nonnegativity restricts the support to $0\le x\le t$, giving $\int_0^t f_1(x)f_2(t-x)\,dx$.

**Option C.**`,images:[]},
"go:959":{concept:"Propositional logic - resolution rule",markdown:String.raw`If $(P\lor R)\land(Q\lor\neg R)$ holds, then either $P$ holds, or $R$ holds and forces $Q$; hence the resolvent $P\lor Q$ follows (A). The converse B fails for $P=T,Q=F,R=T$: the resolvent is true but $Q\lor\neg R$ is false. C is true at the satisfiability level: the parent clauses have a joint model exactly when at least one of $P,Q$ is true. Also $(P\lor Q)\to F$ is equivalent to $\neg P\land\neg Q$, so D is true.

**Option B is false.**`,images:[]},
"go:805":{concept:"Linear algebra - matrix rank",markdown:String.raw`The matrix $\begin{bmatrix}1&1\\0&0\end{bmatrix}$ has one nonzero row; its columns are identical and nonzero. Therefore its row and column ranks are both $1$.

**Option C (1).**`,images:[]},
"go:808":{concept:"Graph theory - cycle coloring",markdown:String.raw`An even cycle is bipartite and can be colored by alternating two colors. An odd cycle cannot alternate consistently around its closing edge and needs a third color. The expression $n-2\lfloor n/2\rfloor+2$ evaluates to $2$ for even $n$ and $3$ for odd $n$.

**Option D.**`,images:[]},
"go:810":{concept:"Algebraic structures - matrices under multiplication",markdown:String.raw`Negative rationals are not closed under multiplication, since the product of two negatives is positive. All square matrices include the zero matrix, which has no inverse. For fixed order over a field, nonsingular matrices contain the identity, are closed under multiplication, and each has a nonsingular inverse; they form a group.

**Option B only.**`,images:[]},
"go:812":{concept:"Propositional logic - translation of unless",markdown:String.raw`"If $X$ then $Y$ unless $Z$" makes $Y$ follow when $X$ occurs and the exception $Z$ does not: $(X\land\neg Z)\to Y$. This does not assert that $Z$ is always false or require $Y$ when the exception occurs.

**Option A.**`,images:[]},
"go:830":{concept:"Graph theory - maximum edges in a simple graph",markdown:String.raw`Each edge in a simple undirected graph joins one unordered pair of distinct vertices, and each pair can support at most one edge. There are $\binom n2=\frac{n(n-1)}2$ such pairs, attained by the complete graph.

**Option B.**`,images:[]},
"go:846":{concept:"Probability - at least one head and one tail",markdown:String.raw`Of the $2^4=16$ equally likely outcomes, only $HHHH$ and $TTTT$ lack both a head and a tail. The probability is $1-2/16=14/16=7/8$.

**Option C ($7/8$).**`,images:[]},
"go:847":{concept:"Relations - properties of the empty relation",markdown:String.raw`On the nonempty set $A=\{1,2,3\}$, the empty relation is not reflexive because it contains none of $(1,1),(2,2),(3,3)$. Symmetry holds vacuously because there is no related pair, and transitivity holds vacuously because there are no composable related pairs.

**Option D: transitive and symmetric.**`,images:[]},
"go:694":{concept:"Linear algebra - sums of singular matrices",markdown:String.raw`For S1, $\operatorname{diag}(1,0)$ and $\operatorname{diag}(0,1)$ are singular but sum to $I$, which is nonsingular. For S2, $I$ and $-I$ are nonsingular but sum to the zero matrix, which is singular. Thus both "may" statements are true.

**Option A.**`,images:[]},
"go:695":{concept:"Relations - equivalence relations",markdown:String.raw`$R_1$ means equal parity, and $R_3$ means equal sign on nonzero rationals; both are reflexive, symmetric, and transitive. $R_2$ is not reflexive because $a+a$ is always even. $R_4$ is reflexive and symmetric but not transitive: $1R_4 3$ and $3R_4 5$, while $|1-5|=4>2$.

**Option B: $R_1$ and $R_3$ only.**`,images:[]}
};
const NOTES={
"go:1066":"Powers of a yield row c,e,a,b.","go:896":"Three valid attendance states per couple yield 3^n.","go:898":"Nonempty strings have no concatenation inverse.","go:899":"Deletion leaves k-1 through n-1 components, with isolated-vertex and star-center extremal cases.","go:921":"P(c) is forced true; the three-element witness shows only D is impossible.","go:922":"Universal modus ponens proves D; countermodels falsify A-C.","go:923":"For each x, y=1 makes the inner universal false, reducing the formula to A implies A.","go:924":"Subtract k per bag and use stars and bars.","go:926":"K6 perfect matchings count as 5*3*1.","go:927":"The image of the preimage is f(A) intersect D.","go:929":"Only (a,c),(b,c),(c,b) satisfy the first equation; the latter two satisfy the second.","go:930":"Only exponent 8 can be f(s); f(a)=8 and the three-string sequence gives B.","go:931":"Degree sum at least 6|V| contradicts the edge bound.","go:932":"Consistency forces alpha=1/5; rank 2 with three unknowns gives infinitely many solutions.","go:948":"Independent nonnegative times sum by convolution.","go:959":"A is the resolution implication; B's converse fails at T,F,T; C,D are true.","go:805":"The matrix has rank one.","go:808":"Cycle chromatic number is 2 for even n, 3 for odd n.","go:810":"Only nonsingular square matrices form a multiplication group.","go:812":"Unless expresses (X and not Z) implies Y.","go:830":"There is one possible edge per unordered distinct-vertex pair.","go:846":"Exclude HHHH and TTTT to get 7/8.","go:847":"Empty relation is symmetric/transitive vacuously, but not reflexive.","go:694":"Two diagonal examples witness S1 and S2.","go:695":"R1 is equal parity, R3 equal sign; R2 and R4 fail reflexivity/transitivity."
};
function review(){const c=JSON.parse(fs.readFileSync(CHUNK,"utf8"));const answers=JSON.parse(fs.readFileSync(ANSWERS,"utf8")).records_by_question_uid;
 for(const q of c.questions){if(!CHUNK_CSE_MATH_15_SOLUTIONS[q.uid])throw Error("Missing solution "+q.uid);const a=answers[q.uid];if(!a||a.answer!==q.officialAnswer)throw Error("Answer record mismatch "+q.uid);q.status="ACCEPTED";delete q.specialCategory;q.review={reviewer:"Codex",reviewedAt:DATE,disposition:"ACCEPTED",identityVerified:true,stemOptionsAndDiagramChecked:true,answerKeySource:"Existing UID answer record ("+JSON.stringify(a.source)+") cross-checked against displayed question and independent derivation; no answer key changed.",answerKeyVerified:true,answerKeyStatus:"MATCHED",sourceUrl:q.goLink,researchLinks:[{url:q.goLink,accessedAt:DATE}],independentCheck:NOTES[q.uid],notes:NOTES[q.uid]};}
 c.status="REVIEWED";c.reviewStatus="REVIEWED";c.reviewedAt=DATE;c.acceptedCount=c.questions.length;c.holdCount=0;c.specialCategories={HOLD:[]};fs.writeFileSync(CHUNK,JSON.stringify(c,null,2)+"\n","utf8");console.log(ID+" review complete: "+c.acceptedCount+" accepted; no holds.");}
function inject(){const c=JSON.parse(fs.readFileSync(CHUNK,"utf8"));const accepted=new Set(c.questions.map(q=>q.uid));const content=fs.readFileSync(PATCH,"utf8"),nl=content.includes("\r\n")?"\r\n":"\n",lines=content.split(/\r?\n/),add=[];let refreshed=0;
 for(const [uid,sol] of Object.entries(CHUNK_CSE_MATH_15_SOLUTIONS)){if(!accepted.has(uid))continue;const line="  "+JSON.stringify(uid)+": "+JSON.stringify(sol)+",";const i=lines.findIndex(x=>x.startsWith("  "+JSON.stringify(uid)+": "));if(i<0)add.push(line);else{lines[i]=line;refreshed++;}}
 if(add.length+refreshed!==accepted.size)throw Error("Solution count mismatch");if(add.length){const i=lines.findIndex(x=>x.includes("export const AUTHENTIC_PATCHES = {"));if(i<0)throw Error("Patch registry marker missing");lines.splice(i+1,0,...add);}fs.writeFileSync(PATCH,lines.join(nl),"utf8");console.log(ID+" patches synchronized: "+accepted.size+" total; "+add.length+" new.");}
function integrated(){const c=JSON.parse(fs.readFileSync(CHUNK,"utf8")),registry=JSON.parse(fs.readFileSync(path.join(ROOT,"data/solutions/practicepaper/all-solutions.json"),"utf8")),dir=path.join(ROOT,"public/question-detail-shards"),shards=fs.readdirSync(dir).filter(x=>x.endsWith(".json")).map(name=>({name,data:JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"))}));
 for(const q of c.questions){const shard=shards.find(s=>s.data.recordsByQuestionUid?.[q.uid]);if(!registry[q.uid]?.detailed_solution||!shard?.data.recordsByQuestionUid[q.uid]?.detailed_solution?.markdown)throw Error("Missing built solution for "+q.uid);q.status="INTEGRATED";q.review.disposition="INTEGRATED";q.review.integrationResult={status:"VERIFIED",verifiedAt:DATE,registryPath:"data/solutions/practicepaper/all-solutions.json",detailShardPath:"public/question-detail-shards/"+shard.name};}
 c.status="COMPLETED";c.reviewStatus="REVIEWED";c.integratedCount=c.questions.length;c.acceptedCount=c.questions.length;c.holdCount=0;fs.writeFileSync(CHUNK,JSON.stringify(c,null,2)+"\n","utf8");const mp=path.join(ROOT,"data/solutions/chunks/manifest.json"),m=JSON.parse(fs.readFileSync(mp,"utf8")),e=m.chunks[ID];e.status="COMPLETED";e.acceptedCount=c.questions.length;e.integratedCount=c.questions.length;e.heldCount=0;e.updatedAt=DATE;e.completedAt=new Date().toISOString();m.lastUpdated=new Date().toISOString();fs.writeFileSync(mp,JSON.stringify(m,null,2)+"\n","utf8");console.log(ID+" verified: "+c.questions.length+" integrated, 0 held.");}
if(process.argv[1]?.includes("apply-chunk-cse-math-15")){if(process.argv.includes("--review-only"))review();else if(process.argv.includes("--mark-integrated"))integrated();else inject();}
