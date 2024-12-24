const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
    BASE_URL: API_BASE_URL,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    DASHBOARD_ACTIVITIES: `${API_BASE_URL}/admin/dashboard/activities`,
    COMMANDES_STATS: `${API_BASE_URL}/admin/dashboard/commandes/stats`,
    RECLAMATIONS_STATS: `${API_BASE_URL}/admin/dashboard/reclamations/stats`,
    USER_COMMANDES: `${API_BASE_URL}/commandes/user`,
    USER_RECLAMATIONS: `${API_BASE_URL}/reclamations/user`,
};

export default API_ENDPOINTS;
