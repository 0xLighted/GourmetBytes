"use client";

import { useRef, useEffect, useState } from "react";
import { X, Save, Share2, Clock, ChefHat, Users, MessageCircle, HelpCircle, Send } from "lucide-react";
import { Recipe as BaseRecipe } from "@/lib/gemini";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Recipe = BaseRecipe & {
  saved?: boolean;
  shared?: boolean;
  saveId?: string;
  shareId?: string;
};

interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to validate and format ingredients
const formatIngredient = (ingredient: any): string => {
  if (typeof ingredient === 'string') {
    return ingredient;
  } else if (ingredient && typeof ingredient === 'object') {
    // Handle object with item and quantity
    if (ingredient.item && ingredient.quantity) {
      return `${ingredient.quantity} ${ingredient.item}`;
    } else if (ingredient.name && ingredient.amount) {
      return `${ingredient.amount} ${ingredient.name}`;
    } else {
      // Try to get any string value from the object
      const values = Object.values(ingredient).filter(v => v).map(String);
      return values.join(' ') || 'Unknown ingredient';
    }
  }
  // Fallback for any other unexpected format
  return String(ingredient || 'Unknown ingredient');
};

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(!!recipe.saved);
  const [isShared, setIsShared] = useState(!!recipe.shared);
  const [isSharing, setIsSharing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'comments'>('ingredients');
  const [infoTooltipVisible, setInfoTooltipVisible] = useState(false);
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Validate the recipe ingredients array
  const validatedIngredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients.map(formatIngredient)
    : [];
  
  const {
    title,
    description,
    instructions,
    cooking_time,
    difficulty,
    servings,
    cuisine,
    tags
  } = recipe;

  // Check if user is authenticated and set initial saved/shared state from props
  useEffect(() => {
    console.log("recipe: ", recipe);
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.user_metadata.full_name || user.email || 'User');
        // Set initial saved/shared state from recipe object only
        setIsSaved(!!recipe.saved);
        setIsShared(!!recipe.shared);
      }
    };
    checkAuth();
  }, [recipe, recipe.saved, recipe.shared, supabase.auth]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Enable body scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    try {
      let response;
      if (isSaved) {
        // Unsave
        response = await fetch('/api/marketplace/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            saveId: recipe.saveId, // Use a separate UUID for saving
            action: 'unsave'
          }),
        });
        if (response.ok) {
          setIsSaved(false);
          recipe.saved = false;
          recipe.saveId = undefined;
        }
      } else {
        // Save
        response = await fetch('/api/marketplace/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipe }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            recipe.saveId = data.id;
          }
          setIsSaved(true);
          recipe.saved = true;
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (isShared) {
      // Already shared, just share the URL
      shareUrl(`${window.location.origin}/marketplace/recipe/${recipe.shareId}`);
    } else {
      // Need to publish to marketplace first
      try {
        setIsSharing(true);
        const response = await fetch('/api/marketplace/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe,
            publisherName: userName
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            recipe.shareId = data.id;
          }
          shareUrl(`${window.location.origin}/marketplace/recipe/${data.id}`);
          setIsShared(true);
          recipe.shared = true;
        }
      } catch (error) {
        console.error('Error sharing recipe:', error);
      } finally {
        setIsSharing(false);
      }
    }
  };
  
  // Helper function to share URL using Web Share API or clipboard
  const shareUrl = (url: string) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: url,
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(url);
      });
    } else {
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

  // Fetch comments when comments tab is active
  useEffect(() => {
    if (activeTab !== 'comments') return;
    const fetchComments = async () => {
      setCommentLoading(true);
      const recipeId = recipe.saveId || recipe.shareId;
      if (!recipeId) return;
      try {
        const response = await fetch(`/api/marketplace/comments?recipeId=${recipeId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
          setCommentsCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setCommentLoading(false);
      }
    };
    fetchComments();
  }, [activeTab, recipe.saveId, recipe.shareId]);

  // Post a new comment
  const handleAddComment = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    const recipeId = recipe.saveId || recipe.shareId;
    if (!recipeId || !newComment.trim()) return;
    try {
      const response = await fetch('/api/marketplace/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          comment: newComment,
          userName: userName || 'Anonymous',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Open AI chat popup
  const handleStartChat = () => {
    // Pass recipe context via sessionStorage (safer for large objects than query params)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gourmet-bytes-chat-recipe', JSON.stringify({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cuisine: recipe.cuisine,
        tags: recipe.tags
      }));
      window.open('/chat/ai', '_blank', 'width=500,height=700');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-card rounded-xl shadow-2xl flex flex-col"
      >
        {/* Modal Header with Recipe Title */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
              {cuisine && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {cuisine} Cuisine
                </span>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          {/* Left Column */}
          <div className="lg:w-2/5 bg-gray-50 dark:bg-gray-900/30 p-6">
            <div className="flex flex-col h-full">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{description}</p>
              </div>
              
              {/* Recipe Metadata */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Clock className="h-5 w-5 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-center">{cooking_time}</div>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <ChefHat className="h-5 w-5 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difficulty</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-center">{difficulty}</div>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Users className="h-5 w-5 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Servings</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-center">{servings}</div>
                </div>
              </div>
              
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons - Removed Like button */}
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={handleSave}
                  className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-lg border ${
                    isSaved 
                      ? 'bg-orange-500 border-orange-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  } transition-all`}
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{isSharing ? 'Sharing...' : 'Share'}</span>
                </button>
              </div>
              
              {/* AI Recipe Notice */}
              <div className="mb-6 p-4 bg-white dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      This AI-generated recipe may need small adjustments. Feel free to adapt it to your taste!
                    </p>
                    <button
                      onMouseEnter={() => setInfoTooltipVisible(true)}
                      onMouseLeave={() => setInfoTooltipVisible(false)}
                      onClick={() => setInfoTooltipVisible(!infoTooltipVisible)}
                      className="text-xs text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 mt-1 underline cursor-help"
                    >
                      Learn more
                    </button>
                    
                    {infoTooltipVisible && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg p-3 text-sm z-10 outline outline-orange-500/20">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          When cooking with AI recipes, consider:
                        </p>
                        <ul className="list-disc text-xs text-gray-600 dark:text-gray-400 pl-4 mt-1 space-y-1">
                          <li>Adjusting cooking times for your equipment</li>
                          <li>Tweaking ingredient proportions to taste</li>
                          <li>Checking temperatures for food safety</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <button
                onClick={handleStartChat}
                className="mt-auto w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-white hover:from-orange-400 hover:to-red-500 transition-all shadow-sm"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chat about this recipe</span>
              </button>
            </div>
          </div>
          
          {/* Right Column - Ingredients & Instructions */}
          <div className="lg:w-3/5 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-card z-10">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === 'ingredients' 
                    ? 'text-orange-500 border-b-2 border-orange-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === 'instructions' 
                    ? 'text-orange-500 border-b-2 border-orange-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Instructions
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === 'comments' 
                    ? 'text-orange-500 border-b-2 border-orange-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Comments
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'ingredients' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-black dark:text-white">Ingredients</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{validatedIngredients.length || 0} items</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {validatedIngredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                        <span className="text-gray-800 dark:text-gray-200">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Help Tip */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Ingredient Tips</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          For best results, make sure all ingredients are at room temperature before starting unless specified otherwise. You may need to adjust quantities to your taste.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'instructions' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-black dark:text-white">Instructions</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{instructions?.length || 0} steps</span>
                  </div>
                  
                  <ol className="space-y-6 mb-6">
                    {instructions && instructions.map((instruction, index) => (
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
                  
                  {/* Cooking Tips */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Cooking Tips</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Trust your instincts while cooking. Cooking times may vary based on your equipment and ingredients. Adjust seasonings as needed for your taste preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comments ({commentsCount})</h3>
                  {/* Only allow comments if recipe is shared */}
                  {isShared ? (
                    <>
                      {/* Comment Input */}
                      <div className="mb-6 flex flex-col sm:flex-row items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">
                            {userName ? userName[0].toUpperCase() : 'G'}
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
                        {commentLoading ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
                          </div>
                        ) : comments.length === 0 ? (
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
                    </>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Comments are only available for recipes shared to the marketplace.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 