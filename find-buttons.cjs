const fs = require('fs');
const path = require('path');

function findButtons(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findButtons(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let insideButton = false;
            let currentButton = '';
            let currentLine = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('<button')) {
                    insideButton = true;
                    currentButton = line;
                    currentLine = i + 1;
                } else if (insideButton) {
                    currentButton += ' ' + line;
                }

                if (insideButton && line.includes('>')) {
                    insideButton = false;
                    if (!currentButton.includes('onClick') && !currentButton.includes('type=\"submit\"')) {
                        console.log(`\nFile: ${fullPath}:${currentLine}`);
                        console.log(currentButton.trim());
                    }
                }
            }
        }
    }
}
findButtons('src');
