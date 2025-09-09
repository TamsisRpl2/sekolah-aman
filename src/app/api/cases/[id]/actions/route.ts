import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET - Fetch case actions
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        const actions = await prisma.caseAction.findMany({
            where: { caseId: id },
            include: {
                actionBy: {
                    select: {
                        name: true
                    }
                },
                sanctionType: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        level: true,
                        duration: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(actions)

    } catch (error) {
        console.error('Error fetching case actions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch case actions' },
            { status: 500 }
        )
    }
}

// POST - Add case action
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const body = await request.json()

        const {
            actionType, // This will be sanctionTypeId now
            description,
            evidenceUrls,
            followUpDate,
            isCompleted,
            notes
        } = body

        // Validate required fields - actionType is now sanctionTypeId
        if (!actionType || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify that sanctionTypeId exists
        const sanctionType = await prisma.sanctionType.findUnique({
            where: { id: actionType }
        })

        if (!sanctionType) {
            return NextResponse.json(
                { error: 'Invalid sanction type' },
                { status: 400 }
            )
        }

        // Check if case exists
        const violationCase = await prisma.violationCase.findUnique({
            where: { id },
            include: {
                actions: {
                    select: {
                        id: true,
                        isCompleted: true,
                        deletedAt: true
                    }
                }
            }
        })

        if (!violationCase) {
            return NextResponse.json(
                { error: 'Case not found' },
                { status: 404 }
            )
        }

        // Check if there are any completed actions (excluding soft deleted ones)
        const hasCompletedAction = violationCase.actions.some(action => 
            action.isCompleted && !action.deletedAt
        )

        if (hasCompletedAction) {
            return NextResponse.json(
                { error: 'Cannot add new action to a case that already has a completed action' },
                { status: 400 }
            )
        }

        // Create action
        const newAction = await prisma.caseAction.create({
            data: {
                caseId: id,
                actionById: session.user.id,
                sanctionTypeId: actionType, // Use sanctionTypeId
                actionType: sanctionType.name, // Keep for backward compatibility
                description,
                evidenceUrls: evidenceUrls || [],
                followUpDate: followUpDate ? new Date(followUpDate) : null,
                isCompleted: isCompleted || false,
                notes
            },
            include: {
                actionBy: {
                    select: {
                        name: true
                    }
                },
                sanctionType: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        level: true,
                        duration: true
                    }
                }
            }
        })

        // Update case status if action is marked as completed
        if (isCompleted) {
            await prisma.violationCase.update({
                where: { id },
                data: {
                    status: 'SELESAI'
                }
            })
        } else {
            await prisma.violationCase.update({
                where: { id },
                data: {
                    status: 'PROSES'
                }
            })
        }

        // Log audit trail
        await createAuditLog({
            userId: session.user.id,
            action: 'CREATE',
            entity: 'CaseAction',
            entityId: newAction.id,
            newData: newAction
        })

        return NextResponse.json(newAction, { status: 201 })

    } catch (error) {
        console.error('Error creating case action:', error)
        return NextResponse.json(
            { error: 'Failed to create case action' },
            { status: 500 }
        )
    }
}
