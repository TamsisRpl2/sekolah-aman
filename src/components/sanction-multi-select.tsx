'use client'

import { useState, useEffect } from 'react'

interface SanctionType {
    id: string
    name: string
    description: string | null
    isActive: boolean
}

interface SanctionMultiSelectProps {
    selectedSanctions: string[]
    onSelectionChange: (sanctionIds: string[]) => void
    disabled?: boolean
    className?: string
}

export default function SanctionMultiSelect({
    selectedSanctions,
    onSelectionChange,
    disabled = false,
    className = ''
}: SanctionMultiSelectProps) {
    const [sanctionTypes, setSanctionTypes] = useState<SanctionType[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchSanctionTypes()
    }, [])

    const fetchSanctionTypes = async () => {
        try {
            const res = await fetch('/api/master/sanction-types?isActive=true')
            if (res.ok) {
                const data = await res.json()
                setSanctionTypes(data.sanctionTypes || [])
            }
        } catch (error) {
            console.error('Error fetching sanction types:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredSanctions = sanctionTypes.filter(sanction =>
        sanction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sanction.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedSanctionNames = sanctionTypes
        .filter(s => selectedSanctions.includes(s.id))
        .map(s => s.name)

    const handleToggleSelection = (sanctionId: string) => {
        if (selectedSanctions.includes(sanctionId)) {
            onSelectionChange(selectedSanctions.filter(id => id !== sanctionId))
        } else {
            onSelectionChange([...selectedSanctions, sanctionId])
        }
    }

    const handleSelectAll = () => {
        const allIds = filteredSanctions.map(s => s.id)
        onSelectionChange(allIds)
    }

    const handleDeselectAll = () => {
        onSelectionChange([])
    }

    if (loading) {
        return (
            <div className={`form-control ${className}`}>
                <label className="label">
                    <span className="label-text">Jenis Sanksi</span>
                </label>
                <div className="skeleton h-12 w-full"></div>
            </div>
        )
    }

    return (
        <div className={`form-control ${className}`}>
            <label className="label">
                <span className="label-text">Jenis Sanksi</span>
            </label>
            
            <div className="dropdown dropdown-bottom w-full">
                <div
                    tabIndex={0}
                    role="button"
                    className={`btn btn-outline w-full justify-between ${disabled ? 'btn-disabled' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className="text-left flex-1 truncate">
                        {selectedSanctions.length === 0 
                            ? 'Pilih jenis sanksi...'
                            : selectedSanctions.length === 1
                            ? selectedSanctionNames[0]
                            : `${selectedSanctions.length} sanksi dipilih`
                        }
                    </span>
                    <svg 
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                
                {isOpen && !disabled && (
                    <div className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-64 overflow-y-auto border">
                        {/* Search */}
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Cari sanksi..."
                                className="input input-sm input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Select All/None */}
                        <div className="p-2 border-b flex gap-2">
                            <button
                                type="button"
                                className="btn btn-xs btn-primary"
                                onClick={handleSelectAll}
                            >
                                Pilih Semua
                            </button>
                            <button
                                type="button"
                                className="btn btn-xs btn-outline"
                                onClick={handleDeselectAll}
                            >
                                Batal Semua
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-1">
                            {filteredSanctions.length === 0 ? (
                                <div className="p-4 text-center text-base-content/50">
                                    {searchTerm ? 'Tidak ditemukan sanksi' : 'Belum ada jenis sanksi'}
                                </div>
                            ) : (
                                filteredSanctions.map((sanction) => (
                                    <label 
                                        key={sanction.id}
                                        className="flex items-start gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm mt-0.5"
                                            checked={selectedSanctions.includes(sanction.id)}
                                            onChange={() => handleToggleSelection(sanction.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{sanction.name}</div>
                                            {sanction.description && (
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    {sanction.description}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected sanctions display */}
            {selectedSanctions.length > 0 && (
                <div className="mt-2">
                    <div className="text-xs text-base-content/60 mb-1">Sanksi yang dipilih:</div>
                    <div className="flex flex-wrap gap-1">
                        {selectedSanctionNames.map((name, index) => (
                            <div key={index} className="badge badge-primary badge-sm">
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
