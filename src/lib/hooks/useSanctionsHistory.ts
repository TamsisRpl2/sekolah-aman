import { useState, useEffect } from 'react'
import { SanctionHistoryItem, SanctionHistoryFilters, SanctionHistoryStats, SanctionHistoryResponse } from '@/types/sanctions-history'
import { getSanctionsHistoryData } from '@/app/(main)/sanctions-history/actions'

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

      const data = await getSanctionsHistoryData({
        search: filters.search,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        limit: filters.limit
      })
      
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
