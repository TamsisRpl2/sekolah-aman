'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { IoPerson, IoSchool, IoBook, IoWarning, IoDocument, IoSave, IoRefresh } from 'react-icons/io5'
import { updateCase } from '../actions'
import dynamic from "next/dynamic"

const Combobox = dynamic(() => import('@/components/combobox'))

interface Student {
    id: string
    name: string
    nis: string
    major: string | null
    academicYear: string
}

interface Violation {
    id: string
    name: string
    code: string
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

interface CaseData {
    id: string
    caseNumber: string
    studentId: string
    violationId: string
    violationTypeId: string | null
    violationDate: string
    classLevel: string
    description: string
    location: string | null
    witnesses: string | null
    evidenceUrls: string[]
    status: string
    notes: string | null
    student: Student
    violation: Violation
    violationType: {
        id: string
        description: string
    } | null
}

interface CaseFormData {
    studentId: string
    violationId: string
    violationTypeId?: string
    violationDate: string
    classLevel: string
    description: string
    location: string
    witnesses: string
    notes: string
}

interface FormProps {
    caseData: CaseData
    students: Student[]
    violations: Violation[]
}

const Form = ({ caseData, students, violations }: FormProps) => {
    const params = useParams()
    const caseId = params.id as string
    
    const [formData, setFormData] = useState<CaseFormData>({
        studentId: caseData.studentId,
        violationId: caseData.violationId,
        violationTypeId: caseData.violationTypeId || undefined,
        violationDate: new Date(caseData.violationDate).toISOString().split('T')[0],
        classLevel: caseData.classLevel,
        description: caseData.description,
        location: caseData.location || '',
        witnesses: caseData.witnesses || '',
        notes: caseData.notes || ''
    })
    
    const [hasValue, setHasValue] = useState({
        studentId: !!caseData.studentId,
        violationId: !!caseData.violationId,
        violationDate: !!caseData.violationDate,
        classLevel: !!caseData.classLevel,
        description: !!caseData.description,
        location: !!caseData.location,
        witnesses: !!caseData.witnesses,
        notes: !!caseData.notes
    })
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        
        if (!formData.studentId || !formData.violationId || !formData.description) {
            setError('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        try {
            setLoading(true)
            await updateCase(caseId, formData)
            alert('Kasus berhasil diperbarui')
        } catch (error) {
            console.error('Error updating case:', error)
            setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui kasus')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFormData({
            studentId: caseData.studentId,
            violationId: caseData.violationId,
            violationTypeId: caseData.violationTypeId || undefined,
            violationDate: new Date(caseData.violationDate).toISOString().split('T')[0],
            classLevel: caseData.classLevel,
            description: caseData.description,
            location: caseData.location || '',
            witnesses: caseData.witnesses || '',
            notes: caseData.notes || ''
        })
        setHasValue({
            studentId: !!caseData.studentId,
            violationId: !!caseData.violationId,
            violationDate: !!caseData.violationDate,
            classLevel: !!caseData.classLevel,
            description: !!caseData.description,
            location: !!caseData.location,
            witnesses: !!caseData.witnesses,
            notes: !!caseData.notes
        })
        setError(null)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <IoPerson className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Informasi Siswa</h3>
                    </div>

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.studentId ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Nama Siswa *
                        </label>
                        <select 
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                            required
                        >
                            <option value="">Pilih Siswa</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.nis}) - {student.major || 'Belum ditentukan'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.classLevel ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Kelas *
                        </label>
                        <select 
                            name="classLevel"
                            value={formData.classLevel}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                            required
                        >
                            <option value="">Pilih Kelas</option>
                            <option value="10">Kelas 10</option>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                        </select>
                    </div>

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.violationDate ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Tanggal Pelanggaran *
                        </label>
                        <input 
                            type="date"
                            name="violationDate"
                            value={formData.violationDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <IoWarning className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Informasi Pelanggaran</h3>
                    </div>

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.violationId ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Jenis Pelanggaran *
                        </label>
                        <select 
                            name="violationId"
                            value={formData.violationId ? (formData.violationTypeId ? `${formData.violationId}|${formData.violationTypeId}` : `${formData.violationId}|`) : ''}
                            onChange={handleViolationChange}
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                            required
                        >
                            <option value="">Pilih Jenis Pelanggaran</option>
                            {/* Group by Category */}
                            {Object.entries(
                                violations.reduce((acc, violation) => {
                                    const categoryKey = `${violation.category.code}|${violation.category.name}|${violation.category.level}`
                                    if (!acc[categoryKey]) {
                                        acc[categoryKey] = []
                                    }
                                    acc[categoryKey].push(violation)
                                    return acc
                                }, {} as Record<string, Violation[]>)
                            ).map(([categoryKey, categoryViolations]) => {
                                const [code, name, level] = categoryKey.split('|')
                                return (
                                    <optgroup key={categoryKey} label={`${name} (${level})`}>
                                        {categoryViolations.map(violation => {
                                            // If violation has types, create option for each type
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

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.location ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Lokasi Kejadian
                        </label>
                        <input 
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Masukkan lokasi kejadian"
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                        />
                    </div>

                    <div className="group">
                        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                            hasValue.witnesses ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                            Saksi
                        </label>
                        <input 
                            type="text"
                            name="witnesses"
                            value={formData.witnesses}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama saksi"
                            className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <IoDocument className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Detail Tambahan</h3>
                </div>

                <div className="group">
                    <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                        hasValue.description ? 'text-blue-600' : 'text-slate-600'
                    }`}>
                        Deskripsi Pelanggaran *
                    </label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Deskripsikan pelanggaran yang dilakukan siswa"
                        className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none"
                        rows={4}
                        required
                    />
                </div>

                <div className="group">
                    <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                        hasValue.notes ? 'text-blue-600' : 'text-slate-600'
                    }`}>
                        Catatan Tambahan
                    </label>
                    <textarea 
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Masukkan catatan tambahan jika ada"
                        className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none"
                        rows={3}
                    />
                </div>
        </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button 
                    type="button"
                    onClick={handleReset}
                    className="btn bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                    <IoRefresh className="w-4 h-4" />
                    Reset
                </button>
                <button 
                    type="submit"
                    disabled={loading}
                    className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:loading"
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <IoSave className="w-4 h-4" />
                    )}
                    Simpan Perubahan
                </button>
        </div>
    </form>
    )
}

export default Form