'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IoSave, IoCheckmarkCircle, IoDocumentText, IoCalendarOutline, IoInformationCircle, IoCloudUpload } from 'react-icons/io5'
import MultiFileUpload from '@/components/multi-file-upload'
import { createCaseAction, getSanctionTypesForViolation } from '../actions'

interface CaseData {
    id: string
    caseNumber: string
    status: string
    student: {
        name: string
        nis: string
        major: string | null
    }
    violation: {
        id: string
        name: string
        category: {
            level: string
        }
    }
}

interface SanctionType {
    id: string
    name: string
    description?: string | null
    level: string
    duration?: number | null
}

interface FormProps {
    caseData: CaseData
    lastAction: {
        id: string
        isCompleted: boolean
        createdAt: Date
    } | null
}

const Form = ({ caseData, lastAction }: FormProps) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [availableSanctions, setAvailableSanctions] = useState<SanctionType[]>([])
    const [sanctionsLoading, setSanctionsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    
    const [formData, setFormData] = useState({
        sanctionTypeId: '',
        description: '',
        evidenceUrls: [] as string[],
        followUpDate: '',
        notes: '',
        isCompleted: false
    })

    const isFormDisabled = lastAction?.isCompleted || false

    useEffect(() => {
        const fetchSanctions = async () => {
            try {
                setSanctionsLoading(true)
                const sanctions = await getSanctionTypesForViolation(caseData.violation.id)
                setAvailableSanctions(sanctions)
            } catch (error) {
                console.error('Error fetching sanctions:', error)
                setAvailableSanctions([])
            } finally {
                setSanctionsLoading(false)
            }
        }

        fetchSanctions()
    }, [caseData.violation.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (!formData.sanctionTypeId || !formData.description) {
            setError('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        startTransition(async () => {
            try {
                await createCaseAction(caseData.id, formData)
                
                setSuccess(true)
                setFormData({
                    sanctionTypeId: '',
                    description: '',
                    evidenceUrls: [],
                    followUpDate: '',
                    notes: '',
                    isCompleted: false
                })
                
                // Refresh after delay to show success message
                setTimeout(() => {
                    router.refresh()
                }, 1500)
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Gagal menambah tindakan')
            }
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <IoDocumentText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Tambah Tindakan Baru</h2>
                        <p className="text-emerald-100 text-sm mt-1">Catat tindakan yang dilakukan untuk kasus ini</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Warning if last action is completed */}
                {isFormDisabled && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
                        <IoInformationCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-amber-900 font-semibold">Tindakan Terakhir Sudah Selesai</p>
                            <p className="text-amber-800 text-sm mt-1">
                                Tidak dapat menambah tindakan baru karena tindakan terakhir sudah ditandai selesai. 
                                Silakan <strong>edit tindakan terakhir</strong> dan ubah statusnya menjadi &ldquo;Dalam Proses&rdquo; jika ingin menambah tindakan baru.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-800 font-medium">Tindakan berhasil ditambahkan!</p>
                            <p className="text-green-700 text-sm mt-1">Timeline akan diperbarui otomatis.</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <IoInformationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Sanction Type Select */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Jenis Sanksi <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.sanctionTypeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, sanctionTypeId: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        required
                        disabled={sanctionsLoading || availableSanctions.length === 0 || isPending || isFormDisabled}
                    >
                        <option value="">
                            {sanctionsLoading 
                                ? "Memuat sanksi..." 
                                : availableSanctions.length === 0 
                                ? "Tidak ada sanksi tersedia"
                                : "-- Pilih Jenis Sanksi --"
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
                        <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                            <IoInformationCircle className="w-4 h-4" />
                            Pelanggaran ini belum memiliki sanksi yang didefinisikan
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Deskripsi Tindakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Jelaskan tindakan yang dilakukan secara detail..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 resize-none"
                        required
                        disabled={isPending || isFormDisabled}
                    />
                    <p className="text-xs text-slate-500">
                        Tuliskan detail tindakan yang dilakukan, termasuk waktu dan pihak yang terlibat
                    </p>
                </div>

                {/* Status Tindakan */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Status Tindakan <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.isCompleted ? 'selesai' : 'proses'}
                        onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.value === 'selesai' }))}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        required
                        disabled={isPending || isFormDisabled}
                    >
                        <option value="proses">Dalam Proses</option>
                        <option value="selesai">Selesai</option>
                    </select>
                    <p className="text-xs text-slate-500">
                        {formData.isCompleted 
                            ? '⚠️ Tindakan akan ditandai selesai. Tidak dapat menambah tindakan baru setelah ini.' 
                            : 'Tindakan masih dalam proses. Anda dapat menambah tindakan lanjutan.'}
                    </p>
                </div>

                {/* Follow-up Date */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <IoCalendarOutline className="w-4 h-4" />
                        Tanggal Follow-up <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        disabled={isPending || isFormDisabled}
                    />
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <IoCloudUpload className="w-4 h-4" />
                        Bukti Tindakan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <MultiFileUpload
                        label=""
                        placeholder="Upload foto atau dokumen bukti tindakan"
                        value={formData.evidenceUrls}
                        onChange={(urls) => setFormData(prev => ({ ...prev, evidenceUrls: urls }))}
                        maxFiles={5}
                        maxSize={10}
                        accept="image/*,application/pdf"
                    />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder="Tambahkan catatan penting lainnya..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 resize-none"
                        disabled={isPending || isFormDisabled}
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending || sanctionsLoading || availableSanctions.length === 0 || isFormDisabled}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                    >
                        {isPending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan Tindakan...</span>
                            </>
                        ) : (
                            <>
                                <IoSave className="w-5 h-5" />
                                <span>Simpan Tindakan</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <IoInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Informasi</p>
                            <p className="text-blue-700">
                                Tindakan yang ditambahkan akan tercatat dalam timeline dan dapat dilihat oleh semua pihak terkait.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Form
