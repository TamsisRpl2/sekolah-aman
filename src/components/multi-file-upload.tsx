'use client'

import { useState, useRef } from 'react'
import { IoCloudUpload, IoDocument, IoImage, IoClose, IoCheckmarkCircle, IoAdd } from 'react-icons/io5'

interface FileUploadedData {
  url: string
  fileName: string
  fileSize: number
  fileType: string
}

interface MultiFileUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  label?: string
  placeholder?: string
  required?: boolean
}

const MultiFileUpload = ({ 
  value = [], 
  onChange, 
  accept = "image/*,application/pdf",
  maxSize = 10,
  maxFiles = 5,
  label = "Upload Files",
  placeholder = "Upload bukti/evidence (gambar atau PDF)",
  required = false 
}: MultiFileUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadedData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <IoImage className="w-5 h-5 text-blue-500" />
    }
    return <IoDocument className="w-5 h-5 text-red-500" />
  }

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return

    // Check if adding files would exceed max limit
    if (value.length + files.length > maxFiles) {
      alert(`Maksimal ${maxFiles} file. Anda sudah memiliki ${value.length} file.`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File ${file.name} terlalu besar. Maksimal ${maxSize}MB.`)
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Upload failed for ${file.name}`)
        }

        return await response.json() as FileUploadedData
      })

      const results = await Promise.all(uploadPromises)
      
      const newUrls = [...value, ...results.map(r => r.url)]
      const newFiles = [...uploadedFiles, ...results]
      
      setUploadedFiles(newFiles)
      onChange(newUrls)

    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload file: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    
    setUploadedFiles(newFiles)
    onChange(newUrls)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = value.length < maxFiles

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        <span className="label-text-alt text-gray-500">
          {value.length}/{maxFiles} file(s)
        </span>
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload area - only show if can add more files */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-3 ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="loading loading-spinner loading-lg text-blue-500"></div>
              <p className="text-sm text-gray-600">Uploading files...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <IoCloudUpload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">{placeholder}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag & drop atau klik untuk pilih file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max {maxSize}MB per file • Maksimal {maxFiles} file • Gambar atau PDF
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded files display */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => {
            const file = uploadedFiles[index]
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    {file && getFileIcon(file.fileType)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file ? file.fileName : `File ${index + 1}`}
                      </p>
                      {file && (
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Lihat
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus file"
                    >
                      <IoClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add more button when files exist but can add more */}
      {value.length > 0 && canAddMore && (
        <button
          type="button"
          onClick={openFileDialog}
          className="btn btn-sm btn-outline mt-3"
          disabled={uploading}
        >
          <IoAdd className="w-4 h-4" />
          Tambah File Lagi ({maxFiles - value.length} tersisa)
        </button>
      )}

      {/* Max files reached message */}
      {!canAddMore && (
        <div className="text-xs text-gray-500 mt-2">
          Maksimal {maxFiles} file tercapai
        </div>
      )}
    </div>
  )
}

export default MultiFileUpload
