/**
 * Template Card Component
 */

import { motion } from 'framer-motion';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import type { Template } from '@chef/templates';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
  isSelected: boolean;
}

const iconMap: Record<string, string> = {
  'react-convex': '⚛️',
  'react-supabase': '🚀',
  'react-node': '🟢',
  'vue-firebase': '🔥',
  'nextjs-vercel': '▲',
};

export function TemplateCard({ template, onClick, isSelected }: TemplateCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative cursor-pointer bg-white border-2 rounded-xl p-6 transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      data-testid={`template-card-${template.id}`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <CheckCircledIcon className="w-6 h-6 text-blue-500" />
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-4">{iconMap[template.id] || '📦'}</div>

      {/* Name & Description */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{template.description}</p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {template.techStack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
          >
            {tech}
          </span>
        ))}
        {template.techStack.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
            +{template.techStack.length - 4} more
          </span>
        )}
      </div>

      {/* Features */}
      <div className="space-y-1">
        {template.features.slice(0, 3).map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {feature}
          </div>
        ))}
      </div>

      {/* Category Badge */}
      <div className="absolute top-4 left-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
          {template.category}
        </span>
      </div>
    </motion.div>
  );
}
