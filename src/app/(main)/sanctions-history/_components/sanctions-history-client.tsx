'use client'

import { useState } from 'react'
import { SanctionHistoryFilters } from '@/types/sanctions-history'
import { useSanctionsHistory } from '@/lib/hooks/useSanctionsHistory'
import { IoSearch, IoCalendar, IoDocument, IoEye, IoCheckmarkCircle, IoTime, IoFilter, IoDownload } from 'react-icons/io5'
import Pagination from '@/components/pagination'

interface SanctionsHistoryClientProps {
    initialFilters: SanctionHistoryFilters
}

export default function SanctionsHistoryClient({ initialFilters }: SanctionsHistoryClientProps) {
    const [filters, setFilters] = useState<SanctionHistoryFilters>(initialFilters)

    const { sanctionsHistory, loading, error, pagination, stats, refetch } = useSanctionsHistory(filters)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setFilters(prev => ({ ...prev, page: 1 }))
    }

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }))
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'RINGAN':
                return <span className="badge badge-warning badge-sm">Ringan</span>
            case 'SEDANG':
                return <span className="badge badge-info badge-sm">Sedang</span>
            case 'BERAT':
                return <span className="badge badge-error badge-sm">Berat</span>
            default:
                return <span className="badge badge-ghost badge-sm">{level}</span>
        }
    }

    const getStatusBadge = (isCompleted: boolean) => {
        return isCompleted ? (
            <span className="badge badge-success badge-sm text-white">
                <IoCheckmarkCircle className="w-3 h-3 mr-1" />
                Selesai
            </span>
        ) : (
            <span className="badge badge-warning badge-sm">
                <IoTime className="w-3 h-3 mr-1" />
                Proses
            </span>
        )
    }

    return (
        <>
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IoDocument className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Sanksi</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Selesai</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <IoTime className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Pencarian</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari nama siswa, NIS, atau deskripsi..."
                                    className="input input-bordered w-full pl-10"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                                <IoSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Status</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Dalam Proses</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tanggal Mulai</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tanggal Akhir</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => {
                                setFilters({
                                    page: 1,
                                    limit: 10,
                                    search: '',
                                    status: '',
                                    startDate: '',
                                    endDate: ''
                                })
                            }}
                        >
                            Reset Filter
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <IoFilter className="w-4 h-4" />
                            Terapkan Filter
                        </button>
                    </div>
                </form>
            </div>

            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Daftar Riwayat Sanksi</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <div className="alert alert-error">
                            <span>Error: {error}</span>
                        </div>
                    </div>
                ) : sanctionsHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <IoDocument className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Sanksi</h3>
                        <p className="text-gray-600">Riwayat sanksi akan muncul di sini setelah ada tindakan yang diberikan.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="border-gray-200">
                                        <th className="text-gray-600">Siswa</th>
                                        <th className="text-gray-600">Pelanggaran</th>
                                        <th className="text-gray-600">Sanksi/Tindakan</th>
                                        <th className="text-gray-600">Tanggal</th>
                                        <th className="text-gray-600">Status</th>
                                        <th className="text-gray-600">Dokumentasi</th>
                                        <th className="text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sanctionsHistory.map((item) => (
                                        <tr key={item.id} className="border-gray-200">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            {item.case.student.photo ? (
                                                                <img src={item.case.student.photo} alt={item.case.student.name} />
                                                            ) : (
                                                                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                                                                    <span className="text-gray-500 text-xs">
                                                                        {item.case.student.name.charAt(0)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.case.student.name}</div>
                                                        <div className="text-sm text-gray-500">NIS: {item.case.student.nis}</div>
                                                        <div className="text-sm text-gray-500">Kelas: {item.case.classLevel}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.case.violation.name}</div>
                                                    <div className="text-sm text-gray-500">{item.case.violation.code}</div>
                                                    {getLevelBadge(item.case.violation.category.level)}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.sanctionType?.name || item.actionType}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {item.description}
                                                    </div>
                                                    {item.sanctionType?.duration && (
                                                        <div className="text-sm text-orange-600">
                                                            Durasi: {item.sanctionType.duration} hari
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-sm">
                                                    <div className="text-gray-900">
                                                        {new Date(item.actionDate).toLocaleDateString('id-ID')}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {new Date(item.actionDate).toLocaleTimeString('id-ID', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(item.isCompleted)}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {item.evidenceUrls && item.evidenceUrls.length > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            <IoDocument className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-600">
                                                                {item.evidenceUrls.length} file
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Tidak ada</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => window.open(`/cases/${item.case.id}`, '_blank')}
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                        Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {}
                        {pagination.totalPages > 1 && (
                            <div className="p-6 border-t border-gray-200">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}
