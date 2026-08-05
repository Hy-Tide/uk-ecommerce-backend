const fs = require('fs');
const path = require('path');

function toPascalCase(str) {
    if (str === 'auth' || str === 'customer') return 'User';
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.routes.js') && !file.includes('report') && !file.includes('dashboard') && !file.includes('setting')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const modelName = toPascalCase(file.replace('.routes.js', ''));
            
            let updated = false;

            // Regex to find 200 or 201 responses that don't have a content block right after
            const responseRegex = /((?:200|201):\s*\n\s*description:[^\n]+)(\s*)(?!(?:content:|headers:|400|401|403|404|500))/g;
            
            content = content.replace(responseRegex, (match, p1, p2) => {
                if (match.includes('content:')) return match; // skip if content already exists
                updated = true;
                const lines = p1.split('\n');
                const lastLine = lines[lines.length - 1];
                const spacesMatch = lastLine.match(/^(\s*)/);
                const spaces = spacesMatch ? spacesMatch[1] : '        ';
                return `${p1}\n${spaces}content:\n${spaces}  application/json:\n${spaces}    schema:\n${spaces}      $ref: '#/components/schemas/${modelName}'${p2}`;
            });
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated responses in ${file} with model ${modelName}`);
            }
        }
    }
}

console.log("Updating Admin Routes...");
processDirectory(path.join(__dirname, 'src/routes/admin'));
console.log("Updating Website Routes...");
processDirectory(path.join(__dirname, 'src/routes/website'));
