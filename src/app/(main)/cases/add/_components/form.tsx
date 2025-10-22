'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IoSave, IoArrowBack, IoWarning, IoCalendar, IoPerson, IoSchool, IoDocument, IoAdd, IoRefresh, IoLocationSharp, IoEyeSharp } from 'react-icons/io5'
import { CaseFormData } from '@/types/cases'
import MultiFileUpload from '@/components/multi-file-upload'
import { getStudentsForCase, getViolationsForCase, createCase } from '../actions'

interface FormStudent {
    id: string
    nis: string
    name: string
}

interface FormViolation {
    id: string
    code: string
    name: string
    category: {
        id: string
        name: string
        level: string
        code: string
    }
    violationTypes: {
        id: string
        description: string
    }[]
}

const Form = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<FormStudent[]>([])
    const [violations, setViolations] = useState<FormViolation[]>([])
    const [selectedStudent, setSelectedStudent] = useState<FormStudent | null>(null)
    const [selectedViolation, setSelectedViolation] = useState<FormViolation | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    const [formData, setFormData] = useState<CaseFormData>({
        studentId: '',
        violationId: '',
        violationTypeId: '',
        violationDate: new Date().toISOString().split('T')[0],
        classLevel: '',
        description: '',
        location: '',
        witnesses: '',
        evidenceUrls: [],
        notes: ''
    })

    const [hasValue, setHasValue] = useState<Record<string, boolean>>({
        studentId: false,
        violationId: false,
        violationDate: true,
        classLevel: false,
        description: false,
        location: false,
        witnesses: false,
        notes: false
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setHasValue(prev => ({ ...prev, [name]: !!value }))
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleViolationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value) {
            const [violationId, violationTypeId] = value.split('|')
            setHasValue(prev => ({ ...prev, violationId: !!violationId }))
            setFormData(prev => ({ 
                ...prev, 
                violationId: violationId,
                violationTypeId: violationTypeId && violationTypeId.trim() !== '' ? violationTypeId : undefined
            }))
        } else {
            setHasValue(prev => ({ ...prev, violationId: false }))
            setFormData(prev => ({ ...prev, violationId: '', violationTypeId: undefined }))
        }
    }

    const refreshStudents = async () => {
        try {
            const studentsData = await getStudentsForCase()
            setStudents(studentsData)
        } catch (error) {
            console.error('Error fetching students:', error)
        }
    }

    const refreshViolations = async () => {
        try {
            const violationsData = await getViolationsForCase()
            setViolations(violationsData)
        } catch (error) {
            console.error('Error fetching violations:', error)
        }
    }

    useEffect(() => {
        refreshStudents()
        refreshViolations()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const dataToSend = {
                ...formData,
                violationTypeId: formData.violationTypeId || undefined
            }
            await createCase(dataToSend)
            router.push('/cases')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Gagal membuat kasus')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-red-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/cases" className="btn btn-sm btn-circle bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 transition-all duration-200">
                        <IoArrowBack className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Tambah Kasus</h1>
                        <p className="text-slate-600">Buat kasus pelanggaran baru</p>
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
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                    <IoWarning className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Informasi Kasus</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Siswa <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="studentId" 
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-red-500" 
                                    required
                                >
                                    <option value="">Pilih Siswa</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.nis} - {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Pelanggaran <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="violationId" 
                                    value={formData.violationId ? (formData.violationTypeId ? `${formData.violationId}|${formData.violationTypeId}` : `${formData.violationId}|`) : ''}
                                    onChange={handleViolationChange}
                                    className="w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-red-500" 
                                    required
                                >
                                    <option value="">Pilih Pelanggaran</option>
                                    {/* Group by Category */}
                                    {Object.entries(
                                        violations.reduce((acc, violation) => {
                                            const categoryKey = `${violation.category.code}|${violation.category.name}|${violation.category.level}`
                                            if (!acc[categoryKey]) {
                                                acc[categoryKey] = []
                                            }
                                            acc[categoryKey].push(violation)
                                            return acc
                                        }, {} as Record<string, FormViolation[]>)
                                    ).map(([categoryKey, categoryViolations]) => {
                                        const [code, name, level] = categoryKey.split('|')
                                        return (
                                            <optgroup key={categoryKey} label={`${name} (${level})`}>
                                                {categoryViolations.map(violation => {
                                                    if (violation.violationTypes && violation.violationTypes.length > 0) {
                                                        return violation.violationTypes.map(type => (
                                                            <option 
                                                                key={`${violation.id}-${type.id}`} 
                                                                value={`${violation.id}|${type.id}`}
                                                            >
                                                                [{violation.code}] {violation.name} - {type.description}
                                                            </option>
                                                        ))
                                                    } else {
                                                        return (
                                                            <option key={violation.id} value={`${violation.id}|`}>
                                                                [{violation.code}] {violation.name}
                                                            </option>
                                                        )
                                                    }
                                                })}
                                            </optgroup>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Tanggal Pelanggaran <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        name="violationDate" 
                                        value={formData.violationDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-red-500" 
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Kelas <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="classLevel" 
                                        value={formData.classLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-red-500" 
                                        required
                                    >
                                        <option value="">Pilih Kelas</option>
                                        <option value="10">Kelas 10</option>
                                        <option value="11">Kelas 11</option>
                                        <option value="12">Kelas 12</option>
                                    </select>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea 
                                        name="description" 
                                        placeholder=" " 
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-red-500 resize-none" 
                                        required
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.description ? '-top-2 text-xs bg-white px-2 text-red-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-red-600'}`}>
                                        Deskripsi Kejadian *
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <IoLocationSharp className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Detail Kejadian</h3>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <input 
                                        name="location" 
                                        placeholder=" " 
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-emerald-500" 
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.location ? '-top-2 text-xs bg-white px-2 text-emerald-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-emerald-600'}`}>
                                        Lokasi Kejadian
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea 
                                        name="witnesses" 
                                        placeholder=" " 
                                        value={formData.witnesses}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-emerald-500 resize-none" 
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.witnesses ? '-top-2 text-xs bg-white px-2 text-emerald-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-emerald-600'}`}>
                                        Saksi
                                    </label>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <textarea 
                                        name="notes" 
                                        placeholder=" " 
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-emerald-500 resize-none" 
                                    />
                                    <label className={`absolute left-4 transition-all duration-300 ${hasValue.notes ? '-top-2 text-xs bg-white px-2 text-emerald-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-emerald-600'}`}>
                                        Catatan Tambahan
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <IoDocument className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">Bukti & Dokumen</h3>
                        </div>

                        <div className="group">
                            <MultiFileUpload
                                label="Bukti/Evidence"
                                placeholder="Upload bukti kejadian (foto, dokumen, dll)"
                                value={formData.evidenceUrls || []}
                                onChange={(urls) => setFormData(prev => ({ ...prev, evidenceUrls: urls }))}
                                maxFiles={5}
                                maxSize={10}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200/50">
                        <Link href="/cases" className="group flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium">
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Batal
                        </Link>

                        <button type="submit" disabled={loading} className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex-1">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IoSave className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    Simpan Kasus
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