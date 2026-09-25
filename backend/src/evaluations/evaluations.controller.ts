import { Body, Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { EvaluationsService } from './evaluations.service.js';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto.js';

@ApiTags('evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getAll() {
    return this.evaluationsService.getAll();
  }

  @Post('company')
  @Roles(Role.COMPANY)
  createCompany(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.createCompanyEvaluation(dto);
  }

  @Post('student')
  @Roles(Role.STUDENT)
  createStudent(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.createStudentEvaluation(dto);
  }

  @Post('supervisor')
  @Roles(Role.SUPERVISOR)
  createSupervisor(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.createSupervisorEvaluation(dto);
  }

  @Patch('company/:id')
  @Roles(Role.ADMIN, Role.COMPANY)
  updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.updateCompany(id, dto);
  }

  @Patch('student/:id')
  @Roles(Role.ADMIN, Role.STUDENT)
  updateStudent(
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.updateStudent(id, dto);
  }

  @Patch('supervisor/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  updateSupervisor(
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.updateSupervisor(id, dto);
  }
}