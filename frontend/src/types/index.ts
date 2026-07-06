export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'DRIVER' | 'CUSTOMER';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: number;
  user_id: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  date_of_birth?: string;
}

export interface DriverProfile {
  id: number;
  user_id: number;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_number: string;
  status: string;
  experience_years: number;
  current_location?: string;
  rating: number;
  total_deliveries: number;
}

// Make sure all fields match the backend CustomerRegister schema
export interface CustomerRegisterData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  date_of_birth?: string;
}

// Make sure all fields match the backend DriverRegister schema
export interface DriverRegisterData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_number: string;
  experience_years: number;
  current_location?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  status?: number;
}