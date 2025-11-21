import { useDrop } from 'react-dnd';
import { useCanvasStore } from '../../stores/canvasStore';
import classNames from 'classnames';

interface DropZoneProps {
  parentId: string | null;
  index: number;
}

export default function DropZone({ parentId, index }: DropZoneProps) {
  const { addNode, moveNode } = useCanvasStore();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['COMPONENT', 'CANVAS_NODE'],
    drop: (item: any) => {
      if (item.type === 'component') {
        // Adding new component from library
        const newNode = {
          id: `node-${Date.now()}-${Math.random()}`,
          type: 'component' as const,
          componentId: item.componentId,
          props: item.defaultProps || {},
          children: [],
          parentId: parentId || undefined
        };
        addNode(newNode, parentId || undefined);
      } else if (item.type === 'move') {
        // Moving existing node
        moveNode(item.nodeId, parentId || '', index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }));

  return (
    <div
      ref={drop}
      className={classNames(
        'h-8 rounded border-2 border-dashed transition-all',
        {
          'border-blue-500 bg-blue-500/10': isOver && canDrop,
          'border-transparent': !isOver
        }
      )}
      data-testid="drop-zone"
    />
  );
}
