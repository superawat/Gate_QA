const https = require('https');

https.get('https://practicepaper.in/gate-cse-1987/15', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const m = data.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|png|gif)/gi);
    console.log('Images:', m);
  });
});
