'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IoArrowBack, IoSave, IoPerson, IoMail, IoCall, IoLocation, IoEye, IoEyeOff } from "react-icons/io5"

interface Teacher {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    isActive: boolean
}

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    address: string
    isActive: boolean
}

interface EditTeacherFormProps {
    teacherId: string
}

const EditTeacherForm = ({ teacherId }: EditTeacherFormProps) => {
    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        isActive: true
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchTeacher()
    }, [teacherId])

    const fetchTeacher = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/users/teachers/${teacherId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch teacher details')
            }
            
            const result = await response.json()
            const teacherData = result.teacher
            setTeacher(teacherData)
            setFormData({
                name: teacherData.name,
                email: teacherData.email,
                password: "",
                confirmPassword: "",
                phone: teacherData.phone || "",
                address: teacherData.address || "",
                isActive: teacherData.isActive
            })
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred')
            router.push('/users/teachers')
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Nama lengkap wajib diisi"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email wajib diisi"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Format email tidak valid"
        }

        if (formData.password) {
            if (formData.password.length < 6) {
                newErrors.password = "Password minimal 6 karakter"
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Konfirmasi password tidak cocok"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setSaving(true)
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                address: formData.address || null,
                isActive: formData.isActive
            }

            if (formData.password) {
                updateData.password = formData.password
            }

            const response = await fetch(`/api/users/teachers/${teacherId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update teacher')
            }

            router.push('/users/teachers')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    if (loading) {
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
                            Edit Guru
                        </h1>
                        <p className="text-slate-600">Edit informasi guru {teacher.name}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Informasi Personal</h3>
                            </div>
                            
                            <div className="group">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg hover:bg-white/90 ${
                                            errors.name 
                                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300'
                                        }`}
                                        placeholder="Nama Lengkap"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.name 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        <IoPerson className="w-3 h-3 inline mr-1" />
                                        Nama Lengkap *
                                    </label>
                                </div>
                                {errors.name && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-pulse">
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg hover:bg-white/90 ${
                                            errors.email 
                                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300'
                                        }`}
                                        placeholder="Email"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.email 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        <IoMail className="w-3 h-3 inline mr-1" />
                                        Email Address *
                                    </label>
                                </div>
                                {errors.email && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-pulse">
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-lg hover:bg-white/90 hover:border-slate-300"
                                        placeholder="Nomor Telepon"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.phone 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        <IoCall className="w-3 h-3 inline mr-1" />
                                        Nomor Telepon
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={4}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-lg hover:bg-white/90 hover:border-slate-300 resize-none"
                                        placeholder="Alamat"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.address 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        <IoLocation className="w-3 h-3 inline mr-1" />
                                        Alamat Lengkap
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Keamanan Akun</h3>
                            </div>
                            
                            <div className="group">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`peer w-full px-4 py-4 pr-12 text-slate-900 bg-white/70 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg hover:bg-white/90 ${
                                            errors.password 
                                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300'
                                        }`}
                                        placeholder="Password"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.password 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        Password Baru
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100"
                                    >
                                        {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-pulse">
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        {errors.password}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 mt-2 ml-1">Kosongkan jika tidak ingin mengubah password</p>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`peer w-full px-4 py-4 pr-12 text-slate-900 bg-white/70 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg hover:bg-white/90 ${
                                            errors.confirmPassword 
                                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-300'
                                        }`}
                                        placeholder="Konfirmasi Password"
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        formData.confirmPassword 
                                            ? '-top-2 text-xs bg-white px-2 text-blue-600 font-medium' 
                                            : 'top-4 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-medium'
                                    }`}>
                                        Konfirmasi Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100"
                                    >
                                        {showConfirmPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-pulse">
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        {errors.confirmPassword}
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                formData.isActive 
                                                    ? 'bg-emerald-500 shadow-lg shadow-emerald-200' 
                                                    : 'bg-slate-300'
                                            }`}>
                                                {formData.isActive && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">Status Akun</p>
                                                <p className="text-sm text-slate-600">Aktifkan akun guru untuk sistem</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 shadow-inner"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200/50">
                        <Link
                            href="/users/teachers"
                            className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium"
                        >
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-200 disabled:shadow-none font-medium flex-1 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

export default EditTeacherForm
