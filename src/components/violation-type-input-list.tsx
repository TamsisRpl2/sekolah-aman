'use client'

import { IoAdd, IoTrash } from 'react-icons/io5'

interface ViolationTypeInputListProps {
    types: string[]
    onTypesChange: (types: string[]) => void
    disabled?: boolean
    className?: string
}

export default function ViolationTypeInputList({
    types,
    onTypesChange,
    disabled = false,
    className = ''
}: ViolationTypeInputListProps) {

    const addType = () => {
        onTypesChange([...types, ''])
    }

    const removeType = (index: number) => {
        const newTypes = types.filter((_, i) => i !== index)
        onTypesChange(newTypes)
    }

    const updateType = (index: number, value: string) => {
        const newTypes = [...types]
        newTypes[index] = value
        onTypesChange(newTypes)
    }

    // Ensure at least one input exists
    const typesList = types.length === 0 ? [''] : types

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-slate-700">Tipe Pelanggaran *</label>
            
            <div className="space-y-3">
                {typesList.map((type, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="input bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200 flex-1"
                            placeholder={`Tipe ${index + 1} (contoh: Membawa HP ke sekolah)`}
                            value={type}
                            onChange={(e) => updateType(index, e.target.value)}
                            disabled={disabled}
                        />
                        
                        {/* Remove button - only show if more than 1 input */}
                        {typesList.length > 1 && (
                            <button
                                type="button"
                                className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                                onClick={() => removeType(index)}
                                disabled={disabled}
                                title="Hapus tipe"
                            >
                                <IoTrash className="w-4 h-4 text-red-500" />
                            </button>
                        )}
                        
                        {/* Add button - only show on last input */}
                        {index === typesList.length - 1 && (
                            <button
                                type="button"
                                className="w-10 h-10 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors duration-200"
                                onClick={addType}
                                disabled={disabled}
                                title="Tambah tipe"
                            >
                                <IoAdd className="w-4 h-4 text-blue-600" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="text-xs text-slate-500 mt-1">
                Contoh: Membawa HP ke sekolah, Menggunakan HP saat pelajaran, HP berbunyi di kelas
            </div>
        </div>
    )
}
