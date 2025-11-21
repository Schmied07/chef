# Chef Web App - Frontend MVP ✅

## Sprint 3 - COMPLETE

This is the frontend application for Chef, built with React + Vite + TypeScript.

## Features (All Implemented!)

### ✅ 3.1 - Migration & Infrastructure
- [x] Vite + React setup
- [x] TypeScript configuration
- [x] Tailwind CSS
- [x] Path aliases
- [x] Development server
- [x] Zustand state management

### ✅ 3.2 - Canvas Drag & Drop
- [x] Component composer canvas
- [x] Drag & drop with react-dnd
- [x] Component instances with nesting
- [x] Tree serialization
- [x] Visual feedback (hover, selected)
- [x] Node deletion

### ✅ 3.3 - Preview Sandboxé
- [x] Iframe preview with sandbox
- [x] Hot reload on file changes
- [x] Responsive preview modes (Mobile, Tablet, Laptop, Desktop)
- [x] Console capture via postMessage
- [x] Preview toolbar with device modes

### ✅ 3.4 - Component Library
- [x] Pre-built components (10+)
- [x] Props editor with type validation
- [x] Component metadata
- [x] Search and filtering
- [x] Categories (Layout, UI, Form)

### ✅ 3.5 - Code Viewer
- [x] CodeMirror integration
- [x] Syntax highlighting (JS, CSS, HTML, JSON)
- [x] File tree navigation
- [x] Multiple tabs
- [x] Dark theme (One Dark)
- [x] Modified indicators

### ✅ 3.6 - Logs Panel
- [x] Real-time log display
- [x] Log filtering by level
- [x] Search functionality
- [x] Export logs to file
- [x] Auto-scroll toggle

### ✅ 3.7 - Visual Diff
- [x] Side-by-side comparison
- [x] Inline diff view
- [x] Change highlighting
- [x] Accept/Reject changes
- [x] Line-by-line comparison

### ✅ 3.8 - Props Panel
- [x] Visual props editing
- [x] Type validation (string, number, boolean, select, color, array)
- [x] Real-time preview updates
- [x] Reset to default
- [x] Required field indicators

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
