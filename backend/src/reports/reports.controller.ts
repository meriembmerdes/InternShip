import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { ReportsService } from './reports.service.js';
import { UpdateReportStatusDto } from './dto/report.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Post()
  @Roles(Role.STUDENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/reports',
        filename: (req, file, callback) => {
          const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
              file.originalname,
            )}`;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @Body('stageId') stageId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error('Fichier du rapport obligatoire.');
    }

    const fileUrl = `/uploads/reports/${file.filename}`;

    return this.reportsService.create(
      stageId,
      fileUrl,
      req.user,
    );
  }

  @Get()
  @Roles(Role.STUDENT, Role.SUPERVISOR, Role.ADMIN)
  findAll(@Req() req: any) {
    return this.reportsService.findAll(req.user);
  }

  /**
   * Ouvre le fichier PDF de manière sécurisée.
   *
   * L'utilisateur doit être authentifié et avoir
   * le droit de consulter ce rapport.
   */
  @Get(':id/file')
@Roles(
  Role.STUDENT,
  Role.SUPERVISOR,
  Role.ADMIN,
)
async getFile(
  @Param('id') id: string,
  @Req() req: any,
  @Res() res: Response,
) {
  const filePath =
    await this.reportsService.getFilePath(
      id,
      req.user,
    );

  res.setHeader(
    'Content-Type',
    'application/pdf',
  );

  res.setHeader(
    'Content-Disposition',
    'inline',
  );

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private',
  );

  return res.sendFile(filePath);
}

  @Get(':id')
  @Roles(Role.STUDENT, Role.SUPERVISOR, Role.ADMIN)
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.reportsService.findOne(
      id,
      req.user,
    );
  }

  @Patch(':id/status')
  @Roles(Role.SUPERVISOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @Req() req: any,
  ) {
    return this.reportsService.updateStatus(
      id,
      dto,
      req.user,
    );
  }
}