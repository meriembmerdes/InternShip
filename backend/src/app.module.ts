import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { InternshipsModule } from './internships/internships.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { StagesModule } from './stages/stages.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    InternshipsModule,
    DashboardModule,
    ProfileModule,
    ApplicationsModule,
    StagesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
