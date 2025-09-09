import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET - Fetch all cases with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const level = searchParams.get('level') || ''
        const startDate = searchParams.get('startDate') || ''
        const endDate = searchParams.get('endDate') || ''

        const skip = (page - 1) * limit

        // Build filter conditions
        const where: any = {}

        if (search) {
            where.OR = [
                { student: { name: { contains: search, mode: 'insensitive' } } },
                { student: { nis: { contains: search, mode: 'insensitive' } } },
                { description: { contains: search, mode: 'insensitive' } },
                { caseNumber: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status) {
            where.status = status
        }

        if (level) {
            where.violation = {
                category: {
                    level: level
                }
            }
        }

        if (startDate && endDate) {
            where.violationDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        // Fetch cases with related data
        const cases = await prisma.violationCase.findMany({
            where,
            skip,
            take: limit,
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
                },
                actions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Get total count for pagination
        const total = await prisma.violationCase.count({ where })

        // Get statistics
        const stats = await prisma.violationCase.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        })

        const statsMap = stats.reduce((acc: any, stat) => {
            acc[stat.status] = stat._count.status
            return acc
        }, {})

        return NextResponse.json({
            cases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats: {
                total,
                pending: statsMap.PENDING || 0,
                proses: statsMap.PROSES || 0,
                selesai: statsMap.SELESAI || 0,
                dibatalkan: statsMap.DIBATALKAN || 0
            }
        })

    } catch (error) {
        console.error('Error fetching cases:', error)
        return NextResponse.json(
            { error: 'Failed to fetch cases' },
            { status: 500 }
        )
    }
}

// POST - Create new case
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            studentId,
            violationId,
            violationDate,
            classLevel,
            description,
            location,
            witnesses,
            evidenceUrls,
            notes
        } = body

        // Validate required fields
        if (!studentId || !violationId || !violationDate || !classLevel || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate foreign key references
        const [student, violation, user] = await Promise.all([
            prisma.student.findUnique({ where: { id: studentId } }),
            prisma.violation.findUnique({ where: { id: violationId } }),
            prisma.user.findUnique({ where: { id: session.user.id } })
        ])

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            )
        }

        if (!violation) {
            return NextResponse.json(
                { error: 'Violation not found' },
                { status: 404 }
            )
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Generate case number
        const year = new Date().getFullYear()
        const count = await prisma.violationCase.count({
            where: {
                caseNumber: {
                    startsWith: `VC-${year}-`
                }
            }
        })
        const caseNumber = `VC-${year}-${String(count + 1).padStart(3, '0')}`

        // Create case
        const newCase = await prisma.violationCase.create({
            data: {
                caseNumber,
                studentId,
                violationId,
                inputById: session.user.id,
                violationDate: new Date(violationDate),
                classLevel,
                description,
                location,
                witnesses,
                evidenceUrls: evidenceUrls || [],
                notes,
                status: 'PENDING'
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
            action: 'CREATE',
            entity: 'ViolationCase',
            entityId: newCase.id,
            userId: session.user.id,
            newData: newCase
        })

        return NextResponse.json(newCase, { status: 201 })

    } catch (error) {
        console.error('Error creating case:', error)
        return NextResponse.json(
            { error: 'Failed to create case' },
            { status: 500 }
        )
    }
}
