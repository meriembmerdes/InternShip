import api from './api';

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  institution?: string | null;
  specialty?: string | null;
  level?: string | null;
  bio?: string | null;
  cvUrl?: string | null;
}

export interface SupervisorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profession?: string | null;
  department?: string | null;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  managerName: string;
  companyName: string;
  sector?: string | null;
  address?: string | null;
  phone?: string | null;
  managerTitle?: string | null;
}

export interface MyProfile {
  id: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'SUPERVISOR' | 'COMPANY';
  isActive: 'ACTIVE' | 'INACTIVE';

  firstName?: string | null;
  lastName?: string | null;

  student?: StudentProfile | null;
  supervisor?: SupervisorProfile | null;
  company?: CompanyProfile | null;
}

export const profileService = {
  getMyProfile: async (): Promise<MyProfile> => {
    const { data } = await api.get<MyProfile>('/profile/me');
    return data;
  },

  updateStudent: async (
    data: Partial<StudentProfile>,
  ): Promise<StudentProfile> => {
    const response = await api.put<StudentProfile>(
      '/profile/student',
      data,
    );

    return response.data;
  },

  updateSupervisor: async (
    data: Partial<SupervisorProfile>,
  ): Promise<SupervisorProfile> => {
    const response = await api.put<SupervisorProfile>(
      '/profile/supervisor',
      data,
    );

    return response.data;
  },

  updateCompany: async (
    data: Partial<CompanyProfile>,
  ): Promise<CompanyProfile> => {
    const response = await api.put<CompanyProfile>(
      '/profile/company',
      data,
    );

    return response.data;
  },
  updateAdmin: async (
  data: {
    firstName?: string;
    lastName?: string;
  },
): Promise<MyProfile> => {
  const response = await api.put<MyProfile>(
    '/profile/admin',
    data,
  );

  return response.data;
},
};