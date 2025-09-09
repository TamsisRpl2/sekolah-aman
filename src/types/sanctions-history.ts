// Sanctions History Types
export interface SanctionHistoryItem {
  id: string
  caseId: string
  actionById: string
  sanctionTypeId?: string | null
  actionDate: string
  actionType: string
  description: string
  evidenceUrls?: string[]
  followUpDate?: string | null
  isCompleted: boolean
  notes?: string | null
  editedById?: string | null
  editedAt?: string | null
  createdAt: string
  updatedAt: string
  
  // Relations
  case: {
    id: string
    caseNumber: string
    classLevel: string
    student: {
      id: string
      nis: string
      name: string
      photo?: string | null
      major?: string | null
      academicYear?: string | null
    }
    violation: {
      id: string
      code: string
      name: string
      description: string
      category: {
        name: string
        level: string
      }
    }
  }
  sanctionType?: {
    id: string
    name: string
    description?: string | null
    level: string
    duration?: number | null
  } | null
  actionBy: {
    id: string
    name: string
  }
  editedBy?: {
    id: string
    name: string
  } | null
}

export interface SanctionHistoryFilters {
  search?: string
  status?: 'completed' | 'pending' | ''
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface SanctionHistoryStats {
  total: number
  completed: number
  pending: number
}

export interface SanctionHistoryResponse {
  sanctionsHistory: SanctionHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: SanctionHistoryStats
}
