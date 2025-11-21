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
cd /app/apps/web
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

## Quick Start

1. **Install dependencies:**
   ```bash
   cd /app/apps/web
   npm install
   ```

2. **Configure environment:**
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:3001
   VITE_WS_URL=ws://localhost:3001/ws
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:5173
   ```

## Usage

### Canvas Mode
1. Click "Start Building" from home page
2. Drag components from the left panel
3. Drop on canvas to build your UI
4. Select nodes to edit props in right panel
5. Delete nodes with the X button

### Code Mode
1. Click "Code" in top toolbar
2. Browse files in left tree
3. Click to open in tabs
4. Edit code with syntax highlighting
5. Changes are reflected immediately

### Preview Mode
1. Click "Preview" in top toolbar
2. Select device mode (Desktop, Laptop, Tablet, Mobile)
3. See live preview of your app
4. Console logs appear at bottom
5. Click refresh to reload

### Logs Mode
1. Click "Logs" in top toolbar
2. View build logs in real-time
3. Filter by level (Info, Warn, Error, Success)
4. Search with text query
5. Export logs to file

## Architecture

```
/apps/web/
├── src/
│   ├── components/              # React components
│   │   ├── Canvas/             # Drag & drop canvas
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasNode.tsx
│   │   │   └── DropZone.tsx
│   │   ├── ComponentLibrary/   # Component palette
│   │   │   ├── ComponentLibrary.tsx
│   │   │   └── ComponentItem.tsx
│   │   ├── PropsPanel/         # Props editor
│   │   │   ├── PropsPanel.tsx
│   │   │   └── PropEditor.tsx
│   │   ├── CodeViewer/         # Code editor
│   │   │   ├── CodeViewer.tsx
│   │   │   ├── CodeTabs.tsx
│   │   │   └── FileTree.tsx
│   │   ├── Preview/            # Preview iframe
│   │   │   ├── Preview.tsx
│   │   │   └── PreviewToolbar.tsx
│   │   ├── Logs/              # Logs panel
│   │   │   └── LogsPanel.tsx
│   │   └── Diff/              # Visual diff
│   │       └── DiffViewer.tsx
│   ├── stores/                # Zustand stores
│   │   ├── projectStore.ts    # Project and files
│   │   ├── canvasStore.ts     # Canvas nodes
│   │   ├── logsStore.ts       # Logs
│   │   └── editorStore.ts     # Editor tabs
│   ├── services/              # API clients
│   │   ├── apiClient.ts       # REST API
│   │   └── websocket.ts       # WebSocket client
│   ├── lib/                   # Utilities
│   │   └── componentLibrary.ts # Component definitions
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── pages/                 # Route pages
│   │   ├── HomePage.tsx
│   │   └── EditorPage.tsx
│   ├── styles/                # Global styles
│   │   └── index.css
│   ├── App.tsx                # Main app
│   └── main.tsx               # Entry point
├── public/                    # Static assets
├── .env                       # Environment variables
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind config
└── package.json              # Dependencies
```

## Tech Stack

### Core
- **React 18.3** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite 5.4** - Build tool & dev server
- **React Router 6.26** - Client-side routing

### State Management
- **Zustand 4.5** - Lightweight state management (4 stores)

### Drag & Drop
- **react-dnd 16.0** - Drag and drop framework
- **react-dnd-html5-backend** - HTML5 drag backend

### Code Editor
- **CodeMirror 6** - Modern code editor
- **@codemirror/lang-javascript** - JavaScript/TypeScript support
- **@codemirror/lang-css** - CSS support
- **@codemirror/lang-html** - HTML support
- **@codemirror/lang-json** - JSON support
- **@codemirror/theme-one-dark** - Dark theme

### UI & Layout
- **Tailwind CSS 3.4** - Utility-first CSS
- **Allotment 1.20** - Resizable split panels
- **@radix-ui/react-icons** - Icon library
- **classnames** - Conditional CSS classes
- **sonner** - Toast notifications

### Utilities
- **diff 5.2** - Text diff algorithm for visual diff

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
