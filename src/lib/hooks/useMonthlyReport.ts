import { useState, useEffect } from 'react'
import { MonthlyReportResponse, MonthlyReportFilters } from '@/types/monthly-report'
import { getMonthlyReportStats } from '@/app/(main)/reports/monthly/actions'

export const useMonthlyReport = (filters: MonthlyReportFilters) => {
  const [reportData, setReportData] = useState<MonthlyReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getMonthlyReportStats({
        month: filters.month + 1, // Convert 0-based to 1-based month
        year: filters.year
      })
      
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
