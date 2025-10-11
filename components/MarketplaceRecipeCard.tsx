"use client";

import { Heart, MessageCircle, Eye, Bookmark, Share2 } from "lucide-react";
import { Recipe } from "@/lib/gemini";
import { useState, useEffect } from "react";
import RecipeModal from "./RecipeModal";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface MarketplaceRecipeCardProps {
  recipe: Recipe & {
    publisher?: string;
    slug?: string;
    views?: number;
  };
}

export default function MarketplaceRecipeCard({ recipe }: MarketplaceRecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveId, setSaveId] = useState<string | undefined>(undefined);
  const [likesCount, setLikesCount] = useState(recipe.likes || 0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Check if user is authenticated and if they liked/saved this recipe
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        
        // Check if user has liked this recipe
        const response = await fetch(`/api/marketplace/like?recipeId=${recipe.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.liked);
        }
        
        // Check if user has saved this recipe
        const saveResponse = await fetch(`/api/marketplace/save?recipeId=${recipe.id}`);
        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          setIsSaved(saveData.saved);
          setSaveId(saveData.savedRecipeId);
        }
      }
    };
    
    checkAuth();
  }, [recipe.id, supabase.auth]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      const response = await fetch('/api/marketplace/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId: recipe.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    try {
      if (isSaved && saveId) {
        // Unsave
        const response = await fetch('/api/marketplace/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ saveId, action: 'unsave' }),
        });
        if (response.ok) {
          setIsSaved(false);
          setSaveId(undefined);
        }
      } else {
        // Save
        const response = await fetch('/api/marketplace/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId: recipe.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setIsSaved(true);
          setSaveId(data.id || data.savedRecipeId);
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    
    if (recipe.slug) {
      // Create a shareable URL
      const url = `${window.location.origin}/marketplace/recipe/${recipe.slug}`;
      
      // Use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: url,
        }).catch(err => {
          console.error('Error sharing:', err);
          // Fallback to copying to clipboard
          copyToClipboard(url);
        });
      } else {
        // Fallback for browsers that don't support share API
        copyToClipboard(url);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <>
      <div 
        className="relative group overflow-hidden rounded-xl bg-white dark:bg-dark-card border border-orange-500/20 hover:border-2 hover:border-orange-500/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Recipe Content - Similar to RecipeCard */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-black dark:text-white mb-1">{recipe.title}</h3>
          
          {/* Publisher Info */}
          {recipe.publisher && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              By {recipe.publisher}
            </p>
          )}
          
          {/* Description */}
          <p className="text-sm text-black/70 dark:text-white/70 mb-4 line-clamp-2">{recipe.description}</p>
          
          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block rounded-md border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="inline-block rounded-md border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Social Stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            {/* Left side stats */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLikeClick}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-xs">{likesCount}</span>
              </button>
              
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{recipe.comments || 0}</span>
              </div>
              
              {recipe.views !== undefined && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">{recipe.views}</span>
                </div>
              )}
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveClick}
                className={`text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors ${isSaved ? 'font-bold' : ''}`}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-orange-500 text-orange-500' : ''}`} />
              </button>
              
              <button 
                onClick={handleShareClick}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RecipeModal 
          recipe={recipe} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
} 