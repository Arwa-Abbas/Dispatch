import { authApi } from '../api/auth';
import type { User, RegisterRequest } from '../types';

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await authApi.login({ email, password });
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  async register(userData: RegisterRequest): Promise<User> {
    return await authApi.register(userData);
  }

  async logout(): Promise<void> {
    await authApi.logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token') && !!this.getCurrentUser();
  }
}

export default AuthService.getInstance();