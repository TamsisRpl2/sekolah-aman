'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCase, caseAPI } from '@/lib/hooks/useCases'
import { ActionFormData } from '@/types/cases'
import { IoSave, IoArrowBack, IoCheckmarkCircle, IoCalendar, IoDocument, IoWarning } from 'react-icons/io5'
import MultiFileUpload from '@/components/multi-file-upload'

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
    const { caseData, loading: caseLoading, error } = useCase(id)
    const [loading, setLoading] = useState(false)
    const [availableSanctions, setAvailableSanctions] = useState<SanctionType[]>([])
    const [sanctionsLoading, setSanctionsLoading] = useState(false)
    
    const [formData, setFormData] = useState<ActionFormData>({
        actionType: '',
        description: '',
        evidenceUrls: [],
        followUpDate: '',
        isCompleted: false,
        notes: ''
    })

    useEffect(() => {
        const fetchAvailableSanctions = async () => {
            if (!caseData?.violation?.id) return
            
            try {
                setSanctionsLoading(true)
                const response = await fetch(`/api/master/violations/${caseData.violation.id}`)
                if (response.ok) {
                    const violationData = await response.json()
                    // Extract sanction types from violation
                    const sanctions = violationData.sanctionTypes?.map((st: any) => ({
                        id: st.sanctionType.id,
                        name: st.sanctionType.name,
                        description: st.sanctionType.description,
                        level: st.sanctionType.level,
                        duration: st.sanctionType.duration
                    })) || []
                    setAvailableSanctions(sanctions)
                }
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
        
        if (!formData.actionType || !formData.description) {
            alert('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        try {
            setLoading(true)
            await caseAPI.addAction(id, formData)
            
            // Reset form
            setFormData({
                actionType: '',
                description: '',
                evidenceUrls: [],
                followUpDate: '',
                isCompleted: false,
                notes: ''
            })
            
            // Reload the page to refresh timeline
            window.location.reload()
        } catch (error) {
            alert('Gagal menambah tindakan: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    if (caseLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error: {error}</span>
            </div>
        )
    }

    if (!caseData) {
        return (
            <div className="alert alert-warning">
                <span>Kasus tidak ditemukan</span>
            </div>
        )
    }

    // Check if there are any completed actions
    const hasCompletedAction = caseData.actions?.some(action => action.isCompleted) || false

    if (hasCompletedAction) {
        return (
            <div className="space-y-6">
                {/* Case Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <IoWarning className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Kasus</h2>
                            <p className="text-sm text-gray-600">{caseData.caseNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Siswa:</span> {caseData.student.name} ({caseData.student.nis})</p>
                        <p><span className="font-medium">Kelas:</span> {caseData.classLevel}</p>
                        <p><span className="font-medium">Pelanggaran:</span> {caseData.violation.name}</p>
                        <p><span className="font-medium">Tanggal:</span> {new Date(caseData.violationDate).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                {/* Completed Action Notice */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-900">Kasus Sudah Selesai</h3>
                            <p className="text-sm text-green-700">Tindakan untuk kasus ini sudah dinyatakan selesai</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                            <strong>Informasi:</strong> Kasus ini sudah memiliki tindakan yang dinyatakan selesai. 
                            Tidak dapat menambahkan tindakan baru untuk kasus yang sudah selesai.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="btn btn-outline border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => router.back()}
                        >
                            <IoArrowBack className="w-4 h-4" />
                            Kembali ke Detail Kasus
                        </button>
                        <button
                            type="button"
                            className="btn bg-green-600 text-white hover:bg-green-700"
                            onClick={() => router.push('/cases')}
                        >
                            Lihat Daftar Kasus
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Case Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <IoWarning className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Informasi Kasus</h2>
                        <p className="text-sm text-gray-600">{caseData.caseNumber}</p>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Siswa:</span> {caseData.student.name} ({caseData.student.nis})</p>
                    <p><span className="font-medium">Kelas:</span> {caseData.classLevel}</p>
                    <p><span className="font-medium">Pelanggaran:</span> {caseData.violation.name}</p>
                    <p><span className="font-medium">Tanggal:</span> {new Date(caseData.violationDate).toLocaleDateString('id-ID')}</p>
                </div>
            </div>

            {/* Action Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IoDocument className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Tambah Tindakan</h2>
                            <p className="text-sm text-gray-600">Catat tindakan yang dilakukan untuk kasus ini</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Sanksi yang Dipilih *</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={formData.actionType}
                                onChange={(e) => setFormData(prev => ({ ...prev, actionType: e.target.value }))}
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
                                <div className="label">
                                    <span className="label-text-alt text-warning">
                                        Pelanggaran ini belum memiliki sanksi yang didefinisikan
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Deskripsi Tindakan *</span>
                            </label>
                            <textarea 
                                className="textarea textarea-bordered h-24"
                                placeholder="Jelaskan detail tindakan yang dilakukan..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tanggal Follow-up (Opsional)</span>
                            </label>
                            <input 
                                type="date"
                                className="input input-bordered"
                                value={formData.followUpDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-control">
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

                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Tandai sebagai selesai</span>
                                <input 
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={formData.isCompleted}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.checked }))}
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Catatan Tambahan</span>
                            </label>
                            <textarea 
                                className="textarea textarea-bordered h-20"
                                placeholder="Catatan atau informasi tambahan..."
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
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
                            className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 text-white flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <IoSave className="w-4 h-4" />
                            )}
                            {loading ? 'Menyimpan...' : 'Simpan Tindakan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Form