import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can view actions
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    const { id: caseId, actionId } = resolvedParams

    // Get action with relations
    const action = await prisma.caseAction.findUnique({
      where: { id: actionId },
      include: {
        actionBy: {
          select: {
            id: true,
            name: true
          }
        },
        editedBy: {
          select: {
            id: true,
            name: true
          }
        },
        deletedBy: {
          select: {
            id: true,
            name: true
          }
        },
        sanctionType: true,
        case: {
          select: {
            id: true,
            caseNumber: true,
            student: {
              select: {
                name: true,
                nis: true
              }
            }
          }
        }
      }
    })

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Check if action belongs to the specified case
    if (action.caseId !== caseId) {
      return NextResponse.json({ error: 'Action does not belong to this case' }, { status: 400 })
    }

    // Check if action is soft deleted
    if (action.deletedAt) {
      return NextResponse.json({ error: 'Action has been deleted' }, { status: 410 })
    }

    return NextResponse.json(action)

  } catch (error) {
    console.error('Error fetching action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can delete actions
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    const { id: caseId, actionId } = resolvedParams

    // Get current action
    const currentAction = await prisma.caseAction.findUnique({
      where: { id: actionId },
      include: {
        actionBy: true,
        case: true
      }
    })

    if (!currentAction) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Check if case belongs to the specified case ID
    if (currentAction.caseId !== caseId) {
      return NextResponse.json({ error: 'Action does not belong to this case' }, { status: 400 })
    }

    // Permission check: Only admin or the creator can delete
    if (session.user.role !== 'ADMIN' && currentAction.actionById !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own actions' }, { status: 403 })
    }

    // Soft delete: mark as deleted instead of actually deleting
    const deletedAction = await prisma.caseAction.update({
      where: { id: actionId },
      data: {
        deletedById: session.user.id,
        deletedAt: new Date()
      },
      include: {
        actionBy: true,
        deletedBy: true,
        sanctionType: true
      }
    })

    // Log the action
    try {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          entity: 'CaseAction',
          entityId: actionId,
          userId: session.user.id,
          oldData: currentAction,
          newData: deletedAction
        }
      })
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
      // Continue execution even if audit log fails
    }

    return NextResponse.json({ 
      message: 'Tindakan berhasil dihapus',
      deletedBy: session.user.name,
      deletedAt: deletedAction.deletedAt
    })

  } catch (error) {
    console.error('Error deleting action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can edit actions
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    const { id: caseId, actionId } = resolvedParams
    const data = await request.json()

    // Get current action
    const currentAction = await prisma.caseAction.findUnique({
      where: { id: actionId },
      include: {
        actionBy: true,
        case: true
      }
    })

    if (!currentAction) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Check if case belongs to the specified case ID
    if (currentAction.caseId !== caseId) {
      return NextResponse.json({ error: 'Action does not belong to this case' }, { status: 400 })
    }

    // Permission check: Only admin or the creator can edit
    if (session.user.role !== 'ADMIN' && currentAction.actionById !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own actions' }, { status: 403 })
    }

    // Process the data for update
    const updateData: any = {
      editedById: session.user.id,
      editedAt: new Date()
    }

    // Only include fields that are provided
    if (data.sanctionTypeId !== undefined) updateData.sanctionTypeId = data.sanctionTypeId
    if (data.description !== undefined) updateData.description = data.description
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted
    if (data.notes !== undefined) updateData.notes = data.notes
    
    // Handle followUpDate conversion
    if (data.followUpDate !== undefined) {
      if (data.followUpDate === null || data.followUpDate === '') {
        updateData.followUpDate = null
      } else {
        // Convert date string to proper Date object
        updateData.followUpDate = new Date(data.followUpDate + 'T00:00:00.000Z')
      }
    }

    // Update action
    const updatedAction = await prisma.caseAction.update({
      where: { id: actionId },
      data: updateData,
      include: {
        actionBy: true,
        editedBy: true,
        sanctionType: true
      }
    })

    // Log the action
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'CaseAction',
          entityId: actionId,
          userId: session.user.id,
          oldData: currentAction,
          newData: updatedAction
        }
      })
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
      // Continue execution even if audit log fails
    }

    return NextResponse.json(updatedAction)

  } catch (error) {
    console.error('Error updating action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
