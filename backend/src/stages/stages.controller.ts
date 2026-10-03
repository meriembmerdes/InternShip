import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import { StagesService } from './stages.service.js';

import { CreateStageDto } from './dto/create-stage.dto.js';
import { UpdateStageDto } from './dto/update-stage.dto.js';

@ApiTags('stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stages')
export class StagesController {
  constructor(
    private readonly stagesService: StagesService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COMPANY)
  create(
    @Body() dto: CreateStageDto,
    @Req() req: any,
  ) {
    return this.stagesService.create(
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
  findAll(@Req() req: any) {
    return this.stagesService.findAll(
      req.user,
    );
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
    return this.stagesService.findOne(
      id,
      req.user,
    );
  }

  @Patch(':id')
  @Roles(
    Role.ADMIN,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
    @Req() req: any,
  ) {
    return this.stagesService.update(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id') id: string,
  ) {
    return this.stagesService.remove(id);
  }

  @Patch(':id/start')
  @Roles(
    Role.ADMIN,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  start(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.stagesService.start(
      id,
      req.user,
    );
  }

  @Patch(':id/finish')
  @Roles(
    Role.ADMIN,
    Role.STUDENT,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  finish(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.stagesService.finish(
      id,
      req.user,
    );
  }
}
