"use client";

import React, { useEffect, useState } from "react";
import { RecipeDatabase, MarketplaceRecipe } from "@/lib/database";
import MarketplaceRecipeCard from "@/components/MarketplaceRecipeCard";
import SkeletonRecipeCard from "@/components/sub-components/SkeletonRecipeCard";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const RECIPES_PER_PAGE = 10;

export default function MarketplacePage() {
  const [recipes, setRecipes] = useState<MarketplaceRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<MarketplaceRecipe[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      const db = new RecipeDatabase();
      const offset = (page - 1) * RECIPES_PER_PAGE;
      const { recipes, count } = await db.getMarketplaceRecipes(RECIPES_PER_PAGE, offset);
      setRecipes(recipes);
      setTotalCount(count);
      setLoading(false);
    }
    fetchRecipes();
  }, [page]);

  useEffect(() => {
    if (!search) {
      setFiltered(recipes);
    } else {
      setFiltered(
        recipes.filter((r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, recipes]);

  const totalPages = Math.max(1, Math.ceil(totalCount / RECIPES_PER_PAGE));

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recipe Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Discover and share gourmet recipes with the community</p>
      </header>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max mt-8">
          {Array(RECIPES_PER_PAGE).fill(0).map((_, i) => <SkeletonRecipeCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 text-gray-400 dark:text-gray-600"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.7 3.7 6.2l.3.2V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4.6l.3-.2A7.1 7.1 0 0 0 19 9a7 7 0 0 0-7-7Zm1 18h-2v-4h2v4Zm-1-6a5 5 0 0 1-5-5c0-2.8 2.2-5 5-5s5 2.2 5 5a5 5 0 0 1-5 5Z"/></svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No recipes found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Try searching for something else or check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max mt-8">
            {filtered.map((recipe, i) => (
              <MarketplaceRecipeCard key={recipe.id || i} recipe={{ ...recipe, id: recipe.id || '' }} />
            ))}
          </div>
          {/* Pagination Navigator */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
} 