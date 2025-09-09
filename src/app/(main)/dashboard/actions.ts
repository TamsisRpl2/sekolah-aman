'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getDashboardData() {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const totalCases = await prisma.violationCase.count()

        const casesThisMonth = await prisma.violationCase.count({
            where: {
                violationDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        })

        const resolvedCases = await prisma.violationCase.count({
            where: {
                status: 'SELESAI'
            }
        })

        const activeStudents = await prisma.student.count({
            where: {
                isActive: true
            }
        })
        const monthlyTrends = []
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
            
            const count = await prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: date,
                        lt: nextDate
                    }
                }
            })

            monthlyTrends.push({
                month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
                cases: count
            })
        }

const violationGroups = await prisma.violationCase.groupBy({
            by: ['violationId'],
            _count: {
                violationId: true
            },
            orderBy: {
                _count: {
                    violationId: 'desc'
                }
            },
            take: 5
        })

const violationDistribution = await Promise.all(
            violationGroups.map(async (group) => {
                const violation = await prisma.violation.findUnique({
                    where: { id: group.violationId },
                    select: {
                        name: true,
                        category: {
                            select: {
                                level: true
                            }
                        }
                    }
                })
                return {
                    ...group,
                    violation
                }
            })
        )

const recentActivities = await prisma.violationCase.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                student: {
                    select: {
                        name: true,
                        nis: true
                    }
                },
                violation: {
                    select: {
                        name: true,
                        category: {
                            select: {
                                level: true
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

        return {
            stats: {
                totalCases,
                casesThisMonth,
                resolvedCases,
                activeStudents
            },
            monthlyTrends,
            violationDistribution,
            recentActivities
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        throw new Error('Gagal mengambil data dashboard')
    }
}
