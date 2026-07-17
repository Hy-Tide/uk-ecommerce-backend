# E-commerce Backend

This is the foundational backend architecture for a production-grade e-commerce application.

## Tech Stack
- Node.js
- Express.js
- MongoDB & Mongoose

## Project Structure
- `src/config/`: Configuration files (DB, JWT, Mail, Upload, Logger)
- `src/controllers/`: Route controllers (to be implemented)
- `src/routes/`: API routes (to be implemented)
- `src/models/`: Mongoose schemas (to be implemented)
- `src/middleware/`: Custom middleware (Error handling, Logging, etc.)
- `src/utils/`: Utility classes (ApiError, ApiResponse, asyncHandler)
- `src/services/`: Business logic layer (to be implemented)
- `src/repositories/`: Database interaction layer (to be implemented)
- `src/validators/`: Request validation schemas (to be implemented)

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and configure the environment variables.
4. Run `npm run dev` to start the development server.

## Architecture
This project follows clean code principles, SOLID principles, and implements the MVC + Service + Repository patterns to ensure high scalability and maintainability.
