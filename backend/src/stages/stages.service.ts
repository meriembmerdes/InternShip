import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {CreateStageDto} from './dto/create-stage.dto.js';
import {UpdateStageDto} from './dto/update-stage.dto.js';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStageDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Étudiant introuvable.');
    }

    const internship = await this.prisma.internship.findUnique({
      where: { id: dto.internshipId },
    });

    if (!internship) {
      throw new NotFoundException('Offre de stage introuvable.');
    }

    return this.prisma.stage.create({
      data: {
        studentId: dto.studentId,
        internshipId: dto.internshipId,
        companyId: dto.companyId,
        supervisorId: dto.supervisorId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status ?? 'EN_ATTENTE',
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
      },
    });
  }

  async findAll() {
    return this.prisma.stage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
        reports: true,
      },
    });
  }

  async findOne(id: string) {
    const stage = await this.prisma.stage.findUnique({
      where: { id },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
        reports: true,
        evaluations: true,
        studentEval: true,
        supervisorEval: true,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable.');
    }

    return stage;
  }

  async update(id: string, dto: UpdateStageDto) {
    const existing = await this.prisma.stage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Stage introuvable.');
    }

    return this.prisma.stage.update({
      where: { id },
      data: {
        status: dto.status,
        progression: dto.progression,
        supervisorId: dto.supervisorId,
        companyId: dto.companyId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        student: true,
        company: true,
        supervisor: true,
        internship: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.stage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Stage introuvable.');
    }

    await this.prisma.stage.delete({
      where: { id },
    });

    return { success: true };
  }
}