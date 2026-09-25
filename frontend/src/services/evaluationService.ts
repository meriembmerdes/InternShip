import api from './api';

export type EvaluationStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export interface Evaluation {
  id: string;
  stageId: string;
  authorId: string;
  type: string;
  criteria: Record<string, any>;
  comment?: string;
  status: EvaluationStatus;
  createdAt: string;
  stage?: {
    student?: {
      firstName: string;
      lastName: string;
    };
    internship?: {
      title: string;
    };
    company?: {
      companyName: string;
    };
  };
}

export interface CreateEvaluationData {
  stageId: string;
  authorId: string;
  criteria: Record<string, any>;
  comment?: string;
}

export const evaluationService = {
  getAll: async () => {
    const { data } = await api.get('/evaluations');
    return data;
  },

  createForCompany: async (payload: CreateEvaluationData) => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/company',
      payload,
    );
    return data;
  },

  createForStudent: async (payload: CreateEvaluationData) => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/student',
      payload,
    );
    return data;
  },

  createForSupervisor: async (payload: CreateEvaluationData) => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/supervisor',
      payload,
    );
    return data;
  },
};