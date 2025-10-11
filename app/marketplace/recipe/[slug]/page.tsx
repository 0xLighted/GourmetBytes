"use client";

import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { RecipeDatabase, RecipeComment } from '@/lib/database';
import { Recipe as BaseRecipe } from '@/lib/gemini';
import { Heart, MessageCircle, Eye, Bookmark, Share2, ChefHat, Clock, Users, Send } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Recipe = BaseRecipe & {
  publisher?: string;
  views?: number;
};

interface RecipeDetailPageProps {
  params: Promise<{ slug: string }>;
}

type Ingredient = {
  quantity?: string;
  unit?: string;
  item?: string;
  amount?: string;
  name?: string;
};

// Helper function to format ingredient objects as strings
function formatIngredient(ingredient: string | Ingredient): string {
  if (typeof ingredient === 'string') {
    return ingredient;
  } else if (ingredient && typeof ingredient === 'object') {
    if (ingredient.quantity && ingredient.item) {
      return `${ingredient.quantity} ${ingredient.item}`;
    } else if (ingredient.amount && ingredient.name) {
      return `${ingredient.amount} ${ingredient.name}`;
    } else if (ingredient.item && ingredient.unit && ingredient.quantity) {
      return `${ingredient.quantity} ${ingredient.unit} ${ingredient.item}`;
    } else {
      return Object.values(ingredient).filter(Boolean).join(' ');
    }
  }
  return String(ingredient || 'Unknown ingredient');
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { slug } = React.use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveId, setSaveId] = useState<string | undefined>(undefined);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Check if user is authenticated
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserName(user.user_metadata.full_name || '');
      }
    };
    
    getUser();
  }, [supabase.auth]);
  
  // Fetch recipe details
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const db = new RecipeDatabase();
        const marketplaceRecipe = await db.getMarketplaceRecipeBySlug(slug);
        
        if (marketplaceRecipe) {
          // Convert MarketplaceRecipe to Recipe format
          const recipeData: Recipe = {
            id: marketplaceRecipe.id || '',
            title: marketplaceRecipe.title,
            description: marketplaceRecipe.description,
            ingredients: marketplaceRecipe.ingredients,
            instructions: marketplaceRecipe.instructions,
            cooking_time: (marketplaceRecipe as any).cooking_time || marketplaceRecipe.cooking_time || '',
            difficulty: marketplaceRecipe.difficulty,
            servings: marketplaceRecipe.servings,
            cuisine: marketplaceRecipe.cuisine,
            tags: marketplaceRecipe.tags,
            likes: marketplaceRecipe.likes,
            comments: marketplaceRecipe.comments_count,
            publisher: marketplaceRecipe.publisher_name,
            views: marketplaceRecipe.views
          };
          
          setRecipe(recipeData);
          setLikesCount(marketplaceRecipe.likes);
          setCommentsCount(marketplaceRecipe.comments_count);
          
          // Check if user has liked and saved this recipe
          if (user) {
            const isLiked = await db.hasUserLikedRecipe(marketplaceRecipe.id!, user.id);
            // Check saved status and get saveId
            const saveRes = await fetch(`/api/marketplace/save?recipeId=${marketplaceRecipe.id}`);
            let isSaved = false;
            let saveId: string | undefined = undefined;
            if (saveRes.ok) {
              const saveData = await saveRes.json();
              isSaved = saveData.saved;
              saveId = saveData.savedRecipeId;
            }
            setIsLiked(isLiked);
            setIsSaved(isSaved);
            setSaveId(saveId);
          }
        } else {
          // Recipe not found
          router.push('/marketplace');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchRecipe();
    }
  }, [slug, user, router]);
  
  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!recipe?.id) return;
      
      try {
        const response = await fetch(`/api/marketplace/comments?recipeId=${recipe.id}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
      }
    };
    
    fetchComments();
  }, [recipe?.id]);
  
  const handleLike = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    if (!recipe?.id) return;
    
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
  
  const handleSave = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    if (!recipe?.id) return;
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
  
  const handleShare = () => {
    if (!recipe) return;
    
    // Create a shareable URL
    const url = window.location.href;
    
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
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };
  
  const handleAddComment = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    if (!recipe?.id || !newComment.trim()) return;
    
    try {
      const response = await fetch('/api/marketplace/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          comment: newComment,
          userName: userName || user.user_metadata.full_name || 'Anonymous',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add the new comment to the list
        setComments(prevComments => [data.comment, ...prevComments]);
        // Increment comment count
        setCommentsCount(prev => prev + 1);
        // Clear the comment input
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 text-gray-400 dark:text-gray-600"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.7 3.7 6.2l.3.2V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4.6l.3-.2A7.1 7.1 0 0 0 19 9a7 7 0 0 0-7-7Zm1 18h-2v-4h2v4Zm-1-6a5 5 0 0 1-5-5c0-2.8 2.2-5 5-5s5 2.2 5 5a5 5 0 0 1-5 5Z"/></svg>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Recipe not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The recipe you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <button
          onClick={() => router.push('/marketplace')}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6 md:gap-10 max-w-5xl mx-auto px-2 md:px-0 py-4 md:py-8">
      {/* Header */}
      <div className="rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 md:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2 leading-tight drop-shadow-sm">{recipe.title}</h1>
            <p className="text-white/90 mb-2 md:mb-4 text-base md:text-lg max-w-2xl">{recipe.description}</p>
            {recipe.publisher && (
              <p className="text-xs md:text-sm text-white/70">By {recipe.publisher}</p>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm md:text-base ${
                isLiked ? 'bg-white text-red-500' : 'bg-white/20 text-white hover:bg-white/30'
              } transition-colors`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} /> Like
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm md:text-base ${
                isSaved ? 'bg-white text-orange-500' : 'bg-white/20 text-white hover:bg-white/30'
              } transition-colors`}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-orange-500' : ''}`} /> {isSaved ? 'Unsave' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm md:text-base bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Share2 className="h-5 w-5" /> Share
            </button>
          </div>
        </div>
        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 mt-6 md:mt-8 bg-white/10 rounded-xl p-4 md:p-6 shadow-inner">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Clock className="h-5 w-5 text-orange-200" />
            <span>{recipe.cooking_time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <ChefHat className="h-5 w-5 text-orange-200" />
            <span>{recipe.difficulty}</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Users className="h-5 w-5 text-orange-200" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <MessageCircle className="h-5 w-5 text-white/80" />
            <span>{commentsCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Eye className="h-5 w-5 text-white/80" />
            <span>{recipe.views}</span>
          </div>
        </div>
      </div>

      {/* Main Content: Ingredients & Instructions */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Ingredients */}
        <div className="md:w-1/3 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Ingredients</h2>
          <ul className="space-y-3 mb-4">
            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span className="text-gray-800 dark:text-gray-200">{formatIngredient(ingredient)}</span>
              </li>
            ))}
          </ul>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-auto">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((tag, i) => (
                  <span key={i} className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Instructions */}
        <div className="md:w-2/3 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Instructions</h2>
          <ol className="space-y-6 mb-4">
            {recipe.instructions && recipe.instructions.map((instruction, index) => (
              <li key={index} className="relative pl-10">
                <div className="absolute left-0 top-0 flex items-center justify-center h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800/50 text-gray-800 dark:text-gray-200">
                  {instruction}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Comments ({commentsCount})</h2>
        {/* Comment Input */}
        <div className="mb-6 flex flex-col sm:flex-row items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">
              {user ? user.user_metadata.full_name?.[0].toUpperCase() || 'U' : 'G'}
            </span>
          </div>
          <div className="flex-1 w-full">
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm"
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4 inline mr-1" /> Post
              </button>
            </div>
          </div>
        </div>
        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    {comment.user_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{comment.user_name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-800 dark:text-gray-200">{comment.comment_text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 