const swaggerJsdoc = require('swagger-jsdoc');
const m2s = require('mongoose-to-swagger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Auto-load all models so mongoose knows about them
const modelsPath = path.join(__dirname, '../models');
fs.readdirSync(modelsPath).forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(modelsPath, file));
  }
});

// Convert all registered models to Swagger schemas
const schemas = {};
for (const modelName in mongoose.models) {
  schemas[modelName] = m2s(mongoose.models[modelName]);
}

const baseDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' ? `${process.env.API_URL_PROD}/api/v1` : `${process.env.API_URL_DEV || 'http://localhost:5000'}/api/v1`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      FormatParam: {
        in: 'query',
        name: 'format',
        schema: { type: 'string', enum: ['json', 'csv', 'excel', 'pdf'], default: 'json' },
        description: 'Export format'
      },
      StartDateParam: {
        in: 'query',
        name: 'startDate',
        schema: { type: 'string', format: 'date' },
        description: 'Filter from this date (YYYY-MM-DD)'
      },
      EndDateParam: {
        in: 'query',
        name: 'endDate',
        schema: { type: 'string', format: 'date' },
        description: 'Filter up to this date (YYYY-MM-DD)'
      }
    },
    schemas: schemas
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const websiteOptions = {
  definition: {
    ...baseDefinition,
    info: {
      ...baseDefinition.info,
      title: 'E-Commerce Website API',
      description: 'API documentation for the E-Commerce Website',
    },
  },
  apis: ['./src/routes/website/*.js'],
};

const adminOptions = {
  definition: {
    ...baseDefinition,
    info: {
      ...baseDefinition.info,
      title: 'E-Commerce Admin API',
      description: 'API documentation for the E-Commerce Admin Panel',
    },
  },
  apis: ['./src/routes/admin/*.js'],
};

module.exports = {
  websiteSwaggerSpec: swaggerJsdoc(websiteOptions),
  adminSwaggerSpec: swaggerJsdoc(adminOptions),
};
