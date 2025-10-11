"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

type RecipeFormDataKeys = "ingredients" | "cuisine" | "dietaryRestrictions" | "mealType" | "difficulty" | "cookingTime" | "servingSize" | "additionalNotes";

export default function InputFieldRecipe({ 
  label, 
  id, 
  type, 
  placeholder, 
  children, 
  formData, 
  errors, 
  handleInputChange, 
  disabled 
}: {
  label: string,
  id: RecipeFormDataKeys,
  type: React.HTMLInputTypeAttribute,
  placeholder: string,
  children?: React.ReactNode,
  formData: Record<RecipeFormDataKeys, string | number>,
  errors: Record<RecipeFormDataKeys, string>,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  disabled: boolean
}) {
  const isTextarea = id === "additionalNotes";
  const isSelect = id === "cuisine" || id === "mealType" || id === "difficulty" || id === "cookingTime";
  const isIngredientField = id === "ingredients";
  
  const [ingredientInput, setIngredientInput] = useState("");
  const ingredients = typeof formData.ingredients === "string" && formData.ingredients ? formData.ingredients.split(',').filter(item => item.trim() !== '') : [];

  const handleIngredientAdd = () => {
    if (!ingredientInput.trim()) return;
    
    const newIngredients = [...ingredients, ingredientInput.trim()];
    const syntheticEvent = {
      target: {
        name: 'ingredients',
        value: newIngredients.join(',')
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    setIngredientInput("");
  };

  const handleIngredientDelete = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    
    const syntheticEvent = {
      target: {
        name: 'ingredients',
        value: newIngredients.join(',')
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleIngredientAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-black dark:text-white"
      >
        {label}
      </label>
      <div className="relative">
        {isIngredientField ? (
          <div className="space-y-3">
            <div className="flex">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-l-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder={placeholder}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={handleIngredientAdd}
                className="rounded-r-md bg-orange-500 px-3 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                disabled={disabled || !ingredientInput.trim()}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 border border-black/20 dark:border-white/30 rounded-md bg-white/50 dark:bg-dark-gradient-from/50 min-h-[60px]">
                {ingredients.map((ingredient, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-md"
                  >
                    <span>{ingredient.trim()}</span>
                    <button
                      type="button"
                      onClick={() => handleIngredientDelete(index)}
                      className="text-orange-800 dark:text-orange-300 hover:text-red-600 dark:hover:text-red-400"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isTextarea ? (
          <textarea
            id={id}
            name={id}
            value={formData[id].toString()}
            onChange={handleInputChange}
            className="w-full min-h-[100px] rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : isSelect ? (
          <select
            id={id}
            name={id}
            value={formData[id].toString()}
            onChange={handleInputChange}
            className="w-full rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            disabled={disabled}
          >
            <option value="">Select {label}</option>
            {children}
          </select>
        ) : (
          <input
            type={type}
            id={id}
            name={id}
            value={formData[id].toString()}
            onChange={handleInputChange}
            className="w-full rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>
      {errors[id] && <p className="text-sm text-red-500">{errors[id]}</p>}
    </div>
  );
} 