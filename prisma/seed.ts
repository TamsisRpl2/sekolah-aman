import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash password
  const adminPassword = await bcrypt.hash('password', 12)

  // Create admin user only
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sekolahaman.com' },
    update: {},
    create: {
      email: 'admin@sekolahaman.com',
      name: 'Administrator',
      role: 'ADMIN',
      password: adminPassword,
      isActive: true,
    },
  })

  console.log(`
  🔑 Login Credentials:
Email: admin@sekolahaman.com
Password: password
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
