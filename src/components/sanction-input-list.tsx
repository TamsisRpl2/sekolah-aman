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
        <div className={`form-control ${className}`}>
            <label className="label">
                <span className="label-text">Jenis Sanksi *</span>
            </label>
            
            <div className="space-y-3">
                {sanctionsList.map((sanction, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder={`Sanksi ${index + 1} (contoh: Teguran Lisan)`}
                            value={sanction}
                            onChange={(e) => updateSanction(index, e.target.value)}
                            disabled={disabled}
                        />
                        
                        {/* Remove button - only show if more than 1 input */}
                        {sanctionsList.length > 1 && (
                            <button
                                type="button"
                                className="btn btn-square btn-outline btn-error btn-sm"
                                onClick={() => removeSanction(index)}
                                disabled={disabled}
                                title="Hapus sanksi"
                            >
                                <IoTrash className="w-4 h-4" />
                            </button>
                        )}
                        
                        {/* Add button - only show on last input */}
                        {index === sanctionsList.length - 1 && (
                            <button
                                type="button"
                                className="btn btn-square btn-outline btn-primary btn-sm"
                                onClick={addSanction}
                                disabled={disabled}
                                title="Tambah sanksi"
                            >
                                <IoAdd className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="label">
                <span className="label-text-alt text-gray-500">
                    Contoh: Teguran Lisan, Surat Peringatan, Skorsing 3 Hari
                </span>
            </div>
        </div>
    )
}
