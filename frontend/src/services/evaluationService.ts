import api from './api';

export type EvaluationStatus =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE';

export interface Evaluation {
  id: string;
  stageId: string;
  authorId: string;
  type: string;
  criteria: Record<string, any>;
  comment?: string;
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;

  stage?: {
    id: string;
    student?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    internship?: {
      id: string;
      title: string;
      domain: string;
    };
    company?: {
      id: string;
      companyName: string;
    };
  };

  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CreateEvaluationData {
  stageId: string;
  authorId?: string;
  criteria: Record<string, any>;
  comment?: string;
  status?: EvaluationStatus;
}

export interface UpdateEvaluationData {
  criteria?: Record<string, any>;
  comment?: string;
  status?: EvaluationStatus;
}

export interface EvaluationsResponse {
  company: Evaluation[];
  student: Evaluation[];
  supervisor: Evaluation[];
}

export const evaluationService = {
  getAll: async (): Promise<EvaluationsResponse> => {
    const { data } =
      await api.get<EvaluationsResponse>(
        '/evaluations',
      );

    return data;
  },

  createSupervisor: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.post<Evaluation>(
        '/evaluations/supervisor',
        payload,
      );

    return data;
  },

  updateSupervisor: async (
    id: string,
    payload: UpdateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.patch<Evaluation>(
        `/evaluations/supervisor/${id}`,
        payload,
      );

    return data;
  },

  createStudent: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.post<Evaluation>(
        '/evaluations/student',
        payload,
      );

    return data;
  },

  updateStudent: async (
    id: string,
    payload: UpdateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.patch<Evaluation>(
        `/evaluations/student/${id}`,
        payload,
      );

    return data;
  },

  createCompany: async (
    payload: CreateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.post<Evaluation>(
        '/evaluations/company',
        payload,
      );

    return data;
  },

  updateCompany: async (
    id: string,
    payload: UpdateEvaluationData,
  ): Promise<Evaluation> => {
    const { data } =
      await api.patch<Evaluation>(
        `/evaluations/company/${id}`,
        payload,
      );

    return data;
  },
};