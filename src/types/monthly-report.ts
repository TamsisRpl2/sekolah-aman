// Monthly Report Types
export interface WeeklyData {
  week: string
  violations: number
  resolved: number
  pending: number
}

export interface ViolationTypeData {
  type: string
  count: number
  percentage: number
  color: string
}

export interface ClassViolationData {
  class: string
  violations: number
  problemStudents: number
  avgViolationsPerStudent: number
}

export interface MonthlyReportStats {
  totalViolations: number
  totalResolved: number
  totalPending: number
  totalProblemStudents: number
  avgViolationsPerStudent: number
  resolutionRate: number
  mostProblematicClass: string
}

export interface ViolationCategoryData {
  name: string
  level: string
  _count: {
    violations: number
  }
}

export interface TopProblemStudent {
  name: string
  nis: string
  major?: string | null
  violationCount: number
}

export interface MonthlyReportResponse {
  monthlyData: WeeklyData[]
  violationsByType: ViolationTypeData[]
  violationsByClass: ClassViolationData[]
  stats: MonthlyReportStats
  topViolationCategories: ViolationCategoryData[]
  topProblemStudents: TopProblemStudent[]
  period: {
    month: number
    year: number
    startDate: string
    endDate: string
  }
}

export interface MonthlyReportFilters {
  month: number
  year: number
}
