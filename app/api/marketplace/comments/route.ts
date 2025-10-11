import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/marketplace/comments?recipeId=xxx
// Get comments for a recipe
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get recipeId from query params
    const url = new URL(req.url);
    const recipeId = url.searchParams.get('recipeId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }
    
    // Get comments for the recipe
    const { data, error, count } = await supabase
      .from('recipe_comments')
      .select('*', { count: 'exact' })
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      comments: data,
      count: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/marketplace/comments
// Add a comment to a recipe
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get comment data from request body
    const { recipeId, comment, userName } = await req.json();
    
    if (!recipeId || !comment) {
      return NextResponse.json({ 
        error: 'Recipe ID and comment text are required' 
      }, { status: 400 });
    }
    
    if (!userName) {
      return NextResponse.json({ 
        error: 'User name is required' 
      }, { status: 400 });
    }
    
    // Add the comment
    const { data, error } = await supabase
      .from('recipe_comments')
      .insert({
        recipe_id: recipeId,
        user_id: user.id,
        user_name: userName,
        comment_text: comment
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
    
    // Increment comment count
    const { error: incrementError } = await supabase
      .rpc('increment_comment_count', { recipe_id: recipeId });
    
    if (incrementError) {
      console.error('Error incrementing comment count:', incrementError);
      return NextResponse.json({ error: 'Failed to update comment count' }, { status: 500 });
    }
    
    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 