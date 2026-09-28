import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateReportStatusDto } from './dto/report.dto.js';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(user: any) {
    const where: any = {};

    if (user.role === 'STUDENT') {
      const student =
        await this.prisma.student.findUnique({
          where: {
            userId: user.userId,
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
            userId: user.userId,
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

    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.userId,
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

  async updateStatus(
    id: string,
    dto: UpdateReportStatusDto,
    user: any,
  ) {
    const supervisor =
      await this.prisma.supervisor.findUnique({
        where: {
          userId: user.userId,
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