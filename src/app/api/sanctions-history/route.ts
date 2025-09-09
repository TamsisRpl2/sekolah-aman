import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GURU can access sanctions history
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause for actions
    const where: any = {
      deletedAt: null // Only include non-deleted actions
    }

    if (search) {
      where.OR = [
        {
          case: {
            student: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        {
          case: {
            student: {
              nis: { contains: search, mode: 'insensitive' }
            }
          }
        },
        {
          description: { contains: search, mode: 'insensitive' }
        },
        {
          sanctionType: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    if (status) {
      where.isCompleted = status === 'completed'
    }

    if (startDate && endDate) {
      where.actionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get total count
    const total = await prisma.caseAction.count({ where })

    // Get sanctions history (all case actions)
    const sanctionsHistory = await prisma.caseAction.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            classLevel: true, // classLevel is in ViolationCase
            student: {
              select: {
                id: true,
                nis: true,
                name: true,
                photo: true,
                major: true,
                academicYear: true
              }
            },
            violation: {
              include: {
                category: {
                  select: {
                    name: true,
                    level: true
                  }
                }
              }
            }
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
        },
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
        }
      },
      orderBy: {
        actionDate: 'desc'
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    // Get statistics
    const stats = await prisma.caseAction.groupBy({
      by: ['isCompleted'],
      where: {
        deletedAt: null
      },
      _count: {
        isCompleted: true
      }
    })

    const statsMap = stats.reduce((acc: any, stat) => {
      acc[stat.isCompleted ? 'completed' : 'pending'] = stat._count.isCompleted
      return acc
    }, {})

    return NextResponse.json({
      sanctionsHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats: {
        total,
        completed: statsMap.completed || 0,
        pending: statsMap.pending || 0
      }
    })

  } catch (error) {
    console.error('Error fetching sanctions history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
