import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Get cases where user is the input person
        const casesReviewed = await prisma.violationCase.count({
            where: {
                inputById: userId
            }
        })

        // Get resolved cases
        const casesResolved = await prisma.violationCase.count({
            where: {
                inputById: userId,
                status: 'SELESAI'
            }
        })

        // Get recent cases (last 5)
        const recentCases = await prisma.violationCase.findMany({
            where: {
                inputById: userId
            },
            include: {
                student: {
                    select: {
                        name: true
                    }
                },
                violation: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 5
        })

        // Calculate active days (days since first case)
        const firstCase = await prisma.violationCase.findFirst({
            where: {
                inputById: userId
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        let activeDays = 0
        if (firstCase) {
            const diffTime = Math.abs(new Date().getTime() - new Date(firstCase.createdAt).getTime())
            activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        const stats = {
            totalCasesReviewed: casesReviewed,
            totalCasesResolved: casesResolved,
            activeDays: activeDays,
            recentCases: recentCases.map((violationCase) => ({
                id: violationCase.id,
                title: `${violationCase.violation.name} - ${violationCase.student.name}`,
                status: violationCase.status,
                createdAt: violationCase.createdAt.toISOString(),
                student: {
                    name: violationCase.student.name
                }
            }))
        }

        return NextResponse.json(stats)

    } catch (error) {
        console.error('Error fetching user stats:', error)
        return NextResponse.json({ 
            error: 'Failed to fetch user stats' 
        }, { status: 500 })
    }
}
