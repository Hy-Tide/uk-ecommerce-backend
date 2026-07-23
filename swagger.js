const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "API Documentation",
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' ? process.env.API_URL_PROD : (process.env.API_URL_DEV || "http://localhost:5000"),
            },
        ],
    },
    apis: ["./src/routes/*.js"], // Change this according to your project
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;