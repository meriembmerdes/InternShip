import api from './api';
import type { AuthResponse, LoginFormData, RegisterFormData } from '../types/auth';

export const authService = {
  register: (payload: RegisterFormData) => api.post<AuthResponse>('/auth/register', payload),
  login: (payload: LoginFormData) => api.post<AuthResponse>('/auth/login', payload),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
