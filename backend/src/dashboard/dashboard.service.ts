import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        supervisor: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    switch (user.role) {
      case Role.STUDENT:
        return this.getStudentStats(user);

      case Role.COMPANY:
        return this.getCompanyStats(user);

      case Role.SUPERVISOR:
        return this.getSupervisorStats(user);

      case Role.ADMIN:
        return this.getAdminStats();

      default:
        return {};
    }
  }

  // ============================================================
  // STUDENT
  // ============================================================

  private async getStudentStats(user: any) {
    if (!user.student) {
      return {
        role: Role.STUDENT,
        profileCompletion: 0,
        applicationsCount: 0,
        acceptedApplicationsCount: 0,
        internshipsCount: 0,
        notificationsCount: 0,
      };
    }

    const student = user.student;

    const [
      applicationsCount,
      acceptedApplicationsCount,
      internshipsCount,
      notificationsCount,
    ] = await Promise.all([
      this.prisma.application.count({
        where: {
          studentId: student.id,
        },
      }),

      this.prisma.application.count({
        where: {
          studentId: student.id,
          status: 'ACCEPTEE',
        },
      }),

      this.prisma.stage.count({
        where: {
          studentId: student.id,
        },
      }),

      this.prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    const profileCompletion = this.calculateStudentProfileCompletion(student);

    return {
      role: Role.STUDENT,
      profileCompletion,
      applicationsCount,
      acceptedApplicationsCount,
      internshipsCount,
      notificationsCount,
    };
  }

  // ============================================================
  // COMPANY
  // ============================================================

  private async getCompanyStats(user: any) {
    if (!user.company) {
      return {
        role: Role.COMPANY,
        profileCompletion: 0,
        internshipsCount: 0,
        applicationsCount: 0,
        acceptedApplicationsCount: 0,
        notificationsCount: 0,
      };
    }

    const company = user.company;

    const [
      internshipsCount,
      applicationsCount,
      acceptedApplicationsCount,
      notificationsCount,
    ] = await Promise.all([
      this.prisma.internship.count({
        where: {
          companyId: company.id,
        },
      }),

      this.prisma.application.count({
        where: {
          internship: {
            companyId: company.id,
          },
        },
      }),

      this.prisma.application.count({
        where: {
          internship: {
            companyId: company.id,
          },
          status: 'ACCEPTEE',
        },
      }),

      this.prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    const profileCompletion =
      this.calculateCompanyProfileCompletion(company);

    return {
      role: Role.COMPANY,
      profileCompletion,
      internshipsCount,
      applicationsCount,
      acceptedApplicationsCount,
      notificationsCount,
    };
  }

  // ============================================================
  // SUPERVISOR
  // ============================================================

  private async getSupervisorStats(user: any) {
    if (!user.supervisor) {
      return {
        role: Role.SUPERVISOR,
        profileCompletion: 0,
        supervisedInternshipsCount: 0,
        studentsCount: 0,
        evaluationsCount: 0,
        notificationsCount: 0,
      };
    }

    const supervisor = user.supervisor;

    const [
      supervisedInternshipsCount,
      studentsCount,
      evaluationsCount,
      notificationsCount,
    ] = await Promise.all([
      this.prisma.stage.count({
        where: {
          supervisorId: supervisor.id,
        },
      }),

      this.prisma.stage.findMany({
        where: {
          supervisorId: supervisor.id,
        },
        select: {
          studentId: true,
        },
        distinct: ['studentId'],
      }),

      this.prisma.supervisorEvaluation.count({
        where: {
          authorId: supervisor.id,
        },
      }),

      this.prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    const profileCompletion =
      this.calculateSupervisorProfileCompletion(supervisor);

    return {
      role: Role.SUPERVISOR,
      profileCompletion,
      supervisedInternshipsCount,
      studentsCount: studentsCount.length,
      evaluationsCount,
      notificationsCount,
    };
  }

  // ============================================================
  // ADMIN
  // ============================================================

  private async getAdminStats() {
    const [
      usersCount,
      studentsCount,
      supervisorsCount,
      companiesCount,
      internshipsCount,
      applicationsCount,
      notificationsCount,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          role: Role.STUDENT,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.SUPERVISOR,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.COMPANY,
        },
      }),

      this.prisma.internship.count(),

      this.prisma.application.count(),

      this.prisma.notification.count({
        where: {
          isRead: false,
        },
      }),
    ]);

    return {
      role: Role.ADMIN,
      usersCount,
      studentsCount,
      supervisorsCount,
      companiesCount,
      internshipsCount,
      applicationsCount,
      notificationsCount,
    };
  }

  // ============================================================
  // PROFILE COMPLETION
  // ============================================================

  private calculateStudentProfileCompletion(student: any): number {
    const fields = [
      student.firstName,
      student.lastName,
      student.phone,
      student.institution,
      student.specialty,
      student.level,
      student.bio,
    ];

    return this.calculatePercentage(fields);
  }

  private calculateSupervisorProfileCompletion(
    supervisor: any,
  ): number {
    const fields = [
      supervisor.firstName,
      supervisor.lastName,
      supervisor.profession,
      supervisor.department,
    ];

    return this.calculatePercentage(fields);
  }

  private calculateCompanyProfileCompletion(company: any): number {
    const fields = [
      company.companyName,
      company.managerName,
      company.managerTitle,
      company.sector,
      company.address,
      company.phone,
    ];

    return this.calculatePercentage(fields);
  }

  private calculatePercentage(fields: any[]): number {
    if (fields.length === 0) {
      return 0;
    }

    const completedFields = fields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== '',
    ).length;

    return Math.round(
      (completedFields / fields.length) * 100,
    );
  }
}