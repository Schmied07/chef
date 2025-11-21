import { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { FileNode } from '../../types';
import { ChevronRightIcon, ChevronDownIcon, FileIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

export default function FileTree() {
  const { files } = useProjectStore();

  return (
    <div className="w-64 border-r border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 overflow-auto" data-testid="file-tree">
      <div className="p-2">
        <h3 className="mb-2 px-2 text-xs font-semibold text-bolt-elements-textSecondary uppercase">
          Files
        </h3>
        <div className="space-y-0.5">
          {files.map((file) => (
            <FileTreeNode key={file.id} node={file} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FileTreeNode({ node, level }: { node: FileNode; level: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { openTab } = useEditorStore();
  const { setActiveFile } = useProjectStore();

  const handleClick = () => {
    if (node.type === 'file') {
      openTab(node.id, node.name, node.path);
      setActiveFile(node.id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={classNames(
          'flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer transition-colors',
          'hover:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        data-testid={`file-tree-node-${node.id}`}
      >
        {node.type === 'directory' && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </span>
        )}
        
        {node.type === 'directory' ? (
          <span className="h-4 w-4 flex-shrink-0 text-blue-500">📁</span>
        ) : (
          <FileIcon className="h-4 w-4 flex-shrink-0 text-bolt-elements-textSecondary" />
        )}
        
        <span className="flex-1 truncate">
          {node.name}
          {node.modified && <span className="ml-1 text-blue-500">•</span>}
        </span>
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
