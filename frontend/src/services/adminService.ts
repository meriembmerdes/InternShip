import api from './api';

export type Role = 'ADMIN' | 'STUDENT' | 'SUPERVISOR' | 'COMPANY';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isActive: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    institution?: string;
    specialty?: string;
  };
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
    department?: string;
  };
  company?: {
    id: string;
    companyName: string;
    managerName: string;
    sector?: string;
    phone?: string;
  };
}

export const adminService = {
  getUsers: async (params?: { search?: string; role?: Role }) => {
    const response = await api.get<AdminUser[]>('/admin/users', { params });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getStudents: async (params?: {
  search?: string;
  specialty?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  const response = await api.get<AdminStudent[]>('/admin/students', {
    params,
  });
  return response.data;
},

updateStudentStatus: async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE',
) => {
  const response = await api.patch(`/admin/students/${id}/status`, {
    status,
  });
  return response.data;
},
getSupervisors: async (params?: {
  search?: string;
  department?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  const response = await api.get<AdminSupervisor[]>('/admin/supervisors', {
    params,
  });
  return response.data;
},

updateSupervisorStatus: async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE',
) => {
  const response = await api.patch(`/admin/supervisors/${id}/status`, {
    status,
  });
  return response.data;
},
getCompanies: async (params?: {
  search?: string;
  sector?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  const response = await api.get<AdminCompany[]>(
    '/admin/companies',
    { params },
  );
  return response.data;
},

updateCompanyStatus: async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE',
) => {
  const response = await api.patch(
    `/admin/companies/${id}/status`,
    { status },
  );
  return response.data;
},
getStages: async () => {
  const response = await api.get<AdminStage[]>(
    '/admin/stages',
  );
  return response.data;
},
getApplications: async () => {
  const response = await api.get<AdminApplication[]>('/admin/applications');
  return response.data;
},

updateApplicationStatus: async (
  id: string,
  status: AdminApplication['status'],
) => {
  const response = await api.patch(`/admin/applications/${id}/status`, { status });
  return response.data;
},
};
export interface AdminStudent {
  className: string;
  lastName: ReactNode;
  firstName: ReactNode;
  firstName: any;
  id: string;
  email: string;
  isActive: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    institution?: string;
    specialty?: string;
    level?: string;
    bio?: string;
    cvUrl?: string;
  };
}
export interface AdminSupervisor {
  lastName: ReactNode;
  firstName: any;
  firstName: any;
  lastName: ReactNode;
  user: any;
  department: string;
  id: string;
  email: string;
  isActive: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
    department?: string;
  };
}
export interface AdminCompany {
  id: string;
  email: string;
  isActive: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  company?: {
    id: string;
    companyName: string;
    managerName: string;
    sector?: string;
    address?: string;
    phone?: string;
    managerTitle?: string;
  };
}
export interface AdminStage {
  id: string;
  startDate?: string;
  endDate?: string;
  status: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  progression: number;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    institution?: string;
    specialty?: string;
  };
  company?: {
    id: string;
    companyName: string;
    managerName: string;
  };
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
  };
  internship: {
    id: string;
    title: string;
    domain: string;
    location?: string;
  };
}
export interface AdminApplication {
  id: string;
  motivationMessage?: string;
  cvUrl?: string;
  status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULEE';
  appliedAt: string;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    institution?: string;
    specialty?: string;
  };
  internship: {
    id: string;
    title: string;
    domain: string;
    company?: {
      id: string;
      companyName: string;
    };
  };
}