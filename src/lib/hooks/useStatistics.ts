import { useState, useEffect } from 'react'
import { StatisticsResponse, StatisticsFilters } from '@/types/statistics'

export function useStatistics(filters: StatisticsFilters) {
  const [data, setData] = useState<StatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        period: filters.period,
        year: filters.year.toString()
      })
      
      if (filters.semester) {
        params.append('semester', filters.semester.toString())
      }
      
      const response = await fetch(`/api/reports/statistics?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [filters.period, filters.year, filters.semester])

  const refetch = () => {
    fetchStatistics()
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}
