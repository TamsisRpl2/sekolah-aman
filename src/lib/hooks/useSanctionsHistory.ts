import { useState, useEffect } from 'react'
import { SanctionHistoryItem, SanctionHistoryFilters, SanctionHistoryStats, SanctionHistoryResponse } from '@/types/sanctions-history'

export const useSanctionsHistory = (filters: SanctionHistoryFilters = {}) => {
  const [sanctionsHistory, setSanctionsHistory] = useState<SanctionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState<SanctionHistoryStats>({
    total: 0,
    completed: 0,
    pending: 0
  })

  const fetchSanctionsHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.startDate) searchParams.append('startDate', filters.startDate)
      if (filters.endDate) searchParams.append('endDate', filters.endDate)
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/sanctions-history?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch sanctions history')
      }

      const data: SanctionHistoryResponse = await response.json()
      setSanctionsHistory(data.sanctionsHistory)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSanctionsHistory()
  }, [filters])

  return {
    sanctionsHistory,
    loading,
    error,
    pagination,
    stats,
    refetch: fetchSanctionsHistory
  }
}
