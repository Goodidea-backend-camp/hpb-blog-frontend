# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt.js 4 frontend application for the HPB Blog project. It's configured with TypeScript, Tailwind CSS 4, ESLint, Prettier, Vitest for testing, and Husky for git hooks.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality

- `make lint` - Run ESLint and TypeScript type checking
- `make format` - Fix ESLint issues and format code with Prettier

### Testing

- `make test` - Run Vitest tests
- Test files are located in `test/unit/`, `test/e2e/`, and `test/nuxt/` directories

## Architecture

### Project Structure

- **`app/`** - Main application code using Nuxt's app directory structure
- **`app/app.vue`** - Root application component
- **`app/assets/css/main.css`** - Main CSS file importing Tailwind
- **`composables/`** - Vue composables
- **`utils/`** - Utility functions
- **`public/`** - Static assets

### Backend Integration

- API routes are proxied to backend via `/api/**` routes
- Backend proxy configured in `nuxt.config.ts` to `http://backend:${backendPort}/**`
- Backend port defaults to 8080 but can be configured via `BACKEND_PORT` environment variable

### Styling

- Uses Tailwind CSS 4 with the new Vite plugin architecture
- Main CSS imports configured in `nuxt.config.ts`

### Code Quality Setup

- ESLint with Nuxt module for linting
- Prettier with Tailwind plugin for formatting
- Husky pre-commit hooks with lint-staged for automatic code quality checks
- TypeScript support with strict type checking

### Testing Setup

- Vitest for unit testing
- @nuxt/test-utils for Nuxt-specific testing utilities
- Basic test structure established in `test/` directories

## Development Workflow

After writing code, always run these commands in order and fix any issues:

1. `make format` - Format code and fix auto-fixable linting issues
2. `make lint` - Check for linting and type errors
3. `make test` - Run tests

All steps must pass before committing code.

## Development Notes

### Current State

The application currently displays a test page that fetches data from the backend API to verify the connection. This test code should be removed during actual development.

### Configuration Files

- `nuxt.config.ts` - Main Nuxt configuration
- `eslint.config.mjs` - ESLint configuration
- `vitest.config.ts` - Vitest test configuration
