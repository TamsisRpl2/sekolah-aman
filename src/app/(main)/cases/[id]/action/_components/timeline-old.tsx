'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useCase } from '@/lib/hooks/useCases'
import { CaseAction, CaseActionWithSanction } from '@/types/cases'
import { IoCheckmarkCircle, IoTime, IoCalendar, IoDocument, IoPerson, IoImage, IoLink, IoWarning, IoCreate, IoTrash, IoEllipsisVertical, IoList } from 'react-icons/io5'
import { useSession } from 'next-auth/react'
import EditActionForm from './edit-action-form'

const getActionTypeLabel = (action: CaseActionWithSanction) => {
    if (action.sanctionType?.name) {
        return action.sanctionType.name
    }
    
    const types = {
        'TEGURAN_LISAN': 'Teguran Lisan',
        'TEGURAN_TERTULIS': 'Teguran Tertulis',
        'PERINGATAN': 'Surat Peringatan',
        'PANGGIL_ORTU': 'Panggil Orang Tua',
        'SKORSING': 'Skorsing',
        'PEMBINAAN': 'Pembinaan Khusus',
        'KONSELING': 'Konseling',
        'LAINNYA': 'Lainnya'
    }
    return types[action.actionType as keyof typeof types] || action.actionType
}

const getActionIcon = (action: CaseActionWithSanction, isCompleted: boolean) => {
    if (isCompleted) {
        return <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
    }
    
    if (action.sanctionType?.level) {
        switch (action.sanctionType.level) {
            case 'RINGAN':
                return <IoDocument className="w-5 h-5 text-yellow-600" />
            case 'SEDANG':
                return <IoWarning className="w-5 h-5 text-orange-600" />
            case 'BERAT':
                return <IoTime className="w-5 h-5 text-red-600" />
        }
    }
    
    switch (action.actionType) {
        case 'TEGURAN_LISAN':
        case 'TEGURAN_TERTULIS':
        case 'PERINGATAN':
            return <IoDocument className="w-5 h-5 text-orange-600" />
        case 'PANGGIL_ORTU':
            return <IoPerson className="w-5 h-5 text-blue-600" />
        case 'SKORSING':
        case 'PEMBINAAN':
            return <IoTime className="w-5 h-5 text-red-600" />
        case 'KONSELING':
            return <IoCalendar className="w-5 h-5 text-purple-600" />
        default:
            return <IoDocument className="w-5 h-5 text-gray-600" />
    }
}

const getLevelBadge = (level: string) => {
    switch (level) {
        case 'RINGAN':
            return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Ringan</span>
        case 'SEDANG':
            return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Sedang</span>
        case 'BERAT':
            return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Berat</span>
        default:
            return null
    }
}

