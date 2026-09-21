import api from './api';

export type InternshipStatus =
  | 'BROUILLON'
  | 'PUBLIEE'
  | 'FERMEE'
  | 'TERMINEE';

export interface Internship {
  id: string;
  title: string;
  description: string;
  domain: string;
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
  location?: string;
  status?: InternshipStatus;
  page?: number;
  limit?: number;
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
};