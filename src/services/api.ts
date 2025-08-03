const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }
}

const apiService = new ApiService();

export const auth = {
  async signUp(credentials) {
    return apiService.request('/auth/signup', {
      method: 'POST',
      body: credentials,
    });
  },

  async signIn(credentials) {
    return apiService.request('/auth/signin', {
      method: 'POST',
      body: credentials,
    });
  },

  async connectGoogle(options) {
    return apiService.request('/auth/google', {
      method: 'POST',
      body: options,
    });
  },
};

export const calendar = {
  async listCalendars() {
    return apiService.request('/calendar/list');
  },
};

export const mail = {
  async sync(options) {
    return apiService.request('/mail/sync', {
      method: 'POST',
      body: { ...options, limit: 200 },
    });
  },
};

export const accounts = {
  async getConnectedAccounts() {
    return apiService.request('/accounts/connected');
  },

  async disconnectAccount(accountId) {
    return apiService.request(`/accounts/${accountId}/disconnect`, {
      method: 'DELETE',
    });
  },
};

export const tasks = {
  async getTasks() {
    return apiService.request('/tasks');
  },

  async createTask(taskData) {
    return apiService.request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  async updateTask(taskId, updates) {
    return apiService.request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  async deleteTask(taskId) {
    return apiService.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async getTasksByPriority(priority) {
    return apiService.request(`/tasks?priority=${priority}`);
  },
};