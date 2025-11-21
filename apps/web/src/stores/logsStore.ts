import { create } from 'zustand';
import { BuildLog } from '../types';

interface LogsState {
  logs: BuildLog[];
  filter: 'all' | 'info' | 'warn' | 'error' | 'success';
  searchQuery: string;
  autoScroll: boolean;
  
  addLog: (log: BuildLog) => void;
  clearLogs: () => void;
  setFilter: (filter: LogsState['filter']) => void;
  setSearchQuery: (query: string) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  getFilteredLogs: () => BuildLog[];
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  filter: 'all',
  searchQuery: '',
  autoScroll: true,

  addLog: (log) => set((state) => ({ 
    logs: [...state.logs, log] 
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  setFilter: (filter) => set({ filter }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setAutoScroll: (autoScroll) => set({ autoScroll }),
  
  getFilteredLogs: () => {
    const { logs, filter, searchQuery } = get();
    let filtered = logs;
    
    // Filter by level
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.level === filter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }
}));
