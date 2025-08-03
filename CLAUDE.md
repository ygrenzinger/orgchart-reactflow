# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Type check with `tsc -b` then build for production
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run tests in watch mode with Vitest
- `npm run test:ui` - Run tests with web-based UI interface
- To run a single test file: `npm run test -- App.test.tsx`
- To run tests once: `npm run test -- --run`

### Code Quality
- `npm run lint` - Run ESLint on all files
- Build includes TypeScript type checking as first step

## Project Architecture

This is a React 18 + TypeScript + Vite project set up for developing an organizational chart application (likely using ReactFlow based on directory name).

### Tech Stack
- **Frontend**: React 18.3.1 with TypeScript 5.6.2
- **Build Tool**: Vite 6.0.1 (ES modules, fast HMR)
- **Testing**: Vitest 2.1.8 + React Testing Library + jsdom
- **Linting**: ESLint 9.13.0 with flat config format
- **Styling**: Plain CSS with modern features (CSS variables, media queries)

### Key Configuration Details
- **Module System**: ES modules (`"type": "module"` in package.json)
- **TypeScript**: Strict mode enabled with bundler module resolution
- **JSX**: Uses new JSX transform (`react-jsx`) - no React imports needed
- **Test Environment**: jsdom with globals enabled, setup in `src/setupTests.ts`
- **Asset Handling**: SVG and CSS imports typed in `src/vite-env.d.ts`

### Architecture Patterns
- Functional components with React hooks (no class components)
- Co-located tests (e.g., `App.test.tsx` alongside `App.tsx`)
- Component-scoped CSS files imported directly
- StrictMode wrapper for development warnings
- Modern CSS with light/dark theme support via media queries

### Build Process
The build runs TypeScript compilation first (`tsc -b`) to catch type errors, then Vite bundling. This ensures type safety before creating production assets.

### Testing Setup
Tests use React Testing Library for user-centric testing with DOM assertions via jest-dom matchers. Vitest provides fast test execution with Vite's transformation pipeline.