'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Student } from '@/types/student'
import Avatar from '@/components/avatar'
import { IoCreate, IoTrash, IoMale, IoFemale, IoCalendar, IoCall, IoLocation, IoSchool, IoPerson } from 'react-icons/io5'
import { getStudent, deleteStudentById } from '../actions'

interface StudentDetailProps {
    studentId: string
}

export default function StudentDetail({ studentId }: StudentDetailProps) {
    const [student, setStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const { student } = await getStudent(studentId)
                setStudent(student)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
            } finally {
                setLoading(false)
            }
        }

        fetchStudent()
    }, [studentId])

    const handleDelete = async () => {
        if (!student) return
        
        if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${student.name}?`)) {
            return
        }

        startTransition(async () => {
            try {
                await deleteStudentById(studentId)
                alert('Siswa berhasil dihapus')
                router.push('/students')
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Gagal menghapus siswa')
            }
        })
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
                <div className="mt-4">
                    <Link href="/students" className="btn btn-primary">
                        Kembali ke Daftar Siswa
                    </Link>
                </div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500">Siswa tidak ditemukan</p>
                <div className="mt-4">
                    <Link href="/students" className="btn btn-primary">
                        Kembali ke Daftar Siswa
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Avatar 
                            name={student?.name}
                            size="xl"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                {student.gender === 'L' ? (
                                    <div className="flex items-center gap-1">
                                        <IoMale className="w-4 h-4 text-blue-500" />
                                        <span>Laki-laki</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <IoFemale className="w-4 h-4 text-pink-500" />
                                        <span>Perempuan</span>
                                    </div>
                                )}
                                <span>•</span>
                                <span>NIS: {student.nis}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`badge ${student.isActive ? 'badge-success' : 'badge-error'}`}>
                                    {student.isActive ? 'Aktif' : 'Nonaktif'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            className="btn btn-error text-white"
                        >
                            <IoTrash className="w-4 h-4" />
                            Hapus
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IoSchool className="w-5 h-5 text-blue-500" />
                        Informasi Akademik
                    </h3>
                    <div className="space-y-4">
                        {student.major && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                                <p className="text-gray-900">{student.major}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                            <p className="text-gray-900">{student.academicYear}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IoPerson className="w-5 h-5 text-green-500" />
                        Informasi Personal
                    </h3>
                    <div className="space-y-4">
                        {(student.birthPlace || student.birthDate) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat, Tanggal Lahir</label>
                                <p className="text-gray-900 flex items-center gap-2">
                                    <IoCalendar className="w-4 h-4 text-gray-400" />
                                    {student.birthPlace}
                                    {student.birthPlace && student.birthDate && ', '}
                                    {student.birthDate && new Date(student.birthDate).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        )}
                        {student.phone && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                <p className="text-gray-900 flex items-center gap-2">
                                    <IoCall className="w-4 h-4 text-gray-400" />
                                    {student.phone}
                                </p>
                            </div>
                        )}
                        {student.address && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                <p className="text-gray-900 flex items-start gap-2">
                                    <IoLocation className="w-4 h-4 text-gray-400 mt-1" />
                                    {student.address}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {(student.parentName || student.parentPhone) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <IoPerson className="w-5 h-5 text-purple-500" />
                            Informasi Wali
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.parentName && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wali</label>
                                    <p className="text-gray-900">{student.parentName}</p>
                                </div>
                            )}
                            {student.parentPhone && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon Wali</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <IoCall className="w-4 h-4 text-gray-400" />
                                        {student.parentPhone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sistem</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat pada</label>
                            <p className="text-gray-600">{new Date(student.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir diubah</label>
                            <p className="text-gray-600">{new Date(student.updatedAt).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
