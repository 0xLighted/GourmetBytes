"use client"

import SkeletonRecipeCard from '@/components/sub-components/SkeletonRecipeCard'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  router.push('/dashboard/profile')

  return
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to your personal recipe hub</p>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Activity summary card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
              <p>Generated 3 new recipes</p>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
              <p>Saved 2 recipes to favorites</p>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
              <p>Created 1 custom recipe</p>
            </div>
          </div>
        </div>

        {/* Quick stats card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Saved Recipes</p>
              <p className="text-3xl font-bold text-orange-500">24</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Created Recipes</p>
              <p className="text-3xl font-bold text-orange-500">7</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Favorites</p>
              <p className="text-3xl font-bold text-orange-500">12</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Comments</p>
              <p className="text-3xl font-bold text-orange-500">32</p>
            </div>
          </div>
        </div>

        {/* Quick actions card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm">
              Generate New Recipe
            </button>
            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition shadow-sm">
              Browse Marketplace
            </button>
            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition shadow-sm">
              Create Custom Recipe
            </button>
          </div>
        </div>
      </section>
      
      {/* Recent recipes section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Recipes</h2>
          <button className="text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recipe card placeholders */}
          {[1, 2, 3].map((i) => (
            <SkeletonRecipeCard key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    </div>
  )
} 