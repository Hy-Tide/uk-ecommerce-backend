const fs = require('fs');
const path = require('path');

function checkSwaggerDocs(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkSwaggerDocs(fullPath);
        } else if (fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const swaggerCount = (content.match(/@swagger/g) || []).length;
            if (swaggerCount === 0) {
                console.log(`[NO SWAGGER] ${fullPath}`);
            }
        }
    }
}

checkSwaggerDocs(path.join(__dirname, 'src/routes'));
