/**
 * React + Convex Template
 */

import type { Template } from '../types';

export const reactConvexTemplate: Template = {
  id: 'react-convex',
  name: 'React + Convex',
  description: 'Full-stack React app with Convex backend',
  category: 'fullstack',
  techStack: ['React', 'Convex', 'TypeScript', 'Vite', 'TailwindCSS'],
  features: [
    'Real-time database',
    'Authentication',
    'File storage',
    'Serverless functions',
    'TypeScript',
  ],
  metadata: {
    framework: 'react',
    backend: 'convex',
    database: 'convex',
    auth: true,
    styling: 'tailwind',
  },
};
