import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateReportStatusDto } from './dto/report.dto.js';

import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    stageId: string,
    fileUrl: string,
    user: any,
  ) {
    const student =
      await this.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!student) {
      throw new ForbiddenException(
        'Profil étudiant introuvable.',
      );
    }

    const stage =
      await this.prisma.stage.findUnique({
        where: {
          id: stageId,
        },
      });

    if (!stage) {
      throw new NotFoundException(
        'Stage introuvable.',
      );
    }

    if (stage.studentId !== student.id) {
      throw new ForbiddenException(
        'Vous ne pouvez pas déposer un rapport pour ce stage.',
      );
    }

    if (stage.status !== 'TERMINE') {
      throw new ForbiddenException(
        'Vous ne pouvez déposer le rapport qu’une fois le stage terminé.',
      );
    }

    const existingReport =
      await this.prisma.report.findFirst({
        where: {
          stageId,
          studentId: student.id,
        },
      });

    if (existingReport) {
      throw new ForbiddenException(
        'Un rapport existe déjà pour ce stage.',
      );
    }

    return this.prisma.report.create({
      data: {
        stageId,
        studentId: student.id,
        fileUrl,
        status: 'DEPOSE',
        submittedAt: new Date(),
      },

      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },

        stage: {
          include: {
            internship: true,
            company: true,
            supervisor: true,
          },
        },
      },
    });
  }

  async findAll(user: any) {
    const where: any = {};

    if (user.role === 'STUDENT') {
      const student =
        await this.prisma.student.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (!student) {
        return [];
      }

      where.studentId = student.id;
    }

    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (!supervisor) {
        return [];
      }

      where.stage = {
        supervisorId: supervisor.id,
      };
    }

    return this.prisma.report.findMany({
      where,

      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },

        stage: {
          include: {
            internship: {
              select: {
                id: true,
                title: true,
                domain: true,
              },
            },

            company: {
              select: {
                id: true,
                companyName: true,
              },
            },

            supervisor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: any) {
    const report =
      await this.prisma.report.findUnique({
        where: { id },

        include: {
          student: true,

          stage: {
            include: {
              internship: true,
              company: true,
              supervisor: true,
            },
          },
        },
      });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    if (user.role === 'STUDENT') {
      const student =
        await this.prisma.student.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !student ||
        report.studentId !== student.id
      ) {
        throw new ForbiddenException(
          'Vous n’êtes pas autorisé à consulter ce rapport.',
        );
      }
    }

    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !supervisor ||
        report.stage.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous n’êtes pas autorisé à consulter ce rapport.',
        );
      }
    }

    return report;
  }

  /**
   * Retourne le chemin physique du fichier PDF
   * après vérification des droits d'accès.
   */
  async getFilePath(
    id: string,
    user: any,
  ): Promise<string> {
    const report =
      await this.prisma.report.findUnique({
        where: { id },

        include: {
          stage: true,
        },
      });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    /**
     * STUDENT :
     * uniquement son propre rapport.
     */
    if (user.role === 'STUDENT') {
      if (report.studentId !== await this.getStudentId(user.id)) {
        throw new ForbiddenException(
          'Vous n’êtes pas autorisé à consulter ce rapport.',
        );
      }
    }

    /**
     * SUPERVISOR :
     * uniquement les rapports des stages
     * qu'il encadre.
     */
    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !supervisor ||
        report.stage.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous n’êtes pas autorisé à consulter ce rapport.',
        );
      }
    }

    /**
     * ADMIN :
     * accès autorisé.
     */

    /**
     * fileUrl contient par exemple :
     *
     * /uploads/reports/1791039811153-716994790.pdf
     *
     * On récupère uniquement le nom du fichier
     * pour éviter toute tentative de traversal.
     */
    const filename =
      report.fileUrl.split('/').pop();

    if (!filename) {
      throw new NotFoundException(
        'Fichier du rapport introuvable.',
      );
    }

    const filePath = join(
      process.cwd(),
      'uploads',
      'reports',
      filename,
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'Fichier PDF introuvable sur le serveur.',
      );
    }

    return filePath;
  }

  private async getStudentId(
    userId: string,
  ): Promise<string> {
    const student =
      await this.prisma.student.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });

    if (!student) {
      throw new ForbiddenException(
        'Profil étudiant introuvable.',
      );
    }

    return student.id;
  }

  async updateStatus(
    id: string,
    dto: UpdateReportStatusDto,
    user: any,
  ) {
    const supervisor =
      await this.prisma.supervisor.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!supervisor) {
      throw new ForbiddenException(
        'Profil encadrant introuvable.',
      );
    }

    const report =
      await this.prisma.report.findUnique({
        where: { id },

        include: {
          stage: true,
        },
      });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    if (
      report.stage.supervisorId !== supervisor.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier ce rapport.',
      );
    }

    return this.prisma.report.update({
      where: { id },

      data: {
        status: dto.status,
        comment: dto.comment,
      },

      include: {
        student: true,

        stage: {
          include: {
            internship: true,
            company: true,
          },
        },
      },
    });
  }
}