'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CaseActionWithSanction } from '@/types/cases'
import { IoSave, IoArrowBack, IoCalendar, IoDocument, IoCheckmarkCircle } from 'react-icons/io5'

interface EditActionFormProps {
    actionId: string
    onSave: () => void
    onCancel: () => void
}

export default function EditActionForm({ actionId, onSave, onCancel }: EditActionFormProps) {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const caseId = params.id as string
    
    const [action, setAction] = useState<CaseActionWithSanction | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [sanctionTypes, setSanctionTypes] = useState<any[]>([])
    
    const [formData, setFormData] = useState({
        sanctionTypeId: '',
        description: '',
        followUpDate: '',
        isCompleted: false,
        notes: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                
                const actionResponse = await fetch(`/api/cases/${caseId}/actions/${actionId}`)
                if (actionResponse.ok) {
                    const actionData = await actionResponse.json()
                    setAction(actionData)
                    setFormData({
                        sanctionTypeId: actionData.sanctionTypeId || '',
                        description: actionData.description || '',
                        followUpDate: actionData.followUpDate ? 
                            new Date(actionData.followUpDate).toISOString().split('T')[0] : '',
                        isCompleted: actionData.isCompleted || false,
                        notes: actionData.notes || ''
                    })
                }
                
                const sanctionResponse = await fetch('/api/master/sanction-types')
                if (sanctionResponse.ok) {
                    const sanctionData = await sanctionResponse.json()
                    setSanctionTypes(sanctionData.sanctionTypes || [])
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                alert('Gagal memuat data tindakan')
            } finally {
                setLoading(false)
            }
        }

        if (actionId && caseId) {
            fetchData()
        }
    }, [actionId, caseId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.description.trim()) {
            alert('Deskripsi tindakan harus diisi')
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/cases/${caseId}/actions/${actionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    followUpDate: formData.followUpDate || null
                }),
            })

            if (response.ok) {
                alert('Tindakan berhasil diperbarui')
                onSave()
            } else {
                const error = await response.json()
                alert(error.error || 'Gagal memperbarui tindakan')
            }
        } catch (error) {
            console.error('Error updating action:', error)
            alert('Terjadi kesalahan saat memperbarui tindakan')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    if (!action) {
        return (
            <div className="alert alert-error">
                <span>Tindakan tidak ditemukan</span>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Edit Tindakan</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Dibuat pada: {new Date(action.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    {action.editedAt && (
                        <p className="text-sm text-orange-600 mt-1">
                            Terakhir diedit: {new Date(action.editedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })} oleh {action.editedBy?.name}
                        </p>
                    )}
                </div>
                <button
                    onClick={onCancel}
                    className="btn btn-ghost btn-sm"
                >
                    <IoArrowBack className="w-4 h-4" />
                    Kembali
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Jenis Sanksi *</span>
                    </label>
                    <select
                        className="select select-bordered"
                        value={formData.sanctionTypeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, sanctionTypeId: e.target.value }))}
                        required
                    >
                        <option value="">Pilih Jenis Sanksi</option>
                        {sanctionTypes.map((sanction) => (
                            <option key={sanction.id} value={sanction.id}>
                                {sanction.name} - {sanction.level}
                                {sanction.duration && ` (${sanction.duration} hari)`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Deskripsi Tindakan *</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered h-24"
                        placeholder="Jelaskan tindakan yang dilakukan..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Tanggal Follow-up</span>
                    </label>
                    <input
                        type="date"
                        className="input input-bordered"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Catatan Tambahan</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered h-20"
                        placeholder="Catatan tambahan..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                </div>

                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-success"
                            checked={formData.isCompleted}
                            onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.checked }))}
                        />
                        <div>
                            <span className="label-text font-medium">Tandai sebagai selesai</span>
                            <p className="text-sm text-gray-500">Centang jika tindakan ini sudah selesai dilaksanakan</p>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-ghost"
                        disabled={saving}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <IoSave className="w-4 h-4" />
                        )}
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
