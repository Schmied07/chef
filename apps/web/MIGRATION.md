# Migration from /app to /apps/web

## Sprint 3.0 - Migration Strategy

### Approach

We chose to create `/apps/web` in parallel rather than migrating `/app` directly. This allows:

1. **Safety**: Original app remains intact and functional
2. **Testing**: New structure can be tested independently
3. **Gradual migration**: Components can be moved incrementally
4. **Rollback**: Easy to revert if issues arise

### New Structure

```
/app/
├── apps/
│   └── web/              # New React + Vite app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── lib/
│       │   ├── styles/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/            # Shared packages
│   ├── engine/        # AI engine
│   └── compiler/      # Code compiler
└── services/          # Backend services
    └── backend/       # API + Workers
```

### Key Differences from Original `/app`

1. **Framework**: Vite + React (instead of Remix)
2. **State Management**: Zustand (simpler than Remix loaders)
3. **Routing**: React Router v6 (client-side)
4. **Build Tool**: Vite (faster than Remix)
5. **Structure**: Simpler, more modular

### What Was Kept

- Tailwind CSS configuration
- CSS variables and theming
- Radix UI components
- CodeMirror integration approach
- File tree structure concepts
- Preview iframe concepts

### What Was Simplified

- No SSR complexity (Remix server-side rendering)
- No Convex real-time sync (using WebSocket instead)
- No WebContainer API yet (coming in 3.1)
- Simpler routing without file-based routes
- Direct API calls instead of Remix actions/loaders

### Migration Path

Components from `/app` can be migrated to `/apps/web` as needed:

1. **Phase 1** (3.0): New structure ✅
2. **Phase 2** (3.1): Preview & Logs
3. **Phase 3** (3.2): Canvas & Drag-drop
4. **Phase 4** (3.3+): Advanced features

### Compatibility

Both `/app` (Remix) and `/apps/web` (Vite) can coexist:

- `/app` continues to work for existing features
- `/apps/web` handles new Sprint 3 features
- Backend at `/services/backend` serves both

### Future Consolidation

Once `/apps/web` is feature-complete and tested:

1. Deprecate `/app` gradually
2. Migrate remaining users
3. Archive `/app` directory
4. Update documentation

## Technical Decisions

### Why Vite?

- **Faster**: HMR in <100ms
- **Simpler**: No SSR complexity
- **Modern**: ESM-first, better tree-shaking
- **Better DX**: Instant server start

### Why Zustand?

- **Lightweight**: 1.2kb vs Redux's 8kb
- **Simple API**: Less boilerplate
- **TypeScript**: Built-in support
- **DevTools**: Time-travel debugging

### Why Client-Side Routing?

- **Simpler**: No server coordination
- **Faster**: Instant navigation
- **Better for SPA**: Editor is inherently stateful
- **Easier to test**: No server mocking needed

## Dependencies

### Core

- React 18.3.1
- React Router DOM 6.26.0
- Vite 5.4.17
- TypeScript 5.7.3

### UI

- Tailwind CSS 3.4.17
- Radix UI (various)
- Framer Motion 11.12.0

### Editor

- CodeMirror 6.x
- react-dnd 16.0.1

### State

- Zustand 4.5.0
- Nanostores 0.10.3

### Utilities

- Allotment (panels)
- Sonner (toasts)
- Diff (code diff)

## Scripts

```bash
# Development
pnpm --filter @chef/web dev

# Build
pnpm --filter @chef/web build

# Type check
pnpm --filter @chef/web typecheck

# Lint
pnpm --filter @chef/web lint
```

## Environment Variables

Create `/apps/web/.env` (from `.env.example`):

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
REACT_APP_SPRINT3_CANVAS=false
```

## Next Steps

See [README.md](./README.md) for Sprint 3.1 tasks.
