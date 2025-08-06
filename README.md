# Orgchart ReactFlow

An interactive organizational chart built with React, TypeScript, and ReactFlow.

## Development

```bash
npm install
npm run dev
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Setup Instructions

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Push changes to the main branch to trigger deployment

The site will be available at: https://ygrenzinger.github.io/orgchart-reactflow/

### Manual Deployment

To deploy manually:

```bash
npm run build
# The dist/ folder contains the built site
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter