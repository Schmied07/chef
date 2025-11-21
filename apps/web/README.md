# Chef Web App

## Sprint 3 - Frontend MVP

This is the new frontend application for Chef, built with React + Vite.

## Features (Sprint 3)

### ✅ 3.0 - Migration & Infrastructure
- [x] Vite + React setup
- [x] TypeScript configuration
- [x] Tailwind CSS
- [x] Path aliases
- [x] Development server

### 🚧 3.1 - Preview & Logs Panel (In Progress)
- [ ] Iframe preview with hot reload
- [ ] Responsive preview modes
- [ ] Console capture
- [ ] Logs panel with WebSocket
- [ ] Log filtering and search

### 📋 3.2 - Canvas Drag & Drop (Planned)
- [ ] Component composer canvas
- [ ] Drag & drop with react-dnd
- [ ] Component instances
- [ ] Tree serialization

### 📋 3.3 - Component Library (Planned)
- [ ] Pre-built components
- [ ] Props editor
- [ ] Component metadata

### 📋 3.4 - Code Viewer & Diff (Planned)
- [ ] Enhanced code viewer
- [ ] Search & replace
- [ ] Multiple tabs
- [ ] Visual diff

### 📋 3.5 - Backend Integration (Planned)
- [ ] API client
- [ ] Project submission
- [ ] Real-time build status

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter @chef/web dev

# Build for production
pnpm --filter @chef/web build

# Type check
pnpm --filter @chef/web typecheck
```

## Architecture

```
/apps/web/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── Canvas/      # Drag & drop canvas
│   │   ├── Preview/     # Preview iframe
│   │   ├── Logs/        # Logs panel
│   │   ├── CodeViewer/  # Code editor
│   │   └── Library/     # Component library
│   ├── services/        # API clients, WebSocket
│   ├── stores/          # State management (Zustand)
│   ├── lib/            # Utilities
│   ├── styles/         # Global styles
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies
```

## Backend Integration

The app connects to the backend services:

- **API**: `http://localhost:3001` - REST API for projects
- **WebSocket**: `ws://localhost:3001/ws` - Real-time logs and progress

See `src/services/apiClient.ts` for API contracts.

## Feature Flags

Enable experimental features:

```bash
REACT_APP_SPRINT3_CANVAS=true pnpm dev
```
