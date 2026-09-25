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
import { ReportsModule } from './reports/reports.module.js';
import { EvaluationsModule } from './evaluations/evaluations.module.js';
import { AdminModule } from './admin/admin.module.js';

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
    ReportsModule,
    NotificationsModule,
    EvaluationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
