import api from './api';

export type ApplicationStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULEE';

export interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  motivationMessage?: string;
  cvUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    user?: { email: string };
  };
  internship?: {
    id: string;
    title: string;
    description?: string;
    domain?: string;
    duration?: string;
    location?: string;
    status?: string;
    company?: {
      id: string;
      companyName: string;
    };
    supervisor?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateApplicationData {
  internshipId: string;
  motivationMessage?: string;
  cvUrl?: string;
}

export const applicationService = {
  getAll: async (): Promise<Application[]> => {
    const response = await api.get('/applications');
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
  const response = await api.get('/applications');
  return response.data;
},

  getById: async (id: string): Promise<Application> => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  create: async (payload: CreateApplicationData): Promise<Application> => {
    const response = await api.post('/applications', payload);
    return response.data;
  },

  updateStatus: async (id: string, status: ApplicationStatus): Promise<Application> => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  remove: async (id: string): Promise<Application> => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  }
};