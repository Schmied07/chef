import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { useProjectStore } from '../stores/projectStore';
import { useLogsStore } from '../stores/logsStore';
import Canvas from '../components/Canvas/Canvas';
import ComponentLibrary from '../components/ComponentLibrary/ComponentLibrary';
import PropsPanel from '../components/PropsPanel/PropsPanel';
import CodeViewer from '../components/CodeViewer/CodeViewer';
import Preview from '../components/Preview/Preview';
import LogsPanel from '../components/Logs/LogsPanel';
import { CodeIcon, EyeOpenIcon, ActivityLogIcon, ComponentInstanceIcon, MixIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

type ViewMode = 'canvas' | 'code' | 'preview' | 'logs';

export default function EditorPage() {
  const { projectId } = useParams();
  const [activeView, setActiveView] = useState<ViewMode>('canvas');
  const { currentProject, setProject } = useProjectStore();
  const { addLog } = useLogsStore();

  useEffect(() => {
    // Initialize with mock project for demo
    if (projectId && !currentProject) {
      const mockProject = createMockProject(projectId);
      setProject(mockProject);
      
      // Add welcome log
      addLog({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level: 'info',
        message: 'Project loaded successfully',
        phase: 'Init'
      });
    }
  }, [projectId]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen flex-col bg-bolt-elements-background-depth-1" data-testid="editor-page">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-bolt-elements-textPrimary">Chef Editor</h1>
            {currentProject && (
              <span className="text-sm text-bolt-elements-textSecondary">
                {currentProject.name}
              </span>
            )}
          </div>
          
          <ViewToggle
            views={[
              { id: 'canvas', label: 'Canvas', icon: <ComponentInstanceIcon className="h-4 w-4" /> },
              { id: 'code', label: 'Code', icon: <CodeIcon className="h-4 w-4" /> },
              { id: 'preview', label: 'Preview', icon: <EyeOpenIcon className="h-4 w-4" /> },
              { id: 'logs', label: 'Logs', icon: <ActivityLogIcon className="h-4 w-4" /> }
            ]}
            activeView={activeView}
            onChange={setActiveView}
          />
        </header>

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          <Allotment>
            {/* Left Panel - Component Library (Canvas view only) */}
            {activeView === 'canvas' && (
              <Allotment.Pane preferredSize={280} minSize={200}>
                <ComponentLibrary />
              </Allotment.Pane>
            )}

            {/* Center Panel - Main View */}
            <Allotment.Pane>
              {activeView === 'canvas' && <Canvas />}
              {activeView === 'code' && <CodeViewer />}
              {activeView === 'preview' && <Preview />}
              {activeView === 'logs' && <LogsPanel />}
            </Allotment.Pane>

            {/* Right Panel - Props Panel (Canvas view only) */}
            {activeView === 'canvas' && (
              <Allotment.Pane preferredSize={300} minSize={200}>
                <PropsPanel />
              </Allotment.Pane>
            )}
          </Allotment>
        </main>
      </div>
    </DndProvider>
  );
}

function ViewToggle({
  views,
  activeView,
  onChange,
}: {
  views: { id: string; label: string; icon: React.ReactNode }[];
  activeView: string;
  onChange: (view: ViewMode) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-bolt-elements-background-depth-1 p-1" data-testid="view-toggle">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onChange(view.id as ViewMode)}
          className={classNames(
            'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors',
            {
              'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': activeView === view.id,
              'text-bolt-elements-textSecondary hover:bg-bolt-elements-item-backgroundActive hover:text-bolt-elements-item-contentActive': activeView !== view.id
            }
          )}
          data-testid={`view-toggle-${view.id}`}
        >
          {view.icon}
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
}

function createMockProject(id: string) {
  return {
    id,
    name: 'My Project',
    description: 'A sample project',
    status: 'idle' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    files: [
      {
        id: 'file-1',
        name: 'index.html',
        path: '/index.html',
        type: 'file' as const,
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Hello World!</h1>
    <p>Welcome to the Chef Editor</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'file-2',
        name: 'styles.css',
        path: '/styles.css',
        type: 'file' as const,
        language: 'css',
        content: `body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}`
      },
      {
        id: 'file-3',
        name: 'script.js',
        path: '/script.js',
        type: 'file' as const,
        language: 'javascript',
        content: `console.log('App initialized');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  const app = document.getElementById('app');
  if (app) {
    console.log('App element found');
  }
});`
      }
    ]
  };
}
