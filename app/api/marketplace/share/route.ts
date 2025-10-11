import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/lib/gemini';
import { v4 as uuidv4 } from 'uuid';

// Utility function to generate a slug from a title
function generateSlug(title: string): string {
  // Convert to lowercase, replace spaces with hyphens, remove special characters
  const baseSlug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    // Avoid multiple consecutive hyphens
    .replace(/-+/g, '-');
    
  // Add a random suffix to make the slug unique
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${baseSlug}-${randomSuffix}`;
}

// POST /api/marketplace/share
// Share a recipe to the marketplace
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe and publisher name from request body
    const { recipe, publisherName }: { recipe: Recipe, publisherName: string } = await req.json();
    
    // Validate recipe data
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      return NextResponse.json(
        { error: 'Recipe must include title, ingredients, and instructions' }, 
        { status: 400 }
      );
    }
    
    // Generate a slug for the recipe
    const slug = generateSlug(recipe.title);
    
    // Insert recipe into marketplace
    const { data, error } = await supabase
      .from('marketplace_recipes')
      .insert({
        id: uuidv4(), // Use a proper UUID for the ID
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cuisine: recipe.cuisine,
        tags: recipe.tags,
        user_id: user.id,
        publisher_name: publisherName || user.user_metadata.full_name || 'Anonymous Chef',
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
      return NextResponse.json({ error: 'Failed to share recipe' }, { status: 500 });
    }
    
    return NextResponse.json({
      id: data.id,
      slug: data.slug,
      message: 'Recipe shared to marketplace successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 