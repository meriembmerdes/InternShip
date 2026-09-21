import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  CreateInternshipDto,
  InternshipQueryDto,
  UpdateInternshipDto,
} from './dto/internship.dto.js';

import { Role, InternshipStatus } from '@prisma/client';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREATE
  // =========================================================

  async create(dto: CreateInternshipDto, user: any) {
    let companyId = dto.companyId;
    let supervisorId = dto.supervisorId;

    // Une entreprise crée automatiquement une offre pour elle-même
    if (user.role === Role.COMPANY) {
      const company = await this.prisma.company.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!company) {
        throw new NotFoundException(
          'Profil entreprise introuvable.',
        );
      }

      companyId = company.id;
      supervisorId = undefined;
    }

    // Un encadrant crée automatiquement une offre pour lui-même
    if (user.role === Role.SUPERVISOR) {
      const supervisor = await this.prisma.supervisor.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!supervisor) {
        throw new NotFoundException(
          'Profil encadrant introuvable.',
        );
      }

      supervisorId = supervisor.id;
      companyId = undefined;
    }

    const status =
      dto.status ?? InternshipStatus.BROUILLON;

    return this.prisma.internship.create({
      data: {
        title: dto.title,
        description: dto.description,
        domain: dto.domain,
        duration: dto.duration,
        location: dto.location,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : undefined,
        endDate: dto.endDate
          ? new Date(dto.endDate)
          : undefined,
        numberOfPlaces: dto.numberOfPlaces ?? 1,

        status,

        publishedAt:
          status === InternshipStatus.PUBLIEE
            ? new Date()
            : undefined,

        companyId,
        supervisorId,
      },

      include: {
        company: true,
        supervisor: true,
        skillLinks: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  // =========================================================
  // FIND ALL
  // =========================================================

  async findAll(
    query: InternshipQueryDto,
    user: any,
  ) {
    const page = Math.max(Number(query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(query.limit) || 10, 1),
      50,
    );

    const skip = (page - 1) * limit;

    const where: any = {};

    // -------------------------------------------------------
    // STUDENT
    // -------------------------------------------------------

    if (user.role === Role.STUDENT) {
      where.status = InternshipStatus.PUBLIEE;
    }

    // -------------------------------------------------------
    // COMPANY
    // -------------------------------------------------------

    if (user.role === Role.COMPANY) {
      const company = await this.prisma.company.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!company) {
        throw new NotFoundException(
          'Profil entreprise introuvable.',
        );
      }

      where.companyId = company.id;
    }

    // -------------------------------------------------------
    // SUPERVISOR
    // -------------------------------------------------------

    if (user.role === Role.SUPERVISOR) {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (!supervisor) {
        throw new NotFoundException(
          'Profil encadrant introuvable.',
        );
      }

      where.supervisorId = supervisor.id;
    }

    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

    if (
      user.role === Role.ADMIN &&
      query.status
    ) {
      where.status = query.status;
    }

    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          domain: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          location: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.domain) {
      where.domain = {
        contains: query.domain,
        mode: 'insensitive',
      };
    }

    if (query.location) {
      where.location = {
        contains: query.location,
        mode: 'insensitive',
      };
    }

    const [data, total] =
      await Promise.all([
        this.prisma.internship.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            createdAt: 'desc',
          },

          include: {
            company: true,
            supervisor: true,

            skillLinks: {
              include: {
                skill: true,
              },
            },
          },
        }),

        this.prisma.internship.count({
          where,
        }),
      ]);

    return {
      data,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =========================================================
  // FIND ONE
  // =========================================================

  async findOne(id: string, user: any) {
    const internship =
      await this.prisma.internship.findUnique({
        where: {
          id,
        },

        include: {
          company: true,
          supervisor: true,

          skillLinks: {
            include: {
              skill: true,
            },
          },

          applications: {
            include: {
              student: true,
            },
          },
        },
      });

    if (!internship) {
      throw new NotFoundException(
        'Offre de stage introuvable.',
      );
    }

    // Student -> uniquement les offres publiées
    if (
      user.role === Role.STUDENT &&
      internship.status !== InternshipStatus.PUBLIEE
    ) {
      throw new ForbiddenException(
        'Cette offre n’est pas disponible.',
      );
    }

    // Company -> uniquement ses offres
    if (user.role === Role.COMPANY) {
      const company =
        await this.prisma.company.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !company ||
        internship.companyId !== company.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas consulter cette offre.',
        );
      }
    }

    // Supervisor -> uniquement ses offres
    if (user.role === Role.SUPERVISOR) {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !supervisor ||
        internship.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas consulter cette offre.',
        );
      }
    }

    return internship;
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    id: string,
    dto: UpdateInternshipDto,
    user: any,
  ) {
    const internship =
      await this.prisma.internship.findUnique({
        where: { id },
      });

    if (!internship) {
      throw new NotFoundException(
        'Offre de stage introuvable.',
      );
    }

    if (user.role !== Role.ADMIN) {
      await this.checkOwnership(
        internship,
        user,
      );
    }

    const newStatus =
      dto.status ?? internship.status;

    const publishedAt =
      newStatus === InternshipStatus.PUBLIEE
        ? internship.publishedAt ?? new Date()
        : null;

    return this.prisma.internship.update({
      where: {
        id,
      },

      data: {
        title: dto.title,
        description: dto.description,
        domain: dto.domain,
        duration: dto.duration,
        location: dto.location,

        startDate: dto.startDate
          ? new Date(dto.startDate)
          : undefined,

        endDate: dto.endDate
          ? new Date(dto.endDate)
          : undefined,

        numberOfPlaces:
          dto.numberOfPlaces,

        status: newStatus,

        publishedAt,

        ...(user.role === Role.ADMIN
          ? {
              companyId: dto.companyId,
              supervisorId: dto.supervisorId,
            }
          : {}),
      },

      include: {
        company: true,
        supervisor: true,

        skillLinks: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  // =========================================================
  // DELETE
  // =========================================================

  async remove(
    id: string,
    user: any,
  ) {
    const internship =
      await this.prisma.internship.findUnique({
        where: { id },
      });

    if (!internship) {
      throw new NotFoundException(
        'Offre de stage introuvable.',
      );
    }

    if (user.role !== Role.ADMIN) {
      await this.checkOwnership(
        internship,
        user,
      );
    }

    return this.prisma.internship.delete({
      where: {
        id,
      },
    });
  }

  // =========================================================
  // OWNERSHIP
  // =========================================================

  private async checkOwnership(
    internship: any,
    user: any,
  ) {
    if (user.role === Role.COMPANY) {
      const company =
        await this.prisma.company.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !company ||
        internship.companyId !== company.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette offre.',
        );
      }
    }

    if (user.role === Role.SUPERVISOR) {
      const supervisor =
        await this.prisma.supervisor.findUnique({
          where: {
            userId: user.id,
          },
        });

      if (
        !supervisor ||
        internship.supervisorId !== supervisor.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas modifier cette offre.',
        );
      }
    }
  }
}