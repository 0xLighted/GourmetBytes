"use client"

import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export default function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border-transparent",
    outline: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white border-transparent"
  }

  return (
    <button
      className={twMerge(
        "px-4 py-2 rounded-lg font-medium border transition duration-200 flex items-center justify-center gap-2",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
} 