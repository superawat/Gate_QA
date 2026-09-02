import fs from 'fs';

const questions = JSON.parse(fs.readFileSync('./public/question-search-index.json', 'utf8'));

// Import tracker taxonomy & state logic
// We can write the test matching function directly to see how it matches
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

// Check for all CSE subjects
const CSE_SUBJECTS = [
  { id: "cse-em", slug: "engg-math", canonicalSubjectSlugs: ["engg-math", "discrete-math"], label: "Engineering Mathematics" },
  { id: "cse-dl", slug: "digital-logic", canonicalSubjectSlugs: ["digital-logic"], label: "Digital Logic" },
  { id: "cse-coa", slug: "coa", canonicalSubjectSlugs: ["coa"], label: "Computer Organization & Architecture" },
  { id: "cse-pds", slug: "prog-ds", canonicalSubjectSlugs: ["prog-ds", "prog-c"], label: "Programming & Data Structures" },
  { id: "cse-algo", slug: "algorithms", canonicalSubjectSlugs: ["algorithms"], label: "Algorithms" },
  { id: "cse-toc", slug: "toc", canonicalSubjectSlugs: ["toc"], label: "Theory of Computation" },
  { id: "cse-cd", slug: "compiler", canonicalSubjectSlugs: ["compiler"], label: "Compiler Design" },
  { id: "cse-os", slug: "os", canonicalSubjectSlugs: ["os"], label: "Operating Systems" },
  { id: "cse-dbms", slug: "dbms", canonicalSubjectSlugs: ["dbms"], label: "Databases (DBMS)" },
  { id: "cse-cn", slug: "cn", canonicalSubjectSlugs: ["cn"], label: "Computer Networks" },
  { id: "cse-ga", slug: "ga", canonicalSubjectSlugs: ["ga", "apt-verbal", "apt-quant", "apt-analytical", "apt-spatial"], label: "General Aptitude" },
];

console.log("=== CSE SUBJECT MATCHING RESULTS ===");
let totalMatched = 0;
for (const sub of CSE_SUBJECTS) {
  let count = 0;
  for (const q of questions) {
    if (isQuestionInTrack(q, "cse") && isQuestionInSubject(q, sub)) {
      count++;
    }
  }
  totalMatched += count;
  console.log(`${sub.label} (${sub.slug}): ${count} PYQs`);
}
console.log(`\nTotal matched CSE questions: ${totalMatched} / ${questions.length}`);
