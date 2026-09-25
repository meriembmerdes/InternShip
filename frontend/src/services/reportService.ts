import api from './api';

export type ReportStatus =
  | 'NON_DEPOSE'
  | 'DEPOSE'
  | 'EN_REVISION'
  | 'VALIDE'
  | 'REFUSE';

export interface Report {
  id: string;
  stageId: string;
  studentId: string;
  fileUrl: string;
  submittedAt?: string;
  status: ReportStatus;
  comment?: string;
  stage?: {
    id: string;
    internship?: {
      id: string;
      title: string;
      domain: string;
    };
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

export interface CreateReportData {
  stageId: string;
  studentId: string;
  fileUrl: string;
  comment?: string;
}

export interface UpdateReportData {
  status?: ReportStatus;
  comment?: string;
}

export const reportService = {
  getAll: async (): Promise<Report[]> => {
    const { data } = await api.get<Report[]>('/reports');
    return data;
  },

  getById: async (id: string): Promise<Report> => {
    const { data } = await api.get<Report>(`/reports/${id}`);
    return data;
  },

  create: async (payload: CreateReportData): Promise<Report> => {
    const { data } = await api.post<Report>('/reports', payload);
    return data;
  },

  update: async (id: string, payload: UpdateReportData): Promise<Report> => {
    const { data } = await api.patch<Report>(`/reports/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },
};