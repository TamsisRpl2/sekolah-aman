/*
  Warnings:

  - You are about to drop the column `classLevel` on the `students` table. All the data in the column will be lost.
  - Added the required column `classLevel` to the `violation_cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "classLevel";

-- AlterTable
ALTER TABLE "public"."violation_cases" ADD COLUMN     "classLevel" TEXT NOT NULL;
