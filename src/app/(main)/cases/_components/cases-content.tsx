'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import dynamic from 'next/dynamic'
import { IoSearch, IoEye, IoCreate, IoTrash, IoWarning, IoCheckmarkCircle, IoTime, IoCalendar, IoPerson, IoAlert, IoCloseCircle, IoFilter, IoChevronDown, IoPrint } from "react-icons/io5"
import { deleteCase, getCaseForPDF } from '../actions'
import { generateCasePDF } from '@/lib/pdf-generator'

const DynamicAvatar = dynamic(() => import('@/components/dynamic-avatar'))

interface Student {
    name: string
    nis: string
    major: string | null
    photo: string | null
}

interface Violation {
    name: string
    category: {
        level: string
        name: string
    }
}

interface InputBy {
    name: string
}

interface Case {
    id: string
    caseNumber: string
    student: Student
    violation: Violation
    description: string
    violationDate: Date
    status: string
    classLevel: string
    inputBy: InputBy
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface Stats {
    total: number
    pending: number
    proses: number
    selesai: number
    dibatalkan: number
}

interface Filters {
    search: string
    status: string
    level: string
    startDate: string
    endDate: string
    page: number
    limit: number
}

interface CasesContentProps {
    initialCases: Case[]
    initialPagination: Pagination
    stats: Stats
    filters: Filters
}

const CasesContent = ({ initialCases, initialPagination, stats, filters }: CasesContentProps) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [printingId, setPrintingId] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const [searchValue, setSearchValue] = useState(filters.search)
    const [statusValue, setStatusValue] = useState(filters.status)
    const [levelValue, setLevelValue] = useState(filters.level)
    const [startDateValue, setStartDateValue] = useState(filters.startDate)
    const [endDateValue, setEndDateValue] = useState(filters.endDate)

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (searchValue) params.set('search', searchValue)
        if (statusValue) params.set('status', statusValue)
        if (levelValue) params.set('level', levelValue)
        if (startDateValue) params.set('startDate', startDateValue)
        if (endDateValue) params.set('endDate', endDateValue)
        params.set('page', '1')
        
