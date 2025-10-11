'use server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST /api/marketplace/save
// Save or unsave a recipe to/from the user's collection
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { recipeId, saveId, recipe, action = 'save' } = await req.json();
    
    // UNSAVE
    if (action === 'unsave' && (saveId || recipeId)) {
      let deleteQuery = supabase.from('saved_recipes').delete().eq('user_id', user.id);
      if (saveId) {
        deleteQuery = deleteQuery.eq('id', saveId);
      } else if (recipeId) {
        deleteQuery = deleteQuery.eq('marketplace_id', recipeId);
      }
      const { error } = await deleteQuery;
      if (error) {
        return NextResponse.json({ error: 'Failed to unsave recipe' }, { status: 500 });
      }
      return NextResponse.json({ saved: false, message: 'Recipe removed from your collection' });
    }

    // SAVE MARKETPLACE RECIPE
    if (action === 'save' && recipeId) {
      // Check if already saved
        const { data: existingSavedRecipe } = await supabase
          .from('saved_recipes')
          .select('id')
          .eq('marketplace_id', recipeId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (existingSavedRecipe?.id) {
        return NextResponse.json({ saved: true, id: existingSavedRecipe.id });
        }
        
      // Fetch the recipe
      const { data: marketplaceRecipe } = await supabase
          .from('marketplace_recipes')
          .select('*')
          .eq('id', recipeId)
          .single();
        
      if (!marketplaceRecipe) {
          return NextResponse.json({ error: 'Recipe not found in marketplace' }, { status: 404 });
        }
        
      // Save
      const { data } = await supabase
          .from('saved_recipes')
          .insert({
          id: uuidv4(),
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
            marketplace_id: recipeId
          })
          .select('id')
          .single();
        
      // Immediately check and return saved status
      if (!data) {
          return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
        }
      return NextResponse.json({ saved: true, id: data.id });
      }

    // SAVE NEW RECIPE
    if (action === 'save' && recipe) {
        if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        return NextResponse.json({ error: 'Recipe must include title, ingredients, and instructions' }, { status: 400 });
        }
        
      const { data } = await supabase
          .from('saved_recipes')
          .insert({
          id: uuidv4(),
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          cooking_time: recipe.cookingTime,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            cuisine: recipe.cuisine,
            tags: recipe.tags,
            user_id: user.id
          })
          .select('id')
          .single();
        
      // Immediately check and return saved status
      if (!data) {
          return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
        }
      return NextResponse.json({ saved: true, id: data.id });
      }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/marketplace/save?recipeId=xxx
// Check if a user has saved a specific marketplace recipe
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const recipeId = url.searchParams.get('recipeId'); // marketplace_id
    const savedRecipeId = url.searchParams.get('savedRecipeId'); // direct saved recipe id

    if (!recipeId && !savedRecipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    let data = null;
    let error = null;

    if (savedRecipeId) {
      ({ data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('id', savedRecipeId)
        .eq('user_id', user.id)
        .maybeSingle());
    } else if (recipeId) {
      ({ data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('marketplace_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle());
    }

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