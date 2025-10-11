import React from 'react'
import SkeletonRecipeCard from './SkeletonRecipeCard'

interface SkeletonRecipeGridProps {
  count?: number
}

export default function SkeletonRecipeGrid({ count = 6 }: SkeletonRecipeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <SkeletonRecipeCard key={index} />
      ))}
    </div>
  )
} 