import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/lib/gemini';

// GET /api/recipes
// Get all saved recipes for the authenticated user
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all recipes for this user
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
    
    return NextResponse.json({ recipes: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recipes
// Save a new recipe for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get recipe from request body
    const recipe: Recipe = await req.json();
    
    // Validate recipe data
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      return NextResponse.json(
        { error: 'Recipe must include title, ingredients, and instructions' }, 
        { status: 400 }
      );
    }
    
    // Insert recipe into database
    const { data, error } = await supabase
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
        user_id: user.id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving recipe:', error);
      return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
    }
    
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 