import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  ApplicationStatus,
  Role,
  StageStatus,
} from '@prisma/client';

import { CreateStageDto } from './dto/create-stage.dto.js';
import { UpdateStageDto } from './dto/update-stage.dto.js';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREATE STAGE FROM ACCEPTED APPLICATION
  // =========================================================

  async create(userId: string, dto: CreateStageDto) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: dto.applicationId,
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

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }

    if (application.status !== ApplicationStatus.ACCEPTEE) {
      throw new BadRequestException(
        'Le stage ne peut être créé que pour une candidature acceptée',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        company: true,
        supervisor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // ADMIN peut tout faire
    if (user.role !== Role.ADMIN) {
      // Entreprise
      if (user.role === Role.COMPANY) {
        if (
          !user.company ||
          application.internship.companyId !== user.company.id
        ) {
          throw new ForbiddenException(
            'Vous ne pouvez pas créer ce stage',
          );
        }
      }

      // Encadrant
      else if (user.role === Role.SUPERVISOR) {
        if (
          !user.supervisor ||
          application.internship.supervisorId !== user.supervisor.id
        ) {
          throw new ForbiddenException(
            'Vous ne pouvez pas créer ce stage',
          );
        }
      }

      else {
        throw new ForbiddenException(
          'Vous n’avez pas l’autorisation de créer un stage',
        );
      }
    }

    // Vérifier qu'un stage n'existe pas déjà
    const existingStage = await this.prisma.stage.findFirst({
      where: {
        studentId: application.studentId,
        internshipId: application.internshipId,
      },
    });

    if (existingStage) {
      throw new BadRequestException(
        'Un stage existe déjà pour cette candidature',
      );
    }

    const stage = await this.prisma.stage.create({
      data: {
        studentId: application.studentId,
        internshipId: application.internshipId,
        companyId: application.internship.companyId ?? undefined,
        supervisorId: application.internship.supervisorId ?? undefined,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : application.internship.startDate,
        endDate: dto.endDate
          ? new Date(dto.endDate)
          : application.internship.endDate,
        status: StageStatus.EN_ATTENTE,
        progression: 0,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
      },
    });

    return stage;
  }

  // =========================================================
  // GET MY STAGES
  // =========================================================

  async findMyStages(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === Role.STUDENT) {
      if (!user.student) {
        throw new BadRequestException(
          'Profil étudiant introuvable',
        );
      }

      return this.prisma.stage.findMany({
        where: {
          studentId: user.student.id,
        },
        include: {
          internship: {
            include: {
              company: true,
              supervisor: true,
            },
          },
          company: true,
          supervisor: true,
          reports: true,
          evaluations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === Role.COMPANY) {
      if (!user.company) {
        throw new BadRequestException(
          'Profil entreprise introuvable',
        );
      }

      return this.prisma.stage.findMany({
        where: {
          companyId: user.company.id,
        },
        include: {
          student: true,
          internship: true,
          supervisor: true,
          reports: true,
          evaluations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === Role.SUPERVISOR) {
      if (!user.supervisor) {
        throw new BadRequestException(
          'Profil encadrant introuvable',
        );
      }

      return this.prisma.stage.findMany({
        where: {
          supervisorId: user.supervisor.id,
        },
        include: {
          student: true,
          internship: true,
          company: true,
          reports: true,
          evaluations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === Role.ADMIN) {
      return this.prisma.stage.findMany({
        include: {
          student: true,
          company: true,
          supervisor: true,
          internship: true,
          reports: true,
          evaluations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    throw new ForbiddenException(
      'Accès non autorisé',
    );
  }

  // =========================================================
  // GET ONE STAGE
  // =========================================================

  async findOne(userId: string, stageId: string) {
    const stage = await this.prisma.stage.findUnique({
      where: {
        id: stageId,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: {
          include: {
            company: true,
            supervisor: true,
          },
        },
        reports: true,
        evaluations: true,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable');
    }

    await this.checkAccess(userId, stage);

    return stage;
  }

  // =========================================================
  // UPDATE STAGE
  // =========================================================

  async update(
    userId: string,
    stageId: string,
    dto: UpdateStageDto,
  ) {
    const stage = await this.prisma.stage.findUnique({
      where: {
        id: stageId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable');
    }

    await this.checkAccess(userId, stage);

    const updatedStage = await this.prisma.stage.update({
      where: {
        id: stageId,
      },
      data: {
        status: dto.status,
        progression: dto.progression,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : undefined,
        endDate: dto.endDate
          ? new Date(dto.endDate)
          : undefined,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
        reports: true,
        evaluations: true,
      },
    });

    return updatedStage;
  }

  // =========================================================
  // DELETE STAGE
  // =========================================================

  async remove(userId: string, stageId: string) {
    const stage = await this.prisma.stage.findUnique({
      where: {
        id: stageId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        company: true,
        supervisor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const allowed =
      user.role === Role.ADMIN ||
      (user.role === Role.COMPANY &&
        user.company?.id === stage.companyId) ||
      (user.role === Role.SUPERVISOR &&
        user.supervisor?.id === stage.supervisorId);

    if (!allowed) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer ce stage',
      );
    }

    await this.prisma.stage.delete({
      where: {
        id: stageId,
      },
    });

    return {
      message: 'Stage supprimé avec succès',
    };
  }

  // =========================================================
  // ACCESS CONTROL
  // =========================================================

  private async checkAccess(
    userId: string,
    stage: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === Role.ADMIN) {
      return;
    }

    if (
      user.role === Role.STUDENT &&
      user.student?.id === stage.studentId
    ) {
      return;
    }

    if (
      user.role === Role.COMPANY &&
      user.company?.id === stage.companyId
    ) {
      return;
    }

    if (
      user.role === Role.SUPERVISOR &&
      user.supervisor?.id === stage.supervisorId
    ) {
      return;
    }

    throw new ForbiddenException(
      'Vous n’avez pas accès à ce stage',
    );
  }
}