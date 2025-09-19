# Gemini Code Assistant Project Overview

This document provides a comprehensive overview of the Node.js project, designed
to assist the Gemini Code Assistant in understanding the project's structure,
technologies, and conventions.

## Core Technologies

- **Runtime:** Node.js with Bun
- **Framework:** Express.js
- **Database:** MySQL with Prisma
- **Cache:** Redis with Docker
- **Language:** TypeScript
- **Linting:** ESLint
- **Formatting:** Prettier
- **CI/CD:** GitHub Actions

## Project Structure

The project follows a feature-based structure, with each feature having its own
controller, service, repository, routes, and schema.

```
src/
├── controllers/
├── dtos/
├── middleware/
├── repository/
├── routes/
├── schemas/
├── services/
├── types/
└── utils/
```

- **`controllers`**: Handles incoming requests, validates data, and calls the
  appropriate services.
- **`dtos`**: Data Transfer Objects, used for defining the shape of data
  transferred between different layers of the application.
- **`middleware`**: Express middleware for handling cross-cutting concerns like
  CORS, error handling, authentication, and request validation.
- **`repository`**: Interacts with the database, providing an abstraction layer
  for data access.
- **`routes`**: Defines the API endpoints and maps them to the corresponding
  controllers.
- **`schemas`**: Zod schemas for validating request bodies and other data.
- **`services`**: Contains the business logic of the application.
- **`types`**: TypeScript type definitions, including extensions for Express.
- **`utils`**: Utility functions for tasks like encryption and JWT handling.

## Getting Started

1. **Install dependencies:** `bun install`
2. **Run in development mode:** `bun run dev`
3. **Run tests:** `bun run test`
4. **Build for production:** `bun run build`
5. **Run database migrations:** `bun run prisma:migrate:dev`
6. **Generate Prisma Client:** `bun run prisma:generate`

## Scripts

- **`build`**: Compiles the TypeScript code to JavaScript.
- **`dev`**: Starts the application in development mode with hot-reloading.
- **`format`**: Formats the code using Prettier.
- **`lint`**: Lints the code using ESLint.
- **`prepare`**: Sets up Husky for pre-commit hooks.
- **`start`**: Builds and starts the application.
- **`test`**: Runs the test suite.
- **`prisma:migrate:dev`**: Applies database migrations during development.
- **`prisma:generate`**: Generates the Prisma Client based on the schema.

## Testing

The project uses Jest for unit and integration testing.

- **Unit tests:** Located in `test/unit`, these tests focus on individual
  functions and modules.
- **Integration tests:** Located in `test/integration`, these tests cover the
  interaction between different parts of the application.

To run the tests, use the command `bun run test`.

## Linting and Formatting

The project uses ESLint for linting and Prettier for formatting.

- **`bun run lint`**: Lints the code.
- **`bun run format`**: Formats the code.

## CI/CD

The project uses GitHub Actions for continuous integration and deployment. The
workflow is defined in `.github/workflows/deploy-production.yml`.

## Future Improvements

- **Password Reset:** Implement a secure password reset mechanism, likely
  involving email verification.
- **Email Verification:** Add a process to verify user email addresses upon
  registration.
- **Role-Based Access Control (RBAC):** Introduce a role system to differentiate
  permissions between user types (e.g., admin, user).
- **Logging:** Integrate a more robust logging solution for better monitoring,
  auditing, and error tracking.
