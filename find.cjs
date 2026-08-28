const fs = require('fs');
const c = fs.readFileSync('api/index.ts', 'utf8');
const lines = c.split('\n');
let found = 0;
lines.forEach((l, i) => {
  if (l.includes('\\`') || l.includes('\\$')) {
    console.log(i + 1, l);
    found++;
  }
});
if (found === 0) console.log("NO ESCAPES FOUND");
