import { Module } from '@nestjs/common';

import { InternshipsController } from './internships.controller.js';
import { InternshipsService } from './internships.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [AuthModule],
    controllers: [InternshipsController],
    providers: [InternshipsService],
    exports: [InternshipsService],
})
export class InternshipsModule {}