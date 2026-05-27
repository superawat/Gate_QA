const fs = require('fs');
const files = [
  'public/questions-with-answers.json',
  'public/questions-filtered-with-ids.json',
  'public/questions-filtered.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file));
    const q = data.find(x => x.question_uid === 'go:865');
    if (q) {
      if (q.question.includes('<ol')) {
        q.question = q.question.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/i, (match, inner) => {
          return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '<p>- $1</p>');
        });
        console.log('Replaced list in ' + file);
      }
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  }
});
