import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { PreviewMode } from '../../types';
import PreviewToolbar from './PreviewToolbar';

const PREVIEW_MODES: PreviewMode[] = [
  { name: 'Desktop', width: 1920, height: 1080, icon: '💻' },
  { name: 'Laptop', width: 1440, height: 900, icon: '💻' },
  { name: 'Tablet', width: 768, height: 1024, icon: '📱' },
  { name: 'Mobile', width: 375, height: 667, icon: '📱' }
];

export default function Preview() {
  const [selectedMode, setSelectedMode] = useState<PreviewMode>(PREVIEW_MODES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { files } = useProjectStore();

  useEffect(() => {
    // Setup postMessage listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleLogs(prev => [...prev, event.data.payload]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Hot reload when files change
    if (iframeRef.current) {
      refreshPreview();
    }
  }, [files]);

  const refreshPreview = () => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      // Generate preview HTML
      const html = generatePreviewHTML(files);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="flex h-full flex-col bg-bolt-elements-background-depth-1" data-testid="preview-container">
      {/* Toolbar */}
      <PreviewToolbar
        modes={PREVIEW_MODES}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        onRefresh={refreshPreview}
        isRefreshing={isRefreshing}
      />

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-8">
        <div
          className="mx-auto bg-white shadow-2xl transition-all"
          style={{
            width: selectedMode.width,
            height: selectedMode.height,
            maxWidth: '100%'
          }}
        >
          <iframe
            ref={iframeRef}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
            data-testid="preview-iframe"
          />
        </div>
      </div>

      {/* Console Logs */}
      {consoleLogs.length > 0 && (
        <div className="border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4">
          <h3 className="mb-2 text-xs font-semibold text-bolt-elements-textSecondary uppercase">
            Console
          </h3>
          <div className="max-h-32 overflow-auto space-y-1 font-mono text-xs">
            {consoleLogs.map((log, i) => (
              <div key={i} className="text-bolt-elements-textPrimary">
                [{log.level}] {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generatePreviewHTML(files: any[]): string {
  // Simple preview HTML generator
  // In production, this would compile the actual project
  const htmlFile = findFileByExtension(files, '.html');
  const cssFiles = findFilesByExtension(files, '.css');
  const jsFiles = findFilesByExtension(files, '.js');

  let html = htmlFile?.content || '<html><body><h1>No HTML file found</h1></body></html>';

  // Inject CSS
  const cssContent = cssFiles.map(f => f.content).join('\n');
  if (cssContent) {
    html = html.replace('</head>', `<style>${cssContent}</style></head>`);
  }

  // Inject console capture script
  const consoleScript = `
    <script>
      const originalConsole = { ...console };
      ['log', 'info', 'warn', 'error'].forEach(level => {
        console[level] = function(...args) {
          originalConsole[level](...args);
          window.parent.postMessage({
            type: 'console',
            payload: { level, message: args.join(' ') }
          }, '*');
        };
      });
    </script>
  `;

  // Inject JS
  const jsContent = jsFiles.map(f => f.content).join('\n');
  if (jsContent) {
    html = html.replace('</body>', `${consoleScript}<script>${jsContent}</script></body>`);
  } else {
    html = html.replace('</body>', `${consoleScript}</body>`);
  }

  return html;
}

function findFileByExtension(files: any[], ext: string): any | null {
  for (const file of files) {
    if (file.type === 'file' && file.name.endsWith(ext)) {
      return file;
    }
    if (file.children) {
      const found = findFileByExtension(file.children, ext);
      if (found) return found;
    }
  }
  return null;
}

function findFilesByExtension(files: any[], ext: string): any[] {
  const result: any[] = [];
  
  for (const file of files) {
    if (file.type === 'file' && file.name.endsWith(ext)) {
      result.push(file);
    }
    if (file.children) {
      result.push(...findFilesByExtension(file.children, ext));
    }
  }
  
  return result;
}
