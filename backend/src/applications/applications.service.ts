import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';

@Injectable()
export class ApplicationsService {
 constructor(private readonly prisma:PrismaService){}
 async create(userId:string,dto:CreateApplicationDto){
  const student=await this.prisma.student.findUnique({where:{userId}});
  if(!student) throw new BadRequestException('Profil étudiant introuvable');
  const internship=await this.prisma.internship.findUnique({where:{id:dto.internshipId}});
  if(!internship) throw new NotFoundException('Stage introuvable');
  if(internship.status!=='PUBLIEE') throw new BadRequestException('Cette offre n\'est pas disponible');
  const existing=await this.prisma.application.findUnique({where:{studentId_internshipId:{studentId:student.userId,internshipId:dto.internshipId}}});
  if(existing) throw new BadRequestException('Vous avez déjà postulé à cette offre');
  const accepted=await this.prisma.application.count({where:{internshipId:dto.internshipId,status:ApplicationStatus.ACCEPTEE}});
  if(accepted>=internship.numberOfPlaces) throw new BadRequestException('Le nombre de places disponibles est atteint');
  const application=await this.prisma.application.create({data:{studentId:student.userId,internshipId:dto.internshipId,motivationMessage:dto.motivationMessage,cvUrl:dto.cvUrl}});
  const users=[];
  if(internship.companyId){
   const company=await this.prisma.company.findUnique({where:{userId:internship.companyId}});
   if(company) users.push(company.userId);
  }
  if(internship.supervisorId){
   const supervisor=await this.prisma.supervisor.findUnique({where:{userId:internship.supervisorId}});
   if(supervisor) users.push(supervisor.userId);
  }
  if(users.length) await this.prisma.notification.createMany({data:users.map(id=>({userId:id,title:'Nouvelle candidature',message:`Une nouvelle candidature a été déposée pour l'offre "${internship.title}".`,type:'INFORMATION'}))});
  return application;
 }
 async findMine(userId:string){
  const student=await this.prisma.student.findUnique({where:{userId}});
  if(!student) throw new NotFoundException('Profil étudiant introuvable');
  return this.prisma.application.findMany({where:{studentId:student.userId},include:{internship:{include:{company:true,supervisor:true}}},orderBy:{appliedAt:'desc'}});
 }
 async findAll(userId:string,role:Role){
  const where:any={};
  if(role===Role.STUDENT){
   const student=await this.prisma.student.findUnique({where:{userId}});
   if(!student) throw new NotFoundException('Profil étudiant introuvable');
   where.studentId=student.userId;
  }
  if(role===Role.COMPANY){
   const company=await this.prisma.company.findUnique({where:{userId}});
   if(!company) throw new NotFoundException('Profil entreprise introuvable');
   where.internship={companyId:company.userId};
  }
  if(role===Role.SUPERVISOR){
   const supervisor=await this.prisma.supervisor.findUnique({where:{userId}});
   if(!supervisor) throw new NotFoundException('Profil encadrant introuvable');
   where.internship={supervisorId:supervisor.userId};
  }
  return this.prisma.application.findMany({where,include:{student:true,internship:{include:{company:true,supervisor:true}}},orderBy:{appliedAt:'desc'}});
 }
 async findOne(id:string,userId:string,role:Role){
  const application=await this.prisma.application.findUnique({where:{id},include:{student:true,internship:{include:{company:true,supervisor:true}}}});
  if(!application) throw new NotFoundException('Candidature introuvable');
  if(role===Role.STUDENT&&application.studentId!==userId) throw new ForbiddenException();
  if(role===Role.COMPANY&&application.internship.companyId!==userId) throw new ForbiddenException();
  if(role===Role.SUPERVISOR&&application.internship.supervisorId!==userId) throw new ForbiddenException();
  return application;
 }
 async updateStatus(id:string,userId:string,role:Role,dto:UpdateApplicationStatusDto){
  const application=await this.findOne(id,userId,role);
  if(role===Role.STUDENT) throw new ForbiddenException('Un étudiant ne peut pas modifier le statut');
  if(dto.status===ApplicationStatus.ACCEPTEE){
   const accepted=await this.prisma.application.count({where:{internshipId:application.internshipId,status:ApplicationStatus.ACCEPTEE}});
   if(accepted>=application.internship.numberOfPlaces&&application.status!==ApplicationStatus.ACCEPTEE) throw new BadRequestException('Le nombre de places disponibles est atteint');
  }
  const updated=await this.prisma.application.update({where:{id},data:{status:dto.status}});
  await this.prisma.notification.create({data:{userId:application.studentId,title:'Mise à jour de candidature',message:`Votre candidature pour "${application.internship.title}" est maintenant ${dto.status}.`,type:dto.status===ApplicationStatus.ACCEPTEE?'SUCCESS':dto.status===ApplicationStatus.REFUSEE?'WARNING':'INFORMATION'}});
  return updated;
 }
 async cancel(id:string,userId:string){
  const application=await this.prisma.application.findUnique({where:{id},include:{internship:true}});
  if(!application) throw new NotFoundException('Candidature introuvable');
  if(application.studentId!==userId) throw new ForbiddenException();
  if(application.status!==ApplicationStatus.EN_ATTENTE) throw new BadRequestException('Cette candidature ne peut plus être annulée');
  return this.prisma.application.update({where:{id},data:{status:ApplicationStatus.ANNULEE}});
 }
}