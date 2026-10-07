const fs = require('fs');
const path = require('path');
function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walk(p, fileList);
        } else if (p.endsWith('.tsx') || p.endsWith('.jsx')) {
            fileList.push(p);
        }
    }
    return fileList;
}
const files = walk('src');
for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const matches = code.match(/<button[\s\S]*?>/g);
    if (matches) {
        for (const match of matches) {
            if (!match.includes('onClick') && !match.includes('type="submit"')) {
                console.log(file, match);
            }
        }
    }
}
