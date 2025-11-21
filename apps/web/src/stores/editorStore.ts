import { create } from 'zustand';

interface Tab {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  modified: boolean;
}

interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  showDiff: boolean;
  diffFileId: string | null;
  
  openTab: (fileId: string, fileName: string, filePath: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  markTabModified: (tabId: string, modified: boolean) => void;
  toggleDiff: (fileId?: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  showDiff: false,
  diffFileId: null,

  openTab: (fileId, fileName, filePath) => set((state) => {
    // Check if tab already exists
    const existingTab = state.tabs.find(t => t.fileId === fileId);
    if (existingTab) {
      return { activeTabId: existingTab.id };
    }
    
    const newTab: Tab = {
      id: `tab-${Date.now()}-${Math.random()}`,
      fileId,
      fileName,
      filePath,
      modified: false
    };
    
    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    };
  }),
  
  closeTab: (tabId) => set((state) => {
    const tabs = state.tabs.filter(t => t.id !== tabId);
    let activeTabId = state.activeTabId;
    
    // If closing active tab, select another
    if (activeTabId === tabId) {
      activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
    }
    
    return { tabs, activeTabId };
  }),
  
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  
  markTabModified: (tabId, modified) => set((state) => ({
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, modified } : t)
  })),
  
  toggleDiff: (fileId) => set((state) => ({
    showDiff: !state.showDiff,
    diffFileId: fileId || state.diffFileId
  }))
}));
