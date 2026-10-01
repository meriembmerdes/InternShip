import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {CreateStageDto} from './dto/create-stage.dto.js';
import {UpdateStageDto} from './dto/update-stage.dto.js';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStageDto, user: any) {
  const student = await this.prisma.student.findUnique({
    where: { id: dto.studentId },
  });

  if (!student) {
    throw new NotFoundException('Étudiant introuvable.');
  }

  const application = await this.prisma.application.findUnique({
    where: {
      studentId_internshipId: {
        studentId: student.id,
        internshipId: dto.internshipId,
      },
    },
    include: {
      internship: true,
    },
  });

  if (!application) {
    throw new NotFoundException('Candidature introuvable.');
  }

  if (application.status !== 'ACCEPTEE') {
    throw new ForbiddenException(
      'Vous ne pouvez sélectionner que les candidatures acceptées.',
    );
  }

  // Vérifier si l'étudiant possède déjà un stage en cours
  const activeStage = await this.prisma.stage.findFirst({
    where: {
      studentId: student.id,
      status: {
        in: ['EN_COURS', 'SUSPENDU'],
      },
    },
  });

  if (activeStage) {
    throw new ForbiddenException(
      'Vous avez déjà un stage en cours. Vous pourrez sélectionner un autre stage après sa terminaison.',
    );
  }

  // Vérifier que cette candidature n'a pas déjà été transformée en stage
  const existingStage = await this.prisma.stage.findFirst({
    where: {
      studentId: student.id,
      internshipId: application.internshipId,
    },
  });

  if (existingStage) {
    throw new ForbiddenException(
      'Cette candidature a déjà été sélectionnée.',
    );
  }

  return this.prisma.stage.create({
    data: {
      studentId: student.id,
      internshipId: application.internshipId,

      companyId:
        application.internship.companyId ?? undefined,

      supervisorId:
        application.internship.supervisorId ?? undefined,

      startDate: application.internship.startDate
        ? application.internship.startDate
        : new Date(),

      endDate:
        application.internship.endDate ?? undefined,

      status: 'EN_COURS',

      progression: 0,
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

  async update(id: string, dto: UpdateStageDto, user: any) {
  const existing = await this.prisma.stage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundException('Stage introuvable.');
  }

  const data: any = {};

  if (dto.status !== undefined) {
    data.status = dto.status;
  }

  if (dto.progression !== undefined) {
    data.progression = dto.progression;
  }

  if (dto.supervisorId !== undefined) {
    data.supervisorId = dto.supervisorId;
  }

  if (dto.companyId !== undefined) {
    data.companyId = dto.companyId;
  }

  if (dto.startDate !== undefined) {
    data.startDate = new Date(dto.startDate);
  }

  if (dto.endDate !== undefined) {
    data.endDate = new Date(dto.endDate);
  }

  // Si le stage est terminé
  if (dto.status === 'TERMINE') {
    data.progression = 100;
  }

  return this.prisma.stage.update({
    where: { id },

    data,

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