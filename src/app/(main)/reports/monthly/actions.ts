'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getMonthlyReportData(params?: {
    year?: number
    month?: number
}) {
    try {
        const now = new Date()
        const year = params?.year || now.getFullYear()
        const month = params?.month || now.getMonth() + 1

        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

const [
            totalCases,
            pendingCases,
            processCases,
            completedCases,
            cancelledCases,
            totalStudentsViolated,
            totalActionsGiven
        ] = await Promise.all([
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'PENDING'
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'PROSES'
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'SELESAI'
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'DIBATALKAN'
                }
            }),
            prisma.violationCase.groupBy({
                by: ['studentId'],
                where: {
                    violationDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: {
                    studentId: true
                }
            }).then(result => result.length),
            prisma.caseAction.count({
                where: {
                    actionDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                }
            })
        ])

const violationDistribution = await prisma.violationCase.groupBy({
            by: ['violationId'],
            where: {
                violationDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
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
            violationDistribution.map(async (item) => {
                const violation = await prisma.violation.findUnique({
                    where: { id: item.violationId },
                    select: {
                        name: true,
                        category: {
                            select: {
                                name: true,
                                level: true
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

const dailyTrend = []
        const daysInMonth = new Date(year, month, 0).getDate()
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStart = new Date(year, month - 1, day)
            const dayEnd = new Date(year, month - 1, day, 23, 59, 59)
            
            const count = await prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: dayStart,
                        lte: dayEnd
                    }
                }
            })

            dailyTrend.push({
                date: day,
                cases: count
            })
        }

const studentViolations = await prisma.violationCase.groupBy({
            by: ['studentId'],
            where: {
                violationDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: {
                studentId: true
            },
            orderBy: {
                _count: {
                    studentId: 'desc'
                }
            },
            take: 10
        })

        const topStudents = await Promise.all(
            studentViolations.map(async (item) => {
                const student = await prisma.student.findUnique({
                    where: { id: item.studentId },
                    select: {
                        name: true,
                        nis: true,
                        major: true
                    }
                })
                return {
                    ...item,
                    student
                }
            })
        )

        return {
            period: {
                year,
                month,
                monthName: new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long' })
            },
            summary: {
                totalCases,
                pendingCases,
                processCases,
                completedCases,
                cancelledCases,
                totalStudentsViolated,
                totalActionsGiven
            },
            violationDistribution: violationDetails,
            dailyTrend,
            topStudents
        }
    } catch (error) {
        console.error('Error fetching monthly report:', error)
        throw new Error('Gagal mengambil data laporan bulanan')
    }
}

export async function getAvailableMonths() {
    try {
        const result = await prisma.violationCase.findMany({
            select: {
                violationDate: true
            },
            orderBy: {
                violationDate: 'desc'
            }
        })

        const months = new Set<string>()
        result.forEach(item => {
            const date = new Date(item.violationDate)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            months.add(monthKey)
        })

        return Array.from(months).map(monthKey => {
            const [year, month] = monthKey.split('-')
            return {
                year: parseInt(year),
                month: parseInt(month),
                label: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long' 
                })
            }
        })
    } catch (error) {
        console.error('Error fetching available months:', error)
        throw new Error('Gagal mengambil data bulan tersedia')
    }
}

export async function generateMonthlyReport(year: number, month: number) {
    try {
        const reportData = await getMonthlyReportData({ year, month })

const report = await prisma.report.create({
            data: {
                title: `Laporan Bulanan ${reportData.period.monthName} ${year}`,
                type: 'MONTHLY',
                period: `${year}-${String(month).padStart(2, '0')}`,
                data: reportData as any
            }
        })

        revalidatePath('/reports/monthly')
        return { success: true, reportId: report.id }
    } catch (error) {
        console.error('Error generating monthly report:', error)
        throw new Error('Gagal membuat laporan bulanan')
    }
}

export async function getSavedReports() {
    try {
        const reports = await prisma.report.findMany({
            where: { type: 'MONTHLY' },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return reports
    } catch (error) {
        console.error('Error fetching saved reports:', error)
        throw new Error('Gagal mengambil data laporan tersimpan')
    }
}
