import axios from 'axios';

const API_BASE_URL = 'https://api.tidymailr.com';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  isLoggedIn: boolean;
  id: number;
  name: string;
  username: string;
  email: string;
  google_email_personal: string;
  google_email_business: string;
  token: string;
}

interface GoogleConnectStartOptions {
  type: 'workspace' | 'personal';
}

interface GoogleSaveTokenOptions {
  type: 'personal' | 'business';
  code: string; // OAuth authorization code (when returning from Google)
  user_id: number | string;
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
  // api needed
  async signUp(credentials: Credentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/auth/signup',
        credentials
      );

      // Save auth token if returned from signup
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error('Signup failed');
    }
  },

  // api needed
  async updateProfile(payload: {
    user_id: number | string;
    name?: string;
    username?: string;
  }) {
    try {
      const response = await axiosInstance.post('/user/update', payload);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  },

  async signIn(credentials: Credentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/login',
        credentials
      );

      // Save auth token from login response
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  },

  async connectGoogle(options: GoogleConnectStartOptions) {
    try {
      // Start Google connect flow (server may respond with a redirect URL)
      const response = await axiosInstance.post('/auth/google', options);
      return response.data;
    } catch (error) {
      throw new Error('Google connection failed');
    }
  },

  async saveGoogleToken(options: GoogleSaveTokenOptions) {
    try {
      // Exchange Google auth code and save token for given account type
      const response = await axiosInstance.post(
        '/mail/api/save-token',
        options
      );
      return response.data;
    } catch (error) {
      throw new Error('Google connection failed');
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    // You might want to redirect to login page or clear other auth-related data here
  },
};

