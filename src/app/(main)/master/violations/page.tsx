import dynamic from 'next/dynamic'

const Page = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
    const resolvedSearchParams = await searchParams
    const params = new URLSearchParams()
    if (resolvedSearchParams?.search) params.set('search', String(resolvedSearchParams.search))
    if (resolvedSearchParams?.level) params.set('level', String(resolvedSearchParams.level))
    if (resolvedSearchParams?.categoryId) params.set('categoryId', String(resolvedSearchParams.categoryId))
    params.set('limit', '50')

    const searchParamsObj = Object.fromEntries(params)
    const violationsParams = {
        search: searchParamsObj.search,
        categoryId: searchParamsObj.categoryId,
        level: searchParamsObj.level,
        page: searchParamsObj.page ? parseInt(searchParamsObj.page) : undefined,
        limit: parseInt(searchParamsObj.limit || '50')
    }

    const [categories, violationsResult, stats] = await Promise.all([
        getViolationCategories(),
        getViolations(violationsParams),
        getViolationStats()
    ])
    const violations = violationsResult.violations || []

    const filterProps = {
        searchTerm: params.get('search') || '',
        selectedLevel: params.get('level') || '',
        selectedCategory: params.get('categoryId') || ''
    }
    return (
        <ViolationsContentWrapper
            categories={categories}
            violations={violations}
            stats={stats}
            {...filterProps}
        />
    )
}


import { getViolationCategories, getViolations, getViolationStats } from './actions'

const ViolationsContentWrapper = dynamic(() => import('./ViolationsContentWrapper'))



export default Page

