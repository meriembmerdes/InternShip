export type Role = 'ADMIN' | 'STUDENT' | 'SUPERVISOR' | 'COMPANY';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;

  role:
    | 'STUDENT'
    | 'SUPERVISOR'
    | 'COMPANY'
    | 'ADMIN';

  firstName?: string;
  lastName?: string;

  profession?: string;
  department?: string;

  companyName?: string;
  managerName?: string;
  managerTitle?: string;

  sector?: string;
  address?: string;
  phone?: string;

  adminPin?: string;
}

