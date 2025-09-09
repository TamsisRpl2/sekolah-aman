import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can access students
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const className = searchParams.get('className') || ''
    const status = searchParams.get('status') || '' // 'active' | 'inactive' | ''

    // Build where conditions
    const whereConditions: any = {}

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { nis: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (className) {
      whereConditions.major = className
    }

    if (status === 'active') {
      whereConditions.isActive = true
    } else if (status === 'inactive') {
      whereConditions.isActive = false
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: whereConditions,
        select: {
          id: true,
          nis: true,
          name: true,
          gender: true,
          phone: true,
          address: true,
          major: true,
          parentName: true,
          parentPhone: true,
          academicYear: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              violationCases: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.student.count({ where: whereConditions })
    ])

    // Get statistics
    const stats = await prisma.student.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    const totalStudents = await prisma.student.count()
    
    // Remove class distribution since classLevel is now in cases
    const classDistribution: any[] = []

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalStudents,
        activeStudents: stats._count.id,
        inactiveStudents: totalStudents - stats._count.id,
        classDistribution
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can create students
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      nis,
      name, 
      gender,
      birthPlace,
      birthDate,
      phone, 
      address,
      parentName,
      parentPhone,
      major,
      academicYear,
      isActive = true 
    } = body

    // Validate required fields
    if (!nis || !name || !gender || !academicYear) {
      return NextResponse.json(
        { error: 'NIS, name, gender, and academic year are required' },
        { status: 400 }
      )
    }

    // Check if NIS already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nis }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS already exists' },
        { status: 400 }
      )
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        nis,
        name,
        gender,
        birthPlace,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        address,
        parentName,
        parentPhone,
        major,
        academicYear,
        isActive
      },
      select: {
        id: true,
        nis: true,
        name: true,
        gender: true,
        phone: true,
        address: true,
        major: true,
        parentName: true,
        parentPhone: true,
        academicYear: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      entity: 'Student',
      entityId: student.id,
      userId: session.user.id,
      newData: student
    })

    return NextResponse.json({ student }, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
