import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ApplicationsController } from './applications.controller.js';
import { ApplicationsService } from './applications.service.js';

@Module({
  imports:[PrismaModule,AuthModule],
  controllers:[ApplicationsController],
  providers:[ApplicationsService],
  exports:[ApplicationsService]
})
export class ApplicationsModule {}