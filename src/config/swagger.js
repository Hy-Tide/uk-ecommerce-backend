const swaggerJsdoc = require('swagger-jsdoc');

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
