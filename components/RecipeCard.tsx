"use client";

import { ChefHat, Users, CheckCircle2 } from "lucide-react";
import { Recipe } from "@/lib/gemini";
import { useState } from "react";
import RecipeModal from "./RecipeModal";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    title,
    description,
    cooking_time,
    difficulty,
    servings,
    cuisine,
    tags
  } = recipe;

  // Generate a random color for the accent
  const getRandomHexColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const randomColor = getRandomHexColor();
  
  // Calculate brightness of a color (returns value between 0-255)
  const getBrightness = (hexColor: string) => {
    // Remove '#' if present
    const hex = hexColor.replace('#', '');
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate brightness using perceived luminance formula
    return (r * 0.299 + g * 0.587 + b * 0.114);
  };
  
  // Determine if text should be black or white based on background brightness
  const brightness = getBrightness(randomColor);
  const textColor = brightness > 160 ? 'black' : 'white';

  return (
    <>
      <div 
        className={`relative group overflow-hidden rounded-xl bg-white dark:bg-dark-card border border-orange-500/20 hover:border-2 hover:border-orange-500/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Status Indicator (Like "COMPLETE" in the reference image) */}
        <div className="p-4 pb-0">
          <div 
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" 
            style={{
              backgroundColor: randomColor + '80', // 80 is 50% opacity in hex
              color: textColor
            }}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            <span className="uppercase tracking-wide">Recipe</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-2">
          {/* Title */}
          <h3 className="font-bold text-lg text-black dark:text-white mb-1">{title}</h3>
          
          {/* Date/Time line (similar to reference image) */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {cooking_time ? `${cooking_time} prep time` : "Quick preparation"}
          </p>
          
          {/* Description (like the campaign subject in reference) */}
          <p className="text-sm text-black/70 dark:text-white/70 mb-4 line-clamp-2">{description}</p>
          
          {/* Label line (like "LOB" in reference) */}
          <div className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1">
            Cuisine
          </div>
          
          {/* Value (like "Product Growth" in reference) */}
          <div className="text-sm font-medium text-black dark:text-white mb-3">
            {cuisine}
          </div>
          
          {/* Details */}
          <div className="flex items-center gap-3 text-xs text-black/70 dark:text-white/70 mb-3">
            {difficulty && (
              <div className="flex items-center gap-1">
                <ChefHat className="h-3.5 w-3.5" />
                <span>{difficulty}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{servings || 2} servings</span>
            </div>
          </div>

          {/* Tags (like "KEYWORDS" in reference) */}
          <div className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1">
            Keywords
          </div>
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block rounded-md border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block rounded-md border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <RecipeModal 
          recipe={recipe as any}
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
} 