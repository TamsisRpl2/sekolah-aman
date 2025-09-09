'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface DynamicAvatarProps {
    userId?: string
    name?: string
    image?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const DynamicAvatar = ({ 
    userId, 
    name = '', 
    image, 
    size = 'md', 
    className = '' 
}: DynamicAvatarProps) => {
    const [currentImage, setCurrentImage] = useState<string | null>(image || null)
    const [imageError, setImageError] = useState(false)
    const [apiAvatarError, setApiAvatarError] = useState(false)

    // Size configurations
    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm', 
        lg: 'w-12 h-12 text-base',
        xl: 'w-24 h-24 text-xl'
    }

    // Update image when prop changes
    useEffect(() => {
        setCurrentImage(image || null)
        setImageError(false)
    }, [image])

    // Generate API avatar URL
    const generateApiAvatarUrl = (fullName: string) => {
        if (!fullName) return `https://avatar.iran.liara.run/username?username=User`
        const cleanName = fullName.trim().replace(/\s+/g, '+')
        return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(cleanName)}`
    }

    // Fallback initials (if API fails)
    const getInitials = (fullName: string) => {
        if (!fullName) return 'U'
        const names = fullName.trim().split(' ')
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase()
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }

    // Generate background color based on name (fallback)
    const getBackgroundColor = (fullName: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
        ]
        const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    const handleImageError = () => {
        setImageError(true)
        setCurrentImage(null)
    }

    const handleApiAvatarError = () => {
        setApiAvatarError(true)
    }

    // If we have a valid uploaded image and no error, show the image
    if (currentImage && !imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
                <Image
                    src={currentImage}
                    alt={`${name} profile`}
                    width={size === 'xl' ? 96 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
                    height={size === 'xl' ? 96 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                />
            </div>
        )
    }

    // Try API avatar first (if not errored)
    if (!apiAvatarError) {
        const apiAvatarUrl = generateApiAvatarUrl(name)
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
                <Image
                    src={apiAvatarUrl}
                    alt={`${name} avatar`}
                    width={size === 'xl' ? 96 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
                    height={size === 'xl' ? 96 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
                    className="w-full h-full object-cover"
                    onError={handleApiAvatarError}
                />
            </div>
        )
    }

    // Final fallback to initials avatar (if API fails)
    const initials = getInitials(name)
    const bgColor = getBackgroundColor(name)

    return (
        <div className={`
            ${sizeClasses[size]} 
            ${bgColor} 
            rounded-full 
            flex 
            items-center 
            justify-center 
            text-white 
            font-semibold
            ${className}
        `}>
            {initials}
        </div>
    )
}

export default DynamicAvatar
