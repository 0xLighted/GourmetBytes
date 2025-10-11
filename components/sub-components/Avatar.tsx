"use client"

import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { User } from 'lucide-react'
import Image from 'next/image'
interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  name?: string | null
  className?: string
}

export default function Avatar({
  src,
  alt = "User avatar",
  size = 'md',
  name,
  className
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?'
    
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
  }
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-32 h-32 text-2xl'
  }
  
  // If we have a valid image and no error loading it
  const showImage = src && !imageError
  
  // Get initials if we have a name
  const initials = name ? getInitials(name) : null
  
  return (
    <div 
      className={twMerge(
        "rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-500/80 to-orange-600",
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <Image 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span className="font-medium text-white">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-white" />
      )}
    </div>
  )
} 