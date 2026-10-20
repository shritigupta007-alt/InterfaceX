import type { Project, ComponentNode } from './types';

const KEY = 'interfacex-projects';
const ACTIVE_KEY = 'interfacex-active-project';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Project[];
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {
    // ignore quota errors
  }
}

export function upsertProject(project: Project): void {
  const all = loadProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.unshift(project);
  saveProjects(all);
}

export function deleteProject(id: string): void {
  const all = loadProjects().filter((p) => p.id !== id);
  saveProjects(all);
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveProjectId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createProject(name: string, tree: ComponentNode[]): Project {
  const now = Date.now();
  return {
    id: `proj-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    tree,
    createdAt: now,
    updatedAt: now,
  };
}
