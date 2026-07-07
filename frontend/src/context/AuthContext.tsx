import React from 'react';
import type { ReactNode } from 'react';
import type { User, CustomerRegisterData, DriverRegisterData, AuthResponse } from '../types';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: {
    customer: (data: CustomerRegisterData) => Promise<void>;
    driver: (data: DriverRegisterData) => Promise<void>;
  };
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check if the stored token is expired based on local expiry timestamp
  const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  };

  // Clear auth data from storage (but preserve remember me credentials)
  const clearAuthStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    // NOTE: We intentionally do NOT remove 'remember_me' and 'remembered_email'
    // Those should persist so the login form auto-fills on next visit
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          // No token stored — user is not logged in
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Check local expiry first (avoids unnecessary API calls)
        if (isTokenExpired()) {
          console.log('Token expired locally, clearing auth');
          clearAuthStorage();
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Validate token with the backend by fetching current user
        try {
          const verifyResponse = await authApi.verifyToken();
          if (verifyResponse.valid && verifyResponse.user) {
            setUser(verifyResponse.user);
            // Update stored user data with fresh data from server
            localStorage.setItem('user', JSON.stringify(verifyResponse.user));

            // If token is valid but expiring soon (less than 10 minutes), try to refresh
            const expiry = localStorage.getItem('token_expiry');
            const timeLeft = expiry ? parseInt(expiry, 10) - Date.now() : 0;
            if (timeLeft > 0 && timeLeft < 10 * 60 * 1000) {
              try {
                const refreshResponse = await authApi.refreshToken();
                localStorage.setItem('access_token', refreshResponse.access_token);
                const newExpiry = Date.now() + (refreshResponse.expires_in * 1000);
                localStorage.setItem('token_expiry', newExpiry.toString());
                localStorage.setItem('user', JSON.stringify(refreshResponse.user));
                setUser(refreshResponse.user);
              } catch {
                // Refresh failed, but current token is still valid — continue
                console.log('Token refresh failed, continuing with current token');
              }
            }
          } else {
            clearAuthStorage();
            setUser(null);
          }
        } catch {
          // Token is invalid on the server side — clear everything
          console.log('Token validation failed, clearing auth');
          clearAuthStorage();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthStorage();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.login({ 
        email, 
        password, 
        remember_me: rememberMe 
      });
      
      // Store token and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Store token expiry
      const expiryTime = Date.now() + (response.expires_in * 1000);
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_email');
      }
      
      setUser(response.user);
      toast.success('Welcome back to Dispatch! 🚀');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.detail || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCustomer = async (data: CustomerRegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.registerCustomer(data);
      toast.success('Customer account created! Please login.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.detail || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDriver = async (data: DriverRegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.registerDriver(data);
      toast.success('Driver account created! Please login.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.detail || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear auth tokens but preserve remember me credentials
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      // NOTE: We intentionally keep 'remember_me' and 'remembered_email' 
      // so the login form auto-fills the email on the next visit
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const register = {
    customer: registerCustomer,
    driver: registerDriver,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};