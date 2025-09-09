'use client'

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import DynamicAvatar from "@/components/dynamic-avatar"
import { useRouter } from "next/navigation"
import { IoArrowBack, IoCreate, IoTrash, IoPerson, IoMail, IoCall, IoLocation, IoCalendar, IoTime, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5"
import { getTeacher, getTeacherStats, getTeacherActivities } from '../actions'
import { deleteTeacher } from '../../actions'

interface Teacher {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    isActive: boolean
    role: string
    createdAt: string | Date
    updatedAt: string | Date
    stats?: any
    activities?: any
}

interface TeacherDetailProps {
    teacherId: string
}

const TeacherDetail = ({ teacherId }: TeacherDetailProps) => {
    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        fetchTeacher()
    }, [teacherId])

    const fetchTeacher = async () => {
        try {
            setLoading(true)
            const [teacherData, statsData, activitiesData] = await Promise.all([
                getTeacher(teacherId),
                getTeacherStats(teacherId),
                getTeacherActivities(teacherId)
            ])
            setTeacher({
                ...teacherData,
                stats: statsData,
                activities: activitiesData
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!teacher) return

        if (!confirm(`Apakah Anda yakin ingin menghapus guru ${teacher.name}?`)) {
            return
        }

        startTransition(async () => {
            try {
                await deleteTeacher(teacherId)
                alert('Guru berhasil dihapus')
                router.push('/users/teachers')
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Gagal menghapus guru')
            }
        })
    }

    if (loading) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat detail guru...</p>
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
                            onClick={fetchTeacher}
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    if (!teacher) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
                    <p className="text-slate-600 mb-4">Guru tidak ditemukan</p>
                    <Link 
                        href="/users/teachers" 
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        Kembali ke Daftar Guru
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/users/teachers"
                        className="btn btn-sm btn-circle bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 transition-all duration-200"
                    >
                        <IoArrowBack className="w-4 h-4" />
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Detail Guru
                        </h1>
                        <p className="text-slate-600">Informasi lengkap guru</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link 
                        href={`/users/teachers/${teacherId}/edit`}
                        className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        <IoCreate className="w-4 h-4" />
                        Edit
                    </Link>
                    <button 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:loading"
                    >
                        {isPending ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <IoTrash className="w-4 h-4" />
                        )}
                        Hapus
                    </button>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <DynamicAvatar
                                name={teacher?.name}
                                image={null}
                                size="xl"
                                className="border-4 border-white"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${teacher.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{teacher.name}</h2>
                            <div className="flex items-center gap-2">
                                {teacher.isActive ? (
                                    <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                                        <IoCheckmarkCircle className="w-4 h-4" />
                                        Aktif
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                                        <IoCloseCircle className="w-4 h-4" />
                                        Non-Aktif
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Personal</h3>
                            
                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Nama Lengkap</p>
                                    <p className="font-medium text-slate-800">{teacher.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <IoMail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Email</p>
                                    <p className="font-medium text-slate-800">{teacher.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                    <IoCall className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Nomor Telepon</p>
                                    <p className="font-medium text-slate-800">{teacher.phone || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <IoLocation className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Alamat</p>
                                    <p className="font-medium text-slate-800">{teacher.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Akun</h3>
                            
                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Role</p>
                                    <p className="font-medium text-slate-800">{teacher.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <IoCalendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Terdaftar Sejak</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(teacher.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <IoTime className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Terakhir Diperbarui</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(teacher.updatedAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default TeacherDetail
