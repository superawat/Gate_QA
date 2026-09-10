const fs = require('fs');
const https = require('https');
const path = require('path');

const dest = path.join(__dirname, '../public/question-images/82656.jpg');

const file = fs.createWriteStream(dest);
https.get('https://practicepaper.in/wp-content/uploads/GATE/CS/19871/q15a.jpg', res => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Saved 82656.jpg, size:', fs.statSync(dest).size);
  });
}).on('error', err => {
  console.error('Error downloading:', err);
});
