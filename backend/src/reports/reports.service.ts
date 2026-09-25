import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto, UpdateReportDto } from './dto/report.dto.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) throw new NotFoundException('Stage introuvable.');

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) throw new NotFoundException('Étudiant introuvable.');

    return this.prisma.report.create({
      data: {
        stageId: dto.stageId,
        studentId: dto.studentId,
        fileUrl: dto.fileUrl,
        status: dto.status ?? 'DEPOSE',
        comment: dto.comment,
        submittedAt: new Date(),
      },
      include: {
        stage: {
          include: {
            internship: true,
            company: true,
            supervisor: true,
          },
        },
        student: true,
      },
    });
  }

  async findAll() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
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
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
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

    if (!report) throw new NotFoundException('Rapport introuvable.');

    return report;
  }

  async update(id: string, dto: UpdateReportDto) {
    const existing = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Rapport introuvable.');

    return this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        comment: dto.comment,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Rapport introuvable.');

    await this.prisma.report.delete({
      where: { id },
    });

    return { success: true };
  }
}