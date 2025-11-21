import { Project, FileNode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async generateProject(prompt: string, config?: any) {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, config })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createProject(files: any[], dependencies: any, strategy: any) {
    const response = await fetch(`${this.baseUrl}/v1/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, dependencies, strategy })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getProjectStatus(projectId: string) {
    const response = await fetch(`${this.baseUrl}/v1/projects/${projectId}/status`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getProjectLogs(projectId: string) {
    const response = await fetch(`${this.baseUrl}/v1/projects/${projectId}/logs`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getArtifacts(projectId: string) {
    const response = await fetch(`${this.baseUrl}/v1/projects/${projectId}/artifacts`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async downloadArtifact(projectId: string, artifactName: string) {
    const response = await fetch(`${this.baseUrl}/v1/projects/${projectId}/artifacts/${artifactName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.blob();
  }

  async publishProject(projectId: string) {
    const response = await fetch(`${this.baseUrl}/v1/projects/${projectId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
