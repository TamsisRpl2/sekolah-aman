import dynamic from 'next/dynamic'
import Link from 'next/link'
import { IoAdd, IoFolderOpen } from 'react-icons/io5'
import { getCases, getCaseStats } from './actions'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const CasesContent = dynamic(() => import('./_components/cases-content'))

const page = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) => {
    const params = await searchParams
    
    const filters = {
        search: params.search || '',
        status: params.status || '',
        level: params.level || '',
        startDate: params.startDate || '',
        endDate: params.endDate || '',
        page: parseInt(params.page || '1'),
        limit: 12
    }

    const [casesData, stats] = await Promise.all([
        getCases(filters),
        getCaseStats()
    ])

    return <main className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                        <IoFolderOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Daftar Kasus Pelanggaran
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 mt-1">Kelola dan pantau semua kasus pelanggaran siswa</p>
                    </div>
                </div>
                <Link 
                    href="/cases/add" 
                    className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl"
                >
                    <IoAdd className="w-5 h-5" />
                    Tambah Kasus
                </Link>
            </div>

            <Breadcrumbs items={[
                { text: 'Daftar Kasus' }
            ]} />

            <CasesContent 
                initialCases={casesData.cases}
                initialPagination={casesData.pagination}
                stats={stats}
                filters={filters}
            />
        </div>
    </main>
}

export default page