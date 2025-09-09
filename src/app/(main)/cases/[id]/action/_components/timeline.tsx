'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useCase } from '@/lib/hooks/useCases'
import { CaseAction, CaseActionWithSanction } from '@/types/cases'
import { IoCheckmarkCircle, IoTime, IoCalendar, IoDocument, IoPerson, IoImage, IoLink, IoWarning, IoCreate, IoTrash, IoEllipsisVertical } from 'react-icons/io5'
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
            return <span className="badge badge-warning badge-sm">Ringan</span>
        case 'SEDANG':
            return <span className="badge badge-info badge-sm">Sedang</span>
        case 'BERAT':
            return <span className="badge badge-error badge-sm">Berat</span>
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
        refetch() // Refresh timeline data
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
                refetch() // Refresh case data
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
            <div className="flex justify-center items-center h-32">
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
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoDocument className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tindakan</h3>
                <p className="text-gray-600">Tindakan yang dilakukan untuk kasus ini akan ditampilkan di sini.</p>
            </div>
        )
    }

    const sortedActions = [...caseData.actions]
        .filter(action => !action.deletedAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Tindakan</h3>
            
            <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                {sortedActions.map((action: CaseActionWithSanction, index) => (
                    <li key={action.id}>
                        {index > 0 && <hr />}
                        <div className="timeline-middle">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                action.isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                                {getActionIcon(action, action.isCompleted)}
                            </div>
                        </div>
                        <div className={`${index % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'} mb-10`}>
                            <div className="flex items-center justify-between mb-2">
                                <time className="font-mono italic text-sm text-gray-500">
                                    {new Date(action.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </time>
                                
                                {canEditAction(action) && (
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                                            <IoEllipsisVertical className="w-4 h-4" />
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                            <li>
                                                <button 
                                                    onClick={() => handleEditAction(action.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <IoCreate className="w-4 h-4" />
                                                    Edit Tindakan
                                                </button>
                                            </li>
                                            <li>
                                                <button 
                                                    onClick={() => handleDeleteAction(action.id)}
                                                    className="text-red-600 hover:text-red-800"
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
                            <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {getActionTypeLabel(action)}
                                {action.isCompleted && (
                                    <span className="badge badge-success badge-sm text-white">Selesai</span>
                                )}
                                {action.sanctionType?.level && getLevelBadge(action.sanctionType.level)}
                            </div>
                            
                            {action.sanctionType?.description && (
                                <p className="text-sm text-gray-600 mt-1">{action.sanctionType.description}</p>
                            )}
                            
                            {action.sanctionType?.duration && (
                                <p className="text-sm text-orange-600 mt-1">
                                    <IoTime className="w-4 h-4 inline mr-1" />
                                    Durasi: {action.sanctionType.duration} hari
                                </p>
                            )}
                            
                            <p className="text-gray-700 mt-1">{action.description}</p>
                            
                            {action.followUpDate && (
                                <div className="mt-2 text-sm text-blue-600">
                                    <IoCalendar className="w-4 h-4 inline mr-1" />
                                    Follow-up: {new Date(action.followUpDate).toLocaleDateString('id-ID')}
                                </div>
                            )}
                            
                            {action.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <strong>Catatan:</strong> {action.notes}
                                </div>
                            )}
                            
                            {action.evidenceUrls && action.evidenceUrls.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Bukti Tindakan:</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {action.evidenceUrls.map((url, idx) => {
                                            const isImage = url.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                                            return (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                                                >
                                                    {isImage ? (
                                                        <IoImage className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    ) : (
                                                        <IoDocument className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                    )}
                                                    <span className="truncate text-gray-700">
                                                        {isImage ? 'Gambar' : 'Dokumen'} {idx + 1}
                                                    </span>
                                                    <IoLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-500">
                                <div>Ditambahkan oleh: {action.actionBy?.name || 'Unknown'}</div>
                                {action.editedBy && action.editedAt && (
                                    <div className="text-orange-600 mt-1">
                                        Diedit oleh: {action.editedBy.name} pada {new Date(action.editedAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        {index < sortedActions.length - 1 && <hr />}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Timeline