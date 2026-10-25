// Keep this lightweight route manifest independent of editorialPages.js. App.jsx
// and the global drawer import it eagerly, so importing article copy here would
// pull the full editorial corpus into the initial application bundle.
export const EDITORIAL_PAGE_ROUTES = [
  { path: "/blog/gate-cse-2027-syllabus-changes", keyword: "GATE 2027 Syllabus Changes", readingTime: 7, showInBlog: true },
  { path: "/blog/gate-2027", keyword: "GATE 2027", readingTime: 8, showInBlog: true },
  { path: "/blog/gate-2027-syllabus", keyword: "GATE 2027 CS Syllabus", readingTime: 10, showInBlog: true },
  { path: "/blog/gate-cs-eligibility", keyword: "GATE CS Eligibility Criteria", readingTime: 2, showInBlog: true },
  { path: "/blog/gate-cutoff", keyword: "GATE CS Cutoff", readingTime: 10, showInBlog: true },
  { path: "/blog/gate-exam-pattern", keyword: "GATE CS Exam Pattern", readingTime: 2, showInBlog: true },
  { path: "/blog/gate-cs-weightage", keyword: "GATE CS Weightage", readingTime: 2, showInBlog: true },
  { path: "/gate-cs-pyq", keyword: "GATE CS PYQ", showInBlog: false },
  { path: "/gate-aptitude", keyword: "GATE Aptitude Questions", showInBlog: false },
  { path: "/mock-tests", keyword: "GATE Mock Tests", showInBlog: false },
  { path: "/operating-systems-pyq", keyword: "Operating Systems GATE PYQ", showInBlog: false },
  { path: "/dbms-pyq", keyword: "DBMS GATE PYQ", showInBlog: false },
  { path: "/blog/who-will-conduct-gate-2027", keyword: "Who Will Conduct GATE 2027? IIT Madras Confirmed", readingTime: 3, showInBlog: true },
  { path: "/blog/gate-cs-vs-gate-da", keyword: "GATE CS vs GATE DA", readingTime: 6, showInBlog: true },
  { path: "/blog/gate-cutoff-iit-bombay", keyword: "GATE CS Cutoff IIT Bombay", readingTime: 5, showInBlog: true },
  { path: "/blog/best-books-for-gate-cs", keyword: "Best Books for GATE CS", readingTime: 6, showInBlog: true },
];

export const LEGACY_BLOG_REDIRECTS = [
  { from: "/gate-cse-2027-syllabus-changes", to: "/blog/gate-cse-2027-syllabus-changes" },
  { from: "/gate-2027", to: "/blog/gate-2027" },
  { from: "/gate-2027-syllabus", to: "/blog/gate-2027-syllabus" },
  { from: "/gate-cs-eligibility", to: "/blog/gate-cs-eligibility" },
  { from: "/gate-cutoff", to: "/blog/gate-cutoff" },
  { from: "/gate-exam-pattern", to: "/blog/gate-exam-pattern" },
  { from: "/gate-cs-weightage", to: "/blog/gate-cs-weightage" },
  { from: "/who-will-conduct-gate-2027", to: "/blog/who-will-conduct-gate-2027" },
  { from: "/gate-cs-vs-gate-da", to: "/blog/gate-cs-vs-gate-da" },
  { from: "/gate-cutoff-iit-bombay", to: "/blog/gate-cutoff-iit-bombay" },
  { from: "/best-books-for-gate-cs", to: "/blog/best-books-for-gate-cs" },
];
