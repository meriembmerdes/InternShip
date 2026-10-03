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

import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @Roles(
    Role.ADMIN,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  create(
    @Body() dto: CreateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.create(
      dto,
      req.user,
    );
  }

  @Get('/stage/:stageId')
  @Roles(
    Role.ADMIN,
    Role.STUDENT,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  findByStage(
    @Param('stageId') stageId: string,
  ) {
    return this.tasksService.findByStage(stageId);
  }

  @Patch(':id')
  @Roles(
    Role.ADMIN,
    Role.STUDENT,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  @Roles(
    Role.ADMIN,
    Role.SUPERVISOR,
    Role.COMPANY,
  )
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.tasksService.remove(
      id,
      req.user,
    );
  }
}