import fs from 'fs';

let daPayload = JSON.parse(fs.readFileSync('./public/data/da/search-index.json', 'utf8'));
let daQuestions = Array.isArray(daPayload) ? daPayload : daPayload.questions;

console.log(`Loaded ${daQuestions.length} DA questions.`);

const DA_SUBJECTS = [
  { id: "da-prob-stats", slug: "probability-and-statistics", canonicalSubjectSlugs: ["probability-and-statistics", "da:probability-and-statistics"], label: "Probability & Statistics" },
  { id: "da-linear-algebra", slug: "linear-algebra", canonicalSubjectSlugs: ["linear-algebra", "da:linear-algebra"], label: "Linear Algebra" },
  { id: "da-calculus-optimization", slug: "calculus-and-optimization", canonicalSubjectSlugs: ["calculus-and-optimization", "da:calculus-and-optimization"], label: "Calculus & Optimization" },
  { id: "da-prog-dsa", slug: "programming-data-structures-and-algorithms", canonicalSubjectSlugs: ["programming-data-structures-and-algorithms", "da:programming-data-structures-and-algorithms", "programming-in-python", "data-structures", "algorithms"], label: "Programming, Data Structures & Algorithms" },
  { id: "da-dbms-warehousing", slug: "database-management-and-warehousing", canonicalSubjectSlugs: ["database-management-and-warehousing", "da:database-management-and-warehousing"], label: "DBMS & Data Warehousing" },
  { id: "da-machine-learning", slug: "machine-learning", canonicalSubjectSlugs: ["machine-learning", "da:machine-learning"], label: "Machine Learning" },
  { id: "da-artificial-intelligence", slug: "artificial-intelligence", canonicalSubjectSlugs: ["artificial-intelligence", "da:artificial-intelligence", "data-science-and-artificial-intelligence"], label: "Artificial Intelligence" },
  { id: "da-ga", slug: "general-aptitude", canonicalSubjectSlugs: ["general-aptitude", "da:general-aptitude", "ga"], label: "General Aptitude" },
];

const normalizeToken = (val) =>
  String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "-");

const isQuestionInTrack = (q, track) => {
  if (!q) return false;
  const explicitTrack = String(q.track || q.exam?.track || "").toLowerCase();
  if (explicitTrack === "cse" || explicitTrack === "da") {
    return explicitTrack === track;
  }
  const uid = String(q.question_uid || q.uid || "").toLowerCase();
  if (uid.startsWith("da:") || uid.startsWith("da-")) {
    return track === "da";
  }
  const slug = String(q.subjectSlug || "").toLowerCase();
  if (slug.startsWith("da:")) {
    return track === "da";
  }
  return track === "cse";
};

const isQuestionInSubject = (q, subject) => {
  if (!q) return false;
  const qSubjectSlug = normalizeToken(q.subjectSlug || q.subject);
  const qSubjectClean = qSubjectSlug.replace(/^da:/, "");
  
  const matchesDirectSlug = normalizeToken(subject.slug) === qSubjectSlug || normalizeToken(subject.slug) === qSubjectClean;
  const matchesCanonical = (subject.canonicalSubjectSlugs || []).some(
    (cs) => normalizeToken(cs) === qSubjectSlug || normalizeToken(cs) === qSubjectClean
  );
  return matchesDirectSlug || matchesCanonical;
};

console.log("=== DA SUBJECT MATCHING RESULTS ===");
let totalMatched = 0;
for (const sub of DA_SUBJECTS) {
  let count = 0;
  for (const q of daQuestions) {
    if (isQuestionInSubject(q, sub)) {
      count++;
    }
  }
  totalMatched += count;
  console.log(`${sub.label} (${sub.slug}): ${count} PYQs`);
}
console.log(`\nTotal matched DA questions: ${totalMatched} / ${daQuestions.length}`);
