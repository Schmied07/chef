import { useEditorStore } from '../../stores/editorStore';
import { Cross2Icon } from '@radix-ui/react-icons';
import classNames from 'classnames';

export default function CodeTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-2" data-testid="code-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={classNames(
            'group flex items-center gap-2 border-b-2 px-3 py-2 text-sm cursor-pointer whitespace-nowrap',
            {
              'border-blue-500 bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary': activeTabId === tab.id,
              'border-transparent text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-1 hover:text-bolt-elements-textPrimary': activeTabId !== tab.id
            }
          )}
          data-testid={`tab-${tab.id}`}
        >
          <span className="flex-1">
            {tab.fileName}
            {tab.modified && <span className="ml-1 text-blue-500">•</span>}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-bolt-elements-background-depth-3"
            data-testid={`close-tab-${tab.id}`}
          >
            <Cross2Icon className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
