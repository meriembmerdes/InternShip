import api from './api';

export type Role =
  | 'ADMIN'
  | 'STUDENT'
  | 'SUPERVISOR'
  | 'COMPANY';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isActive: UserStatus;
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
    address?: string;
    managerTitle?: string;
  };
}

/* =========================
   ÉTUDIANT
========================= */

export interface AdminStudent {
  id: string;
  email: string;
  isActive: UserStatus;
  createdAt: string;

  firstName: string;
  lastName: string;
  className?: string;

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

/* =========================
   ENCADRANT
========================= */

export interface AdminSupervisor {
  id: string;
  email: string;
  isActive: UserStatus;
  createdAt: string;

  firstName: string;
  lastName: string;
  profession?: string;
  department?: string;

  user?: {
    id: string;
    email: string;
    createdAt: string;
  };

  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
    department?: string;
  };
}

/* =========================
   ENTREPRISE
========================= */

export interface AdminCompany {
  id: string;
  email: string;
  isActive: UserStatus;
  createdAt: string;

  companyName: string;
  managerName: string;
  sector?: string;

  user?: {
    id: string;
    email: string;
    createdAt: string;
  };

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

/* =========================
   STAGES
========================= */

export interface AdminStage {
  id: string;
  startDate?: string;
  endDate?: string;

  status:
    | 'EN_ATTENTE'
    | 'EN_COURS'
    | 'TERMINE'
    | 'SUSPENDU';

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

/* =========================
   CANDIDATURES
========================= */

export interface AdminApplication {
  id: string;
  motivationMessage?: string;
  cvUrl?: string;

  status:
    | 'EN_ATTENTE'
    | 'ACCEPTEE'
    | 'REFUSEE'
    | 'ANNULEE';

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

/* =========================
   ADMIN SERVICE
========================= */

export const adminService = {

  /* ---------- USERS ---------- */

  getUsers: async (
    params?: {
      search?: string;
      role?: Role;
    },
  ): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>(
      '/admin/users',
      { params },
    );

    return response.data;
  },

  deleteUser: async (
    id: string,
  ) => {
    const response = await api.delete(
      `/admin/users/${id}`,
    );

    return response.data;
  },

  /* ---------- STUDENTS ---------- */

  getStudents: async (
    params?: {
      search?: string;
      specialty?: string;
      status?: UserStatus;
    },
  ): Promise<AdminStudent[]> => {
    const response = await api.get<AdminStudent[]>(
      '/admin/students',
      { params },
    );

    return response.data;
  },

  updateStudentStatus: async (
    id: string,
    status: UserStatus,
  ) => {
    const response = await api.patch(
      `/admin/students/${id}/status`,
      { status },
    );

    return response.data;
  },

  /* ---------- SUPERVISORS ---------- */

  getSupervisors: async (
    params?: {
      search?: string;
      department?: string;
      status?: UserStatus;
    },
  ): Promise<AdminSupervisor[]> => {
    const response = await api.get<AdminSupervisor[]>(
      '/admin/supervisors',
      { params },
    );

    return response.data;
  },

  updateSupervisorStatus: async (
    id: string,
    status: UserStatus,
  ) => {
    const response = await api.patch(
      `/admin/supervisors/${id}/status`,
      { status },
    );

    return response.data;
  },

  /* ---------- COMPANIES ---------- */

  getCompanies: async (
    params?: {
      search?: string;
      sector?: string;
      status?: UserStatus;
    },
  ): Promise<AdminCompany[]> => {
    const response = await api.get<AdminCompany[]>(
      '/admin/companies',
      { params },
    );

    return response.data;
  },

  updateCompanyStatus: async (
    id: string,
    status: UserStatus,
  ) => {
    const response = await api.patch(
      `/admin/companies/${id}/status`,
      { status },
    );

    return response.data;
  },

  /* ---------- STAGES ---------- */

  getStages: async (): Promise<AdminStage[]> => {
    const response = await api.get<AdminStage[]>(
      '/admin/stages',
    );

    return response.data;
  },

  /* ---------- APPLICATIONS ---------- */

  getApplications: async (): Promise<AdminApplication[]> => {
    const response = await api.get<AdminApplication[]>(
      '/admin/applications',
    );

    return response.data;
  },

  updateApplicationStatus: async (
    id: string,
    status: AdminApplication['status'],
  ) => {
    const response = await api.patch(
      `/admin/applications/${id}/status`,
      { status },
    );

    return response.data;
  },
};