import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkViolations() {
  try {
    console.log('🔍 Checking violations...')
    
    const violationCategories = await prisma.violationCategory.findMany()
    console.log('Violation categories:', violationCategories.length)
    
    const violations = await prisma.violation.findMany({
      include: {
        category: true
      }
    })
    console.log('Violations:', violations.length)
    
    if (violations.length === 0) {
      console.log('No violations found! Creating sample violations...')
      
      // Get categories
      const ringanCategory = await prisma.violationCategory.findUnique({
        where: { code: '1' }
      })
      const sedangCategory = await prisma.violationCategory.findUnique({
        where: { code: '2' }
      })
      const beratCategory = await prisma.violationCategory.findUnique({
        where: { code: '3' }
      })
      
      if (!ringanCategory || !sedangCategory || !beratCategory) {
        console.log('Categories not found! Creating categories first...')
        return
      }
      
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
        }
      ]
      
      for (const violation of sampleViolations) {
        await prisma.violation.create({
          data: violation
        })
      }
      
      console.log('✅ Sample violations created!')
    } else {
      console.log('Violations found:')
      violations.forEach(v => {
        console.log(`- ${v.code}: ${v.name} (${v.category.name})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkViolations()
