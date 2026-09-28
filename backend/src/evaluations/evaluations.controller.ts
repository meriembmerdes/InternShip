import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { EvaluationsService } from './evaluations.service.js';
import {
  CreateEvaluationDto,
  UpdateEvaluationDto,
} from './dto/evaluation.dto.js';

@ApiTags('evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getAll(@Req() req: any) {
    return this.evaluationsService.getAll(req.user);
  }

  @Post('company')
@Roles(Role.COMPANY)
createCompany(
  @Body() dto: CreateEvaluationDto,
  @Req() req: any,
) {
  return this.evaluationsService.createCompanyEvaluation(
    dto,
    req.user,
  );
}

  @Post('student')
@Roles(Role.STUDENT)
createStudent(
  @Body() dto: CreateEvaluationDto,
  @Req() req: any,
) {
  return this.evaluationsService.createStudentEvaluation(
    dto,
    req.user,
  );
}

  @Post('supervisor')
  @Roles(Role.SUPERVISOR)
  createSupervisor(
    @Body() dto: CreateEvaluationDto,
    @Req() req: any,
  ) {
    return this.evaluationsService.createSupervisorEvaluation(
      dto,
      req.user,
    );
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
  @Req() req: any,
) {
  return this.evaluationsService.updateSupervisor(
    id,
    dto,
    req.user,
  );
}
}