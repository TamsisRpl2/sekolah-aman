import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStudentById() {
  try {
    console.log('🔍 Checking student with ID: cmf5o5keb000tzdikuhu76peo\n')

    // Check all students first
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        nis: true,
        isActive: true
      }
    })

    console.log(`📊 Total students in database: ${allStudents.length}`)
    console.log('👥 All students:')
    allStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ID: ${student.id}`)
      console.log(`     Name: ${student.name}`)
      console.log(`     NIS: ${student.nis}`)
      console.log(`     Active: ${student.isActive}`)
      console.log('')
    })

    // Check specific student
    const specificStudent = await prisma.student.findUnique({
      where: { id: 'cmf5o5keb000tzdikuhu76peo' }
    })

    if (specificStudent) {
      console.log('✅ Student found!')
      console.log('📝 Student details:', JSON.stringify(specificStudent, null, 2))
    } else {
      console.log('❌ Student with that ID not found!')
      console.log('💡 Available student IDs:')
      allStudents.forEach(s => {
        console.log(`   - ${s.id} (${s.name})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStudentById()
