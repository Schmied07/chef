import { create } from 'zustand';
import { CanvasNode, ComponentInstance } from '../types';

interface CanvasState {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  
  setNodes: (nodes: CanvasNode[]) => void;
  addNode: (node: CanvasNode, parentId?: string) => void;
  updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string, index: number) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  hoveredNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  
  addNode: (node, parentId) => set((state) => {
    if (!parentId) {
      return { nodes: [...state.nodes, node] };
    }
    return { nodes: addNodeToTree(state.nodes, node, parentId) };
  }),
  
  updateNode: (nodeId, updates) => set((state) => ({
    nodes: updateNodeInTree(state.nodes, nodeId, updates)
  })),
  
  deleteNode: (nodeId) => set((state) => ({
    nodes: removeNodeFromTree(state.nodes, nodeId),
    selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
  })),
  
  moveNode: (nodeId, newParentId, index) => set((state) => {
    // Remove from old position
    const nodes = removeNodeFromTree(state.nodes, nodeId);
    // Find the node
    const node = findNode(state.nodes, nodeId);
    if (!node) return { nodes: state.nodes };
    // Add to new position
    return { nodes: addNodeToTree(nodes, node, newParentId, index) };
  }),
  
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId })
}));

function addNodeToTree(nodes: CanvasNode[], node: CanvasNode, parentId: string, index?: number): CanvasNode[] {
  return nodes.map(n => {
    if (n.id === parentId) {
      const newChildren = [...n.children];
      if (index !== undefined) {
        newChildren.splice(index, 0, node);
      } else {
        newChildren.push(node);
      }
      return { ...n, children: newChildren };
    }
    if (n.children.length > 0) {
      return { ...n, children: addNodeToTree(n.children, node, parentId, index) };
    }
    return n;
  });
}

function updateNodeInTree(nodes: CanvasNode[], nodeId: string, updates: Partial<CanvasNode>): CanvasNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, ...updates };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, nodeId, updates) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: CanvasNode[], nodeId: string): CanvasNode[] {
  return nodes.filter(node => {
    if (node.id === nodeId) return false;
    if (node.children.length > 0) {
      node.children = removeNodeFromTree(node.children, nodeId);
    }
    return true;
  });
}

function findNode(nodes: CanvasNode[], nodeId: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children.length > 0) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}
