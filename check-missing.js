require('dotenv').config();
const fs = require('fs');
const app = require('./src/app');
const listEndpoints = require('express-list-endpoints');
const adminSpec = require('./swagger-admin.json');
const websiteSpec = require('./swagger-website.json');

const endpoints = listEndpoints(app);
const adminPaths = adminSpec.paths || {};
const websitePaths = websiteSpec.paths || {};

let totalMissing = 0;

endpoints.forEach(endpoint => {
    // Only care about API routes
    if (!endpoint.path.startsWith('/api/v1/')) return;
    
    const methods = endpoint.methods.filter(m => m !== 'HEAD');
    
    // The swagger files have paths without /api/v1
    const pathWithoutPrefix = endpoint.path.replace('/api/v1', '');
    
    // express gives /admin/users/:id, swagger has /admin/users/{id}
    const swaggerFormatPath = pathWithoutPrefix.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    
    methods.forEach(method => {
        const m = method.toLowerCase();
        const hasAdmin = adminPaths[swaggerFormatPath] && adminPaths[swaggerFormatPath][m];
        const hasWebsite = websitePaths[swaggerFormatPath] && websitePaths[swaggerFormatPath][m];
        
        if (!hasAdmin && !hasWebsite) {
            const regexPath = swaggerFormatPath.replace(/\{[^}]+\}/g, '\\{[^}]+\\}');
            const adminMatch = Object.keys(adminPaths).find(p => new RegExp('^' + regexPath + '$').test(p) && adminPaths[p][m]);
            const websiteMatch = Object.keys(websitePaths).find(p => new RegExp('^' + regexPath + '$').test(p) && websitePaths[p][m]);
            if (!adminMatch && !websiteMatch) {
                console.log(`Missing Swagger: [${m.toUpperCase()}] ${endpoint.path}`);
                totalMissing++;
            }
        }
    });
});

console.log('Total Missing:', totalMissing);
