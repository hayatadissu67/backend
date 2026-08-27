import axios from 'axios';
import { Project, RiskItem, TaskItem, BudgetItem, ChangeRequestItem, ReportItem, ReportTemplate, UserItem, UserRoleType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      // Clear token on 401 if unauthenticated
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const checkApiHealth = async () => {
  try {
    const res = await axios.get(API_BASE_URL.replace('/api', '') + '/');
    return res.data;
  } catch (err) {
    console.warn('Backend API offline or unreachable:', err);
    return null;
  }
};

// --- Authentication API ---
export const loginApi = async (email: string, password: string, role?: UserRoleType) => {
  const res = await api.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
    role,
  });
  return res.data;
};

export const getCurrentUserApi = async (): Promise<UserItem | null> => {
  try {
    const res = await api.get('/auth/me');
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to fetch current user profile:', err);
    return null;
  }
};

export const changePasswordApi = async (currentPassword: string, newPassword: string) => {
  const res = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return res.data;
};

export const logoutApi = async () => {
  try {
    const res = await api.post('/auth/logout');
    return res.data;
  } catch (err) {
    return { success: true };
  }
};


// --- Users Management API ---
export const fetchUsersFromApi = async (): Promise<UserItem[] | null> => {
  try {
    const res = await api.get('/users');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch users from API:', err);
    return null;
  }
};

export interface CreateUserResponse {
  success: boolean;
  message?: string;
  data: UserItem;
  temporaryPassword?: string;
}

export const createUserApi = async (userData: Partial<UserItem>): Promise<CreateUserResponse | null> => {
  try {
    const res = await api.post('/users', userData);
    return res.data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to create user.';
    throw new Error(message);
  }
};

export const updateUserApi = async (id: string | number, userData: Partial<UserItem>): Promise<UserItem | null> => {
  try {
    const res = await api.put(`/users/${id}`, userData);
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to update user.';
    throw new Error(message);
  }
};

export const updateUserStatusApi = async (id: string | number, status: UserItem['status']): Promise<boolean> => {
  try {
    const res = await api.patch(`/users/${id}/status`, { status });
    return !!res.data?.success;
  } catch (err: any) {
    console.warn('Failed to update user status:', err);
    return false;
  }
};

export const deleteUserApi = async (id: string | number): Promise<boolean> => {
  try {
    const res = await api.delete(`/users/${id}`);
    return !!res.data?.success;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to delete user.';
    throw new Error(message);
  }
};

// --- Projects API ---
export const fetchProjectsFromApi = async (): Promise<Project[] | null> => {
  try {
    const res = await api.get('/projects');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch projects from API:', err);
    return null;
  }
};

export const createProjectApi = async (projectData: Partial<Project>): Promise<Project | null> => {
  try {
    const res = await api.post('/projects', projectData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create project via API:', err);
    return null;
  }
};

export const updateProjectApi = async (id: string, projectData: Partial<Project>): Promise<Project | null> => {
  try {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update project via API:', err);
    return null;
  }
};

// --- Risks API ---
export const fetchRisksFromApi = async (): Promise<RiskItem[] | null> => {
  try {
    const res = await api.get('/risks');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch risks from API:', err);
    return null;
  }
};

export const createRiskApi = async (riskData: Partial<RiskItem>): Promise<RiskItem | null> => {
  try {
    const res = await api.post('/risks', riskData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create risk via API:', err);
    return null;
  }
};

export const updateRiskApi = async (id: string, riskData: Partial<RiskItem>): Promise<RiskItem | null> => {
  try {
    const res = await api.put(`/risks/${id}`, riskData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update risk via API:', err);
    return null;
  }
};

// --- Tasks API ---
export const fetchTasksFromApi = async (): Promise<TaskItem[] | null> => {
  try {
    const res = await api.get('/tasks');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch tasks from API:', err);
    return null;
  }
};

export const createTaskApi = async (taskData: Partial<TaskItem>): Promise<TaskItem | null> => {
  try {
    const res = await api.post('/tasks', taskData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create task via API:', err);
    return null;
  }
};

export const updateTaskApi = async (id: string, taskData: Partial<TaskItem>): Promise<TaskItem | null> => {
  try {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update task via API:', err);
    return null;
  }
};

// --- Budgets API ---
export const fetchBudgetsFromApi = async (): Promise<BudgetItem[] | null> => {
  try {
    const res = await api.get('/budgets');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch budgets from API:', err);
    return null;
  }
};

// --- Change Requests API ---
export const fetchChangeRequestsFromApi = async (): Promise<ChangeRequestItem[] | null> => {
  try {
    const res = await api.get('/change-requests');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch change requests from API:', err);
    return null;
  }
};

// --- Templates API ---
export const fetchTemplatesApi = async (): Promise<ReportTemplate[] | null> => {
  try {
    const res = await api.get('/templates');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch templates from API:', err);
    return null;
  }
};

export const createTemplateApi = async (formData: FormData): Promise<ReportTemplate | null> => {
  try {
    const res = await api.post('/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create template via API:', err);
    return null;
  }
};

export const updateTemplateApi = async (id: string, formData: FormData): Promise<ReportTemplate | null> => {
  try {
    const res = await api.put(`/templates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update template via API:', err);
    return null;
  }
};

export const createTemplateVersionApi = async (id: string, formData: FormData): Promise<ReportTemplate | null> => {
  try {
    const res = await api.post(`/templates/${id}/version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create template version via API:', err);
    return null;
  }
};

export const deleteTemplateApi = async (id: string): Promise<boolean> => {
  try {
    const res = await api.delete(`/templates/${id}`);
    return res.data?.success;
  } catch (err) {
    console.warn('Failed to delete template via API:', err);
    return false;
  }
};


// --- Reports API ---
export const fetchReportsApi = async (): Promise<ReportItem[] | null> => {
  try {
    const res = await api.get('/reports');
    return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch reports from API:', err);
    return null;
  }
};

export const createReportApi = async (formData: FormData): Promise<ReportItem | null> => {
  try {
    const res = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create report via API:', err);
    return null;
  }
};

export const updateReportApi = async (id: string, formData: FormData): Promise<ReportItem | null> => {
  try {
    const res = await api.put(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update report via API:', err);
    return null;
  }
};

export const deleteReportApi = async (id: string): Promise<boolean> => {
  try {
    const res = await api.delete(`/reports/${id}`);
    return res.data?.success;
  } catch (err) {
    console.warn('Failed to delete report via API:', err);
    return false;
  }
};

export default api;
