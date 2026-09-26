import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import { Role } from '@prisma/client';

import { InternshipsService } from './internships.service.js';

import {
  CreateInternshipDto,
  UpdateInternshipDto,
  InternshipQueryDto,
} from './dto/internship.dto.js';

@ApiTags('internships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('internships')
export class InternshipsController {
  constructor(
    private readonly internshipsService: InternshipsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  create(
    @Body() dto: CreateInternshipDto,
    @Req() req: any,
  ) {
    return this.internshipsService.create(
      dto,
      req.user,
    );
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.STUDENT,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  findAll(
    @Query() query: InternshipQueryDto,
    @Req() req: any,
  ) {
    return this.internshipsService.findAll(
      query,
      req.user,
    );
  }

  // ==============================
  // ENCADRANTS DISPONIBLES
  // ==============================

  @Get('supervisors/available')
  @Roles(Role.ADMIN, Role.COMPANY)
  getAvailableSupervisors() {
    return this.internshipsService.getAvailableSupervisors();
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.STUDENT,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.internshipsService.findOne(
      id,
      req.user,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInternshipDto,
    @Req() req: any,
  ) {
    return this.internshipsService.update(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.internshipsService.remove(
      id,
      req.user,
    );
  }
}