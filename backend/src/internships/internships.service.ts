import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInternshipDto, UpdateInternshipDto, InternshipQueryDto } from './dto/internship.dto.js';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInternshipDto) {
    return this.prisma.internship.create({
      data: {
        title: dto.title,
        description: dto.description,
        domain: dto.domain,
        duration: dto.duration,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        numberOfPlaces: dto.numberOfPlaces ?? 1,
        status: dto.status ?? 'BROUILLON',
        companyId: dto.companyId,
        supervisorId: dto.supervisorId,
      },
    });
  }

  async findAll(query: InternshipQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { domain: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.domain) {
      where.domain = { contains: query.domain, mode: 'insensitive' };
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.internship.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          supervisor: true,
          skillLinks: { include: { skill: true } },
        },
      }),
      this.prisma.internship.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const internship = await this.prisma.internship.findUnique({
      where: { id },
      include: {
        company: true,
        supervisor: true,
        skillLinks: { include: { skill: true } },
        applications: true,
      },
    });

    if (!internship) {
      throw new NotFoundException('Offre introuvable.');
    }

    return internship;
  }

  async update(id: string, dto: UpdateInternshipDto) {
    const existing = await this.prisma.internship.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Offre introuvable.');
    }

    return this.prisma.internship.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        domain: dto.domain,
        duration: dto.duration,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        numberOfPlaces: dto.numberOfPlaces,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.internship.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Offre introuvable.');
    }

    await this.prisma.internship.delete({ where: { id } });
    return { success: true };
  }
}
