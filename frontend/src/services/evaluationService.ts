import api from './api';

export type EvaluationStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export interface Evaluation {
  id: string;
  stageId: string;
  authorId: string;
  type: string;
  criteria: Record<string, unknown>;
  comment?: string;
  status: EvaluationStatus;
  createdAt: string;
  updatedAt?: string;

  stage?: {
    student?: {
      id?: string;
      firstName: string;
      lastName: string;
    };
    internship?: {
      id?: string;
      title: string;
      domain?: string;
    };
    company?: {
      id?: string;
      companyName: string;
    };
  };
}

export interface CreateEvaluationData {
  stageId: string;
  authorId: string;
  criteria: Record<string, unknown>;
  comment?: string;
}

export interface UpdateEvaluationData {
  criteria?: Record<string, unknown>;
  comment?: string;
  status?: EvaluationStatus;
}

export const evaluationService = {
  getAll: async () => {
    const { data } = await api.get<{
      company: Evaluation[];
      student: Evaluation[];
      supervisor: Evaluation[];
    }>('/evaluations');

    return data;
  },

  createForCompany: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/company',
      payload,
    );

    return data;
  },

  createForStudent: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/student',
      payload,
    );

    return data;
  },

  createForSupervisor: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } = await api.post<Evaluation>(
      '/evaluations/supervisor',
      payload,
    );

    return data;
  },

  updateStudent: async (
    id: string,
    payload: UpdateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } = await api.patch<Evaluation>(
      `/evaluations/student/${id}`,
      payload,
    );

    return data;
  },
};