"use client";

import React, { useEffect, useState } from "react";
import RecipeGrid from "@/components/RecipeGrid";
import { RecipeDatabase, DbRecipe } from "@/lib/database";
import { getCurrentUser } from "@/lib/user";
import { Recipe } from "@/lib/gemini";

const RECIPES_PER_PAGE = 10;

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchSavedRecipes() {
      setLoading(true);
      setError(null);
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("You must be signed in to view your saved recipes.");
          setRecipes([]);
          setLoading(false);
          return;
        }
        const db = new RecipeDatabase();
        const saved: DbRecipe[] = await db.getUserSavedRecipes(user.id);
        // Convert DbRecipe to Recipe for RecipeGrid
        const recipes: Recipe[] = saved.map((r) => ({
          id: r.id || "",
          title: r.title,
          description: r.description,
          ingredients: r.ingredients,
          instructions: r.instructions,
          cooking_time: r.cooking_time|| "",
          difficulty: r.difficulty,
          servings: r.servings,
          cuisine: r.cuisine,
          tags: r.tags,
          likes: undefined, // Not tracked for saved recipes
          comments: undefined, // Not tracked for saved recipes
          saved: true,
        }));
        setRecipes(recipes);
      } catch (err) {
        console.error(err);
        setError("Failed to load saved recipes. Please try again later.");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedRecipes();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE) || 1;
  const paginatedRecipes = recipes.slice((page - 1) * RECIPES_PER_PAGE, page * RECIPES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Recipes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Your favorite recipes collection</p>
      </header>
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded p-4 text-center">
          {error}
        </div>
      )}
      {!loading && recipes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 text-gray-400 dark:text-gray-600"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.7 3.7 6.2l.3.2V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4.6l.3-.2A7.1 7.1 0 0 0 19 9a7 7 0 0 0-7-7Zm1 18h-2v-4h2v4Zm-1-6a5 5 0 0 1-5-5c0-2.8 2.2-5 5-5s5 2.2 5 5a5 5 0 0 1-5 5Z"/></svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No saved recipes yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start saving your favorite recipes to see them here.</p>
        </div>
      )}
      {loading && (
        <RecipeGrid recipes={[]} loading={true} />
      )}
      {!loading && recipes.length > 0 && (
        <>
          <RecipeGrid recipes={paginatedRecipes} loading={false} />
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 disabled:opacity-50"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="mx-2 text-gray-700 dark:text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 disabled:opacity-50"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
} 