import api from './api';

export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';

export interface Task {
  id: string;
  stageId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateTaskData {
  stageId: string;
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export const taskService = {
  getByStage: async (stageId: string): Promise<Task[]> => {
    const { data } = await api.get<Task[]>(
      `/tasks/stage/${stageId}`,
    );

    return data;
  },

  create: async (
    payload: CreateTaskData,
  ): Promise<Task> => {
    const { data } = await api.post<Task>(
      '/tasks',
      payload,
    );

    return data;
  },

  update: async (
    id: string,
    payload: UpdateTaskData,
  ): Promise<Task> => {
    const { data } = await api.patch<Task>(
      `/tasks/${id}`,
      payload,
    );

    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};