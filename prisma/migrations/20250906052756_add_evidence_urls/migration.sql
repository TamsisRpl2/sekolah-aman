/*
  Warnings:

  - You are about to drop the column `evidence` on the `violation_cases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."violation_cases" DROP COLUMN "evidence",
ADD COLUMN     "evidenceUrls" TEXT[];