        router.push(`/cases?${params.toString()}`)
    }

    const handleClearFilters = () => {
        setSearchValue('')
        setStatusValue('')
        setLevelValue('')
        setStartDateValue('')
        setEndDateValue('')
        router.push('/cases')
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()
        if (searchValue) params.set('search', searchValue)
        if (statusValue) params.set('status', statusValue)
        if (levelValue) params.set('level', levelValue)
        if (startDateValue) params.set('startDate', startDateValue)
        if (endDateValue) params.set('endDate', endDateValue)
        params.set('page', page.toString())
        
        router.push(`/cases?${params.toString()}`)
    }

    const handleDeleteCase = async (id: string, caseNumber: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus kasus ${caseNumber}?`)) {
            return
        }

        setDeletingId(id)
        startTransition(async () => {
            try {
                await deleteCase(id)
                router.refresh()
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Gagal menghapus kasus')
            } finally {
                setDeletingId(null)
            }
        })
    }

    const handlePrintPDF = async (id: string) => {
        setPrintingId(id)
        try {
            const caseData = await getCaseForPDF(id)
            await generateCasePDF(caseData)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Gagal membuat PDF')
        } finally {
            setPrintingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-xs font-medium">
                    <IoTime className="w-3 h-3" />
                    Menunggu
                </span>
            case 'PROSES':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-medium">
                    <IoWarning className="w-3 h-3" />
                    Proses
                </span>
            case 'SELESAI':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                    <IoCheckmarkCircle className="w-3 h-3" />
                    Selesai
                </span>
            case 'DIBATALKAN':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                    <IoCloseCircle className="w-3 h-3" />
                    Dibatalkan
                </span>
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-medium">
                    {status}
                </span>
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'RINGAN':
                return <span className="px-2.5 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                    Ringan
                </span>
            case 'SEDANG':
                return <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium">
                    Sedang
                </span>
            case 'BERAT':
                return <span className="px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                    Berat
                </span>
            default:
                return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-medium">
                    {level}
                </span>
        }
    }

    const hasActiveFilters = searchValue || statusValue || levelValue || startDateValue || endDateValue

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Total Kasus</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <IoAlert className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-yellow-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 mb-1">Menunggu</p>
                            <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <IoTime className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 mb-1">Dalam Proses</p>
                            <p className="text-3xl font-bold text-blue-800">{stats.proses}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <IoWarning className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-green-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 mb-1">Selesai</p>
                            <p className="text-3xl font-bold text-green-800">{stats.selesai}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <IoCheckmarkCircle className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Cari berdasarkan nama siswa, NIS, nomor kasus..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                showFilters || hasActiveFilters
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <IoFilter className="w-5 h-5" />
                            Filter
                            <IoChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={isPending}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IoSearch className="w-5 h-5" />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                            <select 
                                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all"
                                value={statusValue}
                                onChange={(e) => setStatusValue(e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="PROSES">Proses</option>
                                <option value="SELESAI">Selesai</option>
                                <option value="DIBATALKAN">Dibatalkan</option>
                            </select>
                            
                            <select 
                                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all"
                                value={levelValue}
                                onChange={(e) => setLevelValue(e.target.value)}
                            >
                                <option value="">Semua Tingkat</option>
                                <option value="RINGAN">Ringan</option>
                                <option value="SEDANG">Sedang</option>
                                <option value="BERAT">Berat</option>
                            </select>
                            
                            <input 
                                type="date" 
                                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all"
                                value={startDateValue}
                                onChange={(e) => setStartDateValue(e.target.value)}
                                placeholder="Dari Tanggal"
                            />
                            
                            <input 
                                type="date" 
                                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all"
                                value={endDateValue}
                                onChange={(e) => setEndDateValue(e.target.value)}
                                placeholder="Sampai Tanggal"
                            />

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="sm:col-span-2 lg:col-span-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <IoCloseCircle className="w-5 h-5" />
                                    Hapus Semua Filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {initialCases.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
                        <IoAlert className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Tidak Ada Kasus</h3>
                    <p className="text-slate-600">
                        {hasActiveFilters 
                            ? 'Tidak ada kasus yang sesuai dengan filter Anda. Coba ubah filter atau hapus filter untuk melihat semua kasus.'
                            : 'Belum ada kasus pelanggaran yang tercatat. Klik tombol "Tambah Kasus" untuk mulai mencatat kasus baru.'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {initialCases.map((caseItem) => (
                            <div key={caseItem.id} className="group bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <DynamicAvatar
                                                name={caseItem.student.name}
                                                image={caseItem.student.photo}
                                                size="lg"
                                                className="border-3 border-slate-200 group-hover:border-red-300 transition-colors"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <IoAlert className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-red-600 transition-colors truncate">
                                                {caseItem.student.name}
                                            </h3>
                                            <p className="text-sm text-slate-600">Kelas {caseItem.classLevel}{caseItem.student.major ? ` - ${caseItem.student.major}` : ''}</p>
                                            <p className="text-xs text-slate-500">NIS: {caseItem.student.nis}</p>
                                        </div>
                                        <div>
                                            {getStatusBadge(caseItem.status)}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                                                {caseItem.caseNumber}
                                            </span>
                                            <span>•</span>
                                            <IoCalendar className="w-3 h-3" />
                                            <span>{new Date(caseItem.violationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <IoAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-semibold text-red-800 text-sm">
                                                        {caseItem.violation.name}
                                                    </h4>
                                                    {getLevelBadge(caseItem.violation.category.level)}
                                                </div>
                                                <p className="text-sm text-red-700 line-clamp-2">{caseItem.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-slate-200">
                                        <IoPerson className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs">Pelapor:</span>
                                        <span className="font-medium truncate">{caseItem.inputBy.name}</span>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex gap-2">
                                            <Link 
                                                href={`/cases/${caseItem.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
                                            >
                                                <IoEye className="w-4 h-4" />
                                                <span>Detail</span>
                                            </Link>
                                            <Link 
                                                href={`/cases/${caseItem.id}/action`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                                            >
                                                <IoCreate className="w-4 h-4" />
                                                <span>Tindakan</span>
                                            </Link>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handlePrintPDF(caseItem.id)}
                                                disabled={printingId === caseItem.id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {printingId === caseItem.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Membuat PDF...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoPrint className="w-4 h-4" />
                                                        <span>Print PDF</span>
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCase(caseItem.id, caseItem.caseNumber)}
                                                disabled={deletingId === caseItem.id || isPending}
                                                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === caseItem.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                                ) : (
                                                    <IoTrash className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-slate-600">
                                Menampilkan <span className="font-semibold text-slate-800">{((initialPagination.page - 1) * initialPagination.limit) + 1}-{Math.min(initialPagination.page * initialPagination.limit, initialPagination.total)}</span> dari <span className="font-semibold text-slate-800">{initialPagination.total}</span> kasus
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    className="px-4 py-2 border-2 border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 transition-all"
                                    disabled={initialPagination.page <= 1 || isPending}
                                    onClick={() => handlePageChange(initialPagination.page - 1)}
                                >
                                    ← Sebelumnya
                                </button>
                                
                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, initialPagination.totalPages) }, (_, i) => {
                                        let pageNum
                                        if (initialPagination.totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (initialPagination.page <= 3) {
                                            pageNum = i + 1
                                        } else if (initialPagination.page >= initialPagination.totalPages - 2) {
                                            pageNum = initialPagination.totalPages - 4 + i
                                        } else {
                                            pageNum = initialPagination.page - 2 + i
                                        }
                                        
                                        return (
                                            <button 
                                                key={pageNum}
                                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                                                    initialPagination.page === pageNum
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                                                        : 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={isPending}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>

                                <button 
                                    className="px-4 py-2 border-2 border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 transition-all"
                                    disabled={initialPagination.page >= initialPagination.totalPages || isPending}
                                    onClick={() => handlePageChange(initialPagination.page + 1)}
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default CasesContent
