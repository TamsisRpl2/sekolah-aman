-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'GURU');

-- CreateEnum
CREATE TYPE "public"."ViolationLevel" AS ENUM ('RINGAN', 'SEDANG', 'BERAT');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('PENDING', 'PROSES', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('L', 'P');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'GURU',
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nisn" TEXT,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "phone" TEXT,
    "parentPhone" TEXT,
    "parentName" TEXT,
    "classLevel" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "photo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violation_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "public"."ViolationLevel" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violations" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sanction" TEXT NOT NULL,
    "maxCount" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violation_cases" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "inputById" TEXT NOT NULL,
    "violationDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "location" TEXT,
    "witnesses" TEXT,
    "status" "public"."CaseStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_actions" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actionById" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sanction_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "public"."ViolationLevel" NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sanctions" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sanctionTypeId" TEXT NOT NULL,
    "givenById" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "public"."students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "public"."students"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "violation_categories_code_key" ON "public"."violation_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "violations_code_key" ON "public"."violations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "violation_cases_caseNumber_key" ON "public"."violation_cases"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_types_name_key" ON "public"."sanction_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "public"."configs"("key");

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."violation_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violation_cases" ADD CONSTRAINT "violation_cases_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violation_cases" ADD CONSTRAINT "violation_cases_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "public"."violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violation_cases" ADD CONSTRAINT "violation_cases_inputById_fkey" FOREIGN KEY ("inputById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_actions" ADD CONSTRAINT "case_actions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."violation_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_actions" ADD CONSTRAINT "case_actions_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sanctions" ADD CONSTRAINT "sanctions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."violation_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sanctions" ADD CONSTRAINT "sanctions_sanctionTypeId_fkey" FOREIGN KEY ("sanctionTypeId") REFERENCES "public"."sanction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sanctions" ADD CONSTRAINT "sanctions_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
