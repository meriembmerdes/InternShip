import api from './api';

export type InternshipStatus =
  | 'BROUILLON'
  | 'PUBLIEE'
  | 'FERMEE'
  | 'TERMINEE';

export type InternshipType =
  | 'OUVRIER'
  | 'TECHNICIEN'
  | 'FIN_ETUDE'
  | 'ETE';

export interface Internship {
  id: string;
  title: string;
  description: string;
  domain: string;
  type: InternshipType;
  duration?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  numberOfPlaces: number;
  status: InternshipStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  company?: {
    id: string;
    name?: string;
  };

  supervisor?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface InternshipResponse {
  data: Internship[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InternshipFormData {
  title: string;
  description: string;
  domain: string;
  type?: InternshipType;
  duration?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  numberOfPlaces?: number;
  status?: InternshipStatus;
  companyId?: string;
  supervisorId?: string;
}

export interface InternshipQuery {
  search?: string;
  domain?: string;
  type?: InternshipType;
  location?: string;
  status?: InternshipStatus;
  page?: number;
  limit?: number;
}
export interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
  profession?: string;
  user?: {
    email: string;
    status: string;
  };
}

export const internshipService = {
  getAll: async (
    params?: InternshipQuery,
  ): Promise<InternshipResponse> => {
    const { data } =
      await api.get<InternshipResponse>(
        '/internships',
        {
          params,
        },
      );

    return data;
  },

  getById: async (
    id: string,
  ): Promise<Internship> => {
    const { data } =
      await api.get<Internship>(
        `/internships/${id}`,
      );

    return data;
  },

  create: async (
    formData: InternshipFormData,
  ): Promise<Internship> => {
    const { data } =
      await api.post<Internship>(
        '/internships',
        formData,
      );

    return data;
  },

  update: async (
    id: string,
    formData: InternshipFormData,
  ): Promise<Internship> => {
    const { data } =
      await api.patch<Internship>(
        `/internships/${id}`,
        formData,
      );

    return data;
  },

  remove: async (
    id: string,
  ): Promise<void> => {
    await api.delete(`/internships/${id}`);
  },
  getAvailableSupervisors: async (): Promise<Supervisor[]> => {
  const { data } = await api.get<Supervisor[]>(
    '/internships/supervisors/available',
  );

  return data;
  },
};