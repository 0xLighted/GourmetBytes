import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Recipe } from '@/lib/gemini';

// Extended recipe type with database-specific fields
export interface DbRecipe extends Omit<Recipe, 'id'> {
  id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  marketplace_id?: string;
}

// Marketplace recipe with additional fields
export interface MarketplaceRecipe extends DbRecipe {
  publisher_name: string;
  published_at: string;
  slug: string;
  views: number;
  likes: number;
  comments_count: number;
}

// Comment type
export interface RecipeComment {
  id: string;
  recipe_id: string;
  user_id: string;
  comment_text: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export class RecipeDatabase {
  private supabase = createClientComponentClient();

  // ==================== SAVED RECIPES FUNCTIONS ====================

  /**
   * Save a recipe to the user's personal collection
   */
  async saveRecipe(recipe: Recipe, userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .insert({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cuisine: recipe.cuisine,
        tags: recipe.tags,
        user_id: userId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }

    return data?.id || null;
  }

  /**
   * Save a marketplace recipe to the user's personal collection
   */
  async saveMarketplaceRecipe(marketplaceRecipeId: string, userId: string): Promise<string | null> {
    // First get the marketplace recipe
    const { data: marketplaceRecipe, error: fetchError } = await this.supabase
      .from('marketplace_recipes')
      .select('*')
      .eq('id', marketplaceRecipeId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching marketplace recipe:', fetchError);
      throw fetchError;
    }

    // Check if user already has saved this marketplace recipe
    const { data: existingSavedRecipe } = await this.supabase
      .from('saved_recipes')
      .select('id')
      .eq('marketplace_id', marketplaceRecipeId)
      .eq('user_id', userId)
      .maybeSingle();
    
    // If already saved, return the existing ID
    if (existingSavedRecipe?.id) {
      return existingSavedRecipe.id;
    }
    
    // Save the recipe to user's collection with a reference to the marketplace recipe
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .insert({
        title: marketplaceRecipe.title,
        description: marketplaceRecipe.description,
        ingredients: marketplaceRecipe.ingredients,
        instructions: marketplaceRecipe.instructions,
        cooking_time: marketplaceRecipe.cooking_time,
        difficulty: marketplaceRecipe.difficulty,
        servings: marketplaceRecipe.servings,
        cuisine: marketplaceRecipe.cuisine,
        tags: marketplaceRecipe.tags,
        user_id: userId,
        marketplace_id: marketplaceRecipeId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving marketplace recipe:', error);
      throw error;
    }

    return data?.id || null;
  }

  /**
   * Check if a user has saved a specific marketplace recipe
   */
  async hasUserSavedMarketplaceRecipe(marketplaceRecipeId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .select('id')
      .eq('marketplace_id', marketplaceRecipeId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user saved recipe:', error);
      throw error;
    }

    return !!data;
  }

  /**
   * Get all recipes saved by a specific user
   */
  async getUserSavedRecipes(userId: string): Promise<DbRecipe[]> {
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .select('*, marketplace_recipes(slug, publisher_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved recipes:', error);
      throw error;
    }

    return data as DbRecipe[];
  }

  /**
   * Get a specific saved recipe by ID
   */
  async getSavedRecipeById(recipeId: string, userId: string): Promise<DbRecipe | null> {
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .select('*, marketplace_recipes(slug, publisher_name)')
      .eq('id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Recipe not found
      }
      console.error('Error fetching saved recipe:', error);
      throw error;
    }

    return data as DbRecipe;
  }

  /**
   * Update a saved recipe
   */
  async updateSavedRecipe(recipeId: string, userId: string, updates: Partial<Recipe>): Promise<void> {
    const { error } = await this.supabase
      .from('saved_recipes')
      .update(updates)
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating saved recipe:', error);
      throw error;
    }
  }

