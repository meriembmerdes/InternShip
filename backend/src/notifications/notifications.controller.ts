import api from './api';

export type InternshipStatus =
  | 'BROUILLON'
  | 'PUBLIEE'
  | 'FERMEE'
  | 'TERMINEE';

export interface InternshipCompany {
  id: string;
  name?: string;
  companyName?: string;
}

export interface InternshipSupervisor {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  domain: string;
  duration?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  numberOfPlaces: number;
  status: InternshipStatus;
  createdAt: string;

  company?: InternshipCompany | null;
  supervisor?: InternshipSupervisor | null;

  skillLinks?: {
    id: string;
    skill?: {
      id: string;
      name: string;
    };
  }[];

  applications?: unknown[];
}

export interface InternshipQuery {
  search?: string;
  domain?: string;
  location?: string;
  status?: InternshipStatus;
  page?: number;
  limit?: number;
}

export interface InternshipListResponse {
  data: Internship[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateInternshipData {
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

export const internshipsService = {
  async getAll(
    params?: InternshipQuery,
  ): Promise<InternshipListResponse> {
    const { data } = await api.get<InternshipListResponse>(
      '/internships',
      {
        params,
      },
    );

    return data;
  },

  async getById(id: string): Promise<Internship> {
    const { data } = await api.get<Internship>(
      `/internships/${id}`,
    );

    return data;
  },

  async create(
    internship: CreateInternshipData,
  ): Promise<Internship> {
    const { data } = await api.post<Internship>(
      '/internships',
      internship,
    );

    return data;
  },

  async update(
    id: string,
    internship: Partial<CreateInternshipData>,
  ): Promise<Internship> {
    const { data } = await api.patch<Internship>(
      `/internships/${id}`,
      internship,
    );

    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(
      `/internships/${id}`,
    );

    return data;
  },
};