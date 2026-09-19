import api from './api';

export interface StudentStats {
  role: 'STUDENT';
  profileCompletion: number;
  applicationsCount: number;
  acceptedApplicationsCount: number;
  internshipsCount: number;
  notificationsCount: number;
}

export interface CompanyStats {
  role: 'COMPANY';
  profileCompletion: number;
  internshipsCount: number;
  applicationsCount: number;
  acceptedApplicationsCount: number;
  notificationsCount: number;
}

export interface SupervisorStats {
  role: 'SUPERVISOR';
  profileCompletion: number;
  supervisedInternshipsCount: number;
  studentsCount: number;
  evaluationsCount: number;
  notificationsCount: number;
}

export interface AdminStats {
  role: 'ADMIN';
  usersCount: number;
  studentsCount: number;
  supervisorsCount: number;
  companiesCount: number;
  internshipsCount: number;
  applicationsCount: number;
  notificationsCount: number;
}

export type DashboardStats =
  | StudentStats
  | CompanyStats
  | SupervisorStats
  | AdminStats;

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>(
      '/dashboard/stats',
    );

    return data;
  },
};