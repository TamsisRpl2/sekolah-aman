import dynamic from 'next/dynamic'
import Link from 'next/link'
import { IoArrowBack, IoShieldCheckmark, IoTimeOutline } from 'react-icons/io5'
import { getCaseForAction, getCaseActions, getLastAction } from './actions'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))
const Timeline = dynamic(() => import('./_components/timeline'))

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    const [caseData, actions, lastAction] = await Promise.all([
        getCaseForAction(id),
        getCaseActions(id),
        getLastAction(id)
    ])
    
    return <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        href={`/cases/${id}`} 
                        className="btn btn-sm btn-circle bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200"
                    >
                        <IoArrowBack className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Kelola Tindakan
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 mt-1">Catat dan pantau tindakan untuk kasus {caseData.caseNumber}</p>
                    </div>
                </div>
            </div>

            <Breadcrumbs items={[
                { text: 'Daftar Kasus', link: '/cases' },
                { text: `Detail Kasus`, link: `/cases/${id}` },
                { text: 'Tindakan Kasus' },
            ]} />

            {/* Case Info Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <IoShieldCheckmark className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2">{caseData.caseNumber}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div>
                                <p className="text-blue-100">Siswa</p>
                                <p className="font-semibold">{caseData.student.name}</p>
                                <p className="text-blue-100 text-xs">{caseData.student.nis}</p>
                            </div>
                            <div>
                                <p className="text-blue-100">Pelanggaran</p>
                                <p className="font-semibold">{caseData.violation.name}</p>
                            </div>
                            <div>
                                <p className="text-blue-100">Level</p>
                                <p className="font-semibold">{caseData.violation.category.level}</p>
                            </div>
                            <div>
                                <p className="text-blue-100">Status</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full font-semibold mt-1">
                                    <IoTimeOutline className="w-4 h-4" />
                                    {caseData.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Form & Timeline */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Form Section - Takes 2 columns */}
                <div className="xl:col-span-2 order-2 xl:order-1">
                    <Form caseData={caseData} lastAction={lastAction} />
                </div>
                
                {/* Timeline Section - Takes 3 columns */}
                <div className="xl:col-span-3 order-1 xl:order-2">
                    <Timeline caseId={id} actions={actions} violationId={caseData.violation.id} />
                </div>
            </div>
        </div>
    </main>
}

export default page