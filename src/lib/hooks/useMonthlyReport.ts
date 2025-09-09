import { useState, useEffect } from 'react'
import { MonthlyReportResponse, MonthlyReportFilters } from '@/types/monthly-report'

export const useMonthlyReport = (filters: MonthlyReportFilters) => {
  const [reportData, setReportData] = useState<MonthlyReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        month: filters.month.toString(),
        year: filters.year.toString()
      })

      const response = await fetch(`/api/reports/monthly?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly report data')
      }

      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching monthly report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [filters.month, filters.year])

  const refetch = () => {
    fetchReportData()
  }

  return {
    reportData,
    loading,
    error,
    refetch
  }
}
