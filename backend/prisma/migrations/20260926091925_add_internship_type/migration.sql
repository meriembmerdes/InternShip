-- CreateEnum
CREATE TYPE "InternshipType" AS ENUM ('OUVRIER', 'TECHNICIEN', 'FIN_ETUDE', 'ETE');

-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "type" "InternshipType";
