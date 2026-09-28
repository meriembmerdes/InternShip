import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReportsService } from './reports.service.js';
import { UpdateReportStatusDto } from './dto/report.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  @Roles(Role.STUDENT, Role.SUPERVISOR, Role.ADMIN)
  findAll(@Req() req: any) {
    return this.reportsService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.STUDENT, Role.SUPERVISOR, Role.ADMIN)
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.reportsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.SUPERVISOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @Req() req: any,
  ) {
    return this.reportsService.updateStatus(
      id,
      dto,
      req.user,
    );
  }
}