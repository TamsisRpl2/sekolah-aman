'use client'

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from 'next/navigation'
import DynamicAvatar from "@/components/dynamic-avatar"
import { IoAdd, IoSearch, IoEye, IoCreate, IoTrash, IoPeople, IoCheckmarkCircle, IoSchool } from "react-icons/io5"
import { getTeachers, deleteTeacher, getTeacherStats } from '../actions'

interface Teacher {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    isActive: boolean
    createdAt: Date | string
    updatedAt: Date | string
}

interface TeachersResponse {
    teachers: Teacher[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    stats: {
        totalTeachers: number
        activeTeachers: number
    }
}

const TeachersContent = () => {
    const [data, setData] = useState<TeachersResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isPending, startTransition] = useTransition()

    const fetchTeachers = async (search: string = "", page: number = 1) => {
        try {
            setLoading(true)
            const [teachersData, statsData] = await Promise.all([
                getTeachers({ search, page, limit: 12 }),
                getTeacherStats()
            ])
            
            setData({
                teachers: teachersData.teachers,
                pagination: teachersData.pagination,
                stats: statsData
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers(searchTerm, currentPage)
    }, [searchTerm, currentPage])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const handleDelete = async (teacherId: string, teacherName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus guru ${teacherName}?`)) {
            return
        }

        startTransition(async () => {
            try {
                await deleteTeacher(teacherId)
                alert('Guru berhasil dihapus')
                fetchTeachers(searchTerm, currentPage) 
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Gagal menghapus guru')
            }
        })
    }

    if (loading && !data) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat data guru...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => fetchTeachers(searchTerm, currentPage)}
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Daftar Guru
                    </h1>
                    <p className="text-slate-600">Kelola data guru dan tenaga pendidik</p>
                </div>
                <div className="flex gap-3">
                    <Link 
                        href="/users/teachers/add" 
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        <IoAdd className="w-5 h-5" />
                        Tambah Guru
                    </Link>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Cari guru berdasarkan nama, email, atau nomor telepon..."
                                className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{data?.stats.totalTeachers || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Guru</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoPeople className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{data?.stats.activeTeachers || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Guru Aktif</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoCheckmarkCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{(data?.stats.totalTeachers || 0) - (data?.stats.activeTeachers || 0)}</p>
                            <p className="text-sm text-slate-600 mt-1">Guru Non-Aktif</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoSchool className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {data?.teachers.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-white/20 text-center">
                    <IoPeople className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Tidak ada data guru</h3>
                    <p className="text-slate-600 mb-6">
                        {searchTerm ? 'Tidak ditemukan guru yang sesuai dengan pencarian.' : 'Belum ada guru yang terdaftar.'}
                    </p>
                    <Link 
                        href="/users/teachers/add" 
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        <IoAdd className="w-5 h-5" />
                        Tambah Guru Pertama
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.teachers.map((teacher) => (
                        <div key={teacher.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <DynamicAvatar
                                            name={teacher?.name}
                                            image={null}
                                            size="lg"
                                            className="border-2 border-slate-200 group-hover:border-blue-300 transition-colors"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${teacher.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {teacher.name}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {teacher.isActive ? 'Aktif' : 'Non-Aktif'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <span className="font-medium text-slate-700 w-16">Email:</span>
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <span className="font-medium text-slate-700 w-16">Telp:</span>
                                        <span>{teacher.phone || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <span className="font-medium text-slate-700 w-16">Alamat:</span>
                                        <span className="truncate">{teacher.address || '-'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link 
                                        href={`/users/teachers/${teacher.id}`}
                                        className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 rounded-lg flex-1 transition-all duration-200"
                                    >
                                        <IoEye className="w-4 h-4" />
                                        Detail
                                    </Link>
                                    <Link 
                                        href={`/users/teachers/${teacher.id}/edit`}
                                        className="btn btn-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-200"
                                    >
                                        <IoCreate className="w-4 h-4" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(teacher.id, teacher.name)}
                                        disabled={isPending}
                                        className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 rounded-lg disabled:loading transition-all duration-200"
                                    >
                                        {isPending ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <IoTrash className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data && data.pagination.totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <p className="text-sm text-slate-600">
                            Menampilkan <span className="font-medium text-slate-800">{((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, data.pagination.total)}</span> dari <span className="font-medium text-slate-800">{data.pagination.total}</span> guru
                        </p>
                        <div className="join">
                            <button 
                                className="join-item btn btn-sm bg-white border-slate-200 hover:bg-slate-50 transition-all duration-200"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                «
                            </button>
                            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                                const page = i + 1
                                return (
                                    <button
                                        key={page}
                                        className={`join-item btn btn-sm transition-all duration-200 ${
                                            currentPage === page 
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            })}
                            <button 
                                className="join-item btn btn-sm bg-white border-slate-200 hover:bg-slate-50 transition-all duration-200"
                                disabled={currentPage === data.pagination.totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                »
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default TeachersContent
