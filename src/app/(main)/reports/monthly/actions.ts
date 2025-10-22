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

export async function getMonthlyReportStats(params?: {
    year?: number
    month?: number
}) {
    try {
        const now = new Date()
        const year = params?.year || now.getFullYear()
        const month = params?.month || now.getMonth() + 1

        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Get all violations for the month
        const violations = await prisma.violationCase.findMany({
            where: {
                violationDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                student: {
                    select: {
                        name: true,
                        nis: true,
                        major: true
                    }
                },
                violation: {
                    select: {
                        name: true,
                        category: {
                            select: {
                                name: true,
                                level: true
                            }
                        }
                    }
                }
            }
        })

        // Calculate stats
        const totalViolations = violations.length
        const totalResolved = violations.filter(v => v.status === 'SELESAI').length
        const totalPending = violations.filter(v => v.status === 'PENDING').length
        
        const uniqueStudents = new Set(violations.map(v => v.studentId))
        const totalProblemStudents = uniqueStudents.size
        
        const avgViolationsPerStudent = totalProblemStudents > 0 
            ? Math.round((totalViolations / totalProblemStudents) * 10) / 10 
            : 0
        
        const resolutionRate = totalViolations > 0 
            ? Math.round((totalResolved / totalViolations) * 100) 
            : 0

        // Get most problematic class
        const classCounts = new Map<string, number>()
        violations.forEach(v => {
            const className = v.student.major || 'Tidak Diketahui'
            classCounts.set(className, (classCounts.get(className) || 0) + 1)
        })
        
        let mostProblematicClass = '-'
        let maxCount = 0
        classCounts.forEach((count, className) => {
            if (count > maxCount) {
                maxCount = count
                mostProblematicClass = className
            }
        })

        // Weekly data (split month into weeks)
        const weeklyData = []
        const daysInMonth = new Date(year, month, 0).getDate()
        let weekStart = 1
        
        while (weekStart <= daysInMonth) {
            const weekEnd = Math.min(weekStart + 6, daysInMonth)
            const weekStartDate = new Date(year, month - 1, weekStart)
            const weekEndDate = new Date(year, month - 1, weekEnd, 23, 59, 59)
            
            const weekViolations = violations.filter(v => {
                const vDate = new Date(v.violationDate)
                return vDate >= weekStartDate && vDate <= weekEndDate
            })
            
            weeklyData.push({
                week: `Minggu ${Math.ceil(weekStart / 7)}`,
                violations: weekViolations.length,
                resolved: weekViolations.filter(v => v.status === 'SELESAI').length,
                pending: weekViolations.filter(v => v.status === 'PENDING').length
            })
            
            weekStart = weekEnd + 1
        }

        // Violations by type
        const typeMap = new Map<string, number>()
        violations.forEach(v => {
            const typeName = v.violation.name
            typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1)
        })
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899']
        const violationsByType = Array.from(typeMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([type, count], index) => ({
                type,
                count,
                percentage: totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0,
                color: colors[index] || '#6366f1'
            }))

        // Violations by class
        const classMap = new Map<string, { violations: number, students: Set<string> }>()
        violations.forEach(v => {
            const className = v.student.major || 'Tidak Diketahui'
            if (!classMap.has(className)) {
                classMap.set(className, { violations: 0, students: new Set() })
            }
            const classData = classMap.get(className)!
            classData.violations++
            classData.students.add(v.studentId)
        })
        
        const violationsByClass = Array.from(classMap.entries())
            .map(([className, data]) => ({
                class: className,
                violations: data.violations,
                problemStudents: data.students.size,
                avgViolationsPerStudent: data.students.size > 0 
                    ? Math.round((data.violations / data.students.size) * 10) / 10 
                    : 0
            }))
            .sort((a, b) => b.violations - a.violations)

        // Top violation categories
        const categoryMap = new Map<string, { name: string, level: string, count: number }>()
        violations.forEach(v => {
            const catName = v.violation.category.name
            if (!categoryMap.has(catName)) {
                categoryMap.set(catName, {
                    name: catName,
                    level: v.violation.category.level,
                    count: 0
                })
            }
            categoryMap.get(catName)!.count++
        })
        
        const topViolationCategories = Array.from(categoryMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(cat => ({
                name: cat.name,
                level: cat.level,
                _count: { violations: cat.count }
            }))

        // Top problem students
        const studentMap = new Map<string, { name: string, nis: string, major: string | null, count: number }>()
        violations.forEach(v => {
            if (!studentMap.has(v.studentId)) {
                studentMap.set(v.studentId, {
                    name: v.student.name,
                    nis: v.student.nis,
                    major: v.student.major,
                    count: 0
                })
            }
            studentMap.get(v.studentId)!.count++
        })
        
        const topProblemStudents = Array.from(studentMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(s => ({
                name: s.name,
                nis: s.nis,
                major: s.major,
                violationCount: s.count
            }))

        return {
            monthlyData: weeklyData,
            violationsByType,
            violationsByClass,
            stats: {
                totalViolations,
                totalResolved,
                totalPending,
                totalProblemStudents,
                avgViolationsPerStudent,
                resolutionRate,
                mostProblematicClass
            },
            topViolationCategories,
            topProblemStudents,
            period: {
                month,
                year,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        }
    } catch (error) {
        console.error('Error fetching monthly report stats:', error)
        throw new Error('Gagal mengambil statistik laporan bulanan')
    }
}
