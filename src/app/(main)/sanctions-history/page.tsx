import dynamic from 'next/dynamic'
import { SanctionHistoryFilters } from '@/types/sanctions-history'
import Breadcrumbs from '@/components/breadcrumbs'

const SanctionsHistoryClient = dynamic(() => import('./_components/sanctions-history-client'))

const SanctionsHistoryPage = () => {
    const initialFilters: SanctionHistoryFilters = {
        page: 1,
        limit: 10,
        search: '',
        status: '',
        startDate: '',
        endDate: ''
    }

    return (
        <main className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Sanksi</h1>
                    <p className="text-gray-600 mt-1">Kelola dan pantau riwayat sanksi yang telah diberikan</p>
                </div>
            </div>

            <Breadcrumbs items={[
                { text: 'Riwayat Sanksi' }
            ]} />

            <SanctionsHistoryClient initialFilters={initialFilters} />
        </main>
    )
}

export default SanctionsHistoryPage
