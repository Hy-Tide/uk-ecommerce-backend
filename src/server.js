require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

// Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
    logger.error(`UNCAUGHT EXCEPTION! Shutting down... \n${err.name}: ${err.message}`);
    process.exit(1);
});

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
            console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
            console.log("MONGODB_URI:", process.env.MONGODB_URI?.slice(0, 30));
        });

        // Handling Unhandled Rejections
        process.on('unhandledRejection', (err) => {
            logger.error(`UNHANDLED REJECTION! Shutting down... \n${err.name}: ${err.message}`);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
