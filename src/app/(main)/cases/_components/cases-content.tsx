'use client'

import { useState } from 'react'
import Link from "next/link"
import DynamicAvatar from "@/components/dynamic-avatar"
import { IoAdd, IoSearch, IoEye, IoCreate, IoTrash, IoWarning, IoCheckmarkCircle, IoTime, IoCalendar, IoSchool, IoPerson, IoAlert } from "react-icons/io5"
import { useCases, caseAPI } from '@/lib/hooks/useCases'
import { CaseFilters, CaseStatus, ViolationLevel } from '@/types/cases'

const CasesContent = () => {
    const [filters, setFilters] = useState<CaseFilters>({
        search: '',
        status: '',
        level: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 12
    })

    const { cases, loading, error, pagination, stats, refetch } = useCases(filters)

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }))
    }

    const handleFilterChange = (key: keyof CaseFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }))
    }

    const handleDeleteCase = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus kasus ini?')) {
            try {
                await caseAPI.deleteCase(id)
                refetch()
            } catch (error) {
                alert('Gagal menghapus kasus: ' + (error instanceof Error ? error.message : 'Unknown error'))
            }
        }
    }

    const getStatusBadge = (status: CaseStatus) => {
        switch (status) {
            case 'PENDING':
                return <div className="badge badge-warning gap-1"><IoTime className="w-3 h-3" />Menunggu</div>
            case 'PROSES':
                return <div className="badge badge-info gap-1"><IoWarning className="w-3 h-3" />Proses</div>
            case 'SELESAI':
                return <div className="badge badge-success gap-1"><IoCheckmarkCircle className="w-3 h-3" />Selesai</div>
            case 'DIBATALKAN':
                return <div className="badge badge-error gap-1">Dibatalkan</div>
            default:
                return <div className="badge badge-ghost">{status}</div>
        }
    }

    const getTingkatBadge = (level: ViolationLevel) => {
        switch (level) {
            case 'RINGAN':
                return <div className="badge badge-success">Ringan</div>
            case 'SEDANG':
                return <div className="badge badge-warning">Sedang</div>
            case 'BERAT':
                return <div className="badge badge-error">Berat</div>
            default:
                return <div className="badge badge-ghost">{level}</div>
        }
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error: {error}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Kasus Pelanggaran</h1>
                        <p className="text-gray-600">Kelola dan pantau semua kasus pelanggaran siswa</p>
                    </div>
                    <Link 
                        href="/cases/add" 
                        className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        <IoAdd className="w-5 h-5" />
                        Tambah Kasus
                    </Link>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Cari berdasarkan nama siswa, NIS, atau deskripsi..."
                                className="input input-bordered w-full pl-10 rounded-xl"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <select 
                        className="select select-bordered rounded-xl"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="PROSES">Proses</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="DIBATALKAN">Dibatalkan</option>
                    </select>
                    <select 
                        className="select select-bordered rounded-xl"
                        value={filters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                    >
                        <option value="">Semua Tingkat</option>
                        <option value="RINGAN">Ringan</option>
                        <option value="SEDANG">Sedang</option>
                        <option value="BERAT">Berat</option>
                    </select>
                    <input 
                        type="date" 
                        className="input input-bordered rounded-xl"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Total Kasus</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <IoAlert className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100">Menunggu</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <IoTime className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100">Dalam Proses</p>
                            <p className="text-3xl font-bold">{stats.proses}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <IoWarning className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">Selesai</p>
                            <p className="text-3xl font-bold">{stats.selesai}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <IoCheckmarkCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cases.map((caseItem) => (
                        <div key={caseItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <DynamicAvatar
                                            name={caseItem.student.name}
                                            image={caseItem.student.photo}
                                            size="md"
                                            className="border-2 border-gray-200 group-hover:border-red-300 transition-colors"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                            {caseItem.student.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">Kelas {caseItem.classLevel}</p>
                                        <p className="text-xs text-gray-400">NIS: {caseItem.student.nis}</p>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(caseItem.status)}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IoAlert className="w-4 h-4 text-red-500" />
                                            <span className="font-medium text-red-700">{caseItem.violation.name}</span>
                                            {getTingkatBadge(caseItem.violation.category.level)}
                                        </div>
                                        <p className="text-sm text-red-600">{caseItem.description}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <IoCalendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="font-medium">Tanggal:</span>
                                            <span className="ml-2">{new Date(caseItem.violationDate).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <IoPerson className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="font-medium">Pelapor:</span>
                                            <span className="ml-2">{caseItem.inputBy.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link 
                                        href={`/cases/${caseItem.id}`}
                                        className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 rounded-lg flex-1"
                                    >
                                        <IoEye className="w-4 h-4" />
                                        Detail
                                    </Link>
                                    <Link 
                                        href={`/cases/${caseItem.id}/action`}
                                        className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 rounded-lg"
                                        title="Kelola Tindakan"
                                    >
                                        <IoCreate className="w-4 h-4" />
                                    </Link>
                                    <button 
                                        className="btn btn-sm bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 rounded-lg"
                                        onClick={() => handleDeleteCase(caseItem.id)}
                                    >
                                        <IoTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        Menampilkan <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> kasus
                    </p>
                    <div className="join">
                        <button 
                            className="join-item btn btn-sm"
                            disabled={pagination.page <= 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            «
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                                <button 
                                    key={page}
                                    className={`join-item btn btn-sm ${pagination.page === page ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            )
                        })}
                        <button 
                            className="join-item btn btn-sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CasesContent
