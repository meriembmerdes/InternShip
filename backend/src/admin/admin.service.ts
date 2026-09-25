import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserQueryDto } from './dto/admin.dto.js';
import { UserStatus } from '@prisma/client';
import { StudentQueryDto } from './dto/student.dto.js';
import { SupervisorQueryDto } from './dto/supervisor.dto.js';
import { CompanyQueryDto } from './dto/company.dto.js';
import { ApplicationStatus, PrismaClient } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: UserQueryDto) {
    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        {
          student: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          supervisor: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          company: {
            OR: [
              { companyName: { contains: query.search, mode: 'insensitive' } },
              { managerName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            institution: true,
            specialty: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
            department: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
            managerName: true,
            sector: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  }
  async getStudents(query: StudentQueryDto) {
  const where: any = {
    role: 'STUDENT',
  };

  if (query.status) {
    where.isActive = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        email: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
      {
        student: {
          firstName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
      {
        student: {
          lastName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  if (query.specialty) {
    where.student = {
      ...(where.student ?? {}),
      specialty: {
        contains: query.specialty,
        mode: 'insensitive',
      },
    };
  }

  return this.prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          institution: true,
          specialty: true,
          level: true,
          bio: true,
          cvUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async updateStudentStatus(id: string, status: UserStatus) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundException('Étudiant introuvable');
  }

  return this.prisma.user.update({
    where: { id },
    data: {
      isActive: status,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      student: true,
    },
  });
}
async getSupervisors(query: SupervisorQueryDto) {
  const where: any = {
    role: 'SUPERVISOR',
  };

  if (query.status) {
    where.isActive = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        email: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
      {
        supervisor: {
          firstName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
      {
        supervisor: {
          lastName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  if (query.department) {
    where.supervisor = {
      department: {
        contains: query.department,
        mode: 'insensitive',
      },
    };
  }

  return this.prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      supervisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profession: true,
          department: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async updateSupervisorStatus(id: string, status: UserStatus) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: { supervisor: true },
  });

  if (!user || user.role !== 'SUPERVISOR') {
    throw new NotFoundException('Encadrant introuvable');
  }

  return this.prisma.user.update({
    where: { id },
    data: {
      isActive: status,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      supervisor: true,
    },
  });
}
async getCompanies(query: CompanyQueryDto) {
  const where: any = { role: 'COMPANY' };

  if (query.status) {
    where.isActive = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        email: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
      {
        company: {
          companyName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
      {
        company: {
          managerName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  if (query.sector) {
    where.company = {
      sector: {
        contains: query.sector,
        mode: 'insensitive',
      },
    };
  }

  return this.prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          companyName: true,
          managerName: true,
          sector: true,
          address: true,
          phone: true,
          managerTitle: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async updateCompanyStatus(
  id: string,
  status: UserStatus,
) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!user || user.role !== 'COMPANY') {
    throw new NotFoundException(
      'Entreprise introuvable',
    );
  }

  return this.prisma.user.update({
    where: { id },
    data: { isActive: status },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      company: true,
    },
  });
}
async getStages() {
  return this.prisma.stage.findMany({
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          institution: true,
          specialty: true,
        },
      },
      company: {
        select: {
          id: true,
          companyName: true,
          managerName: true,
        },
      },
      supervisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profession: true,
        },
      },
      internship: {
        select: {
          id: true,
          title: true,
          domain: true,
          location: true,
        },
    },
    },
    orderBy: {
        createdAt: 'desc',
    },
});
}
async getApplications() {
return this.prisma.application.findMany({
    include: {
    student: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            institution: true,
            specialty: true,
        },
    },
    internship: {
        select: {
            id: true,
            title: true,
            domain: true,
            company: {
            select: {
                id: true,
                companyName: true,
            },
        },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async updateApplicationStatus(id: string, status: ApplicationStatus) {
  return this.prisma.application.update({
    where: { id },
    data: { status },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
      internship: {
        select: { id: true, title: true },
      },
    },
  });
}

}
