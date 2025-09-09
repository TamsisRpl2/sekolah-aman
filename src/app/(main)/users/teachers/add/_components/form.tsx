'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IoArrowBack, IoSave, IoPerson, IoMail, IoCall, IoLocation, IoEye, IoEyeOff } from "react-icons/io5"
import { createTeacherAndRedirect } from '../actions'

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    address: string
    isActive: boolean
}

const AddTeacherForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        isActive: true
    })
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

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

        if (!formData.password) {
            newErrors.password = "Password wajib diisi"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password wajib diisi"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password tidak cocok"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        const formDataObj = new FormData()
        formDataObj.append('name', formData.name)
        formDataObj.append('email', formData.email)
        formDataObj.append('password', formData.password)
        formDataObj.append('phone', formData.phone || '')
        formDataObj.append('address', formData.address || '')
        formDataObj.append('isActive', formData.isActive.toString())

        startTransition(async () => {
            try {
                await createTeacherAndRedirect(formDataObj)
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Gagal membuat guru')
            }
        })
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
                            Tambah Guru
                        </h1>
                        <p className="text-slate-600">Tambahkan guru baru ke sistem</p>
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
                                        Password *
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
                                        Konfirmasi Password *
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

                    <div className="flex gap-4 pt-6 border-t border-slate-200/50">
                        <Link
                            href="/users/teachers"
                            className="flex-1 px-6 py-3 text-slate-700 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all duration-300 text-center font-medium shadow-sm hover:shadow-md"
                        >
                            <IoArrowBack className="w-4 h-4 inline mr-2" />
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            {isPending ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Menyimpan...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <IoSave className="w-4 h-4 mr-2" />
                                    Simpan Guru
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default AddTeacherForm
