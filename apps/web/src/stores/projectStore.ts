import { create } from 'zustand';
import { FileNode, Project } from '../types';

interface ProjectState {
  currentProject: Project | null;
  files: FileNode[];
  activeFileId: string | null;
  
  setProject: (project: Project) => void;
  setFiles: (files: FileNode[]) => void;
  setActiveFile: (fileId: string) => void;
  updateFile: (fileId: string, content: string) => void;
  addFile: (file: FileNode) => void;
  deleteFile: (fileId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  files: [],
  activeFileId: null,

  setProject: (project) => set({ currentProject: project, files: project.files }),
  
  setFiles: (files) => set({ files }),
  
  setActiveFile: (fileId) => set({ activeFileId: fileId }),
  
  updateFile: (fileId, content) => set((state) => ({
    files: updateFileInTree(state.files, fileId, content)
  })),
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  deleteFile: (fileId) => set((state) => ({
    files: removeFileFromTree(state.files, fileId)
  }))
}));

function updateFileInTree(files: FileNode[], fileId: string, content: string): FileNode[] {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, content, modified: true };
    }
    if (file.children) {
      return { ...file, children: updateFileInTree(file.children, fileId, content) };
    }
    return file;
  });
}

function removeFileFromTree(files: FileNode[], fileId: string): FileNode[] {
  return files.filter(file => {
    if (file.id === fileId) return false;
    if (file.children) {
      file.children = removeFileFromTree(file.children, fileId);
    }
    return true;
  });
}
