import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Role, ReportStatus } from '@prisma/client';
import { UpdateReportDto } from './dto/report.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ReportsService } from './reports.service.js';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/reports',
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException(
              'Seuls les fichiers PDF sont autorisés.',
            ),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  create(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('stageId') stageId: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Veuillez sélectionner un fichier PDF.',
      );
    }

    if (!stageId) {
      throw new BadRequestException(
        'Le stage est obligatoire.',
      );
    }

    return this.reportsService.create(
      stageId,
      file,
      req.user,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getAll(@Req() req: any) {
    return this.reportsService.getAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  getById(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.getById(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.SUPERVISOR, Role.COMPANY)
  update(
    @Param('id') id: string,
    @Body() body: UpdateReportDto,
    @Req() req: any,
  ) {
    return this.reportsService.update(id, body, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STUDENT)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.remove(id, req.user);
  }
  @Patch(':id/status')
@Roles(Role.SUPERVISOR)
updateStatus(
  @Param('id') id: string,
  @Body() body: { status: ReportStatus; comment?: string },
  @Req() req: any,
) {
  return this.reportsService.updateStatus(
    id,
    body.status,
    body.comment,
    req.user,
  );
}
}