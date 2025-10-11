"use client";

import { Recipe } from "@/lib/gemini";
import MarketplaceRecipeCard from "./MarketplaceRecipeCard";
import SkeletonRecipeCard from "./sub-components/SkeletonRecipeCard";

interface MarketplaceRecipeGridProps {
  recipes: (Recipe & {
    publisher?: string;
    slug?: string;
    views?: number;
  })[];
  loading?: boolean;
  lastItemRef?: (node: HTMLDivElement) => void;
}

export default function MarketplaceRecipeGrid({ 
  recipes, 
  loading = false,
  lastItemRef 
}: MarketplaceRecipeGridProps) {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {recipes.map((recipe, index) => {
          // Apply ref to last recipe element for infinite scrolling
          if (index === recipes.length - 1 && lastItemRef) {
            return (
              <div key={recipe.id} ref={lastItemRef}>
                <MarketplaceRecipeCard recipe={recipe} />
              </div>
            );
          }
          return <MarketplaceRecipeCard key={recipe.id} recipe={recipe} />;
        })}

        {/* Add skeleton cards if loading or no recipes */}
        {(loading || recipes.length === 0) && 
          Array(8).fill(0).map((_, index) => (
            <SkeletonRecipeCard key={`skeleton-${index}`} />
          ))
        }
      </div>
    </div>
  );
} 