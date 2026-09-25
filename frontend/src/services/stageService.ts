import api from './api';

export type StageStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';

export interface Stage {
  id: string;
  studentId: string;
  internshipId: string;
  companyId?: string;
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
  status: StageStatus;
  progression: number;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
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
  internship?: {
    id: string;
    title: string;
    domain: string;
  };
}

export interface CreateStageData {
  studentId: string;
  internshipId: string;
  companyId?: string;
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
  status?: StageStatus;
}

export interface UpdateStageData {
  companyId?: string;
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
  status?: StageStatus;
  progression?: number;
}

export const stageService = {
  getAll: async (): Promise<Stage[]> => {
    const { data } = await api.get<Stage[]>('/stages');
    return data;
  },

  getById: async (id: string): Promise<Stage> => {
    const { data } = await api.get<Stage>(`/stages/${id}`);
    return data;
  },

  create: async (payload: CreateStageData): Promise<Stage> => {
    const { data } = await api.post<Stage>('/stages', payload);
    return data;
  },

  update: async (id: string, payload: UpdateStageData): Promise<Stage> => {
    const { data } = await api.patch<Stage>(`/stages/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/stages/${id}`);
  },
};