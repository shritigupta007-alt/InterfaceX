// HTTP client for InterfaceX REST API
const API_BASE = '/api';

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = body?.error || body?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, body?.details);
  }

  return body as T;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  owner: { id: string; name: string; email: string; avatarColor: string };
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  collaboratorCount: number;
  componentCount: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullProject {
  id: string;
  name: string;
  tree: any[];
  owner: { id: string; name: string; email: string; avatarColor: string };
  collaborators?: { user: any; role: string; addedAt: string }[];
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export const api = {
  auth: {
    async register(data: { name: string; email: string; password: string }) {
      return request<{ success: boolean; data: { user: UserProfile } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async login(data: { email: string; password: string }) {
      return request<{ success: boolean; data: { user: UserProfile } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logout() {
      return request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      });
    },

    async me() {
      return request<{ success: boolean; data: { user: UserProfile } }>('/auth/me');
    },
  },

  projects: {
    async list(params?: { filter?: 'all' | 'recent' | 'shared' | 'owned'; search?: string }) {
      const q = new URLSearchParams();
      if (params?.filter) q.set('filter', params.filter);
      if (params?.search) q.set('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ success: boolean; data: { projects: ProjectMetadata[] } }>(`/projects${queryStr}`);
    },

    async create(data: { name?: string; tree?: any[] }) {
      return request<{ success: boolean; data: { project: FullProject } }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async get(id: string) {
      return request<{ success: boolean; data: { project: FullProject } }>(`/projects/${id}`);
    },

    async update(id: string, data: { name?: string; tree?: any[]; thumbnail?: string }) {
      return request<{ success: boolean; data: { project: { id: string; name: string; tree: any[]; updatedAt: string } } }>(
        `/projects/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    },

    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/projects/${id}`, {
        method: 'DELETE',
      });
    },

    async duplicate(id: string) {
      return request<{ success: boolean; data: { project: FullProject } }>(`/projects/${id}/duplicate`, {
        method: 'POST',
      });
    },

    async getCollaborators(id: string) {
      return request<{
        success: boolean;
        data: {
          collaborators: { user: UserProfile; role: string; isOwner: boolean }[];
          pendingInvitations: any[];
        };
      }>(`/projects/${id}/collaborators`);
    },

    async invite(id: string, email: string, role: 'EDITOR' | 'VIEWER') {
      return request<{ success: boolean; data: { invitation: any } }>(`/projects/${id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
    },

    async removeCollaborator(id: string, userId: string) {
      return request<{ success: boolean; message: string }>(`/projects/${id}/collaborators/${userId}`, {
        method: 'DELETE',
      });
    },
  },

  invitations: {
    async getPending() {
      return request<{ success: boolean; data: { invitations: any[] } }>('/invitations/pending');
    },

    async accept(token: string) {
      return request<{ success: boolean; data: { projectId: string; message: string } }>(
        `/invitations/${token}/accept`,
        {
          method: 'POST',
        }
      );
    },
  },
};
