import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApplicationStatus, Role } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException('Profil étudiant introuvable.');
    }

    const internship = await this.prisma.internship.findUnique({
      where: { id: dto.internshipId },
    });

    if (!internship) {
      throw new NotFoundException('Offre introuvable.');
    }

    if (internship.status !== 'PUBLIEE') {
      throw new BadRequestException('Cette offre n’est pas publiée.');
    }

    const existing = await this.prisma.application.findUnique({
      where: {
        studentId_internshipId: {
          studentId: student.id,
          internshipId: dto.internshipId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Vous avez déjà postulé à cette offre.');
    }

    return this.prisma.application.create({
      data: {
        studentId: student.id,
        internshipId: dto.internshipId,
        motivationMessage: dto.motivationMessage,
        cvUrl: dto.cvUrl ?? student.cvUrl,
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true,
            supervisor: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, role: Role) {
    const where: any = {};

    if (role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });

      if (!student) {
        throw new ForbiddenException('Profil étudiant introuvable.');
      }

      where.studentId = student.id;
    }

    if (role === Role.COMPANY) {
      const company = await this.prisma.company.findUnique({
        where: { userId },
      });

      if (!company) {
        throw new ForbiddenException('Profil entreprise introuvable.');
      }

      where.internship = {
        companyId: company.id,
      };
    }

    if (role === Role.SUPERVISOR) {
      const supervisor = await this.prisma.supervisor.findUnique({
        where: { userId },
      });

      if (!supervisor) {
        throw new ForbiddenException('Profil encadrant introuvable.');
      }

      where.internship = {
        supervisorId: supervisor.id,
      };
    }

    return this.prisma.application.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true,
            supervisor: true,
          },
        },
      },
    });
  }

  async findOne(userId: string, role: Role, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        student: true,
        internship: {
          include: {
            company: true,
            supervisor: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable.');
    }

    await this.checkAccess(userId, role, application);

    return application;
  }

  async updateStatus(userId: string, role: Role, id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        internship: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable.');
    }

    if (role === Role.STUDENT) {
      throw new ForbiddenException('Un étudiant ne peut pas modifier le statut.');
    }

    if (role === Role.COMPANY) {
      const company = await this.prisma.company.findUnique({
        where: { userId },
      });

      if (!company || application.internship.companyId !== company.id) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    if (role === Role.SUPERVISOR) {
      const supervisor = await this.prisma.supervisor.findUnique({
        where: { userId },
      });

      if (!supervisor || application.internship.supervisorId !== supervisor.id) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true,
            supervisor: true,
          },
        },
      },
    });
  }

  async remove(userId: string, role: Role, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        internship: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable.');
    }

    if (role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });

      if (!student || application.studentId !== student.id) {
        throw new ForbiddenException('Accès refusé.');
      }
    } else if (role === Role.ADMIN) {
    } else {
      throw new ForbiddenException('Suppression non autorisée.');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    return { success: true };
  }

  private async checkAccess(userId: string, role: Role, application: any) {
    if (role === Role.ADMIN) {
      return;
    }

    if (role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });

      if (!student || application.studentId !== student.id) {
        throw new ForbiddenException('Accès refusé.');
      }

      return;
    }

    if (role === Role.COMPANY) {
      const company = await this.prisma.company.findUnique({
        where: { userId },
      });

      if (!company || application.internship.companyId !== company.id) {
        throw new ForbiddenException('Accès refusé.');
      }

      return;
    }

    if (role === Role.SUPERVISOR) {
      const supervisor = await this.prisma.supervisor.findUnique({
        where: { userId },
      });

      if (!supervisor || application.internship.supervisorId !== supervisor.id) {
        throw new ForbiddenException('Accès refusé.');
      }

      return;
    }

    throw new ForbiddenException('Accès refusé.');
  }
}