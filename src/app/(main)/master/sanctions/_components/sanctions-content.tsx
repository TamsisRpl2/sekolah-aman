'use client'

import { useState, useEffect } from 'react'

interface SanctionType {
    id: string
    name: string
    description?: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export default function SanctionsContent() {
    const [sanctionTypes, setSanctionTypes] = useState<SanctionType[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

const [showModal, setShowModal] = useState(false)
    const [editingSanction, setEditingSanction] = useState<SanctionType | null>(null)

const [form, setForm] = useState({
        name: '',
        description: '',
        isActive: true
    })

const fetchSanctionTypes = async () => {
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)

            const res = await fetch(`/api/master/sanction-types?${params}`)
            if (res.ok) {
                const data = await res.json()
                setSanctionTypes(data.sanctionTypes || [])
            }
        } catch (error) {
            console.error('Error fetching sanction types:', error)
            setSanctionTypes([])
        }
    }

useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await fetchSanctionTypes()
            setLoading(false)
        }
        loadData()
    }, [])

useEffect(() => {
        if (!loading) {
            fetchSanctionTypes()
        }
    }, [searchTerm])

const handleCreate = () => {
        setEditingSanction(null)
        setForm({
            name: '',
            description: '',
            isActive: true
        })
        setShowModal(true)
    }

    const handleEdit = (sanctionType: SanctionType) => {
        setEditingSanction(sanctionType)
        setForm({
            name: sanctionType.name,
            description: sanctionType.description || '',
            isActive: sanctionType.isActive
        })
        setShowModal(true)
    }

    const handleDelete = async (sanctionId: string, sanctionName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus jenis sanksi "${sanctionName}"?`)) {
            return
        }

        try {
            const res = await fetch(`/api/master/sanction-types/${sanctionId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                alert('Jenis sanksi berhasil dihapus')
                await fetchSanctionTypes()
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal menghapus jenis sanksi')
            }
        } catch (error) {
            console.error('Error deleting sanction type:', error)
            alert('Terjadi kesalahan saat menghapus jenis sanksi')
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingSanction 
                ? `/api/master/sanction-types/${editingSanction.id}`
                : '/api/master/sanction-types'
            
            const method = editingSanction ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            if (res.ok) {
                alert(editingSanction ? 'Jenis sanksi berhasil diupdate' : 'Jenis sanksi berhasil ditambahkan')
                setShowModal(false)
                await fetchSanctionTypes()
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal menyimpan jenis sanksi')
            }
        } catch (error) {
            console.error('Error saving sanction type:', error)
            alert('Terjadi kesalahan saat menyimpan jenis sanksi')
        }
    }

    const filteredSanctions = sanctionTypes.filter(sanction =>
        sanction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sanction.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Master Jenis Sanksi</h1>
                    <p className="text-base-content/60">Kelola jenis sanksi untuk pelanggaran</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={handleCreate}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Jenis Sanksi
                </button>
            </div>

            {}
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div className="stat-title">Total Jenis Sanksi</div>
                    <div className="stat-value">{sanctionTypes.length}</div>
                    <div className="stat-desc">Tersedia dalam sistem</div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-success">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="stat-title">Sanksi Aktif</div>
                    <div className="stat-value text-success">{sanctionTypes.filter(s => s.isActive).length}</div>
                    <div className="stat-desc">Dapat dipilih</div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-error">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="stat-title">Sanksi Nonaktif</div>
                    <div className="stat-value text-error">{sanctionTypes.filter(s => !s.isActive).length}</div>
                    <div className="stat-desc">Tidak dapat dipilih</div>
                </div>
            </div>

            {}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Cari Jenis Sanksi</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan nama atau deskripsi sanksi..."
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {filteredSanctions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Sanksi</th>
                                        <th>Deskripsi</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSanctions.map((sanction, index) => (
                                        <tr key={sanction.id}>
                                            <td>{index + 1}</td>
                                            <td className="font-medium">{sanction.name}</td>
                                            <td>
                                                {sanction.description ? (
                                                    <span className="text-sm">{sanction.description}</span>
                                                ) : (
                                                    <span className="text-base-content/50 italic">Tidak ada deskripsi</span>
                                                )}
                                            </td>
                                            <td>
                                                {sanction.isActive ? (
                                                    <div className="badge badge-success">Aktif</div>
                                                ) : (
                                                    <div className="badge badge-error">Nonaktif</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => handleEdit(sanction)}
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-error btn-ghost"
                                                        onClick={() => handleDelete(sanction.id, sanction.name)}
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <p className="text-base-content/50">
                                {searchTerm ? 'Tidak ditemukan jenis sanksi' : 'Belum ada jenis sanksi'}
                            </p>
                            {!searchTerm && (
                                <button 
                                    className="btn btn-primary btn-sm mt-4"
                                    onClick={handleCreate}
                                >
                                    Tambah Jenis Sanksi Pertama
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {editingSanction ? 'Edit Jenis Sanksi' : 'Tambah Jenis Sanksi'}
                        </h3>
                        
                        <form onSubmit={handleSave}>
                            <div className="space-y-4">
                                {}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Nama Sanksi *</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Contoh: Teguran Lisan"
                                        required
                                    />
                                </div>

                                {}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Deskripsi</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered"
                                        value={form.description}
                                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Deskripsi detail sanksi (opsional)"
                                    />
                                </div>

                                {}
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text">Status Aktif</span>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSanction ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
