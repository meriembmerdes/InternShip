import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREER UNE TACHE
  // =========================================================

  async create(dto: CreateTaskDto, user: any) {
    const stage = await this.prisma.stage.findUnique({
      where: {
        id: dto.stageId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage introuvable.');
    }

    // =======================================================
    // IDENTIFIANT DE L'UTILISATEUR CONNECTE
    // =======================================================

    const userId = user?.id ?? user?.userId;

    console.log('====================================');
    console.log('CREATION TACHE');
    console.log('USER CONNECTE :', user);
    console.log('USER ID UTILISE :', userId);
    console.log('ROLE :', user?.role);
    console.log('STAGE ID :', stage.id);
    console.log('STAGE SUPERVISOR ID :', stage.supervisorId);
    console.log('STAGE COMPANY ID :', stage.companyId);
    console.log('STAGE STATUS :', stage.status);
    console.log('====================================');

    // =======================================================
    // ENCADRANT
    // =======================================================

    if (user.role === 'SUPERVISOR') {
      if (!userId) {
        throw new ForbiddenException(
          'Utilisateur non identifié.',
        );
      }

      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: userId,
          },
        });

      console.log(
        'SUPERVISOR TROUVE :',
        supervisor,
      );

      if (!supervisor) {
        throw new ForbiddenException(
          'Profil encadrant introuvable.',
        );
      }

      console.log(
        'SUPERVISOR ID :',
        supervisor.id,
      );

      console.log(
        'SUPERVISOR ID DU STAGE :',
        stage.supervisorId,
      );

      if (
        !stage.supervisorId ||
        stage.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas ajouter une tâche à ce stage.',
        );
      }
    }

    // =======================================================
    // ENTREPRISE
    // =======================================================

    if (user.role === 'COMPANY') {
      if (!userId) {
        throw new ForbiddenException(
          'Utilisateur non identifié.',
        );
      }

      const company =
        await this.prisma.company.findUnique({
          where: {
            userId: userId,
          },
        });

      if (!company) {
        throw new ForbiddenException(
          'Profil entreprise introuvable.',
        );
      }

      if (
        !stage.companyId ||
        stage.companyId !== company.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas ajouter une tâche à ce stage.',
        );
      }
    }

    // =======================================================
    // LE STAGE DOIT ETRE EN COURS
    // =======================================================

    if (stage.status !== 'EN_COURS') {
      throw new ForbiddenException(
        'Les tâches peuvent uniquement être ajoutées à un stage en cours.',
      );
    }

    // =======================================================
    // CREATION DE LA TACHE
    // =======================================================

    const task =
      await this.prisma.stageTask.create({
        data: {
          title: dto.title,
          description: dto.description,
          stageId: dto.stageId,
        },
      });

    return task;
  }

  // =========================================================
  // TACHES D'UN STAGE
  // =========================================================

  async findByStage(stageId: string) {
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

    return this.prisma.stageTask.findMany({
      where: {
        stageId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // =========================================================
  // MODIFIER UNE TACHE
  // =========================================================

  async update(
    id: string,
    dto: UpdateTaskDto,
    user: any,
  ) {
    const task =
      await this.prisma.stageTask.findUnique({
        where: {
          id,
        },
        include: {
          stage: true,
        },
      });

    if (!task) {
      throw new NotFoundException(
        'Tâche introuvable.',
      );
    }

    const userId = user?.id ?? user?.userId;

    // =======================================================
    // ETUDIANT
    // =======================================================

    if (user.role === 'STUDENT') {
      const student =
        await this.prisma.student.findUnique({
          where: {
            userId: userId,
          },
        });

      if (
        !student ||
        task.stage.studentId !== student.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette tâche.',
        );
      }

      if (
        dto.title !== undefined ||
        dto.description !== undefined
      ) {
        throw new ForbiddenException(
          'L’étudiant peut uniquement modifier le statut de la tâche.',
        );
      }
    }

    // =======================================================
    // ENCADRANT
    // =======================================================

    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: userId,
          },
        });

      if (
        !supervisor ||
        task.stage.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette tâche.',
        );
      }
    }

    // =======================================================
    // ENTREPRISE
    // =======================================================

    if (user.role === 'COMPANY') {
      const company =
        await this.prisma.company.findUnique({
          where: {
            userId: userId,
          },
        });

      if (
        !company ||
        task.stage.companyId !== company.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette tâche.',
        );
      }
    }

    // =======================================================
    // DATE DE TERMINAISON
    // =======================================================

    const completedAt =
      dto.status === 'TERMINEE'
        ? new Date()
        : dto.status
          ? null
          : undefined;

    // =======================================================
    // MISE A JOUR
    // =======================================================

    const updatedTask =
      await this.prisma.stageTask.update({
        where: {
          id,
        },
        data: {
          ...(dto.title !== undefined && {
            title: dto.title,
          }),

          ...(dto.description !== undefined && {
            description: dto.description,
          }),

          ...(dto.status !== undefined && {
            status: dto.status,
          }),

          ...(completedAt !== undefined && {
            completedAt,
          }),
        },
      });

    // =======================================================
    // RECALCUL PROGRESSION
    // =======================================================

    await this.updateStageProgression(
      task.stageId,
    );

    return updatedTask;
  }

  // =========================================================
  // SUPPRIMER UNE TACHE
  // =========================================================

  async remove(
    id: string,
    user: any,
  ) {
    const task =
      await this.prisma.stageTask.findUnique({
        where: {
          id,
        },
        include: {
          stage: true,
        },
      });

    if (!task) {
      throw new NotFoundException(
        'Tâche introuvable.',
      );
    }

    const userId = user?.id ?? user?.userId;

    // =======================================================
    // ENCADRANT
    // =======================================================

    if (user.role === 'SUPERVISOR') {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: userId,
          },
        });

      if (
        !supervisor ||
        task.stage.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas supprimer cette tâche.',
        );
      }
    }

    // =======================================================
    // ENTREPRISE
    // =======================================================

    if (user.role === 'COMPANY') {
      const company =
        await this.prisma.company.findUnique({
          where: {
            userId: userId,
          },
        });

      if (
        !company ||
        task.stage.companyId !== company.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas supprimer cette tâche.',
        );
      }
    }

    await this.prisma.stageTask.delete({
      where: {
        id,
      },
    });

    await this.updateStageProgression(
      task.stageId,
    );

    return {
      success: true,
    };
  }

  // =========================================================
  // RECALCUL DE LA PROGRESSION
  // =========================================================

  private async updateStageProgression(
    stageId: string,
  ) {
    const tasks =
      await this.prisma.stageTask.findMany({
        where: {
          stageId,
        },
      });

    // Aucune tâche
    if (tasks.length === 0) {
      await this.prisma.stage.update({
        where: {
          id: stageId,
        },
        data: {
          progression: 0,
        },
      });

      return;
    }

    const completedTasks =
      tasks.filter(
        (task) =>
          task.status === 'TERMINEE',
      ).length;

    const progression =
      Math.round(
        (completedTasks / tasks.length) * 100,
      );

    await this.prisma.stage.update({
      where: {
        id: stageId,
      },
      data: {
        progression,
      },
    });
  }
}