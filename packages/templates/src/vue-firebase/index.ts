/**
 * Vue + Firebase Template
 */

import type { Template } from '../types';

export const vueFirebaseTemplate: Template = {
  id: 'vue-firebase',
  name: 'Vue + Firebase',
  description: 'Full-stack Vue app with Firebase backend',
  category: 'fullstack',
  techStack: ['Vue', 'Firebase', 'TypeScript', 'Vite', 'Firestore'],
  features: [
    'Cloud Firestore',
    'Firebase Authentication',
    'Real-time updates',
    'Cloud Storage',
    'TypeScript',
  ],
  metadata: {
    framework: 'vue',
    backend: 'firebase',
    database: 'firestore',
    auth: true,
    styling: 'css',
  },
};
