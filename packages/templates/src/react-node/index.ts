/**
 * React + Node.js Template
 */

import type { Template } from '../types';

export const reactNodeTemplate: Template = {
  id: 'react-node',
  name: 'React + Node.js',
  description: 'Full-stack React app with Node.js/Express backend',
  category: 'fullstack',
  techStack: ['React', 'Node.js', 'Express', 'TypeScript', 'Vite'],
  features: [
    'REST API',
    'MongoDB',
    'Authentication (JWT)',
    'TypeScript',
    'TailwindCSS',
  ],
  metadata: {
    framework: 'react',
    backend: 'nodejs',
    database: 'mongodb',
    auth: true,
    styling: 'tailwind',
  },
};
