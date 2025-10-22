'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCase, caseAPI } from '@/lib/hooks/useCases'
import { ActionFormData } from '@/types/cases'
import { IoSave, IoArrowBack, IoCheckmarkCircle, IoCalendar, IoDocument, IoWarning, IoShieldCheckmark } from 'react-icons/io5'
import MultiFileUpload from '@/components/multi-file-upload'
import { getViolation } from '@/app/(main)/master/violations/actions'

interface SanctionType {
    id: string
    name: string
    description?: string | null
    level: string
    duration?: number | null
}

const Form = () => {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { caseData, loading: caseLoading, error: caseError } = useCase(id)
    const [loading, setLoading] = useState(false)
    const [availableSanctions, setAvailableSanctions] = useState<SanctionType[]>([])
    const [sanctionsLoading, setSanctionsLoading] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    
    const [formData, setFormData] = useState<ActionFormData>({
        actionType: '',
        description: '',
        evidenceUrls: [],
        followUpDate: '',
        isCompleted: false,
        notes: ''
    })

    const [hasValue, setHasValue] = useState<Record<string, boolean>>({
        description: false,
        followUpDate: false,
        notes: false
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setHasValue(prev => ({ ...prev, [name]: !!value }))
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        const fetchAvailableSanctions = async () => {
            if (!caseData?.violation?.id) return
            
            try {
                setSanctionsLoading(true)
                const violationData = await getViolation(caseData.violation.id)
                const sanctions = violationData.sanctionTypes?.map((st: any) => ({
                    id: st.sanctionType.id,
                    name: st.sanctionType.name,
                    description: st.sanctionType.description,
                    level: st.sanctionType.level,
                    duration: st.sanctionType.duration
                })) || []
                setAvailableSanctions(sanctions)
            } catch (error) {
                console.error('Error fetching available sanctions:', error)
                setAvailableSanctions([])
            } finally {
                setSanctionsLoading(false)
            }
        }

        fetchAvailableSanctions()
    }, [caseData?.violation?.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        
        if (!formData.actionType || !formData.description) {
            setFormError('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        try {
            setLoading(true)
            await caseAPI.addAction(id, formData)
            
            setFormData({
                actionType: '',
                description: '',
                evidenceUrls: [],
                followUpDate: '',
                isCompleted: false,
                notes: ''
            })
            
            window.location.reload()
        } catch (error) {
            setFormError('Gagal menambah tindakan: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    if (caseLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat data kasus...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (caseError) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <span>Error: {caseError}</span>
                </div>
            </div>
        )
    }

    if (!caseData) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    <span>Kasus tidak ditemukan</span>
                </div>
            </div>
        )
    }

    const hasCompletedAction = caseData.actions?.some(action => action.isCompleted) || false

    if (hasCompletedAction) {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <IoWarning className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">Informasi Kasus</h2>
                            <p className="text-sm text-slate-600">{caseData.caseNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Siswa:</span> {caseData.student.name} ({caseData.student.nis})</p>
                        <p><span className="font-medium">Kelas:</span> {caseData.classLevel}</p>
                        <p><span className="font-medium">Pelanggaran:</span> {caseData.violation.name}</p>
                        <p><span className="font-medium">Tanggal:</span> {new Date(caseData.violationDate).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <IoCheckmarkCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-800">Kasus Sudah Selesai</h3>
                            <p className="text-sm text-slate-600">Tindakan untuk kasus ini sudah dinyatakan selesai</p>
                        </div>
                    </div>
                    
                    <div className="bg-green-50/50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-green-800">
                            <strong>Informasi:</strong> Kasus ini sudah memiliki tindakan yang dinyatakan selesai. 
                            Tidak dapat menambahkan tindakan baru untuk kasus yang sudah selesai.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={`/cases/${id}`}
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium"
                        >
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Kembali ke Detail Kasus
                        </Link>
                        <Link
                            href="/cases"
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-green-200 font-medium flex-1"
                        >
                            Lihat Daftar Kasus
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <IoWarning className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Informasi Kasus</h2>
                        <p className="text-sm text-slate-600">{caseData.caseNumber}</p>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Siswa:</span> {caseData.student.name} ({caseData.student.nis})</p>
                    <p><span className="font-medium">Kelas:</span> {caseData.classLevel}</p>
                    <p><span className="font-medium">Pelanggaran:</span> {caseData.violation.name}</p>
                    <p><span className="font-medium">Tanggal:</span> {new Date(caseData.violationDate).toLocaleDateString('id-ID')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <IoShieldCheckmark className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">Tambah Tindakan</h2>
                            <p className="text-sm text-slate-600">Catat tindakan yang dilakukan untuk kasus ini</p>
                        </div>
                    </div>

                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{formError}</div>
                    )}

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Sanksi yang Dipilih *
                            </label>
                            <select 
                                name="actionType"
                                value={formData.actionType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500" 
                                required
                                disabled={sanctionsLoading || availableSanctions.length === 0}
                            >
                                <option value="">
                                    {sanctionsLoading 
                                        ? "Memuat sanksi..." 
                                        : availableSanctions.length === 0 
                                        ? "Tidak ada sanksi tersedia"
                                        : "-- Pilih Sanksi --"
                                    }
                                </option>
                                {availableSanctions.map(sanction => (
                                    <option key={sanction.id} value={sanction.id}>
                                        {sanction.name}
                                        {sanction.duration && ` (${sanction.duration} hari)`}
                                    </option>
                                ))}
                            </select>
                            {availableSanctions.length === 0 && !sanctionsLoading && (
                                <div className="mt-2">
                                    <span className="text-sm text-amber-600">
                                        Pelanggaran ini belum memiliki sanksi yang didefinisikan
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="group">
                            <div className="relative">
                                <textarea 
                                    name="description"
                                    placeholder=" " 
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none" 
                                    required
                                />
                                <label className={`absolute left-4 transition-all duration-300 ${hasValue.description ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                    Deskripsi Tindakan *
                                </label>
                            </div>
                        </div>

                        <div className="group">
                            <div className="relative">
                                <input 
                                    type="date"
                                    name="followUpDate"
                                    value={formData.followUpDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="peer w-full px-4 py-3 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 focus:outline-none focus:shadow-lg focus:border-blue-500" 
                                />
                                <label className={`absolute left-4 transition-all duration-300 ${hasValue.followUpDate ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-1 text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                    Tanggal Follow-up (Opsional)
                                </label>
                            </div>
                        </div>

                        <div className="group">
                            <MultiFileUpload
                                label="Bukti Tindakan (Opsional)"
                                placeholder="Upload bukti tindakan yang dilakukan (foto, dokumen, dll)"
                                value={formData.evidenceUrls || []}
                                onChange={(urls) => setFormData(prev => ({ ...prev, evidenceUrls: urls }))}
                                maxFiles={3}
                                maxSize={10}
                                accept="image/*,application/pdf"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl">
                            <input 
                                type="checkbox"
                                name="isCompleted"
                                checked={formData.isCompleted}
                                onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.checked }))}
                                className="checkbox checkbox-primary"
                            />
                            <label className="text-sm font-medium text-slate-700 cursor-pointer">
                                Tandai sebagai selesai
                            </label>
                        </div>

                        <div className="group">
                            <div className="relative">
                                <textarea 
                                    name="notes"
                                    placeholder=" " 
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="peer w-full px-4 py-4 text-slate-900 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl shadow-sm transition-all duration-300 placeholder-transparent focus:outline-none focus:shadow-lg focus:border-blue-500 resize-none" 
                                />
                                <label className={`absolute left-4 transition-all duration-300 ${hasValue.notes ? '-top-2 text-xs bg-white px-2 text-blue-600' : 'top-4 text-slate-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600'}`}>
                                    Catatan Tambahan
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={`/cases/${id}`}
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 hover:shadow-lg font-medium"
                        >
                            <IoArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            Kembali
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex-1"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IoSave className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                    Simpan Tindakan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Form