import { useCanvasStore } from '../../stores/canvasStore';
import { getComponentById } from '../../lib/componentLibrary';
import PropEditor from './PropEditor';
import { Cross2Icon } from '@radix-ui/react-icons';

export default function PropsPanel() {
  const { nodes, selectedNodeId, updateNode, setSelectedNode } = useCanvasStore();
  
  const selectedNode = findNode(nodes, selectedNodeId);
  const component = selectedNode?.componentId ? getComponentById(selectedNode.componentId) : null;

  if (!selectedNode || !component) {
    return (
      <div className="flex h-full items-center justify-center bg-bolt-elements-background-depth-2 p-4" data-testid="props-panel-empty">
        <div className="text-center">
          <p className="text-sm text-bolt-elements-textSecondary">
            Select a component to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    updateNode(selectedNode.id, {
      props: {
        ...selectedNode.props,
        [propName]: value
      }
    });
  };

  const handleReset = () => {
    const defaultProps = component.props.reduce((acc, prop) => {
      acc[prop.name] = prop.defaultValue;
      return acc;
    }, {} as Record<string, any>);
    
    updateNode(selectedNode.id, { props: defaultProps });
  };

  return (
    <div className="flex h-full flex-col bg-bolt-elements-background-depth-2" data-testid="props-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bolt-elements-borderColor p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{component.icon}</span>
          <h2 className="text-sm font-bold text-bolt-elements-textPrimary">
            {component.name}
          </h2>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="rounded p-1 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-1 hover:text-bolt-elements-textPrimary"
          data-testid="close-props-panel"
        >
          <Cross2Icon className="h-4 w-4" />
        </button>
      </div>

      {/* Props */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {component.props.map((prop) => (
            <PropEditor
              key={prop.name}
              prop={prop}
              value={selectedNode.props[prop.name] ?? prop.defaultValue}
              onChange={(value) => handlePropChange(prop.name, value)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-bolt-elements-borderColor p-4">
        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-4 py-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
          data-testid="reset-props"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

function findNode(nodes: any[], nodeId: string | null): any | null {
  if (!nodeId) return null;
  
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}
