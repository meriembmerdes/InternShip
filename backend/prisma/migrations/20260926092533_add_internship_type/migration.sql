/*
  Warnings:

  - Made the column `type` on table `Internship` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Internship" ALTER COLUMN "type" SET NOT NULL;
