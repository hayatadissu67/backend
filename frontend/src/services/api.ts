import axios from 'axios';
import { UserItem } from '../types';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
	timeout: 20000,
	withCredentials: false,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (!error.response && error.message) {
			error.message = `Network error: cannot reach ${api.defaults.baseURL}. Verify the backend is running on port 5000.`;
		}
		return Promise.reject(error);
	}
);

const data = (response: any) => response.data?.data ?? response.data;
const get = async (path: string) => data(await api.get(path));
const safeGet = async (path: string) => {
	try {
		return await get(path);
	} catch (error) {
		console.warn(`Failed to load ${path}:`, error);
		return null;
	}
};
const post = async (path: string, body: any) => data(await api.post(path, body));
const put = async (path: string, body: any) => data(await api.put(path, body));
const patch = async (path: string, body?: any) => data(await api.patch(path, body));

export const loginApi = async (email: string, password: string) => (await api.post('/auth/login', { email, password })).data;
export const getCurrentUserApi = async () => get('/auth/me');
export const changePasswordApi = async (currentPassword: string, newPassword: string) => post('/auth/change-password', { currentPassword, newPassword });

export const fetchProjectsFromApi = async () => safeGet('/projects');
export const createProjectApi = async (body: any) => {
	try {
		return await post('/projects', body);
	} catch (err: any) {
		throw new Error(err.response?.data?.message || err.message || 'Failed to create project.');
	}
};
export const updateProjectApi = async (id: string, body: any) => put(`/projects/${id}`, body);
export const approveProjectApi = async (id: string) => patch(`/projects/${id}/approve`);
export const rejectProjectApi = async (id: string, rejectionReason: string) => patch(`/projects/${id}/reject`, { rejectionReason });
export const assignProjectTeamMembersApi = async (id: string, userIds: string[]) => post(`/projects/${id}/team`, { userIds });
export const getProjectTeamApi = async (id: string): Promise<UserItem[]> => get(`/projects/${id}/team`);
export const assignProjectTeamApi = async (id: string, userIds: (string | number)[]) => post(`/projects/${id}/team`, { userIds });

export const fetchRisksFromApi = async () => safeGet('/risks');
export const createRiskApi = async (body: any) => post('/risks', body);
export const updateRiskApi = async (id: string, body: any) => put(`/risks/${id}`, body);
export const fetchTasksFromApi = async () => safeGet('/tasks');
export const createTaskApi = async (body: any) => post('/tasks', body);
export const updateTaskApi = async (id: string, body: any) => put(`/tasks/${id}`, body);
export const fetchBudgetsFromApi = async () => safeGet('/budgets');
export const fetchChangeRequestsFromApi = async () => safeGet('/change-requests');
export const createChangeRequestApi = async (body: any) => post('/change-requests', body);
export const approveChangeRequestApi = async (id: string) => patch(`/change-requests/${id}/approve`);
export const rejectChangeRequestApi = async (id: string, reason: string) => patch(`/change-requests/${id}/reject`, { reason });

export const fetchUsersFromApi = async () => safeGet('/users');
export const createUserApi = async (body: any) => post('/users', body);
export const deleteUserApi = async (id: string | number) => { await api.delete(`/users/${id}`); return true; };
export const updateUserStatusApi = async (id: string | number, status: string) => patch(`/users/${id}/status`, { status });
export const updateUserApi = async (id: string, body: any) => put(`/users/${id}`, body);
export const fetchDepartmentLoadingApi = async () => safeGet('/resources/loading');
export const fetchResourcesFromApi = async () => safeGet('/resources');
export const createResourceApi = async (body: any) => post('/resources', body);
export const createAssignmentRequestApi = async (body: any) => post('/resources/assignment-requests', body);

const normalizeTemplate = (template: any) => ({ ...template, id: String(template.id), name: template.name || template.title, code: template.code || template.templateCode, updatedAt: template.updatedAt || template.createdAt });
export const fetchTemplatesApi = async () => { const result = await safeGet('/templates'); return Array.isArray(result) ? result.map(normalizeTemplate) : []; };
export const createTemplateApi = async (body: FormData) => normalizeTemplate(await post('/templates', body));
export const updateTemplateApi = async (id: string, body: FormData) => normalizeTemplate(await put(`/templates/${id}`, body));
export const deleteTemplateApi = async (id: string) => { const response = await api.delete(`/templates/${id}`); return !!response.data?.success; };

export const fetchReportsApi = async () => safeGet('/reports');
export const createReportApi = async (body: FormData) => post('/reports', body);
export const updateReportApi = async (id: string, body: FormData) => {
  try {
    return await put(`/reports/${id}`, body);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || 'Failed to update report.');
  }
};
export const deleteReportApi = async (id: string) => { const response = await api.delete(`/reports/${id}`); return !!response.data?.success; };

export const fetchDiscussionsApi = async () => safeGet('/communication/discussions');
export const createDiscussionApi = async (body: any) => post('/communication/discussions', body);
export const fetchMeetingsApi = async () => safeGet('/communication/meetings');
export const createMeetingApi = async (body: any) => post('/communication/meetings', body);
export const fetchNotificationsApi = async () => safeGet('/notifications');
export const markNotificationsReadApi = async () => patch('/notifications/read');
export const clearNotificationsApi = async () => patch('/notifications/clear');
export const fetchChannelsApi = async () => safeGet('/communication/channels');
export const createChannelApi = async (body: any) => post('/communication/channels', body);
export const fetchMessagesApi = async (id?: string) => get(id ? `/communication/channels/${id}/messages` : '/communication/messages');
export const createMessageApi = async (messageOrChannel: any, body?: any) => post(body === undefined ? '/communication/messages' : `/communication/channels/${messageOrChannel}/messages`, body === undefined ? messageOrChannel : body);
export const fetchDocumentsApi = async () => get('/communication/documents');
export const createDocumentApi = async (body: any) => post('/communication/documents', body);
export const deleteDocumentApi = async (id: string) => { await api.delete(`/communication/documents/${id}`); return true; };

export const fetchExecutiveRequestsApi = async () => safeGet('/executive-requests');
export const fetchPendingExecutiveRequestsApi = async () => safeGet('/executive-requests/pending');
export const fetchExecutiveAuditLogApi = async () => safeGet('/executive-requests/audit');
export const createExecutiveRequestApi = async (body: any) => post('/executive-requests', body);
export const approveExecutiveRequestApi = async (id: string) => patch(`/executive-requests/${id}/approve`);
export const rejectExecutiveRequestApi = async (id: string, reason: string) => patch(`/executive-requests/${id}/reject`, { rejectionReason: reason });

export const fetchAuditLogsApi = async () => safeGet('/audit-logs');
