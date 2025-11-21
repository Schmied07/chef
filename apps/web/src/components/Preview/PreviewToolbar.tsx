import { PreviewMode } from '../../types';
import { ReloadIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

interface PreviewToolbarProps {
  modes: PreviewMode[];
  selectedMode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function PreviewToolbar({
  modes,
  selectedMode,
  onModeChange,
  onRefresh,
  isRefreshing
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2" data-testid="preview-toolbar">
      {/* Device Modes */}
      <div className="flex gap-1">
        {modes.map((mode) => (
          <button
            key={mode.name}
            onClick={() => onModeChange(mode)}
            className={classNames(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              {
                'bg-blue-500 text-white': selectedMode.name === mode.name,
                'bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary': selectedMode.name !== mode.name
              }
            )}
            data-testid={`preview-mode-${mode.name.toLowerCase()}`}
          >
            <span>{mode.icon}</span>
            <span>{mode.name}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-bolt-elements-textSecondary">
          {selectedMode.width} × {selectedMode.height}
        </span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-lg bg-bolt-elements-background-depth-1 p-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 disabled:opacity-50"
          data-testid="preview-refresh"
        >
          <ReloadIcon className={classNames('h-4 w-4', { 'animate-spin': isRefreshing })} />
        </button>
      </div>
    </div>
  );
}
