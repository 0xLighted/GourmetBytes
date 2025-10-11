import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/marketplace/like
// Like or unlike a recipe
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe ID from request body
    const { recipeId } = await req.json();
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }
    
    // First check if user already liked the recipe
    const { data: existingLike } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single();
    
    let isLiked: boolean;
    
    if (existingLike) {
      // Unlike the recipe
      const { error: deleteError } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) {
        console.error('Error unliking recipe:', deleteError);
        return NextResponse.json({ error: 'Failed to unlike recipe' }, { status: 500 });
      }
      
      // Decrement like count
      const { error: decrementError } = await supabase.rpc('decrement_recipe_likes', { recipe_id: recipeId });
      
      if (decrementError) {
        console.error('Error decrementing like count:', decrementError);
        return NextResponse.json({ error: 'Failed to update like count' }, { status: 500 });
      }
      
      isLiked = false;
    } else {
      // Like the recipe
      const { error: insertError } = await supabase
        .from('recipe_likes')
        .insert({
          recipe_id: recipeId,
          user_id: user.id
        });
        
      if (insertError) {
        console.error('Error liking recipe:', insertError);
        return NextResponse.json({ error: 'Failed to like recipe' }, { status: 500 });
      }
      
      // Increment like count
      const { error: incrementError } = await supabase.rpc('increment_recipe_likes', { recipe_id: recipeId });
      
      if (incrementError) {
        console.error('Error incrementing like count:', incrementError);
        return NextResponse.json({ error: 'Failed to update like count' }, { status: 500 });
      }
      
      isLiked = true;
    }
    
    // Get updated like count
    const { data: updatedRecipe, error: recipeError } = await supabase
      .from('marketplace_recipes')
      .select('likes')
      .eq('id', recipeId)
      .single();
    
    if (recipeError) {
      console.error('Error fetching updated recipe:', recipeError);
      return NextResponse.json({ error: 'Failed to get updated like count' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      liked: isLiked,
      likesCount: updatedRecipe.likes
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/marketplace/like?recipeId=xxx
// Check if the current user has liked a recipe
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe ID from query parameters
    const url = new URL(req.url);
    const recipeId = url.searchParams.get('recipeId');
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }
    
    // Check if user has liked this recipe
    const { data, error } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user liked recipe:', error);
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
    }
    
    return NextResponse.json({ liked: !!data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 