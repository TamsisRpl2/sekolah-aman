// Case Management Types
export interface ViolationCase {
  id: string
  caseNumber: string
  studentId: string
  violationId: string
  inputById: string
  violationDate: string
  classLevel: string
  description: string
  evidenceUrls?: string[]
  location?: string | null
  witnesses?: string | null
  status: CaseStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
  
  // Relations
  student: {
    id: string
    nis: string
    name: string
    photo?: string | null
  }
  violation: {
    id: string
    code: string
    name: string
    description: string
    sanction: string
    points: number
    category: {
      level: ViolationLevel
      name: string
    }
  }
  inputBy: {
    name: string
  }
  actions?: CaseAction[]
  sanctions?: Sanction[]
}

export interface CaseAction {
  id: string
  caseId: string
  actionById: string
  actionDate: string
  actionType: string
  description: string
  evidenceUrls?: string[]
  followUpDate?: string | null
  isCompleted: boolean
  notes?: string | null
  
  // Audit fields
  editedById?: string | null
  editedAt?: string | null
  deletedById?: string | null
  deletedAt?: string | null
  
  createdAt: string
  updatedAt: string
  
  // Relations
  actionBy?: {
    id: string
    name: string
  }
  createdBy?: {
    id: string
    name: string
  }
  editedBy?: {
    id: string
    name: string
  }
  deletedBy?: {
    id: string
    name: string
  }
}

export interface Sanction {
  id: string
  caseId: string
  sanctionTypeId: string
  givenById: string
  startDate: string
  endDate?: string | null
  description?: string | null
  isCompleted: boolean
  completedDate?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  
  // Relations
  sanctionType: {
    id: string
    name: string
    level: ViolationLevel
    description?: string | null
    duration?: number | null
  }
  givenBy: {
    name: string
  }
}

export type CaseStatus = 'PENDING' | 'PROSES' | 'SELESAI' | 'DIBATALKAN'
export type ViolationLevel = 'RINGAN' | 'SEDANG' | 'BERAT'

export interface CaseFilters {
  search?: string
  status?: CaseStatus | ''
  level?: ViolationLevel | ''
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface CaseStats {
  total: number
  pending: number
  proses: number
  selesai: number
  dibatalkan: number
}

export interface CaseFormData {
  studentId: string
  violationId: string
  violationDate: string
  classLevel: string
  description: string
  location?: string
  witnesses?: string
  evidenceUrls?: string[]
  notes?: string
}

export interface ActionFormData {
  actionType: string // This will contain sanctionTypeId
  description: string
  evidenceUrls?: string[]
  followUpDate?: string
  isCompleted?: boolean
  notes?: string
}

export interface CaseActionWithSanction extends CaseAction {
  sanctionType?: {
    id: string
    name: string
    description?: string | null
    level: ViolationLevel
    duration?: number | null
  }
}
