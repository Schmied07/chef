import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EditorPage() {
  const { projectId } = useParams();
  const [activeView, setActiveView] = useState<'code' | 'preview' | 'logs'>('code');

  return (
    <div className="flex h-screen flex-col bg-bolt-elements-background-depth-1">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-bolt-elements-textPrimary">Chef Editor</h1>
          {projectId && (
            <span className="text-sm text-bolt-elements-textSecondary">
              Project: {projectId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle
            views={['code', 'preview', 'logs']}
            activeView={activeView}
            onChange={setActiveView}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Tree (placeholder) */}
        <aside className="w-64 border-r border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4">
          <h2 className="mb-4 text-sm font-semibold text-bolt-elements-textPrimary">
            Files
          </h2>
          <div className="text-sm text-bolt-elements-textSecondary">
            <p>No files yet</p>
            <p className="mt-2">Start by creating a new project</p>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          {activeView === 'code' && (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-bolt-elements-textPrimary">
                  Code Editor
                </h2>
                <p className="text-bolt-elements-textSecondary">
                  Sprint 3.1 - Coming soon
                </p>
              </div>
            </div>
          )}

          {activeView === 'preview' && (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-bolt-elements-textPrimary">
                  Preview
                </h2>
                <p className="text-bolt-elements-textSecondary">
                  Sprint 3.1 - Coming soon
                </p>
              </div>
            </div>
          )}

          {activeView === 'logs' && (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-bolt-elements-textPrimary">
                  Logs Panel
                </h2>
                <p className="text-bolt-elements-textSecondary">
                  Sprint 3.1 - Coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ViewToggle({
  views,
  activeView,
  onChange,
}: {
  views: string[];
  activeView: string;
  onChange: (view: any) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-bolt-elements-background-depth-1 p-1">
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onChange(view)}
          className={`rounded px-4 py-2 text-sm font-medium capitalize transition-colors ${
            activeView === view
              ? 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent'
              : 'text-bolt-elements-textSecondary hover:bg-bolt-elements-item-backgroundActive hover:text-bolt-elements-item-contentActive'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  );
}
