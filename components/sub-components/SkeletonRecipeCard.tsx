import React from 'react'

export default function SkeletonRecipeCard() {
  return (
    <div className="relative group overflow-hidden rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-orange-500/20 shadow-sm">
      {/* Status Indicator Skeleton */}
      <div className="p-4 pb-0">
        <div className="inline-flex items-center rounded-full h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse"></div>
        
        {/* Date/Time Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3 animate-pulse"></div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
        
        {/* Label Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1 animate-pulse"></div>
        
        {/* Value Skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3 animate-pulse"></div>
        
        {/* Details Skeleton */}
        <div className="flex gap-3 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>

        {/* Tags Label Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1 animate-pulse"></div>
        
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  )
} 