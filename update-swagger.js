const fs = require('fs');
const path = require('path');

function processFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processFiles(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('multipart/form-data')) {
                // Because some controllers might still theoretically allow multipart if upload middleware is still there,
                // but since we want the Swagger to reflect the Base64 JSON interface, we replace it.
                content = content.replace(/multipart\/form-data:/g, 'application/json:');
                
                // Replace format: binary
                content = content.replace(/\*\s+format:\s+binary/g, '*                 description: Base64 encoded string');
                
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    }
}

processFiles(path.join(__dirname, 'src/routes/website'));
console.log('Done website routes.');
