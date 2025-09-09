import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Force create violations for debugging
    
    // First, ensure categories exist
    const ringanCategory = await prisma.violationCategory.upsert({
      where: { code: '1' },
      update: {},
      create: {
        code: '1',
        name: 'Pelanggaran Ringan',
        level: 'RINGAN',
        description: 'Pelanggaran tingkat ringan yang dapat diselesaikan dengan teguran atau peringatan',
      },
    })

    const sedangCategory = await prisma.violationCategory.upsert({
      where: { code: '2' },
      update: {},
      create: {
        code: '2',
        name: 'Pelanggaran Sedang',
        level: 'SEDANG',
        description: 'Pelanggaran tingkat sedang yang memerlukan tindakan lebih serius',
      },
    })

    const beratCategory = await prisma.violationCategory.upsert({
      where: { code: '3' },
      update: {},
      create: {
        code: '3',
        name: 'Pelanggaran Berat',
        level: 'BERAT',
        description: 'Pelanggaran tingkat berat yang memerlukan sanksi tegas',
      },
    })

    // Create violations
    const sampleViolations = [
      {
        categoryId: ringanCategory.id,
        code: '1.A',
        name: 'Terlambat Masuk Sekolah',
        description: 'Siswa terlambat masuk sekolah lebih dari 15 menit',
        sanction: 'Teguran lisan dan pencatatan',
        maxCount: 3,
        period: 'semester',
        points: 5,
      },
      {
        categoryId: ringanCategory.id,
        code: '1.B',
        name: 'Tidak Mengerjakan PR',
        description: 'Siswa tidak mengerjakan pekerjaan rumah yang diberikan guru',
        sanction: 'Teguran dan harus mengerjakan PR di sekolah',
        maxCount: 5,
        period: 'semester',
        points: 10,
      },
      {
        categoryId: sedangCategory.id,
        code: '2.A',
        name: 'Tidak Memakai Seragam Lengkap',
        description: 'Siswa tidak memakai atribut seragam yang lengkap sesuai ketentuan',
        sanction: 'Teguran tertulis dan panggilan orang tua',
        maxCount: 3,
        period: 'semester',
        points: 15,
      },
      {
        categoryId: beratCategory.id,
        code: '3.A',
        name: 'Berkelahi',
        description: 'Siswa terlibat perkelahian dengan siswa lain di lingkungan sekolah',
        sanction: 'Skorsing dan pembinaan khusus',
        maxCount: 1,
        period: 'tahun',
        points: 50,
      },
      {
        categoryId: beratCategory.id,
        code: '3.B',
        name: 'Merokok di Area Sekolah',
        description: 'Siswa kedapatan merokok di lingkungan sekolah',
        sanction: 'Skorsing dan surat pernyataan',
        maxCount: 1,
        period: 'tahun',
        points: 75,
      },
    ]

    const createdViolations = []
    for (const violation of sampleViolations) {
      const created = await prisma.violation.upsert({
        where: { code: violation.code },
        update: {},
        create: violation,
        include: {
          category: true
        }
      })
      createdViolations.push(created)
    }

    return NextResponse.json({
      message: 'Violations created successfully',
      violations: createdViolations
    })

  } catch (error) {
    console.error('Error creating violations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
