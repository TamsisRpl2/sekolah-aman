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

export async function getDashboardStats() {
    try {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Summary stats
        const [
            problematicStudents,
            violationsThisMonth,
            ongoingViolations,
            completedViolations
        ] = await Promise.all([
            prisma.student.count({
                where: {
                    isActive: true,
                    violationCases: {
                        some: {
                            status: {
                                in: ['PENDING', 'PROSES']
                            }
                        }
                    }
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startOfMonth
                    }
                }
            }),
            prisma.violationCase.count({
                where: {
                    status: 'PROSES'
                }
            }),
            prisma.violationCase.count({
                where: {
                    status: 'SELESAI',
                    violationDate: {
                        gte: startOfYear
                    }
                }
            })
        ])

        // Monthly trend (6 months)
        const monthlyTrend = []
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
            
            const [violations, resolved] = await Promise.all([
                prisma.violationCase.count({
                    where: {
                        violationDate: {
                            gte: date,
                            lt: nextDate
                        }
                    }
                }),
                prisma.violationCase.count({
                    where: {
                        violationDate: {
                            gte: date,
                            lt: nextDate
                        },
                        status: 'SELESAI'
                    }
                })
            ])

            monthlyTrend.push({
                month: date.toLocaleDateString('id-ID', { month: 'short' }),
                violations,
                resolved
            })
        }

        // Violation types distribution
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

        const totalViolations = violationGroups.reduce((sum, g) => sum + g._count.violationId, 0)
        
        const violationTypes = await Promise.all(
            violationGroups.map(async (group, index) => {
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
                
                const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4']
                
                return {
                    name: violation?.name || 'Unknown',
                    value: Math.round((group._count.violationId / totalViolations) * 100),
                    count: group._count.violationId,
                    color: colors[index] || '#6366f1'
                }
            })
        )

        // Recent activities
        const recentCases = await prisma.violationCase.findMany({
            take: 10,
            orderBy: {
                updatedAt: 'desc'
            },
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
            }
        })

        const recentActivities = recentCases.map(c => ({
            id: c.id,
            studentName: c.student.name,
            studentClass: c.student.major || '-',
            violationType: c.violation.name,
            status: c.status,
            updatedAt: c.updatedAt.toISOString()
        }))

        // Process status
        const [pending, proses, selesai, batal] = await Promise.all([
            prisma.violationCase.count({ where: { status: 'PENDING' } }),
            prisma.violationCase.count({ where: { status: 'PROSES' } }),
            prisma.violationCase.count({ where: { status: 'SELESAI' } }),
            prisma.violationCase.count({ where: { status: 'DIBATALKAN' } })
        ])

        const totalCases = pending + proses + selesai + batal

        const processStatus = [
            {
                stage: 'Anak Bermasalah',
                count: pending,
                percentage: totalCases > 0 ? Math.round((pending / totalCases) * 100) : 0
            },
            {
                stage: 'Pencatatan Pelanggaran',
                count: pending + proses,
                percentage: totalCases > 0 ? Math.round(((pending + proses) / totalCases) * 100) : 0
            },
            {
                stage: 'Tindakan Siswa',
                count: proses,
                percentage: totalCases > 0 ? Math.round((proses / totalCases) * 100) : 0
            },
            {
                stage: 'Pencatatan Selesai',
                count: selesai,
                percentage: totalCases > 0 ? Math.round((selesai / totalCases) * 100) : 0
            }
        ]

        return {
            summary: {
                problematicStudents,
                violationsThisMonth,
                ongoingViolations,
                completedViolations
            },
            monthlyTrend,
            violationTypes,
            recentActivities,
            processStatus
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw new Error('Gagal mengambil statistik dashboard')
    }
}
