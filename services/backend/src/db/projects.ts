/**
 * Project database operations
 * TODO: Replace with actual database implementation (Redis, PostgreSQL, etc.)
 */

interface Project {
  id: string;
  prompt: string;
  config: Record<string, unknown>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
  logs?: string[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

// In-memory storage for now (replace with actual DB)
const projects = new Map<string, Project>();

export async function getProject(id: string): Promise<Project | null> {
  return projects.get(id) || null;
}

export async function createProject(project: Project): Promise<void> {
  projects.set(project.id, project);
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<void> {
  const project = projects.get(id);
  if (project) {
    projects.set(id, {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function addLog(id: string, log: string): Promise<void> {
  const project = projects.get(id);
  if (project) {
    const logs = project.logs || [];
    logs.push(log);
    projects.set(id, {
      ...project,
      logs,
      updatedAt: new Date().toISOString(),
    });
  }
}