  /**
   * Delete a saved recipe
   */
  async deleteSavedRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('saved_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting saved recipe:', error);
      throw error;
    }
  }

  // ==================== MARKETPLACE RECIPES FUNCTIONS ====================

  /**
   * Share a recipe to the marketplace
   */
  async shareRecipeToMarketplace(recipe: Recipe, userId: string, publisherName: string): Promise<{ id: string, slug: string } | null> {
    // Generate a slug from the title
    const slug = this.generateSlug(recipe.title);
    
    const { data, error } = await this.supabase
      .from('marketplace_recipes')
      .insert({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cuisine: recipe.cuisine,
        tags: recipe.tags,
        user_id: userId,
        publisher_name: publisherName,
        slug: slug,
        views: 0,
        likes: 0,
        comments_count: 0,
        published_at: new Date().toISOString()
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error('Error sharing recipe to marketplace:', error);
      throw error;
    }

    return data || null;
  }

  /**
   * Get a marketplace recipe by slug
   */
  async getMarketplaceRecipeBySlug(slug: string): Promise<MarketplaceRecipe | null> {
    const { data, error } = await this.supabase
      .from('marketplace_recipes')
      .select('*')
      .eq('id', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Recipe not found
      }
      console.error('Error fetching marketplace recipe:', error);
      throw error;
    }

    // Increment view count
    this.incrementRecipeViews(data.id);

    return data as MarketplaceRecipe;
  }

  /**
   * Get marketplace recipes with optional filtering
   */
  async getMarketplaceRecipes(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      cuisine?: string;
      difficulty?: string;
      tags?: string[];
    }
  ): Promise<{ recipes: MarketplaceRecipe[], count: number }> {
    let query = this.supabase
      .from('marketplace_recipes')
      .select('*', { count: 'exact' });

    // Apply filters if provided
    if (filters) {
      if (filters.cuisine) {
        query = query.eq('cuisine', filters.cuisine);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        // Overlap operator for array contains any of the elements
        query = query.overlaps('tags', filters.tags);
      }
    }

    // Finalize query with pagination and order
    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching marketplace recipes:', error);
      throw error;
    }

    return {
      recipes: data as MarketplaceRecipe[],
      count: count || 0
    };
  }

  /**
   * Get marketplace recipes published by a specific user
   */
  async getUserPublishedRecipes(userId: string): Promise<MarketplaceRecipe[]> {
    const { data, error } = await this.supabase
      .from('marketplace_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching user published recipes:', error);
      throw error;
    }

    return data as MarketplaceRecipe[];
  }

  /**
   * Update marketplace recipe view count
   */
  private async incrementRecipeViews(recipeId: string): Promise<void> {
    await this.supabase.rpc('increment_recipe_views', { recipe_id: recipeId });
  }

  /**
   * Toggle like on a marketplace recipe
   */
  async toggleRecipeLike(recipeId: string, userId: string): Promise<boolean> {
    // First check if user already liked the recipe
    const { data: existingLike } = await this.supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();
    
    if (existingLike) {
      // Unlike the recipe
      const { error: deleteError } = await this.supabase
        .from('recipe_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) {
        console.error('Error unliking recipe:', deleteError);
        throw deleteError;
      }
      
      // Decrement like count
      await this.supabase.rpc('decrement_recipe_likes', { recipe_id: recipeId });
      return false; // Returned false meaning unliked
    } else {
      // Like the recipe
      const { error: insertError } = await this.supabase
        .from('recipe_likes')
        .insert({
          recipe_id: recipeId,
          user_id: userId
        });
        
      if (insertError) {
        console.error('Error liking recipe:', insertError);
        throw insertError;
      }
      
      // Increment like count
      await this.supabase.rpc('increment_recipe_likes', { recipe_id: recipeId });
      return true; // Returned true meaning liked
    }
  }

  /**
   * Delete a marketplace recipe (only by the owner)
   */
  async deleteMarketplaceRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('marketplace_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting marketplace recipe:', error);
      throw error;
    }
  }

  /**
   * Check if user has liked a recipe
   */
  async hasUserLikedRecipe(recipeId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user liked recipe:', error);
      throw error;
    }

    return !!data;
  }

  // ==================== COMMENTS FUNCTIONS ====================

  /**
   * Add a comment to a marketplace recipe
   */
  async addComment(recipeId: string, userId: string, userName: string, comment: string): Promise<RecipeComment | null> {
    const { data, error } = await this.supabase
      .from('recipe_comments')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
        user_name: userName,
        comment_text: comment
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    // Increment comment count
    await this.supabase.rpc('increment_comment_count', { recipe_id: recipeId });

    return data as RecipeComment;
  }

  /**
   * Get comments for a marketplace recipe
   */
  async getRecipeComments(recipeId: string, limit: number = 20, offset: number = 0): Promise<{ comments: RecipeComment[], count: number }> {
    const { data, error, count } = await this.supabase
      .from('recipe_comments')
      .select('*', { count: 'exact' })
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return {
      comments: data as RecipeComment[],
      count: count || 0
    };
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, userId: string, comment: string): Promise<void> {
    const { error } = await this.supabase
      .from('recipe_comments')
      .update({
        comment_text: comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // First get the recipe ID to update comment count
    const { data: comment, error: fetchError } = await this.supabase
      .from('recipe_comments')
      .select('recipe_id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching comment:', fetchError);
      throw fetchError;
    }

    // Delete the comment
    const { error } = await this.supabase
      .from('recipe_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }

    // Decrement comment count
    await this.supabase.rpc('decrement_comment_count', { recipe_id: comment.recipe_id });
  }

  /**
   * Generate a URL-friendly slug from a recipe title
   */
  private generateSlug(title: string): string {
    // Convert to lowercase, replace spaces with hyphens, remove special characters
    const baseSlug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      // Avoid multiple consecutive hyphens
      .replace(/-+/g, '-');
      
    // Add a random suffix to make the slug unique
    // This is a simple implementation - in production you might want more sophisticated collision detection
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return `${baseSlug}-${randomSuffix}`;
  }
} 