// Statistics Types
export interface YearlyTrendData {
  year: string
  violations: number
  students: number
  resolved: number
}

export interface SemesterData {
  semester: string
  violations: number
  students: number
  resolved: number
}

export interface ViolationTypeStats {
  type: string
  count: number
  percentage: number
  color: string
  trend: 'menurun' | 'meningkat' | 'stabil'
}

export interface ClassLevelStats {
  level: string
  violations: number
  students: number
  avgPerStudent: number
}

export interface StatisticsOverview {
  totalViolations: number
  activeStudents: number
  totalStudents: number
  resolvedCases: number
  averagePerDay: number
  monthlyChange: number // percentage change
  resolutionRate: number
  avgPerStudent: number
  trendViolations: number // percentage change
  trendStudents: number
  trendResolution: number
}

export interface MonthlyViolationData {
  month: string
  violations: number
  resolved: number
  pending: number
}

export interface StatisticsResponse {
  overview: StatisticsOverview
  yearlyTrend: YearlyTrendData[]
  semesterData: SemesterData[]
  violationsByType: ViolationTypeStats[]
  classlevelData: ClassLevelStats[]
  monthlyData: MonthlyViolationData[]
  topViolationCategories: Array<{
    name: string
    level: string
    count: number
    percentage: number
  }>
}

export interface StatisticsFilters {
  period: 'semester' | 'year' | 'month'
  year: number
  semester?: number
}
