import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // MES NOTIFICATIONS
  // ============================================================

  async findMine(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // NOMBRE DE NOTIFICATIONS NON LUES
  // ============================================================

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      count,
    };
  }

  // ============================================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ============================================================

  async markAsRead(
    id: string,
    userId: string,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification introuvable.',
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette notification.',
      );
    }

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  // ============================================================
  // MARQUER TOUTES LES NOTIFICATIONS COMME LUES
  // ============================================================

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues.',
    };
  }

  // ============================================================
  // SUPPRIMER UNE NOTIFICATION
  // ============================================================

  async remove(
    id: string,
    userId: string,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification introuvable.',
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer cette notification.',
      );
    }

    await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }
}