const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/Studyos/src');
files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
        if(line.includes('<button')) {
            if(!line.includes('onClick') && !line.includes('type="submit"')) {
                // look ahead in next few lines in case it's multi-line
                let fullStr = line;
                let j = i + 1;
                while(j < lines.length && !fullStr.includes('>')) {
                    fullStr += lines[j];
                    j++;
                }
                if(!fullStr.includes('onClick') && !fullStr.includes('type="submit"')) {
                    console.log(`\nFound in ${file}:${i+1}`);
                    console.log(fullStr.trim());
                }
            }
        }
    });
});
