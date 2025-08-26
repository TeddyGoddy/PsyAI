import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

export const aiService = {
  async analyzeText(text, analysisType = 'general', userType) {
    const response = await api.post('/ai/analyze', {
      text,
      analysisType,
      userType
    });
    return response.data;
  },

  async generateQuestions(context, previousAnswers = [], userType, sessionType = 'journaling') {
    const response = await api.post('/ai/generate-questions', {
      context,
      previousAnswers,
      userType,
      sessionType
    });
    return response.data;
  },

  async generateWhatIfScenarios(baseScenario, context, userType) {
    const response = await api.post('/ai/what-if-scenarios', {
      baseScenario,
      context,
      userType
    });
    return response.data;
  },

  async extractThemes(texts, userType) {
    const response = await api.post('/ai/extract-themes', {
      texts,
      userType
    });
    return response.data;
  }
};

export const analysisService = {
  async uploadDocument(file, analysisType = 'general', notes = '') {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('analysisType', analysisType);
    formData.append('notes', notes);

    const response = await api.post('/analysis/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async createVisualization(dataType, sessionIds = [], timeRange = null, userType) {
    const response = await api.post('/analysis/create-visualization', {
      dataType,
      sessionIds,
      timeRange,
      userType
    });
    return response.data;
  },

  async generateReport(sessionIds = [], timeRange = null, reportType = 'executive') {
    const response = await api.post('/analysis/generate-report', {
      sessionIds,
      timeRange,
      reportType
    });
    return response.data;
  }
};

export const dataService = {
  async getSessions(page = 1, limit = 10, startDate = null, endDate = null) {
    const params = new URLSearchParams({ page, limit });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/data/sessions?${params}`);
    return response.data;
  },

  async saveSession(sessionData) {
    const response = await api.post('/data/sessions', sessionData);
    return response.data;
  },

  async getInsights(timeRange = '30d', category = null) {
    const params = new URLSearchParams({ timeRange });
    if (category) params.append('category', category);

    const response = await api.get(`/data/insights?${params}`);
    return response.data;
  },

  async getTimeline(startDate = null, endDate = null, granularity = 'daily') {
    const params = new URLSearchParams({ granularity });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/data/timeline?${params}`);
    return response.data;
  }
};

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updatePreferences(preferences) {
    const response = await api.put('/users/preferences', { preferences });
    return response.data;
  }
};

export default api;
