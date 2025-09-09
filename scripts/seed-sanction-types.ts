import { prisma } from '@/lib/prisma'

export async function seedSanctionTypes() {
  const sanctionTypes = [
    {
      name: 'Teguran Lisan',
      level: 'RINGAN',
      description: 'Peringatan secara lisan oleh guru atau wali kelas'
    },
    {
      name: 'Teguran Tertulis',
      level: 'RINGAN',
      description: 'Peringatan tertulis yang dicatat dalam buku pembinaan'
    },
    {
      name: 'Membersihkan Kelas',
      level: 'RINGAN',
      description: 'Membersihkan ruang kelas setelah jam sekolah'
    },
    {
      name: 'Membersihkan Lingkungan Sekolah',
      level: 'RINGAN',
      description: 'Membersihkan area sekitar sekolah sebagai bentuk sanksi'
    },
    {
      name: 'Surat Peringatan I',
      level: 'SEDANG',
      description: 'Surat peringatan pertama kepada siswa dan orang tua'
    },
    {
      name: 'Surat Peringatan II',
      level: 'SEDANG',
      description: 'Surat peringatan kedua dengan teguran lebih keras'
    },
    {
      name: 'Surat Peringatan III',
      level: 'SEDANG',
      description: 'Surat peringatan ketiga sebagai peringatan terakhir'
    },
    {
      name: 'Panggilan Orang Tua',
      level: 'SEDANG',
      description: 'Memanggil orang tua siswa untuk konsultasi'
    },
    {
      name: 'Skorsing 1 Hari',
      level: 'SEDANG',
      description: 'Tidak diperbolehkan mengikuti kegiatan sekolah selama 1 hari',
      duration: 1
    },
    {
      name: 'Skorsing 3 Hari',
      level: 'BERAT',
      description: 'Tidak diperbolehkan mengikuti kegiatan sekolah selama 3 hari',
      duration: 3
    },
    {
      name: 'Skorsing 1 Minggu',
      level: 'BERAT',
      description: 'Tidak diperbolehkan mengikuti kegiatan sekolah selama 1 minggu',
      duration: 7
    },
    {
      name: 'Dikeluarkan dari Sekolah',
      level: 'BERAT',
      description: 'Sanksi terberat berupa pengeluaran dari sekolah'
    },
    {
      name: 'Membuat Karya Tulis',
      description: 'Membuat esai atau karya tulis mengenai dampak pelanggaran'
    },
    {
      name: 'Bimbingan Konseling',
      description: 'Sesi konseling dengan guru BK untuk pembinaan mental'
    },
    {
      name: 'Kerja Sosial',
      description: 'Melakukan kegiatan sosial untuk masyarakat sekitar'
    }
  ]

  try {
    // Check if data already exists
    const existingCount = await prisma.sanctionType.count()
    
    if (existingCount === 0) {
      // Create all sanction types
      await prisma.sanctionType.createMany({
        data: sanctionTypes
      })
      console.log(`✅ Created ${sanctionTypes.length} sanction types`)
    } else {
      console.log(`ℹ️ ${existingCount} sanction types already exist, skipping seed`)
    }
  } catch (error) {
    console.error('❌ Error seeding sanction types:', error)
    throw error
  }
}

// If this file is run directly
if (require.main === module) {
  seedSanctionTypes()
    .then(() => {
      console.log('✅ Sanction types seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Sanction types seeding failed:', error)
      process.exit(1)
    })
}
