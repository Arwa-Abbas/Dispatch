import { api } from './api';
import type { 
  LoginRequest, 
  AuthResponse, 
  User,
  CustomerRegisterData,
  DriverRegisterData 
} from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  registerCustomer: async (data: CustomerRegisterData): Promise<User> => {
    // Make sure all fields are sent correctly
    const payload = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country || 'Pakistan',
      date_of_birth: data.date_of_birth || null
    };
    const response = await api.post('/auth/register/customer', payload);
    return response.data;
  },

  registerDriver: async (data: DriverRegisterData): Promise<User> => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      license_number: data.license_number,
      vehicle_type: data.vehicle_type,
      vehicle_number: data.vehicle_number,
      experience_years: data.experience_years || 0,
      current_location: data.current_location || null
    };
    const response = await api.post('/auth/register/driver', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};