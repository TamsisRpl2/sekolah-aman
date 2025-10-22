-- CreateTable
CREATE TABLE "public"."berita_acara" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "kronologi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "pelapor" TEXT,
    "saksi" TEXT,
    "tindakLanjut" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_acara_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."berita_acara" ADD CONSTRAINT "berita_acara_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
