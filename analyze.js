const fs = require('fs');
const path = require('path');

function analyzeSwagger(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            analyzeSwagger(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let currentMethod = null;
            let currentPath = null;
            let hasRequestBody = false;
            let hasResponses = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.match(/\* \/.*:/)) {
                    currentPath = line.trim();
                } else if (line.match(/\*   post:/) || line.match(/\*   put:/) || line.match(/\*   patch:/)) {
                    currentMethod = line.trim();
                    hasRequestBody = false;
                    hasResponses = false;
                } else if (currentMethod) {
                    if (line.includes('requestBody:')) {
                        hasRequestBody = true;
                    }
                    if (line.includes('responses:')) {
                        hasResponses = true;
                        if (!hasRequestBody && currentMethod !== '*   get:' && currentMethod !== '*   delete:') {
                            console.log(`Missing requestBody in ${file}: ${currentPath} -> ${currentMethod}`);
                        }
                        currentMethod = null;
                    }
                }
            }
        }
    }
}

console.log("Analyzing Admin Routes...");
analyzeSwagger(path.join(__dirname, 'src/routes/admin'));
console.log("Analyzing Website Routes...");
analyzeSwagger(path.join(__dirname, 'src/routes/website'));
