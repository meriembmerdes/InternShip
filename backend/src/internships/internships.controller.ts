import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';
import { InternshipsService } from './internships.service.js';
import { CreateInternshipDto, UpdateInternshipDto, InternshipQueryDto } from './dto/internship.dto.js';

@ApiTags('internships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  create(@Body() dto: CreateInternshipDto) {
    return this.internshipsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  findAll(@Query() query: InternshipQueryDto) {
    return this.internshipsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  update(@Param('id') id: string, @Body() dto: UpdateInternshipDto) {
    return this.internshipsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  remove(@Param('id') id: string) {
    return this.internshipsService.remove(id);
  }
}
