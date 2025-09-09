'use client'

import { useState, useRef } from 'react'
import { IoCloudUpload, IoDocument, IoImage, IoClose, IoCheckmarkCircle } from 'react-icons/io5'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number
  label?: string
  placeholder?: string
  required?: boolean
}

interface UploadedFile {
  url: string
  fileName: string
  fileSize: number
  fileType: string
}

const FileUpload = ({ 
  value, 
  onChange, 
  accept = "image/*,application/pdf",
  maxSize = 10,
  label = "Upload File",
  placeholder = "Upload bukti/evidence (gambar atau PDF)",
  required = false 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
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

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File terlalu besar. Maksimal ${maxSize}MB.`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result: UploadedFile = await response.json()
      setUploadedFile(result)
      onChange(result.url)

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
      handleFileSelect(files[0])
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
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload area */}
      {!uploadedFile && !value && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
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
              <p className="text-sm text-gray-600">Uploading file...</p>
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
                  Max {maxSize}MB • Gambar atau PDF
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded file display */}
      {(uploadedFile || value) && (
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              {uploadedFile && getFileIcon(uploadedFile.fileType)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile ? uploadedFile.fileName : 'File uploaded'}
                </p>
                {uploadedFile && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.fileSize)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(uploadedFile?.url || value) && (
                <a
                  href={uploadedFile?.url || value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Lihat
                </a>
              )}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Hapus file"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace file button when file exists */}
      {(uploadedFile || value) && (
        <button
          type="button"
          onClick={openFileDialog}
          className="btn btn-sm btn-outline mt-2"
          disabled={uploading}
        >
          <IoCloudUpload className="w-4 h-4" />
          Ganti File
        </button>
      )}
    </div>
  )
}

export default FileUpload
