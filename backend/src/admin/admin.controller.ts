import { Body, Controller, Delete, Get, Param,Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminService } from './admin.service.js';
import { UserQueryDto } from './dto/admin.dto.js';
import { UserStatus } from '@prisma/client';
import { StudentQueryDto } from './dto/student.dto.js';
import { SupervisorQueryDto } from './dto/supervisor.dto.js';
import { CompanyQueryDto } from './dto/company.dto.js';
import { ApplicationStatus } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
  @Get('students')
getStudents(@Query() query: StudentQueryDto) {
  return this.adminService.getStudents(query);
}

@Patch('students/:id/status')
updateStudentStatus(
  @Param('id') id: string,
  @Body('status') status: UserStatus,
) {
  return this.adminService.updateStudentStatus(id, status);
}
@Get('supervisors')
getSupervisors(@Query() query: SupervisorQueryDto) {
  return this.adminService.getSupervisors(query);
}

@Patch('supervisors/:id/status')
updateSupervisorStatus(
  @Param('id') id: string,
  @Body('status') status: UserStatus,
) {
  return this.adminService.updateSupervisorStatus(id, status);
}
@Get('companies')
getCompanies(@Query() query: CompanyQueryDto) {
  return this.adminService.getCompanies(query);
}

@Patch('companies/:id/status')
updateCompanyStatus(
  @Param('id') id: string,
  @Body('status') status: UserStatus,
) {
  return this.adminService.updateCompanyStatus(
    id,
    status,
  );
}
@Get('stages')
getStages() {
  return this.adminService.getStages();
}
@Get('applications')
getApplications() {
  return this.adminService.getApplications();
}

@Patch('applications/:id/status')
updateApplicationStatus(
  @Param('id') id: string,
  @Body('status') status: ApplicationStatus,
) {
  return this.adminService.updateApplicationStatus(id, status);
}
}