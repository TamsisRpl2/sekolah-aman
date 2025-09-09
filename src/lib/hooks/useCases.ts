import { useState, useEffect } from 'react'
import { ViolationCase, CaseFilters, CaseStats, CaseFormData, ActionFormData, CaseAction } from '@/types/cases'

// Custom hook for fetching cases
export const useCases = (filters: CaseFilters = {}) => {
  const [cases, setCases] = useState<ViolationCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState<CaseStats>({
    total: 0,
    pending: 0,
    proses: 0,
    selesai: 0,
    dibatalkan: 0
  })

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.level) searchParams.append('level', filters.level)
      if (filters.startDate) searchParams.append('startDate', filters.startDate)
      if (filters.endDate) searchParams.append('endDate', filters.endDate)
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/cases?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }

      const data = await response.json()
      setCases(data.cases)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [filters])

  return {
    cases,
    loading,
    error,
    pagination,
    stats,
    refetch: fetchCases
  }
}

// Custom hook for single case
export const useCase = (id: string) => {
  const [caseData, setCaseData] = useState<ViolationCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCase = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cases/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch case')
      }

      const data = await response.json()
      setCaseData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCase()
    }
  }, [id])

  return {
    caseData,
    loading,
    error,
    refetch: fetchCase
  }
}

// API functions for case operations
export const caseAPI = {
  // Create new case
  createCase: async (data: CaseFormData): Promise<ViolationCase> => {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create case')
    }

    return response.json()
  },

  // Update case
  updateCase: async (id: string, data: Partial<CaseFormData>): Promise<ViolationCase> => {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update case')
    }

    return response.json()
  },

  // Delete case
  deleteCase: async (id: string): Promise<void> => {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete case')
    }
  },

  // Add case action
  addAction: async (caseId: string, data: ActionFormData): Promise<CaseAction> => {
    const response = await fetch(`/api/cases/${caseId}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add action')
    }

    return response.json()
  },

  // Get case actions
  getActions: async (caseId: string): Promise<CaseAction[]> => {
    const response = await fetch(`/api/cases/${caseId}/actions`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch actions')
    }

    return response.json()
  }
}
