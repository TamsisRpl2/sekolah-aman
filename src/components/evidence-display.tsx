'use client'

import { IoImage, IoDocument, IoLink } from 'react-icons/io5'

interface EvidenceDisplayProps {
  evidenceUrls: string[]
  title?: string
  className?: string
  gridCols?: 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4'
}

const EvidenceDisplay = ({ 
  evidenceUrls, 
  title = "Bukti/Evidence", 
  className = "",
  gridCols = "grid-cols-3"
}: EvidenceDisplayProps) => {
  if (!evidenceUrls || evidenceUrls.length === 0) {
    return null
  }

  const getFileName = (url: string) => {
    try {
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      return fileName.split('-').slice(1).join('-') || fileName
    } catch {
      return 'File'
    }
  }

  const isImageFile = (url: string) => {
    return url.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-700 mb-3">{title}:</div>
      <div className={`grid ${gridCols} gap-3`}>
        {evidenceUrls.map((url, index) => {
          const isImage = isImageFile(url)
          const fileName = getFileName(url)
          
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              {isImage ? (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <IoLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors flex flex-col items-center justify-center p-3 text-center">
                  <IoDocument className="w-12 h-12 text-red-500 mb-2" />
                  <span className="text-xs text-gray-600 break-words line-clamp-3">
                    {fileName}
                  </span>
                  <IoLink className="w-4 h-4 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </a>
          )
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {evidenceUrls.length} file(s) • Klik untuk melihat detail
      </div>
    </div>
  )
}

export default EvidenceDisplay
