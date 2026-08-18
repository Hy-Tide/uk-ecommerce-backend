require('dotenv').config();
const app = require('./src/app');
const listEndpoints = require('express-list-endpoints');
const { websiteSwaggerSpec, adminSwaggerSpec } = require('./src/config/swagger');

const endpoints = listEndpoints(app);
const websitePaths = websiteSwaggerSpec.paths || {};
const adminPaths = adminSwaggerSpec.paths || {};

console.log("Express Endpoints (Sample):", endpoints.slice(0, 5).map(e => e.path));
console.log("Website Swagger Paths (Sample):", Object.keys(websitePaths).slice(0, 5));
console.log("Admin Swagger Paths (Sample):", Object.keys(adminPaths).slice(0, 5));
