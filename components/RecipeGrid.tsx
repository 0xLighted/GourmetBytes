"use client";

import { Recipe } from "@/lib/gemini";
import RecipeCard from "./RecipeCard";
import SkeletonRecipeCard from "./sub-components/SkeletonRecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  loading?: boolean;
}

export default function RecipeGrid({ recipes, loading = false }: RecipeGridProps) {
  // Skeleton card component for loading state

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}

        {/* Add skeleton cards if loading or no recipes */}
        {(loading || recipes.length === 0) && 
          Array(10).fill(0).map((_, index) => (
            <SkeletonRecipeCard key={`skeleton-${index}`} />
          ))
        }
      </div>
    </div>
  );
}