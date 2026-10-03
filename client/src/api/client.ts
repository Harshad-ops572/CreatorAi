const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status);
  }

  return data.data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  demoLogin: () => request<any>('/auth/demo-login', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Projects
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (body: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: any) => request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProject: (id: string) => request<any>(`/projects/${id}`, { method: 'DELETE' }),

  // Products
  getProduct: (projectId: string) => request<any>(`/products/project/${projectId}`),
  uploadProductMedia: (projectId: string, formData: FormData) =>
    request<any>(`/products/project/${projectId}/upload`, { method: 'POST', body: formData }),
  reanalyzeProductProfile: (projectId: string) =>
    request<any>(`/products/project/${projectId}/analyze-profile`, { method: 'POST' }),
  updateProductProfile: (projectId: string, body: any) =>
    request<any>(`/products/project/${projectId}/profile`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Ideas
  getIdeas: (projectId: string) => request<any[]>(`/ideas/project/${projectId}`),
  generateIdeas: (projectId: string, format: string) =>
    request<any[]>(`/ideas/project/${projectId}/generate`, { method: 'POST', body: JSON.stringify({ format }) }),
  selectIdea: (ideaId: string) => request<any>(`/ideas/${ideaId}/select`, { method: 'POST' }),
  deleteIdea: (ideaId: string) => request<any>(`/ideas/${ideaId}`, { method: 'DELETE' }),

  // Scripts
  getCurrentScript: (projectId: string) => request<any>(`/scripts/project/${projectId}/current`),
  getScriptVersions: (projectId: string) => request<any[]>(`/scripts/project/${projectId}/versions`),
  generateScript: (projectId: string, body: any) =>
    request<any>(`/scripts/project/${projectId}/generate`, { method: 'POST', body: JSON.stringify(body) }),
  updateScript: (scriptId: string, body: any) =>
    request<any>(`/scripts/${scriptId}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Assets
  getAssets: (projectId: string, params?: { folder?: string; q?: string; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/assets/project/${projectId}${query ? `?${query}` : ''}`);
  },
  uploadAssets: (projectId: string, formData: FormData) =>
    request<any[]>(`/assets/project/${projectId}/upload`, { method: 'POST', body: formData }),
  updateAsset: (assetId: string, body: any) =>
    request<any>(`/assets/${assetId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAsset: (assetId: string) => request<any>(`/assets/${assetId}`, { method: 'DELETE' }),

  // Footage & Matching
  getFootageAnalysis: (assetId: string) => request<any>(`/footage/asset/${assetId}`),
  getAllProjectAnalyses: (projectId: string) => request<any[]>(`/footage/project/${projectId}`),
  analyzeFootage: (assetId: string) => request<any>(`/footage/asset/${assetId}/analyze`, { method: 'POST' }),
  matchScriptToFootage: (projectId: string) => request<any[]>(`/footage/project/${projectId}/match-script`, { method: 'POST' }),
  updateProposedClipStatus: (clipId: string, status: string) =>
    request<any>(`/footage/proposed-clip/${clipId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Timeline & Editing
  getCurrentTimeline: (projectId: string) => request<any>(`/timeline/project/${projectId}/current`),
  getTimelineVersions: (projectId: string) => request<any[]>(`/timeline/project/${projectId}/versions`),
  createAutoDraft: (projectId: string) => request<any>(`/timeline/project/${projectId}/auto-draft`, { method: 'POST' }),
  chatToEdit: (projectId: string, command: string) =>
    request<any>(`/timeline/project/${projectId}/chat-edit`, { method: 'POST', body: JSON.stringify({ command }) }),
  updateTimeline: (timelineId: string, body: any) =>
    request<any>(`/timeline/${timelineId}`, { method: 'PUT', body: JSON.stringify(body) }),
  getReplaceCandidates: (projectId: string, clipId: string, currentAssetId: string, query?: string) =>
    request<any[]>(`/timeline/project/${projectId}/replace-candidates`, {
      method: 'POST',
      body: JSON.stringify({ clipId, currentAssetId, query }),
    }),
  revertTimelineVersion: (projectId: string, version: number) =>
    request<any>(`/timeline/project/${projectId}/revert/${version}`, { method: 'POST' }),

  // Export & Background Jobs
  renderVideoExport: (projectId: string, body: { aspectRatio?: string; format?: string }) =>
    request<any>(`/export/project/${projectId}/render`, { method: 'POST', body: JSON.stringify(body) }),
  getJobStatus: (jobId: string) => request<any>(`/jobs/${jobId}`),

  // Creator Intelligence Tools
  getPlatformAdaptation: (projectId: string) =>
    request<any>(`/creator/project/${projectId}/platform-adaptation`, { method: 'POST' }),
  getThumbnailConcepts: (projectId: string) =>
    request<any[]>(`/creator/project/${projectId}/thumbnail-concepts`, { method: 'POST' }),
  getCaptionAndPost: (projectId: string, platform = 'reels') =>
    request<any>(`/creator/project/${projectId}/caption-generator`, { method: 'POST', body: JSON.stringify({ platform }) }),

  // Workflow (Kanban & Calendar)
  getWorkflowTasks: (projectId: string) => request<any[]>(`/workflow/project/${projectId}`),
  createWorkflowTask: (projectId: string, body: any) =>
    request<any>(`/workflow/project/${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateWorkflowTask: (taskId: string, body: any) =>
    request<any>(`/workflow/${taskId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteWorkflowTask: (taskId: string) => request<any>(`/workflow/${taskId}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () => request<any>('/analytics'),
  addAnalyticsEntry: (body: any) => request<any>('/analytics/entry', { method: 'POST', body: JSON.stringify(body) }),
  seedSampleAnalytics: () => request<any>('/analytics/seed-sample', { method: 'POST' }),
};
