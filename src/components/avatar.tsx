import React from 'react'

interface AvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  // Handle undefined or empty name
  const safeName = name || 'Unknown User'
  
  // Get initials from name (first letter of first name and last name)
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Generate consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-cyan-500'
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  }

  const colorClass = getAvatarColor(safeName)
  const initials = getInitials(safeName)

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClass} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold 
        select-none
        ${className}
      `}
    >
      {initials}
    </div>
  )
}

export default Avatar
