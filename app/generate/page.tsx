"use client";

import { useState } from "react";
import { ChefHat, Utensils, AlertCircle } from "lucide-react";
import InputFieldRecipe from "@/components/sub-components/InputFieldRecipe";
import PreferenceSelect from "@/components/sub-components/PreferenceSelect";
import AuthCheck from "@/components/auth/AuthCheck";
import { generateRecipes, Recipe } from "@/lib/gemini";
import RecipeCard from "@/components/RecipeCard";
import Image from "next/image";

// Define cuisine options
const cuisineOptions = [
  { value: "italian", label: "Italian" },
  { value: "mexican", label: "Mexican" },
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "thai", label: "Thai" },
  { value: "french", label: "French" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "american", label: "American" },
  { value: "middle_eastern", label: "Middle Eastern" },
];

// Define meal type options
const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "appetizer", label: "Appetizer" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
];

// Define difficulty options
const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

// Define cooking time options
const cookingTimeOptions = [
  { value: "under_15", label: "Under 15 minutes" },
  { value: "15_30", label: "15-30 minutes" },
  { value: "30_60", label: "30-60 minutes" },
  { value: "over_60", label: "Over 60 minutes" },
];

type RecipeFormDataType = {
  ingredients: string;
  cuisine: string;
  dietaryRestrictions: string;
  mealType: string;
  difficulty: string;
  cookingTime: string;
  servingSize: number;
  additionalNotes: string;
  strictIngredients: boolean;
};

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RecipeFormDataType>({
    ingredients: "",
    cuisine: "",
    dietaryRestrictions: "",
    mealType: "",
    difficulty: "",
    cookingTime: "",
    servingSize: 0,
    additionalNotes: "",
    strictIngredients: false,
  });
  const [errors, setErrors] = useState<Record<keyof RecipeFormDataType, string>>({
    ingredients: "",
    cuisine: "",
    dietaryRestrictions: "",
    mealType: "",
    difficulty: "",
    cookingTime: "",
    servingSize: "",
    additionalNotes: "",
    strictIngredients: "",
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof RecipeFormDataType]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate ingredients
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = "Please enter at least one ingredient";
      isValid = false;
    }

    // Validate serving size
    if (formData.servingSize) {
      if (isNaN(Number(formData.servingSize)) || Number(formData.servingSize) < 1 || Number(formData.servingSize) > 20) {
        newErrors.servingSize = "Please enter a valid number between 1 and 20";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const generateParams = {
      cuisine: formData.cuisine,
      dietaryRestrictions: formData.dietaryRestrictions,
      mealType: formData.mealType,
      difficulty: formData.difficulty,
      cooking_time: formData.cookingTime,
      servingSize: formData.servingSize,
      additionalNotes: formData.additionalNotes,
      strictIngredients: formData.strictIngredients,
    };

    try {
      const generatedRecipes = await generateRecipes(formData.ingredients, generateParams);
      
      setRecipes(generatedRecipes);
      // Reset saved status for new recipes
      const newStatus: Record<string, { saved: boolean; saveId?: string }> = {};
      generatedRecipes.forEach(r => { newStatus[r.title] = { saved: false }; });
      
      // Scroll to recipes
      setTimeout(() => {
        document.getElementById("recipes-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error generating recipes:", error);
      setApiError(error instanceof Error ? error.message : "Failed to generate recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMore = async () => {
    setLoading(true);
    setApiError(null);

    const generateParams = {
      cuisine: formData.cuisine,
      dietaryRestrictions: formData.dietaryRestrictions,
      mealType: formData.mealType,
      difficulty: formData.difficulty,
      cooking_time: formData.cookingTime,
      servingSize: formData.servingSize,
      additionalNotes: formData.additionalNotes,
      strictIngredients: formData.strictIngredients,
    };

    try {
      const newRecipes = await generateRecipes(formData.ingredients, generateParams);

      // Filter out any duplicate recipes by title
      const existingTitles = new Set(recipes.map(recipe => recipe.title));
      const uniqueNewRecipes = newRecipes.filter(recipe => !existingTitles.has(recipe.title));

      setRecipes(prevRecipes => [...prevRecipes, ...uniqueNewRecipes]);
    } catch (error) {
      console.error("Error generating more recipes:", error);
      setApiError(error instanceof Error ? error.message : "Failed to generate more recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCheck>
      <main className="bg-gradient-to-br bg-gray-200 dark:bg-gradient-to-br dark:from-dark-gradient-from dark:to-dark-gradient-to min-h-screen pb-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                <Image src="/branding_white.svg" alt="Logo" className="h-8 w-8 text-white" width={32} height={32}/>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
              Generate Your Recipe
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-black/70 dark:text-white/70">
              Tell us what ingredients you have on hand, and our AI chef will create 
              delicious, personalized recipes just for you!
            </p>
          </div>

          {/* Recipe Generation Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Ingredients Section */}
              <div className="space-y-6 rounded-xl bg-white dark:bg-dark-card p-6 shadow-lg dark:shadow-black/30 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                    <ChefHat className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">Your Ingredients</h2>
                </div>
                
                <InputFieldRecipe
                  label="Available Ingredients"
                  id="ingredients"
                  type="text"
                  placeholder="Enter an ingredient and press + or Enter"
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  disabled={loading}
                />

                <div className="flex items-center mt-3 mb-4">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="strictIngredients"
                      name="strictIngredients"
                      checked={formData.strictIngredients}
                      onChange={handleInputChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-orange-500/30 bg-white transition-all checked:border-orange-500 checked:bg-orange-500 dark:border-orange-500/20 dark:bg-dark-card checked:dark:border-orange-500 checked:dark:bg-orange-500"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <label 
                    htmlFor="strictIngredients" 
                    className="ml-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    Only use provided ingredients
                  </label>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-6 rounded-xl bg-white dark:bg-dark-card p-6 shadow-lg dark:shadow-black/30 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                    <Utensils className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">Your Preferences</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PreferenceSelect
                    label="Cuisine"
                    id="cuisine"
                    options={cuisineOptions}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                  <PreferenceSelect
                    label="Meal Type"
                    id="mealType"
                    options={mealTypeOptions}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                  <PreferenceSelect
                    label="Difficulty"
                    id="difficulty"
                    options={difficultyOptions}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                  <PreferenceSelect
                    label="Cooking Time"
                    id="cookingTime"
                    options={cookingTimeOptions}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                  <InputFieldRecipe
                    label="Dietary Restrictions"
                    id="dietaryRestrictions"
                    type="text"
                    placeholder="E.g., vegetarian, gluten-free, dairy-free"
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                  <InputFieldRecipe
                    label="Serving Size"
                    id="servingSize"
                    type="number"
                    placeholder="Number of people"
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    disabled={loading}
                  />

                </div>

                <InputFieldRecipe
                  label="Additional Notes"
                  id="additionalNotes"
                  type="text"
                  placeholder="Any additional preferences or requirements"
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-center items-center gap-2">
              <button
                type="submit"
                className="relative overflow-hidden rounded-md bg-gradient-to-r from-orange-500 to-red-600 py-3 px-8 font-medium text-white shadow-md transition-all duration-300 hover:from-orange-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="opacity-0">Generate Recipes</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  </>
                ) : (
                  "Generate Recipes"
                )}
              </button>

              {/* Info Tooltip */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-sm"
                >
                  Heads up!
                </button>
                {showTooltip && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full -translate-y-2 mt-2 w-64 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg p-2 text-sm z-10 outline outline-orange-500/20">
                    Our recipes are AI-generated and might occasionally contain mistakes or unusual combinations. Please double-check the ingredients and steps before cooking. If something feels off, trust your instincts.
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Recipes Section */}
          {(loading || recipes.length > 0) && (
            <div id="recipes-section" className="mt-16">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-black dark:text-white">
                  {loading ? "Crafting Your Recipes..." : "Your Personalized Recipes"}
                </h2>
                {!loading && (
                  <p className="mt-2 text-black/70 dark:text-white/70">
                    Here are 10 delicious recipes based on your ingredients and preferences
                  </p>
                )}
              </div>
              
              {/* Recipe Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                {recipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe as any} />
                ))}
                {(loading || recipes.length === 0) && Array(10).fill(0).map((_, index) => (
                  <div key={`skeleton-${index}`}><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /></div>
                ))}
              </div>
              
              {/* Generate More Button */}
              {recipes.length > 0 && !loading && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleGenerateMore}
                    className="relative overflow-hidden rounded-md bg-gradient-to-r from-orange-500 to-red-600 py-3 px-8 font-medium text-white shadow-md transition-all duration-300 hover:from-orange-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Generate More Recipes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthCheck>
  );
}
