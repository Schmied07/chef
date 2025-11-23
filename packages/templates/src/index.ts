/**
 * @chef/templates - Project Templates
 * 
 * Contains pre-configured templates for different project types
 */

export * from './types';
export * from './react-convex';
export * from './react-supabase';
export * from './react-node';
export * from './vue-firebase';
export * from './nextjs-vercel';

// Export generators
export * from './generator/templateEngine';
export * from './generator/fileGenerator';
export * from './generator/autoGenerate';

// Template registry
import { reactConvexTemplate } from './react-convex';
import { reactSupabaseTemplate } from './react-supabase';
import { reactNodeTemplate } from './react-node';
import { vueFirebaseTemplate } from './vue-firebase';
import { nextjsVercelTemplate } from './nextjs-vercel';
import type { Template } from './types';

export const TEMPLATES: Record<string, Template> = {
  'react-convex': reactConvexTemplate,
  'react-supabase': reactSupabaseTemplate,
  'react-node': reactNodeTemplate,
  'vue-firebase': vueFirebaseTemplate,
  'nextjs-vercel': nextjsVercelTemplate,
};

export const getAllTemplates = (): Template[] => Object.values(TEMPLATES);
export const getTemplate = (id: string): Template | undefined => TEMPLATES[id];
