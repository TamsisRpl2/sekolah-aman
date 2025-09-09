export type ViolationLevel = 'RINGAN' | 'SEDANG' | 'BERAT'

export interface ViolationCategory {
  id: string
  code: string
  name: string
  level: ViolationLevel
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  violations?: Violation[]
}

export interface SanctionType {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ViolationSanctionType {
  id: string
  violationId: string
  sanctionTypeId: string
  violation: Violation
  sanctionType: SanctionType
  createdAt: Date
}

export interface Violation {
  id: string
  categoryId: string
  code: string
  name: string
  description: string
  maxCount: number
  period: string
  points: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: ViolationCategory
  sanctionTypes?: ViolationSanctionType[]
  violationCases?: ViolationCase[]
}

export interface ViolationCase {
  id: string
  caseNumber: string
  studentId: string
  violationId: string
  inputById: string
  violationDate: Date
  notes?: string | null
  status: 'ACTIVE' | 'RESOLVED' | 'APPEALED'
  createdAt: Date
  updatedAt: Date
}

export interface ViolationFormData {
  categoryId: string
  code: string
  name: string
  description: string
  sanctionTypeIds?: string[]
  sanctions?: string[]
  maxCount: number
  period: string
  points: number
  isActive: boolean
}

export interface ViolationCategoryFormData {
  code: string
  name: string
  level: ViolationLevel
  description?: string
  isActive: boolean
}

export interface ViolationsListResponse {
  violations: Violation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ViolationCategoriesListResponse {
  categories: ViolationCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ViolationStats {
  totalViolations: number
  totalCategories: number
  violationsByLevel: {
    ringan: number
    sedang: number
    berat: number
  }
  activeViolations: number
  inactiveViolations: number
}
