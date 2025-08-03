const API_BASE_URL = 'http://localhost:3001/api';

interface Credentials {
  email: string;
  password: string;
}

interface GoogleConnectOptions {
  type: 'workspace' | 'personal';
}

interface SyncOptions {
  limit?: number;
  accountId?: string;
  filters?: Record<string, boolean>;
  workingHours?: {
    start: string;
    end: string;
  };
  calendar?: any;
}

interface TaskData {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt?: string;
}

export const auth = {
  async signUp(credentials: Credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Signup failed');
    }
    
    return response.json();
  },

  async signIn(credentials: Credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  async connectGoogle(options: GoogleConnectOptions) {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      throw new Error('Google connection failed');
    }
    
    return response.json();
  },
};

export const calendar = {
  async listCalendars() {
    const response = await fetch(`${API_BASE_URL}/calendar/list`);
    
    if (!response.ok) {
      throw new Error('Failed to load calendars');
    }
    
    return response.json();
  },
};

export const mail = {
  async sync(options: SyncOptions = {}) {
    const response = await fetch(`${API_BASE_URL}/mail/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...options, limit: 200 })
    });
    
    if (!response.ok) {
      throw new Error('Email sync failed');
    }
    
    return response.json();
  },
};

export const accounts = {
  async getConnectedAccounts() {
    const response = await fetch(`${API_BASE_URL}/accounts/connected`);
    
    if (!response.ok) {
      throw new Error('Failed to load connected accounts');
    }
    
    return response.json();
  },

  async disconnectAccount(accountId: string) {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/disconnect`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect account');
    }
    
    return response.json();
  },
};

export const tasks = {
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    
    if (!response.ok) {
      throw new Error('Failed to load tasks');
    }
    
    return response.json();
  },

  async createTask(taskData: TaskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return response.json();
  },

  async updateTask(taskId: string, updates: Partial<TaskData>) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return response.json();
  },

  async deleteTask(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return response.json();
  },

  async getTasksByPriority(priority: 'high' | 'medium' | 'low') {
    const response = await fetch(`${API_BASE_URL}/tasks?priority=${priority}`);
    
    if (!response.ok) {
      throw new Error('Failed to load tasks by priority');
    }
    
    return response.json();
  },
};