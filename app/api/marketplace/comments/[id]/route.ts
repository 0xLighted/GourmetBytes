import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/marketplace/comments/[id]
// Update a comment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params to get the actual object
    const { id: commentId } = await params;
    
    // Get updated comment text from request body
    const { comment } = await req.json();
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }
    
    // Check if user owns this comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('recipe_comments')
      .select('id')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !existingComment) {
      console.error('Error fetching comment or comment not found:', fetchError);
      return NextResponse.json({ error: 'Comment not found or you don\'t have permission' }, { status: 404 });
    }
    
    // Update the comment
    const { error } = await supabase
      .from('recipe_comments')
      .update({
        comment_text: comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Comment updated successfully',
      id: commentId 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/marketplace/comments/[id]
// Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params to get the actual object
    const { id: commentId } = await params;
    
    // First get the recipe ID to update comment count
    const { data: comment, error: fetchError } = await supabase
      .from('recipe_comments')
      .select('recipe_id')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !comment) {
      console.error('Error fetching comment or comment not found:', fetchError);
      return NextResponse.json({ error: 'Comment not found or you don\'t have permission' }, { status: 404 });
    }
    
    // Delete the comment
    const { error } = await supabase
      .from('recipe_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
    
    // Decrement comment count
    const { error: decrementError } = await supabase
      .rpc('decrement_comment_count', { recipe_id: comment.recipe_id });
    
    if (decrementError) {
      console.error('Error decrementing comment count:', decrementError);
      return NextResponse.json({ error: 'Failed to update comment count' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 