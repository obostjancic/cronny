# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cronny is a web scraping and job scheduling platform for Austrian real estate websites. It's a TypeScript monorepo with a React frontend and Hono backend, using SQLite for data storage and Playwright for web scraping.

## Development Commands

### Core Development
- `yarn dev` - Run both client and server in development mode (client on :5173, server on :3000)
- `yarn debug` - Run client + server with Node.js debugger attached
- `yarn build` - Build both packages for production
- `yarn start:prod` - Run database migrations + start production server

### Server-Specific (`packages/server/`)
- `yarn dev` - Development server with hot reload (tsx + watch)
- `yarn migrate` - Run Drizzle database migrations
- `yarn studio` - Launch Drizzle Studio (database GUI)
- `yarn test` - Run Vitest tests

### Client-Specific (`packages/client/`)
- `yarn dev` - Vite development server (http://localhost:5173)
- `yarn build` - TypeScript compilation + Vite production build
- `yarn preview` - Serve production build locally
- `yarn lint` - Run ESLint to check code quality

## Architecture Overview

### Monorepo Structure
```
packages/
├── client/     # React frontend with Mantine UI
├── server/     # Hono backend with SQLite
└── types/      # Shared TypeScript interfaces
```

### Key Patterns

**Strategy Pattern for Web Scraping**: Each website (derstandard.at, willhaben.at, immoscout24.at) has its own strategy implementation in `/packages/server/src/strategies/`. All strategies implement a standardized `Runner` interface.

**Job Scheduling System**: Jobs stored in SQLite with cron expressions, executed via node-cron with dynamic strategy loading based on job configuration.

**Database Schema**: Core entities are Jobs, Runs, Results, Clients, and ClientJobs. Uses Drizzle ORM with SQLite.

### Technology Stack

**Frontend**: React 18 + TypeScript + Vite + Mantine + TanStack Router + TanStack Query
**Backend**: Node.js 22 + Hono + Drizzle ORM + SQLite + Playwright + node-cron
**Testing**: Vitest (server) with HTML/JS fixtures for strategy testing

## Key Files and Entry Points

### Server Core
- `packages/server/src/index.ts` - Main Hono app with route setup
- `packages/server/src/schedule.ts` - Job scheduling logic
- `packages/server/src/cron.ts` - Cron job execution
- `packages/server/src/run.ts` - Job execution coordination
- `packages/server/src/db/schema.ts` - Database schema definition

### Client Core
- `packages/client/src/main.tsx` - React root
- `packages/client/src/App.tsx` - Main app with auth, routing, theme
- `packages/client/src/routes/` - File-based routing structure
- `packages/client/src/api/` - React Query hooks for server communication
- `packages/client/src/api/client.ts` - HTTP client with environment-based API URL handling

### Strategy Development
When adding new scrapers, create files in `packages/server/src/strategies/` implementing the `Runner` interface. Include corresponding test files in `tests/strategies/` with fixtures in `tests/fixtures/`.

## Database Operations

Use `yarn migrate` to run schema changes. The database file is created at `packages/server/.data/db.sqlite` in development. Access Drizzle Studio with `yarn studio` for visual database inspection.

## Testing

Server tests are in `/tests/` with strategy-specific tests using HTML/JS fixtures. Run with `yarn test` from server directory. Tests create a separate `.data` directory to avoid conflicts with development database.

## Authentication

The platform uses API key-based authentication for external clients and password-based auth for the web interface. Client access is managed through the ClientJobs relationship table.

## Notifications

Supports Slack, WhatsApp, and file-based notifications. Configuration is handled through job parameters and environment variables.

## Development Setup

### Environment Variables
In development, the client uses `VITE_API_URL=http://localhost:3000` to connect directly to the server. Copy `packages/client/.env.example` to `packages/client/.env.development` if needed.

### API Communication
The client uses a centralized HTTP client (`packages/client/src/api/client.ts`) that:
- In development: Makes direct requests to server at `http://localhost:3000`
- In production: Uses relative URLs (served from same origin)
- Handles authentication tokens automatically
- Provides axios-based methods (get, post, put, delete)

## Node.js Version

Project uses Node.js 22.14.0 (managed via Volta). The codebase uses ES modules throughout.

## Important Notes

**Package Manager**: This project uses Yarn, not npm. Always use `yarn` commands instead of `npm` commands.