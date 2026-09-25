import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto.js';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompanyEvaluation(dto: CreateEvaluationDto) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) throw new NotFoundException('Stage introuvable.');

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

  async createStudentEvaluation(dto: CreateEvaluationDto) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) throw new NotFoundException('Stage introuvable.');

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

  async createSupervisorEvaluation(dto: CreateEvaluationDto) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) throw new NotFoundException('Stage introuvable.');

    return this.prisma.supervisorEvaluation.create({
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

  async getAll() {
    const [company, student, supervisor] = await Promise.all([
      this.prisma.companyEvaluation.findMany({
        include: {
          stage: { include: { student: true, internship: true, company: true } },
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentEvaluation.findMany({
        include: {
          stage: { include: { student: true, internship: true, company: true } },
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supervisorEvaluation.findMany({
        include: {
          stage: { include: { student: true, internship: true, company: true } },
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { company, student, supervisor };
  }

  async updateCompany(id: string, dto: UpdateEvaluationDto) {
    const existing = await this.prisma.companyEvaluation.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Évaluation introuvable.');

    return this.prisma.companyEvaluation.update({
      where: { id },
      data: dto,
    });
  }

  async updateStudent(id: string, dto: UpdateEvaluationDto) {
    const existing = await this.prisma.studentEvaluation.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Évaluation introuvable.');

    return this.prisma.studentEvaluation.update({
      where: { id },
      data: dto,
    });
  }

  async updateSupervisor(id: string, dto: UpdateEvaluationDto) {
    const existing = await this.prisma.supervisorEvaluation.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Évaluation introuvable.');

    return this.prisma.supervisorEvaluation.update({
      where: { id },
      data: dto,
    });
  }
}