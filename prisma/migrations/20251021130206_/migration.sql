/*
  Warnings:

  - You are about to drop the column `description` on the `violations` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `violations` table. All the data in the column will be lost.
  - You are about to drop the column `maxCount` on the `violations` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `violations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."violations" DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "maxCount",
DROP COLUMN "period",
ALTER COLUMN "points" SET DEFAULT 'SP 1',
ALTER COLUMN "points" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."violation_types" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violation_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."violation_types" ADD CONSTRAINT "violation_types_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "public"."violations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
