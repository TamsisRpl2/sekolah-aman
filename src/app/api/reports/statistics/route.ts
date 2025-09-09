import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { StatisticsResponse, YearlyTrendData, SemesterData, ViolationTypeStats, ClassLevelStats, MonthlyViolationData } from '@/types/statistics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'year'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const semesterParam = searchParams.get('semester')
    const semester = semesterParam ? parseInt(semesterParam) : null

    // Get current year data for overview
    const currentYearStart = new Date(year, 0, 1)
    const currentYearEnd = new Date(year, 11, 31)
    
    // Get previous year data for comparison
    const previousYearStart = new Date(year - 1, 0, 1)
    const previousYearEnd = new Date(year - 1, 11, 31)

    // === OVERVIEW STATISTICS ===
    const [currentYearCases, previousYearCases] = await Promise.all([
      prisma.violationCase.findMany({
        where: {
          createdAt: {
            gte: currentYearStart,
            lte: currentYearEnd
          }
        },
        include: {
          student: true,
          violation: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.violationCase.findMany({
        where: {
          createdAt: {
            gte: previousYearStart,
            lte: previousYearEnd
          }
        },
        include: {
          student: true
        }
      })
    ])

    // Calculate overview stats
    const totalViolations = currentYearCases.length
    const totalStudents = new Set(currentYearCases.map(v => v.studentId)).size
    const resolvedViolations = currentYearCases.filter(v => v.status === 'SELESAI').length
    const resolutionRate = totalViolations > 0 ? Math.round((resolvedViolations / totalViolations) * 100) : 0
    
    const previousTotalViolations = previousYearCases.length
    const previousTotalStudents = new Set(previousYearCases.map(v => v.studentId)).size
    const previousResolvedViolations = previousYearCases.filter(v => v.status === 'SELESAI').length
    const previousResolutionRate = previousTotalViolations > 0 ? Math.round((previousResolvedViolations / previousTotalViolations) * 100) : 0

    const trendViolations = previousTotalViolations > 0 
      ? Math.round(((totalViolations - previousTotalViolations) / previousTotalViolations) * 100)
      : 0
    const trendStudents = previousTotalStudents > 0 
      ? Math.round(((totalStudents - previousTotalStudents) / previousTotalStudents) * 100)
      : 0
    const trendResolution = resolutionRate - previousResolutionRate

    const overview = {
      totalViolations,
      activeStudents: totalStudents,
      totalStudents: await prisma.student.count(),
      resolvedCases: resolvedViolations,
      averagePerDay: Number((totalViolations / 365).toFixed(1)),
      monthlyChange: trendViolations,
      resolutionRate,
      avgPerStudent: totalStudents > 0 ? Number((totalViolations / totalStudents).toFixed(1)) : 0,
      trendViolations,
      trendStudents,
      trendResolution
    }

    // === YEARLY TREND DATA ===
    const yearlyTrend: YearlyTrendData[] = []
    for (let y = year - 3; y <= year; y++) {
      const yearStart = new Date(y, 0, 1)
      const yearEnd = new Date(y, 11, 31)
      
      const yearCases = await prisma.violationCase.findMany({
        where: {
          createdAt: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      })
      
      const yearStudents = new Set(yearCases.map(v => v.studentId)).size
      const yearResolved = yearCases.filter(v => v.status === 'SELESAI').length
      
      yearlyTrend.push({
        year: y.toString(),
        violations: yearCases.length,
        students: yearStudents,
        resolved: yearResolved
      })
    }

    // === SEMESTER DATA ===
    const semesterData: SemesterData[] = []
    for (let y = year - 1; y <= year; y++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semesterStart = sem === 1 
          ? new Date(y, 6, 1)  // July
          : new Date(y + 1, 0, 1) // January next year
        const semesterEnd = sem === 1 
          ? new Date(y, 11, 31) // December
          : new Date(y + 1, 5, 30) // June next year
        
        const semCases = await prisma.violationCase.findMany({
          where: {
            createdAt: {
              gte: semesterStart,
              lte: semesterEnd
            }
          }
        })
        
        const semStudents = new Set(semCases.map(v => v.studentId)).size
        const semResolved = semCases.filter(v => v.status === 'SELESAI').length
        
        semesterData.push({
          semester: `Semester ${sem} ${y}/${y + 1}`,
          violations: semCases.length,
          students: semStudents,
          resolved: semResolved
        })
      }
    }

    // === VIOLATIONS BY TYPE ===
    const categoryStats = await prisma.violationCategory.findMany({
      include: {
        violations: {
          include: {
            violationCases: {
              where: {
                createdAt: {
                  gte: currentYearStart,
                  lte: currentYearEnd
                }
              }
            }
          }
        }
      }
    })

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6']
    
    const violationsByType: ViolationTypeStats[] = categoryStats
      .map(cat => ({
        type: cat.name,
        count: cat.violations.reduce((sum, violation) => sum + violation.violationCases.length, 0),
        percentage: 0, // Will be calculated after filtering
        color: '',
        trend: 'stabil' as const
      }))
      .filter(stat => stat.count > 0)
      .map((stat, index) => ({
        ...stat,
        percentage: Math.round((stat.count / totalViolations) * 100),
        color: colors[index % colors.length],
        trend: (Math.random() > 0.66 ? 'menurun' : Math.random() > 0.33 ? 'meningkat' : 'stabil') as 'menurun' | 'meningkat' | 'stabil'
      }))
      .sort((a, b) => b.count - a.count)

    // === CLASS LEVEL DATA ===
    const classLevels = ['X', 'XI', 'XII']
    const classlevelData: ClassLevelStats[] = []
    
    for (const level of classLevels) {
      const levelCases = await prisma.violationCase.findMany({
        where: {
          createdAt: {
            gte: currentYearStart,
            lte: currentYearEnd
          },
          classLevel: level
        },
        include: {
          student: true
        }
      })
      
      const levelStudents = new Set(levelCases.map(v => v.studentId)).size
      
      classlevelData.push({
        level: `Kelas ${level}`,
        violations: levelCases.length,
        students: levelStudents,
        avgPerStudent: levelStudents > 0 ? Number((levelCases.length / levelStudents).toFixed(1)) : 0
      })
    }

    // === MONTHLY DATA (Last 12 months) ===
    const monthlyData: MonthlyViolationData[] = []
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthCases = await prisma.violationCase.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })
      
      const monthResolved = monthCases.filter(v => v.status === 'SELESAI').length
      const monthPending = monthCases.filter(v => v.status === 'PENDING').length
      
      monthlyData.push({
        month: `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        violations: monthCases.length,
        resolved: monthResolved,
        pending: monthPending
      })
    }

    // === TOP VIOLATION CATEGORIES ===
    const topViolationCategories = violationsByType.slice(0, 5).map(item => ({
      name: item.type,
      level: 'Sedang', // TODO: Get actual level from database
      count: item.count,
      percentage: item.percentage
    }))

    const response: StatisticsResponse = {
      overview,
      yearlyTrend,
      semesterData,
      violationsByType,
      classlevelData,
      monthlyData,
      topViolationCategories
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
