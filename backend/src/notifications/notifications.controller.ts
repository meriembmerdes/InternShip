import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { NotificationsService } from './notifications.service.js';
import { CreateNotificationDto } from './dto/notification.dto.js';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getMine(@Req() req: any) {
    return this.notificationsService.getMyNotifications(req.user.id);
  }

  @Get('unread-count')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
@Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
markAsRead(@Param('id') id: string, @Req() req: any) {
  return this.notificationsService.markAsRead(id, req.user.id);
}

  @Patch('read-all')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}