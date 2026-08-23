/**
 * ResumeIQ — API Client
 * Axios-based with JWT interceptor
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── JWT Interceptor ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resumeiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('resumeiq_token');
      localStorage.removeItem('resumeiq_user');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
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
};

// ─── Analysis ────────────────────────────────
export const analysisAPI = {
  get: (id) => api.get(`/analyses/${id}`),

  list: () => api.get('/analyses'),

  poll: async (id, maxAttempts = 30, interval = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
      const { data } = await api.get(`/analyses/${id}`);
      if (data.status === 'completed' || data.status === 'failed') {
        return data;
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

  match: (resumeId, jdId) =>
    api.post(`/resumes/${resumeId}/match/${jdId}`),

  coverLetter: (resumeId, jdId) =>
    api.post(`/resumes/${resumeId}/cover-letter/${jdId}`),
};

export default api;
