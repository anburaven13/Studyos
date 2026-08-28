const fs = require('fs');
let c = fs.readFileSync('api/index.ts', 'utf8');
let fixed = c.split('\\`').join('`').split('\\$').join('$');
fs.writeFileSync('api/index.ts', fixed);
console.log('Fixed api/index.ts');
