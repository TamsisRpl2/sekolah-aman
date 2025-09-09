import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can access teacher details
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const teacher = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'GURU'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Get related data
        violationCases: {
          select: {
            id: true,
            caseNumber: true,
            violationDate: true,
            status: true,
            classLevel: true,
            student: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        caseActions: {
          select: {
            id: true,
            actionType: true,
            actionDate: true,
            case: {
              select: {
                caseNumber: true,
                student: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            actionDate: 'desc'
          },
          take: 5
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ teacher })

  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can update teachers
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, address, isActive, password } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'GURU'
      }
    })

    if (!existingTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Check if email is taken by another user
    if (email !== existingTeacher.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      address,
      isActive
    }

    // Hash new password if provided
    if (password) {
      const bcrypt = require('bcryptjs')
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update teacher
    const teacher = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        updatedAt: true
      }
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: teacher.id,
      oldData: {
        name: existingTeacher.name,
        email: existingTeacher.email,
        phone: existingTeacher.phone,
        address: existingTeacher.address,
        isActive: existingTeacher.isActive
      },
      newData: {
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        isActive: teacher.isActive
      }
    })

    return NextResponse.json({ teacher })

  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete teachers
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'GURU'
      }
    })

    if (!existingTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Check if teacher has related data
    const hasRelatedData = await prisma.violationCase.findFirst({
      where: { inputById: params.id }
    })

    if (hasRelatedData) {
      // Soft delete - just deactivate the account
      await prisma.user.update({
        where: { id: params.id },
        data: { isActive: false }
      })

      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'DEACTIVATE',
        entity: 'User',
        entityId: params.id,
        oldData: { isActive: true },
        newData: { isActive: false }
      })

      return NextResponse.json({ 
        message: 'Teacher deactivated due to existing related data' 
      })
    } else {
      // Hard delete if no related data
      await prisma.user.delete({
        where: { id: params.id }
      })

      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'DELETE',
        entity: 'User',
        entityId: params.id,
        oldData: {
          name: existingTeacher.name,
          email: existingTeacher.email,
          role: 'GURU'
        }
      })

      return NextResponse.json({ message: 'Teacher deleted successfully' })
    }

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
