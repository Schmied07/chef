import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { useEditorStore } from '../../stores/editorStore';
import { useProjectStore } from '../../stores/projectStore';
import CodeTabs from './CodeTabs';
import FileTree from './FileTree';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodeViewer() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { tabs, activeTabId } = useEditorStore();
  const { files, updateFile } = useProjectStore();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeFile = activeTab ? findFile(files, activeTab.fileId) : null;

  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    // Destroy previous editor
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Get language extension
    const lang = getLanguageExtension(activeFile.language || activeFile.name);

    // Create new editor
    const state = EditorState.create({
      doc: activeFile.content || '',
      extensions: [
        basicSetup,
        lang,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            updateFile(activeFile.id, newContent);
          }
        })
      ]
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current
    });

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [activeFile?.id]);

  return (
    <div className="flex h-full" data-testid="code-viewer">
      {/* File Tree Sidebar */}
      <FileTree />

      {/* Editor Area */}
      <div className="flex flex-1 flex-col">
        {/* Tabs */}
        <CodeTabs />

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {activeFile ? (
            <div ref={editorRef} className="h-full" data-testid="code-editor" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-bolt-elements-textSecondary">
                Select a file to edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getLanguageExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: ext === 'ts' || ext === 'tsx' });
    case 'css':
    case 'scss':
    case 'sass':
      return css();
    case 'html':
      return html();
    case 'json':
      return json();
    default:
      return javascript();
  }
}

function findFile(files: any[], fileId: string): any | null {
  for (const file of files) {
    if (file.id === fileId) return file;
    if (file.children) {
      const found = findFile(file.children, fileId);
      if (found) return found;
    }
  }
  return null;
}
