import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can access student details
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    const student = await prisma.student.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        nis: true,
        name: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        phone: true,
        address: true,
        major: true,
        parentName: true,
        parentPhone: true,
        academicYear: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Get violation cases
        violationCases: {
          select: {
            id: true,
            caseNumber: true,
            violationDate: true,
            classLevel: true,
            description: true,
            status: true,
            inputBy: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            violationDate: 'desc'
          },
          take: 10
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can update students
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
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
      isActive 
    } = body

    // Validate required fields
    if (!nis || !name || !gender || !academicYear) {
      return NextResponse.json(
        { error: 'NIS, name, gender, and academic year are required' },
        { status: 400 }
      )
    }

    // Get current student data
    const currentStudent = await prisma.student.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!currentStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if NIS already exists (exclude current student)
    if (nis !== currentStudent.nis) {
      const existingStudent = await prisma.student.findUnique({
        where: { nis }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'NIS already exists' },
          { status: 400 }
        )
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: resolvedParams.id },
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
      action: 'UPDATE',
      entity: 'Student',
      entityId: resolvedParams.id,
      userId: session.user.id,
      oldData: currentStudent,
      newData: updatedStudent
    })

    return NextResponse.json({ student: updatedStudent })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete students
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    // Get student data first
    const student = await prisma.student.findUnique({
      where: { id: resolvedParams.id },
      include: {
        violationCases: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Force delete parameter
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force')

    // Check if student has violation records
    const hasViolations = student.violationCases.length > 0

    // If student has violations and no force parameter, do soft delete
    if (hasViolations && force !== 'true') {
      // Soft delete - just deactivate the student
      const deactivatedStudent = await prisma.student.update({
        where: { id: resolvedParams.id },
        data: {
          isActive: false
        }
      })

      // Create audit log
      await createAuditLog({
        action: 'SOFT_DELETE',
        entity: 'Student',
        entityId: resolvedParams.id,
        userId: session.user.id,
        oldData: student,
        newData: deactivatedStudent
      })

      return NextResponse.json({ 
        message: `Siswa ${student.name} dinonaktifkan karena memiliki ${student.violationCases.length} riwayat pelanggaran. Gunakan force delete untuk menghapus permanen.`,
        type: 'soft_delete',
        violationCount: student.violationCases.length
      })
    } 
    
    // If no violations or force=true, do hard delete
    else {
      // Hard delete - completely remove the student
      await prisma.student.delete({
        where: { id: resolvedParams.id }
      })

      // Create audit log
      await createAuditLog({
        action: 'DELETE',
        entity: 'Student',
        entityId: resolvedParams.id,
        userId: session.user.id,
        oldData: student
      })

      return NextResponse.json({ 
        message: hasViolations 
          ? `Siswa ${student.name} berhasil dihapus permanen (force delete)` 
          : `Siswa ${student.name} berhasil dihapus`,
        type: 'hard_delete'
      })
    }

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
