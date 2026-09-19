import { PrismaClient, Role, UserStatus, InternshipStatus, ApplicationStatus, StageStatus, ReportStatus, EvaluationStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const supervisorPassword = await bcrypt.hash('Supervisor123!', 12);
  const companyPassword = await bcrypt.hash('Company123!', 12);

  await prisma.notification.deleteMany();
  await prisma.companyEvaluation.deleteMany();
  await prisma.studentEvaluation.deleteMany();
  await prisma.supervisorEvaluation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.application.deleteMany();
  await prisma.internshipSkill.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.company.deleteMany();
  await prisma.supervisor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@internflow.test',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: UserStatus.ACTIVE,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@internflow.test',
      password: studentPassword,
      role: Role.STUDENT,
      isActive: UserStatus.ACTIVE,
    },
  });

  const supervisorUser = await prisma.user.create({
    data: {
      email: 'supervisor@internflow.test',
      password: supervisorPassword,
      role: Role.SUPERVISOR,
      isActive: UserStatus.ACTIVE,
    },
  });

  const companyUser = await prisma.user.create({
    data: {
      email: 'company@internflow.test',
      password: companyPassword,
      role: Role.COMPANY,
      isActive: UserStatus.ACTIVE,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      firstName: 'Sonia',
      lastName: 'Ben Ali',
      phone: '+21622334455',
      institution: 'Institut Supérieur d’Informatique',
      specialty: 'Développement Logiciel',
      level: 'L3',
      bio: 'Étudiante motivée, orientée backend et React.',
    },
  });

  const supervisor = await prisma.supervisor.create({
    data: {
      userId: supervisorUser.id,
      firstName: 'Nabil',
      lastName: 'Kadri',
      profession: 'Chef de projet',
      department: 'Département informatique',
    },
  });

  const company = await prisma.company.create({
    data: {
      userId: companyUser.id,
      managerName: 'Amel Jaziri',
      companyName: 'NovaTech',
      sector: 'IT & Digital',
      address: 'Tunis',
      phone: '+21671234567',
      managerTitle: 'Responsable RH',
    },
  });

  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'Java' } }),
    prisma.skill.create({ data: { name: 'Spring Boot' } }),
    prisma.skill.create({ data: { name: 'React' } }),
    prisma.skill.create({ data: { name: 'SQL' } }),
    prisma.skill.create({ data: { name: 'Git' } }),
  ]);

  await prisma.studentSkill.createMany({
    data: [
      { studentId: student.id, skillId: skills[0].id },
      { studentId: student.id, skillId: skills[1].id },
      { studentId: student.id, skillId: skills[2].id },
      { studentId: student.id, skillId: skills[3].id },
      { studentId: student.id, skillId: skills[4].id },
    ],
  });

  const internship = await prisma.internship.create({
    data: {
      title: 'Développeuse Fullstack Java/React',
      description: 'Stage de développement logiciel en équipe.',
      domain: 'Développement logiciel',
      duration: '4 mois',
      location: 'Tunis',
      numberOfPlaces: 3,
      status: InternshipStatus.PUBLIEE,
      companyId: company.id,
      supervisorId: supervisor.id,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-01-31'),
      publishedAt: new Date(),
    },
  });

  await prisma.internshipSkill.createMany({
    data: [
      { internshipId: internship.id, skillId: skills[0].id },
      { internshipId: internship.id, skillId: skills[1].id },
      { internshipId: internship.id, skillId: skills[3].id },
      { internshipId: internship.id, skillId: skills[4].id },
    ],
  });

  const application = await prisma.application.create({
    data: {
      studentId: student.id,
      internshipId: internship.id,
      motivationMessage: 'Je souhaite développer mes compétences Java et React.',
      status: ApplicationStatus.ACCEPTEE,
    },
  });

  const stage = await prisma.stage.create({
    data: {
      studentId: student.id,
      companyId: company.id,
      supervisorId: supervisor.id,
      internshipId: internship.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120),
      status: StageStatus.EN_COURS,
      progression: 65,
    },
  });

  await prisma.report.create({
    data: {
      stageId: stage.id,
      studentId: student.id,
      fileUrl: 'https://example.com/rapport.pdf',
      submittedAt: new Date(),
      status: ReportStatus.VALIDE,
      comment: 'Rapport validé',
    },
  });

  await prisma.companyEvaluation.create({
    data: {
      stageId: stage.id,
      authorId: company.id,
      type: 'COMPANY_TO_STUDENT',
      criteria: { ponctualite: 5, autonomie: 4, travail: 5 },
      comment: 'Très bon niveau technique.',
      status: EvaluationStatus.ACCEPTEE,
    },
  });

  await prisma.studentEvaluation.create({
    data: {
      stageId: stage.id,
      authorId: student.id,
      type: 'STUDENT_TO_COMPANY',
      criteria: { environnement: 5, accompagnement: 4, apprentissage: 5 },
      comment: 'Très bonne expérience de stage.',
      status: EvaluationStatus.EN_ATTENTE,
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: studentUser.id, title: 'Candidature acceptée', message: 'Votre candidature a été acceptée.', type: NotificationType.SUCCESS, isRead: false },
      { userId: supervisorUser.id, title: 'Nouveau stage', message: 'Un stage a été attribué.', type: NotificationType.INFORMATION, isRead: false },
      { userId: companyUser.id, title: 'Nouvelle candidature', message: 'Une candidature a été reçue.', type: NotificationType.INFORMATION, isRead: false },
      { userId: admin.id, title: 'Évaluation en attente', message: 'Une évaluation est à valider.', type: NotificationType.WARNING, isRead: false },
    ],
  });

  console.log('Seeded demo data for InternFlow');
  console.log({ admin: admin.email, student: studentUser.email, supervisor: supervisorUser.email, company: companyUser.email });
  console.log({ applicationId: application.id, stageId: stage.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
