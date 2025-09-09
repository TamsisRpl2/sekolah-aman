'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getTeacher(teacherId: string) {
    try {
        const teacher = await prisma.user.findUnique({
            where: { 
                id: teacherId,
                role: 'GURU'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                image: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        violationCases: true,
                        caseActions: true,
                        sanctions: true
                    }
                }
            }
        })

        if (!teacher) {
            throw new Error('Guru tidak ditemukan')
        }

        return teacher
    } catch (error) {
        console.error('Error fetching teacher:', error)
        throw new Error('Gagal mengambil data guru')
    }
}

export async function getTeacherStats(teacherId: string) {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        const [
            totalCases,
            casesThisMonth,
            casesThisYear,
            totalActions,
            actionsThisMonth,
            completedActions,
            totalSanctions
        ] = await Promise.all([
            prisma.violationCase.count({
                where: { inputById: teacherId }
            }),
            prisma.violationCase.count({
                where: { 
                    inputById: teacherId,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            }),
            prisma.violationCase.count({
                where: { 
                    inputById: teacherId,
                    createdAt: {
                        gte: startOfYear
                    }
                }
            }),
            prisma.caseAction.count({
                where: { 
                    actionById: teacherId,
                    deletedAt: null
                }
            }),
            prisma.caseAction.count({
                where: { 
                    actionById: teacherId,
                    actionDate: {
                        gte: startOfMonth
                    },
                    deletedAt: null
                }
            }),
            prisma.caseAction.count({
                where: { 
                    actionById: teacherId,
                    isCompleted: true,
                    deletedAt: null
                }
            }),
            prisma.sanction.count({
                where: { givenById: teacherId }
            })
        ])

        return {
            cases: {
                total: totalCases,
                thisMonth: casesThisMonth,
                thisYear: casesThisYear
            },
            actions: {
                total: totalActions,
                thisMonth: actionsThisMonth,
                completed: completedActions
            },
            sanctions: {
                total: totalSanctions
            }
        }
    } catch (error) {
        console.error('Error fetching teacher stats:', error)
        throw new Error('Gagal mengambil statistik guru')
    }
}

export async function getTeacherActivities(teacherId: string, limit: number = 10) {
    try {
        const recentCases = await prisma.violationCase.findMany({
            where: { inputById: teacherId },
            take: limit,
            orderBy: { createdAt: 'desc' },
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
                }
            }
        })

        const recentActions = await prisma.caseAction.findMany({
            where: { 
                actionById: teacherId,
                deletedAt: null
            },
            take: limit,
            orderBy: { actionDate: 'desc' },
            include: {
                case: {
                    select: {
                        caseNumber: true,
                        student: {
                            select: {
                                name: true,
                                nis: true
                            }
                        }
                    }
                },
                sanctionType: {
                    select: {
                        name: true,
                        level: true
                    }
                }
            }
        })

        return {
            recentCases,
            recentActions
        }
    } catch (error) {
        console.error('Error fetching teacher activities:', error)
        throw new Error('Gagal mengambil aktivitas guru')
    }
}

export async function updateTeacherStatus(teacherId: string, isActive: boolean) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN') {
            throw new Error('Hanya admin yang dapat mengubah status guru')
        }

        await prisma.user.update({
            where: { id: teacherId },
            data: { isActive }
        })

        revalidatePath('/users/teachers')
        revalidatePath(`/users/teachers/${teacherId}`)
        return { success: true }
    } catch (error) {
        console.error('Error updating teacher status:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate status guru')
    }
}

export async function getTeacherCasesByMonth(teacherId: string, year?: number) {
    try {
        const targetYear = year || new Date().getFullYear()
        const monthlyData = []

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(targetYear, month, 1)
            const endDate = new Date(targetYear, month + 1, 0)

            const count = await prisma.violationCase.count({
                where: {
                    inputById: teacherId,
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })

            monthlyData.push({
                month: startDate.toLocaleDateString('id-ID', { month: 'short' }),
                cases: count
            })
        }

        return monthlyData
    } catch (error) {
        console.error('Error fetching teacher cases by month:', error)
        throw new Error('Gagal mengambil data kasus per bulan')
    }
}

export async function getTeacherViolationDistribution(teacherId: string) {
    try {
        const violations = await prisma.violationCase.groupBy({
            by: ['violationId'],
            where: { inputById: teacherId },
            _count: {
                violationId: true
            },
            orderBy: {
                _count: {
                    violationId: 'desc'
                }
            },
            take: 10
        })

        const violationDetails = await Promise.all(
            violations.map(async (item) => {
                const violation = await prisma.violation.findUnique({
                    where: { id: item.violationId },
                    select: {
                        name: true,
                        category: {
                            select: {
                                level: true,
                                name: true
                            }
                        }
                    }
                })
                return {
                    ...item,
                    violation
                }
            })
        )

        return violationDetails
    } catch (error) {
        console.error('Error fetching teacher violation distribution:', error)
        throw new Error('Gagal mengambil distribusi pelanggaran guru')
    }
}
