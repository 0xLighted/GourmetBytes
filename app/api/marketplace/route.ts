import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/lib/gemini';

// Helper function to generate a URL-friendly slug
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

// GET /api/marketplace
// Get marketplace recipes with optional filtering
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const cuisine = url.searchParams.get('cuisine');
    const difficulty = url.searchParams.get('difficulty');
    const tags = url.searchParams.get('tags')?.split(',');
    
    // Start building the query
    let query = supabase
      .from('marketplace_recipes')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (cuisine) {
      query = query.eq('cuisine', cuisine);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (tags && tags.length > 0) {
      // Overlap operator for array contains any of the elements
      query = query.overlaps('tags', tags);
    }
    
    // Finalize query with pagination and order
    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching marketplace recipes:', error);
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      recipes: data, 
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

// POST /api/marketplace
// Share a recipe to the marketplace
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe and additional info from request body
    const { recipe, publisherName }: { recipe: Recipe, publisherName: string } = await req.json();
    
    // Validate recipe data
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      return NextResponse.json(
        { error: 'Recipe must include title, ingredients, and instructions' }, 
        { status: 400 }
      );
    }
    
    // Validate publisher name
    if (!publisherName) {
      return NextResponse.json(
        { error: 'Publisher name is required' }, 
        { status: 400 }
      );
    }
    
    // Generate a slug from the title
    const slug = generateSlug(recipe.title);
    
    // Insert recipe into marketplace
    const { data, error } = await supabase
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
        user_id: user.id,
        publisher_name: publisherName,
        slug: slug,
        views: 0,
        likes: 0,
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
      slug: data.slug
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 