import {BadRequestException,ConflictException,Injectable,UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Un compte existe déjà avec cette adresse email.',
      );
    }

    /*
     * ADMIN :
     * La création d'un administrateur nécessite obligatoirement
     * le PIN présent uniquement dans le backend (.env).
     */
    if (dto.role === 'ADMIN') {
      const adminPin = process.env.ADMIN_REGISTRATION_PIN;

      if (!adminPin) {
        throw new BadRequestException(
          'La création des administrateurs n’est pas configurée.',
        );
      }

      if (!dto.adminPin || dto.adminPin !== adminPin) {
        throw new UnauthorizedException(
          'PIN administrateur incorrect.',
        );
      }
    }

    /*
     * Pour les autres rôles, aucun PIN administrateur
     * ne doit être accepté ou utilisé.
     */
    if (dto.role !== 'ADMIN' && dto.adminPin) {
      throw new BadRequestException(
        'Le PIN administrateur est réservé au rôle ADMIN.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: dto.role,
        isActive: 'ACTIVE',
      },
    });

    /*
     * Création du profil correspondant au rôle.
     */
    if (dto.role === 'STUDENT') {
      await this.prisma.student.create({
        data: {
          userId: user.id,
          firstName: dto.firstName?.trim() || '',
          lastName: dto.lastName?.trim() || '',
          phone: dto.phone?.trim() || null,
        },
      });
    }

    if (dto.role === 'SUPERVISOR') {
      if (!dto.firstName?.trim() || !dto.lastName?.trim()) {
        await this.prisma.user.delete({
          where: { id: user.id },
        });

        throw new BadRequestException(
          'Le prénom et le nom sont obligatoires pour un encadrant.',
        );
      }

      if (!dto.profession?.trim()) {
        await this.prisma.user.delete({
          where: { id: user.id },
        });

        throw new BadRequestException(
          'La profession est obligatoire pour un encadrant.',
        );
      }

      await this.prisma.supervisor.create({
        data: {
          userId: user.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          profession: dto.profession.trim(),
          department: dto.department?.trim() || null,
        },
      });
    }

    if (dto.role === 'COMPANY') {
      if (!dto.companyName?.trim()) {
        await this.prisma.user.delete({
          where: { id: user.id },
        });

        throw new BadRequestException(
          'Le nom de l’entreprise est obligatoire.',
        );
      }

      if (!dto.managerName?.trim()) {
        await this.prisma.user.delete({
          where: { id: user.id },
        });

        throw new BadRequestException(
          'Le nom du responsable est obligatoire.',
        );
      }

      await this.prisma.company.create({
        data: {
          userId: user.id,
          managerName: dto.managerName.trim(),
          companyName: dto.companyName.trim(),
          sector: dto.sector?.trim() || null,
          address: dto.address?.trim() || null,
          phone: dto.phone?.trim() || null,
          managerTitle: dto.managerTitle?.trim() || null,
        },
      });
    }

    return this.buildAuthPayload(user.id);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect.',
      );
    }

    if (user.isActive !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Votre compte est désactivé.',
      );
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect.',
      );
    }

    return this.buildAuthPayload(user.id);
  }

  async logout() {
    return {
      message: 'Déconnexion réussie.',
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        supervisor: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable.',
      );
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  private async buildAuthPayload(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}