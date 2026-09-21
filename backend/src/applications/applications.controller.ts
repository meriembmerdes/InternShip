import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
 constructor(private readonly applicationsService:ApplicationsService){}
 @Post()
 @Roles(Role.STUDENT)
 create(@CurrentUser() user:any,@Body() dto:CreateApplicationDto){return this.applicationsService.create(user.id,dto);}
 @Get('mine')
 @Roles(Role.STUDENT)
 findMine(@CurrentUser() user:any){return this.applicationsService.findMine(user.id);}
 @Get()
 @Roles(Role.ADMIN,Role.STUDENT,Role.SUPERVISOR,Role.COMPANY)
 findAll(@CurrentUser() user:any){return this.applicationsService.findAll(user.id,user.role);}
 @Get(':id')
 @Roles(Role.ADMIN,Role.STUDENT,Role.SUPERVISOR,Role.COMPANY)
 findOne(@CurrentUser() user:any,@Param('id') id:string){return this.applicationsService.findOne(id,user.id,user.role);}
 @Patch(':id/status')
 @Roles(Role.ADMIN,Role.SUPERVISOR,Role.COMPANY)
 updateStatus(@CurrentUser() user:any,@Param('id') id:string,@Body() dto:UpdateApplicationStatusDto){return this.applicationsService.updateStatus(id,user.id,user.role,dto);}
 @Delete(':id/cancel')
 @Roles(Role.STUDENT)
 cancel(@CurrentUser() user:any,@Param('id') id:string){return this.applicationsService.cancel(id,user.id);}
}