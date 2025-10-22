'use client'

import { useState } from 'react'
import { IoAdd, IoTrash } from 'react-icons/io5'

interface SanctionInputListProps {
    sanctions: string[]
    onSanctionsChange: (sanctions: string[]) => void
    disabled?: boolean
    className?: string
}

export default function SanctionInputList({
    sanctions,
    onSanctionsChange,
    disabled = false,
    className = ''
}: SanctionInputListProps) {

    const addSanction = () => {
        onSanctionsChange([...sanctions, ''])
    }

    const removeSanction = (index: number) => {
        const newSanctions = sanctions.filter((_, i) => i !== index)
        onSanctionsChange(newSanctions)
    }

    const updateSanction = (index: number, value: string) => {
        const newSanctions = [...sanctions]
        newSanctions[index] = value
        onSanctionsChange(newSanctions)
    }

    // Ensure at least one input exists
    const sanctionsList = sanctions.length === 0 ? [''] : sanctions

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-slate-700">Jenis Sanksi *</label>
            
            <div className="space-y-3">
                {sanctionsList.map((sanction, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 flex-1"
                            placeholder={`Sanksi ${index + 1} (contoh: Teguran Lisan)`}
                            value={sanction}
                            onChange={(e) => updateSanction(index, e.target.value)}
                            disabled={disabled}
                        />
                        
                        {/* Remove button - only show if more than 1 input */}
                        {sanctionsList.length > 1 && (
                            <button
                                type="button"
                                className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                                onClick={() => removeSanction(index)}
                                disabled={disabled}
                                title="Hapus sanksi"
                            >
                                <IoTrash className="w-4 h-4 text-red-500" />
                            </button>
                        )}
                        
                        {/* Add button - only show on last input */}
                        {index === sanctionsList.length - 1 && (
                            <button
                                type="button"
                                className="w-10 h-10 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors duration-200"
                                onClick={addSanction}
                                disabled={disabled}
                                title="Tambah sanksi"
                            >
                                <IoAdd className="w-4 h-4 text-blue-600" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="text-xs text-slate-500 mt-1">
                Contoh: Teguran Lisan, Surat Peringatan, Skorsing 3 Hari
            </div>
        </div>
    )
}
