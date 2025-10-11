"use client"

import React from 'react'
import { twMerge } from 'tailwind-merge'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  className?: string
}

export default function FormInput({ 
  label, 
  error, 
  className, 
  id,
  ...props 
}: FormInputProps) {
  // Generate a unique ID if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      
      <input
        id={inputId}
        className={twMerge(
          "w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200",
          error 
            ? "border-red-500 dark:border-red-500" 
            : "border-gray-300 dark:border-gray-700",
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
} 