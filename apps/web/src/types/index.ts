// Core types for the application

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  modified?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: FileNode[];
  status: 'idle' | 'generating' | 'building' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  phase?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'layout' | 'ui' | 'form' | 'data' | 'media';
  description: string;
  icon: string;
  props: PropDefinition[];
  preview?: string;
  code: string;
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'array' | 'object';
  defaultValue?: any;
  options?: string[];
  required?: boolean;
  description?: string;
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  props: Record<string, any>;
  children: ComponentInstance[];
  parentId?: string;
}

export interface CanvasNode {
  id: string;
  type: 'component' | 'container';
  componentId?: string;
  props: Record<string, any>;
  children: CanvasNode[];
  parentId?: string;
}

export interface DiffEntry {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldContent?: string;
  newContent?: string;
  lineChanges?: LineChange[];
}

export interface LineChange {
  lineNumber: number;
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

export interface PreviewMode {
  name: string;
  width: number;
  height: number;
  icon: string;
}
