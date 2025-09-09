import { useState, useEffect } from 'react'

interface UserStats {
    totalCasesReviewed: number
    totalCasesResolved: number
    activeDays: number
    recentCases: Array<{
        id: string
        title: string
        status: string
        createdAt: string
        student: {
            name: string
        }
    }>
}

export const useUserStats = (userId?: string) => {
    const [stats, setStats] = useState<UserStats>({
        totalCasesReviewed: 0,
        totalCasesResolved: 0,
        activeDays: 0,
        recentCases: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return

        const fetchUserStats = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/profile/stats`)
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user stats')
                }

                const data = await response.json()
                setStats(data)
            } catch (err) {
                console.error('Error fetching user stats:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchUserStats()
    }, [userId])

    return { stats, loading, error }
}
