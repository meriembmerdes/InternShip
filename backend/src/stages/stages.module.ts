import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StagesController } from './stages.controller.js';
import { StagesService } from './stages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService],
})
export class StagesModule {}