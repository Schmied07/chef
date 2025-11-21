import { useState, useEffect } from 'react';
import { diffLines, Change } from 'diff';
import { useProjectStore } from '../../stores/projectStore';
import classNames from 'classnames';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';

interface DiffViewerProps {
  fileId: string;
  oldContent: string;
  newContent: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function DiffViewer({
  fileId,
  oldContent,
  newContent,
  onAccept,
  onReject
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [changes, setChanges] = useState<Change[]>([]);

  useEffect(() => {
    const diff = diffLines(oldContent, newContent);
    setChanges(diff);
  }, [oldContent, newContent]);

  return (
    <div className="flex h-full flex-col bg-bolt-elements-background-depth-1" data-testid="diff-viewer">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={classNames(
              'rounded-lg px-3 py-1.5 text-sm',
              {
                'bg-blue-500 text-white': viewMode === 'side-by-side',
                'bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary': viewMode !== 'side-by-side'
              }
            )}
            data-testid="view-side-by-side"
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('inline')}
            className={classNames(
              'rounded-lg px-3 py-1.5 text-sm',
              {
                'bg-blue-500 text-white': viewMode === 'inline',
                'bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary': viewMode !== 'inline'
              }
            )}
            data-testid="view-inline"
          >
            Inline
          </button>
        </div>

        {(onAccept || onReject) && (
          <div className="flex gap-2">
            {onReject && (
              <button
                onClick={onReject}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                data-testid="reject-changes"
              >
                <Cross2Icon className="h-4 w-4" />
                Reject
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
                data-testid="accept-changes"
              >
                <CheckIcon className="h-4 w-4" />
                Accept
              </button>
            )}
          </div>
        )}
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'side-by-side' ? (
          <SideBySideDiff changes={changes} />
        ) : (
          <InlineDiff changes={changes} />
        )}
      </div>
    </div>
  );
}

function SideBySideDiff({ changes }: { changes: Change[] }) {
  const oldLines: { content: string; type: string }[] = [];
  const newLines: { content: string; type: string }[] = [];

  changes.forEach((change) => {
    const lines = change.value.split('\n').filter((l, i, arr) => i < arr.length - 1 || l);
    
    if (change.removed) {
      lines.forEach(line => {
        oldLines.push({ content: line, type: 'removed' });
        newLines.push({ content: '', type: 'empty' });
      });
    } else if (change.added) {
      lines.forEach(line => {
        oldLines.push({ content: '', type: 'empty' });
        newLines.push({ content: line, type: 'added' });
      });
    } else {
      lines.forEach(line => {
        oldLines.push({ content: line, type: 'unchanged' });
        newLines.push({ content: line, type: 'unchanged' });
      });
    }
  });

  return (
    <div className="grid grid-cols-2" data-testid="side-by-side-diff">
      {/* Old Version */}
      <div className="border-r border-bolt-elements-borderColor">
        <div className="sticky top-0 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2 text-sm font-semibold text-bolt-elements-textPrimary">
          Original
        </div>
        <div className="font-mono text-xs">
          {oldLines.map((line, i) => (
            <DiffLine key={i} line={line} lineNumber={i + 1} />
          ))}
        </div>
      </div>

      {/* New Version */}
      <div>
        <div className="sticky top-0 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2 text-sm font-semibold text-bolt-elements-textPrimary">
          Modified
        </div>
        <div className="font-mono text-xs">
          {newLines.map((line, i) => (
            <DiffLine key={i} line={line} lineNumber={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InlineDiff({ changes }: { changes: Change[] }) {
  let lineNumber = 0;

  return (
    <div className="font-mono text-xs" data-testid="inline-diff">
      {changes.map((change, i) => {
        const lines = change.value.split('\n').filter((l, idx, arr) => idx < arr.length - 1 || l);
        
        return lines.map((line, j) => {
          lineNumber++;
          const type = change.added ? 'added' : change.removed ? 'removed' : 'unchanged';
          return (
            <DiffLine
              key={`${i}-${j}`}
              line={{ content: line, type }}
              lineNumber={lineNumber}
            />
          );
        });
      })}
    </div>
  );
}

function DiffLine({ line, lineNumber }: { line: { content: string; type: string }; lineNumber: number }) {
  const bgColors = {
    added: 'bg-green-500/10',
    removed: 'bg-red-500/10',
    unchanged: '',
    empty: 'bg-bolt-elements-background-depth-2'
  };

  const textColors = {
    added: 'text-green-400',
    removed: 'text-red-400',
    unchanged: 'text-bolt-elements-textPrimary',
    empty: ''
  };

  return (
    <div
      className={classNames('flex', bgColors[line.type as keyof typeof bgColors])}
      data-testid={`diff-line-${line.type}`}
    >
      <span className="flex-shrink-0 w-12 px-2 py-1 text-right text-bolt-elements-textSecondary select-none">
        {line.type !== 'empty' ? lineNumber : ''}
      </span>
      <span className={classNames('flex-1 px-2 py-1', textColors[line.type as keyof typeof textColors])}>
        {line.type === 'added' && '+ '}
        {line.type === 'removed' && '- '}
        {line.content || ' '}
      </span>
    </div>
  );
}
