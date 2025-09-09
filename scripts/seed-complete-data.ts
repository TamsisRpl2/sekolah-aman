import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding violations data...')

  // 1. Create Violation Categories
  console.log('📂 Creating violation categories...')
  
  const categoryRingan = await prisma.violationCategory.upsert({
    where: { code: 'PASAL_1' },
    update: {},
    create: {
      code: 'PASAL_1',
      name: 'Pelanggaran Ringan',
      level: 'RINGAN',
      description: 'Pelanggaran tingkat ringan yang dapat diselesaikan dengan teguran'
    }
  })

  const categorySedang = await prisma.violationCategory.upsert({
    where: { code: 'PASAL_2' },
    update: {},
    create: {
      code: 'PASAL_2',
      name: 'Pelanggaran Sedang',
      level: 'SEDANG',
      description: 'Pelanggaran tingkat sedang yang memerlukan tindakan khusus'
    }
  })

  const categoryBerat = await prisma.violationCategory.upsert({
    where: { code: 'PASAL_3' },
    update: {},
    create: {
      code: 'PASAL_3',
      name: 'Pelanggaran Berat',
      level: 'BERAT',
      description: 'Pelanggaran tingkat berat yang memerlukan sanksi tegas'
    }
  })

  console.log('✅ Categories created!')

  // 2. Create Violations for RINGAN category
  console.log('📝 Creating violations...')
  
  const violationsData = [
    // PELANGGARAN RINGAN
    {
      categoryId: categoryRingan.id,
      code: '1.A',
      name: 'Keterlambatan Masuk Sekolah',
      description: 'Datang terlambat ke sekolah tanpa keterangan yang jelas',
      sanction: 'Teguran lisan dan mencatat di buku keterlambatan',
      maxCount: 3,
      period: 'semester',
      points: 5
    },
    {
      categoryId: categoryRingan.id,
      code: '1.B',
      name: 'Tidak Menggunakan Seragam Lengkap',
      description: 'Tidak memakai atribut seragam sekolah dengan lengkap dan rapi',
      sanction: 'Teguran dan penyitaan atribut yang tidak sesuai',
      maxCount: 5,
      period: 'semester',
      points: 3
    },
    {
      categoryId: categoryRingan.id,
      code: '1.C',
      name: 'Tidak Mengerjakan Tugas',
      description: 'Tidak mengerjakan atau mengumpulkan tugas yang diberikan guru',
      sanction: 'Teguran dan wajib mengerjakan tugas di sekolah',
      maxCount: 5,
      period: 'bulan',
      points: 4
    },
    {
      categoryId: categoryRingan.id,
      code: '1.D',
      name: 'Gaduh di Kelas',
      description: 'Membuat keributan atau mengganggu suasana pembelajaran',
      sanction: 'Teguran dan duduk di depan kelas',
      maxCount: 3,
      period: 'bulan',
      points: 6
    },

    // PELANGGARAN SEDANG
    {
      categoryId: categorySedang.id,
      code: '2.A',
      name: 'Membolos Tanpa Izin',
      description: 'Tidak masuk sekolah atau meninggalkan sekolah tanpa izin',
      sanction: 'Surat peringatan dan panggilan orang tua',
      maxCount: 2,
      period: 'semester',
      points: 15
    },
    {
      categoryId: categorySedang.id,
      code: '2.B',
      name: 'Merokok di Area Sekolah',
      description: 'Merokok atau membawa rokok di lingkungan sekolah',
      sanction: 'Surat peringatan dan konseling BK',
      maxCount: 1,
      period: 'semester',
      points: 20
    },
    {
      categoryId: categorySedang.id,
      code: '2.C',
      name: 'Berkelahi atau Tawuran',
      description: 'Terlibat perkelahian dengan sesama siswa di sekolah',
      sanction: 'Skorsing 3 hari dan panggilan orang tua',
      maxCount: 1,
      period: 'tahun',
      points: 25
    },
    {
      categoryId: categorySedang.id,
      code: '2.D',
      name: 'Menggunakan HP Saat Pembelajaran',
      description: 'Menggunakan handphone atau gadget saat jam pelajaran berlangsung',
      sanction: 'Penyitaan HP dan panggilan orang tua',
      maxCount: 2,
      period: 'semester',
      points: 10
    },

    // PELANGGARAN BERAT
    {
      categoryId: categoryBerat.id,
      code: '3.A',
      name: 'Membawa Senjata Tajam',
      description: 'Membawa atau menggunakan senjata tajam di lingkungan sekolah',
      sanction: 'Skorsing 1 minggu dan laporan ke pihak berwajib',
      maxCount: 1,
      period: 'tahun',
      points: 50
    },
    {
      categoryId: categoryBerat.id,
      code: '3.B',
      name: 'Menggunakan Narkoba',
      description: 'Menggunakan, membawa, atau mengedarkan narkoba',
      sanction: 'Dikeluarkan dari sekolah dan laporan ke pihak berwajib',
      maxCount: 1,
      period: 'tahun',
      points: 100
    },
    {
      categoryId: categoryBerat.id,
      code: '3.C',
      name: 'Pencurian',
      description: 'Mengambil barang milik orang lain tanpa izin',
      sanction: 'Skorsing 1 minggu dan ganti rugi',
      maxCount: 1,
      period: 'tahun',
      points: 40
    },
    {
      categoryId: categoryBerat.id,
      code: '3.D',
      name: 'Merusak Fasilitas Sekolah',
      description: 'Sengaja merusak atau menghancurkan fasilitas sekolah',
      sanction: 'Ganti rugi dan skorsing',
      maxCount: 1,
      period: 'tahun',
      points: 35
    }
  ]

  for (const violationData of violationsData) {
    await prisma.violation.upsert({
      where: { code: violationData.code },
      update: {},
      create: violationData
    })
  }

  console.log('✅ Violations created!')

  // 3. Create sample students
  console.log('👥 Creating sample students...')
  
  const studentsData = [
    {
      nis: '2024001',
      nisn: '1234567890',
      name: 'Ahmad Fadli',
      gender: 'L' as const,
      birthPlace: 'Jakarta',
      birthDate: new Date('2008-05-15'),
      address: 'Jl. Merdeka No. 123, Jakarta',
      phone: '081234567890',
      parentPhone: '081987654321',
      parentName: 'Budi Santoso',
      classLevel: 'X',
      major: 'RPL',
      className: 'X RPL 1',
      academicYear: '2024/2025'
    },
    {
      nis: '2024002',
      nisn: '1234567891',
      name: 'Siti Nurhaliza',
      gender: 'P' as const,
      birthPlace: 'Bandung',
      birthDate: new Date('2008-08-20'),
      address: 'Jl. Sudirman No. 456, Bandung',
      phone: '081234567891',
      parentPhone: '081987654322',
      parentName: 'Sari Dewi',
      classLevel: 'XI',
      major: 'TKJ',
      className: 'XI TKJ 1',
      academicYear: '2024/2025'
    },
    {
      nis: '2024003',
      nisn: '1234567892',
      name: 'Muhammad Rizki',
      gender: 'L' as const,
      birthPlace: 'Surabaya',
      birthDate: new Date('2007-12-10'),
      address: 'Jl. Pemuda No. 789, Surabaya',
      phone: '081234567892',
      parentPhone: '081987654323',
      parentName: 'Agus Prasetyo',
      classLevel: 'XII',
      major: 'MM',
      className: 'XII MM 1',
      academicYear: '2024/2025'
    }
  ]

  for (const studentData of studentsData) {
    await prisma.student.upsert({
      where: { nis: studentData.nis },
      update: {},
      create: studentData
    })
  }

  console.log('✅ Students created!')

  // 4. Create admin user
  console.log('👤 Creating admin user...')
  
  await prisma.user.upsert({
    where: { email: 'admin@sekolah-aman.com' },
    update: {},
    create: {
      email: 'admin@sekolah-aman.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Administrator',
      role: 'ADMIN',
      phone: '081234567899',
      address: 'Sekolah'
    }
  })

  await prisma.user.upsert({
    where: { email: 'guru@sekolah-aman.com' },
    update: {},
    create: {
      email: 'guru@sekolah-aman.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Guru BK',
      role: 'GURU',
      phone: '081234567898',
      address: 'Sekolah'
    }
  })

  console.log('✅ Users created!')

  // 5. Check final count
  const finalCategories = await prisma.violationCategory.count()
  const finalViolations = await prisma.violation.count()
  const finalStudents = await prisma.student.count()
  const finalUsers = await prisma.user.count()

  console.log('\n📊 Final Database State:')
  console.log(`✅ Violation Categories: ${finalCategories}`)
  console.log(`✅ Violations: ${finalViolations}`)
  console.log(`✅ Students: ${finalStudents}`)
  console.log(`✅ Users: ${finalUsers}`)
  console.log('\n🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
