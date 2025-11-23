import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request:', config.url); // DEBUG
        } else {
            console.log('No token found for request:', config.url); // DEBUG
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error); // DEBUG
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.log('Response error:', {
            url: originalRequest.url,
            status: error.response?.status,
            message: error.response?.data
        }); // DEBUG

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (!refreshToken) {
                    console.log('No refresh token available'); // DEBUG
                    throw new Error('No refresh token');
                }

                console.log('Attempting token refresh...'); // DEBUG
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                console.log('Token refreshed successfully'); // DEBUG

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// API functions
export const authAPI = {
    login: (username, password) => api.post('/auth/login/', { username, password }),
    register: (userData, userType) => {
        const endpoint = userType === 'citizen' ? '/auth/register/citizen/' : '/auth/register/lawyer/';
        return api.post(endpoint, userData);
    },
    getCurrentUser: (token) => {
        // Option to pass token explicitly
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return api.get('/auth/me/', config);
    },
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

// Add this to your lawyerAPI object in api.js
export const lawyerAPI = {
    getAll: (params) => api.get('/lawyers/', { params }),
    getById: (id) => api.get(`/lawyers/${id}/`),
    verify: (id) => api.post(`/lawyers/${id}/verify/`),
    reject: (id, data) => api.post(`/lawyers/${id}/reject/`, data),
    unverified: () => api.get('/lawyers/unverified/'),
};

export const adminAPI = {
    getStats: () => api.get('/admin/dashboard/'),
    getPendingLawyers: () => api.get('/admin/dashboard/pending_lawyers/'),
    getRecentActivity: () => api.get('/admin/dashboard/recent_activity/'),
};

export const specialtyAPI = {
    getAll: () => api.get('/specialties/'),
};

// Case Request API
export const caseRequestAPI = {
    // Get all case requests (for current user)
    getAll: () => api.get('/case-requests/'),
    
    // Get single case request
    getById: (id) => api.get(`/case-requests/${id}/`),
    
    // Create new case request (citizen only)
    create: (data) => api.post('/case-requests/', data),
    
    // Lawyer actions
    accept: (id, message) => api.post(`/case-requests/${id}/accept/`, { message }),
    reject: (id, message) => api.post(`/case-requests/${id}/reject/`, { message }),
    startProgress: (id) => api.post(`/case-requests/${id}/start_progress/`),
    complete: (id) => api.post(`/case-requests/${id}/complete/`),
    // Mark as viewed (citizen only) - ADD THIS
    markViewed: (id) => api.post(`/case-requests/${id}/mark_viewed/`),
};

// Messaging API
export const messageAPI = {
    // Get all messages for a case request
    getByCaseRequest: (caseRequestId) => api.get(`/messages/by_case/?case_request_id=${caseRequestId}`),
    
    // Send a new message with optional file
    send: (data) => {
        // If there's a file, use FormData
        if (data.attachment) {
            const formData = new FormData();
            formData.append('case_request', data.case_request);
            formData.append('content', data.content);
            formData.append('attachment', data.attachment);
            
            return api.post('/messages/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        // Otherwise send as JSON
        return api.post('/messages/', data);
    },
    
    // Get all messages (for current user)
    getAll: () => api.get('/messages/'),
};

// Case API
export const caseAPI = {
    getAll: () => api.get('/cases/'),
    getById: (id) => api.get(`/cases/${id}/`),
    create: (data) => api.post('/cases/', data),
};

// Hearing API
export const hearingAPI = {
    getAll: () => api.get('/hearings/'),
    getById: (id) => api.get(`/hearings/${id}/`),
    create: (data) => api.post('/hearings/', data),
    update: (id, data) => api.put(`/hearings/${id}/`, data),
    delete: (id) => api.delete(`/hearings/${id}/`),
};

// Case Update API
export const caseUpdateAPI = {
    getAll: () => api.get('/case-updates/'),
    getById: (id) => api.get(`/case-updates/${id}/`),
    create: (data) => api.post('/case-updates/', data),
};

export const knowledgeBaseAPI = {
  // Get all categories
  getCategories: () => api.get('/knowledge-base/categories/'),

  // Get all articles
  getAllArticles: () => api.get('/knowledge-base/articles/'),

  // Search articles with filters
  searchArticles: (params) => api.get('/knowledge-base/articles/search/', { params }),

  // Get single article detail
  getArticleDetail: (id) => api.get(`/knowledge-base/articles/${id}/`),
};

