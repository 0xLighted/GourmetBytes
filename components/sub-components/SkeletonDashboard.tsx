import React from 'react'
import SkeletonRecipeGrid from './SkeletonRecipeGrid'

export default function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Activity summary card skeleton */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 mr-2 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats card skeleton */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions card skeleton */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent recipes section skeleton */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        
        <SkeletonRecipeGrid count={3} />
      </section>
    </div>
  )
} 