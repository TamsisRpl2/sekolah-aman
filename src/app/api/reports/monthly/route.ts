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

    // Only ADMIN and GURU can access reports
    if (!['ADMIN', 'GURU'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Calculate date range for the selected month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Get weekly data for the month
    const weeklyData = []
    const weeksInMonth = Math.ceil(endDate.getDate() / 7)
    
    for (let week = 1; week <= weeksInMonth; week++) {
      const weekStart = new Date(year, month, (week - 1) * 7 + 1)
      const weekEnd = new Date(year, month, Math.min(week * 7, endDate.getDate()), 23, 59, 59, 999)
      
      // Get violations for this week
      const weekViolations = await prisma.violationCase.count({
        where: {
          violationDate: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      })

      // Get resolved cases (cases with completed actions)
      const weekResolved = await prisma.violationCase.count({
        where: {
          violationDate: {
            gte: weekStart,
            lte: weekEnd
          },
          status: 'SELESAI'
        }
      })

      weeklyData.push({
        week: `Minggu ${week}`,
        violations: weekViolations,
        resolved: weekResolved,
        pending: weekViolations - weekResolved
      })
    }

    // Get violations by type for the month
    const violationsByType = await prisma.violation.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            violationCases: {
              where: {
                violationDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        violationCases: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const totalViolationsInMonth = await prisma.violationCase.count({
      where: {
        violationDate: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const violationTypeData = violationsByType.map(violation => ({
      type: violation.name,
      count: violation._count.violationCases,
      percentage: totalViolationsInMonth > 0 
        ? Math.round((violation._count.violationCases / totalViolationsInMonth) * 100)
        : 0
    }))

    // Assign colors to violation types
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981']
    const violationTypeWithColors = violationTypeData.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }))

    // Get violations by class for the month using Prisma ORM
    const violationCases = await prisma.violationCase.findMany({
      where: {
        violationDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        classLevel: true,
        studentId: true
      }
    })

    // Group by class level
    const classGroups = violationCases.reduce((acc, violationCase) => {
      const classKey = violationCase.classLevel
      if (!acc[classKey]) {
        acc[classKey] = {
          violations: 0,
          studentIds: new Set()
        }
      }
      acc[classKey].violations += 1
      acc[classKey].studentIds.add(violationCase.studentId)
      return acc
    }, {} as Record<string, { violations: number; studentIds: Set<string> }>)

    const violationsByClass = Object.entries(classGroups).map(([classLevel, data]) => ({
      classLevel,
      violations: data.violations,
      problemStudents: data.studentIds.size,
      avgViolationsPerStudent: data.studentIds.size > 0 ? data.violations / data.studentIds.size : 0
    })).sort((a, b) => b.violations - a.violations)

    const classData = violationsByClass.map(item => ({
      class: item.classLevel,
      violations: item.violations,
      problemStudents: item.problemStudents,
      avgViolationsPerStudent: item.avgViolationsPerStudent || 0
    }))

    // Calculate summary statistics
    const totalViolations = weeklyData.reduce((sum, week) => sum + week.violations, 0)
    const totalResolved = weeklyData.reduce((sum, week) => sum + week.resolved, 0)
    const totalPending = weeklyData.reduce((sum, week) => sum + week.pending, 0)
    const totalProblemStudents = violationsByClass.reduce((sum, classData) => sum + classData.problemStudents, 0)

    // Get additional statistics
    const stats = {
      totalViolations,
      totalResolved,
      totalPending,
      totalProblemStudents,
      avgViolationsPerStudent: totalProblemStudents > 0 ? totalViolations / totalProblemStudents : 0,
      resolutionRate: totalViolations > 0 ? Math.round((totalResolved / totalViolations) * 100) : 0,
      mostProblematicClass: classData.length > 0 ? classData[0].class : 'Tidak ada data'
    }

    // Get top violation categories
    const topViolationCategories = await prisma.violationCategory.findMany({
      select: {
        name: true,
        level: true,
        _count: {
          select: {
            violations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get student performance data
    const studentPerformance = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        nis: true,
        major: true,
        _count: {
          select: {
            violationCases: {
              where: {
                violationDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      },
      where: {
        violationCases: {
          some: {
            violationDate: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      orderBy: {
        violationCases: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const topProblemStudents = studentPerformance.map(student => ({
      name: student.name,
      nis: student.nis,
      major: student.major,
      violationCount: student._count.violationCases
    }))

    return NextResponse.json({
      monthlyData: weeklyData,
      violationsByType: violationTypeWithColors,
      violationsByClass: classData,
      stats,
      topViolationCategories,
      topProblemStudents,
      period: {
        month,
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching monthly report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
