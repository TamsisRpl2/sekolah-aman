'use client'

import { useState } from 'react'
import { ViolationCategory, Violation, ViolationStats } from '@/types/violation'
import SanctionInputList from '@/components/sanction-input-list'
import ViolationTypeInputList from '@/components/violation-type-input-list'
import { 
    IoWarning, 
    IoAdd, 
    IoSearch, 
    IoFilter, 
    IoRefresh,
    IoChevronDown,
    IoCreate,
    IoTrash,
    IoDocument,
    IoStatsChart,
    IoCheckmarkCircle,
    IoAlertCircle
} from 'react-icons/io5'
import { 
    createViolation, 
    updateViolation, 
    deleteViolation,
    createViolationCategory,
    updateViolationCategory,
    deleteViolationCategory
} from '../actions'


type ViolationsContentProps = {
    categories: ViolationCategory[]
    violations: Violation[]
    stats: ViolationStats
    searchTerm: string
    selectedLevel: string
    selectedCategory: string
    onSearchTermChange: (v: string) => void
    onSelectedLevelChange: (v: string) => void
    onSelectedCategoryChange: (v: string) => void
    onResetFilters: () => void
    onRefresh: () => void
}

export default function ViolationsContent({
    categories,
    violations,
    stats,
    searchTerm,
    selectedLevel,
    selectedCategory,
    onSearchTermChange,
    onSelectedLevelChange,
    onSelectedCategoryChange,
    onResetFilters,
    onRefresh
}: ViolationsContentProps) {
        const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
        const [showViolationModal, setShowViolationModal] = useState(false)
        const [showCategoryModal, setShowCategoryModal] = useState(false)
        const [editingViolation, setEditingViolation] = useState<Violation | null>(null)
        const [editingCategory, setEditingCategory] = useState<ViolationCategory | null>(null)
        const [violationForm, setViolationForm] = useState({
                categoryId: '',
                code: '',
                name: '',
                types: [] as string[],
                sanctions: [] as string[],
                points: 'SP 1'
        })
        const [categoryForm, setCategoryForm] = useState({
                code: '',
                name: '',
                level: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT',
                description: '',
                isActive: true
        })


    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    const handleCreateViolation = () => {
        setEditingViolation(null)
        setViolationForm({
            categoryId: '',
            code: '',
            name: '',
            types: [],
            sanctions: [],
            points: 'SP 1'
        })
        setShowViolationModal(true)
    }

    const handleEditViolation = (violation: Violation) => {
        setEditingViolation(violation)
        setViolationForm({
            categoryId: violation.categoryId,
            code: violation.code,
            name: violation.name,
            types: violation.violationTypes?.map(vt => vt.description) || [],
            sanctions: violation.sanctionTypes?.map(st => st.sanctionType.name) || [],
            points: violation.points
        })
        setShowViolationModal(true)
    }

    const handleDeleteViolation = async (violationId: string, violationName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus pelanggaran "${violationName}"?`)) {
            return
        }

        try {
            await deleteViolation(violationId)
            alert('Pelanggaran berhasil dihapus')
            onRefresh()
        } catch (error) {
            console.error('Error deleting violation:', error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus pelanggaran')
        }
    }

    const handleSaveViolation = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingViolation) {
                await updateViolation(editingViolation.id, violationForm)
                alert('Pelanggaran berhasil diupdate')
            } else {
                await createViolation(violationForm)
                alert('Pelanggaran berhasil ditambahkan')
            }
            setShowViolationModal(false)
            onRefresh()
        } catch (error) {
            console.error('Error saving violation:', error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan pelanggaran')
        }
    }

    const handleCreateCategory = () => {
        setEditingCategory(null)
        setCategoryForm({
            code: '',
            name: '',
            level: 'RINGAN',
            description: '',
            isActive: true
        })
        setShowCategoryModal(true)
    }

    const handleEditCategory = (category: ViolationCategory) => {
        setEditingCategory(category)
        setCategoryForm({
            code: category.code,
            name: category.name,
            level: category.level,
            description: category.description || '',
            isActive: category.isActive
        })
        setShowCategoryModal(true)
    }

    const handleDeleteCategory = async (categoryId: string, categoryName: string, forceDelete = false) => {
        const confirmMessage = forceDelete 
            ? `Apakah Anda yakin ingin MENGHAPUS PERMANEN kategori "${categoryName}"? Semua pelanggaran dalam kategori ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`
            
        if (!confirm(confirmMessage)) {
            return
        }

        try {
            await deleteViolationCategory(categoryId, forceDelete)
            alert('Kategori berhasil dihapus')
            onRefresh()
        } catch (error: any) {
            console.error('Error deleting category:', error)
            
            // Check if error is about violations still exist
            if (error.message.includes('masih digunakan')) {
                const forceConfirm = confirm(
                    `${error.message}\n\nApakah Anda ingin menghapus secara permanen? Klik OK untuk hapus permanen, atau Cancel untuk membatalkan.`
                )
                
                if (forceConfirm) {
                    await handleDeleteCategory(categoryId, categoryName, true)
                    return
                }
            } else {
                alert(error.message || 'Terjadi kesalahan saat menghapus kategori')
            }
        }
    }

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingCategory) {
                await updateViolationCategory(editingCategory.id, categoryForm)
                alert('Kategori berhasil diupdate')
            } else {
                await createViolationCategory(categoryForm)
                alert('Kategori berhasil ditambahkan')
            }
            setShowCategoryModal(false)
            onRefresh()
        } catch (error) {
            console.error('Error saving category:', error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan kategori')
        }
    }

    const getTingkatBadge = (tingkat: string) => {
        switch (tingkat.toLowerCase()) {
            case 'ringan':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Ringan</span>
            case 'sedang':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Sedang</span>
            case 'berat':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Berat</span>
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{tingkat}</span>
        }
    }

    const getViolationsByCategory = (categoryId: string) => {
        return violations.filter(v => v.categoryId === categoryId)
    }





    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Master Pelanggaran
                    </h1>
                    <p className="text-slate-600">Kelola jenis pelanggaran dan kategori untuk sistem tata tertib</p>
                </div>
                <button 
                    className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    onClick={onRefresh}
                >
                    <IoRefresh className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.totalViolations}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Pelanggaran</p>
                            <p className="text-xs text-slate-500 mt-1">Jenis pelanggaran tersedia</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoDocument className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.violationsByLevel.ringan}</p>
                            <p className="text-sm text-slate-600 mt-1">Pelanggaran Ringan</p>
                            <p className="text-xs text-emerald-600 mt-1">Level ringan</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoCheckmarkCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.violationsByLevel.sedang}</p>
                            <p className="text-sm text-slate-600 mt-1">Pelanggaran Sedang</p>
                            <p className="text-xs text-yellow-600 mt-1">Level sedang</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoAlertCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.violationsByLevel.berat}</p>
                            <p className="text-sm text-slate-600 mt-1">Pelanggaran Berat</p>
                            <p className="text-xs text-red-600 mt-1">Level berat</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoWarning className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <IoFilter className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Filter & Pencarian</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Cari Pelanggaran</label>
                        <div className="relative">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Masukkan nama pelanggaran..."
                                className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 pl-10 w-full"
                                value={searchTerm}
                                onChange={(e) => onSearchTermChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Filter Level</label>
                        <select
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                            value={selectedLevel}
                            onChange={(e) => onSelectedLevelChange(e.target.value)}
                        >
                            <option value="">Semua Level</option>
                            <option value="RINGAN">Ringan</option>
                            <option value="SEDANG">Sedang</option>
                            <option value="BERAT">Berat</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Filter Kategori</label>
                        <select
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                            value={selectedCategory}
                            onChange={(e) => onSelectedCategoryChange(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {Array.isArray(categories) && categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">&nbsp;</label>
                        <button
                            className="btn bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl w-full"
                            onClick={onResetFilters}
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <IoStatsChart className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Pelanggaran</h3>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            className="btn bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            onClick={handleCreateCategory}
                        >
                            <IoAdd className="w-4 h-4" />
                            Tambah Kategori
                        </button>
                        <button 
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            onClick={handleCreateViolation}
                        >
                            <IoAdd className="w-4 h-4" />
                            Tambah Pelanggaran
                        </button>
                    </div>
                </div>

                {Array.isArray(categories) && categories.map((category) => {
                    const categoryViolations = getViolationsByCategory(category.id)
                    const isExpanded = expandedCategories.has(category.id)

                    return (
                        <div
                            key={category.id}
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div
                                className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50/50 transition-colors duration-200"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-slate-800 mb-1">{category.name}</h4>
                                            <p className="text-sm text-slate-600 mb-3">{category.description}</p>
                                            <div className="flex items-center gap-3">
                                                {getTingkatBadge(category.level)}
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {categoryViolations.length} pelanggaran
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="w-10 h-10 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors duration-200"
                                                onClick={() => handleEditCategory(category)}
                                                title="Edit Kategori"
                                            >
                                                <IoCreate className="w-4 h-4 text-blue-600" />
                                            </button>
                                            <button
                                                className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                                title="Hapus Kategori"
                                            >
                                                <IoTrash className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-200 ml-4 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <IoChevronDown className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-6 pb-6">
                                    <div className="space-y-3">
                                        {categoryViolations.length > 0 ? (
                                            categoryViolations.map((violation) => (
                                                <div
                                                    key={violation.id}
                                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-slate-800 mb-1">{violation.name}</h5>
                                                            
                                                            {/* Display Violation Types */}
                                                            {violation.violationTypes && violation.violationTypes.length > 0 && (
                                                                <div className="text-sm text-slate-600 mb-3">
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        {violation.violationTypes.map((vt) => (
                                                                            <li key={vt.id}>{vt.description}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex gap-2 mb-2">
                                                                {getTingkatBadge(violation.category?.level || 'RINGAN')}
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                                    {violation.points}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Display Sanction Types */}
                                                            {violation.sanctionTypes && violation.sanctionTypes.length > 0 && (
                                                                <div className="text-xs mt-2 flex flex-wrap gap-1">
                                                                    <span className="text-slate-500">Sanksi:</span>
                                                                    {violation.sanctionTypes.map((st) => (
                                                                        <span key={st.sanctionTypeId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                                            {st.sanctionType.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                className="w-10 h-10 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors duration-200"
                                                                onClick={() => handleEditViolation(violation)}
                                                                title="Edit Pelanggaran"
                                                            >
                                                                <IoCreate className="w-4 h-4 text-blue-600" />
                                                            </button>
                                                            <button
                                                                className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                                                                onClick={() => handleDeleteViolation(violation.id, violation.name)}
                                                                title="Hapus Pelanggaran"
                                                            >
                                                                <IoTrash className="w-4 h-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <IoDocument className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                                <p className="text-slate-400">Tidak ada pelanggaran dalam kategori ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {categories.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/20 text-center">
                        <IoDocument className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">Belum Ada Kategori</h3>
                        <p className="text-slate-600 mb-6">Mulai dengan membuat kategori pelanggaran pertama</p>
                        <button
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            onClick={handleCreateCategory}
                        >
                            <IoAdd className="w-4 h-4 mr-2" />
                            Tambah Kategori Pertama
                        </button>
                    </div>
                )}
            </div>

            {showViolationModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl bg-white rounded-2xl shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <IoDocument className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingViolation ? 'Edit Pelanggaran' : 'Tambah Pelanggaran'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSaveViolation} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Kategori *</label>
                                    <select
                                        className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={violationForm.categoryId}
                                        onChange={(e) => setViolationForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {Array.isArray(categories) && categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} ({category.level})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Kode *</label>
                                    <input
                                        type="text"
                                        className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={violationForm.code}
                                        onChange={(e) => setViolationForm(prev => ({ ...prev, code: e.target.value }))}
                                        placeholder="Contoh: 1.A"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nama Pelanggaran *</label>
                                    <input
                                        type="text"
                                        className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={violationForm.name}
                                        onChange={(e) => setViolationForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nama pelanggaran"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <ViolationTypeInputList
                                        types={violationForm.types}
                                        onTypesChange={(types: string[]) => 
                                            setViolationForm(prev => ({ ...prev, types }))
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <SanctionInputList
                                        sanctions={violationForm.sanctions}
                                        onSanctionsChange={(sanctions: string[]) => 
                                            setViolationForm(prev => ({ ...prev, sanctions }))
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Poin Pelanggaran *</label>
                                    <select
                                        className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={violationForm.points}
                                        onChange={(e) => setViolationForm(prev => ({ ...prev, points: e.target.value }))}
                                        required
                                    >
                                        <option value="SP 1">SP 1 (Surat Peringatan 1)</option>
                                        <option value="SP 2">SP 2 (Surat Peringatan 2)</option>
                                        <option value="SP 3">SP 3 (Surat Peringatan 3)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    className="btn bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                                    onClick={() => setShowViolationModal(false)}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                >
                                    {editingViolation ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white rounded-2xl shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <IoStatsChart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSaveCategory} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Kode *</label>
                                    <input
                                        type="text"
                                        className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={categoryForm.code}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, code: e.target.value }))}
                                        placeholder="Contoh: PASAL_1"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nama Kategori *</label>
                                    <input
                                        type="text"
                                        className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nama kategori"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Level *</label>
                                    <select
                                        className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={categoryForm.level}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, level: e.target.value as 'RINGAN' | 'SEDANG' | 'BERAT' }))}
                                        required
                                    >
                                        <option value="RINGAN">Ringan</option>
                                        <option value="SEDANG">Sedang</option>
                                        <option value="BERAT">Berat</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                                    <textarea
                                        className="textarea bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 w-full"
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Deskripsi kategori"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={categoryForm.isActive}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <label className="text-sm font-medium text-slate-700">Status Aktif</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    className="btn bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                                    onClick={() => setShowCategoryModal(false)}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                >
                                    {editingCategory ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}