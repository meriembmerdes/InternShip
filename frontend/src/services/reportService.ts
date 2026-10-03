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
  createdAt: string;
  updatedAt: string;

  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  stage?: {
    internship?: {
      title: string;
      domain?: string;
    };
    company?: {
      companyName: string;
    };
  };
}

export const reportService = {
  getAll: async (): Promise<Report[]> => {
    const { data } =
      await api.get<Report[]>('/reports');

    return data;
  },

  getById: async (
    id: string,
  ): Promise<Report> => {
    const { data } =
      await api.get<Report>(
        `/reports/${id}`,
      );

    return data;
  },

  create: async (
    stageId: string,
    file: File,
  ): Promise<Report> => {
    const formData = new FormData();

    formData.append('stageId', stageId);
    formData.append('file', file);

    const { data } =
      await api.post<Report>(
        '/reports',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        },
      );

    return data;
  },

  /**
   * Ouvre le PDF via la route sécurisée du backend.
   */
  openFile: async (id: string): Promise<void> => {
  const newWindow = window.open('', '_blank');

  if (!newWindow) {
    throw new Error(
      'Le navigateur a bloqué l’ouverture du PDF.',
    );
  }

  try {
    const response = await api.get(
      `/reports/${id}/file`,
      {
        responseType: 'blob',
      },
    );

    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf',
      },
    );

    const url =
      window.URL.createObjectURL(blob);

    newWindow.location.href = url;

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    newWindow.close();
    throw error;
  }
},

  update: async (
    id: string,
    data: {
      status?: ReportStatus;
      comment?: string;
    },
  ): Promise<Report> => {
    const response =
      await api.patch<Report>(
        `/reports/${id}`,
        data,
      );

    return response.data;
  },

  remove: async (
    id: string,
  ): Promise<void> => {
    await api.delete(
      `/reports/${id}`,
    );
  },

  updateStatus: async (
    id: string,
    status: ReportStatus,
    comment?: string,
  ): Promise<Report> => {
    const { data } =
      await api.patch<Report>(
        `/reports/${id}/status`,
        {
          status,
          comment,
        },
      );

    return data;
  },
};