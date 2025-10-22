'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoCheckmarkCircle, IoTimeOutline, IoCalendarOutline, IoPerson, IoDocumentText, IoTrash, IoCreate, IoEllipsisVertical, IoImage, IoCloudDownload, IoAlertCircle, IoClose, IoCheckmark, IoCloudUpload } from 'react-icons/io5'
import { deleteCaseAction, updateCaseAction, getSanctionTypesForViolation } from '../actions'
import dynamic from 'next/dynamic'

const MultiFileUpload = dynamic(() => import('@/components/multi-file-upload'))

interface SanctionType {
    id: string
    name: string
    level: string
}

interface ActionBy {
    name: string
}

interface EditedBy {
    name: string
}

interface CaseAction {
    id: string
    actionType: string
    description: string
    actionDate: Date
    followUpDate: Date | null
    isCompleted: boolean
    notes: string | null
    evidenceUrls: string[]
    createdAt: Date
    editedAt: Date | null
    sanctionType: SanctionType | null
    sanctionTypeId: string | null
    actionBy: ActionBy
    editedBy: EditedBy | null
}

interface TimelineProps {
    caseId: string
    actions: CaseAction[]
    violationId: string
}

const Timeline = ({ caseId, actions, violationId }: TimelineProps) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [editingAction, setEditingAction] = useState<CaseAction | null>(null)
    const [sanctionTypes, setSanctionTypes] = useState<SanctionType[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    
    const [editFormData, setEditFormData] = useState({
        sanctionTypeId: '',
        description: '',
        followUpDate: '',
        notes: '',
        evidenceUrls: [] as string[],
        isCompleted: false
    })

    useEffect(() => {
        if (editingAction) {
            setEditFormData({
                sanctionTypeId: editingAction.sanctionTypeId || '',
                description: editingAction.description,
                followUpDate: editingAction.followUpDate 
                    ? new Date(editingAction.followUpDate).toISOString().split('T')[0]
                    : '',
                notes: editingAction.notes || '',
                evidenceUrls: editingAction.evidenceUrls || [],
                isCompleted: editingAction.isCompleted
            })

            startTransition(async () => {
                try {
                    const types = await getSanctionTypesForViolation(violationId)
                    setSanctionTypes(types)
                } catch (error) {
                    console.error('Error loading sanction types:', error)
                }
            })
        }
    }, [editingAction, violationId])

    const handleEdit = (action: CaseAction) => {
        setEditingAction(action)
        setOpenMenuId(null)
    }

    const handleCloseModal = () => {
        setEditingAction(null)
        setEditFormData({
            sanctionTypeId: '',
            description: '',
            followUpDate: '',
            notes: '',
            evidenceUrls: [],
            isCompleted: false
        })
        setSuccessMessage('')
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!editingAction || !editFormData.sanctionTypeId || !editFormData.description) {
            alert('Jenis sanksi dan deskripsi wajib diisi')
            return
        }

        setIsSubmitting(true)
        startTransition(async () => {
            try {
                await updateCaseAction(editingAction.id, {
                    sanctionTypeId: editFormData.sanctionTypeId,
                    description: editFormData.description,
                    followUpDate: editFormData.followUpDate || undefined,
                    notes: editFormData.notes || undefined,
                    evidenceUrls: editFormData.evidenceUrls,
                    isCompleted: editFormData.isCompleted
                })

                setSuccessMessage('Tindakan berhasil diperbarui!')
                setTimeout(() => {
                    handleCloseModal()
                    router.refresh()
                }, 1500)
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Gagal memperbarui tindakan')
            } finally {
                setIsSubmitting(false)
            }
        })
    }

    const handleDelete = async (actionId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tindakan ini?')) {
            return
        }

        setDeletingId(actionId)
        startTransition(async () => {
            try {
                await deleteCaseAction(actionId)
                router.refresh()
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Gagal menghapus tindakan')
            } finally {
                setDeletingId(null)
            }
        })
    }

    const getLevelBadge = (level: string) => {
        const badges = {
            'RINGAN': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'SEDANG': 'bg-orange-100 text-orange-800 border-orange-200',
            'BERAT': 'bg-red-100 text-red-800 border-red-200'
        }
        return badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!actions || actions.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                        <IoAlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Tindakan</h3>
                    <p className="text-slate-600 text-sm">
                        Belum ada tindakan yang dicatat untuk kasus ini. Silakan tambahkan tindakan pertama menggunakan form di sebelah kiri.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <IoTimeOutline className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Timeline Tindakan</h2>
                            <p className="text-blue-100 text-sm mt-1">{actions.length} tindakan tercatat</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="p-6">
                <div className="space-y-4">
                    {actions.map((action, index) => (
                        <div 
                            key={action.id}
                            className="group relative bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300"
                        >
                            {/* Timeline Connector */}
                            {index < actions.length - 1 && (
                                <div className="absolute left-[30px] top-[60px] bottom-[-16px] w-0.5 bg-gradient-to-b from-slate-300 to-transparent" />
                            )}

                            {/* Action Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                        action.isCompleted 
                                            ? 'bg-green-100 border-2 border-green-300' 
                                            : 'bg-blue-100 border-2 border-blue-300'
                                    }`}>
                                        {action.isCompleted ? (
                                            <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <IoDocumentText className="w-6 h-6 text-blue-600" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 flex-wrap mb-2">
                                            <h3 className="font-semibold text-slate-800 text-lg">
                                                {action.sanctionType?.name || 'Tindakan'}
                                            </h3>
                                            {action.sanctionType?.level && (
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getLevelBadge(action.sanctionType.level)}`}>
                                                    {action.sanctionType.level}
                                                </span>
                                            )}
                                            {action.isCompleted && (
                                                <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded-full">
                                                    Selesai
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <IoPerson className="w-4 h-4" />
                                                <span>{action.actionBy.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <IoCalendarOutline className="w-4 h-4" />
                                                <span>{formatDate(action.createdAt)}</span>
                                            </div>
                                            <div className="text-slate-500">
                                                {formatTime(action.createdAt)}
                                            </div>
                                        </div>

                                        <p className="text-slate-700 leading-relaxed mb-3">
                                            {action.description}
                                        </p>

                                        {/* Follow-up Date */}
                                        {action.followUpDate && (
                                            <div className="inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                                                <IoCalendarOutline className="w-4 h-4" />
                                                <span className="font-medium">Follow-up:</span>
                                                <span>{formatDate(action.followUpDate)}</span>
                                            </div>
                                        )}

                                        {/* Evidence */}
                                        {action.evidenceUrls && action.evidenceUrls.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                                    <IoImage className="w-4 h-4" />
                                                    <span>Bukti Tindakan ({action.evidenceUrls.length})</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {action.evidenceUrls.map((url, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group/img relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all"
                                                        >
                                                            <Image 
                                                                src={url} 
                                                                alt={`Evidence ${idx + 1}`}
                                                                fill
                                                                sizes="80px"
                                                                className="object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors flex items-center justify-center">
                                                                <IoCloudDownload className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {action.notes && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                                                <p className="font-medium mb-1">Catatan:</p>
                                                <p>{action.notes}</p>
                                            </div>
                                        )}

                                        {/* Edited Info */}
                                        {action.editedAt && action.editedBy && (
                                            <div className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                                                <IoCreate className="w-3 h-3" />
                                                <span>Diedit oleh {action.editedBy.name} pada {formatDate(action.editedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Menu */}
                                <div className="relative flex-shrink-0">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === action.id ? null : action.id)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <IoEllipsisVertical className="w-5 h-5 text-slate-600" />
                                    </button>

                                    {openMenuId === action.id && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                                            <button
                                                onClick={() => handleEdit(action)}
                                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                            >
                                                <IoCreate className="w-4 h-4" />
                                                <span>Edit Tindakan</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(action.id)}
                                                disabled={deletingId === action.id || isPending}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {deletingId === action.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                                        <span>Menghapus...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoTrash className="w-4 h-4" />
                                                        <span>Hapus Tindakan</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingAction && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <IoCreate className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Edit Tindakan</h2>
                                    <p className="text-blue-100 text-sm mt-1">Perbarui informasi tindakan kasus</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <IoCheckmark className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-green-800 font-medium">{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoDocumentText className="w-4 h-4" />
                                    Jenis Sanksi
                                </label>
                                <select
                                    value={editFormData.sanctionTypeId}
                                    onChange={(e) => setEditFormData({ ...editFormData, sanctionTypeId: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Pilih Jenis Sanksi</option>
                                    {sanctionTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} - {type.level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoDocumentText className="w-4 h-4" />
                                    Deskripsi Tindakan
                                </label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    rows={4}
                                    placeholder="Jelaskan tindakan yang diambil..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoCheckmarkCircle className="w-4 h-4" />
                                    Status Tindakan
                                </label>
                                <select
                                    value={editFormData.isCompleted ? 'selesai' : 'proses'}
                                    onChange={(e) => setEditFormData({ ...editFormData, isCompleted: e.target.value === 'selesai' })}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                                >
                                    <option value="proses">Dalam Proses</option>
                                    <option value="selesai">Selesai</option>
                                </select>
                                <p className="text-xs text-slate-500">
                                    {editFormData.isCompleted 
                                        ? '⚠️ Tindakan akan ditandai selesai. Tidak dapat menambah tindakan baru setelah ini.' 
                                        : 'Tindakan masih dalam proses. Anda dapat menambah tindakan lanjutan.'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoCalendarOutline className="w-4 h-4" />
                                    Tanggal Follow-up <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <input
                                    type="date"
                                    value={editFormData.followUpDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, followUpDate: e.target.value })}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoDocumentText className="w-4 h-4" />
                                    Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    disabled={isSubmitting}
                                    rows={3}
                                    placeholder="Tambahkan catatan tambahan..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <IoCloudUpload className="w-4 h-4" />
                                    Bukti Tindakan <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <MultiFileUpload
                                    label=""
                                    placeholder="Upload foto atau dokumen bukti tindakan"
                                    value={editFormData.evidenceUrls}
                                    onChange={(urls) => setEditFormData({ ...editFormData, evidenceUrls: urls })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Timeline
