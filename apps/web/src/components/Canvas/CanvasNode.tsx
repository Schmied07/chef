import { useDrag, useDrop } from 'react-dnd';
import { useCanvasStore } from '../../stores/canvasStore';
import { CanvasNode as CanvasNodeType } from '../../types';
import { getComponentById } from '../../lib/componentLibrary';
import DropZone from './DropZone';
import classNames from 'classnames';

interface CanvasNodeProps {
  node: CanvasNodeType;
}

export default function CanvasNode({ node }: CanvasNodeProps) {
  const { selectedNodeId, hoveredNodeId, setSelectedNode, setHoveredNode, deleteNode } = useCanvasStore();
  const component = node.componentId ? getComponentById(node.componentId) : null;
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CANVAS_NODE',
    item: { nodeId: node.id, type: 'move' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['COMPONENT', 'CANVAS_NODE'],
    hover: () => setHoveredNode(node.id),
    drop: () => setHoveredNode(null),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;

  return (
    <div
      ref={(el) => drag(drop(el))}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode(node.id);
      }}
      className={classNames(
        'relative rounded-lg border-2 p-4 transition-all cursor-move',
        {
          'border-blue-500 bg-blue-500/10': isSelected,
          'border-blue-300': isHovered && !isSelected,
          'border-transparent hover:border-bolt-elements-borderColor': !isSelected && !isHovered,
          'opacity-50': isDragging
        }
      )}
      data-testid={`canvas-node-${node.id}`}
    >
      {/* Node Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{component?.icon || '📦'}</span>
          <span className="text-sm font-medium text-bolt-elements-textPrimary">
            {component?.name || 'Container'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(node.id);
          }}
          className="rounded p-1 text-bolt-elements-textSecondary hover:bg-red-500/20 hover:text-red-500"
          data-testid={`delete-node-${node.id}`}
        >
          ✕
        </button>
      </div>

      {/* Node Content */}
      <div className="rounded bg-bolt-elements-background-depth-2 p-4">
        <div className="text-sm text-bolt-elements-textSecondary">
          {component?.description || 'Drop components here'}
        </div>
        
        {/* Children */}
        {node.children.length > 0 && (
          <div className="mt-4 space-y-2">
            {node.children.map((child, index) => (
              <div key={child.id}>
                <CanvasNode node={child} />
                <DropZone parentId={node.id} index={index + 1} />
              </div>
            ))}
          </div>
        )}
        
        {/* Drop zone for first child */}
        {node.children.length === 0 && (
          <DropZone parentId={node.id} index={0} />
        )}
      </div>
    </div>
  );
}
