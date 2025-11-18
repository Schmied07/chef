# @chef/templates

Project Templates for Chef.

## Available Templates

### React + Convex

Full-stack React application with Convex backend.

**Tech Stack:**
- React 18
- Convex (database + backend)
- TypeScript
- Vite
- TailwindCSS

**Features:**
- Real-time database
- Authentication
- File storage
- Serverless functions

### React + Supabase

Full-stack React application with Supabase backend.

**Tech Stack:**
- React 18
- Supabase (PostgreSQL + Auth)
- TypeScript
- Vite
- TailwindCSS

**Features:**
- PostgreSQL database
- Authentication
- Real-time subscriptions
- Storage

### React + Node.js

Full-stack React application with Node.js/Express backend.

**Tech Stack:**
- React 18
- Node.js + Express
- MongoDB
- TypeScript
- Vite
- TailwindCSS

**Features:**
- REST API
- MongoDB database
- JWT authentication

## Usage

```typescript
import { reactConvexTemplate } from '@chef/templates';

console.log(reactConvexTemplate.name);
console.log(reactConvexTemplate.techStack);
```

## Adding a New Template

1. Create a new directory in `src/`
2. Add `index.ts` with template definition
3. Export from main `index.ts`
4. Add template metadata and files

## License

MIT
