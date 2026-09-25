import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { StagesService } from './stages.service.js';
import {CreateStageDto} from './dto/create-stage.dto.js';
import {UpdateStageDto} from './dto/update-stage.dto.js';

@ApiTags('stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  create(@Body() dto: CreateStageDto) {
    return this.stagesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  findAll() {
    return this.stagesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  findOne(@Param('id') id: string) {
    return this.stagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  update(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.stagesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.stagesService.remove(id);
  }
}