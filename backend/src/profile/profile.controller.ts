import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ProfileService } from './profile.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

import { CurrentUser } from '../auth/current-user.decorator.js';

import { User } from '../auth/user.entity.js';

import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto.js';

import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

import { UpdateSupervisorProfileDto } from './dto/update-supervisor-profile.dto.js';

import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: User) {
    return this.profileService.getMyProfile(user.id);
  }

  @Put('admin')
  updateAdminProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.profileService.updateAdminProfile(
      user.id,
      dto,
    );
  }

  @Put('student')
  updateStudentProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.profileService.updateStudentProfile(
      user.id,
      dto,
    );
  }

  @Put('supervisor')
  updateSupervisorProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateSupervisorProfileDto,
  ) {
    return this.profileService.updateSupervisorProfile(
      user.id,
      dto,
    );
  }

  @Put('company')
  updateCompanyProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.profileService.updateCompanyProfile(
      user.id,
      dto,
    );
  }
}