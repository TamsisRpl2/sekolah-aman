'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IoArrowBack, IoSave, IoPerson, IoSchool } from 'react-icons/io5'
import { createStudentAndRedirect } from '../actions'

export default function Form() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const [hasValue, setHasValue] = useState<Record<string, boolean>>({
        name: false,
        nis: false,
        gender: false,
        birthPlace: false,
        birthDate: false,
        phone: false,
        major: false,
        academicYear: false,
        parentName: false,
        parentPhone: false,
        address: false,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setHasValue(prev => ({ ...prev, [name]: !!value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            try {
                await createStudentAndRedirect(formData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal membuat siswa')
            }
        })
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/students" className="btn btn-sm btn-circle bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 transition-all duration-200">
                        <IoArrowBack className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Tambah Siswa</h1>
                        <p className="text-slate-600">Buat data siswa baru</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Informasi Siswa</h3>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="name" required placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.name ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Nama Lengkap *
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="nis" required placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.nis ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        NIS *
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <div className="relative">
                                        <select name="gender" onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500" required>
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                        <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${hasValue.gender ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Jenis Kelamin *
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="relative">
                                        <input name="birthPlace" placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${hasValue.birthPlace ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Tempat Lahir
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <div className="relative">
                                        <input type="date" name="birthDate" onChange={handleInputChange} className="peer w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${hasValue.birthDate ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-1 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            Tanggal Lahir
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="relative">
                                        <input name="phone" placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                        <label className={`absolute left-4 transition-all duration-300 ${hasValue.phone ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                            No. Telepon
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <IoSchool className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Akademik & Kontak</h3>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <select name="major" onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500">
                                        <option value="">Pilih Jurusan</option>
                                        <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                                        <option value="Teknik Pemesinan">Teknik Pemesinan</option>
                                        <option value="Teknik Bisnis Sepeda Motor">Teknik Bisnis Sepeda Motor</option>
                                        <option value="Teknik Instalasi Tenaga Listrik">Teknik Instalasi Tenaga Listrik</option>
                                        <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                                    </select>
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${hasValue.major ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Jurusan
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="academicYear" defaultValue="2024/2025" required placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.academicYear ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Tahun Ajaran *
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="parentName" placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.parentName ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Nama Wali
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input name="parentPhone" placeholder=" " onChange={handleInputChange} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.parentPhone ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        No. Telepon Wali
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea name="address" placeholder=" " onChange={handleInputChange} rows={4} className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none" />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.address ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                        Alamat Lengkap
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200/50">
                        <Link href="/students" className="group flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium">
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Batal
                        </Link>

                        <button type="submit" disabled={isPending} className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex-1">
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IoSave className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
