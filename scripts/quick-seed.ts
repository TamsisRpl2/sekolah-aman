import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickSeedViolations() {
  console.log('🚀 Quick seeding violations data...')

  // Create basic categories
  const categories = [
    { code: 'RINGAN', name: 'Pelanggaran Ringan', level: 'RINGAN' as const },
    { code: 'SEDANG', name: 'Pelanggaran Sedang', level: 'SEDANG' as const },
    { code: 'BERAT', name: 'Pelanggaran Berat', level: 'BERAT' as const }
  ]

  for (const cat of categories) {
    await prisma.violationCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        code: cat.code,
        name: cat.name,
        level: cat.level,
        description: `Kategori ${cat.name.toLowerCase()}`
      }
    })
  }

  // Get category IDs
  const ringanCat = await prisma.violationCategory.findUnique({ where: { code: 'RINGAN' } })
  const sedangCat = await prisma.violationCategory.findUnique({ where: { code: 'SEDANG' } })
  const beratCat = await prisma.violationCategory.findUnique({ where: { code: 'BERAT' } })

  // Create basic violations
  const violations = [
    {
      categoryId: ringanCat!.id,
      code: 'R1',
      name: 'Terlambat',
      description: 'Datang terlambat ke sekolah',
      sanction: 'Teguran lisan',
      maxCount: 3,
      period: 'semester',
      points: 5
    },
    {
      categoryId: sedangCat!.id,
      code: 'S1',
      name: 'Membolos',
      description: 'Tidak masuk tanpa izin',
      sanction: 'Panggil orang tua',
      maxCount: 2,
      period: 'semester',
      points: 15
    },
    {
      categoryId: beratCat!.id,
      code: 'B1',
      name: 'Berkelahi',
      description: 'Terlibat perkelahian',
      sanction: 'Skorsing',
      maxCount: 1,
      period: 'tahun',
      points: 50
    }
  ]

  for (const v of violations) {
    await prisma.violation.upsert({
      where: { code: v.code },
      update: {},
      create: v
    })
  }

  console.log('✅ Quick seed completed!')
  
  // Verify
  const counts = {
    categories: await prisma.violationCategory.count(),
    violations: await prisma.violation.count()
  }
  
  console.log('📊 Counts:', counts)
}

quickSeedViolations()
  .finally(() => prisma.$disconnect())
