/**
 * React + Supabase Template
 */

import type { Template } from '../types';

export const reactSupabaseTemplate: Template = {
  id: 'react-supabase',
  name: 'React + Supabase',
  description: 'Full-stack React app with Supabase backend',
  category: 'fullstack',
  techStack: ['React', 'Supabase', 'TypeScript', 'Vite', 'TailwindCSS'],
  features: [
    'PostgreSQL database',
    'Authentication',
    'Real-time subscriptions',
    'Storage',
    'TypeScript',
  ],
  metadata: {
    framework: 'react',
    backend: 'supabase',
    database: 'postgresql',
    auth: true,
    styling: 'tailwind',
  },
};
