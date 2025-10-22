"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import ViolationsContent from './_components/violations-content'

export default function ViolationsContentWrapper({ categories, violations, stats, searchTerm, selectedLevel, selectedCategory }: any) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const setParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }, [router, searchParams])
    
    const onSearchTermChange = (v: string) => setParam('search', v)
    const onSelectedLevelChange = (v: string) => setParam('level', v)
    const onSelectedCategoryChange = (v: string) => setParam('categoryId', v)
    const onResetFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')
        params.delete('level')
        params.delete('categoryId')
        router.push(`?${params.toString()}`)
    }

    const onRefresh = () => {
        router.refresh()
    }

    return (
        <ViolationsContent
            categories={categories}
            violations={violations}
            stats={stats}
            searchTerm={searchTerm}
            selectedLevel={selectedLevel}
            selectedCategory={selectedCategory}
            onSearchTermChange={onSearchTermChange}
            onSelectedLevelChange={onSelectedLevelChange}
            onSelectedCategoryChange={onSelectedCategoryChange}
            onResetFilters={onResetFilters}
            onRefresh={onRefresh}
        />
    )
}