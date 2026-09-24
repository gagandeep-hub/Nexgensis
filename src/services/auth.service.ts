import apiClient, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/lib/axios';
import { LoginResponse, User } from '@/types';

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authService = {
  /**
   * Authenticate user with DummyJSON
   */
  async login(credentials: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });

    const data = response.data;
    const token = data.token || data.accessToken || '';

    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  },

  /**
   * Log out the current user and wipe session storage
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Get the stored user profile if available
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if a token exists in local storage
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Get the stored auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
};
