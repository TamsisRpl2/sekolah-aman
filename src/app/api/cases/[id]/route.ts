import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET - Fetch single case
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const { id } = resolvedParams

        const violationCase = await prisma.violationCase.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        nis: true,
                        name: true,
                        gender: true,
                        major: true,
                        academicYear: true,
                        phone: true,
                        parentName: true,
                        parentPhone: true,
                        photo: true
                    }
                },
                violation: {
                    include: {
                        category: true
                    }
                },
                inputBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                actions: {
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
                        sanctionType: true
                    },
                    where: {
                        deletedAt: null // Only include non-deleted actions
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                sanctions: {
                    include: {
                        sanctionType: true,
                        givenBy: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
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

        return NextResponse.json(violationCase)

    } catch (error) {
        console.error('Error fetching case:', error)
        return NextResponse.json(
            { error: 'Failed to fetch case' },
            { status: 500 }
        )
    }
}

// PUT - Update case
export async function PUT(
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

        // Get current case for audit trail
        const currentCase = await prisma.violationCase.findUnique({
            where: { id }
        })

        if (!currentCase) {
            return NextResponse.json(
                { error: 'Case not found' },
                { status: 404 }
            )
        }

        const {
            studentId,
            violationId,
            violationDate,
            classLevel,
            description,
            location,
            witnesses,
            evidenceUrls,
            notes,
            status
        } = body

        // Update case
        const updatedCase = await prisma.violationCase.update({
            where: { id },
            data: {
                ...(studentId && { studentId }),
                ...(violationId && { violationId }),
                ...(violationDate && { violationDate: new Date(violationDate) }),
                ...(classLevel && { classLevel }),
                ...(description && { description }),
                ...(location !== undefined && { location }),
                ...(witnesses !== undefined && { witnesses }),
                ...(evidenceUrls !== undefined && { evidenceUrls }),
                ...(notes !== undefined && { notes }),
                ...(status && { status })
            },
            include: {
                student: {
                    select: {
                        id: true,
                        nis: true,
                        name: true,
                        photo: true
                    }
                },
                violation: {
                    include: {
                        category: {
                            select: {
                                level: true,
                                name: true
                            }
                        }
                    }
                },
                inputBy: {
                    select: {
                        name: true
                    }
                }
            }
        })

        // Log audit trail
        await createAuditLog({
            action: 'UPDATE',
            entity: 'ViolationCase',
            entityId: id,
            userId: session.user.id,
            oldData: currentCase,
            newData: updatedCase
        })

        return NextResponse.json(updatedCase)

    } catch (error) {
        console.error('Error updating case:', error)
        return NextResponse.json(
            { error: 'Failed to update case' },
            { status: 500 }
        )
    }
}

// DELETE - Delete case
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        // Get current case for audit trail
        const currentCase = await prisma.violationCase.findUnique({
            where: { id }
        })

        if (!currentCase) {
            return NextResponse.json(
                { error: 'Case not found' },
                { status: 404 }
            )
        }

        // Delete related actions and sanctions first
        await prisma.caseAction.deleteMany({
            where: { caseId: id }
        })

        await prisma.sanction.deleteMany({
            where: { caseId: id }
        })

        // Delete the case
        await prisma.violationCase.delete({
            where: { id }
        })

        // Log audit trail
        await createAuditLog({
            action: 'DELETE',
            entity: 'ViolationCase',
            entityId: id,
            userId: session.user.id,
            oldData: currentCase
        })

        return NextResponse.json({ message: 'Case deleted successfully' })

    } catch (error) {
        console.error('Error deleting case:', error)
        return NextResponse.json(
            { error: 'Failed to delete case' },
            { status: 500 }
        )
    }
}
