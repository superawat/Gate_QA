const fs = require('fs');

const raw1987 = JSON.parse(fs.readFileSync('public/data/practicepaper-1987.json', 'utf8'));

const targets = ['go:82656', 'go:80278', 'go:80281', 'go:166'];

const matching = raw1987.filter(q => targets.includes(q.goUid));

console.log(`Found ${matching.length} matching questions from raw 1987:`);
matching.forEach(q => {
  console.log(JSON.stringify(q, null, 2));
});
