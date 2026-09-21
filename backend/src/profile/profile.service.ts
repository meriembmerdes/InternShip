import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        supervisor: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      student: user.student,
      supervisor: user.supervisor,
      company: user.company,
    };
  }

  async updateStudentProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      institution?: string;
      specialty?: string;
      level?: string;
      bio?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role !== Role.STUDENT || !user.student) {
      throw new ForbiddenException(
        'Ce profil est réservé aux étudiants.',
      );
    }

    return this.prisma.student.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        institution: data.institution,
        specialty: data.specialty,
        level: data.level,
        bio: data.bio,
      },
    });
  }

  async updateSupervisorProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      profession?: string;
      department?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { supervisor: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role !== Role.SUPERVISOR || !user.supervisor) {
      throw new ForbiddenException(
        'Ce profil est réservé aux encadrants.',
      );
    }

    return this.prisma.supervisor.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        profession: data.profession,
        department: data.department,
      },
    });
  }

  async updateCompanyProfile(
    userId: string,
    data: {
      managerName?: string;
      companyName?: string;
      sector?: string;
      address?: string;
      phone?: string;
      managerTitle?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role !== Role.COMPANY || !user.company) {
      throw new ForbiddenException(
        'Ce profil est réservé aux entreprises.',
      );
    }

    return this.prisma.company.update({
      where: { userId },
      data: {
        managerName: data.managerName,
        companyName: data.companyName,
        sector: data.sector,
        address: data.address,
        phone: data.phone,
        managerTitle: data.managerTitle,
      },
    });
  }
}