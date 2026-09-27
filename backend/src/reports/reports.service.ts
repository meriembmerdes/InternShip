import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, ReportStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    stageId: string,
    file: Express.Multer.File,
    user: any,
  ) {
    const student = await this.prisma.student.findUnique({
      where: {
        userId: user.userId,
      },
    });

    if (!student) {
      throw new ForbiddenException(
        'Profil étudiant introuvable.',
      );
    }

    const stage = await this.prisma.stage.findUnique({
      where: {
        id: stageId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable.');
    }

    if (stage.studentId !== student.id) {
      throw new ForbiddenException(
        'Vous ne pouvez déposer un rapport que pour votre propre stage.',
      );
    }

    const fileUrl = `/uploads/reports/${file.filename}`;

    return this.prisma.report.create({
      data: {
        stageId,
        studentId: student.id,
        fileUrl,
        submittedAt: new Date(),
        status: ReportStatus.DEPOSE,
      },
      include: {
        stage: {
          include: {
            internship: true,
            company: true,
          },
        },
      },
    });
  }

  async getAll(user: any) {
    if (user.role === Role.ADMIN) {
      return this.prisma.report.findMany({
        include: {
          stage: {
            include: {
              internship: true,
              company: true,
              student: true,
            },
          },
          student: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          userId: user.userId,
        },
      });

      if (!student) {
        throw new ForbiddenException(
          'Profil étudiant introuvable.',
        );
      }

      return this.prisma.report.findMany({
        where: {
          studentId: student.id,
        },
        include: {
          stage: {
            include: {
              internship: true,
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.report.findMany({
      include: {
        stage: {
          include: {
            internship: true,
            company: true,
            student: true,
          },
        },
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string, user: any) {
    const report = await this.prisma.report.findUnique({
      where: {
        id,
      },
      include: {
        stage: {
          include: {
            internship: true,
            company: true,
            student: true,
          },
        },
        student: true,
      },
    });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          userId: user.userId,
        },
      });

      if (!student || report.studentId !== student.id) {
        throw new ForbiddenException(
          'Accès interdit à ce rapport.',
        );
      }
    }

    return report;
  }

  async update(
    id: string,
    data: {
      status?: ReportStatus;
      comment?: string;
    },
    user: any,
  ) {
    const report = await this.prisma.report.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          userId: user.userId,
        },
      });

      if (!student || report.studentId !== student.id) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier ce rapport.',
        );
      }
    }

    return this.prisma.report.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: string, user: any) {
    const report = await this.prisma.report.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      throw new NotFoundException(
        'Rapport introuvable.',
      );
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          userId: user.userId,
        },
      });

      if (!student || report.studentId !== student.id) {
        throw new ForbiddenException(
          'Vous ne pouvez pas supprimer ce rapport.',
        );
      }
    }

    await this.prisma.report.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Rapport supprimé avec succès.',
    };
  }
  async updateStatus(
  id: string,
  status: ReportStatus,
  comment: string | undefined,
  user: any,
) {
  const supervisor = await this.prisma.supervisor.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!supervisor) {
    throw new ForbiddenException(
      'Profil encadrant introuvable.',
    );
  }

  const report = await this.prisma.report.findUnique({
    where: {
      id,
    },
    include: {
      stage: true,
    },
  });

  if (!report) {
    throw new NotFoundException(
      'Rapport introuvable.',
    );
  }

  if (report.stage.supervisorId !== supervisor.id) {
    throw new ForbiddenException(
      'Vous ne pouvez modifier que les rapports des étudiants que vous encadrez.',
    );
  }

  return this.prisma.report.update({
    where: {
      id,
    },
    data: {
      status,
      comment,
    },
    include: {
      student: true,
      stage: {
        include: {
          internship: true,
        },
      },
    },
  });
}
}