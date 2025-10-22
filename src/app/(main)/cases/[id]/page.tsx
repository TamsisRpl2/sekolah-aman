import dynamic from 'next/dynamic'
import Link from 'next/link'
import { IoArrowBack, IoAdd } from 'react-icons/io5'
import { getCase, getStudentsForCase, getViolationsForCase } from './actions'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    const [caseData, students, violations] = await Promise.all([
        getCase(id),
        getStudentsForCase(),
        getViolationsForCase()
    ])
    
    // Convert Date to string for form
    const formattedCaseData = {
        ...caseData,
        violationDate: caseData.violationDate.toISOString().split('T')[0]
    }
    
    return <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-red-50 min-h-screen">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <Link 
                    href="/cases"
                    className="btn btn-sm btn-circle bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 transition-all duration-200"
                >
                    <IoArrowBack className="w-4 h-4" />
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Detail & Edit Kasus
                    </h1>
                    <p className="text-slate-600">Kelola informasi detail kasus pelanggaran</p>
                </div>
            </div>
            <Link 
                href={`/cases/${id}/action`}
                className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
                <IoAdd className="w-4 h-4" />
                Kelola Tindakan
            </Link>
        </div>
        
        <Breadcrumbs items={[
            { text: 'Daftar Kasus', link: '/cases' },
            { text: 'Detail & Edit Kasus' },
        ]} />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white">
                            <IoAdd className="w-10 h-10" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{caseData.caseNumber}</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {caseData.status}
                            </div>
                            <div className="flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {caseData.violation.category.level}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <Form 
                    caseData={formattedCaseData}
                    students={students}
                    violations={violations}
                />
            </div>
        </div>
    </main>
}

export default page