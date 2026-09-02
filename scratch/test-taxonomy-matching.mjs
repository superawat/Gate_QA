import fs from 'fs';

const questions = JSON.parse(fs.readFileSync('./public/question-search-index.json', 'utf8'));
let aptitude = JSON.parse(fs.readFileSync('./public/aptitude-search-index.json', 'utf8'));
if (aptitude && aptitude.questions) aptitude = aptitude.questions;
if (!Array.isArray(aptitude)) aptitude = [];

console.log(`Loaded ${questions.length} questions and ${aptitude.length} Aptitude questions.`);

const slugCounts = {};
for (const q of questions) {
  const slug = q.subjectSlug || 'unknown';
  slugCounts[slug] = (slugCounts[slug] || 0) + 1;
}
console.log('\nSubject slug counts in question-search-index:');
console.log(JSON.stringify(slugCounts, null, 2));

// Let's check DA questions if da-search-index exists
if (fs.existsSync('./public/da-search-index.json')) {
  const da = JSON.parse(fs.readFileSync('./public/da-search-index.json', 'utf8'));
  const daQuestions = Array.isArray(da) ? da : (da.questions || []);
  console.log(`\nLoaded ${daQuestions.length} DA questions.`);
  const daSlugs = {};
  for (const q of daQuestions) {
    const slug = q.subjectSlug || q.subject || 'unknown';
    daSlugs[slug] = (daSlugs[slug] || 0) + 1;
  }
  console.log('DA Subject slug counts:');
  console.log(JSON.stringify(daSlugs, null, 2));
}
