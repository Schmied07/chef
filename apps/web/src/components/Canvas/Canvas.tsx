import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCanvasStore } from '../../stores/canvasStore';
import CanvasNode from './CanvasNode';
import DropZone from './DropZone';
import { PlusIcon } from '@radix-ui/react-icons';

export default function Canvas() {
  const { nodes } = useCanvasStore();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-auto bg-bolt-elements-background-depth-1 p-8" data-testid="canvas-container">
        <div className="mx-auto max-w-7xl">
          {nodes.length === 0 ? (
            <EmptyCanvas />
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => (
                <CanvasNode key={node.id} node={node} />
              ))}
            </div>
          )}
          
          <DropZone parentId={null} index={nodes.length} />
        </div>
      </div>
    </DndProvider>
  );
}

function EmptyCanvas() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-bolt-elements-borderColor p-12 text-center">
      <PlusIcon className="mb-4 h-12 w-12 text-bolt-elements-textSecondary" />
      <h3 className="mb-2 text-lg font-semibold text-bolt-elements-textPrimary">
        Start Building Your UI
      </h3>
      <p className="text-sm text-bolt-elements-textSecondary">
        Drag components from the library to start designing
      </p>
    </div>
  );
}
