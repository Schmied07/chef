import { PropDefinition } from '../../types';

interface PropEditorProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
}

export default function PropEditor({ prop, value, onChange }: PropEditorProps) {
  return (
    <div className="space-y-2" data-testid={`prop-editor-${prop.name}`}>
      <label className="flex items-center justify-between text-xs font-medium text-bolt-elements-textPrimary">
        <span>
          {prop.name}
          {prop.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {prop.description && (
          <span className="text-bolt-elements-textSecondary" title={prop.description}>
            ℹ️
          </span>
        )}
      </label>

      {prop.type === 'string' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
          data-testid={`prop-input-${prop.name}`}
        />
      )}

      {prop.type === 'number' && (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
          data-testid={`prop-input-${prop.name}`}
        />
      )}

      {prop.type === 'boolean' && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid={`prop-input-${prop.name}`}
          />
          <span className="text-sm text-bolt-elements-textSecondary">
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      )}

      {prop.type === 'select' && (
        <select
          value={value || prop.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
          data-testid={`prop-input-${prop.name}`}
        >
          {prop.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {prop.type === 'color' && (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1"
            data-testid={`prop-input-${prop.name}`}
          />
          <input
            type="text"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
            placeholder="#000000"
          />
        </div>
      )}

      {prop.type === 'array' && (
        <textarea
          value={Array.isArray(value) ? value.join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
          rows={4}
          placeholder="One item per line"
          className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
          data-testid={`prop-input-${prop.name}`}
        />
      )}

      {prop.description && (
        <p className="text-xs text-bolt-elements-textSecondary">
          {prop.description}
        </p>
      )}
    </div>
  );
}
