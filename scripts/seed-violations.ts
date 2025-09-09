import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedViolations() {
  try {
    console.log('🌱 Seeding violation data...')

    // Create violation categories
    const categories = await Promise.all([
      prisma.violationCategory.upsert({
        where: { code: '1' },
        update: {},
        create: {
          code: '1',
          name: 'Pelanggaran Ringan',
          level: 'RINGAN',
          description: 'Pelanggaran tingkat ringan yang dapat diselesaikan dengan teguran dan catatan',
          isActive: true
        }
      }),
      prisma.violationCategory.upsert({
        where: { code: '2' },
        update: {},
        create: {
          code: '2',
          name: 'Pelanggaran Sedang',
          level: 'SEDANG',
          description: 'Pelanggaran tingkat sedang yang memerlukan peringatan tertulis dan tindakan lanjut',
          isActive: true
        }
      }),
      prisma.violationCategory.upsert({
        where: { code: '3' },
        update: {},
        create: {
          code: '3',
          name: 'Pelanggaran Berat',
          level: 'BERAT',
          description: 'Pelanggaran tingkat berat yang memerlukan sanksi tegas dan konseling',
          isActive: true
        }
      })
    ])

    // Create violations for each category
    const violations = [
      // Pelanggaran Ringan (Category 1)
      {
        categoryId: categories[0].id,
        code: '1.A.1',
        name: 'Keterlambatan ke sekolah',
        description: 'Siswa terlambat hadir ke sekolah (lebih dari 06:45)',
        sanction: 'Handphone disita hingga jam pelajaran terakhir',
        maxCount: 3,
        period: 'semester',
        points: 5,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        code: '1.A.2',
        name: 'Tidak mengikuti upacara bendera',
        description: 'Tidak mengikuti upacara bendera tanpa izin',
        sanction: 'Teguran lisan dan tugas tambahan',
        maxCount: 2,
        period: 'bulan',
        points: 3,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        code: '1.B.1',
        name: 'Atribut seragam tidak lengkap',
        description: 'Tidak mengenakan atribut seragam lengkap',
        sanction: 'Teguran dan catatan dalam buku pelanggaran',
        maxCount: 5,
        period: 'semester',
        points: 2,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        code: '1.B.2',
        name: 'Rambut tidak sesuai aturan',
        description: 'Rambut tidak sesuai aturan sekolah',
        sanction: 'Wajib potong rambut dalam 3 hari',
        maxCount: 2,
        period: 'semester',
        points: 4,
        isActive: true
      },

      // Pelanggaran Sedang (Category 2)
      {
        categoryId: categories[1].id,
        code: '2.A.1',
        name: 'Mengganggu proses pembelajaran',
        description: 'Mengganggu proses pembelajaran di kelas',
        sanction: 'Peringatan tertulis dan panggilan orang tua',
        maxCount: 2,
        period: 'semester',
        points: 10,
        isActive: true
      },
      {
        categoryId: categories[1].id,
        code: '2.A.2',
        name: 'Tidak mengerjakan tugas berulang',
        description: 'Tidak mengerjakan tugas secara berulang',
        sanction: 'Tugas tambahan dan bimbingan khusus',
        maxCount: 3,
        period: 'bulan',
        points: 8,
        isActive: true
      },
      {
        categoryId: categories[1].id,
        code: '2.B.1',
        name: 'Membawa barang terlarang',
        description: 'Membawa barang yang tidak diperbolehkan ke sekolah',
        sanction: 'Barang disita dan peringatan tertulis',
        maxCount: 1,
        period: 'semester',
        points: 12,
        isActive: true
      },

      // Pelanggaran Berat (Category 3)
      {
        categoryId: categories[2].id,
        code: '3.A.1',
        name: 'Merokok di lingkungan sekolah',
        description: 'Merokok di lingkungan sekolah',
        sanction: 'Skorsing 3 hari dan panggilan orang tua',
        maxCount: 1,
        period: 'tahun',
        points: 25,
        isActive: true
      },
      {
        categoryId: categories[2].id,
        code: '3.A.2',
        name: 'Berkelahi dengan sesama siswa',
        description: 'Berkelahi dengan sesama siswa',
        sanction: 'Skorsing 5 hari dan konseling',
        maxCount: 1,
        period: 'tahun',
        points: 30,
        isActive: true
      },
      {
        categoryId: categories[2].id,
        code: '3.B.1',
        name: 'Merusak fasilitas sekolah',
        description: 'Merusak fasilitas sekolah dengan sengaja',
        sanction: 'Ganti rugi dan skorsing 7 hari',
        maxCount: 1,
        period: 'tahun',
        points: 35,
        isActive: true
      }
    ]

    // Insert violations
    for (const violation of violations) {
      await prisma.violation.upsert({
        where: { code: violation.code },
        update: {},
        create: violation
      })
    }

    console.log('✅ Violation data seeded successfully!')
    console.log(`📊 Created ${categories.length} categories and ${violations.length} violations`)

  } catch (error) {
    console.error('❌ Error seeding violation data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedViolations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
