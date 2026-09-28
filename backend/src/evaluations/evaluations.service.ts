import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  CreateEvaluationDto,
  UpdateEvaluationDto,
} from './dto/evaluation.dto.js';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getSupervisorId(user: any) {
  const supervisor = await this.prisma.supervisor.findUnique({
    where: { userId: user.userId },
  });

  if (!supervisor) {
    throw new NotFoundException(
      'Encadrant introuvable.',
    );
  }

  return supervisor.id;
}

  async createCompanyEvaluation(
  dto: CreateEvaluationDto,
  user: any,
) {
  const stage = await this.prisma.stage.findUnique({
    where: { id: dto.stageId },
  });

  if (!stage) {
    throw new NotFoundException(
      'Stage introuvable.',
    );
  }

  return this.prisma.companyEvaluation.create({
    data: {
      stageId: dto.stageId,
      authorId: dto.authorId,
      criteria: dto.criteria,
      comment: dto.comment,
      status: dto.status ?? 'EN_ATTENTE',
    },
    include: {
      stage: {
        include: {
          student: true,
          internship: true,
          company: true,
        },
      },
      author: true,
    },
  });
}

  async createStudentEvaluation(
  dto: CreateEvaluationDto,
  user: any,
) {
  const stage = await this.prisma.stage.findUnique({
    where: { id: dto.stageId },
  });

  if (!stage) {
    throw new NotFoundException(
      'Stage introuvable.',
    );
  }

  return this.prisma.studentEvaluation.create({
    data: {
      stageId: dto.stageId,
      authorId: dto.authorId,
      criteria: dto.criteria,
      comment: dto.comment,
      status: dto.status ?? 'EN_ATTENTE',
    },
    include: {
      stage: {
        include: {
          student: true,
          internship: true,
          company: true,
        },
      },
      author: true,
    },
  });
}

  async createSupervisorEvaluation(
    dto: CreateEvaluationDto,
    user: any,
  ) {
    const supervisorId =
      await this.getSupervisorId(user.id);

    const stage = await this.prisma.stage.findFirst({
      where: {
        id: dto.stageId,
        supervisorId,
      },
    });

    if (!stage) {
      throw new ForbiddenException(
        'Ce stage ne vous est pas attribué.',
      );
    }

    const existing =
      await this.prisma.supervisorEvaluation.findFirst({
        where: {
          stageId: dto.stageId,
          authorId: supervisorId,
        },
      });

    if (existing) {
      throw new ForbiddenException(
        'Une évaluation existe déjà pour ce stage.',
      );
    }

    return this.prisma.supervisorEvaluation.create({
      data: {
        stageId: dto.stageId,
        authorId: supervisorId,
        type: 'SUPERVISOR_TO_STUDENT',
        criteria: dto.criteria,
        comment: dto.comment,
        status: dto.status ?? 'EN_ATTENTE',
      },
      include: {
        stage: {
          include: {
            student: true,
            internship: true,
            company: true,
          },
        },
        author: true,
      },
    });
  }

  async getAll(user: any) {
    const [
      company,
      student,
      supervisor,
    ] = await Promise.all([
      this.prisma.companyEvaluation.findMany({
        include: {
          stage: {
            include: {
              student: true,
              internship: true,
              company: true,
            },
          },
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.studentEvaluation.findMany({
        include: {
          stage: {
            include: {
              student: true,
              internship: true,
              company: true,
            },
          },
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.supervisorEvaluation.findMany({
        include: {
          stage: {
            include: {
              student: true,
              internship: true,
              company: true,
            },
          },
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      company,
      student,
      supervisor,
    };
  }

  async updateCompany(
    id: string,
    dto: UpdateEvaluationDto,
  ) {
    const existing =
      await this.prisma.companyEvaluation.findUnique({
        where: { id },
      });

    if (!existing) {
      throw new NotFoundException(
        'Évaluation introuvable.',
      );
    }

    return this.prisma.companyEvaluation.update({
      where: { id },
      data: dto,
    });
  }

  async updateStudent(
    id: string,
    dto: UpdateEvaluationDto,
  ) {
    const existing =
      await this.prisma.studentEvaluation.findUnique({
        where: { id },
      });

    if (!existing) {
      throw new NotFoundException(
        'Évaluation introuvable.',
      );
    }

    return this.prisma.studentEvaluation.update({
      where: { id },
      data: dto,
    });
  }

  async updateSupervisor(
  id: string,
  dto: UpdateEvaluationDto,
  user: any,
) {
  const supervisorId =
    await this.getSupervisorId(user);

  const existing =
    await this.prisma.supervisorEvaluation.findFirst({
      where: {
        id,
        authorId: supervisorId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      'Évaluation introuvable.',
    );
  }

  return this.prisma.supervisorEvaluation.update({
    where: { id },
    data: dto,
  });
}
}