const { processBase64Images } = require('./src/utils/base64Helper');
const path = require('path');
const fs = require('fs');

async function runTest() {
    console.log('Testing Base64 image processing...');
    const base64Str = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 pixel PNG
    const baseUrl = 'http://localhost:5000';
    
    try {
        const url = await processBase64Images(base64Str, baseUrl);
        console.log('Generated URL:', url);
        
        const filename = url.split('/').pop();
        const filepath = path.join(__dirname, 'uploads', filename);
        
        if (fs.existsSync(filepath)) {
            console.log('File successfully created at:', filepath);
            console.log('Test passed.');
        } else {
            console.error('File not found at:', filepath);
        }
    } catch (e) {
        console.error('Test failed with error:', e);
    }
}

runTest();