const Timeline = () => {
    const params = useParams()
    const id = params.id as string
    const { data: session } = useSession()
    const { caseData, loading, error, refetch } = useCase(id)
    const [deletingActionId, setDeletingActionId] = useState<string | null>(null)
    const [editingActionId, setEditingActionId] = useState<string | null>(null)

    const handleEditAction = (actionId: string) => {
        setEditingActionId(actionId)
    }

    const handleCancelEdit = () => {
        setEditingActionId(null)
    }

    const handleSaveEdit = () => {
        setEditingActionId(null)
        refetch()
    }

    const handleDeleteAction = async (actionId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tindakan ini?')) {
            return
        }

        setDeletingActionId(actionId)
        try {
            const response = await fetch(`/api/cases/${id}/actions/${actionId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                alert('Tindakan berhasil dihapus')
                refetch()
            } else {
                const error = await response.json()
                alert(error.error || 'Gagal menghapus tindakan')
            }
        } catch (error) {
            console.error('Error deleting action:', error)
            alert('Terjadi kesalahan saat menghapus tindakan')
        } finally {
            setDeletingActionId(null)
        }
    }

    const canEditAction = (action: CaseActionWithSanction) => {
        if (!session?.user?.id) return false
        
        if (session.user.role === 'ADMIN') return true
        
        return action.actionBy?.id === session.user.id || action.createdBy?.id === session.user.id
    }

    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex justify-center items-center h-32">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat timeline...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <span>Error: {error}</span>
                </div>
            </div>
        )
    }

    if (editingActionId) {
        return (
            <EditActionForm
                actionId={editingActionId}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
            />
        )
    }

    if (!caseData || !caseData.actions || caseData.actions.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <IoList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800">Timeline Tindakan</h3>
                        <p className="text-sm text-slate-600">Riwayat tindakan yang dilakukan</p>
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IoDocument className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Belum Ada Tindakan</h3>
                    <p className="text-slate-600">Tindakan yang dilakukan untuk kasus ini akan ditampilkan di sini.</p>
                </div>
            </div>
        )
    }

    const sortedActions = [...caseData.actions]
        .filter(action => !action.deletedAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <IoList className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Timeline Tindakan</h3>
                    <p className="text-sm text-slate-600">Riwayat tindakan yang dilakukan</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {sortedActions.map((action: CaseActionWithSanction, index) => (
                    <div key={action.id} className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    action.isCompleted ? 'bg-green-100' : 'bg-slate-100'
                                }`}>
                                    {getActionIcon(action, action.isCompleted)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        {getActionTypeLabel(action)}
                                        {action.isCompleted && (
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Selesai</span>
                                        )}
                                        {action.sanctionType?.level && getLevelBadge(action.sanctionType.level)}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                        {new Date(action.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            
                            {canEditAction(action) && (
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <IoEllipsisVertical className="w-4 h-4" />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-white rounded-xl z-[1] w-52 p-2 shadow-lg border border-slate-200">
                                        <li>
                                            <button 
                                                onClick={() => handleEditAction(action.id)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                                            >
                                                <IoCreate className="w-4 h-4" />
                                                Edit Tindakan
                                            </button>
                                        </li>
                                        <li>
                                            <button 
                                                onClick={() => handleDeleteAction(action.id)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                                                disabled={deletingActionId === action.id}
                                            >
                                                {deletingActionId === action.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <IoTrash className="w-4 h-4" />
                                                )}
                                                Hapus Tindakan
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {action.sanctionType?.description && (
                            <p className="text-sm text-slate-600 mb-2">{action.sanctionType.description}</p>
                        )}
                        
                        {action.sanctionType?.duration && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                                <IoTime className="w-4 h-4" />
                                <span>Durasi: {action.sanctionType.duration} hari</span>
                            </div>
                        )}
                        
                        <p className="text-slate-700 mb-3">{action.description}</p>
                        
                        {action.followUpDate && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                                <IoCalendar className="w-4 h-4" />
                                <span>Follow-up: {new Date(action.followUpDate).toLocaleDateString('id-ID')}</span>
                            </div>
                        )}
                        
                        {action.notes && (
                            <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                                <strong>Catatan:</strong> {action.notes}
                            </div>
                        )}
                        
                        {action.evidenceUrls && action.evidenceUrls.length > 0 && (
                            <div className="mt-3">
                                <div className="text-sm font-medium text-slate-700 mb-2">Bukti Tindakan:</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {action.evidenceUrls.map((url, idx) => {
                                        const isImage = url.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                                        return (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-white hover:bg-slate-50 rounded-lg text-sm transition-colors border border-slate-200"
                                            >
                                                {isImage ? (
                                                    <IoImage className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                ) : (
                                                    <IoDocument className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                )}
                                                <span className="truncate text-slate-700">
                                                    {isImage ? 'Gambar' : 'Dokumen'} {idx + 1}
                                                </span>
                                                <IoLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="text-xs text-slate-500">
                                <div>Ditambahkan oleh: {action.actionBy?.name || 'Unknown'}</div>
                                {action.editedBy && action.editedAt && (
                                    <div className="text-orange-600 mt-1">
                                        Diubah oleh: {action.editedBy.name} pada {new Date(action.editedAt).toLocaleDateString('id-ID')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Timeline