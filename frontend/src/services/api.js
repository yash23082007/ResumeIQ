/**
 * ResumeIQ — API Client
 * Axios-based with JWT interceptor
 */

import axios from 'axios';

const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '') 
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── JWT Interceptor ─────────────────────────
api.interceptors.request.use((config) => {
  // Relying entirely on HttpOnly cookie set by backend; no localStorage
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      // Clear user data
      localStorage.removeItem('resumeiq_user');
      if (window.location.pathname !== '/auth') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/auth');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────
export const authAPI = {
  register: (email, password) =>
    api.post('/auth/register', { email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me', { skipAuthRedirect: true }),
  logout: () => api.post('/auth/logout'),
};

// ─── Resumes ─────────────────────────────────
export const resumeAPI = {
  list: () => api.get('/resumes'),
  get: (id) => api.get(`/resumes/${id}`),
  upload: (file, label) => {
    const formData = new FormData();
    formData.append('file', file);
    if (label) formData.append('label', label);
    return api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze: (id, jobDescriptionId = null) =>
    api.post(`/resumes/${id}/analyze`, { jobDescriptionId }),
  getVersions: (id) => api.get(`/resumes/${id}/versions`),
  getHeatmap: (id) => api.get(`/resumes/${id}/heatmap`),
  getATSSimulation: (id) => api.get(`/resumes/${id}/ats-simulation`),
  getInterviewQuestions: (id) => api.get(`/resumes/${id}/interview-questions`),
  tailor: (id, jdId) => api.post(`/resumes/${id}/tailor/${jdId}`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// ─── Analysis ────────────────────────────────
export const analysisAPI = {
  get: (id) => api.get(`/analyses/${id}`),
  list: () => api.get('/analyses'),
  poll: async (id, options = {}) => {
    const { maxAttempts = 30, interval = 2000, signal, onProgress } = options;
    for (let i = 0; i < maxAttempts; i++) {
      if (signal?.aborted) throw new Error('Polling cancelled');
      const { data } = await api.get(`/analyses/${id}`, { signal });
      if (onProgress && data.progress) onProgress(data.progress);
      if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
        return data;
      }
      if (data.status === 'stale') {
        throw new Error('Analysis job is stale');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Analysis timed out');
  },
};

// ─── Job Descriptions ────────────────────────
export const jobAPI = {
  list: () => api.get('/job-descriptions'),
  create: (title, company, rawText) =>
    api.post('/job-descriptions', { title, company, rawText }),
  delete: (id) => api.delete(`/job-descriptions/${id}`),
  match: (resumeId, jdId) =>
    api.post(`/resumes/${resumeId}/match/${jdId}`),
  coverLetter: (resumeId, jdId) =>
    api.post(`/resumes/${resumeId}/cover-letter/${jdId}`),
};

// ─── Contact ─────────────────────────────────
export const contactAPI = {
  submit: (name, email, subject, message) =>
    api.post('/contact', { name, email, subject, message }),
};

export default api;
