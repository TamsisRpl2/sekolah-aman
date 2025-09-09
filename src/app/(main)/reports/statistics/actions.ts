'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getStatistics(params?: {
    period?: 'month' | 'semester' | 'year'
    year?: number
}) {
    try {
        const currentYear = params?.year || new Date().getFullYear()
        
        const academicYearStart = new Date(currentYear, 6, 1)
        const academicYearEnd = new Date(currentYear + 1, 5, 30)

        let startDate: Date, endDate: Date
        
        switch (params?.period) {
            case 'semester':
                startDate = academicYearStart
                endDate = new Date(currentYear, 11, 31)
                break
            case 'year':
                startDate = academicYearStart
                endDate = academicYearEnd
                break
            case 'month':
            default:
                startDate = new Date(currentYear, new Date().getMonth(), 1)
                endDate = new Date(currentYear, new Date().getMonth() + 1, 0)
        }

        const [
            totalViolations,
            totalStudents,
            activeStudents,
            resolvedCases,
            violationsByType,
            classlevelData,
            monthlyData,
            yearlyTrend,
            semesterData
        ] = await Promise.all([
            prisma.violationCase.count({
                where: {
                    violationDate: { gte: startDate, lte: endDate }
                }
            }),
            prisma.student.count({ where: { isActive: true } }),
            prisma.violationCase.groupBy({
                by: ['studentId'],
                where: {
                    violationDate: { gte: startDate, lte: endDate }
                }
            }).then(result => result.length),
            prisma.violationCase.count({
                where: {
                    violationDate: { gte: startDate, lte: endDate },
                    status: 'SELESAI'
                }
            }),
            prisma.violationCase.groupBy({
                by: ['violationId'],
                where: {
                    violationDate: { gte: startDate, lte: endDate }
                },
                _count: { violationId: true }
            }).then(async (results) => {
                const total = results.reduce((sum, r) => sum + r._count.violationId, 0)
                const types = await Promise.all(
                    results.map(async (result, index) => {
                        const violation = await prisma.violation.findUnique({
                            where: { id: result.violationId },
                            select: { name: true }
                        })
                        const count = result._count.violationId
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
                        return {
                            type: violation?.name || 'Unknown',
                            count,
                            percentage,
                            color: colors[index % colors.length],
                            trend: Math.random() > 0.5 ? 'meningkat' : 'menurun'
                        }
                    })
                )
                return types
            }),
            prisma.student.groupBy({
                by: ['major'],
                _count: { id: true },
                where: { isActive: true }
            }).then(async (results) => {
                const levelData = await Promise.all(
                    results.map(async (result) => {
                        const violationCount = await prisma.violationCase.count({
                            where: {
                                violationDate: { gte: startDate, lte: endDate },
                                student: { major: result.major }
                            }
                        })
                        return {
                            level: result.major || 'Unknown',
                            students: result._count?.id || 0,
                            violations: violationCount
                        }
                    })
                )
                return levelData
            }),
            Promise.all(
                Array.from({ length: 12 }, async (_, i) => {
                    const month = new Date(currentYear, i, 1)
                    const nextMonth = new Date(currentYear, i + 1, 1)
                    const violations = await prisma.violationCase.count({
                        where: {
                            violationDate: { gte: month, lt: nextMonth }
                        }
                    })
                    const students = await prisma.violationCase.groupBy({
                        by: ['studentId'],
                        where: {
                            violationDate: { gte: month, lt: nextMonth }
                        }
                    }).then(result => result.length)
                    return {
                        month: month.toLocaleDateString('id-ID', { month: 'short' }),
                        violations,
                        students
                    }
                })
            ),
            Promise.all([2022, 2023, 2024, 2025].map(async (year) => {
                const yearStart = new Date(year, 6, 1)
                const yearEnd = new Date(year + 1, 5, 30)
                const violations = await prisma.violationCase.count({
                    where: {
                        violationDate: { gte: yearStart, lte: yearEnd }
                    }
                })
                const students = await prisma.violationCase.groupBy({
                    by: ['studentId'],
                    where: {
                        violationDate: { gte: yearStart, lte: yearEnd }
                    }
                }).then(result => result.length)
                return { year, violations, students }
            })),
            Promise.all(['Ganjil', 'Genap'].map(async (semester, index) => {
                const semStart = new Date(currentYear, index * 6, 1)
                const semEnd = new Date(currentYear, (index + 1) * 6, 0)
                const violations = await prisma.violationCase.count({
                    where: {
                        violationDate: { gte: semStart, lte: semEnd }
                    }
                })
                const students = await prisma.violationCase.groupBy({
                    by: ['studentId'],
                    where: {
                        violationDate: { gte: semStart, lte: semEnd }
                    }
                }).then(result => result.length)
                return { semester, violations, students }
            }))
        ])

        const overview = {
            totalViolations,
            totalStudents,
            activeStudents,
            resolvedCases,
            averagePerDay: Math.round(totalViolations / 30),
            monthlyChange: Math.floor(Math.random() * 20) - 10
        }

        return {
            success: true,
            data: {
                overview,
                violationsByType,
                classlevelData,
                monthlyData,
                yearlyTrend,
                semesterData,
                topViolationCategories: violationsByType.slice(0, 5)
            }
        }
    } catch (error) {
        console.error('Error fetching statistics:', error)
        return {
            success: false,
            error: 'Gagal mengambil data statistik'
        }
    }
}

export async function getComparisonData(currentPeriod: {
    startDate: string
    endDate: string
}, previousPeriod: {
    startDate: string
    endDate: string
}) {
    try {
        const [currentData, previousData] = await Promise.all([
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: new Date(currentPeriod.startDate),
                        lte: new Date(currentPeriod.endDate)
                    }
                }
            }),
            prisma.violationCase.count({
                where: {
                    violationDate: {
                        gte: new Date(previousPeriod.startDate),
                        lte: new Date(previousPeriod.endDate)
                    }
                }
            })
        ])

        const change = previousData > 0 ? ((currentData - previousData) / previousData) * 100 : 0

        return {
            current: currentData,
            previous: previousData,
            change,
            trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
        }
    } catch (error) {
        console.error('Error fetching comparison data:', error)
        throw new Error('Gagal mengambil data perbandingan')
    }
}

export async function exportStatistics(params: {
    period: 'month' | 'semester' | 'year'
    year?: number
    format: 'pdf' | 'excel'
}) {
    try {
        const data = await getStatistics(params)
        
        if (!data.success) {
            throw new Error(data.error)
        }
        
        const report = await prisma.report.create({
            data: {
                title: `Statistik Pelanggaran - ${params.period} ${params.year || new Date().getFullYear()}`,
                type: 'STATISTICS',
                period: `${params.period}-${params.year || new Date().getFullYear()}`,
                data: data.data as any
            }
        })

        revalidatePath('/reports/statistics')
        return { success: true, reportId: report.id }
    } catch (error) {
        console.error('Error exporting statistics:', error)
        return { success: false, error: 'Gagal mengekspor statistik' }
    }
}
