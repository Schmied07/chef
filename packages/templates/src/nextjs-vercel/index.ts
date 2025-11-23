/**
 * Next.js + Vercel Template
 */

import type { Template } from '../types';

export const nextjsVercelTemplate: Template = {
  id: 'nextjs-vercel',
  name: 'Next.js + Vercel',
  description: 'Next.js app optimized for Vercel deployment',
  category: 'fullstack',
  techStack: ['Next.js', 'React', 'TypeScript', 'Vercel', 'TailwindCSS'],
  features: [
    'App Router',
    'Server Components',
    'API Routes',
    'NextAuth.js',
    'Vercel deployment',
  ],
  metadata: {
    framework: 'nextjs',
    backend: 'nextjs-api',
    database: 'prisma',
    auth: true,
    styling: 'tailwind',
  },
};
