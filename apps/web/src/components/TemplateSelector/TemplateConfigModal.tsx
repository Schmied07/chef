/**
 * Template Configuration Modal
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Template } from '@chef/templates';
// Import metadata from JSON
import reactConvexMetadata from '@chef/templates/src/react-convex/metadata.json';
import reactSupabaseMetadata from '@chef/templates/src/react-supabase/metadata.json';
import reactNodeMetadata from '@chef/templates/src/react-node/metadata.json';
import vueFirebaseMetadata from '@chef/templates/src/vue-firebase/metadata.json';
import nextjsVercelMetadata from '@chef/templates/src/nextjs-vercel/metadata.json';

interface TemplateConfigModalProps {
  template: Template;
  onSubmit: (config: any) => void;
  onClose: () => void;
}

const metadataMap: Record<string, any> = {
  'react-convex': reactConvexMetadata,
  'react-supabase': reactSupabaseMetadata,
  'react-node': reactNodeMetadata,
  'vue-firebase': vueFirebaseMetadata,
  'nextjs-vercel': nextjsVercelMetadata,
};

export function TemplateConfigModal({ template, onSubmit, onClose }: TemplateConfigModalProps) {
  const metadata = metadataMap[template.id];
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    Object.entries(metadata.variables).forEach(([key, variable]: [string, any]) => {
      initial[key] = variable.default;
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        data-testid="template-config-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Configure {template.name}</h3>
          <p className="text-sm text-gray-600 mt-1">Customize your project settings</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.entries(metadata.variables).map(([key, variable]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {variable.description}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {variable.type === 'string' && (
                  <input
                    type="text"
                    value={config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                    required={variable.required}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid={`config-${key}`}
                  />
                )}

                {variable.type === 'number' && (
                  <input
                    type="number"
                    value={config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: parseInt(e.target.value) })}
                    required={variable.required}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid={`config-${key}`}
                  />
                )}

                {variable.type === 'boolean' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[key]}
                      onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      data-testid={`config-${key}`}
                    />
                    <span className="text-sm text-gray-700">Enable</span>
                  </label>
                )}

                {variable.type === 'select' && (
                  <select
                    value={config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                    required={variable.required}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid={`config-${key}`}
                  >
                    {variable.options?.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
              <div className="space-y-2">
                {metadata.features.map((feature: any) => (
                  <label key={feature.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      defaultChecked={feature.enabled}
                      className="mt-0.5 w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      data-testid={`feature-${feature.id}`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              data-testid="cancel-config"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              data-testid="submit-config"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