export const mail = {
  async listEmails(options: {
    user_email: string;
    label: 'INBOX' | 'SENT' | 'DRAFTS';
  }) {
    try {
      const response = await axiosInstance.post(
        '/mail/api/list-emails',
        options
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to load emails');
    }
  },
};

export const accounts = {
  async removeGoogleAccount(payload: {
    email: string;
    user_id: number | string;
  }) {
    try {
      const response = await axiosInstance.post(
        '/mail/api/remove-account', // updated endpoint
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to disconnect Google account');
    }
  },
};

export const tasks = {
  async getTasks(userId: string | number) {
    const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
    if (!numericUserId || Number.isNaN(numericUserId)) {
      throw new Error('Invalid user id');
    }

    try {
      const response = await axiosInstance.get('/task/get_all', {
        params: { user_id: numericUserId },
      });

      const data = response.data;

      // Map backend tasks (priority can be string or number, boolean completed) to frontend shape
      const priorityToText = (p?: number | string): 'high' | 'medium' | 'low' => {
        // Handle string priorities (current API format)
        if (typeof p === 'string') {
          if (p === 'high') return 'high';
          if (p === 'medium') return 'medium';
          if (p === 'low') return 'low';
        }
        // Handle numeric priorities (legacy format)
        if (typeof p === 'number') {
          if (p === 1) return 'high';
          if (p === 2) return 'medium';
          if (p === 3) return 'low';
        }
        return 'low';
      };

      // Map status from API format to frontend format
      const statusToText = (status?: string | number | boolean): 'pending' | 'in-progress' | 'completed' => {
        // Handle boolean completed field (legacy)
        if (typeof status === 'boolean') {
          return status ? 'completed' : 'pending';
        }
        // Handle numeric status (current API format: 0=pending, 1=in-progress, 2=completed)
        if (typeof status === 'string' || typeof status === 'number') {
          const numStatus = typeof status === 'string' ? parseInt(status, 10) : status;
          if (numStatus === 0) return 'pending';
          if (numStatus === 1) return 'in-progress';
          if (numStatus === 2) return 'completed';
        }
        return 'pending';
      };

      const mapped = Array.isArray(data)
        ? data.map((t: any) => ({
            id: String(
              t.id ??
                t.task_id ??
                crypto?.randomUUID?.() ??
                Math.random().toString(36).slice(2)
            ),
            title: t.title,
            description: t.description ?? undefined,
            priority: priorityToText(t.priority),
            status: statusToText(t.status ?? t.completed),
            createdAt: t.created_at ?? t.createdAt ?? undefined,
          }))
        : Array.isArray(data?.tasks)
          ? data.tasks.map((t: any) => ({
              id: String(
                t.id ??
                  t.task_id ??
                  crypto?.randomUUID?.() ??
                  Math.random().toString(36).slice(2)
              ),
              title: t.title,
              description: t.description ?? undefined,
              priority: priorityToText(t.priority),
              status: statusToText(t.status ?? t.completed),
              createdAt: t.created_at ?? t.createdAt ?? undefined,
            }))
          : [];

      return { tasks: mapped };
    } catch (error) {
      throw new Error('Failed to load tasks');
    }
  },

  async createTask(
    userId: string | number,
    taskData: TaskData & { sourceEmailId?: number; due_date?: string }
  ) {
    const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
    if (!numericUserId || Number.isNaN(numericUserId)) {
      throw new Error('Invalid user id');
    }

    const priorityTextToNum = (p: 'high' | 'medium' | 'low'): number => {
      if (p === 'high') return 1;
      if (p === 'medium') return 2;
      return 3;
    };

    const statusTextToNum = (s: 'pending' | 'in-progress' | 'completed'): number => {
      if (s === 'pending') return 0;
      if (s === 'in-progress') return 1;
      if (s === 'completed') return 2;
      return 0;
    };

    const payload = {
      title: taskData.title,
      user_id: numericUserId,
      sourceEmailId: taskData.sourceEmailId,
      description: taskData.description ?? '',
      status: statusTextToNum(taskData.status),
      priority: priorityTextToNum(taskData.priority),
      due_date: (taskData as any).due_date, // optional
    };

    try {
      const response = await axiosInstance.post('/task/create', payload);
      const created = response.data;

      // Map created task back to frontend shape
      const createdMapped = {
        id: String(
          created?.id ??
            created?.task_id ??
            crypto?.randomUUID?.() ??
            Math.random().toString(36).slice(2)
        ),
        title: created?.title ?? taskData.title,
        description: created?.description ?? taskData.description,
        priority: taskData.priority,
        status: taskData.status, // Use the original status from taskData
        createdAt:
          created?.created_at ?? created?.createdAt ?? new Date().toISOString(),
      };

      return createdMapped;
    } catch (error) {
      throw new Error('Failed to create task');
    }
  },

  async updateTask(
    userId: string | number,
    taskId: string,
    updates: Partial<
      TaskData & {
        sourceEmailId?: number;
        due_date?: string;
        is_active?: number;
        is_deleted?: number;
      }
    >
  ) {
    const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
    const numericTaskId = typeof taskId === 'string' ? Number(taskId) : taskId;

    if (!numericUserId || Number.isNaN(numericUserId)) {
      throw new Error('Invalid user id');
    }

    if (!numericTaskId || Number.isNaN(numericTaskId)) {
      throw new Error('Invalid task id');
    }

    // First, get the existing task to merge with updates
    const { tasks: existingTasks } = await this.getTasks(userId);
    const existingTask = existingTasks.find((t: any) => t.id === taskId);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const priorityTextToNum = (p: 'high' | 'medium' | 'low'): number => {
      if (p === 'high') return 1;
      if (p === 'medium') return 2;
      return 3;
    };

    const statusTextToNum = (s: 'pending' | 'in-progress' | 'completed'): number => {
      if (s === 'pending') return 0;
      if (s === 'in-progress') return 1;
      if (s === 'completed') return 2;
      return 0;
    };

    // Merge existing task data with updates
    const payload = {
      id: numericTaskId,
      title: updates.title ?? existingTask.title,
      user_id: numericUserId,
      sourceEmailId:
        updates.sourceEmailId ?? (existingTask as any).sourceEmailId,
      description: updates.description ?? existingTask.description ?? '',
      status: updates.status
        ? statusTextToNum(updates.status)
        : statusTextToNum(existingTask.status),
      priority: updates.priority
        ? priorityTextToNum(updates.priority)
        : priorityTextToNum(existingTask.priority),
      due_date: updates.due_date ?? (existingTask as any).due_date,
      is_active: updates.is_active ?? 1,
      is_deleted: updates.is_deleted ?? 0,
    };

    try {
      const response = await axiosInstance.post('/task/update', payload);

      // Map updated task back to frontend shape
      const updated = response.data;
      const updatedMapped = {
        id: String(updated?.id ?? updated?.task_id ?? taskId),
        title: updated?.title ?? payload.title,
        description: updated?.description ?? payload.description,
        priority: updates.priority ?? existingTask.priority,
        status: updates.status ?? existingTask.status,
        createdAt:
          updated?.created_at ?? updated?.createdAt ?? existingTask.createdAt,
      };

      return updatedMapped;
    } catch (error) {
      throw new Error('Failed to update task');
    }
  },

  async deleteTask(userId: string | number, taskId: string) {
    // Use the update endpoint with is_deleted: 1
    return this.updateTask(userId, taskId, { is_deleted: 1 });
  },
};

export const onboarding = {
  async getQuestions() {
    try {
      const response = await axiosInstance.post('/matrix/get_questions', {});
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error('Failed to load questions');
    }
  },

  async SyncEmailOnboarding({
    user_emails,
    calendar_email,
    user_id,
  }: {
    user_emails: (string | undefined)[];
    calendar_email: string | undefined;
    user_id: string | number | undefined;
  }) {
    try {
      const payload = {
        user_emails,
        calendar_email,
        user_id,
      };

      console.log('payload', payload);

      const response = await axiosInstance.post(
        '/plan/api/sync-emails',
        payload,
        {
          timeout: 180000, // 2 minutes in milliseconds
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to sync emails');
    }
  },

  async saveUserPreference({
    data,
    user_id,
  }: {
    data: any,
    user_id: string | number | undefined;
  }) {
    try {
      const payload = { user_id, data };

      const response = await axiosInstance.post('/user/userPreference', payload, {
        timeout: 120000 // extend for long processing
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to save user preferences');
    }
  }
};

export const plans = {
  async getPlans(payload: {
    user_id: number | string;
    date: string;
  }) {
    try {
      const response = await axiosInstance.post(
        '/plan/getPlan',
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch plans');
    }
  },
};
