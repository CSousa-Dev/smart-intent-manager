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

### Intent Manager Module (V1)

#### Domain Layer
- Intent entity with create/reconstitute/update methods
- ClientId value object with validation
- IntentStatus enum (ACTIVE, INACTIVE, SUGGESTED)
- IIntentRepository interface

#### Application Layer
- DTOs: CreateIntentDTO, UpdateIntentDTO, IntentResponseDTO, ListIntentsResponseDTO
- Use Cases:
  - CreateIntentUseCase (with validation and uniqueness check)
  - GetIntentUseCase
  - UpdateIntentUseCase (with label uniqueness validation)
  - DeleteIntentUseCase
  - ListIntentsByClientUseCase
  - ListAllIntentsUseCase

#### Infrastructure Layer
- SQLite database connection with better-sqlite3
- Database migrations system
- SQLiteIntentRepository implementation
- Unique constraint on (clientId, label) combination

#### Presentation Layer
- IntentController with manual TypeScript validation
- REST API routes:
  - POST /api/intent - Create intent
  - GET /api/intent/:id - Get intent by ID
  - PUT /api/intent/:id - Update intent
  - DELETE /api/intent/:id - Delete intent
  - GET /api/intent?clientId=X - List intents by client
  - GET /api/intent/all - List all intents
- Module registration system

#### Testing
- Unit tests for value objects (ClientId, IntentStatus)
- Unit tests for Intent entity
- Unit tests for all use cases (75 tests total)
- Integration tests for API endpoints
- Test coverage configuration

#### Business Rules Implemented
- clientId is required
- label must be unique per clientId
- Status validation: ACTIVE, INACTIVE, SUGGESTED
- Only ACTIVE or SUGGESTED allowed on creation
- SUGGESTED can be promoted to ACTIVE via update
- Physical delete (removes from database)
- Automatic createdAt and updatedAt timestamps

### Dependencies Added
- better-sqlite3: SQLite database
- uuid: UUID generation for intent IDs
- @types/better-sqlite3: TypeScript types
- @types/uuid: TypeScript types

### Technical Details
- Architecture: Clean Architecture (Domain, Application, Infrastructure, Presentation)
- Database: SQLite with migrations
- Logging: Pino with file-based logging
- Security: Helmet + CORS
- Testing: Jest with ts-jest (75 tests passing)
- Code Quality: ESLint + Prettier
- Type Safety: TypeScript with strict mode
- Validation: Manual TypeScript validation (no Zod)
- Default Port: 3001

