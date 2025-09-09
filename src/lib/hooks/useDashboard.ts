import { useState, useEffect } from 'react'

interface DashboardSummary {
    problematicStudents: number
    violationsThisMonth: number
    ongoingViolations: number
    completedViolations: number
}

interface MonthlyTrend {
    month: string
    violations: number
    resolved: number
}

interface ViolationType {
    name: string
    value: number
    count: number
    color: string
}

interface RecentActivity {
    id: string
    studentName: string
    studentClass: string
    violationType: string
    status: string
    updatedAt: string
}

interface ProcessStatus {
    stage: string
    count: number
    percentage: number
}

interface DashboardData {
    summary: DashboardSummary
    monthlyTrend: MonthlyTrend[]
    violationTypes: ViolationType[]
    recentActivities: RecentActivity[]
    processStatus: ProcessStatus[]
}

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData>({
        summary: {
            problematicStudents: 0,
            violationsThisMonth: 0,
            ongoingViolations: 0,
            completedViolations: 0
        },
        monthlyTrend: [],
        violationTypes: [],
        recentActivities: [],
        processStatus: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/dashboard')
                
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data')
                }

                const dashboardData = await response.json()
                setData(dashboardData)
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const refresh = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/dashboard')
            
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const dashboardData = await response.json()
            setData(dashboardData)
        } catch (err) {
            console.error('Error refreshing dashboard data:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    return { data, loading, error, refresh }
}
