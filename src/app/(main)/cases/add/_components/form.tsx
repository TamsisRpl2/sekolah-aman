'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IoSave, IoArrowBack, IoWarning, IoCalendar, IoPerson, IoSchool, IoDocument, IoAdd, IoRefresh } from 'react-icons/io5'
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
        name: string
        level: string
    }
}

const Form = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<FormStudent[]>([])
    const [violations, setViolations] = useState<FormViolation[]>([])
    const [selectedStudent, setSelectedStudent] = useState<FormStudent | null>(null)
    const [selectedViolation, setSelectedViolation] = useState<FormViolation | null>(null)
    
    const [formData, setFormData] = useState<CaseFormData>({
        studentId: '',
        violationId: '',
        violationDate: new Date().toISOString().split('T')[0],
        classLevel: '',
        description: '',
        location: '',
        witnesses: '',
        evidenceUrls: [],
        notes: ''
    })

    const refreshStudents = async () => {
        try {
            const studentsResponse = await fetch('/api/users/students')
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json()
                setStudents(studentsData.students || [])
            }
        } catch (error) {
            console.error('Error refreshing students:', error)
        }
    }

useEffect(() => {
        const fetchData = async () => {
            try {
                
                const [studentsData, violationsData] = await Promise.all([
                    getStudentsForCase(),
                    getViolationsForCase()
                ])
                
                setStudents(studentsData || [])
                setViolations(violationsData || [])
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [])

useEffect(() => {
        const handleFocus = async () => {
            try {
                const studentsData = await getStudentsForCase()
                setStudents(studentsData || [])
            } catch (error) {
                console.error('Error refreshing students:', error)
            }
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [])

    const handleStudentChange = (studentId: string) => {
        const student = students.find(s => s.id === studentId)
        setSelectedStudent(student || null)
        setFormData(prev => ({ ...prev, studentId }))
    }

    const handleViolationChange = (violationId: string) => {
        const violation = violations.find(v => v.id === violationId)
        setSelectedViolation(violation || null)
        setFormData(prev => ({ ...prev, violationId }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (students.length === 0) {
            alert('Belum ada data siswa. Silakan tambah siswa terlebih dahulu.')
            return
        }
        
        if (!formData.studentId || !formData.violationId || !formData.classLevel || !formData.description) {
            alert('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        try {
            setLoading(true)
            
            const caseData = {
                studentId: formData.studentId,
                violationId: formData.violationId,
                classLevel: formData.classLevel,
                description: formData.description,
                violationDate: formData.violationDate,
                location: formData.location || '',
                witnesses: formData.witnesses || '',
                evidenceUrls: formData.evidenceUrls || []
            }
            
            await createCase(caseData)
            router.push('/cases')
        } catch (error) {
            alert('Gagal menambah kasus: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <IoWarning className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Tambah Kasus Pelanggaran</h2>
                            <p className="text-sm text-gray-600">Lengkapi formulir di bawah untuk mencatat kasus pelanggaran</p>
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <IoPerson className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Data Siswa</h3>
                        </div>
                        {students.length === 0 && (
                            <Link
                                href="/students/add"
                                className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300"
                            >
                                <IoAdd className="w-4 h-4" />
                                Tambah Siswa
                            </Link>
                        )}
                    </div>
                    
                    {students.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoPerson className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Siswa</h4>
                            <p className="text-gray-600 mb-4">
                                Untuk menambah kasus pelanggaran, Anda perlu menambahkan data siswa terlebih dahulu.
                            </p>
                            <Link
                                href="/students/add"
                                className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white"
                            >
                                <IoAdd className="w-4 h-4" />
                                Tambah Siswa Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="label">
                                        <span className="label-text">Pilih Siswa *</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={refreshStudents}
                                            className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                                            title="Refresh data siswa"
                                        >
                                            <IoRefresh className="w-3 h-3" />
                                            Refresh
                                        </button>
                                        <Link
                                            href="/students/add"
                                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <IoAdd className="w-3 h-3" />
                                            Tambah Siswa Baru
                                        </Link>
                                    </div>
                                </div>
                                <select 
                                    className="select select-bordered"
                                    value={formData.studentId}
                                    onChange={(e) => handleStudentChange(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.nis} - {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedStudent && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Info Siswa</h4>
                                    <div className="space-y-1 text-sm text-blue-700">
                                        <p><span className="font-medium">NIS:</span> {selectedStudent.nis}</p>
                                        <p><span className="font-medium">Nama:</span> {selectedStudent.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <IoWarning className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Jenis Pelanggaran</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Pilih Pelanggaran *</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={formData.violationId}
                                onChange={(e) => handleViolationChange(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Pelanggaran --</option>
                                {violations.map(violation => (
                                    <option key={violation.id} value={violation.id}>
                                        {violation.code} - {violation.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedViolation && (
                            <div className="bg-red-50 rounded-lg p-4">
                                <h4 className="font-medium text-red-900 mb-2">Info Pelanggaran</h4>
                                <div className="space-y-1 text-sm text-red-700">
                                    <p><span className="font-medium">Kode:</span> {selectedViolation.code}</p>
                                    <p><span className="font-medium">Kategori:</span> {selectedViolation.category.name}</p>
                                    <p><span className="font-medium">Tingkat:</span> 
                                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                            selectedViolation.category.level === 'RINGAN' ? 'bg-green-100 text-green-800' :
                                            selectedViolation.category.level === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedViolation.category.level}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <IoDocument className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Detail Kasus</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tanggal Pelanggaran *</span>
                            </label>
                            <input 
                                type="date"
                                className="input input-bordered"
                                value={formData.violationDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, violationDate: e.target.value }))}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Kelas Saat Pelanggaran *</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={formData.classLevel}
                                onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
                                required
                            >
                                <option value="">-- Pilih Kelas --</option>
                                <option value="X">X (Sepuluh)</option>
                                <option value="XI">XI (Sebelas)</option>
                                <option value="XII">XII (Dua Belas)</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Lokasi Kejadian</span>
                            </label>
                            <input 
                                type="text"
                                className="input input-bordered"
                                placeholder="Contoh: Ruang Kelas XII RPL 1"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text">Deskripsi Kejadian *</span>
                            </label>
                            <textarea 
                                className="textarea textarea-bordered h-24"
                                placeholder="Jelaskan detail kejadian pelanggaran..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Saksi-saksi</span>
                            </label>
                            <textarea 
                                className="textarea textarea-bordered h-20"
                                placeholder="Nama saksi yang melihat kejadian..."
                                value={formData.witnesses}
                                onChange={(e) => setFormData(prev => ({ ...prev, witnesses: e.target.value }))}
                            ></textarea>
                        </div>

                        <div className="form-control md:col-span-2">
                            <MultiFileUpload
                                label="Bukti/Evidence"
                                placeholder="Upload bukti kejadian (foto, dokumen, dll)"
                                value={formData.evidenceUrls || []}
                                onChange={(urls) => setFormData(prev => ({ ...prev, evidenceUrls: urls }))}
                                maxFiles={5}
                                maxSize={10}
                                accept="image}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => router.back()}
                        >
                            <IoArrowBack className="w-4 h-4" />
                            Kembali
                        </button>
                        <button
                            type="submit"
                            className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <IoSave className="w-4 h-4" />
                            )}
                            {loading ? 'Menyimpan...' : 'Simpan Kasus'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Form
