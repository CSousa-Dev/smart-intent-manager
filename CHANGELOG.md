# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Node.js, TypeScript, and Express.js
- Base template structure from node-ts-base
- Express.js server configuration
- System of logging with Pino
- Security middlewares (Helmet, CORS)
- Centralized error handling middleware
- Request logging middleware
- 404 Not Found handler
- Health check endpoint (`GET /health`)
- Environment configuration management
- TypeScript strict mode configuration
- ESLint and Prettier configuration
- Jest testing framework configuration
- Shared utilities:
  - AppError class with factory methods
  - ApiResponse types and helpers
  - Logger interface and Pino implementation
- Modular architecture structure ready for module development
- Graceful shutdown handling

### Technical Details
- Architecture: Modular Express.js application
- Logging: Pino with file-based logging
- Security: Helmet + CORS
- Testing: Jest with ts-jest
- Code Quality: ESLint + Prettier
- Type Safety: TypeScript with strict mode
- Default Port: 3001

