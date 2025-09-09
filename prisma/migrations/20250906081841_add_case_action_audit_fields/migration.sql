/*
  Warnings:

  - You are about to drop the column `sanction` on the `violations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."case_actions" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "editedById" TEXT,
ADD COLUMN     "evidenceUrls" TEXT[],
ADD COLUMN     "sanctionTypeId" TEXT;

-- AlterTable
ALTER TABLE "public"."violations" DROP COLUMN "sanction";

-- CreateTable
CREATE TABLE "public"."violation_sanction_types" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "sanctionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violation_sanction_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "violation_sanction_types_violationId_sanctionTypeId_key" ON "public"."violation_sanction_types"("violationId", "sanctionTypeId");

-- AddForeignKey
ALTER TABLE "public"."violation_sanction_types" ADD CONSTRAINT "violation_sanction_types_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "public"."violations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violation_sanction_types" ADD CONSTRAINT "violation_sanction_types_sanctionTypeId_fkey" FOREIGN KEY ("sanctionTypeId") REFERENCES "public"."sanction_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_actions" ADD CONSTRAINT "case_actions_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_actions" ADD CONSTRAINT "case_actions_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_actions" ADD CONSTRAINT "case_actions_sanctionTypeId_fkey" FOREIGN KEY ("sanctionTypeId") REFERENCES "public"."sanction_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
