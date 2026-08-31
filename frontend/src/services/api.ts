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

export const assignProjectTeamMembersApi = async (id: string, userIds: string[]) => {
  try {
    const res = await api.post(`/projects/${id}/team`, { userIds });
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to assign team members.';
    throw new Error(message);
  }
};

export const approveProjectApi = async (id: string): Promise<Project | null> => {
  try {
    const res = await api.patch(`/projects/${id}/approve`);
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to approve project.';
    throw new Error(message);
  }
};

export const rejectProjectApi = async (id: string, rejectionReason: string): Promise<Project | null> => {
  try {
    const res = await api.patch(`/projects/${id}/reject`, { rejectionReason });
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to reject project.';
    throw new Error(message);
  }
};

export const getProjectTeamApi = async (id: string): Promise<UserItem[] | null> => {
  try {
    const res = await api.get(`/projects/${id}/team`);
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch project team:', err);
    return null;
  }
};

export const assignProjectTeamApi = async (id: string, userIds: (string | number)[]): Promise<UserItem[] | null> => {
  try {
    const res = await api.post(`/projects/${id}/team`, { userIds });
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to assign team members.';
    throw new Error(message);
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

export const createChangeRequestApi = async (data: Partial<ChangeRequestItem>): Promise<ChangeRequestItem | null> => {
  try {
    const res = await api.post('/change-requests', data);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to create change request via API:', err);
    return null;
  }
};

export const updateChangeRequestApi = async (id: string, data: Partial<ChangeRequestItem>): Promise<ChangeRequestItem | null> => {
  try {
    const res = await api.put(`/change-requests/${id}`, data);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('Failed to update change request via API:', err);
    return null;
  }
};

export const approveChangeRequestApi = async (id: string): Promise<ChangeRequestItem | null> => {
  try {
    const res = await api.patch(`/change-requests/${id}/approve`);
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to approve change request.';
    throw new Error(message);
  }
};

export const rejectChangeRequestApi = async (id: string, rejectionReason: string): Promise<ChangeRequestItem | null> => {
  try {
    const res = await api.patch(`/change-requests/${id}/reject`, { rejectionReason });
    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to reject change request.';
    throw new Error(message);
  }
};

export const deleteChangeRequestApi = async (id: string): Promise<boolean> => {
  try {
    const res = await api.delete(`/change-requests/${id}`);
    return !!res.data?.success;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to delete change request.';
    throw new Error(message);
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

// --- Communication API ---
export const fetchChannelsApi = async () => {
  try {
    const res = await api.get('/communication/channels');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch channels:', err);
    return [];
  }
};

export const createChannelApi = async (channelData: any) => {
  try {
    const res = await api.post('/communication/channels', channelData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating channel:', err);
    return null;
  }
};

export const fetchMessagesApi = async () => {
  try {
    const res = await api.get('/communication/messages');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch messages:', err);
    return [];
  }
};

export const createMessageApi = async (messageData: any) => {
  try {
    const res = await api.post('/communication/messages', messageData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating message:', err);
    return null;
  }
};

export const fetchDiscussionsApi = async () => {
  try {
    const res = await api.get('/communication/discussions');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch discussions:', err);
    return [];
  }
};

export const createDiscussionApi = async (discussionData: any) => {
  try {
    const res = await api.post('/communication/discussions', discussionData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating discussion:', err);
    return null;
  }
};

<<<<<<< Updated upstream
=======
export const fetchDocumentsApi = async () => {
  try {
    const res = await api.get('/communication/documents');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch documents:', err);
    return [];
  }
};

export const createDocumentApi = async (formData: FormData) => {
  try {
    const res = await api.post('/communication/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating document:', err);
    return null;
  }
};

export const deleteDocumentApi = async (id: string) => {
  try {
    const res = await api.delete(`/communication/documents/${id}`);
    return res.data?.success;
  } catch (err) {
    console.error('API Error deleting document:', err);
    return false;
  }
};

>>>>>>> Stashed changes
export const fetchMeetingsApi = async () => {
  try {
    const res = await api.get('/communication/meetings');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch meetings:', err);
    return [];
  }
};

export const createMeetingApi = async (meetingData: any) => {
  try {
    const res = await api.post('/communication/meetings', meetingData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating meeting:', err);
    return null;
  }
};

export const fetchNotificationsApi = async () => {
  try {
    const res = await api.get('/communication/notifications');
    return res.data?.success ? res.data.data : [];
  } catch (err) {
    console.warn('Failed to fetch notifications:', err);
    return [];
  }
};

export const createNotificationApi = async (notificationData: any) => {
  try {
    const res = await api.post('/communication/notifications', notificationData);
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.error('API Error creating notification:', err);
    return null;
  }
};

export const markNotificationsReadApi = async () => {
  try {
    const res = await api.put('/communication/notifications/read');
    return res.data?.success;
  } catch (err) {
    console.error('API Error marking notifications read:', err);
    return false;
  }
};

export const clearNotificationsApi = async () => {
  try {
    const res = await api.delete('/communication/notifications/clear');
    return res.data?.success;
  } catch (err) {
    console.error('API Error clearing notifications:', err);
    return false;
  }
};

export default api;
