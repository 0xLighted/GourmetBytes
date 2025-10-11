import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/recipes/save
// Save a marketplace recipe to the user's personal collection
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get marketplace recipe ID from request body
    const { marketplaceId } = await req.json();
    
    if (!marketplaceId) {
      return NextResponse.json({ error: 'Marketplace Recipe ID is required' }, { status: 400 });
    }
    
    // Check if user already saved this recipe
    const { data: existingSavedRecipe } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('marketplace_id', marketplaceId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If already saved, return the existing ID
    if (existingSavedRecipe?.id) {
      return NextResponse.json({ 
        id: existingSavedRecipe.id,
        alreadySaved: true
      });
    }
    
    // Fetch the marketplace recipe
    const { data: marketplaceRecipe, error: fetchError } = await supabase
      .from('marketplace_recipes')
      .select('*')
      .eq('id', marketplaceId)
      .single();
    
    if (fetchError || !marketplaceRecipe) {
      console.error('Error fetching marketplace recipe or recipe not found:', fetchError);
      return NextResponse.json({ error: 'Recipe not found in marketplace' }, { status: 404 });
    }
    
    // Save the marketplace recipe to user's collection
    const { data, error } = await supabase
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
        user_id: user.id,
        marketplace_id: marketplaceId
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving marketplace recipe:', error);
      return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      id: data.id,
      message: 'Recipe saved to your collection'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/recipes/save?marketplaceId=xxx
// Check if a user has saved a specific marketplace recipe
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe ID from query parameters
    const url = new URL(req.url);
    const marketplaceId = url.searchParams.get('marketplaceId');
    
    if (!marketplaceId) {
      return NextResponse.json({ error: 'Marketplace Recipe ID is required' }, { status: 400 });
    }
    
    // Check if user has saved this recipe
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('marketplace_id', marketplaceId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user saved recipe:', error);
      return NextResponse.json({ error: 'Failed to check save status' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      saved: !!data,
      savedRecipeId: data?.id || null
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 