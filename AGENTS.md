# AGENTS.md

## Commands
- `npm run dev` - Start development server
- `npm run build` - Type check and build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test -- App.test.tsx` - Run single test file
- `npm run test -- --run` - Run tests once without watch

## Code Style
- **Imports**: Use ES modules, no React imports needed (new JSX transform)
- **Components**: Functional components with TypeScript interfaces
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Types**: Define interfaces for props, use strict TypeScript
- **CSS**: Component-scoped CSS files imported directly
- **Exports**: Default exports for components
- **Event Handlers**: Prefix with `handle` (e.g., `handleExpandClick`)
- **Props Destructuring**: Extract props in function parameters
- **Accessibility**: Include aria-labels for interactive elements

## Architecture
- React 18 + TypeScript + Vite + ReactFlow
- Strict mode enabled, no unused variables/parameters allowed
- Tests use Vitest + React Testing Library with jsdom