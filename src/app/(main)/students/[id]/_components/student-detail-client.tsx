'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Student } from '@/types/student'
import Avatar from '@/components/avatar'
import { IoTrash, IoMale, IoFemale, IoCalendar, IoCall, IoLocation, IoSchool, IoPerson, IoCreate, IoInformationCircle, IoArrowBack } from 'react-icons/io5'
import Link from 'next/link'

interface StudentDetailClientProps {
    studentId: string
}

export default function StudentDetailClient({ studentId }: StudentDetailClientProps) {
    const [student, setStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await fetch(`/api/users/students/${studentId}`)
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Siswa tidak ditemukan')
                    }
                    if (response.status === 401) {
                        throw new Error('Tidak memiliki akses - silakan login ulang')
                    }
                    throw new Error('Gagal memuat data siswa')
                }

                const data = await response.json()
                setStudent(data.student)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
            } finally {
                setLoading(false)
            }
        }

        fetchStudent()
    }, [studentId])
    const handleDelete = async (forceDelete = false) => {
        if (!student) return
        
        const confirmMessage = forceDelete 
            ? `Apakah Anda yakin ingin MENGHAPUS PERMANEN siswa ${student.name}? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus siswa ${student.name}?`
            
        if (!confirm(confirmMessage)) {
            return
        }

        try {
            const url = forceDelete 
                ? `/api/users/students/${studentId}?force=true`
                : `/api/users/students/${studentId}`
                
            const response = await fetch(url, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Gagal menghapus siswa')
            }

            const result = await response.json()
            
            if (result.type === 'soft_delete' && result.violationCount > 0) {
                const forceConfirm = confirm(
                    `${result.message}\n\nApakah Anda ingin menghapus secara permanen? Klik OK untuk hapus permanen, atau Cancel untuk membiarkan siswa hanya dinonaktifkan.`
                )
                
                if (forceConfirm) {
                    await handleDelete(true)
                    return
                }
            }
            
            alert(result.message)
            router.push('/students')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus siswa')
        }
    }

    if (loading) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat detail siswa...</p>
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
                        <Link 
                            href="/students" 
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                            Kembali ke Daftar Siswa
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    if (!student) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
                    <p className="text-slate-600 mb-4">Siswa tidak ditemukan</p>
                    <Link 
                        href="/students" 
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                        Kembali ke Daftar Siswa
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <Avatar 
                                name={student?.name}
                                size="xl"
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{student.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-blue-100 mb-2">
                                    {student.gender === 'L' ? (
                                        <div className="flex items-center gap-1">
                                            <IoMale className="w-4 h-4" />
                                            <span>Laki-laki</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <IoFemale className="w-4 h-4" />
                                            <span>Perempuan</span>
                                        </div>
                                    )}
                                    <span>•</span>
                                    <span>NIS: {student.nis}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        student.isActive 
                                            ? 'bg-green-100/20 text-green-100 border border-green-200/30' 
                                            : 'bg-red-100/20 text-red-100 border border-red-200/30'
                                    }`}>
                                        {student.isActive ? 'Aktif' : 'Nonaktif'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link
                                href={`/students/${studentId}/edit`}
                                className="btn bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all duration-300 rounded-xl"
                            >
                                <IoCreate className="w-4 h-4" />
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete()}
                                className="btn bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-white backdrop-blur-sm transition-all duration-300 rounded-xl"
                            >
                                <IoTrash className="w-4 h-4" />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <IoSchool className="w-5 h-5 text-blue-500" />
                                Informasi Akademik
                            </h3>
                            <div className="space-y-4">
                                {student.major && (
                                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Jurusan</label>
                                        <p className="text-slate-800 font-medium">{student.major}</p>
                                    </div>
                                )}
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tahun Ajaran</label>
                                    <p className="text-slate-800 font-medium">{student.academicYear}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <IoPerson className="w-5 h-5 text-green-500" />
                                Informasi Personal
                            </h3>
                            <div className="space-y-4">
                                {(student.birthPlace || student.birthDate) && (
                                    <div className="bg-white rounded-lg p-4 border border-green-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Tempat, Tanggal Lahir</label>
                                        <p className="text-slate-800 font-medium flex items-center gap-2">
                                            <IoCalendar className="w-4 h-4 text-green-500" />
                                            {student.birthPlace}
                                            {student.birthPlace && student.birthDate && ', '}
                                            {student.birthDate && new Date(student.birthDate).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                )}
                                {student.phone && (
                                    <div className="bg-white rounded-lg p-4 border border-green-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Nomor Telepon</label>
                                        <p className="text-slate-800 font-medium flex items-center gap-2">
                                            <IoCall className="w-4 h-4 text-green-500" />
                                            {student.phone}
                                        </p>
                                    </div>
                                )}
                                {student.address && (
                                    <div className="bg-white rounded-lg p-4 border border-green-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Alamat</label>
                                        <p className="text-slate-800 font-medium flex items-start gap-2">
                                            <IoLocation className="w-4 h-4 text-green-500 mt-1" />
                                            {student.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(student.parentName || student.parentPhone) && (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <IoPerson className="w-5 h-5 text-purple-500" />
                                Informasi Wali/Orang Tua
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.parentName && (
                                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Nama Wali/Orang Tua</label>
                                        <p className="text-slate-800 font-medium">{student.parentName}</p>
                                    </div>
                                )}
                                {student.parentPhone && (
                                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Nomor Telepon</label>
                                        <p className="text-slate-800 font-medium flex items-center gap-2">
                                            <IoCall className="w-4 h-4 text-purple-500" />
                                            {student.parentPhone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <IoInformationCircle className="w-5 h-5 text-slate-500" />
                            Informasi Sistem
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-100">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Dibuat pada</label>
                                <p className="text-slate-800 font-medium">{new Date(student.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-100">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Terakhir diubah</label>
                                <p className="text-slate-800 font-medium">{new Date(student.updatedAt).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <Link
                            href="/students"
                            className="btn bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                            <IoArrowBack className="w-4 h-4" />
                            Kembali
                        </Link>
                        
                        <div className="text-sm text-slate-500">
                            ID Siswa: {student.id}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
