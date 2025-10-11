import React from 'react'

export default function SkeletonProfile() {
  return (
    <div className="space-y-8">
      <header>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            {/* Avatar placeholder */}
            <div className="mx-auto w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-4"></div>
            
            {/* Name placeholder */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
            
            {/* Email placeholder */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
            
            {/* API Key indicator placeholder */}
            <div className="w-full mb-4 flex items-center justify-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 animate-pulse"></div>
            </div>
            
            {/* Action button placeholders */}
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
            
            {/* Description placeholder */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6 animate-pulse"></div>
            
            <div className="space-y-6">
              {/* Form field placeholders */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
              
              {/* Button placeholder */}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mt-8 float-right animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 