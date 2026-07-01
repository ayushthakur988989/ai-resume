const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.PROD
  ? 'https://ai-resume-api-unl26.onrender.com'
  : 'http://localhost:5000';

const apiBaseUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, '');
const API_URL = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`;
const USER_KEY = 'ai_resume_builder_user';
const TOKEN_KEY = 'ai_resume_builder_token';

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function saveSession({ user, token }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  return user;
}

export async function registerUser(details) {
  return saveSession(await request('/auth/register', { method: 'POST', body: JSON.stringify(details) }));
}

export async function loginUser(credentials) {
  return saveSession(await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }));
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export const getResumes = () => request('/resumes');
export const getResumeById = (id) => request(`/resumes/${encodeURIComponent(id)}`);
export const saveResume = (resume) => request(`/resumes/${encodeURIComponent(resume.id)}`, { method: 'PUT', body: JSON.stringify(resume) });
export const deleteResume = (id) => request(`/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' });

export function generateId() {
  return `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
