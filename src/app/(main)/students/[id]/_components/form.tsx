'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IoArrowBack, IoSave, IoPerson, IoCall, IoLocation, IoCalendar, IoSchool } from 'react-icons/io5'
import { Student, StudentFormData } from '@/types/student'

interface Props {
    studentId: string
}

const Form = ({ studentId }: Props) => {
    const [student, setStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await fetch(`/api/users/students/${studentId}`)
                if (!response.ok) {
                    throw new Error('Gagal memuat data siswa')
                }
                const data = await response.json()
                setStudent(data.student)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
            } finally {
                setLoadingData(false)
            }
        }

        fetchStudent()
    }, [studentId])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        
        const studentData: Partial<StudentFormData> = {
            nis: formData.get('nis') as string,
            name: formData.get('name') as string,
            gender: formData.get('gender') as 'L' | 'P',
            birthPlace: formData.get('birthPlace') as string || undefined,
            birthDate: formData.get('birthDate') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            parentPhone: formData.get('parentPhone') as string || undefined,
            major: formData.get('major') as string || undefined,
            academicYear: formData.get('academicYear') as string,
            parentName: formData.get('parentName') as string || undefined,
            address: formData.get('address') as string || undefined,
        }

        try {
            const response = await fetch(`/api/users/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Gagal mengupdate siswa')
            }

            router.push(`/students/${studentId}`)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-32">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="alert alert-error">
                <span>Data siswa tidak ditemukan</span>
            </div>
        )
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href={`/students`} 
                        className="btn btn-sm btn-circle bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 transition-all duration-200"
                    >
                        <IoArrowBack className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Edit Siswa</h1>
                        <p className="text-slate-600">Perbarui data siswa {student.name}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Informasi Siswa</h3>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input
                                        name="name"
                                        defaultValue={student.name}
                                        required
                                        placeholder=" "
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.name ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Nama Lengkap *
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input
                                        name="nis"
                                        defaultValue={student.nis}
                                        required
                                        placeholder=" "
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.nis ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        NIS *
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <div className="relative">
                                        <select name="gender" defaultValue={student.gender} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500">
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                        <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${student.gender ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Jenis Kelamin *
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="relative">
                                        <input name="birthPlace" defaultValue={student.birthPlace || ''} placeholder=" " className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${student.birthPlace ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Tempat Lahir
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <div className="relative">
                                        <input type="date" name="birthDate" defaultValue={student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : ''} className="peer w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${student.birthDate ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-1 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Tanggal Lahir
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="relative">
                                        <input name="phone" defaultValue={student.phone || ''} placeholder=" " className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${student.phone ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            No. Telepon
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <IoSchool className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Akademik & Kontak</h3>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <select name="major" defaultValue={student.major || ''} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500">
                                        <option value="">Pilih Jurusan</option>
                                        <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                                        <option value="Teknik Pemesinan">Teknik Pemesinan</option>
                                        <option value="Teknik Bisnis Sepeda Motor">Teknik Bisnis Sepeda Motor</option>
                                        <option value="Teknik Instalasi Tenaga Listrik">Teknik Instalasi Tenaga Listrik</option>
                                        <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                                    </select>
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${student.major ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Jurusan
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="academicYear" defaultValue={student.academicYear} required placeholder=" " className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.academicYear ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Tahun Ajaran *
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="parentName" defaultValue={student.parentName || ''} placeholder=" " className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.parentName ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Nama Wali
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="parentPhone" defaultValue={student.parentPhone || ''} placeholder=" " className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.parentPhone ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        No. Telepon Wali
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea name="address" defaultValue={student.address || ''} placeholder=" " rows={4} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none" />
                                    <label className={`absolute left-4 transition-all duration-300 ${student.address ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Alamat Lengkap
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200/50">
                        <Link href={`/students`} className="group flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium">
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Batal
                        </Link>

                        <button type="submit" disabled={loading} className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex-1">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IoSave className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default Form