import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkViolationsData() {
  try {
    console.log('🔍 Checking violations data in database...\n')

    // Check violation categories
    const categoriesCount = await prisma.violationCategory.count()
    console.log(`📊 Violation Categories: ${categoriesCount}`)
    
    if (categoriesCount > 0) {
      const categories = await prisma.violationCategory.findMany({
        include: {
          violations: true
        }
      })
      
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.level}): ${cat.violations.length} violations`)
      })
    }

    // Check violations
    const violationsCount = await prisma.violation.count()
    console.log(`\n📝 Violations: ${violationsCount}`)
    
    if (violationsCount > 0) {
      const violations = await prisma.violation.findMany({
        include: {
          category: true
        }
      })
      
      violations.forEach(v => {
        console.log(`  - ${v.name} (${v.category.level}): ${v.points} points`)
      })
    }

    // Check students
    const studentsCount = await prisma.student.count()
    console.log(`\n👥 Students: ${studentsCount}`)

    // Check users
    const usersCount = await prisma.user.count()
    console.log(`\n👤 Users: ${usersCount}`)

    if (categoriesCount === 0 || violationsCount === 0) {
      console.log('\n⚠️  No violations data found! Database needs seeding.')
      return false
    } else {
      console.log('\n✅ Violations data exists in database!')
      return true
    }

  } catch (error) {
    console.error('❌ Error checking database:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

checkViolationsData()
