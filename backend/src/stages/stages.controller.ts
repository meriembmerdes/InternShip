import {Body,Controller,Delete,Get,Param,Patch,Post,UseGuards} from '@nestjs/common';

import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AuthUser } from '../auth/user.type.js';

import { StagesService } from './stages.service.js';
import { CreateStageDto } from './dto/create-stage.dto.js';
import { UpdateStageDto } from './dto/update-stage.dto.js';
import { User } from '../auth/user.entity.js';

@ApiTags('stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stages')
export class StagesController {
  constructor(
    private readonly stagesService: StagesService,
  ) {}

  // Créer un stage depuis une candidature acceptée
  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateStageDto,
  ) {
    return this.stagesService.create(
      user.id,
      dto,
    );
  }

  // Mes stages selon le rôle
  @Get('my')
  findMyStages(
    @CurrentUser() user: User,
  ) {
    return this.stagesService.findMyStages(
      user.id,
    );
  }

  // Un stage
  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.stagesService.findOne(
      user.id,
      id,
    );
  }

  // Modifier un stage
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.stagesService.update(
      user.id,
      id,
      dto,
    );
  }

  // Supprimer un stage
  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.stagesService.remove(
      user.id,
      id,
    );
  }
}