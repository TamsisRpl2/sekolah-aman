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

        // Get current date info
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        // Count total students with violations (anak bermasalah)
        const problematicStudents = await prisma.student.count({
            where: {
                violationCases: {
                    some: {
                        status: {
                            in: ['PENDING', 'PROSES']
                        }
                    }
                }
            }
        })

        // Count violations this month
        const violationsThisMonth = await prisma.violationCase.count({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            }
        })

        // Count ongoing violations (tindakan siswa)
        const ongoingViolations = await prisma.violationCase.count({
            where: {
                status: 'PROSES'
            }
        })

        // Count completed violations this year
        const completedViolations = await prisma.violationCase.count({
            where: {
                status: 'SELESAI',
                createdAt: {
                    gte: startOfYear
                }
            }
        })

        // Get monthly trend data (last 6 months)
        const monthlyData = []
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
            
            const monthViolations = await prisma.violationCase.count({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            })

            const monthResolved = await prisma.violationCase.count({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    },
                    status: 'SELESAI'
                }
            })

            monthlyData.push({
                month: monthStart.toLocaleDateString('id-ID', { month: 'short' }),
                violations: monthViolations,
                resolved: monthResolved
            })
        }

        // Get violation types distribution
        const violationTypes = await prisma.violation.findMany({
            include: {
                _count: {
                    select: {
                        violationCases: true
                    }
                }
            },
            orderBy: {
                violationCases: {
                    _count: 'desc'
                }
            },
            take: 5
        })

        const totalViolationCases = await prisma.violationCase.count()
        const violationTypesData = violationTypes.map((violation, index) => {
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1']
            const percentage = totalViolationCases > 0 
                ? Math.round((violation._count.violationCases / totalViolationCases) * 100)
                : 0
            
            return {
                name: violation.name,
                value: percentage,
                count: violation._count.violationCases,
                color: colors[index] || '#6366f1'
            }
        })

        // Get recent activities (last 10 cases)
        const recentActivities = await prisma.violationCase.findMany({
            include: {
                student: {
                    select: {
                        name: true,
                        major: true
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
            take: 10
        })

        const activitiesData = recentActivities.map(activity => ({
            id: activity.id,
            studentName: activity.student.name,
            studentClass: `${activity.classLevel} ${activity.student.major || 'N/A'}`,
            violationType: activity.violation.name,
            status: activity.status,
            updatedAt: activity.updatedAt.toISOString()
        }))

        // Status breakdown for process flow
        const statusData = [
            {
                stage: 'Anak Bermasalah',
                count: problematicStudents,
                percentage: 100
            },
            {
                stage: 'Pelanggaran Tercatat',
                count: violationsThisMonth,
                percentage: problematicStudents > 0 ? Math.round((violationsThisMonth / problematicStudents) * 100) : 0
            },
            {
                stage: 'Tindakan Siswa',
                count: ongoingViolations,
                percentage: violationsThisMonth > 0 ? Math.round((ongoingViolations / violationsThisMonth) * 100) : 0
            },
            {
                stage: 'Pencatatan Selesai',
                count: completedViolations,
                percentage: violationsThisMonth > 0 ? Math.round((completedViolations / violationsThisMonth) * 100) : 0
            }
        ]

        const dashboardData = {
            summary: {
                problematicStudents,
                violationsThisMonth,
                ongoingViolations,
                completedViolations
            },
            monthlyTrend: monthlyData,
            violationTypes: violationTypesData,
            recentActivities: activitiesData,
            processStatus: statusData
        }

        return NextResponse.json(dashboardData)

    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json({ 
            error: 'Failed to fetch dashboard data' 
        }, { status: 500 })
    }
}
