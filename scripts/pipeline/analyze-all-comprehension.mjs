import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('public/data/aptitude/english/comprehension.json', 'utf8'));

const clean = (s) => (s || '')
  .replace(/<ol[\s\S]*$/i, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

// Group adjacent questions that share the same passage or paper
const sets = [];
let currentSet = {
  paper: data[0]._source?.paperTitle || 'Unknown',
  passagePrefix: clean(data[0].questionHtml).slice(0, 100),
  questions: []
};

data.forEach((q, i) => {
  const stem = clean(q.questionHtml);
  const prefix = stem.slice(0, 100);
  const paper = q._source?.paperTitle || 'Unknown';
  
  // If prefix matches or paper matches and stem shares substantial start
  if (prefix === currentSet.passagePrefix || (prefix.startsWith('Comprehension') && stem.includes(currentSet.passagePrefix.slice(15, 60)))) {
    currentSet.questions.push({ index: i, ...q });
  } else {
    sets.push(currentSet);
    currentSet = {
      paper,
      passagePrefix: prefix,
      questions: [{ index: i, ...q }]
    };
  }
});
sets.push(currentSet);

console.log(`Grouped into ${sets.length} sets.`);
sets.forEach((s, idx) => {
  const qNums = s.questions.map(q => `${q.index}(${q.uid})`).join(', ');
  console.log(`Set ${idx + 1} [${s.questions.length} Qs]: ${s.passagePrefix.slice(0, 60)}...`);
  console.log(`   Questions: ${qNums}`);
});
